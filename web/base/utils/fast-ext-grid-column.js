Ext.override(Ext.grid.column.Column, {
    afterRender: Ext.Function.createSequence(Ext.grid.column.Column.prototype.afterRender, function () {
        var me = this;
        me.code = getPowerCode(me);
        if (!me.renderer) {
            me.renderer = renders.normal();
        }

        if (me.rendererFunction) {
            me.renderer = eval(me.rendererFunction);
        }
        configColumnProperty(me);
    })
});

function isColumnType(target) {
    return target == "gridcolumn" || target.xtype == "gridcolumn";
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
    column.configText = column.text;
    column.toSearchKey = function (where) {
        return "where['" + this.getIndex() + this.dataIndex + where.compare + "']";
    };
    column.searchValue = function (value) {
        var me = this;
        if (!me.where) {
            me.where = [];
        }
        var where = {
            compare: '=',
            value: value
        };
        me.where.push(where);
        me.doSearch();
    };
    column.clearSearch = function () {
        var me = this;
        var storeParams = getColumnGrid(me).getStore().proxy.extraParams;
        if (me.where) {
            for (var i = 0; i < me.where.length; i++) {
                var key = me.toSearchKey(me.where[i]);
                if (storeParams.hasOwnProperty(key)) {
                    delete storeParams[key];//删除搜索记录
                }
            }
        }
    };
    column.doSearch = function () {
        var me = this;
        var storeParams = getColumnGrid(me).getStore().proxy.extraParams;
        if (me.where) {
            for (var i = 0; i < me.where.length; i++) {
                var w = me.where[i];
                var key = me.toSearchKey(w);
                var value = w.value;
                if (w.compare.indexOf('?') >= 0) {
                    value = '%' + w.value + '%';
                }
                storeParams[key] = value;
            }
            getColumnGrid(me).getStore().loadPage(1);

            if (me.where.length == 0) {
                column.setStyle('color', '#444444');
            } else {
                column.setStyle('color', 'red');
            }
        }
    };
}

/**
 * 刷新column样式
 * @param column
 */
function refreshColumnStyle(column) {
    if (!Ext.isEmpty(column.dataIndex)) {
        var sortDirection = column.sortDirection;
        if (Ext.isEmpty(sortDirection)) {
            sortDirection = "<font size='1'></font>";
        } else {
            if (sortDirection == "ASC") {
                sortDirection = "<font color='red' size='1'>&nbsp;&nbsp;[正序]</font>"
            } else {
                sortDirection = "<font color='red' size='1'>&nbsp;&nbsp;[倒序]</font>"
            }
        }
        if (Ext.isEmpty(column.sumText)) {
            column.sumText = "<font size='1'></font>";
        }
        column.setText("&nbsp;" + column.configText + column.sumText + sortDirection + "&nbsp;");
    }
}


/**
 * 显示column搜索菜单
 * @param column
 */
