angular.module("memberAPP", ["we7app"]);

angular.module("memberAPP").controller("group", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.config = a;
    $scope.group_level = $scope.config.group_level;
    $scope.group_person_count = $scope.config.group_person_count;
    $scope.group_list = $scope.config.group_list;
    $scope.default_group = $scope.config.default_group;

    $scope.set_group_detail_info = function (a) {
        $scope.group_detail = {},
            $http.post($scope.config.get_group_url, {
                group_id: a
            }).success(function (t) {
                1 == t.message.errno ? util.message(t.message.message, "", "error") : $scope.group_detail = t.message.message
            }),
            $("#group_detail").modal("show")
    };

    $scope.change_group_level = function () {
        $http.post($scope.config.change_group_level_url, {
            group_level: $scope.group_level
        }).success(function (e) {
            0 == e.message.errno ? util.modal_message("", "设置成功", "", "success") : util.message("设置失败", "", "error")
        })
    };

    $scope.save_group = function () {
        if ("" == $scope.group_detail.title)
            return util.message("请填写会员组名称", "", "error"),
                false;
        $http.post($scope.config.save_group_url, {
            group: $scope.group_detail
        }).success(function (t) {
            1 == t.message.errno && util.message(t.message.message, "", "error"),
            2 == t.message.errno && ($("#group_detail").modal("hide"),
                $scope.group_list[$scope.group_detail.groupid] = $scope.group_detail,
                util.message(t.message.message, "", "success")),
            3 == t.message.errno && (groupid = t.message.message.groupid,
                $scope.group_list[groupid] = t.message.message,
                $("#group_detail").modal("hide"),
                util.message("添加成功", "", "success"))
        })
    };

    $scope.set_default = function (a) {
        $http.post($scope.config.set_default_url, {
            group_id: a
        }).success(function (t) {
            0 == t.message.errno ? ($scope.group_list[a].isdefault = 1,
                $scope.group_list[$scope.default_group.groupid].isdefault = 0,
                $scope.default_group = $scope.group_list[a],
                $scope.apply($scope),
                util.message("设置成功", "", "success")) : util.message("设置失败", "", "error")
        })
    };

    $scope.del_group = function (a) {
        if (!confirm("确定要删除吗？"))
            return false;
        $http.post($scope.config.del_group_url, {
            group_id: a
        }).success(function (t) {
            0 == t.message.errno ? (delete $scope.group_list[a],
                util.message("删除成功", "", "success")) : util.message("删除失败", "", "error")
        })
    }
}
]);

