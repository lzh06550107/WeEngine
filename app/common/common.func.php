<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

/**
 * 生成URL，统一生成方便管理
 * @param string $segment 路由信息字符串
 * @param array $params queryString
 * @param boolean $noredirect
 * @return string (./index.php?c=*&a=*&do=*&...)
 */
function url($segment, $params = array(), $noredirect = false) {
	return murl($segment, $params, $noredirect);
}

/**
 * 页面执行中断并跳转到消息提示页面。
 *
 * @param string $msg
 * 提示消息内容
 *
 * @param string $redirect
 * 跳转地址，可缺省
 * <pre>
 * null 缺省，不进行跳转。
 * refresh 显示 message 页面后，重新跳转到当前执行的页面
 * referer 显示 message 页面后，回退到当前执行页面的上一页面
 * $url string 跳转到指定页面
 * </pre>
 * @param string $type 提示类型，取值不同，消息页面呈现不同效果。
 * <pre>
 * success  成功
 * error	错误
 * info	 提示(灯泡)
 * warning  警告(叹号)
 * ajax	 json 不跳转到 message 页面，但是页面输出 json
 * sql
 * </pre>
 */
function message($msg, $redirect = '', $type = '') {
	global $_W;
	if($redirect == 'refresh') {
		$redirect = $_W['script_name'] . '?' . $_SERVER['QUERY_STRING'];
	} elseif (!empty($redirect) && !strexists($redirect, 'http://')) {
		$urls = parse_url($redirect);
		$redirect = $_W['siteroot'] . 'app/index.php?' . $urls['query'];
	} else {
				$redirect = safe_gpc_url($redirect);
	}
	if($redirect == '') {
		$type = in_array($type, array('success', 'error', 'info', 'warning', 'ajax', 'sql')) ? $type : 'info';
	} else {
		$type = in_array($type, array('success', 'error', 'info', 'warning', 'ajax', 'sql')) ? $type : 'success';
	}
	if($_W['isajax'] || $type == 'ajax') {
		$vars = array();
		$vars['message'] = $msg;
		$vars['redirect'] = $redirect;
		$vars['type'] = $type;
		exit(json_encode($vars));
	}
	if (empty($msg) && !empty($redirect)) {
		header('location: '.$redirect);
	}
	$label = $type;
	if($type == 'error') {
		$label = 'danger';
	}
	if($type == 'ajax' || $type == 'sql') {
		$label = 'warning';
	}
	if (defined('IN_API')) {
		exit($msg);
	}
	include template('common/message', TEMPLATE_INCLUDEPATH);
	exit();
}

function itoast($msg, $redirect = '', $type = '') {
	return message($msg, $redirect, $type);
}

/**
 *  微站端或微信会话时粉丝用户身份验证
 * @return
 * <pre>
 * 1. true  ：已注册粉丝用户；
 * 2. string：通过 ajax 方式访问的未注册用户，返回 json 编码的注册信息
 * 3. void  ：通过普通链接访问的未注册用户，跳转到注册地址。微站端通过普通链接访问的未注册用户，跳转到【用户登录】界面；微信会话时,在processor 中执行, 未注册用户跳转到【注册】界面
 * </pre>
 */
function checkauth() {
	global $_W, $engine;
	load()->model('mc');
	load()->model('account');
	// 如果存在会员用户，则表示已经登录
	if(!empty($_W['member']) && (!empty($_W['member']['mobile']) || !empty($_W['member']['email']))) {
		return true;
	}
	if(!empty($_W['openid'])) {
		$fan = mc_fansinfo($_W['openid'], $_W['acid'], $_W['uniacid']);
				if (empty($fan) && $_W['account']['level'] == ACCOUNT_SERVICE_VERIFY) {
			$fan = mc_oauth_userinfo();
			if (!empty($fan['openid'])) {
				$fan = mc_fansinfo($fan['openid']);
			}
		}

		if (empty($fan['uid'])) {
			$setting = uni_setting($_W['uniacid'], array('passport'));
			if (!isset($setting['passport']) || empty($setting['passport']['focusreg'])) {
				$reg_members = mc_init_fans_info($_W['openid'], true);
				$fan['uid'] = $reg_members['uid'];
			}
		}

		if(_mc_login(array('uid' => intval($fan['uid'])))) {
			return true;
		}
		if (defined('IN_API')) {
			$GLOBALS['engine']->died("抱歉，您需要先登录才能使用此功能，点击此处 <a href='".__buildSiteUrl(url('auth/login')) ."'>【登录】</a>");
		}
	}
	
	$forward = base64_encode($_SERVER['QUERY_STRING']); // 记住要访问地址
	if($_W['isajax']) {
		$result = array();
		$result['url'] = url('auth/login', array('forward' => $forward), true);
		$result['act'] = 'redirect';
		exit(json_encode($result));
	} else {
		header("location: " . url('auth/login', array('forward' => $forward)), true);
	}
	exit;
}

