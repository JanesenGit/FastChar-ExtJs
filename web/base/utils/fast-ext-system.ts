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
         * 检测IE浏览器版本，不符合允许条件的阻止使用
         */
        static checkBrowserVersion(): boolean {
            if (Ext.isIE && Ext.ieVersion < 11) {
                let win = Ext.create('Ext.window.Window', {
                    title: '系统提醒',
                    width: 250,
                    height: 100,
                    layout: 'fit',
                    icon: 'icons/icon_error.svg',
                    resizable: false,
                    closable: false,
                    html: "<div style='background:#eeeeee; padding:10px;'>您当前的IE版本太低，至少在11.0以上的IE才能使用本系统！</div>",
                    modal: true
                });
                win.show();
                return false;
            }
            return true;
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
        static addScript(script: any, callBack?) {
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
                if (window.parent && Ext.isFunction((<any>window.parent).getMenuPower)) {
                    params = {menuPower: (<any>window.parent).getMenuPower()};
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
                    FastExt.System.loadAppJs();
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
                FastExt.System.addStyle(FastExt.System["menusCss"], function () {
                    FastExt.System.globalConfig();
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
                items: [FastExt.System.getWelcomePanel()],
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

        /**
         * 弹出菜单权限的配置窗体
         * @param obj 动画对象
         * @param checked 已选中的菜单Id
         * @param parent 指定上级的菜单Id
         * @return Ext.Promise
         */
        static showPowerMenus(obj, checked, parent) {
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
                                for (let i = 0; i < checkedArray.length; i++) {
                                    menuIds += "," + checkedArray[i].data.id;
                                }
                                resolve(menuIds);
                                win.close();
                            }
                        }]
                });
                win.show();
            });
        }


        /**
         * 弹出界面权限配置的窗体
         * @param obj 动画对象
         * @param menuPower 指定菜单权限
         * @param extPower 已配置的界面权限
         * @param parentExtPower 指定上级的界面权限
         */
        static showPowerExt(obj, menuPower, extPower, parentExtPower) {
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
                                resolve(window["extPowerFrame"].window.getExtPower());
                                win.close();
                            }
                        }]
                });
                win.show();
            });
        }


        /**
         * 显示实体列表数据管理界面
         * @param menuId 菜单Id
         * @param entityCode 实体编号
         * @param where 筛选条件
         */
        static showList(menuId, entityCode, where) {
            let entity = FastExt.System.getEntity(entityCode);
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
            entityJsObj.menu = FastExt.System.getMenu(menuId);
            return entityJsObj.getList(where);
        }


        /**
         * 获取首页欢迎页面的组件
         * @return Ext.panel.Panel
         */
        static getWelcomePanel(): any {
            let leftItems = [FastExt.System.getSystemOperate(), FastExt.System.getSystemWaitNotice()];

            if (FastExt.System.isSuperRole()) {
                leftItems.push(FastExt.System.getSystemBugReport());
            }
            let accordionPanel = Ext.create('Ext.panel.Panel', {
                layout: {
                    type: 'accordion'
                },
                region: 'center',
                border: 0,
                flex: 0.6,
                items: leftItems
            });

            let rightItems = [];
            if (FastExt.System.isSuperRole()) {
                rightItems.push(FastExt.System.getSystemVersion());
                rightItems.push(FastExt.System.getSystemConfig());
                rightItems.push(FastExt.System.getSystemMonitor());
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

            let items = [accordionPanel];

            if (rightItems.length > 0) {
                items.push(rightPanel);
            }

            //自定义welcome组件
            if (window["initWelcomeItems"]) {
                window["initWelcomeItems"](items);
            }

            if (!FastExt.Power.isPower()) {
                FastExt.System.startCheckSystemWait(true);
            }

            return Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'center',
                border: 0,
                items: items
            });
        }


        /**
         * 获取系统操作日志组件
         * @return Ext.grid.Panel
         */
        static getSystemOperate(): any {
            let dataStoreTSystemOperatesModel = Ext.create('Ext.data.Store', {
                autoLoad: false,
                fields: [],
                id: 'SystemLogStore',
                idProperty: 'operateId',
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
                        width: 120
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
                        width: 160,
                        align: 'center'
                    }, {
                        header: '操作',
                        dataIndex: 'systemLogId',
                        width: 100,
                        align: 'center',
                        renderer: function (val) {
                            return "<a href=\"javascript:FastExt.System.showSystemLogDetails(" + val + ");\">查看详情</a>";
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


            pagingtoolbar.insert(pagingtoolbar.items.getCount() - 2, {
                xtype: 'button',
                iconCls: 'extIcon extSearch',
                tooltip: '搜索日志',
                handler: function () {
                    dataGridTSystemOperatesModel.add(FastExt.System.showSearchSysOperate(dataGridTSystemOperatesModel, this));
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
                        "limit": dataStoreTSystemOperatesModel.pageSize
                    });
                });

            dataStoreTSystemOperatesModel.loadPage(1);

            return dataGridTSystemOperatesModel;
        }

        /**
         * 弹出系统操作日志的详情
         * @param id 日志ID
         * @return Ext.window.Window
         */
        static showSystemLogDetails(id) {
            let store = Ext.getStore("SystemLogStore");
            let record = store.findRecord("systemLogId", id, 0, false, false, true);
            let buildData = function (data) {
                let array = [];
                let names = {
                    "a__managerName": "管理员",
                    "systemLogType": "操作类型",
                    "systemLogContent": "操作详情",
                    "systemLogIp": "来自IP",
                    "systemLogClient": "浏览器信息",
                    "systemSendData": "提交的数据",
                    "systemResultData": "返回的数据",
                    "systemLogDateTime": "操作时间"
                };
                for (let key in names) {
                    array.push({
                        "name": names[key],
                        "key": key,
                        "value": data[key]
                    });
                }
                return array;
            };

            let grid = FastExt.Grid.createDetailsGrid(buildData(record.getData()), {
                region: 'center',
                power: false,
                hideHeaders: true
            }, {
                width: 100,
                flex: 0,
            }, {
                align: 'left',
                renderer: function (val, m, record) {
                    m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                    let attr = record.get("key");
                    if (attr === "systemLogIp") {
                        return "<a href='https://www.baidu.com/s?wd=" + val + "' target='_blank'>" + val + "</a>";
                    }
                    return val;
                },
                listeners: {
                    dblclick: function (grid, obj, celNo, obj1, obj2, rowNo, e) {
                        let currRecord = grid.getStore().getAt(celNo);
                        let attr = currRecord.get("key");
                        if (attr === "systemSendData" || attr === "systemResultData") {
                            FastExt.Dialog.showFormatJson(obj, currRecord.get('value'));
                        }
                    }
                }
            });


            let win = Ext.create('Ext.window.Window', {
                title: "日志详情",
                height: 500,
                iconCls: 'extIcon extDetails',
                width: 500,
                layout: 'border',
                resizable: true,
                maximizable: true,
                items: [grid],
                modal: true,
                constrain: true,
            });
            win.show();
        }

        /**
         * 弹出搜索系统操作日志窗体
         * @return  Ext.window.Window
         */
        static showSearchSysOperate(grid, obj): any {
            if (!grid.searchForm) {
                grid.searchForm = Ext.create('Ext.form.FormPanel', {
                    bodyPadding: 5,
                    region: 'center',
                    autoScroll: true,
                    layout: "column",
                    defaults: {
                        labelWidth: 100,
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
                                        grid.getStore().loadPage(1);
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
                            fieldLabel: '关键字',
                            columnWidth: 1,
                            name: "where['^search']",
                            xtype: 'textfield'
                        }, {
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
                            fieldLabel: '操作类型',
                            columnWidth: 0.5,
                            name: "where['systemLogType%?%']",
                            xtype: 'textfield'
                        }
                    ]
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
                    height: 230,
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


        /**
         * 获取系统待办事项组件
         * @return Ext.grid.Panel
         */
        static getSystemWaitNotice(): any {
            let entity = eval("new ExtSystemNoticeEntity()");
            entity.menu = {
                text: "系统问题上报"
            };
            let dataStoreNotice = Ext.create('Ext.data.Store', {
                autoLoad: false,
                fields: [],
                id: "SystemWaitNoticeStore",
                entity: entity,
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
                        width: 200
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
                        "<p>" +
                        "<tpl if='noticeState==0' >" +
                        "<a id='aNoticeAction{noticeId}' href='javascript:FastExt.System.setDoneSystemWait({noticeId});'>标记为已读</a>&nbsp;&nbsp;&nbsp;&nbsp;" +
                        "</tpl>" +
                        "<tpl if='noticeAction' >" +
                        "<a href=\"javascript:{noticeAction};\">立即前往</a>" +
                        "</tpl>" +
                        "</p>"
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
                        "limit": dataStoreNotice.pageSize
                    });
                });

            dataStoreNotice.loadPage(1);

            return dataGridNotice;
        }


        /**
         * 获取系统问题上报组件
         * @return Ext.grid.Panel
         */
        static getSystemBugReport(): any {
            let entity = eval("new ExtBugReportEntity()");
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
                    FastExt.Server.countReport(function (success, count) {
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
                        renderer: FastExt.Renders.text()
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
                            return "<a href=\"javascript:FastExt.System.showBugReportDetails(" + val + ");\">查看详情</a>";
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
                    dataGridBugReport.add(FastExt.System.showSearchBugReport(dataGridBugReport, this));
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
                    "limit": dataStoreBugReport.pageSize
                });
            });
            dataStoreBugReport.on('load', function (store, records, successful, operation, eOpts) {
                dataGridBugReport.refreshCount();
            });

            dataStoreBugReport.loadPage(1);
            return dataGridBugReport;

        }

        /**
         * 标记待办事项已完成
         * @param noticeId 待办事项ID
         */
        static setDoneSystemWait(noticeId) {
            FastExt.Dialog.showWait("正在标记中，请稍后……");
            FastExt.Server.doneWaitNotice(noticeId, function (success, message) {
                FastExt.Dialog.hideWait();
                if (success) {
                    FastExt.Dialog.toast(message);
                    $("#aNoticeAction" + noticeId).remove();
                    let winItem = Ext.getCmp("bNoticeAction" + noticeId);
                    if (winItem) {
                        Ext.getCmp("bNoticeAction" + noticeId).destroy();
                        let noticeWin = Ext.getCmp("NoticeAlertWindow");
                        if (noticeWin) {
                            let $type = $("[type='bNoticeAction']");
                            if ($type.length === 0) {
                                noticeWin.close();
                            }
                        }
                    }
                } else {
                    FastExt.Dialog.showAlert("系统提醒", message);
                }
            });
        }

        /**
         * 开启系统待办事项的监听
         * @param justRefresh 是否强制刷新所有待办
         */
        static startCheckSystemWait(justRefresh?) {
            window.clearTimeout((<any>FastExt.Server).checkWaitNoticeTimer);
            let params = {};
            if (!justRefresh) {
                let $type = $("[type='bNoticeAction']");
                for (let i = 0; i < $type.length; i++) {
                    params["noticeId_" + i] = $($type[i]).attr("data-id");
                }
            }
            FastExt.Server.checkWaitNotice(params, function (success, data) {
                try {
                    if (success) {
                        let noticeWin = Ext.getCmp("NoticeAlertWindow");
                        if (data.length <= 0 && Object.keys(params).length === 0) {
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
                                                "<a type='bNoticeAction' data-id='" + viewData.noticeId + "' href='javascript:FastExt.System.setDoneSystemWait(" + viewData.noticeId + ");'>标记为已读</a>";

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
                            if ($("#bNoticeAction" + notice.noticeId).length === 0) {
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
                                            FastExt.System.startCheckSystemWait(true);
                                        }
                                    }, {
                                        type: 'close',
                                        callback: function () {
                                            FastExt.Dialog.showWait("正在清除中，请稍后……");
                                            FastExt.Server.clearWaitNotice(function (success, message) {
                                                FastExt.Dialog.hideWait();
                                                if (success) {
                                                    noticeWin.close();
                                                } else {
                                                    FastExt.Dialog.showAlert("系统提醒", message);
                                                }
                                            });
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
                        if (window["onSystemNoticeShow"]) {
                            window["onSystemNoticeShow"]();
                        }
                    }
                } finally {
                    (<any>FastExt.Server).checkWaitNoticeTimer = setTimeout(function () {
                        FastExt.System.startCheckSystemWait();
                    }, 3000);
                }
            });
        }


        /**
         * 弹出问题详情的窗体
         * @param id 问题ID
         */
        static showBugReportDetails(id) {
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

            let grid = FastExt.Grid.createDetailsGrid(buildData(record.getData()), {
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
                                    if (button === "yes") {
                                        FastExt.Store.commitStoreDelete(store, [record]).then(function () {
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
                            FastExt.Dialog.showEditor(this, "提交修改意见", function (text) {
                                record.set("fixInfo", text);
                                record.set("reportState", 1);
                                record.set("reportStateStr", "已处理");
                                FastExt.Store.commitStoreUpdate(store);
                                grid.updateData(buildData(record.getData()));
                            });
                        }
                    }]
            });
            win.show();
        }

        /**
         * 弹出搜索系统问题的窗体
         * @param grid
         * @param obj
         * @return Ext.window.Window
         */
        static showSearchBugReport(grid, obj):any {
            if (!grid.searchForm) {
                grid.searchForm = Ext.create('Ext.form.FormPanel', {
                    bodyPadding: 5,
                    region: 'center',
                    autoScroll: true,
                    layout: "column",
                    defaults: {
                        labelWidth: 100,
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
                                        grid.getStore().loadPage(1);
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
                            enumName: "ExtBugFuncTypeEnum"
                        },
                        {
                            name: "where['reportState']",
                            xtype: "enumcombo",
                            fieldLabel: "上报状态",
                            columnWidth: 0.5,
                            enumName: "ExtBugReportStateEnum"
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
                    width: 550,
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


        /**
         * 获取系统版本信息的组件
         * @return Ext.grid.Panel
         */
        static getSystemVersion() {
            let data = [
                {
                    "name": "项目名称",
                    "value": FastExt.System["title"].value
                },
                {
                    "name": "项目版本",
                    "value": FastExt.System["version"].desc
                },
                {
                    "name": "项目位置",
                    "value": FastExt.System["root"].value
                },
                {
                    "name": "操作文档",
                    "value": "<a href='" + FastExt.System["doc-extjs"].href + "' target='_blank' >" + FastExt.System["doc-extjs"].value + "</a>"
                },
                {
                    "name": "本机IP地址",
                    "value": FastExt.System["host"].value
                },
                {
                    "name": "系统环境",
                    "value": FastExt.System["os"].value
                },
                {
                    "name": "数据库",
                    "value": FastExt.System["db"].value
                },
                {
                    "name": "运行服务器",
                    "value": FastExt.System["server"].value
                },
                {
                    "name": "服务器位置",
                    "value": FastExt.System["catalina"].value
                },
                {
                    "name": "核心框架",
                    "value": "<a href='http://www.fastchar.com' target='_blank' >" + FastExt.System["fastchar"].value + "</a>"
                },
                {
                    "name": "开发语言",
                    "value": FastExt.System["java"].value + "+ExtJs6.2.0+HTML5+CSS3"
                },
                {
                    "name": "开发服务商",
                    "value": "<a href='" + FastExt.System["developer"].href + "' target='_blank'>" + FastExt.System["developer"].value + "</a>"
                }, {
                    "name": "版权归属",
                    "value": "<a href='" + FastExt.System.getExt("copyright").href + "' target='_blank'>" + FastExt.System.getExt("copyright").value + "</a>"
                }];
            return FastExt.Grid.createDetailsGrid(data, {
                title: '系统基本信息',
                iconCls: 'extIcon extVersion',
                power: false,
                hideHeaders: true
            }, {}, {
                align: 'center'
            });
        }


        /**
         * 获取系统配置的组件
         * @return Ext.form.FormPanel
         */
        static getSystemConfig() {
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
                                store: FastExt.Store.getThemeDataStore()
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
                                store: FastExt.Store.getYesOrNoDataStore()
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
                                store: FastExt.Store.getYesOrNoDataStore()
                            },
                            {
                                name: 'font-size',
                                fieldLabel: '系统字体大小',
                                columnWidth: 1,
                                xtype: 'combo',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                value: 1,
                                bind: '{font-size}',
                                store: FastExt.Store.getFontSizeDataStore()
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
                                    if (button === "yes") {
                                        FastExt.Dialog.showWait("请稍后……");
                                        setPanel.getForm().reset();
                                        FastExt.Server.deleteSystemConfig(function (success, message) {
                                            FastExt.Dialog.hideWait();
                                            if (success) {
                                                location.reload();
                                            } else {
                                                FastExt.Dialog.showAlert("系统提醒", message);
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
                                    if (btn === "ok") {
                                        location.reload();
                                    }
                                });
                            },
                            failure: function (form, action) {
                                Ext.Msg.alert('保存失败', action.result.message);
                            }
                        });
                    }
                }
            });
            FastExt.Server.showSystemConfig(function (success, data) {
                if (success) {
                    setPanel.getViewModel().setData(data);
                }
            });
            return setPanel;
        }


        /**
         * 获取系统监控信息的组件
         * @return Ext.panel.Panel
         */
        static getSystemMonitor() {
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
                FastExt.Server.loadMonitor(function (success, result) {
                    container.removeAll();
                    if (!result) {
                        return;
                    }
                    let desc = result.desc;
                    let data = result.data;
                    let alertCount = 0;
                    for (let i = 0; i < desc.length; i++) {
                        let objDesc = desc[i];
                        let items = [];
                        for (let objDescKey in objDesc) {
                            if (objDescKey === 'title') {
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


        /**
         * 显示登录系统的窗口
         * @param container 窗口添加的容器
         */
        static showLogin(container) {
            let loginTitle = $("title").text();
            let loginBgUrl = FastExt.System.getExt("login-background").href;
            let systemBgColor = FastExt.Color.toColor(FastExt.System.getExt("theme-color").value);
            let loginLogo = FastExt.System.getExt("login-logo").value;
            let loginNormal = FastExt.System.getExt("login-type").value === "normal";
            let copyright = FastExt.System.getExt("copyright").value;
            let copyrightUrl = FastExt.System.getExt("copyright").href;
            let indexUrl = FastExt.System.getExt("indexUrl").value;
            let version = FastExt.System.getExt("version").desc;
            let year = new Date().getFullYear();

            if (loginBgUrl.indexOf("?") === -1) {
                loginBgUrl = loginBgUrl + "?1=1";
            }
            if (loginBgUrl.indexOf("bg=") === -1) {
                loginBgUrl = loginBgUrl + "&bg=" + systemBgColor;
            }
            if (loginBgUrl.indexOf("dot=") === -1) {
                loginBgUrl = loginBgUrl + "&dot=" + systemBgColor;
            }
            let panel = Ext.create('Ext.panel.Panel', {
                layout: 'fit',
                border: 0,
                iframePanel: true,
                html: "<iframe name='loginFrame'  src='" + loginBgUrl + "' width='100%' height='100%' style='border: 0px; overflow-x: hidden;background-color: " + systemBgColor + "'/>",
            });


            let headHtml = "<div align='center' class='headPanel' style='color:" + systemBgColor + ";'><img class='loginLogo'  width='50px' height='50px;' src='" + loginLogo + "' /><h2>" + loginTitle + "</h2></div>";

            if (!loginLogo || loginLogo.length === 0) {
                headHtml = "<div align='center' class='headPanel' style='color:" + systemBgColor + ";'><h2>" + loginTitle + "</h2></div>";
            }

            let headPanel = Ext.create('Ext.panel.Panel', {
                region: 'north',
                layout: 'fit',
                bodyCls: 'bgNull',
                width: '100%',
                bodyStyle: {},
                border: 0,
                height: 'auto',
                html: headHtml
            });


            let loginName = $.cookie("loginName");
            let loginPassword = $.cookie("loginPassword");
            let loginMember = $.cookie("loginMember");
            if (!loginMember) {
                loginMember = 0;
            }

            let labelWidth = FastExt.Base.getNumberValue(FastExt.System.fontSize) * 3 + 8;

            let loginPanel = Ext.create('Ext.form.FormPanel', {
                url: FastExt.Server.loginUrl(),
                method: 'POST',
                fileUpload: true,
                bodyCls: 'bgNull',
                border: 0,
                width: '100%',
                layout: "anchor",
                region: 'center',
                bodyStyle: {},
                padding: '10 10 10 10',
                items: [
                    {
                        xtype: 'fieldset',
                        title: '',
                        layout: 'anchor',
                        padding: '10 10 0 10',
                        items: [
                            {
                                xtype: 'textfield',
                                fieldLabel: '登录名',
                                labelAlign: 'right',
                                labelWidth: labelWidth,
                                margin: '10 10 0 0',
                                name: 'loginName',
                                allowBlank: false,
                                blankText: '请输入登录名',
                                emptyText: '请输入登录名',
                                value: loginName,
                                anchor: "100%"
                            }, {
                                xtype: 'textfield',
                                fieldLabel: '密码',
                                labelAlign: 'right',
                                labelWidth: labelWidth,
                                inputType: 'password',
                                margin: '10 10 0 0',
                                allowBlank: false,
                                blankText: '请输入登录密码',
                                emptyText: '请输入登录密码',
                                value: loginPassword,
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
                                    cls: 'validCodeImg',
                                    id: 'imgCode',
                                    height: 32
                                }]
                            },
                            {
                                name: 'loginMember',
                                fieldLabel: '记住',
                                xtype: 'combo',
                                labelAlign: 'right',
                                labelWidth: labelWidth,
                                margin: '10 10 0 0',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                anchor: "100%",
                                value: loginMember,
                                submitValue: false,
                                allowBlank: false,
                                store: Ext.create('Ext.data.Store', {
                                    data: [
                                        {"id": "0", "text": "用户名"},
                                        {"id": "1", "text": "用户名和密码"}
                                    ]
                                })
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
                                    text: '重置',
                                    iconCls: 'extIcon extReset',
                                    flex: 1,
                                    tipText: '重置数据',
                                    margin: '10 5 10 10',
                                    handler: function () {
                                        loginPanel.form.reset();
                                    }
                                }, {
                                    xtype: 'button',
                                    text: '登录',
                                    id: 'btnLogin',
                                    tipText: '登录系统',
                                    margin: '10 10 10 5',
                                    iconCls: 'extIcon extOk',
                                    flex: 1,
                                    handler: function () {
                                        doLogin();
                                    }
                                }]
                            }]
                    }],
                listeners: {
                    'render': function (text) {
                        try {
                            new Ext.util.KeyMap({
                                target: text.getEl(),
                                key: 13,
                                fn: doLogin,
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
            let doLogin = function () {
                let form = loginPanel.form;
                if (form.isValid()) {
                    let onBeforeLogin = window["onBeforeLogin"];
                    if (onBeforeLogin) {
                        onBeforeLogin(form.getValues(), function () {
                            toLogin();
                        });
                    } else {
                        toLogin();
                    }
                }
            };

            let toLogin = function () {
                let form = loginPanel.form;
                if (form.isValid()) {
                    let loginPassword = loginPanel.form.findField("loginPassword").getValue();
                    let loginName = loginPanel.form.findField("loginName").getValue();
                    let loginMember = loginPanel.form.findField("loginMember").getValue();

                    let date = new Date();
                    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));//30天后失效

                    $.cookie("loginName", loginName, {expires: date});
                    $.cookie("loginMember", loginMember, {expires: date});
                    if (parseInt(loginMember) === 1) {
                        $.cookie("loginPassword", loginPassword, {expires: date});
                    } else {
                        $.removeCookie("loginPassword");
                    }
                    form.submit({
                        params: {
                            loginPassword: $.md5(loginPassword)
                        },
                        waitMsg: '正在为您登录……',
                        success: function (form, action) {
                            FastExt.System.addScript({src: indexUrl + '?v=' +  FastExt.System.getExt("version").value});
                        },
                        failure: function (form, action) {
                            refreshCode();
                            if (action.result.code === -2) {
                                loginPanel.form.findField("loginPassword").reset();
                            }
                            Ext.Msg.alert('登录失败', action.result.message, function () {
                                if (action.result.code === -3) {
                                    loginPanel.form.findField("validateCode").focus();
                                }
                            });
                        }
                    });
                }
            };

            let targetValue = "_blank";
            if (copyrightUrl.startWith("javascript:")) {
                targetValue = "_self";
            }

            let bottomPanel = Ext.create('Ext.panel.Panel', {
                region: 'south',
                layout: 'fit',
                width: '100%',
                height: 50,
                bodyCls: 'bgNull',
                border: 0,
                html: "<div align='center'><a href='" + copyrightUrl + "' target='" + targetValue + "' style='font-size: xx-small;color:#aaa;text-decoration:none;'>" + copyright + "</a>" +
                    "</div><div align='center' style='font-size: xx-small;color:#aaa;margin-top: 5px;'>Copyright © " + year + " " + version + "</div>"
            });


            let win = Ext.create('Ext.window.Window', {
                title: '管理员登录',
                iconCls: 'extIcon extLogin',
                width: 420,
                resizable: false,
                layout: 'vbox',
                bodyCls: 'bgImage',
                closable: false,
                toFrontOnShow: true,
                // tools: [
                //     {
                //         type: 'help',
                //         callback: function () {
                //             setGrid(this, grid);
                //         }
                //     }
                // ],
                constrain: true,
                items: [headPanel, loginPanel, bottomPanel]
            });
            win.show(null, function () {
                Ext.getCmp("btnLogin").focus();
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
            container.add(panel);
            container.add(win);
        }

    }


    /**
     * 系统加载脚本类
     */
    export class SystemScript{

        private _src: string;


        private _href: string;


        private _text: string;

        /**
         * js脚本的文件地址 与href相同
         */
        get src(): string {
            return this._src;
        }

        set src(value: string) {
            this._src = value;
        }

        /**
         * js脚本的文件地址 与src相同
         */
        get href(): string {
            return this._href;
        }

        set href(value: string) {
            this._href = value;
        }

        /**
         * js脚本代码。与src和href 互斥
         */
        get text(): string {
            return this._text;
        }

        set text(value: string) {
            this._text = value;
        }
    }


    /**
     * 兼容老版本方法调用
     */
    export class SystemCompat{
        constructor() {
            window["getEntityDataStore"] = FastExt.Store.getEntityDataStore;
            window["getGridSelModel"] = FastExt.Grid.getGridSelModel;
            window["renders"] = FastExt.Renders;
            window["files"] = FastExt.FileModule;
            window["getPageToolBar"] = FastExt.Grid.getPageToolBar;
            window["getDetailsPanel"] = FastExt.Grid.getDetailsPanel;
            window["system"] = FastExt.System;
            window["toBool"] = FastExt.Base.toBool;
            window["deleteGridData"] = FastExt.Grid.deleteGridData;
            window["updateGridData"] = FastExt.Grid.updateGridData;
            window["runCallBack"] = FastExt.Base.runCallBack;
            window["showDetailsWindow"] = FastExt.Grid.showDetailsWindow;


            for (const dialogKey in FastExt.Dialog) {
                window[dialogKey] = FastExt.Dialog[dialogKey];
            }
            for (const componentKey in FastExt.Component) {
                window[componentKey] = FastExt.Component[componentKey];
            }
        }
    }

    for (let subClass in FastExt) {
        FastExt[subClass]();
    }
}