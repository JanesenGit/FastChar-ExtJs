server = {
    logout: function () {
        $.post("manager/logout", function () {
            addScript({src: 'base/login/login.js?v=' + getExt("version").value});
        });
    },
    updateEntity: function (params, callBack) {
        if (isPower()) {
            callBack(false, "当前正在进行界面权限配置，不可修改数据！");
            return;
        }
        $.post("entity/update", params, function (result) {
            if (Ext.isFunction(callBack)) {
                if (result.success) {
                    callBack(true);
                } else {
                    callBack(false, result.message);
                }
            }
        });
    },
    deleteEntity: function (params, callBack) {
        if (isPower()) {
            callBack(false, "当前正在进行界面权限配置，不可删除数据！");
            return;
        }
        $.post("entity/delete", params, function (result) {
            if (Ext.isFunction(callBack)) {
                if (result.success) {
                    callBack(true);
                } else {
                    callBack(false, result.message);
                }
            }
        });

    },
    showExtConfig: function (key, type, callBack) {
        if (isPower()) {
            callBack(false);
            return;
        }
        var params = {
            "configKey": key,
            "configType": type
        };
        $.post("ext/config/showExtConfig", params, function (result) {
            if (Ext.isFunction(callBack)) {
                if (result.success) {
                    callBack(true, result.data.configValue);
                } else {
                    callBack(false, null, result.message);
                }
            }
        });
    },
    saveExtConfig: function (key, type, value, callBack, otherParams) {
        if (isPower()) {
            callBack(false);
            return;
        }
        var params = {
            "configKey": key,
            "configType": type,
            "configValue": value
        };
        if (!Ext.isEmpty(otherParams)) {
            params = mergeJson(params, otherParams);
        }
        $.post("ext/config/saveExtConfig", params, function (result) {
            if (Ext.isFunction(callBack)) {
                if (result.success) {
                    callBack(true);
                } else {
                    callBack(false, result.message);
                }
            }
        });
    },
    deleteExtConfig: function (key, type, callBack) {
        if (isPower()) {
            callBack(false);
            return;
        }
        var params = {
            "configKey": key,
            "configType": type
        };
        $.post("ext/config/deleteExtConfig", params, function (result) {
            if (Ext.isFunction(callBack)) {
                if (result.success) {
                    callBack(true);
                } else {
                    callBack(false, result.message);
                }
            }
        });
    },
    exportExcel: function (params, callBack) {
        if (isPower()) {
            callBack(false, "当前正在进行界面权限配置，不可导出数据！");
            return;
        }
        $.post("entity/export", params, function (result) {
            if (Ext.isFunction(callBack)) {
                if (result.success) {
                    callBack(true, result.data);
                } else {
                    callBack(false, null, result.message);
                }
            }
        });
    },
    excelModule: function (params, callBack) {
        if (isPower()) {
            callBack(false, "当前正在进行界面权限配置，不可生成模板！");
            return;
        }
        $.post("entity/module", params, function (result) {
            if (Ext.isFunction(callBack)) {
                if (result.success) {
                    callBack(true, result.data);
                } else {
                    callBack(false, null, result.message);
                }
            }
        });
    },
    showColumns: function (entityCode, callBack) {
        $.post("ext/config/showEntityColumn?entityCode=" + entityCode, function (result) {
            if (Ext.isFunction(callBack)) {
                if (result.success) {
                    callBack(true, result.data.configValue);
                } else {
                    callBack(false, null, result.message);
                }
            }
        });
    },
    getIcon: function (iconName, color) {
        var iconPath = "icons/" + iconName;
        if (Ext.isEmpty(color)) {
            return iconPath;
        }
        if (color.startWith("#")) {
            color = color.substring(1);
        }
        return "icon?path=" + iconPath + "&color=" + color;
    },
    showSystemConfig: function (callBack) {
        $.post("ext/config/showSystemConfig", function (result) {
            if (Ext.isFunction(callBack)) {
                if (result.success) {
                    callBack(true, result.data);
                } else {
                    callBack(false, null, result.message);
                }
            }
        });
    },
    deleteSystemConfig: function (callBack) {
        $.post("ext/config/deleteSystemConfig", function (result) {
            if (Ext.isFunction(callBack)) {
                callBack(result.success, result.message);
            }
        });
    }

};