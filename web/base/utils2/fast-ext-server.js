var FastExt;
(function (FastExt) {
    /**
     * 请求后台接口
     */
    var Server = /** @class */ (function () {
        function Server() {
            $.ajaxSetup({
                data: {
                    "fromOS": FastExt.Base.getOS()
                }
            });
            Ext.Ajax.on('beforerequest', function (conn, options, eOpts) {
                try {
                    conn.setExtraParams({
                        "fromOS": FastExt.Base.getOS()
                    });
                }
                catch (e) {
                }
            });
        }
        /**
         * 是否是静默请求
         * @see FastExt.Server.silence
         */
        Server.isSilenceRequest = function () {
            return FastExt.Base.toBool(Server.silence, false);
        };
        /**
         * 设置请求是否为静默请求
         * @param value
         * @see FastExt.Server.silence
         */
        Server.setSilence = function (value) {
            Server.silence = value;
        };
        /**
         * 后台登录的接口地址
         */
        Server.loginUrl = function () {
            return "controller/login";
        };
        /**
         * 安全验证的接口地址
         */
        Server.validOperateUrl = function () {
            return "controller/valid";
        };
        /**
         * 获取系统配置接口地址
         */
        Server.showConfigUrl = function () {
            return "showConfig";
        };
        /**
         * 退出后台管理登录
         */
        Server.logout = function () {
            FastExt.Dialog.showWait("正在退出登录中……");
            $.post("controller/logout", function () {
                location.reload();
            });
        };
        /**
         * 提交更新FastEntity实体数据
         * @param params 接口参数
         * @param callBack 回调函数：callBack(true, result.message)
         */
        Server.updateEntity = function (params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可修改数据！");
                return;
            }
            $.post("entity/update", params, function (result) {
                if (result.code === 203) { //会话失效
                    return;
                }
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.message);
                    }
                    else {
                        callBack(false, result.message);
                    }
                }
            });
        };
        /**
         * 删除附件地址
         * @param params 接口参数
         * @param callBack 回调函数 callBack(true, result.message)
         */
        Server.deleteAttach = function (params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可删除数据！");
                return;
            }
            $.post("deleteAttach", params, function (result) {
                if (result.code === 203) { //会话失效
                    return;
                }
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.message);
                    }
                    else {
                        callBack(false, result.message);
                    }
                }
            });
        };
        /**
         * 删除实体数据
         * @param params 接口参数
         * @param callBack 回调函数   callBack(result.success, result.message)
         */
        Server.deleteEntity = function (params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可删除数据！");
                return;
            }
            $.post("entity/delete", params, function (result) {
                if (result.code === 203) { //会话失效
                    return;
                }
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message);
                }
            });
        };
        /**
         * 还原实体回收站中的数据
         * @param params 接口参数
         * @param callBack 回调函数 callBack(result.success, result.message)
         */
        Server.rebackEntity = function (params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可还原数据！");
                return;
            }
            $.post("entity/reback", params, function (result) {
                if (result.code === 203) { //会话失效
                    return;
                }
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message);
                }
            });
        };
        /**
         * 复制实体数据
         * @param params 接口参数
         * @param callBack 回调函数  callBack(true, result.message)
         */
        Server.copyEntity = function (params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可复制数据！");
                return;
            }
            $.post("entity/copy", params, function (result) {
                if (result.code === 203) { //会话失效
                    return;
                }
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.message);
                    }
                    else {
                        callBack(false, result.message);
                    }
                }
            });
        };
        /**
         * 清空实体表格中的数据
         * @param params 接口参数
         * @param callBack 回调函数 callBack(true, result.message)
         */
        Server.clearEntity = function (params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可复制数据！");
                return;
            }
            $.post("entity/clear", params, function (result) {
                if (result.code === 203) { //会话失效
                    return;
                }
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.message);
                    }
                    else {
                        callBack(false, result.message);
                    }
                }
            });
        };
        /**
         * 获取和ExtJs相关的系统配置
         * @param key 配置的key
         * @param type 配置类型
         * @param callBack 回调函数 callBack(true, result.data.configValue, result.message)
         */
        Server.showExtConfig = function (key, type, callBack) {
            if (FastExt.Power.isPower()) {
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
                        callBack(true, result.data.configValue, result.message);
                    }
                    else {
                        callBack(false, null, result.message);
                    }
                }
            });
        };
        /**
         * 保存和ExtJs相关的系统配置
         * @param key 配置的key
         * @param type 配置的类型
         * @param value 配置的数据
         * @param callBack 回调函数
         * @param otherParams 其他附带参数  callBack(true, result.message)
         */
        Server.saveExtConfig = function (key, type, value, callBack, otherParams) {
            if (FastExt.Power.isPower()) {
                callBack(false);
                return;
            }
            var params = {
                "configKey": key,
                "configType": type,
                "configValue": value
            };
            if (!Ext.isEmpty(otherParams)) {
                params = FastExt.Json.mergeJson(params, otherParams);
            }
            $.post("ext/config/saveExtConfig", params, function (result) {
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.message);
                    }
                    else {
                        callBack(false, result.message);
                    }
                }
            });
        };
        /**
         * 删除和ExtJs相关的系统配置
         * @param key 配置的key
         * @param type 配置类型
         * @param callBack 回调函数 callBack(true, result.message)
         */
        Server.deleteExtConfig = function (key, type, callBack) {
            if (FastExt.Power.isPower()) {
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
                        callBack(true, result.message);
                    }
                    else {
                        callBack(false, result.message);
                    }
                }
            });
        };
        /**
         * 导出数据
         * @param params 接口参数
         * @param callBack 回调函数 callBack(true, result.data, result.message)
         */
        Server.exportExcel = function (params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可导出数据！");
                return;
            }
            $.post("entity/export", params, function (result) {
                if (result.code === 203) { //会话失效
                    return;
                }
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.data, result.message);
                    }
                    else {
                        callBack(false, null, result.message);
                    }
                }
            });
        };
        /**
         * 获取实体表格数据导入的excel模板
         * @param params 接口参数
         * @param callBack 回调函数 callBack(true, result.data, result.message)
         */
        Server.excelModule = function (params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可生成模板！");
                return;
            }
            $.post("entity/module", params, function (result) {
                if (result.code === 203) { //会话失效
                    return;
                }
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.data, result.message);
                    }
                    else {
                        callBack(false, null, result.message);
                    }
                }
            });
        };
        /**
         * 获取实体类对应grid保存的列记录
         * @param entityCode 实体编号
         * @param callBack 回调函数 callBack(true, result.data.configValue, result.message)
         */
        Server.showColumns = function (entityCode, callBack) {
            $.post("ext/config/showEntityColumn?entityCode=" + entityCode, function (result) {
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.data.configValue, result.message);
                    }
                    else {
                        callBack(false, null, result.message);
                    }
                }
            });
        };
        /**
         * 获取服务器web/icons文件下的icon接口路径
         * @param iconName 图片名称
         * @param color 图片颜色，针对.svg格式有效
         */
        Server.getIcon = function (iconName, color) {
            var iconPath = "icons/" + iconName;
            if (Ext.isEmpty(color)) {
                return iconPath;
            }
            if (color.startWith("#")) {
                color = color.substring(1);
            }
            return "icon?path=" + iconPath + "&color=" + color;
        };
        /**
         * 获取系统配置
         * @param callBack 回调函数 callBack(true, result.data, result.message)
         */
        Server.showSystemConfig = function (callBack) {
            $.post("ext/config/showSystemConfig", function (result) {
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.data, result.message);
                    }
                    else {
                        callBack(false, null, result.message);
                    }
                }
            });
        };
        /**
         * 删除系统配置
         * @param callBack 回调函数 callBack(result.success, result.message)
         */
        Server.deleteSystemConfig = function (callBack) {
            $.post("ext/config/deleteSystemConfig", function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message);
                }
            });
        };
        /**
         * 获取系统服务器的监控信息
         * @param callBack 回调函数 callBack(result.success, result.data);
         */
        Server.loadMonitor = function (callBack) {
            $.post("monitor", function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.data);
                }
            });
        };
        /**
         * 统计上报系统的问题
         * @param callBack 回调函数 callBack(result.success, result.data);
         */
        Server.countReport = function (callBack) {
            $.post("countReport", function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.data);
                }
            });
        };
        /**
         * 检查系统待办事项
         * @param params 接口参数
         * @param callBack 回调函数 callBack(result.success, result.data);
         */
        Server.checkWaitNotice = function (params, callBack) {
            Server.setSilence(true);
            $.post("controller/waitNotice", params, function (result) {
                Server.setSilence(false);
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.data);
                }
            });
        };
        /**
         * 标记待办事项已完成
         * @param noticeId 待办事项ID
         * @param callBack 回调函数 callBack(result.success, result.message, result.data);
         */
        Server.doneWaitNotice = function (noticeId, callBack) {
            $.post("controller/doneNotice", { "noticeId": noticeId }, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        };
        /**
         * 清除系统待办事项
         * @param callBack 回调函数 callBack(result.success, result.message, result.data);
         */
        Server.clearWaitNotice = function (callBack) {
            $.post("controller/clearNotice", function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        };
        return Server;
    }());
    FastExt.Server = Server;
})(FastExt || (FastExt = {}));
