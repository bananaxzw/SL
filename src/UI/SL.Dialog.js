/// <reference path="../sl.js" />
/// <reference path="../SL.Node.js" />
/// <reference path="SL.Mask.js" />
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
    var Defaults = {
        title: "",
        footer: "",
        message: "",
        showTitle: true,
        showFooter: true,
        zIndex: 1000,
        showClose: true,
        autoShow: false,
        centerX: true,
        centerY: true,
        showOverlay: true,
        overlayCSS: {
            backgroundColor: '#000',
            opacity: 50
        },
        dialogCSS: {}
    };
    this.dialog = sl.Class({
        init: function (elem, options) {

            var full, ie6 = sl.Browser.ie == 6.0, options = sl.extend({}, Defaults, options);
            if (sl.InstanceOf.BodyOrHtmlOrWindow(elem)) {
                this.elem = /body/i.test(elem.nodeName) ? elem : (elem.body || elem.document.body);
                full = true; //window或者document为true
            }
            else {
                this.elem = elem;
                full = false; //window或者document为true
                //如果不是full的话 元素要设置position=relative 这样是为了方便遮罩层top:0 width100% left:0 height100%
                //遮盖元素
                if (sl.css(this.elem, 'position') == 'static')
                    this.elem.style.position = 'relative';
            }
            sl.data(this.elem, "sldialog", { options: options, ie6: ie6, full: full, container: this.elem });
            DialogHelper.createMask(this.elem);
            DialogHelper.wrapDialog(this.elem);
            DialogHelper.setDialogStyle(this.elem);
            if (!options.autoShow) {
                this.close();
            }
        },
        close: function () {
            DialogHelper.close(this.elem);
        },
        open: function () {
            DialogHelper.open(this.elem);
        }

    });
    var DialogHelper = {

        close: function (elem) {
            var dialogData = sl.data(elem, "sldialog");
            dialogData.$dialog.hide();
            if (dialogData.mask) {
                dialogData.mask.hideMask();
            }
        },
        open: function (elem) {
            var dialogData = sl.data(elem, "sldialog");
            dialogData.$dialog.show();
            if (dialogData.mask) {
                dialogData.mask.showMask();
            }
        },
        wrapDialog: function (elem) {
            var dialogData = sl.data(elem, "sldialog");
            var opts = dialogData.options, $dialog = slChain("<div id='SLDialog' class='SLDialog' style='display:block;position:" + (dialogData.full ? 'fixed' : 'absolute') + ";z-index:" + (opts.zIndex + 2) + ";margin: 0px;'></div>"),
        dialogContent = slChain('<div class="Dialog_content"></div>');
            if (opts.showTitle) {
                var dialogTitle = slChain('<div class="Dialog_title" id="Dialog_title" style="cursor: move;"><h4 style="float:left;display:inline-block;margin:0;">' + opts.title + '</h4></div>');
                if (opts.showClose) {
                    var closeBtn = slChain('<a href="javascript:void(0)" title="关闭窗口" class="close_btn" id="slCloseBtn">×</a>');
                    closeBtn.click(function () {
                        DialogHelper.close(elem);
                    });
                    dialogTitle.prepend(closeBtn);
                }

                dialogContent.append(dialogTitle);
                dialogContent.append("<div class='line'/>");
            }
            var dialogMessage = slChain('<div class="Dialog_message">' + opts.message + '</div>');
            dialogContent.append(dialogMessage);
            if (opts.showFooter) {
                dialogContent.append("<div class='line'/>");
                var dialogFooter = slChain('<div class="Dialog_footer">' + opts.footer + '</div>');
                dialogContent.append(dialogFooter);
            }
            $dialog.append(dialogContent);
            slChain(elem).append($dialog);
            dialogData.$dialog = $dialog;
        },
        createMask: function (elem) {
            var dialogData = sl.data(elem, "sldialog"), opts = dialogData.options;
            dialogData.mask = null;
            if (opts.showOverlay) {
                var mask = new sl.ui.masker(dialogData.container, { baseZ: opts.zIndex++, overlayCSS: opts.overlayCSS });
                dialogData.mask = mask;
            }

        },
        setDialogStyle: function (elem) {
            var dialogData = sl.data(elem, "sldialog");
            var $dialog = dialogData.$dialog, opts = dialogData.options, full = dialogData.full;
            //IE6的话 可以采用setExpression来居中消息   其他的可以采用fiexed属性来居中
            if (sl.Browser.ie == 6.0 && full) {
                $dialog.css("position", 'absolute');
                $dialog.get(0).style.setExpression('top', '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (document.documentElement.scrollTop||document.body.scrollTop) + "px"');
                $dialog.get(0).style.setExpression('left', '(document.documentElement.clientWidth || document.body.clientWidth) / 2 - (this.offsetWidth / 2) + (document.documentElement.scrollLeft||document.body.scrollLeft) + "px"');
            }
            else if (full) {
                $dialog.addClass('Dialogfull');
            }
            else {
                StyleHelper.center($dialog.get(0), opts.centerX, opts.centerY);
            }


        }
    };
    var StyleHelper = {
        /*
        *@description 让对象在父元素中居中
        *@param  {el} 要居中的对象
        *@param {x} 是否X方向居中
        *@param {Y} 是否Y方向居中
        */
        center: function (el, x, y) {
            if (!x && !y) return;
            var p = el.parentNode, s = el.style;
            var $p = slChain(p);
            var borderAndPaddingWidth, borderAndPaddingHeight;

            if (sl.Support.boxModel) {
                borderAndPaddingWidth = $p.outerWidth() - $p.width();
                borderAndPaddingHeight = $p.outerHeight() - $p.height();
            }
            var l, t;
            if (sl.Support.boxModel) {
                l = ((p.offsetWidth - el.offsetWidth) / 2) - (borderAndPaddingWidth / 2);
                t = ((p.offsetHeight - el.offsetHeight) / 2) - (borderAndPaddingHeight / 2);

            }
            else {
                l = (p.offsetWidth - el.offsetWidth) / 2;
                t = (p.offsetHeight - el.offsetHeight) / 2;
            }
            if (x) s.left = l > 0 ? (l + 'px') : '0';
            if (y) s.top = t > 0 ? (t + 'px') : '0';
        }

    };
});