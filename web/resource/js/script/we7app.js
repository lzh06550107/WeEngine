angular.module("we7app", ["ngAnimate", "ngSanitize", "ui.bootstrap", "angular-clipboard"]);

angular.module("we7app").run(["$rootScope", function (rootScope) {  //run方法初始化全局数据，只对全局作用域起作用
    rootScope.URL = "test"
}
]);

// http拦截器一般通过定义factory的方式实现
angular.module("we7app").factory("interceptors", [function () {
    return {
        request: function (config) {
            config.beforeSend && config.beforeSend();
            return config;
        },
        response: function (response) {
            response.config.complete && response.config.complete(response);
            return response;
        }
    }
}
]);

// config()方法对模块进行配置
angular.module("we7app").config(["$httpProvider", function ($httpProvider) {
    $httpProvider.interceptors.push("interceptors"); // 拦截器加入到$httpProvider.interceptors数组中
    $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
    $httpProvider.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var dataHandler = function (postData) {
        var attr, value, name, item, object, index, queryString = "";
        for (attr in postData)
            if ((value = postData[attr]) instanceof Array)
                for (index = 0; index < value.length; ++index) {
                    item = value[index];
                    (object = {})[attr + "[" + index + "]"] = item;
                    queryString += dataHandler(object) + "&";
                }
            else if (value instanceof Object)
                for (name in value) {
                    item = value[name];
                    (object = {})[attr + "[" + name + "]"] = item;
                    queryString += dataHandler(object) + "&";
                }
            else { // 用void 0是为了防止undefined被重写而出现判断不准确的情况
                if (void 0 !== value && null !== value) {
                    queryString += encodeURIComponent(attr) + "=" + encodeURIComponent(value) + "&"
                }
            }
        return queryString.length ? queryString.substr(0, queryString.length - 1) : queryString
    };
    // 在请求发送前和响应还没有触发callback前对post data 做一些处理，post的时候如果data是对象将json化
    $httpProvider.defaults.transformRequest = [function (postData) {
        return angular.isObject(postData) && "[object File]" !== String(postData) ? dataHandler(postData) : postData
    }]
}
]);

angular.module("we7app").directive("we7Colorpicker", [function () {
    return {
        templateUrl: "directive-colorpicker-colorpicker.html",
        scope: {
            colorValue: "=we7MyColor",
            colorDefault: "=we7MyDefaultColor",
            colorFormName: "=we7FormName"
        },
        link: function (e, t, a) {

            if (!$(t).data("data-colorpicker-init")) {
                util.colorpicker(t, function (a) {
                    $(t).parent().parent().find(":text").val(a.toHexString());
                    e.colorValue = a.toHexString();
                    e.$apply("colorValue");
                    e.$watch("colorValue", function (a) {
                        $(t).spectrum("get") != a && ($(t).spectrum("set", a || e.colorDefault),
                            $(t).parent().parent().find(":text").val(a || e.colorDefault),
                            $(t).parent().parent().find(".input-group-addon").css("background-color", a || e.colorDefault))
                    });
                });
                $(t).find(".colorclean").click(function () {
                    return $(t).find(":text").val("rgba(0,0,0,0)"),
                        $(t).find(".input-group-addon").css("background-color", "rgba(0,0,0,0)"),
                        e.colorValue = e.colorDefault = "rgba(0,0,0,0)",
                        $(t).spectrum("set", e.colorDefault),
                        e.$apply("colorValue"),
                        false
                });
                $(t).data("data-colorpicker-init", true);
            }
        }
    }
}
]);

angular.module("we7app").directive("we7DatePicker", ["$http", "$parse", function () {
    return {
        transclude: true,
        template: "<span ng-transclude></span>",
        scope: {
            dateValue: "=we7DateValue"
        },
        link: function (e, t, a) {
            var n = {
                lang: "zh",
                step: "1",
                format: "Y-m-d H:i:s",
                closeOnDateSelect: true,
                onSelectDate: function (t, a) {
                    e.dateValue = t.dateFormat("Y-m-d H:i:s"),
                        e.$apply("dateValue")
                },
                onSelectTime: function (t, a) {
                    e.dateValue = t.dateFormat("Y-m-d H:i:s"),
                        e.$apply("dateValue")
                }
            };
            $(t).datetimepicker(n)
        }
    }
}
]);

angular.module("we7app").directive("we7DateRangePicker", ["$compile", "$parse", "$filter", function (e, t, a) {
    return {
        restrict: "A",
        require: "?ngModel",
        link: function (e, n, i, s) {
            require(["daterangepicker"], function () {
                function o(e) {
                    return moment.isMoment(e) ? e.toDate() : e
                }

                function r(e) {
                    return moment.isMoment(e) ? e : moment(e)
                }

                function l(e) {
                    return a("date")(o(e), u.format.replace(/Y/g, "y").replace(/D/g, "d"))
                }

                function c(e) {
                    return [l(e.startDate), l(e.endDate)].join(u.separator)
                }

                var u = {};
                u.format = i.format || "YYYY-MM-DD",
                    u.separator = i.separator || " - ",
                    u.minDate = i.minDate && moment(i.minDate),
                    u.maxDate = i.maxDate && moment(i.maxDate),
                    u.dateLimit = i.limit && moment.duration.apply(this, i.limit.split(" ").map(function (e, t) {
                        return 0 === t && parseInt(e, 10) || e
                    })),
                    u.ranges = i.ranges && t(i.ranges)(e),
                    u.locale = i.locale && t(i.locale)(e),
                    u.opens = i.opens || t(i.opens)(e),
                i.enabletimepicker && (u.timePicker = true,
                    angular.extend(u, t(i.enabletimepicker)(e))),
                    s.$render = function () {
                        s.$viewValue && s.$viewValue.startDate && n.val(c(s.$viewValue))
                    }
                    ,
                    e.$watch(function () {
                        return i.ngModel
                    }, function (t, a) {
                        e[t] && e[t].startDate ? a === t && (n.data("daterangepicker").startDate = r(e[t].startDate),
                            n.data("daterangepicker").endDate = r(e[t].endDate),
                            n.data("daterangepicker").updateView(),
                            n.data("daterangepicker").updateCalendars(),
                            n.data("daterangepicker").updateInputText()) : s.$setViewValue({
                            startDate: moment().startOf("day"),
                            endDate: moment().startOf("day")
                        })
                    }),
                    n.daterangepicker(u, function (t, a, n) {
                        var i = s.$viewValue;
                        angular.equals(t, i.startDate) && angular.equals(a, i.endDate) || e.$apply(function () {
                            s.$setViewValue({
                                startDate: moment.isMoment(i.startDate) ? t : t.toDate(),
                                endDate: moment.isMoment(i.endDate) ? a : a.toDate()
                            }),
                                s.$render()
                        })
                    })
            })
        }
    }
}
]);

