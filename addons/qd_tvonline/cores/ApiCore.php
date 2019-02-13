<?php
/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/24
 * Time: 10:26
 */

namespace Cores;

class ApiCore
{
    /**
     * 无需登录的方法,同时也就不需要鉴权了
     * @var array
     */
    protected $noNeedLogin = [];

    /**
     * 无需鉴权的方法,但需要登录
     * @var array
     */
    protected $noNeedRight = ['*'];

    /**
     * 用户数据 登录后才有
     * @var array
     */
    protected $user;

    public function __construct()
    {
        $this->opAuth(); // 操作鉴权
    }

    protected function opAuth()
    {
        global $_GPC;
        // 无需登录的方法
        foreach ($this->noNeedLogin as $noNeedLogin) {
            if ($noNeedLogin === '*' || $noNeedLogin === $_GPC['op']) {
                return true;    // 同时也不需要鉴权了
            }
        }
        // 登录鉴权
        $userModel = new \Model\User();
        if ($_SERVER['HTTP_TOKEN']) {
            $this->user = $userModel->get(['token' => $_SERVER['HTTP_TOKEN']]);
            if (!$this->user) {
                $this->error('鉴权失败，用户身份无效', $_SERVER['HTTP_TOKEN'], 999);
            }
        } else {
            if (!$this->user) {
                $this->error('鉴权失败，无token', '', 999);
            }
        }
        // 无需鉴权的方法
        foreach ($this->noNeedRight as $noNeedRight) {
            if ($noNeedRight === '*' || $noNeedRight === $_GPC['op']) {
                return true;
            }
        }
        //todo 用户鉴权
    }

    protected function success($data = null)
    {
        header("Content-type: application/json; charset=utf-8");
        exit(json_encode($data, JSON_UNESCAPED_SLASHES));
    }

    protected function error($msg, $data = null, $err = 1)
    {
        header("Content-type: application/json; charset=utf-8");
        exit(json_encode([
            'err' => $err,
            'msg' => $msg,
            'data' => $data,
        ], JSON_UNESCAPED_SLASHES));
    }
}