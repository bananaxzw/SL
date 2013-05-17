/// <reference path="SL.Core.js" />
/// <reference path="SL.Data.js" />
/// <reference path="SL.CSS.js" />
/// <reference path="SL.Queue.js" />

(function (win, doc) {
    var easyAnim = function (elem) {
        elem = typeof elem === 'string' ? doc.getElementById(elem) : elem;
        return new AnimExtend(elem);
    },

	pow = Math.pow,
	sin = Math.sin,
	PI = Math.PI,
	BACK_CONST = 1.70158,
    rfxnum = /^([+-]=)?([\d+-.]+)(.*)$/;

    var Easing = {
        // 匀速运动
        linear: function (t) {
            return t;
        },

        easeIn: function (t) {
            return t * t;
        },

        easeOut: function (t) {
            return (2 - t) * t;
        },

        easeBoth: function (t) {
            return (t *= 2) < 1 ?
			.5 * t * t :
			.5 * (1 - (--t) * (t - 2));
        },

        easeInStrong: function (t) {
            return t * t * t * t;
        },

        easeOutStrong: function (t) {
            return 1 - (--t) * t * t * t;
        },

        easeBothStrong: function (t) {
            return (t *= 2) < 1 ?
			.5 * t * t * t * t :
			.5 * (2 - (t -= 2) * t * t * t);
        },

        easeOutQuart: function (t) {
            return -(pow((t - 1), 4) - 1)
        },

        easeInOutExpo: function (t) {
            if (t === 0) return 0;
            if (t === 1) return 1;
            if ((t /= 0.5) < 1) return 0.5 * pow(2, 10 * (t - 1));
            return 0.5 * (-pow(2, -10 * --t) + 2);
        },

        easeOutExpo: function (t) {
            return (t === 1) ? 1 : -pow(2, -10 * t) + 1;
        },

        swingFrom: function (t) {
            return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
        },

        swingTo: function (t) {
            return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
        },

        backIn: function (t) {
            if (t === 1) t -= .001;
            return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
        },

        backOut: function (t) {
            return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
        },

        bounce: function (t) {
            var s = 7.5625, r;

            if (t < (1 / 2.75)) {
                r = s * t * t;
            }
            else if (t < (2 / 2.75)) {
                r = s * (t -= (1.5 / 2.75)) * t + .75;
            }
            else if (t < (2.5 / 2.75)) {
                r = s * (t -= (2.25 / 2.75)) * t + .9375;
            }
            else {
                r = s * (t -= (2.625 / 2.75)) * t + .984375;
            }

            return r;
        }
    };

    var tweenFn = function (sv, tv, tu, e) {
        if (isNaN(sv) && isNaN(tv)) {
            var r = (sv.r + (tv.r - sv.r) * e).toFixed(0),
						g = (sv.g + (tv.g - sv.g) * e).toFixed(0),
						b = (sv.b + (tv.b - sv.b) * e).toFixed(0);

            return 'rgb(' + r + ',' + g + ',' + b + ')';
        } else {
            return (sv + (tv - sv) * e).toFixed(7) + tu;
        }

    };

    var animBase = {
        // 解析颜色值
        // @param { String } 颜色值
        // @return { Object } RGB颜色值组成的对象
        // red : object.r, green : object.g, blue : object.b
        parseColor: function (val) {
            var r, g, b;
            if (/rgb/.test(val)) {
                var arr = val.match(/\d+/g);
                r = arr[0];
                g = arr[1];
                b = arr[2];
            }
            else if (/#/.test(val)) {
                var len = val.length;
                if (len === 7) {
                    r = parseInt(val.slice(1, 3), 16);
                    g = parseInt(val.slice(3, 5), 16);
                    b = parseInt(val.slice(5), 16);
                }
                else if (len === 4) {
                    r = parseInt(val.charAt(1) + val.charAt(1), 16);
                    g = parseInt(val.charAt(2) + val.charAt(2), 16);
                    b = parseInt(val.charAt(3) + val.charAt(3), 16);
                }
            }
            else {
                return val;
            }
            return {
                r: parseFloat(r),
                g: parseFloat(g),
                b: parseFloat(b)
            }
        },
        // 解析CSS属性值
        // @param { String } CSS属性
        // @return { Object } object.val为CSS属性值 object.unit为CSS属性单位
        parseStyle: function (prop) {
            var parts = rfxnum.exec(prop),
             val = parseFloat(parts[2]),
			 unit = parts[3] || "px";
            //颜色
            return isNaN(val) ? {
                val: this.parseColor(unit),
                unit: ''
            } : {
                val: val,
                unit: unit
            }
        },
        // 预定义速度
        speed: {
            slow: 600,
            fast: 200,
            defaults: 400
        },

        // 预定义的动画
        // @param { String } 动画类型(show/hide)
        // @param { Number } 数组index，0为slide，1为fade
        // @return { Object } object.props为CSS属性数组，object.type为动画类型(show/hide)
        fxAttrs: function (type, index) {
            var attrs = [
            ['width', 'height', 'opacity', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
			['height', 'padding-top', 'padding-bottom', 'border-top-width', 'border-bottom-width'],
			['opacity']
		];
            return {
                attrs: attrs[index],
                type: type
            }
        },

        // 将动画参数存储到一个新对象中
        // @param { Object } DOM对象
        // @param { String & Number } 动画持续时间
        // @param { String & Function } tween算法
        // @param { Function } 回调函数
        // @return { Object } 参数的集合对象
        setOptions: function (elem, duration, easing, callback) {
            var self = this,
			options = {};
            options.duration = (function (d) {
                if (typeof d === 'number') {
                    return d;
                }
                else if (typeof d === 'string' && self.speed[d]) {
                    return self.speed[d];
                }
                else if (!d) {
                    return self.speed.defaults;
                }
            })(duration);

            options.easing = (function (e) {
                if (typeof e === 'string' && Easing[e]) {
                    return Easing[e];
                }
                else if (typeof e === 'function') {
                    return e;
                }
                else {
                    return Easing.easeBoth;
                }
            })(easing);
            // 回调函数包含了队列
            options.callback = function () {
                if (typeof callback === 'function') {
                    callback();
                }
                self.dequeue(elem);
            };

            return options;
        },

        // 初始化动画属性
        // @param { Object } DOM对象
        // @param { Object } CSS动画属性和属性值
        // @param { String } 动画类型
        // @return { Object } 处理好的CSS动画属性和属性值
        setProps: function (elem, props, type) {
            if (type) {
                var attrs = props().attrs,
				type = props().type,
				val, obj = {}, p;
                if (type === 'hide') {
                    sl.each(attrs, function (index, name) {
                        obj[name] = name == "opacity" ? 0 : "0px";
                    });
                }
                if (type === 'show') {
                    sl.each(attrs, function (index, name) {
                        obj[name] = sl.css(elem, name);
                    });
                }

                return obj;
            }
            else if (props && typeof props === 'object') {
                return props;
            }
        },
        /*将单个的动画都添加到一个队列数组中，
        始终取0索引的队列函数来执行，
        执行的时候给该队列数组添加一个’running’标志在数组的0索引位置，
        无该标志就是第一次运行该队列，有该标志就表示该队列正在运行，
        这样可以保证在队列运行的状态也可以添加新的队列成员，*/
        // 将数据添加到队列中
        queue: function (elem, data) {
            if (!elem) {
                return;
            }
            var q = sl.data(elem, "fx");
            if (!data) {
                return;
            }
            if (!q || sl.InstanceOf.Array(data)) {
                q = sl.data(elem, "fx", sl.Convert.convertToArray(data));
            } else {
                q.push(data);
            }
            if (q[0] !== "runing") {
                this.dequeue(elem, "fx");
            }

        },

        // 取出队列中的数据并执行
        dequeue: function (elem) {
            var self = this,
			animQueue = sl.data(elem, "fx");
            if (!animQueue || !animQueue.length) return;
            fn = animQueue.shift();

            if (fn === 'runing') {
                fn = animQueue.shift();
            }

            if (fn) {
                animQueue.unshift('runing');
                //delay
                if (typeof fn === 'number') {
                    win.setTimeout(function () {
                        self.dequeue(elem);
                    }, fn);
                }
                else if (typeof fn === 'function') {
                    fn.call(elem, function () {
                        self.dequeue(elem);
                    });
                }
            }
            // 无队列时清除相关的缓存
            if (!animQueue.length) {
                sl.removeData(elem, "fx");
            }
        }

    };

    var AnimCore = function (elem, options, props, type) {
        this.elem = elem;
        this.options = options;
        this.props = props;
        this.type = type;
    }

    AnimCore.prototype = {
        start: function (source, target) {
            this.startTime = +new Date();
            this.elem.currentAnim = this;
            this.source = source;
            this.target = target;
            var self = this;
            if (self.elem.timer) return;
            self.elem.timer = win.setInterval(function () {
                self.run();
            }, 13);
        },

        run: function (end) {
            var elem = this.elem,
			type = this.type,
			props = this.props,
			startTime = this.startTime, // 动画开始的时间
			elapsedTime = +new Date(), // 当前帧的时间			
			duration = this.options.duration,
			endTime = startTime + duration,  // 动画结束的时间
			t = elapsedTime > endTime ? 1 : (elapsedTime - startTime) / duration,
			e = this.options.easing(t),
			len = 0,
			i = 0,
			p;

            // 计算props对象有多少个属性
            for (p in props) {
                len += 1;
            }
            elem.style.overflow = 'hidden';
            if (type === 'show') {
                elem.style.display = 'block';
            }

            for (p in props) {
                i += 1;
                //sv初始值 tv结束值 tu单位
                var sv = this.source[p].val,
				tv = this.target[p].val,
				tu = this.target[p].unit;

                // 结束动画并还原样式
                if (end || elapsedTime >= endTime) {
                    elem.style.overflow = '';
                    if (type === 'hide') {
                        elem.style.display = 'none';
                    }
                    if (type) {
                        if (p === 'opacity') {
                            sl.css(elem, 'opacity', 100);
                        }
                        else {
                            //elem.style[p] = ""; //(type === 'hide' ? sv : tv) + tu;
                            //貌似这种还原样式更可靠轻松
                            sl.css(elem, p,"");// (type === 'hide' ? sv : tv) + tu);
                        }
                    }
                    else {
                        elem.style[p] = /color/i.test(p) ?
						'rgb(' + tv.r + ',' + tv.g + ',' + tv.b + ')' :
						tv + tu;
                    }
                    if (i === len) {  // 判断是否为最后一个属性
                        this.complete();
                        this.options.callback.call(elem);
                    }
                }
                else {
                    if (sv === tv) continue;
                    // sl.css(elem, p, this.target[p].fn(sv, tv, tu, e));
                    sl.css(elem, p, tweenFn(sv, tv, tu, e));
                }

            }

        },
        stop: function () {
            win.clearInterval(this.elem.timer);
            this.elem.timer = undefined;
        },

        complete: function () {
            win.clearInterval(this.elem.timer);
            this.elem.timer = undefined;
            this.elem.currentAnim = undefined;
        }

    };

    var AnimExtend = function (elem) {
        this.elem = elem;
    };

    AnimExtend.prototype = {

        custom: function (props, duration, easing, callback) {
            var elem = this.elem,
			options = animBase.setOptions(elem, duration, easing, callback),
			type = typeof props === 'function' ? props().type : null;

            props = animBase.setProps(elem, props, type);

            animBase.queue(elem, function () {
                var source = {}, target = {}, p;
                for (p in props) {
                    if (type === 'show') {
                        // 将CSS重置为0
                        if (p === 'opacity') {
                            sl.css(elem, 'opacity', 0);
                        }
                        else {
                            elem.style[p] = '0px';
                        }
                    }
                    source[p] = animBase.parseStyle(sl.css(elem, p)); // 动画开始时的CSS样式
                    target[p] = animBase.parseStyle(props[p]); 			// 动画结束时的CSS样式
                }
                var core = new AnimCore(elem, options, props, type);
                core.start(source, target);
            });

            return this;
        },

        // 停止动画
        // @param { Boolean } 是否清除队列
        // @param { Boolean } 是否执行当前队列的最后一帧动画
        // @return { Object } 
        stop: function (clear, end) {
            var elem = this.elem;

            if (clear) {
                sl.removeData(elem, "fx");
                //elem.animQueue = undefined;
            }
            if (elem.currentAnim) {
                elem.currentAnim.stop();
            }

            //停止当前动画 立即执行目标属性
            if (end && elem.currentAnim) {
                elem.currentAnim.run(true);

            } else {
                animBase.dequeue(elem);
            }
            return this;
        },

        show: function (duration, easing, callback) {
            var elem = this.elem;
            if (duration) {
                this.custom(function () {
                    return animBase.fxAttrs('show', 0);
                }, duration, easing, callback);
            }
            else {
                elem.style.display = 'block';
            }

            return this;
        },

        delay: function (time) {
            if (typeof time === 'number') {
                animBase.queue(this.elem, time);
            }

            return this;
        },

        hide: function (duration, easing, callback) {
            var elem = this.elem;
            if (duration) {
                this.custom(function () {
                    return animBase.fxAttrs('hide', 0);
                }, duration, easing, callback);
            }
            else {
                elem.style.display = 'none';
            }

            return this;
        },

        slideDown: function (duration, easing, callback) {
            this.custom(function () {
                return animBase.fxAttrs('show', 1);
            }, duration, easing, callback);

            return this;
        },

        slideUp: function (duration, easing, callback) {
            this.custom(function () {
                return animBase.fxAttrs('hide', 1);
            }, duration, easing, callback);

            return this;
        },

        slideToggle: function (duration, easing, callback) {
            var elem = this.elem;

            sl.css(elem, 'display') === 'none' ?
			this.slideDown(duration, easing, callback) :
			this.slideUp(duration, easing, callback);

            return this;
        },

        fadeIn: function (duration, easing, callback) {
            this.custom(function () {
                return animBase.fxAttrs('show', 2);
            }, duration, easing, callback);

            return this;
        },

        fadeOut: function (duration, easing, callback) {
            this.custom(function () {
                return animBase.fxAttrs('hide', 2);
            }, duration, easing, callback);

            return this;
        }

    };

    win.easyAnim = easyAnim;

})(window, document);