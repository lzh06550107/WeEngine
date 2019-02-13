/**
 * 刷新视窗
 */
function resizeView() {
    var clientHeight = document.documentElement.clientHeight
        , footerHeight = $(".footer").length > 0 ? $(".footer").css("height") : 0
        , leftMenuContentHeight = $(".left-menu-content").length > 0 ? $(".left-menu-content").css("height") : 0
        , footerWidth = $(".footer").length > 0 ? $(".footer").width() : 0
        , rightContentWidth = $(".right-content").length > 0 ? $(".right-content").width() : 0;

    if (2 == $(".left-menu, .right-content").length && footerWidth != rightContentWidth - 1) {
        $(".footer").length > 0 ? $(".footer").hide() : $(".footer").show();
    }

    $(".main-panel-body,.panel-cut").css("min-height", clientHeight - 100);
    $(".caret-wxapp .panel-app").css("min-height", clientHeight - 95);

    if (parseInt(leftMenuContentHeight) > clientHeight - 50) {
        $(".skin-black .right-content>.content").css("min-height", parseInt(leftMenuContentHeight) - parseInt(footerHeight) - 30 + "px");
    } else {
        $(".skin-black .right-content>.content").css("min-height", clientHeight - parseInt(footerHeight) - 93 + "px");
    }
    $(".link-group").each(function () {
        var e = $(this).children("a").length;
        $(this).css("min-width", 100 * e + 10)
    });
}

$(function () {
    // 切换屏幕大小
    function changeScreen() {
        if (true == util.cookie.get("main-lg")) {
            $(".skin-default").addClass("main-lg-body");
            $(".js-big-main").text("正常");
        } else {
            $(".skin-default").removeClass("main-lg-body");
            $(".js-big-main").text("宽屏");
        }
    }

    // 显示message cookie中信息
    util.cookie_message();
    // 设置__lastvisit_ cookie来保存最后一次访问的页面
    window.sysinfo.uid && util.cookie.set("__lastvisit_" + window.sysinfo.uid, [window.sysinfo.uniacid, window.sysinfo.siteurl], 604800);

    // 复制到剪切板
    $(".js-clip").each(function () {
        util.clip(this, $(this).attr("data-url"))
    });

    /**
     * bootstrap提示工具（Tooltip）插件不像之前所讨论的下拉菜单及其他插件那样，它不是纯 CSS 插件。如需使用该插件，您必须使用 jquery 激活它（读取 javascript）。使用下面的脚本来启用页面中的所有的提示工具（tooltip）
     *
     * 弹出框（Popover）插件不像之前所讨论的下拉菜单及其他插件那样，它不是纯 CSS 插件。如需使用该插件，您必须使用 jquery 激活它（读取 javascript）。使用下面的脚本来启用页面中的所有的弹出框（popover）
     */
    if ($.fn.tooltip) {
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="dropdown"]').dropdown();
        $('[data-toggle="popover"]').popover();
    }

    // 对于加载失败的图片，使用默认图片
    $("img").error(function () {
        if (!$(this).attr("onerror")) {
            var src = "resource/images/nopic-107.png";
            if ($(this).width() == $(this).height()) {
                src = "resource/images/nopic-107.png";
            } else if ($(this).width() < $(this).height()) {
                src = "resource/images/nopic-203.png";
            }
            $(this).attr("src", src);
        }
    });

    if (window.sysinfo.module && window.sysinfo.module.name) {
        if (null === util.cookie.get("module_status:" + window.sysinfo.module.name) || null === util.cookie.get("module_status:" + window.sysinfo.module.name)) {
            $.getJSON("./index.php?c=module&a=manage-account&do=check_status&module=" + window.sysinfo.module.name, function (response) {

                if (1 == response.message.errno || 2 == response.message.errno && 1 == window.sysinfo.isfounder) {
                    $(".head").after('<div class="system-tips we7-body-alert"><div class="container text-right"> <span class="alert-info"><a href="javascript:;">' + response.message.message + "</a></span></div></div>");
                }
            });
        } else {
            module_status = util.cookie.get("module_status:" + window.sysinfo.module.name);
            module_status = $.parseJSON(module_status);

            if (1 == module_status.ban) {
                $(".head").after('<div class="system-tips we7-body-alert"><div class="container text-right"> <span class="alert-info"><a href="javascript:;">您的站点存在盗版模块, 请删除文件后联系客服</a></span></div></div>');
            } else if (1 == module_status.upgrade.upgrade && 1 == window.sysinfo.isfounder) {
                $(".head").after('<div class="system-tips we7-body-alert"><div class="container text-right"> <span class="alert-info"><a href="javascript:;">【' + module_status.upgrade.name + "】检测最新版为" + module_status.upgrade.version + "，请尽快更新！</a></span></div></div>");
            }
        }
    }

    $(".js-big-main").click(function () {
        var t = $(".skin-default").hasClass("main-lg-body") ? "0" : "1";
        util.cookie.set("main-lg", t);
        changeScreen();
    });

    // 读取通知消息
    if (window.sysinfo.uid) {
        var dataObj = new Date;
        $.getJSON("./index.php?c=message&a=notice&do=event_notice", function (response) {
            var html = "";

            if (0 == response.message.errno && response.message.message.total) {
                html += '<a href="javascript:;" class="dropdown-toogle" data-toggle="dropdown"><span class="wi wi-bell"><span class="badge">' + response.message.message.total + "</span></span> </a>";
                html += '<div class="dropdown-menu"><div class="clearfix top">消息<a href="./index.php?c=message&a=notice" class="pull-right">查看更多</a><a href="./index.php?c=message&a=notice&do=all_read" class="pull-right" style="margin-right: 5px">全部已读</a></div><div class="msg-list-container"><div class="msg-list">';
                $.each(response.message.message.lists, function (e, notice) {
                    html += '<div class="item"><div class="info clearifx"><div class="pull-right date">' + notice.create_time + "</div>";
                    1 == notice.type && (html += "来自 <span>订单消息</span>");
                    2 != notice.type && 5 != notice.type || (html += "来自 <span>过期消息</span>");
                    4 == notice.type && (html += "来自 <span>注册消息</span>");
                    3 == notice.type && (html += "来自 <span>工单消息</span>");
                    8 == notice.type && (html += "来自 <span>小程序升级模块消息</span>");
                    html += '</div><div class="msg-content">';
                    html += "<a href=" + notice.url + ">" + notice.message + "</a>";
                    html += "</div></div>";
                });
                html += "</div></div></div>";
                $(".header-notice").html(html);
            }

            var currentTime = parseInt(dataObj.getTime() / 1e3)
                , expire = 21600 + Math.ceil(1800 * Math.random())
                , s = currentTime + expire;
            util.cookie.set("__notice", s, expire); //??什么鬼
        });
    }
});

