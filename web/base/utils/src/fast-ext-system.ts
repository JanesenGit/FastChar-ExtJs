namespace FastExt {

    /**
     * 系统对象
     */
    export class System {

        /**
         * 系统默认的字体大小
         */
        private static _fontSize: string = "14px";

        /**
         * 系统显示的容器
         */
        static systemBodyContainer: any;

        static get fontSize(): string {
            if (window["fontSize"]) {
                return window["fontSize"];
            }
            return this._fontSize;
        }

        /**
         * 首页头部线形状进度条
         */
        static progressLine: "ProgressBar.Line";

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
         * 复制的菜单集合
         */
        static cloneMenus: [] = null;

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
         * 是正全局保存grid配置
         */
        static silenceGlobalSave: boolean = false;

        /**
         * 实体类的集合
         */
        static entities: any[];

        /**
         * 系统首页页面的右侧面板列表
         */
        static welcomeRightPanels: any[] = [];

        /**
         * 系统首页页面的左侧面板列表
         */
        static welcomeLeftPanels: any[] = [];

        /**
         * 当前触发点击事件的目标按钮
         */
        static currClickTarget = null;

        /**
         * 配置监听实体类构建组件的函数
         */
        static extCreateFilter = {};


        /**
         * Grid管理中的相关查询按钮是否开启
         */
        static gridDefaultLinkButton = true;


        /**
         * 在进行管理员权限修改时，是否进行相同角色的判断
         */
        static managerPowerCheckSameRole = true;

        /**
         * 系统左侧菜单只允许同时展开一个
         */
        static menuSingleExpand = true;


        /**
         * 是否允许grid的列进行记忆复原
         */
        static gridColumnRestore = true;

        /**
         * 系统的监控信息
         */
        static monitor = {
            data: [],
            desc: [],
        };


        /**
         * 是否显示Grid的序号
         */
        static gridRowNumber = false;

        /**
         * 是否隐藏Grid的主键列
         */
        static gridIDColumnHidden = false;

        /**
         * 当离开Grid所在的标签页后，再次返回此标签页时将刷新当前标签页的列表数
         */
        static gridRefreshData = false;


        /**
         * 系统权限编号版本号
         */
        static powerVersion = "2.0";


        /**
         * 判断系统是否为桌面布局方式
         */
        static isDesktopLayout(): boolean {
            let systemLayout = FastExt.Objects.safeObject(FastExt.System.getExt("system-layout")).value;
            if (Ext.isEmpty(systemLayout)) {
                return false;
            }
            return systemLayout.toLowerCase() === "desktop";
        }


        /**
         * 是否是圆润立体布局
         */
        static isThemeWrap() {
            let systemTheme = FastExt.Color.toColor(FastExt.System["theme"].value);
            return systemTheme.indexOf("fast-theme-wrap") >= 0
        }


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
            if (!FastExt.System.systemBodyContainer) {
                Ext.getDoc().on("contextmenu",
                    function (e) {
                        e.stopEvent(); //禁用右键菜单
                    });
                Ext.tip.QuickTipManager.init();
                Ext.QuickTips.init();
                FastExt.System.systemBodyContainer = Ext.create('Ext.container.Viewport', {
                    id: 'bodyContainer',
                    layout: 'card',
                    border: 0,
                    renderTo: Ext.getBody()
                });
            }
            if (!Ext.isEmpty(window["systemErrorMessage"])) {
                FastExt.Dialog.toast(window["systemErrorMessage"]);
                window["systemErrorMessage"] = undefined;
            }
            return FastExt.System.systemBodyContainer;
        }

        /**
         * 获取系统属性值
         * @param name
         */
        static getValue(name: string) {
            let obj = FastExt.System[name];
            if (obj) {
                return obj;
            }
            return {value: ""};
        }

        /**
         * 动态加载js文件
         * @param script js文件对象 {src:""}
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
                oScript.src = FastExt.System.formatUrlVersion(script.src)
            } else if (script.href != null && script.href.length > 0) {
                oScript.src = FastExt.System.formatUrlVersion(script.href);
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
        static addStyle(style, callBack?) {
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
            return oStyle;
        }

        /**
         * 删除样式标签
         * @param code
         */
        static removeStyle(code) {
            let styles = document.getElementsByTagName('style');
            for (let i = 0; i < styles.length; i++) {
                let style = styles[i];
                if (style["code"] === code) {
                    style.parentNode.removeChild(style);
                }
            }
        }

        /**
         * 动态加载style文件
         * @param link 文件地址 {href:""}
         * @param callBack
         */
        static addStylesheet(link, callBack) {
            if (link == null) return;
            let oHead = document.getElementsByTagName('head').item(0);
            let oLink: any = document.createElement("link");
            oLink.rel = "stylesheet";
            oLink.href = FastExt.System.formatUrl(link.href);
            oHead.appendChild(oLink);
            oLink.onload = oLink.readystatechange = function () {
                if (callBack != null) {
                    callBack();
                }
            };
            oLink.onerror = function () {
                alert("系统Link文件" + link.href + "加载失败，请您稍后重试！");
            };
        }

        /**
         * 获得首页头部线形状进度条
         * @param toColor
         * @returns {ProgressBar.Line}
         */
        static getProgressLine(toColor: string): any {
            try {
                if (Ext.isEmpty(toColor)) {
                    toColor = "#f8c633";
                }
                if ($("#progress").length <= 0) {
                    return {
                        set: function () {

                        },
                        animate: function () {
                        },
                    };
                }
                if (!FastExt.System.progressLine) {
                    FastExt.System.progressLine = new ProgressBar.Line('#progress', {
                        color: toColor,
                        duration: 1000,
                        easing: 'easeInOut',
                        from: {
                            color: '#9c58b6'
                        },
                        to: {
                            color: toColor
                        },
                        step: function (state, line, attachment) {
                            line.path.setAttribute('stroke', state.color);
                        }
                    });
                }
                return FastExt.System.progressLine;
            } catch (e) {
            }
            return {
                set: function () {

                },
                animate: function () {

                },
            }
        }

        /**
         * 初始化系统配置
         */
        static initConfig() {
            FastExt.System.baseUrl = window.location.href;
            if (FastExt.System.baseUrl.indexOf("#") > 0) {
                FastExt.System.baseUrl = FastExt.System.baseUrl.split("#")[0];
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
        static loadAppJs() {
            FastExt.System.loadAppJsByCallback(0, function () {
                FastExt.System.globalConfig();
            });
        }

        /**
         * 加载系统app文件夹的js
         * @param index
         * @param callback
         */
        static loadAppJsByCallback(index: number, callback: any) {
            if (index >= FastExt.System["app"].length) {
                Ext.MessageBox.updateProgress(1, '已加载成功，正在显示中');
                FastExt.System.addStyle(FastExt.System["menusCss"], function () {
                    FastExt.System.initAppJsProperty();
                    callback();
                });
                return;
            }
            Ext.MessageBox.updateProgress(parseFloat(String(index + 1)) / parseFloat(FastExt.System["app"].length), '正在加载中，请耐心等待');
            FastExt.System.addScript({src: FastExt.System["app"][index]}, function () {
                FastExt.System.loadAppJsByCallback(index + 1, callback);
            });
        }

        /**
         * 初始化AppJs的默认属性值
         */
        static initAppJsProperty() {
            //将返回的entity属性配置entity对应的JS对象中
            let entities = FastExt.System["entities"];
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                try {
                    let pro = eval(entity.entityCode + ".prototype");
                    if (pro) {
                        for (let key in entity) {
                            pro[key] = entity[key];
                        }

                        entity.js = true;

                        let getList = eval("new " + entity.entityCode + "().getList");
                        if (getList) {
                            let getListFunctionStr = getList.toString();

                            let result = new RegExp("let (\\w+)[ ]?=[ ]?this[,; ]?").exec(getListFunctionStr);
                            if (result) {
                                pro["getListThisVarName"] = result[1];
                            } else {
                                pro["getListThisVarName"] = "me";
                            }

                            result = new RegExp("[let,]?[ ]?(\\w+)[ ]?=[ ]?Ext.create\\((['\"])Ext.grid.Panel\\2").exec(getListFunctionStr);
                            if (result) {
                                pro["getListGridVarName"] = result[1];
                            } else {
                                pro["getListGridVarName"] = "grid";
                            }
                        }
                    }
                } catch (e) {
                    entity.js = false;
                }
            }
        }

        /**
         * 系统全局配置
         */
        static globalConfig() {
            //配置是否进行权限
            if (FastExt.Power.isPower()) {
                if (window.parent && Ext.isFunction(window.parent["getExtPower"])) {
                    FastExt.Power.config = true;
                    FastExt.Power.powers = FastExt.Json.jsonToObject(window.parent["getExtPower"]());
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
                        return FastExt.Power.getSavePowerData();
                    };
                }
            }

            Ext.on('mousedown', function (e) {
                FastExt.System.currClickTarget = e.target;
            });

            window.addEventListener("popstate", function (e) {
                FastExt.System.selectTab(FastExt.System.getMenuIdFromLocation());
            }, false);

            FastExt.System.init = true;
            if (FastExt.System.isDesktopLayout()) {
                FastExt.Desktop.initSystem();
            } else {
                FastExt.System.initSystem();
            }
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
                        singleExpand: FastExt.System.menuSingleExpand,
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
                                    let selection = get('treelist.selection');
                                    if (selection) {
                                        if (selection.data.leaf) {
                                            me.showTab(selection.data.method, selection.data.id, selection.data.text, selection.data.icon);
                                        }
                                    }
                                    return selection;
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
                tabBar: {
                    userCls: "systemTab",
                    layout: {
                        overflowHandler: "menu",
                    },
                },
                recordTab: function () {
                    FastExt.System.recordTab();
                },
                plugins: ['tabreorderer', 'tabclosemenu'],
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
                        if (FastExt.System.silenceGlobalSave) {
                            return;
                        }
                        try {
                            me.selectMenu(me.lastTabId, true);
                        } catch (e) {
                        }
                    },
                    activate: function (tab) {
                        FastExt.System.clearAllTabTheme();
                        if (FastExt.System.silenceGlobalSave) {
                            return;
                        }
                        if (me.restoredTab) {
                            FastExt.System.pushLocationHistory({text: tab.title});
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
                items: [FastExt.System.getSystemHeaderPanel(), leftContainer, rightContainer],
            });
            container.add(containerPanel);

            let restoreTab = function () {
                if (window["indexLottie"]) {
                    window["indexLottie"].destroy();
                    window["indexLottie"] = null;
                }

                let tabFromHrefMenuId = me.getMenuIdFromLocation();
                let hasFromHref = me.existMenu(tabFromHrefMenuId);
                if (FastExt.Base.toBool(me['tab-record'].value, true)) {
                    Ext.MessageBox.updateProgress(1, '即将完成操作，请耐心等待', '系统初始化成功！获取菜单中…');
                    me.restoreTab().then(function (value) {
                        FastExt.Dialog.hideWait();
                        let tabs = FastExt.Json.jsonToObject(value);
                        me.restoredTab = true;
                        if (!tabs) {
                            return;
                        }
                        Ext.each(tabs, function (tab) {
                            if (tabFromHrefMenuId === tab.id) {
                                tab.active = true;
                            } else if (hasFromHref) {
                                tab.active = false;
                            }
                            let existMenu = FastExt.System.getMenu(tab.id);
                            if (existMenu) {
                                tab.method = existMenu.method;
                                tab.icon = existMenu.icon;
                            }
                            me.showTab(tab.method, tab.id, tab.title, tab.icon, tab.active, true, tab.where, tab.closable, tab.reorderable);
                        });
                        if (hasFromHref) {
                            me.selectTab(tabFromHrefMenuId);
                        }
                        if (tabs.length === 0 || !me.tabPanelContainer.getActiveTab()) {
                            me.tabPanelContainer.setActiveTab(Ext.getCmp("tabWelcome"));
                        }
                        if (FastExt.Listeners.onFinishSystem) {
                            FastExt.Listeners.onFinishSystem();
                        }
                    });
                } else {
                    FastExt.Dialog.hideWait();
                    me.tabPanelContainer.setActiveTab(Ext.getCmp("tabWelcome"));
                    if (FastExt.Listeners.onFinishSystem) {
                        FastExt.Listeners.onFinishSystem();
                    }
                }
            };

            if (FastExt.Base.toBool(me["needInit"], false)) {
                FastExt.Dialog.hideWait();
                FastExt.Listeners.onAfterInitSystem = function () {
                    restoreTab();
                    FastExt.Listeners.onAfterInitSystem = null;
                };
                FastExt.System.startSilenceSaveConfig(null, "正在升级当前账户的系统配置");
            } else {
                restoreTab();
            }
        }


        static getSystemHeaderPanel(cls?) {
            let systemBgColor = FastExt.Color.toColor(FastExt.System["theme-color"].value);
            let systemTlColor = FastExt.Color.toColor(FastExt.System["front-color"].value);
            let systemLogo = FastExt.System["system-logo"].value;
            let systemTitle = FastExt.Eval.runObject(FastExt.System.getAllExt(), $("title").text());

            if (Ext.isEmpty(systemLogo)) {
                systemLogo = "icons/icon_head_system.svg";
            }
            let headHeight = 55;

            if (Ext.isEmpty(cls)) {
                cls = "headContainer";
            }

            let headItems = [
                {
                    xtype: 'image',
                    src: this.formatUrl(systemLogo),
                    height: headHeight - 20,
                    width: headHeight - 20,
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
                FastExt.System.isSuperRole() ? {
                    xtype: 'button',
                    iconCls: 'extIcon extSearch searchColor',
                    text: '系统全局搜索',
                    minWidth: 155,
                    cls: 'headButton',
                    code: 'SystemGlobalSearchButton',
                    handler: function () {
                        FastExt.System.showGlobalSearch(this);
                    }
                } : null,
                {
                    xtype: 'button',
                    iconCls: 'extIcon extManager2 searchColor',
                    text: FastExt.System.manager.managerName,
                    minWidth: 155,
                    cls: 'headButton',
                    handler: function () {
                        FastExt.System.showManagerInfo(this);
                    }
                },
                {
                    xtype: 'button',
                    iconCls: 'extIcon extExits redColor',
                    text: "退出登录",
                    cls: 'headButton',
                    handler: function () {
                        FastExt.System.logout();
                    }
                }];
            if (FastExt.Listeners.onInitSystemHeaderItems) {
                FastExt.Listeners.onInitSystemHeaderItems(headItems);
            }
            let headerInfo = Ext.create('Ext.toolbar.Toolbar', {
                height: headHeight,
                padding: '0 0 0 0',
                border: 0,
                flex: 1,
                power: false,
                cls: cls,
                id: "SystemHeadButtons",
                style: {
                    background: systemBgColor
                },
                items: headItems,
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

            return Ext.create('Ext.container.Container', {
                layout: 'absolute',
                region: 'north',
                height: headHeight,
                border: 0,
                hidden: FastExt.Power.config,
                items: [headerInfo, headerTip],
                listeners: {
                    afterlayout: function () {
                        if (!FastExt.Base.toBool(this.bindFullscreen, false)) {
                            this.bindFullscreen = true;
                            this.getEl().on("dblclick", function () {
                                if (FastExt.System.fullscreen) {
                                    FastExt.System.outFullscreen();
                                } else {
                                    FastExt.System.inFullScreen();
                                }
                            });
                        }
                    }
                }
            });
        }

        /**
         * 会话失效弹框
         */
        static sessionOut(message?) {
            if (Ext.isEmpty(message)) {
                message = "系统检测到您的会话已失效，请您重新登录！";
            }
            if (Ext.getCmp("ManagerSessionOutWin")) {
                return;
            }
            let me = this;
            if (me.sessionOutAlert) {
                return;
            }
            FastExt.Dialog.hideWait();
            me.sessionOutAlert = true;

            let formPanel = Ext.create('Ext.form.FormPanel', {
                bodyPadding: 5,
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
                        jsonPath: 'base/lottie/error_normal.json',
                    },
                    {
                        xtype: "label",
                        maxWidth: 250,
                        margin: '5 5 10 5',
                        html: message,
                    }],
            });

            let warnWindow = Ext.create('Ext.window.Window', {
                title: "账户提醒",
                iconCls: 'extIcon extSessionOut',
                id: "ManagerSessionOutWin",
                width: 280,
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'middle'
                },
                maximizable: false,
                sessionWin: true,
                fixed: true,
                draggable: false,
                animateDisable: true,
                constrain: true,
                resizable: false,
                alwaysOnTop: true,
                toFrontOnShow: true,
                items: [formPanel],
                modal: true,
                listeners: {
                    destroy: function (obj, op) {
                        if (FastExt.Power.isPower()) {
                            window.parent.close();
                        } else {
                            location.reload();
                        }
                    }
                },
                buttons: [
                    '->',
                    {
                        text: "重新登录",
                        iconCls: 'extIcon extLogin',
                        handler: function () {
                            FastExt.Server.logout("退出系统中，请稍后……");
                        }
                    },
                    '->'
                ],
            });
            warnWindow.show();
        }

        /**
         * 退出登录
         */
        static logout() {
            let message = "<div style='line-height: 170%;'>";
            message += "<b style='font-size: 16px;'>您确定退出当前登录的账户吗？</b>";
            message += "<br/><b style='font-size: 14px;'>当前账户：" + FastExt.System.manager["managerName"] + "</b>";
            message += "</div>"

            Ext.Msg.confirm("系统提示", message, function (btn) {
                if (btn === "yes") {
                    FastExt.Server.logout();
                }
            });
        }


        /**
         * 弹框显示当前管理员登录信息
         */
        static showManagerInfo(obj) {
            if (!FastExt.System.manager.infoWin) {
                let data = [
                    {
                        "name": "账户名称",
                        "value": FastExt.System.manager["managerName"]
                    },
                    {
                        "name": "账户登录名",
                        "value": FastExt.System.manager["managerLoginName"]
                    },
                    {
                        "name": "账户状态",
                        "value": FastExt.System.manager["managerStateStr"]
                    },
                    {
                        "name": "账户角色",
                        "value": FastExt.System.manager["role"]["roleName"]
                    },
                    {
                        "name": "角色类型",
                        "value": FastExt.System.manager["role"]["roleTypeStr"]
                    },
                    {
                        "name": "角色状态",
                        "value": FastExt.System.manager["role"]["roleStateStr"]
                    }, {
                        "name": "允许登录",
                        "value": FastExt.System.manager["onlineTypeStr"],
                    }, {
                        "name": "最后一次登录",
                        "value": FastExt.System.manager["lastLoginTime"],
                    }];

                if (FastExt.Listeners.onShowManagerInfo) {
                    FastExt.Listeners.onShowManagerInfo(data);
                }

                let grid = FastExt.Grid.createDetailsGrid(data, {
                    power: false,
                    hideHeaders: true
                }, {}, {
                    align: 'center'
                });
                FastExt.System.manager.infoWin = Ext.create('Ext.window.Window', {
                    title: '登录系统的账户信息',
                    layout: 'fit',
                    constrain: true,
                    iconCls: 'extIcon extManager2',
                    resizable: true,
                    minHeight: 200,
                    minWidth: 400,
                    height: 400,
                    width: 350,
                    animateTarget: obj,
                    items: [grid],
                    listeners: {
                        close: function (window, eOpts) {
                            FastExt.System.manager.infoWin = null;
                        }
                    },
                    buttons: [
                        {
                            text: '退出登录',
                            iconCls: 'extIcon extExits whiteColor',
                            handler: function () {
                                FastExt.System.logout();
                            }
                        },
                        '->',
                        {
                            text: '更多操作',
                            iconCls: 'extIcon extMore whiteColor',
                            menu: [
                                {
                                    text: '初始化配置',
                                    columnWidth: 1,
                                    iconCls: 'extIcon extRefresh extRole',
                                    handler: function () {
                                        Ext.Msg.confirm("系统提醒", "将初始化系统记忆配置，确定继续吗？", function (button, text) {
                                            if (button == "yes") {
                                                FastExt.System.startSilenceSaveConfig();
                                            }
                                        });
                                    }
                                },
                                {
                                    text: '修改登录密码',
                                    iconCls: 'extIcon extResetPassword redColor',
                                    handler: function () {
                                        FastExt.System.modifyPassword(this);
                                    }
                                }
                            ]
                        }]
                });
            } else {
                FastExt.Component.shakeComment(FastExt.System.manager.infoWin);
            }
            FastExt.System.manager.infoWin.show();
        }


        /**
         * 获取配置在fast-head.html中 meta scheme="ext" 对象
         * @param key
         */
        static getExt(key: string): any {
            return window["getExt"](key);
        }


        /**
         * 是否调试模式
         */
        static isDebug(): boolean {
            return FastExt.Base.toBool(FastExt.System.getExt("debug").value, false);
        }

        /**
         * 是否是本地项目
         */
        static isLocal(): boolean {
            return FastExt.Base.toBool(FastExt.System.getExt("local").value, false);
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
        static isInitSystem(): boolean {
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
         * 获取当前管理员的ID
         */
        static getManagerId(): number {
            let me = this;
            if (me.manager) {
                return me.manager.managerId;
            }
            return -1;
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
            } catch (e) {
                console.error(e);
            } finally {
                this.fullscreen = true;
            }
        }


        /**
         * 退出全屏
         */
        static outFullscreen() {
            try {
                let element: any = document;
                if (element.exitFullscreen) {
                    element.exitFullscreen();
                } else if (element.msExitFullscreen) {
                    element.msExitFullscreen();
                } else if (element.mozCancelFullScreen) {
                    element.mozCancelFullScreen();
                } else if (element.webkitExitFullscreen) {
                    element.webkitExitFullscreen();
                }
            } catch (e) {
                console.error(e);
            } finally {
                this.fullscreen = false;
            }
        }

        /**
         * 弹出安全验证功能操作
         * @param operate 操作功能的描述
         * @param callBack 验证成功后回执函数
         * @param timeout 验证后的失效时间，单位 秒
         */
        static validOperate(operate, callBack?, timeout?) {
            if (!operate) {
                return;
            }
            let operateValid = Cookies.get("ValidOperate" + $.md5(operate));
            if (!timeout) {
                timeout = 24 * 60 * 60;
            }

            if (operateValid) {
                callBack();
            } else {
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
                                if (action.result) {
                                    Ext.Msg.alert('验证失败', action.result.message, function () {
                                        if (action.result.code === -3) {
                                            loginPanel.form.findField("validateCode").focus();
                                        }
                                    });
                                }
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
                            readOnly: true,
                            value: FastExt.System.manager.managerLoginName,
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
                    html: "<div align='center' style='font-size: small;color:red;text-decoration:none; padding-left: 40px;padding-right: 40px;padding-bottom: 10px;'>" +
                        "<b>完成验证后将继续执行《" + operate + "》操作</b>" +
                        "</div>"
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
                    items: [loginPanel, bottomPanel]
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
            if (Ext.isEmpty(url)) {
                return url;
            }
            let urlArray = url.split("@");
            url = urlArray[0];
            let newUrl = url;
            if (url.indexOf("v=") < 0) {
                if (url.indexOf("?") > 0) {
                    newUrl = url + "&v=" + FastExt.System.getExt("version").value;
                } else {
                    newUrl = url + "?v=" + FastExt.System.getExt("version").value;
                }
            }
            if (params) {
                for (let key in params) {
                    if (params.hasOwnProperty(key)) {
                        newUrl = newUrl + "&" + key + "=" + params[key];
                    }
                }
            }
            urlArray[0] = newUrl;
            return urlArray.join("@");
        }

        /**
         * 格式化url地址，如果没有http开头，则自动拼接当前系统的http地址
         * @param url
         * @param params
         */
        static formatUrl(url, params?): string {
            if (Ext.isEmpty(url)) {
                return url;
            }
            if (url.startWith("http://") || url.startWith("https://")) {
                return this.formatUrlVersion(url, params);
            }
            if (this.http) {
                return this.formatUrlVersion(this.http + url, params);
            }
            return this.formatUrlVersion(url, params);
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
         * 根据菜单ID查找菜单对象，格式化包含了parent
         * @param menuId 菜单ID
         */
        static getMenu(menuId): any {
            return FastExt.System.getMenuData(menuId);
        }

        /**
         * 根据menuId 获取menu数据对象
         * @param menuId
         */
        static getMenuData(menuId): any {
            let getMenuById = function (parent, menus, findMenuId) {
                for (let i = 0; i < menus.length; i++) {
                    let menu = menus[i];
                    let cloneMenu = Ext.clone(menu);
                    cloneMenu.parent = parent;
                    if (cloneMenu.id === findMenuId) {
                        return cloneMenu;
                    }
                    if (cloneMenu.children) {
                        let childMenu = getMenuById(cloneMenu, cloneMenu.children, findMenuId);
                        if (childMenu != null) {
                            return childMenu;
                        }
                    }
                }
                return null;
            };
            return getMenuById(null, FastExt.System.menus, menuId);
        }

        /**
         * 查找最后一个打开的标签页
         */
        static findLastTag(): any {
            for (let i = FastExt.System.tabPanelContainer.items.items.length - 1; i >= 0; i--) {
                let item = FastExt.System.tabPanelContainer.items.items[i];
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
                    FastExt.System.tabPanelContainer.items.each(function (item, index) {
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
                        tab.active = item === FastExt.System.tabPanelContainer.getActiveTab();
                        tabArray.push(tab);
                    });

                    FastExt.Server.setSilence(true);
                    FastExt.Server.saveExtConfig($.md5("SystemTabs"), "TabRecord", FastExt.Json.objectToJson(tabArray), function (success, message) {
                        resolve(success);
                        FastExt.Server.setSilence(false);
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
        static restoreTab(): any {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    FastExt.Server.showExtConfig($.md5("SystemTabs"), "TabRecord", function (success, value) {
                        resolve(value);
                    });
                } catch (e) {
                    reject(e);
                }
            });
        }

        /**
         * 选中指定的标签
         * @param id 菜单ID
         * @param shakeThis 是否抖动Tab页
         * @param moveFirst 是否移动到第一位
         */
        static selectTab(id, shakeThis?: boolean, moveFirst?: boolean): boolean {
            if (!id) {
                return false;
            }
            let me = this;
            if (FastExt.System.isDesktopLayout()) {
                FastExt.Desktop.showWindowMenu(null, FastExt.Desktop.getMenu(id));
                return false;
            }

            let tab = Ext.getCmp(id);
            if (FastExt.System.lastTabId === id && shakeThis) {
                FastExt.Component.shakeComment(tab);
            }
            if (tab) {
                me.tabPanelContainer.setActiveTab(tab);
                if (moveFirst) {
                    me.tabPanelContainer.moveAfter(tab, Ext.getCmp("tabWelcome"));
                }
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
        static selectMenu(menuId, justParent?) {
            try {
                if (FastExt.System.isDesktopLayout()) {
                    FastExt.Desktop.showWindowMenu(null, FastExt.System.getMenu(menuId));
                    return;
                }
                let me = this;
                if (Ext.isEmpty(justParent)) {
                    justParent = false;
                }
                let treelist = Ext.getCmp("leftTreeList");
                if (!treelist) {
                    return;
                }
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
            if (Ext.isEmpty(menuId)) {
                return false;
            }
            return FastExt.System.getMenu(menuId) != null;
        }

        /**
         * 获取菜单直观路径
         * @param menu 菜单对象
         * @param splitChar 菜单拼接的分隔符
         */
        static getPlainMenu(menu, splitChar?: string): string {
            if (Ext.isEmpty(splitChar)) {
                splitChar = ">";
            }
            if (menu) {
                if (menu.parent) {
                    let storeMenuText = FastExt.System.getPlainMenu(menu.parent, splitChar);
                    if (storeMenuText) {
                        return storeMenuText + splitChar + menu.text;
                    }
                } else if (menu.parentId && menu.parentId.toLowerCase() !== "root") {
                    let storeMenuText = FastExt.System.getPlainMenu(this.getMenu(menu.parentId), splitChar);
                    if (storeMenuText) {
                        return storeMenuText + splitChar + menu.text;
                    }
                }
                return menu.text;
            }
            return null;
        }

        /**
         * 获取菜单数组，包含了父类
         * @param menu 菜单对象
         */
        static getPathMenu(menu): any[] {
            if (menu) {
                if (menu.parent) {
                    let pathMenus = FastExt.System.getPathMenu(menu.parent);
                    if (pathMenus) {
                        pathMenus.push(menu);
                        return pathMenus;
                    }
                }
                return [menu];
            }
            return null;
        }

        /**
         * 获取菜单直观路径 带图标的
         * @param menu
         * @param splitChar
         */
        static getPlainIconMenu(menu, splitChar?: string): string {
            let menuArray = FastExt.System.getPathMenu(menu);
            let menuIconHtml = "<div style=\"line-height: 20px;display: flex\" >";
            for (let i = 0; i < menuArray.length; i++) {
                let targetMenu = menuArray[i];
                let itemHtml = "<img src=\"" + targetMenu.icon + "\" width=\"20px\" height=\"20px\" />" +
                    "<span style=\"margin-left: 5px;\">" + targetMenu.text + "</span> ";
                if (i != 0) {
                    itemHtml = "<span style='font-size: 12px;margin: 0 5px;color: #cccccc;' class='extIcon extArrowRight2'></span>" + itemHtml;
                }
                menuIconHtml += itemHtml;
            }
            menuIconHtml += "</div>";
            return menuIconHtml;
        }


        /**
         * 获取带图标的文字信息
         * @param menu
         */
        static getPlainIconMenuHtmlBySVG(menu) {
            return "<div style=\"line-height: 20px;display: flex\" ><svg style='width: 20px;height: 20px;' class=\"svgIconFill\" aria-hidden=\"true\"><use xlink:href=\"#" + menu.iconCls + "\"></use></svg>" +
                "<span style=\"margin-left: 5px;\">" + menu.text + "</span></div> ";
        }


        /**
         * 根据实体编号搜索左侧最近的菜单对象
         * @param entityCode
         */
        static searchMenuByEntityCode(entityCode) {
            let filterMenu = function (menuArray) {
                if (!menuArray) {
                    return null;
                }
                for (let i = 0; i < menuArray.length; i++) {
                    let menu = menuArray[i];
                    if (menu.method && menu.method.indexOf(entityCode) >= 0) {
                        return menu;
                    }
                    if (menu.children) {
                        let result = filterMenu(menu.children);
                        if (result) {
                            return result;
                        }
                    }
                }
                return null;
            };
            return filterMenu(this.menus);
        }


        /**
         * 根据实体编号搜索左侧菜单对象集合
         * @param entityCode
         */
        static searchMenusByEntityCode(entityCode) {
            let filterMenu = function (menuArray) {
                let menus = [];
                if (!menuArray) {
                    return null;
                }
                for (let i = 0; i < menuArray.length; i++) {
                    let menu = menuArray[i];
                    if (menu.method && menu.method.indexOf(entityCode) >= 0) {
                        menus.push(menu);
                    }
                    if (menu.children) {
                        let result = filterMenu(menu.children);
                        if (result) {
                            menus.push.apply(menus, result);
                        }
                    }
                }
                return menus;
            };
            return filterMenu(this.menus);
        }

        /**
         * 获取所有可点击方法的菜单集合
         * @param filterKey 过滤指定方法名
         * @return menu[]
         */
        static getAllMethodMenu(filterKey?): any[] {
            if (Ext.isEmpty(filterKey)) {
                filterKey = "";
            }
            let filterMenu = function (parentMenus, menuArray) {
                if (!parentMenus) {
                    return;
                }
                for (let i = 0; i < parentMenus.length; i++) {
                    let menu = parentMenus[i];
                    if (menu.method && menu.method.indexOf(filterKey) >= 0) {
                        menuArray.push(menu);
                    }
                    filterMenu(menu.children, menuArray);
                }
            };
            let menuArray = [];
            filterMenu(FastExt.System.menus, menuArray);
            return menuArray;
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

            let menu = me.getMenu(tabId);
            if (!menu) {
                menu = {
                    method: method,
                    id: tabId,
                    text: title,
                    icon: icon,
                };
            }
            if (FastExt.System.isDesktopLayout()) {
                FastExt.Desktop.showWindowMenu(this, menu);
                return;
            }

            if (FastExt.System.tabPanelContainer.getActiveTab() && tabId === FastExt.System.tabPanelContainer.getActiveTab().getId()) {
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
                let tooltip = title;
                if (menu) {
                    tooltip = FastExt.System.getPlainIconMenu(menu, " >> ");
                }
                currTab = FastExt.System.tabPanelContainer.add({
                    xtype: 'panel',
                    id: tabId,
                    code: tabId,
                    icon: icon,
                    layout: 'fit',
                    title: title,
                    border: 0,
                    menuId: tabId,
                    menuContainer: true,
                    closable: FastExt.Base.toBool(closable, true),
                    reorderable: FastExt.Base.toBool(reorderable, true),
                    methodInvoked: false,
                    method: method,
                    where: where,
                    items: [],
                    tabBtnId: null,
                    tabConfig: {
                        help: tooltip,
                        tabId: tabId,
                        helpType: FastEnum.HelpEnumType.mouse_in_out,
                        helpAnchor: FastEnum.TooltipAnchorType.top,
                        // helpShowDelay: 700,
                        helpMaxWidth: parseInt((document.body.clientWidth * 0.8).toFixed(0)),
                        listeners: {
                            destroy: function (obj) {
                                if (obj.helpTip) {
                                    obj.helpTip.close();
                                }
                            }
                        },
                        handler: function (clickFrom) {
                            if (clickFrom && clickFrom.xtype === "menuitem") {
                                //来自收缩的菜单里点击tab
                                FastExt.System.selectTab(clickFrom.tabId, false, true);
                            }
                        }
                    },
                    doFixed: function () {
                        let me = this;
                        me.tab.setClosable(!me.tab.closable);
                        if (!me.tab.closable) {
                            let cmp = FastExt.System.findLastTag();
                            if (cmp) {
                                FastExt.System.tabPanelContainer.moveAfter(me, cmp);
                            }
                            me.reorderable = me.tab.reorderable = false;
                        } else {
                            me.reorderable = me.tab.reorderable = true;
                            let cmp = FastExt.System.findLastTag();
                            if (cmp) {
                                FastExt.System.tabPanelContainer.moveAfter(me, cmp);
                            }
                        }
                        if (Ext.isFunction(FastExt.System.tabPanelContainer.recordTab)) {
                            FastExt.System.tabPanelContainer.recordTab();
                        }
                    },
                    doCopyUrl: function () {
                        let tab = this;
                        FastExt.Base.copyToBoard(FastExt.System.baseUrl + "#/" + tab.title + "/" + tab.id);
                        FastExt.Dialog.toast("复制成功！");
                    },
                    anchorLeftMenu: function () {
                        let tab = this;
                        FastExt.System.selectMenu(tab.id);
                    },
                    openInWindow: function () {
                        let tab = this;
                        let winWidth = parseInt((document.body.clientWidth * 0.8).toFixed(0));
                        let winHeight = parseInt((document.body.clientHeight * 0.9).toFixed(0));
                        let win = Ext.create('Ext.window.Window', {
                            title: tab.title,
                            height: winHeight,
                            width: winWidth,
                            minHeight: 500,
                            minWidth: 800,
                            icon: tab.icon,
                            layout: 'fit',
                            resizable: true,
                            constrain: true,
                            maximizable: true,
                            listeners: {
                                show: function (win) {
                                    win.shown = true;
                                    FastExt.System.asyncMethod(tab.method).then(function (obj) {
                                        if (obj == null) {
                                            return;
                                        }
                                        let entityOwner = obj.down("[entityList=true]");
                                        if (entityOwner) {
                                            entityOwner.where = FastExt.Json.mergeJson(tab.where, entityOwner.where);
                                            entityOwner.code = $.md5(tab.id);
                                            entityOwner.buildCodeText = tab.title;
                                        }
                                        win.add(obj);
                                    });
                                }
                            }
                        });
                        win.show();
                    },
                    listeners: {
                        deactivate: function (tab) {
                            if (!tab || tab.destroyed || tab.destroying) {
                                return;
                            }
                            if (!FastExt.System.silenceGlobalSave) {
                                try {
                                    changeIcon(tab, false);
                                    let entityOwner = tab.down("[entityList=true]");
                                    if (entityOwner && entityOwner.onTabDeactivate) {
                                        entityOwner.onTabDeactivate(tab);
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                        },
                        activate: function (tab) {
                            if (!tab) {
                                return;
                            }
                            me.lastTabId = tab.id;

                            let doShow = function () {
                                if (!FastExt.System.silenceGlobalSave) {
                                    if (me.existMenu(tab.id)) {
                                        me.selectMenu(tab.id, false);
                                    }
                                    changeIcon(tab, true);
                                }
                                if (!tab.methodInvoked || FastExt.System.silenceGlobalSave) {
                                    me.asyncMethod(method).then(function (obj) {
                                        try {
                                            if (!obj) {
                                                return;
                                            }
                                            tab.methodInvoked = true;
                                            let entityOwner = obj.down("[entityList=true]");
                                            if (entityOwner) {
                                                entityOwner.where = FastExt.Json.mergeJson(tab.where, entityOwner.where);
                                                entityOwner.code = $.md5(tab.id);
                                                entityOwner.buildCodeText = tab.title;
                                            }
                                            tab.add(obj);

                                        } catch (e) {
                                            console.error(e);
                                        }
                                    });
                                } else {
                                    let entityOwner = tab.down("[entityList=true]");
                                    if (entityOwner && entityOwner.onTabActivate) {
                                        entityOwner.onTabActivate(tab);
                                    }

                                    if (entityOwner && entityOwner.hasListener("aftertabactive")) {
                                        if (!entityOwner.fireEvent("aftertabactive")) {
                                            return;
                                        }
                                    }
                                }

                                if (!FastExt.System.silenceGlobalSave) {
                                    try {
                                        let href = window.location.href;
                                        if (href.indexOf("#") > 0) {
                                            let menuId = href.substring(href.lastIndexOf("/") + 1);
                                            if (tab.id === menuId) {
                                                return;
                                            }
                                        }
                                        FastExt.System.pushLocationHistory({text: tab.title, id: tab.id});
                                    } catch (e) {
                                        console.error(e);
                                    }
                                    me.recordTab();
                                }
                            };
                            FastExt.System.changeTabTheme(tab.id, doShow);
                        },
                        afterlayout: function (tab, container, pos) {
                            if (!FastExt.System.tabPanelContainer) {
                                return;
                            }
                            if (!FastExt.System.silenceGlobalSave) {
                                try {
                                    Ext.get(this.tabBtnId).dom.ondblclick = function () {
                                        let currShowTabId = tab.getId();
                                        FastExt.System.tabPanelContainer.items.each(function (obj, index) {
                                            if (index !== 0 && obj.id === currShowTabId) {
                                                if (obj.closable && Ext.isFunction(obj.close)) {
                                                    obj.close();
                                                }
                                            }
                                        });
                                    };
                                    if (FastExt.System.tabPanelContainer.getActiveTab() && FastExt.System.tabPanelContainer.getActiveTab().getId() === tab.getId()) {
                                        changeIcon(tab, true);
                                    }
                                } catch (e) {
                                }
                            }
                        },
                        destroy: function (obj, eOpts) {
                            if (!FastExt.System.silenceGlobalSave) {
                                me.recordTab();
                            }
                        }
                    },
                    initEvents: function () {
                        this.tabBtnId = this.getEl().getAttribute("aria-labelledby");
                    }
                });
            }

            if (activate) {
                if (FastExt.System.silenceGlobalSave) {
                    FastExt.System.tabPanelContainer.setActiveTab(currTab);
                    return;
                }
                if (!FastExt.System.tabPanelContainer.getActiveTab() || FastExt.System.tabPanelContainer.getActiveTab().getId() !== currTab.getId()) {
                    if (moveFirst) {
                        let cmp = me.findLastTag();
                        if (cmp) {
                            FastExt.System.tabPanelContainer.moveAfter(currTab, cmp);
                        }
                    }
                    FastExt.System.tabPanelContainer.setActiveTab(currTab);
                }
            }
        }


        /**
         * 切换Tab的主题
         * @param tabId tabId
         * @param callBack 回调函数
         */
        static changeTabTheme(menuId, callBack?) {
            try {
                let menu = FastExt.System.getMenu(menuId);
                if (menu && menu.baseCls) {
                    let tabTheme = FastExt.System.getExt("tab-theme").value;
                    if (!FastExt.Base.toBool(tabTheme, false)) {
                        return;
                    }
                    FastExt.System.clearAllTabTheme();
                    FastExt.System.getBodyContainer().setUserCls(menu.baseCls);
                } else {
                    FastExt.System.clearAllTabTheme();
                }
            } catch (e) {
                console.error(e);
            } finally {
                callBack();
            }
        }


        /**
         * 清除所有Tab的主题
         */
        static clearAllTabTheme() {
            FastExt.System.getBodyContainer().setUserCls("");
        }


        /**
         * 关闭所有Tab标签页面
         */
        static closeAllTab() {
            if (FastExt.System.isDesktopLayout()) {
                FastExt.Desktop.closeAllDesktopWin();
                return;
            }

            if (FastExt.System.tabPanelContainer) {
                FastExt.System.tabPanelContainer.items.each(function (item, index) {
                    if (item.closable) {
                        item.close();
                    }
                });
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
                    xtype: 'container',
                    id: id,
                    code: id,
                    icon: icon,
                    border: 0,
                    menuContainer: true,
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
        static getMenuIdFromLocation() {
            let href = decodeURIComponent(window.location.href);
            if (href.indexOf("#") > 0) {
                return href.substring(href.lastIndexOf("/") + 1);
            }
            return null;
        }

        /**
         * 将菜单配置的历史记录中
         * @param menu
         */
        static pushLocationHistory(menu) {
            let menuIdFromLocation = FastExt.System.getMenuIdFromLocation();
            if (menuIdFromLocation && menuIdFromLocation === menu.id) {
                return;
            }
            let state = {
                title: menu.text,
                url: menu.id ? FastExt.System.baseUrl + "#/" + menu.text + "/" + menu.id : FastExt.System.baseUrl,
            };
            window.history.pushState(state, menu.text, state.url);
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
                            if (action.result) {
                                Ext.Msg.alert('系统提醒', action.result.message);
                            }
                        }
                    });
                }
            };

            let win = Ext.create('Ext.window.Window', {
                title: '修改管理员登录密码',
                height: 250,
                iconCls: 'extIcon extResetPassword redColor',
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
                                    FastExt.Dialog.showAlert("数据获取失败", data.message, null, true, true);
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
                                    FastExt.Dialog.showAlert("数据获取失败", data.message, null, true, true);
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
                let winWidth = parseInt((document.body.clientWidth * 0.5).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.8).toFixed(0));
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
                let winWidth = parseInt((document.body.clientWidth * 0.5).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.8).toFixed(0));
                let win = Ext.create('Ext.window.Window', {
                    id: "ExtPowerWindow",
                    title: '配置界面权限（在组件上右击鼠标进行编辑权限）',
                    iconCls: 'extIcon extPower',
                    layout: 'fit',
                    resizable: false,
                    maximized: true,
                    fixed: true,
                    draggable: false,
                    width: winWidth,
                    height: winHeight,
                    listeners: {
                        show: function (obj) {
                            obj.update("<iframe name='extPowerFrame' " +
                                " src='power?managerId=0' width='100%' height='100%' frameborder='0' scrolling='no' />");
                        }
                    },
                    buttons: [
                        {
                            text: '保存权限配置',
                            iconCls: 'extIcon extSave whiteColor',
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
         * @param config 配置
         */
        static showList(menuId: string, entityCode: string, where, config) {
            if (!Ext.isString(menuId)) {
                throw "操作失败！参数menuId必须为String类型！请检查调用showList方法的相关功能！";
            }
            if (!Ext.isString(entityCode)) {
                throw "操作失败！参数entityCode必须为String类型！请检查调用showList方法的相关功能！";
            }
            if (!Ext.isEmpty(where)) {
                if (!Ext.isObject(where)) {
                    throw "操作失败！参数where必须为Object对象类型！请检查调用showList方法的相关功能！";
                }
            }
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
            if (config) {
                return entityJsObj.getList(where, config);
            }
            return entityJsObj.getList(where);
        }


        /**
         * 获取首页欢迎页面的组件
         * @return Ext.panel.Panel
         */
        static getWelcomePanel(): any {
            FastExt.System.welcomeLeftPanels.push(FastExt.System.getSystemOperate(true));
            FastExt.System.welcomeLeftPanels.push(FastExt.System.getSystemWaitNotice(true));

            let accordionPanel = Ext.create('Ext.panel.Panel', {
                layout: {
                    type: 'accordion'
                },
                region: 'center',
                border: 0,
                flex: 0.6,
                items: FastExt.System.welcomeLeftPanels
            });

            if (FastExt.System.isSuperRole()) {
                FastExt.System.welcomeRightPanels.push(FastExt.System.getSystemVersion(true));
                FastExt.System.welcomeRightPanels.push(FastExt.System.getSystemConfig(true));
                FastExt.System.welcomeRightPanels.push(FastExt.System.getSystemMonitor(true));
            }
            let rightPanel = Ext.create('Ext.panel.Panel', {
                layout: 'accordion',
                region: 'east',
                border: 0,
                flex: 0.4,
                collapsed: false,
                split: true,
                subtitle: '系统右侧面板',
                items: FastExt.System.welcomeRightPanels
            });

            let items = [accordionPanel];

            if (FastExt.System.welcomeRightPanels.length > 0) {
                items.push(rightPanel);
            }

            //自定义welcome组件
            if (FastExt.Listeners.onInitSystemWelcomeItems) {
                FastExt.Listeners.onInitSystemWelcomeItems(items);
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
        static getSystemOperate(header?: boolean): any {
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
                iconCls: header ? 'extIcon extLog' : null,
                columnLines: true,
                title: header ? '系统操作日志' : null,
                hideHeaders: true,
                dataList: true,
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
                        align: 'center',
                        rendererFunction: "renders.dateFormat('Y-m-d H:i:s')"
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
                    if (dataGridTSystemOperatesModel.whereSearchParams != null) {
                        jsonData = dataGridTSystemOperatesModel.whereSearchParams;
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


            let winWidth = parseInt((document.body.clientWidth * 0.5).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));

            let win = Ext.create('Ext.window.Window', {
                title: "日志详情",
                height: winHeight,
                iconCls: 'extIcon extDetails',
                width: winWidth,
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
            if (!grid.searchWin) {
                let defaultValue = grid.whereSearchParams ? grid.whereSearchParams : {};
                let searchForm = Ext.create('Ext.form.FormPanel', {
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
                    items: [
                        {
                            fieldLabel: '关键字',
                            columnWidth: 1,
                            name: "where['^search']",
                            xtype: 'textfield',
                            value: defaultValue["where['^search']"],
                        }, {
                            fieldLabel: '开始时间',
                            columnWidth: 0.5,
                            name: "where['systemLogDateTime>=']",
                            xtype: 'datefield',
                            format: 'Y-m-d',
                            value: defaultValue["where['systemLogDateTime>=']"],
                        }, {
                            fieldLabel: '结束时间',
                            columnWidth: 0.5,
                            name: "where['systemLogDateTime<=']",
                            xtype: 'datefield',
                            format: 'Y-m-d',
                            value: defaultValue["where['systemLogDateTime<=']"],
                        },
                        {
                            fieldLabel: '操作用户',
                            columnWidth: 0.5,
                            name: "where['a__managerName%?%']",
                            xtype: 'textfield',
                            value: defaultValue["where['a__managerName%?%']"],
                        },
                        {
                            fieldLabel: '操作类型',
                            columnWidth: 0.5,
                            name: "where['systemLogType%?%']",
                            xtype: 'textfield',
                            value: defaultValue["where['systemLogType%?%']"],
                        }
                    ]
                });

                let title = obj.text;
                if (Ext.isEmpty(title)) {
                    title = "搜索系统日志";
                }
                grid.searchWin = Ext.create('Ext.window.Window', {
                    title: title,
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
                    items: [searchForm],
                    listeners: {
                        close: function (panel, eOpts) {
                            grid.searchWin = null;
                        }
                    },
                    buttons: [{
                        text: '重置',
                        iconCls: 'extIcon extReset',
                        handler: function () {
                            searchForm.reset();
                            grid.whereSearchParams = searchForm.getValues();
                            grid.getStore().loadPage(1);
                        }
                    },
                        {
                            text: '搜索',
                            iconCls: 'extIcon extSearch',
                            handler: function () {
                                grid.whereSearchParams = searchForm.getValues();
                                grid.getStore().loadPage(1);
                            }
                        }]
                });
            } else {
                FastExt.Component.shakeComment(grid.searchWin);
            }
            grid.searchWin.show();
            return grid.searchWin;
        }


        /**
         * 获取系统待办事项组件
         * @return Ext.grid.Panel
         */
        static getSystemWaitNotice(header?: boolean): any {
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
                iconCls: header ? 'extIcon extTip' : null,
                columnLines: true,
                title: header ? '系统待办事项' : null,
                hideHeaders: true,
                dataList: true,
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
            if (FastExt.System.silenceGlobalSave) {
                if (FastExt.Base.toBool(FastExt.System["noticeListener"], false)) {
                    (<any>FastExt.Server).checkWaitNoticeTimer = setTimeout(function () {
                        FastExt.System.startCheckSystemWait();
                    }, 3000);
                }
                return;
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
                        if (FastExt.Listeners.onSystemNoticeShow) {
                            FastExt.Listeners.onSystemNoticeShow();
                        }
                    }
                } finally {
                    if (FastExt.Base.toBool(FastExt.System["noticeListener"], false)) {
                        (<any>FastExt.Server).checkWaitNoticeTimer = setTimeout(function () {
                            FastExt.System.startCheckSystemWait();
                        }, 3000);
                    }
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
         * 获取系统版本信息的组件
         * @return Ext.grid.Panel
         */
        static getSystemVersion(header?: boolean) {
            let data = [
                {
                    "name": "项目名称",
                    "value": $("title").text()
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
                    "name": "系统启动时间",
                    "value": FastExt.System["startTime"].value
                },
                {
                    "name": "系统刷新时间",
                    "value": Ext.Date.format(new Date(), "Y-m-d H:i:s")
                },
                {
                    "name": "数据库",
                    "value": FastExt.System["db"].value
                },
                {
                    "name": "数据库连接池",
                    "value": FastExt.System["dbPool"].value
                },
                {
                    "name": "项目运行容器",
                    "value": FastExt.System["server"].value
                },
                {
                    "name": "运行容器位置",
                    "value": FastExt.System["catalina"].value
                },
                {
                    "name": "项目框架",
                    "value": "<a href='http://www.fastchar.com' target='_blank' >" + FastExt.System["fastchar"].value + "</a>"
                },
                {
                    "name": "开发语言",
                    "value": FastExt.System["java"].value + " + ExtJs6 + HTML5 + CSS3"
                },
                {
                    "name": "开发服务商",
                    "value": "<a href='" + FastExt.System["developer"].href + "' target='_blank'>" + FastExt.System["developer"].value + "</a>"
                }, {
                    "name": "版权归属",
                    "value": "<a href='" + FastExt.System.getExt("copyright").href + "' target='_blank'>" + FastExt.System.getExt("copyright").value + "</a>"
                }];
            return FastExt.Grid.createDetailsGrid(data, {
                title: header ? '系统基本信息' : null,
                iconCls: header ? 'extIcon extVersion' : null,
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
        static getSystemConfig(header?: boolean) {
            let setPanel = Ext.create('Ext.form.FormPanel', {
                url: 'ext/config/saveSystemConfig',
                bodyPadding: 5,
                method: 'POST',
                region: 'center',
                power: false,
                border: 0,
                title: header ? '系统全局设置' : null,
                iconCls: header ? 'extIcon extSet' : null,
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
                        layout: "column",
                        defaults: {
                            anchor: '100%',
                            margin: '5 5 5 5',
                        },
                        items: [
                            {
                                name: 'theme-color',
                                xtype: 'colorfield',
                                fieldLabel: '系统主题颜色',
                                columnWidth: 1,
                                bind: '{theme_color}'
                            },
                            {
                                name: 'front-color',
                                xtype: 'colorfield',
                                fieldLabel: '系统前景颜色',
                                columnWidth: 1,
                                bind: '{front_color}'
                            },
                            {
                                name: 'system-layout',
                                fieldLabel: '系统布局方式',
                                columnWidth: 1,
                                xtype: 'combo',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                readOnly: true,
                                value: 1,
                                bind: '{system_layout}',
                                store: FastExt.Store.getSystemLayoutDataStore()
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
                                bind: '{window_anim}',
                                store: FastExt.Store.getYesOrNoDataStore()
                            },
                            {
                                name: 'tab-record',
                                fieldLabel: '标签记忆',
                                columnWidth: 1,
                                xtype: 'combo',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                value: 1,
                                bind: '{tab_record}',
                                store: FastExt.Store.getYesOrNoDataStore()
                            },
                            // {
                            //     name: 'desktop-menu-record',
                            //     fieldLabel: '桌面记忆',
                            //     columnWidth: 1,
                            //     xtype: 'combo',
                            //     displayField: 'text',
                            //     valueField: 'id',
                            //     editable: false,
                            //     value: 1,
                            //     bind: '{desktop_menu_record}',
                            //     store: FastExt.Store.getYesOrNoDataStore()
                            // },
                            {
                                name: 'tab-theme',
                                fieldLabel: '标签主题应用',
                                columnWidth: 1,
                                xtype: 'combo',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                value: 1,
                                bind: '{tab_theme}',
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
                                bind: '{font_size}',
                                store: FastExt.Store.getFontSizeDataStore()
                            },
                            {
                                name: 'front-radius',
                                fieldLabel: '系统圆润大小',
                                columnWidth: 1,
                                xtype: 'combo',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                bind: '{front_radius}',
                                store: FastExt.Store.getFrontRadiusDataStore()
                            },
                            {
                                xtype: 'button',
                                text: '恢复默认',
                                iconCls: 'extIcon extReset whiteColor',
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
                                iconCls: 'extIcon extSave whiteColor',
                                margin: '5 5 5 0 ',
                                handler: function () {
                                    setPanel.doSubmit();
                                }
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        title: '系统配置',
                        columnWidth: 1,
                        layout: "column",
                        defaults: {
                            anchor: '100%',
                            margin: '5 5 5 5',
                        },
                        items: [
                            {
                                xtype: 'button',
                                text: '初始化系统配置',
                                columnWidth: 1,
                                iconCls: 'extIcon extRefresh whiteColor',
                                handler: function () {
                                    Ext.Msg.confirm("系统提醒", "将初始化系统记忆配置，确定继续吗？", function (button, text) {
                                        if (button == "yes") {
                                            FastExt.System.startSilenceSaveConfig();
                                        }
                                    });
                                }
                            },
                            {
                                xtype: 'button',
                                text: '下载系统配置',
                                columnWidth: 0.5,
                                iconCls: 'extIcon extDownload whiteColor',
                                handler: function () {
                                    FastExt.Dialog.showWait("正在获取系统配置文件中……");
                                    $.post("downSystemConfig", function (result) {
                                        FastExt.Dialog.hideWait();
                                        if (result.success) {
                                            FastExt.Dialog.toast("获取成功！");
                                            FastExt.Base.openUrl(result.data, FastEnum.Target._self);
                                        } else {
                                            FastExt.Dialog.showAlert("系统提醒", result.message);
                                        }
                                    });
                                }
                            },
                            {
                                xtype: 'button',
                                text: '上传系统配置',
                                columnWidth: 0.5,
                                margin: '5 5 5 0 ',
                                iconCls: 'extIcon extUpload whiteColor',
                                handler: function () {
                                    FastExt.System.uploadSystemConfigData(this);
                                }
                            },
                            {
                                xtype: 'button',
                                text: '更新系统数据权限',
                                columnWidth: 1,
                                hidden: !FastExt.Base.toBool(FastExt.System["layer"], false),
                                iconCls: 'extIcon extPower whiteColor',
                                handler: function () {
                                    Ext.Msg.confirm("系统提醒", "确定更新系统所有表格的数据权限值吗？如果数据库数据量达到千万级别时，更新时间会较长，请谨慎操作！", function (button, text) {
                                        if (button == "yes") {
                                            FastExt.System.validOperate("更新所有表格的数据权限层级值", function () {
                                                FastExt.Dialog.showWait("正在更新中，请稍后……");
                                                FastExt.Server.updateAllLayer(function (success, message) {
                                                    FastExt.Dialog.hideWait();
                                                    FastExt.Dialog.showAlert("系统提醒", message);
                                                });
                                            }, 30);
                                        }
                                    });
                                }
                            },
                            {
                                xtype: 'button',
                                text: '更新系统数据同列值',
                                columnWidth: 1,
                                hidden: !FastExt.Base.toBool(FastExt.System["same"], true),
                                iconCls: 'extIcon extCopy2 whiteColor',
                                handler: function () {
                                    Ext.Msg.confirm("系统提醒", "确定更新系统所有表格之间有关联的相同字段值吗？", function (button, text) {
                                        if (button == "yes") {
                                            FastExt.System.validOperate("更新系统表格相同字段", function () {
                                                FastExt.Dialog.showWait("正在更新中，请稍后……");
                                                FastExt.Server.updateAllSame(function (success, message) {
                                                    FastExt.Dialog.hideWait();
                                                    FastExt.Dialog.showAlert("系统提醒", message);
                                                });
                                            }, 30);
                                        }
                                    });
                                }
                            }
                        ]
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
                                if (action.result) {
                                    Ext.Msg.alert('保存失败', action.result.message);
                                }
                            }
                        });
                    }
                }
            });
            FastExt.Server.showSystemConfig(function (success, data) {
                if (success) {
                    let newData = {};
                    for (let dataKey in data) {
                        newData[dataKey.replace("-", "_")] = data[dataKey];
                    }
                    //绑定使用不能使用 中划线
                    setPanel.getViewModel().setData(newData);
                }
            });
            return setPanel;
        }


        /**
         * 获取系统监控信息的组件
         * @return Ext.panel.Panel
         */
        static getSystemMonitor(header?: boolean) {
            if (Ext.isEmpty(header)) {
                header = true;
            }
            let monitorPanel = Ext.create('Ext.panel.Panel', {
                layout: 'column',
                region: 'north',
                power: false,
                border: 0,
                bodyPadding: 5,
                title: header ? '系统监控信息' : null,
                iconCls: header ? 'extIcon extMonitor' : null,
                closable: false,
                autoScroll: true,
                listeners: {
                    afterrender: function () {
                        loadData(monitorPanel);
                    },
                }
            });

            let loadData = function (container) {
                if (!header) {
                    container.setLoading("获取系统信息中……");
                }
                FastExt.Server.loadMonitor(function (success, result) {
                    container.setLoading(false);
                    container.removeAll();
                    if (!result) {
                        return;
                    }
                    FastExt.System.monitor = result;
                    let desc = FastExt.System.monitor.desc;
                    let data = FastExt.System.monitor.data;
                    let alertCount = 0;
                    for (let i = 0; i < desc.length; i++) {
                        let objDesc = desc[i];
                        let objData = data[i];
                        let items = [];
                        for (let objDescKey in objDesc) {
                            if (objDescKey === 'title') {
                                continue;
                            }
                            let config = {
                                xtype: 'textfield',
                                fieldLabel: objDesc[objDescKey],
                                monitorIndex: i,
                                bind: '{' + objDescKey + '}'
                            };
                            items.push(config);
                        }
                        let title = objDesc.title;
                        // if (objData.alert) {
                        //     alertCount++;
                        //     title = "<b style='color: #c21904;'>" + title + "【预警】</b>";
                        // }
                        let lastField = items[items.length - 1];
                        lastField["triggers"] = {
                            chart: {
                                cls: 'extIcon extReport2',
                                hideOnReadOnly: false,
                                handler: function () {
                                    FastExt.System.showMonitorChart(title, this.monitorIndex);
                                }
                            }
                        }

                        let cpuPanel = {
                            xtype: 'fieldset',
                            title: title,
                            columnWidth: 1,
                            collapsible: true,
                            id: "SystemMonitorFieldSet" + i,
                            viewModel: {
                                data: objData
                            },
                            defaults: {
                                anchor: '100%',
                                labelAlign: 'right',
                                labelWidth: 80,
                                columnWidth: 1,
                                editable: false,
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
                    // if (alertCount > 0) {
                    //     container.setTitle("<b style='color: #c21904;' >系统监控信息（" + alertCount + "个预警）</b>");
                    // }
                });
            };
            return monitorPanel;
        }

        /**
         * 获取系统监控信息的数据
         * @param index 监控信息的索引
         */
        static getMonitorData(index) {
            if (FastExt.System.monitor && FastExt.System.monitor.data
                && FastExt.System.monitor.data.length > index) {
                return FastExt.System.monitor.data[index];
            }
            return null;
        }

        /**
         * 显示系统监控的图表信息
         * @param title 标题
         * @param index 监控信息的索引
         */
        static showMonitorChart(title, index) {
            let monitorId = "SystemMonitorChart" + index;
            let targetMonitorWin = Ext.getCmp(monitorId);
            if (targetMonitorWin && Ext.isFunction(targetMonitorWin.updateChart)) {
                targetMonitorWin.updateChart();
                return;
            }

            let win = Ext.create('Ext.window.Window', {
                title: title,
                iconCls: "extIcon extReport2 whiteColor",
                height: 450,
                width: 450,
                id: monitorId,
                layout: 'border',
                resizable: true,
                maximizable: true,
                constrain: true,
                padding: "10 10 10 10",
                bodyStyle: {
                    background: "#ffffff"
                },
                refreshTimer: null,
                monitorIndex: index,
                monitorStopped: false,
                updateChart: function () {
                    if (this.monitorStopped) {
                        return false;
                    }
                    try {
                        let monitorData = FastExt.System.getMonitorData(this.monitorIndex);
                        if (!monitorData) {
                            return false;
                        }
                        let buildOption = function (minValue, maxValue, currValue, unit) {
                            let percent = currValue / maxValue;

                            let color = "green";

                            if (percent > 0.3) {
                                color = "purple";
                            }
                            if (percent > 0.8) {
                                color = "red";
                            }

                            let percentStr = " " + (percent * 100).toFixed(2) + "%";
                            if (unit === "%") {
                                percentStr = "";
                            }

                            return {
                                series: [
                                    {
                                        type: 'gauge',
                                        splitNumber: 10,
                                        min: minValue,
                                        max: maxValue,
                                        radius: '100%',
                                        itemStyle: {
                                            shadowColor: 'rgba(0,138,255,0.45)',
                                            shadowBlur: 10,
                                            shadowOffsetX: 2,
                                            shadowOffsetY: 2,
                                            color: color,
                                        },
                                        progress: {
                                            show: true,
                                            roundCap: true,
                                            width: 18,
                                            itemStyle: {
                                                color: {
                                                    type: 'linear',
                                                    x: 0,
                                                    y: 1,
                                                    x2: 1,
                                                    y2: 0,
                                                    colorStops: [
                                                        {
                                                            offset: 0, color: 'green'
                                                        },
                                                        {
                                                            offset: 1, color: color
                                                        }
                                                    ],
                                                }
                                            }
                                        },
                                        pointer: {
                                            icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
                                            length: '75%',
                                            width: 16,
                                            offsetCenter: [0, '5%'],
                                        },
                                        axisLine: {
                                            roundCap: true,
                                            lineStyle: {
                                                width: 18
                                            }
                                        },
                                        axisTick: {
                                            splitNumber: 5,
                                            lineStyle: {
                                                width: 2,
                                                color: '#999'
                                            }
                                        },
                                        splitLine: {
                                            length: 12,
                                            lineStyle: {
                                                width: 3,
                                                color: '#999'
                                            }
                                        },
                                        axisLabel: {
                                            distance: 30,
                                            color: '#999',
                                            formatter: function (value) {
                                                if (unit === "%") {
                                                    return value + "%";
                                                }
                                                return FastExt.Base.toByteUnit(value, 0);
                                            },
                                        },
                                        title: {
                                            show: true,
                                        },
                                        detail: {
                                            valueAnimation: true,
                                            formatter: function (value) {
                                                if (unit === "%") {
                                                    return value + "%";
                                                }
                                                return "{value|" + FastExt.Base.toByteUnit(value) + "}\n{percent|" + percentStr + "}";
                                            },
                                            rich: {
                                                percent: {
                                                    fontSize: 16,
                                                    padding: [0, 0, 0, 0],
                                                }
                                            },
                                            color: 'auto'
                                        },
                                        data: [
                                            {
                                                value: currValue
                                            }
                                        ]
                                    }
                                ]
                            };
                        };

                        let chartOption = buildOption(monitorData.min, monitorData.max, monitorData.value, FastExt.Base.toString(monitorData.unit, "byte"));
                        FastExt.ECharts.loadECharts(this, chartOption);

                        let fieldContainer = Ext.getCmp("SystemMonitorFieldSet" + this.monitorIndex);
                        if (fieldContainer) {
                            fieldContainer.getViewModel().setData(monitorData);
                        }
                        return true;
                    } catch (e) {
                        console.error(e);
                    }
                    return false;
                },
                startTimer: function (first) {
                    let me = this;
                    if (me.monitorStopped) {
                        return;
                    }
                    if (first) {
                        this.setLoading("获取监控数据中，请稍后……");
                    }
                    this.stopTimer();
                    this.refreshTimer = setTimeout(function () {
                        FastExt.Server.loadMonitor(function (success, result) {
                            FastExt.System.monitor = result;
                            if (first) {
                                me.setLoading(false);
                            }
                            if (Ext.isFunction(me.updateChart) && me.updateChart()) {
                                me.startTimer(false);
                            }
                        });
                    }, first ? 0 : 1000);
                },
                stopTimer: function () {
                    if (this.refreshTimer) {
                        clearTimeout(this.refreshTimer);
                    }
                    this.refreshTimer = null;
                },
                listeners: {
                    show: function (obj) {
                        obj.startTimer(true);
                    },
                    beforedestroy: function (obj) {
                        obj.monitorStopped = true;
                        obj.stopTimer();
                    }
                }
            });
            win.show();
        }


        /**
         * 显示登录系统的窗口-默认样式
         * @param container 窗口添加的容器
         */
        static showLogin(container) {
            let loginTitle = $("title").text();
            let loginBgUrl = FastExt.System.getExt("login-background").value;
            let systemBgColor = FastExt.Color.toColor(FastExt.System.getExt("theme-color").value);
            let loginLogo = FastExt.System.getExt("login-logo").value;
            let loginNormal = FastExt.System.getExt("login-type").value === "normal";
            let copyright = FastExt.System.getExt("copyright").value;
            let copyrightUrl = FastExt.System.getExt("copyright").href;
            let indexUrl = FastExt.System.getExt("indexUrl").value;
            let version = FastExt.System.getExt("version").desc;
            let year = new Date().getFullYear();

            loginBgUrl = FastExt.System.formatUrl(loginBgUrl, {bg: systemBgColor, dot: systemBgColor});

            let panel = Ext.create('Ext.panel.Panel', {
                layout: 'fit',
                border: 0,
                iframePanel: true,
                html: "<iframe name='loginFrame'  src='" + loginBgUrl + "' width='100%' height='100%' style='border: 0px; overflow-x: hidden;background-color: " + systemBgColor + "'/>",
            });


            let headHtml = "<div align='center' class='headPanel' style='color:" + systemBgColor + ";'><img class='loginLogo'  width='50px' height='50px;' src='" + FastExt.System.formatUrlVersion(loginLogo) + "' /><h2>" + loginTitle + "</h2></div>";

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


            let loginName = Cookies.get("loginNameValue");
            let loginPassword = Cookies.get("loginPasswordValue");
            let loginMember = Cookies.get("loginMemberValue");
            if (Ext.isEmpty(loginMember)) {
                loginMember = "0";
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
                                    letterKeyboard: true,
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
                    if (FastExt.Listeners.onBeforeManagerLogin) {
                        FastExt.Listeners.onBeforeManagerLogin(form.getValues(), function () {
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

                    Cookies.set("loginNameValue", loginName, {expires: 30});
                    Cookies.set("loginMemberValue", loginMember, {expires: 30});
                    if (parseInt(loginMember) === 1) {
                        Cookies.set("loginPasswordValue", loginPassword, {expires: 30});
                    } else {
                        Cookies.remove("loginPasswordValue");
                    }
                    form.submit({
                        params: {
                            loginPassword: $.md5(loginPassword)
                        },
                        waitMsg: '正在为您登录……',
                        success: function (form, action) {
                            FastExt.System.addScript({src: indexUrl + '?v=' + FastExt.System.getExt("version").value});
                        },
                        failure: function (form, action) {
                            refreshCode();
                            if (action.result.code === -2) {
                                loginPanel.form.findField("loginPassword").reset();
                            }
                            if (action.result) {
                                Ext.Msg.alert('登录失败', action.result.message, function () {
                                    if (action.result.code === -3) {
                                        loginPanel.form.findField("validateCode").focus();
                                    }
                                });
                            }
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


        /**
         * 显示登录系统的窗口-第二种样式
         * @param container 窗口添加的容器
         */
        static showLogin2(container) {

            let loginTitle = $("title").text();
            let loginBgUrl = FastExt.System.getExt("login-background").value;
            let loginLottieJsonUrl = FastExt.System.getExt("login-lottie-json").value;
            let systemBgColor = FastExt.Color.toColor(FastExt.System.getExt("theme-color").value);
            let loginLogo = FastExt.System.getExt("login-logo").value;
            let loginNormal = FastExt.System.getExt("login-type").value === "normal";
            let copyright = FastExt.System.getExt("copyright").value;
            let copyrightUrl = FastExt.System.getExt("copyright").href;
            let indexUrl = FastExt.System.getExt("indexUrl").value;
            let version = FastExt.System.getExt("version").desc;
            let year = new Date().getFullYear();

            loginBgUrl = FastExt.System.formatUrl(loginBgUrl, {bg: systemBgColor, dot: systemBgColor});
            loginLottieJsonUrl = FastExt.System.formatUrl(loginLottieJsonUrl, {bg: systemBgColor});

            let panel = Ext.create('Ext.panel.Panel', {
                layout: 'fit',
                border: 0,
                iframePanel: true,
                html: "<iframe name='loginFrame'  src='" + loginBgUrl + "' width='100%' height='100%' style='border: 0px; overflow-x: hidden;background-color: " + systemBgColor + "'/>",
            });


            let headHtml = "<div align='center' class='headPanel' style='color:" + systemBgColor + ";'><img class='loginLogo'  width='80px' height='80px;' src='" + FastExt.System.formatUrlVersion(loginLogo) + "' /><h2>" + loginTitle + "</h2></div>";

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


            let loginName = Cookies.get("loginNameValue");
            let loginPassword = Cookies.get("loginPasswordValue");
            let loginMember = Cookies.get("loginMemberValue");
            if (Ext.isEmpty(loginMember)) {
                loginMember = "0";
            }

            let labelWidth = FastExt.Base.getNumberValue(FastExt.System.fontSize) * 2;
            let labelAlign = "right";

            let loginItems = [
                {
                    xtype: 'textfield',
                    fieldLabel: '<svg class="svgIcon" aria-hidden="true"><use xlink:href="#extLogin"></use></svg>',
                    margin: '10 10 0 0',
                    name: 'loginName',
                    allowBlank: false,
                    blankText: '请输入登录名',
                    emptyText: '请输入登录名',
                    value: loginName,
                    anchor: "100%"
                },
                {
                    xtype: 'textfield',
                    fieldLabel: '<svg class="svgIcon" aria-hidden="true"><use xlink:href="#extLogPwd"></use></svg>',
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
                FastExt.Captcha.getLoginCaptchaCmp(),
                {
                    name: 'loginMember',
                    xtype: 'combo',
                    fieldLabel: '<svg class="svgIcon" aria-hidden="true"><use xlink:href="#extLoginRemember2"></use></svg>',
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
                            {"id": "-1", "text": "不记住"},
                            {"id": "0", "text": "记住用户名"},
                            {"id": "1", "text": "记住用户名和密码"}
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
                    items: [
                        {
                            xtype: 'button',
                            text: '立即登录',
                            itemId: 'btnLogin',
                            tipText: '登录系统',
                            margin: '10 10 10 10',
                            iconCls: 'extIcon extLogin2',
                            flex: 1,
                            handler: function () {
                                doLogin();
                            }
                        }]
                }];

            let windowConfig = {height: 500, width: 988};

            if (FastExt.Listeners.onInitLoginPanel) {
                FastExt.Listeners.onInitLoginPanel(loginItems, windowConfig);
            }

            let loginPanel = Ext.create('Ext.form.FormPanel', {
                url: FastExt.Server.loginUrl(),
                method: 'POST',
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
                        defaults: {
                            labelAlign: labelAlign,
                            labelWidth: labelWidth,
                            labelSeparator: '',
                            labelStyle: "font-size: 20px !important;color: #888888;"
                        },
                        items: loginItems,
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
                loginPanel.query("#captcha")[0].refreshCode();
            };
            let doLogin = function () {
                let form = loginPanel.form;
                if (form.isValid()) {
                    if (FastExt.Listeners.onBeforeManagerLogin) {
                        FastExt.Listeners.onBeforeManagerLogin(form.getValues(), function () {
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
                    let loginPassword = loginPanel.form.findField("loginPassword").getValue().trim();
                    let loginName = loginPanel.form.findField("loginName").getValue().trim();
                    let loginMember = loginPanel.form.findField("loginMember").getValue().trim();

                    Cookies.set("loginNameValue", loginName, {expires: 30});
                    Cookies.set("loginMemberValue", loginMember, {expires: 30});
                    if (parseInt(loginMember) === 1) {
                        Cookies.set("loginPasswordValue", loginPassword, {expires: 30});
                    } else if (parseInt(loginMember) === 0) {
                        Cookies.remove("loginPasswordValue");
                    } else {
                        Cookies.remove("loginNameValue");
                        Cookies.remove("loginPasswordValue");
                    }
                    form.submit({
                        params: {
                            loginPassword: $.md5(loginPassword)
                        },
                        waitMsg: '正在为您登录……',
                        success: function (form, action) {
                            let nextRun = function (success?) {
                                if (FastExt.Base.toBool(success, true)) {
                                    FastExt.System.addScript({src: indexUrl + '?v=' + FastExt.System.getExt("version").value});
                                } else {
                                    refreshCode();
                                }
                            };
                            if (FastExt.Listeners.onAfterManagerLogin) {
                                FastExt.Listeners.onAfterManagerLogin(nextRun);
                            } else {
                                nextRun();
                            }
                        },
                        failure: function (form, action) {
                            refreshCode();
                            if (action.result.code === -2) {
                                loginPanel.form.findField("loginPassword").reset();
                            }
                            if (action.result) {
                                Ext.Msg.alert('登录失败', action.result.message, function () {
                                    if (action.result.code === -3) {
                                        loginPanel.form.findField("validateCode").focus();
                                    }
                                });
                            }
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
                width: '100%',
                height: 50,
                bodyCls: 'bgNull',
                border: 0,
                html: "<div align='center'><a href='" + copyrightUrl + "' target='" + targetValue + "' style='font-size: xx-small;color:#aaa;text-decoration:none;'>" + copyright + "</a>" +
                    "</div><div align='center' style='font-size: xx-small;color:#aaa;margin-top: 5px;'>Copyright © " + year + " " + version + "</div>"
            });

            let rightContainerPanel = Ext.create('Ext.panel.Panel', {
                region: 'center',
                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    pack: 'center'
                },
                border: 0,
                items: [headPanel, loginPanel, bottomPanel]
            });


            let leftContainerPanel = Ext.create('Ext.panel.Panel', {
                region: 'west',
                layout: 'fit',
                width: 588,
                border: 0,
                bodyStyle: {
                    background: systemBgColor
                },
                listeners: {
                    render: function (obj) {
                        FastExt.Lottie.loadJsonAnim(obj, loginLottieJsonUrl);
                    },
                    beforedestroy: function (obj) {
                        FastExt.Lottie.unloadJsonAnim(obj);
                    }
                }
            });

            let win = Ext.create('Ext.window.Window', {
                resizable: false,
                header: false,
                layout: 'border',
                bodyCls: 'bgNull',
                closable: false,
                toFrontOnShow: true,
                constrain: true,
                width: windowConfig.width,
                height: windowConfig.height,
                items: [leftContainerPanel, rightContainerPanel]
            });

            win.show(null, function () {
                win.query("#btnLogin")[0].focus();
                if (!loginNormal) {
                    refreshCode();
                }
            });
            container.add(panel);
            container.add(win);
        }


        /**
         * 启动自动保存Grid配置
         */
        static startSilenceSaveConfig(obj?, message?: string) {
            FastExt.System["allShowListMethodMenu"] = FastExt.System.getAllMethodMenu("showList");

            for (let i = 0; i < FastExt.System.entities.length; i++) {
                let entity = FastExt.System.entities[i];
                if (!entity.js) {
                    //跳过没有js文件的实体类
                    continue;
                }
                if (Ext.isEmpty(entity.menu)) {//如果Entity未绑定后台菜单，则认为是公共实体类，所有管理员都有权限访问
                    let id = $.md5(entity.entityCode + entity.comment);
                    FastExt.System["allShowListMethodMenu"].push({
                        method: "showList('" + id + "','" + entity.entityCode + "')",
                        icon: "icons/icon_function.svg",
                        text: "",
                        id: id
                    });
                }
            }

            FastExt.System.closeAllTab();
            FastExt.System.silenceGlobalSave = true;
            Ext.MessageBox.show({
                justTop: true,
                modal: true,
                animateTarget: obj,
                title: '系统提醒',
                msg: message ? message : '初始化系统配置',
                iconCls: "extIcon extTimer",
                progressText: '请耐心等待，即将完成操作',
                progress: true,
                closable: false,
                closeAction: "destroy"
            });
            FastExt.System.doNextSilenceMenu();
        }

        /**
         * 继续执行下个可点击的菜单
         */
        static doNextSilenceMenu() {
            if (Ext.isEmpty(FastExt.System["doNextSilenceMenuIndex"])) {
                FastExt.System["doNextSilenceMenuIndex"] = 0;
            }
            let allShowListMethodMenu = FastExt.System["allShowListMethodMenu"];
            let doNextSilenceMenuIndex = FastExt.System["doNextSilenceMenuIndex"];
            if (doNextSilenceMenuIndex >= allShowListMethodMenu.length) {
                FastExt.Dialog.showAlert("系统提醒", "系统配置已初始化完毕！", null, true, true);
                FastExt.System.silenceGlobalSave = false;
                FastExt.System["doNextSilenceMenuIndex"] = 0;
                if (FastExt.Listeners.onAfterInitSystem) {
                    FastExt.Listeners.onAfterInitSystem();
                }
                return;
            }
            Ext.MessageBox.updateProgress(parseFloat(String(doNextSilenceMenuIndex + 1)) / parseFloat(allShowListMethodMenu.length), '正在读取配置中，请耐心等待');
            let menu = allShowListMethodMenu[doNextSilenceMenuIndex];
            FastExt.System.showTab(menu.method, menu.id, menu.text, menu.icon);
            FastExt.System["doNextSilenceMenuIndex"] = doNextSilenceMenuIndex + 1;
        }


        /**
         * 上传系统配置的数据文件
         * @param obj
         */
        static uploadSystemConfigData(obj) {
            // let me = obj;
            let formPanel = Ext.create('Ext.form.FormPanel', {
                url: 'loadSystemConfig',
                method: 'POST',
                margin: '5',
                fileUpload: true,
                width: 400,
                callBacked: false,
                border: 0,
                layout: 'column',
                items: [
                    {
                        xtype: 'filefield',
                        fieldLabel: '系统配置文件',
                        labelWidth: 120,
                        labelAlign: 'right',
                        buttonText: '选择文件',
                        allowBlank: false,
                        name: 'systemConfigFile',
                        columnWidth: 1
                    }
                ],
                doSubmit: function () {
                    let form = formPanel.form;
                    if (form.isValid()) {
                        let myMask = new Ext.LoadMask({
                            msg: '正在上传文件中…',
                            target: uploadWin
                        });
                        myMask.show();
                        form.submit({
                            success: function (form, action) {
                                FastExt.Dialog.toast(action.result.message);
                                uploadWin.close();
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
                title: "上传系统配置文件",
                layout: 'fit',
                resizable: false,
                scrollable: false,
                width: 500,
                items: formPanel,
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
                            formPanel.form.reset();
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
                        formPanel.getForm().findField('systemConfigFile').fileInputEl.dom.click();
                        Ext.getCmp(btnSubmitId).focus();
                    },
                }
            });
            uploadWin.show();
        }


        /**
         * 监听 实体类（*Entity.js）对象构建组件的过滤器。注意只能监听到实体对的函数代码所执行的组件创建
         * @param entityCode 实体编号
         * @param filterFunction 过滤函数，参数：info 组件信息
         */
        static addFilterByEntityCreate(entityCode: string, filterFunction?: (info: ComponentInvokeInfo) => void) {
            if (Ext.isEmpty(FastExt.System.extCreateFilter[entityCode])) {
                FastExt.System.extCreateFilter[entityCode] = [];
            }
            FastExt.System.extCreateFilter[entityCode].push(filterFunction);
        }


        /**
         * 显示全局搜索弹框
         * @param obj
         * @param entityCodes 指定entityCode
         * @param parentContainerCmp 父容器
         * @param extraParams 扩展参数
         */
        static showGlobalSearch(obj, entityCodes?: any, parentContainerCmp?: any, extraParams?: any) {
            if (Ext.isEmpty(entityCodes)) {
                entityCodes = [];
            }
            if (Ext.isEmpty(obj.code)) {
                obj.code = "GlobalSearchWin";
            }
            if (Ext.isEmpty(extraParams)) {
                extraParams = {};
            }

            let searchWinTitle = "系统全局搜索";
            let targetSearchWinId = "GlobalSearchWin" + $.md5(obj.code + entityCodes.join(","));
            let targetSearchWin = Ext.getCmp(targetSearchWinId);


            if (entityCodes.length > 0) {
                searchWinTitle = "全列搜索";
            }

            if (targetSearchWin) {
                if (targetSearchWin.isVisible()) {
                    FastExt.Component.shakeComment(targetSearchWin);
                    return;
                }
                targetSearchWin.show();
                return;
            }


            let dataStore = Ext.create('Ext.data.Store', {
                autoLoad: false,
                pageSize: 40,
                fields: [],
                entityCodes: entityCodes,
                searchType: entityCodes.length > 0 ? 1 : -1,
                proxy: {
                    type: 'ajax',
                    url: 'globalSearch',
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    listeners: {
                        exception: function (obj, request, operation, eOpts) {
                            try {
                                let data = eval("(" + request.responseText + ")");
                                if (!data.success) {
                                    FastExt.Dialog.showAlert("数据获取失败", data.message, null, true, true);
                                }
                            } catch (e) {
                                FastExt.Dialog.showAlert("数据获取失败", request.responseText, null, true, true);
                            }
                        }
                    },
                    reader: {
                        type: 'json',
                        root: 'list',
                        totalProperty: 'totalRow'
                    }
                },
                listeners: {
                    beforeload: function (store, options, eOpts) {
                        let params = store.proxy.extraParams;
                        let newParams = {
                            "key": store.searchKey,
                            "type": store.searchType,
                            "entityCode": store.entityCodes,
                        };
                        newParams = FastExt.Json.mergeJson(newParams, extraParams);
                        store.getProxy().setExtraParams(FastExt.Json.mergeJson(params, newParams));
                        return true;
                    }
                },
            });

            let grid = Ext.create('Ext.grid.Panel', {
                border: 0,
                scrollable: 'y',
                store: dataStore,
                hideHeaders: true,
                deferRowRender: false,
                dataList: true,
                region: 'center',
                columns: [
                    {
                        header: '值',
                        dataIndex: 'searchKey',
                        flex: 1,
                        renderer: function (val, m, record) {
                            m.style = 'overflow:hidden;align-items: center; display:flex;line-height:24px;';

                            let clickFun = "";
                            let headText = "";
                            let type = parseInt(record.get("type"));
                            if (type === 0) {
                                clickFun = " FastExt.System.selectTab(\"" + record.get("id") + "\",true,true)";
                                headText = "<img alt='' height='20' src='icons/icon_system.svg'/>&nbsp;" + "系统菜单";
                            } else if (type === 1) {
                                clickFun = "new " + record.get("entityCode") + "().showDetails(this,{\"" + record.get("dataIdName") + "\":\"" + record.get("dataId") + "\"})";
                                headText = "<img alt='' height='20' src='" + record.get("menuIcon") + "'/>&nbsp;" + record.get("entityInfo");
                            }

                            let tagHeadText = "<span style='" +
                                "display: inline-flex;" +
                                "background: #e3e3e3;" +
                                "color: black;" +
                                "border-radius: 3px;" +
                                "font-size:small;" +
                                "margin-right: 5px;" +
                                "padding: 2px 4px;" +
                                "align-items: center;" +
                                "justify-content: center;" +
                                "'>" + headText + "</span>";
                            return tagHeadText + "<a style='display: inline-flex;align-items: center;' href='javascript:" + clickFun + ";'>" + val + "</a>";

                        }
                    },
                ],
                emptyConfig: {
                    lottie: "base/lottie/global_search.json",
                    opacity: 1,
                    width: "70%",
                    height: "70%",
                    filter: "",
                },
                tbar: {
                    xtype: 'toolbar',
                    flex: 1,
                    style: {
                        background: "#ececec",
                    },
                    items: [
                        {
                            xtype: 'combo',
                            displayField: 'text',
                            valueField: 'id',
                            editable: false,
                            width: 120,
                            value: -1,
                            hidden: entityCodes.length > 0,
                            store: Ext.create('Ext.data.Store', {
                                data: [
                                    {
                                        id: -1,
                                        text: '全部'
                                    },
                                    {
                                        id: 0,
                                        text: '系统菜单'
                                    },
                                    {
                                        id: 1,
                                        text: '系统数据',
                                    }
                                ]
                            }),
                            listeners: {
                                change: function (obj, newValue, oldValue) {
                                    grid.getStore().searchType = newValue;
                                }
                            }
                        },
                        {
                            emptyText: '输入关键字，' + searchWinTitle + '（轻敲回车键）',
                            region: 'center',
                            flex: 1,
                            xtype: 'textfield',
                            itemId: 'searchInput',
                            name: 'searchInput',
                            code: 'searchInput' + $.md5(obj.code + entityCodes.join(",")),
                            useHistory: true,
                            doSearch: function () {
                                this.validate();
                                grid.getStore().loadPage(1);
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
                                },
                                change: function (obj, newValue, oldValue) {
                                    grid.getStore().searchKey = newValue;
                                },
                                selectHistoryValue: function (obj, history) {
                                    obj.doSearch();
                                },
                            },
                            triggers: {
                                search: {
                                    cls: 'text-search',
                                    handler: function () {
                                        this.doSearch();
                                    }
                                }
                            }
                        }
                    ]
                },
                viewConfig: {
                    loadingText: '正在努力搜索中…'
                }
            });

            let winWidth = parseInt((document.body.clientWidth * 0.5).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));

            let searchWin = Ext.create('Ext.window.Window', {
                title: searchWinTitle,
                id: targetSearchWinId,
                height: winHeight,
                width: winWidth,
                iconCls: 'extIcon extSearch',
                layout: 'border',
                resizable: true,
                constrain: true,
                maximizable: true,
                animateTarget: obj,
                items: [grid],
                modal: false,
                firstShow: true,
                listeners: {
                    close: function (winObj, eOpts) {
                    },
                    show: function (winObj) {
                        setTimeout(function () {
                            winObj.down("#searchInput").focus();
                        }, 200);
                        grid.showEmptyTip();
                    },
                    hide: function () {
                        grid.hideEmptyTip();
                    },
                }
            });
            if (parentContainerCmp) {
                parentContainerCmp.add(searchWin);
            }
            searchWin.show();
        }


        /**
         * 提取svg图标，并返回指定颜色的svg图标
         * @param icon
         * @param color
         */
        static takeIcon(icon, color): string {
            if (Ext.isEmpty(color)) {
                return icon;
            }
            let regStr = /([^/]*.svg)/;
            if (icon && regStr.test(icon)) {
                return FastExt.Server.getIcon(regStr.exec(icon)[1].trim(), color);
            }
        }

    }


    /**
     * 系统加载脚本类
     */
    export class SystemScript {

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
    export class SystemCompat {
        constructor() {
            window["getEntityDataStore"] = FastExt.Store.getEntityDataStore;
            window["commitStoreUpdate"] = FastExt.Store.commitStoreUpdate;

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

            window["showWait"] = FastExt.Dialog.showWait;
            window["hideWait"] = FastExt.Dialog.hideWait;
            window["toast"] = FastExt.Dialog.toast;
            window["showAlert"] = FastExt.Dialog.showAlert;
            window["showLink"] = FastExt.Dialog.showLink;
            window["showCode"] = FastExt.Dialog.showCode
            window["showEditorHtml"] = FastExt.Dialog.showEditorHtml;
            window["showException"] = FastExt.Dialog.showException;
            window["showJson"] = FastExt.Dialog.showJson;
            window["showVideo"] = FastExt.Dialog.showVideo;
            window["showImage"] = FastExt.Dialog.showImage;
            window["showText"] = FastExt.Dialog.showText;

            window["shakeComment"] = FastExt.Component.shakeComment;
            window["rotateOSSImgUrl"] = FastExt.Image.rotateOSSImgUrl;
            window["showRectangle"] = FastExt.Map.selRectangleInMap;
            window["MemoryCache"] = FastExt.Cache.memory;

            window["buildUUID8"] = FastExt.Base.buildUUID8;
            window["openUrl"] = FastExt.Base.openUrl;

            window["server"] = FastExt.Server;
        }
    }


    /**
     * 组件创建的信息
     */
    export class ComponentInvokeInfo {
        constructor() {
        }

        /**
         * 调用对象的方法名称
         */
        method: string;

        /**
         * 组件类型名称
         */
        xtype: string;
        /**
         * 组件创建的配置信息
         */
        config: any;
    }


    for (let subClass in FastExt) {
        if (Ext.isFunction(FastExt[subClass])) {
            FastExt[subClass]();
        }
    }
}