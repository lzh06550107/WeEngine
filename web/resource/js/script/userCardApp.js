
angular.module("userCardApp", ["wapeditorApp"]).controller("MainCtrl", ["$scope", "widget", "config", "serviceBase", "serviceUserCardBase", "serviceSubmit", "serviceCommon", "$sanitize", function (e, t, a, n, i, s, o, r) {
    e.modules = [],
        e.editors = [],
        e.activeModules = n.initActiveModules(a.activeModules),
        e.activeItem = {},
        e.activeIndex = 0,
        e.index = a.activeModules ? a.activeModules.length : 0,
        e.submit = {
            params: {},
            html: ""
        },
        e.newcard = a.newcard,
        e.fansFields = a.fansFields,
        e.$on("serviceBase.editors.update", function (t, a) {
            e.editors = a
        }),
        e.$on("serviceBase.activeItem.update", function (t, a) {
            e.activeItem = a
        }),
        e.$on("serviceBase.activeModules.update", function (t, a) {
            e.activeModules = a
        }),
        e.addItem = function (e) {
            n.addItem(e)
        }
        ,
        e.editItem = function (e) {
            i.editItem(e)
        }
        ,
        e.deleteItem = function (e) {
            n.deleteItem(e)
        }
        ,
        e.init = function (t, a) {
            if (e.modules = n.setModules(t, a),
            e.activeModules.length > 0) {
                var i = [];
                angular.forEach(e.activeModules, function (e, t) {
                    e && i.push(e.id)
                })
            }
            angular.forEach(e.modules, function (e, t) {
                e.defaultshow && -1 == $.inArray(e.id, i) && n.addItem(e.id)
            })
        }
        ,
        e.url = function (e) {
            return o.url(e)
        }
        ,
        e.tomedia = function (e) {
            return o.tomedia(e)
        }
        ,
        e.submit = function (t) {
            e.submit = s.submit(),
                e.$apply("submit"),
                $(t.target).parents("form").submit()
        }
        ,
        e.addFields = function () {
            i.addFields()
        }
        ,
        e.removeFields = function (e) {
            i.removeFields(e)
        }
        ,
        e.addNums = function () {
            i.addNums()
        }
        ,
        e.removeNums = function (e) {
            i.removeNums(e)
        }
        ,
        e.addRecharges = function () {
            i.addRecharges()
        }
        ,
        e.removeRecharges = function (e) {
            i.removeRecharges(e)
        }
        ,
        e.addTimes = function () {
            i.addTimes()
        }
        ,
        e.removeTimes = function (e) {
            i.removeTimes(e)
        }
        ,
        e.selectCoupon = function () {
            i.selectCoupon()
        }
        ,
        e.clearCoupon = function () {
            i.clearCoupon()
        }
        ,
        e.addThumb = function (e) {
            i.addThumb(e)
        }
        ,
        e.addBgThumb = function () {
            i.addBgThumb()
        }
        ,
        $(".single-submit").on("click", function (t) {
            e.submit(t)
        }),
        e.init(null, ["cardBasic", "cardActivity", "cardNums", "cardTimes", "cardRecharge"]),
        e.activeModules[1].params.discounts = a.discounts,
        e.editItem(0)
}
]);

