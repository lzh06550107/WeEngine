angular.module("userProfile", ["we7app"]);

angular.module("userProfile").controller("UserProfileDisplay", ["$scope", "$window", "$http", "config", function ($scope, $window, a, config) {
    $scope.user = config.user;
    $scope.profile = config.profile;
    $scope.account_num = config.account_num;
    null == $scope.profile && ($scope.profile = {
        avatar: "",
        realname: "",
        births: "",
        address: "",
        resides: ""
    });
    $scope.links = config.links;
    $scope.group_info = config.group_info;
    $scope.groups = config.groups;
    $scope.changeGroup = $scope.user.groupid;
    $scope.wechats = config.wechats;
    $scope.wxapps = config.wxapps;

    /**
     * 修改用户头像
     */
    $scope.changeAvatar = function () {
        require(["fileUploader"], function (fileUploader) {
            fileUploader.init(function (t) {
                $scope.profile.avatar = t.url,
                    $scope.$apply($scope.profile),
                    $scope.httpChange("avatar")
            }, {
                direct: true,
                multiple: false
            })
        })
    };

    $(".js-clip").each(function () {
        util.clip(this, $(this).attr("data-url"))
    });

    /**
     * 修改用户信息
     * @param field
     * @param fieldValue
     */
    $scope.editInfo = function (field, fieldValue) {
        $scope.userOriginal = {};
        $scope.userOriginal[field] = fieldValue
    };

    $scope.httpChange = function (field) {
        switch (field) {
            case "avatar":
                a.post($scope.links.userPost, {
                    type: field,
                    avatar: $scope.profile.avatar,
                    uid: $scope.user.uid
                }).success(function (e) {
                    if (0 == e.message.errno) {
                        util.message("修改成功！");
                    } else {
                        -1 == e.message.errno && util.message(e.message.message);
                        1 == e.message.errno && util.message(e.message.message);
                        40035 == e.message.errno && util.message(e.message.message);
                    }
                });
                break;
            case "username":
                $(".modal").modal("hide");
                a.post($scope.links.userPost, {
                    type: field,
                    username: $scope.userOriginal[field],
                    uid: $scope.user.uid
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.user[field] = $scope.userOriginal[field];
                        util.message("修改成功！");
                    } else {
                        -1 == t.message.errno && util.message(t.message.message);
                        1 == t.message.errno && util.message(t.message.message);
                        2 == t.message.errno && util.message(t.message.message);
                        40035 == t.message.errno && util.message(t.message.message);
                    }
                });
                break;
            case "vice_founder_name":
                $(".modal").modal("hide");
                a.post($scope.links.userPost, {
                    type: field,
                    vice_founder_name: $scope.userOriginal[field],
                    uid: $scope.user.uid
                }).success(function (t) {
                    if (0 != t.message.errno) {
                        util.message(t.message.message);
                        return false;
                    }
                    $scope.user[field] = $scope.userOriginal[field];
                    util.message("修改成功！");
                });
                break;
            case "qq":
                $(".modal").modal("hide");
                a.post($scope.links.userPost, {
                    type: field,
                    qq: $scope.userOriginal[field],
                    uid: $scope.user.uid
                }).success(function (t) {
                    if (0 != t.message.errno) {
                        util.message(t.message.message);
                        return false;
                    }
                    $scope.profile[field] = $scope.userOriginal[field];
                    util.message("修改成功！");
                });
                break;
            case "remark":
                $(".modal").modal("hide");
                a.post($scope.links.userPost, {
                    type: field,
                    remark: $scope.userOriginal[field],
                    uid: $scope.user.uid
                }).success(function (t) {
                    if (0 != t.message.errno) {
                        util.message(t.message.message);
                        return false;
                    }
                    $scope.user[field] = $scope.userOriginal[field];
                    util.message("修改成功！");
                });
                break;
            case "welcome_link":
                $(".modal").modal("hide");
                a.post($scope.links.userPost, {
                    type: field,
                    welcome_link: $scope.user.welcome_link,
                    uid: $scope.user.uid
                }).success(function (e) {
                    if (0 != e.message.errno) {
                        util.message(e.message.message);
                        return false;
                    }
                    util.message("修改成功！");
                });
                break;
            case "mobile":
                $(".modal").modal("hide");
                a.post($scope.links.userPost, {
                    type: field,
                    mobile: $scope.userOriginal[field],
                    uid: $scope.user.uid
                }).success(function (t) {
                    if (0 != t.message.errno) {
                        util.message(t.message.message);
                        return false;
                    }
                    $scope.profile[field] = $scope.userOriginal[field];
                    util.message("修改成功！");
                });
                break;
            case "password":
                $(".modal").modal("hide");
                if (0 == $window.sysinfo.isfounder && 0 == $scope.user.register_type) {
                    var oldPassword = $(".old-password").val();
                    if (_.isEmpty(oldPassword)) {
                        util.message("原密码不可为空！");
                        return false;
                    }
                }
                var s = $(".new-password").val()
                    , o = $(".renew-password").val();
                if (_.isEmpty(s)) {
                    util.message("新密码不可为空！");
                    return false;
                }
                if (_.isEmpty(o)) {
                    util.message("确认新密码不可为空！");
                    return false;
                }
                if (s != o) {
                    util.message("两次密码不一致！");
                    return false;
                }
                a.post($scope.links.userPost, {
                    type: field,
                    oldpwd: oldPassword,
                    newpwd: s,
                    renewpwd: o,
                    uid: $scope.user.uid
                }).success(function (e) {
                    if (0 == e.message.errno) {
                        util.message("密码修改成功！");
                    } else {
                        -1 == e.message.errno && util.message("抱歉，用户不存在或是已经被删除！");
                        1 == e.message.errno && util.message("密码修改失败，请稍后重试！");
                        2 == e.message.errno && util.message("两次密码不一致！");
                        3 == e.message.errno && util.message("原密码不正确！");
                        40035 == e.message.errno && util.message("不合法的参数！");
                    }
                });
                break;
            case "endtime":
                $(".modal").modal("hide");
                var r = $scope.user.endtype
                    , l = $(':text[name="endtime"]').val();
                a.post($scope.links.userPost, {
                    type: field,
                    endtype: r,
                    endtime: l,
                    uid: $scope.user.uid
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.user.endtype = r;
                        $scope.user.end = 1 == r ? "永久" : l;
                        util.message("到期时间修改成功！");
                    } else {
                        -1 == t.message.errno && util.message(t.message.message);
                        1 == t.message.errno && util.message(t.message.message);
                        40035 == t.message.errno && util.message(t.message.message);
                    }
                });
                break;
            case "realname":
                $(".modal").modal("hide");
                if (_.isEmpty($scope.userOriginal.realname)) {
                    util.message("真实姓名不可为空！");
                    return false;
                }
                a.post($scope.links.userPost, {
                    type: field,
                    realname: $scope.userOriginal.realname,
                    uid: $scope.user.uid
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.profile.realname = $scope.userOriginal.realname;
                        util.message("真实姓名修改成功！");
                    } else {
                        -1 == t.message.errno && util.message(t.message.message);
                        1 == t.message.errno && util.message(t.message.message);
                        40035 == t.message.errno && util.message(t.message.message);
                    }
                });
                break;
            case "birth":
                $(".modal").modal("hide");
                var c = $(".tpl-year").val()
                    , u = $(".tpl-month").val()
                    , d = $(".tpl-day").val();
                a.post($scope.links.userPost, {
                    type: field,
                    year: c,
                    month: u,
                    day: d,
                    uid: $scope.user.uid
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.profile.births = c + "年" + u + "月" + d + "日";
                        util.message("修改成功！");
                    } else {
                        -1 == t.message.errno && util.message(t.message.message);
                        1 == t.message.errno && util.message(t.message.message);
                        40035 == t.message.errno && util.message(t.message.message);
                    }
                });
                break;
            case "address":
                $(".modal").modal("hide");
                if (_.isEmpty($scope.userOriginal.address)) {
                    util.message("邮寄地址不可为空！");
                    return false;
                }
                a.post($scope.links.userPost, {
                    type: field,
                    address: $scope.userOriginal.address,
                    uid: $scope.user.uid
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.profile.address = $scope.userOriginal.address;
                        util.message("邮寄地址修改成功！");
                    } else {
                        -1 == t.message.errno && util.message(t.message.message);
                        1 == t.message.errno && util.message(t.message.message);
                        40035 == t.message.errno && util.message(t.message.message);
                    }
                });
                break;
            case "reside":
                $(".modal").modal("hide");
                var p = $(".tpl-province").val()
                    , m = $(".tpl-city").val()
                    , f = $(".tpl-district").val();
                a.post($scope.links.userPost, {
                    type: field,
                    province: p,
                    city: m,
                    district: f,
                    uid: $scope.user.uid
                }).success(function (t) {
                    if (0 == t.message.errno) {
                        $scope.profile.resides = p + " " + m + " " + f;
                        util.message("修改成功！");
                    } else {
                        -1 == t.message.errno && util.message(t.message.message);
                        1 == t.message.errno && util.message(t.message.message);
                        40035 == t.message.errno && util.message(t.message.message);
                    }
                })
        }
    };

    $scope.changeText = function ($event) {
        var t = $event.target.text;
        $event.target.text = "展开" == t ? "收起" : "展开";
    }
}
]);

