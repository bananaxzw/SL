
/** 
* Timer 模型 
* 
* @author rainsilence 
* @version 2.0 
*/
(function () {
    /** 
    * TimerEvent constructor 构造器 
    * 
    * @param type 事件类型 
    * @param bubbles 是否毛票 
    * @param cancelable 是否可取消 
    */
    TimerEvent = function (type, bubbles, cancelable) {
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
    };
    /** 
    * Event 时间事件声明 
    * 
    * @event TIMER 
    * @event TIMER_COMPLETE 
    */
    extend(TimerEvent, {
        TIMER: "timer",
        TIMER_COMPLETE: "timerComplete"
    });
    /** 
    * Event 方法 
    * 
    * @method toString 
    */
    extend(TimerEvent.prototype, {
        toString: function () {
            return "[TimerEvent type=" + this.type +
" bubbles=" + this.bubbles +
" cancelable=" + this.cancelable + "]";
        }
    });
    /** 
    * Extend 扩展类，对象的属性或者方法 
    * 
    * @param target 目标对象 
    * @param methods 这里改成param也许更合适，表示承载着对象，方法的对象，用于target的扩展 
    */
    function extend(target, methods) {
        if (!target) {
            target = {};
        }
        for (var prop in methods) {
            target[prop] = methods[prop];
        }
        return target;
    }
    /** 
    * Timer 构造器 
    * 
    * @param delay 延时多少时间执行方法句柄 
    * @param repeatCount 重复多少次，如果不设置，代表重复无限次 
    */
    Timer = function (delay, repeatCount) {
        var listenerMap = {};
        listenerMap[TimerEvent.TIMER] = [];
        listenerMap[TimerEvent.TIMER_COMPLETE] = [];
        extend(this, {
            currentCount: 0,
            running: false,
            delay: delay,
            repeatCount: repeatCount,
            // true:Interval,false:Timeout 
            repeatType: repeatCount == null || repeatCount < 1 ? true : false,
            handler: listenerMap,
            timerId: 0,
            isCompleted: false
        });
    };
    // 事件对象初始化（这部分未实现） 
    var timerEvent = new TimerEvent(TimerEvent.TIMER, false, false);
    var timerCompleteEvent = new TimerEvent(TimerEvent.TIMER_COMPLETE, false, false);
    /** 
    * Timer 计时器方法 
    * 
    * @method addEventListener 增加一个方法句柄（前两个参数必须，后一个参数可选） 
    * @method removeEventListener 移除一个方法句柄 
    * @method start 开始计时器 
    * @method stop 结束计时器 
    * @method reset 重置计时器 
    */
    extend(Timer.prototype, {
        addEventListener: function (type, listener, useCapture) {
            if (type == TimerEvent.TIMER || type == TimerEvent.TIMER_COMPLETE) {
                if (!listener) {
                    alert("Listener is null");
                }
                if (useCapture == true) {
                    this.handler[type].splice(0, 0, [listener]);
                } else {
                    this.handler[type].push(listener);
                }
            }
        },
        removeEventListener: function (type, listener) {
            if (type == TimerEvent.TIMER || type == TimerEvent.TIMER_COMPLETE) {
                if (!listener) {
                    this.handler[type] = [];
                } else {
                    var listeners = this.handler[type];
                    for (var index = 0; index < listeners.length; index++) {
                        if (listeners[index] == listener) {
                            listeners.splice(index, 1);
                            break;
                        }
                    }
                }
            }
        },
        start: function () {
            var timerThis = this;
            if (this.running == true || this.isCompleted) {
                return;
            }
            if (this.handler[TimerEvent.TIMER].length == 0 &&
this.handler[TimerEvent.TIMER_COMPLETE].length == 0) {
                alert("No Function");
                return;
            }
            if (this.repeatType) {
                this.timerId = setInterval(function () {
                    dispachListener(timerThis.handler[TimerEvent.TIMER], timerEvent);
                    timerThis.currentCount++;
                }, this.delay);
            } else {
                this.timerId = setTimeout(function () { delayExecute(timerThis.handler[TimerEvent.TIMER]); }, this.delay);
            }
            this.running = true;
            function delayExecute(listeners) {
                dispachListener(listeners, timerEvent);
                timerThis.currentCount++;
                if (timerThis.currentCount < timerThis.repeatCount) {
                    if (timerThis.running) {
                        timerThis.timerId = setTimeout(function () { delayExecute(listeners); }, timerThis.delay);
                    }
                } else {
                    timerThis.running = false;
                }
                if (timerThis.running == false) {
                    if (!timerThis.isCompleted) {
                        dispachListener(timerThis.handler[TimerEvent.TIMER_COMPLETE], timerCompleteEvent);
                    }
                    timerThis.isCompleted = true;
                }
            }
            function dispachListener(listeners, event) {
                for (var prop in listeners) {
                    listeners[prop](event);
                }
            }
        },
        stop: function () {
            this.running = false;
            if (this.timerId == null) {
                return;
            }
            if (this.repeatType) {
                clearInterval(this.timerId);
            } else {
                clearTimeout(this.timerId);
            }
            if (!this.isCompleted) {
                var listeners = this.handler[TimerEvent.TIMER_COMPLETE];
                for (var prop in listeners) {
                    listeners[prop](timerCompleteEvent);
                }
            }
            this.isCompleted = true;
        },
        reset: function () {
            this.currentCount = 0;
            this.isCompleted = false;
        }
    });
})(); 