angular.module("we7job", ["we7app"]);

angular.module("we7job").controller("we7job-base-controller", ["$scope", "$http", "config", function ($scope, $http, config) {
    var list = config.list
        , jobid = config.jobid
        , worker = new Worker("resource/js/app/job.js");

    $scope.list = list;

    /**
     * 启动或关闭job
     * @param item
     */
    $scope.start = function (item) {
        item.start = !item.start; // 开启或关闭job
        worker.postMessage(item); // 传递消息给worker线程
    };

    /**
     * 接收来自worker线程的消息
     * @param event
     */
    worker.onmessage = function (event) {
        var itemid = event.data.id;
        $scope.list[itemid].progress = event.data.progress;
        $scope.$apply();
    };

    if (jobid > 0) {
        var item = list[jobid];
        item && $scope.start(item);
    }
}
]);