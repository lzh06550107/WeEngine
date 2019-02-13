angular.module("accountApp", ["we7app", "infinite-scroll"]);

angular.module("accountApp").controller("AccountDisplay", ["$scope", "$http", "$timeout", "config", function ($scope, $http, a, config) {
    $scope.accountList = config.accountList;
    $scope.links = config.links;
    $scope.alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#", "全部"];
    $scope.activeLetter = "";
    $scope.searchShow = config.accountTotal > config.pagesize;

    $scope.searchModule = function (t) {
        $scope.activeLetter = t,
            a(function () {
                $(".button").click()
            }, 500)
    };

    $scope.stick = function (a) {
        var n = parseInt(a);
        $http.post($scope.links.rank, {
            id: n
        }).success(function (e) {
            0 == e.message.errno && location.reload()
        })
    };

    $scope.currentPage = 1;
    $scope.busy = false;

    $scope.loadMore = function () {
        if ($scope.busy)
            return false;
        $scope.currentPage++,
            $scope.busy = true,
            $http.post(config.scrollUrl, {
                page: $scope.currentPage,
                keyword: config.keyword,
                letter: config.letter
            }).success(function (t) {
                if ($scope.busy = false,
                0 == t.message.errno) {
                    $scope.searchShow = true,
                    0 == t.message.message.length && 2 == $scope.currentPage && ($scope.searchShow = false);
                    for (var a in t.message.message)
                        $scope.accountList.push(t.message.message[a])
                }
                $scope.busy = false
            })
    }
}
]);

angular.module("accountApp").controller("SystemAccountDisplay", ["$scope", "config", function ($scope, config) {
    $scope.lists = config.lists;
    $scope.links = config.links;
}
]);

angular.module("accountApp").controller("SystemAccountRecycle", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.del_accounts = a.del_accounts;
    $scope.links = a.links;

    $scope.delete = function (acid, uniacid) {
        if (!confirm("此为永久删除，删除后不可找回, 进入后台任务删除！确认吗？"))
            return false;
        $http.post(a.links.postDel, {
            acid: acid,
            uniacid: uniacid
        }).success(function (e) {
            0 == e.message.errno ? util.message(e.message.message, e.redirect, "success") : util.message(e.message.message, e.redirect, "error")
        })
    }
}
]);

angular.module("accountApp").controller("AccountPostStepOne", ["$scope", "config", function (scope, config) {
}
]);

angular.module("accountApp").controller("AccountPostStepTwo", ["$scope", "config", function (scope, config) {
    scope.account = {}; // 控制器实例化时初始化account模型对象
    scope.uploadMultiImage = function (attr) {
        require(["fileUploader"], function (fileuploader) {
            fileuploader.init(function (item) {
                scope.account[attr] = item.url;
                scope.$apply(scope.account) // 传播Model的变化
            }, {
                direct: true,
                multiple: false
            })
        })
    };

    scope.delMultiImage = function (attr) {
        scope.account[attr] = ""
    }
}
]);

angular.module("accountApp").controller("AccountPostStepThree", ["$scope", "$http", "config", "AccountAppCommon", function ($scope, $http, a, AccountAppCommon) {
    $scope.notify = a.notify;
    $scope.owner = a.owner;
    $scope.links = a.links;

    /**
     * 选择主管理员
     * @param $event
     */
    $scope.selectOwner = function ($event) {
        $event.preventDefault();
        AccountAppCommon.selectOwner();
    };

    /**
     * 修改管理员用户权限组
     */
    $scope.changeGroup = function () {
        if (!$('input[name="uid"]').val()) {
            $("#groupid").val(0);
            util.message("请先选择管理员");
            return false;
        }
        // 更新对应的套餐组
        AccountAppCommon.update_package_list($("#groupid").find("option:selected").data("package"))
    };

    $scope.changeText = function (e) {
        var t = $(e)[0].target.text;
        $(e)[0].target.text = "展开" == t ? "收起" : "展开"
    };

    $scope.addPermission = AccountAppCommon.addPermission
}
]);

angular.module("accountApp").controller("AccountPostStepFour", ["$scope", "config", "AccountAppCommon", function ($scope, config, a) {
    $scope.account = config.account;
    $scope.links = config.links;
    $scope.url = config.links.siteroot + "api.php?id=" + $scope.account.acid;

    $scope.success = function (e) {
        var e = parseInt(e),
            t = $('<span class="label label-success" style="position:absolute;z-index:10"><i class="fa fa-check-circle"></i> 复制成功</span>');
        a.copySuccess(e, t);
    }
}
]);

