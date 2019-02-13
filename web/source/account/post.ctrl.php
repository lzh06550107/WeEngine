<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

load()->model('module');
load()->model('cloud');
load()->model('cache');
load()->model('user');
load()->classs('weixin.platform');
load()->model('wxapp');
load()->model('utility');
load()->func('file');
$uniacid = intval($_GPC['uniacid']);
$acid = intval($_GPC['acid']);
if (empty($uniacid) || empty($acid)) {
    itoast('请选择要编辑的公众号', url('account/manage'), 'error');
}
$defaultaccount = uni_account_default($uniacid);
if (!$defaultaccount) {
    itoast('无效的acid', url('account/manage'), 'error');
}
$acid = $defaultaccount['acid'];

$state = permission_account_user_role($_W['uid'], $uniacid);
$dos = array('base', 'sms', 'modules_tpl');


$role_permission = in_array($state, array(ACCOUNT_MANAGE_NAME_FOUNDER, ACCOUNT_MANAGE_NAME_OWNER, ACCOUNT_MANAGE_NAME_VICE_FOUNDER));

// 权限控制
if ($role_permission) {
    $do = in_array($do, $dos) ? $do : 'base';
} elseif ($state == ACCOUNT_MANAGE_NAME_MANAGER) {
    if (ACCOUNT_TYPE == ACCOUNT_TYPE_APP_NORMAL || ACCOUNT_TYPE == ACCOUNT_TYPE_APP_AUTH) {
        header('Location: ' . url('wxapp/manage/display', array('uniacid' => $uniacid, 'acid' => $acid)));
        exit;
    } else {
        $do = in_array($do, $dos) ? $do : 'modules_tpl';
    }
} else {
    itoast('您是该公众号的操作员，无权限操作！', url('account/manage'), 'error');
}

$_W['page']['title'] = '管理设置 - 微信' . ACCOUNT_TYPE_NAME . '管理';
$headimgsrc = tomedia('headimg_' . $acid . '.jpg');
$qrcodeimgsrc = tomedia('qrcode_' . $acid . '.jpg');
$account = account_fetch($acid);

