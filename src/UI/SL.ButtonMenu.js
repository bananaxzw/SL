/// <reference path="../sl.js" />
/// <reference path="../SL.Node.js" />
/// <reference path="SL.Button.js" />

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
        disabled: false,
        plain: true,
        menuData: {},
        menuId: null,
        duration: 100
    };
    function initbuttonmenu(target) {
        var opts = sl.data(target, 'slmenubutton').options;
        var btn = $(target);
        btn.removeClass('m-btn-active m-btn-plain-active');
        var menu;
        new sl.ui.button(target, opts);
        if (opts.menuId && opts.menuData && !sl.InstanceOf.EmptyObject(opts.menuData)) {
            menu = new sl.ui.menu($(opts.menuId).get(0), {
                onShow: function () {
                    btn.addClass((opts.plain == true) ? 'm-btn-plain-active' : 'm-btn-active');
                },
                onHide: function () {
                    btn.removeClass((opts.plain == true) ? 'm-btn-plain-active' : 'm-btn-active');
                },
                menuData: opts.menuData
            });
        };
        btn.unbind('.menubutton');
        if (opts.disabled == false && opts.menuId) {
            btn.bind('click.menubutton', function () {
                showMenu();
                return false;
            });
            var timeout = null;
            btn.bind('mouseenter.menubutton', function () {
                timeout = setTimeout(function () {
                    showMenu();
                }, opts.duration);
                return false;
            }).bind('mouseleave.menubutton', function () {
                if (timeout) {
                    clearTimeout(timeout);
                }
            });
        }
        function showMenu() {
            var left = btn.offset().left;
            if (left + $(opts.menuId).outerWidth() + 5 > $(window).width()) {
                left = $(window).width() - $(opts.menuId).outerWidth() - 5;
            }
            menu.hide();
            menu.showMenu({
                left: left,
                top: btn.offset().top + btn.outerHeight()
            });
            btn.blur();
        };

        $(document).click(function () {
            menu.hide();
        });
    };

    this.buttonmenu = sl.Class({
        init: function (elem, options) {
            var state = sl.data(elem, 'slmenubutton');
            if (state) {
                sl.extend(state.options, options);
            } else {
                sl.data(elem, 'slmenubutton', {
                    options: sl.extend({}, defaults, {
                        disabled: $(elem).attr('disabled') == 'true',
                        menuId: $(elem).attr("menuId"),
                        plain: ($(elem).attr('plain') == 'false' ? false : true),
                        duration: (parseInt($(elem).attr('duration')) || 100)
                    }, options)
                });
                $(elem).removeAttr('disabled');
                $(elem).append('<span class="m-btn-downarrow">&nbsp;</span>');
            }
            initbuttonmenu(elem);
        }
    });

});