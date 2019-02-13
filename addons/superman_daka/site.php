<?php
/**
 * 【超人】签到模块卸载
 *
 * @author 超人
 * @url http://bbs.we7.cc/thread-9502-1-1.html
 */
defined('IN_IA') or exit('Access Denied');
load()->model('mc');
load()->func('tpl');
load()->func('file');
load()->model('mc');
load()->model('module');
require IA_ROOT.'/addons/superman_daka/common.func.php';
require IA_ROOT.'/addons/superman_daka/model.func.php';
require IA_ROOT.'/addons/superman_daka/class/util.class.php';
class Superman_dakaModuleSite extends WeModuleSite {
    public $module;
    public function __construct() {
        global $_GPC, $_W, $do;
        $this->uniacid = $_W['uniacid'];
        $this->modulename = 'superman_daka';
        $this->module = module_fetch($this->modulename);
        $this->__define = IA_ROOT . "/addons/{$this->modulename}/module.php";
        $this->inMobile = defined('IN_MOBILE');
        //do变量初始化
        if (!isset($_GPC['do']) && isset($_GPC['eid']) && $_GPC['eid']) {
            $eid = intval($_GPC['eid']);
            $sql = "SELECT `do` FROM ".tablename('modules_bindings')." WHERE eid=:eid";
            $params = array(
                ':eid' => $eid,
            );
            $do = pdo_fetchcolumn($sql, $params);
        }
    }
}
