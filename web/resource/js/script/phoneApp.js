angular.module("phoneApp", ["we7app"]);

angular.module("phoneApp").controller("phoneCreateCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.uniacid = a.uniacid;
    $scope.version_id = a.version_id;
    $scope.modules = a.modules;
    $scope.selectedModule = a.version_info.modules;
    $scope.phoneappinfo = a.version_info;

    $scope.selectOrCancelModule = function (t) {
        t.selected = !t.selected;
        if (t.selected) {
            $scope.selectedModule = [];
            $scope.selectedModule.push(t);
            $("#add_module").modal("hide");
            return void 0;
        }
    };

    $scope.savePhoneApp = function () {

        if (!$scope.phoneappinfo.name && !$scope.uniacid) {
            util.message("APP名称不可为空！");
            return false;
        } else if (!$scope.phoneappinfo.description) {
            util.message("请填写描述");
            return false;
        } else if ($scope.phoneappinfo.version && /^[0-9]{1,2}\.[0-9]{1,2}(\.[0-9]{1,2})?$/.test($scope.phoneappinfo.version)) {
            $http.post(a.links.create_phone_url, {
                uniacid: $scope.uniacid,
                version_id: $scope.version_id,
                module: $scope.selectedModule,
                name: $scope.phoneappinfo.name,
                description: $scope.phoneappinfo.description,
                version: $scope.phoneappinfo.version
            }).success(function (e) {
                if (0 != e.message.errno) {
                    util.message(e.message.message, "", "error");
                    return false;
                }
                util.message("设置成功", e.redirect, "success");
            });
        } else {
            util.message("版本号错误，只能是数字、点，数字最多两位，例如 1.1.1");
            return false;
        }
    };
}
]);

angular.module("phoneApp").controller("AccountDisplayPhoneappCtrl", ["$scope", "$http", "$timeout", "config", function ($scope, $http, a, config) {
    $scope.phoneapp_lists = config.phoneapp_lists;
    $scope.links = config.links;
    $scope.alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#", "全部"];
    $scope.activeLetter = config.activeLetter;

    $scope.showVersions = function (e) {
        var t = $(e.target).parents(".mask").next(".cut-select");
        "none" == t.css("display") ? (t.css("display", "block"),
            t.parent(".wxapp-list-item").siblings().find(".cut-select").css("display", "none")) : t.css("display", "none")
    };

    $scope.hideSelect = function (e) {
        $(e.target).css("display", "none");
    };

    $scope.searchModule = function (t) {
        $scope.activeLetter = t;
        a(function () {
            $(".button").click()
        }, 500);
    }
}
]);

angular.module("phoneApp").controller("PhoneappWelcomeCtrl", ["$scope", "$http", "config", function ($scope, $http, config) {
    $scope.notices = config.notices
}
]);

angular.module("phoneApp").controller("AccountManagePhoneappCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.phoneapp_version_lists = a.phoneapp_version_lists;
    $scope.phoneapp_modules = a.phoneapp_modules;
    $scope.version_exist = a.version_exist;

    $scope.delPhoneappVersion = function (e) {
        var e = parseInt(e);
        $http.post(a.links.del_version, {
            version_id: e
        }).success(function (e) {
            0 == e.message.errno ? util.message(e.message.message, e.redirect, "success") : util.message(e.message.message)
        });
    }
}
]);