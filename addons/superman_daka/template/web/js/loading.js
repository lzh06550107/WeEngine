define(['jquery','iosOverlay','spin'], function($,iosOverlay,Spinner){
    var iosLoading = {
        'loading' : function(){
            var target = document.createElement("div");
            document.body.appendChild(target);
            var spinner = new Spinner().spin(target);
            iosOverlay({
                text: '',
                duration: 500,
                spinner: spinner
            });
        },
        'success' : function(){
            iosOverlay({
                text: "加载完成!",
                duration: 2000,
                icon: '../addons/superman_mall/template/web/wechat/images/check.png'
            });
        },
        'fail' : function(obj = '加载失败'){
            iosOverlay({
                text: obj,
                duration: 2000,
                icon: '../addons/superman_mall/template/web/wechat/images/cross.png'
            });
        }
    };
    return iosLoading;
});