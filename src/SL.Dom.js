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
        siblings: function (elem) {
            if (!elem.nodeType) return [];
            if (elem === document) return [];
            var n = elem.parentNode.firstChild;
            var r = [];
            for (; n; n = n.nextSibling) {
                if (n.nodeType == 1 && n != elem)
                    r.push(n);
            }
            return r;
        },
        /**
        *按照某个规则 逐级展开 不包括本身
        *@param {Element} elem
        *@param {String} dir 条件比如nextSibling
        */
        dir: function (elem, dir) {
            var matched = [], cur = elem[dir];
            while (cur && cur != document) {
                if (cur.nodeType == 1)
                    matched.push(cur);
                cur = cur[dir];
            }
            return matched;
        },
        /**
        *按照某个规则 逐级展开 取某一级 包括本身
        *@param {Element} elem
        *@param {String} dir 条件比如nextSibling
        */
        nthLevel: function (cur, result, dir, elem) {
            result = result || 1;
            var num = 0;

            for (; cur; cur = cur[dir])
                if (cur.nodeType == 1 && ++num == result)
                    break;

            return cur;
        },
        contents: function (elem) {
            return /iframe/i.test(elem.nodeName) ? (elem.contentDocument || elem.contentWindow.document) : SL.Convert.convertToArray(elem.childNodes);

        },
        firstChild: function (elem, exceptTextNode) {
            elem = elem.firstChild;
            return elem && exceptTextNode && elem.nodeType != 1 ?
        this.nextSibling(elem, exceptTextNode) : elem;
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
        appendFirstChild: function (newNode, parentNode) {
            this.insertNode(parentNode, "afterBegin", newNode);

        },
        append: function (newNode, parentNode) {
            this.insertNode(parentNode, "beforeEnd", newNode);
        },
        insertBefore: function (newNode, targetNode) {
            this.insertNode(targetNode, "beforeBegin", newNode);
        },
        // 在目标Node之后加入 新的Node.
        insertAfter: function (newNode, targetNode) {
            this.insertNode(targetNode, "afterEnd", newNode);
        },

        insertNode: function (el, where, parsedNode) {
            switch (where) {
                case "beforeBegin":
                    el.parentNode.insertBefore(parsedNode, el);
                    break;
                case "afterBegin":
                    if (el.firstChild) {
                        el.insertBefore(parsedNode, el.firstChild);
                    } else {
                        el.appendChild(parsedNode);
                    }
                    break;
                case "beforeEnd":
                    el.appendChild(parsedNode);
                    break;
                case "afterEnd":
                    if (el.nextSibling) {
                        el.parentNode.insertBefore(parsedNode, el.nextSibling);
                    } else {
                        el.parentNode.appendChild(parsedNode);
                    }
                    break;
            }
        },
        insertAdjacentHTML: function (node, sWhere, sHtml) {
            if (node.nodeType != 1) throw new Error(ns + ':insertAdjacentHTML方法 参数有错误.');
            if ((sWhere = sWhere.tolowerCase()) == 'afterbegin' || sWhere == 'beforeend') {
                if (/hr|br|img|input|link|col|meta|base|area/i.test(node.tagName))
                    return false;
            }
            if (node.insertAdjacentHTML) node.insertAdjacentHTML(sWhere, sHtml);
            else {
                var df, r = node.ownerDocument.createRange();
                switch (new String(sWhere).toLowerCase()) {
                    case "beforebegin":
                        r.setStartBefore(node);
                        df = r.createContextualFragment(sHtml);
                        node.parentNode.insertBefore(df, node);
                        break;
                    case "afterbegin":
                        r.selectNodeContents(node);
                        r.collapse(true);
                        df = r.createContextualFragment(sHtml);
                        node.insertBefore(df, node.firstChild);
                        break;
                    case "beforeend":
                        r.selectNodeContents(node);
                        r.collapse(false);
                        df = r.createContextualFragment(sHtml);
                        node.appendChild(df);
                        break;
                    case "afterend":
                        r.setStartAfter(node);
                        df = r.createContextualFragment(sHtml);
                        node.parentNode.insertBefore(df, node.nextSibling);
                        break;
                }

            }
        },
        map: function (elems, callback) {
            var ret = [];
            for (var i = 0, length = elems.length; i < length; i++) {
                var value = callback(elems[i], i);

                if (value != null)
                    ret[ret.length] = value;
            }

            return ret.concat.apply([], ret);
        },
        transactionDom: function (elems, doc, fragment, scripts) {
            /*处理tr opotion table这种直接div下设置innerhtml无效*/
            var wrapMap = {
                option: [1, "<select multiple='multiple'>", "</select>"],
                legend: [1, "<fieldset>", "</fieldset>"],
                thead: [1, "<table>", "</table>"],
                tr: [2, "<table><tbody>", "</tbody></table>"],
                td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
                area: [1, "<map>", "</map>"],
                _default: [0, "", ""]
            };
            wrapMap.optgroup = wrapMap.option,
            wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead,
            wrapMap.th = wrapMap.td;
            doc = doc || document;
            if (typeof doc.createElement === "undefined") {
                doc = doc.ownerDocument || doc[0] && doc[0].ownerDocument || document;
            }
            //返回节点集
            var ret = [];
            SL.each(elems, function (i, elem) {
                if (typeof elem === "number") {
                    elem += "";
                }

                if (!elem) {
                    return;
                }
                //直接文本
                if (typeof elem === "string" && !/<|&\w+;/.test(elem)) {
                    elem = doc.createTextNode(elem);
                } else if (typeof elem === "string") {
                    // Fix "XHTML"-style tags in all browsers
                    elem = elem.replace(/(<([\w:]+)[^>]*?)\/>/g, fcloseTag = function (all, front, tag) {
                        return /^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i.test(tag) ? all : front + "></" + tag + ">";
                    });
                    // 获取 tag名 小写
                    var tag = (/<([\w:]+)/.exec(elem) || ["", ""])[1].toLowerCase(),
                    //处理tr opotion table这种直接div下设置innerhtml无效
					wrap = wrapMap[tag] || wrapMap._default,
					depth = wrap[0],
					div = doc.createElement("div");
                    // 处理tr opotion table这种直接div下设置innerhtml无效 包裹
                    div.innerHTML = wrap[1] + elem + wrap[2];
                    // Move to the right depth
                    while (depth--) {
                        div = div.lastChild;
                    }
                    // ie6 ie7会在table下自动添加  <tbody>  需要移除不然<thead></thead>会返回<thead></thead><tbody></tbody>
                    if (!SL.Support.tbody) {
                        // 如果string是table可能自动产生tbody
                        var hasBody = /<tbody/i.test(elem),
						tbody = tag === "table" && !hasBody ?
							div.firstChild && div.firstChild.childNodes :
                        // String=<thead> or <tfoot> 可能自动产生tbody
							wrap[1] === "<table>" && !hasBody ?
								div.childNodes :
								[];
                        for (var j = tbody.length - 1; j >= 0; --j) {
                            if (/tbody/i.test(tbody[j].nodeName) && !tbody[j].childNodes.length) {
                                tbody[j].parentNode.removeChild(tbody[j]);
                            }
                        }

                    }

                    //  IE6-ie8 innerHTML会自动删除开头空格 补充上
                    if (!SL.Support.leadingWhitespace && /^\s+/.test(elem)) {
                        div.insertBefore(doc.createTextNode(/^\s+/.exec(elem)[0]), div.firstChild);
                    }
                    elem = SL.Convert.convertToArray(div.childNodes);
                }
                if (elem.nodeType) {
                    ret.push(elem);
                } else {
                    ret = SL.merge(ret, elem);
                }
            });
            /*附加到fragment并分离出srcipt*/
            if (fragment) {
                for (var i = 0; ret[i]; i++) {
                    if (scripts && /script/i.test(ret[i].nodeName) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript")) {
                        scripts.push(ret[i].parentNode ? ret[i].parentNode.removeChild(ret[i]) : ret[i]);
                    } else {
                        if (ret[i].nodeType === 1) {
                            ret.splice.apply(ret, [i + 1, 0].concat(SL.Convert.convertToArray(ret[i].getElementsByTagName("script"))));
                        }
                        fragment.appendChild(ret[i]);
                    }
                }
            }

            return ret;
        },
        parseHtml: function (htmlstr, doc) {

            doc = doc || document;
            var fragment = doc.createDocumentFragment();
            this.transactionDom([htmlstr], doc, fragment, []);
            return fragment;

        },
        //ie6 ie7附加tr必须在tbody
        _getDomRoot: function (parentNode, childNode) {
            return /table/i.test(parentNode.nodeName) && /tr/i.test(childNode.nodeName) ?
				(parentNode.getElementsByTagName("tbody")[0] ||
				parentNode.appendChild(parentNode.ownerDocument.createElement("tbody"))) :
				parentNode;
        },
        clone: function (node) {
            //html5
            if (document.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>") {
                return node.cloneNode(true);
            } else {
                var fragment = document.createDocumentFragment(),
			doc = fragment.createElement ? fragment : document;
                doc.createElement(node.tagName);
                var div = doc.createElement('div');
                fragment.appendChild(div);
                div.innerHTML = node.outerHTML; //
                return div.firstChild;
            }
        },
        setNodeStyle: function (node, styleString) {
            if (!(node = this.$id(node)) || !SL.InstanceOf.String(styleString)) throw new Error(ns + ':setNodeStyle 参数 有错误.');
            if (ns.clientBrowser.is_ie) {//IE方法
                node.style.cssText = styleString;
            }
            else node.setAttribute('style', styleString); //w3c方法
        },
        empty: function (elem) {
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }

        },
        text: function (elem, text) {
            var i, node, nodeType = elem.nodeType, ret = "";
            if (nodeType) {
                if (text !== undefined) {
                    return this.empty().append((elem && elem.ownerDocument || document).createTextNode(text));
                }
                else {
                    if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                        if (typeof elem.textContent === "string") {
                            return elem.textContent;
                        } else {
                            for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                                ret += this.text(elem);
                            }
                            return ret;
                        }
                    } else if (nodeType === 3 || nodeType === 4) {
                        return elem.nodeValue;
                    }
                }
            }

        },

        html: function (node, html) {
            if (html !== undefined) {
                if (node != null && 'innerHTML' in node) {
                    node.innerHTML = html;
                }
            } else {
                return node.innerHTML;
            }
        }
    };

    SL.Dom = SL.Dom || {};
    SL.Dom = new Dom();
});