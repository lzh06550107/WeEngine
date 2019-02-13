<?php

global $_W, $_GPC, $model, $url;

use Cores\ControllerCore;
use Models\ChannelModel;

load()->func('tpl');

$model = new ChannelModel();
$controller = new ControllerCore($model, $this->createWebUrl('Channel'));
$url = $this->createWebUrl('channel');

switch ($_GET['op']) {
    case 'add':
        if ($_W['ispost']) {
            validator();
            $res = $model->save($_GPC['row']);
            if ($res) {
                message('添加成功', $url);
            } else {
                message('添加失败', $url, 'error');
            }
        }
        include $this->template('channel/add');
        break;

    case 'edit':
        $id = $_GPC['id'];
        if (empty($id)) {
            message('未找到该记录', $url, 'error');
        }
        $info = $model->find($id);
        if (!$info) {
            message('未找到该记录', $url, 'error');
        }
        if ($_W['ispost']) {
            validator();
            $res = $model->isUpdate(true)->save($_GPC['row']);
            if ($res) {
                message('编辑成功', $url);
            } else {
                message('编辑失败', $url, 'error');
            }
        }
        include $this->template('channel/edit');
        break;
    case 'del':
        if ($_W['ispost']) {
            $controller->destroy($_GPC['id']);
        }
        include $this->template('channel/del');
        break;
    case 'del_all':
        if ($_W['ispost']) {
            // 无条件删除全部数据
            $res = $model->where('id', '>', 0)->delete();
            if ($res) {
                message('删除成功', $url);
            } else {
                message('删除失败', $url, 'error');
            }
        }
        include $this->template('channel/del_all');
        break;
    default:
            $page  = $_GPC['page'] ? $_GPC['page'] - 1 : 0;
            $total = $model->count();
            $order = [
                'order' => 'ASC',
            ];
            $list  = $model->limit($page * 10, 100)
                           ->order($order)
                           ->select();
//            $list->append(['create_time_text', 'update_time_text']);
            $result = ["total" => $total, "rows" => $list->toArray(), 'current' => $page + 1];
            include $this->template('channel/index');
            break;
}

function validator() {
    global $_W, $_GPC;
    if (!$_GPC['row']['name']) {
        message('频道名称 不能为空', 'refresh', 'warning');
    }
    if (!$_GPC['row']['url']) {
        message('频道URL 不能为空', 'refresh', 'warning');
    }
    if (!is_url($_GPC['row']['url'])) {
        message('请填写合法的频道URL', 'refresh', 'warning');
    }
    if ($_GPC['row']['order'] < 0) {
        message('排序不能小于0', 'refresh', 'warning');
    }

    /* 数据格式化 */
    $_GPC['row']['created_at'] = time();
    $_GPC['row']['order']      = intval($_GPC['row']['order']);
    $_GPC['row']['app_id']     = $_W['uniacid'];
}

function is_url($url){
    if (filter_var ($url, FILTER_VALIDATE_URL )) {
        return true;
    } else {
        return false;
    }
}