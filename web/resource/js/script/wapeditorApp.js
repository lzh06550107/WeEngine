angular.module("wapeditorApp", ["we7app"]);

angular.module("wapeditorApp").controller("CommonCtrl", ["$scope", "$sanitize", function ($scope, $sanitize) {
}
]);

angular.module("wapeditorApp").directive("we7ContextMenu", ["serviceBase", "$timeout", function (serviceBase, $timeout) {

    return {
        link: function (a, n, i) {
            function s(e, t) {
                var a = $(".right-hand-menu")
                    , n = a.parent().position();

                e -= n.left;
                t -= n.top;
                a.css({
                    left: e + "px",
                    top: t + "px"
                });
                a.addClass("show-menu");
            }

            if (!$(".right-hand-menu").length) {
                $("body").append('<menu class="right-hand-menu"> <li class="menu-item menu-item-del"> <button type="button" class="menu-btn"> <i class="fa fa-folder-open"></i> <span class="menu-text">删除</span> </button> </li> <li class="menu-item menu-item-top"> <button type="button" class="menu-btn"> <i class="fa fa-folder-open"></i> <span class="menu-text">置顶</span> </button> </li> <li class="menu-item menu-item-up"> <button type="button" class="menu-btn"> <i class="fa fa-folder-open"></i> <span class="menu-text">上移一层</span> </button> </li> <li class="menu-item menu-item-down"> <button type="button" class="menu-btn"> <i class="fa fa-folder-open"></i> <span class="menu-text">下移一层</span> </button> </li> <li class="menu-item menu-item-bottom"> <button type="button" class="menu-btn"> <i class="fa fa-folder-open"></i> <span class="menu-text">置底</span> </button> </li> </menu>');

                $(".modules").on("contextmenu", function (e) {
                    e.preventDefault()
                }),
                    $(document).on("mouseup", function () {
                        $(".right-hand-menu").removeClass("show-menu")
                    }),
                    $(".right-hand-menu").on("click", ".menu-item-del", function () {
                        var n = $(".right-hand-menu").data("item-index");
                        serviceBase.deleteItem(n),
                            $timeout(function () {
                                a.$apply()
                            }, 100)
                    }).on("click", ".menu-item-top", function () {
                        a.savePagePosition();
                        var n, i = $(".right-hand-menu").data("item-index"), s = [];
                        for (var o in a.activeModules)
                            a.activeModules[o].index == i ? n = angular.copy(a.activeModules[o]) : s.push(a.activeModules[o]);
                        s.push(n),
                            serviceBase.setBaseData("activeModules", s),
                            $timeout(function () {
                                a.$apply()
                            }, 100)
                    }).on("click", ".menu-item-up", function () {
                        a.savePagePosition();
                        var n, i, s = $(".right-hand-menu").data("item-index"), o = a.activeModules.length;
                        for (var r in a.activeModules)
                            if (a.activeModules[r].index == s) {
                                if (parseInt(r) + 1 == o)
                                    break;
                                n = angular.copy(a.activeModules[r]),
                                    i = angular.copy(a.activeModules[parseInt(r) + 1]),
                                    a.activeModules[r] = i,
                                    a.activeModules[parseInt(r) + 1] = n,
                                    serviceBase.setBaseData("activeModules", a.activeModules);
                                break
                            }
                        $timeout(function () {
                            a.$apply()
                        }, 100)
                    }).on("click", ".menu-item-down", function () {
                        a.savePagePosition();
                        var n, i, s = $(".right-hand-menu").data("item-index");
                        for (var o in a.activeModules)
                            if (a.activeModules[o].index == s) {
                                if (o <= 1)
                                    break;
                                n = angular.copy(a.activeModules[o]),
                                    i = angular.copy(a.activeModules[o - 1]),
                                    a.activeModules[o] = i,
                                    a.activeModules[parseInt(o) - 1] = n,
                                    serviceBase.setBaseData("activeModules", a.activeModules);
                                break
                            }
                        $timeout(function () {
                            a.$apply()
                        }, 100)
                    }).on("click", ".menu-item-bottom", function () {
                        a.savePagePosition();
                        var n, i = $(".right-hand-menu").data("item-index"), s = [];
                        for (var o in a.activeModules)
                            0 != o && (a.activeModules[o].index == i ? n = angular.copy(a.activeModules[o]) : s.push(a.activeModules[o]));
                        s.unshift(n),
                            s.unshift(a.activeModules[0]),
                            serviceBase.setBaseData("activeModules", s),
                            $timeout(function () {
                                a.$apply()
                            }, 100)
                    });
            }

            n.on("contextmenu", function (e) {
                s(e.pageX, e.pageY);
                var t = n.parents("div[id^='module-']").attr("index");
                $(".right-hand-menu").data("item-index", t)
            });
        }
    };
}
]);

angular.module("wapeditorApp").directive("we7Nobar", function () {
    return {
        link: function (e, t, a) {
            t.on("mousedown", function (e) {
                $(".bar").hide()
            })
        }
    }
}).directive("we7Drag", ["serviceBase", "$timeout", function (serviceBase, $timeout) {
    return {
        compile: function (t, a) {
            var n = $('<div class="bar bar-n ui-resizable-handle ui-resizable-n we7-hide"></div>')
                , i = $('<div class="bar bar-s ui-resizable-handle ui-resizable-s we7-hide"></div>')
                , s = $('<div class="bar bar-e ui-resizable-handle ui-resizable-e we7-hide"></div>')
                , o = $('<div class="bar bar-w ui-resizable-handle ui-resizable-w we7-hide"></div>');
            return t.append(n).append(i).append(s).append(o),
                function (t, a, n) {
                    var i = a.parents("div[ng-controller$='Ctrl']").eq(0);
                    i.on("mousedown", function (e) {
                        $(".bar").hide(),
                            $(this).find(".bar").show(),
                            $(this).find(".bar-radius").show(),
                            $(this).draggable({
                                containment: ""
                            })
                    }),
                        i.mousedown();
                    var s = serviceBase.getBaseData("activeItem");
                    if (s.id) {
                        var o = s.id.replace(/[a-z]/, function (e) {
                            return e.toLocaleUpperCase()
                        }).replace(/^[a-z]/, function (e) {
                            return e.toLocaleUpperCase()
                        }) + "Ctrl";
                        if ("HeaderCtrl" != o) {
                            var r = $("#module-" + s.index).find("div[ng-controller='" + o + "']");
                            r.on("mousedown", function (e) {
                                $(".bar").hide(),
                                    $(this).find(".bar").show(),
                                    $(this).find(".bar-radius").show(),
                                    $(this).draggable({
                                        containment: ""
                                    })
                            }),
                                r.mousedown()
                        } else
                            $(".bar").hide()
                    }
                }
        }
    }
}
]).directive("we7Resize", function () {
    return {
        compile: function (e, t) {
            var a = $('<div class="bar-radius radius-s we7-hide"></div>'),
                n = $('<div class="bar bar-nw bar-radius radius-s ui-resizable-handle ui-resizable-nw we7-hide"></div>'),
                i = $('<div class="bar bar-se bar-radius radius-s ui-resizable-handle ui-resizable-se we7-hide"></div>'),
                s = $('<div class="bar bar-sw bar-radius radius-s ui-resizable-handle ui-resizable-sw we7-hide"></div>'),
                o = $('<div class="bar bar-ne bar-radius radius-s ui-resizable-handle ui-resizable-ne we7-hide"></div>');

            e.find(".bar-n,.bar-s,.bar-e,.bar-w").append(a);
            e.append(i).append(s).append(o).append(n);
            return function (e, t, a) {
                t.parents("div[ng-controller$='Ctrl']").eq(0).on("mousedown", function (e) {
                    var t = {
                        n: $(this).find(".bar-n"),
                        s: $(this).find(".bar-s"),
                        e: $(this).find(".bar-e"),
                        w: $(this).find(".bar-w"),
                        nw: $(this).find(".bar-nw"),
                        se: $(this).find(".bar-se"),
                        sw: $(this).find(".bar-sw"),
                        ne: $(this).find(".bar-ne")
                    };
                    $(this).resizable({
                        handles: t,
                        aspectRatio: true,
                        onlyCorner: true
                    })
                })
            }
        }
    }
}).directive("we7Rotate", function () {
    return {
        link: function (e, t, a) {
            t.prepend('<div class="bar bar-rotate bar-radius radius-s ui-resizable-handle we7-hide"></div> <div class="bar bar-line ui-resizable-handle we7-hide"></div>');
            var n = t.parents("div[ng-controller$='Ctrl']").eq(0);
            n.on("mousedown", function (t) {
                var a, i = n.find(".bar-rotate").get(0), s = n.children(), o = new Hammer(i), r = {};
                o.get("pan").set({
                    threhold: 0
                }),
                    o.on("panstart", function (e) {
                        $("body").css({
                            "user-select": "none",
                            cursor: 'url("./resource/images/mouserotate.ico"), default'
                        }),
                            r = {
                                x: s.offset().left + s.width() / 2,
                                y: s.offset().top + s.height() / 2
                            }
                    }),
                    o.on("panmove", function (t) {
                        var n = t.center
                            , i = n.x - r.x
                            , o = n.y - r.y + $(window).scrollTop()
                            , l = Math.abs(i / o);
                        a = Math.atan(l) / (2 * Math.PI) * 360,
                            i > 0 && 0 > o ? a = 360 + a : i > 0 && o > 0 ? a = 180 - a : 0 > i && o > 0 ? a = 180 + a : 0 > i && 0 > o && (a = 360 - a),
                        a > 360 && (a -= 360),
                            a = parseInt(a),
                            s.css({
                                transform: "rotateZ(" + a + "deg)"
                            }),
                            e.activeItem.params.borderStyle.transform = a,
                            e.$apply()
                    }),
                    o.on("panend", function () {
                        $("body").css({
                            "user-select": "initial",
                            cursor: "default"
                        })
                    })
            })
        }
    }
});

