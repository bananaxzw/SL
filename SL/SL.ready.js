/// <reference path="SL.Core.js" />
SL().create(function () {
    var uu = new SL();
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

            fireLoadedEvents = true;
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
    window.ready = ready;
});
