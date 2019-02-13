<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

/**
 * 构建管理员或操作员权限数据
 *
 * 1、如果用户是副创始人或者没有进入具体的公众号，则直接返回；
 * 2、如果用户在指定的统一帐号下没有配置权限，则使用默认权限；
 * 3、如果用户在指定的统一帐号下有配置权限，则需要查询表并和预置菜单项中的权限比较，用户存在的权限才添加菜单项对应的控制器和动作到预置的
 * 角色权限列表中；
 *
 * @return array|mixed
 */
function permission_build()
{
    global $_W, $acl;
    $we7_file_permission = $acl; // 文件 permission.inc.php中定义的预置权限
    // 加载菜单权限表
    $permission_frames = require IA_ROOT . '/web/common/frames.inc.php';
    // 如果用户角色不是操作员或者管理员或者没有进入统一帐号，即如果用户是副创始人或者没有进入统一帐号，则直接返回
    if (!in_array($_W['role'], array(ACCOUNT_MANAGE_NAME_OPERATOR, ACCOUNT_MANAGE_NAME_MANAGER)) || empty($_W['uniacid'])) {
        return $we7_file_permission;
    }

    // 获取指定用户在指定统一帐号下的权限
    $cachekey = cache_system_key("permission:{$_W['uniacid']}:{$_W['uid']}");
    $cache = cache_load($cachekey);
    if (!empty($cache)) {
        return $cache;
    }
    $permission_exist = permission_account_user_permission_exist($_W['uid'], $_W['uniacid']);
    if (empty($permission_exist)) { // 如果访问非系统菜单或者没有在表中配置过权限，则添加如下权限
        $we7_file_permission['platform'][$_W['role']] = array('platform*');
        $we7_file_permission['site'][$_W['role']] = array('site*');
        $we7_file_permission['mc'][$_W['role']] = array('mc*');
        $we7_file_permission['profile'][$_W['role']] = array('profile*');
        $we7_file_permission['module'][$_W['role']] = array('manage-account', 'display');
        $we7_file_permission['wxapp'][$_W['role']] = array('display', 'payment', 'post', 'version');
        $we7_file_permission['webapp'][$_W['role']] = array('home', 'manage');
        $we7_file_permission['phoneapp'][$_W['role']] = array('display', 'manage');
        cache_write($cachekey, $we7_file_permission);
        return $we7_file_permission;
    }
    // 如果在权限表中配置过权限则

    // 获取当前用户在统一帐号下公众号类型权限
    $user_account_permission = permission_account_user_menu($_W['uid'], $_W['uniacid'], PERMISSION_ACCOUNT);
    // 获取当前用户在统一帐号下小程序类型权限
    $user_wxapp_permission = permission_account_user_menu($_W['uid'], $_W['uniacid'], PERMISSION_WXAPP);
    // 表中用户配置的公众号和小程序菜单权限
    $user_permission = array_merge($user_account_permission, $user_wxapp_permission);

    $permission_contain = array('account', 'wxapp', 'system', 'phoneapp');

    // 处理预置菜单，建立该菜单需要的权限映射
    $section = array();
    $permission_result = array();
    foreach ($permission_frames as $key => $frames) {
        if (!in_array($key, $permission_contain) || empty($frames['section'])) {
            continue;
        }
        foreach ($frames['section'] as $frame_key => $frame) { // $
            if (empty($frame['menu'])) {
                continue;
            }
            $section[$key][$frame_key] = $frame['menu']; // $key为顶级菜单标识，$frame_key为区域标识
        }
    }
    // 获取公众号顶级菜单下所有子菜单项
    $account = permission_get_nameandurl($section[$permission_contain[0]]);
    // 小程序顶级菜单下所有子菜单项
    $wxapp = permission_get_nameandurl($section[$permission_contain[1]]);
    // 系统顶级菜单下所有子菜单项
    $system = permission_get_nameandurl($section[$permission_contain[2]]);
    // 合并所有菜单项
    $permission_result = array_merge($account, $wxapp, $system);

    foreach ($permission_result as $permission_val) {
        if (in_array($permission_val['permission_name'], $user_permission)) {
            // 如果菜单项需要的权限位于用户权限中，则建立控制器、具体角色与动作的映射关系
            // TODO  在sub_permission中$permission_val['controller']值可能为空
            $we7_file_permission[$permission_val['controller']][$_W['role']][] = $permission_val['action'];
        }
    }
    cache_write($cachekey, $we7_file_permission);
    return $we7_file_permission;
}