angular.module("memberAPP").controller("baseInformation", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.config = a;
    $scope.profile = $scope.config.profile;
    $scope.groups = $scope.config.groups;
    $scope.addresses = $scope.config.addresses;
    $scope.custom_fields = $scope.config.custom_fields;
    $scope.all_fields = $scope.config.all_fields;
    $scope.uniacid_fields = $scope.config.uniacid_fields;
    $scope.sexes = [{
        id: 0,
        name: "保密"
    }, {
        id: 1,
        name: "男"
    }, {
        id: 2,
        name: "女"
    }];
    $scope.educations = ["博士", "硕士", "本科", "专科", "中学", "小学", "其它"];
    $scope.constellations = ["水瓶座", "双鱼座", "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座"];
    $scope.zodiacs = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
    $scope.bloodtypes = ["A", "B", "AB", "O", "其它"];
    $scope.profile.births = $scope.profile.birthyear + "-" + $scope.profile.birthmonth + "-" + $scope.profile.birthday;
    $scope.profile.resides = $scope.profile.nationality + $scope.profile.resideprovince + $scope.profile.residecity + $scope.profile.residedist;
    $scope.other_field_name = "";
    $scope.other_field_title = "";
    $scope.addAddress = {
        name: "",
        phone: "",
        code: "",
        province: "",
        city: "",
        district: "",
        detail: ""
    };
    $scope.editAddress = {};
    $scope.uid = $scope.config.uid;

    angular.forEach($scope.addresses, function (e, t) {
        e.pcda = e.province + "-" + e.city + "-" + e.district + "-" + e.address;
    });

    $scope.addAdd = function () {
        $scope.addAddress.province = $(".tpl-province").eq(1).val();
        $scope.addAddress.city = $(".tpl-city").eq(1).val();
        $scope.addAddress.district = $(".tpl-district").eq(1).val();
        $("#address-add").modal("hide");

        $http.post(a.links.addAddressUrl, $scope.addAddress).success(function (t) {
            if (0 == t.message.errno) {
                var a = t.message.message;
                a.pcda = a.province + "-" + a.city + "-" + a.district + "-" + a.address,
                    $scope.addresses.push(a),
                    util.message("收货地址添加成功", "", "success")
            } else
                1 == t.message.errno && util.message(t.message.message, "", "error")
        })
    };

    $scope.choseEditAdd = function (addressId) {
        angular.forEach($scope.addresses, function (a, n) {
            if (a.id == addressId) {
                $scope.editAddress = {
                    id: addressId,
                    name: a.username,
                    phone: a.mobile,
                    code: a.zipcode,
                    province: a.province,
                    city: a.city,
                    district: a.district,
                    detail: a.address,
                    uniacid: a.uniacid
                };
                $(".tpl-province").eq(2).attr("data-value", $scope.editAddress.province);
                $(".tpl-city").eq(2).attr("data-value", $scope.editAddress.city);
                $(".tpl-district").eq(2).attr("data-value", $scope.editAddress.district);

                require(["district"], function (e) {
                    $(".tpl-district-container").each(function () {
                        var t = {};
                        t.province = $(this).find(".tpl-province")[0];
                        t.city = $(this).find(".tpl-city")[0];
                        t.district = $(this).find(".tpl-district")[0];
                        var a = {};
                        a.province = $(t.province).attr("data-value");
                        a.city = $(t.city).attr("data-value");
                        a.district = $(t.district).attr("data-value");
                        e.render(t, a, {
                            withTitle: true
                        });
                    })
                })
            }
        })
    };

    $scope.editAdd = function (n) {
        $scope.editAddress.province = $(".tpl-province").eq(2).val();
        $scope.editAddress.city = $(".tpl-city").eq(2).val();
        $scope.editAddress.district = $(".tpl-district").eq(2).val();
        $("#address-edit").modal("hide");

        $http.post(a.links.editAddressUrl, $scope.editAddress).success(function (t) {
            if (0 == t.message.errno) {
                var a = t.message.message;
                a.pcda = a.province + "-" + a.city + "-" + a.district + "-" + a.address;
                angular.forEach($scope.addresses, function (e, t) {
                    a.id == e.id && (e.pcda = a.pcda)
                });
                util.message("收货地址修改成功", "", "success");
            } else
                1 == data.message.errno && util.message(t.message.message, "", "error");
        })
    };

    $scope.delAdd = function (addressId) {
        $http.post(a.links.delAddressUrl, {
            id: addressId
        }).success(function (t) {

            if (0 == t.message.errno) {
                angular.forEach($scope.addresses, function (t, a) {
                    addressId == t.id && $scope.addresses.splice(a, 1);
                });
                util.message("收货地址删除成功", "", "success");
            } else {
                1 == data.message.errno && util.message(t.message.message, "", "error");
            }
        });
    };

    $scope.setDefaultAdd = function (addressId) {
        $http.post(a.links.setDefaultAddressUrl, {
            id: addressId,
            uid: $scope.uid
        }).success(function (t) {

                if (0 == t.message.errno) {
                    angular.forEach($scope.addresses, function (e, t) {
                        addressId == e.id ? e.isdefault = 1 : e.isdefault = 0
                    });
                    util.message("设置成功", "", "success");
                } else {
                    util.message("设置失败", "", "success");

                }
            }
        );
    };

    $scope.changeImage = function (t) {
        "avatar" == t && require(["fileUploader"], function (fileUploader) {
            fileUploader.init(function (a) {
                $scope.profile.avatar = a.attachment;
                $scope.profile.avatarUrl = a.url;
                $scope.$apply($scope.profile);
                $scope.httpChange(t);
            }, {
                direct: true,
                multiple: false
            })
        })
    };

    $scope.editInfo = function (field, fieldVaule) {
        $scope.userOriginal = {};

        if ("other_field" == field) {
            $scope.userOriginal[fieldVaule] = $scope.profile[fieldVaule];
            $scope.other_field_name = $scope.all_fields[fieldVaule];
            $scope.other_field_title = fieldVaule;
        } else {
            $scope.userOriginal[field] = fieldVaule;
        }
    };

    $scope.httpChange = function (field, i) {
        switch (field) {
            case "avatar":
                $http.post(a.links.basePost, {
                    type: field,
                    imgsrc: $scope.profile.avatar
                }).success(function (e) {
                    if (0 == e.message.errno) {
                        util.message("修改成功！", "", "success")
                    } else {
                        -1 == e.message.errno && util.message(e.message.message, e.redirect, "error");
                        1 == e.message.errno && util.message(e.message.message, "", "error");
                    }
                });
                break;
            case "groupid":
            case "gender":
            case "education":
            case "nickname":
            case "realname":
            case "address":
            case "mobile":
            case "qq":
            case "email":
            case "telephone":
            case "msn":
            case "taobao":
            case "alipay":
            case "graduateschool":
            case "grade":
            case "studentid":
            case "revenue":
            case "position":
            case "occupation":
            case "company":
            case "nationality":
            case "height":
            case "weight":
            case "idcard":
            case "zipcode":
            case "site":
            case "affectivestatus":
            case "lookingfor":
            case "bio":
            case "interest":
            case "constellation":
            case "zodiac":
            case "bloodtype":
                $("#" + field).modal("hide");
                if ("" == $scope.userOriginal[field]) {
                    util.message("不可为空！", "", "error");
                    return false;
                }
                if ("mobile" == field && !/^\d{11}$/.test($scope.userOriginal[field])) {
                    util.message("手机号格式错误", "", "error");
                    return false;
                }
                $http.post(a.links.basePost, {
                    type: field,
                    request_data: $scope.userOriginal[field]
                }).success(function (t) {
                    0 == t.message.errno ? ($scope.profile[field] = $scope.userOriginal[field],
                        util.message("修改成功！", "", "success")) : (-1 == t.message.errno && util.message(t.message.message, t.redirect, "error"),
                    1 == t.message.errno && util.message(t.message.message, "", "error"))
                });
                break;
            case "other_field":
                $("#" + field).modal("hide");
                if ("" == $scope.userOriginal[$scope.other_field_title]) {
                    util.message("不可为空！", "", "error");
                    return false;
                }
                $http.post(a.links.basePost, {
                    type: $scope.other_field_title,
                    request_data: $scope.userOriginal[$scope.other_field_title]
                }).success(function (t) {
                    0 == t.message.errno ? ($scope.profile[$scope.other_field_title] = $scope.userOriginal[$scope.other_field_title],
                        util.message("修改成功！", "", "success")) : (-1 == t.message.errno && util.message(t.message.message, t.redirect, "error"),
                    1 == t.message.errno && util.message(t.message.message, "", "error"))
                });
                break;
            case "births":
                $(".modal").modal("hide");
                var s = $(".tpl-year").val()
                    , o = $(".tpl-month").val()
                    , r = $(".tpl-day").val();
                $http.post(a.links.basePost, {
                    type: field,
                    birthyear: s,
                    birthmonth: o,
                    birthday: r
                }).success(function (t) {
                    0 == t.message.errno ? ($scope.profile.births = s + "-" + o + "-" + r,
                        util.message("修改成功！", "", "success")) : (-1 == t.message.errno && util.message(t.message.message, t.redirect, "error"),
                    1 == t.message.errno && util.message(t.message.message, "", "error"))
                });
                break;
            case "resides":
                $(".modal").modal("hide");
                var l = $(".tpl-province").eq(0).val()
                    , c = $(".tpl-city").eq(0).val()
                    , u = $(".tpl-district").eq(0).val();
                $http.post(a.links.basePost, {
                    type: field,
                    resideprovince: l,
                    residecity: c,
                    residedist: u
                }).success(function (t) {
                    0 == t.message.errno ? ($scope.profile.resides = $scope.profile.nationality + l + c + u,
                        util.message("修改成功！", "", "success")) : (-1 == t.message.errno && util.message(t.message.message, t.redirect, "error"),
                    1 == t.message.errno && util.message(t.message.message, "", "error"))
                });
                break;
            case "password":
                $(".modal").modal("hide");
                var d = $(".new-password").val()
                    , p = $(".renew-password").val();
                if ("" == d)
                    return util.message("新密码不可为空！"),
                        false;
                if ("" == p)
                    return util.message("确认新密码不可为空！"),
                        false;
                if (d != p)
                    return util.message("两次密码不一致！"),
                        false;
                $http.post(a.links.basePost, {
                    type: field,
                    password: d
                }).success(function (e) {
                    0 == e.message.errno ? util.message("密码修改成功！") : (-1 == e.message.errno && util.message(e.message.message, e.redirect, "error"),
                    1 == e.message.errno && util.message(e.message.message, "", "error"))
                })
        }
    }
}
]);