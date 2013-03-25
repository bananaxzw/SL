/// <reference path="../sl.js" />
/// <reference path="../SL.Node.js" />
/// <reference path="../SL.throttle.js" />
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
sl.create("sl.ui",function () {

    var defaults = {
        //值为"clone"或者是返回jq元素的function
        proxy: null,
        proxyClass: { "opacity": 70 },
        revert: false,
        cursor: 'move',
        deltaX: null,
        deltaY: null,
        //handle代表对象拖拉的 手柄的区域 比如有个panel可以设置它的handle为header部位
        handle: null,
        disabled: false,
        //可拖动的偏移量
        edge: 0,
        //移动限制 只能在某个范围内移动 值为Dom元素
        containment: null,
        axis: null, // v or h
        onStartDrag: function (e) { },
        onDrag: function (e) { },
        onStopDrag: function (e) { }
    };
    var eventHelper = {
        beginDrag: function (e) {
            var opts = sl.data(e.data.target, 'draggable').options;

            //获取可以停靠的对象
            var droppables = $('.droppable').filter(function () {
                return e.data.target != this;
            }).filter(function () {
                var accept = sl.data(this, 'droppable').options.accept;
                if (accept) {
                    return $(accept).filter(function () {
                        return this == e.data.target;
                    }).length > 0;
                }
                else {
                    return true;
                }
            });
            sl.data(e.data.target, 'draggable').droppables = droppables;

            //拖动元素时候的代理元素  值为"clone"或者是返回jq元素的function 如果没有的话 就使用本身
            var proxy = sl.data(e.data.target, 'draggable').proxy;
            if (!proxy) {
                if (opts.proxy) {
                    if (opts.proxy == 'clone') {
                        proxy = $(e.data.target).clone().insertAfter(e.data.target);
                    }
                    else {
                        proxy = opts.proxy.call(e.data.target,e.data.target);
                    }
                    sl.data(e.data.target, 'draggable').proxy = proxy;
                    proxy.css(opts.proxyClass);
                }
                else {
                    proxy = $(e.data.target);
                }
            }
            proxy.css('position', 'absolute');
            eventHelper.drag(e);
            eventHelper.applyDrag(e);

            opts.onStartDrag.call(e.data.target, e);
            return false;
        },
        onDrag: function (e) {
            var opts = sl.data(e.data.target, 'draggable').options;
            if (opts.containment) {
                eventHelper.moveInContainment(e);
            }
            else {
                eventHelper.drag(e);
            }
            if (sl.data(e.data.target, 'draggable').options.onDrag.call(e.data.target, e) != false) {
                eventHelper.applyDrag(e);
            }
            var source =e.data.target;
            //触发droppable事件
            sl.data(e.data.target, 'draggable').droppables.each(function () {
                var dropObj = $(this);
                var p2 = $(this).offset();
                if (e.pageX > p2.left && e.pageX < p2.left + dropObj.outerWidth()
            && e.pageY > p2.top && e.pageY < p2.top + dropObj.outerHeight()) {
                    if (!this.entered) {
                        //触发_dragenter事件
                        $(this).trigger('_dragenter', [source]);
                        this.entered = true;
                    }
                    $(this).trigger('_dragover', [source]);
                }
                else {
                    if (this.entered) {
                        //离开
                        $(this).trigger('_dragleave', [source]);
                        this.entered = false;
                    }
                }
            });
            return false;
        },
        endDrag: function (e) {
            /// <summary>
            /// 结束拖拉 在mouseup触发
            /// </summary>
            /// <param name="e"></param>
            /// <returns type=""></returns>
            var opts = sl.data(e.data.target, 'draggable').options;
            if (opts.containment) {
                eventHelper.moveInContainment(e);
            }
            else {
                eventHelper.drag(e);
            }

            var proxy = sl.data(e.data.target, 'draggable').proxy;
            //如果设置revert 为true则会还原到原先位置
            if (opts.revert) {
                //如果是拖动到可drop对象内 应该立即消失 模拟已经放到容器中 （可定制事件）
                if (checkDrop() == true) {
                    removeProxy();
                    $(e.data.target).css({
                        position:e.data.startPosition,
                        left:e.data.startLeft,
                        top:e.data.startTop
                    });
                }
                else {
                    //如果没有拖动对象内 则用动画返回
                    if (proxy) {
                        /*
                        proxy.animate({
                        left:e.data.startLeft,
                        top:e.data.startTop
                        }, function () {
                        removeProxy();
                        });*/
                        proxy.css({
                            left:e.data.startLeft,
                            top:e.data.startTop
                        });
                        removeProxy();
                    }
                    else {
                        /*
                        $(e.data.target).animate({
                        left:e.data.startLeft,
                        top:e.data.startTop
                        }, function () {
                        $(e.data.target).css('position',e.data.startPosition);
                        });*/
                        $(e.data.target).css({
                            left:e.data.startLeft,
                            top:e.data.startTop
                        });
                        $(e.data.target).css('position',e.data.startPosition);
                    }
                }
            }
            else {
                $(e.data.target).css({
                    position: 'absolute',
                    left:e.data.left,
                    top:e.data.top
                });
                removeProxy();
                checkDrop();
            }

            opts.onStopDrag.call(e.data.target, e);

            function removeProxy() {
                if (proxy) {
                    proxy.remove();
                }
                sl.data(e.data.target, 'draggable').proxy = null;
            }

            function checkDrop() {
                var data = sl.data(e.data.target, 'draggable');
                if (!data.droppables) return;
                var dropped = false;
                data.droppables.each(function () {
                    var dropObj = $(this);
                    var p2 = $(this).offset();
                    if (e.pageX > p2.left && e.pageX < p2.left + dropObj.outerWidth()
						&& e.pageY > p2.top && e.pageY < p2.top + dropObj.outerHeight()) {
                        if (opts.revert) {
                            $(e.data.target).css({
                                position:e.data.startPosition,
                                left:e.data.startLeft,
                                top:e.data.startTop
                            });
                        }
                        $(this).trigger('_drop', [e.data.target]);
                        dropped = true;
                        this.entered = false;
                    }
                });
                return dropped;
            }

            $(document).unbind("mousedown");
            $(document).unbind("mousemove");
            $(document).unbind("mouseup");
            return false;

        },
        applyDrag: function (e) {
            var opts = sl.data(e.data.target, 'draggable').options;
            var proxy = sl.data(e.data.target, 'draggable').proxy;
            if (proxy) {
                proxy.css('cursor', opts.cursor);
            } else {
                proxy = $(e.data.target);
                sl.data(e.data.target, 'draggable').handle.css('cursor', opts.cursor);
            }
            proxy.css({
                left:e.data.left,
                top:e.data.top
            });
        },
        drag: function (e) {
            /// <summary>
            /// 无容器的移动 这里只是获取e的位置信息 然后applyDrag应用这个位置信息
            /// </summary>
            /// <param name="e"></param>
            var opts = sl.data(e.data.target, 'draggable').options;

            var dragData =e.data;
            var left = dragData.startLeft + e.pageX - dragData.startX;
            var top = dragData.startTop + e.pageY - dragData.startY;

            if (opts.deltaX != null && opts.deltaX != undefined) {
                left = e.pageX + opts.deltaX;
            }
            if (opts.deltaY != null && opts.deltaY != undefined) {
                top = e.pageY + opts.deltaY;
            }
            //如果父元素不是body就加上滚动条
            if (e.data.parent != document.body) {
                if (sl.boxModel == true) {
                    left += $(e.data.parent).scrollLeft();
                    top += $(e.data.parent).scrollTop();
                }
            }
            //如果只允许水平或者垂直 只单单设置top或者left
            if (opts.axis == 'h') {
                dragData.left = left;
            } else if (opts.axis == 'v') {
                dragData.top = top;
            } else {
                dragData.left = left;
                dragData.top = top;
            }
        },
        moveInContainment: function (e) {
            /// <summary>
            /// 有容器的移动 这里只是获取e的位置信息 然后applyDrag应用这个位置信息
            /// </summary>
            /// <param name="e"></param>
            var data = sl.data(e.data.target, 'draggable');
            var opts = data.options;
            var containment = opts.containment;
            var dragData =e.data;
            var target = dragData.target;
            var targetHeight = $(target).outerHeight();
            var targetWidth = $(target).outerWidth();
            var ConstrainArea = dragData.ConstrainArea;
            var elementArea = dragData.targetArea;

            //移动的X方向距离
            var moveX = e.pageX - dragData.startX;
            //移动的Y方向距离
            var moveY = e.pageY - dragData.startY;

            //向左移动 但是移动距离不能超过2者的右边之差
            if (moveX > 0) {
                moveX = Math.min((ConstrainArea.right - elementArea.right), moveX);
            }
            else {
                moveX = Math.max((ConstrainArea.left - elementArea.left), moveX);
            }
            //向下移动 但是移动距离不能超过2者的下边之差
            if (moveY > 0) {
                moveY = Math.min((ConstrainArea.under - elementArea.under), moveY);
            }
            else {
                moveY = Math.max((ConstrainArea.top - elementArea.top), moveY);
            }

            dragData.left = dragData.startLeft + moveX;
            dragData.top = dragData.startTop + moveY;


        }
    };
    var domHelper = {
        //获取传入的各个元素的边界值
        getElementsArea: function () {
            if (arguments.length == 0) return;
            var tempArray = new Array();
            for (var i = 0, m = arguments.length; i < m; i++) {
                var ConstrainArea = {};
                if (arguments[i] == window)
                    arguments[i] = document.body || document.documentElement;
                var $containment = $(arguments[i]);


                ConstrainArea.top = $containment.offset().top;
                ConstrainArea.left = $containment.offset().left;
                ConstrainArea.under = ConstrainArea.top + $containment.innerHeight();
                ConstrainArea.right = ConstrainArea.left + $containment.innerWidth();

                //                    if ($.support.boxModel) {
                //                        ConstrainArea.under = ConstrainArea.top + $containment.outerHeight();
                //                        ConstrainArea.right = ConstrainArea.left + $containment.outerWidth();
                //                    }
                //                    else {
                //                        ConstrainArea.under = ConstrainArea.top + $containment.height();
                //                        ConstrainArea.right = ConstrainArea.left + $containment.width();
                // }
                tempArray.push(ConstrainArea);
            }
            return tempArray;
        },

        //判断对象是否是window 或者 html 或者body
        isWindow: function (obj) {
            var isWindow = obj == window || obj == document
			|| !obj.tagName || (/^(?:body|html)$/i).test(obj.tagName);
            return isWindow;
        }
    };
    this.draggable = sl.Class(
    {
        init: function (elem, options) {
            if (!elem || !elem.nodeType || elem.nodeType != 1) { alert("无效拖拉对象"); return; }
            //handle代表对象拖拉的 手柄的区域 比如有个panel可以设置它的handle为header部位
            var opts, state = sl.data(elem, 'draggable');
            if (state) {
                // state.handle.unbind('.draggable');
                opts = sl.extend(state.options, options);
            } else {
                opts = sl.extend({}, defaults, options || {});
            }
            opts.containment = opts.containment || elem.ownerDocument.documentElement || elem.ownerDocument.body;
            if (opts.disabled == true) {
                $(this).css('cursor', 'default');
                return;
            }
            //        if (opts.containment) {
            //            $(elem).css("margin", "0px");
            //        }

            var handle = null;
            if (typeof opts.handle == 'undefined' || opts.handle == null) {
                handle = $(elem);
            } else {
                handle = (typeof opts.handle == 'string' ? $(opts.handle, elem) : handle);
            }
            sl.data(elem, 'draggable', {
                options: opts,
                handle: handle
            });

            // bind mouse event using event namespace draggable
            handle.bind('mousedown', { target: elem }, onMouseDown);
            handle.bind('mousemove', { target: elem }, onMouseMove);

            function onMouseDown(e) {
                if (checkArea(e) == false) return;
                var $target = $(e.data.target);
                var position = $target.position();
                var data = {
                    startPosition: $target.css('position'),
                    startLeft: position.left,
                    startTop: position.top,
                    left: position.left,
                    top: position.top,
                    startX: e.pageX,
                    startY: e.pageY,
                    target:e.data.target,
                    parent: $(e.data.target).parent()[0],
                    targetArea: {},
                    ConstrainArea: {},
                    proxy: opts.proxy
                };
                computeArea(opts.containment,e.data.target);
                $(document).bind('mousedown', data, eventHelper.beginDrag);
                $(document).bind('mousemove', data, sl.throttle(50, eventHelper.onDrag, true));
                $(document).bind('mouseup', data, eventHelper.endDrag);
                //计算目标区划 和 限制区划
                function computeArea(constrain, target) {
                    var areas = domHelper.getElementsArea(constrain, target), $target = $(target);
                    data.ConstrainArea = areas[0];
                    areas[1].under = (areas[1].under + parseFloat($target.css("border-top-width")) + parseFloat($target.css("border-bottom-width")));
                    areas[1].right = (areas[1].right + parseFloat($target.css("border-left-width")) + parseFloat($target.css("border-right-width")));
                    data.targetArea = areas[1];
                }
            }

            function onMouseMove(e) {
                if (checkArea(e)) {
                    $(this).css('cursor', opts.cursor);
                } else {
                    $(this).css('cursor', 'default');
                }
            }

            // 鼠标是不是在手柄的可拖动区域
            function checkArea(e) {
                var offset = $(handle).offset();
                var width = $(handle).outerWidth();
                var height = $(handle).outerHeight();
                var edge = opts.edge;
                if (e.pageY - offset.top > edge) {
                    if (offset.left + width - e.pageX > edge) {
                        if (offset.top + height - e.pageY > edge) {
                            if (e.pageX - offset.left > edge) {
                                return true;
                            }
                            return false;
                        }
                        return false;
                    }
                    return false;
                }
                return false;
            }

        }
    });
});