angular.module("userProfile").controller("userBindCtrl", ["$scope", "$http", "config", "$interval", function ($scope, $http, a, $interval) {
    $scope.bindqq = a.bindqq;
    $scope.bindwechat = a.bindwechat;
    $scope.bindmobile = a.bindmobile;
    $scope.login_urls = a.login_urls;
    $scope.thirdlogin = a.thirdlogin;
    $scope.bind_sign = a.bind_sign;
    $scope.image = a.image;
    $scope.mobile = "";
    $scope.password = "";
    $scope.repassword = "";
    $scope.links = a.links;
    $scope.imagecode = "";
    $scope.smscode = "";
    $scope.expire = 120;
    $scope.text = "发送验证码";
    $scope.isDisable = false;

    /**
     * 先服务器端校验手机号没有被绑定过，然后发送手机短信校验
     * @param a
     * @returns {boolean}
     */
    $scope.sendMessage = function (a) {
        if ("" == $scope.mobile) {
            util.message("手机号不能为空");
            return false;
        }
        $http.post($scope.links.valid_mobile_link, { // 验证手机号没有被使用
            mobile: $scope.mobile,
            type: a
        }).success(function (a) { // 短信验证手机号有效
            0 != a.message.errno ? util.message(a.message.message) : $http.post($scope.links.send_code_link, {
                receiver: $scope.mobile,
                custom_sign: $scope.bind_sign
            }).success(function (t) {
                if ("success" == t) {
                    util.message("发送验证码成功", "", "success");
                    var a = $interval(function () {
                        $scope.isDisable = true;
                        $scope.expire--;
                        $scope.text = $scope.expire + "秒后重新获取";
                        if ($scope.expire <= 0) {
                            $interval.cancel(a);
                            $scope.isDisable = false;
                            $scope.text = "重新点击获取验证码";
                            $scope.expire = 120;
                        }
                    }, 1e3)
                } else
                    util.message(t, "", "error");
            })
        })
    };

    // 刷新图形验证码
    $scope.changeVerify = function () {
        $scope.image = $scope.links.img_verify_link + "r=" + Math.round((new Date).getTime());
        return false;
    };

    $scope.mobileBind = function (a, n) {
        if ("" == $scope.mobile) {
            util.message("手机号不能为空");
            return false;
        }
        if ("" == $scope.imagecode) {
            util.message("图形验证码不能为空");
            return false;
        }
        if ("" == $scope.smscode) {
            util.message("手机号验证码不能为空");
            return false;
        }
        if (null == $scope.bindmobile) {
            if ("" == $scope.password) {
                util.message("密码不能为空");
                return false;
            }
            if ("" == $scope.repassword) {
                util.message("确认密码不能为空");
                return false;
            }
            if ($scope.password != $scope.repassword) {
                util.message("两次输入的密码不一致");
                return false;
            }
        }
        null == $scope.bindmobile ? $http.post($scope.links.bind_mobile_link, {
            mobile: $scope.mobile,
            password: $scope.password,
            repassword: $scope.repassword,
            imagecode: $scope.imagecode,
            smscode: $scope.smscode,
            type: a
        }).success(function (e) {
            0 == e.message.errno ? util.message(e.message.message, e.redirect, "success") : util.message(e.message.message);
        }) : $http.post($scope.links.unbind_third_link, {
            mobile: $scope.mobile,
            password: $scope.password,
            repassword: $scope.repassword,
            imagecode: $scope.imagecode,
            smscode: $scope.smscode,
            type: a,
            bind_type: n
        }).success(function (e) {
            0 == e.message.errno ? util.message(e.message.message, e.redirect, "success") : util.message(e.message.message);
        })
    };

    $scope.unbind = function (bindType) {
        $http.post($scope.links.unbind_third_link, {
            bind_type: bindType
        }).success(function (e) {
            0 == e.message.errno ? util.message(e.message.message, e.redirect, "success") : util.message(e.message.message);
        })
    }
}
]);