<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

load()->func('file');
load()->model('module');
load()->model('user');
load()->model('account');
load()->classs('weixin.platform');

$_W['page']['title'] = '添加/编辑公众号 - 公众号管理';
$uniacid = intval($_GPC['uniacid']);
$step = intval($_GPC['step']) ? intval($_GPC['step']) : 1;
$user_create_account_info = permission_user_account_num();

if ($step == 1) {
    if ($user_create_account_info['uniacid_limit'] <= 0 && !$_W['isfounder']) {
        $authurl = "javascript:alert('创建公众号已达上限！');";
    }
    // 使用授权登录需认证微信开放平台
    if (empty($authurl) && !empty($_W['setting']['platform']['authstate'])) {
        $account_platform = new WeiXinPlatform();
        $authurl = $account_platform->getAuthLoginUrl(); // 获取授权登录url
    }
} elseif ($step == 2) {
    if (!empty($uniacid)) {
        $state = permission_account_user_role($uid, $uniacid);
        // 不是创始人和主管理员
        if ($state != ACCOUNT_MANAGE_NAME_FOUNDER && $state != ACCOUNT_MANAGE_NAME_OWNER) {
            itoast('没有该公众号操作权限！', '', '');
        }
        // 用户组创建公众号个数是否达到上限
        if (is_error($permission = permission_create_account($_W['uid'], 2))) {
            itoast($permission['message'], '', 'error');
        }
    } else {
        if (empty($_W['isfounder']) && is_error($permission = permission_create_account($_W['uid'], 1))) {
            if (is_error($permission = permission_create_account($_W['uid'], 2))) {
                itoast($permission['message'], '', 'error');
            }
        }
    }
    if (checksubmit('submit')) { // 该步骤信息提交
        if ($user_create_account_info['uniacid_limit'] <= 0 && !$_W['isfounder']) {
            itoast('创建公众号已达上限！');
        }
        $update = array();
        $update['name'] = trim($_GPC['cname']);

        if (empty($update['name'])) {
            itoast('公众号名称必须填写', '', '');
        }
        // 如果统一帐号为空
        if (empty($uniacid)) {
            $name = trim($_GPC['cname']);
            $description = trim($_GPC['description']);
            $data = array(
                'name' => $name,
                'description' => $description,
                'title_initial' => get_first_pinyin($name),
                'groupid' => 0,
            );
            $account_table = table('account');
            $account_table->searchWithTitle($name);
            $account_table->searchWithType(ACCOUNT_TYPE_OFFCIAL_NORMAL); // 手动接入公众号
            $check_uniacname = $account_table->searchAccountList();
            if (!empty($check_uniacname)) {
                itoast('该公众号名称已经存在', '', '');
            }
            if (!pdo_insert('uni_account', $data)) { // 创建一个统一帐号
                itoast('添加公众号失败', '', '');
            }
            $uniacid = pdo_insertid();

            // 为统一帐号添加微站默认主题
            $template = pdo_fetch('SELECT id,title FROM ' . tablename('site_templates') . " WHERE name = 'default'");
            $styles['uniacid'] = $uniacid;
            $styles['templateid'] = $template['id'];
            $styles['name'] = $template['title'] . '_' . random(4);
            pdo_insert('site_styles', $styles);
            // 为微站添加模板
            $styleid = pdo_insertid();
            $multi['uniacid'] = $uniacid;
            $multi['title'] = $data['name'];
            $multi['styleid'] = $styleid;
            pdo_insert('site_multi', $multi);
            $multi_id = pdo_insertid();

            // 统一帐号配置设置
            $unisettings['creditnames'] = array('credit1' => array('title' => '积分', 'enabled' => 1), 'credit2' => array('title' => '余额', 'enabled' => 1));
            $unisettings['creditnames'] = iserializer($unisettings['creditnames']);
            $unisettings['creditbehaviors'] = array('activity' => 'credit1', 'currency' => 'credit2');
            $unisettings['creditbehaviors'] = iserializer($unisettings['creditbehaviors']);
            $unisettings['uniacid'] = $uniacid;
            $unisettings['default_site'] = $multi_id; // 为统一帐号添加微站
            $unisettings['sync'] = iserializer(array('switch' => 0, 'acid' => ''));
            pdo_insert('uni_settings', $unisettings);

            // 统一帐号默认会员组
            pdo_insert('mc_groups', array('uniacid' => $uniacid, 'title' => '默认会员组', 'isdefault' => 1));
            // 统一帐号可用会员字段
            $fields = pdo_getall('profile_fields');
            foreach ($fields as $field) {
                $data = array(
                    'uniacid' => $uniacid,
                    'fieldid' => $field['id'],
                    'title' => $field['title'],
                    'available' => $field['available'],
                    'displayorder' => $field['displayorder'],
                );
                pdo_insert('mc_member_fields', $data);
            }

        }

        $update['account'] = trim($_GPC['account']);
        $update['original'] = trim($_GPC['original']);
        $update['level'] = intval($_GPC['level']);
        $update['key'] = trim($_GPC['key']);
        $update['secret'] = trim($_GPC['secret']);
        $update['type'] = ACCOUNT_TYPE_OFFCIAL_NORMAL;
        $update['encodingaeskey'] = trim($_GPC['encodingaeskey']);

        if (user_is_vice_founder()) { // 如果用户是副创始人，则给统一账号添加副创始人角色
            uni_user_account_role($uniacid, $_W['uid'], ACCOUNT_MANAGE_NAME_VICE_FOUNDER);
        }

        // 如果子账号为空，则需要插入新的子账号
        if (empty($acid)) {
            $acid = account_create($uniacid, $update);
            if (is_error($acid)) {
                itoast('添加公众号信息失败', url('account/post-step/', array('uniacid' => $uniacid, 'step' => 2)), 'error');
            }

            // 更新统一帐号默认子账号
            pdo_update('uni_account', array('default_acid' => $acid), array('uniacid' => $uniacid));
            if (empty($_W['isfounder'])) { // 如果用户不是创始人，则把当前用户添加为账号的主管理员
                uni_user_account_role($uniacid, $_W['uid'], ACCOUNT_MANAGE_NAME_OWNER);
            }

            if (!empty($_W['user']['owner_uid'])) { // 且把当前用户的上级作为副创始人角色
                uni_user_account_role($uniacid, $_W['user']['owner_uid'], ACCOUNT_MANAGE_NAME_VICE_FOUNDER);
            }
        // 如果是更新子账号
        } else {
            pdo_update('account', array('type' => ACCOUNT_TYPE_OFFCIAL_NORMAL, 'hash' => ''), array('acid' => $acid, 'uniacid' => $uniacid));
            unset($update['type']);
            pdo_update('account_wechats', $update, array('acid' => $acid, 'uniacid' => $uniacid));
        }
        if (parse_path($_GPC['qrcode'])) {
            copy($_GPC['qrcode'], IA_ROOT . '/attachment/qrcode_' . $acid . '.jpg');
        }
        if (parse_path($_GPC['headimg'])) {
            copy($_GPC['headimg'], IA_ROOT . '/attachment/headimg_' . $acid . '.jpg');
        }
        $oauth = uni_setting($uniacid, array('oauth')); // 获取统一帐号设置，并更新
        if ($acid && !empty($update['key']) && !empty($update['secret']) && empty($oauth['oauth']['account']) && $update['level'] == ACCOUNT_SERVICE_VERIFY) {
            pdo_update('uni_settings', array('oauth' => iserializer(array('account' => $acid, 'host' => $oauth['oauth']['host']))), array('uniacid' => $uniacid));
        }
        cache_delete("unisetting:{$uniacid}");

        // 通过重定向，自动跳转到第三步
        if (!empty($_GPC['uniacid']) || empty($_W['isfounder'])) {
            header("Location: " . url('account/post-step/', array('uniacid' => $uniacid, 'acid' => $acid, 'step' => 4)));
        } else {
            header("Location: " . url('account/post-step/', array('uniacid' => $uniacid, 'acid' => $acid, 'step' => 3)));
        }
        exit;
    }
} elseif ($step == 3) {
    $acid = intval($_GPC['acid']);
    $uniacid = intval($_GPC['uniacid']);
    if (empty($_W['isfounder'])) { // 只有创始人才可以操作
        itoast('您无权进行该操作！', '', '');
    }
    // ajax脚本请求用户信息
    if ($_GPC['get_type'] == 'userinfo' && $_W['ispost']) {
        $result = array();
        $uid = intval($_GPC['uid'][0]);
        $user = user_single(array('uid' => $uid));
        if (empty($user)) {
            iajax(-1, '用户不存在或是已经被删除', '');
        }
        $result['username'] = $user['username'];
        $result['uid'] = $user['uid'];
        $result['group'] = user_group_detail_info($user['groupid']);
        $result['package'] = iunserializer($result['group']['package']);
        iajax(0, $result, '');
        exit;
    }
    // 第三步提交
    if (checksubmit('submit')) {
        $uid = intval($_GPC['uid']);
        $groupid = intval($_GPC['groupid']); //用户权限组
        // 如果用户不空，则表示需要设置主管理员
        if (!empty($uid)) {
            // 用户所在用户组添加统一帐号的数量
            $create_account_info = permission_user_account_num($uid);
            if ($create_account_info['uniacid_limit'] <= 0 && (!user_is_founder($_W['uid']) || user_is_vice_founder())) {
                itoast("您所设置的主管理员所在的用户组可添加的公众号数量已达上限，请选择其他人做主管理员！", referer(), 'error');
            }
            // 删除该用户在统一帐号下所有映射记录
            pdo_delete('uni_account_users', array('uniacid' => $uniacid, 'uid' => $uid));
            // 获取该统一帐号的拥有者
            $owner = pdo_get('uni_account_users', array('uniacid' => $uniacid, 'role' => 'owner'));
            if (!empty($owner)) { // 更新该统一帐号的拥有着为当前用户
                pdo_update('uni_account_users', array('uid' => $uid), array('uniacid' => $uniacid, 'role' => 'owner'));
            } else { // 插入该统一帐号的拥有者为当前用户
                uni_user_account_role($uniacid, $uid, ACCOUNT_MANAGE_NAME_OWNER);
            }
            $user_vice_id = pdo_getcolumn('users', array('uid' => $uid), 'owner_uid');
            // 如果当前用户有上级用户，则设置统一帐号的副创建者
            if ($_W['user']['founder_groupid'] != ACCOUNT_MANAGE_GROUP_VICE_FOUNDER && !empty($user_vice_id)) {
                uni_user_account_role($uniacid, $user_vice_id, ACCOUNT_MANAGE_NAME_VICE_FOUNDER);
            }

        }
        if (!empty($_GPC['signature'])) {
            $signature = trim($_GPC['signature']);
            $setting = pdo_get('uni_settings', array('uniacid' => $_W['uniacid']));
            $notify = iunserializer($setting['notify']);
            $notify['sms']['signature'] = $signature;

            uni_setting_save('notify', $notify);
            $notify = serialize($notify);
            pdo_update('uni_settings', array('notify' => $notify), array('uniacid' => $uniacid));
        }
        $user = array(
            'uid' => $uid,
            'groupid' => $groupid, // 更新用户组id
        );
        if ($_GPC['is-set-endtime'] == 1 && !empty($_GPC['endtime'])) {
            $user['endtime'] = strtotime($_GPC['endtime']);
        } else {
            $user['endtime'] = 0;
        }
        if (!empty($user)) {
            user_update($user);
        }
        pdo_delete('uni_account_group', array('uniacid' => $uniacid));
        if (!empty($_GPC['package'])) {
            // 如果传入套餐id组，则先通过用户组id获取该组所包含的套餐id组
            $group = pdo_get('users_group', array('id' => $groupid));
            $group['package'] = iunserializer($group['package']);
            // 如果
            if (!is_array($group['package']) || !in_array('-1', $group['package'])) {
                foreach ($_GPC['package'] as $packageid) {
                    if (!empty($packageid)) {
                        pdo_insert('uni_account_group', array(
                            'uniacid' => $uniacid,
                            'groupid' => $packageid,
                        ));
                    }
                }
            }
        }
        // 如果额外添加模块和模板则放入额外套餐组
        if (!empty($_GPC['extra']['modules']) || !empty($_GPC['extra']['templates'])) {
            $data = array(
                'modules' => iserializer($_GPC['extra']['modules']),
                'templates' => iserializer($_GPC['extra']['templates']),
                'uniacid' => $uniacid,
                'name' => '',
            );
            $id = pdo_fetchcolumn("SELECT id FROM " . tablename('uni_group') . " WHERE uniacid = :uniacid", array(':uniacid' => $uniacid));
            if (empty($id)) {
                pdo_insert('uni_group', $data);
            } else {
                pdo_update('uni_group', $data, array('id' => $id));
            }
        } else { // 如果没有，则删除该统一帐号的额外套餐组
            pdo_delete('uni_group', array('uniacid' => $uniacid));
        }
        cache_delete("unisetting:{$uniacid}");
        cache_delete("unimodules:{$uniacid}:1");
        cache_delete("unimodules:{$uniacid}:");
        cache_delete("uniaccount:{$uniacid}");
        cache_delete("accesstoken:{$acid}");
        cache_delete("jsticket:{$acid}");
        cache_delete("cardticket:{$acid}");
        cache_delete(cache_system_key('proxy_wechatpay_account:'));
        cache_clean(cache_system_key('user_accounts'));

        if (!empty($_GPC['from'])) {
            itoast('公众号权限修改成功', url('account/post-step/', array('uniacid' => $uniacid, 'step' => 3, 'from' => 'list')), 'success');
        } else {
            header("Location: " . url('account/post-step/', array('uniacid' => $uniacid, 'acid' => $acid, 'step' => 4)));
            exit;
        }
    }

    $unigroups = uni_groups(); // 获取所有套餐组信息

    if (!empty($unigroups['modules'])) {
        foreach ($unigroups['modules'] as $module_key => $module_val) {
            if (file_exists(IA_ROOT . '/addons/' . $module_val['name'] . '/icon-custom.jpg')) {
                $unigroups['modules'][$module_key]['logo'] = tomedia(IA_ROOT . '/addons/' . $module_val['name'] . '/icon-custom.jpg');
            } else {
                $unigroups['modules'][$module_key]['logo'] = tomedia(IA_ROOT . '/addons/' . $module_val['name'] . '/icon.jpg');
            }
        }
    }

    $settings = uni_setting($uniacid, array('notify')); // 发送短信配置
    $notify = $settings['notify'] ? $settings['notify'] : array(); // 这是干什么？？

    // 统一帐号拥有者所在组所拥有的套餐组
    $ownerid = pdo_fetchcolumn("SELECT uid FROM " . tablename('uni_account_users') . " WHERE uniacid = :uniacid AND role = 'owner'", array(':uniacid' => $uniacid));
    if (!empty($ownerid)) {
        $owner = user_single(array('uid' => $ownerid));
        $owner['group'] = pdo_fetch("SELECT id, name, package FROM " . tablename('users_group') . " WHERE id = :id", array(':id' => $owner['groupid']));
        $owner['group']['package'] = iunserializer($owner['group']['package']);
    }

    $extend = pdo_fetch("SELECT * FROM " . tablename('uni_group') . " WHERE uniacid = :uniacid", array(':uniacid' => $uniacid));
    $extend['modules'] = iunserializer($extend['modules']);
    $extend['templates'] = iunserializer($extend['templates']);
    if (!empty($extend['modules'])) {
        $owner['extend']['modules'] = pdo_getall('modules', array('name' => $extend['modules']));
        if (!empty($owner['extend']['modules'])) {
            foreach ($owner['extend']['modules'] as &$extend_module) {
                if (file_exists(IA_ROOT . '/addons/' . $extend_module['name'] . '/icon-custom.jpg')) {
                    $extend_module['logo'] = tomedia(IA_ROOT . '/addons/' . $extend_module['name'] . '/icon-custom.jpg');
                } else {
                    $extend_module['logo'] = tomedia(IA_ROOT . '/addons/' . $extend_module['name'] . '/icon.jpg');
                }
            }
            unset($extend_module);
        }
    }
    if (!empty($extend['templates'])) {
        $owner['extend']['templates'] = pdo_getall('site_templates', array('id' => $extend['templates']));
    }
    // 统一帐号拥有的套餐组
    $extend['package'] = pdo_getall('uni_account_group', array('uniacid' => $uniacid), array(), 'groupid');
    $groups = user_group(); // 获取当前用户可用的所有用户组
    $modules = user_uniacid_modules($_W['uid']);
    $templates = pdo_fetchall("SELECT * FROM " . tablename('site_templates'));
} elseif ($step == 4) {
    $uniacid = intval($_GPC['uniacid']);
    $acid = intval($_GPC['acid']);
    $uni_account = pdo_get('uni_account', array('uniacid' => $uniacid));
    if (empty($uni_account)) {
        itoast('非法访问', '', '');
    }
    $account = account_fetch($uni_account['default_acid']); // 获取子账号对象
}
template('account/post-step' . $template_show);