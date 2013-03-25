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
sl.create("sl.ui",function () {
    var defaults = {
        disabled: false,
        handles: 'n, e, s, w, ne, se, sw, nw, all',
        minWidth: 10,
        minHeight: 10,
        maxWidth: 10000, //$(document).width(),
        maxHeight: 10000, //$(document).height(),
        edge: 5,
        onStartResize: function (e) { },
        onResize: function (e) { },
        onStopResize: function (e) { }
    };

    var resizableHelper = {
        /**
        * @description 获取拖拉的方向
        * @param {target} 目标元素
        * @param {event} 事件对象
        */
        getDirection: function (target, event) {

            var dir = '', $target = $(target);
            offset = $target.offset(),
             width = $target.outerWidth(),
            height = $target.outerHeight(),
            opts = sl.data(target, 'resizable').options,
            edge = opts.edge;
            if (event.pageY > offset.top && event.pageY < offset.top + edge) {
                dir += 'n';
            }
            else if (event.pageY < offset.top + height && event.pageY > offset.top + height - edge) {
                dir += 's';
            }
            if (event.pageX > offset.left && event.pageX < offset.left + edge) {
                dir += 'w';
            }
            else if (event.pageX < offset.left + width && event.pageX > offset.left + width - edge) {
                dir += 'e';
            }

            var handles = opts.handles.split(',');
            for (var i = 0; i < handles.length; i++) {
                var handle = handles[i].replace(/(^\s*)|(\s*$)/g, '');
                if (handle == 'all' || handle == dir) {
                    return dir;
                }
            }
            return '';
        }



    };
    var eventHelper = {
        beginResize: function (event) {
            sl.data(event.data.target, 'resizable').options.onStartResize.call(event.data.target, event);
            return false;
        },
        onResize: function (event) {
            sl.data(event.data.target, 'resizable').options.onResize.call(event.data.target, event);
            var resizeData = event.data, options = sl.data(resizeData.target, 'resizable').options, height, width;
            //拖拉后的高度

            if (resizeData.dir.indexOf('w') != -1) {
                //北 向右减小宽度
                width = resizeData.startWidth - (event.pageX - resizeData.startX);
            }
            else {
                width = resizeData.startWidth + event.pageX - resizeData.startX;
            }

            //拖拉后的高度
            if (resizeData.dir.indexOf('n') != -1) {
                //南 向下减少高度
                height = resizeData.startHeight - (event.pageY - resizeData.startY);
            }
            else {
                height = resizeData.startHeight + event.pageY - resizeData.startY;
            }
            //高度不能超过允许的最大高度 不能小于允许的最小高度
            height = Math.min(Math.max(height, options.minHeight), options.maxHeight);
            //宽度不能超过允许的最大宽度 不能小于允许的最小宽度
            width = Math.min(Math.max(width, options.minWidth), options.maxWidth);

            if (resizeData.dir.indexOf('e') != -1) {
                resizeData.width = width;
            }
            if (resizeData.dir.indexOf('s') != -1) {
                resizeData.height = height;
            }
            if (resizeData.dir.indexOf('w') != -1) {

                if (width > options.minWidth && width < options.maxWidth) {
                    resizeData.left = resizeData.startLeft + event.pageX - resizeData.startX;
                    resizeData.width = width
                }
            }
            if (resizeData.dir.indexOf('n') != -1) {
                if (height > options.minHeight && height < options.maxHeight) {
                    resizeData.top = resizeData.startTop + event.pageY - resizeData.startY;
                    resizeData.height = height
                }
            }

            eventHelper.applySize(event);
        },
        stopResize: function (event) {
            sl.data(event.data.target, 'resizable').options.onStopResize.call(event.data.target, event);
            eventHelper.onResize(event);
            eventHelper.applySize(event);
            $(document).unbind('mousedown');
            $(document).unbind('mousemove');
            $(document).unbind('mouseup');

            return false;
        },
        //最后应用长宽
        applySize: function (event) {
            var resizeData = event.data;
            var target = resizeData.target;
            //            if ($.boxModel == true) {
            $(target).css({
                width: resizeData.width - resizeData.deltaWidth,
                height: resizeData.height - resizeData.deltaHeight,
                left: resizeData.left,
                top: resizeData.top
            });
            //            } else {
            //                $(target).css({
            //                    width: resizeData.width,
            //                    height: resizeData.height,
            //                    left: resizeData.left,
            //                    top: resizeData.top
            //                });
            //            }
        }
    };
    this.resizeable = sl.Class(
    {
        init: function (elem, options) {
            this.opts = sl.extend({}, defaults, options);

            // bind mouse event using namespace resizable
            $(elem).bind('mousemove', onMouseMove).bind('mousedown', onMouseDown);
            sl.data(elem, 'resizable', {
                options: this.opts
            });
            function onMouseMove(e) {
                var dir = resizableHelper.getDirection(this, e);
                if (dir == '') {
                    $(this).css('cursor', 'default');
                } else {
                    $(this).css('cursor', dir + '-resize');
                }
            }
            function onMouseDown(e) {
                var dir = resizableHelper.getDirection(this, e), $target = $(this);
                if (dir == '') return;
                var data = {
                    target: this,
                    dir: dir,
                    startLeft: getCssValue($target, 'left'),
                    startTop: getCssValue($target, 'top'),
                    left: getCssValue($target, 'left'),
                    top: getCssValue($target, 'top'),
                    startX: e.pageX,
                    startY: e.pageY,
                    startWidth: $target.outerWidth(),
                    startHeight: $target.outerHeight(),
                    width: $target.outerWidth(),
                    height: $target.outerHeight(),
                    deltaWidth: $target.outerWidth() - $target.width(),
                    deltaHeight: $target.outerHeight() - $target.height()
                };
                $(document).bind('mousedown', data, eventHelper.beginResize);
                $(document).bind('mousemove', data, eventHelper.onResize);
                $(document).bind('mouseup', data, eventHelper.stopResize);
            }
            function getCssValue($target, css) {
                var val = parseFloat($target.css(css));
                if (isNaN(val)) {
                    return 0;
                } else {
                    return val;
                }
            }
        }
    });

  

});