/// <reference path="SL.Core.js" />
/// <reference path="SL.CSS.js" />
/// <reference path="SL.support.js" />
sl.create(function () {
    /**
    *DOM元素位置处理
    *@namespace
    *@name offset
    */
    function offset() {
        this.init = function () {
            if (this.Initialed) return;
            var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat(sl.css(body, "marginTop")) || 0,
			html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

            sl.extend(container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" });

            container.innerHTML = html;
            body.insertBefore(container, body.firstChild);
            innerDiv = container.firstChild;
            checkDiv = innerDiv.firstChild;
            td = innerDiv.nextSibling.firstChild.firstChild;

            //定位的时候 是否加上offsetParent的边框width
            this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
            //定位的时候  rd是否已经加上边框
            this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

            checkDiv.style.position = "fixed", checkDiv.style.top = "20px";
            // safari subtracts parent border width here which is 5px
            //是否支持fixed
            this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
            checkDiv.style.position = checkDiv.style.top = "";

            innerDiv.style.overflow = "hidden", innerDiv.style.position = "relative";
            this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);
            //body的offset是否包含了margin
            this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

            body.removeChild(container);
            body = container = innerDiv = checkDiv = table = td = null;
        };
        this.Initialed = false;
    }
    offset.prototype = {
        /**
        *@ignore
        */
        bodyOffset: function (body) {
            var top = body.offsetTop, left = body.offsetLeft;

            this.init();

            if (this.doesNotIncludeMarginInBodyOffset) {
                top += parseFloat(sl.css(body, "marginTop")) || 0;
                left += parseFloat(sl.css(body, "marginLeft")) || 0;
            }

            return { top: top, left: left };
        },
        /**
        *@ignore
        */
        getOffset: function (node) {
            if ("getBoundingClientRect" in document.documentElement) {

                if (!node || !node.ownerDocument) {
                    return null;
                }

                if (node === node.ownerDocument.body) {
                    return this.bodyOffset(node);
                }
                var box = node.getBoundingClientRect();
                if (!box || node.ownerDocument.documentElement == node) {
                    return box ? { top: box.top, left: box.left} : { top: 0, left: 0 };
                }



                var doc = node.ownerDocument, body = doc.body, docElem = doc.documentElement,
			clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
			top = box.top + (self.pageYOffset || sl.Support.boxModel && docElem.scrollTop || body.scrollTop) - clientTop,
			left = box.left + (self.pageXOffset || sl.Support.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;

                return { top: top, left: left };

            }
        },
        /**
        *@ignore
        */
        setOffset: function (elem, options) {
            var position = sl.css(elem, "position");
            if (position === "static") {
                elem.style.position = "relative";
            }

            var curOffset = this.getOffset(elem),
			curCSSTop = sl.css(elem, "top"),
			curCSSLeft = sl.css(elem, "left"),
			calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop == "auto" || curCSSLeft == "auto"),
			props = {}, curPosition = {}, curTop, curLeft;

            if (calculatePosition) {
                curPosition = this.position(elem);
                curTop = curPosition.top;
                curLeft = curPosition.left;
            } else {
                curTop = parseFloat(curCSSTop) || 0;
                curLeft = parseFloat(curCSSLeft) || 0;
            }


            if (options.top != null) {
                props.top = (options.top - curOffset.top) + curTop;
            }
            if (options.left != null) {
                props.left = (options.left - curOffset.left) + curLeft;
            }
            sl.css(elem, props);

        },
        /**
        *获取元素的position属性
        *@param elem 元素
        *@return {top:**,left:**}
        */
        position: function (elem) {

            var offsetParent = this.offsetParent(elem), offset = this.getOffset(elem);
            parentOffset = /^(?:body|html)$/i.test(offsetParent.nodeName) ? { top: 0, left: 0} : this.getOffset(offsetParent);

            offset.top -= parseFloat(sl.css(elem, "marginTop")) || 0;
            offset.left -= parseFloat(sl.css(elem, "marginLeft")) || 0;

            parentOffset.top += parseFloat(sl.css(offsetParent, "borderTopWidth")) || 0;
            parentOffset.left += parseFloat(sl.css(offsetParent, "borderLeftWidth")) || 0;

            // (top-parentTop-parentBodrder-maigin)
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        },
        /**
        *@ignore
        */
        offsetParent: function (elem) {

            var offsetParent = elem.offsetParent || document.body;
            while (offsetParent && (!/^(?:body|html)$/i.test(offsetParent.nodeName) && sl.css(offsetParent, "position") === "static")) {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent;
        }

    }
    var _offset = new offset();
    /**
    *设置或者获取元素的位置 相对于页面
    *@memberOf offset
    *@param nodes DOM元素
    *@param value 位置的值{left:,top:} 当为空时候表示获取值
    *@return {top:**,left:**}
    */
    sl.offset = function (nodes, value) {
        nodes = sl.Convert.convertToArray(nodes, null, sl);
        if (!nodes.length) return;
        if (!!value) {
            for (var i = 0; i < nodes.length; i++) {
                _offset.setOffset(nodes[i], value);
            }
        }
        else {
            return _offset.getOffset(nodes[0]);
        }

        return sl.access(nodes, value, null, _offset.getOffset, _offset.setOffset, _offset, null);
    }
    sl.position = function (elem) {
        return _offset.position(elem);
    };
    var scrollFun = {};
    /**
    *设置或者获取元素的scrollLeft
    *@memberOf offset
    @name scrollLeft
    *@param nodes DOM元素
    *@param value 位置的值{left:,top:} 当为空时候表示获取值
    *@return {top:**,left:**}
    */
    sl.each(["scrollLeft", "scrollTop"], function (index, name) {
        scrollFun[name] = function (elem, value) {

            var win = ("scrollTo" in elem && elem.document) ? elem : (elem.nodeType == 9) ? (elem.defaultView || elem.parentWindow) : false;
            if (!elem) {
                return null;
            }

            if (value !== undefined) {
                if (win) {
                    win.scrollTo(
						!index ? value : sl.scrollLeft(win),
						 index ? value : sl.scrollTop(win)
					);
                }
                else {
                    elem[name] = value;
                }
            }
            else {
                return win ? ("pageXOffset" in win) ? win[index ? "pageYOffset" : "pageXOffset"] :
	(win.document.documentElement[name] ||
					win.document.body[name]) :
				elem[name];


            }
        };
        sl[name] = function (nodes, value) {
            nodes = sl.Convert.convertToArray(nodes, null, sl);
            if (!nodes.length) return;
            if (!!value) {
                for (var i = 0; i < nodes.length; i++) {
                    scrollFun[name](nodes[i], value);
                }
            }
            else {
                return scrollFun[name](nodes[0]);

            }
        };

    });
});