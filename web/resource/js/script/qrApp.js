angular.module("qrApp", ["we7app"]);

angular.module("qrApp").controller("QrDisplay", ["$scope", function ($scope) {
    $(".js-clip").each(function () {
        util.clip(this, $(this).attr("data-url"))
    })
}
]);

angular.module("qrApp").controller("QrPost", ["$scope", "$http", "config", function ($scope, $http, a) {
    a.id > 0 ? $scope.type = 0 : $scope.type = 1;

    $(".we7-select").change(function () {
        var t = $(".we7-select").val();
        $scope.type = 1 == t ? 1 : 2;
        $scope.$apply($scope.type);
    });

    $.isFunction(window.initReplyController) && window.initReplyController($scope, $http);
    $(".submit").on("click", function () {
        return !!$scope.checkSubmit();
    });

    $scope.checkSubmit = function () {
        if ("" == $(":text[name='scene-name']").val()) {
            util.message("抱歉，二维码名称为必填项，请返回修改！");
            return false;
        }
        if (1 == $scope.type) {
            if ("" == $(":text[name='expire-seconds']").val())
                return util.message("抱歉，临时二维码过期时间为必填项，请返回修改！"),
                    false;
            if (!/^\+?[1-9][0-9]*$/.test($(":text[name='expire-seconds']").val()))
                return util.message("抱歉，临时二维码过期时间必须为正整数，请返回修改！"),
                    false;
            if (parseInt($(":text[name='expire-seconds']").val()) < 30 || parseInt($(":text[name='expire-seconds']").val()) > 2592e3)
                return util.message("抱歉，临时二维码过期时间必须在30-2592000秒之间，请返回修改！"),
                    false
        }
        if (2 == $scope.type) {
            var a = $.trim($("#scene_str").val());
            if (!a)
                return util.message("场景值不能为空！"),
                    false;
            if (/^\d+$/g.test(a))
                return util.message("场景值不能是数字！"),
                    false;
            $http.post("{php echo url('platform/qr/check_scene_str')}", {
                scene_str: a
            }).success(function (e) {
                if (1 == e.message.errno && "repeat" == e.message.message)
                    return util.message("场景值和现有二维码场景值重复，请修改场景值"),
                        false
            })
        }
        return "" != $(":hidden[name='reply[reply_keyword]']").val() || (util.message("抱歉，请选择二维码要触发的关键字！"),
            false)
    }
}
]);

angular.module("qrApp").controller("UrlToQr", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.copyLink = "";

    $scope.selectUrl = function () {
        var e = $("#longurl");
        util.linkBrowser(function (t) {
            var n = a.site_url;
            if ("tel:" == t.substring(0, 4))
                return util.message("长链接不能设置为一键拨号"),
                    false;
            -1 == t.indexOf("http://") && -1 == t.indexOf("https://") && (t = n + "app" + (t = t.replace("./index.php?", "/index.php?"))),
                e.val(t)
        })
    };

    $scope.transformUrl = function () {
        var n = $("#longurl").val().trim();
        if ("" == n)
            return util.message("请输入长链接"),
                false;
        if (-1 == n.indexOf("http://") && -1 == n.indexOf("https://") && -1 == n.indexOf("weixin://"))
            return util.message("请输入有效的长链接"),
                false;
        var i = $("#change")
            , s = a.img_url;
        i.html('<i class="fa fa-spinner"></i> 转换中'),
            $http.post(a.transform_url, {
                longurl: n
            }).success(function (t) {
                if (-1 == t.message.errno)
                    return util.message(t.message.message),
                        i.html("立即转换"),
                        false;
                $("#shorturl").val(t.message.message.short_url),
                    $scope.copyLink = t.message.message.short_url,
                    $(".url-short").next().attr({
                        "data-url": t.message.message.short_url
                    }).removeClass("disabled"),
                    $("#qrsrc").attr("src", s + "url=" + t.message.message.short_url),
                    $(".qr-img").next().removeClass("disabled"),
                    i.html("立即转换")
            })
    };

    $scope.downQr = function () {
        var e = $("#shorturl").val()
            , t = a.down_url;
        window.location.href = t + "qrlink=" + e;
    };

    $scope.success = function (e) {
        var e = parseInt(e)
            ,
            t = $('<span class="label label-success" style="position:absolute;height:33px;line-height:28px;"><i class="fa fa-check-circle"></i> 复制成功</span>')
            , a = $("#copy-" + e).next().html();
        (!a || a.indexOf('<span class="label label-success" style="position:absolute;z-index:10"><i class="fa fa-check-circle"></i> 复制成功</span>') < 0) && $("#copy-" + e).after(t),
            setTimeout(function () {
                t.remove()
            }, 2e3)
    }
}
]);

angular.module("qrApp").controller("QrStatistics", ["$scope", "$http", "config", function (e, t, a) {
    e.link = a.link,
        e.changeStatus = function () {
            t.post(e.link.changeStatus, {}).success(function (e) {
                0 == e.message.errno ? location.reload() : util.message(e.message.message, e.redirect, "ajax")
            })
        }
}
]);