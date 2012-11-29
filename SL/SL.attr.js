/// <reference path="SL.Core.js" />
/// <reference path="SL.CSS.js" />
/*css还未整理*/


/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description SL框架 dom节点属性操作类
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/

SL().create(function () {
    var uu = new SL();
    function attribute() { }
    attribute.prototype = {
        getAttr: function (ele, name) {
            if (/href|src|width|height|colSpan|rowSpan/.test(name)) {
                return el.getAttribute(name, 2);
            } else if ("style" === name) {
                return ele.style.cssText;
            } else if (name == "tabIndex") {
                var attributeNode = ele.getAttributeNode("tabIndex");
                return attributeNode && attributeNode.specified
						? attributeNode.value
						: ele.nodeName.match(/^(a|area|button|input|object|select|textarea)$/i)
							? 0
							: undefined;
            } else {
                return el.getAttribute(name);
            }
        },
        setAttr: function (ele, name, value) {
            //设置属性
            if (value == null) {
                ele.removeAttribute(name);
            } else {
                if ("style" === name) {
                    ele.style.cssText ? ele.style.cssText = value : ele.setAttribute("style", value);
                } else {
                    ele.setAttribute(name, value);
                }
            }

        },
        addClass: function (ele, value) {
            if (value && typeof value === "string") {
                //分割
                var classNames = (value || "").split(/\s+/);
                if (ele.nodeType === 1) {
                    if (!ele.className && classNames.length === 1) {
                        ele.className = value;

                    } else {
                        var className = " " + ele.className + " ";
                        for (var c = 0, cl = classNames.length; c < cl; c++) {
                            if (className.indexOf(" " + classNames[c] + " ") < 0) {
                                ele.className += " " + classNames[c];
                            }
                        }
                    }
                }
            }

        },
        hasClass: function (ele, value) {
            var re = new RegExp('(\\s|^)' + value + '(\\s|$)');
            return re.test(el.className.relace(/[\n\t]/, " "));

        },
        removeClass: function (ele, value) {
            if ((value && typeof value === "string") || value === undefined) {
                var classNames = (value || "").split(/\s+/);

                if (ele.nodeType === 1 && ele.className) {
                    if (value) {
                        var className = (" " + ele.className + " ").replace(/[\n\t]/g, " ");
                        for (var c = 0, cl = classNames.length; c < cl; c++) {
                            className = className.replace(" " + classNames[c] + " ", " ");
                        }
                        ele.className = className.substring(1, className.length - 1);

                    } else {
                        ele.className = "";
                    }
                }
            }
        },
        toggleClass: function (ele, value) {
            if (this.hasClass(ele, value)) {
                this.removeClass(ele, value);
            }else {
                this.addClass(ele, value);
            }
        },
        //select-multiple 还未考虑
        getValue: function (ele) {
            if (uu.InstanceOf.DOMElement(ele) && "value" in ele) {
                return ele.value;
            }
            return "";
        },
        setValue: function (ele, value) {
            if (uu.InstanceOf.DOMElement(ele) && "value" in ele) {
                ele.value = value;
            }
        }
    }
    uu.attr = new attribute();
});