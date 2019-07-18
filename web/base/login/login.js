Ext.onReady(function () {
    removeLoading();
    if (checkBrowserVersion()) {
        let container = getBodyContainer();
        container.removeAll();
        showLogin(container);
    }
});

function showLogin(container) {
    let loginTitle = $("title").text();
    let loginBgUrl = getExt("login-background").href;
    let systemBgColor = toColor(getExt("theme-color").value);
    let loginLogo =getExt("login-logo").value;
    let loginNormal = getExt("login-type").value == "normal";
    let copyright = getExt("copyright").value;
    let copyrightUrl = getExt("copyright").href;
    let indexUrl = getExt("indexUrl").value;
    

    let panel = Ext.create('Ext.panel.Panel', {
        layout: 'fit',
        border: 0,
        html: "<iframe name='loginFrame'  src='" + loginBgUrl + "?bg=" + systemBgColor + "' width='100%' height='100%' style='border: 0px; overflow-x: hidden;background-color: " + systemBgColor + "'/>",
    });


    let headHtml = "<div align='center' style='color:" + systemBgColor + ";'><img  width='50px' height='50px;' src='" + loginLogo + "' /><h2>" + loginTitle + "</h2></div>";

    if (loginLogo.length == 0 || loginLogo == null) {
        headHtml = "<div align='center' style='color:" + systemBgColor + ";'><h2>" + loginTitle + "</h2></div>";
    }

    let headPanel = Ext.create('Ext.panel.Panel', {
        region: 'north',
        layout: 'fit',
        width: '100%',
        bodyStyle: {},
        padding: '10 30 0 30',
        border: 0,
        height: 'auto',
        html: headHtml
    });


    let loginName = $.cookie("loginName");
    let loginPassword = $.cookie("loginPassword");
    let loginMember = $.cookie("loginMember");
    if (loginMember == null) {
        loginMember = 0;
    }

    let loginPanel = Ext.create('Ext.form.FormPanel', {
        url: 'manager/login',
        method: 'POST',
        fileUpload: true,
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
                        labelWidth: 50,
                        margin: '10 10 0 0',
                        name: 'loginName',
                        allowBlank: false,
                        blankText: '请输入登录名',
                        emptyText: '请输入登录名',
                        value:loginName,
                        anchor: "100%"
                    }, {
                        xtype: 'textfield',
                        fieldLabel: '密码',
                        labelAlign: 'right',
                        labelWidth: 50,
                        inputType: 'password',
                        margin: '10 10 0 0',
                        allowBlank: false,
                        blankText: '请输入登录密码',
                        emptyText: '请输入登录密码',
                        value: loginPassword,
                        submitValue:false,
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
                            labelWidth: 50,
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
                        name: 'loginMember',
                        fieldLabel: '记住',
                        xtype: 'combo',
                        labelAlign: 'right',
                        labelWidth: 50,
                        margin: '10 10 0 0',
                        displayField: 'text',
                        valueField: 'id',
                        editable: false,
                        anchor: "100%",
                        value: loginMember,
                        submitValue:false,
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
                new Ext.KeyMap(text.getEl(), [{
                    key: 13,
                    fn: doLogin,
                    scope: Ext.getBody()
                }]);
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
            let loginPassword = loginPanel.form.findField("loginPassword").getValue();
            let loginName = loginPanel.form.findField("loginName").getValue();
            let loginMember = loginPanel.form.findField("loginMember").getValue();

            $.cookie("loginName", loginName);
            $.cookie("loginMember", loginMember);
            if (parseInt(loginMember) == 1) {
                $.cookie("loginPassword", loginPassword);
            }else{
                $.removeCookie("loginPassword");
            }
            form.submit({
                params: {
                    loginPassword: $.md5(loginPassword)
                },
                waitMsg: '正在为您登录……',
                success: function (form, action) {
                    addScript({src: indexUrl + '?v=' + getExt("version").value});
                },
                failure: function (form, action) {
                    Ext.Msg.alert('登录失败', action.result.message);
                    refreshCode();
                    if (action.result.code == -2) {
                        loginPanel.form.findField("loginPassword").reset();
                    }
                }
            });
        }
    };

    let bottomPanel = Ext.create('Ext.panel.Panel', {
        region: 'south',
        layout: 'fit',
        width: '100%',
        height: 30,
        border: 0,
        html: "<div align='center'><a href='" + copyrightUrl + "' target='_blank' style='color:#aaa;text-decoration:none;'>" + copyright + "</a></div>"
    });


    let win = Ext.create('Ext.window.Window', {
        title: '管理员登录',
        iconCls: 'extIcon extLogin',
        width: 350,
        resizable: false,
        layout: 'vbox',
        closable: false,
        toFrontOnShow: true,
        constrain: true,
        shadow: 'frame',
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
        } catch (e) {}
    });
    panel.add(win);
    container.add(panel);
}