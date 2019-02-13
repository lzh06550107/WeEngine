<?php
/**
 * [WeEngine System] Copyright (c) 20180322102317 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
define('IN_SYS', true);
require '../framework/bootstrap.inc.php';
require IA_ROOT . '/web/common/bootstrap.sys.inc.php';

// 如果是微信或者qq登录，则解析$_GPC['state']
if (!empty($_GPC['state'])) {
    $login_callback_params = OAuth2Client::supportParams($_GPC['state']);
    if (!empty($login_callback_params)) { // 如果是第三方状态参数，则进入第三方登录模式
        $controller = 'user';
        $action = 'login';
        $_GPC['login_type'] = $login_callback_params['from']; // 微信还是qq
        $_GPC['handle_type'] = $login_callback_params['mode']; // 绑定还是登录
    }
}

if (empty($_W['isfounder']) && !empty($_W['user']) && ($_W['user']['status'] == USER_STATUS_CHECK || $_W['user']['status'] == USER_STATUS_BAN)) {
    message('您的账号正在审核或是已经被系统禁止，请联系网站管理员解决！');
}
$acl = require IA_ROOT . '/web/common/permission.inc.php'; // 加载系统预置的角色权限，控制器级别控制

$_W['page'] = array();
$_W['page']['copyright'] = $_W['setting']['copyright']; // 获取站点设置信息

if (($_W['setting']['copyright']['status'] == 1) && empty($_W['isfounder']) && $controller != 'cloud' && $controller != 'utility' && $controller != 'account') {
    $_W['siteclose'] = true;
    if ($controller == 'account' && $action == 'welcome') {
        template('account/welcome');
        exit();
    }
    if ($controller == 'user' && $action == 'login') {
        if (checksubmit()) {
            require _forward($controller, $action);
        }
        template('user/login');
        exit();
    }
    isetcookie('__session', '', -10000);

    message('站点已关闭，关闭原因：' . $_W['setting']['copyright']['reason'], url('user/login'), 'info');


}

$controllers = array();
$handle = opendir(IA_ROOT . '/web/source/');
if (!empty($handle)) {
    while ($dir = readdir($handle)) {
        if ($dir != '.' && $dir != '..') {
            $controllers[] = $dir;
        }
    }
}
if (!in_array($controller, $controllers)) {
    $controller = 'home';
}

$init = IA_ROOT . "/web/source/{$controller}/__init.php";
if (is_file($init)) {
    require $init;
}

$actions = array();
$actions_path = file_tree(IA_ROOT . '/web/source/' . $controller);
foreach ($actions_path as $action_path) {
    $action_name = str_replace('.ctrl.php', '', basename($action_path));

    $section = basename(dirname($action_path));
    if ($section !== $controller) {
        $action_name = $section . '-' . $action_name;
    }
    $actions[] = $action_name;
}

if (empty($actions)) {
    header('location: ?refresh');
}

if (!in_array($action, $actions)) {
    $action = $action . '-' . $action;
}
if (!in_array($action, $actions)) { // 如果动作不存在，则使用默认动作，否则使用该控制器第一个动作
    $action = $acl[$controller]['default'] ? $acl[$controller]['default'] : $actions[0];
}
// 如果动作可以直接访问，则不用身份认证即可访问
if (is_array($acl[$controller]['direct']) && in_array($action, $acl[$controller]['direct'])) {
    require _forward($controller, $action);
    exit();
}
checklogin();// 检查用户是否登录

// 如果用户不是主创始人，则需要验证权限
if ($_W['role'] != ACCOUNT_MANAGE_NAME_FOUNDER) {
    // 非创始人且没有绑定的用户，进入绑定流程
    if ($_W['role'] == ACCOUNT_MANAGE_NAME_UNBIND_USER) {
        itoast('', url('user/third-bind'));
    }
    if (empty($_W['uniacid'])) {
        // 如果没有指定统一帐号，且顶级菜单定义为公众号account，则进入公众号显示页面
        if (defined('FRAME') && FRAME == 'account') {
            itoast('', url('account/display'), 'info');
        }
        // 如果没有指定统一帐号，且顶级菜单定义为小程序wxapp，则进入小程序显示页面
        if (defined('FRAME') && FRAME == 'wxapp') {
            itoast('', url('wxapp/display'), 'info');
        }
    }

    // 在预置的角色权限中增加用户权限表中另外增加的权限
    $acl = permission_build();
    // 该控制器当前角色下没有允许执行的动作或者不包含$controller*且不包含该动作，这些都表明没有执行权限
    if (empty($acl[$controller][$_W['role']]) || (!in_array($controller . '*', $acl[$controller][$_W['role']]) && !in_array($action, $acl[$controller][$_W['role']]))) {
        message('不能访问, 需要相应的权限才能访问！');
    }
}
// 加载动作文件并执行对应的代码
require _forward($controller, $action);

define('ENDTIME', microtime());

// 对于超过指定脚本执行时间的请求，需要记录到系统性能表中
if (empty($_W['config']['setting']['maxtimeurl'])) {
    $_W['config']['setting']['maxtimeurl'] = 10;
}
if ((ENDTIME - STARTTIME) > $_W['config']['setting']['maxtimeurl']) {
    $data = array(
        'type' => '1',
        'runtime' => ENDTIME - STARTTIME,
        'runurl' => $_W['sitescheme'] . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'],
        'createtime' => TIMESTAMP
    );
    pdo_insert('core_performance', $data);
}
function _forward($c, $a)
{
    $file = IA_ROOT . '/web/source/' . $c . '/' . $a . '.ctrl.php';
    if (!file_exists($file)) {
        list($section, $a) = explode('-', $a);
        $file = IA_ROOT . '/web/source/' . $c . '/' . $section . '/' . $a . '.ctrl.php';
    }
    return $file;
}

// 计算选中高亮的菜单项
function _calc_current_frames(&$frames)
{
    global $controller, $action;
    if (!empty($frames['section']) && is_array($frames['section'])) {
        foreach ($frames['section'] as &$frame) {
            if (empty($frame['menu'])) {
                continue;
            }
            foreach ($frame['menu'] as $key => &$menu) {
                $query = parse_url($menu['url'], PHP_URL_QUERY); // 获取查询部分
                parse_str($query, $urls); // 把查询部分解析到数组中
                if (empty($urls)) {
                    continue;
                }
                if (defined('ACTIVE_FRAME_URL')) {
                    $query = parse_url(ACTIVE_FRAME_URL, PHP_URL_QUERY);
                    parse_str($query, $get);
                } else {
                    $get = $_GET;
                    $get['c'] = $controller;
                    $get['a'] = $action;
                }
                if (!empty($do)) {
                    $get['do'] = $do;
                }
                $diff = array_diff_assoc($urls, $get); // 通过比较请求参数来判断选中的菜单项
                if (empty($diff) || $get['c'] == 'profile' && $get['a'] == 'reply-setting' && $key == 'platform_reply') {
                    $menu['active'] = ' active';
                }
            }
        }
    }
}