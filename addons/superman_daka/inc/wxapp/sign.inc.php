<?php
/**
 * 【超人】模块定义
 *
 * @author 超人
 * @url https://s.we7.cc/index.php?c=home&a=author&do=index&uid=59968
 */
defined('IN_IA') or exit('Access Denied');
global $_W, $_GPC;
$this->check_login();
$act = in_array($_GPC['act'], array('index'))?$_GPC['act']:'index';
if ($act == 'index') {
    $timestamp = TIMESTAMP;
    if ($timestamp < strtotime(date('Y-m-d 5:00:00'))
        && $timestamp > strtotime(date('Y-m-d 7:59:59'))) {
        WeUtility::logging('fatal', "[superman_daka] sign: 打卡时间已结束, uid={$_W['member']['uid']}");
        $this->json(ERRNO::PARAM_ERROR, '打卡时间已结束');
    }
    $signdate = date('Ymd');
    $record = pdo_get('superman_daka_wxapp', array(
        'uid' => $_W['member']['uid'],
        'signdate' => $signdate,
    ));
    if (empty($record)) {
        WeUtility::logging('fatal', "[superman_daka] sign: 非法打卡请求, uid={$_W['member']['uid']}");
        $this->json(ERRNO::INVALID_REQUEST, 'record null');
    }
    if ($record['status'] != 1) {
        WeUtility::logging('fatal', "[superman_daka] sign: 未支付不允许打卡, uid={$_W['member']['uid']}");
        $this->json(ERRNO::INVALID_REQUEST, 'no pay');
    }
    list($millisecond, $second) = explode(' ', microtime());
    $data = array(
        'status' => 2, //已打卡
        'signtime' => $timestamp,
        'millisecond' => $millisecond*10000,
    );
    $ret = pdo_update('superman_daka_wxapp', $data, array('id' => $record['id']));
    if ($ret === false) {
        WeUtility::logging('fatal', "[superman_daka] sign: superman_daka_wxapp update failed, id={$record['id']}, data=".var_export($data, true));
        $this->json(ERRNO::SYSTEM_ERROR);
    }
    $row = pdo_get('superman_daka_wxapp_stat', array('uid' => $_W['member']['uid']));
    if (empty($row)) {
        pdo_insert('superman_daka_wxapp_stat', array(
            'uniacid' => $_W['uniacid'],
            'uid' => $_W['member']['uid'],
            'sign_total' => 1,
            'updatetime' => $timestamp,
        ));
        if (!pdo_insertid()) {
            WeUtility::logging('fatal', "[superman_daka] sign: superman_daka_wxapp_stat insert failed, uid={$_W['member']['uid']}");
        }
    } else {
        $ret = pdo_update('superman_daka_wxapp_stat', array(
            'sign_total' => $row['sign_total'] + 1,
            'updatetime' => $timestamp,
        ), array(
            'id' => $row['id'],
        ));
        if ($ret === false) {
            WeUtility::logging('fatal', "[superman_daka] sign: superman_daka_wxapp_stat update failed, uid={$_W['member']['uid']}");
        }
    }
    WeUtility::logging('info', "[superman_daka] sign: 打卡成功, uid={$_W['member']['uid']}");
    $this->json(ERRNO::OK);
}
