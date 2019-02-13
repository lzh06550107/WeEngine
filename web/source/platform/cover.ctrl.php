<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 *
 * 公众号模块入口操作
 */
defined('IN_IA') or exit('Access Denied');
load()->model('reply');
load()->model('module');

$dos = array('module', 'post');
$do = in_array($do, $dos) ? $do : 'module';

$system_modules = system_modules();
if (!in_array($_GPC['m'], $system_modules) && $do == 'post') {
    permission_check_account_user('', true, 'cover');
}
define('IN_MODULE', true); // 开始进入模块

if ($do == 'module') {
    $modulename = $_GPC['m']; // 模块
    $entry_id = intval($_GPC['eid']); // 入口记录id
    $cover_keywords = array();
    if (empty($modulename)) {
        $entry = module_entry($entry_id);
        $modulename = $entry['module'];
    }
    // 设置当前模块
    $module = $_W['current_module'] = module_fetch($modulename);
    if (empty($module)) {
        itoast('模块不存在或是未安装', '', 'error');
    }
    // ？？
    if (!empty($module['isrulefields'])) {
        $url = url('platform/reply', array('m' => $module['name'], 'eid' => $entry_id));
    }
    if (empty($url)) {
        $url = url('platform/cover', array('m' => $module['name'], 'eid' => $entry_id));
    }
    define('ACTIVE_FRAME_URL', $url); // 默认打开的链接？？
    $entries = module_entries($modulename); // 获取模块所有菜单
    $sql = "SELECT b.`do`, a.`type`, a.`content` FROM " . tablename('rule_keyword') . " as a LEFT JOIN " . tablename('cover_reply') . " as b ON a.rid = b.rid WHERE b.uniacid = :uniacid AND b.module = :module";
    $params = array(':uniacid' => $_W['uniacid'], ':module' => $module['name']);
    $replies = pdo_fetchall($sql, $params); // 获取模块的所有自动回复规则
    foreach ($replies as $replay) {
        $cover_keywords[$replay['do']][] = $replay; // 动作和回复对象映射，就是关键字对应模块入口
    }
    // 判断用户是否有操作指定菜单权限
    $module_permission = permission_account_user_menu($_W['uid'], $_W['uniacid'], $modulename);
    foreach ($entries['cover'] as $key => &$cover) {
        $permission_name = $modulename . '_cover_' . trim($cover['do']);
        if ($module_permission[0] != 'all' && !in_array($permission_name, $module_permission)) {
            unset($entries['cover'][$key]);
        }
        if (!empty($cover_keywords[$cover['do']])) {
            $cover['cover']['rule']['keywords'] = $cover_keywords[$cover['do']]; // 记录关键字触发入口
        }
    }
    unset($cover);

    // 模块入口编辑，如用关键字触发回复入口图文消息
} elseif ($do == 'post') {
    $entry_id = intval($_GPC['eid']);
    if (empty($entry_id)) {
        itoast('访问错误', '', '');
    }
    $entry = module_entry($entry_id);
    if (is_error($entry)) {
        itoast('模块菜单不存在或是模块已经被删除', '', '');
    }
    $module = $_W['current_module'] = module_fetch($entry['module']);
    $reply = pdo_get('cover_reply', array('module' => $entry['module'], 'do' => $entry['do'], 'uniacid' => $_W['uniacid']));

    // 保存关键字自动回复模块入口设置
    if (checksubmit('submit')) {
        if (trim($_GPC['keywords']) == '') {
            itoast('必须输入触发关键字.', '', '');
        }
        $keywords = @json_decode(htmlspecialchars_decode($_GPC['keywords']), true);
        if (empty($keywords)) {
            itoast('必须填写有效的触发关键字.', '', '');
        }
        $rule = array(
            'uniacid' => $_W['uniacid'],
            'name' => $entry['title'],
            'module' => 'cover',
            'containtype' => '',
            'status' => $_GPC['status'] == 'true' ? 1 : 0,
            'displayorder' => intval($_GPC['displayorder_rule']),
        );
        if ($_GPC['istop'] == 1) {
            $rule['displayorder'] = 255; // 全局置顶
        } else {
            $rule['displayorder'] = range_limit($rule['displayorder'], 0, 254);
        }
        if (!empty($reply)) {
            $rid = $reply['rid'];
            $result = pdo_update('rule', $rule, array('id' => $rid));
        } else {
            $result = pdo_insert('rule', $rule);
            $rid = pdo_insertid();
        }

        if (!empty($rid)) {
            pdo_delete('rule_keyword', array('rid' => $rid, 'uniacid' => $_W['uniacid']));
            $keyword_row = array(
                'rid' => $rid,
                'uniacid' => $_W['uniacid'],
                'module' => 'cover',
                'status' => $rule['status'],
                'displayorder' => $rule['displayorder'],
            );
            foreach ($keywords as $keyword) {
                $keyword_insert = $keyword_row;
                $keyword_insert['type'] = range_limit($keyword['type'], 1, 4);
                $keyword_insert['content'] = $keyword['content'];
                pdo_insert('rule_keyword', $keyword_insert);
            }

            $entry = array(
                'uniacid' => $_W['uniacid'],
                'multiid' => 0,
                'rid' => $rid,
                'title' => $_GPC['rulename'],
                'description' => $_GPC['description'],
                'thumb' => $_GPC['thumb'],
                'url' => $entry['url'],
                'do' => $entry['do'],
                'module' => $entry['module'],
            );
            if (empty($reply['id'])) {
                pdo_insert('cover_reply', $entry);
            } else {
                pdo_update('cover_reply', $entry, array('id' => $reply['id']));
            }
            itoast('封面保存成功！', url('platform/cover', array('m' => $entry['module'])), 'success');
        } else {
            itoast('封面保存失败, 请联系网站管理员！', '', 'error');
        }
    }

    if (!empty($module['isrulefields'])) {
        $url = url('platform/reply', array('m' => $module['name']));
    }
    if (empty($url)) {
        $url = url('platform/cover', array('m' => $module['name']));
    }
    define('ACTIVE_FRAME_URL', $url);

    if (!empty($reply)) {
        if (!empty($reply['thumb'])) {
            $reply['src'] = tomedia($reply['thumb']);
        }
        $reply['rule'] = reply_single($reply['rid']);
        $reply['url_show'] = $entry['url_show'];
    } else {
        $reply = array(
            'title' => $entry['title'],
            'url_show' => $entry['url_show'],
            'rule' => array(
                'displayorder' => '0',
                'status' => '1'
            )
        );
    }
}
template('platform/cover');