// 基础信息
if ($do == 'base') {
    if (!$role_permission) {
        itoast('无权限操作！', url('account/post/modules_tpl', array('uniacid' => $uniacid, 'acid' => $acid)), 'error');
    }
    // ajax提交信息
    if ($_W['ispost'] && $_W['isajax']) {
        if (!empty($_GPC['type'])) {
            $type = trim($_GPC['type']);
        } else {
            iajax(40035, '参数错误！', '');
        }
        switch ($type) {
            case 'qrcodeimgsrc':
            case 'headimgsrc':
                $image_type = array( // 注册这里是存放公众号头像和二维码地址
                    'qrcodeimgsrc' => ATTACHMENT_ROOT . 'qrcode_' . $acid . '.jpg',
                    'headimgsrc' => ATTACHMENT_ROOT . 'headimg_' . $acid . '.jpg'
                );
                $imgsrc = $_GPC['imgsrc'];
                if (!file_is_image($imgsrc)) {
                    $result = '';
                }
                $result = utility_image_rename($imgsrc, $image_type[$type]);
                break;
            case 'name':
                $uni_account = pdo_update('uni_account', array('name' => trim($_GPC['request_data'])), array('uniacid' => $uniacid));
                $account_wechats = pdo_update(uni_account_tablename(ACCOUNT_TYPE), array('name' => trim($_GPC['request_data'])), array('acid' => $acid, 'uniacid' => $uniacid));
                $result = ($uni_account && $account_wechats) ? true : false;
                break;
            case 'account' :
                $data = array('account' => trim($_GPC['request_data']));
                break;
            case 'original':
                $data = array('original' => trim($_GPC['request_data']));
                break;
            case 'level':
                $data = array('level' => intval($_GPC['request_data']));
                break;
            case 'key':
                $data = array('key' => trim($_GPC['request_data']));
                break;
            case 'secret':
                $data = array('secret' => trim($_GPC['request_data']));
                break;
            case 'token':
                $oauth = (array)uni_setting_load(array('oauth'), $uniacid);
                if ($oauth['oauth'] == $acid && $account['level'] != 4) {
                    $acid = pdo_fetchcolumn("SELECT acid FROM " . tablename('account_wechats') . " WHERE uniacid = :uniacid AND level = 4 AND secret != '' AND `key` != ''", array(':uniacid' => $uniacid));
                    pdo_update('uni_settings', array('oauth' => iserializer(array('account' => $acid, 'host' => $oauth['oauth']['host']))), array('uniacid' => $uniacid));
                }
                $data = array('token' => trim($_GPC['request_data']));
                break;
            case 'encodingaeskey':
                $oauth = (array)uni_setting_load(array('oauth'), $uniacid);
                if ($oauth['oauth'] == $acid && $account['level'] != 4) {
                    $acid = pdo_fetchcolumn("SELECT acid FROM " . tablename('account_wechats') . " WHERE uniacid = :uniacid AND level = 4 AND secret != '' AND `key` != ''", array(':uniacid' => $uniacid));
                    pdo_update('uni_settings', array('oauth' => iserializer(array('account' => $acid, 'host' => $oauth['oauth']['host']))), array('uniacid' => $uniacid));
                }
                $data = array('encodingaeskey' => trim($_GPC['request_data']));
                break;
            case 'jointype':
                $original_type = pdo_get('account', array('uniacid' => $uniacid), 'type');
                if ($original_type['type'] == ACCOUNT_NORMAL_LOGIN) { // api接入非授权
                    $result = true;
                } else {
                    $update_type = pdo_update('account', array('type' => ACCOUNT_NORMAL_LOGIN), array('uniacid' => $uniacid));
                    $result = $update_type ? true : false;
                }
                break;
            case 'highest_visit':
                if (user_is_vice_founder() || empty($_W['isfounder'])) {
                    iajax(1, '只有创始人可以修改！');
                }
                $statistics_setting = (array)uni_setting_load(array('statistics'), $uniacid);
                if (!empty($statistics_setting['statistics'])) {
                    $highest_visit = $statistics_setting['statistics'];
                    $highest_visit['founder'] = intval($_GPC['request_data']);
                } else {
                    $highest_visit = array('founder' => intval($_GPC['request_data']));
                }
                $result = pdo_update('uni_settings', array('statistics' => iserializer($highest_visit)), array('uniacid' => $uniacid));
                break;
            case 'endtime':
                if ($_GPC['endtype'] == 1) { // 永久
                    $result = pdo_update('account', array('endtime' => -1), array('uniacid' => $uniacid));
                } else {
                    $endtime = strtotime($_GPC['endtime']);
                    if ($_W['isfounder'] || user_is_vice_founder()) {
                        $result = pdo_update('account', array('endtime' => $endtime), array('uniacid' => $uniacid));

                        // TODO 这里是干什么？？
                        $store_create_account_info = table('store')->StoreCreateAccountInfo($uniacid);
                        if (!empty($store_create_account_info)) {
                            pdo_update('site_store_create_account', array('endtime' => $endtime), array('uniacid' => $uniacid));
                        }
                        break;
                    }
                    $user_endtime = pdo_getcolumn('users', array('uid' => $_W['uid']), 'endtime');

                    $store_create_account_info = table('store')->StoreCreateAccountInfo($uniacid);
                    if (!empty($store_create_account_info)) {
                        $user_endtime = max($user_endtime, $store_create_account_info['endtime']);
                    }

                    if ($user_endtime < $endtime && !empty($user_endtime) && $state == 'owner') {
                        iajax(1, '设置到期日期不能超过' . date('Y-m-d', $user_endtime));
                    }
                    $result = pdo_update('account', array('endtime' => $endtime), array('uniacid' => $uniacid));
                }
        }
        if (!in_array($type, array('qrcodeimgsrc', 'headimgsrc', 'name', 'endtime', 'jointype', 'highest_visit'))) {
            $result = pdo_update(uni_account_tablename(ACCOUNT_TYPE), $data, array('acid' => $acid, 'uniacid' => $uniacid));
        }
        if ($result) {
            cache_delete("uniaccount:{$uniacid}");
            cache_delete("unisetting:{$uniacid}");
            cache_delete("accesstoken:{$acid}");
            cache_delete("jsticket:{$acid}");
            cache_delete("cardticket:{$acid}");
            $cachekey = cache_system_key("statistics:{$uniacid}");
            cache_delete($cachekey);
            iajax(0, '修改成功！', '');
        } else {
            iajax(1, '修改失败！', '');
        }
    }

    if ($_W['setting']['platform']['authstate']) { // 如果开启公众平台授权
        $account_platform = new WeiXinPlatform();
        $preauthcode = $account_platform->getPreauthCode();
        if (is_error($preauthcode)) {
            $authurl = array(
                'errno' => 1,
                'url' => "{$preauthcode['message']}"
            );
        } else {
            $authurl = array(
                'errno' => 0,
                'url' => sprintf(ACCOUNT_PLATFORM_API_LOGIN, $account_platform->appid, $preauthcode, urlencode($GLOBALS['_W']['siteroot'] . 'index.php?c=account&a=auth&do=forward'), ACCOUNT_PLATFORM_API_LOGIN_ACCOUNT)
            );
        }
    }
    $account['end'] = $account['endtime'] == 0 ? '永久' : date('Y-m-d', $account['endtime']);
    $account['endtype'] = $account['endtime'] == 0 ? 1 : 2;
    $statistics_setting = (array)uni_setting_load(array('statistics'), $uniacid);
    $account['highest_visit'] = empty($statistics_setting['statistics']['founder']) ? 0 : $statistics_setting['statistics']['founder'];
    $uniaccount = array();
    $uniaccount = pdo_get('uni_account', array('uniacid' => $uniacid));

    $account_api = uni_site_store_buy_goods($uniacid, STORE_TYPE_API);

    template('account/manage-base' . ACCOUNT_TYPE_TEMPLATE);
}

