angular.module("wesiteApp", ["we7app"]);

angular.module("wesiteApp").controller("WesiteDisplay", ["$scope", "$http", "serviceCommon", "config", function (e, t, a, n) {
    e.default_site = n.default_site,
        e.multis = n.multis,
        e.links = n.links,
        angular.forEach(e.multis, function (t, a) {
            t.copyLink = e.links.appHome + "t=" + t.id
        }),
        e.preview = function (t) {
            var t = parseInt(t)
                ,
                a = util.dialog("预览模板", '<iframe width="320px" scrolling="yes" height="480px" frameborder="0" src="about:blank"></iframe>', '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>')
                , n = e.links.appHome + "&t=" + t;
            a.find("iframe").attr("src", n),
                a.find(".modal-dialog").css({
                    width: "322px"
                }),
                a.find(".modal-body").css({
                    padding: "0",
                    height: "480px"
                }),
                a.modal("show")
        }
        ,
        e.switchOn = function (a, n) {
            var i = _.indexOf(e.multis, a)
                , n = parseInt(n);
            i > -1 && t.post(e.links.switch, {
                id: n
            }).success(function (t) {
                0 == t.message.errno && (e.multis[i].status = 1 == e.multis[i].status ? "0" : "1",
                    util.message("修改成功！"))
            })
        }
        ,
        e.success = function (e) {
            var e = parseInt(e)
                ,
                t = $('<span class="label label-success" style="position:absolute;z-index:10"><i class="fa fa-check-circle"></i> 复制成功</span>');
            a.copySuccess(e, t)
        }
}
]);

