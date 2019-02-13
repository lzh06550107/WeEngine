angular.module("we7resource", ["we7app"]);

angular.module("we7resource").controller("we7resource-base-controller", ["$scope", "$sce", "serviceResource", "$http", "config", function ($scope, $sce, a, $http, config) {

    function s(resource) {
        $scope.converting = true; // 正在转换
        var isToLocal = 2 == $scope.needType; // 微信资源转换为本地资源
        a.convert(resource.id, $scope.resourceType, isToLocal).then(function (resource) {
            util.loaded();
            $scope.converting = false;
            resource && triggerResourceSelectedEvent([resource]);
            resource.selected = false;
        }, function () {
            $scope.converting = false;
            message("资源转换失败");
            resource.selected = false;
            util.loaded();
        })
    }

    function message(message) {
        util.message(message)
    }

    function triggerResourceSelectedEvent(selectedResourceItems) {
        $(window).trigger("resource_selected", {
            type: $scope.resourceType,
            items: selectedResourceItems
        })
    }

    function triggerResourceCanceledEvent() {
        $(window).trigger("resource_canceled")
    }

    $scope.currentPage = 1; // 当前页码
    $scope.isWechat = config.isWechat; // 是否是上传图片到微信
    $scope.needType = config.needType; // 分为Networktolocal和NetworktoWechat
    $scope.multiple = config.multiple; // 是否多选
    $scope.showType = config.showType;
    $scope.global = config.global ? "global" : ""; //
    $scope.dest_dir = config.dest_dir;
    $scope.uniacid = config.uniacid; // 统一账号
    $scope.netWorkVideo = config.netWorkVideo;
    config.others && config.others[$scope.resourceType] && ($scope.needType = config.others[$scope.resourceType].needType);
    $scope.selectedItems = {}; // 被选择的资源
    $scope.index = 0; // 面板索引
    $scope.converting = false; // 是否正在转换标识

    /**
     *  是否显示微信项
     */
    $scope.showWx = function () {
        return true
    };

    /**
     * 是否显示本地服务器
     */
    $scope.showLocal = function () {
        return true
    };

    $scope.showNetWork = function () {
        return true
    };

    // 用户自定义的资源上传完成后的回调函数
    $scope.loadData = function () {
    };
    $scope.onIndexChange = function (index) {
        $scope.loadData()
    };

    $scope.setIndex = function (index) {
        if ($scope.index !== index) {
            $scope.index = index;
            $scope.selectedItems = {}; //清空选择项
            $scope.onIndexChange(index);
        }
    };

    $scope.isWechat || $scope.setIndex(1); // 如果不是上传图片到微信，则默认选择上传本地服务器
    $scope.setCurrentPage = function (page) {
        $scope.currentPage != page && ($scope.currentPage = page,
            $scope.loadData())
    };

    $scope.itemClick = function (t) {
        if (!$scope.converting)
            if (t.selected)
                t.selected = false;
            else {
                if (!$scope.multiple || $scope.needConvert())
                    return t.selected = true,
                        void $scope.convert(t);
                t.selected = !t.selected,
                    delete $scope.selectedItems[t.id],
                t.selected && ($scope.selectedItems[t.id] = t)
            }
    };

    $scope.delItem = function (t, n) {
        if (n.stopPropagation(),
            !confirm("删除不可恢复确认删除吗？"))
            return false;
        a.delItem(t.id, $scope.resourceType, 1 == $scope.index, $scope.uniacid).then(function () {
            $scope.loadData()
        }, function (e) {
            util.message(e.message)
        })
    };

    $scope.canConvert = function (e) {
        return true
    };

    $scope.needConvert = function () {
        return 3 !== $scope.needType && $scope.index + 1 !== $scope.needType
    };

    $scope.convert = function (t) {
        var a = 0 == $scope.index ? "本地" : "微信";
        if ($scope.needConvert()) {
            if (!$scope.canConvert(t))
                return t.selected = false,
                    void message("当前资源无法选择");
            confirm("当前资源转换为" + a + "素材方可使用,是否转换") ? (util.loading("正在转换为" + a + "资源"),
                s(t)) : t.selected = false
        } else
            triggerResourceSelectedEvent([t])
    };

    $scope.ok = function () {
        var t = [];
        for (var a in $scope.selectedItems)
            t.push($scope.selectedItems[a]);
        t.length > 0 ? triggerResourceSelectedEvent(t) : triggerResourceCanceledEvent()
    };

    /**
     * 作为we7-uploader-btn组件的on-uploaded传入到we7UploaderBtn控制器中，它作为图片上传完成后回调函数
     */
    $scope.uploaded = function () {
        $scope.loadData()
    };

    $scope.uploaderror = function (error) {
        error && "" != error || (error = "上传失败"),
            message(error)
    };

    $scope.selectedItems = function () {
        return selectedItems;
    }
}
]);

angular.module("we7resource").directive("we7ResourceBasicDialog", ["config", function (e) {
    return {
        scope: {},
        restrict: "EA",
        templateUrl: "directive-basic-basic.html"
    }
}
]);

angular.module("we7resource").controller("we7resource-basic-controller", ["$scope", "config", function (e, t) {
    $("#basictext").val(t.otherVal),
        e.ok = function () {
            var e = $("#basictext").val();
            $(window).trigger("resource_selected", {
                type: "basic",
                items: [{
                    content: e
                }]
            })
        }
        ,
        e.emotion = function () {
            a()
        }
        ,
        e.emoji = function () {
            n()
        }
    ;
    var a = function () {
        var e = $("#basictext")[0]
            , t = $("#basictext").val();
        util.emotion($(".emotion-triggers"), $("#basictext"), function (a, n, i) {
            if (e.selectionStart || "0" == e.selectionStart) {
                var s = e.selectionStart
                    , o = e.selectionEnd
                    , r = e.scrollTop;
                $("#basictext").val(e.value.substring(0, s) + a + e.value.substring(o, e.value.length)),
                    $("#basictext").focus(),
                    e.selectionStart = s + a.length,
                    e.selectionEnd = s + a.length,
                    e.scrollTop = r
            } else
                $("#basictext").val(t + a),
                    $("#basictext").focus()
        })
    }
        , n = function () {
        var e = $("#basictext").val();
        util.emojiBrowser(function (t) {
            var a = "[U+" + t.find("span").text() + "]";
            $("#basictext").val(e + a)
        })
    }
}
]);

angular.module("we7resource").directive("we7ResourceIconDialog", function () {
    return {
        scope: {},
        restrict: "EA",
        templateUrl: "directive-icon-icon.html"
    }
});

