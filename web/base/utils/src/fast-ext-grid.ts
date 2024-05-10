namespace FastExt {

    /**
     * Ext.grid.Panel或Ext.tree.Panel相关操作
     */
    export class Grid {

        /**
         * 搜索、排序醒目提醒的颜色
         */
        public static operateWarnColor = 'red';

        /**
         * 弹出列搜索菜单的内边距
         */
        public static columnSearchMenuPadding = 8;

        /**
         * grid格式的详情布局，属性名的样式
         */
        public static detailsGridKeyStyle = 'color:#000000;overflow:auto;text-overflow: ellipsis;white-space:normal !important;word-break:break-word;';

        /**
         * grid格式的详情布局，属性值的样式
         */
        public static detailsGridValueStyle = 'overflow:auto;text-overflow: ellipsis;white-space:normal !important;word-break:break-word;display:flex;align-items:center;line-height:24px;';

        /**
         * grid格式的详情布局，动作按钮的样式
         */
        public static detailsGridActionStyle = "display: flex; align-items: center;justify-content: center;";


        /**
         * 初始化grid组件的自定义功能属性等
         */
        public static onGridInitComponent(grid: any) {
            if (FastExt.Base.toBool(grid.fastGridInited, false)) {
                return;
            }
            grid.fastGridInited = true;
            let gridView = FastExt.Grid.getGridView(grid);
            if (gridView) {
                //必须设置，避免bufferedRenderer失效
                gridView.rowHeight = FastExt.Grid.getRowMinHeight();
            }

            //开启行缓存渲染
            grid.bufferedRenderer = true;
            grid.firstLoadedData = false;
            if (grid.entityList) {
                // grid.trailingBufferZone = 100;
                // grid.leadingBufferZone = 100;

                if (grid.getStore()) {
                    grid.getStore().grid = grid;
                    if (grid.getStore().where) {
                        grid.fromRecycle = grid.getStore().where['^fromRecycle'];
                    }
                }
                FastExt.Grid.configGridDefault(grid);
                FastExt.Grid.configGridMethod(grid);
                FastExt.Grid.configGridContextMenu(grid);
                FastExt.Grid.configGridListeners(grid);
                FastExt.Grid.configNormalGridListeners(grid);
            }

            if (grid.dataList) {
                FastExt.Grid.configGridMethod(grid);
                FastExt.Grid.configNormalGridListeners(grid);
            }
        }

        /**
         * 初始化Grid布局相关功能
         */
        public static onGridAfterRender(grid: any) {
            if (FastExt.Base.toBool(grid.fastGridAfterRendered, false)) {
                return;
            }
            grid.fastGridAfterRendered = true;

            if (grid.entityList) {
                FastExt.Grid.configGridHistory(grid);

                let menuContainer = grid.up("[menuContainer=true]");
                if (menuContainer) {
                    grid.menuPanelList = true;
                }

                let windowContainer = grid.up("window");
                if (windowContainer && !FastExt.Base.toBool(windowContainer.shown, false)) {
                    //此处避免动画卡顿感
                    windowContainer.on("show", FastExt.Grid.startLoadData, grid, {single: true});
                } else {
                    FastExt.Grid.startLoadData.apply(grid);
                }
            }
        }

        /**
         * 开始加载grid数据
         */
        private static startLoadData() {
            let grid = <any>this;

            FastExt.Grid.configGridLayout(grid).then(function () {
                if (!FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                    if (Ext.isFunction(grid.refreshPowerEnable)) {
                        grid.refreshPowerEnable();
                    }

                    FastExt.Grid.configGridTip(grid);
                    FastExt.Grid.configDefaultToolBar(grid);
                    FastExt.Grid.refreshGridNumberColumn(grid);
                }

                grid.setLoading(false);
                grid.getStore().grid = grid;
                if (FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                    grid.firstLoadedData = true;
                    grid.getStore().loadData([FastExt.Grid.buildNullData(grid)]);
                    let menuContainer = grid.up("[menuContainer=true]");
                    if (menuContainer) {
                        menuContainer.close();
                    }
                    FastExt.System.InitHandler.doNextSilenceMenu();
                } else if (FastExt.Power.isPower()) {
                    //权限配置模式，加载一条测试数据
                    grid.firstLoadedData = true;
                    grid.getStore().loadData([FastExt.Grid.buildTempData(grid)]);
                } else {
                    grid.firstLoadedData = true;
                    if (!grid.getStore().isLoaded()) {
                        grid.getStore().loadPage(1);
                        grid.checkRefreshTimer(false);
                    }
                }
            });
        }


        /**
         * 获取grid的view
         * @param grid
         */
        static getGridView(grid: any): any {
            let view = grid.getView();
            if (view) {
                if (view.$className === "Ext.grid.locking.View") {
                    return view.normalView;
                }
                return view;
            }
            return null;
        }


        /**
         * 获取Grid行高
         * @private
         */
        static getRowMinHeight() {
            return FastExt.System.ConfigHandler.getGridRowHeight();
        }

        /**
         * 构建一条空数据的grid行数据
         * @param grid
         */
        static buildNullData(grid: any): any {
            let data: any = {};
            if (!grid) {
                return data;
            }
            Ext.each(grid.getColumns(), function (column, index) {
                if (!Ext.isEmpty(column.dataIndex)) {
                    data[column.dataIndex] = null;
                }
            });
            return data;
        }

        /**
         * 构建一条模拟数据的grid行数据
         * @param grid
         */
        static buildTempData(grid: any): any {
            let data: any = {};
            if (!grid) {
                return data;
            }
            Ext.each(grid.getColumns(), function (column, index) {
                if (!Ext.isEmpty(column.dataIndex)) {
                    data[column.dataIndex] = "模拟数据";
                    if (FastExt.Grid.isDateColumn(column)) {
                        data[column.dataIndex] = Ext.Date.format(new Date(), "Y-m-d H:i:s");
                    } else if (FastExt.Grid.isFilesColumn(column)) {
                        data[column.dataIndex] = "[]";
                    }
                }
            });
            return data;
        }


        /**
         * 添加grid的右键菜单选项
         * @param grid Grid对象
         * @param target 菜单Ext.menu.Item
         * @param index 插入位置
         */
        static addGridContextMenu(grid: any, target?: any, index?: number) {
            if (grid.contextMenu && target) {
                if (!Ext.isFunction(grid.contextMenu.getXType)) {
                    let menu = Ext.create('Ext.menu.Menu', {
                        scrollToHidden: true,
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
         * 配置Grid默认的全局配置
         * @param grid
         */
        static configGridDefault(grid: any) {
            if (!grid.selectButtons) {
                grid.selectButtons = [];
            }
            //关闭悬浮或右键提示文档
            grid.tipHelp = false;
        }

        /**
         * 配置默认选择记忆的配置
         * @param grid
         */
        static configGridHistory(grid: any) {
            //初始化默认选择记忆的配置
            if (!grid.selectHistoryConfig) {
                grid.selectHistoryConfig = {
                    "state": 0,
                    "cache": 0,
                    "count": 0,
                };
                if (FastExt.Base.toBool(grid.entitySelect, false)) {
                    grid.selectHistoryConfig["state"] = 1;
                    grid.selectHistoryConfig["cache"] = 1;
                }
                FastExt.Grid.checkHistoryConfig(grid);
            }
        }

        /**
         * 配置Grid默认的右键菜单功能
         * @param grid Grid对象
         */
        static configGridContextMenu(grid: any) {
            let index = 0;
            let formatText = function (text, width?) {
                return "&nbsp;<div style='" +
                    "background: #e3e3e3;" +
                    "border-radius: 3px;" +
                    "display:inline-flex;" +
                    "line-height:20px;" +
                    "'>&nbsp;<div style='" +
                    "color: black;" +
                    "overflow: hidden;" +
                    "white-space: nowrap;" +
                    "text-overflow: ellipsis;" +
                    "font-size:smaller;" +
                    "max-width:" + width + "px;" +
                    "'>" + text + "</div>&nbsp;</div>&nbsp;";
            };

            if (grid.getStore().entity) {
                FastExt.Grid.addGridContextMenu(grid, {
                    iconCls: 'extIcon extDetails editColor',
                    text: "查看详情",
                    handler: function (obj, event) {
                        FastExt.Grid.showGridSelectDetailsWindow(obj, grid);
                    }
                }, index++);
            }

            if (grid.getStore().entity && grid.getStore().entity.data_log) {
                FastExt.Grid.addGridContextMenu(grid, {
                    iconCls: 'extIcon extHistory color30',
                    text: "操作日志",
                    handler: function (obj, event) {
                        grid.showDataLog(this);
                    }
                }, index++);
            }

            FastExt.Grid.addGridContextMenu(grid, "-", index++);

            if (FastExt.System.ManagerHandler.isSuperRole()) {
                FastExt.Grid.addGridContextMenu(grid, {
                    iconCls: 'extIcon extSee editColor',
                    text: "查看数据结构",
                    handler: function (obj, event) {
                        let menu = grid.contextMenu;
                        let record = menu.record;
                        FastExt.Dialog.showJson(this, "查看原始数据结构", FastExt.Json.objectToJson(record.data));
                    }
                }, index++);
            }

            FastExt.Grid.addGridContextMenu(grid, {
                iconCls: 'extIcon extCopy2',
                text: "复制数据",
                menu: [
                    {
                        text: '复制单元格数据',
                        iconCls: 'extIcon extCopy2',
                        onBeforeShow: function () {
                            let menu = grid.contextMenu;
                            let record = menu.record;
                            let fieldName = menu.cellContext.column.dataIndex;
                            if (FastExt.Grid.isFileColumn(menu.cellContext.column)
                                || FastExt.Grid.isFilesColumn(menu.cellContext.column)
                                || FastExt.Grid.isContentColumn(menu.cellContext.column)
                                || Ext.isEmpty(record.get(fieldName))) {
                                this.hide();
                                this.setText("复制数据");
                                return;
                            }
                            this.setText("复制" + formatText($(menu.cellTd).text(), $(menu.cellTd).outerWidth(true)));
                            this.show();
                        },
                        handler: function () {
                            let menu = grid.contextMenu;
                            FastExt.Base.copyToBoard($(menu.cellTd).text().trim());
                            FastExt.Dialog.toast("复制成功！");
                        }
                    },
                    {
                        text: '复制整行数据',
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
                        text: '复制单元格实际数据',
                        iconCls: 'extIcon extCopy2',
                        handler: function () {
                            let menu = grid.contextMenu;
                            let record = menu.record;
                            let fieldName = menu.cellContext.column.dataIndex;
                            let fieldValue = record.get(fieldName);
                            if (Ext.isEmpty(fieldValue)) {
                                FastExt.Dialog.showAlert("系统提醒", "复制失败，暂无实际数据！");
                                return;
                            }
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

            FastExt.Grid.addGridContextMenu(grid, "-", index++);

            FastExt.Grid.addGridContextMenu(grid, {
                iconCls: 'extIcon extEdit editColor',
                text: "编辑单元格数据",
                onBeforeShow: function () {
                    let menu = this.ownerCt;
                    let record = menu.record;
                    let fieldName = menu.cellContext.column.dataIndex;
                    if (Ext.isEmpty(fieldName) || grid.getSelection().length !== 1 || !grid.checkEditor()) {
                        this.hide();
                        return;
                    }
                    if (!FastExt.Base.toBool(menu.cellContext.column.editable, true)) {
                        this.hide();
                        return;
                    }
                    if (!menu.cellContext.column.field) {
                        if (!menu.cellContext.column.hasListener("dblclick")) {
                            this.hide();
                        }
                    }
                    this.show();
                    if (!FastExt.Grid.isContentColumn(menu.cellContext.column)) {
                        if (!Ext.isEmpty(record.get(fieldName)) && $(menu.cellTd).text().length > 0) {
                            this.setText("编辑" + formatText($(menu.cellTd).text(), $(menu.cellTd).outerWidth(true)));
                            return;
                        }
                    }
                    this.setText("编辑单元格数据");
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
                    iconCls: 'extIcon extSearch searchColor',
                    text: "查找单元格数据",
                    onBeforeShow: function () {
                        let menu = this.ownerCt;
                        let record = menu.record;
                        let fieldName = menu.cellContext.column.dataIndex;
                        if (Ext.isEmpty(fieldName)
                            || !FastExt.Grid.canColumnSearch(menu.cellContext.column)
                            || FastExt.Grid.isContentColumn(menu.cellContext.column)
                            || grid.getSelection().length !== 1) {
                            this.hide();
                        } else {
                            this.show();
                            if (!Ext.isEmpty(record.get(fieldName))) {
                                this.setText("查找" + formatText($(menu.cellTd).text(), $(menu.cellTd).outerWidth(true)));
                            } else {
                                this.setText("查找单元格数据");
                            }
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
                    text: "清空单元格数据",
                    onBeforeShow: function () {
                        let menu = this.ownerCt;
                        let record = menu.record;
                        let fieldName = menu.cellContext.column.dataIndex;
                        if (Ext.isEmpty(fieldName) || grid.getSelection().length !== 1 || !grid.checkEditor()) {
                            this.hide();
                        } else {
                            this.show();
                            if (!FastExt.Grid.isContentColumn(menu.cellContext.column)) {
                                if (!Ext.isEmpty(record.get(fieldName)) && $(menu.cellTd).text().length > 0) {
                                    this.setText("清空" + formatText($(menu.cellTd).text(), $(menu.cellTd).outerWidth(true)));
                                    return;
                                }
                            }
                            this.setText("清空单元格数据");
                        }
                    },
                    handler: function () {
                        let me = this;
                        let menu = me.ownerCt;
                        if (!grid.getStore().entity) {
                            FastExt.Dialog.toast("当前列表不支持此功能！");
                            return;
                        }
                        if (!grid.getStore().entity.idProperty) {
                            FastExt.Dialog.toast("当前列表不支持此功能！");
                            return;
                        }
                        Ext.Msg.confirm("系统提醒", "您确定" + me.text + "吗？", function (button, text) {
                            if (button === "yes") {
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
                                params["menu"] = grid.getStore().entity.comment;
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

            FastExt.Grid.addGridContextMenu(grid, "-", index++);
        }


        /**
         * 配置Grid列的默认的右键菜单功能
         * @param grid
         */
        static configGridHeadMenu(grid: any) {
            if (!FastExt.Base.toBool(grid.columnContextMenu, true)) {
                return;
            }
            if (!grid.columnHeadMenu) {
                return;
            }
            if (!grid.columnMenu) {
                grid.columnMenu = new FastExt.GridColumnMenu();
            }
            if (!grid.columnMenu) {
                return;
            }
            let menu = grid.columnHeadMenu;
            menu.scrollToHidden = true;
            menu.on("beforeshow", FastExt.GridEvent.onFastHeadMenuBeforeShow, grid);
        }


        /**
         * 配置Grid默认的ToolBar功能
         * @param grid
         */
        static configDefaultToolBar(grid: any) {
            if (!grid) {
                return;
            }
            let toolbar = grid.down("toolbar[dock='top']");
            try {
                if (toolbar) {
                    if (FastExt.Base.toBool(grid.fromRecycle, false)) {
                        toolbar.setHidden(true);
                        return;
                    }

                    let addIndex = 0;

                    if (grid.getStore().entity && grid.getStore().entity.data_log) {
                        toolbar.insert(addIndex++, {
                            xtype: 'button',
                            text: '操作日志',
                            checkSelect: 1,
                            animMinMax: true,
                            iconCls: 'extIcon extHistory color30',
                            handler: function () {
                                grid.showDataLog(this);
                            }
                        });
                    }

                    if (!FastExt.Power.isPower()) {

                        if (grid.getStore().entity) {
                            if (FastExt.Base.toBool(grid.showDetailsButton, true)
                                && FastExt.Base.toBool(grid.operate.showDetailsButton, true)) {
                                toolbar.insert(addIndex++, {
                                    xtype: 'button',
                                    text: '查看详情',
                                    checkSelect: 1,
                                    animMinMax: true,
                                    contextMenu: false,
                                    iconCls: 'extIcon extDetails searchColor',
                                    handler: function () {
                                        FastExt.Grid.showGridSelectDetailsWindow(this, grid);
                                    }
                                });
                            }

                            if (FastExt.Base.toBool(grid.showUpdateButton, true)
                                && FastExt.Base.toBool(grid.operate.showUpdateButton, true)
                                && grid.checkUpdate(true)) {
                                toolbar.insert(addIndex++, {
                                    xtype: 'button',
                                    text: '修改数据',
                                    checkSelect: 1,
                                    checkUpdatePower: true,
                                    contextMenu: false,
                                    animMinMax: true,
                                    iconCls: 'extIcon extEdit editColor',
                                    handler: function () {
                                        FastExt.Grid.showDataEditorWin(this, grid);
                                    }
                                });
                            }
                            if (addIndex > 0) {
                                toolbar.insert(addIndex, "-");
                            }
                        }
                    }


                    if (!grid.operate) {
                        return;
                    }
                    if (!FastExt.Base.toBool(grid.defaultToolBar, true)) {
                        return;
                    }

                    let moreBtn = {
                        xtype: 'button',
                        text: '更多操作',
                        iconCls: 'extIcon extMore grayColor',
                        menu: []
                    };

                    if (FastExt.Base.toBool(grid.operate.excelOut, true)) {
                        if (!FastExt.Menu.isSplitLineLast(moreBtn.menu)) {
                            moreBtn.menu.push("-");
                        }
                        moreBtn.menu.push({
                            text: '导出Excel',
                            iconCls: 'extIcon extExcel',
                            handler: function () {
                                FastExt.System.InitHandler.checkMaxMemory(() => {
                                    FastExt.Grid.exportGrid(grid);
                                });
                            }
                        });
                    }

                    if (FastExt.Base.toBool(grid.operate.excelIn, true) && grid.checkAdd()) {
                        moreBtn.menu.push(
                            <any>{
                                text: '导入Excel',
                                iconCls: 'extIcon extExcel',
                                menu: [
                                    {
                                        text: '下载模板',
                                        iconCls: 'extIcon extExcelModule searchColor',
                                        handler: function () {
                                            FastExt.Grid.downExcelModel(grid);
                                        }
                                    },
                                    {
                                        text: '导入数据',
                                        iconCls: 'extIcon extExcelImport searchColor',
                                        handler: function () {
                                            FastExt.System.InitHandler.checkMaxMemory(() => {
                                                let params = {entityCode: grid.getStore().entity.entityCode};
                                                FastExt.Grid.importExcel(this, params, grid.importExcelItems).then(function (data) {
                                                    if (data) {
                                                        grid.getStore().loadPage(1);
                                                    }
                                                });
                                            });
                                        }
                                    }
                                ]
                            }
                        );
                        moreBtn.menu.push("-");
                    }

                    if (FastExt.System.ManagerHandler.isSuperRole()) {
                        if (!FastExt.Menu.isSplitLineLast(moreBtn.menu)) {
                            moreBtn.menu.push("-");
                        }
                        if (FastExt.Base.toBool(grid.operate.downloadData, true)) {
                            moreBtn.menu.push(
                                {
                                    iconCls: 'extIcon extDownload searchColor',
                                    text: '下载数据',
                                    handler: function () {
                                        FastExt.System.InitHandler.checkMaxMemory(() => {
                                            FastExt.Grid.downDataGrid(grid);
                                        });
                                    }
                                }
                            );
                        }

                        if (FastExt.Base.toBool(grid.operate.uploadData, true)) {
                            moreBtn.menu.push(
                                {
                                    iconCls: 'extIcon extUpload searchColor',
                                    text: '上传数据',
                                    handler: function () {
                                        FastExt.System.InitHandler.checkMaxMemory(() => {
                                            let params = {entityCode: grid.getStore().entity.entityCode};
                                            FastExt.Grid.loadDataGrid(this, params).then(function (data) {
                                                if (data) {
                                                    grid.getStore().loadPage(1);
                                                }
                                            });
                                        });
                                    }
                                }
                            );
                        }
                        moreBtn.menu.push("-");
                        if (grid.getStore().entity) {
                            moreBtn.menu.push(
                                {
                                    iconCls: 'extIcon extSee searchColor',
                                    text: '查看实体',
                                    handler: function () {
                                        FastExt.Dialog.showJson(this, "查看实体信息", JSON.stringify(Object.getPrototypeOf(grid.getStore().entity)));
                                    }
                                }
                            );
                        }
                        if (grid.getStore().entity) {
                            moreBtn.menu.push(
                                {
                                    iconCls: 'extIcon extColumn searchColor',
                                    text: '查看所有列信息',
                                    handler: function () {
                                        if (!grid) {
                                            FastExt.Dialog.toast("容器无效！");
                                            return;
                                        }
                                        let columns = grid.getColumns();
                                        let colObjects = [];
                                        for (let i = 0; i < columns.length; i++) {
                                            let column = columns[i];
                                            if (Ext.isEmpty(column.dataIndex)) {
                                                continue;
                                            }
                                            colObjects.push({
                                                name: column.dataIndex,
                                                text: $("<div>" + column.configText + "</div>").text(),
                                            });
                                        }
                                        FastExt.Dialog.showJson(this, "查看所有列信息", JSON.stringify(colObjects));
                                    }
                                }
                            );
                        }
                        moreBtn.menu.push("-");
                        if (grid.getStore().entity && FastExt.Base.toBool(grid.getStore().entity.layer, false)) {
                            moreBtn.menu.push(
                                {
                                    iconCls: 'extIcon extPower redColor',
                                    text: '更新权限值',
                                    handler: function () {
                                        Ext.Msg.confirm("系统提醒", "确定更新表格的数据权限值吗？确定后将同时更新与当前表格有关联的所有表格的权限值！如果数据库数据量达到千万级别时，更新时间会较长，请谨慎操作！", function (button, text) {
                                            if (button == "yes") {
                                                let params = {entityCode: grid.getStore().entity.entityCode};
                                                FastExt.LoginLayout.validOperate("更新表格的数据权限层级值", function () {
                                                    FastExt.Dialog.showWait("正在更新中，请稍后……");
                                                    FastExt.Server.updateLayer(params, function (success, message) {
                                                        FastExt.Dialog.hideWait();
                                                        FastExt.Dialog.showAlert("系统提醒", message);
                                                    });
                                                }, 30);
                                            }
                                        });
                                    }
                                }
                            );
                        }
                        if (grid.getStore().entity) {
                            moreBtn.menu.push(
                                {
                                    iconCls: 'extIcon extCopy2 redColor',
                                    text: '更新同列值',
                                    handler: function () {
                                        Ext.Msg.confirm("系统提醒", "确定更新表格的数据绑定值吗？确定后将同时更新与当前表格有关联的所有表格的相同列的值！请您谨慎操作！", function (button, text) {
                                            if (button == "yes") {
                                                let params = {entityCode: grid.getStore().entity.entityCode};
                                                FastExt.LoginLayout.validOperate("更新表格的相同列的值", function () {
                                                    FastExt.Dialog.showWait("正在更新中，请稍后……");
                                                    FastExt.Server.updateSame(params, function (success, message) {
                                                        FastExt.Dialog.hideWait();
                                                        FastExt.Dialog.showAlert("系统提醒", message);
                                                    });
                                                }, 30);
                                            }
                                        });
                                    }
                                }
                            );
                        }
                        moreBtn.menu.push("-");
                    }


                    if (!FastExt.Menu.isSplitLineLast(moreBtn.menu)) {
                        moreBtn.menu.push("-");
                    }

                    moreBtn.menu.push({
                        iconCls: 'extIcon extSet',
                        text: '功能设置',
                        handler: function () {
                            FastExt.Grid.setGrid(this, grid);
                        }
                    });


                    let linkBtns = {
                        xtype: 'button',
                        text: '相关查询',
                        checkSelect: 1,
                        iconCls: 'extIcon extIntersect grayColor',
                        menu: []
                    };

                    if (grid.linkMenu) {
                        linkBtns.menu = grid.linkMenu;
                    }
                    if (grid.getStore() && grid.getStore().entity) {
                        let realEntity = FastExt.System.EntitiesHandler.getEntity(grid.getStore().entity);

                        if (realEntity.linkTables) {
                            let findButtons = grid.query("button[entityCode]");
                            for (let i = 0; i < realEntity.linkTables.length; i++) {
                                let linkTable = realEntity.linkTables[i];
                                if (linkTable.linkColumns) {
                                    let breakThis = false;
                                    for (let entityCodeButton of findButtons) {
                                        if (entityCodeButton.entityCode === linkTable.entityCode) {
                                            breakThis = true;
                                            break;
                                        }
                                    }
                                    let linkEntity = FastExt.System.EntitiesHandler.getEntity(linkTable.entityCode);
                                    if (!linkEntity.js) {
                                        continue;
                                    }
                                    if (breakThis) {
                                        continue;
                                    }
                                    let linkBtn: any = {
                                        text: linkTable.comment
                                    };
                                    if (linkTable.menu) {
                                        linkBtn["icon"] = linkTable.menu.icon;
                                        if (!FastExt.System.MenuHandler.existMenu(linkTable.menu.id)) {
                                            //没有权限的关联表格跳过
                                            continue;
                                        }
                                    } else {
                                        linkBtn["iconCls"] = "extIcon extSearch searchColor";
                                        if (!FastExt.System.ManagerHandler.isSuperRole()) {
                                            //其他没有菜单的相关查询，非超级管理不可使用
                                            continue;
                                        }
                                    }
                                    if (linkTable.linkColumns.length == 1) {
                                        let linkColumn = linkTable.linkColumns[0];
                                        linkBtn["text"] = FastExt.Base.toString(linkColumn["link_menu_text"], linkTable.comment);
                                        linkBtn["handler"] = function () {
                                            let where = {};
                                            where['t.' + linkColumn.name] = grid.getSelection()[0].get(linkColumn.linkKey);
                                            where['^' + linkColumn.linkText[0]] = grid.getSelection()[0].get(linkColumn.linkText[0]);
                                            let entityJsObj = eval("new " + linkTable.entityCode + "()");
                                            entityJsObj.showWinList(this, linkTable.comment + "【" + linkColumn.comment + "】", where, true);
                                        };
                                        if (FastExt.Base.toBool(linkColumn["to_link_menu"], true)) {
                                            linkBtns.menu.push(linkBtn);
                                        }
                                    } else if (linkTable.linkColumns.length > 1) {
                                        linkBtn["menu"] = [];
                                        for (let j = 0; j < linkTable.linkColumns.length; j++) {
                                            let linkColumn = linkTable.linkColumns[j];
                                            let linkChildBtn = {
                                                icon: FastExt.Server.getIcon("icon_column.svg"),
                                                text: FastExt.Base.toString(linkColumn["link_menu_text"], "匹配" + linkColumn.comment),
                                                handler: function () {
                                                    let where = {};
                                                    where['t.' + linkColumn.name] = grid.getSelection()[0].get(linkColumn.linkKey);
                                                    where['^' + linkColumn.linkText[0]] = grid.getSelection()[0].get(linkColumn.linkText[0]);
                                                    let entityJsObj = eval("new " + linkTable.entityCode + "()");
                                                    entityJsObj.showWinList(this, linkTable.comment + "【" + linkColumn.comment + "】", where, true);
                                                }
                                            };
                                            if (FastExt.Base.toBool(linkColumn["to_link_menu"], true)) {
                                                linkBtn.menu.push(linkChildBtn);
                                            }
                                        }

                                        if (linkBtn.menu.length > 0) {
                                            if (linkBtn.menu.length === 1) {
                                                linkBtn = linkBtn.menu[0];
                                            }
                                            linkBtns.menu.push(linkBtn);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    toolbar.add("->");

                    if (FastExt.System.ConfigHandler.isGridDefaultLinkButton() && FastExt.System.ManagerHandler.isSuperRole()) {
                        if (FastExt.Base.toBool(grid.defaultToolBarLink, true)) {
                            if (linkBtns.menu.length > 0) {
                                toolbar.add(linkBtns);
                            }
                        }
                    }

                    if (FastExt.Base.toBool(grid.defaultToolBarMore, true)) {
                        toolbar.add(moreBtn);
                    }

                    if (grid.help) {
                        let title = grid.helpTitle ? grid.helpTitle : "帮助文档";
                        toolbar.add({
                            xtype: 'button',
                            iconCls: 'extIcon extQuestion2 color75',
                            text: title,
                            animMinMax: true,
                            _help: grid.help,
                            _helpTitle: title,
                            handler: function () {
                                if (this._help.toString().toLowerCase().endWith(".md")) {
                                    FastExt.Markdown.showMarkdownFile(this, this._helpTitle, this._help, {
                                        modal: false,
                                        width: 300,
                                        height: parseInt((document.body.clientHeight * 0.8).toFixed(0))
                                    });
                                } else {
                                    FastExt.Dialog.showLink(this, this._helpTitle, this._help, {
                                        modal: false,
                                        width: 300,
                                        height: parseInt((document.body.clientHeight * 0.8).toFixed(0))
                                    });
                                }
                            },
                        });
                    }
                }
            } finally {
                if (toolbar && toolbar.items.length === 0) {
                    toolbar.setHidden(true);
                }
            }

        }


        /**
         * 配置Grid的ToolTip鼠标悬浮提醒的功能
         * @param grid
         */
        static configGridTip(grid: any) {
            if (!grid) {
                return;
            }
            let view = FastExt.Grid.getGridView(grid);
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
                        console.log(tip.triggerElement);

                        let innerHTML = $(tip.triggerElement).text();
                        if (Ext.isEmpty(innerHTML) || innerHTML === "无" || innerHTML === "&nbsp;" || innerHTML === " " || innerHTML === " ") {
                            return false;
                        }
                        let detailsIdEl = $(tip.triggerElement).find("[data-details-id]");
                        if (detailsIdEl.length > 0) {
                            let detailsId = $(detailsIdEl).attr("data-details-id");
                            let detailsInfo = window[detailsId];
                            if (!detailsInfo) {
                                detailsInfo = FastExt.Cache.memory[detailsId];
                            }
                            if (detailsInfo) {
                                tip.update(detailsInfo);
                                return true;
                            }
                        }
                        tip.update($(tip.triggerElement).html());
                    }
                }
            });
        }


        /**
         * 配置Grid扩展的方法
         * @param grid
         */
        static configGridMethod(grid: any) {
            if (!grid || grid.configGridMethod) {
                return;
            }
            grid.configGridMethod = true;

            // grid.refreshButtons = function () {
            //     try {
            //         let me = this;
            //         let allButtons = this.query("button");
            //         for (let button of allButtons) {
            //             if (!Ext.isEmpty(button.text) && FastExt.Base.toBool(button.contextMenu, true)) {
            //                 //需要配置右键菜单
            //                 let buttonMenu = FastExt.Button.buttonToMenuItem(button);
            //                 FastExt.Grid.addGridContextMenu(me, buttonMenu);
            //             }
            //             //需要检测grid选中项
            //             FastExt.Button.buttonToBind(me, button);
            //         }
            //     } catch (e) {
            //         console.error(e);
            //     }
            // };

            grid.refreshPowerEnable = FastExt.GridMethod.doRefreshPowerEnable;

            grid.refreshSelect = FastExt.GridMethod.doRefreshSelect;

            grid.recordSelect = FastExt.GridMethod.doRecordSelect;

            grid.refreshToolPaging = FastExt.GridMethod.doRefreshToolPaging;

            grid.hasRecordHistory = FastExt.GridMethod.doHasRecordHistory;

            grid.removeRecordHistory = FastExt.GridMethod.doRemoveRecordHistory;

            grid.restoreSelect = FastExt.GridMethod.doRestoreSelect;

            grid.getSelectRecordHistory = FastExt.GridMethod.doGetSelectRecordHistory;

            grid.clearSelectRecordHistory = FastExt.GridMethod.doClearSelectRecordHistory;

            grid.refreshSelectHistoryCount = FastExt.GridMethod.doRefreshSelectHistoryCount;

            grid.refreshDetailsPanel = FastExt.GridMethod.doRefreshDetailsPanel;

            grid.saveUIConfig = FastExt.GridMethod.doSaveUIConfig;

            grid.showEmptyTip = FastExt.GridMethod.doShowEmptyTip;

            grid.hideEmptyTip = FastExt.GridMethod.doHideEmptyTip;

            grid.checkEditor = FastExt.GridMethod.doCheckEditor;

            grid.checkAdd = FastExt.GridMethod.doCheckAdd;

            grid.checkDelete = FastExt.GridMethod.doCheckDelete;

            grid.checkUpdate = FastExt.GridMethod.doCheckUpdate;

            grid.checkRefreshTimer = FastExt.GridMethod.doCheckRefreshTimer;

            grid.startRefreshTimer = FastExt.GridMethod.doStartRefreshTimer;

            grid.stopRefreshTimer = FastExt.GridMethod.doStopRefreshTimer;

            grid.showDataLog = FastExt.GridMethod.doShowDataLog;

        }

        /**
         * 配置Grid默认绑定的事件功能
         * @param grid
         */
        static configGridListeners(grid: any) {
            if (!grid || grid.configListener) {
                return;
            }
            grid.configListener = true;

            grid.on('aftertabactive', FastExt.GridEvent.onFastAfterTabActive, grid);

            grid.on('viewready', FastExt.GridEvent.onFastViewRead, grid);

            grid.on('beforedestroy', FastExt.GridEvent.onFastBeforeDestroy, grid);

            grid.on('columnmove', FastExt.GridEvent.onFastColumnMove, grid);

            grid.on('columnresize', FastExt.GridEvent.onFastColumnResize, grid);

            grid.on('columnschanged', FastExt.GridEvent.onFastColumnsChanged, grid);

            grid.on('headertriggerclick', FastExt.GridEvent.onFastHeaderTriggerClick, grid);

            grid.on('headercontextmenu', FastExt.GridEvent.onFastHeaderContextMenu, grid);

            grid.on('headermenucreate', FastExt.GridEvent.onFastHeaderMenuCreate, grid);

            grid.on('headerclick', FastExt.GridEvent.onFastHeaderClick, grid);

            grid.on('sortchange', FastExt.GridEvent.onFastSortChange, grid);

            grid.on('cellcontextmenu', FastExt.GridEvent.onFastCellContextMenu, grid);

            grid.getStore().on('endupdate', FastExt.GridEvent.onFastStoreEndUpdate, grid);

            grid.on("celldblclick", FastExt.GridEvent.onFastCellDblclick, grid);

            grid.on('beforeedit', FastExt.GridEvent.onFastBeforeEdit, grid);

            grid.on('selectionchange', FastExt.GridEvent.onFastSelectionChange, grid);

            grid.getStore().on('datachanged', FastExt.GridEvent.onFastStoreDataChanged, grid);

            grid.getStore().on('load', FastExt.GridEvent.onFastStoreLoad, grid);

        }


        /**
         * 配置常规的Grid
         * @param grid
         */
        static configNormalGridListeners(grid: any) {
            if (!grid || grid.configNormalGridListeners) {
                return;
            }
            grid.configNormalGridListeners = true;

            grid.getStore().on('datachanged', FastExt.GridEvent.onFastStoreDataChanged, grid);

            grid.getStore().on('beforeload', FastExt.GridEvent.onFastStoreBeforeLoad, grid);

        }


        /**
         * 配置Grid的布局
         * @param grid
         */
        static configGridLayout(grid: any) {
            return new Ext.Promise(function (resolve, reject) {
                if (!grid) {
                    resolve(true);
                    return;
                }
                if (!FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                    FastExt.Grid.getGridView(grid).setLoading("初始化配置中……");
                }
                FastExt.Grid.restoreGridOperate(grid).then(function () {
                    FastExt.Grid.restoreGridColumn(grid).then(function () {
                        FastExt.Grid.getGridView(grid).setLoading(false);
                        resolve(true);
                    });
                });
            });
        }


        /**
         * 获取在grid内弹出窗体的一般大小尺寸
         * @param grid
         */
        static getGridInWindowSize(grid: any, w?: number, h?: number) {
            if (Ext.isEmpty(w)) {
                w = 0.4;
            }
            if (Ext.isEmpty(h)) {
                h = 0.4;
            }

            let winWidth = parseInt((grid.getWidth() * w).toFixed(0));
            let winHeight = parseInt((grid.getHeight() * h).toFixed(0));
            return {
                width: winWidth,
                height: winHeight
            }
        }

        /**
         * 查看grid选中的详情数据
         * @param obj
         * @param grid
         */
        static showGridSelectDetailsWindow(obj: any, grid: any) {
            let subtitle = "";

            let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));
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
                record: grid.getSelectionModel().getSelection()[0],
                tools: [
                    {
                        type: 'help',
                        callback: function (panel, tool, event) {
                            FastExt.Dialog.showJson(this, "查看原始数据结构", FastExt.Json.objectToJson(panel.record.data));
                        }
                    }],
                listeners: {
                    show: function (obj) {
                        obj.focus();
                    }
                },
                items: [FastExt.Grid.getDetailsPanel(grid, true)]
            });
            win.show();
        }

        /**
         * 构建grid列表右侧详细面板
         * @param grid Grid对象
         * @param fromWindow 是否添加到窗体中
         * @private
         */
        static getDetailsPanel(grid: any, fromWindow: any): any {
            if (!fromWindow) {
                if (!FastExt.System.ConfigHandler.isGridDetailsPanel()) {
                    return undefined;
                }
            }

            let subtitle = "";
            if (!grid.detailsPanels) {
                grid.detailsPanels = [];
            }
            let detailsConfig: any = {
                subtitle: subtitle,
                layout: 'border',
                cls: "fast-list-details-panel",
                collapsedCls: "fast-list-details-panel-collapsed",
                border: 0,
                autoScroll: false,
                scrollable: false,
                closeAction: 'hide',
                dataId: -1,
                currIsClosed: false,
                closeTimer: null,
                detailsPanel: true,
                isWindow: fromWindow,
                setRecord: function (grid: any) {
                    try {
                        let me = this;
                        if (!me.items) {
                            return false;
                        }
                        if (me.closeTimer) {
                            window.clearTimeout(me.closeTimer);
                        }
                        if (grid != null) {
                            let data = grid.getSelectionModel().getSelection();
                            if (data.length === 1) {
                                if (me.isWindow && me.record) {
                                    if (!FastExt.Store.isSameRecord(me.record, data[0])) {
                                        return false;
                                    }
                                }
                                me.record = data[0];
                                me.items.get(0).setRecord(grid, data[0]);
                                me.show();
                            } else {
                                if (me.isVisible() && !this.isWindow) {
                                    me.closeTimer = setTimeout(function () {
                                        me.close();
                                    }, 88);
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
                    },
                    destroy: function (obj) {
                        grid.detailsPanels = Ext.Array.remove(grid.detailsPanels, obj);
                    },
                },
                items: [FastExt.Grid.builderDetailsGrid(fromWindow)]
            };
            if (fromWindow) {
                detailsConfig.region = "center";
            } else {
                detailsConfig.title = '数据详情';
                detailsConfig.iconCls = 'extIcon extDetails';
                detailsConfig.collapsed = true;//此处默认关闭详情面板
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
            grid.detailsPanels.push(detailsPanel);
            return detailsPanel;
        }

        /**
         * 构建grid列表右侧详细面板中的详细数据grid控件
         */
        private static builderDetailsGrid(fromWindow: any): any {
            if (Ext.isEmpty(fromWindow)) {
                fromWindow = false;
            }
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
                cls: "fast-grid-details",
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
                setRecord: function (grid:any, record:any) {
                    try {
                        if (!grid) {
                            return;
                        }
                        if (!record) {
                            return;
                        }

                        this.recordId = record.getId();
                        this.superGrid = grid;
                        record.store = grid.getStore();
                        let columns = grid.getColumns();
                        let data = [];
                        let lastGroupNon = "BASE-" + new Date().getTime();
                        let maxNameWidth = 0;
                        for (let i = 0; i < columns.length; i++) {
                            let column = columns[i];
                            if (Ext.isEmpty(column.dataIndex)) {
                                continue;
                            }
                            if (!FastExt.Base.toBool(column.hideable, true)) {
                                if (!FastExt.Grid.isTreeColumn(column)) {
                                    continue;
                                }
                            }

                            let item = {
                                text: column.configText,
                                value: record.get(column.dataIndex),
                                dataIndex: column.dataIndex,
                                columnName: column.columnName,
                                groupHeaderText: column.groupHeaderText,
                                renderer: column.renderer,
                                index: column.getIndex(),
                                record: record,
                                linkColumn: column,
                                entity: grid.getStore().entity,
                                configEditor: FastExt.Base.toBool(column.editable, true),
                                editor: false
                            };
                            if (Ext.isEmpty(column.field)) {
                                item.configEditor = false;
                            }
                            if (!grid.checkEditor()) {
                                item.configEditor = false;
                            }
                            if (!item.groupHeaderText) {
                                item.groupHeaderText = lastGroupNon;
                            } else {
                                lastGroupNon = "BASE-" + i + "-" + new Date().getTime();
                            }
                            data.push(item);
                            maxNameWidth = Math.max(FastExt.Base.guessTextWidth(item["text"], 5), maxNameWidth);
                        }
                        data.sort(function (a, b) {
                            return a.index - b.index;
                        });
                        this.getStore().loadData(data);
                        let tableView = FastExt.Grid.getGridView(this);
                        if (tableView) {
                            tableView.getHeaderAtIndex(0).setWidth(maxNameWidth);
                        }
                    } catch (e) {
                    }
                },
                columns: [
                    {
                        header: '名称',
                        dataIndex: 'text',
                        align: 'right',
                        width: 120,
                        tdCls: 'tdVTop',
                        renderer: function (val, m, r) {
                            if (Ext.isEmpty(val)) {
                                return "";
                            }
                            m.style = FastExt.Grid.detailsGridKeyStyle;
                            return "<b>" + val + "：</b>";
                        }
                    },
                    {
                        header: '值',
                        dataIndex: 'value',
                        flex: 1,
                        align: 'left',
                        renderer: function (val, m, r, rowIndex, colIndex, store, view) {
                            try {
                                m.style = FastExt.Grid.detailsGridValueStyle;
                                let fun = r.get("renderer");
                                if (Ext.isFunction(fun)) {
                                    let value = fun(val, m, r.get("record"), rowIndex, colIndex, store, view, true);
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
                    },
                    {
                        xtype: 'actioncolumn',
                        width: 80,
                        sortable: false,
                        menuDisabled: true,
                        renderer: function (val, m) {
                            m.style = FastExt.Grid.detailsGridActionStyle;
                            return val;
                        },
                        items: [
                            {
                                iconCls: 'extIcon extEdit editColor marginRight5 textBlackShadowWhite',
                                tooltip: '编辑数据',
                                align: 'center',
                                isDisabled: function (view, rowIndex, colIndex, item, record) {
                                    return !FastExt.Base.toBool(record.get("editor"), false);
                                },
                                getClass: function (v, metadata, record) {
                                    if (FastExt.Base.toBool(record.get("editor"), false)) {
                                        return "extIcon extEdit editColor marginRight5 textBlackShadowWhite";
                                    }
                                    return "";
                                },
                                handler: FastExt.Grid.showDetailsEditMenu
                            },
                            {
                                iconCls: 'extIcon extCopy2 searchColor textBlackShadowWhite',
                                tooltip: '复制数据',
                                align: 'center',
                                isDisabled: function (view, rowIndex, colIndex, item, record) {
                                    return !FastExt.Base.toBool(record.get("doCopy"), false);
                                },
                                getClass: function (v, metadata, record) {
                                    if (FastExt.Base.toBool(record.get("doCopy"), false)) {
                                        return "extIcon extCopy2 searchColor textBlackShadowWhite";
                                    }
                                    return "";
                                },
                                handler: FastExt.Grid.copyDetailsValue
                            }
                        ]
                    }, {xtype: 'rowplaceholder', minWidth: 30}],
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
                        FastExt.Grid.getGridView(grid).focusRow(currIndex);
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
                toggleActionColumn: function (record) {
                    if (this.lasClickRecord) {
                        if (this.lasClickRecord.getId() === record.getId()) {
                            return;
                        }
                        this.lasClickRecord.set("editor", false);
                        this.lasClickRecord.set("doCopy", false);
                    }
                    record.set("doCopy", true);
                    record.set("editor", record.get("configEditor"));

                    this.lasClickRecord = record;
                },
                listeners: {
                    itemclick: function (obj, record, item, index, e, eOpts) {
                        this.toggleActionColumn(record);
                    },
                    select: function (obj, record) {
                        this.toggleActionColumn(record);
                    },
                    itemdblclick: function () {
                        try {
                            let data = this.getSelectionModel().getSelection();
                            if (data.length == 0) {
                                return;
                            }
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
        static hasSearchColumn(grid: any): boolean {
            let search = false;
            if (!grid) {
                return false;
            }
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
        static getColumn(grid: any, dataIndex: string, text?: string) {
            if (!grid) {
                return null;
            }
            let columns = grid.getColumns();
            for (let i = 0; i < columns.length; i++) {
                let column = columns[i];
                if (column.dataIndex === dataIndex) {
                    if (text && (column.text === text || column.configText === text)) {
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
        static checkColumnSearch(grid: any) {
            try {
                if (!grid) {
                    return false;
                }
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
                            searchBtn.setUserCls("redBorder");
                        } else {
                            searchBtn.setIconCls("extIcon extSearch grayColor");
                            searchBtn.setUserCls("");
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
        static hasColumnField(column: any): boolean {
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
        static isColumnType(target: any) {
            return target === "gridcolumn" || target.xtype === "gridcolumn";
        }

        /**
         * 判断目标类型是否是treecolumn
         * @param column
         */
        static isTreeColumn(column: any) {
            if (!column) {
                return false;
            }
            return column.xtype === "treecolumn";
        }

        /**
         * 判断列是否是对应实体类的主键
         * @param column
         */
        static isIdPropertyColumn(column: any): boolean {
            let grid = FastExt.Grid.getColumnGrid(column);
            if (grid) {
                let store = grid.getStore();

                if (store && store.entity && store.entity.idProperty) {
                    for (let j = 0; j < store.entity.idProperty.length; j++) {
                        let idName = store.entity.idProperty[j];
                        if (FastExt.Base.toString(column.dataIndex, "") === idName) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        /**
         * 是否是日期格式的列
         * @param column
         */
        static isDateColumn(column: any): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isDateField(column.field);
        }

        /**
         * 是否是数字编辑的列
         * @param column
         */
        static isNumberColumn(column: any): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isNumberField(column.field);
        }

        /**
         * 是否是下拉框的列
         * @param column
         */
        static isComboColumn(column: any): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isComboField(column.field);
        }

        /**
         * 是否文件类型的列
         * @param column
         */
        static isFileColumn(column: any): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isFileField(column.field);
        }

        /**
         * 是否是大文本的列
         * @param column
         */
        static isContentColumn(column: any): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isHtmlContentField(column.field) || FastExt.Form.isContentField(column.field) || FastExt.Form.isMonacoEditorField(column.field);
        }

        /**
         * 是否是富文本的列
         * @param column
         */
        static isHtmlContentColumn(column: any): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isHtmlContentField(column.field);
        }

        /**
         * 是否多文件的列
         * @param column
         */
        static isFilesColumn(column: any): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isFilesField(column.field);
        }

        /**
         * 是否是枚举的列
         * @param column
         */
        static isEnumColumn(column: any): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isEnumField(column.field);
        }

        /**
         * 是否是关联表格的列
         * @param column
         */
        static isLinkColumn(column: any): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isLinkField(column.field);
        }

        /**
         * 是否是地图的列
         * @param column
         */
        static isMapColumn(column: any): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isMapField(column.field);
        }


        /**
         * 是否是省份选择的列
         * @param column
         */
        static isPCAColumn(column: any): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isPCAField(column.field);
        }

        /**
         * 是否目标类的列
         * @param column
         */
        static isTargetColumn(column: any): boolean {
            if (!column) {
                return false;
            }
            return FastExt.Form.isTargetField(column.field);
        }

        /**
         * 获得grid的选择器插件
         * @returns Ext.grid.selection.SpreadsheetModel
         */
        static getGridSelModel(showRowNumber?: boolean) {
            let rowNumberWidth = 0;
            if (FastExt.System.ConfigHandler.isGridRowNumber()) {
                rowNumberWidth = 46;
            }
            if (!Ext.isEmpty(showRowNumber)) {
                if (showRowNumber) {
                    rowNumberWidth = 46;
                } else {
                    rowNumberWidth = 0;
                }
            }

            return Ext.create('Ext.grid.selection.SpreadsheetModel', {
                pruneRemoved: false,
                checkboxSelect: true,
                hasLockedHeader: true,
                cellSelect: false,
                checkboxHeaderWidth: 40,
                dragSelect: true,
                extensible: false,
                rowNumbererHeaderWidth: rowNumberWidth,
                listeners: {
                    focuschange: function (obj, oldFocused, newFocused, eOpts) {
                        // if (!oldFocused || !newFocused) {
                        //     //脱离当前选择控件
                        //     return;
                        // }
                        // if (obj.store && obj.store.grid) {
                        //     let pagingToolBar = obj.store.grid.child('#pagingToolBar');
                        //     if (pagingToolBar) {
                        //         pagingToolBar.updateInfo();
                        //     }
                        // }
                    }
                }
            });

        }


        /**
         * 刷新显示序号的列
         * @param grid
         */
        static refreshGridNumberColumn(grid: any) {
            if (grid.operate) {
                let selectionModel = grid.getSelectionModel();
                if (selectionModel && selectionModel.numbererColumn) {
                    if (FastExt.Base.toBool(grid.operate.showRowNumber)) {
                        selectionModel.numbererColumn.setWidth(Math.max(selectionModel.numbererColumn.getWidth(), 52));
                    } else {
                        selectionModel.numbererColumn.setWidth(0);
                    }
                }
            }
        }

        /**
         * 检查grid是否代码配置了显示行号的列
         * @param grid
         */
        static checkConfigGridNumberColumn(grid: any): boolean {
            try {
                if (!grid) {
                    return false;
                }
                let selectionModel = grid.getSelectionModel();
                if (selectionModel && selectionModel.numbererColumn) {
                    return selectionModel.numbererColumn.configWidth > 0;
                }
            } catch (e) {
            }
            return false;
        }


        /**
         * 闪烁列
         * @param column 列对象
         */
        static blinkColumn(column: any) {
            if (column.blinking) return;
            column.blinking = true;
            if (column.blinkTimout) {
                clearTimeout(column.blinkTimout);
                delete column.blinkTimout;
            }

            if (Ext.isEmpty(column.configColor)) {
                column.configColor = column.getEl().getStyle("color") || "";
            }
            if (Ext.isEmpty(column.configBackground)) {
                column.configBackground = column.getEl().getStyle("background") || "";
            }

            let changeBg = "#e41f00";
            if (column.configBackground.indexOf("linear-gradient") > 0) {
                changeBg = "linear-gradient(0deg, #e41f00, #fefefe)";
            }
            column.setStyle({
                color: 'white',
                background: changeBg
            });
            column.blinkTimout = setTimeout(() => {
                column.setStyle({
                    color: column.configColor,
                    background: column.configBackground,
                });
                column.blinking = false;
                delete column.blinkTimout;
            }, 1000);
        }

        /**
         * 滚到到指定的列
         * @param grid grid对象
         * @param dataIndex 列的属性dataIndex
         * @param text 列的标题
         */
        static scrollToColumn(grid: any, dataIndex: string, text: string) {
            if (!grid) {
                return;
            }
            let column = FastExt.Grid.getColumn(grid, dataIndex, text);
            FastExt.Grid.blinkColumn(column);
            let x = column.getLocalX();
            if (column.isSubHeader) {
                x += column.ownerCt.getLocalX();
            }

            grid.scrollTo(x, 0, true);
        }


        /**
         * 弹出设置grid操作界面
         * @param obj 动画对象
         * @param grid Grid对象
         * @see {@link FastExt.GridOperate}
         */
        static setGrid(obj: any, grid: any) {
            let setPanel = Ext.create('Ext.form.Panel', {
                bodyPadding: 5,
                region: 'center',
                autoScroll: true,
                viewModel: {
                    data: grid.operate
                },
                defaults: {
                    labelWidth: FastExt.System.ConfigHandler.getFontSizeNumber() * 6 + 8
                },
                items: [
                    {
                        xtype: 'checkboxfield',
                        fieldLabel: '显示序号',
                        labelAlign: 'right',
                        columnWidth: 1,
                        name: 'showRowNumber',
                        bind: "{showRowNumber}",
                        uncheckedValue: false,
                        boxLabel: '自然序号，在列表中的显示出自然序号！',
                    },
                    {
                        xtype: 'checkboxfield',
                        fieldLabel: '删除提醒',
                        labelAlign: 'right',
                        name: 'alertDelete',
                        columnWidth: 1,
                        bind: "{alertDelete}",
                        uncheckedValue: false,
                        hidden: !grid.deleteEnable,
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
                    }
                ]
            });

            let winTitle = "功能设置";
            let winWidth = parseInt((document.body.clientWidth * 0.3).toFixed(0));
            let win = Ext.create('Ext.window.Window', {
                title: winTitle,
                iconCls: 'extIcon extSet',
                height: 460,
                width: winWidth,
                minHeight: 400,
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
                                    FastExt.Dialog.toast("功能设置成功！");
                                    FastExt.Grid.refreshGridNumberColumn(grid);
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
        static getColumnEnumName(column: any) {
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
        static getColumnFieldType(column: any) {
            if (Ext.isObject(column.field)) {
                return column.field.xtype;
            }
            return column.field;
        }

        /**
         * 导出grid数据
         */
        static exportGrid(grid: any) {
            if (!grid.getStore().entity) {
                Ext.Msg.alert('系统提醒', '导出失败！Grid的DataStore未绑定Entity!');
                return;
            }
            let message = "您确定导出当前条件下的所有数据吗？";
            let data = grid.getSelection();
            if (data.length > 0) {
                message = "您确定导出选中的" + data.length + "条数据吗？";
            } else if (grid.getStore().getTotalCount() === 0) {
                FastExt.Dialog.toast("当前页面暂无数据！");
                return;
            }


            let formPanel = Ext.create('Ext.form.FormPanel', {
                bodyPadding: 5,
                method: 'POST',
                region: 'center',
                border: 0,
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'middle'
                },
                defaults: {
                    margin: '5 5 5 5'
                },
                items: [
                    {
                        xtype: "lottie",
                        width: 150,
                        height: 120,
                        jsonPath: 'base/lottie/question.json',
                    },
                    {
                        xtype: "label",
                        text: message,
                    },
                    {
                        xtype: "checkboxfield",
                        boxLabel: "导出时自动生成数据序号",
                        uncheckedValue: false,
                        name: "exportIndex"
                    }]
            });

            let doExport = function (params: any) {
                if (!grid) {
                    return;
                }
                if (!grid.getStore().entity) {
                    FastExt.Dialog.toast("当前列表不支持此功能！");
                    return;
                }
                if (grid.getStore().entity) {
                    params.title = grid.getStore().entity.comment;
                }

                if (data.length > 0) {
                    if (!grid.getStore().entity.idProperty) {
                        FastExt.Dialog.toast("当前列表不支持选中导出功能！");
                        return;
                    }
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
                    if (item.isHidden() || !FastExt.Base.toBool(item.excelOutHeader, true)) {
                        return;
                    }
                    //排除文件类
                    if (!Ext.isEmpty(item.dataIndex)) {
                        params["column[" + index + "].index"] = index;
                        params["column[" + index + "].width"] = item.width;
                        params["column[" + index + "].text"] = item.configText;
                        params["column[" + index + "].groupHeaderText"] = item.groupHeaderText;
                        params["column[" + index + "].enum"] = FastExt.Grid.getColumnEnumName(item);
                        params["column[" + index + "].dataIndex"] = FastExt.Entity.getRealAttr(item);
                        params["column[" + index + "].valueIndex"] = item.dataIndex;
                        params["column[" + index + "].file"] = FastExt.Grid.isFileColumn(item);
                        params["column[" + index + "].files"] = FastExt.Grid.isFilesColumn(item);
                        params["column[" + index + "].type"] = FastExt.Grid.getColumnFieldType(item);
                        params["column[" + index + "].comment"] = item.excelComment || item.comment;
                        if (FastExt.Grid.isDateColumn(item)) {
                            params["column[" + index + "].format"] = item.field.format;
                        }
                    }
                });

                FastExt.Dialog.showWait("正在导出中……");
                FastExt.Server.exportExcel(FastExt.Store.mergeStoreParamBySelect(grid.getStore(), params), function (success, data, message) {
                    FastExt.Dialog.hideWait();
                    if (success) {
                        FastExt.Dialog.toast(message);
                        exportConfirmWindow.close();
                        location.href = "attach/" + data;
                    } else {
                        Ext.Msg.alert('系统提醒', "导出失败！" + message);
                    }
                });
            };

            let exportConfirmWindow = Ext.create('Ext.window.Window', {
                title: "导出Excel",
                height: 330,
                iconCls: 'extIcon extExcel',
                width: 300,
                layout: 'border',
                constrain: true,
                resizable: false,
                items: [formPanel],
                modal: true,
                buttons: [
                    '->',
                    {
                        text: '取消',
                        iconCls: 'extIcon extClose',
                        handler: function () {
                            exportConfirmWindow.close();
                        }
                    },
                    {
                        text: '确定',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            doExport(formPanel.getForm().getValues());
                        }
                    }, '->'],

            });
            exportConfirmWindow.show();
        }

        /**
         * 下载实体表格导入的数据模板
         * @param grid
         */
        static downExcelModel(grid: any) {
            let formPanel = Ext.create('Ext.form.FormPanel', {
                bodyPadding: 5,
                method: 'POST',
                region: 'center',
                border: 0,
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'middle'
                },
                defaults: {
                    margin: '5 5 5 5'
                },
                items: [
                    {
                        xtype: "lottie",
                        width: 150,
                        height: 120,
                        jsonPath: 'base/lottie/question.json',
                    },
                    {
                        xtype: "label",
                        text: "确定下载导入数据的Excel模板吗？",
                    },
                    {
                        xtype: "checkboxfield",
                        boxLabel: "包含已隐藏的列",
                        uncheckedValue: false,
                        name: "exportHidden"
                    }]
            });

            let doRequest = function (formParams) {
                if (!grid) {
                    return;
                }
                FastExt.Dialog.showWait("正在生成中……");
                let params: any = {entityCode: grid.getStore().entity.entityCode};
                if (grid.getStore().entity) {
                    params.title = grid.getStore().entity.comment;
                }
                Ext.each(grid.getColumns(), function (item, index) {
                    //排除文件类
                    if (FastExt.Grid.isFileColumn(item)
                        || FastExt.Grid.isFilesColumn(item)
                        || !FastExt.Base.toBool(item.excelHeader, true)) {
                        return;
                    }
                    if (!FastExt.Base.toBool(formParams["exportHidden"], false)) {
                        if (item.isHidden()) {
                            return;
                        }
                    }
                    if (!Ext.isEmpty(item.dataIndex)) {
                        let indexStr = index;
                        if (index < 10) {
                            indexStr = "0" + index;
                        }
                        params["column[" + indexStr + "].index"] = index;
                        params["column[" + indexStr + "].width"] = item.width;
                        params["column[" + indexStr + "].text"] = item.configText;
                        params["column[" + indexStr + "].groupHeaderText"] = item.groupHeaderText;
                        params["column[" + indexStr + "].enum"] = FastExt.Grid.getColumnEnumName(item);
                        params["column[" + indexStr + "].type"] = FastExt.Grid.getColumnFieldType(item);
                        params["column[" + indexStr + "].comment"] = item.excelComment || item.comment;
                        params["column[" + indexStr + "].dataIndex"] = FastExt.Entity.getRealAttr(item);
                        params["column[" + indexStr + "].excelHeaderText"] = item.excelHeaderText;

                        if (FastExt.Grid.isDateColumn(item)) {
                            params["column[" + indexStr + "].format"] = item.field.format;
                        }
                    }
                });
                FastExt.Server.excelModule(params, function (success, data, message) {
                    FastExt.Dialog.hideWait();
                    if (success) {
                        exportConfirmWindow.close();
                        FastExt.Dialog.toast("模板生成成功！");
                        location.href = "attach/" + data;
                    } else {
                        Ext.Msg.alert('系统提醒', "生成失败！" + message);
                    }
                });
            };
            let exportConfirmWindow = Ext.create('Ext.window.Window', {
                title: "下载模板",
                height: 320,
                iconCls: 'extIcon extExcel',
                width: 280,
                layout: 'border',
                constrain: true,
                resizable: false,
                items: [formPanel],
                modal: true,
                buttons: [
                    '->',
                    {
                        text: '取消',
                        iconCls: 'extIcon extClose',
                        handler: function () {
                            exportConfirmWindow.close();
                        }
                    },
                    {
                        text: '确定',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            doRequest(formPanel.getForm().getValues());
                        }
                    }, '->'],

            });
            exportConfirmWindow.show();
        }

        /**
         * 导入实体的excel数据
         * @param obj
         * @param params 接口参数
         * @param formItems 配置扩展表单组件
         * @param serverUrl 服务器地址
         */
        static importExcel(obj: any, params: any, formItems?, serverUrl?: string) {
            return new Ext.Promise(function (resolve, reject) {
                if (!formItems) {
                    formItems = [];
                } else {
                    formItems = Ext.Array.clone(formItems);
                }
                if (!serverUrl) {
                    serverUrl = FastExt.Server.importEntityExcelUrl();
                }
                formItems.push({
                    xtype: 'filefield',
                    fieldLabel: 'Excel文件',
                    buttonText: '选择文件',
                    allowBlank: false,
                    name: 'file',
                    columnWidth: 1,
                    listeners: {
                        change: function (obj, value, eOpts) {
                            if (value != null && value.length != 0) {
                                if (!FastExt.FileModule.excel().match(value)) {
                                    if (formPanel.form) {
                                        formPanel.form.reset();
                                    }
                                    Ext.Msg.alert('系统提醒', "请上传有效的Excel文档！");
                                }
                            }
                        }
                    }
                });
                let formPanel = Ext.create('Ext.form.FormPanel', {
                    url: serverUrl,
                    method: 'POST',
                    margin: '5',
                    fileUpload: true,
                    width: 400,
                    callBacked: false,
                    border: 0,
                    layout: 'column',
                    defaults: {
                        labelWidth: 80,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        emptyText: '请填写'
                    },
                    items: formItems,
                    doSubmit: function () {
                        let form = formPanel.form;
                        if (form.isValid()) {
                            let myMask = new Ext.LoadMask({
                                msg: '正在导入中…',
                                target: uploadWin
                            });
                            myMask.show();
                            form.submit({
                                params: params,
                                success: function (form, action) {
                                    myMask.destroy();
                                    Ext.Msg.alert('系统提醒', action.result.message, function () {
                                        FastExt.Base.runCallBack(resolve, action.result);
                                        uploadWin.close();
                                    });
                                },
                                failure: function (form, action) {
                                    myMask.destroy();
                                    if (action.result) {
                                        Ext.Msg.alert('系统提醒', "导入失败！" + action.result.message);
                                    }
                                }
                            });
                        }
                    },
                    listeners: {
                        'render': function (obj) {
                            try {
                                new Ext.util.KeyMap({
                                    target: obj.getEl(),
                                    key: 13,
                                    fn: formPanel.doSubmit,
                                    scope: Ext.getBody()
                                });
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });
                let btnSubmitId = "btnSubmit" + new Date().getTime();
                let uploadWin = Ext.create('Ext.window.Window', {
                    title: "导入Excel数据",
                    layout: 'fit',
                    resizable: false,
                    scrollable: false,
                    items: [formPanel],
                    modal: true,
                    iconCls: 'extIcon extUpload',
                    animateTarget: obj,
                    constrain: true,
                    buttons: [
                        {
                            text: '重置',
                            width: 88,
                            iconCls: 'extIcon extReset',
                            handler: function () {
                                if (formPanel.form) {
                                    formPanel.form.reset();
                                }
                            }
                        },
                        {
                            text: '上传',
                            width: 88,
                            id: btnSubmitId,
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                formPanel.doSubmit();
                            }
                        }],
                    listeners: {
                        show: function (winObj, eOpts) {
                            if (formItems.length === 1) {
                                formPanel.getForm().findField('file').fileInputEl.dom.click();
                                Ext.getCmp(btnSubmitId).focus();
                            }
                        }
                    }
                });
                uploadWin.show();
            });
        }


        /**
         * 下载实体数据
         * @param grid
         */
        static downDataGrid(grid: any) {
            if (!grid.getStore().entity) {
                Ext.Msg.alert('系统提醒', '下载失败！Grid的DataStore未绑定Entity!');
                return;
            }
            let message = "您确定下载当前条件下的所有数据吗？";
            let data = grid.getSelection();
            if (data.length > 0) {
                message = "您确定下载选中的" + data.length + "条数据吗？";
            } else if (grid.getStore().getTotalCount() === 0) {
                FastExt.Dialog.toast("当前页面暂无数据！");
                return;
            }

            if (!grid.getStore().entity) {
                FastExt.Dialog.toast("当前列表不支持此功能！");
                return;
            }

            Ext.Msg.confirm("系统提醒", message, function (button, text) {
                if (button === "yes") {
                    let params: any = {};
                    if (grid.getStore().entity) {
                        params.title = grid.getStore().entity.comment;
                    }

                    if (data.length > 0) {
                        if (!grid.getStore().entity.idProperty) {
                            FastExt.Dialog.toast("当前列表不支持下载选中数据功能！");
                            return;
                        }
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
                    FastExt.Dialog.showWait("正在下载中……");
                    FastExt.Server.downData(FastExt.Store.mergeStoreParamBySelect(grid.getStore(), params), function (success, message, data) {
                        FastExt.Dialog.hideWait();
                        if (success) {
                            FastExt.Dialog.toast(message);
                            location.href = "attach/" + data;
                        } else {
                            Ext.Msg.alert('系统提醒', message);
                        }
                    });
                }
            });
        }


        /**
         * 上传实体数据
         * @param obj
         * @param params 接口参数
         */
        static loadDataGrid(obj: any, params: any) {
            return new Ext.Promise(function (resolve, reject) {
                let formPanel = Ext.create('Ext.form.FormPanel', {
                    url: FastExt.Server.loadEntityDataUrl(),
                    method: 'POST',
                    margin: '5',
                    fileUpload: true,
                    width: 400,
                    callBacked: false,
                    border: 0,
                    layout: 'column',
                    defaults: {
                        labelWidth: 80,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        emptyText: '请填写'
                    },
                    items: [{
                        xtype: 'filefield',
                        fieldLabel: '数据文件',
                        buttonText: '选择文件',
                        allowBlank: false,
                        name: 'file',
                        columnWidth: 1,
                        listeners: {
                            change: function (obj, value, eOpts) {
                                if (value != null && value.length != 0) {
                                    if (!FastExt.FileModule.data().match(value)) {
                                        if (formPanel.form) {
                                            formPanel.form.reset();
                                        }
                                        Ext.Msg.alert('系统提醒', "请上传有效的数据文件！");
                                    }
                                }
                            }
                        }
                    }],
                    doSubmit: function () {
                        let form = formPanel.form;
                        if (form.isValid()) {
                            let myMask = new Ext.LoadMask({
                                msg: '正在上传中…',
                                target: uploadWin
                            });
                            myMask.show();
                            form.submit({
                                params: params,
                                success: function (form, action) {
                                    myMask.destroy();
                                    Ext.Msg.alert('系统提醒', action.result.message, function () {
                                        FastExt.Base.runCallBack(resolve, action.result);
                                        uploadWin.close();
                                    });
                                },
                                failure: function (form, action) {
                                    myMask.destroy();
                                    if (action.result) {
                                        Ext.Msg.alert('系统提醒', "上传失败！" + action.result.message);
                                    }
                                }
                            });
                        }
                    },
                    listeners: {
                        'render': function (obj) {
                            try {
                                new Ext.util.KeyMap({
                                    target: obj.getEl(),
                                    key: 13,
                                    fn: formPanel.doSubmit,
                                    scope: Ext.getBody()
                                });
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });
                let btnSubmitId = "btnSubmit" + new Date().getTime();
                let uploadWin = Ext.create('Ext.window.Window', {
                    title: "上传实体数据",
                    layout: 'fit',
                    resizable: false,
                    scrollable: false,
                    items: [formPanel],
                    modal: true,
                    iconCls: 'extIcon extUpload',
                    animateTarget: obj,
                    constrain: true,
                    buttons: [
                        {
                            text: '重置',
                            width: 88,
                            iconCls: 'extIcon extReset',
                            handler: function () {
                                if (formPanel.form) {
                                    formPanel.form.reset();
                                }
                            }
                        },
                        {
                            text: '上传',
                            width: 88,
                            id: btnSubmitId,
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                formPanel.doSubmit();
                            }
                        }],
                    listeners: {
                        show: function (winObj, eOpts) {
                            formPanel.getForm().findField('file').fileInputEl.dom.click();
                            Ext.getCmp(btnSubmitId).focus();
                        }
                    }
                });
                uploadWin.show();
            });
        }


        /**
         * 保存Grid的列表配置
         * @param grid
         * @return Ext.Promise
         */
        static saveGridColumn(grid: any) {
            if (Ext.isEmpty(grid.code)) {
                return FastExt.Base.getEmptyPromise();
            }
            if (!grid) {
                return;
            }
            return new Ext.Promise(function (resolve, reject) {
                try {
                    let params = {
                        "noneManager": true,//存一份公共的列信息
                    };
                    let hasGetColumnRender = false, hasGetEditorField = false;

                    if (grid.getStore() && grid.getStore().entity) {
                        hasGetColumnRender = Ext.isFunction(grid.getStore().entity.getColumnRender);
                        hasGetEditorField = Ext.isFunction(grid.getStore().entity.getEditorField);

                        if (FastExt.Base.toBool(grid.menuPanelList, false)) {//左侧主菜单
                            params["entityCode"] = grid.getStore().entity.entityCode;
                        }

                        //来自系统初始化时的操作，
                        if (FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                            params["entityCode"] = grid.getStore().entity.entityCode;
                        }

                        //非主要的管理界面，不重复记录Grid的列
                        if (!FastExt.Base.toBool(grid.mainEntityList, true)) {
                            delete params["entityCode"];
                        }

                        //如果grid配置指定了entityCode，则使用指定的entityCode
                        if (grid.columnEntityCode) {
                            params["entityCode"] = grid.columnEntityCode;
                        }
                    }


                    let columnInfos = {};
                    Ext.each(grid.getColumns(), function (column, index) {
                        if (Ext.isEmpty(column.dataIndex)) {
                            if (column.xtype === "rownumberer") {
                                let columnInfo = {};
                                columnInfo["width"] = column.width;
                                columnInfo["text"] = column.configText;
                                columnInfos["rownumberer"] = columnInfo;
                            }
                            return;
                        }

                        if (!FastExt.System.ManagerHandler.isSuperRole()) {
                            if (!column.hideable && column.hidden) {
                                //没有权限的列或者不需要显示的列
                                return;
                            }
                        }
                        let columnInfo = {column: true};
                        columnInfo["width"] = column.width;
                        columnInfo["hidden"] = column.isHidden();
                        columnInfo["locked"] = column.isLocked();
                        columnInfo["text"] = column.configText;
                        columnInfo["dataIndex"] = column.dataIndex;
                        columnInfo["columnName"] = column.columnName;
                        columnInfo["align"] = column.align;
                        columnInfo["groupHeaderText"] = column.groupHeaderText;
                        columnInfo["detailsable"] = column.detailsable;
                        if (column.groupHeaderText && column.ownerCt.componentCls === "x-column-header") {
                            if (column.ownerCt.isHidden()) {
                                columnInfo["hidden"] = true;
                            }
                        }
                        if (grid.getStore().entity) {
                            columnInfo["entityCode"] = grid.getStore().entityCode;
                        }
                        let sortConfig = grid.getStore().getSorters().getByKey(column.dataIndex);
                        if (sortConfig) {
                            columnInfo["sortDirection"] = sortConfig.getDirection();
                        }
                        columnInfo["searchLink"] = column.searchLink;
                        columnInfo["searchExclude"] = column.searchExclude;
                        columnInfo["index"] = column.getIndex();

                        columnInfo["canEdit"] = grid.checkEditor() && FastExt.Base.toBool(column.editable, true);
                        columnInfo["version"] = FastExt.Base.toString(grid.columnsVersion, "1");

                        if (!hasGetColumnRender) {
                            //兼容老版本
                            columnInfo["rendererFunction"] = column.rendererFunction;
                            let cacheRender = FastExt.Renders.getRenderFunStr(column);
                            if (cacheRender && Ext.isEmpty(columnInfo["rendererFunction"])) {
                                columnInfo["rendererFunction"] = cacheRender;
                            }
                        }
                        if (!hasGetEditorField) {
                            //兼容老版本
                            if (grid.checkEditor() && FastExt.Base.toBool(column.editable, true)) {
                                columnInfo["editorField"] = FastExt.Grid.getColumnSimpleEditorJson(column);
                            } else {
                                columnInfo["editorField"] = "";
                            }
                        }
                        columnInfos[column.code] = columnInfo;

                    });

                    columnInfos["PageTool"] = {
                        pageSize: grid.getStore().pageSize,
                        column: false
                    };


                    FastExt.Server.saveExtConfig(grid.code, "GridColumn", Ext.encode(columnInfos), function (success, message) {
                        resolve(success);
                    }, params);
                } catch (e) {
                    reject(e);
                }
            });
        }


        /**
         * 保存Grid中含有 bindDetail:true 属性的可点击的按钮
         * @param grid
         * @param entity
         */
        static saveGridButton(grid: any, entity: any) {
            if (Ext.isEmpty(grid.code)) {
                return FastExt.Base.getEmptyPromise();
            }
            if (Ext.isEmpty(entity)) {
                return FastExt.Base.getEmptyPromise();
            }
            if (!FastExt.Base.toBool(grid.menuPanelList, false)) {
                return FastExt.Base.getEmptyPromise();
            }
            return new Ext.Promise(function (resolve, reject) {
                try {
                    let buttonInfos = [];
                    Ext.each(grid.bindDetailButtons, function (button, index) {
                        let buttonInfo = {};
                        buttonInfo["text"] = button.text;
                        buttonInfo["iconCls"] = button.iconCls;
                        buttonInfo["icon"] = button.icon;
                        buttonInfo["handler"] = button.handler.toString();
                        buttonInfos.push(buttonInfo);
                    });

                    let params = {
                        "entityCode": entity.entityCode
                    };
                    FastExt.Server.saveExtConfig(entity.entityCode, "GridButton", Ext.encode(buttonInfos), function (success, message) {
                        resolve(success);
                    }, params);
                } catch (e) {
                    reject(e);
                }
            });
        }


        /**
         * 获取grid配置的button
         * @param entityCode
         */
        static restoreGridButton(entityCode: string) {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    FastExt.Server.showExtConfig(entityCode, "GridButton", function (success, value) {
                        let buttonInfos = [];
                        if (success) {
                            buttonInfos = Ext.decode(value);
                        }
                        resolve(buttonInfos);
                    });
                } catch (e) {
                    reject(e);
                }
            });

        }

        /**
         * 还原Grid保存的列配置
         * @param grid
         */
        static restoreGridColumn(grid: any) {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    if (Ext.isEmpty(grid.code)) {
                        reject("Grid编号[code]不可为空！");
                        return;
                    }
                    if (!grid) {
                        return;
                    }
                    FastExt.Server.showExtConfig(grid.code, "GridColumn", function (success, value) {
                        if (!grid) {
                            return;
                        }
                        let columnInfos = {};
                        if (success) {
                            columnInfos = Ext.decode(value);
                        }

                        let rownumberer = columnInfos["rownumberer"];

                        let newColumns = [];
                        let newGroupColumns = {};
                        let sorts = [];
                        let configColumns = grid.getColumns();

                        let idProperties = [];

                        if (grid.getStore() !== null && grid.getStore().entity) {
                            idProperties = grid.getStore().entity.idProperty;
                        }


                        for (let i = 0; i < configColumns.length; i++) {
                            let column = configColumns[i];
                            if (column.xtype === "checkcolumn") {
                                continue;
                            }

                            if (rownumberer && column.xtype === "rownumberer") {
                                if (parseInt(column["width"]) > 0) {
                                    column["width"] = rownumberer.width;
                                }
                                continue;
                            }

                            if (FastExt.Base.toBool(grid.power, true)) {
                                if (!column.hideable && column.hidden) {
                                    //没有权限的列或者不需要显示的列
                                    continue;
                                }
                            }

                            let newColumn = column.cloneConfig();
                            newColumn["restoreConfig"] = true;
                            newColumn["groupHeaderText"] = column.groupHeaderText;
                            newColumn["index"] = i;

                            if (FastExt.System.ConfigHandler.isGridColumnRestore()) {
                                if (columnInfos.hasOwnProperty(column.code)) {
                                    let info = columnInfos[column.code];
                                    for (let key in info) {
                                        if (key === "renderer" || key === "rendererFunction") {
                                            continue;
                                        }
                                        newColumn[key] = info[key];
                                    }
                                }
                            }

                            if (!Ext.isEmpty(newColumn.sortDirection) && !Ext.isEmpty(column.dataIndex)) {
                                sorts.push({
                                    property: newColumn.dataIndex,
                                    direction: newColumn.sortDirection.toUpperCase(),
                                });
                            }
                            if (!Ext.isEmpty(newColumn["groupHeaderText"])) {
                                let groupHeaderText = newColumn["groupHeaderText"];
                                if (!newGroupColumns.hasOwnProperty(groupHeaderText)) {
                                    newGroupColumns[groupHeaderText] = [];
                                }
                                newGroupColumns[groupHeaderText].push(newColumns.length)
                            }


                            if (FastExt.System.ConfigHandler.isGridIDColumnHidden() && idProperties && !Ext.isEmpty(column.dataIndex)) {
                                for (let j = 0; j < idProperties.length; j++) {
                                    let idName = idProperties[j];
                                    if (newColumn.dataIndex === idName) {
                                        newColumn["hidden"] = true;
                                    }
                                }
                            }

                            //当记录的列版本与grid配置的版本不一致时，顺序以代码配置为准
                            if (FastExt.Base.toString(newColumn.version, "1") !== FastExt.Base.toString(grid.columnsVersion, "1")) {
                                newColumn["index"] = i;
                            }

                            newColumns.push(newColumn);
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
                            waitRemove = waitRemove.concat(columns);
                        }
                        for (let i = 0; i < waitRemove.length; i++) {
                            newColumns = Ext.Array.remove(newColumns, waitRemove[i]);
                        }
                        let hasFlex = false;
                        newColumns.sort(function (a, b) {
                            hasFlex = !Ext.isEmpty(a.flex) || !Ext.isEmpty(b.flex);
                            return a.index - b.index;
                        });

                        if (columnInfos.hasOwnProperty("PageTool")) {
                            let pageTool = columnInfos["PageTool"];
                            grid.getStore().pageSize = Math.min(pageTool.pageSize, FastExt.Store.maxPageSize);
                            let comboPage = grid.down("combo[pageTool=true]");
                            if (comboPage) {
                                comboPage.setValue(Math.min(pageTool.pageSize, FastExt.Store.maxPageSize));
                            }
                        }
                        if (!FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                            grid.getStore().sort(sorts);
                        }

                        //在最后一列追加占位列
                        let lastColumn = {xtype: 'rowplaceholder', minWidth: 30};
                        if (!hasFlex) {
                            lastColumn["flex"] = 1;
                        }
                        newColumns.push(lastColumn);

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
        static restoreGridOperate(grid: any) {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    if (Ext.isEmpty(grid.code)) {
                        reject("Grid编号[code]不可为空！");
                        return;
                    }
                    FastExt.Server.showExtConfig(grid.code, "GridOperate", function (success, value) {
                        let cacheOperate = {};
                        if (success) {
                            cacheOperate = Ext.decode(value);
                        }
                        if (!grid) {
                            return
                        }

                        if (!cacheOperate.hasOwnProperty("showRowNumber") && FastExt.Grid.checkConfigGridNumberColumn(grid)) {
                            cacheOperate["showRowNumber"] = true;
                        }

                        if (!grid.operate) {
                            grid.operate = new GridOperate();
                        }
                        grid.operate = FastExt.Json.mergeJson(new GridOperate(), grid.operate);

                        grid.operate = FastExt.Json.mergeJson(grid.operate, cacheOperate);

                        resolve();
                    });
                } catch (e) {
                    reject(e);
                }
            });
        }


        /**
         * 获取Column所在的Grid对象
         * @param column
         */
        static getColumnGrid(column: any) {
            if (!column.grid) {
                column.grid = column.up("treepanel,grid");
            }
            if (column.grid.ownerGrid) {
                return column.grid.ownerGrid;
            }
            return column.grid;
        }

        /**
         * 获取Ext.grid.header.Container所在的Grid对象
         * @param ct Ext.grid.header.Container对象
         */
        static getHeaderContainerGrid(ct: any) {
            if (!ct.grid) {
                ct.grid = ct.up("treepanel,grid");
            }
            if (ct.grid.ownerGrid) {
                return ct.grid.ownerGrid;
            }
            return null;
        }


        /**
         * 计算列并显示结果
         * @param grid gri的对象
         * @param column 列对象
         * @param type 计算方式
         * @see {@link FastEnum.ComputeType}
         */
        static showColumnCompute(grid: any, column: any, type?: FastEnum.ComputeType) {
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

                let params = {
                    "entityCode": grid.getStore().entity.entityCode,
                    "field": column.dataIndex,
                    "type": type,
                    "storeId": grid.getStore().getStoreCode()
                };

                FastExt.Dialog.showWait("正在计算中……");
                $.post(FastExt.Server.computeUrl(), params, function (result) {
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
         * @return editor {}
         */
        static getColumnSimpleEditor(column: any, search?: boolean): any {
            try {
                let editor: any = {};
                if (Ext.isObject(column.field)) {
                    editor.xtype = column.field.xtype;
                } else if (Ext.isString(column.field)) {
                    editor.xtype = column.field;
                } else {
                    editor.xtype = "textfield";
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
                        || FastExt.Form.isFileField(column.field)
                        || FastExt.Form.isFilesField(column.field)
                        || FastExt.Form.isMonacoEditorField(column.field)) {
                        editor.xtype = "textfield";
                    }

                    if (FastExt.Form.isPCAField(column.field)) {
                        editor.selectType = 1;
                        if (column.text.indexOf("省") >= 0) {
                            editor.level = 1;
                        }
                        if (column.text.indexOf("市") >= 0) {
                            editor.level = 2;
                        }
                        if (column.text.indexOf("区") >= 0) {
                            editor.level = 3;
                        }
                    }
                }
                if (Ext.isEmpty(editor.xtype)) {
                    editor.xtype = "textfield";
                }
                editor.dataIndex = column.dataIndex;
                if (search) {
                    editor.columnSearchField = true;
                }
                return editor;
            } catch (e) {
                console.error(e);
            }
            return null;

        }

        /**
         * 获取列的编辑控件json字符串
         * @param column 列对象
         * @param search 列的搜索对象json
         */
        static getColumnSimpleEditorJson(column: any, search?: boolean): string {
            let columnSimpleEditor = FastExt.Grid.getColumnSimpleEditor(column, search);
            if (columnSimpleEditor) {
                return FastExt.Json.objectToJsonUnsafe(columnSimpleEditor);
            }
            return null;
        }


        /**
         * 弹出批量编辑列数的菜单
         * @param column
         */
        static showBatchEditColumnMenu(column: any) {
            let editorField: any = Ext.create(column.getConfigField());
            if (!editorField) {
                FastExt.Dialog.toast("无编辑权限（E-4）！")
                return;
            }
            editorField.flex = 1;
            editorField.emptyText = "请输入";

            let putRecord = function (fieldObj) {
                if (!Ext.isEmpty(fieldObj.getValue())) {
                    let columnGrid = FastExt.Grid.getColumnGrid(column);
                    let store = columnGrid.getStore();
                    if (!store) {
                        return;
                    }
                    store.holdUpdate = true;
                    let selectData = columnGrid.getSelectionModel().getSelection();
                    if (selectData.length > 0) {
                        Ext.each(selectData, function (record, index) {
                            FastExt.Store.setRecordValue(record, column.dataIndex, fieldObj);
                        });
                    } else {
                        store.each(function (record, index) {
                            FastExt.Store.setRecordValue(record, column.dataIndex, fieldObj);
                        });
                    }
                    store.holdUpdate = false;
                    store.fireEvent("endupdate");

                }
            };
            let placeholder = "批量修改当前页的【" + column.configText + "】数据";
            if (FastExt.Grid.getColumnGrid(column).getSelection().length > 0) {
                placeholder = "批量修改选择的" + FastExt.Grid.getColumnGrid(column).getSelection().length + "条【" + column.configText + "】数据";
            }

            if (Ext.isFunction(editorField.setEmptyText)) {
                editorField.setEmptyText(placeholder);
            }
            editorField.editable = true;

            if (Ext.isFunction(editorField.showWindow)) {
                editorField.showWindow(column, function (result) {
                    putRecord(result);
                }, placeholder);
                return;
            }
            if (!column.batchEditMenu) {
                column.batchEditMenu = Ext.create('Ext.menu.Menu', {
                    showSeparator: false,
                    scrollToHidden: true,
                    layout: 'fit',
                    shadow: false,
                    editorMenu: true,
                    modal: true,
                    doUpdate: function () {
                        let me = this;
                        let fieldObj = me.items.get(0).items.get(0);
                        if (!fieldObj) {
                            return;
                        }
                        if (!fieldObj.isValid()) {
                            FastExt.Component.shakeComment(me);
                            FastExt.Dialog.toast(FastExt.Form.getFieldError(fieldObj)[0]);
                            return;
                        }
                        let btn = this.down("button[name='confirm']");
                        btn.setText("稍等");
                        btn.setDisabled(true);
                        new Ext.Promise(function (resolve, reject) {
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
                            xtype: 'container',
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
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
                                    iconCls: "extIcon extOk",
                                    margin: '0 0 0 2',
                                    height: FastExt.Form.getFieldMinHeight(false),
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
                        }
                    }
                });

                column.batchEditMenu.addCls("edit-menu");
                column.batchEditMenu.addCls("edit-details-menu");
            }
            column.batchEditMenu.setWidth(Math.max(column.getWidth(), 225));
            column.batchEditMenu.setHeight(column.getHeight());

            // let yOffset = ((FastExt.Form.getFieldMinHeight(true) + 2) - FastExt.Grid.getRowMinHeight()) / 2;
            column.batchEditMenu.showBy(column, "tl");
        }

        /**
         * 弹出批量更新列数的窗体
         * @param column
         */
        static showBatchUpdateColumnWindow(column: any) {
            let editorField: any = Ext.create(column.getConfigField());
            if (!editorField) {
                FastExt.Dialog.toast("无编辑权限（E-5）！");
                return;
            }
            editorField.flex = 1;
            editorField.emptyText = "请输入";
            editorField.editable = true;

            let grid = FastExt.Grid.getColumnGrid(column);
            let store = grid.getStore();
            let message = "批量更新【" + column.configText + "】，当前条件下共" + store.getTotalCount() + "条数据。";

            let doUpdate = function (win, fieldName, fieldValue) {
                FastExt.Dialog.showWait("正在更新中，请稍后……");
                let params = {"entityCode": store.entity.entityCode, "storeId": store.getStoreCode()};
                params["menu"] = store.entity.comment;
                params["field"] = fieldName;
                params["fieldValue"] = fieldValue;
                FastExt.Server.updateDBEntity(params, function (success, message) {
                    FastExt.Dialog.hideWait();
                    if (success) {
                        FastExt.Dialog.toast(message);
                        store.reload();
                        if (win) {
                            win.close();
                        }
                    } else {
                        FastExt.Dialog.showAlert("系统提醒", message);
                    }
                });
            };

            if (Ext.isFunction(editorField.showWindow)) {
                editorField.showWindow(column, function (result) {
                    FastExt.Dialog.showConfirm("系统提醒", "将批量更新数据，此更新是永久性且无法撤销！请您确认！", function (button) {
                        if (button === "yes") {
                            doUpdate(null, FastExt.Entity.getRealAttr(column), result.getValue());
                        }
                    });
                }, message);
                return;
            }
            editorField.columnWidth = 1;
            editorField.dataField = true;

            let formPanel = Ext.create('Ext.form.FormPanel', {
                bodyPadding: 5,
                region: 'center',
                border: 0,
                defaults: {
                    margin: '5 5 5 5'
                },
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    editorField,
                    {
                        xtype: "checkboxfield",
                        height: 50,
                        boxLabel: message + "<b style='color:red;'>我已了解此更新是永久性且无法撤销 ！</b>",
                        listeners: {
                            change: function (obj, newValue) {
                                batchEditWin.down("#updateBtn").setDisabled(!newValue);
                            }
                        }
                    }
                ]
            });

            let batchEditWin = Ext.create('Ext.window.Window', {
                title: "批量更新数据",
                subtitle: "v3",
                iconCls: 'extIcon extEdit',
                width: 450,
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'stretch'
                },
                items: [formPanel],
                modal: true,
                constrain: true,
                resizable: false,
                unpin: false,
                buttons: [
                    "->",
                    {
                        text: '取消',
                        iconCls: 'extIcon extClose',
                        handler: function () {
                            batchEditWin.close();
                        }
                    },
                    {
                        text: '立即更新',
                        itemId: 'updateBtn',
                        disabled: true,
                        iconCls: 'extIcon extOk whiteColor',
                        handler: function () {
                            let fieldName = FastExt.Entity.getRealAttr(column);
                            let dataField = formPanel.down("[dataField=true]");
                            if (dataField) {
                                doUpdate(batchEditWin, fieldName, dataField.getValue());
                            }
                        }
                    }]
            });
            batchEditWin.show();
        }

        /**
         * 批量替换列的字符数据
         * @param column
         */
        static showBatchReplaceColumnWindow(column: any) {

            let grid = FastExt.Grid.getColumnGrid(column);
            let store = grid.getStore();
            let message = "批量替换【" + column.configText + "】，当前条件下共" + store.getTotalCount() + "条数据。";


            let formPanel = Ext.create('Ext.form.FormPanel', {
                bodyPadding: 5,
                region: 'center',
                autoScroll: true,
                border: 0,
                defaults: {
                    margin: '5 5 5 5',
                    labelWidth: 80,
                    labelAlign: 'right',
                },
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    {
                        name: "replace",
                        xtype: "textfield",
                        fieldLabel: "替换的字符",
                        columnWidth: 1,
                        allowBlank: false
                    },
                    {
                        name: "toValue",
                        xtype: "textfield",
                        fieldLabel: "新的字符",
                        columnWidth: 1,
                        allowBlank: false
                    },
                    {
                        xtype: "checkboxfield",
                        boxLabel: message + "<b style='color:red;'>我已了解此替换是永久性且无法撤销 ！</b>",
                        height: 50,
                        listeners: {
                            change: function (obj, newValue) {
                                batchReplaceWin.down("#updateBtn").setDisabled(!newValue);
                            },
                        }
                    }
                ]
            });

            let batchReplaceWin = Ext.create('Ext.window.Window', {
                title: "批量替换数据",
                iconCls: 'extIcon extEdit',
                width: 450,
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'stretch'
                },
                items: [formPanel],
                modal: true,
                constrain: true,
                resizable: false,
                unpin: false,
                doUpdate: function (params: any) {
                    let me = this;
                    FastExt.Dialog.showWait("正在替换中，请稍后……");
                    params["entityCode"] = store.entity.entityCode;
                    params["storeId"] = store.getStoreCode();
                    params["menu"] = store.entity.comment;
                    params["field"] = FastExt.Entity.getRealAttr(column);
                    FastExt.Server.replaceDBEntity(params, function (success, message) {
                        FastExt.Dialog.hideWait();
                        if (success) {
                            FastExt.Dialog.toast(message);
                            store.reload();
                            me.close();
                        } else {
                            FastExt.Dialog.showAlert("系统提醒", message);
                        }
                    });
                },
                buttons: [
                    "->",
                    {
                        text: '取消',
                        iconCls: 'extIcon extClose',
                        handler: function () {
                            batchReplaceWin.close();
                        }
                    },
                    {
                        text: '立即替换',
                        itemId: 'updateBtn',
                        disabled: true,
                        iconCls: 'extIcon extOk whiteColor',
                        handler: function () {
                            batchReplaceWin.doUpdate(formPanel.getValues());
                        }
                    }]
            });
            batchReplaceWin.show();
        }


        /**
         * 弹出批量随机列值窗体
         * @param column
         */
        static showBatchEditColumnRandomWindow(column: any) {
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
            let title = "批量随机生成当前页的【" + column.configText + "】列数据";
            if (FastExt.Grid.getColumnGrid(column).getSelection().length > 0) {
                title = "批量随机生成选择的" + FastExt.Grid.getColumnGrid(column).getSelection().length + "条【" + column.configText + "】列数据";
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
                    let minDateStr = Ext.getCmp(idCode + "_minDate").getValue();
                    let minDate = Ext.Date.parse(minDateStr, FastExt.Base.guessDateFormat(minDateStr));
                    let maxDateStr = Ext.getCmp(idCode + "_maxDate").getValue();
                    let maxDate = Ext.Date.parse(maxDateStr, FastExt.Base.guessDateFormat(maxDateStr));
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
                let columnGrid = FastExt.Grid.getColumnGrid(column);
                let store = columnGrid.getStore();
                if (valueArray.length === 0 || !store) {
                    return;
                }
                store.holdUpdate = true;
                let selectData = columnGrid.getSelectionModel().getSelection();
                if (selectData.length > 0) {
                    Ext.each(selectData, function (record, index) {
                        if (Ext.isObject(valueArray[index])) {
                            FastExt.Store.setRecordValue(record, column.dataIndex, valueArray[index]);
                        } else {
                            record.set(column.dataIndex, valueArray[index]);
                        }
                    });
                } else {
                    store.each(function (record, index) {
                        if (Ext.isObject(valueArray[index])) {
                            FastExt.Store.setRecordValue(record, column.dataIndex, valueArray[index]);
                        } else {
                            record.set(column.dataIndex, valueArray[index]);
                        }
                    });
                }
                store.holdUpdate = false;
                store.fireEvent("endupdate");
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
         * 刷新列的状态样式，例如：正序、倒序、搜索等
         * @param column
         */
        static refreshColumnStyle(column: any) {
            try {
                if (!Ext.isEmpty(column.dataIndex)) {
                    let sortDirection = column.sortDirection;
                    if (Ext.isEmpty(sortDirection)) {
                        sortDirection = "<font size='1'></font>";
                    } else {
                        if (sortDirection === "ASC") {
                            sortDirection = "<span  style=\"color: " + FastExt.Grid.operateWarnColor + "; font-size: xx-small; \">&nbsp;&nbsp;[正序]</span>"
                        } else {
                            sortDirection = "<span  style=\"color: " + FastExt.Grid.operateWarnColor + "; font-size: xx-small; \">&nbsp;&nbsp;[倒序]</span>"
                        }
                    }
                    if (Ext.isEmpty(column.sumText)) {
                        column.sumText = "<font size='1'></font>";
                    }
                    if (column.searching) {
                        column.setText(FastExt.Base.getSVGIcon("extSearch") + "&nbsp;" + column.configText + column.sumText + sortDirection + "&nbsp;");
                        column.setStyle('color', FastExt.Grid.operateWarnColor);
                    } else {
                        column.setText("&nbsp;" + column.configText + column.sumText + sortDirection + "&nbsp;");
                        column.setStyle('color', '#000000');
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
        static checkColumnSort(grid: any) {
            try {
                let hasSort = grid.getStore().getSorters().length > 0;
                let pagingToolBar = grid.child('#pagingToolBar');
                if (pagingToolBar) {
                    let sortBtn = pagingToolBar.down("button[toolType=sortBtn]");
                    if (hasSort) {
                        sortBtn.setIconCls("extIcon extSort redColor");
                        sortBtn.setUserCls("redBorder");
                    } else {
                        sortBtn.setIconCls("extIcon extSort grayColor");
                        sortBtn.setUserCls("");
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 检查Grid数据选择器配置，将刷新Grid底部选择器按钮的样式
         * @param grid
         */
        static checkHistoryConfig(grid: any) {
            let pagingToolBar = grid.child('#pagingToolBar');
            if (pagingToolBar) {
                let selectHistoryBtn = pagingToolBar.down("button[toolType=selectHistoryBtn]");
                if (selectHistoryBtn) {
                    if (parseInt(grid.selectHistoryConfig["state"]) === 1) {
                        selectHistoryBtn.setIconCls(selectHistoryBtn.baseIconCls + " redColor");
                        selectHistoryBtn.setUserCls("redBorder");
                    } else {
                        selectHistoryBtn.setIconCls(selectHistoryBtn.baseIconCls + " grayColor");
                        selectHistoryBtn.setUserCls("");
                    }
                }
            }
        }

        /**
         * 配置列的扩展属性或方法
         * @param column
         */
        static configColumnProperty(column: any) {
            try {
                column.configText = column.text;
                column.toSearchKey = function (where: any, i: number) {
                    return "colWhere['@" + this.getIndex() + FastExt.Base.toString(where.link, "&") + this.dataIndex + where.compare + ":index" + i + "']";
                };
                column.containsSearchWhere = function (where) {
                    let me = this;
                    if (!me.where) {
                        me.where = [];
                    }
                    for (let itemWhere of me.where) {
                        if (itemWhere.link === where.link
                            && itemWhere.compare === where.compare
                            && itemWhere.value === where.value) {
                            return true;
                        }
                    }
                    return false;
                };
                column.searchValue = function (value) {
                    let me = this;
                    if (!me.where) {
                        me.where = [];
                    }
                    let where = {
                        link: '&',
                        compare: '=',
                        value: value
                    };
                    if (me.containsSearchWhere(where)) {
                        return;
                    }
                    me.where.push(where);
                    me.doSearch();
                };
                column.getRenderCacheKey = function () {
                    let me = this;
                    return $.md5(FastExt.Grid.getColumnGrid(me).code + "-" + me.dataIndex + "-render");
                };
                column.clearSearch = function () {
                    let me = this;
                    let storeParams = FastExt.Grid.getColumnGrid(me).getStore().proxy.extraParams;
                    if (me.where) {
                        let waitRemove = [];
                        for (let storeParamsKey in storeParams) {
                            if (storeParamsKey.indexOf("colWhere") >= 0 && storeParamsKey.indexOf(me.dataIndex) >= 0) {
                                waitRemove.push(storeParamsKey);
                            }
                        }
                        for (let i = 0; i < waitRemove.length; i++) {
                            delete storeParams[waitRemove[i]];//删除搜索记录
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
                        let fulltextSearch = false;
                        for (let i = 0; i < me.where.length; i++) {
                            let itemWhere = me.where[i];
                            if (Ext.isEmpty(itemWhere.link)) {
                                itemWhere.link = '&';
                            }
                            if (Ext.isEmpty(itemWhere.compare) || Ext.isEmpty(itemWhere.value)) {
                                continue;
                            }
                            let key = me.toSearchKey(itemWhere, i);
                            let value = itemWhere.value;
                            if (itemWhere.compare.indexOf('?') >= 0) {
                                value = '%' + itemWhere.value + '%';
                            }
                            if (itemWhere.compare === "??") {
                                //使用全文搜索
                                value = itemWhere.value;
                                fulltextSearch = true;
                            }
                            storeParams[key] = value;
                        }

                        //使用全文搜索，清空排序
                        if (fulltextSearch) {
                            FastExt.Grid.clearColumnSort(FastExt.Grid.getColumnGrid(me));
                            FastExt.Grid.checkColumnSort(FastExt.Grid.getColumnGrid(me));
                        }

                        storeParams["colWhere['^" + me.dataIndex + "@SearchExclude']"] = me.searchExclude;
                        if (FastExt.Base.toBool(requestServer, true)) {
                            FastExt.Grid.getColumnGrid(me).getStore().loadPage(1);
                        }
                        me.searching = me.where.length !== 0;
                        FastExt.Grid.refreshColumnStyle(me);
                    }
                };
                column.setAlignContent = function (align) {
                    let columnId = this.getId();
                    let cellEls = $("[data-columnid=" + columnId + "]");
                    for (let i = 0; i < cellEls.length; i++) {
                        $(cellEls[i]).children().css("text-align", align);
                    }
                    this.align = align;
                    FastExt.Grid.getColumnGrid(this).saveUIConfig(true);
                };

                //获取列配置的编辑对象，为了兼容新版本的wrapConfig方法和老版本配置
                column.getConfigField = function () {
                    let configField = column.configField;
                    if (Ext.isEmpty(configField)) {
                        configField = column.field;
                    }
                    if (Ext.isEmpty(configField)) {
                        configField = {
                            xtype: "textfield",
                        };
                    }
                    if (Ext.isObject(configField)) {
                        if (Ext.isEmpty(configField.xtype)) {
                            configField.xtype = "textfield";
                        }
                    }
                    return configField;
                };

                if (column.where && column.where.length > 0) {
                    column.doSearch(false);
                }
                if (column.isSubHeader) {
                    column.groupHeaderText = column.ownerCt.text;
                } else {
                    column.groupHeaderText = null;
                }
                if (Ext.isEmpty(column.field)) {
                    column.editable = false;
                }
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 配置列的默认相关的事件功能
         * @param column
         */
        static configColumnListener(column: any) {
            // try {
            //     column.on("blur", function (obj, event, eOpts) {
            //         // if (obj.searchMenu) {
            //         //     obj.searchMenu.hide();
            //         // }
            //     });
            // } catch (e) {
            //     console.error(e);
            // }
        }

        /**
         * 获取搜索列的输入组件
         * @param column
         * @param where 搜索条件，默认 { compare: '=',value: ''}
         */
        static buildSearchItem2(column: any, where?: any): any {
            try {
                let fulltextColumn = false;
                let grid = FastExt.Grid.getColumnGrid(column);
                if (grid && grid.getStore() && grid.getStore().entity) {
                    fulltextColumn = FastExt.Entity.isFulltextColumn(grid.getStore().entity.entityCode, column.dataIndex);
                }

                let editorField = FastExt.Grid.getColumnSimpleEditor(column, true);
                if (!editorField) {
                    return;
                }
                editorField.useHistory = true;
                editorField.code = column.dataIndex;
                editorField.fromHeadSearch = true;
                editorField.validator = null;
                editorField.flex = 1;
                editorField.margin = '2 0 0 0';
                editorField.repeatTriggerClick = false;
                editorField.onClearValue = function () {
                    let parent = this.up("container");
                    if (Ext.isFunction(parent.removeSearch)) {
                        parent.removeSearch();
                        return;
                    }
                    parent.destroy();
                };
                editorField.triggers = {
                    close: {
                        cls: 'text-clear',
                        hideOnReadOnly: false,
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
                        link: '&',
                        compare: '=',
                        value: ''
                    };
                    if (FastExt.Form.isTextField(editorField) || FastExt.Form.isLinkField(editorField)
                        || FastExt.Form.isMapField(editorField)
                        || FastExt.Form.isHtmlContentField(editorField)
                        || FastExt.Form.isContentField(editorField)) {
                        where.compare = '?';
                    }
                    if (fulltextColumn) {
                        where.compare = '??';
                    }
                    if (FastExt.Form.isDateField(editorField)) {
                        where.compare = '>=';
                    }
                }
                let dataType = {
                    full: fulltextColumn,
                    date: FastExt.Form.isDateField(editorField),
                };

                editorField.value = where.value;
                editorField.submitValue = false;
                editorField.name = "value";
                editorField.itemId = "editorField";
                editorField.strict = where.compare.indexOf(">") >= 0 || where.compare.indexOf("<") >= 0 || where.compare.indexOf("=") >= 0;
                editorField.grid = grid;

                return {
                    xtype: 'container',
                    margin: '0',
                    searchItem: true,
                    border: 0,
                    flex: 1,
                    region: 'center',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    toParam: function () {
                        let params = {};
                        this.items.each(function (item) {
                            if (Ext.isFunction(item.getValue)) {
                                let validate = true;
                                if (Ext.isFunction(item.validate)) {
                                    validate = item.validate();
                                } else if (Ext.isFunction(item.isValid)) {
                                    validate = item.isValid();
                                }
                                if (validate) {
                                    if (Ext.isDate(item.getValue())) {
                                        params[item.getName()] = Ext.Date.format(item.getValue(), item.format)
                                    } else {
                                        params[item.getName()] = item.getValue();
                                    }
                                } else {
                                    FastExt.Component.shakeComment(item);
                                    FastExt.Dialog.toast(FastExt.Form.getFieldError(item)[0]);
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
                                } else if (item.getName() === 'link') {
                                    item.setValue(where.link);
                                } else {
                                    item.setValue(where.value);
                                }
                            }
                        });
                    },
                    refreshField: function () {
                        let compareValue = this.getComponent("compare").getValue();
                        let field = this.getComponent("editorField");
                        if (!field) {
                            return;
                        }
                        if (field.rendered) {
                            if (Ext.isFunction(field.setReadOnlyAttr)) {
                                field.setReadOnlyAttr(false);
                            }
                            if (compareValue == "~" || compareValue == "!~") {
                                field.setValue("<NULL>")
                                if (Ext.isFunction(field.setReadOnlyAttr)) {
                                    field.setReadOnlyAttr(true);
                                }
                            } else if (compareValue == "#" || compareValue == "!#") {
                                field.setValue("<REPEAT>")
                                if (Ext.isFunction(field.setReadOnlyAttr)) {
                                    field.setReadOnlyAttr(true);
                                }
                            }
                        }
                    },
                    getSearchField: function () {
                        return this.getComponent("editorField");
                    },
                    items: [
                        {
                            xtype: 'combo',
                            name: 'link',
                            value: FastExt.Base.toString(where.link, "&"),
                            margin: '2 2 0 0',
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
                            store: FastExt.Store.getCompareLinkDataStore()
                        },
                        {
                            xtype: 'combo',
                            name: 'compare',
                            value: where.compare,
                            itemId: "compare",
                            margin: '2 2 0 0',
                            width: 65,
                            valueField: 'text',
                            displayField: "desc",
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
                                },
                                change: function (obj, newValue, oldValue) {
                                    let field = obj.ownerCt.getComponent("editorField");
                                    if (oldValue == "~" || oldValue == "!~" || oldValue == "#" || oldValue == "!#") {
                                        field.setValue(null);
                                    }
                                    if (newValue.indexOf(">") >= 0 || newValue.indexOf("<") >= 0 || newValue.indexOf("=") >= 0) {
                                        field.strict = true;
                                    } else {
                                        field.strict = false;
                                    }
                                    obj.ownerCt.refreshField();
                                }
                            },
                            store: FastExt.Store.getCompareDataStore(dataType)
                        },
                        editorField
                    ],
                    listeners: {
                        afterrender: function (obj, eOpts) {
                            obj.refreshField();
                        }
                    }
                };
            } catch (e) {
                console.error(e);
            }
            return null;
        }

        static buildSearchItem(column: any, where?: any): any {
            try {
                let fulltextColumn = false;
                let grid = FastExt.Grid.getColumnGrid(column);
                if (grid && grid.getStore() && grid.getStore().entity) {
                    fulltextColumn = FastExt.Entity.isFulltextColumn(grid.getStore().entity.entityCode, column.dataIndex);
                }

                let editorField = FastExt.Grid.getColumnSimpleEditor(column, true);
                if (!editorField) {
                    return;
                }
                editorField.useHistory = true;
                editorField.code = column.dataIndex;
                editorField.fromHeadSearch = true;
                editorField.validator = null;
                editorField.flex = 1;
                // editorField.margin = '2 0 0 0';
                editorField.repeatTriggerClick = false;
                editorField.onClearValue = function () {
                    let parent = this.up("container");
                    if (Ext.isFunction(parent.removeSearch)) {
                        parent.removeSearch();
                        return;
                    }
                    FastExt.Animate.startCloseAnimateByHeight(parent);
                    // parent.destroy();
                };
                editorField.triggers = {
                    close: {
                        cls: 'text-clear',
                        weight: 99,//最右边
                        hideOnReadOnly: false,
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

                if (!where) {
                    where = {
                        link: '&',
                        compare: '=',
                        value: ''
                    };
                    if (FastExt.Form.isTextField(editorField) || FastExt.Form.isLinkField(editorField)
                        || FastExt.Form.isMapField(editorField)
                        || FastExt.Form.isHtmlContentField(editorField)
                        || FastExt.Form.isContentField(editorField)) {
                        where.compare = '?';
                    }
                    if (fulltextColumn) {
                        where.compare = '??';
                    }
                    if (FastExt.Form.isDateField(editorField)) {
                        where.compare = '>=';
                    }
                }
                let dataType = {
                    full: fulltextColumn,
                    date: FastExt.Form.isDateField(editorField),
                };

                editorField.value = where.value;
                editorField.submitValue = false;
                editorField.param = true;
                editorField.name = "value";
                editorField.itemId = "editorField";
                editorField.strict = where.compare.indexOf(">") >= 0 || where.compare.indexOf("<") >= 0 || where.compare.indexOf("=") >= 0;
                editorField.grid = grid;

                return {
                    xtype: 'fieldset',
                    margin: '0 0 3 0',
                    title: '',
                    searchItem: true,
                    flex: 1,
                    region: 'center',
                    padding: '6 6 6 6',
                    defaults: {
                        columnWidth: 1,
                        margin: '3 3 3 3',
                    },
                    layout: {
                        type: 'vbox',
                        pack: 'center',
                        align: 'stretch'
                    },
                    getParamItems: function () {
                        return this.query("[param=true]");
                    },
                    toParam: function () {
                        let params = {};
                        let items = this.getParamItems();
                        for (let item of items) {
                            if (Ext.isFunction(item.getValue)) {
                                let validate = true;
                                if (Ext.isFunction(item.validate)) {
                                    validate = item.validate();
                                } else if (Ext.isFunction(item.isValid)) {
                                    validate = item.isValid();
                                }
                                if (validate) {
                                    if (Ext.isDate(item.getValue())) {
                                        params[item.getName()] = Ext.Date.format(item.getValue(), item.format)
                                    } else {
                                        params[item.getName()] = item.getValue();
                                    }
                                } else {
                                    FastExt.Component.shakeComment(item);
                                    FastExt.Dialog.toast(FastExt.Form.getFieldError(item)[0]);
                                    return null;
                                }
                            }
                        }
                        return params;
                    },
                    setParam: function (where) {
                        let items = this.getParamItems();
                        for (let item of items) {
                            if (Ext.isFunction(item.getValue)) {
                                if (item.getName() === 'compare') {
                                    item.setValue(where.compare);
                                } else if (item.getName() === 'link') {
                                    item.setValue(where.link);
                                } else {
                                    item.setValue(where.value);
                                }
                            }
                        }
                    },
                    refreshField: function () {
                        let field = this.down("#editorField");
                        if (!field) {
                            return;
                        }

                        let matchType = this.down("#matchType");

                        let link = this.down("#link");
                        let linkDisplayValue = link.getDisplayValue();

                        let compare = this.down("#compare");
                        let compareValue = compare.getValue();
                        let compareDisplayValue = compare.getDisplayValue();

                        matchType.setTitle(linkDisplayValue + "_" + compareDisplayValue);

                        if (field.rendered) {
                            FastExt.Component.simpleReadOnly(field, false);
                            if (compareValue == "~" || compareValue == "!~") {
                                field.setValue("<NULL>")
                                FastExt.Component.simpleReadOnly(field, true);
                            } else if (compareValue == "#" || compareValue == "!#") {
                                field.setValue("<REPEAT>")
                                FastExt.Component.simpleReadOnly(field, true);
                            }
                        }
                    },
                    getSearchField: function () {
                        return this.down("#editorField");
                    },
                    items: [
                        {
                            xtype: 'fieldset',
                            title: '匹配方式',
                            collapsible: true,
                            collapsed: true,
                            layout: "column",
                            itemId: "matchType",
                            padding: '6 6 6 6',
                            defaults: {
                                columnWidth: 1,
                                margin: '3 3 3 3',
                            },
                            items: [
                                {
                                    xtype: 'container',
                                    layout: {
                                        type: 'hbox',
                                        pack: 'center',
                                        align: 'stretch'
                                    },
                                    items: [
                                        {
                                            xtype: 'combo',
                                            name: 'link',
                                            itemId: "link",
                                            margin: '0 6 0 0',
                                            value: FastExt.Base.toString(where.link, "&"),
                                            param: true,
                                            flex: 1,
                                            valueField: 'text',
                                            displayField: "desc",
                                            editable: false,
                                            hideTrigger: false,
                                            tpl: Ext.create('Ext.XTemplate',
                                                '<ul class="x-list-plain"><tpl for=".">',
                                                '<li role="option" class="x-boundlist-item" style="font-size: 12px;">{desc}</li>',
                                                '</tpl></ul>'
                                            ),
                                            listeners: {
                                                change: function (obj, newValue, oldValue) {
                                                    obj.up("[searchItem=true]").refreshField();
                                                }
                                            },
                                            store: FastExt.Store.getCompareLinkDataStore()
                                        },
                                        {
                                            xtype: 'combo',
                                            name: 'compare',
                                            value: where.compare,
                                            flex: 1,
                                            itemId: "compare",
                                            param: true,
                                            valueField: 'text',
                                            displayField: "desc",
                                            editable: false,
                                            hideTrigger: false,
                                            tpl: Ext.create('Ext.XTemplate',
                                                '<ul class="x-list-plain"><tpl for=".">',
                                                '<li role="option" class="x-boundlist-item" style="font-size: 12px;">{desc}</li>',
                                                '</tpl></ul>'
                                            ),
                                            listeners: {
                                                change: function (obj, newValue, oldValue) {
                                                    let searchItem = obj.up("[searchItem=true]");
                                                    let field = searchItem.getComponent("editorField");
                                                    if (oldValue == "~" || oldValue == "!~" || oldValue == "#" || oldValue == "!#") {
                                                        field.setValue(null);
                                                    }
                                                    if (newValue.indexOf(">") >= 0 || newValue.indexOf("<") >= 0 || newValue.indexOf("=") >= 0) {
                                                        field.strict = true;
                                                    } else {
                                                        field.strict = false;
                                                    }
                                                    searchItem.refreshField();
                                                }
                                            },
                                            store: FastExt.Store.getCompareDataStore(dataType)
                                        }
                                    ]
                                },
                            ]
                        },
                        editorField
                    ],
                    listeners: {
                        afterrender: function (obj, eOpts) {
                            obj.refreshField();
                        }
                    }
                };
            } catch (e) {
                console.error(e);
            }
            return null;
        }

        /**
         * 检查column是否可以进行搜索
         * @param column
         */
        static canColumnSearch(column: any) {
            if (FastExt.Grid.getColumnGrid(column).xtype === "") {

            }
            if (!FastExt.Base.toBool(FastExt.Grid.getColumnGrid(column).columnSearch, true)) {
                return false;
            }
            if (FastExt.Grid.isFilesColumn(column)
                || FastExt.Grid.isFileColumn(column)) {
                return FastExt.Base.toBool(column.search, false) || FastExt.Base.toBool(column.searchable, false);
            }

            if (!FastExt.Base.toBool(column.search, true)) {
                return false;
            }
            if (!FastExt.Base.toBool(column.searchable, true)) {
                return false;
            }
            if (FastExt.Base.toBool(column["encrypt"], false)) {
                return false;
            }
            return true;
        }

        /**
         * 弹出列的搜索菜单
         * @param column
         */
        static showColumnSearchMenu(column: any) {
            try {
                if (!FastExt.Grid.canColumnSearch(column)) {
                    return false;
                }
                column.searchMenu = Ext.create('Ext.menu.Menu', {
                    padding: FastExt.Grid.columnSearchMenuPadding,
                    power: false,
                    showSeparator: false,
                    columnSearchMenu: true,
                    editorMenu: true,
                    scrollToHidden: true,
                    style: {
                        background: "#ffffff"
                    },
                    fixedItemCount: 2,
                    addSearchItem: function (where?) {
                        let index = this.items.length - this.fixedItemCount;
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
                            xtype: 'container',
                            layout: 'fit',
                            margin: '5',
                            border: 0,
                            hidden: true,
                            itemId: 'configSearch',
                            items: [
                                {
                                    xtype: 'fieldset',
                                    title: '配置搜索忽略的字符',
                                    layout: "column",
                                    margin: '0',
                                    items: [
                                        {
                                            xtype: 'textfield',
                                            labelAlign: 'right',
                                            columnWidth: 1,
                                            itemId: 'searchExclude',
                                            value: column.searchExclude,
                                            name: 'searchExclude',
                                            emptyText: '请输入字符',
                                            listeners: {
                                                change: function (obj, newValue, oldValue, eOpts) {
                                                    column.searchExclude = newValue;
                                                }
                                            }
                                        }
                                    ]
                                }]
                        },
                        {
                            xtype: 'container',
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            margin: FastExt.Grid.columnSearchMenuPadding + ' 0 0 0',
                            border: 0,
                            items: [
                                {
                                    xtype: 'button',
                                    iconCls: 'extIcon extSet fontSize14',
                                    contextMenu: false,
                                    hidden: true,
                                    handler: function () {
                                        let configPanel = this.ownerCt.ownerCt.getComponent("configSearch");
                                        configPanel.setHidden(!configPanel.isHidden());
                                    }
                                },
                                {
                                    xtype: 'button',
                                    text: '搜索',
                                    flex: 1,
                                    contextMenu: false,
                                    iconCls: 'extIcon extSearch',
                                    margin: '0 ' + FastExt.Grid.columnSearchMenuPadding + ' 0 0',
                                    handler: function () {
                                        this.ownerCt.ownerCt.doSearch();
                                        FastExt.Grid.saveGridColumn(FastExt.Grid.getColumnGrid(column));
                                    }
                                },
                                {
                                    xtype: 'button',
                                    iconCls: 'extIcon extPlus fontSize14',
                                    contextMenu: false,
                                    handler: function () {
                                        this.ownerCt.ownerCt.addSearchItem();
                                    }
                                }]
                        }],
                    listeners: {
                        show: function (obj, epts) {
                            column.addCls("x-column-header-open");
                            if (obj.items.length === obj.fixedItemCount) {
                                obj.addSearchItem();
                            }
                            let searchExclude = obj.down("#searchExclude");
                            if (searchExclude) {
                                searchExclude.setValue(column.searchExclude);
                            }

                            let searchIndex = 0;
                            obj.items.each(function (item, index) {
                                if (Ext.isFunction(item.getSearchField)) {
                                    let searchField = item.getSearchField();
                                    if (searchField.hasListener("beforeedit")) {
                                        searchField.fireEvent("beforeedit", searchField, searchIndex);
                                    }
                                    searchIndex++;
                                }
                            });

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
                        },
                        hide: function (obj, epts) {
                            delete column.searchMenu;
                            column.removeCls("x-column-header-open");
                            obj.close();
                        }
                    }
                });
                if (column.where) {
                    for (let i = 0; i < column.where.length; i++) {
                        let where = column.where[i];
                        if (Ext.isEmpty(where.index)) {
                            where.index = i;
                        }
                        if (where.index < column.searchMenu.items.length - column.searchMenu.fixedItemCount) {
                            column.searchMenu.items.getAt(where.index).setParam(where);
                        } else {
                            column.searchMenu.addSearchItem(where);
                        }
                    }
                }

                column.searchMenu.addCls("header-search-menu");
                column.searchMenu.setWidth(Math.max(parseInt(column.getWidth()), 358));
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
        static showColumnSearchWin(obj: any, grid: any) {
            if (!obj.searchWin) {
                let store = FastExt.Store.getGridColumnStore(grid, true);
                let buildItem = function (paramData: any, paramWhere?: any) {
                    return {
                        xtype: 'fieldset',
                        title: '字段搜索',
                        layout: {
                            type: 'vbox',
                            pack: 'center',
                            align: 'stretch'
                        },
                        defaults: {
                            columnWidth: 1,
                            margin: '3 3 3 3',
                        },
                        padding: '10 10 10 10',
                        margin: '5 5 5 5',
                        setInputField: function (columnRecord: any, columnWhere?: any) {
                            if (this.items.getCount() > 1) {
                                this.remove(this.items.get(1), true);
                            }
                            let inputItem: any = FastExt.Grid.buildSearchItem(FastExt.Grid.getColumn(grid, columnRecord.get("id"), columnRecord.get("text")), columnWhere);
                            inputItem.removeSearch = function () {
                                let searchContainer = this.up("container");
                                if (searchContainer) {
                                    FastExt.Animate.startCloseAnimateByHeight(searchContainer);
                                }
                            };
                            this.insert(1, inputItem);
                        },
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
                                valueField: 'id',
                                displayField: 'text',
                                margin: '0 0 5 0',
                                value: paramData.get("id"),
                                editable: false,
                                listeners: {
                                    change: function (obj, newValue, oldValue, eOpts) {
                                        let parent = this.up("container");
                                        let data = obj.getStore().findRecord("id", newValue, 0, false, false, true);
                                        parent.setInputField(data);
                                    }
                                },
                                store: store
                            }
                        ],
                        listeners: {
                            afterrender: function (obj) {
                                obj.setInputField(paramData, paramWhere);
                            }
                        }
                    };
                };

                let defaultItems = grid.searchItems;
                if (!defaultItems) {
                    defaultItems = [];
                }

                let formPanel = Ext.create('Ext.form.FormPanel', {
                    border: 0,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    scrollable: true,
                    padding: 0,
                    defaults: {
                        labelWidth: 80,
                        labelAlign: 'right',
                        emptyText: '请填写'
                    },
                    items: defaultItems,
                });

                let winSize = FastExt.Grid.getGridInWindowSize(grid, 0.4, 0.5);

                obj.searchWin = Ext.create('Ext.window.Window', {
                    title: '搜索数据',
                    layout: 'fit',
                    constrain: true,
                    iconCls: 'extIcon extSearch',
                    resizable: true,
                    minHeight: 200,
                    minWidth: 400,
                    height: winSize.height,
                    width: winSize.width,
                    animateTarget: obj,
                    items: [formPanel],
                    refreshSearchItem: function (addDefaultItem) {
                        if (!store) {
                            return;
                        }
                        if (!grid) {
                            return;
                        }
                        formPanel.removeAll();
                        let columns = grid.getColumns();
                        for (let i = 0; i < columns.length; i++) {
                            let item = columns[i];
                            if (item.where) {
                                let data = store.findRecord("id", item.dataIndex, 0, false, false, true);
                                if (data) {
                                    for (let i = 0; i < item.where.length; i++) {
                                        formPanel.add(buildItem(data, item.where[i]));
                                    }
                                }
                            }
                        }
                        if (formPanel.items.length === 0 && store.getCount() > 0 && addDefaultItem) {
                            formPanel.add(buildItem(store.getAt(0)));
                        }
                    },
                    listeners: {
                        close: function (panel, eOpts) {
                            if (obj.searchWin.gridLoad) {
                                obj.searchWin.gridLoad.destroy();
                            }
                            if (store) {
                                store.destroy();
                            }
                            obj.searchWin = null;
                        }
                    },
                    buttons: [
                        {
                            text: '清空条件',
                            iconCls: 'extIcon extClear whiteColor',
                            handler: function () {
                                formPanel.removeAll();
                                if (!grid) {
                                    return;
                                }
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
                                if (!grid) {
                                    return;
                                }
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

                obj.searchWin.gridLoad = grid.on('load', function () {
                    try {
                        obj.searchWin.refreshSearchItem(false);
                    } catch (e) {
                        console.error(e);
                    }
                }, this, {destroyable: true});

                obj.searchWin.refreshSearchItem(true);

                grid.ownerCt.add(obj.searchWin);
            } else {
                FastExt.Component.shakeComment(obj.searchWin);
            }
            obj.searchWin.show();
        }


        /**
         * 获取Grid的分页控件
         * @param dataStore
         */
        static getPageToolBar(dataStore: any): any {
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
                overflowHandler: 'scroller'
            });

            let control = {
                xtype: 'combo',
                pageTool: true,
                displayField: 'text',
                valueField: 'id',
                editable: false,
                width: 100,
                value: Math.min(dataStore.pageSize, FastExt.Store.maxPageSize),
                store: FastExt.Store.getPageDataStore(),
                listeners: {
                    change: function (obj, newValue, oldValue) {
                        if (FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                            return;
                        }
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

                            if (dataStore.grid) {
                                dataStore.grid.saveUIConfig(true);
                            }
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
                checkAddPower: true,//检查是否有添加权限
                checkCopyPower: true,
                handler: function () {
                    let selection = dataStore.grid.getSelection();
                    if (selection.length === 0) {
                        FastExt.Dialog.showAlert("系统提醒", "请选择需要复制的数据！");
                        return;
                    }
                    Ext.Msg.confirm("系统提醒", "您确定复制选中的" + selection.length + "条数据吗？", function (button, text) {
                        if (button === "yes") {
                            FastExt.Dialog.showWait("正在复制数据中……");
                            FastExt.Store.commitStoreCopy(dataStore.grid.getStore(), selection).then(function (success) {
                                if (success) {
                                    dataStore.grid.getSelectionModel().deselectAll();
                                    let grouped = dataStore.grid.getStore().isGrouped();
                                    if (grouped) {
                                        FastExt.Grid.getGridView(dataStore.grid).getFeature('group').collapseAll();
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
                checkDeleteAllPower: true,
                checkDeletePower: true,
                iconCls: 'extIcon extClear grayColor',
                handler: function () {
                    if (dataStore.getTotalCount() === 0) {
                        FastExt.Dialog.toast("当前页面暂无数据！");
                        return;
                    }

                    let menuText = FastExt.Store.getStoreMenuText(dataStore.grid.getStore());
                    let confirmFunction = function () {
                        FastExt.LoginLayout.validOperate("清空【" + menuText + "】数据", function () {
                            FastExt.Dialog.showWait("正在清空数据中……");
                            let params = {
                                "entityCode": dataStore.entity.entityCode,
                                "all": true,
                                "storeId": dataStore.getStoreCode()
                            };
                            params["menu"] = dataStore.entity.comment;
                            FastExt.Server.deleteEntity(params, function (success, message) {
                                FastExt.Dialog.hideWait();
                                if (success) {
                                    dataStore.loadPage(1);
                                }
                                FastExt.Dialog.showAlert("系统提醒", message);
                            });
                        }, 30);
                    };


                    let formPanel = Ext.create('Ext.form.FormPanel', {
                        bodyPadding: 10,
                        method: 'POST',
                        region: 'center',
                        layout: {
                            type: 'vbox',
                            pack: 'center',
                            align: 'middle'
                        },
                        defaults: {
                            margin: '5 5 5 5'
                        },
                        border: 0,
                        items: [
                            {
                                xtype: "lottie",
                                width: 150,
                                height: 120,
                                jsonPath: 'base/lottie/amazed.json',
                            },
                            {
                                xtype: "label",
                                text: "【【 请您谨慎操作 】】",
                            },
                            {
                                xtype: "label",
                                text: "您确定清空当前条件下的" + dataStore.getTotalCount() + "条数据吗？",
                            },
                            {
                                xtype: "label",
                                text: "当前操作页面《" + menuText + "》",
                            },
                            {
                                xtype: "checkboxfield",
                                boxLabel: "<b style='color:red;'>我已了解此操作是永久性且无法撤销</b>",
                                listeners: {
                                    change: function (obj, newValue) {
                                        clearConfirmWindow.down("#deleteBtn").setDisabled(!newValue);
                                    },
                                }
                            }]
                    });

                    let clearConfirmWindow = Ext.create('Ext.window.Window', {
                        title: '清空数据',
                        iconCls: 'extIcon extClear',
                        layout: {
                            type: 'vbox',
                            pack: 'center',
                            align: 'middle'
                        },
                        constrain: true,
                        resizable: false,
                        cls: 'fast-red-window',
                        items: [formPanel],
                        modal: true,
                        buttons: [
                            '->',
                            {
                                text: '取消',
                                iconCls: 'extIcon extClose',
                                handler: function () {
                                    clearConfirmWindow.close();
                                }
                            },
                            {
                                text: '清空',
                                itemId: "deleteBtn",
                                disabled: true,
                                iconCls: 'extIcon extOk',
                                handler: function () {
                                    confirmFunction();
                                    clearConfirmWindow.close();
                                }
                            },
                            '->'
                        ],
                        listeners: {
                            show: function (obj) {
                                FastExt.Component.shakeComment(obj);
                            },
                        }
                    });
                    clearConfirmWindow.show();
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
                baseIconCls: 'extIcon extAlarm',
                handler: function () {
                    FastExt.Grid.showTimerRefreshGrid(this, dataStore.grid);
                }
            };

            let reportBtn = {
                xtype: 'button',
                toolType: 'reportBtn',
                tooltip: '图表查看',
                iconCls: 'extIcon extReport grayColor',
                handler: function () {
                    FastExt.Grid.showEChartConfigWin(this, dataStore.grid);
                }
            };

            let selectHistoryBtn = {
                xtype: 'button',
                toolType: 'selectHistoryBtn',
                tooltip: '数据选择器',
                iconCls: 'extIcon extSelect grayColor',
                baseIconCls: 'extIcon extSelect',
                handler: function () {
                    FastExt.Grid.showSelectRecordHistory(this, dataStore.grid);
                }
            }

            pagingtoolbar.insert(0, control);
            pagingtoolbar.insert(0, {
                xtype: 'label',
                text: '每页',
                margin: '0 10 0 10'
            });

            let refreshBtn = pagingtoolbar.child("#refresh");
            let beginIndex = pagingtoolbar.items.indexOf(refreshBtn);

            if (dataStore.entity && FastExt.Base.toBool(dataStore.entity.actionTimer, true)) {
                pagingtoolbar.insert(++beginIndex, timerBtn);
            }

            pagingtoolbar.insert(++beginIndex, "-");
            pagingtoolbar.insert(++beginIndex, searchBtn);
            pagingtoolbar.insert(++beginIndex, sortBtn);
            pagingtoolbar.insert(++beginIndex, selectHistoryBtn);

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

            pagingtoolbar.insert(++beginIndex, "-");


            if (!fromRecycle) {
                if (dataStore.entity && FastExt.Base.toBool(dataStore.entity.actionCopy, true)) {
                    pagingtoolbar.insert(++beginIndex, copyBtn);
                }
            }

            if (dataStore.entity && FastExt.Base.toBool(dataStore.entity.actionDeleteAll, true)
                && FastExt.System.ManagerHandler.isSuperRole()) {
                pagingtoolbar.insert(++beginIndex, deleteAllBtn);
            }


            if (dataStore.entity && !Ext.isEmpty(dataStore.entity["echartsDate"])) {
                pagingtoolbar.insert(++beginIndex, "-");
                pagingtoolbar.insert(++beginIndex, reportBtn);
            }

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
        static showRecycleGrid(obj: any, dataStore: any) {
            if (!dataStore) {
                return;
            }
            let title = "回收站";
            if (dataStore.entity) {
                title = dataStore.entity.comment + "-回收站";
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
        static rebackGridData(grid: any) {
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
                                FastExt.Grid.getGridView(grid).getFeature('group').collapseAll();
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
         * 配置列排序的窗体
         * @param obj 动画对象
         * @param grid grid对象
         */
        static showColumnSortWin(obj: any, grid: any) {
            if (!obj.sortWin) {
                let store = FastExt.Store.getGridColumnStore(grid);
                let buildItem = function (data, defaultValue?) {
                    if (!defaultValue) {
                        defaultValue = "ASC";
                    }
                    return {
                        xtype: 'container',
                        flex: 1,
                        columnWidth: 1,
                        layout: 'hbox',
                        margin: '0 0 2 0',
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
                                flex: 0.5,
                                margin: '2 0 0 2',
                                value: data.get("id"),
                                displayField: 'text',
                                editable: false,
                                store: store
                            },
                            {
                                xtype: 'combo',
                                flex: 0.5,
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
                            }
                        ]
                    };
                };
                let formPanel = Ext.create('Ext.form.FormPanel', {
                    margin: '5',
                    border: 0,
                    layout: 'column',
                    width: 460,
                    scrollable: true,
                    defaults: {
                        labelWidth: 80,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        emptyText: '请填写'
                    },
                    items: [],
                });

                let winSize = FastExt.Grid.getGridInWindowSize(grid);

                obj.sortWin = Ext.create('Ext.window.Window', {
                    title: '排序数据',
                    layout: 'fit',
                    constrain: true,
                    iconCls: 'extIcon extSort',
                    resizable: true,
                    minHeight: 200,
                    minWidth: 400,
                    height: winSize.height,
                    width: winSize.width,
                    animateTarget: obj,
                    items: [formPanel],
                    refreshSortItem: function (addDefault) {
                        formPanel.removeAll();
                        grid.getStore().getSorters().each(function (item) {
                            let data = store.findRecord("id", item.getProperty(), 0, false, false, true);
                            if (data) {
                                formPanel.add(buildItem(data, item.getDirection()));
                            }
                        });
                        if (formPanel.items.length === 0 && addDefault) {
                            formPanel.add(buildItem(store.getAt(0), "NONE"));
                        }
                    },
                    listeners: {
                        close: function (panel, eOpts) {
                            if (obj.sortWin.gridLoad) {
                                obj.sortWin.gridLoad.destroy();
                            }
                            if (store) {
                                store.destroy();
                            }
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
                                FastExt.Grid.clearColumnSort(grid);

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

                obj.sortWin.gridLoad = grid.on('load', function () {
                    try {
                        obj.sortWin.refreshSortItem(false);
                    } catch (e) {
                        console.error(e);
                    }
                }, this, {destroyable: true});
                obj.sortWin.refreshSortItem(true);
                grid.ownerCt.add(obj.sortWin);
            } else {
                FastExt.Component.shakeComment(obj.sortWin);
            }
            obj.sortWin.show();
        }


        /**
         * 清空排序的column
         * @param grid
         */
        static clearColumnSort(grid: any) {
            let sortCollection = grid.getStore().getSorters();
            sortCollection.clear();
            if (!grid) {
                return;
            }
            Ext.each(grid.getColumns(), function (item) {
                item.sortDirection = null;
                FastExt.Grid.refreshColumnStyle(item);
            });
        }

        /**
         * 弹出定时刷新Grid数据的窗体
         * @param obj 动画对象
         * @param grid grid对象
         */
        static showTimerRefreshGrid(obj: any, grid: any) {
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
                            xtype: 'combo',
                            name: 'silence',
                            displayField: 'text',
                            valueField: 'id',
                            fieldLabel: '静默刷新',
                            editable: false,
                            flex: 1,
                            columnWidth: 1,
                            value: 0,
                            allowBlank: false,
                            bind: '{silence}',
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

                let winSize = FastExt.Grid.getGridInWindowSize(grid);

                obj.timerWin = Ext.create('Ext.window.Window', {
                    title: '定时刷新数据',
                    layout: 'fit',
                    constrain: true,
                    iconCls: 'extIcon extAlarm',
                    resizable: true,
                    minHeight: 200,
                    minWidth: 400,
                    height: winSize.height,
                    width: winSize.width,
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
                                    grid.checkRefreshTimer(true);
                                    obj.timerWin.close();
                                }
                            }
                        }]
                });
                grid.ownerCt.add(obj.timerWin);
            } else {
                FastExt.Component.shakeComment(obj.timerWin);
            }
            obj.timerWin.show();
        }


        /**
         * 配置图表的窗体
         * @param obj 动画对象
         * @param grid grid对象
         */
        static showEChartConfigWin(obj: any, grid: any) {
            if (!obj.reportWin) {
                let columnStore = FastExt.Store.getChartGridColumnStore(grid);
                let buildItem = function (data, defaultValue?) {
                    if (!defaultValue) {
                        defaultValue = "count";
                    }
                    return {
                        xtype: 'container',
                        flex: 1,
                        columnWidth: 1,
                        layout: 'hbox',
                        margin: '0 0 2 0',
                        border: 0,
                        toParam: function () {
                            let param = {};
                            let combo = this.items.get(0);
                            param["property"] = combo.getValue();
                            let functionItem = this.items.get(1);
                            param["function"] = functionItem.getValue();
                            param["details"] = combo.getDisplayValue() + "【" + functionItem.getDisplayValue() + "】";
                            return param;
                        },
                        items: [
                            {
                                xtype: 'combo',
                                region: 'west',
                                valueField: 'id',
                                flex: 0.5,
                                margin: '2 0 0 2',
                                value: data.get("id"),
                                displayField: 'text',
                                editable: false,
                                store: columnStore
                            },
                            {
                                xtype: 'combo',
                                flex: 0.5,
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
                                            'text': '计数',
                                            'value': 'count'
                                        },
                                        {
                                            'text': '平均值',
                                            "value": 'avg'
                                        },
                                        {
                                            'text': '求和',
                                            "value": 'sum'
                                        }, {
                                            'text': '最大值',
                                            "value": 'max'
                                        }, {
                                            'text': '最小值',
                                            "value": 'min'
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

                obj.reportWin = Ext.create('Ext.window.Window', {
                    title: '图表查看',
                    layout: 'fit',
                    constrain: true,
                    iconCls: 'extIcon extReport',
                    resizable: true,
                    minHeight: 200,
                    minWidth: 400,
                    height: 200,
                    animateTarget: obj,
                    items: [formPanel],
                    listeners: {
                        close: function (panel, eOpts) {
                            obj.reportWin = null;
                        },
                        show: function (win) {
                            win.setLoading("请稍后……");
                            FastExt.Server.showExtConfig(grid.getStore().entity.entityCode, "EChartsColumn",
                                function (success, data, message) {
                                    if (success) {
                                        let toParams = FastExt.Json.jsonToObject(data);
                                        for (let i = 0; i < toParams.length; i++) {
                                            let toParam = toParams[i];
                                            let data = columnStore.findRecord("id", toParam["property"], 0, false, false, true);
                                            if (data) {
                                                formPanel.add(buildItem(data, toParam["function"]));
                                            }
                                        }
                                    }
                                    win.setLoading(false);
                                    if (formPanel.items.length === 0) {
                                        formPanel.add(buildItem(columnStore.getAt(0), "count"));
                                    }
                                });
                        }
                    },
                    buttons: [
                        {
                            text: '添加统计',
                            iconCls: 'extIcon extPlus',
                            handler: function () {
                                formPanel.add(buildItem(columnStore.getAt(0)));
                                let winHeight = 50 + formPanel.items.length * 35 + 55;
                                formPanel.scrollTo(0, winHeight, false);
                            }
                        },
                        {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                let params = {
                                    "entityCode": grid.getStore().entity.entityCode,
                                    "columnDate": grid.getStore().entity.echartsDate,
                                    "storeId": grid.getStore().getStoreCode(),
                                };

                                let toParams = [];
                                formPanel.items.each(function (item, index) {
                                    let toParam = item.toParam();
                                    toParams.push(toParam);
                                    for (let toParamKey in toParam) {
                                        params["echarts[" + index + "]." + toParamKey] = toParam[toParamKey];
                                    }
                                });
                                FastExt.Server.saveExtConfig(grid.getStore().entity.entityCode, "EChartsColumn", FastExt.Json.objectToJson(toParams), function () {
                                });

                                FastExt.ECharts.showEntityECharts(this, grid.getStore().entity.comment + "【图表】", params);
                            }
                        }]
                });
                grid.ownerCt.add(obj.reportWin);
            } else {
                FastExt.Component.shakeComment(obj.reportWin);
            }
            obj.reportWin.show();
        }


        /**
         * 操作删除Grid里选中的数据
         * @param grid
         * @return Ext.Promise
         */
        static deleteGridData(grid: any): any {
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
                                FastExt.Grid.getGridView(grid).getFeature('group').collapseAll();
                            }
                            FastExt.Dialog.hideWait();
                        }
                        resolve(success);
                    });
                };
                if (grid.operate && grid.operate.alertDelete) {
                    FastExt.Dialog.showDeleteDataAlert("确认删除数据", "您确定删除选中的" + selectLength + "条数据吗？", doDelete);
                } else {
                    doDelete();
                }
            });
        }


        /**
         * 操作提交Grid被修改过的数据
         * @param grid
         * @return Ext.Promise
         */
        static updateGridData(grid: any): any {
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
                                FastExt.Dialog.hideWait();
                            });
                        }
                    });
                } else {
                    FastExt.Dialog.showWait("正在修改数据中……");
                    FastExt.Store.commitStoreUpdate(grid.getStore()).then(function (result) {
                        resolve(result);
                        FastExt.Dialog.hideWait();
                    });
                }
            });
        }

        /**
         * 弹出数据的详情窗体，与Grid列表的列属性一致，此方法不做权限限制
         * @param obj 动画对象
         * @param title 详情窗体标题
         * @param entity 实体类对象
         * @param record 单个数据record
         * @param buttons 窗口底部按钮集合
         */
        static showPublicDetailsWindow(obj: any, title:string, entity: any, record: any, buttons?) {
            FastExt.Grid.showDetailsWindow(obj, title, entity, record, buttons, {
                "noneManager": true,
            });
        }

        /**
         * 弹出数据的详情窗体，与Grid列表的列属性一致
         * @param obj 动画对象
         * @param title 详情窗体标题
         * @param entity 实体类对象
         * @param record 单个数据record
         * @param buttons 窗口底部按钮集合
         * @param columnConfig 获取列信息的配置
         */
        static showDetailsWindow(obj: any, title: string, entity: any, record: any, buttons?, columnConfig?) {
            if (!entity) {
                return;
            }
            if (!record) {
                return;
            }

            const onlyValueArray = [entity.code];
            if (entity.idProperty) {
                for (let j = 0; j < entity.idProperty.length; j++) {
                    let idName = entity.idProperty[j];
                    onlyValueArray.push(idName + ":" + record.get(idName));
                }
            }
            if (onlyValueArray.length == 1) {
                onlyValueArray.push(new Date().getTime());
            }
            FastExt.Dialog.showWait("获取配置中……");
            const onlyCode = $.md5(JSON.stringify(onlyValueArray));
            FastExt.Grid.restoreGridButton(entity.entityCode).then(function (buttonInfos) {
                let targetEntityCode = entity.entityCode;
                if (!Ext.isEmpty(record.get("columnEntityCode"))) {
                    targetEntityCode = record.get("columnEntityCode");
                }
                FastExt.Server.showColumns(targetEntityCode, function (success, value, message) {
                    FastExt.Dialog.hideWait();
                    if (success) {
                        let columnInfos = Ext.decode(value);
                        let data = [];
                        let lastGroupNon = 1;
                        let maxNameWidth = 0;
                        for (let key in columnInfos) {
                            if (columnInfos.hasOwnProperty(key)) {
                                let column = columnInfos[key];
                                if (Ext.isEmpty(column.dataIndex)) {
                                    continue;
                                }
                                if (!FastExt.Base.toBool(column.detailsable, true)) {
                                    continue;
                                }
                                let item = {
                                    value: record.get(column.dataIndex),
                                    groupHeaderText: column.groupHeaderText,
                                    record: record,
                                    entity: entity,
                                    configEditor: FastExt.Base.toBool(column["canEdit"]),
                                    dataIndex: column.dataIndex,
                                    columnName: column.columnName,
                                    editor: false
                                };
                                for (let c in column) {
                                    if (column.hasOwnProperty(c)) {
                                        item[c] = column[c];
                                    }
                                }

                                if (!Ext.isEmpty(column["editorField"])) {
                                    let fieldObj = FastExt.Json.jsonToObject(column["editorField"]);
                                    if (fieldObj != null && !Ext.isEmpty(fieldObj.xtype)) {
                                        item.configEditor = true;
                                    }
                                }


                                //实体数据中配置了不允许编辑
                                if (!FastExt.Base.toBool(record.get(column.dataIndex + "Editor"), true)) {
                                    item.configEditor = false;
                                }

                                if (!FastExt.Base.toBool(record.get("__editor"), true)) {
                                    item.configEditor = false;
                                }

                                if (!item.groupHeaderText) {
                                    item.groupHeaderText = lastGroupNon;
                                } else {
                                    lastGroupNon++;
                                }
                                data.push(item);

                                maxNameWidth = Math.max(FastExt.Base.guessTextWidth(item["text"], 5), maxNameWidth);
                            }
                        }
                        data.sort(function (a, b) {
                            return a.index - b.index;
                        });
                        let detailsStore = Ext.create('Ext.data.Store', {
                            fields: [],
                            autoLoad: false,
                            groupField: 'groupHeaderText'
                        });
                        detailsStore.loadData(data);
                        detailsStore.sort('index', 'ASC');

                        let iframePanelArray = Ext.ComponentQuery.query("window[detailsWinId=" + onlyCode + "]");
                        if (iframePanelArray.length > 0) {
                            iframePanelArray[0].getComponent("detailsGrid").setStore(detailsStore);
                            Ext.WindowManager.bringToFront(iframePanelArray[0], true);
                            FastExt.Component.shakeComment(iframePanelArray[0]);
                            return;
                        }

                        let detailsGrid = Ext.create('Ext.grid.Panel', {
                            border: 0,
                            scrollable: 'y',
                            region: 'center',
                            store: detailsStore,
                            itemId: "detailsGrid",
                            cls: "fast-grid-details",
                            hideHeaders: true,
                            features: [{
                                ftype: 'grouping',
                                collapsible: false,
                                hideGroupedHeader: true,
                                expandTip: null,
                                collapseTip: null,
                                groupHeaderTpl: [
                                    '<b>{name:this.formatName}</b>', {
                                        formatName: function (name) {
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
                                    width: maxNameWidth,
                                    tdCls: 'tdVTop',
                                    align: 'right',
                                    renderer: function (val, m, r) {
                                        m.style = FastExt.Grid.detailsGridKeyStyle;
                                        return "<b>" + val + "：</b>";
                                    }
                                },
                                {
                                    header: '值',
                                    dataIndex: 'value',
                                    power: false,
                                    flex: 1,
                                    align: 'left',
                                    renderer: function (val, m, r, rowIndex, colIndex, store, view) {
                                        try {
                                            m.style = FastExt.Grid.detailsGridValueStyle
                                            let realAttr = r.get("columnName");
                                            if (Ext.isEmpty(realAttr)) {
                                                realAttr = r.get("dataIndex");
                                            }
                                            let fun = FastExt.Entity.getColumnRender(entity, realAttr);
                                            if (Ext.isEmpty(fun)) {
                                                let rendererFunction = r.get("rendererFunction");
                                                if (rendererFunction) {
                                                    fun = eval(rendererFunction);
                                                }
                                            }
                                            if (!Ext.isEmpty(fun)) {
                                                val = fun(val, m, r.get("record"), rowIndex, colIndex, store, view, true);
                                            }
                                            if (Ext.isEmpty(val) || val === "null") {
                                                return "<font color='#ccc'>无</font>"
                                            }
                                            return val;
                                        } catch (e) {
                                            return val;
                                        }
                                    }
                                },
                                {
                                    xtype: 'actioncolumn',
                                    width: 80,
                                    sortable: false,
                                    menuDisabled: true,
                                    renderer: function (val, m) {
                                        m.style = FastExt.Grid.detailsGridActionStyle;
                                        return val;
                                    },
                                    items: [
                                        {
                                            iconCls: 'extIcon extEdit editColor marginRight5 textBlackShadowWhite',
                                            tooltip: '编辑数据',
                                            align: 'center',
                                            isDisabled: function (view, rowIndex, colIndex, item, record) {
                                                return !FastExt.Base.toBool(record.get("editor"), false);
                                            },
                                            getClass: function (v, metadata, record) {
                                                if (FastExt.Base.toBool(record.get("editor"), false)) {
                                                    return "extIcon extEdit marginRight5 textBlackShadowWhite";
                                                }
                                                return "";
                                            },
                                            handler: FastExt.Grid.showDetailsEditMenu
                                        }, {
                                            iconCls: 'extIcon extCopy2 searchColor textBlackShadowWhite',
                                            tooltip: '复制数据',
                                            align: 'center',
                                            isDisabled: function (view, rowIndex, colIndex, item, record) {
                                                return !FastExt.Base.toBool(record.get("doCopy"), false);
                                            },
                                            getClass: function (v, metadata, record) {
                                                if (FastExt.Base.toBool(record.get("doCopy"), false)) {
                                                    return "extIcon extCopy2 searchColor textBlackShadowWhite";
                                                }
                                                return "";
                                            },
                                            handler: FastExt.Grid.copyDetailsValue
                                        }]
                                }, {xtype: 'rowplaceholder', minWidth: 30}
                            ],
                            viewConfig: {
                                loadMask: {
                                    msg: '正在为您在加载数据…'
                                },
                                enableTextSelection: true
                            },
                            toggleActionColumn: function (record) {
                                if (this.lasClickRecord) {
                                    if (this.lasClickRecord.getId() === record.getId()) {
                                        return;
                                    }
                                    this.lasClickRecord.set("editor", false);
                                    this.lasClickRecord.set("doCopy", false);
                                }
                                record.set("doCopy", true);
                                record.set("editor", record.get("configEditor"));

                                this.lasClickRecord = record;
                            },
                            listeners: {
                                itemclick: function (obj, record) {
                                    this.toggleActionColumn(record);
                                },
                                select: function (obj, record) {
                                    this.toggleActionColumn(record);
                                },
                            }
                        });
                        if (!buttons) {
                            buttons = [];
                        }
                        let winButtons = buttons;
                        let menus = FastExt.System.MenuHandler.searchMenusByEntityCode(entity.entityCode);
                        let invokeMenu = function (invokeMenu: any) {
                            if (invokeMenu) {
                                try {
                                    FastExt.SystemLayout.selectMenu(invokeMenu.id);
                                } finally {
                                    if (entity.idProperty) {
                                        FastExt.Component.futureQuery("[menuId=" + invokeMenu.id + "]", function (objTab) {
                                            if (objTab) {
                                                for (let j = 0; j < entity.idProperty.length; j++) {
                                                    let idName = entity.idProperty[j];
                                                    FastExt.Component.futureQuery("[dataIndex=" + idName + "]", function (objColumn) {
                                                        if (objColumn) {
                                                            if (!FastExt.Base.toBool(objColumn[0].restoreConfig, false)) {
                                                                return false;
                                                            }
                                                            objColumn[0].searchValue(record.get(idName));
                                                        }
                                                        return true;
                                                    }, 15 * 1000, objTab[0]);
                                                }
                                            }
                                            return true;
                                        }, 30 * 1000);
                                    }
                                }
                            } else {
                                FastExt.Dialog.showAlert("系统提醒", "打开失败！您或没有此功能的管理权限！");
                            }
                        };
                        if (menus.length > 0 && FastExt.System.ManagerHandler.isSuperRole()) {
                            let menuButton = {
                                text: '进入管理界面',
                                iconCls: "extIcon extManage whiteColor",
                                menu: [],
                            };
                            for (let menu of menus) {
                                menuButton.menu.push({
                                    text: FastExt.System.MenuHandler.getPlainMenu(menu, "&nbsp;>&nbsp;"),
                                    icon: menu.icon,
                                    handler: function () {
                                        invokeMenu(menu);
                                    }
                                });
                            }
                            winButtons.push(menuButton);
                        }

                        if (buttonInfos.length > 0) {
                            let moreButton = {
                                text: '其他操作',
                                iconCls: 'extIcon extMore whiteColor',
                                menu: []
                            };

                            for (let i = 0; i < buttonInfos.length; i++) {
                                let button = buttonInfos[i];
                                moreButton.menu.push({
                                    text: button.text,
                                    iconCls: button.iconCls,
                                    icon: button.icon,
                                    functionStr: button.handler,
                                    handler: function (obj, e) {
                                        let inVarNames = [];
                                        try {
                                            let gussGrid = {
                                                getSelection: function () {
                                                    return [record];
                                                },
                                                getSelectionModel: function () {
                                                    return gussGrid;
                                                }
                                            };

                                            (<any>window)[entity.getListThisVarName] = entity;
                                            inVarNames.push(entity.getListThisVarName);

                                            (<any>window)[entity.getListGridVarName] = gussGrid;
                                            inVarNames.push(entity.getListGridVarName);

                                            let func = FastExt.Documents.loadFunction(this.functionStr);
                                            func.apply(obj, e);
                                        } catch (e) {
                                            console.error(e, this.functionStr, entity);
                                        } finally {
                                            for (let inVarName of inVarNames) {
                                                window[inVarName] = null;
                                            }
                                        }
                                    }
                                });
                            }
                            winButtons.push(moreButton);
                        }

                        let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                        let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));

                        let tools = [];

                        if (FastExt.System.ManagerHandler.isSuperRole()) {
                            tools.push({
                                type: 'help',
                                callback: function (panel, tool, event) {
                                    FastExt.Dialog.showJson(this, "查看原始数据结构", FastExt.Json.objectToJson(record.data));
                                }
                            });
                        }

                        let win = Ext.create('Ext.window.Window', {
                            title: title,
                            detailsWinId: onlyCode,
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
                            tools: tools,
                            listeners: {
                                destroy: function (obj, op) {
                                },
                                show: function (obj) {
                                    obj.focus();
                                }
                            },
                            items: [detailsGrid],
                            buttons: winButtons.length > 0 ? winButtons : null,
                        });
                        win.show();
                    } else {
                        FastExt.Dialog.showAlert("系统提醒", message);
                    }
                }, columnConfig);
            });
        }


        /**
         * 创建详情数据的Grid
         * @param data 数据实体 例如：[ {"name": "账户名称","value": FastExt.System.manager["managerName"]}]
         * @param configGrid 扩展配置Grid
         * @param configName 扩展配置Grid属性名
         * @param configValue 扩展配置Grid属性值
         * @return Ext.grid.Panel
         */
        static createDetailsGrid(data:any[], configGrid: any, configName:any, configValue:any): any {
            let newData = [];

            let maxNameWidth = 0;
            for (let datum of data) {
                if (datum) {
                    newData.push(datum);
                    maxNameWidth = Math.max(FastExt.Base.guessTextWidth(datum.name, 4), maxNameWidth);
                }
            }


            let dataStore = Ext.create('Ext.data.Store', {
                autoLoad: false,
                fields: [],
                data: newData
            });
            let nameConfig = {
                header: '名称',
                dataIndex: 'name',
                width: maxNameWidth,
                align: 'right',
                renderer: function (val, m, r) {
                    m.style = FastExt.Grid.detailsGridKeyStyle;
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
                flex: 1,
                align: 'left',
                renderer: function (val, m, r) {
                    try {
                        m.style = FastExt.Grid.detailsGridValueStyle;
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
                cls: "fast-grid-details",
                viewConfig: {
                    enableTextSelection: true
                },
                updateData: function (newData) {
                    dataStore.setData(newData);
                },
                columns: [FastExt.Json.mergeJson(nameConfig, configName),
                    FastExt.Json.mergeJson(valueConfig, configValue), {xtype: 'rowplaceholder', minWidth: 30}]
            };
            return Ext.create('Ext.grid.Panel', FastExt.Json.mergeJson(gridConfig, configGrid));
        }


        /**
         * 详情界面单行属性编辑框菜单
         * @param view
         * @param rowIndex
         * @param colIndex
         * @param item
         * @param e
         * @param record
         * @private
         */
        private static showDetailsEditMenu(view, rowIndex, colIndex, item, e, record) {

            let entity = record.get("entity");
            let columnName = record.get("columnName");
            if (Ext.isEmpty(columnName)) {
                columnName = record.get("dataIndex");
            }

            let editorField: any;

            let linkColumn = record.get("linkColumn");
            if (linkColumn) {
                let realColumnName = FastExt.Entity.getRealAttr(linkColumn);
                if (realColumnName) {
                    columnName = realColumnName;
                }
                //如果存在关联的列，说明是grid的列
                editorField = Ext.create(linkColumn.configField);
            }

            if (!editorField) {
                //继续执行entity实体内置的getEditorField方法查找编辑器
                editorField = FastExt.Entity.getEditorFieldObject(entity, columnName);
            }

            if (!editorField) {
                //继续查找记录的编辑器
                editorField = Ext.create(FastExt.Json.jsonToObjectUnsafe(record.get("editorField")));
            }

            if (!editorField) {
                FastExt.Dialog.toast("此属性无法编辑！");
                return;
            }

            view.getSelectionModel().selectRange(rowIndex, rowIndex);
            let cell = view.getCell(record, 1, true);


            editorField.flex = 1;
            editorField.emptyText = "请输入";
            editorField.region = 'center';
            editorField.record = record.get("record");
            editorField.fromColumn = true;

            if (editorField.hasListener("beforeedit")) {
                if (!editorField.fireEvent("beforeedit")) {
                    return;
                }
            }

            if (!FastExt.Listeners.getFire().onBeforeEditorField(editorField, editorField.record)) {
                return;
            }

            if (FastExt.Base.toString(editorField.inputType, "none") !== "password") {
                if (Ext.isFunction(editorField.setValue)) {
                    let value = record.get("value");
                    if (Ext.isObject(value) || Ext.isArray(value)) {
                        editorField.setValue(JSON.stringify(value), record.get("record"));
                    } else {
                        editorField.setValue(value, record.get("record"));
                    }
                }
            }
            if (Ext.isFunction(editorField.startEdit)) {
                editorField.startEdit();
            }
            let putRecord = function (fieldObj) {
                if (fieldObj.isValid()) {
                    if (!Ext.isEmpty(fieldObj.getValue())) {
                        let store = record.get("record").store;
                        if (!store) {
                            record.store.commitChanges();
                            return;
                        }
                        store.holdUpdate = true;
                        FastExt.Store.setRecordValue(record.get("record"), record.get("dataIndex"), fieldObj);
                        FastExt.Store.setRecordValue(record, "value", fieldObj);
                        if (view) {
                            view.setLoading("提交数据中……");
                        }
                        FastExt.Store.commitStoreUpdate(store).then(function (success) {
                            store.holdUpdate = false;
                            if (view) {
                                view.setLoading(false);
                            }
                            if (success) {
                                record.store.commitChanges();
                            }
                        });
                    }
                }
            };
            if (Ext.isFunction(editorField.showWindow)) {
                editorField.showWindow(cell, function (result) {
                    putRecord(result);
                });
                return;
            }
            let menu = Ext.create('Ext.menu.Menu', {
                showSeparator: false,
                layout: 'fit',
                scrollToHidden: true,
                modal: true,
                editorMenu: true,
                shadow: false,
                doUpdate: function () {
                    let me = this;
                    if (me.putRecorded) {
                        return;
                    }
                    let fieldObj = me.items.get(0).items.get(0);
                    if (!fieldObj.isValid()) {
                        FastExt.Component.shakeComment(me);
                        FastExt.Dialog.toast(FastExt.Form.getFieldError(fieldObj)[0]);
                        return;
                    }
                    me.putRecorded = true;
                    putRecord(fieldObj);
                    me.hide();
                },
                items: [
                    {
                        xtype: 'container',
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
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
                                region: 'east',
                                iconCls: 'extIcon extOk',
                                margin: '0 0 0 2',
                                height: FastExt.Form.getFieldMinHeight(true),
                                handler: function () {
                                    menu.doUpdate();
                                }
                            }
                        ]
                    }],
                listeners: {
                    show: function (obj, epts) {
                        let fieldObj = obj.items.get(0).items.get(0);
                        fieldObj.focus();
                    },
                    hide: function (obj) {
                        let upContainerPanel = view.up("[detailsPanel=true]");
                        if (upContainerPanel) {
                            upContainerPanel.holdFloatView = false;
                        }
                        let editorField = obj.items.get(0).items.get(0);
                        if (Ext.isFunction(editorField.endEdit)) {
                            editorField.endEdit();
                        }
                        obj.close();
                    }
                }
            });
            menu.addCls("edit-menu");
            menu.addCls("edit-details-menu");
            menu.setWidth(cell.getWidth());
            menu.setHeight(FastExt.Grid.getRowMinHeight());
            menu.showBy(cell, "tl");


            let upContainerPanel = view.up("[detailsPanel=true]");
            if (upContainerPanel) {
                upContainerPanel.holdFloatView = true;
            }
        }


        /**
         * 弹出数据编辑框，编辑选项以grid列为准
         * @param obj
         * @param grid
         */
        static showDataEditorWin(obj: any, grid: any) {
            if (!grid) {
                return;
            }
            if (grid.getSelection().length === 0) {
                FastExt.Dialog.toast("请选择一行需要修改的数据！");
                return;
            }
            let store = grid.getStore();
            if (!store) {
                FastExt.Dialog.toast("无法修改此行数据，数据源无效！");
                return;
            }
            let entity = grid.getStore().entity;
            if (!entity) {
                FastExt.Dialog.toast("无法修改此行数据，未绑定实体信息！");
                return;
            }

            let columns = grid.getColumns();
            let itemFields = [];
            let record = grid.getSelection()[0];
            let groupFieldSet = {};
            let groupFields = {};
            let labelWidth = 80;
            for (let i = 0; i < columns.length; i++) {
                let column = columns[i];
                if (Ext.isEmpty(column.field) || !FastExt.Base.toBool(column.editable, true)) {
                    continue;
                }

                let realField = column.field;
                if (!Ext.isObject(realField)) {
                    realField = {
                        xtype: realField,
                    }
                }

                if (Ext.isEmpty(realField.xtype)) {
                    continue;
                }
                if (realField.hasOwnProperty("initialConfig")) {
                    realField = realField.initialConfig;
                }
                let copyField = Ext.clone(realField);

                let columnName = FastExt.Entity.getRealAttr(column);
                //保持与add窗口里的form表单name格式一致
                copyField.name = "data." + columnName;

                let labelText = column.configText;
                let itemField = Ext.create(copyField);
                itemField.columnWidth = 1;
                itemField.fieldLabel = labelText;
                itemField.configFieldLabel = labelText;
                itemField.emptyText = "请输入" + labelText;
                itemField.ghostDataIndex = column.dataIndex;
                itemField.realEditorField = true;
                itemField.record = record;
                if (Ext.isEmpty(itemField.itemId)) {
                    if (Ext.isEmpty(realField.name)) {
                        itemField.itemId = column.dataIndex;
                    } else {
                        itemField.itemId = realField.name;
                    }
                }

                if (Ext.isFunction(itemField.setValue) && itemField.inputType !== "password") {
                    let value = record.get(column.dataIndex);
                    if (Ext.isObject(value) || Ext.isArray(value)) {
                        itemField.setValue(JSON.stringify(value), record);
                    } else {
                        itemField.setValue(value, record);
                    }
                }
                if (!Ext.isEmpty(column.groupHeaderText)) {
                    if (!groupFieldSet.hasOwnProperty(column.groupHeaderText)) {
                        groupFieldSet[column.groupHeaderText] = Ext.create({
                            xtype: "fieldset",
                            title: column.groupHeaderText,
                            columnWidth: 1,
                            layout: "column",
                            defaults: {
                                labelWidth: 80,
                                margin: "5 5 5 5",
                                labelAlign: "right",
                                allowBlankTip: true,
                                emptyText: "请填写"
                            },
                        });
                        groupFields[column.groupHeaderText] = [];
                        itemFields.push(groupFieldSet[column.groupHeaderText]);
                    }
                    groupFields[column.groupHeaderText].push(itemField);
                    groupFieldSet[column.groupHeaderText].defaults.labelWidth = Math.max(groupFieldSet[column.groupHeaderText].defaults.labelWidth, labelText.length * 14 + 8 + 10 + 10);
                    continue;
                }

                if (itemField.hasListener("beforeedit")) {
                    if (!itemField.fireEvent("beforeedit", itemField)) {
                        return false;
                    }
                }


                labelWidth = Math.max(labelWidth, labelText.length * 14 + 8 + 10 + 10);
                itemFields.push(itemField);
            }

            for (let groupFieldsKey in groupFields) {
                groupFieldSet[groupFieldsKey].add(groupFields[groupFieldsKey]);
            }


            if (itemFields.length === 0) {
                FastExt.Dialog.toast("无修改权限！");
                return;
            }

            if (grid.hasListener("beforeeditwin")) {
                if (!grid.fireEvent("beforeeditwin", grid, itemFields)) {
                    return false;
                }
            }

            let formPanel = Ext.create('Ext.form.FormPanel', {
                cacheKey: entity.entityCode + "Editor",
                bodyPadding: 5,
                method: 'POST',
                region: 'center',
                fileUpload: true,
                autoScroll: false,
                border: 0,
                defaults: {
                    labelWidth: Math.min(labelWidth, 188),
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    allowBlankTip: true,
                },
                layout: "column",
                items: itemFields,
            });

            let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            let maxHeight = parseInt((document.body.clientHeight * 0.8).toFixed(0));

            let editorWin = Ext.create('Ext.window.Window', {
                title: '修改数据',
                subtitle: entity.entityCode,
                width: winWidth,
                icon: obj.icon,
                iconCls: obj.iconCls,
                minWidth: 200,
                maxHeight: maxHeight,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                autoScroll: true,
                resizable: true,
                maximizable: true,
                constrain: true,
                animateTarget: obj,
                items: [formPanel],
                modal: true,
                unpin: true,
                listeners: {
                    show: function (obj) {
                        formPanel.restoreCache();
                        obj.focus();
                    }
                },
                buttons: [
                    {
                        text: '暂存',
                        iconCls: 'extIcon extSave whiteColor',
                        handler: function () {
                            formPanel.saveCache();
                        }
                    },
                    {
                        text: '重置',
                        iconCls: 'extIcon extReset',
                        handler: function () {
                            if (formPanel.form) {
                                formPanel.form.reset();
                            }
                            formPanel.deleteCache();
                        }
                    },
                    {
                        text: '确定',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            if (!store) {
                                return;
                            }
                            store.holdUpdate = true;
                            let fields = formPanel.query("[realEditorField=true]");
                            for (let field of fields) {
                                if (field.isValid()) {
                                    if (!Ext.isEmpty(field.getValue())) {
                                        FastExt.Store.setRecordValue(record, field.ghostDataIndex, field);
                                    }
                                }
                            }
                            FastExt.Dialog.showWait("提交数据中……");
                            FastExt.Store.commitStoreUpdate(store).then(function (success) {
                                FastExt.Dialog.hideWait();
                                store.holdUpdate = false;
                                if (success) {
                                    store.commitChanges();
                                    formPanel.deleteCache();
                                    editorWin.close();
                                } else {
                                    store.rejectChanges();
                                }
                            });
                        }
                    }]
            });
            editorWin.show();
        }

        /**
         * 复制详情界面单行属性值
         * @param view
         * @param rowIndex
         * @param colIndex
         * @param item
         * @param e
         * @param record
         * @private
         */
        private static copyDetailsValue(view, rowIndex, colIndex, item, e, record) {
            let cell = view.getCell(record, 1, true);
            FastExt.Base.copyToBoard($(cell.dom).text().trim());
            FastExt.Dialog.toast("复制成功！");
        }


        /**
         * 显示Grid选择历史的配置
         * @private
         */
        public static showSelectRecordHistory(obj: any, grid: any) {
            if (Ext.isEmpty(grid.showHistoryState)) {
                grid.showHistoryState = 0;
            }
            if (!obj.selectHistoryWin) {
                if (!grid.selectHistoryConfig) {
                    grid.selectHistoryConfig = {
                        "state": 0,
                        "count": 0
                    }
                }
                grid.selectHistoryConfig.count = grid.getSelectRecordHistory().length;

                let formPanel = Ext.create('Ext.form.FormPanel', {
                    margin: '5',
                    border: 0,
                    layout: 'column',
                    width: 400,
                    scrollable: true,
                    defaults: {
                        labelWidth: 140,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        emptyText: '请填写'
                    },
                    viewModel: {
                        data: grid.selectHistoryConfig
                    },
                    items: [
                        {
                            xtype: 'combo',
                            name: 'state',
                            displayField: 'text',
                            valueField: 'id',
                            fieldLabel: '是否记忆选择',
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
                            name: 'count',
                            bind: '{count}',
                            selectHistoryCount: true,
                            fieldLabel: "已选中数据（条）",
                            columnWidth: 1,
                            value: 0,
                            readOnly: true
                        }
                    ],
                });

                let winSize = FastExt.Grid.getGridInWindowSize(grid);
                obj.selectHistoryWin = Ext.create('Ext.window.Window', {
                    title: '数据选择器',
                    layout: 'fit',
                    constrain: true,
                    iconCls: 'extIcon extSelect',
                    resizable: true,
                    minHeight: 100,
                    minWidth: 400,
                    height: winSize.height,
                    width: winSize.width,
                    animateTarget: obj,
                    items: [formPanel],
                    listeners: {
                        close: function (panel, eOpts) {
                            if (obj.selectHistoryWin.gridSelectinoChange) {
                                obj.selectHistoryWin.gridSelectinoChange.destroy();
                            }
                            if (obj.selectHistoryWin.gridLoad) {
                                obj.selectHistoryWin.gridLoad.destroy();
                            }
                            obj.selectHistoryWin = null;
                        }
                    },
                    buttons: [
                        {
                            text: '查看选中的数据',
                            iconCls: 'extIcon extSee',
                            showSelectHistoryBtn: true,
                            listeners: {
                                render: function () {
                                    this.checkState();
                                }
                            },
                            resetState: function () {
                                grid.showHistoryState = 0;
                                this.checkState();
                            },
                            checkState: function () {
                                if (grid.showHistoryState === 1) {
                                    this.setText("取消查看");
                                    this.setIconCls("extIcon extReset")
                                } else {
                                    this.setText("查看选中的数据");
                                    this.setIconCls("extIcon extSee");
                                }
                            },
                            handler: function () {
                                grid.closeSelectHistoryLoad = true;
                                if (grid.showHistoryState === 0) {
                                    grid.getStore().loadData(grid.getSelectRecordHistory());
                                    grid.showHistoryState = 1;
                                    this.checkState();
                                } else {
                                    grid.getStore().reload();
                                }
                            }
                        },
                        '->',
                        {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                let form = formPanel.getForm();
                                if (form.isValid()) {
                                    grid.selectHistoryConfig = formPanel.getValues();

                                    if (parseInt(grid.selectHistoryConfig["state"]) === 0) {
                                        FastExt.Dialog.toast("已关闭选中数据的记忆器！");
                                        grid.clearSelectRecordHistory();
                                        grid.getStore().reload();
                                    } else {
                                        FastExt.Dialog.toast("已启用选中数据的记忆器！");
                                        grid.recordSelect();
                                    }

                                    FastExt.Grid.checkHistoryConfig(grid);
                                    obj.selectHistoryWin.close();
                                }
                            }
                        }
                    ]
                });

                obj.selectHistoryWin.gridSelectinoChange = grid.on('selectionchange', function () {
                    grid.refreshSelectHistoryCount();
                }, this, {destroyable: true});
                obj.selectHistoryWin.gridLoad = grid.on('load', function () {
                    try {
                        grid.showHistoryState = 0;
                        let buttons = grid.ownerCt.query("[showSelectHistoryBtn=true]");
                        for (let i = 0; i < buttons.length; i++) {
                            if (Ext.isFunction(buttons[i].resetState)) {
                                buttons[i].resetState();
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }, this, {destroyable: true});
                grid.ownerCt.add(obj.selectHistoryWin);
            } else {
                FastExt.Component.shakeComment(obj.selectHistoryWin);
            }
            obj.selectHistoryWin.show();
        }

    }

    /**
     * Grid操作配置对象
     */
    export class GridOperate {

        constructor(config?: GridOperate) {
            if (config) {
                for (let key in config) {
                    this[key] = config[key];
                }
            }
        }

        /**
         * 删除数据时弹框提醒
         */
        alertDelete: boolean = true;

        /**
         * 提交数据修改时弹框提醒
         */
        alertUpdate: boolean = true;

        /**
         * 自动提交被修改的数据
         */
        autoUpdate: boolean = false;

        /**
         * 选中grid数据中自动弹出右侧详细面板
         */
        autoDetails: boolean = true;

        /**
         * 鼠标悬浮在数据操作3秒时，弹出预览数据提示
         */
        hoverTip: boolean = false;

        /**
         * 当离开Grid所在的标签页后，再次返回此标签页时将刷新当前标签页的列表数据
         */
        refreshData: boolean = false;

        /**
         * 是否允许Excel导出
         */
        excelOut: boolean = true;

        /**
         * 是否允许Excel导入
         */
        excelIn: boolean = true;

        /**
         * 是否允许下载数据
         */
        downloadData: boolean = true;

        /**
         * 是否允许上传数据
         */
        uploadData: boolean = true;

        // /**
        //  * 是否允许全文搜索
        //  */
        // globalSearch: boolean = true;

        /**
         * 是否开启清空所有数据按钮
         */
        deleteAllData: boolean = true;

        /**
         * 是否开启拷贝数据按钮
         */
        copyData: boolean = true;


        /**
         * 是否显示行号
         */
        showRowNumber: boolean = false;

        /**
         * 是否显示查看详情按钮
         */
        showDetailsButton: boolean = true;

        /**
         * 是否显示修改数据按钮
         */
        showUpdateButton: boolean = true;

    }

    /**
     * 是否启用自动配置Grid的列右键菜单
     */
    export class GridColumnMenu {

        /**
         * 启用【取消排序】的菜单选项
         */
        cancelSort: boolean = true;

        /**
         * 启用【批量随机数据】的菜单选项
         */
        batchRandom: boolean = true;

        /**
         * 启用【批量修改数据】的菜单选项
         */
        batchUpdate: boolean = true;

        /**
         * 启用【批量更新数据】的菜单选项
         */
        batchUpdateDB: boolean = true;

        /**
         * 启用【批量替换数据】的菜单选项
         */
        batchReplaceDB: boolean = true;


        /**
         * 启用【计算数据】的菜单选项
         */
        operation: boolean = true;

        /**
         * 启用【配置搜索链】的菜单选项
         */
        searchLink: boolean = true;

        /**
         * 启用【查看字段】的菜单选项
         */
        lookField: boolean = true;
    }


}