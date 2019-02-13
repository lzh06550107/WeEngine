<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');
set_time_limit(0);

load()->func('file');
load()->model('cloud');
load()->func('db');
load()->model('system');
$dos = array('backup', 'restore', 'trim', 'optimize', 'run');
$do = in_array($do, $dos) ? $do : 'backup';

if ($do == 'backup') {
    $_W['page']['title'] = '备份 - 数据库 - 常用系统工具 - 系统管理';
    if ($_GPC['status']) { // 这是？？
        if (empty($_W['setting']['copyright']['status'])) {
            itoast('为了保证备份数据完整请关闭站点后再进行此操作', url('system/site'), 'error');
        }
        $sql = "SHOW TABLE STATUS LIKE '{$_W['config']['db']['tablepre']}%'";
        $tables = pdo_fetchall($sql);
        if (empty($tables)) {
            itoast('数据已经备份完成', url('system/database/'), 'success');
        }
        $series = max(1, intval($_GPC['series'])); // 文件一个组中编号
        if (!empty($_GPC['volume_suffix'])) { //保存文件名称中间部分，表示分组名称
            $volume_suffix = $_GPC['volume_suffix'];
        } else {
            $volume_suffix = random(10);
        }
        if (!empty($_GPC['folder_suffix'])) { // 保存的目录
            $folder_suffix = $_GPC['folder_suffix'];
        } else {
            $folder_suffix = TIMESTAMP . '_' . random(8);
        }
        $bakdir = IA_ROOT . '/data/backup/' . $folder_suffix;
        if (trim($_GPC['start'])) { //??
            $result = mkdirs($bakdir);
        }
        $size = 300; // 每次查询记录数
        $volumn = 1024 * 1024 * 2; // 一个备份文件的最大大小
        $dump = '';
        if (empty($_GPC['last_table'])) { // 上一次保存sql文件正在查询的表
            $last_table = '';
            $catch = true;
        } else {
            $last_table = $_GPC['last_table'];
            $catch = false;
        }
        foreach ($tables as $table) {
            $table = array_shift($table);
            if (!empty($last_table) && $table == $last_table) {
                $catch = true;
            }
            if (!$catch) { // 不断循环到指定的表
                continue;
            }
            if (!empty($dump)) {
                $dump .= "\n\n";
            }
            if ($table != $last_table) { // 保存文件的表已经获取了表结构
                $row = db_table_schemas($table); // 获取表的结构
                $dump .= $row;
            }
            $index = 0;
            if (!empty($_GPC['index'])) { // 保存文件的表已经保存记录数
                $index = $_GPC['index'];
                $_GPC['index'] = 0;
            }
            while (true) {
                $start = $index * $size;
                $result = db_table_insert_sql($table, $start, $size); // 获取某个表的insert语句
                if (!empty($result)) {
                    $dump .= $result['data'];
                    // 如果在查询中发现内容超过大小，则需要保存到文件中
                    if (strlen($dump) > $volumn) {
                        $bakfile = $bakdir . "/volume-{$volume_suffix}-{$series}.sql";
                        $dump .= "\n\n";
                        file_put_contents($bakfile, $dump);
                        $series++;
                        $index++;
                        $current = array(
                            'last_table' => $table, // 当前表可能还没有查询完成，需要保存
                            'index' => $index, // 当前表可能还有记录没有查询完成，需要保存
                            'series' => $series, // 当前组的编号需要保存
                            'volume_suffix' => $volume_suffix,
                            'folder_suffix' => $folder_suffix,
                            'status' => 1
                        );
                        $current_series = $series - 1;
                        message('正在导出数据, 请不要关闭浏览器, 当前第 ' . $current_series . ' 卷.', url('system/database/backup/', $current), 'info');
                    }

                }

                // 如果当前表中已经没有记录，或者当前获取的记录数小于300条，都说明是该表的最后一次查询
                if (empty($result) || count($result['result']) < $size) {
                    break; // 跳出该表的查询，即结束循环
                }
                $index++;
            }
        }
        $bakfile = $bakdir . "/volume-{$volume_suffix}-{$series}.sql";
        $dump .= "\n\n----WeEngine MySQL Dump End";
        file_put_contents($bakfile, $dump);
        itoast('数据已经备份完成', url('system/database/'), 'success');
    }
}
if ($do == 'restore') {
    $_W['page']['title'] = '还原 - 数据库 - 常用系统工具 - 系统管理';
    $reduction = system_database_backup(); // 获得数据库备份目录下的数据库备份文件数组
    // 恢复动作
    if (!empty($_GPC['restore_dirname'])) {
        $restore_dirname = $_GPC['restore_dirname'];
        $restore_dirname_list = array_keys($reduction);
        if (!in_array($restore_dirname, $restore_dirname_list)) {
            itoast('非法访问', '', 'error');
            exit;
        }

        $volume_list = $reduction[$restore_dirname]['volume_list'];
        if (empty($_GPC['restore_volume_name'])) {
            $restore_volume_name = $volume_list[0];
        } else {
            $restore_volume_name = $_GPC['restore_volume_name'];
        }
        $restore_volume_sizes = max(1, intval($_GPC['restore_volume_sizes']));
        if ($reduction[$restore_dirname]['volume'] < $restore_volume_sizes) {
            itoast('成功恢复数据备份. 可能还需要你更新缓存.', url('system/database/restore'), 'success');
            exit;
        }
        $volume_sizes = $restore_volume_sizes;
        system_database_volume_restore($restore_volume_name);
        $next_restore_volume_name = system_database_volume_next($restore_volume_name);
        $restore_volume_sizes++;
        $restore = array(
            'restore_volume_name' => $next_restore_volume_name,
            'restore_volume_sizes' => $restore_volume_sizes,
            'restore_dirname' => $restore_dirname
        );
        message('正在恢复数据备份, 请不要关闭浏览器, 当前第 ' . $volume_sizes . ' 卷.', url('system/database/restore', $restore), 'success');
    }
    // 删除动作
    if ($_GPC['delete_dirname']) {
        $delete_dirname = $_GPC['delete_dirname'];
        if (!empty($reduction[$delete_dirname]) && system_database_backup_delete($delete_dirname)) {
            itoast('删除备份成功.', url('system/database/restore'), 'success');
        }
    }
}
// 数据库结构整理
if ($do == 'trim') {
    if ($_W['ispost']) { // 如果是提交
        $type = $_GPC['type'];
        $data = $_GPC['data'];
        $table = $_GPC['table'];
        if ($type == 'field') { // 删除表中指定字段
            $sql = "ALTER TABLE `$table` DROP `$data`";
            if (false !== pdo_query($sql, $params)) {
                exit('success');
            }
        } elseif ($type == 'index') { // 删除表中指定索引
            $sql = "ALTER TABLE `$table` DROP INDEX `$data`";
            if (false !== pdo_query($sql, $params)) {
                exit('success');
            }
        }
        exit();
    }

    $r = cloud_prepare();
    if (is_error($r)) {
        itoast($r['message'], url('cloud/profile'), 'error');
    }

    $upgrade = cloud_schema(); // 获取云端表结构
    $schemas = $upgrade['schemas'];

    if (!empty($schemas)) {
        foreach ($schemas as $key => $value) {
            $tablename = substr($value['tablename'], 4);
            // 获得某个数据表的结构
            $struct = db_table_schema(pdo(), $tablename);
            if (!empty($struct)) {
                $temp = db_schema_compare($schemas[$key], $struct);
                if (!empty($temp['fields']['less'])) {
                    $diff[$tablename]['name'] = $value['tablename'];
                    foreach ($temp['fields']['less'] as $key => $value) {
                        $diff[$tablename]['fields'][] = $value;
                    }
                }
                if (!empty($temp['indexes']['less'])) {
                    $diff[$tablename]['name'] = $value['tablename'];
                    foreach ($temp['indexes']['less'] as $key => $value) {
                        $diff[$tablename]['indexes'][] = $value;
                    }
                }
            }
        }
    }
}
// 数据表优化
/**
 * 如果您已经删除了表的一大部分，或者如果您已经对含有可变长度行的表（含有VARCHAR, BLOB或TEXT列的表）进行了很多更改，则应使用
OPTIMIZE TABLE。被删除的记录被保持在链接清单中，后续的INSERT操作会重新使用旧的记录位置。您可以使用OPTIMIZE TABLE来重新
利用未使用的空间，并整理数据文件的碎片。
 * OPTIMIZE TABLE只对MyISAM, BDB和InnoDB表起作用。

注意，在OPTIMIZE TABLE运行过程中，MySQL会锁定表。
 */