angular.module("we7resource").controller("we7resource-icon-controller", ["$scope", "config", function (e, t) {
    var a = {};
    a.c0 = ["fa-adjust", "fa-anchor", "fa-archive", "fa-arrows", "fa-arrows-h", "fa-arrows-v", "fa-asterisk", "fa-automobile", "fa-ban", "fa-bank", "fa-bar-chart-o", "fa-barcode", "fa-bars", "fa-beer", "fa-bell", "fa-bell-o", "fa-bolt", "fa-bomb", "fa-book", "fa-bookmark", "fa-bookmark-o", "fa-briefcase", "fa-bug", "fa-building", "fa-building-o", "fa-bullhorn", "fa-bullseye", "fa-cab", "fa-calendar", "fa-calendar-o", "fa-camera", "fa-camera-retro", "fa-car", "fa-caret-square-o-down", "fa-caret-square-o-left", "fa-caret-square-o-right", "fa-caret-square-o-up", "fa-certificate", "fa-check", "fa-check-circle", "fa-check-circle-o", "fa-check-square", "fa-check-square-o", "fa-child", "fa-circle", "fa-circle-o", "fa-circle-o-notch", "fa-circle-thin", "fa-clock-o", "fa-cloud", "fa-cloud-download", "fa-cloud-upload", "fa-code", "fa-code-fork", "fa-coffee", "fa-cog", "fa-cogs", "fa-comment", "fa-comment-o", "fa-comments", "fa-comments-o", "fa-compass", "fa-credit-card", "fa-crop", "fa-crosshairs", "fa-cube", "fa-cubes", "fa-cutlery", "fa-dashboard", "fa-database", "fa-desktop", "fa-dot-circle-o", "fa-download", "fa-edit", "fa-ellipsis-h", "fa-ellipsis-v", "fa-envelope", "fa-envelope-o", "fa-envelope-square", "fa-eraser", "fa-exchange", "fa-exclamation", "fa-exclamation-circle", "fa-exclamation-triangle", "fa-external-link", "fa-external-link-square", "fa-eye", "fa-eye-slash", "fa-fax", "fa-female", "fa-fighter-jet", "fa-file-archive-o", "fa-file-audio-o", "fa-file-code-o", "fa-file-excel-o", "fa-file-image-o", "fa-file-movie-o", "fa-file-pdf-o", "fa-file-photo-o", "fa-file-picture-o", "fa-file-powerpoint-o", "fa-file-sound-o", "fa-file-video-o", "fa-file-word-o", "fa-file-zip-o", "fa-film", "fa-filter", "fa-fire", "fa-fire-extinguisher", "fa-flag", "fa-flag-checkered", "fa-flag-o", "fa-flash", "fa-flask", "fa-folder", "fa-folder-o", "fa-folder-open", "fa-folder-open-o", "fa-frown-o", "fa-gamepad", "fa-gavel", "fa-gear", "fa-gears", "fa-gift", "fa-glass", "fa-globe", "fa-graduation-cap", "fa-group", "fa-hdd-o", "fa-headphones", "fa-heart", "fa-heart-o", "fa-history", "fa-home", "fa-image", "fa-inbox", "fa-info", "fa-info-circle", "fa-institution", "fa-key", "fa-keyboard-o", "fa-language", "fa-laptop", "fa-leaf", "fa-legal", "fa-lemon-o", "fa-level-down", "fa-level-up", "fa-life-bouy", "fa-life-ring", "fa-life-saver", "fa-lightbulb-o", "fa-location-arrow", "fa-lock", "fa-magic", "fa-magnet", "fa-mail-forward", "fa-mail-reply", "fa-mail-reply-all", "fa-male", "fa-map-marker", "fa-meh-o", "fa-microphone", "fa-microphone-slash", "fa-minus", "fa-minus-circle", "fa-minus-square", "fa-minus-square-o", "fa-mobile", "fa-mobile-phone", "fa-money", "fa-moon-o", "fa-mortar-board", "fa-music", "fa-navicon", "fa-paper-plane", "fa-paper-plane-o", "fa-paw", "fa-pencil", "fa-pencil-square", "fa-pencil-square-o", "fa-phone", "fa-phone-square", "fa-photo", "fa-picture-o", "fa-plane", "fa-plus", "fa-plus-circle", "fa-plus-square", "fa-plus-square-o", "fa-power-off", "fa-print", "fa-puzzle-piece", "fa-qrcode", "fa-question", "fa-question-circle", "fa-quote-left", "fa-quote-right", "fa-random", "fa-recycle", "fa-refresh", "fa-reorder", "fa-reply", "fa-reply-all", "fa-retweet", "fa-road", "fa-rocket", "fa-rss", "fa-rss-square", "fa-search", "fa-search-minus", "fa-search-plus", "fa-send", "fa-send-o", "fa-share", "fa-share-alt", "fa-share-alt-square", "fa-share-square", "fa-share-square-o", "fa-shield", "fa-shopping-cart", "fa-sign-in", "fa-sign-out", "fa-signal", "fa-sitemap", "fa-sliders", "fa-smile-o", "fa-sort", "fa-sort-alpha-asc", "fa-sort-alpha-desc", "fa-sort-amount-asc", "fa-sort-amount-desc", "fa-sort-asc", "fa-sort-desc", "fa-sort-down", "fa-sort-numeric-asc", "fa-sort-numeric-desc", "fa-sort-up", "fa-space-shuttle", "fa-spinner", "fa-spoon", "fa-square", "fa-square-o", "fa-star", "fa-star-half", "fa-star-half-empty", "fa-star-half-full", "fa-star-half-o", "fa-star-o", "fa-suitcase", "fa-sun-o", "fa-support", "fa-tablet", "fa-tachometer", "fa-tag", "fa-tags", "fa-tasks", "fa-taxi", "fa-terminal", "fa-thumb-tack", "fa-thumbs-down", "fa-thumbs-o-down", "fa-thumbs-o-up", "fa-thumbs-up", "fa-ticket", "fa-times", "fa-times-circle", "fa-times-circle-o", "fa-tint", "fa-toggle-down", "fa-toggle-left", "fa-toggle-right", "fa-toggle-up", "fa-trash-o", "fa-tree", "fa-trophy", "fa-truck", "fa-umbrella", "fa-university", "fa-unlock", "fa-unlock-alt", "fa-unsorted", "fa-upload", "fa-user", "fa-users", "fa-video-camera", "fa-volume-down", "fa-volume-off", "fa-volume-up", "fa-warning", "fa-wheelchair", "fa-wrench"],
        a.c1 = ["fa-file", "fa-file-archive-o", "fa-file-audio-o", "fa-file-code-o", "fa-file-excel-o", "fa-file-image-o", "fa-file-movie-o", "fa-file-o", "fa-file-pdf-o", "fa-file-photo-o", "fa-file-picture-o", "fa-file-powerpoint-o", "fa-file-sound-o", "fa-file-text", "fa-file-text-o", "fa-file-video-o", "fa-file-word-o", "fa-file-zip-o"],
        a.c2 = ["fa-circle-o-notch", "fa-cog", "fa-gear", "fa-refresh", "fa-spinner"],
        a.c3 = ["fa-check-square", "fa-check-square-o", "fa-circle", "fa-circle-o", "fa-dot-circle-o", "fa-minus-square", "fa-minus-square-o", "fa-plus-square", "fa-plus-square-o", "fa-square", "fa-square-o"],
        a.c4 = ["fa-bitcoin", "fa-btc", "fa-cny", "fa-dollar", "fa-eur", "fa-euro", "fa-gbp", "fa-inr", "fa-jpy", "fa-krw", "fa-money", "fa-rmb", "fa-rouble", "fa-rub", "fa-ruble", "fa-rupee", "fa-try", "fa-turkish-lira", "fa-usd", "fa-won", "fa-yen"],
        a.c5 = ["fa-align-center", "fa-align-justify", "fa-align-left", "fa-align-right", "fa-bold", "fa-chain", "fa-chain-broken", "fa-clipboard", "fa-columns", "fa-copy", "fa-cut", "fa-dedent", "fa-eraser", "fa-file", "fa-file-o", "fa-file-text", "fa-file-text-o", "fa-files-o", "fa-floppy-o", "fa-font", "fa-header", "fa-indent", "fa-italic", "fa-link", "fa-list", "fa-list-alt", "fa-list-ol", "fa-list-ul", "fa-outdent", "fa-paperclip", "fa-paragraph", "fa-paste", "fa-repeat", "fa-rotate-left", "fa-rotate-right", "fa-save", "fa-scissors", "fa-strikethrough", "fa-subscript", "fa-superscript", "fa-table", "fa-text-height", "fa-text-width", "fa-th", "fa-th-large", "fa-th-list", "fa-underline", "fa-undo", "fa-unlink"],
        a.c6 = ["fa-angle-double-down", "fa-angle-double-left", "fa-angle-double-right", "fa-angle-double-up", "fa-angle-down", "fa-angle-left", "fa-angle-right", "fa-angle-up", "fa-arrow-circle-down", "fa-arrow-circle-left", "fa-arrow-circle-o-down", "fa-arrow-circle-o-left", "fa-arrow-circle-o-right", "fa-arrow-circle-o-up", "fa-arrow-circle-right", "fa-arrow-circle-up", "fa-arrow-down", "fa-arrow-left", "fa-arrow-right", "fa-arrow-up", "fa-arrows", "fa-arrows-alt", "fa-arrows-h", "fa-arrows-v", "fa-caret-down", "fa-caret-left", "fa-caret-right", "fa-caret-square-o-down", "fa-caret-square-o-left", "fa-caret-square-o-right", "fa-caret-square-o-up", "fa-caret-up", "fa-chevron-circle-down", "fa-chevron-circle-left", "fa-chevron-circle-right", "fa-chevron-circle-up", "fa-chevron-down", "fa-chevron-left", "fa-chevron-right", "fa-chevron-up", "fa-hand-o-down", "fa-hand-o-left", "fa-hand-o-right", "fa-hand-o-up", "fa-long-arrow-down", "fa-long-arrow-left", "fa-long-arrow-right", "fa-long-arrow-up", "fa-toggle-down", "fa-toggle-left", "fa-toggle-right", "fa-toggle-up"],
        a.c7 = ["fa-arrows-alt", "fa-backward", "fa-compress", "fa-eject", "fa-expand", "fa-fast-backward", "fa-fast-forward", "fa-forward", "fa-pause", "fa-play", "fa-play-circle", "fa-play-circle-o", "fa-step-backward", "fa-step-forward", "fa-stop", "fa-youtube-play"],
        a.c8 = ["fa-adn", "fa-android", "fa-apple", "fa-behance", "fa-behance-square", "fa-bitbucket", "fa-bitbucket-square", "fa-bitcoin", "fa-btc", "fa-codepen", "fa-css3", "fa-delicious", "fa-deviantart", "fa-digg", "fa-dribbble", "fa-dropbox", "fa-drupal", "fa-empire", "fa-facebook", "fa-facebook-square", "fa-flickr", "fa-foursquare", "fa-ge", "fa-git", "fa-git-square", "fa-github", "fa-github-alt", "fa-github-square", "fa-gittip", "fa-google", "fa-google-plus", "fa-google-plus-square", "fa-hacker-news", "fa-html5", "fa-instagram", "fa-joomla", "fa-jsfiddle", "fa-linkedin", "fa-linkedin-square", "fa-linux", "fa-maxcdn", "fa-openid", "fa-pagelines", "fa-pied-piper", "fa-pied-piper-alt", "fa-pied-piper-square", "fa-pinterest", "fa-pinterest-square", "fa-qq", "fa-ra", "fa-rebel", "fa-reddit", "fa-reddit-square", "fa-renren", "fa-share-alt", "fa-share-alt-square", "fa-skype", "fa-slack", "fa-soundcloud", "fa-spotify", "fa-stack-exchange", "fa-stack-overflow", "fa-steam", "fa-steam-square", "fa-stumbleupon", "fa-stumbleupon-circle", "fa-tencent-weibo", "fa-trello", "fa-tumblr", "fa-tumblr-square", "fa-twitter", "fa-twitter-square", "fa-vimeo-square", "fa-vine", "fa-vk", "fa-wechat", "fa-weibo", "fa-weixin", "fa-windows", "fa-wordpress", "fa-xing", "fa-xing-square", "fa-yahoo", "fa-youtube", "fa-youtube-play", "fa-youtube-square"],
        a.c9 = ["fa-ambulance", "fa-h-square", "fa-hospital-o", "fa-medkit", "fa-plus-square", "fa-stethoscope", "fa-user-md", "fa-wheelchair"],
        e.index = 0,
        e.color = t.otherVal ? t.otherVal : "#ddd",
        e.setIndex = function (t) {
            e.index = t,
                e.selectIndex = -1
        }
        ,
        e.icons = function () {
            return a["c" + e.index]
        }
        ,
        util.colorpicker("#we7colorpicker", function (t) {
            e.color = t.toString(),
                e.$apply("color")
        }),
        e.selectIndex = -1,
        e.itemClick = function (t) {
            $(window).trigger("resource_selected", {
                type: "icon",
                items: [{
                    name: t,
                    color: e.color
                }]
            })
        }
}
]);