/**
 * 获取菜单定义中权限和控制器、动作的映射列表
 * @param $permission
 * @return array
 */
function permission_get_nameandurl($permission)
{
    $result = array();
    if (empty($permission)) {
        return $result;
    }
    foreach ($permission as $menu) {
        if (empty($menu)) {
            continue;
        }
        foreach ($menu as $permission_name) {
            $url_query_array = url_params($permission_name['url']); // 菜单项url
            $result[] = array(
                'url' => $permission_name['url'],
                'controller' => $url_query_array['c'],
                'action' => $url_query_array['a'],
                'permission_name' => $permission_name['permission_name'] // 菜单项需要的权限标识
            );
            // 如果存在子权限标识列表
            if (!empty($permission_name['sub_permission'])) {
                foreach ($permission_name['sub_permission'] as $key => $sub_permission_name) {
                    $sub_url_query_array = url_params($sub_permission_name['url']);
                    $result[] = array(
                        'url' => $sub_permission_name['url'],
                        'controller' => $sub_url_query_array['c'],
                        'action' => $sub_url_query_array['a'],
                        'permission_name' => $sub_permission_name['permission_name'],
                    );
                }
            }
        }
    }
    return $result;
}

/**
 * 添加公众号时判断数量是否超过用户组限制
 * @param int $uid 操作用户
 * @param int $type 公众号类型
 * @return array|boolean 错误原因或成功
 */
function permission_create_account($uid, $type = ACCOUNT_TYPE_OFFCIAL_NORMAL)
{
    $uid = intval($uid);
    if (empty($uid)) {
        return error(-1, '用户数据错误！');
    }
    $user_table = table('users');
    $userinfo = $user_table->usersInfo($uid);
    $groupdata = $user_table->usersGroupInfo($userinfo['groupid']); // 当前用户所在的组
    $list = table('account')->getOwnedAccountCount($uid); // 当前用户拥有的统一帐号
    foreach ($list as $item) {
        // 如果是正常接入小程序
        if ($item['type'] == ACCOUNT_TYPE_APP_NORMAL) {
            $wxapp_num = $item['count'];
        } else {
            $account_num = $item['count'];
        }
    }
    if ($type == ACCOUNT_TYPE_OFFCIAL_NORMAL || $type == ACCOUNT_TYPE_OFFCIAL_AUTH) {
        if ($account_num >= $groupdata['maxaccount']) {
            return error('-1', '您所在的用户组最多只能创建' . $groupdata['maxaccount'] . '个主公众号');
        }
    } elseif ($type == ACCOUNT_TYPE_APP_NORMAL) {
        if ($wxapp_num >= $groupdata['maxwxapp']) {
            return error('-1', '您所在的用户组最多只能创建' . $groupdata['maxwxapp'] . '个小程序');
        }
    }
    return true;
}

/**
 * 获取指定操作用户在指定的公众号所具有的角色
 * @param int $uid 操作用户
 * @param int $uniacid 指定统一公众号
 * @return string 操作用户的 role (manager|operator)
 */
