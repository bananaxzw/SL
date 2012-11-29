/// <reference path="SL.Core.js" />
/// <reference path="SL.Selector.js" />
/// <reference path="SL.Operation.js" />
/// <reference path="SL.Dom.js" />
/// <reference path="SL.Array.js" />
/// <reference path="SL.attr.js" />
/// <reference path="SL.Event.js" />
/// <reference path="SL.Data.js" />
/// <reference path="SL.attr.js" />

(function () {
    var uu = new SL();
    //链式操作
    function chain(selector, context) {
        // (""), (null), or (undefined)
        if (!selector) {
            return this;
        }
        // (DOMElement)
        if (selector.nodeType) {
            //            this.context = selector;
            this.elements = [selector];
            return this;
        }
        if (context) {
            if (this.isChain(context)) {
                this.elements = innerFind(selector, context.elements);
            } else {
                if (uu.InstanceOf.DOMElement(context)) {
                    this.elements = uu.select(selector, context);
                } else if (uu.InstanceOf.DOMNodeList(context)) {
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
                    this.elements = uu.Convert.convertToArray(uu.Dom.parseHtml(selector).childNodes, "", this);

                } else {
                    //正常的选择器
                    this.elements = uu.select(selector);
                }
            } else if (uu.InstanceOf.DOMElement(selector)) {
                this.elements = [selector];
            } else if (uu.InstanceOf.DOMNodeList(selector)) {
                this.elements = uu.Convert.convertToArray(selector);
            } else if (this.isChain(selector)) {
                this.elements = [];
                for (var i = 0; i < selector.elements.length; i++) {
                    this.elements.push(selector.elements[i]);
                }
            }
        }
        this.length = this.elements.length;
    }
    chain.prototype = {
        //暂存dom元素
        elements: [],
        name: "SL.CHAIN",
        newChain: function (selector) {
            var _chain = new chain(selector);
            _chain.previousChain = this;
            return _chain;
        },
        isChain: function (o) {
            return o != null && uu.InstanceOf.Object(o) && o.name == "SL.CHAIN";
        },

        eq: function (i) {
            i = +i;
            return i === -1 ?
			this.slice(i) :
			this.slice(i, i + 1);
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
            return this.pushStack(uu.map(this.elements, function (elem, i) {
                return callback.call(elem, i, elem);
            }));
        },
        each: function (callback, args) {
            uu.each(this.elements, callback, args);
            return this;
        },
        text: function (text) {
            if (typeof text !== "object" && text !== undefined) {
                return this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(text));
            }
            return uu.Dom.text(this.elements[0]);
        },
        html: function (html) {
            return this.each(function () {
                uu.Dom.html(this, html);
            });
        },
        val: function (value) {
            if (value) {
                return this.each(function () {
                    uu.attr.setValue(this, value);
                })
            }
            else {
                return uu.attr.getValue(this.elements[0]);
            }
        },
        empty: function () {
            return this.each(function () {
                uu.Dom.empty(this);
            });
        },
        remove: function () {
            return this.each(function () {
                if (this.parentNode)
                    this.parentNode.removeChild(this);
            });
        },
        pushStack: function (selector) {
            return this.newChain(selector);
        },
        /**
        *对dom进行统一操作
        *@param {mixed} args 要进行操作的字符串或者dom元素
        *@param {Boolean} table 是否要对table进行特殊处理  ie6 ie7附加tr必须在tbody
        *@param {Function} fn 执行操作的函数
        */
        domManipulation: function (args, table, fn) {
            if (node = this.elements[0]) {
                var fragment = (node.ownerDocument || node).createDocumentFragment();
                var scripts = [];
                uu.Dom.transactionDom(args, (node.ownerDocument || node), fragment, scripts);
                var first = fragment.firstChild,
				extra = this.elements.length > 1 ? fragment.cloneNode(true) : fragment;

                if (first) {
                    for (var i = 0, l = this.elements.length; i < l; i++) {
                        fn.call(uu.Dom._getDomRoot(this.elements[i], first), i > 0 ? extra.cloneNode(true) : fragment);
                    }
                }
            }
            return this;
        },
        clone: function () {
            var ret = this.map(function () {
                return uu.Dom.clone(this);
            })
            return ret;
        },
        before: function () {
            return this.domManipulation(arguments, false, function (fragment) {
                uu.Dom.insertBefore(fragment, this);
            })
        },

        insertBefore: function () {
            var args = arguments;
            var _this = this;
            return this.each(function () {
                for (var i = 0, length = args.length; i < length; i++)
                    _this.newChain(args[i])["before"](this);
            });
        },
        after: function () {
            return this.domManipulation(arguments, false, function (fragment) {
                uu.Dom.insertAfter(fragment, this);
            })
        },
        insertAfter: function () {
            var args = arguments;
            var _this = this;
            return this.each(function () {
                for (var i = 0, length = args.length; i < length; i++)
                    _this.newChain(args[i])["after"](this);
            });

        },
        append: function () {
            return this.domManipulation(arguments, true, function (fragment) {
                uu.Dom.append(fragment, this);
            })
        },
        appendTo: function () {
            var args = arguments;
            var _this = this;
            return this.each(function () {
                for (var i = 0, length = args.length; i < length; i++)
                    _this.newChain(args[i])["append"](this);
            });
        },
        preAppend: function () {
            return this.domManipulation(arguments, true, function (fragment) {
                uu.Dom.appendFirstChild(fragment, this);
            })
        },
        preAppendTo: function () {
            var args = arguments;
            var _this = this;
            return this.each(function () {
                for (var i = 0, length = args.length; i < length; i++)
                    _this.newChain(args[i])["preAppend"](this);
            });
        },
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
        wrap: function (html) {
            var _this = this;
            return this.each(function () {
                _this.newChain(this).wrapAll(html);
            });
        },
        attr: function (key, value) {
            return uu.access(this.elements, key, value, uu.attr.getAttr, uu.attr.setAttr, null, this);
        },

        removeAttribute: function (name) {
            return this.each(function () {
                this.removeAtribute(name);
            });
        },
        addClass: function (classNames) {
            return this.each(function () {
                uu.attr.addClass(this, classNames);
            });
        },
        removeClass: function (classNames) {
            return this.each(function () {
                uu.attr.removeClass(this, classNames);
            });
        },
        toggleClass: function (className) {
            return this.each(function () {
                uu.attr.toggleClass(this, className);
            });
        },
        hide: function () {
            return this.each(function () {
                this.style.display = "none";
            });
        },
        show: function () {
            return this.each(function () {
                this.style.display = "";
            });
        },
        bind: function (event, fn, data) {
            return this.each(function () {
                uu.Event.addEvent(this, event, fn, data);
            });
        },
        unbind: function (event, fn) {
            return this.each(function () {
                uu.Event.removeEvent(this, event, fn);
            });
        },
        data: function (key, value) {
            if (value) {
                return this.each(function () {
                    uu.data(this, key, value);
                });
            }
            else {
                return uu.data(this.elements[0], key);
            }
        },
        removeData: function (key) {
            return this.each(function () {
                uu.removeData(this, key);
            });
        }
    };

    uu.each({
        parent: function (elem) { return elem.parentNode; },
        parents: function (elem) { return uu.Dom.dir(elem, "parentNode"); },
        next: function (elem) { return uu.Dom.nthLevel(elem, 2, "nextSibling"); },
        prev: function (elem) { return uu.Dom.nthLevel(elem, 2, "previousSibling"); },
        nextAll: function (elem) { return uu.Dom.dir(elem, "nextSibling"); },
        prevAll: function (elem) { return uu.Dom.dir(elem, "previousSibling"); },
        siblings: function (elem) { return uu.Dom.siblings(elem); },
        children: function (elem) { return elem.childNodes; },
        contents: function (elem) { return uu.Dom.contents(elem); }
    }, function (name, fn) {
        chain.prototype[name] = function (selector) {
            var ret = uu.map(this.elements, fn);

            if (selector && typeof selector == "string")
                ret = uu.selector.multiFilter(selector, ret);

            return this.pushStack(uu.Array.deleteRepeater(ret));
        };
    });
    uu.each(("blur,focus,load,resize,scroll,unload,click,dblclick," +
	"mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave," +
	"change,select,submit,keydown,keypress,keyup,error").split(","), function (i, name) {
	    chain.prototype[name] = function (fn) {
	        return fn && this.bind(name, fn);
	    };
	});

    function innerFind(selector, nodes) {
        //element
        var resultNodes = [], length;

        for (i = 0, l = nodes.length; i < l; i++) {
            length = resultNodes.length;
            uu.select(selector, nodes[i], resultNodes);

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

    }

    window.$ = function (selector, context) {

        return new chain(selector, context);
    }

})();