/**
 * ExtManagerEntity实体类
 */
function ExtManagerEntity() {
    this.actionDeleteAll = false;
    this.actionTimer = false;
    this.actionCopy = false;


    this.getList = function (where) {
        let me = this;
        let dataStore = getEntityDataStore(me, where);
        let grid = Ext.create('Ext.grid.Panel', {
            entityList: true,
            selModel: getGridSelModel(),
            region: 'center',
            multiColumnSort: true,
            border: 0,
            columnLines: true,
            contextMenu: true,
            store: dataStore,
            enableLocking: true,
            defaultToolBarLink: false,
            operate: {
                alertDelete: true,
                alertUpdate: true,
                autoUpdate: false,
                autoDetails: true,
                hoverTip: false,
                excelIn: false,
            },
            filter: {
                enable: true,
                key: me.entityCode,
                method: "getList"
            },
            columns: [
                {
                    text: "登录名",
                    dataIndex: "managerLoginName",
                    align: "center",
                    width: 220,
                    renderer: renders.normal(),
                    field: "textfield"
                },
                {
                    text: "登录密码",
                    dataIndex: "managerPassword",
                    align: "center",
                    width: 120,
                    password: true,
                    renderer: renders.password(),
                    field: {
                        xtype: 'textfield',
                        inputType: 'password'
                    }
                },
                {
                    text: "管理员名称",
                    dataIndex: "managerName",
                    align: "center",
                    width: 220,
                    renderer: renders.normal(),
                    field: "textfield"
                },
                {
                    text: "管理员角色",
                    dataIndex: "a__roleName",
                    align: "center",
                    width: 220,
                    rendererFunction: "renders.link('roleId','ExtManagerRoleEntity', 'roleId')",
                    listeners: {
                        beforeedit: function (context) {
                            if (context.record.get("managerId") === FastExt.System.ManagerHandler.getManagerId()
                                || context.record.get("roleId") === FastExt.System.ManagerHandler.getRoleId()) {
                                toast("不可编辑自己或相同角色的用户的角色！");
                                return false;
                            }
                            return true;
                        }
                    },
                    field: {
                        xtype: 'linkfield',
                        name: 'roleId',
                        entityCode: 'ExtManagerRoleEntity',
                        entityId: 'roleId',
                        entityText: 'roleName'
                    }
                },
                {
                    text: "管理员状态",
                    dataIndex: "managerState",
                    align: "center",
                    width: 220,
                    rendererFunction: "renders.enum('ManagerStateEnum')",
                    field: {
                        xtype: 'enumcombo',
                        enumName: 'ManagerStateEnum'
                    }
                },
                {
                    text: "允许登录",
                    dataIndex: "onlineType",
                    align: "center",
                    width: 220,
                    rendererFunction: "renders.enum('OnlineTypeEnum')",
                    field: {
                        xtype: 'enumcombo',
                        enumName: 'OnlineTypeEnum'
                    }
                },
                {
                    text: "最后一次登录",
                    dataIndex: "lastLoginTime",
                    align: "center",
                    width: 220,
                    renderer: renders.normal()
                },
                {
                    text: "录入时间",
                    dataIndex: "managerDateTime",
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
                        text: '删除系统管理员',
                        iconCls: 'extIcon extDelete',
                        tipText: '删除系统管理员！',
                        checkSelect: 1,
                        entityDeleteButton: true,
                        handler: function () {
                            let currRecord = grid.getSelection()[0];
                            if (currRecord.get("managerId") === FastExt.System.ManagerHandler.getManagerId()) {
                                FastExt.Dialog.toast("不可对自己进行删除操作！");
                                return;
                            }
                            if (FastExt.System.ConfigHandler.isManagerPowerCheckSameRole() && currRecord.get("roleId") === FastExt.System.ManagerHandler.getRoleId()) {
                                FastExt.Dialog.toast("不可对与自己角色相同的管理员进行删除操作！");
                                return;
                            }
                            deleteGridData(grid);
                        }
                    },
                    {
                        xtype: 'button',
                        text: '添加系统管理员',
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
                        subtext: '系统管理员',
                        checkUpdate: true,
                        entityUpdateButton: true,
                        iconCls: 'extIcon extSave',
                        handler: function () {
                            updateGridData(grid);
                        }
                    },
                    {
                        xtype: 'button',
                        text: '管理员权限配置',
                        checkSelect: 1,
                        iconCls: 'extIcon extPower redColor',
                        menu: [
                            {
                                text: '与所属角色权限同步',
                                subtext: '系统管理员',
                                checkSelect: 2,
                                iconCls: 'extIcon extPower redColor',
                                handler: function () {
                                    let currRecord = grid.getSelection()[0];
                                    if (currRecord.get("managerId") === FastExt.System.ManagerHandler.getManagerId()) {
                                        FastExt.Dialog.toast("不可对自己进行删除操作！");
                                        return;
                                    }
                                    if (FastExt.System.ConfigHandler.isManagerPowerCheckSameRole() && currRecord.get("roleId") === FastExt.System.ManagerHandler.getRoleId()) {
                                        FastExt.Dialog.toast("不可对与自己角色相同的管理员进行操作！");
                                        return;
                                    }
                                    Ext.Msg.confirm("系统提醒", "将与角色权限同步，确定后将修改已选中管理员的权限与所属角色的权限一致！您确定操作吗？", function (button, text) {
                                        if (button === "yes") {
                                            FastExt.Dialog.showWait("正在同步中，请稍后……");
                                            let selectLength = grid.getSelection().length;
                                            let params = {};
                                            for (let i = 0; i < selectLength; i++) {
                                                params["managerId[" + i + "]"] = grid.getSelection()[i].get("managerId");
                                            }
                                            $.post("manager/updatePower", params, function (result) {
                                                FastExt.Dialog.hideWait();
                                                if (result.success) {
                                                    FastExt.Dialog.toast(result.message);
                                                    grid.getStore().reload();
                                                } else {
                                                    FastExt.Dialog.showAlert("系统提醒", result.message);
                                                }
                                            });
                                        }
                                    });
                                }
                            },
                            FastExt.Listeners.onShowManagerDataLayer ? {
                                text: '配置管理员数据权限',
                                iconCls: 'extIcon extPower redColor',
                                handler: function () {
                                    let currRecord = grid.getSelection()[0];
                                    FastExt.Listeners.onShowManagerDataLayer(currRecord);
                                }
                            } : undefined,
                            {
                                text: '配置管理员菜单权限',
                                iconCls: 'extIcon extPower redColor',
                                handler: function () {
                                    let currRecord = grid.getSelection()[0];
                                    new ExtManagerEntity().configMenuPower(this, grid, currRecord);
                                }
                            },
                            {
                                text: '配置管理员界面权限',
                                iconCls: 'extIcon extPower redColor',
                                handler: function () {
                                    let currRecord = grid.getSelection()[0];
                                    new ExtManagerEntity().configViewPower(this, grid, currRecord);
                                }
                            }
                        ]
                    },
                    {
                        xtype: 'button',
                        text: '其他功能操作',
                        checkSelect: 1,
                        iconCls: 'extIcon extPower redColor',
                        menu: [
                            {
                                text: '清除登录限次',
                                subtext: '系统管理员',
                                checkSelect: 1,
                                iconCls: 'extIcon extSessionOut yellowColor',
                                handler: function () {
                                    Ext.Msg.confirm("系统提醒", "将清除账户的登录异常限制！您确定操作吗？", function (button, text) {
                                        if (button === "yes") {
                                            FastExt.Dialog.showWait("正在清除中，请稍后……");
                                            let params = {"loginName": grid.getSelection()[0].get("managerLoginName")};
                                            $.post("manager/clearLoginError", params, function (result) {
                                                FastExt.Dialog.hideWait();
                                                if (result.success) {
                                                    FastExt.Dialog.toast(result.message);
                                                } else {
                                                    FastExt.Dialog.showAlert("系统提醒", result.message);
                                                }
                                            });
                                        }
                                    });
                                }
                            },
                            {
                                text: '通知升级系统配置',
                                subtext: '系统管理员',
                                checkSelect: 2,
                                iconCls: 'extIcon extVersion greenColor',
                                handler: function () {
                                    Ext.Msg.confirm("系统提醒", "将通知账户进行系统配置升级！您确定操作吗？", function (button, text) {
                                        if (button === "yes") {
                                            grid.getStore().holdUpdate = true;
                                            grid.setLoading("通知账户升级系统配置中……");
                                            let data = grid.getSelection();
                                            for (let i = 0; i < data.length; i++) {
                                                data[i].set("initCode", 0);
                                            }
                                            FastExt.Store.commitStoreUpdate(grid.getStore(), "通知成功！").then(function () {
                                                grid.setLoading(false);
                                                grid.getStore().holdUpdate = false;
                                            });
                                        }
                                    });
                                }
                            },
                            {
                                text: '登录选中的管理员',
                                subtext: '系统管理员',
                                checkSelect: 1,
                                icon: FastExt.Server.getIcon("icon_admin.svg"),
                                handler: function () {
                                    Ext.Msg.confirm("系统提醒", "将登录选中的管理员账户！您确定操作吗？", function (button, text) {
                                        if (button === "yes") {
                                            FastExt.Dialog.showWait("正在登录中，请稍后……");
                                            let params = {
                                                "loginName": grid.getSelection()[0].get("managerLoginName"),
                                                "loginPassword": "PASS"
                                            };
                                            $.post("controller/login", params, function (result) {
                                                FastExt.Dialog.hideWait();
                                                if (result.success) {
                                                    FastExt.Dialog.showAlert("系统提醒", result.message, function () {
                                                        location.reload();
                                                    });
                                                } else {
                                                    FastExt.Dialog.showAlert("系统提醒", result.message);
                                                }
                                            });
                                        }
                                    });
                                }
                            },
                            FastExt.System.ConfigHandler.isEnablePwd() ? undefined : {
                                text: '查看登录密码',
                                subtext: '系统管理员',
                                checkSelect: 1,
                                iconCls: 'extIcon extResetPassword redColor',
                                handler: function () {
                                    FastExt.Dialog.showAlert("系统提醒", grid.getSelection()[0].get("managerPassword2"))
                                }
                            },
                            FastExt.System.ConfigHandler.isEnableGoogleAuthentication() ? {
                                text: '重置谷歌身份验证器',
                                subtext: '系统管理员',
                                checkSelect: 1,
                                iconCls: 'extIcon extResetPassword redColor',
                                handler: function () {
                                    new ExtManagerEntity().resetGoogle(this, grid.getSelection()[0].get("managerId"));
                                }
                            } : undefined
                        ]
                    }
                ]
            },
            bbar: getPageToolBar(dataStore),
            plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 2
            })],
            viewConfig: {
                loadingText: '正在为您在加载数据…'
            }
        });
        return Ext.create('Ext.panel.Panel', {
            layout: 'border',
            region: 'center',
            border: 0,
            items: [grid, getDetailsPanel(grid)]
        });
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
                border: 0,
                defaults: {
                    labelWidth: 100,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    emptyText: '请填写',
                    allowBlankTip: true,
                    fastConfig: {
                        power: true
                    }
                },
                layout: "column",
                items: [
                    {
                        name: "data.managerLoginName",
                        xtype: "textfield",
                        fieldLabel: "登录名",
                        columnWidth: 1,
                        allowBlank: false
                    },
                    {
                        name: "data.managerName",
                        xtype: "textfield",
                        fieldLabel: "管理员名称",
                        columnWidth: 1,
                        allowBlank: false
                    },
                    {
                        name: "data.managerPassword",
                        xtype: "textfield",
                        fieldLabel: "登录密码",
                        columnWidth: 1,
                        inputType: "password",
                        allowBlank: false
                    },
                    {
                        name: "data.roleId",
                        xtype: "linkfield",
                        fieldLabel: "管理员角色",
                        columnWidth: 1,
                        multiSelect: false,
                        entityCode: "ExtManagerRoleEntity",
                        entityId: "roleId",
                        entityText: "roleName",
                        allowBlank: false
                    },
                    {
                        name: "data.managerState",
                        xtype: "enumcombo",
                        fieldLabel: "管理员状态",
                        columnWidth: 1,
                        value: 0,
                        allowBlank: false,
                        enumName: "ManagerStateEnum"
                    }, {
                        name: "data.onlineType",
                        xtype: "enumcombo",
                        fieldLabel: "允许登录",
                        columnWidth: 1,
                        value: 0,
                        allowBlank: false,
                        enumName: "OnlineTypeEnum"
                    }]
            });

            let addWin = Ext.create('Ext.window.Window', {
                title: '添加系统管理员',
                height: 440,
                icon: obj.icon,
                iconCls: obj.iconCls,
                width: 520,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                resizable: true,
                maximizable: true,
                constrain: true,
                autoScroll: true,
                animateTarget: obj,
                items: [formPanel],
                modal: true,
                listeners: {
                    show: function (obj) {
                        formPanel.restoreCache();
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
        let entityOwner = gridList.down("[entityList=true]");
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
        return new Ext.Promise(function (resolve, reject) {
            me.menu = {
                id: $.md5(title),
                text: title
            };
            let selModel = null;
            if (multi) {
                selModel = FastExt.Grid.getGridSelModel();
            }
            let dataStore = getEntityDataStore(me, where);
            let grid = Ext.create('Ext.grid.Panel', {
                entityList: true,
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
                columns: [
                    {
                        text: "登录名",
                        dataIndex: "managerLoginName",
                        align: "center",
                        width: 220,
                        renderer: renders.normal()
                    },
                    {
                        text: "管理员名称",
                        dataIndex: "managerName",
                        align: "center",
                        width: 220,
                        renderer: renders.normal()
                    },
                    {
                        text: "管理员角色",
                        dataIndex: "a__roleName",
                        align: "center",
                        width: 220,
                        renderer: renders.normal()
                    },
                    {
                        text: "管理员状态",
                        dataIndex: "managerState",
                        align: "center",
                        width: 220,
                        rendererFunction: "renders.enum('ManagerStateEnum')"
                    },
                    {
                        text: "录入时间",
                        dataIndex: "managerDateTime",
                        align: "center",
                        flex: 1,
                        minWidth: 220,
                        renderer: renders.normal()
                    }],
                bbar: getPageToolBar(dataStore),
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
            showDetailsWindow(obj, "系统管理员详情", me, record);
        });
    };

    this.resetPassword = function (obj, managerId) {
        let loginPanel = Ext.create('Ext.form.FormPanel', {
            url: 'manager/resetPassword',
            method: 'POST',
            fileUpload: true,
            border: 0,
            width: '100%',
            layout: "anchor",
            region: 'center',
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: '新密码',
                    labelAlign: 'right',
                    labelWidth: 50,
                    margin: '10 10 10 10',
                    name: 'newPassword',
                    allowBlank: false,
                    inputType: 'password',
                    blankText: '请输入用户新密码',
                    anchor: "100%"
                },
                {
                    xtype: 'hiddenfield',
                    name: 'managerId',
                    value: managerId
                },
                {
                    xtype: 'fieldcontainer',
                    labelWidth: 0,
                    layout: 'column',
                    items: [{
                        xtype: 'button',
                        text: '立即重置',
                        id: 'btnLogin',
                        margin: '10 10 10 5',
                        iconCls: 'extIcon extReset',
                        columnWidth: 1,
                        handler: function () {
                            doSubmit();
                        }
                    }]
                }],
            listeners: {
                'render': function (text) {
                    try {
                        new Ext.util.KeyMap({
                            target: text.getEl(),
                            key: 13,
                            fn: doSubmit,
                            scope: Ext.getBody()
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        });

        let doSubmit = function () {
            let form = loginPanel.form;
            if (form.isValid()) {
                form.submit({
                    waitMsg: '正在重置中……',
                    success: function (form, action) {
                        toast(action.result.message);
                        win.close();
                    },
                    failure: function (form, action) {
                        Ext.Msg.alert('系统提醒', "密码重置失败！");
                    }
                });
            }
        };


        let win = Ext.create('Ext.window.Window', {
            title: '重置登录密码',
            height: 160,
            icon: obj.icon,
            iconCls: obj.iconCls,
            width: 400,
            layout: 'border',
            resizable: false,
            constrain: true,
            maximizable: false,
            animateTarget: obj,
            items: [loginPanel],
            modal: true
        });
        win.show();
    };

    this.resetGoogle = function (obj, managerId) {
        FastExt.Dialog.showConfirm("系统提醒", "确定重置选中管理员的谷歌身份验证器吗？", function (btn) {
            if (btn === "yes") {
                FastExt.Server.googleReset(managerId, function (success, message) {
                    if (success) {
                        FastExt.Dialog.toast("重置成功！");
                    } else {
                        FastExt.Dialog.showAlert("系统提醒", message);
                    }
                });
            }
        });
    };

    this.configMenuPower = function (obj, grid, currRecord) {
        if (currRecord.get("roleType") === 0) {
            FastExt.Dialog.toast("已拥有最大权限！");
            return;
        }
        if (currRecord.get("managerId") === FastExt.System.ManagerHandler.getManagerId()) {
            FastExt.Dialog.toast("不可对自己进行权限操作！");
            return;
        }

        if (FastExt.System.ConfigHandler.isManagerPowerCheckSameRole() && currRecord.get("roleId") === FastExt.System.ManagerHandler.getRoleId()) {
            FastExt.Dialog.toast("不可对与自己角色相同的管理员进行权限操作！");
            return;
        }

        FastExt.Power.showPowerMenus(obj, currRecord.get("managerMenuPower"), currRecord.get("roleMenuPower")).then(function (result) {
            grid.getStore().holdUpdate = true;
            grid.setLoading("更新权限中……");
            currRecord.set("managerMenuPower", result);
            FastExt.Store.commitStoreUpdate(grid.getStore(), "更新成功！").then(function () {
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
        if (currRecord.get("managerId") === FastExt.System.ManagerHandler.getManagerId()) {
            FastExt.Dialog.toast("不可对自己进行权限操作！");
            return;
        }

        if (FastExt.System.ConfigHandler.isManagerPowerCheckSameRole() && currRecord.get("roleId") === FastExt.System.ManagerHandler.getRoleId()) {
            FastExt.Dialog.toast("不可对与自己角色相同的管理员进行权限操作！");
            return;
        }
        FastExt.Power.showPowerExt(obj, currRecord.get("managerMenuPower"), currRecord.get("managerExtPower"), currRecord.get("roleExtPower")).then(function (result) {
            grid.getStore().holdUpdate = true;
            grid.setLoading("更新权限中……");
            currRecord.set("managerExtPower", result);
            FastExt.Store.commitStoreUpdate(grid.getStore(), "更新成功！").then(function () {
                grid.setLoading(false);
                grid.getStore().holdUpdate = false;
            });
        });

    };

}