Ext.override(Ext.grid.Panel, {
    initComponent: Ext.Function.createSequence(Ext.grid.Panel.prototype.initComponent, onGridInitComponent)
});
Ext.override(Ext.tree.Panel, {
    initComponent: Ext.Function.createSequence(Ext.tree.Panel.prototype.initComponent, onGridInitComponent)
});
Ext.override(Ext.grid.Panel, {
    afterRender: Ext.Function.createSequence(Ext.grid.Panel.prototype.afterRender, onGridAfterRender)
});
Ext.override(Ext.tree.Panel, {
    afterRender: Ext.Function.createSequence(Ext.tree.Panel.prototype.afterRender, onGridAfterRender)
});


function onGridInitComponent() {
    let grid = this;
    if (grid.entityList) {
        if (grid.getStore() && grid.getStore().where) {
            grid.fromRecycle = grid.getStore().where['^fromRecycle'];
        }
        configGridContextMenu(grid);
        configDefaultToolBar(grid);
        configGridListeners(grid);
    }
}


function onGridAfterRender() {
    let grid = this;
    if (grid.entityList) {
        let tabContainer = grid.up("[tabContainer=true]");
        if (tabContainer) {
            grid.tabPanelList = true;
        }
        if (!grid.updateButtons || grid.updateButtons.length === 0) {
            grid.updateEnable = false;
        } else {
            grid.updateEnable = true;
        }

        configGridLayout(grid).then(function () {
            configGridTip(grid);
            grid.setLoading(false);
            grid.getStore().grid = grid;
            if (!grid.getStore().isLoaded()) {
                grid.getStore().loadPage(1);
            }
        });
    }
}


/**
 * 添加右键菜单
 */
function addGridContextMenu(grid, target, index) {
    if (grid.contextMenu && target) {
        if (!Ext.isFunction(grid.contextMenu.getXType)) {
            let menu = new Ext.menu.Menu({
                items: []
            });
            if (Ext.isArray(grid.contextMenu)) {
                menu.add(grid.contextMenu);
            }
            grid.contextMenu = menu;
        }
        if (!Ext.isEmpty(index)) {
            grid.contextMenu.insert(index, target);
        } else {
            grid.contextMenu.add(target);
        }
    }
}

/**
 * 配置grid默认的菜单
 * @param grid
 */
function configGridContextMenu(grid) {
    let index = 0;
    addGridContextMenu(grid, {
        iconCls: 'extIcon extDetails editColor',
        text: "查看详情",
        handler: function (obj, event) {
            let subtitle = "";
            if (grid.getStore().entity.menu) {
                subtitle = "【" + grid.getStore().entity.menu.text + "】";
            }

            let win = Ext.create('Ext.window.Window', {
                title: "查看详情" + subtitle,
                subtitle: subtitle,
                height: 480,
                width: 400,
                iconCls: 'extIcon extDetails',
                layout: 'border',
                resizable: true,
                collapsible: true,
                constrain: true,
                maximizable: true,
                animateTarget: obj,
                listeners: {
                    close: function (obj, op) {
                        obj.items.get(0).changeListener.destroy();
                    },
                    show: function (obj) {
                        obj.focus();
                    }
                },
                items: [getDetailsPanel(grid, true)]
            });
            win.show();
        }
    }, index++);
    addGridContextMenu(grid, {
        iconCls: 'extIcon extCopy2',
        text: "复制数据",
        menu: [
            {
                text: '复制单元格',
                iconCls: 'extIcon extCopy2',
                handler: function () {
                    let menu = grid.contextMenu;
                    copyToBoard($(menu.cellTd).text());
                    toast("复制成功！");
                }
            },
            {
                text: '复制整行',
                iconCls: 'extIcon extCopy2',
                handler: function () {
                    let menu = grid.contextMenu;
                    let content = "";
                    $(menu.tr).find("td").each(function () {
                        content += $(this).text() + "\t";
                    });
                    copyToBoard(content);
                    toast("复制成功！");
                }
            },
            {
                text: '复制数据',
                iconCls: 'extIcon extCopy2',
                handler: function () {
                    let menu = grid.contextMenu;
                    let record = menu.record;
                    let fieldName = menu.cellContext.column.dataIndex;
                    copyToBoard(record.get(fieldName));
                    toast("复制成功！");
                }
            }
        ]
    }, index++);
    addGridContextMenu(grid, {
        iconCls: 'extIcon extEdit editColor',
        text: "编辑数据",
        onBeforeShow: function () {
            let menu = this.ownerCt;
            if (Ext.isEmpty(menu.cellContext.column.dataIndex)) {
                this.hide();
                return;
            }
            if (!toBool(menu.cellContext.column.editable, true)) {
                this.hide();
                return;
            }
            this.show();
            if (!menu.cellContext.column.field) {
                if (!menu.cellContext.column.hasListener("dblclick")) {
                    this.hide();
                }
            }
        },
        handler: function () {
            let menu = this.ownerCt;
            if (menu.cellContext.column.field) {
                grid.doEdit = true;
                grid.findPlugin('cellediting').startEditByPosition(menu.cellContext);
            } else {
                menu.cellContext.column.fireEvent("dblclick", grid, this, menu.rowIndex);
            }
        }
    }, index++);

    if (grid.getStore().entity) {
        addGridContextMenu(grid, {
            iconCls: 'extIcon extLink',
            text: "搜索链",
            onBeforeShow: function () {
                this.show();
                let menu = this.ownerCt;
                if (!Ext.isObject(menu.cellContext.column.searchLink)) {
                    this.hide();
                } else {
                    let linkMenu = new Ext.menu.Menu({
                        items: []
                    });
                    let record = menu.record;
                    let fieldName = menu.cellContext.column.dataIndex;
                    let columns = menu.cellContext.column.searchLink.columns;
                    for (let i = 0; i < columns.length; i++) {
                        let column = columns[i];
                        let child = {
                            icon: column.parent.icon,
                            text: column.parent.text + "【" + column.text + "】",
                            column: column,
                            value: record.get(fieldName),
                            handler: function () {
                                let where = {};
                                where[this.column.dataIndex] = this.value;
                                system.showTab(this.column.parent.method,
                                    $.md5(this.column.id + this.value),
                                    "搜索：" + this.text,
                                    this.icon, true, false, where);
                            }
                        };
                        linkMenu.add(child);
                    }
                    this.setMenu(linkMenu);
                }
            },
            menu: []
        }, index++);

        addGridContextMenu(grid, {
            iconCls: 'extIcon extSearch searchColor',
            text: "查找此数据",
            onBeforeShow: function () {
                let menu = this.ownerCt;
                if (Ext.isEmpty(menu.cellContext.column.dataIndex)
                    || isFileColumn(menu.cellContext.column)
                    || isFilesColumn(menu.cellContext.column)) {
                    this.hide();
                } else {
                    this.show();
                }
            },
            handler: function () {
                let menu = this.ownerCt;
                let record = menu.record;
                let fieldName = menu.cellContext.column.dataIndex;
                menu.cellContext.column.searchValue(record.get(fieldName));
            }
        }, index++);

        addGridContextMenu(grid, {
            iconCls: 'extIcon extClear',
            text: "清空此数据",
            onBeforeShow: function () {
                let menu = this.ownerCt;
                if (Ext.isEmpty(menu.cellContext.column.dataIndex)) {
                    this.hide();
                } else {
                    this.show();
                }
            },
            handler: function () {
                let me = this;
                Ext.Msg.confirm("系统提醒", "您确定清空选中的单元格数据吗？", function (button, text) {
                    if (button === "yes") {
                        let menu = me.ownerCt;
                        let record = menu.record;
                        let fieldName = menu.cellContext.column.dataIndex;

                        if (Ext.isObject(menu.cellContext.column.field)) {
                            if (!Ext.isEmpty(menu.cellContext.column.field.name)) {
                                fieldName = menu.cellContext.column.field.name;
                            }
                        }

                        let params = {"entityCode": grid.getStore().entity.entityCode};
                        for (let j = 0; j < grid.getStore().entity.idProperty.length; j++) {
                            let idName = grid.getStore().entity.idProperty[j];
                            params['data.' + idName] = record.get(idName);
                        }
                        if (grid.getStore().entity.menu) {
                            params["menu"] = grid.getStore().entity.menu.text;
                        }
                        params['data.' + fieldName] = "<null>";
                        showWait("正在清空中……");
                        server.updateEntity(params, function (success, message) {
                            hideWait();
                            if (success) {
                                toast("清除成功！");
                                grid.getStore().reload();
                            } else {
                                Ext.Msg.alert('系统提醒', message);
                            }
                        });
                    }
                });
            }
        }, index++);
    }
}

