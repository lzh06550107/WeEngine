<?php
$sql="CREATE TABLE IF NOT EXISTS `ims_bf_kanjia` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '表id',
  `rid` int(10) NOT NULL COMMENT '规则id',
  `uid` int(10) NOT NULL COMMENT '用户id',
  `uniacid` int(10) NOT NULL COMMENT '公号id',
  `title` varchar(100) NOT NULL COMMENT '标题|商品名称',
  `cover` varchar(255) NOT NULL COMMENT '封面',
  `starttime` int(10) NOT NULL COMMENT '开始时间',
  `endtime` int(10) NOT NULL COMMENT '结束时间',
  `tel` varchar(20) NOT NULL COMMENT '客服电话',
  `buy_type` tinyint(1) NOT NULL COMMENT '购买模式',
  `join_url` varchar(500) NOT NULL COMMENT '入驻链接',
  `follow_url` varchar(500) NOT NULL COMMENT '关注链接',
  `follow_must` tinyint(1) NOT NULL COMMENT '参与强制关注',
  `follow_must_help` tinyint(1) NOT NULL COMMENT '帮砍强制关注',
  `max_help` int(10) NOT NULL COMMENT '最大帮砍次数',
  `notice` varchar(2000) NOT NULL COMMENT '须知',
  `rules` varchar(2000) NOT NULL COMMENT '规则',
  `blacklist_nickname` varchar(2000) NOT NULL COMMENT '粉丝昵称数组',
  `blacklist_openid` varchar(2000) NOT NULL COMMENT '粉丝编号数组',
  `blacklist_notice` varchar(200) NOT NULL COMMENT '黑名单提示',
  `product_name` varchar(255) NOT NULL COMMENT '商品名称',
  `product_image` varchar(255) NOT NULL COMMENT '产品图片',
  `product_price` decimal(10,2) NOT NULL COMMENT '原价',
  `product_pricelow` decimal(10,2) NOT NULL COMMENT '底价',
  `product_inventory` int(10) NOT NULL COMMENT '库存',
  `product_sold` int(10) NOT NULL DEFAULT '0' COMMENT '已售',
  `product_detail` varchar(5000) NOT NULL COMMENT '详情',
  `product_url` varchar(500) NOT NULL COMMENT '产品链接',
  `share_title` varchar(255) NOT NULL COMMENT '分享标题',
  `share_link` varchar(255) NOT NULL COMMENT '分享链接',
  `share_imgUrl` varchar(255) NOT NULL COMMENT '分享图片',
  `share_desc` varchar(255) NOT NULL COMMENT '分享介绍',
  `number_join` int(10) NOT NULL DEFAULT '0' COMMENT '参与人数',
  `number_help` int(10) NOT NULL DEFAULT '0' COMMENT '助力人数',
  `footer` varchar(500) NOT NULL COMMENT '页面底部',
  `ip_max` int(10) NOT NULL COMMENT 'ip限制次数',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态',
  `qrcode` tinyint(1) NOT NULL DEFAULT '0' COMMENT '二维码核销',
  `createtime` int(10) NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS `ims_bf_kanjia_help` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '行id',
  `uniacid` int(10) NOT NULL COMMENT '公号id',
  `rid` int(10) NOT NULL COMMENT '砍价记录id',
  `openid` varchar(50) NOT NULL COMMENT '粉丝openid',
  `nickname` varchar(50) NOT NULL COMMENT '粉丝名称',
  `headimgurl` varchar(255) NOT NULL COMMENT '头像',
  `price` decimal(10,2) NOT NULL COMMENT '砍掉的价格',
  `ip` varchar(20) NOT NULL COMMENT 'ip地址',
  `createtime` int(10) NOT NULL COMMENT '插入时间',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS `ims_bf_kanjia_order` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '行id',
  `uniacid` int(10) NOT NULL COMMENT '公号id',
  `acid` int(10) NOT NULL COMMENT '子公号id',
  `kid` int(10) NOT NULL COMMENT '砍价id',
  `rid` int(10) NOT NULL COMMENT '砍价记录id',
  `uid` int(10) NOT NULL COMMENT '用户id',
  `openid` varchar(50) NOT NULL COMMENT '粉丝openid',
  `name` varchar(20) NOT NULL COMMENT '姓名',
  `address` varchar(255) NOT NULL COMMENT '地址',
  `tel` varchar(20) NOT NULL COMMENT '联系方式',
  `uniontid` varchar(50) NOT NULL COMMENT '订单编号',
  `price` decimal(10,2) NOT NULL COMMENT '金额',
  `remark` varchar(255) NOT NULL COMMENT '备注',
  `expressname` varchar(50) NOT NULL COMMENT '物流公司',
  `expresscode` varchar(50) NOT NULL COMMENT '物流单号',
  `status` tinyint(1) NOT NULL COMMENT '状态',
  `usetime` int(10) NOT NULL COMMENT '使用时间',
  `createtime` int(10) NOT NULL COMMENT '插入时间',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS `ims_bf_kanjia_record` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '行id',
  `uniacid` int(10) NOT NULL COMMENT '公号id',
  `acid` int(10) NOT NULL COMMENT '子公号id',
  `kid` int(10) NOT NULL COMMENT '砍价id',
  `uid` int(10) NOT NULL COMMENT '粉丝会员id',
  `openid` varchar(50) NOT NULL COMMENT '粉丝id',
  `nickname` varchar(50) NOT NULL COMMENT '粉丝名称',
  `headimgurl` varchar(255) NOT NULL COMMENT '粉丝头像',
  `price` decimal(10,2) NOT NULL COMMENT '剩下的价格',
  `number_help` int(10) NOT NULL DEFAULT '0' COMMENT '助力人次',
  `createtime` int(10) NOT NULL COMMENT '插入的时间',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS `ims_bf_kanjia_shop` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `uniacid` int(10) NOT NULL COMMENT '公号id',
  `uid` int(10) NOT NULL COMMENT '对应的用户id',
  `rule` varchar(2000) NOT NULL COMMENT '权限',
  `createtime` int(10) NOT NULL COMMENT '插入时间',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
