<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

/**
 * 从微擎商城获取最新模块应用
 * @return 	array
 */
function welcome_get_last_modules() {
	load()->classs('cloudapi');

	$api = new CloudApi();
	$last_modules = $api->get('store', 'app_fresh');
	return $last_modules;
}

/**
 * 从云商城获取广告
 * @return array()
 */
function welcome_get_ads() {
	load()->classs('cloudapi');
	$result = array();
	$api = new CloudApi();
	$result = $api->get('store', 'we7_index_a');
	return $result;
}

/**
 * 获取当前用户能够查看的公告
 * @return array
 */
function welcome_notices_get() {
	global $_W;
	$order = !empty($_W['setting']['notice_display']) ? $_W['setting']['notice_display'] : 'displayorder';
	$notices = pdo_getall('article_notice', array('is_display' => 1), array('id', 'title', 'createtime', 'style', 'group'), '', $order . ' DESC', array(1,15));
	if(!empty($notices)) {
		foreach ($notices as $key => $notice_val) {
			$notices[$key]['url'] = url('article/notice-show/detail', array('id' => $notice_val['id']));
			$notices[$key]['createtime'] = date('Y-m-d', $notice_val['createtime']);
			$notices[$key]['style'] = iunserializer($notice_val['style']);
			$notices[$key]['group'] = empty($notice_val['group']) ? array('vice_founder' => array(), 'normal' => array()) : iunserializer($notice_val['group']);
			if (!empty($_W['user']['groupid']) && !empty($notice_val['group']) && !in_array($_W['user']['groupid'], $notices[$key]['group']['vice_founder']) && !in_array($_W['user']['groupid'], $notices[$key]['group']['normal'])) {
				unset($notices[$key]);
			}
		}
	}
	return $notices;
}

/**
 * 获取距离上次数据库备份间隔的天数
 * @param mixed 时间戳数组 /时间戳
 * @return integer 天数;
 */
function welcome_database_backup_days($time) {
	global $_W;
	$cachekey = cache_system_key("back_days:");
	$cache = cache_load($cachekey);
	if (!empty($cache)) {
		return $cache;
	}
	$backup_days = 0;
	if (is_array($time)) {
		$max_backup_time = $time[0];
		foreach ($time as $key => $backup_time) {
			if ($backup_time <= $max_backup_time) {
				continue;
			}
			$max_backup_time = $backup_time;
		}
		$backup_days = ceil((time() - $max_backup_time) / (3600 * 24));
	}
	if (is_numeric($time)) {
		$backup_days = ceil((time() - $time) / (3600 * 24));
	}
	cache_write($cachekey, $backup_days, 24 * 3600);
	return $backup_days;
}

/**
 * 获取云服务系统更新数据并执行更新
 * @return array() ;
 */
function welcome_get_cloud_upgrade() {
	$upgrade_cache = cache_load('upgrade');
	if (empty($upgrade_cache) || TIMESTAMP - $upgrade_cache['lastupdate'] >= 3600 * 24 || empty($upgrade_cache['data'])) {
		$upgrade = cloud_build(); // 获取系统需要更新的数据
	} else {
		$upgrade = $upgrade_cache['data']; // 从缓存获取系统需要更新数据
	}
	cache_delete('cloud:transtoken');
	if (is_error($upgrade) || empty($upgrade['upgrade'])) {
		$upgrade = array();
	}
	if (!empty($upgrade['schemas'])) {
		$upgrade['database'] = cloud_build_schemas($upgrade['schemas']);
	}
	$file_nums = count($upgrade['files']); // 需要更新的文件数
	$database_nums = count($upgrade['database']); // 需要更新的表
	$script_nums = count($upgrade['scripts']); // 需要更新？？
	$upgrade['file_nums'] = $file_nums;
	$upgrade['database_nums'] = $database_nums;
	$upgrade['script_nums'] = $script_nums;
	return $upgrade;
}
