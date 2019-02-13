<?php
/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/9/20
 * Time: 16:17
 */

namespace Cores;


class ControllerCore
{
    protected $model;
    protected $url;

    public function __construct($model, $url)
    {
        $this->url = $url;
        $this->model = $model;
    }

    public function index($parameter)
    {
    }

    public function create($row)
    {
        $res = $this->model->allowField(true)->save($row);
        if ($res) {
            message('提交成功', $this->url);
        } else {
            message('提交失败', $this->url, 'error');
        }
    }

    public function store($row, $id = null)
    {
        $res = $this->model->allowField(true)->save($row, $id ? ['id' => $id] : null);
        if ($res) {
            message(($id ? '更新' : '新增') . '成功', $this->url);
        } else {
            message(($id ? '更新' : '新增') . '失败', $this->url, 'error');
        }
    }

    public function update($row, $id)
    {
        $res = $this->model->allowField(true)->save($row, ['id' => $id]);
        if ($res) {
            message('提交成功', $this->url);
        } else {
            message('提交失败', $this->url, 'error');
        }
    }

    public function destroy($id){
        $res = $this->model->where(['id' => $id])->delete();
        if ($res) {
            message('删除成功', $this->url);
        } else {
            message('删除失败', $this->url, 'error');
        }
    }
}