";
pdo_run($sql);
if(!pdo_fieldexists('bf_kanjia',  'id')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '表id';");
}
if(!pdo_fieldexists('bf_kanjia',  'rid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `rid` int(10) NOT NULL COMMENT '规则id';");
}
if(!pdo_fieldexists('bf_kanjia',  'uid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `uid` int(10) NOT NULL COMMENT '用户id';");
}
if(!pdo_fieldexists('bf_kanjia',  'uniacid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `uniacid` int(10) NOT NULL COMMENT '公号id';");
}
if(!pdo_fieldexists('bf_kanjia',  'title')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `title` varchar(100) NOT NULL COMMENT '标题|商品名称';");
}
if(!pdo_fieldexists('bf_kanjia',  'cover')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `cover` varchar(255) NOT NULL COMMENT '封面';");
}
if(!pdo_fieldexists('bf_kanjia',  'starttime')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `starttime` int(10) NOT NULL COMMENT '开始时间';");
}
if(!pdo_fieldexists('bf_kanjia',  'endtime')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `endtime` int(10) NOT NULL COMMENT '结束时间';");
}
if(!pdo_fieldexists('bf_kanjia',  'tel')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `tel` varchar(20) NOT NULL COMMENT '客服电话';");
}
if(!pdo_fieldexists('bf_kanjia',  'buy_type')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `buy_type` tinyint(1) NOT NULL COMMENT '购买模式';");
}
if(!pdo_fieldexists('bf_kanjia',  'join_url')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `join_url` varchar(500) NOT NULL COMMENT '入驻链接';");
}
if(!pdo_fieldexists('bf_kanjia',  'follow_url')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `follow_url` varchar(500) NOT NULL COMMENT '关注链接';");
}
if(!pdo_fieldexists('bf_kanjia',  'follow_must')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `follow_must` tinyint(1) NOT NULL COMMENT '参与强制关注';");
}
if(!pdo_fieldexists('bf_kanjia',  'follow_must_help')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `follow_must_help` tinyint(1) NOT NULL COMMENT '帮砍强制关注';");
}
if(!pdo_fieldexists('bf_kanjia',  'max_help')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `max_help` int(10) NOT NULL COMMENT '最大帮砍次数';");
}
if(!pdo_fieldexists('bf_kanjia',  'notice')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `notice` varchar(2000) NOT NULL COMMENT '须知';");
}
if(!pdo_fieldexists('bf_kanjia',  'rules')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `rules` varchar(2000) NOT NULL COMMENT '规则';");
}
if(!pdo_fieldexists('bf_kanjia',  'blacklist_nickname')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `blacklist_nickname` varchar(2000) NOT NULL COMMENT '粉丝昵称数组';");
}
if(!pdo_fieldexists('bf_kanjia',  'blacklist_openid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `blacklist_openid` varchar(2000) NOT NULL COMMENT '粉丝编号数组';");
}
if(!pdo_fieldexists('bf_kanjia',  'blacklist_notice')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `blacklist_notice` varchar(200) NOT NULL COMMENT '黑名单提示';");
}
if(!pdo_fieldexists('bf_kanjia',  'product_name')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `product_name` varchar(255) NOT NULL COMMENT '商品名称';");
}
if(!pdo_fieldexists('bf_kanjia',  'product_image')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `product_image` varchar(255) NOT NULL COMMENT '产品图片';");
}
if(!pdo_fieldexists('bf_kanjia',  'product_price')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `product_price` decimal(10,2) NOT NULL COMMENT '原价';");
}
if(!pdo_fieldexists('bf_kanjia',  'product_pricelow')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `product_pricelow` decimal(10,2) NOT NULL COMMENT '底价';");
}
if(!pdo_fieldexists('bf_kanjia',  'product_inventory')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `product_inventory` int(10) NOT NULL COMMENT '库存';");
}
if(!pdo_fieldexists('bf_kanjia',  'product_sold')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `product_sold` int(10) NOT NULL DEFAULT '0' COMMENT '已售';");
}
if(!pdo_fieldexists('bf_kanjia',  'product_detail')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `product_detail` varchar(5000) NOT NULL COMMENT '详情';");
}
if(!pdo_fieldexists('bf_kanjia',  'product_url')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `product_url` varchar(500) NOT NULL COMMENT '产品链接';");
}
if(!pdo_fieldexists('bf_kanjia',  'share_title')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `share_title` varchar(255) NOT NULL COMMENT '分享标题';");
}
if(!pdo_fieldexists('bf_kanjia',  'share_link')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `share_link` varchar(255) NOT NULL COMMENT '分享链接';");
}
if(!pdo_fieldexists('bf_kanjia',  'share_imgUrl')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `share_imgUrl` varchar(255) NOT NULL COMMENT '分享图片';");
}
if(!pdo_fieldexists('bf_kanjia',  'share_desc')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `share_desc` varchar(255) NOT NULL COMMENT '分享介绍';");
}
if(!pdo_fieldexists('bf_kanjia',  'number_join')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `number_join` int(10) NOT NULL DEFAULT '0' COMMENT '参与人数';");
}
if(!pdo_fieldexists('bf_kanjia',  'number_help')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `number_help` int(10) NOT NULL DEFAULT '0' COMMENT '助力人数';");
}
if(!pdo_fieldexists('bf_kanjia',  'footer')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `footer` varchar(500) NOT NULL COMMENT '页面底部';");
}
if(!pdo_fieldexists('bf_kanjia',  'ip_max')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `ip_max` int(10) NOT NULL COMMENT 'ip限制次数';");
}
if(!pdo_fieldexists('bf_kanjia',  'status')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态';");
}
if(!pdo_fieldexists('bf_kanjia',  'qrcode')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `qrcode` tinyint(1) NOT NULL DEFAULT '0' COMMENT '二维码核销';");
}
if(!pdo_fieldexists('bf_kanjia',  'createtime')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia')." ADD `createtime` int(10) NOT NULL COMMENT '创建时间';");
}
if(!pdo_fieldexists('bf_kanjia_help',  'id')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_help')." ADD `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '行id';");
}
if(!pdo_fieldexists('bf_kanjia_help',  'uniacid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_help')." ADD `uniacid` int(10) NOT NULL COMMENT '公号id';");
}
if(!pdo_fieldexists('bf_kanjia_help',  'rid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_help')." ADD `rid` int(10) NOT NULL COMMENT '砍价记录id';");
}
if(!pdo_fieldexists('bf_kanjia_help',  'openid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_help')." ADD `openid` varchar(50) NOT NULL COMMENT '粉丝openid';");
}
if(!pdo_fieldexists('bf_kanjia_help',  'nickname')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_help')." ADD `nickname` varchar(50) NOT NULL COMMENT '粉丝名称';");
}
if(!pdo_fieldexists('bf_kanjia_help',  'headimgurl')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_help')." ADD `headimgurl` varchar(255) NOT NULL COMMENT '头像';");
}
if(!pdo_fieldexists('bf_kanjia_help',  'price')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_help')." ADD `price` decimal(10,2) NOT NULL COMMENT '砍掉的价格';");
}
if(!pdo_fieldexists('bf_kanjia_help',  'ip')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_help')." ADD `ip` varchar(20) NOT NULL COMMENT 'ip地址';");
}
if(!pdo_fieldexists('bf_kanjia_help',  'createtime')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_help')." ADD `createtime` int(10) NOT NULL COMMENT '插入时间';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'id')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '行id';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'uniacid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `uniacid` int(10) NOT NULL COMMENT '公号id';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'acid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `acid` int(10) NOT NULL COMMENT '子公号id';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'kid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `kid` int(10) NOT NULL COMMENT '砍价id';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'rid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `rid` int(10) NOT NULL COMMENT '砍价记录id';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'uid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `uid` int(10) NOT NULL COMMENT '用户id';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'openid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `openid` varchar(50) NOT NULL COMMENT '粉丝openid';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'name')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `name` varchar(20) NOT NULL COMMENT '姓名';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'address')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `address` varchar(255) NOT NULL COMMENT '地址';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'tel')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `tel` varchar(20) NOT NULL COMMENT '联系方式';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'uniontid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `uniontid` varchar(50) NOT NULL COMMENT '订单编号';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'price')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `price` decimal(10,2) NOT NULL COMMENT '金额';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'remark')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `remark` varchar(255) NOT NULL COMMENT '备注';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'expressname')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `expressname` varchar(50) NOT NULL COMMENT '物流公司';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'expresscode')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `expresscode` varchar(50) NOT NULL COMMENT '物流单号';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'status')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `status` tinyint(1) NOT NULL COMMENT '状态';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'usetime')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `usetime` int(10) NOT NULL COMMENT '使用时间';");
}
if(!pdo_fieldexists('bf_kanjia_order',  'createtime')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_order')." ADD `createtime` int(10) NOT NULL COMMENT '插入时间';");
}
if(!pdo_fieldexists('bf_kanjia_record',  'id')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_record')." ADD `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '行id';");
}
if(!pdo_fieldexists('bf_kanjia_record',  'uniacid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_record')." ADD `uniacid` int(10) NOT NULL COMMENT '公号id';");
}
if(!pdo_fieldexists('bf_kanjia_record',  'acid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_record')." ADD `acid` int(10) NOT NULL COMMENT '子公号id';");
}
if(!pdo_fieldexists('bf_kanjia_record',  'kid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_record')." ADD `kid` int(10) NOT NULL COMMENT '砍价id';");
}
if(!pdo_fieldexists('bf_kanjia_record',  'uid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_record')." ADD `uid` int(10) NOT NULL COMMENT '粉丝会员id';");
}
if(!pdo_fieldexists('bf_kanjia_record',  'openid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_record')." ADD `openid` varchar(50) NOT NULL COMMENT '粉丝id';");
}
if(!pdo_fieldexists('bf_kanjia_record',  'nickname')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_record')." ADD `nickname` varchar(50) NOT NULL COMMENT '粉丝名称';");
}
if(!pdo_fieldexists('bf_kanjia_record',  'headimgurl')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_record')." ADD `headimgurl` varchar(255) NOT NULL COMMENT '粉丝头像';");
}
if(!pdo_fieldexists('bf_kanjia_record',  'price')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_record')." ADD `price` decimal(10,2) NOT NULL COMMENT '剩下的价格';");
}
if(!pdo_fieldexists('bf_kanjia_record',  'number_help')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_record')." ADD `number_help` int(10) NOT NULL DEFAULT '0' COMMENT '助力人次';");
}
if(!pdo_fieldexists('bf_kanjia_record',  'createtime')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_record')." ADD `createtime` int(10) NOT NULL COMMENT '插入的时间';");
}
if(!pdo_fieldexists('bf_kanjia_shop',  'id')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_shop')." ADD `id` int(10) NOT NULL AUTO_INCREMENT;");
}
if(!pdo_fieldexists('bf_kanjia_shop',  'uniacid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_shop')." ADD `uniacid` int(10) NOT NULL COMMENT '公号id';");
}
if(!pdo_fieldexists('bf_kanjia_shop',  'uid')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_shop')." ADD `uid` int(10) NOT NULL COMMENT '对应的用户id';");
}
if(!pdo_fieldexists('bf_kanjia_shop',  'rule')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_shop')." ADD `rule` varchar(2000) NOT NULL COMMENT '权限';");
}
if(!pdo_fieldexists('bf_kanjia_shop',  'createtime')) {
	pdo_query("ALTER TABLE ".tablename('bf_kanjia_shop')." ADD `createtime` int(10) NOT NULL COMMENT '插入时间';");
}

?>