window.UEDITOR_HOME_URL = "./resource/components/ueditor/";

$(function () {

    if (1 == $("[data-skin='black']").length) {
        resizeView();
    }

    if (3 == $(".menu-fixed, .left-menu, .right-content").length) {
        require(["slimscroll"], function () {
            $(".plugin-menu-sub").slimscroll({
                width: "210px",
                height: "100%",
                opacity: .4,
                color: "#aaa"
            })
        });

        var clientHeight = document.documentElement.clientHeight
            , $leftMenu = $(".left-menu")
            , top = $leftMenu.offset().top
            , position = $leftMenu.css("position")
            , footerHeight = $(".footer").length > 0 ? $(".footer").css("height") : 0;

        if ("default" == $(".skin-default").attr("data-skin")) {
            $(".left-menu, .skin-default .right-content").css("min-height", clientHeight - 174 - parseInt(footerHeight) + "px");
        } else if ("black" == $(".skin-black").attr("data-skin")) {
            $(".left-menu, .skin-default .right-content").css("min-height", clientHeight - 51 + "px");
        }

        $(window).scroll(function () {
            var footerTop = $(".footer").length > 0 && !$(".footer").is(":hidden") ? $(".footer").offset().top : 0
                , documentScrollTop = $(document).scrollTop()
                , o = footerTop ? footerTop - documentScrollTop : clientHeight;

            if ("default" == $(".skin-default").attr("data-skin")) {

                documentScrollTop > top ? $leftMenu.css({
                    position: "fixed",
                    height: "auto",
                    top: 0,
                    bottom: clientHeight > o ? clientHeight - o + 31 + "px" : "0"
                }) : $leftMenu.css({
                    position: position,
                    height: clientHeight
                });
                documentScrollTop > top ? $(".right-content").css({
                    marginLeft: $leftMenu.css("width")
                }) : $(".right-content").css({
                    marginLeft: 0,
                    minHeight: $leftMenu.height()
                });
            } else if ("black" == $(".skin-black").attr("data-skin")) {
                documentScrollTop > top ? $leftMenu.css({
                    position: "fixed",
                    top: 0,
                    bottom: 0
                }) : $leftMenu.css({
                    position: position,
                    top: documentScrollTop
                });
                documentScrollTop > top ? $(".right-content").css({
                    marginLeft: $leftMenu.css("width")
                }) : $(".right-content").css({
                    marginLeft: 0,
                    minHeight: $leftMenu.height()
                });
            }
        })
    }

    if (1 == $("[data-skin='classical']").length) {
        var e = document.documentElement.clientHeight
            , i = $(".footer").length > 0 ? $(".footer").css("height") : 0;
        2 == $(".left-menu, .right-content").length && $(".right-content>.content").css("min-height", e - parseInt(i) - 71),
        $(".panel-cut").length > 0 && $(".panel-cut").css("min-height", e - parseInt(i) - 71)
    }
});
