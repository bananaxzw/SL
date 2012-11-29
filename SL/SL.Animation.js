function animation(options) {//动画类 
    //options.action方法 为每桢播放动作  传入后会自动转成 多播委托. 可随时 add remove clear .或在实例化后 this.addAction(function) 来添加至少一个动作
    //options.interval(动画间隔 默认为20ms) options.frames(动画桢数默认为50) options.repeat (重复播放动画次数.默认为0)
    this.options = options || {};
}
animation.prototype = {
    constructor: animation,
    _createAction: function (options) {
        this._action = (typeof options.action == 'function' || options.action == null) ? ns.Function.createDelegate(options.action, options.actionArgs, this) :
                    options.action;
        if (this._action.constructor != delegate) throw new Error(ns + ':Animation(options) options.action 必须为函数 委托类型');
    },
    _play: function () {//timeOut回调.
        if (this._aspect == 1) {
            if (this._currentFrame <= this.frames) {
                this._action.execute();
                this.playingHandler && this.playingHandler();
                this._currentFrame++;
                this._playing && (this._timer = window.setTimeout(ns.Function.bind(this, this._play), this.interval));

            }
            else if (this._repeat++ < this.repeat) {
                this._currentFrame = 1;
                this._playing && (this._timer = window.setTimeout(ns.Function.bind(this, this._play), this.interval));
            }
            else {
                this._playing = false;
                this.completeHandler && this.completeHandler();
            }
        }
        else {
            if (this._currentFrame >= 1) {
                this._action.execute();
                this.playingHandler && this.playingHandler();
                this._currentFrame--;
                this._playing && (this._timer = window.setTimeout(ns.Function.bind(this, this._play), this.interval));
            }
            else if (this._repeat++ < this.repeat) {
                this._currentFrame = this.frames;
                this._playing && (this._timer = window.setTimeout(ns.Function.bind(this, this._play), this.interval));
            }
            else {
                this._playing = false;
                this.completeHandler && this.completeHandler();
            }
        }
    },
    unshiftAction: function (f, aArgs, oThis) {
        this._action.unshift(f, aArgs, oThis || this);
        return this;
    },
    addAction: function (f, aArgs, oThis) {
        this._action.add(f, aArgs, oThis || this);
        return this;
    },
    removeAction: function (f) {
        this._action.remove(f);
        return this;
    },
    clearAction: function () {
        this._action.clear();
        return this;
    },
    dispose: function () {
        for (var o in this) this[o] = undefined;
    },
    reset: function (options) {
        options = options || {};
        this._playing && (this._playing = false) || window.clearTimeout(this._timer);
        (this.repeat = options.repeat || this.repeat || 0) < 0 && (this.repeat = 0); //动画重复播放的次数
        this._repeat = 0;
        this._currentFrame = 1; //私有属性 当前桢
        this.interval = options.interval || this.interval || 20; //桢之间的间隔时间
        (this.frames = options.frames || this.frames || 50) < 2 && (this.frames = 2); //总桢数.
        this._aspect = 1; //动画播放方向 参数 1为向前 -1位倒放.
        this._playing = false; //当前动画是否播放状态.
        this.initHandler = options.initHandler || this.initHandler; //初始化回调
        this.playHandler = options.playHandler || this.playHandler; //播放时回调
        this.stopHandler = options.stopHandler || this.stopHandler; //停止时回调
        this.playingHandler = options.playingHandler || this.playingHandler; //播放中回调
        this.completeHandler = options.completeHandler || this.completeHandler; //播放完毕回调
        (this.resetHandler = options.resetHandler || this.resetHandler) && this.resetHandler(); //重置回调
        return this;
    },
    play: function () { //播放动画
        if (this._playing) return this;
        this._playing = true;
        this._play();
        this.playHandler && this.playHandler();
        return this;
    },
    stop: function () {//停止动画
        this._timer && window.clearTimeout(this._timer);
        this._playing = false;
        this.stopHandler && this.stopHandler();
        return this;
    },
    goToAndPlay: function (frame) {//跳到指定桢 播放动画
        if (!isNumber(frame)) throw new Error(ns + ':animation 对象的 goToAndPlay方法 参数必须为number类型');
        if (frame < 1) frame = 1;
        else if (frame > this.frames) frame = this.frames;
        this._currentFrame = frame;
        this._timer && this._playing && window.clearTimeout(this._timer) || (this._playing = false);
        return this.play();
    },
    goToAndStop: function (frame) {//跳到指定桢 并停止动画
        if (!isNumber(frame)) throw new Error(ns + ':animation 对象的 goToAndStop方法 参数必须为number类型');
        this.stop();
        if (frame < 1) frame = 1;
        else if (frame > this.frames) frame = this.frames;
        this._currentFrame = frame;
        this._action.execute();
        this.playingHandler && this.playingHandler();
        return this;
    },
    concat: function (fHandler_oAni, nFrame) {//动画联接函数,参数1可以是函数或 Animation对象 ,nFrame 即指定第桢 执行连接函数或 联结动画.默认为最后一桢
        if (!fHandler_oAni || fHandler_oAni == this) throw new Error(ns + ':Animation对象的concat(fHandler_oAni, nFrame)方法 fHandler_oAni必须为函数或其他Animation对象');
        nFrame = nFrame || this.frames;
        if (typeof fHandler_oAni == 'function') this.addAction(function () { this.getCurrentFrame() == nFrame && fHandler_oAni.call(this); });
        else if (fHandler_oAni.constructor == animation) {
            this.addAction(function () {
                this.getCurrentFrame() == nFrame && (fHandler_oAni._init ? fHandler_oAni.play() : fHandler_oAni.init().play());
            });
        }
        return this;
    },
    setAspect: function (sAspect_nAspect) {//设置动画的播放的方向 1 -1 或 'forward' 'back'
        if (isString(sAspect_nAspect)) this._aspect = sAspect_nAspect == 'back' ? -1 : 1;
        else if (isNumber(sAspect_nAspect) && (this._aspect == 1 || this._aspect == -1)) this._aspect = sAspect_nAspect;
        else this._aspect = 1;
        return this;
    },
    getAspect: function () {
        return this._aspect;
    },
    getCurrentFrame: function () {
        var f = this._currentFrame;
        return f > this.frames ? this.frames : f < 1 ? 1 : f;
    },
    tween: function (from, to, tweenType, s) {//tweenType 为Tween函数名 from为动画启始点值 to为终点值.s为 当函数名为easeIn[Out][InOut]Back时 的参数
        return this._currentFrame <= 1 ? from : this._currentFrame >= this.frames ? to :
            Math.round((animation.Tween[tweenType] || animation.Tween.linear)(this._currentFrame, form = parseInt(from), parseInt(to) - from, this.frames));
    },
    init: function () {
        if (this._init) throw new Error(ns + ':DOM.animation(options) 对象的init方法只能调用一次');
        this._init = true;
        this._createAction(this.options);
        this.reset(this.options);
        this.options = undefined;
        this.initHandler && this.initHandler();
        return this;
    }
};