function showColumnSearchMenu(column) {
    if (isFilesColumn(column)
        || isFileColumn(column)) {
        return false;
    }
    if (!toBool(column.search, true)) {
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
                var index = this.items.length - 1;
                if (index >= 5) {
                    return;
                }
                this.insert(index, buildSearchItem(column, where));
            },
            doSearch: function () {
                var me = this;
                var where = [];
                me.items.each(function (item, index) {
                    if (item.searchItem) {
                        var toParam = item.toParam();
                        if (toParam == null) {
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
                            iconCls:'extIcon extSearch',
                            margin: '0 2 0 0',
                            handler: function () {
                                this.ownerCt.ownerCt.doSearch();
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls:'extIcon extPlus fontSize14',
                            width: 35,
                            handler: function () {
                                this.ownerCt.ownerCt.addSearchItem();
                            }
                        }]
                }],
            listeners: {
                show: function (obj, epts) {
                    if (obj.items.length == 1) {
                        obj.addSearchItem();
                    }
                    new Ext.KeyMap(obj.getEl(), [{
                        key: 13,
                        fn: function () {
                            obj.doSearch();
                        },
                        scope: obj
                    }]);
                }
            }
        });
    }

    if (column.where) {
        for (var i = 0; i < column.where.length; i++) {
            var where = column.where[i];
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
}


function buildSearchItem(column, where) {
    var editorField = getColumnSimpleEditor(column, true);

    editorField.flex = 1;
    editorField.margin = '2 2 0 0';
    editorField.repeatTriggerClick = false;
    editorField.onClearValue = function () {
        this.ownerCt.destroy();
    };
    editorField.triggers = {
        close: {
            cls: 'text-clear',
            handler: function () {
                this.ownerCt.destroy();
            }
        }
    };
    editorField.editable = true;
    editorField.emptyText = "请输入条件值";
    editorField.listeners = {
        afterrender: function (obj, eOpts) {
            if (Ext.isFunction(obj.getTrigger)) {
                if (obj.getTrigger('picker')) {
                    obj.getTrigger('picker').hide();
                }
                if (obj.getTrigger('spinner')) {
                    obj.getTrigger('spinner').hide();
                }
            }
        }
    };
    if (isDateField(editorField)) {
        editorField.editable = false;
    }
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
    var panel = {
        xtype: 'panel',
        margin: '0',
        searchItem: true,
        border: 0,
        layout: 'hbox',
        toParam: function () {
            var params = {};
            this.items.each(function (item) {
                if (Ext.isFunction(item.getValue)) {
                    if (item.isValid()) {
                        params[item.getName()] = item.getValue();
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
                    if (item.getName() == 'compare') {
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
}

/**
 * 计算数据
 */
function showCompute(grid, column, type) {
    if (!grid.getStore().entity) {
        Ext.Msg.alert('系统提醒', '计算失败！Grid的DataStore未绑定Entity!');
        return;
    }
    var storeParams = grid.getStore().proxy.extraParams;

    var params = {
        "entityCode": grid.getStore().entity.entityCode,
        "field": column.dataIndex,
        "type": type
    };

    showWait("正在计算中……");
    $.post("entity/compute", mergeJson(params, storeParams), function (result) {
        hideWait();
        var msg = "";
        if (type == 'sum') {
            msg = column.configText + "总和：";
        } else if (type == 'avg') {
            msg = column.configText + "平均值：";
        } else if (type == 'min') {
            msg = column.configText + "最小值：";
        } else if (type == 'max') {
            msg = column.configText + "最大值：";
        }
        if (Ext.isFunction(column.renderer)) {
            Ext.Msg.alert('系统提醒', msg + column.renderer(result.data));
        } else {
            Ext.Msg.alert('系统提醒', msg + result.data);
        }
    });

}


/**
 * 获得列的编辑类型
 */
function getColumnSimpleEditor(column, search) {
    var editor = {};
    if (Ext.isObject(column.field)) {
        editor.xtype = column.field.xtype;
    } else {
        editor.xtype = column.field;
    }
    if (Ext.isObject(column.config.field)) {
        if (search) {
            editor = copy(column.config.field);
        }else{
            editor = column.config.field;
        }
    }
    if (search) {
        if (isContentField(column.field)
            || isHtmlContentField(column.field)
            || isTargetField(column.field)) {
            editor.xtype = "textfield";
        }
    }
    if (Ext.isEmpty(editor.xtype)) {
        editor.xtype = "textfield";
    }
    editor.dataIndex = column.dataIndex;
    return editor;
}

/**
 * 判断列是否有编辑字段
 */
function hasColumnField(column) {
    if (Ext.isObject(column.field)) {
        return true;
    }
    if (!Ext.isEmpty(column.field)) {
        return true;
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
function getColumn(grid, dataIndex) {
    var columns = grid.getColumns();
    for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        if (column.dataIndex == dataIndex) {
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
    var currColor = column.getEl().getStyle("color");
    var currBGColor = column.getEl().getStyle("backgroundColor");
    column.setStyle({
        color: 'white',
        backgroundColor: '#e41f00'
    });
    setTimeout(function () {
        column.setStyle({
            color: currColor,
            backgroundColor: currBGColor
        });
        column.blinking = false;
    }, 1000);
}

/**
 * 滚到到指定的列
 * @param grid
 * @param dataIndex
 */
function scrollToColumn(grid, dataIndex) {
    var column = getColumn(grid, dataIndex);
    blinkColumn(column);
    var x = column.getLocalX();
    grid.view.getEl().scrollTo("left", x, true);
}

/**
 * 批量编辑列数据
 */
function batchEditColumn(column) {
    var editorField = column.batchField;
    if (!editorField) {
        editorField = getColumnSimpleEditor(column);
        editorField.flex = 1;
        editorField.emptyText = "请输入";
        editorField = column.batchField = Ext.create(editorField);
    }
    var putRecord = function (fieldObj) {
        if (!Ext.isEmpty(fieldObj.getValue())) {

            if (getColumnGrid(column).operate && getColumnGrid(column).operate.autoUpdate) {
                getColumnGrid(column).getStore().holdUpdate = true;
            }
            var selectData = getColumnGrid(column).getSelectionModel().getSelection();
            if (selectData.length > 0) {
                Ext.each(selectData, function (record, index) {
                    setRecordValue(record, column.dataIndex, fieldObj);
                });
            } else {
                getColumnGrid(column).getStore().each(function (record, index) {
                    setRecordValue(record, column.dataIndex, fieldObj);
                });
            }
            if (getColumnGrid(column).getStore().holdUpdate) {
                commitStoreUpdate(getColumnGrid(column).getStore()).then(function () {
                    getColumnGrid(column).getStore().holdUpdate = false;
                });
            }
        }
    };
    var placeholder = "批量修改当前页的【" + column.text + "】数据";
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
                var btn = this.down("button[name='confirm']");
                btn.setText("稍等");
                btn.setDisabled(true);
                var me = this;
                new Ext.Promise(function (resolve, reject) {
                    var fieldObj = me.items.get(0).items.get(0);
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
                    var fieldObj = obj.items.get(0).items.get(0);
                    fieldObj.focus();
                    new Ext.KeyMap(obj.getEl(), [{
                        key: 13,
                        fn: function () {
                            editMenu.doUpdate();
                        },
                        scope: obj
                    }]);
                },
                beforehide: function (obj, epts) {
                    var fieldObj = obj.items.get(0).items.get(0);
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
    var checked = "";
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




