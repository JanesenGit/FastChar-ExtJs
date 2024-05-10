namespace FastExt {

    /**
     * 验证码相关操作
     */
    export class Captcha {


        /**
         * 获取登录界面的验证码组件
         */
        static getLoginCaptchaCmp() {
            let loginType = FastExt.System.ConfigHandler.getLoginType();
            if (loginType === "normal") {//无需验证码登录
                return {
                    xtype: "label",
                    hidden: true,
                };
            }

            if (window["showValidCaptcha"] && Ext.isFunction(window["showValidCaptcha"])) {
                return this.getClickCaptchaCmp();
            }
            return this.getClickVerifyCmp();
        }


        /**
         * 获取验证码的组件
         */
        static getNormalCaptchaCmp() {
            let labelWidth = FastExt.System.ConfigHandler.getFontSizeNumber() * 2;
            return {
                xtype: 'fieldcontainer',
                labelWidth: 0,
                anchor: "100%",
                itemId: "captcha",
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                refreshCode: function () {
                    try {
                        let imgCmp = this.query("#imgCode")[0];
                        let inputCmp = this.query("#validateCode")[0];
                        if (inputCmp) {
                            inputCmp.setValue(null);

                            let request = new XMLHttpRequest();
                            request.responseType = 'blob';
                            request.open('get', FastExt.Server.showCaptchaUrl(), true);
                            let sessionId = FastExt.Server.getSessionId();
                            if (!Ext.isEmpty(sessionId)) {
                                request.setRequestHeader('SessionId', sessionId);
                            }
                            request.onreadystatechange = e => {
                                if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
                                    imgCmp.setSrc(URL.createObjectURL(request.response));
                                }
                            };
                            request.send(null);
                            // imgCmp.setSrc(FastExt.Server.showCaptchaUrl());
                        }
                    } catch (e) {
                        console.error(e);
                    }
                },
                items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: '<svg class="svgIcon" aria-hidden="true"><use xlink:href="#extLoginCode"></use></svg>',
                        labelAlign: "right",
                        labelWidth: labelWidth,
                        labelSeparator: '',
                        labelStyle: "font-size: 22px !important;color: #666666;",
                        margin: '10 10 0 0',
                        allowBlank: false,
                        flex: 1,
                        name: 'validateCode',
                        itemId: "validateCode",
                        letterKeyboard: true,
                        emptyText: '请输入验证码',
                        blankText: '请输入验证码'
                    }, {
                        xtype: 'image',
                        margin: '10 10 0 0',
                        width: 74,
                        cls: 'fast-system-valid-code-img',
                        itemId: 'imgCode',
                        height: 34,
                        listeners: {
                            click: {
                                element: 'el',
                                fn: function () {
                                    this.component.up("#captcha").refreshCode();
                                }
                            }
                        },
                    }],
            };
        }


        /**
         * 获取看图点击验证码
         */
        static getClickCaptchaCmp() {
            let labelWidth = FastExt.System.ConfigHandler.getFontSizeNumber() * 2;
            let captchaKey = FastExt.Base.buildOnlyCode("CK");
            return {
                xtype: 'fieldcontainer',
                labelWidth: 0,
                anchor: "100%",
                itemId: "captcha",
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                refreshCode: function () {
                    let validateCodeTip = this.down("#validateCodeTip");
                    if (validateCodeTip) {
                        validateCodeTip.setValue(null);
                        validateCodeTip.removeCls("validSuccess");
                        validateCodeTip.setFieldLabel('<svg class="svgIcon" aria-hidden="true"><use xlink:href="#extPower"></use></svg>');
                    }
                },
                showValid: function () {
                    let me = this;
                    window["showValidCaptcha"](me, function (result) {
                        let validateCodeTip = me.down("#validateCodeTip");
                        if (result.success) {
                            validateCodeTip.setValue("安全验证通过！");
                            validateCodeTip.setFieldLabel('<svg class="svgIcon extRole" aria-hidden="true"><use xlink:href="#extLoginCode"></use></svg>');
                            validateCodeTip.addCls("validSuccess");
                            validateCodeTip.clearInvalid();
                        } else {
                            me.refreshCode();
                        }
                    }, captchaKey);
                },
                items: [
                    {
                        xtype: "hiddenfield",
                        name: "captchaKey",
                        value: captchaKey,
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: '<svg class="svgIcon" aria-hidden="true"><use xlink:href="#extPower"></use></svg>',
                        labelAlign: "right",
                        labelWidth: labelWidth,
                        labelSeparator: '',
                        labelStyle: "font-size: 22px !important;color: #666666;",
                        margin: '10 10 0 0',
                        allowBlank: false,
                        flex: 1,
                        name: '@',
                        itemId: "validateCodeTip",
                        letterKeyboard: true,
                        emptyText: '请您完成安全验证',
                        blankText: '请您先完成安全验证',
                        triggers: {
                            openValide: {
                                cls: 'extIcon extMouseClick',
                                hideOnReadOnly: false,
                                handler: function () {
                                    if (Ext.isEmpty(this.getValue())) {
                                        this.up("#captcha").showValid();
                                    } else {
                                        FastExt.Dialog.toast("您已通过安全验证，无需再次验证！");
                                    }
                                }
                            }
                        },
                        listeners: {
                            render: function () {
                                if (Ext.isFunction(this.setReadOnlyAttr)) {
                                    this.setReadOnlyAttr(true);
                                }
                            },
                        },
                    }],
            };
        }

        /**
         * 获取点击完成验证
         */
        static getClickVerifyCmp() {
            let labelWidth = FastExt.System.ConfigHandler.getFontSizeNumber() * 2;
            let captchaKey = FastExt.Base.buildOnlyCode("CK");
            return {
                xtype: 'fieldcontainer',
                labelWidth: 0,
                anchor: "100%",
                itemId: "captcha",
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                refreshCode: function () {
                    if (this.verifSuccess) {
                        //已验证通过，无效再次验证！
                        return;
                    }
                    let validateCodeTip = this.down("#validateCodeTip");
                    if (validateCodeTip) {
                        validateCodeTip.setValue(null);
                        validateCodeTip.removeCls("fast-valid-success");
                        validateCodeTip.setFieldLabel('<svg class="svgIcon" aria-hidden="true"><use xlink:href="#extPower"></use></svg>');
                    }
                },
                showValid: function () {
                    let loginName = Ext.getCmp("loginName");
                    let value = loginName.getValue();
                    if (Ext.isEmpty(value)) {
                        FastExt.Dialog.toast("请您先输入登录名！");
                        loginName.validate();
                        FastExt.Component.shakeComment(loginName);
                        return ;
                    }

                    let me = this;
                    if (me.verifing) {
                        return;
                    }
                    me.verifing = true;
                    me.verifSuccess = false;

                    let validateCodeTip = me.down("#validateCodeTip");
                    validateCodeTip.setEmptyText("正在验证中，请稍后…");
                    validateCodeTip.verifing = true;
                    let mouseClickXY = FastExt.SystemLayout.getMouseClickXY();
                    FastExt.Server.clickVerify(value, mouseClickXY.x, mouseClickXY.y, captchaKey,function (success, message) {
                        validateCodeTip.setValue(null);
                        validateCodeTip.verifing = false;
                        me.verifing = false;
                        if (success) {
                            validateCodeTip.setValue("安全验证通过！");
                            validateCodeTip.setFieldLabel('<svg class="svgIcon extRole" aria-hidden="true"><use xlink:href="#extLoginCode"></use></svg>');
                            validateCodeTip.addCls("fast-valid-success");
                            validateCodeTip.clearInvalid();
                            me.verifSuccess = true;
                        }else{
                            FastExt.Dialog.toast(message);
                        }
                    });
                },
                items: [
                    {
                        xtype: "hiddenfield",
                        name: "captchaKey",
                        value: captchaKey,
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: '<svg class="svgIcon" aria-hidden="true"><use xlink:href="#extPower"></use></svg>',
                        labelAlign: "right",
                        labelWidth: labelWidth,
                        labelSeparator: '',
                        labelStyle: "font-size: 22px !important;color: #666666;",
                        margin: '10 10 0 0',
                        allowBlank: false,
                        flex: 1,
                        name: '@',
                        itemId: "validateCodeTip",
                        letterKeyboard: true,
                        emptyText: '请点击右侧按钮，完成安全验证',
                        blankText: '请您先完成安全验证！',
                        editable: false,
                        triggers: {
                            openVerify: {
                                cls: 'extIcon extMouseClick',
                                hideOnReadOnly: false,
                                handler: function () {
                                    if (!this.mouseovered) {
                                        FastExt.Dialog.toast("非人为操作！");
                                        return;
                                    }
                                    if (this.verifing) {
                                        return;
                                    }
                                    if (Ext.isEmpty(this.getValue())) {
                                        this.up("#captcha").showValid();
                                    } else {
                                        FastExt.Dialog.toast("您已通过安全验证，无需再次验证！");
                                    }
                                }
                            }
                        },
                        listeners: {
                            render: function () {
                                if (Ext.isFunction(this.setReadOnlyAttr)) {
                                    this.setReadOnlyAttr(true);
                                }
                            },
                            afterrender: function () {
                                this.getEl().on("mouseover", ()=>{
                                    this.mouseovered = true;
                                }, this);

                                this.getEl().on("touchstart", () => {
                                    this.mouseovered = true;
                                }, this);
                            }
                        },
                    }],
            };
        }




        /**
         * 弹出google验证
         */
        static showGoogleAuthentication(step: number, callBack: any) {
            let size = parseInt((document.body.clientHeight * 0.35).toFixed(0));
            let bindStep = {
                xtype: 'panel',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                border: 0,
                items: [
                    {
                        xtype: 'label',
                        height: 34,
                        html: "<div style='display: flex;" +
                            "align-items: center;" +
                            "justify-content: center;" +
                            "color: black;" +
                            "font-size: 18px;" +
                            "font-weight: bold;'>" +
                            "请使用谷歌验证器扫码绑定</div>"
                    },
                    {
                        xtype: "image",
                        width: size,
                        height: size,
                        src: FastExt.Server.getGoogleBindUrl(),
                    }
                ]
            };
            let confirmStep = {
                xtype: 'form',
                itemId: "validForm",
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                border: 0,
                items: [
                    {
                        xtype: 'lottie',
                        width: size,
                        height: size,
                        jsonPath: 'base/lottie/google.json',
                    },
                    {
                        xtype: 'textfield',
                        margin: '0',
                        name: "code",
                        itemId: "code",
                        allowBlank: false,
                        emptyText: '请输入谷歌验证器的验证码',
                    }
                ]
            };

            let downAppUrl = FastExt.System.ConfigHandler.getGoogleAuthenticationAppDownloadUrl();


            let steps = [];
            if (step >= 2) {
                steps.push(bindStep);
            }
            steps.push(confirmStep);

            Ext.create('Ext.window.Window', {
                title: "谷歌双向安全验证",
                iconCls: 'extIcon extLoginCode',
                itemId: "validWindow",
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                cacheUISize: false,
                resizable: false,
                maximizable: false,
                constrain: true,
                modal: true,
                padding: '10 10 10 10',
                items: [
                    {
                        xtype: "panel",
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        itemId: "stepContainer",
                        border: 0,
                        refreshButton: function () {
                            let panel = this.down("#containerPanel");
                            this.down("#btnPrev").setHidden(!panel.getLayout().getPrev());
                            this.down("#btnNext").setHidden(!panel.getLayout().getNext());
                            this.down("#btnConfirm").setHidden(panel.getLayout().getNext());
                        },
                        next() {
                            let panel = this.down("#containerPanel");
                            panel.getLayout().next();
                            this.refreshButton();
                        },
                        prev() {
                            let panel = this.down("#containerPanel");
                            panel.getLayout().prev();
                            this.refreshButton();
                        },
                        items: [
                            {
                                xtype: "panel",
                                layout: "card",
                                border: 0,
                                itemId: "containerPanel",
                                padding: '10 10 0 10',
                                style: {
                                    background: "#ffffff",
                                },
                                items: steps,
                            },
                            {
                                xtype: "panel",
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch',
                                    pack: 'center',
                                },
                                border: 0,
                                padding: '5 5 5 5',
                                items: [
                                    {
                                        xtype: 'button',
                                        flex: 1,
                                        text: "下一步",
                                        itemId: "btnNext",
                                        margin: '5 5 5 5',
                                        iconCls: "extIcon extArrowRight3",
                                        handler: function () {
                                            let stepContainer = this.up("#stepContainer");
                                            if (stepContainer) {
                                                stepContainer.next();
                                            }
                                        },
                                    },
                                    {
                                        xtype: 'button',
                                        flex: 1,
                                        text: "上一步",
                                        itemId: "btnPrev",
                                        margin: '5 5 5 5',
                                        iconCls: "extIcon extArrowLeft3",
                                        handler: function () {
                                            let stepContainer = this.up("#stepContainer");
                                            if (stepContainer) {
                                                stepContainer.prev();
                                            }
                                        }
                                    },
                                    {
                                        xtype: 'button',
                                        flex: 1,
                                        text: "立即验证",
                                        itemId: "btnConfirm",
                                        margin: '5 5 5 5',
                                        iconCls: "extIcon extManager",
                                        handler: function () {
                                            let validWindow = this.up("#validWindow");
                                            if (validWindow) {
                                                let validForm = validWindow.down("#validForm");
                                                if (validForm.isValid()) {
                                                    let code = validForm.getFieldValue("code");
                                                    validWindow.setLoading("正在验证中，请稍后……");
                                                    FastExt.Server.googleVerify(code, (success, message) => {
                                                        validWindow.setLoading(false);
                                                        if (success) {
                                                            if (Ext.isFunction(callBack)) {
                                                                callBack(true);
                                                            }
                                                            FastExt.Dialog.toast("谷歌身份验证器，验证成功！");
                                                            validWindow.close();
                                                        } else {
                                                            FastExt.Dialog.showAlert("系统提醒", message);
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    },
                                ]
                            },
                            {
                                xtype: "tipline",
                                height: 25,
                                margin: '10 10 10 10',
                                lineText: "友情支持",
                                hidden: Ext.isEmpty(downAppUrl),
                                lineTextColor: "#9d9d9d",
                                lineColor: "#cccccc"
                            },
                            {
                                xtype: 'button',
                                flex: 1,
                                text: "下载谷歌身份验证器APP",
                                itemId: "btnDownload",
                                margin: '10 10 10 10',
                                iconCls: "extIcon extDownload",
                                hidden: Ext.isEmpty(downAppUrl),
                                handler: function () {
                                    FastExt.Base.openUrl(downAppUrl, FastEnum.Target._blank);
                                },
                            }
                        ],
                    }
                ],
                listeners: {
                    show: function () {
                        let stepContainer = this.down("#stepContainer");
                        if (stepContainer) {
                            stepContainer.refreshButton();
                        }
                    }
                }
            }).show();
        }

    }

}