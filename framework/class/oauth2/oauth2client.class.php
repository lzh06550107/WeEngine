<?php

/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 * 第三方登录组件
 */
abstract class OAuth2Client {
	protected $ak; // appId
	protected $sk; // appsecret
	protected $login_type; // 登录类型，包括'system', 'qq', 'wechat', 'mobile'
	protected $stateParam = array(
		'state' => '', //token
		'from' => '',
		'mode' => ''
	);

	public function __construct($ak, $sk) {
		$this->ak = $ak;
		$this->sk = $sk;
	}

    /**
     * 构建状态参数
     * @return string
     */
	public function stateParam() {
		global $_W;
		$this->stateParam['state'] = $_W['token'];
		if (!empty($_W['user'])) {
			$this->stateParam['mode'] = 'bind';
		} else {
			$this->stateParam['mode'] = 'login';
		}
		return base64_encode(http_build_query($this->stateParam, '', '&'));
	}

    /**
     * 设置登录类型
     * @param $login_type 登录类型
     *
     * TODO 需要修改为setLoginType
     */
	public function getLoginType($login_type) {
		$this->login_type = $login_type;
	}

    /**
     * 支持的登录类型
     * @return array
     */
	public static function supportLoginType(){
		return array('system', 'qq', 'wechat', 'mobile');
	}

    /**
     * 支持的第三方登录类型
     * @return array
     */
	public static function supportThirdLoginType() {
		return array('qq', 'wechat');
	}

    /**
     * 支持的第三方处理模式
     * @return array
     */
	public static function supportThirdMode() {
		return array('bind', 'login');
	}

    /**
     * 判断state是否是第三方登录state
     * @param $state
     * @return array
     */
	public static function supportParams($state) {
		$state = urldecode($state);
		$param = array();
		if (!empty($state)) {
			$state = base64_decode($state);
			parse_str($state, $third_param);
			$modes = self::supportThirdMode();
			$types = self::supportThirdLoginType();

			if (in_array($third_param['mode'],$modes) && in_array($third_param['from'],$types)) {
				return $third_param;
			}
		}
		return $param; // 如果不是第三方登录状态，则返回空数组
	}

    /**
     * 创建对应类型的登录实例对象
     * @param $type 登录类型
     * @param string $appid 应用appid
     * @param string $appsecret 应用appsecret
     * @return null
     */
	public static function create($type, $appid = '', $appsecret = '') {
		$types = self::supportLoginType();
		if (in_array($type, $types)) {
			load()->classs('oauth2/' . $type);
			$type_name = ucfirst($type);
			$obj = new $type_name($appid, $appsecret); // 实例化对象
			$obj->getLoginType($type); // 设置登录类型
			return $obj;
		}
		return null;
	}

    /**
     * 获取启动登录的地址
     * @param string $calback_url 回调地址
     * @return mixed
     */
	abstract function showLoginUrl($calback_url = '');

	abstract function user();

    /**
     * 登录
     * @return mixed
     */
	abstract function login();

	abstract function bind();
	abstract function unbind();

    /**
     * 负责对提交的字段进行验证
     * @return mixed
     */
	abstract function register();

    /**
     * 注册
     * @param $register
     * @return array|int
     */
	public function user_register($register) {
		global $_W;
		load()->model('user');

		if (is_error($register)) {
			return $register;
		}
		$member = $register['member'];
		$profile = $register['profile'];

		$member['status'] = !empty($_W['setting']['register']['verify']) ? 1 : 2; // 是否需要审核
		$member['remark'] = '';
		$member['groupid'] = intval($_W['setting']['register']['groupid']); // 默认组
		if (empty($member['groupid'])) {
			$member['groupid'] = pdo_fetchcolumn('SELECT id FROM '.tablename('users_group').' ORDER BY id ASC LIMIT 1');
			$member['groupid'] = intval($member['groupid']);
		}
		$group = user_group_detail_info($member['groupid']);

		// 用户有效时间由组截止时间决定
		$timelimit = intval($group['timelimit']);
		if($timelimit > 0) {
			$member['endtime'] = strtotime($timelimit . ' days');
		}
		$member['starttime'] = TIMESTAMP;
		if (!empty($owner_uid)) {
			$member['owner_uid'] = pdo_getcolumn('users', array('uid' => $owner_uid, 'founder_groupid' => ACCOUNT_MANAGE_GROUP_VICE_FOUNDER), 'uid');
		}

		$user_id = user_register($member);
		// 如果通过qq、wechat、手机号码注册，则随机生成一个用户名称
		if (in_array($member['register_type'], array(USER_REGISTER_TYPE_QQ, USER_REGISTER_TYPE_WECHAT, USER_REGISTER_TYPE_MOBILE))) {
			pdo_update('users', array('username' => $member['username'] . $user_id . rand(100,999)), array('uid' => $user_id));
		}
		if($user_id > 0) {
			unset($member['password']);
			$member['uid'] = $user_id;
			if (!empty($profile)) {
				$profile['uid'] = $user_id;
				$profile['createtime'] = TIMESTAMP;
				pdo_insert('users_profile', $profile); // 更新用户详情表
			}
			// 对于通过qq、wechat、手机号码注册的用户，需要建立绑定
			if (in_array($member['register_type'], array(USER_REGISTER_TYPE_QQ, USER_REGISTER_TYPE_WECHAT, USER_REGISTER_TYPE_MOBILE))) {
				pdo_insert('users_bind', array('uid' => $user_id, 'bind_sign' => $member['openid'], 'third_type' => $member['register_type'], 'third_nickname' => $member['username']));
			}
			if (in_array($member['register_type'], array(USER_REGISTER_TYPE_QQ, USER_REGISTER_TYPE_WECHAT))) {
				return $user_id;
			}
			// 注意这里
			return error(0, '注册成功'.(!empty($_W['setting']['register']['verify']) ? '，请等待管理员审核！' : '，请重新登录！'));
		}

		return error(-1, '增加用户失败，请稍候重试或联系网站管理员解决！');
	}
}