angular.module("accountApp").controller("AccountManageBase", ["$scope", "$http", "config", "AccountAppCommon", function ($scope, $http, a, AccountAppCommon) {
    $scope.account = a.account;
    $scope.uniaccount = a.uniaccount;
    $scope.authstate = a.authstate;
    $scope.authurl = a.authurl;
    $scope.founder = a.founder;
    $scope.owner = a.owner;
    $scope.other = {
        headimgsrc: a.headimgsrc,
        qrcodeimgsrc: a.qrcodeimgsrc,
        serviceUrl: a.links.siteroot + "api.php?id=" + $scope.account.acid,
        siteurl: a.links.siteroot
    };

    $scope.changeImage = function (field, uniacid) {
        if ("headimgsrc" == field || "qrcodeimgsrc" == field) {
            require(["fileUploader"], function (fileUploader) {
                fileUploader.init(function (a) {
                    $scope.other[field] = a.url;
                    $scope.$apply($scope.other);
                    $scope.httpChange(field);
                }, {
                    direct: true,
                    multiple: false,
                    uniacid: uniacid
                })
            });
        }
    };

    $scope.success = function (e) {
        var e = parseInt(e),
            t = $('<a href="javascript:;" class="btn btn-success btn-sm we7-margin-left-sm"><i class="fa fa-check-circle"></i> 复制成功</a>');
        AccountAppCommon.copySuccess(e, t);
    };

    $scope.editInfo = function (field, fieldVaule) {
        $scope.middleAccount = {};
        $scope.middleAccount[field] = fieldVaule
    };

    $scope.httpChange = function (field, s) {
        switch (field) {
            case "headimgsrc":
            case "qrcodeimgsrc":
                $http.post(a.links.basePost, {
                    type: field,
                    imgsrc: $scope.other[field]
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $(".wechat-img").attr("src", $scope.other[field]);
                        util.message("修改成功！", "", "success");
                    } else {
                        -1 == t.message.errno && util.message(t.message.message, t.redirect, "error");
                        1 == t.message.errno && util.message(t.message.message, "", "error");
                        40035 == t.message.errno && util.message(t.message.message, "", "error");
                    }
                });
                break;
            case "name":
            case "account":
            case "original":
            case "level":
            case "key":
            case "secret":
                $("#" + field).modal("hide");
                if (0 == $scope.middleAccount[field].length) {
                    util.message("不可为空！", "", "error");
                    return false;
                }
                $http.post(a.links.basePost, {
                    type: field,
                    request_data: $scope.middleAccount[field]
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.account[field] = $scope.middleAccount[field];
                        util.message("修改成功！", "", "success");
                    } else {
                        1 == t.message.errno && util.message(t.message.message, "", "error");
                        40035 == t.message.errno && util.message(t.message.message, "", "error");
                    }
                });
                break;
            case "jointype":
                $("#jointype").modal("hide");
                1 == $scope.middleAccount.type && $http.post(a.links.basePost, {
                    type: "jointype",
                    request_data: 1
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.account[field] = $scope.middleAccount[field];
                        $scope.account.type = 1;
                        util.message("修改成功！", "", "success");
                    } else {
                        1 == t.message.errno && util.message(t.message.message, "", "error");
                        40035 == t.message.errno && util.message(t.message.message, "", "error");
                    }
                });
                if (3 == $scope.middleAccount.type) {
                    if (1 == a.authurl.errno) {
                        util.message(a.authurl.url);
                    } else {
                        if (!confirm("必须通过公众号授权登录页面进行授权接入，是否跳转至授权页面...")) return false;
                        location.href = a.authurl.url;
                    }
                }
                break;
            case "token":
                $("#token").modal("hide");
                if (void 0 === s) {
                    if (!confirm("确定要生成新的吗？")) return false;
                    var o = AccountAppCommon.tokenGen();
                } else {
                    if (0 == (o = $("#newtoken").val()).length) {
                        util.message("不可为空！");
                        return false;
                    }
                    if (!(l = new RegExp(/^[A-Za-z0-9]{3,32}$/)).test(o)) {
                        util.message("必须为英文或者数字，长度为3到32个字符！");
                        return false;
                    }
                }
                $http.post(a.links.basePost, {
                    type: field,
                    request_data: o
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.account[field] = o;
                        util.message("修改成功！");
                    } else {
                        -1 == t.message.errno && util.message(t.message.message, t.redirect, "error");
                        1 == t.message.errno && util.message(t.message.message, "", "error");
                        40035 == t.message.errno && util.message(t.message.message, "", "error");
                    }
                });
                break;
            case "encodingaeskey":
                $("#encodingaeskey").modal("hide");
                if (void 0 === s) {
                    if (!confirm("确定要生成新的吗？")) return false;
                    var r = AccountAppCommon.encodingAESKeyGen();
                } else {
                    if (0 == (r = $("#newencodingaeskey").val()).length) {
                        util.message("不可为空！");
                        return false;
                    }
                    var l = new RegExp(/^[A-Za-z0-9]{43}$/);
                    if (!l.test(r)) {
                        util.message("必须为英文或者数字，长度为43个字符！");
                        return false;
                    }
                }
                $http.post(a.links.basePost, {
                    type: field,
                    request_data: r
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.account[field] = r;
                        util.message("修改成功！");
                    } else {
                        -1 == t.message.errno && util.message(t.message.message, t.redirect, "error");
                        1 == t.message.errno && util.message(t.message.message, "", "error");
                        40035 == t.message.errno && util.message(t.message.message, "", "error");
                    }
                });
                break;
            case "highest_visit":
                "number" == typeof $scope.middleAccount.highest_visit && $http.post(a.links.basePost, {
                    type: field,
                    request_data: $scope.middleAccount.highest_visit
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.account[field] = $scope.middleAccount.highest_visit;
                        util.message("修改成功！");
                    } else {
                        util.message(t.message.message, "", "error");
                    }
                });
                break;
            case "endtime":
                var c = $('[name="endtime"]').val();
                $http.post(a.links.basePost, {
                    type: "endtime",
                    endtype: $scope.middleAccount.endtype,
                    endtime: c
                }).success(function (t) {
                    if (1 == t.message.errno) {
                        util.message(t.message.message, "", "info");
                    } else {
                        $scope.account.endtype = $scope.middleAccount.endtype;
                        $scope.account.end = 2 == $scope.account.endtype ? c : "永久";
                        util.message("修改成功！")
                    }
                })
        }
    }
}
]);

