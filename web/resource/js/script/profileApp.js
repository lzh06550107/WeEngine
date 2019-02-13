angular.module("profileApp", ["we7app"]);

angular.module("profileApp").controller("oauthCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {

    $scope.config = a;
    $scope.oauthHost = a.oauthHost;
    $scope.oauthAccount = a.oauthAccount;
    $scope.oauthtitle = a.oauthAccounts[a.oauthAccount];
    $scope.jsOauthAccount = a.jsOauth;
    $scope.jsOauthtitle = a.jsOauthAccounts[a.jsOauth];
    $scope.originalHost = $scope.oauthHost;

    $scope.recover = function () {
        $scope.oauthHost = $scope.originalHost
    };

    $scope.saveOauth = function (type) {
        param = {};
        "oauth" == type && (param = {
            type: "oauth",
            account: $scope.oauthAccount,
            host: $scope.oauthHost
        });
        "jsoauth" == type && (param = {
            type: "jsoauth",
            account: $scope.jsOauthAccount
        });
        $http.post($scope.config.oauth_url, param).success(function (e) {
            0 == e.message.errno ? location.reload() : util.message("域名不合法", "", "error")
        })
    }
}
]).controller("tplCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.tplList = a.tplList;
    $scope.active = "";
    $scope.activetpl = "";

    $scope.changeActive = function (key) {
        $scope.active = key;
        $scope.activetpl = $scope.tplList[key].tpl;
    };

    $scope.saveTpl = function () {
        original_tpl = $scope.tplList[$scope.active].tpl;
        $scope.tplList[$scope.active].tpl = $scope.activetpl;
        $http.post(a.url, {
            tpl: $scope.tplList
        }).success(function (t) {
            1 == t.message.errno ? ($scope.tplList[$scope.active].tpl = original_tpl,
                util.message("请填写正确的" + t.message.message + "模板id", "", "info")) : $(".modal").modal("hide")
        })
    }
}
]).controller("emailCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.config = a;
    $scope.setting = $scope.config.setting;
    $scope.type = void 0 == $scope.setting.smtp ? "163" : $scope.setting.smtp.type;
    $scope.changeType = function (e) {
        var t = $(e)[0].target;
        $(t).attr("type", "password")
    }
}
]).controller("paymentCtrl", ["$scope", "$http", "config", "$timeout", function ($scope, $http, a, $timeout) {
    $scope.config = a;
    $scope.paysetting = a.paysetting;
    $scope.aliaccounthelp = false;
    $scope.alipartnerhelp = false;
    $scope.alisecrethelp = false;

    $scope.saveEdit = function (paytype) {
        if ("wechat_facilitator" == paytype && (true === $scope.paysetting.wechat_facilitator.pay_switch || true === $scope.paysetting.wechat_facilitator.recharge_switch)) {
            if ("" == $scope.paysetting.wechat_facilitator.mchid)
                return util.message("请填写服务商商户号", "", "info"),
                    false;
            if ("" == $scope.paysetting.wechat_facilitator.signkey)
                return util.message("请填写服务商商户支付密钥", "", "info"),
                    false
        }
        if ("alipay" == paytype && (true === $scope.paysetting.alipay.pay_switch || true === $scope.paysetting.alipay.recharge_switch)) {
            if ("" == $scope.paysetting.alipay.partner)
                return util.message("请填写合作者身份", "", "info"),
                    false;
            if ("" == $scope.paysetting.alipay.account)
                return util.message("请填写收款支付宝账号", "", "info"),
                    false;
            if ("" == $scope.paysetting.alipay.secret)
                return util.message("请填写校验密钥", "", "info"),
                    false
        }
        if ("wechat" == paytype) {
            if (1 == $scope.paysetting.wechat.switch)
                if (1 == $scope.paysetting.wechat.version) {
                    if ("" == $scope.paysetting.wechat.partner)
                        return util.message("请填写商户身份", "", "info"),
                            false;
                    if ("" == $scope.paysetting.wechat.key)
                        return util.message("请填写商户秘钥", "", "info"),
                            false;
                    if ("" == $scope.paysetting.wechat.signkey)
                        return util.message("请填写通信秘钥", "", "info"),
                            false
                } else {
                    if ("" == $scope.paysetting.wechat.mchid)
                        return util.message("请填写商户号", "", "info"),
                            false;
                    if ("" == $scope.paysetting.wechat.apikey)
                        return util.message("请填写支付秘钥", "", "info"),
                            false
                }
            if (3 == $scope.paysetting.wechat.switch) {
                if ("" == $scope.paysetting.wechat.service)
                    return util.message("请选择服务商公众号", "", "info"),
                        false;
                if ("" == $scope.paysetting.wechat.sub_mch_id)
                    return util.message("请填写子商户号", "", "info"),
                        false
            }
        }
        if ("unionpay" == paytype) {
            if (1 == $scope.paysetting.unionpay.pay_switch || 1 == $scope.paysetting.unionpay.recharge_switch) {
                if ("" == $scope.paysetting.unionpay.merid)
                    return util.message("请填写商户号", "", "info"),
                        false;
                if ("" == $scope.paysetting.unionpay.signcertpwd)
                    return util.message("请填写商户私钥证书密码", "", "info"),
                        false
            }
            return $("#form1").submit(),
                false
        }
        if ("baifubao" == paytype && (true === $scope.paysetting.baifubao.pay_switch || true === $scope.paysetting.baifubao.recharge_switch)) {
            if ("" == $scope.paysetting.baifubao.mchid)
                return util.message("请填写商户号", "", "info"),
                    false;
            if ("" == $scope.paysetting.baifubao.signkey)
                return util.message("请填写商户支付密钥", "", "info"),
                    false
        }
        if ("line" == paytype && (true === $scope.paysetting.line.pay_switch || true === $scope.paysetting.line.recharge_switch) && "" == $scope.paysetting.line.message)
            return util.message("请填写账户信息", "", "info"),
                false;
        if ("jueqiymf" == paytype && (true === $scope.paysetting.jueqiymf.pay_switch || true === $scope.paysetting.jueqiymf.recharge_switch)) {
            if ("" == $scope.paysetting.jueqiymf.url || void 0 == $scope.paysetting.jueqiymf.url)
                return util.message("请填写一码付后台地址", "", "info"),
                    false;
            if ("" == $scope.paysetting.jueqiymf.mchid || void 0 == $scope.paysetting.jueqiymf.mchid)
                return util.message("请填写商户号", "", "info"),
                    false
        }
        $http.post($scope.config.saveurl, {
            type: paytype,
            param: $scope.paysetting[paytype]
        }).success(function (e) {
            0 == e.message.errno && $(".modal").modal("hide")
        })
    };

    /**
     * 切换开关
     * @param paytype
     * @param operateType 是支付还是充值
     */
    $scope.switchStatus = function (paytype, operateType) {
        paytype && operateType || util.message("参数错误", "", "error");
        $scope.paysetting[paytype][operateType] = !$scope.paysetting[paytype][operateType];
        // 如果是货到付款、余额、混合、汇款支付则不能充值
        "delivery" != paytype && "credit" != paytype && "mix" != paytype && "line" != paytype || ($scope.paysetting[paytype].recharge_switch = false);
        $scope.saveEdit(paytype);
    };

    $scope.check_wechat = function () {
        if (a.account_level < 3 || void 0 != a.services && a.borrows.length < 1 && a.services.length < 1 && 4 != a.account_level || void 0 == a.services && a.borrows.length < 1 && 4 != a.account_level)
            return util.message("您没有有效的微信支付方式", "", "error"),
                false;
        $("#weixin").modal("show")
    };

    $(".modal").on("hide.bs.modal", function () {
        $http.post($scope.config.get_setting_url, {}).success(function (t) {
            $scope.paysetting = t.message.message
        })
    });

    $scope.test_alipay = function () {
        $http.post($scope.config.text_alipay_url, {
            param: $scope.paysetting.alipay
        }).success(function (e) {
            if (null !== e.message.message)
                return location.href = e.message.message,
                    false;
            alert("配置失败")
        })
    };

    $scope.changeSwitch = function (t, a) {
        $scope.paysetting[t].switch = a
    };

    $scope.changeVersion = function (t) {
        $scope.paysetting.wechat.version = t
    };

    $scope.tokenGen = function (t) {
        for (var a = "", n = 0; n < 32; n++)
            a += "abcdefghijklmnopqrstuvwxyz0123456789"[parseInt(32 * Math.random())];
        "wechat_facilitator.signkey" == t && ($scope.paysetting.wechat_facilitator.signkey = a),
        "wechat.apikey" == t && ($scope.paysetting.wechat.apikey = a)
    };
}
]).controller("creditCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.config = a;
    $scope.creditSetting = a.creditSetting;

    $scope.tactics = {
        activity: a.activity,
        currency: a.currency
    };
    $scope.creditTitle = "";
    $scope.activeCredit = "";
    $scope.activeTacticsType = "";
    $scope.enabledCredit = a.enabledCredit;
    $scope.activeTactics = "";
    $scope.syncSetting = a.syncSetting;

    $scope.changeEnabled = function (a) {
        void 0 == $scope.creditSetting[a] && ($scope.creditSetting[a] = {
            title: "",
            enabled: 0
        });
        $scope.creditSetting[a].enabled = 1 == $scope.creditSetting[a].enabled ? 0 : 1;
        $http.post($scope.config.saveCreditSetting, {
            credit_setting: $scope.creditSetting
        }).success(function (e) {
        });
    };

    $scope.editCreditTactics = function (t) {
        $("#tactics").modal("show");
        $scope.activeTacticsType = t;
        $scope.activeTactics = $scope.tactics[t];
    };

    $scope.editCreditName = function (t) {
        $scope.activeCredit = t;
        $("#credit-name").modal("show"),
        void 0 == $scope.creditSetting[t] && ($scope.creditSetting[t] = {
            title: "",
            enabled: 0
        });
        $scope.creditTitle = $scope.creditSetting[t].title;
    };

    $scope.setCreditName = function () {
        $scope.creditSetting[$scope.activeCredit].title = $scope.creditTitle;
        $http.post($scope.config.saveCreditSetting, {
            credit_setting: $scope.creditSetting
        }).success(function (e) {
        });
    };

    $scope.setCreditTactics = function () {
        $http.post($scope.config.saveTacticsSetting, {
            setting: $scope.tactics
        }).success(function (e) {
        });
    };
}
]).controller("syncCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.config = a,
        e.syncSetting = a.syncSetting,
        e.setSync = function () {
            e.syncSetting = 1 == e.syncSetting ? 0 : 1,
                t.post(e.config.saveSyncSetting, {
                    setting: e.syncSetting
                }).success(function (e) {
                })
        }
}
]).controller("ucCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.config = a;
    $scope.uc = a.uc;

    $("#submit").click(function () {
        var t = $("#textarea").val().split(";")
            , a = new Array;
        for (var n in t) {
            var i = t[n].indexOf("UC")
                , s = t[n].indexOf("', '")
                , o = t[n].indexOf("')")
                , r = t[n].substring(i, s)
                , l = t[n].substring(s + 4, o);
            a[r] = l
        }
        $scope.uc.connect = a.UC_CONNECT,
            $scope.uc.appid = a.UC_APPID,
            $scope.uc.key = a.UC_KEY,
            $scope.uc.charset = a.UC_CHARSET,
            $scope.uc.dbhost = a.UC_DBHOST,
            $scope.uc.dbuser = a.UC_DBUSER,
            $scope.uc.dbname = a.UC_DBNAME,
            $scope.uc.dbpw = a.UC_DBPW,
            $scope.uc.dbcharset = a.UC_DBCHARSET,
            $scope.uc.dbtablepre = a.UC_DBTABLEPRE,
            $scope.uc.dbconnect = a.UC_DBCONNECT,
            $scope.uc.api = a.UC_API,
            $scope.uc.ip = a.UC_IP,
            $scope.$digest()
    });

    $("#form1").submit(function () {
        if ("1" == $(':radio[name="status"]:checked').val()) {
            if ("" == $.trim($(':text[name="title"]').val()))
                return util.message("必须输入通行证名称.", "", "error"),
                    false;
            var e = parseInt($(':text[name="appid"]').val());
            if (isNaN(e))
                return util.message("必须输入UCenter应用的ID.", "", "error"),
                    false;
            if ("" == $.trim($(':text[name="key"]').val()))
                return util.message("必须输入与UCenter的通信密钥.", "", "error"),
                    false;
            if ("" == $.trim($(':text[name="charset"]').val()))
                return util.message("必须输入UCenter的字符集.", "", "error"),
                    false;
            if ("mysql" == $(':radio[name="connect"]:checked').val()) {
                if ("" == $.trim($(':text[name="dbhost"]').val()))
                    return util.message("必须输入UCenter数据库主机地址.", "", "error"),
                        false;
                if ("" == $.trim($(':text[name="dbuser"]').val()))
                    return util.message("必须输入UCenter数据库用户名.", "", "error"),
                        false;
                if ("" == $.trim($(':text[name="dbpw"]').val()))
                    return util.message("必须输入UCenter数据库密码.", "", "error"),
                        false;
                if ("" == $.trim($(':text[name="dbname"]').val()))
                    return util.message("必须输入UCenter数据库名称.", "", "error"),
                        false;
                if ("" == $.trim($(':text[name="dbcharset"]').val()))
                    return util.message("必须输入UCenter数据库字符集.", "", "error"),
                        false;
                if ("" == $.trim($(':text[name="dbtablepre"]').val()))
                    return util.message("必须输入UCenter数据表前缀.", "", "error"),
                        false
            } else if ("http" == $(':radio[name="connect"]:checked').val()) {
                if ("" == $.trim($(':text[name="api"]').val()))
                    return util.message("必须输入UCenter 服务端的URL地址.", "", "error"),
                        false;
                if ("" == $.trim($(':text[name="ip"]').val()))
                    return util.message("必须输入UCenter的IP.", "", "error"),
                        false
            }
        }
    })
}
]).controller("refundCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.setting = a.setting;
    $scope.wechat_refund = $scope.setting.wechat_refund;
    $scope.ali_refund = $scope.setting.ali_refund;

    $scope.change_switch = function (t, a) {
        "wechat_refund" == t && ($scope.wechat_refund.switch = a);
        "ali_refund" == t && ($scope.ali_refund.switch = a);
    };

    $("#key").change(function () {
        $scope.wechat_refund.key = $("#key").val();
        $scope.$apply();
    });

    $("#cert").change(function () {
        $scope.wechat_refund.cert = $("#cert").val();
        $scope.$apply();
    });

    $("#form_wechat").submit(function () {
        if (1 == $scope.wechat_refund.switch) {
            if ("" == $scope.wechat_refund.cert)
                return util.message("请上传apiclient_cert.pem证书"),
                    false;
            if ("" == $scope.wechat_refund.key)
                return util.message("请上传apiclient_key.pem证书"),
                    false
        }
    });

    $("#private_key").change(function () {
        $scope.ali_refund.private_key = $("#private_key").val();
        $scope.$apply();
    });

    $("#form_ali").submit(function () {
        if (1 == $scope.ali_refund.switch) {
            if ("" == $scope.ali_refund.app_id)
                return util.message("请填写app_id"),
                    false;
            if ("" == $scope.ali_refund.private_key)
                return util.message("请上传rsa_private_key.pem证书"),
                    false
        }
    });
}
]).controller("bindDomainCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.account = a.account;
    $scope.middleAccount = {
        bind_domain: ""
    };
    $scope.httpChange = function () {
        $http.post(a.links.post, {
            bind_domain: $scope.middleAccount.bind_domain,
            submit: true,
            token: a.token
        }).success(function (e) {
            0 == e.message.errno ? util.message("修改成功！", e.redirect, "success") : util.message(e.message.message)
        })
    }
}
]).controller("appModuleLinkUniacidCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.modules = a.modules;
    $scope.module = "";
    $scope.linkWxappAccounts = "";
    $scope.linkPcAccounts = "";
    $scope.selectedAccount = "";

    $scope.tabChange = function (t) {
        $scope.jurindex = t,
        1 != t || $scope.linkPcAccounts || $scope.searchLinkAccount($scope.module, "pc"),
        1 == $scope.jurindex && $("#account-wxapp .row").find(".item").removeClass("active"),
        0 == $scope.jurindex && $("#account-pc .row").find(".item").removeClass("active"),
            $scope.selectedAccount = ""
    };

    $scope.searchLinkAccount = function (n, i) {
        $scope.module = n,
            $("#show-account").modal("show"),
            "wxapp" == i ? ($scope.tabChange(0),
                $scope.loadingWxappData = true) : $scope.loadingPcData = true,
            $http.post(a.links.search_link_account, {
                module_name: n,
                type: "wxapp" == i ? a.wxapp : a.webapp
            }).success(function (t) {
                "wxapp" == i ? ($scope.loadingWxappData = false,
                    $scope.linkWxappAccounts = t.message.message,
                    $scope.linkPcAccounts = "") : ($scope.loadingPcData = false,
                    $scope.linkPcAccounts = t.message.message)
            })
    };

    $scope.selectLinkAccount = function (t, a) {
        $(a.target).parentsUntil(".col-sm-2").addClass("active"),
            $(a.target).parentsUntil(".col-sm-2").parent().siblings().find(".item").removeClass("active"),
            $scope.selectedAccount = t
    };

    $scope.module_unlink_uniacid = function (e) {
        $http.post(a.links.module_unlink_uniacid, {
            module_name: e
        }).success(function (e) {
            e.message.errno,
                util.message(e.message.message, e.redirect)
        })
    };

    $scope.moduleLinkUniacid = function () {
        $("#show-account").modal("hide"),
            $http.post(a.links.module_link_uniacid, {
                module_name: $scope.module,
                submit: "yes",
                token: a.token,
                uniacid: $scope.selectedAccount.uniacid
            }).success(function (e) {
                0 == e.message.errno ? util.message("关联成功", "refresh", "success") : util.message(e.message.message)
            });
        $scope.module = "";
    }
}
]);