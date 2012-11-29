/// <reference path="SL.Core.js" />
SL().create(function () {
    var cssHelper = {
        //快速切换属性 一般获取某个样式的值 目前主要用在display:none的时候 获取height width
        //把display快速切换到block然后切换回来
        swap: function (elem, options, callback, args) {
            var old = {};
            // Remember the old values, and insert the new ones
            for (var name in options) {
                old[name] = elem.style[name];
                elem.style[name] = options[name];
            }
            callback.apply(elem, args);
            // Revert the old values
            for (var name in options) {
                elem.style[name] = old[name];
            }
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
        }
    }



    var isQuirk = (document.documentMode) ? (document.documentMode == 5) ? true : false : ((document.compatMode == "CSS1Compat") ? false : true);
    var rexclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
	ralpha = /alpha\([^)]*\)/,
	ropacity = /opacity=([^)]*)/,
	rfloat = /float/i,
	rdashAlpha = /-([a-z])/ig,
	rupper = /([A-Z])/g,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/,
    rrgb = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/,
    //单位正则
    runit = /(em|pt|mm|cm|pc|in|ex|rem|vw|vh|vm|ch|gr)$/,
	cssWidth = ["Left", "Right"],
	cssHeight = ["Top", "Bottom"],
    propCache = [],
    propFloat = ! +"\v1" ? 'styleFloat' : 'cssFloat',
    isComputed = !!(document.defaultView && document.defaultView.getComputedStyle),
    cssProps = {
        "float": isComputed ? "cssFloat" : "styleFloat"
    },
    //特殊处理的样式属性
    cssHooks = {},
    curCSS
    ;

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
            if (!rNumpx.test(val) && rNum.test(val)) {
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
    }

    function getWH(elem, style) {
        var val = style === "width" ? elem.offsetWidth : elem.offsetHeight;
        if (val > 0) {
            var values = (style == 'width') ? ['left', 'right'] : ['top', 'bottom'];
            if (isQuirk) {
                return elem[cssHelper.camelize("offset-" + style)] + "px"
            } else {
                var client = parseFloat(elem[cssHelper.camelize("client-" + style)]),
                                paddingA = parseFloat(getStyle(elem, "padding-" + values[0])),
                                paddingB = parseFloat(getStyle(elem, "padding-" + values[1]));
                return (client - paddingA - paddingB) + "px";
            }
        }
        else {
            return val + "px";
        }

    }
    sl.each(['width', 'height'], function (i, d) {
        cssHooks[d] = {
            get: function (elem) {
                if (elem.offsetWidth !== 0 || getStyle(elem, "display") !== "none") {
                    return getWH(elem, d);
                } else {
                    cssHelper.swap(elem, { position: "absolute", visibility: "hidden", display: "block" }, getWH, [elem, style]);
                }
            }
        }
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
        set: function (elem, value) {
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

    //把样式格式化成驼峰式 backgroundColor
    var camelize = function (attr) {
        return attr.replace(/\-(\w)/g, function (all, letter) {
            return letter.toUpperCase();
        });
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



    //把样式格式化成横线连接试 background-color
    var hyphenize = function (attr) {
        return attr.replace(/([A-Z])/g, "-$1").toLowerCase();
    }



    //0-100
    function getNodeAlpha(node) {
        var val
        if (node.currentStyle) {
            return (val = ropacity.exec(node.currentStyle.filter)) ? parseInt(val[1]) : 100;
        }
        return (val = node.ownerDocument.defaultView.getComputedStyle(node, null).opacity) ? val * 100 : 100;
    }
    //0-100
    function setNodeAlpha(node, opacityValue) {
        opacityValue = parseInt(opacityValue, 10);
        opacityValue = opacityValue > 100 ? 100 : opacityValue < 0 ? 0 : opacityValue;
        if (!node.currentStyle) {
            node.style.opacity = opacityValue / 100;
        } else {
            var style = node.style, filter = style.filter;
            style.zoom = 1;
            var opacityString = opacityValue + "" === "NaN" ? "" : "alpha(opacity=" + opacityValue + ")";
            style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacityString) : opacityString;
        }
        return opacityValue;
    }

    //设置node对象的浮动
    function setNodeFloat(node, floatString) {
        if (node.currentStyle) {
            node.style.styleFloat = floatString;
        } else {
            node.style.cssFloat = floatString;
        }
        return floatString;
    }
    function getNodeFloat(node) {
        return getStyle(node, "float");
    }

    //缓存样式属性
    var memorize = function (prop) {
        return propCache[prop] || (propCache[prop] = prop == 'float' ? propFloat : camelize(prop));
    }
    var convertPixelValue = function (el, value) {
        var style = el.style, left = style.left, rsLeft = el.runtimeStyle.left;
        el.runtimeStyle.left = el.currentStyle.left;
        style.left = value || 0;
        var px = style.pixelLeft;
        style.left = left; //还原数据
        el.runtimeStyle.left = rsLeft; //还原数据
        return px + "px"
    }
    var rgb2hex = function (rgb) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return "#" + tohex(rgb[1]) + tohex(rgb[2]) + tohex(rgb[3])
    }
    var tohex = function (x) {
        var hexDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
        return isNaN(x) ? '00' : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
    }




    var getStyle = function (el, style) {
        //处理透明度
        if (style == "opacity") {
            return getNodeAlpha(el);
        }
        var value;
        //IE
        if (el.currentStyle) {
            value = el.currentStyle[memorize(style)];
            //特殊处理IE的height与width
            if (/^(height|width)$/.test(style)) {
                if (el.offsetWidth != 0) {
                    value = getWH(el, style);
                } else {

                    cssHelper.swap(el, { position: "absolute", visibility: "hidden", display: "block" }, getWH, [el, style]);
                }
            }
        } else {
            if (style == "float") {
                style = propFloat;
            }
            value = document.defaultView.getComputedStyle(el, null).getPropertyValue(style)
        }
        //下面部分全部用来转换上面得出的非精确值
        if (!/^\d+px$/.test(value)) {
            //转换可度量的值 em等等
            if (runit.test(value)) {
                return convertPixelValue(el, value);
            }
            //转换百分比，不包括字体
            if (/%$/.test(value) && style != "font-size") {
                return parseFloat(getStyle(el.parentNode, "width")) * parseFloat(value) / 100 + "px"
            }
            //转换border的thin medium thick
            if (/^(border).+(width)$/.test(style)) {
                var s = style.replace("width", "style"),
                            b = {
                                thin: ["1px", "2px"],
                                medium: ["3px", "4px"],
                                thick: ["5px", "6px"]
                            };
                if (value == "medium" && getStyle(el, s) == "none") {
                    return "0px";
                }
                return !!window.XDomainRequest ? b[value][0] : b[value][1];
            }
            //转换margin的auto
            if (/^(margin).+/.test(style) && value == "auto") {
                var father = el.parentNode;
                if (/MSIE 6/.test(navigator.userAgent) && getStyle(father, "text-align") == "center") {
                    var fatherWidth = parseFloat(getStyle(father, "width")),
                                _temp = getStyle(father, "position");
                    father.runtimeStyle.postion = "relative";
                    var offsetWidth = el.offsetWidth;
                    father.runtimeStyle.postion = _temp;
                    return (fatherWidth - offsetWidth) / 2 + "px";
                }
                return "0px";
            }
            // 1. 当没有设置 style.left 时，getComputedStyle 在不同浏览器下，返回值不同
            //    比如：firefox 返回 0, webkit/ie 返回 auto
            // 2. style.left 设置为百分比时，返回值为百分比
            // 对于第一种情况，如果是 relative 元素，值为 0. 如果是 absolute 元素，值为 offsetLeft - marginLeft
            // 对于第二种情况，大部分类库都未做处理，属于“明之而不 fix”的保留 bug
            if (/(top|left)/.test(style) && value == "auto") {
                var val = 0, nameFix = style == "left" ? "Left" : "Top";
                if (/absolute|fixed/.test(getStyle(el, "position"))) {

                    offset = el["offset" + nameFix];
                    // old-ie 下，elem.offsetLeft 包含 offsetParent 的 border 宽度，需要减掉
                    if (el.uniqueID && document.documentMode < 9 || window.opera) {
                        // 类似 offset ie 下的边框处理
                        // 如果 offsetParent 为 html ，需要减去默认 2 px == documentElement.clientTop
                        // 否则减去 borderTop 其实也是 clientTop
                        // http://msdn.microsoft.com/en-us/library/aa752288%28v=vs.85%29.aspx
                        // ie<9 注意有时候 elem.offsetParent 为 null ...
                        // 比如 DOM.append(DOM.create("<div class='position:absolute'></div>"),document.body)
                        offset -= el.offsetParent && el.offsetParent['client' + nameFix] || 0;
                    }
                    val = offset - (parseInt(getStyle(el, 'margin-' + name), 10) || 0) + "px";
                    return val;
                }
                return "0px";
            }
            //转换颜色
            if (style.search(/background|color/) != -1) {
                var color = {
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
                }
                if (!!color[value]) {
                    value = color[value]
                }
                if (value == "inherit") {
                    return getStyle(el.parentNode, style);
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
        return value; //如 0px
    };
    var setStyle = function (elem, name, value) {
        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
            return;
        }
        var ret, type, hooks, origName = cssHelper.camelize(name);
        style = elem.style;
        name = cssProps[origName];
        hooks = cssHooks[name];

        try {
            style[name] = value;
        } catch (e) { }

    };
    sl.css = window.css = function (node, style, value) {
        return sl.access([node], style, value, getStyle, setStyle);
    }
});