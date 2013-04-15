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
/**
* @description TAB默认参数
* @param 
width 	数字 	标签容器的宽度 	auto
height 	数字 	标签容器的高度 	auto
idSeed 	数字 	The base id seed to generate tab panel’s DOM id attribute. 	0
plain 	布尔 	如果为ture标签没有背景图片 	false
fit 	布尔 	如果为ture则设置标签的大小以适应它的容器的父容器 	false
border 	布尔 	如果为true则显示标签容器的边框 	true
scrollIncrement 数字 	滚动按钮每次被按下时滚动的像素值 	100
scrollDuration 	数字 	每次滚动持续的毫秒数 	400
*/

sl.create("sl.ui", function () {
    var defaults = {
        width: 'auto',
        height: 'auto',
        idSeed: 0,
        plain: false,
        fit: false,
        border: true,
        scrollIncrement: 100,
        scrollDuration: 400,
        onLoad: function () { },
        onSelect: function (title) { },
        onClose: function (title) { }
    };

    var tabsPanelsHelper =
            {
                //包裹pannel
                wrapTabPanels: function (target) {
                    var opts = getOption(target);
                    var $target = slChain(target);
                    var data = sl.data(target, "tabs");
                    $target.addClass("tabs-container");
                    $target.wrapInner('<div class="tabs-panels"/>');
                    data.container = $target;
                    var panels = data.panels;
                    slChain('>div.tabs-panels>div', $target).each(function (i, e) {
                        var $this = slChain(this);
                        if (!$this.attr('id')) {
                            $this.attr('id', 'gen-tabs-panel' + opts.idSeed++);
                        }
                        panels.push($this);

                    });

                }

            };

    var tabsHeaderHelper =
            {
                //创建tabs头 注意调用次方法前要先调用wrapTabPanels
                createTabHeaders: function (target) {
                    var $target = slChain(target);
                    var data = sl.data(target, "tabs");
                    var $header = slChain('<div class="tabs-header">'
				+ '<div class="tabs-wrap">'
				+ '<ul class="tabs"></ul>'
				+ '</div>'
				+ '</div>');
                    var scrollLeft = slChain('<div class="tabs-scroller-left"></div>').bind("click", { target: target }, eventHelper.onScrollLeft);
                    var scrollRight = slChain('<div class="tabs-scroller-right"></div>').bind("click", { target: target }, eventHelper.onScrollRight);
                    $header.prepend(scrollLeft).prepend(scrollRight);
                    $header.prependTo($target);
                    data.header = $header;
                    //根据panels初始化创建tab
                    var panels = data.panels;
                    var tabs = data.tabs;
                    sl.each(panels, function (i, d) {
                        var $panel = slChain(this);
                        var options = {
                            id: $panel.attr('id'),
                            title: $panel.attr('title'),
                            content: null,
                            closable: $panel.attr('closable') == 'true',
                            icon: $panel.attr('icon'),
                            selected: $panel.attr('selected') == 'true'
                        };
                        $panel.attr('title', '');
                        var tab = tabsHeaderHelper.createOneTab(target, options, i);
                        tabs.push(tab);
                    });


                },

                /**
                * @description 创建一个tab(panel已经存在了)
                * @param options  创建的tab的参数选项
                * @param index 创建的tab的索引
                */
                createOneTab: function (target, options, index) {
                    var data = sl.data(target, "tabs");
                    var header = data.header;
                    var tabs = slChain('ul.tabs', header);
                    var tab = slChain('<li></li>');
                    var tab_span = slChain('<span></span>').html(options.title);
                    var tab_a = slChain('<a class="tabs-inner"></a>').attr('href', 'javascript:void(0)').append(tab_span);
                    tab.append(tab_a).appendTo(tabs);
                    if (options.closable) {
                        tab_span.addClass('tabs-closable');
                        var $closeBtn = slChain('<a href="javascript:void(0)" class="tabs-close"></a>');
                        tab_a.after($closeBtn);
                        $closeBtn.bind("click", { target: target }, eventHelper.onClose);
                    }
                    if (options.icon) {
                        tab_span.addClass('tabs-with-icon');
                        tab_span.after(slChain('<span/>').addClass('tabs-icon').addClass(options.icon));
                    }
                    if (options.selected) {
                        tab.addClass('tabs-selected');
                    }
                    if (options.content) {
                        slChain('#' + options.id).html(options.content);
                    }

                    slChain('#' + options.id).removeAttr('title');
                    sl.data(tab.elements[0], 'tabs.tab', {
                        id: options.id,
                        title: options.title,
                        isSelect: false,
                        index: index
                    });
                    //绑定事件
                    tab.bind("click", { target: target, tab: tab }, eventHelper.selectTab);
                    return tab;
                },
                /**
                * @description 外部调用创建 包括创建tab头和对应的tab
                */
                addOneTab: function (target, options) {
                    options = sl.extend({
                        id: null,
                        title: '',
                        content: '',
                        icon: null,
                        closable: false,
                        selected: true,
                        height: 'auto',
                        width: 'auto'
                    }, options || {});
                    var index = defaults.idSeed++;
                    options.id = options.id || 'gen-tabs-panel' + index;

                    slChain('<div></div>').attr('id', options.id).attr('title', options.title)
				.height(options.height)
				.width(options.width)
                .html(options.content)
                .hide()
				.appendTo(slChain('>div.tabs-panels', target));
                    tabsStyleHelper.setPanelSize(target);
                    var tab = tabsHeaderHelper.createOneTab(target, options, index);
                    sl.data(target, "tabs").tabs.push(tab);
                    if (options.selected) {
                        tab.trigger("click");
                    }

                    tabsStyleHelper.setSize(target);
                },

                /**
                * @description 1、获取选中的tab头部信息
                */
                getSelectedTab: function (container) {
                    var tabs = sl.data(container, "tabs").tabs;
                    for (var i = 0, m = tabs.length; i < m; i++) {
                        var tabHeader = tabs[i].elements[0];
                        var cacheOpt = sl.data(tabHeader, "tabs.tab");
                        if (cacheOpt.isSelect == true) {
                            return cacheOpt;
                        }
                    }
                },

                /**
                * @description 1.根据索引选中头部
                */
                selectTabByIndex: function (target, index) {
                    if (isNaN(index)) {
                        alert("索引参数非数字");
                        return;
                    }
                    var tabs = sl.data(target, "tabs").tabs;
                    if (index >= tabs.length) index = tabs.length - 1;
                    tabs[index].trigger("click");

                }


            };

    var tabsStyleHelper = {

        /*
        *@description  设置头 和 panel的大小
        */
        setSize: function (target) {

            var opts = getOption(target), cc = slChain(target);
            //是否停靠父元素
            if (opts.fit == true) {
                var p = cc.parent();
                opts.width = p.width();
                opts.height = p.height();
            }
            cc.width(opts.width); cc.height(opts.height);

            var header = slChain('>div.tabs-header', target);
            //如果是盒子模型的话 要减去边框和padding
            //                if (sl.boxModel == true) {
            var delta = header.outerWidth() - header.width();
            //			var delta = header.outerWidth(true) - header.width();
            header.width(cc.width() - delta);
            //                } else {
            //                    header.width(cc.width());
            //                }

            tabsStyleHelper.setScrollers(target);

            tabsStyleHelper.setPanelSize(target);


        },
        //设置panel样式
        setPanelSize: function (target) {
            var panels = slChain('>div.tabs-panels', target), header = sl.data(target, "tabs").header,
        opts = getOption(target), height = opts.height;
            //如果是盒子模型的话 要减去边框和padding
            if (!isNaN(height)) {
                //                    if (sl.boxModel == true) {
                var delta = panels.outerHeight() - panels.height();
                panels.css('height', (height - header.outerHeight() - delta) || 'auto');
                //                    } else {
                //                        panels.css('height', height - header.outerHeight());
                //                    }
            } else {
                panels.height('auto');
            }
            var width = opts.width;
            if (!isNaN(width)) {
                //                    if (sl.boxModel == true) {
                var delta = panels.outerWidth() - panels.width();

                panels.width(width - delta);
                //                    } else {
                //                        panels.width(width);
                //                    }
            } else {
                panels.width('auto');
            }

        },

        /**
        * @description 当tab的数量超过宽度时候 显示左右滚动
        * @param {DOM element}
        */
        setScrollers: function (container) {
            var header = slChain('>div.tabs-header', container);
            var tabsWidth = 0;
            slChain('ul.tabs li', header).each(function () {
                tabsWidth += slChain(this).outerWidth();
            });

            if (tabsWidth > header.width()) {
                slChain('.tabs-scroller-left', header).css('display', 'block');
                slChain('.tabs-scroller-right', header).css('display', 'block');
                slChain('.tabs-wrap', header).addClass('tabs-scrolling');

                // if (sl.boxModel == true) {
                slChain('.tabs-wrap', header).css('left', 2);
                //            } else {
                //                slChain('.tabs-wrap', header).css('left', 0);
                //            }
                var width = header.width()
				- slChain('.tabs-scroller-left', header).outerWidth()
				- slChain('.tabs-scroller-right', header).outerWidth();
                slChain('.tabs-wrap', header).width(width);

            } else {
                slChain('.tabs-scroller-left', header).css('display', 'none');
                slChain('.tabs-scroller-right', header).css('display', 'none');
                slChain('.tabs-wrap', header).removeClass('tabs-scrolling').scrollLeft(0);
                slChain('.tabs-wrap', header).width(header.width());
                slChain('.tabs-wrap', header).css('left', 0);

            }
        },

        /*
        *@description 获取当前tab离左端的距离
        */
        getTabLeftPosition: function (target, tab) {
            var w = 0;
            var b = true;
            slChain('>div.tabs-header ul.tabs li', target).each(function () {
                if (this == tab) {
                    return false;
                }
                w += slChain(this).outerWidth();

            });
            return w;
        },

        /*
        *@description 获取最大的左滚距离
        */
        getMaxScrollWidth: function (target) {
            var header = slChain('>div.tabs-header', target);
            var tabsWidth = 16; // all tabs width 右间距margin-right先加一个
            slChain('ul.tabs li', header).each(function () {
                tabsWidth += (slChain(this).outerWidth() + 4); //右间距margin-right
            });
            var wrapWidth = slChain('div.tabs-wrap', header).width();
            var padding = parseInt(slChain('ul.tabs', header).css('padding-left'));

            return tabsWidth - wrapWidth + padding;
        },

        /*
        *@description 让panel的宽高适合
        */
        fitContent: function (target) {
            var tab = slChain('>div.tabs-header ul.tabs li.tabs-selected', target);
            if (tab.length) {
                var panelId = sl.data(tab.elements[0], 'tabs.tab').id;
                var panel = slChain('#' + panelId);
                var panels = slChain('>div.tabs-panels', target);
                if (panels.css('height') != 'auto') {
                    //                        if (sl.boxModel == true) {
                    panel.height(panels.height() - (panel.outerHeight() - panel.height()));
                    panel.width(panels.width() - (panel.outerWidth() - panel.width()));
                    //                        } else {
                    //                            panel.height(panels.height());
                    //                            panel.width(panels.width());
                    //                        }
                }
            }

        }

    };

    var eventHelper = {


        /**
        * @description 点击选中tab事件
        * @param options  创建的tab的参数选项
        * @param tab 要选中的tab头
        */
        selectTab: function (event) {
            var $this = event.data.tab, target = event.data.target;
            var data = sl.data(target, "tabs"), tabs = slChain('ul.tabs', header);
            var header = data.header, TabOpt = sl.data($this.elements[0], "tabs.tab");
            slChain('.tabs-selected', tabs).removeClass('tabs-selected');
            //添加tabs-selected属性
            $this.addClass('tabs-selected');
            $this.blur();

            slChain('>div.tabs-panels>div', target).css('display', 'none');

            var wrap = slChain('.tabs-wrap', header);
            //获取所选的tab离左端的距离（包括滚动条左滚的）
            var leftPos = tabsStyleHelper.getTabLeftPosition(target, $this.elements[0]);
            //获取所选的tab的左端离div.tabs-wrap左端的距离
            var left = leftPos - wrap.scrollLeft();
            //获取所选的tab的右端离div.tabs-wrap左端的距离
            var right = left + $this.outerWidth();
            //如果tabs左端小于0或者右端大于宽度说明需要滚动
            if (left < 0 || right > wrap.innerWidth()) {
                var pos = Math.min(leftPos - (wrap.width() - $this.width()) / 2, tabsStyleHelper.getMaxScrollWidth(target));
                //wrap.animate({ scrollLeft: pos }, opts.scrollDuration);
                wrap.scrollLeft(pos);
            }

            var tabAttr = sl.data($this.elements[0], 'tabs.tab'), panel = slChain('#' + tabAttr.id);
            panel.css('display', 'block');
            //重置头的选中状态
            dataCacheHelper.setAllTabsDataUnSelected(target);
            //设置该头部信息的isSelect=true
            TabOpt.isSelect = true;
            tabsStyleHelper.fitContent(target);
        },

        /*
        *@description 默认或者根据title初始化选中
        */
        DefalutSelectTab: function (target, title) {
            if (title) {
                var elem = slChain('>div.tabs-header li:has(a span:contains("' + title + '"))', target).elements[0];
                if (elem) {
                    slChain(elem).trigger('click');
                }
            } else {

                var tabs = slChain('>div.tabs-header ul.tabs', target);
                if (slChain('.tabs-selected', tabs).length == 0) {
                    slChain('li:first', tabs).trigger('click');
                } else {
                    slChain('.tabs-selected', tabs).trigger('click');
                }
            }
        },
        /*
        *@description 关闭tab事件
        */
        onClose: function (event) {
            event.preventDefault();
            var target = event.data.target;
            var eventTab = event.target.parentNode;
            eventHelper.closeTab(target, eventTab);
            event.stopPropagation();
        },

        /*
        * @description 关闭某个指定的 tab
        */
        closeTab: function (target, tab) {

            if (!tab) return;
            var $tab = slChain(tab), tabAttr = sl.data(tab, 'tabs.tab'), panel = slChain('#' + tabAttr.id), opts = getOption(target);
            if (opts.onClose.call(panel, tabAttr.title) == false) return;

            //如果是移除选中的tab 要移除后重新选中一个tab
            var selected = slChain(tab).hasClass('tabs-selected');
            sl.removeData(tab, 'tabs.tab');

            slChain(tab).remove();
            panel.remove();
            dataCacheHelper.RemoveTabFromCache(tab, target);

            tabsStyleHelper.setSize(target);
            if (selected) {
                eventHelper.DefalutSelectTab(target);
            } else {
                var wrap = slChain('>div.tabs-header .tabs-wrap', target);
                var pos = Math.min(
					wrap.scrollLeft(),
					tabsStyleHelper.getMaxScrollWidth(target)
			);
                //wrap.animate({ scrollLeft: pos }, opts.scrollDuration);
                wrap.scrollLeft(pos);
            }
        },

        onScrollLeft: function (event) {
            var target = event.data.target;
            eventHelper.scrollLeft(target);
            event.stopPropagation();
        },

        /*
        *@description 向左滚动
        */
        scrollLeft: function (target) {
            var data = sl.data(target, "tabs"), header = data.header, wrap = slChain('.tabs-wrap', header), opts = getOption(target);
            if (opts == undefined) {
                opts = data.options;
            }
            var pos = Math.max(0, wrap.scrollLeft() - opts.scrollIncrement);

            // wrap.animate({ scrollLeft: pos }, opts.scrollDuration);
            wrap.scrollLeft(pos);
        },
        onScrollRight: function (event) {
            var target = event.data.target;
            eventHelper.scrollRight(target);
            event.stopPropagation();
        },
        /*
        * @description 向左滚动
        */
        scrollRight: function (target) {
            var data = sl.data(target, "tabs"), header = data.header, container = data.container;
            var wrap = slChain('.tabs-wrap', header), opts = getOption(target);
            if (opts == undefined) {
                opts = data.options;
            }
            var pos = Math.min(
					wrap.scrollLeft() + opts.scrollIncrement,
					tabsStyleHelper.getMaxScrollWidth(container)
			);
            //wrap.animate({ scrollLeft: pos }, opts.scrollDuration);
            wrap.scrollLeft(pos);
        }
    };

    var dataCacheHelper = {
        /**
        * @description 1、移除  sl.data(this, 'tabs', { options: opts, tabs: wrapTabs(this) }); 的tabs中的一个元素
        @param {DOMElement} e 要移除的tab头部对象
        @param {DOMElement} container 设置成tab的元素
        */
        RemoveTabFromCache: function (e, container) {
            var tabs = sl.data(container, 'tabs').tabs;
            for (var i = 0, m = tabs.length; i < m; i++) {
                if (e == tabs[i].elements[0]) {
                    sl.Array.removeAt(tabs, i);
                    break;
                }
            }
            dataCacheHelper.ResetTabsIndex(container);
        },
        /**
        * @description 由于移除删除或者增加元素 要重置每个tab头 的index信息
        @param {DOMElement} e 要移除的tab头部对象
        @param {DOMElement} container 设置成tab的元素
        */
        ResetTabsIndex: function (container) {
            var tabs = sl.data(container, 'tabs').tabs;
            for (var i = 0, m = tabs.length; i < m; i++) {
                sl.data(tabs[i].elements[0], "tabs.tab").index = i;
            }
        },


        /*
        * @description 把所有的tab中的缓存数据isSelect设置为false
        */
        setAllTabsDataUnSelected: function (target) {
            var opts = sl.data(target, 'tabs');
            var tabs = opts.tabs;
            sl.each(tabs, function (i, n) {
                sl.data(n.elements[0], "tabs.tab").isSelect = false;
            });

        }

    };
    this.tab = sl.Class(
    {
        init: function (elem, options) {
            this.elem = elem;
            var $this = slChain(elem), opts, state = sl.data(elem, 'tabs');
            if (state) {
                opts = sl.extend(true, state.options, options);
            }
            else {
                var htmlAttr = {
                    width: (parseInt(sl.css(elem, "width")) || undefined),
                    height: (parseInt(sl.css(elem, "height")) || undefined),
                    fit: ($this.attr('fit') ? $this.attr('fit') == 'true' : undefined),
                    border: ($this.attr('border') ? $this.attr('border') == 'true' : undefined),
                    plain: ($this.attr('plain') ? $this.attr('plain') == 'true' : undefined)
                };
                opts = sl.extend(true, defaults, htmlAttr, options);
                $this.data("tabs", { options: opts, container: null, header: null, panels: [], tabs: [] });

            }
            tabsPanelsHelper.wrapTabPanels(elem);
            tabsHeaderHelper.createTabHeaders(elem);
            tabsStyleHelper.setSize(elem);
            eventHelper.DefalutSelectTab(elem);
        },
        selectAt: function (Index) {
            tabsHeaderHelper.selectTabByIndex(this.elem, Index);
        },
        add: function (param) {
            tabsHeaderHelper.addOneTab(this.elem, param);
        },
        getSelected: function () {
            return tabsHeaderHelper.getSelectedTab(this.elem);
        }
    });

    function getOption(elem) {
        return sl.data(elem, "tabs").options;
    }

});
