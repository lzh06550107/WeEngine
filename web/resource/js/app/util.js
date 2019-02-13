!function (window) {
    /**
     * 获取请求后面的查询参数字符串
     * @param url
     * @returns {*}
     */
    function getQueryParam(url) {
        queryString = "";
        if (-1 != url.indexOf("?"))
            var queryString = url.split("?")[1];
        return queryString
    }

    var util = {};
    util.iconBrowser = function (e) {
        require(["fileUploader"], function (t) {
            t.init(function (t) {
                $.isFunction(e) && e("fa " + t.name)
            }, {
                type: "icon"
            })
        })
    };

    util.emojiBrowser = function (e) {
        require(["emoji"], function () {
            var t = util.dialog("请选择表情", window.util.templates["emoji-content-emoji.tpl"], '<button type="button" class="btn btn-default" data-dismiss="modal">取消</button>', {
                containerName: "icon-container"
            });
            t.modal({
                keyboard: false
            }),
                t.find(".modal-dialog").css({
                    width: "70%"
                }),
                t.find(".modal-body").css({
                    height: "70%",
                    "overflow-y": "scroll"
                }),
                t.modal("show"),
                window.selectEmojiComplete = function (i) {
                    $.isFunction(e) && (e(i),
                        t.modal("hide"))
                }
        })
    };

    util.qqEmojiBrowser = function (e, t, i) {
        require(["emoji"], function () {
            var o = window.util.templates["emoji-content-qq.tpl"];
            $(e).popover({
                html: true,
                content: o,
                placement: "bottom"
            }),
                $(e).one("shown.bs.popover", function () {
                    $(e).next().mouseleave(function () {
                        $(e).popover("hide")
                    }),
                        $(e).next().delegate(".eItem", "mouseover", function () {
                            var t = '<img src="' + $(this).attr("data-gifurl") + '" alt="mo-' + $(this).attr("data-title") + '" />';
                            $(this).attr("data-code");
                            $(e).next().find(".emotionsGif").html(t)
                        }),
                        $(e).next().delegate(".eItem", "click", function () {
                            var o = "/" + $(this).attr("data-code");
                            $(e).popover("hide"),
                            $.isFunction(i) && i(o, e, t)
                        })
                })
        })
    };

    util.emotion = function (e, t, i) {
        util.qqEmojiBrowser(e, t, i)
    };

    util.linkBrowser = function (callback) {
        var t = util.dialog("请选择链接", ["./index.php?c=utility&a=link&callback=selectLinkComplete"], '<button type="button" class="btn btn-default" data-dismiss="modal">取消</button>', {
            containerName: "link-container"
        });
        t.modal({
            keyboard: false
        }),
            t.find(".modal-body").css({
                height: "300px",
                "overflow-y": "auto"
            }),
            t.modal("show"),
            window.selectLinkComplete = function (href) {
                $.isFunction(callback) && (callback(href),
                    t.modal("hide"))
            }
    };

    util.pageBrowser = function (e, t) {
        var i = util.dialog("", ["./index.php?c=utility&a=link&do=page&callback=pageLinkComplete&page=" + t], "", {
            containerName: "link-container"
        });
        i.modal({
            keyboard: false
        }),
            i.find(".modal-body").css({
                height: "700px",
                "overflow-y": "auto"
            }),
            i.modal("show"),
            window.pageLinkComplete = function (t, o) {
                $.isFunction(e) && (e(t, o),
                "" != o && void 0 != o || i.modal("hide"))
            }
    };

    util.newsBrowser = function (e, t) {
        var i = util.dialog("", ["./index.php?c=utility&a=link&do=news&callback=newsLinkComplete&page=" + t], "", {
            containerName: "link-container"
        });
        i.modal({
            keyboard: false
        }),
            i.find(".modal-body").css({
                height: "700px",
                "overflow-y": "auto"
            }),
            i.modal("show"),
            window.newsLinkComplete = function (t, o) {
                $.isFunction(e) && (e(t, o),
                "" != o && void 0 != o || i.modal("hide"))
            }
    };

    util.articleBrowser = function (e, t) {
        var i = util.dialog("", ["./index.php?c=utility&a=link&do=article&callback=articleLinkComplete&page=" + t], "", {
            containerName: "link-container"
        });
        i.modal({
            keyboard: false
        }),
            i.find(".modal-body").css({
                height: "700px",
                "overflow-y": "auto"
            }),
            i.modal("show"),
            window.articleLinkComplete = function (t, o) {
                $.isFunction(e) && (e(t, o),
                "" != o && void 0 != o || i.modal("hide"))
            }
    };

    util.phoneBrowser = function (e, t) {
        var i = util.dialog("一键拨号", ["./index.php?c=utility&a=link&do=phone&callback=phoneLinkComplete&page=" + t], "", {
            containerName: "link-container"
        });
        i.modal({
            keyboard: false
        }),
            i.find(".modal-body").css({
                height: "700px",
                "overflow-y": "auto"
            }),
            i.modal("show"),
            window.phoneLinkComplete = function (t, o) {
                $.isFunction(e) && (e(t, o),
                "" != o && void 0 != o || i.modal("hide"))
            }
    };

    util.showModuleLink = function (e) {
        var t = util.dialog("模块链接选择", ["./index.php?c=utility&a=link&do=modulelink&callback=moduleLinkComplete"], "");
        t.modal({
            keyboard: false
        }),
            t.find(".modal-body").css({
                height: "700px",
                "overflow-y": "auto"
            }),
            t.modal("show"),
            window.moduleLinkComplete = function (i, o) {
                $.isFunction(e) && (e(i, o),
                    t.modal("hide"))
            }
    };

    util.colorpicker = function (e, t) {
        require(["colorpicker"], function () {
            $(e).spectrum({
                className: "colorpicker",
                showInput: true,
                showInitial: true,
                showPalette: true,
                maxPaletteSize: 10,
                preferredFormat: "hex",
                change: function (e) {
                    $.isFunction(t) && t(e)
                },
                palette: [["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", "rgb(153, 153, 153)", "rgb(183, 183, 183)", "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(239, 239, 239)", "rgb(243, 243, 243)", "rgb(255, 255, 255)"], ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)", "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"], ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)", "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)", "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)", "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)", "rgb(133, 32, 12)", "rgb(153, 0, 0)", "rgb(180, 95, 6)", "rgb(191, 144, 0)", "rgb(56, 118, 29)", "rgb(19, 79, 92)", "rgb(17, 85, 204)", "rgb(11, 83, 148)", "rgb(53, 28, 117)", "rgb(116, 27, 71)", "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]]
            })
        })
    };

    util.tomedia = function (e, t) {
        if (0 == e.indexOf("http://") || 0 == e.indexOf("https://") || 0 == e.indexOf("./resource"))
            return e;
        if (0 == e.indexOf("./addons")) {
            var i = window.document.location.href
                , o = window.document.location.pathname
                , n = i.indexOf(o)
                , a = i.substring(0, n);
            return "." == e.substr(0, 1) && (e = e.substr(1)),
            a + e
        }
        return t ? window.sysinfo.attachurl_local + e : window.sysinfo.attachurl + e
    };

    /**
     * 复制到剪切板
     * @param element
     * @param data 复制数据
     */
    util.clip = function (element, data) {
        // 复制到剪切板”插件 https://www.cnblogs.com/yunser/p/7628031.html
        require(["clipboard"], function (clipboard) {
            var clipboardObj = new clipboard(element, {
                text: function () {
                    return data
                }
            });
            clipboardObj.on("success", function (e) {
                util.message("复制成功", "", "success");
                e.clearSelection();
            });
            clipboardObj.on("error", function (e) {
                util.message("复制失败，请重试", "", "error");
            })
        })
    };

    util.uploadMultiPictures = function (e, t) {
        var o = {
            type: "image",
            tabs: {
                upload: "active",
                browser: "",
                crawler: ""
            },
            path: "",
            direct: false,
            multiple: true,
            dest_dir: ""
        };
        o = $.extend({}, o, t),
            require(["fileUploader"], function (t) {
                t.show(function (t) {
                    if (t.length > 0) {
                        for (i in t)
                            t[i].filename = t[i].attachment;
                        $.isFunction(e) && e(t)
                    }
                }, o)
            })
    };

    util.editor = function (id, options, isNoMap) {
        if (!id && "" != id)
            return "";
        var domId = "string" == typeof id ? id : id.id;
        if (!domId) {
            domId = "editor-" + Math.random();
            id.id = domId;
        }
        var defaults = {
            height: "200",
            dest_dir: "",
            image_limit: "1024",
            allow_upload_video: 1,
            audio_limit: "1024",
            callback: null
        };
        $.isFunction(options) && (options = {
            callback: options
        });
        options = $.extend({}, defaults, options);
        window.UEDITOR_HOME_URL = window.sysinfo.siteroot + "web/resource/components/ueditor/";
        var callback = function (ueditor, fileUploader) {
            var editorConfig = {
                autoClearinitialContent: false,
                toolbars: [["fullscreen", "source", "preview", "|", "bold", "italic", "underline", "strikethrough", "forecolor", "backcolor", "|", "justifyleft", "justifycenter", "justifyright", "|", "insertorderedlist", "insertunorderedlist", "blockquote", "emotion", "link", "removeformat", "|", "rowspacingtop", "rowspacingbottom", "lineheight", "indent", "paragraph", "fontfamily", "fontsize", "|", "inserttable", "deletetable", "insertparagraphbeforetable", "insertrow", "deleterow", "insertcol", "deletecol", "mergecells", "mergeright", "mergedown", "splittocells", "splittorows", "splittocols", "|", "anchor", "map", "print", "drafts"]],
                elementPathEnabled: false,
                catchRemoteImageEnable: false,
                initialFrameHeight: options.height,
                focus: false,
                maximumWords: 9999999999999
            };
            if (isNoMap) {
                editorConfig.toolbars = [["fullscreen", "source", "preview", "|", "bold", "italic", "underline", "strikethrough", "forecolor", "backcolor", "|", "justifyleft", "justifycenter", "justifyright", "|", "insertorderedlist", "insertunorderedlist", "blockquote", "emotion", "link", "removeformat", "|", "rowspacingtop", "rowspacingbottom", "lineheight", "indent", "paragraph", "fontfamily", "fontsize", "|", "inserttable", "deletetable", "insertparagraphbeforetable", "insertrow", "deleterow", "insertcol", "deletecol", "mergecells", "mergeright", "mergedown", "splittocells", "splittorows", "splittocols", "|", "anchor", "print", "drafts"]];
            }
            var imageUploadConfig = {
                type: "image",
                direct: false,
                multiple: true,
                tabs: {
                    upload: "active",
                    browser: "",
                    crawler: ""
                },
                path: "",
                dest_dir: options.dest_dir,
                global: false,
                thumb: false,
                width: 0,
                fileSizeLimit: 1024 * options.image_limit
            };
            ueditor.registerUI("myinsertimage", function (editor, uiName) { // 这里uiName就是myinsertimage值
                editor.registerCommand(uiName, {
                    execCommand: function () { // 注册ui执行时的command命令，使用命令默认就会带有回退操作
                        fileUploader.show(function (selectedItems) {
                            if (0 != selectedItems.length)
                                if (1 == selectedItems.length) {
                                    // https://ueditor.baidu.com/doc/#COMMAND::insertimage
                                    editor.execCommand("insertimage", {
                                        src: selectedItems[0].url,
                                        _src: selectedItems[0].attachment,
                                        width: "100%",
                                        alt: selectedItems[0].filename
                                    });
                                }
                                else { // 如果多选
                                    var itemsInfo = [];
                                    for (i in selectedItems)
                                        itemsInfo.push({
                                            src: selectedItems[i].url,
                                            _src: selectedItems[i].attachment,
                                            width: "100%",
                                            alt: selectedItems[i].filename
                                        });
                                    editor.execCommand("insertimage", itemsInfo);
                                }
                        }, imageUploadConfig)
                    }
                });
                var button = new ueditor.ui.Button({
                    name: "插入图片",
                    title: "插入图片",
                    cssRules: "background-position: -726px -77px",
                    onclick: function () {
                        editor.execCommand(uiName) // 执行前面注册的ui命令
                    }
                });
                //当点到编辑内容上时，按钮要做的状态反射
                editor.addListener("selectionchange", function () { // 每当编辑器内部选区发生改变时，将触发该事件
                    // 查询给定命令在当前选区内的状态。
                    var state = editor.queryCommandState(uiName);
                    if (-1 == state) { //代表当前命令在当前选区内处于不可用状态
                        button.setDisabled(true);
                        button.setChecked(false);
                    } else {
                        button.setDisabled(false);
                        button.setChecked(state);
                    }
                });
                return button;
            }, 19); // 这里19表示你想放到toolbar的那个位置，默认是放到最后
            ueditor.registerUI("myinsertvideo", function (editor, uiName) {
                editor.registerCommand(uiName, {
                    execCommand: function () {
                        fileUploader.show(function (selectedItems) {
                            if (selectedItems) {
                                var i = selectedItems.isRemote ? "iframe" : "video";
                                editor.execCommand("insertvideo", {
                                    url: selectedItems.url,
                                    width: 300,
                                    height: 200
                                }, i)
                            }
                        }, {
                            fileSizeLimit: 1024 * options.audio_limit,
                            type: "video",
                            allowUploadVideo: options.allow_upload_video,
                            netWorkVideo: true
                        })
                    }
                });
                var button = new ueditor.ui.Button({
                    name: "插入视频",
                    title: "插入视频",
                    cssRules: "background-position: -320px -20px",
                    onclick: function () {
                        editor.execCommand(uiName);
                    }
                });
                editor.addListener("selectionchange", function () {
                    var state = editor.queryCommandState(uiName);
                    if (-1 == state) { //代表当前命令在当前选区内处于不可用状态
                        button.setDisabled(true);
                        button.setChecked(false);
                    } else {
                        button.setDisabled(false);
                        button.setChecked(state);
                    }
                });
                return button;
            }, 20);
            if (domId) {
                var d = ueditor.getEditor(domId, editorConfig);
                $("#" + domId).removeClass("form-control");
                $("#" + domId).data("editor", d);
                $("#" + domId).parents("form").submit(function () {
                    d.queryCommandState("source") && d.execCommand("source")
                });
                $.isFunction(options.callback) && options.callback(id, d);
            }
        };

        require(["ueditor", "fileUploader"], function (ueditor, fileUploader) {
            callback(ueditor, fileUploader);
        }, function (error) { //你检测模块的一个加载错,然后undefine该模块,并重置配置到另一个地址来进行重试。
            var failedId = error.requireModules && error.requireModules[0];
            if ("ueditor" === failedId) {
                requirejs.undef(failedId);
                requirejs.config({
                    paths: {
                        ueditor: "../../components/ueditor/ueditor.all.min"
                    },
                    shim: {
                        ueditor: {
                            deps: ["./resource/components/ueditor/third-party/zeroclipboard/ZeroClipboard.min.js", "./resource/components/ueditor/ueditor.config.js"],
                            exports: "UE",
                            init: function (e) {
                                window.ZeroClipboard = e
                            }
                        }
                    }
                });
                require(["ueditor", "fileUploader"], function (ueditor, fileUploader) {
                    callback(ueditor, fileUploader);
                })
            }
        })
    };

    // 正在加载显示加载图标
    util.loading = function (message) {
        message || (message = "正在努力加载...");
        var $modalLoading = $("#modal-loading");
        if (0 == $modalLoading.length) {
            $(document.body).append('<div id="modal-loading" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true"></div>');
            $modalLoading = $("#modal-loading");
            html = '<div class="modal-dialog">\t<div style="text-align:center; background-color: transparent;">\t\t<img style="width:48px; height:48px; margin-top:100px;" src="../attachment/images/global/loading.gif" title="正在努力加载...">\t\t<div>' + message + "</div>\t</div></div>";
            $modalLoading.html(html);
            $modalLoading.modal("show");
            $modalLoading.next().css("z-index", 999999);
        } else {
            $modalLoading.modal("show");
        }
        return $modalLoading;
    };

    // 加载完成隐藏加载图标
    util.loaded = function () {
        var e = $("#modal-loading");
        if (e.length > 0) {
            e.modal("hide");
            e.hide();
        }
    };

    /**
     * 显示对话框
     * @param title 对话框头标题
     * @param content 内容区域，这里可以是数组，此时array[0]表示请求地址，如果存在array[1]，则表示提交内容，响应的内容显示在此。
     * @param footer 底部区域
     * @param options
     * @returns {jQuery.fn.init|jQuery|HTMLElement}
     */
    util.dialog = function (title, content, footer, options) {
        options || (options = {});
        options.containerName || (options.containerName = "modal-message");
        var $containerDom = $("#" + options.containerName);

        if (0 == $containerDom.length) {
            $(document.body).append('<div id="' + options.containerName + '" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true"></div>');
            $containerDom = $("#" + options.containerName);
        }
        html = '<div class="modal-dialog we7-modal-dialog">\t<div class="modal-content">';
        if (title) {
            html += '<div class="modal-header">\t<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\t<h3>' + title + "</h3></div>";
        }
        content && ($.isArray(content) ? html += '<div class="modal-body">正在加载中</div>' : html += '<div class="modal-body">' + content + "</div>");
        footer && (html += '<div class="modal-footer">' + footer + "</div>");
        html += "\t</div></div>";
        $containerDom.html(html);
        if (content && $.isArray(content)) {
            var callback = function (response) {
                $containerDom.find(".modal-body").html(response);
            };
            2 == content.length ? $.post(content[0], content[1]).success(callback) : $.get(content[0]).success(callback);
        }
        return $containerDom;
    };

    /**
     * 显示消息
     * @param message 消息内容
     * @param redirect 可以是back(后退)；refresh(刷新)；或者为空
     * @param messageType 可能值ajax
     */
    util.message = function (message, redirect, messageType) {
        redirect || messageType || (messageType = "info");
        -1 == $.inArray(messageType, ["success", "error", "info", "warning"]) && (messageType = "");
        "" == messageType && (messageType = "" == redirect ? "error" : "success");
        var classes = {
            success: "right-sign",
            error: "error-sign",
            danger: "error-sign",
            info: "info-sign",
            warning: "warning-sign"
        };
        if (redirect && redirect.length > 0) {
            if ("success" == messageType) {
                var messageObject = new Object;
                messageObject.type = messageType;
                messageObject.msg = message;
                util.cookie.set("message", JSON.stringify(messageObject), 600);
                if ("back" == redirect) {
                    window.history.back(-1);
                } else if ("refresh" == redirect) {
                    redirect = location.href;
                    window.location.href = redirect;
                } else {
                    window.location.href = redirect;
                }
                return;
            }
            "back" == redirect ? redirect = "javascript:history.back(-1)" : "refresh" == redirect && (redirect = location.href);
            htmlA = "\t\t\t<a href=" + redirect + ' class="btn btn-primary">确认</a>';
        } else {
            htmlA = '\t\t\t<button type="button" class="btn btn-primary" data-dismiss="modal">确认</button>';
        }
        var dialogContent = '\t\t\t<div class="text-center">\t\t\t\t<p>\t\t\t\t\t<i class="text-' + messageType + " wi wi-" + classes[messageType] + '"></i>' + message + '\t\t\t\t</p>\t\t\t</div>\t\t\t<div class="clearfix"></div>';
        dialog = util.dialog("系统提示", dialogContent, htmlA, {
            containerName: "modal-message"
        });
        redirect && redirect.length > 0 && "success" != messageType && dialog.on("hidden.bs.modal", function () {
            return window.location.href = redirect
        });
        dialog.on("hidden.bs.modal", function () {
            $("body").css("padding-right", 0)
        });
        dialog.modal("show");
        return dialog;
    };

    // 处理message cookie的函数
    util.cookie_message = function (time) {
        var message = util.cookie.get("message");
        if (message) {
            var del = util.cookie.del("message");
            message = eval("(" + message + ")"); // 文本作为js脚本执行
            var msg = message.msg;
            msg = decodeURIComponent(msg);
            util.modal_message(message.title, msg, message.redirect, message.type, time, message.extend);
        }
    };

    /**
     * 显示消息的模式框
     * @param title
     * @param message
     * @param redirect
     * @param type
     * @param time
     * @param extend
     */
    util.modal_message = function (title, message, redirect, type, time, extend) {

        function hideModal() {
            setTimeout(function () {
                dialog.modal("hide")
            }, 1e3 * time)
        }

        if (!redirect || getQueryParam(redirect) == getQueryParam(window.location.href)) {
            var classes = {
                success: "right-sign",
                error: "error-sign",
                danger: "error-sign",
                info: "info-sign",
                warning: "warning-sign"
            }
                , isSuccessType = false
                , html = "";
            type || (type = "info");
            -1 == $.inArray(type, ["success", "error", "info", "warning", "danger"]) && (type = "");
            "" == type && (type = "success");

            if (-1 != $.inArray(type, ["success"])) {
                isSuccessType = true;
                time = time || 3;
            }

            var c = '\t\t\t<div class="text-center">\t\t\t\t\t<i class="text-' + type + " wi wi-" + classes[type] + '"></i>' + message + '\t\t\t</div>\t\t\t<div class="clearfix"></div>';

            if (!isSuccessType) {
                redirect = redirect || "./?refresh";
                title = title || "系统提示";
                html = '\t\t<a href="' + redirect + '" class="btn btn-primary">确认</a>';
            }
            if ("" != extend && void 0 != extend && extend.length > 0) {
                for (var u = 0; u < extend.length; u++)
                    html = html + '<a href="' + extend[u].url + '" class="btn btn-primary">' + decodeURIComponent(extend[u].title) + "</a>";
            }
            var id = Math.floor(1e4 * Math.random())
                , dialog = util.dialog(title, c, html, {
                containerName: "modal-message-" + id
            });

            if (isSuccessType) {
                dialog.modal({
                    backdrop: false
                });
                dialog.addClass("modal-" + type);
                dialog.on("show.bs.modal", function () {
                    hideModal();
                });
                dialog.on("hidden.bs.modal", function () {
                    dialog.remove();
                });
            } else {
                dialog.on("hidden.bs.modal", function () {
                    return window.location.href = redirect;
                });
            }

            dialog.modal("show");
            return dialog;
        }
    };

    /**
     * 上传图片
     * @param url 服务端图片的地址
     * @param callback 上传完成后回调函数
     * @param options 上传选项
     * @param o
     */
    util.image = function (url, callback, options, o) {
        var defaultOptions = {
            type: "image",
            direct: false,
            multiple: false,
            path: url,
            dest_dir: "",
            global: false,
            thumb: false,
            width: 0,
            needType: 2
        };
        !options && o && (options = o);
        (defaultOptions = $.extend({}, defaultOptions, options)).type = "image";
        require(["fileUploader"], function (fileUploader) {
            fileUploader.show(function (items) {
                items && $.isFunction(callback) && callback(items)
            }, defaultOptions);
        });
    };

    util.wechat_image = function (e, t, i) {
        var o = {
            type: "image",
            direct: false,
            multiple: false,
            acid: 0,
            path: e,
            dest_dir: "",
            isWechat: true,
            needType: 1
        };
        o = $.extend({}, o, i),
            require(["fileUploader"], function (e) {
                e.show(function (e) {
                    e && $.isFunction(t) && t(e)
                }, o)
            })
    };

    util.audio = function (e, t, i, o) {
        var n = {
            type: "voice",
            direct: false,
            multiple: false,
            path: "",
            dest_dir: "",
            needType: 2
        };
        e && (n.path = e),
        !i && o && (i = o),
            n = $.extend({}, n, i),
            require(["fileUploader"], function (e) {
                e.show(function (e) {
                    e && $.isFunction(t) && t(e)
                }, n)
            })
    };

    util.wechat_audio = function (e, t, i) {
        var o = {
            type: "voice",
            direct: false,
            multiple: false,
            path: "",
            dest_dir: "",
            isWechat: true,
            needType: 1
        };
        e && (o.path = e),
            o = $.extend({}, o, i),
            require(["fileUploader"], function (e) {
                e.show(function (e) {
                    e && $.isFunction(t) && t(e)
                }, o)
            })
    };

    util.ajaxshow = function (e, t, o, n) {
        var a = {
                show: true
            }
            , r = {}
            , l = $.extend({}, a, o)
            ,
            s = ("function" == typeof (n = $.extend({}, r, n)).confirm ? '<a href="#" class="btn btn-primary confirm">确定</a>' : "") + '<a href="#" class="btn" data-dismiss="modal" aria-hidden="true">关闭</a><iframe id="_formtarget" style="display:none;" name="_formtarget"></iframe>'
            , d = util.dialog(t || "系统信息", "正在加载中", s, {
                containerName: "modal-panel-ajax"
            });
        if ("undeinfed" != typeof l.width && l.width > 0 && d.find(".modal-dialog").css({
            width: l.width
        }),
            n)
            for (i in n)
                "function" == typeof n[i] && d.on(i, n[i]);
        var c;
        return d.find(".modal-body").load(e, function (e) {
            try {
                c = $.parseJSON(e),
                    d.find(".modal-body").html('<div class="modal-body"><i class="pull-left fa fa-4x ' + (c.message.errno ? "fa-info-circle" : "fa-check-circle") + '"></i><div class="pull-left"><p>' + c.message.message + '</p></div><div class="clearfix"></div></div>')
            } catch (t) {
                d.find(".modal-body").html(e)
            }
            $("form.ajaxfrom").each(function () {
                $(this).attr("action", $(this).attr("action") + "&isajax=1&target=formtarget"),
                    $(this).attr("target", "_formtarget")
            })
        }),
            d.on("hidden.bs.modal", function () {
                if (c && c.redirect)
                    return location.href = c.redirect,
                        false;
                d.remove()
            }),
        "function" == typeof n.confirm && d.find(".confirm", d).on("click", n.confirm),
            d.modal(l)
    };

    util.cookie = {
        prefix: window.sysinfo ? window.sysinfo.cookie.pre : "",
        set: function (name, value, expire) {
            expires = new Date;
            expires.setTime(expires.getTime() + 1e3 * expire);
            document.cookie = this.name(name) + "=" + escape(value) + "; expires=" + expires.toGMTString() + "; path=/";
        },
        get: function (name) {
            for (cookie_name = this.name(name) + "=", cookie_length = document.cookie.length, cookie_begin = 0; cookie_begin < cookie_length;) {
                value_begin = cookie_begin + cookie_name.length;
                if (document.cookie.substring(cookie_begin, value_begin) == cookie_name) {
                    var t = document.cookie.indexOf(";", value_begin);
                    -1 == t && (t = cookie_length);
                    return  unescape(document.cookie.substring(value_begin, t));
                }
                cookie_begin = document.cookie.indexOf(" ", cookie_begin) + 1;
                if (0 == cookie_begin)
                    break;
            }
            return null;
        },
        del: function (name) {
            new Date;
            document.cookie = this.name(name) + "=; expires=Thu, 01-Jan-70 00:00:01 GMT; path=/"
        },
        name: function (name) {
            return this.prefix + name
        }
    };

    util.coupon = function (e, t) {
        var i = {
            type: "all",
            multiple: true
        };
        i = $.extend({}, i, t),
            require(["coupon"], function (t) {
                t.init(function (t) {
                    t && $.isFunction(e) && e(t)
                }, i)
            })
    };

    util.material = function (e, t) {
        var i = {
            type: "news",
            multiple: false,
            ignore: {}
        };
        i = $.extend({}, i, t),
            require(["material"], function (t) {
                t.init(function (t) {
                    t && $.isFunction(e) && e(t)
                }, i)
            })
    };

    util.encrypt = function (e) {
        if ("string" == typeof (e = $.trim(e)) && e.length > 3) {
            for (var t = /^./, i = t.exec(e), o = (t = /.$/).exec(e)[0], n = "", a = 0; a < e.length - 2; a++)
                n += "*";
            return e = i + n + o
        }
        return e
    };

    util.qqmap = function (e, t) {
        require(["loadjs!qqmap"], function () {
            function i(e) {
                n.getLocation(e),
                    n.setComplete(function (e) {
                        util.qqmap.instance.panTo(e.detail.location),
                            util.qqmap.marker.setPosition(e.detail.location),
                            util.qqmap.marker.setAnimation(qq.maps.MarkerAnimation.DOWN),
                            setTimeout(function () {
                                util.qqmap.marker.setAnimation(null)
                            }, 3600)
                    }),
                    n.setError(function (e) {
                        alert("请输入详细的地址")
                    })
            }

            e || (e = {}),
                console.dir(window.qq),
            e.lng || (e.lng = 116.403851),
            e.lat || (e.lat = 39.915177);
            var o = new qq.maps.LatLng(e.lat, e.lng)
                , n = new qq.maps.Geocoder
                , a = $("#map-dialog");
            if (0 == a.length) {
                (a = util.dialog("请选择地点", '<div class="form-group"><div class="input-group"><input type="text" class="form-control" placeholder="请输入地址来直接查找相关位置"><div class="input-group-btn"><button class="btn btn-default"><i class="icon-search"></i> 搜索</button></div></div></div><div id="map-container" style="height:400px;"></div>', '<button type="button" class="btn btn-default" data-dismiss="modal">取消</button><button type="button" class="btn btn-primary">确认</button>', {
                    containerName: "map-dialog"
                })).find(".modal-dialog").css("width", "80%"),
                    a.modal({
                        keyboard: false
                    }),
                    a.find(".input-group :text").keydown(function (e) {
                        13 == e.keyCode && i($(this).val())
                    }),
                    a.find(".input-group button").click(function () {
                        i($(this).parent().prev().val())
                    })
            }
            a.off("shown.bs.modal"),
                a.on("shown.bs.modal", function () {
                }),
                a.find("button.btn-primary").off("click"),
                a.find("button.btn-primary").on("click", function () {
                    if ($.isFunction(t)) {
                        var e = util.qqmap.marker.getPosition();
                        n.getAddress(e),
                            n.setComplete(function (i) {
                                var o = {
                                    lng: e.lng,
                                    lat: e.lat,
                                    label: i.detail.address
                                };
                                t(o)
                            })
                    }
                    a.modal("hide")
                }),
                a.modal("show");
            var r = util.qqmap.instance = new qq.maps.Map($("#map-dialog #map-container")[0], {
                center: o,
                zoom: 13
            });
            util.qqmap.marker = new qq.maps.Marker({
                position: o,
                draggable: true,
                map: r
            })
        })
    };
    /**
     * 显示百度地图，通过地图来获取坐标
     *
     * http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html
     */
    util.map = function (defaultValue, callback) {
        require(["map"], function () {

            //百度地图API提供Geocoder类进行地址解析，您可以通过Geocoder.getPoint()方法来将一段地址描述转换为一个坐标。
            function addressToPoint(address) {
                geocoder.getPoint(address, function (point) {
                    map.panTo(point); // 将地图的中心点更改为给定的点
                    marker.setPosition(point); // 设置标注的地理坐标
                    marker.setAnimation(BMAP_ANIMATION_BOUNCE); // 设置标注动画效果
                    setTimeout(function () {
                        marker.setAnimation(null);
                    }, 3600); // 动画持续时间
                })
            }

            defaultValue || (defaultValue = {});
            defaultValue.lng || (defaultValue.lng = 116.403851);
            defaultValue.lat || (defaultValue.lat = 39.915177);
            var point = new BMap.Point(defaultValue.lng, defaultValue.lat) /*2、创建点坐标*/
                , geocoder = new BMap.Geocoder /*创建地址解析器实例*/
                , $mapDialog = $("#map-dialog");
            if (0 == $mapDialog.length) {
                ($mapDialog = util.dialog("请选择地点", '<div class="form-group"><div class="input-group"><input type="text" class="form-control" placeholder="请输入地址来直接查找相关位置"><div class="input-group-btn"><button class="btn btn-default"><i class="icon-search"></i> 搜索</button></div></div></div><div id="map-container" style="height:400px;"></div>', '<button type="button" class="btn btn-default" data-dismiss="modal">取消</button><button type="button" class="btn btn-primary">确认</button>', {
                    containerName: "map-dialog"
                })).find(".modal-dialog").css("width", "80%");
                $mapDialog.modal({
                    keyboard: false
                });
                map = util.map.instance = new BMap.Map("map-container"); // 1、创建地图实例
                map.centerAndZoom(point, 12); // 3、地图初始化，设置中心坐标点及地图级别
                map.enableScrollWheelZoom(); // 4、其它，鼠标滚轮控制缩放
                map.enableDragging(); // 启用地图拖拽，默认启用
                map.enableContinuousZoom(); // 启用连续缩放效果，默认禁用
                map.addControl(new BMap.NavigationControl); // 添加导航控件
                map.addControl(new BMap.OverviewMapControl); // 添加缩略图控件
                marker = util.map.marker = new BMap.Marker(point); // 创建一个图像标注实例。point参数指定了图像标注所在的地理位置
                marker.setLabel(new BMap.Label("请您移动此标记，选择您的坐标！", {
                    offset: new BMap.Size(10, -20)
                })); // //把label设置到maker上
                map.addOverlay(marker); // 添加自定义覆盖物
                marker.enableDragging(); //开启标注拖拽功能
                // 添加拖拽事件监听函数
                marker.addEventListener("dragend", function (e) {
                    var point = marker.getPosition(); // 返回标注的地理坐标
                    // 拖拽标签由坐标地址转换为文本地址
                    geocoder.getLocation(point, function (geocoderResult) {
                        $mapDialog.find(".input-group :text").val(geocoderResult.address)
                    })
                });
                // 回车由文本地址解析坐标
                $mapDialog.find(".input-group :text").keydown(function (e) {
                    13 == e.keyCode && addressToPoint($(this).val())
                });
                // 点击按钮由文本地址解析坐标
                $mapDialog.find(".input-group button").click(function () {
                    addressToPoint($(this).parent().prev().val())
                });
            }

            // 在模态框完全展示出来做一些动作
            // http://www.runoob.com/bootstrap/bootstrap-modal-plugin.html
            $mapDialog.off("shown.bs.modal");
            $mapDialog.on("shown.bs.modal", function () {
                marker.setPosition(point); // 设置标注的地理坐标
                map.panTo(marker.getPosition()); // 将地图的中心点更改为给定的点
            });
            $mapDialog.find("button.btn-primary").off("click");
            $mapDialog.find("button.btn-primary").on("click", function () {
                if ($.isFunction(callback)) {
                    var e = util.map.marker.getPosition();
                    geocoder.getLocation(e, function (i) {
                        var result = {
                            lng: e.lng,
                            lat: e.lat,
                            label: i.address
                        };
                        callback(result);
                    })
                }
                $mapDialog.modal("hide");
            });
            $mapDialog.modal("show");
        })
    };

    util.toast = function (e, t, i) {
        util.modal_message(i, e, "", t, "")
    };

    "function" == typeof define && define.amd ? define(function () {
        return util
    }) : window.util = util
}(window);