function configDefaultToolBar(grid) {
    if (!grid) {
        return;
    }
    let toolbar = grid.down("toolbar[dock='top']");
    if (toolbar) {
        if (toBool(grid.fromRecycle, false)) {
            toolbar.setHidden(true);
            return;
        }
        let button = {
            xtype: 'button',
            text: '更多操作',
            iconCls: 'extIcon extMore',
            menu: [
                {
                    text: '导出Excel',
                    iconCls: 'extIcon extExcel',
                    hidden: !toBool(grid.operate.excelOut, true),
                    handler: function () {
                        exportGrid(grid);
                    }
                },
                {
                    text: '导入Excel',
                    iconCls: 'extIcon extExcel',
                    hidden: !toBool(grid.operate.excelIn, true),
                    menu: [
                        {
                            text: '下载模板',
                            iconCls: 'extIcon extExcelModule searchColor',
                            handler: function () {
                                showWait("正在生成中……");
                                let params = {entityCode: grid.getStore().entity.entityCode};
                                if (grid.getStore().entity.menu) {
                                    params.title = grid.getStore().entity.menu.text;
                                }
                                Ext.each(grid.getColumns(), function (item, index) {
                                    //排除文件类
                                    if (isFileColumn(item) || isFilesColumn(item)
                                        || !toBool(item.excelHeader, true)) {
                                        return;
                                    }
                                    if (!Ext.isEmpty(item.dataIndex)) {
                                        let indexStr = index;
                                        if (index < 10) {
                                            indexStr = "0" + index;
                                        }
                                        params["column[" + indexStr + "].width"] = item.width;
                                        params["column[" + indexStr + "].text"] = item.configText;
                                        params["column[" + indexStr + "].enum"] = getEnumName(item);
                                        params["column[" + indexStr + "].type"] = getColumnFieldType(item);
                                        params["column[" + indexStr + "].dataIndex"] = item.dataIndex;
                                        if (isLinkColumn(item)) {
                                            params["column[" + indexStr + "].dataIndex"] = item.field.name;
                                        }
                                    }
                                });
                                server.excelModule(params, function (success, data, message) {
                                    hideWait();
                                    if (success) {
                                        toast("生成成功！");
                                        location.href = "attach/" + data;
                                    } else {
                                        Ext.Msg.alert('系统提醒', "生成失败！" + message);
                                    }
                                });
                            }
                        },
                        {
                            text: '导入数据',
                            iconCls: 'extIcon extExcelImport searchColor',
                            handler: function () {
                                let params = {entityCode: grid.getStore().entity.entityCode};
                                importExcel(this, params, grid.importExcelItems).then(function (data) {
                                    if (data) {
                                        grid.getStore().loadPage(1);
                                    }
                                });
                            }
                        }
                    ]
                },
                {
                    iconCls: 'extIcon extSet',
                    text: '操作设置',
                    handler: function () {
                        setGrid(this, grid);
                    }
                }]
        };
        toolbar.add("->");
        toolbar.add(button);
    }
}

/**
 * 配置grid的tip提醒
 */
function configGridTip(grid) {
    if (!grid) {
        return;
    }
    let view = grid.getView();
    if (!view) {
        return;
    }
    grid.tip = new Ext.ToolTip({
        target: view.el,
        delegate: '.x-grid-cell-inner',
        trackMouse: true,
        renderTo: Ext.getBody(),
        listeners: {
            beforeshow: function (tip) {
                if (grid.operate && !grid.operate.hoverTip) {
                    return false;
                }
                let innerHTML = tip.triggerElement.innerHTML;
                if (Ext.isEmpty(innerHTML) || innerHTML === "&nbsp;") {
                    return false;
                }
                let tipHtml = innerHTML;
                let dataChild = tip.triggerElement.firstChild;
                if (dataChild != null && dataChild.nodeType === 1) {
                    if (dataChild.getAttribute("class") === "x-grid-row-checker") {
                        return false;
                    }
                    let detailsId = dataChild.getAttribute("details-id");
                    if (window[detailsId]) {
                        tip.update(window[detailsId]);
                        return true;
                    }
                }
                tip.update(tipHtml);
            }
        }
    });
}


/**
 * 配置grid事件监听
 * @param grid
 */