function permission_account_user_role($uid = 0, $uniacid = 0)
{
    global $_W;
    load()->model('user');
    $role = '';
    $uid = empty($uid) ? $_W['uid'] : intval($uid);

    // 用户是主创始人
    if (user_is_founder($uid) && !user_is_vice_founder($uid)) {
        return ACCOUNT_MANAGE_NAME_FOUNDER;
    }

    // 用户是副创始人
    if (user_is_vice_founder($uid)) {
        return ACCOUNT_MANAGE_NAME_VICE_FOUNDER;
    }
    // 用户未绑定
    if (!user_is_bind()) {
        return ACCOUNT_MANAGE_NAME_UNBIND_USER;
    }
    $user_table = table('users');
    if (!empty($uniacid)) { // 如果指定统一帐号，则优先判断是否是主管理员
        // 在指定统一帐号下指定用户具有的角色
        $role = $user_table->userOwnedAccountRole($uid, $uniacid);
        if ($role == ACCOUNT_MANAGE_NAME_OWNER) {
            $role = ACCOUNT_MANAGE_NAME_OWNER; // 统一帐号拥有者
        } elseif ($role == ACCOUNT_MANAGE_NAME_VICE_FOUNDER) {
            $role = ACCOUNT_MANAGE_NAME_VICE_FOUNDER; // 副创始人
        } elseif ($role == ACCOUNT_MANAGE_NAME_MANAGER) {
            $role = ACCOUNT_MANAGE_NAME_MANAGER; // 管理员
        } elseif ($role == ACCOUNT_MANAGE_NAME_OPERATOR) {
            $role = ACCOUNT_MANAGE_NAME_OPERATOR; // 操作员
        } elseif ($role == ACCOUNT_MANAGE_NAME_CLERK) {
            $role = ACCOUNT_MANAGE_NAME_CLERK; // 店员
        }
        return $role;
    } else { // 如果不存在统一帐号，优先判断权限最高的角色
        // 指定用户具有的角色
        $roles = $user_table->userOwnedAccountRole($uid);
        if (in_array(ACCOUNT_MANAGE_NAME_VICE_FOUNDER, $roles)) {
            $role = ACCOUNT_MANAGE_NAME_VICE_FOUNDER; // 副创始人
        } elseif (in_array(ACCOUNT_MANAGE_NAME_OWNER, $roles)) {
            $role = ACCOUNT_MANAGE_NAME_OWNER; // 主管理员
        } elseif (in_array(ACCOUNT_MANAGE_NAME_MANAGER, $roles)) {
            $role = ACCOUNT_MANAGE_NAME_MANAGER;  // 管理员
        } elseif (in_array(ACCOUNT_MANAGE_NAME_OPERATOR, $roles)) {
            $role = ACCOUNT_MANAGE_NAME_OPERATOR; // 操作员
        } elseif (in_array(ACCOUNT_MANAGE_NAME_CLERK, $roles)) {
            $role = ACCOUNT_MANAGE_NAME_CLERK; // 店员
        }
    }
    // 默认是操作员
    $role = empty($role) ? ACCOUNT_MANAGE_NAME_OPERATOR : $role;
    return $role;
}

/**
 * 判断某个用户在某个统一账号是否配置过权限
 *
 * 1、对于创始人，则忽略该表的限制权限；
 * 2、对于系统菜单项，则需要该表的限制权限；
 * 3、其它的，则需要查表来确定；
 *
 * @param number $uid
 * @param number $uniacid
 * @return boolean
 */
function permission_account_user_permission_exist($uid = 0, $uniacid = 0)
{
    global $_W;
    load()->model('user');
    $uid = intval($uid) > 0 ? $uid : $_W['uid'];
    $uniacid = intval($uniacid) > 0 ? $uniacid : $_W['uniacid'];
    if (user_is_founder($uid)) { // 如果用户是创始人，包括主和副
        return false;
    }
    if (FRAME == 'system') { // 当前顶级菜单是系统，则
        return true;
    }
    // 获取指定账号指定用户的权限信息
    $is_exist = table('userspermission')->userPermissionInfo($uid, $uniacid);
    if (empty($is_exist)) {
        return false;
    } else {
        return true;
    }
}

