<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');
define('IN_GW', true);

load()->model('user');
load()->model('message');
load()->classs('oauth2/oauth2client');
load()->model('setting');

// 如果不是表单提交或者ajax请求登录
if (checksubmit() || $_W['isajax']) {
    _login($_GPC['referer']);
}
// 则是第三方方式登录
$support_login_types = OAuth2Client::supportThirdLoginType(); // 支持qq wechat
if (in_array($_GPC['login_type'], $support_login_types)) {
    _login($_GPC['referer']);
}

$setting = $_W['setting'];
$_GPC['login_type'] = !empty($_GPC['login_type']) ? $_GPC['login_type'] : (!empty($_W['setting']['copyright']['login_type']) ? 'mobile' : 'system');
$login_urls = user_support_urls();
template('user/login');

function _login($forward = '')
{
    global $_GPC, $_W;
    if (empty($_GPC['login_type'])) { // 如果没有指定，则默认是系统登录
        $_GPC['login_type'] = 'system';
    }

    if (empty($_GPC['handle_type'])) { // 处理类型，包括登录和绑定
        $_GPC['handle_type'] = 'login';
    }


    if ($_GPC['handle_type'] == 'login') {
        // 根据登录类型和配置来创建登录对象并收集用户信息
        $member = OAuth2Client::create($_GPC['login_type'], $_W['setting']['thirdlogin'][$_GPC['login_type']]['appid'], $_W['setting']['thirdlogin'][$_GPC['login_type']]['appsecret'])->login();
    } else {
        $member = OAuth2Client::create($_GPC['login_type'], $_W['setting']['thirdlogin'][$_GPC['login_type']]['appid'], $_W['setting']['thirdlogin'][$_GPC['login_type']]['appsecret'])->bind();
    }
    // 如果用户已经登录且是绑定请求
    if (!empty($_W['user']) && $_GPC['handle_type'] == 'bind') {
        if (is_error($member)) {
            itoast($member['message'], url('user/profile/bind'), '');
        } else {
            itoast('绑定成功', url('user/profile/bind'), '');
        }
    }

    if (is_error($member)) {
        itoast($member['message'], url('user/login'), '');
    }
    $record = user_single($member); // 根据收集登录用户信息获取数据库用户信息
    if (!empty($record)) {
        // 如果用户需要审核或者被禁用
        if ($record['status'] == USER_STATUS_CHECK || $record['status'] == USER_STATUS_BAN) {
            itoast('您的账号正在审核或是已经被系统禁止，请联系网站管理员解决?', url('user/login'), '');
        }
        $_W['uid'] = $record['uid'];
        $_W['isfounder'] = user_is_founder($record['uid']); // 是否是主副创始人
        $_W['user'] = $record;

        // 非主创始人都需要检查账户有效期
        if (empty($_W['isfounder']) || user_is_vice_founder()) {
            if (!empty($record['endtime']) && $record['endtime'] < TIMESTAMP) {
                itoast('您的账号有效期限已过,请联系网站管理员解决!', '', '');
            }
        }

        // 在站点关闭情况下，只有主副创始人才可以继续浏览
        if (!empty($_W['siteclose']) && empty($_W['isfounder'])) {
            itoast('站点已关闭，关闭原因:' . $_W['setting']['copyright']['reason'], '', '');
        }
        $cookie = array();
        $cookie['uid'] = $record['uid'];
        $cookie['lastvisit'] = $record['lastvisit'];
        $cookie['lastip'] = $record['lastip'];
        $cookie['hash'] = md5($record['password'] . $record['salt']);
        $session = authcode(json_encode($cookie), 'encode'); // 加密
        // 把用户登录上次登录信息保存到cookie中，如果设置记住我，则保存一周
        isetcookie('__session', $session, !empty($_GPC['rember']) ? 7 * 86400 : 0, true);
        $status = array();
        $status['uid'] = $record['uid'];
        $status['lastvisit'] = TIMESTAMP;
        $status['lastip'] = CLIENT_IP;
        user_update($status); // 更新这次登录信息到users表

        if (empty($forward)) { // 如果没有指定跳转链接，则根据情况获取跳转链接
            $forward = user_login_forward($_GPC['forward']); // 返回跳转链接
        }

        if ($record['uid'] != $_GPC['__uid']) { // 如果登录用户和cookie中的用户id不同，则清空
            isetcookie('__uniacid', '', -7 * 86400); // 统一帐号
            isetcookie('__uid', '', -7 * 86400); // 用户id
        }
        // 清除用户登录失败记录
        $failed = pdo_get('users_failed_login', array('username' => trim($_GPC['username']), 'ip' => CLIENT_IP));
        pdo_delete('users_failed_login', array('id' => $failed['id']));
        itoast("欢迎回来，{$record['username']}", $forward, 'success'); // 跳转
    } else { // 如果用户或密码错误，则修改登录失败记录
        if (empty($failed)) {
            pdo_insert('users_failed_login', array('ip' => CLIENT_IP, 'username' => trim($_GPC['username']), 'count' => '1', 'lastupdate' => TIMESTAMP));
        } else {
            pdo_update('users_failed_login', array('count' => $failed['count'] + 1, 'lastupdate' => TIMESTAMP), array('id' => $failed['id']));
        }
        itoast('登录失败，请检查您输入的账号和密码', '', '');
    }
}