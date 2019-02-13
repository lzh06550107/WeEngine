<?php
/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/16
 * Time: 11:26
 */

namespace Models;

use think\Model;

class BaseModel extends Model
{
    // 自动完成
    protected $auto = ['app_id'];

    // 定义全局的查询范围
    protected function base($query)
    {
        global $_W;
        $query->where('app_id', $_W['uniacid']);
    }

    public function setAppIdAttr($value)
    {
        global $_W;
        return $_W['uniacid'];
    }

    public function getCreateTimeTextAttr($value, $data)
    {
        return date('Y-m-d H:i:s', $data['create_time']);
    }

    public function getUpdateTimeTextAttr($value, $data)
    {
        return date('Y-m-d H:i:s', $data['create_time']);
    }
}