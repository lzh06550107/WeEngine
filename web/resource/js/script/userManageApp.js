angular.module("userManageApp", ["we7app"]);

angular.module("userManageApp").controller("UserEditModulesTpl", ["$scope", "$http", "config", function ($scope, $http, config) {
    $scope.user = config.user,
        $scope.profile = config.profile,
        $scope.group_info = config.group_info,
        $scope.groups = config.groups,
        $scope.links = config.links,
        $scope.changeGroup = $scope.user.groupid,
        $scope.httpChange = function (a) {
            $http.post($scope.links.editGroup + "uid=" + $scope.user.uid, {
                type: a,
                groupid: $scope.changeGroup,
                founder_groupid: $scope.user.founder_groupid
            }).success(function (t) {
                0 == t.message.errno ? ($scope.group_info = t.message.message,
                    util.message("修改成功！")) : util.message(t.message.message)
            })
        };

    $scope.changeText = function (e) {
        var t = $(e)[0].target.text;
        $(e)[0].target.text = "展开" == t ? "收起" : "展开"
    }
}
]);

angular.module("userManageApp").controller("UserEditAccount", ["$scope", "config", function (e, t) {
    e.user = t.user,
        e.wechats = t.wechats,
        e.wxapps = t.wxapps,
        e.webapps = t.webapps,
        e.phoneapps = t.phoneapps,
        e.profile = t.profile
}
]);

angular.module("userManageApp").controller("UserCreate", ["$scope", "config", function ($scope, config) {
    $scope.groups = config.groups;
    $scope.user = {
        username: "",
        password: "",
        repassword: "",
        groupid: 0,
        remark: ""
    };

    $scope.changeType = function ($event) {
        var t = $event.target;
        $(t).attr("type", "password");
    };

    $scope.checkSubmit = function (e) {

        if ($.trim($("#username").val())) {
            e.preventDefault();
            util.message("请输入用户名.", "", "error");
            return false;
        } else if ("" == $("#password").val()) {
            e.preventDefault();
            util.message("没有输入密码.", "", "error");
            return false;
        } else if ($("#password").val().length < 8) {
            e.preventDefault();
            util.message("密码长度不能小于8个字符.", "", "error");
            return false;
        } else if ($("#password").val() != $("#repassword").val()) {
            e.preventDefault();
            util.message("两次输入的密码不一致.", "", "error");
            return false;
        } else if ("" == $("#groupid").val() || 0 == $("#groupid").val()) {
            e.preventDefault();
            util.message("请选择所属用户组.", "", "error");
            return false;
        }
    }
}
]);

angular.module("userManageApp").controller("UsersDisplay", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.type = a.type;
    $scope.users = a.users;
    $scope.usergroups = a.usergroups;
    $scope.links = a.links;

    $scope.operate = function (uid, type) {
        $http.post($scope.links.link, {
            uid: uid,
            type: type
        }).success(function (e) {
            e.message.errno;
            util.message(e.message.message, e.redirect);
        })
    }
}
]);

angular.module("userManageApp").controller("FieldsDisplay", ["$scope", "config", function ($scope, config) {
    $scope.fields = config.fields;
    $scope.links = config.links;
}
]);

angular.module("userManageApp").controller("FieldsPost", ["$scope", "config", function ($scope, config) {
    $scope.item = config.item;

    if (null == $scope.item) {
        $scope.available = true;
        $scope.required = true;
        $scope.unchangeable = true;
        $scope.showinregister = true;
    } else {
        1 == $scope.item.available ? $scope.available = true : $scope.available = false;
        1 == $scope.item.required ? $scope.required = true : $scope.required = false;
        1 == $scope.item.unchangeable ? $scope.unchangeable = true : $scope.unchangeable = false;
        1 == $scope.item.showinregister ? $scope.showinregister = true : $scope.showinregister = false;
    }

    $scope.verifyField = function () {
        var e = $('input[name="field"]'),
            field_value = e.val(),
            reg = /^[A-Za-z0-9_]*$/;
        if (!reg.test(field_value)) {
            util.message("请使用字母或数字或下划线组合字段名！");
            e.val("");
        }
    }
}
]);

angular.module("userManageApp").controller("RegistersetCtrl", ["$scope", "config", function ($scope, config) {
    $scope.settings = config.settings;
    $scope.groups = config.groups;
}
]);

angular.module("userManageApp").controller("UserAssignPermissionsCtrl", ["$scope", "config", function (e, t) {
    e.user = t.user,
        e.profile = t.profile
}
]);

