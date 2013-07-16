/// <reference path="SL.Core.js" />
/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description  SL框架 URL帮助类
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/


SL().create(function (SL) {

    var SLHttpUrl = function () { }
    SLHttpUrl.prototype = {
        getQueryArgs: function () {
            ///<summary>
            /// 获取查询字符串 返回数组
            ///</summary>
            //定义一个数组，用于存放取出来的字符串参数。
            var argsArr = new Object();
            //获取URL中的查询字符串参数
            var query = window.location.search;
            //name=myname&password=1234&sex=male&address=nanjing
            query = query.substring(1);

            //这里的pairs是一个字符串数组 
            var pairs = query.split("&");

            for (var i = 0; i < pairs.length; i++) {
                var sign = pairs[i].indexOf("=");
                //如果没有找到=号，那么就跳过，跳到下一个字符串（下一个循环）。
                if (sign == -1) {
                    continue;
                }

                var aKey = pairs[i].substring(0, sign);
                var aValue = pairs[i].substring(sign + 1);

                argsArr[aKey] = aValue;
            }

            return argsArr;
        },
        getQueryArgByName: function (name) {
            ///<summary>
            ///根据 获取查询字符串
            ///</summary>
            var arrArgs = this.getQueryArgs();
            return arrArgs[name];

        }

    };
    SL.HttpUrl = SL.HttpUrl || {};
    SL.HttpUrl = new SLHttpUrl();


});