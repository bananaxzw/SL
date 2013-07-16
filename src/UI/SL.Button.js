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
    var opts;
    var defaults = {
        id: null,
        disabled: false,
        plain: false,
        text: '',
        iconCls: null
    };
    function createButton(target) {
        var opts = sl.data(target, 'slbutton').options;
        slChain(target).empty();
        slChain(target).addClass('l-btn');
        if (opts.id) {
            slChain(target).attr('id', opts.id);
        } else {
            slChain(target).removeAttr('id');
        }
        if (opts.plain) {
            slChain(target).addClass('l-btn-plain');
        } else {
            slChain(target).removeClass('l-btn-plain');
        }
        if (opts.text) {
            slChain(target).html('<span class="l-btn-left"><span class="l-btn-text">' + opts.text + '</span></span>');
            if (opts.iconCls) {
                slChain(target).find('.l-btn-text').addClass(opts.iconCls).css('padding-left', '20px');
            }
        }
        else {
            slChain(target).html('<span class="l-btn-left"><span class="l-btn-text"><span class="l-btn-empty">&nbsp;</span></span></span>');

            if (opts.iconCls) {
                slChain(target).find('.l-btn-empty').addClass(opts.iconCls);
            }
        }
        setDisabled(target, opts.disabled);
    };
    function setDisabled(target, disabled) {
        var state = sl.data(target, 'slbutton');
        if (disabled) {
            state.options.disabled = true;
            var href = slChain(target).attr('href');
            if (href) {
                state.href = href;
                slChain(target).attr('href', 'javascript:void(0)');
            }
            var onclick = slChain(target).attr('onclick');
            if (onclick) {
                state.onclick = onclick;
                slChain(target).attr('onclick', null);
            }
            slChain(target).addClass('l-btn-disabled');
        }
        else {
            state.options.disabled = false;
            if (state.href) {
                slChain(target).attr('href', state.href);
            }
            if (state.onclick) {
                target.onclick = state.onclick;
            }
            slChain(target).removeClass('l-btn-disabled');
        }
    };
    this.button = sl.Class({
        init: function (elem, options) {
            var state = sl.data(elem, 'slbutton');
            if (state) {
                sl.extend(state.options, options);
            }
            else {
                var t = slChain(elem);
                sl.data(elem, 'slbutton', {
                    options: sl.extend({}, defaults, {
                        id: t.attr('id'),
                        disabled: (t.attr('disabled') ? true : undefined),
                        plain: (t.attr('plain') ? t.attr('plain') == 'true' : undefined),
                        text: sl.String.trim(t.html()),
                        iconCls: t.attr('icon')
                    }, options)
                });
                t.removeAttr('disabled');
            }

            createButton(elem);
        }

    });

});