<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

load()->model('user');

$_W['page']['title'] = '添加用户 - 用户管理';

// 添加用户
if (checksubmit()) {
	$user_founder = array(
		'username' => safe_gpc_string($_GPC['username']),
		'password' => $_GPC['password'],
		'repassword' => $_GPC['repassword'],
		'remark' => safe_gpc_string($_GPC['remark']),
		'groupid' => intval($_GPC['groupid']),
		'starttime' => TIMESTAMP,
		'endtime' => intval($_GPC['timelimit']),
		'vice_founder_name' => safe_gpc_string($_GPC['vice_founder_name'])
	);

	$user_add = user_info_save($user_founder);
	if (is_error($user_add)) {
		itoast($user_add['message'], '', '');
	}
	itoast($user_add['message'], url('user/edit', array('uid' => $user_add['uid'])), 'success');
}

$groups = user_group();
template('user/create');