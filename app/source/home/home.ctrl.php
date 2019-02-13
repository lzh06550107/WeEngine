<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 *
 * 微站主页
 */
defined('IN_IA') or exit('Access Denied');
load()->model('app');
$multiid = intval($_GPC['t']);

// 如果没有传递站点id，则使用默认站点
if(empty($multiid)) {
	load()->model('account');
	$setting = uni_setting($_W['uniacid'], array('default_site'));
	$multiid = $setting['default_site'];
}
$title = $_W['page']['title'];

$navs = app_navs('home', $multiid); // 获取微站首页导航
$share_tmp = pdo_fetch('SELECT title,description,thumb FROM ' . tablename('cover_reply') . ' WHERE uniacid = :aid AND multiid = :id AND module = :m', array(':aid' => $_W['uniacid'], ':id' => $multiid, ':m' => 'site'));
$_share['imgUrl'] = tomedia($share_tmp['thumb']);
$_share['desc'] = $share_tmp['description'];
$_share['title'] = $share_tmp['title'];
$category_list = pdo_getall('site_category', array('uniacid' => $_W['uniacid'], 'multiid' => $multiid), array(), 'id');
if (!empty($multiid)) {
	isetcookie('__multiid', $multiid); // 记录微站id
}
template('home/home');