<?php
/**
 * 【超人】 签到模块
 *
 * @author 超人
 * @url
 */
defined('IN_IA') or exit('Access Denied');

//sign
function superman_daka_fetch($filter = array()) {
    $sql = 'SELECT * FROM '.tablename('superman_daka').' WHERE 1=1';
    $params = array();
    if (isset($filter['uid'])) {
        $sql .= ' AND uid=:uid';
        $params[':uid'] = $filter['uid'];
    }
    if (isset($filter['rid'])) {
        $sql .= ' AND rid=:rid';
        $params[':rid'] = $filter['rid'];
    }
    if (isset($filter['start_time'])) {
        $sql .= ' AND dateline>=:start_time';
        $params[':start_time'] = $filter['start_time'];
    }
    if (isset($filter['end_time'])) {
        $sql .= ' AND dateline<=:end_time';
        $params[':end_time'] = $filter['end_time'];
    }
    return pdo_fetch($sql, $params);
}

function superman_daka_fetchall($filter = array(), $orderby = '', $start = 0, $pagesize = 10) {
    $params = array();
    $where = ' WHERE 1=1';
    if (isset($filter['uniacid'])) {
        $where .= ' AND uniacid=:uniacid';
        $params[':uniacid'] = $filter['uniacid'];
    }
    if (isset($filter['uid'])) {
        $where .= ' AND uid=:uid';
        $params[':uid'] = $filter['uid'];
    }
    if (isset($filter['rid'])) {
        $where .= ' AND rid=:rid';
        $params[':rid'] = $filter['rid'];
    }
    if (isset($filter['dateline'])) {
        $where .= ' AND dateline=:dateline';
        $params[':dateline'] = $filter['dateline'];
    }
    if (isset($filter['start_time'])) {
        $where .= ' AND dateline>=:start_time';
        $params[':start_time'] = $filter['start_time'];
    }
    if (isset($filter['end_time'])) {
        $where .= ' AND dateline<=:end_time';
        $params[':end_time'] = $filter['end_time'];
    }
    if ($orderby == '') {
        $orderby = ' ORDER BY dateline ASC, displayorder ASC';
    }
    $sql = 'SELECT * FROM '.tablename('superman_daka')." {$where} {$orderby} LIMIT {$start},{$pagesize}";
    return pdo_fetchall($sql, $params);
}

function superman_daka_count($filter = array()) {
    $sql = 'SELECT COUNT(*) FROM '.tablename('superman_daka').' WHERE 1=1';
    $params = array();
    if (isset($filter['un_uid'])) {
        $sql .= ' AND uid!=:un_uid';
        $params[':un_uid'] = $filter['un_uid'];
    }
    if (isset($filter['rid'])) {
        $sql .= ' AND rid=:rid';
        $params[':rid'] = $filter['rid'];
    }
    if (isset($filter['start_time'])) {
        $sql .= ' AND dateline>=:start_time';
        $params[':start_time'] = $filter['start_time'];
    }
    if (isset($filter['end_time'])) {
        $sql .= ' AND dateline<=:end_time';
        $params[':end_time'] = $filter['end_time'];
    }
    if (isset($filter['more_displayorder'])) {
        $sql .= ' AND displayorder!=0 AND displayorder<:more_displayorder';
        $params[':more_displayorder'] = $filter['more_displayorder'];
    }
    if (isset($filter['total_down'])) {
        $sql .= ' AND total<:total_down';
        $params[':total_down'] = $filter['total_down'];
    }
    return pdo_fetchcolumn($sql, $params);
}

function superman_daka_set(&$item) {
    $item['dateline'] = date('Y-m-d', $item['dateline']);
    $item['extra_reward'] = unserialize($item['extra_reward']);
}

//sign_reply
function superman_daka_reply_fetch($filter = array()) {
    $sql = 'SELECT * FROM '.tablename('superman_daka_reply').' WHERE 1=1';
    $params = array();
    if (isset($filter['rid'])) {
        $sql .= ' AND rid=:rid';
        $params[':rid'] = $filter['rid'];
    }
    return pdo_fetch($sql, $params);
}


