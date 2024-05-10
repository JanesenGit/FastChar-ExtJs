namespace FastExt {

    /**
     * 基础布局功能
     */
    export class SystemLayout {

        /**
         * 系统显示的容器
         */
        private static _systemBodyContainer: any;

        /**
         * 当前触发点击事件的目标组件，一般用于弹窗动画
         */
        private static _currClickTarget = null;

        private static _mouseClickX: number;

        private static _mouseClickY: number;

        static setCurrClickTarget(target: any) {
            this._currClickTarget = target;
        }

        static getCurrClickTarget(): any {
            return this._currClickTarget;
        }

        static setMouseClickXY(x: number, y: number) {
            this._mouseClickX = x;
            this._mouseClickY = y;
        }

        static getMouseClickXY() {
            return {
                x: this._mouseClickX,
                y: this._mouseClickY,
            }
        }


        /**
         * 获取整个系统框架容器
         * @returns Ext.container.Viewport
         */
        static getBodyContainer(): any {
            if (!this._systemBodyContainer) {
                Ext.getDoc().on("contextmenu",
                    function (e) {
                        e.stopEvent(); //禁用右键菜单
                    });
                Ext.tip.QuickTipManager.init();
                Ext.QuickTips.init();
                this._systemBodyContainer = Ext.create('Ext.container.Viewport', {
                    layout: 'fit',
                    border: 0,
                    renderTo: Ext.getBody()
                });
                if (!Ext.isEmpty(FastExt.System.ConfigHandler.getConfig("system-error-message").value)) {
                    FastExt.Dialog.toast(FastExt.System.ConfigHandler.getConfig("system-error-message").value);
                }
            }
            return this._systemBodyContainer;
        }

        /**
         * 根据菜单ID选中菜单
         * @param menuId
         */
        static selectMenu(menuId: string) {
            this.showByMenuId(menuId);
        }

        /**
         * 根据菜单ID选中菜单
         * @param menuId
         */
        static showByMenuId(menuId: string) {
            if (FastExt.System.ConfigHandler.isNormalLayout()) {
                FastExt.NormalLayout.TabContainer.showByMenuId(menuId);
            } else if (FastExt.System.ConfigHandler.isDesktopLayout()) {
                FastExt.DesktopLayout.showWindowMenuById(null, menuId);
            }
        }


        /**
         * 根据菜单对象选中菜单
         * @param menu 菜单对象
         */
        static showByMenu(menu: any) {
            if (FastExt.System.ConfigHandler.isNormalLayout()) {
                FastExt.NormalLayout.TabContainer.show(menu);
            }
        }


        /**
         * 根据菜单的中文路径选择菜单
         * @param menuLevePath 菜单层级路径，例如：系统中心>用户管理
         */
        static showMenuByPath(menuLevePath: string) {
            FastExt.SystemLayout.showByLevel(menuLevePath);
        }

        /**
         * 根据菜单的中文路径选择菜单
         * @param menuLevelPath 菜单层级路径，例如：系统中心>用户管理
         */
        static showByLevel(menuLevelPath: string) {
            let findMenu = FastExt.System.MenuHandler.findMenu(menuLevelPath);
            if (findMenu) {
                FastExt.SystemLayout.showByMenuId(findMenu.id);
            }
        }


        /**
         * 关闭系统所有tab标签
         */
        static closeAllTab() {
            if (FastExt.System.ConfigHandler.isNormalLayout()) {
                FastExt.NormalLayout.TabContainer.closeAll();
            }
        }


        static showByCmp(component, id, title, icon) {
            let winCmp = Ext.getCmp(id);
            if (winCmp) {
                FastExt.Component.shakeComment(winCmp);
                return;
            }
            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));
            let win = Ext.create('Ext.window.Window', {
                title: title,
                id: id,
                height: winHeight,
                width: winWidth,
                layout: 'border',
                icon: icon,
                resizable: true,
                constrain: true,
                maximizable: true,
                modal: false,
                listeners: {
                    show: function (obj) {
                        obj.focus();
                    }
                },
                items: [component]
            });
            win.show();
        }

        /**
         * 切换Tab的主题
         * @param menuId 菜单ID
         * @param callBack 回调函数
         */
        static changeMenuTheme(menuId, callBack?) {
            try {
                let menu = FastExt.System.MenuHandler.getMenu(menuId);
                if (menu && menu.baseCls) {
                    if (!FastExt.System.ConfigHandler.isEnableTabTheme()) {
                        return;
                    }
                    FastExt.SystemLayout.clearAllMenuTheme();
                    FastExt.SystemLayout.getBodyContainer().setUserCls(menu.baseCls);
                } else {
                    FastExt.SystemLayout.clearAllMenuTheme();
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
        static clearAllMenuTheme() {
            FastExt.SystemLayout.getBodyContainer().setUserCls("");
        }

    }


    /**
     * 登录的布局
     */
    export class LoginLayout {
        private static _sessionOutAlert: boolean;


        /**
         * 显示登录系统的窗口
         */
        static showLoginPanel() {
            let container = FastExt.SystemLayout.getBodyContainer();
            container.removeAll();

            let loginTitle = FastExt.System.ConfigHandler.getSystemTitle();

            let loginBgUrl = FastExt.System.ConfigHandler.getLoginBackground();
            let loginLottieJsonUrl = FastExt.System.ConfigHandler.getLoginLottieJson();
            let systemBgColor = FastExt.System.ConfigHandler.getThemeColor();
            let loginLogo = FastExt.System.ConfigHandler.getLoginLogo();
            let loginNormal = FastExt.System.ConfigHandler.getLoginType() === "normal";
            let copyright = FastExt.System.ConfigHandler.getSystemCopyright();
            let copyrightUrl = FastExt.System.ConfigHandler.getSystemCopyrightUrl();
            let indexUrl = FastExt.System.ConfigHandler.getIndexUrl();
            let version = FastExt.System.ConfigHandler.getSystemVersion();

            let year = new Date().getFullYear();

            loginBgUrl = FastExt.Base.formatUrl(loginBgUrl, {bg: systemBgColor, dot: systemBgColor});
            loginLottieJsonUrl = FastExt.Base.formatUrl(loginLottieJsonUrl, {bg: systemBgColor});

            let panel = Ext.create('Ext.panel.Panel', {
                layout: 'fit',
                border: 0,
                iframePanel: true,
                html: "<iframe name='loginFrame'  src='" + loginBgUrl + "' width='100%' height='100%' style='border: 0; overflow-x: hidden;background-color: " + systemBgColor + "'/>",
            });


            let headHtml = "<div align='center' class='fast-system-login-head-container' style='color:" + systemBgColor + ";'><img  class='fast-system-login_logo' " +
                " width='80px' height='80px;' src='" + FastExt.Base.formatUrlVersion(loginLogo) + "' alt='logo' /><h2>" + loginTitle + "</h2></div>";

            if (!loginLogo || loginLogo.length === 0) {
                headHtml = "<div align='center' class='fast-system-login-head-container' style='color:" + systemBgColor + ";'><h2>" + loginTitle + "</h2></div>";
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

            let labelWidth = FastExt.System.ConfigHandler.getFontSizeNumber() * 2;
            let labelAlign = "right";

            let loginItems = [
                {
                    xtype: 'textfield',
                    fieldLabel: '<svg class="svgIcon" aria-hidden="true"><use xlink:href="#extLogin"></use></svg>',
                    margin: '10 10 0 0',
                    name: 'loginName',
                    id: "loginName",
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

            let windowConfig = {
                height: 540, width: 988
            };

            FastExt.Listeners.getFire().onInitLoginPanel(loginItems, windowConfig);

            let loginPanel = Ext.create('Ext.form.FormPanel', {
                url: FastExt.Server.loginUrl(),
                method: 'POST',
                bodyCls: 'fast-bg-null',
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
                            labelStyle: "font-size: 24px !important;color: #666666;"
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
                    FastExt.Listeners.getFire().onBeforeManagerLogin(form.getValues(), function () {
                        toLogin();
                    });
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
                    let loginSuccessNextRun = function (success?) {
                        if (FastExt.Base.toBool(success, true)) {
                            FastExt.Documents.addScript({src: indexUrl + '?v=' + FastExt.System.ConfigHandler.getSystemVersionInt()});
                        } else {
                            refreshCode();
                        }
                    };

                    form.submit({
                        params: {
                            loginPassword: $.md5(loginPassword)
                        },
                        waitMsg: '正在为您登录……',
                        success: function (form, action) {
                            FastExt.Listeners.getFire().onAfterManagerLogin(loginSuccessNextRun);
                        },
                        failure: function (form, action) {
                            refreshCode();
                            if (action.result.code === -2) {
                                loginPanel.form.findField("loginPassword").reset();
                            } else if (action.result.code === -3) {//验证谷歌验证器
                                FastExt.Captcha.showGoogleAuthentication(1, loginSuccessNextRun);
                                return;
                            } else if (action.result.code === -4) {//绑定并验证谷歌验证器
                                FastExt.Captcha.showGoogleAuthentication(2, loginSuccessNextRun);
                                return;
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
            if (copyrightUrl.indexOf("javascript:") === 0) {
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
                bodyCls: 'fast-bg-null',
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
         * 退出登录
         */
        static showLogout() {
            let message = "<div style='line-height: 170%;'>";
            message += "<b style='font-size: 16px;'>您确定退出当前登录的账户吗？</b>";
            message += "<br/><b style='font-size: 14px;'>当前账户：" + FastExt.System.ManagerHandler.getManagerName() + "</b>";
            message += "</div>"

            Ext.Msg.confirm("系统提示", message, function (btn) {
                if (btn === "yes") {
                    FastExt.Server.logout();
                }
            });
        }


        static isShownSessionOutAlert(): boolean {
            return this._sessionOutAlert;
        }


        /**
         * 会话失效弹框
         */
        static showSessionOut(message?) {
            if (Ext.isEmpty(message)) {
                message = "系统检测到您的会话已失效，请您重新登录！";
            }
            if (Ext.getCmp("ManagerSessionOutWin")) {
                return;
            }
            let me = this;
            if (me._sessionOutAlert) {
                return;
            }
            FastExt.Dialog.hideWait();
            me._sessionOutAlert = true;

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
                        text: "知道了",
                        iconCls: 'extIcon extOk',
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
                let loginNormal = FastExt.System.ConfigHandler.getLoginType() === "normal";
                let labelWidth = FastExt.Base.getNumberValue(FastExt.System.ConfigHandler.getFontSize()) * 5 + 8;
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
                            value: FastExt.System.ManagerHandler.getManagerLoginName(),
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

    }


    /**
     * 管理员相关信息操作
     */
    export class ManagerLayout {
        private static _manageInfoWindow: any;

        /**
         * 弹框显示当前管理员登录信息
         */
        static showManagerInfo(obj:any) {
            if (!this._manageInfoWindow) {
                let data = [
                    {
                        "name": "账户名称",
                        "value": FastExt.System.ManagerHandler.getManagerName()
                    },
                    {
                        "name": "账户登录名",
                        "value": FastExt.System.ManagerHandler.getManagerLoginName()
                    },
                    {
                        "name": "账户状态",
                        "value": FastExt.System.ManagerHandler.getManagerStateStr()
                    },
                    {
                        "name": "账户角色",
                        "value": FastExt.System.ManagerHandler.getRoleName()
                    },
                    {
                        "name": "角色类型",
                        "value": FastExt.System.ManagerHandler.getRoleTypeStr()
                    },
                    {
                        "name": "角色状态",
                        "value": FastExt.System.ManagerHandler.getRoleStateStr()
                    }, {
                        "name": "允许登录",
                        "value": FastExt.System.ManagerHandler.getOnlineTypeStr()
                    }, {
                        "name": "最后一次登录",
                        "value": FastExt.System.ManagerHandler.getLastLoginTime()
                    }];

                FastExt.Listeners.getFire().onShowManagerInfo(data);

                let grid = FastExt.Grid.createDetailsGrid(data, {
                    power: false,
                    hideHeaders: true
                }, {}, {
                    align: 'center'
                });
                this._manageInfoWindow = Ext.create('Ext.window.Window', {
                    title: '登录系统的账户信息',
                    layout: 'fit',
                    constrain: true,
                    iconCls: 'extIcon extManager2',
                    resizable: true,
                    minHeight: 200,
                    minWidth: 400,
                    height: 520,
                    width: 460,
                    animateTarget: obj,
                    items: [grid],
                    listeners: {
                        close: function () {
                            FastExt.ManagerLayout._manageInfoWindow = null;
                        }
                    },
                    buttons: [
                        {
                            text: '退出登录',
                            iconCls: 'extIcon extExits whiteColor',
                            handler: function () {
                                FastExt.LoginLayout.showLogout();
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
                                                FastExt.System.InitHandler.startSilenceSaveConfig();
                                            }
                                        });
                                    }
                                },
                                {
                                    text: '修改登录密码',
                                    iconCls: 'extIcon extResetPassword redColor',
                                    handler: function () {
                                        FastExt.ManagerLayout.showModifyPassword(this);
                                    }
                                }
                            ]
                        }]
                });
            } else {
                FastExt.Component.shakeComment(this._manageInfoWindow);
            }
            this._manageInfoWindow.show();
        }


        /**
         * 弹出修改管理员登录密码
         * @param obj 动画对象
         */
        static showModifyPassword(obj:any) {
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
                        value: FastExt.System.ManagerHandler.getManagerId(),
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

    }


    /**
     * 首页的布局
     */
    export class IndexLayout {


        /**
         * 系统的监控信息
         */
        private static _monitor = {
            data: [],
            desc: [],
        };


        /**
         * 获取首页欢迎页面的组件
         * @return Ext.panel.Panel
         */
        static getWelcomePanel(): any {
            let leftPanels = [];

            let rightPanels = [];

            //自定义welcome组件
            FastExt.Listeners.getFire().onInitSystemWelcomeItems(new class implements FastExt.EventWelcomeHandler {
                addLeftPanel(panel: any): void {
                    leftPanels.push(panel);
                }

                addRightPanel(panel: any): void {
                    rightPanels.push(panel);
                }
            });

            if (FastExt.System.ConfigHandler.isDataboard()) {
                leftPanels.push(FastExt.Databoard.getPanel());
            }
            leftPanels.push(FastExt.IndexLayout.getSystemOperatePanel(true));

            if (FastExt.System.ManagerHandler.isSuperRole()) {
                rightPanels.push(FastExt.IndexLayout.getSystemVersionPanel(true));
                rightPanels.push(FastExt.IndexLayout.getSystemConfigPanel(true));
            }


            let leftPanel = Ext.create('Ext.panel.Panel', {
                layout: {
                    type: 'accordion'
                },
                region: 'center',
                border: 0,
                flex: 0.6,
                items: leftPanels
            });


            let items = [leftPanel];

            if (rightPanels.length > 0) {
                items.push(Ext.create('Ext.panel.Panel', {
                    layout: 'accordion',
                    region: 'east',
                    border: 0,
                    flex: 0.4,
                    collapsed: false,
                    split: true,
                    subtitle: '系统右侧面板',
                    items: rightPanels
                }));
            }


            return Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'center',
                border: 0,
                items: items,
                listeners: {
                    activate: function (obj) {
                        FastExt.SystemLayout.clearAllMenuTheme();
                    }
                }
            });
        }


        /**
         * 获取系统版本信息的组件
         * @return Ext.grid.Panel
         */
        static getSystemVersionPanel(header?: boolean) {
            let data = [
                {
                    "name": "项目名称",
                    "value": FastExt.System.ConfigHandler.getSystemTitle()
                },
                {
                    "name": "项目版本",
                    "value": FastExt.System.ConfigHandler.getSystemVersion()
                },
                {
                    "name": "项目位置",
                    "value": FastExt.System.ConfigHandler.getSystemRoot()
                },
                // {
                //     "name": "操作文档",
                //     "value": "<a href='" + FastExt.System.ConfigHandler.getDocsUrl() + "' target='_blank' >" + FastExt.System.ConfigHandler.getDocsTitle() + "</a>"
                // },
                {
                    "name": "本机IP地址",
                    "value": FastExt.System.ConfigHandler.getLocalhostIP()
                },
                {
                    "name": "系统环境",
                    "value": FastExt.System.ConfigHandler.getSystemOS()
                },
                {
                    "name": "系统启动时间",
                    "value": FastExt.System.ConfigHandler.getSystemStartTime()
                },
                {
                    "name": "系统刷新时间",
                    "value": Ext.Date.format(new Date(), "Y-m-d H:i:s")
                },
                {
                    "name": "数据库",
                    "value": FastExt.System.ConfigHandler.getSystemDB()
                },
                {
                    "name": "数据库连接池",
                    "value": FastExt.System.ConfigHandler.getSystemDBPool()
                },
                {
                    "name": "项目运行容器",
                    "value": FastExt.System.ConfigHandler.getSystemServer()
                },
                {
                    "name": "运行容器位置",
                    "value": FastExt.System.ConfigHandler.getSystemCatalina()
                },
                {
                    "name": "项目框架",
                    "value": "<a href='http://www.fastchar.com' target='_blank' >" + FastExt.System.ConfigHandler.getFastCharVersion() + "</a>"
                },
                {
                    "name": "开发语言",
                    "value": FastExt.System.ConfigHandler.getJavaVersion() + " + ExtJs" + Ext.getVersion().version + " + HTML5 + CSS3",
                },
                {
                    "name": "开发服务商",
                    "value": "<a href='" + FastExt.System.ConfigHandler.getDeveloperUrl() + "' target='_blank'>" + FastExt.System.ConfigHandler.getDeveloperTitle() + "</a>"
                },
                {
                    "name": "版权归属",
                    "value": "<a href='" + FastExt.System.ConfigHandler.getSystemCopyrightUrl() + "' target='_blank'>" + FastExt.System.ConfigHandler.getSystemCopyright() + "</a>"
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
        static getSystemConfigPanel(header?: boolean) {

            let setPanel = Ext.create('Ext.form.FormPanel', {
                url: FastExt.Server.saveSystemConfigUrl(),
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
                                name: 'theme_color',
                                xtype: 'colorfield',
                                fieldLabel: '系统主题颜色',
                                columnWidth: 1,
                                bind: '{theme_color}'
                            },
                            {
                                name: 'front_color',
                                xtype: 'colorfield',
                                fieldLabel: '系统前景颜色',
                                columnWidth: 1,
                                bind: '{front_color}'
                            },
                            {
                                name: 'system_layout',
                                fieldLabel: '系统布局方式',
                                columnWidth: 1,
                                xtype: 'combo',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                readOnly: true,
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
                                bind: '{theme}',
                                store: FastExt.Store.getThemeDataStore()
                            },
                            {
                                name: 'window_anim',
                                fieldLabel: '系统窗体动画',
                                columnWidth: 1,
                                xtype: 'combo',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                bind: '{window_anim}',
                                store: FastExt.Store.getYesOrNoDataStore2()
                            },
                            // {
                            //     name: 'tab-record',
                            //     fieldLabel: '标签记忆',
                            //     columnWidth: 1,
                            //     xtype: 'combo',
                            //     displayField: 'text',
                            //     valueField: 'id',
                            //     editable: false,
                            //     value: 1,
                            //     bind: '{tab_record}',
                            //     store: FastExt.Store.getYesOrNoDataStore()
                            // },
                            // {
                            //     name: 'desktop_menu_record',
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
                            // {
                            //     name: 'tab_theme',
                            //     fieldLabel: '菜单主题应用',
                            //     columnWidth: 1,
                            //     xtype: 'combo',
                            //     displayField: 'text',
                            //     valueField: 'id',
                            //     editable: false,
                            //     value: 1,
                            //     bind: '{tab_theme}',
                            //     store: FastExt.Store.getYesOrNoDataStore()
                            // },
                            // {
                            //     name: 'font-size',
                            //     fieldLabel: '系统字体大小',
                            //     columnWidth: 1,
                            //     xtype: 'combo',
                            //     displayField: 'text',
                            //     valueField: 'id',
                            //     editable: false,
                            //     bind: '{font_size}',
                            //     store: FastExt.Store.getFontSizeDataStore()
                            // },
                            // {
                            //     name: 'front_radius',
                            //     fieldLabel: '系统圆润大小',
                            //     columnWidth: 1,
                            //     xtype: 'combo',
                            //     displayField: 'text',
                            //     valueField: 'id',
                            //     editable: false,
                            //     bind: '{front_radius}',
                            //     store: FastExt.Store.getFrontRadiusDataStore()
                            // },
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
                                            FastExt.System.InitHandler.startSilenceSaveConfig();
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
                                    $.post(FastExt.Server.downSystemConfigUrl(), function (result) {
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
                                    FastExt.IndexLayout.uploadSystemConfigData(this);
                                }
                            },
                            {
                                xtype: 'button',
                                text: '更新系统数据权限',
                                columnWidth: 1,
                                hidden: !FastExt.System.ConfigHandler.isEnableLayer(),
                                iconCls: 'extIcon extPower whiteColor',
                                handler: function () {
                                    Ext.Msg.confirm("系统提醒", "确定更新系统所有表格的数据权限值吗？如果数据库数据量达到千万级别时，更新时间会较长，请谨慎操作！", function (button, text) {
                                        if (button == "yes") {
                                            FastExt.LoginLayout.validOperate("更新所有表格的数据权限层级值", function () {
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
                                hidden: !FastExt.System.ConfigHandler.isEnableSame(),
                                iconCls: 'extIcon extCopy2 whiteColor',
                                handler: function () {
                                    Ext.Msg.confirm("系统提醒", "确定更新系统所有表格之间有关联的相同字段值吗？", function (button, text) {
                                        if (button == "yes") {
                                            FastExt.LoginLayout.validOperate("更新系统表格相同字段", function () {
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
            FastExt.Server.showSystemConfig(function (success: boolean, data: any) {
                if (success) {
                    data = Ext.Object.merge(data, FastExt.System.ConfigHandler.getSystemConfig());
                    //绑定不能使用中划线
                    setPanel.getViewModel().setData(data);
                }
            });
            return setPanel;
        }

        /**
         * 获取系统监控信息的组件
         * @return Ext.panel.Panel
         */
        static getSystemMonitorPanel(header?: boolean) {
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
                    FastExt.IndexLayout._monitor = result;
                    let desc = FastExt.IndexLayout._monitor.desc;
                    let data = FastExt.IndexLayout._monitor.data;
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
                                    FastExt.IndexLayout.showMonitorChart(title, this.monitorIndex);
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
            if (this._monitor && this._monitor.data
                && this._monitor.data.length > index) {
                return this._monitor.data[index];
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
                        let monitorData = FastExt.IndexLayout.getMonitorData(this.monitorIndex);
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
                            FastExt.IndexLayout._monitor = result;
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
         * 获取系统操作日志组件
         * @return Ext.grid.Panel
         */
        static getSystemOperatePanel(header?: boolean): any {
            let dataStoreTSystemOperatesModel = Ext.create('Ext.data.Store', {
                autoLoad: false,
                fields: [],
                id: 'SystemLogStore',
                idProperty: 'operateId',
                pageSize: 50,
                proxy: {
                    type: 'ajax',
                    url: FastExt.Server.entityListUrl(),
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
                        renderer: function (val: string) {
                            return FastExt.Renders.toClickText("查看详情", "FastExt.IndexLayout.showSystemLogDetails(" + val + ")");
                        }
                    }, {xtype: 'rowplaceholder', minWidth: 30}],
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
                    dataGridTSystemOperatesModel.add(FastExt.IndexLayout.showSearchSysOperate(dataGridTSystemOperatesModel, this));
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
        static showSystemLogDetails(id: string) {
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
                width: 168,
                flex: 0,
            }, {
                align: 'left',
                renderer: function (val, m, record) {
                    m.style = 'overflow:auto;text-overflow: ellipsis;white-space:normal !important;word-break:break-word; ';
                    let attr = record.get("key");
                    if (attr === "systemLogIp") {
                        return "<a href='https://www.ipuu.net/query/ip?search=" + val + "' target='_blank'>" + val + "</a>";
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

    }


    /**
     * 进度条布局
     */
    export class ProgressBaseLineLayout {
        private static _progressLine: any;

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
                if (!this._progressLine) {
                    this._progressLine = new ProgressBar.Line('#progress', {
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
                return this._progressLine;
            } catch (e) {}
            return {
                set: function () {

                },
                animate: function () {

                },
            }
        }

    }

}
