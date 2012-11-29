(function (global, DOC) {
    var _dom = global.dom, w3c = DOC.dispatchEvent, //w3c事件模型
     namespace = DOC.URL.replace(/(\W|(#.+))/g, ''),HEAD = DOC.head || DOC.getElementsByTagName("head")[0],class2type = {
        "[object HTMLDocument]": "Document",
        "[object HTMLCollection]": "NodeList",
        "[object StaticNodeList]": "NodeList",
        "[object IXMLDOMNodeList]": "NodeList",
        "[object DOMWindow]": "Window",
        "null": "Null",
        "NaN": "NaN",
        "undefined": "Undefined"
    },toString = class2type.toString;
    /**
     * 糅杂，为一个对象添加更多成员
     * @param {Object} target 目标对象
     * @param {Object} source 属性包
     * @return  {Object} 目标对象
     */
    function mix(target, source) {
        var args = [].slice.call(arguments), key,ride = typeof args[args.length - 1] == "boolean" ? args.pop() : true;
        for (var i = 1; source = args[i++]; ) {
            for (key in source) {
                if (ride || !(key in target)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }
    /**
     * @class dom
     * dom Framework拥有两个命名空间,
     * 第一个是DOC.URL.replace(/(\W|(#.+))/g,'')，根据页面的地址动态生成
     * 第二个是dom，我们可以使用别名机制重写它
     * @namespace dom
     */
    var dom = function (expr, context) {
        if (dom.type(expr, "Function")) { //注意在safari下,typeof nodeList的类型为function,因此必须使用dom.type
            dom.ready(expr, true);
        } else {
            if (!dom.fn)
                throw "must load the 'node' module!"
            return new dom.fn.init(expr, context);
        }
    }
    mix(dom, {
        uuid: 1,
        HTML: DOC.documentElement,
        HEAD: HEAD,
        rword: /[^, ]+/g,
        rreadystate: /loaded|complete|undefine/i,
        "@name": "dom",
        "@debug": true,
        "@emitter": w3c ? "addEventListener" : "attachEvent",
        /**
         * 别名机制(相当于jquery的noConflict)
         * @param {String} name 新的命名空间
         */
        exports: function (name) {
            _dom && (global.dom = _dom);
            name = name || dom["@name"];
            dom["@name"] = name;
            global[name] = global[namespace] = this;
        },
        /**
         * 数组化
         * @param {ArrayLike} nodes 要处理的类数组对象
         * @param {Number} start 可选。要抽取的片断的起始下标。如果是负数，从后面取起
         * @param {Number} end  可选。规定从何处结束选取
         * @return {Array}
         */
        slice: function (nodes, start, end) {
            for (var i = 0, n = nodes.length, result = []; i < n; i++) {
                result[i] = nodes[i];
            }
            if (arguments.length > 1) {
                return result.slice(start, (end || result.length));
            } else {
                return result;
            }
        },
        noop: function () { },
        /**
         * 用于取得数据的类型或判定数据的类型
         * @param {Any} obj 要检测的东西
         * @param {String} str 要比较的类型
         * @return {String|Boolean}
         */
        type: function (obj, str) {
            var result = class2type[(obj == null || obj !== obj) ? String(obj) : toString.call(obj)] || obj.nodeName || "#";
            if (result.charAt(0) === "#") {//兼容旧式浏览器与处理个别情况,如window.opera
                if (obj.window == obj) {
                    result = 'Window'; //返回构造器名字
                } else if (obj.nodeType === 9) {
                    result = 'Document'; //返回构造器名字
                } else if (obj.callee) {
                    result = 'Arguments'; //返回构造器名字
                } else if (isFinite(obj.length) && obj.item) {
                    result = 'NodeList'; //处理节点集合
                } else if (obj.open && obj.send) {
                    result = "XMLHttpRequest";
                } else {
                    result = toString.call(obj).slice(8, -1);
                }
            }
            if (str) {
                return str === result;
            }
            return result;
        },
        /**
         * 用于调试，如果是IE6直接打印到页面上
         * @param {String} s 要打印的内容
         * @param {Boolean} force 强逼打印到页面上
         */
        log: function (s, force) {
            if (force || !global.console) {
                var div = DOC.body && DOC.createElement("div");
                if (div) {
                    div.innerHTML = s;
                    DOC.body.appendChild(div)
                }
            } else {
                global.console.log(s);
            }
        },
        /**
         * 生成键值统一的对象，用于高速化判定
         * @param {Array|String} array 如果是字符串，请用","或空格分开
         * @param {Number} val 可选，默认为1
         * @return {Object}
         */
        oneObject: function (array, val) {
            if (typeof array == "string") {
                array = array.match(dom.rword) || [];
            }
            var result = {}, value = val !== void 0 ? val : 1;
            for (var i = 0, n = array.length; i < n; i++) {
                result[array[i]] = value;
            }
            return result;
        }
    });
    "Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList,XMLHttpRequest".replace(dom.rword, function (name) {
        class2type["[object " + name + "]"] = name;
    });
    // http://wp.moooori.com/archives/1911
    var rmodule = /([^(\s]+)\(?([^)]*)\)?/,onload = w3c ? "onload" : "onreadystatechange",names = []//需要处理的模块名列表
    var map = dom["@modules"] = {
        "@ready": {}
    };
    /**
     * 用于模拟opera的script onerror
     * @param {String} name 模块名
     * @param {String} url  模块的路径
     * @param {Element} node 为加载这个模块临时生成的script节点
     */
    function fixOperaError(name, url, node) {
        var iframe = DOC.createElement("iframe");
        var code = "<script> window[document.URL.replace(/(\W|(#.+))/g,'')] = {define:function(){} } <\/script>" +'<script src="' + url + '" onload="this.ownerDocument.x = 1;"><\/script>';
        iframe.style.display = "none";
        HEAD.appendChild(iframe);
        var d = iframe.contentDocument;
        d.write(code);
        d.close();
        iframe.onload = function () {
            if (d.x == void 0) {
                removeScript(name, node, true);
            }
            iframe.onload = null; //opera无法在iframe被事件绑定时被移除
            HEAD.removeChild(this);
        };
    }
    /**
     * 为加载模块而临时生成一个script节点
     * @param {String} name 模块名
     * @param {String} url  模块的路径
     */
    function appendScript(name, url) {
        var node = DOC.createElement("script");
        url = url || dom.basePath + "/" + name.slice(1) + ".js" + (dom["debug"] ? "?timestamp=" + new Date : "");
        node.charset = "utf-8";
        node.async = true;
        node.onerror = function () {
            removeScript(name, this, true);
        }
        node[onload] = function () {
            if (w3c || dom.rreadystate.test(this.readyState)) {
                resolveCallbacks();
                removeScript(name, this);
            }
        }
        node.src = url;
        global.opera && fixOperaError(name, url, node);
        HEAD.insertBefore(node, HEAD.firstChild);
    }
    /**
     * 移除临时生成的script节点
     * @param {String} name 模块名
     * @param {Element} node 为加载这个模块临时生成的script节点
     * @param {Boolean} error 是否加载失败
     */
    function removeScript(name, node, error) {
        var parent = node.parentNode;
        if (parent && parent.nodeType === 1) {
            if (error || !map[name].state) {
                dom.stack(new Function('dom.log("fail to load module [ ' + name + ' ]")'));
                dom.stack.fire(); //打印错误堆栈
            }
            if (node.clearAttributes) {
                node.clearAttributes();
            } else {
                node[onload] = node.onerror = null;
            }
            parent.removeChild(node);
        }
    }
    //执行并移除所有依赖都具备的模块或回调
    function resolveCallbacks() {
        loop:
        for (var i = names.length, repeat, name; name = names[--i]; ) {
            var obj = map[name], deps = obj.deps;
            for (var key in deps) {
                if (deps.hasOwnProperty(key) && map[key].state != 2) {
                    continue loop;
                }
            }
            //如果deps是空对象或者其依赖的模块的状态都是3
            if (obj.state != 2) {
                names.splice(i, 1); //必须先移除再执行，防止在IE下DOM树建完后手动刷新页面，会多次执行最后的回调函数
                obj.callback();
                obj.state = 2;
                repeat = true;
            }
        }
        repeat && resolveCallbacks();
    }
    var deferred = function () {//一个简单的异步列队
        var list = [], self = function (fn) {
            fn && fn.call && list.push(fn);
            return self;
        }
        self.method = "shift";
        self.fire = function (fn) {
            while (fn = list[self.method]()) {
                fn();
            }
            return list.length ? self : self.complete();
        }
        self.complete = dom.noop;
        return self;
    }
    var errorstack = dom.stack = deferred();
    errorstack.method = "pop";
    mix(dom, {
        mix: mix,
        //绑定事件(简化版)
        bind: w3c ? function (el, type, fn, phase) {
            el.addEventListener(type, fn, phase);
        } : function (el, type, fn) {
            el.attachEvent("on" + type, function () {
                fn.call(el, global.event);
            });
        },
        /**
     * <a href="http://www.cnblogs.com/rubylouvre/archive/2011/02/10/1950940.html">核心模块所在路径</a>
     * @property
     * @type String
     */
        basePath: (function (url, scripts, node) {
            scripts = DOC.getElementsByTagName("script");
            node = scripts[scripts.length - 1];
            url = node.hasAttribute ? node.src : node.getAttribute('src', 4);
            return url.substr(0, url.lastIndexOf('/'));
        })(),
        /**
     * 请求模块
     * @param {String|Array} deps 依赖列表，如果是字符串请用逗号隔开，如果要指定具体路径请写到小括号中
     * @param {Function} module 正向回调
     * @param {Function} errback 负向回调
     */
        // dom.require("class,lang",function(){})
        require: function (deps, callback, errback) {
            var _deps = {};
            (deps + "").replace(dom.rword, function (url, name, match) {
                match = url.match(rmodule);
                name = "@" + match[1]; //取得模块名
                if (!map[name]) { //防止重复生成节点与请求
                    map[name] = {}; //state: undefined, 未加载; 1 已加载; 2 : 已执行
                    appendScript(name, match[2]); //加载JS文件
                }
                _deps[name] = "司徒正美"; //有用的只是其键名,内容随便
            });
            var name = callback._name || "@cb" + (+new Date + Math.random());
            dom.stack(errback); //压入错误堆栈
            map[name] = {//创建或更新模块的状态
                callback: callback,
                deps: _deps,
                state: 1
            };
            names.push(name);
        },
        /**
     * 定义模块
     * @param {String} name 模块名
     * @param {String} dependList 依赖列表
     * @param {Function} module 模块本身
     */
        define: function (name, deps, callback) {
            if (typeof deps == "function") {//处理只有两个参数的情况
                callback = deps;
                deps = "";
            }
            callback._name = "@" + name; //模块名
            this.require(deps, callback);
        }
    });
    /**
 * domReady机制
 * @param {Function} fn 回调函数
 */
    var readylist = dom.ready = deferred();
    function fireReady() {
        map["@ready"].state = 2;
        resolveCallbacks(); //fix opera没有执行最后的回调
        readylist.complete = function (fn) {
            fn && fn.call && fn()
        }
        readylist.fire();
        fireReady = dom.noop;
    };
    function doScrollCheck() {
        try {
            dom.HTML.doScroll("left");
            fireReady();
        } catch (e) {
            setTimeout(doScrollCheck, 1);
        }
    };
    //开始判定页面的加载情况
    if (DOC.readyState === "complete") {
        fireReady();
    } else {
        dom.bind(DOC, (w3c ? "DOMContentLoaded" : "readystatechange"), function () {
            if (w3c || DOC.readyState === "complete") {
                fireReady();
            }
        });
        try {
            //http://bugs.jquery.com/ticket/4787 http://cmc3.cn/
            //在IE6下,内嵌页面如果重设了document.domain，访问window.frameElement抛错，
            //但是经过多次try catch后，才能访问该值
            var toplevel = global.frameElement == null;
        } catch (e) { };
        if (dom.HTML.doScroll && toplevel) {
            doScrollCheck();
        }
    }
    //https://developer.mozilla.org/en/DOM/window.onpopstate
    dom.bind(global, "popstate", function () {
        namespace = DOC.URL.replace(/(#.+|\W)/g, '');
        dom.exports();
    });
    dom.exports();
})(this, this.document);
/**
 2011.7.11
@开头的为私有的系统变量，防止人们直接调用,
dom.check改为dom["@emitter"]
dom.namespace改为dom["@name"]
去掉无用的dom.modules
优化exports方法
2011.8.4
强化dom.log，让IE6也能打印日志
重构fixOperaError与resolveCallbacks
将provide方法合并到require中去
2011.8.7
重构define,require,resolve
添加"@modules"属性到dom命名空间上
增强domReady传参的判定
2011.8.18
应对HTML5 History API带来的“改变URL不刷新页面”技术，让URL改变时让namespace也跟着改变！
2011.8.20 去掉dom.K,添加更简单dom.noop，用一个简单的异步列队重写dom.ready与错误堆栈dom.stack
2011.9.5  强化dom.type
2011.9.19 强化dom.mix
*/