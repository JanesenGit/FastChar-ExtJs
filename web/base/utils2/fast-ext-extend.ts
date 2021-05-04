/**
 * 扩展ExtJs常用组件中的属性或方法
 */
namespace FastExtend {


    /**
     * Ext.Component扩展
     * @define 使用Ext.Component对象调用以下方法或属性
     * @example button.help
     */
    export class Component {
        private constructor() {
        }

        /**
         * 标识是否为嵌入iframe标签的组件
         * <br/>
         * 如果配置属性值为true，则在拖拽或改变控件大小时会禁用本组件，避免鼠标事件丢失问题
         */
        iframePanel: boolean = false;
        help: string;
    }

    /**
     * gridpanel或treepanel相关扩展
     * @define 使用Ext.grid.Panel或Ext.tree.Panel对象调用以下所有方法或属性
     * @example grid.entityList
     */
    export class Grid {

        private constructor() {
        }

        /**
         * 标识是否为FastEntity列表
         * <br/>
         * 如果配置属性值为true，则grid会自动配置fastchar-extjs提供的其他功能或属性！
         */
        entityList: boolean;
    }


    /**
     * Ext.form.Panel扩展
     * @define 使用Ext.form.FormPanel对象调用以下方法或属性
     * @example formPanel.setFieldValue('loginName','admin')
     */
    export class FormPanel {

        private constructor() {
            Ext.form.FormPanel.prototype.setFieldValue = function (fieldName, value) {
                this.getForm().findField(fieldName).setValue(value);
            };

            Ext.form.FormPanel.prototype.getFieldValue = function (fieldName) {
                return this.getForm().findField(fieldName).getValue();
            };

            Ext.form.FormPanel.prototype.getField = function (fieldName) {
                return this.getForm().findField(fieldName);
            };

            Ext.form.FormPanel.prototype.submitForm = function (entity, extraParams, waitMsg) {
                let me = this;
                if (!extraParams) {
                    extraParams = {};
                }
                if (!waitMsg) {
                    waitMsg = "正在提交中……"
                }
                if (me.submiting) {
                    return new Ext.Promise(function (resolve, reject) {
                        reject({"success": false, "message": "数据正在提交中，不可重复提交！"});
                    });
                }
                return new Ext.Promise(function (resolve, reject) {
                    let submitConfig = {
                        submitEmptyText: false,
                        waitMsg: waitMsg,
                        params: extraParams,
                        success: function (form, action) {
                            me.submiting = false;
                            Ext.Msg.alert('系统提醒', action.result.message, function (btn) {
                                if (btn === "ok") {
                                    resolve(action.result);
                                }
                            });
                        },
                        failure: function (form, action) {
                            me.submiting = false;
                            Ext.Msg.alert('系统提醒', action.result.message);
                            reject(action.result);
                        }
                    };
                    if (entity) {
                        submitConfig.params["entityCode"] = entity.entityCode;
                        if (entity.menu) {
                            submitConfig.params["menu"] = FastExt.Store.getStoreMenuText({entity: entity});
                        }
                    }
                    let form = me.getForm();
                    if (form.isValid()) {
                        me.submiting = true;
                        form.submit(submitConfig);
                    } else {
                        me.submiting = false;
                        reject({"success": false, "message": "表单填写不完整！"});
                    }
                });
            };


            Ext.form.FormPanel.prototype.saveCache = function (key) {
                if (Ext.isEmpty(key)) {
                    key = this.cacheKey;
                }
                let data = {};
                this.getForm().getFields().each(function (field, index) {
                    if (Ext.isDate(field.getValue())) {
                        data[field.getName()] = Ext.Date.format(field.getValue(), field.format);
                    } else {
                        data[field.getName()] = field.getValue();
                    }
                });
                let params = {
                    "configKey": key,
                    "configType": "FormPanelCache",
                    "configValue": Ext.encode(data)
                };
                FastExt.Dialog.showWait("暂存数据中……");
                $.post("ext/config/saveExtConfig", params, function (result) {
                    FastExt.Dialog.hideWait();
                    if (result.success) {
                        FastExt.Dialog.toast("暂存成功！");
                    } else {
                        FastExt.Dialog.showAlert("系统提醒", result.message);
                    }
                });
            };


            Ext.form.FormPanel.prototype.restoreCache = function (key) {
                if (Ext.isEmpty(key)) {
                    key = this.cacheKey;
                }
                let me = this;
                let params = {
                    "configKey": key,
                    "configType": "FormPanelCache"
                };
                $.post("ext/config/showExtConfig", params, function (result) {
                    if (result.success) {
                        let data = Ext.decode(result.data.configValue);
                        me.getForm().getFields().each(function (field, index) {
                            if (data.hasOwnProperty(field.getName())) {
                                field.setValue(data[field.getName()]);
                            }
                        });
                    }
                });
            };


            Ext.form.FormPanel.prototype.deleteCache = function (key) {
                if (Ext.isEmpty(key)) {
                    key = this.cacheKey;
                }
                let params = {
                    "configKey": key,
                    "configType": "FormPanelCache"
                };
                $.post("ext/config/deleteExtConfig", params, function (result) {
                });
            };


        }

