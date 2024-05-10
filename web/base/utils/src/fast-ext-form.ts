namespace FastExt {


    /**
     * 网页表单相关操作
     */
    export class Form {


        /**
         * 获取输入框最小的高度
         */
        static getFieldMinHeight(showHeight) {
            if (Ext.isEmpty(showHeight)) {
                showHeight = false;
            }
            if (showHeight) {
                return 32 + 2;//包含了边框
            }
            return 32;
        }

        /**
         * 异步提交表单
         * @param url
         * @param paramsJson
         */
        static asyncForm(url: string, paramsJson: any):ExtPromise {
            return new Ext.Promise((resolve) => {
                let buildForm = FastExt.Form.buildForm(url, paramsJson);
                buildForm.submit();
                $(buildForm).remove();
                resolve();
            });
        }

        /**
         * 动态构建表单form对象
         * @param url 提交的路径
         * @param paramsJson 提交的JSON参数
         * @param target 目标打开窗体 默认：_self
         * @return html中的form对象
         */
        static buildForm(url: string, paramsJson: object, target?: FastEnum.Target | undefined): any {
            if (Ext.isEmpty(target)) {
                target = FastEnum.Target._self;
            }
            let form = $('<form></form>');
            form.attr('action', url);
            form.attr('method', 'post');
            form.attr('target', target);

            for (let n in paramsJson) {
                let my_input = $("<input type='text' name='" + n + "' />");
                my_input.attr('value', paramsJson[n]);
                form.append(my_input);
            }
            $(document.body).append(form);
            return form;
        }


        /**
         * 是否是日期控件 datefield
         * @param field
         */
        static isDateField(field): boolean {
            if (!field) return false;
            return field === "datefield" || field.xtype === "datefield";
        }


        /**
         * 是否是数字控件 numberfield
         * @param field
         */
        static isNumberField(field): boolean {
            if (!field) return false;
            return field === "numberfield" || field.xtype === "numberfield";
        }


        /**
         * 是否是文本控件 textfield
         * @param field
         */
        static isTextField(field): boolean {
            if (!field) return false;
            return field === "textfield" || field.xtype === "textfield";
        }


        /**
         * 是否是下拉框控件 combobox combo
         * @param field
         */
        static isComboField(field): boolean {
            if (!field) return false;
            return field === "combobox" || field.xtype === "combo";
        }


        /**
         * 是否是文件控件 fastfile
         * @param field
         */
        static isFileField(field): boolean {
            if (!field) return false;
            return field === "fastfile" || field.xtype === "fastfile" || field === "fastfilefield" || field.xtype === "fastfilefield";
        }

        /**
         * 是否是多文件控件 fastfiles
         * @param field
         */
        static isFilesField(field): boolean {
            if (!field) return false;
            return field === "fastfiles" || field.xtype === "fastfiles" || field === "fastfilesfield" || field.xtype === "fastfilesfield";
        }


        /**
         * 是否是枚举控件 enumcombo
         * @param field
         */
        static isEnumField(field): boolean {
            if (!field) return false;
            return field === "enumcombo" || field === "enumcombobox" || field.xtype === "enumcombo" || field.xtype === "enumcombobox";
        }


        /**
         * 是否是大文本编辑器 contentfield
         * @param field
         */
        static isContentField(field): boolean {
            if (!field) return false;
            return field === "contentfield" || field === "content" || field.xtype === "contentfield" || field.xtype === "content";
        }


        /**
         * 是否是网页编辑器 htmlcontentfield
         * @param field
         */
        static isHtmlContentField(field): boolean {
            if (!field) return false;
            return field === "htmlcontentfield" || field === "htmlcontent" || field.xtype === "htmlcontentfield" || field.xtype === "htmlcontent";
        }

        /**
         * 是否是网页编辑器 htmlcontentfield
         * @param field
         */
        static isMonacoEditorField(field): boolean {
            if (!field) return false;
            return field === "fastmonacofield" || field === "fastmonaco" || field.xtype === "fastmonacofield" || field.xtype === "fastmonaco";
        }


        /**
         * 是否是关联字段 linkfield
         * @param field
         */
        static isLinkField(field): boolean {
            if (!field) return false;
            return field === "linkfield" || field === "link" || field.xtype === "linkfield" || field.xtype === "link";
        }


        /**
         * 是否关联目标字段 targetfield
         * @param field
         */
        static isTargetField(field): boolean {
            if (!field) return false;
            return field === "targetfield" || field === "target" || field.xtype === "targetfield" || field.xtype === "target";
        }


        /**
         * 是否是省份选择控件 pcafield
         * @param field
         */
        static isPCAField(field): boolean {
            if (!field) return false;
            return field === "pcafield" || field === "pca" || field.xtype === "pcafield" || field.xtype === "pca";
        }


        /**
         * 是否地图选择控件 mapfield
         * @param field
         */
        static isMapField(field): boolean {
            if (!field) return false;
            return field === "mapfield" || field === "map" || field.xtype === "mapfield" || field.xtype === "map";
        }


        /**
         * 获取字段输入框的错误消息
         * @param fieldObj
         * @return string[]
         */
        static getFieldError(fieldObj): string[] {
            let currError = fieldObj.getErrors();
            if (currError.length === 0) {
                currError = [fieldObj.invalidText];
            }
            if (Ext.isEmpty(currError[0])) {
                currError[0] = "数据错误！";
            }
            return currError;
        }


        /**
         * 将json对象渲染成表单可编辑对话框
         * @param obj
         * @param title
         * @param jsonFieldConfig
         * @param jsonFieldDefaultConfig
         * @param modal
         */
        static showJsonForm(obj, title, jsonFieldConfig, jsonFieldDefaultConfig, modal) {
            if (Ext.isEmpty(modal)) {
                modal = true;
            }
            if (Ext.isString(jsonFieldConfig)) {
                jsonFieldConfig = FastExt.Json.jsonToObject(jsonFieldConfig);
            }
            if (Ext.isEmpty(jsonFieldDefaultConfig)) {
                jsonFieldDefaultConfig = "[]";
            }
            if (Ext.isString(jsonFieldDefaultConfig)) {
                jsonFieldDefaultConfig = FastExt.Json.jsonToObject(jsonFieldDefaultConfig);
            }

            return new Ext.Promise(function (resolve, reject) {
                let formItems = [];
                for (let itemObj of jsonFieldConfig) {
                    let defaultConfig = {
                        xtype: "textfield",
                        columnWidth: 1,
                        allowBlank: false
                    };
                    for (let defaultJson of jsonFieldDefaultConfig) {
                        if (defaultJson["name"] === itemObj["name"]) {
                            itemObj = FastExt.Json.mergeJson(itemObj, defaultJson);
                        }
                    }
                    let fieldConfig = FastExt.Json.mergeJson(defaultConfig, itemObj);
                    fieldConfig["source"] = itemObj;
                    formItems.push(fieldConfig);
                }

                let formPanel = Ext.create('Ext.form.FormPanel', {
                    bodyPadding: 5,
                    cacheKey: $.md5(title),
                    region: 'center',
                    border: 0,
                    autoScroll: true,
                    defaults: {
                        labelWidth: 100,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        emptyText: '请填写',
                        flex: 1,
                    },
                    layout: {
                        type: 'vbox',
                        pack: 'start',
                        align: 'stretch'
                    },
                    doReturn: function () {
                        if (this.getForm().isValid()) {
                            let values = [];
                            this.getForm().getFields().each(function (field) {
                                let source = field.source;
                                source["value"] = field.getValue();
                                values.push(source);
                            });
                            resolve(values);
                            return true;
                        }
                        return false;
                    },
                    listeners: {
                        render: function (obj, eOpts) {
                            new Ext.util.KeyMap({
                                target: obj.getEl(),
                                key: 13,
                                fn: function (keyCode, e) {
                                    if (formPanel.doReturn()) {
                                        formPanel.deleteCache();
                                        formWin.close();
                                    }
                                },
                                scope: this
                            });
                        }
                    },
                    items: formItems,
                });

                let formWin = Ext.create('Ext.window.Window', {
                    title: title,
                    icon: obj.icon,
                    iconCls: obj.iconCls,
                    animateTarget: obj,
                    width: 550,
                    minWidth: 200,
                    autoScroll: true,
                    layout: {
                        type: 'vbox',
                        pack: 'start',
                        align: 'stretch'
                    },
                    resizable: true,
                    maximizable: true,
                    constrain: true,
                    items: [formPanel],
                    modal: modal,
                    listeners: {
                        show: function (obj) {
                            formPanel.restoreCache();
                            obj.focus();
                        }
                    },
                    buttons: [
                        {
                            text: '暂存',
                            iconCls: 'extIcon extSave whiteColor',
                            handler: function () {
                                formPanel.saveCache();
                            }
                        },
                        {
                            text: '重置',
                            iconCls: 'extIcon extReset',
                            handler: function () {
                                if (formPanel.form) {
                                    formPanel.form.reset();
                                }
                                formPanel.deleteCache();
                            }
                        },
                        {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                if (formPanel.doReturn()) {
                                    formPanel.deleteCache();
                                    formWin.close();
                                }
                            }
                        }]
                });
                formWin.show();
            });
        }
    }

}