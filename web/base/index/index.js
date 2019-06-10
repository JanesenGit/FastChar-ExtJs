var system = {
    currTabId: -1,
    currTab: null,
    dateFormat: 'Y-m-d H:i:s',
    init: false,
    regByImage: /\.(jpg|png|gif|jpeg)$/i,
    regByMP4: /\.(mp4)$/i,
    regByExcel: /\.(xls|xlsx)$/i,
    regByWord: /\.(doc)$/i,
    regByText: /\.(txt)$/i,
    formatUrl: function (url,params) {
        if (url.startWith("http://") || url.startWith("https://")) {
            return url;
        }
        return this.formatUrlVersion(this.http + url, params);
    },
    formatUrlVersion: function (url, params) {
        var newUrl = url;
        if (url.indexOf("?") > 0) {
            newUrl = url + "&v=" + this.version.value;
        }
        newUrl = url + "?v=" + this.version.value;
        if (params) {
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    newUrl = newUrl + "&" + key + "=" + params[key];
                }
            }
        }
        return newUrl;
    },
    initConfig: function () {
        var me = this;
        var params = {};
        if (isPower()) {
            if (window.parent && Ext.isFunction(window.parent.getMenuPower)) {
                params = {menuPower: window.parent.getMenuPower()};
            }
        }
        Ext.Ajax.request({
            url: 'showConfig',
            params: params,
            success: function (response, opts) {
                var data = jsonToObject(response.responseText).data;
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        me[key] = data[key];
                    }
                }
                var allExt = getAllExt();
                for (var i = 0; i < allExt.length; i++) {
                    var head = allExt[i];
                    me[head.name] = head;
                }
                me.loadAppJs();
            },
            failure: function (response, opts) {
                showException(response.responseText, "获取系统配置！[system.initConfig]");
            }
        });
    },
    loadAppJs: function (index) {
        var me = this;
        if (index == null) {
            index = 0;
        }
        if (index >= me.app.length) {
            Ext.MessageBox.updateProgress(1, '已加载成功，正在显示中');
            addScript({src: me.formatUrlVersion('base/welcome/welcome.js')}, function () {
                addStyle({text: me.menusCss}, function () {
                    me.globalConfig();
                });
            });
            return;
        }
        Ext.MessageBox.updateProgress(parseFloat(index + 1) / parseFloat(me.length), '正在加载中，请耐心等待');
        addScript({src: me.app[index]}, function () {
            me.loadAppJs(index + 1);
        });
    },
    globalConfig: function () {
        var me = this;

        //配置entity实体类基本属性
        var entities = me.entities;
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            for (var key in entity) {
                if (entity.hasOwnProperty(key)) {
                    try {
                        var pro = eval(entity.entityCode + ".prototype");
                        pro[key] = entity[key];
                        entity.js = true;
                    } catch (e) {
                        entity.js = false;
                        break;
                    }
                }
            }
        }


        //配置是否进行权限
        if (isPower()) {
            if (window.parent && Ext.isFunction(window.parent.getExtPower)) {
                power.config = true;
                power.powers = jsonToObject(window.parent.getExtPower());
                if (!power.powers) {
                    power.powers = {};
                }
                window["getExtPower"] = function () {
                    return power.savePower();
                };
            }
        }

        Ext.Ajax.on('beforerequest', function (conn, request, options) {
            try {
                getProgressLine(toColor(getExt("front-color").value)).set(0);
                getProgressLine(toColor(getExt("front-color").value)).animate(0.7);
            } catch (e) {
            }
        });

        Ext.Ajax.on('requestcomplete',
            function (conn, response, options) {
                try {
                    if (response.status == 203) {
                        me.sessionOut();
                        me.callback = null;
                        me.success = null;
                    } else {
                        try {
                            var jsonData = eval("(" + response.responseText + ")");
                            if (jsonData.code == 203) {
                                me.sessionOut();
                            }
                        } catch (e) {
                        }
                    }

                    getProgressLine(toColor(getExt("front-color").value)).animate(1);
                } catch (e) {
                }
            });

        Ext.Ajax.on('requestexception', function (conn, response, options, eOpts) {
            try {
                showException(response.responseText, "ExtRequest请求异常！");
            } catch (e) {
            }
        });


        $(document).ajaxStart(function () {
            try {
                getProgressLine(toColor(getExt("front-color").value)).set(0);
                getProgressLine(toColor(getExt("front-color").value)).animate(0.7);
            } catch (e) {
            }
        });

        $(document).ajaxComplete(function (event, xhr, options) {
            try {
                if (xhr.status == 203) {
                    me.sessionOut();
                } else {
                    try {
                        var jsonData = eval("(" + xhr.responseText + ")");
                        if (jsonData.code == 203) {
                            me.sessionOut();
                        }
                    } catch (e) {
                    }
                }
                getProgressLine(toColor(getExt("front-color").value)).animate(1);
            } catch (e) {
            }
        });

        $(document).ajaxError(function (event, xhr, settings) {
            try {
                showException(xhr.responseText, "jquery请求异常");
            } catch (e) {
            }
        });
        me.init = true;
        me.initSystem();
    },
    initSystem: function () {
        removeLoading();
        var me = this;
        var container = getBodyContainer();
        container.removeAll();

        var systemBgColor = toColor(me["theme-color"].value);
        var systemTlColor = toColor(me["front-color"].value);
        var systemLogo = me["system-logo"].value;
        var versionName = me["version"].desc;
        var systemTitle = $("title").text() + versionName;
        if (Ext.isEmpty(systemLogo)) {
            systemLogo = "icons/icon_head_system.svg";
        }
        var headerInfo = Ext.create('Ext.toolbar.Toolbar', {
            height: 60,
            padding: '0 0 0 0',
            border: 0,
            power: false,
            style: {
                background: systemBgColor
            },
            items: [
                {
                    xtype: 'image',
                    src: systemLogo,
                    height: 50,
                    width: 50,
                    margin: '5 5 5 5'
                },
                {
                    xtype: 'displayfield',
                    margin: '0 0 0 5',
                    value: "<span style='color: " + systemTlColor + ";font-size: 20px;line-height: 20px;font-weight: 700;' >" + systemTitle + "</span>"

                },
                "->",
                {
                    xtype: 'button',
                    iconCls: 'extIcon extRole',
                    text: me.manager.managerName,
                    minWidth: 135,
                    style: {
                        background: systemTlColor,
                        borderWidth: 0,
                        color: '#eeeee'
                    },
                    menu: [{
                        text: "修改登录密码",
                        iconCls: 'extIcon extResetPassword',
                        handler: function () {
                            me.modifyPassword(this);
                        }
                    }]
                },
                {
                    xtype: 'button',
                    iconCls: 'extIcon extExits',
                    text: "退出登录",
                    hidden: power.config,
                    style: {
                        background: systemTlColor,
                        borderWidth: 0,
                        color: '#eeeee'
                    },
                    handler: function () {
                        me.logout();
                    }
                }]
        });

        var headerTip = Ext.create('Ext.toolbar.Toolbar', {
            border: 0,
            padding: '0 0 0 0',
            style: {
                background: systemBgColor
            },
            html: "<div class=\"progress\" id=\"progress\"></div>"
        });

        var headerPanel = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            region: 'north',
            height: 60,
            border: 0,
            hidden: power.config,
            items: [headerInfo, headerTip]
        });
        var leftTreeWidth = 200;
        var leftTreePanel = Ext.create('Ext.panel.Panel', {
            border: 0,
            region: 'center',
            cls: 'treelist-with-nav',
            scrollable: "y",
            items: [
                {
                    xtype: 'treelist',
                    id: 'leftTreeList',
                    reference: 'treelist',
                    expanderOnly: false,
                    singleExpand: true,
                    ui: 'nav',
                    scrollable: "y",
                    expanderFirst: false,
                    selectOnExpander: true,
                    highlightPath: true,
                    store: {
                        type: 'tree',
                        root: {
                            expanded: true,
                            children: me.menus
                        }
                    },
                    viewModel: {
                        formulas: {
                            selectionItem: function (get) {
                                try {
                                    var selection = get('treelist.selection');
                                    if (selection) {
                                        if (selection.data.leaf) {
                                            me.showTab(selection.data.method,
                                                selection.data.id,
                                                selection.data.text,
                                                selection.data.icon);
                                        }
                                    }
                                    return selection;
                                } catch (e) {
                                    showException(e);
                                }
                            }
                        }
                    }
                }],
            listeners: {
                resize: function (obj, width, height, oldWidth, oldHeight, eOpts) {
                    var pressed = width <= 128;
                    var treelist = Ext.getCmp("leftTreeList");
                    var ct = treelist.ownerCt.ownerCt;
                    treelist.setMicro(pressed);
                    if (pressed) {
                        ct.setWidth(44);
                    } else {
                        ct.setWidth(width);
                    }
                }
            }
        });

        var rightPanel = Ext.create('Ext.tab.Panel', {
            region: 'center',
            id: 'tabs',
            plain: true,
            style: {
                marginTop: '-8px'
            },
            items: [],
            plugins: ['tabreorderer', {
                ptype: 'tabclosemenu'
            }]
        });

        var rightContainer = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            region: 'center',
            border: 0,
            style: {
                background: '#eeeeee'
            },
            items: [rightPanel]
        });


        var leftContainer = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            region: 'west',
            border: 0,
            width: leftTreeWidth,
            minWidth: 44,
            maxWidth: 500,
            subtitle:'左侧菜单',
            split: true,
            style: {
                background: '#eeeeee'
            },
            items: [
                {
                    xtype: 'image',
                    height: 35,
                    border: 0,
                    padding: '5 5 5 5',
                    region: 'south',
                    src: server.getIcon("icon_v_menu.svg"),
                    style: {
                        background: '#32404e',
                        cursor: 'pointer'
                    },
                    listeners: {
                        el: {
                            click: function () {
                                if (leftContainer.getWidth() <= 44) {
                                    if (leftContainer.oldWidth != null) {
                                        leftContainer.setWidth(Math.max(200, leftContainer.oldWidth));
                                    } else {
                                        leftContainer.setWidth(200);
                                    }
                                } else {
                                    leftContainer.oldWidth = leftContainer.getWidth();
                                    leftContainer.setWidth(44);
                                }
                            }
                        }
                    }
                }, leftTreePanel]
        });

        rightPanel.add({
            title: '首页',
            xtype: 'panel',
            id: 'tabWelcome',
            reorderable: false,
            layout: 'fit',
            iconCls: 'extIcon extIndex',
            items: [getWelcomePanel()],
            listeners: {
                activate: function (tab) {
                    try {
                        if (me.currTab) {
                            me.selectMenu(me.currTab.getId(), true);
                            me.currTab = null;
                        }
                    } catch (e) {
                        rightPanel.setActiveTab(tab);
                    }
                }
            }
        });

        var containerPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            border: 0,
            bodyStyle: {
                background: systemBgColor
            },
            items: [headerPanel, leftContainer, rightContainer]
        });
        container.add(containerPanel);
        Ext.MessageBox.updateProgress(1, '即将完成操作，请耐心等待', '系统初始化成功！获取菜单中…');
        me.restoreTab().then(function (value) {
            var tabs = jsonToObject(value);
            Ext.each(tabs, function (tab) {
                me.showTab(tab.method, tab.id, tab.title, tab.icon, tab.active, true, tab.where);
            });
            if (Ext.MessageBox.isVisible()) {
                Ext.MessageBox.hide();
            }
        });
    },
    asyncMethod: function (method) {
        return new Ext.Promise(function (resolve, reject) {
            try {
                var itemValue = eval(method);
                resolve(itemValue);
            } catch (e) {
                resolve(null);
                console.error(e);
            }
        });
    },
    showTab: function (method, tabId, title, icon, activate, moveFirst, where) {
        var me = this;
        if (me.currTab && tabId == me.currTab.getId()) return;
        if (icon == null || icon.length == 0) icon = server.getIcon("icon_function.svg");
        if (Ext.isEmpty(moveFirst)) {
            moveFirst = true;
        }
        if (Ext.isEmpty(activate)) {
            activate = true;
        }
        var tabs = Ext.getCmp("tabs");
        me.currTab = Ext.getCmp(tabId);
        if (me.currTab == null) {
            me.currTab = tabs.add({
                xtype: 'panel',
                id: tabId,
                code: tabId,
                icon: icon,
                layout: 'fit',
                title: title,
                border: 0,
                closable: close,
                methodInvoked: false,
                method: method,
                where: where,
                items: [],
                tabBtnId: null,
                listeners: {
                    activate: function (tab) {
                        if (me.existMenu(tab.id)) {
                            me.selectMenu(tab.id, false);
                        }
                        if (!tab.methodInvoked) {
                            me.asyncMethod(method).then(function (obj) {
                                if (obj == null) {
                                    return;
                                }
                                tab.methodInvoked = true;
                                var entityOwner = obj.down("[entityList=true]");
                                if (entityOwner) {
                                    entityOwner.where = mergeJson(tab.where, entityOwner.where);
                                    entityOwner.code = $.md5(tabId);
                                }
                                tab.add(obj);
                                me.recordTab();
                            });
                        }
                    },
                    afterlayout: function (obj, container, pos) {
                        try {
                            Ext.get(this.tabBtnId).dom.ondblclick = function () {
                                var currShowTabId = me.currTab.getId();
                                tabs.items.each(function (obj, index) {
                                    if (index != 0 && obj.id == currShowTabId) {
                                        obj.close();
                                    }
                                });
                            }
                        } catch (e) {
                        }
                    },
                    destroy: function (obj, eOpts) {
                        me.recordTab();
                    }
                },
                initEvents: function () {
                    this.tabBtnId = this.getEl().getAttribute("aria-labelledby");
                }
            });
        }
        if (activate) {
            if (!tabs.getActiveTab() || tabs.getActiveTab() != me.currTab) {
                if (moveFirst) {
                    Ext.getCmp("tabs").moveAfter(me.currTab, Ext.getCmp("tabWelcome"));
                }
                tabs.setActiveTab(me.currTab);
            }
        }
    },
    recordTab: function () {
        return new Ext.Promise(function (resolve, reject) {
            try {
                var tabArray = [];
                var tabs = Ext.getCmp("tabs");
                tabs.items.each(function (item, index) {
                    var tab = {};
                    if (Ext.isEmpty(item.method)) {
                        return;
                    }
                    tab.method = item.method;
                    tab.where = item.where;
                    tab.title = item.title;
                    tab.icon = item.icon;
                    tab.id = item.id;
                    tab.active = item == tabs.getActiveTab();
                    tabArray.push(tab);
                });

                server.saveExtConfig("SystemTabs", "TabRecord", objectToJson(tabArray), function (success, message) {
                    resolve(success);
                });
            } catch (e) {
                reject(e);
            }
        });
    },
    restoreTab: function () {
        return new Ext.Promise(function (resolve, reject) {
            try {
                server.showExtConfig("SystemTabs", "TabRecord", function (success, value) {
                    resolve(value);
                });
            } catch (e) {
                reject(e);
            }
        });
    },
    selectMenu: function (menuId, justParent) {
        try {
            var me = this;
            if (Ext.isEmpty(justParent)) {
                justParent = false;
            }
            var treelist = Ext.getCmp("leftTreeList");
            var record = treelist.getStore().getNodeById(menuId);
            if (record == null) return;
            var parentId = record.get("parentId");

            if (!Ext.isEmpty(parentId)) {
                var parent = treelist.getStore().getNodeById(parentId);
                if (justParent) {
                    treelist.setSelection(parent);
                    parent.collapse();
                    me.currTab = null;
                    return;
                } else {
                    if (parentId != "root") {
                        parent.expand(false, true);
                        me.selectMenu(parentId, justParent);
                    }
                }
            }
            treelist.setSelection(record);
        } catch (e) {
            showException(e, "选择菜单！[system.selectMenu]");
        }

    },
    existMenu: function (menuId) {
        var treelist = Ext.getCmp("leftTreeList");
        var record = treelist.getStore().getNodeById(menuId);
        return record != null;

    },
    getMenu: function (menuId) {
        var treelist = Ext.getCmp("leftTreeList");
        var record = treelist.getStore().getNodeById(menuId);
        if (record) {
            return record.data;
        }
        return null;
    },
    logout: function () {
        Ext.Msg.confirm("系统提示", "<br/>您是否确定退出登录吗？", function (btn) {
            if (btn == "yes") {
                server.logout();
            }
        });
    },
    sessionOut: function () {
        var me = this;
        if (me.sessionOutAlert) {
            return;
        }
        me.sessionOutAlert = true;
        var win = Ext.create('Ext.window.Window', {
            title: '系统提醒',
            height: 150,
            width: 250,
            layout: 'fit',
            resizable: false,
            maximizable: false,
            sessionWin: true,
            fixed: true,
            draggable: false,
            iconCls: 'extIcon extSessionOut',
            html: "<div  style='padding:15px;background: #fff;'>会话失效，请您重新登录！</div>",
            modal: true,
            alwaysOnTop: true,
            toFrontOnShow: true,
            buttons: [{
                text: '重新登录',
                iconCls: 'extIcon extLogin',
                flex: 1,
                handler: function () {
                    win.close();
                }
            }],
            listeners: {
                destroy: function (obj, op) {
                    if (isPower()) {
                        window.parent.close();
                    } else {
                        location.reload();
                    }
                }
            }
        });
        win.show();
    },
    modifyPassword: function (obj) {
        var me = this;
        var loginPanel = Ext.create('Ext.form.FormPanel', {
            url: 'manager/modifyPassword',
            method: 'POST',
            fileUpload: true,
            border: 0,
            width: '100%',
            layout: "anchor",
            region: 'center',
            bodyStyle: {},
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: '当前密码',
                    labelAlign: 'right',
                    labelWidth: 60,
                    margin: '10 10 10 10',
                    name: 'managerPassword',
                    allowBlank: false,
                    inputType: 'password',
                    blankText: '请输入用户当前密码',
                    anchor: "100%"
                },
                {
                    xtype: 'textfield',
                    fieldLabel: '新密码',
                    labelAlign: 'right',
                    labelWidth: 60,
                    margin: '10 10 10 10',
                    name: 'newPassword',
                    allowBlank: false,
                    inputType: 'password',
                    blankText: '请输入用户新密码',
                    anchor: "100%"
                },
                {
                    xtype: 'textfield',
                    fieldLabel: '确认密码',
                    labelAlign: 'right',
                    labelWidth: 60,
                    margin: '10 10 10 10',
                    name: 'reNewPassword',
                    allowBlank: false,
                    inputType: 'password',
                    blankText: '请确认密码',
                    anchor: "100%"
                },
                {
                    xtype: 'hiddenfield',
                    name: 'managerId',
                    value: me.manager.managerId
                },
                {
                    xtype: 'fieldcontainer',
                    labelWidth: 0,
                    layout: 'column',
                    items: [{
                        xtype: 'button',
                        text: '立即修改',
                        margin: '10 10 10 5',
                        iconCls: 'extIcon extOk',
                        columnWidth: 1,
                        handler: function () {
                            doSubmit();
                        }
                    }]
                }],
            listeners: {
                'render': function (text) {
                    new Ext.KeyMap(text.getEl(), [{
                        key: 13,
                        fn: doSubmit,
                        scope: Ext.getBody()
                    }]);
                }
            }
        });

        var doSubmit = function () {
            var form = loginPanel.form;
            if (form.isValid()) {
                form.submit({
                    waitMsg: '正在修改中……',
                    success: function (form, action) {
                        toast(action.result.message);
                        win.close();
                        if (action.result.success) {
                            Ext.Msg.alert("系统提醒", "您当前的密码已被修改，请您重新登录！", function () {
                                server.logout();
                            })
                        }
                    },
                    failure: function (form, action) {
                        Ext.Msg.alert('系统提醒', action.result.message);
                    }
                });
            }
        };


        var win = Ext.create('Ext.window.Window', {
            title: '修改登录密码',
            height: 250,
            icon:obj.icon,
            iconCls: obj.iconCls,
            width: 400,
            layout: 'border',
            resizable: false,
            maximizable: false,
            animateTarget: obj,
            constrain: true,
            items: [loginPanel],
            modal: true
        });
        win.show();
    },
    getEntity: function (entityCode) {
        var me = this;
        var entities = me.entities;
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            if (entity.entityCode == entityCode) {
                return entity;
            }
        }
        return null;
    },
    showPowerMenus: function (obj, checked) {
        return new Ext.Promise(function (resolve, reject) {
            var dataStore = Ext.create('Ext.data.TreeStore', {
                proxy: {
                    type: 'ajax',
                    url: 'showPowerMenus',
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    listeners: {
                        exception: function (obj, request, operation, eOpts) {
                            var data = eval("(" + request.responseText + ")");
                            if (!data.success) {
                                Ext.Msg.alert('数据获取失败', data.message);
                            }
                        }
                    },
                    reader: {
                        type: 'json'
                    }
                },
                root: {
                    expanded: true
                },
                listeners: {
                    load: function (obj, records, successful) {
                        //treePanel.expandAll();
                    },
                    beforeload: function (store, operation) {
                        Ext.apply(store.proxy.extraParams, {
                            "checked": checked
                        });
                    }
                }
            });

            var treePanel = Ext.create('Ext.tree.Panel', {
                store: dataStore,
                rootVisible: false,
                bufferedRenderer: false,
                animate: true,
                containerScroll: true,
                autoScroll: true,
                viewConfig: {
                    loadMask: {
                        msg: '加载功能菜单中，请稍后……'
                    }
                },
                listeners: {
                    checkchange: function (currNode, checked, e, eOpts) {
                        if (checked) {
                            currNode.bubble(function (parentNode) {
                                parentNode.set('checked', true);
                                //parentNode.expand(false, true);
                            });
                            currNode.cascadeBy(function (node) {
                                node.set('checked', true);
                                //node.expand(false, true);
                            });
                        } else {
                            currNode.cascadeBy(function (node) {
                                node.set('checked', false);
                            });
                        }
                    }
                }
            });

            var win = Ext.create('Ext.window.Window', {
                title: '权限配置（选择功能菜单）',
                width: 400,
                height: 470,
                layout: 'fit',
                iconCls: 'extIcon extSelect',
                resizable: true,
                animateTarget: obj,
                maximizable: true,
                constrain: true,
                items: [treePanel],
                modal: true,
                buttons: [{
                    text: '重置',
                    iconCls: 'extIcon extReset',
                    handler: function () {
                        dataStore.reload();
                    }
                },
                    {
                        text: '确定',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            var checkedArray = treePanel.getChecked();
                            var menuIds = "";
                            for (i = 0; i < checkedArray.length; i++) {
                                menuIds += "," + checkedArray[i].data.id;
                            }
                            resolve(menuIds);
                            win.close();
                        }
                    }]
            });
            win.show();
        });
    },
    showPowerExt: function (obj, menuPower, extPower) {
        return new Ext.Promise(function (resolve, reject) {
            window["getMenuPower"] = function () {
                return menuPower;
            };
            window["getExtPower"] = function () {
                return extPower;
            };
            window["close"] = function () {
                Ext.getCmp("ExtPowerWindow").close();
            };
            var win = Ext.create('Ext.window.Window', {
                title: '配置界面权限（在组件上右击鼠标进行编辑权限）',
                id: "ExtPowerWindow",
                iconCls: 'extIcon extPower',
                layout: 'border',
                resizable: false,
                maximized: true,
                fixed: true,
                draggable: false,
                listeners: {
                    show: function (obj) {
                        obj.update("<iframe name='extPowerFrame' " +
                            " src='power?managerId=0' width='100%' height='100%' frameborder='0' scrolling='no' />");
                    }
                },
                buttons: [
                    {
                        text: '保存权限配置',
                        handler: function () {
                            resolve(extPowerFrame.window.getExtPower());
                            win.close();
                        }
                    }]
            });
            win.show();
        });
    },
    showMenuColumns: function (obj, checked) {
        return new Ext.Promise(function (resolve, reject) {
            var dataStore = Ext.create('Ext.data.TreeStore', {
                proxy: {
                    type: 'ajax',
                    url: 'showMenuColumn',
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    listeners: {
                        exception: function (obj, request, operation, eOpts) {
                            var data = eval("(" + request.responseText + ")");
                            if (!data.success) {
                                Ext.Msg.alert('数据获取失败', data.message);
                            }
                        }
                    },
                    reader: {
                        type: 'json'
                    }
                },
                root: {
                    expanded: true
                },
                listeners: {
                    load: function (obj, records, successful) {
                        //treePanel.expandAll();
                    },
                    beforeload: function (store, operation) {
                        Ext.apply(store.proxy.extraParams, {
                            "checked": checked
                        });
                    }
                }
            });

            var treePanel = Ext.create('Ext.tree.Panel', {
                store: dataStore,
                rootVisible: false,
                bufferedRenderer: false,
                animate: true,
                containerScroll: true,
                autoScroll: true,
                lastCheckNode: null,
                viewConfig: {
                    loadMask: {
                        msg: '加载功能菜单中，请稍后……'
                    }
                },
                listeners: {
                    checkchange: function (currNode, checked, e, eOpts) {
                        if (checked) {
                            currNode.bubble(function (parentNode) {
                                parentNode.set('checked', true);
                                //parentNode.expand(false, true);
                            });
                            currNode.cascadeBy(function (node) {
                                node.set('checked', true);
                                //node.expand(false, true);
                            });
                        } else {
                            currNode.cascadeBy(function (node) {
                                node.set('checked', false);
                            });
                        }
                    }
                }
            });

            var win = Ext.create('Ext.window.Window', {
                title: '搜索链配置',
                width: 400,
                height: 470,
                layout: 'fit',
                iconCls:'extIcon extLink',
                resizable: true,
                animateTarget: obj,
                maximizable: true,
                constrain: true,
                items: [treePanel],
                modal: true,
                buttons: [{
                    text: '重置',
                    iconCls:'extIcon extReset',
                    handler: function () {
                        dataStore.reload();
                    }
                },
                    {
                        text: '确定',
                        iconCls:'extIcon extOk',
                        handler: function () {
                            var checkeds = treePanel.getChecked();
                            var treeData = [];
                            var menuIds = "";
                            for (i = 0; i < checkeds.length; i++) {
                                if (checkeds[i].isLeaf()) {
                                    var data = {};
                                    var parent = {};

                                    data.text = checkeds[i].data.text;
                                    data.id = checkeds[i].data.id;
                                    data.dataIndex = checkeds[i].data.dataIndex;
                                    data.parentId = checkeds[i].data.parentId;

                                    var parentData = treePanel.getStore().findRecord("id", data.parentId).data;
                                    parent.text = parentData.text;
                                    parent.id = parentData.id;
                                    parent.method = parentData.method;
                                    parent.icon = parentData.icon;

                                    data.parent = parent;
                                    treeData.push(data);
                                }
                                menuIds += "," + checkeds[i].data.id;
                            }
                            resolve({checked: menuIds, columns: treeData});
                            win.close();
                        }
                    }]
            });
            win.show();
        });
    }
};


function showList(menuId, entityCode, where) {
    var entity = system.getEntity(entityCode);
    if (entity == null) {
        throw "操作失败！未获取到 '" + entityCode + "' 实体类！";
    }
    if (!entity.js) {
        throw "操作失败！未获取到 '" + entityCode + "' JS对象！";
    }
    if (!where) {
        where = {};
    }
    var entityJsObj = eval("new " + entityCode + "()");
    entityJsObj.menu = system.getMenu(menuId);
    return entityJsObj.getList(where);
}


Ext.onReady(function () {
    if (checkBrowserVersion()) {
        Ext.MessageBox.show({
            alwaysOnTop: true,
            modal: true,
            title: '系统提醒',
            msg: '初始化系统中，请稍后……',
            progressText: '请耐心等待，即将完成操作',
            progress: true,
            closable: false
        });
        system.initConfig();
    }
});


