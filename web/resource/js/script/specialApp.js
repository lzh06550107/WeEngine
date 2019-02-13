angular.module("specialApp", ["wapeditorApp"]);

angular.module("specialApp").controller("MainCtrl", ["$scope", "$timeout", "$uibModal", "widget", "config", "serviceCommon", "serviceSetStyle", "serviceBase", "serviceSpecialBase", "serviceSubmit", "serviceMultiSubmit", "serviceMultiPage", "serviceUpwardCompatible", "$sanitize", function (e, t, a, n, i, s, o, r, l, c, u, d, p, m) {
    e.modules = [],
        e.editors = [],
        e.allPages = i.allPages,
        e.multipage = i.multipage ? i.multipage : [],
        e.submit = {
            params: {},
            html: "",
            multipage: []
        },
        e.isNew = true,
    e.allPages && -1 == _.findIndex(e.allPages, {
        active: true
    }) && (e.isNew = false,
        e.allPages = [{
            property: e.allPages,
            active: true
        }]),
        r.setBaseData("isNew", e.isNew),
        e.allPages = e.allPages ? e.allPages : [{
            property: [],
            active: true
        }];
    var f = _.findIndex(e.allPages, {
        active: true
    });
    e.activeModules = f > -1 ? r.initActiveModules(e.allPages[f].property) : [],
        e.activePageIndex = f > -1 ? f : 0,
        l.setBaseData("activePageIndex", e.activePageIndex),
        e.activeItem = {},
        e.activeIndex = 0,
        e.index = e.activeModules.length ? s.getMaxScopeIndex(e.allPages) + 1 : 0,
        r.setBaseData("index", e.index),
        e.pageLength = _.isEmpty(e.activeModules) ? 1 : e.activeModules[0].params.pageLength ? e.activeModules[0].params.pageLength : 1,
        e.isMultiPage = 0 == e.index || !(e.activeModules[s.getHeaderIndex(e.activeModules)].params.pageLength > 1),
        e.isLongPage = 0 == e.index || (e.activeModules[s.getHeaderIndex(e.activeModules)].params.pageLength > 1 || 1 == e.activeModules[s.getHeaderIndex(e.activeModules)].params.pageLength && 1 == e.allPages.length),
        e.pageLengths = {
            1: 1,
            2: 2,
            3: 3,
            4: 4,
            5: 5
        },
        e.lineHeights = {
            1: 1,
            1.25: 1.25,
            1.5: 1.5,
            2: 2,
            2.5: 2.5
        },
        e.fontSizes = {
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
        },
        l.setBaseData("allPages", e.allPages),
        l.setBaseData("multipage", e.multipage),
        r.setBaseData("pageLength", e.pageLength),
    e.isNew || (e.activeModules = p.compatibility(e.activeModules),
    void 0 === e.activeModules[0].params.pageLength && (e.activeModules[0].params.pageLength = Math.ceil($(".modules").height() / 568)),
    e.activeModules[0].params.pageLength > 1 && (e.pageLength = e.activeModules[0].params.pageLength,
        e.isMultiPage = false,
        e.isLongPage = true,
        r.setBaseData("pageLength", e.pageLength),
        t(function () {
            $(".app-content").css("height", 568 * e.pageLength + "px")
        }, 100)),
        t(function () {
            var t = 0
                , a = height = "";
            $(".modules>div").each(function () {
                var n = parseInt($(this).attr("index"));
                if (a = $(this).find("div.ng-scope[ng-controller$='Ctrl']").css("width"),
                    height = $(this).find("div.ng-scope[ng-controller$='Ctrl']").css("height"),
                n > 0) {
                    for (var i in e.activeModules)
                        e.activeModules[i].index == n && (t += parseInt(e.activeModules[i].marginTop),
                            e.activeModules[i].params.positionStyle.width = parseInt(a),
                            e.activeModules[i].params.positionStyle.height = parseInt(height),
                            e.activeModules[i].params.positionStyle.top = t,
                            e.activeModules[i].positionStyle = "position:absolute;width:" + a + ";height:" + height + ";left:" + e.activeModules[i].params.positionStyle.left + "px;top:" + t + "px;",
                            $(this).find("div[ng-controller]").attr("style", e.activeModules[i].positionStyle));
                    t += parseInt(height)
                }
                i++
            }),
                r.setBaseData("activeModules", e.activeModules)
        }, 1e3));
    for (var g in e.activeModules)
        e.activeModules[g].originParams = angular.copy(e.activeModules[g].params);
    e.$on("serviceBase.editors.update", function (t, a) {
        e.editors = a
    }),
        e.$on("serviceBase.activeItem.update", function (t, a) {
            e.activeItem = a
        }),
        e.$on("serviceBase.activeModules.update", function (t, a) {
            e.activeModules = a
        }),
        e.$on("serviceBase.activeItem.params.update", function (t, a) {
            e.activeItem.params = a
        }),
        e.$on("serviceBase.activeItem.animationName.update", function (t, a) {
            e.activeItem.params.animationStyle.animationName = a
        }),
        e.$on("serviceBase.activeItem.style.update", function (t, a, n, i, s) {
            e.activeItem.params[a] = n,
                e.activeItem[a] = i,
            void 0 !== s && (e.activeItem.transform = s)
        }),
        e.$on("updateScope", function (t, a) {
            angular.forEach(a, function (t, a) {
                e[a] = t
            })
        }),
        e.addItem = function (e) {
            r.addItem(e)
        }
        ,
        e.editItem = function (e) {
            r.editItem(e)
        }
        ,
        e.deleteItem = function (e) {
            r.deleteItem(e)
        }
        ,
        e.submit = function (t) {
            e.submit = c.submit(),
                e.$apply("submit"),
                $(t.target).parents("form").submit()
        }
        ,
        e.multiSubmit = function (t) {
            e.submit = u.submit(),
                e.$apply("submit"),
                $(t.target).parents("form").submit()
        }
        ,
        e.init = function (t, a) {
            if (e.modules = r.setModules(t, a),
            e.activeModules.length > 0) {
                var n = [];
                angular.forEach(e.activeModules, function (e, t) {
                    e && n.push(e.id)
                })
            }
            angular.forEach(e.modules, function (e, t) {
                e.defaultshow && -1 == $.inArray(e.id, n) && r.addItem(e.id)
            })
        }
        ,
        e.setModulePositionStyle = function (e) {
            o.setModulePositionStyle(e)
        }
        ,
        e.eleAnimationIns = function (e) {
            o.eleAnimationIns(e)
        }
        ,
        e.savePagePosition = function () {
            o.savePagePosition(e.activeModules)
        }
        ,
        e.saveModulePosition = function () {
            o.saveModulePosition(e.activeItem)
        }
        ,
        e.changeTextAlign = function (t) {
            o.changeTextAlign(e.activeItem, t)
        }
        ,
        e.changeBorderWidth = function () {
            o.changeBorderWidth(e.activeItem)
        }
        ,
        e.changeInnerHeight = function () {
            o.changeInnerHeight(e.activeItem)
        }
        ,
        e.clearModuleStyle = function () {
            o.clearModuleStyle(e.activeItem)
        }
        ,
        e.changePageLength = function (t) {
            if (angular.isString(t))
                if ("minus" == t && e.pageLength > 1)
                    t = e.pageLength - 1;
                else {
                    if (!("plus" == t && e.pageLength < 5))
                        return false;
                    t = e.pageLength + 1
                }
            var a = o.changePageLength(t, e.activeModules);
            r.setBaseData("pageLength", parseInt(t)),
                r.setBaseData("activeModules", a)
        }
        ,
        e.insertPage = function () {
            d.insertPage(),
                e.init(null, ["header"])
        }
        ,
        e.navToPage = function (t) {
            d.navToPage(t),
                e.activeHeader()
        }
        ,
        e.removePage = function (t) {
            d.removePage(t),
                e.activeHeader()
        }
        ,
        e.copyPage = function (t, a) {
            d.copyPage(t, a),
                e.activeHeader()
        }
        ,
        e.changeLock = function () {
            e.activeItem.params.baseStyle.lock = !e.activeItem.params.baseStyle.lock
        }
        ,
        e.activeHeader = function () {
            for (var t in e.activeModules)
                if ("header" == e.activeModules[t].id) {
                    e.pageLength = e.activeModules[t].params.pageLength ? e.activeModules[t].params.pageLength : 1,
                        o.changePageLength(e.pageLength, e.activeModules),
                        r.setBaseData("activeItem", e.activeModules[0]),
                        e.editItem(e.activeModules[t].index);
                    break
                }
        }
        ,
        $(".multi-submit").on("click", function (t) {
            e.multiSubmit(t)
        }),
        $(".single-submit").on("click", function (t) {
            e.submit(t)
        }),
        e.init(null, ["header"]),
        e.activeHeader(),
        e.$watch("activeItem.params.baseStyle", function (e) {
            e && o.setModuleBaseStyle(e)
        }, true),
        e.$watch("activeItem.params.borderStyle", function (e) {
            e && o.setModuleBorderStyle(e)
        }, true),
        e.$watch("activeItem.params.shadowStyle", function (e) {
            e && o.setModuleShadowStyle(e)
        }, true),
        e.$watch("activeItem.params.animationStyle", function (e) {
            e && o.setModuleAnimationStyle(e)
        }, true),
        e.$watch("activeItem.params.positionStyle", function (e) {
            e && o.setModulePositionStyle(e)
        }, true)
}
]);

