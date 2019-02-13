angular.module("homeApp", ["we7app"]);

angular.module("homeApp").controller("WelcomeCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.notices = a.notices;
    $scope.loaderror = 0;
    $scope.last_modules = null; // 从微擎商城获取最新模块应用
    $scope.fans_kpi = []; // 昨天和今天的粉丝变化

    $http({
        method: "POST",
        url: "./index.php?c=home&a=welcome&do=get_fans_kpi"
    }).success(function (t) {
        0 == t.message.errno && ($scope.fans_kpi = t.message.message)
    });

    $scope.get_last_modules = function () {
        $http.post("./index.php?c=home&a=welcome&do=get_last_modules").success(function (t) {
            if (0 == t.message.errno) {
                var a = [];
                angular.forEach(t.message.message, function (e, t) {
                    e.wxapp || a.push(e)
                });
                $scope.last_modules = a;
            } else
                $scope.last_modules = null;
            $scope.loaderror = 1;
        })
    };

    $scope.get_last_modules() // 从微擎商城获取最新模块应用
}
]);

angular.module("homeApp").controller("systemWelcomeCtrl", ["$scope", "$http", "config", function (e, t, a) {
    e.account_num = a.account_num,
        e.last_accounts_modules = a.last_accounts_modules,
        e.message_list = a.message_list,
        e.links = a.links,
        e.user_info = a.user_info,
        e.setTop = function (a) {
            t.post(e.links.setTop, {
                id: a
            }).success(function (e) {
                0 == e.message.errno && location.reload()
            })
        }
}
]);