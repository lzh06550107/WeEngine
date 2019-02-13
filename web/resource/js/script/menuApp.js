angular.module("menuApp", ["we7app"]);

angular.module("menuApp").controller("menuDisplay", ["$scope", "config", "$http", function ($scope, config, a) {

    $scope.changeStatus = function (e, n, i) {
        n = 1 == n ? 2 : 1;
        3 == i && (1 == n ? $(".js-switch-" + e).addClass("switchOn") : 2 == n && $(".js-switch-" + e).removeClass("switchOn"));

        a.post(config.push_url, {
            id: e
        }).success(function (e) {
            0 == e.message.errno ? util.message(e.message.message, e.redirect) : 3 == i ? util.message(e.message.message, "error") : util.message(e.message.message, e.redirect, "error")
        });
    }
}
]);

angular.module("menuApp").controller("conditionMenuDesigner", ["$scope", "config", "$http", function ($scope, config, a) {
    current_menu_url = config.current_menu_url;

    require(["underscore", "jquery.ui", "jquery.caret", "district"], function (underscore, jqueryUi, jqueryCaret, a) {
        jqueryUi(".tpl-district-container").each(function () {
            var e = {};
            e.province = jqueryUi(this).find(".tpl-province")[0],
                e.city = jqueryUi(this).find(".tpl-city")[0];
            var n = {};
            n.province = jqueryUi(e.province).data("value"),
                n.city = jqueryUi(e.city).data("value"),
                a.render(e, n, {
                    withTitle: true,
                    wechat: true
                })
        });
        jqueryUi(".sub-designer-y").sortable({
            items: ".sub-js-sortable",
            axis: "y",
            cancel: ".sub-js-not-sortable"
        });
        jqueryUi(".designer-x").sortable({
            items: ".js-sortable",
            axis: "x"
        });
    });

    $scope.context = {};
    $scope.context.group = config.group;
    config.id > 0 && 1 != config.type && 1 == config.status && ($scope.context.group.disabled = 1);

    $scope.initGroup = function () {
        $scope.context.group = {
            title: "",
            type: config.type,
            button: [{
                name: "菜单名称",
                type: "click",
                url: "",
                key: "",
                media_id: "",
                appid: "",
                pagepath: "",
                sub_button: []
            }],
            matchrule: {
                sex: 0,
                client_platform_type: 0,
                group_id: -1,
                country: "",
                province: "",
                city: "",
                language: ""
            }
        }
    };

    $scope.context.group && $scope.context.group.button || $scope.initGroup();

    $scope.$watch("context.group.matchrule.province", function (e, t) {
        "" == e ? $(".tpl-city").hide() : $(".tpl-city").show()
    });

    $scope.context.activeIndex = 0;
    $scope.context.activeBut = $scope.context.group.button[$scope.context.activeIndex];
    $scope.context.activeItem = $scope.context.activeBut;
    $scope.context.activeType = 1;

    $scope.context.remove = function () {
        return !!confirm("删除默认菜单会清空所有菜单记录，确定吗？") && (location.href = config.delete_url, false)
    };

    $scope.context.submit = function (n) {
        var i = $scope.context.group;
        i.button = _.sortBy(i.button, function (e) {
            return $(':hidden[data-role="parent"][data-hash="' + e.$$hashKey + '"]').parent().index()
        });

        angular.forEach(i.button, function (e) {
            e.sub_button = _.sortBy(e.sub_button, function (e) {
                return $(':hidden[data-role="sub"][data-hash="' + e.$$hashKey + '"]').parent().index()
            })
        });
        $(':hidden[name="menu_media"]').val();
        if (!$.trim(i.title))
            return util.message("没有设置菜单组名称", "", "error"),
                false;
        if (2 == config.type && !(i.matchrule.sex || i.matchrule.client_platform_type || -1 != i.matchrule.group_id || i.matchrule.province || i.matchrule.city))
            return util.message("没有设置个性化菜单的匹配规则", "", "error"),
                false;
        if (i.button.length < 1)
            return util.message("没有设置菜单", "", "error"),
                false;
        var s = {
            name: "",
            action: ""
        };
        angular.forEach(i.button, function (e, t) {
            "" == $.trim(e.name) && (this.name += "第" + (t + 1) + "个一级菜单未设置菜单名称<br>"),
                e.sub_button.length > 0 ? angular.forEach(e.sub_button, function (a, n) {
                    "" == $.trim(a.name) && (this.name += "第" + (t + 1) + "个一级菜单中的第" + (n + 1) + "个二级菜单未设置菜单名称<br>"),
                    "view" == a.type && a.url.indexOf("http") < 0 && (this.action += "第" + (t + 1) + "个一级菜单中的第" + (n + 1) + "个二级菜单跳转链接缺少http标识<br>"),
                    "miniprogram" == a.type && ("" == $.trim(a.appid) && (this.action += "第" + (t + 1) + "个一级菜单中的第" + (n + 1) + "个二级菜单需设置APPID<br>"),
                    "" == $.trim(a.pagepath) && (this.action += "第" + (t + 1) + "个一级菜单中的第" + (n + 1) + "个二级菜单需设置页面跳转地址<br>"),
                    "" == $.trim(a.url) && (this.action += "第" + (t + 1) + "个一级菜单中的第" + (n + 1) + "个二级菜单需设置备用页跳转地址<br>")),
                    ("view" == a.type && "" == $.trim(a.url) || "click" == a.type && "" == a.media_id && "" == a.key || "view" != a.type && "click" != a.type && "miniprogram" != a.type && "" == $.trim(a.key)) && (this.action += "菜单【" + e.name + "】的子菜单【" + a.name + "】未设置操作选项. <br />")
                }, s) : ("view" == e.type && e.url.indexOf("http") < 0 && (this.action += "菜单【" + e.name + "】跳转链接缺少http标识. <br />"),
                "miniprogram" == e.type && ("" == $.trim(e.appid) && (this.action += "菜单【" + e.name + "】需设置APPID. <br />"),
                "" == $.trim(e.pagepath) && (this.action += "菜单【" + e.name + "】需设置页面跳转地址. <br />"),
                "" == $.trim(e.url) && (this.action += "菜单【" + e.name + "】需设置备用页跳转地址. <br />")),
                ("view" == e.type && "" == $.trim(e.url) || "click" == e.type && "" == e.media_id && "" == e.key || "view" != e.type && "click" != e.type && "miniprogram" != e.type && "" == $.trim(e.key)) && (this.action += "菜单【" + e.name + "】不存在子菜单并且未设置操作选项. <br />"))
        }, s),
            s.name ? util.message(s.title, "", "error") : s.action ? util.message(s.action, "", "error") : ($("#btn-submit").attr("disabled", true),
                a.post(location.href, {
                    group: i,
                    method: "post",
                    submit_type: n
                }).success(function (e) {
                    0 != e.message.errno ? ($("#btn-submit").attr("disabled", false),
                        util.message(e.message.message, "", "error")) : util.message("创建菜单成功. ", e.redirect, "success")
                }))
    };

    $scope.context.triggerActiveBut = function (t) {
        var a = $.inArray(t, $scope.context.group.button);
        if (-1 == a)
            return false;
        $scope.context.activeIndex = a,
            $scope.context.activeBut = $scope.context.group.button[$scope.context.activeIndex],
            $scope.context.activeItem = $scope.context.activeBut,
            $scope.context.activeType = 1,
            $scope.context.activeItem.forceHide = 0
    };

    $scope.context.editBut = function (t, n, i) {
        $scope.context.triggerActiveBut(n),
            t ? ($scope.context.activeItem = t,
                $scope.context.activeType = 2) : ($scope.context.activeItem = n,
                $scope.context.activeType = 1),
            1 == $scope.context.activeType && $scope.context.activeItem.sub_button.length > 0 ? $scope.context.activeItem.forceHide = 1 : $scope.context.activeItem.forceHide = 0,
        i && ($scope.context.activeItem.material = [],
        "view" != $scope.context.activeItem.type && "click" != $scope.context.activeItem.type && ($scope.context.activeItem.key ? current_type = $scope.context.activeItem.key.substr(0, 6) : current_type = "click",
            "module" == current_type ? $scope.context.activeItem.etype = "module" : $scope.context.activeItem.etype = "click"),
            a.post(current_menu_url, {
                current_menu: $scope.context.activeItem
            }).success(function (t) {
                0 == t.message.errno && $scope.context.activeItem.material.push(t.message.message)
            }))
    };

    $scope.context.addBut = function () {
        if (!($scope.context.group.button.length >= 3)) {
            $scope.context.group.button.push({
                name: "菜单名称",
                type: "click",
                url: "",
                key: "",
                media_id: "",
                appid: "",
                pagepath: "",
                sub_button: []
            });
            var t = $scope.context.group.button[$scope.context.group.button.length - 1];
            $scope.context.triggerActiveBut(t),
                $(".designer-x").sortable({
                    items: ".js-sortable",
                    axis: "x"
                })
        }
    };

    $scope.context.removeBut = function (t, a) {
        if (1 == a) {
            if (!confirm("将同时删除所有子菜单,是否继续"))
                return false;
            $scope.context.group.button = _.without($scope.context.group.button, t),
                $scope.context.triggerActiveBut($scope.context.group.button[0])
        } else
            $scope.context.activeBut.sub_button = _.without($scope.context.activeBut.sub_button, t),
                $scope.context.triggerActiveBut($scope.context.activeBut);
        $scope.context.activeItem.sub_button.length > 0 ? $scope.context.activeItem.forceHide = 1 : $scope.context.activeItem.forceHide = 0
    };

    $scope.context.addSubBut = function (t) {
        if (1 == $scope.context.group.disabled)
            return false;
        $scope.context.triggerActiveBut(t),
        $scope.context.activeBut.sub_button.length >= 5 || ($scope.context.activeBut.sub_button.push({
            name: "子菜单名称",
            type: "click",
            url: "",
            key: "",
            appid: "",
            pagepath: "",
            media_id: ""
        }),
            $(".sub-designer-y").sortable({
                items: ".sub-js-sortable",
                axis: "y",
                cancel: ".sub-js-not-sortable"
            }),
            $scope.context.activeItem = $scope.context.activeBut.sub_button[$scope.context.activeBut.sub_button.length - 1],
            $scope.context.activeType = 2,
            $scope.context.activeItem.forceHide = 0)
    };

    $scope.context.selectEmoji = function () {
        util.emojiBrowser(function (t) {
            var a = "::" + t.find("span").text() + "::";
            $("#title").setCaret(),
                $("#title").insertAtCaret(a),
                $scope.context.activeItem.name = $("#title").val(),
                $scope.$digest()
        })
    };

    $scope.context.select_link = function () {
        $(this).parent().prev();
        util.linkBrowser(function (a) {
            var n = config.site_url;
            "tel:" != a.substring(0, 4) ? (-1 == a.indexOf("http://") && -1 == a.indexOf("https://") && (a = n + "app" + (a = a.replace("./index.php?", "/index.php?"))),
                $scope.context.activeItem.url = a,
                $scope.$digest()) : util.message("自定义菜单不能设置为一键拨号")
        })
    };

    $scope.context.search = function () {
        var a = $("#ipt-forward").val();
        $.post(config.search_key_url, {
            key_word: a
        }, function (t) {
            var a = (t = $.parseJSON(t)).length
                , n = "";
            if (a > 0)
                for (var i = 0; i < a; i++)
                    n += '<li><a href="javascript:;">' + t[i] + "</a></li>";
            else
                n += '<li><a href="javascript:;" id="no-result">没有找到您输入的关键字</a></li>';
            $("#key-result ul").html(n),
                $('#key-result ul li a[id!="no-result"]').click(function () {
                    $("#ipt-forward").val($(this).html()),
                        $scope.context.activeItem.key = $(this).html(),
                        $("#key-result").hide()
                }),
                $("#key-result").show()
        })
    };

    $scope.context.select_mediaid = function (t, a) {
        var n = {
            type: t,
            isWechat: true,
            needType: 1
        };
        util.material(function (n) {
            $scope.context.activeItem.key = "",
                $scope.context.activeItem.media_id = n.media_id,
                $scope.context.activeItem.material = [],
                "keyword" == t ? ($scope.context.activeItem.material.push(n),
                    $scope.context.activeItem.material[0].type = "keyword",
                    $scope.context.activeItem.key = "keyword:" + n.content,
                    $scope.context.activeItem.media_id = "",
                "1" == a && ($scope.context.activeItem.material[0].etype = "click",
                    $scope.context.activeItem.material[0].name = n.name,
                    $scope.context.activeItem.material[0].content = n.content)) : "image" == t ? $scope.context.activeItem.material.push(n) : "news" == t ? $scope.context.activeItem.material.push(n) : "voice" == t ? $scope.context.activeItem.material.push(n) : "video" == t ? $scope.context.activeItem.material.push(n) : "module" == t && ($scope.context.activeItem.key = "module:" + n.name,
                    $scope.context.activeItem.material.push(n),
                    $scope.context.activeItem.material[0].module_type = $scope.context.activeItem.material[0].type,
                    $scope.context.activeItem.material[0].type = "module",
                    $scope.context.activeItem.material[0].etype = "module"),
                $scope.$digest()
        }, n)
    };

    $scope.context.editBut("", $scope.context.group.button[0], $scope.context.group.id)
}
]);