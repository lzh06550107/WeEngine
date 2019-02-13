<?php
/**
 * 【超人】签到模块卸载
 *
 * @author 超人
 * @url http://bbs.we7.cc/thread-9502-1-1.html
 */
defined('IN_IA') or exit('Access Denied');

$RUN_SQL = true;

if ($RUN_SQL) {
    $tablename = tablename('superman_daka_wxapp');
    $sql = "DROP TABLE IF EXISTS {$tablename}";
    pdo_query($sql);

    $tablename = tablename('superman_daka_wxapp_stat');
    $sql = "DROP TABLE IF EXISTS {$tablename}";
    pdo_query($sql);

    $tablename = tablename('superman_daka_wxapp_reward');
    $sql = "DROP TABLE IF EXISTS {$tablename}";
    pdo_query($sql);
}