angular.module("userManageApp").controller("UsersFindMobilePwd", ["$scope", "$http", "config", "$interval", function (e, t, a, n) {
    e.links = a.links,
        e.code = "",
        e.password = "",
        e.repassword = "",
        e.image = a.image,
        e.verify = "",
        e.mobile = "",
        e.find_password_sign = a.find_password_sign,
        e.expire = 120,
        e.text = "免费获取验证码",
        e.isDisable = false,
        e.sendMessage = function () {
            if ("" == e.mobile)
                return util.message("手机号不能为空"),
                    false;
            t.post(e.links.valid_mobile_link, {
                mobile: e.mobile
            }).success(function (a) {
                0 != a.message.errno ? util.message(a.message.message) : t.post(e.links.send_code_link, {
                    receiver: e.mobile,
                    custom_sign: e.find_password_sign
                }).success(function (t) {
                    if ("success" == t) {
                        util.message("发送验证码成功", "", "success");
                        var a = n(function () {
                            e.isDisable = true,
                                e.expire--,
                                e.text = e.expire + "秒后重新获取",
                            e.expire <= 0 && (n.cancel(a),
                                e.isDisable = false,
                                e.text = "重新点击获取验证码",
                                e.expire = 120)
                        }, 1e3)
                    } else
                        util.message(t, "", "error")
                })
            })
        }
        ,
        e.changeVerify = function () {
            return e.image = e.links.img_verify_link + "r=" + Math.round((new Date).getTime()),
                false
        }
        ,
        e.validCode = function () {
            "" == e.mobile && util.message("手机号不能为空"),
            "" == e.code && util.message("短信验证码不能为空"),
            "" == e.verify && util.message("图形验证码不能为空"),
                t.post(e.links.valid_code_link, {
                    mobile: e.mobile,
                    code: e.code,
                    verify: e.verify
                }).success(function (e) {
                    0 == e.message.errno ? ($(".step-2").removeClass("hide"),
                        $(".step-1").hide(),
                        $(".step-set-pwd").addClass("steps-status-finish")) : util.message(e.message.message, "", "error")
                })
        }
        ,
        e.changePassword = function () {
            return "" == e.password ? ($(".password").html("密码不能为空"),
                false) : "" == e.repassword ? ($(".repassword").html("密码不能为空"),
                false) : e.password != e.repassword ? ($(".repassword").html("两次输入的密码不一致"),
                false) : void t.post(e.links.set_password_link, {
                password: e.password,
                repassword: e.repassword,
                mobile: e.mobile
            }).success(function (e) {
                if (0 == e.message.errno)
                    $(".step-3").removeClass("hide"),
                        $(".step-2").hide(),
                        $(".step-pwd-success").addClass("steps-status-finish");
                else {
                    if (-2 == e.message.errno)
                        return $(".password").html(e.message.message),
                            false;
                    util.message(e.message.message)
                }
            })
        }
}
]);

angular.module("userManageApp").controller("UserExpireCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.user_expire = a.user_expire;
    $scope.links = a.links;

    $scope.saveExpire = function () {
        $http.post($scope.links.user_expire_link, {
            day: $scope.user_expire.day
        }).success(function (e) {
            0 != e.message.errno ? util.message(e.message.message, e.redirect, "error") : util.message("设置成功", e.redirect, "success")
        })
    };

    $scope.httpChange = function () {
        $http.post($scope.links.user_expire_status_link, {}).success(function (e) {
            0 == e.message.errno ? util.message("修改成功", e.redirect) : util.message("修改失败，请稍后重试！")
        })
    }
}
]);

