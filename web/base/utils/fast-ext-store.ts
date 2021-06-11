namespace FastExt {

    /**
     * Ext.data.Store数据源相关操作
     */
    export class Store {
        private constructor() {
        }

        /**
         * 获取store相关的功能菜单文字，包含了父类
         * @param store 数据源
         * @param menu 数据源的菜单对象
         * @param splitChar 菜单拼接的分隔符
         * @returns {string|null}
         */
        static getStoreMenuText(store, menu?,splitChar?:string): string {
            if (Ext.isEmpty(splitChar)) {
                splitChar = ">";
            }
            if (menu) {
                return FastExt.System.getPlainMenu(menu, splitChar);
            } else if (store && store.entity) {
                return FastExt.System.getPlainMenu(store.entity.menu, splitChar);
            }
            return null;
        }

        /**
         * 提交Store被修改过的数据
         * @param store
         * @return Ext.Promise
         */
        static commitStoreUpdate(store): any {
            return new Ext.Promise(function (resolve, reject) {
                if (!store) {
                    return;
                }
                if (!store.entity) {
                    return;
                }
                if (store.commiting) {
                    return;
                }
                let records = store.getUpdatedRecords();
                let phantoms = store.getNewRecords();
                records = records.concat(phantoms);
                if (records.length === 0) {
                    resolve(true);
                    return;
                }
                store.commiting = true;
                let params = {"entityCode": store.entity.entityCode};
                if (store.entity.menu) {
                    params["menu"] = FastExt.Store.getStoreMenuText(store);
                }
                for (let i = 0; i < records.length; i++) {
                    let record = records[i];
                    for (let j = 0; j < store.entity.idProperty.length; j++) {
                        let idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                    for (let key in record.modified) {
                        params["data[" + i + "]." + key] = record.get(key);
                    }
                }
                FastExt.Server.updateEntity(params, function (success, message) {
                    store.commiting = false;
                    resolve(success);
                    if (success) {
                        FastExt.Dialog.toast(message);
                        store.commitChanges();
                    } else {
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        }

        /**
         * 提交Store里被选中删除的数据
         * @param store
         * @param data
         * @return Ext.Promise
         */
        static commitStoreDelete(store, data) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store.entity) {
                    return;
                }
                let params = {"entityCode": store.entity.entityCode};
                if (store.entity.menu) {
                    params["menu"] = FastExt.Store.getStoreMenuText(store);
                }
                for (let i = 0; i < data.length; i++) {
                    let record = data[i];
                    for (let j = 0; j < store.entity.idProperty.length; j++) {
                        let idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                }
                FastExt.Server.deleteEntity(params, function (success, message) {
                    resolve(success);
                    if (success) {
                        FastExt.Dialog.toast(message);
                        let reloadPage = store.currentPage;
                        if (store.count() - data.length <= 0) {
                            reloadPage = reloadPage - 1;
                        }
                        store.loadPage(Math.max(reloadPage, 1));
                    } else {
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        }


        /**
         * 提交Store回收站里还原选中的数据
         * @param store
         * @param data
         * @return Ext.Promise
         */
        static commitStoreReback(store, data) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store.entity) {
                    return;
                }
                let params = {"entityCode": store.entity.entityCode};
                if (store.entity.menu) {
                    params["menu"] = FastExt.Store.getStoreMenuText(store);
                }
                for (let i = 0; i < data.length; i++) {
                    let record = data[i];
                    for (let j = 0; j < store.entity.idProperty.length; j++) {
                        let idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                }
                FastExt.Server.rebackEntity(params, function (success, message) {
                    resolve(success);
                    if (success) {
                        let reloadPage = store.currentPage;
                        if (store.count() - data.length <= 0) {
                            reloadPage = reloadPage - 1;
                        }
                        store.loadPage(Math.max(reloadPage, 1));
                    } else {
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        }


        /**
         * 提交复制entity store选择的数据
         * @param store
         * @param data
         * @return Ext.Promise
         */
        static commitStoreCopy(store, data) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store.entity) {
                    return;
                }
                let params = {"entityCode": store.entity.entityCode};
                if (store.entity.menu) {
                    params["menu"] = Store.getStoreMenuText(store);
                }
                for (let i = 0; i < data.length; i++) {
                    let record = data[i];
                    for (let j = 0; j < store.entity.idProperty.length; j++) {
                        let idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                }
                FastExt.Server.copyEntity(params, function (success, message) {
                    resolve(success);
                    if (success) {
                        FastExt.Dialog.toast(message);
                        let reloadPage = store.currentPage;
                        if (store.count() - data.length <= 0) {
                            reloadPage = reloadPage - 1;
                        }
                        store.loadPage(Math.max(reloadPage, 1));
                    } else {
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        }

        /**
         * 判断record是否被修改过
         * @param record [Ext.data.Model]
         */
        static isModified(record): boolean {
            for (let name in record.data) {
                try {
                    if (record.isModified(name)) {
                        return true;
                    }
                } catch (e) {
                }
            }
            return false;
        }

        /**
         * 获取用作FastEntity通用的数据源，接口：entity/list
         * @param entity 实体对象
         * @param where 请求实体数据列表的接口参数 json对象
         * @param tree 是否用作Ext.tree.Panel
         */
        static getEntityDataStore(entity, where?, tree?) {
            if (Ext.isEmpty(entity)) {
                FastExt.Dialog.showAlert("系统提醒", "参数entity不可为空！");
                return;
            }
            let config = {
                fields: [],
                pageSize: 20,
                where: where,
                entity: entity,
                remoteSort: FastExt.Base.toBool(entity.remoteSort, true),
                proxy: {
                    type: 'ajax',
                    url: 'entity/list',
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
                                    Ext.Msg.alert('数据获取失败', data.message);
                                }
                            } catch (e) {
                                Ext.Msg.alert('数据获取失败', request.responseText);
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
                        try {
                            if (!store.entity || !store.entity.entityCode) {
                                return false;
                            }
                            let params = store.proxy.extraParams;
                            let newParams = {
                                "entityCode": store.entity.entityCode,
                                "limit": store.pageSize
                            };
                            if (store.where) {
                                for (let w in store.where) {
                                    newParams["where['" + w + "']"] = store.where[w];
                                }
                            }
                            if (tree) {
                                if (Ext.isEmpty(tree.parentIdValue)) {
                                    tree.parentIdValue = -1;
                                }
                                newParams["page"] = -1;
                                newParams["fromTree"] = true;
                                newParams["treeParentIdName"] = tree.parentIdName;

                                let parentValue = options.node.data[tree.idName];
                                let isFirstInstance = FastExt.Base.toBool(options.node.isFirstInstance, false);

                                if (Ext.isEmpty(parentValue)) {
                                    parentValue = tree.parentIdValue;
                                }
                                newParams["where['^treeSearch']"] = false;

                                if (isFirstInstance && tree.parentIdValue !== -1) {
                                    newParams["where['" + tree.idName + "']"] = parentValue;
                                    newParams["where['" + tree.parentIdName + "']"] = null;
                                } else {
                                    newParams["where['" + tree.idName + "']"] = null;
                                    if (store.grid) {
                                        if (FastExt.Grid.hasSearchColumn(store.grid)) {
                                            newParams["where['" + tree.parentIdName + "']"] = null;
                                            newParams["where['^treeSearch']"] = true;
                                        } else {
                                            newParams["where['" + tree.parentIdName + "']"] = parentValue;
                                        }
                                    } else {
                                        newParams["where['" + tree.parentIdName + "']"] = parentValue;
                                    }
                                }

                            }

                            if (store.grid) {
                                newParams["power"] = FastExt.Base.toBool(store.grid.power, true);

                                if (store.grid.getSelection().length > 0) {
                                    store.grid.getSelectionModel().deselectAll();
                                } else {
                                    store.grid.fireEvent("selectionchange", store.grid);
                                }
                                if (store.grid.where) {
                                    for (let w in store.grid.where) {
                                        newParams["where['" + w + "']"] = store.grid.where[w];
                                    }
                                }

                                store.getSorters().each(function (item) {
                                    newParams["indexSort['" + item.getProperty() + "']"] = FastExt.Grid.getColumn(store.grid, item.getProperty()).getIndex();
                                });


                                FastExt.Grid.checkColumnSearch(store.grid);

                                if (Ext.isFunction(store.grid.onBeforeLoad)) {
                                    let result = store.grid.onBeforeLoad(store.grid, store, newParams);
                                    if (!FastExt.Base.toBool(result, true)) {
                                        return false;
                                    }
                                }
                            }
                            store.getProxy().setExtraParams(FastExt.Json.mergeJson(params, newParams));
                            return true;
                        } catch (e) {
                            FastExt.Dialog.showException(e, "store:beforeload");
                        }
                    }
                },
                autoLoad: false
            };
            config.autoLoad = false;
            let entityStore;
            if (tree) {
                if (!FastExt.System.silenceGlobalSave) {
                    config["root"] = {
                        expanded: true
                    };
                }
                entityStore = Ext.create('Ext.data.TreeStore', config);
            } else {
                entityStore = Ext.create('Ext.data.Store', config);
            }
            entityStore.on("load", function (store) {
                setTimeout(function () {
                    try {
                        if (store.grid) {
                            store.grid.syncRowHeights();
                        }
                    } catch (e) {
                    }
                }, 300);
            });

            return entityStore;
        }

        /**
         * 获取枚举数据源，接口showEnums?enumName=
         * @param enumName 枚举名称
         * @param firstData 插入头部的数据
         * @param lastData 插入尾部的数据
         * @param params 获取枚举接口的参数
         * @param useCache 使用本地浏览器缓存数据
         * @param reload 重新加载数据并更新缓存
         * @return Ext.data.Store
         */
        static getEnumDataStore(enumName, firstData?, lastData?, params?, useCache?, reload?) {
            if (!params) {
                params = {};
            }
            if (Ext.isEmpty(useCache)) {
                useCache = true;
            }
            if (Ext.isEmpty(reload)) {
                reload = false;
            }
            let cacheKey = $.md5(enumName + Ext.JSON.encode(params));
            if (!useCache || !FastExt.Cache.memory.hasOwnProperty(cacheKey) || reload) {
                Ext.Ajax.request({
                    url: 'showEnums?enumName=' + enumName,
                    async: false,
                    params: params,
                    success: function (response, opts) {
                        try {
                            let result = Ext.decode(response.responseText);
                            if (result.success) {
                                FastExt.Cache.memory[cacheKey] = result.data;
                            } else {
                                Ext.Msg.alert('枚举获取失败', result.message);
                            }
                        } catch (e) {
                            FastExt.Dialog.showException(e, "获取枚举数据源！[getEnumDataStore]");
                        }
                    }
                });
            }
            let dataArray = Ext.clone(FastExt.Cache.memory[cacheKey]);
            if (firstData) {
                dataArray = Ext.Array.insert(dataArray, 0, firstData);
            }
            if (lastData) {
                dataArray = Ext.Array.push(dataArray, lastData);
            }
            return Ext.create('Ext.data.Store', {
                autoLoad: false,
                enumName: enumName,
                data: dataArray
            });
        }


        /**
         * 从枚举Store中查找枚举对应的Record
         * @param enumName 枚举名称
         * @param id 枚举匹配的值
         * @param attr 查找的匹配的属性名
         */
        static getEnumRecord(enumName, id, attr?) {
            if (!attr) {
                attr = "id";
            }
            return FastExt.Store.getEnumDataStore(enumName).findRecord(attr, id, 0, false, false, true);
        }

        /**
         * 从枚举Store中查找枚举的文本
         * @param enumName
         * @param id
         */
        static getEnumText(enumName, id) {
            let findRecord = FastExt.Store.getEnumRecord(enumName, id);
            if (findRecord) {
                return findRecord.get("text");
            }
            return null;
        }

        /**
         * 获取页数的数据源Store
         * @param maxSize 最大页数 默认 100
         * @param iteration 每页迭代的增长因素 默认 10
         * @return Ext.data.Store
         */
        static getPageDataStore(maxSize?, iteration?) {
            if (!maxSize || maxSize.length === 0) maxSize = 100;
            if (!iteration || iteration.length === 0) iteration = 10;
            let dataArray = [];
            for (let i = 0; i < maxSize / 10; i++) {
                let text = ((i + 1) * iteration) + '条';
                let id = ((i + 1) * iteration);
                dataArray.push({
                    'text': text,
                    "id": id
                });
            }
            return Ext.create('Ext.data.Store', {
                id: 'pageSizeDataStore',
                fields: ["id", "text"],
                data: dataArray
            });
        }


        /**
         * 获取比较符数据源
         * @return Ext.data.Store
         */
        static getCompareDataStore(): any {
            return Ext.create('Ext.data.Store', {
                data: [
                    {
                        id: -1,
                        text: '~',
                        desc: '空值'
                    },
                    {
                        id: -2,
                        text: '!~',
                        desc: '非空值'
                    },
                    {
                        id: 0,
                        text: '=',
                        desc: '等于'
                    },
                    {
                        id: 1,
                        text: '!=',
                        desc: '不等于'
                    },
                    {
                        id: 2,
                        text: '?',
                        desc: '包含'
                    },
                    {
                        id: 3,
                        text: '!?',
                        desc: '不包含'
                    },
                    {
                        id: 4,
                        text: '>',
                        desc: '大于'
                    },
                    {
                        id: 6,
                        text: '>=',
                        desc: '大等于'
                    },
                    {
                        id: 5,
                        text: '<',
                        desc: '小于'
                    },
                    {
                        id: 7,
                        text: '<=',
                        desc: '小等于'
                    }
                ]
            });
        }


        /**
         * 获取比较运算式的连接符
         * @return Ext.data.Store
         */
        static getCompareLinkDataStore(): any {
            return Ext.create('Ext.data.Store', {
                data: [
                    {
                        id: 0,
                        text: '&',
                        desc: '并且'
                    },
                    {
                        id: 1,
                        text: '||',
                        desc: '或者'
                    }
                ]
            });
        }


        /**
         * 获取grid列的数据源
         * @param grid
         * @param search
         * @return Ext.data.Store
         */
        static getGridColumnStore(grid, search?) {
            let dataArray = [];
            let configColumns = grid.getColumns();
            for (let i = 0; i < configColumns.length; i++) {
                let column = configColumns[i];
                if (Ext.isEmpty(column.dataIndex)) {
                    continue;
                }
                if (FastExt.Base.toBool(search, false)) {
                    if (FastExt.Grid.isFilesColumn(column)
                        || FastExt.Grid.isFileColumn(column)) {
                        continue;
                    }
                    if (!FastExt.Base.toBool(column.search, true)) {
                        continue;
                    }
                    if (FastExt.Base.toBool(column["encrypt"], false)) {
                        continue;
                    }
                }
                dataArray.push({
                    'text': column.configText,
                    "id": column.dataIndex,
                    'index': i
                });
            }
            return Ext.create('Ext.data.Store', {
                fields: ["id", "text", "index"],
                data: dataArray
            });
        }


        /**
         * 获取yes或no的数据源
         * @return Ext.data.Store
         */
        static getYesOrNoDataStore(): any {
            return Ext.create('Ext.data.Store', {
                id: 'yesOrNoDataStore',
                fields: ["id", "text"],
                data: [
                    {
                        'text': '是',
                        "id": 1
                    },
                    {
                        'text': '否',
                        "id": 0
                    }]
            });
        }


        /**
         * 获取主题的数据源
         * @return Ext.data.Store
         */
        static getThemeDataStore(): any {
            return Ext.create('Ext.data.Store', {
                id: 'themeDataStore',
                fields: ["id", "text"],
                data: [
                    {
                        'text': '圆润立体',
                        "id": 'extjs/theme/fast-theme-wrap'
                    },
                    {
                        'text': '清爽扁平',
                        "id": 'extjs/theme/fast-theme-flat'
                    }]
            });
        }


        /**
         * 获取字体大小的数据源
         * @return Ext.data.Store
         */
        static getFontSizeDataStore() {
            return Ext.create('Ext.data.Store', {
                id: 'fontSizeDataStore',
                fields: ["id", "text"],
                data: [
                    {
                        'text': '14px',
                        "id": '14px'
                    },
                    {
                        'text': '16px',
                        "id": '16px'
                    }, {
                        'text': '18px',
                        "id": '18px'
                    }]
            });
        }


        /**
         * 将field组件的值设置到record里
         * @param record record对象
         * @param dataIndex 属性值
         * @param field field对象
         */
        static setRecordValue(record, dataIndex, field): void {
            field.dataIndex = dataIndex;
            if (Ext.isFunction(field.setRecordValue)) {
                field.setRecordValue(record, false);
            } else {
                let value = field.getValue();
                if (Ext.isDate(field.getValue())) {
                    record.set(dataIndex, Ext.Date.format(value, field.format));
                } else {
                    record.set(dataIndex, value);
                }
            }
            if (record.store) {
                if (FastExt.Base.toBool(field.autoUpdate, false)) {
                    FastExt.Store.commitStoreUpdate(record.store);
                }
            }
        }

    }

}