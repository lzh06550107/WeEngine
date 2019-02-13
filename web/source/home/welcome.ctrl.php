<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 *
 * 主创始人后台管理中心
 */
defined('IN_IA') or exit('Access Denied');

load()->model('welcome');
load()->model('cloud');
load()->func('communication');
load()->func('db');
load()->model('extension');
load()->model('module');
load()->model('system');
load()->model('user');
load()->model('wxapp');
load()->model('account');
load()->model('message');
load()->model('visit');

$dos = array('platform', 'system', 'ext', 'get_fans_kpi', 'get_last_modules', 'get_system_upgrade', 'get_upgrade_modules', 'get_module_statistics', 'get_ads', 'get_not_installed_modules', 'system_home', 'set_top', 'add_welcome');
$do = in_array($do, $dos) ? $do : 'platform';

// 获取未安装的模块
if ($do == 'get_not_installed_modules') {
    $data = array();
    $not_installed_modules = module_get_all_unistalled('uninstalled', false); // 不从缓存，直接从云端获取
    $not_installed_modules = $not_installed_modules['modules']['uninstalled'];
    $data['app_count'] = count($not_installed_modules['app']); // 支持公众号模块
    $data['wxapp_count'] = count($not_installed_modules['wxapp_count']);
    $not_installed_modules['app'] = is_array($not_installed_modules['app']) ? array_slice($not_installed_modules['app'], 0, 4) : array();
    $not_installed_modules['wxapp'] = is_array($not_installed_modules['wxapp']) ? array_slice($not_installed_modules['wxapp'], 0, 4) : array();
    $not_installed_modules['phoneapp'] = is_array($not_installed_modules['phoneapp']) ? array_slice($not_installed_modules['phoneapp'], 0, 4) : array();
    $not_installed_modules['webapp'] = is_array($not_installed_modules['webapp']) ? array_slice($not_installed_modules['webapp'], 0, 4) : array();
    $data['module'] = array_merge($not_installed_modules['app'], $not_installed_modules['wxapp'], $not_installed_modules['phoneapp'], $not_installed_modules['webapp']);
    if (is_array($data['module']) && !empty($data['module'])) {
        foreach ($data['module'] as &$module) { // TODO  by lzh 增加其它类型的未安装模块
            if ($module['app_support'] == 2) { // 支持公众号
                $module['link'] = url('module/manage-system/not_installed', array('account_type' => ACCOUNT_TYPE_OFFCIAL_NORMAL));
            } else if($module['wxapp_support'] == 2) { // 支持小程序
                $module['link'] = url('module/manage-system/not_installed', array('account_type' => ACCOUNT_TYPE_APP_NORMAL));
            } else if($module['phoneapp_support'] == 2) {
                $module['link'] = url('module/manage-system/not_installed', array('account_type' => ACCOUNT_TYPE_PHONEAPP_NORMAL));
            } else if($module['webapp_support'] == 2) {
                $module['link'] = url('module/manage-system/not_installed', array('account_type' => ACCOUNT_TYPE_WEBAPP_NORMAL));
            }
            $module['thumb'] = $_W['siteroot'] . 'addons/' . $module['thumb'];
        }
    }
    iajax(0, $data);
}

// 进入模块前检查是否可以进入
if ($do == 'ext' && $_GPC['m'] != 'store' && !$_GPC['system_welcome']) {
    if (!empty($_GPC['version_id'])) {
        $version_info = wxapp_version($_GPC['version_id']);
    }
    $account_api = WeAccount::create();
    if (is_error($account_api)) {
        message($account_api['message'], url('account/display'));
    }
    $check_manange = $account_api->checkIntoManage(); // 检查是否进入管理界面
    if (is_error($check_manange)) {
        $account_display_url = $account_api->accountDisplayUrl(); // 不能，则进入公众号显示列表界面
        itoast('', $account_display_url);
    }
}

