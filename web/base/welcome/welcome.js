function getWelcomePanel() {
    var accordionPanel = Ext.create('Ext.panel.Panel', {
        layout: {
            type: 'accordion'
        },
        region: 'center',
        border: 0,
        items:[
            systemOperate(),systemVersion(),systemConfig()
        ]
    });

    var weatherPanel = Ext.create('Ext.panel.Panel', {
        layout: 'fit',
        region: 'north',
        border: 0,
        height: 'auto',
        listeners: {
            afterrender: function (obj, eOpts) {
                obj.update("<iframe style='margin-top:5px;margin-right:5px;'  src='https://i.tianqi.com/index.php?c=code&id=82' width='250' height='434' frameborder='0' scrolling='no' />");
            }
        }
    });
    var timerPanel = Ext.create('Ext.panel.Panel', {
        layout: 'fit',
        region: 'center',
        border: 0,
        listeners: {
            afterrender: function (obj, eOpts) {
                obj.update("<iframe src='" + system.formatUrlVersion('base/welcome/timer.html') + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
            }
        }
    });

    var rightPanel = Ext.create('Ext.panel.Panel', {
        layout: 'border',
        region: 'east',
        border: 0,
        width: 255,
        items: [weatherPanel, timerPanel]
    });

    var container = Ext.create('Ext.panel.Panel', {
        layout: 'border',
        border: 0,
        items: [accordionPanel, rightPanel]
    });

    return container;
}

//获得系统操作日志
function systemOperate() {
    var dataStoreTSystemOperatesModel = Ext.create('Ext.data.Store', {
        autoLoad: false,
        fields: [],
        idProperty: 'operateId',
        modelName: 'SystemOperatesModel',
        pageSize: 50,
        proxy: {
            type: 'ajax',
            url: 'entity/list',
            actionMethods: {
                create: 'POST',
                read: 'POST',
                update: 'POST',
                destroy: 'POST'
            },
            reader: {
                type: 'json',
                root: 'list',
                totalProperty: 'totalRow'
            }
        }
    });

    var pagingtoolbar = Ext.create('Ext.toolbar.Paging', {
        store: dataStoreTSystemOperatesModel,
        dock: 'bottom',
        overflowHandler: 'scroller',
        displayInfo: true
    });


    var dataGridTSystemOperatesModel = Ext.create('Ext.grid.Panel', {
        region: 'center',
        border: 0,
        power:true,
        multiColumnSort: true,
        iconCls: 'extIcon extLog',
        columnLines: true,
        title: '系统操作日志',
        hideHeaders: true,
        store: dataStoreTSystemOperatesModel,
        columns: [
            {
                header: '操作类型',
                dataIndex: 'systemLogType',
                align: 'center',
                width: 100
            },
            {
                header: '操作介绍',
                dataIndex: 'systemLogContent',
                align: 'center',
                flex: 1
            },
            {
                header: '操作时间',
                dataIndex: 'systemLogDateTime',
                width: 200,
                align: 'center'
            }],
        plugins: [{
            ptype: 'rowexpander',
            rowBodyTpl: new Ext.XTemplate('<p>操作用户: {a__managerName}</p>',
                '<p>来自IP: {systemLogIp}</p>',
                '<p>浏览器: {systemLogClient}</p>',
                '<p>操作结果: {systemLogData}</p>')
        }],
        dockedItems: [pagingtoolbar],
        viewConfig: {
            enableTextSelection: true,
            loadMask: {
                msg: '正在为您在加载数据…'
            }
        }
    });


    pagingtoolbar.insert(pagingtoolbar.items.getCount() - 2, {
        xtype: 'button',
        iconCls:'extIcon extSearch',
        handler: function () {
            dataGridTSystemOperatesModel.add(searchSysOperate(dataGridTSystemOperatesModel, this));
        }
    });
    pagingtoolbar.insert(pagingtoolbar.items.getCount() - 3, "-");

    dataStoreTSystemOperatesModel.on('beforeload',
        function (store, options) {
            var jsonData = {};
            if (dataGridTSystemOperatesModel.searchForm != null) {
                jsonData = dataGridTSystemOperatesModel.searchForm.getValues();
            }
            Ext.apply(store.proxy.extraParams, jsonData);
            Ext.apply(store.proxy.extraParams, {
                "entityCode": "ExtSystemLogEntity",
                "limit": 50
            });
        });

    dataStoreTSystemOperatesModel.loadPage(1);

    return dataGridTSystemOperatesModel;
}

//搜索系统日志
function searchSysOperate(grid, obj) {
    if (grid.searchForm == null) {
        grid.searchForm = Ext.create('Ext.form.FormPanel', {
            bodyPadding: 5,
            region: 'center',
            autoScroll: true,
            layout: "column",
            defaults: {
                labelWidth: 60,
                margin: '5 5 5 5',
                labelAlign: 'right',
                emptyText: '可输入…'
            },
            listeners: {
                render: function (obj, eOpts) {
                    new Ext.KeyMap(obj.getEl(), [{
                        key: 13,
                        fn: function () {
                            dataGrid.getStore().loadPage(1);
                        },
                        scope: this
                    }]);
                }
            },
            items: [{
                fieldLabel: '开始时间',
                columnWidth: 0.5,
                name: "where['systemLogDateTime>=']",
                xtype: 'datefield',
                format: 'Y-m-d'
            }, {
                fieldLabel: '结束时间',
                columnWidth: 0.5,
                name: "where['systemLogDateTime<=']",
                xtype: 'datefield',
                format: 'Y-m-d'
            },
                {
                    fieldLabel: '操作用户',
                    columnWidth: 0.5,
                    name: "where['a__managerName%?%']",
                    xtype: 'textfield'
                },
                {
                    fieldLabel: '关键字',
                    columnWidth: 0.5,
                    name: "where['systemLogContent%?%']",
                    xtype: 'textfield'
                }]
        });

        var title = obj.text;
        if (Ext.isEmpty(title)) {
            title = "搜索系统日志";
        }
        grid.searchWin = Ext.create('Ext.window.Window', {
            title: title,
            closeAction: 'hide',
            width: 500,
            minWidth: 500,
            minHeight: 110,
            height: 200,
            layout: 'border',
            constrain: true,
            iconCls:'extIcon extSearch',
            resizable: true,
            collapsible: true,
            animateTarget: obj,
            items: [grid.searchForm],
            buttons: [{
                text: '重置',
                iconCls:'extIcon extReset',
                handler: function () {
                    grid.searchForm.reset();
                    grid.getStore().loadPage(1);
                }
            },
                {
                    text: '搜索',
                    iconCls: 'extIcon extSearch',
                    handler: function () {
                        grid.getStore().loadPage(1);
                    }
                }]
        });
    }
    grid.searchWin.show();
    return grid.searchWin;
}

//系统版本信息
function systemVersion() {
    var dataStoreVersion = Ext.create('Ext.data.Store', {
        autoLoad: false,
        fields: [],
        data: [
            {
                "name": "当前版本",
                "value": system["version"].desc
            },
            {
                "name": "系统环境",
                "value": system["os"].value
            },
            {
                "name": "数据库",
                "value": system["db"].value
            },
            {
                "name": "运行服务器",
                "value": system["server"].value
            },
            {
                "name": "开发语言",
                "value": system["java"].value + "+ExtJs6.2.0+HTML5+CSS3"
            },
            {
                "name": "开发服务商",
                "value": "<a href='" + system["developer"].href + "' target='_blank'>" + system["developer"].value + "</a>"
            }]
    });

    var dataGridVersion = Ext.create('Ext.grid.Panel', {
        region: 'center',
        border: 0,
        power:true,
        multiColumnSort: true,
        columnLines: true,
        title: '系统版本信息',
        iconCls: 'extIcon extVersion',
        hideHeaders: true,
        store: dataStoreVersion,
        columns: [{
            header: '名称',
            dataIndex: 'name',
            flex: 0.5,
            align: 'center',
            listeners: {
                dblclick: function (grid, obj, celNo, obj1, obj2, rowNo, e) {
                    if (celNo == 0) {
                        showSystemVersion();
                    }
                }
            }
        },
            {
                header: '描述',
                dataIndex: 'value',
                flex: 0.5,
                align: 'center',
                listeners: {
                    dblclick: function (grid, obj, celNo, obj1, obj2, rowNo, e) {
                        if (celNo == 0) {
                            showSystemVersion();
                        }
                    }
                }
            }]
    });
    return dataGridVersion;
}

//操作手册
function systemConfig() {
    var setPanel = Ext.create('Ext.form.FormPanel', {
        url: 'ext/config/saveSystemConfig',
        bodyPadding: 5,
        method: 'POST',
        region: 'center',
        power: true,
        border: 0,
        title: '系统全局设置',
        iconCls: 'extIcon extSet',
        autoScroll: true,
        defaults: {
            labelWidth: 100,
            margin: '5 5 5 5',
            labelAlign: 'right',
            emptyText: '请填写'
        },
        viewModel: {
            data: null
        },
        layout: "column",
        items: [
            {
                xtype: 'fieldset',
                title: '基本设置',
                columnWidth: 1,
                defaults: {
                    anchor: '100%'
                },
                items: [
                    {
                        name: 'theme-color',
                        xtype: 'colorfield',
                        fieldLabel: '系统主题色',
                        columnWidth: 1,
                        bind: '{theme-color}'
                    },
                    {
                        name: 'window-anim',
                        fieldLabel: '系统窗体动画',
                        columnWidth: 1,
                        xtype: 'combo',
                        displayField: 'text',
                        valueField: 'id',
                        editable: false,
                        value: 1,
                        bind: '{window-anim}',
                        store: getYesOrNoDataStore()
                    }
                ]
            },
            {
                xtype: 'button',
                text: '恢复默认',
                margin: '5 0 0 5',
                columnWidth: 0.5,
                handler: function () {
                    Ext.Msg.confirm("系统提醒", "您确定恢复系统默认的配置吗？",
                        function (button, text) {
                            if (button == "yes") {
                                showWait("请稍后……");
                                setPanel.getForm().reset();
                                server.deleteSystemConfig(function (success, message) {
                                    hideWait();
                                    if (success) {
                                        location.reload();
                                    } else {
                                        showAlert("系统提醒", message);
                                    }
                                });
                            }
                        });
                }
            },
            {
                xtype: 'button',
                text: '保存配置',
                columnWidth: 0.5,
                margin: '5 5 0 5',
                handler: function () {
                    setPanel.doSubmit();
                }
            }],
        doSubmit: function () {
            var form = setPanel.form;
            if (form.isValid()) {
                form.submit({
                    waitMsg: '正在保存配置中……',
                    success: function (form, action) {
                        Ext.Msg.alert('系统设置', '设置保存成功！', function (btn) {
                            if (btn == "ok") {
                                location.reload();
                            }
                        });
                        win.close();
                    },
                    failure: function (form, action) {
                        Ext.Msg.alert('保存失败', action.result.message);
                    }
                });
            }
        }
    });
    server.showSystemConfig(function (success, data) {
        if (success) {
            setPanel.getViewModel().setData(data);
        }
    });
    return setPanel;
}

/**
 * 显示TSystemVersionModel的数据列表
 */
function showSystemVersion(tabText) {
    if (Ext.isEmpty(tabText)) {
        tabText = "TSystemVersionModel";
    }
    var dataStoreTSystemVersionModel = Ext.create('Ext.data.Store', {
        autoLoad: false,
        fields: [],
        idProperty: 'versionId',
        modelName: 'TSystemVersionModel',
        pageSize: 10,
        proxy: {
            type: 'ajax',
            url: 'showDataList',
            actionMethods: {
                create: 'POST',
                read: 'POST',
                update: 'POST',
                destroy: 'POST'
            },
            reader: {
                type: 'json',
                root: 'list',
                totalProperty: 'totalRow'
            }
        }
    });

    var pagingtoolbar = Ext.create('Ext.toolbar.Paging', {
        store: dataStoreTSystemVersionModel,
        dock: 'bottom',
        pageSize: dataStoreTSystemVersionModel.pageSize,
        displayInfo: true,
        overflowHandler: 'scroller'
    });

    var dataGridTSystemVersionModel = Ext.create('Ext.grid.Panel', {
        region: 'center',
        multiColumnSort: true,
        border: 0,
        tabText: tabText,
        searchForm: null,
        searchWin: null,
        gridCode: function () {
            return $.md5(this.tabText + this.getStore().modelName);
        },
        columnLines: true,
        store: dataStoreTSystemVersionModel,
        columns: [{
            header: '编号',
            dataIndex: 'versionId',
            width: 220,
            align: 'center',
            locked: true,
            hidden: true,
            field: 'numberfield'
        },
            {
                header: '版本号',
                dataIndex: 'versionName',
                width: 220,
                align: 'center'
            },
            {
                header: '版本值',
                dataIndex: 'versionValue',
                minWidth: 120,
                flex: 1,
                align: 'center'
            }],
        tbar: {
            xtype: 'toolbar',
            dock: 'top',
            overflowHandler: 'menu',
            items: [{
                xtype: 'button',
                text: '发布版本',
                icon: iconAdd,
                tipText: getAddToolTip(),
                //hidden: !isPermission(tabText, "添加"),
                handler: function () {
                    addTSystemVersionModel(this, dataGridTSystemVersionModel);
                }
            },
                {
                    xtype: 'button',
                    text: '删除版本',
                    icon: iconDelete,
                    disabled: true,
                    //hidden: !isPermission(tabText, "删除"),
                    id: 'btnDeleteTSystemVersionModel',
                    tipText: getDelToolTip(),
                    handler: function () {
                        deleteData(dataGridTSystemVersionModel);
                    }
                }]
        },
        plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 2
        }), {
            ptype: 'rowexpander',
            rowBodyTpl: new Ext.XTemplate('<p>更新描述: {versionDetails}</p>', '<p>更新时间: {versionDateTime}</p>')
        }],

        listeners: {
            selectionchange: function () {
                var data = this.getSelectionModel().getSelection();
                Ext.getCmp("btnDeleteTSystemVersionModel").setDisabled(!(data.length > 0));
            }
        },
        dockedItems: [pagingtoolbar],
        viewConfig: {
            loadMask: {
                msg: '正在为您在加载数据…'
            }
        }
    });

    var checkAutoSubmit = function () {
        if (isPermission(tabText, "修改")) {
            if (dataGridTSystemVersionModel.operateSet != null && dataGridTSystemVersionModel.operateSet.autoCommitUpdate) {
                backToSubmitUpdate(dataGridTSystemVersionModel);
            }
        }
    }

    dataGridTSystemVersionModel.on('edit',
        function (editor, context, e) {
            if (hasModified(context.record)) {
                checkAutoSubmit();
            }
        });

    pagingtoolbar.insert(0, getPageControl(dataStoreTSystemVersionModel));

    dataStoreTSystemVersionModel.on('beforeload',
        function (store, options) {
            dataGridTSystemVersionModel.getSelectionModel().deselectAll();
            var jsonData = {}; //可以添加额外参数，例如 jsonData['userId']=1;
            if (dataGridTSystemVersionModel.searchForm != null) {
                jsonData = mergeJson([jsonData, dataGridTSystemVersionModel.searchForm.getValues()])
            }
            Ext.apply(store.proxy.extraParams, {
                "whereJsonData": Ext.encode(jsonData)
            });

            Ext.apply(store.proxy.extraParams, {
                "modelName": store.modelName,
                "limit": store.pageSize
            });
        });

    dataStoreTSystemVersionModel.loadPage(1);

    var win = Ext.create('Ext.window.Window', {
        title: '系统更新日志',
        height: 350,
        width: 600,
        layout: 'fit',
        icon: 'icons/icon_version.svg',
        minWidth: 300,
        minHeight: 220,
        resizable: true,
        items: [dataGridTSystemVersionModel]
    }).show();

}

