angular.module("massApp", ["we7app"]);

angular.module(["massApp"]).controller("MassSend", ["$scope", "$http", "config", function ($scope, $http, a) {

    $scope.showLog = function (e) {
        var n = parseInt(e)
            , i = $("#" + n);
        $http.post(a.logUrl, {
            tid: n,
            type: "mass",
            module: "task"
        }).success(function (e) {
            var t = "";
            (e = angular.toJson(e)).message && 0 != e.message.items.length ? $.each(e.message.items, function (e, a) {
                t += "<tr><td>" + a.createtime + " " + a.note + "</td></tr>"
            }) : t = '<tr><td class="text-center"><i class="fa fa-info-circle"></i> 暂无数据</td></tr>',
                i.popover({
                    html: true,
                    placement: "left",
                    trigger: "manual",
                    title: "触发日志",
                    content: '<table class="table-cron table">' + t + "</table>"
                }),
                i.popover("toggle")
        })
    };

    $scope.hideLog = function (e) {
        var t = parseInt(e);
        $("#" + t).popover("toggle")
    }
}
]);

angular.module("massApp").controller("MassPost", ["$scope", "config", function ($scope, config) {
    $scope.groups = config.groups;
    $scope.massdata = config.massdata;
    $scope.clock = config.massdata ? config.massdata.clock : "08:00";

    $.isFunction(window.initReplyController) && window.initReplyController($scope);
    1 == $scope.massdata.type ? $(".sendtime").show() : $(".sendtime").hide();
    $(".mass-type").change(function () {
        1 == $("select[name='type']").val() ? $(".sendtime").show() : $(".sendtime").hide()
    });

    $scope.checkSubmit = function ($event) {
        var selectedGroup = $(".mass-group").val();
        if ("" == selectedGroup)
            return $event.preventDefault(),
                util.message("请选择群发对象"),
                false;
        if (-1 == selectedGroup) {
            var group_fans_all = {
                id: -1,
                name: "全部粉丝",
                count: 0
            };
            $(':hidden[name="group"]').val(angular.toJson(group_fans_all))
        } else
            angular.forEach($scope.groups, function (e, t) {
                e.id == selectedGroup && $(':hidden[name="group"]').val(angular.toJson(e))
            });
        if ("" == $scope.clock)
            return $event.preventDefault(),
                util.message("请选择群发具体时间"),
                false;
        if ("0" == config.day) {
            var selectedTime = $scope.clock.split(":")
                , d = new Date
                , hours = d.getHours()
                , minutes = d.getMinutes();
            if (selectedTime[0] < hours || selectedTime[0] == hours && selectedTime[1] < minutes)
                return $event.preventDefault(),
                    util.message("发送时间不能小于当前时间"),
                    false
        }
        var reply_news = $(':hidden[name="reply[reply_news]"]').val()
            , reply_image = $(':hidden[name="reply[reply_image]"]').val()
            , reply_music = $(':hidden[name="reply[reply_music]"]').val()
            , reply_voice = $(':hidden[name="reply[reply_voice]"]').val()
            , reply_video = $(':hidden[name="reply[reply_video]"]').val();
        if ("" == reply_news && "" == reply_image && "" == reply_music && "" == reply_voice && "" == reply_video)
            return $event.preventDefault(),
                util.message("请选择群发素材"),
                false;
        if ("" != reply_news) {
            if ("perm" != (reply_news = eval("(" + reply_news + ")")).model)
                return $event.preventDefault(),
                    util.message("群发不支持本地/服务器素材，请选择微信素材"),
                    false;
            $(':hidden[name="reply[reply_news]"]').val(reply_news.mediaid)
        }
        "" != reply_image && (reply_image = eval("(" + reply_image + ")"),
            $(':hidden[name="reply[reply_image]"]').val(reply_image)),
        "" != reply_music && (reply_music = eval("(" + reply_music + ")"),
            $(':hidden[name="reply[reply_music]"]').val(reply_music)),
        "" != reply_voice && (reply_voice = eval("(" + reply_voice + ")"),
            $(':hidden[name="reply[reply_voice]"]').val(reply_voice)),
        "" != reply_video && (reply_video = eval("(" + reply_video + ")"),
            $(':hidden[name="reply[reply_video]"]').val(reply_video.mediaid))
    };

    $(".clockpicker").clockpicker({
        autoclose: true
    });
}
]);

angular.module("massApp").controller("MassDisplay", ["$scope", "$http", "config", function (e, t, a) {
    e.days = a.days,
        e.delMass = function (a, n) {
            var a = parseInt(a)
                , n = parseInt(n);
            return !!confirm("确认清空这条群发吗?") && (t.post("./index.php?c=platform&a=mass&do=del", {
                id: a
            }).success(function (t, a) {
                t.message.errno ? util.message("清空群发失败:<br>" + t.message.message, "", "error") : e.days[n].info = ""
            }),
                false)
        }
        ,
        e.toEdit = function (e) {
            var e = parseInt(e);
            window.location.href = "./index.php?c=platform&a=mass&do=post&day=" + e
        }
        ,
        e.preview = function (a) {
            var a = parseInt(a);
            if (!e.days[a].info)
                return util.message("群发内容错误！"),
                    false;
            var n = e.days[a].info.media_id
                , i = e.days[a].info.msgtype;
            $("#modal-view").modal("show"),
                $("#modal-view .btn-view").unbind().click(function () {
                    var e = $.trim($("#modal-view #wxname").val());
                    return e ? ($("#modal-view").modal("hide"),
                        t.post("./index.php?c=platform&a=mass&do=preview", {
                            media_id: n,
                            wxname: e,
                            type: i
                        }).success(function (e) {
                            0 != e.message.errno ? util.message(e.message.message) : util.message("发送成功", "", "success")
                        }),
                        false) : (util.message("微信号不能为空", "", "error"),
                        false)
                })
        }
}
]);