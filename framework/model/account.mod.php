<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

/**
 * 获取当前用户可操作的所有公众号
 * @param int $uid 指定操作用户
 * @return array
 */
function uni_owned($uid = 0, $is_uni_fetch = true)
{
    global $_W;
    $uid = intval($uid) > 0 ? intval($uid) : $_W['uid'];
    $uniaccounts = array();

    $user_accounts = uni_user_accounts($uid);
    if (empty($user_accounts)) {
        return $uniaccounts;
    }

    if (!empty($user_accounts) && !empty($is_uni_fetch)) {
        foreach ($user_accounts as &$row) {
            $row = uni_fetch($row['uniacid']);
        }
    }
    return $user_accounts;
}

/**
 * 获取用户可操作的所有公众号或小程序或PC
 * @param int $uid 要查找的用户
 * @param string $type 要查找的类型：公众号：app;小程序：wxapp;PC：webapp;
 * @return array()
 */
function uni_user_accounts($uid = 0, $type = 'app')
{
    global $_W;
    $uid = intval($uid) > 0 ? intval($uid) : $_W['uid'];
    if (!in_array($type, array('app', 'wxapp', 'webapp', 'phoneapp'))) {
        $type = 'app';
    }
    $type = $type == 'app' ? 'wechats' : $type;
    $cachekey = cache_system_key("user_{$type}_accounts:{$uid}");
    $cache = cache_load($cachekey);
    if (!empty($cache)) {
        return $cache;
    }
    $field = '';
    $where = '';
    $params = array();
    $user_is_founder = user_is_founder($uid);
    if (empty($user_is_founder) || user_is_vice_founder($uid)) {
        $field .= ', u.role';
        $where .= " LEFT JOIN " . tablename('uni_account_users') . " u ON u.uniacid = w.uniacid WHERE u.uid = :uid AND u.role IN(:role1, :role2) ";
        $params[':uid'] = $uid;
        $params[':role1'] = ACCOUNT_MANAGE_NAME_OWNER;
        $params[':role2'] = ACCOUNT_MANAGE_NAME_VICE_FOUNDER;
    }
    $where .= !empty($where) ? " AND a.isdeleted <> 1 AND u.role IS NOT NULL" : " WHERE a.isdeleted <> 1";

    $sql = "SELECT w.*, a.type" . $field . " FROM " . tablename('account_' . $type) . " w LEFT JOIN " . tablename('account') . " a ON a.acid = w.acid AND a.uniacid = w.uniacid" . $where;
    $result = pdo_fetchall($sql, $params, 'uniacid');
    cache_write($cachekey, $result);
    return $result;
}

/**
 * 获取某一主账号的拥有者信息
 * @param int $uniacid  指定的公众号
 * @return array
 */
function account_owner($uniacid = 0)
{
    global $_W;
    load()->model('user');
    $uniacid = intval($uniacid);
    if (empty($uniacid)) {
        return array();
    }
    // 获取当前主账号拥有者id
    $ownerid = pdo_getcolumn('uni_account_users', array('uniacid' => $uniacid, 'role' => 'owner'), 'uid');
    if (empty($ownerid)) { // 如果没有拥有者，则把副创始人作为拥有者
        $ownerid = pdo_getcolumn('uni_account_users', array('uniacid' => $uniacid, 'role' => 'vice_founder'), 'uid');
        if (empty($ownerid)) { // 如果还是没有，则把创始人作为拥有者
            $founders = explode(',', $_W['config']['setting']['founder']);
            $ownerid = $founders[0];
        }
    }
    $owner = user_single($ownerid); // 获取拥有者信息
    if (empty($owner)) {
        return array();
    }
    return $owner;
}

function uni_accounts($uniacid = 0)
{
    global $_W;
    $uniacid = empty($uniacid) ? $_W['uniacid'] : intval($uniacid);
    $account_info = pdo_get('account', array('uniacid' => $uniacid));
    if (!empty($account_info)) {
        $accounts = pdo_fetchall("SELECT w.*, a.type, a.isconnect FROM " . tablename('account') . " a INNER JOIN " . tablename(uni_account_tablename($account_info['type'])) . " w USING(acid) WHERE a.uniacid = :uniacid AND a.isdeleted <> 1 ORDER BY a.acid ASC", array(':uniacid' => $uniacid), 'acid');
    }
    return !empty($accounts) ? $accounts : array();
}

/**
 * 获取指定统一公号及其某个子号的的信息
 * @param int $uniacid 统一账号ID
 * @return array 统一账号信息
 */
function uni_fetch($uniacid = 0)
{
    global $_W;
    load()->model('mc');

    $uniacid = empty($uniacid) ? $_W['uniacid'] : intval($uniacid);
    $cachekey = "uniaccount:{$uniacid}";
    $cache = cache_load($cachekey);
    if (!empty($cache)) {
        return $cache;
    }

    $acid = table('account')->getAccountByUniacid($uniacid); // 主账号与子账号映射信息，获取一条记录，这里没有指定是默认子账号，随机获取的
    if (empty($acid)) {
        return false;
    }
    // 包含统一帐号和子账号信息
    $account_api = WeAccount::create($acid['acid']); // 根据当前主账号对应的子账号，来初始化实例
    if (is_error($account_api)) {
        return $account_api;
    }
    $account = $account_api->account; // 子账号信息
    if (empty($account) || $account['isdeleted'] == 1) {
        return array();
    }

    $owner = account_owner($uniacid); // 获取该统一帐号拥有者信息

    $account['uid'] = $owner['uid'];
    $account['starttime'] = $owner['starttime'];
    if (!empty($account['endtime'])) { // 如果统一帐号拥有结束时间，则使用统一帐号的结束时间
        $account['endtime'] = $account['endtime'] == '-1' ? 0 : $account['endtime'];
    } else { // 如果统一帐号没有结束时间，则使用统一帐号拥有者的结束时间
        $account['endtime'] = $owner['endtime'];
    }

    $account['groups'] = mc_groups($uniacid); // 获取当前统一帐号会员组信息，默认拥有一个默认会员组
    $account['setting'] = uni_setting($uniacid); //获取当前统一帐号配置信息
    $account['grouplevel'] = $account['setting']['grouplevel']; // ??
    $account['logo'] = tomedia('headimg_' . $account['acid'] . '.jpg') . '?time=' . time();
    $account['qrcode'] = tomedia('qrcode_' . $account['acid'] . '.jpg') . '?time=' . time();

    $account['switchurl'] = wurl('account/display/switch', array('uniacid' => $account['uniacid']));
    if (!empty($account['settings']['notify'])) {
        $account['sms'] = $account['setting']['notify']['sms']['balance']; // 剩余短信数
    } else {
        $account['sms'] = 0;
    }
    $account['setmeal'] = uni_setmeal($account['uniacid']); // 获取公众号的所有人和套餐有效期限

    cache_write($cachekey, $account);
    return $account;
}

