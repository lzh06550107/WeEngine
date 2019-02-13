<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');
load()->model('module');
if (!empty($_W['uid'])) { // 如果用户登录，则跳转到
    header('Location: ' . url('account/display'));
    exit;
}


$settings = $_W['setting'];

// 如果设置自定义系统首页，则调用
if (!empty($settings['site_welcome_module'])) {
    $site = WeUtility::createModuleSystemWelcome($settings['site_welcome_module']);
    if (!is_error($site)) {
        exit($site->systemWelcomeDisplay());
    }
}

$copyright = $settings['copyright'];
$copyright['slides'] = iunserializer($copyright['slides']);
// 如果设置但为空，还是跳转到登录页面
if (isset($copyright['showhomepage']) && empty($copyright['showhomepage'])) {
    header("Location: " . url('user/login'));
    exit;
}
load()->model('article');
$notices = article_notice_home();
$news = article_news_home();
template('account/welcome');
