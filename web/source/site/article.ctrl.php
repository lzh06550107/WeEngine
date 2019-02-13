<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');
load()->func('file');
load()->model('article');
load()->model('account');

$dos = array('display', 'post', 'del');
$do = in_array($do, $dos) ? $do : 'display';

permission_check_account_user('platform_site');
$_W['page']['title'] = '文章管理 - 微官网';

// 获取当前公众号的所有分类
$category = pdo_fetchall("SELECT id,parentid,name FROM " . tablename('site_category') . " WHERE uniacid = '{$_W['uniacid']}' ORDER BY parentid ASC, displayorder ASC, id ASC ", array(), 'id');
$parent = array(); // 收集父分类
$children = array(); // 收集子分类

if (!empty($category)) {
    foreach ($category as $cid => $cate) {
        if (!empty($cate['parentid'])) {
            $children[$cate['parentid']][] = $cate;
        } else {
            $parent[$cate['id']] = $cate;
        }
    }
}

// 显示所有文章
if ($do == 'display') {
    $pindex = max(1, intval($_GPC['page']));
    $psize = 20;
    $condition = '';
    $params = array();
    if (!empty($_GPC['keyword'])) {
        $condition .= " AND `title` LIKE :keyword";
        $params[':keyword'] = "%{$_GPC['keyword']}%";
    }

    if (!empty($_GPC['category']['childid'])) {
        $cid = intval($_GPC['category']['childid']);
        $condition .= " AND ccate = '{$cid}'";
    } elseif (!empty($_GPC['category']['parentid'])) {
        $cid = intval($_GPC['category']['parentid']);
        $condition .= " AND pcate = '{$cid}'";
    }
    $list = pdo_fetchall("SELECT * FROM " . tablename('site_article') . " WHERE uniacid = '{$_W['uniacid']}' $condition ORDER BY displayorder DESC, edittime DESC, id DESC LIMIT " . ($pindex - 1) * $psize . ',' . $psize, $params);
    $total = pdo_fetchcolumn('SELECT COUNT(*) FROM ' . tablename('site_article') . " WHERE uniacid = '{$_W['uniacid']}'" . $condition, $params);
    $pager = pagination($total, $pindex, $psize);

    $article_ids = array();
    if (!empty($list)) {
        foreach ($list as $item) {
            $article_ids[] = $item['id'];
        }
    }
    // 获取所有未读文章评论
    $article_comment = table('sitearticlecomment')->srticleCommentUnread($article_ids);

    $setting = uni_setting($_W['uniacid']);

    template('site/article-display');

 // 添加和修改文章
} elseif ($do == 'post') {
    $id = intval($_GPC['id']);
    $template = uni_templates();
    $pcate = intval($_GPC['pcate']); // 父分类id
    $ccate = intval($_GPC['ccate']); // 子分类id

    if (!empty($id)) { // 如果是修改文章
        $item = pdo_fetch("SELECT * FROM " . tablename('site_article') . " WHERE id = :id", array(':id' => $id));
        $item['type'] = explode(',', $item['type']);
        $pcate = $item['pcate'];
        $ccate = $item['ccate'];
        if (empty($item)) {
            itoast('抱歉，文章不存在或是已经删除！', '', 'error');
        }
        $key = pdo_fetchall('SELECT content FROM ' . tablename('rule_keyword') . ' WHERE rid = :rid AND uniacid = :uniacid', array(':rid' => $item['rid'], ':uniacid' => $_W['uniacid']));
        if (!empty($key)) {
            $keywords = array();
            foreach ($key as $row) {
                $keywords[] = $row['content'];
            }
            $keywords = implode(',', array_values($keywords));
        }
        $item['credit'] = iunserializer($item['credit']) ? iunserializer($item['credit']) : array();
        if (!empty($item['credit']['limit'])) {
            $credit_num = pdo_fetchcolumn('SELECT SUM(credit_value) FROM ' . tablename('mc_handsel') . ' WHERE uniacid = :uniacid AND module = :module AND sign = :sign', array(':uniacid' => $_W['uniacid'], ':module' => 'article', ':sign' => md5(iserializer(array('id' => $id)))));
            if (is_null($credit_num)) {
                $credit_num = 0;
            }
            $credit_yu = (($item['credit']['limit'] - $credit_num) < 0) ? 0 : $item['credit']['limit'] - $credit_num;
        }
    } else {
        $item['credit'] = array();
        $keywords = '';
    }
    if (checksubmit('submit')) {
        if (empty($_GPC['title'])) {
            itoast('标题不能为空，请输入标题！', '', '');
        }
        $sensitive_title = detect_sensitive_word($_GPC['title']);
        if (!empty($sensitive_title)) {
            itoast('不能使用敏感词:' . $sensitive_title, '', '');
        }

        $sensitive_content = detect_sensitive_word($_GPC['content']);
        if (!empty($sensitive_content)) {
            itoast('不能使用敏感词:' . $sensitive_content, '', '');
        }

        $data = array(
            'uniacid' => $_W['uniacid'],
            'iscommend' => intval($_GPC['option']['commend']), // 是否推荐
            'ishot' => intval($_GPC['option']['hot']), // 是否头条
            'pcate' => intval($_GPC['category']['parentid']), // 父分类
            'ccate' => intval($_GPC['category']['childid']), // 子分类
            'template' => addslashes($_GPC['template']), // 模板，即主题中的模板
            'title' => addslashes($_GPC['title']), // 文章标题
            'description' => addslashes($_GPC['description']), // 文章简介
            'content' => safe_gpc_html(htmlspecialchars_decode($_GPC['content'], ENT_QUOTES)), // 文章内容
            'incontent' => intval($_GPC['incontent']), // 是否把封面图片显示在正文中
            'source' => addslashes($_GPC['source']), // 文章来源
            'author' => addslashes($_GPC['author']), // 文章作者
            'displayorder' => intval($_GPC['displayorder']), // 文章的显示顺序，越大则越靠前
            'linkurl' => addslashes($_GPC['linkurl']), // 直接链接
            'createtime' => TIMESTAMP, // 文章创建时间
            'edittime' => TIMESTAMP, //
            'click' => intval($_GPC['click']) // 阅读次数
        );
        if (!empty($_GPC['thumb'])) {
            if (file_is_image($_GPC['thumb'])) {
                $data['thumb'] = $_GPC['thumb']; // 文章缩略图
            }
        } elseif (!empty($_GPC['autolitpic'])) { // 是否提取内容的第一个图片为缩略图
            $match = array();
            preg_match('/&lt;img.*?src=&quot;?(.+\.(jpg|jpeg|gif|bmp|png))&quot;/', $_GPC['content'], $match);
            if (!empty($match[1])) {
                $url = $match[1];
                $file = file_remote_attach_fetch($url);
                if (!is_error($file)) {
                    $data['thumb'] = $file;
                    file_remote_upload($file);
                }
            }
        } else {
            $data['thumb'] = '';
        }
        $keyword = str_replace('，', ',', trim($_GPC['keyword']));
        $keyword = explode(',', $keyword);
        // 添加关键字以后,系统将生成一条图文规则,用户可以通过输入关键字来阅读文章。多个关键字请用英文“,”隔开
        if (!empty($keyword)) {
            $rule['uniacid'] = $_W['uniacid'];
            $rule['name'] = '文章：' . $_GPC['title'] . ' 触发规则';
            $rule['module'] = 'news';
            $rule['status'] = 1;
            $keywords = array();
            foreach ($keyword as $key) {
                $key = trim($key);
                if (empty($key)) continue;
                $keywords[] = array(
                    'uniacid' => $_W['uniacid'],
                    'module' => 'news',
                    'content' => $key,
                    'status' => 1,
                    'type' => 1,
                    'displayorder' => 1,
                );
            }
            $reply['title'] = $_GPC['title'];
            $reply['description'] = $_GPC['description'];
            $reply['thumb'] = $data['thumb'];
            $reply['url'] = murl('site/site/detail', array('id' => $id));
        }
        if (!empty($_GPC['credit']['status'])) { // 是否赠送积分
            $credit['status'] = intval($_GPC['credit']['status']);
            $credit['limit'] = intval($_GPC['credit']['limit']) ? intval($_GPC['credit']['limit']) : itoast('请设置积分上限', '', '');
            $credit['share'] = intval($_GPC['credit']['share']) ? intval($_GPC['credit']['share']) : itoast('请设置分享时赠送积分多少', '', '');
            $credit['click'] = intval($_GPC['credit']['click']) ? intval($_GPC['credit']['click']) : itoast('请设置阅读时赠送积分多少', '', '');
            $data['credit'] = iserializer($credit); // 设置赠送积分后,粉丝在分享时赠送积分.粉丝的好友在点击阅读时,也会赠送积分
        } else {
            $data['credit'] = iserializer(array('status' => 0, 'limit' => 0, 'share' => 0, 'click' => 0));
        }
        if (empty($id)) { // 添加文章
            unset($data['edittime']);
            if (!empty($keywords)) {
                // 添加回复规则，需要操作3个表
                pdo_insert('rule', $rule);
                $rid = pdo_insertid();
                foreach ($keywords as $li) {
                    $li['rid'] = $rid;
                    pdo_insert('rule_keyword', $li);
                }
                $reply['rid'] = $rid;
                pdo_insert('news_reply', $reply);
                $data['rid'] = $rid; // 回复规则id
            }
            pdo_insert('site_article', $data);
            $aid = pdo_insertid();
            pdo_update('news_reply', array('url' => murl('site/site/detail', array('id' => $aid))), array('rid' => $rid));
        } else { // 修改文章
            unset($data['createtime']);
            pdo_delete('rule', array('id' => $item['rid'], 'uniacid' => $_W['uniacid']));
            pdo_delete('rule_keyword', array('rid' => $item['rid'], 'uniacid' => $_W['uniacid']));
            pdo_delete('news_reply', array('rid' => $item['rid']));
            if (!empty($keywords)) {
                pdo_insert('rule', $rule);
                $rid = pdo_insertid();

                foreach ($keywords as $li) {
                    $li['rid'] = $rid;
                    pdo_insert('rule_keyword', $li);
                }

                $reply['rid'] = $rid;
                pdo_insert('news_reply', $reply);
                $data['rid'] = $rid;
            } else {
                $data['rid'] = 0;
                $data['kid'] = 0;
            }
            pdo_update('site_article', $data, array('id' => $id));
        }
        itoast('文章更新成功！', url('site/article/display'), 'success');
    } else {
        template('site/article-post');
    }

 // 删除文章
} elseif ($do == 'del') {
    if (checksubmit('submit')) { // 批量删除
        foreach ($_GPC['rid'] as $key => $id) {
            $id = intval($id);
            $row = pdo_get('site_article', array('id' => $id, 'uniacid' => $_W['uniacid']));

            if (empty($row)) {
                itoast('抱歉，文章不存在或是已经被删除！', '', '');
            }

            if (!empty($row['rid'])) {
                pdo_delete('rule', array('id' => $row['rid'], 'uniacid' => $_W['uniacid']));
                pdo_delete('rule_keyword', array('rid' => $row['rid'], 'uniacid' => $_W['uniacid']));
                pdo_delete('news_reply', array('rid' => $row['rid']));
            }
            pdo_delete('site_article', array('id' => $id, 'uniacid' => $_W['uniacid']));
        }
        itoast('批量删除成功！', referer(), 'success');
    } else { // 单个删除
        $id = intval($_GPC['id']);
        $row = pdo_fetch("SELECT id,rid,kid,thumb FROM " . tablename('site_article') . " WHERE id = :id", array(':id' => $id));

        if (empty($row)) {
            itoast('抱歉，文章不存在或是已经被删除！', '', '');
        }

        if (!empty($row['rid'])) {
            pdo_delete('rule', array('id' => $row['rid'], 'uniacid' => $_W['uniacid']));
            pdo_delete('rule_keyword', array('rid' => $row['rid'], 'uniacid' => $_W['uniacid']));
            pdo_delete('news_reply', array('rid' => $row['rid']));
        }
        if (pdo_delete('site_article', array('id' => $id, 'uniacid' => $_W['uniacid']))) {
            itoast('删除成功！', referer(), 'success');
        } else {
            itoast('删除失败！', referer(), 'error');
        }
    }
}