/**
 * 获取指定统一帐号在站内商城购买的指定类型商品
 * @param int $uniacid 公众号id
 * @param string $type 物品类型
 * @return array 模块列表
 */
function uni_site_store_buy_goods($uniacid, $type = STORE_TYPE_MODULE)
{
    $cachekey = cache_system_key($uniacid . ':site_store_buy_' . $type);
    $site_store_buy_goods = cache_load($cachekey);
    if (!empty($site_store_buy_goods)) {
        return $site_store_buy_goods;
    }
    $store_table = table('store');
    if ($type != STORE_TYPE_API) {
        $store_table->searchWithEndtime();
        $site_store_buy_goods = $store_table->searchAccountBuyGoods($uniacid, $type);
        $site_store_buy_goods = array_keys($site_store_buy_goods);
    } else {
        $site_store_buy_goods = $store_table->searchAccountBuyGoods($uniacid, $type);
        $setting = uni_setting_load('statistics', $uniacid);
        $use_number = isset($setting['statistics']['use']) ? intval($setting['statistics']['use']) : 0;
        $site_store_buy_goods = $site_store_buy_goods - $use_number;
    }
    cache_write($cachekey, $site_store_buy_goods);
    return $site_store_buy_goods;
}

/**
 * 获取指定公号下所有安装模块及模块信息
 * 公众号的权限是owner所有套餐内的全部模块权限
 * @param int $uniacid 公众号id
 * @param  boolean $enabled
 * @return array 模块列表
 */
function uni_modules_by_uniacid($uniacid, $enabled = true)
{
    global $_W;
    load()->model('user');
    load()->model('module');
    $cachekey = cache_system_key(CACHE_KEY_ACCOUNT_MODULES, $uniacid, $enabled);
    $modules = cache_load($cachekey);
    if (empty($modules)) {
        $founders = explode(',', $_W['config']['setting']['founder']); // 获取所有主创始人
        // 获取当前统一公众号拥有者id
        $owner_uid = pdo_getcolumn('uni_account_users', array('uniacid' => $uniacid, 'role' => 'owner'), 'uid');
        $condition = "WHERE 1";

        $account_info = uni_fetch($_W['uniacid']);
        // 如果账户类型是小程序，则商品类型应该是小程序模块，否则为公众号模块
        $goods_type = $account_info['type'] == ACCOUNT_TYPE_APP_NORMAL ? STORE_TYPE_WXAPP_MODULE : STORE_TYPE_MODULE;
        $site_store_buy_goods = uni_site_store_buy_goods($uniacid, $goods_type); // 1、用户在该统一帐号下购买的所有模块

        // 如果是统一帐号的拥有者且不是主创始人
        if (!empty($owner_uid) && !in_array($owner_uid, $founders)) {
            $uni_modules = array(); // 2、收集该统一帐号下拥有的所有模块
            // 通过统一帐号获取套餐id组
            $packageids = pdo_getall('uni_account_group', array('uniacid' => $uniacid), array('groupid'), 'groupid');
            $packageids = array_keys($packageids);

            if (IMS_FAMILY == 'x') { // 如果是商业版，合并用户在统一帐号下购买的套餐
                $store = table('store');
                $site_store_buy_package = $store->searchUserBuyPackage($uniacid);
                $packageids = array_merge($packageids, array_keys($site_store_buy_package));
            }
            // 如果不包含所有服务套餐
            if (!in_array('-1', $packageids)) {
                // 获取该统一帐号的所有套餐组和指定id套餐
                $uni_groups = pdo_fetchall("SELECT `modules` FROM " . tablename('uni_group') . " WHERE " . "id IN ('" . implode("','", $packageids) . "') OR " . " uniacid = '{$uniacid}'");
                if (!empty($uni_groups)) {
                    // 获取所有套餐组中的模块
                    foreach ($uni_groups as $group) {
                        $group_module = (array)iunserializer($group['modules']);
                        $uni_modules = array_merge($group_module, $uni_modules);
                    }
                }
                // 3、收集该拥有者拥有的所有模块
                $user_modules = user_modules($owner_uid);
                $modules = array_merge(array_keys($user_modules), $uni_modules, $site_store_buy_goods);
                if (!empty($modules)) {
                    $condition .= " AND a.name IN ('" . implode("','", $modules) . "')";
                } else {
                    $condition .= " AND a.name = ''";
                }
            }
        }

        $condition .= $enabled ? " AND (b.enabled = 1 OR b.enabled is NULL) OR a.issystem = 1" : " OR a.issystem = 1";
        $sql = "SELECT a.name FROM " . tablename('modules') . " AS a LEFT JOIN " . tablename('uni_account_modules') . " AS b ON a.name = b.module AND b.uniacid = :uniacid " . $condition . " ORDER BY b.displayorder DESC, b.id DESC";
        // 获取该统一帐号下开启的模块包括系统模块
        $modules = pdo_fetchall($sql, array(':uniacid' => $uniacid), 'name');
        cache_write($cachekey, $modules);
    }

    $module_list = array(); // 模块名称和模块信息映射表
    if (!empty($modules)) {
        foreach ($modules as $name => $module) {
            $module_info = module_fetch($name);
            if (!empty($module_info)) {
                $module_list[$name] = $module_info;
            }
        }
    }
    $module_list['core'] = array('title' => '系统事件处理模块', 'name' => 'core', 'issystem' => 1, 'enabled' => 1, 'isdisplay' => 0);
    return $module_list;
}

/**
 * 获取当前公号下所有安装模块及模块信息
 * @return array 模块列表
 */
function uni_modules($enabled = true)
{
    global $_W;
    return uni_modules_by_uniacid($_W['uniacid'], $enabled);
}