angular.module("we7resource").directive("we7ResourceImageDialog", function () {
    return {
        scope: {},
        restrict: "EA", // 元素和属性指令
        templateUrl: "directive-images-images.html",
        link: function (scope, $element, a, n, i) {
            $element.bind("click", "pagination li a", function (event) {
                var attr = $(event.target).attr("page");
                attr && scope.$broadcast("image_page_change", attr);
            })
        }
    }
});

angular.module("we7resource").controller("we7resource-image-controller", ["$scope", "$sce", "serviceResource", "$http", "$controller", "config", function (scope, sce, a, http, controller, config) {

    function message(message) {
        util.message(message, "")
    }

    // 触发选择图片事件，该事件在fileuploader.js文件中注册
    function triggerResourceSelectedEvent(message) {
        $(window).trigger("resource_selected", {
            type: "image",
            items: message
        })
    }

    /**
     * 收集选择图片的id
     * @returns {Array}
     */
    function getSelectedImageIds() {
        for (var selectedImagesIds = [], t = getSelectedImages(), a = 0; a < t.length; a++)
            selectedImagesIds.push(t[a].id);
        return selectedImagesIds
    }

    /**
     * 获取当前选择的图片
     * @returns {Array}
     */
    function getSelectedImages() {
        for (var selectedImages = [], a = 0; a < scope.images.length; a++) {
            var image = scope.images[a];
            image.selected && selectedImages.push(image)
        }
        return selectedImages
    }

    function triggerResourceCanceledEvent() {
        $(window).trigger("resource_canceled")
    }

    // 根据选项索引来确定uploadurl变量值，这个值最后通过组件属性传入we7-uploader-btn，即we7UploaderBtn组件中去
    function getUploadUrl() {
        var groupid = scope.groupid;
        scope.uploadurl = 0 == scope.index ? "./index.php?c=utility&a=file&do=wechat_upload&upload_type=image&mode=perm&uniacid=" + scope.uniacid + "&dest_dir=" + scope.dest_dir + "&quality=" + scope.quality + "&group_id=" + groupid : "./index.php?c=utility&a=file&do=upload&upload_type=image&global=" + scope.global + "&dest_dir=" + scope.dest_dir + "&uniacid=" + scope.uniacid + "&quality=" + scope.quality + "&group_id=" + groupid;
    }

    function netWorkconvert(netWorkurl, isNetworktolocal) {
        util.loading("网络图片转化中...");
        // a为serviceResource
        a.netWorkconvert(netWorkurl, isNetworktolocal, "image").then(function (message) {
            util.loaded(); // 显示加载图标
            triggerResourceSelectedEvent([message]);
        }, function (e) {
            message("网络图片转化失败");
            util.loaded();
        })
    }

    function loadGroupAndImages() {
        loadImagesByGroupId(scope.groupid); // 加载指定组图片
        loadAllGroup(); // 加载所有分组
    }

    /**
     * 加载指定的分组资源
     * @param groupid
     */
    function loadImagesByGroupId(groupid) { // groupid为-1表示加载所有分组资源
        scope.selectedAllImage = false;
        scope.groupid = groupid;
        getUploadUrl();
        var isLocal = 1 == scope.index;
        // a为serviceResource
        a.getResources("image", scope.currentPage, isLocal, {
            year: scope.year,
            month: scope.month,
            uniacid: scope.uniacid,
            dest_dir: scope.dest_dir,
            global: scope.global,
            groupid: groupid
        }).then(function (a) {
            scope.images = a.items;
            scope.pager = sce.trustAsHtml(a.pager);
        })
    }

    /**
     * 加载所有分组
     */
    function loadAllGroup() {
        var isLocal = 1 == scope.index;
        // a为serviceResource
        a.imageGroup(isLocal, []).then(function (t) {
            for (var groups = [], n = 0; n < t.length; n++) {
                var group = t[n];
                group.editable = false;
                group.deleted = false;
                groups.push(group);
            }
            scope.groups = groups
        })
    }

    scope.resourceType = "image";
    controller("we7resource-base-controller", {
        $scope: scope
    });
    scope.accept = "image/gif, image/jpg, image/jpeg, image/bmp, image/png, image/ico";
    scope.uploadname = "上传图片";
    scope.multipleupload = true;
    scope.quality = 0; // 图片质量
    scope.netWorkurl = ""; // 需要下载到本地的远程url地址
    scope.groups = []; // 分组id
    new Date; // ??
    scope.year = "0";
    scope.month = "0";
    // 最近10年年份
    scope.years = function () {
        for (var year = (new Date).getFullYear(), lastYears = [], a = 0; a < 10; a++)
            lastYears.push(year - a);
        return lastYears
    }();
    // 12个月份
    scope.months = function () {
        for (var months = [], t = 1; t <= 12; t++)
            months.push(t);
        return months
    }();
    scope.selectedAllImage = false;
    scope.groupid = -1;
    scope.editable = false;
    scope.isLocal = function () {
        return 1 == scope.index
    };
    // 图片上传完成后回调函数
    scope.loadData = function () {
        loadGroupAndImages()
    };
    scope.onIndexChange = function (index) {
        if (2 != index) {
            loadGroupAndImages();
            getUploadUrl();
        }
    };
    scope.itemClick = function (image) {
        if (!scope.converting) {
            image.selected = !image.selected;
            var isSelectedAllImage = getSelectedImages().length == scope.images.length;
            scope.selectedAllImage = isSelectedAllImage
        }
    };
    scope.ok = function () {
        var t = getSelectedImages();
        if (t.length > 0) {
            if (!scope.multiple || scope.needConvert()) {
                t[0].selected = true;
                scope.convert(t[0]);
            } else {
                triggerResourceSelectedEvent(t);
            }
            return;
        }
        triggerResourceCanceledEvent();
    };

    getUploadUrl(); // 获取图片上传url

    scope.fetchNetwork = function () {
        netWorkconvert(scope.netWorkurl, 2 == scope.needType);
    };
    scope.$on("image_page_change", function (t, a) {
        scope.setCurrentPage(a);
    });
    scope.updateUploadUrl = function () {
        getUploadUrl();
    };
    scope.timeToDate = function (e) {
        return new Date(1e3 * e);
    };
    scope.getTitle = function (t) {
        return scope.isLocal ? t.filename : t.attachment;
    };
    scope.getImage = function (image) {
        return "url(" + image.url + ")";
    };
    /**
     * 按照年份和月份来检索资源
     */
    scope.search = function () {
        scope.currentPage = 1;
        loadGroupAndImages();
    };
    // 删除一个或多个图片
    scope.delSel = function () {
        var imageids = getSelectedImageIds(); // 获取选择图片

        if (0 != imageids.length) {

            if (imageids.length > 1 && !scope.isLocal()) { // 多张微信不行
                util.message("微信图片只支持单张删除")
            } else {
                if (scope.isLocal()) {// 如果是多张本地，如果是单张本地
                    a.delMuti(imageids, "image", scope.isLocal(), {
                        uniacid: scope.uniacid
                    }).then(function (e) {
                        util.message("删除成功");
                        loadGroupAndImages();
                    }, function (e) {
                        util.message(e.message);
                    });
                } else { // 单张微信
                    a.delItem(imageids[0], "image", scope.isLocal(), scope.uniacid).then(function (e) {
                        util.message("删除成功");
                        loadGroupAndImages();
                    }, function (e) {
                        util.message(e.message);
                    });
                }
            }
        } else {
            util.message("请选择要删除的图片");
        }
    }
    scope.selectedAll = function (isSelectedAllImage) {
        for (var a = 0; a < scope.images.length; a++)
            scope.images[a].selected = isSelectedAllImage;
    };
    // 加载所有分组资源
    scope.loadAll = function () {
        loadImagesByGroupId(-1);
    };
    // 加载未分组资源
    scope.loadNoGroup = function () {
        loadImagesByGroupId(0);
    };

    /**
     * 加载指定组的资源
     * @param group
     */
    scope.loadImages = function (group) {
        loadImagesByGroupId(group.id);
    };

    scope.addGroup = function (groupName) {
        var isLocal = 1 == scope.index;
        // a是serviceResource
        a.addGroup(groupName, isLocal).then(function (group) {
            scope.groups.push({
                name: groupName,
                id: group.id,
                editable: false,
                deleted: false,
                changed: false
            })
        })
    };
    scope.editGroup = function (group) {
        var isLocal = 1 == scope.index;
        // a是serviceResource
        a.changeGroup(group, isLocal).then(function (e) {
            console.log("changegroup");
        });
    };
    /**
     * 获取组内资源
     * @param group
     */
    scope.doEditGroup = function (group) {
        group.editable = !group.editable;
        scope.loadImages(group);
    };
    /**
     * 显示重命名组编辑框
     * @param group
     */
    scope.editing = function (group) {
        group.editing = true
    };
    /**
     * 确定重命名组
     * @param group
     */
    scope.edited = function (group) {
        group.editing = false;
        group.editable = false;
        scope.editGroup(group);
    };
    /**
     * 取消重命名组
     * @param group
     */
    scope.cancelEditing = function (group) {
        group.editing = false;
        group.editable = false;
    };
    /**
     * 添加分组，默认是未命名
     */
    scope.doAddGroup = function () {
        scope.addGroup("未命名")
    };
    /**
     * 删除分组
     * @param group
     */
    scope.delGroup = function (group) {
        $("#categoryEditModal").hide();
        group.deleted = true;
        var isLocal = 1 == scope.index;
        a.delGroup(group.id, isLocal).then(function (t) {
            console.log("删除分组成功");
            scope.loadAll() // 加载所有分组资源
        })
    };
    /**
     * 移动指定的资源到指定的组中
     * @param group
     */
    scope.moveToGroup = function (group) {
        var isLocal = 1 == scope.index
            , imageids = getSelectedImageIds();
        0 != imageids.length ? a.moveToGroup(imageids, group.id, isLocal).then(function (e) {
            util.message("移动成功");
            loadImagesByGroupId(group.id);
        }) : util.message("请选择图片后移动")
    };

    loadGroupAndImages();
}
]);