//credit
function superman_credit_type ($type = '') {
    global $_W;
    static $data = null;
    if ($data !== null) {
        if ($type != '') {
            return $data[$type]['title'];
        }
        return $data;
    }
    $data = pdo_fetch('SELECT `creditnames` FROM '.tablename('uni_settings').' WHERE `uniacid` = :uniacid', array(':uniacid' => $_W['uniacid']));
    if(!empty($data['creditnames'])) {
        $data = iunserializer($data['creditnames']);
        if (is_array($data)) {
            if ($type) {
                foreach($data as $k => $v) {
                    if ($type == $k && $v['enabled'] == 1) {
                        return $v['title'];
                    }
                }
            } else {
                return $data;
            }
        }
    }
}

//mc_mapping_fans
function superman_check_follow($filter = array()) {
    $sql = 'SELECT `follow` FROM '.tablename('mc_mapping_fans').' WHERE 1=1';
    $params = array();
    if (isset($filter['uid'])) {
        $sql .= ' AND uid=:uid';
        $params[':uid'] = $filter['uid'];
    }
    return pdo_fetch($sql, $params);
}

//rule
function superman_rule_fetch($id) {
    $sql = 'SELECT * FROM '.tablename('rule').' WHERE id='.$id;
    return pdo_fetch($sql);
}

//stat
function superman_stat_fetch($filter = array()) {
    $where = ' WHERE 1=1';
    $params = array();
    if (isset($filter['id'])) {
        $where .= ' AND id=:id';
        $params[':id'] = $filter['id'];
    }
    if (isset($filter['daytime'])) {
        $where .= ' AND daytime=:daytime';
        $params[':daytime'] = $filter['daytime'];
    }
    if (isset($filter['rid'])) {
        $where .= ' AND rid=:rid';
        $params[':rid'] = $filter['rid'];
    }
    $sql = "SELECT * FROM ".tablename('superman_daka_stat')." {$where}";
    return pdo_fetch($sql, $params);
}

function superman_stat_fetchall($filter = array(), $orderby = '', $start = 0, $pagesize = 10, $keyfield = 'daytime') {
    global $_W;
    $where = ' WHERE 1=1';
    $params = array();
    if (isset($filter['uniacid'])) {
        $where .= ' AND uniacid=:uniacid';
        $params[':uniacid'] = $filter['uniacid'];
    }
    if (isset($filter['rid'])) {
        $where .= ' AND rid=:rid';
        $params[':rid'] = $filter['rid'];
    }
    if (isset($filter['daytime'])) {
        $where .= ' AND daytime=:daytime';
        $params[':daytime'] = $filter['daytime'];
    }
    if ($orderby == '') {
        $orderby = 'ORDER BY id DESC';
    }
    $sql = "SELECT * FROM ".tablename('superman_daka_stat')." {$where} {$orderby}";
    if ($pagesize > 0) {
        $sql .= " LIMIT {$start},{$pagesize}";
    }
    return pdo_fetchall($sql, $params, $keyfield);
}

function superman_stat_update_count($filter, $field, $value = 1) {
    global $_W;
    if ($field !='sign_total') {
        return false;
    }
    $row = superman_stat_fetch($filter);

    if (!$row) {
        $data = array(
            'uniacid' => $_W['uniacid'],
            'daytime' => $filter['daytime'],
            'rid' => $filter['rid'],
            $field => $value,
        );
        return superman_stat_insert($data)?true:false;
    } else {
        $sql = 'UPDATE '.tablename('superman_daka_stat')." SET {$field}={$field}+{$value} WHERE id=:id";
        $params = array(
            ':id' => $row['id'],
        );
        return pdo_query($sql, $params)>0?true:false;
    }
}

function superman_stat_insert($data) {
    pdo_insert('superman_daka_stat', $data);
    return pdo_insertid();
}