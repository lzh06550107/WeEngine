<?php
defined('IN_IA') or exit('Access Denied');

class We_xzModuleSite extends WeModuleSite {
    //新闻列表
	public function doWebNews() {
		global $_W, $_GPC;
		$pindex = max(array(1, intval($_GPC['page'])));
		$psize = 10;
		$condition = array();
		$condition['uniacid'] = $_W['uniacid'];
		$keyword = safe_gpc_string($_GPC['title'], '');
		if (!empty($keyword)) {
			$condition['title LIKE'] = "%{$keyword}%";
		}
		$lists = pdo_getslice('we_xz_news', $condition, array($pindex, $psize), $total,'', 'id', 'id desc');
		$pager = pagination($total, $pindex, $psize);
		include $this->template('display');
	}
	//文章分类添加
    public function doWebNews_class_add(){
        global $_W, $_GPC;
        $id = safe_gpc_int($_GPC['id']);
        $list=pdo_get('we_xz_news_class',array('id'=>$id));
        if (checksubmit('submit')) {
            if (empty($_GPC['title'])) {
                itoast('文章类名不能为空', referer());
            }
            $data = array(
                'title' => safe_gpc_string($_GPC['title']),
                'create_time' => TIMESTAMP,
                'uniacid' => $_W['uniacid']
            );
            if (!empty($id)) {
                pdo_update('we_xz_news_class', $data, array('id' => $id));
                message('修改成功', $this->createWebUrl('news_class'));
            } else {
                pdo_insert('we_xz_news_class', $data);
                message('添加成功', $this->createWebUrl('news_class'));
            }
        }
        include $this->template('news_class_add');
    }
    //删除文章分类
    public function doWebNews_class_delete() {
        global $_W, $_GPC;
        $id = safe_gpc_int($_GPC['id']);
        if (empty($id)) {
            itoast('非法操作', $this->createWebUrl('news_class'));
        }
        pdo_delete('we_xz_news_class', array('id' => $id));
        itoast('删除成功', $this->createWebUrl('news_class'));
    }
   //删除轮播图
    public function doWebSlide_delete() {
        global $_W, $_GPC;
        $id = safe_gpc_int($_GPC['id']);
        if (empty($id)) {
            itoast('非法操作', $this->createWebUrl('slides'));
        }
        pdo_delete('we_xz_slides', array('id' => $id));
        itoast('删除成功', $this->createWebUrl('slides'));
    }
    //文章类别列表
    public function doWebNews_class(){
        global $_W, $_GPC;
        $pindex = max(array(1, intval($_GPC['page'])));
        $psize = 10;
        $condition = array();
        $condition['uniacid'] = $_W['uniacid'];
        $keyword = safe_gpc_string($_GPC['title'], '');
        if (!empty($keyword)) {
            $condition['title LIKE'] = "%{$keyword}%";
        }
        $lists = pdo_getslice('we_xz_news_class', $condition, array($pindex, $psize), $total,'', 'id', 'id desc');
        $pager = pagination($total, $pindex, $psize);
        include $this->template('news_class');
    }
	//产品编辑
    public function doWebProduct_add() {
        global $_W, $_GPC;
        $category=$this->get_all_product_category();
        $id = safe_gpc_int($_GPC['id']);
        $list = pdo_get('we_xz_product', array('id' => $id));
        $cat=pdo_get('we_xz_product_category', array('id' => $list['cateid']) , array('title'));
        if (checksubmit('submit')) {
            if (empty($_GPC['title']) || empty($_GPC['description'])) {
                itoast('名称或描述不能为空', referer());
            }
            $data = array(
                'title' => safe_gpc_string($_GPC['title']),
                'cateid'=>intval($_GPC['cateid']),
                'img_url'=>htmlspecialchars_decode($_GPC['img_url']),
                'description' => htmlspecialchars_decode($_GPC['description']),
                'create_time' => TIMESTAMP,
                'uniacid' => $_W['uniacid']
            );
            if (!empty($id)) {
                pdo_update('we_xz_product', $data, array('id' => $id));
                message('修改成功', $this->createWebUrl('show'));
            } else {
                pdo_insert('we_xz_product', $data);
                message('添加成功', $this->createWebUrl('show'));
            }
        }
        include $this->template('txt');
    }
    //添加联系方式
    public function doWebLink_add() {
        global $_W, $_GPC;
        $id = safe_gpc_int($_GPC['id']);
        $list = pdo_get('we_xz_company_info', array('id' => $id));//公司信息
        print_r($list);
        if (checksubmit('submit')) {
            if (empty($_GPC['phone']) || empty($_GPC['tel'])) {
                itoast('电话号码不能为空', referer());
            }
            $data = array(
                'title' => safe_gpc_string($_GPC['title']),
                'phone'=>trim($_GPC['phone']),
                'tel' => htmlspecialchars_decode($_GPC['tel']),
                'qq' => intval($_GPC['qq']),
                'address' => htmlspecialchars_decode($_GPC['address']),
                'create_time' => TIMESTAMP,
                'uniacid' => $_W['uniacid']
            );
            if (!empty($id)) {
                pdo_update('we_xz_company_info', $data, array('id' => $id));
                message('修改成功', $this->createWebUrl('contact'));
            } else {
                pdo_insert('we_xz_company_info', $data);
                message('添加成功', $this->createWebUrl('contact'));
            }
        }
        include $this->template('contact');
    }
    //添加新闻文章
    public function doWebNews_add() {
        global $_W, $_GPC;
        $id = safe_gpc_int($_GPC['id']);
        $rows=pdo_getall('we_xz_news_class',array('uniacid'=>$_W['uniacid']));
        $list = pdo_get('we_xz_news', array('id' => $id));
        if (checksubmit('submit')) {
            if (empty($_GPC['title']) || empty($_GPC['content'])) {
                itoast('标题或内容不能为空', referer());
            }

            $data = array(
                'title' => safe_gpc_string($_GPC['title']),
                'type' => safe_gpc_string($_GPC['type']),
                'content' => htmlspecialchars_decode($_GPC['content']),
                'create_time' => TIMESTAMP,
                'uniacid' => $_W['uniacid']
            );

            if (!empty($id)) {
                pdo_update('we_xz_news', $data, array('id' => $id));
                message('修改成功', $this->createWebUrl('news'));
            } else {
                pdo_insert('we_xz_news', $data);
                message('添加成功', $this->createWebUrl('news'));
            }
        }
        include $this->template('post');
    }
    //添加/修改产品类
    public function doWebProduct_category_add() {
        global $_W, $_GPC;
        $id = safe_gpc_int($_GPC['id']);
        $list=pdo_get('we_xz_product_category',array('id'=>$id));
        $cates=$this->getProductCategory();
        if (checksubmit('submit')) {
            if (empty($_GPC['title'])) {
                itoast('产品类名不能为空', referer());
            }

            $data = array(
                'title' => safe_gpc_string($_GPC['title']),
                'pid' => safe_gpc_string($_GPC['pid']),
                'abstract' => safe_gpc_string($_GPC['abstract']),
                'create_time' => TIMESTAMP,
                'uniacid' => $_W['uniacid']
            );

            if (!empty($id)) {
                pdo_update('we_xz_product_category', $data, array('id' => $id));
                message('修改成功', $this->createWebUrl('category'));
            } else {
                pdo_insert('we_xz_product_category', $data);
                message('添加成功', $this->createWebUrl('category'));
            }
        }
        include $this->template('detail');
    }
    //删除产品类
    public function doWebProduct_category_delete() {
        global $_W, $_GPC;
        $id = safe_gpc_int($_GPC['id']);
        if (empty($id)) {
            itoast('非法操作', $this->createWebUrl('category'));
        }
        pdo_delete('we_xz_product_category', array('id' => $id));
        itoast('删除成功', $this->createWebUrl('category'));
    }
    //文章列表页面
    public function doWebDisplay(){
        include $this->template('display');
    }
    //产品类别列表
    public function doWebCategory(){
        global $_W, $_GPC;
        $pageindex = max(array(intval($_GPC['page']), 1 ));
        $pagesize = 10;
        $condition = array();
        $condition['uniacid'] = $_W['uniacid'];
        $keyword = safe_gpc_string($_GPC['title'], '');
        if (!empty($keyword)) {
            $condition['title LIKE'] = "%{$keyword}%";
        }
        $lists = pdo_getslice('we_xz_product_category', $condition, array($pageindex, $pagesize), $total,'', 'id', 'id desc');
        $pager = pagination($total, $pageindex, $pagesize);
        $cates=$this->getProductCategory();
        $arr=array();
        foreach($cates as $k=>$vl){
            foreach($lists as $key=>$val){
                $arr[$key]['id']=$val['id'];
                $arr[$key]['title']=$val['title'];
                $arr[$key]['pid']=$val['pid'];
                if($val['pid']==$vl['id']){
                    $arr[$key]['pcate']=$vl['title'];
                }
            }
        }
        include $this->template('category');
    }
    //产品编辑页面
    public function doWebTxt(){
        include $this->template('txt');
    }
    //产品列表
    public function doWebShow(){
        global $_W, $_GPC;
        $pageindex = max(array(intval($_GPC['page']), 1 ));
        $pagesize = 10;
        $condition = array();
        $condition['uniacid'] = $_W['uniacid'];
        $keyword = safe_gpc_string($_GPC['title'], '');
        if (!empty($keyword)) {
            $condition['title LIKE'] = "%{$keyword}%";
        }
        $lists = pdo_getslice('we_xz_product', $condition, array($pageindex, $pagesize), $total,'', 'id', 'id desc');
        $pager = pagination($total, $pageindex, $pagesize);
        include $this->template('show');
    }
    //联系方式编辑页面
    public function doWebContact(){
        global $_W;
        $list = pdo_get('we_xz_company_info', array('uniacid' => $_W['uniacid']));//公司信息
        include $this->template('contact');
    }
    //删除新闻文章
	public function doWebNews_delete() {
		global $_W, $_GPC;
		$id = safe_gpc_int($_GPC['id']);
		if (empty($id)) {
			itoast('非法操作', $this->createWebUrl('display'));
		}
		pdo_delete('we_xz_news', array('id' => $id));
		itoast('删除成功', $this->createWebUrl('display'));
	}
	//删除产品
    public function doWebProduct_delete() {
        global $_W, $_GPC;
        $id = safe_gpc_int($_GPC['id']);
        if (empty($id)) {
            itoast('非法操作', $this->createWebUrl('show'));
        }
        pdo_delete('we_xz_product', array('id' => $id));
        itoast('删除成功', $this->createWebUrl('show'));
    }
    //设置信息（设置首页）
	public function doWebSet() {
		global $_W, $_GPC;
		$setting = pdo_get('we_xz_setting', array('key' => 'setting', 'uniacid' => $_W['uniacid']));
		if (!empty($setting['value'])) {
			$setting = iunserializer($setting['value']);
		}
		if ($_W['ispost']) {
            $uni_setting['name'] = safe_gpc_string($_GPC['name']);
            $uni_setting['keywords'] = safe_gpc_string($_GPC['keywords']);
            $uni_setting['profile'] = safe_gpc_string($_GPC['profile']);
			$uni_setting['about'] = safe_gpc_string($_GPC['about']);
			$uni_setting['copyright'] = safe_gpc_string($_GPC['copyright']);
			$uni_setting['flogo'] = safe_gpc_string($_GPC['flogo']);
            $uni_setting['background'] = safe_gpc_string($_GPC['background']);
			$uni_setting = iserializer($uni_setting);
			if (!empty($setting)) {
				pdo_update('we_xz_setting', array('value' => $uni_setting), array('key' => 'setting', 'uniacid' => $_W['uniacid']));
			} else {
				pdo_insert('we_xz_setting', array('key' => 'setting', 'value' => $uni_setting, 'uniacid' => $_W['uniacid']));
			}
			itoast('设置成功！', $this->createWebUrl('set'), 'success');
		}
		include $this->template('web-setting');
	}
	//添加首页轮播图
	public function doWebSlide_add(){
        global $_W, $_GPC;
        $id=safe_gpc_int($_GPC['id']);
        $list = pdo_get('we_xz_slides', array( 'id' => $id));
        if (checksubmit('submit')) {
            if (empty($_GPC['img'])) {
                itoast('图片不能为空', referer());
            }
            $data = array(
                'title' => safe_gpc_string($_GPC['title']),
                'img' => safe_gpc_string($_GPC['img']),
                'create_time' => TIMESTAMP,
                'uniacid' => $_W['uniacid']
            );

            if (!empty($id)) {
                pdo_update('we_xz_slides', $data, array('id' => $id));
                message('修改成功', $this->createWebUrl('slides'));
            } else {
                $add=pdo_insert('we_xz_slides', $data);
                message('添加成功', $this->createWebUrl('slides'));
            }
        }
        include $this->template('slide_edit');
    }
    //轮播图列表页
    public function doWebSlides(){
        load()->func('file');
        global $_W, $_GPC;
        $pageindex = max(array(intval($_GPC['page']), 1 ));
        $pagesize = 5;
        $condition = array();
        $condition['uniacid'] = $_W['uniacid'];
        $list = pdo_getslice('we_xz_slides', $condition, array($pageindex, $pagesize), $total,'', 'id', 'id desc');
        $pager = pagination($total, $pageindex, $pagesize);
        include $this->template('slides');
    }
	//获取产品父类
    public function getProductCategory(){
        global $_W, $_GPC;
        $list = pdo_getall('we_xz_product_category', array('uniacid' => $_W['uniacid'],'pid'=>'0'));
        if (isset($list['0'])) {
            $category=$list;
        }
        return $category;
    }
    //获取产品所有类
    public function get_all_product_category(){
        global $_W, $_GPC;
        $list = pdo_getall('we_xz_product_category', array('uniacid' => $_W['uniacid']));
        if (isset($list['0'])) {
            $category=$list;
        }
        return $category;
    }
}