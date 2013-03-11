/// <reference path="SL.Core.js" />
/// <reference path="SL.Json.js" />

SL().create(function (SL) {
    // var uu = new SL();
    function now() {
        return (new Date).getTime();
    }
    var jsc = now(),
    rscript = /<script(.|\s)*?\/script>/gi,
    rselectTextarea = /select|textarea/i,
    rinput = /color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,
    //jsonp临时结尾
    jsre = /=\?(&|$)/,
    //querying
    rquery = /\?/,
    //时间戳
    rts = /(\?|&)_=.*?(&|$)/,
    //URL
    rurl = /^(\w+:)?\/\/([^\/?#]+)/,
    r20 = /%20/g,
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
        success: function (options, data, xhr) {
            options.onSuccess.call(options.callbackContext, data, xhr);
        },
        error: function (options, status, xhr) {
            options.onError.call(options.callbackContext, status, xhr);
        },
        timeout: function (options, status, xhr) {
            options.onTimeout.call(options.callbackContext, status, xhr);
        }
    }
    /**
    *@ignore 一些版主 比如判断请求是否成功等等
    */
    var oAjaxHelper = {
        getData: function (xhr, type) {

            var ct = xhr.getResponseHeader("content-type"),
			xml = type === "xml" || !type && ct && ct.indexOf("xml") >= 0,
			data = xml ? xhr.responseXML : xhr.responseText;

            if (xml && data.documentElement.nodeName === "parsererror") {
                throw "parsererror";
            }

            if (typeof data === "string") {
                //用户自定义返回json
                if (type === "json") {
                    if (typeof SL.Josn === "object" && SL.Josn.parse) {
                        data = SL.Josn.parse(data);
                    } else {
                        data = (new Function("return " + data))();
                    }
                }
            }
            return data;

        },
        isRequestSuccess: function (xhr) {
            try {
                return (!xhr.status && location.protocol == "file:")
                    || (xhr.status >= 200 && xhr.status < 300)
                    || (xhr.status == 304)
                    || (navigator.userAgent.indexOf("Safari") > -1 && typeof xhr.status == "undefined");
            } catch (e) {

            }
            return false;

        },
        httpNotModified: function (xhr, url) {
            var lastModified = xhr.getResponseHeader("Last-Modified"),
			etag = xhr.getResponseHeader("Etag");

            if (lastModified) {
                lastModified[url] = lastModified;
            }

            if (etag) {
                etag[url] = etag;
            }

            // Opera returns 0 when status is 304
            return xhr.status === 304 || xhr.status === 0;
        }
    }
    var defaultSetting = {
        type: "POST",
        data: null,
        dataType: "text",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        onSuccess: function () { },
        onError: function () { },
        onComplete: function () { },
        onTimeout: function () { },
        isAsync: true,
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
    }
    function ajax(options) {
        options = SL.extend(true, {}, defaultSetting, options);
        var isComplete = false, status,
        xhr = new window.XMLHttpRequest(), jsonp, callbackContext = options.callbackContext || options;
        //传进来的data没经过处理
        if (options.data && typeof options.data != "string") {
            options.data = SL.param(options.data);
        }
        // 处理jsonp
        if (options.dataType === "jsonp") {
            if (type === "GET") {
                if (!jsre.test(options.url)) {
                    //把url 加上callback=?
                    options.url += (rquery.test(options.url) ? "&" : "?") + (options.jsonp || "callback") + "=?";
                }
            } else if (!options.data || !jsre.test(options.data)) {
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
            // jsonp回调函数
            window[jsonp] = window[jsonp] || function (tmp) {
                data = tmp;
                options.onSuccess(data, xhr);
                window[jsonp] = undefined;
                try {
                    delete window[jsonp];
                } catch (e) { }

                if (head) {
                    head.removeChild(script);
                }
            };
        }
        if (options.dataType === "script" && options.cache === null) {
            options.cache = false;
        }
        //是否缓存 GET会有缓存危险 POST不会有 
        if (options.cache === false && options.type === "GET") {
            var ts = now();
            //如果已经有时间戳了 替换
            var ret = options.url.replace(rts, "$1_=" + ts + "$2");
            //判断是否有时间戳了 没有的话加上时间戳
            options.url = ret + ((ret === options.url) ? (rquery.test(options.url) ? "&" : "?") + "_=" + ts : "");
        }
        //GET附加data到url 
        if (options.data && options.type === "GET") {
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
            if (!jsonp) {
                var done = false;
                // 脚本下载完毕 执行
                script.onload = script.onreadystatechange = function () {
                    if (!done && (!this.readyState ||
							this.readyState === "loaded" || this.readyState === "complete")) {
                        done = true;
                        oHandleEvent.success(options, "", xhr);

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
        xhr.open(options.type, options.url, options.isAsync);

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
            if (xhr.readyState == 0) {
                if (intervalState) {
                    clearInterval(intervalState);
                    intervalState = null;
                }
            }
            else if (!isComplete && xhr && (xhr.readyState == 4 || isTimeout == "timeout")) {
                isComplete = true;
                if (intervalState) {
                    clearInterval(intervalState);
                    intervalState = null;
                }

                status = isTimeout == "timeout" ? "timeout" :
                !oAjaxHelper.isRequestSuccess(xhr) ? "error" :
                options.ifModified && oAjaxHelper.httpNotModified(xhr, options.url) ? "notmodified" :
                "success";
                if (status == "success" || status === "notmodified") {
                    try {
                        data = oAjaxHelper.getData(xhr, options.dataType);
                    } catch (e) {
                        status = "parsererror";
                    }
                }
                if (status == "success") {
                    oHandleEvent.success(options, data, xhr);

                } else if (status == "timeout") {
                    oHandleEvent.timeout(options, status, xhr);
                } else {
                    oHandleEvent.error(options, status, xhr);
                }

                // 防止内存泄露
                if (options.async)
                    xhr = null;
            }

        };
        //异步操作 超时判断
        if (options.isAsync) {
            var intervalState = setInterval(onreadystatechange, 10);
            //超时判断
            if (options.timeout > 0) {
                setTimeout(function () {
                    if (xhr) {
                        if (!isComplete) {
                            onreadystatechange("timeout");
                        }
                        xhr.abort();
                    }

                }, options.timeout);
            }
        }

        try {
            xhr.send(options.type === "POST" ? options.data : null);
        } catch (e) {

        }
        return xhr;
    };
    SL.Ajax = function (options) {
        ajax(options);
    }

});
