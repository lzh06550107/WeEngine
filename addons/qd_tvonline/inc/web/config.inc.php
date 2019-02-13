<?php

global $_W, $_GPC, $model, $url;

use Cores\ControllerCore;
use Models\ConfigModel;

load()->func('tpl');

$model = new ConfigModel();
$controller = new ControllerCore($model, $this->createWebUrl('config'));

$config = $model->find();

if ($config) {
    // 编辑
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $controller->update($_POST['row'], $config->id);
    }
    include $this->template('config/create_and_edit');
} else {
    // 新增
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $controller->create($_POST['row']);
    }
    include $this->template('config/create_and_edit');
}