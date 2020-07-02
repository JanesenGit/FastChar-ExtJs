Ext.override(Ext.grid.column.Column, {
    afterRender: Ext.Function.createSequence(Ext.grid.column.Column.prototype.afterRender, function () {
        try {
            let me = this;
            me.code = getPowerCode(me);
            if (!me.renderer) {
                me.renderer = renders.normal();
            }

            if (me.rendererFunction) {
                me.renderer = eval(me.rendererFunction);
            }
            configColumnProperty(me);
        } catch (e) {
            console.error(e);
        }
    })
});

function isColumnType(target) {
    return target === "gridcolumn" || target.xtype === "gridcolumn";
}

function getColumnFieldType(column) {
    if (Ext.isObject(column.field)) {
        return column.field.xtype;
    }
    return column.field;
}

function getColumnGrid(column) {
    if (!column.grid) {
        column.grid = column.up("treepanel,grid");
    }
    if (column.grid.ownerGrid) {
        return column.grid.ownerGrid;
    }
    return null;
}


/**
 * 配置column属性
 * @param column
 */
function configColumnProperty(column) {
    try {
        column.configText = column.text;
        column.toSearchKey = function (where, i) {
            return "where['" + this.getIndex() + i + this.dataIndex + where.compare + "']";
        };
        column.searchValue = function (value) {
            let me = this;
            if (!me.where) {
                me.where = [];
            }
            let where = {
                compare: '=',
                value: value
            };
            me.where.push(where);
            me.doSearch();
        };
        column.clearSearch = function () {
            let me = this;
            let storeParams = getColumnGrid(me).getStore().proxy.extraParams;
            if (me.where) {
                for (let i = 0; i < me.where.length; i++) {
                    let key = me.toSearchKey(me.where[i], i);
                    if (storeParams.hasOwnProperty(key)) {
                        delete storeParams[key];//删除搜索记录
                    }
                }
            }
            me.where = [];
            me.searchMenu = null;
            me.searching = false;
            refreshColumnStyle(me);
        };
        column.doSearch = function (requestServer) {
            let me = this;
            let storeParams = getColumnGrid(me).getStore().proxy.extraParams;
            if (me.where) {
                for (let i = 0; i < me.where.length; i++) {
                    let w = me.where[i];
                    let key = me.toSearchKey(w, i);
                    let value = w.value;
                    if (w.compare.indexOf('?') >= 0) {
                        value = '%' + w.value + '%';
                    }

                    storeParams[key] = value;
                }
                if (toBool(requestServer, true)) {
                    getColumnGrid(me).getStore().loadPage(1);
                }
                me.searching = me.where.length !== 0;
                refreshColumnStyle(me);
            }
        };

        if (column.where && column.where.length > 0) {
            column.doSearch(false);
        }
    } catch (e) {
        console.error(e);
    }
}

/**
 * 刷新column样式
 * @param column
 */
function refreshColumnStyle(column) {
    try {
        if (!Ext.isEmpty(column.dataIndex)) {
            let sortDirection = column.sortDirection;
            if (Ext.isEmpty(sortDirection)) {
                sortDirection = "<font size='1'></font>";
            } else {
                if (sortDirection === "ASC") {
                    sortDirection = "<font color='red' size='1'>&nbsp;&nbsp;[正序]</font>"
                } else {
                    sortDirection = "<font color='red' size='1'>&nbsp;&nbsp;[倒序]</font>"
                }
            }
            if (Ext.isEmpty(column.sumText)) {
                column.sumText = "<font size='1'></font>";
            }
            if (column.searching) {
                column.setText(getSVGIcon("extSearch") +"&nbsp;"+ column.configText + column.sumText + sortDirection + "&nbsp;");
                column.setStyle('color', 'red');
            }else{
                column.setText("&nbsp;" + column.configText + column.sumText + sortDirection + "&nbsp;");
                column.setStyle('color', '#444444');
            }
            checkColumnSort(getColumnGrid(column));
        }
    } catch (e) {
        console.error(e);
    }
}


function checkColumnSearch(grid) {
    try {
        let hasSearch = false;
        Ext.each(grid.getColumns(), function (item) {
            if (item.where) {
                if (item.where.length > 0) {
                    hasSearch = true;
                    return false;
                }
            }
        });
        let dockeds = grid.getDockedItems('toolbar[dock="bottom"]');
        if (dockeds.length > 0) {
            let searchBtn = dockeds[0].down("button[toolType=searchBtn]");
            if (hasSearch) {
                searchBtn.setIconCls("extIcon extSearch redColor");
            } else {
                searchBtn.setIconCls("extIcon extSearch grayColor");
            }
        }
    } catch (e) {
        console.error(e);
    }
}


