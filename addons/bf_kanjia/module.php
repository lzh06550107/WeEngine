<?php
defined('IN_IA') or exit('Access Denied');
class Bf_kanjiaModule extends WeModule
{
	public function __construct()
	{
		global $_W;
        include_once dirname(__FILE__) . '/libs.php';
		if ($_W["role"] == "operator") { // 如果是操作员，则没有管理权限
			message($i18n["competence_error"], "", "error");
			exit();
		}
	}
	public function fieldsFormDisplay($rid = 0)
	{
	}
	public function fieldsFormValidate($rid = 0)
	{
	}
	public function fieldsFormSubmit($rid)
	{
	}
	public function ruleDeleted($rid)
	{
	}
	// 模块全局配置参数
	public function settingsDisplay($settings)
	{
		global $_W, $_GPC;
		if (checksubmit()) {
			$data = array(
				"qrcode_password" => trim($_GPC["qrcode_password"]),
				"share_title" => trim($_GPC["share_title"]),
				"share_link" => trim($_GPC["share_link"]),
				"share_imgUrl" => trim($_GPC["share_imgUrl"]),
				"share_desc" => trim($_GPC["share_desc"])
			);
			$this->saveSettings($data); // 保存模块设置
			message('操作成功', referer(), 'success');
		}
		load()->func('tpl');
		include $this->template('setting');
	}
}