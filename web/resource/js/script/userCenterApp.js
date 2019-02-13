angular.module("userCenterApp", ["wapeditorApp"]);

angular.module("userCenterApp").controller("MainCtrl", ["$scope", "$timeout", "widget", "config", "serviceCommon", "serviceSetStyle", "serviceBase", "serviceUcSubmit", "serviceUpwardCompatible", function ($scope, $timeout, a, config, serviceCommon, serviceSetStyle, serviceBase, serviceUcSubmit, serviceUpwardCompatible) {

    $scope.modules = [];
    $scope.editors = [];
    $scope.activeModules = config.activeModules ? config.activeModules : [];
    $scope.activeMenus = config.activeMenus ? config.activeMenus : [];
    $scope.submit = {
        params: {},
        html: ""
    };
    $scope.isNew = true;
    $scope.siteroot = config.siteroot;
    $scope.logo_url = $scope.siteroot + "/app/resource/images/heading.jpg";
    _.isEmpty($scope.activeModules) || 1 == $scope.activeModules[0].params.isnew || ($scope.isNew = false);
    $scope.siteEntrance = config.links.murl;
    $scope.activeItem = {};
    $scope.activeIndex = 0;
    $scope.index = $scope.activeModules.length ? $scope.activeModules.length : 0;
    serviceBase.setBaseData("index", $scope.index);
    serviceBase.setBaseData("activeModules", $scope.activeModules);
    $scope.pageLength = !_.isEmpty($scope.activeModules) && $scope.activeModules[0].params.pageLength ? $scope.activeModules[0].params.pageLength : 1;
    $scope.isLongPage = true;
    $scope.pageLengths = {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5
    };
    $scope.lineHeights = {
        1: 1,
        1.25: 1.25,
        1.5: 1.5,
        2: 2,
        2.5: 2.5
    };
    $scope.fontSizes = {
        12: 12,
        14: 14,
        16: 16,
        18: 18,
        20: 20,
        22: 22,
        24: 24,
        26: 26,
        28: 28,
        30: 30,
        32: 32,
        34: 34,
        36: 36,
        38: 38,
        40: 40
    };

    if (!$scope.isNew) {
        $scope.activeModules = serviceUpwardCompatible.compatibility($scope.activeModules);
        $scope.activeModules[0].params.isnew = 1;
        void 0 === $scope.activeModules[0].params.pageLength && ($scope.activeModules[0].params.pageLength = Math.ceil(($(".modules").height() + 520) / 568));

        if ($scope.activeModules[0].params.pageLength > 1) {
            $scope.pageLength = $scope.activeModules[0].params.pageLength;
            serviceBase.setBaseData("pageLength", $scope.pageLength);
            $timeout(function () {
                $(".app-content").css("height", 568 * $scope.pageLength + "px")
            }, 100);
        }

        $timeout(function () {
            var t = 0, a = height = "";
            $(".modules>div").each(function () {
                var n = parseInt($(this).attr("index"));
                a = $(this).find("div.ng-scope[ng-controller$='Ctrl']").css("width");
                height = $(this).find("div.ng-scope[ng-controller$='Ctrl']").css("height");
                if (n > 0) {
                    for (var i in $scope.activeModules) {
                        if ($scope.activeModules[i].index == n) {
                            t += parseInt($scope.activeModules[i].marginTop);
                            $scope.activeModules[i].params.positionStyle.width = parseInt(a);
                            $scope.activeModules[i].params.positionStyle.height = parseInt(height);
                            $scope.activeModules[i].params.positionStyle.top = t;
                            $scope.activeModules[i].positionStyle = "position:absolute;width:" + a + ";height:" + height + ";left:" + $scope.activeModules[i].params.positionStyle.left + "px;top:" + t + "px;";
                            $(this).find("div[ng-controller]").attr("style", $scope.activeModules[i].positionStyle);
                        }
                    }
                    t += parseInt(height);
                }
                i++;
            });
            serviceBase.setBaseData("activeModules", $scope.activeModules);
        }, 1e3);
    }

    for (var c in $scope.activeModules)
        $scope.activeModules[c].originParams = angular.copy($scope.activeModules[c].params);

    $scope.success = function (e) {
        var e = parseInt(e),
            t = $('<span class="label label-success" style="position:absolute;z-index:10;width:90px;height:34px;line-height:28px;"><i class="fa fa-check-circle"></i> 复制成功</span>');
        serviceCommon.copySuccess(e, t);
    };

    $scope.$on("serviceBase.editors.update", function (t, a) {
        $scope.editors = a
    });

    $scope.$on("serviceBase.activeItem.update", function (t, a) {
        $scope.activeItem = a
    });

    $scope.$on("serviceBase.activeModules.update", function (t, a) {
        $scope.activeModules = a
    });

    $scope.$on("serviceBase.activeItem.params.update", function (t, a) {
        $scope.activeItem.params = a
    });

    $scope.$on("serviceBase.activeItem.animationName.update", function (t, a) {
        $scope.activeItem.params.animationStyle.animationName = a
    });

    $scope.$on("serviceBase.activeItem.style.update", function (t, a, n, i, s) {
        $scope.activeItem.params[a] = n;
        $scope.activeItem[a] = i;
        void 0 !== s && ($scope.activeItem.transform = s);
    });

    $scope.$on("updateScope", function (t, a) {
        angular.forEach(a, function (t, a) {
            $scope[a] = t;
        })
    });

    $scope.addItem = function (id) {
        serviceBase.addItem(id, "uc")
    };

    $scope.editItem = function (e) {
        serviceBase.editItem(e)
    };

    $scope.deleteItem = function (e) {
        serviceBase.deleteItem(e)
    };

    $scope.submit = function (t) {
        $scope.submit = serviceUcSubmit.submit(),
            $scope.$apply("submit"),
            $(t.target).parents("form").submit()
    };

    $scope.init = function (t, a) {
        $scope.modules = serviceBase.setModules(t, a);
        if ($scope.activeModules.length > 0) {
            var n = [];
            angular.forEach($scope.activeModules, function (e, t) {
                e && n.push(e.id);
            })
        }
        angular.forEach($scope.modules, function (e, t) {
            e.defaultshow && -1 == $.inArray(e.id, n) && serviceBase.addItem(e.id);
        })
    };

    $scope.setModulePositionStyle = function (e) {
        serviceSetStyle.setModulePositionStyle(e)
    };

    $scope.eleAnimationIns = function (e) {
        serviceSetStyle.eleAnimationIns(e)
    };

    $scope.savePagePosition = function () {
        serviceSetStyle.savePagePosition($scope.activeModules)
    };

    $scope.saveModulePosition = function () {
        serviceSetStyle.saveModulePosition($scope.activeItem)
    };

    $scope.changeTextAlign = function (t) {
        serviceSetStyle.changeTextAlign($scope.activeItem, t)
    };

    $scope.changeBorderWidth = function () {
        serviceSetStyle.changeBorderWidth($scope.activeItem)
    };

    $scope.changeInnerHeight = function () {
        serviceSetStyle.changeInnerHeight($scope.activeItem)
    };

    $scope.changePageLength = function (pageLength) {
        if (angular.isString(pageLength))
            if ("minus" == pageLength && $scope.pageLength > 1)
                pageLength = $scope.pageLength - 1;
            else {
                if (!("plus" == pageLength && $scope.pageLength < 5))
                    return false;
                pageLength = $scope.pageLength + 1
            }
        var a = serviceSetStyle.changePageLength(pageLength, $scope.activeModules);
        serviceBase.setBaseData({
            pageLength: parseInt(pageLength),
            activeModules: a
        })
    };

    $scope.clearModuleStyle = function () {
        serviceSetStyle.clearModuleStyle($scope.activeItem)
    };

    $scope.addThumb = function (t) {
        require(["fileUploader"], function (a) {
            a.show(function (a) {
                $scope.activeItem.params[t] = a.url,
                    $scope.$apply("activeItem")
            }, {
                direct: true,
                multiple: false
            })
        })
    };

    $scope.showIconBrowser = function (t) {
        util.iconBrowser(function (a) {
            t.css.icon.icon = a,
                $scope.$apply("activeMenus")
        })
    };

    $scope.addMenu = function () {
        $scope.activeMenus.push({
            icon: "",
            css: {
                icon: {
                    icon: "fa fa-external-link"
                }
            },
            name: "",
            url: ""
        })
    };

    $scope.removeMenu = function (t) {
        $scope.activeMenus = _.without($scope.activeMenus, t)
    };

    $(".single-submit").on("click", function (t) {
        $scope.submit(t)
    });

    $scope.init(null, ["UCheader"]); // 初始化

    $scope.changePageLength($scope.pageLength);
    $scope.editItem(0);
    $scope.$watch("activeItem.params.baseStyle", function (e) {
        e && serviceSetStyle.setModuleBaseStyle(e)
    }, true);

    $scope.$watch("activeItem.params.borderStyle", function (e) {
        e && serviceSetStyle.setModuleBorderStyle(e)
    }, true);

    $scope.$watch("activeItem.params.shadowStyle", function (e) {
        e && serviceSetStyle.setModuleShadowStyle(e)
    }, true);

    $scope.$watch("activeItem.params.animationStyle", function (e) {
        e && serviceSetStyle.setModuleAnimationStyle(e)
    }, true);

    $scope.$watch("activeItem.params.positionStyle", function (e) {
        e && serviceSetStyle.setModulePositionStyle(e)
    }, true);
}
]);

