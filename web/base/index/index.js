const system = {
    lastTabId: -1,
    dateFormat: 'Y-m-d H:i:s',
    init: false,
    manager: null,//当前登录的管理员
    menus: null,//菜单
    http: null,//项目http路径
    baseUrl:null,//首次进入系统管理界面的根路径
    regByImage: /\.(jpg|png|gif|jpeg)$/i,
    regByMP4: /\.(mp4)$/i,
    regByExcel: /\.(xls|xlsx)$/i,
    regByWord: /\.(doc)$/i,
    regByText: /\.(txt)$/i,
    tabPanelContainer: null,
    fullscreen: false,
    inFullScreen: function () {//进入全屏
        try {
            let element = document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }
            this.fullscreen = true;
        } catch (e) {
            console.error(e);
        }
    },
    validOperate: function (operate, callBack, timeout) {
        if (!operate) {
            return;
        }
        let operateValid = $.cookie("ValidOperate" + $.md5(operate));
        if (!timeout) {
            timeout = 24 * 60 * 60;
        }

        if (operateValid) {
            callBack();
        }else{
            let loginNormal = getExt("login-type").value === "normal";
            let labelWidth = getNumberValue(fontSize) * 5 + 8;
            let doValid = function () {
                let form = loginPanel.form;
                if (form.isValid()) {
                    let loginPassword = loginPanel.form.findField("loginPassword").getValue();

                    form.submit({
                        params: {
                            loginPassword: $.md5(loginPassword),
                            operate: operate,
                            timeout: timeout
                        },
                        waitMsg: '正在为您验证中……',
                        success: function (form, action) {
                            win.close();
                            callBack();
                        },
                        failure: function (form, action) {
                            refreshCode();
                            Ext.Msg.alert('验证失败', action.result.message, function () {
                                if (action.result.code === -3) {
                                    loginPanel.form.findField("validateCode").focus();
                                }
                            });
                        }
                    });
                }
            };

            let loginPanel = Ext.create('Ext.form.FormPanel', {
                url: server.validOperateUrl(),
                method: 'POST',
                fileUpload: true,
                border: 0,
                width: '100%',
                layout: "anchor",
                region: 'center',
                bodyStyle: {},
                padding: '10 10 0 10',
                items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: '登录账号',
                        labelAlign: 'right',
                        labelWidth: labelWidth,
                        margin: '10 10 0 0',
                        name: 'loginName',
                        allowBlank: false,
                        blankText: '请输入当前登录名',
                        emptyText: '请输入当前登录名',
                        anchor: "100%"
                    }, {
                        xtype: 'textfield',
                        fieldLabel: '登录密码',
                        labelAlign: 'right',
                        labelWidth: labelWidth,
                        inputType: 'password',
                        margin: '10 10 0 0',
                        allowBlank: false,
                        blankText: '请输入登录密码',
                        emptyText: '请输入登录密码',
                        submitValue: false,
                        name: 'loginPassword',
                        anchor: "100%"
                    },
                    {
                        xtype: 'fieldcontainer',
                        labelWidth: 0,
                        anchor: "100%",
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        hidden: loginNormal,
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: '验证码',
                            labelAlign: 'right',
                            labelWidth: labelWidth,
                            margin: '10 10 0 0',
                            allowBlank: loginNormal,
                            flex: 1,
                            name: 'validateCode',
                            emptyText: '请输入验证码',
                            blankText: '请输入验证码'
                        }, {
                            xtype: 'image',
                            margin: '10 10 0 0',
                            width: 70,
                            id: 'imgCode',
                            height: 32
                        }]
                    },
                    {
                        xtype: 'fieldcontainer',
                        labelWidth: 0,
                        anchor: "100%",
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        items: [{
                            xtype: 'button',
                            text: '取消',
                            iconCls: 'extIcon extReset',
                            flex: 1,
                            tipText: '取消验证',
                            margin: '10 5 10 10',
                            handler: function () {
                                win.close();
                            }
                        }, {
                            xtype: 'button',
                            text: '确定',
                            tipText: '确定验证',
                            margin: '10 10 10 5',
                            iconCls: 'extIcon extOk',
                            flex: 1,
                            handler: function () {
                                doValid();
                            }
                        }]
                    }],
                listeners: {
                    'render': function (text) {
                        try {
                            new Ext.util.KeyMap({
                                target: text.getEl(),
                                key: 13,
                                fn: doValid,
                                scope: Ext.getBody()
                            });
                        } catch (e) {
                            console.error(e);
                        }

                    }
                }
            });

            let refreshCode = function () {
                try {
                    loginPanel.form.findField("validateCode").reset();
                    Ext.getCmp("imgCode").setSrc("showCaptcha?t=" + Math.random());
                } catch (e) {
                }
            };

            let bottomPanel = Ext.create('Ext.panel.Panel', {
                region: 'south',
                layout: 'fit',
                width: '100%',
                border: 0,
                html: "<div align='center' style='font-size: small;color:red;text-decoration:none; padding-left: 40px;padding-right: 40px;padding-bottom: 10px;'>完成验证后将自动继续《" + operate + "》操作</div>"
            });

            let win = Ext.create('Ext.window.Window', {
                title: '当前操作需要安全验证',
                iconCls: 'extIcon extPower',
                width: 380,
                resizable: false,
                layout: 'vbox',
                toFrontOnShow: true,
                modal: true,
                constrain: true,
                items: [loginPanel,bottomPanel]
            });
            win.show(null, function () {
                try {
                    if (!loginNormal) {
                        refreshCode();
                        Ext.get('imgCode').on({
                            click: function () {
                                refreshCode();
                            }
                        });
                    }
                } catch (e) {
                }
            });
        }
    },
    outFullscreen: function () {//退出全屏
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            this.fullscreen = false;
        } catch (e) {
            console.error(e);
        }
    },
    formatUrl: function (url, params) {
        if (url.startWith("http://") || url.startWith("https://")) {
            return url;
        }
        return this.formatUrlVersion(this.http + url, params);
    },
    formatUrlVersion: function (url, params) {
        let newUrl = url;
        if (url.indexOf("v=") < 0) {
            if (url.indexOf("?") > 0) {
                newUrl = url + "&v=" + this.version.value;
            } else {
                newUrl = url + "?v=" + this.version.value;
            }
        }
        if (params) {
            for (let key in params) {
                if (params.hasOwnProperty(key)) {
                    newUrl = newUrl + "&" + key + "=" + params[key];
                }
            }
        }
        return newUrl;
    },
    isSuperRole: function () {
        let me = this;
        if (me.manager && me.manager.role) {
            if (me.manager.role.roleType === 0) {//拥有最大权限
                return true;
            }
        }
        return false;
    },
    initConfig: function () {
        let me = this;
        me.baseUrl = window.location.href;
        if (me.baseUrl.indexOf("#") > 0) {
            me.baseUrl=me.baseUrl.split("#")[0];
        }
        if (!me.baseUrl.toString().endWith("/")) {
            me.baseUrl = me.baseUrl + "/";
        }

        let params = {};
        if (isPower()) {
            if (window.parent && Ext.isFunction(window.parent.getMenuPower)) {
                params = {menuPower: window.parent.getMenuPower()};
            }
        }
        Ext.Ajax.request({
            url: server.showConfigUrl(),
            params: params,
            success: function (response, opts) {
                let data = jsonToObject(response.responseText).data;
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        me[key] = data[key];
                    }
                }
                let allExt = getAllExt();
                for (let i = 0; i < allExt.length; i++) {
                    let head = allExt[i];
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
        let me = this;
        if (!index) {
            index = 0;
        }
        if (index >= me.app.length) {
            Ext.MessageBox.updateProgress(1, '已加载成功，正在显示中');
            addScript({src: me.formatUrlVersion(getExt("welcomeUrl").value)}, function () {
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
        let me = this;

        //配置entity实体类基本属性
        let entities = me.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            for (let key in entity) {
                if (entity.hasOwnProperty(key)) {
                    try {
                        let pro = eval(entity.entityCode + ".prototype");
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
                system.managerPowers = jsonToObject(window.parent.getParentExtPower());

                //如果父级权限为false，默认同步子管理员为false
                if (system.managerPowers) {
                    for (let code in power.powers) {
                        if (system.managerPowers.hasOwnProperty(code)) {
                            let managerPower = system.managerPowers[code];
                            for (let managerPowerKey in managerPower) {
                                if (!managerPower[managerPowerKey]) {
                                    power.powers[code][managerPowerKey] = false;
                                }
                            }
                        }
                    }
                }

                window["getExtPower"] = function () {
                    return power.savePower();
                };
            }
        }

        Ext.Ajax.on('beforerequest', function (conn, options, eObj) {
            try {
                if (server.isSilenceRequest()) {
                    return;
                }
                getProgressLine(toColor(getExt("front-color").value)).set(0);
                getProgressLine(toColor(getExt("front-color").value)).animate(0.7);
            } catch (e) {
            }
        });

        Ext.Ajax.on('requestcomplete',
            function (conn, response, options) {
                try {
                    if (response.status === 203) {
                        me.sessionOut();
                        me.callback = null;
                        me.success = null;
                    } else {
                        try {
                            let jsonData = eval("(" + response.responseText + ")");
                            if (jsonData.code === 203) {
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
                if (server.isSilenceRequest()) {
                    return;
                }
                showException(response.responseText, "请求异常！");
            } catch (e) {
            }
        });


        $(document).ajaxStart(function (obj) {
            try {
                if (server.isSilenceRequest()) {
                    return;
                }
                getProgressLine(toColor(getExt("front-color").value)).set(0);
                getProgressLine(toColor(getExt("front-color").value)).animate(0.7);
            } catch (e) {
            }
        });

        $(document).ajaxComplete(function (event, xhr, options) {
            try {
                if (xhr.status === 203) {
                    me.sessionOut();
                } else {
                    try {
                        let jsonData = eval("(" + xhr.responseText + ")");
                        if (jsonData.code === 203) {
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
                if (server.isSilenceRequest()) {
                    return;
                }
                showException(xhr.responseText, "请求异常");
            } catch (e) {
            }
        });


        window.addEventListener("popstate", function (e) {
            me.selectTab(me.selectTabFromHref());
        }, false);

        me.init = true;
        me.initSystem();
    },
    selectTabFromHref: function () {
        let href = window.location.href;
        if (href.indexOf("#") > 0) {
            return href.substring(href.lastIndexOf("/") + 1);
        }
        return null;
    },
    initSystem: function () {
        removeLoading();
        let me = this;
        let container = getBodyContainer();
        container.removeAll();

        let systemBgColor = toColor(me["theme-color"].value);
        let systemTlColor = toColor(me["front-color"].value);
        let systemLogo = me["system-logo"].value;
        let versionName = me["version"].desc;
        let systemTitle = $("title").text() + versionName;
        if (Ext.isEmpty(systemLogo)) {
            systemLogo = "icons/icon_head_system.svg";
        }
        let headerInfo = Ext.create('Ext.toolbar.Toolbar', {
            height: 60,
            padding: '0 0 0 0',
            border: 0,
            flex: 1,
            power: false,
            cls: 'headContainer',
            style: {
                background: systemBgColor
            },
            items: [
                {
                    xtype: 'image',
                    src: systemLogo,
                    height: 40,
                    width: 40,
                    cls: 'headLogo',
                    margin: '10 5 5 5',
                    style: {
                        borderRadius: '10px'
                    }
                },
                {
                    xtype: 'label',
                    margin: '0 0 0 5',
                    html: "<div class='headTitle' style='color: " + systemTlColor + ";' >" + systemTitle + "</div>"
                },
                "->",
                {
                    xtype: 'button',
                    iconCls: 'extIcon extRole',
                    text: me.manager.managerName,
                    minWidth: 135,
                    cls: 'headButton',
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
                    cls: 'headButton',
                    handler: function () {
                        me.logout();
                    }
                }]
        });

        let headerTip = Ext.create('Ext.toolbar.Toolbar', {
            border: 0,
            padding: '0 0 0 0',
            flex: 1,
            height: 3,
            style: {
                background: systemBgColor
            },
            html: "<div class=\"progress\" id=\"progress\"></div>"
        });

        let headerPanel = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            region: 'north',
            height: 60,
            border: 0,
            hidden: power.config,
            items: [headerInfo, headerTip],
            listeners: {
                afterlayout: function () {
                    this.getEl().on("dblclick", function () {
                        if (system.fullscreen) {
                            system.outFullscreen();
                        } else {
                            system.inFullScreen();
                        }
                    });
                }
            }
        });


        let leftTreeWidth = parseInt((document.body.clientWidth * 0.25).toFixed(0));
        let leftTreePanel = Ext.create('Ext.panel.Panel', {
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
                                    let selection = get('treelist.selection');
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
                    let pressed = width <= 128;
                    let treelist = Ext.getCmp("leftTreeList");
                    let ct = treelist.ownerCt.ownerCt;
                    treelist.setMicro(pressed);
                    if (pressed) {
                        ct.setWidth(44);
                    } else {
                        ct.setWidth(width);
                    }
                }
            }
        });

        me.tabPanelContainer = Ext.create('Ext.tab.Panel', {
            region: 'center',
            id: 'tabs',
            plain: true,
            style: {
                marginTop: '-8px'
            },
            items: [],
            recordTab: function () {
                system.recordTab();
            },
            plugins: ['tabreorderer', {
                ptype: 'tabclosemenu'
            }]
        });

        let rightContainer = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            region: 'center',
            border: 0,
            style: {
                background: '#eeeeee'
            },
            items: [me.tabPanelContainer]
        });


        let leftContainer = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            region: 'west',
            border: 0,
            width: leftTreeWidth,
            minWidth: 44,
            maxWidth: 500,
            subtitle: '左侧菜单',
            split: true,
            style: {
                background: '#32404e'
            },
            items: [
                {
                    xtype: 'image',
                    height: 35,
                    border: 0,
                    padding: '5 5 5 5',
                    region: 'south',
                    src: server.getIcon("icon_v_menu.svg"),
                    cls: 'leftBottom',
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

        me.tabPanelContainer.add({
            title: '首页',
            xtype: 'panel',
            id: 'tabWelcome',
            reorderable: false,
            closable: false,
            layout: 'fit',
            iconCls: 'extIcon extIndex',
            justFixed: true,
            items: [getWelcomePanel()],
            listeners: {
                beforeactivate: function (tab) {
                    try {
                        me.selectMenu(me.lastTabId, true);
                    } catch (e) {
                    }
                },
                activate: function (tab) {
                    if (me.restoredTab) {
                        let state = {
                            title: tab.title,
                            url: me.baseUrl
                        };
                        window.history.pushState(state, tab.title, me.baseUrl);
                    }
                }
            }
        });

        let containerPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            border: 0,
            bodyStyle: {
                background: systemBgColor
            },
            items: [headerPanel, leftContainer, rightContainer]
        });
        container.add(containerPanel);
        let tabFromHrefMenuId = me.selectTabFromHref(false);
        if (toBool(me['tab-record'].value, true)) {
            Ext.MessageBox.updateProgress(1, '即将完成操作，请耐心等待', '系统初始化成功！获取菜单中…');
            me.restoreTab().then(function (value) {
                if (Ext.MessageBox.isVisible()) {
                    Ext.MessageBox.hide();
                }
                let tabs = jsonToObject(value);
                me.restoredTab = true;
                if (!tabs) {
                    return;
                }
                Ext.each(tabs, function (tab) {
                    if (tabFromHrefMenuId === tab.id) {
                        tab.active = true;
                    }
                    me.showTab(tab.method, tab.id, tab.title, tab.icon, tab.active, true, tab.where, tab.closable, tab.reorderable);
                });
                if (tabs.length === 0 || !me.tabPanelContainer.getActiveTab()) {
                    me.tabPanelContainer.setActiveTab(Ext.getCmp("tabWelcome"));
                }
            });
        } else {
            if (Ext.MessageBox.isVisible()) {
                Ext.MessageBox.hide();
            }
            me.tabPanelContainer.setActiveTab(Ext.getCmp("tabWelcome"));
        }
    },
    asyncMethod: function (method) {
        return new Ext.Promise(function (resolve, reject) {
            try {
                let itemValue = eval(method);
                resolve(itemValue);
            } catch (e) {
                resolve(null);
                console.error(e);
            }
        });
    },
    showTab: function (method, tabId, title, icon, activate, moveFirst, where, closable, reorderable) {
        let me = this;
        let tabs = Ext.getCmp("tabs");
        if (tabs.getActiveTab() && tabId === tabs.getActiveTab().getId()) {
            return;
        }
        if (!icon || icon.length === 0) icon = server.getIcon("icon_function.svg");
        if (Ext.isEmpty(moveFirst)) {
            moveFirst = true;
        }
        if (Ext.isEmpty(activate)) {
            activate = true;
        }

        let changeIcon = function (targetTab, selected) {
            if (targetTab) {
                let menu = me.getMenu(targetTab.getId());
                if (menu) {
                    let btnIconEl = Ext.get(targetTab.tabBtnId + "-btnIconEl");
                    if (btnIconEl) {
                        let color = menu.color;
                        if (selected) {
                            color = toColor(me["theme-color"].value);
                        }
                        btnIconEl.setStyle("background-image", "url(" + server.getIcon(menu.iconName, color) + ")");
                    }
                }
            }
        };

        let currTab = Ext.getCmp(tabId);
        if (!currTab) {
            currTab = tabs.add({
                xtype: 'panel',
                id: tabId,
                code: tabId,
                icon: icon,
                layout: 'fit',
                title: title,
                border: 0,
                tabContainer: true,
                closable: toBool(closable, true),
                reorderable: toBool(reorderable, true),
                methodInvoked: false,
                method: method,
                where: where,
                items: [],
                tabBtnId: null,
                doFixed: function () {
                    let me = this;
                    me.tab.setClosable(!me.tab.closable);
                    if (!me.tab.closable) {
                        let cmp = system.findLastTag();
                        if (cmp) {
                            tabs.moveAfter(me, cmp);
                        }
                        me.reorderable = me.tab.reorderable = false;
                    } else {
                        me.reorderable = me.tab.reorderable = true;
                        let cmp = system.findLastTag();
                        if (cmp) {
                            tabs.moveAfter(me, cmp);
                        }
                    }
                    if (Ext.isFunction(tabs.recordTab)) {
                        tabs.recordTab();
                    }
                },
                doCopyUrl: function () {
                    let tab = this;
                    copyToBoard(system.baseUrl + "#/" + tab.title + "/" + tab.id);
                    toast("复制成功！");
                },
                listeners: {
                    deactivate: function (tab) {
                        try {
                            changeIcon(tab, false);
                            let entityOwner = tab.down("[entityList=true]");
                            if (entityOwner && entityOwner.onTabDeactivate) {
                                entityOwner.onTabDeactivate(tab);
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    },
                    activate: function (tab) {
                        if (!tab) {
                            return;
                        }
                        me.lastTabId = tab.id;
                        if (me.existMenu(tab.id)) {
                            me.selectMenu(tab.id, false);
                        }
                        changeIcon(tab, true);

                        if (!tab.methodInvoked) {
                            me.asyncMethod(method).then(function (obj) {
                                try {
                                    if (!obj) {
                                        return;
                                    }
                                    tab.methodInvoked = true;
                                    let entityOwner = obj.down("[entityList=true]");
                                    if (entityOwner) {
                                        entityOwner.where = mergeJson(tab.where, entityOwner.where);
                                        entityOwner.code = $.md5(tabId);
                                    }
                                    tab.add(obj);
                                } catch (e) {
                                    console.error(e);
                                }
                            });
                        }else{
                            let entityOwner = tab.down("[entityList=true]");
                            if (entityOwner && entityOwner.onTabActivate) {
                                entityOwner.onTabActivate(tab);
                            }
                        }
                        try {
                            let href = window.location.href;
                            if (href.indexOf("#") > 0) {
                                let menuId = href.substring(href.lastIndexOf("/") + 1);
                                if (tab.id === menuId) {
                                    return;
                                }
                            }
                            let state = {
                                title: tab.title,
                                url: me.baseUrl + "#/" + tab.title + "/" + tab.id
                            };
                            window.history.pushState(state, tab.title, me.baseUrl + "#/" + tab.title + "/" + tab.id);
                        } catch (e) {
                            console.error(e);
                        }
                        me.recordTab();
                    },
                    afterlayout: function (tab, container, pos) {
                        try {
                            Ext.get(this.tabBtnId).dom.ondblclick = function () {
                                let currShowTabId = tab.getId();
                                tabs.items.each(function (obj, index) {
                                    if (index !== 0 && obj.id === currShowTabId) {
                                        if (obj.closable) {
                                            obj.close();
                                        }
                                    }
                                });
                            };
                            if (tabs.getActiveTab() && tabs.getActiveTab().getId() === tab.getId()) {
                                changeIcon(tab, true);
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
            if (!tabs.getActiveTab() || tabs.getActiveTab().getId() !== currTab.getId()) {
                if (moveFirst) {
                    let cmp = me.findLastTag();
                    if (cmp) {
                        Ext.getCmp("tabs").moveAfter(currTab, cmp);
                    }
                }
                tabs.setActiveTab(currTab);
            }
        }
    },
    findLastTag: function () {
        let tabs = Ext.getCmp("tabs");
        for (let i = tabs.items.items.length - 1; i >= 0; i--) {
            let item = tabs.items.items[i];
            if (item) {
                if (!toBool(item.tab.closable, true) && !toBool(item.tab.reorderable, true)) {
                    return item;
                }
            }
        }
        return null;
    },
    recordTab: function () {
        return new Ext.Promise(function (resolve, reject) {
            try {
                let tabArray = [];
                let tabs = Ext.getCmp("tabs");
                tabs.items.each(function (item, index) {
                    let tab = {};
                    if (Ext.isEmpty(item.method)) {
                        return;
                    }
                    tab.method = item.method;
                    tab.where = item.where;
                    tab.title = item.title;
                    tab.icon = item.icon;
                    tab.id = item.id;
                    tab.closable = item.closable;
                    tab.reorderable = item.reorderable;
                    tab.active = item === tabs.getActiveTab();
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
    selectTab: function (id) {
        let me = this;
        let tab = Ext.getCmp(id);
        if (tab) {
            me.tabPanelContainer.setActiveTab(tab);
            tab.focus();
            return true;
        } else {
            return me.selectMenu(id, false);
        }
    },
    addTab: function (component, id, title, icon) {
        let me = this;
        let currTab = Ext.getCmp(id);
        if (!currTab) {
            currTab = me.tabPanelContainer.add({
                title: title,
                xtype: 'panel',
                id: id,
                code: id,
                icon: icon,
                border: 0,
                tabContainer: true,
                closable: true,
                reorderable: true,
                layout: 'fit',
                items: [component]
            });
        }
        me.tabPanelContainer.setActiveTab(currTab);
    },
    selectMenu: function (menuId, justParent) {
        try {
            let me = this;
            if (Ext.isEmpty(justParent)) {
                justParent = false;
            }
            let treelist = Ext.getCmp("leftTreeList");
            let record = treelist.getStore().getNodeById(menuId);
            if (!record) return false;
            let parentId = record.get("parentId");

            if (!Ext.isEmpty(parentId)) {
                let parent = treelist.getStore().getNodeById(parentId);
                if (justParent) {
                    treelist.setSelection(parent);
                    parent.collapse();
                    return;
                } else {
                    if (parentId !== "root") {
                        parent.expand(false, true);
                        me.selectMenu(parentId, justParent);
                    }
                }
            }
            treelist.setSelection(record);
            return true;
        } catch (e) {
            showException(e, "选择菜单！[system.selectMenu]");
        }
    },
    existMenu: function (menuId) {
        let treelist = Ext.getCmp("leftTreeList");
        let record = treelist.getStore().getNodeById(menuId);
        return record != null;

    },
    getMenu: function (menuId) {
        let treeList = Ext.getCmp("leftTreeList");
        let record = treeList.getStore().getNodeById(menuId);
        if (record) {
            let data = record.data;
            if (data && data.parentId && data.parentId !== 'root') {
                data.parent = this.getMenu(data.parentId);
            }
            return data;
        }
        return null;
    },
    logout: function () {
        Ext.Msg.confirm("系统提示", "<br/>您是否确定退出登录吗？", function (btn) {
            if (btn === "yes") {
                server.logout();
            }
        });
    },
    sessionOut: function () {
        let me = this;
        if (me.sessionOutAlert) {
            return;
        }
        Ext.MessageBox.hide();
        me.sessionOutAlert = true;
        let win = Ext.create('Ext.window.Window', {
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
        let me = this;
        let loginPanel = Ext.create('Ext.form.FormPanel', {
            url: 'controller/modifyPassword',
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


        let win = Ext.create('Ext.window.Window', {
            title: '修改登录密码',
            height: 250,
            icon: obj.icon,
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
        let me = this;
        let entities = me.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (entity.entityCode === entityCode) {
                return entity;
            }
        }
        return null;
    },
    showPowerMenus: function (obj, checked, parent) {
        return new Ext.Promise(function (resolve, reject) {
            let dataStore = Ext.create('Ext.data.TreeStore', {
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
                            let data = eval("(" + request.responseText + ")");
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
                            "checked": checked,
                            "parent": parent
                        });
                    }
                }
            });

            let treePanel = Ext.create('Ext.tree.Panel', {
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
            let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.5).toFixed(0));
            let win = Ext.create('Ext.window.Window', {
                title: '权限配置（选择功能菜单）',
                height: winHeight,
                width: winWidth,
                minHeight: 400,
                minWidth: 470,
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
                            let checkedArray = treePanel.getChecked();
                            let menuIds = "";
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
    showPowerExt: function (obj, menuPower, extPower, parentExtPower) {
        return new Ext.Promise(function (resolve, reject) {
            window["getMenuPower"] = function () {
                return menuPower;
            };
            window["getExtPower"] = function () {
                return extPower;
            };
            window["getParentExtPower"] = function () {
                return parentExtPower;
            };
            window["close"] = function () {
                Ext.getCmp("ExtPowerWindow").close();
            };
            let win = Ext.create('Ext.window.Window', {
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
            let dataStore = Ext.create('Ext.data.TreeStore', {
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
                            let data = eval("(" + request.responseText + ")");
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

            let treePanel = Ext.create('Ext.tree.Panel', {
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

            let win = Ext.create('Ext.window.Window', {
                title: '搜索链配置',
                width: 400,
                height: 470,
                layout: 'fit',
                iconCls: 'extIcon extLink',
                resizable: true,
                animateTarget: obj,
                maximizable: true,
                constrain: true,
                items: [treePanel],
                modal: true,
                buttons: [
                    {
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
                            let checkedArray = treePanel.getChecked();
                            let treeData = [];
                            let menuIds = "";
                            for (i = 0; i < checkedArray.length; i++) {
                                if (checkedArray[i].isLeaf()) {
                                    let data = {};
                                    data.text = checkedArray[i].data.text;
                                    data.id = checkedArray[i].data.id;
                                    data.dataIndex = checkedArray[i].data.dataIndex;
                                    data.parentId = checkedArray[i].data.parentId;

                                    let findRecord = treePanel.getStore().findNode("id", data.parentId, 0, false, false, true);
                                    if (findRecord) {
                                        let parent = {};
                                        let parentData = findRecord.data;
                                        parent.text = parentData.text;
                                        parent.id = parentData.id;
                                        parent.method = parentData.method;
                                        parent.icon = parentData.icon;
                                        data.parent = parent;
                                        treeData.push(data);
                                    }
                                }
                                menuIds += "," + checkedArray[i].data.id;
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
    let entity = system.getEntity(entityCode);
    if (!entity) {
        throw "操作失败！未获取到 '" + entityCode + "' 实体类！请检查实体类关联的表格是否存在！";
    }
    if (!entity.js) {
        throw "操作失败！未获取到 '" + entityCode + "' JS对象！";
    }
    if (!where) {
        where = {};
    }
    let entityJsObj = eval("new " + entityCode + "()");
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
