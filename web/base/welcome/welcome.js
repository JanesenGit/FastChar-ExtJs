function getWelcomePanel() {
    let accordionPanel = Ext.create('Ext.panel.Panel', {
        layout: {
            type: 'accordion'
        },
        region: 'center',
        border: 0,
        items:[
            systemOperate(),systemVersion(),systemConfig()
        ]
    });

    let weatherPanel = Ext.create('Ext.panel.Panel', {
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
    let timerPanel = Ext.create('Ext.panel.Panel', {
        layout: 'fit',
        region: 'center',
        border: 0,
        listeners: {
            afterrender: function (obj, eOpts) {
                obj.update("<iframe src='" + system.formatUrlVersion('base/welcome/timer.html') + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
            }
        }
    });

    let rightPanel = Ext.create('Ext.panel.Panel', {
        layout: 'border',
        region: 'east',
        border: 0,
        width: 255,
        items: [weatherPanel, timerPanel]
    });

    let items = [accordionPanel];
    if (toBool(getExt("weather-plugin").value, true)) {
        items.push(rightPanel);
    }
    return Ext.create('Ext.panel.Panel', {
        layout: 'border',
        border: 0,
        items: items
    });
}

//获得系统操作日志
function systemOperate() {
    let dataStoreTSystemOperatesModel = Ext.create('Ext.data.Store', {
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

    let pagingtoolbar = Ext.create('Ext.toolbar.Paging', {
        store: dataStoreTSystemOperatesModel,
        dock: 'bottom',
        overflowHandler: 'scroller',
        displayInfo: true
    });


    let dataGridTSystemOperatesModel = Ext.create('Ext.grid.Panel', {
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
                '<p>来自IP: <a target="_blank" href="https://www.baidu.com/s?wd=IP%E5%9C%B0%E5%9D%80%3A{systemLogIp}">{systemLogIp}</a></p>',
                '<p>浏览器: {systemLogClient}</p>',
                '<p><br/> {systemLogData}</p>')
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
            let jsonData = {};
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

        let title = obj.text;
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
    let dataStoreVersion = Ext.create('Ext.data.Store', {
        autoLoad: false,
        fields: [],
        data: [
            {
                "name": "项目版本",
                "value": system["version"].desc
            },
            {
                "name": "本机IP地址",
                "value": system["host"].value
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
                "name": "核心框架",
                "value": "<a href='http://www.fastchar.com' target='_blank' >" + system["fastchar"].value + "</a>"
            },
            {
                "name": "开发语言",
                "value": system["java"].value + "+ExtJs6.2.0+HTML5+CSS3"
            },
            {
                "name": "JVM信息",
                "value": system["jvm"].value
            },
            {
                "name": "开发服务商",
                "value": "<a href='" + system["developer"].href + "' target='_blank'>" + system["developer"].value + "</a>"
            },{
                "name": "版权归属",
                "value": "<a href='" + getExt("copyright").href + "' target='_blank'>" + getExt("copyright").value + "</a>"
            }]
    });

    let dataGridVersion = Ext.create('Ext.grid.Panel', {
        region: 'center',
        border: 0,
        power:true,
        multiColumnSort: true,
        columnLines: true,
        title: '系统基本信息',
        iconCls: 'extIcon extVersion',
        hideHeaders: true,
        store: dataStoreVersion,
        viewConfig: {
            enableTextSelection: true
        },
        columns: [{
            header: '名称',
            dataIndex: 'name',
            flex: 0.3,
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
                flex: 0.7,
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
    let setPanel = Ext.create('Ext.form.FormPanel', {
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
                        fieldLabel: '系统主题颜色',
                        columnWidth: 1,
                        bind: '{theme-color}'
                    },
                    {
                        name: 'front-color',
                        xtype: 'colorfield',
                        fieldLabel: '系统前景颜色',
                        columnWidth: 1,
                        bind: '{front-color}'
                    },
                    {
                        name: 'theme',
                        fieldLabel: '系统主题风格',
                        columnWidth: 1,
                        xtype: 'combo',
                        displayField: 'text',
                        valueField: 'id',
                        editable: false,
                        value: 1,
                        bind: '{theme}',
                        store: getThemeDataStore()
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
                    },
                    {
                        name: 'tab-record',
                        fieldLabel: '标签记忆功能',
                        columnWidth: 1,
                        xtype: 'combo',
                        displayField: 'text',
                        valueField: 'id',
                        editable: false,
                        value: 1,
                        bind: '{tab-record}',
                        store: getYesOrNoDataStore()
                    },
                    {
                        name: 'weather-plugin',
                        fieldLabel: '右侧天气插件',
                        columnWidth: 1,
                        xtype: 'combo',
                        displayField: 'text',
                        valueField: 'id',
                        editable: false,
                        value: 1,
                        bind: '{weather-plugin}',
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
            let form = setPanel.form;
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