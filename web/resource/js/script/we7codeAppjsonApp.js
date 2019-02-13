angular.module("we7codeAppjsonApp", ["we7app"]);

angular.module("we7codeAppjsonApp").controller("code_appjson_ctrl", ["$scope", "$q", "config", "$http", function (e, t, a, n) {
    var i = a.default_appjson
        , s = a.save_url
        , o = a.default_url
        , r = a.convert_img_url;
    angular.isString(i) && (i = JSON.parse(i)),
    i || (i = {
        pages: {},
        windows: {}
    });
    var l = i.hasOwnProperty("tabBar") ? i.tabBar : {
        list: []
    };
    l && !l.list && (l.list = []),
    l && !l.isSystemTabBar && (l.isSystemTabBar = 1),
    i && i.windows && i.windows.navigationBarTitleText && i.windows.navigationBarTitleText.indexOf("微擎") && (i.windows.navigationBarTitleText = "小程序"),
        e.pages = i.pages,
        e.window = i.window,
        e.tabBar = l,
        $("body").on("click", ".js-image", function () {
            var t = $(this).data("index")
                , i = "0" == $(this).data("selected") ? "iconPath" : "selectedIconPath";
            util.image({}, function (s) {
                n.post(r, {
                    version_id: a.version_id,
                    att_id: s.id
                }).then(function (a) {
                    0 == a.data.message.errno && (e.tabBar.list[t][i] = a.data.message.message)
                })
            })
        }),
        e.toJson = function () {
            return {
                pages: e.pages,
                window: e.window,
                tabBar: e.tabBar
            }
        }
        ,
        e.iconPath = function (e) {
            return e.iconPath
        }
        ,
        e.save = function (t) {
            var i = e.toJson();
            n.post(s, {
                json: i,
                version_id: a.version_id
            }).then(function () {
                alert("保存成功")
            })
        }
        ,
        e.add = function () {
            e.tabBar.list.push({
                iconSelectedPath: "",
                iconPath: "",
                pagePath: e.pages[0],
                text: ""
            })
        }
        ,
        e.del = function (t) {
            e.tabBar.list.splice(t, 1)
        }
        ,
        e.default = function () {
            n.post(o, {
                version_id: a.version_id
            }).then(function () {
                alert("保存成功"),
                    window.location.reload()
            })
        }
        ,
        util.colorpicker(".js-color", function () {
        })
}
]);