this.Animation = animation;
this.Animation.Tween = { //缓动算法..
    linear: function (t, b, c, d) { return c * t / d + b; },
    easeInQuad: function (t, b, c, d) {
        return c * (t /= d) * t + b;
    },

    easeOutQuad: function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },

    easeInOutQuad: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },

    easeInCubic: function (t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },

    easeOutCubic: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },

    easeInOutCubic: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },

    easeInQuart: function (t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    },

    easeOutQuart: function (t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },

    easeInOutQuart: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },

    easeInQuint: function (t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },

    easeOutQuint: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },

    easeInOutQuint: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },

    easeInSine: function (t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },

    easeOutSine: function (t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },

    easeInOutSine: function (t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },

    easeInExpo: function (t, b, c, d) {
        return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },

    easeOutExpo: function (t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },

    easeInOutExpo: function (t, b, c, d) {
        if (t === 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },

    easeInCirc: function (t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },

    easeOutCirc: function (t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },

    easeInOutCirc: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },

    easeInElastic: function (t, b, c, d) {
        var s = 1.70158; var p = 0; var a = c;
        if (t === 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * 0.3;
        if (a < Math.abs(c)) { a = c; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },

    easeOutElastic: function (t, b, c, d) {
        var s = 1.70158; var p = 0; var a = c;
        if (t === 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * 0.3;
        if (a < Math.abs(c)) { a = c; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },

    easeInOutElastic: function (t, b, c, d) {
        var s = 1.70158; var p = 0; var a = c;
        if (t === 0) return b; if ((t /= d / 2) == 2) return b + c; if (!p) p = d * (0.3 * 1.5);
        if (a < Math.abs(c)) { a = c; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    },

    easeInBack: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },

    easeOutBack: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },

    easeInOutBack: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },

    easeInBounce: function (t, b, c, d) {
        return c - animation.Tween.easeOutBounce(d - t, 0, c, d) + b;
    },

    easeOutBounce: function (t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        }
    },
    easeInOutBounce: function (t, b, c, d) {
        if (t < d / 2) return animation.Tween.easeInBounce(t * 2, 0, c, d) * 0.5 + b;
        return animation.Tween.easeOutBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
    }
};
this.Animation.style = function (target, oStyles, sTween, options) {
    if (!(target = ID(target))) throw new Error(ns + ':Animation.style(target,oStyles,options) target参数有错误');
    options = options || {};
    var s = {}, color = new ns.DOM.color, t, u, c = options.completeHandler;
    options.completeHandler = function () {
        c && c();
        this.dispose();
        target = null;
    }
    for (var o in oStyles) {
        u = ns.String.camelize(o);
        s[u] = [];
        switch (o) {
            case 'opacity':
                s[o][0] = getNodeAlpha(target);
                s[o][1] = oStyles[o];
                break;
            case 'padding':
            case 'margin':
                t = target.style[o + 'Left'];
                s[u][0] = getCurrentStyle(target, o + '-left');
                target.style[o + 'Left'] = oStyles[o];
                s[u][1] = getCurrentStyle(target, o + '-left');
                target.style[o + 'Left'] = t;
                break;
            case 'border-width':
                t = target.style.borderLeftWidth;
                s[u][0] = getCurrentStyle(target, 'border-left-width');
                target.style.borderLeftWidth = oStyles[o];
                s[u][1] = getCurrentStyle(target, 'border-left-width');
                target.style.borderLeftWidth = t;
                break;
            default:
                t = target.style[u];
                s[u][0] = getCurrentStyle(target, o);
                target.style[u] = oStyles[o];
                s[u][1] = getCurrentStyle(target, o);
                target.style.borderLeftWidth = t;
                break;
        }
    }
    oStyles = undefined;
    return new this(options).init().addAction(function () {
        for (var o in s) {
            if (o == 'opacity') setNodeAlpha(target, this.tween(s[o][0], s[o][1], sTween));
            else if (/[cC]olor$/.test(o)) _color.call(this, o);
            else target.style[o] = this.tween(s[o][0], s[o][1], sTween) + 'px';
        }
    }).play();
    function _color(o) {
        if (!s[o][0]) {
            var p;
            while (p = target.parentNode) if (s[o][0] = getCurrentStyle(p, ns.String.uncamelize(o))) break;
        }
        !s[o][0] && (s[o][0] = '#fff');
        var from = [color.setColor(s[o][0]).getR(), color.getG(), color.getB()];
        var to = [color.setColor(s[o][1]).getR(), color.getG(), color.getB()];
        target.style[o] = color.setR(this.tween(from[0], to[0], sTween)).
                    setG(this.tween(from[1], to[1], sTween)).
                    setB(this.tween(from[2], to[2], sTween)).valueOf();
    }
}