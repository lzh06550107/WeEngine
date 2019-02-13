<?php
defined('IN_IA') or exit('Access Denied');

class We_xzModuleWebapp extends WeModuleWebapp {
    //产品列表页
    public function doPageProduct_list() {
        global $_GPC, $_W;
        $id=safe_gpc_int($_GPC['id']);
        $keyword=safe_gpc_string($_GPC['title'], '');
        $res=$this->get_page_category_product($id);
        $category=pdo_getall('we_xz_product_category',array('uniacid'=>$_W['uniacid']));
        $arr=$this->get_wuji_category();
        $company=$this->get_company_info();
        $setting = $this->getWebSetting();
        $slides=$this->get_new_slides();
        include $this->template('product_list');
    }
    //根据条件分类分页查询产品
    /**@param $id int 产品类id 默认为null
    */
    public function get_page_category_product($id){
        global $_GPC, $_W;
        $condition = array();
        $condition['p.uniacid'] = $_W['uniacid'];
        $condition['c.id'] = $id>0 ? $id : 1;
        $pindex = max(array(1, intval($_GPC['page'])));
        $psize = 12;
        $p=($pindex-1)*$psize;
        $query = load()->object('query');
        $products= $product=$query->from('we_xz_product', 'p')
            ->leftjoin('we_xz_product_category', 'c')
            ->on(array('p.cateid'=> 'c.id','p.uniacid'=>'c.uniacid'))
            ->where($condition)
            ->select('c.title as cate','c.abstract','p.*')
            ->orderby('p.id','DESC')
            ->getall();
        $total=count($products);
        $pager = pagination($total, $pindex, $psize);
        $product= $product=$query->from('we_xz_product', 'p')
            ->leftjoin('we_xz_product_category', 'c')
            ->on(array('p.cateid'=> 'c.id','p.uniacid'=>'c.uniacid'))
            ->where($condition)
            ->select('c.title as cate','c.abstract','p.*')
            ->orderby('p.id','DESC')
            ->limit($p,$psize)
            ->getall();
        $res['page']=$pager;
        $res['rows']=$product;
        return $res;
    }
    //产品详情页
    public function doPageProduct() {
        global $_GPC, $_W;
        $id=intval($_GPC['id']);
        $list=pdo_get('we_xz_product',array('uniacid'=>$_W['uniacid'],'id'=>$id));
        $category=pdo_getall('we_xz_product_category',array('uniacid'=>$_W['uniacid']));
        $arr=array();$cates=array();
        foreach($category as $key=>$val){
            if($val['pid']=='0'){
                $arr[$key]['id']=$val['id'];
                $arr[$key]['title']=$val['title'];
            }else{
                $cates[$key]['id']=$val['id'];
                $cates[$key]['title']=$val['title'];
                $cates[$key]['pid']=$val['pid'];
            }
        }
        foreach($arr as $key=>$val){
            foreach($cates as $ke=>$vo){
                if($vo['pid']==$val['id']){
                    $arr[$key]['next'][$ke]=$vo;
                }
            }
        }
        $setting = $this->getWebSetting();
        $company=$this->get_company_info();
        $arr=$this->get_wuji_category();
        $slides=$this->get_new_slides();
        include $this->template('product');
    }
  //联系我们
    public function doPageContact() {
        global $_GPC, $_W;
        $company=$this->get_company_info();
        $setting = $this->getWebSetting();
        $slides=$this->get_new_slides();
        $arr=$this->get_wuji_category();
        $url='http://api.map.baidu.com/geocoder/v2/?address='.$company['address'].'&output=json&ak=8cyD50Fb6UK42up4hV12Pva5uLhyAkEh';
        $res=json_decode(file_get_contents($url));
        $rows=$this->object_array($res);
        $lng_lat=$rows['result']['location']['lng'].','.$rows['result']['location']['lat'];
        include $this->template('contact');
    }
    //将对象转换成数组
    public function object_array($array) {
        if(is_object($array)) {
            $array = (array)$array;
        } if(is_array($array)) {
            foreach($array as $key=>$value) {
                $array[$key] = $this->object_array($value);
            }
        }
        return $array;
    }
    //前端首页
	public function doPageFengmian() {
		global $_W;
		$lists = pdo_getall('we_xz_news', array('uniacid' => $_W['uniacid']), '', 'id desc', array(1, 20));
		$products=$this->get_category_product(1,3);
        $products1=$this->get_category_product(2,4);
        $products2=$this->get_category_product(3,3);
        $products3=$this->get_category_product(4,8);
        $slides=$this->get_new_slides();
        $news1=$this->get_class_news(1);
        $news2=$this->get_class_news(2);
        $company=$this->get_company_info();
		$setting = $this->getWebSetting('we_xz_product',array('uniacid' => $_W['uniacid']));
        $arr=$this->get_wuji_category();
		include $this->template('webappindex');
	}
	//获取分类文章 $id为文章分类id;
    public function get_class_news($id){
        global $_W;
        $arr=array();
        $query = load()->object('query');
        $news=$query->from('we_xz_news', 'n')
            ->leftjoin('we_xz_news_class', 'c')
            ->on(array('n.type'=> 'c.id','n.uniacid'=>'c.uniacid'))
            ->where(array('n.uniacid'=>$_W['uniacid'],'c.id'=>$id))
            ->select('c.title as category','n.*')
            ->orderby('n.id','DESC')
            ->limit(0,2)
            ->getall();
        foreach($news as $k=>$vl){
            $arr['category']=$news[0]['category'];
            $arr['list'][$k]['id']=$vl['id'];
            $arr['list'][$k]['type']=$vl['type'];
            $arr['list'][$k]['title']=$vl['title'];
            $arr['list'][$k]['content']=$vl['content'];
            $arr['list'][$k]['create_time']=$vl['create_time'];
        }
        return $arr;
    }
	//获取分类产品
    public function get_category_product($id,$num=1){
        global $_W;
        $products=array();
        $query = load()->object('query');
        $product_list=$query->from('we_xz_product', 'p')
            ->leftjoin('we_xz_product_category', 'c')
            ->on(array('p.cateid'=> 'c.id','p.uniacid'=>'c.uniacid'))
            ->where(array('p.uniacid'=>$_W['uniacid'],'c.id'=>$id))
            ->select('c.title as cate','c.abstract','p.*')
            ->orderby('p.id','DESC')
            ->limit(0,$num)
            ->getall();
        foreach($product_list as $key=>$val){
            $products[$val['cate']]['abstract']=$val['abstract'];
            $products[$val['cate']]['data'][$key]['id']=$val['id'];
            $products[$val['cate']]['data'][$key]['cateid']=$val['cateid'];
            $products[$val['cate']]['data'][$key]['title']=$val['title'];
            $products[$val['cate']]['data'][$key]['product_model']=$val['product_model'];
            $products[$val['cate']]['data'][$key]['img_url']=$val['img_url'];
            $products[$val['cate']]['data'][$key]['description']=$val['description'];
        }
        return $products;
    }
    //资讯中心
    public function doPageNews(){
        global $_GPC, $_W;
        $type=safe_gpc_int($_GPC['type']);
        $company=$this->get_company_info();
        $setting = $this->getWebSetting();
        $arr=$this->get_wuji_category();
        $slides=$this->get_new_slides();
        $new_cates=pdo_getall('we_xz_news_class',array('uniacid'=>$_W['uniacid']));
        $condition=array();
        $condition['n.uniacid']=$_W['uniacid'];
        if(!empty($type)){
            $condition['n.type']=$type;
        }
        $query = load()->object('query');
        $list= $query->from('we_xz_news', 'n')->where($condition)->orderby('n.id','DESC')->getall();
        $total=count($list);
        $pageindex = max(array($_GPC['page'], 1 ));
        $pagesize = 8;
        $pager = pagination(count($list),$pageindex, $pagesize);
        $p=($pageindex-1)*$pagesize;
        $lists= $query->from('we_xz_news', 'n')->where($condition)->orderby('n.id','DESC')->limit($p,$pagesize)->getall();
        include $this->template('news');
    }

