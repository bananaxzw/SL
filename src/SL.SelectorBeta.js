/// <reference path="sl.js" />
(function () {


    var baseHasDuplicate = true; // 检测浏览器是否支持自定义的sort函数
    var hasDuplicate = false; // 是否有重复的DOM元素
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
        }
    };
    var sortOrder, siblingCheck;
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
    }


})();