angular.module("we7app").directive("we7Editor", function () {
    var e = {
        scope: {
            value: "=?we7MyValue",
            params: "=?we7MyParams"
        },
        template: '<textarea id="" rows="10" style="height:600px;width:100%"></textarea>',
        link: function (t, a, n) {
            if (!a.data("editor")) {
                a.find("textarea").attr("id", "editor" + (new Date).getTime());
                var i = {
                    autoClearinitialContent: false,
                    toolbars: [["fullscreen", "source", "preview", "|", "bold", "italic", "underline", "strikethrough", "forecolor", "backcolor", "|", "justifyleft", "justifycenter", "justifyright", "|", "insertorderedlist", "insertunorderedlist", "blockquote", "emotion", "link", "removeformat", "|", "rowspacingtop", "rowspacingbottom", "lineheight", "indent", "paragraph", "fontfamily", "fontsize", "|", "inserttable", "deletetable", "insertparagraphbeforetable", "insertrow", "deleterow", "insertcol", "deletecol", "mergecells", "mergeright", "mergedown", "splittocells", "splittorows", "splittocols", "|", "anchor", "map", "print", "drafts"]],
                    elementPathEnabled: false,
                    initialFrameHeight: 200,
                    focus: false,
                    maximumWords: 9999999999999,
                    autoFloatEnabled: false
                };
                e = UE.getEditor(a.find("textarea").attr("id"), i),
                    a.data("editor", e),
                    e.addListener("contentChange", function () {
                        t.value = e.getContent(),
                        t.value && (t.params = t.value.replace(/\&quot;/g, "#quot;")),
                        t.$root.$$phase || t.$apply("value")
                    }),
                    e.addListener("ready", function () {
                        !t.value && t.params && (t.value = t.params.replace(/\#quot;/g, "&quot;")),
                        t.value && e && e.getContent() != t.value && e.setContent(t.value),
                            t.$watch("value", function (t) {
                                e && e.getContent() != t && e.setContent(t || "")
                            })
                    })
            }
        }
    };
    return e
});

angular.module("we7app").directive("we7Iconer", ["$templateCache", function (e) {
    e.get("directive-iconer-nav-pills-inline.html"),
        e.get("directive-iconer-tab-content-inline.html");
    return {
        scope: {
            image: "=we7MyImage",
            icon: "=we7MyIcon",
            iconcolor: "=we7MyIconColor"
        },
        transclude: true,
        templateUrl: "directive-iconer-iconer.html",
        link: function (e, t, a) {
            e.selectIcon = function () {
                require(["fileUploader"], function (t) {
                    t.show(function (t) {
                        e.icon = {},
                            e.icon.name = t.name,
                            e.icon.color = t.color,
                            e.$apply("image"),
                            e.$apply("icon")
                    }, {
                        direct: true,
                        multiple: false,
                        type: "icon",
                        otherVal: e.iconcolor
                    })
                })
            }
                ,
                e.removeIcon = function () {
                    e.image = "",
                        e.icon = {}
                }
        }
    }
}
]);

angular.module("we7app").directive("we7InitialSearchbar", function () {
    return {
        templateUrl: "directive-initialsearchbar-searchbar.html",
        scope: {
            doSearch: "&we7SearchCallback"
        },
        link: function (e, t, a) {
            e.alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
                e.searchResult = function (t) {
                    e.activeLetter = t,
                        e.doSearch({
                            letter: t
                        })
                }
        }
    }
});

// 新建素材里面的选择链接
angular.module("we7app").directive("we7Linker", ["$http", "$templateCache", function ($http, $templateCache) {
    var cmsHeaderInlineHtml = $templateCache.get("directive-linker-cms-header-inline.html")
        , cmsContentInlineHtml = $templateCache.get("directive-linker-cms-content-inline.html")
        , cmsArticleItemInlineHtml = $templateCache.get("directive-linker-cms-article-item-inline.html")
        , cmsCateItemInlineHtml = $templateCache.get("directive-linker-cms-cate-item-inline.html")
        , newsContentInlineHtml = $templateCache.get("directive-linker-news-content-inline.html")
        , newsItemInlineHtml = $templateCache.get("directive-linker-news-item-inline.html")
        , pageContentInlineHtml = $templateCache.get("directive-linker-page-content-inline.html")
        , pageItemInlineHtml = $templateCache.get("directive-linker-page-item-inline.html")
        , mapContentInlineHtml = $templateCache.get("directive-linker-map-content-inline.html")
        , telContentInlineHtml = $templateCache.get("directive-linker-tel-content-inline.html");

    return {
        templateUrl: "directive-linker-linker.html",
        scope: {
            url: "=we7MyUrl",
            title: "=we7MyTitle"
        },
        link: function (t, m, f) {
            m.find(".input-group-btn").mouseover(function (e) {
                clearTimeout(t.timer);
                m.find(".dropdown-menu").show();
            }).mouseout(function () {
                t.timer = setTimeout(function () {
                    m.find(".dropdown-menu").hide();
                }, 500)
            });

            m.find(".dropdown-menu").mouseover(function () {
                clearTimeout(t.timer);
                m.find(".dropdown-menu").show();
            }).mouseout(function () {
                t.timer = setTimeout(function () {
                    m.find(".dropdown-menu").hide();
                }, 500)
            });

            t.addLink = function (e, a) {
                t.url = e;
                a && (t.title = a);
            };

            t.searchSystemLinker = function () {
                t.modalobj = util.dialog("请选择链接", ["./index.php?c=utility&a=link&callback=selectLinkComplete"], "", {
                    containerName: "link-search-system"
                });
                t.modalobj.modal({
                    keyboard: false
                });
                t.modalobj.find(".modal-body").css({
                    height: "680px",
                    "overflow-y": "auto"
                });
                t.modalobj.modal("show");
                window.selectLinkComplete = function (e, a) {
                    t.addLink(e, a);
                    t.$apply("url", "title");
                    t.modalobj.modal("hide");
                };
            };

            t.searchCmsLinker = function (r) {
                var l = {};
                l.header = cmsHeaderInlineHtml;
                l.content = cmsContentInlineHtml;
                l.footer = "";
                l.articleitem = cmsArticleItemInlineHtml;
                l.cateitem = cmsCateItemInlineHtml;

                if ($("#link-search-cms")[0]) {
                    t.modalobj = $("#link-search-cms").data("modal");
                } else {
                    t.modalobj = util.dialog(l.header, l.content, l.footer, {
                        containerName: "link-search-cms"
                    });
                    t.modalobj.find(".modal-body").css({
                        height: "680px",
                        "overflow-y": "auto"
                    });
                    t.modalobj.modal("show");
                    t.modalobj.on("hidden.bs.modal", function () {
                        t.modalobj.remove()
                    });
                    $("#link-search-cms").data("modal", t.modalobj);
                }

                r = r || 1;
                var c = $("#articlelist .article-list-input").val();
                $http.get("./index.php?c=utility&a=link&do=articlelist&page=" + r + "&keyword=" + c).success(function (e, a, n, s) {
                    var o = {
                        items: []
                    };
                    e.message = e.message.message;
                    if (e.message.list) {
                        for (i in e.message.list)
                            o.items.push({
                                title: e.message.list[i].title,
                                id: e.message.list[i].id,
                                uniacid: e.message.list[i].uniacid,
                                attachment: e.message.list[i].thumb_url,
                                createtime: e.message.list[i].createtime
                            });
                        t.modalobj.find("#articlelist tbody").html(_.template(l.articleitem)(o));
                            t.modalobj.find("#pager").html(e.message.pager);
                            t.modalobj.find("#pager .pagination li[class!='active'] a").click(function () {
                                t.searchCmsLinker($(this).attr("page"));
                                return false;
                            });
                            t.modalobj.find("#articlelist .input-group-btn").click(function () {
                                t.searchCmsLinker();
                                 return false;
                            });
                            t.modalobj.find(".js-btn-select").click(function () {
                                t.addLink($(this).attr("js-url"), $(this).attr("js-title"));
                                    t.$apply("url", "title");
                                    t.modalobj.modal("hide");
                            });
                    }
                });
                var u = $("#category .category-list-input").val();
                $http.get("./index.php?c=utility&a=link&do=catelist&page=" + r + "&keyword=" + u).success(function (e, a, n, s) {
                    var o = {
                        items: []
                    };
                    e.message = e.message.message;
                    if (e.message) {
                        for (i in e.message)
                            o.items.push({
                                id: e.message[i].id,
                                uniacid: e.message[i].uniacid,
                                name: e.message[i].name,
                                children: e.message[i].children
                            });
                        t.modalobj.find("#category tbody").html(_.template(l.cateitem)(o));
                            t.modalobj.find("#category .input-group-btn").click(function () {
                                t.searchCmsLinker();
                                  return false;
                            }),
                            t.modalobj.find(".js-btn-select").click(function () {
                                t.addLink($(this).attr("js-url"), $(this).attr("js-title"));
                                    t.$apply("url", "title");
                                    t.modalobj.modal("hide");
                            })
                    }
                })
            };

            t.searchNewsLinker = function (a) {
                var n = {};
                n.content = newsContentInlineHtml;
                    n.footer = "";
                    n.newsitem = newsItemInlineHtml;

                    if ($("#link-search-news")[0]) {
                        t.modalobj = $("#link-search-news").data("modal");
                    } else {
                        t.modalobj = util.dialog(n.header, n.content, n.footer, {
                            containerName: "link-search-news"
                        });
                            t.modalobj.find(".modal-body").css({
                                height: "680px",
                                "overflow-y": "auto"
                            });
                            t.modalobj.modal("show");
                            t.modalobj.on("hidden.bs.modal", function () {
                                t.modalobj.remove()
                            });
                            $("#link-search-news").data("modal", t.modalobj);
                    }

                    a = a || 1;
                var s = $("#newslist .news-list-input").val();
                $http.get("./index.php?c=utility&a=link&do=newslist&page=" + a + "&keyword=" + s).success(function (e, a, s, o) {
                    var r = {
                        items: []
                    };
                    e.message = e.message.message;
                    if (e.message.list) {
                        for (i in e.message.list)
                            r.items.push({
                                title: e.message.list[i].title,
                                id: e.message.list[i].id,
                                uniacid: window.sysinfo.uniacid,
                                attachment: e.message.list[i].thumb_url,
                                createtime: e.message.list[i].createtime,
                                url: e.message.list[i].url
                            });
                        t.modalobj.find("#newslist tbody").html(_.template(n.newsitem)(r)),
                            t.modalobj.find("#pager").html(e.message.pager);
                            t.modalobj.find("#pager .pagination li[class!='active'] a").click(function () {
                                t.searchNewsLinker($(this).attr("page"));
                                return false;
                            }),
                            t.modalobj.find("#newslist .input-group-btn").click(function () {
                                t.searchNewsLinker();
                                return false;
                            });
                            t.modalobj.find(".js-btn-select").click(function () {
                                t.addLink($(this).attr("js-url"), $(this).attr("js-title"));
                                    t.$apply("url", "title");
                                    t.modalobj.modal("hide");
                            })
                    }
                })
            };

            t.searchPageLinker = function (a) {
                var n = {};
                n.content = pageContentInlineHtml;
                    n.footer = "";
                    n.pageItem = pageItemInlineHtml;

                    if ($("#link-search-page")[0]) {
                        t.modalobj = $("#link-search-page").data("modal")
                    } else {
                        t.modalobj = util.dialog(n.header, n.content, n.footer, {
                            containerName: "link-search-page"
                        });
                            t.modalobj.find(".modal-body").css({
                                height: "680px",
                                "overflow-y": "auto"
                            });
                            t.modalobj.modal("show");
                            t.modalobj.on("hidden.bs.modal", function () {
                                t.modalobj.remove()
                            });
                            $("#link-search-page").data("modal", t.modalobj);
                    }
                    a = a || 1;
                var s = $("#pageList .page-list-input").val();
                $http.get("./index.php?c=utility&a=link&do=pagelist&&page=" + a + "&keyword=" + s).success(function (e, a, s, o) {
                    var r = {
                        items: []
                    };
                    e.message = e.message.message;
                    if (e.message.list) {
                        for (i in e.message.list)
                            r.items.push({
                                title: e.message.list[i].title,
                                id: e.message.list[i].id,
                                uniacid: window.sysinfo.uniacid,
                                createtime: e.message.list[i].createtime
                            });
                        t.modalobj.find("#pageList tbody").html(_.template(n.pageItem)(r)),
                            t.modalobj.find("#pager").html(e.message.pager),
                            t.modalobj.find("#pager .pagination li[class!='active'] a").click(function () {
                                return t.searchPageLinker($(this).attr("page")),
                                    false
                            }),
                            t.modalobj.find("#pageList .input-group-btn").click(function () {
                                return t.searchPageLinker(),
                                    false
                            }),
                            t.modalobj.find(".js-btn-select").click(function () {
                                t.addLink($(this).attr("js-url"), $(this).attr("js-title")),
                                    t.$apply("url", "title"),
                                    t.modalobj.modal("hide")
                            })
                    }
                })
            };

            t.searchMapPosLinker = function () {
                var e = {};
                e.content = mapContentInlineHtml,
                    t.modalobj = util.dialog(e.content),
                    t.modalobj.modal("show"),
                    t.modalobj.find("#getnav").click(function () {
                        t.addLink("https://api.map.baidu.com/marker?location=" + $("#navlat").val() + "," + $("#navlng").val() + "&title=" + $("#navtitle").val() + "&name=" + $("#navtitle").val() + "&output=html&src=we7", $("#navtitle").val()),
                            t.$apply("url", "title"),
                            t.modalobj.modal("hide")
                    })
            };

            t.addTelLinker = function () {
                var e = {};
                e.content = telContentInlineHtml,
                    t.modalobj = util.dialog("一键拨号", e.content),
                    t.modalobj.modal("show"),
                    t.modalobj.find(".btn-primary").click(function () {
                        t.addLink("tel:" + t.modalobj.find("#telphone").val(), ""),
                            t.$apply("url", "title"),
                            t.modalobj.modal("hide")
                    })
            }
        }
    }
}
]);

angular.module("we7app").directive("we7ResourcePicker", function () {
    return {
        scope: {
            type: "@type",
            isWechat: "@isWechat",
            multiple: "@mutiple",
            showType: "@showType",
            needType: "@needType",
            global: "@global",
            dest_dir: "@dest_dir",
            onSelect: "&onSelect"
        },
        link: function (e, t, a) {
            $(t).unbind("click").on("click", function () {
                e.show()
            }),
                $(window).unbind("resource_selected").on("resource_selected", function (t, a) {
                    e.finish(a.type, a.items)
                })
        },
        controller: function (e) {
            var t = function (e) {
                return "<div " + ("we7-resource-" + e + "-dialog") + ' class="uploader-modal modal fade ' + e + '" id="material-Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2"></div>'
            };
            e.show = function () {
                var a = {
                    type: e.type,
                    isWechat: "true" === e.isWechat,
                    multiple: "true" === e.multiple,
                    needType: e.needType <= 3 ? e.needType : 3,
                    global: "true" === e.global,
                    dest_dir: e.dest_dir
                };
                $("#material-Modal").remove();
                var n = t(e.type);
                $(document.body).prepend(n);
                var i = $("#material-Modal");
                i.modal("show");

                angular.module("we7resource").value("config", a);

                angular.bootstrap(i, ["we7resource"])
            }
                ,
                e.finish = function (t, a) {
                    e.onSelect({
                        type: t,
                        items: a
                    }),
                        $("#material-Modal").modal("hide")
                }
        }
    }
});

angular.module("we7app").run(["$templateCache", function (templateCache) {
    "use strict";

    templateCache.put("directive-iconer-nav-pills-inline.html", '<li id="li_icon" role="presentation"><a href="#icon" aria-controls="icon" role="tab" data-toggle="tab">图标</a></li>');

    templateCache.put("directive-iconer-tab-content-inline.html", '<div id="icon" class="tab-pane icon form-horizontal" role="tabpanel"><div class="form-group" style="border-bottom:1px solid #e5e5e5; padding:0 0 15px 0; margin:10px 0 0 0"><label class="col-xs-3 control-label">图标颜色</label><div class="col-xs-9"><input type="color" value="" class="form-control" id="iconcolor" onchange="$(this).parents(\'#icon\').attr(\'color\', this.value);$(this).parents(\'#icon\').find(\'i\').css(\'color\', this.value)"></div></div></div>');

    templateCache.put("directive-linker-cms-article-item-inline.html", '<%_.each(items, function(item) {%><tr><td><a href="#" data-cover-attachment-url="<%=item.attachment%>" title="<%=item.title%>"><%=item.title%></a></td><td><%=item.createtime%></td><td class="text-right"><button class="btn btn-default js-btn-select" js-url="./index.php?c=site&a=site&do=detail&id=<%=item.id%>&i=<%=item.uniacid%>" js-title="<%=item.title%>">选取</button></td></tr><%});%>');

    templateCache.put("directive-linker-cms-cate-item-inline.html", '<%_.each(items, function(item) {%><tr><td colspan="2"><a href="#"><%=item.name%></a></td><td class="text-right"><a class="btn btn-default js-btn-select" js-url="./index.php?c=site&a=site&cid=<%=item.id%>&i=<%=item.uniacid%>" js-title="<%=item.name%>">选取</a></td></tr><%_.each(item.children, function(child) {%><tr><td colspan="2" style="padding-left:50px;height:30px;line-height:30px;background-image:url(\\\'./resource/images/bg_repno.gif\\\'); background-repeat:no-repeat; background-position: -245px -540px"><a href="#"><%=child.name%></a></td><td class="text-right"><a class="btn btn-default js-btn-select" js-url="./index.php?c=site&a=site&cid=<%=child.id%>&i=<%=child.uniacid%>" js-title="<%=child.name%>">选取</a></td></tr><%});%><%});%>');

    templateCache.put("directive-linker-cms-content-inline.html", '<div class="tab-content"><div id="articlelist" class="tab-pane active" role="tabpanel"><table class="table table-hover"><thead class="navbar-inner"><tr><th style="width:40%">标题</th><th style="width:30%">创建时间</th><th style="width:30%; text-align:right"><div class="input-group input-group-sm"><input type="text" class="form-control article-list-input"> <span class="input-group-btn"><button class="btn btn-default" type="button"><i class="fa fa-search"></i></button></span></div></th></tr></thead><tbody></tbody></table><div id="pager" style="text-align:center"></div></div><div id="category" class="tab-pane" role="tabpanel"><table class="table table-hover"><thead class="navbar-inner"><tr><th style="width:40%">标题</th><th style="width:30%">创建时间</th><th style="width:30%; text-align:right"><div class="input-group input-group-sm"><input type="text" class="form-control category-list-input"> <span class="input-group-btn"><button class="btn btn-default" type="button"><i class="fa fa-search"></i></button></span></div></th></tr></thead><tbody></tbody></table><div id="pager" style="text-align:center"></div></div></div>');

    templateCache.put("directive-linker-cms-header-inline.html", '<ul role="tablist" class="nav nav-pills" style="font-size:14px; margin-top:-20px"><li role="presentation" class="active" id="li_goodslist"><a data-toggle="tab" role="tab" aria-controls="articlelist" href="#articlelist">文章</a></li><li role="presentation" class="" id="li_category"><a data-toggle="tab" role="tab" aria-controls="category" href="#category">分类</a></li></ul>');

    templateCache.put("directive-linker-map-content-inline.html", '<div class="model-dialog"><div class="model-content"><div class="modal-header"><h4 class="modal-title" id="myModalLabel">一键导航</h4></div><div class="modal-body"><form action="" class="form-horizontal" role="form" enctype="multipart/form-data"><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 col-lg-2 control-label"><span style="font-size:16px">标题</span></label><div class="col-sm-9 col-xs-12"><input type="text" id="navtitle" class="form-control" name="navtitle" value=""></div></div><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 col-lg-2 control-label"><span style="font-size:16px">地理位置</span></label><div class="col-sm-9 col-xs-12"><div class="row row-fix"><div class="col-xs-4 col-sm-4"><input type="text" name="navtitle[lng]" id="navlng" value="" placeholder="地理经度" class="form-control"></div><div class="col-xs-4 col-sm-4"><input type="text" name="navtitle[lat]" id="navlat" value="" placeholder="地理纬度" class="form-control"></div><div class="col-xs-4 col-sm-4"><button onclick="showCoordinate(this)" class="btn btn-default" type="button">选择坐标</button></div></div><script type="text/javascript">function showCoordinate(elm) {\r\n\t\t\t\t\tvar val = {};\r\n\t\t\t\t\tval.lng = parseFloat($(elm).parent().prev().prev().find(":text").val());\r\n\t\t\t\t\tval.lat = parseFloat($(elm).parent().prev().find(":text").val());\r\n\t\t\t\t\tutil.qqmap(val, function(r){\r\n\t\t\t\t\t\t$(elm).parent().prev().prev().find(":text").val(r.lng);\r\n\t\t\t\t\t\t$(elm).parent().prev().find(":text").val(r.lat);\r\n\t\t\t\t\t});\r\n\t\t\t\t};<\/script></div></div></form></div></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal" id="getnav">确定</button></div></div>');

    templateCache.put("directive-linker-news-content-inline.html", '<div id="newslist" class="tab-pane active" role="tabpanel"><table class="table table-hover"><thead class="navbar-inner"><tr><th style="width:40%">标题</th><th style="width:30%">创建时间</th><th style="width:30%; text-align:right"><div class="input-group input-group-sm"><input type="text" class="form-control news-list-input"> <span class="input-group-btn"><button class="btn btn-default" type="button"><i class="fa fa-search"></i></button></span></div></th></tr></thead><tbody></tbody></table><div id="pager" style="text-align:center"></div></div>');

    templateCache.put("directive-linker-news-item-inline.html", '<%_.each(items, function(item) {%><tr><td><a href="#" data-cover-attachment-url="<%=item.attachment%>" title="<%=item.title%>"><%=item.title%></a></td><td><%=item.createtime%></td><td class="text-right"><button class="btn btn-default js-btn-select" js-url="<%=item.url%>" js-title="<%=item.title%>">选取</button></td></tr><%});%>');

    templateCache.put("directive-linker-page-content-inline.html", '<div id="pageList" class="tab-pane active" role="tabpanel"><table class="table table-hover"><thead class="navbar-inner"><tr><th style="width:40%">名称</th><th style="width:30%">创建间</th><th style="width:30%; text-align:right"><div class="input-group input-group-sm"><input type="text" class="form-control page-list-input"> <span class="input-group-btn"><button class="btn btn-default" type="button"><i class="fa fa-search"></i></button></span></div></th></tr></thead><tbody></tbody></table><div id="pager" style="text-align:center"></div></div>');

    templateCache.put("directive-linker-page-item-inline.html", '<%_.each(items, function(item) {%><tr><td><a href="#" title="<%=item.title%>"><%=item.title%></a></td><td><%=item.createtime%></td><td class="text-right"><button class="btn btn-default js-btn-select" js-url="./index.php?i=<%=item.uniacid%>&c=home&a=page&id=<%=item.id%>" js-title="<%=item.title%>">选取</button></td></tr><%});%>');

    templateCache.put("directive-linker-tel-content-inline.html", '<div class="" id="telphone-modal"><div class="form-group list-group-item clearfix"><label style="margin-top:5px" class="col-xs-12 col-sm-2 col-md-2 control-label">号码</label><div class="col-sm-6"><input type="text" value="" id="telphone" name="telphone" class="form-control"></div><div class="col-sm-4"><a class="btn btn-primary" href="javascript:;">确定</a></div></div></div>');

    templateCache.put("fans-tag-selector.html", '<div style="text-align:left" class="modal fade {{modalClass}}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="myModalLabel">勾选粉丝标签（每个粉丝最多3个标签）</h4></div><div class="modal-body row"><label class="checkbox-inline col-md-3" style="margin-left:0px" ng-repeat="tag in tags" ng-click="checkMaxNumb($event)"><input type="checkbox" value="{{tag.id}}" ng-model="selectTags[tag.id]"> {{tag.name}}</label></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">取消</button> <button type="button" class="btn btn-primary" ng-click="tagSubmit($event)" data-dismiss="modal">确定</button></div></div></div></div>');

    templateCache.put("widget-musicform-musicform.html", '<div class="modal-body material-content clearfix"><div id="music" class="material-body we7-form"><form action="" method="post" class="form-horizontal"><div class="form-group"><label class="col-sm-2 control-label">音乐标题</label><div class="col-sm-10"><input type="text" class="form-control" placeholder="添加音乐消息的标题" ng-model="$ctrl.music.title"></div></div><div class="form-group"><label class="col-sm-2 control-label">选择音乐</label><div class="col-sm-10"><div class="input-group"><input type="text" class="form-control" readonly ng-model="$ctrl.music.url"> <span class="input-group-btn"><button class="btn btn-default" type="button" ng-click="$ctrl.selectVoice()">选择媒体文件</button></span></div><div class="help-block">选择上传的音频文件或直接输入URL地址，常用格式：mp3</div></div></div><div class="form-group"><label class="col-sm-2 control-label">高品质链接</label><div class="col-sm-10"><input type="text" class="form-control" ng-model="$ctrl.music.HQUrl"><div class="help-block">没有高品质音乐链接，请留空。高质量音乐链接，WIFI环境优先使用该链接播放音乐</div></div></div><div class="form-group"><label class="col-sm-2 control-label">描述</label><div class="col-sm-10"><input type="text" class="form-control" ng-model="$ctrl.music.description"><div class="help-block">描述内容将出现在音乐名称下方，建议控制在20个汉字以内最佳</div></div></div></form></div></div><div class="modal-footer"><button type="button" class="btn btn-primary" ng-click="$ctrl.ok()">确定</button> <button type="button" class="btn btn-default" data-dismiss="modal">取消</button></div>');

    templateCache.put("widget-voice-voice.html", '<div class="modal-body material-content clearfix"><div class="material-nav"><a href="javascript:;" ng-class="{true:\'active\',false:\'\'}[index==0]" ng-show="showWx()" ng-click="setIndex(0)">微信</a> <a href="javascript:;" ng-class="{true:\'active\',false:\'\'}[index == 1]" ng-show="showLocal()" ng-click="setIndex(1)">本地服务器</a></div><div class="material-head"><form action="" method="get" class="form-horizontal clearfix form-inline" role="form"><div class="pull-right btn-uploader" style="z-index: 10"><we7-uploader-btn upload-url="uploadurl" on-uploaded="uploaded()" on-upload-error="uploaderror(mes)" name="uploadname" accept="accept"></we7-uploader-btn></div></form></div><div id="voice" class="material-body voice-content"><div class="row"><div class="col-sm-3" ng-repeat="(key, value) in $ctrl.voices" ng-click="$ctrl.itemClick(value)"><div class="item" ng-class="{true:\'active\',false:\'\'}[value.selected]"><img src="/web/resource/images/icon-voice.png" alt="" class="icon"><div class="time">创建于：{{ $ctrl.timeToDate(value.createtime) | date:\'yyyy-MM-dd HH:mm\' }}</div><div class="name">{{$ctrl.getTitle(value)}}</div><div class="mask"><span class="wi wi-right"></span></div><div class="del" ng-click="delItem(value,$event)"><span class="wi wi-delete2"></span></div></div></div></div></div><div class="material-pager text-right" ng-bind-html="$ctrl.pager"></div></div><div class="modal-footer"><button type="button" class="btn btn-primary" ng-show="$ctrl.multiple">确定</button> <button type="button" class="btn btn-default" data-dismiss="modal">取消</button></div>');

    templateCache.put("widget-cardactivity-display.html", '<div ng-controller="CardActivityCtrl"><div class="nav-container" ng-if="module.params.discount_type != 0 && module.params.discount_style == 1"><div class="list-group"><div class="list-group-item"><a href="#">优惠说明 <span class="pull-right"><i class="fa fa-angle-right"></i></span></a></div></div></div><div class="app-richText" ng-if="module.params.discount_type != 0 && module.params.discount_style == 2" ng-style="{\'background-color\' : module.params.bgColor}"><div class="inner" ng-bind-html="module.params.content" ng-if="module.params.content"></div><div class="inner js-default-content" ng-if="!module.params.content"><p>点此编辑『富文本』内容 ——&gt;</p><p>你可以对文字进行 <strong>加粗</strong>、<em>斜体</em>、<span style="text-decoration: underline">下划线</span>、 <span style="text-decoration: line-through">删除线</span>、文字<span style="color: rgb(0, 176, 240)">颜色</span>、 <span style="background-color: rgb(255, 192, 0); color: rgb(255, 255, 255)">背景色</span>、 以及字号<span style="font-size: 20px">大</span><span style="font-size: 14px">小</span>等简单排版操作。</p><p>还可以在这里加入表格了</p><table class="table-bordered"><tbody><tr><td>中奖客户</td><td>发放奖品</td><td>备注</td></tr><tr><td>猪猪</td><td>内测码</td><td><em><span class="red">已经发放</span></em></td></tr><tr><td>大麦</td><td>积分</td><td><a href="#" target="_blank">领取地址</a></td></tr></tbody></table><p style="text-align: left"><span style="text-align: left">也可在这里插入图片、并对图片加上超级链接，方便用户点击。</span></p></div></div></div>');

    templateCache.put("widget-cardactivity-editor.html", '<div ng-controller="CardActivityCtrl"><div class="app-header-setting"><div class="arrow-left"></div><div class="app-header-setting-inner"><div class="panel panel-default"><ul class="nav nav-tabs" style="margin:10px 15px 0 15px"><li ng-class="{\'active\' : activeItem.id == \'cardBasic\'}"><a href="javascript:;" ng-click="editItem(\'cardBasic\');">基本设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardActivity\'}"><a href="javascript:;" ng-click="editItem(\'cardActivity\');">消费优惠设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardRecharge\'}"><a href="javascript:;" ng-click="editItem(\'cardRecharge\');">充值优惠设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardNums\'}"><a href="javascript:;" ng-click="editItem(\'cardNums\');">计次设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardTimes\'}"><a href="javascript:;" ng-click="editItem(\'cardTimes\');">计时设置</a></li></ul><div class="panel-body form-horizontal"><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">付款返积分比率</label><div class="col-sm-9 col-xs-12"><div class="input-group"><span class="input-group-addon">每消费 1 元赠送</span> <input type="text" ng-model="activeItem.params.grant_rate" class="form-control"> <span class="input-group-addon">积分</span></div><div class="help-block">设置消费返积分的比率.如果开启了充值优惠设置,请到充值优惠设置中->设置消费是否返还积分的开关.</div><div class="help-block"><strong class="text-danger">例:兑换比率:1元返10积分,那用户每消费1元,将得到10积分.</strong></div></div></div><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">优惠设置</label><div class="col-sm-9 col-xs-12"><input type="radio" value="0" ng-model="activeItem.params.discount_type" id="discount_type1"><label class="radio-inline" for="discount_type1">不开启</label><input type="radio" value="1" ng-model="activeItem.params.discount_type" id="discount_type2"><label class="radio-inline" for="discount_type2">使用满减功能</label><input type="radio" value="2" ng-model="activeItem.params.discount_type" id="discount_type3"><label class="radio-inline" for="discount_type3">使用折扣功能</label></div></div><div class="form-group" ng-show="activeItem.params.discount_type == 1" ng-repeat="discount in activeItem.params.discounts"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div class="input-group"><span class="input-group-addon">{{discount.title}}</span> <span class="input-group-addon">满</span> <input type="hidden" ng-model="discount.groupid"> <input type="text" class="form-control" ng-model="discount.condition_1"> <span class="input-group-addon">元</span> <span class="input-group-addon">减</span> <input type="text" class="form-control" ng-model="discount.discount_1"> <span class="input-group-addon">元</span></div></div></div><div class="form-group" ng-show="activeItem.params.discount_type == 2" ng-repeat="discount in activeItem.params.discounts"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div class="input-group"><span class="input-group-addon">{{discount.title}}</span> <span class="input-group-addon">满</span> <input type="hidden" ng-model="discount.groupid"> <input type="text" class="form-control" ng-model="discount.condition_2"> <span class="input-group-addon">元</span> <span class="input-group-addon">打</span> <input type="text" class="form-control" ng-model="discount.discount_2"> <span class="input-group-addon">折</span></div></div></div><div class="form-group" ng-show="activeItem.params.discount_type != 0"><label class="col-xs-12 col-sm-3 col-md-2 control-label">样式设置</label><div class="col-sm-9 col-xs-12"><label class="radio-inline"><input type="radio" value="1" ng-model="activeItem.params.discount_style"> 系统默认</label><label class="radio-inline"><input type="radio" value="2" ng-model="activeItem.params.discount_style"> 自定义</label></div></div><div class="form-group" ng-show="activeItem.params.discount_type != 0 && activeItem.params.discount_style == 2"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div class="input-group"><div we7-colorpicker we7-my-color="activeItem.params.bgColor" we7-my-default-color="\'#ffffff\'"></div></div></div></div><div class="form-group" ng-show="activeItem.params.discount_type != 0 && activeItem.params.discount_style == 2"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div we7-editor we7-my-value="activeItem.params.content"></div></div></div></div></div></div></div></div>');

    templateCache.put("widget-cardbasic-display.html", '<div ng-controller="CardBasicCtrl"><div class="title"><h1><span>会员卡</span></h1></div><div class="card"><div class="card-panel"><div class="card-logo"><img src="" ng-if="module.params.logo" ng-src="{{module.params.logo}}"></div><img class="card-bg" src="" ng-if="module.params.background.image" ng-src="{{module.params.background.image}}"><div class="card-grade" ng-if="module.params.card_level.type == \'1\'" ng-style="{\'color\' : module.params.color.rank}">默认会员组</div><div class="card-info"><div class="text-center" ng-if="module.params.card_label.type == \'1\'"><span class="card-rank" ng-style="{\'color\' : module.params.color.title}" ng-bind="module.params.card_label.title"></span></div><div class="card-no text-right" ng-if="!module.params.format_type" ng-style="{\'color\' : module.params.color.number}" ng-bind="module.params.format">会员卡号:<span>{$setting[\'format\']}</span></div></div></div></div><div class="btn-manage clearfix"><a href="javascript:;" class="recharge"><img ng-src="{{recharge_src}}" alt=""> <span>充值</span></a> <a href="javascript:;" class="payment"><img ng-src="{{scanpay_src}}" alt=""> <span>付款</span></a></div><div class="list-group"><div class="list-group-item"><a href="#">我的余额 <span class="pull-right">0.00 <i class="fa fa-angle-right"></i></span></a></div><div class="list-group-item"><a href="#">我的积分 <span class="pull-right">0.00 <i class="fa fa-angle-right"></i></span></a></div><div class="list-group-item"><a href="#">我的卡券 <span class="pull-right">0张 <i class="fa fa-angle-right"></i></span></a></div></div><div class="list-group"><div class="list-group-item"><a href="#">消息 <span class="pull-right"><i class="fa fa-angle-right"></i></span></a></div></div><div class="list-group"><div class="list-group-item"><a href="#">个人信息 <span class="pull-right"><i class="fa fa-angle-right"></i></span></a></div><div class="list-group-item"><a href="#">账单 <span class="pull-right"><i class="fa fa-angle-right"></i></span></a></div></div></div>');

    templateCache.put("widget-cardbasic-editor.html", '<div ng-controller="CardBasicCtrl"><div class="app-header-setting"><div class="arrow-left"></div><div class="app-header-setting-inner"><div class="panel panel-default"><ul class="nav nav-tabs" style="margin:10px 15px 0 15px"><li ng-class="{\'active\' : activeItem.id == \'cardBasic\'}"><a href="javascript:;" ng-click="editItem(\'cardBasic\');">基本设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardActivity\'}"><a href="javascript:;" ng-click="editItem(\'cardActivity\');">消费优惠设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardRecharge\'}"><a href="javascript:;" ng-click="editItem(\'cardRecharge\');">充值优惠设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardNums\'}"><a href="javascript:;" ng-click="editItem(\'cardNums\');">计次设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardTimes\'}"><a href="javascript:;" ng-click="editItem(\'cardTimes\');">计时设置</a></li></ul><div class="panel-body form-horizontal"><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">名称<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><input type="text" class="form-control" ng-model="activeItem.params.title"></div></div><div class="form-group" ng-if="newcard"><label class="col-xs-12 col-sm-3 col-md-2 control-label">商户名称<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><input type="text" class="form-control" ng-model="activeItem.params.brand_name"></div></div><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">背景图案<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><label class="radio-inline"><input type="radio" value="system" ng-init="activeItem.params.background && activeItem.params.background == 0 ? activeItem.params.background = {} : \'\'" ng-model="activeItem.params.background.type"> 系统</label><label class="radio-inline"><input type="radio" value="user" ng-init="activeItem.params.background && activeItem.params.background == 0 ? activeItem.params.background = {} : \'\'" ng-model="activeItem.params.background.type"> 自定义</label></div></div><div class="form-group" ng-show="activeItem.params.background.type == \'user\'"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-xs-9"><span ng-click="addBgThumb()" class="form-control-static"><i class="fa fa-plus-circle green"></i>&nbsp;选择图片</span><div style="margin-top:.5em" class="input-group" ng-show="activeItem.params.background.image"><img width="150" class="img-responsive img-thumbnail" ng-src="{{activeItem.params.background.image}}"> <em ng-click="activeItem.params.background.image = \'\';" title="删除这张图片" style="position:absolute; top: 0px; right: -14px" class="close">×</em></div></div></div><div class="form-group" ng-show="activeItem.params.background.type == \'system\'"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><select class="form-control" ng-model="activeItem.params.background.image"><option value="{{tomedia(\'images/global/card/1.png\')}}">背景1</option><option value="{{tomedia(\'images/global/card/2.png\')}}">背景2</option><option value="{{tomedia(\'images/global/card/3.png\')}}">背景3</option><option value="{{tomedia(\'images/global/card/4.png\')}}">背景4</option><option value="{{tomedia(\'images/global/card/5.png\')}}">背景5</option><option value="{{tomedia(\'images/global/card/6.png\')}}">背景6</option><option value="{{tomedia(\'images/global/card/7.png\')}}">背景7</option><option value="{{tomedia(\'images/global/card/8.png\')}}">背景8</option><option value="{{tomedia(\'images/global/card/9.png\')}}">背景9</option><option value="{{tomedia(\'images/global/card/10.png\')}}">背景10</option><option value="{{tomedia(\'images/global/card/11.png\')}}">背景11</option><option value="{{tomedia(\'images/global/card/12.png\')}}">背景12</option><option value="{{tomedia(\'images/global/card/13.png\')}}">背景13</option><option value="{{tomedia(\'images/global/card/14.png\')}}">背景14</option><option value="{{tomedia(\'images/global/card/15.png\')}}">背景15</option><option value="{{tomedia(\'images/global/card/16.png\')}}">背景16</option><option value="{{tomedia(\'images/global/card/17.png\')}}">背景17</option><option value="{{tomedia(\'images/global/card/18.png\')}}">背景18</option><option value="{{tomedia(\'images/global/card/19.png\')}}">背景19</option><option value="{{tomedia(\'images/global/card/20.png\')}}">背景20</option><option value="{{tomedia(\'images/global/card/21.png\')}}">背景21</option><option value="{{tomedia(\'images/global/card/22.png\')}}">背景22</option><option value="{{tomedia(\'images/global/card/23.png\')}}">背景23</option></select></div></div><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">LOGO<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><span ng-click="addThumb(\'logo\')" class="form-control-static"><i class="fa fa-plus-circle green"></i>&nbsp;选择图片</span><div style="margin-top:.5em" class="input-group" ng-show="activeItem.params.logo"><img width="150" class="img-responsive img-thumbnail" ng-src="{{activeItem.params.logo}}"> <em ng-click="activeItem.params.logo = \'\';" title="删除这张图片" style="position:absolute; top: 0px; right: -14px" class="close">×</em></div></div></div><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">会员卡等级</label><div class="col-sm-9 col-xs-12"><input type="radio" value="1" ng-model="activeItem.params.card_level.type" id="card-label-type1"><label class="radio-inline" for="card-level-type1">开启</label><input type="radio" value="2" ng-model="activeItem.params.card_level.type" id="card-label-type2"><label class="radio-inline" for="card-level-type2">关闭</label></div></div><div class="form-group" ng-show="activeItem.params.card_level.type == \'1\'"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div we7-colorpicker we7-my-color="activeItem.params.color.rank" we7-my-default-color="\'#fff\'"></div></div></div><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">会员卡标题</label><div class="col-sm-9 col-xs-12"><input type="radio" value="1" ng-model="activeItem.params.card_label.type" id="card-label-type1"><label class="radio-inline" for="card-label-type1">开启</label><input type="radio" value="2" ng-model="activeItem.params.card_label.type" id="card-label-type2"><label class="radio-inline" for="card-label-type2">关闭</label></div></div><div class="form-group" ng-show="activeItem.params.card_label.type == \'1\'"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><input type="text" ng-model="activeItem.params.card_label.title" class="form-control"><br><span><span><div we7-colorpicker we7-my-color="activeItem.params.color.title" we7-my-default-color="\'Color010\'"></div></span></span></div></div><div class="form-group" style="display:none"><label class="col-xs-12 col-sm-3 col-md-2 control-label">卡号设置<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><label class="checkbox-inline"><input type="checkbox" value="1" ng-model="activeItem.params.format_type" ng-init="activeItem.params.format_type = (activeItem.params.format_type == 1 ? true : false)"> 使用手机号作为卡号</label><span class="help-block">强烈推荐使用手机号作为卡号</span><div ng-show="activeItem.params.format_type != 1"><input name="format" type="text" ng-model="activeItem.params.format" ng-init="activeItem.params.format = \'\'" class="form-control"> <span class="help-block"><p>"*"代表任意随机数字，<span style="color:red">"#"代表流水号码, "#"必须连续出现,且只能存在一组.</span></p><p>卡号规则样本："WQ2015*****#####***"</p>注意：规则位数过小会造成卡号生成重复概率增大，过多的重复卡密会造成卡密生成终止 卡密规则中不能带有中文及其他特殊符号 为了避免卡密重复，随机位数最好不要少于8位</span></div></div></div><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">使用说明<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><textarea class="form-control" rows="6" ng-model="activeItem.params.description"></textarea><span class="help-block">请填写会员卡的使用说明。</span></div></div><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">会员卡资料</label><div class="col-sm-10 col-xs-9"><div ng-repeat="field in activeItem.params.fields" style="margin-left:-15px"><div class="col-sm-10" style="margin-bottom:10px"><div class="input-group"><input type="text" class="form-control" ng-model="field.title" ng-disabled="(field.bind == \'realname\' || field.bind == \'mobile\') && $index <= \'1\'"> <span class="input-group-addon"><label><input type="checkbox" ng-init="field.require = field.require == 1 ? true : false;" ng-model="field.require" ng-disabled="(field.bind == \'realname\' || field.bind == \'mobile\') && $index <= \'1\'"> 必填</label></span><select ng-model="field.bind" class="form-control" ng-disabled="(field.bind == \'realname\' || field.bind == \'mobile\') && $index <= \'1\'"><option value="{{fansfield.bind}}" ng-repeat="fansfield in fansFields" ng-model="field.bind" ng-selected="{{field.bind == fansfield.bind}}">{{fansfield.title}}</option></select></div></div><div class="col-sm-1" style="margin-top:5px" ng-show="field.bind != \'mobile\' && field.bind != \'realname\'"><a href="javascript:;" ng-click="removeFields(field);"><i class="fa fa-times-circle"></i></a></div></div><span class="help-block col-sm-9" style="margin-left:-15px">系统会自动绑定:真实姓名和手机号码</span> <span class="help-block col-sm-9" style="margin-left:-15px"><a href="javascript:;" ng-click="addFields();"><i class="fa fa-plus-circle" title="添加填写项目"></i> 添加填写项目</a></span></div></div><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">领卡赠送<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><div class="input-group"><span class="input-group-addon" ng-init="activeItem.params.grant && activeItem.params.grant == 0 ? activeItem.params.grant = {} : \'\'">赠送</span> <input type="text" ng-model="activeItem.params.grant.credit1" class="form-control"> <span class="input-group-addon">积分</span></div></div></div><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div class="input-group"><span class="input-group-addon">赠送</span> <input type="text" ng-model="activeItem.params.grant.credit2" class="form-control"> <span class="input-group-addon">余额</span></div></div></div><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div class="input-group"><input type="hidden" ng-model="activeItem.params.grant.coupon"> <span class="input-group-addon">已选:<span ng-repeat="grant in activeItem.params.grant.coupon"><span ng-bind="grant.couponTitle">{{grant.couponTitle}}</span>|</span></span> <span class="input-group-btn"><button class="btn btn-primary" type="button" ng-click="selectCoupon();">搜索优惠券</button> <button class="btn btn-default" type="button" ng-click="clearCoupon();"><span><i class="fa fa-remove"></i></span></button></span></div><div class="help-block"><a href="{{url(\'activity/coupon\');}}" target="_blank">添加优惠券</a>.注意:赠送的优惠券应该各个会员组都可以领取.否则会造成赠送失败的问题</div></div></div><div class="form-group" ng-if="newcard"><label class="col-xs-12 col-sm-3 col-md-2 control-label">单次积分<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><input type="text" ng-model="activeItem.params.bonus_rule.max_increase_bonus" class="form-control"> <span class="help-block">单次最多可获取积分数量</span></div></div><div class="form-group" ng-if="newcard"><label class="col-xs-12 col-sm-3 col-md-2 control-label">抵扣条件<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><input type="text" ng-model="activeItem.params.bonus_rule.least_money_to_use_bonus" class="form-control"> <span class="help-block">满足xx元，可使用积分抵扣</span></div></div><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">抵现比率<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><div class="input-group"><input type="text" ng-model="activeItem.params.offset_rate" class="form-control"> <span class="input-group-addon">积分抵 1 元</span></div><br><div class="input-group"><span class="input-group-addon">单次最多可抵现</span> <input type="text" ng-model="activeItem.params.offset_max" class="form-control"> <span class="input-group-addon">元</span></div><div class="help-block"><strong class="text-danger">例:积分抵现金比率:100积分抵1元,那用户在消费的时候,将可用账户积分抵消部分金额.</strong></div><div class="help-block"><strong class="text-danger">目前仅支持后台交易抵现，暂不支持手机交易抵现.</strong></div></div></div><div class="form-group" ng-if="newcard"><label class="col-xs-12 col-sm-3 col-md-2 control-label">库存<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><input type="text" ng-model="activeItem.params.quantity" class="form-control"> <span class="help-block">卡券库存的数量，不支持填写0，上限为100000000.</span></div></div><div class="form-group" ng-if="newcard"><label class="col-xs-12 col-sm-3 col-md-2 control-label">使用提醒<span style="color:red">*</span></label><div class="radio"><div class="col-sm-9 col-xs-12"><input type="text" ng-model="activeItem.params.notice" class="form-control"> <span class="help-block">卡券使用提醒，字数上限为16个汉字。</span></div></div></div><div class="form-group" ng-if="newcard"><label class="col-xs-12 col-sm-3 col-md-2 control-label">刷卡支付<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><label class="radio-inline"><input type="radio" ng-model="activeItem.params.swipe_card" value="1">开启</label><label class="radio-inline"><input type="radio" ng-checked="activeItem.params.swipe_card == null || activeItem.params.swipe_card == 2" ng-model="activeItem.params.swipe_card" value="2">关闭</label><span class="help-block">选择是否开启刷卡支付</span></div></div><div class="form-group" ng-if="newcard"><label class="col-xs-12 col-sm-3 col-md-2 control-label">有效日期<span style="color:red">*</span></label><div class="col-sm-9 col-xs-12"><label class="radio-inline"><input type="radio" ng-model="activeItem.params.date_info.type" value="DATE_TYPE_PERMANENT"> 永久有效</label></div></div><div class="form-group" ng-if="newcard"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div class="radio"><div class="col-sm-3"><label class="radio-inline"><input type="radio" ng-model="activeItem.params.date_info.type" value="DATE_TYPE_FIX_TIME_RANGE"> 固定日期</label></div><div class="input-group" style="width: 240px"><input we7-date-picker we7-date-value="activeItem.params.date_info.begin_timestamp" ng-model="activeItem.params.date_info.begin_timestamp" class="form-control" style="width: 100px"><div class="input-group-addon">到</div><input we7-date-picker we7-date-value="activeItem.params.date_info.end_timestamp" ng-model="activeItem.params.date_info.end_timestamp" class="form-control" style="width: 100px"></div></div></div></div><div class="form-group" ng-if="newcard"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><label class="radio-inline"><input ng-model="activeItem.params.date_info.type" type="radio" value="DATE_TYPE_FIX_TERM">领取后</label><div class="input-group" style="width: 240px"><input ng-model="activeItem.params.date_info.fixed_begin_term" class="form-control" style="width: 100px"> <span class="input-group-addon">天生效，有效期</span> <input ng-model="activeItem.params.date_info.fixed_term" class="form-control" style="width: 100px"></div></div></div><div class="form-group" ng-if="newcard"><label class="col-xs-12 col-sm-3 col-md-2 control-label">可用门店</label><div class="col-sm-9 col-xs-12"><label class="radio-inline"><a href="#" class="location_list">选择适用门店</a></label></div></div></div></div></div></div></div>');

    templateCache.put("widget-cardnums-display.html", '<div ng-controller="CardNumsCtrl"><div class="nav-container" ng-if="module.params.nums_status == 1 && module.params.nums_style == 1"><ul><li class="collapse-link"><a class="nav-container-list" href="javascript:;"><span class="nav-title"><i class="fa fa-eye"></i>{{module.params.nums_text}}充值</span> <span class="pull-right"><i class="fa fa-angle-right"></i></span></a><div class="collapse-con padding-b-0"><a href="./index.php?i={$_W[\'uniacid\']}&j={$_W[\'acid\']}&c=entry&m=recharge&do=pay&type=card_nums&fee={{num.recharge}}" class="btn btn-warning btn-recharge" ng-repeat="num in module.params.nums">充{{num.recharge}}返{{num.num}}次</a></div></li></ul></div><div class="app-richText" ng-if="module.params.nums_status == 1 && module.params.nums_style == 2" ng-style="{\'background-color\' : module.params.bgColor}"><div class="inner" ng-bind-html="module.params.content" ng-if="module.params.content"></div><div class="inner js-default-content" ng-if="!module.params.content"><p>点此编辑『富文本』内容 ——&gt;</p><p>你可以对文字进行 <strong>加粗</strong>、<em>斜体</em>、<span style="text-decoration: underline">下划线</span>、 <span style="text-decoration: line-through">删除线</span>、文字<span style="color: rgb(0, 176, 240)">颜色</span>、 <span style="background-color: rgb(255, 192, 0); color: rgb(255, 255, 255)">背景色</span>、 以及字号<span style="font-size: 20px">大</span><span style="font-size: 14px">小</span>等简单排版操作。</p><p>还可以在这里加入表格了</p><table class="table-bordered"><tbody><tr><td>中奖客户</td><td>发放奖品</td><td>备注</td></tr><tr><td>猪猪</td><td>内测码</td><td><em><span class="red">已经发放</span></em></td></tr><tr><td>大麦</td><td>积分</td><td><a href="#" target="_blank">领取地址</a></td></tr></tbody></table><p style="text-align: left"><span style="text-align: left">也可在这里插入图片、并对图片加上超级链接，方便用户点击。</span></p></div></div></div>');

    templateCache.put("widget-cardnums-editor.html", '<div ng-controller="CardNumsCtrl"><div class="app-header-setting"><div class="arrow-left"></div><div class="app-header-setting-inner"><div class="panel panel-default"><ul class="nav nav-tabs" style="margin:10px 15px 0 15px"><li ng-class="{\'active\' : activeItem.id == \'cardBasic\'}"><a href="javascript:;" ng-click="editItem(\'cardBasic\');">基本设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardActivity\'}"><a href="javascript:;" ng-click="editItem(\'cardActivity\');">消费优惠设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardRecharge\'}"><a href="javascript:;" ng-click="editItem(\'cardRecharge\');">充值优惠设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardNums\'}"><a href="javascript:;" ng-click="editItem(\'cardNums\');">计次设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardTimes\'}"><a href="javascript:;" ng-click="editItem(\'cardTimes\');">计时设置</a></li></ul><div class="panel-body form-horizontal"><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">计次设置</label><div class="col-sm-9 col-xs-12"><input type="radio" value="1" ng-model="activeItem.params.nums_status" id="nums_status1"><label class="radio-inline" for="nums_status1">开启</label><input type="radio" value="0" ng-model="activeItem.params.nums_status" id="nums_status2"><label class="radio-inline" for="nums_status2">关闭</label><span class="help-block">如你的业务有需要次数限制，可开启进行设置。</span></div></div><div class="form-group" ng-show="activeItem.params.nums_status == 1"><label class="col-xs-12 col-sm-3 col-md-2 control-label">计次设置</label><div class="col-sm-9 col-xs-12"><input type="text" class="form-control" ng-model="activeItem.params.nums_text"> <span class="help-block">例如：设置为”洗发剩余次数“,前台将显示为：”洗发剩余次数：n次“,请根据自己的业务需求设置。</span></div></div><div class="form-group" ng-show="activeItem.params.nums_status == 1"><label class="col-xs-12 col-sm-3 col-md-2 control-label">充值返次数</label><div class="col-sm-9 col-xs-12"><div ng-repeat="num in activeItem.params.nums" style="margin-left:-15px"><div class="col-sm-8" style="margin-bottom:10px"><div class="input-group"><span class="input-group-addon">充</span> <input type="text" class="form-control" ng-model="num.recharge"> <span class="input-group-addon">元</span> <input type="text" class="form-control" ng-model="num.num"> <span class="input-group-addon">次</span></div></div><div class="col-sm-1" style="margin-top:5px"><a href="javascript:;" ng-click="removeNums(num);"><i class="fa fa-times-circle"></i></a></div></div><div class="help-block col-sm-9" style="margin-left:-15px"><a href="javascript:;" ng-click="addNums();"><i class="fa fa-plus-circle" title="添加充值设置"></i> 添加充值设置</a></div></div></div><div class="form-group" ng-show="activeItem.params.nums_status != 0"><label class="col-xs-12 col-sm-3 col-md-2 control-label">样式设置</label><div class="col-sm-9 col-xs-12"><label class="radio-inline"><input type="radio" value="1" ng-model="activeItem.params.nums_style"> 系统默认</label><label class="radio-inline"><input type="radio" value="2" ng-model="activeItem.params.nums_style"> 自定义</label></div></div><div class="form-group" ng-show="activeItem.params.nums_status != 0 && activeItem.params.nums_style == 2"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div class="input-group"><div we7-colorpicker we7-my-color="activeItem.params.bgColor" we7-my-default-color="\'#ffffff\'"></div></div></div></div><div class="form-group" ng-show="activeItem.params.nums_status != 0 && activeItem.params.nums_style == 2"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div we7-editor we7-my-value="activeItem.params.content"></div></div></div></div></div></div></div></div>');

    templateCache.put("widget-cardrecharge-display.html", '<div ng-controller="CardRechargeCtrl"><div class="nav-container" ng-if="module.params.recharge_type != 0 && module.params.recharge_style == 1"><div class="list-group"><div class="list-group-item"><a href="#">充值优惠说明 <span class="pull-right"><i class="fa fa-angle-right"></i></span></a></div></div></div><div class="app-richText" ng-if="module.params.discount_type != 0 && module.params.discount_style == 2" ng-style="{\'background-color\' : module.params.bgColor}"><div class="inner" ng-bind-html="module.params.content" ng-if="module.params.content"></div><div class="inner js-default-content" ng-if="!module.params.content"><p>点此编辑『富文本』内容 ——&gt;</p><p>你可以对文字进行 <strong>加粗</strong>、<em>斜体</em>、<span style="text-decoration: underline">下划线</span>、 <span style="text-decoration: line-through">删除线</span>、文字<span style="color: rgb(0, 176, 240)">颜色</span>、 <span style="background-color: rgb(255, 192, 0); color: rgb(255, 255, 255)">背景色</span>、 以及字号<span style="font-size: 20px">大</span><span style="font-size: 14px">小</span>等简单排版操作。</p><p>还可以在这里加入表格了</p><table class="table-bordered"><tbody><tr><td>中奖客户</td><td>发放奖品</td><td>备注</td></tr><tr><td>猪猪</td><td>内测码</td><td><em><span class="red">已经发放</span></em></td></tr><tr><td>大麦</td><td>积分</td><td><a href="#" target="_blank">领取地址</a></td></tr></tbody></table><p style="text-align: left"><span style="text-align: left">也可在这里插入图片、并对图片加上超级链接，方便用户点击。</span></p></div></div></div>');

    templateCache.put("widget-cardrecharge-editor.html", '<div ng-controller="CardRechargeCtrl"><div class="app-header-setting"><div class="arrow-left"></div><div class="app-header-setting-inner"><div class="panel panel-default"><ul class="nav nav-tabs" style="margin:10px 15px 0 15px"><li ng-class="{\'active\' : activeItem.id == \'cardBasic\'}"><a href="javascript:;" ng-click="editItem(\'cardBasic\');">基本设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardActivity\'}"><a href="javascript:;" ng-click="editItem(\'cardActivity\');">消费优惠设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardRecharge\'}"><a href="javascript:;" ng-click="editItem(\'cardRecharge\');">充值优惠设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardNums\'}"><a href="javascript:;" ng-click="editItem(\'cardNums\');">计次设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardTimes\'}"><a href="javascript:;" ng-click="editItem(\'cardTimes\');">计时设置</a></li></ul><div class="panel-body form-horizontal"><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">优惠设置</label><div class="col-sm-9 col-xs-12"><input type="radio" value="1" ng-model="activeItem.params.recharge_type" id="recharge_type1"><label class="radio-inline" for="recharge_type1">开启</label><input type="radio" value="0" ng-model="activeItem.params.recharge_type" id="recharge_type2"><label class="radio-inline" for="recharge_type2">不开启</label></div></div><div class="form-group" ng-show="activeItem.params.recharge_type == 1" ng-repeat="recharge in activeItem.params.recharges"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div class="input-group"><span class="input-group-addon">充</span> <input type="text" class="form-control" ng-model="recharge.condition"> <span class="input-group-addon">元</span> <span class="input-group-addon" ng-if="recharge.backtype == \'0\'">送</span> <span class="input-group-addon" ng-if="recharge.backtype == \'1\'">送</span> <input type="text" class="form-control" ng-model="recharge.back"><div class="input-group-btn"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width:88px"><span ng-switch on="recharge.backtype"><span ng-switch-when="0">元</span> <span ng-switch-when="1">积分</span></span> <i class="fa fa-angle-down"></i></button><ul class="dropdown-menu dropdown-menu-right select-back"><li><a href="#" ng-click="recharge.backtype=\'0\';recharge.backunit=\'元\'">元</a></li><li><a href="#" ng-click="recharge.backtype=\'1\';recharge.backunit=\'积分\'">积分</a></li></ul></div></div></div><div class="col-sm-1" style="margin-top:5px"><a href="javascript:;" ng-click="removeRecharges(recharge);"><i class="fa fa-times-circle"></i></a></div></div><div class="form-group" ng-show="activeItem.params.recharge_type != 0"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="help-block col-sm-9 col-xs-12" style="margin-left:-15px"><a href="javascript:;" ng-click="addRecharges();"><i class="fa fa-plus-circle" title="添加充值设置"></i> 添加充值设置</a></div></div><div class="form-group" ng-show="activeItem.params.recharge_type == 1"><label class="col-xs-12 col-sm-3 col-md-2 control-label">消费返积分</label><div class="col-sm-9 col-xs-12"><label class="radio-inline"><input type="radio" value="1" ng-model="activeItem.params.grant_rate_switch"> 是</label><label class="radio-inline"><input type="radio" value="0" ng-model="activeItem.params.grant_rate_switch"> 否</label><div class="help-block"><strong class="text-danger">开启充值优惠设置后,用户是否继续享受消费返积分的优惠</strong></div></div></div><div class="form-group" ng-show="activeItem.params.discount_type != 0 && activeItem.params.discount_style == 2"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div class="input-group"><div we7-colorpicker we7-my-color="activeItem.params.bgColor" we7-my-default-color="\'#ffffff\'"></div></div></div></div><div class="form-group" ng-show="activeItem.params.discount_type != 0 && activeItem.params.discount_style == 2"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div we7-editor we7-my-value="activeItem.params.content"></div></div></div></div></div></div></div></div>');

    templateCache.put("widget-cardtimes-display.html", '<div ng-controller="CardTimesCtrl"><div class="nav-container" ng-if="module.params.times_status == 1 && module.params.times_style == 1"><ul><li class="collapse-link"><a class="nav-container-list" href="javascript:;"><span class="nav-title"><i class="fa fa-eye"></i>{{module.params.times_text}}充值</span> <span class="pull-right"><i class="fa fa-angle-right"></i></span></a><div class="collapse-con padding-b-0"><a href="./index.php?i={$_W[\'uniacid\']}&j={$_W[\'acid\']}&c=entry&m=recharge&do=pay&type=card_times&fee={{time.recharge}}" class="btn btn-warning btn-recharge" ng-repeat="time in module.params.times">充{{time.recharge}}返{{time.time}}天</a></div></li></ul></div><div class="app-richText" ng-if="module.params.times_status == 1 && module.params.times_style == 2" ng-style="{\'background-color\' : module.params.bgColor}"><div class="inner" ng-bind-html="module.params.content" ng-if="module.params.content"></div><div class="inner js-default-content" ng-if="!module.params.content"><p>点此编辑『富文本』内容 ——&gt;</p><p>你可以对文字进行 <strong>加粗</strong>、<em>斜体</em>、<span style="text-decoration: underline">下划线</span>、 <span style="text-decoration: line-through">删除线</span>、文字<span style="color: rgb(0, 176, 240)">颜色</span>、 <span style="background-color: rgb(255, 192, 0); color: rgb(255, 255, 255)">背景色</span>、 以及字号<span style="font-size: 20px">大</span><span style="font-size: 14px">小</span>等简单排版操作。</p><p>还可以在这里加入表格了</p><table class="table-bordered"><tbody><tr><td>中奖客户</td><td>发放奖品</td><td>备注</td></tr><tr><td>猪猪</td><td>内测码</td><td><em><span class="red">已经发放</span></em></td></tr><tr><td>大麦</td><td>积分</td><td><a href="#" target="_blank">领取地址</a></td></tr></tbody></table><p style="text-align: left"><span style="text-align: left">也可在这里插入图片、并对图片加上超级链接，方便用户点击。</span></p></div></div></div>');

    templateCache.put("widget-cardtimes-editor.html", '<div ng-controller="CardTimesCtrl"><div class="app-header-setting"><div class="arrow-left"></div><div class="app-header-setting-inner"><div class="panel panel-default"><ul class="nav nav-tabs" style="margin:10px 15px 0 15px"><li ng-class="{\'active\' : activeItem.id == \'cardBasic\'}"><a href="javascript:;" ng-click="editItem(\'cardBasic\');">基本设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardActivity\'}"><a href="javascript:;" ng-click="editItem(\'cardActivity\');">消费优惠设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardRecharge\'}"><a href="javascript:;" ng-click="editItem(\'cardRecharge\');">充值优惠设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardNums\'}"><a href="javascript:;" ng-click="editItem(\'cardNums\');">计次设置</a></li><li ng-class="{\'active\' : activeItem.id == \'cardTimes\'}"><a href="javascript:;" ng-click="editItem(\'cardTimes\');">计时设置</a></li></ul><div class="panel-body form-horizontal"><div class="form-group"><label class="col-xs-12 col-sm-3 col-md-2 control-label">计时设置</label><div class="col-sm-9 col-xs-12"><input type="radio" value="1" ng-model="activeItem.params.times_status" id="times_status1"><label class="radio-inline" for="times_status1">开启</label><input type="radio" value="0" ng-model="activeItem.params.times_status" id="times_status2"><label class="radio-inline" for="times_status2">关闭</label><span class="help-block">如你的业务有需要时长限制，可开启进行设置。</span></div></div><div class="form-group" ng-show="activeItem.params.times_status == 1"><label class="col-xs-12 col-sm-3 col-md-2 control-label">计时设置</label><div class="col-sm-9 col-xs-12"><input type="text" class="form-control" ng-model="activeItem.params.times_text"> <span class="help-block">例如：设置为”到期时间“,系统将根据用户的领卡时间,加上用户的可用时长，计算到期时间，前台将显示为：”到期时间：x年x月x日“,请根据自己的业务需求设置。</span></div></div><div class="form-group" ng-show="activeItem.params.times_status == 1"><label class="col-xs-12 col-sm-3 col-md-2 control-label">充值返时长</label><div class="col-sm-9 col-xs-12"><div ng-repeat="time in activeItem.params.times" style="margin-left:-15px"><div class="col-sm-8" style="margin-bottom:10px"><div class="input-group"><span class="input-group-addon">充</span> <input type="text" class="form-control" ng-model="time.recharge"> <span class="input-group-addon">元</span> <input type="text" class="form-control" ng-model="time.time"> <span class="input-group-addon">天</span></div></div><div class="col-sm-1" style="margin-top:5px"><a href="javascript:;" ng-click="removeTimes(time);"><i class="fa fa-times-circle"></i></a></div></div><div class="help-block col-sm-9" style="margin-left:-15px"><a href="javascript:;" ng-click="addTimes();"><i class="fa fa-plus-circle" title="添加充值设置"></i> 添加充值设置</a></div></div></div><div class="form-group" ng-show="activeItem.params.times_status != 0"><label class="col-xs-12 col-sm-3 col-md-2 control-label">样式设置</label><div class="col-sm-9 col-xs-12"><label class="radio-inline"><input type="radio" value="1" ng-model="activeItem.params.times_style"> 系统默认</label><label class="radio-inline"><input type="radio" value="2" ng-model="activeItem.params.times_style"> 自定义</label></div></div><div class="form-group" ng-show="activeItem.params.times_status != 0 && activeItem.params.times_style == 2"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div class="input-group"><div we7-colorpicker we7-my-color="activeItem.params.bgColor" we7-my-default-color="\'#ffffff\'"></div></div></div></div><div class="form-group" ng-show="activeItem.params.times_status != 0 && activeItem.params.times_style == 2"><label class="col-xs-12 col-sm-3 col-md-2 control-label"></label><div class="col-sm-9 col-xs-12"><div we7-editor we7-my-value="activeItem.params.content"></div></div></div></div></div></div></div></div>');

    templateCache.put("widget-ucheader-display.html", '<div ng-controller="HeaderCtrl"><div class="title"><h1><span>{{module.params.title}}</span></h1></div><div class="head" style="background-repeat:no-repeat; background-position: center center" ng-style="{\'background-image\' : module.params.bgImage ? \'url(\' + module.params.bgImage + \')\' : \'url(\\\'./resource/images/app/head-bg.png\\\')\'}"><a class="ptool" href="{{url(\'mc/profile\')}}">设置</a><div class="logo-img"><img ng-src="{{logo_url}}" class="img-circle"></div><div class="banner-info"><div class="name">设置昵称</div><div class="tel">1884512367</div></div><div class="head-nav"><a class="head-nav-list" href="{{url(\'mc/bond/credits\')}}&credittype=credit1"><span class="fa fa-rmb"></span>余额: <span>4000.00</span></a> <a class="head-nav-list" href="{{url(\'mc/bond/credits\')}}&credittype=credit2"><span class="fa fa-database"></span>积分: <span>900.00</span></a></div></div></div>');

    templateCache.put("widget-ucheader-editor.html", '<div ng-controller="HeaderCtrl"><div class="app-header-setting"><div class="arrow-left"></div><div class="app-header-setting-inner"><div class="panel panel-default"><div class="panel-body form-horizontal"><div class="form-group"><label class="col-xs-3 control-label"><span class="red">*</span> 页面名称</label><div class="col-xs-9"><input type="text" ng-model="activeItem.params.title" placeholder="微页面标题" class="form-control"></div></div><div class="form-group"><label class="control-label col-xs-3">背景图片</label><div class="col-xs-9"><span ng-click="addThumb(\'bgImage\')"><i class="fa fa-plus-circle green"></i>&nbsp;选择图片</span><div style="margin-top:.5em" class="input-group" ng-show="activeItem.params.bgImage"><img width="150" class="img-responsive img-thumbnail" ng-src="{{activeItem.params.bgImage}}"> <em ng-click="activeItem.params.bgImage = \'\';" title="删除这张图片" style="position:absolute; top: 0px; right: -14px" class="close">×</em></div></div></div><div class="form-group"><label class="col-xs-3 control-label">触发关键字</label><div class="col-xs-9"><input type="text" ng-model="activeItem.params.keyword" class="form-control"> <span class="help-block">用户触发关键字，系统回复此页面的图文链接</span></div></div><div class="form-group"><label class="control-label col-xs-3">封面</label><div class="col-xs-9"><span ng-click="addThumb(\'cover\')"><i class="fa fa-plus-circle green"></i>&nbsp;选择图片</span><div style="margin-top:.5em" class="input-group" ng-show="activeItem.params.cover"><img width="150" class="img-responsive img-thumbnail" ng-src="{{activeItem.params.cover}}"> <em ng-click="activeItem.params.cover = \'\';" title="删除这张图片" style="position:absolute; top: 0px; right: -14px" class="close">×</em></div><span class="help-block">用于用户触发关键字后，系统回复时的封面图片</span></div></div><div class="form-group"><label class="col-xs-3 control-label">页面描述</label><div class="col-xs-9"><input type="text" ng-model="activeItem.params.description" class="form-control"></div></div><div class="form-group"><label class="col-xs-3 control-label">联系方式</label><div class="col-xs-9"><input type="text" ng-model="activeItem.params.contact" class="form-control"> <span class="help-block">用于用户点击会员中心->设置->联系我们时拨打的电话</span></div></div><div class="shopNav-edit-header clearfix">个人中心扩展菜单</div><div class="shopNav-wx"><div class="card" ng-repeat="menu in activeMenus"><div class="btns"><a href="javascript:;" ng-click="removeMenu(menu)"><i class="fa fa-times"></i></a></div><div class="nav-region"><div class="first-nav"><div class="alert"><div class="form-group"><label class="control-label col-xs-3">标题</label><div class="col-xs-9"><input type="text" class="form-control" name="" value="" ng-model="menu.name"></div></div><div class="form-group"><label class="control-label col-xs-3">链接到</label><div class="col-xs-9"><input ng-if="menu.module_info" type="text" ng-model="menu.url" class="form-control" disabled><div ng-if="!menu.module_info" we7-linker we7-my-url="menu.url" we7-my-title="menu.name"></div></div></div><div class="form-group" ng-if="menu.module_info"><label class="control-label col-xs-3">是否显示</label><div class="col-xs-9"><label class="radio-inline"><input type="radio" value="1" ng-model="menu.status">显示</label><label class="radio-inline"><input type="radio" value="0" ng-model="menu.status">隐藏</label><span class="help-block"><strong class="text-danger">该菜单来源于{{menu.module_info.title}}模块,仅可设置标题和是否显示</strong></span></div></div></div></div></div></div><div class="add-shopNav text-center" ng-click="addMenu();">+添加一级导航</div></div></div></div></div></div></div>');

    templateCache.put("widget-adimg-display.html", '<div ng-controller="AdImgCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><link href="../app/resource/components/swiper/swiper.min.css" rel="stylesheet"><div style="{{module.transform}}" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-adImg" style="{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="inner"><div class="appstyle js-default-content" ng-if="module.params.items.length == 0"><img ng-show="module.params.listStyle == 1" src="./resource/images/app/adImg-lg.jpg" width="100%"> <img ng-show="module.params.listStyle == 2" src="./resource/images/app/adImg-separate.jpg" width="100%"></div><div class="swiper-container swiper-container-horizontal" ng-if="module.params.items.length != 0 && module.params.listStyle == 1"><div class="swiper-wrapper"><div class="swiper-slide" ng-class="{\'swiper-slide-active\' : $index == 0}" style="width: 100%" ng-repeat="item in module.params.items"><a href="{{item.url}}" style="display:block; width:100%; text-align:center"><img ng-src="{{item.imgurl}}" title="{{item.title}}" style="display:block; height:auto; max-width:100%;  margin:0 auto"></a></div></div><div class="swiper-pagination swiper-pagination-clickable"><span class="swiper-pagination-bullet" ng-class="{\'swiper-pagination-bullet-active\': $index == 0}" ng-repeat="item in module.params.items"></span></div><div class="swiper-button-next hidden"></div><div class="swiper-button-prev hidden"></div></div><div class="show-separate" ng-if="module.params.items.length != 0 && module.params.listStyle == 2"><div class="ad-list lg" ng-if="module.params.sizeType == 1"><div class="ad-list-item" ng-repeat="item in module.params.items"><a href="{{item.url}}"><h3 ng-bind="item.title">广告标题</h3><img ng-src="{{item.imgurl}}"></a></div></div><div class="ad-list clearfix sm" ng-if="module.params.sizeType == 2"><div class="ad-list-item col-xs-6 col-sm-6" ng-repeat="item in module.params.items"><a href="{{item.url}}"><h3 ng-bind="item.title">广告标题</h3><img ng-src="{{item.imgurl}}"></a></div></div></div></div></div><div we7-drag></div></div></div>');

    templateCache.put("widget-adimg-editor.html", '<div ng-controller="AdImgCtrl"><div class="app-adImg-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body form-horizontal"><div class="form-group"><label class="control-label col-xs-3">显示方式</label><div class="col-xs-9"><input type="radio" class="carousel-style" ng-model="activeItem.params.listStyle" value="1" ng-click="activeItem.params.sizeType=1;changeInnerHeight()" name="ad-show-style" id="list-style1"><label class="radio-inline" for="list-style1">折叠轮播</label><input type="radio" class="separate-style" ng-model="activeItem.params.listStyle" value="2" name="ad-show-style" ng-click="changeInnerHeight()" id="list-style2"><label class="radio-inline" for="list-style2">分开显示</label></div></div><div class="form-group"><label class="control-label col-xs-3">显示大小</label><div class="col-xs-9"><input type="radio" class="size-lg-style" ng-model="activeItem.params.sizeType" value="1" name="ad-size" ng-click="changeInnerHeight()" id="size-type1"><label class="radio-inline" for="size-type1">大图</label><input type="radio" class="size-sm-style" ng-model="activeItem.params.sizeType" value="2" name="ad-size" ng-click="changeInnerHeight()" id="size-type2"><label class="radio-inline" for="size-type2" ng-show="activeItem.params.listStyle == 2">小图</label></div></div><div class="add-adImg-item card clearfix" ng-repeat="item in activeItem.params.items"><div class="btns"><a href="#" ng-click="addEmpty()"><i class="fa fa-plus"></i></a> <a href="#" ng-click="removeItem(item)"><i class="fa fa-times"></i></a></div><div class="col-xs-3 img"><h3 ng-click="changeItem(item)">重新上传</h3><img src="" ng-src="{{ item.imgurl }}" width="100%"></div><div class="col-xs-9"><div class="form-group"><label class="control-label col-xs-3">标题</label><div class="col-xs-9"><input class="form-control" name="title" ng-model="item.title" value="" type="text"></div></div><div class="form-group"><label class="control-label col-xs-3">链接</label><div class="col-xs-9 form-control-static"><div we7-linker we7-my-url="item.url" we7-my-title="item.title"></div></div></div></div></div><div class="add-adImg card" ng-click="addItem()"><a href="#"><i class="fa fa-plus-circle green"></i>添加一个广告</a></div></div></div></div></div></div>');

    templateCache.put("widget-audio-display.html", '<div ng-controller="AudioCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-audio" style="{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="inner"><div ng-if="module.params.style == \'1\'" id="audio-music-{{$index+0}}" data-reload="{{module.params.reload}}" class="wx audioLeft clearfix" data-src="{{module.params.audio.url}}" ng-class="{\'audioLeft\': module.params.align == \'left\', \'audioRight\': module.params.align == \'right\'}" style="width:100%;height:100%"><img ng-init="module.params.headimg = module.params.headimg ? module.params.headimg : \'./resource/images/app/shop.png!80x80.jpg\'" ng-src="{{module.params.headimg}}" alt="语音头像" class="audioLogo" width="40" height="40"> <span class="audioBar js-play"><img style="display:none" ng-if="module.params.align == \'left\'" src="./resource/images/app/player.gif" class="audioAnimation"> <img style="display:none" ng-if="module.params.align == \'right\'" src="./resource/images/app/green_player.gif" class="audioAnimation"> <i class="audioStatic"></i> <span style="display:none" class="audioLoading"><i class="fa fa-spinner fa-pulse"></i></span></span> <span class="audioBar js-pause" style="display:none"><img ng-if="module.params.align == \'left\'" src="./resource/images/app/player.gif" class="audioAnimation"> <img ng-if="module.params.align == \'right\'" src="./resource/images/app/green_player.gif" class="audioAnimation"> <i class="audioStatic"></i></span> <span class="audio-time"></span><div class="js-audio-wx" data-id="audio-music-{{$index+0}}"></div></div><div class="music music-play" id="audio-music-{{$index+0}}" data-src="{{module.params.audio.url}}" data-reload="{{module.params.reload}}" data-loop="{{module.params.isloop}}" ng-if="module.params.style == \'2\'"><span class="audioStatic js-play"><a href="javascript:;"><i class="fa fa-play-circle-o"></i></a></span> <span class="audioAnimation js-pause" style="display:none"><a href="javascript:;"><i class="fa fa-pause"></i></a></span> <span class="musicTitle" ng-if="module.params.title == \'\'">歌名儿</span> <span class="musicTitle" ng-if="module.params.title != \'\'">{{module.params.title}}</span> <span class="audioLoading" style="display:none"><i class="fa fa-spinner fa-pulse"></i></span> <span class="audio-time" style="display:none"><span class="audio-current-time">00:00</span>/<span class="audio-duration">00:00</span></span><div class="slider-bar"><div class="slider-fill"></div></div><div class="js-audio-music" data-id="audio-music-{{$index+0}}"></div></div></div></div><div we7-drag></div></div></div>');

    templateCache.put("widget-audio-editor.html", '<div ng-controller="AudioCtrl"><div class="app-audio-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body form-horizontal"><div class="form-group"><label class="col-xs-2 control-label">音频</label><div class="col-xs-10"><span class="input-group-btn"><button type="button" class="btn btn-default audio-player-play" style="display:none"><i class="fa fa-play"></i></button> <button ng-click="addAudioItem()" type="button" class="btn btn-default">选择媒体文件</button></span></div></div><div class="form-group"><label class="col-xs-2 control-label">样式</label><div class="col-xs-10"><div class=""><input id="wx-music-type" type="radio" name="wx-music" value="1" ng-model="activeItem.params.style" ng-click="changeInnerHeight()"><label class="radio-inline" for="wx-music-type">模仿微信对话样式</label><div class="form-group" ng-show="activeItem.params.style == \'1\'"><label class="control-label col-xs-3">头像:</label><div class="col-xs-3" style="padding-top:10px"><img ng-init="activeItem.params.headimg = activeItem.params.headimg ? activeItem.params.headimg : \'./resource/images/app/shop.png!80x80.jpg\'" ng-src="{{activeItem.params.headimg}}" alt="语音头像" width="62" height="62"></div><div class="help-block col-xs-6" style="padding-left:0;padding-top:10px"><a href="#" ng-click="addImgItem()">上传头像</a><br>建议尺寸80*80像素<br>如果不设置,默认将使用店铺logo</div></div><div class="form-group" ng-show="activeItem.params.style == \'1\'"><label class="control-label col-xs-3">气泡:</label><div class="col-xs-9"><input id="bubble-left" type="radio" name="bubble" value="left" ng-model="activeItem.params.align"><label class="radio-inline" for="bubble-left">居左</label><input id="bubble-right" type="radio" name="bubble" value="right" ng-model="activeItem.params.align"><label class="radio-inline" for="bubble-right">居右</label></div></div></div><div class=""><input id="simple-music-type" type="radio" name="wx-music" value="2" ng-model="activeItem.params.style" ng-click="changeInnerHeight()"><label class="radio-inline" for="simple-music-type">简易音乐播放器</label><div><div class="form-group" ng-show="activeItem.params.style == \'2\'"><label class="control-label col-xs-3">标题:</label><div class="col-xs-9"><input class="form-control" type="text" ng-model="activeItem.params.title"></div></div><div class="form-group" ng-show="activeItem.params.style == \'2\'"><label class="control-label col-xs-3">循环:</label><div class="col-xs-9"><label class="checkbox-inline"><input type="checkbox" ng-model="activeItem.params.isloop">开启循环播放</label></div></div></div></div></div></div><div class="form-group"><label class="col-xs-2 control-label">播放</label><div class="col-xs-10"><div><input id="play-type1" type="radio" name="play" ng-model="activeItem.params.reload" value="true"><label class="radio-inline" for="play-type1">暂停后再回复播放时,从头开始</label></div><div><input id="play-type2" type="radio" name="play" ng-model="activeItem.params.reload" value="false"><label class="radio-inline" for="play-type2">暂停后再回复播放时,从暂停位置开始</label></div></div></div></div></div></div></div></div>');

    templateCache.put("widget-countdown-display.html", '<div ng-controller="CountDownCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}width:100%;height:100%" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-countDown" style="width:100%;height:100%;overflow:hidden;{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="timer" data="{{module.params.deadtime}}"><span class="day" ng-bind="module.params.leftTimeText.day"></span> <small style="vertical-align:middle;margin:3px">天</small> <span class="hours" ng-bind="module.params.leftTimeText.hour"></span> <small style="vertical-align:middle;margin:3px">时</small> <span class="minutes" ng-bind="module.params.leftTimeText.min"></span> <small style="vertical-align:middle;margin:3px">分</small> <span class="seconds" ng-bind="module.params.leftTimeText.sec"></span> <small style="vertical-align:middle;margin:3px">秒</small></div><script type="text/javascript">$(document).ready(function(){\r\n\t\t\t\t\tsetInterval(function(){\r\n\t\t\t\t\t\tvar timer = $(\'.timer\');\r\n\t\t\t\t\t\tfor (var i = 0; i < timer.length; i++) {\r\n\t\t\t\t\t\t\tvar dead = $(timer.get(i)).attr(\'data\');\r\n\t\t\t\t\t\t\tvar deadtime = dead.replace(/-/g,\'/\');\r\n\t\t\t\t\t\t\tdeadtime = new Date(deadtime).getTime();\r\n\t\t\t\t\t\t\tvar nowtime = Date.parse(Date());\r\n\t\t\t\t\t\t\tvar diff = deadtime - nowtime > 0 ? deadtime - nowtime : 0;\r\n\t\t\t\t\t\t\tvar res = {};\r\n\t\t\t\t\t\t\tres.day = parseInt(diff / (24 * 60 * 60 * 1000));\r\n\t\t\t\t\t\t\tres.hour = parseInt(diff / (60 * 60 * 1000) % 24);\r\n\t\t\t\t\t\t\tres.min = parseInt(diff / (60 * 1000) % 60);\r\n\t\t\t\t\t\t\tres.sec = parseInt(diff / 1000 % 60);\r\n\t\t\t\t\t\t\t$(\'.timer[data="\'+dead+\'"] .day\').text(res.day);\r\n\t\t\t\t\t\t\t$(\'.timer[data="\'+dead+\'"] .hours\').text(res.hour);\r\n\t\t\t\t\t\t\t$(\'.timer[data="\'+dead+\'"] .minutes\').text(res.min);\r\n\t\t\t\t\t\t\t$(\'.timer[data="\'+dead+\'"] .seconds\').text(res.sec);\r\n\t\t\t\t\t\t};\r\n\t\t\t\t\t}, 1000);\r\n\t\t\t\t});<\/script></div><div we7-drag we7-resize we7-rotate></div></div></div>');

    templateCache.put("widget-countdown-editor.html", '<div ng-controller="CountDownCtrl"><div class="app-countDown-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body"><div class="form-group"><label class="col-xs-3 control-label">倒计时截止时</label><div class="col-xs-6"><input type="text" class="form-control" ng-model="activeItem.params.deadtimeToMin" disabled></div><div class="col-xs-3 form-control-static"><span class="date"><a href="javascript:;" we7-date-picker we7-date-value="activeItem.params.deadtime">日期</a></span></div></div></div></div></div></div></div>');

    templateCache.put("widget-cube-display.html", '<div ng-controller="CubeCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-cube" style="{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="inner"><table><tr ng-repeat="row in module.params.layout" ng-init="rowindex=$index"><td ng-init="colindex=$index" ng-repeat="col in row" class="{{col.classname}} rows-{{col.rows}} cols-{{col.cols}}" ng-class="{\'empty\' : col.isempty, \'not-empty\' : !col.isempty}" rowspan="{{col.rows}}" colspan="{{col.cols}}"><div ng-if="!col.isempty && col.imgurl"><a href="{{col.url}}"><img ng-src="{{col.imgurl}}" width="{{col.cols * 60}}" height="{{col.rows * 60}}"></a></div></td></tr></table></div></div><div we7-drag></div></div></div>');

    templateCache.put("widget-cube-editor.html", '<div ng-controller="CubeCtrl"><div class="app-cube-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body form-horizontal"><div class="form-group"><label class="col-xs-3 control-label">布局</label><div class="col-xs-9"><table id="cube-editor"><tr ng-repeat="(x, row) in activeItem.params.layout"><td ng-repeat="(y, col) in row" class="{{col.classname}} rows-{{col.rows}} cols-{{col.cols}}" ng-click="col[\'isempty\'] ? showSelection(x, y) : changeItem(x, y)" ng-class="{\'empty\' : col.isempty, \'not-empty\' : !col.isempty}" rowspan="{{col.rows}}" colspan="{{col.cols}}" x="{{x}}" y="{{y}}"><div ng-if="col.isempty">+</div><div ng-if="!col.imgurl && !col.isempty">{{col.cols * 160}} * {{col.rows * 160}}</div><div ng-if="!col.isempty && col.imgurl"><img ng-src="{{col.imgurl}}" width="{{col.cols * 60}}" height="{{col.rows * 60}}"></div></td></tr></table><span class="help-block">点击"+",添加内容</span><img ng-src="{{col.imgurl}}" width="{{col.cols * 60}}" height="{{col.cols * 60}}"></div></div><div ng-show="activeItem.params.currentLayout.isempty == false" class="add-cube-item card clearfix"><div class="btns"><a href="#" ng-click="removeItem()"><i class="fa fa-times"></i></a></div><div class="form-group"><label class="control-label col-xs-3"><span class="red">*</span>选择图片</label><div class="col-xs-9"><div style="width:50px; height:50px; overflow:hidden; float:left; margin-right:10px"><img ng-src="{{activeItem.params.currentLayout.imgurl}}" id="thumb" width="100%"></div><span ng-click="addItem()"><i class="fa fa-plus-circle green"></i>&nbsp;添加图片</span> <span class="help-block">建议尺寸：{{activeItem.params.currentLayout.cols * 160}} * {{activeItem.params.currentLayout.rows * 160}} 像素</span></div></div><div class="form-group"><label class="control-label col-xs-3">链接</label><div class="col-xs-9 form-control-static"><div we7-linker we7-my-url="activeItem.params.currentLayout.url" we7-my-title="activeItem.params.currentLayout.title"></div></div></div></div></div></div></div></div><div id="modal-cube-layout" class="modal fade in" role="dialog" aria-hidden="false"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h3>选择布局</h3></div><div class="modal-body text-center"><div class="layout-table"><ul class="layout-cols layout-rows-{{col.rows}} clearfix" ng-repeat="row in activeItem.params.selection"><li data-cols="{{col.cols}}" data-rows="{{col.rows}}" ng-click="selectLayout(activeItem.params.currentPos.row, activeItem.params.currentPos.col, col.rows, col.cols)" ng-repeat="col in row"></li></ul></div></div></div></div></div></div>');

    templateCache.put("widget-dial-display.html", '<div ng-controller="DialCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}width:100%;height:100%" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-dial" style="width:100%;height:100%;{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div ng-repeat="item in module.params.items" ng-if="item.active" style="width:100%;height:100%"><div class="app-dialphone animated" ng-if="item.type==\'text\'" style="width:100%;height:100%"><a ng-href="tel:{{item.tel}}" class="element-link"><div class="element-box" ng-bind="item.title" ng-style="{\'line-height\' : module.params.baseStyle.lineHeight, \'color\' : item.color}"></div></a></div><div ng-if="item.type==\'img\'" style="width:100%;height:100%"><a ng-href="tel:{{item.tel}}" class="element-link" style="width:100%"><img ng-src="{{item.imgurl}}" style="width:100%;height:100%" alt=""></a></div></div></div><div we7-drag we7-resize we7-rotate></div></div></div>');

    templateCache.put("widget-dial-editor.html", '<div ng-controller="DialCtrl"><div class="app-dial-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body"><ul class="nav nav-pills nav-justified"><li ng-class="{active : item.active}" ng-repeat="item in activeItem.params.items"><a ng-href="#{{item.id}}" role="tab" data-toggle="tab" ng-click="changeItem(item);"><button ng-class="{\'btn\' : 1,\'btn-danger\' : item.editcolor==\'danger\', \'btn-warning\' : item.editcolor==\'warning\', \'btn-success\' : item.editcolor==\'success\', \'btn-default\' : item.editcolor==\'default\', \'btn-primary\' : item.editcolor==\'primary\'}"><span ng-if="item.type==\'img\'" class="fa fa-picture-o"></span> <span ng-if="item.id==\'1\'">一键拨号</span> <span ng-if="item.id==\'2\'">热线电话</span> <span ng-if="item.id==\'3\'">拨打电话</span> <span ng-if="item.id==\'4\'">销售专线</span> <span ng-if="item.id==\'5\'">自定义</span></button></a></li></ul><hr><div class="tab-content"><div class="tab-pane active" id="{{item.id}}" ng-repeat="item in activeItem.params.items" ng-if="item.active"><div class="form-group" ng-if="item.type==\'text\'"><label class="col-xs-3 control-label">按钮名称</label><div class="col-xs-9"><input type="text" class="form-control" ng-model="item.title"></div></div><div class="form-group" ng-if="item.type==\'img\'"><label class="col-xs-3 control-label">按钮图片</label><div class="col-xs-9"><div class="img-container"><img ng-src="{{item.imgurl}}" alt=""> <span class="change-img" ng-click="addImage(item);"><span ng-show="item.imgurl">更换</span><span ng-show="!item.imgurl">添加</span>图片</span></div></div></div><div class="form-group"><label class="col-xs-3 control-label">手机/电话</label><div class="col-xs-9"><input type="text" class="form-control" ng-model="item.tel" placeholder="010-8888888"></div></div></div></div></div></div></div></div></div>');

    templateCache.put("widget-good-display.html", '<div ng-controller="GoodCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}width:100%;height:100%" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-good" style="width:100%;height:100%;{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="element app-good-up" ng-if="module.params.layoutstyle==\'1\'"><div class="counter-container" ng-style="{\'width\': \'100%\', \'height\': \'100%\', \'line-height\' : module.params.baseStyle.lineHeight, \'overflow\' : \'hidden\'}"><i class="fa fa-thumbs-o-up"></i> <span class="counter-num">0</span></div></div><div class="element app-good-up" ng-if="module.params.layoutstyle==\'2\'"><div class="counter-container counter-vertical" style="width:100%; height:100%; line-height:normal;overflow:hidden"><i class="fa fa-thumbs-o-up"></i> <span class="counter-num">0</span></div></div><script type="text/javascript">$(document).ready(function() {\r\n\t\t\t\t\tvar patt = new RegExp(\'c=home&a=page\');\r\n\t\t\t\t\tif (patt.exec(window.location.href)) {\r\n' + "\t\t\t\t\t\t$.post(window.location.href, {'do' : 'getnum'}, function(data) {\r\n\t\t\t\t\t\t\tif (data.message.errno == 0) {\r\n\t\t\t\t\t\t\t\t$('.counter-num').text(data.message.message.goodnum);\r\n\t\t\t\t\t\t\t}\r\n\t\t\t\t\t\t}, 'json');\r\n\t\t\t\t\t\t$(\".app-good .element\").click(function() {\r\n\t\t\t\t\t\t\tvar id=GetQueryString(\"id\");\r\n\t\t\t\t\t\t\tif(id !=null && id.toString().length>=1 && localStorage.havegood != id){\r\n\t\t\t\t\t\t\t\t$.post(window.location.href, {'do': 'addnum'}, function(data) {\r\n\t\t\t\t\t\t\t\t\tif (data.message.errno == 0) {\r\n\t\t\t\t\t\t\t\t\t\tvar now = $('.counter-num').text();\r\n\t\t\t\t\t\t\t\t\t\tnow = parseInt(now)+1;\r\n\t\t\t\t\t\t\t\t\t\t$('.counter-num').text(now);\r\n\t\t\t\t\t\t\t\t\t\tlocalStorage.havegood = id;\r\n\t\t\t\t\t\t\t\t\t}\r\n\t\t\t\t\t\t\t\t}, 'json');\r\n\t\t\t\t\t\t\t}\r\n\t\t\t\t\t\t});\r\n\t\t\t\t\t\tfunction GetQueryString(name){\r\n\t\t\t\t\t\t\tvar reg = new RegExp(\"(^|&)\"+ name +\"=([^&]*)(&|$)\");\r\n\t\t\t\t\t\t\tvar r = window.location.search.substr(1).match(reg);\r\n\t\t\t\t\t\t\tif(r!=null)return  unescape(r[2]); return null;\r\n\t\t\t\t\t\t}\t\t\t\t\t\t\r\n\t\t\t\t\t};\r\n\t\t\t\t});<\/script></div><div we7-drag we7-resize we7-rotate></div></div></div>");

    templateCache.put("widget-good-editor.html", '<div ng-controller="GoodCtrl"><div class="app-good-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body"><div class="form-group"><label class="col-xs-3 control-label">颜色</label><div class="col-xs-9"><div we7-colorpicker we7-my-color="activeItem.params.baseStyle.color" we7-my-default-color="activeItem.params.baseStyle.color"></div></div></div><div class="form-group"><label class="col-xs-3 control-label">布局</label><div class="col-xs-9"><div class="btn-group"><div ng-class="{\'btn\' : \'1\', \'active\' : activeItem.params.layoutactive==\'lr\',\'btn-default\' : activeItem.params.layoutstyle != \'1\',\'btn-primary\' : activeItem.params.layoutstyle==\'1\'}" ng-click="changeLayout(\'lr\')">左右</div><div ng-class="{\'btn\' : \'1\', \'active\' : activeItem.params.layoutactive==\'ud\',\'btn-default\' : activeItem.params.layoutstyle != \'2\',\'btn-primary\' : activeItem.params.layoutstyle==\'2\'}" ng-click="changeLayout(\'ud\')">上下</div></div></div></div></div></div></div></div></div>');

    templateCache.put("widget-header-display.html", '<div ng-controller="HeaderCtrl" we7-nobar><div class="title js-default-content"><h1><span>{{module.params.title}}</span></h1></div></div>');

    templateCache.put("widget-header-editor.html", '<div ng-controller="HeaderCtrl" ng-if="activePageIndex == 0"><div class="app-header-setting"><div class="arrow-left"></div><div class="app-header-setting-inner"><div class="panel panel-default"><div class="panel-body form-horizontal"><div class="form-group"><label class="col-xs-3 control-label"><span class="red">*</span> 页面名称</label><div class="col-xs-9"><input type="text" ng-model="activeItem.params.title" placeholder="微页面标题" class="form-control"></div></div><div class="form-group"><label class="col-xs-3 control-label">页面描述</label><div class="col-xs-9"><input type="text" ng-model="activeItem.params.description" placeholder="用户通过微信分享给朋友时,会自动显示页面描述" class="form-control"></div></div><div class="form-group"><label class="col-xs-3 control-label">触发关键字</label><div class="col-xs-9"><input type="text" ng-model="activeItem.params.keyword" class="form-control"> <span class="help-block">用户触发关键字，系统回复此页面的图文链接.不支持多关键字</span></div></div><div class="form-group"><label class="control-label col-xs-3"><span class="red">*</span>封面</label><div class="col-xs-9"><span ng-click="addThumb(\'thumb\')"><i class="fa fa-plus-circle green"></i>&nbsp;选择图片</span><div style="margin-top:.5em" class="input-group" ng-show="activeItem.params.thumb"><img width="150" class="img-responsive img-thumbnail" ng-src="{{activeItem.params.thumb}}"> <em ng-click="activeItem.params.thumb = \'\';" title="删除这张图片" style="position:absolute; top: 0px; right: -14px" class="close">×</em></div><span class="help-block">用于用户触发关键字后，系统回复时的封面图片</span></div></div><div class="form-group"><label class="control-label col-xs-3">快捷菜单</label><div class="col-xs-9" style="margin-top:7px"><input type="checkbox" class="from-control" ng-click="ifCheck()" ng-checked="activeItem.params.bottom_menu"> <span>是否在本专题页面中显示微站快捷菜单</span></div></div></div></div></div></div></div>');

    templateCache.put("widget-image-display.html", '<div ng-controller="ImageCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}width:100%;height:100%" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-image" style="width:100%;height:100%;{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><img style="width:100%;height:100%" ng-src="{{module.params.items.imgurl}}" alt=""></div><div we7-drag we7-resize we7-rotate></div></div></div>');

    templateCache.put("widget-image-editor.html", '<div ng-controller="ImageCtrl"><div class="app-image-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body"><div class="add-image-item card clearfix" ng-show="activeItem.params.items.imgurl"><div class="col-xs-3 img"><h3 ng-click="changeItem(activeItem.params.items)">重新上传</h3><img ng-src="{{ activeItem.params.items.imgurl }}" width="100%"></div></div><div class="add-image-editor card" ng-click="addItem()" ng-hide="activeItem.params.items.imgurl"><a href="#"><i class="fa fa-plus-circle green"></i>添加一个图片</a></div></div></div></div></div></div>');

    templateCache.put("widget-line-display.html", '<div ng-controller="LineCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}width:100%;height:100%" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-line" style="width:100%;height:100%;overflow:hidden;{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="inner"><hr style="border-top-color:{{module.params.baseStyle.color}}"></div></div><div we7-drag we7-resize we7-rotate></div></div></div>');

    templateCache.put("widget-line-editor.html", '<div ng-controller="LineCtrl"><div class="app-line-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body">辅助线（请于左侧拖动缩放调整）</div></div></div></div></div>');

    templateCache.put("widget-link-display.html", '<div ng-controller="LinkCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div class="container-link" style="{{module.transform}}" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-link js-default-content" ng-if="module.params.items.length == 0" style="{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="inner"><div class="list-group"><div class="list-group-item"><a class="clearfix" href="javascript:;"><span class="app-nav-title">点此编辑第1条『关联链接』<i class="pull-right fa fa-angle-right"></i></span></a></div><div class="list-group-item"><a class="clearfix" href="javascript:;"><span class="app-nav-title">点此编辑第2条『关联链接』<i class="pull-right fa fa-angle-right"></i></span></a></div><div class="list-group-item"><a class="clearfix" href="javascript:;"><span class="app-nav-title">点此编辑第n条『关联链接』<i class="pull-right fa fa-angle-right"></i></span></a></div></div></div></div><div ng-if="module.params.items.length != 0"><div class="app-link" style="{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.params.animate}}"><div class="inner"><div class="list-group"><div ng-repeat="item in module.params.items"><div ng-if="item.type == \'1\' && (item.selectCate.pid > 0 || item.selectCate.cid > 0)"><div class="list-group-item" ng-repeat="i in pageSize | limitTo:item.pageSize"><a class="clearfix" href="javascript:;"><span class="app-nav-title">第{{$index+1}}条 {{item.selectCate.name}} 的『关联链接』<i class="pull-right fa fa-angle-right"></i></span></a></div></div><div class="list-group-item" ng-if="item.type == \'2\'"><a class="clearfix" href="{{item.url}}"><span class="app-nav-title">{{item.title}} <i class="pull-right fa fa-angle-right"></i></span></a></div></div></div></div></div></div><div we7-drag></div></div></div>');

    templateCache.put("widget-link-editor.html", '<div ng-controller="LinkCtrl"><div class="app-textNav-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body form-horizontal"><div class="card add-textNav-con" ng-repeat="item in activeItem.params.items"><div class="btns"><a href="javascript:" ng-click="addItem()"><i class="fa fa-plus"></i></a> <a href="javascript:" ng-click="removeItem(item)"><i class="fa fa-times"></i></a></div><div class="form-group"><label class="control-label col-xs-3"><span class="red">*</span> 数据来源</label><div class="col-xs-9"><input id="source-type1" type="radio" value="1" ng-model="item.type" name="link-type-{{$index+0}}" ng-click="changeInnerHeight()"><label class="radio-inline" for="source-type1">分类</label><input id="source-type2" type="radio" value="2" ng-model="item.type" name="link-type-{{$index+0}}" ng-click="changeInnerHeight()"><label class="radio-inline" for="source-type2">自定义</label></div></div><div class="form-group" ng-show="item.type == 2"><label class="control-label col-xs-3"><span class="red">*</span> 导航名称</label><div class="col-xs-9"><input type="text" class="form-control" name="" ng-class="{\'red\': item.title == \'\'}" ng-model="item.title"></div></div><div class="form-group" ng-show="item.type == 2"><label class="control-label col-xs-3"><span class="red">*</span> 链接到</label><div class="col-xs-9 form-control-static"><div we7-linker we7-my-url="item.url" we7-my-title="item.title"></div></div></div><div class="form-group" ng-show="item.type == 1"><label class="control-label col-xs-3"><span class="red">*</span>内容来源</label><div class="col-xs-9"><div class="input-group"><div class="form-control-static"><label ng-if="item.selectCate.id != 0" class="label label-success">{{item.selectCate.name}}</label><a href="javascript:;" ng-click="showSearchCateList(item)"><span ng-if="item.selectCate.id == 0">从分类中选择</span><span ng-if="item.selectCate.id != 0">修改</span></a></div></div></div></div><div class="form-group" ng-show="item.type == 1"><label class="control-label col-xs-3">文章属性</label><div class="col-xs-9"><input id="article-attr-type1" type="checkbox" ng-model="item.isnew" value="1" name="attribute"><label class="checkbox-inline" for="article-attr-type1">最新</label><input id="article-attr-type2" type="checkbox" ng-model="item.iscommend" value="1" name="attribute"><label class="checkbox-inline" for="article-attr-type2">推荐</label><input id="article-attr-type3" type="checkbox" ng-model="item.ishot" value="1" name="attribute"><label class="checkbox-inline" for="article-attr-type3">头条</label></div></div><div class="form-group" ng-show="item.type == 1"><label class="control-label col-xs-3">显示条数</label><div class="col-xs-9"><select class="form-control" ng-model="item.pageSize" ng-change="changePageSize(item)"><option value="1">1条</option><option value="2">2条</option><option value="3">3条</option><option value="4">4条</option><option value="5">5条</option><option value="10">10条</option><option value="15">15条</option><option value="20">20条</option><option value="30">30条</option></select></div></div></div><div class="add-textNav card"><a href="javascript:" ng-click="addItem()"><i class="fa fa-plus-circle green"></i> 添加一个导航</a></div></div></div></div></div><div id="modal-search-cate-link" class="modal fade in" role="dialog" aria-hidden="false"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3>选择分类</h3></div><div class="modal-body"><table class="table table-hover"><thead class="navbar-inner"><tr><th style="width:60%">标题</th><th style="width:30%; text-align:right"><div class="input-group input-group-sm"><input type="text" class="form-control js-search-cate-keyword"> <span class="input-group-btn"><button ng-click="showSearchCateList(currentItem)" class="btn btn-default" type="button"><i class="fa fa-search"></i></button></span></div></th></tr></thead><tbody ng-repeat="pcate in searchCateList"><tr><td><a href="#">{{pcate.name}}</a></td><td class="text-right"><a class="btn btn-default btn-sm" ng-click="selectCateItem(pcate.id, 0, pcate.name)">选取</a></td></tr><tr ng-repeat="ccate in pcate.children track by $index"><td style="padding-left:50px;height:30px;line-height:30px;background-image:url(\'./resource/images/bg_repno.gif\'); background-repeat:no-repeat; background-position: -245px -540px"><a href="#">{{ccate.name}}</a></td><td class="text-right"><a class="btn btn-default btn-sm" ng-click="selectCateItem(0, ccate.id, ccate.name)">选取</a></td></tr></tbody></table></div></div></div></div></div>');

    templateCache.put("widget-navimg-display.html", '<div ng-controller="NavImgCtrl" style="{{module.positionStyle}}min-height:90px;transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}width:100%;height:100%" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-navImg" style="width:100%;height:100%;{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="inner" style="height:100%"><ul class="clearfix" style="height:100%"><li ng-repeat="item in module.params.items" style="height:100%"><a href="{{item.url}}" style="height:100%;width:100%"><span class="nav-img" style="height:80%;width:100%" ng-if="item.imgurl"><img ng-src="{{item.imgurl}}" style="height:100%;width:95%"></span> <span class="title" title="{{item.title}}" style="height:20%;width:100%;line-height:100%">{{item.title}}</span></a></li></ul></div></div><div we7-drag we7-resize we7-rotate></div></div></div>');

    templateCache.put("widget-navimg-editor.html", '<div ng-controller="NavImgCtrl"><div class="app-nav-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body form-horizontal"><div ng-repeat="item in activeItem.params.items"><div class="card nav-item clearfix"><div class="col-xs-3 img" ng-if="item.imgurl == \'\'"><span ng-click="changeItem(item)"><i class="fa fa-plus-circle green"></i>&nbsp;添加图片</span></div><div class="col-xs-3 img" ng-if="item.imgurl != \'\'"><h3 ng-click="changeItem(item)">重新上传</h3><img ng-src="{{ item.imgurl }}"></div><div class="col-xs-9"><div class="form-group"><label class="control-label col-xs-3">文字</label><div class="col-xs-9"><input name="title" ng-model="item.title" class="form-control" typel="text" placeholder="文字"></div></div><div class="form-group"><label class="control-label col-xs-3">链接</label><div class="col-xs-9 form-control-static"><div we7-linker we7-my-url="item.url" we7-my-title="item.title"></div></div></div></div></div></div></div></div></div></div></div>');

    templateCache.put("widget-notice-display.html", '<div ng-controller="NoticeCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-notice" style="{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="inner"><div class="notice-box"><div class="scrollNotice"><span class="js-scroll-notice">公告: {{module.params.notice || \'请填写内容,如果过长,将会在手机上滚动显示!\'}}</span></div></div></div></div><div we7-drag></div></div></div>');

    templateCache.put("widget-notice-editor.html", '<div ng-controller="NoticeCtrl"><div class="app-notice-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body form-horizontal"><div class="form-group" style="margin-bottom:0"><label class="col-xs-2 control-label">公告</label><div class="col-xs-10"><input type="text" ng-model="activeItem.params.notice" value="" class="form-control" placeholder="请填写内容,如果过长,将会在手机上滚动显示"></div></div></div></div></div></div></div>');

    templateCache.put("widget-onlytext-display.html", '<div ng-controller="OnlyTextCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}width:100%;height:100%" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-onlyText" style="width:100%;height:100%;{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="element" ng-bind="module.params.title" style="overflow:hidden"></div></div><div we7-drag we7-resize we7-rotate></div></div></div>');

    templateCache.put("widget-onlytext-editor.html", "<div ng-controller=\"OnlyTextCtrl\"><div class=\"app-onlyText-edit\"><div class=\"arrow-left\"></div><div class=\"inner\"><div class=\"panel panel-default\"><div class=\"panel-body\"><div class=\"form-group\"><label class=\"control-label col-xs-3\">文字</label><div class=\"col-xs-6\"><input ng-model=\"activeItem.params.title\" class=\"form-control\"></div></div><div class=\"form-group\"><label class=\"col-xs-3 control-label\">位置</label><div class=\"col-xs-9\"><div class=\"btn-group\"><div ng-class=\"{'btn' : '1', 'btn-default' : '1', 'active' : activeItem.params.baseStyle.textAlign == 'left', 'btn-primary' : activeItem.params.baseStyle.textAlign == 'left'}\" ng-click=\"changeTextAlign('left')\">左</div><div ng-class=\"{'btn' : '1', 'btn-default' : '1', 'active' : activeItem.params.baseStyle.textAlign == 'center', 'btn-primary' : activeItem.params.baseStyle.textAlign == 'center'}\" ng-click=\"changeTextAlign('center')\">中</div><div ng-class=\"{'btn' : '1', 'btn-default' : '1', 'active' : activeItem.params.baseStyle.textAlign == 'right', 'btn-primary' : activeItem.params.baseStyle.textAlign == 'right'}\" ng-click=\"changeTextAlign('right')\">右</div></div></div></div></div></div></div></div></div>");

    templateCache.put("widget-purelink-display.html", '<div ng-controller="PureLinkCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}width:100%;height:100%" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-pureLink" style="width:100%;height:100%;{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div ng-repeat="item in module.params.items" ng-if="item.active" style="width:100%;height:100%"><div class="app-pureLink-basic animated" ng-if="item.type==\'text\'" style="width:100%;height:100%"><a ng-href="{{item.url}}" class="element-link"><div class="element-box" ng-bind="item.title" ng-style="{\'line-height\' : module.params.baseStyle.lineHeight, \'color\' : item.color}"></div></a></div><div ng-if="item.type==\'img\'" style="width:100%;height:100%"><a ng-href="{{item.url}}" class="element-link"><img ng-src="{{item.imgurl}}" style="width:100%;height:100%" alt=""></a></div></div></div><div we7-drag we7-resize we7-rotate></div></div></div>');

    templateCache.put("widget-purelink-editor.html", '<div ng-controller="PureLinkCtrl"><div class="app-pureLink-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body"><ul class="nav nav-pills nav-justified"><li ng-class="{active : item.active}" ng-repeat="item in activeItem.params.items"><a ng-href="#{{item.id}}" role="tab" data-toggle="tab" ng-click="changeItem(item);"><button ng-class="{\'btn\' : 1,\'btn-danger\' : item.editcolor==\'danger\', \'btn-warning\' : item.editcolor==\'warning\', \'btn-success\' : item.editcolor==\'success\', \'btn-default\' : item.editcolor==\'default\', \'btn-primary\' : item.editcolor==\'primary\'}"><span ng-if="item.type==\'img\'" class="fa fa-picture-o"></span><span ng-if="item.id==\'1\'">点我购买</span><span ng-if="item.id==\'2\'">点开链接</span><span ng-if="item.id==\'3\'">马上购买</span><span ng-if="item.id==\'4\'">关注我们</span><span ng-if="item.id==\'5\'">自定义</span></button></a></li></ul><hr><div class="tab-content"><div class="tab-pane active" id="{{item.id}}" ng-repeat="item in activeItem.params.items" ng-show="item.active"><div class="form-group" ng-show="item.type==\'text\'"><label class="col-xs-3 control-label">按钮名称</label><div class="col-xs-9"><input type="text" class="form-control" ng-model="item.title"></div></div><div class="form-group" ng-show="item.type==\'img\'"><label class="col-xs-3 control-label">按钮图片</label><div class="col-xs-9"><div class="img-container"><img ng-src="{{item.imgurl}}" alt=""> <span class="change-img" ng-click="addImage(item);"><span ng-show="item.imgurl">更换</span><span ng-show="!item.imgurl">添加</span>图片</span></div></div></div><div class="form-group"><label class="col-xs-3 control-label">网站地址</label><div class="col-xs-6"><input type="text" ng-model="item.url" class="form-control" placeholder="http://example.com"></div><div class="col-xs-3 form-control-static"><a href="http://dwz.cn/" target="_blank">生成短链接</a></div></div></div></div></div></div></div></div></div>');

    templateCache.put("widget-reward-display.html", "<div ng-controller=\"RewardCtrl\" style=\"{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)\" we7-context-menu><div style=\"{{module.transform}}width:100%;height:100%\" ng-class=\"{'alock' : module.params.baseStyle.lock}\"><div class=\"app-reward\" style=\"width:100%;height:100%;{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}\"><div class=\"element\" ng-style=\"{'width': '100%', 'height': '100%', 'line-height' : module.params.baseStyle.lineHeight}\"><a style=\"width:100%;height:100%;display:block;color:inherit\" href=\"{php echo url('home/page', array('do' => 'reward', 'id' => $id))}\">打赏</a></div></div><div we7-drag we7-resize we7-rotate></div></div></div>");

    templateCache.put("widget-reward-editor.html", "<div ng-controller=\"RewardCtrl\"><div class=\"app-reward-edit\"><div class=\"arrow-left\"></div><div class=\"inner\"><div class=\"panel panel-default\"><div class=\"panel-body\"><div class=\"form-group\"><label class=\"col-xs-3 control-label\">文字颜色</label><div class=\"col-xs-9\" ng-my-colorpicker ng-my-color=\"activeItem.params.baseStyle.color\" ng-my-default-color=\"activeItem.params.baseStyle.color\"></div></div><div class=\"form-group\"><label class=\"col-xs-3 control-label\">字号</label><div class=\"col-xs-9\"><div class=\"btn-group\" data-toggle=\"buttons\"><div ng-class=\"{'btn' : '1', 'active' : activeItem.params.fontactive=='big','btn-default' : activeItem.params.fonttype != 'big','btn-primary' : activeItem.params.fonttype=='big'}\" ng-click=\"changeSize('big')\">大</div><div ng-class=\"{'btn' : '1', 'active' : activeItem.params.fontactive=='middle','btn-default' : activeItem.params.fonttype != 'middle','btn-primary' : activeItem.params.fonttype=='middle'}\" ng-click=\"changeSize('middle')\">中</div><div ng-class=\"{'btn' : '1', 'active' : activeItem.params.fontactive=='small','btn-default' : activeItem.params.fonttype != 'small','btn-primary' : activeItem.params.fonttype=='small'}\" ng-click=\"changeSize('small')\">小</div></div></div></div></div></div></div></div></div>");

    templateCache.put("widget-richtext-display.html", '<div ng-controller="RichTextCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}width:100%;height:100%" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-richText" style="width:100%;height:100%;word-break:break-all;overflow:hidden;{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="inner" ng-style="{\'padding\' : module.params.isfull ? \'0\' : \'10px\'}" ng-bind-html="trustAsHtml(module.params.content, module.params.params)" ng-if="module.params.content || module.params.params"></div><div class="inner js-default-content" ng-if="!module.params.content && !module.params.params"><p>点此编辑『富文本』内容 ——&gt;</p><p>你可以对文字进行 <strong>加粗</strong>、<em>斜体</em>、<span style="text-decoration: underline">下划线</span>、 <span style="text-decoration: line-through">删除线</span>、文字<span style="color: rgb(0, 176, 240)">颜色</span>、 <span style="background-color: rgb(255, 192, 0); color: rgb(255, 255, 255)">背景色</span>、 以及字号<span style="font-size: 20px">大</span><span style="font-size: 14px">小</span>等简单排版操作。</p><p>还可以在这里加入表格了</p><table class="table-bordered"><tbody><tr><td>中奖客户</td><td>发放奖品</td><td>备注</td></tr><tr><td>猪猪</td><td>内测码</td><td><em><span class="red">已经发放</span></em></td></tr><tr><td>大麦</td><td>积分</td><td><a href="#" target="_blank">领取地址</a></td></tr></tbody></table><p style="text-align: left"><span style="text-align: left">也可在这里插入图片、并对图片加上超级链接，方便用户点击。</span></p></div></div><div we7-drag we7-resize we7-rotate></div></div></div>');

    templateCache.put("widget-richtext-editor.html", '<div ng-controller="RichTextCtrl"><div class="app-richText-edit"><div class="arrow-left"></div><div class="app-header-setting-new-inner"><div class="panel panel-default"><div class="panel-body form-horizontal"><div class="form-group"><label class="col-xs-3 control-label">是否全屏</label><div class="col-xs-9"><label for="fullScreen" class="checkbox-inline"><input id="fullScreen" name="fullScreen" type="checkbox" ng-model="activeItem.params.isfull">全屏显示</label></div></div><div class="form-group"><div class="col-xs-12"><div we7-editor we7-my-value="activeItem.params.content" we7-my-params="activeItem.params.params"></div></div></div></div></div></div></div></div>');

    templateCache.put("widget-shape-display.html", '<div ng-controller="ShapeCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}width:100%;height:100%" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-shape" style="width:100%;height:100%;{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div style="width:100%;height:100%" class="element" we7-svger we7-svg="module.params.svgValue"></div></div><div we7-drag we7-resize we7-rotate></div></div></div>');

    templateCache.put("widget-shape-editor.html", '<div ng-controller="ShapeCtrl"><div class="app-shape-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body"><div class="shape-editor"><a href="javascript:;" ng-click="addItem()" ng-if="!activeItem.params.svgValue"><i class="fa fa-plus-circle green"></i> &nbsp;填充形状</a> <a href="javascript:;" ng-click="addItem()" ng-if="activeItem.params.svgValue"><i class="fa fa-plus-circle green"></i> &nbsp;修改形状</a></div><div id="shapeModal" class="modal fade" role="dialog" aria-labelledby="gridSystemModalLabel"><div class="modal-dialog modal-lg" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="gridSystemModalLabel">形状库<span class="action">矢量素材，可更换颜色，放大不失真</span></h4></div><div class="dialog-content bg_console sound-flex clearfix"><div class="cate-title"><ul class="nav tabs-left"><li><a href="javascript:;" data-toggle="tab">形状库</a></li></ul></div><div class="cate-list bg-rig"><div id="bg_contain"><div class="tab-pane tab-head"><div class="img_list"><div class="category_list clearfix"><ul class="category_list_container clearfix"><li class="category_item" ng-class="{\'active\' : sysCategory.active}" ng-repeat="sysCategory in sysCategoryList" ng-click="getSysCatAndList(sysCategory)" ng-bind="sysCategory.name"></li></ul></div><div class="cat_two_list"><ul ng-repeat="sysCategory in sysCategoryList" ng-if="sysCategory.active"><li class="cat_two_item" ng-class="{\'active\': sysTag.active}" ng-if="sysCategory.id == sysTag.parentid" ng-repeat="sysTag in sysImageTag" ng-click="getSysImgByTag(sysTag);" ng-bind="sysTag.name"></li></ul></div></div></div><div class="img_list"><div class="img_list_container photo_list"><ul class="img_box" style="height:348px"><li ng-if="img.parentid == activeItem.params.imgListActive" ng-repeat="img in currentImageList" style="width: 100px; height: 100px;cursor:pointer; position: relative; display: inline-block; background:50% 50% / contain no-repeat rgb(230, 235, 237)" ng-style="{backgroundImage: \'url(\' + img.imgurl + \')\'}" data-url="{{img.imgurl}}" ng-click="selectSvg($event,img)"></li></ul></div></div></div></div><div class="modal-footer bg-pagination"><div class="fl mr20" ng-show="page.numPages > 1"><ul class="pagination" style="float: left"><li><a href="" ng-click="selectPage(1)">首页</a></li><li><a href="" ng-click="selectPage(page.currentPage - 1)">‹</a></li><li ng-repeat="p in pages track by $index" ng-class="{active: p.active}"><a href="javascript:;" ng-click="selectPage(p.number)" ng-bind="p.number"></a></li><li><a href="" ng-click="selectPage(page.currentPage + 1)">›</a></li><li><a href="" ng-click="selectPage(page.numPages)">尾页</a></li></ul><div class="current_page"><span class="fl">到</span> <input type="text" ng-model="page.toPage" ng-keyup="$event.keyCode == 13 ? getImgByPage() : null"> <span class="fl">页</span> <a ng-click="getImgByPage()" class="go">确定</a></div></div><a class="modal-cancle" ng-click="cancel()">取消</a> <a class="btn btn-primary" ng-click="confirm();">确定</a></div></div></div></div></div></div></div></div></div></div>');

    templateCache.put("widget-textnav-display.html", '<div ng-controller="TextNavCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-textNav" style="{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="inner"><div class="list-group mnav-box"><div class="list-group-item" ng-repeat="item in module.params.items" ng-style="{\'background-color\': module.params.baseStyle.backgroundColor}"><a class="clearfix" href="{{item.url}}"><span class="app-nav-title">{{item.title}}<i class="pull-right fa fa-angle-right"></i></span></a></div></div></div></div><div we7-drag></div></div></div>');

    templateCache.put("widget-textnav-editor.html", '<div ng-controller="TextNavCtrl"><div class="app-textNav-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body form-horizontal"><div class="card add-textNav-con" ng-repeat="item in activeItem.params.items"><div class="btns"><a href="javascript:" ng-click="addItem()"><i class="fa fa-plus"></i></a> <a href="javascript:" ng-click="removeItem(item)"><i class="fa fa-times"></i></a></div><div class="form-group"><label class="control-label col-xs-3"><span class="red">*</span> 导航名称</label><div class="col-xs-9"><input type="text" class="form-control" name="" ng-class="{\'red\': item.title == \'\'}" ng-model="item.title" value=""></div></div><div class="form-group"><label class="control-label col-xs-3"><span class="red">*</span> 链接到</label><div class="col-xs-9 form-control-static"><div we7-linker we7-my-url="item.url" we7-my-title="item.title"></div></div></div></div><div class="add-textNav card"><a href="javascript:" ng-click="addItem()"><i class="fa fa-plus-circle green"></i> 添加一个文本导航</a></div></div></div></div></div></div>');

    templateCache.put("widget-title-display.html", '<div ng-controller="TitleCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-title" style="{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="inner" style="height:96px"><div ng-if="module.params.template == 1" class="title-detail tradition" style="text-align: {{module.params.tradition.align}}"><h2 class="title-con">{{ module.params.title || "点击编辑『标题』"}}<span ng-if="module.params.tradition.nav.enable == 1" class="title-link">- <a href="{{module.params.tradition.nav.url}}" ng-bind="module.params.tradition.nav.title">文本导航</a></span></h2><p class="sub-title" ng-bind="module.params.tradition.subtitle">副标题</p></div><div ng-if="module.params.template == 2" class="title-detail text-left wx"><h2 class="title-con">{{ module.params.title || "点击编辑『标题』"}}</h2><p class="sub-title"><span class="date" ng-bind="module.params.news.date">2015-03-12</span>&nbsp;&nbsp;<span class="author" ng-bind="module.params.news.author">zhangsan</span>&nbsp;&nbsp;<span><a href="{{module.params.news.url}}" ng-bind="module.params.news.title">微擎团队</a></span></p></div></div></div><div we7-drag></div></div></div>');

    templateCache.put("widget-title-editor.html", '<div ng-controller="TitleCtrl"><div class="app-title-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body form-horizontal"><div class="form-group"><label class="col-xs-3 control-label"><span class="red">*</span> 标题名</label><div class="col-xs-9"><input type="text" class="form-control" name="" ng-model="activeItem.params.title" value=""></div></div><div class="form-group"><label class="control-label col-xs-3">标题模板</label><div class="col-xs-9"><input type="radio" name="title-style" ng-model="activeItem.params.template" value="1" class="tradition" id="template-type1"><label class="radio-inline" for="template-type1">传统样式</label><input type="radio" name="title-style" ng-model="activeItem.params.template" value="2" class="wx" id="template-type2"><label class="radio-inline" for="template-type2">模仿微信图文页样式</label></div></div><div class="form-group" ng-if="activeItem.params.template == 1"><label class="col-xs-3 control-label">副标题</label><div class="col-xs-6"><input type="text" class="form-control" ng-model="activeItem.params.tradition.subtitle" value=""></div><div class="col-xs-3 form-control-static"><span class="date"><a href="javascript:;" we7-date-picker we7-date-value="activeItem.params.tradition.subtitle">日期</a></span></div></div><div class="form-group" ng-if="activeItem.params.template == 1"><label class="control-label col-xs-3">显示</label><div class="col-xs-9"><input type="radio" name="tra-style" value="left" ng-model="activeItem.params.tradition.align" id="show-type1"><label class="radio-inline" for="show-type1">居左显示</label><input type="radio" name="tra-style" value="center" ng-model="activeItem.params.tradition.align" id="show-type2"><label class="radio-inline" for="show-type2">居中显示</label><input type="radio" name="tra-style" value="right" ng-model="activeItem.params.tradition.align" id="show-type3"><label class="radio-inline" for="show-type3">居右显示</label></div></div><div class="add-textNav card" ng-if="activeItem.params.template == 1 && activeItem.params.tradition.nav.enable == 0"><a href="javascript:" ng-click="changeNavEnable(1)"><i class="fa fa-plus-circle green"></i> 添加一个文本导航</a></div><div class="card" style="padding:20px" ng-if="activeItem.params.template == 1 && activeItem.params.tradition.nav.enable == 1"><div class="btns"><a href="javascript:" ng-click="changeNavEnable(0)"><i class="fa fa-times"></i></a></div><div class="form-group"><label class="col-xs-3 control-label"><span class="red">*</span> 名称</label><div class="col-xs-9"><input type="text" class="form-control" name="" ng-model="activeItem.params.tradition.nav.title" value=""></div></div><div class="form-group"><label class="col-xs-3 control-label"><span class="red">*</span> 链接</label><div class="col-xs-9 form-control-static"><div we7-linker we7-my-url="activeItem.params.tradition.nav.url" we7-my-title="activeItem.params.tradition.nav.title"></div></div></div></div><div class="form-group" ng-if="activeItem.params.template == 2"><label class="col-xs-3 control-label">日期</label><div class="col-xs-9"><input type="text" class="form-control" name="" we7-date-picker we7-date-value="activeItem.params.news.date" value=""></div></div><div class="form-group" ng-if="activeItem.params.template == 2"><label class="col-xs-3 control-label">作者</label><div class="col-xs-9"><input type="text" class="form-control" name="" ng-model="activeItem.params.news.author" value=""></div></div><div class="form-group" ng-if="activeItem.params.template == 2"><label class="col-xs-3 control-label">链接标题</label><div class="col-xs-9"><input type="text" class="form-control" name="" ng-model="activeItem.params.news.title" value=""></div></div><div class="form-group" ng-if="activeItem.params.template == 2"><label class="control-label col-xs-3">链接地址</label><div class="col-xs-9"><div we7-linker we7-my-url="activeItem.params.news.url" we7-my-title="activeItem.params.news.title"></div></div></div></div></div></div></div></div>');

    templateCache.put("widget-white-display.html", '<div ng-controller="WhiteCtrl" style="{{module.positionStyle}}transform:translate3d(0px, 0px, 0px)" we7-context-menu><div style="{{module.transform}}width:100%;height:100%" ng-class="{\'alock\' : module.params.baseStyle.lock}"><div class="app-white" style="width:100%;height:100%;overflow:hidden;{{module.baseStyle}}{{module.borderStyle}}{{module.shadowStyle}}{{module.animationStyle}}"><div class="inner"></div></div><div we7-drag we7-resize we7-rotate></div></div></div>');

    templateCache.put("widget-white-editor.html", '<div ng-controller="WhiteCtrl"><div class="app-white-edit"><div class="arrow-left"></div><div class="inner"><div class="panel panel-default"><div class="panel-body">空白高度（请于左侧拖动缩放调整）</div></div></div></div></div>');

    templateCache.put("directive-multipage-multipage.html", '<div class="page-navigator"><div class="top-title">页面</div><div class="page-list"><ul><li class="page-menu" ng-repeat="page in allPages track by $index" ng-click="navToPage($index)" ng-init="" ng-class="{\'current\' : page.num-1 == $index}"><div class="page-thumb-block" ng-class="{active : page.active}"><div class="page-thumb"><div class="page-thumb-con"></div></div><div class="page-menu-title" ng-bind="{{$index+1}}"></div><div class="icon icon-remove" ng-click="removePage($index);"><span class="fa fa-trash"></span></div><div class="icon icon-copy" ng-click="copyPage($index, $event);" ng-if="isMultiPage"><span class="fa fa-copy"></span></div></div></li></ul></div><div class="add-blank-page" ng-click="insertPage();" ng-if="isMultiPage">+</div><div class="template hidden"><ul class="nav nav-tabs nav-justified"><li class="active"><a href="#">普通版式</a></li><li><a href="#">统计版式</a></li><li><a href="#">特效版式</a></li></ul><div class="template-area"><div class="template-item"><div class="add-icon"><span class="fa fa-plus-circle"></span></div><div class="text">空白页</div></div><div class="template-item"><img src="" alt=""></div><div class="template-item"><img src="" alt=""></div><div class="template-item"><img src="" alt=""></div><div class="template-item"><img src="" alt=""></div><div class="template-item"><img src="" alt=""></div><div class="template-item"><img src="" alt=""></div></div></div></div>')
}
]);