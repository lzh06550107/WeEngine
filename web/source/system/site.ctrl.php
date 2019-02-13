<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

load()->model('system');

$dos = array('copyright');
$do = in_array($do, $dos) ? $do : 'copyright';
$_W['page']['title'] = '站点设置 - 工具  - 系统管理';

// 获取站点设置
$settings = $_W['setting']['copyright'];
if (empty($settings) || !is_array($settings)) {
    $settings = array();
} else {
    // 站点滑动幻灯片
    $settings['slides'] = iunserializer($settings['slides']);
}

// 获取所有的模板主题
$path = IA_ROOT . '/web/themes/';
if (is_dir($path)) {
    if ($handle = opendir($path)) {
        while (false !== ($templatepath = readdir($handle))) {
            if ($templatepath != '.' && $templatepath != '..') {
                if (is_dir($path . $templatepath)) {
                    $template[] = $templatepath;
                }
            }
        }
    }
}

if ($do == 'copyright') {

    $template_ch_name = system_template_ch_name(); // 获取系统后台主题

    if (checksubmit('submit')) {

        $data = array(
            'status' => intval($_GPC['status']), // 是否关闭站点
            'verifycode' => intval($_GPC['verifycode']), // 是否开启验证码
            'reason' => trim($_GPC['reason']),
            'sitename' => trim($_GPC['sitename']), // 网站名称
            'url' => (strexists($_GPC['url'], 'http://') || strexists($_GPC['url'], 'https://')) ? $_GPC['url'] : "http://{$_GPC['url']}", // 网站URL
            'statcode' => preg_match('/https\:\/\/hm\.baidu\.com\/hm\.js\?/', $_GPC['statcode']) ? htmlspecialchars_decode($_GPC['statcode']) : safe_gpc_html(htmlspecialchars_decode($_GPC['statcode'])), // 第三方统计代码
            'footerleft' => safe_gpc_html(htmlspecialchars_decode($_GPC['footerleft'])), // 底部左侧信息（下）
            'footerright' => safe_gpc_html(htmlspecialchars_decode($_GPC['footerright'])), // 底部右侧信息（上）
            'icon' => trim($_GPC['icon']), // 网站favorite icon
            'flogo' => trim($_GPC['flogo']), // 前台LOGO
            'background_img' => trim($_GPC['background_img']), // 背景图片
            'slides' => iserializer($_GPC['slides']), // 前台幻灯片
            'notice' => trim($_GPC['notice']), // 前台幻灯片显示文字
            'blogo' => trim($_GPC['blogo']), // 后台LOGO
            'baidumap' => $_GPC['baidumap'], // 地理位置，分为baidumap[lng]经度；baidumap[lat]纬度
            'company' => trim($_GPC['company']), // 公司名称
            'companyprofile' => safe_gpc_html(htmlspecialchars_decode($_GPC['companyprofile'])), // 关于我们
            'address' => trim($_GPC['address']), // 详细地址
            'person' => trim($_GPC['person']), // 联系人
            'phone' => trim($_GPC['phone']), // 联系电话
            'qq' => trim($_GPC['qq']), // QQ号
            'email' => trim($_GPC['email']), // 邮箱
            'keywords' => trim($_GPC['keywords']), // 网站关键字
            'description' => trim($_GPC['description']), // 网站描述
            'showhomepage' => intval($_GPC['showhomepage']), // 是否显示首页
            'leftmenufixed' => (!empty($_GPC['leftmenu_fixed'])) ? 1 : 0, // 左侧菜单是否固定
            'mobile_status' => $_GPC['mobile_status'], // 是否开启手机登录
            'login_type' => $_GPC['login_type'], // 默认登录方式，分为帐号密码登录和手机登录
            'log_status' => intval($_GPC['log_status']), // 是否开启日志
            'develop_status' => intval($_GPC['develop_status']), // 是否开启调试模式
            'icp' => safe_gpc_string($_GPC['icp']), // 备案号
            'bind' => $_GPC['bind'] // 强制绑定信息，包括无、qq、微信、手机号
        );

        $test = setting_save($data, 'copyright');
        $template = trim($_GPC['template']);
        // template表示后台主题
        setting_save(array('template' => $template), 'basic');
        itoast('更新设置成功！', url('system/site'), 'success');
    }
}
template('system/site');