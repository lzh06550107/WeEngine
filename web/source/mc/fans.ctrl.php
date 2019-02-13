<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */

defined('IN_IA') or exit('Access Denied');
set_time_limit(60);

load()->model('mc');

$dos = array('display', 'add_tag', 'del_tag', 'edit_tagname', 'edit_fans_tag', 'batch_edit_fans_tag', 'download_fans', 'sync', 'fans_sync_set', 'register');
$do = in_array($do, $dos) ? $do : 'display';

// 显示粉丝列表
if ($do == 'display') {
    $_W['page']['title'] = '粉丝列表';
    // 获取最新的粉丝标签组
    $fans_tag = mc_fans_groups(true); // 注意每次都是重新获取
    $pageindex = max(1, intval($_GPC['page']));
    // 搜索模式，精确或者模糊
    $search_mod = intval($_GPC['search_mod']) == '' ? 1 : intval($_GPC['search_mod']);
    $pagesize = 10;

    $param = array(
        ':uniacid' => $_W['uniacid'],
        ':acid' => $_W['acid']
    );
    $condition = " WHERE f.`uniacid` = :uniacid AND f.`acid` = :acid";

    // 获取指定标签组粉丝
    $tag = intval($_GPC['tag']) ? intval($_GPC['tag']) : 0;
    if (!empty($tag)) {
        $param[':tagid'] = $tag;
        $condition .= " AND m.`tagid` = :tagid";
    }

    // 只获取会员即绑定粉丝
    if ($_GPC['type'] == 'bind') {
        $condition .= " AND f.`uid` > 0";
        $type = 'bind';
    }

    // 按粉丝昵称或者openid搜索
    $nickname = $_GPC['nickname'] ? addslashes(trim($_GPC['nickname'])) : '';
    if (!empty($nickname)) {
        if ($search_mod == 1) { // 精确模式
            $condition .= " AND ((f.`nickname` = :nickname) OR (f.`openid` = :openid))";
            $param[':nickname'] = $nickname;
            $param[':openid'] = $nickname;
        } else { // 模糊模式
            $condition .= " AND ((f.`nickname` LIKE :nickname) OR (f.`openid` LIKE :openid))";
            $param[':nickname'] = "%" . $nickname . "%";
            $param[':openid'] = "%" . $nickname . "%";
        }
    }

    // 是否关注
    $follow = intval($_GPC['follow']) ? intval($_GPC['follow']) : 1;
    if ($follow == 1) {
        $orderby = " ORDER BY f.`followtime` DESC";
        $condition .= " AND f.`follow` = 1";
    } elseif ($follow == 2) {
        $orderby = " ORDER BY f.`unfollowtime` DESC";
        $condition .= " AND f.`follow` = 0";
    }
    $select_sql = "SELECT %s FROM " . tablename('mc_mapping_fans') . " AS f LEFT JOIN " . tablename('mc_fans_tag_mapping') . " AS m ON m.`fanid` = f.`fanid` " . $condition . " %s";
    $fans_list_sql = sprintf($select_sql, "f.* ", " GROUP BY f.`fanid`" . $orderby . " LIMIT " . ($pageindex - 1) * $pagesize . "," . $pagesize);
    $fans_list = pdo_fetchall($fans_list_sql, $param);

    if (!empty($fans_list)) {
        foreach ($fans_list as &$v) {
            $v['tag_show'] = mc_show_tag($v['groupid']);
            $v['tag_show'] = explode(',', $v['tag_show']);
            $v['groupid'] = trim($v['groupid'], ',');
            if (!empty($v['uid'])) {
                $user = mc_fetch($v['uid'], array('realname', 'nickname', 'mobile', 'email', 'avatar'));
            }
            if (!empty($user)) {
                $v['member'] = $user;
            }
            if (!empty($v['tag']) && is_string($v['tag'])) {
                if (is_base64($v['tag'])) {
                    $v['tag'] = base64_decode($v['tag']);
                }
                if (is_serialized($v['tag'])) {
                    $v['tag'] = @iunserializer($v['tag']);
                }
                if (!empty($v['tag']['headimgurl'])) {
                    $v['tag']['avatar'] = tomedia($v['tag']['headimgurl']);
                }
                if (empty($v['nickname']) && !empty($v['tag']['nickname'])) {
                    $v['nickname'] = strip_emoji($v['tag']['nickname']);
                }
            }
            if (empty($v['tag'])) {
                $v['tag'] = array();
            }
            if (empty($v['user']['nickname']) && !empty($v['tag']['nickname'])) {
                $v['user']['nickname'] = strip_emoji($v['tag']['nickname']);
            }
            if (empty($v['user']['avatar']) && !empty($v['tag']['avatar'])) {
                $v['user']['avatar'] = $v['tag']['avatar'];
            }
            unset($user, $niemmo, $niemmo_effective);
        }
        unset($v);
    }

    $total_sql = sprintf($select_sql, "COUNT(DISTINCT f.`fanid`) ", '');
    $total = pdo_fetchcolumn($total_sql, $param);
    $pager = pagination($total, $pageindex, $pagesize);
    $fans['total'] = pdo_getcolumn("mc_mapping_fans", array('uniacid' => $_W['uniacid'], 'acid' => $_W['acid'], 'follow' => 1), 'count(*)');
}