angular.module("userManageApp").controller("UsersRegisterMobile", ["$scope", "$http", "config", "$interval", function ($scope, $http, config, $interval) {

    $scope.links = config.links,
        $scope.smscode = "",
        $scope.password = "",
        $scope.repassword = "",
        $scope.image = config.image,
        $scope.verify = "",
        $scope.mobile = "",
        $scope.owner_uid = config.owner_uid,
        $scope.register_type = config.register_type,
        $scope.register_sign = config.register_sign,
        $scope.expire = 120,
        $scope.text = "发送验证码",
        $scope.isDisable = false,
        $scope.mobleInvalid = true,
        $scope.smscodeInvalid = true,
        $scope.imageInvalid = true,
        $scope.passwordInvalid = true,
        $scope.repasswordInvalid = true;

    /**
     * 验证手机号码，先发送给服务器端验证手机号码格式，然后再发送到服务器验证手机号在线
     * @returns {boolean}
     */
    $scope.sendMessage = function () {
        if ("" == $scope.mobile) {
            util.message("手机号不能为空");
            return false;
        }
        $http.post($scope.links.valid_mobile_link, {
            mobile: $scope.mobile
        }).success(function (a) {
            0 != a.message.errno ? util.message(a.message.message) : $http.post($scope.links.send_code_link, {
                receiver: $scope.mobile,
                custom_sign: $scope.register_sign
            }).success(function (t) {
                if ("success" == t) {
                    util.message("发送验证码成功", "", "success");
                    var a = $interval(function () {
                        $scope.isDisable = true,
                            $scope.expire--,
                            $scope.text = $scope.expire + "秒后重新获取",
                        $scope.expire <= 0 && ($interval.cancel(a),
                            $scope.isDisable = false,
                            $scope.text = "重新点击获取验证码",
                            $scope.expire = 120)
                    }, 1e3)
                } else
                    util.message(t, "", "error")
            })
        })
    };

    $scope.changeVerify = function () {
        $scope.image = $scope.links.img_verify_link + "r=" + Math.round((new Date).getTime());
        return false;
    };

    $scope.checkMobile = function () {
        var a = $scope.mobile;
        $http.post($scope.links.valid_mobile_link, {
            mobile: a
        }).success(function (t) {
            0 != t.message.errno ? ($scope.mobileErr = true,
                $scope.mobileMsg = t.message.message) : ($scope.mobileErr = false,
                $scope.mobleInvalid = false)
        })
    };

    $scope.checkMobileCode = function () {
        var a = $scope.mobile
            , n = $scope.smscode;
        "" == n || void 0 == n ? ($scope.smscodeErr = true,
            $scope.smscodeMsg = "短信验证码不能为空") : $http.post($scope.links.check_mobile_code_link, {
            mobile: a,
            smscode: n
        }).success(function (t) {
            0 != t.message.errno ? ($scope.smscodeErr = true,
                $scope.smscodeMsg = t.message.message) : ($scope.smscodeErr = false,
                $scope.smscodeInvalid = false)
        })
    };

    $scope.checkImagecode = function () {
        "" == $scope.imagecode || void 0 == $scope.imagecode ? ($scope.imagecodeErr = true,
            $scope.imagecodeMsg = "请输入验证码") : $http.post(config.links.check_code_link, {
            code: $scope.imagecode
        }).success(function (t) {
            0 != t.message.errno ? ($scope.imagecodeErr = true,
                $scope.imagecodeMsg = "请输入正确的验证码",
                $scope.changeVerify()) : ($scope.imagecodeErr = false,
                $scope.imageInvalid = false)
        })
    };

    $scope.checkPassword = function () {
        "" == $scope.password || void 0 == $scope.password ? ($scope.passwordErr = true,
            $scope.passwordMsg = "请输入密码") : $scope.password.length < 8 ? ($scope.passwordErr = true,
            $scope.passwordMsg = "密码长度不能少于8") : ($scope.passwordErr = false,
            $scope.passwordInvalid = false)
    };

    $scope.checkRepassword = function () {
        "" == $scope.repassword || void 0 == $scope.repassword ? ($scope.repasswordErr = true,
            $scope.repasswordMsg = "确认密码不能为空") : $scope.repassword != $scope.password ? ($scope.repasswordErr = true,
            $scope.repasswordMsg = "两次密码输入不一致") : ($scope.repasswordErr = false,
            $scope.repasswordInvalid = false)
    };

    $scope.register = function () {
        $http.post($scope.links.register_link, {
            password: $scope.password,
            mobile: $scope.mobile,
            register_type: $scope.register_type,
            code: $scope.imagecode,
            smscode: $scope.smscode
        }).success(function (e) {
            0 == e.message.errno ? util.message(e.message.message, e.redirect, "success") : util.message(e.message.message)
        })
    }
}
]);

