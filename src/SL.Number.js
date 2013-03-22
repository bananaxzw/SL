/// <reference path="SL.Core.js" />
/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description  SL框架 NUMBER对象帮助类
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/

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