// 进入最近操作公众号首页
if ($do == 'platform') {
    $last_uniacid = uni_account_last_switch();
    if (empty($last_uniacid)) {
        itoast('', url('account/display'), 'info');
    }
    if (!empty($last_uniacid) && $last_uniacid != $_W['uniacid']) {
        uni_account_switch($last_uniacid, url('home/welcome'));
    }
    define('FRAME', 'account');
    if (empty($_W['account']['endtime']) && !empty($_W['account']['endtime']) && $_W['account']['endtime'] < time()) {
        itoast('公众号已到服务期限，请联系管理员并续费', url('account/manage'), 'info');
    }
    $notices = welcome_notices_get();

    template('home/welcome');

    // 系统管理
} elseif ($do == 'system') {
    define('FRAME', 'system');
    $_W['page']['title'] = '欢迎页 - 系统管理';
    if (!$_W['isfounder'] || user_is_vice_founder()) { // 用户不是主创始人，则跳转到帐号管理页面，因为只有主创始人才可以安装模块
        header('Location: ' . url('account/manage', array('account_type' => 1)), true);
        exit;
    }
    $reductions = system_database_backup(); // 获取数据库备份文件数组
    if (!empty($reductions)) {
        $last_backup = array_shift($reductions);
        $last_backup_time = $last_backup['time'];
        $backup_days = welcome_database_backup_days($last_backup_time); // 获取最后一次备份距离现在的天数
    } else { // 如果没有备份过
        $backup_days = 0;
    }
    template('home/welcome-system');

    // 安装和未安装模块统计
} elseif ($do == 'get_module_statistics') {
    $uninstall_modules = module_get_all_unistalled('uninstalled');
    $account_uninstall_modules_nums = $uninstall_modules['app_count'];
    $wxapp_uninstall_modules_nums = $uninstall_modules['wxapp_count'];
    $webapp_uninstall_modules_nums = $uninstall_modules['webapp_count'];
    $phoneapp_uninstall_modules_nums = $uninstall_modules['phoneapp_count'];

    $account_modules = user_module_by_account_type('account');
    $wxapp_modules = user_module_by_account_type('wxapp');
    $webapp_modules = user_module_by_account_type('webapp');
    $phoneapp_modules = user_module_by_account_type('phoneapp');

    $account_modules_total = count($account_modules) + $account_uninstall_modules_nums;
    $wxapp_modules_total = count($wxapp_modules) + $wxapp_uninstall_modules_nums;
    $webapp_modules_total = count($webapp_modules) + $webapp_uninstall_modules_nums;
    $phoneapp_modules_total = count($phoneapp_modules) + $phoneapp_uninstall_modules_nums;

    $module_statistics = array(
        'account_uninstall_modules_nums' => $account_uninstall_modules_nums,
        'wxapp_uninstall_modules_nums' => $wxapp_uninstall_modules_nums,
        'webapp_uninstall_modules_nums' => $webapp_uninstall_modules_nums,
        'phoneapp_uninstall_modules_nums' => $phoneapp_uninstall_modules_nums,
        'account_modules_total' => $account_modules_total,
        'wxapp_modules_total' => $wxapp_modules_total,
        'webapp_modules_total' => $webapp_modules_total,
        'phoneapp_modules_total' => $phoneapp_modules_total,
    );
    iajax(0, $module_statistics, '');

    // 进入模块后台
} elseif ($do == 'ext') {
    $modulename = $_GPC['m'];
    if (!empty($modulename)) {
        // TODO 没有判断是否有权限获取该模块
        $_W['current_module'] = module_fetch($modulename);
    }
    define('FRAME', 'account');
    define('IN_MODULE', $modulename);
    if ($_GPC['system_welcome'] && $_W['isfounder']) {
        $frames = buildframes('system_welcome'); // 构建后台系统首页管理后台菜单
    } else {
        $site = WeUtility::createModule($modulename);
        if (!is_error($site)) { // 进入模块后自定义显示页面
            $method = 'welcomeDisplay';
            if (method_exists($site, $method)) {
                define('FRAME', 'module_welcome');
                $entries = module_entries($modulename, array('menu', 'home', 'profile', 'shortcut', 'cover', 'mine'));
                $site->$method($entries); // 传入模块所有菜单项
                exit;
            }
        }
        $frames = buildframes('account'); // 如果不存在自定义显示页面，则构建模块菜单
    }
    $uni_account_module = table('module')->uniAccountModuleInfo($modulename);
    foreach ($frames['section'] as $secion) {
        foreach ($secion['menu'] as $menu) {
            if (!empty($menu['url'])) {
                if (!empty($uni_account_module['settings']['default_entry']) && !strpos($menu['url'], '&eid=' . $uni_account_module['settings']['default_entry'])) {
                    continue;
                }
                // 如果模块没有设置默认入口，则重定向到找到的一个
                header('Location: ' . $_W['siteroot'] . 'web/' . $menu['url']);
                exit;
            }
        }
    }
    template('home/welcome-ext'); // 没有内容

    // 获取粉丝的统计信息
} elseif ($do == 'get_fans_kpi') {
    uni_update_week_stat(); // 更新粉丝统计
    $yesterday = date('Ymd', strtotime('-1 days'));
    $yesterday_stat = pdo_get('stat_fans', array('date' => $yesterday, 'uniacid' => $_W['uniacid']));
    $yesterday_stat['new'] = intval($yesterday_stat['new']); // 新关注用户
    $yesterday_stat['cancel'] = intval($yesterday_stat['cancel']); // 取消关注用户
    $yesterday_stat['jing_num'] = intval($yesterday_stat['new']) - intval($yesterday_stat['cancel']); // 净增用户
    $yesterday_stat['cumulate'] = intval($yesterday_stat['cumulate']); // 总用户
    $today_stat = pdo_get('stat_fans', array('date' => date('Ymd'), 'uniacid' => $_W['uniacid']));
    $today_stat['new'] = intval($today_stat['new']);
    $today_stat['cancel'] = intval($today_stat['cancel']);
    $today_stat['jing_num'] = $today_stat['new'] - $today_stat['cancel'];
    $today_stat['cumulate'] = intval($today_stat['jing_num']) + $yesterday_stat['cumulate'];
    if ($today_stat['cumulate'] < 0) {
        $today_stat['cumulate'] = 0;
    }
    iajax(0, array('yesterday' => $yesterday_stat, 'today' => $today_stat), '');

    // 获取最新的模块信息
} elseif ($do == 'get_last_modules') {
    $last_modules = welcome_get_last_modules(); // 从微擎商城获取最新模块应用
    if (is_error($last_modules)) {
        iajax(1, $last_modules['message'], '');
    } else {
        iajax(0, $last_modules, '');
    }

    // 系统需要更新信息
} elseif ($do == 'get_system_upgrade') {
    $upgrade = welcome_get_cloud_upgrade();
    iajax(0, $upgrade, '');

// 获取需要更新的模块列表
} elseif ($do == 'get_upgrade_modules') { // TODO 还有其它类型的更新模块
    $account_upgrade_modules = module_upgrade_new('account');
    $account_upgrade_module_nums = count($account_upgrade_modules);
    $wxapp_upgrade_modules = module_upgrade_new('wxapp');
    $wxapp_upgrade_module_nums = count($wxapp_upgrade_modules);
    $webapp_upgrade_modules = module_upgrade_new('webapp');
    $webapp_upgrade_module_nums = count($webapp_upgrade_modules);
    $phoneapp_upgrade_modules = module_upgrade_new('phoneapp');
    $phoneapp_upgrade_module_nums = count($phoneapp_upgrade_modules);

    // 截取4个用来显示
    $account_upgrade_module_list = array_slice($account_upgrade_modules, 0, 4);
    $wxapp_upgrade_module_list = array_slice($wxapp_upgrade_modules, 0, 4);
    $webapp_upgrade_module_list = array_slice($webapp_upgrade_modules, 0, 4);
    $phoneapp_upgrade_module_list = array_slice($phoneapp_upgrade_modules, 0, 4);
    $upgrade_module_list = array_merge($account_upgrade_module_list, $wxapp_upgrade_module_list, $webapp_upgrade_module_list, $phoneapp_upgrade_module_list);

    $upgrade_module = array(
        'upgrade_module_list' => $upgrade_module_list,
        'upgrade_module_nums' => array(
            'account_upgrade_module_nums' => $account_upgrade_module_nums,
            'wxapp_upgrade_module_nums' => $wxapp_upgrade_module_nums,
            'webapp_upgrade_module_nums' => $webapp_upgrade_module_nums,
            'phoneapp_upgrade_module_nums' => $phoneapp_upgrade_module_nums
        )
    );
    iajax(0, $upgrade_module, '');

} elseif ($do == 'get_ads') {
    $ads = welcome_get_ads(); // 从云商城获取广告
    if (is_error($ads)) {
        iajax(1, $ads['message']);
    } else {
        iajax(0, $ads);
    }
}

