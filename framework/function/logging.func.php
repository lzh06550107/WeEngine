<?php
/**
 * 日志
 *
 * [WeEngine System] Copyright (c) 2013 WE7.CC
 */
defined('IN_IA') or exit('Access Denied');

define('LOGGING_ERROR', 'error');
define('LOGGING_TRACE', 'trace');
define('LOGGING_WARNING', 'warning');
define('LOGGING_INFO', 'info');

/**
 * 记录运行日志
 * @param string|array $log 日志内容
 * @param string $type 日志类型
 * @param string $filename 日志文件名称
 * @param boolean $includePost 是否记录POST信息
 * @return array|boolean
 */
function logging_run($log, $type = 'trace', $filename = 'run') {
	global $_W;
	$filename = IA_ROOT . '/data/logs/' . $filename . '_' . date('Ymd') . '.log';
	
	load()->func('file');
	mkdirs(dirname($filename));

	$logFormat = "%date %type %user %url %context";

	if (!empty($GLOBALS['_POST'])) {
		$context[] = logging_implode($GLOBALS['_POST']);
	}

	if (is_array($log)) { // 如果是数组，则合并数组中的项
		$context[] = logging_implode($log);
	} else {
		$context[] = preg_replace('/[ \t\r\n]+/', ' ', $log);
	}

	$log = str_replace(explode(' ', $logFormat), array(
		'[' . date('Y-m-d H:i:s', $_W['timestamp']) . ']', // 事件发生时间
		$type, // 日志级别
		$_W['username'], // 登录用户名称
		$_SERVER["PHP_SELF"] . "?" . $_SERVER["QUERY_STRING"],
		implode("\n", $context), // 访问路径和传入日志信息
	), $logFormat);

	file_put_contents($filename, $log . "\r\n", FILE_APPEND);
	return true;
}

function logging_implode($array, $skip = array()) {
	$return = '';
	if (is_array($array) && !empty($array)) {
		foreach ($array as $key => $value) {
			if (empty($skip) || !in_array($key, $skip, true)) {
				if (is_array($value)) {
					$return .= $key . '={' . logging_implode($value, $skip) . '}; ';
				} else {
					$return .= "$key=$value; ";
				}
			}
		}
	}
	return $return;
}