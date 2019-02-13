require.config({
    baseUrl: "resource/js/app",
    urlArgs: "v=" + (new Date).getHours(),
    paths: {
        map: "https://api.map.baidu.com/getscript?v=2.0&ak=F51571495f717ff1194de02366bb8da9&services=&t=20140530104353",
        css: "../../../../web/resource/js/lib/css.min",
        angular: "../../../../web/resource/js/lib/angular.min",
        underscore: "../../../../web/resource/js/lib/underscore.min",
        moment: "../../../../web/resource/js/lib/moment",
        bootstrap: "../../../../web/resource/js/lib/bootstrap.min",
        hammer: "../lib/hammer.min",
        webuploader: "../../../../web/resource/components/webuploader/webuploader.min",
        jquery: "../../../../web/resource/js/lib/jquery-1.11.1.min",
        "jquery.jplayer": "../../../../web/resource/components/jplayer/jquery.jplayer.min",
        "jquery.qrcode": "../../../../web/resource/js/lib/jquery.qrcode.min",
        "mui.datepicker": "../../components/datepicker/mui.picker.all",
        "mui.districtpicker": "../../components/districtpicker/mui.city.data-3",
        daterangepicker: "../../components/daterangepicker/daterangepicker",
        datetimepicker: "../../components/datetimepicker/bootstrap-datetimepicker.min",
        "mui.pullrefresh": "../../components/pullrefresh/mui.pullToRefresh.material",
        previewer: "../../components/previewer/mui.previewimage",
        cropper: "../../components/cropper/cropper.min",
        swiper: "../../components/swiper/swiper.min"
    },
    shim: {
        bootstrap: {
            exports: "$",
            deps: ["jquery"]
        },
        angular: {
            exports: "angular",
            deps: ["jquery"]
        },
        hammer: {
            exports: "hammer"
        },
        daterangepicker: {
            exports: "$",
            deps: ["bootstrap", "moment", "css!../../components/daterangepicker/daterangepicker.css"]
        },
        datetimepicker: {
            exports: "$",
            deps: ["bootstrap", "css!../../components/datetimepicker/bootstrap-datetimepicker.min.css"]
        },
        map: {
            exports: "BMap"
        },
        webuploader: {
            deps: ["jquery", "css!../../../../web/resource/components/webuploader/webuploader.css", "css!../../../../web/resource/components/webuploader/style.css"]
        },
        "jquery.jplayer": {
            exports: "$",
            deps: ["jquery"]
        },
        "jquery.qrcode": {
            exports: "$",
            deps: ["jquery"]
        },
        "mui.datepicker": {
            deps: ["mui", "css!../../components/datepicker/mui.picker.all.css"],
            exports: "mui.DtPicker"
        },
        "mui.districtpicker": {
            deps: ["mui", "mui.datepicker"],
            exports: "cityData3"
        },
        "mui.pullrefresh": {
            deps: ["./resource/components/pullrefresh/mui.pullToRefresh.js"],
            exports: "mui"
        },
        previewer: {
            deps: ["./resource/components/previewer/mui.zoom.js"],
            exports: "mui"
        },
        cropper: {
            deps: ["css!../../components/cropper/cropper.min.css"]
        }
    }
});