angular.module("wapeditorApp").directive("we7EditKeyMap", ["serviceBase", "$timeout", function (e, t) {
    return {
        restrict: "A",
        link: function (a, n, i) {
            $(document).unbind("keydown").keydown(function (n) {
                var i = e.getBaseData("activeModules")
                    , s = e.getBaseData("activeItem")
                    , o = _.findIndex(i, s);
                if (46 == n.keyCode && o > 0 && (n.preventDefault(),
                confirm("删除后需要重新提交才会生效，确认吗？") && (i.splice(o, 1),
                    e.setBaseData({
                        activeModules: i,
                        activeItem: i[0]
                    }))),
                37 == n.keyCode || 38 == n.keyCode || 39 == n.keyCode || 40 == n.keyCode) {
                    _.isEmpty(s) || n.preventDefault();
                    37 == n.keyCode && (s.params.positionStyle.left -= 1),
                    38 == n.keyCode && (s.params.positionStyle.top -= 1),
                    39 == n.keyCode && (s.params.positionStyle.left += 1),
                    40 == n.keyCode && (s.params.positionStyle.top += 1)
                }
                t(function () {
                    a.$apply()
                })
            }).unbind("keyup").keyup(function () {
                a.$apply()
            })
        }
    }
}
]);

angular.module("wapeditorApp").directive("we7Pagelength", function () {
    return {
        replace: true,
        templateUrl: "directive-pagelength-pagelength.html",
        link: function (e, t, a) {
        }
    }
});

angular.module("wapeditorApp").directive("we7Style", ["serviceSetStyle", function (e) {
    return {
        templateUrl: "directive-style-style.html"
    }
}
]);

angular.module("wapeditorApp").directive("we7Svger", function () {
    return {
        scope: {
            we7svg: "=we7Svg"
        },
        link: function (e, t, a) {
            e.$watch("we7svg", function () {
                for (var a = $(e.we7svg), n = 0; a.length > n; n++)
                    if ("svg" == a[n].tagName) {
                        var i = a[n];
                        $(i).attr({
                            width: "100%",
                            height: "100%"
                        }),
                            $(i)[0].setAttribute("preserveAspectRatio", "none"),
                            t.html(i);
                        break
                    }
            })
        }
    }
});

angular.module("wapeditorApp").factory("serviceBase", ["$rootScope", "widget", "config", "serviceCommon", "serviceSetStyle", "$timeout",

    function ($rootScope, widget, a, serviceCommon, serviceSetStyle, $timeout) {
        var serviceBase = {}
            , l = {
            modules: [],
            editors: [],
            activeModules: [],
            index: 0,
            activeItem: {},
            activeIndex: 0,
            pageLength: 1,
            isNew: true
        };

        serviceBase.setModules = function (e, a) {

            if (_.isNull(e)) {
                l.modules = widget;
            }
            if (_.isArray(e))
                for (i in e) {
                    var n;
                    (s = _.findIndex(widget, {
                        id: e[i]
                    })) > -1 && (n = angular.copy(widget[s]),
                        l.modules.push(n))
                }
            if (_.isArray(a))
                for (i in a) {
                    var s = _.findIndex(l.modules, {
                        id: a[i]
                    });
                    s > -1 && (l.modules[s].defaultshow = true)
                }
            return l.modules
        };

        serviceBase.setEditors = function (e) {
            l.editors.push(e)
        };

        serviceBase.updateActiveModules = function (e, t) {
            t && l.activeModules.push({
                id: e.id,
                name: e.name,
                params: angular.copy(e.params),
                originParams: angular.copy(e.params),
                issystem: e.issystem ? 1 : 0,
                index: l.index,
                displayorder: e.displayorder ? e.displayorder : l.activeModules.length
            })
        };

        serviceBase.initActiveModules = function (e) {
            return l.activeModules = e ? angular.copy(e) : [],
                l.activeModules
        };

        serviceBase.addItem = function (id, type) {
            angular.forEach(l.modules, function (a, n) {
                if (a.id == id) {
                    var i = {};
                    i = angular.copy(a);
                    -1 == $.inArray(id, l.editors) && (serviceBase.setEditors(a.id),
                        serviceBase.broadcast("editors"));
                    "header" != id && "UCheader" != id && (i.params = "uc" === type ? serviceSetStyle.UcInitStyleParams(a.params) : serviceSetStyle.initStyleParams(a.params));
                    serviceBase.updateActiveModules(i, true);
                    l.activeIndex = _.findIndex(l.activeModules, {
                        index: parseInt(l.index)
                    });
                    l.activeItem = "uc" === type ? l.activeModules[l.index] : l.activeModules[l.activeIndex];
                    l.index++;
                    serviceBase.triggerActiveItem(l.activeIndex);
                    $(".app-text-edit").find(".nav-tabs").find("a[href='#attribute']").click();
                    serviceBase.broadcast("activeItem");
                    serviceBase.broadcast("activeModules");
                    "header" != id && "UCheader" != id && serviceSetStyle.initSetStyle(i.params)
                    return void 0;
                }
            })
        };

        serviceBase.editItem = function (e) {
            (e = _.findIndex(l.activeModules, {
                index: parseInt(e)
            })) > -1 && (l.activeIndex = e,
                l.activeItem = l.activeModules[e]),
            -1 == $.inArray(l.activeItem.id, l.editors) && (serviceBase.setEditors(l.activeItem.id),
                serviceBase.broadcast("editors")),
                serviceBase.triggerActiveItem(e),
                $(".app-text-edit").find(".nav-tabs").find("a[href='#attribute']").click(),
                serviceBase.broadcast("activeItem")
        };

        serviceBase.deleteItem = function (e) {
            if (confirm("删除后需要重新提交才会生效，确认吗？")) {
                var t = $("#module-" + e).prev().attr("index")
                    , e = _.findIndex(l.activeModules, {
                    index: parseInt(e)
                });
                l.activeModules = _.without(l.activeModules, l.activeModules[e]),
                    l.activeIndex = _.findIndex(l.activeModules, {
                        index: parseInt(t)
                    }),
                    l.activeItem = l.activeModules[l.activeIndex],
                    serviceBase.broadcast("activeItem"),
                    serviceBase.broadcast("activeModules")
            }
        };

        serviceBase.triggerActiveItem = function (e) {
            $("#module-" + l.activeModules[e].index).size() && $("#editor" + l.activeModules[e].id).size() ? clearTimeout(timer) : timer = $timeout(function () {
                serviceBase.triggerActiveItem(e)
            }, 50)
        };

        serviceBase.getBaseData = function (e) {
            return l[e]
        };

        serviceBase.setBaseData = function (e, t) {
            angular.isObject(e) ? angular.forEach(e, function (e, t) {
                l[t] = e
            }) : l[e] = t,
                serviceBase.broadcast(e)
        };

        serviceBase.broadcast = function (t) {
            switch (t) {
                case "activeItem":
                    $rootScope.$broadcast("serviceBase.activeItem.update", l.activeItem);
                    break;
                case "activeModules":
                    $rootScope.$broadcast("serviceBase.activeModules.update", l.activeModules);
                    break;
                case "editors":
                    $rootScope.$broadcast("serviceBase.editors.update", l.editors);
                    break;
                case "modules":
                case "index":
                case "activeIndex":
                case "pageLength":
                case "isNew":
                    break;
                default:
                    angular.isObject(t) && angular.forEach(t, function (t, a) {
                        switch (a) {
                            case "activeItem":
                                $rootScope.$broadcast("serviceBase.activeItem.update", l.activeItem);
                                break;
                            case "activeModules":
                                $rootScope.$broadcast("serviceBase.activeModules.update", l.activeModules);
                                break;
                            case "editors":
                                $rootScope.$broadcast("serviceBase.editors.update", l.editors)
                        }
                    })
            }
        };

        return serviceBase;
    }
]);

angular.module("wapeditorApp").service("serviceCommon", ["$window", function (e) {
    var t = {};
    return t.getCssname = function (e) {
        for (var t = "", a = 0, n = parseInt(e.length); a < n; a++)
            -1 != e[a].search(/[A-Z]/) ? t += "-" + e[a].toLowerCase() : t += e[a];
        return t
    }
        ,
        t.getMaxScopeIndex = function (e) {
            var t = e[e.length - 1].property
                , a = 0;
            for (var n in t)
                a = a < t[n].index ? parseInt(t[n].index) : a;
            return a
        }
        ,
        t.getHeaderIndex = function (e) {
            var t = 0;
            return angular.forEach(e, function (e, a) {
                "header" == e.id && (t = a)
            }),
                t
        }
        ,
        t.url = function (t) {
            t = t.split("/");
            var a = "./index.php?i=" + e.sysinfo.uniacid + "&j=" + e.sysinfo.acid + "&c=" + t[0];
            return t[1] && (a += "&a=" + t[1]),
            t[2] && (a += "&do=" + t[2]),
                a
        }
        ,
        t.tomedia = function (t) {
            return e.sysinfo.attachurl + t
        }
        ,
        t.buildDataTagBegin = function (t, a) {
            var n = {
                params: a,
                uniacid: e.sysinfo.uniacid,
                acid: e.sysinfo.acid
            };
            return "{data  func='site_widget_" + t + "' module='widget' widgetdata=" + encodeURIComponent(JSON.stringify(n)) + " }"
        }
        ,
        t.buildDataTagEnd = function () {
            return "{/data}"
        }
        ,
        t.stripHaskey = function (e) {
            for (var a in e)
                "$$hashKey" == a ? delete e[a] : "object" == typeof e[a] && t.stripHaskey(e[a]);
            return e
        }
        ,
        t.copySuccess = function (e, t) {
            var e = parseInt(e)
                , t = t
                , a = $("#copy-" + e).next().html();
            (!a || a.indexOf('<span class="label label-success" style="position:absolute;z-index:10;width:90px;height:34px;line-height:28px;"><i class="fa fa-check-circle"></i> 复制成功</span>') < 0) && $("#copy-" + e).after(t),
                setTimeout(function () {
                    t.remove()
                }, 2e3)
        }
        ,
        t
}
]);

