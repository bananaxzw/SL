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
        tbody: !div.getElementsByTagName("tbody").length,
        optSelected: opt.selected,
        //某些浏览器 webkit没设置radio和checkbox的值时候value为空 而ie和FF为on 统一为on
        checkOn: (input.value === "on")
    };
    select.disabled = true;
    support.optDisabled = !opt.disabled;
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