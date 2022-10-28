/**
 * ExtManagerRoleEntity实体类
 */
function ExtManagerRoleEntity() {
    this.actionDeleteAll = false;
    this.getList = function (where) {
        let me = this;
        let parentIdValue = system.manager.roleId;
        if (system.manager.role.roleType === 0) {
            parentIdValue = -1;
        }

        let treeConfig = {
            idName: 'roleId',
            parentIdName: 'parentRoleId',
            parentIdValue: parentIdValue
        };

        //不允许修改所属上级，牵扯到上级权限的分配问题！
        let dataStore = getEntityDataStore(me, where, treeConfig);
        let grid = Ext.create('Ext.tree.Panel', {
            entityList: true,
            selModel: getGridSelModel(),
            region: 'center',
            multiColumnSort: true,
            border: 0,
            columnLines: true,
            contextMenu: true,
            defaultToolBarLink: false,
            store: dataStore,
            enableLocking: true,
            operate: {
                alertDelete: true,
                alertUpdate: true,
                autoUpdate: false,
                autoDetails: false,
                hoverTip: false,
                excelOut: false,
                excelIn: false
            },
            bufferedRenderer: false,
            animate: true,
            useArrows: true,
            rowLines: true,
            rootVisible: false,
            columns: [
                {
                    text: "角色名称",
                    dataIndex: "roleName",
                    xtype: "treecolumn",
                    width: 220,
                    renderer: renders.normal(),
                    field: "textfield"
                },
                {
                    text: "角色类型",
                    dataIndex: "roleType",
                    align: "center",
                    width: 220,
                    rendererFunction: "renders.enum('RoleTypeEnum')",
                    field: {
                        xtype: 'enumcombo',
                        include: FastExt.System.manager.role.roleType === 0 ? [] : [1],
                        enumName: 'RoleTypeEnum'
                    }
                },
                {
                    text: "角色状态",
                    dataIndex: "roleState",
                    align: "center",
                    width: 220,
                    rendererFunction: "renders.enum('RoleStateEnum')",
                    field: {
                        xtype: 'enumcombo',
                        enumName: 'RoleStateEnum'
                    }
                },
                {
                    text: "录入时间",
                    dataIndex: "roleDateTime",
                    align: "center",
                    flex: 1,
                    minWidth: 220,
                    renderer: renders.normal(),
                    field: "datefield"
                }],
            tbar: {
                xtype: 'toolbar',
                overflowHandler: 'menu',
                items: [
                    {
                        xtype: 'button',
                        iconCls: 'extIcon extRefresh',
                        tipText: '刷新数据！',
                        handler: function () {
                            dataStore.loadPage(1);
                        }
                    }, {
                        xtype: 'button',
                        text: '角色权限配置',
                        checkSelect: 1,
                        iconCls: 'extIcon extPower redColor',
                        menu: [
                            {
                                text: '配置角色菜单权限',
                                iconCls: 'extIcon extPower redColor',
                                handler: function () {
                                    let currRecord = grid.getSelection()[0];
                                    new ExtManagerRoleEntity().configMenuPower(this, grid, currRecord);
                                }
                            },
                            {
                                text: '配置角色界面权限',
                                iconCls: 'extIcon extPower redColor',
                                handler: function () {
                                    let currRecord = grid.getSelection()[0];
                                    new ExtManagerRoleEntity().configViewPower(this, grid, currRecord);
                                }
                            }
                        ]
                    },{
                        xtype: 'button',
                        text: '删除管理员角色',
                        iconCls: 'extIcon extDelete',
                        tipText: '删除管理员角色！',
                        checkSelect: 2,
                        entityDeleteButton: true,
                        handler: function () {
                            deleteGridData(grid);
                        }
                    },
                    {
                        xtype: 'button',
                        text: '添加管理员角色',
                        iconCls: 'extIcon extAdd',
                        entityAddButton: true,
                        handler: function () {
                            me.showAdd(this).then(function (result) {
                                if (result.success) {
                                    dataStore.loadPage(1);
                                }
                            });
                        }
                    },
                    {
                        xtype: 'button',
                        text: '提交修改',
                        checkUpdate: true,
                        entityUpdateButton: true,
                        iconCls: 'extIcon extSave',
                        handler: function () {
                            updateGridData(grid);
                        }
                    }]
            },
            plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 2
            })],
            viewConfig: {
                toggleOnDblClick: false,
                loadingText: '正在为您在加载数据…'
            }
        });
        let panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            region: 'center',
            border: 0,
            items: [grid, getDetailsPanel(grid)]
        });
        return panel;
    };

    this.showAdd = function (obj) {
        let me = this;
        return new Ext.Promise(function (resolve, reject) {
            let formPanel = Ext.create('Ext.form.FormPanel', {
                url: 'entity/save',
                cacheKey: me.entityCode,
                bodyPadding: 5,
                method: 'POST',
                region: 'center',
                fileUpload: true,
                autoScroll: true,
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    emptyText: '请填写',
                    fastConfig: {
                        power: true
                    }
                },
                layout: "column",
                items: [
                    {
                        name: "data.roleName",
                        xtype: "textfield",
                        fieldLabel: "角色名称",
                        columnWidth: 1,
                        allowBlank: false
                    },
                    {
                        name: "data.roleType",
                        xtype: "enumcombo",
                        fieldLabel: "角色类型",
                        columnWidth: 1,
                        value: 1,
                        allowBlank: false,
                        include: FastExt.System.manager.role.roleType === 0 ? [] : [1],
                        enumName: "RoleTypeEnum"
                    },
                    {
                        name: "data.roleState",
                        xtype: "enumcombo",
                        fieldLabel: "角色状态",
                        columnWidth: 1,
                        value: 0,
                        allowBlank: false,
                        enumName: "RoleStateEnum"
                    },
                    {
                        name: "data.parentRoleId",
                        xtype: "linkfield",
                        fieldLabel: "父级角色",
                        columnWidth: 1,
                        emptyText: '请选择',
                        entityCode: "ExtManagerRoleEntity",
                        entityId: "roleId",
                        allowBlank: FastExt.System.manager.role.roleType === 0 ? true : false,
                        entityText: "roleName"
                    }]
            });

            let addWin = Ext.create('Ext.window.Window', {
                title: '添加管理员角色',
                height: 300,
                icon: obj.icon,
                iconCls: obj.iconCls,
                width: 520,
                layout: 'border',
                resizable: true,
                maximizable: true,
                constrain: true,
                animateTarget: obj,
                items: [formPanel],
                modal: true,
                listeners: {
                    show: function (obj) {
                        formPanel.restoreCache();
                    }
                },
                buttons: [{
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
                            formPanel.form.reset();
                            formPanel.deleteCache();
                        }
                    },
                    {
                        text: '添加',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            formPanel.submitForm(me).then(function (result) {
                                resolve(result);
                                if (result.success) {
                                    formPanel.deleteCache();
                                    addWin.close();
                                }
                            });
                        }
                    }]
            });
            addWin.show();
        });
    };

    this.showWinList = function (obj, title, where) {
        let me = this;
        me.menu = {
            id: $.md5(title),
            text: title
        };
        let gridList = me.getList(where);
        let entityOwner = gridList.down("[entity]");
        if (entityOwner) {
            entityOwner.code = $.md5(title);
        }
        let win = Ext.create('Ext.window.Window', {
            title: title,
            height: 550,
            width: 700,
            layout: 'border',
            resizable: true,
            constrain: true,
            maximizable: true,
            animateTarget: obj,
            items: [gridList]
        });
        if (obj != null) {
            win.setIcon(obj.icon);
            win.setIconCls(obj.iconCls);
        }
        win.show();
    };

    this.showSelect = function (obj, title, where, multi) {
        let me = this;
        me.menu = {
            id: $.md5(title),
            text: title
        };
        return new Ext.Promise(function (resolve, reject) {
            let parentIdValue = system.manager.roleId;
            if (system.manager.role.roleType === 0) {
                parentIdValue = -1;
            }
            if (!where) {
                where = {};
            }
            where = {"t.roleState": 0};
            let selModel = null;
            if (multi) {
                selModel = FastExt.Grid.getGridSelModel();
            }
            let dataStore = getEntityDataStore(me, where, {
                idName: 'roleId',
                parentIdName: 'parentRoleId',
                parentIdValue: parentIdValue
            });
            let grid = Ext.create('Ext.tree.Panel', {
                entity: me,
                code: $.md5(title),
                selModel: selModel,
                region: 'center',
                multiColumnSort: true,
                border: 0,
                columnLines: true,
                contextMenu: false,
                columnMenu: false,
                store: dataStore,
                enableLocking: true,
                bufferedRenderer: false,
                animate: true,
                useArrows: true,
                rowLines: true,
                rootVisible: false,
                columns: [
                    {
                        text: "角色名称",
                        dataIndex: "roleName",
                        xtype: "treecolumn",
                        width: 220,
                        renderer: renders.normal()
                    },
                    {
                        text: "角色状态",
                        dataIndex: "roleState",
                        align: "center",
                        width: 220,
                        rendererFunction: "renders.enum('RoleStateEnum')"
                    },
                    {
                        text: "角色类型",
                        dataIndex: "roleType",
                        align: "center",
                        width: 220,
                        rendererFunction: "renders.enum('RoleTypeEnum')"
                    },
                    {
                        text: "录入时间",
                        dataIndex: "roleDateTime",
                        align: "center",
                        flex: 1,
                        minWidth: 220,
                        renderer: renders.normal()
                    }],
                viewConfig: {
                    loadingText: '正在为您在加载数据…'
                }
            });

            let win = Ext.create('Ext.window.Window', {
                title: title,
                height: 550,
                width: 700,
                iconCls: 'extIcon extSelect',
                layout: 'border',
                resizable: true,
                constrain: true,
                maximizable: true,
                animateTarget: obj,
                items: [grid],
                modal: true,
                listeners: {
                    close: function (winObj, eOpts) {
                        if (!resolve.called) {
                            resolve.called = true;
                            resolve();
                        }
                    }
                },
                buttons: [{
                    text: '取消',
                    iconCls: 'extIcon extClose',
                    handler: function () {
                        win.close();
                    }
                },
                    {
                        text: '确定',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            let data = grid.getSelectionModel().getSelection();
                            if (data.length > 0) {
                                if (!resolve.called) {
                                    resolve.called = true;
                                    resolve(data);
                                }
                            }
                            win.close();
                        }
                    }]
            });
            win.show();
        });
    };

    this.showDetails = function (obj, where) {
        let me = this;
        let dataStore = getEntityDataStore(me, where);
        showWait("请稍后……");
        dataStore.load(function (records, operation, success) {
            hideWait();
            if (records.length == 0) {
                Ext.Msg.alert("系统提醒", "未获得到详情数据！");
                return;
            }
            let record = records[0];
            showDetailsWindow(obj, "管理员角色详情", me, record);
        });
    };


    this.configMenuPower = function (obj, grid, currRecord) {
        if (currRecord.get("roleType") === 0) {
            FastExt.Dialog.toast("已拥有最大权限！");
            return;
        }
        if (currRecord.get("roleId") === FastExt.System.manager.roleId) {
            FastExt.Dialog.toast("不可对自己进行权限操作！");
            return;
        }
        FastExt.System.showPowerMenus(obj, currRecord.get("roleMenuPower"), currRecord.get("a__roleMenuPower")).then(function (result) {
            grid.getStore().holdUpdate = true;
            grid.setLoading("更新权限中……");
            currRecord.set("roleMenuPower", result);
            FastExt.Store.commitStoreUpdate(grid.getStore()).then(function () {
                grid.setLoading(false);
                grid.getStore().holdUpdate = false;
            });
        });
    };

    this.configViewPower = function (obj, grid, currRecord) {
        if (currRecord.get("roleType") === 0) {
            FastExt.Dialog.toast("已拥有最大权限！");
            return;
        }
        if (currRecord.get("roleId") === FastExt.System.manager.roleId) {
            FastExt.Dialog.toast("不可对自己进行权限操作！");
            return;
        }
        FastExt.System.showPowerExt(obj, currRecord.get("roleMenuPower"), currRecord.get("roleExtPower"), currRecord.get("a__roleExtPower")).then(function (result) {
            grid.getStore().holdUpdate = true;
            grid.setLoading("更新权限中……");
            currRecord.set("roleExtPower", result);
            FastExt.Store.commitStoreUpdate(grid.getStore()).then(function () {
                grid.setLoading(false);
                grid.getStore().holdUpdate = false;
            });
        });
    };


}