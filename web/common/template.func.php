<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

/**
 *   说明: 展示特定模板内容
 *
 *   参数:
 *	$filename 模板名称，格式为: '模板文件夹/模板名称无后缀'，如: common/header
 *	$flag 模板展示方式
 *   $flag含义:
 *	TEMPLATE_DISPLAY     导入全局变量，渲染并直接展示模板内容(默认值)
 *	TEMPLATE_FETCH       导入全局变量，渲染模板内容，但不展示模板内容，而是将其作为返回值获取。 可用于静态化页面。
 *	TEMPLATE_INCLUDEPATH 不导入全局变量，也不渲染模板内容，只是将编译后的模板文件路径返回，返回的模板编译路径可以直接使用 include 嵌入至当前上下文。
 *   示例: 以下三种调用方式效果相同
 *	$list = array();
 *	... // 其他更多上下文数据
 *	template('common/template');
 *	//导入全局变量，渲染并直接展示模板内容(默认值)
 *	$content = template('common/template', TEMPLATE_FETCH);
 *	//导入全局变量，渲染模板内容，但不展示模板内容，而是将其作为返回值获取。 可用于静态化页面。
 *	echo $content;
 *	//输出渲染的内容
 *	include template('common/template', TEMPLATE_INCLUDEPATH);
 *	//不导入全局变量，也不渲染模板内容，只是将编译后的模板文件路径返回，返回的模板编译路径可以直接使用 include 嵌入至当前上下文。
 */
function template($filename, $flag = TEMPLATE_DISPLAY) {
	global $_W;
	$source = IA_ROOT . "/web/themes/{$_W['template']}/{$filename}.html";
	$compile = IA_ROOT . "/data/tpl/web/{$_W['template']}/{$filename}.tpl.php";
	if(!is_file($source)) { // 如果指定的模板主题没有找到文件，则到默认主题中查找
		$source = IA_ROOT . "/web/themes/default/{$filename}.html";
		$compile = IA_ROOT . "/data/tpl/web/default/{$filename}.tpl.php";
	}

	if(!is_file($source)) {
		echo "template source '{$filename}' is not exist!";
		return '';
	}
	// 如果处于开发模式或者编译文件不存在或者源文件已经修改，则重新编译文件
	if(DEVELOPMENT || !is_file($compile) || filemtime($source) > filemtime($compile)) {
		template_compile($source, $compile);
	}
	switch ($flag) {
		case TEMPLATE_DISPLAY: // 如果需要显示模板，则
		default:
			extract($GLOBALS, EXTR_SKIP); // 抽取全局数组为变量
			include $compile; // 然后加载运行php代码
			break;
		case TEMPLATE_FETCH: // 如果是获取模板内容，则另开一个输出缓冲区，然后加载执行php代码
			extract($GLOBALS, EXTR_SKIP);
			ob_flush();
			ob_clean();
			ob_start();
			include $compile;
			$contents = ob_get_contents();
			ob_clean();
			return $contents;
			break;
		case TEMPLATE_INCLUDEPATH: // 如果是编译源文件，则直接返回编译文件路径
			return $compile;
			break;
	}
}

/**
 * 将模板文件编译为 PHP 文件
 * @param string $from 模板文件(HTML)路径
 * @param string $to 编译后的 PHP 文件路径
 */
function template_compile($from, $to, $inmodule = false) {
	$path = dirname($to);
	if (!is_dir($path)) {
		load()->func('file');
		mkdirs($path);
	}
	$content = template_parse(file_get_contents($from), $inmodule);
	// 如果是商业版且文件路径不是这些，则替换内容
	if(IMS_FAMILY == 'x' && !preg_match('/(footer|header|account\/welcome|login|register|home\/welcome)+/', $from)) {
		$content = str_replace('微擎', '系统', $content);
	}
	file_put_contents($to, $content); // 写入编译文件
}

