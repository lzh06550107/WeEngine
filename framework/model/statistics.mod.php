<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

/**
 * 统计访问者信息
 * @param $type  访问类型，有web(后台)，app(前台)，api(微信)，all
 * @param $time_type 时间类型，today，yesterday，week，month，daterange
 * @param string $module 具体模块统计
 * @param array $daterange 该参数需要配合$time_type= 'daterange' eg：daterange('start'=>XXX,'end'=>XXX)
 * @param bool $is_system_stat 是整站(包含所有统一帐号)还是某个统一帐号访问统计，整站统计包含了统一帐号统计
 * @return array
 */
function stat_visit_info($type, $time_type, $module = '', $daterange = array(), $is_system_stat = false) {
	global $_W;
	$result = array();
	if (empty($type) || empty($time_type) || !empty($type) && !in_array($type, array('web', 'app', 'api', 'all'))) {
		return $result;
	}
	$params = array();
	if ($type != 'all') {
		$params['type'] = $type;
	}
	if (empty($is_system_stat)) {
		$params['uniacid'] = $_W['uniacid'];
	}
	if (!empty($module)) {
		$params['module'] = $module;
	}
	switch ($time_type) {
		case 'today':
			$params['date'] = date('Ymd');
			break;
		case 'yesterday':
			$params['date'] = date('Ymd', strtotime('-1 days'));
			break;
		case 'week':
			$params['date >'] = date('Ymd', strtotime('-7 days'));
			$params['date <='] = date('Ymd');
			break;
		case 'month':
			$params['date >'] = date('Ymd', strtotime('-30 days'));
			$params['date <='] = date('Ymd');
			break;
		case 'daterange':
			if (empty($daterange)) {
				return stat_visit_info($type, 'month', $module, array(), $is_system_stat);
			}
			$params['date >='] = date('Ymd', strtotime($daterange['start']));
			$params['date <='] = date('Ymd', strtotime($daterange['end']));
			break;
	}
	$visit_info = table('statistics')->visitList($params);
	if (!empty($visit_info)) {
		$result = $visit_info;
	}
	return $result;
}

/**
 * 所有前端访问方式统计
 * @param $time_type
 * @param string $module
 * @param array $daterange
 * @param bool $is_system_stat 是统一帐号，还是模块统计
 * @return array
 */
function stat_visit_app_byuniacid($time_type, $module = '', $daterange = array(), $is_system_stat = false) {
	$result = array();
	$visit_info = stat_visit_info('app', $time_type, $module, $daterange, $is_system_stat); // 所有前端方式访问统计
	if (empty($visit_info)) {
		return $result;
	}
	foreach ($visit_info as $info) {
		if ($is_system_stat) { // 是统计各个公众号
			if (empty($info['uniacid'])) {
				continue;
			}
			// 统计各个统一帐号前端访问数和该统一帐号一天最高访问数
			if ($result[$info['uniacid']]['uniacid'] == $info['uniacid']) {
				$result[$info['uniacid']]['count'] += $info['count'];
				$result[$info['uniacid']]['highest'] = $result[$info['uniacid']]['highest'] >= $info['count'] ? $result[$info['uniacid']]['highest'] : $info['count'];
			} else {
				$result[$info['uniacid']] = $info;
				$result[$info['uniacid']]['highest'] = $info['count'];
			}
		} else { // 是统计各个模块
			if (empty($info['module'])) {
				continue;
			}
            // 统计各个模块前端访问数和该模块一天最高访问数
			if ($result[$info['module']]['module'] == $info['module']) {
				$result[$info['module']]['count'] += $info['count'];
				$result[$info['module']]['highest'] = $result[$info['module']]['highest'] >= $info['count'] ? $result[$info['module']]['highest'] : $info['count'];
			} else {
				$result[$info['module']] = $info;
				$result[$info['module']]['highest'] = $info['count'];
			}
		}
	}
	$modules = stat_modules_except_system();
	$count = count($modules); //返回当前统一帐号的非系统模块数
	foreach ($result as $key => $val) {
		$result[$key]['avg'] = round($val['count'] / $count);
	}
	return $result;
}

/**
 * 按日期统计所有公众号app(前台)访问方式的访问数
 * @param $time_type
 * @param string $module
 * @param array $daterange
 * @param bool $is_system_stat
 * @return array
 */