angular.module("accountApp").controller("AccountMangeModulesTpl", ["$scope", "$http", "config", function ($scope, $http, a) {
    function n() {
        var t = "#content-templates";
        0 == $scope.jurindex && (t = "#content-modules");
        $("#jurisdiction-add " + t + " .item").size() != $("#jurisdiction-add " + t + " .item.active").size() ? $scope.allmodule = false : $scope.allmodule = true;
    }

    $scope.owner = a.owner;
    $scope.modules_tpl = a.modules_tpl;
    $scope.packagelist = a.packagelist;
    $scope.extend = a.extend;
    $scope.allmodule = false;
    $scope.jurindex = 0;

    $scope.changeText = function (e) {
        var t = $(e)[0].target.text;
        $(e)[0].target.text = "展开" == t ? "收起" : "展开"
    };

    $scope.changeGroup = function () {
        for (var e = $('input[name="package[]"]'), n = [], i = 0; i < e.length; i++)
            $(e[i]).is(":checked") && n.push($(e[i]).val());
        $http.post(a.links.postModulesTpl, {
            type: "group",
            groupdata: n
        }).success(function (e) {
            0 == e.message.errno ? location.reload() : 40035 == e.message.errno && util.message("参数错误！")
        })
    };

    $scope.tabChange = function (index) {
        $scope.jurindex = index;
        n();
    };

    $scope.itemclick = function () {
        n();
    };

    $scope.allmodulechange = function (allmodule) {
        var a = "#content-templates";
        0 == $scope.jurindex && (a = "#content-modules");
        allmodule ? $("#jurisdiction-add " + a + " .item").addClass("active") : $("#jurisdiction-add " + a + " .item").removeClass("active");
    };

    $scope.addExtend = function () {
        var e = ""
            , n = ""
            , i = []
            , s = [];
        $("#jurisdiction-add #content-modules").find(".active").each(function () {
            e += '<div class="col-sm-3 text-left we7-margin-bottom"><a href="javascript:;" class="label label-info">' + $(this).attr("data-title") + "</a></div>";
            i.push($(this).attr("data-name"));
        });
        $("#jurisdiction-add #content-templates").find(".active").each(function () {
            n += '<div class="col-sm-3 text-left we7-margin-bottom"><a href="javascript:;" class="label label-info">' + $(this).attr("data-title") + "</a></div>";
            s.push($(this).attr("data-id"));
        });
        e || n ? $(".account-package-extra").show() : $(".account-package-extra").hide();
        $(".account-package-extra .js-extra-modules").append(e);
        $(".account-package-extra .js-extra-templates").append(n);
        $("#jurisdiction-add").modal("hide");
        $http.post(a.links.postModulesTpl, {
            type: "extend",
            module: i,
            tpl: s
        }).success(function (e) {
            0 == e.message.errno ? location.reload() : 40035 == e.message.errno && util.message("参数错误！");
        })
    };

    $scope.editEndTime = function (expire_time, order_id) {
        $scope.middleTime = expire_time;
        $scope.middleGoodsId = parseInt(order_id);
        $("#endtime").modal("show");
        $('input[name="endtime"]').val(expire_time);
    };

    $scope.httpChange = function () {
        var n = $('input[name="endtime"]').val();
        $http.post(a.links.postModulesTpl, {
            type: "store_endtime",
            new_time: n,
            order_id: $scope.middleGoodsId
        }).success(function (e) {
            0 == e.message.errno && util.message(e.message.message, e.redirect);
        })
    }
}
]);

