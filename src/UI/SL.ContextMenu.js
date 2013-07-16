/// <reference path="../sl.js" />
/// <reference path="SL.Menu.js" />
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
        zIndex: 110000,
        left: 0,
        top: 0,
        onShow: function () { },
        onHide: function () { },
        menuData: [],
        width: 140,
        autoOpen: false,
        click: function () { }
    };
    this.contextmenu = sl.Class(
    {
        init: function (elem, options) {
            var temp = new sl.ui.menu(elem, options);
            $(document).bind('contextmenu', function (e) {
                temp.hide();
                temp.showMenu({
                    left: e.pageX,
                    top: e.pageY
                });
                return false;
            });

        }

    });

});