angular.module("wxApp", ["we7app"]);

angular.module("wxApp").controller("MainCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {

    function n() {
        var a = [];
        angular.forEach($scope.wxappinfo.choose.modules, function (e) {
            a.push(e.name)
        });
        a = a.join(",");
        $http.post(bindingsUrl, {
            modules: a
        }).then(function (t) {
            if ("0" == t.data.message.errno) {
                var a = t.data.message.message
                    , n = [];
                angular.forEach(a, function (e) {
                    e.module = e.name;
                    for (var t = 0; t < e.bindings.length; t++)
                        e.bindings[t].modulename = e.title,
                            n.push(e.bindings[t])
                }),
                    $scope.module_bindings = n,
                    $scope.wxappinfo.choose.modules = a
            }
        })
    }

    $scope.module_bindings = [];
    $scope.create_type = a.create_type;
    $scope.wxappinfo = {
        name: a.wxappinfo.name,
        version: "",
        choose: {
            modules: [],
            template: 1
        },
        quickmenu: {
            show: true,
            bottom: {
                bgcolor: "#bebebe",
                boundary: "#fff",
                selectedColor: "#0f0",
                color: "#428bca"
            },
            menus: [{
                name: "首页",
                defaultImage: "./resource/images/bottom-default.png",
                selectedImage: "./resource/images/bottom-default.png",
                module: {}
            }, {
                name: "首页",
                defaultImage: "./resource/images/bottom-default.png",
                selectedImage: "./resource/images/bottom-default.png",
                module: {}
            }]
        },
        submit: "yes",
        token: a.token,
        uniacid: a.uniacid,
        modules: []
    };
    $scope.apps = [];
    $scope.createStep = 1;
    $scope.version = a.version;
    $scope.isMuti = 2 == a.create_type;
    $scope.mtype = 0 == a.create_type ? 1 : 2;
    $scope.designMethod = a.designMethod;

    if (a.isedit) {
        $scope.wxappinfo.choose.modules = a.wxappinfo.modules;
        $scope.wxappinfo.quickmenu = a.wxappinfo.quickmenu;
        $scope.wxappinfo.version = a.wxappinfo.version;
        $scope.wxappinfo.description = a.wxappinfo.description;
    }

    var bindingsUrl = a.bindingsUrl;
    $scope.moduleEntries = [];

    $scope.prevStep = function () {
        $scope.createStep <= 1 ? $scope.createStep = 1 : $scope.createStep -= 1,
        3 == $scope.createStep && 3 == $scope.designMethod && ($scope.isMuti || ($scope.createStep = 1))
    };

    $scope.nextStep = function () {
        if ($scope.createStep > 4) {
            $scope.createStep = 4
        } else {
            $scope.checkComplete() && ($scope.createStep += 1)
        }

        if (2 == $scope.createStep && 3 == $scope.designMethod) {
            if ($scope.isMuti) {
                n();
                $scope.createStep = 3;
            } else {
                $scope.createStep = 4;
            }
        }
    };

    $scope.backToStep = function (t) {
        var a = parseInt(t);
        a < $scope.createStep && (a <= 2 && ($scope.type = 0),
            $scope.createStep = a)
    };

    $scope.selectType = function (t) {
        $scope.type = parseInt(t),
            $(':hidden[name="type"]').val(t)
    };

    $scope.changeType = function (t) {
        $scope.type = parseInt(t),
            $(':hidden[name="type"]').val(t)
    };

    $scope.searchTpl = function () {
        var e = $(':text[id="searchtpl"]').val();
        "默认模版".match(e) ? ($(':hidden[name="template"]').val(1),
            $(".select-tem-list > ul").show()) : ($(':hidden[name="template"]').val(""),
            $(".select-tem-list > ul").hide())
    };

    $scope.selectTpl = function (t) {
        $scope.wxappinfo.choose.template = t
    };

    $scope.getModuleEntries = function () {
        if (0 == $scope.moduleEntries.length && $scope.wxappinfo.choose.modules)
            for (i in $scope.wxappinfo.choose.modules)
                if ($scope.wxappinfo.choose.modules[i].bindings)
                    for (j in $scope.wxappinfo.choose.modules[i].bindings)
                        $scope.moduleEntries.push({
                            title: $scope.wxappinfo.choose.modules[i].bindings[j].title,
                            url: $scope.wxappinfo.choose.modules[i].bindings[j].do,
                            module: $scope.wxappinfo.choose.modules[i].title
                        })
    };

    $scope.showMenu = function () {
        $scope.wxappinfo.quickmenu.show = !$scope.wxappinfo.quickmenu.show
    };

    $scope.addMenu = function () {
        if ($scope.wxappinfo.quickmenu.menus.length >= 5)
            return false;
        $scope.wxappinfo.quickmenu.menus.push({
            name: "首页",
            defaultImage: "./resource/images/bottom-default.png",
            selectedImage: "./resource/images/bottom-default.png",
            module: {}
        })
    };

    $scope.delMenu = function (t) {
        $scope.wxappinfo.quickmenu.menus = _.without($scope.wxappinfo.quickmenu.menus, $scope.wxappinfo.quickmenu.menus[t])
    };

    $scope.addDefaultImg = function (t) {
        require(["fileUploader"], function (a) {
            a.show(function (a) {
                $scope.wxappinfo.quickmenu.menus[t].defaultImage = a.url,
                    $scope.$apply($scope.wxappinfo)
            }, {
                direct: true,
                multiple: false
            })
        })
    };

    $scope.addSelectedImg = function (t) {
        require(["fileUploader"], function (a) {
            a.show(function (a) {
                $scope.wxappinfo.quickmenu.menus[t].selectedImage = a.url,
                    $scope.$apply($scope.wxappinfo)
            }, {
                direct: true,
                multiple: false
            })
        })
    };

    $scope.addModuleImage = function (t) {
        require(["fileUploader"], function (a) {
            a.show(function (a) {
                t.newicon = a.url,
                    $scope.$apply($scope.wxappinfo)
            }, {
                direct: true,
                multiple: false
            })
        })
    };

    $scope.checkComplete = function () {
        $scope.createStep;
        if (!$scope.wxappinfo.uniacid) {
            if (!$scope.wxappinfo.name)
                return util.message("小程序名称不可为空！"),
                    false;
            if (!$scope.wxappinfo.account)
                return util.message("小程序账号不可为空！"),
                    false;
            if (!$scope.wxappinfo.original)
                return util.message("原始ID不可为空！"),
                    false;
            if (!$scope.wxappinfo.appid)
                return util.message("AppId不可为空！"),
                    false;
            if (!$scope.wxappinfo.appsecret)
                return util.message("AppSecret不可为空！"),
                    false
        }
        return $scope.wxappinfo.description ? !(!$scope.wxappinfo.version || !/^[0-9]{1,2}\.[0-9]{1,2}(\.[0-9]{1,2})?$/.test($scope.wxappinfo.version)) || (util.message("版本号错误，只能是数字、点，数字最多2位，例如 1.1.1 或1.2"),
            false) : (util.message("请填写描述"),
            false)
    };

    $scope.wxapp_module_select = function (t, a) {
        angular.isArray(a) || (a = [a]),
            $scope.wxappinfo.choose.modules = a,
            angular.forEach($scope.wxappinfo.choose.modules, function (e, t, a) {
                e.module = e.name
            }),
            $scope.$apply()
    };

    $scope.package = function (n) {
        if (!(0 == $scope.wxappinfo.choose.modules.length && !confirm("添加小程序模块应用后才可进行打包操作，是否继续仅保存？"))) {
            $http.post(a.wxappPostUrl, $scope.wxappinfo).success(function (e) {
                e.message.errno ? util.message(e.message.message, "", "error") : util.message(e.message.message, e.redirect, "success")
            });
            return false;
        }
    };

    $("#resource_module").unbind("click").click(function () {
        require(["fileUploader"], function (t) {
            t.show(function (t) {
                $scope.wxapp_module_select("module", t)
            }, {
                direct: true,
                multiple: $scope.isMuti,
                isWechat: false,
                type: "module",
                others: {
                    user_module: 2,
                    mtype: $scope.mtype
                }
            })
        })
    })
}
]);

