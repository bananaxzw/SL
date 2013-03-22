
/// <reference path="SL.Core.js" />
/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description  SL框架浏览器辅助 目前只提供浏览器版本的判断
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/

sl.create(function () {
    /**
    *浏览器信息 目前只提供版本判断
    *@class
    *@name Browser
    *@example 
    * alert(sl.Browser.chrome)
    * alert(sl.Browser.ie);
    */
    function Browser() {


        var _this = this;
        var pf = navigator.platform.toLowerCase(),
        ua = navigator.userAgent.toLowerCase(), s;

        function fixedVersion(ver, floatLength) {
            ver = ("" + ver).replace(/_/g, ".");
            floatLength = floatLength || 1;
            ver = String(ver).split(".");
            ver = ver[0] + "." + (ver[1] || "0");
            ver = Number(ver).toFixed(floatLength);
            return ver;

        }
        function set(name, version) {
            _this.name = name;
            _this.version = version;
            _this[name] = version;

        }

        (s = ua.match(/msie ([\d.]+)/)) ? set("ie", fixedVersion(s[1])) :
    (s = ua.match(/firefox\/([\d.]+)/)) ? set("firefox", fixedVersion(s[1])) :
    (s = ua.match(/chrome\/([\d.]+)/)) ? set("chrome", fixedVersion(s[1])) :
    (s = ua.match(/opera.([\d.]+)/)) ? set("opera", fixedVersion(s[1])) :
    (s = ua.match(/adobeair\/([\d.]+)/)) ? set("adobeAir", fixedVersion(s[1])) :
    (s = ua.match(/version\/([\d.]+).*safari/)) ? set("safari", fixedVersion(s[1])) : 0;
    };

    Browser.prototype = {
        /** 
        * ie版本判断 如果是ie返回2位IE版本号 如果不是ie则返回0
        * @default 0 
        * @type number 
        * @example 
        */
        ie: 0,
        /** 
        *firefox: 0,
        * firefox版本判断 如果是返回firefox版本号 如果不是firefox则返回0
        * @default 0 
        * @type number 
        * @example 
        */
        firefox: 0,
        /** 
        * chrome版本判断 如果是chrome返回版本号 如果不是chrome则返回0
        * @default 0 
        * @type number 
        * @example 
        */
        chrome: 0,
        /** 
        * opera版本判断 如果是opera返回版本号 如果不是opera则返回0
        * @default 0 
        * @type number 
        * @example 
        */
        opera: 0,
        /** 
        * adobeAir版本判断 如果是adobeAir版本号 如果不是adobeAir则返回0
        * @default 0 
        * @type number 
        * @example 
        */
        adobeAir: 0,
        /** 
        * safari版本判断 如果是safari返回版本号 如果不是safari则返回0
        * @default 0 
        * @type number 
        * @example 
        */ 
        safari : 0
    }

    sl.Browser = sl.Browser || {};
    sl.Browser = new Browser();
});



