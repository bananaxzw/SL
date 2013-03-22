/// <reference path="SL.Core.js" />
/// <reference path="SL.CSS.js" />
/// <reference path="SL.support.js" />
/// <reference path="SL.Array.js" />

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

sl.create(function () {
    var valHooks = {
        option: {
            get: function (elem) {
                //看看有没有设置value ie没设置value默认会""
                var val = elem.attributes.value;
                return !val || val.specified ? elem.value : elem.text;
            }
        },
        select: {
            get: function (elem) {
                var value, i, max, option,
					index = elem.selectedIndex,
					values = [],
					options = elem.options,
					one = elem.type === "select-one";

                if (index < 0) {
                    return null;
                }
                i = one ? index : 0;
                max = one ? index + 1 : options.length;
                for (; i < max; i++) {
                    option = options[i];

                    // 某些浏览器在select设置disabled时候选项也disbled 要让他们不disabled
                    if (option.selected && (sl.Support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !/optgroup/i.test(option.parentNode.nodeName))) {
                        value = sl.attr.getValue(option);
                        if (one) {
                            return value;
                        }
                        values.push(value);
                    }
                }

                //  select.val() broken in IE after form.reset()
                if (one && !values.length && options.length) {
                    return sl.attr.getValue(options[index]);
                }

                return values;
            },

            set: function (elem, value) {
                var values = sl.Convert.convertToArray(value);

                for (var i = 0, length = elem.options.length; i < length; i++) {
                    var opt = elem.options[i];
                    if (sl.Array.indexOf(values, sl.attr.getValue(opt)) > -1) {
                        opt.selected = true;
                    }
                }

                if (!values.length) {
                    elem.selectedIndex = -1;
                }
                return values;
            }
        }
    };
    // Radios and checkboxes getter/setter
    if (!sl.Support.checkOn) {
        sl.each(["radio", "checkbox"], function (i, d) {
            valHooks[d] = {
                get: function (elem) {
                    //某些浏览器 webkit没设置radio和checkbox的值时候value为空 而ie和FF为on 统一为on
                    return elem.getAttribute("value") === null ? "on" : elem.value;
                },
                set: function (elem, value) {
                    var values = sl.Convert.convertToArray(value);

                    return (elem.checked = sl.Array.indexOf(values, sl.attr.getValue(elem)) >= 0);

                }

            };
        });
    }

    /**
    * @description DOM属性操作
    * @class DOM属性操作
    * @name attribute
    */
    function attribute() { }
    attribute.prototype = {
        /**
        *获取元素属性
        *@param  ele DOM元素
        *@param  name 属性名
        *@return 属性值
        */
        getAttr: function (ele, name) {
            if (/href|src|width|height|colSpan|rowSpan/.test(name)) {
                /**IE的getAttribute支持第二个参数，可以为 0,1,2,4
                0 是默认；1 区分属性的大小写；2取出源代码中的原字符串值(注，IE67对动态创建的节点没效)。
                IE 在取 href 的时候默认拿出来的是绝对路径，加参数2得到我们所需要的相对路径。*/
                return ele.getAttribute(name, 2);
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
                return ele.getAttribute(name);
            }
        },
        /**
        *设置元素属性
        *@param  ele DOM元素
        *@param  name 属性名
        *@param  value 属性值
        */
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
        /**
        *移除元素属性
        *@param  ele DOM元素
        *@param  name 属性名
        */
        removeAttr: function (ele, name) {
            this.setAttr(ele, name, "");
            if (ele.nodeType === 1) {
                if (ele.removeAttribute) {
                    ele.removeAttribute(name);
                }
                else if (ele.attributes && ele.attributes.removeNamedItem) {
                    ele.attributes.removeNamedItem(name);
                }
            }

        },
        /**
        *添加元素CLASS属性
        *@param  ele DOM元素
        *@param  value CLASS名字
        */
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
        /**
        *是否具有某CLASS
        *@param  ele DOM元素
        *@param  value CLASS名字
        *@return boolean
        */
        hasClass: function (ele, value) {
            var re = new RegExp('(\\s|^)' + value + '(\\s|$)');
            return re.test(ele.className.replace(/[\n\t]/, " "));

        },
        /**
        *移除某个CLASS
        *@param  ele DOM元素
        *@param  value CLASS名字
        */
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
        /**
        *触发和移除某个CLASS
        *@param  ele DOM元素
        *@param  value CLASS名字
        */
        toggleClass: function (ele, value) {
            if (this.hasClass(ele, value)) {
                this.removeClass(ele, value);
            } else {
                this.addClass(ele, value);
            }
        },
        /**
        *获取元素ele的Value值
        *@param  ele DOM元素
        *@return value值
        */
        getValue: function (ele) {
            var hooks = valHooks[ele.type] || valHooks[ele.nodeName.toLowerCase()];
            if (hooks && "get" in hooks && (ret = hooks.get(ele)) !== undefined) {
                return ret;
            }
            if (sl.InstanceOf.DOMElement(ele) && "value" in ele) {
                return ele.value;
            }
            return "";
        },
        /**
        *设置元素value值
        *@param  ele DOM元素
        *@param  value value值
        */
        setValue: function (ele, value) {
            if (ele.nodeType != 1) {
                return;
            }
            var hooks = valHooks[ele.type] || valHooks[ele.nodeName.toLowerCase()];
            if (!hooks || !("set" in hooks) || hooks.set(ele, value) === undefined) {
                if ("value" in ele) {
                    ele.value = value;
                }
            }

        }
    }
    sl.attr = new attribute();
});