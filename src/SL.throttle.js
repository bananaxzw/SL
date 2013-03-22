/*

debounce
形像的比喻是橡皮球。如果手指按住橡皮球不放，它就一直受力，不能反弹起来，直到松手。

debounce 的关注点是空闲的间隔时间。

/**
* 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 idle，action 才会执行
* @param idle   {number}    空闲时间，单位毫秒
* @param action {function}  请求关联函数，实际应用需要调用的函数
* @param tail?  {bool}      是否在尾部执行
* @return {function}	返回客户调用函数
*/
/*debounce(idle,action,tail?)
throttle
形像的比喻是水龙头或机枪，你可以控制它的流量或频率。

throttle 的关注点是连续的执行间隔时间。

/**
* 频率控制 返回函数连续调用时，action 执行频率限定为 次 / delay
* @param delay  {number}    延迟时间，单位毫秒
* @param action {function}  请求关联函数，实际应用需要调用的函数
* @param tail?  {bool}      是否在尾部用定时器补齐调用
* @return {function}	返回客户调用函数
*/
/*throttle(delay,action,tail?)
样例代码
// ajaxQuery 将在停止输入 250 毫秒后执行
$('#autocomplete').addEventListener('keyup',debounce(250,function() {
ajaxQuery(this.value,renderUI);
},true))
// 当窗口大小改变时，以 50 毫秒一次的频率为单位执行定位函数 position
/*window.addEventListener('resize',throttle(50,position,true) );
应用
只要牵涉到连续事件或频率控制相关的应用都可以考虑到这两个函数，比如：

游戏射击，keydown 事件
文本输入、自动完成，keyup 事件
鼠标移动，mousemove 事件
DOM 元素动态定位，window对象的resize和scroll 事件
前两者 debounce 和 throttle 都可以按需使用；后两者肯定是用 throttle 了。

如果不做过滤处理，每秒种甚至会触发数十次相应的事件。尤其是 mousemove 事件，每移动一像素都可能触发一次事件。如果是在一个画布上做一个鼠标相关的应用，过滤事件处理是必须的，否则肯定会造成糟糕的体验。

实现中要注意的是 throttle 函数可以不使用定时器，这时关联的函数都同步执行，这样很不错，比如一个游戏射击应用，50ms间隔，没什么影响。但是如果是一个固定元素定位应用，就有可能必须考虑补上最后一次触发事件了，这时就必须用到定时器。

同样的，使用中注意的有：

1) 返回值。如果关联的函数有返回值的话，如果某次触发是异步执行的，返回值就获取不到了。可以考虑扩展这里使用的版本，添加回调函数参数或扩展成 throttle 对象来使用。

2) 传入参数。我直接捕获了闭包中的 arguments 参数，异步执行时会使用最后一次触发的参数。

我在流行的 Rx、Ext 和 Underscore 中都看到过类似的函数。对比了一下， Underscore 中的函数是简化了的， debounce 只能在尾部执行， throttle 关联的函数全部是异步执行——首次触发时它甚至不会去执行关联函数，这是定时器本身延后执行的特性。

感受最深的是，以往我可能是写上好几个变量来控制频率。但是一旦知道了这一类的行为的模式和名称之后，就可以一次性解决这一类问题。
*/





/// <reference path="SL.Core.js" />


/**
*空闲执行控制
*@namespace
*@name throttle
*/
sl.create(function () {

    /*
    *频率控制 返回函数连续调用时，action 执行频率限定为 次 / delay
    *@memberOf throttle
    *@function
    *@param delay  {number}    延迟时间，单位毫秒
    *@param action {function}  请求关联函数，实际应用需要调用的函数
    *@param tail?  {bool}      是否在尾部用定时器补齐调用
    *@param ctx {object} 作用域 默认为sl对象
    *@return {function}	返回客户调用函数
    */
    var throttle = function (delay, action, tail, debounce,ctx) {
        var now = function () {
            return new Date();
        }, last_call = 0, last_exec = 0, timer = null, curr, diff,
       args, exec = function () {
            last_exec = now();
            action.apply(ctx, args);
        };

        return function () {
            ctx = ctx||this, args = arguments,
        curr = now(), diff = curr - (debounce ? last_call : last_exec) - delay;

            clearTimeout(timer);

            if (debounce) {
                if (tail) {
                    timer = setTimeout(exec, delay);
                } else if (diff >= 0) {
                    exec();
                }
            } else {
                if (diff >= 0) {
                    exec();
                } else if (tail) {
                    timer = setTimeout(exec, -diff);
                }
            }

            last_call = curr;
        }
    }
    /*
    * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 idle，action 才会执行
    *@memberOf throttle
    *@function
    *@param idle   {number}    空闲时间，单位毫秒
    *@param action {function}  请求关联函数，实际应用需要调用的函数
    *@param tail?  {bool}      是否在尾部执行
    *@param ctx {object} 作用域 默认为sl对象
    *@return {function}	返回客户调用函数
    */
    var debounce = function (idle, action, tail,ctx) {
        return throttle(idle, action, tail, true,ctx);
    }
    sl.throttle = throttle;
    sl.debounce = debounce;

});
