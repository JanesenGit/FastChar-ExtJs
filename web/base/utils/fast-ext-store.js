/**
 * 获取store相关的菜单文字，包含了父类
 * @param store
 * @param menu
 * @returns {string|null}
 */
function getStoreMenuText(store, menu) {
    if (menu) {
        if (menu.parent) {
            let storeMenuText = getStoreMenuText(null, menu.parent);
            if (storeMenuText) {
                return storeMenuText + ">" + menu.text;
            }
        }
        return menu.text;
    } else if (store && store.entity) {
        return getStoreMenuText(null, store.entity.menu);
    }
    return null;
}


/**
 * 提交entity store 修改的数据
 */
function commitStoreUpdate(store) {
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
            return;
        }
        store.commiting = true;
        let params = {"entityCode": store.entity.entityCode};
        if (store.entity.menu) {
            params["menu"] = getStoreMenuText(store);
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
        server.updateEntity(params, function (success, message) {
            store.commiting = false;
            resolve(success);
            if (success) {
                toast('修改成功!');
                store.commitChanges();
            } else {
                Ext.Msg.alert('系统提醒', message);
            }
        });
    });
}

/**
 * 提交删除entity store选择的数据
 */
function commitStoreDelete(store, data) {
    return new Ext.Promise(function (resolve, reject) {
        if (!store.entity) {
            return;
        }
        let params = {"entityCode": store.entity.entityCode};
        if (store.entity.menu) {
            params["menu"] =getStoreMenuText(store);
        }
        for (let i = 0; i < data.length; i++) {
            let record = data[i];
            for (let j = 0; j < store.entity.idProperty.length; j++) {
                let idName = store.entity.idProperty[j];
                params['data[' + i + '].' + idName] = record.get(idName);
            }
        }
        server.deleteEntity(params, function (success, message) {
            resolve(success);
            if (success) {
                toast('删除成功!');
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
 * 提交回收站还原entity store选择的数据
 */
function commitStoreReback(store, data) {
    return new Ext.Promise(function (resolve, reject) {
        if (!store.entity) {
            return;
        }
        let params = {"entityCode": store.entity.entityCode};
        if (store.entity.menu) {
            params["menu"] =getStoreMenuText(store);
        }
        for (let i = 0; i < data.length; i++) {
            let record = data[i];
            for (let j = 0; j < store.entity.idProperty.length; j++) {
                let idName = store.entity.idProperty[j];
                params['data[' + i + '].' + idName] = record.get(idName);
            }
        }
        server.rebackEntity(params, function (success, message) {
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
 */
function commitStoreCopy(store, data) {
    return new Ext.Promise(function (resolve, reject) {
        if (!store.entity) {
            return;
        }
        let params = {"entityCode": store.entity.entityCode};
        if (store.entity.menu) {
            params["menu"] = getStoreMenuText(store);
        }
        for (let i = 0; i < data.length; i++) {
            let record = data[i];
            for (let j = 0; j < store.entity.idProperty.length; j++) {
                let idName = store.entity.idProperty[j];
                params['data[' + i + '].' + idName] = record.get(idName);
            }
        }
        server.copyEntity(params, function (success, message) {
            resolve(success);
            if (success) {
                toast('复制成功!');
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
function isModified(record) {
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
 * 获得FastExtEntity的数据源
 */
function getEntityDataStore(entity, where, tree) {
    if (Ext.isEmpty(entity)) {
        showAlert("系统提醒", "参数entity不可为空！");
        return;
    }
    let config = {
        fields: [],
        pageSize: 20,
        where: where,
        entity: entity,
        remoteSort: toBool(entity.remoteSort, true),
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
            endupdate: function (eOpts) {
            },
            beforeload: function (store, options) {
                try {
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
                        let parentValue = options.node.data[tree.idName];
                        if (Ext.isEmpty(parentValue)) {
                            parentValue = tree.parentIdValue;
                        }
                        if (store.grid) {
                            if (!hasSearchColumn(store.grid)) {
                                newParams["where['" + tree.parentIdName + "']"] = parentValue;
                            } else {
                                newParams["where['" + tree.parentIdName + "']"] = null;
                            }
                        } else {
                            newParams["where['" + tree.parentIdName + "']"] = parentValue;
                        }
                    }

                    if (store.grid) {
                        newParams["power"] = toBool(store.grid.power, true);

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
                            newParams["indexSort['" + item.getProperty() + "']"] = getColumn(store.grid, item.getProperty()).getIndex();
                        });


                        checkColumnSearch(store.grid);
                    }
                    store.getProxy().setExtraParams(mergeJson(params, newParams));
                    return true;
                } catch (e) {
                    showException(e, "store:beforeload");
                }
            }
        }
    };
    if (tree) {
        return Ext.create('Ext.data.TreeStore', config);
    }
    config.autoLoad = false;
    return Ext.create('Ext.data.Store', config);
}


/**
 * 获得枚举数据源
 * @param enumName
 * @param firstData
 * @param lastData
 */
function getEnumDataStore(enumName, firstData, lastData, params) {
    if (!params) {
        params = {};
    }
    let cacheKey = $.md5(enumName + Ext.JSON.encode(params));
    if (!MemoryCache.hasOwnProperty(cacheKey)) {
        Ext.Ajax.request({
            url: 'showEnums?enumName=' + enumName,
            async: false,
            params: params,
            success: function (response, opts) {
                try {
                    let result = Ext.decode(response.responseText);
                    if (result.success) {
                        MemoryCache[cacheKey] = result.data;
                    } else {
                        Ext.Msg.alert('枚举获取失败', result.message);
                    }
                } catch (e) {
                    showException(e, "获取枚举数据源！[getEnumDataStore]");
                }
            }
        });
    }
    let dataArray = Ext.clone(MemoryCache[cacheKey]);
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
 * 获得枚举的文本值
 */
function getEnumText(enumName, id) {
    let findRecord = getEnumRecord(enumName, id);
    if (findRecord) {
        return findRecord.get("text");
    }
    return null;
}

/**
 * 获得枚举的文本值
 */
function getEnumRecord(enumName, id, attr) {
    if (!attr) {
        attr = "id";
    }
    return getEnumDataStore(enumName).findRecord(attr, id, 0, false, false, true);
}


/**
 * 分页的页数数据源
 * @returns
 */
function getPageDataStore(maxSize, iteration) {
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
 * 获得比较符的数据源
 * @returns {Ext.data.Store}
 */
function getCompareDataStore() {
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
}

/**
 * 获取grid列的数据源
 * @param grid
 * @param search
 */
function getGridColumnStore(grid, search) {
    let dataArray = [];
    let configColumns = grid.getColumns();
    for (let i = 0; i < configColumns.length; i++) {
        let column = configColumns[i];
        if (Ext.isEmpty(column.dataIndex)) {
            continue;
        }
        if (toBool(search, false)) {
            if (isFilesColumn(column)
                || isFileColumn(column)) {
                continue;
            }
            if (!toBool(column.search, true)) {
                continue;
            }
            if (toBool(column["encrypt"], false)) {
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
 */
function getYesOrNoDataStore() {
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
 * 获取系统主题的数据源
 */
function getThemeDataStore() {
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

function getFontSizeDataStore() {
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
