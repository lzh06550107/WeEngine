define([], function () {
    return {
        defaultoptions: {
            callback: null, // 上传完成后回调函数
            type: "image", // 上传资源类型
            isWechat: false, // 是否是上传图片到微信
            multiple: false, // 单选还是多选
            showType: 3,
            needType: 3,
            global: false, // 是否放置在attachment/images/global目录中
            dest_dir: "", //
            otherVal: "",
            others: {},
            uniacid: -1, // 统一帐号id
            netWorkVideo: false
        },
        init: function (callback, options) {
            var that = this;
            that.options = $.extend({}, that.defaultoptions, options);
            "audio" == that.options.type && (that.options.type = "voice");
            that.options.callback = callback; // 把回调函数放到选项中
            $("#material-Modal").remove();
            var type = that.options.type, html = that.buildHtml(type);
            $(document.body).prepend(html);
            that.modalobj = $("#material-Modal"); // 获取得到的模态框对象
            that.registerSelected();
            angular.module("we7resource").value("config", that.options); // 定义config为配置值
            angular.bootstrap(that.modalobj, ["we7resource"]);
            that.modalobj.modal("show");
            return that.modalobj;
        },
        show: function (callback, options) {
            this.init(callback, options);
        },
        registerSelected: function () { // 注册资源选择和取消事件动作
            var that = this;
            $(window).unbind("resource_selected").on("resource_selected", function (event, selected) { // 点击确定触发
                that.finish(selected.items)
            });
            $(window).unbind("resource_canceled").on("resource_canceled", function (event, i) { // 点击取消触发
                that.modalobj.modal("hide")
            });
        },
        finish: function (items) {
            var that = this;
            if($.isFunction(that.options.callback)) {
                //如果选择单个资源，则传入一个资源，否则传入所有选择的资源到回调函数
                false == that.options.multiple ? that.options.callback(items[0]) : that.options.callback(items);
                that.modalobj.modal("hide");
            }
        },
        buildHtml: function (type) {
            var directive = "we7-resource-" + type + "-dialog" // 这是属性指令对应指令名称为we7Resource[Type]Dialog
                , i = type;
            "icon" == type && (i = "module");
            return "<div " + directive + ' class="uploader-modal modal fade ' + i + '" id="material-Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2"></div>';
        }
    }
});
