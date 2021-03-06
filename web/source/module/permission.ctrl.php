<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 *
 * 模块权限设置
 */
defined('IN_IA') or exit('Access Denied');

$dos = array('display', 'post', 'delete');
$do = !empty($_GPC['do']) ? $_GPC['do'] : 'display';

$module_name = trim($_GPC['m']);
$modulelist = uni_modules(false);
$module = $_W['current_module'] = $modulelist[$module_name];
define('IN_MODULE', $module_name);

if(empty($module)) {
	itoast('抱歉，你操作的模块不能被访问！');
}
if(!permission_check_account_user_module($module_name.'_permissions', $module_name)) {
	itoast('您没有权限进行该操作');
}

// 显示模块权限列表
if ($do == 'display') {
	$user_permissions = module_clerk_info($module_name); // 获取模块所有店员信息及其对应权限信息
	$current_module_permission = module_permission_fetch($module_name); // 获取某个模块的权限标识列表
	$permission_name = array();
	if (!empty($current_module_permission)) {
		foreach ($current_module_permission as $key => $permission) {
			$permission_name[$permission['permission']] = $permission['title'];
		}
	}
	if (!empty($user_permissions)) {
		foreach ($user_permissions as $key => &$permission) {
			if (!empty($permission['permission'])) {
				$permission['permission'] = explode('|', $permission['permission']);
				foreach ($permission['permission'] as $k => $val) {
					$permission['permission'][$val] = $permission_name[$val];
					unset($permission['permission'][$k]);
				}
			}
		}
		unset($permission);
	}
}

// 添加店员和分配权限
if ($do == 'post') {
	$uid = intval($_GPC['uid']);
	$user = user_single($uid);
	$module_and_plugins = array();
	$all_permission = array();
	if (!empty($module['plugin_list'])) {
		$module_and_plugins = array_reverse($module['plugin_list']);
	}
	array_push($module_and_plugins, $module_name);
	$module_and_plugins = array_reverse($module_and_plugins);

	foreach ($module_and_plugins as $key => $module_val) {
		$all_permission[$module_val]['info'] = module_fetch($module_val);
		$all_permission[$module_val]['permission'] = module_permission_fetch($module_val);
	}
	if (!empty($uid)) {
		foreach ($module_and_plugins as $key => $plugin) {
			$have_permission[$plugin] = permission_account_user_menu($uid, $_W['uniacid'], $plugin);
			foreach ($all_permission[$plugin]['permission'] as $key => $value) {
				$all_permission[$plugin]['permission'][$key]['checked'] = 0;
				if (in_array($value['permission'], $have_permission[$plugin]) || in_array('all', $have_permission[$plugin])) {
					$all_permission[$plugin]['permission'][$key]['checked'] = 1;
				}
			}
		}
		if (is_error($have_permission)) {
			itoast($have_permission['message']);
		}
	}
	if (checksubmit()) {
		$insert_user = array(
				'username' => trim($_GPC['username']),
				'remark' => trim($_GPC['remark']),
				'password' => trim($_GPC['password']),
				'repassword' => trim($_GPC['repassword']),
				'type' => ACCOUNT_OPERATE_CLERK
			);
		if (empty($insert_user['username'])) {
			itoast('必须输入用户名，格式为 1-15 位字符，可以包括汉字、字母（不区分大小写）、数字、下划线和句点。');
		}

		// 1、注册新的店员或更新店员
		$operator = array();
		if (empty($uid)) { // 新店员
			if (user_check(array('username' => $insert_user['username']))) {
				itoast('非常抱歉，此用户名已经被注册，你需要更换注册名称！');
			}
			if (empty($insert_user['password']) || istrlen($insert_user['password']) < 8) {
				itoast('必须输入密码，且密码长度不得低于8位。');
			}
			if ($insert_user['repassword'] != $insert_user['password']) {
				itoast('两次输入密码不一致');
			}
			unset($insert_user['repassword']);
			$uid = user_register($insert_user);
			if (!$uid) {
				itoast('注册账号失败', '', '');
			}
		} else { // 编辑店员
			if (!empty($insert_user['password'])) {
				if (istrlen($insert_user['password']) < 8) {
					itoast('必须输入密码，且密码长度不得低于8位。');
				}
				if ($insert_user['repassword'] != $insert_user['password']) {
					itoast('两次输入密码不一致');
				}
			}
			$operator['password'] = $insert_user['password'];
			$operator['salt'] = $user['salt'];
			$operator['uid'] = $uid;
			$operator['username'] = $insert_user['username'];
			$operator['remark'] = $insert_user['remark'];
			$operator['type'] = $insert_user['type'];
			user_update($operator);
		}

		// 2、为店员分配权限
		$permission = $_GPC['module_permission'];
		if (!empty($permission) && is_array($permission)) {
			foreach ($module_and_plugins as $name) {
				if (empty($permission[$name])) { // 没有选择任何权限，则表示获取所有权限
					$module_permission = 'all';
				} else {
					$module_permission = implode('|', array_unique($permission[$name]));
				}
				if (empty($have_permission[$name])) {
					pdo_insert('users_permission', array('uniacid' => $_W['uniacid'], 'uid' => $uid, 'type' => $name, 'permission' => $module_permission));
				} else {
					pdo_update('users_permission', array('permission' => $module_permission), array('uniacid' => $_W['uniacid'], 'uid' => $uid, 'type' => $name));
				}
			}
		} else {
			$permission = 'all';
			foreach ($module_and_plugins as $name) {
				if (empty($have_permission)) {
					pdo_insert('users_permission', array('uniacid' => $_W['uniacid'], 'uid' => $uid, 'type' => $name, 'permission' => $permission));
				} else {
					pdo_update('users_permission', array('permission' => $permission), array('uniacid' => $_W['uniacid'], 'uid' => $uid, 'type' => $name));
				}
			}
		}

		// 建立用户在统一帐号中角色映射
		// 一个用户在一个统一帐号中只能有一种角色
		$role = table('users')->userOwnedAccountRole($uid, $_W['uniacid']);
		if (empty($role)) {
			pdo_insert('uni_account_users', array('uniacid' => $_W['uniacid'], 'uid' => $uid, 'role' => 'clerk'));
		} else {
			pdo_update('uni_account_users', array('role' => 'clerk'), array('uniacid' => $_W['uniacid'], 'uid' => $uid));
		}
		itoast('编辑店员资料成功', url('module/permission', array('m' => $module_name)), 'success');
	}
}

if ($do == 'delete') {
	$operator_id = intval($_GPC['uid']);
	if (empty($operator_id)) {
		itoast('参数错误', referer(), 'error');
	} else {
		$user = pdo_get('users', array('uid' => $operator_id), array('uid'));
		if (!empty($user)) {
			$delete_account_users = pdo_delete('uni_account_users', array('uid' => $operator_id, 'role' => 'clerk', 'uniacid' => $_W['uniacid']));
			$delete_user_permission = pdo_delete('users_permission', array('uid' => $operator_id, 'type' => $module_name, 'uniacid' => $_W['uniacid']));
			if (!empty($delete_account_users) && !empty($delete_user_permission)) {
				pdo_delete('users', array('uid' => $operator_id));
			}
		}
		itoast('删除成功', referer(), 'success');
	}
}
template('module/permission');