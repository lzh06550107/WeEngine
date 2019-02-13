<?php
/**
 * 【超人】模块定义
 *
 * @author 超人
 * @url https://s.we7.cc/index.php?c=home&a=author&do=index&uid=59968
 */
defined('IN_IA') or exit('Access Denied');
class SupermanUtil {
    public static function hide_string($str, $symbol = '**********', $start = 4, $end = -4) {
        return !empty($str)?mb_substr($str, 0, $start).$symbol.mb_substr($str, $end, abs($end)):'';
    }
    public static function random_float($min = 0, $max = 1) {
        return $min + mt_rand() / mt_getrandmax() * ($max - $min);
    }
    //保留小数且不四舍五入
    public static function float_format($num, $len = 2) {
        $multiplier = pow(10, $len);
        $arr = explode('.', $num * $multiplier);
        $result = $arr[0]/$multiplier;
        return sprintf('%.'.$len.'f', $result);
    }
    public static function money_format($number, $places = 2, $symbol = '&#165;', $thousand = ',', $decimal = '.') {
        return $symbol.number_format($number, $places, $decimal, $thousand);
    }
}