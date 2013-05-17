/// <reference path="SL.Core.js" />
/// <reference path="SL.offset.js" />

/**
*样式操作
*@namespace
*@name css
*/
sl.create(function () {
    var colorNameMap = {
        aqua: '#0ff',
        black: '#000',
        blue: '#00f',
        gray: '#808080',
        purple: '#800080',
        fuchsia: '#f0f',
        green: '#008000',
        lime: '#0f0',
        maroon: '#800000',
        navy: '#000080',
        olive: '#808000',
        orange: '#ffa500',
        red: '#f00',
        silver: '#c0c0c0',
        teal: '#008080',
        transparent: 'rgba(0,0,0,0)',
        white: '#fff',
        yellow: '#ff0'
    };

    var curCSS, isQuirk = (document.documentMode) ? (document.documentMode == 5) ? true : false : ((document.compatMode == "CSS1Compat") ? false : true),
	ralpha = /alpha\([^)]*\)/,
	ropacity = /opacity=([^)]*)/,
    rnumpx = /^-?\d+(?:px)?$/i,
	rupper = /([A-Z])/g,
	rnum = /^-?\d/,
    rrgb = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/,
    isComputed = !!(document.defaultView && document.defaultView.getComputedStyle),
    cssProps = { "float": isComputed ? "cssFloat" : "styleFloat" },
    cssNormalTransform = {
        letterSpacing: 0,
        fontWeight: 400,
        lineHeight: 1
    },
    // 计算元素宽高时需要用到的辅助参数
	sizeParams = {
	    'Width': ['Left', 'Right'],
	    'Height': ['Top', 'Bottom']
	},
    //哪些属性不要自动添加单位
    cssNumber = {
        "fillOpacity": true,
        "fontWeight": true,
        "lineHeight": true,
        "opacity": true,
        "orphans": true,
        "widows": true,
        "zIndex": true,
        "zoom": true
    },
    cssHooks = {};


    var cssHelper = {
        //快速切换属性 一般获取某个样式的值 目前主要用在display:none的时候 获取height width
        //把display快速切换到block然后切换回来
        swap: function (elem, options, callback, args) {
            var old = {};
            for (var name in options) {
                old[name] = elem.style[name];
                elem.style[name] = options[name];
            }
            var val = callback.apply(elem, args);
            for (var name in options) {
                elem.style[name] = old[name];
            }
            return val;
        },
        //把样式格式化成驼峰式 backgroundColor
        camelize: function (attr) {
            return attr.replace(/\-(\w)/g, function (all, letter) {
                return letter.toUpperCase();
            });
        },
        //把样式格式化成横线连接试 background-color
        hyphenize: function (attr) {
            return attr.replace(/([A-Z])/g, "-$1").toLowerCase();
        },
        //把样式统一转换成16进制形式
        parseColor: function (elem, name, value) {
            function rgb2hex(rgb) {
                rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                return "#" + tohex(rgb[1]) + tohex(rgb[2]) + tohex(rgb[3])
            }
            function tohex(x) {
                var hexDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
                return isNaN(x) ? '00' : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
            }

            if (!!colorNameMap[value]) {
                value = colorNameMap[value]
            }

            if (value == "inherit") {
                return getStyle(elem, name);
            }
            //FF rgb()格式
            if (rrgb.test(value)) {
                return rgb2hex(value)
            } else if (/^#/.test(value)) {
                value = value.replace('#', '');
                return "#" + (value.length == 3 ? value.replace(/^(\w)(\w)(\w)$/, '$1$1$2$2$3$3') : value);
            }
            return value;
        }
    }
    if (document.defaultView && document.defaultView.getComputedStyle) {
        curCSS = function (elem, name) {
            var doc = elem.ownerDocument,
			defaultView = doc.defaultView,
			val;

            if (defaultView) {
                val = defaultView.getComputedStyle(elem, null)[name];
            }
            if (val === '') {
                val = elem.style[name];
            }
            return val;
        };
    } else if (document.documentElement.currentStyle) {
        curCSS = function (elem, name) {
            var val = elem.currentStyle && elem.currentStyle[name],
			style = elem.style,
			left, rsLeft;

            // 取不到计算样式就取其内联样式
            if (val === null) {
                val = style[name];
            }

            // 换换成px采用DE大神的杰作
            if (!rnumpx.test(val) && rnum.test(val)) {
                left = style.left;
                rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;
                if (rsLeft) {
                    elem.runtimeStyle.left = elem.currentStyle.left;
                }
                /*
                注意到em这个单位用在例如left、margin、width等属性上的含义： 
                即相对于元素自身的字体大小来定位，这里不同于fontSize，仅fontSize是相对于父级元素的字体大小。 
                例如width:5em相当于宽度为5个自身元素的字体大小。 
                为了得到以像素为单位的CSS值，用Dean提起的sstyle.left与pixLeft结合的方法去得到px为单位的值，
                当在currentStyle得到的值为5em时，
                如果设置style.left为5em，这样得来的left值为字体大小的5倍，是实际上要的结果的5倍。 
                */
                style.left = name === 'fontSize' ? '1em' : (val || 0);
                val = style.pixelLeft + 'px';
                style.left = left;
                if (rsLeft) {
                    elem.runtimeStyle.left = rsLeft;
                }
            }
            // IE6-8中borderWidth如果为0px返回的是medium，需进行修复
            if (val === 'medium' && /^border(\w)+Width$/.test(name)) {
                return '0px';
            }

            return val === "" ? "auto" : val;
        };
    };

    function getWH(elem, style) {
        var val = style === "width" ? elem.offsetWidth : elem.offsetHeight;
        if (val > 0) {
            var values = (style == 'width') ? ['left', 'right'] : ['top', 'bottom'];
            if (isQuirk) {
                return elem[cssHelper.camelize("offset-" + style)];
            } else {
                var client = parseFloat(elem[cssHelper.camelize("client-" + style)]),
                                paddingA = parseFloat(getStyle(elem, "padding-" + values[0])),
                                paddingB = parseFloat(getStyle(elem, "padding-" + values[1]));
                return client - paddingA - paddingB;
            }
        }
        else {
            return val;
        }

    };
    sl.each({ Width: 'width', Height: 'height' }, function (i, d) {
        cssHooks[d] = {
            get: function (elem) {
                if (sl.InstanceOf.Window(elem)) {
                    return elem.document.documentElement["client" + i] || document.body["client" + i];
                }
                if (elem.nodeType && elem.nodeType == 9) {
                    if (elem.nodeType === 9) {

                        var doc = elem.documentElement;
                        // support:IE6
                        if (doc["client" + i] >= doc["scroll" + i]) {
                            return doc["client" + i];
                        }

                        return Math.max(
					elem.body["scroll" + i], doc["scroll" + i],
					elem.body["offset" + i], doc["offset" + i]
				);
                    }

                }
                if (elem.offsetWidth !== 0 || getStyle(elem, "display") !== "none") {
                    return getWH(elem, d);
                } else {
                    return cssHelper.swap(elem, { position: "absolute", visibility: "hidden", display: "block" }, getWH, [elem, d]);
                }
            }
        };
        //inner要加padding
        //outer要加padding  boarder
        sl.each({ Inner: "inner", Outer: "outer" }, function (m, n) {
            cssHooks[n + i] = {
                get: function (elem) {
                    var fixAtrrs = sizeParams[i], val = parseFloat(getStyle(elem, d)), isOuter = (n == "outer");
                    if (!sl.InstanceOf.Window(elem)) {
                        sl.each(fixAtrrs, function (f, g) {
                            val += parseFloat(getStyle(elem, "padding" + g)) || 0;
                            if (isOuter) {
                                val += parseFloat(getStyle(elem, "border" + g + "Width")) || 0;
                            }
                        });
                    };
                    return val;
                }
            }
        });
    });

    cssHooks["opacity"] = {
        //0-100
        get: function (elem) {
            var val
            if (elem.currentStyle) {
                return (val = ropacity.exec(elem.currentStyle.filter)) ? parseInt(val[1]) : 100;
            }
            return (val = elem.ownerDocument.defaultView.getComputedStyle(elem, null).opacity) ? val * 100 : 100;

        },
        set: function (elem, opacityValue) {
            opacityValue = parseInt(opacityValue, 10);
            opacityValue = opacityValue > 100 ? 100 : opacityValue < 0 ? 0 : opacityValue;
            if (!elem.currentStyle) {
                elem.style.opacity = opacityValue / 100;
            } else {
                var style = elem.style, filter = style.filter;
                style.zoom = 1;
                var opacityString = opacityValue + "" === "NaN" ? "" : "alpha(opacity=" + opacityValue + ")";
                style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacityString) : opacityString;
            }
            return opacityValue;

        }
    };

    sl.each({ padding: 'paddingTop paddingRight paddingBottom paddingLeft',
        margin: 'marginTop marginRight marginBottom marginLeft',
        borderWidth: 'borderTopWidth borderRightWidth borderBottomWidth borderLeftWidth',
        borderColor: 'borderTopColor borderRightColor borderBottomColor borderLeftColor',
        borderRadius: 'borderTopLeftRadius borderTopRightRadius borderBottomRightRadius borderBottomLeftRadius'
    }, function (name, vals) {
        vals = vals.split(' ');
        cssHooks[name] = {
            get: function (elem) {
                return getStyle(elem, vals[0]) + ' ' +
				getStyle(elem, vals[1]) + ' ' +
				getStyle(elem, vals[2]) + ' ' +
				getStyle(elem, vals[3]);
            }
        };
    });
    //暂时不处理 调用offset的position
    //    sl.each(["left", "top"], function (i, d) {
    //        cssHooks[d] = {
    //            get: function (elem) {
    //                var value = getStyle(elem, d);
    //                if (/(top|left)/.test(d) && value == "auto") {
    //                
    //                }
    //            }
    //        };
    //    });

    var getStyle = function (elem, name) {
        var val, num, hooks,
			origName = cssHelper.camelize(name), name = cssProps[origName] || origName, hooks = cssHooks[name];

        if (hooks && "get" in hooks) {
            val = hooks.get(elem);
        }
        if (val === undefined) {
            val = curCSS(elem, name);
        }
        if (val === "normal" && name in cssNormalTransform) {
            val = cssNormalTransform[name];
        }

        // 统一输出RGB的颜色值以便计算
        if (/color/i.test(name)) {
            return cssHelper.parseColor(elem, name, val);
        }
        return val;
    };
    var setStyle = function (elem, name, value) {
        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
            return;
        }

        var ret, type, hooks, origName = cssHelper.camelize(name);
        style = elem.style;
        name = cssProps[origName] || origName; //处理特殊属性
        if (typeof value === "number" && !cssNumber[name]) {
            value += "px";
        }
        hooks = cssHooks[name];
        if (hooks && hooks.set) {
            hooks.set(elem, value);
        }
        else {
            try {
                style[name] = value;
            } catch (e) { }
        }
    };
    /**
    *获取或者设置元素的style样式 
    *@memberOf css
    *@function
    *@name css
    *@param  nodes 单个DOM或者元素数组
    *@param style 样式名称 可以是单个样式 例如backgroundColor:red;或者{backgroundColor:red;color:red;}形式
    *@param value 样式的值 当style不为object并且value为空表示获取样式值 否则则相反
    *获取时候
    */
    sl.css = window.css = function (nodes, style, value) {
        nodes = sl.Convert.convertToArray(nodes, null, sl);
        return sl.access(nodes, style, value, getStyle, setStyle);
    };
    function toggle(elem) {
        if ("hidden" === elem.type ||
	getStyle(elem, "display") === "none" ||
	getStyle(elem, "visibility") === "hidden") {
            setStyle(elem, "display", "");
        }
        else {
            setStyle(elem, "display", "none");
        }
    };
    sl.toggle = toggle;


});