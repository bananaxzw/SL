/// <reference path="SL.Core.js" />

/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description  SL框架 DOM操作
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/

SL().create(function (SL) {
    //var xuzhiweiSL = new SL();
    /**
    *@class
    *@name Dom
    */
    var Dom = function () { };
    Dom.prototype = {
        toString: "SL框架DOM模块",
        boxModel: document.compatMode === "CSS1Compat",
        getDocumentElement: function () {

            return document.documentElement || document.body;
        },

        $id: function (id) {
            /// <summary>
            /// ID获取
            /// </summary>
            /// <param name="id"></param>
            /// <returns type=""></returns>
                return document.getElementById(id);
        },
        $className: function (className, sTagName, parent) {
            /// <summary>
            /// 根据class来获取元素
            /// </summary>
            /// <param name="className">类型名称</param>
            /// <param name="sTagName">标签名</param>
            /// <param name="parent">ID或者Node元素</param>
            /// <returns type="Array">满足的元素 数组</returns>
            parent = parent || document;
            if (SL.InstanceOf.String(parent)) {
                parent = this.$id(parent);
            }
            if (!SL.InstanceOf.DOMElement(parent)) {
                throw new Error(this + ':getElementsByClassName方法 参数 parent 对象不存在或传入id参数有错误.');
            }
            sTagName = SL.InstanceOf.String(sTagName) ? sTagName : '*';

            if (parent.getElementsByClassName && sTagName == '*') {//ff3.0+ opera9+ safari3+ chrome
                return SL.Convert.convertToArray(parent.getElementsByClassName(className));
            }
            if (parent.querySelectorAll) { //ie8+ safari3+ opear10+ ff3.1+ chrome
                return SL.Convert.convertToArray(parent.querySelectorAll(sTagName + '[class*="' + className + '"]'));
            }
            //查找所有匹配的标签
            var elements = (sTagName == '*' && parent.all) ? parent.all : parent.getElementsByTagName(sTagName);
            className = className.replace(/\-/g, '\\-');
            return SL.Convert.convertToArray(elements, function (item) {
                return this.test(item.className);
            }, new RegExp('(^|\\s)' + className + '(\\s|$)'));
        },

        $Name: function (sName, sTagName, parent) {
            /// <summary>
            /// 通过名字获取Elements
            /// IE由于只有A, APPLET, BUTTON, FORM, FRAME, IFRAME, IMG, INPUT, OBJECT, MAP, META, PARAM, TEXTAREA ,SELECT才可以通过Name获取
            /// 所以IE就采用过滤的形式了 如果不指定tagname和parent效率很低下
            /// </summary>
            /// <param name="sName">Name属性</param>
            /// <param name="sTagName">标签名称</param>
            /// <param name="parent">id名称或者DOM元素</param>
            /// <returns type=""></returns>
            parent = parent || document;
            if (!(parent = this.$id(parent))) throw new Error(this + ':getElementsByName方法 参数 parent 对象不存在或传入id参数有错误.');
            sTagName = SL.InstanceOf.String(sTagName) ? sTagName : '*';
            if (parent.querySelectorAll) { //ie8+ safari3+ opear10+ ff3.1+
                return SL.Convert.convertToArray(parent.querySelectorAll(sTagName + '[name="' + sName + '"]'));
            }
            else if (+"\v1") {
                if (parent == '[object HTMLDocument]') {
                    if (sTagName == '*') return SL.Convert.convertToArray(parent.getElementsByName(sName));
                    return SL.Convert.convertToArray(parent.getElementsByName(sName), function (item) {
                        return new String(item.tagName).toLowerCase() == new String(this).toLowerCase();
                    }, sTagName);
                }
            }
            var elements = (sTagName == '*' && parent.all) ? parent.all : parent.getElementsByTagName(sTagName);
            return SL.Convert.convertToArray(elements, function (item) {
                return new String(item.tagName).toLowerCase() == new String(this).toLowerCase();
            }, sName);
        },
        prevSibling: function (elem) {
            do {
                elem = elem.previousSibling;
            } while (elem && elem.nodeType != 1);
            return elem;
        },
        nextSibling: function (elem) {
            do {
                elem = elem.nextSibling;
            } while (elem && elem.nodeType != 1);
            return elem;
        },
        firstChild: function (elem) {
            elem = elem.firstChild;
            return elem && elem.nodeType != 1 ?
        this.nextSibling(elem) : elem;
        },
        lastChild: function (elem) {
            elem = elem.lastChild;
            return elem && elem.nodeType != 1 ?
        this.prevSibling(elem) : elem;
        },
        parentNode: function (elem, level) {
            level = level || 1;
            for (var i = 0; i < level; i++)
                if (elem != null) elem = elem.parentNode;
            return elem;
        },
        appendFirstChild: function (newNode, parent) {
            if (!(newNode = ID(newNode)) || !(parent = ID(parent))) throw new Error(ns + ':appendFirstChild方法 参数有错误.');
            if (parent.firstChild) insertBefore(newNode, parent.firstChild);
            else parent.appendChild(newNode);
        },
        insertBefore: function (newNode, tagetNode) {
            if (!(newNode = this.$id(newNode)) || !(tagetNode = this.$id(tagetNode))) throw new Error(this + ':insertBefore方法 参数有错误.');
            tagetNode.parentNode.insertBefore(newNode, tagetNode);
        },

        // 在目标Node之后加入 新的Node.
        insertAfter: function (newNode, targetNode) {
            if (!(newNode = this.$id(newNode)) || !(targetNode = this.$id(targetNode))) throw new Error(ns + ':insertAfter方法 参数有错误.');
            if (targetNode.nextSibling) insertBefore(newNode, targetNode.nextSibling);
            else targetNode.parentNode.appendChild(newNode);
        },
        setNodeStyle: function (node, styleString) {
            if (!(node = this.$id(node)) || !SL.InstanceOf.String(styleString)) throw new Error(ns + ':setNodeStyle 参数 有错误.');
            if (ns.clientBrowser.is_ie) {//IE方法
                node.style.cssText = styleString;
            }
            else node.setAttribute('style', styleString); //w3c方法
        },
        getCurrentStyle: function (node, styleString) {
            /// <summary>
            /// //获取对象 currentStyle属性 参数 styleString 为标准css属性 如background-color(不包含';') 而不是backgroundColor
            /// </summary>
            /// <param name="node">节点</param>
            /// <param name="styleString"></param>
            /// <returns type=""></returns>
            if (!SL.InstanceOf.DOMElement(node) || !SL.InstanceOf.String(styleString)) throw new Error(this + ':getCurrentStyle方法 参数有误.');
            styleString = styleString.toLowerCase();
            var r = '';
            if (document.defaultView) {//w3c方法
                r = new String(node.ownerDocument.defaultView.getComputedStyle(node, null).getPropertyValue(styleString));
                if (r.indexOf('rgb(', 0) >= 0) {
                    var color = r;
                    r = '';
                    color.replace(/\d{1,3}/g, function (m) {
                        m = parseInt(m).toString(16);
                        r += m.length == 2 ? m : m = 0 + m;
                    });
                    return '#' + r;
                }
                else if (/^\d+/.test(r)) return parseInt(r);
            }
            else if (node.currentStyle) {//ie方法
                if (styleString == 'float') {
                    var positionStr = node.currentStyle.position;
                    return (positionStr == "absolute" || positionStr == "relative") ? "none" : node.currentStyle.styleFloat
                }
                if (styleString === "opacity") {
                    return this.getIEOpacity(node);
                }
                var b = false;
                if (/^\d+/.test(r = node.currentStyle[styleString = camelize(styleString)])) {
                    if (!(b = /^font/.test(styleString)) || (b && r.match(/\D+$/)[0] != '%')) {
                        var left = node.style.left, rsLeft = node.runtimeStyle.left;
                        node.runtimeStyle.left = node.currentStyle.left;
                        node.style.left = r || 0;
                        r = node.style.pixelLeft;
                        node.style.left = left;
                        node.runtimeStyle.left = rsLeft;
                        return parseInt(r);
                    }
                    else if (node != document.body) return Math.floor(parseInt(r) * (parseInt(getCurrentStyle(document.body, 'font-size')) || 16) / 100);
                    else return Math.floor(parseInt(r) * 16 / 100);
                }
                if (styleString == 'width')
                    return this.boxModel ? node.clientWidth - getCurrentStyle(node, 'padding-left') - getCurrentStyle(node, 'padding-right') : node.offsetWidth;
                if (styleString == 'height')
                    return this.boxModel ? node.clientHeight - getCurrentStyle(node, 'padding-top') - getCurrentStyle(node, 'padding-bottom') : node.offsetHeight;
            }
            return r;
        },
        getIEOpacity: function (el) {
            var filter;
            if (!!window.XDomainRequest) {
                filter = el.style.filter.match(/progid:DXImageTransform.Microsoft.Alpha\(.?opacity=(.*).?\)/i);
            } else {
                filter = el.style.filter.match(/alpha\(opacity=(.*)\)/i);
            }
            if (filter) {
                var value = parseFloat(filter[1]);
                if (!isNaN(value)) {
                    return value ? value / 100 : 0;
                }
            }
            return 1;
        },
        setNodeAlpha: function (node, opacityValue) {
            /// <summary>
            ///  //设置node对象的 透明度 //此为Xhtml1.0方法
            /// </summary>
            /// <param name="node"></param>
            /// <param name="opacityValue">//opacityValue 必须是0-100的整数</param>
            if (!(node = this.$id(node)) || !SL.InstanceOf.Number(opacityValue)) throw new Error(this + ':setNodeAlpha方法 参数有误.' + setNodeAlpha.caller);
            opacityValue = parseInt(opacityValue);
            opacityValue = opacityValue > 100 ? 100 : opacityValue < 0 ? 0 : opacityValue;
            if (+'\v1') node.style.opacity = opacityValue ? opacityValue / 100 : opacityValue == 0 ? 0 : 9 / 10; //支持 css3 浏览器 的方法
            else node.style.filter = 'Alpha(Opacity=' + (opacityValue ? opacityValue : opacityValue == 0 ? 0 : 90) + ')'; //xhtml1.0+ ie方法 //缺点，覆盖掉filter属性
        },
        //获取目标的透明度.
        getNodeAlpha: function (node) {
            if (!(node = this.$id(node))) throw new Error(this + ':getNodeAlpha方法 参数有误.');
            if (! +'\v1') {
                return this.getIEOpacity(node) * 100;
            }
            if (node.style.opacity) return node.style.opacity * 100;
            return 100;
        },
        //设置node对象的浮动
        setNodeFloat: function (node, floatString) {
            if (!(node = this.$id(node)) || !isString(floatString)) throw new Error(this + ':setNodeFloat方法 参数有误.');
            if (! +'\v1') node.style.styleFloat = floatString;
            else node.style.cssFloat = floatString;
        },
        getNodeFloat: function (node) {
            if (!(node = this.$id(node))) throw new Error(this + ':setNodeFloat方法 参数有误.');
            return getCurrentStyle(node, 'float');
        },
        convertPixelValue: function (el, value) {
            /// <summary>
            /// Author:Dean Edwards
            /// 这个hack是用于将em、pc、pt、cm、in、ex等单位转换为px的，当然不包括百分比。
            /// </summary>
            /// <param name="el"></param>
            /// <param name="value"></param>
            /// <returns type=""></returns>
            var style = el.style, left = style.left, rsLeft = el.runtimeStyle.left;
            el.runtimeStyle.left = el.currentStyle.left;
            style.left = value || 0;
            var px = style.pixelLeft;
            style.left = left;
            el.runtimeStyle.left = rsLeft;
            return px;
        },
        height: function (node) {
            if (!SL.InstanceOf.DOMElement(node)) throw new Error(this + ':height方法 参数有误.');
            return this.getCurrentStyle(node, "height");

        },
        width: function (node) {
            if (!SL.InstanceOf.DOMElement(node)) throw new Error(this + ':width 参数有误.');
            return this.getCurrentStyle(node, "width");
        },
        innerHeight: function (node) {
            return this.height(node) + this.getCurrentStyle(node, "padding-top") + this.getCurrentStyle(node, "padding-bottom");
        },
        outerHeight: function (node) {
            return this.height(node) + this.getCurrentStyle(node, "padding-top") + this.getCurrentStyle(node, "padding-bottom") + this.getCurrentStyle(node, "border-top-width") + this.getCurrentStyle(node, "border-bottom-width");

        },
        innerWidth: function (node) {

            return this.width(node) + this.getCurrentStyle(node, "padding-left") + this.getCurrentStyle(node, "padding-right");
        },
        outerWidth: function (node) {
            return this.width(node) + this.getCurrentStyle(node, "padding-left") + this.getCurrentStyle(node, "padding-right") + this.getCurrentStyle(node, "border-left-width") + this.getCurrentStyle(node, "border-right-width");
        },
        scrollTop: function (node, val) {
            var isTop = (node === window || node === document || node === document.documentElement || node === document.body);

            if (val != undefined) {
                if (isTop) {
                    window.scrollTo(this.scrollLeft(window), val);
                }
                else {
                    node.scrollTop = val;
                }
            }
            else {
                if (isTop) {
                    return self.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                }
                return node.scrollTop;
            }
        },
        scrollLeft: function (node, val) {
            var isTop = (node === window || node === document || node === document.documentElement || node === document.body);
            if (val != undefined) {
                if (isTop) {
                    window.scrollTo(val, this.scrollTop(window));
                }
                else {

                    node.scrollLeft = val;
                }
            }
            else {
                if (isTop) {
                    return self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
                }
                return node.scrollLeft;
            }
        },
        offset: function (oElement) {
            function getNextAncestor(oElement) {
                var actualStyle;
                if (window.getComputedStyle) {
                    actualStyle = getComputedStyle(oElement, null).position;
                } else if (oElement.currentStyle) {
                    actualStyle = oElement.currentStyle.position;
                } else {

                    actualStyle = oElement.style.position;
                }
                if (actualStyle == 'absolute' || actualStyle == 'fixed') {

                    return oElement.offsetParent;
                }
                return oElement.parentNode;
            }
            if (typeof (oElement.offsetParent) != 'undefined') {
                var originalElement = oElement;
                for (var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent) {
                    posX += oElement.offsetLeft;
                    posY += oElement.offsetTop;
                }
                if (!originalElement.parentNode || !originalElement.style || typeof (originalElement.scrollTop) == 'undefined') {

                    return [posX, posY];
                }
                oElement = getNextAncestor(originalElement);
                while (oElement && oElement != document.body && oElement != document.documentElement) {
                    posX -= oElement.scrollLeft;
                    posY -= oElement.scrollTop;
                    oElement = getNextAncestor(oElement);
                }
                return [posX, posY];
            } else {
                return [oElement.x, oElement.y];
            }
        },
        getDocumentSize: function () {
            var myWidth = 0, myHeight = 0;
            if (typeof (window.innerWidth) == 'number') {
                //Non-IE
                myWidth = window.innerWidth;
                myHeight = window.innerHeight;
            } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
                //IE 6+ in 'standards compliant mode'
                myWidth = document.documentElement.clientWidth;
                myHeight = document.documentElement.clientHeight;
            } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
                //IE 4 compatible
                myWidth = document.body.clientWidth;
                myHeight = document.body.clientHeight;
            }
            return { width: myWidth, height: myHeight };
        }

    };
    function camelize(attr) {
        return attr.replace(/\-(\w)/g, function (all, letter) {
            return letter.toUpperCase();
        });
    }
    SL.Dom = SL.Dom || {};
    SL.Dom = new Dom();
});