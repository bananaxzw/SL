/// <reference path="SL.Core.js" />

/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description  SL框架 时间帮助类
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/


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