function configGridListeners(grid) {
    if (!grid || grid.configListener) {
        return;
    }
    grid.configListener = true;
    grid.on('viewready', function (obj, eOpts) {
        obj.getHeaderContainer().sortOnClick = false;
    });
    grid.on('beforedestroy', function (obj, eOpts) {
        saveGridColumn(obj);
    });
    grid.on('headertriggerclick', function (ct, column, e, t, eOpts) {
        if (Ext.isEmpty(column.dataIndex)|| grid.fromRecycle) return;
        ct.sortOnClick = false;
        ct.triggerColumn = column;
    });
    grid.on('headercontextmenu', function (ct, column, e, t, eOpts) {
        if (Ext.isEmpty(column.dataIndex)|| grid.fromRecycle) return;
        ct.sortOnClick = false;
        ct.onHeaderTriggerClick(column, e, column.triggerEl);
    });

    grid.on('headermenucreate', function (ct, menu, headerCt, eOpts) {
        grid.columnHeadMenu = menu;
        configGridHeadMenu(grid);
    });

    grid.on('headerclick', function (ct, column, e, t, eOpts) {
        if (Ext.isEmpty(column.dataIndex)) return;
        ct.sortOnClick = false;
        if (!showColumnSearchMenu(column)) {
            ct.onHeaderTriggerClick(column, e, column.triggerEl);
        }
    });
    grid.on('sortchange', function (ct, column, direction, eOpts) {
        if (Ext.isEmpty(column.dataIndex)) return;
        column.sortDirection = direction;
        refreshColumnStyle(column);
    });

    grid.on('columnresize', function (ct, column, width, eOpts) {
        column.width = width;
        ct.sortOnClick = false;
    });

    grid.on('columnschanged', function (ct, eOpts) {
        ct.sortOnClick = false;
    });

    grid.on('cellcontextmenu', function (obj, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        if (Ext.isEmpty(e.position.column.dataIndex) || grid.fromRecycle) {
            return;
        }
        if (Ext.isObject(grid.contextMenu)) {
            if (grid.contextMenu.items.length > 0) {
                grid.contextMenu.cellIndex = cellIndex;
                grid.contextMenu.record = record;
                grid.contextMenu.rowIndex = rowIndex;
                grid.contextMenu.cellTd = td;
                grid.contextMenu.tr = tr;
                grid.contextMenu.cellContext = e.position;
                grid.contextMenu.on("show", function (currMenu, eOpts) {
                    if (currMenu.cellTd) {
                        let tdColor = toColor(getExt("front-color-dark").value);
                        $(currMenu.cellTd).css("background", tdColor);
                    }
                });
                grid.contextMenu.on("hide", function (currMenu, eOpts) {
                    if (currMenu.cellTd) {
                        $(currMenu.cellTd).css("background", "transparent");
                    }
                });
                obj.getSelectionModel().select(record);
                obj.fireEvent("selectionchange", obj, record, eOpts);

                fireMenuEvent(grid.contextMenu, "onBeforeShow");
                grid.contextMenu.showAt(e.getXY());
            }
        }
    });
    grid.getStore().on('endupdate', function (eOpts) {
        try {
            if (!grid.getStore()) {
                return true;
            }
            if (grid.getStore().holdUpdate) {
                return true;
            }
            let records = grid.getStore().getUpdatedRecords();
            Ext.each(grid.updateButtons, function (item, index) {
                item.setDisabled(records.length === 0);
            });
            if (grid.operate && grid.operate.autoUpdate) {
                commitStoreUpdate(grid.getStore());
            }
        } catch (e) {
            showException(e, "endupdate");
        }
    });
    grid.on("celldblclick", function (obj, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        grid.doEdit = true;
    });
    grid.on('beforeedit', function (editor, context, eOpts) {
        if (!grid.updateEnable) {
            return false;
        }
        if (!grid.doEdit) {
            return false;
        }
        if (grid.fromRecycle) {
            return false;
        }
        grid.doEdit = false;
        if (!toBool(context.column.editable, true)) {
            return false;
        }
        if (context.column.hasListener("beforeedit")) {
            if (!context.column.fireEvent("beforeedit", context)) {
                return false;
            }
        }
        let editorField = context.column.field;
        let cell = Ext.get(context.cell);
        editorField.labelTitle = context.column.text;
        if (Ext.isFunction(editorField.setValue) && !toBool(context.column.password, false)) {
            if (Ext.isObject(context.value) || Ext.isArray(context.value)) {
                editorField.setValue(JSON.stringify(context.value), context.record);
            } else {
                editorField.setValue(context.value, context.record);
            }
        }
        if (Ext.isFunction(editorField.showWindow)) {
            editorField.showWindow(cell, function (result) {
                if (Ext.isEmpty(context.value) && Ext.isEmpty(result.getValue())) {
                    return;
                }
                setRecordValue(context.record, context.field, result);
            });
            return false;
        }

        if (!context.column.editMenu) {
            context.column.editMenu = Ext.create('Ext.menu.Menu', {
                modal: true,
                layout: 'fit',
                showSeparator: false,
                items: [
                    {
                        xtype: 'panel',
                        layout: 'fit',
                        width: cell.getWidth(),
                        height: cell.getHeight(),
                        style: {
                            background: "#ffffff",
                            borderWidth: 1,
                            borderColor: "#ffffff",
                            color: '#eeeee'
                        },
                        border: 0,
                        items: [editorField]
                    }],
                listeners: {
                    show: function (obj, epts) {
                        let fieldObj = obj.items.get(0).items.get(0);
                        fieldObj.focus();
                        try {
                            new Ext.util.KeyMap({
                                target: obj.getEl(),
                                key: 13,
                                fn: function (keyCode, e) {
                                    obj.hide();
                                },
                                scope: this
                            });
                        } catch (e) {
                            console.error(e);
                        }
                    },
                    beforehide: function (obj, epts) {
                        let fieldObj = obj.items.get(0).items.get(0);
                        if (!fieldObj.isValid()) {
                            let currError = fieldObj.getErrors();
                            if (currError) {
                                toast(currError[0]);
                            }
                            shakeComment(obj, function () {
                                obj.holdShow = false;
                            });
                            obj.holdShow = true;
                            return false;
                        }
                        return true;
                    },
                    hide: function (obj, epts) {
                        if (!obj.context) {
                            return;
                        }
                        let fieldObj = obj.items.get(0).items.get(0);
                        if ((Ext.isEmpty(obj.context.value) || toBool(obj.context.column.password, false)) && Ext.isEmpty(fieldObj.getValue())) {
                            return;
                        }
                        setRecordValue(obj.context.record, obj.context.field, fieldObj);
                    }
                }
            });
        }
        context.column.editMenu.setWidth(context.column.getWidth());
        context.column.editMenu.context = context;
        context.column.editMenu.showBy(cell, "tl");
        return false;
    });

    grid.on('selectionchange', function (obj, selected, eOpts) {
        try {
            if (grid.selectButtons) {
                Ext.each(grid.selectButtons, function (item, index) {
                    let selectSize = obj.getSelection().length;
                    let checkSelect = item.checkSelect;
                    if (checkSelect === "multiple" || checkSelect === "m" || checkSelect > 1) {
                        item.setDisabled(!(selectSize > 0));
                    } else if (checkSelect === "radio" || checkSelect === "r" || checkSelect === "single" || checkSelect === "s" || checkSelect === 1) {
                        item.setDisabled(!(selectSize === 1));
                    }
                });
            }
        } catch (e) {
            showException(e, "按钮选中检测！[selectionchange]");
        }
    });
}


function configGridLayout(grid) {
    return new Ext.Promise(function (resolve, reject) {
        if (!grid) {
            return;
        }
        grid.setLoading("初始化配置中……");
        restoreGridOperate(grid).then(function () {
            restoreGridColumn(grid).then(function () {
                resolve(true);
            });
        });
    });
}


/**
 * 配置grid列的菜单
 */