	public function doPageDetail() {
		global $_GPC;
		$id = $_GPC['id'];
		$list = pdo_get('we_xz_news', array('id' => $id));
		$setting = $this->getWebSetting();
        $slides=$this->get_new_slides();
		include $this->template('news');
	}

	public function doPageList() {
		global $_GPC, $_W;
		$pindex = max(1, intval($_GPC['page']));
		$psize = 20;

		$lists = pdo_getslice('we_xz_news', array('uniacid' => $_W['uniacid']), array($pindex, $psize), $total, array(), '', 'id desc');
		$pager = pagination($total, $pindex, $psize);
		$setting = $this->getWebSetting();
        $slides=$this->get_new_slides();
		include $this->template('news');
	}
    //关于我们页面
	public function doPageAbout() {
		global $_GPC, $_W;
		$setting = $this->getWebSetting();
        $company=$this->get_company_info();
        $arr=$this->get_wuji_category();
        $slides=$this->get_new_slides();
		include $this->template('about');
	}
    //获取首页设置的内容
	public function getWebSetting() {
		global $_W, $_GPC;
		$setting = pdo_get('we_xz_setting', array('key' => 'setting', 'uniacid' => $_W['uniacid']));
		if (!empty($setting['value'])) {
			$setting = iunserializer($setting['value']);
		}
		return $setting;
	}
    //获取公司信息（用于前端页面底部）
    public function get_company_info(){
        global $_W;
        $company=pdo_get('we_xz_company_info', array('uniacid' =>$_W['uniacid']));//公司信息
        return $company;
    }
    //通过输入内容查询产品
    public function doPageProduct_search(){
        global $_GPC,$_W;
        $pindex = max(array(1, intval($_GPC['page'])));
        $psize = 100;
        $condition = array();
        $condition['uniacid'] = $_W['uniacid'];
        $keyword=safe_gpc_string($_GPC['title'], '');
        if(!empty($keyword)){
            $condition['title LIKE']="%{$keyword}%";
        }
        $lists = pdo_getslice('we_xz_product', $condition, array($pindex, $psize), $total,'', 'id', 'id desc');
        $pager = pagination($total, $pindex, $psize);
        $company=$this->get_company_info();
        $setting = $this->getWebSetting();
        $arr=$this->get_wuji_category();
        $slides=$this->get_new_slides();
        $category=pdo_getall('we_xz_product_category',array('uniacid'=>$_W['uniacid']));
        $arr=array();//所有类
        $cates=array();//子类
        foreach($category as $key=>$val){
            if($val['pid']=='0'){
                $arr[$key]['id']=$val['id'];
                $arr[$key]['title']=$val['title'];
            }else{
                $cates[$key]['id']=$val['id'];
                $cates[$key]['title']=$val['title'];
                $cates[$key]['pid']=$val['pid'];
            }
        }
        foreach($arr as $key=>$val){
            foreach($cates as $ke=>$vo){
                if($vo['pid']==$val['id']){
                    $arr[$key]['next'][$ke]=$vo;
                }
            }
        }
        $res['rows']=$lists;
//        $res['page']=$pager;
        $res['keyword']=safe_gpc_string($_GPC['title']);
        include $this->template('product_list');
    }
    //头部中查询产品所有类及子类(无极分类)
    public function get_wuji_category(){
        global $_W;
        $arr=array();//所有类
        $cates=array();//子类
        $category=pdo_getall('we_xz_product_category',array('uniacid'=>$_W['uniacid']));
        foreach($category as $key=>$val){
            if($val['pid']=='0'){
                $arr[$key]['id']=$val['id'];
                $arr[$key]['title']=$val['title'];
            }else{
                $cates[$key]['id']=$val['id'];
                $cates[$key]['title']=$val['title'];
                $cates[$key]['pid']=$val['pid'];
            }
        }
        foreach($arr as $key=>$val){
            foreach($cates as $ke=>$vo){
                if($vo['pid']==$val['id']){
                    $arr[$key]['next'][$ke]=$vo;
                }
            }
        }
        return $arr;
    }
    //新闻详情页
    public function doPageNews_detail() {
        global $_GPC, $_W;
        $id=intval($_GPC['id']);
        $list=pdo_get('we_xz_news',array('id'=>$id));
        $setting = $this->getWebSetting();
        $company=$this->get_company_info();
        $arr=$this->get_wuji_category();
        $slides=$this->get_new_slides();
        include $this->template('news_detail');
    }
    //新闻分类列表
    public function doPageNews_category_list() {
        global $_GPC, $_W;
        $type=safe_gpc_string($_GPC['type']);
        $setting = $this->getWebSetting();
        $company=$this->get_company_info();
        $arr=$this->get_wuji_category();
        $slides=$this->get_new_slides();
        $query = load()->object('query');
        $list= $query->from('we_xz_news', 'n')->where('n.uniacid',$_W['uniacid'])->orderby('n.id','DESC')->getall();
        $total=count($list);
        $pageindex = max(array($_GPC['page'], 1 ));
        $pagesize = 8;
        $pager = pagination($total,$pageindex, $pagesize);
        $p=($pageindex-1)*$pagesize;
        $lists= $query->from('we_xz_news', 'n')->where(array('n.uniacid'=>$_W['uniacid'],'type'=>$type))->orderby('n.id','DESC')->limit($p,$pagesize)->getall();
        include $this->template('news');
    }

    //获取轮播图
    public function get_new_slides(){
        global $_W;
        $slides=pdo_getall('we_xz_slides',array('uniacid'=>$_W['uniacid']),'','','id DESC','0,5');
        return $slides;
    }


}