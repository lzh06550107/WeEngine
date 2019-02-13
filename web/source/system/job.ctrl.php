<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 *
 * 这是用来当删除统一帐号时，同时删除该帐号素材的任务
 */
defined('IN_IA') or exit('Access Denied');
load()->model('job');
$dos = array('clear', 'execute', 'display');
$do = in_array($do, $dos) ? $do : 'display';
if (!defined('IFRAME')) {
	define('IFRAME', 'site');
}
// 显示所有计划任务
if ($do == 'display') {
	$list = job_list($_W['uid'], $_W['isfounder']); // 后台任务
	$jobid = intval($_GPC['jobid']); // 任务列表中立即执行的任务id
	array_walk($list, function(&$item){
		$progress = $item['total'] > 0 ? $item['handled']/$item['total']*100 : 0;
		$item['progress'] = $item['status'] ? 100 : intval($progress);
		$item['createtime'] = date('Y-m-d H:i:s', $item['createtime']);
		$item['endtime'] = date('Y-m-d H:i:s', $item['endtime']);
		return $item;
	});
	template('system/job');
}

// 执行计划任务
if ($do == 'execute') {
	$id = intval($_GPC['id']);
	$job = job_single($id);
		if ($_W['isfounder'] || $job['uid'] == $_W['uid']) {
		$result = job_execute($id);
		if (is_error($result)) {
			iajax(1, $result['message']);
		}

		iajax(0,  $result['message']);

	}
}

// 清除已完成任务
if ($do == 'clear') {
	$result = job_clear($uid, $_W['isfounder']);
	itoast(0,  '清除成功', referer());
}




