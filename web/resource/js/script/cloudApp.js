angular.module("cloudApp", ["we7app"]);

angular.module("cloudApp").controller("FileProcessorCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.files = a.files,
        e.fails = [];
    var n = e.files.length
        , i = 1
        , s = ""
        , o = a.tasknum && "" != a.type ? a.tasknum : 1;
    o > n && (o = 1);
    var r = function () {
        var o = e.files.pop();
        if (!o && i >= n)
            return util.message("文件同步完成，正在处理数据同步......"),
                void ("theme" == a.type ? location.href = "./index.php?c=cloud&a=process&step=schemas&t=" + a.appname + "&is_upgrade=" + a.is_upgrade : "webtheme" == a.type ? location.href = "./index.php?c=cloud&a=process&step=schemas&w=" + a.appname + "&is_upgrade=" + a.is_upgrade : location.href = "./index.php?c=cloud&a=process&step=schemas&m=" + a.appname + "&is_upgrade=" + a.is_upgrade + "&batch=1&account_type=" + a.account_type);
        e.file = o,
            e.pragress = i + "/" + n;
        var l = {
            path: o,
            type: a.type
        };
        t.post(location.href, l).success(function (t) {
            i++,
            "success" != t && (e.fails.push("[" + t + "] " + o),
                s = t),
                r()
        }).error(function () {
            i++,
                e.fails.push(o),
                r()
        })
    };
    for (j = 0; j < o; j++)
        r()
}
]).controller("SchemasProcessorCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.schemas = a.schemas,
        e.fails = [];
    a.is_module_install;
    var n = e.schemas.length
        , i = 1
        , s = function () {
        util.message("未能成功执行处理数据库, 请联系开发商解决. ")
    }
        , o = function () {
        var a = e.schemas.pop();
        if (!a)
            return e.fails.length > 0 ? void s() : void (location.href = "");
        e.schema = a,
            e.pragress = i + "/" + n;
        var r = {
            table: a
        };
        t.post(location.href, r).success(function (t) {
            i++,
            "success" != t && e.fails.push(a),
                t.message ? util.message(t.message) : o()
        }).error(function () {
            i++,
                e.fails.push(a),
                o()
        })
    };
    o()
}
]).controller("CloudDiagnoseCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.showToken = function () {
        util.message("Token:" + $("#token").val(), "", "info")
    }
        ,
        $(".js-checkip p").each(function () {
            var e = $(this);
            $.getJSON("./index.php?c=cloud&a=diagnose&do=testapi&ip=" + e.find("#serverdnsip").html(), function (t) {
                e.find("#checkresult").html(t.message.message)
            })
        }),
        $.ajax({
            type: "get",
            data: {
                date: a.date,
                version: a.version,
                siteurl: a.siteurl
            },
            url: "//s.we7.cc/index.php?c=site&a=diagnose&jsonpcallback=?",
            dataType: "jsonp",
            success: function (e) {
                "0" == e.check_time.errno ? $("#check-time").html('<i class="fa fa-check text-success"></i> 正常') : $("#check-time").html('<i class="fa fa-remove text-warning"></i> 异常，当前时间为：' + e.check_time.message.localtime + "; 服务器时间为：" + e.check_time.message.servertime),
                    "0" == e.check_touch.errno ? $("#check-touch").html('<i class="fa fa-check text-success"></i> 正常') : $("#check-touch").html('<i class="fa fa-remove text-warning"></i> 异常，' + e.check_touch.message)
            },
            error: function () {
                alert("fail")
            }
        })
}
]);