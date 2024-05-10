namespace FastExt {

    /**
     * Ext.data.Store数据源相关操作
     */
    export class Store {

        /**
         * 每页最大页数
         */
        static maxPageSize: number = 50;

        /**
         * 获取store相关的功能菜单文字，包含了父类
         * @param store 数据源
         * @param menu 数据源的菜单对象
         * @param splitChar 菜单拼接的分隔符
         * @returns {string|null}
         */
        static getStoreMenuText(store: any, menu?: any, splitChar?: string): string {
            if (Ext.isEmpty(splitChar)) {
                splitChar = ">";
            }
            if (menu) {
                return FastExt.System.MenuHandler.getPlainMenu(menu, splitChar);
            } else if (store && store.grid && store.grid.tabMenu) {
                return FastExt.System.MenuHandler.getPlainMenu(store.grid.tabMenu, splitChar);
            } else if (store && store.entity) {
                return FastExt.System.MenuHandler.getPlainMenu(FastExt.System.MenuHandler.searchMenuByEntityCode(store.entity.entityCode), splitChar);
            }
            return "";
        }

        /**
         * 提交Store被修改过的数据
         * @param store
         * @param successMsg 修改成功的消息提示
         * @param extend_params 其他参数
         * @return Ext.Promise
         */
        static commitStoreUpdate(store: any, successMsg?: string, extend_params?: any): any {
            return new Ext.Promise(function (resolve, reject) {
                if (!store) {
                    return;
                }
                if (!store.entity) {
                    return;
                }
                if (!store.entity.idProperty) {
                    return;
                }
                if (store.commiting) {
                    return;
                }
                if (!extend_params) {
                    extend_params = {};
                }

                let records = store.getUpdatedRecords();
                let phantoms = store.getNewRecords();
                records = records.concat(phantoms);
                if (records.length === 0) {
                    resolve(true);
                    store.commiting = false;
                    return;
                }
                store.commiting = true;
                let params = {"entityCode": store.entity.entityCode};


                params["menu"] = FastExt.Store.getStoreMenuText(store);

                for (let i = 0; i < records.length; i++) {
                    let record = records[i];
                    for (let j = 0; j < store.entity.idProperty.length; j++) {
                        let idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                    for (let key in record.modified) {
                        let oldValue = record.modified[key];
                        let newValue = record.get(key);
                        if (!Ext.isString(oldValue) && Ext.isEmpty(newValue)) {
                            params["data[" + i + "]." + key] = "<null>";
                        } else {
                            params["data[" + i + "]." + key] = record.get(key);
                        }
                    }
                }

                params = FastExt.Json.mergeJson(params, extend_params);

                FastExt.Server.updateEntity(params, function (success, message) {
                    store.commiting = false;
                    resolve(success);
                    if (success) {
                        if (successMsg !== "false") {
                            FastExt.Dialog.toast(successMsg ? successMsg : message);
                        }
                        store.commitChanges();
                    } else {
                        store.rejectChanges();
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        }

        /**
         * 提交Store里被选中删除的数据
         * @param store
         * @param data
         * @param extend_params 扩展参数
         * @return Ext.Promise
         */
        static commitStoreDelete(store: any, data: any, extend_params?: any) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store.entity) {
                    return;
                }
                if (!store.entity.idProperty) {
                    return;
                }
                let params = {"entityCode": store.entity.entityCode};
                params["menu"] = FastExt.Store.getStoreMenuText(store);

                for (let i = 0; i < data.length; i++) {
                    let record = data[i];
                    for (let j = 0; j < store.entity.idProperty.length; j++) {
                        let idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                }
                params = FastExt.Json.mergeJson(params, extend_params);
                FastExt.Server.deleteEntity(params, function (success: boolean, message: string) {
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
        static commitStoreReback(store: any, data: any) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store.entity) {
                    return;
                }
                if (!store.entity.idProperty) {
                    return;
                }
                let params = {"entityCode": store.entity.entityCode};
                params["menu"] = FastExt.Store.getStoreMenuText(store);
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
        static commitStoreCopy(store: any, data: any) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store.entity) {
                    return;
                }
                if (!store.entity.idProperty) {
                    return;
                }
                let params = {"entityCode": store.entity.entityCode};
                params["menu"] = Store.getStoreMenuText(store);
                let hasData = false;
                for (let i = 0; i < data.length; i++) {
                    let record = data[i];
                    for (let j = 0; j < store.entity.idProperty.length; j++) {
                        let idName = store.entity.idProperty[j];
                        let value = record.get(idName);
                        params['data[' + i + '].' + idName] = value;
                        if (!Ext.isEmpty(value)) {
                            hasData = true;
                        }
                    }
                }
                if (!hasData) {
                    FastExt.Dialog.toast("选中的数据不可复制！");
                    return;
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
         * @param record
         */
        static isModified(record: any): boolean {
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
        static getEntityDataStore(entity: any, where?: any, tree?: any) {
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
                treeConfig: tree,
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
                },
                listeners: {
                    beforeload: function (store, options, eOpts) {
                        store.recordSelectHistory = false;
                        try {
                            if (FastExt.Power.isPower()) {
                                console.log("权限配置默认，取消数据加载！");
                                return false;
                            }
                            if (!store.entity || !store.entity.entityCode) {
                                return false;
                            }
                            let params = store.proxy.extraParams;
                            let newParams = {
                                "entityCode": store.entity.entityCode,
                                "limit": store.pageSize,
                                "storeId": store.getStoreCode(),
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
                                newParams["where['^treeLevel']"] = parseInt(options.node.data.depth) + 1;


                                if (store.grid && FastExt.Grid.hasSearchColumn(store.grid)) {
                                    FastExt.Base.deleteObjectAttr("where['" + tree.parentIdName + "']", newParams, params);
                                    FastExt.Base.deleteObjectAttr("where['" + tree.idName + "']", newParams, params);

                                    newParams["where['^treeSearch']"] = true;
                                } else if (isFirstInstance && tree.parentIdValue !== -1) {
                                    newParams["where['" + tree.idName + "']"] = parentValue;
                                    FastExt.Base.deleteObjectAttr("where['" + tree.parentIdName + "']", newParams, params);
                                } else {
                                    FastExt.Base.deleteObjectAttr("where['" + tree.idName + "']", newParams, params);
                                    newParams["where['" + tree.parentIdName + "']"] = parentValue;
                                }

                            }


                            if (store.grid) {
                                newParams["power"] = FastExt.Base.toBool(store.grid.power, true);

                                if (store.grid.listParams) {
                                    newParams = FastExt.Json.mergeJson(newParams, store.grid.listParams);
                                }

                                store.grid.fromStoreChange = true;
                                if (store.grid.getSelection().length > 0) {
                                    store.grid.getSelectionModel().deselectAll(false, true);
                                } else {
                                    store.grid.fireEvent("selectionchange", store.grid);
                                }
                                store.grid.fromStoreChange = false;

                                if (store.grid.where) {
                                    for (let w in store.grid.where) {
                                        newParams["where['" + w + "']"] = store.grid.where[w];
                                    }
                                }

                                store.getSorters().each(function (item) {
                                    let column = FastExt.Grid.getColumn(store.grid, item.getProperty());
                                    newParams["indexSort['" + item.getProperty() + "']"] = column.getIndex();
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
                if (!FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                    config["root"] = {
                        expanded: true
                    };
                }
                entityStore = Ext.create('Ext.data.TreeStore', config);
            } else {
                entityStore = Ext.create('Ext.data.Store', config);
            }
            // 取消此功能，会造成treeStore下拉加载后 滚动条回滚到顶部问题
            // entityStore.on("load", function (store) {
            //     setTimeout(function () {
            //         try {
            //             if (store.grid) {
            //                 store.grid.syncRowHeights();
            //             }
            //         } catch (e) {
            //         }
            //     }, 300);
            // });
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
         * @param justData 只获取数据
         * @return Ext.data.Store
         */
        static getEnumDataStore(enumName: string, firstData?: any, lastData?: any, params?: any, useCache?: boolean, reload?: boolean, justData?: boolean): any {
            return new Ext.Promise(function (resolve, reject) {
                FastExt.Store.getEnumDataArray(enumName, firstData, lastData, params, useCache, reload).then(function (dataArray) {
                    if (justData) {
                        resolve(dataArray);
                    } else {
                        resolve(Ext.create('Ext.data.Store', {
                            autoLoad: false,
                            enumName: enumName,
                            data: dataArray
                        }));
                    }
                });
            });
        }


        /**
         * 获取枚举的数据
         * @param enumName
         * @param firstData
         * @param lastData
         * @param params
         * @param useCache
         * @param reload
         */
        static getEnumDataArray(enumName: string, firstData?: any, lastData?: any, params?: any, useCache?: boolean, reload?: boolean) {
            return new Ext.Promise(function (resolve, reject) {
                if (!params) {
                    params = {};
                }
                if (Ext.isEmpty(enumName)) {
                    resolve([]);
                    return;
                }
                if (Ext.isEmpty(useCache)) {
                    useCache = true;
                }
                if (Ext.isEmpty(reload)) {
                    reload = false;
                }
                let cacheKey = $.md5(enumName + Ext.JSON.encode(params));
                let filterData = function () {
                    let dataArray = Ext.clone(FastExt.Cache.getEnumCache(enumName, cacheKey));
                    if (firstData) {
                        dataArray = Ext.Array.insert(dataArray, 0, firstData);
                    }
                    if (lastData) {
                        dataArray = Ext.Array.push(dataArray, lastData);
                    }
                    return dataArray;
                };

                if (!useCache || !FastExt.Cache.existEnumCache(enumName, cacheKey) || reload) {
                    $.post(FastExt.Server.showEnumsUrl() + "?enumName=" + enumName, params, function (result) {
                        try {
                            if (result.success) {
                                FastExt.Cache.setEnumCache(enumName, cacheKey, result.data);
                                resolve(filterData());
                            } else {
                                FastExt.Dialog.showException("枚举获取失败！" + result.message, "getEnumDataArray");
                            }
                        } catch (e) {
                            FastExt.Dialog.showException(e, "获取枚举数据源！[getEnumDataStore]");
                        }
                    });
                    return;
                }
                resolve(filterData());
            });
        }

        /**
         * 从枚举Store中查找枚举对应的Record
         * @param enumName 枚举名称
         * @param id 枚举匹配的值
         * @param attr 查找的匹配的属性名，默认属性名：id
         * @return Ext.data.Record
         */
        static getEnumData(enumName: string, id: string, attr?: string): any {
            return new Ext.Promise(function (resolve, reject) {
                if (!attr) {
                    attr = "id";
                }
                if (Ext.isEmpty(id)) {
                    resolve(null);
                    return;
                }
                FastExt.Store.getEnumDataArray(enumName).then(function (dataArray) {
                    for (let i = 0; i < dataArray.length; i++) {
                        let data = dataArray[i];
                        if (!Ext.isEmpty(data[attr]) && data[attr].toString() === id.toString()) {
                            resolve(data);
                            return;
                        }
                    }
                    resolve(null);
                });
            });
        }


        /**
         * Grid列渲染枚举接口
         * @param enumName
         */
        static getEnumDataByRender(enumName: string) {
            try {
                let key = "Enum@" + enumName + "@Loading";
                if (FastExt.Base.toBool(FastExt.Cache.memory[key], false)) {
                    return;
                }
                FastExt.Cache.memory[key] = true;
                FastExt.Store.getEnumDataArray(enumName).then(function (dataArray) {
                    let enumContainers = $("[data-enum=" + enumName + "][data-set='false']");

                    for (let i = 0; i < enumContainers.length; i++) {
                        let item = $(enumContainers[i])
                        let enumValue = item.attr("data-id");
                        let enumValueAttr = item.attr("data-enum-value");
                        let enumTextAttr = item.attr("data-enum-text");

                        if (Ext.isEmpty(enumValueAttr) || enumValueAttr === "undefined") {
                            enumValueAttr = "id";
                        }
                        if (Ext.isEmpty(enumTextAttr) || enumValueAttr === "undefined") {
                            enumTextAttr = "text";
                        }

                        for (let i = 0; i < dataArray.length; i++) {
                            let data = dataArray[i];

                            if (FastExt.Base.toString(data[enumValueAttr], "") === enumValue.toString()) {
                                let innerHtml;
                                if (data) {
                                    let text = data[enumTextAttr];
                                    let enumColor = data["color"];
                                    if (Ext.isEmpty(text)) {
                                        innerHtml = "<span style='color: #ccc;'>" + enumValue + "</span>";
                                    } else {
                                        let color = FastExt.Color.toColor(enumColor, "#000000");
                                        innerHtml = "<span style='color: " + color + ";'>" + text + "</span>";
                                    }
                                } else {
                                    return;
                                }
                                item.html(innerHtml);
                                item.attr("data-set", "true");
                                break;
                            }
                        }
                    }
                    FastExt.Cache.memory[key] = null;
                });
            } catch (e) {
            }
        }

        /**
         * 获取页数的数据源Store
         * @param maxSize 最大页数 默认 100
         * @param iteration 每页迭代的增长因素 默认 10
         * @return Ext.data.Store
         */
        static getPageDataStore(maxSize?, iteration?): any {
            if (!maxSize || maxSize.length === 0) maxSize = FastExt.Store.maxPageSize;
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
        static getCompareDataStore(dataType: any): any {
            let data = [
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
                },
                {
                    id: 8,
                    text: '*',
                    desc: '匹配'
                },
                {
                    id: 9,
                    text: '!*',
                    desc: '不匹配'
                },
                {
                    id: 10,
                    text: '#',
                    desc: '重复'
                },
                {
                    id: 11,
                    text: '!#',
                    desc: '不重复'
                }
            ];
            if (dataType.date) {
                data = [
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
                    },
                ];
            }
            if (dataType && dataType.full) {
                data.splice(2, 0, {
                    id: -3,
                    text: '??',
                    desc: '检索'
                });
            }


            return Ext.create('Ext.data.Store', {
                data: data,
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
            if (grid) {
                let configColumns = grid.getColumns();
                for (let i = 0; i < configColumns.length; i++) {
                    let column = configColumns[i];
                    if (Ext.isEmpty(column.dataIndex)) {
                        continue;
                    }
                    if (FastExt.Base.toBool(search, false)) {
                        if (!FastExt.Grid.canColumnSearch(column)) {
                            continue;
                        }
                    }
                    dataArray.push({
                        "text": column.configText,
                        "id": column.dataIndex,
                        "index": i
                    });
                }
            }
            return Ext.create('Ext.data.Store', {
                fields: ["id", "text", "index"],
                data: dataArray
            });
        }

        /**
         * 获取支持图表功能的grid列的数据源
         * @param grid
         * @return Ext.data.Store
         */
        static getChartGridColumnStore(grid) {
            let dataArray = [];
            if (grid) {
                let configColumns = grid.getColumns();
                for (let i = 0; i < configColumns.length; i++) {
                    let column = configColumns[i];
                    if (Ext.isEmpty(column.dataIndex)) {
                        continue;
                    }
                    if ((FastExt.Grid.isNumberColumn(column) && FastExt.Base.toBool(column.chart, true))
                        || FastExt.Grid.isIdPropertyColumn(column)
                        || FastExt.Base.toBool(column.chart, true)) {

                        dataArray.push({
                            "text": column.configText,
                            "id": column.dataIndex,
                            "index": i
                        });
                    }
                }
            }
            return Ext.create('Ext.data.Store', {
                fields: ["id", "text", "index"],
                data: dataArray
            });
        }

        /**
         * 获取yes或no的数据源 1：是 0：否
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
         * 获取yes或no的数据源 true：是 false：否
         * @return Ext.data.Store
         */
        static getYesOrNoDataStore2(): any {
            return Ext.create('Ext.data.Store', {
                id: 'yesOrNoDataStore',
                fields: ["id", "text"],
                data: [
                    {
                        'text': '是',
                        "id": 'true'
                    },
                    {
                        'text': '否',
                        "id": 'false'
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
         * 获取系统排版的数据源
         * @return Ext.data.Store
         */
        static getSystemLayoutDataStore(): any {
            return Ext.create('Ext.data.Store', {
                id: 'systemLayoutDataStore',
                fields: ["id", "text"],
                data: [
                    {
                        'text': '传统布局',
                        "id": 'normal'
                    },
                    {
                        'text': '桌面布局',
                        "id": 'desktop'
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
         * 获取边角圆润度
         * @return Ext.data.Store
         */
        static getFrontRadiusDataStore() {
            return Ext.create('Ext.data.Store', {
                id: 'fontSizeDataStore',
                fields: ["id", "text"],
                data: [
                    {
                        'text': '8px',
                        "id": '8px'
                    },
                    {
                        'text': '88px',
                        "id": '88px'
                    }],
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


        /**
         * 判断两条record数据的id属性值是否一直
         * @param firstRecord
         * @param secondRecord
         */
        static isSameRecord(firstRecord, secondRecord): boolean {
            if (firstRecord.store && firstRecord.store.entity && secondRecord.store && secondRecord.store.entity) {
                if (firstRecord.store.entity.entityCode === secondRecord.store.entity.entityCode) {
                    return FastExt.Store.isSameRecordByEntity(firstRecord.store.entity, firstRecord, secondRecord);
                }
            }
            return false;
        }


        /**
         * 判断两条record数据的id属性值是否一直
         * @param entity 实体对象
         * @param firstRecord
         * @param secondRecord
         */
        static isSameRecordByEntity(entity, firstRecord, secondRecord): boolean {
            if (!entity.idProperty) {
                return false;
            }
            for (let i = 0; i < entity.idProperty.length; i++) {
                let idName = entity.idProperty[i];
                if (firstRecord.get(idName) !== secondRecord.get(idName)) {
                    return false;
                }
            }
            return true;
        }


        /**
         * 合并选中数据的参数，将自动移除tree节点的参数
         * @param store 数据源
         * @param selectParams 选中的数据形成的参数
         */
        static mergeStoreParamBySelect(store: any, selectParams: object): any {
            if (store) {
                let storeParams = store.proxy.extraParams;
                if (store.treeConfig) {
                    delete storeParams["where['" + store.treeConfig.idName + "']"];
                    delete storeParams["where['" + store.treeConfig.parentIdName + "']"];
                }
                return FastExt.Json.mergeJson(selectParams, storeParams);
            }
            return selectParams;
        }
    }

}