angular.module("wapeditorApp").value("widget", [{
    id: "header",
    name: "微页面标题",
    issystem: true,
    params: {
        title: "微页面标题",
        description: "",
        pageHeight: 568,
        thumb: "",
        bgColor: "",
        bottom_menu: false,
        baseStyle: {},
        borderStyle: {},
        shadowStyle: {},
        positionStyle: {},
        animationStyle: {}
    }
}, {
    id: "UCheader",
    name: "会员主页",
    issystem: true,
    params: {
        title: "会员主页",
        cover: "",
        bgImage: ""
    }
}, {
    id: "cardBasic",
    name: "会员卡基本设置",
    issystem: true,
    params: {
        title: "会员卡",
        color: {
            title: "#333",
            rank: "#333",
            name: "#333",
            number: "#333"
        },
        card_level: {
            type: 1
        },
        card_label: {
            type: 1,
            title: "会员卡标题"
        },
        description: "1、本卡采取记名消费方式\n2、持卡人可享受会员专属优惠\n3、本卡不能与其他优惠活动同时使用\n4、持卡人可用卡内余额进行消费",
        background: {
            type: "system",
            image: util.tomedia("images/global/card/6.png")
        },
        logo: util.tomedia("http://www.baidu.com/img/bdlogo.gif"),
        format_type: 1,
        format: "WQ2015*****#####***",
        fields: [{
            title: "姓名",
            require: 1,
            bind: "realname"
        }, {
            title: "手机",
            require: 1,
            bind: "mobile"
        }],
        grant: {
            credit1: 0,
            credit2: 0,
            coupon: []
        },
        grant_rate: 0,
        offset_rate: 0,
        offset_max: 0
    }
}, {
    id: "cardActivity",
    name: "消费优惠设置",
    issystem: true,
    params: {
        discount_type: 0,
        discount_style: 1,
        discounts: [],
        content: "",
        bgColor: ""
    }
}, {
    id: "cardNums",
    name: "会员卡次数设置",
    issystem: true,
    params: {
        nums_status: 0,
        nums_style: 1,
        nums_text: "可用次数",
        nums: [{
            recharge: 100,
            num: 5
        }, {
            recharge: 200,
            num: 10
        }]
    }
}, {
    id: "cardTimes",
    name: "会员卡计时设置",
    issystem: true,
    params: {
        times_status: 0,
        times_style: 1,
        times_text: "截至日期",
        times: [{
            recharge: 100,
            time: 5
        }, {
            recharge: 200,
            time: 10
        }]
    }
}, {
    id: "cardRecharge",
    name: "充值优惠设置",
    issystem: true,
    params: {
        recharge_type: 0,
        recharge_style: 1,
        grant_rate_switch: 1,
        recharges: [{
            condition: "",
            back: "",
            backtype: "0",
            backunit: "元"
        }, {
            condition: "",
            back: "",
            backtype: "0",
            backunit: "元"
        }, {
            condition: "",
            back: "",
            backtype: "0",
            backunit: "元"
        }, {
            condition: "",
            back: "",
            backtype: "0",
            backunit: "元"
        }],
        content: "",
        bgColor: ""
    }
}, {
    id: "onlyText",
    name: "文字",
    isbase: true,
    params: {
        title: "请输入文字",
        baseStyle: {},
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            top: 100,
            left: 60,
            width: 200,
            height: 30
        }
    }
}, {
    id: "image",
    name: "图片",
    isbase: true,
    params: {
        items: {
            id: "",
            imgurl: ""
        },
        baseStyle: {},
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            top: 169,
            left: 0,
            width: 100,
            height: 100
        }
    }
}, {
    id: "shape",
    name: "形状",
    isbase: true,
    params: {
        svgValue: "",
        baseStyle: {},
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            top: 64,
            left: 0,
            width: 100,
            height: 100
        }
    }
}, {
    id: "pureLink",
    name: "链接",
    isbase: true,
    params: {
        items: [{
            id: "1",
            type: "text",
            title: "点我购买",
            url: "",
            color: "#fff",
            editcolor: "danger",
            discolor: "#d9534f",
            active: 1
        }, {
            id: "2",
            type: "text",
            title: "点开链接",
            url: "",
            color: "#fff",
            editcolor: "warning",
            discolor: "#ec971f",
            active: 0
        }, {
            id: "3",
            type: "text",
            title: "马上购买",
            url: "",
            color: "#fff",
            editcolor: "success",
            discolor: "#449d44",
            active: 0
        }, {
            id: "4",
            type: "text",
            title: "关注我们",
            url: "",
            color: "#000",
            editcolor: "default",
            discolor: "#fff",
            active: 0
        }, {
            id: "5",
            type: "img",
            title: "自定义",
            url: "",
            imgurl: "",
            editcolor: "primary",
            discolor: "",
            active: 0
        }],
        baseStyle: {
            backgroundColor: "#d9534f",
            color: "#fff",
            textAlign: "center",
            fontSize: "14",
            lineHeight: "33px"
        },
        borderStyle: {
            borderWidth: 1,
            borderRadius: 4,
            borderStyle: "solid",
            borderColor: "#ADADAD"
        },
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            top: 244,
            left: 0,
            width: 85,
            height: 35
        }
    }
}, {
    id: "dial",
    name: "拨号",
    isbase: true,
    params: {
        items: [{
            id: "1",
            type: "text",
            title: "一键拨号",
            tel: "",
            color: "#fff",
            editcolor: "danger",
            discolor: "#d9534f",
            active: 1
        }, {
            id: "2",
            type: "text",
            title: "热线电话",
            tel: "",
            color: "#fff",
            editcolor: "warning",
            discolor: "#ec971f",
            active: 0
        }, {
            id: "3",
            type: "text",
            title: "拨打电话",
            tel: "",
            color: "#fff",
            editcolor: "success",
            discolor: "#449d44",
            active: 0
        }, {
            id: "4",
            type: "text",
            title: "销售专线",
            tel: "",
            color: "#000",
            editcolor: "default",
            discolor: "#fff",
            active: 0
        }, {
            id: "5",
            type: "img",
            title: "自定义",
            tel: "",
            imgurl: "",
            editcolor: "primary",
            discolor: "",
            active: 0
        }],
        baseStyle: {
            backgroundColor: "#d9534f",
            color: "#fff",
            textAlign: "center",
            fontSize: "14",
            lineHeight: "33px"
        },
        borderStyle: {
            borderWidth: 1,
            borderRadius: 4,
            borderStyle: "solid",
            borderColor: "#ADADAD"
        },
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            top: 274,
            left: 100,
            width: 85,
            height: 35
        }
    }
}, {
    id: "good",
    name: "点赞",
    isbase: true,
    params: {
        bgcolor: "#d15d82",
        color: "#fff",
        layoutstyle: 1,
        layoutactive: "lr",
        baseStyle: {
            color: "#fff",
            backgroundColor: "#d15d82",
            fontSize: "14px",
            textAlign: "center",
            lineHeight: "48px"
        },
        borderStyle: {
            borderWidth: 1,
            borderRadius: 4,
            borderStyle: "solid",
            borderColor: "#ADADAD"
        },
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            width: 150,
            height: 50,
            top: 174,
            left: 70
        }
    }
}, {
    id: "countDown",
    name: "倒计时",
    isbase: true,
    params: {
        leftTimeText: {
            day: 0,
            hour: 0,
            min: 0,
            sec: 0
        },
        deadtime: "",
        textalign: "center",
        baseStyle: {
            fontSize: "13px",
            textAlign: "center",
            lineHeight: "48px"
        },
        borderStyle: {
            borderWidth: 1,
            borderRadius: 4,
            borderStyle: "solid",
            borderColor: "#ccc"
        },
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            top: 315,
            left: 50
        }
    }
}, {
    id: "richText",
    name: "富文本",
    params: {
        bgColor: "",
        content: "",
        isfull: false,
        baseStyle: {},
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            left: 0,
            top: 10,
            width: 320,
            height: 410
        }
    }
}, {
    id: "adImg",
    name: "幻灯片",
    params: {
        listStyle: 1,
        sizeType: 1,
        items: [],
        baseStyle: {},
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            left: 0,
            width: 320,
            height: 80
        }
    }
}, {
    id: "cube",
    name: "图片魔方",
    params: {
        layout: {},
        showIndex: 0,
        selection: {},
        currentPos: {},
        currentLayout: {
            isempty: true
        },
        baseStyle: {},
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            left: 0,
            width: 320,
            height: 30
        }
    }
}, {
    id: "title",
    name: "标题",
    params: {
        title: "",
        template: 1,
        tradition: {
            subtitle: "",
            align: "left",
            nav: {
                title: "",
                url: "",
                enable: 0
            }
        },
        news: {
            date: "",
            author: "",
            title: "",
            urlType: 1,
            url: ""
        },
        baseStyle: {},
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            left: 0,
            width: 320,
            height: 96
        }
    }
}, {
    id: "textNav",
    name: "文本导航",
    params: {
        items: [],
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            left: 0,
            width: 320,
            height: 30
        }
    }
}, {
    id: "navImg",
    name: "图片导航",
    params: {
        items: [{
            imgurl: "",
            title: "",
            url: ""
        }, {
            imgurl: "",
            title: "",
            url: ""
        }, {
            imgurl: "",
            title: "",
            url: ""
        }, {
            imgurl: "",
            title: "",
            url: ""
        }],
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            left: 0,
            width: 320,
            height: 100
        }
    }
}, {
    id: "link",
    name: "关联链接",
    params: {
        items: [],
        baseStyle: {
            lineHeight: "inherit"
        },
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            left: 0,
            width: 320,
            height: 100
        }
    }
}, {
    id: "line",
    name: "辅助线",
    params: {
        baseStyle: {},
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            height: 30
        }
    }
}, {
    id: "white",
    name: "辅助空白",
    params: {
        baseStyle: {},
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            left: 0,
            width: 320,
            height: 20
        }
    }
}, {
    id: "audio",
    name: "语音",
    params: {
        style: "1",
        headimg: "",
        align: "left",
        title: "",
        isloop: false,
        reload: "false",
        audio: {
            id: "",
            url: ""
        },
        baseStyle: {},
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            left: 0,
            width: 320,
            height: 60
        }
    }
}, {
    id: "notice",
    name: "公告",
    params: {
        notice: "",
        baseStyle: {
            backgroundColor: "#ffc"
        },
        borderStyle: {},
        shadowStyle: {},
        animationStyle: {},
        positionStyle: {
            left: 0,
            width: 320,
            height: 40
        }
    }
}]);

