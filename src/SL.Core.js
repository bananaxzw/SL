/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*/
/**    
* @description  SL框架基类 主要核心
* 感谢jquery protype jet框架的作者们 感谢franky
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/

(function () {

    var version = "1.0", topNamespace = this,
    SL = topNamespace.SL, VERSIONS = {}, Instances = {};


    if (SL == undefined) {
        if (SL) {
            SL.VERSIONS = VERSIONS;
            SL.Instances = Instances;
        }
        /**
        * 核心模块
        * @namespace
        * @name sl
        */
        SL = function (ver, isNewInstance) {
            var _SL = this;
            if (isNewInstance) {
                // 如果是第一次执行则初始化对象
                this._init();
            } else {
                if (ver) {
                    ver = String(ver);
                    try {
                        if (SL.Instances[ver]) {
                            _SL = SL.Instances[ver];
                        } else {
                            _SL = SL.Instances[SL.DEFAULT_VERSION];
                            throw new Error("没有找到 SL version " + ver + ", 所以返回默认版本 SL version " + SL.DEFAULT_VERSION + "!");
                        }
                    } catch (e) {
                        //输出("A.错误：[" + e.name + "] " + e.message + ", " + e.fileName + ", 行号:" + e.lineNumber + "; stack:" + typeof e.stack, 2);
                    }
                } else {
                    _SL = SL.Instances[SL.DEFAULT_VERSION];
                }
            }
            return _SL;
        };
        SL.prototype = {
            _init: function () {
                this.constructor = SL;
            },

            /**
            *@description 可以一次性连续创建命名空间
            *@name registerNamespace
            *@memberOf sl
            *@function
            *@param {String} name 命名空间名称
            *@returns {Object} 返回对最末命名空间的引用
            * 
            * @example
            *在全局环境中创建top.sub名字空间, _registerNamespace完成的操作相当于在全局环境中执行如下语句：
            * var top = {};
            * top.sub = {};
            * sl.registerNamespace("top.sub");
            */
            registerNamespace: function (namespacePath) {
                var rootObject = topNamespace;
                var namespaceParts = namespacePath.split('.');

                for (var i = 0, l = namespaceParts.length; i < l; i++) {
                    var currentPart = namespaceParts[i];
                    var ns = rootObject[currentPart];
                    var nsType = typeof (ns);
                    if (!ns) {
                        ns = rootObject[currentPart] = {};
                    }
                    /* 暂时去掉限制else {
                   
                    if (i == l - 1) {
                    // alert("你所注册的名称空间已经被占用;");
                    throw new Error("namespace is AlreadyExist!");
                    }
                    if (!SL().InstanceOf.PlainObject(ns)) {
                    throw new Error("exist namespace is not PlainObject");
                    }
                    }*/

                    if (!ns.__namespace && SL().InstanceOf.PlainObject({})) {

                        ns.__namespace = true;
                        ns.__typeName = namespaceParts.slice(0, i + 1).join('.');
                        ns.getName = function ns$() { return this.__typeName; }
                    }
                    rootObject = ns;
                }
                return rootObject;
            },

            /**
            *创建一个 Javascript 代码包
            *@memberOf sl
            *@function
            *@name create
            *@param {String} name 要创建的包的命名空间
            *@param {Function} func 要创建的包的包体
            *@returns {Mixed} 返回任何自定义的变量
            *@example
            * sl.create(function(){
            * 	//这时上下文对象this指向全局window对象
            * 	alert(this);
            * };
            * 
            *sl.create("top.sub", function(SL){
            * 	//这时上下文对象this指向window对象下的top.sub对象
            * 	alert(this);
            * };
            * 
            *
            *sl.create("topNameSpace.sub", function () {
            *    this.say = function () {
            *        alert("hello word!");
            *        }
            * });
            *   topNameSpace.sub.say();
            *
            *sl.create("topNameSpace.sub.subsub", function () {
            *        this.say = function () {
            *            alert("hello word Sub!");
            *        }
            *});
            *topNameSpace.sub.subsub.say();
            *
            *
            *sl.create("myNameSpace", function () {
            *        this.say = function () {
            *            alert("hello word myNameSpace!");
            *        }
            *        sl.U = this;
            * });
            *alert(myNameSpace.say == sl.U.say);
            *     
            */
            create: function () {
                var name = arguments[0],
						func = arguments[arguments.length - 1],
						ns = topNamespace,
						returnValue;
                if (typeof func === "function") {
                    if (typeof name === "string") {
                        ns = this.registerNamespace(name);
                        if (SL.Instances[name]) {
                            //throw new Error("Package name [" + name + "] is exist!");
                        } else {
                            SL.Instances[name] = {
                                isLoaded: true,
                                returnValue: returnValue
                            };
                        }
                    } else if (typeof name === "object") {
                        ns = name;
                    }
                    ns.instanceName = name;
                    returnValue = func.call(ns, this);
                } else {
                    throw new Error("Function required");
                }

            },
            /**
            *@ignore
            */
            compare: function (obj1, obj2) {
                if (obj1 == null || obj2 == null) return (obj1 === obj2);
                return (obj1 === obj2);
            },
            /**
            *@ignore
            */
            /*数据缓存*/
            expando: "SL" + (new Date()).getTime(),
            /**
            *@ignore
            */
            /*事件句柄唯一键*/
            guid: 1,
            /**
            *@ignore
            */
            uuid: 0,
            /**
            *@ignore
            */
            cache: {},

            /**
            * @description  创建对象
            *@name Class
            *@memberOf sl
            *@function
            * @param {Object} option = {base: superClass} 在option对象的base属性中指定要继承的对象，可以不写，不写就不继承任何类
            * @param {Object}  object={.....} 要创建的类的属性和方法
            * @returns {Object} newclass返回新创建的对象
            * 
            * @example
            * var Person = sl.Class({
            *    init: function (name, sex, age) {
            *        this.name = name;
            *        this.age = age;
            *        this.sex = sex;
            *    },
            *    getAge: function () {
            *        alert(this.age);
            *    }
            *
            * });
            * var Employee = sl.Class({ base: Person }, {
            *     init: function (name, sex, age, id) {
            *         this.base.init(name, sex, age);
            *         this.EmployeeId = id;
            *     },
            *     getEmployeeID: function () {
            *         alert(this.EmployeeId);
            *     },
            *     getName: function () {
            *        alert(this.name);
            *     }
            *});
            * var p = new Person('xuzhiwei',"男",18);
            * p.getAge();
            * var employee = new Employee("xuzhiwei-older", "nan", 18, 1);
            * employee.getAge();
            */
            Class: function () {
                var length = arguments.length, members = arguments[length - 1];

                if (length == 2) {
                    var superClass = arguments[0].base;
                    var subClass = function () {
                        //构造base 可以不用关注
                        this.base = this.base || {};
                        var _this = this;
                        for (var name in superClass.prototype) {
                            if (typeof superClass.prototype[name] == "function") {
                                this.base[name] = (function _helper(x, scope) {
                                    return function () {
                                        superClass.prototype[x].apply(scope, arguments);
                                    };
                                })(name, _this);
                            }
                        }
                        this.init.apply(this, arguments);
                    }
                    // 指定原型
                    subClass.prototype = new superClass();
                    // 重新指定构造函数
                    subClass.prototype.constructor = subClass;
                    //扩展子类
                    this.extend(subClass.prototype, members);
                    return subClass;

                }
                else {
                    members.init = members.init || function () { };
                    var newClass = function () {
                        this.init.apply(this, arguments);
                    }
                    //修正 改为扩展 废除newClass.prototype = members;
                    sl.extend(newClass.prototype, members);
                    return newClass;
                }

            }
        };
        SL.VERSIONS = VERSIONS;
        SL.Instances = Instances;

        SL.Instances[version] = new SL(version, true);

        SL.DEFAULT_VERSION = version;
        topNamespace.SL = SL;
        topNamespace.sl = SL.Instances[version];
    }

})();


