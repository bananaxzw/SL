/// <reference path="SL.Core.js" />
/// <reference path="SL.Data.js" />

/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description  SL框架 事件操作
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/


SL().create(function (SL) {

    /**
    * Event
    * @class
    *@name Event
    */
    var Event = function () {
        //事件注册函数的唯一标识
        this.guid = 1;
    };
    Event.prototype = {
        /**
        *注册事件
        *@param {domElement} element dom元素
        *@param {String} type 事件类型 
        *@param {Function} handler 事件处理函数
        *@param {Object} data 事件扩展数据
        *@example 
        * var tt = document.getElementById("sff");
        * SL().Event.addEvent(tt, "click", function (event) {
        *    console.log(event.extendData.name);
        *}, { "name": "xuzhiwei" });
        *SL().Event.addEvent(tt, "click", function (event) {
        *    console.log(event.extendData.name);
        *}, { "name": "xuzhiwei1" });
        *function see() {
        *    alert("i see you!");
        *}
        *SL().Event.addEvent(tt, "click", see);
        */
        addEvent: function (element, type, handler, data) {
            var _this = this;
            //给函数分配唯一的标志ID
            if (!handler.$$guid) handler.$$guid = this.guid++;
            //创建一个hash table来保存各种事件的处理函数  
            //element.events = element.events || {};
            var events = sl.data(element, "events") || sl.data(element, "events", {});
            //创建一个hash table来保存某个事件处理函数
            //var handlers = element.events[type];
            var handlers = events[type];
            if (!handlers) {
                //handlers = element.events[type] = {};
                handlers = events[type] = {};
                //储存已经存在的事件处理函数
                if (element["on" + type]) {
                    handlers[0] = { "handler": element["on" + type], "data": null };
                }
            }
            // 保存时间处理函数到hash table中
            handlers[handler.$$guid] = { "handler": handler, "data": data };
            // 为事件提供一个统一全局的处理函数 这句是关键handleEvent函数属于element，也就是说函数的内部this是指向element
            element["on" + type] = handleEvent;

            function handleEvent(event) {

                var returnValue = true;
                event = arguments[0] = (event || _this.fixEvent(window.event));
                //                if (!this.events) return;
                //                if (!this.events[event.type]) return;
                if (!sl.data(this, "events") || !sl.data(this, "events")[event.type]) return;
                //注意这里的this指向dom元素 因为addEvent中element["on" + type] = handleEvent
                //获取已经缓存到dom元素的events属性的各个事件函数
                //var handlers = this.events[event.type];
                var handlers = sl.data(this, "events")[event.type];
                //遍历已经缓存到元素的事件
                for (var i in handlers) {
                    var handler = handlers[i]["handler"];
                    event.extendData = handlers[i]["data"];
                    this.$$handleEvent = handler;
                    if (this.$$handleEvent.apply(this, arguments) === false) {
                        returnValue = false;
                    }
                }
                return returnValue;
            }
        },
        /**
        *反注册事件
        *@param {domElement} element dom元素
        *@param {String} type 事件类型 
        *@param {Function} handler 事件处理函数
        *@example
        *   SL().Event.removeEvent(tt, "click", see);
        */
        removeEvent: function (element, type, handler) {
            if (element.events && element.events[type] && type && handler) {
                delete element.events[type][handler.$$guid];
            }
            else if (element.events && element.events[type] && type) {
                delete element.events[type];
            } else if (element.events) {
                delete element.events;
            }
        },
        fixEvent: function (oEvent) {
            oEvent.charCode = (oEvent.type == "keypress") ? oEvent.keyCode : 0;
            oEvent.eventPhase = 2;
            oEvent.isChar = (oEvent.charCode > 0);
            oEvent.pageX = oEvent.clientX + document.documentElement.scrollLeft || document.body.scrollLeft;
            oEvent.pageY = oEvent.clientY + document.documentElement.scrollTop || document.body.scrollTop;
            oEvent.preventDefault = function () {
                this.returnValue = false;
            };
            if (oEvent.type == "mouseout") {
                oEvent.relatedTarget = oEvent.toElement;
            } else if (oEvent.type == "mouseover") {
                oEvent.relatedTarget = oEvent.fromElement;
            }
            oEvent.stopPropagation = function () {
                this.cancelBubble = true;
            };
            oEvent.target = oEvent.srcElement;
            oEvent.time = (new Date).getTime();
            return oEvent;
        },
        triggerEvent: function (event, data, element) {
            var type = event.type || event;
            var handle = element["on" + type];
            event = {};
            event["target"] = element, event["type"] = type;
            if (handle) {
                data = SL.Convert.convertToArray(data);
                data.unshift(event);
                handle.apply(element, data);
            }
        },
        hover: function (element, enterfn, leavefn) {
            this.addEvent(element, "mouseover", enterfn);
            this.addEvent(element, "mouseout", leavefn);
        }

    };

    SL.Event = SL.Event || {};
    SL.Event = new Event();

});