function uni_modules_app_binding()
{
    global $_W;
    $cachekey = cache_system_key(CACHE_KEY_ACCOUNT_MODULES_BINDING, $_W['uniacid']);
    $cache = cache_load($cachekey);
    if (!empty($cache)) {
        return $cache;
    }
    load()->model('module');
    $result = array();
    $modules = uni_modules();
    if (!empty($modules)) {
        foreach ($modules as $module) {
            if ($module['type'] == 'system') {
                continue;
            }
            $entries = module_app_entries($module['name'], array('home', 'profile', 'shortcut', 'function', 'cover'));
            if (empty($entries)) {
                continue;
            }
            if ($module['type'] == '') {
                $module['type'] = 'other';
            }
            $result[$module['name']] = array(
                'name' => $module['name'],
                'type' => $module['type'],
                'title' => $module['title'],
                'entries' => array(
                    'cover' => $entries['cover'],
                    'home' => $entries['home'],
                    'profile' => $entries['profile'],
                    'shortcut' => $entries['shortcut'],
                    'function' => $entries['function']
                )
            );
            unset($module);
        }
    }
    cache_write($cachekey, $result);
    return $result;
}

/**
 * 获取一个或多个套餐组信息
 * @param array $groupids 套餐ID
 * @param bool $show_all 如果没有指定$groupids，则通过本变量来确定是否显示所有
 * @return array 套餐信息列表
 */
