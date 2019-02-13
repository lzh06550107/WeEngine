<?php

defined('IN_IA') or exit('Access Denied');


load()->model('phoneapp');
$account_info = permission_user_account_num();

$do = safe_gpc_belong($do, array('create_display', 'save', 'display', 'del_version'), 'display');

$uniacid = intval($_GPC['uniacid']);

if (!empty($uniacid)) {
    $state = permission_account_user_role($_W['uid'], $uniacid);

    $role_permission = in_array($state, array(ACCOUNT_MANAGE_NAME_OWNER, ACCOUNT_MANAGE_NAME_FOUNDER, ACCOUNT_MANAGE_NAME_MANAGER, ACCOUNT_MANAGE_NAME_VICE_FOUNDER));

    if (!$role_permission) {
        itoast('无权限操作！', referer(), 'error');
    }
}

// 保存APP
if ($do == 'save') {
    $version_id = intval($_GPC['version_id']);
    if (empty($uniacid) && empty($account_info['phoneapp_limit']) && !user_is_founder($_W['uid'])) {
        iajax(-1, '创建APP个数已满', url('phoneapp/manage/create_display'));
    }

    $data = array(
        'uniacid' => $uniacid,
        'name' => safe_gpc_string($_GPC['name']),
        'description' => safe_gpc_string($_GPC['description']),
        'version' => safe_gpc_string($_GPC['version']),
        'modules' => iserializer(safe_gpc_array($_GPC['module'])),
        'createtime' => TIMESTAMP
    );

    if (empty($uniacid) && empty($version_id)) {
        $phoneapp_table = table('phoneapp');
        $result = $phoneapp_table->createPhoneApp($data);
    } else if (!empty($version_id)) { // 一个统一帐号有多个版本号
        unset($data['name']);
        $result = pdo_update('phoneapp_versions', $data, array('id' => $version_id, 'uniacid' => $uniacid));
        iajax(0, '修改成功', url('phoneapp/manage/display'), array('uniacid' => $uniacid));
    } else {
        unset($data['name']);
        $result = pdo_insert('phoneapp_versions', $data);
    }

    if (!empty($result)) {
        iajax(0, '创建成功', url('phoneapp/display'));
    }
    iajax(-1, '创建失败', url('phoneapp/manage/create_display'));
}

// 进入增加APP页面
if ($do == 'create_display') {
    $version_id = intval($_GPC['version_id']);
    $version_info = phoneapp_version($version_id);
    $modules = phoneapp_support_modules();
    template('phoneapp/create');
}

// 进入该统一帐号的版本页面，显示版本列表
if ($do == 'display') {
    $account = uni_fetch($uniacid);
    if (is_error($account)) {
        itoast($account['message'], url('account/manage', array('account_type' => ACCOUNT_TYPE_PHONEAPP_NORMAL)), 'error');
    } else {
        $phoneapp_table = table('phoneapp');
        $phoneapp_info = $phoneapp_table->phoneappAccountInfo($account['uniacid']);

        $version_exist = phoneapp_fetch($account['uniacid']);

        if (!empty($version_exist)) {
            $phoneapp_version_lists = phoneapp_version_all($account['uniacid']);
            $phoneapp_modules = phoneapp_support_modules();
        }
    }

    template('phoneapp/manage');
}

// 删除版本
if ($do == 'del_version') {
    $id = intval($_GPC['version_id']);
    if (empty($id)) {
        iajax(1, '参数错误！');
    }
    $version_exist = pdo_get('phoneapp_versions', array('id' => $id, 'uniacid' => $uniacid));
    if (empty($version_exist)) {
        iajax(1, '模块版本不存在！');
    }
    $result = pdo_delete('phoneapp_versions', array('id' => $id, 'uniacid' => $uniacid));
    if (!empty($result)) {
        iajax(0, '删除成功！', referer());
    } else {
        iajax(1, '删除失败，请稍候重试！');
    }
}