/**
 * 编译模板文件
 * @param string $str 模板文件字符内容
 * @param  boolean $inmodule 是否在模块中
 * @return string 将 html 编译为 php 后的文件内容
 */
function template_parse($str, $inmodule = false) {
    // 把<!--{content}-->替换为{content}
	$str = preg_replace('/<!--{(.+?)}-->/s', '{$1}', $str);
	// 把{template  content}替换为
    // 如果在模块中或者显示指定$inmodule为true，则替换为include $this->template($1, TEMPLATE_INCLUDEPATH)
    // 如果不在模块中，则替换为include template($1, TEMPLATE_INCLUDEPATH));
	$str = preg_replace('/{template\s+(.+?)}/', '<?php (!empty($this) && $this instanceof WeModuleSite || '.intval($inmodule).') ? (include $this->template($1, TEMPLATE_INCLUDEPATH)) : (include template($1, TEMPLATE_INCLUDEPATH));?>', $str);
	/*把{php expression}替换为 <? php expression ?>*/
	$str = preg_replace('/{php\s+(.+?)}/', '<?php $1?>', $str);
	/*把{if  $condition}替换为 <? php if($condition)?>*/
	$str = preg_replace('/{if\s+(.+?)}/', '<?php if($1) { ?>', $str);
	/*把{else}替换为 <?php } else { ?>*/
	$str = preg_replace('/{else}/', '<?php } else { ?>', $str);
	/*把{else if $condition}替换为<?php } else if($condition) { ?> */
	$str = preg_replace('/{else ?if\s+(.+?)}/', '<?php } else if($1) { ?>', $str);
	/*把{/if}替换为<?php } ?>*/
	$str = preg_replace('/{\/if}/', '<?php } ?>', $str);
	/*把{loop $items $item}替换为<?php if(is_array($items)) { foreach($items as $item) { ?>*/
	$str = preg_replace('/{loop\s+(\S+)\s+(\S+)}/', '<?php if(is_array($1)) { foreach($1 as $2) { ?>', $str);
	/*把{loop $items $index $item}替换为<?php if(is_array($items)) { foreach($items as $index => $item) { ?>*/
	$str = preg_replace('/{loop\s+(\S+)\s+(\S+)\s+(\S+)}/', '<?php if(is_array($1)) { foreach($1 as $2 => $3) { ?>', $str);
	/*把{/loop}替换为<?php } } ?>*/
	$str = preg_replace('/{\/loop}/', '<?php } } ?>', $str);
	/*把{$variable}替换为<?php echo $variable;?>*/
	$str = preg_replace('/{(\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)}/', '<?php echo $1;?>', $str);
	/*把{$variable['fans']['nickname'] }替换为<?php echo $variable['fans']['nickname'];?>*/
	$str = preg_replace('/{(\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff\[\]\'\"\$]*)}/', '<?php echo $1;?>', $str);
	/*把{url 'extension/service/display'}替换为<?php echo url('extension/service/display');?>*/
	$str = preg_replace('/{url\s+(\S+)}/', '<?php echo url($1);?>', $str);
	/*把{url 'home/welcome/ext' array('m' => $module['name'])}替换为<?php echo url('home/welcome/ext',array('m' => $module['name']));?>*/
	$str = preg_replace('/{url\s+(\S+)\s+(array\(.+?\))}/', '<?php echo url($1, $2);?>', $str);
	/*把{media $imageurl}替换为<?php echo tomedia($imageurl);?>*/
	$str = preg_replace('/{media\s+(\S+)}/', '<?php echo tomedia($1);?>', $str);
	/*把 <?php code ?>转换和过滤*/
	$str = preg_replace_callback('/<\?php([^\?]+)\?>/s', "template_addquote", $str);
	//模块嵌入点，把{hook content}替换为
	$str = preg_replace_callback('/{hook\s+(.+?)}/s', "template_modulehook_parser", $str);
	/*把{/hook} 替换为<?php ; ?>*/
	$str = preg_replace('/{\/hook}/', '<?php ; ?>', $str);
	/*把常量{CONSTANT}替换为<?php echo CONSTANT;?>*/
	$str = preg_replace('/{([A-Z_\x7f-\xff][A-Z0-9_\x7f-\xff]*)}/s', '<?php echo $1;?>', $str);
	//输出花括号
	$str = str_replace('{##', '{', $str);
	$str = str_replace('##}', '}', $str);
	// 所有img元素根据配置切换本地和远程附件配置
	if (!empty($GLOBALS['_W']['setting']['remote']['type'])) {
		$str = str_replace('</body>', "<script>$(function(){\$('img').attr('onerror', '').on('error', function(){if (!\$(this).data('check-src') && (this.src.indexOf('http://') > -1 || this.src.indexOf('https://') > -1)) {this.src = this.src.indexOf('{$GLOBALS['_W']['attachurl_local']}') == -1 ? this.src.replace('{$GLOBALS['_W']['attachurl_remote']}', '{$GLOBALS['_W']['attachurl_local']}') : this.src.replace('{$GLOBALS['_W']['attachurl_local']}', '{$GLOBALS['_W']['attachurl_remote']}');\$(this).data('check-src', true);}});});</script></body>", $str);
	}
	$str = "<?php defined('IN_IA') or exit('Access Denied');?>" . $str;
	return $str;
}