function uni_groups($groupids = array(), $show_all = false)
{
    load()->model('module');
    global $_W;
    $cachekey = cache_system_key(CACHE_KEY_UNI_GROUP);
    $list = cache_load($cachekey);
    if (empty($list)) {
        $condition = ' WHERE uniacid = 0';
        $list = pdo_fetchall("SELECT * FROM " . tablename('uni_group') . $condition . " ORDER BY id DESC", array(), 'id');
        if (!empty($groupids)) {
            if (in_array('-1', $groupids)) {
                $list[-1] = array('id' => -1, 'name' => '所有服务', 'modules' => array('title' => '系统所有模块'), 'templates' => array('title' => '系统所有模板'));
            }
            if (in_array('0', $groupids)) {
                $list[0] = array('id' => 0, 'name' => '基础服务', 'modules' => array('title' => '系统模块'), 'templates' => array('title' => '系统模板'));
            }
        }
        if (!empty($list)) {
            foreach ($list as $k => &$row) {
                $row['wxapp'] = array();
                if (!empty($row['modules'])) {
                    $modules = iunserializer($row['modules']);
                    if (is_array($modules)) {
                        $module_list = pdo_getall('modules', array('name' => $modules), array(), 'name');
                        $row['modules'] = array();
                        if (!empty($module_list)) { // 通过模块标识来获取模块信息，区分模块支持的类型
                            foreach ($module_list as $key => &$module) {
                                $module = module_fetch($key);
                                if ($module['wxapp_support'] == MODULE_SUPPORT_WXAPP) { // 微信小程序
                                    $row['wxapp'][$module['name']] = $module;
                                }

                                if ($module['webapp_support'] == MODULE_SUPPORT_WEBAPP) { // PC
                                    $row['webapp'][$module['name']] = $module;
                                }

                                if ($module['phoneapp_support'] == MODULE_SUPPORT_PHONEAPP) { // 手机app
                                    $row['phoneapp'][$module['name']] = $module;
                                }

                                if ($module['app_support'] == MODULE_SUPPORT_ACCOUNT) { // 公众号
                                    if (!empty($module['main_module'])) {
                                        continue;
                                    }
                                    $row['modules'][$module['name']] = $module;
                                    if (!empty($module['plugin'])) {
                                        $group_have_plugin = array_intersect($module['plugin_list'], array_keys($module_list));
                                        if (!empty($group_have_plugin)) {
                                            foreach ($group_have_plugin as $plugin) {
                                                $row['modules'][$plugin] = module_fetch($plugin);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (!empty($row['templates'])) {
                    $templates = iunserializer($row['templates']);
                    if (is_array($templates)) {
                        $row['templates'] = pdo_getall('site_templates', array('id' => $templates), array('id', 'name', 'title'), 'name');
                    }
                }
            }
        }
        cache_write($cachekey, $list);
    }
    $group_list = array();
    if (!empty($groupids)) {
        foreach ($groupids as $id) {
            $group_list[$id] = $list[$id];
        }
    } else {
        // 如果是副创始人且不显示所有，则判断组套餐拥有者是否是当前用户，如果不是，则不显示该组套餐
        if (user_is_vice_founder() && empty($show_all)) {
            foreach ($list as $group_key => $group) {
                if ($group['owner_uid'] != $_W['uid']) {
                    unset($list[$group_key]);
                    continue;
                }
            }
        }
        $group_list = $list;
    }
    return $group_list;
}

/**
 * 获取当前套餐可用微站模板
 * @return array 模板列表
 */
function uni_templates()
{
    global $_W;
    $owneruid = pdo_fetchcolumn("SELECT uid FROM " . tablename('uni_account_users') . " WHERE uniacid = :uniacid AND role = 'owner'", array(':uniacid' => $_W['uniacid']));
    load()->model('user');
    $owner = user_single(array('uid' => $owneruid));
    if (empty($owner) || user_is_founder($owner['uid'])) {
        $groupid = '-1';
    } else {
        $groupid = $owner['groupid'];
    }
    $extend = pdo_getall('uni_account_group', array('uniacid' => $_W['uniacid']), array(), 'groupid');
    if (!empty($extend) && $groupid != '-1') {
        $groupid = '-2';
    }
    if (empty($groupid)) {
        $templates = pdo_fetchall("SELECT * FROM " . tablename('site_templates') . " WHERE name = 'default'", array(), 'id');
    } elseif ($groupid == '-1') {
        $templates = pdo_fetchall("SELECT * FROM " . tablename('site_templates') . " ORDER BY id ASC", array(), 'id');
    } else {
        $group = pdo_fetch("SELECT id, name, package FROM " . tablename('users_group') . " WHERE id = :id", array(':id' => $groupid));
        $packageids = iunserializer($group['package']);
        if (!empty($extend)) {
            foreach ($extend as $extend_packageid => $row) {
                $packageids[] = $extend_packageid;
            }
        }
        if (is_array($packageids)) {
            if (in_array('-1', $packageids)) {
                $templates = pdo_fetchall("SELECT * FROM " . tablename('site_templates') . " ORDER BY id ASC", array(), 'id');
            } else {
                $wechatgroup = pdo_fetchall("SELECT `templates` FROM " . tablename('uni_group') . " WHERE id IN ('" . implode("','", $packageids) . "') OR uniacid = '{$_W['uniacid']}'");
                $ms = array();
                $mssql = '';
                if (!empty($wechatgroup)) {
                    foreach ($wechatgroup as $row) {
                        $row['templates'] = iunserializer($row['templates']);
                        if (!empty($row['templates'])) {
                            foreach ($row['templates'] as $templateid) {
                                $ms[$templateid] = $templateid;
                            }
                        }
                    }
                    $ms[] = 1;
                    $mssql = " `id` IN ('" . implode("','", $ms) . "')";
                }
                $templates = pdo_fetchall("SELECT * FROM " . tablename('site_templates') . (!empty($mssql) ? " WHERE $mssql" : '') . " ORDER BY id DESC", array(), 'id');
            }
        }
    }
    if (empty($templates)) {
        $templates = pdo_fetchall("SELECT * FROM " . tablename('site_templates') . " WHERE id = 1 ORDER BY id DESC", array(), 'id');
    }
    return $templates;
}


function uni_setting_save($name, $value)
{
    global $_W;
    if (empty($name)) {
        return false;
    }
    if (is_array($value)) {
        $value = serialize($value);
    }
    $unisetting = pdo_get('uni_settings', array('uniacid' => $_W['uniacid']), array('uniacid'));
    if (!empty($unisetting)) {
        pdo_update('uni_settings', array($name => $value), array('uniacid' => $_W['uniacid']));
    } else {
        pdo_insert('uni_settings', array($name => $value, 'uniacid' => $_W['uniacid']));
    }
    $cachekey = "unisetting:{$_W['uniacid']}";
    $account_cachekey = "uniaccount:{$_W['uniacid']}";
    cache_delete($cachekey);
    cache_delete($account_cachekey);
    return true;
}

/**
 * 获取公众号的配置项
 * @param string | array $name
 * @param int $uniacid 统一公号id, uniacid
 * @return array 设置项
 */
function uni_setting_load($name = '', $uniacid = 0)
{
    global $_W;
    $uniacid = empty($uniacid) ? $_W['uniacid'] : $uniacid;
    $cachekey = "unisetting:{$uniacid}";
    $unisetting = cache_load($cachekey);
    if (empty($unisetting)) {
        $unisetting = pdo_get('uni_settings', array('uniacid' => $uniacid));
        if (!empty($unisetting)) {
            $serialize = array('site_info', 'stat', 'oauth', 'passport', 'uc', 'notify',
                'creditnames', 'default_message', 'creditbehaviors', 'payment',
                'recharge', 'tplnotice', 'mcplugin', 'statistics', 'bind_domain');
            foreach ($unisetting as $key => &$row) {
                if (in_array($key, $serialize) && !empty($row)) {
                    $row = (array)iunserializer($row);
                }
            }
        } else {
            $unisetting = array();
        }
        cache_write($cachekey, $unisetting);
    }
    if (empty($unisetting)) {
        return array();
    }
    if (empty($name)) {
        return $unisetting;
    }
    if (!is_array($name)) {
        $name = array($name);
    }
    return array_elements($name, $unisetting);
}

if (!function_exists('uni_setting')) {
    function uni_setting($uniacid = 0, $fields = '*', $force_update = false)
    {
        global $_W;
        load()->model('account');
        if ($fields == '*') {
            $fields = '';
        }
        return uni_setting_load($fields, $uniacid);
    }
}

/**
 * 获取当前公号的默认子号，如果未指定则获取第一个公众号为默认子号
 * @param int $uniacid 公众号ID
 * @return array 当前公号下的默认子号信息
 */
function uni_account_default($uniacid = 0)
{
    global $_W;
    $uniacid = empty($uniacid) ? $_W['uniacid'] : intval($uniacid);
    $uni_account = pdo_fetch("SELECT * FROM " . tablename('uni_account') . " a LEFT JOIN " . tablename('account') . " w ON a.uniacid = w.uniacid AND a.default_acid = w.acid WHERE a.uniacid = :uniacid", array(':uniacid' => $uniacid));
    if (empty($uni_account)) {
        $uni_account = pdo_fetch("SELECT * FROM " . tablename('uni_account') . " a LEFT JOIN " . tablename('account') . " w ON a.uniacid = w.uniacid WHERE a.uniacid = :uniacid ORDER BY w.acid DESC", array(':uniacid' => $uniacid));
    }
    if (!empty($uni_account)) {
        $account = pdo_get(uni_account_tablename($uni_account['type']), array('acid' => $uni_account['acid']));
        if (empty($account)) {
            $account['uniacid'] = $uni_account['uniacid'];
            $account['acid'] = $uni_account['default_acid'];
        }
        $account['type'] = $uni_account['type'];
        $account['isconnect'] = $uni_account['isconnect'];
        $account['isdeleted'] = $uni_account['isdeleted'];
        $account['endtime'] = $uni_account['endtime'];
        return $account;
    }
}

function uni_account_tablename($type)
{
    switch ($type) {
        case ACCOUNT_TYPE_OFFCIAL_NORMAL:
        case ACCOUNT_TYPE_OFFCIAL_AUTH:
            return 'account_wechats';
        case ACCOUNT_TYPE_APP_NORMAL:
        case ACCOUNT_TYPE_APP_AUTH:
            return 'account_wxapp';
        case ACCOUNT_TYPE_WEBAPP_NORMAL:
            return 'account_webapp';
        case ACCOUNT_TYPE_PHONEAPP_NORMAL:
            return 'account_phoneapp';
    }
}

/**
 * 给统一帐号添加角色
 * @param $uniacid
 * @param $uid
 * @param $role
 * @return bool
 */
function uni_user_account_role($uniacid, $uid, $role)
{
    $vice_account = array(
        'uniacid' => intval($uniacid),
        'uid' => intval($uid),
        'role' => trim($role)
    );
    $account_user = pdo_get('uni_account_users', $vice_account, array('id'));
    if (!empty($account_user)) {
        return false;
    }
    return pdo_insert('uni_account_users', $vice_account);
}

/**
 * 用户可查看到的额外信息
 *
 * uni_user_see_more_info(ACCOUNT_MANAGE_NAME_VICE_FOUNDER, false)表示副创始人不能查看
 *
 * @param array $param
 * @return boolean
 */
function uni_user_see_more_info($user_type, $see_more = false)
{
    global $_W;
    if (empty($user_type)) {
        return false;
    }
    if ($user_type == ACCOUNT_MANAGE_NAME_VICE_FOUNDER && !empty($see_more) || $_W['role'] != $user_type) {
        return true;
    }

    return false;
}

/**
 * 获取公众号和小程序真实数量
 * @param $uid
 * @param $role
 * @return array
 */
function uni_owner_account_nums($uid, $role)
{
    $account_num = $wxapp_num = $webapp_num = $phoneapp_num = 0;
    $condition = array('uid' => $uid, 'role' => $role);
    $uniacocunts = pdo_getall('uni_account_users', $condition, array(), 'uniacid');
    if (!empty($uniacocunts)) {
        $all_account = pdo_fetchall('SELECT * FROM (SELECT u.uniacid, a.default_acid FROM ' . tablename('uni_account_users') . ' as u RIGHT JOIN ' . tablename('uni_account') . ' as a  ON a.uniacid = u.uniacid  WHERE u.uid = :uid AND u.role = :role ) AS c LEFT JOIN ' . tablename('account') . ' as d ON c.default_acid = d.acid WHERE d.isdeleted = 0', array(':uid' => $uid, ':role' => $role));
        foreach ($all_account as $account) {
            if ($account['type'] == ACCOUNT_TYPE_OFFCIAL_NORMAL || $account['type'] == ACCOUNT_TYPE_OFFCIAL_AUTH) {
                $account_num++;
            }
            if ($account['type'] == ACCOUNT_TYPE_APP_NORMAL || $account['type'] == ACCOUNT_TYPE_APP_AUTH) {
                $wxapp_num++;
            }
            if ($account['type'] == ACCOUNT_TYPE_WEBAPP_NORMAL) {
                $webapp_num++;
            }
            if ($account['type'] == ACCOUNT_TYPE_PHONEAPP_NORMAL) {
                $phoneapp_num++;
            }
        }
    }
    $num = array(
        'account_num' => $account_num,
        'wxapp_num' => $wxapp_num,
        'webapp_num' => $webapp_num,
        'phoneapp_num' => $phoneapp_num
    );
    return $num;
}

/**
 * 更新最近一周公众号粉丝统计，每天粉丝变化数
 * @return bool
 */
function uni_update_week_stat()
{
    global $_W;
    $cachekey = "stat:todaylock:{$_W['uniacid']}";
    $cache = cache_load($cachekey);
    if (!empty($cache) && $cache['expire'] > TIMESTAMP) {
        return true;
    }
    // 最近一周
    $seven_days = array(
        date('Ymd', strtotime('-1 days')),
        date('Ymd', strtotime('-2 days')),
        date('Ymd', strtotime('-3 days')),
        date('Ymd', strtotime('-4 days')),
        date('Ymd', strtotime('-5 days')),
        date('Ymd', strtotime('-6 days')),
        date('Ymd', strtotime('-7 days')),
    );
    $week_stat_fans = pdo_getall('stat_fans', array('date' => $seven_days, 'uniacid' => $_W['uniacid']), '', 'date');
    $stat_update_yes = false;
    foreach ($seven_days as $sevens) {
        if (empty($week_stat_fans[$sevens]) || $week_stat_fans[$sevens]['cumulate'] <= 0) {
            $stat_update_yes = true;
            break;
        }
    }
    if (empty($stat_update_yes)) {
        return true;
    }
    foreach ($seven_days as $sevens) {
        if ($_W['account']['level'] == ACCOUNT_SUBSCRIPTION_VERIFY || $_W['account']['level'] == ACCOUNT_SERVICE_VERIFY) {
            $account_obj = WeAccount::create();
            $weixin_stat = $account_obj->getFansStat();
            if (is_error($weixin_stat) || empty($weixin_stat)) {
                return error(-1, '调用微信接口错误');
            } else {
                $update_stat = array(
                    'uniacid' => $_W['uniacid'],
                    'new' => $weixin_stat[$sevens]['new'], // 新增用户
                    'cancel' => $weixin_stat[$sevens]['cancel'], // 减少用户
                    'cumulate' => $weixin_stat[$sevens]['cumulate'], // 总用户
                    'date' => $sevens,
                );
            }
        } else {
            $update_stat = array();
            // 当天粉丝统计
            $update_stat['cumulate'] = pdo_fetchcolumn("SELECT COUNT(*) FROM " . tablename('mc_mapping_fans') . " WHERE acid = :acid AND uniacid = :uniacid AND follow = :follow AND followtime < :endtime", array(':acid' => $_W['acid'], ':uniacid' => $_W['uniacid'], ':endtime' => strtotime($sevens) + 86400, ':follow' => 1));
            $update_stat['date'] = $sevens;
            $update_stat['new'] = $week_stat_fans[$sevens]['new'];
            $update_stat['cancel'] = $week_stat_fans[$sevens]['cancel'];
            $update_stat['uniacid'] = $_W['uniacid'];
        }
        if (empty($week_stat_fans[$sevens])) {
            pdo_insert('stat_fans', $update_stat);
        } elseif (empty($week_stat_fans[$sevens]['cumulate']) || $week_stat_fans[$sevens]['cumulate'] < 0) {
            pdo_update('stat_fans', $update_stat, array('id' => $week_stat_fans[$sevens]['id']));
        }
    }
    cache_write($cachekey, array('expire' => TIMESTAMP + 7200));
    return true;
}

/**
 * 将公众号置顶
 * @param $uniacid
 * @return bool
 */
function uni_account_rank_top($uniacid)
{
    global $_W;
    if (!empty($_W['isfounder'])) {
        $max_rank = pdo_getcolumn('uni_account', array(), 'max(rank)');
        pdo_update('uni_account', array('rank' => ($max_rank + 1)), array('uniacid' => $uniacid));
    } else {
        $max_rank = pdo_getcolumn('uni_account_users', array('uid' => $_W['uid']), 'max(rank)');
        pdo_update('uni_account_users', array('rank' => ($max_rank['maxrank'] + 1)), array('uniacid' => $uniacid, 'uid' => $_W['uid']));
    }
    return true;
}

/**
 * 获取最后操作的uniacid
 * @return intval $uniacid
 */
function uni_account_last_switch()
{
    global $_W, $_GPC;
    $cache_key = cache_system_key(CACHE_KEY_ACCOUNT_SWITCH, $_GPC['__switch']);
    $cache_lastaccount = (array)cache_load($cache_key);

    if (strexists($_W['siteurl'], 'c=webapp')) {
        $uniacid = $cache_lastaccount['webapp'];
    } else if (strexists($_W['siteurl'], 'c=wxapp')) {
        $uniacid = $cache_lastaccount['wxapp'];
    } else if (strexists($_W['siteurl'], 'c=phoneapp')) {
        $uniacid = $cache_lastaccount['phoneapp'];
    } else {
        $uniacid = $cache_lastaccount['account'];
    }

    return $uniacid;
}

/**
 * 切换统一帐号
 * @param $uniacid
 * @param string $redirect
 * @param string $type 统一账号类型
 * @return array|bool
 */
function uni_account_switch($uniacid, $redirect = '', $type = ACCOUNT_TYPE_SIGN)
{
    global $_W;
    if (!in_array($type, array(ACCOUNT_TYPE_SIGN, WXAPP_TYPE_SIGN, WEBAPP_TYPE_SIGN, PHONEAPP_TYPE_SIGN))) {
        return error(-1, '账号类型不合法');
    }
    uni_account_save_switch($uniacid, $type); // 保存切换信息到缓存
    isetcookie('__uid', $_W['uid'], 7 * 86400); // 设置用户cookie
    if (!empty($redirect)) { // 重定向到指定路径
        header('Location: ' . $redirect);
        exit;
    }
    return true;
}

/**
 * 保存最后一次切换统一帐号到缓存和coookie
 * @param $uniacid
 * @param string $type
 * @return array|bool
 */
function uni_account_save_switch($uniacid, $type = ACCOUNT_TYPE_SIGN)
{
    global $_W, $_GPC;
    load()->model('visit');
    if (!in_array($type, array(ACCOUNT_TYPE_SIGN, WXAPP_TYPE_SIGN, WEBAPP_TYPE_SIGN, PHONEAPP_TYPE_SIGN))) {
        return error(-1, '账号类型不合法');
    }

    if (empty($_GPC['__switch'])) {
        $_GPC['__switch'] = random(5);
    }

    $cache_key = cache_system_key(CACHE_KEY_ACCOUNT_SWITCH, $_GPC['__switch']);
    $cache_lastaccount = cache_load($cache_key);
    if (empty($cache_lastaccount)) {
        $cache_lastaccount = array(
            $type => $uniacid,
        );
    } else {
        $cache_lastaccount[$type] = $uniacid;
    }
    visit_system_update(array('uniacid' => $uniacid, 'uid' => $_W['uid']));
    cache_write($cache_key, $cache_lastaccount);
    isetcookie('__uniacid', $uniacid, 7 * 86400);
    isetcookie('__switch', $_GPC['__switch'], 7 * 86400); // 缓存key
    return true;
}


function account_create($uniacid, $account)
{
    global $_W;
    $accountdata = array('uniacid' => $uniacid, 'type' => $account['type'], 'hash' => random(8));
    $user_create_account_info = permission_user_account_num();
    if (empty($_W['isfounder']) && empty($user_create_account_info['usergroup_account_limit'])) {
        $accountdata['endtime'] = strtotime('+1 month', time());
        pdo_insert('site_store_create_account', array('endtime' => strtotime('+1 month', time()), 'uid' => $_W['uid'], 'uniacid' => $uniacid, 'type' => ACCOUNT_TYPE_OFFCIAL_NORMAL));
    }
    pdo_insert('account', $accountdata);
    $acid = pdo_insertid();
    $account['acid'] = $acid;
    $account['token'] = random(32);
    $account['encodingaeskey'] = random(43);
    $account['uniacid'] = $uniacid;
    unset($account['type']);
    pdo_insert('account_wechats', $account);
    return $acid;
}

/**
 * 获取指定子公号信息
 * @param int $acid 子公号acid
 * @return array
 */
function account_fetch($acid)
{
    // 根据子账号来查找统一帐号
    $account_info = pdo_get('account', array('acid' => $acid));
    if (empty($account_info)) {
        return error(-1, '公众号不存在');
    }
    return uni_fetch($account_info['uniacid']);
}

/*
 * 获取某个公众号的所有人和套餐有效期限（如果没有所有人，默认属于创始人，服务创始人）
 * */
function uni_setmeal($uniacid = 0)
{
    global $_W;
    if (!$uniacid) {
        $uniacid = $_W['uniacid'];
    }
    $owneruid = pdo_fetchcolumn("SELECT uid FROM " . tablename('uni_account_users') . " WHERE uniacid = :uniacid AND role = 'owner'", array(':uniacid' => $uniacid));
    if (empty($owneruid)) { // 如果统一帐号没有拥有者
        $user = array(
            'uid' => -1,
            'username' => '创始人',
            'timelimit' => '未设置',
            'groupid' => '-1',
            'groupname' => '所有服务'
        );
        return $user;
    }
    load()->model('user');
    // 获取所有的用户组信息
    $groups = pdo_getall('users_group', array(), array('id', 'name'), 'id');
    $owner = user_single(array('uid' => $owneruid));
    $user = array(
        'uid' => $owner['uid'],
        'username' => $owner['username'],
        'groupid' => $owner['groupid'],
        'groupname' => $groups[$owner['groupid']]['name'] // 拥有者所在的用户组
    );
    if (empty($owner['endtime'])) {
        $user['timelimit'] = date('Y-m-d', $owner['starttime']) . ' ~ 无限制';
    } else {
        if ($owner['endtime'] <= TIMESTAMP) {
            $user['timelimit'] = '已到期';
        } else {
            $year = 0;
            $month = 0;
            $day = 0;
            $endtime = $owner['endtime'];
            $time = strtotime('+1 year');
            while ($endtime > $time) {
                $year = $year + 1;
                $time = strtotime("+1 year", $time);
            };
            $time = strtotime("-1 year", $time);
            $time = strtotime("+1 month", $time);
            while ($endtime > $time) {
                $month = $month + 1;
                $time = strtotime("+1 month", $time);
            };
            $time = strtotime("-1 month", $time);
            $time = strtotime("+1 day", $time);
            while ($endtime > $time) {
                $day = $day + 1;
                $time = strtotime("+1 day", $time);
            };
            if (empty($year)) {
                $timelimit = empty($month) ? $day . '天' : date('Y-m-d', $owner['starttime']) . '~' . date('Y-m-d', $owner['endtime']);
            } else {
                $timelimit = date('Y-m-d', $owner['starttime']) . '~' . date('Y-m-d', $owner['endtime']);
            }
            $user['timelimit'] = $timelimit;
        }
    }
    return $user;
}

/**
 * 检测统一帐号是否有多个子号。如果有多个子号，返回true;
 * @param int $uniacid
 * @return bool
 */
function uni_is_multi_acid($uniacid = 0)
{
    global $_W;
    if (!$uniacid) {
        $uniacid = $_W['uniacid'];
    }
    $cachekey = "unicount:{$uniacid}";
    $nums = cache_load($cachekey);
    $nums = intval($nums);
    if (!$nums) {
        $nums = pdo_fetchcolumn('SELECT COUNT(*) FROM ' . tablename('account_wechats') . ' WHERE uniacid = :uniacid', array(':uniacid' => $_W['uniacid']));
        cache_write($cachekey, $nums);
    }
    if ($nums == 1) {
        return false;
    }
    return true;
}

/**
 * 删除子账号
 * @param $acid  子账号acid
 * @return int|mixed
 */
function account_delete($acid)
{
    global $_W;
    load()->func('file');
    load()->model('module');
    load()->model('job');
    $jobid = 0;
    // 该子账号是否属于某个统一帐号的默认子账号，则删除统一帐号及其所有子账号
    $account = pdo_get('uni_account', array('default_acid' => $acid));
    if ($account) {
        $uniacid = $account['uniacid'];
        $state = permission_account_user_role($_W['uid'], $uniacid);
        if (!in_array($state, array(ACCOUNT_MANAGE_NAME_OWNER, ACCOUNT_MANAGE_NAME_FOUNDER, ACCOUNT_MANAGE_NAME_VICE_FOUNDER))) {
            itoast('没有该公众号操作权限！', url('account/recycle'), 'error');
        }

        // 1、清除cookie中的统一帐号
        if ($uniacid == $_W['uniacid']) {
            isetcookie('__uniacid', '');
        }
        // 2、清空缓存中该统一帐号信息
        cache_delete("uniaccount:{$uniacid}");
        $modules = array();
        // 3、清除该统一帐号的回复规则
        $rules = pdo_fetchall("SELECT id, module FROM " . tablename('rule') . " WHERE uniacid = '{$uniacid}'");
        if (!empty($rules)) {
            foreach ($rules as $index => $rule) {
                $deleteid[] = $rule['id'];
            }
            pdo_delete('rule', "id IN ('" . implode("','", $deleteid) . "')");
        }

        // 4、清空统一帐号的子账号中头像和二维码图片
        $subaccount = pdo_fetchall("SELECT acid FROM " . tablename('account') . " WHERE uniacid = :uniacid", array(':uniacid' => $uniacid));
        if (!empty($subaccount)) {
            // 一个统一帐号可能存在多个子账号，则一并删除
            foreach ($subaccount as $childaccount) {
                // 清空子账号的头像和二维码图片
                @unlink(IA_ROOT . '/attachment/qrcode_' . $childaccount['acid'] . '.jpg');
                @unlink(IA_ROOT . '/attachment/headimg_' . $childaccount['acid'] . '.jpg');
                file_remote_delete('qrcode_' . $childaccount['acid'] . '.jpg');
                file_remote_delete('headimg_' . $childaccount['acid'] . '.jpg');
            }
            // 5、删除统一帐号本地和远程附件
            if (!empty($acid)) {
                $jobid = job_create_delete_account($uniacid, $account['name'], $_W['uid']);
            }
        }

        // 6、删除相关表中与统一帐号关联的记录，包括子账号记录
        $tables = array(
            'account', 'account_wechats', 'account_wxapp', 'wxapp_versions', 'account_webapp', 'account_phoneapp',
            'phoneapp_versions', 'core_paylog', 'core_queue', 'core_resource',
            'cover_reply', 'mc_chats_record', 'mc_credits_recharge', 'mc_credits_record',
            'mc_fans_groups', 'mc_groups', 'mc_handsel', 'mc_mapping_fans', 'mc_mapping_ucenter', 'mc_mass_record',
            'mc_member_address', 'mc_member_fields', 'mc_members', 'menu_event',
            'qrcode', 'qrcode_stat', 'rule', 'rule_keyword', 'site_article', 'site_category', 'site_multi', 'site_nav', 'site_slide',
            'site_styles', 'site_styles_vars', 'stat_keyword', 'stat_rule', 'uni_account', 'uni_account_modules', 'uni_account_users', 'uni_settings', 'uni_group', 'uni_verifycode', 'users_permission',
            'mc_member_fields', 'wechat_news',
        );
        if (!empty($tables)) {
            foreach ($tables as $table) {
                $tablename = str_replace($GLOBALS['_W']['config']['db']['tablepre'], '', $table);
                pdo_delete($tablename, array('uniacid' => $uniacid));
            }
        }
    } else { // 如果不是默认子账号，则只删除子账号即可，可保留统一帐号
        $account = account_fetch($acid); // 根据子账号，获取指定子公号信息
        if (empty($account)) {
            itoast('子公众号不存在或是已经被删除', '', '');
        }
        $uniacid = $account['uniacid'];
        $state = permission_account_user_role($_W['uid'], $uniacid);
        if ($state != ACCOUNT_MANAGE_NAME_FOUNDER && $state != ACCOUNT_MANAGE_NAME_OWNER) {
            itoast('没有该公众号操作权限！', url('account/recycle'), 'error');
        }
        $uniaccount = uni_fetch($account['uniacid']); // 获取指定统一公号下默认子号的的信息
        if ($uniaccount['default_acid'] == $acid) {
            itoast('默认子公众号不能删除', '', '');
        }
        pdo_delete('account', array('acid' => $acid));  // 删除子账号相关的映射
        pdo_delete('account_wechats', array('acid' => $acid, 'uniacid' => $uniacid));
        cache_delete("uniaccount:{$uniacid}");
        cache_delete("unisetting:{$uniacid}");
        cache_delete('account:auth:refreshtoken:' . $acid);
        $oauth = uni_setting($uniacid, array('oauth')); // 公众号借用权限
        if ($oauth['oauth']['account'] == $acid) { // 如果借用的是当前子账号
            $acid = pdo_fetchcolumn('SELECT acid FROM ' . tablename('account_wechats') . " WHERE uniacid = :id AND level = 4 AND secret != '' AND `key` != ''", array(':id' => $uniacid));
            // 则更新来借用该统一帐号下，其它子号的权限
            pdo_update('uni_settings', array('oauth' => iserializer(array('account' => $acid, 'host' => $oauth['oauth']['host']))), array('uniacid' => $uniacid));
        }
        // 删除当前子号的头像和二维码图片
        @unlink(IA_ROOT . '/attachment/qrcode_' . $acid . '.jpg');
        @unlink(IA_ROOT . '/attachment/headimg_' . $acid . '.jpg');
        file_remote_delete('qrcode_' . $acid . '.jpg');
        file_remote_delete('headimg_' . $acid . '.jpg');
    }
    return $jobid;
}

/**
 * 获取所有可借用支付的公众号
 * @return array() 微信支付可借用的的公众号和服务商公众号
 */
function account_wechatpay_proxy()
{
    global $_W;
    $proxy_account = cache_load(cache_system_key('proxy_wechatpay_account:'));
    if (empty($proxy_account)) {
        $proxy_account = cache_build_proxy_wechatpay_account();
    }
    unset($proxy_account['borrow'][$_W['uniacid']]);
    unset($proxy_account['service'][$_W['uniacid']]);
    return $proxy_account;
}


function uni_account_module_shortcut_enabled($modulename, $uniacid = 0, $status = STATUS_ON)
{
    global $_W;
    $module = module_fetch($modulename);
    if (empty($module)) {
        return error(1, '抱歉，你操作的模块不能被访问！');
    }
    $uniacid = intval($uniacid);
    $uniacid = !empty($uniacid) ? $uniacid : $_W['uniacid'];

    $module_status = pdo_get('uni_account_modules', array('module' => $modulename, 'uniacid' => $uniacid), array('id', 'shortcut'));
    if (empty($module_status)) {
        $data = array(
            'uniacid' => $uniacid,
            'module' => $modulename,
            'enabled' => STATUS_ON,
            'shortcut' => $status ? STATUS_ON : STATUS_OFF,
            'settings' => '',
        );
        pdo_insert('uni_account_modules', $data);
    } else {
        $data = array(
            'shortcut' => $status ? STATUS_ON : STATUS_OFF,
        );
        pdo_update('uni_account_modules', $data, array('id' => $module_status['id']));
        cache_build_module_info($modulename);
    }
    return true;
}

/**
 * 获取某公众号下会员字段，并更新mc_member_fields表比profile_fields表中缺少的字段
 * @param int $uniacid
 * @return array 会员字段数组
 */
function uni_account_member_fields($uniacid)
{
    if (empty($uniacid)) {
        return array();
    }
    $account_member_fields = pdo_getall('mc_member_fields', array('uniacid' => $uniacid), array(), 'fieldid');
    $system_member_fields = pdo_getall('profile_fields', array(), array(), 'id');
    // 收集会员字段表中不存在的字段
    $less_field_indexes = array_diff(array_keys($system_member_fields), array_keys($account_member_fields));
    if (empty($less_field_indexes)) { // 如果不存在差异
        foreach ($account_member_fields as &$field) {
            $field['field'] = $system_member_fields[$field['fieldid']]['field'];
        }
        unset($field);
        return $account_member_fields;
    }
    // 如果存在差异，则插入这些差异字段到会员字段表中
    $account_member_add_fields = array('uniacid' => $uniacid);
    foreach ($less_field_indexes as $field_index) {
        $account_member_add_fields['fieldid'] = $system_member_fields[$field_index]['id'];
        $account_member_add_fields['title'] = $system_member_fields[$field_index]['title'];
        $account_member_add_fields['available'] = $system_member_fields[$field_index]['available'];
        $account_member_add_fields['displayorder'] = $system_member_fields[$field_index]['displayorder'];
        pdo_insert('mc_member_fields', $account_member_add_fields);
        $insert_id = pdo_insertid();
        $account_member_fields[$insert_id]['id'] = $insert_id;
        $account_member_fields[$insert_id]['field'] = $system_member_fields[$field_index]['field'];
        $account_member_fields[$insert_id]['fid'] = $system_member_fields[$field_index]['id'];
        $account_member_fields[$insert_id] = array_merge($account_member_fields[$insert_id], $account_member_add_fields);
    }
    return $account_member_fields;
}


function uni_account_global_oauth()
{
    load()->model('setting');
    $oauth = setting_load('global_oauth');
    $oauth = !empty($oauth['global_oauth']) ? $oauth['global_oauth'] : array();
    return $oauth;
}

function uni_search_link_account($module_name, $account_type)
{
    global $_W;
    $module_name = trim($module_name);
    if (empty($module_name) || empty($account_type) || !in_array($account_type, array(ACCOUNT_TYPE_OFFCIAL_NORMAL, ACCOUNT_TYPE_OFFCIAL_AUTH, ACCOUNT_TYPE_APP_NORMAL, ACCOUNT_TYPE_WEBAPP_NORMAL))) {
        return array();
    }
    if (in_array($account_type, array(ACCOUNT_TYPE_OFFCIAL_NORMAL, ACCOUNT_TYPE_OFFCIAL_AUTH))) {
        $owned_account = uni_user_accounts($_W['uid'], 'app');
    } elseif ($account_type == ACCOUNT_TYPE_APP_NORMAL) {
        $owned_account = uni_user_accounts($_W['uid'], 'wxapp');
    } elseif ($account_type == ACCOUNT_TYPE_WEBAPP_NORMAL) {
        $owned_account = uni_user_accounts($_W['uid'], 'webapp');
    } else {
        $owned_account = array();
    }
    if (!empty($owned_account)) {
        foreach ($owned_account as $key => $account) {
            if ($account['type'] != $account_type) {
                unset($owned_account[$key]);
                continue;
            }
            $account['role'] = permission_account_user_role($_W['uid'], $account['uniacid']);
            if (!in_array($account['role'], array(ACCOUNT_MANAGE_NAME_OWNER, ACCOUNT_MANAGE_NAME_FOUNDER))) {
                unset($owned_account[$key]);
            }
        }
        foreach ($owned_account as $key => $account) {
            $account_modules = uni_modules_by_uniacid($account['uniacid']);
            if (empty($account_modules[$module_name])) {
                unset($owned_account[$key]);
                continue;
            }
            if (in_array($account_type, array(ACCOUNT_TYPE_OFFCIAL_NORMAL, ACCOUNT_TYPE_OFFCIAL_AUTH)) && $account_modules[$module_name]['app_support'] != MODULE_SUPPORT_ACCOUNT) {
                unset($owned_account[$key]);
            } elseif ($account_type == ACCOUNT_TYPE_APP_NORMAL && $account_modules[$module_name]['wxapp_support'] != MODULE_SUPPORT_WXAPP) {
                unset($owned_account[$key]);
            } elseif ($account_type == ACCOUNT_TYPE_WEBAPP_NORMAL && $account_modules[$module_name]['webapp_support'] != MODULE_SUPPORT_WEBAPP) {
                unset($owned_account[$key]);
            }
        }
    }
    return $owned_account;
}
