<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

/**
 * 保存设置信息并缓存
 * @param string $data 缓存数据
 * @param string $key 缓存键值
 * @return mixed
 */
function setting_save($data = '', $key = '') {
	if (empty($data) && empty($key)) {
		return FALSE;
	}
	if (is_array($data) && empty($key)) {
		foreach ($data as $key => $value) {
			$record[] = "('$key', '" . iserializer($value) . "')";
		}
		if ($record) { //插入新的设置信息
			$return = pdo_query("REPLACE INTO " . tablename('core_settings') . " (`key`, `value`) VALUES " . implode(',', $record));
		}
	} else {
		$return = table('coresetting')->settingSave($key, $data);
	}
	$cachekey = "setting";
	cache_write($cachekey, '');
	return $return;
}

/**
 * 加载缓存的设置信息, 加载后也可以通过 $_W['setting'][$key] 中读取.
 * @param string $key
 * @return array
 */
function setting_load($key = '') {
	global $_W;
	$cachekey = "setting";
	$settings = cache_load($cachekey);
	if (empty($settings)) {
		$settings = pdo_fetchall('SELECT * FROM ' . tablename('core_settings'), array(), 'key');
		if (is_array($settings)) {
			foreach ($settings as $k => &$v) {
				$settings[$k] = iunserializer($v['value']);
			}
		}
		cache_write($cachekey, $settings);
	}
	if (!is_array($_W['setting'])) {
		$_W['setting'] = array();
	}
	$_W['setting'] = array_merge($_W['setting'], $settings);
	if (!empty($key)) {
		return array($key => $settings[$key]);
	} else {
		return $settings;
	}
}

/**
 * 重新写入版本信息到文件
 * @param $family
 * @param $version
 * @param $release
 * @return bool|int|void
 */
function setting_upgrade_version($family, $version, $release) {
	$verfile = IA_ROOT . '/framework/version.inc.php';
	$verdat = <<<VER
<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

define('IMS_FAMILY', '{$family}');
define('IMS_VERSION', '{$version}');
define('IMS_RELEASE_DATE', '{$release}');
VER;
	return file_put_contents($verfile, trim($verdat));
}
