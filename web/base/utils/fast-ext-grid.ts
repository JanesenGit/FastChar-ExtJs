namespace FastExt {

    /**
     * Ext.grid.Panel或Ext.tree.Panel相关操作
     */
    export class Grid {
        private constructor() {
            Ext.override(Ext.grid.Panel, {
                initComponent: Ext.Function.createSequence(Ext.grid.Panel.prototype.initComponent, FastExt.Grid.onGridInitComponent)
            });
            Ext.override(Ext.tree.Panel, {
                initComponent: Ext.Function.createSequence(Ext.tree.Panel.prototype.initComponent, FastExt.Grid.onGridInitComponent)
            });
            Ext.override(Ext.grid.Panel, {
                afterRender: Ext.Function.createSequence(Ext.grid.Panel.prototype.afterRender, FastExt.Grid.onGridAfterRender)
            });
            Ext.override(Ext.tree.Panel, {
                afterRender: Ext.Function.createSequence(Ext.tree.Panel.prototype.afterRender, FastExt.Grid.onGridAfterRender)
            });
        }

        /**
         * 初始化grid组件的自定义功能属性等
         */
        private static onGridInitComponent() {
            let grid: any = this;
            //取消行缓存渲染
            grid.bufferedRenderer = false;
            if (grid.entityList) {
                // grid.trailingBufferZone = 100;
                // grid.leadingBufferZone = 100;

                if (grid.getStore()) {
                    grid.getStore().grid = grid;
                    if (grid.getStore().where) {
                        grid.fromRecycle = grid.getStore().where['^fromRecycle'];
                    }
                }
                FastExt.Grid.configGridContextMenu(grid);
                FastExt.Grid.configDefaultToolBar(grid);
                FastExt.Grid.configGridListeners(grid);
            }
        }

        /**
         * 初始化Grid布局相关功能
         */
        private static onGridAfterRender() {
            let grid: any = this;
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

                FastExt.Grid.configGridLayout(grid).then(function () {
                    FastExt.Grid.configGridTip(grid);
                    grid.setLoading(false);
                    grid.getStore().grid = grid;
                    if (!grid.getStore().isLoaded()) {
                        grid.getStore().loadPage(1);
                    }
                });
            }
        }


        /**
         * 添加grid的右键菜单选项
         * @param grid
         * @param target
         * @param index
         */
        static addGridContextMenu(grid, target?, index?) {
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
         * 配置Grid默认的右键菜单功能
         * @param grid
         */
        static configGridContextMenu(grid) {
            let index = 0;
            FastExt.Grid.addGridContextMenu(grid, {
                iconCls: 'extIcon extDetails editColor',
                text: "查看详情",
                handler: function (obj, event) {
                    let subtitle = "";
                    if (grid.getStore().entity.menu) {
                        subtitle = "【" + grid.getStore().entity.menu.text + "】";
                    }

                    let winWidth = parseInt((document.body.clientWidth * 0.3).toFixed(0));
                    let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                    let win = Ext.create('Ext.window.Window', {
                        title: "查看详情" + subtitle,
                        subtitle: subtitle,
                        height: winHeight,
                        width: winWidth,
                        minHeight: 450,
                        minWidth: 400,
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
                        items: [FastExt.Grid.getDetailsPanel(grid, true)]
                    });
                    win.show();
                }
            }, index++);
            FastExt.Grid.addGridContextMenu(grid, {
                iconCls: 'extIcon extCopy2',
                text: "复制数据",
                menu: [
                    {
                        text: '复制单元格',
                        iconCls: 'extIcon extCopy2',
                        handler: function () {
                            let menu = grid.contextMenu;
                            FastExt.Base.copyToBoard($(menu.cellTd).text());
                            FastExt.Dialog.toast("复制成功！");
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
                            FastExt.Base.copyToBoard(content);
                            FastExt.Dialog.toast("复制成功！");
                        }
                    },
                    {
                        text: '复制数据',
                        iconCls: 'extIcon extCopy2',
                        handler: function () {
                            let menu = grid.contextMenu;
                            let record = menu.record;
                            let fieldName = menu.cellContext.column.dataIndex;
                            if (Ext.isArray(record.get(fieldName))) {
                                FastExt.Base.copyToBoard(Ext.encode(record.get(fieldName)));
                            } else {
                                FastExt.Base.copyToBoard(record.get(fieldName));
                            }
                            FastExt.Dialog.toast("复制成功！");
                        }
                    }
                ]
            }, index++);
            FastExt.Grid.addGridContextMenu(grid, {
                iconCls: 'extIcon extEdit editColor',
                text: "编辑数据",
                onBeforeShow: function () {
                    let menu = this.ownerCt;
                    if (Ext.isEmpty(menu.cellContext.column.dataIndex) || grid.getSelection().length !== 1) {
                        this.hide();
                        return;
                    }
                    if (!FastExt.Base.toBool(menu.cellContext.column.editable, true)) {
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
                FastExt.Grid.addGridContextMenu(grid, {
                    iconCls: 'extIcon extLink',
                    text: "搜索链",
                    onBeforeShow: function () {
                        this.show();
                        let menu = this.ownerCt;
                        if (!Ext.isObject(menu.cellContext.column.searchLink) || grid.getSelection().length !== 1) {
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
                                        FastExt.System.showTab(this.column.parent.method,
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

                FastExt.Grid.addGridContextMenu(grid, {
                    iconCls: 'extIcon extSearch searchColor',
                    text: "查找此数据",
                    onBeforeShow: function () {
                        let menu = this.ownerCt;
                        if (Ext.isEmpty(menu.cellContext.column.dataIndex)
                            || FastExt.Grid.isFileColumn(menu.cellContext.column)
                            || FastExt.Grid.isFilesColumn(menu.cellContext.column)
                            || grid.getSelection().length !== 1) {
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

                FastExt.Grid.addGridContextMenu(grid, {
                    iconCls: 'extIcon extClear',
                    text: "清空此数据",
                    onBeforeShow: function () {
                        let menu = this.ownerCt;
                        if (Ext.isEmpty(menu.cellContext.column.dataIndex) || grid.getSelection().length !== 1) {
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
                                    params["menu"] = FastExt.Store.getStoreMenuText(grid.getStore());
                                }
                                params['data.' + fieldName] = "<null>";
                                FastExt.Dialog.showWait("正在清空中……");
                                FastExt.Server.updateEntity(params, function (success, message) {
                                    FastExt.Dialog.hideWait();
                                    if (success) {
                                        FastExt.Dialog.toast("清除成功！");
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


        /**
         * 配置Grid列的默认的右键菜单功能
         * @param grid
         */
        static configGridHeadMenu(grid) {
            if (!FastExt.Base.toBool(grid.columnContextMenu, true)) {
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
                if (!FastExt.Grid.hasColumnField(menu.activeHeader)) {
                    obj.activeHeader.batchUpdate = false;
                    obj.activeHeader.operation = false;
                    obj.activeHeader.searchLink = false;
                    obj.activeHeader.batchRandom = false;
                }

                if (FastExt.Grid.isFilesColumn(obj.activeHeader)
                    || FastExt.Grid.isFileColumn(obj.activeHeader)
                    || FastExt.Grid.isLinkColumn(menu.activeHeader)
                    || FastExt.Grid.isMapColumn(menu.activeHeader)
                    || FastExt.Grid.isTargetColumn(menu.activeHeader)
                    || FastExt.Grid.isPCAColumn(menu.activeHeader)) {
                    obj.activeHeader.batchRandom = false;
                }

                if (FastExt.Grid.isContentColumn(obj.activeHeader)) {
                    obj.activeHeader.searchLink = false;
                }
                if (!obj.configHeadMenu) {
                    obj.configHeadMenu = true;

                    let menus = [];
                    if (FastExt.Base.toBool(grid.columnMenu.lookField, true)) {
                        menus.push({
                            text: '查看字段',
                            iconCls: 'extIcon extField',
                            onBeforeShow: function () {
                                if (FastExt.Base.toBool(menu.activeHeader.lookField, true)) {
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
                            if (FastExt.Base.toBool(menu.activeHeader.batchClear, true)) {
                                this.show();
                            } else {
                                this.hide();
                            }
                        },
                        handler: function () {
                            let confirmConfig = {
                                title: "清除无效数据",
                                icon: Ext.Msg.QUESTION,
                                message: "将清除属性【" + menu.activeHeader.text + "】在【当前当前条件】下为空的所有无效数据！请您确定操作！",
                                buttons: Ext.Msg.YESNO,
                                defaultFocus: "no",
                                callback: function (button, text) {
                                    if (button === "yes") {
                                        FastExt.Dialog.showWait("正在清除数据中……");
                                        let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                        let storeParams = columnGrid.getStore().proxy.extraParams;
                                        let params = {
                                            "entityCode": columnGrid.getStore().entity.entityCode,
                                            "field": menu.activeHeader.dataIndex,
                                            "menu": FastExt.Store.getStoreMenuText(columnGrid.getStore())
                                        };

                                        FastExt.Server.clearEntity(FastExt.Json.mergeJson(params, storeParams), function (success, message) {
                                            FastExt.Dialog.hideWait();
                                            if (success) {
                                                FastExt.Grid.getColumnGrid(menu.activeHeader).getStore().loadPage(1);
                                            }
                                            FastExt.Dialog.showAlert("清理结果", message);
                                        });
                                    }
                                }
                            };

                            Ext.Msg.confirm(confirmConfig);
                        }
                    });

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

                    if (FastExt.Base.toBool(grid.columnMenu.batchUpdate, true)) {
                        menus.push({
                            text: '批量修改数据',
                            iconCls: 'extIcon extEdit',
                            onBeforeShow: function () {
                                let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                if (columnGrid.fromRecycle) {
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

                    if (FastExt.Base.toBool(grid.columnMenu.batchRandom, true)) {
                        menus.push({
                            text: '批量随机数据',
                            iconCls: 'extIcon extRandom',
                            onBeforeShow: function () {
                                let columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                if (columnGrid.fromRecycle) {
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
                                } catch (e) {
                                    FastExt.Dialog.showException(e);
                                }
                            }
                        });
                    }
                    obj.insert(0, menus);
                }
                FastExt.Menu.fireMenuEvent(obj, "onBeforeShow");
            });
        }


        /**
         * 配置Grid默认的ToolBar功能
         * @param grid
         */
        static configDefaultToolBar(grid) {
            if (!grid) {
                return;
            }
            let toolbar = grid.down("toolbar[dock='top']");
            if (toolbar) {
                if (FastExt.Base.toBool(grid.fromRecycle, false)) {
                    toolbar.setHidden(true);
                    return;
                }
                if (!FastExt.Base.toBool(grid.defaultToolBar, true)) {
                    return;
                }
                if (!grid.operate) {
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
                            hidden: !FastExt.Base.toBool(grid.operate.excelOut, true),
                            handler: function () {
                                FastExt.Grid.exportGrid(grid);
                            }
                        },
                        {
                            text: '导入Excel',
                            iconCls: 'extIcon extExcel',
                            hidden: !FastExt.Base.toBool(grid.operate.excelIn, true),
                            menu: [
                                {
                                    text: '下载模板',
                                    iconCls: 'extIcon extExcelModule searchColor',
                                    handler: function () {
                                        FastExt.Dialog.showWait("正在生成中……");
                                        let params: any = {entityCode: grid.getStore().entity.entityCode};
                                        if (grid.getStore().entity.menu) {
                                            params.title = grid.getStore().entity.menu.text;
                                        }
                                        Ext.each(grid.getColumns(), function (item, index) {
                                            //排除文件类
                                            if (FastExt.Grid.isFileColumn(item) || FastExt.Grid.isFilesColumn(item)
                                                || !FastExt.Base.toBool(item.excelHeader, true)
                                                || item.isHidden()) {
                                                return;
                                            }
                                            if (!Ext.isEmpty(item.dataIndex)) {
                                                let indexStr = index;
                                                if (index < 10) {
                                                    indexStr = "0" + index;
                                                }
                                                params["column[" + indexStr + "].width"] = item.width;
                                                params["column[" + indexStr + "].text"] = item.configText;
                                                params["column[" + indexStr + "].groupHeaderText"] = item.groupHeaderText;
                                                params["column[" + indexStr + "].enum"] = FastExt.Grid.getColumnEnumName(item);
                                                params["column[" + indexStr + "].type"] = FastExt.Grid.getColumnFieldType(item);
                                                params["column[" + indexStr + "].dataIndex"] = item.dataIndex;
                                                if (FastExt.Grid.isLinkColumn(item)) {
                                                    params["column[" + indexStr + "].dataIndex"] = item.field.name;
                                                }
                                            }
                                        });
                                        FastExt.Server.excelModule(params, function (success, data, message) {
                                            FastExt.Dialog.hideWait();
                                            if (success) {
                                                FastExt.Dialog.toast("生成成功！");
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
                                        FastExt.File.importExcel(this, params, grid.importExcelItems).then(function (data) {
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
                                FastExt.Grid.setGrid(this, grid);
                            }
                        }]
                };
                toolbar.add("->");
                toolbar.add(button);
            }
        }


        /**
         * 配置Grid的ToolTip鼠标悬浮提醒的功能
         * @param grid
         */
        static configGridTip(grid) {
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
         * 配置Grid默认绑定的事件功能
         * @param grid
         */
        static configGridListeners(grid) {
            if (!grid || grid.configListener) {
                return;
            }
            grid.configListener = true;
            grid.onTabActivate = function (tab) {
                if (this.operate.refreshData) {
                    this.getStore().reload();
                }
            };
            grid.refreshSelect = function () {
                let me = this;
                if (me.selectButtons) {
                    Ext.each(me.selectButtons, function (item, index) {
                        let selectSize = me.getSelection().length;
                        if (me.selectCount) {
                            selectSize = me.selectCount;
                        }
                        let checkSelect = item.checkSelect;
                        if (checkSelect === "multiple" || checkSelect === "m" || checkSelect > 1) {
                            item.setDisabled(!(selectSize > 0));
                        } else if (checkSelect === "radio" || checkSelect === "r" || checkSelect === "single" || checkSelect === "s" || checkSelect === 1) {
                            item.setDisabled(!(selectSize === 1));
                        }
                    });
                }
            };
            grid.refreshDetailsPanel = function () {
                let targetGrid = this;
                if (!targetGrid.detailsPanels || targetGrid.detailsPanels.length === 0) {
                    return;
                }
                for (let i = 0; i < targetGrid.detailsPanels.length; i++) {
                    let detailsPanel = targetGrid.detailsPanels[i];
                    if (!detailsPanel) {
                        continue;
                    }
                    if (detailsPanel.fromWindow) {
                        detailsPanel.setRecord(targetGrid);
                    } else {
                        if (targetGrid.operate && targetGrid.operate.autoDetails) {
                            detailsPanel.setRecord(targetGrid);
                        } else {
                            detailsPanel.close();
                        }
                    }
                }
            };
            grid.on('viewready', function (obj, eOpts) {
                obj.getHeaderContainer().sortOnClick = false;
            });
            grid.on('beforedestroy', function (obj, eOpts) {
                FastExt.Grid.saveGridColumn(obj);
            });

            grid.on('columnmove', function (ct, column, fromIdx, toIdx, eOpts) {
                if (column.isSubHeader) {
                    column.groupHeaderText = column.ownerCt.text;
                } else {
                    column.groupHeaderText = null;
                }
            });

            grid.on('headertriggerclick', function (ct, column, e, t, eOpts) {
                if (Ext.isEmpty(column.dataIndex) || grid.fromRecycle) return;
                ct.sortOnClick = false;
                ct.triggerColumn = column;
            });
            grid.on('headercontextmenu', function (ct, column, e, t, eOpts) {
                if (Ext.isEmpty(column.dataIndex) || grid.fromRecycle) return;
                ct.sortOnClick = false;
                ct.onHeaderTriggerClick(column, e, column.triggerEl);
            });

            grid.on('headermenucreate', function (ct, menu, headerCt, eOpts) {
                grid.columnHeadMenu = menu;
                FastExt.Grid.configGridHeadMenu(grid);
            });

            grid.on('headerclick', function (ct, column, e, t, eOpts) {
                if (Ext.isEmpty(column.dataIndex)) return;
                ct.sortOnClick = false;
                if (!FastExt.Grid.showColumnSearchMenu(column)) {
                    ct.onHeaderTriggerClick(column, e, column.triggerEl);
                }
            });
            grid.on('sortchange', function (ct, column, direction, eOpts) {
                if (Ext.isEmpty(column.dataIndex)) return;
                column.sortDirection = direction;
                FastExt.Grid.refreshColumnStyle(column);
            });

            grid.on('columnresize', function (ct, column, width, eOpts) {
                // column.width=width;  此处注释，避免出现分组列时 宽度错乱
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
                                let tdColor = FastExt.Color.toColor(FastExt.System.getExt("front-color-dark").value);
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

                        FastExt.Menu.fireMenuEvent(grid.contextMenu, "onBeforeShow");
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
                        FastExt.Store.commitStoreUpdate(grid.getStore());
                    }
                } catch (e) {
                    FastExt.Dialog.showException(e, "endupdate");
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
                if (!FastExt.Base.toBool(context.column.editable, true)) {
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
                if (Ext.isFunction(editorField.setValue) && !FastExt.Base.toBool(context.column.password, false)) {
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
                        FastExt.Store.setRecordValue(context.record, context.field, result);
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
                                    if (currError.length === 0) {
                                        currError = [fieldObj.invalidText];
                                    }
                                    if (Ext.isEmpty(currError[0])) {
                                        currError[0] = "数据错误！";
                                    }
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
                                    return;
                                }
                                FastExt.Store.setRecordValue(obj.context.record, obj.context.field, fieldObj);
                                fieldObj.setValue(null);
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
                    grid.refreshSelect();
                    let pagingToolBar = grid.child('#pagingToolBar');
                    if (pagingToolBar) {
                        pagingToolBar.updateInfo();
                    }
                } catch (e) {
                    FastExt.Dialog.showException(e, "按钮选中检测！[selectionchange]");
                }
            });
        }


        /**
         * 配置Grid的布局
         * @param grid
         */
        static configGridLayout(grid) {
            return new Ext.Promise(function (resolve, reject) {
                if (!grid) {
                    return;
                }
                grid.setLoading("初始化配置中……");
                FastExt.Grid.restoreGridOperate(grid).then(function () {
                    FastExt.Grid.restoreGridColumn(grid).then(function () {
                        resolve(true);
                    });
                });
            });
        }


        /**
         * 构建grid列表右侧详细面板
         * @param grid
         * @param fromWindow
         * @private
         */
        static getDetailsPanel(grid, fromWindow): any {
            let subtitle = "";
            if (grid.getStore().entity.menu) {
                subtitle = grid.getStore().entity.menu.text;
            }
            if (!grid.detailsPanels) {
                grid.detailsPanels = [];
            }
            let detailsConfig: any = {
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
                                me.record = data[0];
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
                        FastExt.Dialog.showException(e);
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
                        this.down("#close").hide();
                    },
                    beforeexpand: function (p, eOpts) {
                        this.down("#close").show();
                    }
                },
                items: [FastExt.Grid.builderDetailsGrid()]
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
                detailsConfig.maxWidth = parseInt((document.body.clientWidth / 2).toFixed(0));
                detailsConfig.width = parseInt((document.body.clientWidth * 0.3).toFixed(0));
                detailsConfig.minWidth = 200;
                detailsConfig.tools = [
                    {
                        type: 'gear',
                        callback: function () {
                            FastExt.Grid.setGrid(this, grid);
                        }
                    }, {
                        type: 'close',
                        itemId: 'close',
                        callback: function () {
                            detailsPanel.collapse();
                        }
                    }];
            }
            let detailsPanel = Ext.create('Ext.panel.Panel', detailsConfig);
            detailsPanel.fromWindow = fromWindow;
            detailsPanel.changeListener = grid.on({
                scope: grid,
                selectionchange: function (obj, selected, eOpts) {
                    try {
                        let targetGrid = obj;
                        if (obj.getStore().grid) {
                            targetGrid = obj.getStore().grid;
                        }
                        targetGrid.refreshDetailsPanel();
                    } catch (e) {
                        FastExt.Dialog.showException(e);
                    }
                },
                destroyable: true
            });
            grid.detailsPanels.push(detailsPanel);
            return detailsPanel;
        }

        /**
         * 构建grid列表右侧详细面板中的详细数据grid控件
         */
        private static builderDetailsGrid(): any {
            return Ext.create('Ext.grid.Panel', {
                border: 0,
                scrollable: 'y',
                region: 'center',
                store: Ext.create('Ext.data.Store', {
                    groupField: 'groupHeaderText',
                    autoLoad: false,
                    fields: []
                }),
                hideHeaders: true,
                deferRowRender: false,
                superGrid: null,
                features: [{
                    ftype: 'grouping',
                    collapsible: false,
                    hideGroupedHeader: true,
                    expandTip: null,
                    collapseTip: null,
                    groupHeaderTpl: [
                        '<b>{name:this.formatName}</b>', {
                            formatName: function (name) {
                                if (name.toString().startsWith("BASE")) {
                                    return "基本属性";
                                }
                                return name;
                            }
                        }
                    ]
                }],
                setRecord: function (grid, record) {
                    this.superGrid = grid;
                    let columns = grid.getColumns();
                    let data = [];
                    let lastGroupNon = "BASE-" + new Date().getTime();
                    for (let i = 0; i < columns.length; i++) {
                        let column = columns[i];
                        if (Ext.isEmpty(column.dataIndex) || !FastExt.Base.toBool(column.hideable, true)) {
                            continue;
                        }
                        let item = {
                            text: column.configText,
                            value: record.get(column.dataIndex),
                            dataIndex: column.dataIndex,
                            groupHeaderText: column.groupHeaderText,
                            renderer: column.renderer,
                            index: column.getIndex(),
                            record: record
                        };
                        if (!item.groupHeaderText) {
                            item.groupHeaderText = lastGroupNon;
                        } else {
                            lastGroupNon = "BASE-" + i + "-" + new Date().getTime();
                        }
                        data.push(item);
                    }
                    data.sort(function (a, b) {
                        return a.index - b.index;
                    });
                    this.getStore().loadData(data);
                },
                columns: [
                    {
                        header: '名称',
                        dataIndex: 'text',
                        align: 'right',
                        flex: 0.3,
                        tdCls: 'tdVTop',
                        renderer: function (val, m, r) {
                            if (Ext.isEmpty(val)) {
                                return "";
                            }
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
                        let grid = this.ownerCt;
                        let store = grid.getStore();
                        let currIndex = 0;
                        let dataIndex = store.getAt(0).get("dataIndex");
                        let text = null;
                        let searchKey = this.getValue();
                        let currRecord = null;
                        if (!Ext.isEmpty(searchKey)) {
                            store.each(function (record, index) {
                                let fieldName = record.get("text").toString();
                                let fieldValue = record.get("value");
                                if (fieldName.indexOf(searchKey) >= 0) {
                                    currIndex = index;
                                    dataIndex = record.get("dataIndex");
                                    text = fieldName;
                                    currRecord = record;
                                    return;
                                }
                                if (!Ext.isEmpty(fieldValue) && fieldValue.toString().indexOf(searchKey) >= 0) {
                                    currIndex = index;
                                    dataIndex = record.get("dataIndex");
                                    text = fieldName;
                                    currRecord = record;
                                    return false;
                                }
                            });
                        }
                        FastExt.Grid.scrollToColumn(grid.superGrid, dataIndex, text);
                        grid.getSelectionModel().select(currIndex);
                        grid.view.focusRow(currIndex);
                        // grid.view.setScrollY(currIndex * 25, true);
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
                            FastExt.Grid.scrollToColumn(this.superGrid, data[0].get("dataIndex"), data[0].get("text"));
                        } catch (e) {
                            FastExt.Dialog.showException(e, "details:itemdblclick");
                        }
                    }
                }
            });
        }

        /**
         * 判断grid中是否有正在搜索的列
         * @param grid
         */
        static hasSearchColumn(grid): boolean {
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

        /**
         * 快速查找grid中的column对象
         * @param grid
         * @param dataIndex column的数据索引
         * @param text column的标题
         */
        static getColumn(grid, dataIndex, text?: string) {
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
         * 触发grid检查是否有搜索的列，如果有将修改底部bar的搜索按钮，突出提醒等功能
         * @param grid
         */
        static checkColumnSearch(grid) {
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
                let pagingToolBar = grid.child('#pagingToolBar');
                if (pagingToolBar) {
                    let searchBtn = pagingToolBar.down("button[toolType=searchBtn]");
                    if (searchBtn) {
                        if (hasSearch) {
                            searchBtn.setIconCls("extIcon extSearch redColor");
                        } else {
                            searchBtn.setIconCls("extIcon extSearch grayColor");
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }


        /**
         * 判断column是否可编辑
         * @param column
         */
        static hasColumnField(column): boolean {
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


        /**
         * 判断目标是否是grid的列组件
         * @param target
         */
        static isColumnType(target) {
            return target === "gridcolumn" || target.xtype === "gridcolumn";
        }


        /**
         * 是否是日期格式的列
         * @param column
         */
        static isDateColumn(column): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isDateField(column.field);
        }


        /**
         * 是否是数字编辑的列
         * @param column
         */
        static isNumberColumn(column): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isNumberField(column.field);
        }

        /**
         * 是否是下拉框的列
         * @param column
         */
        static isComboColumn(column): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isComboField(column.field);
        }


        /**
         * 是否文件类型的列
         * @param column
         */
        static isFileColumn(column): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isFileField(column.field);
        }


        /**
         * 是否是大文本的列
         * @param column
         */
        static isContentColumn(column): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isHtmlContentField(column.field) || FastExt.Form.isContentField(column.field);
        }


        /**
         * 是否多文件的列
         * @param column
         */
        static isFilesColumn(column): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isFilesField(column.field);
        }


        /**
         * 是否是枚举的列
         * @param column
         */
        static isEnumColumn(column): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isEnumField(column.field);
        }


        /**
         * 是否是关联表格的列
         * @param column
         */
        static isLinkColumn(column): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isLinkField(column.field);
        }

        /**
         * 是否是地图的列
         * @param column
         */
        static isMapColumn(column): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isMapField(column.field);
        }


        /**
         * 是否是省份选择的列
         * @param column
         */
        static isPCAColumn(column): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isPCAField(column.field);
        }

        /**
         * 是否目标类的列
         * @param column
         */
        static isTargetColumn(column): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isTargetField(column.field);
        }

        /**
         * 获得grid的选择器插件
         * @returns Ext.grid.selection.SpreadsheetModel
         */
        static getGridSelModel() {
            return Ext.create('Ext.grid.selection.SpreadsheetModel', {
                pruneRemoved: false,
                checkboxSelect: true,
                hasLockedHeader: true,
                cellSelect: false,
                rowNumbererHeaderWidth: 0,
                listeners: {
                    focuschange: function (obj, oldFocused, newFocused, eOpts) {
                        if (obj.store && obj.store.grid) {
                            let pagingToolBar = obj.store.grid.child('#pagingToolBar');
                            if (pagingToolBar) {
                                pagingToolBar.updateInfo();
                            }
                        }
                    }
                }
            });

        }

        /**
         * 闪烁列
         * @param column 列对象
         */
        static blinkColumn(column) {
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
         * @param grid grid对象
         * @param dataIndex 列的属性dataIndex
         * @param text 列的标题
         */
        static scrollToColumn(grid, dataIndex, text) {
            let column = FastExt.Grid.getColumn(grid, dataIndex, text);
            FastExt.Grid.blinkColumn(column);
            let x = column.getLocalX();
            if (column.isSubHeader) {
                x += column.ownerCt.getLocalX();
            }
            grid.view.getEl().scrollTo("left", x, true);
        }


        /**
         * 弹出设置grid操作界面
         * @param obj
         * @param grid
         * @see {@link FastExt.GridOperate}
         */
        static setGrid(obj, grid) {
            let setPanel = Ext.create('Ext.form.Panel', {
                bodyPadding: 5,
                region: 'center',
                autoScroll: true,
                viewModel: {
                    data: grid.operate
                },
                defaults: {
                    labelWidth: FastExt.Base.getNumberValue(FastExt.System.fontSize) * 4 + 8
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
                    },
                    {
                        xtype: 'checkboxfield',
                        fieldLabel: '数据刷新',
                        labelAlign: 'right',
                        columnWidth: 1,
                        name: 'refreshData',
                        bind: "{refreshData}",
                        uncheckedValue: false,
                        boxLabel: '离开此标签页后，再次返回此标签页时将刷新当前标签页的列表数据！'
                    }]
            });

            let winTitle = "操作设置";
            if (grid.getStore().entity && grid.getStore().entity.menu) {
                winTitle = FastExt.Store.getStoreMenuText(grid.getStore()) + "-" + winTitle;
            }
            let winWidth = parseInt((document.body.clientWidth * 0.3).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.4).toFixed(0));
            let win = Ext.create('Ext.window.Window', {
                title: winTitle,
                iconCls: 'extIcon extSet',
                height: winHeight,
                width: winWidth,
                minHeight: 370,
                minWidth: 300,
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
                            FastExt.Dialog.showWait("正在保存中…");
                            FastExt.Server.saveExtConfig(grid.code, "GridOperate", Ext.encode(setPanel.getForm().getValues()), function (success, message) {
                                FastExt.Dialog.hideWait();
                                if (success) {
                                    grid.operate = setPanel.getForm().getValues();
                                    FastExt.Dialog.toast("操作设置成功！");
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
         * 获得列绑定的枚举名称
         * @param column
         */
        static getColumnEnumName(column) {
            if (FastExt.Grid.isEnumColumn(column)) {
                if (Ext.isObject(column.field)) {
                    return column.field.enumName;
                }
            }
            return null;
        }

        /**
         * 获取列编辑框的type类型
         * @param column
         */
        static getColumnFieldType(column) {
            if (Ext.isObject(column.field)) {
                return column.field.xtype;
            }
            return column.field;
        }

        /**
         * 导出grid数据
         */
        static exportGrid(grid) {
            if (!grid.getStore().entity) {
                Ext.Msg.alert('系统提醒', '导出失败！Grid的DataStore未绑定Entity!');
                return;
            }
            let message = "您确定导出当前条件下的所有数据吗？";
            let data = grid.getSelection();
            if (data.length > 0) {
                message = "您确定导出选中的" + data.length + "条数据吗？";
            }

            Ext.Msg.confirm("系统提醒", message, function (button, text) {
                if (button === "yes") {
                    let storeParams = grid.getStore().proxy.extraParams;
                    let params: any = {};
                    if (grid.getStore().entity.menu) {
                        params.title = grid.getStore().entity.menu.text;
                    }

                    if (data.length > 0) {
                        for (let i = 0; i < data.length; i++) {
                            let record = data[i];
                            for (let j = 0; j < grid.getStore().entity.idProperty.length; j++) {
                                let idName = grid.getStore().entity.idProperty[j];
                                let key = "where['" + idName + "#']";
                                if (!params[key]) {
                                    params[key] = [];
                                }
                                params[key].push(record.get(idName));
                            }
                        }
                    }

                    Ext.each(grid.getColumns(), function (item, index) {
                        if (item.isHidden()) {
                            return;
                        }
                        //排除文件类
                        if (!Ext.isEmpty(item.dataIndex)) {
                            params["column[" + index + "].width"] = item.width;
                            params["column[" + index + "].text"] = item.configText;
                            params["column[" + index + "].groupHeaderText"] = item.groupHeaderText;
                            params["column[" + index + "].enum"] = FastExt.Grid.getColumnEnumName(item);
                            params["column[" + index + "].dataIndex"] = item.dataIndex;
                            params["column[" + index + "].file"] = FastExt.Grid.isFileColumn(item);
                            params["column[" + index + "].files"] = FastExt.Grid.isFilesColumn(item);
                        }
                    });

                    FastExt.Dialog.showWait("正在导出中……");
                    FastExt.Server.exportExcel(FastExt.Json.mergeJson(params, storeParams), function (success, data, message) {
                        FastExt.Dialog.hideWait();
                        if (success) {
                            FastExt.Dialog.toast(message);
                            location.href = "attach/" + data;
                        } else {
                            Ext.Msg.alert('系统提醒', "导出失败！" + message);
                        }
                    });
                }
            });
        }


        /**
         * 保存Grid的列表配置
         * @param grid
         * @return Ext.Promise
         */
        static saveGridColumn(grid) {
            if (Ext.isEmpty(grid.code)) {
                return;
            }
            return new Ext.Promise(function (resolve, reject) {
                try {
                    let columnInfos = {};
                    Ext.each(grid.getColumns(), function (item, index) {
                        if (!Ext.isEmpty(item.dataIndex)) {
                            if (!FastExt.System.isSuperRole()) {
                                if (!item.hideable && item.hidden) {
                                    //没有权限的列或者不需要显示的列
                                    return;
                                }
                            }
                            let columnInfo = {column: true};
                            columnInfo["width"] = item.width;
                            columnInfo["hidden"] = item.isHidden();
                            columnInfo["locked"] = item.isLocked();
                            columnInfo["text"] = item.configText;
                            columnInfo["dataIndex"] = item.dataIndex;
                            columnInfo["groupHeaderText"] = item.groupHeaderText;
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
                        if (FastExt.Base.toBool(grid.tabPanelList, false)) {//左侧主菜单
                            params["entityCode"] = grid.getStore().entity.entityCode;
                        }
                    }
                    FastExt.Server.saveExtConfig(grid.code, "GridColumn", Ext.encode(columnInfos), function (success, message) {
                        resolve(success);
                    }, params);
                } catch (e) {
                    reject(e);
                }
            });
        }

        /**
         * 还原Grid保存的列配置
         * @param grid
         */
        static restoreGridColumn(grid) {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    if (Ext.isEmpty(grid.code)) {
                        reject("Grid编号[code]不可为空！");
                        return;
                    }
                    FastExt.Server.showExtConfig(grid.code, "GridColumn", function (success, value) {
                        let columnInfos = {};
                        if (success) {
                            columnInfos = Ext.decode(value);
                        }
                        let newColumns = [];
                        let newGroupColumns = {};
                        let sorts = [];
                        let configColumns = grid.getColumns();
                        for (let i = 0; i < configColumns.length; i++) {
                            let column = configColumns[i];

                            if (!Ext.isEmpty(column.dataIndex)) {
                                if (FastExt.Base.toBool(grid.power, true)) {
                                    if (!column.hideable && column.hidden) {
                                        //没有权限的列或者不需要显示的列
                                        continue;
                                    }
                                }

                                let newColumn = column.cloneConfig();
                                newColumn["groupHeaderText"] = column.groupHeaderText;
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
                                if (!Ext.isEmpty(newColumn["groupHeaderText"])) {
                                    let groupHeaderText = newColumn["groupHeaderText"];
                                    if (!newGroupColumns.hasOwnProperty(groupHeaderText)) {
                                        newGroupColumns[groupHeaderText] = [];
                                    }
                                    newGroupColumns[groupHeaderText].push(newColumns.length)
                                }
                                newColumns.push(newColumn);
                            }
                        }
                        let waitRemove = [];
                        for (let key in newGroupColumns) {
                            let indexArray = newGroupColumns[key];
                            if (indexArray.length < 2) {
                                continue;
                            }
                            let minIndex = 999999;
                            let columns = [];
                            for (let i = 0; i < indexArray.length; i++) {
                                let indexValue = indexArray[i];
                                minIndex = Math.min(minIndex, indexValue);
                                let columnInfo = newColumns[indexValue];
                                columns.push(columnInfo);
                            }
                            columns.sort(function (a, b) {
                                return a.index - b.index;
                            });
                            newColumns[minIndex] = {
                                index: minIndex,
                                text: key,
                                menuDisabled: true,
                                columns: columns
                            };
                            waitRemove=waitRemove.concat(columns);
                        }
                        for (let i = 0; i < waitRemove.length; i++) {
                            newColumns=Ext.Array.remove(newColumns, waitRemove[i]);
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
         * 还原Grid保存的Operate配置
         * @param grid
         * @return new Ext.Promise
         * @see {@link FastExt.GridOperate}
         */
        static restoreGridOperate(grid) {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    if (Ext.isEmpty(grid.code)) {
                        reject("Grid编号[code]不可为空！");
                        return;
                    }
                    FastExt.Server.showExtConfig(grid.code, "GridOperate", function (success, value) {
                        if (success) {
                            grid.operate = Ext.decode(value);
                        } else if (Ext.isEmpty(grid.operate)) {
                            grid.operate = new GridOperate();
                        }
                        resolve();
                    });
                } catch (e) {
                    reject(e);
                }
            });
        }


        /**
         * 获取列所在的Grid对象
         * @param column
         */
        static getColumnGrid(column) {
            if (!column.grid) {
                column.grid = column.up("treepanel,grid");
            }
            if (column.grid.ownerGrid) {
                return column.grid.ownerGrid;
            }
            return null;
        }


        /**
         * 计算列并显示结果
         * @param grid gri的对象
         * @param column 列对象
         * @param type 计算方式
         * @see FastEnum.ComputeType
         */
        static showColumnCompute(grid, column, type?: FastEnum.ComputeType) {
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

                FastExt.Dialog.showWait("正在计算中……");
                $.post("entity/compute", FastExt.Json.mergeJson(params, storeParams), function (result) {
                    FastExt.Dialog.hideWait();
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
         * 获取列的编辑控件
         * @param column 列对象
         * @param search 列的搜索对象json
         */
        static getColumnSimpleEditor(column, search?): any {
            try {
                let editor: any = {};
                if (Ext.isObject(column.field)) {
                    editor.xtype = column.field.xtype;
                } else {
                    editor.xtype = column.field;
                }
                if (Ext.isObject(column.config.field)) {
                    if (search) {
                        editor = FastExt.Base.copy(column.config.field);
                    } else {
                        editor = column.config.field;
                    }
                }
                if (search) {
                    if (FastExt.Form.isContentField(column.field)
                        || FastExt.Form.isHtmlContentField(column.field)
                        || FastExt.Form.isTargetField(column.field)
                        || FastExt.Form.isPCAField(column.field)) {
                        editor.xtype = "textfield";
                    }
                }
                if (Ext.isEmpty(editor.xtype)) {
                    editor.xtype = "textfield";
                }
                editor.dataIndex = column.dataIndex;
                editor.columnSearchField = true;
                return editor;
            } catch (e) {
                console.error(e);
            }
            return null;

        }

        /**
         * 弹出批量编辑列数的菜单
         * @param column
         */
        static showBatchEditColumn(column) {
            let editorField = column.batchField;
            if (!editorField) {
                editorField = FastExt.Grid.getColumnSimpleEditor(column);
                if (!editorField) return;
                editorField.flex = 1;
                editorField.emptyText = "请输入";
                editorField = column.batchField = Ext.create(editorField);
            }
            let putRecord = function (fieldObj) {
                if (!Ext.isEmpty(fieldObj.getValue())) {
                    if (!FastExt.Grid.getColumnGrid(column).getStore()) {
                        return;
                    }
                    FastExt.Grid.getColumnGrid(column).getStore().holdUpdate = true;
                    let selectData = FastExt.Grid.getColumnGrid(column).getSelectionModel().getSelection();
                    if (selectData.length > 0) {
                        Ext.each(selectData, function (record, index) {
                            FastExt.Store.setRecordValue(record, column.dataIndex, fieldObj);
                        });
                    } else {
                        FastExt.Grid.getColumnGrid(column).getStore().each(function (record, index) {
                            FastExt.Store.setRecordValue(record, column.dataIndex, fieldObj);
                        });
                    }
                    FastExt.Grid.getColumnGrid(column).getStore().holdUpdate = false;
                    FastExt.Grid.getColumnGrid(column).getStore().fireEvent("endupdate");

                }
            };
            let placeholder = "批量修改当前页的【" + column.text + "】数据";
            if (FastExt.Grid.getColumnGrid(column).getSelection().length > 0) {
                placeholder = "批量修改选择的" + FastExt.Grid.getColumnGrid(column).getSelection().length + "条【" + column.text + "】数据";
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
                                }
                            ]
                        }],
                    listeners: {
                        show: function (obj, epts) {
                            let fieldObj = obj.items.get(0).items.get(0);
                            fieldObj.focus();
                        },
                        beforehide: function (obj, epts) {
                            let fieldObj = obj.items.get(0).items.get(0);
                            if (!fieldObj.isValid()) {
                                FastExt.Component.shakeComment(obj);
                                FastExt.Dialog.toast(fieldObj.getErrors()[0]);
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
         * 弹出批量随机列值窗体
         * @param column
         */
        static showBatchEditColumnRandom(column) {
            //检查是否有自定义随机生成数据的插件方法
            if (Ext.isFunction(window["showRandomData"])) {
                window["showRandomData"](column);
                return;
            }
            let idCode = "Random" + Ext.now();
            let autoType = 1;
            let selectReadOnly = false;
            let defaultValue;
            let dateFormat = 'Y-m-d H:i:s';
            let dataLength = FastExt.Grid.getColumnGrid(column).getStore().getTotalCount();
            let title = "批量随机生成当前页的【" + column.text + "】列数据";
            if (FastExt.Grid.getColumnGrid(column).getSelection().length > 0) {
                title = "批量随机生成选择的" + FastExt.Grid.getColumnGrid(column).getSelection().length + "条【" + column.text + "】列数据";
                dataLength = FastExt.Grid.getColumnGrid(column).getSelection().length;
            }
            if (FastExt.Grid.isNumberColumn(column)) {
                autoType = 2;
                selectReadOnly = true;
            } else if (FastExt.Grid.isDateColumn(column)) {
                autoType = 3;
                if (Ext.isObject(column.field)) {
                    dateFormat = column.field.format;
                }
                selectReadOnly = true;
            } else if (FastExt.Grid.isEnumColumn(column) || FastExt.Grid.isComboColumn(column)) {
                autoType = 5;
                selectReadOnly = true;
                let intArray = [];
                let fieldObj = Ext.create(column.field);
                fieldObj.getStore().each(function (record, index) {
                    intArray.push(record.get(fieldObj.valueField));
                });
                defaultValue = intArray.join(",");
            } else if (FastExt.Grid.isContentColumn(column)) {
                autoType = 4;
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
                random: function () {
                    let valueArray = [];
                    let textPrefix = Ext.getCmp(idCode + "_textPrefix").getValue();
                    let textStartNumber = Ext.getCmp(idCode + "_textStartNumber").getValue();
                    for (let i = parseInt(textStartNumber); i < Number.MAX_VALUE; i++) {
                        valueArray.push(textPrefix + i);
                        if (valueArray.length === dataLength) {
                            break;
                        }
                    }
                    return valueArray;
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
                                id: idCode + '_textPrefix',
                                allowBlank: false,
                                xtype: 'textfield',
                            },
                            {
                                fieldLabel: '开始序数',
                                id: idCode + '_textStartNumber',
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
                random: function () {
                    let valueArray = [];
                    let dotNumber = Ext.getCmp(idCode + "_dotNumber").getValue();
                    let minNumber = Ext.getCmp(idCode + "_minNumber").getValue();
                    let maxNumber = Ext.getCmp(idCode + "_maxNumber").getValue();
                    if (minNumber > maxNumber) {
                        FastExt.Dialog.showAlert("系统提醒", "最大数字必须大于最小数字！");
                        return;
                    }
                    for (let i = 0; i < Number.MAX_VALUE; i++) {
                        let numberValue = Math.random() * (maxNumber - minNumber) + minNumber;
                        valueArray.push(numberValue.toFixed(dotNumber));
                        if (valueArray.length === dataLength) {
                            break;
                        }
                    }
                    return valueArray;
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
                                id: idCode + '_dotNumber',
                                value: 0,
                                allowBlank: false,
                                xtype: 'numberfield',
                            },
                            {
                                fieldLabel: '最小数字',
                                id: idCode + '_minNumber',
                                value: 0,
                                allowBlank: false,
                                xtype: 'numberfield',
                            },
                            {
                                fieldLabel: '最大数字',
                                id: idCode + '_maxNumber',
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
                random: function () {
                    let valueArray = [];
                    let minDate = Ext.getCmp(idCode + "_minDate").getValue();
                    let maxDate = Ext.getCmp(idCode + "_maxDate").getValue();
                    if (minDate.getTime() > maxDate.getTime()) {
                        FastExt.Dialog.showAlert("系统提醒", "最大日期必须大于最小日期！");
                        return;
                    }
                    for (let i = 0; i < Number.MAX_VALUE; i++) {
                        let sub = maxDate.getTime() - minDate.getTime();
                        let numberValue = Math.random() * sub + minDate.getTime();
                        let randDate = new Date(numberValue);
                        valueArray.push(Ext.Date.format(randDate, Ext.getCmp(idCode + "_minDate").format));
                        if (valueArray.length === dataLength) {
                            break;
                        }
                    }
                    return valueArray;
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
                                id: idCode + '_minDate',
                                allowBlank: false,
                                format: dateFormat
                            },
                            {
                                fieldLabel: '最大日期',
                                xtype: 'datefield',
                                id: idCode + '_maxDate',
                                allowBlank: false,
                                format: dateFormat
                            }
                        ]
                    }
                ]
            };
            let longTextField = {
                xtype: 'fieldcontainer',
                layout: 'column',
                columnWidth: 1,
                id: idCode + "_4",
                hidden: true,
                disabled: true,
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                random: function () {
                    let valueArray = [];
                    let minNumber = Ext.getCmp(idCode + "_minLength").getValue();
                    let maxNumber = Ext.getCmp(idCode + "_maxLength").getValue();
                    let longTextList = Ext.getCmp(idCode + "_longTextList").getValue();
                    if (minNumber > maxNumber) {
                        FastExt.Dialog.showAlert("系统提醒", "最大长度必须大于最小长度！");
                        return;
                    }
                    let charArray = longTextList.toString().trimAllSymbol().split("");
                    for (let i = 0; i < Number.MAX_VALUE; i++) {
                        let numberValue = FastExt.Base.randomInt(minNumber, maxNumber);
                        let stringArray = [];
                        for (let j = 0; j < Number.MAX_VALUE; j++) {
                            let indexValue = FastExt.Base.randomInt(0, charArray.length - 1);
                            let charStr = charArray[indexValue];
                            stringArray.push(charStr);
                            if (stringArray.length === numberValue) {
                                break;
                            }
                        }
                        valueArray.push(stringArray.join(""));
                        if (valueArray.length === dataLength) {
                            break;
                        }
                    }
                    return valueArray;
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
                                fieldLabel: '文字库',
                                id: idCode + '_longTextList',
                                allowBlank: false,
                                xtype: 'textfield',
                                listeners: {
                                    change: function (obj, newValue, oldValue, eOpts) {
                                        Ext.getCmp(idCode + "_maxLength").setValue(newValue.truthLength());
                                    }
                                }
                            },
                            {
                                fieldLabel: '最小长度',
                                id: idCode + '_minLength',
                                value: 1,
                                minValue: 1,
                                allowBlank: false,
                                xtype: 'numberfield',
                            },
                            {
                                fieldLabel: '最大长度',
                                id: idCode + '_maxLength',
                                allowBlank: false,
                                minValue: 1,
                                xtype: 'numberfield',
                            }
                        ]
                    }
                ]
            };
            let numberArrayField = {
                xtype: 'fieldcontainer',
                layout: 'column',
                columnWidth: 1,
                id: idCode + "_5",
                hidden: true,
                disabled: true,
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                random: function () {
                    let valueArray = [];
                    let numberList = Ext.getCmp(idCode + "_numberList").getValue();
                    let charArray = numberList.toString().split(",");
                    for (let i = 0; i < Number.MAX_VALUE; i++) {
                        let value = charArray[FastExt.Base.randomInt(0, charArray.length - 1)];
                        if (Ext.isEmpty(value)) {
                            continue;
                        }
                        valueArray.push(value);
                        if (valueArray.length === dataLength) {
                            break;
                        }
                    }
                    return valueArray;
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
                        title: '数字集合设置',
                        items: [
                            {
                                fieldLabel: '数字集合',
                                id: idCode + '_numberList',
                                allowBlank: false,
                                value: defaultValue,
                                xtype: 'textfield'
                            },
                            {
                                xtype: 'displayfield',
                                value: '以英文逗号（,）为分隔符！'
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
                                    'text': '长文本',
                                    "id": 4
                                },
                                {
                                    'text': '数字',
                                    "id": 2
                                },
                                {
                                    'text': '数字集合',
                                    "id": 5
                                },
                                {
                                    'text': '日期',
                                    "id": 3
                                }]
                        })
                    }, textField, numberField, dateField, longTextField, numberArrayField
                ]
            });


            let setColumnValue = function (valueArray) {
                if (valueArray.length === 0 || !(FastExt.Grid.getColumnGrid(column).getStore())) return;
                FastExt.Grid.getColumnGrid(column).getStore().holdUpdate = true;
                let selectData = FastExt.Grid.getColumnGrid(column).getSelectionModel().getSelection();
                if (selectData.length > 0) {
                    Ext.each(selectData, function (record, index) {
                        if (Ext.isObject(valueArray[index])) {
                            FastExt.Store.setRecordValue(record, column.dataIndex, valueArray[index]);
                        } else {
                            record.set(column.dataIndex, valueArray[index]);
                        }
                    });
                } else {
                    FastExt.Grid.getColumnGrid(column).getStore().each(function (record, index) {
                        if (Ext.isObject(valueArray[index])) {
                            FastExt.Store.setRecordValue(record, column.dataIndex, valueArray[index]);
                        } else {
                            record.set(column.dataIndex, valueArray[index]);
                        }
                    });
                }
                FastExt.Grid.getColumnGrid(column).getStore().holdUpdate = false;
                FastExt.Grid.getColumnGrid(column).getStore().fireEvent("endupdate");
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
                        autoTypeField.setReadOnly(selectReadOnly);
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
                                let buildType = setPanel.getFieldValue("autoType");
                                let valueArray = Ext.getCmp(idCode + "_" + buildType).random();
                                if (!valueArray || valueArray.length === 0) {
                                    return;
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
         * 配置指定列的搜索链
         * @param column
         */
        static configColumnSearchLink(column) {
            let checked = "";
            if (column.searchLink) {
                checked = column.searchLink.checked;
            }
            FastExt.System.showMenuColumns(column, checked).then(function (data) {
                if (data.columns.length > 0) {
                    column.searchLink = data;
                    FastExt.Dialog.toast("配置成功！");
                } else {
                    column.searchLink = null;
                    FastExt.Dialog.toast("已清空搜索链！");
                }
            });
        }


        /**
         * 刷新列的状态样式，例如：正序、倒序、搜索等
         * @param column
         */
        static refreshColumnStyle(column) {
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
                        column.setText(FastExt.Base.getSVGIcon("extSearch") + "&nbsp;" + column.configText + column.sumText + sortDirection + "&nbsp;");
                        column.setStyle('color', 'red');
                    } else {
                        column.setText("&nbsp;" + column.configText + column.sumText + sortDirection + "&nbsp;");
                        column.setStyle('color', '#444444');
                    }
                    FastExt.Grid.checkColumnSort(FastExt.Grid.getColumnGrid(column));
                }
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 检查列的排序，将刷新Grid底部搜索按钮的样式
         * @param grid
         */
        static checkColumnSort(grid) {
            try {
                let hasSort = grid.getStore().getSorters().length > 0;
                let pagingToolBar = grid.child('#pagingToolBar');
                if (pagingToolBar) {
                    let sortBtn = pagingToolBar.down("button[toolType=sortBtn]");
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
         * 配置列的扩展属性或方法
         * @param column
         */
        static configColumnProperty(column) {
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
                    let storeParams = FastExt.Grid.getColumnGrid(me).getStore().proxy.extraParams;
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
                    FastExt.Grid.refreshColumnStyle(me);
                };
                column.doSearch = function (requestServer?) {
                    let me = this;
                    let storeParams = FastExt.Grid.getColumnGrid(me).getStore().proxy.extraParams;
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
                        if (FastExt.Base.toBool(requestServer, true)) {
                            FastExt.Grid.getColumnGrid(me).getStore().loadPage(1);
                        }
                        me.searching = me.where.length !== 0;
                        FastExt.Grid.refreshColumnStyle(me);
                    }
                };

                if (column.where && column.where.length > 0) {
                    column.doSearch(false);
                }
                if (column.isSubHeader) {
                    column.groupHeaderText = column.ownerCt.text;
                } else {
                    column.groupHeaderText = null;
                }
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 获取搜索列的输入组件
         * @param column
         * @param where
         */
        static buildSearchItem(column, where?): any {
            try {
                let editorField = FastExt.Grid.getColumnSimpleEditor(column, true);
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
                if (FastExt.Form.isEnumField(editorField)) {
                    editorField.editable = false;
                } else {
                    editorField.editable = true;
                }
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
                    if (FastExt.Form.isTextField(editorField)) {
                        where.compare = '?';
                    } else if (FastExt.Form.isDateField(editorField)) {
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
                                    FastExt.Component.shakeComment(item);
                                    FastExt.Dialog.toast(item.getErrors()[0]);
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
                            store: FastExt.Store.getCompareDataStore()
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
         * 弹出列的搜索菜单
         * @param column
         */
        static showColumnSearchMenu(column) {
            try {
                if (!FastExt.Base.toBool(FastExt.Grid.getColumnGrid(column).columnSearch, true)) {
                    return false;
                }
                if (FastExt.Grid.isFilesColumn(column)
                    || FastExt.Grid.isFileColumn(column)) {
                    return false;
                }
                if (!FastExt.Base.toBool(column.search, true)) {
                    return false;
                }
                if (FastExt.Base.toBool(column["encrypt"], false)) {
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
                            this.insert(index, FastExt.Grid.buildSearchItem(column, where));
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

        /**
         * 弹出列的搜索窗体
         * @param obj
         * @param grid
         */
        static showColumnSearchWin(obj, grid) {
            if (!obj.searchWin) {
                let store = FastExt.Store.getGridColumnStore(grid, true);
                let buildItem = function (data, where?) {
                    let inputItem: any = FastExt.Grid.buildSearchItem(FastExt.Grid.getColumn(grid, data.get("id"), data.get("text")), where);
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
                            param = FastExt.Json.mergeJson(param, inputItem.toParam());
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

                                        let inputItem: any = FastExt.Grid.buildSearchItem(FastExt.Grid.getColumn(grid, data.get("id"), data.get("text")));
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
                            text: '清空条件',
                            iconCls: 'extIcon extClear whiteColor',
                            handler: function () {
                                formPanel.removeAll();
                                Ext.each(grid.getColumns(), function (item) {
                                    item.clearSearch();
                                });
                                grid.getStore().loadPage(1);
                            }
                        },
                        '->',
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
                                    let column = FastExt.Grid.getColumn(grid, toParam.dataIndex, toParam.text);
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
         * 获取Grid的分页控件
         * @param dataStore
         */
        static getPageToolBar(dataStore): any {
            let entityRecycle = false;
            if (dataStore.entity && FastExt.Base.toBool(dataStore.entity.recycle, false)) {
                entityRecycle = true;
            }
            let fromRecycle = false;
            if (dataStore.where && FastExt.Base.toBool(dataStore.where['^fromRecycle'], false)) {
                fromRecycle = true;
            }
            let menuText = FastExt.Store.getStoreMenuText(dataStore);

            let pagingtoolbar = Ext.create('Ext.toolbar.Paging', {
                store: dataStore,
                dock: 'bottom',
                itemId: 'pagingToolBar',
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
                editable: false,
                width: 100,
                value: dataStore.pageSize,
                store: FastExt.Store.getPageDataStore(),
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
                subtext: '拷贝数据@' + menuText,
                checkSelect: 2,
                iconCls: 'extIcon extCopy2 grayColor',
                handler: function () {
                    let selection = dataStore.grid.getSelection();
                    if (selection.length === 0) {
                        FastExt.Dialog.showAlert("系统提醒", "请选择需要复制的数据！");
                        return;
                    }
                    Ext.Msg.confirm("系统提醒", "您确定复制选中的" + selection.length + "条数据吗？", function (button, text) {
                        if (button === "yes") {
                            FastExt.Dialog.showWait("正在复制数据中……");
                            FastExt.Store.commitStoreCopy(dataStore.grid.getStore(), dataStore.grid.getSelection()).then(function (success) {
                                if (success) {
                                    dataStore.grid.getSelectionModel().deselectAll();
                                    let grouped = dataStore.grid.getStore().isGrouped();
                                    if (grouped) {
                                        dataStore.grid.getView().getFeature('group').collapseAll();
                                    }
                                    FastExt.Dialog.hideWait();
                                }
                            });
                        }
                    });
                }
            };

            let deleteAllBtn = {
                xtype: 'button',
                tooltip: '清空数据',
                subtext: '清空数据@' + menuText,
                iconCls: 'extIcon extClear grayColor',
                handler: function () {
                    let menuText =  FastExt.Store.getStoreMenuText(dataStore.grid.getStore());
                    let confirmFunction = function (button, text) {
                        if (button === "yes") {
                            FastExt.System.validOperate("清空【" + menuText + "】数据", function () {
                                FastExt.Dialog.showWait("正在清空数据中……");
                                let storeParams = dataStore.grid.getStore().proxy.extraParams;
                                let params = {"entityCode": dataStore.entity.entityCode, "all": true};
                                if (dataStore.grid.getStore().entity.menu) {
                                    params["menu"] =  FastExt.Store.getStoreMenuText(dataStore.grid.getStore());
                                }
                                FastExt.Server.deleteEntity( FastExt.Json.mergeJson(params, storeParams), function (success, message) {
                                    FastExt.Dialog.hideWait();
                                    if (success) {
                                        dataStore.loadPage(1);
                                    }
                                    FastExt.Dialog.showAlert("系统提醒", message);
                                });
                            });
                        }
                    };

                    let message = "<div style='line-height: 170%;'>";
                    message += "<b style='color: red;font-size: 18px;'>请您谨慎操作！</b><br/>";
                    if (menuText) {
                        message += "<b style='color: red;font-size: 16px;'>当前页面【" + menuText + "】</b><br/>";
                    }
                    message += "<b style='font-size: 16px;'>您确定清空当前条件下的所有数据吗？！<br/>当前共" + dataStore.getTotalCount() + "条数据！</b>";
                    if (entityRecycle) {
                        message += "<br/><b style='color: red;font-size: 14px;line-height: 18px;'>此操作将跳过回收站！</b>";
                    }
                    message += "</div>"
                    let confirmConfig = {
                        title: "系统提醒",
                        icon: Ext.Msg.WARNING,
                        message: message,
                        buttons: Ext.Msg.YESNO,
                        defaultFocus: "no",
                        cls: 'redAlert',
                        callback: confirmFunction
                    };


                    let hideFunction = function () {
                        clearTimeout(Ext.Msg.timeout);
                        let msgButton = Ext.Msg.msgButtons["yes"];
                        msgButton.setText("是");
                        msgButton.enable();
                    };

                    Ext.Msg.on("hide", hideFunction, this, {single: true});
                    let msgBox = Ext.Msg.show(confirmConfig);
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
                    let msgButton = Ext.Msg.msgButtons["yes"];
                    msgButton.disable();
                    FastExt.Component.shakeComment(msgBox, function () {
                        let time = 5;
                        if (dataStore.getTotalCount() > 50) {
                            time = 15;
                        }
                        if (dataStore.getTotalCount() > 5000) {
                            time = 20;
                        }
                        if (dataStore.getTotalCount() > 10000) {
                            time = 30;
                        }
                        timeFunction(time);
                    }, 3000);
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
                    FastExt.Grid.showRecycleGrid(this, dataStore);
                }
            };


            let searchBtn = {
                xtype: 'button',
                toolType: 'searchBtn',
                tooltip: '搜索数据',
                iconCls: 'extIcon extSearch grayColor',
                handler: function () {
                    FastExt.Grid.showColumnSearchWin(this, dataStore.grid);
                }
            };

            let sortBtn = {
                xtype: 'button',
                toolType: 'sortBtn',
                tooltip: '排序数据',
                iconCls: 'extIcon extSort grayColor',
                handler: function () {
                    FastExt.Grid.showColumnSortWin(this, dataStore.grid);
                }
            };

            let timerBtn = {
                xtype: 'button',
                toolType: 'timerBtn',
                tooltip: '定时刷新',
                iconCls: 'extIcon extAlarm grayColor',
                handler: function () {
                    FastExt.Grid.showTimerRefreshGrid(this, dataStore.grid);
                }
            };

            pagingtoolbar.insert(0, control);
            pagingtoolbar.insert(0, {
                xtype: 'label',
                text: '每页',
                margin: '0 10 0 10'
            });

            let refreshBtn = pagingtoolbar.child("#refresh");
            let beginIndex = pagingtoolbar.items.indexOf(refreshBtn);

            pagingtoolbar.insert(++beginIndex, timerBtn);
            pagingtoolbar.insert(++beginIndex, "-");
            pagingtoolbar.insert(++beginIndex, searchBtn);
            pagingtoolbar.insert(++beginIndex, sortBtn);


            if (fromRecycle) {
                let rebackBtn = {
                    xtype: 'button',
                    tooltip: '还原数据',
                    checkSelect: 2,
                    iconCls: 'extIcon extReback grayColor',
                    handler: function () {
                        FastExt.Grid.rebackGridData(dataStore.grid);
                    }
                };
                pagingtoolbar.insert(++beginIndex, "-");
                pagingtoolbar.insert(++beginIndex, rebackBtn);
            }

            // if (system.isSuperRole()) {
            // }

            pagingtoolbar.insert(++beginIndex, "-");
            if (!fromRecycle) {
                pagingtoolbar.insert(++beginIndex, copyBtn);
            }
            pagingtoolbar.insert(++beginIndex, deleteAllBtn);

            if (!fromRecycle && entityRecycle) {
                pagingtoolbar.insert(++beginIndex, "-");
                pagingtoolbar.insert(++beginIndex, recycleBtn);
            }

            return pagingtoolbar;
        }

        /**
         * 弹出Grid绑定的实体列表回收站数据
         * @param obj 动画对象
         * @param dataStore 数据源
         */
        static showRecycleGrid(obj, dataStore) {
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
            let gridPanel = entityObj.getList(FastExt.Json.mergeJson(where, dataStore.where));

            let entityOwner = gridPanel.down("[entityList=true]");
            entityOwner.code = $.md5(dataStore.entity.entityCode + "回收站");

            let winWidth = parseInt((document.body.clientWidth * 0.7).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.8).toFixed(0));
            let win = Ext.create('Ext.window.Window', {
                title: title,
                iconCls: 'extIcon extRecycle',
                layout: 'fit',
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 600,
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


        /**
         * 操作还原Grid回收站里的数据
         * @param grid
         */
        static rebackGridData(grid) {
            return new Ext.Promise(function (resolve, reject) {
                if (!grid.getStore().entity) {
                    Ext.Msg.alert('系统提醒', '还原失败！Grid的DataStore未绑定Entity!');
                    return;
                }
                if (grid.getSelection().length === 0) {
                    FastExt.Dialog.toast('请您先选择需要还原的数据！');
                    return;
                }
                let selectLength = grid.getSelection().length;
                let doDelete = function () {
                    FastExt.Dialog.showWait("正在还原数据中……");
                    FastExt.Store.commitStoreReback(grid.getStore(), grid.getSelection()).then(function (success, message) {
                        if (success) {
                            grid.getSelectionModel().deselectAll();
                            let grouped = grid.getStore().isGrouped();
                            if (grouped) {
                                grid.getView().getFeature('group').collapseAll();
                            }
                            FastExt.Dialog.hideWait();
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
         * 弹出配置列排序的窗体
         * @param obj 动画对象
         * @param grid grid对象
         */
        static showColumnSortWin(obj, grid) {
            if (!obj.sortWin) {
                let store = FastExt.Store.getGridColumnStore(grid);
                let buildItem = function (data, defaultValue?) {
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
                                    FastExt.Grid.refreshColumnStyle(item);
                                });

                                let sorts = [];
                                formPanel.items.each(function (item) {
                                    let toParam = item.toParam();
                                    sorts.push(toParam);
                                    let column = FastExt.Grid.getColumn(grid, toParam.property);
                                    column.sortDirection = toParam.direction;
                                    FastExt.Grid.refreshColumnStyle(column);
                                });
                                if (sorts.length > 0) {
                                    grid.getStore().sort(sorts);
                                } else {
                                    grid.getStore().loadPage(1);
                                }
                                FastExt.Grid.checkColumnSort(grid);
                            }
                        }]
                });
                grid.ownerCt.add(obj.sortWin);
            }
            obj.sortWin.show();
        }


        /**
         * 弹出定时刷新Grid数据的窗体
         * @param obj 动画对象
         * @param grid grid对象
         */
        static showTimerRefreshGrid(obj, grid) {
            if (!obj.timerWin) {
                if (!grid.timerConfig) {
                    grid.timerConfig = {
                        "state": 0,
                        "value": 30
                    };
                }
                let formPanel = Ext.create('Ext.form.FormPanel', {
                    margin: '5',
                    border: 0,
                    layout: 'column',
                    width: 400,
                    scrollable: true,
                    defaults: {
                        labelWidth: 120,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        emptyText: '请填写'
                    },
                    viewModel: {
                        data: grid.timerConfig
                    },
                    items: [
                        {
                            xtype: 'combo',
                            name: 'state',
                            displayField: 'text',
                            valueField: 'id',
                            fieldLabel: '是否启动',
                            editable: false,
                            flex: 1,
                            columnWidth: 1,
                            value: 0,
                            allowBlank: false,
                            bind: '{state}',
                            store: FastExt.Store.getYesOrNoDataStore()
                        },
                        {
                            xtype: "numberfield",
                            name: 'value',
                            bind: '{value}',
                            fieldLabel: "时间间隔（秒）",
                            columnWidth: 1,
                            minValue: 1,
                            value: 30,
                            decimalPrecision: 0,
                            allowBlank: false
                        }
                    ],
                });

                obj.timerWin = Ext.create('Ext.window.Window', {
                    title: '定时刷新数据',
                    layout: 'fit',
                    constrain: true,
                    iconCls: 'extIcon extAlarm',
                    resizable: true,
                    minHeight: 200,
                    minWidth: 400,
                    height: 200,
                    animateTarget: obj,
                    items: [formPanel],
                    listeners: {
                        close: function (panel, eOpts) {
                            obj.timerWin = null;
                        }
                    },
                    buttons: [
                        {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                let form = formPanel.getForm();
                                if (form.isValid()) {
                                    grid.timerConfig = formPanel.getValues();
                                    grid.timerRefresh = function () {
                                        if (grid.timerTimeout) {
                                            clearTimeout(grid.timerTimeout);
                                        }
                                        let pagingToolBar = grid.child('#pagingToolBar');
                                        if (pagingToolBar) {
                                            let timerBtn = pagingToolBar.down("button[toolType=timerBtn]");
                                            if (timerBtn) {
                                                if (parseInt(grid.timerConfig["state"]) === 1) {
                                                    timerBtn.setIconCls("extIcon extTimer redColor");
                                                } else {
                                                    timerBtn.setIconCls("extIcon extTimer grayColor");
                                                }
                                            }
                                        }
                                        if (parseInt(grid.timerConfig["state"]) === 0) {
                                            return;
                                        }
                                        grid.timerTimeout = setTimeout(function () {
                                            grid.getStore().reload();
                                            grid.timerRefresh();
                                        }, parseInt(grid.timerConfig["value"]) * 1000);
                                    };
                                    grid.timerRefresh();
                                    if (parseInt(grid.timerConfig["state"]) === 0) {
                                        FastExt.Dialog.toast("已关闭定时器！");
                                    } else {
                                        FastExt.Dialog.toast("已启动定时器！");
                                    }
                                    obj.timerWin.close();
                                }
                            }
                        }]
                });
                grid.ownerCt.add(obj.timerWin);
            }
            obj.timerWin.show();
        }


        /**
         * 操作删除Grid里选中的数据
         * @param grid
         */
        static deleteGridData(grid) {
            return new Ext.Promise(function (resolve, reject) {
                if (!grid.getStore().entity) {
                    Ext.Msg.alert('系统提醒', '删除失败！Grid的DataStore未绑定Entity!');
                    return;
                }
                if (grid.getSelection().length === 0) {
                    FastExt.Dialog.toast('请您先选择需要删除的数据！');
                    return;
                }
                let selectLength = grid.getSelection().length;
                let doDelete = function () {
                    FastExt.Dialog.showWait("正在删除数据中……");
                    FastExt.Store.commitStoreDelete(grid.getStore(), grid.getSelection()).then(function (success) {
                        if (success) {
                            grid.getSelectionModel().deselectAll();
                            let grouped = grid.getStore().isGrouped();
                            if (grouped) {
                                grid.getView().getFeature('group').collapseAll();
                            }
                            FastExt.Dialog.hideWait();
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
         * 操作提交Grid被修改过的数据
         * @param grid
         */
        static updateGridData(grid) {
            return new Ext.Promise(function (resolve, reject) {
                if (!grid.getStore().entity) {
                    Ext.Msg.alert('系统提醒', '修改失败！Grid的DataStore未绑定Entity!');
                    return;
                }
                let records = grid.getStore().getUpdatedRecords();
                if (records.length === 0) {
                    FastExt.Dialog.toast('当前暂无数据被修改！');
                    return;
                }
                if (grid.operate && grid.operate.alertUpdate) {
                    Ext.Msg.confirm("系统提醒", "您确定提交被修改的数据吗？", function (button, text) {
                        if (button === "yes") {
                            FastExt.Dialog.showWait("正在修改数据中……");
                            FastExt.Store.commitStoreUpdate(grid.getStore()).then(function (result) {
                                resolve(result);
                                if (result) {
                                    FastExt.Dialog.hideWait();
                                }
                            });
                        }
                    });
                } else {
                    FastExt.Dialog.showWait("正在修改数据中……");
                    FastExt.Store.commitStoreUpdate(grid.getStore()).then(function (result) {
                        resolve(result);
                        if (result) {
                            FastExt.Dialog.hideWait();
                        }
                    });
                }
            });
        }


        /**
         * 弹出数据的详情窗体，与Grid列表的列属性一致
         * @param obj 动画对象
         * @param title 详情窗体标题
         * @param entity 实体类对象
         * @param record 单个数据record
         */
        static showDetailsWindow(obj, title, entity, record) {
            FastExt.Server.showColumns(entity.entityCode, function (success, value, message) {
                if (success) {
                    let columnInfos = Ext.decode(value);
                    let data = [];
                    let lastGroupNon = 1;
                    for (let key in columnInfos) {
                        if (columnInfos.hasOwnProperty(key)) {
                            let column = columnInfos[key];
                            if (Ext.isEmpty(column.dataIndex)) {
                                continue;
                            }
                            let d = {
                                value: record.get(column.dataIndex),
                                groupHeaderText: column.groupHeaderText,
                                record: record
                            };
                            for (let c in column) {
                                if (column.hasOwnProperty(c)) {
                                    d[c] = column[c];
                                }
                            }
                            if (!d.groupHeaderText) {
                                d.groupHeaderText = lastGroupNon;
                            }else{
                                lastGroupNon++;
                            }
                            data.push(d);
                        }
                    }
                    data.sort(function (a, b) {
                        return a.index - b.index;
                    });
                    let detailsStore = Ext.create('Ext.data.Store', {
                        autoLoad: false,
                        groupField: 'groupHeaderText',
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
                        features: [{
                            ftype: 'grouping',
                            collapsible: false,
                            hideGroupedHeader: true,
                            expandTip: null,
                            collapseTip: null,
                            groupHeaderTpl: [
                                '<b>{name:this.formatName}</b>',{
                                    formatName: function(name) {
                                        if (Ext.isNumeric(name)) {
                                            return "基本属性";
                                        }
                                        return name;
                                    }
                                }
                            ]
                        }],
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
                                            fun = FastExt.Base.loadFunction(renderer);
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

                    let winWidth = parseInt((document.body.clientWidth * 0.3).toFixed(0));
                    let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                    let win = Ext.create('Ext.window.Window', {
                        title: title,
                        height: winHeight,
                        width: winWidth,
                        minHeight: 450,
                        iconCls: 'extIcon extDetails',
                        minWidth: 400,
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
                    FastExt.Dialog.showAlert("系统提醒", message);
                }
            });
        }


        /**
         * 创建详情数据的Grid
         * @param data 数据实体
         * @param configGrid 扩展配置Grid
         * @param configName 扩展配置Grid属性名
         * @param configValue 扩展配置Grid属性值
         * @return Ext.grid.Panel
         */
        static createDetailsGrid(data, configGrid, configName, configValue): any {
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
                columns: [FastExt.Json.mergeJson(nameConfig, configName),
                    FastExt.Json.mergeJson(valueConfig, configValue)]
            };
            return Ext.create('Ext.grid.Panel', FastExt.Json.mergeJson(gridConfig, configGrid));
        }

    }

    /**
     * Grid操作配置对象
     */
    export class GridOperate {


        private _alertDelete: boolean = true;


        private _alertUpdate: boolean = true;


        private _autoUpdate: boolean = false;


        private _autoDetails: boolean = true;


        private _hoverTip: boolean = false;

        private _refreshData: boolean = false;


        /**
         * 删除数据时弹框提醒
         */
        get alertDelete(): boolean {
            return this._alertDelete;
        }

        set alertDelete(value: boolean) {
            this._alertDelete = value;
        }

        /**
         * 提交数据修改时弹框提醒
         */
        get alertUpdate(): boolean {
            return this._alertUpdate;
        }

        set alertUpdate(value: boolean) {
            this._alertUpdate = value;
        }

        /**
         * 自动提交被修改的数据
         */
        get autoUpdate(): boolean {
            return this._autoUpdate;
        }

        set autoUpdate(value: boolean) {
            this._autoUpdate = value;
        }

        /**
         * 选中grid数据中自动弹出右侧详细面板
         */
        get autoDetails(): boolean {
            return this._autoDetails;
        }

        set autoDetails(value: boolean) {
            this._autoDetails = value;
        }

        /**
         * 鼠标悬浮在数据操作3秒时，弹出预览数据提示
         */
        get hoverTip(): boolean {
            return this._hoverTip;
        }

        set hoverTip(value: boolean) {
            this._hoverTip = value;
        }

        /**
         * 当离开Grid所在的标签页后，再次返回此标签页时将刷新当前标签页的列表数据
         */
        get refreshData(): boolean {
            return this._refreshData;
        }

        set refreshData(value: boolean) {
            this._refreshData = value;
        }
    }
}