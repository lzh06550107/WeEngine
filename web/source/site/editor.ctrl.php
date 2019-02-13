<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');
load()->model('site');
load()->model('module');
load()->library('qrcode');

$do = !empty($do) ? $do : 'uc';
$do = in_array($do, array('quickmenu', 'uc', 'qrcode')) ? $do : 'uc';
permission_check_account_user('mc_member');

// 进入会员中心设计界面
if ($do == 'uc') {
    $_W['page']['title'] = '会员中心 - 微站功能';

    // 提交的
    if (!empty($_GPC['wapeditor'])) {
        $params = $_GPC['wapeditor']['params'];
        if (empty($params)) {
            itoast('请您先设计手机端页面.', '', 'error');
        }
        $params = json_decode(ihtml_entity_decode($params), true);
        if (empty($params)) {
            itoast('请您先设计手机端页面.', '', 'error');
        }
        $page = $params[0];
        $html = htmlspecialchars_decode($_GPC['wapeditor']['html'], ENT_QUOTES);
        $html = str_replace(array('<?', '<%', '<?php', '{php'), '_', $html);
        $html = preg_replace('/<\s*?script.*(src|language)+/i', '_', $html);
        $data = array(
            'uniacid' => $_W['uniacid'],
            'multiid' => '0',
            'title' => $page['params']['title'],
            'description' => $page['params']['description'],
            'type' => 3, // ??
            'status' => 1,
            'params' => stripslashes(ijson_encode($params, JSON_UNESCAPED_UNICODE)),
            'html' => $html,
            'createtime' => TIMESTAMP,
        );
        // 公众号的页面
        $id = pdo_fetchcolumn("SELECT id FROM " . tablename('site_page') . " WHERE uniacid = :uniacid AND type = '3'", array(':uniacid' => $_W['uniacid']));
        if (empty($id)) {
            pdo_insert('site_page', $data);
            $id = pdo_insertid();
        } else {
            pdo_update('site_page', $data, array('id' => $id));
        }
        if (!empty($page['params']['keyword'])) {
            $cover = array(
                'uniacid' => $_W['uniacid'],
                'title' => $page['params']['title'],
                'keyword' => $page['params']['keyword'],
                'url' => murl('mc/home', array(), true, false),
                'description' => $page['params']['description'],
                'thumb' => $page['params']['cover'],
                'module' => 'mc',
            );
            site_cover($cover);
        }
        $nav = json_decode(ihtml_entity_decode($_GPC['wapeditor']['nav']), true);
        $ids = array(0);
        if (!empty($nav)) {
            foreach ($nav as $row) {
                $data = array(
                    'uniacid' => $_W['uniacid'],
                    'name' => $row['name'],
                    'position' => 2,
                    'url' => $row['url'],
                    'icon' => '',
                    'css' => iserializer($row['css']),
                    'status' => $row['status'],
                    'displayorder' => 0,
                );
                if (!empty($row['id'])) {
                    pdo_update('site_nav', $data, array('id' => $row['id']));
                } else {
                    $data['status'] = 1;
                    pdo_insert('site_nav', $data);
                    $row['id'] = pdo_insertid();
                }
                $ids[] = $row['id'];
            }
        }
        pdo_delete('site_nav', array('uniacid' => $_W['uniacid'], 'position' => '2', 'id <>' => $ids));
        itoast('个人中心保存成功.', url('site/editor/uc'), 'success');
    }
    // 获取位置2的导航菜单
    $navs = pdo_fetchall("SELECT id, icon, css, name, module, status, url FROM " . tablename('site_nav') . " WHERE uniacid = :uniacid AND position = '2' ORDER BY displayorder DESC, id ASC", array(':uniacid' => $_W['uniacid']));
    if (!empty($navs)) {
        foreach ($navs as &$nav) {

            if (!empty($nav['module'])) {
                $nav['module_info'] = module_fetch($nav['module']);
            }
            if (!empty($nav['icon'])) {
                $nav['icon'] = tomedia($nav['icon']);
            }
            if (is_serialized($nav['css'])) {
                $nav['css'] = iunserializer($nav['css']);
            }
            if (empty($nav['css']['icon']['icon'])) {
                $nav['css']['icon']['icon'] = 'fa fa-external-link';
            }
        }
        unset($nav);
    }
    // 获取类型为3的页面
    $page = pdo_fetch("SELECT * FROM " . tablename('site_page') . " WHERE uniacid = :uniacid AND type = '3'", array(':uniacid' => $_W['uniacid']));

    template('site/editor');

    // 进入编辑快捷菜单界面，这个功能和微站编辑中的底部菜单重复？？
} elseif ($do == 'quickmenu') {
    $_W['page']['title'] = '快捷菜单 - 站点管理 - 微站功能';
    $multiid = intval($_GPC['multiid']);
    $type = intval($_GPC['type']) ? intval($_GPC['type']) : 2; // ??
    // 表示提交
    if ($_GPC['wapeditor']) {
        $params = $_GPC['wapeditor']['params'];
        if (empty($params)) {
            itoast('请您先设计手机端页面.', '', 'error');
        }
        $params = json_decode(html_entity_decode(urldecode($params)), true);
        if (empty($params)) {
            itoast('请您先设计手机端页面.', '', 'error');
        }
        $html = htmlspecialchars_decode($_GPC['wapeditor']['html'], ENT_QUOTES);
        $html = str_replace(array('<?', '<%', '<?php', '{php'), '_', $html);
        $html = preg_replace('/<\s*?script.*(src|language)+/i', '_', $html);
        $html = preg_replace('/background\-image\:(\s)*url\(\"(.*)\"\)/U', 'background-image: url($2)', $html);
        $data = array(
            'uniacid' => $_W['uniacid'],
            'multiid' => $multiid,
            'title' => '快捷菜单',
            'description' => '',
            'status' => intval($_GPC['status']),
            'type' => $type,
            'params' => json_encode($params),
            'html' => $html,
            'createtime' => TIMESTAMP,
        );
        if ($type == '4') {
            $id = pdo_fetchcolumn("SELECT id FROM " . tablename('site_page') . " WHERE uniacid = :uniacid AND type = :type", array(':uniacid' => $_W['uniacid'], ':type' => $type));
        } else {
            $id = pdo_fetchcolumn("SELECT id FROM " . tablename('site_page') . " WHERE multiid = :multiid AND type = :type", array(':multiid' => $multiid, ':type' => $type));
        }
        if (!empty($id)) {
            pdo_update('site_page', $data, array('id' => $id));
        } else {
            if ($type == 4) {
                $data['status'] = 1;
            }
            pdo_insert('site_page', $data);
            $id = pdo_insertid();
        }
        itoast('快捷菜单保存成功.', url('site/editor/quickmenu', array('multiid' => $multiid, 'type' => $type)), 'success');
    }

    if ($type == '4') { // 获取公众号类型为4的页面
        $page = pdo_fetch("SELECT * FROM " . tablename('site_page') . " WHERE type = :type AND uniacid = :uniacid", array(':type' => $type, ':uniacid' => $_W['uniacid']));
    } else { // 获取指定微站中指定类型的页面
        $page = pdo_fetch("SELECT * FROM " . tablename('site_page') . " WHERE multiid = :multiid AND type = :type", array(':multiid' => $multiid, ':type' => $type));
    }
    $modules = uni_modules();
    template('site/editor');

    // 把指定的链接生成二维码
} elseif ($do == 'qrcode') {
    $error_correction_level = "L";
    $matrix_point_size = "8";
    $text = trim($_GPC['text']); // 链接
    QRcode::png($text, false, $error_correction_level, $matrix_point_size);
}