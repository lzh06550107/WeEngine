angular.module("we7codeuploadApp", ["we7app"]);

angular.module("we7codeuploadApp").controller("code_upload_ctrl", ["$scope", "config", "codeservice", "$q", function ($scope, config, codeservice, $q) {
    $scope.qrcode_src = "";
    $scope.preview_qrcode = "";
    $scope.show_wait = true;
    $scope.step = 1;
    $scope.show_step1 = false;
    $scope.show_step2 = false;
    $scope.show_step3 = false;
    $scope.show_preview = false;
    $scope.wait_sec = 15;
    $scope.user_desc = "";
    $scope.user_version = "";

    var i = null
        , s = null
        , o = 15
        , r = setInterval(function () {

        if (--o <= 0) {
            o = 0;
            clearInterval(r);
        }
        $scope.$apply(function () {
            $scope.wait_sec = o
        });
    }, 1e3);

    $scope.preview = function () {
        codeservice.preview(s, i).then(function (t) {
            $scope.preview_qrcode = "data:image/jpg;base64," + t;
            $scope.show_preview = true;
        }, function (e) {
            util.message(e)
        })
    };

    $scope.commit = function () {
        if (!$scope.user_version || !/^[0-9]{1,2}\.[0-9]{1,2}(\.[0-9]{1,2})?$/.test($scope.user_version))
            return util.message("版本号错误，只能是数字、点，数字最多2位，例如 1.1.1 或1.2"),
                false;
        codeservice.commit(s, i, $scope.user_version, $scope.user_desc).then(function () {
            $scope.show_step2 = false;
            $scope.show_step3 = true;
            $scope.step = 3;
        }, function (e) {
            util.message(e);
        })
    };

    codeservice.codeuid(config.version_id).then(function (uuid) {
        return codeservice.retrycodegen(uuid);
    }).then(function (t) {
        i = t;
        $scope.show_wait = false;
        return codeservice.get_code_token();
    }).then(function (token) {
        $scope.qrcode_src = config.QRCODEURL + "&code_token=" + token;
        clearInterval(r);
        var defered = $q.defer();
        defered.resolve(token);
        return defered.promise;
    }).then(function (token) {
        $scope.show_wait = false;
        $scope.show_step1 = true;
        return codeservice.retrychecksan(token, 408);
    }).then(function (t) {
        $scope.show_step1 = false;
        $scope.show_step2 = true;
        $scope.step = 2;
        s = t;
    }, function (e) {
        clearInterval(r);
        util.message(e);
    })
}
]);

angular.module("we7codeuploadApp").service("codeservice", ["$http", "$q", "config", function ($http, $q, config) {
    return {
        ajax: function (a, n) {
            return $http.get(a).then(function (e) {
                var a = e.data
                    , n = $q.defer();
                return n.resolve(a),
                    n.promise
            }, function () {
                var e = $q.defer();
                return e.reject(),
                    e.promise
            })
        },
        codeuid: function (version_id) {
            var defered = $q.defer();
            this.ajax(config.UUIDURL + "version_id=" + version_id).then(function (e) {
                if ("0" != e.errno) {
                    var t = "小程序应用数据异常，无法获取，请联系开发者";
                    e.message && (t = e.message);
                    defered.reject(t);
                } else
                    defered.resolve(e.data.code_uuid);
            });
            return defered.promise;
        },
        codegen: function (uuid) {
            var defered = $q.defer();
            this.ajax(config.CODE_GEN_CHECK_URL + "code_uuid=" + uuid).then(function (t) {
                if ("0" != t.errno)
                    defered.reject("no gen");
                else {
                    t.data.is_gen;
                    defered.resolve(uuid)
                }
            }, function (e) {
                defered.reject("no gen")
            });
            return defered.promise;
        },
        retrycodegen: function (uuid) {
            var defered = $q.defer()
                , that = this;
            setTimeout(function () {
                that.codegen(uuid).then(function (t) {
                    if (!t)
                        that.retrycodegen(uuid).then(function () {
                            defered.resolve()
                        });
                    return defered.resolve(uuid);
                }, function () {
                    return that.retrycodegen(uuid).then(function () {
                        defered.resolve()
                    });
                })
            }, 5e3);
            return defered.promise;
        },
        get_code_token: function () {
            var defered = $q.defer();
            this.ajax(config.CODE_TOKEN_URL).then(function (t) {
                if ("0" != t.errno)
                    defered.reject();
                else {
                    var a = t.data.code_token;
                    defered.resolve(a)
                }
            });
            return defered.promise;
        },
        checkscan: function (token, n) {
            var defered = $q.defer();
            n || (n = 408);
            var s = config.CHECKSANURL + "&code_token=" + token + "&last=" + n;
            this.ajax(s).then(function (t) {
                if (t.errno > 0) {
                    defered.reject(token, n);
                } else if (0 != t.errno) {
                } else {
                    var a = parseInt(t.data.errcode);
                    defered.resolve({
                        errcode: a,
                        last: n,
                        code_token: t.data.code_token
                    });
                }
            }, function (t) {
                defered.reject(token, n)
            });
            return defered.promise;
        },
        retrychecksan: function (e, a) {
            var n = $q.defer()
                , i = this;
            return i.checkscan(e, a).then(function (t) {
                var a = t.errcode
                    , s = (t.last,
                    t.code_token);
                405 != a ? 403 != a ? 666 != a ? i.retrychecksan(e, a).then(function (e) {
                    n.resolve(e)
                }) : n.reject("二维码已过期") : n.reject("已取消扫码") : n.resolve(s)
            }, function (e, t) {
                console.log("error"),
                    i.retrychecksan(e, t).then(function (e) {
                        n.resolve(e)
                    })
            }),
                n.promise
        },
        preview: function (e, n) {
            var i = $q.defer()
                , s = config.PREVIEWURL + "code_token=" + e + "&code_uuid=" + n;
            return this.ajax(s).then(function (e) {
                if ("0" == e.errno) {
                    var t = e.data.qrcode_img;
                    i.resolve(t)
                }
                var a = e.message;
                "" == a && (a = "预览失败, 确保当前扫码用户有上传小程序的权限"),
                    i.reject(a)
            }),
                i.promise
        },
        commit: function (e, n, i, s) {
            var o = $q.defer()
                ,
                r = config.COMMITURL + "code_token=" + e + "&user_version=" + i + "&user_desc=" + s + "&code_uuid=" + n;
            return this.ajax(r).then(function (e) {
                if ("0" != e.errno) {
                    var t = e.message;
                    "" == t && (t = "上传代码失败, 确保当前扫码用户有上传小程序的权限"),
                        o.reject(t)
                } else
                    o.resolve()
            }),
                o.promise
        }
    }
}
]);