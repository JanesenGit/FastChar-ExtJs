namespace FastExt {

    /**
     * 系统对象
     */
    export class System {

        /**
         * 系统默认的字体大小
         */
        private static _fontSize: string = "14px";

        static get fontSize(): string {
            if (window["fontSize"]) {
                return window["fontSize"];
            }
            return this._fontSize;
        }

        /**
         * 系统最后一次打开的tabId
         */
        static lastTabId: number = -1;

        /**
         * 系统全局日期格式
         */
        static dateFormat: string = 'Y-m-d H:i:s';
        /**
         * 系统是否已初始化
         */
        static init: boolean = false;

        /**
         * 当前登录的管理员
         */
        static manager: any;

        /**
         * 管理员的权限
         */
        static managerPowers: any;

        /**
         * 系统左侧菜单集合
         */
        static menus: [] = null;
        /**
         * 系统项目的HTTP地址，系统初始后赋值，例如：http://locahost:8080/fastchartest/
         */
        static http: string = null;
        /**
         * 系统项目的根路径，例如：http://localhost:8080/
         */
        static baseUrl = null;
        /**
         * 图片的正则表达式
         */
        static regByImage: RegExp = /\.(jpg|png|gif|jpeg)$/i;
        /**
         * MP4的正则表达式
         */
        static regByMP4: RegExp = /\.(mp4)$/i;
        /**
         * Excel的正则表达式
         */
        static regByExcel: RegExp = /\.(xls|xlsx)$/i;

        /**
         * Word正则表达式
         */
        static regByWord: RegExp = /\.(doc)$/i;
        /**
         * Text正则表达式
         */
        static regByText: RegExp = /\.(txt)$/i;
        /**
         * 系统右侧Tab组件的容器对象,Ext.tab.Panel
         */
        static tabPanelContainer: any;

        /**
         * 系统是否已全屏
         */
        static fullscreen: boolean = false;

        /**
         * 是否已弹出会话失效的窗口
         */
        static sessionOutAlert: boolean = false;

        /**
         * 是否已还原了Tab标签页
         */
        static restoredTab: boolean = false;

        /**
         * 移除全局加载的等待界面
         */
        static removeLoading() {
            window["removeLoading"]();
        }

        /**
         * 获取整个系统框架容器
         * @returns Ext.container.Viewport
         */
        static getBodyContainer(): any {
            let container = Ext.getCmp("bodyContainer");
            if (!container) {
                Ext.getDoc().on("contextmenu",
                    function (e) {
                        e.stopEvent(); //禁用右键菜单
                    });
                Ext.tip.QuickTipManager.init();
                Ext.QuickTips.init();
                container = Ext.create('Ext.container.Viewport', {
                    id: 'bodyContainer',
                    layout: 'fit',
                    border: 0,
                    renderTo: Ext.getBody()
                });
            }
            return container;
        }

        /**
         * 获取系统属性值
         * @param name
         */
        static getValue(name: string) {
            return FastExt.System[name];
        }

        /**
         * 动态加载js文件
         * @param script js文件对象
         * @param callBack
         * @see FastExt.SystemScript
         */
        static addScript(script: any, callBack) {
            if (script == null) return;
            let oHead = document.getElementsByTagName('head').item(0);
            let oScript: any = document.createElement("script");
            let isCode = false;
            oScript.type = "text/javascript";
            if (script.src != null && script.src.length > 0) {
                oScript.src = script.src + "?v=" + FastExt.System.getExt("version").value;
            } else if (script.href != null && script.href.length > 0) {
                oScript.src = script.href + "?v=" + FastExt.System.getExt("version").value;
            } else if (script.text) {
                try {
                    oScript.appendChild(document.createTextNode(script.text));
                } catch (ex) {
                    oScript.text = script.text;
                }
                isCode = true;
            } else {
                if (callBack != null) {
                    callBack();
                }
                return;
            }
            oHead.appendChild(oScript);
            if (isCode) {
                if (callBack != null) {
                    callBack();
                }
                return;
            }
            oScript.onload = oScript.readystatechange = function () {
                if (callBack != null) {
                    callBack();
                }
            };
            oScript.onerror = function () {
                alert("脚本文件" + script.src + "加载失败，请您稍后重试！");
            };
        }

        /**
         * 动态加载css代码
         * @param style css代码
         * @param callBack 加载成功后回调
         */
        static addStyle(style, callBack) {
            let oHead = document.getElementsByTagName('head').item(0);
            let oStyle: any = document.createElement("style");
            oStyle.type = "text/css";
            if (oStyle.styleSheet) {
                oStyle.styleSheet.cssText = style;
            } else {
                oStyle.innerHTML = style;
            }
            if (callBack != null) {
                callBack();
            }
            oHead.appendChild(oStyle);
        }


        /**
         * 初始化系统配置
         */
        static initConfig() {
            FastExt.System.baseUrl = window.location.href;
            if (FastExt.System.baseUrl.indexOf("#") > 0) {
                FastExt.System.baseUrl=FastExt.System.baseUrl.split("#")[0];
            }
            if (!FastExt.System.baseUrl.toString().endWith("/")) {
                FastExt.System.baseUrl = FastExt.System.baseUrl + "/";
            }

            let params = {};
            if (FastExt.Power.isPower()) {
                var window: any = window;
                if (window.parent && Ext.isFunction(window.parent.getMenuPower)) {
                    params = {menuPower: window.parent.getMenuPower()};
                }
            }
            Ext.Ajax.request({
                url: FastExt.Server.showConfigUrl(),
                params: params,
                success: function (response, opts) {
                    let data = FastExt.Json.jsonToObject(response.responseText).data;
                    for (let key in data) {
                        if (data.hasOwnProperty(key)) {
                            FastExt.System[key] = data[key];
                        }
                    }
                    let allExt = FastExt.System.getAllExt();
                    for (let i = 0; i < allExt.length; i++) {
                        let head = allExt[i];
                        FastExt.System[head.name] = head;
                    }
                },
                failure: function (response, opts) {
                    FastExt.Dialog.showException(response.responseText, "获取系统配置！[system.initConfig]");
                }
            });
        }

        /**
         * 加载系统的AppJs文件
         */
        static loadAppJs(index?: number) {
            if (!index) {
                index = 0;
            }
            if (index >= FastExt.System["app"].length) {
                Ext.MessageBox.updateProgress(1, '已加载成功，正在显示中');
                FastExt.System.addScript({src: FastExt.System.formatUrlVersion(FastExt.System.getExt("welcomeUrl").value)}, function () {
                    FastExt.System.addStyle(FastExt.System["menusCss"], function () {
                        FastExt.System.globalConfig();
                    });
                });
                return;
            }
            Ext.MessageBox.updateProgress(parseFloat(String(index + 1)) / parseFloat(FastExt.System["app"].length), '正在加载中，请耐心等待');
            FastExt.System.addScript({src: FastExt.System["app"][index]}, function () {
                FastExt.System.loadAppJs(index + 1);
            });
        }

        /**
         * 系统全局配置
         */
        static globalConfig() {
            //配置entity实体类基本属性
            let entities = FastExt.System["entities"];
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
            if (FastExt.Power.isPower()) {
                if (window.parent && Ext.isFunction(window.parent["getExtPower"])) {
                    FastExt.Power.config = true;
                    FastExt.Power.powers =  FastExt.Json.jsonToObject(window.parent["getExtPower"]());
                    if (!FastExt.Power.powers) {
                        FastExt.Power.powers = {};
                    }
                    FastExt.System.managerPowers = FastExt.Json.jsonToObject(window.parent["getParentExtPower"]());

                    //如果父级权限为false，默认同步子管理员为false
                    if (FastExt.System.managerPowers) {
                        for (let code in FastExt.Power.powers) {
                            if (FastExt.System.managerPowers.hasOwnProperty(code)) {
                                let managerPower = FastExt.System.managerPowers[code];
                                for (let managerPowerKey in managerPower) {
                                    if (!managerPower[managerPowerKey]) {
                                        FastExt.Power.powers[code][managerPowerKey] = false;
                                    }
                                }
                            }
                        }
                    }

                    window["getExtPower"] = function () {
                        return FastExt.Power.savePower();
                    };
                }
            }

            Ext.Ajax.on('beforerequest', function (conn, options, eObj) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    FastExt.Base.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).set(0);
                    FastExt.Base.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(0.7);
                } catch (e) {
                }
            });

            Ext.Ajax.on('requestcomplete',
                function (conn, response, options) {
                    try {
                        if (response.status === 203) {
                            FastExt.System.sessionOut();
                        } else {
                            try {
                                let jsonData = eval("(" + response.responseText + ")");
                                if (jsonData.code === 203) {
                                    FastExt.System.sessionOut();
                                }
                            } catch (e) {
                            }
                        }
                        FastExt.Base.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(1);
                    } catch (e) {
                    }
                });

            Ext.Ajax.on('requestexception', function (conn, response, options, eOpts) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    FastExt.Dialog.showException(response.responseText, "请求异常！");
                } catch (e) {
                }
            });


            $(document).ajaxStart(function (obj) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    FastExt.Base.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).set(0);
                    FastExt.Base.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(0.7);
                } catch (e) {
                }
            });

            $(document).ajaxComplete(function (event, xhr, options) {
                try {
                    if (xhr.status === 203) {
                        FastExt.System.sessionOut();
                    } else {
                        try {
                            let jsonData = eval("(" + xhr.responseText + ")");
                            if (jsonData.code === 203) {
                                FastExt.System.sessionOut();
                            }
                        } catch (e) {
                        }
                    }
                    FastExt.Base.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(1);
                } catch (e) {
                }
            });

            $(document).ajaxError(function (event, xhr, settings) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    FastExt.Dialog.showException(xhr.responseText, "请求异常");
                } catch (e) {
                }
            });


            window.addEventListener("popstate", function (e) {
                FastExt.System.selectTab(FastExt.System.selectTabFromHref());
            }, false);

            FastExt.System.init = true;
            FastExt.System.initSystem();
        }

        /**
         * 开始初始化加载系统的布局
         */
        static initSystem() {
            FastExt.System.removeLoading();
            let me = this;
            let container = FastExt.System.getBodyContainer();
            container.removeAll();

            let systemBgColor = FastExt.Color.toColor(me["theme-color"].value);
            let systemTlColor = FastExt.Color.toColor(me["front-color"].value);
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
                hidden: FastExt.Power.config,
                items: [headerInfo, headerTip],
                listeners: {
                    afterlayout: function () {
                        this.getEl().on("dblclick", function () {
                            if (FastExt.System.fullscreen) {
                                FastExt.System.outFullscreen();
                            } else {
                                FastExt.System.inFullScreen();
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
                                        FastExt.Dialog.showException(e);
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
                    FastExt.System.recordTab();
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
                        src: FastExt.Server.getIcon("icon_v_menu.svg"),
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
                items: [window["getWelcomePanel"]()],
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
            let tabFromHrefMenuId = me.selectTabFromHref();
            if (FastExt.Base.toBool(me['tab-record'].value, true)) {
                Ext.MessageBox.updateProgress(1, '即将完成操作，请耐心等待', '系统初始化成功！获取菜单中…');
                me.restoreTab().then(function (value) {
                    if (Ext.MessageBox.isVisible()) {
                        Ext.MessageBox.hide();
                    }
                    let tabs = FastExt.Json.jsonToObject(value);
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
        }

        /**
         * 会话失效弹框
         */
        static sessionOut() {
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
                        if (FastExt.Power.isPower()) {
                            window.parent.close();
                        } else {
                            location.reload();
                        }
                    }
                }
            });
            win.show();
        }

        /**
         * 退出登录
         */
        static logout() {
            Ext.Msg.confirm("系统提示", "<br/>您是否确定退出登录吗？", function (btn) {
                if (btn === "yes") {
                    FastExt.Server.logout();
                }
            });
        }

        /**
         * 获取配置在fast-head.html中 meta scheme="ext" 对象
         * @param key
         */
        static getExt(key: string): any {
            return window["getExt"](key);
        }

        /**
         * 获取全部的fast-head.html中 meta scheme="ext" 配置
         */
        static getAllExt() {
            return window["getAllExt"]();
        }

        /**
         * 整个FastChar-ExtJs系统是否已初始化
         */
        static isSystem():boolean{
            try {
                if (FastExt.System.init) return true;
            } catch (e) {
            }
            return false;
        }

        /**
         * 判断当前管理是否是超级管理员角色
         */
        static isSuperRole(): boolean {
            let me = this;
            if (me.manager && me.manager.role) {
                if (me.manager.role.roleType === 0) {//拥有最大权限
                    return true;
                }
            }
            return false;
        }


        /**
         * 控制浏览器界面进入全屏
         */
        static inFullScreen(): void {
            try {
                let element: any = document.documentElement;
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
        }


        /**
         * 退出全屏
         */
        static outFullscreen() {
            try {
                var document: any = document;
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
        }

        /**
         * 弹出安全验证功能操作
         * @param operate
         * @param callBack
         * @param timeout
         */
        static validOperate(operate, callBack?, timeout?) {
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
                let loginNormal = FastExt.System.getExt("login-type").value === "normal";
                let labelWidth = FastExt.Base.getNumberValue(FastExt.System.fontSize) * 5 + 8;
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
                    url: FastExt.Server.validOperateUrl(),
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
        }


        /**
         * 格式化url地址，返回带上系统版本号参数
         * @param url
         * @param params
         */
        static formatUrlVersion(url: string, params?): string {
            let newUrl = url;
            if (url.indexOf("v=") < 0) {
                if (url.indexOf("?") > 0) {
                    newUrl = url + "&v=" + FastExt.System.getValue("version").value;
                } else {
                    newUrl = url + "?v=" + FastExt.System.getValue("version").value;
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
        }

        /**
         * 格式化url地址，如果没有http开头，则自动拼接当前系统的http地址
         * @param url
         * @param params
         */
        static formatUrl(url, params?): string {
            if (url.startWith("http://") || url.startWith("https://")) {
                return url;
            }
            return this.formatUrlVersion(this.http + url, params);
        }

        /**
         * 异步执行函数
         * @param method
         */
        static asyncMethod(method) {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    let itemValue = eval(method);
                    resolve(itemValue);
                } catch (e) {
                    resolve(null);
                    console.error(e);
                }
            });
        }


        /**
         * 根据菜单ID查找菜单对象
         * @param menuId 菜单ID
         */
        static getMenu(menuId): any {
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
        }

        /**
         * 查找最后一个打开的标签页
         */
        static findLastTag(): any {
            let tabs = Ext.getCmp("tabs");
            for (let i = tabs.items.items.length - 1; i >= 0; i--) {
                let item = tabs.items.items[i];
                if (item) {
                    if (!FastExt.Base.toBool(item.tab.closable, true) && !FastExt.Base.toBool(item.tab.reorderable, true)) {
                        return item;
                    }
                }
            }
            return null;
        }

        /**
         * 记录已打开的tab标签
         */
        static recordTab() {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    let tabArray = [];
                    let tabs = Ext.getCmp("tabs");
                    tabs.items.each(function (item, index) {
                        let tab: any = {};
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

                    FastExt.Server.saveExtConfig("SystemTabs", "TabRecord", FastExt.Json.objectToJson(tabArray), function (success, message) {
                        resolve(success);
                    });
                } catch (e) {
                    reject(e);
                }
            });
        }

        /**
         * 还原记录的Tab标签
         * @return Ext.Promise
         */
        static restoreTab():any {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    FastExt.Server.showExtConfig("SystemTabs", "TabRecord", function (success, value) {
                        resolve(value);
                    });
                } catch (e) {
                    reject(e);
                }
            });
        }

        /**
         * 选中指定的标签
         * @param id
         */
        static selectTab(id): boolean {
            let me = this;
            let tab = Ext.getCmp(id);
            if (tab) {
                me.tabPanelContainer.setActiveTab(tab);
                tab.focus();
                return true;
            } else {
                return me.selectMenu(id, false);
            }
        }


        /**
         * 选中左侧的菜单
         * @param menuId 菜单Id
         * @param justParent 是否只选中父类
         */
        static selectMenu(menuId, justParent) {
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
                FastExt.Dialog.showException(e, "选择菜单！[system.selectMenu]");
            }
        }

        /**
         * 判断是否存在某个菜单
         * @param menuId
         */
        static existMenu(menuId) {
            let treelist = Ext.getCmp("leftTreeList");
            let record = treelist.getStore().getNodeById(menuId);
            return record != null;
        }


        /**
         * 运行指定方法并在左侧打开一个tab标签
         * @param method 方法名称
         * @param tabId 标签Id
         * @param title 标签的标题
         * @param icon 标签图标
         * @param activate 是否激活
         * @param moveFirst 是否移动到最前面
         * @param where 携带的接口参数
         * @param closable 是否允许关闭
         * @param reorderable 是否允许记录
         */
        static showTab(method, tabId, title, icon, activate?, moveFirst?, where?, closable?, reorderable?) {
            let me = this;
            let tabs = Ext.getCmp("tabs");
            if (tabs.getActiveTab() && tabId === tabs.getActiveTab().getId()) {
                return;
            }
            if (!icon || icon.length === 0) icon = FastExt.Server.getIcon("icon_function.svg");
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
                                color = FastExt.Color.toColor(me["theme-color"].value);
                            }
                            btnIconEl.setStyle("background-image", "url(" + FastExt.Server.getIcon(menu.iconName, color) + ")");
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
                    closable: FastExt.Base.toBool(closable, true),
                    reorderable: FastExt.Base.toBool(reorderable, true),
                    methodInvoked: false,
                    method: method,
                    where: where,
                    items: [],
                    tabBtnId: null,
                    doFixed: function () {
                        let me = this;
                        me.tab.setClosable(!me.tab.closable);
                        if (!me.tab.closable) {
                            let cmp = FastExt.System.findLastTag();
                            if (cmp) {
                                tabs.moveAfter(me, cmp);
                            }
                            me.reorderable = me.tab.reorderable = false;
                        } else {
                            me.reorderable = me.tab.reorderable = true;
                            let cmp = FastExt.System.findLastTag();
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
                        FastExt.Base.copyToBoard(FastExt.System.baseUrl + "#/" + tab.title + "/" + tab.id);
                        FastExt.Dialog.toast("复制成功！");
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
                                            entityOwner.where = FastExt.Json.mergeJson(tab.where, entityOwner.where);
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
        }


        /**
         * 添加左侧标签页
         * @param component 组件对象
         * @param id 标签ID
         * @param title 标题
         * @param icon 图标
         */
        static addTab(component, id, title, icon) {
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
        }


        /**
         * 解析地址栏中携带的菜单Id
         */
        static selectTabFromHref() {
            let href = window.location.href;
            if (href.indexOf("#") > 0) {
                return href.substring(href.lastIndexOf("/") + 1);
            }
            return null;
        }

        /**
         * 弹出修改管理员登录密码
         * @param obj 动画对象
         */
        static modifyPassword(obj) {
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
                            FastExt.Dialog.toast(action.result.message);
                            win.close();
                            if (action.result.success) {
                                Ext.Msg.alert("系统提醒", "您当前的密码已被修改，请您重新登录！", function () {
                                    FastExt.Server.logout();
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
        }


        /**
         * 根据实体编号获取实体对象
         * @param entityCode
         */
        static getEntity(entityCode) {
            let me = this;
            let entities = me["entities"];
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                if (entity.entityCode === entityCode) {
                    return entity;
                }
            }
            return null;
        }

        /**
         * 显示功能菜单和功能列
         * @param obj
         * @param checked
         */
        static showMenuColumns(obj, checked) {
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
                                for (let i = 0; i < checkedArray.length; i++) {
                                    if (checkedArray[i].isLeaf()) {
                                        let data: any = {};
                                        data.text = checkedArray[i].data.text;
                                        data.id = checkedArray[i].data.id;
                                        data.dataIndex = checkedArray[i].data.dataIndex;
                                        data.parentId = checkedArray[i].data.parentId;

                                        let findRecord = treePanel.getStore().findNode("id", data.parentId, 0, false, false, true);
                                        if (findRecord) {
                                            let parent: any = {};
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

    }


    /**
     * 系统加载脚本类
     */
    export class SystemScript{


        constructor(src: string, href?: string, text?: string) {
            this._src = src;
            this._href = href;
            this._text = text;
        }

        /**
         * js脚本的文件地址 与href相同
         */
        private _src: string;

        /**
         * js脚本的文件地址 与src相同
         */
        private _href: string;

        /**
         * js脚本代码。与src和href 互斥
         */
        private _text: string;


        get src(): string {
            return this._src;
        }

        set src(value: string) {
            this._src = value;
        }

        get href(): string {
            return this._href;
        }

        set href(value: string) {
            this._href = value;
        }

        get text(): string {
            return this._text;
        }

        set text(value: string) {
            this._text = value;
        }
    }

}