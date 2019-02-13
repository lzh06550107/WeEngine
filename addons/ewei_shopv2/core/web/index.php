<?php
if (!defined('IN_IA')) {
	exit('Access Denied');
}

class Index_EweiShopV2Page extends WebPage
{
	public function main()
	{
		global $_W;
		global $_GPC;

		if (empty($_W['shopversion'])) {
			header('location:' . webUrl('shop'));
			exit();
		}

		$shop_data = m('common')->getSysset('shop');
		$merch_plugin = p('merch');
		$merch_data = m('common')->getPluginset('merch');
		if ($merch_plugin && $merch_data['is_openmerch']) {
			$is_openmerch = 1;
		}
		else {
			$is_openmerch = 0;
		}

		$hascommission = false;

		if (p('commission')) {
			$hascommission = 0 < intval($_W['shopset']['commission']['level']);
		}

		$ordercol = 6;
		if (cv('goods') && cv('order')) {
			$ordercol = 6;
		}
		else {
			if (cv('goods') && !cv('order')) {
				$ordercol = 12;
			}
			else {
				if (cv('order') && !cv('goods')) {
					$ordercol = 12;
				}
				else {
					$ordercol = 0;
				}
			}
		}

		$pluginnum = m('plugin')->getCount();
		$no_left = true;
		include $this->template();
	}

	public function searchlist()
	{
		global $_W;
		global $_GPC;
		$return_arr = array();
		$menu = m('system')->getSubMenus(true, true);
		$keyword = trim($_GPC['keyword']);
		if (empty($keyword) || empty($menu)) {
			show_json(1, array('menu' => $return_arr));
		}

		foreach ($menu as $index => $item) {
			if (strexists($item['title'], $keyword) || strexists($item['desc'], $keyword) || strexists($item['keywords'], $keyword) || strexists($item['topsubtitle'], $keyword)) {
				if (cv($item['route'])) {
					$return_arr[] = $item;
				}
			}
		}

		show_json(1, array('menu' => $return_arr));
	}

	public function search()
	{
		global $_W;
		global $_GPC;
		$keyword = trim($_GPC['keyword']);
		$list = array();
		$history = $_GPC['history_search'];

		if (empty($history)) {
			$history = array();
		}
		else {
			$history = htmlspecialchars_decode($history);
			$history = json_decode($history, true);
		}

		if (!empty($keyword)) {
			$submenu = m('system')->getSubMenus(true, true);

			if (!empty($submenu)) {
				foreach ($submenu as $index => $submenu_item) {
					$top = $submenu_item['top'];
					if (strexists($submenu_item['title'], $keyword) || strexists($submenu_item['desc'], $keyword) || strexists($submenu_item['keywords'], $keyword) || strexists($submenu_item['topsubtitle'], $keyword)) {
						if (cv($submenu_item['route'])) {
							if (!is_array($list[$top])) {
								$title = !empty($submenu_item['topsubtitle']) ? $submenu_item['topsubtitle'] : $submenu_item['title'];

								if (strexists($title, $keyword)) {
									$title = str_replace($keyword, '<b>' . $keyword . '</b>', $title);
								}

								$list[$top] = array(
	'title' => $title,
	'items' => array()
	);
							}

							if (strexists($submenu_item['title'], $keyword)) {
								$submenu_item['title'] = str_replace($keyword, '<b>' . $keyword . '</b>', $submenu_item['title']);
							}

							if (strexists($submenu_item['desc'], $keyword)) {
								$submenu_item['desc'] = str_replace($keyword, '<b>' . $keyword . '</b>', $submenu_item['desc']);
							}

							$list[$top]['items'][] = $submenu_item;
						}
					}
				}
			}

			if (empty($history)) {
				$history_new = array($keyword);
			}
			else {
				$history_new = $history;

				foreach ($history_new as $index => $key) {
					if ($key == $keyword) {
						unset($history_new[$index]);
					}
				}

				$history_new = array_merge(array($keyword), $history_new);
				$history_new = array_slice($history_new, 0, 20);
			}

			isetcookie('history_search', json_encode($history_new), 7 * 86400);
			$history = $history_new;
		}

		include $this->template();
	}

	public function clearhistory()
	{
		global $_W;
		global $_GPC;

		if ($_W['ispost']) {
			$type = intval($_GPC['type']);

			if (empty($type)) {
				isetcookie('history_url', '', -7 * 86400);
			}
			else {
				isetcookie('history_search', '', -7 * 86400);
			}
		}

		show_json(1);
	}

