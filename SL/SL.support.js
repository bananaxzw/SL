/// <reference path="SL.Core.js" />

SL().create(function (SL) {
    var support,
    		all,
    		a,
    		select,
    		opt,
    		input,
    		fragment,
    		eventName,
    		i,
    		isSupported,
    		div = document.createElement("div");

    div.setAttribute("className", "t");
    div.innerHTML = "  <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.5;'>a</a><input type='checkbox'/>";

    all = div.getElementsByTagName("*");
    a = div.getElementsByTagName("a")[0];

    //        if (!all || !all.length || !a) {
    //            return;
    //       }

    select = document.createElement("select");
    opt = select.appendChild(document.createElement("option"));
    input = div.getElementsByTagName("input")[0];
    support = {
        leadingWhitespace: (div.firstChild.nodeType === 3),
        tbody: !div.getElementsByTagName("tbody").length
    }
    sl.ready(function () {
        var div = document.createElement("div");
        div.style.width = "1px";
        div.style.paddingLeft = "1px";

        document.body.appendChild(div);
        support.boxModel = div.offsetWidth === 2;
        document.body.removeChild(div);
    });

    SL.Support = support;
});