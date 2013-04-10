//遮罩层
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
    var opts;

    var defaults = {
        noheader: false, //是否显示头
        title: "<span>&nbsp;&nbsp;</span>",
        width: 'auto',
        height: 'auto',
        left: null,
        top: null,
        border: true,
        //自定义工具
        tools: [],
        //是够可以改变大小
        resizeable: false,
        //是否可以拖拉
        draggable: false,

        collapsible: false,
        //定义是否显示最小化按钮
        minimizable: false,
        maximizable: false,
        closable: false,


        collapsed: false,
        minimized: false, //定义在初始化的时候最小化面板
        maximized: false,
        closed: false, //定义在初始化的时候关闭面板


        onBeforeOpen: function () { },
        onOpen: function () { },
        onBeforeClose: function () { },
        onClose: function () { },
        onBeforeDestroy: function () { },
        onDestroy: function () { },
        onResize: function (width, height) { },
        onMaximize: function () { },
        onRestore: function () { },
        onMinimize: function () { },
        onBeforeCollapse: function () { },
        onBeforeExpand: function () { },
        onCollapse: function () { },
        onExpand: function () { },
        animate: true
    };
    var reSizeAndDraggable = {
        setDraggable: function (target) {
            var data = $.data(target, 'panel');
            var $panel = data.panel;
            //  var dragHandle = $("div.panel-header", $panel);
            $panel.CalvinDraggable({ handle: "div.panel-header", containment: $panel.get(0).parentNode });

        },
        setResizeable: function (target) {
            var data = $.data(target, 'panel');
            var $panel = data.panel;
            var $parent = $panel.parent();
            var maxWidth = $parent.width();
            var maxHeight = $parent.height();
            $panel.CalvinResizable({ maxWidth: maxWidth, maxHeight: maxHeight, onResize: function () {
                var params = {};
                params.height = $panel.height();
                params.width = $panel.width();
                otherHelper.setSizeByParams(target, params);

            }, onStopResize: function () {
                var params = {};
                params.height = $panel.height();
                params.width = $panel.width();
                otherHelper.setSizeByParams(target, params);

            }
            });
        }

    };
    var htmlHelper = {

        /**
        * @description 包裹target形成panner
        * @param {target} 目标元素
        * @returns 包裹后的jq对象
        */
        formPanel: function (target) {
            var $target = $(target);

            var $panel = $(target).addClass('panel-body').wrap('<div class="panel"></div>').parent();

            $panel.addClass(opts.cls);
            return $panel;
        },
        //销毁已有的panel
        destroy: function (target) {

            var $target = $(target);
            var panel = $.data(target, "panel").panel;

            var orginTarget = $.data(target, "panel").originInfo.obj;
            var orginParentNode = target.parentNode.parentNode;
            $.removeData(target, "panel");
            panel.remove();
            orginParentNode.appendChild(orginTarget);
        }
    };

    var headerHelper =
        {
            /**
            * @description 构造pannelheader对象
            * @param {target} 目标元素
            * @returns header的jq对象
            */
            formHeader: function (target) {
                var panel = $.data(target, 'panel').panel;
                var opts = $.data(target, 'panel').options;
                if (!opts.noheader) {
                    var $header = $('<div class="panel-header"><div class="panel-title">' + opts.title + '</div></div>').prependTo(panel);
                    var $tool = $('<div class="panel-tool"></div>').appendTo($header);
                    if (opts.closable) {
                        $('<div class="panel-tool-close"></div>').appendTo($tool).bind('click', { panelTarget: target }, eventHelper.onClose);
                    }
                    if (opts.maximizable) {
                        $('<div class="panel-tool-max"></div>').appendTo($tool).bind('click', { panelTarget: target }, eventHelper.onMaxAndRestore);
                    }
                    if (opts.minimizable) {
                        $('<div class="panel-tool-min"></div>').appendTo($tool).bind('click', onMin);
                    }
                    if (opts.collapsible) {
                        $('<div class="panel-tool-collapse"></div>').appendTo($tool).bind('click', { panelTarget: target }, eventHelper.onCollapseAndExpend);
                    }
                    if (opts.tools) {
                        for (var i = opts.tools.length - 1; i >= 0; i--) {
                            var t = $('<div></div>').addClass(opts.tools[i].iconCls).appendTo($tool);
                            if (opts.tools[i].handler) {
                                t.bind('click', eval(opts.tools[i].handler));
                            }
                        }
                    }
                    $tool.find('div').hover(function () {
                        $(this).addClass('panel-tool-over');
                    }, function () {
                        $(this).removeClass('panel-tool-over');
                    });
                    return $header;
                }
                return null;
            }

        };

    var eventHelper = {
        /**
        * @description 关闭面板
        */
        onClose: function (event) {
            eventHelper.closePanel(event.data.panelTarget, false);
            event.stopPropagation();
        },
        closePanel: function (target, forceClose) {
            var $panel = $.data(target, "panel").panel;
            var opts = $.data(target, "panel").options;
            if (forceClose != true) {
                if (opts.onBeforeClose.call(target) == false) return;
            }
            $panel.hide();
            opts.closed = true;
            opts.onClose.call(target);

        },
        /**
        * @description 缩起面板或者展开面板
        */
        onCollapseAndExpend: function (event) {
            var paneltarget = event.data.panelTarget;
            if ($(this).hasClass('panel-tool-expand')) {
                eventHelper.expandPanel(paneltarget, opts.animate);
            } else {
                eventHelper.collapsePanel(paneltarget, opts.animate);
            }
            event.stopPropagation();
        },
        collapsePanel: function (target, animate) {
            var opts = $.data(target, "panel").options;
            var panel = $.data(target, 'panel').panel;
            var body = panel.find('>div.panel-body');
            var tool = panel.find('>div.panel-header .panel-tool-collapse');

            if (tool.hasClass('panel-tool-expand')) return;

            body.stop(true, true); // stop animation
            if (opts.onBeforeCollapse.call(target) == false) return;

            tool.addClass('panel-tool-expand');
            if (animate) {
                body.slideUp('normal', function () {
                    opts.collapsed = true;
                    opts.onCollapse.call(target);
                });
            }
            else {
                body.hide();
                opts.collapsed = true;
                opts.onCollapse.call(target);
            }
        },
        expandPanel: function (target, animate) {
            var opts = $.data(target, "panel").options;
            var panel = $.data(target, 'panel').panel;
            var body = panel.find('>div.panel-body');
            var tool = panel.find('>div.panel-header .panel-tool-collapse');

            if (!tool.hasClass('panel-tool-expand')) return;

            body.stop(true, true); // stop animation
            if (opts.onBeforeExpand.call(target) == false) return;

            tool.removeClass('panel-tool-expand');
            if (animate) {
                body.slideDown('normal', function () {
                    opts.collapsed = false;
                    opts.onExpand.call(target);
                });
            }
            else {
                body.show();
                opts.collapsed = false;
                opts.onExpand.call(target);
            }

        },
        /**
        * @description 重新打开面包
        */
        onOpen: function (event) {
            eventHelper.closePanel(event.data.panelTarget, false);
            event.stopPropagation();
        },
        openPanel: function (target, forceOpen) {
            var opts = $.data(target, "panel").options;
            var $panel = $.data(target, "panel").panel;
            if (forceOpen != true) {
                if (opts.onBeforeOpen.call(target) == false) return;
            }
            $panel.show();
            opts.closed = false;
            opts.onOpen.call(target);
        },
        onMaxAndRestore: function (event) {
            var paneltarget = event.data.panelTarget;
            if ($(this).hasClass('panel-tool-restore')) {
                eventHelper.restorePanel(paneltarget);
            } else {
                eventHelper.maximizePanel(paneltarget);
            }
            return false;
        },
        maximizePanel: function (target) {
            otherHelper.setMaxsizeStyle(target);
        },
        restorePanel: function (target) {
            otherHelper.setRestroreStyle(target);
        }
    };

    var otherHelper = {
        setNormalStyle: function (target) {
            var $target = $(target);
            var width = $target.width();
            var height = $target.height();
            var panel = $.data(target, 'panel').panel;
            $.data(target, 'panel').originalStyle.height = height;
            $.data(target, 'panel').originalStyle.width = width;
            var pheader = panel.find('>div.panel-header');
            var pbody = panel.find('>div.panel-body');
            panel.width(width - (panel.outerWidth() - panel.width()));

            pheader.width(panel.width() - (pheader.outerWidth() - pheader.width()));
            pbody.width(panel.width() - (pbody.outerWidth() - pbody.width()));

        },
        setMaxsizeStyle: function (target) {
            var opts = $.data(target, 'panel').options;
            var panel = $.data(target, 'panel').panel;
            var tool = panel.find('>div.panel-header .panel-tool-max');

            if (tool.hasClass('panel-tool-restore')) return;

            tool.addClass('panel-tool-restore');
            var parent = panel.parent();
            if (parent.css("position") == "satic") {
                panel.css({ left: "0px", top: "0px" });
            }
            else {
                var position = parent.position();
                panel.css({ left: position.left + "px", top: position.top + "px" });
            }
            var pheader = panel.find('>div.panel-header');
            var pbody = panel.find('>div.panel-body');
            /* 2012 6月4号修正*/
            panel.width(parent.innerWidth());
            // panel.width(parent.width() - (panel.outerWidth() - panel.width()));
            pheader.width(panel.width() - (pheader.outerWidth() - pheader.width()));
            pbody.width(panel.width() - (pbody.outerWidth() - pbody.width()));
            /* 2012 6月4号修正*/
            panel.height(parent.innerHeight());
            // panel.height(parent.height() - (panel.outerHeight() - panel.height()));
            pbody.height(panel.height() - pheader.outerHeight() - (pbody.outerHeight() - pbody.height()));
            opts.minimized = false;
            opts.maximized = true;
            opts.onMaximize.call(target);

        },
        setRestroreStyle: function (target) {
            var $target = $(target);
            var opts = $.data(target, 'panel').options;
            var panel = $.data(target, 'panel').panel;
            var tool = panel.find('>div.panel-header .panel-tool-max');

            if (!tool.hasClass('panel-tool-restore')) return;

            panel.show();
            tool.removeClass('panel-tool-restore');
            var panel = $.data(target, 'panel').panel;
            var height = $.data(target, 'panel').originalStyle.height;
            var width = $.data(target, 'panel').originalStyle.width;
            var pheader = panel.find('>div.panel-header');
            var pbody = panel.find('>div.panel-body');
            panel.width(width - (panel.outerWidth() - panel.width()));
            pheader.width(panel.width() - (pheader.outerWidth() - pheader.width()));
            pbody.width(panel.width() - (pbody.outerWidth() - pbody.width()));
            pbody.height(height);
            panel.height(pheader.outerHeight() + pbody.outerHeight());

        },
        /*
        * 根据参数重新设置宽度和高度
        */
        setSizeByParams: function (target, params) {
            var $target = $(target);
            var data = $.data(target, "panel");
            var opts = data.options;
            var panel = data.panel;
            var pheader = panel.find('>div.panel-header');
            var pbody = panel.find('>div.panel-body');


            if (params) {
                if (params.width) opts.width = params.width;
                if (params.height) opts.height = params.height;
                if (params.left != null) opts.left = params.left;
                if (params.top != null) opts.top = params.top;
            }



            panel.css({
                left: opts.left,
                top: opts.top
            });

            panel.addClass(opts.cls);
            pheader.addClass(opts.headerCls);
            pbody.addClass(opts.bodyCls);

            if (!isNaN(opts.width)) {
                //                    if ($.support.boxModel == true) {
                panel.width(opts.width - (panel.outerWidth() - panel.width()));
                pheader.width(panel.width() - (pheader.outerWidth() - pheader.width()));
                pbody.width(panel.width() - (pbody.outerWidth() - pbody.width()));
                //                    } else {
                //                        panel.width(opts.width);
                //                        pheader.width(panel.width());
                //                        pbody.width(panel.width());
                //                    }
            } else {
                panel.width('auto');
                pbody.width('auto');
            }
            if (!isNaN(opts.height)) {
                // if ($.boxModel == true) {
                panel.height(opts.height - (panel.outerHeight() - panel.height()));
                pbody.height(panel.height() - pheader.outerHeight() - (pbody.outerHeight() - pbody.height()));
                //                    } else {
                //                        panel.height(opts.height);
                //                        pbody.height(panel.height() - pheader.outerHeight());
                //                    }
            } else {
                pbody.height('auto');
            }
            panel.css('height', null);

            opts.onResize.apply(target, [opts.width, opts.height]);
        },
        /*
        * 设置初始化状态 比如是最大化 最小化 展开
        */
        setInitalState: function (target, options) {
            if (opts.maximized == true) {
                eventHelper.maximizePanel(target);
            }
            if (opts.minimized == true) {
                eventHelper.minimizePanel(target);

            }
            if (opts.collapsed == true) {
                eventHelper.collapsePanel(target);
            }

            if (opts.closed == true) {
                eventHelper.closePanel(target);
            }
        }
    };


    this.panel = sl.Class(
    {
        init: function (elem, options) {
            var $this = $(this);
            var width = $this.width();
            var height = $this.height();
            var state = $.data(this, 'panel');

            if (state) {
                // htmlHelper.destroy(this);
                opts = $.extend(state.options, options);
                state.options = opts;
            }
            else {

                opts = $.extend(defaults, {
                    width: (parseInt($this.css('width')) || undefined),
                    height: (parseInt($this.css('height')) || undefined),
                    left: (parseInt($this.css('left')) || undefined),
                    top: (parseInt($this.css('top')) || undefined),
                    title: ($this.attr('title') || "<span>&nbsp;</span>")
                }, options);
                $this.data("panel", { width: width, height: height, panel: null, header: null, options: opts, originalStyle: { height: 0, width: 0 }, originInfo: { obj: this} });
                var data = $this.data("panel");
                var $pannel = htmlHelper.formPanel(this);
                data.panel = $pannel;
                var $header = headerHelper.formHeader(this);
                data.header = $header;
                if (opts.draggable) {
                    reSizeAndDraggable.setDraggable(this);
                }
                if (opts.resizeable) {
                    reSizeAndDraggable.setResizeable(this);
                }
            }
            /*如果多次调用calvinPanel的话 因为target被JS重新设置宽度 采用把target的原始宽度缓存起来 
            *防止多次调用 宽度逐渐缩小*/
            var data = $.data(this, "panel");
            if (data) {

                $this.height(data.height);
                $this.width(data.width);

            }

            otherHelper.setNormalStyle(this);
            otherHelper.setInitalState(this);

        }


    });
});