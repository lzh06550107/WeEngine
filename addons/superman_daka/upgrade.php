<?php
/**
 * 【超人】签到模块升级
 *
 * @author 超人
 * @url http://bbs.we7.cc/thread-9502-1-1.html
 */
defined('IN_IA') or exit('Access Denied');
$module_version = pdo_fetchcolumn("SELECT version FROM " . tablename('modules') . " WHERE name = :name", array(':name' => 'superman_daka'));
include IA_ROOT.'/addons/superman_daka/install.php';