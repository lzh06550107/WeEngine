angular.module("statisticsApp", ["we7app"]);

angular.module("statisticsApp").controller("HorizontalBarCtrl", ["$scope", "$http", "serviceCommon", "config", function ($scope, $http, a, config) {
    require(["echarts"], function (echarts) {
        var s = echarts.init(document.getElementById("chart-line"));
        accountOption = {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "line"
                }
            },
            grid: {
                left: "3%",
                right: "3%",
                bottom: "3%",
                containLabel: true
            },
            xAxis: {
                data: []
            },
            yAxis: {
                splitArea: {
                    show: true
                }
            },
            series: [{
                name: "数量",
                type: "line",
                smooth: true,
                data: []
            }]
        };
        s.showLoading();
        var o = echarts.init(document.getElementById("chart-horizontal-bar"));
        moduleOption = {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow"
                }
            },
            grid: {
                left: "3%",
                right: "3%",
                bottom: "3%",
                containLabel: true
            },
            xAxis: {},
            yAxis: {
                type: "category",
                data: []
            },
            series: [{
                name: "数量",
                type: "bar",
                data: []
            }]
        };
        o.showLoading();
        $scope.active = true;
        $scope.code = "<script type=\"text/javascript\" src=\"{$_W['siteroot']}app/index.php?i={$_W['uniacid']}&c=utility&a=visit&do=showjs&m={$_W['current_module']['name']}\"><\/script>";
        $scope.show = true;
        $scope.accountDateRange = {
            startDate: moment().format("YYYY-MM-DD"),
            endDate: moment().format("YYYY-MM-DD")
        };

        $scope.moduleDateRange = {
            startDate: moment().format("YYYY-MM-DD"),
            endDate: moment().format("YYYY-MM-DD")
        };

        $scope.changeDivideType = function (t, a) {
            "account" == t && ($scope.accountDivideType = a),
            "module" == t && ($scope.moduleDivideType = a),
                $scope.getModuleApi(t, "week")
        };

        $scope.getModuleApi = function (a, i) {
            var r = ""
                , l = ""
                , c = "";
            "account" == a && ($scope.accountTimeType = i,
                $scope.accountLabels = [],
                $scope.accountData = [],
                r = config.links.accountApi,
                l = $scope.accountDivideType,
                c = $scope.accountDateRange),
            "module" == a && ($scope.moduleTimeType = i,
                $scope.moduleLabels = [],
                $scope.moduleData = [],
                r = config.links.moduleApi,
                l = $scope.moduleDivideType,
                c = $scope.moduleDateRange),
                $http.post(r, {
                    divide_type: l,
                    time_type: i,
                    daterange: c
                }).success(function (t) {
                    if (s.hideLoading(),
                        o.hideLoading(),
                    "account" == a && (accountOption.xAxis.data = t.message.message.data_x,
                        accountOption.series[0].data = t.message.message.data_y,
                        s.setOption(accountOption)),
                    "module" == a) {
                        var n = t.message.message.data_y.length;
                        $scope.actualHight = 15 * parseInt(n) + "px",
                            moduleOption.series[0].data = t.message.message.data_x,
                            moduleOption.yAxis.data = t.message.message.data_y,
                            o.setOption(moduleOption)
                    }
                })
        };

        $scope.accountDivideType = "bysum";
        $scope.moduleDivideType = "bysum";
        $scope.accountTimeType = "week";
        $scope.moduleTimeType = "week";
        $scope.getModuleApi("account", $scope.accountTimeType);
        $scope.getModuleApi("module", $scope.moduleTimeType);
        $scope.success = function (e) {
            var e = parseInt(e),
                t = $('<span class="label label-success" style="position:absolute;z-index:10;width:90px;height:34px;line-height:28px;"><i class="fa fa-check-circle"></i> 复制成功</span>');
            a.copySuccess(e, t);
        };

        $scope.changeStatus = function () {
            $scope.show = !$scope.show
        };

        $scope.$watch("moduleDateRange", function (t, a) {
            if (t && t != a) {
                $scope.moduleDateRange.startDate = moment(t.startDate).format("YYYY-MM-DD");
                $scope.moduleDateRange.endDate = moment(t.endDate).format("YYYY-MM-DD");
                $scope.getModuleApi("module", "daterange");
            }
        }, true);

        $scope.$watch("accountDateRange", function (t, a) {
            if (t && t != a) {
                $scope.accountDateRange.startDate = moment(t.startDate).format("YYYY-MM-DD");
                $scope.accountDateRange.endDate = moment(t.endDate).format("YYYY-MM-DD");
                $scope.getModuleApi("account", "daterange");
            }
        }, true);
    })
}
]);

angular.module("statisticsApp").controller("statisticsSettingCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    $scope.setting = a.highest_visit;
    $scope.interval = a.interval;
    $scope.newVisitVal = 0;
    $scope.newInterval = 0;

    $scope.editInfo = function (t, a) {
        switch (t) {
            case "visit":
                $scope.newVisitVal = a || 0;
                break;
            case "interval":
                $scope.newInterval = a || 0
        }
    };

    $scope.saveSetting = function (n) {
        switch (n) {
            case "visit":
                $http.post(a.links.editSetting, {
                    highest_visit: $scope.newVisitVal,
                    type: "highest_visit"
                }).success(function (t) {
                    0 == t.message.errno && ($scope.setting = $scope.newVisitVal),
                        util.message(t.message.message)
                });
                break;
            case "interval":
                $http.post(a.links.editSetting, {
                    interval: $scope.newInterval,
                    type: "interval"
                }).success(function (t) {
                    0 == t.message.errno && ($scope.interval = $scope.newInterval),
                        util.message(t.message.message)
                })
        }
    }
}
]);