angular.module("we7resource").directive("we7ResourceKeywordDialog", function () {
    return {
        scope: {},
        restrict: "EA",
        templateUrl: "directive-keyword-keyword.html",
        link: function (e, t, a, n, i) {
            t.bind("click", "pagination li a", function (t) {
                var a = $(t.target).attr("page");
                a && e.$broadcast("keyword_page_change", a)
            })
        }
    }
});

angular.module("we7resource").controller("we7resource-keyword-controller", ["$scope", "$sce", "serviceResource", function (e, t, a) {
    e.keyword = "",
        e.currentId = "",
        e.currentPage = 1,
        e.itemClick = function (e) {
            e.selected = true,
                $(window).trigger("resource_selected", {
                    type: "keyword",
                    items: [e]
                })
        }
        ,
        e.$on("keyword_page_change", function (t, a) {
            e.setCurrentPage(a)
        }),
        e.setCurrentPage = function (t) {
            e.currentPage !== t && (e.currentPage = t,
                n())
        }
        ,
        e.search = function () {
            e.currentPage = 1,
                n()
        }
    ;
    var n = function () {
        a.getResources("keyword", e.currentPage, true, {
            keyword: e.keyword
        }).then(function (a) {
            e.keywords = a.items,
                e.pager = t.trustAsHtml(a.pager)
        })
    };
    n()
}
]);