angular.module("wapeditorApp").service("serviceDrag", function () {
    console.log("serviceDrag")
});

angular.module("wapeditorApp").service("serviceSetStyle", ["$rootScope", "$timeout", "serviceCommon", "config", function ($rootScope, $timeout, a, config) {
    var serviceSetStyle = {}
        , s = 1;

    serviceSetStyle.defBaseStyle = {
        backgroundColor: "rgba(0,0,0,0)",
        color: "#000",
        opacity: 0,
        paddingTop: 0,
        lineHeight: 2,
        fontSize: 14,
        textAlign: "left",
        lock: false
    };

    serviceSetStyle.defBorderStyle = {
        borderWidth: 0,
        borderRadius: 2,
        borderStyle: "solid",
        borderColor: "rgba(0,0,0,1)",
        transform: 0
    };

    serviceSetStyle.defShadowStyle = {
        shadowSize: 0,
        shadowBlur: 0,
        shadowColor: "rgba(0,0,0,0.5)",
        shadowDirection: 1
    };

    serviceSetStyle.defAnimationStyle = {
        animationName: "noEffect",
        animationDuration: 1,
        animationTimingFunction: "ease",
        animationDelay: .6,
        animationFillMode: "both"
    };

    serviceSetStyle.defPositionStyle = {
        top: 259,
        left: 40,
        width: 240,
        height: 50
    };

    serviceSetStyle.initStyleParams = function (e) {
        var t = {};
        return (t = angular.copy(e)).baseStyle = $.extend(false, serviceSetStyle.defBaseStyle, e.baseStyle),
            t.borderStyle = $.extend(false, serviceSetStyle.defBorderStyle, e.borderStyle),
            t.shadowStyle = $.extend(false, serviceSetStyle.defShadowStyle, e.shadowStyle),
            t.animationStyle = $.extend(false, serviceSetStyle.defAnimationStyle, e.animationStyle),
            t.positionStyle = $.extend(false, serviceSetStyle.defPositionStyle, e.positionStyle),
        $(".app-preview").scrollTop() > 0 && (t.positionStyle.top += parseInt($(".app-preview").scrollTop())),
            t.positionStyle.left > 200 ? t.positionStyle.left = 10 : t.positionStyle.left += 5 * s,
            t.positionStyle.top += 5 * s,
            s > 20 ? s = 1 : s++,
            t
    };

    serviceSetStyle.UcInitStyleParams = function (e) {
        var t = {};
        return (t = angular.copy(e)).baseStyle = $.extend(false, serviceSetStyle.defBaseStyle, e.baseStyle),
            t.borderStyle = $.extend(false, serviceSetStyle.defBorderStyle, e.borderStyle),
            t.shadowStyle = $.extend(false, serviceSetStyle.defShadowStyle, e.shadowStyle),
            t.animationStyle = $.extend(false, serviceSetStyle.defAnimationStyle, e.animationStyle),
            t.positionStyle = $.extend(false, serviceSetStyle.defPositionStyle, e.positionStyle),
        $(".app-preview").scrollTop() > 0 && (t.positionStyle.top += parseInt($(".app-preview").scrollTop())),
            t.positionStyle.left > 200 ? t.positionStyle.left = 10 : t.positionStyle.left += 5 * s,
            t.positionStyle.top += 5 * s - $(".app-usercenter").height(),
            s > 10 ? s = 1 : s++,
            t
    };

    serviceSetStyle.initSetStyle = function (e) {
        serviceSetStyle.setModuleBaseStyle(e.baseStyle),
            serviceSetStyle.setModuleBorderStyle(e.borderStyle),
            serviceSetStyle.setModuleShadowStyle(e.shadowStyle),
            serviceSetStyle.setModulePositionStyle(e.positionStyle),
            serviceSetStyle.setModuleAnimationStyle(e.animationStyle)
    };

    serviceSetStyle.setModuleBaseStyle = function (t) {
        t = $.extend(false, serviceSetStyle.defBaseStyle, t);
        var n = "";
        for (var s in t)
            switch (s) {
                case "fontSize":
                    "number" == typeof t[s] ? n += a.getCssname(s) + ":" + parseInt(t[s]) + "px;" : t[s].search(/rem/) ? n += a.getCssname(s) + ":14px;" : n += a.getCssname(s) + ":" + parseInt(t[s]) + "px;";
                case "paddingTop":
                case "paddingBottom":
                    n += a.getCssname(s) + ":" + parseInt(t[s]) + "px;";
                    break;
                case "backgroundColor":
                case "color":
                case "textAlign":
                case "lineHeight":
                    n += a.getCssname(s) + ":" + t[s] + ";";
                    break;
                case "opacity":
                    n += a.getCssname(s) + ":" + (100 - parseInt(t[s])) / 100 + ";"
            }
        $rootScope.$broadcast("serviceBase.activeItem.style.update", "baseStyle", t, n)
    };

    serviceSetStyle.setModuleBorderStyle = function (t) {
        t = $.extend(false, serviceSetStyle.defBorderStyle, t);
        var n = newTransformStyle = "";
        for (var s in t)
            switch (s) {
                case "borderWidth":
                case "borderRadius":
                    n += a.getCssname(s) + ":" + parseInt(t[s]) + "px;";
                    break;
                case "borderStyle":
                case "borderColor":
                    n += a.getCssname(s) + ":" + t[s] + ";";
                    break;
                case "transform":
                    newTransformStyle += "transform: rotateZ(" + parseInt(t[s]) + "deg);"
            }
        $rootScope.$broadcast("serviceBase.activeItem.style.update", "borderStyle", t, n, newTransformStyle)
    };

    serviceSetStyle.setModuleShadowStyle = function (t) {
        t = $.extend(false, serviceSetStyle.defShadowStyle, t);
        var a = ""
            , n = shadowY = 0;
        n = -Math.sin(t.shadowDirection * Math.PI / 180) * t.shadowSize,
            shadowY = Math.cos(t.shadowDirection * Math.PI / 180) * t.shadowSize,
            a = "box-shadow: " + n + "px " + shadowY + "px " + t.shadowBlur + "px " + t.shadowColor + ";",
            $rootScope.$broadcast("serviceBase.activeItem.style.update", "shadowStyle", t, a)
    };

    serviceSetStyle.setModuleAnimationStyle = function (t) {
        var a = ""
            ,
            n = (t = $.extend(false, serviceSetStyle.defAnimationStyle, t)).animationName + " " + t.animationDuration + "s " + t.animationTimingFunction + " " + t.animationDelay + "s " + t.animationFillMode;
        a = serviceSetStyle.cssCompatible("animation", n),
            $rootScope.$broadcast("serviceBase.activeItem.style.update", "animationStyle", t, a)
    };

    serviceSetStyle.setModulePositionStyle = function (t) {
        t = $.extend(false, serviceSetStyle.defPositionStyle, t);
        var a = "position:absolute;";
        for (var n in t)
            switch (n) {
                case "top":
                case "left":
                case "width":
                case "height":
                    a += " " + n + ": " + t[n] + "px;"
            }
        $rootScope.$broadcast("serviceBase.activeItem.style.update", "positionStyle", t, a)
    };

    serviceSetStyle.clearModuleStyle = function (t) {
        t.params.baseStyle = t.originParams.baseStyle,
            t.params.borderStyle = t.originParams.borderStyle,
            t.params.shadowStyle = t.originParams.shadowStyle,
            t.params.animationStyle = t.originParams.animationStyle,
            $rootScope.$broadcast("serviceBase.activeItem.update", t)
    };

    serviceSetStyle.eleAnimationIns = function (n) {
        var i = a.getCssname(n);
        $timeout(function () {
            $("." + i).parent().addClass("select").siblings(".select").removeClass("select")
        }, 100),
            $rootScope.$broadcast("serviceBase.activeItem.animationName.update", n)
    };

    serviceSetStyle.savePagePosition = function (t) {
        $(".modules").find("div.ng-scope[ng-controller$='Ctrl']").each(function () {
            var e = $(this).parent().parent()
                , a = _.findIndex(t, {
                index: parseInt(e.attr("index"))
            })
                , n = $(this).css("top")
                , i = $(this).css("left")
                , s = $(this).css("width")
                , o = $(this).css("height")
                , r = "position:absolute;top:" + n + ";left:" + i + ";width:" + s + ";height:" + o + ";";
            t[a].params.positionStyle.top = parseInt(n),
                t[a].params.positionStyle.left = parseInt(i),
                t[a].params.positionStyle.width = parseInt(s),
                t[a].params.positionStyle.height = parseInt(o),
                t[a].positionStyle = r
        }),
            $rootScope.$broadcast("serviceBase.activeModules.update", t)
    };

    serviceSetStyle.saveModulePosition = function (t) {
        var a = "#module-" + t.index
            , n = $(a).find("div.ng-scope[ng-controller$='Ctrl']")
            , i = n.css("top")
            , s = n.css("left")
            , o = n.css("width")
            , r = n.css("height")
            , l = "position:absolute;top:" + i + ";left:" + s + ";width:" + o + ";height:" + r + ";";
        return t.params.positionStyle.top = parseInt(i),
            t.params.positionStyle.left = parseInt(s),
            t.params.positionStyle.width = parseInt(o),
            t.params.positionStyle.height = parseInt(r),
            t.positionStyle = l,
            $rootScope.$broadcast("serviceBase.activeItem.update", t),
            t
    };

    serviceSetStyle.changeTextAlign = function (t, a) {
        t.params.baseStyle.textAlign = a,
            $rootScope.$broadcast("serviceBase.activeItem.update", t)
    };

    serviceSetStyle.changeBorderWidth = function (e) {
        "adImg" != e.id && "cube" != e.id && "title" != e.id && "textNav" != e.id && "link" != e.id && "audio" != e.id || $timeout(function () {
            var t = serviceSetStyle.saveModulePosition(e);
            t.positionStyle.height += 2 * t.borderStyle.borderWidth,
            "audio" == e.id && (t.positionStyle.height += 20),
                serviceSetStyle.setModulePositionStyle(t.params.positionStyle)
        }, 100)
    };

    serviceSetStyle.changeInnerHeight = function (e) {
        $timeout(function () {
            var t = serviceSetStyle.saveModulePosition(e)
                , a = t.index
                , n = $("#module-" + a).find(".inner")
                , s = parseInt(n.css("height"));
            s += 2 * t.params.borderStyle.borderWidth,
                t.params.positionStyle.height = s,
                serviceSetStyle.setModulePositionStyle(t.params.positionStyle)
        }, 100)
    };

    serviceSetStyle.changePageLength = function (pageLength, activeModules) {
        var isMultiPage = !((pageLength = parseInt(pageLength)) > 1)
            , legnth = pageLength;
        $timeout(function () {
            $(".app-content").css("height", 568 * pageLength + "px");
        }, 100);
        // a为config
        activeModules[a.getHeaderIndex(activeModules)].params.pageLength = pageLength;
        $rootScope.$broadcast("updateScope", {
            isMultiPage: isMultiPage,
            pageLength: legnth,
            activeModules: activeModules
        });
        return activeModules;
    };

    serviceSetStyle.cssCompatible = function (e, t) {
        if (angular.isString(e) && angular.isString(t))
            return e + ": " + t + ";-webkit-" + e + ": " + t + ";-moz-" + e + ": " + t + ";-o-" + e + ": " + t + ";-ms-" + e + ": " + t + ";"
    };

    return serviceSetStyle;
}
]);

