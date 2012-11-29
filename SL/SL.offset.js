/// <reference path="SL.Core.js" />
/// <reference path="SL.CSS.js" />
/// <reference path="SL.support.js" />
function offset() {
    this.init = function () {
        var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat(jQuery.curCSS(body, "marginTop", true)) || 0,
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
    }
}

offset.prototype = {
    bodyOffset: function (body) {
        var top = body.offsetTop, left = body.offsetLeft;

        this.init();

        if (this.doesNotIncludeMarginInBodyOffset) {
            top += parseFloat(sl.css(body, "marginTop")) || 0;
            left += parseFloat(sl.css(body, "marginLeft", true)) || 0;
        }

        return { top: top, left: left };
    },
    getOffset: function (node) {
        if ("getBoundingClientRect" in document.documentElement) {

            if (!node || !node.ownerDocument) {
                return null;
            }
            if (node === node.ownerDocument.body) {
                return this.bodyOffset(node);
            }
            var box = node.getBoundingClientRect(), doc = node.ownerDocument, body = doc.body, docElem = doc.documentElement,
			clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
			top = box.top + (self.pageYOffset || sl.Support.boxModel && docElem.scrollTop || body.scrollTop) - clientTop,
			left = box.left + (self.pageXOffset || sl.Support.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;

            return { top: top, left: left };

        }
    },
    setOffset: function (node) {

        var computedStyle = document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(node, null) : node.currentStyle;
        if (/static/.test(css(node, "position"))) {
            css(node, "position", "relative");
        }
        var curOffset = this.getOffset(node);
        curTop = parseInt(computedStyle.left, 10) || 0,
		curLeft = parseInt(computedStyle.left, 10) || 0;

        if (sl.InstanceOf.Function(options)) {
            options = options.call(node, i, curOffset);
        }

        var props = {
            top: (options.top - curOffset.top) + curTop,
            left: (options.left - curOffset.left) + curLeft
        };
        css(node, props);
    },

    position: function (elem) {

        var offsetParent = this.offsetParent(elem), offset = this.getOffset(elem);
        parentOffset = /^(?:body|html)$/i.test(offsetParent[0].nodeName) ? { top: 0, left: 0} : this.getOffset(offsetParent);

        offset.top -= parseFloat(sl.css(elem, "marginTop")) || 0;
        offset.left -= parseFloat(sl.css(elem, "marginLeft")) || 0;

        parentOffset.top += parseFloat(sl.css(offsetParent[0], "borderTopWidth")) || 0;
        parentOffset.left += parseFloat(sl.css(offsetParent[0], "borderLeftWidth")) || 0;

        // (top-parentTop-parentBodrder-maigin)
        return {
            top: offset.top - parentOffset.top,
            left: offset.left - parentOffset.left
        };
    },

    offsetParent: function (elem) {

        var offsetParent = elem.offsetParent || document.body;
        while (offsetParent && (!/^(?:body|html)$/i.test(offsetParent.nodeName) && sl.css(offsetParent, "position") === "static")) {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent;
    }

}

var _offset=new offset();
sl.offset = function (nodes, value) {

    nodes = sl.Convert.convertToArray(nodes, null, sl);

    return sl.access(nodes, "offset", value, _offset.getOffset, _offset.setOffset, null, null);
}