angular.module("we7resource").directive("we7ResourceModuleDialog", ["$http", function (e) {
    return {
        scope: {},
        restrict: "EA",
        templateUrl: "directive-module-module.html",
        link: function (e, t, a, n, i) {
            t.bind("click", "pagination li a", function (t) {
                var a = $(t.target).attr("page");
                a && e.$broadcast("module_page_change", a)
            })
        }
    }
}
]);

angular.module("we7resource").controller("we7resource-module-controller", ["$scope", "$sce", "serviceResource", "config", function (e, t, a, n) {
    function i(e) {
        $(window).trigger("resource_selected", {
            type: "module",
            items: e
        })
    }

    function s() {
        $(window).trigger("resource_canceled")
    }

    function o() {
        a.getResources("module", e.currentPage, true, {
            keyword: e.keyword,
            user_module: r,
            mtype: c
        }).then(function (a) {
            e.modules = a.items,
                e.pager = t.trustAsHtml(a.pager)
        })
    }

    e.multiple = n.multiple,
        e.keyword = "";
    var r = 0
        , l = n.others
        , c = "";
    l && l.user_module && (r = 1),
    l && l.mtype && (c = l.mtype),
        e.itemClick = function (t) {
            if (e.multiple) {
                if (t.selected)
                    return void (t.selected = false);
                t.selected = true
            } else
                t.selected = true,
                    $(window).trigger("resource_selected", {
                        type: "module",
                        items: [t]
                    })
        }
        ,
        e.$on("module_page_change", function (t, a) {
            e.setCurrentPage(a)
        }),
        e.setCurrentPage = function (t) {
            e.currentPage != t && (e.currentPage = t,
                o())
        }
        ,
        e.search = function () {
            o()
        }
        ,
        e.ok = function () {
            var t = [];
            angular.forEach(e.modules, function (e, a) {
                e.selected && t.push(e)
            }),
                t.length > 0 ? i(t) : s()
        }
        ,
        o()
}
]);

angular.module("we7resource").directive("we7ResourceMusicDialog", function () {
    return {
        scope: {},
        restrict: "EA",
        replace: false,
        templateUrl: "directive-music-music.html"
    }
});

angular.module("we7resource").controller("we7resource-music-controller", ["$scope", "$sce", "serviceResource", "config", function (e, t, a, n) {
    e.needType = n.needType,
        e.multiple = n.multiple,
        e.showMusicForm = true,
        e.musicurl = "",
        e.selectVoice = function () {
            e.showMusicForm = false
        }
    ;
    var i = null;
    e.$on("selected_voice", function (t, a) {
        i = a,
            e.musicurl = a.attachment,
            e.showMusicForm = true
    }),
        e.$on("add_music", function (e, t) {
            $(window).trigger("resource_selected", {
                type: "music",
                items: [t]
            })
        })
}
]);

angular.module("we7resource").directive("we7ResourceNewsDialog", function () {
    return {
        scope: {},
        restrict: "EA",
        templateUrl: "directive-news-news.html",
        link: function (e, t, a, n, i) {
            t.bind("click", "pagination li a", function (t) {
                var a = $(t.target).attr("page");
                a && e.$broadcast("news_page_change", a)
            })
        }
    }
});

angular.module("we7resource").controller("we7resource-news-controller", ["$scope", "$sce", "serviceResource", "$controller", function (e, t, a, n) {
    function i() {
        a.getResources("news", e.currentPage, 1 == e.index, {
            keyword: e.keyword
        }).then(function (a) {
            e.news = a.items,
                e.pager = t.trustAsHtml(a.pager)
        })
    }

    e.resourceType = "news",
        n("we7resource-base-controller", {
            $scope: e
        }),
        e.keyword = "",
        e.canConvert = function (e) {
            return !e || !e.items || "" != e.items[0].author || "" != e.items[0].content
        }
        ,
        e.timeToDate = function (e) {
            return new Date(1e3 * e)
        }
        ,
        e.$on("news_page_change", function (t, a) {
            e.setCurrentPage(a)
        }),
        e.loadData = function () {
            i()
        }
        ,
        e.search = function () {
            e.currentPage = 1,
                i()
        }
        ,
        i()
}
]);

angular.module("we7resource").directive("we7ResourceVideoDialog", function () {
    return {
        scope: {},
        restrict: "EA",
        templateUrl: "directive-video-video.html",
        link: function (e, t, a, n, i) {
            t.bind("click", "pagination li a", function (t) {
                var a = $(t.target).attr("page");
                a && e.$broadcast("video_page_change", a)
            })
        }
    }
});

