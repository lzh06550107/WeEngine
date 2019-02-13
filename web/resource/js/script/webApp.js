angular.module("webApp", ["we7app"]);

angular.module("webApp").controller("webappModuleLinkUniacidCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.modules = a.modules;
    $scope.module = "";
    $scope.linkWxappAccounts = "";
    $scope.linkAppAccounts = "";
    $scope.selectedAccount = "";

    $scope.tabChange = function (index) {
        $scope.jurindex = index;
        1 != index || $scope.linkAppAccounts || $scope.searchLinkAccount($scope.module, "app");
        1 == $scope.jurindex && $("#account-wxapp .row").find(".item").removeClass("active");
        0 == $scope.jurindex && $("#account-app .row").find(".item").removeClass("active");
        $scope.selectedAccount = "";
    };

    $scope.searchLinkAccount = function (n, i) {
        $scope.module = n,
            $("#show-account").modal("show"),
            "wxapp" == i ? ($scope.tabChange(0),
                $scope.loadingWxappData = true) : $scope.loadingAppData = true,
            $http.post(a.links.search_link_account, {
                module_name: n,
                type: "wxapp" == i ? a.wxapp : a.app
            }).success(function (t) {
                console.log(t),
                    "wxapp" == i ? ($scope.loadingWxappData = false,
                        $scope.linkWxappAccounts = t.message.message,
                        $scope.linkAppAccounts = "") : ($scope.loadingAppData = false,
                        $scope.linkAppAccounts = t.message.message),
                    console.log($scope.linkWxappAccounts)
            })
    };

    $scope.selectLinkAccount = function (t, a) {
        $(a.target).parentsUntil(".col-sm-2").addClass("active"),
            $(a.target).parentsUntil(".col-sm-2").parent().siblings().find(".item").removeClass("active"),
            $scope.selectedAccount = t
    };

    $scope.module_unlink_uniacid = function (e) {
        $http.post(a.links.module_unlink_uniacid, {
            module_name: e
        }).success(function (e) {
            e.message.errno,
                util.message(e.message.message, e.redirect)
        })
    };

    $scope.moduleLinkUniacid = function () {
        $("#show-account").modal("hide"),
            $http.post(a.links.module_link_uniacid, {
                module_name: $scope.module,
                submit: "yes",
                token: a.token,
                uniacid: $scope.selectedAccount.uniacid
            }).success(function (e) {
                0 == e.message.errno ? util.message("关联成功", "refresh", "success") : util.message(e.message.message)
            });
        $scope.module = "";
    };
}
]);