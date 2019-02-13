<?php

use Cores\ApiCore;

class Index extends ApiCore
{
    protected $noNeedLogin = ['info', 'channels'];

    public function info()
    {
        $this->success($this->get_config());
    }

    public function channels()
    {
        $page  = $_GPC['page'] ? $_GPC['page'] - 1 : 0;
        $model = new \Models\ChannelModel();
        $total = $model->count('id');
        $fields= ['id','name','url','order','created_at'];
        $order = [
            'order' => 'ASC',
            'id'      => 'DESC',
        ];
        $list  = $model->field($fields)
                       ->limit($page * 10, 100)
                       ->order($order)
                       ->select();
        $result = ["total" => $total, "rows" => $list->toArray(), 'current' => $page + 1];
        $this->success($result);
    }

    private function get_config()
    {
        $res = (new \Models\ConfigModel())->find();
        if ($res) {
            return $res->visible(['title']);
        } else {
            $this->error('小程序未配置');
        }
    }
}