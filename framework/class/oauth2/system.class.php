<?php
/**
 * 系统用户登录
 * [WeEngine System] Copyright (c) 2013 WE7.CC
 */

class System extends OAuth2Client {
	private $calback_url;

	public function __construct($ak, $sk) {
		parent::__construct($ak, $sk);
	}

    /**
     * 本地登录，不需要
     * @param string $calback_url
     * @return mixed|string
     */
	public function showLoginUrl($calback_url = '') {
		return '';
	}

    /**
     * 检查验证码并收集有效的用户登录信息
     *
     * 1、检验用户是否连续登录错误超过5次
     * 2、校验验证码是否正确
     * 3、校验用户名称和密码是否不为空
     *
     * @return array
     */
	public function user() {
		global $_GPC, $_W;
		$username = trim($_GPC['username']);
		// 删除5分钟之前的登录失败记录
		pdo_delete('users_failed_login', array('lastupdate <' => TIMESTAMP-300));
		// 根据用户名称和ip地址来标识唯一登录用户
		$failed = pdo_get('users_failed_login', array('username' => $username, 'ip' => CLIENT_IP));
		if ($failed['count'] >= 5) {
			return error('-1', '输入密码错误次数超过5次，请在5分钟后再登录');
		}
		if (!empty($_W['setting']['copyright']['verifycode'])) {
			$verify = trim($_GPC['verify']);
			if (empty($verify)) {
				return error('-1', '请输入验证码');
			}
			$result = checkcaptcha($verify); // 检查验证码
			if (empty($result)) {
				return error('-1', '输入验证码错误');
			}
		}
		if (empty($username)) {
			return error('-1', '请输入要登录的用户名');
		}
		$member['username'] = $username;
		$member['password'] = $_GPC['password'];
		if (empty($member['password'])) {
			return error('-1', '请输入密码');
		}
		return $member;
	}

    /**
     * 负责对提交的字段进行验证
     * @return array|int
     */
	public function register(){
		global $_GPC;
		load()->model('user');
		$member = array();
		$profile = array();
		$member['username'] = trim($_GPC['username']);
		$member['owner_uid'] = intval($_GPC['owner_uid']); // 怎么会有？？
		$member['password'] = $_GPC['password'];

		if(!preg_match(REGULAR_USERNAME, $member['username'])) {
			return error(-1, '必须输入用户名，格式为 3-15 位字符，可以包括汉字、字母（不区分大小写）、数字、下划线和句点。');
		}

		if(user_check(array('username' => $member['username']))) {
			return error(-1, '非常抱歉，此用户名已经被注册，你需要更换注册名称！');
		}

		if(!empty($_W['setting']['register']['code'])) {
			if (!checkcaptcha($_GPC['code'])) {
				return error(-1, '你输入的验证码不正确, 请重新输入.');
			}
		}
		if(istrlen($member['password']) < 8) {
			return error(-1, '必须输入密码，且密码长度不得低于8位。');
		}

		// 验证必填扩展字段
		$extendfields = $this->systemFields();
		if (!empty($extendfields)) {
			$fields = array_keys($extendfields);
			if(in_array('birthyear', $fields)) {
				$extendfields[] = array('field' => 'birthmonth', 'title' => '出生生日', 'required' => $extendfields['birthyear']['required']);
				$extendfields[] = array('field' => 'birthday', 'title' => '出生生日', 'required' => $extendfields['birthyear']['required']);
				$_GPC['birthyear'] = $_GPC['birth']['year'];
				$_GPC['birthmonth'] = $_GPC['birth']['month'];
				$_GPC['birthday'] = $_GPC['birth']['day'];
			}
			if(in_array('resideprovince', $fields)) {
				$extendfields[] = array('field' => 'residecity', 'title' => '居住地址', 'required' => $extendfields['resideprovince']['required']);
				$extendfields[] = array('field' => 'residedist', 'title' => '居住地址', 'required' => $extendfields['resideprovince']['required']);
				$_GPC['resideprovince'] = $_GPC['reside']['province'];
				$_GPC['residecity'] = $_GPC['reside']['city'];
				$_GPC['residedist'] = $_GPC['reside']['district'];
			}
			foreach ($extendfields as $row) {
				if (!empty($row['required']) && empty($_GPC[$row['field']])) {
					return error(-1, '“'.$row['title'].'”此项为必填项，请返回填写完整！');
				}
				$profile[$row['field']] = $_GPC[$row['field']];
			}
		}

		$register =  array(
			'member' => $member,
			'profile' => $profile
		);
		return parent::user_register($register);
	}

    /**
     * 获取注册字段
     * @return mixed
     */
	public function systemFields() {
		$user_table = table('users');
		return $user_table->userProfileFields(); // 从profile_fields表中获取注册字段
	}

	public function login() {
		return $this->user();
	}

	public function bind() {
		return true;
	}

	public function unbind() {
		return true;
	}
}