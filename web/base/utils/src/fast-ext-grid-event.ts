namespace FastExt {


    /**
     * grid事件方法类
     */
    export class GridEvent {

        /**
         * 自定义事件：aftertabactive,当grid所在的tab页面被激活后
         */
        static onFastAfterTabActive() {
            try {
                let grid = <any>this;
                if (grid.operate.refreshData || FastExt.System.gridRefreshData) {
                    grid.getStore().reload();
                }
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 事件：viewready
         */
        static onFastViewRead(view, eOpts) {
            view.getHeaderContainer().sortOnClick = false;
        }

        /**
         * 事件：beforedestroy
         */
        static onFastBeforeDestroy() {
            let grid = <any>this;
            if (FastExt.Base.toBool(grid.destroySaveUI, true)) {
                grid.saveUIConfig(false);
            }
            grid.hideEmptyTip();
        }

        /**
         * 事件：columnmove
         */
        static onFastColumnMove(ct, column, fromIdx, toIdx, eOpts) {
            let grid = <any>this;
            if (column.isSubHeader) {
                column.groupHeaderText = column.ownerCt.text;
            } else {
                column.groupHeaderText = null;
            }
            grid.saveUIConfig(true);
        }


        /**
         * 事件：columnresize
         */
        static onFastColumnResize(ct, column, width, eOpts) {
            let grid = <any>this;
            // column.width=width;  此处注释，避免出现分组列时 宽度错乱
            grid.sortOnClick = false;
            grid.saveUIConfig(true);
        }


        /**
         * 事件：columnschanged
         */
        static onFastColumnsChanged(ct, eOpts) {
            ct.sortOnClick = false;
            let grid = <any>this;
            grid.saveUIConfig(true);
        }


        /**
         * 事件：headertriggerclick
         */
        static onFastHeaderTriggerClick(ct, column, e, t, eOpts) {
            let grid = <any>this;
            if (Ext.isEmpty(column.dataIndex) || grid.fromRecycle) return;
            ct.sortOnClick = false;
            ct.triggerColumn = column;
        }


        /**
         * 事件：headercontextmenu
         */
        static onFastHeaderContextMenu(ct, column, e, t, eOpts) {
            let grid = <any>this;
            if (Ext.isEmpty(column.dataIndex) || grid.fromRecycle) return;
            ct.sortOnClick = false;
            ct.onHeaderTriggerClick(column, e, column.triggerEl);
        }

        /**
         * 事件：headermenucreate
         */
        static onFastHeaderMenuCreate(ct, menu, headerCt, eOpts) {
            let grid = <any>this;
            grid.columnHeadMenu = menu;
            FastExt.Grid.configGridHeadMenu(grid);
        }

        /**
         * 事件：headerclick
         */
        static onFastHeaderClick(ct, column, e, t, eOpts) {
            if (Ext.isEmpty(column.dataIndex)) return;
            ct.sortOnClick = false;
            if (!FastExt.Grid.showColumnSearchMenu(column)) {
                ct.onHeaderTriggerClick(column, e, column.triggerEl);
            }
        }


        /**
         * 事件：sortchange
         */
        static onFastSortChange(ct, column, direction, eOpts) {
            if (Ext.isEmpty(column.dataIndex)) return;
            column.sortDirection = direction;
            let grid = <any>this;

            FastExt.Grid.refreshColumnStyle(column);
            grid.saveUIConfig(true);
        }

        /**
         * 事件：cellcontextmenu
         */
        static onFastCellContextMenu(obj, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            let grid = <any>this;
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
                    obj.getSelectionModel().select(record);
                    obj.fireEvent("selectionchange", obj, record, eOpts);

                    FastExt.Menu.fireMenuEvent(grid.contextMenu, "onBeforeShow");
                    FastExt.Menu.refreshItem(grid.contextMenu);
                    grid.contextMenu.showAt(e.getXY());
                }
            }
        }


        /**
         * 事件：celldblclick
         */
        static onFastCellDblclick() {
            let grid = <any>this;
            grid.doEdit = true;
        }

        /**
         * 事件：beforeedit
         */
        static onFastBeforeEdit(editor, context, eOpts) {
            let grid = <any>this;
            if (!grid.checkEditor()) {
                FastExt.Dialog.toast("无编辑权限（E-1）！");
                return false;
            }
            if (!FastExt.Base.toBool(grid.doEdit, true)) {
                return false;
            }
            grid.doEdit = false;
            if (!FastExt.Base.toBool(context.column.editable, true)) {
                FastExt.Dialog.toast("无编辑权限（E-2）！");
                return false;
            }
            if (context.column.hasListener("beforeedit")) {
                if (!context.column.fireEvent("beforeedit", context)) {
                    return false;
                }
            }
            let editorField = context.column.field;
            if (!editorField) {
                FastExt.Dialog.toast("无编辑权限（E-3）！");
                return false;
            }
            let cell = Ext.get(context.cell);
            editorField.labelTitle = context.column.text;
            editorField.record = context.record;
            editorField.fromColumn = true;

            if (editorField.hasListener("beforeedit")) {
                if (!editorField.fireEvent("beforeedit", editorField)) {
                    return false;
                }
            }

            if (FastExt.Listeners.onBeforeEditorField) {
                if (!FastExt.Listeners.onBeforeEditorField(editorField, context.record)) {
                    return false;
                }
            }

            if (Ext.isFunction(editorField.setValue) && !FastExt.Base.toBool(context.column.password, false)) {
                if (Ext.isObject(context.value) || Ext.isArray(context.value)) {
                    editorField.setValue(JSON.stringify(context.value), context.record);
                } else {
                    editorField.setValue(context.value, context.record);
                }
            }
            if (Ext.isFunction(editorField.startEdit)) {
                editorField.startEdit();
            }
            if (Ext.isFunction(editorField.showWindow)) {
                editorField.showWindow(cell, function (result) {
                    if (Ext.isEmpty(context.value) && Ext.isEmpty(result.getValue())) {
                        return;
                    }
                    FastExt.Store.setRecordValue(context.record, context.field, result);
                });
                return false;
            }

            if (!context.column.editMenu) {
                context.column.editMenu = Ext.create('Ext.menu.Menu', {
                    modal: true,
                    layout: 'fit',
                    showSeparator: false,
                    shadow: false,
                    editorMenu: true,
                    items: [
                        {
                            xtype: 'container',
                            layout: 'fit',
                            width: cell.getWidth(),
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
                                let currError = FastExt.Form.getFieldError(fieldObj);
                                FastExt.Dialog.toast(currError[0]);
                                FastExt.Component.shakeComment(obj, function () {
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
                            if (!fieldObj) {
                                return;
                            }
                            if ((Ext.isEmpty(obj.context.value) || FastExt.Base.toBool(obj.context.column.password, false)) && Ext.isEmpty(fieldObj.getValue())) {
                                if (Ext.isFunction(fieldObj.endEdit)) {
                                    fieldObj.endEdit();
                                }
                                return;
                            }
                            FastExt.Store.setRecordValue(obj.context.record, obj.context.field, fieldObj);
                            if (Ext.isFunction(fieldObj.endEdit)) {
                                fieldObj.endEdit();
                            }
                            fieldObj.setValue(null);
                        }
                    }
                });
                context.column.editMenu.addCls("edit-menu");
            }


            let triggersCount = 0;

            if (Ext.isFunction(editorField.getTriggers)) {
                triggersCount = editorField.getTriggers() ? Object.keys(editorField.getTriggers()).length : 0;
            }

            context.column.editMenu.setWidth(Math.max(context.column.getWidth(), 120 + triggersCount * 30));
            context.column.editMenu.context = context;

            // let yOffset = ((FastExt.Form.getFieldMinHeight(true) + 2) - FastExt.Grid.getRowMinHeight()) / 2;
            context.column.editMenu.showBy(cell, "tl");
            return false;
        }

        /**
         * 事件：selectionchange
         */
        static onFastSelectionChange(obj, selected, eOpts) {
            try {
                let grid = <any>this;
                if (selected && !grid.fromStoreChange) {
                    grid.recordSelect();
                }

                grid.refreshSelect();
                grid.refreshDetailsPanel();
            } catch (e) {
                FastExt.Dialog.showException(e, "按钮选中检测！[selectionchange]");
            }
        }


        /**
         * 事件：store:endupdate
         */
        static onFastStoreEndUpdate() {
            try {
                let grid = <any>this;
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
                    grid.setLoading("提交数据中……");
                    FastExt.Store.commitStoreUpdate(grid.getStore()).then(function () {
                        grid.setLoading(false);
                    });
                }
            } catch (e) {
                FastExt.Dialog.showException(e, "endupdate");
            }
        }

        /**
         * 事件：store:datachanged
         */
        static onFastStoreDataChanged() {
            let grid = <any>this;
            if (grid.fireLoadResotreSelect) {
                grid.restoreSelect();
            }
            grid.showEmptyTip();
        }

        /**
         * 事件：store:load
         */
        static onFastStoreLoad() {
            let grid = <any>this;
            if (!grid.fireLoadResotreSelect) {
                grid.fireLoadResotreSelect = true;
                grid.restoreSelect();
            }
        }

        /**
         * 事件：store:beforeload
         */
        static onFastStoreBeforeLoad() {
            let grid = <any>this;
            grid.hideEmptyTip();
        }


        /**
         * 事件：headermenu:beforeshow
         */
        static onFastHeadMenuBeforeShow(obj) {
            let grid = <any>this;
            let menu = obj;
            if (!FastExt.Grid.hasColumnField(menu.activeHeader)) {
                menu.activeHeader.batchUpdate = false;
                menu.activeHeader.operation = false;
                menu.activeHeader.searchLink = false;
                menu.activeHeader.batchRandom = false;
            }

            if (FastExt.Grid.isFilesColumn(menu.activeHeader)
                || FastExt.Grid.isFileColumn(menu.activeHeader)
                || FastExt.Grid.isLinkColumn(menu.activeHeader)
                || FastExt.Grid.isMapColumn(menu.activeHeader)
                || FastExt.Grid.isTargetColumn(menu.activeHeader)
                || FastExt.Grid.isPCAColumn(menu.activeHeader)) {
                menu.activeHeader.batchRandom = false;
            }

            if (FastExt.Grid.isContentColumn(menu.activeHeader)) {
                menu.activeHeader.searchLink = false;
            }
            if (!menu.configHeadMenu) {
                menu.configHeadMenu = true;

                let menus = [];
                menus.push({
                    text: '查看说明',
                    iconCls: 'extIcon extConvertCode',
                    onBeforeShow: function () {
                        if (Ext.isEmpty(menu.activeHeader.comment)) {
                            this.hide();
                        } else {
                            this.show();
                        }
                    },
                    handler: function () {
                        FastExt.Dialog.showHtml(this, "查看【" + menu.activeHeader.text + "】的说明", menu.activeHeader.comment, false);
                    }
                });

                if (FastExt.Base.toBool(grid.columnMenu.lookField, true) && FastExt.System.isSuperRole()) {
                    menus.push({
                        text: '查看列信息',
                        iconCls: 'extIcon extField',
                        onBeforeShow: function () {
                            if (FastExt.Base.toBool(menu.activeHeader.lookField, true)) {
                                this.show();
                            } else {
                                this.hide();
                            }
                        },
                        handler: function () {
                            let info = {
                                name: menu.activeHeader.dataIndex,
                                text: menu.activeHeader.text,
                                width: menu.activeHeader.getWidth()
                            };
                            let result = new JSONFormat(FastExt.Json.objectToJson(info), 4).toString();
                            FastExt.Dialog.showAlert("查看列信息", result);
                        }
                    });
                }

                if (FastExt.System.isSuperRole() && FastExt.System.isDebug() && !FastExt.Base.toBool(grid.entitySelect, false)) {
                    menus.push({
                        text: '查看列编辑器',
                        iconCls: 'extIcon extField',
                        handler: function () {
                            let result = new JSONFormat(FastExt.Json.objectToJson(menu.activeHeader.configField), 4).toString();
                            FastExt.Dialog.showAlert("查看列编辑器", result);
                        }
                    });
                }

                if (!FastExt.Menu.isSplitLineLast(menus)) {
                    menus.push("-");
                }

                if (FastExt.Base.toBool(menu.activeHeader.batchClear, true)) {
                    menus.push({
                        text: '清除无效数据',
                        iconCls: 'extIcon extClear grayColor',
                        onBeforeShow: function () {
                            let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                            if (!columnGrid.checkDelete()) {
                                this.hide();
                                return;
                            }

                            if (FastExt.Base.toBool(menu.activeHeader.batchClear, true)) {
                                this.show();
                            } else {
                                this.hide();
                            }
                        },
                        handler: function () {
                            FastExt.Dialog.showDeleteDataAlert("清除无效数据", "将清除属性【" + menu.activeHeader.configText + "】在【当前当前条件】下为空的所有无效数据！请您确定操作！", function () {
                                FastExt.Dialog.showWait("正在清除数据中……");
                                let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                let params = {
                                    "entityCode": columnGrid.getStore().entity.entityCode,
                                    "field": menu.activeHeader.dataIndex,
                                    "menu": FastExt.Store.getStoreMenuText(columnGrid.getStore()),
                                    "storeId": columnGrid.getStore().getId(),
                                };
                                FastExt.Server.clearEntity(params, function (success, message) {
                                    FastExt.Dialog.hideWait();
                                    if (success) {
                                        FastExt.Grid.getColumnGrid(menu.activeHeader).getStore().loadPage(1);
                                    }
                                    FastExt.Dialog.showAlert("清理结果", message);
                                });
                            }, "清除");
                        }
                    });
                }

                if (FastExt.Base.toBool(menu.activeHeader.batchClearRepeat, true)) {
                    menus.push({
                        text: '清除重复数据-保留最新',
                        iconCls: 'extIcon extDelRepeat grayColor',
                        onBeforeShow: function () {
                            let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                            if (!columnGrid.checkDelete()) {
                                this.hide();
                                return;
                            }

                            if (FastExt.Base.toBool(menu.activeHeader.batchClearRepeat, true)) {
                                this.show();
                            } else {
                                this.hide();
                            }
                        },
                        handler: function () {
                            FastExt.Dialog.showDeleteDataAlert("清除重复数据-保留最新", "将清除属性【" + menu.activeHeader.configText + "】在【当前当前条件】下重复的数据，并保留最新的一条数据！请您确定操作！", function () {
                                FastExt.Dialog.showWait("正在清除数据中……");
                                let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                let params = {
                                    "entityCode": columnGrid.getStore().entity.entityCode,
                                    "field": menu.activeHeader.dataIndex,
                                    "type": 1,
                                    "menu": FastExt.Store.getStoreMenuText(columnGrid.getStore()),
                                    "storeId": columnGrid.getStore().getId()
                                };

                                FastExt.Server.clearRepeatEntity(params, function (success, message) {
                                    FastExt.Dialog.hideWait();
                                    if (success) {
                                        FastExt.Grid.getColumnGrid(menu.activeHeader).getStore().loadPage(1);
                                    }
                                    FastExt.Dialog.showAlert("清理结果", message);
                                });
                            }, "清除");

                        }
                    });

                    menus.push({
                        text: '清除重复数据-保留最早',
                        iconCls: 'extIcon extDelRepeat grayColor',
                        onBeforeShow: function () {
                            let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                            if (!columnGrid.checkDelete()) {
                                this.hide();
                                return;
                            }

                            if (FastExt.Base.toBool(menu.activeHeader.batchClearRepeat, true)) {
                                this.show();
                            } else {
                                this.hide();
                            }
                        },
                        handler: function () {
                            FastExt.Dialog.showDeleteDataAlert("清除重复数据-保留最早", "将清除属性【" + menu.activeHeader.configText + "】在【当前当前条件】下重复的数据，并保留最早的一条数据！请您确定操作！", function () {
                                FastExt.Dialog.showWait("正在清除数据中……");
                                let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                let params = {
                                    "entityCode": columnGrid.getStore().entity.entityCode,
                                    "field": menu.activeHeader.dataIndex,
                                    "type": 0,
                                    "menu": FastExt.Store.getStoreMenuText(columnGrid.getStore()),
                                    "storeId": columnGrid.getStore().getId()
                                };

                                FastExt.Server.clearRepeatEntity(params, function (success, message) {
                                    FastExt.Dialog.hideWait();
                                    if (success) {
                                        FastExt.Grid.getColumnGrid(menu.activeHeader).getStore().loadPage(1);
                                    }
                                    FastExt.Dialog.showAlert("清理结果", message);
                                });
                            }, "清除");
                        }
                    });
                }

                if (!FastExt.Menu.isSplitLineLast(menus)) {
                    menus.push("-");
                }


                menus.push({
                    text: '数据左对齐',
                    iconCls: 'extIcon extAlignLeft grayColor',
                    handler: function () {
                        menu.activeHeader.setAlignContent("left");
                    }

                });
                menus.push({
                    text: '数据居中对齐',
                    iconCls: 'extIcon extAlignCenter grayColor',
                    handler: function () {
                        menu.activeHeader.setAlignContent("center");
                    }
                });
                menus.push({
                    text: '数据右对齐',
                    iconCls: 'extIcon extAlignRight grayColor',
                    handler: function () {
                        menu.activeHeader.setAlignContent("right");
                    }
                });

                if (!FastExt.Menu.isSplitLineLast(menus)) {
                    menus.push("-");
                }

                if (grid.getStore().entity) {
                    if (FastExt.Base.toBool(grid.columnMenu.searchLink, true)) {
                        menus.push({
                            text: '配置搜索链',
                            iconCls: 'extIcon extLink',
                            onBeforeShow: function () {
                                let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                if (columnGrid.fromRecycle) {
                                    this.hide();
                                    return;
                                }
                                if (FastExt.Base.toBool(menu.activeHeader.searchLink, true)) {
                                    this.show();
                                } else {
                                    this.hide();
                                }
                            },
                            handler: function () {
                                FastExt.Grid.configColumnSearchLink(menu.activeHeader);
                            }
                        });
                    }
                    if (FastExt.Base.toBool(grid.columnMenu.operation, true)) {
                        menus.push({
                            text: '计算数据',
                            iconCls: 'extIcon extMath',
                            onBeforeShow: function () {
                                let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                if (columnGrid.fromRecycle) {
                                    this.hide();
                                    return;
                                }
                                if (FastExt.Base.toBool(menu.activeHeader.operation, false)) {
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
                                        FastExt.Grid.showColumnCompute(grid, menu.activeHeader, FastEnum.ComputeType.sum);
                                    }
                                },
                                {
                                    text: '计算平均值',
                                    iconCls: 'extIcon extMath',
                                    handler: function () {
                                        FastExt.Grid.showColumnCompute(grid, menu.activeHeader, FastEnum.ComputeType.avg);
                                    }
                                },
                                {
                                    text: '计算最大值',
                                    iconCls: 'extIcon extMath',
                                    handler: function () {
                                        FastExt.Grid.showColumnCompute(grid, menu.activeHeader, FastEnum.ComputeType.max);
                                    }
                                },
                                {
                                    text: '计算最小值',
                                    iconCls: 'extIcon extMath',
                                    handler: function () {
                                        FastExt.Grid.showColumnCompute(grid, menu.activeHeader, FastEnum.ComputeType.min);
                                    }
                                }
                            ]
                        });
                    }
                }

                if (!FastExt.Menu.isSplitLineLast(menus)) {
                    menus.push("-");
                }

                if (FastExt.Base.toBool(grid.columnMenu.batchUpdate, true)) {
                    menus.push({
                        text: '批量修改数据',
                        iconCls: 'extIcon extEdit',
                        onBeforeShow: function () {
                            let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                            if (!columnGrid.checkEditor()) {
                                this.hide();
                                return;
                            }
                            if (!FastExt.Base.toBool(menu.activeHeader.editable, true)) {
                                this.hide();
                                return;
                            }
                            if (FastExt.Base.toBool(menu.activeHeader.batchUpdate, true)) {
                                this.show();
                            } else {
                                this.hide();
                            }
                        },
                        handler: function () {
                            FastExt.Grid.showBatchEditColumn(menu.activeHeader);
                        }
                    });
                }

                if (FastExt.Base.toBool(grid.columnMenu.batchUpdateDB, true)) {
                    menus.push({
                        text: '批量更新数据',
                        iconCls: 'extIcon extEdit',
                        onBeforeShow: function () {
                            let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                            if (!columnGrid.checkEditor()) {
                                this.hide();
                                return;
                            }
                            if (!FastExt.Base.toBool(menu.activeHeader.editable, true)) {
                                this.hide();
                                return;
                            }
                            if (FastExt.Base.toBool(menu.activeHeader.batchUpdateDB, true)) {
                                this.show();
                            } else {
                                this.hide();
                            }
                        },
                        handler: function () {
                            FastExt.Grid.showBatchUpdateColumn(menu.activeHeader);
                        }
                    });
                }

                if (FastExt.Base.toBool(grid.columnMenu.batchReplaceDB, true)) {
                    menus.push({
                        text: '批量替换数据',
                        iconCls: 'extIcon extEdit',
                        onBeforeShow: function () {
                            let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                            if (!columnGrid.checkEditor()) {
                                this.hide();
                                return;
                            }
                            if (!FastExt.Base.toBool(menu.activeHeader.editable, true)) {
                                this.hide();
                                return;
                            }
                            if (FastExt.Base.toBool(menu.activeHeader.batchReplaceDB, true)) {
                                this.show();
                            } else {
                                this.hide();
                            }

                        },
                        handler: function () {
                            FastExt.Grid.showBatchReplaceColumn(menu.activeHeader);
                        }
                    });
                }

                if (!FastExt.Menu.isSplitLineLast(menus)) {
                    menus.push("-");
                }

                if (FastExt.Base.toBool(grid.columnMenu.batchRandom, true)) {
                    menus.push({
                        text: '生成随机数据',
                        iconCls: 'extIcon extRandom',
                        onBeforeShow: function () {
                            let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                            if (!columnGrid.checkEditor()) {
                                this.hide();
                                return;
                            }
                            if (!FastExt.Base.toBool(menu.activeHeader.editable, true)) {
                                this.hide();
                                return;
                            }
                            if (FastExt.Base.toBool(menu.activeHeader.batchRandom, true)) {
                                this.show();
                            } else {
                                this.hide();
                            }
                        },
                        handler: function () {
                            FastExt.Grid.showBatchEditColumnRandom(menu.activeHeader);
                        }
                    });
                }

                if (FastExt.Base.toBool(grid.columnMenu.cancelSort, true)) {
                    menus.push({
                        text: '取消排序',
                        iconCls: 'extIcon extCancelOrder',
                        onBeforeShow: function () {
                            let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                            if (columnGrid.fromRecycle) {
                                this.hide();
                                return;
                            }
                            if (FastExt.Base.toBool(menu.activeHeader.cancelSort, true)) {
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
                                FastExt.Grid.refreshColumnStyle(menu.activeHeader);
                                grid.saveUIConfig(true);
                            } catch (e) {
                                FastExt.Dialog.showException(e);
                            }
                        }
                    });
                }
                menu.insert(0, menus);
            }
            FastExt.Menu.fireMenuEvent(menu, "onBeforeShow");

            FastExt.Menu.refreshItem(menu);
        }


    }

}