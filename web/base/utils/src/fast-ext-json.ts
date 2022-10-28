namespace FastExt {

    /**
     * JSON相关功能
     */
    export class Json {

        private constructor() {
        }

        /**
         * 将json字符串转成对象
         * @param jsonStr json字符串
         * @returns {Object}
         */
        static jsonToObject(jsonStr: string): any {
            try {
                return JSON.parse(jsonStr);
            } catch (e) {
            }
            return null;
        }

        /**
         * 将对象转成json字符串
         * @param jsonObj 待转换的对象
         * @returns {string}
         */
        static objectToJson(jsonObj: any): string {
            try {
                return JSON.stringify(jsonObj);
            } catch (e) {
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
        static mergeJson(jsonData1, jsonData2): any {
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
                    constrain: true,
                    buttons: [
                        {
                            text: '保留转义符',
                            iconCls: 'extIcon extConvertCode whiteColor',
                            handler: function () {
                                if (FastExt.Base.toBool(this.keepChar, false)) {
                                    let result = new JSONFormat(value, 4).toString();
                                    win.update("<div style='padding: 20px;'>" + result + "</div>");
                                    this.setText("保留转义符");
                                    this.keepChar = false;
                                }else{
                                    let newValue = value.replace(/\\/g, '\\\\');
                                    newValue = newValue.replace(/\\"/g, '\\\\"');
                                    let result = new JSONFormat(newValue, 4).toString();
                                    win.update("<div style='padding: 20px;'>" + result + "</div>");
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
                    ]
                });
                let result = new JSONFormat(value, 4).toString();
                win.update("<div style='padding: 20px;'>" + result + "</div>");
                win.show();
            } catch (e) {
                console.error(e);
                FastExt.Dialog.showText(obj, null, "查看数据", value);
            }
        }
    }

}