angular.module("statisticsApp").controller("systemAccountAppAnalysisCtrl", ["$scope", "$http", "config", function ($scope, $http, config) {
    require(["echarts"], function (echarts) {
        var myEchar = echarts.init(document.getElementById("chart-line"));
        option = {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "line"
                }
            },
            xAxis: {
                data: []
            },
            yAxis: {
                splitArea: {
                    show: true
                }
            },
            series: [{
                name: "数量",
                type: "line",
                smooth: true,
                data: []
            }]
        };
        myEchar.showLoading();
        $scope.dateRange = {
            startDate: moment().format("YYYY-MM-DD"),
            endDate: moment().format("YYYY-MM-DD")
        };
        $scope.changeDivideType = function (t) {
            $scope.divideType = t;
            $scope.getAccountApi("week");
        };
        $scope.getAccountApi = function (n) {
            $scope.timeType = n;
            $http.post(config.links.accountApi, {
                divide_type: $scope.divideType,
                time_type: n,
                daterange: $scope.dateRange
            }).success(function (e) {
                myEchar.hideLoading();
                option.xAxis.data = e.message.message.data_x;
                option.series[0].data = e.message.message.data_y;
                myEchar.setOption(option);
            })
        };

        $scope.divideType = "bysum";
        $scope.timeType = "week";
        $scope.getAccountApi($scope.timeType);
        $scope.$watch("dateRange", function (newData, oldData) {
            if (newData && newData != oldData) {
                $scope.dateRange.startDate = moment(newData.startDate).format("YYYY-MM-DD");
                $scope.dateRange.endDate = moment(newData.endDate).format("YYYY-MM-DD");
                $scope.getAccountApi("daterange");
            }
        }, true)
    })
}
]);

angular.module("statisticsApp").controller("systemAccountAnalysisCtrl", ["$scope", "$http", "config", function ($scope, $http, config) {

    require(["echarts"], function (echarts) {
        var myChart = echarts.init(document.getElementById("chart-line"));
        accountOption = {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "line"
                }
            },
            grid: {
                left: "3%",
                right: "3%",
                bottom: "3%",
                containLabel: true
            },
            xAxis: {
                data: []
            },
            yAxis: {
                splitArea: {
                    show: true
                }
            },
            series: [{
                name: "数量",
                type: "line",
                smooth: true,
                data: []
            }]
        };
        myChart.showLoading();
        $scope.dateRange = {
            startDate: moment().format("YYYY-MM-DD"),
            endDate: moment().format("YYYY-MM-DD")
        };
        $scope.getAccountApi = function (timeType) {
            $scope.timeType = timeType,
                $http.post(config.links.accountApi, {
                    time_type: timeType,
                    daterange: $scope.dateRange
                }).success(function (e) {
                    myChart.hideLoading();
                    accountOption.xAxis.data = e.message.message.data_x;
                    accountOption.series[0].data = e.message.message.data_y;
                    myChart.setOption(accountOption);
                })
        };
        $scope.timeType = "week"; // 默认是周统计
        $scope.getAccountApi($scope.timeType);
        $scope.$watch("dateRange", function (newData, oldData) {

            if (newData && newData != oldData) {
                $scope.dateRange.startDate = moment(newData.startDate).format("YYYY-MM-DD");
                $scope.dateRange.endDate = moment(newData.endDate).format("YYYY-MM-DD");
                $scope.getAccountApi("daterange");
            }
        }, true);
    });
}
]);

angular.module("statisticsApp").controller("CurrentAccountCtrl", ["$scope", "$http", "config", function ($scope, $http, a) {
    require(["echarts"], function (n) {
        var i = n.init(document.getElementById("chart-line"));
        accountOption = {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "line"
                }
            },
            grid: {
                left: "3%",
                right: "3%",
                bottom: "3%",
                containLabel: true
            },
            xAxis: {
                data: []
            },
            yAxis: {
                splitArea: {
                    show: true
                }
            },
            series: [{
                name: "数量",
                type: "line",
                smooth: true,
                data: []
            }]
        };
        i.showLoading();
        $scope.accountDateRange = {
            startDate: moment().format("YYYY-MM-DD"),
            endDate: moment().format("YYYY-MM-DD")
        };

        $scope.getModuleApi = function (n) {
            $scope.accountTimeType = n,
                $http.post(a.links.accountApi, {
                    time_type: n,
                    daterange: $scope.accountDateRange
                }).success(function (e) {
                    i.hideLoading();
                    accountOption.xAxis.data = e.message.message.data_x;
                    accountOption.series[0].data = e.message.message.data_y;
                    i.setOption(accountOption);
                })
        };

        $scope.accountTimeType = "week";
        $scope.getModuleApi($scope.accountTimeType);

        $scope.$watch("accountDateRange", function (t, a) {
            if (t && t != a) {
                $scope.accountDateRange.startDate = moment(t.startDate).format("YYYY-MM-DD");
                $scope.accountDateRange.endDate = moment(t.endDate).format("YYYY-MM-DD");
                $scope.getModuleApi("daterange");
            }
        }, true);
    })
}
]);

angular.module("statisticsApp").service("serviceCommon", ["$rootScope", function (e) {
    var t = {};
    return t.copySuccess = function (e, t) {
        var e = parseInt(e)
            , t = t
            , a = $("#copy-" + e).next().html();
        (!a || a.indexOf('<span class="label label-success" style="position:absolute;z-index:10"><i class="fa fa-check-circle"></i> 复制成功</span>') < 0) && $("#copy-" + e).after(t),
            setTimeout(function () {
                t.remove()
            }, 2e3)
    }
        ,
        t
}
]);