namespace FastExt {

    /**
     * 验证码相关操作
     */
    export class Captcha {


        /**
         * 获取登录界面的验证码组件
         */
        static getLoginCaptchaCmp() {
            let loginNormal = FastExt.System.getExt("login-type").value === "normal";
            if (loginNormal) {
                return {
                    xtype: "label",
                    hidden: true,
                };
            }
            if (window["showValidCaptcha"] && Ext.isFunction(window["showValidCaptcha"])) {
                return this.getClickCaptchaCmp();
            }
            return this.getNormalCaptchaCmp();
        }


        /**
         * 获取验证码的组件
         */
        static getNormalCaptchaCmp() {
            let labelWidth = FastExt.Base.getNumberValue(FastExt.System.fontSize) * 2;
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
                            imgCmp.setSrc("showCaptcha?t=" + Math.random());
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
                        labelStyle: "font-size: 20px !important;color: #888888;",
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
                        cls: 'validCodeImg',
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
            let labelWidth = FastExt.Base.getNumberValue(FastExt.System.fontSize) * 2;
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
                        labelStyle: "font-size: 20px !important;color: #888888;",
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
                                    }else{
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

    }

}