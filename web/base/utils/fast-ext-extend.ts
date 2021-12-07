namespace FastExtend {
    /**
     * 字符串类型的相关扩展
     * @define 使用String对象调用以下方法或属性
     * @example
     * 'user.js'.endWidth('.js');
     */
    export abstract class StringExtend {
        constructor() {
            // @ts-ignore
            String.prototype.endWith = function (suffix) {
                if (!suffix || suffix === "" || this.length === 0 || suffix.length > this.length) return false;
                return this.substring(this.length - suffix.length) === suffix;
            };


            // @ts-ignore
            String.prototype.startWith = function (prefix) {
                if (!prefix || prefix === "" || this.length === 0 || prefix.length > this.length) return false;
                return this.substr(0, prefix.length) === prefix;
            };


            // @ts-ignore
            String.prototype.firstUpperCase = function () {
                return this.replace(/^\S/,
                    function (s) {
                        return s.toUpperCase();
                    });
            };


            // @ts-ignore
            String.prototype.truthLength = function () {
                return this.replace(/[\u0391-\uFFE5]/g, "aa").length;
            };


            // @ts-ignore
            String.prototype.trimAllSymbol = function () {
                return this.replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?/\，/\。/\；/\：/\“/\”/\》/\《/\|/\{/\}/\、/\!/\~/\`]/g, "");
            };

            // @ts-ignore
            String.prototype.replaceAll = function (oldStr, newStr) {
                return this.replace(new RegExp(oldStr, 'g'), newStr);
            };
        }

        /**
         * 判断字符串是否以某个字符结尾
         * @param suffix 后缀
         * @returns {boolean}
         * @example
         * 'user.js'.endWidth('.js');
         */
        abstract endWith(suffix): boolean;


        /**
         * 判断字符串是否以某个字符开始
         * @param prefix 前缀
         * @returns {boolean}
         * @example
         * 'test.js'.startWith('test')
         */
        abstract startWith(prefix): boolean;

        /**
         * 字符串处理，首字母大写
         */
        abstract firstUpperCase(): string;

        /**
         * 获取字符串实际长度，包含汉字
         * @returns {number}
         */
        abstract truthLength(): number;

        /**
         * 去除字符串的所有标点符号
         */
        abstract trimAllSymbol(): string;


        /**
         * 替换字符
         * @param oldStr
         * @param newStr
         */
        abstract replaceAll(oldStr, newStr): string;

    }


    /**
     * 数组相关扩展
     * @define 使用Array对象调用以下方法或属性
     * @example
     * let userIds=[1,2,3,4];
     * userIds.exists(1);
     */
    export abstract class ArrayExtend {
        constructor() {

            // @ts-ignore
            Array.prototype.exists = function (val) {
                for (let i = 0; i < this.length; i++) {
                    if (this[i] === val) {
                        return true;
                    }
                }
                return false;
            };
        }

        /**
         * 判断是否存在于数组中
         * @param val
         * @returns {boolean}
         * @example
         * let userIds=[1,2,3,4];
         * userIds.exists(1);
         */
        abstract exists(val): boolean;

    }


    /**
     * Ext.Component扩展
     * @define 使用Ext.Component对象调用以下方法或属性
     * @example button.help
     */
    export abstract class ComponentExtend {
        protected constructor() {
        }

        /**
         * 标识是否为嵌入iframe标签的组件
         * <br/>
         * 如果配置属性值为true，则在拖拽或改变控件大小时会禁用本组件，避免鼠标事件丢失问题
         */
        iframePanel: boolean = false;

        /**
         * 组件功能的使用介绍，配置后，默认右键鼠标即可查看内容
         * {@link FastEnum.HelpEnumType}
         */
        help: string;

        /**
         * 组件功能提示操作类型，默认，右键鼠标
         * {@link FastEnum.HelpEnumType}
         */
        helpType: number;

        /**
         * 帮助提示语锚点位置，默认系统自动计算
         * {@link FastEnum.TooltipAnchorType}
         */
        helpAnchor: string;

        /**
         * 帮助提示语锚点位置偏移量，默认-1，系统自动计算
         */
        helpAnchorOffset: number = -1;


        /**
         * 是否禁用loadMask
         */
        disabledLoadMask: boolean;

        /**
         * 是否禁用一次loadMask ，当LoadMask 使用此属性一次 后将被设置为false
         */
        disabledLoadMaskOnce:boolean
    }

    /**
     * Ext.button.Button扩展
     * @define 使用Ext.button.Button对象调用以下方法或属性
     * @example button.contextMenu
     */
    export abstract class ButtonExtend {
        protected constructor() {
        }

        /**
         * 如果button按钮放置在grid中的toolbar中，此属性表示是否自动将按钮添加到grid的右键菜单中，默认为：true
         */
        contextMenu: boolean = true;

        /**
         * 当grid选中指定行数时按钮可用
         */
        checkSelect: number;

        /**
         * 当grid修改了数据时按钮可用
         */
        checkUpdate: number;

        /**
         * 是否弹出数据详情窗体时绑定此按钮，绑定的函数支持引用外部变量名有：grid : Ext.grid.Panel  me : FastExtEntity
         */
        bindDetail: boolean = false;
    }


    /**
     * gridpanel或treepanel相关扩展
     * @define 使用Ext.grid.Panel或Ext.tree.Panel对象调用以下所有方法或属性
     * @example grid.entityList
     */
    export abstract class GridExtend {

        protected constructor() {
        }

        /**
         * 标识是否为FastEntity列表
         * <br/>
         * 如果配置属性值为true，则grid会自动配置fastchar-extjs提供的其他功能或属性！
         */
        entityList: boolean;

        /**
         * 标识是否是标签页打开的数据列表，设置true时，保存Grid列信息时会携带EntityCode参数，否则不携带！
         */
        tabPanelList: boolean = false;

        /**
         * 是否以首次加载过数据
         */
        readonly firstLoadedData: boolean = false;

        /**
         * 是否启用Grid列的右键菜单，设置true或false或FastExt.GridColumnMenu对象
         * @see {@link FastExt.GridColumnMenu}
         */
        columnMenu: any;

        /**
         * 是否配置默认的toolbar按钮
         */
        defaultToolBar: boolean = true;

        /**
         * 当defaultToolBar为true时，是否配置默认的【相关查询】按钮
         */
        defaultToolBarLink: boolean = true;

        /**
         * 当defaultToolBar为true时，是否配置默认的【更多操作】按钮
         */
        defaultToolBarMore: boolean = true;
    }


    /**
     * Ext.form.Panel扩展
     * @define 使用Ext.form.FormPanel对象调用以下方法或属性
     * @example formPanel.setFieldValue('loginName','admin')
     */
    export abstract class FormPanelExtend {
        protected constructor() {
            Ext.form.FormPanel.prototype.setFieldValue = function (fieldName, value) {
                this.getForm().findField(fieldName).setValue(value);
            };

            Ext.form.FormPanel.prototype.getFieldValue = function (fieldName) {
                return this.getForm().findField(fieldName).getValue();
            };

            Ext.form.FormPanel.prototype.getField = function (fieldName) {
                return this.getForm().findField(fieldName);
            };

            Ext.form.FormPanel.prototype.submitForm = function (entity, extraParams, waitMsg,successAlert,failAlert) {
                let me = this;
                if (!extraParams) {
                    extraParams = {};
                }
                if (!waitMsg) {
                    waitMsg = "正在提交中……"
                }
                if (Ext.isEmpty(successAlert)) {
                    successAlert = true;
                }
                if (Ext.isEmpty(failAlert)) {
                    failAlert = true;
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
                            if (successAlert) {
                                Ext.Msg.alert('系统提醒', action.result.message, function (btn) {
                                    if (btn === "ok") {
                                        resolve(action.result);
                                    }
                                });
                            }else{
                                resolve(action.result);
                            }
                        },
                        failure: function (form, action) {
                            me.submiting = false;
                            if (failAlert) {
                                Ext.Msg.alert('系统提醒', action.result.message);
                            }
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
         * @see {@link FastExtend.FormPanel.constructor}
         */
        abstract setFieldValue(fieldName, value);

        /**
         * 获取字段值
         * @param fieldName 字段属性名
         * @see {@link FastExtend.FormPanel.constructor}
         */
        abstract getFieldValue(fieldName);

        /**
         * 获取field对象
         * @param fieldName
         * @see {@link FastExtend.FormPanel.constructor}
         */
        abstract getField(fieldName);

        /**
         * 快速提交表单
         * @param entity 实体的类对象
         * @param extraParams 扩展参数
         * @param waitMsg 提交时等待的消息
         * @param successAlert 弹出成功框 默认：true
         * @param failAlert 弹出失败消息 默认：true
         * @see {@link FastExtend.FormPanel.constructor}
         */
        abstract submitForm(entity, extraParams, waitMsg,successAlert,failAlert);

        /**
         * 暂存form表单的数据
         * @param key 暂存的key
         * @see {@link FastExtend.FormPanel.constructor}
         */
        abstract saveCache(key);

        /**
         * 还原form暂存的数据
         * @param key 暂存的key
         * @see {@link FastExtend.FormPanel.constructor}
         */
        abstract restoreCache(key);

        /**
         * 删除form暂存的数据
         * @param key
         * @see {@link FastExtend.FormPanel.constructor}
         */
        abstract deleteCache(key) ;

    }

    /**
     * Ext.form.field.File扩展
     * @define 使用Ext.form.field.File对象调用以下方法或属性
     * @example file.multiple
     */
    export abstract class FileFieldExtend {
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
    export abstract class FieldExtend {
        protected constructor() {
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
         * @see {@link FastExtend.FieldExtend.constructor}
         */
        abstract blur();

        /**
         * 是否来自Grid的头部列搜索
         */
        fromHeadSearch: boolean = false;
    }


    /**
     * Ext.form.field.Text扩展
     * @define 使用Ext.form.field.Text对象调用以下方法或属性
     * @example input.blur()
     */
    export abstract class TextFieldExtend {
        protected constructor() {
        }

        /**
         * 是否开启输入历史记录的功能，当调用validate方法是会触发记录，将数据保存到历史记录中
         */
        useHistory: boolean = false;

        /**
         * 显示输入框的历史记录菜单，当useHistory为true时有效
         */
        abstract showHistory();

        /**
         * 隐藏输入框的历史记录菜单，当useHistory为true时有效
         */
        abstract hideHistory();

        /**
         * 检测输入框是否有历史记录，当useHistory为true时有效
         */
        abstract checkHistory(): boolean;

        /**
         * 清空输入框的历史记录，当useHistory为true时有效
         */
        abstract clearHistory();
    }


    /**
     * Ext.form.field.ComboBox扩展
     * @define 使用Ext.form.field.ComboBox对象调用以下方法或属性
     * @example input.blur()
     */
    export abstract class ComboBoxFieldExtend {
        protected constructor() {
        }

        /**
         * 是否开启搜索下拉选项功能
         */
        searchable: boolean = false;
    }


    /**
     * Ext.grid.column.Column的扩展
     * @define 使用Ext.grid.column.Column对象调用以下方法或属性
     * @example column.toSearchKey()
     */
    export abstract class ColumnExtend {

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
         * 是否允许搜索，默认true
         */
        search: boolean = true;

        /**
         * 当前列弹出的搜索菜单
         */
        searchMenu: "Ext.menu.Menu";

        /**
         * 列配置的搜索链信息
         */
        searchLink: [];

        /**
         * 列数据是否是加密数据
         */
        encrypt: boolean;

        /**
         * 列是否是密码类型
         */
        password: boolean;

        /**
         * 组件的唯一标识
         */
        code: string;

        /**
         * 列的渲染函数名，当渲染函数需要参数的时候，建议使用字符串配置，便于系统记忆和恢复！
         */
        rendererFunction: string;


        /**
         * 当前列的排序类型 asc或desc
         */
        sortDirection: string;


        /**
         * 当前列弹出的编辑菜单
         */
        editMenu: "Ext.menu.Menu";

        /**
         * 当前列批量编辑的编辑组件
         */
        batchField: "Ext.Form.Field";


        /**
         * 获取搜索列数据的条件属性名
         * @see {@link FastExt.Grid.configColumnProperty}
         */
        abstract toSearchKey(): string;


        /**
         * 搜索指定值
         * @param value 匹配的值
         * @see {@link FastExt.Grid.configColumnProperty}
         */
        abstract searchValue(value): void;


        /**
         * 清空列的搜索
         * @see {@link FastExt.Grid.configColumnProperty}
         */
        abstract clearSearch() ;


        /**
         * 触发列的搜索
         * @param requestServer 是否提交到服务器请求
         * @see {@link FastExt.Grid.configColumnProperty}
         */
        abstract doSearch(requestServer);
    }


    /**
     * Ext.menu.Menu的扩展
     *
     */
    export abstract class MenuExtend {

        /**
         * 是否保持打开，设置true后，失去焦点后将无法自动关闭
         * @see {@link FastOverrider.MenuOverride.constructor}
         */
        holdShow: boolean = false;

        /**
         * 当手势滑动滚动条时，隐藏menu
         */
        scrollToHidden: boolean;
    }

    /**
     * FastChar-ExtJs的实体类（Entity）对象扩展属性
     */
    export abstract class EntityExtend {
        /**
         * 是否允许自动配置清空数据按钮，默认 true
         */
        actionDeleteAll: boolean = true;

        /**
         * 是否允许自动配置复制数据按钮，默认 true
         */
        actionCopy: boolean = true;

        /**
         * 是否允许自动配置定时刷新器按钮，默认 true
         */
        actionTimer: boolean = true;
    }


    for (let subClass in FastExtend) {
        FastExtend[subClass]();
    }
}