angular.module("userCenterApp").service("serviceUcSubmit", ["serviceBase", "serviceCommon", function (serviceBase, serviceCommon) {
    var serviceUcSubmit = {};
    serviceUcSubmit.submit = function () {
        var a = ""
            , n = {
            params: {},
            html: ""
        }
            , i = $($(".modules").html())
            , s = serviceBase.getBaseData("activeModules")
            , o = $(".app-usercenter").height()
            , r = $(".app-content").height() - o + "px";
        i.find("div.ng-scope[ng-controller$='Ctrl']").each(function () {
            var e = _.findIndex(s, {
                index: parseInt($(this).parent().parent().attr("index"))
            })
                , n = ""
                , i = angular.copy(s[e].params);
            $(this).find(".js-default-content").remove();
            var o = $(this).parent().parent().attr("name").toLowerCase()
                , r = $(this).css("top")
                , l = $(this).css("left")
                , c = $(this).css("width")
                , u = $(this).css("height")
                , d = "position:absolute;top:" + r + ";left:" + l + ";width:" + c + ";height:" + u + ";";
            switch (s[e].params.positionStyle.top = parseInt(r),
                s[e].params.positionStyle.left = parseInt(l),
                s[e].params.positionStyle.width = parseInt(c),
                s[e].params.positionStyle.height = parseInt(u),
                s[e].positionStyle = d,
                o) {
                case "link":
                    var p = this;
                    angular.forEach(i.items, function (e, a) {
                        (e.selectCate.pid || e.selectCate.cid) && $(p).find(".list-group").children().eq(a).replaceWith("<div>" + serviceCommon.buildDataTagBegin("link", e) + '<div class="list-group-item ng-scope"><a href="{$row[url]}" class="clearfix"><span class="app-nav-title"> {$row[title]}<i class="pull-right fa fa-angle-right"></i></span></a></div>' + serviceCommon.buildDataTagEnd() + "</div>")
                    });
                    break;
                case "richtext":
                    s[e] && (s[e].params.content = "")
            }
            if (n = $(this).html(),
            "header" != o) {
                d = $(this).attr("style");
                a += '<div type="' + o + '" style="' + d + '">' + n + "</div>"
            }
            e++
        });
        var l = s[0].params.bgColor ? s[0].params.bgColor : "";
        return a = '<div class="js-design-page" style="background-color:' + l + ";height:" + r + ';position:absolute;">' + a + "</div>",
            a = a.replace(/<\!\-\-([^-]*?)\-\->/g, ""),
            a = a.replace(/ ng\-[a-zA-Z-]+=\"[^\"]*\"/g, ""),
            a = a.replace(/ ng\-[a-zA-Z]+/g, ""),
            n.html = a,
            n.params = angular.copy(s),
            serviceCommon.stripHaskey(n.params),
            n
    };
    return serviceUcSubmit;
}
]);