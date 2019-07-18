
/**
 * 提交entity store 修改的数据
 */
function commitStoreUpdate(store) {
    return new Ext.Promise(function (resolve, reject) {
        if (!store.entity) {
            return;
        }
        if (store.commiting) {
            return;
        }
        var records = store.getUpdatedRecords();
        var phantoms = store.getNewRecords();
        records = records.concat(phantoms);
        if (records.length == 0) {
            return;
        }
        store.commiting = true;
        var params = {"entityCode": store.entity.entityCode};
        if (store.entity.menu) {
            params["menu"] = store.entity.menu.text;
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
        server.updateEntity(params, function (success, message) {
            resolve(success);
            if (success) {
                toast('修改成功!');
                store.commitChanges();
                store.commiting = false;
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
        var params = {"entityCode": store.entity.entityCode};
        if (store.entity.menu) {
            params["menu"] = store.entity.menu.text;
        }
        for (var i = 0; i < data.length; i++) {
            var record = data[i];
            for (var j = 0; j < store.entity.idProperty.length; j++) {
                var idName = store.entity.idProperty[j];
                params['data[' + i + '].' + idName] = record.get(idName);
            }
        }
        server.deleteEntity(params, function (success, message) {
            resolve(success);
            if (success) {
                toast('删除成功!');
                var reloadPage = store.currentPage;
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
        var params = {"entityCode": store.entity.entityCode};
        if (store.entity.menu) {
            params["menu"] = store.entity.menu.text;
        }
        for (var i = 0; i < data.length; i++) {
            var record = data[i];
            for (var j = 0; j < store.entity.idProperty.length; j++) {
                var idName = store.entity.idProperty[j];
                params['data[' + i + '].' + idName] = record.get(idName);
            }
        }
        server.copyEntity(params, function (success, message) {
            resolve(success);
            if (success) {
                toast('复制成功!');
                var reloadPage = store.currentPage;
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
    for (var name in record.data) {
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
    var config = {
        fields: [],
        pageSize: 10,
        where: where,
        entity: entity,
        remoteSort: true,
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
                    var data = eval("(" + request.responseText + ")");
                    if (!data.success) {
                        Ext.Msg.alert('数据获取失败', data.message);
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
                    var params = store.proxy.extraParams;
                    var newParams = {
                        "entityCode": store.entity.entityCode,
                        "limit": store.pageSize
                    };
                    if (store.where) {
                        for (var w in store.where) {
                            newParams["where['" + w + "']"] = store.where[w];
                        }
                    }
                    if (tree) {
                        if (Ext.isEmpty(tree.parentIdValue)) {
                            tree.parentIdValue = -1;
                        }
                        newParams["page"] = -1;
                        var parentValue = options.node.data[tree.idName];
                        if (Ext.isEmpty(parentValue)) {
                            parentValue = tree.parentIdValue;
                        }
                        if (store.grid) {
                            if (!hasSearchColumn(store.grid)) {
                                newParams["where['" + tree.parentIdName + "']"] = parentValue;
                            }else{
                                newParams["where['" + tree.parentIdName + "']"] = null;
                            }
                        }else{
                            newParams["where['" + tree.parentIdName + "']"] = parentValue;
                        }
                    }

                    if (store.grid) {
                        if (store.grid.getSelection().length > 0) {
                            store.grid.getSelectionModel().deselectAll();
                        } else {
                            store.grid.fireEvent("selectionchange", store.grid);
                        }
                        if (store.grid.where) {
                            for (var w in store.grid.where) {
                                newParams["where['" + w + "']"] = store.grid.where[w];
                            }
                        }

                        store.getSorters().each(function (item) {
                            newParams["indexSort['" + item.getProperty() + "']"] = getColumn(store.grid, item.getProperty()).getIndex();
                        });
                    }
                    Ext.apply(store.proxy.extraParams, mergeJson(params, newParams));
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
 */
function getEnumDataStore(enumName) {
    var cacheKey = $.md5(enumName);
    if (MemoryCache.hasOwnProperty(cacheKey)) {
        var store = Ext.create('Ext.data.Store', {
            autoLoad: false,
            fields: ["id", "text"],
            enumName: enumName,
            data: MemoryCache[cacheKey]
        });
        return store;
    }
    Ext.Ajax.request({
        url: 'showEnums?enumName=' + enumName,
        async: false,
        success: function (response, opts) {
            try {
                var result = Ext.decode(response.responseText);
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
    var enumDataStore = Ext.create('Ext.data.Store', {
        autoLoad: false,
        enumName: enumName,
        fields: ["id", "text"],
        data: MemoryCache[cacheKey]
    });
    return enumDataStore;
}

/**
 * 获得枚举的文本值
 */
function getEnumText(enumName, id) {
    return getEnumDataStore(enumName).findRecord("id", id).get("text");
}


/**
 * 分页的页数数据源
 * @returns
 */
function getPageDataStore(maxSize, iteration) {
    if (maxSize == null || maxSize.length == 0) maxSize = 100;
    if (iteration == null || iteration.length == 0) iteration = 10;
    var dataArray = new Array();
    for (var i = 0; i < maxSize / 10; i++) {
        var text = ((i + 1) * iteration) + '条';
        var id = ((i + 1) * iteration);
        dataArray[i] = {
            'text': text,
            "id": id
        };
    }
    var dataStore = Ext.create('Ext.data.Store', {
        id: 'pageSizeDataStore',
        fields: ["id", "text"],
        data: dataArray
    });
    return dataStore;
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
                id: 5,
                text: '<',
                desc: '小于'
            },
            {
                id: 6,
                text: '>=',
                desc: '大等于'
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