// 添加粉丝标签
if ($do == 'add_tag') {
    $tag_name = trim($_GPC['tag']);
    if (empty($tag_name)) {
        iajax(1, '请填写标称名称', '');
    }
    $account_api = WeAccount::create();
    $result = $account_api->fansTagAdd($tag_name); // 同步微信添加标签
    if (is_error($result)) {
        iajax(1, $result);
    } else {
        iajax(0, '');
    }
}

// 删除标签
if ($do == 'del_tag') {
    $tagid = intval($_GPC['tag']);
    if (empty($tagid)) {
        iajax(1, '标签id为空', '');
    }
    $account_api = WeAccount::create();
    $tags = $account_api->fansTagDelete($tagid);

    if (!is_error($tags)) {
        $fans_list = pdo_getall('mc_mapping_fans', array('groupid LIKE' => "%,{$tagid},%"));
        $count = count($fans_list);
        if (!empty($count)) {
            $buffSize = ceil($count / 500);
            for ($i = 0; $i < $buffSize; $i++) {
                $sql = '';
                $wechat_fans = array_slice($fans_list, $i * 500, 500);
                // 清空映射表中每个粉丝的需要删除的标签
                foreach ($wechat_fans as $fans) {
                    $tagids = trim(str_replace(',' . $tagid . ',', ',', $fans['groupid']), ',');
                    if ($tagids == ',') {
                        $tagids = '';
                    }
                    $sql .= 'UPDATE ' . tablename('mc_mapping_fans') . " SET `groupid`='" . $tagids . "' WHERE `fanid`={$fans['fanid']};";
                }
                pdo_query($sql);
            }
        }
        pdo_delete('mc_fans_tag_mapping', array('tagid' => $tagid));
        iajax(0, 'success', '');
    } else {
        iajax(-1, $tags['message'], '');
    }
}

// 重命名标签
if ($do == 'edit_tagname') {
    $tag = intval($_GPC['tag']);
    if (empty($tag)) {
        iajax(1, '标签id为空', '');
    }
    $tag_name = trim($_GPC['tag_name']);
    if (empty($tag_name)) {
        iajax(1, '标签名为空', '');
    }

    $account_api = WeAccount::create();
    $result = $account_api->fansTagEdit($tag, $tag_name);
    if (is_error($result)) {
        iajax(1, $result);
    } else {
        iajax(0, '');
    }
}

// 为单个粉丝打标签
if ($do == 'edit_fans_tag') {
    $fanid = intval($_GPC['fanid']);
    $tags = $_GPC['tags'];

    $openid = pdo_getcolumn('mc_mapping_fans', array('uniacid' => $_W['uniacid'], 'fanid' => $fanid), 'openid');
    $account_api = WeAccount::create();
    if (empty($tags) || !is_array($tags)) {
        $fans_tags = pdo_getall('mc_fans_tag_mapping', array('fanid' => $fanid), array(), 'tagid');
        if (!empty($fans_tags)) {
            foreach ($fans_tags as $tag) {
                // 先取消粉丝的所有标签
                $result = $account_api->fansTagBatchUntagging(array($openid), $tag['tagid']);
            }
        } else {
            iajax(0);
        }
    } else {
        // 然后再增加新的标签
        $result = $account_api->fansTagTagging($openid, $tags);
    }

    if (!is_error($result)) {
        pdo_delete('mc_fans_tag_mapping', array('fanid' => $fanid));
        if (!empty($tags)) {
            foreach ($tags as $tag) {
                pdo_insert('mc_fans_tag_mapping', array('fanid' => $fanid, 'tagid' => $tag));
            }
            $tags = implode(',', $tags);
        }
        pdo_update('mc_mapping_fans', array('groupid' => $tags), array('fanid' => $fanid));
    }
    iajax(0, $result);
}

