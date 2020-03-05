const server = {
    isSilenceRequest: function () {
        return toBool(server.silence, false);
    },
    setSilence: function (value) {
        server.silence = value;
    },
    loginUrl: function () {
        return "controller/login";
    },
    showConfigUrl: function () {
        return "showConfig";
    },
    logout: function () {
        showWait("正在退出登录中……");
        $.post("controller/logout", function () {
            location.reload();
        });
    },
    updateEntity: function (params, callBack) {
        if (isPower()) {
            callBack(false, "当前正在进行界面权限配置，不可修改数据！");
            return;
        }
        $.post("entity/update", params, function (result) {
            if (result.code === 203) {//会话失效
                return;
            }
            if (Ext.isFunction(callBack)) {
                if (result.success) {
                    callBack(true);
                } else {
                    callBack(false, result.message);
                }
            }
        });
    },
    deleteAttach: function (params, callBack) {
        if (isPower()) {
            callBack(false, "当前正在进行界面权限配置，不可删除数据！");
            return;
        }
        $.post("deleteAttach", params, function (result) {
            if (result.code === 203) {//会话失效
                return;
            }
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
            if (result.code === 203) {//会话失效
                return;
            }
            if (Ext.isFunction(callBack)) {
                callBack(result.success, result.message);
            }
        });

    },
    rebackEntity: function (params, callBack) {
        if (isPower()) {
            callBack(false, "当前正在进行界面权限配置，不可还原数据！");
            return;
        }
        $.post("entity/reback", params, function (result) {
            if (result.code === 203) {//会话失效
                return;
            }
            if (Ext.isFunction(callBack)) {
                callBack(result.success, result.message);
            }
        });

    },
    copyEntity: function (params, callBack) {
        if (isPower()) {
            callBack(false, "当前正在进行界面权限配置，不可复制数据！");
            return;
        }
        $.post("entity/copy", params, function (result) {
            if (result.code === 203) {//会话失效
                return;
            }
            if (Ext.isFunction(callBack)) {
                if (result.success) {
                    callBack(true, result.message);
                } else {
                    callBack(false, result.message);
                }
            }
        });

    },
    clearEntity: function (params, callBack) {
        if (isPower()) {
            callBack(false, "当前正在进行界面权限配置，不可复制数据！");
            return;
        }
        $.post("entity/clear", params, function (result) {
            if (result.code === 203) {//会话失效
                return;
            }
            if (Ext.isFunction(callBack)) {
                if (result.success) {
                    callBack(true, result.message);
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
        let params = {
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
        let params = {
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
        let params = {
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
            if (result.code === 203) {//会话失效
                return;
            }
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
            if (result.code === 203) {//会话失效
                return;
            }
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
        let iconPath = "icons/" + iconName;
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
    },
    loadMonitor: function (callBack) {
        $.post("monitor", function (result) {
            if (Ext.isFunction(callBack)) {
                callBack(result.success, result.data);
            }
        });
    },
    countReport: function (callBack) {
        $.post("countReport", function (result) {
            if (Ext.isFunction(callBack)) {
                callBack(result.success, result.data);
            }
        });
    },
    checkWaitNotice: function (params, callBack) {
        server.setSilence(true);
        $.post("controller/waitNotice", params, function (result) {
            server.setSilence(false);
            if (Ext.isFunction(callBack)) {
                callBack(result.success, result.data);
            }
        });
    },
    doneWaitNotice: function (noticeId,callBack) {
        $.post("controller/doneNotice", {"noticeId": noticeId}, function (result) {
            if (Ext.isFunction(callBack)) {
                callBack(result.success, result.message, result.data);
            }
        });
    }

};