	public function switchversion()
	{
		global $_W;
		global $_GPC;
		$route = trim($_GPC['route']);
		$id = intval($_GPC['id']);
		$set = pdo_fetch('SELECT * FROM ' . tablename('ewei_shop_version') . ' WHERE uid=:uid AND `type`=0', array(':uid' => $_W['uid']));
		$data = array('version' => !empty($_W['shopversion']) ? 0 : 1);

		if (empty($set)) {
			$data['uid'] = $_W['uid'];
			pdo_insert('ewei_shop_version', $data);
		}
		else {
			pdo_update('ewei_shop_version', $data, array('id' => $set['id']));
		}

		$params = array();

		if (!empty($id)) {
			$params['id'] = $id;
		}

		load()->model('cache');
		cache_build_template();
		header('location: ' . webUrl($route, $params));
		exit();
	}

	/**
     * 获取二维码
     * @return string
     */
	public function saoma1()
	{
		load()->func('communication');
		$content = ihttp_get('https://open.weixin.qq.com/connect/qrconnect?appid=wxde40e023744664cb&redirect_uri=https%3a%2f%2fmp.weixin.qq.com%2fdebug%2fcgi-bin%2fwebdebugger%2fqrcode&scope=snsapi_login&state=login#wechat_redirect');
		preg_match('/src="\\/(connect\\/qrcode\\/.+)"/', $content['content'], $images);
		$uuid = substr(strrchr($images[1], '/'), 1);
		show_json(1, array('uuid' => $uuid, 'qrcode' => 'https://open.weixin.qq.com/' . $images[1]));
	}

	/**
     * 获取二维码状态
     */
	public function saoma2()
	{
		global $_GPC;
		load()->func('communication');
		$status = ihttp_request('https://long.open.weixin.qq.com/connect/l/qrconnect?uuid=' . $_GPC['uuid'] . '&_=' . time(), '', array(), 2);

		if (empty($status['content'])) {
			show_json(0);
		}

		preg_match('/window.wx_errcode=(\\d+);window.wx_code=[\'|"](.*)[\'|"];/', $status['content'], $status_code);
		show_json(1, array('wx_errcode' => $status_code[1], 'wx_code' => $status_code[2]));
	}

	/**
     *
     */
	public function saoma3()
	{
		global $_GPC;
		load()->func('communication');
		$status = ihttp_request('https://mp.weixin.qq.com/debug/cgi-bin/webdebugger/qrcode?code=' . $_GPC['code'] . '&state=win&os=win&clientversion=1.02.1802270');

		if (empty($status['content'])) {
			show_json(0);
		}

		$userinfo = json_decode($status['content'], true);

		if ($userinfo['baseresponse']['errcode'] == 0) {
			$ticket = $status['headers']['Debugger-Ticket'];
			$new_ticket = $status['headers']['Debugger-NewTicket'];
			$signature = $status['headers']['Debugger-Signature'];
			show_json(1, array('new_ticket' => $new_ticket));
		}
	}

	public function tijiao()
	{
		$url = 'https://servicewechat.com/wxa-dev/commitsource?';
		$params = array('_r' => $this->randFloat(), 'appid' => 'wxcf6d632ad7097603', 'platform' => '1', 'ext_appid' => '', 'os' => 'win', 'clientversion' => '1021802270', 'user-version' => '2222222', 'user-desc' => '木易水模拟提交1', 'uuid' => 'undefined', 'gzip' => '1', 'newticket' => 'lUaivOKnLf-8FX7Dy3yEldIBGnVwMV_OD-X0HctLiKA');
		$url .= http_build_query($params);
		$res = $this->sendStreamFile($url, __DIR__ . '/1520402739860.wx');
		dump($res);
	}

	/** php 发送流文件
     * @param  String  $url  接收的路径
     * @param  String  $file 要发送的文件
     * @return boolean
     */
	public function sendStreamFile1($url, $file)
	{
		if (file_exists($file)) {
			$opts = array(
				'http' => array('method' => 'POST', 'header' => 'content-type:application/x-www-form-urlencoded', 'content' => file_get_contents($file))
				);
			$context = stream_context_create($opts);
			$response = file_get_contents($url, false, $context);
			$ret = json_decode($response, true);
			return $ret;
		}

		return false;
	}

	/** php 发送流文件
     * @param  String  $url  接收的路径
     * @param  String  $file 要发送的文件
     * @return boolean
     */
	public function sendStreamFile($url, $file)
	{
		load()->func('communication');
		$status = ihttp_request($url, file_get_contents($file), array('header' => 'content-type:application/x-www-form-urlencoded'));
		return json_decode($status['content'], true);
	}
}

?>
