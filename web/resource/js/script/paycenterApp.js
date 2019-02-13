angular.module("paycenterApp", ["cfp.hotkeys"]).controller("microPay", ["$scope", "$timeout", "config", "$http", "hotkeys", "servicePaycenterBase", function (e, t, a, n, i, s) {
    card = $.parseJSON(a.card_set_str),
        i.add({
            combo: "return+up",
            description: "Description goes here",
            allowIn: ["INPUT"],
            callback: function (t, a) {
                e.micro.submit()
            }
        }),
        i.add({
            combo: "esc",
            description: "Description goes here",
            allowIn: ["INPUT"],
            callback: function (t, a) {
                e.micro.reset()
            }
        }),
        i.add({
            combo: "backspace",
            description: "Description goes here",
            allowIn: ["INPUT"],
            callback: function (t, a) {
                e.micro.counter_handler("backspace"),
                    t.preventDefault()
            }
        }),
        i.add({
            combo: "-",
            description: "Description goes here",
            allowIn: ["INPUT"],
            callback: function (t, a) {
                "0" != e.micro.config.fee ? e.micro.mcardPayManage() : util.message("请输入金额", "", "error")
            }
        }),
        i.add({
            combo: "+",
            description: "Description goes here",
            allowIn: ["INPUT"],
            callback: function (t, a) {
                "0" != e.micro.config.fee ? e.micro.wechatPayManage() : util.message("请输入金额", "", "error")
            }
        }),
        nums = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "."],
        e.micro = s.paycenterBaseData(card);

    angular.forEach(nums, function (t, a) {
        i.add({
            combo: t,
            description: "Description goes here",
            allowIn: ["INPUT"],
            callback: function (t, a) {
                e.micro.counter_handler(t.key)
            }
        })
    }),
        e.micro.mcardPayManage = function () {
            $("#mcard-pay").on("shown.bs.modal", function () {
                $(".js-input").focus();
                var t = 2;
                i.add({
                    combo: "return",
                    description: "Description goes here",
                    allowIn: ["INPUT"],
                    callback: function (a, n) {
                        input_count = e.micro.input_count(),
                        t > input_count && e.micro.submit(),
                            $('input[tabindex="' + t + '"]').focus(),
                            t++
                    }
                }),
                    i.del("backspace");

                angular.forEach(nums, function (e, t) {
                    i.del(e)
                })
            }),
                $("#mcard-pay").on("hidden.bs.modal", function () {
                    i.del("return");

                    angular.forEach(nums, function (t, a) {
                        i.add({
                            combo: t,
                            description: "Description goes here",
                            allowIn: ["INPUT"],
                            callback: function (t, a) {
                                e.micro.counter_handler(t.key)
                            }
                        })
                    })
                }),
                $("#mcard-pay").modal("show")
        }
        ,
        e.micro.wechatPayManage = function () {
            $("#wechat-pay").on("shown.bs.modal", function () {
                $(".js-input").focus(),
                    i.add({
                        combo: "return",
                        description: "Description goes here",
                        allowIn: ["INPUT"],
                        callback: function (t, a) {
                            e.micro.submit()
                        }
                    }),
                    i.del("backspace");

                angular.forEach(nums, function (e, t) {
                    i.del(e)
                })
            }),
                $("#wechat-pay").on("hidden.bs.modal", function () {
                    i.del("return");

                    angular.forEach(nums, function (t, a) {
                        i.add({
                            combo: t,
                            description: "Description goes here",
                            allowIn: ["INPUT"],
                            callback: function (t, a) {
                                e.micro.counter_handler(t.key)
                            }
                        })
                    })
                }),
                $("#wechat-pay").modal("show")
        }
        ,
        e.micro.num = function (t) {
            e.micro.counter_handler(t)
        }
        ,
        e.$watch("micro.config.code", function (e, t) {
            e && e.length > 0 && $(".js-pay-warning").html("")
        }),
        e.micro.counter_handler = function (t) {
            if ("backspace" == (t += ""))
                return current_fee_length = e.micro.config.fee.length,
                    void ("1" == current_fee_length ? e.micro.config.fee = "0" : e.micro.config.fee = e.micro.config.fee.substr(0, current_fee_length - 1));
            "clear" != t ? "0" != e.micro.config.fee || "1" != e.micro.config.fee.length || "." == t ? e.micro.config.fee.length >= 9 || 8 == e.micro.config.fee.length && "." == t || e.micro.config.fee.indexOf(".") > -1 && (float = e.micro.config.fee.split("."),
            float[1] && float[1].length >= 2 || "." == t) || (e.micro.config.fee += t) : e.micro.config.fee = t : e.micro.config.fee = "0"
        }
        ,
        e.micro.reset = function () {
            e.micro.config.fee = "0"
        }
        ,
        e.$watch("micro.config.offset_money", function (t, a) {
            var n = Math.floor(e.micro.config.member.credit1 / e.micro.config.card.offset_rate);
            e.micro.config.offset_money = parseInt(t),
            t >= n && (e.micro.config.offset_money = n),
            t || (e.micro.config.offset_money = 0),
                e.micro.config.credit1 = e.micro.config.card.offset_rate * e.micro.config.offset_money,
                e.micro.checkLast_money()
        }),
        e.$watch("micro.config.credit2", function (t, a) {
            reg = /^\d*\.{0,1}\d{0,1}\d{0,1}$/,
            reg.test(t) || (e.micro.config.credit2 = a),
            t > e.micro.config.member.credit2 && (e.micro.config.credit2 = e.micro.config.member.credit2),
                e.micro.checkLast_money()
        }),
        e.$watch("micro.config.last_money", function (t, a) {
            t < 0 && (e.config.last_money = 0),
                e.micro.checkLast_money()
        }),
        e.micro.checkBasic = function () {
            if (!$.trim(e.micro.config.body))
                return util.message("商品名称不能为空"),
                    false;
            var t = /^(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/
                , a = $.trim(e.micro.config.fee);
            return t.test(a) ? void 0 : (util.message("支付金额不能少于0.01元"),
                false)
        }
        ,
        e.micro.input_count = function () {
            return input_count = $("#mcard-pay input.js-input").length,
                input_count
        }
        ,
        e.$watch("micro.config.cardsn", function (t, a) {
            11 == t.length ? e.micro.checkCard() : (e.micro.config.member.uid = -1,
                e.micro.config.credit2 = 0,
            t.length > 11 && (e.micro.config.card_error = "会员卡卡号错误"))
        }),
        e.micro.mcardPay = function (t) {
            "0" == e.micro.config.fee ? util.message("请输入金额", "", "error") : (e.micro.config.cardsn = "",
                e.micro.config.member.uid = -1),
                "1" == t ? e.micro.mcardPayManage() : "2" == t && e.micro.wechatPayManage()
        }
        ,
        e.micro.is_showCode = function () {
            Math.floor(e.micro.config.member.credit1 / e.micro.config.card.offset_rate);
            e.micro.config.fact_fee <= e.micro.config.member.credit2 ? e.micro.config.is_showCode = 0 : e.micro.config.card.offset_rate > 0 ? (max = e.micro.config.fact_fee - e.micro.config.member.credit2 - Math.floor(e.micro.config.member.credit1 / e.micro.config.card.offset_rate),
                reg = /^-?[1-9]\d*$/,
                max > 0 ? e.micro.config.is_showCode = 1 : 0 == max ? e.micro.config.is_showCode = 0 : reg.test(max) ? e.micro.config.is_showCode = 0 : e.micro.config.is_showCode = 1) : (max = e.micro.config.fact_fee - e.micro.config.member.credit2,
                max > 0 ? e.micro.config.is_showCode = 1 : e.micro.config.is_showCode = 0)
        }
        ,
        e.micro.checkCard = function () {
            e.micro.checkBasic();
            var t = $.trim(e.micro.config.cardsn);
            if (11 != t.length)
                return util.message("卡号不足11位", "", "error"),
                    false;
            e.micro.config.loading = "加载中..",
                e.micro.config.card_error = "",
                n.post(a.card_check_url, {
                    cardsn: t
                }).success(function (t) {
                    if (e.micro.config.loading = "",
                    -1 != t.message.errno) {
                        e.micro.config.card_error = "",
                            e.micro.config.member = t.message.message,
                            e.micro.config.fact_fee = e.micro.config.fee;
                        var a = parseInt(e.micro.config.fee)
                            , n = parseInt(e.micro.config.member.discount.condition);
                        return e.micro.config.member.discount_type > 0 && e.micro.config.member.discount && a >= n && (1 == e.micro.config.member.discount_type ? (e.micro.config.fact_fee = e.micro.config.fee - e.micro.config.member.discount.discount,
                            e.micro.config.fact_fee = e.micro.config.fact_fee.toFixed(2)) : e.micro.config.fact_fee = e.micro.config.fee * e.micro.config.member.discount.discount,
                        e.micro.config.fact_fee < 0 && (e.micro.config.fact_fee = 0)),
                            e.micro.last_money = e.micro.config.fact_fee,
                            e.micro.checkCredit2(),
                            e.micro.is_showCode(),
                            false
                    }
                    e.micro.config.card_error = t.message.message
                })
        }
        ,
        e.micro.checkCredit2 = function () {
            e.micro.checkLast_money(),
                e.micro.config.credit2 = Math.min.apply(null, [e.micro.config.member.credit2, e.micro.last_money]),
                e.micro.checkLast_money()
        }
        ,
        e.micro.checkLast_money = function () {
            var t = e.micro.config.fact_fee - e.micro.config.credit2 - e.micro.config.offset_money;
            t < 0 && (e.config.last_money = 0),
                e.micro.last_money = t.toFixed(2)
        }
        ,
        e.micro.query = function () {
            if (!e.micro.uniontid)
                return util.message("系统错误", "", "error"),
                    false;
            n.post("{php echo url('paycenter/wxmicro/query');}", {
                uniontid: e.micro.uniontid
            }).success(function (e) {
                0 == e.message.errno ? (util.message("支付成功", "", "success"),
                    location.reload()) : util.message("支付失败:" + e.message.message, "", "error")
            })
        }
        ,
        e.micro.checkpay = function () {
            n.post(a.checkpay_url, {
                uniontid: e.micro.uniontid
            }).success(function (n) {
                console.dir(n),
                    "SUCCESS" == n.message.trade_state ? util.message("支付成功", a.redirect_url, "error") : "NOTPAY" == n.message.trade_state ? util.message("支付失败:用户取消支付", a.redirect_url, "error") : "USERPAYING" == n.message.trade_state ? t(function () {
                        e.micro.checkpay()
                    }, 5e3) : util.message(n.message.trade_state_desc, a.redirect_url, "error")
            })
        }
        ,
        e.micro.submit = function () {
            return !!confirm("确认支付吗?") && ((1 == e.micro.config.is_showCode || e.micro.config.member.uid <= 0) && !$.trim(e.micro.config.code) ? ($(".js-pay-warning").html("支付授权码不能为空"),
                false) : (1 == e.micro.config.is_showCode ? e.micro.config.cash = e.micro.last_money : e.micro.config.cash = 0,
                e.micro.config.member.uid > 0 && (e.micro.checkLast_money(),
                e.micro.last_money - e.micro.config.cash != 0) ? (util.message("支付方式设置的支付金额不等于实际支付金额", "", "error"),
                    false) : void n.post(a.pay_url, e.micro.config).success(function (a) {
                    return 0 == a.message.errno ? util.message(a.message.message, a.redirect, "success") : -1 == a.message.errno ? (util.message("支付失败:" + a.message.message, "", "error"),
                        $('#form1 :text[name="code"]').val("")) : -10 == a.message.errno && ($(".js-userpaying").show(),
                        e.micro.uniontid = a.message.uniontid,
                        t(function () {
                            e.micro.checkpay()
                        }, 5e3)),
                        false
                })))
        }
}
]);

angular.module("paycenterApp").filter("credit1_num", ["$rootScope", function (e) {
    return function (e) {
        return e = Math.floor(e)
    }
}
]);

angular.module("paycenterApp").service("servicePaycenterBase", ["$rootScope", function (e) {
    var t = {}
        , a = {
        config: {
            body: "刷卡支付收款",
            fee: "0",
            cardsn: "",
            card: "",
            credit1: 0,
            credit2: 0,
            last_money: 0,
            offset_money: 0,
            is_showCode: 0,
            loading: "",
            card_error: "",
            member: {
                uid: 0,
                credit2: 0
            },
            nums: [["7", "7"], ["8", "8"], ["9", "9"], ["4", "4"], ["5", "5"], ["6", "6"], ["1", "1"], ["2", "2"], ["3", "3"], ["0", "0"], [".", "."], ["clear", "清除"]]
        }
    };
    return t.paycenterBaseData = function (e) {
        return a.config.card = e,
            a
    }
        ,
        t
}
]);