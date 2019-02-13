<?php
$sql =
"
CREATE TABLE IF NOT EXISTS " . tablename('we_xz_news') . " (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '新闻标题',
  `content` mediumtext NOT NULL COMMENT '新闻内容',
  `type` varchar(20) NOT NULL COMMENT '文章类别',
  `uniacid` int(11) NOT NULL,
  `create_time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS " . tablename('we_xz_product_category') . " (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '产品类名',
  `pid` int(3) NOT NULL DEFAULT '0' COMMENT '父类id',
  `abstract` varchar(200) NOT NULL DEFAULT '' COMMENT '产品类简介',
  `uniacid` int(11) NOT NULL,
  `create_time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS " . tablename('we_xz_product') . " (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cateid` int(11) NOT NULL,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '产品名称',
  `product_model` varchar(25) DEFAULT '' COMMENT '产品型号',
  `img_url` text NOT NULL DEFAULT '' COMMENT '产品图',
  `description` text NOT NULL DEFAULT '' COMMENT '产品描述',
  `uniacid` int(11) NOT NULL,
  `create_time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS " . tablename('we_xz_news_class') . " (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '文章类名',
  `uniacid` int(11) NOT NULL,
  `create_time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS " . tablename('we_xz_setting') . " (
  `key` varchar(100) NOT NULL,
  `value` mediumtext NOT NULL COMMENT '设置的内容',
  `uniacid` int(11) NOT NULL,
  KEY `key` (`key`)
) DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS " . tablename('we_xz_slides') . " (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `img` varchar(150) NOT NULL COMMENT '轮播图路径',
  `uniacid` int(11) NOT NULL,
  `create_time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS " . tablename('we_xz_company_info') . " (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '公司名称',
  `phone` varchar(30) NOT NULL DEFAULT '' COMMENT '手机号码',
  `tel` varchar(12) DEFAULT '' COMMENT '座机号码',
  `qq` int(15)  COMMENT 'qq',
  `address` varchar(100) NOT NULL DEFAULT '' COMMENT '公司地址',
  `uniacid` int(11) NOT NULL,
  `create_time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;
";
pdo_query($sql);