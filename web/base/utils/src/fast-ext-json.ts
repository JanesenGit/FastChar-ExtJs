namespace FastExt {

    /**
     * JSON相关功能
     */
    export class Json {
        static formatterJsPath = "base/json-formatter/json-formatter.min.js";

        static loaderFormatter(callBack: any) {
            FastExt.PluginLoader.loadPlugins("JsonFormatter", [FastExt.Json.formatterJsPath], callBack);
        }

        /**
         * 格式化json
         * @param jsonContent
         * @param keepChar 保留转义符
         * @param callBack
         */
        static toFormatJsonHtml(jsonContent: string, keepChar: boolean, callBack: any) {
            FastExt.Json.loaderFormatter(() => {
                if (keepChar) {
                    jsonContent = jsonContent.replace(/\\/g, '\\\\');
                    jsonContent = jsonContent.replace(/\\"/g, '\\\\"');
                }
                callBack(new JSONFormat(jsonContent, 4).toString());
            });
        }


        /**
         * 将json字符串转成对象
         * @param jsonStr json字符串
         * @param printException
         * @returns {Object}
         */
        static jsonToObject(jsonStr: string, printException?: boolean): any {
            try {
                if (Ext.isString(jsonStr)) {
                    return JSON.parse(jsonStr);
                }
                return jsonStr;
            } catch (e) {
                if (printException) {
                    console.warn(jsonStr);
                    console.error(e);
                }
            }
            return null;
        }

        /**
         * 将对象转成json字符串
         * @param jsonObj 待转换的对象
         * @param printException
         * @returns {string}
         */
        static objectToJson(jsonObj: any, printException?: boolean): string {
            try {
                return JSON.stringify(jsonObj);
            } catch (e) {
                if (printException) {
                    console.warn(jsonObj);
                    console.error(e);
                }
            }
            return null;
        }

        /**
         * 将对象转成json字符串，注意此方法将转换函数对象，慎用！
         * @param jsonObj 待转换的对象
         * @return {string}
         */
        static objectToJsonUnsafe(jsonObj: any): string {
            return JSON.stringify(jsonObj, function (key, val) {
                if (typeof val === 'function') {
                    return val.toString();
                }
                return val;
            });
        }

        /**
         * 将json字符串转成对象
         * @param jsonStr json字符串
         * @returns {Object}
         */
        static jsonToObjectUnsafe(jsonStr: string): any {
            try {
                return JSON.parse(jsonStr, function (k, v) {
                    if (v.indexOf && v.indexOf('function') > -1) {
                        // noinspection UnnecessaryReturnStatementJS
                        return eval("(function(){return " + v + " })()")
                    }
                    return v;
                });
            } catch (e) {
            }
            return null;
        }


        /**
         * 合并两个json对象
         * @param jsonData1 json对象
         * @param jsonData2 json对象
         * @return 合并后的新对象
         */
        static mergeJson(jsonData1: any, jsonData2: any): any {
            let newJsonData = {};
            if (!Ext.isEmpty(jsonData1)) {
                for (let property in jsonData1) {
                    newJsonData[property] = jsonData1[property];
                }
            }
            if (!Ext.isEmpty(jsonData2)) {
                for (let property in jsonData2) {
                    newJsonData[property] = jsonData2[property];
                }
            }
            return newJsonData;
        }


        /**
         * 合并两个json对象【深入合并】
         * @param jsonData1 json对象
         * @param jsonData2 json对象
         * @return 合并后的新对象
         */
        static deepMergeJson(jsonData1: any, jsonData2: any) {
            let newJsonData = {};
            if (!Ext.isEmpty(jsonData1)) {
                for (let property in jsonData1) {
                    newJsonData[property] = jsonData1[property];
                }
            }
            if (!Ext.isEmpty(jsonData2)) {
                for (let property in jsonData2) {
                    let value1 = newJsonData[property];
                    let value2 = jsonData2[property];
                    if (Ext.isArray(value1) && Ext.isArray(value2)) {
                        let newArray = [].concat(value2);
                        for (const newArrayElement of value1) {
                            if (newArray.indexOf(newArrayElement) >= 0) {
                                continue;
                            }
                            newArray.push(newArrayElement);
                        }
                        newJsonData[property] = newArray;
                    } else if (Ext.isObject(value1) && Ext.isObject(value2)) {
                        newJsonData[property] = FastExt.Json.deepMergeJson(value1, value2);
                    } else {
                        newJsonData[property] = value2;
                    }
                }
            }
            return newJsonData;
        }


        /**
         * 格式化显示json字符串
         * @param obj 动画对象
         * @param value json值
         * @param title 窗口标题
         */
        static showFormatJson(obj, value, title?) {
            try {
                if (obj && Ext.isFunction(obj.blur)) {
                    obj.blur();
                }
                if (Ext.isEmpty(title)) {
                    title = "查看JSON数据";
                }
                let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));
                let win = Ext.create('Ext.window.Window', {
                    title: title,
                    height: winHeight,
                    width: winWidth,
                    minHeight: 500,
                    minWidth: 600,
                    animateTarget: obj,
                    layout: 'fit',
                    resizable: true,
                    maximizable: true,
                    iconCls: 'extIcon extSee',
                    autoScroll: true,
                    modal: true,
                    bodyStyle: {
                        background: "#ffffff",
                    },
                    constrain: true,
                    buttons: [
                        {
                            text: '保留转义符',
                            iconCls: 'extIcon extConvertCode whiteColor',
                            handler: function () {
                                if (FastExt.Base.toBool(this.keepChar, false)) {
                                    FastExt.Json.toFormatJsonHtml(value, false, (jsonHtml) => {
                                        win.update("<div style='padding: 20px;'>" + jsonHtml + "</div>");
                                    });
                                    this.setText("保留转义符");
                                    this.keepChar = false;
                                } else {
                                    FastExt.Json.toFormatJsonHtml(value, true, (jsonHtml) => {
                                        win.update("<div style='padding: 20px;'>" + jsonHtml + "</div>");
                                    });
                                    this.setText("解析转义符");
                                    this.keepChar = true;
                                }
                            }
                        },
                        '->'
                        ,
                        {
                            text: '复制JSON数据',
                            iconCls: 'extIcon extCopy2 whiteColor',
                            handler: function () {
                                FastExt.Dialog.toast("复制成功！");
                                FastExt.Base.copyToBoard(value);
                            }
                        }
                    ],
                    listeners: {
                        show: function () {
                            this.setLoading("格式化中，请稍后……");
                            FastExt.Json.toFormatJsonHtml(value, false, (jsonHtml) => {
                                this.setLoading(false);
                                this.update("<div style='padding: 20px;'>" + jsonHtml + "</div>");
                            });
                        },
                    }
                });
                win.show();
            } catch (e) {
                console.error(e);
                FastExt.Dialog.showText(obj, null, "查看数据", value);
            }
        }
    }

}