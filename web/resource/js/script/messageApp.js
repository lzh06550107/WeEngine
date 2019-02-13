angular.module("messageApp", ["we7app"]);

angular.module("messageApp").controller("messageNoticeCtrl", ["$scope", "$http", "config", function ($scope, $http, config) {

    $scope.type = config.type; // 通知类型
    $scope.lists = config.lists; // 通知列表
    $scope.is_read = config.is_read; // 通知是否已经读取
    $scope.all_read_url = config.all_read_url; // 把所有通知标记为已读链接

    $scope.allRead = function () {
        $http.post($scope.all_read_url, {
            type: $scope.type
        }).success(function (e) {
            util.message(e.message.message, e.redirect, "ajax");
        })
    }
}
]);