angular.module("wxApp").controller("WxappEditCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.uniacid = a.uniacid,
        e.multiid = a.multiid,
        e.success_url = a.success_url,
        e.account_list = [],
        e.current_module = "",
        e.category = {
            id: "",
            name: "",
            displayorder: "",
            linkurl: ""
        },
        e.wxapp = a.wxapp,
        e.slideedit = function (t) {
            e.wxapp = "slideedit",
                e.slideid = t
        }
        ,
        e.navedit = function (t) {
            e.wxapp = "navedit",
                e.navid = t
        }
        ,
        e.recommendedit = function (t, a) {
            e.wxapp = "recommendedit",
                e.recommendid = t,
                e.recommendpid = a
        }
        ,
        e.showAccount = function (n) {
            e.account_list = "",
                t.post(a.links.accountList, {
                    module: n
                }).success(function (t) {
                    e.account_list = t.message.message,
                        e.current_module = n,
                        console.dir(t)
                }),
                $("#show_account").modal("show")
        }
        ,
        e.selectAccount = function (e, n) {
            var i = window.location.href;
            t.post(a.links.saveConnection, {
                module: e,
                uniacid: n
            }).success(function (t) {
                0 == t.message.errno ? ($(".js-connection-img-" + e).attr("src", t.message.message.thumb),
                    $(".js-connection-name-" + e).text(t.message.message.name),
                    util.message("修改成功", i, "success")) : util.message(t.message.message, "", "error"),
                    $("#show_account").modal("hide")
            })
        }
        ,
        e.categoryedit = function (t, a) {
            e.wxapp = "categoryedit",
                e.categoryeditid = t,
                e.categoryparentid = a
        }
        ,
        e.get_categorys = function () {
            t.post(a.links.getCategorys, {
                uniacid: e.uniacid,
                multiid: e.multiid
            }).success(function (t) {
                e.categorys = t.message.message
            })
        }
        ,
        e.get_categorys(),
        e.edit_category = function () {
            e.categorys.push({
                name: "",
                displayorder: "",
                linkurl: ""
            })
        }
        ,
        e.del_category = function (n) {
            void 0 != e.categorys[n].id ? (t.post(a.links.delCategory, {
                id: e.categorys[n].id
            }).success(function () {
            }),
                e.get_categorys()) : e.categorys.splice(n, 1)
        }
        ,
        e.save_category = function () {
            if (e.name_exist = false,
                angular.forEach(e.categorys, function (t) {
                    "" == t.name && (util.message("请填写类名"),
                        e.name_exist = true)
                }),
            1 == e.name_exist)
                return false;
            t.post(a.links.saveCategory, {
                post: e.categorys,
                uniacid: uniacid,
                multiid: a.multiid
            }).success(function (e) {
            }),
                e.get_categorys(),
                $("#myModal").modal("hide")
        }
}
]);