function configGridHeadMenu(grid) {
    if (!toBool(grid.columnContextMenu, true)) {
        return;
    }
    if (!grid.columnHeadMenu) {
        return;
    }
    if (!grid.columnMenu) {
        grid.columnMenu = {};
    }
    if (!grid.columnMenu) {
        return;
    }
    let menu = grid.columnHeadMenu;
    menu.on("beforeshow", function (obj) {
        if (isFilesColumn(obj.activeHeader)
            || isFileColumn(obj.activeHeader)
            || !hasColumnField(menu.activeHeader)) {
            obj.activeHeader.batchUpdate = false;
            obj.activeHeader.operation = false;
            obj.activeHeader.searchLink = false;
            obj.activeHeader.batchRandom = false;
        }
        if (isFileColumn(obj.activeHeader)) {
            obj.activeHeader.batchUpdate = true;
        }
        if (isContentColumn(obj.activeHeader)) {
            obj.activeHeader.searchLink = false;
        }
        if (!obj.configHeadMenu) {
            obj.configHeadMenu = true;

            let menus = [];
            if (toBool(grid.columnMenu.lookField, true)) {
                menus.push({
                    text: '查看字段',
                    iconCls: 'extIcon extField',
                    onBeforeShow: function () {
                        if (toBool(menu.activeHeader.lookField, true)) {
                            this.show();
                        } else {
                            this.hide();
                        }
                    },
                    handler: function () {
                        Ext.Msg.alert("查看字段", menu.activeHeader.dataIndex);
                    }
                });
            }

            menus.push({
                text: '清除无效数据',
                iconCls: 'extIcon extClear grayColor',
                onBeforeShow: function () {
                    if (toBool(menu.activeHeader.batchClear, true)) {
                        this.show();
                    } else {
                        this.hide();
                    }
                },
                handler: function () {
                    let confirmConfig = {
                        title: "清除无效数据",
                        icon: Ext.Msg.QUESTION,
                        message: "将属性【" + menu.activeHeader.text + "】在【当前当前条件】下为空的所有无效数据！请您确定操作！",
                        buttons: Ext.Msg.YESNO,
                        defaultFocus: "no",
                        callback: function (button, text) {
                            if (button === "yes") {
                                showWait("正在清除数据中……");
                                let columnGrid = getColumnGrid(menu.activeHeader);
                                let storeParams = columnGrid.getStore().proxy.extraParams;
                                let params = {
                                    "entityCode": columnGrid.getStore().entity.entityCode,
                                    "field": menu.activeHeader.dataIndex,
                                    "menu": columnGrid.getStore().entity.menu.text
                                };

                                server.clearEntity(mergeJson(params, storeParams), function (success, message) {
                                    hideWait();
                                    if (success) {
                                        getColumnGrid(menu.activeHeader).getStore().loadPage(1);
                                    }
                                    showAlert("清理结果", message);
                                });
                            }
                        }
                    };

                    Ext.Msg.confirm(confirmConfig);
                }
            });

            if (grid.getStore().entity) {
                if (toBool(grid.columnMenu.searchLink, true)) {
                    menus.push({
                        text: '配置搜索链',
                        iconCls: 'extIcon extLink',
                        onBeforeShow: function () {
                            let columnGrid = getColumnGrid(menu.activeHeader);
                            if (columnGrid.fromRecycle) {
                                this.hide();
                                return;
                            }
                            if (toBool(menu.activeHeader.searchLink, true)) {
                                this.show();
                            } else {
                                this.hide();
                            }
                        },
                        handler: function () {
                            configColumnSearchLink(menu.activeHeader);
                        }
                    });
                }
                if (toBool(grid.columnMenu.operation, true)) {
                    menus.push({
                        text: '计算数据',
                        iconCls: 'extIcon extMath',
                        onBeforeShow: function () {
                            let columnGrid = getColumnGrid(menu.activeHeader);
                            if (columnGrid.fromRecycle) {
                                this.hide();
                                return;
                            }
                            if (toBool(menu.activeHeader.operation, false)) {
                                this.show();
                            } else {
                                this.hide();
                            }
                        },
                        menu: [
                            {
                                text: '计算总和',
                                iconCls: 'extIcon extMath',
                                handler: function () {
                                    showCompute(grid, menu.activeHeader, 'sum');
                                }
                            },
                            {
                                text: '计算平均值',
                                iconCls: 'extIcon extMath',
                                handler: function () {
                                    showCompute(grid, menu.activeHeader, 'avg');
                                }
                            },
                            {
                                text: '计算最大值',
                                iconCls: 'extIcon extMath',
                                handler: function () {
                                    showCompute(grid, menu.activeHeader, 'max');
                                }
                            },
                            {
                                text: '计算最小值',
                                iconCls: 'extIcon extMath',
                                handler: function () {
                                    showCompute(grid, menu.activeHeader, 'min');
                                }
                            }
                        ]
                    });
                }
            }

            if (toBool(grid.columnMenu.batchUpdate, true)) {
                menus.push({
                    text: '批量修改值',
                    iconCls: 'extIcon extEdit',
                    onBeforeShow: function () {
                        let columnGrid = getColumnGrid(menu.activeHeader);
                        if (columnGrid.fromRecycle) {
                            this.hide();
                            return;
                        }
                        if (!toBool(menu.activeHeader.editable, true)) {
                            this.hide();
                            return;
                        }
                        if (toBool(menu.activeHeader.batchUpdate, true)) {
                            this.show();
                        } else {
                            this.hide();
                        }
                    },
                    handler: function () {
                        batchEditColumn(menu.activeHeader);
                    }
                });
            }

            if (toBool(grid.columnMenu.batchRandom, true)) {
                menus.push({
                    text: '批量随机值',
                    iconCls: 'extIcon extRandom',
                    onBeforeShow: function () {
                        let columnGrid = getColumnGrid(menu.activeHeader);
                        if (columnGrid.fromRecycle) {
                            this.hide();
                            return;
                        }
                        if (!toBool(menu.activeHeader.editable, true)) {
                            this.hide();
                            return;
                        }
                        if (isLinkColumn(menu.activeHeader)) {
                            this.hide();
                            return;
                        }
                        if (toBool(menu.activeHeader.batchRandom, true)) {
                            this.show();
                        } else {
                            this.hide();
                        }
                    },
                    handler: function () {
                        batchEditColumnRandom(menu.activeHeader);
                    }
                });
            }

            if (toBool(grid.columnMenu.cancelSort, true)) {
                menus.push({
                    text: '取消排序',
                    iconCls: 'extIcon extCancelOrder',
                    onBeforeShow: function () {
                        let columnGrid = getColumnGrid(menu.activeHeader);
                        if (columnGrid.fromRecycle) {
                            this.hide();
                            return;
                        }
                        if (toBool(menu.activeHeader.cancelSort, true)) {
                            this.show();
                        } else {
                            this.hide();
                        }
                    },
                    handler: function () {
                        try {
                            let sortCollection = grid.getStore().getSorters();
                            if (sortCollection.count() === 0) {
                                return;
                            }
                            sortCollection.removeByKey(menu.activeHeader.dataIndex);
                            grid.getStore().loadPage(1);
                            menu.activeHeader.sortDirection = null;
                            refreshColumnStyle(menu.activeHeader);
                        } catch (e) {
                            showException(e);
                        }
                    }
                });
            }
            obj.insert(0, menus);
        }
        fireMenuEvent(obj, "onBeforeShow");
    });
}


/**
 * 获得grid的选择插件
 * @returns
 */
function getGridSelModel() {
    return Ext.create('Ext.grid.selection.SpreadsheetModel', {
        pruneRemoved: false,
        checkboxSelect: true,
        hasLockedHeader: true,
        cellSelect: false,
        rowNumbererHeaderWidth: 0
    });
}


/**
 * 获得分页控件
 * @param dataStore 数据源
 */