/**
 * 对原始的php代码进行处理
 * @param $matchs
 * @return mixed
 */
function template_addquote($matchs) {
	$code = "<?php {$matchs[1]}?>";
	// 匹配[test]但不匹配[test]['test']这样的表达式，它会把[test]替换为['test']
	$code = preg_replace('/\[([a-zA-Z0-9_\-\.\x7f-\xff]+)\](?![a-zA-Z0-9_\-\.\x7f-\xff\[\]]*[\'"])/s', "['$1']", $code);
    // 把\"替换为”，即去掉双引号的转义字符
	return str_replace('\\\"', '\"', $code);
}

// {hook func="test" module="we7_testhook" pagesize="15"}{/hook}
function template_modulehook_parser($params = array()) {
	load()->model('module');
	if (empty($params[1])) {
		return '';
	}
	$params = explode(' ', $params[1]);
	if (empty($params)) {
		return '';
	}
	$plugin = array();
	foreach ($params as $row) {
		$row = explode('=', $row);
		$plugin[$row[0]] = str_replace(array("'", '"'), '', $row[1]); // 去除值的引号
		$row[1] = urldecode($row[1]);
	}
	// 如果存在module变量，则获取该模块的信息
	$plugin_info = module_fetch($plugin['module']);
	if (empty($plugin_info)) {
		return false;
	}

	if (empty($plugin['return']) || $plugin['return'] == 'false') {
			} else {
			}
	if (empty($plugin['func']) || empty($plugin['module'])) {
		return false;
	}

	if (defined('IN_SYS')) {
		$plugin['func'] = "hookWeb{$plugin['func']}"; // 如果在后台，组装调用函数名称
	} else {
		$plugin['func'] = "hookMobile{$plugin['func']}";
	}

	$plugin_module = WeUtility::createModuleHook($plugin_info['name']);
	if (method_exists($plugin_module, $plugin['func']) && $plugin_module instanceof WeModuleHook) {
		$hookparams = var_export($plugin, true);
		if (!empty($hookparams)) {
			$hookparams = preg_replace("/'(\\$[a-zA-Z_\x7f-\xff\[\]\']*?)'/", '$1', $hookparams);
		} else {
			$hookparams = 'array()';
		}
		$php = "<?php \$plugin_module = WeUtility::createModuleHook('{$plugin_info['name']}');call_user_func_array(array(\$plugin_module, '{$plugin['func']}'), array('params' => {$hookparams})); ?>";
		return $php;
	} else {
		$php = "<!--模块 {$plugin_info['name']} 不存在嵌入点 {$plugin['func']}-->";
		return $php;
	}
}
