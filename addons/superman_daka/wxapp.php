<?php
/**
 * 【超人】模块定义
 *
 * @author 超人
 * @url https://s.we7.cc/index.php?c=home&a=author&do=index&uid=59968
 */
defined('IN_IA') or exit('Access Denied');
require IA_ROOT.'/addons/superman_daka/class/errno.class.php';
class superman_dakaModuleWxapp extends WeModuleWxapp {
    public function json($errno, $errmsg = '', $data = array()) {
        ob_end_clean();
        if ($errmsg == '') {
            $errmsg = ERRNO::$ERRMSG[$errno];
        }
        $result = array(
            'errno' => $errno,
            'errmsg' => $errmsg,
            'data' => $data,
        );
        @header('Content-Type: application/json; charset=utf-8');
        exit(json_encode($result));
    }
    public function check_login() {
        global $_W;
        $this->_init_member();
        if (empty($_W['member'])) {
            $this->json(ERRNO::NOT_LOGIN);
        }
    }
    /*
     * 支付notify回调函数，无返回值
     */
    public function payResult($params) {
        global $_W;
        WeUtility::logging('info', "[superman_daka] payResult: params=".var_export($params, true).', siteurl='.$_W['siteurl'].', siteroot='.$_W['siteroot']);
        $paylog = pdo_get('core_paylog', array(
            'tid' => $params['tid'],
            'module' => 'superman_daka',
        ));
        if (empty($paylog)) {
            WeUtility::logging('fatal', "[superman_daka] payResult: paylog is null, tid={$params['tid']}");
            return;
        }
        $record = pdo_get('superman_daka_wxapp', array(
            'id' => $params['tid'],
        ));
        if (empty($record)) {
            WeUtility::logging('fatal', "[superman_daka] payResult: record is null, tid={$params['tid']}");
            return;
        }
        if ($paylog['fee'] != $record['amount'] || $paylog['status'] != 1) {
            WeUtility::logging('fatal', "[superman_daka] payResult: invalid fee, paylog=".var_export($paylog, true).", record=".var_export($record, true));
            return;
        }
        if ($record['status'] != 0) {
            WeUtility::logging('fatal', "[superman_daka] payResult: payed, record=".var_export($record, true));
            return;
        }
        if ($params['result'] == 'success'
            && $params['from'] == 'notify') {
            $data = array(
                'status' => 1, //已支付
                'payno' => $params['tag']['transaction_id'],
                'paytime' => $params['paytime']?$params['paytime']:TIMESTAMP,
            );
            $ret = pdo_update('superman_daka_wxapp', $data, array(
                'id' => $record['id'],
            ));
            if ($ret === false) {
                WeUtility::logging('fatal', "[superman_daka] payResult: id={$record['id']}, data=".var_export($data, true));
                return;
            }
            WeUtility::logging('info', "[superman_daka] payResult: success, id={$record['id']}");
        }
    }
    private function _init_member() {
        global $_W;
        $openid = $_W['openid']?$_W['openid']:($_SESSION['openid']?$_SESSION['openid']:($_W['fans']?$_W['fans']['openid']:''));
        if (empty($_W['member']) && !empty($openid)) {
            $_W['member'] = mc_fetch(mc_openid2uid($openid));
        }
        WeUtility::logging('info', "[superman_daka] init member, openid={$openid}, uid={$_W['member']['uid']}, nickname={$_W['member']['nickname']}");
    }
}