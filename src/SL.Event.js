/// <reference path="SL.Core.js" />
/// <reference path="SL.Data.js" />
/// <reference path="SL.Selector.js" />

sl.create(function () {
    var rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
    rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
    rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
    rkeyEvent = /^key/,
    rFormElems = /^(?:textarea|input|select)$/i,
	rInputCheck = /^(?:radio|checkbox|)$/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
    isECMAEvent = !!document.addEventListener,
	quickParse = function (selector) {
	    /// <summary>
	    /// 快速id class tag的匹配
	    /// </summary>
	    /// <param name="selector"></param>
	    /// <returns type=""></returns>
	    var quick = rquickIs.exec(selector);
	    if (quick) {
	        //   0  1    2   3
	        // [ _, tag, id, class ]
	        quick[1] = (quick[1] || "").toLowerCase();
	        quick[3] = quick[3] && new RegExp("(?:^|\\s)" + quick[3] + "(?:\\s|$)");
	    }
	    return quick;
	},
	quickIs = function (elem, m) {
	    /// <summary>
	    ///  快速id class tag的匹配
	    /// </summary>
	    /// <param name="elem"></param>
	    /// <param name="m"></param>
	    /// <returns type=""></returns>
	    var attrs = elem.attributes || {};
	    return (
			(!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
			(!m[2] || (attrs.id || {}).value === m[2]) &&
			(!m[3] || m[3].test((attrs["class"] || {}).value))
		);
	},
    detachEvent = function (elem, type, handle) {
        if (elem.removeEventListener) {
            elem.removeEventListener(type, handle, false);
        } else if (elem.detachEvent) {
            elem.detachEvent("on" + type, handle);
        }
    },
    attachEvent = function (elem, type, handle) {
        if (elem.addEventListener) {
            elem.addEventListener(type, handle, false);
        }
        else {
            elem.attachEvent("on" + type, handle);
        }
    },
    specialEvent = {};
    /**
    *@ignore
    */
    HooksHelper = {
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            fixevent: function (event, original) {
                if (event.which == null) {
                    event.which = original.charCode != null ? original.charCode : original.keyCode;
                }

                return event;
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            fixevent: function (event, original) {
                var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;
                if (event.pageX == null && original.clientX != null) {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;

                    event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                    event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
                }
                if (!event.relatedTarget && fromElement) {
                    event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
                }

                // 为 click 事件添加 which 属性，左1 中2 右3
                // IE button的含义：
                // 0：没有键被按下 
                // 1：按下左键 
                // 2：按下右键 
                // 3：左键与右键同时被按下 
                // 4：按下中键 
                // 5：左键与中键同时被按下 
                // 6：中键与右键同时被按下 
                // 7：三个键同时被按下
                if (!event.which && button !== undefined) {
                    event.which = [0, 1, 3, 0, 2, 0, 0, 0][button];
                }
                eventDoc = doc = body = null;
                return event;
            }
        },
        GetHooks: function (type) {
            if (HooksHelper.fixHooks[type]) {
                return HooksHelper.fixHooks[type];
            }
            else {
                if (rkeyEvent.test(event.type)) {
                    HooksHelper.fixHooks[event.type] = HooksHelper.keyHooks;
                    return HooksHelper.keyHooks;
                } else if (rmouseEvent.test(event.type)) {
                    HooksHelper.fixHooks[event.type] = HooksHelper.mouseHooks;
                    return HooksHelper.mouseHooks;
                }
                return {};
            }
        }
    };
    /**
    *事件操作
    *@namespace
    *@name event
    */
    EventOperator = {
        /**
        *@ignore
        */
        triggered: false,
        /**
        *绑定事件
        *@memberOf event
        *@name addEvent
        *@function
        *@param  elem DOM元素
        *@param types 事件类型"click"  "click mouseover"
        *@param handler 事件处理函数
        *@param data  事件的额外数据 可以在event.data中获取到
        */
        addEvent: function (elem, types, handler, data, selector) {
            var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, quick, handlers, special;

            if (elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = sl.data(elem))) {
                return;
            }

            //可以传object的处理类型
            if (handler.handler) {
                handleObjIn = handler;
                handler = handleObjIn.handler;
                selector = handleObjIn.selector;
            }

            // 
            if (!handler.guid) {
                handler.guid = sl.guid++;
            }

            //初始化events
            events = elemData.events;
            if (!events) {
                elemData.events = events = {};
            }
            eventHandle = elemData.handle;
            if (!eventHandle) {
                elemData.handle = eventHandle = function (e) {
                    return !e || EventOperator.triggered !== e.type ?
                    EventOperator.handle.apply(eventHandle.elem, arguments) : undefined;
                };
                eventHandle.elem = elem;
            }

            types = types.split(" ");
            for (t = 0; t < types.length; t++) {

                tns = rtypenamespace.exec(types[t]) || [];
                type = tns[1];
                special = specialEvent[type] || {};
                type = (selector ? special.delegateType : special.bindType) || type; //事件模拟中会用到
                namespaces = (tns[2] || "").split(".").sort();
                special = specialEvent[type] || {};
                handleObj = sl.extend({
                    type: type,
                    origType: tns[1],
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    quick: selector && quickParse(selector),
                    namespace: namespaces.join(".")
                }, handleObjIn);


                handlers = events[type];
                //防止重复绑定事件
                if (!handlers) {
                    handlers = events[type] = [];
                    handlers.delegateCount = 0;
                    //特殊事件的钩子
                    if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                        attachEvent(elem, type, eventHandle);
                    }
                }


                if (selector) {
                    handlers.splice(handlers.delegateCount++, 0, handleObj);
                } else {
                    handlers.push(handleObj);
                }

                //注册全局事件 在触发中用到 以便快速判断有没有注册过此类型事件
                EventOperator.global[type] = true;
            }

            // 防止内存泄露
            elem = null;

        },
        /**
        *@ignore
        */
        global: {},
        /**
        *移除事件绑定
        *@memberOf event
        *@name removeEvent
        *@function
        *@param  elem DOM元素
        *@param types 事件类型"click"  "click mouseover"  为空的时候表示移除所有类型的事件监听
        *@param handler 事件处理函数 为空的时候表示移除当前事件类型的 所有监听函数
        */
        removeEvent: function (elem, types, handler, selector, mappedTypes) {
            var elemData = sl.data(elem),
            t, tns, type, origType, namespaces, origCount,
			j, events, special, eventType, handleObj;

            if (!elemData || !(events = elemData.events)) {
                return;
            }
            types = types.split(" ");
            for (t = 0; t < types.length; t++) {
                tns = rtypenamespace.exec(types[t]) || [];
                type = origType = tns[1];
                namespaces = tns[2];

                //采用命名空间移除  .namespace=>[.namespace,'',namespace]
                if (!type) {
                    //遍历events下所有类型
                    for (type in events) {
                        EventOperator.removeEvent(elem, type + types[t], handler, selector, true);
                    }
                    continue;
                }
                special = specialEvent[type] || {};
                eventType = events[type] || [];
                origCount = eventType.length;
                namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
                for (j = 0; j < eventType.length; j++) {
                    handleObj = eventType[j];

                    if ((mappedTypes || origType === handleObj.origType) &&
					 (!handler || handler.guid === handleObj.guid) &&
					 (!namespaces || namespaces.test(handleObj.namespace)) &&
					 (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
                        eventType.splice(j--, 1);

                        if (handleObj.selector) {
                            eventType.delegateCount--;
                        }
                    }
                }
                //如果该类型没有任何绑定事件 就removeEventlistener
                if (eventType.length === 0 && origCount !== eventType.length) {
                    if (!special.teardown || special.teardown.call(elem, namespaces) === false) {
                        detachEvent(elem, type, elemData.handle);
                    }
                    delete events[type];
                }
            }
            // event没任何东西
            if (sl.InstanceOf.EmptyObject(events)) {
                delete elemData.handle;
                sl.removeData(elem, "events");
            }
        },
        /**
        *触发事件
        *@memberOf event
        *@name triggerEvent
        *@function
        *@param  event 事件对象或者事件类型"click"
        *@param data 事件处理函数的数据
        *@param elem DOM元素
        */
        triggerEvent: function (event, data, elem, onlyHandlers) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="event"></param>
            /// <param name="data"></param>
            /// <param name="elem"></param>
            /// <param name="onlyHandlers">只在 .triggerHandler用到了，即不触发元素的默认行为，且停止冒泡。</param>
            /// <returns type=""></returns>
            if (elem && (elem.nodeType === 3 || elem.nodeType === 8)) {
                return;
            }
            var type = event.type || event,
			namespaces = [],
			cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;

            // 仅对focus/blur事件变种成focusin/out进行处理
            // 如果浏览器原生支持focusin/out，则确保当前不触发他们
            //预留判断 目前特殊事件没实现
            if (rfocusMorph.test(type + EventOperator.triggered)) {
                return;
            }

            if (type.indexOf("!") >= 0) {
                //如果类型中包含！表示触发没有包含命名空间的事件
                type = type.slice(0, -1);
                exclusive = true;
            }
            //包含命名空间
            if (type.indexOf(".") >= 0) {
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }
            //如果从来没有绑定过此种事件，也不用继续执行了
            if (!elem && !EventOperator.global[type]) {
                return;
            }

            // Caller can pass in an Event, Object, or just an event type string
            event = typeof event === "object" ?
			event[sl.expando] ? event :
			new SL.Event(type, event) :
			new SL.Event(type);

            //判断命名空间
            event.type = type;
            event.isTrigger = true;
            event.exclusive = exclusive;
            event.namespace = namespaces.join(".");
            event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
            ontype = type.indexOf(":") < 0 ? "on" + type : "";

            event.result = undefined;
            if (!event.target) {
                event.target = elem;
            }
            data = data != null ? sl.Convert.convertToArray(data) : [];
            data.unshift(event);



            //铺设往上冒泡的路径，每小段都包括处理对象与事件类型
            eventPath = [[elem, type]];
            if (!onlyHandlers && !sl.InstanceOf.Window(elem)) {
                // 冒泡时是否需要转成别的事件(用于事件模拟)
                // 如果不是变形来的foucusin/out事件
                bubbleType = type; //预留接口
                cur = rfocusMorph.test(bubbleType + type) ? elem : elem.parentNode;
                for (old = elem; cur; cur = cur.parentNode) {
                    eventPath.push([cur, bubbleType]);
                    old = cur;
                }

                //一直冒泡到window
                if (old === (elem.ownerDocument || document)) {
                    eventPath.push([old.defaultView || old.parentWindow || window, bubbleType]);
                }
            }

            //沿着之前铺好的路触发事件
            for (i = 0; i < eventPath.length && !event.isPropagationStopped; i++) {

                cur = eventPath[i][0];
                event.type = eventPath[i][1];

                handle = (sl.data(cur, "events") || {})[event.type] && sl.data(cur, "handle");
                if (handle) {
                    handle.apply(cur, data);
                }
                //一直冒泡到window
                handle = ontype && cur[ontype];
                if (handle && handle.apply(cur, data) === false) {
                    event.preventDefault();
                }
            }
            event.type = type;

            //不触发元素默认行为
            if (!onlyHandlers && !event.isDefaultPrevented) {

                var isClick = elem.nodeName == "A" && type === "click";
                if (!isClick) {
                    // window不触发默认工作
                    //<ie9 focus blur对隐藏元素不触发默认动作
                    if (ontype && elem[type] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !sl.InstanceOf.Window(elem)) {
                        /* 假设type为click
                        因为下面想通过click()来触发默认操作，
                        但是又不想执行对应的事件处理器（re-trigger），
                        所以需要做两方面工作：
                        首先将elem.onclick = null；
                        然后将EventOperator.triggered = 'click'; 
                        将在入口handle（第62行）不再触发了
                        之后再将它们还原*/
                        old = elem[ontype];

                        if (old) {
                            elem[ontype] = null;
                        }


                        EventOperator.triggered = type;
                        elem[type]();
                        EventOperator.triggered = undefined;

                        if (old) {
                            elem[ontype] = old;
                        }
                    }
                }

            }
            return event.result;

        },
        /**
        *@ignore
        */
        props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        //处理实际的event 忽略其差异性 实际的trigger中的event切勿fix
        /**
        *@ignore
        */
        fixEvent: function (event) {

            if (event[sl.expando]) {
                return event;
            }

            var i, prop,
			originalEvent = event,
			fixHook = HooksHelper.GetHooks(event.type),
			copy = fixHook.props ? EventOperator.props.concat(fixHook.props) : EventOperator.props;

            event = SL.Event(originalEvent);
            for (i = copy.length; i; ) {
                prop = copy[--i];
                event[prop] = originalEvent[prop];
            }
            if (!event.target) {
                event.target = event.srcElement || document;
            }

            //(safari)
            if (event.target.nodeType === 3) {
                event.target = event.target.parentNode;
            }
            event.metaKey = !!event.metaKey;
            if (!event.eventPhase) {
                event.eventPhase = 2;
            }
            event.isChar = (event.charCode > 0);
            return fixHook.fixevent ? fixHook.fixevent(event, originalEvent) : event;
        },
        /**
        *@ignore
        */
        handle: function (event) {
            event = EventOperator.fixEvent(event || window.event);
            var handlers = ((sl.data(this, "events") || {})[event.type] || []),
			delegateCount = handlers.delegateCount,
			args = [].slice.call(arguments),
            special = specialEvent[event.type],
            //exclusive表示trigger的事件包含!也就是只触发没有命名空间的
            //exclusive只会在trigger中发生
            //namespace也只会在trigger中发生 
            //所以不是通过trigger模拟的事件run_all一直会是true
            run_all = !event.exclusive && !event.namespace,
			handlerQueue = [],
			i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related;
            args[0] = event;
            event.delegateTarget = this;
            //如果使用了事件代理，则先执行事件代理的回调, FF的右键会触发点击事件，与标签不符
            if (delegateCount && !(event.button && event.type === "click")) {
                for (cur = event.target; cur != this; cur = cur.parentNode || this) {
                    if (cur.disabled !== true) {
                        selMatch = {};
                        matches = [];
                        for (i = 0; i < delegateCount; i++) {
                            handleObj = handlers[i];
                            sel = handleObj.selector;
                            if (selMatch[sel] === undefined) {
                                //目前只支持简单的判断 不支持复杂的选择器 后面待添加
                                selMatch[sel] = (
								handleObj.quick ? quickIs(cur, handleObj.quick) : sl.selector.matchesSelector(cur, sel)
							);
                            }
                            if (selMatch[sel]) {
                                matches.push(handleObj);
                            }
                        }
                        if (matches.length) {
                            handlerQueue.push({ elem: cur, matches: matches });
                        }
                    }
                }
            }
            if (handlers.length > delegateCount) {
                handlerQueue.push({ elem: this, matches: handlers.slice(delegateCount) });
            }

            //先运行代理的 如果有停止冒泡马上停止
            for (i = 0; i < handlerQueue.length && !event.isPropagationStopped; i++) {
                matched = handlerQueue[i];
                event.currentTarget = matched.elem;

                for (j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped; j++) {
                    handleObj = matched.matches[j];

                    //触发的条件 1.run_all(见上面的解释)
                    //2.没有名称空间
                    //3.命名空间和触发的命名空间一致
                    if (run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test(handleObj.namespace)) {

                        event.data = handleObj.data;
                        event.handleObj = handleObj;

                        ret = ((specialEvent[handleObj.origType] || {}).handle || handleObj.handler)
							.apply(matched.elem, args);

                        if (ret !== undefined) {
                            event.result = ret;
                            if (ret === false) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }
                    }
                }
            }
            return event.result;
        },
        /**
        *hover事件(鼠标进入和离开)
        *@memberOf event
        *@name hover
        *@function
        *@param elem DOM元素
        *@param  enterfn 进入函数
        *@param leavefn 离开函数
        *
        */
        hover: function (element, enterfn, leavefn) {
            EventOperator.addEvent(element, "mouseover", enterfn);
            EventOperator.addEvent(element, "mouseout", leavefn);
        }
    };
    /**
    *@ignore
    */
    SpecialHelper = {
        //特殊事件的模拟
        simulate: function (type, elem, event, bubble) {
            var e = sl.extend(
			new SL.Event(),
			event,
			{ type: type,
			    isSimulated: true,
			    originalEvent: {}
			}
		);
            if (bubble) {
                EventOperator.triggerEvent(e, null, elem);
            } else {
                EventOperator.handle.call(elem, e);
            }
            if (e.isDefaultPrevented) {
                event.preventDefault();
            }
        }
    };
    if (!isECMAEvent) {
        specialEvent.change = {
            setup: function () {
                // IE6-8不支持radio、checkbox的change事件，要实现代理也得模拟
                if (rFormElems.test(this.nodeName)) {
                    if (rInputCheck.test(this.type)) {
                        EventOperator.addEvent(this, "propertychange._change", function (event) {
                            if (event.originalEvent.propertyName === "checked") {
                                this._just_changed = true;
                            }
                        });
                        EventOperator.addEvent(this, "click._change", function (event) {
                            if (this._just_changed && !event.isTrigger) {
                                this._just_changed = false;
                            }
                            //通过click模拟
                            SpecialHelper.simulate("change", this, event, true);
                        });
                    }
                    return false;
                }
                /*
                就是延迟绑定啊     
                此事件就是触发在focus之前, 这时就可以确定现在页面已经动态添加了多少个新节点
                */
                EventOperator.add(this, "beforeactivate._change", function (e) {
                    var elem = e.target;

                    if (rFormElems.test(elem.nodeName) && !sl.data(elem, "_change_attached")) {
                        EventOperator.addEvent(elem, "change._change", function (event) {
                            if (this.parentNode && !event.isSimulated && !event.isTrigger) {
                                SpecialHelper.simulate("change", this.parentNode, event, true);
                            }
                        });
                        sl.data(elem, "_change_attached", true);
                    }
                });
            },

            handle: function (event) {
                var elem = event.target;

                // Swallow native change events from checkbox/radio, we already triggered them above
                if (this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox")) {
                    return event.handleObj.handler.apply(this, arguments);
                }
            },

            teardown: function () {
                EventOperator.removeEvent(this, "._change");

                return rFormElems.test(this.nodeName);
            }

        }
    };
    //mouseenter、mouseleave某些浏览器不支持
    //可以用mouseover和mouseout来模拟
    sl.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function (orig, fix) {
        specialEvent[orig] = {
            delegateType: fix,
            bindType: fix,
            handle: function (event) {
                var target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector,
				ret;
                if (!related || (related !== target && !sl.selector.contains(target, related))) {
                    event.type = handleObj.origType;
                    ret = handleObj.handler.apply(this, arguments);
                    event.type = fix;
                }
                return ret;
            }
        };
    });
    /**
    *@ignore
    */
    SL.Event = function (src) {
        //是否已经经过初始化的event
        if (!(this instanceof SL.Event)) {
            return new SL.Event(src);
        }
        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
        } else {
            this.type = src;
        }
        this.timeStamp = new Date();

        //用来标注已经初始化
        this[sl.expando] = true;
    };
    /**
    *@ignore
    */
    SL.Event.prototype = {
        preventDefault: function () {
            // DOM LV3
            this.isDefaultPrevented = true;
            var e = this.originalEvent;

            if (!e) {
                return;
            }

            // DOM LV2
            if (e.preventDefault) {
                e.preventDefault();
            }
            // IE6-8
            else {
                e.returnValue = false;
            }
        },
        stopPropagation: function () {
            // DOM LV3
            this.isPropagationStopped = true;
            var e = this.originalEvent;

            if (!e) {
                return;
            }

            // DOM LV2
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            else {
                // IE6-8
                e.cancelBubble = true;
            }
        },
        stopImmediatePropagation: function () {
            this.isImmediatePropagationStopped = true;
            this.stopPropagation();
        },
        isDefaultPrevented: false,
        isPropagationStopped: false,
        isImmediatePropagationStopped: false
    };

    sl.Event = EventOperator;
});