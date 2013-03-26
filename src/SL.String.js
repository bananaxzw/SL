/// <reference path="SL.Core.js" />
/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description  SL框架 字符串帮助类
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/



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