/**
 * 获取当前用户对于某个统一账号的指定类型的权限
 * $type => 'system' 获取公众号权限
 *
 * 用户的权限来自：
 * 1、用户权限表配置权限；
 * 2、“系统菜单”中预设的附加角色权限；
 *
 */
function permission_account_user($type = 'system')
{
    global $_W;
    $user_permission = table('userspermission')->userPermissionInfo($_W['uid'], $_W['uniacid'], $type);
    $user_permission = $user_permission['permission'];
    if (!empty($user_permission)) {
        $user_permission = explode('|', $user_permission);
    } else { // 如果没有限定用户权限，则默认为
        $user_permission = array('account*', 'wxapp*', 'phoneapp*'); // 所有公众号，微信小程序和app
    }
    $permission_append = frames_menu_append(); // “系统菜单”中预设的附加角色权限
    //目前只有“系统菜单”才有预设权限，公众号权限走数据库
    if (!empty($permission_append[$_W['role']])) { // 用户权限合并预设角色权限得到用户最终权限
        $user_permission = array_merge($user_permission, $permission_append[$_W['role']]);
    }
    //未分配公众号的新用户用户权限取操作员这一角色相同的权限
    if (empty($_W['role']) && empty($_W['uniacid'])) {
        $user_permission = array_merge($user_permission, $permission_append['operator']);
    }
    return (array)$user_permission;
}

/**
 * 获取某一用户对某个统一账号的某种类型的操作权限
 * @param int $uid 用户uid
 * @param int $uniacid 统一帐号uniacid
 * @param string $type 权限类型（公众号、小程序、某一模块、所有模块modules、站点）
 * @return array
 */
function permission_account_user_menu($uid, $uniacid, $type)
{
    $user_menu_permission = array();

    $uid = intval($uid);
    $uniacid = intval($uniacid);
    $type = trim($type);
    if (empty($uid) || empty($uniacid) || empty($type)) {
        return error(-1, '参数错误！');
    }

    $permission_exist = permission_account_user_permission_exist($uid, $uniacid);
    if (empty($permission_exist)) {
        return array('all');// 如果用户在指定统一帐号没有配置权限，则
    }
    $user_permission_table = table('userspermission');
    if ($type == 'modules') { // 获取指定用户指定统一帐号的所有模块权限
        $user_menu_permission = $user_permission_table->userModulesPermission($uid, $uniacid);
    } else { // 如果获取某一个模块权限或者公众号，小程序
        $module = uni_modules_by_uniacid($uniacid); // 获取指定统一帐号下所有安装的模块
        $module = array_keys($module); // 获取模块标识
        if (in_array($type, $module) || in_array($type, array(PERMISSION_ACCOUNT, PERMISSION_WXAPP, PERMISSION_SYSTEM))) {
            $menu_permission = $user_permission_table->userPermissionInfo($uid, $uniacid, $type);
            if (!empty($menu_permission['permission'])) {
                $user_menu_permission = explode('|', $menu_permission['permission']); // 解析字符串
            }
        }
    }

    return $user_menu_permission;
}

/**
 * 收集所有菜单项的权限
 * @return array
 */
function permission_menu_name()
{
    load()->model('system');
    $menu_permission = array();

    $menu_list = system_menu_permission_list(); // 获取菜单列表
    $middle_menu = array();
    $middle_sub_menu = array();
    if (!empty($menu_list)) {
        foreach ($menu_list as $nav_id => $section) {
            foreach ($section['section'] as $section_id => $section) {
                if (!empty($section['menu'])) {
                    $middle_menu[] = $section['menu'];
                }
            }
        }
    }

    if (!empty($middle_menu)) {
        foreach ($middle_menu as $menu) {
            foreach ($menu as $menu_val) {
                $menu_permission[] = $menu_val['permission_name'];
                if (!empty($menu_val['sub_permission'])) {
                    $middle_sub_menu[] = $menu_val['sub_permission'];
                }
            }
        }
    }

    if (!empty($middle_sub_menu)) {
        foreach ($middle_sub_menu as $sub_menu) {
            foreach ($sub_menu as $sub_menu_val) {
                $menu_permission[] = $sub_menu_val['permission_name'];
            }
        }
    }
    return $menu_permission;
}

