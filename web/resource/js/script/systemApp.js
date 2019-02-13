angular.module("systemApp", ["we7app"]);

angular.module("systemApp").controller("UpdateCacheCtrl", ["$scope", "$http", function ($scope, $http) {

    $scope.dataCache = true;
    $scope.templateCache = true;

    $scope.updateCache = function () {
        $http({
            method: "POST",
            url: "./index.php?c=system&a=updatecache",
            data: {
                dataCache: $scope.dataCache ? 1 : '',
                templateCache: $scope.templateCache ? 1 : '',
                submit: "submit"
            },
            beforeSend: function () {
                $(".loader").show()
            },
            complete: function () {
                $(".loader").hide()
            }
        }).success(function (e) {
            0 == e.message.errno && util.message(e.message.message)
        })
    }
}
]);

angular.module("systemApp").controller("MenuCtrl", ["$scope", "$http", function ($scope, $http) {

    $scope.subItemGroup = {};
    $scope.displayStatus = {};
    $scope.mainMenu = {
        permission: "",
        displayorder: 0
    };
    // 进入新建菜单面板
    $scope.editItemPanel = function (menu) {
        if (menu) {
            $scope.activeItem = {};
            $scope.activeItem = menu;
            $(".js-edit-panel").modal();
        }
    };
    // 编辑主菜单项，只能修改displayorder
    $scope.editMainMenu = function (displayorder, permissionName) {
        $scope.mainMenu.displayorder = displayorder;
        $scope.mainMenu.permission = permissionName;
        $("#editorder").modal("show");
    };
    // 保存主菜单项修改
    $scope.saveorder = function () {
        $http.post("./index.php?c=system&a=menu&do=change_displayorder", $scope.mainMenu).success(function (e) {
            if (0 == e.message.errno) {
                $("#editorder").modal("hide");
                util.message("操作成功", e.redirect, "ajax");
            } else {
                util.message("操作失败", "", "info");
            }
        });
    };
    // 提交菜单项
    $scope.editItem = function () {
        $http.post("./index.php?c=system&a=menu&do=post", $scope.activeItem).success(function (response) {
            if (response.message.errno) {
                util.message(response.message.message);
            } else {
                $scope.activeItem.isNew && $scope.subItemGroup[$scope.activeItem.group].push($scope.activeItem);
                util.message(response.message.message, response.redirect, "ajax");
                $(".js-edit-panel").modal("hide");
            }

        })
    };
    // 进入添加子菜单
    $scope.addSubItem = function (section, menu) {
        $scope.subItemGroup[section] || ($scope.subItemGroup[section] = []);
        var a = {
            title: menu.title,
            url: menu.url,
            permissionName: menu.permissionName,
            icon: menu.icon,
            displayorder: menu.displayorder,
            isDisplay: menu.isDisplay,
            isSystem: false,
            group: section,
            isNew: true
        };
        $scope.editItemPanel(a);
    };

    $scope.selectMenuIcon = function () {
        util.iconBrowser(function (t) {
            $scope.activeItem.icon = t;
            $scope.$apply("activeItem");
        })
    };

    // 删除菜单项
    $scope.removeSubItem = function (permissionName, n) {
        if (permissionName && confirm("确认删除此菜单？")) {
            if (void 0 === n) { // void 0表示未定义
                $http.post("./index.php?c=system&a=menu&do=delete", {
                    permission_name: permissionName
                }).success(function (e) {
                    e.message.errno ? util.message(e.message.message) : util.message(e.message.message, "refresh");
                })
            } else {
                $scope.subItemGroup[permissionName].splice(n, 1);
            }
        }
    };

    // 菜单是否显示
    $scope.changeDisplay = function (permissionName) {
        1 == $scope.displayStatus[permissionName] ? status = 0 : status = 1;
        $http.post("./index.php?c=system&a=menu&do=display_status", {
            status: status,
            permission_name: permissionName
        }).success(function (t) {
            $scope.displayStatus[permissionName] = !!parseInt(status); //强制转换为Boolean 用 !!
        })
    }
}
]);

