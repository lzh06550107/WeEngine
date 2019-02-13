<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 *
 * 统一帐号使用者管理
 */
defined('IN_IA') or exit('Access Denied');
load()->model('module');
load()->model('system');

$dos = array('delete', 'edit', 'set_permission', 'set_manager', 'module');
$do = in_array($do, $dos) ? $do : 'edit';

$uniacid = intval($_GPC['uniacid']); // 统一帐号
$acid = intval($_GPC['acid']); // 子账号
$_W['page']['title'] = '管理设置 - 微信' . ACCOUNT_TYPE_NAME . '管理';
if (empty($uniacid) || empty($acid)) {
    itoast('请选择要编辑的公众号', referer(), 'error');
}
$state = permission_account_user_role($_W['uid'], $uniacid);
$role_permission = in_array($state, array(ACCOUNT_MANAGE_NAME_FOUNDER, ACCOUNT_MANAGE_NAME_OWNER, ACCOUNT_MANAGE_NAME_MANAGER, ACCOUNT_MANAGE_NAME_VICE_FOUNDER));
if (!$role_permission) {
    itoast('无权限操作！', referer(), 'error');
}
$founders = explode(',', $_W['config']['setting']['founder']); // 获取主创始人
$headimgsrc = tomedia('headimg_' . $acid . '.jpg');
$account = account_fetch($acid);
if (is_error($account)) {
    itoast($account['message']);
}