function getPageToolBar(dataStore) {
    let entityRecycle = false;
    if (dataStore.entity && toBool(dataStore.entity.recycle, false)) {
        entityRecycle = true;
    }
    let fromRecycle = false;
    if (dataStore.where && toBool(dataStore.where['^fromRecycle'], false)) {
        fromRecycle = true;
    }

    let pagingtoolbar = Ext.create('Ext.toolbar.Paging', {
        store: dataStore,
        dock: 'bottom',
        pageSize: dataStore.pageSize,
        displayInfo: true,
        inputItemWidth: 70,
        overflowHandler: 'scroller'
    });

    let control = {
        xtype: 'combo',
        pageTool: true,
        displayField: 'text',
        valueField: 'id',
        fieldLabel: '每页',
        labelWidth: 40,
        editable: false,
        width: 130,
        value: dataStore.pageSize,
        store: getPageDataStore(),
        listeners: {
            change: function (obj, newValue, oldValue) {
                if (newValue != null && newValue != 0) {
                    let pageRecord = obj.getStore().getById(newValue);
                    if (!pageRecord) {
                        obj.totalCount = newValue;
                        obj.setValue(-1);
                        return;
                    }

                    if (newValue === -1) {
                        this.ownerCt.pageSize = dataStore.getTotalCount();
                        dataStore.pageSize = dataStore.getTotalCount();
                        if (!Ext.isEmpty(obj.totalCount)) {
                            this.ownerCt.pageSize = obj.totalCount;
                            dataStore.pageSize = obj.totalCount;
                        }
                    } else {
                        this.ownerCt.pageSize = newValue;
                        dataStore.pageSize = newValue;
                    }
                    dataStore.loadPage(1);
                }
            }
        }
    };

    let copyBtn = {
        xtype: 'button',
        tooltip: '拷贝数据',
        checkSelect: 2,
        iconCls: 'extIcon extCopy2 grayColor',
        handler: function () {
            let selection = dataStore.grid.getSelection();
            if (selection.length === 0) {
                showAlert("系统提醒", "请选择需要复制的数据！");
                return;
            }
            Ext.Msg.confirm("系统提醒", "您确定复制选中的" + selection.length + "条数据吗？", function (button, text) {
                if (button === "yes") {
                    showWait("正在复制数据中……");
                    commitStoreCopy(dataStore.grid.getStore(), dataStore.grid.getSelection()).then(function (success) {
                        if (success) {
                            dataStore.grid.getSelectionModel().deselectAll();
                            let grouped = dataStore.grid.getStore().isGrouped();
                            if (grouped) {
                                dataStore.grid.getView().getFeature('group').collapseAll();
                            }
                            hideWait();
                        }
                    });
                }
            });
        }
    };

    let deleteAllBtn = {
        xtype: 'button',
        tooltip: '清空数据',
        iconCls: 'extIcon extClear grayColor',
        handler: function () {
            let confirmFunction = function (button, text) {
                if (button === "yes") {
                    showWait("正在清空数据中……");
                    let storeParams = dataStore.grid.getStore().proxy.extraParams;
                    let params = {"entityCode": dataStore.entity.entityCode, "all": true};
                    if (dataStore.grid.getStore().entity.menu) {
                        params["menu"] = dataStore.grid.getStore().entity.menu.text;
                    }
                    server.deleteEntity(mergeJson(params, storeParams), function (success, message) {
                        hideWait();
                        if (success) {
                            dataStore.loadPage(1);
                        }
                        showAlert("系统提醒", message);
                    });
                }
            };

            let message = "<b style='color: red;font-size: 16px;line-height: 18px;'>请您谨慎操作！</b><br/>您确定清空当前条件下的所有数据吗？！<br/>当前共" + dataStore.getTotalCount() + "条数据！";
            if (entityRecycle) {
                message += "<br/><b style='color: red;font-size: 14px;line-height: 18px;'>此操作将跳过回收站！</b>";
            }
            let confirmConfig = {
                title: "系统提醒",
                icon: Ext.Msg.QUESTION,
                message: message,
                buttons: Ext.Msg.YESNO,
                defaultFocus: "no",
                callback: confirmFunction
            };


            let hideFunction = function () {
                clearTimeout(Ext.Msg.timeout);
                let msgButton = Ext.Msg.msgButtons["yes"];
                msgButton.setText("是");
                msgButton.enable();
            };

            Ext.Msg.on("hide", hideFunction, this, {single: true});
            Ext.Msg.show(confirmConfig);
            let timeFunction = function (second) {
                let msgButton = Ext.Msg.msgButtons["yes"];
                if (second <= 0) {
                    msgButton.setText("立即清空");
                    msgButton.enable();
                    return;
                } else {
                    msgButton.setText(second + "秒后可操作");
                    msgButton.disable();
                }
                Ext.Msg.timeout = setTimeout(function () {
                    timeFunction(second - 1);
                }, 1000);
            };
            timeFunction(5);
        }
    };

    if (fromRecycle) {
        deleteAllBtn.tooltip = "清空回收站";
    }

    let recycleBtn = {
        xtype: 'button',
        tooltip: '回收站',
        iconCls: 'extIcon extRecycle grayColor',
        handler: function () {
            showRecycleGrid(this, dataStore);
        }
    };


    let searchBtn = {
        xtype: 'button',
        toolType: 'searchBtn',
        tooltip: '搜索数据',
        iconCls: 'extIcon extSearch grayColor',
        handler: function () {
            showColumnSearchWin(this, dataStore.grid);
        }
    };

    let sortBtn = {
        xtype: 'button',
        toolType: 'sortBtn',
        tooltip: '排序数据',
        iconCls: 'extIcon extSort grayColor',
        handler: function () {
            showColumnSortWin(this, dataStore.grid);
        }
    };


    pagingtoolbar.insert(0, control);
    let beginIndex = 2;
    pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, "-");
    pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, searchBtn);
    pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, sortBtn);

    if (fromRecycle) {
        let rebackBtn = {
            xtype: 'button',
            tooltip: '还原数据',
            checkSelect: 2,
            iconCls: 'extIcon extReback grayColor',
            handler: function () {
                rebackGridData(dataStore.grid);
            }
        };
        pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, "-");
        pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, rebackBtn);
    }

    if (system.isSuperRole()) {
        pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, "-");
        if (!fromRecycle) {
            pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, copyBtn);
        }
        pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, deleteAllBtn);
    }
    if (!fromRecycle && entityRecycle) {
        pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, "-");
        pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, recycleBtn);
    }

    return pagingtoolbar;
}


/**
 * 删除数据
 */
function deleteGridData(grid) {
    return new Ext.Promise(function (resolve, reject) {
        if (!grid.getStore().entity) {
            Ext.Msg.alert('系统提醒', '删除失败！Grid的DataStore未绑定Entity!');
            return;
        }
        if (grid.getSelection().length === 0) {
            toast('请您先选择需要删除的数据！');
            return;
        }
        let selectLength = grid.getSelection().length;
        let doDelete = function () {
            showWait("正在删除数据中……");
            commitStoreDelete(grid.getStore(), grid.getSelection()).then(function (success) {
                if (success) {
                    grid.getSelectionModel().deselectAll();
                    let grouped = grid.getStore().isGrouped();
                    if (grouped) {
                        grid.getView().getFeature('group').collapseAll();
                    }
                    hideWait();
                }
                resolve(success);
            });
        };
        if (grid.operate && grid.operate.alertDelete) {
            let confirmConfig = {
                title: "系统提醒",
                icon: Ext.Msg.QUESTION,
                message: "您确定删除选中的" + selectLength + "条数据吗？",
                buttons: Ext.Msg.YESNO,
                defaultFocus: "no",
                callback: function (button, text) {
                    if (button === "yes") {
                        doDelete();
                    }
                }
            };
            Ext.Msg.show(confirmConfig);
        } else {
            doDelete();
        }
    });
}


/**
 * 还原回收站里的数据
 */
function rebackGridData(grid) {
    return new Ext.Promise(function (resolve, reject) {
        if (!grid.getStore().entity) {
            Ext.Msg.alert('系统提醒', '还原失败！Grid的DataStore未绑定Entity!');
            return;
        }
        if (grid.getSelection().length === 0) {
            toast('请您先选择需要还原的数据！');
            return;
        }
        let selectLength = grid.getSelection().length;
        let doDelete = function () {
            showWait("正在还原数据中……");
            commitStoreReback(grid.getStore(), grid.getSelection()).then(function (success, message) {
                if (success) {
                    grid.getSelectionModel().deselectAll();
                    let grouped = grid.getStore().isGrouped();
                    if (grouped) {
                        grid.getView().getFeature('group').collapseAll();
                    }
                    hideWait();
                    Ext.Msg.alert('系统提醒', '还原成功！');
                }
                resolve(success);
            });
        };
        let confirmConfig = {
            title: "系统提醒",
            icon: Ext.Msg.QUESTION,
            message: "您确定还原选中的" + selectLength + "条数据吗？",
            buttons: Ext.Msg.YESNO,
            defaultFocus: "no",
            callback: function (button, text) {
                if (button === "yes") {
                    doDelete();
                }
            }
        };
        Ext.Msg.show(confirmConfig);
    });
}

/**
 * 提交需改grid数据
 * @param grid
 */