// 为粉丝批量打标签，TODO  注意：批量打标签，不会清空用户以前的标签
// https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837
if ($do == 'batch_edit_fans_tag') {
    $openid_list = $_GPC['openid'];
    if (empty($openid_list) || !is_array($openid_list)) {
        iajax(1, '请选择粉丝', '');
    }
    $tags = $_GPC['tag'];
    if (empty($tags) || !is_array($tags)) {
        iajax(1, '请选择标签', '');
    }

    $account_api = WeAccount::create();
    foreach ($tags as $tag) {
        $result = $account_api->fansTagBatchTagging($openid_list, $tag);
        if (is_error($result)) {
            iajax(-1, $result);
        }
        // 更新每个粉丝标签信息
        foreach ($openid_list as $openid) {
            $fan_info = pdo_get('mc_mapping_fans', array('uniacid' => $_W['uniacid'], 'openid' => $openid));
            // 存在记录，则替换，不存在，则插入
            pdo_insert('mc_fans_tag_mapping', array('fanid' => $fan_info['fanid'], 'tagid' => $tag), true);
            // TODO 如果当前用户已经有该标签，则需要处理
            $groupid = $fan_info['groupid'];
            if (strpos($groupid,$tag) === false) {
                $groupid = $fan_info['groupid'] . "," . $tag; // 累加添加
                pdo_update('mc_mapping_fans', array('groupid' => $groupid), array('uniacid' => $_W['uniacid'], 'openid' => $openid));
            }
        }
    }
    iajax(0, '');
}

// 1、从微信服务器下载关注者列表，关注者列表由一串OpenID组成，用来填充mc_mapping_fans表
if ($do == 'download_fans') {
    $next_openid = $_GPC['next_openid'];
    if (empty($next_openid)) { // 开始前，更新粉丝映射表中所有粉丝为未关注
        pdo_update('mc_mapping_fans', array('follow' => 0), array('uniacid' => $_W['uniacid']));
    }
    $account_api = WeAccount::create();
    // 获取帐号的关注者列表，关注者列表由一串OpenID组成
    $wechat_fans_list = $account_api->fansAll();
    // 获取同公众号帐号的统一帐号，可能是授权不同，一个是手动；一个是自动授权，导致同一个公众号出现两个统一帐号
    $same_account_exist = pdo_getall('account_wechats', array('key' => $_W['account']['key'], 'uniacid <>' => $_W['uniacid']), array(), 'uniacid');
    if (!empty($same_account_exist)) {
        pdo_update('mc_mapping_fans', array('uniacid' => $_W['uniacid'], 'acid' => $_W['acid']), array('uniacid' => array_keys($same_account_exist)));
    }

    if (!is_error($wechat_fans_list)) {
        $wechat_fans_count = count($wechat_fans_list['fans']);
        $total_page = ceil($wechat_fans_count / 500);
        for ($i = 0; $i < $total_page; $i++) {
            $wechat_fans = array_slice($wechat_fans_list['fans'], $i * 500, 500);
            // 根据openid获取本地已经同步的粉丝
            $system_fans = pdo_getall('mc_mapping_fans', array('openid' => $wechat_fans), array(), 'openid');
            $add_fans_sql = '';
            foreach ($wechat_fans as $openid) {
                // 本地不存在的粉丝，则需要插入到mc_mapping_fans表中
                if (empty($system_fans) || empty($system_fans[$openid])) {
                    $salt = random(8);
                    $add_fans_sql .= "('{$_W['acid']}', '{$_W['uniacid']}', 0, '{$openid}', '{$salt}', 1, 0, ''),";
                }
            }
            if (!empty($add_fans_sql)) {
                $add_fans_sql = rtrim($add_fans_sql, ',');
                $add_fans_sql = "INSERT INTO " . tablename('mc_mapping_fans') . " (`acid`, `uniacid`, `uid`, `openid`, `salt`, `follow`, `followtime`, `tag`) VALUES " . $add_fans_sql;
                $result = pdo_query($add_fans_sql);
            }
            // 存在，则更新信息
            pdo_update('mc_mapping_fans', array('follow' => 1, 'uniacid' => $_W['uniacid'], 'acid' => $_W['acid']), array('openid' => $wechat_fans));
        }
        $return['total'] = $wechat_fans_list['total'];
        $return['count'] = !empty($wechat_fans_list['fans']) ? $wechat_fans_count : 0;
        $return['next'] = $wechat_fans_list['next'];
        iajax(0, $return, '');
    } else {
        iajax(1, $wechat_fans_list['message']);
    }
}

