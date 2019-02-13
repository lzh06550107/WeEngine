angular.module("moduleApp", ["we7app", "infinite-scroll"]); // 无限滚动

angular.module("moduleApp").controller("ModuleMoreCtrl", ["$scope", "config", function ($scope, config) {
    $scope.activeLetter = "";
    $scope.searchModule = function (e) {
        location.href = config.searchurl + "&letter=" + e;
    }
}
]).controller("moduleGroupCtrl", ["$scope", function ($scope) {
    $scope.changeText = function ($event) {
        var text = $event.target.text;
        $event.target.text = "展开" == text ? "收起" : "展开"
    }
}
]).controller("moduleGroupPostCtrl", ["$scope", "$http", "config", function ($scope, $http, config) {

    function selecteModule(modules, allmodulesel, n) {
        $scope.selectedModules = [];
        if (!allmodulesel) {
            $scope.selectedModules = [];
            angular.forEach(modules, function (e) {
                e.selected = false
            });
            return void 0;
        }
        angular.forEach(modules, function (module) {
            module.selected = true;
            $scope.selectedModules.push(module);
            module.main_module && "" != module.main_module && void 0 != modules[module.main_module] && $scope.selectedModules.push(modules[module.main_module]);
        });
    }

    $scope.config = config;
    $scope.moduleGroup = null === config.moduleGroup ? {
        title: ""
    } : config.moduleGroup;
    $scope.groupHaveModuleApp = 0 == config.groupHaveModuleApp.length ? {} : config.groupHaveModuleApp;
    $scope.groupHaveModuleWxapp = 0 == config.groupHaveModuleWxapp.length ? {} : config.groupHaveModuleWxapp;
    $scope.groupHaveModuleWebapp = 0 == config.groupHaveModuleWebapp.length ? {} : config.groupHaveModuleWebapp;
    $scope.groupHaveModulePhoneapp = 0 == config.groupHaveModulePhoneapp.length ? {} : config.groupHaveModulePhoneapp;
    $scope.groupNotHaveModuleApp = config.groupNotHaveModuleApp;
    $scope.groupNotHaveModuleWxapp = config.groupNotHaveModuleWxapp;
    $scope.groupNotHaveModuleWebapp = config.groupNotHaveModuleWebapp;
    $scope.groupNotHaveModulePhoneapp = config.groupNotHaveModulePhoneapp;
    $scope.groupHaveTemplate = 0 == config.groupHaveTemplate.length ? {} : config.groupHaveTemplate;
    $scope.groupNotHaveTemplate = config.groupNotHaveTemplate; //TODO
    $scope.selectedModules = [];
    $scope.allmodulesel = false;
    $scope.allwxappsel = false;
    $scope.alltemplatesel = false;
    $scope.allwebsel = false;
    $scope.keyword = "";

    /**
     * 根据模块标题过滤待选择模块
     * @param keyword
     */
    $scope.filterKeyword = function (keyword) {
        angular.forEach($scope.groupNotHaveModuleApp, function (module) {
            module.hide = false;
            "" != keyword && -1 == module.title.indexOf(keyword) && (module.hide = true);
        })
    };

    $scope.addModule = function () {
        $("#add_module").modal("show")
    };

    $scope.addModuleWxapp = function () {
        $("#add_module_wxapp").modal("show")
    };

    $scope.addTemplate = function () {
        $("#add_template").modal("show")
    };

    $scope.addModuleWebapp = function () {
        $("#add_module_webapp").modal("show")
    };

    $scope.addModulePhoneapp = function () {
        $("#add_module_phoneapp").modal("show")
    };

    $scope.selectOrCancelModule = function (module, type) {
        module.selected = !module.selected;
        module.selected ? $scope.selectModule(module, type) : $scope.cancleModule(module, type);
    };

    $scope.selecteAllModule = function (allmodulesel) {
        selecteModule($scope.groupNotHaveModuleApp, allmodulesel)
    };

    $scope.selecteAllWxapp = function (allmodulesel) {
        selecteModule($scope.groupNotHaveModuleWxapp, allmodulesel)
    };

    $scope.selecteAllTemplate = function (allmodulesel) {
        selecteModule($scope.groupNotHaveTemplate, allmodulesel)
    };

    $scope.selecteAllWebapp = function (allmodulesel) {
        selecteModule($scope.groupNotHaveModuleWebapp, allmodulesel)
    };

    $scope.selecteAllPhoneapp = function (allmodulesel) {
        selecteModule($scope.groupNotHaveModulePhoneapp, allmodulesel)
    };

    $scope.selectModule = function (module, type) {
        $scope.selectedModules.push(module);
        "module" == type && "" != module.main_module && void 0 != $scope.groupNotHaveModuleApp[module.main_module] && $scope.selectedModules.push($scope.groupNotHaveModuleApp[module.main_module]);

        if ("module" == type) {
            $scope.selectedModules.length >= _.values($scope.groupNotHaveModuleApp).length && ($scope.allmodulesel = true);
        } else if ("module_wxapp" == type) {
            $scope.selectedModules.length == _.values($scope.groupNotHaveModuleWxapp).length && ($scope.allwxappsel = true);
        } else if ("module_webapp" == type) {
            $scope.selectedModules.length == _.values($scope.groupNotHaveModuleWebapp).length && ($scope.allwebappsel = true);
        } else if ("module_phoneapp" == type) {
            $scope.selectedModules.length == _.values($scope.groupNotHaveModulePhoneapp).length && ($scope.allphoneappsel = true);
        } else {
            $scope.selectedModules.length == _.values($scope.groupNotHaveTemplate).length && ($scope.alltemplatesel = true);
        }

    };

    $scope.cancleModule = function (t, type) {

        have_plugin = false;
        angular.forEach($scope.selectedModules, function (module) {
            module.main_module == t.name && (have_plugin = true)
        });
        if (1 == have_plugin) return false;
        var n = _.indexOf($scope.selectedModules, t);
        n > -1 && ($scope.selectedModules = _.without($scope.selectedModules, $scope.selectedModules[n]));

        if ("module" == type) {
            $scope.allmodulesel = false;
        } else if ("module_wxapp" == type) {
            $scope.allwxappsel = false;
        } else if ("module_webapp" == type) {
            $scope.allwebappsel = false;
        } else if ("module_phoneapp" == type) {
            $scope.allphoneappsel = false;
        } else {
            $scope.alltemplatesel = false;
        }
    };

    $scope.addHaveModule = function () {
        angular.forEach($scope.selectedModules, function (module, a) {
            delete $scope.groupNotHaveModuleApp[module.name];
            $scope.groupHaveModuleApp[module.name] = module;
        });
        $scope.selectedModules = [];
        $("#add_module").modal("hide");
        $scope.allmodulesel = false;
    };

    $scope.addHaveModuleWxapp = function () {
        angular.forEach($scope.selectedModules, function (module, a) {
            delete $scope.groupNotHaveModuleWxapp[module.name];
            $scope.groupHaveModuleWxapp[module.name] = module;
        });
        $scope.selectedModules = [];
        $("#add_module_wxapp").modal("hide");
        $scope.allwxappsel = false;
    };

    $scope.addHaveTemplate = function () {
        angular.forEach($scope.selectedModules, function (t, a) {
            delete $scope.groupNotHaveTemplate[t.name];
            $scope.groupHaveTemplate[t.name] = t;
        }),
            $scope.selectedModules = [];
        $("#add_template").modal("hide");
    };

    $scope.addHaveModuleWebapp = function () {
        angular.forEach($scope.selectedModules, function (module, a) {
            delete $scope.groupNotHaveModuleWebapp[module.name];
            $scope.groupHaveModuleWebapp[module.name] = module;
        }),
            $scope.selectedModules = [];
        $("#add_module_webapp").modal("hide");
    };

    $scope.addHaveModulePhoneapp = function () {
        angular.forEach($scope.selectedModules, function (module, a) {
            delete $scope.groupNotHaveModulePhoneapp[module.name];
            $scope.groupHaveModulePhoneapp[module.name] = module;
        });
        $scope.selectedModules = [];
        $("#add_module_phoneapp").modal("hide");
    };

    /**
     * 删除已有模块
     * @param module
     */
    $scope.delHaveModule = function (module) {
        module.selected = false;
        delete $scope.groupHaveModuleApp[module.name];
        $scope.groupNotHaveModuleApp[module.name] = module;

        if ("" != module.plugin) {
            angular.forEach($scope.groupHaveModuleApp, function (module) {
                if (module.main_module == module.name) {
                    delete $scope.groupHaveModuleApp[module.name];
                    $scope.groupNotHaveModuleApp[module.name] = module;
                }
            });
        }
    };

    $scope.delHaveModuleWxapp = function (module) {
        module.selected = false;
        delete $scope.groupHaveModuleWxapp[module.name];
        $scope.groupNotHaveModuleWxapp[module.name] = module;
    };

    $scope.delHaveModuleWebapp = function (module) {
        module.selected = false;
        delete $scope.groupHaveModuleWebapp[module.name];
        $scope.groupNotHaveModuleWebapp[module.name] = module;
    };

    $scope.delHaveModulePhoneapp = function (module) {
        module.selected = false;
        delete $scope.groupHaveModulePhoneapp[module.name];
        $scope.groupNotHaveModulePhoneapp[module.name] = module;
    };

    $scope.delHaveTemplate = function (template) {
        template.selected = false;
        delete $scope.groupHaveTemplate[template.name];
        $scope.groupNotHaveTemplate[template.name] = template;
    };

    $scope.cancel = function (id) {
        angular.forEach($scope.selectedModules, function (module) {
            module.selected = false
        });
        $scope.selectedModules = [];
        $scope.allmodulesel = false;
        $scope.allwxappsel = false;
        $scope.alltemplatesel = false;
        $scope.allwebappsel = false;
        $scope.allphoneappsel = false;
        $("#" + id).modal("hide");
    };

    $scope.saveGroup = function () {
        var a = [];
        angular.forEach($scope.groupHaveModuleApp, function (module, t) {
            a.push(module.name);
        });
        var n = [];
        angular.forEach($scope.groupHaveModuleWxapp, function (module, t) {
            n.push(module.name);
        });
        var data = {
            id: $scope.moduleGroup.id,
            name: $scope.moduleGroup.name,
            modules: a,
            wxapp: n,
            templates: $scope.groupHaveTemplate,
            webapp: $scope.groupHaveModuleWebapp,
            phoneapp: $scope.groupHaveModulePhoneapp
        };
        if ("" === data.name || void 0 === data.name) {
            util.message("请输入套餐名", "", "info");
            return false;
        }
        $http({
            method: "POST",
            url: $scope.config.url,
            data: data,
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            }
        }).success(function (e) {
            if (1 == e.message.errno) {
                util.message(e.message.message);
                return false;
            }
            util.message("提交成功", e.redirect, "success");
        })
    }
}
]).controller("installedCtrl", ["$scope", "$http", "config", "$sce", function ($scope, $http, a, $sce) {
    $scope.config = a;
    $scope.isFounder = a.isFounder;
    $scope.letters = ["全部"];

    angular.forEach(a.letters, function (t) {
        $scope.letters.push(t);
    });

    $scope.letter = a.letter;
    $scope.module_list = a.module_list;
    $scope.allModules = a.allModules;
    $scope.moduleinfo = {};
    $scope.cloudModule = a.cloudModule;
    $scope.upgradeInfo = {};
    $scope.pager = a.pager;
    $scope.new_branch = 0;
    $scope.upgrade_branch = 0;
    $scope.welcome_module = a.welcome_module;

    $scope.change_welcome_module = function (n) {
        n == $scope.welcome_module && (n = "");
        $http.post(a.set_site_welcome_url, {
            name: n
        }).success(function (t) {
            if (0 != t.message.errno)
                return util.message(t.message.message, "", "error"),
                    false;
            $scope.welcome_module = n,
                util.message("设置成功", "", "success")
        })
    };

    check_module = [];

    angular.forEach($scope.module_list, function (e, t) {
        check_module.push(t)
    });

    $http.post($scope.config.checkUpgradeUrl, {
        module_list: check_module
    }).success(function (e) {
    });

    // 注意，这是控制器内部函数
    filter = function (type, i) {
        if ("new_branch" == type || "upgrade_branch" == type) {
            $scope[type] = 1 == $scope[type] ? 0 : 1;
        }
        $http.post($scope.config.filterUrl, {
            condition: {
                new_branch: $scope.new_branch,
                upgrade_branch: $scope.upgrade_branch
            },
            pageindex: i
        }).success(function (t) {
            $scope.module_list = t.message.message.modules;
            $scope.pager = $sce.trustAsHtml(t.message.message.pager);
        })
    };

    $scope.searchLetter = function (letter) {
        $(':hidden[name="letter"]').val(letter);
        $("#search").click();
    };

    // 作废？？
    $scope.editModule = function (mid) {
        $("#module-info").modal("show"),
        "" != mid && $http.post($scope.config.editModuleUrl, {
            mid: mid
        }).success(function (t) {
            $scope.moduleinfo = t.message.message,
                $scope.moduleinfo.logo = $scope.moduleinfo.logo + "?v=" + (new Date).getTime(),
                $scope.moduleinfo.preview = $scope.moduleinfo.preview + "?v=" + (new Date).getTime()
        })
    };

    $scope.changePicture = function (t) {
        require(["fileUploader"], function (a) {
            a.init(function (a) {
                $scope.moduleinfo[t] = a.url,
                    $scope.$apply($scope.moduleinfo)
            }, {
                type: "image",
                direct: true,
                multiple: false
            })
        })
    };

    $scope.delPicture = function (t) {
        $scope.moduleinfo[t] = ""
    };

    $scope.save = function () {
        $http.post($scope.config.saveModuleUrl, {
            moduleinfo: $scope.moduleinfo
        }).success(function (t) {
            0 == t.message.message && ($scope.moduleinfo.logo = $scope.moduleinfo.logo + "?v=" + (new Date).getTime(),
                $scope.moduleinfo.preview = $scope.moduleinfo.preview + "?v=" + (new Date).getTime(),
                $scope.module_list[$scope.moduleinfo.name].title = $scope.moduleinfo.title,
                $scope.module_list[$scope.moduleinfo.name].logo = $scope.moduleinfo.logo)
        })
    };

    $scope.setUpgradeInfo = function (a) {
        $http.post($scope.config.get_upgrade_info_url, {
            name: a
        }).success(function (t) {
            0 == t.message.errno ? ($scope.upgradeInfo = t.message.message,
                $("#upgrade-info").modal("show")) : 1 == t.message.errno && ($("#upgrade-info").modal("show"),
                $("#upgrade-info").html(t.message.message),
                util.message(t.message.message))
        })
    }
}
]).controller("notInstalledCtrl", ["$scope", "config", function ($scope, config) {
    $scope.letters = ["全部"];
    angular.forEach(config.letters, function (t) {
        $scope.letters.push(t);
    });
    $scope.letter = config.letter;
    $scope.module_list = config.module_list;
    $scope.searchLetter = function (e) {
        $(':hidden[name="letter"]').val(e),
            $("#search").click()
    };
}
]).controller("detailCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.config = a;
    $scope.isFounder = a.isFounder;
    $scope.receive_ban = a.receive_ban;
    $scope.moduleinfo = a.moduleInfo;
    $scope.subscribe = 2;
    $scope.checkupgrade = 0;
    $scope.show = a.show;
    $scope.editType = "";

    $http.post($scope.config.checkReceiveUrl, {
        module_name: a.modulename
    }).success(function (t) {
        0 == t.message.errno && ($scope.subscribe = 1)
    });

    $http({
        method: "POST",
        url: $scope.config.checkUpgradeUrl,
        data: {
            module_list: {
                0: a.modulename
            }
        },
        beforeSend: function () {
            "upgrade" == $scope.show && $(".loader").show()
        },
        complete: function () {
            $(".loader").hide()
        }
    }).success(function (a) {
        0 == a.message.errno && (1 != a.message.message[0].upgrade && 1 != a.message.message[0].new_branch || ($scope.checkupgrade = 1,
            "cloud" == a.message.message[0].from ? $http.post($scope.config.get_upgrade_info_url, {
                name: $scope.moduleinfo.name
            }).success(function (t) {
                if (0 == t.message.errno) {
                    $scope.upgradeInfo = t.message.message;
                    var a = (new Date).getTime();
                    a = a.toString().substr(0, 10),
                        $scope.upgradeInfo.service_expiretime > 0 && a > $scope.upgradeInfo.service_expiretime ? $scope.upgradeInfo.service_expire = true : $scope.upgradeInfo.service_expire = false
                } else
                    1 == t.message.errno && util.message(t.message.message)
            }) : $scope.upgradeInfo = a.message.message[0]))
    });

    $scope.changeShow = function (showType) {
        $scope.show = showType
    };

    $scope.changeSwitch = function () {
        $scope.receive_ban = 1 == $scope.receive_ban ? 2 : 1;
        $http.post($scope.config.url, {
            modulename: $scope.config.modulename
        }).success(function (e) {
            0 == e.message.errno && util.message("更新成功！")
        })
    };

    $scope.editModule = function (field, fieldValue) {
        $scope.moduleOriginal = {};
        $scope.moduleOriginal[field] = fieldValue;
        $scope.editType = field;
        "preview" == field || "logo" == field ? $scope.changePicture(field) : $("#module-info").modal("show");
    };

    $scope.changePicture = function (t) {
        require(["fileUploader"], function (fileUploader) {
            fileUploader.init(function (a) {
                $scope.moduleOriginal[t] = a.url;
                $scope.moduleinfo[t] = a.url;
                $scope.$apply($scope.moduleOriginal);
                $scope.save();
            }, {
                type: "image",
                direct: true,
                multiple: false
            })
        })
    };

    $scope.delPicture = function (t) {
        $scope.moduleOriginal[t] = ""
    };

    $scope.upgrade = function (e, t, a) {
        window.open("http://s.we7.cc/module-" + a + ".html")
    };

    $scope.notice = function (e, t, a) {
        var n = e ? '升级服务已到期，请到商城<a class="color-default" target="_blank" href="http://s.we7.cc/module-' + t + '.html">续费。' : "确认升级到本分支的最高版本吗";
        return e ? (util.message(n, "", "info", "去续费", "http://s.we7.cc/module-" + t + ".html"),
            false) : !!confirm(n) && void (location.href = "./index.php?c=cloud&a=process&m=" + a + "&is_upgrade=1")
    };

    $scope.save = function () {
        $http.post($scope.config.saveModuleUrl, {
            moduleinfo: $scope.moduleOriginal,
            type: $scope.editType,
            modulename: $scope.moduleinfo.name
        }).success(function (t) {
            0 == t.message.errno ? (util.message("修改成功", "", "success"),
                $scope.moduleinfo[$scope.editType] = $scope.moduleOriginal[$scope.editType],
            "logo" == $scope.editType && ($scope.moduleinfo.logo = $scope.moduleOriginal.logo + "?v=" + (new Date).getTime()),
            "preview" == $scope.editType && ($scope.moduleinfo.preview = $scope.moduleOriginal.preview + "?v=" + (new Date).getTime()),
                $scope.$apply($scope.moduleinfo)) : util.message("修改失败", "", "fail")
        })
    };

    change = function (e) {
        branch = e.data("id"),
            $("#version-detail-" + branch).toggle(),
            clas = "wi wi-angle-down" == e.find("i").prop("class") ? "wi wi-angle-up" : "wi wi-angle-down",
            text = "wi wi-angle-down" == clas ? "查看详情" : "收起",
            e.html(text + '<i class="' + clas + '"></i>')
    };
}
]).controller("templateCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.config = a,
        e.templateList = a.templateList,
        e.upgradeInfo = {},
        e.checkUpgrade = function () {
            t.post(e.config.url, {
                template: e.templateList
            }).success(function (t) {
                0 == t.message.errno && (e.templateList = t.message.message)
            })
        }
        ,
        e.checkUpgrade(),
        e.setUpgradeInfo = function (a) {
            t.post(e.config.get_upgrade_info_url, {
                name: a
            }).success(function (t) {
                0 == t.message.errno ? (e.upgradeInfo = t.message.message,
                    $("#upgradeInfo").modal("show")) : 1 == t.message.errno && util.message(t.message.message)
            })
        }
        ,
        e.upgrade = function (e) {
            return confirm("本次升级需要花费" + e + "个交易币。确认升级？")
        }
}
]).controller("userModuleDisplayCtrl", ["$scope", "$http", "$timeout", "config", function ($scope, $http, a, config) {

    var userModules = config.userModule ? Object.keys(config.userModule) : {};
    $scope.userModule = [];
    $scope.alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "全部"];
    $scope.activeLetter = config.activeLetter;
    $scope.searchKeyword = "";

    /**
     * 显示使用它的统一帐号
     * @param $event
     * @param moduleName
     */
    $scope.showAccounts = function ($event, moduleName) {
        require(["underscore"], function () {
            var s = _.findIndex($scope.userModule, {
                name: moduleName
            });
            $http.post(config.links.moduleAccounts, {
                module_name: moduleName
            }).success(function (t) {
                $scope.userModule[s].accounts = t.message.message;
            });
            var o = $($event.target).parents(".mask").next(".cut-select");
            if ("none" == o.css("display")) {
                o.css("display", "block");
                o.parent(".module-list-item").siblings().find(".cut-select").css("display", "none");
            } else {
                o.css("display", "none");
            }
        })
    };

    $scope.hideSelect = function ($event) {
        $($event.target).css("display", "none");
    };

    /**
     * 按模块名称搜索
     */
    $scope.searchKeywordModule = function () {
        if ($scope.searchKeyword) {
            $scope.keywordModule = [];
            angular.forEach(config.userModule, function (userModule, a) {
                userModule.title.match($scope.searchKeyword) && $scope.keywordModule.push(userModule)
            });
            $scope.userModule = $scope.keywordModule
        } else {
            $scope.userModule = config.userModule;
        }
    };

    /**
     * 按模块名称首字母搜索
     * @param letter
     */
    $scope.searchLetterModule = function (letter) {
        $scope.activeLetter = letter;
        if ("全部" == $scope.activeLetter) {
            $scope.userModule = config.userModule;
        } else {
            $scope.letterModule = [];
            angular.forEach(config.userModule, function (userModule, a) {
                userModule.title_initial == $scope.activeLetter && $scope.letterModule.push(userModule);
            });
            $scope.userModule = $scope.letterModule;
        }
    };

    $scope.getall_last_switch = function () {
        $http.post(config.links.getall_last_switch).success(function (e) {
            var t = e.message.message;
            angular.forEach(config.userModule, function (e, a) {
                config.userModule[a].last_switch = t[e.name]
            });
        });
    };

    /**
     * 无限滚动回调
     * @param currentPage
     * @returns {boolean}
     */
    $scope.addMoreModule = function (currentPage) {
        var a = 15 * (Math.max(1, parseInt(currentPage)) - 1), s = 0;

        if (!(userModules.length < a)) {
            angular.forEach(config.userModule, function (userModule, n) {
                s >= a && s < a + 15 && $scope.userModule.push(userModule); // 增加一页数量
                s++;
            });
            return true;
        }
        return false;
    };

    $scope.currentPage = 1;
    $scope.loadMore = function () {
        $scope.addMoreModule($scope.currentPage);
        $scope.currentPage++;
    };
}
]).controller("subscribeCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.subscribe_module = a.subscribe_module;
    $scope.types = a.types;
    $scope.change_ban_url = a.change_ban_url;
    $scope.check_receive_url = a.check_receive_url;

    $scope.change_ban = function (name) {
        $http.post($scope.change_ban_url, {
            modulename: name
        }).success(function (t) {
            0 != t.message.errno ? util.message(t.message.message, "", "error") : $scope.subscribe_module[name].receive_ban = 1 == $scope.subscribe_module[name].receive_ban ? 0 : 1
        })
    };

    angular.forEach($scope.subscribe_module, function (a, name) {
        $http.post($scope.check_receive_url, {
            module_name: name
        }).success(function (t) {
            0 == t.message.errno && ($scope.subscribe_module[name].subscribe_success = 1)
        })
    });
}
]);