function stat_visit_app_bydate($time_type, $module = '', $daterange = array(), $is_system_stat = false) {
	$result = array();
	$visit_info = stat_visit_info('app', $time_type, $module, $daterange, $is_system_stat);
	if (empty($visit_info)) {
		return $result;
	}
	$count = stat_account_count(); // 系统配置公众号个数
	foreach ($visit_info as $info) {
		if (empty($info['uniacid']) || empty($info['date'])) {
			continue;
		}
		if ($result[$info['date']]['date'] == $info['date']) {
			$result[$info['date']]['count'] += $info['count'];
			$result[$info['date']]['highest'] = $result[$info['date']]['highest'] >= $info['count'] ? $result[$info['date']]['highest'] : $info['count'];
		} else {
			unset($info['module'], $info['uniacid']);
			$result[$info['date']] = $info;
			$result[$info['date']]['highest'] = $info['count'];
		}
	}
	if (empty($result)) {
		return $result;
	}
	foreach ($result as $key => $val) {
		$result[$key]['avg'] = round($val['count'] / $count);
	}
	return $result;
}

/**
 * 所有访问方式统计数
 * @param $time_type 时间类型，today，yesterday，week，month，daterange
 * @param array $daterange 该参数需要配合$time_type= 'daterange' eg：daterange('start'=>XXX,'end'=>XXX)
 * @param bool $is_system_stat 是整站(包含所有统一帐号)还是某个统一帐号访问统计，整站统计包含了统一帐号统计
 * @return array
 */
function stat_visit_all_bydate($time_type, $daterange = array(), $is_system_stat = false) {
	$result = array();
	$visit_info = stat_visit_info('all', $time_type, '', $daterange, $is_system_stat);
	if (empty($visit_info)) {
		return $result;
	} else {
		foreach ($visit_info as $visit) {
			$result[$visit['date']] += $visit['count'];
		}
	}
	return $result;
}

/**
 * 如果是current_account类型，则返回平均每个模块的访问数；如果是all_account类型，则返回平均每个公众号的访问数
 * @param $type 统计类型 current_account，all_account
 * @param $data 各个公众号或模块统计数
 * @return array
 */
function stat_all_visit_statistics($type, $data) {
	if ($type == 'current_account') {
		$modules = stat_modules_except_system();
		$count = count($modules); // 非系统模块数
	} elseif ($type == 'all_account') {
		$count = stat_account_count(); // 所有统一帐号数
	}
	$result = array(
		'visit_sum' => 0,
		'visit_highest' => 0,
		'visit_avg' => 0
	);
	if (empty($data)) {
		return $result;
	}
	foreach ($data as $val) {
		$result['visit_sum'] += $val['count']; // 所有公众号访问数累加
		if ($result['visit_highest'] < $val['count']) {
			$result['visit_highest'] = $val['count']; // 收集某个公众号量访问最高的数
		}

	}
	// 如果是当前统一账号，则统计每个模块的平均访问数
    // 如果是所有统一账号，则统计每个统一帐号的平均访问数
	$result['visit_avg'] = round($result['visit_sum'] / $count);
	return $result;
}

//返回当前统一帐号的非系统模块
function stat_modules_except_system() {
	$modules = uni_modules();
	if (!empty($modules)) {
		foreach ($modules as $key => $module) {
			if (!empty($module['issystem'])) {
				unset($modules[$key]);
			}
		}
	}
	return $modules;
}

/**
 * 统计系统所有公众号个数
 * @return int
 */
function stat_account_count() {
	$count = 0;
	$account_table = table('account');
	$account_table->searchWithType(array(ACCOUNT_TYPE_OFFCIAL_NORMAL, ACCOUNT_TYPE_OFFCIAL_AUTH));
	$account_table->accountRankOrder();
	$account_list = $account_table->searchAccountList();
	$count = count($account_list);
	return $count;
}

/**
 * 指定日期范围内每天的开始和结束时间
 * @param $start
 * @param $end
 * @return array
 */
function stat_date_range($start, $end) {
	$result = array();
	if (empty($start) || empty($end)) {
		return $result;
	}
	$start = strtotime($start);
	$end = strtotime($end);
	$i = 0;
	while(strtotime(end($result)) < $end) {
		$result[] = date('Ymd', $start + $i * 86400); //86400表示24小时
		$i++;
	}
	return $result;
}