angular.module("wesiteApp").controller("WesitePost", ["$scope", "config", "$http", "serviceCommon", "serviceHomeMenuBase", "serviceQuickMenuBase", "serviceQuickMenuSubmit", function ($scope, config, a, serviceCommon, serviceHomeMenuBase, serviceQuickMenuBase, serviceQuickMenuSubmit) {
    $scope.links = config.links;
    $scope.attachurl = config.attachurl;
    $scope.default_site = config.default_site;
    $scope.temtypes = config.temtypes;
    $scope.temtype = {
        name: "all",
        title: "全部"
    };
    $scope.searchedStyleName = "";
    $scope.multi = config.multi;
    $scope.styles = config.styles;
    $scope.siteEntrance = $scope.links.murl + "t=" + $scope.multi.id;
    $scope.slideLists = [];
    $scope.showSlideSubmit = false;
    $scope.addHomemenuStatus = false;
    $scope.homeMenu = [];
    $scope.sections = serviceHomeMenuBase.initSections();
    $scope.menuInfo = serviceHomeMenuBase.initHomemenuInfo();
    $scope.activeItem = {};
    $scope.modules = {};
    $scope.quickMenuStatus = true;
    $scope.hasIgnoreModules = 0;
    $scope.submit = {};

    $scope.success = function (id) {
        var e = parseInt(id),
            t = $('<span class="label label-success" style="position:absolute;z-index:10;width:90px;height:34px;line-height:28px;"><i class="fa fa-check-circle"></i> 复制成功</span>');
        serviceCommon.copySuccess(e, t);
    };

    /**
     * 选择模板
     * @param style
     */
    $scope.selectStyle = function (style) {
        $scope.multi.style = style
    };

    /**
     * 搜索模板
     */
    $scope.searchStyle = function () {
        a.post($scope.links.searchStyleLink, {
            name: $scope.searchedStyleName
        }).success(function (t) {
            0 == t.message.errno && ($scope.styles = t.message.message)
        })
    };

    $scope.changeMultiStatus = function () {
        $scope.multi.status = 1 == $scope.multi.status ? 0 : 1
    };

    $scope.uploadMultiImage = function () {
        require(["fileUploader"], function (t) {
            t.init(function (t) {
                $scope.multi.site_info.thumb = t.url,
                    $scope.$apply($scope.multi.site_info)
            }, {
                direct: true,
                multiple: false
            })
        })
    };

    $scope.delMultiImage = function () {
        $scope.multi.site_info.thumb = ""
    };

    $scope.loadSlideInfo = function () {
        a.post($scope.links.slideDisplay, {
            multiid: config.multiid
        }).success(function (t) {
            0 == t.message.errno && ($scope.slideLists = t.message.message,
            _.isEmpty($scope.slideLists) || ($scope.showSlideSubmit = true))
        })
    };

    $scope.addSlide = function () {
        $scope.slideLists.push({
            title: "",
            displayorder: 0,
            thumb: "",
            url: ""
        });
        $scope.showSlideSubmit = true;
    };

    $scope.delSlide = function (t) {
        var a = _.indexOf($scope.slideLists, t);
        a > -1 && ($scope.slideLists = _.without($scope.slideLists, $scope.slideLists[a])),
        _.isEmpty($scope.slideLists) && ($scope.showSlideSubmit = false)
    };

    $scope.uploadSlideImage = function (t) {
        var a = _.indexOf($scope.slideLists, t);
        a > -1 ? require(["fileUploader"], function (t) {
            t.init(function (t) {
                $scope.slideLists[a].thumb = t.url,
                    $scope.$apply($scope.slideLists)
            }, {
                direct: true,
                multiple: false
            })
        }) : util.message("参数错误，请刷新页面重试！")
    };

    $scope.delSlideImage = function (t) {
        var a = _.indexOf($scope.slideLists, t);
        a > -1 && ($scope.slideLists[a].thumb = "")
    };

    $scope.saveSlide = function () {
        a.post($scope.links.slidePost, {
            slide: $scope.slideLists,
            multiid: config.multiid
        }).success(function (e) {
            e.message.errno,
                util.message(e.message.message)
        })
    };

    $scope.loadHomemenuInfo = function () {
        a.post($scope.links.homeMenuDisplay, {
            multiid: config.multiid
        }, {
            cache: false
        }).success(function (t) {
            0 == t.message.errno && ($scope.homeMenu = t.message.message,
                $scope.addHomemenuStatus = false)
        })
    };

    // 增加或修改菜单
    $scope.changeHomemenuStatus = function (menuInfo) {
        $scope.addHomemenuStatus = !$scope.addHomemenuStatus;
        if (_.isEmpty(menuInfo)) // 没有提供参数，则创建一个
            $scope.menuInfo = serviceHomeMenuBase.initHomemenuInfo();
        else { // 存在
            $scope.menuInfo = menuInfo;
            var section = parseInt($scope.menuInfo.section);
            section = section <= 10 && section >= 0 ? section : 0;
            $scope.menuInfo.section = $scope.sections[section];
            _.isEmpty($scope.menuInfo.icon) ? $scope.menuInfo.icontype = 1 : $scope.menuInfo.icontype = 2;
        }
    };

    $scope.updateMenu = function (t, n) {
        var i = parseInt(t.id)
            , s = _.indexOf($scope.homeMenu, t);
        if (s > -1)
            switch (n) {
                case "del":
                    a.post($scope.links.homeMenuDel, {
                        id: i
                    }).success(function (a) {
                        0 == a.message.errno ? (util.message("删除成功！"),
                            $scope.homeMenu = _.without($scope.homeMenu, t)) : (-1 == a.message.errno && util.message("本公众号不存在该导航！"),
                        1 == a.message.errno && util.message("删除失败，请稍候重试。"))
                    });
                    break;
                case "switch":
                    a.post($scope.links.homeMenuSwith, {
                        id: i
                    }).success(function (t) {
                        0 == t.message.errno ? $scope.homeMenu[s].status = !$scope.homeMenu[s].status : (-1 == t.message.errno && util.message("本公众号不存在该导航！"),
                        1 == t.message.errno && util.message("更新失败，请稍候重试。"))
                    })
            }
    };

    $scope.uploadHomemenuImage = function (t) {
        require(["fileUploader"], function (t) {
            t.init(function (t) {
                $scope.menuInfo.icon = t.attachment,
                    $scope.$apply($scope.menuInfo)
            }, {
                direct: true,
                multiple: false
            })
        })
    };

    $scope.delHomemenuImage = function (t) {
        $scope.menuInfo.icon = ""
    };

    $scope.selectHomemenuIcon = function () {
        util.iconBrowser(function (t) {
            $scope.menuInfo.css.icon.icon = t,
                $scope.$apply($scope.menuInfo.css)
        })
    };

    $scope.saveMenu = function () {
        a.post($scope.links.homeMenuPost, {
            menu_info: $scope.menuInfo,
            multiid: config.multiid
        }).success(function (t) {
            0 == t.message.errno ? (util.message("导航菜单保存成功！"),
                $scope.loadHomemenuInfo()) : (1 == t.message.errno && util.message("保存失败！"),
            -1 == t.message.errno && util.message("抱歉，请输入导航菜单的名称！"))
        })
    };

    $scope.successMenu = function (id) {
        var e = parseInt(id),
            t = $('<span class="label label-success" style="position:absolute;z-index:10;width:80px;margin-left:10px"><i class="fa fa-check-circle"></i> 复制成功</span>');
        serviceCommon.copySuccess(e, t)
    };

    $scope.quickMenuSwitch = function () {
        $scope.quickMenuStatus = !$scope.quickMenuStatus
    };

    $scope.loadQuickmenuInfo = function () {
        a.post($scope.links.quickMenuDisplay, {
            multiid: config.multiid
        }).success(function (t) {

            if (0 == t.message.errno) {
                $scope.activeItem = t.message.message.params;

                if ($scope.activeItem.position) {
                    $scope.activeItem.position.homepage = !!$scope.activeItem.position.homepage;
                    $scope.activeItem.position.page = !!$scope.activeItem.position.page;
                    $scope.activeItem.position.article = !!$scope.activeItem.position.article;
                } else {
                    $scope.activeItem.position = {
                        homepage: false,
                        page: false,
                        article: false
                    }
                }

                serviceQuickMenuBase.initActiveItem($scope.activeItem);
                $scope.modules = t.message.message.modules;
                $scope.quickMenuStatus = t.message.message.status;
                $scope.hasIgnoreModules = _.size($scope.activeItem.ignoreModules);
            } else {
                util.message("请求错误：微站不存在，请按“Ctrl+F5”刷新重试！");
            }
        })
    };

    // 保存导航快捷菜单
    $scope.saveQucikMenu = function () {
        $scope.submit = serviceQuickMenuSubmit.submit();
        a.post($scope.links.quickMenuPost, {
            multiid: config.multiid,
            postdata: $scope.submit,
            status: $scope.quickMenuStatus ? 1 : 0
        }).success(function (e) {
            0 == e.message.errno ? util.message("保存成功。您可点击“预览刷新”查看效果！") : util.message(e.message.message)
        })
    };

    $scope.showSearchModules = function () {
        $scope.moduleDialog = $("#shop-modules-modal").modal(),
            $("#shop-modules-modal .modal-body .btn-primary").html("取消"),
            $("#shop-modules-modal").find(".modal-footer .btn-primary").unbind("click").click(function () {
                $scope.activeItem.ignoreModules = {},
                    $("#shop-modules-modal .modal-body .btn-primary").each(function () {
                        $scope.hasIgnoreModules = true,
                            $scope.activeItem.ignoreModules[$(this).attr("js-name")] = {
                                name: $(this).attr("js-name"),
                                title: $(this).attr("js-title")
                            }
                    }),
                    $scope.$apply("activeItem"),
                    $scope.$apply("hasIgnoreModules"),
                    serviceQuickMenuBase.setQuickMenuData("ignoreModules", $scope.activeItem.ignoreModules)
            })
    };

    $scope.selectNavStyle = function () {
        var t = $('#shop-nav-modal .alert input[type="radio"]:checked').val();
        $scope.activeItem.navStyle = serviceQuickMenuBase.selectNavStyle(t)
    };

    $scope.addMenu = function () {
        $scope.activeItem.menus = serviceQuickMenuBase.addMenu()
    };

    $scope.addSubMenu = function (t) {
        var a = _.findIndex($scope.activeItem.menus, t);
        $scope.activeItem.menus[a].submenus = serviceQuickMenuBase.addSubMenu(t)
    };

    $scope.removeMenu = function (t) {
        $scope.activeItem.menus = serviceQuickMenuBase.removeMenu(t)
    };

    $scope.removeSubMenu = function (t, a) {
        serviceQuickMenuBase.removeSubMenu(t, a),
            $scope.activeItem.menus[t].submenus = _.without($scope.activeItem.menus[t].submenus, a)
    }
}
]);

