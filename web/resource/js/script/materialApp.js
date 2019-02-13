angular.module("materialApp", ["we7app"]);

angular.module("materialApp").directive("ngMyEditor", function () {
    return {
        scope: {
            value: "=ngMyValue",
            imguploadurl: "@ngMyUpurl"
        },
        template: '<textarea id="editor" style="height:600px;width:100%;"></textarea>',
        link: function (e, t, a) {
            t.data("editor") || util.editor("editor", {
                allow_upload_video: 0,
                callback: function (a, n) {
                    t.data("editor", n),
                        n.addListener("contentChange", function () {
                            e.value = n.getContent(),
                            e.$root.$$phase || e.$apply("value")
                        }),
                        n.addListener("ready", function () {
                            n && n.getContent() != e.value && n.setContent(e.value),
                                e.$watch("value", function (e) {
                                    n && n.getContent() != e && n.setContent(e || "")
                                })
                        }),
                        n.setOpt("imageActionName", "uploadimage"),
                        n.setOpt("imageFieldName", "file"),
                        n.setOpt("imageUrlPrefix", ""),
                        UE.Editor.prototype._bkGetActionUrl = UE.Editor.prototype.getActionUrl,
                        UE.Editor.prototype.getActionUrl = function (t) {
                            return "uploadimage" == t ? e.imguploadurl : this._bkGetActionUrl.call(this, t)
                        }
                }
            }, true)
        }
    }
}).controller("materialDisplay", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.materialList = a.materialList;
    $scope.groups = a.group;
    $scope.config = a;
    $scope.group = "";
    $scope.materialType = "";
    $scope.materialId = "";
    $scope.syncNews = a.syncNews;
    $scope.hidenbutton = 0;

    $scope.sync = function (type, i, s, o, r) {
        $(window).bind("beforeunload", function () {
            return "您输入的内容尚未保存，确定离开此页面吗？"
        }),
            void 0 == i ? util.message("正在同步素材，请勿关闭浏览器...") : util.message("已同步" + parseInt((i - 1) / s * 100) + "%，请勿关闭浏览器..."),
            $http.post(a.sync_url, {
                type: type,
                pageindex: i,
                total: s,
                wechat_existid: o,
                original_newsid: r
            }).success(function (t) {
                0 == t.message.errno ? ($(window).unbind("beforeunload"),
                    util.message("同步素材成功", "./index.php?c=platform&a=material&type=" + type, "success")) : (sync_info = t.message.message,
                    $scope.sync(sync_info.type, sync_info.pageindex, sync_info.total, sync_info.wechat_existid, sync_info.original_newsid))
            })
    };

    1 == $scope.syncNews && $scope.sync("news"),
        $scope.upload = function (e, t, a) {
            require(["fileUploader"], function (n) {
                n.init(function () {
                    util.message("上传成功", location.href, "success")
                }, {
                    type: e,
                    direct: true,
                    multiple: t,
                    isWechat: a
                })
            })
        };

    $scope.del_material = function (e, n, i) {
        if (!confirm("删除不可恢复确认删除吗？"))
            return false;
        $http.post(a.del_url, {
            material_id: n,
            type: e,
            server: i
        }).success(function (t) {
            0 != t.message.errno ? util.message("删除失败,具体原因:" + t.message.message, "", "info") : util.message("删除成功", "./index.php?c=platform&a=material&type=" + e + ("local" == i ? "&islocal=true" : ""), "success")
        })
    };

    $scope.checkGroup = function (t, a) {
        $("#check-group").modal("show"),
            $scope.materialType = t,
            $scope.materialId = a,
            $scope.group = ""
    };

    $scope.transToWechat = function (n, i) {
        util.message("素材转换将在后台运行，成功后后自动刷新页面，请勿关闭浏览器..."),
            $http.post(a.trans_url, {
                material_id: i
            }).success(function (t) {
                0 != t.message.errno ? util.message("转换失败,具体原因:" + t.message.message, "", "info") : $scope.sync(n)
            })
    };

    $scope.newsToWechat = function (a) {
        util.message("素材转换将在后台运行，成功后后自动刷新页面，请勿关闭浏览器..."),
            $http.post($scope.config.postwechat_url, {
                material_id: a
            }).success(function (e) {
                0 == e.message.errno ? util.message("已保存", "./index.php?c=platform&a=material", "success") : alert("创建图文失败" + e.message.message)
            })
    };

    $scope.sendMaterial = function () {
        $http.post($scope.config.send_url, {
            type: $scope.materialType,
            id: $scope.materialId,
            group: $scope.group
        }).success(function (t) {
            1 == t.message.errno ? util.message(t.message.message, "", "info") : util.message("群发成功", "./index.php?c=platform&a=material&type=" + $scope.materialType, "success")
        })
    };

    $scope.createNew = function (type) {
        var a = $scope.config.create_new_url + "&new_type=" + type;
        window.location = a
    };

    $scope.choiceSendType = function (e, t, a) {
        $(".web-mobile-choice-type a[class = 'we7-margin-bottom']").attr("data-url", e),
            $(".web-mobile-choice-type a[class = 'we7-mobile-material-preview']").attr("data-type", t),
            $(".web-mobile-choice-type a[class = 'we7-mobile-material-preview']").attr("data-media-id", a)
    };

    $scope.wabPreview = function () {
        $("#modalWechatView").modal("hide"),
            window.open($(".web-mobile-choice-type a[class = 'we7-margin-bottom']").attr("data-url"), "_blank")
    };

    $scope.mobilePreview = function () {
        var e = $(".web-mobile-choice-type a[class = 'we7-mobile-material-preview']").attr("data-media-id")
            , a = $(".web-mobile-choice-type a[class = 'we7-mobile-material-preview']").attr("data-type");
        $(".material-wechat-view").addClass("hidden"),
            $("#weixin-dialog").removeClass("hidden"),
            $("#modalWechatView .btn-send").unbind().click(function () {
                var n = $.trim($("#modalWechatView #wxname").val());
                return n ? ($("#weixin-dialog").addClass("hidden"),
                    $(".material-wechat-view").removeClass("hidden"),
                    $("#modalWechatView #wxname").val(""),
                    $("#modalWechatView").modal("hide"),
                    $http.post("./index.php?c=platform&a=mass&do=preview", {
                        media_id: e,
                        wxname: n,
                        type: a
                    }).success(function (e) {
                        0 != e.message.errno ? util.message(e.message.message) : util.message("发送成功", "", "success")
                    }),
                    false) : (util.message("微信号不能为空", "", "error"),
                    false)
            })
    };

    $scope.previewBack = function () {
        $("#weixin-dialog").addClass("hidden"),
            $(".material-wechat-view").removeClass("hidden")
    }
}
]).controller("materialAdd", ["$scope", "material", "$http", "$timeout", function ($scope, material, a, $timeout) {

    $scope.config = material;
    $scope.operate = material.operate;
    $scope.model = material.model;
    $scope.new_type = material.new_type;
    $scope.hidenbutton = "reply" == material.new_type ? 0 : 1;

    $scope.changeClass = function () {
        angular.forEach($scope.materialList, function (t, a) {
            $scope.materialList[a].class = "0" == a ? $scope.activeIndex == a ? "cover-appmsg-item active" : "cover-appmsg-item" : $scope.activeIndex == a ? "appmsg-item active" : "appmsg-item"
        })
    };

    $scope.tomedia = function (e) {
        var a = "";
        return $.ajax({
            url: material.url,
            async: false,
            data: {
                url: e
            },
            success: function (e) {
                var e = $.parseJSON(e);
                a = e.message.message
            }
        }),
            a
    };

    $scope.changeOrder = function (direction, index) {
        material = {};
        if ("down" == direction) {
            material = $scope.materialList[index];
            $scope.materialList[index] = $scope.materialList[index + 1];
            $scope.materialList[index + 1] = material;
        } else {
            material = $scope.materialList[index];
            $scope.materialList[index] = $scope.materialList[index - 1];
            $scope.materialList[index - 1] = material;
        }
    };

    $scope.deleteMaterial = function (index) {
        if (confirm("确定要删除吗？")) {
            $scope.materialList.splice(index, 1);
            $scope.activeIndex = $scope.activeIndex - 1;
        }
    };

    $scope.changeIndex = function (index) {
        $scope.activeIndex = index;
        $scope.changeClass();
    };

    $scope.addMaterial = function () {
        if (void 0 == $scope.materialList) {
            $scope.materialList = [];
            $scope.activeIndex = 0;
        } else {
            $scope.activeIndex = $scope.materialList.length;
        }

        $scope.materialList.push({
            id: "",
            title: "",
            author: "",
            thumb: "",
            media_id: "",
            displayorder: "0",
            digest: "",
            content: "",
            content_source_url: "",
            show_cover_pic: 0,
            class: ""
        });
        $scope.changeClass();
    };

    if ("add" == $scope.operate && "reply" != $scope.config.type) {
        $scope.addMaterial();
    } else {
        $scope.activeIndex = 0;
        $scope.materialList = [];

        angular.forEach(material.materialList, function (t, a) {
            t.thumb_url = $scope.tomedia(t.thumb_url);
            $scope.materialList[a] = {
                id: t.id,
                title: t.title,
                author: t.author,
                thumb: t.thumb_url,
                media_id: t.thumb_media_id,
                displayorder: a,
                digest: t.digest,
                content: t.content,
                content_source_url: t.content_source_url,
                url: t.url,
                show_cover_pic: isNaN(Number(t.show_cover_pic)) ? 0 : Number(t.show_cover_pic),
                class: ""
            }
        });

        $scope.changeClass();
    }

    // 获取图文的缩略图
    $scope.pickPicture = function (type) {
        isWechat = "wechat" == type;
        require(["fileUploader"], function (t) {
            t.init(function (t) {
                $scope.materialList[$scope.activeIndex].thumb = t.url,
                    $scope.materialList[$scope.activeIndex].media_id = t.media_id,
                    $scope.$apply()
            }, {
                type: "image",
                direct: true,
                multiple: false,
                isWechat: isWechat,
                image_limit: $scope.config.image_limit,
                voice_limit: $scope.config.voice_limit,
                video_limit: $scope.config.video_limit
            });
        });
    };

    $scope.updateSelection = function () {
        $scope.materialList[$scope.activeIndex].show_cover_pic = isNaN(Number(!$scope.materialList[$scope.activeIndex].show_cover_pic)) ? 0 : Number(!$scope.materialList[$scope.activeIndex].show_cover_pic)
    };

    $scope.saveNews = function (type) {
        news = [];
        var n = ""
            , i = "";

        angular.forEach($scope.materialList, function (a, s) {

            if ("" == a.title) {
                n = s;
                i = "请输入标题后,再点击保存按钮";
            } else {
                if ("" != a.content || "wechat" != type && "reply" != $scope.new_type) {
                    if ("" == a.content && "wechat" == type) {
                        n = s;
                        i = "图文内容中图片上传失败，请重新上传";
                    } else {
                        a.displayorder = s + 1;
                        news[s] = a;
                    }
                } else {
                    n = s;
                    i = "请输入一段正文,再点击保存按钮";
                }
            }
        });

        if ("" !== n) {
            $scope.activeIndex = n;
            $scope.changeClass();
            alert(i);
            return false;
        }
        util.message("正在生成图文消息，请勿关闭浏览器...");
        var s = "add" == $scope.config.operate ? "" : $scope.config.materialList[0].attach_id;
        a.post($scope.config.newsUpload_url, {
            news: news,
            operate: $scope.operate,
            attach_id: s,
            type: $scope.config.type,
            target: type,
            news_rid: $scope.config.news_rid
        }).success(function (t) {
            0 == t.message.errno ? util.message("已保存", $scope.config.msg_url, "success") : alert("创建图文失败" + t.message.message)
        })
    };

    $scope.exportFromCms = function () {
        $scope.searchCms()
    };

    $scope.searchCms = function (t) {
        var n = {};
        n.header = '<ul role="tablist" class="nav nav-pills" style="font-size:14px; margin-top:-20px;">\t<li role="presentation" class="active" id="li_goodslist"><a data-toggle="tab" role="tab" aria-controls="articlelist" href="#articlelist">文章列表</a></li></ul>';
        n.content = '<div class="tab-content"><div id="articlelist" class="tab-pane active" role="tabpanel">\t<table class="table table-hover">\t\t<thead class="navbar-inner">\t\t\t<tr>\t\t\t\t<th style="width:40%;">标题</th>\t\t\t\t<th style="width:30%">创建时间</th>\t\t\t\t<th style="width:30%; text-align:right">\t\t\t\t\t<div class="input-group input-group-sm hide">\t\t\t\t\t\t<input type="text" class="form-control">\t\t\t\t\t\t<span class="input-group-btn">\t\t\t\t\t\t\t<button class="btn btn-default" type="button"><i class="fa fa-search"></i></button>\t\t\t\t\t\t</span>\t\t\t\t\t</div>\t\t\t\t</th>\t\t\t</tr>\t\t</thead>\t\t<tbody></tbody>\t</table>\t<div id="pager" style="text-align:center;"></div></div></div>';
        n.footer = "";
        n.articleitem = '<%_.each(list, function(item) {%> \n<tr>\n\t<td><a href="#" data-cover-attachment-url="<%=item.attachment%>" title="<%=item.title%>"><%=item.title%></a></td>\n\t<td><%=item.createtime%></td>\n\t<td class="text-right">\n\t\t<button class="btn btn-default js-btn-select" js-id="<%=item.id%>">选取</button>\n\t</td>\n</tr>\n<%});%>\n';

        if ($("#link-search-cms")[0]) {
            $scope.modalobj = $("#link-search-cms").data("modal");
        } else {
            $scope.modalobj = util.dialog(n.header, n.content, n.footer, {
                containerName: "link-search-cms"
            });
            $scope.modalobj.find(".modal-body").css({
                height: "680px",
                "overflow-y": "auto"
            });
            $scope.modalobj.modal("show");
            $scope.modalobj.on("hidden.bs.modal", function () {
                $scope.modalobj.remove()
            });
            $("#link-search-cms").data("modal", $scope.modalobj)
        }

        t = t || 1;
        a.get("./index.php?c=utility&a=link&do=articlelist&page=" + t).success(function (t, a, i, s) {

            if (t.message.message.list) {
                $scope.modalobj.find("#articlelist").data("articles", t.message.message.list);
                $scope.modalobj.find("#articlelist tbody").html(_.template(n.articleitem)(t.message.message));
                $scope.modalobj.find("#pager").html(t.message.message.pager);
                $scope.modalobj.find("#pager .pagination li[class!='active'] a").click(function () {
                    $scope.searchCms($(this).attr("page"));
                    return false;
                });
                $scope.modalobj.find(".js-btn-select").click(function () {
                    $scope.addCms($(this).attr("js-id"));
                    $scope.$apply();
                    $scope.modalobj.modal("hide");
                });
            }
        });
    };

    $scope.addCms = function (t) {
        var a = $scope.modalobj.find("#articlelist").data("articles")[t];

        $scope.materialList[$scope.activeIndex].title = a.title;
        $scope.materialList[$scope.activeIndex].thumb = a.thumb_url;
        $scope.materialList[$scope.activeIndex].author = a.author;
        $scope.materialList[$scope.activeIndex].incontent = 1 == a.incontent;
        $scope.materialList[$scope.activeIndex].description = a.description;
        $scope.materialList[$scope.activeIndex].content = a.content;
        $scope.materialList[$scope.activeIndex].content_source_url = a.linkurl;
        $scope.materialList[$scope.activeIndex].detail = "" != a.content;
    }
}
]);