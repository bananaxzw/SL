/// <reference path="SL.Core.js" />
/// <reference path="SL.Data.js" />

sl.create(function () {
    var uu = new SL();
    var Queue = function () { }

    Queue.prototype = {
        queue: function (elem, type, data) {
            if (!elem) {
                return;
            }
            //fx是动画队列 请不要擅自修改
            type = (type || "fx") + "queue";
            var q = sl.data(elem, type);
            if (!data) {
                return q || [];
            }
            if (!q || sl.InstanceOf.Array(data)) {
                q = sl.data(elem, type, sl.Convert.convertToArray(data));

            } else {
                q.push(data);
            }
            if (type = "fx" && q[0] !== "runing") {
                this.dequeue(elem, type);
            }
            return q;
        },
        dequeue: function (elem, type) {
            type = type || "fx";
            var self = this, queue = self.queue(elem, type), fn = queue.shift();
            if (fn === "runing") {
                fn = queue.shift();
            }
            if (fn) {
                if (type === "fx") {
                    queue.unshift("runing");
                }
                fn.call(elem, function () {
                    self.dequeue(elem, type);
                });
            }
        }
    }
    sl.Queue = new Queue();
});