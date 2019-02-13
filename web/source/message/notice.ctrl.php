<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */

defined('IN_IA') or exit('Access Denied');

$dos = array('display', 'change_read_status', 'event_notice', 'all_read');
$do = in_array($do, $dos) ? $do : 'display';
load()->model('message');

$_W['page']['title'] = '系统管理 - 消息提醒 - 消息提醒';

if (in_array($do, array('display', 'all_read'))) {
    $type = $types = intval($_GPC['type']);
    if ($type == MESSAGE_ACCOUNT_EXPIRE_TYPE) {
        $types = array(MESSAGE_ACCOUNT_EXPIRE_TYPE, MESSAGE_WECHAT_EXPIRE_TYPE, MESSAGE_WEBAPP_EXPIRE_TYPE);
    }

    // 通知类型为空，且为不为主创始人
    if (empty($type) && (!user_is_founder($_W['uid']) || user_is_vice_founder())) {
        // 各种到期和模块升级类型
        $types = array(MESSAGE_ACCOUNT_EXPIRE_TYPE, MESSAGE_WECHAT_EXPIRE_TYPE, MESSAGE_WEBAPP_EXPIRE_TYPE, MESSAGE_USER_EXPIRE_TYPE, MESSAGE_WXAPP_MODULE_UPGRADE);
    }

}

if ($do == 'display') {
    $message_id = intval($_GPC['message_id']);
    message_notice_read($message_id); // 更改某条消息为已读状态

    $pindex = intval($_GPC['page'], 1); // 获取页码
    $psize = 10;

    $message_table = table('message');
    $is_read = !empty($_GPC['is_read']) ? intval($_GPC['is_read']) : ''; // 是否读了

    if (!empty($is_read)) {
        $message_table->searchWithIsRead($is_read); // 搜索读还是未读信息
    }

    if (!empty($types)) { // 通知类型
        $message_table->searchWithType($types);
    }

    $message_table->searchWithPage($pindex, $psize);
    $lists = $message_table->messageList($type);

    $lists = message_list_detail($lists);

    $total = $message_table->getLastQueryTotal();
    $pager = pagination($total, $pindex, $psize);
}

if ($do == 'change_read_status') { // 哪里调用？？
    $id = $_GPC['id'];
    message_notice_read($id);
    iajax(0, '成功');
}

// common.js 460行调用
if ($do == 'event_notice') {
    if (!pdo_tableexists('message_notice_log')) {
        iajax(-1);
    }
    $message = message_event_notice_list();
    $cookie_name = $_W['config']['cookie']['pre'] . '__notice';
    if (empty($_COOKIE[$cookie_name]) || $_COOKIE[$cookie_name] < TIMESTAMP) {
        message_account_expire();
        message_notice_worker();
        message_sms_expire_notice();
        message_user_expire_notice();
        message_wxapp_modules_version_upgrade();
    }
    iajax(0, $message);
}

if ($do == 'all_read') {
    message_notice_all_read($types); // 把指定类型标记为已读
    if ($_W['isajax']) {
        iajax(0, '全部已读', url('message/notice', array('type' => $type)));
    }
    itoast('', referer()); // 显示消息并回到上一个请求
}
template('message/notice');