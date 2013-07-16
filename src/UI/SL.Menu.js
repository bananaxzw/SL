/// <reference path="../sl.js" />
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
        click: function () { },
        isTopMenuAlwaysOpen: false
    };

    this.menu = sl.Class(
    {
        init: function (elem, options) {
            if (!elem) throw new Error("未设定元素！");
            this.elem = elem;
            var opts = sl.extend({}, defaults, options);
            sl.data(elem, "slmenu", { options: opts });

            menuHelper.InitMenu(elem);
            //点击文档别的位置按钮消失
            slChain(document).bind('click', function () { menuHelper.hideAllSubMenu(slChain(elem)); });
        },
        /*为contextMenu提供的接口*/
        showMenu: function (pos) {
            menuHelper.showMenu(slChain(this.elem), pos);
        },
        hide: function () {
            menuHelper.hideAllMenu(slChain(this.elem));
        }
    });
    var menuHelper = {
        InitMenu: function (elem) {
            var $target = slChain(elem);
            var data = sl.data(elem, "slmenu").options;
            menuHelper.buildTopMenu(elem, data);
            if (!data.autoOpen) {
                $target.hide();
            }
        },
        bindSubMenu: function (menuData, target) {
            var $subMenu = slChain("<div class='menu'></div>"), opts = sl.data(target, "slmenu").options;
            $subMenu.css("z-index", opts.zIndex++);
            for (var i = 0, j = menuData.length; i < j; i++) {
                var itemData = menuData[i];
                var MenuItem = menuHelper.bindMenuItem($subMenu, itemData, target);
                if (itemData.sub) {
                    var $newSubMenu = arguments.callee.call(menuHelper, itemData.sub, target);
                    MenuItem.$subMenu = $newSubMenu;
                }
            }
            $subMenu.hide();
            $subMenu.css({ width: opts.width });
            $subMenu.appendTo("body");
            return $subMenu;
        },
        buildTopMenu: function (target, data) {
            var menuData = data.menuData;
            $target = slChain(target), opts = sl.data(target, "slmenu").options;
            $target.addClass('menu-top').addClass("menu"); // the top menu
            $target.css({ "z-index": data.zIndex++, "left": data.left, "top": data.top });
            for (var i = 0, j = menuData.length; i < j; i++) {
                var itemData = menuData[i];
                var MenuItem = menuHelper.bindMenuItem($target, itemData, target);
                if (itemData.sub) {
                    var $subMenu = menuHelper.bindSubMenu(itemData.sub, target);
                    MenuItem.$subMenu = $subMenu;
                }
            }
            $target.css({ width: opts.width });
            //            $target.appendTo("body");
            data.onShow.call(target);
        },
        bindMenuItem: function ($menu, itemData, target) {

            if (itemData.line) {
                $menu.append("<div class='menu-sep'>&nbsp;</div>");
                return null;
            }
            else {
                var text = itemData.text, click = itemData.click, value = itemData.value, $item = slChain("<div style='height: 20px;' class='menu-item'> <div class='menu-text'>" + text + "</div></div>");

                //是否可以选择
                var selected = itemData.selected || itemData.click ? true : false || itemData.sub ? false : true;

                $item.data("itemData", { "text": text, "value": value, "click": click, "selected": selected });
                if (itemData.ico) {
                    $item.append("<div class='menu-icon " + itemData.ico + "'/>");
                }
                if (itemData.sub) {
                    $item.append("<div class='menu-rightarrow'/>");

                }
                $menu.append($item);
                eventHelper.bindMenuItemEvent($item.elements[0], target);
                //console.log("菜单项宽度"+$item.width());
                return $item.elements[0];
            }


        },
        showMenu: function ($menu, pos) {
            if (!$menu) return;
            if (pos) {
                $menu.css(pos);
            }
            $menu.show();

        },
        hideMenu: function ($menu) {
            var _this = this;
            if (!$menu) return;
            $menu.hide();
            $menu.find('div.menu-item').each(function () {
                if (this.$subMenu) {
                    _this.hideMenu(this.$subMenu);
                }
                slChain(this).removeClass('menu-active');
            });
        },
        hideAllMenu: function ($target) {
            var data = $target.data("slmenu");
            var opts = $target.data('slmenu').options;
            this.hideMenu($target);
            if (data.onHide) {
                data.onHide.call($target.elements[0]);
            }
            //  slChain(document).unbind('.menu');
            if (opts.isTopMenuAlwaysOpen) {
                this.showMenu($target);
            }
            return false;
        },
        hideAllSubMenu: function ($menu) {
            var _this = this;
            if (!$menu) return;
            $menu.find('div.menu-item').each(function () {
                if (this.$subMenu) {
                    _this.hideMenu(this.$subMenu);
                }
                slChain(this).removeClass('menu-active');
            });

        }

    };
    var eventHelper = {
        bindMenuItemEvent: function (menuItem, target) {
            eventHelper.howerEvent(menuItem, target);
            eventHelper.clickEvent(menuItem, target);

        },
        howerEvent: function (menuItem, target) {
            var $menuItem = slChain(menuItem);
            $menuItem.hover(
             function () {
                 //隐藏同级元素的菜单
                 $menuItem.siblings().each(function () {
                     if (this.$subMenu) {
                         menuHelper.hideMenu(this.$subMenu);
                     }
                     slChain(this).removeClass('menu-active');
                 });

                 //激活样式
                 $menuItem.addClass("menu-active");
                 if (menuItem.$subMenu) {
                     var $subMenu = menuItem.$subMenu;
                     var itemPos = $menuItem.offset();
                     var left = itemPos.left + $menuItem.outerWidth() - 2;
                     //超过文档宽度 
                     if (left + $subMenu.outerWidth() > slChain(window).width()) {
                         left = itemPos.left - $subMenu.outerWidth() + 2;
                     }

                     var pos = { left: left, top: itemPos.top + 3 };
                     menuHelper.showMenu(menuItem.$subMenu, pos);

                 }
             },
             function (e) {
                 $menuItem.removeClass("menu-active");
                 var $submenu = menuItem.$subMenu;
                 if ($submenu) {
                     if (e.pageX >= parseInt($submenu.css('left'))) {
                         $menuItem.addClass('menu-active');
                     } else {
                         //hideAllMenu(target);
                         menuHelper.hideMenu($submenu);
                     }

                 } else {
                     $menuItem.removeClass('menu-active');
                 }

             }
             );

        },
        clickEvent: function (menuItem, target) {

            var $menuItem = slChain(menuItem);
            $menuItem.click(function (e) {
                var itemData = $menuItem.data("itemData");
                if (itemData.selected && itemData.click) {
                    itemData.click.call(menuItem, itemData.text, itemData.value);
                };
                menuHelper.hideAllMenu(slChain(target));
                e.stopPropagation();

            });

        },
        bindMenuEvent: function (menu, target) {

        }
    };
});