angular.module("userCardApp").service("serviceUserCardBase", ["$rootScope", "serviceBase", function (e, t) {
    var a = {};
    return a.triggerActiveItem = function (e) {
        $(".app-side .editor").css("marginTop", "0"),
            t.triggerActiveItem(e)
    }
        ,
        a.editItem = function (e) {
            var a = t.getBaseData("activeModules");
            "string" == typeof e && angular.forEach(a, function (t) {
                t.id == e && (e = t.index)
            }),
                t.editItem(e)
        }
        ,
        a.addFields = function () {
            var a = t.getBaseData("activeItem");
            a.params.fields.push({
                title: "",
                require: 1,
                bind: "",
                issystem: 0
            }),
                t.setBaseData("activeItem", a),
                e.$broadcast("serviceBase.activeItem.update", a)
        }
        ,
        a.removeFields = function (a) {
            if ("mobile" == a.bind || "realname" == a.bind)
                return false;
            var n = t.getBaseData("activeItem");
            n.params.fields = _.without(n.params.fields, a),
                t.setBaseData("activeItem", n),
                e.$broadcast("serviceBase.activeItem.update", n)
        }
        ,
        a.addNums = function () {
            t.getBaseData("activeItem").params.nums.push({
                recharge: "",
                num: ""
            })
        }
        ,
        a.removeNums = function (a) {
            var n = t.getBaseData("activeItem");
            n.params.nums = _.without(n.params.nums, a),
                t.setBaseData("activeItem", n),
                e.$broadcast("serviceBase.activeItem.update", n)
        }
        ,
        a.addRecharges = function () {
            var a = t.getBaseData("activeItem");
            a.params.recharges.push({
                condition: "",
                back: "",
                backtype: "0",
                backunit: "元"
            }),
                t.setBaseData("activeItem", a),
                e.$broadcast("serviceBase.activeItem.update", a)
        }
        ,
        a.removeRecharges = function (a) {
            var n = t.getBaseData("activeItem");
            n.params.recharges = _.without(n.params.recharges, a),
                t.setBaseData("activeItem", n),
                e.$broadcast("serviceBase.activeItem.update", n)
        }
        ,
        a.addTimes = function () {
            var a = t.getBaseData("activeItem");
            a.params.times.push({
                recharge: "",
                time: ""
            }),
                t.setBaseData("activeItem", a),
                e.$broadcast("serviceBase.activeItem.update", a)
        }
        ,
        a.removeTimes = function (a) {
            var n = t.getBaseData("activeItem");
            n.params.times = _.without(n.params.times, a),
                t.setBaseData("activeItem", n),
                e.$broadcast("serviceBase.activeItem.update", n)
        }
        ,
        a.selectCoupon = function () {
            var a = t.getBaseData("activeItem");
            util.coupon(function (n) {
                a.params.grant.coupon = [],
                    angular.forEach(n, function (e) {
                        a.params.grant.coupon.push({
                            couponTitle: e.title,
                            coupon: e.id
                        })
                    }),
                    t.setBaseData("activeItem", a),
                    e.$apply(),
                    e.$broadcast("serviceBase.activeItem.update", a)
            }, {
                multiple: true
            })
        }
        ,
        a.clearCoupon = function () {
            var a = t.getBaseData("activeItem");
            a.params.grant.coupon = [],
                t.setBaseData("activeItem", a),
                e.$broadcast("serviceBase.activeItem.update", a)
        }
        ,
        a.addThumb = function (a) {
            var n = t.getBaseData("activeItem");
            require(["fileUploader"], function (i) {
                i.show(function (i) {
                    n.params[a] = i.url,
                        t.setBaseData("activeItem", n),
                        e.$apply(),
                        e.$broadcast("serviceBase.activeItem.update", n)
                }, {
                    direct: true,
                    multiple: false
                })
            })
        }
        ,
        a.addBgThumb = function () {
            var a = t.getBaseData("activeItem");
            require(["fileUploader"], function (n) {
                n.show(function (n) {
                    a.params.background.image = n.url,
                        t.setBaseData("activeItem", a),
                        e.$apply(),
                        e.$broadcast("serviceBase.activeItem.update", a)
                }, {
                    direct: true,
                    multiple: false
                })
            })
        }
        ,
        a
}
]);

angular.module("userCardApp").controller("CardActivityCtrl", ["$scope", function (e) {
    e.$watch("activeItem.params.grant_rate", function (t, a) {
        (t += "").match(/^([1-9]\d*(\.(\d)?)?|0(\.(\d)?)?)?$/) ? e.activeItem.params.grant_rate = t : e.activeItem.params.grant_rate = a
    })
}
]);

angular.module("userCardApp").controller("CardBasicCtrl", ["$scope", "config", function (e, t) {
    e.creditnames = t.creditnames,
        e.siteroot = t.siteroot,
        e.recharge_src = e.siteroot + "/app/resource/images/sum-recharge.png",
        e.scanpay_src = e.siteroot + "/app/resource/images/scan-pay.png"
}
]);

angular.module("userCardApp").controller("CardNumsCtrl", ["$scope", function (e) {
}
]);

angular.module("userCardApp").controller("CardRechargeCtrl", ["$scope", function (e) {
    require(["bootstrap"], function (e) {
        e(".dropdown-toggle").dropdown()
    })
}
]);

angular.module("userCardApp").controller("CardTimesCtrl", ["$scope", function (e) {
}
]);