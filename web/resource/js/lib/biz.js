define([], function () {
    var biz = {};
    biz.user = {};
    biz.user.browser = function (uids, callback, options) {
        var mode = "visible";
        options && options.mode && (mode = options.mode);
        var i = "0";
        $.isArray(uids) && uids.length > 0 && (i = uids.join());
        $("#user-browser-dialog")[0] && $("#user-browser-dialog").remove();
        var url = "./index.php?c=utility&a=user&do=browser&callback=aMember&mode=" + mode + "&uids=" + i,
            dialog = util.dialog("请选择用户", "数据加载中......", '<button type="button" class="btn btn-default" data-dismiss="modal">取消</button><button type="button" class="btn btn-primary">确认</button>', {containerName: "user-browser-dialog"});
        dialog.modal("show");
        dialog.on("shown.bs.modal", function () {
            window.aMember.pIndex = 1;
            window.aMember.query();
        });
        dialog.find(".modal-footer .btn-primary").click(function () {
            var uids = [], r = $(".user-browser .btn-primary");
            if(r.length > 0) {
                r.each(function () {
                    uids.push($(this).attr("js-uid"));
                });
                $.isFunction(callback) && (callback(uids), dialog.modal("hide"));
            }
        });
        window.aMember = {
            pIndex: 1,
            query: function () {
                var data = {
                    keyword: $("#keyword").val(),
                    page: aMember.pIndex,
                    callback: "aMember",
                    mode: mode,
                    uids: i
                };
                $.post(url, data, function (e) {
                    dialog.find(".modal-body").html(e);
                    options.direct && dialog.find(".js-btn-select").click(function () {
                        dialog.find(".modal-footer .btn-primary").trigger("click");
                    });
                    dialog.find(".pagination a").click(function () {
                        window.aMember.pIndex = $(this).attr("page");
                        window.aMember.query();
                    });
                })
            }
        }
    };
    return biz;
});