/**
 * 更新用户对某一公众号的权限（公众号、小程序、系统）
 * @param int $uid 用户uid
 * @param int $uniacid 公众号uniacid
 * @param array $data 要更新的数据
 * @return boolean
 */
function permission_update_account_user($uid, $uniacid, $data)
{
    $uid = intval($uid);
    $uniacid = intval($uniacid);
    if (empty($uid) || empty($uniacid) || !in_array($data['type'], array(PERMISSION_ACCOUNT, PERMISSION_WXAPP, PERMISSION_SYSTEM))) {
        return error('-1', '参数错误！');
    }
    $user_menu_permission = permission_account_user_menu($uid, $uniacid, $data['type']);
    if (is_error($user_menu_permission)) {
        return error('-1', '参数错误！');
    }

    //如果没有配置过该权限，则直接插入
    if (empty($user_menu_permission)) {
        $insert = array(
            'uniacid' => $uniacid,
            'uid' => $uid,
            'type' => $data['type'],
            'permission' => $data['permission'],
        );
        $result = table('userspermission')->fill($insert)->save();
    } else { // 否则就更新
        $update = array(
            'permission' => $data['permission'],
        );
        $result = table('userspermission')->fill($update)->whereUniacid($uniacid)->whereUid($uid)->whereType($data['type'])->save();
    }
    return $result;
}

/**
 *  判断用户是否有某一权限
 * @param $permission_name 权限名
 * @param bool $show_message 是否显示错误信息
 * @param string $action 动作名称
 * @return bool
 */
function permission_check_account_user($permission_name, $show_message = true, $action = '')
{
    global $_W, $_GPC, $acl;
    $see_more_info = $acl['see_more_info'];
    // 对于see开头的权限处理
    if (strpos($permission_name, 'see_') === 0) {
        $can_see_more = false;
        if (defined('FRAME') && FRAME == 'system') {
            $can_see_more = in_array($permission_name, $see_more_info[$_W['highest_role']]) ? true : false;
        } else {
            $can_see_more = in_array($permission_name, $see_more_info[$_W['role']]) ? true : false;
        }
        return $can_see_more;
    }
    // 其它权限处理
    $user_has_permission = permission_account_user_permission_exist();
    if (empty($user_has_permission)) { // 如果权限表中没有配置，则用户具有所有权限
        return true;
    }
    $modulename = trim($_GPC['m']);
    $do = trim($_GPC['do']);
    $entry_id = intval($_GPC['eid']);

    // 如果是回复动作，则
    if ($action == 'reply') {
        $system_modules = system_modules();
        // 对于非系统模块，
        if (!empty($modulename) && !in_array($modulename, $system_modules)) {
            // 重新定义权限名称
            $permission_name = $modulename . '_rule';
            // 获取指定用户指定公众号指定模块的权限
            $users_permission = permission_account_user($modulename);
        }
        // 如果是入口动作，则
    } elseif ($action == 'cover' && $entry_id > 0) {
        load()->model('module');
        $entry = module_entry($entry_id);
        if (!empty($entry)) {
            // 重新定义权限名称
            $permission_name = $entry['module'] . '_cover_' . trim($entry['do']);
            // 获取指定用户指定公众号指定模块的权限
            $users_permission = permission_account_user($entry['module']);
        }
        // 如果是导航菜单，则
    } elseif ($action == 'nav') {
        if (!empty($modulename)) {
            // 重新定义权限名称
            $permission_name = "{$modulename}_{$do}";
            // 获取指定用户指定公众号指定模块的权限
            $users_permission = permission_account_user($modulename);
        } else {
            return true;
        }
    } elseif ($action == 'wxapp' || !empty($_W['account']) && $_W['account']['type'] == ACCOUNT_TYPE_APP_NORMAL) {
        //  获取指定用户指定小程序的权限
        $users_permission = permission_account_user('wxapp');
    } else { // 获取指定用户指定公众号的权限
        $users_permission = permission_account_user('system');
    }
    if (!isset($users_permission)) { // 如果用户权限为空，则默认获取指定用户指定公众号的权限
        $users_permission = permission_account_user('system');
    }
    if ($users_permission[0] != 'all' && !in_array($permission_name, $users_permission)) {
        if ($show_message) {
            itoast('您没有进行该操作的权限', referer(), 'error');
        } else {
            return false;
        }
    }
    return true;
}

