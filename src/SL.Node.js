/// <reference path="SL.Core.js" />
/// <reference path="SL.Selector.js" />
/// <reference path="SL.Operation.js" />
/// <reference path="SL.Dom.js" />
/// <reference path="SL.Array.js" />
/// <reference path="SL.attr.js" />
/// <reference path="SL.EventEX.js" />
/// <reference path="SL.Data.js" />
/// <reference path="SL.attr.js" />
/// <reference path="SL.lang.js" />
/// <reference path="SL.offset.js" />

(function () {
    var rCRLF = /\r?\n/g,
     rselectTextarea = /^(?:select|textarea)/i,
    	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;

    var _$ = window.$;
    //链式操作
    /**
    * @description 链式操作
    * @class
    * @name chain
    */
    function chain(selector, context) {
        // (""), (null), or (undefined)
        if (!selector) {
            return this;
        }
        // (DOMElement)
        if (selector.nodeType || sl.InstanceOf.Window(selector)) {
            //            this.context = selector;
            this.elements = [selector];
            return this;
        }
        if (context) {
            if (this.isChain(context)) {
                this.elements = innerFind(selector, context.elements);
            } else {
                if (sl.InstanceOf.DOMElement(context)) {
                    this.elements = sl.select(selector, context);
                } else if (sl.InstanceOf.DOMNodeList(context)) {
                    this.elements = innerFind(selector, context);
                } else {
                    this.elements = [];
                }
            }
        }
        else {
            if (typeof selector === "string") {
                //处理html
                if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
                    this.elements = sl.Convert.convertToArray(sl.Dom.parseHtml(selector).childNodes, "", this);

                } else {
                    //正常的选择器
                    this.elements = sl.select(selector);
                }
            } else if (sl.InstanceOf.DOMElement(selector)) {
                this.elements = [selector];
            } else if (sl.InstanceOf.DOMNodeList(selector)) {
                this.elements = sl.Convert.convertToArray(selector);
            } else if (this.isChain(selector)) {
                this.elements = [];
                for (var i = 0; i < selector.elements.length; i++) {
                    this.elements.push(selector.elements[i]);
                }
            }
        }
        this.length = this.elements.length;
    };
    chain.prototype = {
        //暂存dom元素
        elements: [],
        /**
        * @ignore
        */
        name: "SL.CHAIN",
        /**
        * @ignore
        */
        newChain: function (selector, context) {
            var _chain = new chain(selector, context);
            _chain.previousChain = this;
            return _chain;
        },
        /**
        * @ignore
        */
        isChain: function (o) {
            return o != null && sl.InstanceOf.Object(o) && o.name == "SL.CHAIN";
        },
        is: function (selector) {

            return !!selector && sl.selector.matches(selector, this.elements).length > 0;
        },
        toggle: function () {
            return this.each(function () {
                sl.toggle(this);
            });
        },
        index: function (elem) {
            if (this.isChain(elem)) {
                elem = elem[0];
            }
            return sl.Array.indexOf(this.elements, elem);
        },
        eq: function (i) {
            i = +i;
            return i === -1 ?
			this.slice(i) :
			this.slice(i, i + 1);
        },
        get: function (num) {
            return num == null ?
			Array.prototype.slice.call(this.elements) :
			(num < 0 ? this.elements[this.length + num] : this.elements[num]);
        },
        first: function () {
            return this.eq(0);
        },
        last: function () {
            return this.eq(-1);
        },
        slice: function () {
            return this.pushStack(Array.prototype.slice.apply(this.elements, arguments));
        },
        map: function (callback) {
            return this.pushStack(sl.map(this.elements, function (elem, i) {
                return callback.call(elem, i, elem);
            }));
        },
        each: function (callback, args) {
            sl.each(this.elements, callback, args);
            return this;
        },
        text: function (text) {
            if (typeof text !== "object" && text !== undefined) {
                return this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(text));
            }
            return sl.Dom.text(this.elements[0]);
        },
        html: function (html) {
            if (html !== undefined) {
                return this.each(function () {
                    sl.Dom.html(this, html);
                });
            } else {
                return sl.Dom.html(this.elements[0]);

            }
        },
        val: function (value) {
            if (value !== undefined) {
                return this.each(function () {
                    sl.attr.setValue(this, value);
                })
            }
            else {
                return sl.attr.getValue(this.elements[0]);
            }
        },
        empty: function () {
            return this.each(function () {
                sl.Dom.empty(this);
            });
        },
        remove: function () {
            this.removeData();
            this.unbind();
            return this.each(function () {
                if (this.parentNode)
                    this.parentNode.removeChild(this);
            });
        },
        pushStack: function (selector, context) {
            return this.newChain(selector, context);
        },
        find: function (selector) {
            return this.pushStack(selector, this.elements);
        },
        filter: function () {
            if (sl.InstanceOf.String(arguments[0])) {
                return this.find(arguments);
            }
            if (sl.InstanceOf.Function(arguments[0])) {
                var callFun = arguments[0];
                return this.pushStack(sl.grep(this.elements, function (elem, i) {
                    return callFun.call(elem, i, elem);
                }));

            }
            return null;
        },
        /**
        *对dom进行统一操作
        *@param {mixed} args 要进行操作的字符串或者dom元素
        *@param {Boolean} table 是否要对table进行特殊处理  ie6 ie7附加tr必须在tbody
        *@param {Function} fn 执行操作的函数
        */
        domManipulation: function (args, table, fn) {
            if (node = this.elements[0]) {
                var fragment = (node.ownerDocument || node).createDocumentFragment(), scripts = [];
                if (this.isChain(args[0])) args = args[0].elements; //sl元素
                sl.Dom.transactionDom(args, (node.ownerDocument || node), fragment, scripts);
                var first = fragment.firstChild,
				extra = this.elements.length > 1 ? fragment.cloneNode(true) : fragment;

                if (first) {
                    for (var i = 0, l = this.elements.length; i < l; i++) {
                        fn.call(sl.Dom._getDomRoot(this.elements[i], first), i > 0 ? extra.cloneNode(true) : fragment);
                    }
                }
            }
            return this;
        },
        clone: function () {
            var othis = this;
            var ret = this.map(function () {
                var n = sl.Dom.clone(this);
                sl.attr.removeAttr(n, sl.expando); //移除data属性
                return n;
            })
            return ret;
        },
        /**
        *在每个匹配的元素之前插入内容
        */
        before: function () {
            return this.domManipulation(arguments, false, function (fragment) {
                sl.Dom.insertBefore(fragment, this);
            })
        },
        /**
        *把所有匹配的元素插入到另一个、指定的元素元素集合的前面
        */
        insertBefore: function () {
            var args = arguments;
            var _this = this;
            return this.each(function () {
                for (var i = 0, length = args.length; i < length; i++)
                    _this.newChain(args[i])["before"](this);
            });
        },
        /**
        *在每个匹配的元素之后插入内容
        */
        after: function () {
            return this.domManipulation(arguments, false, function (fragment) {
                sl.Dom.insertAfter(fragment, this);
            })
        },
        /**
        *把所有匹配的元素插入到另一个、指定的元素元素集合的后面
        */
        insertAfter: function () {
            var args = arguments;
            var _this = this;
            return this.each(function () {
                for (var i = 0, length = args.length; i < length; i++)
                    _this.newChain(args[i])["after"](this);
            });

        },
        /**
        *向每个匹配的元素内部追加内容
        */
        append: function () {
            return this.domManipulation(arguments, true, function (fragment) {
                sl.Dom.append(fragment, this);
            })
        },
        /**
        *把所有匹配的元素追加到另一个、指定的元素元素集合中
        */
        appendTo: function () {
            var args = arguments;
            var _this = this;
            return this.each(function () {
                for (var i = 0, length = args.length; i < length; i++)
                    _this.newChain(args[i])["append"](this);
            });
        },
        /**
        *向每个匹配的元素内部前置内容
        */
        prepend: function () {
            return this.domManipulation(arguments, true, function (fragment) {
                sl.Dom.appendFirstChild(fragment, this);
            })
        },
        /**
        *把所有匹配的元素前置到另一个、指定的元素元素集合中
        */
        prependTo: function () {
            var args = arguments;
            var _this = this;
            return this.each(function () {
                for (var i = 0, length = args.length; i < length; i++)
                    _this.newChain(args[i])["prepend"](this);
            });
        },
        /**
        *将所有匹配的元素用单个元素包裹起来
        */
        wrapAll: function (html) {
            if (this.elements[0]) {

                var wrap = this.newChain(html).eq(0).clone();

                if (this.elements[0].parentNode) {
                    wrap.insertBefore(this.elements[0]);
                }
                wrap.map(function () {
                    var elem = this;

                    while (elem.firstChild && elem.firstChild.nodeType === 1) {
                        elem = elem.firstChild;
                    }
                    return elem;
                }).append(this.elements);
            }

            return this;
        },
        /**
        *将每一个匹配的元素的子内容(包括文本节点)用一个HTML结构包裹起来
        */
        wrapInner: function (html) {
            var _this = this;
            return this.each(function () {
                var self = _this.newChain(this), contents = self.contents();

                if (contents.length) {
                    contents.wrapAll(html);
                } else {
                    self.append(html);
                }
            });
        },
        /**
        *把所有匹配的元素用其他元素的结构化标记包裹起来
        */
        wrap: function (html) {
            var _this = this;
            return this.each(function () {
                _this.newChain(this).wrapAll(html);
            });
        },
        attr: function (key, value) {
            return sl.access(this.elements, key, value, sl.attr.getAttr, sl.attr.setAttr, null, this);
        },
        removeAttr: function (name) {
            return this.each(function () {
                sl.attr.removeAttr(this, name);
            });
        },
        /**
        *为每个匹配的元素添加指定的类名
        */
        addClass: function (classNames) {
            return this.each(function () {
                sl.attr.addClass(this, classNames);
            });
        },
        /**
        *从所有匹配的元素中删除全部或者指定的类。
        */
        removeClass: function (classNames) {
            return this.each(function () {
                sl.attr.removeClass(this, classNames);
            });
        },
        /**
        *检查当前的元素是否含有某个特定的类，如果有，则返回true
        */
        hasClass: function (className) {
            var has = false;
            sl.each(this.elements, function (i, d) {
                if (sl.attr.hasClass(d, className)) {
                    has = true;
                    return false;
                }
            });
            return has;
        },
        /**
        *如果存在（不存在）就删除（添加）一个类
        */
        toggleClass: function (className) {
            return this.each(function () {
                sl.attr.toggleClass(this, className);
            });
        },
        css: function (style, value) {
            if (!value && !sl.InstanceOf.PlainObject(style)) {
                return sl.css(this.elements, style, value);
            }
            else {
                sl.css(this.elements, style, value);
                return this;
            }

        },
        hide: function (isPosition) {
            return this.each(function () {
                if (isPosition) {
                    this.style.visibility = "hidden";
                }
                else {
                    this.style.display = "none";
                }
            });
        },
        show: function () {
            return this.each(function () {
                this.style.display = "";
                this.style.visibility = "visible";
            });
        },
        bind: function (event, data, fn) {
            if (sl.InstanceOf.Function(data)) {
                fn = data;
                data = undefined;
            }
            return this.each(function () {
                sl.Event.addEvent(this, event, fn, data);
            });
        },
        unbind: function (event, fn) {
            return this.each(function () {
                sl.Event.removeEvent(this, event, fn);
            });
        },
        trigger: function (event, data) {
            return this.each(function () {
                sl.Event.triggerEvent(event, data, this);
            })
        },
        hover: function (overFn, outFn) {
            return this.each(function () {
                sl.Event.hover(this, overFn, outFn);
            });
        },
        data: function (key, value) {
            if (value !== undefined) {
                return this.each(function () {
                    sl.data(this, key, value);
                });
            }
            else {
                return sl.data(this.elements[0], key);
            }
        },
        removeData: function (key) {
            return this.each(function () {
                sl.removeData(this, key);
            });
        },
        /**
        *获取匹配元素在当前视口的相对偏移
        *@memberOf chain.prototype
        *@function
        *@name offset
        */
        offset: function () {
            if (this.elements.length) {
                return sl.offset(this.elements, arguments[0]);
            }

        },
        getVisibleRect: function (addBoarder) {
            /// <summary>
            /// 获取可视区域
            /// </summary>
            /// <param name="addBoarder">是否包括边框</param>

            if (!this.elements.length) return { top: 0, bottom: 0, left: 0, right: 0 };

            var elem = this.elements[0], isTop = sl.InstanceOf.BodyOrHtmlOrWindow(this.elements[0]);
            var offset = sl.offset(this.elements[0]), top = offset.top, left = offset.left, right, bottom;
            var borderTopWidth = parseFloat(this.css("borderTopWidth")), borderRightWidth = parseFloat(this.css("borderRightWidth")),
            borderLeftWidth = parseFloat(this.css("borderLeftWidth")), borderBottomWidth = parseFloat(this.css("borderBottomWidth")),
            innerHeight = parseFloat(this.innerHeight()), innerWidth = parseFloat(this.innerWidth());
            if (isTop) {
                innerHeight = parseFloat(document.documentElement["clientHeight"] || document.body["clientHeight"]);
                innerWidth = parseFloat(document.documentElement["clientWidth"] || document.body["clientWidth"]);
                top += $(document).scrollTop(), left += $(document).scrollLeft();
            }
            if (!addBoarder) {
                top = top + borderTopWidth, bottom = top + innerHeight, left = left + borderLeftWidth, right = left + innerWidth;
            }
            else {
                bottom = top + borderTopWidth + innerHeight + borderBottomWidth, right = left + borderLeftWidth + innerWidth + borderRightWidth;
            }

            return { top: top, bottom: bottom, left: left, right: right };
        },
        /**
        *获取匹配元素相对父元素的偏移
        *@memberOf chain.prototype
        *@function
        *@name position
        */
        position: function () {

            if (!this.elements[0]) {
                return null;
            }
            return sl.position(this.elements[0]);
        },
        serialize: function () {
            return sl.param(this.serializeArray());
        },
        serializeArray: function () {
            var _this = this;
            var newChain = this.map(function () {
                return this.elements ? sl.Convert.convertToArray(this.elements) : _this.elements;
            }).filter(function () {
                return this.name && !this.disabled &&
				(this.checked || rselectTextarea.test(this.nodeName) ||
					rinput.test(this.type));
            });

            return sl.map(newChain.elements, function (elem, index) {
                var val = sl.attr.getValue(elem);

                return val == null ?
				null :
				sl.InstanceOf.Array(val) ?
					sl.map(val, function (val, i) {
					    return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
					}) :
					{ name: elem.name, value: val.replace(rCRLF, "\r\n") };
            });
        }
    };
    /**
    *父节点
    *@memberOf chain.prototype
    *@function
    *@name parent
    */

    /**
    *所有祖先节点
    *@memberOf chain.prototype
    *@function
    *@name parents
    */

    /**
    *取得一个包含匹配的元素集合中每一个元素紧邻的后面同辈元素
    *@memberOf chain.prototype
    *@function
    *@name next
    */

    /**
    *取得一个包含匹配的元素集合中每一个元素紧邻的前一个同辈元素
    *@memberOf chain.prototype
    *@function
    *@name prev
    */

    /**
    *查找当前元素之后所有的同辈元素
    *@memberOf chain.prototype
    *@function
    *@name nextAll
    */

    /**
    *查找当前元素之前所有的同辈元素
    *@memberOf chain.prototype
    *@function
    *@name prevAll
    */

    /**
    *取得一个包含匹配的元素集合中每一个元素的所有唯一同辈元素的元素集合
    *@memberOf chain.prototype
    *@function
    *@name siblings
    */

    /**
    *取得一个包含匹配的元素集合中每一个元素的所有子元素的元素集合
    *@memberOf chain.prototype
    *@function
    *@name children
    */

    /**
    *查找匹配元素内部所有的子节点（包括文本节点）
    *@memberOf chain.prototype
    *@function
    *@name contents
    */
    sl.each({
        parent: function (elem) { return elem.parentNode; },
        parents: function (elem) { return sl.Dom.dir(elem, "parentNode"); },
        next: function (elem) { return sl.Dom.nthLevel(elem, 2, "nextSibling"); },
        prev: function (elem) { return sl.Dom.nthLevel(elem, 2, "previousSibling"); },
        nextAll: function (elem) { return sl.Dom.dir(elem, "nextSibling"); },
        prevAll: function (elem) { return sl.Dom.dir(elem, "previousSibling"); },
        siblings: function (elem) { return sl.Dom.siblings(elem); },
        children: function (elem) { return elem.childNodes; },
        contents: function (elem) { return sl.Dom.contents(elem); }
    }, function (name, fn) {
        chain.prototype[name] = function (selector) {
            var ret = sl.map(this.elements, fn);

            if (selector && typeof selector == "string")
                ret = sl.selector.multiFilter(selector, ret);

            return this.pushStack(sl.Array.deleteRepeater(ret));
        };
    });
    /**
    *取得第一个匹配元素当前计算的宽度值
    *@memberOf chain.prototype
    *@function
    *@name width
    */
    /**
    *取得第一个匹配元素当前计算的高度值
    *@memberOf chain.prototype
    *@function
    *@name height
    */
    /**
    *获取第一个匹配元素内部区域宽度（包括补白、不包括边框）
    *@memberOf chain.prototype
    *@function
    *@name innerWidth
    */
    /*
    *获取第一个匹配元素内部区域高度（包括补白、不包括边框）
    *@memberOf chain.prototype
    *@function
    *@name innerHeight
    */
    /**
    *获取第一个匹配元素外部宽度（默认包括补白和边框）
    *@memberOf chain.prototype
    *@function
    *@name outerWidth
    */
    /**
    *获取第一个匹配元素外部高度（默认包括补白和边框）
    *@memberOf chain.prototype
    *@function
    *@name outerHeight
    */
    sl.each(["width", "height", "innerWidth", "innerHeight", "outerWidth", "outerHeight"], function (index, name) {
        chain.prototype[name] = function (value) {
            var val = sl.css(this.elements, name, value);
            if (value) {
                return this;
            }
            return val;


        };
    });
    sl.each(("blur,focus,load,resize,scroll,unload,click,dblclick," +
	"mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave," +
	"change,select,submit,keydown,keypress,keyup,error").split(","), function (i, name) {
	    chain.prototype[name] = function (fn) {
	        return fn && this.bind(name, fn);
	    };
	});
    /**
    *获取匹配元素相对滚动条左侧的偏移
    *@memberOf chain.prototype
    *@function
    *@name scrollLeft
    */
    /**
    *获取匹配元素相对滚动条顶部的偏移
    *@memberOf chain.prototype
    *@function
    *@name scrollTop
    */
    sl.each(["scrollLeft", "scrollTop"], function (index, name) {
        chain.prototype[name] = function (value) {
            return sl[name](this.elements, value);
        };
    });
    function innerFind(selector, nodes) {
        //element
        var resultNodes = [], length;
        for (i = 0, l = nodes.length; i < l; i++) {
            length = resultNodes.length;
            sl.select(selector, nodes[i], resultNodes);

            if (i > 0) {
                // 去除重复
                for (n = length; n < resultNodes.length; n++) {
                    for (r = 0; r < length; r++) {
                        if (resultNodes[r] === resultNodes[n]) {
                            resultNodes.splice(n--, 1);
                            break;
                        }
                    }
                }
            }
        }
        return resultNodes;
    };
    window.slChain = window.$ = function (selector, context) {
        return new chain(selector, context);
    };
    slChain.noConflict = function () {
        if (window.$ === slChain) {
            window.$ = _$;
        }
        return slChain;
    };
})();