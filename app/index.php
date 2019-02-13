<?php
/**
 * [WeEngine System] Copyright (c) 20180322102317 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
define('IN_MOBILE', true);

require '../framework/bootstrap.inc.php';
load()->app('common');
load()->app('template');
require IA_ROOT . '/app/common/bootstrap.app.inc.php';

$acl = array(
    'home' => array(
        'default' => 'home',
    ),
    'mc' => array(
        'default' => 'home'
    )
);

if ($_W['setting']['copyright']['status'] == 1) {
    $_W['siteclose'] = true;
    message('抱歉，站点已关闭，关闭原因：' . $_W['setting']['copyright']['reason']);
}
$multiid = intval($_GPC['t']); // 站点id
if (empty($multiid)) { // 如果没有提供微站站点，则使用统一帐号默认站点
    $multiid = intval($unisetting['default_site']);
    unset($setting);
}
// 获取微站记录
$multi = pdo_fetch("SELECT * FROM " . tablename('site_multi') . " WHERE id=:id AND uniacid=:uniacid", array(':id' => $multiid, ':uniacid' => $_W['uniacid']));
$multi['site_info'] = @iunserializer($multi['site_info']);

// 如果提供微站样式，则使用，否则使用默认微站配置的样式
$styleid = !empty($_GPC['s']) ? intval($_GPC['s']) : intval($multi['styleid']);
// 获取样式记录
$style = pdo_fetch("SELECT * FROM " . tablename('site_styles') . " WHERE id = :id", array(':id' => $styleid));

// 获取使用的模板信息
$templates = uni_templates();
$templateid = intval($style['templateid']);
$template = $templates[$templateid];

$_W['template'] = !empty($template) ? $template['name'] : 'default'; // 记录模板名称
$_W['styles'] = array(); // 收集样式的配置变量

// 获取当前统一帐号下指定样式的配置变量
if (!empty($template) && !empty($style)) {
    $sql = "SELECT `variable`, `content` FROM " . tablename('site_styles_vars') . " WHERE `uniacid`=:uniacid AND `styleid`=:styleid";
    $params = array();
    $params[':uniacid'] = $_W['uniacid'];
    $params[':styleid'] = $styleid;
    $stylevars = pdo_fetchall($sql, $params);
    if (!empty($stylevars)) {
        foreach ($stylevars as $row) {
            if (strexists($row['variable'], 'img')) {
                $row['content'] = tomedia($row['content']);
            }
            $_W['styles'][$row['variable']] = $row['content'];
        }
    }
    unset($stylevars, $row, $sql, $params);
}

$_W['page'] = array();
$_W['page']['title'] = $multi['title']; // 站点标题作为页面标题
if (is_array($multi['site_info'])) {
    $_W['page'] = array_merge($_W['page'], $multi['site_info']); // 收集站点信息
}
unset($multi, $styleid, $style, $templateid, $template, $templates);

// ??
if ($controller == 'wechat' && $action == 'card' && $do == 'use') {
    header("location: index.php?i={$_W['uniacid']}&c=entry&m=paycenter&do=consume&encrypt_code={$_GPC['encrypt_code']}&card_id={$_GPC['card_id']}&openid={$_GPC['openid']}&source={$_GPC['source']}");
    exit;
}

// 收集控制器
$controllers = array();
$handle = opendir(IA_ROOT . '/app/source/');
if (!empty($handle)) {
    while ($dir = readdir($handle)) {
        if ($dir != '.' && $dir != '..') {
            $controllers[] = $dir;
        }
    }
}
if (!in_array($controller, $controllers)) {
    $controller = 'home'; // 默认控制器
}

// 优先执行控制器目录中的初始化文件
$init = IA_ROOT . "/app/source/{$controller}/__init.php";
if (is_file($init)) {
    require $init;
}

// 收集动作
$actions = array();
$handle = opendir(IA_ROOT . '/app/source/' . $controller);
if (!empty($handle)) {
    while ($dir = readdir($handle)) {
        if ($dir != '.' && $dir != '..' && strexists($dir, '.ctrl.php')) {
            $dir = str_replace('.ctrl.php', '', $dir);
            $actions[] = $dir;
        }
    }
}

if (empty($actions)) {
    $str = '';
    if (uni_is_multi_acid()) { // 如果统一帐号有多个子公众号，则需要指定子号id
        $str = "&j={$_W['acid']}";
    }
    header("location: index.php?i={$_W['uniacid']}{$str}&c=home?refresh");
}
if (!in_array($action, $actions)) {
    $action = $acl[$controller]['default'];
}
if (!in_array($action, $actions)) {
    $action = $actions[0];
}
require _forward($controller, $action);

function _forward($c, $a)
{
    $file = IA_ROOT . '/app/source/' . $c . '/' . $a . '.ctrl.php';
    return $file;
}