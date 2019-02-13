<?php
/**
 * 数据库缓存
 *
 * [WeEngine System] Copyright (c) 2013 WE7.CC
 */
defined('IN_IA') or exit('Access Denied');

/**
 * 获取缓存单条数据
 * @param string $key 缓存键名 多个层级或分组请使用:隔开
 * @return array
 */
function cache_read($key) {
	$cachedata = pdo_getcolumn('core_cache', array('key' => $key), 'value');
	if (empty($cachedata)) {
		return '';
	}
	$cachedata = iunserializer($cachedata);
	if (is_array($cachedata) && !empty($cachedata['expire']) && !empty($cachedata['data'])) {
		if ($cachedata['expire'] > TIMESTAMP) { // 判断是否过期
			return $cachedata['data'];
		} else {
			return '';
		}
	} else {
		return $cachedata;
	}
}

/**
 * 检索缓存中指定层级或分组的所有缓存
 * @param $prefix string 缓存分组
 * @return array
 */
function cache_search($prefix) {
	$sql = 'SELECT * FROM ' . tablename('core_cache') . ' WHERE `key` LIKE :key';
	$params = array();
	$params[':key'] = "{$prefix}%";
	$rs = pdo_fetchall($sql, $params);
	$result = array();
	foreach ((array)$rs as $v) {
		$result[$v['key']] = iunserializer($v['value']);
	}
	return $result;
}

/**
 * 将缓存数据写入数据库
 * @param string $key 缓存键名
 * @param mixed $data 缓存数据
 * @param string $expire 缓存超时时间
 * @return mixed
 */
function cache_write($key, $data, $expire = 0) {
	if (empty($key) || !isset($data)) {
		return false;
	}
	$record = array();
	$record['key'] = $key;
	if (!empty($expire)) {
		$cache_data = array(
			'expire' => TIMESTAMP + $expire,
			'data' => $data
		);
	} else {
		$cache_data = $data;
	}
	$record['value'] = iserializer($cache_data);
	return pdo_insert('core_cache', $record, true);
}

/**
 * 删除某个键的缓存数据
 * @param string $key 缓存键名
 * @return boolean
 */
function cache_delete($key) {
	$sql = 'DELETE FROM ' . tablename('core_cache') . ' WHERE `key`=:key';
	$params = array();
	$params[':key'] = $key;
	$result = pdo_query($sql, $params);
	return $result;
}

/**
 * 清空指定前缀缓存或所有数据
 * @param string $prefix 缓存前缀
 * @return mixed
 */
function cache_clean($prefix = '') {
	global $_W;
	if (empty($prefix)) { // 清空所有缓存
		$sql = 'DELETE FROM ' . tablename('core_cache');
		$result = pdo_query($sql);
		if ($result) { // 并清空$_W变量中缓存信息
			unset($_W['cache']);
		}
	} else { //清空指定前缀的缓存记录
		$sql = 'DELETE FROM ' . tablename('core_cache') . ' WHERE `key` LIKE :key';
		$params = array();
		$params[':key'] = "{$prefix}:%";
		$result = pdo_query($sql, $params);
	}
	return $result;
}