angular.module("accountApp").controller("AccountManageUsers", ["$scope", "$http", "config", function (scope, http, config) {
    scope.permissions = config.permissions;
    scope.state = config.state;

    scope.setPermission = function (uid) {
        var e = parseInt(uid);
        location.href = config.links.setPermission + "&uid=" + e;
    };

    scope.delPermission = function (uid) {
        var e = parseInt(uid);
        if (!confirm("确认删除当前选择的用户?"))
            return false;
        http.post(config.links.delete, {
            uid: e
        }).success(function (e) {
            util.message(e.message, e.redirect);
        });
    };

    scope.addOwner = function () {
        $("#owner-modal").modal("hide");
        var username = $.trim($("#add-owner-username").val());
        scope.requestPost(3, username);
    };

    /**
     * 添加副创始人
     */
    scope.addViceFounder = function () {
        $("#user-vice-modal").modal("hide");
        var username = $.trim($("#add-vice-username").val());
        scope.requestPost(4, username);
    };

    scope.changeOwner = function (username) {
        $("#owner-modal").modal("show");
        $("#add-owner-username").val(username);
    };

    scope.changeVice = function (username) {
        $("#user-vice-modal").modal("show");
        $("#add-vice-username").val(username);
    };

    scope.addUsername = function () {
        $("#user-modal").modal("hide");
        var username = $.trim($("#add-username").val());
        addtype = $(".addtype2").is(":checked");  // 管理员还是操作员
        scope.requestPost(addtype ? 2 : 1, username);
    };

    scope.requestPost = function (addtype, username) {
        if (!username) {
            util.message("请输入用户名.");
            return false;
        }
        var type = parseInt(addtype);
        http.post(config.links.addUser, {
            username: username,
            addtype: type,
            account_type: config.accountType
        }).success(function (e) {
            if (0 == e.message.errno) {
                location.reload();
            } else {
                -1 == e.message.errno && util.message("用户/创始人不存在或已被删除！");
                1 == e.message.errno && util.message("添加失败，请稍候重试！");
                2 == e.message.errno && util.message(username + "已经是该公众号的操作员或管理员，请勿重复添加！");
                3 == e.message.errno && util.message("用户未通过审核，请联系网站管理员审核通过后再行添加！");
                4 == e.message.errno && util.message("管理员不可操作其他管理员！");
                5 != e.message.errno && 6 != e.message.errno || util.message(e.message.message);
            }
        });
    };
}
]);