if ($do == 'optimize') {
    $_W['page']['title'] = '优化 - 数据库 - 常用系统工具 - 系统管理';
    $optimize_table = array();
    $sql = "SHOW TABLE STATUS LIKE '{$_W['config']['db']['tablepre']}%'";
    $tables = pdo_fetchall($sql);
    foreach ($tables as $tableinfo) {
        if ($tableinfo['Engine'] == 'InnoDB') { // ??
            continue;
        }
        if (!empty($tableinfo) && !empty($tableinfo['Data_free'])) {
            $row = array(
                'title' => $tableinfo['Name'],
                'type' => $tableinfo['Engine'],
                'rows' => $tableinfo['Rows'],
                'data' => sizecount($tableinfo['Data_length']),
                'index' => sizecount($tableinfo['Index_length']),
                'free' => sizecount($tableinfo['Data_free'])
            );
            $optimize_table[$row['title']] = $row;
        }
    }

    if (checksubmit()) {
        foreach ($_GPC['select'] as $tablename) {
            if (!empty($optimize_table[$tablename])) {
                $sql = "OPTIMIZE TABLE {$tablename}";
                pdo_fetch($sql);
            }
        }
        itoast('数据表优化成功.', 'refresh', 'success');
    }
}
// 运行SQL
if ($do == 'run') {
    $_W['page']['title'] = '运行SQL - 数据库 - 常用系统工具 - 系统管理';
    if (!DEVELOPMENT) {
        itoast('请先开启开发模式后再使用此功能', referer(), 'info');
    }
    if (checksubmit()) {
        $sql = $_POST['sql'];
        pdo_run($sql);
        itoast('查询执行成功.', 'refresh', 'success');
    }
}

template('system/database');

