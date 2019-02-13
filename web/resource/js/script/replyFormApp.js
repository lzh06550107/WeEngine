angular.module("replyFormApp", ["we7app"]);

angular.module("replyFormApp").controller("KeywordReply", ["$scope", "$http", "config", function ($scope, $http, a) {

    $scope.reply = {
        advanceTrigger: false,
        status: true,
        showAdvance: false,
        keyword: {
            exact: "",
            indistinct: "",
            contain: "",
            regexp: ""
        },
        entry: a.replydata
    };

    if ($scope.reply.entry) {
        $scope.reply.entry.istop = $scope.reply.entry.displayorder >= 255 ? 1 : 0;
        $scope.reply.status = 1 == $scope.reply.entry.status;
        $scope.reply.entry.keywords || ($scope.reply.entry.keywords = []);
    } else {
        $scope.reply.entry = {
            istop: 0,
            displayorder: "",
            id: "",
            keywords: [],
            module: "",
            name: "",
            status: 1,
            uniacid: a.uniacid
        };
    }

    $scope.changeStatus = function () {
        $scope.reply.status = !$scope.reply.status;
    };

    $scope.changeKeywordType = function (type) {
        var t = parseInt(type);
        $scope.newKeyword = {
            type: t,
            content: ""
        };
        $("#keyword-indistinct").next().text("");
        $("#keyword-exact").next().text("");
        $("#keyword-regexp").next().text("");
    };

    $scope.showAddkeywordModal = function () {
        $("#addkeywordModal").modal("show");
        $scope.newKeyword = {
            type: 1,
            content: ""
        };
    };

    $scope.addNewKeyword = function () {
        $http.post("./index.php?c=platform&a=reply&do=post", {
            keyword: $scope.newKeyword.content
        }).success(function (t) {
            if (-2 == t.message.errno) {
                util.message(t.message.message);
                return false;
            }
            if (0 == t.message.errno) {
                $("#addkeywordModal").modal("hide");
                var a = parseInt($scope.newKeyword.type);
                switch (a) {
                    case 1:
                    case 2:
                        var n = $scope.newKeyword.content.replace(/，/g, ",").split(",");
                        angular.forEach(n, function (t) {
                            "" != t && $scope.reply.entry.keywords.push({
                                type: a,
                                content: t
                            })
                        });
                        break;
                    case 3:
                        $scope.reply.entry.keywords.push($scope.newKeyword)
                }
            }
        })
    };

    $scope.delKeyword = function (keyword) {
        var a = _.findIndex($scope.reply.entry.keywords, keyword);
        $scope.reply.entry.keywords = _.without($scope.reply.entry.keywords, $scope.reply.entry.keywords[a])
    };

    $scope.changeTriggerType = function () {
        "exact" == $scope.reply.advanceTrigger && ($scope.reply.advanceTrigger = false),
        "indistinct" == $scope.reply.advanceTrigger && ($scope.reply.advanceTrigger = true)
    };

    // 展开高级设置
    $scope.changeShowAdvance = function () {
        $scope.reply.showAdvance = !$scope.reply.showAdvance
    };

    $.isFunction(window.initReplyController) && window.initReplyController($scope, $http);

    $scope.submitForm = function () {
        if (0 == $scope.reply.entry.keywords.length) {
            util.message("请输入有效的触发关键字.");
            return false;
        }
        var a = angular.toJson($scope.reply.entry.keywords);
        $(':hidden[name="keywords"]').val(a);
        if ($.isFunction(window.validateReplyForm)) {
            if (!window.validateReplyForm($("#reply-form"), $, _, util, $scope, $http))
                return false;
            $(".reply-form-submit").click()
        } else
            $(".reply-form-submit").click()
    };

    // 显示emoji表情
    $scope.initEmotion = function (t) {
        util.emotion($("#emoji-exact"), $("#keyword-exact"), function (t, a, n) {
            $scope.newKeyword.content += t;
            $scope.$apply($scope.newKeyword);
        });
        util.emotion($("#emoji-indistinct"), $("#keyword-indistinct"), function (t, a, n) {
            $scope.newKeyword.content += t;
            $scope.$apply($scope.newKeyword);
        });
    };

    /**
     * 检查关键字
     * @param $event
     * @returns {boolean}
     */
    $scope.checkKeyWord = function ($event) {
        var n = $($event.target)
            , i = n.val().trim();
        if ("" == i) {
            n.next().text("");
            return false;
        }
        $http.post("./index.php?c=platform&a=reply&do=post", {
            keyword: i
        }).success(function (e) {
            if (0 != e.message.errno) {
                if (-2 == e.message.errno)
                    return n.next().html(e.message.message),
                        false;
                var t = $('input[name="rid"]').val()
                    , i = e.message.message
                    , s = "";
                for (rule in i)
                    if (t != i[rule].id) {
                        var o = i[rule].name ? i[rule].name : i[rule].id;
                        s += "<a href='" + a.links.postUrl + "&rid=" + i[rule].id + "' target='_blank'><strong class='text-danger'>" + o + "</strong></a>&nbsp;"
                    }
                "" != s && n.next().html("该关键字已存在于 " + s + " 规则中.")
            } else
                n.next().text("")
        })
    }
}
]);

angular.module("replyFormApp").controller("ApplyReply", ["$scope", function ($scope) {
    $scope.alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    $scope.activeLetter = "";

    $scope.searchModule = function (letter) {
        $scope.activeLetter = letter
    }
}
]);