        /**
         * 设置字段值
         * @param fieldName 字段属性名
         * @param value 字段值
         */
        setFieldValue(fieldName, value) {

        }

        /**
         * 获取字段值
         * @param fieldName 字段属性名
         */
        getFieldValue(fieldName) {

        }

        /**
         * 获取field对象
         * @param fieldName
         */
        getField(fieldName) {

        }

        /**
         * 快速提交表单
         * @param entity 实体的类对象
         * @param extraParams 扩展参数
         * @param waitMsg 提交时等待的消息
         */
        submitForm(entity, extraParams, waitMsg) {

        }

        /**
         * 暂存form表单的数据
         * @param key 暂存的key
         */
        saveCache(key) {

        }

        /**
         * 还原form暂存的数据
         * @param key 暂存的key
         */
        restoreCache(key) {

        }

        /**
         * 删除form暂存的数据
         * @param key
         */
        deleteCache(key) {

        }

    }

    /**
     * Ext.form.field.File扩展
     * @define 使用Ext.form.field.File对象调用以下方法或属性
     * @example file.multiple
     */
    export class FileField {
        private constructor() {
        }

        /**
         * 标识是否允许上传多个文件
         */
        multiple: boolean = false;

    }


    /**
     * Ext.form.field.Base扩展
     * @define 使用Ext.form.field.Base对象调用以下方法或属性
     * @example input.blur()
     */
    export class Field {
        private constructor() {
            Ext.form.field.Base.prototype.blur = function () {
                try {
                    if (this.inputEl) {
                        this.inputEl.blur();
                    }
                } catch (e) {
                    console.error(e);
                }
            };
        }

        /**
         * 失去焦点
         * @example Ext.form.field对象，例如： textfield.blur()
         */
        blur() {
        }

    }


    /**
     * Ext.grid.column.Column的扩展
     * @define 使用Ext.grid.column.Column对象调用以下方法或属性
     * @example column.toSearchKey()
     */
    export class Column {

        private constructor() {

        }

        /**
         * 列首次配置的标题
         */
        configText: string;

        /**
         * 列绑定的搜索条件属性名和条件值
         */
        where: any;


        /**
         * 获取搜索列数据的条件属性名
         */
        toSearchKey(): string {
            return null;
        }

        /**
         * 搜索指定值
         * @param value 匹配的值
         */
        searchValue(value): void {

        }


        /**
         * 清空列的搜索
         */
        clearSearch() {

        }


        /**
         * 触发列的搜索
         * @param requestServer 是否提交到服务器请求
         */
        doSearch(requestServer) {

        }

    }

}