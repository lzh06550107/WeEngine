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
$act = in_array($_GPC['act'], array('index', 'list'))?$_GPC['act']:'index';
if ($act == 'index') {
    $sign_total = pdo_getcolumn('superman_daka_wxapp_stat', array(
        'uid' => $_W['member']['uid'],
    ), 'sign_total');
    $sql = "SELECT SUM(amount) FROM ".tablename('superman_daka_wxapp')." WHERE uid=:uid AND status>=1";
    $pay_total = pdo_fetchcolumn($sql, array(':uid' => $_W['member']['uid']));
    $sql = "SELECT SUM(reward) FROM ".tablename('superman_daka_wxapp')." WHERE uid=:uid";
    $reward_total = pdo_fetchcolumn($sql, array(':uid' => $_W['member']['uid']));
    $this->json(ERRNO::OK, '', array(
        'my' => array(
            'pay_total' => $pay_total?$pay_total:0.00,
            'reward_total' => $reward_total?$reward_total:0.00,
            'sign_total' => $sign_total?$sign_total:0,
            'imgbg' => $this->module['config']['wxapp']['my_imgbg']?tomedia($this->module['config']['wxapp']['my_imgbg']):'',
        ),
    ));
} else if ($act == 'list') {
    $pindex = max(1, intval($_GPC['page']));
    $pagesize = 20;
    $start = ($pindex - 1) * $pagesize;
    $condition = array(
        'uid' => $_W['member']['uid'],
        'status' => array(1, 2, 3),
    );
    $orderby = array('id DESC');
    $limit = array($pindex, $pagesize);
    $list = pdo_getall('superman_daka_wxapp', $condition, '', '', $orderby, $limit);
    if (!empty($list)) {
        foreach ($list as $li) {
            $result[] = array(
                'time' => substr($li['signdate'], 4, 2).'-'.substr($li['signdate'], 6, 2),
                'money' => $li['amount'],
                'status' => $li['status'],
                'timestamp' => TIMESTAMP,
                'paytime' => $li['paytime']?$li['paytime']:'',
            );
        }
    }
    $this->json(ERRNO::OK, '', array(
        'list' => $result,
    ));
}
