/// <reference path="SL.Core.js" />
SL().create(function () {

    function operation() { }
    operation.prototype = {
        empty: function (elem) {
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
        },
        text: function (elem) {
            var i, node, nodeType = elem.nodeType, ret = "";
            if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                if (typeof elem.textContent === "string") {
                    return elem.textContent;
                } else {
                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                        ret += getText(elem);
                    }
                }
            } else if (nodeType === 3 || nodeType === 4) {
                return elem.nodeValue;
            }
        }

    }
});