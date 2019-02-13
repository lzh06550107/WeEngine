angular.module("storeApp", ["we7app"]);

angular.module("storeApp").controller("goodsSellerCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.status = a.status,
        e.moduleList = a.moduleList,
        e.keyword = "",
        e.selectedModule = "",
        e.visitTimes = 0,
        e.visitPrice = 0,
        e.showModule = function () {
            $("#add_module").modal("show")
        }
        ,
        e.selectModule = function (t, a) {
            $(a.target).parents(".select-module").find(".item").addClass("active"),
                $(a.target).parents(".select-module").siblings().find(".item").removeClass("active"),
                e.selectedModule = t
        }
        ,
        e.editPrice = function (n) {
            switch (n) {
                case "add_module":
                    t.post(a.links.add, {
                        module: e.selectedModule,
                        toedit: true
                    }).success(function (e) {
                        0 == e.message.errno ? location.href = a.links.post + "&id=" + e.message.message : util.message(e.message.message)
                    });
                    break;
                case "add_api":
                    t.post(a.links.add, {
                        title: "API商品",
                        visit_times: e.visitTimes,
                        price: e.visitPrice,
                        online: true
                    }).success(function (e) {
                        0 == e.message.errno ? location.href = a.links.online : util.message(e.message.message)
                    })
            }
        }
        ,
        e.toOffline = function (n) {
            switch (n) {
                case "add_module":
                    t.post(a.links.add, {
                        module: e.selectedModule
                    }).success(function (e) {
                        0 == e.message.errno ? location.href = a.links.offline : util.message(e.message.message)
                    });
                    break;
                case "add_api":
                    t.post(a.links.add, {
                        title: "API商品",
                        visit_times: e.visitTimes,
                        price: e.visitPrice
                    }).success(function (e) {
                        0 == e.message.errno ? location.href = a.links.offline : util.message(e.message.message)
                    })
            }
        }
}
]);

angular.module("storeApp").controller("goodsPostCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.slideLists = [],
        e.goodsInfo = a.goodsInfo,
        e.goodsInfo ? (e.unit = e.goodsInfo.unit,
            e.slideLists = e.goodsInfo.slide,
            $("#description").html(e.goodsInfo.description)) : e.unit = "month",
        e.changeUnit = function (t) {
            e.unit = t,
                $('[name="unit"]').val(t)
        }
        ,
        e.addSlide = function () {
            require(["fileUploader"], function (t) {
                t.init(function (t) {
                    e.slideLists.push(t.url),
                        e.$apply(e.slideLists)
                }, {
                    direct: true,
                    multiple: false,
                    uniacid: 0
                })
            })
        }
        ,
        e.delSlide = function (t) {
            e.slideLists.splice(t, 1)
        }
}
]);

angular.module("storeApp").controller("storePaySettingCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.alipay = a.alipay
}
]);

angular.module("storeApp").controller("storeOrdersCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.orderList = a.orderList,
        e.role = a.role,
        e.links = a.links,
        e.newPrice = [],
        e.showChangePriceModal = function (t) {
            $("#change-price").modal("show");
            var t = parseInt(t);
            e.newPrice.orderid = t
        }
        ,
        e.changePrice = function () {
            t.post(a.links.changePrice, {
                id: e.newPrice.orderid,
                price: e.newPrice.price
            }).success(function (e) {
                0 == e.message.errno ? util.message(e.message.message, e.redirect, "success") : util.message(e.message.message)
            })
        }
}
]);

angular.module("storeApp").controller("goodsBuyerCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.duration = 1,
        e.unit = a.unit,
        e.expiretime = a.expiretime,
        e.singlePrice = a.singlePrice,
        e.price = a.singlePrice,
        e.account_list = a.account_list,
        e.wxapp = a.wxapp,
        e.wxapp_account_list = a.wxapp_account_list,
        e.uniacid = a.first_uniacid,
        e.goods = a.goods,
        e.pay_way_list = a.pay_way,
        0 == e.pay_way_list.length ? e.pay_way = "" : e.pay_way = e.pay_way_list.alipay ? "alipay" : "wechat",
        e.changePayWay = function (t) {
            e.pay_way = t
        }
        ,
        e.changeDuration = function (t) {
            e.duration = t
        }
        ,
        e.submit_order = function (n) {
            var i = {
                uniacid: e.uniacid,
                price: a.singlePrice,
                goodsid: e.goods.id,
                duration: e.duration,
                type: e.pay_way,
                wxapp: e.wxapp
            };
            t.post("./index.php?c=site&a=entry&m=store&do=goodsbuyer&operate=submit_order&direct=1", i).success(function (e) {
                if (0 != e.message.errno)
                    return util.message(e.message.message),
                        false;
                location.href = "./index.php?c=site&a=entry&m=store&do=goodsbuyer&operate=pay_order&direct=1&orderid=" + e.message.message,
                    location.href = "order" == n ? "./index.php?c=site&a=entry&m=store&do=orders&direct=1" : "./index.php?c=site&a=entry&m=store&do=goodsbuyer&operate=pay_order&direct=1&orderid=" + e.message.message
            })
        }
        ,
        e.changeExpire = function (a, n) {
            a = "" == a || void 0 == a ? e.duration : a,
                n = "" == n || void 0 == n ? e.uniacid : n,
                t.post("./index.php?c=site&a=entry&operate=change_order_expire&direct=1&do=changeorderexpire&m=store", {
                    duration: a,
                    unit: e.unit,
                    uniacid: n,
                    goodsid: e.goods.id
                }).success(function (t) {
                    0 == t.message.errno && (e.expiretime = t.message.message,
                        e.price = e.singlePrice * a)
                })
        }
        ,
        e.$watch("duration", function (e, t, a) {
            a.changeExpire(e, "")
        }),
        e.$watch("uniacid", function (e, t, a) {
            a.changeExpire("", e)
        })
}
]);

angular.module("storeApp").controller("storePermissionCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.blacklist = a.blacklist,
        e.whitelist = a.whitelist,
        e.permissionStatus = a.permissionStatus,
        e.addUsername = "",
        e.changeType = function (t) {
            "close" != t || e.permissionStatus.close ? e.type = t : confirm("确定要关闭权限设置吗？如若这样做，所有系统用户都可访问商城！") && (e.type = t,
                e.changeStatus())
        }
        ,
        e.changeStatus = function () {
            t.post(a.links.changeStatus, {
                type: e.type
            }).success(function (t) {
                console.log(t),
                    0 == t.message.errno ? "close" == e.type ? (e.permissionStatus.close = true,
                        util.message(t.message.message)) : util.message(t.message.message, t.redirect, "success") : util.message(t.message.message)
            })
        }
        ,
        e.addUser = function () {
            t.post(a.links.addUser, {
                type: e.type,
                username: e.addUsername
            }).success(function (t) {
                e.addUsername = "",
                    0 == t.message.errno ? util.message(t.message.message, t.redirect, "success") : util.message(t.message.message)
            })
        }
        ,
        e.deleteUser = function (n) {
            t.post(a.links.deleteUser, {
                type: e.type,
                username: n
            }).success(function (e) {
                0 == e.message.errno ? util.message(e.message.message, e.redirect, "success") : util.message(e.message.message)
            })
        }
        ,
        e.changeType(a.type)
}
]);