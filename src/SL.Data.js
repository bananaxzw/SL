/// <reference path="SL.Core.js" />

/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description  SL框架 数据储存
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/


SL().create(function (SL) {

    /**
    *数据缓存
    *@class
    *@name data
    */
    var data = function () { }
    data.prototype = {
        /**
        *设置或者获取本地存储
        *@param {DOMElement} ele dom元素
        *@param {String} name 键名
        *@param {Object} data 键值
        *@example 
        * var d = document.getElementById("safsa");
        * SL().data(d, "text", { "sfsa": 1, "asffs": 2 });
        * var d1 = document.getElementById("Div1");
        * SL().data(d1, "text", { "sfsa": 1, "asffs": 2 });
        * console.dir(SL().data(d, "text"));
        * console.dir(SL().data(d1, "text"));
        */
        AddData: function (elem, name, data) {
            var id = elem && elem[SL.expando], cache = SL.cache, thisCache;

            // 没有 id 的情况下，无法取值
            if (!id && typeof name === "string" && data === undefined) {
                return null;
            }

            // 为元素计算一个唯一的键值
            if (!id) {
                id = ++SL.uuid;
            }
            // 如果没有保存过
            if (!cache[id]) {
                elem[SL.expando] = id;     // 在元素上保存键值
                cache[id] = {};         // 在 cache 上创建一个对象保存元素对应的值
            }

            // 取得此元素的数据对象
            thisCache = cache[id];

            // 保存值
            if (data !== undefined) {
                thisCache[name] = data;
            }

            // 返回对应的值
            return typeof name === "string" ? thisCache[name] : thisCache;

        },
        /**
        *移除键值
        *@param {DOMElement} ele dom元素
        *@param {String} name 键名 注释：如果不提供键名则移除元素的缓存缓存
        *@example 
        *var d = document.getElementById("safsa");
        *SL().removeData(d,"text");
        *SL().removeData(d);
        */
        removeData: function (elem, name) {

            var id = elem[SL.expando], cache = SL.cache, thisCache = cache[id];

            // 如果没有指定name就移除全部
            if (name) {
                if (thisCache) {
                    // 根据name移除缓存数据
                    delete thisCache[name];

                    //如果对象为空 就移除所有缓存
                    if (SL.InstanceOf.EmptyObject(thisCache)) {
                        arguments.callee(elem);
                    }
                }
                // 如果不存在name就移除全部数据
            } else {
                try {
                    delete elem[SL.expando]
                } catch (e) {
                    //IE不能delete移除属性 必须removeAttribute
                    if (elem.removeAttribute)
                        elem.removeAttribute(SL.expando);
                }
                // 移除全部缓存数据
                delete cache[id];
            }
        }

    };
    var data = new data();

    SL.extend({ data: data.AddData, removeData: data.removeData });

});