angular.module("wxApp").controller("AccountManageWxappCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.wxapp_version_lists = a.wxapp_version_lists;
    $scope.wxapp_modules = a.wxapp_modules;
    $scope.version_exist = a.version_exist;
    $scope.activeVersion = {};

    $scope.showEditVersionInfoModal = function (version) {
        $("#modal_edit_versioninfo").modal("show");
        $scope.activeVersion = version || {};
        $scope.middleVersion = angular.copy($scope.activeVersion);
        !_.isEmpty($scope.activeVersion) && _.isEmpty($scope.activeVersion.modules) && $(".wxapp-module-list .add").css("display", "");
    };

    $scope.showEditModuleModal = function () {
        $("#modal_edit_module").modal("show");
        $scope.newWxModule = {};
    };

    $scope.selectedWxModule = function (t, a) {
        var n = $(a.target).parents(".select-module-wxapp");
        n.find("span").removeClass("hide"),
            n.siblings().find("span").addClass("hide"),
            $scope.newWxModule = t
    };

    $scope.changeWxModules = function () {
        $scope.newWxModule || util.message("请选择一个应用模块！"),
            $scope.activeVersion.modules && 3 != $scope.activeVersion.design_method ? _.indexOf($scope.activeVersion.modules, $scope.newWxModule) > -1 ? util.message("该应用模块已存在！") : $scope.activeVersion.modules.push($scope.newWxModule) : ($scope.activeVersion.modules = [$scope.newWxModule],
                $(".wxapp-module-list .add").css("display", "none")),
            $("#modal_edit_module").modal("hide")
    };

    $scope.editVersionInfo = function () {
        if (_.isEmpty($scope.activeVersion.modules))
            return util.message("应用模块不可为空！"),
                false;
        $http.post(a.links.edit_version, {
            version_info: $scope.activeVersion
        }).success(function (e) {
            $("#modal_edit_versioninfo").modal("hide"),
                0 == e.message.errno ? util.message(e.message.message, e.redirect, "success") : util.message(e.message.message)
        })
    };

    $scope.cancelVersionInfo = function () {
        $scope.middleVersion.modules ? $scope.activeVersion.modules = $scope.middleVersion.modules : $scope.activeVersion.modules = []
    };

    $scope.delWxappVersion = function (e) {
        var e = parseInt(e);
        $http.post(a.links.del_version, {
            versionid: e
        }).success(function (e) {
            0 == e.message.errno ? util.message(e.message.message, e.redirect, "success") : util.message(e.message.message)
        })
    };

    $scope.delModule = function (module) {
        var a = _.indexOf($scope.activeVersion.modules, module);
        a > -1 && ($scope.activeVersion.modules = _.without($scope.activeVersion.modules, $scope.activeVersion.modules[a]));
        _.isEmpty($scope.activeVersion.modules) && $(".wxapp-module-list .add").css("display", "");
    }
}
]);

