namespace FastExt {

    /**
     * 请求后台接口
     */
    export class Server {
        private constructor() {
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
                } catch (e) {
                }
            });
        }


        /**
         * 是否静默请求，设置为true时不会触发首页头部进度线条
         */
        static silence: boolean;

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
        static setSilence(value:boolean) {
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
         * 退出后台管理登录
         */
        static logout() {
            FastExt.Dialog.showWait("正在退出登录中……");
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
                callBack(false, "当前正在进行界面权限配置，不可修改数据！");
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
         * 删除附件地址
         * @param params 接口参数
         * @param callBack 回调函数 callBack(true, result.message)
         */
        static deleteAttach(params, callBack) {
            if (FastExt.Power.isPower()) {
                callBack(false, "当前正在进行界面权限配置，不可删除数据！");
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
        }

        /**
         * 还原实体回收站中的数据
         * @param params 接口参数
         * @param callBack 回调函数 callBack(result.success, result.message)
         */
        static rebackEntity(params, callBack) {
            if (FastExt.Power.isPower()) {
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

        }


        /**
         * 复制实体数据
         * @param params 接口参数
         * @param callBack 回调函数  callBack(true, result.message)
         */
        static copyEntity(params, callBack) {
            if (FastExt.Power.isPower()) {
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
        }


        /**
         * 清空实体表格中的数据
         * @param params 接口参数
         * @param callBack 回调函数 callBack(true, result.message)
         */
        static clearEntity(params, callBack) {
            if (FastExt.Power.isPower()) {
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
                callBack(false, "当前正在进行界面权限配置，不可导出数据！");
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
         */
        static showColumns(entityCode, callBack) {
            $.post("ext/config/showEntityColumn?entityCode=" + entityCode, function (result) {
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
            $.post("monitor", function (result) {
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
            $.post("controller/clearNotice", function (result) {
                if (Ext.isFunction(callBack)) {
                    callBack(result.success, result.message, result.data);
                }
            });
        }

    }
}