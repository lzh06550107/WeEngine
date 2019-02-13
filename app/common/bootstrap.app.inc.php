<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');
load()->model('mc');
load()->model('app');
load()->model('account');
load()->model('attachment');
load()->model('module');

$_W['uniacid'] = intval($_GPC['i']);
if (empty($_W['uniacid'])) {
    $_W['uniacid'] = intval($_GPC['weid']);
}
$_W['uniaccount'] = $_W['account'] = uni_fetch($_W['uniacid']);
if (empty($_W['uniaccount'])) {
    header('HTTP/1.1 404 Not Found');
    header("status: 404 Not Found");
    exit;
}
if (!empty($_W['uniaccount']['endtime']) && TIMESTAMP > $_W['uniaccount']['endtime']) {
    exit('抱歉，您的公众号服务已过期，请及时联系管理员');
}
if (app_pass_visit_limit()) {
    exit('访问受限，请及时联系管理员！');
}
$_W['acid'] = $_W['uniaccount']['acid'];
$isdel_account = pdo_get('account', array('isdeleted' => 1, 'acid' => $_W['acid']));
if (!empty($isdel_account)) {
    exit('指定公众号已被删除');
}

// 如果统一帐号绑定了域名，则使用绑定的域名重新访问
if (!empty($_W['account']['setting']['bind_domain']) && !empty($_W['account']['setting']['bind_domain']['domain']) && strpos($_W['siteroot'], $_W['account']['setting']['bind_domain']['domain']) === false) {
    header('Location:' . $_W['account']['setting']['bind_domain']['domain'] . $_SERVER['REQUEST_URI']);
    exit;
}

// 根据请求参数获取会话id，这一般是微信跳转带的state参数
$_W['session_id'] = '';
if (isset($_GPC['state']) && !empty($_GPC['state']) && strexists($_GPC['state'], 'we7sid-')) {
    $pieces = explode('-', $_GPC['state']);
    $_W['session_id'] = $pieces[1];
    unset($pieces);
}
if (empty($_W['session_id'])) {
    $_W['session_id'] = $_COOKIE[session_name()]; // 根据默认保存会话id的cookie来获取会话id
}
// 如果会话id还是空，则创建一个会话id，并保存到cookie中
if (empty($_W['session_id'])) {
    $_W['session_id'] = "{$_W['uniacid']}-" . random(20);
    $_W['session_id'] = md5($_W['session_id']);
    setcookie(session_name(), $_W['session_id']);
}

// Session 的工作机制是：为每个访问者创建一个唯一的 id (SID)，并基于这个 SID 来存储变量。SID 存储在 cookie 中，亦或通过 URL 进行传导。
session_id($_W['session_id']); // 设置 当前会话 ID

load()->classs('wesession');
WeSession::start($_W['uniacid'], CLIENT_IP); // 初始化会话处理器并初始化会话对象$_SESSION

if (!empty($_GPC['j'])) { // 如果存在子账号参数，则获取具体账号信息
    $acid = intval($_GPC['j']);
    $_W['account'] = account_fetch($acid);
    if (is_error($_W['account'])) {
        $_W['account'] = account_fetch($_W['acid']);
    } else {
        $_W['acid'] = $acid;
    }
    $_SESSION['__acid'] = $_W['acid'];
    $_SESSION['__uniacid'] = $_W['uniacid'];
}
if (!empty($_SESSION['__acid']) && $_SESSION['__uniacid'] == $_W['uniacid']) {
    $_W['acid'] = intval($_SESSION['__acid']);
    $_W['account'] = account_fetch($_W['acid']);
}

// 如果会话子账号或者统一帐号与参数中指定不同，则清空会话信息
if ((!empty($_SESSION['acid']) && $_W['acid'] != $_SESSION['acid']) ||
    (!empty($_SESSION['uniacid']) && $_W['uniacid'] != $_SESSION['uniacid'])) {
    $keys = array_keys($_SESSION);
    foreach ($keys as $key) {
        unset($_SESSION[$key]);
    }
    unset($keys, $key);
}
// 然后重新设置会话acid和uniacid
$_SESSION['acid'] = $_W['acid'];
$_SESSION['uniacid'] = $_W['uniacid'];

// 从session中获取粉丝信息
if (!empty($_SESSION['openid'])) {
    $_W['openid'] = $_SESSION['openid'];
    $_W['fans'] = mc_fansinfo($_W['openid']);
    $_W['fans']['from_user'] = $_W['fans']['openid'] = $_W['openid'];
}

// 如果用户已经登录
if (!empty($_SESSION['uid']) || (!empty($_W['fans']) && !empty($_W['fans']['uid']))) {
    $uid = intval($_SESSION['uid']);
    if (empty($uid)) {
        $uid = $_W['fans']['uid'];
    }
    _mc_login(array('uid' => $uid)); // 更新已经登录用户信息
    unset($uid);
}