function checkColumnSort(grid) {
    try {
        let hasSort = grid.getStore().getSorters().length > 0;
        let dockeds = grid.getDockedItems('toolbar[dock="bottom"]');
        if (dockeds.length > 0) {
            let sortBtn = dockeds[0].down("button[toolType=sortBtn]");
            if (hasSort) {
                sortBtn.setIconCls("extIcon extSort redColor");
            } else {
                sortBtn.setIconCls("extIcon extSort grayColor");
            }
        }
    } catch (e) {
        console.error(e);
    }
}


/**
 * 显示column搜索菜单
 * @param column
 */
function showColumnSearchMenu(column) {
    try {
        if (!toBool(getColumnGrid(column).columnSearch, true)) {
            return false;
        }
        if (isFilesColumn(column)
            || isFileColumn(column)) {
            return false;
        }
        if (!toBool(column.search, true)) {
            return false;
        }
        if (toBool(column["encrypt"], false)) {
            return false;
        }

        if (!column.searchMenu) {
            column.searchMenu = new Ext.menu.Menu({
                padding: '0 0 0 0',
                power: false,
                showSeparator: false,
                style: {
                    background: "#ffffff"
                },
                addSearchItem: function (where) {
                    let index = this.items.length - 1;
                    if (index >= 5) {
                        return;
                    }
                    this.insert(index, buildSearchItem(column, where));
                },
                doSearch: function () {
                    let me = this;
                    let where = [];
                    me.items.each(function (item, index) {
                        if (item.searchItem) {
                            let toParam = item.toParam();
                            if (!toParam) {
                                where = null;
                                return false;
                            }
                            if (Ext.isEmpty(toParam.value)) {
                                return;
                            }
                            toParam.index = index;
                            where.push(toParam)
                        }
                    });
                    if (where) {
                        column.clearSearch();
                        column.where = where;
                        column.doSearch();
                        me.hide();
                    }
                },
                items: [
                    {
                        xtype: 'panel',
                        layout: 'hbox',
                        margin: '2',
                        border: 0,
                        items: [
                            {
                                xtype: 'button',
                                text: '搜索',
                                flex: 1,
                                iconCls: 'extIcon extSearch',
                                margin: '0 2 0 0',
                                handler: function () {
                                    this.ownerCt.ownerCt.doSearch();
                                }
                            },
                            {
                                xtype: 'button',
                                iconCls: 'extIcon extPlus fontSize14',
                                width: 35,
                                handler: function () {
                                    this.ownerCt.ownerCt.addSearchItem();
                                }
                            }]
                    }],
                listeners: {
                    show: function (obj, epts) {
                        if (obj.items.length === 1) {
                            obj.addSearchItem();
                        }
                        try {
                            new Ext.util.KeyMap({
                                target: obj.getEl(),
                                key: 13,
                                fn: function (keyCode, e) {
                                    obj.doSearch();
                                },
                                scope: obj
                            });
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            });
        }

        if (column.where) {
            for (let i = 0; i < column.where.length; i++) {
                let where = column.where[i];
                if (Ext.isEmpty(where.index)) {
                    where.index = i;
                }
                if (where.index < column.searchMenu.items.length - 1) {
                    column.searchMenu.items.getAt(where.index).setParam(where);
                } else {
                    column.searchMenu.addSearchItem(where);
                }
            }
        }

        column.searchMenu.setWidth(Math.max(column.width, 200));
        column.searchMenu.showBy(column, "tl-bl?");
        return true;
    } catch (e) {
        console.error(e);
    }
    return false;
}


function buildSearchItem(column, where) {
    try {
        let editorField = getColumnSimpleEditor(column, true);
        if (!editorField) {
            return;
        }

        editorField.flex = 1;
        editorField.margin = '2 2 0 0';
        editorField.repeatTriggerClick = false;
        editorField.onClearValue = function () {
            if (Ext.isFunction(this.ownerCt.removeSearch)) {
                this.ownerCt.removeSearch();
                return;
            }
            this.ownerCt.destroy();
        };
        editorField.triggers = {
            close: {
                cls: 'text-clear',
                handler: function () {
                    this.onClearValue();
                }
            }
        };
        editorField.editable = true;
        editorField.emptyText = "请输入条件值";

        // 此处是移除默认的trigger
        // editorField.listeners = {
        //     afterrender: function (obj, eOpts) {
        //         if (Ext.isFunction(obj.getTrigger)) {
        //             if (obj.getTrigger('picker')) {
        //                 obj.getTrigger('picker').hide();
        //             }
        //             if (obj.getTrigger('spinner')) {
        //                 obj.getTrigger('spinner').hide();
        //             }
        //         }
        //     }
        // };
        // if (isDateField(editorField)) {
        //     editorField.editable = false;
        // }

        if (!where) {
            where = {
                compare: '=',
                value: ''
            };
            if (isTextField(editorField)) {
                where.compare = '?';
            } else if (isDateField(editorField)) {
                where.compare = '>';
            }
        }
        editorField.value = where.value;
        editorField.submitValue = false;
        editorField.name = "value";
        let panel = {
            xtype: 'panel',
            margin: '0',
            searchItem: true,
            border: 0,
            flex: 1,
            region: 'center',
            layout: 'hbox',
            toParam: function () {
                let params = {};
                this.items.each(function (item) {
                    if (Ext.isFunction(item.getValue)) {
                        if (item.isValid()) {
                            if (Ext.isDate(item.getValue())) {
                                params[item.getName()] = Ext.Date.format(item.getValue(), item.format)
                            } else {
                                params[item.getName()] = item.getValue();
                            }
                        } else {
                            shakeComment(item);
                            toast(item.getErrors()[0]);
                            params = null;
                            return false;
                        }
                    }
                });
                return params;
            },
            setParam: function (where) {
                this.items.each(function (item) {
                    if (Ext.isFunction(item.getValue)) {
                        if (item.getName() === 'compare') {
                            item.setValue(where.compare);
                        } else {
                            item.setValue(where.value);
                        }
                    }
                });
            },
            items: [
                {
                    xtype: 'combo',
                    name: 'compare',
                    value: where.compare,
                    margin: '2 2 0 2',
                    width: 35,
                    valueField: 'text',
                    editable: false,
                    hideTrigger: true,
                    tpl: Ext.create('Ext.XTemplate',
                        '<ul class="x-list-plain"><tpl for=".">',
                        '<li role="option" class="x-boundlist-item" style="font-size: 12px;">{desc}</li>',
                        '</tpl></ul>'
                    ),
                    listeners: {
                        afterrender: function (obj, eOpts) {
                            obj.getPicker().setMinWidth(100);
                        }
                    },
                    store: getCompareDataStore()
                },
                editorField
            ]
        };
        return panel;
    } catch (e) {
        console.error(e);
    }
    return null;
}

/**
 * 计算数据
 */
function showCompute(grid, column, type) {
    try {
        if (!column) {
            Ext.Msg.alert('系统提醒', '计算失败!计算列无效！');
            return;
        }
        if (!grid.getStore().entity) {
            Ext.Msg.alert('系统提醒', '计算失败！Grid的DataStore未绑定Entity!');
            return;
        }

        let selection = grid.getSelection();
        if (selection.length > 0) {
            let value = null;
            let title = "";
            for (let i = 0; i < selection.length; i++) {
                let record = selection[i];
                let columnValue = parseFloat(record.get(column.dataIndex));
                if (type === 'sum') {
                    title = column.configText + "总和：";
                    if (!value) {
                        value = 0;
                    }
                    value += columnValue;
                } else if (type === 'avg') {
                    title = column.configText + "平均值：";
                    if (!value) {
                        value = 0;
                    }
                    value += columnValue;
                } else if (type === 'min') {
                    title = column.configText + "最小值：";
                    if (!value) {
                        value = columnValue;
                    }
                    value = Math.min(columnValue, value);
                } else if (type === 'max') {
                    title = column.configText + "最大值：";
                    if (!value) {
                        value = columnValue;
                    }
                    value = Math.max(columnValue, value);
                }
            }
            if (type === 'avg') {
                value = value / selection.length;
            }
            try {
                if (Ext.isFunction(column.renderer)) {
                    Ext.Msg.alert('系统提醒', "当前选中的数据，" + title + column.renderer(value));
                } else {
                    Ext.Msg.alert('系统提醒', "当前选中的数据，" + title + value);
                }
            } catch (e) {
                Ext.Msg.alert('系统提醒', "当前选中的数据，" + title + value);
            }
            return;
        }

        let storeParams = grid.getStore().proxy.extraParams;

        let params = {
            "entityCode": grid.getStore().entity.entityCode,
            "field": column.dataIndex,
            "type": type
        };

        showWait("正在计算中……");
        $.post("entity/compute", mergeJson(params, storeParams), function (result) {
            hideWait();
            let msg = "";
            if (type === 'sum') {
                msg = column.configText + "总和：";
            } else if (type === 'avg') {
                msg = column.configText + "平均值：";
            } else if (type === 'min') {
                msg = column.configText + "最小值：";
            } else if (type === 'max') {
                msg = column.configText + "最大值：";
            }
            try {
                if (Ext.isFunction(column.renderer)) {
                    Ext.Msg.alert('系统提醒', msg + column.renderer(result.data));
                } else {
                    Ext.Msg.alert('系统提醒', msg + result.data);
                }
            } catch (e) {
                Ext.Msg.alert('系统提醒', msg + result.data);
            }
        });
    } catch (e) {
        console.error(e);
    }
}


/**
 * 获得列的编辑类型
 */
function getColumnSimpleEditor(column, search) {
    try {
        let editor = {};
        if (Ext.isObject(column.field)) {
            editor.xtype = column.field.xtype;
        } else {
            editor.xtype = column.field;
        }
        if (Ext.isObject(column.config.field)) {
            if (search) {
                editor = copy(column.config.field);
            } else {
                editor = column.config.field;
            }
        }
        if (search) {
            if (isContentField(column.field)
                || isHtmlContentField(column.field)
                || isTargetField(column.field)
                || isPCAField(column.field)) {
                editor.xtype = "textfield";
            }
        }
        if (Ext.isEmpty(editor.xtype)) {
            editor.xtype = "textfield";
        }
        editor.dataIndex = column.dataIndex;
        return editor;
    } catch (e) {
        console.error(e);
    }
    return null;
}

/**
 * 判断列是否有编辑字段
 */
function hasColumnField(column) {
    try {
        if (Ext.isObject(column.field)) {
            return true;
        }
        if (!Ext.isEmpty(column.field)) {
            return true;
        }
        return false;
    } catch (e) {
        console.error(e);
    }
    return false;
}

function isDateColumn(column) {
    if (!column) {
        return false;
    }
    return isDateField(column.field);
}

/**
 * 是否是数字列
 */
function isNumberColumn(column) {
    if (!column) {
        return false;
    }
    return isNumberField(column.field);
}

/**
 * 是否是文件列
 */
function isFileColumn(column) {
    if (!column) {
        return false;
    }
    return isFileField(column.field);
}

/**
 * 是否是大文本
 * @param column
 */
function isContentColumn(column) {
    if (!column) {
        return false;
    }
    return isHtmlContentField(column.field) || isContentField(column.field);
}

/**
 * 是否是文件列
 */
function isFilesColumn(column) {
    if (!column) {
        return false;
    }
    return isFilesField(column.field);
}


/**
 * 是否是枚举列
 * @param column
 * @returns {string}
 */
function isEnumColumn(column) {
    if (!column) {
        return false;
    }
    return isEnumField(column.field);
}

/**
 * 是否是关联表格的列
 * @param column
 * @returns {boolean|boolean|*}
 */
function isLinkColumn(column) {
    if (!column) {
        return false;
    }
    return isLinkField(column.field);
}


/**
 * 获得枚举名称
 */
function getEnumName(column) {
    if (isEnumColumn(column)) {
        if (Ext.isObject(column.field)) {
            return column.field.enumName;
        }
    }
    return null;
}

/**
 * 获得指定dataIndex 的列
 */
function getColumn(grid, dataIndex, text) {
    let columns = grid.getColumns();
    for (let i = 0; i < columns.length; i++) {
        let column = columns[i];
        if (column.dataIndex === dataIndex) {
            if (text && column.text === text) {
                return column;
            }
            return column;
        }
    }
    return null;
}


/**
 * 闪烁列
 */
function blinkColumn(column) {
    if (column.blinking) return;
    column.blinking = true;
    let currColor = column.getEl().getStyle("color");
    let currBGColor = column.getEl().getStyle("background");
    let changeBg = "#e41f00";
    if (currBGColor.indexOf("linear-gradient") > 0) {
        changeBg = "linear-gradient(0deg, #e41f00, #fefefe)";
    }
    column.setStyle({
        color: 'white',
        background: changeBg
    });
    setTimeout(function () {
        column.setStyle({
            color: currColor,
            background: currBGColor
        });
        column.blinking = false;
    }, 1000);
}

/**
 * 滚到到指定的列
 * @param grid
 * @param dataIndex
 */
function scrollToColumn(grid, dataIndex, text) {
    let column = getColumn(grid, dataIndex, text);
    blinkColumn(column);
    let x = column.getLocalX();
    grid.view.getEl().scrollTo("left", x, true);
}

/**
 * 批量编辑列数据
 */
function batchEditColumn(column) {
    let editorField = column.batchField;
    if (!editorField) {
        editorField = getColumnSimpleEditor(column);
        if (!editorField) return;
        editorField.flex = 1;
        editorField.emptyText = "请输入";
        editorField = column.batchField = Ext.create(editorField);
    }
    let putRecord = function (fieldObj) {
        if (!Ext.isEmpty(fieldObj.getValue())) {
            if (!getColumnGrid(column).getStore()) {
                return;
            }
            getColumnGrid(column).getStore().holdUpdate = true;
            let selectData = getColumnGrid(column).getSelectionModel().getSelection();
            if (selectData.length > 0) {
                Ext.each(selectData, function (record, index) {
                    setRecordValue(record, column.dataIndex, fieldObj);
                });
            } else {
                getColumnGrid(column).getStore().each(function (record, index) {
                    setRecordValue(record, column.dataIndex, fieldObj);
                });
            }
            getColumnGrid(column).getStore().holdUpdate = false;
            getColumnGrid(column).getStore().fireEvent("endupdate");

        }
    };
    let placeholder = "批量修改当前页的【" + column.text + "】数据";
    if (getColumnGrid(column).getSelection().length > 0) {
        placeholder = "批量修改选择的" + getColumnGrid(column).getSelection().length + "条【" + column.text + "】数据";
    }

    if (Ext.isFunction(editorField.setEmptyText)) {
        editorField.setEmptyText(placeholder);
    }

    if (Ext.isFunction(editorField.showWindow)) {
        editorField.showWindow(column, function (result) {
            putRecord(result);
        }, placeholder);
        return;
    }
    if (!column.batchEditMenu) {
        column.batchEditMenu = Ext.create('Ext.menu.Menu', {
            showSeparator: false,
            layout: 'fit',
            doUpdate: function () {
                let btn = this.down("button[name='confirm']");
                btn.setText("稍等");
                btn.setDisabled(true);
                let me = this;
                new Ext.Promise(function (resolve, reject) {
                    let fieldObj = me.items.get(0).items.get(0);
                    putRecord(fieldObj);
                    fieldObj.setValue(null);
                    resolve();
                }).then(function () {
                    btn.setText("确定");
                    btn.setDisabled(false);
                    me.hide();
                });
            },
            items: [
                {
                    xtype: 'panel',
                    layout: 'hbox',
                    style: {
                        background: "#ffffff",
                        borderWidth: 1,
                        borderColor: "#ffffff",
                        color: '#eeeee'
                    },
                    border: 0,
                    items: [editorField,
                        {
                            xtype: 'button',
                            text: '确定',
                            name: 'confirm',
                            width: 60,
                            margin: '0 0 0 2',
                            handler: function () {
                                column.batchEditMenu.doUpdate();
                            }
                        }]
                }],
            listeners: {
                show: function (obj, epts) {
                    let fieldObj = obj.items.get(0).items.get(0);
                    fieldObj.focus();
                },
                beforehide: function (obj, epts) {
                    let fieldObj = obj.items.get(0).items.get(0);
                    if (!fieldObj.isValid()) {
                        shakeComment(obj);
                        toast(fieldObj.getErrors()[0]);
                    }
                    return fieldObj.isValid();
                }
            }
        });
    }
    column.batchEditMenu.setWidth(column.getWidth());
    column.batchEditMenu.showBy(column, "tl");
}


/**
 * 配置指定列的搜索链
 * @param column
 */
function configColumnSearchLink(column) {
    let checked = "";
    if (column.searchLink) {
        checked = column.searchLink.checked;
    }
    system.showMenuColumns(column, checked).then(function (data) {
        if (data.columns.length > 0) {
            column.searchLink = data;
            toast("配置成功！");
        } else {
            column.searchLink = null;
            toast("已清空搜索链！");
        }
    });

}

/**
 * 显示搜索窗体
 * @param obj
 */
function showColumnSearchWin(obj, grid) {
    let store = getGridColumnStore(grid, true);
    let buildItem = function (data, where) {
        let inputItem = buildSearchItem(getColumn(grid, data.get("id"), data.get("text")), where);
        inputItem.removeSearch = function () {
            this.ownerCt.destroy();
        };
        return {
            xtype: 'panel',
            flex: 1,
            columnWidth: 1,
            layout: 'hbox',
            margin: '0',
            border: 0,
            toParam: function () {
                let param = {};
                let combo = this.items.get(0);
                let data = combo.getStore().findRecord("id", combo.getValue(), 0, false, false, true);
                param["text"] = data.get("text");
                param["dataIndex"] = data.get("id");
                let inputItem = this.items.get(1);
                param = mergeJson(param, inputItem.toParam());
                return param;
            },
            items: [
                {
                    xtype: 'combo',
                    region: 'west',
                    valueField: 'id',
                    displayField: 'text',
                    flex: 0.4,
                    margin: '2 0 0 2',
                    value: data.get("id"),
                    editable: false,
                    listeners: {
                        change: function (obj, newValue, oldValue, eOpts) {
                            let parent = this.up("panel");
                            parent.remove(parent.items.get(1), true);
                            let data = obj.getStore().findRecord("id", newValue, 0, false, false, true);

                            let inputItem = buildSearchItem(getColumn(grid, data.get("id"), data.get("text")));
                            inputItem.removeSearch = function () {
                                this.ownerCt.destroy();
                            };
                            parent.insert(1, inputItem);
                        }
                    },
                    store: store
                },
                inputItem
            ]
        };
    };

    let defaultItems = grid.searchItems;
    if (!defaultItems) {
        defaultItems = [];
    }

    let formPanel = Ext.create('Ext.form.FormPanel', {
        margin: '5',
        border: 0,
        layout: 'column',
        width: 400,
        scrollable: true,
        defaults: {
            labelWidth: 80,
            margin: '5 5 5 5',
            labelAlign: 'right',
            emptyText: '请填写'
        },
        items: defaultItems,
    });

    Ext.each(grid.getColumns(), function (item) {
        if (item.where) {
            let data = store.findRecord("id", item.dataIndex, 0, false, false, true);
            for (let i = 0; i < item.where.length; i++) {
                formPanel.add(buildItem(data, item.where[i]));
            }
        }
    });
    if (formPanel.items.length === 0) {
        formPanel.add(buildItem(store.getAt(0)));
    }


    if (!obj.searchWin) {
        obj.searchWin = Ext.create('Ext.window.Window', {
            title: '搜索数据',
            layout: 'fit',
            constrain: true,
            iconCls: 'extIcon extSearch',
            resizable: true,
            minHeight: 200,
            minWidth: 400,
            height: 200,
            animateTarget: obj,
            items: [formPanel],
            listeners: {
                close: function (panel, eOpts) {
                    obj.searchWin = null;
                }
            },
            buttons: [
                {
                    text: '添加条件',
                    iconCls: 'extIcon extPlus',
                    handler: function () {
                        formPanel.add(buildItem(store.getAt(0)));
                        let winHeight = 50 + formPanel.items.length * 35 + 55;
                        formPanel.scrollTo(0, winHeight, false);
                    }
                },
                {
                    text: '确定',
                    iconCls: 'extIcon extOk',
                    handler: function () {
                        Ext.each(grid.getColumns(), function (item) {
                            item.clearSearch();
                        });
                        let searchColumns = [];
                        formPanel.items.each(function (item) {
                            if (!item.toParam) {
                                let params = {};
                                params["where['" + item.name + "']"] = item.getValue();
                                Ext.apply(grid.getStore().proxy.extraParams, params);
                                return;
                            }
                            let toParam = item.toParam();
                            if (!toParam) {
                                return;
                            }
                            if (Ext.isEmpty(toParam.value)) {
                                return;
                            }
                            let column = getColumn(grid, toParam.dataIndex, toParam.text);
                            if (!column) {
                                return false;
                            }
                            if (!column.where) {
                                column.where = [];
                            }
                            delete toParam.dataIndex;
                            delete toParam.text;
                            column.where.push(toParam);
                            searchColumns.push(column);
                        });
                        Ext.each(searchColumns, function (item) {
                            item.doSearch(false);
                        });
                        grid.getStore().loadPage(1);
                    }
                }]
        });
        grid.ownerCt.add(obj.searchWin);
    }
    obj.searchWin.show();
}


/**
 * 批量随机值
 * @param column
 */
function batchEditColumnRandom(column) {
    let idCode = "Random" + Ext.now();
    let autoType = 1;
    let dateFormat = 'Y-m-d H:i:s';
    let dataLength = getColumnGrid(column).getStore().getTotalCount();
    let title = "批量随机生成当前页的【" + column.text + "】列数据";
    if (getColumnGrid(column).getSelection().length > 0) {
        title = "批量随机生成选择的" + getColumnGrid(column).getSelection().length + "条【" + column.text + "】列数据";
        dataLength = getColumnGrid(column).getSelection().length;
    }
    if (isNumberColumn(column) || isEnumColumn(column) || isLinkColumn(column)) {
        autoType = 2;
    } else if (isDateColumn(column)) {
        autoType = 3;
        if (Ext.isObject(column.field)) {
            dateFormat = column.field.format;
        }
    }

    let textField = {
        xtype: 'fieldcontainer',
        layout: 'column',
        columnWidth: 1,
        id: idCode + "_1",
        defaults: {
            labelWidth: 60,
            margin: '5 5 5 5',
            labelAlign: 'right',
            columnWidth: 1,
            emptyText: '请填写'
        },
        items: [
            {
                xtype: 'fieldset',
                columnWidth: 1,
                layout: 'column',
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                title: '文字设置',
                items: [
                    {
                        fieldLabel: '文字前缀',
                        name: 'textPrefix',
                        allowBlank: false,
                        xtype: 'textfield',
                    },
                    {
                        fieldLabel: '开始序数',
                        name: 'textStartNumber',
                        value: 1,
                        allowBlank: false,
                        xtype: 'numberfield',
                    }
                ]
            }
        ]
    };
    let numberField = {
        xtype: 'fieldcontainer',
        layout: 'column',
        columnWidth: 1,
        id: idCode + "_2",
        hidden: true,
        disabled: true,
        defaults: {
            labelWidth: 60,
            margin: '5 5 5 5',
            labelAlign: 'right',
            columnWidth: 1,
            emptyText: '请填写'
        },
        items: [
            {
                xtype: 'fieldset',
                columnWidth: 1,
                layout: 'column',
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                title: '数字设置',
                items: [
                    {
                        fieldLabel: '保留位数',
                        name: 'dotNumber',
                        value: 0,
                        allowBlank: false,
                        xtype: 'numberfield',
                    },
                    {
                        fieldLabel: '最小数字',
                        name: 'minNumber',
                        value: 0,
                        allowBlank: false,
                        xtype: 'numberfield',
                    },
                    {
                        fieldLabel: '最大数字',
                        name: 'maxNumber',
                        allowBlank: false,
                        xtype: 'numberfield',
                    }
                ]
            }
        ]
    };

    let dateField = {
        xtype: 'fieldcontainer',
        layout: 'column',
        columnWidth: 1,
        id: idCode + "_3",
        hidden: true,
        disabled: true,
        defaults: {
            labelWidth: 60,
            margin: '5 5 5 5',
            labelAlign: 'right',
            columnWidth: 1,
            emptyText: '请填写'
        },
        items: [
            {
                xtype: 'fieldset',
                columnWidth: 1,
                layout: 'column',
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                title: '日期设置',
                items: [
                    {
                        fieldLabel: '最小日期',
                        xtype: 'datefield',
                        name: 'minDate',
                        allowBlank: false,
                        format: dateFormat
                    },
                    {
                        fieldLabel: '最大日期',
                        xtype: 'datefield',
                        name: 'maxDate',
                        allowBlank: false,
                        format: dateFormat
                    }
                ]
            }
        ]
    };


    let setPanel = Ext.create('Ext.form.Panel', {
        bodyPadding: 5,
        region: 'center',
        autoScroll: true,
        layout: "column",
        defaults: {
            labelWidth: 60,
            margin: '5 5 5 5',
            labelAlign: 'right',
            columnWidth: 1,
            emptyText: '请填写'
        },
        items: [
            {
                xtype: "combo",
                name: 'autoType',
                fieldLabel: '随机类型',
                editable: false,
                displayField: "text",
                valueField: "id",
                value: 1,
                listeners: {
                    change: function (obj, newValue, oldValue, eOpts) {
                        Ext.getCmp(idCode + "_" + oldValue).setHidden(true);
                        Ext.getCmp(idCode + "_" + oldValue).setDisabled(true);

                        Ext.getCmp(idCode + "_" + newValue).setHidden(false);
                        Ext.getCmp(idCode + "_" + newValue).setDisabled(false);
                    }
                },
                store: Ext.create('Ext.data.Store', {
                    fields: ["id", "text"],
                    data: [
                        {
                            'text': '文本',
                            "id": 1
                        },
                        {
                            'text': '数字',
                            "id": 2
                        },
                        {
                            'text': '日期',
                            "id": 3
                        }]
                })
            }, textField, numberField, dateField
        ]
    });


    let setColumnValue = function (valueArray) {
        if (valueArray.length === 0 || !(getColumnGrid(column).getStore())) return;
        getColumnGrid(column).getStore().holdUpdate = true;
        let selectData = getColumnGrid(column).getSelectionModel().getSelection();
        if (selectData.length > 0) {
            Ext.each(selectData, function (record, index) {
                record.set(column.dataIndex, valueArray[index]);
            });
        } else {
            getColumnGrid(column).getStore().each(function (record, index) {
                record.set(column.dataIndex, valueArray[index]);
            });
        }
        getColumnGrid(column).getStore().holdUpdate = false;
        getColumnGrid(column).getStore().fireEvent("endupdate");
    };

    let win = Ext.create('Ext.window.Window', {
        title: title,
        height: 360,
        iconCls: 'extIcon extRandom',
        width: 450,
        layout: 'border',
        items: [setPanel],
        modal: true,
        constrain: true,
        listeners: {
            show: function () {
                let autoTypeField = setPanel.getField("autoType");
                autoTypeField.setValue(autoType);
                autoTypeField.setReadOnly(autoType != 1);
            }
        },
        buttons: [
            "->",
            {
                text: '取消',
                iconCls: 'extIcon extClose',
                handler: function () {
                    win.close();
                }
            }, {
                text: '立即生成',
                iconCls: 'extIcon extOk whiteColor',
                handler: function () {
                    let form = setPanel.getForm();
                    if (form.isValid()) {
                        let valueArray = [];
                        let buildType = setPanel.getFieldValue("autoType");
                        if (buildType === 1) {//文本
                            let textPrefix = setPanel.getFieldValue("textPrefix");
                            let textStartNumber = setPanel.getFieldValue("textStartNumber");
                            for (let i = parseInt(textStartNumber); i < Number.MAX_VALUE; i++) {
                                valueArray.push(textPrefix + i);
                                if (valueArray.length === dataLength) {
                                    break;
                                }
                            }
                        } else if (buildType === 2) {//数字
                            let dotNumber = setPanel.getFieldValue("dotNumber");
                            let minNumber = setPanel.getFieldValue("minNumber");
                            let maxNumber = setPanel.getFieldValue("maxNumber");
                            if (minNumber > maxNumber) {
                                showAlert("系统提醒", "最大数字必须大于最小数字！");
                                return;
                            }
                            for (let i = 0; i < Number.MAX_VALUE; i++) {
                                let numberValue = Math.random() * (maxNumber - minNumber) + minNumber;
                                valueArray.push(numberValue.toFixed(dotNumber));
                                if (valueArray.length === dataLength) {
                                    break;
                                }
                            }
                        } else if (buildType === 3) {//日期
                            let minDate = setPanel.getFieldValue("minDate");
                            let maxDate = setPanel.getFieldValue("maxDate");
                            if (minDate.getTime() > maxDate.getTime()) {
                                showAlert("系统提醒", "最大日期必须大于最小日期！");
                                return;
                            }
                            for (let i = 0; i < Number.MAX_VALUE; i++) {
                                let sub = maxDate.getTime() - minDate.getTime();
                                let numberValue = Math.random() * sub + minDate.getTime();
                                let randDate = new Date(numberValue);
                                valueArray.push(Ext.Date.format(randDate, setPanel.getField("minDate").format));
                                if (valueArray.length === dataLength) {
                                    break;
                                }
                            }
                        }
                        setColumnValue(valueArray);
                        win.close();
                    }
                }
            }]
    });
    win.show();
}


/**
 * 显示列排序窗体
 * @param obj
 */
function showColumnSortWin(obj, grid) {
    let store = getGridColumnStore(grid);

    let buildItem = function (data, defaultValue) {
        if (!defaultValue) {
            defaultValue = "ASC";
        }
        return {
            xtype: 'panel',
            flex: 1,
            columnWidth: 1,
            layout: 'hbox',
            margin: '0',
            border: 0,
            toParam: function () {
                let param = {};
                let combo = this.items.get(0);
                param["property"] = combo.getValue();
                let directionItem = this.items.get(1);
                param["direction"] = directionItem.getValue();
                return param;
            },
            items: [
                {
                    xtype: 'combo',
                    region: 'west',
                    valueField: 'id',
                    flex: 0.4,
                    margin: '2 0 0 2',
                    value: data.get("id"),
                    displayField: 'text',
                    editable: false,
                    store: store
                },
                {
                    xtype: 'combo',
                    flex: 1,
                    valueField: 'value',
                    editable: false,
                    margin: '2 2 0 2',
                    value: defaultValue,
                    triggers: {
                        close: {
                            cls: 'text-clear',
                            handler: function () {
                                this.ownerCt.destroy();
                            }
                        }
                    },
                    store: Ext.create('Ext.data.Store', {
                        fields: ["id", "text"],
                        data: [
                            {
                                'text': '无',
                                'value': 'NONE'
                            },
                            {
                                'text': '正序',
                                "value": 'ASC'
                            },
                            {
                                'text': '倒序',
                                "value": 'DESC'
                            }]
                    })
                },
            ]
        };
    };

    let formPanel = Ext.create('Ext.form.FormPanel', {
        margin: '5',
        border: 0,
        layout: 'column',
        width: 400,
        scrollable: true,
        defaults: {
            labelWidth: 80,
            margin: '5 5 5 5',
            labelAlign: 'right',
            emptyText: '请填写'
        },
        items: [],
    });

    grid.getStore().getSorters().each(function (item) {
        let data = store.findRecord("id", item.getProperty(), 0, false, false, true);
        formPanel.add(buildItem(data, item.getDirection()));
    });

    if (formPanel.items.length === 0) {
        formPanel.add(buildItem(store.getAt(0), "NONE"));
    }


    if (!obj.sortWin) {
        obj.sortWin = Ext.create('Ext.window.Window', {
            title: '排序数据',
            layout: 'fit',
            constrain: true,
            iconCls: 'extIcon extSort',
            resizable: true,
            minHeight: 200,
            minWidth: 400,
            height: 200,
            animateTarget: obj,
            items: [formPanel],
            listeners: {
                close: function (panel, eOpts) {
                    obj.sortWin = null;
                }
            },
            buttons: [
                {
                    text: '添加条件',
                    iconCls: 'extIcon extPlus',
                    handler: function () {
                        formPanel.add(buildItem(store.getAt(0)));
                        let winHeight = 50 + formPanel.items.length * 35 + 55;
                        formPanel.scrollTo(0, winHeight, false);
                    }
                },
                {
                    text: '确定',
                    iconCls: 'extIcon extOk',
                    handler: function () {
                        let sortCollection = grid.getStore().getSorters();
                        sortCollection.clear();

                        Ext.each(grid.getColumns(), function (item) {
                            item.sortDirection = null;
                            refreshColumnStyle(item);
                        });

                        let sorts = [];
                        formPanel.items.each(function (item) {
                            let toParam = item.toParam();
                            sorts.push(toParam);
                            let column = getColumn(grid, toParam.property);
                            column.sortDirection = toParam.direction;
                            refreshColumnStyle(column);
                        });
                        if (sorts.length > 0) {
                            grid.getStore().sort(sorts);
                        } else {
                            grid.getStore().loadPage(1);
                        }
                        checkColumnSort(grid);
                    }
                }]
        });
        grid.ownerCt.add(obj.sortWin);
    }
    obj.sortWin.show();


}




