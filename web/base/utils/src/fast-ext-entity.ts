namespace FastExt {

    /**
     * 实体类的相关方法
     */
    export class Entity {

        /**
         * 初始化Entity对象默认配置
         * @param entity 实体对象
         * @param shortTitle 实体简要标题【用于部分弹窗标题的构建】例如：用户、部门、商品
         */
        static initEntity(entity: any, shortTitle: string) {
            if (!entity) {
                return;
            }
            entity.shortTitle = shortTitle;
            entity.showWinList= function (obj: any, title: string, where: any, modal: boolean, config: any){
                new FastExt.SimpleEntity(this).showWinList(obj, title, where, modal, config);
            };

            entity.showDetails = function(obj: any, where: any){
                new FastExt.SimpleEntity(this).showDetails(obj, where);
            };

            entity.showSelect = function (obj: any, title: string, where: any, multi: boolean, config: any, container: any){
                return new FastExt.SimpleEntity(this).showSelect(obj, title, where, multi, config, container);
            };
            entity.getRecords = function(where: any) {
                return new FastExt.SimpleEntity(this).getRecords(where);
            };
        }


        /**
         * 根据entityCode获取实体对象
         * @param entityCode
         */
        static getEntity(entityCode: string) {
            return FastExt.System.EntitiesHandler.getEntity(entityCode);
        }


        /**
         * 判断列是否开启了全文检索的功能
         * @param entityCode
         * @param columnName
         */
        static isFulltextColumn(entityCode: string, columnName: string): boolean {
            let entity = FastExt.Entity.getEntity(entityCode);
            if (entity) {
                let fulltextColumns = entity.fulltextColumns;
                if (fulltextColumns) {
                    for (const fulltextColumn of fulltextColumns) {
                        if (fulltextColumn.name === columnName) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }


        /**
         * 合并配置，可用于Grid的columns，FormPanel的items
         * @param entity 实体对象，将调用实体对象里的 getEditorField 和 getColumnRender 方法获取编辑组件或渲染函数
         * @param sourceConfigs 配置对象，可变参数
         */
        static wrapConfigs(entity: any, ...sourceConfigs): any {
            let configs = [];
            let pushConfig = (config: any) => {
                if (Ext.isArray(config)) {
                    eachConfig(config);
                    return;
                }
                if (config.items && Ext.isArray(config.items)) {
                    let newItems = [];
                    for (let subConfig of config.items) {
                        newItems = newItems.concat(FastExt.Entity.wrapConfigs(entity, subConfig));
                    }
                    config.items = newItems;
                    configs.push(config);
                    return;
                }
                configs.push(FastExt.Entity.wrapConfig(entity, config));
            };
            let eachConfig = (configArray: any) => {
                for (let config of configArray) {
                    pushConfig(config);
                }
            };

            for (let config of (<any>sourceConfigs)) {
                pushConfig(config);
            }
            return configs;
        }


        /**
         * 合并配置，可用于Grid的columns，FormPanel的items
         * @param entity 实体对象，将调用实体对象里的 getEditorField 和 getColumnRender 方法获取编辑组件或渲染函数
         * @param config 配置对象
         */
        static wrapConfig(entity: any, config): any {
            if (Ext.isEmpty(entity)) {
                return null;
            }
            if (Ext.isEmpty(config)) {
                return null;
            }
            if (!Ext.isObject(config)) {
                return config;
            }
            //优先处理表单，可能field中包含dataIndex属性
            if (config.hasOwnProperty("fieldLabel")) {
                let columnName = FastExt.Entity.getRealAttr(config);
                if (Ext.isEmpty(columnName)) {
                    return config;
                }
                //表单配置
                let field = FastExt.Entity.getEditorField(entity, columnName);
                if (!field) {
                    return config;
                }
                if (config.hasOwnProperty("xtype")) {
                    if (config.xtype !== field.xtype) {
                        console.warn("配置类型【" + config.xtype + "】与getEditorField方法返回的类型【" + config.xtype + "】配置不一致！已跳过！");
                        return config;
                    }
                }
                config = Ext.Object.merge(field, config);
            } else if (config.hasOwnProperty("dataIndex")) {
                let columnName = FastExt.Entity.getRealAttr(config);
                if (Ext.isEmpty(columnName)) {
                    return config;
                }
                //grid列配置
                let field = FastExt.Entity.getEditorField(entity, columnName);
                if (!field) {
                    return config;
                }
                field["name"] = columnName;

                if (Ext.isEmpty(config.field)) {
                    config.field = {};
                }
                if (Ext.isString(config.field)) {
                    config.field = {
                        xtype: config.field
                    }
                }
                let needMerge = true;
                if (config.field.hasOwnProperty("xtype")) {
                    if (config.field.xtype !== field.xtype) {
                        needMerge = false;
                    }
                }

                if (Ext.isObject(config.field) && needMerge) {
                    config.field = Ext.Object.merge(field, config.field);
                }
                if (Ext.isEmpty(config.renderer)) {
                    config.renderer = FastExt.Entity.getColumnRender(entity, columnName);
                }
                config.configField = config.field;
            }
            return config;
        };


        /**
         * 获取实体类对象属性的编辑器
         * @param entity 实体对象
         * @param attrName 属性名
         * @param column 列对象，兼容老版本
         */
        static getEditorField(entity: any, attrName: string, column?: any): any {
            if (Ext.isEmpty(entity)) {
                return null;
            }
            if (Ext.isFunction(entity.getEditorField)) {
                let onEntityGetEditorField = FastExt.Listeners.getFire().onEntityGetEditorField(entity, attrName);
                if (onEntityGetEditorField) {
                    return onEntityGetEditorField;
                }
                return entity.getEditorField(attrName);
            }

            //兼容老版本
            if (column) {
                if (Ext.isObject(column.field)) {
                    return column.field;
                }
                if (Ext.isString(column.field)) {
                    return {
                        xtype: column.field,
                    };
                }
            }
            return {
                xtype: "textfield",
                multiSplit: null,
            };
        }

        /**
         * 获取实体类对象属性的编辑器，将返回Ext.create创建的对象
         * @param entity 实体对象
         * @param attrName 属性名
         * @param column Grid里的列对象
         */
        static getEditorFieldObject(entity: any, attrName: string, column?: any): any {
            let editorField = FastExt.Entity.getEditorField(entity, attrName, column);
            if (editorField) {
                return Ext.create(editorField);
            }
            return Ext.create({
                xtype: "textfield",
                multiSplit: null,
            });
        }


        /**
         * 获取实体类对象属性的渲染器
         * @param entity 实体对象
         * @param attrName 属性名
         */
        static getColumnRender(entity: any, attrName: string): any {
            if (Ext.isEmpty(entity)) {
                return null;
            }
            if (Ext.isFunction(entity.getColumnRender)) {
                let onEntityGetColumnRender = FastExt.Listeners.getFire().onEntityGetColumnRender(entity, attrName);
                if (onEntityGetColumnRender) {
                    return onEntityGetColumnRender;
                }
                return entity.getColumnRender(attrName);
            }
            //兼容老版本
            return FastExt.Renders.normal();
        }


        /**
         * 获取column或field实际存入数据库的属性名
         * @param target
         */
        static getRealAttr(target: any) {
            if (!target) {
                return null;
            }
            if (target.hasOwnProperty("columnName")) {
                return target.columnName;
            }
            if (Ext.isObject(target.field) && target.field.hasOwnProperty("name")) {
                return target.field.name;
            }
            if (target.hasOwnProperty("dataIndex")) {
                return target.dataIndex;
            }
            return FastExt.Base.toString(target.name, "").replace("data.", "");
        }


        /**
         * 获取实体类Grid列的的编辑器
         * @param entity 实体对象
         * @param column grid列
         */
        static getEditorFieldByColumn(entity: any, column: any): any {
            if (Ext.isEmpty(entity)) {
                if (Ext.isObject(column.field)) {
                    return column.field;
                }
                return {xtype: column.field};
            }
            return FastExt.Entity.getEditorField(entity, FastExt.Entity.getRealAttr(column), column);
        }

        /**
         * 获取实体类Grid列的的编辑器,将返回Ext.create创建的对象
         * @param entity 实体对象
         * @param column grid列
         */
        static getEditorFieldObjectByColumn(entity: any, column: any): any {
            if (Ext.isEmpty(entity)) {
                if (Ext.isObject(column.field)) {
                    return column.field;
                }
                return {xtype: column.field};
            }
            return FastExt.Entity.getEditorFieldObject(entity, FastExt.Entity.getRealAttr(column), column);
        }


    }


    /**
     * 默认常规Entity实体辅助类
     */
    export class SimpleEntity {

        private readonly _entity: any;
        private readonly _shortTitle: string;

        /**
         * 默认常规Entity实体辅助类
         * @param entity 实体对象
         */
        constructor(entity: any) {
            this._entity = entity;
            if (entity) {
                this._shortTitle = FastExt.Base.toString(entity.shortTitle, "数据");
            }else{
                this._shortTitle = "数据";
            }
        }


        /**
         * 获取Entity显示列表的Grid常规默认配置信息
         * @param dataStore 数据源
         * @param gridColumns 列数组
         * @param gridButtons 按钮数组
         * @param config  getList方法中的config参数
         * @return grid配置对象信息
         */
        public getGridConfig(dataStore: any, gridColumns: [], gridButtons: [], config?: any): any {
            return {
                entityList: true,
                tabPanelList: false,
                mainEntityList: true,
                selModel: FastExt.Base.toBool(config['multi'], true) ? FastExt.Grid.getGridSelModel() : null,
                region: 'center',
                multiColumnSort: true,
                border: 0,
                columnLines: true,
                contextMenu: true,
                power: FastExt.Base.toBool(config['power'], true),
                columnContextMenu: true,
                defaultToolBar: FastExt.Base.toBool(config['defaultToolBar'], true),
                columnSearch: true,
                store: dataStore,
                enableLocking: true,
                reserveScrollbar: true,
                operate: new FastExt.GridOperate(<any>{
                    alertDelete: true,
                    alertUpdate: true,
                    autoUpdate: false,
                    autoDetails: false,
                    hoverTip: false,
                    excelOut: true,
                    excelIn: true,
                    showDetailsButton: true,
                    showUpdateButton: true,
                }),
                filter: new FastExt.ExtCreateFilter({
                    enable: true,
                    key: this._entity.entityCode,
                    method: "getList"
                }),
                //请求后台list接口where前缀的参数
                where: {},
                //请求后台list接口的参数
                listParams: {},
                columns: FastExt.Entity.wrapConfigs(this._entity, gridColumns),
                tbar: FastExt.Base.toBool(config['toolbar'], true) ? {
                    xtype: 'toolbar',
                    overflowHandler: 'menu',
                    items: gridButtons
                } : null,
                onBeforeLoad: function (obj, store, params) {
                    //此处可追加额外参数
                    return true;
                },
                bbar: FastExt.Grid.getPageToolBar(dataStore),
                plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2
                })],
                viewConfig: {
                    loadingText: '正在为您在加载数据…'
                }
            };
        }


        /**
         * 弹窗显示数据列表
         * @param obj 按钮对象
         * @param title 弹窗标题
         * @param where getList方法中的where配置
         * @param modal 是否模式窗口
         * @param config getList方法中的config参数
         */
        public showWinList(obj: any, title: string, where: any, modal: boolean, config?: any) {
            if (!this._entity) {
                return;
            }
            this._entity.menu = {
                id: $.md5(title),
                text: title
            };
            let gridList = this._entity.getList(where, config);
            let entityOwner = gridList.down("[entityList=true]");
            if (entityOwner) {
                entityOwner.code = $.md5(title);
                entityOwner.operate.autoDetails = false;
            }
            if (!modal) {
                modal = false;
            }
            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));

            let win = Ext.create('Ext.window.Window', {
                title: title,
                height: winHeight,
                width: winWidth,
                layout: 'border',
                resizable: true,
                constrain: true,
                maximizable: true,
                animateTarget: obj,
                modal: modal,
                listeners: {
                    show: function (obj) {
                        obj.focus();
                    }
                },
                items: [gridList]
            });
            if (obj != null) {
                win.setIcon(obj.icon);
                win.setIconCls(obj.iconCls);
            } else {
                win.setIconCls("extIcon extSee");
            }
            win.show();
        }


        /**
         * 弹窗选择数据
         * @param obj 按钮对象
         * @param title 弹窗标题
         * @param where getList方法中的where配置
         * @param multi 是否允许多选
         * @param config getList方法中的config参数
         * @param container 配置弹窗的父级容器
         */
        public showSelect(obj: any, title: string, where: any, multi: boolean, config?: any, container?: any) {
            if (!this._entity) {
                return;
            }
            let me = this;
            return new Ext.Promise(function (resolve, reject) {
                me._entity.menu = {
                    id: $.md5(title),
                    text: title
                };
                if (!Ext.isObject(config)) {
                    config = {};
                }
                config["multi"] = multi;

                let gridList = me._entity.getList(where, config);
                let entityOwner = gridList.down("[entityList=true]");
                if (entityOwner) {
                    entityOwner.code = $.md5(title);
                    entityOwner.operate.autoDetails = false;
                    entityOwner.entitySelect = true;
                }

                let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));

                let win = Ext.create('Ext.window.Window', {
                    title: title,
                    height: winHeight,
                    width: winWidth,
                    iconCls: 'extIcon extSelect',
                    layout: 'border',
                    resizable: true,
                    constrain: true,
                    maximizable: true,
                    animateTarget: obj,
                    items: [gridList],
                    modal: true,
                    listeners: {
                        close: function (winObj, eOpts) {
                            FastExt.Base.runCallBack(resolve);
                        },
                        show: function (obj) {
                            obj.focus();
                        }
                    },
                    buttons: [{
                        text: '取消',
                        iconCls: 'extIcon extClose',
                        handler: function () {
                            FastExt.Base.runCallBack(resolve);
                            win.close();
                        }
                    },
                        {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                FastExt.Base.runCallBack(resolve, entityOwner.getSelection());
                                win.close();
                            }
                        }]
                });
                if (container) {
                    container.add(win);
                }
                win.show();
            });
        }


        /**
         * 弹窗显示数据详情
         * @param obj 按钮对象
         * @param where getList方法中的where配置
         */
        public showDetails(obj: any, where: any) {
            if (!this._entity) {
                return;
            }
            let me = this;
            let dataStore = FastExt.Store.getEntityDataStore(this._entity, where);
            FastExt.Dialog.showWait("请稍后……");
            dataStore.load(function (records: any) {
                FastExt.Dialog.hideWait();
                if (records.length === 0) {
                    Ext.Msg.alert("系统提醒", "未获得到详情数据！");
                    return;
                }
                let record = records[0];
                //此处可以设置record的columnEntityCode属性值 区别查找同表格不同列的情况
                FastExt.Grid.showDetailsWindow(obj, me._shortTitle + "详情", me._entity, record);
            });
        }


        /**
         * 获取数据Record对象
         * @param where getList方法中的where配置
         */
        public getRecords(where: any) {
            let me = this;
            return new Ext.Promise(function (resolve, reject) {
                let dataStore = FastExt.Store.getEntityDataStore(me._entity, where);
                dataStore.load(function (records, operation, success) {
                    resolve(records);
                });
            });
        }


        /**
         * 弹出添加窗口
         * @param obj 按钮对象
         * @param addItems 添加的字段配置对象数组
         * @param overrideFormConfig 覆盖表单配置，使用Ext.override功能
         */
        public showAdd(obj: any, addItems: [],overrideFormConfig?:any): ExtPromise {
            let me = this;
            let guessLabelWidth = this.guessLabelWidth(addItems);
            if (Ext.isEmpty(overrideFormConfig)) {
                overrideFormConfig = {};
            }
            return new Ext.Promise(function (resolve: any, reject: any) {
                let formPanel = Ext.create('Ext.form.FormPanel', {
                    url: 'entity/save',
                    cacheKey: me._entity.entityCode,
                    bodyPadding: 5,
                    method: 'POST',
                    region: 'center',
                    fileUpload: true,
                    autoScroll: false,
                    border: 0,
                    defaults: {
                        labelWidth: guessLabelWidth,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        allowBlankTip: true,
                        emptyText: 'default'
                    },
                    filter: new FastExt.ExtCreateFilter({
                        enable: true,
                        key: me._entity.entityCode,
                        method: "showAdd"
                    }),
                    layout: "column",
                    listeners: {
                        render: function (obj, eOpts) {
                            new Ext.util.KeyMap({
                                target: obj.getEl(),
                                key: 13,
                                fn: function (keyCode, e) {
                                    formPanel.submitForm(me._entity).then(function (result) {
                                        if (result.success) {
                                            resolve(result);
                                            formPanel.deleteCache();
                                            addWin.close();
                                        }
                                    });
                                },
                                scope: this
                            });
                        }
                    },
                    //可自定义扩展参数
                    extraParams: {},
                    items: FastExt.Entity.wrapConfigs(me._entity, addItems)
                });

                Ext.override(formPanel, overrideFormConfig);

                let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                let maxHeight = parseInt((document.body.clientHeight * 0.8).toFixed(0));

                let addWin = Ext.create('Ext.window.Window', {
                    title: '添加' + me._shortTitle,
                    icon: obj.icon,
                    iconCls: obj.iconCls,
                    width: winWidth,
                    minWidth: 200,
                    maxHeight: maxHeight,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    autoScroll: true,
                    resizable: true,
                    maximizable: true,
                    constrain: true,
                    animateTarget: obj,
                    items: [formPanel],
                    modal: true,
                    unpin: true,
                    listeners: {
                        show: function (obj) {
                            formPanel.restoreCache();
                            obj.focus();
                        }
                    },
                    buttons: [{
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
                                formPanel.form.reset();
                                formPanel.deleteCache();
                            }
                        },
                        {
                            text: '添加',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                formPanel.submitForm(me._entity).then(function (result) {
                                    if (result.success) {
                                        formPanel.deleteCache();
                                        addWin.close();
                                        resolve(result);
                                    }
                                });
                            }
                        }]
                });
                addWin.show();
            });

        }


        private guessLabelWidth(addItems: any[]) {
            let maxWidth = 0;
            for (let addItem of addItems) {
                maxWidth = Math.max(FastExt.Base.guessTextWidth(addItem.fieldLabel), maxWidth);
            }
            return maxWidth;
        }

    }

}

