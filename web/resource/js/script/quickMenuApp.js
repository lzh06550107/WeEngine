angular.module("quickMenuApp", ["wapeditorApp"]);

angular.module("quickMenuApp").controller("MainCtrl", ["$scope", "config", "serviceCommon", "serviceQuickMenuBase", "serviceQuickMenuSubmit", function ($scope, config, a, serviceQuickMenuBase, serviceQuickMenuSubmit) {
    $scope.submit = {};
    $scope.activeItem = config.activeItem ? config.activeItem : serviceQuickMenuBase.initActiveItem();
    serviceQuickMenuBase.initActiveItem($scope.activeItem);

    $scope.selectNavStyle = function () {
        var t = $('input[name="nav_style"]:checked').val();
        $scope.activeItem.navStyle = serviceQuickMenuBase.selectNavStyle(t)
    };

    $scope.addMenu = function () {
        $scope.activeItem.menus = serviceQuickMenuBase.addMenu()
    };

    $scope.addSubMenu = function (t) {
        var a = _.findIndex($scope.activeItem.menus, t);
        $scope.activeItem.menus[a].submenus = serviceQuickMenuBase.addSubMenu(t)
    };

    $scope.submit = function (t) {
        $scope.submit = serviceQuickMenuSubmit.submit();
        $scope.$apply("submit");
        $(t.target).parents("form").submit();
    };

    $scope.removeMenu = function (t) {
        $scope.activeItem.menus = serviceQuickMenuBase.removeMenu(t)
    };

    $scope.removeSubMenu = function (t, a) {
        serviceQuickMenuBase.removeSubMenu(t, a),
            $scope.activeItem.menus[t].submenus = _.without($scope.activeItem.menus[t].submenus, a)
    };

    $scope.showSearchModules = function () {
        $scope.moduleDialog = $("#shop-modules-modal").modal(),
            $("#shop-modules-modal .modal-body .btn-primary").html("取消"),
            $("#shop-modules-modal").find(".modal-footer .btn-primary").unbind("click").click(function () {
                $scope.activeItem.ignoreModules = {},
                    $("#shop-modules-modal .modal-body .btn-primary").each(function () {
                        $scope.hasIgnoreModules = true,
                            $scope.activeItem.ignoreModules[$(this).attr("js-name")] = {
                                name: $(this).attr("js-name"),
                                title: $(this).attr("js-title")
                            }
                    }),
                    $scope.$apply("activeItem"),
                    $scope.$apply("hasIgnoreModules"),
                    serviceQuickMenuBase.setQuickMenuData("ignoreModules", $scope.activeItem.ignoreModules)
            })
    };

    $(".js-editor-submit").click(function (t) {
        $scope.submit(t)
    });
    $scope.hasIgnoreModules = _.size($scope.activeItem.ignoreModules);
    $(".nav-menu").show();
    $(".app-shopNav-edit").show();
}
]);

angular.module("quickMenuApp").service("serviceQuickMenuBase", ["$rootScope", function (e) {
    var t = {}
        , a = {};
    return t.initActiveItem = function (e) {
        return a = angular.isObject(e) ? e : {
            navStyle: 1,
            bgColor: "#2B2D30",
            menus: [],
            extend: [],
            position: {
                homepage: true,
                usercenter: true,
                page: true,
                article: true
            },
            ignoreModules: {}
        }
    }
        ,
        t.selectNavStyle = function (e) {
            return a.navStyle = e,
                a.navStyle
        }
        ,
        t.addMenu = function () {
            return a.menus.push({
                title: "标题",
                url: "",
                submenus: [],
                icon: {
                    name: "fa-home",
                    color: "#00ffff"
                },
                image: "",
                hoverimage: "",
                hovericon: ""
            }),
                a.menus
        }
        ,
        t.removeMenu = function (e) {
            var t = $.inArray(e, a.menus)
                , n = angular.copy(a.menus);
            a.menus = [];
            for (i in n)
                i != t && a.menus.push(n[i]);
            return a.menus
        }
        ,
        t.addSubMenu = function (e) {
            var t = _.findIndex(a.menus, e);
            return a.menus[t].submenus.push({
                title: "标题",
                url: ""
            }),
                a.menus[t].submenus
        }
        ,
        t.removeSubMenu = function (e, t) {
            return a.menus[e].submenus = _.without(a.menus[e].submenus, t),
                a.menus[e].submenus
        }
        ,
        t.getQuickMenuData = function (e) {
            return angular.isString(e) ? a[e] : a
        }
        ,
        t.setQuickMenuData = function (e, t) {
            angular.isObject(e) ? angular.forEach(e, function (e, t) {
                a[t] = e
            }) : a[e] = t
        }
        ,
        t
}
]);

angular.module("quickMenuApp").service("serviceQuickMenuSubmit", ["serviceCommon", "serviceQuickMenuBase", function (e, t) {
    var a = {};
    return a.submit = function () {
        var a = {
            params: {},
            html: ""
        };
        a.params = t.getQuickMenuData(),
            e.stripHaskey(a.params);
        var n = $(".nav-menu").html();
        return n = n.replace(/<\!\-\-([^-]*?)\-\->/g, ""),
            n = n.replace(/ng\-[a-zA-Z-]+=\"[^\"]*\"/g, ""),
            n = n.replace(/ng\-[a-zA-Z]+/g, ""),
            n = n.replace(/[\t\n\n\r]/g, ""),
            a.html = n,
            a
    }
        ,
        a
}
]);