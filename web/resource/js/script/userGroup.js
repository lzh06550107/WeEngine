angular.module("userGroup", ["we7app"]);

angular.module("userGroup").controller("UserGroupDisplay", ["$scope", "config", function ($scope, config) {
    $scope.lists = config.lists;
    $scope.links = config.links;
    $scope.editGroup = function (groupId) {
        var t = parseInt(groupId);
        location.href = $scope.links.groupPost + "id=" + t
    };

    $scope.delGroup = function (groupId) {
        var t = parseInt(groupId);
        location.href = $scope.links.groupDel + "id=" + t
    };
}
]);

angular.module("userGroup").controller("UserGroupPost", ["$scope", "config", function ($scope, config) {
    $scope.groupInfo = config.groupInfo;
    $scope.packages = config.packages;
    $scope.changeText = function ($event) {
        var t = $event.target.text;
        $event.target.text = "展开" == t ? "收起" : "展开"
    }
}
]);

angular.module("userGroup").controller("ViceGroupDisplay", ["$scope", "config", function (e, t) {
    e.lists = t.lists,
        e.links = t.links,
        e.editGroup = function (t) {
            var t = parseInt(t);
            location.href = e.links.groupPost + "id=" + t
        }
        ,
        e.delGroup = function (t) {
            var t = parseInt(t);
            location.href = e.links.groupDel + "id=" + t
        }
}
]);

angular.module("userGroup").controller("ViceGroupPost", ["$scope", "config", function (e, t) {
    e.groupInfo = t.groupInfo,
        e.packages = t.packages,
        e.changeText = function (e) {
            var t = $(e)[0].target.text;
            $(e)[0].target.text = "展开" == t ? "收起" : "展开"
        }
}
]);