/**
 * 判断操作员是否具有模块某个业务功能菜单的权限
 * @param string $action
 * @param string $module_name
 * @return bool
 */
function permission_check_account_user_module($action = '', $module_name = '')
{
    global $_W, $_GPC;
    $status = permission_account_user_permission_exist();
    if (empty($status)) { // 如果权限表中没有配置，则用户具有所有权限
        return true;
    }
    $a = trim($_GPC['a']);
    $do = trim($_GPC['do']);
    $m = trim($_GPC['m']);
    // 公众号设置权限判断
    if ($a == 'manage-account' && $do == 'setting' && !empty($m)) {
        $permission_name = $m . '_setting';
        $users_permission = permission_account_user($m);
        if ($users_permission[0] != 'all' && !in_array($permission_name, $users_permission)) {
            return false;
        }
        // 默认入口设置权限判断
    } elseif ($a == 'default-entry' && !empty($m)) {
        if (!($_W['isfounder'] || $_W['role'] == ACCOUNT_MANAGE_NAME_OWNER)) {
            return false;
        }
    } elseif (!empty($do) && !empty($m)) {
        // 获取所有模块菜单
        $is_exist = table('module')->moduleBindingsInfo($m, $do, 'menu');
        if (empty($is_exist)) {
            return true;
        }
    }
    if (empty($module_name)) { // 如果模块名称为空，则使用当前所在的模块
        $module_name = IN_MODULE;
    }
    $permission = permission_account_user($module_name); // 获取当前统一帐号下指定用户指定模块的权限
    if (empty($permission) || ($permission[0] != 'all' && !empty($action) && !in_array($action, $permission))) {
        return false;
    }
    return true;
}

/**
 * 获取某个用户所在用户组可添加的主公号数量，已添加的数量，还可以添加的数量
 * @param int $uid 要查询的用户uid
 * @return array
 */