angular.module("we7resource").controller("we7resource-video-controller", ["$scope", "$sce", "serviceResource", "config", "$controller", function ($scope, $sce, a, config, $controller) {

    function getNetWorkUrl(netWorkurl) { //注意，这里的netWorkurl是可以包含iframe的通用代码
        if (/^<iframe/.test(netWorkurl)) {
            var url = "";
            /src=\"[^\s"]+/i.test(netWorkurl) && (url = netWorkurl.match(/src=\"[^\s"]+/i)[0].substr(5));
            netWorkurl = /http:\/\/|https:\/\//gi.test(url) ? url : "http://" + url;
        }
        return netWorkurl;
    }

    function getVideos() {
        a.getResources("video", $scope.currentPage, 1 == $scope.index).then(function (a) {
            $scope.videos = a.items;
            $scope.pager = $sce.trustAsHtml(a.pager);
        })
    }

    function getUploadUrl() {
        $scope.uploadurl = 0 === $scope.index ? "./index.php?c=utility&a=file&do=wechat_upload&upload_type=video&mode=perm&uniacid=" + $scope.uniacid : "./index.php?c=utility&a=file&do=upload&upload_type=video&global=" + $scope.global + "&dest_dir=" + $scope.dest_dir + "&uniacid=" + $scope.uniacid
    }

    $scope.resourceType = "video";
    $controller("we7resource-base-controller", {
        $scope: $scope
    });
    $scope.accept = "video/rm, video/rmvb, video/wmv, video/avi, video/mpg, video/mpeg, video/mp4";
    $scope.uploadname = "上传视频";
    $scope.multiupload = false;
    $scope.onIndexChange = function (e) {
        getVideos();
        getUploadUrl();
    };
    getUploadUrl();

    $scope.showNetWork = function () {
        return $scope.netWorkVideo;
    };
    $scope.loadData = function () {
        getVideos();
    };

    $scope.sceurl = function () {
        return $sce.trustAsResourceUrl($scope.netWorkurl)
    };

    $scope.canConvert = function (e) {
        return false
    };

    $scope.$on("video_page_change", function (t, a) {
        $scope.setCurrentPage(a)
    });

    $scope.getTitle = function (e) {
        return e.tag && e.tag.title ? e.tag.title : e.filename
    };

    $scope.fetchNetwork = function () {
        var t = {
            url: getNetWorkUrl($scope.netWorkurl),
            isRemote: true
        };
        triggerResourceSelectedEvent("video", [t])
    };

    $scope.timeToDate = function (e) {
        return new Date(1e3 * e)
    };

    var triggerResourceSelectedEvent = function (resourceType, selectedItems) {
        $(window).trigger("resource_selected", {
            type: "video",
            items: selectedItems
        })
    };
    getVideos();
}
]);

angular.module("we7resource").directive("we7ResourceVoiceDialog", function () {
    return {
        scope: {},
        restrict: "EA",
        templateUrl: "directive-voice-voice.html",
        link: function (e, t, a, n, i) {
            t.bind("click", "pagination li a", function (t) {
                var a = $(t.target).attr("page");
                a && e.$broadcast("voice_page_change", a)
            })
        }
    }
});

angular.module("we7resource").controller("we7resource-voice-controller", ["$scope", function (e) {
    e.$on("selected_voice", function (e, t) {
        t && !t.url && (t.url = t.attachment),
            $(window).trigger("resource_selected", {
                type: "voice",
                items: [t]
            })
    })
}
]);

/**
 * 为指定的模块定义资源服务serviceResource
 */
angular.module("we7resource").service("serviceResource", ["$rootScope", "$http", "$q", function ($rootScope, $http, a) {
    function n(page, queryparam) {
        return promise("keyword", page, true, queryparam)
    }

    function deferred(page, queryparam) {
        return promise("module", page, true, queryparam)
    }

    function promise(doMethod, page, isLocal, queryparam) {
        // a为$q
        var deferred = a.defer()
            , promise = deferred.promise
            ,
            url = "./index.php?c=utility&a=file&do=" + doMethod + "&page=" + page + "&local=" + (isLocal ? "local" : "wx") + o(queryparam);
        $http.get(url).then(function (response) {
            if (200 == response.status) {
                var message = response.data.message;
                if ("0" == message.errno) {
                    var items = message.message.items;
                    deferred.resolve({
                        pager: message.message.pager,
                        items: items
                    })
                }
            }
            deferred.resolve([]);
        }, function (e) {
            deferred.reject(e);
        });
        return promise;
    }

    function o(queryparam) {
        var querystring = "";
        angular.forEach(queryparam, function (value, key) {
            querystring += "&" + key + "=" + value
        });
        return querystring;
    }

    var serviceResource = {};
    serviceResource.getResources = function (type, page, a, queryparam) {
        var resources = null;
        switch (type) {
            case "keyword":
                resources = n(page, queryparam);
                break;
            case "module":
                resources = deferred(page, queryparam);
                break;
            case "video":
                resources = promise("video", page, a);
                break;
            case "news":
                resources = promise("news", page, a, queryparam);
                break;
            case "voice":
                resources = promise("voice", page, a, queryparam);
                break;
            case "image":
                resources = promise("image", page, a, queryparam)
        }
        return resources;
    };

    serviceResource.imageGroup = function (isLocal, queryparam) {
        var deferred = a.defer()
            , promise = deferred.promise
            , url = "./index.php?c=utility&a=file&do=group_list&local=" + (isLocal ? "local" : "wx") + o(queryparam);
        $http.get(url).then(function (response) {
            if (200 == response.status) {
                var message = response.data.message;
                if ("0" == message.errno)
                    return void deferred.resolve(message.message);
                deferred.reject({
                    state: false,
                    message: message.message
                })
            }
        });
        return promise;
    };

    serviceResource.addGroup = function (groupName, isLocal, queryparam) {
        var deferred = a.defer()
            , promise = deferred.promise
            , url = "./index.php?c=utility&a=file&do=add_group&local=" + (isLocal ? "local" : "wx") + o(queryparam);
        $http.post(url, {
            name: groupName
        }).then(function (response) {
            if (200 == response.status) {
                var message = response.data.message;
                if ("0" == message.errno)
                    return void deferred.resolve(message.message);
                deferred.reject({
                    state: false,
                    message: message.message
                })
            }
            deferred.reject({
                state: false,
                message: "添加失败"
            })
        }, function (e) {
            deferred.reject({
                state: false,
                message: "添加失败"
            })
        });
        return promise;
    };

    serviceResource.changeGroup = function (groupName, isLocal, queryparam) {
        var deferred = a.defer()
            , promise = deferred.promise
            , url = "./index.php?c=utility&a=file&do=change_group&local=" + (isLocal ? "local" : "wx") + o(queryparam);
        $http.post(url, {
            name: groupName.name,
            id: groupName.id
        }).then(function (response) {
            if (200 == response.status) {
                var message = response.data.message;
                if ("0" == message.errno)
                    return void deferred.resolve(message.message);
                deferred.reject({
                    state: false,
                    message: message.message
                })
            }
            deferred.reject({
                state: false,
                message: "更新失败"
            })
        }, function (e) {
            deferred.reject({
                state: false,
                message: "更新失败"
            })
        });
        return promise;
    };

    serviceResource.delGroup = function (groupId, isLocal, queryparam) {
        var deferred = a.defer()
            , promise = deferred.promise
            , url = "./index.php?c=utility&a=file&do=del_group&local=" + (isLocal ? "local" : "wx") + o(queryparam);
        $http.post(url, {
            id: groupId
        }).then(function (response) {
            if (200 == response.status) {
                var message = response.data.message;
                if ("0" == message.errno)
                    return void deferred.resolve(message.message);
                deferred.reject({
                    state: false,
                    message: message.message
                })
            }
            deferred.reject({
                state: false,
                message: "删除失败"
            })
        }, function (e) {
            deferred.reject({
                state: false,
                message: "删除失败"
            })
        });
        return promise;
    };

    serviceResource.moveToGroup = function (imageids, groupId, isLocal, queryparam) {
        var deferred = a.defer()
            , promise = deferred.promise
            , c = "./index.php?c=utility&a=file&do=move_to_group&local=" + (isLocal ? "local" : "wx") + o(queryparam);
        $http.post(c, {
            id: groupId,
            keys: imageids
        }).then(function (response) {
            if (200 == response.status) {
                var message = response.data.message;
                if ("0" == message.errno)
                    return void deferred.resolve(message.message);
                deferred.reject({
                    state: false,
                    message: message.message
                })
            }
            deferred.reject({
                state: false,
                message: "移动成功"
            })
        }, function (e) {
            deferred.reject({
                state: false,
                message: "移动失败"
            })
        });
        return promise;
    };

    serviceResource.delMuti = function (resourceIds, type, isLocal, queryparam) {
        var deferred = a.defer()
            , promise = deferred.promise
            , url = "./index.php?c=utility&a=file&do=delete&local=" + (isLocal ? "local" : "wx") + o(queryparam);
        $http.post(url, {
            id: resourceIds,
            type: type
        }).then(function (response) {
            if (200 == response.status) {
                var message = response.data.message;
                if ("0" == message.errno)
                    return void deferred.resolve(true);
                deferred.reject({
                    state: false,
                    message: message.message
                })
            }
            deferred.reject({
                state: false,
                message: "删除失败"
            })
        }, function (e) {
            deferred.reject({
                state: false,
                message: "删除失败"
            })
        });
        return promise;
    };

    serviceResource.delItem = function (material_id, type, isLocal, uniacid) {
        var deferred = a.defer()
            , promise = deferred.promise
            , isLocal = isLocal ? "local" : "wechat"
            , c = "./index.php?c=platform&a=material&do=delete&uniacid=" + uniacid;
        $http.post(c, {
            material_id: material_id,
            type: type,
            server: isLocal
        }).then(function (response) {
            if (200 == response.status) {
                var message = response.data.message;
                if ("0" == message.errno)
                    return void deferred.resolve(true);
                deferred.reject({
                    state: false,
                    message: message.message
                })
            }
            deferred.reject({
                state: false,
                message: "删除失败"
            })
        }, function (e) {
            deferred.reject({
                state: false,
                message: "删除失败"
            })
        });
        return promise;
    };

    /**
     * 本地服务器资源转换为微信服务器端或者反之
     * @param resource_id
     * @param type
     * @param isToLocal
     * @returns {*}
     */
    serviceResource.convert = function (resource_id, type, isToLocal) {
        var deferred = a.defer()
            , promise = deferred.promise
            ,
            url = "./index.php?c=utility&a=file&do=" + (isToLocal ? "tolocal" : "towechat") + "&type=" + type + "&resource_id=" + resource_id;
        $http.get(url).then(function (response) {
            if (200 == response.status) {
                var message = response.data.message;
                if (0 == message.errno) {
                    var message = message.message;
                    deferred.resolve(message)
                }
                1 == message.errno && deferred.reject(message.message)
            }
            deferred.resolve(null)
        }, function (e) {
            deferred.reject(e)
        });
        return promise;
    };

    serviceResource.netWorkconvert = function (remoteUrl, isNetworktolocal, resourceType) {
        var deferred = a.defer()
            , promise = deferred.promise
            ,
            url = "./index.php?c=utility&a=file&do=" + (isNetworktolocal ? "networktolocal" : "networktowechat") + "&url=" + encodeURIComponent(remoteUrl) + "&type=" + resourceType;
        $http.get(url).then(function (response) {
            if (200 == response.status) {
                var message = response.data.message;
                if (0 == message.errno) {
                    var message = message.message;
                    deferred.resolve(message)
                }
                1 == message.errno && deferred.reject(message.message)
            }
            deferred.resolve(null)
        }, function (e) {
            deferred.reject(e)
        });
        return promise;
    };

    return serviceResource;
}
]);

