var FastExt;
(function (FastExt) {
    /**
     * Ext.data.Store数据源相关操作
     */
    var Store = /** @class */ (function () {
        function Store() {
        }
        /**
         * 获取store相关的功能菜单文字，包含了父类
         * @param store
         * @param menu
         * @returns {string|null}
         */
        Store.getStoreMenuText = function (store, menu) {
            if (menu) {
                if (menu.parent) {
                    var storeMenuText = FastExt.Store.getStoreMenuText(null, menu.parent);
                    if (storeMenuText) {
                        return storeMenuText + ">" + menu.text;
                    }
                }
                return menu.text;
            }
            else if (store && store.entity) {
                return FastExt.Store.getStoreMenuText(null, store.entity.menu);
            }
            return null;
        };
        /**
         * 提交Store被修改过的数据
         * @param store
         * @return Ext.Promise
         */
        Store.commitStoreUpdate = function (store) {
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
                var records = store.getUpdatedRecords();
                var phantoms = store.getNewRecords();
                records = records.concat(phantoms);
                if (records.length === 0) {
                    resolve(true);
                    return;
                }
                store.commiting = true;
                var params = { "entityCode": store.entity.entityCode };
                if (store.entity.menu) {
                    params["menu"] = FastExt.Store.getStoreMenuText(store);
                }
                for (var i = 0; i < records.length; i++) {
                    var record = records[i];
                    for (var j = 0; j < store.entity.idProperty.length; j++) {
                        var idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                    for (var key in record.modified) {
                        params["data[" + i + "]." + key] = record.get(key);
                    }
                }
                FastExt.Server.updateEntity(params, function (success, message) {
                    store.commiting = false;
                    resolve(success);
                    if (success) {
                        FastExt.Dialog.toast(message);
                        store.commitChanges();
                    }
                    else {
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        };
        /**
         * 提交Store里被选中删除的数据
         * @param store
         * @param data
         * @return Ext.Promise
         */
        Store.commitStoreDelete = function (store, data) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store.entity) {
                    return;
                }
                var params = { "entityCode": store.entity.entityCode };
                if (store.entity.menu) {
                    params["menu"] = FastExt.Store.getStoreMenuText(store);
                }
                for (var i = 0; i < data.length; i++) {
                    var record = data[i];
                    for (var j = 0; j < store.entity.idProperty.length; j++) {
                        var idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                }
                FastExt.Server.deleteEntity(params, function (success, message) {
                    resolve(success);
                    if (success) {
                        FastExt.Dialog.toast(message);
                        var reloadPage = store.currentPage;
                        if (store.count() - data.length <= 0) {
                            reloadPage = reloadPage - 1;
                        }
                        store.loadPage(Math.max(reloadPage, 1));
                    }
                    else {
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        };
        /**
         * 提交Store回收站里还原选中的数据
         * @param store
         * @param data
         * @return Ext.Promise
         */
        Store.commitStoreReback = function (store, data) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store.entity) {
                    return;
                }
                var params = { "entityCode": store.entity.entityCode };
                if (store.entity.menu) {
                    params["menu"] = FastExt.Store.getStoreMenuText(store);
                }
                for (var i = 0; i < data.length; i++) {
                    var record = data[i];
                    for (var j = 0; j < store.entity.idProperty.length; j++) {
                        var idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                }
                FastExt.Server.rebackEntity(params, function (success, message) {
                    resolve(success);
                    if (success) {
                        var reloadPage = store.currentPage;
                        if (store.count() - data.length <= 0) {
                            reloadPage = reloadPage - 1;
                        }
                        store.loadPage(Math.max(reloadPage, 1));
                    }
                    else {
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        };
        /**
         * 提交复制entity store选择的数据
         * @param store
         * @param data
         * @return Ext.Promise
         */
        Store.commitStoreCopy = function (store, data) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store.entity) {
                    return;
                }
                var params = { "entityCode": store.entity.entityCode };
                if (store.entity.menu) {
                    params["menu"] = Store.getStoreMenuText(store);
                }
                for (var i = 0; i < data.length; i++) {
                    var record = data[i];
                    for (var j = 0; j < store.entity.idProperty.length; j++) {
                        var idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                }
                FastExt.Server.copyEntity(params, function (success, message) {
                    resolve(success);
                    if (success) {
                        FastExt.Dialog.toast(message);
                        var reloadPage = store.currentPage;
                        if (store.count() - data.length <= 0) {
                            reloadPage = reloadPage - 1;
                        }
                        store.loadPage(Math.max(reloadPage, 1));
                    }
                    else {
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        };
        /**
         * 判断record是否被修改过
         * @param record [Ext.data.Model]
         */
        Store.isModified = function (record) {
            for (var name_1 in record.data) {
                try {
                    if (record.isModified(name_1)) {
                        return true;
                    }
                }
                catch (e) {
                }
            }
            return false;
        };
        /**
         * 获取用作FastEntity通用的数据源，接口：entity/list
         * @param entity 实体对象
         * @param where 请求实体数据列表的接口参数 json对象
         * @param tree 是否用作Ext.tree.Panel
         */
        Store.getEntityDataStore = function (entity, where, tree) {
            if (Ext.isEmpty(entity)) {
                FastExt.Dialog.showAlert("系统提醒", "参数entity不可为空！");
                return;
            }
            var config = {
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
                                var data = eval("(" + request.responseText + ")");
                                if (!data.success) {
                                    Ext.Msg.alert('数据获取失败', data.message);
                                }
                            }
                            catch (e) {
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
                            var params = store.proxy.extraParams;
                            var newParams_1 = {
                                "entityCode": store.entity.entityCode,
                                "limit": store.pageSize
                            };
                            if (store.where) {
                                for (var w in store.where) {
                                    newParams_1["where['" + w + "']"] = store.where[w];
                                }
                            }
                            if (tree) {
                                if (Ext.isEmpty(tree.parentIdValue)) {
                                    tree.parentIdValue = -1;
                                }
                                newParams_1["page"] = -1;
                                var parentValue = options.node.data[tree.idName];
                                if (Ext.isEmpty(parentValue)) {
                                    parentValue = tree.parentIdValue;
                                }
                                if (store.grid) {
                                    if (!FastExt.Grid.hasSearchColumn(store.grid)) {
                                        newParams_1["where['" + tree.parentIdName + "']"] = parentValue;
                                    }
                                    else {
                                        newParams_1["where['" + tree.parentIdName + "']"] = null;
                                    }
                                }
                                else {
                                    newParams_1["where['" + tree.parentIdName + "']"] = parentValue;
                                }
                            }
                            if (store.grid) {
                                newParams_1["power"] = FastExt.Base.toBool(store.grid.power, true);
                                if (store.grid.getSelection().length > 0) {
                                    store.grid.getSelectionModel().deselectAll();
                                }
                                else {
                                    store.grid.fireEvent("selectionchange", store.grid);
                                }
                                if (store.grid.where) {
                                    for (var w in store.grid.where) {
                                        newParams_1["where['" + w + "']"] = store.grid.where[w];
                                    }
                                }
                                store.getSorters().each(function (item) {
                                    newParams_1["indexSort['" + item.getProperty() + "']"] = FastExt.Grid.getColumn(store.grid, item.getProperty()).getIndex();
                                });
                                FastExt.Grid.checkColumnSearch(store.grid);
                            }
                            if (store.grid) {
                                if (Ext.isFunction(store.grid.onBeforeLoad)) {
                                    var result = store.grid.onBeforeLoad(store.grid, store, newParams_1);
                                    if (!FastExt.Base.toBool(result, true)) {
                                        return false;
                                    }
                                }
                            }
                            store.getProxy().setExtraParams(FastExt.Json.mergeJson(params, newParams_1));
                            return true;
                        }
                        catch (e) {
                            FastExt.Dialog.showException(e, "store:beforeload");
                        }
                    }
                },
                autoLoad: false
            };
            config.autoLoad = false;
            var entityStore;
            if (tree) {
                config["root"] = {
                    expanded: true
                };
                entityStore = Ext.create('Ext.data.TreeStore', config);
            }
            else {
                entityStore = Ext.create('Ext.data.Store', config);
            }
            entityStore.on("load", function (store) {
                setTimeout(function () {
                    try {
                        if (store.grid) {
                            store.grid.syncRowHeights();
                        }
                    }
                    catch (e) {
                    }
                }, 300);
            });
            return entityStore;
        };
        /**
         * 获取枚举数据源，接口showEnums?enumName=
         * @param enumName 枚举名称
         * @param firstData 插入头部的数据
         * @param lastData 插入尾部的数据
         * @param params 获取枚举接口的参数
         * @param useCache
         * @return Ext.data.Store
         */
        Store.getEnumDataStore = function (enumName, firstData, lastData, params, useCache) {
            if (!params) {
                params = {};
            }
            if (Ext.isEmpty(useCache)) {
                useCache = true;
            }
            var cacheKey = $.md5(enumName + Ext.JSON.encode(params));
            if (!useCache || !FastExt.Cache.memory.hasOwnProperty(cacheKey)) {
                Ext.Ajax.request({
                    url: 'showEnums?enumName=' + enumName,
                    async: false,
                    params: params,
                    success: function (response, opts) {
                        try {
                            var result = Ext.decode(response.responseText);
                            if (result.success) {
                                FastExt.Cache.memory[cacheKey] = result.data;
                            }
                            else {
                                Ext.Msg.alert('枚举获取失败', result.message);
                            }
                        }
                        catch (e) {
                            FastExt.Dialog.showException(e, "获取枚举数据源！[getEnumDataStore]");
                        }
                    }
                });
            }
            var dataArray = Ext.clone(FastExt.Cache.memory[cacheKey]);
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
        };
        /**
         * 从枚举Store中查找枚举对应的Record
         * @param enumName 枚举名称
         * @param id 枚举匹配的值
         * @param attr 查找的匹配的属性名
         */
        Store.getEnumRecord = function (enumName, id, attr) {
            if (!attr) {
                attr = "id";
            }
            return FastExt.Store.getEnumDataStore(enumName).findRecord(attr, id, 0, false, false, true);
        };
        /**
         * 从枚举Store中查找枚举的文本
         * @param enumName
         * @param id
         */
        Store.getEnumText = function (enumName, id) {
            var findRecord = FastExt.Store.getEnumRecord(enumName, id);
            if (findRecord) {
                return findRecord.get("text");
            }
            return null;
        };
        /**
         * 获取页数的数据源Store
         * @param maxSize 最大页数 默认 100
         * @param iteration 每页迭代的增长因素 默认 10
         * @return Ext.data.Store
         */
        Store.getPageDataStore = function (maxSize, iteration) {
            if (!maxSize || maxSize.length === 0)
                maxSize = 100;
            if (!iteration || iteration.length === 0)
                iteration = 10;
            var dataArray = [];
            for (var i = 0; i < maxSize / 10; i++) {
                var text = ((i + 1) * iteration) + '条';
                var id = ((i + 1) * iteration);
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
        };
        /**
         * 获取比较符数据源
         * @return Ext.data.Store
         */
        Store.getCompareDataStore = function () {
            return Ext.create('Ext.data.Store', {
                data: [
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
        };
        /**
         * 获取grid列的数据源
         * @param grid
         * @param search
         * @return Ext.data.Store
         */
        Store.getGridColumnStore = function (grid, search) {
            var dataArray = [];
            var configColumns = grid.getColumns();
            for (var i = 0; i < configColumns.length; i++) {
                var column = configColumns[i];
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
        };
        /**
         * 获取yes或no的数据源
         * @return Ext.data.Store
         */
        Store.getYesOrNoDataStore = function () {
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
                    }
                ]
            });
        };
        /**
         * 获取主题的数据源
         * @return Ext.data.Store
         */
        Store.getThemeDataStore = function () {
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
                    }
                ]
            });
        };
        /**
         * 获取字体大小的数据源
         * @return Ext.data.Store
         */
        Store.getFontSizeDataStore = function () {
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
                    }
                ]
            });
        };
        /**
         * 将field组件的值设置到record里
         * @param record record对象
         * @param dataIndex 属性值
         * @param field field对象
         */
        Store.setRecordValue = function (record, dataIndex, field) {
            field.dataIndex = dataIndex;
            if (Ext.isFunction(field.setRecordValue)) {
                field.setRecordValue(record, false);
            }
            else {
                var value = field.getValue();
                if (Ext.isDate(field.getValue())) {
                    record.set(dataIndex, Ext.Date.format(value, field.format));
                }
                else {
                    record.set(dataIndex, value);
                }
            }
            if (FastExt.Base.toBool(field.autoUpdate, false)) {
                FastExt.Store.commitStoreUpdate(record.store);
            }
        };
        return Store;
    }());
    FastExt.Store = Store;
})(FastExt || (FastExt = {}));