function updateGridData(grid) {
    return new Ext.Promise(function (resolve, reject) {
        if (!grid.getStore().entity) {
            Ext.Msg.alert('系统提醒', '修改失败！Grid的DataStore未绑定Entity!');
            return;
        }
        let records = grid.getStore().getUpdatedRecords();
        if (records.length === 0) {
            toast('当前暂无数据被修改！');
            return;
        }
        if (grid.operate && grid.operate.alertUpdate) {
            Ext.Msg.confirm("系统提醒", "您确定提交被修改的数据吗？", function (button, text) {
                if (button === "yes") {
                    showWait("正在修改数据中……");
                    commitStoreUpdate(grid.getStore()).then(function (result) {
                        resolve(result);
                        if (result) {
                            hideWait();
                        }
                    });
                }
            });
        } else {
            showWait("正在修改数据中……");
            commitStoreUpdate(grid.getStore()).then(function (result) {
                resolve(result);
                if (result) {
                    hideWait();
                }
            });
        }
    });
}

/**
 * 保存grid的列信息
 */
function saveGridColumn(grid) {
    if (Ext.isEmpty(grid.code)) {
        return;
    }
    return new Ext.Promise(function (resolve, reject) {
        try {
            let columnInfos = {};
            Ext.each(grid.getColumns(), function (item, index) {
                if (!Ext.isEmpty(item.dataIndex)) {
                    let columnInfo = {column: true};
                    columnInfo["width"] = item.width;
                    columnInfo["hidden"] = item.isHidden();
                    columnInfo["locked"] = item.isLocked();
                    columnInfo["text"] = item.configText;
                    columnInfo["dataIndex"] = item.dataIndex;
                    if (grid.getStore().entity) {
                        columnInfo["entityCode"] = grid.getStore().entityCode;
                    }
                    let sortConfig = grid.getStore().getSorters().getByKey(item.dataIndex);
                    if (sortConfig) {
                        columnInfo["sortDirection"] = sortConfig.getDirection();
                    }
                    columnInfo["searchLink"] = item.searchLink;
                    columnInfo["index"] = item.getIndex();

                    let rendererStr = item.renderer.toString();
                    rendererStr = "function " + rendererStr.substring(rendererStr.indexOf("("));
                    columnInfo["renderer"] = rendererStr;
                    columnInfo["rendererFunction"] = item.rendererFunction;
                    columnInfos[item.code] = columnInfo;
                }
            });

            let pageTool = {
                pageSize: grid.getStore().pageSize,
                column: false
            };
            columnInfos["PageTool"] = pageTool;

            let params = {};
            if (grid.getStore().entity && grid.getStore().entity.menu) {
                params["menuId"] = grid.getStore().entity.menu.id;
                if (system.isSuperRole() && toBool(grid.tabPanelList, false)) {//左侧主菜单
                    params["entityCode"] = grid.getStore().entity.entityCode;
                }
            }
            server.saveExtConfig(grid.code, "GridColumn", Ext.encode(columnInfos), function (success, message) {
                resolve(success);
            }, params);
        } catch (e) {
            reject(e);
        }
    });
}

function restoreGridOperate(grid) {
    return new Ext.Promise(function (resolve, reject) {
        try {
            if (Ext.isEmpty(grid.code)) {
                reject("Grid编号[code]不可为空！");
                return;
            }
            server.showExtConfig(grid.code, "GridOperate", function (success, value) {
                if (success) {
                    grid.operate = Ext.decode(value);
                } else if (Ext.isEmpty(grid.operate)) {
                    grid.operate = {
                        alertDelete: true,
                        alertUpdate: true,
                        autoUpdate: false,
                        autoDetails: true,
                        hoverTip: false
                    };
                }
                resolve();
            });
        } catch (e) {
            reject(e);
        }
    });
}


/**
 * 还原column配置
 */
function restoreGridColumn(grid) {
    return new Ext.Promise(function (resolve, reject) {
        try {
            if (Ext.isEmpty(grid.code)) {
                reject("Grid编号[code]不可为空！");
                return;
            }
            server.showExtConfig(grid.code, "GridColumn", function (success, value) {
                let columnInfos = {};
                if (success) {
                    columnInfos = Ext.decode(value);
                }
                let newColumns = [];
                let sorts = [];
                let configColumns = grid.getColumns();
                for (let i = 0; i < configColumns.length; i++) {
                    let column = configColumns[i];
                    if (!Ext.isEmpty(column.dataIndex)) {
                        let newColumn = column.cloneConfig();
                        if (columnInfos.hasOwnProperty(column.code)) {
                            let info = columnInfos[column.code];
                            for (let key in info) {
                                if (key === "renderer" || key === "rendererFunction") {
                                    continue;
                                }
                                newColumn[key] = info[key];
                            }
                        }
                        if (newColumn["sortDirection"]) {
                            sorts.push({
                                property: newColumn.dataIndex,
                                direction: newColumn.sortDirection
                            });
                        }
                        newColumns.push(newColumn);
                    }
                }
                newColumns.sort(function (a, b) {
                    return a.index - b.index;
                });
                if (columnInfos.hasOwnProperty("PageTool")) {
                    let pageTool = columnInfos["PageTool"];
                    grid.getStore().pageSize = pageTool.pageSize;
                    let comboPage = grid.down("combo[pageTool=true]");
                    if (comboPage) {
                        comboPage.setValue(pageTool.pageSize);
                    }
                }
                grid.getStore().sort(sorts);
                grid.reconfigure(newColumns);
                resolve();
            });
        } catch (e) {
            reject(e);
        }
    });
}


/**
 * 创建详情grid
 */
