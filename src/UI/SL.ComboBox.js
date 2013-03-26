/// <reference path="../sl.js" />
/// <reference path="../SL.Node.js" />
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
        min: 1,
        url: "",
        height: 200,
        source: [],
        selected: function (event, item) { }
    };
    this.combobox = sl.Class(
    {
        init: function (elem, options) {
            if (!elem) throw new Error("未设定元素！");
            var options = sl.extend(true,{}, defaults, options), $this = $(elem);
            if (data = $this.data("CalvinAutoComplete.data")) {
                this.clearAll(elem);
                data.ItemsContainer = null, data.TextBoxContainer = null, data.dropdownIcon = null;

            }
            else {
                $this.data("CalvinAutoComplete.data", { options: options });
            }

            WrapTextBox(elem);
            MenuItemHelper.RemoveMenuItems(elem);
            //移除现有的Items元素
            EventHelper.SetTextBoxKeyUpDownEvent(elem);

            $(document).click(function (event) {
                MenuItemHelper.RemoveMenuItems(elem);
            });

        }

    });
    var EventHelper = {
        /**
        * @description  设置item（li元素）的点击事件
        * @param {$MenuItem} 选项元素
        *@param {$textBox} textbox元素
        */
        SetMenuItemClickEvent: function ($MenuItem, $textBox) {

            var ItemData = $MenuItem.data("MenuItem.Data"), options = $textBox.data("CalvinAutoComplete.data").options;
            $MenuItem.bind("selected",options.selected);
            //设置item点击的事件 默认事件自动填写text框
            $MenuItem.bind("click", function () {
                $textBox.val(ItemData.text);
                $MenuItem.trigger("selected", [ItemData]);
                $MenuItem.parent().hide();
                ItemData.Selected = true;
                MenuItemHelper.RemoveMenuItems($textBox.get(0));
            });


        },

        /**
        * @description  设置textbox的键盘事件
        * @param {textBox} textbox元素
        */
        SetTextBoxKeyUpDownEvent: function (textBox) {
            var $this = $(textBox),
            options = $this.data("CalvinAutoComplete.data").options;

            $this.unbind("keydown");
            $this.unbind("keyup");

            $this.keydown(function (event) {
                var data = $this.data("CalvinAutoComplete.data");
                var dropDownIconData = data.dropdownIcon.data("AllMenusItems");
                if ((data == null || data.ItemsContainer == null) && (dropDownIconData == null || dropDownIconData.AllMenusItems == null || dropDownIconData.AllMenusItems.is(":hidden"))) return;

                var $itemContainer = data.ItemsContainer || dropDownIconData.AllMenusItems;
                var $items = $(">li", $itemContainer.get(0));
                var itemsCount = $items.length;
                var $SelectedItem = $(">li.ui-menu-itemHover", $itemContainer.get(0));
                var SelectIndex = $items.index($SelectedItem.get(0));
                switch (event.keyCode) {
                    //向上                                                                                                                                                                                    
                    case 38:
                        MenuItemHelper.RemoveItemHoverStyle($itemContainer);

                        if (SelectIndex != 0) {
                            $SelectedItem.prev().addClass("ui-menu-itemHover");
                        }
                        MenuItemHelper.ScrollToSelectedItem($itemContainer, options);
                        break;
                    //向下                                                                                                                                                                                 
                    case 40:
                        MenuItemHelper.RemoveItemHoverStyle($itemContainer);
                        //没有选中的项
                        if ($SelectedItem.length == 0) {
                            $items.eq(0).addClass("ui-menu-itemHover");
                        }
                        else if (SelectIndex == itemsCount - 1) {
                            $items.eq(0).addClass("ui-menu-itemHover");
                        }
                        else {
                            $SelectedItem.next().addClass("ui-menu-itemHover");
                        }
                        MenuItemHelper.ScrollToSelectedItem($itemContainer, options);
                        break;
                    default:
                        break;
                }
                var $newSelectedItem = $(">li.ui-menu-itemHover", $itemContainer.get(0)).eq(0);
                if ($newSelectedItem.length != 0) {
                    $this.val($newSelectedItem.data("MenuItem.Data").text);
                }

            });

            $this.bind("keyup", function (event) {
                var data = $this.data("CalvinAutoComplete.data"),
                 $dropdownIcon = data.dropdownIcon,
                 dropdownIconData = $dropdownIcon.data("AllMenusItems"),
                 $textBoxContainer = data.TextBoxContainer,
                 StyleInfo = GetElementStyle($textBoxContainer.get(0)),
                 options = data.options;

                switch (event.keyCode) {
                    case 38:
                        break;
                    case 40:
                        break;
                    case 13: //回车键
                        var $SelectedItem = MenuItemHelper.getSelectedItem(data.ItemsContainer || dropdownIconData.AllMenusItems);
                        if ($SelectedItem != null) {
                            var ItemData = $SelectedItem.data("MenuItem.Data");
                            $SelectedItem.trigger("selected", [ItemData]);
                        }
                        MenuItemHelper.RemoveMenuItems(textBox);


                        break;
                    default:
                        MenuItemHelper.RemoveMenuItems(textBox);
                        if ($dropdownIcon) {
                            $dropdownIcon.data("AllMenusItems").AllMenusItems.hide();
                        }
                        var minLength = options.min;
                        if ($this.val().length >= minLength) {
                            var $MenuItems = MenuItemHelper.GenrateMenuItems(this, OtherHelper.FilterOptionSouces($this.val(), options.source), StyleInfo.height, StyleInfo.width, StyleInfo.top, StyleInfo.left);
                            $this.data("CalvinAutoComplete.data").ItemsContainer = $MenuItems;
                        }
                        break;
                }
            });

        }

    };
    var MenuItemHelper = {

        /**
        * @description 生成自动补全菜单
        * @param {textBox} textBox元素
        * @param {SouceArray} 数组元素[{text:'',value:''}]或者["fsa","safsafs"]
        * @param  {height } 产生自动补全的textbox的高度
        * @param  {width } 产生自动补全的textbox的宽度
        * @param  {top } 产生自动补全的textbox的top属性
        * @param  {left } 产生自动补全的textbox的left属性
        */
        GenrateMenuItems: function (textBox, SouceArray, height, width, top, left) {
           
            if (!SouceArray.length) return;
            var $ItemsContainer = $("<ul class='ui-autocomplete ui-menu'></ul>"), options = $(textBox).data("CalvinAutoComplete.data").options;
            //遍历产生item源数组
            sl.each(SouceArray, function (i, d) {
                var $MenuItem = $("<li class='ui-menu-item'></li>");

                var $MenuItemText = $("<a></a>");
                if (sl.InstanceOf.PlainObject(d)) {
                    $MenuItem.data("MenuItem.Data", { "text": d.text, "value": d.value, "Selected": false });
                    $MenuItemText.append(d.text);
                }
                else {
                    $MenuItem.data("MenuItem.Data", { "text": d, "value": "", "Selected": false });
                    $MenuItemText.append(d);
                }
                $MenuItem.append($MenuItemText);
                $ItemsContainer.append($MenuItem);
                //设置item属性移动上去的样式
                $MenuItem.mouseover(function () {
                    MenuItemHelper.RemoveItemHoverStyle($ItemsContainer);
                    MenuItemHelper.SetItemHover($MenuItem);
                });
                //绑定点击事件
                EventHelper.SetMenuItemClickEvent($MenuItem, $(textBox));

            });

            $ItemsContainer.appendTo("body");
            if ($ItemsContainer.height() <= options.height) {
                //设置只能提示选项的位置
                $ItemsContainer.css({ "left": left, "width": width - 4, "top": top + height });
            }
            else {
                $ItemsContainer.css({ "height": options.height, "left": left, "width": width - 4, "top": top + height });
            }
            return $ItemsContainer
        },
        /**
        * @description  设置选项移动上去的样式
        * @param {itemsContainer} item的容器元素 也就是ul
        * @param {item} item的元素 也就是li
        */
        SetItemHover: function ($item) {
            $item.addClass("ui-menu-itemHover");
        },

        /**
        * @description 获取选中的元素
        * @param {$itemContainer} textBox元素
        * @return 返回选中元素的jq对象
        */
        getSelectedItem: function ($itemContainer) {
            var $SelectedItem = $(">li.ui-menu-itemHover", $itemContainer.get(0));
            if ($SelectedItem.length != 0) {
                return $SelectedItem.eq(0);
            }
            return null;
        },
        /*
        * @description输入框有值时候 打开下拉按钮时候 匹配到第一项选中的
        */
        ScrollToMarchedItem: function (textbox, key, $itemContainer, options) {

            var hasMatched = false,
             height = 0,
      options = $(textbox).data("CalvinAutoComplete.data").options;
            $(">li", $itemContainer).each(function (i, d) {
                height += $(d).height();
                if (key === $(d).data("MenuItem.Data").text) {
                    hasMatched = true;
                    MenuItemHelper.SetItemHover($(d));
                    return false;
                }
            });
            if (hasMatched) {
                if (height > options.height) {
                    $itemContainer.scrollTop(height - options.height);
                }
            }
        },
        /*
        * @description移动键盘上下键的时候 滚动到选中的项目
        */
        ScrollToSelectedItem: function ($itemContainer, options) {
            var hasMatched = false, height = 0;
            $(">li", $itemContainer).each(function (i, d) {
                height += $(d).height();
                if ($(d).is(".ui-menu-itemHover")) {
                    hasMatched = true;
                    MenuItemHelper.SetItemHover($(d));
                    return false;
                }
            });
            if (hasMatched) {

                if (height > options.height) {
                    $itemContainer.scrollTop(height - options.height);
                }
                else {
                    if ($itemContainer.scrollTop()) {
                        $itemContainer.scrollTop(0);
                    }
                }

            }
        },

        /**
        * @description 移除自动补全菜单 并且隐藏下拉的菜单
        * @param {textBox} textBox元素
        **/
        RemoveMenuItems: function (textBox) {
            var $this = $(textBox);
            if ($this.data("CalvinAutoComplete.data")) {
                data = $this.data("CalvinAutoComplete.data");
                if (data.ItemsContainer) {
                    data.ItemsContainer.remove();
                    $this.data("CalvinAutoComplete.data").ItemsContainer = null;
                }

            }
            var $dropdownIcon = $this.data("CalvinAutoComplete.data").dropdownIcon;
            if ($dropdownIcon && $dropdownIcon.length) {
                $dropdownIcon.data("AllMenusItems").AllMenusItems.hide();
            }
        },

        /**
        * @description  移除item的选中样式
        * @param {itemsContainer} item的容器元素 也就是ul
        */
        RemoveItemHoverStyle: function ($itemsContainer) {
            $(">li", $itemsContainer).removeClass("ui-menu-itemHover");
        },

        clearAll: function (textBox) {

            var $this = $(textBox);
            var data = $this.data("CalvinAutoComplete.data");
            if (data) {
                if (data.dropdownIcon && data.dropdownIcon.data("AllMenusItems") && data.dropdownIcon.data("AllMenusItems").AllMenusItems) {
                    data.dropdownIcon.data("AllMenusItems").AllMenusItems.remove();
                }
                if (data.ItemsContainer) {
                    data.ItemsContainer.remove();
                }
                if (data.TextBoxContainer) {
                    $this.next().remove();
                    $this.unwrap();
                    //data.TextBoxContainer.remove();
                }

            }
        }
    };
    var OtherHelper = {

        /**
        * @description 根据指定的key 过滤options.sources数组 以便再生成菜单
        * @param {Key} 值
        **/
        FilterOptionSouces: function (Key,source) {
            var fileterArray = new Array();
            sl.each(source, function (t, d) {
                if (sl.InstanceOf.PlainObject(d)) {
                    var reg = new RegExp(".*" + Key + ".*", "g");
                    if (reg.test(d.text)) {
                        fileterArray.push(d);
                    }
                }
                else {
                    var reg = new RegExp(".*" + Key + ".*", "g");
                    if (reg.test(d)) {
                        fileterArray.push(d);
                    }
                }
            });
            return fileterArray;
        }
    };
    /**
    * @description 生成下拉菜单按钮并和textbox包裹
    * @param {textBox} textBox元素
    */
    function WrapTextBox(textbox) {
        var $textbox = $(textbox), options = $textbox.data("CalvinAutoComplete.data").options;
        $textbox.wrap("<span class='combo'></span>");
        var $ContainerSpan = $textbox.parent();
        $textbox.addClass("combo-text");
        var $dropdownIcon = $("<span><span class='combo-arrow'></span></span>");
        $dropdownIcon.data("AllMenusItems", { AllMenusItems: null });
        $textbox.appendTo($ContainerSpan);
        $ContainerSpan.append($dropdownIcon);
        $textbox.data("CalvinAutoComplete.data").TextBoxContainer = $ContainerSpan;
        $textbox.data("CalvinAutoComplete.data").dropdownIcon = $dropdownIcon;
        var StyleInfo = GetElementStyle($ContainerSpan.get(0));
        var $ItemsContainerAll = MenuItemHelper.GenrateMenuItems(textbox, options.source, StyleInfo.height, StyleInfo.width, StyleInfo.top, StyleInfo.left);
        $dropdownIcon.data("AllMenusItems").AllMenusItems = $ItemsContainerAll;
        $ItemsContainerAll.toggle();
        $dropdownIcon.bind("click", function (event) {
            event.cancelBubble = true;
            event.stopPropagation();
            MenuItemHelper.RemoveItemHoverStyle($ItemsContainerAll);
            if ($ItemsContainerAll.is(":hidden")) {
                $ItemsContainerAll.show();
                MenuItemHelper.ScrollToMarchedItem(textbox, $textbox.val(), $ItemsContainerAll, options);
                textbox.focus();
            }
            else {
                $ItemsContainerAll.hide();
            }
            if ($textbox.data("CalvinAutoComplete.data").ItemsContainer) {
                $textbox.data("CalvinAutoComplete.data").ItemsContainer.hide();

            }
        });
        return $ContainerSpan;
    }
    /**
    * @description  获取产生自动补全效果的textbox的位置和宽高信息
    * @param {textBox} textbox DOM元素
    */
    function GetElementStyle(ele) {
        var $ele = $(ele);
        var offset = $ele.offset();
        return { left: offset.left, top: offset.top, width: $ele.width(), height: $ele.outerHeight() };
    }
});