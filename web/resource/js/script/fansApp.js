angular.module("fansApp", ["we7app"]).value("config", {
    running: false,
    syncState: "",
    downloadState: ""
}).controller("DisplayCtrl", ["$scope", "$http", "config", "$q", function ($scope, $http, a, $q) {
    $scope.config = a;
    $scope.addTagUrl = a.addTagUrl;
    $scope.tag = "";
    $scope.searchMod = a.searchMod;
    $scope.closeValue = 0;
    $scope.registerUrl = a.registerUrl;
    $scope.register = [];
    $scope.sync_member = 0;

    $scope.switchSearchMod = function (t) {
        $scope.searchMod = t;
        $scope.$apply($scope.searchMod);
    };

    $scope.addTag = function () {
        $http.post($scope.addTagUrl, {
            tag: $scope.tag
        }).success(function (e) {
        });
    };

    $scope.registerMember = function (openid) {
        $scope.register.openid = openid;
        $scope.register.password = "";
        $scope.register.repassword = "";
    };

    $scope.register = function () {
        $(".modal").modal("hide");

        if ("" == $scope.register.password) {
            util.message("新密码不可为空！");
            return false;
        } else if ("" == $scope.register.repassword) {
            util.message("确认新密码不可为空！");
            return false;
        } else if ($scope.register.password != $scope.register.repassword) {
            util.message("两次密码不一致！");
            return false;
        } else {
            $http.post($scope.registerUrl, {
                password: $scope.register.password,
                repassword: $scope.register.repassword,
                openid: $scope.register.openid
            }).success(function (e) {
                0 == e.message.errno ? util.message(e.message.message, e.redirect, "ajax") : util.message(e.message.message);
            });
        }
    };

    // 是否同步会员，就是粉丝自动注册成为会员
    $scope.syncMember = function () {
        $scope.sync_member = 0 == $scope.sync_member ? 1 : 0;
    };

    // 同步全部粉丝信息
    $scope.downloadFans = function (n, i) {
        var matches, regx = new RegExp("(^| )we7:sync_fans_pindex:" + window.sysinfo.uniacid + "=([^;]*)(;|$)");
        if (matches = document.cookie.match(regx)) {
            $scope.sync("all", {
                pageindex: unescape(matches[2])
            });
            return false;
        }
        i || (i = 0);

        if (void 0 == n) {
            n = "";
            util.message("正在下载粉丝数据...");
        }
        $http.post(a.syncAllUrl, {
            next_openid: n
        }).success(function (t) {
            if (0 != t.message.errno) {
                var a = "";
                return "string" == typeof t.message ? a = t.message : "string" == typeof t.message.message && (a = t.message.message),
                    util.message("粉丝下载失败。具体原因：" + a),
                    false
            }
            if (i += parseInt(t.message.message.count),
            t.message.message.total <= i || !t.message.message.count && !t.message.message.next)
                return $scope.sync("all"),
                    false;
            $scope.downloadFans(t.message.message.next, i)
        })
    };

    // 同步粉丝信息
    $scope.sync = function (type, options) {
        if ("all" == type) { // 同步所有粉丝信息
            if (!options) {
                (options = {}).pageindex = 0;
                options.total = 0;
                util.message("粉丝数据下载完成。开始更新粉丝数据...", "", "success");
            }
            options.type = "all";
            options.sync_member = $scope.sync_member;
        } else { // 同步选中粉丝信息
            options = {
                type: "check",
                openids: [],
                sync_member: $scope.sync_member
            };
            $(".openid:checked").each(function () {
                options.openids.push(this.value);
            });
            if (0 == options.openids.length) {
                util.message("请选择粉丝", "", "info");
                return false;
            }
            util.message("正在同步粉丝数据请不要关闭浏览器...")
        }

        if (options.pageindex > 0 && 0 == $scope.closeValue) {
            $("#modal-message").modal("hide");
            util.dialog("更新进度", '<div class="progress"> <div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="' + options.pageindex / options.total * 100 + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + options.pageindex / options.total * 100 + '%"><span class="sr-only"></span></div></div>', "", {
                containerName: "link-container"
            }).modal("show");
        }
        $(".close").click(function () {
            $scope.closeValue = 1
        });

        var defered = $q.defer();
        defered.promise.then(function () {
            $http.post($scope.config.syncUrl, options).success(function (t) {
                if (void 0 == t.message) {
                    util.message("更新失败！可能是由于你当前网络不稳定，请稍后再试。", "", "info");
                    return false;
                }
                if (0 == t.message.errno) {
                    if ("success" == t.message.message || t.message.message.total == t.message.message.pageindex) {
                        util.message("同步粉丝数据成功", a.msgUrl, "success");
                        return false;
                    }
                    $scope.sync("all", {
                        pageindex: t.message.message.pageindex,
                        total: t.message.message.total
                    });
                } else {
                    if (++options.pageindex > options) {
                        util.message("同步粉丝数据成功", a.msgUrl, "success");
                        return false;
                    }
                    $scope.sync("all", {
                        pageindex: ++options.pageindex,
                        total: options.total
                    })
                }
            })
        }, function (e) {
        });
        1 == $scope.closeValue ? $scope.closeValue = 0 : defered.resolve();
    }
}
]).controller("chatsCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    // 这个定义在window对象上？？
    send = function () {
        types = [];
        types.text = $('[name="reply[reply_basic]"]').val();
        types.news = $('[name="reply[reply_news]"]').val();
        types.image = $('[name="reply[reply_image]"]').val();
        types.music = $('[name="reply[reply_music]"]').val();
        types.voice = $('[name="reply[reply_voice]"]').val();
        types.video = $('[name="reply[reply_video]"]').val();
        types.wxcard = $('[name="reply[reply_wxcard]"]').val();
        for (type in types)
            if ("" != types[type]) {
                msg_type = type;
                msg_content = types[type];
                break;
            }
        $.post(a.sendurl, {
            type: msg_type,
            content: msg_content
        }, function (t) {

            if (-1 == (t = $.parseJSON(t)).message.errno) {
                util.message("由于粉丝48小时内未与你互动，你不能主动与粉丝聊天", "", "info")
            } else {
                $(".del-basic-media").remove();
                $scope.chatLogs.unshift({
                    flag: 1,
                    createtime: t.message.message.createtime,
                    content: t.message.message.content,
                    msgtype: t.message.message.msgtype
                });
                $scope.$apply();
            }
        })
    };

    $scope.chatLogs = a.chatLogs;
    // 在页面卸载之前发出
    window.onbeforeunload = function () {
        $.get(a.endurl, {}, function (e) {
        })
    }
}
]);