// 如果没有获取到粉丝信息，则查看借用授权粉丝信息
if (empty($_W['openid']) && !empty($_SESSION['oauth_openid'])) {
    $_W['openid'] = $_SESSION['oauth_openid'];
    $_W['fans'] = array(
        'openid' => $_SESSION['oauth_openid'],
        'from_user' => $_SESSION['oauth_openid'],
        'follow' => 0
    );
}
$unisetting = uni_setting_load(); // 加载统一帐号设置
if (empty($unisetting['oauth'])) {
    $unisetting['oauth'] = uni_account_global_oauth(); // 如果统一帐号没有设置，则加载全局借用授权设置
}
// 初始化借用授权统一帐号
if (!empty($unisetting['oauth']['account'])) {
    $oauth = account_fetch($unisetting['oauth']['account']);
    if (!empty($oauth) && $_W['account']['level'] <= $oauth['level']) {
        $_W['oauth_account'] = $_W['account']['oauth'] = array(
            'key' => $oauth['key'],
            'secret' => $oauth['secret'],
            'acid' => $oauth['acid'],
            'type' => $oauth['type'],
            'level' => $oauth['level'],
        );
        unset($oauth);
    } else {
        $_W['oauth_account'] = $_W['account']['oauth'] = array(
            'key' => $_W['account']['key'],
            'secret' => $_W['account']['secret'],
            'acid' => $_W['account']['acid'],
            'type' => $_W['account']['type'],
            'level' => $_W['account']['level'],
        );
    }
} else {
    $_W['oauth_account'] = $_W['account']['oauth'] = array(
        'key' => $_W['account']['key'],
        'secret' => $_W['account']['secret'],
        'acid' => $_W['account']['acid'],
        'type' => $_W['account']['type'],
        'level' => $_W['account']['level'],
    );
}

if ($controller != 'utility') {
    $_W['token'] = token(); // 非utility控制器动作都需要token支持
}

// 微信授权获取粉丝openid，通过openid来获取uid，从而实现登录
if (!empty($_W['account']['oauth']) && $_W['account']['oauth']['level'] == '4' && empty($_W['isajax'])) {
    if (($_W['container'] == 'wechat' && !$_GPC['logout'] && empty($_W['openid']) && ($controller != 'auth' || ($controller == 'auth' && !in_array($action, array('forward', 'oauth'))))) ||
        ($_W['container'] == 'wechat' && !$_GPC['logout'] && empty($_SESSION['oauth_openid']) && ($controller != 'auth'))) {
        $state = 'we7sid-' . $_W['session_id'];
        if (empty($_SESSION['dest_url'])) {
            $_SESSION['dest_url'] = urlencode($_W['siteurl']); // 记录要访问的地址
        }
        $str = '';
        if (uni_is_multi_acid()) {
            $str = "&j={$_W['acid']}";
        }
        $oauth_type = 'snsapi_base'; // 模块获取用户授权方式之静默授权 2.用户有感知授权
        if ($controller == 'entry' && !empty($_GPC['m'])) {
            $module_info = module_fetch($_GPC['m']);
            if ($module_info['oauth_type'] == OAUTH_TYPE_USERINFO) {
                $oauth_type = 'snsapi_userinfo'; // 模块获取用户授权方式之用户有感知授权
            }
        }
        $global_unisetting = uni_account_global_oauth();
        // 获取授权主机域名
        $unisetting['oauth']['host'] = !empty($unisetting['oauth']['host']) ? $unisetting['oauth']['host'] : (!empty($global_unisetting['oauth']['host']) ? $global_unisetting['oauth']['host'] : '');
        $url = (!empty($unisetting['oauth']['host']) ? ($unisetting['oauth']['host'] . $sitepath . '/') : $_W['siteroot'] . 'app/') . "index.php?i={$_W['uniacid']}{$str}&c=auth&a=oauth&scope=" . $oauth_type;
        $callback = urlencode($url);
        $oauth_account = WeAccount::create($_W['account']['oauth']);
        if ($oauth_type == 'snsapi_base') {
            $forward = $oauth_account->getOauthCodeUrl($callback, $state);
        } else {
            $forward = $oauth_account->getOauthUserInfoUrl($callback, $state);
        }
        header('Location: ' . $forward);
        exit();
    }
}

// 如果是微信浏览器则用户已经登录或者不是微信浏览器则用户没有登录
$_W['account']['groupid'] = $_W['uniaccount']['groupid'];
$_W['account']['qrcode'] = tomedia('qrcode_' . $_W['acid'] . '.jpg') . '?time=' . $_W['timestamp'];
$_W['account']['avatar'] = tomedia('headimg_' . $_W['acid'] . '.jpg') . '?time=' . $_W['timestamp'];
if ($_W['container'] == 'wechat') { // 微信浏览器还需要生成jssdk配置
    if (!empty($unisetting['jsauth_acid'])) {
        $jsauth_acid = $unisetting['jsauth_acid'];
    } else {
        if ($_W['account']['level'] < 3 && !empty($unisetting['oauth']['account'])) {
            $jsauth_acid = $unisetting['oauth']['account'];
        } else {
            $jsauth_acid = $_W['acid'];
        }
    }
    if (!empty($jsauth_acid)) {
        $account_api = WeAccount::create($jsauth_acid);
        if (!empty($account_api)) {
            $_W['account']['jssdkconfig'] = $account_api->getJssdkConfig(); // 生成jssdk配置
            $_W['account']['jsauth_acid'] = $jsauth_acid;
        }
    }
    unset($jsauth_acid, $account_api);
}
$_W['attachurl'] = attachment_set_attach_url(); // 根据配置，获取附件url地址
load()->func('compat.biz');