angular.module("systemApp").controller("WelcomeCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.loaderror = 0;
    $scope.ads = null;
    $scope.account_uninstall_modules_nums = 0; // 支持公众号未安装模块数
    $scope.wxapp_uninstall_modules_nums = 0; // 支持小程序未安装模块数
    $scope.webapp_uninstall_modules_nums = 0; // 支持PC未安装模块数
    $scope.phoneapp_uninstall_modules_nums = 0; // 支持APP未安装模块数
    $scope.account_modules_total = 0; // 支持公众号模块总数
    $scope.wxapp_modules_total = 0; // 支持小程序模块总数
    $scope.webapp_modules_total = 0; // 支持PC模块总数
    $scope.phoneapp_modules_total = 0; // 支持APP模块总数
    $scope.not_installed_module = [];
    $scope.not_installed_show = 0;

    /**
     * 模块统计
     */
    $scope.get_module_statistics = function () {
        $http({
            url: a.moduleStatisticsUrl,
            method: "POST",
            data: {},
            beforeSend: function () {
            },
            complete: function () {
            }
        }).success(function (t) {
            if (0 == t.message.errno) {
                var a = t.message.message;
                $scope.account_uninstall_modules_nums = a.account_uninstall_modules_nums;
                $scope.wxapp_uninstall_modules_nums = a.wxapp_uninstall_modules_nums;
                $scope.webapp_uninstall_modules_nums = a.webapp_uninstall_modules_nums;
                $scope.phoneapp_uninstall_modules_nums = a.phoneapp_uninstall_modules_nums;
                $scope.account_modules_total = a.account_modules_total;
                $scope.wxapp_modules_total = a.wxapp_modules_total;
                $scope.webapp_modules_total = a.webapp_modules_total;
                $scope.phoneapp_modules_total = a.phoneapp_modules_total;
            }
        })
    };

    $scope.upgrade_module_nums = [];
    $scope.upgrade_module_nums.account_upgrade_module_nums = 0;
    $scope.upgrade_module_nums.wxapp_upgrade_module_nums = 0;
    $scope.upgrade_module_nums.webapp_upgrade_module_nums = 0;
    $scope.upgrade_module_nums.phoneapp_upgrade_module_nums = 0;
    $scope.upgrade_module_list = [];

    $scope.get_upgrade_modules = function () {
        $http({
            url: a.upgradeModulesUrl,
            method: "POST",
            data: {},
            beforeSend: function () {
            },
            complete: function () {
            }
        }).success(function (t) {
            if (0 == t.message.errno) {
                var a = t.message.message;
                $scope.upgrade_module_nums = a.upgrade_module_nums;
                $scope.upgrade_module_list = a.upgrade_module_list;
                0 == $scope.upgrade_module_list.length && ($scope.upgrade_modules_show = 0)
            }
        })
    };

    $scope.upgrade_show = 0;

    /**
     * 微擎系统更新
     */
    $scope.get_system_upgrade = function () {
        $http({
            url: a.systemUpgradeUrl,
            method: "POST",
            data: {},
            beforeSend: function () {
            },
            complete: function () {
                util.loaded()
            }
        }).success(function (t) {
            if (0 == t.message.errno) {
                var a = t.message.message;
                $scope.upgrade = a;
                (a.file_nums > 0 || a.database_nums > 0 || a.script_nums > 0) && ($scope.upgrade_show = 1);
            }
        })
    };

    $scope.get_ads = function () {
        $http.post("./index.php?c=home&a=welcome&do=get_ads").success(function (t) {
            0 == t.message.errno ? $scope.ads = t.message.message.we7_index_ads : ($scope.ads = null,
                $scope.loaderror = 1)
        })
    };

    $scope.get_not_installed_module = function () {
        $http.post("./index.php?c=home&a=welcome&do=get_not_installed_modules").success(function (t) {
            if (0 == t.message.errno) {
                $scope.not_installed_module = t.message.message;
                if ($scope.not_installed_module.app_count > 0 || $scope.not_installed_module.wxapp_count > 0 || $scope.not_installed_module.webapp_count > 0 || $scope.not_installed_module.phoneapp_count > 0) {
                    $scope.not_installed_show = 1;
                }
            }
        })
    };

    $scope.ignoreUpdate = function (n) {
        $http.post(a.ignoreUpdateUrl, {
            name: n
        }).success(function (t) {
            0 == t.message.errno && ($scope.upgrade_module_list[n].is_ignore = 1)
        })
    };

    $scope.get_module_statistics(); //
    $scope.get_upgrade_modules();
    $scope.get_system_upgrade(); // 系统更新
    //$scope.get_ads();
    $scope.get_not_installed_module(); // 未安装模块
}
]);

angular.module("systemApp").controller("ipWhiteListCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.lists = a.lists,
        e.links = a.links,
        e.ips = "",
        e.changeStatus = function (a) {
            t.post(e.links.change_status, {
                ip: a
            }).success(function (e) {
                0 == e.message.errno ? location.reload() : util.message(e.message.message, e.redirect, "ajax")
            })
        }
        ,
        e.saveIp = function () {
            $("#myModalIp").modal("hide"),
                t.post(e.links.add_link_ips, {
                    ips: e.ips
                }).success(function (e) {
                    0 != e.message.errno ? util.message(e.message.message) : util.message("添加成功", e.redirect, "ajax")
                })
        }
}
]);