/**
 * 添加TSystemVersionModel
 */
function addTSystemVersionModel(obj, dataGrid) {
    var formPanel = Ext.create('Ext.form.FormPanel', {
        url: 'addData',
        bodyPadding: 5,
        method: 'POST',
        region: 'center',
        fileUpload: true,
        autoScroll: true,
        defaults: {
            labelWidth: 60,
            margin: '5 5 5 5',
            labelAlign: 'right',
            emptyText: '请填写'
        },
        layout: "column",
        items: [{
            name: 'map.versionName',
            fieldLabel: '版本号',
            columnWidth: 1,
            xtype: 'textfield',
            allowBlank: false
        },
            {
                name: 'map.versionValue',
                fieldLabel: '版本值',
                columnWidth: 1,
                xtype: 'numberfield'
            },
            {
                name: 'map.versionDetails',
                fieldLabel: '版本介绍',
                columnWidth: 1,
                xtype: 'htmleditor',
                fontFamilies: fonts,
                height: 300,
                plugins: [Ext.create('Ext.form.HtmlEditorImage')]
            }]
    });

    var title = obj.text;
    if (Ext.isEmpty(title)) {
        title = "添加数据";
    }
    var addTSystemVersionModelWin = Ext.create('Ext.window.Window', {
        title: title,
        height: 520,
        icon: iconAddWhite,
        width: 620,
        layout: 'border',
        resizable: true,
        maximizable: true,
        animateTarget: obj,
        items: [formPanel],
        modal: true,
        buttons: [{
            text: '重置',
            icon: iconReset,
            handler: function () {
                formPanel.form.reset();
            }
        },
            {
                text: '添加',
                icon: iconOk,
                handler: function () {
                    var form = formPanel.form;
                    if (form.isValid()) {
                        form.submit({
                            submitEmptyText: false,
                            params: {
                                "modelName": dataGrid.getStore().modelName
                            },
                            waitMsg: '正在提交中……',
                            success: function (form, action) {
                                Ext.Msg.alert('系统提醒', "添加成功！",
                                    function (btn) {
                                        if (btn == "ok") {
                                            $.post("refreshSystemVersion",
                                                function () {
                                                    location.reload();
                                                });
                                        }
                                    });
                            },
                            failure: function (form, action) {
                                addTSystemVersionModelWin.close();
                                try {
                                    if (action.result.sessionInvalid) {
                                        Ext.Msg.alert('系统提醒', "会话失效，请重新登录！",
                                            function () {
                                                showLogin();
                                            });
                                        return;
                                    }
                                } catch (err) {
                                    Ext.Msg.alert('系统提醒', "添加失败！");
                                }
                                Ext.Msg.alert('系统提醒', "添加失败！");
                            }
                        });
                    }
                }
            }]
    });
    addTSystemVersionModelWin.show();
}