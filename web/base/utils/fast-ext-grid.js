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
    var grid = this;
    if (grid.entityList) {
        configGridContextMenu(grid);
        configDefaultToolBar(grid);
        configGridTip(grid);
        configGridListeners(grid);
    }
}


function onGridAfterRender() {
    var grid = this;
    if (grid.entityList) {
        configGridLayout(grid).then(function () {
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
            var menu = new Ext.menu.Menu({
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
    var index = 0;
    addGridContextMenu(grid, {
        iconCls: 'extIcon extCopy2',
        text: "复制数据",
        menu: [
            {
                text: '复制单元格',
                iconCls: 'extIcon extCopy2',
                handler: function () {
                    var menu = grid.contextMenu;
                    copyToBoard($(menu.cellTd).text());
                    toast("复制成功！");
                }
            },
            {
                text: '复制整行',
                iconCls: 'extIcon extCopy2',
                handler: function () {
                    var menu = grid.contextMenu;
                    var content = "";
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
                    var menu = grid.contextMenu;
                    var record = menu.record;
                    var fieldName = menu.cellContext.column.dataIndex;
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
            var menu = this.ownerCt;
            if (Ext.isEmpty(menu.cellContext.column.dataIndex)) {
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
            var menu = this.ownerCt;
            if (menu.cellContext.column.field) {
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
                var menu = this.ownerCt;
                if (!Ext.isObject(menu.cellContext.column.searchLink)) {
                    this.hide();
                } else {
                    var linkMenu = new Ext.menu.Menu({
                        items: []
                    });
                    var record = menu.record;
                    var fieldName = menu.cellContext.column.dataIndex;
                    var columns = menu.cellContext.column.searchLink.columns;
                    for (var i = 0; i < columns.length; i++) {
                        var column = columns[i];
                        var child = {
                            icon: column.parent.icon,
                            text: column.parent.text + "【" + column.text + "】",
                            column: column,
                            value: record.get(fieldName),
                            handler: function () {
                                var where = {};
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
            iconCls: 'extIcon extClear',
            text: "清空此数据",
            onBeforeShow: function () {
                var menu = this.ownerCt;
                if (Ext.isEmpty(menu.cellContext.column.dataIndex)) {
                    this.hide();
                } else {
                    this.show();
                }
            },
            handler: function () {
                var menu = this.ownerCt;

                var record = menu.record;
                var fieldName = menu.cellContext.column.dataIndex;

                if (Ext.isObject(menu.cellContext.column.field)) {
                    if (!Ext.isEmpty(menu.cellContext.column.field.name)) {
                        fieldName = menu.cellContext.column.field.name;
                    }
                }

                var params = {"entityCode": grid.getStore().entity.entityCode};
                for (var j = 0; j < grid.getStore().entity.idProperty.length; j++) {
                    var idName = grid.getStore().entity.idProperty[j];
                    params['data.' + idName] = record.get(idName);
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
        }, index++);

        addGridContextMenu(grid, {
            iconCls: 'extIcon extSearch searchColor',
            text: "查找此数据",
            onBeforeShow: function () {
                var menu = this.ownerCt;
                if (Ext.isEmpty(menu.cellContext.column.dataIndex)) {
                    this.hide();
                } else {
                    this.show();
                }
            },
            handler: function () {
                var menu = this.ownerCt;
                var record = menu.record;
                var fieldName = menu.cellContext.column.dataIndex;
                menu.cellContext.column.searchValue(record.get(fieldName));
            }
        }, index++);
    }
}

function configDefaultToolBar(grid) {
    if (!grid) {
        return;
    }
    var toolbar = grid.down("toolbar[dock='top']");
    if (toolbar) {
        var button = {
            xtype: 'button',
            text: '更多操作',
            iconCls: 'extIcon extMore',
            menu: [
                {
                    text: '导出Excel',
                    iconCls: 'extIcon extExcel',
                    handler: function () {
                        exportGrid(grid);
                    }
                },
                {
                    text: '导入Excel',
                    iconCls: 'extIcon extExcel',
                    menu:[
                        {
                            text: '下载模板',
                            iconCls: 'extIcon extExcelModule searchColor',
                            handler: function () {
                                showWait("正在生成中……");
                                var params = {entityCode: grid.getStore().entity.entityCode};
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
                                        params["column[" + index + "].type"] = getColumnFieldType(item);
                                        params["column[" + index + "].dataIndex"] = item.dataIndex;
                                        if (isLinkColumn(item)) {
                                            params["column[" + index + "].dataIndex"] = item.field.name;
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
                                var params = {entityCode: grid.getStore().entity.entityCode};
                                importExcel(this, params).then(function (data) {
                                    if (data) {
                                        toast(data.message);
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
    if (!grid.view) {
        return;
    }
    var view = grid.getView();
    grid.tip = new Ext.ToolTip({
        target: view.el,
        delegate: '.x-grid-cell-inner',
        trackMouse: true,
        renderTo: Ext.getBody(),
        listeners: {
            beforeshow: function updateTipBody(tip) {
                if (grid.operate && !grid.operate.hoverTip) {
                    return false;
                }
                var innerHTML = tip.triggerElement.innerHTML;
                if (Ext.isEmpty(innerHTML) || innerHTML == "&nbsp;") {
                    return false;
                }
                var tipHtml = innerHTML;
                var dataChild = tip.triggerElement.firstChild;
                if (dataChild != null && dataChild.nodeType == 1) {
                    if (dataChild.getAttribute("class") == "x-grid-row-checker") {
                        return false;
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
    if (!grid) {
        return;
    }
    grid.on('viewready', function (obj, eOpts) {
        obj.getHeaderContainer().sortOnClick = false;
    });
    grid.on('beforedestroy', function (panel, eOpts) {
        saveGridColumn(grid);
    });
    grid.on('headertriggerclick', function (ct, column, e, t, eOpts) {
        if (Ext.isEmpty(column.dataIndex)) return;
        ct.sortOnClick = false;
        ct.triggerColumn = column;
    });
    grid.on('headercontextmenu', function (ct, column, e, t, eOpts) {
        if (Ext.isEmpty(column.dataIndex)) return;
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
        if (Ext.isEmpty(e.position.column.dataIndex)) {
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
                obj.getSelectionModel().select(record);
                obj.fireEvent("selectionchange", obj, record, eOpts);

                fireMenuEvent(grid.contextMenu, "onBeforeShow");
                grid.contextMenu.showAt(e.getXY());
            }
        }
    });
    grid.getStore().on('endupdate', function (eOpts) {
        try {
            if (grid.getStore().holdUpdate) {
                return true;
            }
            var records = grid.getStore().getUpdatedRecords();
            Ext.each(grid.updateButtons, function (item, index) {
                item.setDisabled(records.length == 0);
            });
            if (grid.operate && grid.operate.autoUpdate) {
                commitStoreUpdate(grid.getStore());
            }
        } catch (e) {
            showException(e, "endupdate");
        }
    });

    grid.on('beforeedit', function (editor, context, eOpts) {
        if (!toBool(context.column.editable, true)) {
            return false;
        }
        if (context.column.hasListener("beforeedit")) {
            if (!context.column.fireEvent("beforeedit", context)) {
                return false;
            }
        }

        var editorField = context.column.field;
        var cell = Ext.get(context.cell);
        if (Ext.isFunction(editorField.setValue) && !toBool(context.column.password, false)) {
            editorField.setValue(context.value, context.record);
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
                        var fieldObj = obj.items.get(0).items.get(0);
                        fieldObj.focus();
                        new Ext.KeyMap(obj.getEl(), [{
                            key: 13,
                            fn: function () {
                                obj.hide();
                            },
                            scope: obj
                        }]);
                    },
                    beforehide: function (obj, epts) {
                        var fieldObj = obj.items.get(0).items.get(0);
                        if (!fieldObj.isValid()) {
                            shakeComment(obj);
                            return false;
                        }
                        return true;
                    },
                    hide: function (obj, epts) {
                        var fieldObj = obj.items.get(0).items.get(0);
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
                    var selectSize = obj.getSelection().length;
                    var checkSelect = item.checkSelect;
                    if (checkSelect == "multiple" || checkSelect == "m" || checkSelect > 1) {
                        item.setDisabled(!(selectSize > 0));
                    } else if (checkSelect == "radio" || checkSelect == "r" || checkSelect == "single" || checkSelect == "s" || checkSelect == 1) {
                        item.setDisabled(!(selectSize == 1));
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
    if (!grid.columnHeadMenu) {
        return;
    }
    if (!grid.columnMenu) {
        grid.columnMenu = {};
    }
    if (!grid.columnMenu) {
        return;
    }
    var menu = grid.columnHeadMenu;
    menu.on("beforeshow", function (obj) {
        if (isFilesColumn(obj.activeHeader)
            || isFileColumn(obj.activeHeader)
            || !hasColumnField(menu.activeHeader)) {
            obj.activeHeader.batchUpdate = false;
            obj.activeHeader.operation = false;
            obj.activeHeader.searchLink = false;
        }
        if (isContentColumn(obj.activeHeader)) {
            obj.activeHeader.searchLink = false;
        }
        if (!obj.configHeadMenu) {
            obj.configHeadMenu = true;

            var menus = [];
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
            if (grid.getStore().entity) {
                if (toBool(grid.columnMenu.searchLink, true)) {
                    menus.push({
                        text: '配置搜索链',
                        iconCls: 'extIcon extLink',
                        onBeforeShow: function () {
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
                        text: '统计数据',
                        iconCls: 'extIcon extMath',
                        onBeforeShow: function () {
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
                    text: '批量修改',
                    iconCls: 'extIcon extEdit',
                    onBeforeShow: function () {
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

            if (toBool(grid.columnMenu.cancelSort, true)) {
                menus.push({
                    text: '取消排序',
                    iconCls: 'extIcon extCancelOrder',
                    onBeforeShow: function () {
                        if (toBool(menu.activeHeader.cancelSort, true)) {
                            this.show();
                        } else {
                            this.hide();
                        }
                    },
                    handler: function () {
                        try {
                            var sortCollection = grid.getStore().getSorters();
                            if (sortCollection.count() == 0) {
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
    var pagingtoolbar = Ext.create('Ext.toolbar.Paging', {
        store: dataStore,
        dock: 'bottom',
        pageSize: dataStore.pageSize,
        displayInfo: true,
        inputItemWidth: 70,
        overflowHandler: 'scroller'
    });

    var control = {
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
                    var pageRecord = obj.getStore().getById(newValue);
                    if (pageRecord == null) {
                        obj.totalCount = newValue;
                        obj.setValue(-1);
                        return;
                    }

                    if (newValue == -1) {
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
    pagingtoolbar.insert(0, control);
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
        if (grid.getSelection().length == 0) {
            toast('请您先选择需要删除的数据！');
            return;
        }
        var selectLength = grid.getSelection().length;
        var doDelete = function () {
            showWait("正在删除数据中……");
            commitStoreDelete(grid.getStore(), grid.getSelection()).then(function (success) {
                if (success) {
                    grid.getSelectionModel().deselectAll();
                    var reloadPage = grid.getStore().currentPage;
                    if (grid.getStore().count() - selectLength <= 0) {
                        reloadPage = reloadPage - 1;
                    }
                    grid.getStore().loadPage(Math.max(reloadPage, 1));

                    var grouped = grid.getStore().isGrouped();
                    if (grouped) {
                        grid.getView().getFeature('group').collapseAll();
                    }
                    hideWait();
                }
                resolve(success);
            });
        };
        if (grid.operate && grid.operate.alertDelete) {
            Ext.Msg.confirm("系统提醒", "您确定删除选中的" + selectLength + "条数据吗？", function (button, text) {
                if (button == "yes") {
                    doDelete();
                }
            });
        } else {
            doDelete();
        }
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
        var records = grid.getStore().getUpdatedRecords();
        if (records.length == 0) {
            toast('当前暂无数据被修改！');
            return;
        }
        showWait("正在修改数据中……");
        if (grid.operate && grid.operate.alertUpdate) {
            Ext.Msg.confirm("系统提醒", "您确定提交被修改的数据吗？", function (button, text) {
                if (button == "yes") {
                    commitStoreUpdate(grid.getStore()).then(function (result) {
                        resolve(result);
                        if (result) {
                            hideWait();
                        }
                    });
                }
            });
        } else {
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
            var columnInfos = {};
            Ext.each(grid.getColumns(), function (item, index) {
                if (!Ext.isEmpty(item.dataIndex)) {
                    var columnInfo = {column: true};
                    columnInfo["width"] = item.width;
                    columnInfo["hidden"] = item.isHidden();
                    columnInfo["locked"] = item.isLocked();
                    columnInfo["text"] = item.configText;
                    columnInfo["dataIndex"] = item.dataIndex;
                    if (grid.getStore().entity) {
                        columnInfo["entityCode"] = grid.getStore().entityCode;
                    }
                    var sortConfig = grid.getStore().getSorters().getByKey(item.dataIndex);
                    if (sortConfig) {
                        columnInfo["sortDirection"] = sortConfig.getDirection();
                    }
                    columnInfo["searchLink"] = item.searchLink;
                    columnInfo["index"] = item.getIndex();

                    var rendererStr = item.renderer.toString();
                    rendererStr = "function " + rendererStr.substring(rendererStr.indexOf("("));
                    columnInfo["renderer"] = rendererStr;
                    columnInfo["rendererFunction"] = item.rendererFunction;
                    columnInfos[item.code] = columnInfo;
                }
            });

            var pageTool = {
                pageSize: grid.getStore().pageSize,
                column: false
            };
            columnInfos["PageTool"] = pageTool;

            var params = {};
            if (grid.getStore().entity && grid.getStore().entity.menu) {
                params["menuId"] = grid.getStore().entity.menu.id;
                if (grid.getStore().entity.menu.webMenu) {//左侧主菜单
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
                var columnInfos = {};
                if (success) {
                    columnInfos = Ext.decode(value);
                }
                var newColumns = [];
                var sorts = [];
                var configColumns = grid.getColumns();
                for (var i = 0; i < configColumns.length; i++) {
                    var column = configColumns[i];
                    if (!Ext.isEmpty(column.dataIndex)) {
                        var newColumn = column.cloneConfig();
                        if (columnInfos.hasOwnProperty(column.code)) {
                            var info = columnInfos[column.code];
                            for (var key in info) {
                                if (key == "renderer" || key == "rendererFunction") {
                                    continue;
                                }
                                newColumn[key] = info[key];
                                if (key == "sortDirection") {
                                    sorts.push({
                                        property: newColumn.dataIndex,
                                        direction: newColumn.sortDirection
                                    });
                                }
                            }
                        }
                        newColumns.push(newColumn);
                    }
                }
                newColumns.sort(function (a, b) {
                    return a.index - b.index;
                });
                if (columnInfos.hasOwnProperty("PageTool")) {
                    var pageTool = columnInfos["PageTool"];
                    grid.getStore().pageSize = pageTool.pageSize;
                    var comboPage = grid.down("combo[pageTool=true]");
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
function createDetailsGrid() {
    var detailsStore = Ext.create('Ext.data.Store', {
        autoLoad: false,
        fields: []
    });

    var detailsGrid = Ext.create('Ext.grid.Panel', {
        border: 0,
        scrollable: 'y',
        region: 'center',
        store: detailsStore,
        hideHeaders: true,
        superGrid: null,
        setRecord: function (grid, record) {
            this.superGrid = grid;
            var columns = grid.getColumns();
            var data = [];
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];
                if (Ext.isEmpty(column.dataIndex)) continue;
                var item = {
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
        columns: [{
            header: '名称',
            dataIndex: 'text',
            width: 120,
            align: 'right',
            tdCls: 'tdVTop',
            renderer: function (val, m, r) {
                m.style = 'color:#000000;overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-all; ';
                return "<b>" + val + "：</b>";
            }
        },
            {
                header: '值',
                dataIndex: 'value',
                flex: 1,
                align: 'left',
                renderer: function (val, m, r) {
                    try {
                        m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-all; ';
                        var fun = r.get("renderer");
                        if (Ext.isFunction(fun)) {
                            var value = fun(val, m, r.get("record"), -1, -1, null, null, true);
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
            xtype: 'textfield',
            doSearch: function () {
                var currIndex = 0;
                var dataIndex = detailsStore.getAt(0).get("dataIndex");

                var searchKey = this.getValue();
                if (!Ext.isEmpty(searchKey)) {
                    detailsStore.each(function (record, index) {
                        var fieldName = record.get("text").toString();
                        var fieldValue = record.get("value");
                        if (fieldName.indexOf(searchKey) >= 0) {
                            currIndex = index;
                            dataIndex = record.get("dataIndex");
                            return;
                        }
                        if (!Ext.isEmpty(fieldValue) && fieldValue.toString().indexOf(searchKey) >= 0) {
                            currIndex = index;
                            dataIndex = record.get("dataIndex");
                            return false;
                        }
                    });
                }
                scrollToColumn(detailsGrid.superGrid, dataIndex);
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
                    new Ext.KeyMap(obj.getEl(), [{
                        key: 13,
                        fn: function () {
                            this.doSearch();
                        },
                        scope: this
                    }]);
                }
            }
        },
        viewConfig: {
            enableTextSelection: true
        },
        listeners: {
            itemdblclick: function () {
                try {
                    var data = this.getSelectionModel().getSelection();
                    scrollToColumn(this.superGrid, data[0].get("dataIndex"));
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
 * @param grid
 */
function getDetailsPanel(grid) {
    var timestamp = Ext.now();
    var detailsPanel = Ext.create('Ext.panel.Panel', {
        title: '数据详情',
        iconCls: 'extIcon extDetails',
        layout: 'fit',
        region: 'east',
        border: 0,
        width: 258,
        minWidth: 200,
        collapsed: false,
        maxWidth: 588,
        split: true,
        autoScroll: true,
        closeAction: 'hide',
        dataId: -1,
        hidden: true,
        currIsClosed: false,
        closeTimer: null,
        setRecord: function (grid) {
            try {
                var me = this;
                window.clearTimeout(me.closeTimer);
                if (grid != null) {
                    var data = grid.getSelectionModel().getSelection();
                    if (data.length == 1) {
                        me.items.get(0).setRecord(grid, data[0]);
                        me.show();
                    } else {
                        me.closeTimer = setTimeout(function () {
                            me.close();
                        }, 80);
                    }
                } else {
                    me.close();
                }
            } catch (e) {
                showException(e);
            }
        },
        listeners: {
            collapse: function (p, eOpts) {
                Ext.getCmp("close" + timestamp).setHidden(true);
            },
            beforeexpand: function (p, eOpts) {
                Ext.getCmp("close" + timestamp).setHidden(false);
            }
        },
        tools: [
            {
                type: 'gear',
                callback: function () {
                    setGrid(this, grid);
                }
            },
            {
                type: 'close',
                id: 'close' + timestamp,
                callback: function () {
                    detailsPanel.collapse();
                }
            }],
        items: [createDetailsGrid()]
    });
    grid.detailsPanel = detailsPanel;
    grid.on('selectionchange', function (obj, selected, eOpts) {
        try {
            if (grid.operate && grid.operate.autoDetails) {
                if (!Ext.isEmpty(grid.detailsPanel)) {
                    grid.detailsPanel.setRecord(grid);
                }
            } else {
                grid.detailsPanel.close();
            }
        } catch (e) {
            showException(e);
        }
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
    var storeParams = grid.getStore().proxy.extraParams;
    var params = {};
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


/**
 * 设置grid操作
 * @param obj
 */
function setGrid(obj, grid) {
    var setPanel = Ext.create('Ext.form.Panel', {
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

    var winTitle = "操作设置";
    if (grid.getStore().entity && grid.getStore().entity.menu) {
        winTitle = grid.getStore().entity.menu.text + "-" + winTitle;
    }
    var win = Ext.create('Ext.window.Window', {
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
            var columnInfos = Ext.decode(value);
            var data = [];
            for (var key in columnInfos) {
                if (columnInfos.hasOwnProperty(key)) {
                    var column = columnInfos[key];
                    if (Ext.isEmpty(column.dataIndex)) {
                        continue;
                    }
                    var d = {
                        value: record.get(column.dataIndex),
                        record: record
                    };
                    for (var c in column) {
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
            var detailsStore = Ext.create('Ext.data.Store', {
                autoLoad: false,
                fields: []
            });
            detailsStore.loadData(data);
            detailsStore.sort('index', 'ASC');

            var detailsGrid = Ext.create('Ext.grid.Panel', {
                border: 0,
                scrollable: 'y',
                region: 'center',
                store: detailsStore,
                hideHeaders: true,
                columns: [{
                    header: '名称',
                    power: false,
                    dataIndex: 'text',
                    width: 120,
                    tdCls: 'tdVTop',
                    align: 'right',
                    renderer: function (val, m, r) {
                        m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-all; ';
                        return "<b>" + val + "：</b>";
                    }
                },
                    {
                        header: '值',
                        dataIndex: 'value',
                        power: false,
                        flex: 1,
                        align: 'left',
                        renderer: function (val, m, r) {
                            try {
                                m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-all; ';
                                var fun = null;
                                var rendererFunction = r.get("rendererFunction");
                                if (rendererFunction) {
                                    fun = eval(rendererFunction);
                                } else {
                                    var renderer = r.get("renderer");
                                    fun = loadFunction(renderer);
                                }
                                if (!Ext.isEmpty(fun)) {
                                    val = fun(val, m, r.get("record"), -1, -1, null, null, true);
                                }
                                if (Ext.isEmpty(val) || val == "null") {
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

            var win = Ext.create('Ext.window.Window', {
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
                    }
                },
                items: [detailsGrid]
            });
            win.show();
        }else{
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
    var search = false;
    Ext.each(grid.getColumns(), function (item, index) {
        if (!Ext.isEmpty(item.dataIndex)) {
            if (item.where && item.where.length > 0) {
                console.log(item.where);
                search = true;
                return false;
            }
        }
    });
    return search;
}






