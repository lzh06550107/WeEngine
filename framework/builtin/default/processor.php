<?php
/**
 * 默认回复处理类
 * 优先回复“优先级”大于默认级别的模块。
 *
 * [WeEngine System] Copyright (c) 2013 WE7.CC
 * $sn: pro/framework/builtin/default/processor.php : v b352eceaaed4 : 2015/01/09 03:19:15 : RenChao $
 */
defined('IN_IA') or exit('Access Denied');

class DefaultModuleProcessor extends WeModuleProcessor {
	public function respond() {
		global $_W, $engine;
		if ($this->message['type'] == 'trace') {
			return $this->respText('');
		}
		$setting = uni_setting($_W['uniacid'], array('default')); // 公众号默认回复
		if(!empty($setting['default'])) {
			$flag = array('image' => 'url', 'link' => 'url', 'text' => 'content');
			$message = $this->message;
			$message['type'] = 'text';
			$message['content'] = $setting['default']; //新文本消息的内容为默认内容，一般为关键字
			$message['redirection'] = true;
			$message['source'] = 'default';
			$message['original'] = $this->message[$flag[$this->message['type']]]; // 图片，链接，文本消息转换为文本消息
			$pars = $engine->analyzeText($message); // 然后分析符合该关键字的回复规则
			if(is_array($pars)) {
				return array('params' => $pars);
			}
		}
	}
}