SL().create(function (SL) {
    /**
    * 类型判断
    * @class
    * @name InstanceOf
    * @example 
    * return sl.InstanceOf.String(obj)
    */
    var toString = Object.prototype.toString,

    class2type = {
        "[object String]": "string",
        "[object Array]": "array",
        "[object Number]": "number",
        "[object Boolean]": "boolean",
        "[object Date]": "date",
        "[object RegExp]": "regexp",
        "[object Function]": "function",
        "[object Object]": "object"
    };

    sl.type = function (obj) {
        return obj == null ?
			String(obj) :
			class2type[toString.call(obj)] || "object";
    }
    var InstanceOf = function () {
        /// <summary>
        /// 类型判断相关
        /// </summary>
    };
    InstanceOf.prototype = {
        /**
        *判断是否字符串
        */
        String: function (obj) {
            return Object.prototype.toString.call(obj) == '[object String]';
        },
        /**
        *判断是否数组
        */
        Array: function (obj) {
            return Object.prototype.toString.call(obj) == '[object Array]';
        },
        /**
        *判断是否数字
        */
        Number: function (obj) {
            return Object.prototype.toString.call(obj) == '[object Number]';
        },
        /**
        *判断是否布尔
        */
        Boolean: function (obj) {
            return Object.prototype.toString.call(obj) == '[object Boolean]';
        },
        /**
        *判断是否时间
        */
        Date: function (obj) {
            return Object.prototype.toString.call(obj) == '[object Date]';
        },
        /**
        *判断是否正则
        */
        RegExp: function (obj) {
            return Object.prototype.toString.call(obj) == '[object RegExp]';
        },
        /**
        *判断是否方法
        */
        Function: function (obj) {
            return (typeof obj == 'function');
        },
        Undefined: function (obj) {
            return (typeof obj == 'undefined');
        },
        Null: function (obj) {
            return (obj === null);
        },
        Arguments: function (obj) {
            return this.Object(obj) && obj.constructor.toString() == Object.toString() && 'length' in obj && 'callee' in obj;
        },
        Window: function (obj) {
            return obj != null && obj === window;
        },
        BodyOrHtmlOrWindow: function (obj) {
            var isWindow = obj == window || obj == document
			|| !obj.tagName || (/^(?:body|html)$/i).test(obj.tagName);
            return isWindow;
        },
        /**
        *判断是否普通对象 由{}构建或者object
        */
        PlainObject: function (obj) {
            if (!obj || Object.prototype.toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval) {
                return false;
            }


            if (obj.constructor
			&& !Object.prototype.hasOwnProperty.call(obj, "constructor")
			&& !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
            var key;
            for (key in obj) { }

            return key === undefined || Object.prototype.hasOwnProperty.call(obj, key);
        },
        Object: function (obj) {
            return (!!obj && typeof obj == 'object');
        },
        EmptyObject: function (obj) {
            /// <summary>
            /// 遍历元素的属性，只有要属性就返回假，否则返回真
            /// </summary>
            /// <param name="obj"></param>
            /// <returns type=""></returns>
            for (var name in obj) {
                return false;
            }
            return true;

        },
        DOMNode: function (node) {
            return this.Object(node) && node.nodeType;
        },
        /**
        *判断是否dom元素
        */
        DOMElement: function (node) {
            return this.Object(node) && node.nodeType == 1;
        },
        /**
        *判断是否dom属性
        */
        DOMAttribute: function (node) {
            return this.Object(node) && node.nodeType == 2;
        },
        /**
        *判断是否dom元素
        */
        DOMTextNode: function (node) {
            return this.Object(node) && node.nodeType == 3;
        },
        DOMNodeList: function (obj) {
            return !!obj && (!obj.hasOwnProperty || obj == '[object NodeList]' || obj == '[object StaticNodeList]' || obj == '[object HTMLCollection]' || ('length' in obj && this.DOMNode(obj[0])));
        },
        /**
        *判断是否dom片段文档
        */
        DocumentFragment: function (obj) {
            return this.Object(obj) && obj.nodeType == 11;
        }
    }
    SL.InstanceOf = SL.InstanceOf || {};
    SL.InstanceOf = new InstanceOf();
});
SL().create(function (SL) {

    /**
    *对象扩展
    *@memberOf sl
    *@function
    *@param deep||target,[object1],[objectN]
    *@example
    * var object1 = {
    *        apple: 0,
    *        banana: { weight: 52, price: 100 },
    *        cherry: 97
    *    };
    *    var object2 = {
    *        banana: { price: 200 },
    *        durian: 100
    *    };
    *
    *    console.dir(sl.extend(true, object1, object2));
    *  {"apple":0,"banana":{"weight":52,"price":200},"cherry":97,"durian":100}
    *    console.dir(sl.extend(object1, object2));
    *    {"apple":0,"banana":{"price":200},"cherry":97,"durian":100}
    */
    function extend() {
        var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && (target)) {
            target = {};
        }
        // extend SL itself if only one argument is passed
        if (length === i) {
            target = SL;
            --i;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }
                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (SL.InstanceOf.PlainObject(copy) || (copyIsArray = SL.InstanceOf.Array(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && SL.InstanceOf.Array(src) ? src : [];

                        } else {
                            clone = src && SL.InstanceOf.PlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = arguments.callee(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        // Return the modified object
        return target;
    }
    SL.extend = extend;
});
SL().create(function (SL) {
    var rbracket = /\[\]$/,
    r20 = /%20/g;
    function buildParams(prefix, obj, traditional, add) {
        if (sl.InstanceOf.Array(obj) && obj.length) {
            // Serialize array item.
            sl.each(obj, function (i, v) {
                if (traditional || rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);

                } else {
                    buildParams(prefix + "[" + (typeof v === "object" || sl.InstanceOf.Array(v) ? i : "") + "]", v, traditional, add);
                }
            });

        } else if (!traditional && obj != null && typeof obj === "object") {
            if (sl.InstanceOf.EmptyObject(obj)) {
                add(prefix, "");
            } else {
                sl.each(obj, function (k, v) {
                    buildParams(prefix + "[" + k + "]", v, traditional, add);
                });
            }

        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    };


    (function () {

        /**
        *通用例遍方法，可用于例遍对象和数组。
        *@name each
        *@memberOf sl
        *@function
        *@param object,[callback]
        *@example
        *sl.each( [0,1,2], function(i, n){
        *  alert( "Item #" + i + ": " + n );
        *});
        *
        *sl.each( { name: "John", lang: "JS" }, function(i, n){
        *  alert( "Name: " + i + ", Value: " + n );
        *});
        */
        this.each = function (object, callback, args) {
            var name, i = 0, length = object.length;
            if (args) {
                if (length === undefined) {
                    for (name in object)
                        if (callback.apply(object[name], args) === false)
                            break;
                } else
                    for (; i < length; )
                        if (callback.apply(object[i++], args) === false)
                            break;
            } else {
                if (length === undefined) {
                    for (name in object)
                        if (callback.call(object[name], name, object[name]) === false)
                            break;
                } else {
                    for (; i < length; ) {
                        if (callback.call(object[i], i, object[i++]) === false) {
                            break;
                        }
                    }

                }
            }
        };

        /**
        *返回一个新函数，并且这个函数始终保持了特定的作用域。
        *@memberOf sl
        *@name proxy
        *@function
        *@param function,context||context,name
        *@example
        *proxy( obj, "test" )
        *proxy(fn,context)
        *
        *var obj = {
        *  name: "John",
        *  test: function() {
        *    alert( this.name );
        *  }
        *};
        *sl.proxy( obj, "test" )
        *或者 sl.proxy( obj.test, obj )
        */
        this.proxy = function () {
            var fn, proxy, context;
            if (2 === arguments.length) {
                //proxy(context,"property")
                if (typeof arguments[1] == "string") {
                    var obj = arguments[0], propertyName = arguments[1];
                    context = obj;
                    fn = obj[propertyName];
                }
                //proxy(fn,context) 
                else if (arguments[1] && !SL.InstanceOf.Function(arguments[1])) {
                    context = arguments[1];
                    fn = arguments[0];
                }
            }
            else {
                fn = arguments[0];
            }
            context = context || SL;
            if (fn) {
                proxy = function () {
                    return fn.apply(context, arguments);
                }
            }
            //事件中有用到
            if (fn.guid) { proxy.guid = fn.guid; }
            return proxy;
        };
        /**
        *将表单元素数组或者对象序列化。
        *@name param
        *@memberOf sl
        *@function
        *@param obj
        *@example
        *var params = {width:100,height:100}
        *var str = sl.param(params);=>width=100&height=100
        */
        //把json转换成querying形式 比如{width:100,height:100}=>width=100&height=100
        this.param = function (a, traditional) {
            var s = [],
			add = function (key, value) {
			    value = sl.InstanceOf.Function(value) ? value() : value;
			    s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
			};

            //兼容1.32 jq
            if (traditional === undefined) {
                traditional = sl.ajaxSettting.traditional;
            }
            //serialize 中用到
            if (sl.InstanceOf.Array(a)) {
                sl.each(a, function () {
                    add(this.name, this.value);
                });
            }
            //选择器遍历元素
            else if (a.isChain && a.isChain(a)) {
                // Serialize the form elements
                sl.each(a.elements, function () {
                    add(this.name, this.value);
                });

            } else {
                for (var prefix in a) {
                    buildParams(prefix, a[prefix], traditional, add);
                }
            }
            return s.join("&").replace(r20, "+");
        };
        //统一get set属性访问器
        this.access = function (elems, key, value, getter, setter, bind, setReturn) {
            var length = elems.length;
            setter = typeof setter === "function" ? setter : getter;
            if (typeof key === "object") {
                for (var k in key) {            //为所有元素设置N个属性
                    for (var i = 0; i < length; i++) {
                        setter.call(bind || elems[i], elems[i], k, key[k]);
                    }
                }
                return setReturn || elems;
            }
            if (value !== void 0) {
                for (i = 0; i < length; i++) {
                    setter.call(bind || elems[i], elems[i], key, value);
                }
                return setReturn || elems;
            } //取得第一个元素的属性, getter的参数总是很小的
            return length ? getter.call(bind || elems[0], elems[0], key) : void 0;
        };
        /**
        *合并两个数组
        *@memberOf sl
        *@function
        *@name merge
        *@param first,second
        *@example
        *var params = {width:100,height:100}
        *var str = sl.param(params);=>width=100&height=100
        */
        this.merge = function (first, second) {
            var i = first.length, j = 0;

            if (typeof second.length === "number") {
                for (var l = second.length; j < l; j++) {
                    first[i++] = second[j];
                }
            } else {
                while (second[j] !== undefined) {
                    first[i++] = second[j++];
                }
            }

            first.length = i;

            return first;
        };
        /**
        *使用过滤函数过滤数组元素。
        *@memberOf sl
        *@function
        *@name grep
        *@param array 待过滤数组
        *@param callback 此函数将处理数组每个元素
        *@param invert (可选) 如果 "invert" 为 false 或为设置，则函数返回数组中由过滤函数返回 true 的元素，当"invert" 为 true，则返回过滤函数中返回 false 的元素集。
        *@example
        *sl.grep( [0,1,2], function(n,i){
        *  return n > 0;
        });
        */
        this.grep = function (arr, callback, inv) {
            var ret = [];
            for (var i = 0, length = arr.length; i < length; i++) {
                //若inv为true表示不满足callback条件 inv为false表示满足callback条件
                if (!inv !== !callback(arr[i], i)) {
                    ret.push(arr[i]);
                }
            }

            return ret;
        };
        /**
        *将一个数组中的元素转换到另一个数组中。
        *@memberOf sl
        *@function
        *@name map
        *@param array 待转换数组
        *@param callback 此函数将处理数组每个元素
        *@example
        *sl.map( [0,1,2], function(n){
        *  return n + 4;
        *   });
        */
        this.map = function (arr, callback, arg) {
            var ret = [], value;
            for (var i = 0, length = arr.length; i < length; i++) {
                value = callback(arr[i], i, arg);

                if (value != null) {
                    ret[ret.length] = value;
                }
            }

            return ret.concat.apply([], ret);
        };
        /**
        *动态执行js代码
        *@memberOf sl
        *@function
        *@name evelScript
        *@param sriptText js代码串
        */
        this.evalSript = function (sriptText) {
            if (sriptText && /\S/.test(sriptText)) {
                (window.execScript || function (sriptText) {
                    window["eval"].call(window, sriptText);
                })(sriptText);
            }
        }
    }).call(SL);

});

//类型转换
SL().create(function (SL) {
    var hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf;
    var SLConvert = function () {
        this.convertToArray = convertToArray;
    };
    function convertToArray(array, results) {
        var ret = results || [];
        if (array != null) {
            var type = sl.type(array);
            if (array.length == null || type === "string" || type === "function" || type === "regexp" || sl.InstanceOf.Window(array)) {
                push.call(ret, array);
            } else {
                sl.merge(ret, array);
            }
        }

        return ret;
    };
    SL.Convert = new SLConvert();

});
//判断页面加载
SL().create(function (SL) {
    //事件队列
    var contentLoadedEventList = [],
    //是否已经加载完
    isLoaded = false,
    //是否已经绑定 防止多次绑定事件
    isBinded = false,
    //事件
    DOMContentLoaded;
    if (document.addEventListener) {
        DOMContentLoaded = function () {
            document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
            fireLoadedEvents();
        };

    } else if (document.attachEvent) {
        DOMContentLoaded = function () {
            if (document.readyState === "complete") {
                document.detachEvent("onreadystatechange", DOMContentLoaded);
                fireLoadedEvents();
            }
        };
    }

    function ready(fn) {
        BindContentLoadedEvent();
        if (isLoaded) {
            fn.call(document);
        } else if (contentLoadedEventList) {
            contentLoadedEventList.push(fn);
        }
    }
    function BindContentLoadedEvent() {
        if (isBinded) {
            return;
        }
        isBinded = true;
        if (document.readyState === "complete") {
            return fireLoadedEvents();
        }
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
            window.addEventListener("load", fireLoadedEvents, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", DOMContentLoaded);
            window.attachEvent("onload", fireLoadedEvents);
            var toplevel = false;
            try {
                toplevel = window.frameElement == null;
            } catch (e) { }
            if (document.documentElement.doScroll && toplevel) {
                doScrollCheck();
            }
        }
    }
    function fireLoadedEvents() {
        if (!isLoaded) {
            if (!document.body) {
                return setTimeout(fireLoadedEvents, 13);
            }

            isLoaded = true;
            if (contentLoadedEventList) {
                var fn, i = 0;
                while ((fn = contentLoadedEventList[i++])) {
                    fn.call(document);
                }
                contentLoadedEventList = null;
            }
        }
    }
    function doScrollCheck() {
        if (isLoaded) {
            return;
        }
        try {
            // If IE is used, use the trick by Diego Perini
            // http://javascript.nwbox.com/IEContentLoaded/
            document.documentElement.doScroll("left");
        } catch (error) {
            setTimeout(doScrollCheck, 1);
            return;
        }
        fireLoadedEvents();
    }
    SL.ready = ready;
});

