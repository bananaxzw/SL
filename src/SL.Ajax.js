/// <reference path="SL.Core.js" />
/// <reference path="SL.Json.js" />
/**    
* SL (Javascript Extension Tools) 
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
***/

/**
*Ajax操作
*@namespace  Ajax操作
*@name ajax
*/
sl.create("sl", function (SL) {
    function now() {
        return (new Date()).getTime();
    };
    var jsc = now(),
    rscript = /<script(.|\s)*?\/script>/gi,
    rselectTextarea = /select|textarea/i,
    rinput = /color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,
    rGETHEAD = /^(?:GET|HEAD)/,
    //jsonp临时结尾
    jsre = /=\?(&|$)/,
    //querying
    rquery = /\?/,
    //时间戳
    rts = /(\?|&)_=.*?(&|$)/,
    //URL
    rurl = /^(\w+:)?\/\/([^\/?#]+)/,
    lastModified = {},
	etag = {};
    if (!window.XMLHttpRequest) {
        window.XMLHttpRequest = function () {
            var actives = ["Microsoft.XMLHTTP", "Msxml2.XMLHTTP"];
            for (var i = 0; i < actives.length; i++) {
                try {
                    var xmlhttprequest = new ActiveXObject(actives[i]);
                    return xmlhttprequest;
                } catch (oError) {
                }
            }

        }
    };

    /**
    *@ignore  事件处理
    */
    var oHandleEvent = {
        success: function (options, data, status, xhr) {
            options.success.call(options.callbackContext, data, status, xhr);
        },
        error: function (options, xhr, status, errorMsg) {
            options.error.call(options.callbackContext, xhr, status, errorMsg);
        },
        timeout: function (options, xhr, status) {
            options.onTimeout.call(options.callbackContext, xhr, status);
        },
        complete: function (options, xhr, status, data) {
            options.complete.call(options.callbackContext, xhr, status);
        }
    };
    /**
    *@ignore 一些版主 比如判断请求是否成功等等
    */
    var oAjaxHelper = {
        getData: function (xhr, type) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="xhr"></param>
            /// <param name="type">预期options的datatype</param>
            /// <returns type=""></returns>
            var ct = xhr.getResponseHeader("content-type"),
			xml = type === "xml" || !type && ct && ct.indexOf("xml") >= 0,
			data = xml ? xhr.responseXML : xhr.responseText;

            if (xml && data.documentElement.nodeName === "parsererror") {
                throw new Error("parsererror");
            }

            if (typeof data === "string") {
                //用户自定义返回json
                if (type === "json" || !type && ct.indexOf("json") >= 0) {
                    if (typeof sl.Josn === "object" && sl.Josn.parse) {
                        data = sl.Josn.parse(data);
                    } else {
                        data = (new Function("return " + data))();
                    }
                }
                else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
                    sl.evalSript(data);
                }
            }
            return data;

        },
        isRequestSuccess: function (xhr) {
            //IE error sometimes returns 1223 when it should be 204 so treat it as success
            try {
                return (!xhr.status && location.protocol == "file:")
                    || (xhr.status >= 200 && xhr.status < 300)
                    || xhr.status === 1223
                    || (xhr.status == 304)
                    || (navigator.userAgent.indexOf("Safari") > -1 && typeof xhr.status == "undefined");
            } catch (e) {

            }
            return false;

        },
        httpNotModified: function (xhr, url) {
            var _lastModified = xhr.getResponseHeader("Last-Modified"),
			_etag = xhr.getResponseHeader("Etag");

            if (_lastModified) {
                lastModified[url] = _lastModified;
            }

            if (_etag) {
                etag[url] = _etag;
            }

            // Opera returns 0 when status is 304
            return xhr.status === 304 || xhr.status === 0;
        },
        setRequestHeaders: function (xhr, option) {

        }
    };
    this.ajaxSettting = {
        type: "POST",
        data: null,
        processData: true, //格式化data 用query string形式表示
        //        dataType: "text",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        success: function () { },
        error: function () { },
        complete: function () { },
        onTimeout: function () { },
        async: true,
        timeout: 30000,
        url: "",
        cache: false,
        callbackContext: null,
        jsonp: "callback",
        accepts: {
            xml: "application/xml, text/xml",
            html: "text/html",
            script: "text/javascript, application/javascript",
            json: "application/json, text/javascript",
            text: "text/plain",
            _default: "*/*"
        }
    };
    /**
    *ajax请求
    *@memberOf ajax
    *@function
    *@name ajax
    *@param options  请求参数
    */
    this.ajax = function (options) {
        options = sl.extend(true, {}, sl.ajaxSettting, options);
        var isComplete = false, status, data, type = options.type.toUpperCase(),
        xhr = new window.XMLHttpRequest(), jsonp, callbackContext = options.callbackContext || options, noContent = rGETHEAD.test(type);
        //传进来的data没经过处理
        if (options.data && options.processData && typeof options.data != "string") {
            options.data = sl.param(options.data);
        }
        // 处理jsonp
        if (options.dataType === "jsonp") {
            if (type === "GET") {
                if (!jsre.test(options.url)) {
                    //把url 加上callback=?
                    options.url += (rquery.test(options.url) ? "&" : "?") + (options.jsonp || "callback") + "=?";
                }
            } else if (!options.data || !jsre.test(options.data)) {
                //data后面加callback=?
                options.data = (options.data ? options.data + "&" : "") + (options.jsonp || "callback") + "=?";
            }
            options.dataType = "json";
        }
        //json类型 并且包含callback=?可能要执行跨域操作
        if (options.dataType === "json" && (options.data && jsre.test(options.data) || jsre.test(options.url))) {
            jsonp = options.jsonpCallback || ("jsonp" + jsc++);
            // 把callback=?替换成callback=jsonp
            if (options.data) {
                options.data = (options.data + "").replace(jsre, "=" + jsonp + "$1");
            }
            options.url = options.url.replace(jsre, "=" + jsonp + "$1");
            //当做sript处理
            options.dataType = "script";
            // jsonp回调函数 也是成功的处理函数
            window[jsonp] = window[jsonp] || function (tmp) {
                data = tmp;
                oHandleEvent.success(options, data, status, xhr);
                oHandleEvent.complete(options, xhr, status, data);
                window[jsonp] = undefined;
                try {
                    delete window[jsonp];
                } catch (e) { }

                if (head) {
                    head.removeChild(script);
                }
            };
        }
        //cache (default: true, false for dataType 'script' and 'jsonp')
        if (options.dataType === "script" && options.cache === null) {
            options.cache = false;
        }
        //是否缓存 GET会有缓存危险 POST不会有 
        if (options.cache === false && noContent) {
            var ts = now();
            //如果已经有时间戳了 替换
            var ret = options.url.replace(rts, "$1_=" + ts + "$2");
            //判断是否有时间戳了 没有的话加上时间戳
            options.url = ret + ((ret === options.url) ? (rquery.test(options.url) ? "&" : "?") + "_=" + ts : "");
        }
        //GET 或者 head请求 附加data到url 
        if (options.data && noContent) {
            options.url += (rquery.test(options.url) ? "&" : "?") + options.data;
        }
        //判断是否跨域
        var parts = rurl.exec(options.url),
			remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);
        // jsonp操作 或者从异域加载js
        if (options.dataType === "script" && type === "GET" && remote) {
            var head = document.getElementsByTagName("head")[0] || document.documentElement;
            var script = document.createElement("script");
            script.src = options.url;
            if (options.scriptCharset) {
                script.charset = options.scriptCharset;
            }
            //请求sript并且不是jsonp  因为jsonp里面只有回调函数
            if (!jsonp) {
                var done = false;
                // 脚本下载完毕 执行
                script.onload = script.onreadystatechange = function () {
                    if (!done && (!this.readyState ||
							this.readyState === "loaded" || this.readyState === "complete")) {
                        done = true;
                        oHandleEvent.success(options, data, status, xhr);
                        oHandleEvent.complete(options, xhr, status, data);

                        // 防止内存泄露
                        script.onload = script.onreadystatechange = null;
                        if (head && script.parentNode) {
                            head.removeChild(script);
                        }
                    }
                };
            }
            //用insertBefore防止在ie6下head存在base节点时候的bug
            head.insertBefore(script, head.firstChild);
            return undefined;
        }
        xhr.open(options.type, options.url, options.async);

        try {
            if (options.data && options.contentType) {
                xhr.setRequestHeader("Content-Type", options.contentType);
            }
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            if (options.ifModified) {
                if (lastModified[s.url]) {
                    xhr.setRequestHeader("If-Modified-Since", lastModified[options.url]);
                }

                if (etag[options.url]) {
                    xhr.setRequestHeader("If-None-Match", etag[options.url]);
                }
            }

        } catch (e) { }

        var onreadystatechange = xhr.onreadystatechange = function (isTimeout) {
            //ajax请求被终止
            if (!xhr || xhr.readyState === 0 || isTimeout === "abort") {
                if (!isComplete) {
                    oHandleEvent.complete(s, xhr, status, data);
                }

                isComplete = true;
                if (xhr) {
                    xhr.onreadystatechange = function () { };
                }
            }
            else if (!isComplete && xhr && (xhr.readyState == 4 || isTimeout == "timeout")) {
                isComplete = true;
                xhr.onreadystatechange = function () { };
                status = isTimeout == "timeout" ? "timeout" :
                !oAjaxHelper.isRequestSuccess(xhr) ? "error" :
                options.ifModified && oAjaxHelper.httpNotModified(xhr, options.url) ? "notmodified" :
                "success";
                var errorMsg;
                if (status == "success" || status === "notmodified") {
                    try {
                        data = oAjaxHelper.getData(xhr, options.dataType);
                    } catch (e) {
                        status = "parsererror";
                        errorMsg = e;

                    }
                }

                if (status == "success" || status === "notmodified") {
                    // 因为jsonp里面只有回调函数
                    if (!jsonp) {
                        oHandleEvent.success(options, data, status, xhr);
                    }

                } else if (status == "timeout") {
                    oHandleEvent.timeout(options, xhr, status);
                } else {
                    oHandleEvent.error(options, xhr, status, errorMsg);
                }
                // Fire the complete handlers
                if (!jsonp) {
                    oHandleEvent.complete(options, xhr, status, data);
                }
                // 防止内存泄露
                if (options.async)
                    xhr = null;
            }

        };

        // 重写abort ie6支持
        // Opera不能触发onreadystatechange在abort触发
        try {
            var oldAbort = xhr.abort;
            xhr.abort = function () {
                if (xhr) {
                    //ie7的abort没有call属性
                    Function.prototype.call.call(oldAbort, xhr);
                }

                onreadystatechange("abort");
            };
        } catch (abortError) { }
        //异步操作 超时判断
        if (options.async && options.timeout > 0) {
            setTimeout(function () {
                if (xhr) {
                    if (!isComplete) {
                        onreadystatechange("timeout");
                    }
                    xhr.abort();
                }

            }, options.timeout);

        }

        try {
            xhr.send(noContent || options.data == null ? null : options.data);
        } catch (e) {

        }
        // firefox 1.5 doesn't fire statechange for sync requests
        if (!options.async) {
            onreadystatechange();
        }
        return xhr;
    };

    /**
    *ajax请求GET方式
    *@memberOf ajax
    *@function
    *@name get
    *@param url 请求地址
    *@param data 发送的数据
    *@param callback 成功的回调函数
    *@param datatype 预期返回的类型
    */

    /**
    *ajax请求POST方式
    *@memberOf ajax
    *@function
    *@name post
    *@param url 请求地址
    *@param data 发送的数据
    *@param callback 成功的回调函数
    *@param datatype 预期返回的类型
    */
    sl.each(["get", "post"], function (i, _type) {
        sl[_type] = function (url, data, callback, dataType) {
            // 没有data只有回调函数
            if (sl.InstanceOf.Function(data)) {
                dataType = dataType || callback;
                callback = data;
                data = null;
            }

            return sl.ajax({
                type: _type,
                url: url,
                data: data,
                success: callback,
                dataType: dataType
            });
        };
    });

    /**
    *请求script
    *@memberOf ajax
    *@function
    *@name getScript
    *@param url 请求地址
    *@param data 数据
    *@param callback 成功的回调函数
    */
    this.getScript = function (url, data, callback) {
        return sl.get(url, data, callback, "script");
    };
    /**
    *请求json
    *@memberOf ajax
    *@function
    *@name getJSON
    *@param url 请求地址
    *@param data 数据
    *@param callback 成功的回调函数
    */
    this.getJSON = function (url, data, callback) {
        return sl.get(url, data, callback, "json");
    };
    /**
    *请求jsopp(跨域操作)
    *@memberOf ajax
    *@function
    *@name post
    *@param url 请求地址
    *@param data 请求地址
    *@param callback 成功的回调函数
    */
    this.getJSONP = function (url, data, callback) {
        return sl.get(url, data, callback, "jsonp");
    };
    /**
    *请求全局设置参数
    *@memberOf ajax
    *@function
    *@name ajaxSetup
    *@param setting 参数
    */
    this.ajaxSetup = function (setting) {
        sl.extend(sl.ajaxSettting, setting);
    };

});

   
