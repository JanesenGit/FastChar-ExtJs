Ext.override(Ext.Component, {
    initComponent: Ext.Function.createSequence(Ext.Component.prototype.initComponent, function () {
        let me = this;
        try {
            me.closeToolText = "关闭";
            if ((me.getXType() == "window" || me.getXType() == "panel")
                && (!Ext.isEmpty(me.getTitle())||!Ext.isEmpty(me.subtitle)) && (me.resizable||me.split)) {
                let fastOnlyCode = $.md5(me.getTitle() + me.subtitle+$("title").text());
                try {
                    fastOnlyCode = $.md5(fastOnlyCode + me.width + me.height);
                } catch (e) {}

                let width = getCache(fastOnlyCode + "Width");
                let height = getCache(fastOnlyCode + "Height");
                let collapse = toBool(getCache(fastOnlyCode + "Collapse"), false);
                if (width != null) {
                    me.setWidth(width);
                }
                if (height != null) {
                    me.setHeight(height);
                }
                me.collapsed = collapse;
                me.setCollapsed(collapse);
                me.on('resize', function (obj, width, height, eOpts) {
                    if (width != Ext.getBody().getWidth()) {
                        setCache(fastOnlyCode + "Width", width);
                    }
                    if (height != Ext.getBody().getHeight()) {
                        setCache(fastOnlyCode + "Height", height);
                    }
                });
                me.on('collapse', function (obj, width, height, eOpts) {
                    setCache(fastOnlyCode + "Collapse", true);
                });
                me.on('expand', function (obj, width, height, eOpts) {
                    setCache(fastOnlyCode + "Collapse", false);
                });
            }

            if (me.getXType() == "menuitem") {
                me.on('focus', function (obj, event, eOpts) {
                    let icon = obj.icon;
                    let regStr=/([^/]*.svg)/;
                    if (icon && regStr.test(icon)) {
                        let newIcon = server.getIcon(regStr.exec(icon)[1].trim(), "#ffffff");
                        let iconEl = Ext.get(obj.getId() + "-iconEl");
                        if (iconEl) {
                            iconEl.setStyle("background-image", "url(" + newIcon + ")");
                        }
                    }
                });
                me.on('blur', function (obj, event, eOpts) {
                    let icon = obj.icon;
                    let regStr=/([^/]*.svg)/;
                    if (icon && regStr.test(icon)) {
                        let iconEl = Ext.get(obj.getId() + "-iconEl");
                        if (iconEl) {
                            iconEl.setStyle("background-image", "url(" + icon + ")");
                        }
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    })
});

Ext.override(Ext.Component, {
    show: function () {
        if (isSystem()) {
            if (this.getXType() == "window"
                || this.getXType() == "messagebox") {
                if (!toBool(this.sessionWin, false)) {
                    //处理session弹窗
                    if (system.sessionOutAlert) {
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
    }
});



Ext.override(Ext.grid.CellContext, {
    setRow: function (row) {
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
    }
});

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
                expanded = me.getExpanded();
                if (expanded.length === 1) {
                    toExpand.expand();
                }

            } else if (toExpand) {
                toExpand.expand();
            }
            owner.deferLayouts = previousValue;
            me.processing = false;
        }
    }
});

Ext.override(Ext.dom.Element, {
    syncContent: function(source) {
        source = Ext.getDom(source);
        let sourceNodes = source.childNodes,
            sourceLen = sourceNodes.length,
            dest = this.dom,
            destNodes = dest.childNodes,
            destLen = destNodes.length,
            i,  destNode, sourceNode,
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
                } catch (e) {}
            }
        }
    }
});
