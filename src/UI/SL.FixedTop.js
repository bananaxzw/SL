/// <reference path="../sl.js" />
/// <reference path="../SL.Node.js" />
sl.create("sl.ui", function () {


    this.fixedtop = sl.Class({
        init: function (elem, options) {
            this.fixed = false;
            var $elem = $(elem), initialPostion = $elem.css("position"), initialTop = $elem.css("top"), initialleft = $elem.css("left");
            $elem.data("sl.ui.fixedtop", { initialPostion: initialPostion, initialTop: initialTop, initialleft: initialleft, options: options });
            this.elem = elem;
            this.set();


        },
        set: function () {
            if (this.fixed) return;
            this.fixed = true;
            var $elem = $(this.elem), options = $elem.data("sl.ui.fixedtop").options, top = options.top || 0, left = options.left || 0
            if (sl.Browser.ie == 6.0) {
                $elem.css("position", 'absolute');
                $elem.elements[0].style.setExpression('top', '(document.documentElement.scrollTop||document.body.scrollTop)+' + top + ' + "px"');
                $elem.elements[0].style.setExpression('left', '(document.documentElement.scrollLeft||document.body.scrollLeft)+' + left + ' + "px"');
            }
            else {
                $elem.css({ position: 'fixed', top: top, left: left });
            }
        },
        reset: function () {
            this.fixed = false;
            var $elem = $(this.elem), options = $elem.data("sl.ui.fixedtop");
            $elem.css({ position: options.initialPostion, top: options.initialTop, left: options.initialleft });

        }

    });
});