function we7ResourceMusicFormController($scope) {
    var that = this;
    that.music = {
        title: "",
        HQUrl: "",
        url: "",
        description: ""
    };

    that.$onInit = function () {
        that.music.url = that.musicurl
    };

    that.$onChanges = function (e) {
        that.music.url = e.musicurl.currentValue
    };

    that.selectVoice = function () {
        that.doselect()
    };

    that.ok = function () {
        if ("" != that.music.title) {
            if ("" != that.music.url) {
                $scope.$emit("add_music", that.music);
            } else {
                util.message("请选择媒体文件");
            }
        } else {
            util.message("标题不能为空");
        }
    }
}

we7ResourceMusicFormController.$inject = ["$scope"];
angular.module("we7resource").component("we7ResourceMusicform", {
    templateUrl: "widget-musicform-musicform.html",
    bindToController: true,
    controller: we7ResourceMusicFormController,
    bindings: {
        doselect: "&",
        musicurl: "<"
    }
});

UploadController.$inject = ["$scope", "$sce", "uiUploader", "$timeout"];
angular.module("we7resource").component("we7UploaderBtn", {
    templateUrl: "widget-upload-upload.html",
    controller: UploadController,
    transclude: true, // 告诉AngularJs去获取当前指令模版内部的所有内容，就是标签内的内容
    replace: true,
    bindings: { // 表示组件属性传入的值，<’代表单向，‘=’代表双向，&表示绑定方法
        name: "<",
        uploadUrl: "<",
        accept: "<",
        onUploading: "&",
        onUploaded: "&",
        onUploadError: "&",
        onProgress: "&",
        multiple: "<"
    }
});

function UploadController($scope, $sce, uiUploader, $timeout) {
    // 异步修改变量值
    function setUploading(isUploading) {
        $timeout(function () {
            $scope.uploading = isUploading
        })
    }

    function startUpload(files) {
        if (!that.uploading) {
            var file = files[0];
            that.filename = file.name;
            that.filesize = parseInt(file.size / 1024);
            that.files = files;
            setUploading(true); // 正在上传
            var uploadUrl = that.uploadUrl;
            uiUploader.upload(files, uploadUrl, {
                onProgress: progress // 通过这里传入进度回调函数到XMLHttpRequest.upload.onprogress
            }).then(function (response) {
                var t = JSON.parse(response);
                setUploading(false); // 上传完成
                registerChangeEvent();
                if (t.message && "" != t.message) {
                    that.onUploadError({
                        mes: t.message
                    });
                } else {
                    that.onUploaded();
                }
            }, function (e) {
                registerChangeEvent();
                setUploading(false);
                that.onUploadError("");
            })
        }
    }

    /**
     * 传递给XMLHttpRequest.upload.onprogress的进度函数
     * @param file
     */
    function progress(file) {
        var progress = parseInt(file.loaded / file.total * 100);
        file.filename = file.name;
        file.filesize = parseInt(file.size / 1024);
        file.progress = progress;
        that.onProgress({ // 这里的onProgress是通过we7-uploader-btn组件属性绑定的函数
            file: file,
            progress: progress
        });
        // 异步修改变量值
        $timeout(function () {
            $scope.progress = progress;
        });
    }

    // 初始化控制器时就注册change事件
    function registerChangeEvent() {
        var dom = document.getElementById("we7resourceFile");
        dom.value = null;
        dom.addEventListener("change", function (event) {
            startUpload(event.target.files);
        });
    }

    var that = this; // UploadController对象
    that.currentFile = null;
    $scope.uploading = true;
    that.uploadProgress = 0;
    that.$onInit = function () {
    }
    if (document.addEventListener) {
        document.addEventListener("dragenter", function (event) {
            event.stopPropagation();
            event.preventDefault();
        }, false);
        document.addEventListener("dragover", function (event) {
            event.stopPropagation();
            event.preventDefault();
        }, false);
        document.getElementById("material-Modal").addEventListener("drop", function (event) {
            event.stopPropagation();
            event.preventDefault();
            startUpload(event.dataTransfer.files);
        });
    }
    registerChangeEvent();
}

