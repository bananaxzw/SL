/// <reference path="SL.Core.js" />
SL().create(function (SL) {

    var SLSelect = function () { };
    SLSelect.prototype = {
        AddItem: function (select, text, value) {
            var varItem = new Option(objItemText, objItemValue);
            objSelect.options.add(varItem);
        },
        RemoveItem: function (select, value) {
            for (var i = 0; i < objSelect.options.length; i++) {
                if (objSelect.options[i].value == objItemValue) {
                    objSelect.options.remove(i);
                    break;
                }
            }
        },
        RemoveSelectItem: function (objSelect) {
            for (var i = length; i >= 0; i--) {
                if (objSelect[i].selected == true) {
                    objSelect.options[i] = null;
                }
            }
        },
        GetSelectIndex: function (objSelect) {
            return objSelect.selectedIndex
        },
        GetSelectText: function (objSelect) {
            return objSelect.options[document.all.objSelect.selectedIndex].text
        },
        RemoveAll: function (objSelect) {
            objSelect.options.length == 0;
        }

    };
    SL.Select = SL.Select || {};
    SL.Select = new SLSelect();

});