angular.module("wxApp").controller("PaymentCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.config = a;
    $scope.paysetting = a.paysetting;

    $scope.saveEdit = function (a) {
        if ("wechat" == a) {
            if ("" == $scope.paysetting.wechat.mchid)
                return util.message("请填写商户号", "", "info"),
                    false;
            if ("" == $scope.paysetting.wechat.signkey)
                return util.message("请填写支付秘钥", "", "info"),
                    false
        }
        $http.post($scope.config.saveurl, {
            type: a,
            param: $scope.paysetting[a]
        }).success(function (e) {
            if (0 != e.message.errno)
                return util.message(e.message.message, "", "info"),
                    false;
            $(".modal").modal("hide"),
                util.message(e.message.message, e.redirect, "success")
        })
    };

    $(".modal").on("hide.bs.modal", function () {
        $http.post($scope.config.get_setting_url, {}).success(function (t) {
            $scope.paysetting = t.message.message;
        })
    });

    $scope.tokenGen = function (t) {
        for (var a = "", n = 0; n < 32; n++)
            a += "abcdefghijklmnopqrstuvwxyz0123456789"[parseInt(32 * Math.random())];
        "wechat.signkey" == t && ($scope.paysetting.wechat.signkey = a);
    }
}
]);

angular.module("wxApp").controller("AccountDisplayWxappCtrl", ["$scope", "$http", "$timeout", "config", function ($scope, $http, a, config) {
    $scope.wxapp_lists = config.wxapp_lists;
    $scope.links = config.links;
    $scope.alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#", "全部"];
    $scope.activeLetter = config.activeLetter;

    $scope.showVersions = function ($event) {
        var t = $($event.target).parents(".mask").next(".cut-select");

        if ("none" == t.css("display")) {
            t.css("display", "block");
            t.parent(".wxapp-list-item").siblings().find(".cut-select").css("display", "none");
        } else {
            t.css("display", "none");
        }
    };

    $scope.hideSelect = function ($event) {
        $($event.target).css("display", "none");
    };

    $scope.searchModule = function (letter) {
        $scope.activeLetter = letter;
        a(function () {
            $(".button").click()
        }, 500);
    }
}
]);

angular.module("wxApp").controller("WxappWelcomeCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.notices = a.notices;
    $scope.loaderror = 0;
    $scope.last_modules = null;
    $scope.daily_visittrend = [];

    $http({
        method: "POST",
        url: "./index.php?c=wxapp&a=version&do=get_daily_visittrend"
    }).success(function (t) {
        0 == t.message.errno && ($scope.daily_visittrend = t.message.message);
    });

    $scope.get_last_modules = function () {
        $http.post("./index.php?c=home&a=welcome&do=get_last_modules").success(function (t) {
            if (0 == t.message.errno) {
                var a = [];
                angular.forEach(t.message.message, function (e, t) {
                    e.wxapp && a.push(e)
                });
                $scope.last_modules = a
            } else
                $scope.last_modules = null;
            $scope.loaderror = 1;
        })
    };
    $scope.get_last_modules()
}
]);

