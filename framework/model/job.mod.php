<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 *
 * 这是用来当删除统一帐号时，同时删除该帐号素材的任务
 */
defined('IN_IA') or exit('Access Denied');

/**
 *  任务列表
 */
function job_list($uid, $isfounder = false)
{
    $table = table('job')->where('isdeleted', 0);
    if (!$isfounder) {
        $table->where('uid', $uid);
    }
    return $table->getall('id');
}

/**
 *  获取一个job
 * @param $id
 * @return mixed
 */
function job_single($id)
{
    return table('job')->getById($id);
}

/**
 * 创建一个删除统一帐号本地和远程附件的任务
 * @param $uniacid
 * @param $accountName
 * @param $uid
 * @return mixed
 */
function job_create_delete_account($uniacid, $accountName, $uid)
{
    global $_W;

    $job = table('job');
    $core_count = table('attachment')->where('uniacid', $uniacid)->count();
    $wechat_count = table('attachment')->local(false)->where('uniacid', $uniacid)->count();
    $total = $core_count + intval($wechat_count);
    return $job->createDeleteAccountJob($uniacid, $accountName, $total, $uid);
}

/**
 *  执行任务
 */
function job_execute($id)
{
    $job = job_single($id);

    $type = $job['type'];
    if (intval($job['status']) == 1) {
        return error(1, '任务已结束');
    }
    $result = null;
    switch ($type) {
        case $type :
            $result = job_execute_delete_account($job);
            break;
    }
    return $result;
}

/**
 * 执行删除任务
 * @param $job
 * @return array
 */
function job_execute_delete_account($job)
{

    $uniacid = $job['uniacid'];
    // 先查询出来数据 然后文件再删除记录
    $core_attchments = table('attachment')->where('uniacid', $uniacid)
        ->searchWithPage(1, 10)->getall('id');

    array_walk($core_attchments, function ($item) {
        $path = $item['attachment'];
        file_delete($path);
    });

    $wechat_attachments = table('attachment')->local(false)->where('uniacid', $uniacid)
        ->searchWithPage(1, 10)->getall('id');
    array_walk($wechat_attachments, function ($item) {
        $path = $item['attachment'];
        file_delete($path);
    });

    // 都为0 说明已经删除完了
    if (count($core_attchments) == 0 && count($wechat_attachments) == 0) {
        table('attachmentgroup')->deleteByUniacid($uniacid);
        $upjob = table('job')->where('id', $job['id']);
        $upjob->fill('status', 1);//改为完成状态
        $upjob->fill('endtime', TIMESTAMP); //任务结束时间
        $upjob->save();
        return error(0, array('finished' => 1, 'progress' => 100, 'id' => $job['id'], 'endtime' => time()));
    }

    // 从数据表中删除记录
    $core_ids = array_keys($core_attchments);
    $wechat_ids = array_keys($wechat_attachments);

    if (count($core_ids) > 0) {
        table('attachment')->deleteById($core_ids);
    }
    if (count($wechat_ids) > 0) {
        table('attachment')->local(false)->deleteById($wechat_ids);
    }

    $handled = count($core_ids) + count($wechat_ids);
    $all_handled = intval($job['handled']) + $handled;
    $total = intval($job['total']);
    table('job')->where('id', $job['id'])->fill('handled', $all_handled)
        ->fill('updatetime', TIMESTAMP)->save();
    return error(0, array('finished' => 0, 'progress' => intval($all_handled / $total * 100), 'id' => $job['id']));

}

/**
 * 清除已完成任务
 * @param $uid
 * @param bool $isfounder
 * @return mixed
 */
function job_clear($uid, $isfounder = false)
{
    return table('job')->clear($uid, $isfounder);
}