angular.module("specialApp").controller("SpecialDisplay", ["$scope", "serviceCopy", "config", function (e, t, a) {
    e.pages = a.pages,
        e.links = a.links,
        angular.forEach(e.pages, function (t, a) {
            t.copyLink = e.links.appHome + "id=" + t.id
        }),
        e.success = function (e) {
            var e = parseInt(e)
                ,
                a = $('<span class="label label-success" style="position:absolute;z-index:10"><i class="fa fa-check-circle"></i> 复制成功</span>');
            t.copySuccess(e, a)
        }
}
]);

angular.module("specialApp").directive("we7Multipage", function () {
    return {
        replace: true,
        templateUrl: "directive-multipage-multipage.html"
    }
});

angular.module("specialApp").service("serviceSpecialBase", ["$rootScope", "serviceBase", function (e, t) {
    var a = {}
        , n = {
        activePageIndex: 0,
        isMultiPage: true,
        isLongPage: true,
        allPages: [],
        multipage: []
    };
    return a.getBaseData = function (e) {
        return n[e]
    }
        ,
        a.setBaseData = function (e, t) {
            angular.isObject(e) ? angular.forEach(e, function (e, t) {
                n[t] = e
            }) : n[e] = t
        }
        ,
        a
}
]);

angular.module("specialApp").service("serviceCopy", ["$rootScope", function (e) {
    var t = {};
    return t.copySuccess = function (e, t) {
        var e = parseInt(e)
            , t = t
            , a = $("#copy-" + e).next().html();
        (!a || a.indexOf('<span class="label label-success" style="position:absolute;z-index:10"><i class="fa fa-check-circle"></i> 复制成功</span>') < 0) && $("#copy-" + e).after(t),
            setTimeout(function () {
                t.remove()
            }, 2e3)
    }
        ,
        t
}
]);