angular.module("wapeditorApp").service("serviceSubmit", ["serviceBase", "serviceCommon", function (e, t) {
    var a = {};
    return a.submit = function () {
        var a = ""
            , n = {
            params: {},
            html: ""
        }
            , i = $($(".modules").html())
            , s = e.getBaseData("activeModules");
        i.find("div.ng-scope[ng-controller$='Ctrl']").each(function () {
            var e = _.findIndex(s, {
                index: parseInt($(this).parent().parent().attr("index"))
            })
                , n = $(this).find("div[class^='app-']").get(0)
                , i = $(n).attr("style");
            s[e].params.animate = s[e].params.animateTemp,
                i += "animation:" + s[e].params.animate + ";",
                $(n).attr("style", i);
            var o = ""
                , r = angular.copy(s[e].params);
            $(this).find(".js-default-content").remove();
            var l = $(this).parent().parent().attr("name").toLowerCase();
            if ("UCheader" != l && "cardBasic" != l && "cardActivity" != l && "cardNums" != l && "cardTimes" != l && "cardRecharge" != l) {
                var c = $(this).css("top")
                    , u = $(this).css("left")
                    , d = $(this).css("width")
                    , p = $(this).css("height")
                    , m = "position:absolute;top:" + c + ";left:" + u + ";width:" + d + ";height:" + p + ";";
                s[e].params.positionStyle.top = parseInt(c),
                    s[e].params.positionStyle.left = parseInt(u),
                    s[e].params.positionStyle.width = parseInt(d),
                    s[e].params.positionStyle.height = parseInt(p),
                    s[e].positionStyle = m
            }
            switch (l) {
                case "link":
                    var f = this;
                    angular.forEach(r.items, function (e, a) {
                        (e.selectCate.pid || e.selectCate.cid) && $(f).find(".list-group").children().eq(a).replaceWith("<div>" + t.buildDataTagBegin("link", e) + '<div class="list-group-item ng-scope"><a href="{$row[url]}" class="clearfix"><span class="app-nav-title"> {$row[title]}<i class="pull-right fa fa-angle-right"></i></span></a></div>' + t.buildDataTagEnd() + "</div>")
                    });
                    break;
                case "richtext":
                    s[e] && (s[e].params.content = "")
            }
            if (o = $(this).html(),
            "header" != l) {
                m = $(this).attr("style");
                a += '<div type="' + l + '" style="' + m + '">' + o + "</div>"
            }
            e++
        });
        var o = s[0].params.bgColor;
        return a = '<div class="js-design-page" style="background-color:' + o + '">' + a + "</div>",
            a = a.replace(/<\!\-\-([^-]*?)\-\->/g, ""),
            a = a.replace(/ ng\-[a-zA-Z-]+=\"[^\"]*\"/g, ""),
            a = a.replace(/ ng\-[a-zA-Z]+/g, ""),
            n.html = a,
            n.params = angular.copy(s),
            t.stripHaskey(n.params),
            n
    }
        ,
        a
}
]);

angular.module("wapeditorApp").service("serviceUpwardCompatible", ["$rootScope", "$timeout", "orderByFilter", function (e, t, a) {
    var n = {};
    return n.compatibility = function (e) {
        void 0 !== e[0].params.pageHeight && (e[0].params.pageLength = Math.ceil(e[0].params.pageHeight / 568)),
            e = a(e, "displayorder");
        for (var t in e) {
            e[t].params.baseStyle instanceof Array && (e[t].params.baseStyle = {}),
            e[t].params.borderStyle instanceof Array && (e[t].params.borderStyle = {}),
            e[t].params.shadowStyle instanceof Array && (e[t].params.shadowStyle = {}),
            e[t].params.positionStyle instanceof Array && (e[t].params.positionStyle = {});
            var n = angular.copy(e[t].params);
            if (e[t].animationStyle = "",
                e[t].params.animationStyle = {},
                e[t].params.animate) {
                var i = e[t].params.animate.match(/(\w+)\s1/);
                i = i ? i[1] : "noEffect",
                    e[t].params.animationStyle.name = i
            } else
                e[t].params.animationStyle.name = "noEffect";
            switch (e[t].params.animationStyle = {
                name: e[t].params.animationStyle.name,
                speed: 1,
                delay: .6
            },
                e[t].animationStyle = "animation: " + e[t].params.animate + ";",
                e[t].params.positionStyle = _.isEmpty(e[t].params.positionStyle) ? {} : e[t].params.positionStyle,
                e[t].params.baseStyle = _.isEmpty(e[t].params.baseStyle) ? {} : e[t].params.baseStyle,
                e[t].params.borderStyle = _.isEmpty(e[t].params.borderStyle) ? {} : e[t].params.borderStyle,
                e[t].params.shadowStyle = _.isEmpty(e[t].params.shadowStyle) ? {} : e[t].params.shadowStyle,
                e[t].baseStyle = "",
                e[t].borderStyle = "",
                e[t].shadowStyle = "",
                e[t].positionStyle = "",
                e[t].id) {
                case "onlyText":
                    e[t].params.baseStyle.textAlign = n.postype,
                        e[t].params.baseStyle.fontSize = n.baseStyle.fontsize,
                        e[t].params.baseStyle.lineHeight = n.baseStyle.lineheight,
                        e[t].params.positionStyle.left = n.positionStyle.marginleft ? n.positionStyle.marginleft : 0,
                        e[t].params.positionStyle.width = n.positionStyle.width ? n.positionStyle.width : 290,
                        e[t].params.positionStyle.height = n.positionStyle.height ? n.positionStyle.height : 0,
                        e[t].baseStyle = "font-size:" + n.baseStyle.fontsize + "px;text-align:" + n.postype + ";line-height:" + n.baseStyle.lineheight + ";";
                    break;
                case "image":
                    e[t].params.positionStyle.left = n.positionStyle.marginleft ? n.positionStyle.marginleft : 0,
                        e[t].params.positionStyle.width = n.positionStyle.width ? n.positionStyle.width : 0,
                        e[t].params.positionStyle.height = n.positionStyle.height ? n.positionStyle.height : 0;
                    break;
                case "shape":
                    e[t].params.positionStyle.left = n.positionStyle.marginleft ? n.positionStyle.marginleft : 0,
                        e[t].params.positionStyle.width = n.positionStyle.width ? n.positionStyle.width : 100,
                        e[t].params.positionStyle.height = n.positionStyle.height ? n.positionStyle.height : 0;
                    break;
                case "pureLink":
                case "dial":
                    e[t].params.baseStyle.fontSize = n.baseStyle.fontsize ? n.baseStyle.fontsize + "px" : "14px",
                        e[t].params.baseStyle.textAlign = "center";
                    for (var s in n.items)
                        if (1 == n.items[s].active) {
                            e[t].params.baseStyle.backgroundColor = n.items[s].discolor,
                                e[t].params.baseStyle.color = n.items[s].color;
                            break
                        }
                    e[t].params.positionStyle.left = n.positionStyle.marginleft ? n.positionStyle.marginleft : 0,
                        e[t].params.positionStyle.width = n.positionStyle.width ? n.positionStyle.width : 320 - n.positionStyle.marginleft,
                        e[t].params.positionStyle.height = n.positionStyle.height ? n.positionStyle.height : 35,
                        e[t].params.baseStyle.lineHeight = e[t].params.positionStyle.height + "px",
                        e[t].params.borderStyle.borderWidth = 1,
                        e[t].params.borderStyle.borderRadius = 8,
                        e[t].params.borderStyle.borderStyle = "solid",
                        e[t].params.borderStyle.borderColor = "#ADADAD",
                        e[t].baseStyle = "font-size:" + e[t].params.baseStyle.fontSize + ";text-align:center;background-color:" + n.items[s].discolor + ";color:" + n.items[s].color + ";line-height:" + e[t].params.baseStyle.lineHeight + ";",
                        e[t].borderStyle = "border-radius:8px; border-width: 1px;border-style: solid;border-color: #ADADAD;";
                    break;
                case "good":
                    e[t].params.baseStyle.fontSize = n.baseStyle.fontsize + "px",
                        e[t].params.baseStyle.textAlign = "center",
                        e[t].params.baseStyle.color = n.color,
                        e[t].params.baseStyle.backgroundColor = "#d15d82",
                        e[t].params.borderStyle.borderRadius = 5,
                        e[t].params.positionStyle.left = n.positionStyle.marginleft ? n.positionStyle.marginleft : 0,
                        e[t].params.positionStyle.width = n.positionStyle.width ? n.positionStyle.width : 320 - n.positionStyle.marginleft,
                        1 == n.layoutstyle ? e[t].params.positionStyle.height = n.positionStyle.height ? n.positionStyle.height : 35 : e[t].params.positionStyle.height = n.positionStyle.height ? n.positionStyle.height : 54,
                        e[t].params.baseStyle.lineHeight = e[t].params.positionStyle.height + "px",
                        e[t].baseStyle = "font-size:" + e[t].params.baseStyle.fontSize + ";text-align:center;background-color:#d15d82;color:" + n.color + ";line-height:" + e[t].params.baseStyle.lineHeight + ";",
                        e[t].borderStyle = "border-radius:5px;";
                    break;
                case "countDown":
                    e[t].params.baseStyle.fontSize = n.baseStyle.fontsize + "px",
                        e[t].params.baseStyle.textAlign = "center",
                        e[t].params.positionStyle.left = n.positionStyle.marginleft ? n.positionStyle.marginleft : 0,
                        e[t].params.positionStyle.width = n.positionStyle.width ? n.positionStyle.width : 320,
                        e[t].params.positionStyle.height = n.positionStyle.height ? n.positionStyle.height : 35,
                        e[t].params.baseStyle.lineHeight = e[t].params.positionStyle.height + "px",
                        e[t].params.borderStyle.borderWidth = 1,
                        e[t].params.borderStyle.borderStyle = "solid",
                        e[t].params.borderStyle.borderColor = "#ccc",
                        e[t].baseStyle = "font-size:" + e[t].params.baseStyle.fontSize + ";text-align:center;line-height:" + e[t].params.baseStyle.lineHeight + ";",
                        e[t].borderStyle = "border-width: 1px;border-style: solid;border-color: #ccc;";
                    break;
                case "title":
                    e[t].params.baseStyle.backgroundColor = n.tradition.bgcolor,
                        e[t].baseStyle = "background-color:" + n.tradition.bgcolor + ";";
                case "white":
                    e[t].params.positionStyle.height = e[t].params.height;
                case "richText":
                case "adImg":
                case "cube":
                case "textNav":
                case "navImg":
                case "link":
                case "line":
                case "audio":
                case "notice":
                    void 0 !== n.positionStyle ? e[t].params.positionStyle.left = n.positionStyle.marginleft ? n.positionStyle.marginleft : 0 : e[t].params.positionStyle.left = 0,
                        e[t].params.positionStyle.width = 320
            }
            var o = "";
            heightStyle = "",
            e[t].params.positionStyle.width && (o = "width:" + e[t].params.positionStyle.width + "px;"),
            e[t].params.positionStyle.height && (heightStyle = "height:" + e[t].params.positionStyle.height + "px;"),
                e[t].positionStyle = "position:relative;left:" + e[t].params.positionStyle.left + "px;" + o + heightStyle,
                void 0 !== n.positionStyle ? e[t].marginTop = n.positionStyle.margintop ? n.positionStyle.margintop : 0 : e[t].marginTop = 0
        }
        return e
    }
        ,
        n
}
]);

angular.module("wapeditorApp").controller("AdImgCtrl", ["$scope", function (e) {
    e.addItem = function () {
        require(["fileUploader"], function (t) {
            t.show(function (t) {
                e.activeItem.params.items.push({
                    id: t.id,
                    imgurl: t.url,
                    title: "",
                    url: "",
                    isactive: false
                }),
                    $.each(e.activeItem.params.items, function (t, a) {
                        e.activeItem.params.items[0].isactive = 0 == t
                    }),
                    e.$apply("activeItem"),
                    e.changeInnerHeight()
            }, {
                direct: true,
                multiple: false
            })
        })
    }
        ,
        e.removeItem = function (t) {
            index = $.inArray(t, e.activeItem.params.items),
                items = _.clone(e.activeItem.params.items),
                e.activeItem.params.items = [];
            for (i in items)
                i != index && e.activeItem.params.items.push(items[i]);
            e.changeInnerHeight()
        }
        ,
        e.addEmpty = function () {
            e.activeItem.params.items.push({
                imgurl: "",
                title: "",
                url: ""
            }),
                e.changeInnerHeight()
        }
        ,
        e.changeItem = function (t) {
            require(["fileUploader"], function (a) {
                a.init(function (a) {
                    var n = $.inArray(t, e.activeItem.params.items);
                    n > -1 && (e.activeItem.params.items[n].id = a.id,
                        e.activeItem.params.items[n].imgurl = a.url,
                        e.$apply())
                }, {
                    direct: true,
                    multiple: false
                })
            }),
                e.changeInnerHeight()
        }
}
]);

angular.module("wapeditorApp").controller("AudioCtrl", ["$scope", function (e) {
    e.addAudioItem = function () {
        require(["fileUploader"], function (t) {
            t.init(function (t) {
                t && (e.activeItem.params.audio.id = t.id,
                    e.activeItem.params.audio.url = t.attachment,
                    e.$apply(),
                    $(".audio-player-play").click(function () {
                        var t = e.activeItem.params.audio.url;
                        if (t) {
                            $("#player").remove();
                            var a = $('<div id="player"></div>');
                            $(document.body).append(a),
                                a.data("control", $(this)),
                                a.jPlayer({
                                    playing: function () {
                                        $(this).data("control").find("i").removeClass("fa-play").addClass("fa-stop")
                                    },
                                    pause: function (e) {
                                        $(this).data("control").find("i").removeClass("fa-stop").addClass("fa-play")
                                    },
                                    swfPath: "resource/components/jplayer",
                                    supplied: "mp3,wma,wav,amr",
                                    solution: "html, flash"
                                }),
                                a.jPlayer("setMedia", {
                                    mp3: t
                                }).jPlayer("play"),
                                $(this).find("i").hasClass("fa-stop") ? a.jPlayer("stop") : a.jPlayer("setMedia", {
                                    mp3: t
                                }).jPlayer("play")
                        }
                    }).show())
            }, {
                direct: true,
                multiple: false,
                type: "audio"
            })
        })
    }
        ,
        e.addImgItem = function () {
            require(["fileUploader"], function (t) {
                t.init(function (t) {
                    e.activeItem.params.headimg = t.url,
                        e.$apply()
                }, {
                    direct: true,
                    multiple: false
                })
            })
        }
        ,
        e.changeInnerHeight = function () {
            e.changeInnerHeight()
        }
}
]);

angular.module("wapeditorApp").controller("CountDownCtrl", ["$scope", "$timeout", function (e, t) {
    e.$watch("activeItem.params.deadtime", function (t, n) {
        if (e.activeItem.params.leftTimeText = {
            day: 0,
            hour: 0,
            min: 0,
            sec: 0
        },
        t && void 0 !== t && 0 != t) {
            var i = t.replace(/:/g, "-")
                , s = (i = i.replace(/ /g, "-")).split("-");
            dtime = new Date(Date.UTC(s[0], s[1] - 1, s[2], s[3] - 8, s[4], s[5])),
                dtime = parseInt(dtime.getTime()),
                d = new Date(dtime)
        } else {
            var o = Date.parse(new Date);
            dtime = parseInt(2592e6 + o),
                d = new Date(dtime)
        }
        e.activeItem.params.deadtime = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds(),
            e.activeItem.params.deadtimeToMin = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes(),
            a()
    });
    var a = function () {
        var n = Date.parse(new Date)
            , i = dtime - n > 0 ? dtime - n : 0;
        e.activeItem.params.leftTimeText.day = parseInt(i / 864e5),
            e.activeItem.params.leftTimeText.hour = parseInt(i / 36e5 % 24),
            e.activeItem.params.leftTimeText.min = parseInt(i / 6e4 % 60),
            e.activeItem.params.leftTimeText.sec = parseInt(i / 1e3 % 60),
            t(a, 1e3)
    }
}
]);

angular.module("wapeditorApp").controller("CubeCtrl", ["$scope", function (e) {
    if (e.activeItem.params && e.activeItem.params.layout && _.isEmpty(e.activeItem.params.layout))
        for (row = 0; row < 4; row++)
            for (e.activeItem.params.layout[row] = {},
                     col = 0; col < 4; col++)
                e.activeItem.params.layout[row][col] = {
                    cols: 1,
                    rows: 1,
                    isempty: true,
                    imgurl: "",
                    classname: ""
                };
    $(".layout-table").bind("mouseover", function (e) {
        if ("LI" == e.target.tagName) {
            $(".layout-table li").removeClass("selected");
            var t = $(e.target).attr("data-rows")
                , a = $(e.target).attr("data-cols");
            $(".layout-table li").filter(function (e, n) {
                return $(n).attr("data-rows") <= t && $(n).attr("data-cols") <= a
            }).addClass("selected")
        }
    }),
        e.activeItem.params.currentLayout = {},
        e.showSelection = function (t, a) {
            e.activeItem.params.currentPos = {
                row: t,
                col: a
            },
                e.activeItem.params.selection = {};
            var n = -1
                , s = 1;
            for (i = t; i < 4; i++) {
                for (y = 1,
                         e.activeItem.params.selection[s] = {},
                         j = a; j < 4; j++)
                    n >= 0 && n < j || (!_.isUndefined(e.activeItem.params.layout[i][j]) && e.activeItem.params.layout[i][j].isempty ? (e.activeItem.params.selection[s][y] = {
                        rows: s,
                        cols: y
                    },
                        y++) : n = j - 1);
                s++
            }
            return $(".layout-table li").removeClass("selected"),
                e.modalobj = $("#modal-cube-layout").modal({
                    show: true
                }),
                true
        }
        ,
        e.selectLayout = function (t, a, n, s) {
            for (_.isUndefined(n) && (n = 0),
                 _.isUndefined(s) && (s = 0),
                     e.activeItem.params.layout[t][a] = {
                         cols: s,
                         rows: n,
                         isempty: false,
                         imgurl: "",
                         classname: "index-" + e.activeItem.params.showIndex
                     },
                     i = t; i < parseInt(t) + parseInt(n); i++)
                for (j = a; j < parseInt(a) + parseInt(s); j++)
                    t == i && a == j || delete e.activeItem.params.layout[i][j];
            return e.activeItem.params.showIndex++,
                e.modalobj.modal("hide"),
                e.changeItem(t, a),
                true
        }
        ,
        e.addItem = function (t, a) {
            require(["fileUploader"], function (t) {
                t.show(function (t) {
                    e.activeItem.params.currentLayout.id = t.id,
                        e.activeItem.params.currentLayout.imgurl = t.url,
                        e.$apply(),
                        e.changeInnerHeight()
                }, {
                    direct: true,
                    multiple: false
                })
            })
        }
        ,
        e.changeItem = function (t, a) {
            $("#cube-editor td").removeClass("current").filter(function (e, n) {
                return $(n).attr("x") == t && $(n).attr("y") == a
            }).addClass("current"),
                $("#thumb").attr("src", ""),
                e.activeItem.params.currentLayout = e.activeItem.params.layout[t][a]
        }
        ,
        e.removeItem = function () {
            for (var t = 0; t < 4; t++)
                for (var a = 0; a < 4; a++)
                    if (!_.isEmpty(e.activeItem.params.layout[t][a]) && e.activeItem.params.currentLayout.classname == e.activeItem.params.layout[t][a].classname) {
                        if (e.activeItem.params.currentLayout.rows > 1)
                            for (var n = 0; n < e.activeItem.params.currentLayout.rows; n++) {
                                var i = t + n;
                                if (e.activeItem.params.layout[i][a] = {
                                    cols: 1,
                                    rows: 1,
                                    isempty: true,
                                    imgurl: "",
                                    classname: ""
                                },
                                e.activeItem.params.currentLayout.cols > 1)
                                    for (s = 0; s < e.activeItem.params.currentLayout.cols; s++) {
                                        o = a + s;
                                        e.activeItem.params.layout[i][o] = {
                                            cols: 1,
                                            rows: 1,
                                            isempty: true,
                                            imgurl: "",
                                            classname: ""
                                        }
                                    }
                            }
                        else if (e.activeItem.params.layout[t][a] = {
                            cols: 1,
                            rows: 1,
                            isempty: true,
                            imgurl: "",
                            classname: ""
                        },
                        e.activeItem.params.currentLayout.cols > 1)
                            for (var s = 0; s < e.activeItem.params.currentLayout.cols; s++) {
                                var o = a + s;
                                e.activeItem.params.layout[t][o] = {
                                    cols: 1,
                                    rows: 1,
                                    isempty: true,
                                    imgurl: "",
                                    classname: ""
                                }
                            }
                        e.activeItem.params.currentLayout = {}
                    }
        }
}
]);

angular.module("wapeditorApp").controller("DialCtrl", ["$scope", function (e) {
    e.changeItem = function (t) {
        5 == t.id ? (e.activeItem.paddingTop = angular.copy(e.activeItem.params.baseStyle.paddingTop),
            e.activeItem.params.baseStyle.paddingTop = 0) : e.activeItem.params.baseStyle.paddingTop = e.activeItem.params.baseStyle.paddingTop ? e.activeItem.params.baseStyle.paddingTop : e.activeItem.paddingTop,
            index = $.inArray(t, e.activeItem.params.items);
        for (i in e.activeItem.params.items)
            i == index ? (e.activeItem.params.items[i].active = 1,
                e.activeItem.params.baseStyle.color = e.activeItem.params.items[i].color,
                e.activeItem.params.baseStyle.backgroundColor = e.activeItem.params.items[i].discolor) : e.activeItem.params.items[i].active = 0
    }
        ,
        e.addImage = function (t) {
            index = $.inArray(t, e.activeItem.params.items);
            for (i in e.activeItem.params.items)
                i == index && require(["fileUploader"], function (t) {
                    t.show(function (t) {
                        e.saveModulePosition(),
                            e.resetPosition(t),
                            e.activeItem.params.items[i].imgurl = t.url,
                            e.$apply()
                    }, {
                        direct: true,
                        multiple: false
                    })
                })
        }
        ,
        e.resetPosition = function (t) {
            t.width && t.height && (e.activeItem.params.positionStyle.width = t.width,
                e.activeItem.params.positionStyle.height = t.height,
                e.setModulePositionStyle(e.activeItem.params.positionStyle))
        }
}
]);

angular.module("wapeditorApp").controller("GoodCtrl", ["$scope", function (e) {
    e.changeLayout = function (t) {
        switch (t) {
            case "lr":
                e.activeItem.params.layoutstyle = 1;
                break;
            case "ud":
                e.activeItem.params.layoutstyle = 2
        }
    }
}
]);

angular.module("wapeditorApp").controller("HeaderCtrl", ["$scope", function (e) {
    e.addThumb = function (t) {
        require(["fileUploader"], function (a) {
            a.show(function (a) {
                e.activeItem.params[t] = a.url,
                    e.$apply("activeItem")
            }, {
                direct: true,
                multiple: false
            })
        })
    }
        ,
        e.ifCheck = function () {
            e.activeItem.params.bottom_menu = !e.activeItem.params.bottom_menu
        }
}
]);

angular.module("wapeditorApp").controller("ImageCtrl", ["$scope", function (e) {
    e.addItem = function () {
        require(["fileUploader"], function (t) {
            t.show(function (t) {
                e.saveModulePosition(),
                    e.resetPosition(t),
                    e.activeItem.params.items = {
                        id: t.id,
                        imgurl: t.url
                    },
                    e.$apply()
            }, {
                direct: true,
                multiple: false
            })
        })
    }
        ,
        e.changeItem = function (t) {
            require(["fileUploader"], function (t) {
                t.init(function (t) {
                    e.saveModulePosition(),
                        e.resetPosition(t),
                        e.activeItem.params.items.id = t.id,
                        e.activeItem.params.items.imgurl = t.url,
                        e.$apply()
                }, {
                    direct: true,
                    multiple: false
                })
            })
        }
        ,
        e.resetPosition = function (t) {
            t.width && t.height && (w = t.width,
                h = t.height,
                w >= h ? (e.activeItem.params.positionStyle.width = 100,
                    e.activeItem.params.positionStyle.height = e.activeItem.params.positionStyle.width * h / w) : (e.activeItem.params.positionStyle.height = 100,
                    e.activeItem.params.positionStyle.width = e.activeItem.params.positionStyle.height * w / h),
                e.setModulePositionStyle(e.activeItem.params.positionStyle))
        }
}
]);

angular.module("wapeditorApp").controller("LineCtrl", ["$scope", function (e) {
}
]);

angular.module("wapeditorApp").controller("LinkCtrl", ["$scope", "$http", function (e, t) {
    e.pageSize = _.range(0, 30),
        e.addItem = function () {
            e.activeItem.params.items.push({
                title: "",
                url: "",
                type: 1,
                selectCate: {
                    name: "",
                    id: 0
                },
                pageSize: 3
            })
        }
        ,
        e.removeItem = function (t) {
            index = $.inArray(t, e.activeItem.params.items),
                items = _.clone(e.activeItem.params.items),
                e.activeItem.params.items = [];
            for (i in items)
                i != index && e.activeItem.params.items.push(items[i]);
            e.changeInnerHeight()
        }
        ,
        e.showSearchCateList = function (a) {
            e.currentItem = a;
            var n = $(".js-search-cate-keyword").val();
            return n = void 0 === n ? "" : n,
                t.get("./index.php?c=utility&a=link&do=catelist&keyword=" + n).success(function (t, a, n, s) {
                    e.searchCateList = [];
                    var o = t.message.message;
                    for (i in o)
                        e.searchCateList.push({
                            id: o[i].id,
                            name: o[i].name,
                            children: o[i].children
                        });
                    e.modalobj = $("#modal-search-cate-link").modal({
                        show: true
                    })
                }),
                true
        }
        ,
        e.selectCateItem = function (t, a, n) {
            return e.currentItem.selectCate = {
                pid: t,
                cid: a,
                name: n
            },
                e.modalobj.modal("hide"),
                true
        }
}
]);

angular.module("wapeditorApp").controller("NavImgCtrl", ["$scope", function (e) {
    e.changeItem = function (t) {
        require(["fileUploader"], function (a) {
            a.show(function (a) {
                t.id = a.id,
                    t.imgurl = a.url,
                    e.$apply()
            }, {
                direct: true,
                multiple: false
            })
        })
    }
}
]);

angular.module("wapeditorApp").controller("NoticeCtrl", ["$scope", function (e) {
}
]);

angular.module("wapeditorApp").controller("OnlyTextCtrl", ["$scope", function (e) {
}
]);

angular.module("wapeditorApp").controller("PureLinkCtrl", ["$scope", function (e) {
    e.changeItem = function (t) {
        5 == t.id ? (e.activeItem.paddingTop = angular.copy(e.activeItem.params.baseStyle.paddingTop),
            e.activeItem.params.baseStyle.paddingTop = 0) : e.activeItem.params.baseStyle.paddingTop = e.activeItem.params.baseStyle.paddingTop ? e.activeItem.params.baseStyle.paddingTop : e.activeItem.paddingTop,
            index = $.inArray(t, e.activeItem.params.items);
        for (i in e.activeItem.params.items)
            i == index ? (e.activeItem.params.items[i].active = 1,
                e.activeItem.params.baseStyle.color = e.activeItem.params.items[i].color,
                e.activeItem.params.baseStyle.backgroundColor = e.activeItem.params.items[i].discolor) : e.activeItem.params.items[i].active = 0
    }
        ,
        e.addImage = function (t) {
            index = $.inArray(t, e.activeItem.params.items);
            for (i in e.activeItem.params.items)
                i == index && require(["fileUploader"], function (t) {
                    t.show(function (t) {
                        e.saveModulePosition(),
                            e.resetPosition(t),
                            e.activeItem.params.items[i].imgurl = t.url,
                            e.$apply()
                    }, {
                        direct: true,
                        multiple: false
                    })
                })
        }
        ,
        e.resetPosition = function (t) {
            t.width && t.height && (e.activeItem.params.positionStyle.width = t.width,
                e.activeItem.params.positionStyle.height = t.height,
                e.setModulePositionStyle(e.activeItem.params.positionStyle))
        }
}
]);

angular.module("wapeditorApp").controller("RewardCtrl", ["$scope", function (e) {
    e.changeSize = function (t) {
        switch (e.activeItem.params.fontactive = t,
            e.activeItem.params.fonttype = t,
            t) {
            case "big":
                e.activeItem.params.baseStyle.fontSize = "36px";
                break;
            case "middle":
                e.activeItem.params.baseStyle.fontSize = "26px";
                break;
            case "small":
                e.activeItem.params.baseStyle.fontSize = "16px"
        }
    }
}
]);

angular.module("wapeditorApp").controller("RichTextCtrl", ["$scope", "$sce", function (e, t) {
    e.trustAsHtml = function (e, a) {
        return !e && a && (e = a.replace(/\#quot;/g, "&quot;")),
            t.trustAsHtml(e)
    }
}
]);

angular.module("wapeditorApp").controller("ShapeCtrl", ["$scope", "$http", function (e, t) {
    e.page = {
        currentPage: 1,
        numPages: 1,
        toPage: "",
        totalItems: 0,
        pageSize: 18
    },
        e.addItem = function () {
            t({
                method: "GET",
                url: window.sysinfo.siteroot + "web/resource/images/app/shape/shape.json",
                cache: true
            }).success(function (t) {
                e.sysCategoryList = t.sysCategoryList,
                    e.sysImageTag = t.sysImageTag,
                    e.sysImageList = t.sysImageList,
                    e.activeItem.params.catlistActive = 1,
                    e.activeItem.params.imgListActive = 4,
                    e.page.numPages = a(),
                    e.pages = i(),
                    n(1),
                    e.currentImageList = o(e.activeItem.params.imgListActive, 1),
                    $("#shapeModal").modal("show")
            })
        }
        ,
        e.getSysCatAndList = function (t) {
            var s = $.inArray(t, e.sysCategoryList);
            for (var r in e.sysCategoryList)
                if (r == s) {
                    e.sysCategoryList[r].active = true,
                        e.activeItem.params.catlistActive = e.sysCategoryList[r].id;
                    var l = 1;
                    for (var c in e.sysImageTag)
                        e.sysImageTag[c].parentid == e.sysCategoryList[r].id && 1 == l ? (e.activeItem.params.imgListActive = e.sysImageTag[c].id,
                            e.sysImageTag[c].active = true,
                            e.page.numPages = a(),
                            e.pages = i(),
                            n(1),
                            e.currentImageList = o(e.activeItem.params.imgListActive, 1),
                            l++) : e.sysImageTag[c].active = false
                } else
                    e.sysCategoryList[r].active = false
        }
        ,
        e.getSysImgByTag = function (t) {
            var s = $.inArray(t, e.sysImageTag);
            for (var r in e.sysImageTag)
                r == s ? (e.sysImageTag[r].active = true,
                    e.activeItem.params.imgListActive = e.sysImageTag[r].id,
                    e.page.numPages = a(),
                    e.pages = i(),
                    n(1),
                    e.currentImageList = o(e.activeItem.params.imgListActive, 1)) : e.sysImageTag[r].active = false
        }
        ,
        e.selectSvg = function (a, n) {
            var i = a.target.dataset.url;
            i = i.split("../"),
                t({
                    method: "GET",
                    url: window.sysinfo.siteroot + i[1]
                }).success(function (t) {
                    for (var a, n = $(t), i = n.length, s = 0; i > s; s++)
                        if ("svg" == n[s].tagName) {
                            a = n[s];
                            break
                        }
                    e.saveModulePosition();
                    var o = parseFloat($(a).attr("width"))
                        , r = parseFloat($(a).attr("height"));
                    o >= r ? e.activeItem.params.positionStyle.height = e.activeItem.params.positionStyle.width * r / o : e.activeItem.params.positionStyle.width = e.activeItem.params.positionStyle.height * o / r,
                        e.setModulePositionStyle(e.activeItem.params.positionStyle),
                        e.activeItem.params.svgValue = t,
                        $("#shapeModal").modal("hide")
                })
        }
        ,
        e.selectPage = function (t) {
            (t = parseInt(t)) > 0 && t <= e.page.numPages && (e.page.currentPage = t,
                e.pages = i(),
                n(t),
                e.currentImageList = o(e.activeItem.params.imgListActive, t))
        }
        ,
        e.getImgByPage = function () {
            var t = parseInt(e.page.toPage);
            t > 0 && t <= e.page.numPages && (e.page.currentPage = t,
                e.pages = i(),
                n(t),
                e.currentImageList = o(e.activeItem.params.imgListActive, t))
        }
    ;
    var a = function () {
        var t = s(e.activeItem.params.imgListActive);
        return Math.ceil(t / e.page.pageSize)
    }
        , n = function (t) {
        for (var a in e.pages)
            t == e.pages[a].number ? e.pages[a].active = true : e.pages[a].active = false
    }
        , i = function () {
        var t = [];
        if (e.page.numPages <= 5)
            for (i = 1; i <= e.page.numPages; i++)
                e.page.currentPage == i ? t.push({
                    number: i,
                    active: true
                }) : t.push({
                    number: i,
                    active: false
                });
        else {
            var a = e.page.currentPage - 2
                , n = e.page.currentPage + 2;
            if (a > 0)
                if (n <= e.page.numPages)
                    t = [{
                        number: a,
                        active: false
                    }, {
                        number: e.page.currentPage - 1,
                        active: false
                    }, {
                        number: e.page.currentPage,
                        active: true
                    }, {
                        number: e.page.currentPage + 1,
                        active: false
                    }, {
                        number: n,
                        active: false
                    }];
                else
                    for (i = e.page.numPages - 4; i <= e.page.numPages; i++)
                        i == e.page.currentPage ? t.push({
                            number: i,
                            active: true
                        }) : t.push({
                            number: i,
                            active: false
                        });
            else
                for (var i = 1; i <= 5; i++)
                    e.page.currentPage == i ? t.push({
                        number: i,
                        active: true
                    }) : t.push({
                        number: i,
                        active: false
                    })
        }
        return t
    }
        , s = function (t) {
        var a = 0;
        for (var n in e.sysImageList)
            t == e.sysImageList[n].parentid && a++;
        return a
    }
        , o = function (t, a) {
        var n = []
            , i = 0
            , s = ((a = parseInt(a) > 0 ? parseInt(a) : 1) - 1) * e.page.pageSize
            , o = a * e.page.pageSize;
        for (var r in e.sysImageList)
            t == e.sysImageList[r].parentid && (i >= s && i < o && n.push(e.sysImageList[r]),
                i++);
        return n
    }
}
]);

angular.module("wapeditorApp").controller("TextNavCtrl", ["$scope", function (e) {
    e.addItem = function () {
        e.activeItem.params.items.push({
            title: "",
            url: ""
        }),
            e.changeInnerHeight()
    }
        ,
        e.removeItem = function (t) {
            index = $.inArray(t, e.activeItem.params.items),
                items = _.clone(e.activeItem.params.items),
                e.activeItem.params.items = [];
            for (i in items)
                i != index && e.activeItem.params.items.push(items[i]);
            e.changeInnerHeight()
        }
}
]);

angular.module("wapeditorApp").controller("TitleCtrl", ["$scope", function (e) {
    e.changeNavEnable = function (t) {
        e.activeItem.params.tradition.nav.enable = t
    }
}
]);

angular.module("wapeditorApp").controller("WhiteCtrl", ["$scope", function (e) {
}
]);