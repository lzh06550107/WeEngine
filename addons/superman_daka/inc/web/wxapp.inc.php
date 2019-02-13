<?php
/**
 * 【超人】模块定义
 *
 * @author 超人
 * @url https://s.we7.cc/index.php?c=home&a=author&do=index&uid=59968
 */
defined('IN_IA') or exit('Access Denied');
require IA_ROOT.'/addons/superman_daka/class/wxpay.class.php';
global $_W, $_GPC;
$do = $_GPC['do'];
$act = in_array($_GPC['act'], array('display', 'signlog', 'reward', 'log'))?$_GPC['act']:'display';
if ($act == 'display') {
    $yestoday = date('Ymd', strtotime('-1 day'));
    $today = date('Ymd');
    $yestoday_stat = get_superman_daka_wxapp($yestoday);
    $today_stat = get_superman_daka_wxapp($today);
} else if ($act == 'signlog') {
    $op = in_array($_GPC['op'], array('display', 'post', 'delete', 'get_total'))?$_GPC['op']:'display';
    if ($op == 'display') {
        $pindex = max(1, intval($_GPC['page']));
        $pagesize = 20;
        $start = ($pindex - 1) * $pagesize;
        $filter = array(
            'uniacid' => $_W['uniacid'],
        );
        $sql = "SELECT COUNT(*) FROM ".tablename('superman_daka_wxapp').' WHERE uniacid=:uniacid';
        $total = pdo_fetchcolumn($sql, array(
            ':uniacid' => $_W['uniacid'],
        ));
        $orderby = array('id DESC');
        $limit = array($pindex, $pagesize);
        $list = pdo_getall('superman_daka_wxapp', array(
            'uniacid' => $_W['uniacid'],
        ), '', '', $orderby, $limit);
        if (!empty($list)) {
            foreach ($list as &$li) {
                $li['member'] = mc_fetch($li['uid'], array('nickname', 'avatar'));
                $li['inserttime'] = date('Y-m-d H:i:s', $li['inserttime']);
                $li['paytime'] = $li['paytime']?date('Y-m-d H:i:s', $li['paytime']):'';
                $li['updatetime'] = $li['updatetime']?date('Y-m-d H:i:s', $li['updatetime']):'';
                $li['signtime'] = $li['signtime']?date('Y-m-d H:i:s', $li['signtime']):'';
            }
            unset($li);
        }
    } else if ($op == 'post') {
        $id = $_GPC['id'];
        $item = pdo_get('superman_daka_wxapp', array('id' => $id));
        if (empty($item)) {
            message('记录不存在或已删除！', '', 'warning');
        }
        $item['member'] = mc_fetch($item['uid'], array('nickname', 'avatar'));
    }
} else if ($act == 'reward') {
    $op = in_array($_GPC['op'], array('display', 'init', 'post', 'send', 'get_total'))?$_GPC['op']:'display';
    if ($op == 'display') {
        $pindex = max(1, intval($_GPC['page']));
        $pagesize = 20;
        $start = ($pindex - 1) * $pagesize;
        $condition = array(
            'uniacid' => $_W['uniacid'],
        );
        $orderby = array('id DESC');
        $limit = array($pindex, $pagesize);
        $list = pdo_getall('superman_daka_wxapp_reward', $condition, '', '', $orderby, $limit);
        $sql = "SELECT COUNT(*) FROM ".tablename('superman_daka_wxapp_reward')." WHERE uniacid=:uniacid";
        $total = pdo_fetchcolumn($sql, array(
            ':uniacid' => $_W['uniacid'],
        ));
        $pager = pagination($total, $pindex, $pagesize);
    } else if ($op == 'init') {
        if (checksubmit()) {
            $signdate = date('Ymd', strtotime($_GPC['signdate']));
            $row = pdo_get('superman_daka_wxapp_reward', array(
                'uniacid' => $_W['uniacid'],
                'signdate' => $signdate,
            ));
            if (!empty($row)) {
                message('该日期（'.$signdate.'）已存在，请检查后重新提交！', '', 'error');
            }
            $sql = "SELECT SUM(amount) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND status>=1 AND signdate=:signdate";
            $total = pdo_fetchcolumn($sql, array(
                ':uniacid' => $_W['uniacid'],
                ':signdate' => $signdate,
            ));
            $data = array(
                'uniacid' => $_W['uniacid'],
                'signdate' => $signdate,
                'total' => $total,
                'operator' => $_W['username'],
                'updatetime' => TIMESTAMP,
            );
            pdo_insert('superman_daka_wxapp_reward', $data);
            $url = $this->createWebUrl('wxapp', array('act' => 'reward'));
            message('操作成功！', $url, 'success');
        }
    } else if ($op == 'post') {
        $setting = uni_setting(intval($_W['account']['uniacid']), array('payment'));
        $id = $_GPC['id'];
        $reward = pdo_get('superman_daka_wxapp_reward', array('id' => $id));
        if (empty($reward)) {
            message('数据不存在或已删除！', '', 'warning');
        }
        //发放总奖金
        $reward_total = '0.00';
        //发放总人数
        $member_total = 0;
        $sql = "SELECT COUNT(*) AS `count`,SUM(reward) AS `reward` FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status=3";
        $row = pdo_fetch($sql, array(
            ':uniacid' => $_W['uniacid'],
            ':signdate' => $reward['signdate'],
        ));
        if (!empty($row)) {
            $reward_total = $row['reward']?$row['reward']:'0.00';
            $member_total = $row['count'];
        }
        //总参与人数
        $sql = "SELECT COUNT(*) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status>0";
        $joined_total = pdo_fetchcolumn($sql, array(
            ':uniacid' => $_W['uniacid'],
            ':signdate' => $reward['signdate'],
        ));
        //成功
        $sql = "SELECT COUNT(*) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status>1";
        $succeed_total = pdo_fetchcolumn($sql, array(
            ':uniacid' => $_W['uniacid'],
            ':signdate' => $reward['signdate'],
        ));
        //失败
        $sql = "SELECT COUNT(*) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status=1";
        $failed_total = pdo_fetchcolumn($sql, array(
            ':uniacid' => $_W['uniacid'],
            ':signdate' => $reward['signdate'],
        ));
        if (checksubmit('optype')) {
            $data = array(
                'total' => $_GPC['total'],
                'lucky' => $_GPC['lucky'],
                'reward' => $_GPC['reward'],
                'lucky_uid' => $_GPC['lucky_uid'],
            );
            $ret = pdo_update('superman_daka_wxapp_reward', $data, array('id' => $id));
            if ($ret === false) {
                message('保存失败，请稍后重试！', '', 'error');
            }
            $reward = array_merge($reward, $data);

            //初始化幸运用户
            if ($reward['lucky'] && empty($reward['lucky_uid'])) {
                $row = pdo_get('superman_daka_wxapp', array(
                    'uniacid' => $_W['uniacid'],
                    'signdate' => $reward['signdate'],
                    'lucky' => 1,
                ));
                if (empty($row)) {
                    //SELECT * FROM `ims_superman_daka_wxapp` AS t1 JOIN (SELECT ROUND(RAND() * ((SELECT MAX(id) FROM `ims_superman_daka_wxapp`)-(SELECT MIN(id) FROM `ims_superman_daka_wxapp`))+(SELECT MIN(id) FROM `ims_superman_daka_wxapp`)) AS id) AS t2 WHERE t1.id >= t2.id ORDER BY t1.id LIMIT 1
                    $sql = "SELECT * FROM ".tablename('superman_daka_wxapp')." AS t1 JOIN (SELECT ROUND(RAND() * ((SELECT MAX(id) FROM ".tablename('superman_daka_wxapp').")-(SELECT MIN(id) FROM ".tablename('superman_daka_wxapp')."))+(SELECT MIN(id) FROM ".tablename('superman_daka_wxapp').")) AS id) AS t2 WHERE t1.uniacid=:uniacid AND t1.signdate=:signdate AND t1.id >= t2.id ORDER BY t1.id LIMIT 1";
                    $params = array(
                        ':uniacid' => $_W['uniacid'],
                        ':signdate' => $reward['signdate'],
                    );
                    $lucky_id = pdo_fetchcolumn($sql, $params);
                    pdo_update('superman_daka_wxapp', array(
                        'lucky' => 1,
                    ), array(
                        'id' => $lucky_id,
                    ));
                }
            }
            //--end

            if ($_GPC['optype'] == 'save_send') {
                $url = $this->createWebUrl('wxapp', array('act' => 'reward', 'op' => 'send', 'id' => $id));
                message('操作成功，即将跳转到发送奖金页面，请勿关闭浏览器！', $url, 'success');
            } else {
                $url = $this->createWebUrl('wxapp', array('act' => 'reward'));
                message('操作成功！', $url, 'success');
            }
        }
    } else if ($op == 'send') {
        @set_time_limit(0);
        @ini_set('memory_limit', '512M');
        $setting = uni_setting(intval($_W['account']['uniacid']), array('payment'));
        if (empty($setting['payment']['wechat_refund']['cert'])
            || empty($setting['payment']['wechat_refund']['key'])) {
            $url = wurl('wxapp/refund', array('version_id' => $_GPC['version_id']));
            message('未配置小程序退款接口证书，无法发送奖金！', $url, 'error');
        }
        $id = $_GPC['id'];
        $post_url = $this->createWebUrl('wxapp', array(
            'act' => 'reward',
            'op' => 'post',
            'id' => $id,
            'version_id' => $_GPC['version_id'],
        ));
        $redirect_url = $this->createWebUrl('wxapp', array(
            'act' => 'reward',
            'op' => 'send',
            'id' => $id,
            'version_id' => $_GPC['version_id'],
        ));
        $count = $_GPC['count'];
        $current = $_GPC['current']?$_GPC['current']:0;
        $progress = 0;
        $reward = pdo_get('superman_daka_wxapp_reward', array('id' => $id));
        if (empty($reward)) {
            message('非法请求！', $post_url, 'warning');
        }
        if (empty($count)) {
            $sql = "SELECT COUNT(*) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status=2 AND reward=0";
            $params = array(
                ':uniacid' => $_W['uniacid'],
                ':signdate' => $reward['signdate'],
            );
            $count = pdo_fetchcolumn($sql, $params);
        }
        $redirect_url .= "&count={$count}";
        $sql = "SELECT id,uid,lucky FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status=2 AND reward=0 ORDER BY id ASC LIMIT 1";
        $params = array(
            ':uniacid' => $_W['uniacid'],
            ':signdate' => $reward['signdate'],
        );
        $item = pdo_fetch($sql, $params);
        if (empty($item)) {
            if ($current > 0 && $count > 0 && $current >= $count) {
                $sql = "SELECT COUNT(*) AS `count`,SUM(reward) AS `reward` FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status=3";
                $row = pdo_fetch($sql, array(
                    ':uniacid' => $_W['uniacid'],
                    ':signdate' => $reward['signdate'],
                ));
                $url1 = $this->createWebUrl('wxapp', array('version_id' => $_GPC['version_id']));
                $url2 = $this->createWebUrl('wxapp', array('act' => 'reward', 'version_id' => $_GPC['version_id']));
                $msg = "操作完毕！<hr>发送总奖金：{$row['reward']}，总人数：{$row['count']}<br>";
                $msg .= "</div><div style='margin:-20px 0 40px 0;'><a target='_blank' href='{$url1}' style='color:#428bca;font-size:16px;'>返回早起打卡</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a target='_blank' href='{$url2}' style='color:#428bca;font-size:16px;'>返回奖金</a> ";
                message($msg, '', 'success');
            }
            message('打卡记录不存在或已发放奖金！', $post_url, 'error');
        }
        $money = $reward['reward'];
        if (empty($money) || $money < 0) {
            message('每人奖金未设置，无法发送奖金！', $post_url, 'error');
        }
        if ($reward['lucky']) {
            if ($reward['lucky_uid'] && $item['uid'] == $reward['lucky_uid']) { //指定幸运奖
                $money = $reward['lucky'];
            } else if ($item['lucky']) { //随机幸运奖
                $money = $reward['lucky'];
            }
        }
        $uid = $item['uid'];
        $openid = mc_uid2openid($uid);
        if (empty($openid)) {
            message("未查询到该用户(uid=$uid)的openid，无法发送奖金！", $post_url, 'error');
        }
        $params = array(
            'mch_appid' => $_W['account']['key'],
            'mchid' => $setting['payment']['wechat']['mchid'],
            'nonce_str' => random(32),
            'partner_trade_no' => date('Ymd').$item['id'].random(8, 1),
            'openid' => $openid,
            'check_name' => 'NO_CHECK',
            're_user_name' => '',
            'amount' => $money,
            'desc' => '早起打卡奖金-'.date('Ymd'),
            'spbill_create_ip' => CLIENT_IP,
        );
        $extra = array();
        $extra['sign_key'] = $setting['payment']['wechat']['signkey'];
        $extra['apiclient_cert'] = ATTACHMENT_ROOT.$this->module['config']['wxapp']['apiclient_cert'];
        $extra['apiclient_key'] = ATTACHMENT_ROOT.$this->module['config']['wxapp']['apiclient_key'];
        $extra['rootca'] = ATTACHMENT_ROOT.$this->module['config']['wxapp']['rootca'];
        $ret = WxpayAPI::pay($params, $extra);
        if (is_array($ret) && isset($ret['success'])) {
            $current++;
            $progress = intval(($current / $count) * 100);
            $redirect_url .= "&current={$current}";
            $ret = pdo_update('superman_daka_wxapp', array(
                'reward' => $money,
                'status' => 3,
            ), array(
                'id' => $item['id'],
            ));
            if ($ret === false) {
                message("更新数据库失败(id=$id,money=$money)！", '', 'error');
            }
        } else {
            $result = is_array($ret)?implode("<br>", $ret):$ret;
            message("发奖金失败，原因：<hr>{$result}", '', 'error');
        }
    } else if ($op == 'get_total') {
        $signdate = $_GPC['signdate'];
        $sql = "SELECT SUM(amount) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND status>=1 AND signdate=:signdate";
        $params = array(
            ':uniacid' => $_W['uniacid'],
            ':signdate' => $signdate,
        );
        $total = pdo_fetchcolumn($sql, $params);
        $result = array(
            'total' => SupermanUtil::float_format($total),
        );
        exit(json_encode($result));
    }
} else if ($act == 'log') {
    $logdate = $_GPC['logdate']?date('Ymd', strtotime($_GPC['logdate'])):date('Ymd');
    $filename = IA_ROOT."/addons/superman_daka/crontab/log/{$logdate}.log";
    if (file_exists($filename)) {
        $content = trim(file_get_contents($filename));
        $content = explode("\n", $content);
        $content = implode("<hr>", $content);
        $content = preg_replace('/(\[uniacid=[0-9]*\])/', '<strong class="blue">$1</strong>', $content);
        $content = preg_replace('/(\[fatal\])/', '<strong class="red">$1</strong>', $content);
    } else {
        $content = "日志文件不存在：{$logdate}.log";
    }
    $curdate = substr($logdate, 0, 4).'-'.substr($logdate, 4, 2).'-'.substr($logdate, 6, 2);
}
include $this->template('web/wxapp/index');

function get_superman_daka_wxapp($signdate) {
    global $_W;
    $data = array();
    $sql = "SELECT SUM(amount) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status>0";
    $reward = pdo_fetchcolumn($sql, array(
        ':uniacid' => $_W['uniacid'],
        ':signdate' => $signdate,
    ));
    $data['reward'] = $reward?$reward:'0.00';
    $data['reward'] = SupermanUtil::money_format($data['reward']);
    $sql = "SELECT COUNT(*) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status>0";
    $data['member'] = pdo_fetchcolumn($sql, array(
        ':uniacid' => $_W['uniacid'],
        ':signdate' => $signdate,
    ));
    $sql = "SELECT COUNT(*) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status>1";
    $data['success'] = pdo_fetchcolumn($sql, array(
        ':uniacid' => $_W['uniacid'],
        ':signdate' => $signdate,
    ));
    $sql = "SELECT COUNT(*) FROM ".tablename('superman_daka_wxapp')." WHERE uniacid=:uniacid AND signdate=:signdate AND status=1";
    $data['fail'] = pdo_fetchcolumn($sql, array(
        ':uniacid' => $_W['uniacid'],
        ':signdate' => $signdate,
    ));
    return $data;
}