if ($do == 'system_home') {
    $user_info = user_single($_W['uid']);
    $account_num = permission_user_account_num();

    $last_accounts_modules = pdo_getall('system_stat_visit', array('uid' => $_W['uid']), array(), '', array('displayorder desc', 'updatetime desc'), 20);

    if (!empty($last_accounts_modules)) {
        foreach ($last_accounts_modules as &$info) {
            if (!empty($info['uniacid'])) {
                $info['account'] = uni_fetch($info['uniacid']);
            }
            if (!empty($info['modulename'])) {
                $info['account'] = module_fetch($info['modulename']);
                $info['account']['switchurl'] = url('module/display/switch', array('module_name' => $info['modulename']));
                unset($info['account']['type']);
            }
        }
    }

    $types = array(MESSAGE_ACCOUNT_EXPIRE_TYPE, MESSAGE_WECHAT_EXPIRE_TYPE, MESSAGE_WEBAPP_EXPIRE_TYPE, MESSAGE_USER_EXPIRE_TYPE, MESSAGE_WXAPP_MODULE_UPGRADE);
    $messages = pdo_getall('message_notice_log', array('uid' => $_W['uid'], 'type' => $types, 'is_read' => MESSAGE_NOREAD), array(), '', array('id desc'), 10);
    $messages = message_list_detail($messages);
    template('home/welcome-system-home');
}


if ($do == 'set_top') {
    $id = intval($_GPC['id']);
    $system_visit_info = pdo_get('system_stat_visit', array('id' => $id));
    visit_system_update($system_visit_info, true);
    iajax(0, '设置成功', referer());
}

// 添加模块到首页常用功能
if ($do == 'add_welcome') {
    visit_system_update(array('uid' => $_W['uid'], 'uniacid' => intval($_GPC['uniacid']), 'modulename' => safe_gpc_string($_GPC['module'])), true);
    itoast(0, referer());
}
