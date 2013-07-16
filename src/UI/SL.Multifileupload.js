/// <reference path="../sl.js" />
/// <reference path="../SL.Node.js" />

/********************************************************************************************
* 文件名称:	
* 设计人员:	许志伟 
* 设计时间:	
* 功能描述:	
* 注意事项：
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*
********************************************************************************************/
sl.create("sl.ui", function () {
    var defaults = { min: 1, source: [], selected: function (event, item) { }, dynamicSource: false, ajaxOption: { url: "", extendData: {} }, AutoInput: true, MenuHideAuto: true };

    function getFileName(str1) {
        var regstr = /\\/,
        regresult = new RegExp(regstr),
        parts = str1.split(regresult),
        fileName = parts[parts.length - 1];
        return fileName.split('.');
    };
    function checkExsit(name) {
        var s = false;
        slChain("span.fileName", slChain("ul.addfj_new")).each(function () {
            if (slChain(this).text() == name) {
                s = true;
                return false;
            }
        });
        return s;
    };


    var eventHelper = {
        addFile: function (input_file) {
            var filePath = slChain(input_file).val(), fileName = getFileName(filePath).join(".");
            if (checkExsit(fileName)) {
                alert("文件" + fileName + "已经存在");
                return;
            }
            var $s = slChain("<li><span class='icon_addfj'></span><span class='fileName'>" + fileName + "</span>&nbsp;&nbsp;<span class='file_delete'><a href='javascript:void(0);'>删除</a></span></li>");
            slChain("ul.addfj_new").append($s);
            input_file.name = "filedata";
            $s.append(input_file);
        },
        changeEvent: function (input) {
            var input_container = slChain(input).parent();
            eventHelper.addFile(input);
            var $input_temp = slChain("<input class='addfile' type='file' size='1'/>");
            input_container.append($input_temp);
            $input_temp.change(function () {
                eventHelper.changeEvent(this);
            });
            input = null;
        }
    };

    this.mutifileuploader = sl.Class({
        init: function (elem, options) {
            //文件选择
            slChain("input.addfile").change(function () {
                eventHelper.changeEvent(this);
            });
            //删除事件
            slChain("ul.addfj_new").delegate("span.file_delete", "click", function () {
                slChain(this).parent().remove();
            });
        }
    });

});