// 短信信息
if ($do == 'sms') {
    if (!$role_permission) {
        itoast('无权限操作！', url('account/post/modules_tpl', array('uniacid' => $uniacid, 'acid' => $acid)), 'error');
    }
    $settings = uni_setting($uniacid, array('notify'));
    $notify = $settings['notify'] ? $settings['notify'] : array();

    $sms_info = cloud_sms_info();
    $max_num = empty($sms_info['sms_count']) ? 0 : $sms_info['sms_count'];
    $signatures = $sms_info['sms_sign']; // 云端获取短信签名

    if ($_W['isajax'] && $_W['ispost'] && $_GPC['type'] == 'balance') {
        if ($max_num == 0) {
            iajax(-1, '您现有短信数量为0，请联系服务商购买短信！', '');
        }
        $balance = intval($_GPC['balance']);
        //$notify['sms']['balance'] = $balance;
        $notify['sms']['balance'] = min(max(0, $notify['sms']['balance']), $max_num);
        $count_num = $max_num - $notify['sms']['balance']; // 当前微擎平台具有的剩余短信条数
        $num = $notify['sms']['balance']; // 当前公众号具有的剩余短信条数
        $notify = iserializer($notify);
        $updatedata['notify'] = $notify;
        $result = pdo_update('uni_settings', $updatedata, array('uniacid' => $uniacid));
        if ($result) {
            iajax(0, array('count' => $count_num, 'num' => $num), '');
        } else {
            iajax(1, '修改失败！', '');
        }
    }
    if ($_W['isajax'] && $_W['ispost'] && $_GPC['type'] == 'signature') {
        if (!empty($_GPC['signature'])) {
            $signature = trim($_GPC['signature']);
            $setting = pdo_get('uni_settings', array('uniacid' => $uniacid));
            $notify = iunserializer($setting['notify']);
            $notify['sms']['signature'] = $signature;

            $notify = serialize($notify);
            $result = pdo_update('uni_settings', array('notify' => $notify), array('uniacid' => $uniacid));
            if ($result) {
                iajax(0, '修改成功！', '');
            } else {
                iajax(1, '修改失败！', '');
            }
        } else {
            iajax(40035, '参数错误！', '');
        }
    }

    template('account/manage-sms' . ACCOUNT_TYPE_TEMPLATE);
}

