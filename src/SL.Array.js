/// <reference path="sl.js" />
/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description SL框架数组帮助类
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/

sl.create(function () {
    /**
    * @description array扩展
    * @class array扩展
    * @name array
    */
    
    var array = function () { };
    array.prototype = {

        /**
        *把数据拷贝到新的数组中
        *@private
        *@example
        * var initalArray = [1, 2, 3, 4, 6, 6, 7];
        *    var copyArray = slArray.copy(initalArray);
        *    console.log(copyArray);
        */
        copy: function (arr) {
            /// <summary>
            /// 拷贝数组
            /// </summary>
            /// <param name="arr"></param>
            /// <returns type=""></returns>
            return arr.concat();
        },
        /**
        *清空数据
        */
        clear: function (arr) {
            /// <summary>
            ///清空当前数组
            /// </summary>
            /// <param name="arr"></param>
            arr.length = 0;
        },
        /**
        *查找元素在数组中的位置，如果不存在则返回-1
        *@param {Array} arr 要查找的数据
        *@param {Object} obj 要查找的元素
        *@return 返回元素的第一匹配位置 如果不存在则返回-1
        */
        indexOf: function (arr, obj) {
            /// <summary>
            /// 返回值在数组中的位置，如果不存在则返回-1
            /// </summary>
            /// <param name="arr">数组</param>
            /// <param name="obj">值</param>
            /// <returns type="int">位置</returns>
            for (var i = 0, len = arr.length; i < len; i++) {
                if (sl.compare(arr[i], obj)) return i;
            }
            return -1;
        },

        /**
        *查找元素在数组中的位置，如果不存在则返回-1
        *@param {Array} arr 要查找的数据
        *@param {Object} obj 要查找的元素
        *@return 返回元素的最后匹配位置 如果不存在则返回-1
        */
        lastIndexOf: function (arr, obj) {
            /// <summary>
            /// 返回值在数组中最后出现的位置，如果不存在则返回-1
            /// </summary>
            /// <param name="arr"></param>
            /// <param name="obj"></param>
            /// <returns type=""></returns>
            for (var i = arr.length - 1; i >= 0; i--) {
                if (sl.compare(arr[i], obj)) return i;
            }
            return -1;
        },
        /**
        *数组时候存在某元素
        *@param {Array} arr 要查找的数据
        *@param {Object} obj 要查找的元素
        *@return 存在返回true 不存在返回false
        */
        contains: function (arr, obj) {
            /// <summary>
            ///  array元素中 是否包含某个元素
            /// </summary>
            /// <param name="arr"></param>
            /// <param name="obj"></param>
            /// <returns type=""></returns>
            return this.indexOf(arr, obj) > -1;
        },
        /**
        *在指定位置前插入元素
        *@param {Array} arr  数组
        *@param {Object} obj 新元素
        *@param {Number} Index 位置
        *@param {Boolean} isReturnNew 是否返回新的数组
        *@return 如果 isReturnNew为true则返回新的数组 否则返回插入的元素
        */
        insertBefore: function (arr, obj, index, isReturnNew) {
            /// <summary>
            /// 在指定位置前插入元素.
            /// </summary>
            /// <param name="arr">数组</param>
            /// <param name="obj">元素</param>
            /// <param name="index">位置</param>
            /// <param name="isReturnNew">是否返回新插入的值，否则返回新的数组</param>
            /// <returns type=""></returns>
            var o = arr.splice(index, 0, obj);
            if (!isReturnNew) return o;
            return obj;
        },

        /**
        *批量添加元素
        *@param {Array} arr 要查找的数据
        *@param {Array} items 插入的元素数据
        *@example
        *   var slArray = sl.Array;
        *    var initalArray = [1, 2, 3, 4, 6, 6, 7];
        *   slArray.addRange(initalArray, [1, 3, 4]);
        */
        addRange: function (arr, items) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="arr"></param>
            /// <param name="items"></param>
            arr.push.apply(arr, items);

        },
        /**
        *在指定位置后插入元素
        *@param {Array} arr  数组
        *@param {Object} obj 新元素
        *@param {Number} index 位置
        *@param {Boolean} isReturnNew 是否返回新的数组
        *@return 如果 isReturnNew为true则返回新的数组 否则返回插入的元素
        */
        insertAfter: function (arr, obj, index, isReturnNew) {
            /// <summary>
            /// 在指定位置后插入元素
            /// </summary>
            /// <param name="arr">数组</param>
            /// <param name="obj">元素</param>
            /// <param name="index">位置</param>
            /// <param name="isReturnNew">是否返回新插入的值，否则返回新的数组</param>
            /// <returns type=""></returns>
            var o = arr.splice(index + 1, 0, obj);
            if (!isReturnNew) return o;
            return obj;
        },
        /**
        *替换指定位置处的元素
        *@param {Array} arr  数组
        *@param {Object} obj 新元素
        *@param {Number} Index 位置
        *@param {Boolean} isReturnNew 是否返回新的数组
        *@return 如果 isReturnNew为true则返回新的数组 否则返回插入的元素
        */
        replace: function (arr, obj, index, isReturnNew) {
            /// <summary>
            /// 根据索引 替换当前元素
            /// </summary>
            /// <param name="arr"></param>
            /// <param name="obj"></param>
            /// <param name="index"></param>
            /// <param name="isReturnNew"></param>
            /// <returns type=""></returns>
            var o = arr.splice(index, 1, obj);
            if (!isReturnNew) return o;
            return obj;
        },
        /**
        *移除指定位置处的元素
        *@param {Array} arr  数组
        *@param {Number} Index 位置
        */
        removeAt: function (arr, index) {
            /// <summary>
            /// 移除指定位置的元素
            /// </summary>
            /// <param name="arr"></param>
            /// <param name="index">位置</param>
            /// <returns type=""></returns>
            return arr.splice(index, 1);
        },
        /**
        *移除指定元素
        *@param {Array} arr  数组
        *@param {Object} item 元素
        */
        remove: function (arr, item) {
            /// <summary>
            /// 移除指定元素
            /// </summary>
            /// <param name="arr"></param>
            /// <param name="item"></param>
            /// <returns type="">删除成功返回true</returns>
            var index = -1;
            index = this.indexOf(arr, item)
            while (index >= 0) {
                if (index >= 0) {
                    arr.splice(index, 1);
                }
                index = this.indexOf(arr, item);
            }
            return (index >= 0);

        },
        /**
        *移除重复
        *@param {Array} arr  数组
        *@example
        * var slArray = sl.Array;
        * var initalArray = [1, 2, 3, 4, 6, 6, 7];
        * slArray.deleteRepeater(initalArray);
        */
        deleteRepeater: function (src) {
            var arr = [],
		obj = {},
		i = 0,
		len = src.length,
		result;

            for (; i < len; i++) {
                result = src[i];
                if (obj[result] !== result) {
                    arr.push(result);
                    obj[result] = result;
                }
            }
            return arr;

        },


        /**
        *循环遍历数据 并指定函数动作
        *@param {Array} arr  数组
        *@param {Function} f 要执行的函数 第一个参数为数据元素 第二个参数为索引
        *@param {Object} oThis 为空时候默认为window对象、
        *@example
        * var slArray = sl.Array;
        * var initalArray = [1, 2, 3, 4, 6, 6, 7];
        *slArray.forEach(initalArray, function (data, index) {
        *        console.log(index + "|" + data);
        *    });
        */
        forEach: function (arr, f, oThis) {
            /// <summary>
            /// 模拟C#Foreach
            /// </summary>
            /// <param name="arr"></param>
            /// <param name="f"></param>
            /// <param name="oThis"></param>
            /// <returns type=""></returns>
            oThis = oThis || window;
            if (Array.prototype.forEach) arr.forEach(f, oThis);
            else {
                for (var i = 0, len = arr.length; i < len; i++) {
                    f.call(oThis, arr[i], i);
                }
            }
            return arr;
        },
        /**
        *按照指定规则过滤数据 并返回新数据
        *@param {Array} arr  数组
        *@param {Function} f 要过滤规则的函数 第一个参数为数据元素 第二个参数为索引
        *@param {Object} oThis 为空时候默认为window对象、
        *@example
        * var slArray = sl.Array;
        * var initalArray = [1, 2, 3, 4, 6, 6, 7];
        *  var filterArray = slArray.filter(initalArray, function ( data,index) {
        *     if (index == 1 || data == 7) return true;
        * });
        */
        filter: function (arr, f, oThis) {
            /// <summary>
            /// 按自定义规则过滤数租
            /// </summary>
            /// <param name="arr"></param>
            /// <param name="f"></param>
            /// <param name="oThis"></param>
            /// <returns type=""></returns>
            oThis = oThis || window;
            if (Array.prototype.filter) return arr.filter(f, oThis);
            var a = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                if (f.call(oThis, arr[i], i)) a.push(arr[i]);
            }
            return a;
        },
        /**
        *按照指定规则把数组映射到新的数组中
        *@param {Array} arr  数组
        *@param {Function} f 要执行映射的函数 第一个参数为数据元素 第二个参数为索引 第三个参数为原始数组
        *@param {Object} oThis 为空时候默认为window对象、
        *@example
        * var slArray = sl.Array;
        * var initalArray = [1, 2, 3, 4, 6, 6, 7];
        *    console.log(slArray.map(initalArray, function (data, index) {
        *       return data + index;
        *    }));
        */
        map: function (arr, f, oThis) {
            /// <summary>
            /// 将数组重新按自己规则映射到新的数组当中
            /// </summary>
            /// <param name="arr"></param>
            /// <param name="f"></param>
            /// <param name="oThis"></param>
            /// <returns type=""></returns>将一个
            oThis = oThis || window;
            if (Array.prototype.map) return arr.map(f, oThis);
            var a = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                a.push(f.call(oThis, arr[i], i, arr));
            }
            return a;
        },

        /**
        * 验证所有元素是不是符合你的规则
        *@param {Array} arr  数组
        *@param {Function} f 要执行验证的函数 第一个参数为数据元素 第二个参数为索引 第三个参数为原始数组
        *@param {Object} oThis 为空时候默认为window对象、
        */
        every: function (arr, f, oThis) {
            /// <summary>
            /// 验证所有元素是不是符合你的规则
            /// </summary>
            /// <param name="arr"></param>
            /// <param name="f"></param>
            /// <param name="oThis"></param>
            /// <returns type=""></returns>
            oThis = oThis || window;
            if (Array.prototype.every) return arr.every(f, oThis);
            for (var i = 0, len = arr.length; i < len; i++) {
                if (!f.call(oThis, arr[i], i, arr)) return false;
            }
            return true;
        },

        /**
        * 验证有存在符合你的规则的元素
        *@param {Array} arr  数组
        *@param {Function} f 要执行验证的函数 第一个参数为数据元素 第二个参数为索引 第三个参数为原始数组
        *@param {Object} oThis 为空时候默认为window对象、
        */
        some: function (arr, f, oThis) {
            /// <summary>
            /// 验证数组中存在符合你的规则的元素
            /// </summary>
            /// <param name="arr"></param>
            /// <param name="f"></param>
            /// <param name="oThis"></param>
            /// <returns type=""></returns>
            oThis = oThis || window;
            if (Array.prototype.some) return arr.some(f, oThis);
            for (var i = 0, len = arr.length; i < len; i++) {
                if (f.call(oThis, arr[i], id, arr)) return true;
            }
            return false;
        }

    };
    sl.Array = sl.Array || {};
    sl.Array = new array();
});