angular.module("wesiteApp").controller("WesiteTplDidplay", ["$scope", "config", function ($scope, config) {

    $scope.stylesResult = config.stylesResult;
    $scope.temtypes = config.temtypes;
    $scope.type = config.type;
    $scope.setting = config.setting;
    $scope.links = config.links;

    $scope.preview = function (styleid) {
        var t = parseInt(styleid),
            a = '\t\t\t<a href="' + $scope.links.default + "&styleid=" + t + '" class="btn btn-primary">设为默认模板</a>\t\t\t<a href="' + $scope.links.designer + "&styleid=" + t + '" class="btn btn-primary">设计风格</a>\t\t\t<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>',
            dialog = util.dialog("预览模板", '<iframe width="320" scrolling="yes" height="480" frameborder="0" src="about:blank"></iframe>', a);

        dialog.find("iframe").on("load", function () {
            $("a", this.contentWindow.document.body).each(function () {
                var e = $(this).attr("href");
                if (e && "#" != e[0]) {
                    var a = e.split(/#/g)
                        , n = a[0];
                    "&" != n.slice(-1) && (n += "&");
                    -1 != n.indexOf("?") && (n += "s=" + t);
                    a[1] && (n += "#" + a[1]);
                    "javascript" != n.substr(0, 10) && -1 != n.indexOf("?") || (n = n.substr(0, n.lastIndexOf("&")));
                    $(this).attr("href", n);
                }
            })
        });
        var i = $scope.links.home + "&s=" + t;
        dialog.find("iframe").attr("src", i);
        dialog.find(".modal-dialog").css({
            width: "322px"
        });
        dialog.find(".modal-body").css({
            padding: "0",
            height: "480px"
        });
        dialog.modal("show");
    };

    $scope.selectDefault = function (styleid) {
        var a = parseInt(styleid);
        location.href = $scope.links.default + "&styleid=" + a
    };
}
]);

angular.module("wesiteApp").controller("WesiteTplPost", ["$scope", "config", function ($scope, config) {
    $scope.style = config.style;
    $scope.styles = config.styles ? config.styles : {};
    $scope.template = config.template;
    $scope.systemtags = config.systemtags;
    $scope.customStyles = [];

    angular.forEach($scope.styles, function (t, a) {
        -1 == _.indexOf($scope.systemtags, t.variable) && $scope.customStyles.push(t)
    });

    $scope.addCustomAttribute = function () {
        $("#customForm").append($("#item-form-html").html())
    };

    $scope.delCustomArrtibute = function (e) {
        $(e.target).parent().parent().remove()
    };

    $scope.uploadImage = function () {
        require(["fileUploader"], function (t) {
            t.init(function (t) {
                $scope.styles.indexbgimg = {
                    content: t.url
                },
                    $scope.$apply($scope.styles.indexbgimg.content)
            }, {
                direct: true,
                multiple: false
            })
        })
    };

    $scope.delImage = function () {
        $scope.styles.indexbgimg = ""
    };

    $scope.checkSubmit = function (e) {
        for (var t = $(':text[name="custom[name][]"]'), a = $(':text[name="custom[desc][]"]'), n = $(':text[name="custom[value][]"]'), i = 0; i < t.length; i++)
            if (_.isEmpty(t[i].value))
                return util.message("自定义属性变量名不可为空！"),
                    false;
        for (var s = 0; s < a.length; s++)
            if (_.isEmpty(a[s].value))
                return util.message("自定义属性变量描述不可为空！"),
                    false;
        for (var o = 0; o < n.length; o++)
            if (_.isEmpty(n[o].value))
                return util.message("自定义属性变量值不可为空！"),
                    false;
        $("#submit-post").click()
    };
}
]);

angular.module("wesiteApp").controller("wesiteArticleDisplay", ["$scope", "config", "serviceCommon", "$http", function ($scope, config, a, $http) {
    $scope.category = config.category;
    $scope.articleList = config.articleList;
    $scope.commentListLink = config.commentListLink;
    $scope.articleComment = config.articleComment;
    $scope.setting = config.setting;
    $scope.commentLink = config.commentLink;

    angular.forEach($scope.articleList, function (a, n) {
        if (0 != a.pcate) {
            var i = parseInt(a.pcate);
            if (0 != a.ccate) {
                s = parseInt(a.ccate);
                angular.isDefined($scope.category[i]) && angular.isDefined($scope.category[s]) && (a.title = "【" + $scope.category[i].name + "】-【" + $scope.category[s].name + "】" + a.title)
            } else
                angular.isDefined($scope.category[i]) && (a.title = "【" + $scope.category[i].name + "】" + a.title)
        } else if (0 != a.ccate) {
            var s = parseInt(a.ccate);
            angular.isDefined($scope.category[s]) && (a.title = "【" + $scope.category[s].name + "】" + a.title)
        }
        a.link = config.copyCommonLink + a.id;
        var o = $scope.articleComment;
        a.count = o && o[a.id] ? $scope.articleComment[a.id].count : 0,
            $scope.articleList[n] = a
    });

    $scope.success = function (e) {
        var e = parseInt(e),
            t = $('<span class="label label-success" style="position:absolute;z-index:10"><i class="fa fa-check-circle"></i> 复制成功</span>');
        a.copySuccess(e, t);
    };

    $scope.editArticle = function (articleId) {
        var e = parseInt(articleId);
        location.href = "./index.php?c=site&a=article&do=post&id=" + e;
    };

    $scope.delArticle = function (articleId) {
        if (confirm("此操作不可恢复，确认吗？")) {
            var e = parseInt(articleId);
            location.href = "./index.php?c=site&a=article&do=del&id=" + e;
        }
    };

    // 开启和关闭评论
    $scope.comment = function () {
        $http.post($scope.commentLink, {}).success(function (t) {

            if (0 == t.message.errno) {
                $scope.setting.comment_status = t.message.message;
                util.message("设置成功");
            } else {
                util.message(t.message.message, t.direct);
            }
        })
    }
}
]);

angular.module("wesiteApp").controller("WesiteArticlePost", ["$scope", "config", function ($scope, config) {
    $scope.item = config.item;
    $scope.keywords = config.keywords;
    $scope.id = config.id;
    $scope.template = config.template;

    $scope.uploadImage = function () {
        require(["fileUploader"], function (fileUploader) {
            fileUploader.init(function (t) {
                $scope.item.thumb = t.url;
                $scope.$apply($scope.item.thumb);
            }, {
                direct: true,
                multiple: false
            })
        })
    };

    $scope.delImage = function () {
        $scope.item.thumb = ""
    }
}
]);

angular.module("wesiteApp").controller("WesiteCategoryPost", ["$scope", "config", function ($scope, config) {
    $scope.id = config.id;
    $scope.category = config.category;
    $scope.parent = config.parent;
    $scope.parentid = config.parentid;
    $scope.multis = config.multis;
    $scope.site_template = config.site_template;
    $scope.styles = config.styles;

    angular.isUndefined($scope.category.enabled) ? $scope.enabled = true : $scope.id && 1 == $scope.category.enabled ? $scope.enabled = true : $scope.enabled = false;

    angular.isUndefined($scope.category.icontype) || 0 == $scope.category.icontype || 1 == $scope.category.icontype ? $scope.icontype = true : $scope.icontype = false;

    $scope.selectIcon = function () {
        util.iconBrowser(function (t) {
            $scope.category.css.icon.icon = t;
            $scope.$apply($scope.category.css);
        })
    };

    $scope.showWesite = function () {
        $(".js-site-selector").show()
    };

    $scope.hideWesite = function () {
        $(".js-site-selector").hide()
    };

    $scope.changeStyle = function (styleId) {
        var a = parseInt(styleId)
            , n = $(".title-" + a).text()
            , i = $(".preview-" + a).attr("src");

        $(".item-style").removeClass("active");
        $scope.category.styleid = a;
        $("#current-title").text(n);
        $("#current-preview").attr("src", i);
        $(".title-" + a).parent().parent().addClass("active");
        $("#ListStyle").modal("hide");
        $scope.$apply($scope.category.styleid);
    };

    $scope.uploadImage = function () {
        require(["fileUploader"], function (fileUploader) {
            fileUploader.init(function (t) {
                $scope.category.icon = t.url;
                $scope.$apply($scope.category.icon);
            }, {
                direct: true,
                multiple: false
            })
        })
    };

    $scope.delImage = function () {
        $scope.category.icon = ""
    }
}
]);

angular.module("wesiteApp").controller("articleComment", ["$scope", "config", "$http", function ($scope, config, a) {
    $scope.articleId = config.articleId;
    $scope.order_sort = config.order_sort;
    $scope.is_comment = config.is_comment;
    $scope.articleList = config.articleList;
    $scope.links = config.links;
    $scope.content = "";

    $scope.replyarticle = function (comment) {
        comment.replying = true
    };

    $scope.cancel = function (e) {
        e.replying = false
    };

    $scope.send = function (t) {
        var n = t.id;
        a.post($scope.links.reply, {
            articleid: $scope.articleId,
            parentid: n,
            content: t.replycontent
        }).success(function (e) {
            if (0 != e.message.errno)
                return util.message(e.message.message),
                    false;
            t.son_comment.push(e.message.message),
                t.replying = false,
                t.replycontent = ""
        })
    };

    $scope.changeSort = function () {
        a.post($scope.links.display, {
            order: $scope.order_sort,
            id: $scope.articleId
        }).success(function (t) {
            $scope.articleList = t.message.message
        })
    };

    $scope.changeComment = function () {
        a.post($scope.links.display, {
            iscommend: $scope.is_comment,
            id: $scope.articleId
        }).success(function (t) {
            $scope.articleList = t.message.message
        })
    }
}
]);

angular.module("wesiteApp").service("serviceCommon", ["$rootScope", function ($rootScope) {
    var t = {};

    t.copySuccess = function (id, html) {
        var e = parseInt(id)
            , t = html
            , a = $("#copy-" + e).next().html();
        (!a || a.indexOf('<span class="label label-success" style="position:absolute;z-index:10"><i class="fa fa-check-circle"></i> 复制成功</span>') < 0) && $("#copy-" + e).after(t);
        setTimeout(function () {
            t.remove()
        }, 2e3);
    };

    return t;
}
]);

// 首页导航菜单
angular.module("wesiteApp").service("serviceHomeMenuBase", ["$rootScope", function ($rootScope) {
    var menuInfo = {};

    menuInfo.initHomemenuInfo = function () {
        return {
            css: {
                icon: {
                    width: "",
                    color: "",
                    icon: ""
                }
            },
            name: "",
            description: "",
            url: "",
            status: 1,
            displayorder: 0,
            icon: "",
            icontype: 1,
            section: 0
        }
    };

    menuInfo.initSections = function () {
        return [{
            num: 0,
            val: "不设置位置"
        }, {
            num: 1,
            val: "位置1"
        }, {
            num: 2,
            val: "位置2"
        }, {
            num: 3,
            val: "位置3"
        }, {
            num: 4,
            val: "位置4"
        }, {
            num: 5,
            val: "位置5"
        }, {
            num: 6,
            val: "位置6"
        }, {
            num: 7,
            val: "位置7"
        }, {
            num: 8,
            val: "位置8"
        }, {
            num: 9,
            val: "位置9"
        }, {
            num: 10,
            val: "位置10"
        }]
    };

    return menuInfo;
}
]);

// 导航快捷菜单
angular.module("wesiteApp").service("serviceQuickMenuBase", ["$rootScope", function ($rootScope) {
    var t = {}
        , a = {};

    t.initActiveItem = function (e) {
        return a = angular.isObject(e) ? e : {
            navStyle: 1,
            bgColor: "#2B2D30",
            menus: [],
            extend: [],
            position: {
                homepage: true,
                usercenter: true,
                page: true,
                article: true
            },
            ignoreModules: {}
        }
    };

    t.selectNavStyle = function (e) {
        a.navStyle = e;
        return a.navStyle;
    };

    t.addMenu = function () {
        void 0 === a.menus && (a.menus = []);
        a.menus.push({
            title: "标题",
            url: "",
            submenus: [],
            icon: {
                name: "fa-home",
                color: "#00ffff"
            },
            image: "",
            hoverimage: "",
            hovericon: ""
        });
        return a.menus
    };

    t.removeMenu = function (e) {
        var t = $.inArray(e, a.menus)
            , n = angular.copy(a.menus);
        a.menus = [];
        for (i in n)
            i != t && a.menus.push(n[i]);
        return a.menus;
    };

    t.addSubMenu = function (e) {
        var t = _.findIndex(a.menus, e);
        return void 0 === a.menus[t].submenus ? a.menus[t].submenus = [{
            title: "标题",
            url: ""
        }] : a.menus[t].submenus.push({
            title: "标题",
            url: ""
        }),
            a.menus[t].submenus
    };

    t.removeSubMenu = function (e, t) {
        return a.menus[e].submenus = _.without(a.menus[e].submenus, t),
            a.menus[e].submenus
    };

    t.getQuickMenuData = function (e) {
        return angular.isString(e) ? a[e] : a
    };

    t.setQuickMenuData = function (e, t) {
        angular.isObject(e) ? angular.forEach(e, function (e, t) {
            a[t] = e
        }) : a[e] = t
    };

    return t;
}
]);

angular.module("wesiteApp").service("serviceQuickMenuSubmit", ["serviceQuickMenuBase", function (serviceQuickMenuBase) {
    var serviceQuickMenuSubmit = {};

    serviceQuickMenuSubmit.stripHaskey = function (e) {
        for (var a in e)
            "$$hashKey" == a ? delete e[a] : "object" == typeof e[a] && serviceQuickMenuSubmit.stripHaskey(e[a]);
        return e
    };

    serviceQuickMenuSubmit.submit = function () {
        var a = {
            params: {},
            html: ""
        };
        a.params = serviceQuickMenuBase.getQuickMenuData();
        serviceQuickMenuSubmit.stripHaskey(a.params);
        var n = $(".nav-menu").html();
        n = n.replace(/<\!\-\-([^-]*?)\-\->/g, "");
        n = n.replace(/ng\-[a-zA-Z-]+=\"[^\"]*\"/g, "");
        n = n.replace(/ng\-[a-zA-Z]+/g, "");
        n = n.replace(/[\t\n\n\r]/g, "");
        a.html = n;
        return a;
    };

    return serviceQuickMenuSubmit;
}
]);