function builderDetailsGrid() {
    let detailsStore = Ext.create('Ext.data.Store', {
        autoLoad: false,
        fields: []
    });

    let detailsGrid = Ext.create('Ext.grid.Panel', {
        border: 0,
        scrollable: 'y',
        region: 'center',
        store: detailsStore,
        hideHeaders: true,
        deferRowRender: true,
        superGrid: null,
        setRecord: function (grid, record) {
            this.superGrid = grid;
            let columns = grid.getColumns();
            let data = [];
            for (let i = 0; i < columns.length; i++) {
                let column = columns[i];
                if (Ext.isEmpty(column.dataIndex) || !toBool(column.hideable, true)) {
                    continue;
                }
                let item = {
                    text: column.configText,
                    value: record.get(column.dataIndex),
                    dataIndex: column.dataIndex,
                    renderer: column.renderer,
                    index: column.getIndex(),
                    record: record
                };
                data.push(item);
            }
            detailsStore.loadData(data);
            detailsStore.sort('index', 'ASC');
        },
        columns: [
            {
                header: '名称',
                dataIndex: 'text',
                align: 'right',
                flex: 0.3,
                tdCls: 'tdVTop',
                renderer: function (val, m, r) {
                    m.style = 'color:#000000;overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                    return "<b>" + val + "：</b>";
                }
            },
            {
                header: '值',
                dataIndex: 'value',
                flex: 0.7,
                align: 'left',
                renderer: function (val, m, r) {
                    try {
                        m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                        let fun = r.get("renderer");
                        if (Ext.isFunction(fun)) {
                            let value = fun(val, m, r.get("record"), -1, -1, null, null, true);
                            if (Ext.isEmpty(value)) {
                                return "<font color='#ccc'>无</font>"
                            }
                            return value;
                        }
                        return val;
                    } catch (e) {
                        return val;
                    }
                }
            }],
        tbar: {
            flex: 1,
            emptyText: '查找属性（轻敲回车键）',
            margin: '5',
            xtype: 'textfield',
            doSearch: function () {
                let currIndex = 0;
                let dataIndex = detailsStore.getAt(0).get("dataIndex");
                let text = null;
                let searchKey = this.getValue();
                if (!Ext.isEmpty(searchKey)) {
                    detailsStore.each(function (record, index) {
                        let fieldName = record.get("text").toString();
                        let fieldValue = record.get("value");
                        if (fieldName.indexOf(searchKey) >= 0) {
                            currIndex = index;
                            dataIndex = record.get("dataIndex");
                            text = fieldName;
                            return;
                        }
                        if (!Ext.isEmpty(fieldValue) && fieldValue.toString().indexOf(searchKey) >= 0) {
                            currIndex = index;
                            dataIndex = record.get("dataIndex");
                            text = fieldName;
                            return false;
                        }
                    });
                }
                scrollToColumn(detailsGrid.superGrid, dataIndex, text);
                detailsGrid.getSelectionModel().select(currIndex);
                detailsGrid.view.focusRow(currIndex);
                this.focus();
            },
            triggers: {
                search: {
                    cls: 'text-search',
                    handler: function () {
                        this.doSearch();
                    }
                }
            },
            listeners: {
                render: function (obj, eOpts) {
                    try {
                        new Ext.util.KeyMap({
                            target: obj.getEl(),
                            key: 13,
                            fn: function (keyCode, e) {
                                this.doSearch();
                            },
                            scope: this
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        },
        bbar: {
            xtype: 'label',
            style: {
                background: "#ffffff"
            },
            text: '小技巧：双击属性可快速定位左侧表格对应的列！',
            padding: '10'
        },
        viewConfig: {
            enableTextSelection: true
        },
        listeners: {
            itemdblclick: function () {
                try {
                    let data = this.getSelectionModel().getSelection();
                    scrollToColumn(this.superGrid, data[0].get("dataIndex"), data[0].get("text"));
                } catch (e) {
                    showException(e, "details:itemdblclick");
                }
            }
        }
    });
    return detailsGrid;
}


/**
 * 获得详细的panel控件
 */
function getDetailsPanel(grid, fromWindow) {
    let timestamp = Ext.now();
    let subtitle = "";
    if (grid.getStore().entity.menu) {
        subtitle = grid.getStore().entity.menu.text;
    }
    let detailsConfig = {
        subtitle: subtitle,
        layout: 'border',
        border: 0,
        autoScroll: false,
        scrollable: false,
        closeAction: 'hide',
        dataId: -1,
        currIsClosed: false,
        closeTimer: null,
        isWindow: fromWindow,
        setRecord: function (grid) {
            try {
                let me = this;
                if (!me.items) {
                    return false;
                }
                window.clearTimeout(me.closeTimer);
                if (grid != null) {
                    let data = grid.getSelectionModel().getSelection();
                    if (data.length === 1) {
                        me.items.get(0).setRecord(grid, data[0]);
                        me.show();
                    } else {
                        if (me.isVisible() && !this.isWindow) {
                            me.closeTimer = setTimeout(function () {
                                me.close();
                                setTimeout(function () {
                                    let left = grid.view.getEl().getScrollLeft();
                                    grid.view.getEl().scrollTo("left", left - 1, false);
                                }, 100);
                            }, 80);
                        }
                    }
                } else {
                    me.close();
                }
            } catch (e) {
                showException(e);
            }
            return true;
        },
        listeners: {
            afterrender: function () {
                if (this.isWindow) {
                    this.setRecord(grid);
                }
            },
            collapse: function (p, eOpts) {
                Ext.getCmp("close" + timestamp).setHidden(true);
            },
            beforeexpand: function (p, eOpts) {
                Ext.getCmp("close" + timestamp).setHidden(false);
            }
        },
        items: [builderDetailsGrid()]
    };
    if (fromWindow) {
        detailsConfig.region = "center";
    } else {
        detailsConfig.title = '数据详情';
        detailsConfig.iconCls = 'extIcon extDetails';
        detailsConfig.collapsed = false;
        detailsConfig.split = true;
        detailsConfig.hidden = true;
        detailsConfig.region = "east";
        detailsConfig.maxWidth = 688;
        detailsConfig.width = 258;
        detailsConfig.minWidth = 200;
        detailsConfig.tools = [{
            type: 'gear',
            callback: function () {
                setGrid(this, grid);
            }
        }, {
            type: 'close',
            id: 'close' + timestamp,
            callback: function () {
                detailsPanel.collapse();
            }
        }];
    }
    let detailsPanel = Ext.create('Ext.panel.Panel', detailsConfig);
    if (!fromWindow) {
        grid.detailsPanel = detailsPanel;
    }
    detailsPanel.changeListener = grid.on({
        scope: grid,
        selectionchange: function (obj, selected, eOpts) {
            try {
                if (fromWindow) {
                    detailsPanel.setRecord(grid);
                } else {
                    if (grid.operate && grid.operate.autoDetails) {
                        if (!Ext.isEmpty(grid.detailsPanel)) {
                            grid.detailsPanel.setRecord(grid);
                        }
                    } else {
                        grid.detailsPanel.close();
                    }
                }
            } catch (e) {
                showException(e);
            }
        },
        destroyable: true
    });
    return detailsPanel;
}


/**
 * 导出grid数据
 */
function exportGrid(grid) {
    if (!grid.getStore().entity) {
        Ext.Msg.alert('系统提醒', '导出失败！Grid的DataStore未绑定Entity!');
        return;
    }
    Ext.Msg.confirm("系统提醒", "您确定导出当前条件下的所有数据吗？", function (button, text) {
        if (button === "yes") {
            let storeParams = grid.getStore().proxy.extraParams;
            let params = {};
            if (grid.getStore().entity.menu) {
                params.title = grid.getStore().entity.menu.text;
            }
            Ext.each(grid.getColumns(), function (item, index) {
                //排除文件类
                if (isFileColumn(item) || isFilesColumn(item)) return;
                if (!Ext.isEmpty(item.dataIndex)) {
                    params["column[" + index + "].width"] = item.width;
                    params["column[" + index + "].text"] = item.configText;
                    params["column[" + index + "].enum"] = getEnumName(item);
                    params["column[" + index + "].dataIndex"] = item.dataIndex;
                }
            });

            showWait("正在导出中……");
            server.exportExcel(mergeJson(params, storeParams), function (success, data, message) {
                hideWait();
                if (success) {
                    toast("导出成功！");
                    location.href = "attach/" + data;
                } else {
                    Ext.Msg.alert('系统提醒', "导出失败！" + message);
                }
            });
        }
    });

}


/**
 * 设置grid操作
 * @param obj
 */
function setGrid(obj, grid) {
    let setPanel = Ext.create('Ext.form.Panel', {
        bodyPadding: 5,
        region: 'center',
        autoScroll: true,
        viewModel: {
            data: grid.operate
        },
        defaults: {
            labelWidth: 60
        },
        items: [
            {
                xtype: 'checkboxfield',
                fieldLabel: '删除提醒',
                labelAlign: 'right',
                name: 'alertDelete',
                columnWidth: 1,
                bind: "{alertDelete}",
                uncheckedValue: false,
                boxLabel: '删除数据时，系统会弹出确认删除框，避免误操作删除！'
            },
            {
                xtype: 'checkboxfield',
                fieldLabel: '修改提醒',
                labelAlign: 'right',
                columnWidth: 1,
                name: 'alertUpdate',
                bind: "{alertUpdate}",
                hidden: !grid.updateEnable,
                uncheckedValue: false,
                boxLabel: '修改数据时，系统会弹出确认修改框，避免误操作修改！'
            },
            {
                xtype: 'checkboxfield',
                fieldLabel: '自动提交',
                labelAlign: 'right',
                columnWidth: 1,
                name: 'autoUpdate',
                bind: "{autoUpdate}",
                hidden: !grid.updateEnable,
                uncheckedValue: false,
                boxLabel: '双击编辑修改数据后，系统自动提交被修改的数据！'
            },
            {
                xtype: 'checkboxfield',
                fieldLabel: '弹出详情',
                labelAlign: 'right',
                columnWidth: 1,
                name: 'autoDetails',
                bind: "{autoDetails}",
                uncheckedValue: false,
                boxLabel: '点击数据时，右侧自动弹出此数据的详情窗体！'
            },
            {
                xtype: 'checkboxfield',
                fieldLabel: '悬浮阅览',
                labelAlign: 'right',
                columnWidth: 1,
                name: 'hoverTip',
                bind: "{hoverTip}",
                uncheckedValue: false,
                boxLabel: '当鼠标悬浮在数据超过2秒后，会在鼠标右下方弹出此数据的阅览！'
            }]
    });

    let winTitle = "操作设置";
    if (grid.getStore().entity && grid.getStore().entity.menu) {
        winTitle = grid.getStore().entity.menu.text + "-" + winTitle;
    }
    let win = Ext.create('Ext.window.Window', {
        title: winTitle,
        height: 370,
        iconCls: 'extIcon extSet',
        width: 300,
        layout: 'border',
        resizable: false,
        animateTarget: obj,
        items: [setPanel],
        modal: true,
        constrain: true,
        buttons: [
            "->", {
                text: '保存配置',
                iconCls: 'extIcon extSave whiteColor',
                handler: function () {
                    showWait("正在保存中…");
                    server.saveExtConfig(grid.code, "GridOperate", Ext.encode(setPanel.getForm().getValues()), function (success, message) {
                        hideWait();
                        if (success) {
                            grid.operate = setPanel.getForm().getValues();
                            toast("操作设置成功！");
                            win.close();
                        } else {
                            Ext.Msg.alert('系统提醒', message);
                        }
                    });
                }
            },
            {
                text: '取消',
                iconCls: 'extIcon extClose',
                handler: function () {
                    win.close();
                }
            }]
    });
    win.show();
}

/**
 * 显示数据详情
 */
function showDetailsWindow(obj, title, entity, record) {
    server.showColumns(entity.entityCode, function (success, value, message) {
        if (success) {
            let columnInfos = Ext.decode(value);
            let data = [];
            for (let key in columnInfos) {
                if (columnInfos.hasOwnProperty(key)) {
                    let column = columnInfos[key];
                    if (Ext.isEmpty(column.dataIndex)) {
                        continue;
                    }
                    let d = {
                        value: record.get(column.dataIndex),
                        record: record
                    };
                    for (let c in column) {
                        if (column.hasOwnProperty(c)) {
                            d[c] = column[c];
                        }
                    }
                    data.push(d);
                }
            }
            data.sort(function (a, b) {
                return a.index - b.index;
            });
            let detailsStore = Ext.create('Ext.data.Store', {
                autoLoad: false,
                fields: []
            });
            detailsStore.loadData(data);
            detailsStore.sort('index', 'ASC');

            let detailsGrid = Ext.create('Ext.grid.Panel', {
                border: 0,
                scrollable: 'y',
                region: 'center',
                store: detailsStore,
                hideHeaders: true,
                columns: [
                    {
                        header: '名称',
                        power: false,
                        dataIndex: 'text',
                        flex: 0.3,
                        tdCls: 'tdVTop',
                        align: 'right',
                        renderer: function (val, m, r) {
                            m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                            return "<b>" + val + "：</b>";
                        }
                    },
                    {
                        header: '值',
                        dataIndex: 'value',
                        power: false,
                        flex: 0.7,
                        align: 'left',
                        renderer: function (val, m, r) {
                            try {
                                m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                                let fun = null;
                                let rendererFunction = r.get("rendererFunction");
                                if (rendererFunction) {
                                    fun = eval(rendererFunction);
                                } else {
                                    let renderer = r.get("renderer");
                                    fun = loadFunction(renderer);
                                }
                                if (!Ext.isEmpty(fun)) {
                                    val = fun(val, m, r.get("record"), -1, -1, null, null, true);
                                }
                                if (Ext.isEmpty(val) || val === "null") {
                                    return "<font color='#ccc'>无</font>"
                                }
                                return val;
                            } catch (e) {
                                return val;
                            }
                        }
                    }],
                viewConfig: {
                    loadMask: {
                        msg: '正在为您在加载数据…'
                    },
                    enableTextSelection: true
                }
            });

            let win = Ext.create('Ext.window.Window', {
                title: title,
                height: 450,
                width: 400,
                minHeight: 300,
                iconCls: 'extIcon extDetails',
                minWidth: 200,
                layout: 'border',
                resizable: true,
                constrain: true,
                maximizable: true,
                animateTarget: obj,
                listeners: {
                    destroy: function (obj, op) {
                    },
                    show: function (obj) {
                        obj.focus();
                    }
                },
                items: [detailsGrid]
            });
            win.show();
        } else {
            showAlert("系统提醒", message);
        }
    });
}

/**
 * 判断grid是否有正在搜索的列
 * @param grid
 * @returns {boolean}
 */
function hasSearchColumn(grid) {
    let search = false;
    Ext.each(grid.getColumns(), function (item, index) {
        if (!Ext.isEmpty(item.dataIndex)) {
            if (item.where && item.where.length > 0) {
                search = true;
                return false;
            }
        }
    });
    return search;
}


function createDetailsGrid(data, configGrid, configName, configValue) {
    let dataStore = Ext.create('Ext.data.Store', {
        autoLoad: false,
        fields: [],
        data: data
    });
    let nameConfig = {
        header: '名称',
        dataIndex: 'name',
        flex: 0.3,
        align: 'right',
        renderer: function (val, m, r) {
            m.style = 'color:#000000;overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
            return "<b>" + val + "：</b>";
        },
        listeners: {
            dblclick: function (grid, obj, celNo, obj1, obj2, rowNo, e) {
                if (celNo === 0) {
                }
            }
        }
    };
    let valueConfig = {
        header: '值',
        dataIndex: 'value',
        flex: 0.7,
        align: 'left',
        renderer: function (val, m, r) {
            try {
                m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                let fun = r.get("renderer");
                if (Ext.isFunction(fun)) {
                    let value = fun(val, m, r.get("record"), -1, -1, null, null, true);
                    if (Ext.isEmpty(value)) {
                        return "<font color='#ccc'>无</font>"
                    }
                    return value;
                }
                return val;
            } catch (e) {
                return val;
            }
        },
        listeners: {
            dblclick: function (grid, obj, celNo, obj1, obj2, rowNo, e) {
                if (celNo === 0) {

                }
            }
        }
    };
    let gridConfig = {
        region: 'center',
        border: 0,
        columnLines: true,
        store: dataStore,
        viewConfig: {
            enableTextSelection: true
        },
        updateData: function (newData) {
            dataStore.setData(newData);
        },
        columns: [mergeJson(nameConfig, configName),
            mergeJson(valueConfig, configValue)]
    };
    return Ext.create('Ext.grid.Panel', mergeJson(gridConfig, configGrid));
}


function showRecycleGrid(obj,dataStore) {
    if (!dataStore) {
        return;
    }
    let title = "回收站";
    if (dataStore.entity.menu) {
        title = dataStore.entity.menu.text + "-回收站";
    }

    let entityObj = eval("new " + dataStore.entity.entityCode + "()");
    entityObj.menu = {
        id: $.md5(title),
        text: title
    };
    let where = {"^fromRecycle": true};
    let gridPanel = entityObj.getList(mergeJson(where, dataStore.where));

    let entityOwner = gridPanel.down("[entityList=true]");
    entityOwner.code = $.md5(dataStore.entity.entityCode + "回收站");

    let win = Ext.create('Ext.window.Window', {
        title: title,
        iconCls: 'extIcon extRecycle',
        layout: 'fit',
        height: 500,
        width: 600,
        constrain: true,
        resizable: true,
        modal: true,
        maximizable: true,
        animateTarget: obj,
        maximized: false,
        items: [gridPanel]
    });
    win.show();
}






