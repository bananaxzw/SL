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


SL().create(function (SL) {
    /**
    * Function扩展
    * @class
    * @name SLFunction
    */
    var SLFunction = function () { };
    SLFunction.prototype = {
        /**
        *方法委托 转移方法的所有对象
        *@Param {Object} oThis 对象
        *@Param {Function} fun 方法
        *@returns {Function} 新的代理方法
        *@example
        * function p() {
        *    alert(this.name);
        *}
        *var person =new  function () {
        *    this.name = "xuzhiwei";
        *}
        * var mm=  SL().Function.createDelegate(person, p);
        * mm(); //xuzhiwei
        */
        createDelegate: function (oThis, fun) {
            return function () {
                return fun.apply(oThis, arguments)
            }
        }
    };
    SL.Function = new SLFunction();

});