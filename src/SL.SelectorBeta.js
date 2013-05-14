/// <reference path="sl.js" />
(function () {


    var baseHasDuplicate = true, // 检测浏览器是否支持自定义的sort函数
    hasDuplicate = false; // 是否有重复的DOM元素
    [0, 0].sort(function () {
        baseHasDuplicate = false;
        return 0;
    });
    var selectorHelper = {
        contains: function (a, b) {
            // 标准浏览器支持compareDocumentPosition
            /** 
            *Bits          Number        Meaning 
            *000000         0              元素一致 
            *000001         1              节点在不同的文档（或者一个在文档之外） 
            *000010         2              节点 B 在节点 A 之前 
            *000100         4              节点 A 在节点 B 之前 
            *001000         8              节点 B 包含节点 A 
            *010000         16             节点 A 包含节点 B 
            *100000         32             浏览器的私有使用
            */
            if (a.compareDocumentPosition) {
                return !!(a.compareDocumentPosition(b) & 16);
            }
            // IE支持contains
            else if (a.contains) {
                return a !== b && a.contains(b);
            }
            return false;
        },
        uniqueSort: function (elems) {
            if (sortOrder) {
                hasDuplicate = baseHasDuplicate;
                results.sort(sortOrder);

                if (hasDuplicate) {
                    for (var i = 1; i < results.length; i++) {
                        if (results[i] === results[i - 1]) {
                            results.splice(i--, 1);
                        }
                    }
                }
            }

            return results;
        },
        isXML: function (elem) {
            var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
        }
    };
    var sortOrder, siblingCheck, slSelector;
    if (document.documentElement.compareDocumentPosition) {
        sortOrder = function (a, b) {
            if (a === b) {
                hasDuplicate = true;
                return 0;
            }
            /*    
            *000100         4            节点 A 在节点 B 之前 
            */
            if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                return a.compareDocumentPosition ? -1 : 1;
            }
            return a.compareDocumentPosition(b) & 4 ? -1 : 1;
        };
    } else {
        sortOrder = function (a, b) {
            // 判断是否重复
            if (a === b) {
                hasDuplicate = true;
                return 0;
                // IE判断2个位置
            } else if (a.sourceIndex && b.sourceIndex) {
                return a.sourceIndex - b.sourceIndex;
            }
            var al, bl, ap = [], bp = [], aup = a.parentNode, bup = b.parentNode, cur = aup;

            //如果父节点相同 进行兄弟节点检测
            if (aup === bup) {
                return siblingCheck(a, b);
            } else if (!aup) {
                return -1;
            } else if (!bup) {
                return 1;
            }
            /*比较父节点的位置*/
            while (cur) {
                ap.unshift(cur);
                cur = cur.parentNode;
            }
            cur = bup;
            while (cur) {
                bp.unshift(cur);
                cur = cur.parentNode;
            }
            al = ap.length;
            bl = bp.length;
            for (var i = 0; i < al && i < bl; i++) {
                if (ap[i] !== bp[i]) {
                    return siblingCheck(ap[i], bp[i]);
                }
            }
            /*一般情况下不会执行到这个步骤*/
            return i === al ? siblingCheck(a, bp[i], -1) : siblingCheck(ap[i], b, 1);
        };
        siblingCheck = function (a, b, ret) {
            if (a === b) {
                return ret;
            }
            var cur = a.nextSibling;
            while (cur) {
                if (cur === b) {
                    return -1;
                }
                cur = cur.nextSibling;
            }

            return 1;
        };
    };
    var Finder = {
        ID: function (match, context, isXML) {
            if (typeof context.getElementById !== "undefined" && !isXML) {
                var m = context.getElementById(match[1]);
                // Check parentNode to catch when Blackberry 4.6 returns
                // nodes that are no longer in the document #6963
                return m && m.parentNode ? [m] : [];
            }
        },

        NAME: function (match, context) {
            if (typeof context.getElementsByName !== "undefined") {
                var ret = [],
					results = context.getElementsByName(match[1]);

                for (var i = 0, l = results.length; i < l; i++) {
                    if (results[i].getAttribute("name") === match[1]) {
                        ret.push(results[i]);
                    }
                }

                return ret.length === 0 ? null : ret;
            }
        },

        TAG: function (match, context) {
            if (typeof context.getElementsByTagName !== "undefined") {
                return context.getElementsByTagName(match[1]);
            }
        }
    };
    var Filter = {};

    //某些浏览器 getElementById会返回Name的元素
    (function () {

        var form = document.createElement("div"),
		id = "sl_checkDocumentById_" + (new Date()).getTime(),
		root = document.documentElement;

        form.innerHTML = "<a name='" + id + "'/>";
        root.insertBefore(form, root.firstChild);
        if (document.getElementById(id)) {
            Finder.ID = function (match, context, isXML) {
                if (typeof context.getElementById !== "undefined" && !isXML) {
                    var m = context.getElementById(match[1]);

                    return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
                }
            };

            Expr.filter.ID = function (elem, match) {
                var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

                return elem.nodeType === 1 && node && node.nodeValue === match;
            };
        }

        root.removeChild(form);
        root = form = null;
    })();




})();