angular.module("specialApp").service("serviceMultiPage", ["$rootScope", "serviceCommon", "serviceBase", "serviceSpecialBase", "$window", function (e, t, a, n, i) {
    var s = {};
    return s.insertPage = function () {
        s.saveCurPage();
        var t = n.getBaseData("allPages")
            , i = n.getBaseData("activePageIndex");
        t[i].active = false,
            t.push({
                property: [],
                active: true
            }),
            $(".app-content").css("height", "568px"),
            i = _.findIndex(t, {
                active: true
            }),
            a.setBaseData({
                activeModules: [],
                pageLength: 1
            }),
            n.setBaseData({
                allPages: t,
                isMultiPage: true,
                isLongPage: false,
                activePageIndex: i
            }),
            e.$broadcast("updateScope", {
                allPages: t,
                isMultiPage: true,
                isLongPage: false,
                pageLength: 1,
                activePageIndex: i,
                activeModules: []
            })
    }
        ,
        s.navToPage = function (t) {
            var i = n.getBaseData("activePageIndex");
            if (i == t)
                return false;
            s.saveCurPage();
            var o = n.getBaseData("allPages")
                , r = o[t].property;
            o[i].active = false,
                o[t].active = true,
                i = t,
                a.setBaseData("activeModules", r),
                a.setBaseData("activeItem", r[0]),
                n.setBaseData({
                    allPages: o,
                    activePageIndex: i
                }),
                e.$broadcast("updateScope", {
                    allPages: o,
                    activePageIndex: i,
                    activeModules: r
                })
        }
        ,
        s.removePage = function (t) {
            var i = []
                , o = n.getBaseData("allPages")
                , r = n.getBaseData("multipage");
            if (1 == o.length)
                return false;
            s.saveCurPage(),
                r.splice(parseInt(t), 1);
            var l = _.clone(o)
                , c = o.length - 1 - t;
            o = [];
            for (var u in l)
                if (u != t)
                    switch (c) {
                        case 0:
                            parseInt(u) + 1 == t ? (o.push({
                                property: l[u].property,
                                active: true
                            }),
                                i = l[u].property) : o.push({
                                property: l[u].property,
                                active: false
                            });
                            break;
                        default:
                            u - 1 == t ? (o.push({
                                property: l[u].property,
                                active: true
                            }),
                                i = l[u].property) : o.push({
                                property: l[u].property,
                                active: false
                            })
                    }
            activePageIndex = _.findIndex(o, {
                active: true
            }),
            1 == o.length && (n.setBaseData({
                isMultiPage: true,
                isLongPage: true
            }),
                e.$broadcast("updateScope", {
                    isMultiPage: true,
                    isLongPage: true
                })),
                a.setBaseData("activeModules", i),
                n.setBaseData({
                    allPages: o,
                    activePageIndex: activePageIndex
                }),
                e.$broadcast("updateScope", {
                    allPages: o,
                    activePageIndex: activePageIndex,
                    activeModules: i
                })
        }
        ,
        s.copyPage = function (t, i) {
            s.saveCurPage();
            var o = a.getBaseData("index")
                , r = n.getBaseData("allPages")
                , l = n.getBaseData("multipage");
            l.splice(parseInt(t), 0, l[t]);
            var c = angular.copy(r);
            r = [];
            for (var u in c)
                if (u == t) {
                    r.push({
                        property: c[u].property,
                        active: false
                    });
                    var d = angular.copy(c[u].property);
                    for (var p in d)
                        d[p].index = o++;
                    r.push({
                        property: d,
                        active: true
                    });
                    var m = d
                } else
                    r.push({
                        property: c[u].property,
                        active: false
                    });
            activePageIndex = _.findIndex(r, {
                active: true
            }),
                a.setBaseData("activeModules", m),
                a.setBaseData("index", o),
                n.setBaseData({
                    allPages: r,
                    multipage: l,
                    isMultiPage: true,
                    isLongPage: false,
                    activePageIndex: activePageIndex
                }),
                i.stopPropagation(),
                e.$broadcast("updateScope", {
                    allPages: r,
                    isMultiPage: true,
                    isLongPage: false,
                    activePageIndex: activePageIndex,
                    activeModules: m
                })
        }
        ,
        s.saveCurPage = function () {
            var i = a.getBaseData("activeModules")
                , s = a.getBaseData("pageLength")
                , o = n.getBaseData("allPages")
                , r = n.getBaseData("multipage")
                , l = _.findIndex(o, {
                active: true
            })
                , c = "";
            $($(".modules").html()).find("div.ng-scope[ng-controller$='Ctrl']").each(function () {
                var e = $(this).parent().parent()
                    , n = _.findIndex(i, {
                    index: parseInt(e.attr("index"))
                })
                    , o = ""
                    , r = angular.copy(i[n].params);
                $(this).find(".js-default-content").remove(),
                    $(this).find(".bar").remove();
                var l = e.attr("name").toLowerCase();
                if ("header" != l) {
                    var u = $(this).css("top")
                        , d = $(this).css("left")
                        , p = $(this).css("width")
                        , m = $(this).css("height")
                        , f = "position:absolute;top:" + u + ";left:" + d + ";width:" + p + ";height:" + m + ";";
                    i[n].params.positionStyle.top = parseInt(u),
                        i[n].params.positionStyle.left = parseInt(d),
                        i[n].params.positionStyle.width = parseInt(p),
                        i[n].params.positionStyle.height = parseInt(m),
                        i[n].positionStyle = f
                } else
                    i[n].params.pageLength = s;
                switch (l) {
                    case "link":
                        var g = this;
                        angular.forEach(r.items, function (e, a) {
                            (e.selectCate.pid || e.selectCate.cid) && $(g).find(".list-group").children().eq(a).replaceWith("<div>" + t.buildDataTagBegin("link", e) + '<div class="list-group-item ng-scope"><a href="{$row[url]}" class="clearfix"><span class="app-nav-title"> {$row[title]}<i class="pull-right fa fa-angle-right"></i></span></a></div>' + t.buildDataTagEnd() + "</div>")
                        });
                        break;
                    case "richtext":
                        i[n] && (i[n].params.content = "")
                }
                if (o = $(this).html(),
                    !a.getBaseData("isNew")) {
                    var h = parseInt(u) - 64;
                    $(this).css("top", h + "px")
                }
                if ("header" != l) {
                    f = $(this).attr("style");
                    c += '<div type="' + l + '" style="' + f + '">' + o + "</div>"
                }
            }),
                c = c.replace(/<\!\-\-([^-]*?)\-\->/g, ""),
                c = c.replace(/ ng\-[a-zA-Z-]+=\"[^\"]*\"/g, ""),
                c = c.replace(/ ng\-[a-zA-Z]+/g, ""),
                r[l] = c,
                o[l].property = i,
                a.setBaseData("activeModules", i),
                n.setBaseData({
                    allPages: o,
                    multipage: r
                }),
                e.$broadcast("updateScope", {
                    activeModules: i,
                    allPages: o,
                    multipage: r
                })
        }
        ,
        s
}
]);

angular.module("specialApp").service("serviceMultiSubmit", ["serviceCommon", "serviceMultiPage", "serviceSpecialBase", function (e, t, a) {
    var n = {};
    return n.submit = function (n) {
        t.saveCurPage();
        var i = a.getBaseData("multipage")
            , s = a.getBaseData("allPages")
            , o = ""
            ,
            r = '<section class="u-arrow-bottom" style="bottom: 15%;"><div class="pre-wrap"><div class="pre-box1"><div class="pre1"></div></div><div class="pre-box2"><div class="pre2"></div></div></div></section></div>';
        $.each(i, function (e, t) {
            e + 1 == i.length ? o += 1 == s.length ? '<div class="pane">' + t + "</div>" : '<div class="pane overflowhidden">' + t + "</div>" : o += 1 == s.length ? '<div class="pane">' + t + r : '<div class="pane overflowhidden">' + t + r
        });
        for (var l in s)
            for (var c in s[l].property)
                delete s[l].property[c].originParams,
                    delete s[l].property[c].marginTop;
        var u = {}
            , d = $(".app-content").css("height");
        return o = '<div style="height:' + d + '"><div class="panes">' + o + "</div></div>",
            o = o.replace(/<\!\-\-([^-]*?)\-\->/g, ""),
            o = o.replace(/ ng\-[a-zA-Z-]+=\"[^\"]*\"/g, ""),
            o = o.replace(/ ng\-[a-zA-Z]+/g, ""),
            u.html = o,
            u.params = angular.copy(s),
            u.multipage = i,
            e.stripHaskey(u.params),
            u
    }
        ,
        n
}
]);