var debug = function(e) {
    console.log(e)
};

var http = {
    ajax: function (url, body, method) {
        var headers = new Headers;
        headers.append("Content-Type", "application/json");
        headers.append("X-Requested-With", "XMLHttpRequest");
        return fetch(url, {
            method: method,
            headers: headers,
            credentials: "same-origin"
        });
    },
    get: function(url) {
        return this.ajax(url, {}, "get")
    },
    post: function(url, body) {
        return this.ajax(url, body, "post")
    },
    json: function(url, body) {
        return this.ajax(url, body).then(function(e) {
            return e.json()
        })
    }
};

var JobManager = {
    jobs: {}, // 保存正在运行的任务
    getJob: function(itemId) {
        return this.jobs[itemId];
    },
    isRunning: function(itemId) {
        var item = this.jobs[itemId];
        if(item && item.running) {
            debug(itemId + ": isRunning");
            return true;
        }
    },
    start: function(item) {
        if(this.isRunning(item.id)) {
            debug(jobId + ": 任务正在运行中");
        }else {
            this.jobs[item.id] = item; //添加到正在运行任务列表中
            this.execute(item); // 然后执行任务
        }
    },
    pause: function(item) {
        delete this.jobs[item.id];
    },
    fire: function(event) {
        postMessage(event)
    },
    execute: function(item) { // 执行jobs列表中的job
        if ((item = this.getJob(item.id)) && !item.runing) {
            item.runing = true;
            try {
                var that = this;
                http.json("/web/index.php?c=system&a=job&do=execute&id=" + item.id).then(function(response) {
                    if(0 == response.message.errno) {
                        that.fire(response.message.message);
                        if(!response.message.message.finished) {
                            setTimeout(function() {
                                that.execute(item);
                            }, 1000);
                        }
                    }
                });
                item.runing = false;
            } catch (e) {
                item.runing = false;
            }
            return true;
        }
    }
};

// 接收主线程发送过来的消息
self.onmessage = function(event) {
    var data = event.data;
    data.start ? JobManager.start(data) : JobManager.pause(data);
};