function permission_user_account_num($uid = 0)
{
    global $_W;
    $uid = intval($uid);
    if ($uid <= 0) {
        $user = $_W['user'];
    } else {
        load()->model('user');
        $user = user_single($uid);
    }

    $user_table = table('users');
    // 对于副创始人，则查询副创始人组
    if (user_is_vice_founder($user['uid'])) {
        $role = ACCOUNT_MANAGE_NAME_VICE_FOUNDER;
        $group = $user_table->userFounderGroupInfo($user['groupid']);
        $group_num = uni_owner_account_nums($user['uid'], $role);
    } else { // 其它角色，则查询该用户组id
        $role = ACCOUNT_MANAGE_NAME_OWNER;
        $group = $user_table->usersGroupInfo($user['groupid']);
        $group_num = uni_owner_account_nums($user['uid'], $role);

        // 对于非创始人且用户属于某个副创始人下级，则
        if (empty($_W['isfounder'])) {
            if (!empty($user['owner_uid'])) {
                $owner_info = $user_table->usersInfo($user['owner_uid']);
                $group_vice = $user_table->userFounderGroupInfo($owner_info['groupid']);
                // 当前副创始人已经创建的公众号、小程序等数量
                $founder_group_num = uni_owner_account_nums($owner_info['uid'], ACCOUNT_MANAGE_NAME_VICE_FOUNDER);
                // 比较当前用户组和上级副创始人用户组能够创建的数量，取最小值
                $group['maxaccount'] = min(intval($group['maxaccount']), intval($group_vice['maxaccount']));
                $group['maxwxapp'] = min(intval($group['maxwxapp']), intval($group_vice['maxwxapp']));
                $group['maxwebapp'] = min(intval($group['maxwebapp']), intval($group_vice['maxwebapp']));
                $group['maxphoneapp'] = min(intval($group['maxphoneapp']), intval($group_vice['maxphoneapp']));
            }
        }
    }

    $store_table = table('store');
    $create_buy_account_num = $store_table->searchUserCreateAccountNum($_W['uid']);
    $create_buy_wxapp_num = $store_table->searchUserCreateWxappNum($_W['uid']);
    $store_buy_account = $store_table->searchUserBuyAccount($_W['uid']);
    $store_buy_wxapp = $store_table->searchUserBuyWxapp($_W['uid']);
    $uniacid_limit = max((intval($group['maxaccount']) + intval($store_buy_account) - $group_num['account_num']), 0);
    $wxapp_limit = max((intval($group['maxwxapp']) + intval($store_buy_wxapp) - $group_num['wxapp_num']), 0);
    $webapp_limit = max(intval($group['maxwebapp']) - $group_num['webapp_num'], 0);
    $phoneapp_limit = max(intval($group['maxphoneapp']) - $group_num['phoneapp_num'], 0);

    $founder_uniacid_limit = max((intval($group_vice['maxaccount']) + intval($store_buy_account) - $founder_group_num['account_num']), 0);
    $founder_wxapp_limit = max((intval($group_vice['maxwxapp']) + intval($store_buy_wxapp) - $founder_group_num['wxapp_num']), 0);
    $founder_webapp_limit = max(intval($group_vice['maxwebapp']) - $founder_group_num['webapp_num'], 0);
    $founder_phoneapp_limit = max(intval($group_vice['maxphoneapp']) - $founder_group_num['phoneapp_num'], 0);
    $data = array(
        'group_name' => $group['name'],
        'vice_group_name' => $group_vice['name'],
        'maxaccount' => $group['maxaccount'] + $store_buy_account,
        'usergroup_account_limit' => max($group['maxaccount'] - $group_num['account_num'] - $create_buy_account_num, 0), 'usergroup_wxapp_limit' => max($group['maxwxapp'] - $group_num['wxapp_num'] - $create_buy_wxapp_num, 0), 'usergroup_webapp_limit' => max($group['maxwebapp'] - $group_num['webapp_num'], 0), 'usergroup_phoneapp_limit' => max($group['maxphoneapp'] - $group_num['phoneapp_num'], 0), 'uniacid_num' => $group_num['account_num'],
        'uniacid_limit' => max($uniacid_limit, 0),
        'founder_uniacid_limit' => max($founder_uniacid_limit, 0),
        'maxwxapp' => $group['maxwxapp'] + $store_buy_wxapp,
        'wxapp_num' => $group_num['wxapp_num'],
        'wxapp_limit' => max($wxapp_limit, 0),
        'founder_wxapp_limit' => max($founder_wxapp_limit, 0),
        'maxwebapp' => $group['maxwebapp'], 'webapp_limit' => $webapp_limit, 'founder_webapp_limit' => max($founder_webapp_limit, 0),
        'webapp_num' => $group_num['webapp_num'], 'maxphoneapp' => $group['maxphoneapp'],
        'phoneapp_num' => $group_num['phoneapp_num'],
        'phoneapp_limit' => $phoneapp_limit,
        'founder_phoneapp_limit' => max($founder_phoneapp_limit, 0)
    );
    return $data;
}