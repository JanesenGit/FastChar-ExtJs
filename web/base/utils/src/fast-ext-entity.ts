namespace FastExt {

    /**
     * 实体类的相关方法
     */
    export class Entity {


        /**
         * 根据entityCode获取实体对象
         * @param entityCode
         */
        static getEntity(entityCode: string) {
            for (let i = 0; i < FastExt.System.entities.length; i++) {
                let entity = FastExt.System.entities[i];
                if (entity.entityCode === entityCode) {
                    return entity;
                }
            }
            return null;
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
            for (let config of (<any>sourceConfigs)) {
                configs.push(FastExt.Entity.wrapConfig(entity, config));
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
         */
        static getEditorField(entity: any, attrName: string): any {
            if (Ext.isEmpty(entity)) {
                return null;
            }
            if (Ext.isFunction(entity.getEditorField)) {
                return entity.getEditorField(attrName);
            }
            return null;
        }

        /**
         * 获取实体类对象属性的编辑器，将返回Ext.create创建的对象
         * @param entity 实体对象
         * @param attrName 属性名
         */
        static getEditorFieldObject(entity: any, attrName: string): any {
            let editorField = FastExt.Entity.getEditorField(entity, attrName);
            if (editorField) {
                return Ext.create(editorField);
            }
            return null;
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
                return entity.getColumnRender(attrName);
            }
            return null;
        }


        /**
         * 获取column或field实际存入数据库的属性名
         * @param target
         */
        static getRealAttr(target: any) {
            if (!target) {
                return null;
            }
            if (Ext.isObject(target.field) && target.field.hasOwnProperty("name")) {
                return target.field.name;
            }

            if (target.hasOwnProperty("columnName")) {
                return target.columnName;
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
            if (Ext.isFunction(entity.getEditorField)) {
                return entity.getEditorField(FastExt.Entity.getRealAttr(column));
            }
            return null;
        }


    }

}