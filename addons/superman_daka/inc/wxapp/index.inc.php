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
    if ($timestamp >= strtotime(date('Y-m-d 5:00:00'))
        && $timestamp <= strtotime(date('Y-m-d 7:59:59'))) {
        $signdate = date('Ymd', strtotime('-1 day'));
    } else if ($timestamp > strtotime(date('Y-m-d 7:59:59'))) {
        $signdate = date('Ymd', strtotime('+1 day'));
    } else {
        $signdate = date('Ymd');
    }
    WeUtility::logging('trace', '[superman_daka] index: signdate='.$signdate);
    $record = pdo_get('superman_daka_wxapp', array(
        'uid' => $_W['member']['uid'],
        'signdate' => $signdate,
    ));
    //挑战成功
    $sql = "SELECT COUNT(*) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status>=2";
    $sign_success = pdo_fetchcolumn($sql, array(
        ':uniacid' => $_W['uniacid'],
        ':signdate' => date('Ymd'),
    ));
    //挑战失败
    $sql = "SELECT COUNT(*) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status=1";
    $sign_fail = pdo_fetchcolumn($sql, array(
        ':uniacid' => $_W['uniacid'],
        ':signdate' => date('Ymd'),
    ));
    //总参与人数
    $sql = "SELECT COUNT(*) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status>=1";
    $total = pdo_fetchcolumn($sql, array(
        ':uniacid' => $_W['uniacid'],
        ':signdate' => $signdate,
    ));
    //总金额
    $sql = "SELECT SUM(amount) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status>=1";
    $params = array(
        ':uniacid' => $_W['uniacid'],
        ':signdate' => $signdate,
    );
    $amount = pdo_fetchcolumn($sql, array(
        ':uniacid' => $_W['uniacid'],
        ':signdate' => $signdate,
    ));
    //第一个签到时间
    $sql = "SELECT uid,signtime FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status>=2 ORDER BY signtime ASC, id ASC LIMIT 1";
    $row = pdo_fetch($sql, array(
        ':uniacid' => $_W['uniacid'],
        ':signdate' => date('Ymd'),
    ));
    if (!empty($row)) {
        $first = mc_fetch($row['uid'], array('nickname', 'avatar'));
        if (!empty($first)) {
            $first['signtime'] = date('Y-m-d H:i:s', $row['signtime']);
            $first['signtime_short'] = date('H:i:s', $row['signtime']);
        }
    }
    //运气之星
    $sql = "SELECT uid,MAX(reward) AS reward FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status=3";
    $row = pdo_fetch($sql, array(
        ':uniacid' => $_W['uniacid'],
        ':signdate' => date('Ymd'),
    ));
    if (!empty($row)) {
        $lucky = mc_fetch($row['uid'], array('nickname', 'avatar'));
        if (!empty($lucky)) {
            $lucky['reward'] = $row['reward'];
        }
    }
    //毅力之星(总签到数)
    $sql = "SELECT uid,MAX(sign_total) AS sign_total FROM ".tablename('superman_daka_wxapp_stat')." WHERE uniacid=:uniacid ORDER BY id ASC LIMIT 1";
    $row = pdo_fetch($sql, array(
        ':uniacid' => $_W['uniacid'],
    ));
    if (!empty($row)) {
        $stamina = mc_fetch($row['uid'], array('nickname', 'avatar'));
        if (!empty($stamina)) {
            $stamina['sign_total'] = $row['sign_total'];
        }
    }
    $result = array(
        'index' => array(
            'status' => !empty($record['status'])?$record['status']:0,
            'paytime' => $record['paytime'],
            'total' => $total?$total:0,
            'amount' => $amount?$amount:0.00,
            'sign_success' => $sign_success?$sign_success:0,
            'sign_fail' => $sign_fail?$sign_fail:0,
            'zq_url' => $first['avatar']?$first['avatar']:'',
            'zq_name' => $first['nickname']?$first['nickname']:'',
            'zq_time' => $first['signtime_short']?$first['signtime_short']:'',
            'yq_url' => $lucky['avatar']?$lucky['avatar']:'',
            'yq_name' => $lucky['nickname']?$lucky['nickname']:'',
            'yq_money' => $lucky['reward']?$lucky['reward']:'',
            'yl_url' => $stamina['avatar']?$stamina['avatar']:'',
            'yl_name' => $stamina['nickname']?$stamina['nickname']:'',
            'yl_count' => $stamina['sign_total']?$stamina['sign_total']:'',
            'rule' => htmlspecialchars_decode($this->module['config']['wxapp']['rule']),
            'imgbg' => $this->module['config']['wxapp']['index_imgbg']?tomedia($this->module['config']['wxapp']['index_imgbg']):'',
            'timestamp' => TIMESTAMP,
        )
    );
    WeUtility::logging('info', "[superman_daka] index: result=".var_export($result, true));
    $this->json(ERRNO::OK, '', $result);
}
