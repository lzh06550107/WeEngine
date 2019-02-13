<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

load()->model('cache');
load()->model('setting');
load()->object('cloudapi');

$_W['page']['title'] = '更新缓存 - 设置 - 系统管理';

if (checksubmit('submit', true)) {
	/*$cloud_api = new CloudApi();
	$cloud_cache_key = array(
		'key' => array(cache_system_key('module:all_uninstall'), cache_system_key('user_modules:' . $_W['uid']))
	);
	$cloud_api->post('cache', 'delete', $cloud_cache_key); // 删除云缓存中未安装和指定用户模块的缓存
	$account_ticket_cache = cache_read('account:ticket');
	pdo_delete('core_cache'); // 删除缓存表中所有数据，但不删除帐号ticket
	cache_clean();
	cache_write('account:ticket', $account_ticket_cache);
	unset($account_ticket_cache);*/

	if(!empty($_GPC['templateCache'])) {
        cache_build_template();  // 删除缓存模板
    }
    if(!empty($_GPC['dataCache'])) {
        cache_build_users_struct(); // 更新会员个人信息字段
        cache_build_module_status(); // 重建系统可使用的模块缓存
        // cache_build_cloud_upgrade_module();
        cache_build_setting();
        cache_build_frame_menu();
        cache_build_module_subscribe_type();
    }
	//cache_build_cloud_ad();
	iajax(0, '更新缓存成功！', '');
}

template('system/updatecache');