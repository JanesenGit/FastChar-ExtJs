namespace FastOverrider {

    /**
     * 重写全局Ext的功能
     */
    export class ExtOverrider {
        constructor() {
            let oldCreate = Ext.create;
            Ext.create = function (...args) {
                if (arguments.length > 1) {
                    let stacks = (new Error()).stack.split("\n");
                    for (let i = 0; i < stacks.length; i++) {
                        let stepArray = stacks[i].trim().split(" ");
                        if (stepArray.length > 1) {
                            let fromCode = stepArray[1];
                            let codeArray = fromCode.split(".");
                            if (codeArray.length == 2 && codeArray[0].toString().indexOf("Entity") >= 0) {
                                try {
                                    let pro = eval(codeArray[0] + ".prototype");
                                    let method = codeArray[1];
                                    if (pro && pro.entityCode) {
                                        let watchFunctions = FastExt.System.entityCreateFilter[pro.entityCode];
                                        if (watchFunctions) {
                                            for (let j = 0; j < watchFunctions.length; j++) {
                                                let watchFunction = watchFunctions[j];
                                                if (Ext.isFunction(watchFunction)) {
                                                    let info = new FastExt.ComponentInvokeInfo();
                                                    info.method = method;
                                                    info.xtype = arguments[0];
                                                    info.config = arguments[1];
                                                    watchFunction(info);
                                                }
                                            }
                                        }
                                        break;
                                    }
                                } catch (e) {}
                            }
                        }
                    }
                }
                return oldCreate.apply(this, arguments);
            };
            Ext.override(Ext, {
                getScrollbarSize: function (force) {
                    //<debug>
                    if (!Ext.isDomReady) {
                        Ext.raise("getScrollbarSize called before DomReady");
                    }
                    //</debug>

                    let scrollbarSize = Ext._scrollbarSize;

                    if (force || !scrollbarSize) {
                        let db = document.body,
                            div = document.createElement('div');

                        div.style.width = div.style.height = '100px';
                        div.style.overflow = 'scroll';
                        div.style.position = 'absolute';

                        db.appendChild(div); // now we can measure the div...

                        // at least in iE9 the div is not 100px - the scrollbar size is removed!
                        Ext._scrollbarSize = scrollbarSize = {
                            width: div.offsetWidth - div.clientWidth,
                            height: div.offsetHeight - div.clientHeight
                        };

                        db.removeChild(div);
                    }
                    if (scrollbarSize.width <= 0) {
                        scrollbarSize.width = 15;
                    }
                    if (scrollbarSize.height <= 0) {
                        scrollbarSize.height = 15;
                    }
                    return scrollbarSize;
                },
            });
        }
    }


    /**
     * 重写组件的权限配置
     */
    export class PowerComponentOverride {
        constructor() {
            Ext.override(Ext.Component, {
                afterRender: Ext.Function.createSequence(Ext.Component.prototype.afterRender, function () {
                    if (!FastExt.System.isInitSystem()) {
                        return;
                    }
                    let me = this;
                    me.power = FastExt.Base.toBool(me.power, true);
                    if (me.power && (me.getXTypes().indexOf("field/") > 0 || Ext.Array.contains(FastExt.Power.types, me.getXType()))) {
                        me.code = FastExt.Power.getPowerCode(me);
                        if (!me.power) {
                            return;
                        }
                        if (me.up("[power=false]")) {
                            return;
                        }
                        if (me.code) {
                            me.managerPower = FastExt.Power.checkManagerPower(me);
                            FastExt.Power.setPower(me.code, FastExt.Base.copy(me.managerPower));
                            if (!FastExt.Power.hasPower(me, 'show')) {
                                me.hideable = false;
                                me.setHidden(true);
                                me.setDisabled(true);
                                me.clearListeners();
                                if (Ext.isFunction(me.collapse)) {
                                    me.collapse();
                                }
                            } else if (!FastExt.Power.hasPower(me, 'edit')) {
                                me.editable = false;
                                if (Ext.isFunction(me.setReadOnly)) {
                                    me.setReadOnly(true);
                                }
                            }
                            if (FastExt.Power.config) {
                                me.powerConfig = FastExt.Power.checkPower(me.code);
                                FastExt.Power.setPowerStyle(me);
                                me.getEl().on('contextmenu', function (e, t, eOpts) {
                                    e.stopEvent();
                                    FastExt.Power.showPowerConfig(me, e);
                                });
                            }
                        }
                    }
                })
            });

            Ext.override(Ext.Component, {
                setDisabled: function (disabled) {
                    if (FastExt.Power.config) {
                        console.log("权限配置中！");
                        return this['enable']();
                    }
                    return this[disabled ? 'disable' : 'enable']();
                }
            });

            Ext.override(Ext.form.field.Base, {
                markInvalid: function (errors) {
                    if (FastExt.Power.config) {
                        return;
                    }
                    let me = this,
                        ariaDom = me.ariaEl.dom,
                        oldMsg = me.getActiveError(),
                        active;

                    me.setActiveErrors(Ext.Array.from(errors));
                    active = me.getActiveError();
                    if (oldMsg !== active) {
                        me.setError(active);

                        if (!me.ariaStaticRoles[me.ariaRole] && ariaDom) {
                            ariaDom.setAttribute('aria-invalid', true);
                        }
                    }
                }
            });
        }
    }

    /**
     * 重写Ext.Component相关的功能，
     */
    export class ComponentOverride {
        constructor() {
            Ext.override(Ext.Component, {
                initComponent: function () {
                    let me = this;
                    try {
                        //取消blur和change验证，避免控件异常！
                        me.validateOnBlur = false;
                        me.validateOnChange = false;

                        me.closeToolText = "关闭";
                        me.collapseToolText = "关闭";
                        me.expandToolText = "展开";
                        if ((me.getXType() === "window" || me.getXType() === "panel")
                            && (!Ext.isEmpty(me.getTitle()) || !Ext.isEmpty(me.subtitle))
                            && (me.resizable || me.split)) {
                            let fastOnlyCode = $.md5(me.getTitle() + me.subtitle + $("title").text());
                            try {
                                fastOnlyCode = $.md5(fastOnlyCode + me.width + me.height);
                            } catch (e) {
                            }

                            let width = FastExt.Cache.getCache(fastOnlyCode + "Width");
                            let height = FastExt.Cache.getCache(fastOnlyCode + "Height");
                            let collapse = FastExt.Base.toBool(FastExt.Cache.getCache(fastOnlyCode + "Collapse"), false);
                            if (width != null) {
                                me.setWidth(width);
                                me.setFlex(0);
                            }
                            if (height != null) {
                                me.setHeight(height);
                                me.setFlex(0);
                            }
                            me.collapsed = collapse;
                            me.setCollapsed(collapse);
                            me.on('resize', function (obj, width, height, eOpts) {
                                if (width !== Ext.getBody().getWidth()) {
                                    FastExt.Cache.setCache(fastOnlyCode + "Width", width);
                                }
                                if (height !== Ext.getBody().getHeight()) {
                                    FastExt.Cache.setCache(fastOnlyCode + "Height", height);
                                }
                            });
                            me.on('collapse', function (obj, width, height, eOpts) {
                                FastExt.Cache.setCache(fastOnlyCode + "Collapse", true);
                            });
                            me.on('expand', function (obj, width, height, eOpts) {
                                FastExt.Cache.setCache(fastOnlyCode + "Collapse", false);
                            });
                        }

                        if (me.getXType() === "menuitem") {
                            me.on('focus', function (obj, event, eOpts) {
                                if (obj.isDisabled()) {
                                    return;
                                }
                                if (obj.isDisabled()) {
                                    return;
                                }
                                let icon = obj.icon;
                                let regStr = /([^/]*.svg)/;
                                if (icon && regStr.test(icon)) {
                                    let newIcon = FastExt.Server.getIcon(regStr.exec(icon)[1].trim(), "#ffffff");
                                    let iconEl = Ext.get(obj.getId() + "-iconEl");
                                    if (iconEl) {
                                        iconEl.setStyle("background-image", "url(" + newIcon + ")");
                                    }
                                }
                            });
                            me.on('deactivate', function (obj, event, eOpts) {
                                if (obj.isDisabled()) {
                                    return;
                                }
                                let icon = obj.icon;
                                let regStr = /([^/]*.svg)/;
                                if (icon && regStr.test(icon)) {
                                    let iconEl = Ext.get(obj.getId() + "-iconEl");
                                    if (iconEl) {
                                        iconEl.setStyle("background-image", "url(" + icon + ")");
                                    }
                                }
                            });
                        }

                        if (FastExt.Base.toBool(me.iframePanel, false)) {
                            me.disabledCls = "iframe-disabled-panel";
                        }

                        if (!Ext.isEmpty(me.firstCls)) {
                            me.baseCls = me.firstCls + " " + me.baseCls;
                        }
                        this.callParent(arguments);
                    } catch (e) {
                        console.error(e);
                    }
                }
            });

            Ext.override(Ext.Component, {
                show: function () {
                    try {
                        if (FastExt.System.isInitSystem()) {
                            if (this.getXType() === "window"
                                || this.getXType() === "messagebox") {
                                if (!FastExt.Base.toBool(this.sessionWin, false)) {
                                    //处理session弹窗
                                    if (FastExt.System.sessionOutAlert) {
                                        this.hide();
                                        return null;
                                    }
                                }
                            }
                        }
                        this.callParent(arguments);
                        return this;
                    } catch (e) {
                        console.error(e);
                    }
                    return this;
                }
            });

            Ext.override(Ext.Component, {
                onRender: function () {
                    this.callParent(arguments);
                    let me = this;
                    try {
                        if (FastExt.Power.isPower()) {
                            return;
                        }
                        if (me.help) {
                            let targetEl = me.bodyEl;
                            if (!targetEl) {
                                targetEl = me.el;
                            }
                            if (Ext.isEmpty(me.helpType)) {
                                me.helpType = FastEnum.HelpEnumType.mouse_right_click;
                            }

                            let buildToolTip = function () {
                                try {
                                    if (me.helpTip) {
                                        if (me.helpTip.showDelay > 0) {
                                            if (me.helpTipTimeout) {
                                                clearTimeout(me.helpTipTimeout);
                                            }
                                            me.helpTipTimeout = setTimeout(function () {
                                                if (me.helpTip) {
                                                    me.helpTip.show();
                                                }
                                            }, me.helpTip.showDelay);
                                        } else {
                                            me.helpTip.show();
                                        }
                                        return;
                                    }
                                    let helpContent = me.help;
                                    if (window["getHelpContent"]) {
                                        helpContent = window["getHelpContent"](me.help);
                                    }
                                    let anchor = me.helpAnchor;
                                    if (Ext.isEmpty(anchor)) {
                                        anchor = "left";
                                    }

                                    let helpShowDelay = me.helpShowDelay;
                                    if (Ext.isEmpty(helpShowDelay)) {
                                        helpShowDelay = 0;
                                    }

                                    me.helpTip = Ext.create('Ext.tip.ToolTip', {
                                        target: targetEl,
                                        resizable: false,
                                        anchor: anchor,
                                        anchorOffset: 0,
                                        autoHide: false,
                                        maxWidth: 400,
                                        closeAction: 'destroy',
                                        html: helpContent,
                                        showDelay: helpShowDelay,
                                        autoShow: helpShowDelay === 0,
                                        listeners: {
                                            beforedestroy: function () {
                                                me.helpTip = null;
                                                if (me.helpTipTimeout) {
                                                    clearTimeout(me.helpTipTimeout);
                                                }
                                            },
                                            hide: function () {
                                                this.close();
                                            },
                                            move: function (obj, x, y, eOpts) {
                                                let anchor = obj.anchor;
                                                let anchorOffset = (me.getWidth() - 20) / 2;
                                                if (anchor === "left" || anchor === "right") {
                                                    anchorOffset = (me.getHeight() - 20) / 2;
                                                }
                                                if (!Ext.isEmpty(me.helpAnchorOffset) && parseInt(me.helpAnchorOffset) != -1) {
                                                    anchorOffset = me.helpAnchorOffset;
                                                }
                                                obj.anchorOffset = anchorOffset;
                                            }
                                        }
                                    });
                                } catch (e) {
                                    console.error(e);
                                }
                            };

                            targetEl.on("mouseleave", function () {
                                if (me.helpTip) {
                                    me.helpTip.close();
                                }
                            });
                            if (me.helpType == FastEnum.HelpEnumType.mouse_right_click) {
                                targetEl.on("contextmenu", function () {
                                    buildToolTip();
                                });
                            } else if (me.helpType == FastEnum.HelpEnumType.mouse_in_out) {
                                targetEl.on("mouseover", function () {
                                    buildToolTip();
                                });
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            });

            Ext.override(Ext.Component, {
                onAlignToScroll: function () {
                },
                adjustPosition: function (x, y) {
                    let me = this,
                        floatParentBox;

                    // Floating Components being positioned in their ownerCt have to be made absolute.
                    if (me.isContainedFloater()) {
                        floatParentBox = me.floatParent.getTargetEl().getViewRegion();
                        x += floatParentBox.left;
                        y += floatParentBox.top;
                    }

                    try {
                        if (me.pickerField) {
                            let winWidth = document.body.clientWidth;
                            let winHeight = document.body.clientHeight;
                            if (me.pickerField.xtype === "datefield") {
                                x = Math.min(me.pickerField.getX() + me.pickerField.getWidth(), winWidth - me.getWidth());
                                y = Math.min(me.pickerField.getY(), winHeight - me.getHeight());
                            } else if (me.pickerField.xtype.indexOf("combo") !== -1) {
                                x = Math.min(me.pickerField.bodyEl.getX(), winWidth - me.getWidth());
                                y = Math.min(me.pickerField.getY() + me.pickerField.getHeight(), winHeight - me.getHeight());
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                    return {
                        x: x,
                        y: y
                    };
                }
            });


            Ext.override(Ext.Component, {
                afterShow: function (animateTarget, cb, scope) {
                    let me = this,
                        myEl = me.el,
                        fromBox,
                        toBox,
                        ghostPanel;

                    // Default to configured animate target if none passed
                    animateTarget = me.getAnimateTarget(animateTarget);

                    // Need to be able to ghost the Component
                    if (!me.ghost) {
                        animateTarget = null;
                    }
                    // If we're animating, kick of an animation of the ghost from the target to the *Element* current box
                    if (animateTarget) {
                        toBox = {
                            x: myEl.getX(),
                            y: myEl.getY(),
                            width: myEl.dom.offsetWidth,
                            height: myEl.dom.offsetHeight
                        };
                        fromBox = {
                            x: animateTarget.getX(),
                            y: animateTarget.getY(),
                            width: Math.min(animateTarget.dom.offsetWidth, myEl.dom.offsetWidth / 2),
                            height: Math.min(animateTarget.dom.offsetHeight, myEl.dom.offsetHeight / 2)
                        };
                        myEl.addCls(me.offsetsCls);
                        ghostPanel = me.ghost();
                        ghostPanel.el.stopAnimation();

                        // Shunting it offscreen immediately, *before* the Animation class grabs it ensure no flicker.
                        ghostPanel.setX(-10000);

                        me.ghostBox = toBox;
                        ghostPanel.el.animate({
                            from: fromBox,
                            to: toBox,
                            listeners: {
                                afteranimate: function () {
                                    delete ghostPanel.componentLayout.lastComponentSize;
                                    me.unghost();
                                    delete me.ghostBox;

                                    //此处新增，修改动画后位置错误问题！
                                    me.setX(toBox.x);
                                    me.setY(toBox.y);

                                    myEl.removeCls(me.offsetsCls);
                                    me.onShowComplete(cb, scope);
                                }
                            }
                        });
                    } else {
                        me.onShowComplete(cb, scope);
                    }
                    me.fireHierarchyEvent('show');
                },
                onHide: function (animateTarget, cb, scope) {
                    var me = this,
                        myEl = me.el,
                        ghostPanel, fromSize, toBox;

                    if (!me.ariaStaticRoles[me.ariaRole]) {
                        me.ariaEl.dom.setAttribute('aria-hidden', true);
                    }

                    // Part of the Focusable mixin API.
                    // If we have focus now, move focus back to whatever had it before.
                    me.revertFocus();

                    // Default to configured animate target if none passed
                    animateTarget = me.getAnimateTarget(animateTarget);

                    // Need to be able to ghost the Component
                    if (!me.ghost) {
                        animateTarget = null;
                    }
                    // If we're animating, kick off an animation of the ghost down to the target
                    if (animateTarget) {
                        toBox = {
                            x: animateTarget.getX(),
                            y: animateTarget.getY(),
                            width: Math.min(animateTarget.dom.offsetWidth, myEl.dom.offsetWidth / 2),
                            height: Math.min(animateTarget.dom.offsetHeight, myEl.dom.offsetHeight / 2)
                        };
                        ghostPanel = me.ghost();
                        ghostPanel.el.stopAnimation();
                        fromSize = me.getSize();
                        ghostPanel.el.animate({
                            to: toBox,
                            listeners: {
                                afteranimate: function () {
                                    delete ghostPanel.componentLayout.lastComponentSize;
                                    ghostPanel.el.hide();
                                    ghostPanel.setHiddenState(true);
                                    ghostPanel.el.setSize(fromSize);
                                    me.afterHide(cb, scope);
                                }
                            }
                        });
                    }
                    me.el.hide();
                    if (!animateTarget) {
                        me.afterHide(cb, scope);
                    }
                }
            });

        }
    }


    /**
     * 重写Ext.LoadMask相关的功能，
     */
    export class LoadMaskOverride {
        constructor() {
            Ext.override(Ext.LoadMask, {
                show: function () {
                    let me = this;
                    if (me.target && (me.target.disabledLoadMaskOnce || me.target.disabledLoadMask)) {
                        me.target.disabledLoadMaskOnce = false;
                        return me;
                    }
                    // Element support to be deprecated
                    if (me.isElement) {
                        me.ownerCt.mask(this.useMsg ? this.msg : '', this.msgCls);
                        me.fireEvent('show', this);
                        return;
                    }
                    return me.callParent(arguments);
                }
            });
        }
    }

    /**
     * 重写Ext.button.Button相关的功能，
     */
    export class ButtonOverride {
        constructor() {
            Ext.override(Ext.button.Button, {
                afterRender: function () {
                    try {
                        let me = this;
                        if (me.tipText) {
                            me.tip = new Ext.ToolTip({
                                target: me.el,
                                trackMouse: true,
                                renderTo: Ext.getBody(),
                                dismissDelay: 0,
                                html: me.tipText
                            });
                        }
                        let grid = me.up('grid,treepanel');
                        if (grid) {
                            if (!Ext.isEmpty(me.text) && FastExt.Base.toBool(me.contextMenu, true)) {
                                //需要配置右键菜单
                                FastExt.Grid.addGridContextMenu(grid, FastExt.Button.buttonToMenuItem(me));
                            }
                            //需要检测grid选中项
                            FastExt.Button.buttonToBind(grid, me);
                        }
                        this.callParent(arguments);
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
        }
    }


    /**
     * 重写Ext.grid.* 相关的功能
     */
    export class GridOverride {
        constructor() {
            Ext.override(Ext.grid.CellContext, {
                setRow: function (row) {
                    try {
                        let me = this,
                            dataSource = me.view.dataSource;
                        if (row) {//解决row为null报错问题
                            // Row index passed
                            if (typeof row === 'number') {
                                me.rowIdx = Math.max(Math.min(row, dataSource.getCount() - 1), 0);
                                me.record = dataSource.getAt(row);
                            }
                            // row is a Record
                            else if (row.isModel) {
                                me.record = row;
                                me.rowIdx = dataSource.indexOf(row);
                            }
                            // row is a grid row, or Element wrapping row
                            else if (row.tagName || row.isElement) {
                                me.record = me.view.getRecord(row);
                                me.rowIdx = dataSource.indexOf(me.record);
                            }
                        }
                        return me;
                    } catch (e) {
                        console.error(e);
                    }
                    return this;
                }
            });

            Ext.override(Ext.grid.column.Column, {
                afterRender: Ext.Function.createSequence(Ext.grid.column.Column.prototype.afterRender, function () {
                    try {
                        let me = this;
                        me.code = FastExt.Power.getPowerCode(me);
                        if (!me.renderer) {
                            me.renderer = FastExt.Renders.normal();
                        }

                        if (me.rendererFunction) {
                            me.renderer = eval(me.rendererFunction);
                        }
                        FastExt.Grid.configColumnProperty(me);
                        FastExt.Grid.configColumnListener(me);
                    } catch (e) {
                        console.error(e);
                    }
                })
            });

            Ext.override(Ext.grid.selection.SpreadsheetModel, {
                handleMouseDown: function (view, td, cellIndex, record, tr, rowIdx, e) {
                    try {
                        this.callParent(arguments);
                    } catch (e) {
                        console.error(e);
                    } finally {
                        this.lastPagePosition = {pageX: e.pageX, pageY: e.pageY};
                    }
                },
                onMouseMove: function (e, target, opts) {
                    try {
                        if (!this.lastPagePosition) {
                            this.lastPagePosition = {pageX: 0, pageY: 0};
                        }
                        let rangX = Math.abs(this.lastPagePosition.pageX - e.pageX);
                        let rangY = Math.abs(this.lastPagePosition.pageY - e.pageY);
                        if (rangX <= 0 || rangY <= 0) {
                            //解决单击选中 偶尔失效问题！
                            return;
                        }
                        this.callParent(arguments);
                    } catch (e) {
                        console.error(e);
                    }
                }
            });

        }

    }


    /**
     * 重写Ext.layout.* 相关的功能
     */
    export class LayoutOverride {
        constructor() {
            Ext.override(Ext.layout.container.Accordion, {
                nextCmp: function (cmp) {
                    let next = cmp.next();
                    if (next && next.isHidden()) {
                        return this.nextCmp(next);
                    }
                    return next;
                },
                prevCmp: function (cmp) {
                    let prev = cmp.prev();
                    if (prev && prev.isHidden()) {
                        return this.prevCmp(prev);
                    }
                    return prev;
                },
                onBeforeComponentCollapse: function (comp) {
                    try {
                        let me = this,
                            owner = me.owner,
                            toExpand,
                            expanded,
                            previousValue;

                        if (me.owner.items.getCount() === 1) {
                            return false;
                        }
                        if (!me.processing) {
                            me.processing = true;
                            previousValue = owner.deferLayouts;
                            owner.deferLayouts = true;
                            toExpand = me.nextCmp(comp) || me.prevCmp(comp);
                            if (toExpand.isHidden()) {
                                owner.deferLayouts = previousValue;
                                me.processing = false;
                                me.onBeforeComponentCollapse(toExpand);
                                return;
                            }
                            if (me.multi) {
                                owner.deferLayouts = previousValue;
                                me.processing = false;
                                return;
                            }
                            if (toExpand) {
                                toExpand.expand();
                            }
                            owner.deferLayouts = previousValue;
                            me.processing = false;
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
        }

    }


    /**
     * 重写Ext.dom.* 相关的功能
     */
    export class DomOverride {
        constructor() {
            Ext.override(Ext.dom.Element, {
                syncContent: function (source) {
                    try {
                        this.callParent(arguments);
                    } catch (e) {
                        console.error(e);
                    }
                }
            });

            Ext.override(Ext.dom.Element, {
                show: function (animate) {
                    this.stopAnimation();
                    if (this.dom.className.startWith("x-css-shadow")
                        || this.dom.className.startWith("x-menu")
                        || this.dom.className.startWith("x-boundlist")) {
                        this.setVisible(true, this.anim({
                            duration: 15
                        }));
                        return this;
                    }
                    this.callParent(arguments);
                    return this;
                },
                hide: function (animate) {
                    this.stopAnimation();
                    if (typeof animate === 'string') {
                        this.setVisible(false, animate);
                        return this;
                    }
                    this.setVisible(false, this.anim(animate));
                    return this;
                }
            });

        }
    }

    /**
     * 重写Ext.toolbar.* 相关的功能
     */
    export class ToolbarOverride {
        constructor() {
            Ext.override(Ext.toolbar.Paging, {
                updateInfo: function () {
                    // console.log("updateInfo", new Date());
                    let me = this,
                        displayItem = me.child('#displayItem'),
                        store = me.store,
                        pageData = me.getPageData(),
                        count, msg;

                    if (displayItem) {
                        count = store.getCount();
                        if (count === 0) {
                            msg = me.emptyMsg;
                        } else {
                            msg = Ext.String.format(
                                me.displayMsg,
                                pageData.fromRecord,
                                pageData.toRecord,
                                pageData.total
                            );
                        }
                        //取消选中数据的统计更新-发布服务器会有卡顿
                        // if (store.grid) {
                        //     let selectCount;
                        //     if (store.grid.getSelectionModel && store.grid.getSelectionModel().selected
                        //         && !Ext.isEmpty(store.grid.getSelectionModel().selected.rangeEnd)
                        //         && !Ext.isEmpty(store.grid.getSelectionModel().selected.rangeStart)) {
                        //         selectCount = Math.abs(parseInt(store.grid.getSelectionModel().selected.rangeEnd) -
                        //             parseInt(store.grid.getSelectionModel().selected.rangeStart)) + 1;
                        //     } else {
                        //         selectCount = store.grid.getSelection().length;
                        //     }
                        //     if (selectCount > 0) {
                        //         msg = "选中" + selectCount + "行数据，" + msg;
                        //     }
                        //     store.grid.selectCount = selectCount;
                        //
                        //     if (Ext.isFunction(store.grid.refreshSelect)) {
                        //         store.grid.refreshSelect();
                        //     }
                        //
                        //     if (Ext.isFunction(store.grid.refreshDetailsPanel)) {
                        //         store.grid.refreshDetailsPanel();
                        //     }
                        // }
                        displayItem.setText(msg);
                    }
                },
                initComponent: function () {
                    this.callParent(arguments);
                    this.on("beforechange", function (obj, page, eOpts) {
                        return obj.checkStoreUpdate(function () {
                            obj.store.loadPage(page);
                        });
                    });
                },
                checkStoreUpdate: function (callBack) {
                    let me = this;
                    if (!me.store.entity) {
                        return true;
                    }
                    let records = me.store.getUpdatedRecords();
                    if (records.length > 0) {
                        Ext.Msg.confirm("系统提醒", "当前页有未提交修改的数据，是否提交修改？", function (button, text) {
                            if (button == "yes") {
                                FastExt.Store.commitStoreUpdate(me.store).then(function () {
                                    callBack();
                                });
                            } else {
                                callBack();
                            }
                        });
                        return false;
                    }
                    return true;
                }
            });
        }
    }

    /**
     * 重写Ext.util.* 相关的功能
     */
    export class UtilOverride {
        constructor() {
            Ext.override(Ext.util.Grouper, {
                sortFn: function (item1, item2) {
                    //取消分组排名
                    return 0;
                }
            });
        }
    }

    /**
     * 重写Ext.resizer.* 相关的功能
     */
    export class ResizerOverride {
        constructor() {
            Ext.override(Ext.resizer.Splitter, {
                onRender: function () {
                    let me = this;
                    me.collapseOnDblClick = false;
                    me.callParent(arguments);
                }
            });
        }
    }


    /**
     * 重写Ext.dd.* 相关的功能
     */
    export class DDOverride {
        constructor() {
            Ext.override(Ext.dd.DragTracker, {
                onMouseDown: function (e) {
                    this.callParent(arguments);
                    if (this.disabled) {
                        return;
                    }
                    if (e.target) {
                        if (e.target.className.toString().indexOf("x-tool") >= 0) {
                            return;
                        }
                    }
                    let iframePanelArray = Ext.ComponentQuery.query("[iframePanel=true]");
                    for (let i = 0; i < iframePanelArray.length; i++) {
                        iframePanelArray[i].oldDisabled = iframePanelArray[i].disabled;
                        iframePanelArray[i].setDisabled(true);
                    }
                },
                onMouseUp: function (e) {
                    this.callParent(arguments);
                    let iframePanelArray = Ext.ComponentQuery.query("[iframePanel=true]");
                    for (let i = 0; i < iframePanelArray.length; i++) {
                        iframePanelArray[i].setDisabled(iframePanelArray[i].oldDisabled);
                    }
                },
                endDrag: function (e) {
                    this.callParent(arguments);
                    let iframePanelArray = Ext.ComponentQuery.query("[iframePanel=true]");
                    for (let i = 0; i < iframePanelArray.length; i++) {
                        iframePanelArray[i].setDisabled(iframePanelArray[i].oldDisabled);
                    }
                }
            });
        }
    }


    /**
     *  重写Ext.form.* 相关的功能
     */
    export class FormOverride {
        constructor() {
            Ext.override(Ext.form.Basic, {
                submit: function (options) {
                    options = options || {};
                    let me = this,
                        action;
                    options.submitEmptyText = false;
                    options.timeout = 3 * 60;//单位 秒
                    if (options.standardSubmit || me.standardSubmit) {
                        action = 'standardsubmit';
                    } else {
                        action = me.api ? 'directsubmit' : 'submit';
                    }
                    return me.doAction(action, options);
                },
                isValid: function () {
                    try {
                        let me = this,
                            invalid;
                        Ext.suspendLayouts();
                        let fieldName = "";
                        let index = 0;
                        let errorInfo = "请正确填写数据！";
                        invalid = me.getFields().filterBy(function (field) {
                            let v = !field.validate();
                            if (v && index === 0) {
                                fieldName = field.getFieldLabel();
                                errorInfo = FastExt.Form.getFieldError(field)[0];
                                index++;
                            }
                            return v;
                        });
                        Ext.resumeLayouts(true);
                        let result = invalid.length < 1;
                        if (!result) {
                            if (Ext.isEmpty(fieldName)) {
                                FastExt.Dialog.toast("请将数据填写完整！");
                            } else if (!Ext.isEmpty(errorInfo)) {
                                FastExt.Dialog.toast("【" + fieldName + "】错误：" + errorInfo);
                            } else {
                                FastExt.Dialog.toast("【" + fieldName + "】错误！");
                            }
                            FastExt.Component.shakeComment(me.owner.ownerCt);
                        }
                        return result;
                    } catch (e) {
                        FastExt.Dialog.showException(e);
                    }
                }
            });

            Ext.override(Ext.form.field.Date, {
                parseDate: function (value) {
                    if (!value || Ext.isDate(value)) {
                        return value;
                    }
                    //先猜测一下日期格式
                    let guessFormat = FastExt.Base.guessDateFormat(value);
                    if (guessFormat) {
                        this.format = guessFormat;
                    }
                    let me = this,
                        val = me.safeParse(value, me.format),
                        altFormats = me.altFormats,
                        altFormatsArray = me.altFormatsArray,
                        i = 0,
                        len;
                    if (!val && altFormats) {
                        altFormatsArray = altFormatsArray || altFormats.split('|');
                        len = altFormatsArray.length;
                        for (; i < len && !val; ++i) {
                            val = me.safeParse(value, altFormatsArray[i]);
                        }
                    }
                    return val;
                },
                initComponent: Ext.Function.createSequence(Ext.form.field.Date.prototype.initComponent, function () {
                    if (FastExt.System.isInitSystem()) {
                        if (!this.format) {
                            this.format = FastExt.System.dateFormat;
                        }
                        if (this.format === 'y-m-d') {
                            this.format = FastExt.System.dateFormat;
                        }

                        //修改日期picker弹出方式
                        this.pickerAlign = "tl-tr?";
                    }
                })
            });

            Ext.override(Ext.form.field.File, {
                onRender: Ext.Function.createSequence(Ext.form.field.File.prototype.onRender, function () {
                    let me = this;
                    if (me.multiple) {
                        me.fileInputEl.dom.setAttribute("multiple", "multiple");
                    }
                })
            });

            Ext.override(Ext.form.field.Time, {
                initComponent: Ext.Function.createSequence(Ext.form.field.Time.prototype.initComponent, function () {
                    this.invalidText = "无效的时间格式!";
                })
            });

            Ext.override(Ext.form.field.Text, {
                validate: function () {
                    let result = this.callParent(arguments);
                    if (result && this.xtype === "textfield" && !this.disabled && !this.readOnly && this.useHistory) {
                        let value = this.getValue();
                        let cacheHistory = FastExt.Cache.getCache(this.code);
                        if (!cacheHistory) {
                            cacheHistory = [];
                        }
                        if (!cacheHistory.exists(value)) {
                            cacheHistory.push(value);
                            FastExt.Cache.setCache(this.code, cacheHistory);
                        }
                    }
                    return result;
                },
                initComponent: Ext.Function.createSequence(Ext.form.field.Text.prototype.initComponent, function () {
                    let me = this;
                    if (me.inputType === 'password') {
                        me.setTriggers({
                            eayOpen: {
                                cls: 'extIcon extEye editColor',
                                hidden: true,
                                handler: function () {
                                    if (me.up("menu")) {
                                        me.up("menu").holdShow = true;
                                    }
                                    this.getTrigger('eayOpen').hide();
                                    this.getTrigger('eayClose').show();
                                    let inputObj = document.getElementById(this.getInputId());
                                    inputObj.blur();
                                    inputObj.setAttribute("type", "password");
                                    setTimeout(function () {
                                        FastExt.Base.inputFocusEnd(inputObj);
                                        if (me.up("menu")) {
                                            me.up("menu").holdShow = false;
                                        }
                                    }, 100);
                                }
                            },
                            eayClose: {
                                cls: 'extIcon extNoSee',
                                handler: function () {
                                    if (me.up("menu")) {
                                        me.up("menu").holdShow = true;
                                    }
                                    this.getTrigger('eayOpen').show();
                                    this.getTrigger('eayClose').hide();
                                    let inputObj = document.getElementById(this.getInputId());
                                    inputObj.blur();
                                    inputObj.setAttribute("type", "text");
                                    setTimeout(function () {
                                        FastExt.Base.inputFocusEnd(inputObj);
                                        if (me.up("menu")) {
                                            me.up("menu").holdShow = false;
                                        }
                                    }, 100);
                                }
                            }
                        });
                    } else if (me.xtype === "textfield" && !me.disabled && !me.readOnly && this.useHistory) {
                        me.checkHistory = function () {
                            if (!this.code) {
                                this.code = FastExt.Power.getPowerCode(this);
                            }
                            let cacheHistory = FastExt.Cache.getCache(this.code);
                            if (cacheHistory && cacheHistory.length > 0) {
                                this.getTrigger('history').show();
                                return true;
                            } else {
                                this.getTrigger('history').hide();
                                return false;
                            }
                        };
                        me.clearHistory = function () {
                            if (!this.code) {
                                this.code = FastExt.Power.getPowerCode(this);
                            }
                            FastExt.Cache.setCache(this.code, []);
                            FastExt.Dialog.toast("已清空历史记录！");
                            me.checkHistory();
                        };
                        me.showHistory = function () {
                            if (!this.code) {
                                this.code = FastExt.Power.getPowerCode(this);
                            }
                            this.historyMenu = new Ext.menu.Menu({
                                padding: '0 0 0 0',
                                power: false,
                                showSeparator: false,
                                maxHeight: 300,
                                style: {
                                    background: "#ffffff"
                                }
                            });
                            this.historyMenuHandler = function () {
                                me.setValue(this.text);
                            };
                            let cacheHistory = FastExt.Cache.getCache(this.code);
                            if (!cacheHistory) {
                                return;
                            }
                            this.historyMenu.add({
                                text: "清空历史记录",
                                iconCls: 'extIcon extClear',
                                handler: function () {
                                    me.clearHistory();
                                }
                            });
                            for (let i = 0; i < cacheHistory.length; i++) {
                                let text = cacheHistory[i];
                                this.historyMenu.add({
                                    text: text,
                                    iconCls: 'extIcon extHistory',
                                    handler: this.historyMenuHandler
                                });
                            }
                            this.historyMenu.setWidth(Math.max(this.bodyEl.getWidth(), 200));
                            this.historyMenu.showBy(this.bodyEl, "tl-bl?");
                        };
                        me.hideHistory = function () {
                            if (this.historyMenu) {
                                this.historyMenu.close();
                            }
                        };
                        me.on("change", function (obj, newValue, oldValue) {
                            obj.checkHistory();
                        });
                        me.on("afterrender", function (obj, newValue, oldValue) {
                            obj.checkHistory();
                        });
                        me.setTriggers({
                            history: {
                                cls: 'extIcon extHistory',
                                hidden: true,
                                handler: function () {
                                    if (me.up("menu")) {
                                        me.up("menu").holdShow = true;
                                    }
                                    me.showHistory();
                                }
                            },
                        });
                    }
                })
            });

            Ext.override(Ext.form.field.ComboBox, {
                initComponent: Ext.Function.createSequence(Ext.form.field.ComboBox.prototype.initComponent, function () {
                    let me = this;
                    if (me.searchable) {
                        me.editable = true;
                        me.queryMode = "local";
                        me.validator = function (val) {
                            if (this.allowBlank) {
                                return true;
                            }
                            if (this.searchable) {
                                let enumRecord = this.getStore().findRecord(this.valueField, this.getValue(), 0, false, false, true);
                                if (!enumRecord) {
                                    return "数据【" + val + "】无效，请选择下拉框里的选项！";
                                }
                            }
                            return true;
                        };
                        me.on("beforequery", function (queryPlan) {
                            if (queryPlan.cancel) {
                                return false;
                            }
                            let combo = queryPlan.combo;
                            let searchKey = queryPlan.query;
                            combo.store.clearFilter();
                            combo.store.filterBy(function (record, id) {
                                let text = record.get(combo.displayField);
                                return text.indexOf(searchKey) >= 0;
                            });
                            combo.expand();
                            return false;
                        });
                    }
                })
            });
        }
    }

    /**
     * 重写Ext.menu.Menu相关的功能
     */
    export class MenuOverride {
        constructor() {
            Ext.override(Ext.menu.Menu, {
                hide: function () {
                    if (!FastExt.System.isInitSystem()) {
                        return;
                    }
                    let me = this;
                    if (!me.powerMenu) {
                        if (FastExt.Power.menuShowing) {
                            return;
                        }
                    }
                    if (me.holdShow) {
                        return;
                    }
                    if (me.pendingShow) {
                        me.pendingShow = false;
                    }

                    if (!(me.rendered && !me.isVisible())) {
                        if (!me.hasListeners.beforehide || me.fireEvent('beforehide', me) !== false || me.hierarchicallyHidden) {
                            me.getInherited().hidden = me.hidden = true;
                            me.fireHierarchyEvent('beforehide');
                            if (me.rendered) {
                                me.onHide.apply(me, arguments);
                            }
                        }
                    }
                    return me;
                }
            });
        }
    }


    /**
     * 重写Ext.Window相关的功能
     */
    export class WindowOverride {
        constructor() {
            Ext.override(Ext.Window, {
                setIcon: function (value) {
                    this.callParent(arguments);
                    let me = this;
                    let regStr = /([^/]*.svg)/;
                    if (value && regStr.test(value)) {
                        me.icon = FastExt.Server.getIcon(regStr.exec(value)[1].trim(), "#ffffff");
                    }
                },
                afterRender: function () {
                    this.callParent(arguments);
                    if (!this.modal) {
                        const topActiveWin = Ext.WindowManager.getActive();
                        if (!FastExt.Base.toBool(topActiveWin.modal, false)) {
                            if (topActiveWin && topActiveWin.xtype === "window" && topActiveWin.id != this.id) {
                                if (FastExt.Component.isSameByContainer(this, topActiveWin)) {
                                    this.x = topActiveWin.x + 20;
                                    this.y = topActiveWin.y + 20;
                                }
                            }
                        }
                    }
                },
                initComponent: function () {
                    try {
                        this.callParent(arguments);
                        if (this.animateTarget == window) {
                            this.animateTarget = null;
                        }
                        if (!this.animateTarget) {
                            this.animateTarget = FastExt.Base.getTargetElement(FastExt.System.currClickTarget);
                        }

                        if (!eval(FastExt.System.getExt("window-anim").value)) {
                            this.animateTarget = null;
                        }

                        if (FastExt.Base.toString(this.xtype, "") === "toast") {
                            this.animateTarget = null;
                        }

                        let regStr = /([^/]*.svg)/;
                        if (this.icon && regStr.test(this.icon)) {
                            this.icon = FastExt.Server.getIcon(regStr.exec(this.icon)[1].trim(), "#ffffff");
                        }
                        this.liveDrag = true;
                        this.on("show", function (obj) {
                            obj.toFront(true);
                            obj.focus();
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
            Ext.override(Ext.window.MessageBox, {
                show: function (cfg) {
                    let me = this;
                    cfg = cfg || {};

                    if (FastExt.Base.toBool(cfg.progress, false)
                        || FastExt.Base.toBool(cfg.wait, false)) {
                        cfg.animateTarget = null;
                    } else {
                        if (Ext.isEmpty(cfg.animateTarget)) {
                            cfg.animateTarget = FastExt.Base.getTargetElement(FastExt.System.currClickTarget);
                        }
                        if (!eval(FastExt.System.getExt("window-anim").value)) {
                            cfg.animateTarget = null;
                        }
                        if (cfg.animateTarget && Ext.isElement(cfg.animateTarget) && !FastExt.Base.isElementInViewport(cfg.animateTarget)) {
                            cfg.animateTarget = null;
                        }
                        me.on("show", function (obj) {
                            obj.toFront(true);
                            obj.focus();
                        }, this, {single: true});
                    }
                    me.callParent(arguments);
                    return me;
                },
            });
        }
    }


    /**
     * 重写Ext.scroll.Scroller相关的功能
     */
    export class ScrollerOverride {
        constructor() {
            Ext.override(Ext.scroll.Scroller, {
                fireScrollStart: function () {
                    let me = this;
                    me.callParent(arguments);
                    if (me.component && me.component.xtype == "tableview") {
                        let menuCmpArray = Ext.ComponentQuery.query("menu[scrollToHidden=true]");
                        for (let i = 0; i < menuCmpArray.length; i++) {
                            menuCmpArray[i].hide();
                        }
                    }
                }
            });
        }
    }


    /**
     * 重写Ext.tip.ToolTip 相关的功能
     */
    export class TooltipOverride {
        constructor() {
            Ext.override(Ext.tip.ToolTip, {
                onDocMouseDown: function (e) {
                    try {
                        this.callParent(arguments);
                    } catch (e) {
                    }
                }
            });
        }
    }


    for (let subClass in FastOverrider) {
        FastOverrider[subClass]();
    }
}