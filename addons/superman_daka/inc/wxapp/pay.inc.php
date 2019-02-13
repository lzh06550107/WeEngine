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
    //不能支付的时间
    if (TIMESTAMP >= strtotime(date('Y-m-d 5:00:00'))
        && TIMESTAMP <= strtotime(date('Y-m-d 7:59:59'))) {
        $this->json(ERRNO::PARAM_ERROR, '打卡时间暂不能支付');
    }
    if (TIMESTAMP >= strtotime(date('Y-m-d 23:50:00'))
        && TIMESTAMP <= strtotime(date('Y-m-d 23:59:59'))) {
        $this->json(ERRNO::PARAM_ERROR, '结算时间暂不能支付');
    }
    $signdate = date('Ymd', strtotime('+1 day'));
    $record = pdo_get('superman_daka_wxapp', array(
        'uid' => $_W['member']['uid'],
        'signdate' => $signdate,
    ));
    $money = 1.00;
    if (empty($record)) {
        $data = array(
            'uniacid' => $_W['uniacid'],
            'uid' => $_W['member']['uid'],
            'signdate' => $signdate,
            'amount' => $money,
            'status' => 0,
            'inserttime' => TIMESTAMP,
        );
        pdo_insert('superman_daka_wxapp', $data);
        $id = pdo_insertid();
        if (empty($id)) {
            WeUtility::logging('fatal', '[superman_daka] pay: insert failed, data='.var_export($data, true));
            $this->json(ERRNO::SYSTEM_ERROR);
        }
    } else {
        if ($record['status'] != 0) {
            $this->json(ERRNO::INVALID_REQUEST, '请勿重复支付');
        }
        $id = $record['id'];
    }
    $params = array(
        'tid' => $id,
        'user' => $_W['openid'],
        'fee' => $money,
        'title' => '早起打卡',
    );
    $result = $this->pay($params);
    if (is_error($result)) {
        WeUtility::logging('fatal', '[pay] failed, result='.var_export($result, true));
        return $this->json(ERRNO::SYSTEM_ERROR, '支付失败，请重试');
    }
    $prepay_id = str_replace('prepay_id=', '', $result['package']);
    pdo_update('superman_daka_wxapp', array('prepay_id' => $prepay_id), array('id' => $id));
    WeUtility::logging('trace', "[superman_daka] pay: uniacid={$_W['uniacid']}, id=$id, prepay_id=$prepay_id");
    $this->json(ERRNO::OK, '', $result);
}