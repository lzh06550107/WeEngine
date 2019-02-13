<?php
//dezend by http://www.yunlu99.com/
define('IN_MOBILE', true);
require_once dirname(preg_replace('@\\(.*\\(.*$@', '', __FILE__)) . '/../../framework/bootstrap.inc.php';
include_once dirname(preg_replace('@\\(.*\\(.*$@', '', __FILE__)) . '/libs.php';
global $_W;
$data = file_get_contents('php://input');
libxml_disable_entity_loader(true);
$data = simplexml_load_string($data, 'SimpleXMLElement', LIBXML_NOCDATA);
$data = json_encode($data);
$data = json_decode($data, true);

if (empty($data)) {
    exit('fail');
    return true;
}

if ($data['result_code'] != 'SUCCESS' || $data['return_code'] != 'SUCCESS') {
    exit('fail');
    return true;
}

$order = DBUtil::getKanjiaOrder(' `openid`=:openid AND `uniontid`=:uniontid', array(':openid' => $data['openid'], ':uniontid' => $data['out_trade_no']));

if (!empty($order)) {
    if (DBUtil::updateKanjiaOrder(array('status' => 1), array('openid' => $data['openid'], 'uniontid' => $data['out_trade_no']))) {
        $kanjia = DBUtil::getKanjia(' `uniacid`=:uniacid AND `id`=:id', array(':uniacid' => $order['uniacid'], ':id' => $order['kid']));
        DBUtil::updateKanjia(array('product_sold' => $kanjia['product_sold'] + 1), array('uniacid' => $order['uniacid'], 'id' => $kanjia['id']));
        $account = WeAccount::create($order['acid']);
        $account->sendCustomNotice(array(
            'touser'  => $order['openid'],
            'msgtype' => 'text',
            'text'    => array('content' => urlencode('恭喜您，支付成功！
商品名称：' . $kanjia['product_name'] . '
下单时间：' . date('Y-m-d H:i:s', time()) . '
付款金额：' . $order['price'] . '元
付款状态：付款成功

感谢您的参与,祝您生活愉快。'))
        ));
        exit('success');
    }
}

?>