<?php
/**
 * 【超人】微信支付接口
 *
 * @author 超人
 * @url
 */
defined('IN_IA') or exit('Access Denied');
class WxpayAPI
{
    private static $debug = true;
    private static $pay_url = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers';
    private static $query_url = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/gettransferinfo';
    private static $sendredpack_url = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack';
    private static $refund_url = 'https://api.mch.weixin.qq.com/secapi/pay/refund';

    /*
     * 微信支付：企业付款API（http://pay.weixin.qq.com/wiki/doc/api/mch_pay.php?chapter=14_2）
     */
    public static function pay($params, $extra = array())
    {
        $data = array(
            'mch_appid' => $params['mch_appid'],
            'mchid' => $params['mchid'],
            'nonce_str' => $params['nonce_str'],
            'partner_trade_no' => $params['partner_trade_no'],
            'openid' => $params['openid'],
            'check_name' => $params['check_name'],
            're_user_name' => $params['re_user_name'],
            'amount' => $params['amount'] * 100,
            'desc' => $params['desc'],
            'spbill_create_ip' => $params['spbill_create_ip'],
        );
        $sign = self::sign($data, $extra['sign_key']);
        $xml_data = "<xml><mch_appid>{$data['mch_appid']}</mch_appid><mchid>{$data['mchid']}</mchid><nonce_str>{$data['nonce_str']}</nonce_str><partner_trade_no>{$data['partner_trade_no']}</partner_trade_no><openid>{$data['openid']}</openid><check_name>{$data['check_name']}</check_name><re_user_name>{$data['re_user_name']}</re_user_name><amount>{$data['amount']}</amount><desc>{$data['desc']}</desc><spbill_create_ip>{$data['spbill_create_ip']}</spbill_create_ip><sign>{$sign}</sign></xml>";
        $headers = array();
        $headers['Content-Type'] = 'application/x-www-form-urlencoded'; //request post
        $headers['CURLOPT_SSL_VERIFYPEER'] = false;
        $headers['CURLOPT_SSL_VERIFYHOST'] = false;
        $headers['CURLOPT_SSLCERTTYPE'] = 'PEM';
        $headers['CURLOPT_SSLCERT'] = $extra['apiclient_cert'];
        $headers['CURLOPT_SSLKEYTYPE'] = 'PEM';
        $headers['CURLOPT_SSLKEY'] = $extra['apiclient_key'];
        if (!empty($extra['rootca'])) {
            $headers['CURLOPT_CAINFO'] = $extra['rootca'];
        }
        if (self::$debug) {
            WeUtility::logging('trace', 'xml_data='.$xml_data);
            WeUtility::logging('trace', 'headers='.var_export($headers, true));
        }
        load()->func('communication');
        $response = ihttp_request(self::$pay_url, $xml_data, $headers);
        if ($response == '') {
            return '[wxpay-api:pay] response NULL';
        }
        $response = $response['content'];
        if (self::$debug) {
            WeUtility::logging('trace', '[wxpay-api:pay] response=' . $response);
        }
        $xml = @simplexml_load_string($response);
        if (empty($xml)) {
            return '[wxpay-api:pay] parse xml NULL';
        }
        if (self::$debug) {
            WeUtility::logging('trace', 'xml='.var_export($xml, true));
        }
        $return_code = $xml->return_code?(string) $xml->return_code:'';
        $return_msg = $xml->return_msg?(string) $xml->return_msg:'';
        $result_code = $xml->result_code?(string) $xml->result_code:'';
        $err_code = $xml->err_code?(string) $xml->err_code:'';
        $err_code_des = $xml->err_code_des?(string) $xml->err_code_des:'';

        if ($return_code=='SUCCESS' && $result_code=='SUCCESS') {
            $ret = array(
                'success' => true,
                'partner_trade_no' => $xml->partner_trade_no,
                'payment_no' => $xml->payment_no,
                'payment_time' => $xml->payment_time,
            );
            return $ret;
        } else {
            return $return_code.':'.$return_msg.','.$err_code.':'.$err_code_des;
        }
    }

    public static function query($params)
    {
        //TODO
    }

