<?php
/**
 * 【超人】签到模块定义
 *
 * @author 超人
 * @url http://bbs.we7.cc/thread-9502-1-1.html
 */
defined('IN_IA') or exit('Access Denied');
require IA_ROOT.'/addons/superman_daka/common.func.php';
require IA_ROOT.'/addons/superman_daka/model.func.php';
class Superman_dakaModule extends WeModule {
    public $module;
    private $_data = array();
    public function settingsDisplay($settings) {
        global $_W, $_GPC;
        load()->func('tpl');
        if (!$this->module['config']['_init']) {
            $this->_data = array(
                '_init' => 1,
                'wxapp' => array(),
            );
            $this->saveSettings($this->_data);
            load()->model('module');
            $this->module = module_fetch('superman_daka');
        } else {
            $this->_data = array(
                '_init' => 1,
                'wxapp' => $this->module['config']['wxapp'],
            );
            if (empty($this->_data['wxapp'])) {
                $this->module['config']['wxapp'] = $this->_data['wxapp'] = array(
                    'avatar_early' => $_W['siteroot'].'/addons/superman_daka/images/avatar.jpg',
                    'avatar_lucky' => $_W['siteroot'].'/addons/superman_daka/images/avatar.jpg',
                    'avatar_stamina' => $_W['siteroot'].'/addons/superman_daka/images/avatar.jpg',
                );
            }
        }

        if (checksubmit('submit')) {
            $this->_setting_wxapp();
            $this->saveSettings($this->_data);
            message('更新成功！', referer(), 'success');
        }
        include $this->template('setting');
    }
    private function _setting_wxapp() {
        global $_W, $_GPC;
        $this->_data['wxapp'] = array(
            'money' => $_GPC['wxapp']['money'],
            'index_imgbg' => $_GPC['wxapp']['index_imgbg'],
            'my_imgbg' => $_GPC['wxapp']['my_imgbg'],
            'rule' => $_GPC['wxapp']['rule'],
            'auto_reward' => $_GPC['wxapp']['auto_reward']?1:0,
        );

        //支付证书保存
        $del = $_GPC['wxapp'];
        $_W['setting']['upload']['image']['limit'] = 1000; //KB
        $_W['setting']['upload']['image']['extentions'][] = 'pem';
        $arr = array(
            'apiclient_cert',
            'apiclient_key',
            'rootca'
        );
        foreach ($arr as $k) {
            $this->_data['wxapp'][$k] = isset($this->module['config']['wxapp'][$k])?$this->module['config']['wxapp'][$k]:'';
            //删除所选证书
            if (isset($this->module['config']['wxapp'][$k]) && $this->module['config']['wxapp'][$k]) {
                $path[$k] = ATTACHMENT_ROOT.$this->module['config']['wxapp'][$k];
                if ($del['del_'.$k]) {
                    if (file_exists($path[$k])) {
                        @unlink($path[$k]);
                    }
                    $this->_data['wxapp'][$k] = '';
                }
            }
            //保存新证书
            if (!empty($_FILES[$k]['tmp_name'])) {
                $file = array(
                    'name' => $_FILES[$k]['name'],
                    'tmp_name' => $_FILES[$k]['tmp_name'],
                    'type' => $_FILES[$k]['type'],
                    'error' => $_FILES[$k]['error'],
                    'size' => $_FILES[$k]['size'],
                );
                $upload = file_upload($file, 'image');
                if (!$upload['success']) {
                    message($upload['errno'].':'.$upload['message']);
                }
                if (isset($path[$k]) && file_exists($path[$k])) {
                    @unlink($path[$k]);
                }
                $this->_data['wxapp'][$k] = $upload['path'];
            }
        }
    }
}