// 显示统一帐号拥有的角色用户
if ($do == 'edit') {
    // 获取统一帐号所有非店员的所有用户
    $permissions = pdo_fetchall("SELECT id, uid, role FROM " . tablename('uni_account_users') . " WHERE uniacid = '$uniacid' and role != :role  ORDER BY uid ASC, role DESC", array(':role' => 'clerk'), 'uid');
    // 获取统一帐号的拥有者
    $owner = pdo_get('uni_account_users', array('uniacid' => $uniacid, 'role' => 'owner'), array('uid', 'id'));
    if (!empty($permissions)) {
        $member = pdo_fetchall("SELECT username, uid FROM " . tablename('users') . " WHERE uid IN (" . implode(',', array_keys($permissions)) . ")", array(), 'uid');
        if (!empty($member)) {
            foreach ($permissions as $key => $per_val) {
                // 主创始人
                $permissions[$key]['isfounder'] = in_array($member[$key]['uid'], $founders) ? 1 : 0;
                $permissions[$key]['username'] = $member[$key]['username'] ? $member[$key]['username'] : '';
            }
        }
    }
    $uids = array();
    foreach ($permissions as $v) {
        $uids[] = $v['uid'];
    }
    template('account/manage-users');

    // 删除分配给统一帐号用户和角色
} elseif ($do == 'delete') {
    if (!$_W['isajax'] || !$_W['ispost']) {
        itoast('非法操作！', referer(), 'error');
    }
    $uid = is_array($_GPC['uid']) ? 0 : intval($_GPC['uid']);
    if (empty($uid)) {
        itoast('请选择要删除的用户！', referer(), 'error');
    }
    $data = array(
        'uniacid' => $uniacid,
        'uid' => $uid,
    );
    $exists = pdo_get('uni_account_users', array('uniacid' => $uniacid, 'uid' => $uid));
    if (!empty($exists)) {
        if ($state == ACCOUNT_MANAGE_NAME_MANAGER && ($exists['role'] == ACCOUNT_MANAGE_NAME_OWNER || $exists['role'] == ACCOUNT_MANAGE_NAME_MANAGER)) {
            itoast('管理员不可操作其他管理员', referer(), 'error');
        }
        $result = pdo_delete('uni_account_users', $data);
        if ($result) {
            itoast('删除成功！', referer(), 'success');
        } else {
            itoast('删除失败，请重试！', referer(), 'error');
        }
    } else {
        itoast('该公众号下不存在该用户！', referer(), 'error');
    }

    // 设置公众号各个角色
} elseif ($do == 'set_manager') {
    $username = trim($_GPC['username']);
    $user = user_single(array('username' => $username)); // 根据用户名称来查找用户
    if (!empty($user)) {
        if ($user['status'] != 2) {
            iajax(3, '用户未通过审核或不存在！', '');
        }
        if (in_array($user['uid'], $founders)) {
            iajax(1, '不可操作网站创始人！', '');
        }
        $addtype = intval($_GPC['addtype']); // 添加类型是管理员还是操作员还是副创始人还是拥有者

        if (is_error($permission = permission_create_account($user['uid'], ACCOUNT_TYPE)) && $addtype == ACCOUNT_MANAGE_TYPE_OWNER && !in_array($_W['uid'], $founders)) {
            itoast(error(5, $permission['message']), '', 'error');
        }

        $data = array(
            'uniacid' => $uniacid,
            'uid' => $user['uid'],
        );

        $exists = pdo_get('uni_account_users', $data); // 当前统一账号是否存在该用户
        $owner = pdo_get('uni_account_users', array('uniacid' => $uniacid, 'role' => 'owner'));
        if (empty($exists)) { // 如果不存在，则添加
            // 修改统一帐号的副创始人
            if ($addtype == ACCOUNT_MANAGE_TYPE_VICE_FOUNDER) {
                // 如果添加的用户不是副创始人，则错误
                if ($user['founder_groupid'] != ACCOUNT_MANAGE_GROUP_VICE_FOUNDER) {
                    iajax(6, '副创始人不存在！', '');
                }
                // 删除该统一帐号存在的副创始人，一个统一帐号只能存在一个副创始人 TODO ??
                pdo_delete('uni_account_users', array('uniacid' => $uniacid, 'role' => ACCOUNT_MANAGE_NAME_VICE_FOUNDER));
                $data['role'] = ACCOUNT_MANAGE_NAME_VICE_FOUNDER;
            }
            // 修改统一帐号的拥有者
            if ($addtype == ACCOUNT_MANAGE_TYPE_OWNER) {
                if ($state == ACCOUNT_MANAGE_NAME_MANAGER) {
                    iajax(4, '管理员不可操作主管理员', '');
                }
                if (empty($owner)) { // 如果当前统一帐号不存在拥有者
                    $data['role'] = ACCOUNT_MANAGE_NAME_OWNER;
                } else { // 如果存在拥有者，则直接修改原有的记录，一个统一帐号只能存在一个拥有者 TODO ??
                    $result = pdo_update('uni_account_users', $data, array('id' => $owner['id']));
                    if ($result) {
                        // 删除该用户在该统一帐号中权限设置
                        pdo_delete('users_permission', array('uniacid' => $uniacid, 'uid' => $user['uid']));
                        cache_clean(cache_system_key("user_accounts"));
                        iajax(0, '修改成功！', '');
                    } else {
                        iajax(1, '修改失败！', '');
                    }
                    exit;
                }
                // 修改统一帐号的管理员
            } else if ($addtype == ACCOUNT_MANAGE_TYPE_MANAGER) {
                if ($state == ACCOUNT_MANAGE_NAME_MANAGER) {
                    iajax(4, '管理员不可操作管理员', '');
                }
                $data['role'] = ACCOUNT_MANAGE_NAME_MANAGER;
                // 修改统一帐号的操作员
            } else if ($addtype == ACCOUNT_MANAGE_TYPE_OPERATOR) {
                $data['role'] = ACCOUNT_MANAGE_NAME_OPERATOR;
            }
            // 这一步没有必要，因为已经判断该统一帐号不存在该用户
            pdo_delete('uni_account_users', array('uniacid' => $uniacid, 'uid' => $user['uid']));
            $result = pdo_insert('uni_account_users', $data);

            if ($result) {
                // 主管理员拥有公众号的所有权限，并且公众号的权限（模块、模板）根据主管理员来获取
                if ($addtype == ACCOUNT_MANAGE_TYPE_OWNER) {
                    pdo_delete('users_permission', array('uniacid' => $uniacid, 'uid' => $user['uid']));
                }
                cache_clean(cache_system_key("user_accounts"));
                iajax(0, '添加成功！', '');
            } else {
                iajax(1, '添加失败！', '');
            }
        } else { // 该用户已经是该公众号的副创始人、管理员、操作员
            iajax(2, $username . '已经是该公众号的店员或操作员或管理员，请勿重复添加！', '');
        }
    } else {
        iajax(-1, '参数错误，请刷新重试！', '');
    }

    // 给管理员和操作员分配权限
} elseif ($do == 'set_permission') {

    $uid = intval($_GPC['uid']);
    $user = user_single(array('uid' => $uid));
    if (empty($user)) {
        itoast('您操作的用户不存在或是已经被删除！', '', '');
    }
    $role = permission_account_user_role($_W['uid'], $uniacid); // 获取指定操作用户在指定的公众号所具有的角色
    if (empty($role)) {
        itoast('此用户没有操作该统一公众号的权限，请选指派“管理员”或是“操作员”权限！', '', '');
    }

    // 获取某一用户对统一账号所有模块的操作权限
    $module_permission = permission_account_user_menu($uid, $uniacid, 'modules');
    if (is_error($module_permission)) {
        itoast('参数错误！');
    }
    $module_permission_keys = array_keys($module_permission);

    $module = uni_modules_by_uniacid($uniacid);
    if (!empty($module)) {
        // TODO 需要PC和APP的模块
        foreach ($module as $key => $value) {
            // 模块不支持公众号，则删除
            if (in_array($account['type'], array(ACCOUNT_TYPE_OFFCIAL_NORMAL, ACCOUNT_TYPE_OFFCIAL_AUTH)) && $value['app_support'] != MODULE_SUPPORT_ACCOUNT) {
                unset($module[$key]);
            }
            // 模块不支持小程序，则删除
            if ($account['type'] == ACCOUNT_TYPE_APP_NORMAL && $value['wxapp_support'] != MODULE_SUPPORT_WXAPP) {
                unset($module[$key]);
            }
        }
    }
    // 如果子帐号是公众号，则获取用户在该统一帐号中的公众号权限
    if ($account['type'] == ACCOUNT_TYPE_OFFCIAL_NORMAL || $account['type'] == ACCOUNT_TYPE_OFFCIAL_AUTH) {
        $user_menu_permission_account = permission_account_user_menu($uid, $uniacid, PERMISSION_ACCOUNT);
        if (is_error($user_menu_permission_account)) {
            itoast('参数错误！');
        }
        // 如果子账号是小程序，则获取用户在该统一帐号中的小程序权限
    } elseif ($account['type'] == ACCOUNT_TYPE_APP_NORMAL) {
        $user_menu_permission_wxapp = permission_account_user_menu($uid, $uniacid, PERMISSION_WXAPP);
        if (is_error($user_menu_permission_wxapp)) {
            itoast('参数错误！');
        }
    }

    $menus = system_menu_permission_list($role);

    if (checksubmit('submit')) {
        $all_menu_permission = permission_menu_name(); // 收集所有菜单项的权限
        $user_menu_permission_new = array();
        // TODO 需要PC和APP
        if ($account['type'] == ACCOUNT_TYPE_OFFCIAL_NORMAL || $account['type'] == ACCOUNT_TYPE_OFFCIAL_AUTH) {
            if (!empty($_GPC['system'])) { // 公众号选择的权限数组
                foreach ($_GPC['system'] as $permission_name) {
                    if (in_array($permission_name, $all_menu_permission)) {
                        $user_menu_permission_new[] = $permission_name;
                    }
                }
                $data = array(
                    'type' => PERMISSION_ACCOUNT,
                    'permission' => implode('|', $user_menu_permission_new)
                );
                $result = permission_update_account_user($uid, $uniacid, $data);
                if (is_error($result)) {
                    itoast($result['message']);
                }
            } else { // 没有选择任何权限，则表示删除
                pdo_delete('users_permission', array('uniacid' => $uniacid, 'uid' => $uid, 'type' => PERMISSION_ACCOUNT));
            }
        } elseif ($account['type'] == ACCOUNT_TYPE_APP_NORMAL) {
            if (!empty($_GPC['wxapp'])) { // 小程序选择的权限数组
                foreach ($_GPC['wxapp'] as $permission_name) {
                    if (in_array($permission_name, $all_menu_permission)) {
                        $user_menu_permission_new[] = $permission_name;
                    }
                }
                $data = array(
                    'type' => PERMISSION_WXAPP,
                    'permission' => implode('|', $user_menu_permission_new)
                );
                $result = permission_update_account_user($uid, $uniacid, $data);
                if (is_error($result)) {
                    itoast($result['message']);
                }
            } else {
                pdo_delete('users_permission', array('uniacid' => $uniacid, 'uid' => $uid, 'type' => PERMISSION_WXAPP));
            }
        }

        // TODO PC和APP需要排除
        // 这里的目的就是清空该用户在统一帐号下所有模块权限
        pdo_query("DELETE FROM " . tablename('users_permission') . " WHERE uniacid = :uniacid AND uid = :uid AND type != '" . PERMISSION_ACCOUNT . "' AND type != '" . PERMISSION_WXAPP . "'", array(':uniacid' => $uniacid, ':uid' => $uid));

        if (!empty($_GPC['module'])) { // 选择模块权限组
            foreach ($_GPC['module'] as $module_val) {
                $insert = array(
                    'uniacid' => $uniacid,
                    'uid' => $uid,
                    'type' => $module_val,
                );
                if (empty($_GPC['module_' . $module_val]) || $_GPC[$module_val . '_select'] == 1) {
                    $insert['permission'] = 'all';
                    pdo_insert('users_permission', $insert);
                    continue;
                } else {
                    $data = array();
                    foreach ($_GPC['module_' . $module_val] as $v) {
                        $data[] = $v;
                    }
                    if (!empty($data)) {
                        $insert['permission'] = implode('|', $data);
                        pdo_insert('users_permission', $insert);
                    }
                }
            }
        }
        $cachekey = cache_system_key("permission:{$uniacid}:{$uid}");
        cache_delete($cachekey);
        itoast('操作菜单权限成功！', referer(), 'success');
    }

    template('account/set-permission');

    // ajax根据模块获取模块具有的所有权限
} elseif ($do == 'module' && $_W['isajax']) {
    $uid = intval($_GPC['uid']);
    $user = user_single($uid);
    if (empty($user)) {
        iajax(1, '访问错误, 未找到指定操作用户.', '');
    }
    $founders = explode(',', $_W['config']['setting']['founder']);
    $isfounder = in_array($user['uid'], $founders);
    if ($isfounder) {
        iajax(2, '访问错误, 无法编辑站长.', '');
    }

    $module_name = trim($_GPC['m']);
    $uniacid = intval($_GPC['uniacid']);
    $uid = intval($_GPC['uid']);
    $module = pdo_fetch('SELECT * FROM ' . tablename('modules') . ' WHERE name = :m', array(':m' => $module_name));
    $purview = pdo_fetch('SELECT * FROM ' . tablename('users_permission') . ' WHERE uniacid = :aid AND uid = :uid AND type = :type', array(':aid' => $uniacid, ':uid' => $uid, ':type' => $module_name));
    if (!empty($purview['permission'])) {
        $purview['permission'] = explode('|', $purview['permission']);
    } else {
        $purview['permission'] = array();
    }

    $mineurl = array();
    $all = 0;
    if (!empty($mods)) { //TODO 这是什么鬼？？
        foreach ($mods as $mod) {
            if ($mod['url'] == 'all') {
                $all = 1;
                break;
            } else {
                $mineurl[] = $mod['url'];
            }
        }
    }

    // 构建模块后台菜单权限
    $data = array();
    if ($module['settings']) {
        $data[] = array('title' => '参数设置', 'permission' => $module_name . '_settings');
    }
    if ($module['isrulefields']) {
        $data[] = array('title' => '回复规则列表', 'permission' => $module_name . '_rule');
    }
    $entries = module_entries($module_name);
    if (!empty($entries['home'])) {
        $data[] = array('title' => '微站首页导航', 'permission' => $module_name . '_home');
    }
    if (!empty($entries['profile'])) {
        $data[] = array('title' => '个人中心导航', 'permission' => $module_name . '_profile');
    }
    if (!empty($entries['shortcut'])) {
        $data[] = array('title' => '快捷菜单', 'permission' => $module_name . '_shortcut');
    }
    if (!empty($entries['cover'])) {
        foreach ($entries['cover'] as $cover) {
            $data[] = array('title' => $cover['title'], 'permission' => $module_name . '_cover_' . $cover['do']);
        }
    }
    if (!empty($entries['menu'])) {
        foreach ($entries['menu'] as $menu) {
            $data[] = array('title' => $menu['title'], 'permission' => $module_name . '_menu_' . $menu['do']);
        }
    }
    unset($entries);
    // 模块自定义权限
    if (!empty($module['permissions'])) {
        $module['permissions'] = (array)iunserializer($module['permissions']);
        $data = array_merge($data, $module['permissions']);
    }
    // 选中已经分配的权限
    foreach ($data as &$data_val) {
        $data_val['checked'] = 0;
        if (in_array($data_val['permission'], $purview['permission']) || in_array('all', $purview['permission'])) {
            $data_val['checked'] = 1;
        }
    }
    unset($data_val);
    if (empty($data)) {
        iajax(3, '无子权限！', '');
    } else {
        iajax(0, $data, '');
    }
}