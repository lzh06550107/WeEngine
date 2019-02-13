<?php
/**
 * 【超人】签到模块
 *
 * @author 超人
 * @url http://bbs.we7.cc/thread-9502-1-1.html
 */
defined('IN_IA') or exit('Access Denied');

define('superman_daka_URL', 'http://bbs.we7.cc/thread-9502-1-1.html');

function superman_daka_key($data, $sign_key) {
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

function superman_format_price($price, $showcut = false) {
    if ($showcut && $price > 10000) {
        $price = $price / 10000;
        $price .= '万';
    }
    return str_replace('.00', '', $price);
}

function superman_mc_fetch($info_from, $uid, $fields = array()) {
    $data = array();
    if ($info_from == 'members') {
        $data = mc_fetch($uid, $fields);
    } else if ($info_from == 'fans') {
        if (array_diff($fields, array('uniacid', 'nickname', 'avatar'))) {
            $data = mc_fetch($uid, $fields);
        } else {
            $data = mc_fansinfo($uid);
            if ($data) {
                $data['avatar'] = $data['tag']['avatar'];
            }
        }
    } else {
        $data = mc_fetch($uid, $fields);
        if (empty($data['nickname']) || empty($data['avatar'])) {
            $fans = mc_fansinfo($uid);
            if ($fans) {
                $data['nickname'] = empty($data['nickname'])?$fans['nickname']:$data['nickname'];
                $data['avatar'] = empty($data['avatar'])?$fans['tag']['avatar']:$data['avatar'];
            }
        }
    }
    if (!empty($data['avatar'])) {
        $data['avatar'] = tomedia($data['avatar']);
    }
    return $data;
}
function superman_custom_message(&$texts) {
    if ($texts === NULL) {
        return;
    }
    $texts['anhao_rule'] = !empty($texts['anhao_rule'])?$texts['anhao_rule']:'没有找到暗号前缀规则';
    $texts['not_setting'] = !empty($texts['not_setting'])?$texts['not_setting']:'签到功能未配置';
    $texts['not_open'] = !empty($texts['not_open'])?$texts['not_open']:'签到功能未开启';
    $texts['not_start'] = !empty($texts['not_start'])?$texts['not_start']:'今日签到还没开始哦';
    $texts['over'] = !empty($texts['over'])?$texts['over']:'今日签到已结束，请明天再来';
    $texts['success_msg_tip'] = !empty($texts['success_msg_tip'])?$texts['success_msg_tip']:'签到成功提示语未设置';
    $texts['fail_msg_tip'] = !empty($texts['fail_msg_tip'])?$texts['fail_msg_tip']:'签到失败提示语未设置';
    $texts['subscribe'] = !empty($texts['subscribe'])?$texts['subscribe']:'请先关注公众号';
    $texts['not_credit'] = !empty($texts['not_credit'])?$texts['not_credit']:'未设置签到积分';
    $texts['signed'] = !empty($texts['signed'])?$texts['signed']:'您已经签到了';
}
function superman_get_millisecond() {
    list($usec, $sec) = explode(' ', microtime());
    $msec = round($usec * 1000);
    return $msec;
}
function superman_get_time() {
    $time = array();
    //list($time['second'], $time['msecond']) = explode('.', microtime(true));
    list($time['msecond'], $time['second']) = explode(' ', microtime());
    $time['msecond'] *= 10000;
    return $time;
}