/**
 * @param $url
 * @return string
 */
function __buildSiteUrl($url) {
	global $_W, $engine;
	$mapping = array(
			'[from]' => $engine->message['from'],
			'[to]' => $engine->message['to'],
			'[uniacid]' => $_W['uniacid'],
	);
	$url = str_replace(array_keys($mapping), array_values($mapping), $url);
	
	$pass = array();
	$pass['openid'] = $engine->message['from'];
	$pass['acid'] = $_W['acid'];

	$sql = 'SELECT `fanid`,`salt`,`uid` FROM ' . tablename('mc_mapping_fans') . ' WHERE `acid`=:acid AND `openid`=:openid';
	$params = array();
	$params[':acid'] = $_W['acid'];
	$params[':openid'] = $pass['openid'];
	$fan = pdo_fetch($sql, $params);
	if(empty($fan) || !is_array($fan) || empty($fan['salt'])) {
		$fan = array('salt' => '');
	}
	$pass['time'] = TIMESTAMP;
	$pass['hash'] = md5("{$pass['openid']}{$pass['time']}{$fan['salt']}{$_W['config']['setting']['authkey']}");
	$auth = base64_encode(json_encode($pass));

	$vars = array();
	$vars['uniacid'] = $_W['uniacid'];
	$vars['__auth'] = $auth;
	$vars['forward'] = base64_encode($url);

	return $_W['siteroot'] . 'app/' . url('auth/forward', $vars);
}

/**
 * 可以在 app 端使用, 在不使用系统 {template ‘common/header’} 及 {template ‘common/footer’} 的页面中, 在头部先于任何 js 文件引入, 调用此方法, 即可注册 wx 对象, 供开发者使用 jssdk
 * @param bool $debug 是否启用调试
 */
function register_jssdk($debug = false){
	
	global $_W;
	
	if (defined('HEADER')) {
		echo '';
		return;
	}
	
	$sysinfo = array(
		'uniacid' 	=> $_W['uniacid'],
		'acid' 		=> $_W['acid'],
		'siteroot' 	=> $_W['siteroot'],
		'siteurl' 	=> $_W['siteurl'],
		'attachurl' => $_W['attachurl'],
		'cookie' 	=> array('pre'=>$_W['config']['cookie']['pre'])
	);
	if (!empty($_W['acid'])) {
		$sysinfo['acid'] = $_W['acid'];
	}
	if (!empty($_W['openid'])) {
		$sysinfo['openid'] = $_W['openid'];
	}
	if (defined('MODULE_URL')) {
		$sysinfo['MODULE_URL'] = MODULE_URL;
	}
	$sysinfo = json_encode($sysinfo);
	$jssdkconfig = json_encode($_W['account']['jssdkconfig']);
	$debug = $debug ? 'true' : 'false';
	
	$script = <<<EOF

<script src="https://res.wx.qq.com/open/js/jweixin-1.3.2.js"></script>
<script type="text/javascript">
	window.sysinfo = window.sysinfo || $sysinfo || {};
	
	// jssdk config 对象
	jssdkconfig = $jssdkconfig || {};
	
	// 是否启用调试
	jssdkconfig.debug = $debug;
	
	jssdkconfig.jsApiList = [
		'checkJsApi',
		'onMenuShareTimeline',
		'onMenuShareAppMessage',
		'onMenuShareQQ',
		'onMenuShareWeibo',
		'hideMenuItems',
		'showMenuItems',
		'hideAllNonBaseMenuItem',
		'showAllNonBaseMenuItem',
		'translateVoice',
		'startRecord',
		'stopRecord',
		'onRecordEnd',
		'playVoice',
		'pauseVoice',
		'stopVoice',
		'uploadVoice',
		'downloadVoice',
		'chooseImage',
		'previewImage',
		'uploadImage',
		'downloadImage',
		'getNetworkType',
		'openLocation',
		'getLocation',
		'hideOptionMenu',
		'showOptionMenu',
		'closeWindow',
		'scanQRCode',
		'chooseWXPay',
		'openProductSpecificView',
		'addCard',
		'chooseCard',
		'openCard'
	];
	
	wx.config(jssdkconfig);
	
</script>
EOF;
	echo $script;
}

function tourl($url) {
	$reg = '/^tel:(\d+)$/';
	if (preg_match($reg, $url)) {
		return $url;
	}
	return $url . '&wxref=mp.weixin.qq.com#wechat_redirect';
}