angular.module("systemApp").controller("sensitiveWord", ["$scope", "$http", "config", function (e, t, a) {
    e.lists = a.lists,
        e.links = a.links,
        e.word = "",
        e.saveWords = function () {
            $("#myModalSensitive").modal("hide"),
                t.post(e.links.add_word_link, {
                    word: e.word
                }).success(function (e) {
                    0 != e.message.errno ? util.message(e.message.message) : util.message("添加成功", e.redirect, "ajax")
                })
        }
        ,
        e.del = function (a) {
            t.post(e.links.del_word_link, {
                word: a
            }).success(function (e) {
                0 != e.message.errno ? util.message(e.message.message) : util.message("删除成功", e.redirect, "ajax")
            })
        }
}
]);

angular.module("systemApp").controller("SystemThirdpartyLogin", ["$scope", "$http", "serviceCommon", "config", function ($scope, $http, serviceCommon, config) {
    $scope.type = config.type,
        $scope.thirdlogin = config.thirdlogin,
        $scope.links = config.links,
        $scope.siteroot = config.siteroot,
        $scope.url = config.url,
        $scope.newappid = "",
        $scope.newappsecret = "";

    $scope.httpChange = function (a) {
        switch (a) {
            case "authstate":
                $http.post($scope.links.save_setting, {
                    authstate: "authstate",
                    type: config.type
                }).success(function (e) {
                    0 == e.message.errno ? util.message("修改成功", e.redirect) : util.message("修改失败，请稍后重试！")
                });
                break;
            case "appid":
                $("#AppID").modal("hide"),
                    $http.post($scope.links.save_setting, {
                        appid: $scope.newappid,
                        type: config.type
                    }).success(function (e) {
                        0 == e.message.errno ? util.message("修改成功", e.redirect) : util.message("修改失败，请稍后重试！")
                    });
                break;
            case "appsecret":
                $("#AppSecret").modal("hide"),
                    $http.post($scope.links.save_setting, {
                        appsecret: $scope.newappsecret,
                        type: config.type
                    }).success(function (e) {
                        0 == e.message.errno ? util.message("修改成功", e.redirect) : util.message("修改失败，请稍后重试！")
                    })
        }
    };
    $scope.success = function (copyId) {
        var id = parseInt(copyId)
            ,
            html = $('<span class="label label-success" style="position:absolute;z-index:10;margin-top:10px"><i class="fa fa-check-circle"></i> 复制成功</span>');
        serviceCommon.copySuccess(id, html);
    }
}
]);

angular.module("systemApp").controller("systemOauthCtrl", ["$scope", "$http", "config", function ($scope, $http, config) {
    $scope.oauthHost = config.oauthHost,
        $scope.originalHost = config.oauthHost,
        $scope.oauthAccount = config.oauthAccount,
        $scope.oauthtitle = config.oauthAccounts[config.oauthAccount],
        $scope.links = config.links;

    $scope.saveOauth = function () {
        $http.post($scope.links.oauth_link, {
            account: $scope.oauthAccount,
            host: $scope.oauthHost
        }).success(function (t) {
            0 != t.message.errno ? util.message(t.message.message) : ($scope.originalHost = $scope.oauthHost,
                util.message("成功", t.redirect, "ajax"))
        })
    }
}
]);

angular.module("systemApp").controller("SmsSignCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.all_signatures = a.all_signatures,
        e.site_sms_sign = a.site_sms_sign,
        e.links = a.links,
        e.saveSms = function (a) {
            t.post(e.links.site_sms_sign_link, {
                register: e.site_sms_sign.register,
                find_password: e.site_sms_sign.find_password,
                user_expire: e.site_sms_sign.user_expire
            }).success(function (e) {
                0 != e.message.errno ? util.message(e.message.message, e.redirect, "error") : util.message("设置成功", e.redirect, "success")
            })
        }
}
]);

angular.module("systemApp").service("serviceCommon", ["$rootScope", function ($rootScope) {
    var serviceCommon = {};
    serviceCommon.copySuccess = function (id, html) {
        var num = parseInt(id)
            , t = html
            , a = $("#copy-" + num).next().html();
        (!a || a.indexOf('<span class="label label-success" style="position:absolute;z-index:10"><i class="fa fa-check-circle"></i> 复制成功</span>') < 0) && $("#copy-" + num).after(t);
        setTimeout(function () {
            t.remove()
        }, 2e3);
    };
    return serviceCommon;
}
]);