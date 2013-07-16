/// <reference path="SL.Core.js" />
/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description  SL框架 cookie常规操作
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/

sl.create(function () {
    /**
    * @class
    * @name Cookie
    * @example
    * sl.Cookie.set("name1", "xuzhiwei", ".testxuzhiwei11.com", "/", 1);
    * console.log(sl.Cookie.get("name1"));
    * sl.Cookie.remove("name1");
    * console.log(sl.Cookie.get("name1"));
    */
    var Cookie = function () { };
    Cookie.prototype = {
        /**
         * 获取指定名称的cookie值
         * 
         * @param {String} name cookie名称
         * @return {String} 获取到的cookie值
         */
        get: function (name) {
            /// <summary>
            /// 获取cookie
            /// </summary>
            /// <param name="name"></param>
            /// <returns type=""></returns>
            var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)");
            var m = window.document.cookie.match(r);
            return (!m ? "" : m[1]);
        },
        /**
        * 设置一个cookie
        * @param {String} name cookie名称
        * @param {String} value cookie值
        * @param {String} domain 所在域名
        * @param {String} path 所在路径
        * @param {Number} hour 存活时间，单位:小时
        * @param {Boolean} secure 是否采用安全传输
        * @return {Boolean} 是否成功
        */
        set: function (name, value, domain, path, hour,secure) {
            /// <summary>
            /// 设置cookie
            /// </summary>
            /// <param name="name"></param>
            /// <param name="value"></param>
            /// <param name="domain"></param>
            /// <param name="path"></param>
            /// <param name="hour"></param>
            /// <returns type=""></returns>
            if (hour) {
                var today = new Date();
                var expire = new Date();
                expire.setTime(today.getTime() + 3600000 * hour);
            }

            var string = name + "=" + value + "; " + (hour ? ("expires=" + expire.toGMTString() + "; ") : "") + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + window.location.host + ";")) + (secure ? " secure" : "");
            window.document.cookie =string;
            return true;
        },
        /**
        * 删除指定cookie,复写为过期
        * 
        * @param {String} name cookie名称
        * @param {String} domain 所在域
        * @param {String} path 所在路径
        */
        remove: function (name, domain, path) {
            /// <summary>
            /// 移除cookie
            /// </summary>
            /// <param name="name"></param>
            /// <param name="domain"></param>
            /// <param name="path"></param>
            window.document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + window.location.host + ";"));
        }
    };

    sl.Cookie = SL.Cookie || {};
    sl.Cookie = new Cookie();
});