    /*
     * 微信支付：公众号支付申请退款（https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_4）
     */
    public static function refund($params, $extra = array()) {
        $data = array(
            'appid' => $params['appid'],
            'mch_id' => $params['mch_id'],                  //商户号
            'nonce_str' => $params['nonce_str'],            //随机字符串
            'transaction_id' => $params['transaction_id'],  //微信订单号
            'out_refund_no' => $params['out_refund_no'],    //商户退款单号
            'total_fee' => floatval($params['total_fee'])*100,      //总金额
            'refund_fee' => floatval($params['refund_fee'])*100,    //退款金额
            'op_user_id' => $params['mch_id'],                  //操作员帐号, 默认为商户号
            'refund_account' => 'REFUND_SOURCE_UNSETTLED_FUNDS',    //退款资金来源, 默认未结算资金退款.refund_account=1
        );
        if ($params['refund_account'] == 2) {
            $data['refund_account'] = 'REFUND_SOURCE_RECHARGE_FUNDS';   //可用余额退款.refund_account=2
        }
        $xml_data = '<xml>';
        foreach ($data as $k=>$v) {
            $xml_data .= "<{$k}>{$v}</{$k}>";
        }
        $sign = self::sign($data, $extra['sign_key']);
        $xml_data .= "<sign>{$sign}</sign>";
        $xml_data .= '</xml>';
        $headers = array();
        $headers['Content-Type'] = 'application/x-www-form-urlencoded'; //request post
        $headers['CURLOPT_SSL_VERIFYPEER'] = false;
        $headers['CURLOPT_SSL_VERIFYHOST'] = false;
        $headers['CURLOPT_SSLCERTTYPE'] = 'PEM';
        $headers['CURLOPT_SSLCERT'] = $extra['apiclient_cert'];
        $headers['CURLOPT_SSLKEYTYPE'] = 'PEM';
        $headers['CURLOPT_SSLKEY'] = $extra['apiclient_key'];
        if (!empty($extra['rootca'])) {
            $headers['CURLOPT_CAINFO'] = $extra['rootca'];
        }
        if (self::$debug) {
            WeUtility::logging('trace', '[Wxpay:refund] xml_data='.$xml_data);
            WeUtility::logging('trace', '[Wxpay:refund] headers='.var_export($headers, true));
        }
        load()->func('communication');
        $response = ihttp_request(self::$refund_url, $xml_data, $headers);
        if ($response == '' || $response['status'] != 'OK') {
            WeUtility::logging('warning', '[Wxpay:refund]response NULL');
            return error(ERRNO::INVALID_REQUEST, '请求失败，请稍后再试');
        }
        $response = $response['content'];
        //禁止引用外部xml实体
        libxml_disable_entity_loader(true);
        $xmlstring = @simplexml_load_string($response, 'SimpleXMLElement', LIBXML_NOCDATA);
        $val = json_decode(json_encode($xmlstring), true);
        if (self::$debug) {
            WeUtility::logging('trace', '[Wxpay:refund] val='.var_export($val, true));
        }
        if (!empty($val) && $val['return_code'] === 'SUCCESS') {   //查询成功
            if ($val['result_code'] === 'SUCCESS') {
                return $val;
            } else {
                WeUtility::logging('fatal', '');
                return error(ERRNO::ORDER_REFUND_FAIL, '退款失败，错误原因：'.$val['err_code'].':'.$val['err_code_des']);
            }
        } else {
            WeUtility::logging('fatal', '');
            return error(ERRNO::ORDER_REFUND_FAIL, '通信失败，错误原因：'.$val['return_msg']);
        }
    }
    /*
     * 微信支付：现金红包（https://pay.weixin.qq.com/wiki/doc/api/cash_coupon.php?chapter=13_5）
     */
    public static function sendredpack($params, $extra = array(), $query_result = false)
    {
        $data = array(
            'nonce_str' => $params['nonce_str'],
            'mch_billno' => $params['mch_billno'],
            'mch_id' => $params['mch_id'],
            'wxappid' => $params['wxappid'],
            'send_name' => mb_substr($params['send_name'], 0, 8, 'utf-8'), //商户名称
            're_openid' => $params['re_openid'], //用户openid
            'total_amount' => $params['total_amount'] * 100,   //付款金额，单位：分
            'total_num' => $params['total_num'], //红包发放总人数
            'wishing' => $params['wishing'], //红包祝福语
            'client_ip' => $params['client_ip'], //Ip地址
            'act_name' => $params['act_name'],   //活动名称
            'remark' => $params['remark'],   //备注
        );
        $xml_data = '<xml>';
        foreach ($data as $k=>$v) {
            $xml_data .= "<{$k}>{$v}</{$k}>";
        }
        $sign = self::sign($data, $extra['sign_key']);
        $xml_data .= "<sign>{$sign}</sign>";
        $xml_data .= '</xml>';
        $headers = array();
        $headers['Content-Type'] = 'application/x-www-form-urlencoded'; //request post
        $headers['CURLOPT_SSL_VERIFYPEER'] = false;
        $headers['CURLOPT_SSL_VERIFYHOST'] = false;
        $headers['CURLOPT_SSLCERTTYPE'] = 'PEM';
        $headers['CURLOPT_SSLCERT'] = $extra['apiclient_cert'];
        $headers['CURLOPT_SSLKEYTYPE'] = 'PEM';
        $headers['CURLOPT_SSLKEY'] = $extra['apiclient_key'];
        if (!empty($extra['rootca'])) {
            $headers['CURLOPT_CAINFO'] = $extra['rootca'];
        }
        if (self::$debug) {
            WeUtility::logging('trace', '[wxpay-api:sendredpack] xml_data='.$xml_data);
            WeUtility::logging('trace', '[wxpay-api:sendredpack] headers='.var_export($headers, true));
        }
        load()->func('communication');
        $response = ihttp_request(self::$sendredpack_url, $xml_data, $headers);
        if ($response == '') {
            return '[wxpay-api:sendredpack] response NULL';
        }
        $response = $response['content'];
        if (self::$debug) {
            WeUtility::logging('trace', '[wxpay-api:sendredpack] response=' . $response);
        }
        $xml = @simplexml_load_string($response);
        if (empty($xml)) {
            return '[wxpay-api:sendredpack] parse xml NULL';
        }
        if (self::$debug) {
            WeUtility::logging('trace', '[wxpay-api:sendredpack] xml='.var_export($xml, true));
        }
        $return_code = $xml->return_code?(string) $xml->return_code:'';
        $return_msg = $xml->return_msg?(string) $xml->return_msg:'';
        $result_code = $xml->result_code?(string) $xml->result_code:'';
        $err_code = $xml->err_code?(string) $xml->err_code:'';
        $err_code_des = $xml->err_code_des?(string) $xml->err_code_des:'';

        //查询红包是否发放成功
        if ($query_result) {
            if ($return_code == 'SUCCESS' && $result_code == 'SUCCESS') {
                $ret = array(
                    'success' => true,
                    'send_listid' => (string)$xml->send_listid,
                    'mch_billno' => (string)$xml->mch_billno,
                    'send_time' => (string)$xml->send_time,
                    'return_code' => $return_code,
                    'return_msg' => $return_msg,
                    'err_code' => $err_code,
                    'err_code_des' => $err_code_des,
                );
                return $ret;
            } else {
                return $return_code.':'.$return_msg.','.$err_code.':'.$err_code_des;
            }
        }

        if ($return_code == 'SUCCESS') {
            if ($result_code == 'SUCCESS') {
                $ret = array(
                    'success' => true,
                    'send_listid' => (string)$xml->send_listid,
                    'mch_billno' => (string)$xml->mch_billno,
                    'send_time' => (string)$xml->send_time,
                    'return_code' => $return_code,
                    'return_msg' => $return_msg,
                    'err_code' => $err_code,
                    'err_code_des' => $err_code_des,
                );
                return $ret;
            } else if ($err_code == 'SYSTEMERROR') {    //请求已受理，请稍后使用原单号查询发放结果
                //未包含query_result参数时，此情况下默认已发送成功，可在后台调用红包查询接口
                $ret = array(
                    'success' => true,
                    'send_listid' => (string)$xml->send_listid,
                    'mch_billno' => (string)$xml->mch_billno,
                    'send_time' => (string)$xml->send_time,
                    'return_code' => $return_code,
                    'return_msg' => $return_msg,
                    'err_code' => $err_code,
                    'err_code_des' => $err_code_des,
                );
                return $ret;
            }
        } else {
            return $return_code.':'.$return_msg.','.$err_code.':'.$err_code_des;
        }
    }

    public static function sign($data, $sign_key) {
        ksort($data);
        $data_str = '';
        foreach ($data as $k=>$v) {
            if ($v == '' || $k == 'sign') {
                continue;
            }
            $data_str .= "$k=$v&";
        }
        $data_str .= "key=".$sign_key;
        $sign = strtoupper(md5($data_str));
        return $sign;
    }
}