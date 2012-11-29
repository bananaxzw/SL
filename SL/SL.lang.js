/// <reference path="SL.Core.js" />
/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description  SL框架 语言扩展包
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/
//cookie
SL().create(function (SL) {
    /**
    * @class
    * @name Cookie
    * @example
    * SL().Cookie.set("name1", "xuzhiwei", ".testxuzhiwei11.com", "/", 1);
    * console.log(SL().Cookie.get("name1"));
    * SL().Cookie.remove("name1");
    * console.log(SL().Cookie.get("name1"));
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
        set: function (name, value, domain, path, hour, secure) {
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
            window.document.cookie = string;
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

    SL.Cookie = SL.Cookie || {};
    SL.Cookie = new Cookie();
});
//array
SL().create(function (SL) {
    /**
    * array扩展
    * @class
    * @name array
    */
    var array = function () { };
    array.prototype = {

        /**
        *把数据拷贝到新的数组中
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
                if (SL.compare(arr[i], obj)) return i;
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
                if (SL.compare(arr[i], obj)) return i;
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
        *   var slArray = SL().Array;
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
            while (index > 0) {
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
        * var slArray = SL().Array;
        * var initalArray = [1, 2, 3, 4, 6, 6, 7];
        * slArray.deleteRepeater(initalArray);
        */
        deleteRepeater: function (arr) {
            /// <summary>
            /// 删除当前数组中重复的项
            /// </summary>
            /// <param name="arr"></param>
            /// <returns type=""></returns>
            if (arr.length < 2) return arr;
            var aT = arr.concat();
            arr.length = 0;
            for (var i = 0; i < aT.length; i++) {
                arr.push(aT.splice(i--, 1)[0]);
                for (var j = 0; j < aT.length; j++) {
                    if (SL.compare(aT[j], arr[arr.length - 1])) aT.splice(j--, 1);
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
        * var slArray = SL().Array;
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
        * var slArray = SL().Array;
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
        * var slArray = SL().Array;
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
    SL.Array = SL.Array || {};
    SL.Array = new array();
});
//broswer
SL().create(function (SL) {
    /**
    *浏览器信息 目前只提供版本判断
    *@class
    *@name Browser
    *@example 
    * alert(SL().Browser.chrome)
    * alert(SL().Browser.ie);
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
        safari: 0
    }

    SL.Browser = SL.Browser || {};
    SL.Browser = new Browser();
});
//date
SL().create(function (SL) {

    /**
    * date扩展
    * @class
    * @name date
    */
    var date = function () {
        this.LeftPaddingZero = function (source, length) {
            var pre = "",
        negative = (source < 0),
        string = String(Math.abs(source));

            if (string.length < length) {
                pre = (new Array(length - string.length + 1)).join('0');
            }

            return (negative ? "-" : "") + pre + string;
        }

        this.monthNames = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
        this.monthAbbreviations = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
        this.dayNames = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
        this.dayAbbreviations = new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');
    };

    date.prototype = {
        /**
        *格式化时间
        *@param {Date} date时间
        *@param {String} format格式 日期格式 yyyy：4位数的年 yy:年的后2位  M：正常表示月份 MM：不足10左边补0 MMM:英文表示 NNN英文缩写 d:天数 dd:不足10补充0  EE：英文星期 E英文星期缩写  h:12小时制 H 小时制 m:分钟 mm不足2位补0 s:秒钟 ss不足2位补0
        */
        format: function (source, pattern) {
            if ('string' != typeof pattern) {
                return source.toString();
            }

            function replacer(patternPart, result) {
                pattern = pattern.replace(patternPart, result);
            }

            var pad = this.LeftPaddingZero;
            year = source.getFullYear(),
        month = source.getMonth() + 1,
        date2 = source.getDate(),
        hours = source.getHours(),
        minutes = source.getMinutes(),
        seconds = source.getSeconds();

            replacer(/yyyy/g, pad(year, 4));
            replacer(/yy/g, pad(parseInt(year.toString().slice(2), 10), 2));
            replacer(/MM/g, pad(month, 2));
            replacer(/M/g, month);
            replacer(/dd/g, pad(date2, 2));
            replacer(/d/g, date2);

            replacer(/HH/g, pad(hours, 2));
            replacer(/H/g, hours);
            replacer(/hh/g, pad(hours % 12, 2));
            replacer(/h/g, hours % 12);
            replacer(/mm/g, pad(minutes, 2));
            replacer(/m/g, minutes);
            replacer(/ss/g, pad(seconds, 2));
            replacer(/s/g, seconds);

            return pattern;
        },
        parseString: function (source) {
            var reg = new RegExp("^\\d+(\\-|\\/)\\d+(\\-|\\/)\\d+\x24");
            if ('string' == typeof source) {
                if (reg.test(source) || isNaN(Date.parse(source))) {
                    var d = source.split(/ |T/),
                d1 = d.length > 1
                        ? d[1].split(/[^\d]/)
                        : [0, 0, 0],
                d0 = d[0].split(/[^\d]/);
                    return new Date(d0[0] - 0,
                            d0[1] - 1,
                            d0[2] - 0,
                            d1[0] - 0,
                            d1[1] - 0,
                            d1[2] - 0);
                } else {
                    return new Date(source);
                }
            }

            return new Date();

        },
        isBefore: function (date1, date2) {
            /// <summary>
            /// 判断
            /// </summary>
            /// <param name="date1"></param>
            /// <param name="date2"></param>
            /// <returns type=""></returns>
            if (date1 === null || date2 === null) return false;
            return (date1.getTime() < date2.getTime());
        },
        /**
        *将指定的数目（月数，天数，年数等等）加到当前时间上
        *@param {Date} date时间
        *@param {String} part 数目的类型（y:年 M月 d天 h小时 m分 s秒）
        */
        add: function (date, part, number) {

            /// <summary>
            /// 将指定的数目（月数，天数，年数等等）加到当前时间上
            /// </summary>
            /// <param name="date">日期</param>
            /// <param name="part">数目的类型（y:年 M月 d天 h小时 m分 s秒）</param>
            /// <param name="number"></param>
            /// <returns type=""></returns>
            if (typeof (part) == "undefined" || part == null || typeof (number) == "undefined" || number == null) {
                return date;
            }
            number = +number;
            if (part == 'y') { // year
                date.setFullYear(date.getFullYear() + number);
            }
            else if (part == 'M') { // Month
                date.setMonth(date.getMonth() + number);
            }
            else if (part == 'd') { // Day
                date.setDate(date.getDate() + number);
            }
            else if (part == 'w') { // Weekday工作日 //没测试
                var step = (number > 0) ? 1 : -1;
                while (number != 0) {
                    date.add('d', step);
                    while (date.getDay() == 0 || date.getDay() == 6) {
                        arguments.callee('d', step);
                    }
                    number -= step;
                }
            }
            else if (part == 'h') { // Hour
                date.setHours(date.getHours() + number);
            }
            else if (part == 'm') { // Minute
                date.setMinutes(date.getMinutes() + number);
            }
            else if (part == 's') { // Second
                date.setSeconds(date.getSeconds() + number);
            }
            return date;

        }
    };

    SL.Date = SL.Date || {};
    SL.Date = new date();
});
//string
SL().create(function (SL) {
    /*
    数组方式 拼接字符串 .高效... 使用前先实例化.
    */
    function StringBuilder(sFirstString) {
        this._aStr = [];
        if (Object.prototype.toString.call(sFirstString) == '[object String]') this._aStr.push(sFirstString);
    };
    StringBuilder.prototype = {
        constructor: StringBuilder,
        append: function (str) {
            this._aStr.push(str);
            return this;
        },
        valueOf: function () {
            return this._aStr.join('');
        },
        toString: function () {
            return this._aStr.join('');
        }
    };

    /**
    *string操作扩展
    *@class
    *@name string
    */
    var string = function () { };
    string.prototype = {
        empty: '',
        repeat: function (sChar, nCount) {
            /// <summary>
            /// 返回nCount重复的字符串
            /// </summary>
            /// <param name="sChar"></param>
            /// <param name="nCount"></param>
            /// <returns type=""></returns>
            return new Array(nCount + 1).join(sChar);
        },
        /**
        *返回对象 .Char str中出现次数最多的字符 .length 出现的次数
        */
        most: function (str) {
            ///<summary>
            /// 返回对象 .Char str中出现次数最多的字符 .length 出现的次数
            ///</summary>
            ///<param name="str" type="String">字符串</param>
            var max = 0, sChar = null, tc;
            for (var i = 0, j = 0; i < str.length; i++, j = 0) {
                str = str.replace(
                    new RegExp(
                        ns.String.isInList(
                            tc = str.substr(0, 1),
                            ['\\', '^', '$', '*', '+', '.', '|']
                        ) ? '\\' + tc : tc,
                        'g'
                    ),
                    f
                );
            }
            return { Char: sChar, length: max };
            function f(m) { ++j > max && ((max = j), sChar = m); return ''; }
        },
        /**
        *模拟 c#上中的Format()方法
        *@example 
        *format("{0}",1)
        */
        format: function (str) {
            /// <summary>
            /// 模拟 c#上中的Format()方法
            /// </summary>
            /// <param name="str"></param>
            /// <returns type=""></returns>
            var args = arguments;
            return new String(str).replace(/\{(\d+)\}/g,
        function (m, i) {
            i = parseInt(i);
            return args[i + 1];
        }).toString();
        },
        /**
        *替换全部匹配字符..a替换为b
        */
        replaceAll: function (str, a, b) {
            /// <summary>
            /// 替换全部匹配字符..a替换为b
            /// </summary>
            /// <param name="str"></param>
            /// <param name="a"></param>
            /// <param name="b"></param>
            /// <returns type=""></returns>
            return new String(str).replace(new RegExp(this.isInList(a, ['\\', '^', '$', '*', '+', '.', '|']) ? '\\' + a : a, 'g'), b).toString();
        },
        /**
        *字符串转化成字符数组
        */
        toArray: function (str) {
            return new String(str).split('');
        },
        /**
        *验证字符串是否在所给参数列表中 参数可以是数组 也可以是多个字符串或多个数组
        */
        isInList: function (str, args) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="str"></param>
            /// <param name="args"></param>
            /// <returns type=""></returns>
            var length = arguments.length;
            for (var i = 1; i < length; i++) {
                if (SL.compare(str, arguments[i])) {
                    return true;
                }
                //数组
                else if (Object.prototype.toString.call(arguments[i]) == '[object Array]') {
                    for (var j = 0, _length = arguments[i].length; j < _length; j++) {
                        if (SL.compare(str, arguments[i][j])) return true;
                    }
                }
            }
            return false;
        },
        /**
        *验证字符串str 是否 包含参数containedStr
        */
        isContains: function (str, containedStr) {
            /// <summary>
            /// 验证字符串str 是否 包含参数containedStr
            /// </summary>
            /// <param name="str"></param>
            /// <param name="containedStr"></param>
            /// <returns type=""></returns>
            return new String(str).indexOf(containedStr) > -1;
        },
        isContained: function (str, containsStr) {
            /// <summary>
            /// 验证字符串str是否 被参数containsStr包含
            /// </summary>
            /// <param name="str"></param>
            /// <param name="containsStr"></param>
            /// <returns type=""></returns>
            return new String(containsStr).indexOf(str) > -1;
        },
        isStartWith: function (str, startStr) {
            /// <summary>
            /// 判断字符串str 是否以 startStr开始
            /// </summary>
            /// <param name="str"></param>
            /// <param name="startStr"></param>
            /// <returns type=""></returns>
            return (new String(str).indexOf(startStr) == 0);
        },
        insert: function (str, nPosition, sInsertStr) {
            /// <summary>
            /// 在字符串指定位置后面插入指定字符串 如 "abc" 位置0 插入"d" 则 为dabc
            /// </summary>
            /// <param name="str"></param>
            /// <param name="nPosition"></param>
            /// <param name="sInsertStr"></param>
            /// <returns type=""></returns>
            str = new String(str);
            sInsertStr = sInsertStr || '';
            if (nPosition <= 0) return sInsertStr + str;
            if (nPosition >= str.length) return str + sInsertStr;
            return str.substr(0, nPosition) + sInsertStr + str.substr(nPosition);
        },
        /**
        *模拟 c# string.padLeft 即 str.length<nLen 时  str左边补充 nLen-length 个 paddingChar字符
        */
        padLeft: function (str, nLen, sPaddingChar) {
            /// <summary>
            /// 模拟 c# string.padLeft 即 str.length<nLen 时  str左边补充 nLen-length 个 paddingChar字符
            /// </summary>
            /// <param name="str"></param>
            /// <param name="nLen"></param>
            /// <param name="sPaddingChar"></param>
            /// <returns type=""></returns>
            str = new String(str);
            var len = str.length;
            if (len >= nLen) return str.toString();
            return this.repeat(sPaddingChar || ' ', (nLen - len) || 0) + str;
        },
        padRight: function (str, nLen, sPaddingChar) {
            /// <summary>
            /// 模拟 c# string.padRight 即 str.length<nLen 时  str右边补充 nLen-length 个 paddingChar字符
            /// </summary>
            /// <param name="str"></param>
            /// <param name="nLen"></param>
            /// <param name="sPaddingChar"></param>
            /// <returns type=""></returns>
            str = new String(str);
            var len = str.length;
            if (len >= nLen) return str.toString();
            return str + this.repeat(sPaddingChar || ' ', (nLen - len) || 0);
        },
        isEndWith: function (str, endStr) {
            /// <summary>
            /// 判断字符串str 是否以 endStr 结束
            /// </summary>
            /// <param name="str"></param>
            /// <param name="endStr"></param>
            /// <returns type=""></returns>
            var tLen = new String(str).length;
            var len = new String(endStr).length;
            if (len > tLen) return false;
            return (len == 0 || new String(str).substr(tLen - len) == endStr);
        },
        /**
        *去全部空格
        */
        trimAll: function (str) {
            /// <summary>
            /// 去全部空格
            /// </summary>
            /// <param name="str"></param>
            /// <returns type=""></returns>
            return new String(str).replace(/\s/g, '').toString();
        },
        /**
        *去前后空格
        */
        trim: function (str) {
            /// <summary>
            /// 去前后空格
            /// </summary>
            /// <param name="str"></param>
            /// <returns type=""></returns>
            return new String(str).replace(/(^\s*)|(\s*$)/g, '').toString();
        },
        /**
        *去前空格
        */
        lTrim: function (str) {
            /// <summary>
            /// 去前空格
            /// </summary>
            /// <param name="str"></param>
            /// <returns type=""></returns>
            return new String(str).replace(/^\s*/g, '').toString();
        },
        rTrim: function (str) {
            /// <summary>
            /// 去后空格
            /// </summary>
            /// <param name="str"></param>
            /// <returns type=""></returns>
            return new String(str).replace(/\s*$/g, '').toString();
        },
        createBuffer: function (sFirstString) {
            return new StringBuilder(sFirstString);
        }
    };
    SL.String = SL.String || {};
    SL.String = new string();



});
//number
SL().create(function (SL) {
    /**
    * number扩展
    * @class
    * @name number
    * @example 
    */
    var number = function () { };
    number.prototype = {
        /**
        *去除非数字字符   比如3df12335.52saa return 312335.52  保留-  .
        */
        stripNonNumeric: function (str) {
            /// <summary>
            /// 去除非数字字符   比如3df12335.52saa return 312335.52  保留-  .
            /// </summary>
            /// <param name="str"></param>
            /// <returns type=""></returns>
            str += '';
            var rgx = /^\d|\.|-$/;
            var out = '';
            for (var i = 0; i < str.length; i++) {
                if (rgx.test(str.charAt(i))) {
                    if (!((str.charAt(i) == '.' && out.indexOf('.') != -1) ||
             (str.charAt(i) == '-' && out.length != 0))) {
                        out += str.charAt(i);
                    }
                }
            }
            return out;

        },
        /** 
        *格式化数字
        *@param {number} num
        *@param {string} format 格式       
        *@example 
        *‘0' - (123456) 表示没有不保留小数位
        * ‘0.00′ - (123456.78) 保留2位小数位
        *‘0.0000′ - (123456.7890) 保留4位小数位 不够的右端补充0
        *‘0,000.00′ - (123,456.78) 保留2位小数位 并且有冒号隔开
        */
        format: function (num, format) {
            /// <summary>
            /// 格式化数字
            /// ‘0' - (123456) 表示没有不保留小数位
            ///‘0.00′ - (123456.78) 保留2位小数位
            ///‘0.0000′ - (123456.7890) 保留4位小数位 不够的右端补充0
            ///‘0,000.00′ - (123,456.78) 保留2位小数位 并且有冒号隔开
            /// </summary>
            /// <param name="num"></param>
            /// <param name="format"></param>
            /// <returns type=""></returns>

            // .replace(/(\d{1,2})(?=(\d{3})+\b)/g,"$1,")

            var hasComma = -1 < format.indexOf(','),
    psplit = this.stripNonNumeric(format).split('.'),
    that = Number(this.stripNonNumeric(num));

            if (1 < psplit.length) {
                that = that.toFixed(psplit[1].length);
            }
            else if (2 < psplit.length) {
                throw Error('无效的格式符:' + format);
            }
            else {
                that = that.toFixed(0);
            }

            var fnum = that.toString();

            if (hasComma) {
                psplit = fnum.split('.');

                var cnum = psplit[0],
      parr = [],
      j = cnum.length,
      m = Math.floor(j / 3),
      n = cnum.length % 3 || 3;
                for (var i = 0; i < j; i += n) {
                    if (i != 0) { n = 3; }
                    parr[parr.length] = cnum.substr(i, n);
                    m -= 1;
                }
                fnum = parr.join(',');
                if (psplit[1]) { fnum += "." + psplit[1]; }
            }

            return format.replace(/[\d,?\.?]+/, fnum);


        }
    }
    SL.Number = SL.Number || {};
    SL.Number = new number();

});