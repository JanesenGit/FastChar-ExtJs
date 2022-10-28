namespace FastExt {

    /**
     * 请求后台接口
     */
    export class Server {
        private constructor() {
            Server.initExtAjaxConfig();
            Server.initJQueryConfig();
        }


        /**
         * 是否静默请求，设置为true时不会触发首页头部进度线条
         */
        static silence: boolean;

        private static getGlobalParams() {
            return {
                "fromOS": FastExt.Base.getOS(),
                "managerWeb": true,
                "webVersion": FastExt.System.getExt("version").value,
                "__browser": Ext.browser.name,
                "__managerId": FastExt.System.getManagerId(),
            };
        }

        private static initExtAjaxConfig() {
            Ext.Ajax.on('beforerequest', function (conn, options, eObj) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    FastExt.System.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).set(0);
                    FastExt.System.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(0.7);
                } catch (e) {
                } finally {
                    let fromGlobal = FastExt.Server.getGlobalParams();
                    fromGlobal["__httpTool"] = "extjs";
                    conn.setExtraParams(fromGlobal);
                }
            });

            Ext.Ajax.on('requestcomplete', function (conn, response, options) {
                try {
                    if (response.status === 203) {
                        FastExt.System.sessionOut();
                    } else if (response.status === 204) {
                        FastExt.System.sessionOut("您的账户已在其他终端登录！");
                    } else if (response.status === 403) {
                        FastExt.Dialog.showAlert("请求异常", response.responseText);
                    } else {
                        try {
                            let jsonData = eval("(" + response.responseText + ")");
                            if (jsonData.code === 203 || jsonData.code === 204) {
                                FastExt.System.sessionOut(jsonData.message);
                            }
                        } catch (e) {
                        }
                    }
                } catch (e) {
                } finally {
                    FastExt.System.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(1);
                    FastExt.Server.checkVersion(response);
                    FastExt.Server.checkManager(response);
                }
            });

            Ext.Ajax.on('requestexception', function (conn, response, options, eOpts) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    FastExt.Dialog.showException(response.responseText, "请求异常！");
                } catch (e) {
                } finally {
                    FastExt.System.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(1);
                }
            });
        }

        private static initJQueryConfig() {

            $(document).ajaxStart(function (obj) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    FastExt.System.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).set(0);
                    FastExt.System.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(0.7);
                } catch (e) {
                }finally {
                    $.ajaxSetup({data: FastExt.Server.getGlobalParams()});
                }
            });

            $(document).ajaxComplete(function (event, xhr, options) {
                try {
                    if (xhr.status === 203) {
                        FastExt.System.sessionOut();
                    } else if (xhr.status === 204) {
                        FastExt.System.sessionOut("您的账户已在其他终端登录！");
                    } else if (xhr.status === 403) {
                        FastExt.Dialog.showAlert("请求异常", xhr.responseText);
                    } else {
                        try {
                            let jsonData = eval("(" + xhr.responseText + ")");
                            if (jsonData.code === 203 || jsonData.code === 204) {
                                FastExt.System.sessionOut(jsonData.message);
                            }
                        } catch (e) {
                        }
                    }
                } catch (e) {
                } finally {
                    FastExt.System.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(1);
                    FastExt.Server.checkVersion(xhr);
                    FastExt.Server.checkManager(xhr);
                }
            });

            $(document).ajaxError(function (event, xhr, settings) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    FastExt.Dialog.showException(xhr.responseText, "请求异常");
                } catch (e) {
                } finally {
                    FastExt.System.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(1);
                }
            });
        }



        /**
         * 检查是否有新版本
         * @param httpRequest
         */
        static checkVersion(httpRequest: any) {
            try {
                if (FastExt.Power.isPower()) {
                    return;
                }
                if (Ext.isFunction(httpRequest.getResponseHeader)) {
                    let responsePVCode = httpRequest.getResponseHeader("Project-Version-Code");
                    if (FastExt.Base.toBool(httpRequest.getResponseHeader("Project-Debug"), true)) {
                        return;
                    }
                    if (!Ext.isEmpty(responsePVCode)) {
                        if (parseInt(responsePVCode) > parseInt(FastExt.System.getExt("version").value)) {
                            // noinspection JSJQueryEfficiency
                            if ($("#newVersionTip").length > 0) {
                                return;
                            }

                            $("body").append($("<div id='newVersionTip' style='position: fixed;right: 50px;bottom: 50px;width: 160px;height: 160px;" +
                                "z-index: 2147483647;" +
                                "cursor: pointer;'></div>"));
                            // noinspection JSJQueryEfficiency
                            let $newVersionTip = $("#newVersionTip");
                            FastExt.Lottie.loadJsonAnimByEl($newVersionTip[0], "base/lottie/new_version.json");
                            $newVersionTip.on("click", function () {
                                location.reload();
                            });
                        }
                    }
                }
            } catch (e) {
            }
        }

        /**
         * 检查登录的管理员信息是否已变更
         * @param httpRequest
         */
        static checkManager(httpRequest: any) {
            if (Ext.isFunction(httpRequest.getResponseHeader) && FastExt.System.manager) {
                let managerIdMd5 = httpRequest.getResponseHeader("Project-Manager-ID");
                if (Ext.isEmpty(managerIdMd5)) {
                    return;
                }
                if ($.md5(FastExt.System.getManagerId().toString()) === managerIdMd5) {
                    return;
                }
            } else {
                return;
            }

            if (Ext.getCmp("ManagerInfoChangeWin")) {
                return;
            }

            let formPanel = Ext.create('Ext.form.FormPanel', {
                bodyPadding: 5,
                method: 'POST',
                region: 'center',
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'middle'
                },
                defaults: {
                    margin: '5 5 5 5'
                },
                border: 0,
                items: [
                    {
                        xtype: "lottie",
                        width: 150,
                        height: 120,
                        jsonPath: 'base/lottie/error_normal.json',
                    },
                    {
                        xtype: "label",
                        maxWidth: 250,
                        margin: '5 5 10 5',
                        html: "系统检测到您的登录信息发生变化，建议您刷新页面！",
                    }],
            });

            let warnWindow = Ext.create('Ext.window.Window', {
                title: "账户提醒",
                iconCls: 'extIcon extManager',
                id: "ManagerInfoChangeWin",
                width: 280,
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'middle'
                },
                constrain: true,
                resizable: false,
                animateDisable: true,
                items: [formPanel],
                modal: true,
                buttons: [
                    '->',
                    {
                        text: '知道了',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            warnWindow.close();
                        }
                    },
                    {
                        text: "立即刷新",
                        iconCls: 'extIcon extReset',
                        handler: function () {
                            location.reload();
                        }
                    },
                    '->'
                ],

            });
            warnWindow.show();
        }

        /**
         * 是否是静默请求
         * @see FastExt.Server.silence
         */
        static isSilenceRequest(): boolean {
            return FastExt.Base.toBool(Server.silence, false);
        }

        /**
         * 设置请求是否为静默请求
         * @param value
         * @see FastExt.Server.silence
         */
        static setSilence(value: boolean) {
            Server.silence = value;
        }

        /**
         * 后台登录的接口地址
         */
        static loginUrl(): string {
            return "controller/login";
        }

        /**
         * 安全验证的接口地址
         */
        static validOperateUrl(): string {
            return "controller/valid";
        }

        /**
         * 获取系统配置接口地址
         */
        static showConfigUrl(): string {
            return "showConfig";
        }


        /**
         * 实体导入数据接口地址
         */
        static importEntityExcelUrl(): string {
            return "entity/importData";
        }

        /**
         * 上传实体数据接口
         */
        static loadEntityDataUrl(): string {
            return "entity/loadData";
        }

        /**
         * 退出后台管理登录
         */
        static logout(message?) {
            if (Ext.isEmpty(message)) {
                message = "正在退出登录中……";
            }
            FastExt.Dialog.showWait(message);
            $.post("controller/logout", function () {
                location.reload();
            });
        }

        /**
         * 提交更新FastEntity实体数据
         * @param params 接口参数
         * @param callBack 回调函数：callBack(true, result.message)
         */
        static updateEntity(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("entity/update", params, function (result) {
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
        }


        /**
         * 批量更新到数据库中
         * @param params
         * @param callBack
         */
        static updateDBEntity(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("entity/batchUpdate", params, function (result) {
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
        }


        /**
         * 批量更新到数据库中
         * @param params
         * @param callBack
         */
        static replaceDBEntity(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("entity/replace", params, function (result) {
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
        }

        /**
         * 删除附件地址
         * @param params 接口参数
         * @param callBack 回调函数 callBack(true, result.message)
         */
        static deleteAttach(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("deleteAttach", params, function (result) {
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
        }

        /**
         * 删除实体数据
         * @param params 接口参数
         * @param callBack 回调函数   callBack(result.success, result.message)
         */
        static deleteEntity(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
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
        }

        /**
         * 还原实体回收站中的数据
         * @param params 接口参数
         * @param callBack 回调函数 callBack(result.success, result.message)
         */
        static rebackEntity(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
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

        }


        /**
         * 复制实体数据
         * @param params 接口参数
         * @param callBack 回调函数  callBack(true, result.message)
         */
        static copyEntity(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
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
        }


        /**
         * 清空实体表格中的数据
         * @param params 接口参数
         * @param callBack 回调函数 callBack(true, result.message)
         */
        static clearEntity(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
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
        }

        /**
         * 清空实体表格中重复的数据
         * @param params 接口参数
         * @param callBack 回调函数 callBack(true, result.message)
         */
        static clearRepeatEntity(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("entity/repeat", params, function (result) {
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
        }


        /**
         * 获取和ExtJs相关的系统配置
         * @param key 配置的key
         * @param type 配置类型
         * @param callBack 回调函数 callBack(true, result.data.configValue, result.message)
         */
        static showExtConfig(key, type, callBack) {
            if (FastExt.Power.isPower()) {
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
                        callBack(true, result.data.configValue, result.message);
                    } else {
                        callBack(false, null, result.message);
                    }
                }
            });
        }


        /**
         * 保存和ExtJs相关的系统配置
         * @param key 配置的key
         * @param type 配置的类型
         * @param value 配置的数据
         * @param callBack 回调函数
         * @param otherParams 其他附带参数  callBack(true, result.message)
         */
        static saveExtConfig(key, type, value, callBack?, otherParams?) {
            if (FastExt.Power.isPower()) {
                callBack(false);
                return;
            }
            let params = {
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
                    } else {
                        callBack(false, result.message);
                    }
                }
            });
        }


        /**
         * 删除和ExtJs相关的系统配置
         * @param key 配置的key
         * @param type 配置类型
         * @param callBack 回调函数 callBack(true, result.message)
         */
        static deleteExtConfig(key, type, callBack?) {
            if (FastExt.Power.isPower()) {
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
                        callBack(true, result.message);
                    } else {
                        callBack(false, result.message);
                    }
                }
            });
        }

        /**
         * 导出数据
         * @param params 接口参数
         * @param callBack 回调函数 callBack(true, result.data, result.message)
         */
        static exportExcel(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("entity/export", params, function (result) {
                if (result.code === 203) {//会话失效
                    return;
                }
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.data, result.message);
                    } else {
                        callBack(false, null, result.message);
                    }
                }
            });
        }


        /**
         * 获取实体表格数据导入的excel模板
         * @param params 接口参数
         * @param callBack 回调函数 callBack(true, result.data, result.message)
         */
        static excelModule(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可生成模板！");
                return;
            }
            $.post("entity/module", params, function (result) {
                if (result.code === 203) {//会话失效
                    return;
                }
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.data, result.message);
                    } else {
                        callBack(false, null, result.message);
                    }
                }
            });
        }


        /**
         * 获取实体类对应grid保存的列记录
         * @param entityCode 实体编号
         * @param callBack 回调函数 callBack(true, result.data.configValue, result.message)
         * @param params 更多参数
         */
        static showColumns(entityCode, callBack, params?) {
            if (!params) {
                params = {};
            }
            $.post("ext/config/showEntityColumn?entityCode=" + entityCode, params, function (result) {
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.data.configValue, result.message);
                    } else {
                        callBack(false, null, result.message);
                    }
                }
            });
        }


        /**
         * 获取服务器web/icons文件下的icon接口路径
         * @param iconName 图片名称
         * @param color 图片颜色，针对.svg格式有效
         */
        static getIcon(iconName, color?): string {
            let iconPath = "icons/" + iconName;
            if (Ext.isEmpty(color)) {
                return iconPath;
            }
            if (color.startWith("#")) {
                color = color.substring(1);
            }
            return "icon?path=" + iconPath + "&color=" + color;
        }

        /**
         * 获取系统配置
         * @param callBack 回调函数 callBack(true, result.data, result.message)
         */
        static showSystemConfig(callBack) {
            $.post("ext/config/showSystemConfig", function (result) {
                if (Ext.isFunction(callBack)) {
                    if (result.success) {
                        callBack(true, result.data, result.message);
                    } else {
                        callBack(false, null, result.message);
                    }
                }
            });
        }

        /**
         * 删除系统配置
         * @param callBack 回调函数 callBack(result.success, result.message)
         */
        static deleteSystemConfig(callBack) {
            $.post("ext/config/deleteSystemConfig", function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message);
                }
            });
        }

        /**
         * 获取系统服务器的监控信息
         * @param callBack 回调函数 callBack(result.success, result.data);
         */
        static loadMonitor(callBack) {
            Server.setSilence(true);
            $.post("monitor", function (result) {
                Server.setSilence(false);
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.data);
                }
            });
        }

        /**
         * 统计上报系统的问题
         * @param callBack 回调函数 callBack(result.success, result.data);
         */
        static countReport(callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("countReport", function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.data);
                }
            });
        }

        /**
         * 检查系统待办事项
         * @param params 接口参数
         * @param callBack 回调函数 callBack(result.success, result.data);
         */
        static checkWaitNotice(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            Server.setSilence(true);
            $.post("controller/waitNotice", params, function (result) {
                Server.setSilence(false);
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.data);
                }
            });
        }

        /**
         * 标记待办事项已完成
         * @param noticeId 待办事项ID
         * @param callBack 回调函数 callBack(result.success, result.message, result.data);
         */
        static doneWaitNotice(noticeId, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("controller/doneNotice", {"noticeId": noticeId}, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }


        /**
         * 清除系统待办事项
         * @param callBack 回调函数 callBack(result.success, result.message, result.data);
         */
        static clearWaitNotice(callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("controller/clearNotice", function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }


        /**
         * 下载实体数据
         * @param params 接口参数
         * @param callBack 回调函数 callBack(result.success, result.message, result.data);
         */
        static downData(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("entity/downData", params, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }

        /**
         * 更新系统所有表格的数据层级权限值
         * @param callBack 回调函数 callBack(result.success, result.message);
         */
        static updateAllLayer(callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("updateAllLayer", function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message);
                }
            });
        }

        /**
         * 更新系统数据绑定
         * @param callBack 回调函数 callBack(result.success, result.message);
         */
        static updateAllSame(callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("updateAllSame", function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message);
                }
            });
        }

        /**
         * 更新指定实体表格的数据层级权限值
         * @param params 接口参数
         * @param callBack 回调函数 callBack(result.success, result.message);
         */
        static updateLayer(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("entity/updateLayer", params, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message);
                }
            });
        }


        /**
         * 更新指定实体表格的关系相同列值
         * @param params 接口参数
         * @param callBack 回调函数 callBack(result.success, result.message);
         */
        static updateSame(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("entity/updateSame", params, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message);
                }
            });
        }


        /**
         * 获取图表echarts的配置json数据
         * @param params 接口参数
         * @param callBack 回调函数 callBack(result.success, result.message);
         */
        static showEcharts(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("entity/echarts", params, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }


        /**
         * 保存原数据到缓存中
         * @param source
         * @param callBack
         */
        static saveCache(source, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("saveToCache", {source: source}, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }


        /**
         * 上报异常
         * @param message
         */
        static reportException(message: any) {
            try {
                if (Ext.isEmpty(message) || message === "null") {
                    return;
                }
                if (Ext.isObject(message)) {
                    message = FastExt.Json.objectToJson(message);
                }
                if (message.indexOf("表单填写不完整") >= 0) {
                    return;
                }
                $.post("base/system/tool/jsException", {jsException: message}, function (result) {
                    if (FastExt.System.isDebug() && FastExt.System.isLocal()) {
                        if (result.success) {
                            FastExt.Dialog.toast("已上报JS错误！");
                        }
                    }
                });
            } catch (e) {
            }
        }

        /**
         * 获取entityCode的源代码
         * @param entityCode
         * @param callBack
         */
        static loadSource(entityCode, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("entity/loadSource", {entityCode: entityCode}, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }


        /**
         * 保存entityCode源码
         * @param entityCode
         * @param content
         * @param callBack
         */
        static saveSource(entityCode, content,callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post("entity/saveSource", {entityCode: entityCode, content: content}, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }


        /**
         * 销毁list的sql语句
         * @param storeId
         */
        static destroyList(storeId) {
            if (FastExt.Power.isPower()) {
                return;
            }
            $.post("entity/destroyList", {storeId: storeId}, function (result) {
            });
        }


        /**
         * 保存系统配置
         * @param configKey
         * @param configValue
         */
        static saveSystemConfig(configKey, configValue) {
            let params = {};
            params[configKey] = configValue;
            $.post("ext/config/saveSystemConfig",params, function (result) {
            });
        }

    }
}