angular.module("accountApp").controller("AccountManageSms", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.notify = a.notify;
    $scope.signatures = a.signatures;

    $scope.editSms = function (field, fieldVaule) {
        $scope.middleSms = {};
        $scope.middleSms[field] = fieldVaule;
    };

    $scope.httpChange = function (field) {
        switch (field) {
            case "balance":
                $("#balance").modal("hide");
                $http.post(a.links.postSms, {
                    type: field,
                    balance: $scope.middleSms[field]
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.notify.sms[field] = t.message.message.num;
                        util.message("修改成功！");
                    } else {
                        -1 == t.message.errno && util.message("您现有短信数量为0，请联系服务商购买短信!");
                        1 == t.message.errno && util.message("修改失败！请稍候重试！");
                    }
                });
                break;
            case "signature":
                $("#signature").modal("hide");
                $http.post(a.links.postSms, {
                    type: field,
                    signature: $scope.middleSms[field]
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.notify.sms[field] = $scope.middleSms[field];
                        util.message("设置成功！");
                    } else {
                        40035 == t.message.errno && util.message("参数错误！");
                        1 == t.message.errno && util.message("修改失败！请稍候重试！");
                    }
                })
        }
    }
}
]);

angular.module("accountApp").controller("SystemPlatform", ["$scope", "$http", "config", "AccountAppCommon", function ($scope, $http, a, AccountAppCommon) {
    $scope.platform = a.platform;
    $scope.url = a.url;

    $scope.success = function (id) {
        var domId = parseInt(id),
            t = $('<span class="label label-success" style="btn btn-success we7-margin-left-sm"><i class="fa fa-check-circle"></i> 复制成功</span>');
        AccountAppCommon.copySuccess(domId, t);
    };

    $scope.httpChange = function (field, s) {
        switch (field) {
            case "authstate":
                var authstate = 1 == $scope.platform.authstate ? 0 : 1;
                $http.post(a.links.platformPost, {
                    authstate: authstate
                }).success(function (t) {
                    0 == t.message.errno ? ($scope.platform.authstate = authstate,
                        util.message("修改成功！", "", "success")) : 1 == t.message.errno && util.message("修改失败，请稍后重试！")
                });
                break;
            case "appid":
                $("#AppID").modal("hide");
                var r = $("#newappid").val();
                $http.post(a.links.platformPost, {
                    appid: r
                }).success(function (t) {
                    0 == t.message.errno ? ($scope.platform.appid = r,
                        util.message("修改成功！")) : 1 == t.message.errno && util.message("修改失败，请稍后重试！")
                });
                break;
            case "appsecret":
                $("#AppSecret").modal("hide");
                var l = $("#newappsecret").val();
                $http.post(a.links.platformPost, {
                    appsecret: l
                }).success(function (t) {
                    0 == t.message.errno ? ($scope.platform.appsecret = l,
                        util.message("修改成功！")) : 1 == t.message.errno && util.message("修改失败，请稍后重试！")
                });
                break;
            case "token":
                if (void 0 === s) {
                    if (!confirm("确定要生成新的吗？"))
                        return false;
                    var c = AccountAppCommon.tokenGen()
                } else {
                    if (0 == (c = $("#newtoken").val()).length)
                        return util.message("不可为空！"),
                            false;
                    if (!(d = new RegExp(/^[A-Za-z0-9]{3,32}$/)).test(c))
                        return util.message("必须为英文或者数字，长度为3到32个字符！"),
                            false
                }
                $http.post(a.links.platformPost, {
                    token: c
                }).success(function (t) {
                    0 == t.message.errno ? ($scope.platform.token = c,
                        util.message("修改成功！")) : 1 == t.message.errno && util.message("修改失败，请稍后重试！")
                });
                break;
            case "encodingaeskey":
                if (void 0 === s) {
                    if (!confirm("确定要生成新的吗？"))
                        return false;
                    var u = AccountAppCommon.encodingAESKeyGen();
                } else {
                    if (0 == (u = $("#newencodingaeskey").val()).length) {
                        util.message("不可为空！");
                        return false;
                    }
                    var d = new RegExp(/^[A-Za-z0-9]{43}$/);
                    if (!d.test(u)) {
                        util.message("必须为英文或者数字，长度为43个字符！");
                        return false;
                    }
                }
                $http.post(a.links.platformPost, {
                    encodingaeskey: u
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.platform.encodingaeskey = u;
                        util.message("修改成功！");
                    } else {
                        1 == t.message.errno && util.message("修改失败，请稍后重试！");
                    }
                })
        }
    }
}
]);

