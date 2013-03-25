/// <reference path="../sl.js" />
/// <reference path="../SL.Node.js" />
/// <reference path="SL.Mask.js" />
/********************************************************************************************
* 文件名称:	
* 设计人员:	许志伟 
* 设计时间:	
* 功能描述:	
* 注意事项：
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*
********************************************************************************************/
sl.create("sl.ui", function () {

    var defaults = {
        accept: null,
        onDragEnter: function (e, source) { },
        onDragOver: function (e, source) { },
        onDragLeave: function (e, source) { },
        onDrop: function (e, source) { }
    };

    this.droppable = sl.Class(
    {
        init: function (elem, options) {
            var options = sl.extend({}, defaults, options);
            sl.data(elem, "droppable", { options: options });
            $(elem).addClass("droppable").bind(
        '_dragenter', function (e, source) {
            options.onDragEnter.apply(elem, [e, source]);
        }).bind(
        '_dragleave', function (e, source) {
            options.onDragLeave.apply(elem, [e, source]);
        }).bind(
        '_dragover', function (e, source) {
            options.onDragOver.apply(elem, [e, source]);
        }).bind(
        '_drop', function (e, source) {
            options.onDrop.apply(elem, [e, source]);
        });
        }
    });
});