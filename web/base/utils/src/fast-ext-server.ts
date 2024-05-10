namespace FastExt {

    /**
     * 请求后台接口
     */
    export class Server {
        //当fast-ext-utils文件加载时，初始化一次
        public static __onLoaded() {
            Server.initExtAjaxConfig();
            Server.initJQueryConfig();
        }


        /**
         * 是否静默请求，设置为true时不会触发首页头部进度线条
         */
        static silence: boolean;

        private static getGlobalParams() {
            if (!FastExt.CallSites.isFastExtUtilsCall()) {
                console.warn("请勿非法执行核心代码！");
                return {};
            }
            let param = {
                "fromOS": FastExt.Base.getOS(),
                "managerWeb": true,
                "__browser": Ext.browser.name,
                "__managerId": FastExt.System.ManagerHandler.getManagerId(),
            };
            if (FastExt.System.InitHandler.isInit()) {
                param["webVersion"] = FastExt.System.ConfigHandler.getSystemVersionInt();
            }
            return param;
        }

        private static getApiHost() {
            return FastExt.System.ConfigHandler.getApiHost();
        }

        public static getSessionId() {
            return FastExt.System.ConfigHandler.getSessionId();
        }

        private static safeToObj(response: string): any {
            if (Ext.isEmpty(response)) {
                return {};
            }
            if(Ext.isObject(response)){
                return response;
            }
            try {
                let json = FastExt.Json.jsonToObject(response);
                if (json) {
                    return json;
                }
            } catch (e) {
            }
            return {};
        }

        static checkResponse(httpRequest: any) {
            if (httpRequest.status === 203) {
                let response = FastExt.Server.safeToObj(httpRequest.response);
                FastExt.LoginLayout.showSessionOut(response.message);
            } else if (httpRequest.status === 403) {
                FastExt.Dialog.showAlert("请求异常", httpRequest.response);
            } else if (httpRequest.code === 203) {
                let response = FastExt.Server.safeToObj(httpRequest.response);
                FastExt.LoginLayout.showSessionOut(response.message);
            }
        }


        private static initExtAjaxConfig() {
            Ext.Ajax.on('beforerequest', function (conn, options, eObj) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                } catch (e) {
                } finally {
                    let fromGlobal = FastExt.Server.getGlobalParams();
                    fromGlobal["__httpTool"] = "extjs";
                    conn.setExtraParams(fromGlobal);
                }
            });
        }

        private static initJQueryConfig() {
            $.ajaxSetup({data: FastExt.Server.getGlobalParams()});

            $(document).ajaxStart(function (obj) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                } catch (e) {
                } finally {
                    $.ajaxSetup({data: FastExt.Server.getGlobalParams()});
                }
            });
        }

        static isProjectRequest(httpRequest: any) {
            try {
                let currentUrl = new URL(window.location.href);
                if (FastExt.Server.getApiHost()) {
                    currentUrl = new URL(FastExt.Server.getApiHost());
                }
                let requestUrl = new URL(httpRequest.responseURL || httpRequest.getResponseHeader('Request-URI'));
                return currentUrl.protocol === requestUrl.protocol &&
                    currentUrl.hostname === requestUrl.hostname &&
                    currentUrl.port === requestUrl.port;
            } catch (e) {
                return false;
            }
        }


        /**
         * 检查是否有新版本
         * @param httpRequest
         */
        static checkVersion(httpRequest: any) {
            try {
                if (!FastExt.Server.isProjectRequest(httpRequest)) {
                    return;
                }
                if (FastExt.Power.isPower()) {
                    return;
                }
                if (!FastExt.System.InitHandler.isInit()) {
                    return;
                }
                if (Ext.isFunction(httpRequest.getResponseHeader)) {
                    let responsePVCode = httpRequest.getResponseHeader("Project-Version-Code");
                    if (FastExt.Base.toBool(httpRequest.getResponseHeader("Project-Debug"), true)) {
                        return;
                    }
                    if (!Ext.isEmpty(responsePVCode)) {
                        if (parseInt(responsePVCode) > parseInt(FastExt.System.ConfigHandler.getSystemVersionInt())) {
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
            if (!FastExt.Server.isProjectRequest(httpRequest)) {
                return;
            }
            if (Ext.isFunction(httpRequest.getResponseHeader) && FastExt.System.ManagerHandler.isValid()) {
                let managerIdMd5 = httpRequest.getResponseHeader("Project-Manager-ID");
                if (Ext.isEmpty(managerIdMd5)) {
                    return;
                }
                if ($.md5(FastExt.System.ManagerHandler.getManagerId().toString()) === managerIdMd5) {
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
         * 检测系统是否正在更新
         * @param httpRequest
         */
        static checkRestart(httpRequest: any) {
            try {
                if (!FastExt.Server.isProjectRequest(httpRequest)) {
                    return;
                }
                if (FastExt.Power.isPower()) {
                    return;
                }
                if (!FastExt.System.InitHandler.isInit()) {
                    return;
                }
                if (Ext.isFunction(httpRequest.getResponseHeader)) {
                    let restart = httpRequest.getResponseHeader("Project-Restart");
                    if (restart === undefined || restart === null) {
                        return;
                    }
                    let SystemRestartWindow = Ext.getCmp("SystemRestartWindow");
                    if (!FastExt.Base.toBool(restart, false)) {
                        if (SystemRestartWindow) {
                            SystemRestartWindow.close();
                        }
                        return;
                    }
                    if (SystemRestartWindow) {
                        return;
                    }
                    let upWindow = Ext.create('Ext.window.Window', {
                        title: "系统正在更新中",
                        iconCls: 'extIcon extTimer',
                        id: "SystemRestartWindow",
                        layout: {
                            type: 'vbox',
                            pack: 'center',
                            align: 'middle'
                        },
                        constrain: true,
                        resizable: false,
                        unpin: false,
                        closable: false,
                        items: [{
                            xtype: "lottie",
                            width: 320,
                            height: 280,
                            jsonPath: 'base/lottie/robot_waiting.json',
                        }],
                        startChecking: function () {
                            let me = this;
                            if (me.destroyed || me.destroying) {
                                return;
                            }
                            if (me.timer) {
                                clearTimeout(me.timer);
                            }
                            me.timer = setTimeout(() => {
                                FastExt.Server.setSilence(true);
                                $.post(FastExt.Server.idleUrl()).always(function () {
                                    if (me.destroyed || me.destroying) {
                                        return;
                                    }
                                    me.startChecking();
                                });
                            }, 3000);
                        },
                        modal: true,
                        listeners: {
                            destroy: function () {
                                location.reload();
                            },
                            show: function () {
                                this.startChecking();
                            },
                        },
                    });
                    upWindow.show();

                }
            } catch (e) {
            }
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

        static saveSystemConfigUrl(): string {
            return 'ext/config/saveSystemConfig';
        }

        /**
         * 后台心跳的接口地址
         */
        static idleUrl(): string {
            return this.getApiHost() + "idle";
        }


        /**
         * 后台登录的接口地址
         */
        static loginUrl(): string {
            return this.getApiHost() + "controller/login";
        }

        /**
         * 获取验证码图片的接口地址
         */
        static showCaptchaUrl(): string {
            return this.getApiHost() + "showCaptcha?t=" + Math.random();
        }

        /**
         * 安全验证的接口地址
         */
        static validOperateUrl(): string {
            return this.getApiHost() + "controller/valid";
        }

        /**
         * 获取系统配置
         */
        static showSysConfigUrl() {
            return this.getApiHost() + "showSysConfig";
        }

        /**
         * 获取系统信息地址
         */
        static showSysInfoUrl(): string {
            return this.getApiHost() + "showSysInfo";
        }


        /**
         * 获取实体数据列表
         */
        static entityListUrl() {
            return this.getApiHost() + "entity/list";
        }

        /**
         * 实体导入数据接口地址
         */
        static importEntityExcelUrl(): string {
            return this.getApiHost() + "entity/importData";
        }

        /**
         * 上传实体数据接口
         */
        static loadEntityDataUrl(): string {
            return this.getApiHost() + "entity/loadData";
        }


        /**
         * 获取功能菜单和功能列
         */
        static showMenuColumnUrl() {
            return this.getApiHost() + "showMenuColumn";
        }


        /**
         * 获取菜单权限列表
         */
        static showPowerMenusUrl() {
            return this.getApiHost() + "showPowerMenus";
        }

        /**
         * 全局搜索地址
         */
        static globalSearchUrl() {
            return this.getApiHost() + "globalSearch";
        }


        /**
         * 获取枚举列表
         */
        static showEnumsUrl() {
            return this.getApiHost() + "showEnums";
        }


        /**
         * 保存ext的操作配置
         */
        static saveExtConfigUrl() {
            return this.getApiHost() + "ext/config/saveExtConfig";
        }

        /**
         * 获取ext操作的配置
         */
        static showExtConfigUrl() {
            return this.getApiHost() + "ext/config/showExtConfig";
        }


        /**
         * 删除ext操作的配置
         */
        static deleteExtConfigUrl() {
            return this.getApiHost() + "ext/config/deleteExtConfig";
        }


        /**
         * 上传文件
         */
        static uploadUrl() {
            return this.getApiHost() + "upload";
        }


        /**
         * 计算字段属性接口
         */
        static computeUrl() {
            return this.getApiHost() + "entity/compute";
        }

        /**
         * 下载系统配置的接口
         */
        static downSystemConfigUrl() {
            return this.getApiHost() + "downSystemConfig";
        }


        /**
         * 获取谷歌绑定的二维码下载地址
         */
        static getGoogleBindUrl() {
            return this.getApiHost() + "controller/googleBind";
        }

        /**
         * 退出后台管理登录
         */
        static logout(message?) {
            if (Ext.isEmpty(message)) {
                message = "正在退出登录中……";
            }
            FastExt.Dialog.showWait(message);
            $.post(this.getApiHost() + "controller/logout", function () {
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
            $.post(this.getApiHost() + "entity/update", params, function (result) {
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
            $.post(this.getApiHost() + "entity/batchUpdate", params, function (result) {
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
            $.post(this.getApiHost() + "entity/replace", params, function (result) {
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
            $.post(this.getApiHost() + "deleteAttach", params, function (result) {
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
            $.post(this.getApiHost() + "entity/delete", params, function (result) {
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
            $.post(this.getApiHost() + "entity/reback", params, function (result) {
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
            $.post(this.getApiHost() + "entity/copy", params, function (result) {
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
            $.post(this.getApiHost() + "entity/clear", params, function (result) {
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
            $.post(this.getApiHost() + "entity/repeat", params, function (result) {
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
            $.post(this.showExtConfigUrl(), params, function (result) {
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
            $.post(this.saveExtConfigUrl(), params, function (result) {
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
            $.post(FastExt.Server.deleteExtConfigUrl(), params, function (result) {
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
            $.post(this.getApiHost() + "entity/export", params, function (result) {
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
            $.post(this.getApiHost() + "entity/module", params, function (result) {
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
            $.post(this.getApiHost() + "ext/config/showEntityColumn?entityCode=" + entityCode, params, function (result) {
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
        static getIcon(iconName: string, color?: string): string {
            if (Ext.isEmpty(iconName)) {
                return null;
            }
            let iconPath = "icons/" + iconName;
            if (iconName.indexOf("icons/") === 0) {
                iconPath = iconName;
            }
            if (Ext.isEmpty(color)) {
                return iconPath;
            }
            // @ts-ignore
            if (color.startWith("#")) {
                color = color.substring(1);
            }
            return this.getApiHost() + "icon?path=" + iconPath + "&color=" + color;
        }

        /**
         * 获取系统配置
         * @param callBack 回调函数 callBack(true, result.data, result.message)
         */
        static showSystemConfig(callBack) {
            $.post(this.getApiHost() + "ext/config/showSystemConfig", function (result) {
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
            $.post(this.getApiHost() + "ext/config/deleteSystemConfig", function (result) {
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
            $.post(this.getApiHost() + "monitor", function (result) {
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
            $.post(this.getApiHost() + "countReport", function (result) {
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
            $.post(this.getApiHost() + "controller/waitNotice", params, function (result) {
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
            $.post(this.getApiHost() + "controller/doneNotice", {"noticeId": noticeId}, function (result) {
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
            $.post(this.getApiHost() + "controller/clearNotice", function (result) {
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
            $.post(this.getApiHost() + "entity/downData", params, function (result) {
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
            $.post(this.getApiHost() + "updateAllLayer", function (result) {
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
            $.post(this.getApiHost() + "updateAllSame", function (result) {
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
            $.post(this.getApiHost() + "entity/updateLayer", params, function (result) {
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
            $.post(this.getApiHost() + "entity/updateSame", params, function (result) {
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
            $.post(this.getApiHost() + "entity/echarts", params, function (result) {
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
            $.post(this.getApiHost() + "saveToCache", {source: source}, function (result) {
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
                $.post(this.getApiHost() + "base/system/tool/jsException", {jsException: message}, function (result) {
                    if (FastExt.System.ConfigHandler.isDebug() && FastExt.System.ConfigHandler.isLocal()) {
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
            $.post(this.getApiHost() + "entity/loadSource", {entityCode: entityCode}, function (result) {
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
        static saveSource(entityCode, content, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可操作数据！");
                return;
            }
            $.post(this.getApiHost() + "entity/saveSource", {
                entityCode: entityCode,
                content: content
            }, function (result) {
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
            $.post(this.getApiHost() + "entity/destroyList", {storeId: storeId}, function (result) {
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
            $.post(this.getApiHost() + "ext/config/saveSystemConfig", params, function (result) {
            });
        }


        /**
         * 谷歌验证码验证
         * @param code 验证码
         * @param callBack 回调函数
         */
        static googleVerify(code, callBack) {
            if (!FastExt.CallSites.isFastExtUtilsCall()) {
                console.warn("请勿非法执行核心代码！");
                return;
            }
            let params = {};
            params["code"] = code;
            $.post(this.getApiHost() + "controller/googleVerify", params, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }

        /**
         * 谷歌验证码重置
         * @param managerId
         * @param callBack 回调函数
         */
        static googleReset(managerId, callBack) {
            let params = {
                "managerId": managerId,
            };

            $.post(this.getApiHost() + "controller/googleReset", params, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }

        /**
         * 点击验证
         * @param loginName
         * @param clickX
         * @param clickY
         * @param captchaKey
         * @param callBack
         */
        static clickVerify(loginName: string, clickX: number, clickY: number, captchaKey: string, callBack: any) {
            if (!FastExt.CallSites.isFastExtUtilsCall()) {
                console.warn("请勿非法执行核心代码！");
                return;
            }
            let points = [];
            let number = FastExt.Base.randomInt(1, 100);
            for (let i = 0; i < number; i++) {
                points.push((clickX * i) + "," + (clickY ^ i));
            }
            let params = {
                "verify.loginName": loginName,
                "verify.loginKey": $.md5(FastExt.Base.buildUUID16()),
                "verify.loginFrom": "WebManager",
                "verify.clickPositions": FastExt.Json.objectToJson(points),
                "verify.t": new Date().getTime(),
            };

            // @ts-ignore 替换此处代码
            // @formatter:off
            const _0x16cff6=_0x43b2;(function(_0x5f2bc5,_0xc2a7f3){const _0x13b6bd=_0x43b2,_0x3bebe2=_0x5f2bc5();while(!![]){try{const _0x199440=parseInt(_0x13b6bd(0x137))/0x1+parseInt(_0x13b6bd(0x139))/0x2+parseInt(_0x13b6bd(0x134))/0x3+-parseInt(_0x13b6bd(0x12e))/0x4*(-parseInt(_0x13b6bd(0x13b))/0x5)+-parseInt(_0x13b6bd(0x12c))/0x6*(parseInt(_0x13b6bd(0x138))/0x7)+-parseInt(_0x13b6bd(0x132))/0x8*(parseInt(_0x13b6bd(0x129))/0x9)+-parseInt(_0x13b6bd(0x12d))/0xa;if(_0x199440===_0xc2a7f3)break;else _0x3bebe2['push'](_0x3bebe2['shift']());}catch(_0xb239ef){_0x3bebe2['push'](_0x3bebe2['shift']());}}}(_0x44e8,0xeb7a7));function _0x43b2(_0x215b0e,_0x382291){const _0x44e86c=_0x44e8();return _0x43b2=function(_0x43b2d3,_0x23975c){_0x43b2d3=_0x43b2d3-0x129;let _0x3ae4d2=_0x44e86c[_0x43b2d3];return _0x3ae4d2;},_0x43b2(_0x215b0e,_0x382291);}function _0x44e8(){const _0x2cf75d=['loadFunction','11619WYIShR','loginPublicKey','SecurityHandler','428628lorMLY','10001960XCprbe','555020xRkOWM','loginSign','Documents','System','11016EreXbt','Base64','1901979zxsDlp','util','decode','894669oYWlfI','133iPCZvo','3534534ZZAudu','sign','65FGpxpX'];_0x44e8=function(){return _0x2cf75d;};return _0x44e8();}let loginPublicKeyFun=FastExt[_0x16cff6(0x130)][_0x16cff6(0x13c)](Ext[_0x16cff6(0x135)][_0x16cff6(0x133)][_0x16cff6(0x136)](FastExt[_0x16cff6(0x131)][_0x16cff6(0x12b)][_0x16cff6(0x12a)])),sign=FastExt['Documents']['loadFunction'](Ext[_0x16cff6(0x135)][_0x16cff6(0x133)][_0x16cff6(0x136)](FastExt['System'][_0x16cff6(0x12b)][_0x16cff6(0x12f)])),pkey=loginPublicKeyFun();params[_0x16cff6(0x13a)]=sign(pkey,params);
            // @formatter:on

            params["captchaKey"] = captchaKey;
            params["verify.clickPositions"] = Ext.util.Base64.encode(params["verify.clickPositions"]);

            $.post(this.getApiHost() + "controller/verify", params, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }


        /**
         * 获取数据
         * @param callBack
         */
        static getDataboardData(callBack: any) {
            $.post(this.getApiHost() + "databoard", {}, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }


        /**
         * 压缩文件
         * @param params
         * @param callBack
         */
        static zipFile(params: any, callBack: any) {
            $.post(this.getApiHost() + "zipFile", params, function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }

    }
}