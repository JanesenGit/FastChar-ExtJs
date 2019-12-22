function getWelcomePanel() {
    let accordionPanel = Ext.create('Ext.panel.Panel', {
        layout: {
            type: 'accordion'
        },
        region: 'center',
        border: 0,
        flex: 0.6,
        items: [
            systemOperate(),
            systemWaitNotice(),
            systemBugReport()
        ]
    });

    let rightItems = [systemVersion()];
    if (system.isSuperRole()) {
        rightItems.push(systemConfig());
        rightItems.push(systemMonitor());
    }

    let rightPanel = Ext.create('Ext.panel.Panel', {
        layout: 'accordion',
        region: 'east',
        border: 0,
        flex: 0.4,
        collapsed: false,
        split: true,
        subtitle: '系统右侧面板',
        items: rightItems
    });

    let items = [accordionPanel, rightPanel];
    //自定义welcome组件
    if (window["initWelcomeItems"]) {
        window["initWelcomeItems"](items);
    }

    checkSystemWait(true);
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
        pageSize: 20,
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
        border: 0,
        overflowHandler: 'scroller',
        displayInfo: true
    });


    let dataGridTSystemOperatesModel = Ext.create('Ext.grid.Panel', {
        region: 'center',
        border: 0,
        power: true,
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
            rowBodyTpl: new Ext.XTemplate(
                '<p>管理员: {a__managerName}</p>',
                '<p>操作说明: {systemLogContent}</p>',
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
        iconCls: 'extIcon extSearch',
        tooltip: '搜索日志',
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
                    try {
                        new Ext.util.KeyMap({
                            target: obj.getEl(),
                            key: 13,
                            fn: function () {
                                dataGrid.getStore().loadPage(1);
                            },
                            scope: this
                        });
                    } catch (e) {
                        console.error(e);
                    }
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
            iconCls: 'extIcon extSearch',
            resizable: true,
            collapsible: true,
            animateTarget: obj,
            items: [grid.searchForm],
            buttons: [{
                text: '重置',
                iconCls: 'extIcon extReset',
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


//获得系统进行中的路由
function systemLive() {
    let liveDataStore = Ext.create('Ext.data.Store', {
        autoLoad: false,
        fields: [],
        proxy: {
            type: 'ajax',
            url: 'live',
            actionMethods: {
                create: 'POST',
                read: 'POST',
                update: 'POST',
                destroy: 'POST'
            },
            reader: {
                type: 'json',
                root: 'data'
            }
        }
    });


    let liveDateGrid = Ext.create('Ext.grid.Panel', {
        border: 0,
        columnWidth: 1,
        power: true,
        multiColumnSort: true,
        columnLines: true,
        hideHeaders: true,
        store: liveDataStore,
        columns: [
            {
                header: '路由名称',
                dataIndex: 'routeName',
                align: 'center',
                width: 100
            },
            {
                header: '路由类名',
                dataIndex: 'routeClass',
                align: 'center',
                flex: 1
            },
            {
                header: '进入时间',
                dataIndex: 'routeInTime',
                width: 200,
                align: 'center'
            }],
        viewConfig: {
            enableTextSelection: true,
            loadMask: {
                msg: '正在为您在加载数据…'
            }
        }
    });
    liveDataStore.loadPage(1);

    let livePanel = Ext.create('Ext.panel.Panel', {
        layout: 'column',
        region: 'center',
        power: false,
        border: 0,
        bodyPadding: 5,
        title: '系统进行中的路由',
        iconCls: 'extIcon extLog',
        closable: false,
        autoScroll: true,
        items: [
            liveDateGrid,
            {
                xtype: 'button',
                text: '刷新信息',
                columnWidth: 1,
                margin: '5 5 5 5',
                handler: function (obj) {
                    liveDataStore.loadPage(1);
                }
            }
        ]
    });

    return livePanel;
}

//系统版本信息
function systemVersion() {
    let data = [
        {
            "name": "项目名称",
            "value": system["title"].value
        },
        {
            "name": "项目版本",
            "value": system["version"].desc
        },
        {
            "name": "项目位置",
            "value": system["root"].value
        },
        {
            "name": "操作文档",
            "value": "<a href='" + system["doc-extjs"].href + "' target='_blank' >" + system["doc-extjs"].value + "</a>"
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
            "name": "服务器位置",
            "value": system["catalina"].value
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
            "name": "开发服务商",
            "value": "<a href='" + system["developer"].href + "' target='_blank'>" + system["developer"].value + "</a>"
        }, {
            "name": "版权归属",
            "value": "<a href='" + getExt("copyright").href + "' target='_blank'>" + getExt("copyright").value + "</a>"
        }];
    return createDetailsGrid(data, {
        title: '系统基本信息',
        iconCls: 'extIcon extVersion',
        power: false,
        hideHeaders: true
    }, {}, {
        align: 'center'
    });
}

//系统配置
function systemConfig() {
    let setPanel = Ext.create('Ext.form.FormPanel', {
        url: 'ext/config/saveSystemConfig',
        bodyPadding: 5,
        method: 'POST',
        region: 'center',
        power: false,
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


//系统监控
function systemMonitor() {
    let monitorPanel = Ext.create('Ext.panel.Panel', {
        layout: 'column',
        region: 'north',
        power: false,
        border: 0,
        bodyPadding: 5,
        title: '系统监控信息',
        iconCls: 'extIcon extMonitor',
        closable: false,
        autoScroll: true
    });

    let loadData = function (container) {
        server.loadMonitor(function (success, result) {
            container.removeAll();
            let desc = result.desc;
            let data = result.data;
            let alertCount = 0;
            for (let i = 0; i < desc.length; i++) {
                let objDesc = desc[i];
                let items = [];
                for (let objDescKey in objDesc) {
                    if (objDescKey == 'title') {
                        continue;
                    }
                    let config = {
                        xtype: 'textfield',
                        fieldLabel: objDesc[objDescKey],
                        bind: '{' + objDescKey + '}'
                    };
                    items.push(config);
                }
                let objData = data[i];
                let title = objDesc.title;
                if (objData.alert) {
                    alertCount++;
                    title = "<b style='color: #c21904;'>" + title + "【预警】</b>";
                }
                let cpuPanel = {
                    xtype: 'fieldset',
                    title: title,
                    columnWidth: 1,
                    collapsible: true,
                    viewModel: {
                        data: objData
                    },
                    defaults: {
                        anchor: '100%',
                        labelAlign: 'right',
                        labelWidth: 80,
                        columnWidth: 1,
                        disabled: true,
                        disabledCls: ".x-item-disabled-normal"
                    },
                    items: items
                };
                container.add(cpuPanel);
            }

            let button = {
                xtype: 'button',
                text: '刷新信息',
                columnWidth: 1,
                margin: '5 5 5 5',
                handler: function (obj) {
                    obj.setText("正在刷新");
                    obj.setDisabled(true);
                    loadData(container);
                }
            };
            container.add(button);
            if (alertCount > 0) {
                container.setTitle("<b style='color: #c21904;' >系统监控信息（" + alertCount + "个预警）</b>");
            }
        });
    };
    loadData(monitorPanel);
    return monitorPanel;
}


//获得系统问题上报
function systemBugReport() {
    let entity = new ExtBugReportEntity();
    entity.menu = {
        text: "系统问题上报"
    };
    let dataStoreBugReport = Ext.create('Ext.data.Store', {
        autoLoad: false,
        fields: [],
        id: 'SystemBugReportStore',
        pageSize: 50,
        entity: entity,
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
        store: dataStoreBugReport,
        dock: 'bottom',
        border: 0,
        overflowHandler: 'scroller',
        displayInfo: true
    });


    let dataGridBugReport = Ext.create('Ext.grid.Panel', {
        region: 'center',
        border: 0,
        power: true,
        multiColumnSort: true,
        iconCls: 'extIcon extBug',
        columnLines: true,
        title: '系统问题上报',
        hideHeaders: true,
        store: dataStoreBugReport,
        refreshCount: function () {
            let me = this;
            server.countReport(function (success, count) {
                if (count > 0) {
                    me.setTitle("系统问题上报 <span style='color: red;font-size: small;'>待处理（" + count + "）</span>");
                } else {
                    me.setTitle("系统问题上报");
                }
            });
        },
        columns: [
            {
                header: '功能类型',
                dataIndex: 'funcTypeStr',
                align: 'center',
                width: 100
            },
            {
                header: '问题反馈',
                dataIndex: 'bugContent',
                align: 'center',
                flex: 1,
                renderer: renders.text()
            },
            {
                header: '反馈状态',
                dataIndex: 'reportStateStr',
                width: 65,
                align: 'center'
            },
            {
                header: '上报时间',
                dataIndex: 'reportDateTime',
                width: 120,
                align: 'center'
            }, {
                header: '操作',
                dataIndex: 'reportId',
                width: 100,
                align: 'center',
                renderer: function (val) {
                    return "<a href=\"javascript:showBugReportDetails(" + val + ");\">查看详情</a>";
                }
            }],
        dockedItems: [pagingtoolbar],
        viewConfig: {
            enableTextSelection: true,
            loadMask: {
                msg: '正在为您在加载数据…'
            }
        }
    });


    let beginIndex = 2;

    pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, "-");
    pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, {
        xtype: 'button',
        iconCls: 'extIcon extSearch',
        tooltip: '搜索问题',
        handler: function () {
            dataGridBugReport.add(searchBugReport(dataGridBugReport, this));
        }
    });
    pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, "-");
    pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, {
        xtype: 'button',
        iconCls: 'extIcon extAdd grayColor',
        tooltip: '添加问题',
        handler: function () {
            entity.showAdd(this).then(function () {
                dataStoreBugReport.loadPage(1);
            });
        }
    });


    dataStoreBugReport.on('beforeload', function (store, options) {
        let jsonData = {};
        if (dataGridBugReport.searchForm != null) {
            jsonData = dataGridBugReport.searchForm.getValues();
        }
        Ext.apply(store.proxy.extraParams, jsonData);
        Ext.apply(store.proxy.extraParams, {
            "entityCode": "ExtBugReportEntity",
            "limit": 50
        });
    });
    dataStoreBugReport.on('load', function (store, records, successful, operation, eOpts) {
        dataGridBugReport.refreshCount();
    });

    dataStoreBugReport.loadPage(1);
    return dataGridBugReport;
}


function showBugReportDetails(id) {
    let store = Ext.getStore("SystemBugReportStore");
    let record = store.findRecord("reportId", id, 0, false, false, true);
    let buildData = function (data) {
        let array = [];
        let names = {
            "a__managerName": "上报用户",
            "funcTypeStr": "功能类型",
            "funcName": "功能名称",
            "bugContent": "问题描述",
            "bugFlow": "操作步骤",
            "bugImagesHtml": "问题截图",
            "fixInfo": "修改意见",
            "reportStateStr": "上报状态",
            "reportDateTime": "上报时间"
        };
        for (let key in names) {
            array.push({
                "name": names[key],
                "value": data[key]
            });
        }
        return array;
    };

    let grid = createDetailsGrid(buildData(record.getData()), {
        region: 'center',
        power: false,
        hideHeaders: true
    }, {
        width: 100,
        flex: 0,
    }, {
        align: 'left'
    });


    let win = Ext.create('Ext.window.Window', {
        title: "问题详情",
        height: 500,
        iconCls: 'extIcon extDetails',
        width: 500,
        layout: 'border',
        resizable: true,
        maximizable: true,
        items: [grid],
        modal: true,
        constrain: true,
        buttons: [
            "->",
            {
                text: '删除问题',
                iconCls: 'extIcon extDelete whiteColor',
                handler: function () {
                    Ext.Msg.show({
                        title: "系统提醒",
                        icon: Ext.Msg.QUESTION,
                        message: "您确定这条问题吗？",
                        buttons: Ext.Msg.YESNO,
                        defaultFocus: "no",
                        callback: function (button, text) {
                            if (button == "yes") {
                                commitStoreDelete(store, [record]).then(function () {
                                    win.close();
                                });
                            }
                        }
                    });
                }
            },
            {
                text: '反馈修改意见',
                iconCls: 'extIcon extEdit',
                handler: function () {
                    editorText(this, "提交修改意见", function (text) {
                        record.set("fixInfo", text);
                        record.set("reportState", 1);
                        record.set("reportStateStr", "已处理");
                        commitStoreUpdate(store);
                        grid.updateData(buildData(record.getData()));
                    });
                }
            }]
    });
    win.show();
}


//搜索系统日志
function searchBugReport(grid, obj) {
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
                    try {
                        new Ext.util.KeyMap({
                            target: obj.getEl(),
                            key: 13,
                            fn: function () {
                                dataGrid.getStore().loadPage(1);
                            },
                            scope: this
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
            },
            items: [
                {
                    name: "where['funcType']",
                    xtype: "enumcombo",
                    fieldLabel: "功能类型",
                    columnWidth: 0.5,
                    enumName: "FuncTypeEnum"
                },
                {
                    name: "where['reportState']",
                    xtype: "enumcombo",
                    fieldLabel: "上报状态",
                    columnWidth: 0.5,
                    enumName: "ReportStateEnum"
                },
                {
                    fieldLabel: '开始时间',
                    columnWidth: 0.5,
                    name: "where['reportDateTime>=']",
                    xtype: 'datefield',
                    format: 'Y-m-d'
                },
                {
                    fieldLabel: '结束时间',
                    columnWidth: 0.5,
                    name: "where['reportDateTime<=']",
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
            title = "搜索问题上报";
        }
        grid.searchWin = Ext.create('Ext.window.Window', {
            title: title,
            closeAction: 'hide',
            width: 500,
            minWidth: 500,
            minHeight: 110,
            height: 250,
            layout: 'border',
            constrain: true,
            iconCls: 'extIcon extSearch',
            resizable: true,
            collapsible: true,
            animateTarget: obj,
            items: [grid.searchForm],
            buttons: [{
                text: '重置',
                iconCls: 'extIcon extReset',
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


//获得系统待办事项
function systemWaitNotice() {
    let entity = new ExtSystemNoticeEntity();
    entity.menu = {
        text: "系统问题上报"
    };
    let dataStoreNotice = Ext.create('Ext.data.Store', {
        autoLoad: false,
        fields: [],
        id: "SystemWaitNoticeStore",
        entity: entity,
        pageSize: 20,
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
        store: dataStoreNotice,
        dock: 'bottom',
        border: 0,
        overflowHandler: 'scroller',
        displayInfo: true
    });


    let dataGridNotice = Ext.create('Ext.grid.Panel', {
        region: 'center',
        border: 0,
        power: true,
        multiColumnSort: true,
        iconCls: 'extIcon extTip',
        columnLines: true,
        title: '系统待办事项',
        hideHeaders: true,
        store: dataStoreNotice,
        columns: [
            {
                header: '待办标题',
                dataIndex: 'noticeTitle',
                align: 'center',
                width: 100
            },
            {
                header: '处理人',
                dataIndex: 'a__managerName',
                align: 'center',
                flex: 1
            },
            {
                header: '待办内容',
                dataIndex: 'noticeStateStr',
                align: 'center',
                width: 120,
            },
            {
                header: '录入时间',
                dataIndex: 'noticeDateTime',
                width: 200,
                align: 'center'
            }],
        plugins: [{
            ptype: 'rowexpander',
            rowBodyTpl: new Ext.XTemplate(
                '<p>【{noticeTitle}】{noticeContent}</p>',
                "<tpl if='noticeState==0' ><p><a id='aNoticeAction{noticeId}' href='javascript:doneSystemWait({noticeId});'>标记为已读</a></p></tpl>"
            )
        }],
        dockedItems: [pagingtoolbar],
        viewConfig: {
            enableTextSelection: true,
            loadMask: {
                msg: '正在为您在加载数据…'
            }
        }
    });


    dataStoreNotice.on('beforeload',
        function (store, options) {
            let jsonData = {};
            if (dataGridNotice.searchForm != null) {
                jsonData = dataGridNotice.searchForm.getValues();
            }
            Ext.apply(store.proxy.extraParams, jsonData);
            Ext.apply(store.proxy.extraParams, {
                "entityCode": "ExtSystemNoticeEntity",
                "limit": 50
            });
        });

    dataStoreNotice.loadPage(1);

    return dataGridNotice;
}

function doneSystemWait(noticeId) {
    showWait("正在标记中，请稍后……");
    server.doneWaitNotice(noticeId, function (success, message) {
        hideWait();
        if (success) {
            toast(message);
            $("#aNoticeAction" + noticeId).remove();
            let winItem = Ext.getCmp("bNoticeAction" + noticeId);
            if (winItem) {
                Ext.getCmp("bNoticeAction" + noticeId).destroy();
                let noticeWin = Ext.getCmp("NoticeAlertWindow");
                if (noticeWin) {
                    let $type = $("[type='bNoticeAction']");
                    if ($type.length == 0) {
                        noticeWin.close();
                    }
                }
            }
        } else {
            showAlert("系统提醒", message);
        }
    });
}


function checkSystemWait(justRefresh) {
    window.clearTimeout(server.checkWaitNoticeTimer);
    let params = {};
    if (!justRefresh) {
        let $type = $("[type='bNoticeAction']");
        for (let i = 0; i < $type.length; i++) {
            params["noticeId_" + i] = $($type[i]).attr("data-id");
        }
    }
    server.checkWaitNotice(params, function (success, data) {
        try {
            if (success) {
                let noticeWin = Ext.getCmp("NoticeAlertWindow");
                if (data.length <= 0 && Object.keys(params).length == 0) {
                    if (noticeWin) {
                        noticeWin.close();
                    }
                    return;
                }
                let winItems = [];
                let needRefresh = false;
                for (let i = 0; i < data.length; i++) {
                    let notice = data[i];
                    let noticePanel = {
                        xtype: 'fieldset',
                        margin: '10',
                        id: 'bNoticeAction' + notice.noticeId,
                        style: {
                            background: '#ffffff'
                        },
                        columnWidth: 1,
                        viewModel: {
                            data: notice
                        },
                        defaults: {
                            anchor: '100%',
                            height: 'auto',
                            margin: '0',
                            labelAlign: 'right',
                            labelWidth: 0,
                            columnWidth: 1,
                            disabled: true,
                            disabledCls: ".x-item-disabled-normal"
                        },
                        items: [
                            {
                                xtype: 'displayfield',
                                bind: '{noticeContent}',
                                renderer: function (val, field) {
                                    let viewData = field.ownerCt.viewModel.data;
                                    let html = "<b style='display: block;font-size: 16px;margin-bottom: 10px;'>" + viewData.noticeTitle + "</b>";
                                    html += "<div>" + val + "</div>";
                                    html += "<div style='margin-top: 10px;display: flex;' >" +
                                        "<a type='bNoticeAction' data-id='" + viewData.noticeId + "' href='javascript:doneSystemWait(" + viewData.noticeId + ");'>标记为已读</a>";

                                    if (!Ext.isEmpty(viewData.noticeAction)) {
                                        html += "&nbsp;&nbsp;&nbsp;&nbsp;<a href=\"javascript:" + viewData.noticeAction + ";\">立即前往</a>";
                                    }
                                    html += "<span style='flex: 1;text-align: right;'>" + viewData.noticeDateTime + "</span>" +
                                        "</div>";
                                    html += "<div style='font-size: smaller;color: #a0a0a0;margin-top: 10px;'>注：如果已处理请标记为已读！</div>";
                                    return html;
                                }
                            }
                        ]
                    };
                    winItems.push(noticePanel);
                    if ($("#bNoticeAction" + notice.noticeId).length == 0) {
                        needRefresh = true;
                    }
                }

                if (!needRefresh && !justRefresh) {
                    return;
                }

                if (!noticeWin) {
                    noticeWin = Ext.create('Ext.window.Window', {
                        title: '系统待办事项',
                        id: 'NoticeAlertWindow',
                        width: 400,
                        height: 400,
                        layout: 'column',
                        closable: false,
                        constrain: true,
                        iconCls: 'extIcon extTip',
                        resizable: false,
                        scrollable: true,
                        tools: [
                            {
                                type: 'refresh',
                                callback: function () {
                                    Ext.getStore("SystemWaitNoticeStore").loadPage(1);
                                    checkSystemWait(true);
                                }
                            }
                        ],
                        collapsible: true,
                    });
                    noticeWin.showAt($(window).width() * 5, $(window).width() * 5);
                }
                if (justRefresh) {
                    noticeWin.removeAll();
                    noticeWin.add(winItems);
                } else {
                    noticeWin.insert(0, winItems);
                    noticeWin.setScrollY(0, true);
                }
            }
        } finally {
            server.checkWaitNoticeTimer = setTimeout(function () {
                checkSystemWait();
            }, 3000);
        }
    });
}