angular.module("userManageApp").controller("UserRegisterSystem", ["$scope", "$http", "config", function ($scope, $http, a) {

    function checkFiled(value, fieldName, fieldMsg1, fieldMsg2, regx) {
        if ("" == value || void 0 == value) {
            $scope.extendfields[fieldName].fieldErr = true;
            $scope.extendfields[fieldName].fieldMsg = fieldMsg1;
        } else if (regx.test(value)) {
            $scope.extendfields[fieldName].fieldErr = false;
        } else {
            $scope.extendfields[fieldName].fieldErr = true;
            $scope.extendfields[fieldName].fieldMsg = fieldMsg2;
        }
        return $scope.extendfields[fieldName].fieldErr;
    }

    $scope.image = a.image,
        $scope.usernameInvalid = true,
        $scope.passwordInvalid = true,
        $scope.repasswordInvalid = true,
        $scope.codeInvalid = true;

    get_extendfields = function () {
        $http.get(a.links.get_extendfields_link).success(function (t) {
            0 != t.message.errno ? util.message("获取注册字段信息失败") : $scope.extendfields = t.message.message
        })
    };
    get_extendfields();

    /**
     * 检查用户名称是否合法
     */
    $scope.checkUsername = function () {
        var n = /^[\u4e00-\u9fa5a-z\d_\.]{3,15}$/iu;

        if ("" == $scope.username || void 0 == $scope.username) {
            $scope.usernameErr = true;
            $scope.usernameMsg = "请输入用户名"
        } else if (n.test($scope.username)) {
            $http.post(a.links.check_username_link, {
                username: $scope.username,
                owner_uid: $scope.owner_uid,
                password: $scope.password
            }).success(function (t) {
                if (0 != t.message.errno) {
                    $scope.usernameErr = true;
                    $scope.usernameMsg = "非常抱歉，此用户名已经被注册，你需要更换注册名称！";
                } else {
                    $scope.usernameErr = false;
                    $scope.usernameInvalid = false;
                }
            });
        } else {
            $scope.usernameErr = true,
                $scope.usernameMsg = "用户名格式为 3-15 位字符，可以包括汉字、字母（不区分大小写）、数字、下划线和句点"
        }
    };

    /**
     * 检查用户密码是否合法
     */
    $scope.checkPassword = function () {
        if ("" == $scope.password || void 0 == $scope.password) {
            $scope.passwordErr = true;
            $scope.passwordMsg = "请输入密码";
        } else if ($scope.password.length < 8) {
            $scope.passwordErr = true;
            $scope.passwordMsg = "密码长度不能少于8";
        } else {
            $scope.passwordErr = false;
            $scope.passwordInvalid = false;
        }
    };

    /**
     * 检查密码是否一致
     */
    $scope.checkRepassword = function () {
        if ($scope.repassword != $scope.password) {
            $scope.repasswordErr = true;
            $scope.repasswordMsg = "两次密码输入不一致";
        } else {
            $scope.repasswordErr = false;
            $scope.repasswordInvalid = false;
        }
    };

    /**
     * 重新获取验证码
     * @returns {boolean}
     */
    $scope.changeVerify = function () {
        $scope.image = a.links.img_verify_link + "r=" + Math.round((new Date).getTime());
        return false;
    };

    /**
     * 检查验证码
     */
    $scope.checkCode = function () {
        if ("" == $scope.code || void 0 == $scope.code) {
            $scope.codeErr = true;
            $scope.codeMsg = "请输入验证码";
        } else {
            $http.post(a.links.check_code_link, {
                code: $scope.code
            }).success(function (t) {
                if (0 != t.message.errno) {
                    $scope.codeErr = true;
                    $scope.codeMsg = "请输入正确的验证码";
                    $scope.changeVerify()
                } else {
                    $scope.codeErr = false;
                    $scope.codeInvalid = false;
                }
            });
        }
    };

    $scope.checkExtendfield = function (fieldName) {
        var value = document.getElementsByName(fieldName)[0].value;
        switch (fieldName) {
            case "realname":
                var reg = /^[\u4E00-\u9FA5]{2,5}$/
                    , s = "请输入用户名"
                    , o = "请输入您的真实姓名";
                checkRes = checkFiled(value, fieldName, s, o, reg);
                break;
            case "nickname":
                var reg = /^[\u4e00-\u9fa5a-z\d_\.]{3,15}$/iu
                    , s = "请输入昵称"
                    , o = "昵称格式为 3-15 位字符，可以包括汉字、字母（不区分大小写）、数字、下划线和句点";
                checkRes = checkFiled(value, fieldName, s, o, reg);
                break;
            case "qq":
                if ("" == value || void 0 == value) {
                    $scope.extendfields[fieldName].fieldErr = true;
                    $scope.extendfields[fieldName].fieldMsg = "请输入QQ";
                } else {
                    var reg = /^[1-9][0-9]{4,9}$/
                        , s = "请输入QQ号码"
                        , o = "请输入正确的QQ号码";
                    checkRes = checkFiled(value, fieldName, s, o, reg);
                }
        }
    }
}
]);