// 可应用模板、模块
if ($do == 'modules_tpl') {
    $unigroups = uni_groups(array(), true);
    $uni_groups = uni_groups(); // 如果是副创始人，则只显示它拥有的套餐
    $owner = account_owner($uniacid);

    if ($_W['isajax'] && $_W['ispost'] && ($role_permission)) {
        if ($_GPC['type'] == 'group') {
            $groups = $_GPC['groupdata'];
            if (!empty($groups)) {
                pdo_delete('uni_account_group', array('uniacid' => $uniacid));
                $group = pdo_get('users_group', array('id' => $owner['groupid']));
                $group['package'] = (array)iunserializer($group['package']);
                $group['package'] = array_unique($group['package']);
                foreach ($groups as $packageid) {
                    if (!empty($packageid) && !in_array($packageid, $group['package'])) {
                        pdo_insert('uni_account_group', array(
                            'uniacid' => $uniacid,
                            'groupid' => $packageid,
                        ));
                    }
                }
                cache_build_account_modules($uniacid);
                cache_build_account($uniacid);
                iajax(0, '修改成功！', '');
            } else {
                pdo_delete('uni_account_group', array('uniacid' => $uniacid));
                cache_build_account_modules($uniacid);
                cache_build_account($uniacid);
                iajax(0, '修改成功！', '');
            }
        }

        if ($_GPC['type'] == 'extend') {
            $module = $_GPC['module'];
            $tpl = $_GPC['tpl'];
            if (!empty($module) || !empty($tpl)) {
                $data = array(
                    'modules' => iserializer($module),
                    'templates' => iserializer($tpl),
                    'uniacid' => $uniacid,
                    'name' => '',
                );
                $id = pdo_fetchcolumn("SELECT id FROM " . tablename('uni_group') . " WHERE uniacid = :uniacid", array(':uniacid' => $uniacid));
                if (empty($id)) {
                    pdo_insert('uni_group', $data);
                } else {
                    pdo_update('uni_group', $data, array('id' => $id));
                }
            } else {
                pdo_delete('uni_group', array('uniacid' => $uniacid));
            }
            cache_build_account_modules($uniacid);
            cache_build_account($uniacid);
            iajax(0, '修改成功！', '');
        }

        if ($_GPC['type'] == 'store_endtime' && user_is_founder($_W['uid']) && !user_is_vice_founder()) {
            $order_id = intval($_GPC['order_id']);
            $new_endtime = safe_gpc_string($_GPC['new_time']);
            if (empty($order_id)) {
                iajax(-1, '参数错误！');
            }
            $condition = array('uniacid' => $uniacid, 'type' => STORE_ORDER_FINISH, 'id' => $order_id);
            $order_exist = pdo_get('site_store_order', $condition);
            if (!empty($order_exist)) {
                pdo_update('site_store_order', array('endtime' => strtotime($new_endtime)), $condition);
            } else {
                iajax(-1, '您未购买该权限组！');
            }
            iajax(0, '修改成功！', referer());
        }


        iajax(40035, '参数错误！', '');
    }

    // 开始收集当前公众号具有的套餐组
    $modules_tpl = $extend = array();

    $founders = explode(',', $_W['config']['setting']['founder']); // 获取所有的主创始人
    if (in_array($owner['uid'], $founders)) { // 如果统一帐号拥有者是主创始人
        $modules_tpl[] = array(
            'id' => -1,
            'name' => '所有服务',
            'modules' => array(array('name' => 'all', 'title' => '所有模块')),
            'templates' => array(array('name' => 'all', 'title' => '所有模板')),
            'type' => 'default'
        );
    } else {
        // 如果统一帐号拥有者是副创始人
        if ($owner['founder_groupid'] == ACCOUNT_MANAGE_GROUP_VICE_FOUNDER) {
            $owner['group'] = pdo_get('users_founder_group', array('id' => $owner['groupid']), array('id', 'name', 'package'));
        } else { // 如果如果统一帐号拥有者是普通用户
            $owner['group'] = pdo_get('users_group', array('id' => $owner['groupid']), array('id', 'name', 'package'));
        }

        $owner['group']['package'] = iunserializer($owner['group']['package']);
        if (!empty($owner['group']['package'])) {
            foreach ($owner['group']['package'] as $package_value) {
                if ($package_value == -1) {
                    $modules_tpl[] = array(
                        'id' => -1,
                        'name' => '所有服务',
                        'modules' => array(array('name' => 'all', 'title' => '所有模块')),
                        'templates' => array(array('name' => 'all', 'title' => '所有模板')),
                        'type' => 'default' // 用来标识是从普通套餐还是扩展套餐
                    );
                } elseif ($package_value == 0) { // TODO 这是什么

                } else {
                    $defaultmodule = $unigroups[$package_value];
                    $defaultmodule['type'] = 'default';
                    $modules_tpl[] = $defaultmodule;
                }
            }
        }
        // 统一帐号还有已经设置的多个套餐组
        $extendpackage = pdo_getall('uni_account_group', array('uniacid' => $uniacid), array(), 'groupid');
        if (!empty($extendpackage)) {
            foreach ($extendpackage as $extendpackage_val) {
                if ($extendpackage_val['groupid'] == -1) {
                    $modules_tpl[] = array(
                        'id' => -1,
                        'name' => '所有服务',
                        'modules' => array(array('name' => 'all', 'title' => '所有模块')),
                        'templates' => array(array('name' => 'all', 'title' => '所有模板')),
                        'type' => 'extend');
                } elseif ($extendpackage_val['groupid'] == 0) {// TODO 这是什么

                } else {
                    $ex_module = $unigroups[$extendpackage_val['groupid']];
                    $ex_module['type'] = 'extend';
                    $modules_tpl[] = $ex_module;
                }
            }
        }
    }

    // 当前用户具有的模块应用
    $modules = user_modules($_W['uid']);
    $templates = pdo_getall('site_templates', array(), array('id', 'name', 'title'));
    // 此外，统一帐号还有一个扩展套餐
    $extend = pdo_get('uni_group', array('uniacid' => $uniacid));
    $extend['modules'] = $current_module_names = iunserializer($extend['modules']);
    $extend['templates'] = iunserializer($extend['templates']);
    $canmodify = false;

    if ($_W['role'] == ACCOUNT_MANAGE_NAME_FOUNDER && !in_array($owner['uid'], $founders) || $_W['role'] == ACCOUNT_MANAGE_NAME_VICE_FOUNDER && $owner['uid'] != $_W['uid']) {
        $canmodify = true;
    }

    if (!empty($extend['modules'])) {
        foreach ($extend['modules'] as $module_key => $module_val) {
            $extend['modules'][$module_key] = module_fetch($module_val);
        }
    }
    if (!empty($extend['templates'])) {
        $extend['templates'] = pdo_getall('site_templates', array('id' => $extend['templates']), array('id', 'name', 'title'));
    }

    $account_buy_modules = uni_site_store_buy_goods($uniacid); // 获取指定统一帐号在站内商城购买的模块
    if (!empty($account_buy_modules) && is_array($account_buy_modules)) {
        foreach ($account_buy_modules as &$module) {
            $module = module_fetch($module);
            $module['goods_id'] = pdo_getcolumn('site_store_goods', array('module' => $module['name']), 'id');
            $module['expire_time'] = pdo_getcolumn('site_store_order', array('uniacid' => $uniacid, 'type' => STORE_ORDER_FINISH, 'goodsid' => $module['goods_id']), 'max(endtime)');
        }
    }

    unset($module);

    $store = table('store');
    $account_buy_group = uni_site_store_buy_goods($uniacid, STORE_TYPE_PACKAGE); // 获取指定统一帐号在站内商城购买的套餐
    $account_buy_package = array();
    if (is_array($account_buy_group) && !empty($account_buy_group)) {
        foreach ($account_buy_group as $group) {
            $account_buy_package[$group] = $uni_groups[$group];
            $account_buy_package[$group]['goods_id'] = pdo_getcolumn('site_store_goods', array('module_group' => $group), 'id');
            $order_info = pdo_get('site_store_order', array('uniacid' => $uniacid, 'type' => STORE_ORDER_FINISH, 'goodsid' => $account_buy_package[$group]['goods_id']), array('id', 'max(endtime) as endtime'));
            $account_buy_package[$group]['order_id'] = $order_info['id'];
            $account_buy_package[$group]['expire_time'] = $order_info['endtime'];
            if (TIMESTAMP > $account_buy_package[$group]['expire_time']) {
                $account_buy_package[$group]['expire'] = true;
            } else {
                $account_buy_package[$group]['expire'] = false;
                $account_buy_package[$group]['near_expire'] = strtotime('-1 week', $account_buy_package[$group]['expire_time']) < time() ? true : false;
            }
            $account_buy_package[$group]['expire_time'] = date('Y-m-d', $account_buy_package[$group]['expire_time']);
        }
    }
    unset($group);


    template('account/manage-modules-tpl' . ACCOUNT_TYPE_TEMPLATE);
}