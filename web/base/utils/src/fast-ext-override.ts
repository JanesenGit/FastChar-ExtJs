namespace FastOverrider {

    /**
     * 重写全局Ext的功能
     */
    export class ExtOverrider {
        constructor() {
            let oldCreate = Ext.create;
            Ext.create = function (...args) {
                try {
                    if (args.length > 1) {
                        if (Ext.isObject(args[1]) && args[1].filter && args[1].filter.enable) {
                            let filterConfig = args[1].filter;
                            FastExt.Listeners.fireExtCreateFilter(filterConfig.key, filterConfig.method, args[0], args[1]);
                        }
                    }
                    return oldCreate.apply(this, args);
                } catch (e) {
                    if (FastExt.System.isDebug()) {
                        FastExt.Server.reportException(FastExt.ErrorHandler.geErrorInfo(e));
                    }
                    return null;
                }
            };

            let oldGetScrollbarSize = Ext.scrollbar.size;
            Ext.scrollbar.size = function () {
                let scrollbarSize = oldGetScrollbarSize.apply(this, arguments);
                scrollbarSize.width = 8;//与css中的 ::-webkit-scrollbar 宽高一直
                scrollbarSize.height = 8;//与css中的 ::-webkit-scrollbar 宽高一直
                return scrollbarSize;
            };
        }
    }


    /**
     * 重写组件的权限配置
     */
    export class PowerComponentOverride {
        constructor() {
            Ext.override(Ext.Component, {
                onFastPowerContextMenu: function (e, t, eOpts) {
                    e.stopEvent();
                    FastExt.Power.showPowerConfig(this, e);
                },
                afterRender: function () {
                    try {
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
                            if (me.up("[powerUI=false]")) {
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
                                    me.getEl().on('contextmenu', me.onFastPowerContextMenu, me);
                                }
                            }
                        }
                    } finally {
                        this.callParent(arguments);
                    }
                }
            });

            Ext.override(Ext.Component, {
                setDisabled: function (disabled) {
                    if (FastExt.Power.config) {
                        return this['enable']();
                    }
                    return this.callParent(arguments);
                }
            });

            Ext.override(Ext.form.field.Base, {
                markInvalid: function (errors) {
                    if (FastExt.Power.config) {
                        return;
                    }
                    this.callParent(arguments);
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
                constructor: function (config) {
                    this.callParent(arguments);
                    this.addCls("fast-" + this.xtype);
                },
                setZIndex: function () {
                    let callIndex = this.callParent(arguments);
                    if (this.justTop || (this.cfg && this.cfg.justTop)) {
                        this.el.setZIndex(FastExt.Component.pageMaxZIndex);
                    }
                    return callIndex;
                },
                refreshAllowBlankTip: function () {
                    let me = this;
                    if (!FastExt.Base.toBool(me.allowBlank, true) && !Ext.isEmpty(me.fieldLabel)
                        && me.allowBlankTip) {
                        me.setFieldLabel('<svg class="svgIcon fileIcon redColor fontSize8" aria-hidden="true"><use xlink:href="#extSnow"></use></svg>&nbsp;' + me.configFieldLabel);
                    }
                },
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
                    } catch (e) {
                        console.error(e);
                    }
                    return this.callParent(arguments);
                },
                onResize: function (width, height, oldWidth, oldHeight) {
                    this.callParent(arguments);
                    if (this.needCacheUI) {
                        if (width !== Ext.getBody().getWidth()) {
                            FastExt.Cache.setCache(this.cacheUICode + "Width", width);
                        }
                        if (height !== Ext.getBody().getHeight()) {
                            FastExt.Cache.setCache(this.cacheUICode + "Height", height);
                        }
                    }
                },
                onFastBodyElMouseLeave: function (event) {
                    if (this.helpTip) {
                        this.helpTip.close();
                        this.helpTip = null;
                    }
                },
                onFastBodyElMouseOver: function () {
                    if (this.help) {
                        this.buildHelpTip();
                    }
                },
                onFastBodyElContextMenu: function () {
                    if (this.help) {
                        this.buildHelpTip();
                    }
                },
                buildHelpTip: function () {
                    try {
                        let me = this;
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

                        let helpMaxWidth = me.helpMaxWidth;
                        if (Ext.isEmpty(helpMaxWidth)) {
                            helpMaxWidth = 500;
                        }
                        let targetEl = me.bodyEl;
                        if (!targetEl) {
                            targetEl = me.el;
                        }
                        me.helpTip = Ext.create('Ext.tip.ToolTip', {
                            target: targetEl,
                            resizable: false,
                            anchor: anchor,
                            anchorOffset: 0,
                            autoHide: false,
                            // disableDocMouseDown: true,
                            hideDelay: 0,
                            focusOnToFront: false,
                            maxWidth: helpMaxWidth,
                            closeAction: 'destroy',
                            hideAction: 'destroy',
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
                },
                finishRender: function () {
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

                            targetEl.on("mouseleave", me.onFastBodyElMouseLeave, me);
                            if (me.helpType == FastEnum.HelpEnumType.mouse_right_click) {
                                targetEl.on("contextmenu", me.onFastBodyElContextMenu, me);

                            } else if (me.helpType == FastEnum.HelpEnumType.mouse_in_out) {
                                targetEl.on("mouseover", me.onFastBodyElMouseOver, me);
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                },
                initComponent: function () {
                    let me = this;
                    try {
                        if (me.labelAlign && !Ext.isEmpty(me.fieldLabel)) {
                            me.userCls = "fast-filefield-label-" + me.labelAlign;
                        }
                        me.labelSeparator = "";
                        if (me.emptyText === "default") {
                            me.emptyText = "请填写";
                            if (!Ext.isEmpty(me.fieldLabel)) {
                                me.emptyText = "请填写" + me.fieldLabel;

                                let realXtype = me.xtype;
                                if (me.parentXtype) {
                                    realXtype = me.parentXtype;
                                }

                                if (realXtype.indexOf("combo") >= 0
                                    || realXtype.indexOf("link") >= 0
                                    || realXtype.indexOf("date") >= 0
                                    || realXtype.indexOf("map") >= 0
                                    || realXtype.indexOf("pca") >= 0) {
                                    me.emptyText = "请选择" + me.fieldLabel;
                                }
                            }
                        }

                        me.configFieldLabel = me.fieldLabel;
                        me.refreshAllowBlankTip();

                        //取消blur和change验证，避免控件异常！
                        me.validateOnBlur = false;
                        me.validateOnChange = false;

                        me.closeToolText = "关闭";
                        me.collapseToolText = "关闭";
                        me.expandToolText = "展开";
                        if ((me.getXType() === "window" || me.getXType() === "panel")
                            && (!Ext.isEmpty(me.getTitle()) || !Ext.isEmpty(me.subtitle))
                            && (me.resizable || me.split)) {
                            me.cacheUICode = $.md5(me.getTitle() + me.subtitle + $("title").text() + me.width + me.height);

                            let width = FastExt.Cache.getCache(me.cacheUICode + "Width");
                            let height = FastExt.Cache.getCache(me.cacheUICode + "Height");
                            let collapse = FastExt.Base.toBool(FastExt.Cache.getCache(me.cacheUICode + "Collapse"), me.collapsed);
                            if (width != null) {
                                me.setWidth(width);
                                me.setFlex(0);
                            }
                            if (height != null) {
                                me.setHeight(height);
                                me.setFlex(0);
                            }
                            me.collapsed = collapse;
                            me.needCacheUI = true;
                            me.setCollapsed(collapse);
                        }

                        if (FastExt.Base.toBool(me.iframePanel, false)) {
                            me.disabledCls = "iframe-disabled-panel";
                        }
                        if (!Ext.isEmpty(me.firstCls)) {
                            me.baseCls = me.firstCls + " " + me.baseCls;
                        }
                    } catch (e) {
                        console.error(e);
                    } finally {
                        this.callParent(arguments);
                    }
                },
                destroy: function () {
                    this.callParent(arguments);
                    try {
                        if (this.tip) {
                            this.tip.destroy();
                            this.tip = null;
                        }
                        if (this.menu) {
                            this.menu.destroy();
                            this.menu = null;
                        }
                    } catch (e) {
                    }
                },
            });


            //弃用
            // Ext.override(Ext.Component, {
            //     adjustPosition: function (x, y) {
            //         let me = this;
            //         try {
            //             if (me.pickerField) {
            //                 let winWidth = document.body.clientWidth;
            //                 let winHeight = document.body.clientHeight;
            //                 if (me.pickerField.xtype === "datefield") {
            //                     x = Math.min(me.pickerField.getX() + me.pickerField.getWidth(), winWidth - me.getWidth());
            //                     y = Math.min(me.pickerField.getY(), winHeight - me.getHeight());
            //                 } else if (me.pickerField.xtype.indexOf("combo") !== -1) {
            //                     x = Math.min(me.pickerField.bodyEl.getX(), winWidth - me.getWidth());
            //                     y = Math.min(me.pickerField.getY() + me.pickerField.getHeight(), winHeight - me.getHeight());
            //                 }
            //                 return {
            //                     x: x,
            //                     y: y
            //                 };
            //             }
            //         } catch (e) {
            //             console.error(e);
            //         }
            //         return this.callParent(arguments);
            //     }
            // });
            // Ext.override(Ext.Component, {
            //     afterShow: function (animateTarget, cb, scope) {
            //         let me = this,
            //             myEl = me.el,
            //             fromBox,
            //             toBox,
            //             ghostPanel;
            //
            //         // Default to configured animate target if none passed
            //         animateTarget = me.getAnimateTarget(animateTarget);
            //
            //         // Need to be able to ghost the Component
            //         if (!me.ghost) {
            //             animateTarget = null;
            //         }
            //         // If we're animating, kick of an animation of the ghost from the target to the *Element* current box
            //         if (animateTarget) {
            //             toBox = {
            //                 x: myEl.getX(),
            //                 y: myEl.getY(),
            //                 width: myEl.dom.offsetWidth,
            //                 height: myEl.dom.offsetHeight
            //             };
            //             fromBox = {
            //                 x: animateTarget.getX(),
            //                 y: animateTarget.getY(),
            //                 width: Math.min(animateTarget.dom.offsetWidth, myEl.dom.offsetWidth / 2),
            //                 height: Math.min(animateTarget.dom.offsetHeight, myEl.dom.offsetHeight / 2)
            //             };
            //             myEl.addCls(me.offsetsCls);
            //             ghostPanel = me.ghost();
            //             ghostPanel.el.stopAnimation();
            //             $(ghostPanel.el).show();
            //             // Shunting it offscreen immediately, *before* the Animation class grabs it ensure no flicker.
            //             ghostPanel.setX(-10000);
            //             me.ghostBox = toBox;
            //             ghostPanel.el.animate({
            //                 from: fromBox,
            //                 to: toBox,
            //                 listeners: {
            //                     afteranimate: function () {
            //                         try {
            //                             delete ghostPanel.componentLayout.lastComponentSize;
            //                             me.unghost();
            //                             delete me.ghostBox;
            //
            //                             //此处新增，修改动画后位置错误问题！
            //                             me.setX(toBox.x);
            //                             me.setY(toBox.y);
            //
            //                             myEl.removeCls(me.offsetsCls);
            //                             me.onShowComplete(cb, scope);
            //                         } finally {
            //                             //此处新增，强制隐藏
            //                             $(ghostPanel.el).hide();
            //                         }
            //                     }
            //                 }
            //             });
            //         } else {
            //             me.onShowComplete(cb, scope);
            //         }
            //         me.fireHierarchyEvent('show');
            //     },
            //     onHide: function (animateTarget, cb, scope) {
            //         let me = this,
            //             myEl = me.el,
            //             ghostPanel, fromSize, toBox;
            //
            //         if (!me.ariaStaticRoles[me.ariaRole]) {
            //             me.ariaEl.dom.setAttribute('aria-hidden', true);
            //         }
            //
            //         // Part of the Focusable mixin API.
            //         // If we have focus now, move focus back to whatever had it before.
            //         me.revertFocus();
            //
            //         // Default to configured animate target if none passed
            //         animateTarget = me.getAnimateTarget(animateTarget);
            //
            //         // Need to be able to ghost the Component
            //         if (!me.ghost) {
            //             animateTarget = null;
            //         }
            //
            //         //此处增加 动画目标是否可见于屏幕中，避免内窗口切换tab报错
            //         if (animateTarget && Ext.isElement(animateTarget.dom) && !FastExt.Base.isElementInViewport(animateTarget.dom)) {
            //             animateTarget = null;
            //         }
            //
            //         // If we're animating, kick off an animation of the ghost down to the target
            //         if (animateTarget) {
            //             toBox = {
            //                 x: animateTarget.getX(),
            //                 y: animateTarget.getY(),
            //                 width: Math.min(animateTarget.dom.offsetWidth, myEl.dom.offsetWidth / 2),
            //                 height: Math.min(animateTarget.dom.offsetHeight, myEl.dom.offsetHeight / 2)
            //             };
            //             ghostPanel = me.ghost();
            //             ghostPanel.el.stopAnimation();
            //             $(ghostPanel.el).show();
            //             fromSize = me.getSize();
            //             ghostPanel.el.animate({
            //                 to: toBox,
            //                 listeners: {
            //                     afteranimate: function () {
            //                         try {
            //                             delete ghostPanel.componentLayout.lastComponentSize;
            //                             ghostPanel.el.hide();
            //                             ghostPanel.setHiddenState(true);
            //                             ghostPanel.el.setSize(fromSize);
            //                             me.afterHide(cb, scope);
            //                         } finally {
            //                             $(ghostPanel.el).hide();
            //                         }
            //                     }
            //                 }
            //             });
            //         }
            //         me.el.hide();
            //         if (!animateTarget) {
            //             me.afterHide(cb, scope);
            //         }
            //     }
            // });
        }
    }

    /**
     * 重写Ext.panel.Panel相关的功能
     */
    export class PanelOverride {
        constructor() {
            Ext.override(Ext.panel.Panel, {
                collapse: function () {
                    this.callParent(arguments);
                    if (this.needCacheUI) {
                        FastExt.Cache.setCache(this.cacheUICode + "Collapse", true);
                    }
                },
                expand: function (animate) {
                    this.callParent(arguments);
                    if (this.needCacheUI) {
                        FastExt.Cache.setCache(this.cacheUICode + "Collapse", false);
                    }
                },
                onMouseLeaveFloated: function (e) {
                    if (FastExt.Base.toBool(this.holdFloatView, false)) {
                        this.onMouseEnterFloated(e);
                        return;
                    }
                    this.callParent(arguments);
                },
                close: function () {
                    if (!FastExt.Base.toBool(this.canClose, true)) {
                        return;
                    }
                    this.callParent(arguments);
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
                constructor: function () {
                    this.callParent(arguments);
                    let msgId = this.getId() + "-msgEl";
                    let animDiv = $("<div id='" + this.getId() + "-anim' style='height: 70px;width: 70px;'></div>");
                    $("#" + msgId).prepend(animDiv);
                },
                getAnimEl() {
                    let animDiv = $("#" + this.getId() + "-anim");
                    if (animDiv.length > 0) {
                        return animDiv[0];
                    }
                    return null;
                },
                show: function () {
                    let me = this;

                    //此处增加了代码
                    let animEl = me.getAnimEl();
                    if (animEl) {
                        FastExt.Lottie.loadJsonAnimByEl(animEl, "base/lottie/loading.json");
                    }

                    //此处增加了代码
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
                },
                hide: function () {
                    try {
                        let animEl = this.getAnimEl();
                        if (animEl) {
                            FastExt.Lottie.unloadJsonAnimByEl(animEl);
                        }
                    } catch (e) {
                    }
                    return this.callParent(arguments);
                },

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

                        //是否只限本地按钮
                        if (FastExt.Base.toBool(me.local)) {
                            if (!FastExt.System.isLocal()) {
                                me.setHidden(true);
                            }
                        }
                        this.callParent(arguments);
                    } catch (e) {
                        console.error(e);
                    } finally {
                        FastExt.Button.checkGridToolbarButton(this);
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
            Ext.override(Ext.grid.Panel, {
                initComponent: function () {
                    this.callParent(arguments);
                    if (this.ownerGrid) {//treepanel
                        FastExt.Grid.onGridInitComponent(this.ownerGrid);
                    } else {
                        FastExt.Grid.onGridInitComponent(this);
                    }
                },
                finishRender: function () {
                    this.callParent(arguments);
                    if (this.ownerGrid) {//treepanel
                        FastExt.Grid.onGridAfterRender(this.ownerGrid);
                    } else {
                        FastExt.Grid.onGridAfterRender(this);
                    }
                },
                destroy: function () {
                    try {
                        if (this.contextMenu) {
                            this.contextMenu.destroy();
                        }
                        if (this.columnHeadMenu) {
                            this.columnHeadMenu.destroy();
                        }
                        FastExt.Cache.memory["GridSelectHistory" + this.code] = null;
                    } catch (e) {
                    }
                    this.callParent(arguments);
                }
            });

            Ext.override(Ext.grid.CellContext, {
                setRow: function (row) {
                    try {
                        if (!this.view) {
                            return this;
                        }
                        if (row) {
                            this.callParent(arguments);
                        }
                        return this;
                    } catch (e) {
                        console.error(e);
                    }
                    return this;
                }
            });

            Ext.override(Ext.grid.column.Column, {
                afterRender: function () {
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
                    } finally {
                        this.callParent(arguments);
                    }
                },
                destroy: function () {
                    if (this.searchMenu) {
                        this.searchMenu.destroy();
                    }
                    if (this.editMenu) {
                        this.editMenu.destroy();
                    }
                    if (this.batchEditMenu) {
                        this.batchEditMenu.destroy();
                    }
                    this.callParent(arguments);
                }
            });

            Ext.override(Ext.grid.selection.SpreadsheetModel, {
                onHeaderClick: function () {
                    this.callParent(arguments);
                },
                deselectAll: function (suppressEvent, passHistory) {
                    if (!FastExt.Base.toBool(passHistory, false)) {
                        if (this.view && this.view.ownerGrid
                            && this.view.ownerGrid.selectHistoryConfig
                            && this.view.ownerGrid.selectHistoryConfig.state === 1) {
                            this.view.ownerGrid.clearSelectRecordHistory();
                        }
                    }
                    this.callParent(arguments);
                },
                selectAll: function () {
                    this.callParent(arguments);
                    //此处新增，7版本遗留问题
                    this.selected.allSelected = true;
                },
                getSelection: function (passHistory) {
                    if (!FastExt.Base.toBool(passHistory, false)) {
                        if (this.view && this.view.ownerGrid
                            && this.view.ownerGrid.selectHistoryConfig
                            && this.view.ownerGrid.selectHistoryConfig.state === 1) {
                            return this.view.ownerGrid.getSelectRecordHistory();
                        }
                    }
                    return this.callParent(arguments);
                },
                getNumbererColumnConfig: function () {
                    let config = this.callParent(arguments);

                    //此处增加
                    config["text"] = "序号";
                    config["align"] = "center";
                    config["resizable"] = true;

                    if (parseInt(config["width"]) > 0) {
                        config["width"] = 52;
                    }
                    config["configWidth"] = config["width"];
                    return config;
                },
                // handleMouseDown: function (view, td, cellIndex, record, tr, rowIdx, e) {
                //     try {
                //         this.callParent(arguments);
                //     } catch (e) {
                //         console.error(e);
                //     } finally {
                //         this.lastPagePosition = {pageX: e.pageX, pageY: e.pageY};
                //     }
                // },
                // onMouseMove: function (e, target, opts) {
                //     try {
                //         if (!this.lastPagePosition) {
                //             this.lastPagePosition = {pageX: 0, pageY: 0};
                //         }
                //         let rangX = Math.abs(this.lastPagePosition.pageX - e.pageX);
                //         let rangY = Math.abs(this.lastPagePosition.pageY - e.pageY);
                //         if (rangX <= 0 || rangY <= 0) {
                //             //解决单击选中 偶尔失效问题！
                //             return;
                //         }
                //         this.callParent(arguments);
                //     } catch (e) {
                //         console.error(e);
                //     }
                // }
            });

            Ext.override(Ext.grid.ColumnLayout, {
                calculate: function (ownerContext) {
                    try {
                        //解决lockingPartnerContext属性引用对象为空报错问题！
                        this.callParent(arguments);
                    } catch (e) {
                    }
                },
            });
        }

    }

    /**
     * 重写Ext.data.Store相关的功能
     */
    export class StoreOverride {
        constructor() {
            Ext.override(Ext.data.Store, {
                constructor: function () {
                    this.callParent(arguments);
                    if (this.entity) {
                        this.autoDestroy = true;
                    }
                },
                destroy: function () {
                    try {
                        if (this.columnRenderKey) {
                            if (Ext.isArray(this.columnRenderKey)) {
                                for (let columnRenderKeyElement of this.columnRenderKey) {
                                    FastExt.Cache.memory[columnRenderKeyElement] = null;
                                    window[columnRenderKeyElement] == null;
                                }
                            } else {
                                FastExt.Cache.memory[this.columnRenderKey] = null;
                                window[this.columnRenderKey] == null;
                            }
                        }
                        if (this.entity) {
                            FastExt.Server.destroyList(this.getId());
                        }
                    } catch (e) {
                    }
                    this.callParent(arguments);
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
                },
                constructor: function (dom) {
                    this.callParent(arguments);
                    //标记grid的历史记录功能
                    // this.on("mouseup", this.onFastMouseUp, this);
                },
                onFastMouseUp: function (e, t) {
                    if (t && t.className && t.className.toString().indexOf("x-tree-elbow-img") >= 0) {
                        FastExt.Cache.memory["holdGridRecordSelectHistory"] = true;
                    } else {
                        FastExt.Cache.memory["holdGridRecordSelectHistory"] = false;
                    }
                },
                removeCls: function () {
                    try {
                        if (!this.getData()) {
                            return;
                        }
                        return this.callParent(arguments);
                    } catch (e) {
                        console.error(e);
                    }
                    return this;
                },
            });

        }
    }

    /**
     * 重写Ext.toolbar.* 相关的功能
     */
    export class ToolbarOverride {
        constructor() {
            Ext.override(Ext.toolbar.Paging, {
                initComponent: function () {
                    this.inputItemWidth = 70;
                    this.callParent(arguments);
                    let refreshBtn = this.child("#refresh");
                    refreshBtn.setIconCls("extIcon extRefresh grayColor");

                    this.on("beforechange", this.onFastBeforeChange, this);
                },
                onFastBeforeChange: function (obj, page, eOpts) {
                    return obj.checkStoreUpdate(function () {
                        obj.store.loadPage(page);
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
                    if (e.target && e.target.className) {
                        if (e.target.className.toString().indexOf("x-tool") >= 0) {
                            return;
                        }
                        if (e.target.className.toString().indexOf("x-column") >= 0) {
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
                getValues: function (asString, dirtyOnly, includeEmptyText, useDataValues, isSubmitting) {
                    let value = this.callParent(arguments);

                    //检索每个字段的自定义扩展参数
                    let extraParams = {}
                    let fields = this.getFields().items;
                    for (let field of fields) {
                        if (field.extraParams) {
                            extraParams = FastExt.Json.mergeJson(extraParams, field.extraParams);
                        }
                        if (field.multiSplit) {
                            extraParams[field.name] = field.getValue().split(field.multiSplit);
                        }
                    }
                    if (asString) {
                        return value + "&" + Ext.Object.toQueryString(extraParams);
                    }
                    return FastExt.Json.mergeJson(value, extraParams);
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

            // Ext.override(Ext.form.field.Date, {
            //     parseDate: function (value) {
            //         if (!value || Ext.isDate(value)) {
            //             return value;
            //         }
            //         //先猜测一下日期格式
            //         let guessFormat = FastExt.Base.guessDateFormat(value);
            //         if (guessFormat) {
            //             this.format = guessFormat;
            //         }
            //         let me = this,
            //             val = me.safeParse(value, me.format),
            //             altFormats = me.altFormats,
            //             altFormatsArray = me.altFormatsArray,
            //             i = 0,
            //             len;
            //         if (!val && altFormats) {
            //             altFormatsArray = altFormatsArray || altFormats.split('|');
            //             len = altFormatsArray.length;
            //             for (; i < len && !val; ++i) {
            //                 val = me.safeParse(value, altFormatsArray[i]);
            //             }
            //         }
            //         return val;
            //     },
            //     initComponent: function () {
            //         if (FastExt.System.isInitSystem()) {
            //             if (!this.format) {
            //                 this.format = FastExt.System.dateFormat;
            //             }
            //             if (this.format === 'y-m-d') {
            //                 this.format = FastExt.System.dateFormat;
            //             }
            //
            //             //修改日期picker弹出方式
            //             this.pickerAlign = "tl-tr?";
            //         }
            //         this.callParent(arguments);
            //     }
            // });

            Ext.override(Ext.form.field.File, {
                onRender: function () {
                    this.callParent(arguments);
                    let me = this;
                    if (me.multiple && me.fileInputEl) {
                        me.fileInputEl.dom.setAttribute("multiple", "multiple");
                    }
                }
            });

            Ext.override(Ext.form.field.Time, {
                initComponent: function () {
                    this.invalidText = "无效的时间格式!";
                    this.callParent(arguments);
                }
            });

            Ext.override(Ext.form.field.Text, {
                validate: function () {
                    let result = this.callParent(arguments);
                    if (result && this.xtype === "textfield" && !this.disabled && !this.readOnly && this.useHistory) {
                        this.saveHistory();
                    }
                    return result;
                },

                isUseHistory: function () {
                    return this.xtype === "textfield" && !this.disabled && !this.readOnly && this.useHistory;
                },
                isUseLetterKeyboard: function () {
                    return this.xtype === "textfield" && !this.disabled && !this.readOnly && this.letterKeyboard;
                },
                onChange: function (newVal, oldVal) {
                    this.callParent(arguments);
                    if (this.isUseHistory()) {
                        this.checkHistory();
                    }
                    if (this.isUseLetterKeyboard()) {
                        document.getElementById(this.getInputId()).setAttribute("type", "text");
                    }
                },
                finishRender: function () {
                    this.callParent(arguments);
                    if (this.isUseHistory()) {
                        this.checkHistory();
                        this.inputEl.on('click', this.onFastHistoryInputClick, this);
                    }
                    if (this.isUseLetterKeyboard()) {
                        document.getElementById(this.getInputId()).setAttribute("type", "password");
                    }
                },
                onFastHistoryInputClick: function () {
                    if (this.checkHistory()) {
                        if (this.historyShown) {
                            this.hideHistory();
                        } else {
                            this.showHistory();
                        }
                    }
                },
                onFastHideHistoryMenu: function () {
                    let editorMenu = this.getEditorMenu();
                    if (editorMenu) {
                        editorMenu.holdShow = false;
                    }
                    if (this.hideHistoryTask) {
                        this.hideHistoryTask.delay(100);
                    }

                },
                getHistory: function () {
                    if (!this.code) {
                        this.code = FastExt.Power.getPowerCode(this);
                    }
                    let cacheHistory = FastExt.Cache.getCache(this.code + FastExt.System.getManagerId());

                    if (this.defaultHistory) {
                        if (Ext.isEmpty(cacheHistory)) {
                            cacheHistory = {};
                        }
                        cacheHistory = Ext.Object.merge(cacheHistory, this.defaultHistory);
                    }
                    return cacheHistory;
                },
                checkHistory: function () {
                    let cacheHistory = this.getHistory();

                    if (cacheHistory && Object.keys(cacheHistory).length > 0) {
                        this.getTrigger('history').show();
                        return true;
                    } else {
                        this.getTrigger('history').hide();
                        return false;
                    }
                },
                clearHistory: function () {
                    if (!this.code) {
                        this.code = FastExt.Power.getPowerCode(this);
                    }
                    FastExt.Cache.setCache(this.code + FastExt.System.getManagerId(), {});
                    FastExt.Dialog.toast("已清空历史记录！");
                    this.checkHistory();
                },
                showHistory: function () {
                    if (!this.code) {
                        this.code = FastExt.Power.getPowerCode(this);
                    }
                    if (this.hideHistoryTask) {
                        this.hideHistoryTask.cancel();
                    }
                    if (this.historyMenu) {
                        this.historyMenu.destroy();
                    }

                    let meField = this;
                    let editorMenu = meField.getEditorMenu();
                    if (editorMenu) {
                        editorMenu.holdShow = true;
                    }
                    this.historyMenu = new Ext.menu.Menu({
                        padding: '0 0 0 0',
                        power: false,
                        showSeparator: false,
                        maxHeight: 300,
                        style: {
                            background: "#ffffff"
                        },
                        listeners: {
                            hide: {
                                fn: this.onFastHideHistoryMenu,
                                scope: this,
                            },
                        },
                    });
                    let cacheHistory = this.getHistory();
                    if (!cacheHistory) {
                        return;
                    }
                    if (Ext.isArray(cacheHistory)) {
                        cacheHistory = {};
                    }
                    this.historyMenu.add({
                        text: "清空历史记录",
                        iconCls: 'extIcon extClear',
                        handler: function () {
                            meField.clearHistory();
                        }
                    });
                    let keys = Object.keys(cacheHistory);

                    keys.sort(function (a, b) {
                        let date1 = cacheHistory[a].date;
                        let date2 = cacheHistory[b].date;
                        return FastExt.Dates.parseDate(date2).getTime() - FastExt.Dates.parseDate(date1).getTime();
                    });

                    for (let key of keys) {
                        let cache = cacheHistory[key];
                        this.historyMenu.add({
                            text: FastExt.Base.toMaxString(key, 15) + (cache.default ? "" : " [ " + cache.date + " ] "),
                            iconCls: cache.default ? 'extIcon extColumn' : 'extIcon extHistory',
                            realText: key,
                            handler: function () {
                                meField.setValue(this.realText);
                                meField.fireEvent("selectHistoryValue", meField, this.realText);
                            },
                        });
                    }
                    this.historyMenu.showBy(this.bodyEl, "tl-bl?");
                    this.historyShown = true;

                    if (!this.hideHistoryTask) {
                        this.hideHistoryTask = new Ext.util.DelayedTask(function () {
                            this.historyShown = false;
                        }, this);
                    }
                },
                hideHistory: function () {
                    if (this.historyMenu) {
                        this.historyMenu.close();
                    }
                    this.historyShown = false;
                },
                saveHistory: function () {
                    let value = this.getValue();
                    let cacheHistory = FastExt.Cache.getCache(this.code + FastExt.System.getManagerId());
                    if (!cacheHistory) {
                        cacheHistory = {};
                    }
                    if (Ext.isEmpty(value)) {
                        return;
                    }
                    cacheHistory[value] = {
                        date: Ext.Date.format(new Date(), "Y-m-d H:i:s"),
                    };
                    FastExt.Cache.setCache(this.code + FastExt.System.getManagerId(), cacheHistory);
                },
                initComponent: function () {
                    try {
                        let me = this;
                        if (me.inputType === 'password') {
                            me.addTriggers({
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
                        } else if (me.isUseHistory()) {
                            me.addTriggers({
                                history: {
                                    cls: 'extIcon extHistory2',
                                    hidden: true,
                                    handler: me.onFastHistoryInputClick,
                                },
                            });
                        }
                    } finally {
                        this.callParent(arguments);
                    }
                },
                destroy: function () {
                    if (this.historyMenu) {
                        this.historyMenu.destroy();
                    }
                    this.callParent(arguments);
                },
            });

            Ext.override(Ext.form.field.ComboBox, {
                initComponent: function () {
                    try {
                        let me = this;
                        if (me.searchable) {
                            me.editable = true;
                            me.queryMode = "local";
                            me.anyMatch = true;
                            // me.triggerAction = "query";
                            me.caseSensitive = true;
                            me.validator = function (val) {
                                if (this.allowBlank) {
                                    return true;
                                }
                                if (this.searchable && !FastExt.Base.toBool(this.newable, false)) {
                                    let enumRecord = this.getStore().findRecord(this.valueField, this.getValue(), 0, false, false, true);
                                    if (!enumRecord) {
                                        return "数据【" + val + "】无效，请选择下拉框里的选项！";
                                    }
                                }
                                return true;
                            };
                        }
                    } finally {
                        this.callParent(arguments);
                    }
                },
                toggle: function () {
                    let pickerHidden = this.getPicker().hidden;
                    if (pickerHidden) {
                        this.collapse();
                    } else if (this.searchable) {
                        this.doQuery(this.getRawValue(), false, true);
                    } else {
                        this.expand();
                    }
                },
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
                    let me = this;
                    if (!me.powerMenu) {
                        if (FastExt.Power.menuShowing) {
                            return;
                        }
                    }
                    if (me.holdShow) {
                        return;
                    }
                    return this.callParent(arguments);
                },
                onShortcutKey: function () {
                    try {
                        this.callParent(arguments);
                    } catch (e) {
                    }
                },
                delayClose: function (duration) {
                    new Ext.util.DelayedTask(this.close, this).delay(duration);
                },
            });
            Ext.override(Ext.menu.Item, {
                focus: function () {
                    if (this.isDisabled()) {
                        return;
                    }
                    if (this.isDisabled()) {
                        return;
                    }
                    let icon = this.icon;
                    let regStr = /([^/]*.svg)/;
                    if (icon && regStr.test(icon)) {
                        let newIcon = FastExt.Server.getIcon(regStr.exec(icon)[1].trim(), "#ffffff");
                        let iconEl = Ext.get(this.getId() + "-iconEl");
                        if (iconEl) {
                            iconEl.setStyle("background-image", "url(" + newIcon + ")");
                        }
                    }
                    return this.callParent(arguments);
                },
                onFocusLeave: function () {
                    this.callParent(arguments);

                    if (this.isDisabled()) {
                        return;
                    }
                    let icon = this.icon;
                    let regStr = /([^/]*.svg)/;
                    if (icon && regStr.test(icon)) {
                        let iconEl = Ext.get(this.getId() + "-iconEl");
                        if (iconEl) {
                            iconEl.setStyle("background-image", "url(" + icon + ")");
                        }
                    }

                },
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
                restore: function () {
                    //恢复历史记录的最大宽度最大高度
                    if (!Ext.isEmpty(this.oldMaxHeight)) {
                        this.maxHeight = this.oldMaxHeight;
                    }
                    if (!Ext.isEmpty(this.oldMaxWidth)) {
                        this.maxWidth = this.oldMaxWidth;
                    }
                    return this.callParent(arguments);
                },
                maximize: function () {
                    //避免限制最大宽度和最大高度，放大异常
                    if (!Ext.isEmpty(this.maxHeight)) {
                        this.height = Math.min(this.getHeight(), this.maxHeight);
                        this.oldMaxHeight = this.maxHeight;
                        delete this.maxHeight;
                    }
                    if (!Ext.isEmpty(this.maxWidth)) {
                        this.width = Math.min(this.getWidth(), this.maxWidth);
                        this.oldMaxWidth = this.maxWidth;
                        delete this.maxWidth;
                    }
                    return this.callParent(arguments);
                },
                afterRender: function () {
                    this.callParent(arguments);
                    // if (!this.modal) {
                    //     const topActiveWin = Ext.WindowManager.getActive();
                    //     if (!FastExt.Base.toBool(topActiveWin.modal, false)) {
                    //         if (topActiveWin && topActiveWin.xtype === "window" && topActiveWin.id != this.id) {
                    //             if (FastExt.Component.isSameByContainer(this, topActiveWin)) {
                    //                 this.x = topActiveWin.x + 20;
                    //                 this.y = topActiveWin.y + 20;
                    //             }
                    //         }
                    //     }
                    // }
                },
                onShowComplete: function () {
                    this.callParent(arguments);

                    this.toFront(true);
                    this.focus();

                    if (FastExt.Base.toBool(this.autofocusField, true)) {
                        let queryCmp = this.query("form");
                        if (queryCmp && queryCmp.length > 0) {
                            queryCmp[0].getForm().getFields().each(function (item) {
                                if (item.readOnly || item.isDisabled()) {
                                    return true;
                                }
                                if (item.xtype === "textfield" || item.xtype === "numberfield"
                                    || item.xtype === "contentfield"
                                    || item.xtype === "textareafield"
                                    || item.xtype === "htmlcontentfield") {
                                    item.focus(true, 100);
                                    return false;
                                }
                            });
                        }
                    }
                },
                initComponent: function () {
                    try {
                        if (Ext.isEmpty(this.tools)) {
                            this.tools = [];
                        }
                        if ((!this.modal && this.id.indexOf("messagebox") < 0 && FastExt.Base.toBool(this.unpin, true))
                            || FastExt.Base.toBool(this.unpin, false)) {
                            this.tools.push({
                                type: 'unpin',
                                tooltip: '固定窗口',
                                callback: function (owner, tool, event) {
                                    let currTools = owner.getHeader().getTools();
                                    if (tool.type === "unpin") {
                                        tool.setType("pin");
                                        tool.setTooltip("取消固定窗口");
                                        owner.canClose = false;
                                    } else {
                                        tool.setType("unpin");
                                        tool.setTooltip("固定窗口");
                                        owner.canClose = true;
                                    }

                                    for (let i = 0; i < currTools.length; i++) {
                                        let item = currTools[i];
                                        if (item.type === "close") {
                                            if (tool.type === "unpin") {
                                                item.show();
                                            } else {
                                                item.hide();
                                            }
                                            break;
                                        }
                                    }
                                }
                            });
                        }

                        if (this.animateTarget == window) {
                            this.animateTarget = null;
                        }

                        if (!this.animateTarget) {
                            this.animateTarget = FastExt.Base.getTargetElement(FastExt.System.currClickTarget);
                        }
                        if (this.getId().indexOf("ghost") >= 0) {
                            this.animateTarget = null;
                        }

                        if (!FastExt.Base.toBool(FastExt.System.getExt("window-anim").value, true)) {
                            this.animateTarget = null;
                        }

                        if (FastExt.Base.toString(this.xtype, "") === "toast") {
                            this.animateTarget = null;
                        }

                        if (FastExt.Base.toBool(this.animateDisable, false)) {
                            this.animateTarget = null;
                        }

                        this.liveDrag = true;

                    } catch (e) {
                        console.error(e);
                    } finally {
                        this.callParent(arguments);
                    }
                },
            });
        }
    }


    /**
     * 重写Ext.window.MessageBox相关的功能
     */
    export class MessageBoxOverride {
        constructor() {
            Ext.override(Ext.window.MessageBox, {
                confirm: function (cfg, message, fn, scope) {
                    FastExt.Dialog.showConfirm(cfg, message, fn);
                    return this;
                },
                prompt: function (title, message, fn, scope, multiline, value) {
                    FastExt.Dialog.showPrompt(title, message, fn, multiline, value);
                    return this
                },
                alert: function (title, message, fn, scope) {
                    FastExt.Dialog.showAlert(title, message, fn);
                    return this
                },
                show: function (cfg) {
                    let me = this;
                    me.closeToolText = null;
                    cfg = cfg || {};

                    if (FastExt.Base.toBool(cfg.progress, false)
                        || FastExt.Base.toBool(cfg.wait, false)) {
                        cfg.animateTarget = null;
                    } else {
                        if (Ext.isEmpty(cfg.animateTarget)) {
                            cfg.animateTarget = FastExt.Base.getTargetElement(FastExt.System.currClickTarget);
                        }
                        if (!FastExt.Base.toBool(FastExt.System.getExt("window-anim").value, true)) {
                            cfg.animateTarget = null;
                        }
                    }
                    return me.callParent(arguments);
                },

                onShowComplete: function () {
                    this.callParent(arguments);
                    this.toFront(true);
                    this.focus();
                }
            });
        }
    }


    /**
     * 重写Ext.scroll.Scroller相关的功能
     */
    // export class ScrollerOverride {
    //     constructor() {
    //         Ext.override(Ext.scroll.Scroller, {
    //             fireScrollStart: function () {
    //                 let me = this;
    //                 me.callParent(arguments);
    //                 if (me.component && me.component.xtype == "tableview") {
    //                     let menuCmpArray = Ext.ComponentQuery.query("menu[scrollToHidden=true]");
    //                     for (let i = 0; i < menuCmpArray.length; i++) {
    //                         menuCmpArray[i].hide();
    //                     }
    //                 }
    //             }
    //         });
    //     }
    // }


    /**
     * 重写Ext.tip.ToolTip 相关的功能
     */
    export class TooltipOverride {
        constructor() {
            Ext.override(Ext.tip.ToolTip, {
                show: function () {
                    if (BoxReordererOverrider.DRAGGING) {
                        return;
                    }
                    this.callParent(arguments);
                },
                onShow: function () {
                    this.callParent(arguments);
                    if (this.disableDocMouseDown) {
                        //是否禁用 点击其他位置隐藏tooltip
                        Ext.destroy(this.mousedownListener);
                    }
                },
                onDocMouseDown: function (e) {
                    try {
                        this.callParent(arguments);
                    } catch (e) {
                    }
                }
            });
        }
    }


    /**
     * 重写与Ext.tab.Panel相关的功能
     */
    export class TabPanelOverrider {

        constructor() {
            // Ext.override(Ext.layout.container.boxOverflow.Menu, {
            //     handleOverflow: function () {
            //         if (FastOverrider.TabPanelOverrider.BoxReordereBeginDrag) {
            //             //当拖拽时阻止 收入到菜单中
            //             return null;
            //         }
            //         return this.callParent(arguments);
            //     },
            // });

            // Ext.override(Ext.ux.BoxReorderer, {
            //     startDrag: function () {
            //         FastOverrider.TabPanelOverrider.BoxReordereBeginDrag = true;
            //         this.callParent(arguments);
            //     },
            //     endDrag: function () {
            //         FastOverrider.TabPanelOverrider.BoxReordereBeginDrag = false;
            //         this.callParent(arguments);
            //     },
            // });
        }
    }


    /**
     * 重写与Ext.list.Tree相关的功能
     */
    export class TreeListOverrider {

        constructor() {
            Ext.override(Ext.list.Tree, {
                constructor: function () {
                    this.callParent(arguments);
                    this.element.on("contextmenu", this.onContextMenu, this);
                },
                onContextMenu: function (e) {
                    let item = e.getTarget('[data-recordId]'), id;
                    if (item) {
                        id = item.getAttribute('data-recordId');
                        item = this.itemMap[id];
                        if (this.hasListener("itemcontextmenu")) {
                            this.fireEvent("itemcontextmenu", this, item, e);
                        }
                        this.setSelection(item.getNode());
                    }
                },
            });
        }
    }


    /**
     * 重写Ext.ux.BoxReorderer相关功能
     */
    export class BoxReordererOverrider {
        /**
         * 是否拖拽排序中
         */
        static DRAGGING: boolean;

        constructor() {
            Ext.override(Ext.ux.BoxReorderer, {
                startDrag: function () {
                    this.callParent(arguments);
                    BoxReordererOverrider.DRAGGING = true;
                },
                endDrag: function () {
                    this.callParent(arguments);
                    BoxReordererOverrider.DRAGGING = false;
                },
            });
        }
    }

    for (let subClass in FastOverrider) {
        FastOverrider[subClass]();
    }


}