angular.module("accountApp").controller("AccountManageWxappCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.wxapp_modules = a.wxapp_modules;
    $scope.current_module_info = a.current_module_info;

    $scope.showWxModules = function () {
        $("#module_wxapp").modal("show")
    };

    $scope.selectedWxModule = function (t, a) {
        var n = $(a.target).parents(".select-module-wxapp");
        n.find("span").removeClass("hide"),
            n.siblings().find("span").addClass("hide"),
            $scope.newWxModule = t
    };

    $scope.addWxModules = function () {
        $http.post(a.links.editmodule, {
            module: $scope.newWxModule,
            account_type: 4
        }).success(function (e) {
            $("#module_wxapp").modal("hide"),
                0 == e.message.errno ? location.reload() : util.message(e.message.message)
        })
    };

    $scope.delWxModule = function () {
        $http.post(a.links.delmodule, {
            module: $scope.current_module_info,
            account_type: 4
        }).success(function (e) {
            0 == e.message.errno ? location.reload() : util.message(e.message.message)
        })
    };
}
]);

angular.module("accountApp").service("AccountAppCommon", ["$rootScope", "$http", "config", function ($rootScope, $http, a) {
    var AccountAppCommon = {};

    /**
     * 给统一帐号添加模块和模板权限
     */
    AccountAppCommon.addPermission = function () {
        var e = ""
            , t = "";
        // 给表单添加字段
        $("#jurisdiction-add #content-modules").find(".btn-primary").each(function () {
            e += '<span class="label label-info" style="margin-right:3px;">' + $(this).attr("data-title") + '</span><input type="hidden" name="extra[modules][]" value="' + $(this).attr("data-name") + '" />'
        });
        $("#jurisdiction-add #content-templates").find(".btn-primary").each(function () {
            t += '<span class="label label-info" style="margin-right:3px;">' + $(this).attr("data-title") + '</span><input type="hidden" name="extra[templates][]" value="' + $(this).attr("data-name") + '" />'
        });
        e || t ? $(".account-package-extra").show() : $(".account-package-extra").hide();
        $(".account-package-extra .js-extra-modules").html(e);
        $(".account-package-extra .js-extra-templates").html(t);
        $("#jurisdiction-add").modal("hide");
    };

    AccountAppCommon.update_package_list = function (packages) {
        $('input[name="package[]"]').prop("checked", false);
        $('input[name="package[]"]').prop("disabled", false);
        for (i in packages) {
            $('input[name="package[]"][value="' + packages[i] + '"]').prop("checked", true);
            $('input[name="package[]"][value="' + packages[i] + '"]').prop("disabled", true); // 不能修改
        }
    };

    AccountAppCommon.selectOwner = function () {
        var uids = [];
        require(["biz"], function (biz) {
            biz.user.browser(uids, function (uid) {
                $http.post(a.links.userinfo, {
                    uid: uid
                }).success(function (response) {
                    response.message.errno && util.message(response.message.message);
                    $("#manager").val(response.message.message.uid);
                    $("#showname").val(response.message.message.username);
                    $("#groupid").val(response.message.message.group.id); //设置用户组id
                    $(".account-package-extra").show();
                    AccountAppCommon.update_package_list(response.message.message.package); // 更新用户组具有的套餐
                })
            }, {
                mode: "invisible",
                direct: true
            })
        })
    };

    AccountAppCommon.copySuccess = function (id, html) {
        var e = parseInt(id)
            , t = html
            , a = $("#copy-" + e).next().html();

        if (!a || a.indexOf('<span class="label label-success" style="position:absolute;z-index:10"><i class="fa fa-check-circle"></i> 复制成功</span>') < 0) {
            $("#copy-" + e).after(t);
        }
        setTimeout(function () {
            t.remove()
        }, 2e3);
    };

    AccountAppCommon.tokenGen = function () {
        for (var e = "", t = 0; t < 32; t++)
            e += "abcdefghijklmnopqrstuvwxyz0123456789"[parseInt(32 * Math.random())];
        return e;
    };

    AccountAppCommon.encodingAESKeyGen = function () {
        for (var e = "", t = 0; t < 43; t++)
            e += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[parseInt(61 * Math.random() + 1)];
        return e;
    };

    return AccountAppCommon;
}
]);