function uiUploader($log, $q) {

    function addFiles(files) {
        for (var t = 0; t < files.length; t++)
            that.files.push(files[t])
    }

    function startUpload(options) {
        that.options = options;
        for (var headers = options.headers || {}, options = options.options || {}, n = 0; n < that.files.length && that.activeUploads != that.options.concurrency; n++)
            that.files[n].active || sendRequest(that.files[n], that.options.url, that.options.data, that.options.paramName, headers, options)
    }

    function removeFile(e) {
        that.files.splice(that.files.indexOf(e), 1)
    }

    function humanSize(fileSize) {
        var units = ["n/a", "bytes", "KiB", "MiB", "GiB", "TB", "PB", "EiB", "ZiB", "YiB"]
            , a = 0 === fileSize ? 0 : +Math.floor(Math.log(fileSize) / Math.log(1024));
        return (fileSize / Math.pow(1024, a)).toFixed(a ? 1 : 0) + " " + units[isNaN(fileSize) ? 0 : a + 1]
    }

    function sendRequest(uploadFileInfo, requestUrl, param, filedName, requestHeader, options) {
        var XMLHttpRequest, formData, name;
        param = param || {};
        filedName = filedName || "file";
        that.activeUploads += 1;
        uploadFileInfo.active = true;
        XMLHttpRequest = new window.XMLHttpRequest;
        if (true === options.withCredentials) {
            XMLHttpRequest.withCredentials = true
        }
        formData = new window.FormData;
        XMLHttpRequest.open("POST", requestUrl);
        if (requestHeader) {
            for (var name in requestHeader) {
                if (requestHeader.hasOwnProperty(name)) {
                    XMLHttpRequest.setRequestHeader(name, requestHeader[name]);
                }
            }
        }
        // 上传开始
        XMLHttpRequest.upload.onloadstart = function () {
        };
        // 上传过程
        XMLHttpRequest.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                uploadFileInfo.loaded = event.loaded;
                uploadFileInfo.total = event.total;
                uploadFileInfo.humanSize = humanSize(event.loaded);
                // 这里调用进度回调函数
                angular.isFunction(that.options.onProgress) && that.options.onProgress(uploadFileInfo);
            }
        };
        // 上传完成
        XMLHttpRequest.upload.onload = function () {
            angular.isFunction(that.options.onUploadSuccess) && that.options.onUploadSuccess(uploadFileInfo)
        };
        // 上传错误
        XMLHttpRequest.upload.onerror = function (e) {
            angular.isFunction(that.options.onError) && that.options.onError(e)
        };
        // 请求完成，当上传完成后也会调用该方法
        XMLHttpRequest.onload = function () {
            that.activeUploads -= 1;
            that.uploadedFiles += 1;
            startUpload(that.options);

            angular.isFunction(that.options.onCompleted) && that.options.onCompleted(uploadFileInfo, XMLHttpRequest.responseText, XMLHttpRequest.status);
            if (0 === that.activeUploads) {
                that.uploadedFiles = 0;
                angular.isFunction(that.options.onCompletedAll) && that.options.onCompletedAll(that.files);
            }
        };

        if (param) {
            for (name in param) {
                param.hasOwnProperty(name) && formData.append(name, param[name]);
            }
        }
        formData.append(filedName, uploadFileInfo, uploadFileInfo.name);
        XMLHttpRequest.send(formData);
        return XMLHttpRequest;
    }

    var that = this;
    that.files = [];
    that.options = {};
    that.activeUploads = 0; // 正在上传数量
    that.uploadedFiles = 0; // 已经上传数量

    return {
        addFiles: addFiles,
        getFiles: function () {
            return that.files
        },
        files: that.files,
        startUpload: startUpload,
        removeFile: removeFile,
        removeAll: function () {
            that.files.splice(0, that.files.length)
        },
        upload: function (files, uploadUrl, options) {
            var deferred = $q.defer();
            addFiles(files);
            startUpload({
                url: uploadUrl,
                oncurrency: 5,
                onProgress: function (uploadFileInfo) {
                    options.onProgress && options.onProgress(uploadFileInfo)
                },
                onCompleted: function (uploadFileInfo, responseText) {
                    removeFile(uploadFileInfo);
                    deferred.resolve(responseText);
                }
            });
            return deferred.promise;
        }
    }
}

uiUploader.$inject = ["$log", "$q"];
// 这里uiUploader是前面的函数
angular.module("we7resource").service("uiUploader", ["$log", "$q", uiUploader]);

function VoiceController(e, t, a, n) {
    function i() {
        a.getResources("voice", e.currentPage, 1 == e.index).then(function (e) {
            o.voices = e.items,
                o.pager = t.trustAsHtml(e.pager)
        })
    }

    function s() {
        e.uploadurl = 0 === e.index ? "./index.php?c=utility&a=file&do=wechat_upload&upload_type=audio&mode=perm&uniacid=" + e.uniacid : "./index.php?c=utility&a=file&do=upload&upload_type=audio&global=" + e.global + "&dest_dir=" + e.dest_dir + "&uniacid=" + e.uniacid
    }

    e.resourceType = "voice",
        n("we7resource-base-controller", {
            $scope: e
        }),
        e.uploadname = "上传语音",
        e.accept = "audio/amr,audio/mp3,audio/wma,audio/wmv,audio/amr";
    var o = this;
    o.$onInit = function () {
        o.multiple = false
    }
        ,
        o.itemClick = function (t) {
            if (!o.multiple)
                return e.needConvert() ? void util.message("当前资源无法选择") : t.selected ? void (t.selected = false) : (t.selected = true,
                    void e.$emit("selected_voice", t))
        }
        ,
        e.canConvert = function (e) {
            return false
        }
        ,
        e.loadData = function () {
            i()
        }
        ,
        e.onIndexChange = function (e) {
            i(),
                s()
        }
        ,
        s(),
        e.$on("voice_page_change", function (t, a) {
            e.setCurrentPage(a)
        }),
        o.timeToDate = function (e) {
            return new Date(1e3 * e)
        }
        ,
        o.getTitle = function (e) {
            return o.isWechat ? e.attachment : e.filename
        }
        ,
        i()
}

VoiceController.$inject = ["$scope", "$sce", "serviceResource", "$controller"];
angular.module("we7resource").component("we7ResourceVoice", {
    templateUrl: "widget-voice-voice.html",
    controller: VoiceController,
    transclude: true,
    bindings: {
        isWechat: "<",
        showType: "<"
    }
});