namespace FastOverrider {

    /**
     * 重写全局Ext的功能
     */
    export class ExtOverrider {
        constructor() {
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
                }
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
                initComponent: Ext.Function.createSequence(Ext.Component.prototype.initComponent, function () {
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
                            me.on('blur', function (obj, event, eOpts) {
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
                    } catch (e) {
                        console.error(e);
                    }
                })
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
                        let me = this,
                            rendered = me.rendered;

                        if (me.hierarchicallyHidden || (me.floating && !rendered && me.isHierarchicallyHidden())) {
                            if (!rendered) {
                                me.initHierarchyEvents();
                            }
                            if (arguments.length > 1) {
                                arguments[0] = null; // jshint ignore:line
                                me.pendingShow = arguments;
                            } else {
                                me.pendingShow = true;
                            }
                        } else if (rendered && me.isVisible()) {
                            if (me.floating) {
                                me.onFloatShow();
                            }
                        } else {
                            if (me.fireEvent('beforeshow', me) !== false) {
                                me.hidden = false;
                                delete this.getInherited().hidden;
                                Ext.suspendLayouts();
                                if (!rendered && (me.autoRender || me.floating)) {
                                    me.doAutoRender();
                                    rendered = me.rendered;
                                }

                                if (rendered) {
                                    me.beforeShow();
                                    Ext.resumeLayouts();
                                    me.onShow.apply(me, arguments);
                                    me.afterShow.apply(me, arguments);
                                } else {
                                    Ext.resumeLayouts(true);
                                }
                            } else {
                                me.onShowVeto();
                            }
                        }
                        return me;
                    } catch (e) {
                        console.error(e);
                    }
                    return this;
                }
            });

            Ext.override(Ext.Component, {
                onRender: Ext.Function.createSequence(Ext.Component.prototype.onRender, function () {
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
                                        me.helpTip.show();
                                        return
                                    }
                                    let helpContent = me.help;
                                    if (window["getHelpContent"]) {
                                        helpContent = window["getHelpContent"](me.help);
                                    }
                                    let anchor = me.helpAnchor;
                                    if (!anchor) {
                                        anchor = "left"
                                    }
                                    let anchorOffset = (me.getWidth() - 20) / 2;
                                    if (anchor === "left" || anchor === "right") {
                                        anchorOffset = (me.getHeight() - 20) / 2;
                                    }
                                    if (anchorOffset >= 280) {
                                        anchorOffset = 0;
                                    }

                                    me.helpTip = Ext.create('Ext.tip.ToolTip', {
                                        target: targetEl,
                                        resizable: false,
                                        anchor: anchor,
                                        anchorOffset: anchorOffset,
                                        autoHide: false,
                                        maxWidth: 400,
                                        closeAction: 'destroy',
                                        html: helpContent,
                                        showDelay: 0,
                                        autoShow: true,
                                        listeners: {
                                            beforedestroy: function () {
                                                me.helpTip = null;
                                            },
                                            hide: function () {
                                                this.close();
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
                            targetEl.on("unload", function () {
                                if (me.helpTip) {
                                    me.helpTip.close();
                                }
                            });
                            targetEl.on("DOMNodeRemoved", function () {
                                if (me.helpTip) {
                                    me.helpTip.close();
                                }
                            });

                            if (me.helpType == FastEnum.HelpEnumType.mouse_right_click) {
                                targetEl.on("contextmenu", function () {
                                    buildToolTip();
                                });
                            }else  if (me.helpType == FastEnum.HelpEnumType.mouse_in_out) {
                                targetEl.on("mouseover", function () {
                                    buildToolTip();
                                });
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                })
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
        }
    }

    /**
     * 重写Ext.button.Button相关的功能，
     */
    export class ButtonOverride {
        constructor() {
            Ext.override(Ext.button.Button, {
                afterRender: Ext.Function.createSequence(Ext.button.Button.prototype.afterRender, function () {
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
                    } catch (e) {
                        console.error(e);
                    }
                })
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
                        source = Ext.getDom(source);
                        let sourceNodes = source.childNodes,
                            sourceLen = sourceNodes.length,
                            dest = this.dom,
                            destNodes = dest.childNodes,
                            destLen = destNodes.length,
                            i, destNode, sourceNode,
                            nodeType, newAttrs, attLen, attName,
                            elData = dest._extData;

                        // Copy top node's attributes across. Use IE-specific method if possible.
                        // In IE10, there is a problem where the className will not get updated
                        // in the view, even though the className on the dom element is correct.
                        // See EXTJSIV-9462
                        if (Ext.isIE9m && dest.mergeAttributes) {
                            dest.mergeAttributes(source, true);

                            // EXTJSIV-6803. IE's mergeAttributes appears not to make the source's "src" value available until after the image is ready.
                            // So programmatically copy any src attribute.
                            dest.src = source.src;
                        } else {
                            newAttrs = source.attributes;
                            attLen = newAttrs.length;
                            for (i = 0; i < attLen; i++) {
                                attName = newAttrs[i].name;
                                if (attName !== 'id') {
                                    dest.setAttribute(attName, newAttrs[i].value);
                                }
                            }
                        }

                        // The element's data is no longer synchronized. We just overwrite it in the DOM
                        if (elData) {
                            elData.isSynchronized = false;
                        }

                        // If the number of child nodes does not match, fall back to replacing innerHTML
                        if (sourceLen !== destLen) {
                            dest.innerHTML = source.innerHTML;
                            return;
                        }

                        // Loop through source nodes.
                        // If there are fewer, we must remove excess
                        for (i = 0; i < sourceLen; i++) {
                            sourceNode = sourceNodes[i];
                            destNode = destNodes[i];
                            nodeType = sourceNode.nodeType;

                            // If node structure is out of sync, just drop innerHTML in and return
                            if (nodeType !== destNode.nodeType || (nodeType === 1 && sourceNode.tagName !== destNode.tagName)) {
                                dest.innerHTML = source.innerHTML;
                                return;
                            }

                            // Update text node
                            if (nodeType === 3) {
                                destNode.data = sourceNode.data;
                            }
                            // Sync element content
                            else {
                                try {
                                    if (sourceNode.id && destNode.id !== sourceNode.id) {
                                        destNode.id = sourceNode.id;
                                    }
                                    destNode.style.cssText = sourceNode.style.cssText;
                                    destNode.className = sourceNode.className;
                                    Ext.fly(destNode, '_syncContent').syncContent(sourceNode);
                                } catch (e) {
                                }
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
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
                        if (store.grid) {
                            let selectCount;
                            if (store.grid.getSelectionModel && store.grid.getSelectionModel().selected
                                && !Ext.isEmpty(store.grid.getSelectionModel().selected.rangeEnd)
                                && !Ext.isEmpty(store.grid.getSelectionModel().selected.rangeStart)) {
                                selectCount = Math.abs(parseInt(store.grid.getSelectionModel().selected.rangeEnd) -
                                    parseInt(store.grid.getSelectionModel().selected.rangeStart)) + 1;
                            } else {
                                selectCount = store.grid.getSelection().length;
                            }
                            if (selectCount > 0) {
                                msg = "选中" + selectCount + "行数据，" + msg;
                            }
                            store.grid.selectCount = selectCount;
                            if (Ext.isFunction(store.grid.refreshSelect)) {
                                store.grid.refreshSelect();
                            }
                            if (Ext.isFunction(store.grid.refreshDetailsPanel)) {
                                store.grid.refreshDetailsPanel();
                            }
                        }
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
                                cls: 'extIcon extEye',
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
                afterRender: function () {
                    this.callParent(arguments);
                    if (!this.modal) {
                        const topActiveWin = Ext.WindowManager.getActive();
                        if (topActiveWin && topActiveWin.xtype === "window" && topActiveWin.id != this.id) {
                            if (FastExt.Component.isSameByContainer(this, topActiveWin)) {
                                this.x = topActiveWin.x + 20;
                                this.y = topActiveWin.y + 20;
                            }
                        }
                    }
                },
                initComponent: Ext.Function.createSequence(Ext.Window.prototype.initComponent, function () {
                    try {
                        if (!eval(FastExt.System.getExt("window-anim").value)) {
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
                })
            });

            Ext.override(Ext.window.Window, {
                setIcon: Ext.Function.createSequence(Ext.window.Window.prototype.setIcon, function (value) {
                    let me = this;
                    let regStr = /([^/]*.svg)/;
                    if (value && regStr.test(value)) {
                        me.icon = FastExt.Server.getIcon(regStr.exec(value)[1].trim(), "#ffffff");
                    }
                })
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


    for (let subClass in FastOverrider) {
        FastOverrider[subClass]();
    }
}