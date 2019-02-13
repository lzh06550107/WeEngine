<?php
/**
 * 【超人】签到模块安装
 *
 * @author 超人
 * @url http://bbs.we7.cc/thread-9502-1-1.html
 */
defined('IN_IA') or exit('Access Denied');

//小程序
$tablename = tablename('superman_daka_wxapp');
$sql =<<<EOF
CREATE TABLE IF NOT EXISTS {$tablename} (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uniacid` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT '公众号id',
  `uid` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT 'uid',
  `signdate` INT NOT NULL DEFAULT '0' COMMENT '日期,如:20180101',
  `amount` DECIMAL(10,2) NOT NULL DEFAULT '0.00' COMMENT '金额',
  `reward` DECIMAL(10,2) NOT NULL DEFAULT '0.00' COMMENT '奖金',
  `status` TINYINT NOT NULL DEFAULT '0' COMMENT '状态,0:待支付,1:已支付,2:已打卡',
  `lucky` TINYINT NOT NULL DEFAULT '0' COMMENT '幸运奖,0:否,1:是',
  `prepay_id` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '小程序发模板消息',
  `payno` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '支付平台单号',
  `paytime` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT '支付时间戳',
  `inserttime` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT '创建时间戳',
  `updatetime` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT '更新时间戳',
  `signtime` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT '时间戳',
  `millisecond` VARCHAR(10) NOT NULL DEFAULT '0000' COMMENT '毫秒',
  PRIMARY KEY (`id`),
  UNIQUE `uniq_us` (`uid`, `signdate`),
  INDEX `indx_uniacid` (`uniacid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
EOF;
pdo_query($sql);
$tablename = tablename('superman_daka_wxapp_stat');
$sql =<<<EOF
CREATE TABLE IF NOT EXISTS {$tablename} (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uniacid` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT '公众号id',
  `uid` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT 'uid',
  `sign_total` INT NOT NULL DEFAULT '0'  COMMENT '签到总数',
  `sign_continue` INT NOT NULL DEFAULT '0'  COMMENT '连续签到',
  `updatetime` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT '更新时间戳',
  PRIMARY KEY (`id`),
  UNIQUE `uniq_uid` (`uid`),
  INDEX `indx_uniacid` (`uniacid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
EOF;
pdo_query($sql);
$tablename = tablename('superman_daka_wxapp_reward');
$sql =<<<EOF
CREATE TABLE IF NOT EXISTS {$tablename} (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uniacid` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT '公众号id',
  `signdate` INT NOT NULL DEFAULT '0' COMMENT '日期,如:20180101',
  `total` DECIMAL(10,2) NOT NULL DEFAULT '0.00' COMMENT '总奖金',
  `lucky` DECIMAL(10,2) NOT NULL DEFAULT '0.00' COMMENT '运气奖金',
  `reward` DECIMAL(10,2) NOT NULL DEFAULT '0.00' COMMENT '每人奖金',
  `lucky_uid` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT '幸运uid',
  `operator` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '操作人',
  `inserttime` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT '创建时间戳',
  `updatetime` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT '更新时间戳',
  PRIMARY KEY (`id`),
  UNIQUE `uniq_us` (`uniacid`, `signdate`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
EOF;
pdo_query($sql);