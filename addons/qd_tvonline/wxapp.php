<?php
/**
 * qd_tvonline模块小程序接口定义
 *
 * @author Mob118100428654
 * @url 
 */
defined('IN_IA') or exit('Access Denied');

require_once IA_ROOT . '/addons/qd_tvonline/vendor/autoload.php';

class Qd_tvonlineModuleWxapp extends WeModuleWxapp {
    /* 重写微擎的路由方法 */
    public function __call($name, $arguments)
    {
        global $_GPC;
        $class = ucfirst(substr($name, 6));  // 类名
        $file = MODULE_ROOT . '/api/' . $class . '.php';
        if (!is_file($file)) {
            header("Content-type: application/json; charset=utf-8");
            exit(json_encode([
                'code' => 1,
                'msg' => '未找到接口类',
                'time' => time(),
                'data' => $file,
            ], JSON_UNESCAPED_SLASHES));
        }
        require_once $file;
        $instance = new $class();
        $method = $_GPC['op'] ? $_GPC['op'] : 'index';
        $instance->$method();
    }
}