// 2、根据前面下载到mc_mapping_fans表的openid来获取粉丝详细信息或者自动注册会员信息
if ($do == 'sync') {
    $type = $_GPC['type'] == 'all' ? 'all' : 'check';
    $sync_member = intval($_GPC['sync_member']);
    $force_init_member = empty($sync_member) ? false : true;

    if ($type == 'all') { // 同步全部粉丝
        $pageindex = $_GPC['pageindex'];
        $pageindex++;
        $sync_fans = pdo_getslice('mc_mapping_fans', array('uniacid' => $_W['uniacid'], 'acid' => $_W['acid'], 'follow' => '1'), array($pageindex, 100), $total, array(), 'openid', 'fanid DESC');
        $total = ceil($total / 100);
        $start = time();
        if (!empty($sync_fans)) {
            mc_init_fans_info(array_keys($sync_fans), $force_init_member);
        }
        if ($total == $pageindex) {
            setcookie(cache_system_key('sync_fans_pindex:' . $_W['uniacid']), '', -1);
        } else {
            setcookie(cache_system_key('sync_fans_pindex:' . $_W['uniacid']), $pageindex);
        }
        iajax(0, array('pageindex' => $pageindex, 'total' => $total), '');
    }
    if ($type == 'check') { // 同步选中的粉丝
        $openids = $_GPC['openids'];
        if (empty($openids) || !is_array($openids)) {
            iajax(1, '请选择粉丝', '');
        }
        $sync_fans = pdo_getall('mc_mapping_fans', array('openid' => $openids));
        if (!empty($sync_fans)) {
            foreach ($sync_fans as $fans) {
                mc_init_fans_info($fans['openid'], $force_init_member);
            }
        }
        iajax(0, 'success', '');
    }
}

// 粉丝同步设置(作废)
if ($do == 'fans_sync_set') {
    $_W['page']['title'] = '更新粉丝信息 - 公众号选项';
    $operate = $_GPC['operate'];
    if ($operate == 'save_setting') {
        uni_setting_save('sync', intval($_GPC['setting']));
        iajax(0, '');
    }
    $setting = uni_setting($_W['uniacid'], array('sync'));
    $sync_setting = $setting['sync'];
}

// 粉丝注册为会员
if ($do == 'register') {
    $open_id = trim($_GPC['openid']);
    $password = trim($_GPC['password']);
    $repassword = trim($_GPC['repassword']);
    if (empty($open_id) || empty($password) || empty($repassword)) {
        iajax('-1', '参数错误', url('mc/fans/display'));
    }
    if ($password != $repassword) {
        iajax('-1', '密码不一致', url('mc/fans/display'));
    }
    $member_info = mc_init_fans_info($open_id, true);
    $member_salt = pdo_getcolumn('mc_members', array('uid' => $member_info['uid']), 'salt');
    // TODO 会员密码生成方式
    $password = md5($password . $member_salt . $_W['config']['setting']['authkey']);
    pdo_update('mc_members', array('password' => $password), array('uid' => $uid));
    iajax('0', '注册成功', url('mc/member/base_information', array('uid' => $member_info['uid'])));
}

template('mc/fans');