angular.module("wxApp").controller("moduleLinkUniacidCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.versionInfo = a.version_info;
    $scope.module = "";
    $scope.linkWebappAccounts = "";
    $scope.linkAppAccounts = "";
    $scope.selectedAccount = "";

    $scope.tabChange = function (index) {
        $scope.jurindex = index;
        1 != index || $scope.linkAppAccounts || $scope.searchLinkAccount($scope.module, "app");
        1 == $scope.jurindex && $("#account-app .row").find(".item").removeClass("active");
        0 == $scope.jurindex && $("#account-webapp .row").find(".item").removeClass("active");
        $scope.selectedAccount = "";
    };

    $scope.searchLinkAccount = function (name, type) {
        $scope.module = name;
        $("#show-account").modal("show");
        if ("webapp" == type) {
            $scope.tabChange(0);
            $scope.loadingWebappData = true;
        } else {
            $scope.loadingAppData = true;
        }

        $http.post(a.links.search_link_account, {
            module_name: name,
            type: "webapp" == type ? a.webapp : a.app
        }).success(function (t) {

            if ("webapp" == type) {
                $scope.loadingWebappData = false;
                $scope.linkWebappAccounts = t.message.message;
                $scope.linkAppAccounts = "";
            } else {
                $scope.loadingAppData = false;
                $scope.linkAppAccounts = t.message.message;
            }
        })
    };

    $scope.selectLinkAccount = function (account, $event) {
        $($event.target).parentsUntil(".col-sm-2").addClass("active");
        $($event.target).parentsUntil(".col-sm-2").parent().siblings().find(".item").removeClass("active");
        $scope.selectedAccount = account;
    };

    $scope.module_unlink_uniacid = function () {
        $http.post(a.links.module_unlink_uniacid, {
            version_id: $scope.versionInfo.id
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
                uniacid: $scope.selectedAccount.uniacid,
                version_id: $scope.versionInfo.id
            }).success(function (e) {
                0 == e.message.errno ? util.message("关联成功", "refresh", "success") : util.message(e.message.message)
            }),
            $scope.module = ""
    };
}
]);

angular.module("wxApp").controller("WxappEntranceCtrl", ["$scope", "$http", "serviceCommon", "config", function ($scope, $http, serviceCommon, config) {
    $scope.moduleList = config.moduleList;
    $scope.success = function (e) {
        var e = parseInt(e),
            t = $('<span class="label label-success" style="position:absolute;z-index:10;width:90px;height:34px;line-height:28px;"><i class="fa fa-check-circle"></i> 复制成功</span>');
        serviceCommon.copySuccess(e, t);
    }
}
]);

angular.module("wxApp").directive("we7ChooseMore", ["$http", function (e) {
    return {
        restrict: "EA",
        templateUrl: "directive-selectmore-module-item.html",
        scope: {
            selectModules: "=we7Modules",
            selectSingle: "=we7ChooseSingle"
        },
        link: function (t) {
            t.selectMore = function () {
                t.wxappModuleList && 0 != t.wxappModuleList.length ? $("#modules-Modal").modal("show") : e({
                    method: "POST",
                    url: "./index.php?c=wxapp&a=post&do=get_wxapp_modules",
                    cache: true
                }).success(function (e, a) {
                    t.wxappModuleList = e.message.message,
                        $("#modules-Modal").modal("show")
                })
            }
                ,
                t.selectModule = function (e) {
                    if (t.selectSingle)
                        return t.selectModules = [],
                            t.selectModules.push({
                                title: e.title,
                                module: e.name,
                                icon: e.logo,
                                version: e.version,
                                bindings: e.bindings
                            }),
                            $("#modules-Modal").modal("hide"),
                            $(".app-list .select-more").css("display", "none"),
                            false;
                    t.selectModules.push({
                        title: e.title,
                        module: e.name,
                        icon: e.logo,
                        version: e.version,
                        bindings: e.bindings
                    }),
                        $("#modules-Modal").modal("hide")
                }
                ,
                t.delModule = function (e) {
                    _.indexOf(t.selectModules, e) > -1 && (t.selectModules = _.without(t.selectModules, e)),
                    _.isEmpty(t.selectModules) && $(".app-list .select-more").css("display", "")
                }
        }
    }
}
]);

angular.module("wxApp").service("serviceCommon", ["$rootScope", function (e) {
    var t = {};
    return t.copySuccess = function (e, t) {
        var e = parseInt(e)
            , t = t
            , a = $("#copy-" + e).next().html();
        (!a || a.indexOf('<span class="label label-success" style="position:absolute;z-index:10"><i class="fa fa-check-circle"></i> 复制成功</span>') < 0) && $("#copy-" + e).after(t),
            setTimeout(function () {
                t.remove()
            }, 2e3)
    }
        ,
        t
}
]);