angular.module("replyFormApp").controller("KeywordDisplay", ["$scope", "$http", function ($scope, $http) {
    $scope.changeStatus = function (e) {
        var a = $("#key-" + e).attr("class");
        $http.post("./index.php?c=platform&a=reply&do=change_keyword_status", {
            id: e
        }).success(function (t) {
            if (0 == t.message.errno) {
                a.match("switchOn") ? $("#key-" + e).removeClass("switchOn") : $("#key-" + e).addClass("switchOn");
                util.message("修改成功！");
            } else {
                util.message("网络错误，请稍候重试");
            }
        }).error(function (e) {
            util.message("网络错误，请稍候重试")
        })
    }
}
]);

angular.module("replyFormApp").controller("serviceDisplay", ["$scope", "config", "$http", function ($scope, config, a) {
    $scope.changeStatusUrl = config.url;
    $scope.service = config.service;

    $scope.changeStatus = function (id) {
        var t = file = id;
        a.post($scope.changeStatusUrl, {
            rid: t,
            file: file,
            m: "service"
        }).success(function (a) {
            if (0 == a.message.errno) {
                $scope.service[t].switch = "" == $scope.service[t].switch ? "checked" : "";
                location.reload();
            } else {
                util.message("网络错误，请稍候重试");
            }
        })
    };
}
]);

angular.module("replyFormApp").controller("SpecialDisplay", ["$scope", "config", "$http", function ($scope, config, a) {
    $scope.config = config;
    $scope.url = config.url;
    $scope.msgtypes = {
        image: $scope.config.image,
        voice: $scope.config.voice,
        video: $scope.config.video,
        shortvideo: $scope.config.shortvideo,
        location: $scope.config.location,
        trace: $scope.config.trace,
        link: $scope.config.link,
        merchant_order: $scope.config.merchant_order,
        ShakearoundUserShake: $scope.config.ShakearoundUserShake,
        ShakearoundLotteryBind: $scope.config.ShakearoundLotteryBind,
        WifiConnected: $scope.config.WifiConnected,
        qr: $scope.config.qr
    };
    $scope.switch_class = new Array;

    angular.forEach($scope.msgtypes, function (t, a) {
        $scope.switch_class[a] = "module" == t || "keyword" == t ? "switch switchOn special_switch" : "switch special_switch"
    });

    $scope.changestatus = function (type) {
        a.post($scope.url, {
            type: type
        }).success(function (a) {
            0 == a.message.errno ? ($scope.switch_class[type] = "switch switchOn special_switch" == $scope.switch_class[type] ? "switch special_switch" : "switch switchOn special_switch",
                util.message("修改成功！")) : util.message(a.message.message)
        })
    }
}
]);

angular.module("replyFormApp").controller("PostCtrl", ["$scope", "config", "$http", function ($scope, config, a) {
    require(["underscore", "util"], function (t, a) {
        window.initReplyController($scope)
    });

    $scope.switch_class = config.class;
    $scope.status = "module" == config.status || "keyword" == config.status ? config.status : "";

    $scope.change = function (t, status) {
        $scope.status = 0 == status ? 1 : 0;
        $scope.switch_class = 1 == $scope.status ? "switch switchOn special_switch" : "switch special_switch";
    }
}
]);

angular.module("replyFormApp").controller("WelcomeDisplay", ["$scope", function ($scope) {
    $.isFunction(window.initReplyController) && window.initReplyController($scope)
}
]);

angular.module("replyFormApp").controller("DefaultDisplay", ["$scope", function ($scope) {
    $.isFunction(window.initReplyController) && window.initReplyController($scope)
}
]);

angular.module("replyFormApp").directive("ngInvoker", ["$parse", function (e) {
    return function (e, t, a) {
        e.$eval(a.ngInvoker)
    }
}
]);

angular.module("replyFormApp").directive("ngMyEditor", function () {
    var e = {
        scope: {
            value: "=ngMyValue"
        },
        template: '<textarea id="editor" style="height:600px;width:100%;"></textarea>',
        link: function (t, a, n) {
            if (!a.data("editor")) {
                var i = {
                    autoClearinitialContent: false,
                    toolbars: [["fullscreen", "source", "preview", "|", "bold", "italic", "underline", "strikethrough", "forecolor", "backcolor", "|", "justifyleft", "justifycenter", "justifyright", "|", "insertorderedlist", "insertunorderedlist", "blockquote", "emotion", "link", "removeformat", "|", "rowspacingtop", "rowspacingbottom", "lineheight", "indent", "paragraph", "fontfamily", "fontsize", "|", "inserttable", "deletetable", "insertparagraphbeforetable", "insertrow", "deleterow", "insertcol", "deletecol", "mergecells", "mergeright", "mergedown", "splittocells", "splittorows", "splittocols", "|", "anchor", "map", "print", "drafts"]],
                    elementPathEnabled: false,
                    initialFrameHeight: 200,
                    focus: false,
                    maximumWords: 9999999999999,
                    autoFloatEnabled: false
                };
                e = UE.getEditor("editor", i),
                    a.data("editor", e),
                    e.addListener("contentChange", function () {
                        t.value = e.getContent().replace(/\&quot\;/g, '"'),
                        t.$root.$$phase || t.$apply("value")
                    }),
                    $(a).parents("form").submit(function () {
                        e.queryCommandState("source") && e.execCommand("source")
                    }),
                    e.addListener("ready", function () {
                        e && e.getContent() != t.value && e.setContent(t.value),
                            t.$watch("value", function (t) {
                                e && e.getContent() != t && e.setContent(t || "")
                            })
                    })
            }
        }
    };
    return e
});

angular.module("replyFormApp").filter("nl2br", ["$sce", function (e) {
    return function (t) {
        return t ? e.trustAsHtml(t.replace(/\n/g, "<br/>")) : ""
    }
}
]);