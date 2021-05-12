namespace FastExt {
    /**
     * 常规功能方法
     */
    export class Base {
        private constructor() {
        }

        /**
         * 获取浏览器的操作系统
         */
        static getOS(): string {
            try {
                let sUserAgent = navigator.userAgent;
                let isWin = (navigator.platform === "Win32") || (navigator.platform === "Windows");
                let isMac = (navigator.platform === "Mac68K") || (navigator.platform === "MacPPC") || (navigator.platform === "Macintosh") || (navigator.platform === "MacIntel");
                if (isMac) return "Mac";
                let isUnix = (navigator.platform === "X11") && !isWin && !isMac;
                if (isUnix) return "Unix";
                let isLinux = (String(navigator.platform).indexOf("Linux") > -1);
                if (isLinux) return "Linux";
                if (isWin) {
                    let isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
                    if (isWin2K) return "Windows 2000";
                    let isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
                    if (isWinXP) return "Windows XP";
                    let isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
                    if (isWin2003) return "Windows 2003";
                    let isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
                    if (isWinVista) return "Windows Vista";
                    let isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
                    if (isWin7) return "Windows 7";
                    let isWin8 = sUserAgent.indexOf("Windows NT 8.0") > -1 || sUserAgent.indexOf("Windows 8") > -1;
                    if (isWin8) return "Windows 8";
                    let isWin10 = sUserAgent.indexOf("Windows NT 10.0") > -1 || sUserAgent.indexOf("Windows 10") > -1;
                    if (isWin10) return "Windows 10";
                    return "Windows";
                }
            } catch (e) {
            }
            return "Other";
        }

        /**
         * 转换bool值
         * @param obj 带转换的对象
         * @param defaultValue 默认值
         */
        static toBool(obj, defaultValue?): boolean {
            if (Ext.isEmpty(defaultValue)) {
                defaultValue = false;
            }
            if (Ext.isEmpty(obj)) {
                return defaultValue;
            }

            if (Ext.isString(obj)) {
                if (obj === "0") {
                    return false;
                }
                if (obj === "1") {
                    return true;
                }
            }
            if (Ext.isNumber(obj)) {
                if (obj === 0) {
                    return false;
                }
                if (obj === 1) {
                    return true;
                }
            }
            if (Ext.isBoolean(obj)) {
                return obj;
            }
            return Boolean(obj);
        }

        /**
         * 复制文本到剪贴板里
         * @param content 内容
         */
        static copyToBoard(content: string): void {
            let oInput = document.createElement('input');
            oInput.value = content;
            document.body.appendChild(oInput);
            oInput.select();
            document.execCommand("Copy");
            oInput.style.display = 'none';
            $(oInput).remove();
        }

        /**
         * 浅复制对象
         * @param obj 待复制的对象
         */
        static copy(obj: any): any {
            let newObj = {};
            if (obj instanceof Array) {
                newObj = obj.concat();
            } else if (obj instanceof Function) {
                newObj = obj;
            } else {
                for (let key in obj) {
                    newObj[key] = obj[key];
                }
            }
            return newObj;
        }


        /**
         * 动态加载字符串函数，字符串的函数必须为匿名
         * @param functionStr
         * @returns 函数对象
         * @example
         * loadFunction("function(val){return val+1;}");
         */
        static loadFunction(functionStr: string): any {
            if (functionStr.toString().trim().startsWith("function")) {
                let functionKey = "do" + $.md5(functionStr);

                if (Ext.isEmpty(FastExt.Cache.memory[functionKey])) {
                    let myScript = document.createElement("script");
                    myScript.type = "text/javascript";
                    let code = "let " + functionKey + "=" + functionStr;
                    try {
                        myScript.appendChild(document.createTextNode(code));
                    } catch (ex) {
                        myScript.text = code;
                    }
                    document.body.appendChild(myScript);
                    FastExt.Cache.memory[functionKey] = true;
                }
                return eval(functionKey);
            }
            return null;
        }

        /**
         * 动态触发浏览器下载文件
         * @param url 文件的下载路径
         */
        static download(url: string): any {
            let name = url.split("?")[0].substring(url.lastIndexOf("/"));
            let a = document.createElement('a');
            let event = new MouseEvent('click');
            a.download = "file" + name;
            a.href = url;
            a.dispatchEvent(event)
        }


        /**
         * 动态打开URL地址
         * @param url
         * @param target 打开方式
         * @see {@link FastEnum.Target}
         */
        static openUrl(url: string, target?: FastEnum.Target) {
            if (Ext.isEmpty(target)) {
                target = FastEnum.Target._blank;
            }
            let a = document.createElement("a");
            if (!a.click) {
                window.location.href = url;
                return;
            }
            a.setAttribute("href", url);
            a.setAttribute("target", target);
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
        }


        /**
         * 动态执行回调函数，限制了重复执行
         * @param fun 函数对象
         * @param param 函数参数
         */
        static runCallBack(fun: any, param?: object): void {
            if (!Ext.isFunction(fun)) {
                return;
            }
            if (fun.callBacked) {
                return;
            }
            let callBackParams = [];
            for (let i = 1; i < arguments.length; i++) {
                callBackParams[i - 1] = arguments[i];
            }
            fun.apply(this, callBackParams);
            fun.callBacked = true;
        }


        /**
         * 构建唯一标识符号
         * @param prefix 唯一标识的前缀
         */
        static buildOnlyCode(prefix): string {
            let key = prefix + Ext.now();
            return $.md5(key);
        }


        /**
         * 提取纯数字
         * @param value
         */
        static getNumberValue(value): number {
            return parseFloat(value.replace(/[^0-9]/ig, ""));
        }

        /**
         * 数字补0
         * @param num
         * @param length
         */
        static prefixInteger(num, length): string {
            return (Array(length).join('0') + num).slice(-length);
        }


        /**
         * 获取svg的标签格式
         * @param className
         */
        static getSVGIcon(className): string {
            return '<svg class="svgIcon" aria-hidden="true"><use xlink:href="#' + className + '"></use></svg>';
        }


        /**
         * 获取svg标签的class名
         * @param type
         */
        static getSVGClassName(type): string {
            type = type.toString().toLowerCase();
            let fileClassName = "extFile";
            if (type.endWith(".doc") || type.endWith(".docx") ||
                type === "application/msword" ||
                type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                fileClassName = "extFileWord";
            } else if (type.endWith(".xls") || type.endWith(".xlsx") ||
                type === "application/vnd.ms-excel" ||
                type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                fileClassName = "extFileExcel";
            } else if (type.endWith(".zip") || type.endWith(".rar") ||
                type === "application/zip" ||
                type === "application/rar") {
                fileClassName = "extFileZIP";
            } else if (type.endWith(".apk") ||
                type === "application/vnd.android.package-archive") {
                fileClassName = "extFileAPK";
            } else if (type.endWith(".jpg") || type.endWith(".jpeg") || type === "image/jpeg") {
                fileClassName = "extFileJPG";
            } else if (type.endWith(".png") || type === "image/png") {
                fileClassName = "extFilePNG";
            } else if (type.endWith(".psd") || type === "image/vnd.adobe.photoshop") {
                fileClassName = "extFilePSD";
            } else if (type.endWith(".html") || type.endWith(".shtml") || type.endWith(".htm") || type === "text/html") {
                fileClassName = "extFileHTMl";
            } else if (type.endWith(".txt") || type === "text/plain") {
                fileClassName = "extFileTXT";
            }
            return fileClassName;
        }

        /**
         * 根据日期值猜测日期类型
         * @param value
         */
        static guessDateFormat(value): string {
            if (!value || Ext.isDate(value)) {
                return '';
            }
            value = value.toString().trim();
            let regPattern = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y-m-d H:i:s";
            }
            regPattern = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y-m-d H:i";
            }
            regPattern = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}");
            if (regPattern.test(value)) {
                return "Y-m-d H";
            }
            regPattern = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y-m-d";
            }
            regPattern = new RegExp("[0-9]{4}/[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y/m/d H:i:s";
            }
            regPattern = new RegExp("[0-9]{4}/[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y/m/d H:i";
            }
            regPattern = new RegExp("[0-9]{4}/[0-9]{2}/[0-9]{2} [0-9]{2}");
            if (regPattern.test(value)) {
                return "Y/m/d H";
            }
            regPattern = new RegExp("[0-9]{4}/[0-9]{2}/[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y/m/d";
            }
            return '';
        }


        /**
         * 请求url的并获得headers消息
         * @param url 地址
         * @param callback 回调函数  callback("un-know");
         */
        static getUrlContentType(url, callback) {
            if (!url || !callback) {
                return;
            }
            let onlyCode = $.md5(url.toString());
            let cacheXhr = FastExt.Cache.getCache(onlyCode);
            if (cacheXhr) {
                callback(cacheXhr);
                return;
            }
            $.ajax({
                type: 'HEAD', // 获取头信息，type=HEAD即可
                url: url,
                complete: function (xhr, data) {
                    FastExt.Cache.setCache(onlyCode, xhr.getResponseHeader("content-type"));
                    callback(xhr.getResponseHeader("content-type"));
                },
                error: function () {
                    FastExt.Cache.setCache(onlyCode, "un-know");
                    callback("un-know");
                }
            });
        }


        /**
         * 将input的光标移动到末尾
         * @param obj
         */
        static inputFocusEnd(obj) {
            try {
                obj.focus();
                let len = obj.value.length;
                if (document["selection"]) {//IE
                    let sel = obj.createTextRange();
                    sel.moveStart('character', len);
                    sel.collapse();
                    sel.select();
                } else if (typeof obj.selectionStart == 'number' && typeof obj.selectionEnd == 'number') {//非IE
                    obj.selectionStart = obj.selectionEnd = len;
                }
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 随机范围整数
         * @param min 最小值
         * @param max 最大值
         */
        static randomInt(min, max): number {
            if (min === max) {
                return min;
            }
            return Math.floor(Math.random() * (max - min + 1) + min);
        }


        /**
         * 动态加载css代码
         * @param style css代码
         * @param callBack 加载成功后回调
         */
        static loadCssCode(style, callBack) {
            let oHead = document.getElementsByTagName('head').item(0);
            let oStyle = document.createElement("style");
            oStyle.type = "text/css";
            if (oStyle["styleSheet"]) {
                oStyle["styleSheet"].cssText = style;
            } else {
                oStyle.innerHTML = style;
            }
            if (callBack != null) {
                callBack();
            }
            oHead.appendChild(oStyle);
        }


        /**
         * 模拟触发鼠标事件
         * @param targetDocument
         * @param targetElement
         * @param eventName 事件名称
         */
        static dispatchTargetEvent(targetDocument, targetElement, eventName) {
            if (targetDocument.createEvent) {
                const event = targetDocument.createEvent('MouseEvents');
                event.initEvent(eventName, true, false);
                targetElement.dispatchEvent(event);
            } else if (targetDocument.createEventObject) {
                //兼容IE
                targetElement.fireEvent('on' + eventName);
            }
        }

        /**
         * 构建uuid4的唯一编号
         */
        static buildUUID4():string {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        /**
         * 构建uuid8的唯一编号
         */
        static buildUUID8():string {
            return (((1 + Math.random()) * 0x100000000) | 0).toString(16).substring(1);
        }

        /**
         * 构建uuid12的唯一编号
         */
        static buildUUID12(): string {
            return FastExt.Base.buildUUID4() + FastExt.Base.buildUUID8();
        }

        /**
         * 构建uuid16的唯一编号
         */
        static buildUUID16(): string {
            return FastExt.Base.buildUUID8() + FastExt.Base.buildUUID8();
        }


        /**
         * 获取url地址中的参数值
         * @param url 地址
         * @param paramName 参数名称
         */
        static getUrlParams(url: string, paramName: string) {
            let re = new RegExp(paramName + '=([^&]*)(?:&)?');
            return url.match(re) && url.match(re)[1];
        }


        /**
         * 将对象转换为字符类型
         * @param value 对象
         * @param defaultValue 默认值，当对象数据为空时返回
         */
        static toString(value, defaultValue): string {
            if (Ext.isEmpty(defaultValue)) {
                defaultValue = value;
            }
            if (Ext.isEmpty(value)) {
                return defaultValue;
            }
            return value.toString();
        }
    }
}