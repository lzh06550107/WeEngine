<?php
/**
 * 【超人】超级商城模块
 *
 * @author 超人
 * @url
 */
defined('IN_IA') or exit('Access Denied');

class ERRNO {
    const OK = 0;
    const SYSTEM_ERROR = 1;
    const PARAM_ERROR = 2;
    const INVALID_REQUEST = 3;
    const NOT_LOGIN = 4;
    const NOT_IN_WECHAT = 5;
    const SIGNATURE_ERROR = 6;
    const REDIRECT = 7;

    public static $ERRMSG = array(
        self::OK => 'ok',
        self::SYSTEM_ERROR => '系统错误',
        self::PARAM_ERROR => '参数错误',
        self::INVALID_REQUEST => '非法请求',
        self::NOT_LOGIN => '未登录，跳转中...',
        self::NOT_IN_WECHAT => '请使用微信访问',
        self::SIGNATURE_ERROR => '签名错误',
        self::REDIRECT => '跳转中...',
    );
}
