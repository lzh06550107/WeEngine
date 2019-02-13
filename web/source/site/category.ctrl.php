<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

load()->model('article');

$do = !empty($do) ? $do : 'display';
$do = in_array($do, array('display', 'post', 'delete', 'change_status')) ? $do : 'display';
permission_check_account_user('platform_site');

// 显示文章分类
if ($do == 'display') {
    $children = array();
    // 获取统一帐号的所有文章分类
    $category = pdo_fetchall("SELECT * FROM " . tablename('site_category') . " WHERE uniacid = '{$_W['uniacid']}' ORDER BY parentid, displayorder DESC, id");
    foreach ($category as $index => $row) {
        if (!empty($row['parentid'])) {
            $children[$row['parentid']][] = $row;
            unset($category[$index]);
        }
    }
    template('site/category-display');

    // 添加或编辑分类
} elseif ($do == 'post') {
    $parentid = intval($_GPC['parentid']);
    $id = intval($_GPC['id']); // 默认为0
    $setting = uni_setting($_W['uniacid'], array('default_site'));
    $site_styleid = pdo_fetchcolumn('SELECT styleid FROM ' . tablename('site_multi') . ' WHERE id = :id', array(':id' => $setting['default_site']));
    if ($site_styleid) {
        $site_template = pdo_fetch("SELECT a.*,b.name,b.sections FROM " . tablename('site_styles') . ' AS a LEFT JOIN ' . tablename('site_templates') . ' AS b ON a.templateid = b.id WHERE a.uniacid = :uniacid AND a.id = :id', array(':uniacid' => $_W['uniacid'], ':id' => $site_styleid));
    }

    $styles = pdo_fetchall("SELECT a.*, b.name AS tname, b.title FROM " . tablename('site_styles') . ' AS a LEFT JOIN ' . tablename('site_templates') . ' AS b ON a.templateid = b.id WHERE a.uniacid = :uniacid', array(':uniacid' => $_W['uniacid']), 'id');
    if (!empty($id)) {
        $category = pdo_fetch("SELECT * FROM " . tablename('site_category') . " WHERE id = '$id' AND uniacid = {$_W['uniacid']}");
        if (empty($category)) {
            itoast('分类不存在或已删除', '', 'error');
        }
        if (!empty($category['css'])) {
            $category['css'] = iunserializer($category['css']);
        } else {
            $category['css'] = array();
        }
    } else {
        $category = array(
            'displayorder' => 0,
            'css' => array(),
        );
    }
    if (!empty($parentid)) {
        $parent = pdo_fetch("SELECT id, name FROM " . tablename('site_category') . " WHERE id = '$parentid'");
        if (empty($parent)) {
            itoast('抱歉，上级分类不存在或是已经被删除！', url('site/category/display'), 'error');
        }
    }

    $category['style'] = $styles[$category['styleid']];
    $category['style']['tname'] = empty($category['style']['tname']) ? 'default' : $category['style']['tname'];
    if (!empty($category['nid'])) {
        $category['nav'] = pdo_get('site_nav', array('id' => $category['nid']));
    } else {
        $category['nav'] = array();
    }
    // 统一公众号拥有的站点
    $multis = pdo_getall('site_multi', array('uniacid' => $_W['uniacid']), array(), 'id');

    if (checksubmit('submit')) {
        if (empty($_GPC['cname'])) {
            itoast('抱歉，请输入分类名称！', '', '');
        }
        $data = array(
            'uniacid' => $_W['uniacid'],
            'name' => $_GPC['cname'], // 分类名称
            'displayorder' => intval($_GPC['displayorder']), // 分类的显示顺序，越大则越靠前
            'parentid' => intval($parentid), // 父分类
            'description' => $_GPC['description'], // 分类描述
            'styleid' => intval($_GPC['styleid']), // 分类所在主题
            'linkurl' => $_GPC['linkurl'], // 直接链接
            'ishomepage' => intval($_GPC['ishomepage']), // 是否作为首页使用
            'enabled' => intval($_GPC['enabled']), // 是否启用
            'icontype' => intval($_GPC['icontype']), // 图标类型
            'multiid' => intval($_GPC['multiid']) // 分配到微站
        );

        // 系统内置图标
        if ($data['icontype'] == 1) {
            $data['icon'] = '';
            $data['css'] = serialize(array(
                'icon' => array(
                    'font-size' => $_GPC['icon']['size'], // 图标大小
                    'color' => $_GPC['icon']['color'], // 图标颜色
                    'width' => $_GPC['icon']['size'],
                    'icon' => empty($_GPC['icon']['icon']) ? 'fa fa-external-link' : $_GPC['icon']['icon'], // 使用的系统图标
                ),
            ));
        } else { // 自定义上传图标
            $data['css'] = '';
            $data['icon'] = $_GPC['iconfile']; // 上传的图标
        }

        $isnav = intval($_GPC['isnav']); // 是否添加微站首页导航
        if ($isnav) { // 如果添加微站首页导航，则插入site_nav中
            $nav = array(
                'uniacid' => $_W['uniacid'],
                'categoryid' => $id,
                'displayorder' => $_GPC['displayorder'],
                'name' => $_GPC['cname'],
                'description' => $_GPC['description'],
                'url' => "./index.php?c=site&a=site&cid={$category['id']}&i={$_W['uniacid']}",
                'status' => 1,
                'position' => 1,
                'multiid' => intval($_GPC['multiid']),
            );
            if ($data['icontype'] == 1) {
                $nav['icon'] = '';
                $nav['css'] = serialize(array(
                    'icon' => array(
                        'font-size' => $_GPC['icon']['size'],
                        'color' => $_GPC['icon']['color'],
                        'width' => $_GPC['icon']['size'],
                        'icon' => empty($_GPC['icon']['icon']) ? 'fa fa-external-link' : $_GPC['icon']['icon'],
                    ),
                    'name' => array(
                        'color' => $_GPC['icon']['color'],
                    ),
                ));
            } else {
                $nav['css'] = '';
                $nav['icon'] = $_GPC['iconfile'];
            }
            if ($category['nid']) {
                $nav_exist = pdo_fetch('SELECT id FROM ' . tablename('site_nav') . ' WHERE id = :id AND uniacid = :uniacid', array(':id' => $category['nid'], ':uniacid' => $_W['uniacid']));
            } else {
                $nav_exist = '';
            }
            if (!empty($nav_exist)) { // 如果存在站点首页导航，则更新
                pdo_update('site_nav', $nav, array('id' => $category['nid'], 'uniacid' => $_W['uniacid']));
            } else {
                pdo_insert('site_nav', $nav);
                $nid = pdo_insertid();
                $data['nid'] = $nid;
            }
        } else { // 不添加到微站首页导航
            if ($category['nid']) {
                $data['nid'] = 0;
                pdo_delete('site_nav', array('id' => $category['nid'], 'uniacid' => $_W['uniacid']));
            }
        }
        if (!empty($id)) {
            unset($data['parentid']);
            pdo_update('site_category', $data, array('id' => $id));
        } else {
            pdo_insert('site_category', $data);
            $id = pdo_insertid();
            $nav_url['url'] = "./index.php?c=site&a=site&cid={$id}&i={$_W['uniacid']}";
            pdo_update('site_nav', $nav_url, array('id' => $data['nid'], 'uniacid' => $_W['uniacid']));
        }
        itoast('更新分类成功！', url('site/category'), 'success');
    }

    template('site/category-post');

    // 删除分类
} elseif ($do == 'delete') {
    if (checksubmit('submit')) {
        foreach ($_GPC['rid'] as $key => $id) {
            $category_delete = article_category_delete($id);
            if (empty($category_delete)) {
                itoast('抱歉，分类不存在或是已经被删除！', referer(), 'error');
            }
        }
        itoast('分类批量删除成功！', referer(), 'success');
    } else {
        $id = intval($_GPC['id']);
        $category_delete = article_category_delete($id);
        if (empty($category_delete)) {
            itoast('抱歉，分类不存在或是已经被删除！', referer(), 'error');
        }
        itoast('分类删除成功！', referer(), 'success');
    }

    // 关闭和开启分类
} else if ($do == 'change_status') {
    $id = intval($_GPC['id']);
    $category_exist = pdo_get('site_category', array('id' => $id, 'uniacid' => $_W['uniacid']));
    if (!empty($category_exist)) {
        $status = $category_exist['enabled'] == 1 ? 0 : 1;
        $result = pdo_update('site_category', array('enabled' => $status), array('id' => $id));
        if ($result) {
            iajax(0, '更改成功！', url('site/category'));
        } else {
            iajax(1, '更改失败！', '');
        }
    } else {
        iajax(-1, '分类不存在！', '');
    }
}