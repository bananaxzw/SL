/// <reference path="../sl.js" />
/// <reference path="SL.Menu.js" />

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