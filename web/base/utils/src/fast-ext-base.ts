namespace FastExt {
    /**
     * 常规功能方法
     */
    export class Base {
        static onlyIterator = 1;

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
         * 删除对象数据
         * @param attr
         * @param objects
         */
        static deleteObjectAttr(attr, ...objects: any) {
            for (let i = 0; i < objects.length; i++) {
                delete objects[i][attr];
            }
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
                if (obj === "0" || obj === "off" || obj.toLowerCase() === "false") {
                    return false;
                }
                if (obj === "1" || obj === "on" || obj.toLowerCase() === "true") {
                    return true;
                }
                return defaultValue;
            }
            if (Ext.isNumber(obj)) {
                if (obj === 0) {
                    return false;
                }
                if (obj === 1) {
                    return true;
                }
                return defaultValue;
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
         * 动态触发浏览器下载文件
         * @param url 文件的下载路径
         * @param fileName 提示下载文件名
         */
        static download(url: string, fileName?: string): any {
            let name = url.split("?")[0].substring(url.lastIndexOf("/"));
            let a = document.createElement('a');
            let event = new MouseEvent('click');
            if (Ext.isEmpty(fileName)) {
                if (name.length === 0) {
                    fileName = "file" + name;
                } else {
                    fileName = name;
                }
            }
            a.download = fileName;
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
            FastExt.Windows.openUrl(url, target);
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
            return prefix + $.md5(this.buildUUID8());
        }

        /**
         * 构建唯一标识符号
         * @param prefix 唯一标识的前缀
         */
        static buildOnlyNumber(prefix): string {
            if (FastExt.Base.onlyIterator > 99) {
                FastExt.Base.onlyIterator = 1;
            }
            return prefix + Ext.now() + (FastExt.Base.onlyIterator++);
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
            return '<svg class="svgIcon fileIcon" aria-hidden="true"><use xlink:href="#' + className + '"></use></svg>';
        }


        /**
         * 获取svg标签的class名
         * @param types 文件类型名
         */
        static getSVGClassName(...types): string {
            for (let i = 0; i < types.length; i++) {
                let type = types[i].toString().toLowerCase();
                let fileClassName = undefined;
                if (FastExt.File.isSuffixFile(type, "doc", "docx")) {
                    fileClassName = "extFileWord";
                } else if (FastExt.File.isSuffixFile(type, "xls", "xlsx")) {
                    fileClassName = "extFileExcel";
                } else if (FastExt.File.isSuffixFile(type, "pdf")) {
                    fileClassName = "extFilePDF";
                } else if (FastExt.File.isSuffixFile(type, "ppt")) {
                    fileClassName = "extFilePPT";
                } else if (FastExt.File.isSuffixFile(type, "zip", "rar", "gzip")) {
                    fileClassName = "extFileZIP";
                } else if (FastExt.File.isSuffixFile(type, "apk", "aar")) {
                    fileClassName = "extFileAPK";
                } else if (FastExt.File.isSuffixFile(type, "jpg", "jpeg")) {
                    fileClassName = "extFileJPG";
                } else if (FastExt.File.isSuffixFile(type, "png")) {
                    fileClassName = "extFilePNG";
                } else if (FastExt.File.isSuffixFile(type, "psd")) {
                    fileClassName = "extFilePSD";
                } else if (FastExt.File.isSuffixFile(type, "html", "shtml")) {
                    fileClassName = "extFileHTMl";
                } else if (FastExt.File.isSuffixFile(type, "txt")) {
                    fileClassName = "extFileTXT";
                } else if (FastExt.File.isSuffixFile(type, "ipa")) {
                    fileClassName = "extFileIOS";
                }
                if (!Ext.isEmpty(fileClassName)) {
                    return fileClassName;
                }
            }
            return "extFile";
        }

        /**
         * 根据日期值猜测日期类型
         * @param value
         * {@link FastExt.Dates.guessDateFormat}
         */
        static guessDateFormat(value): string {
            return FastExt.Dates.guessDateFormat(value);
        }

        /**
         * 将字符串格式化日期
         * @param dateValue
         * {@link FastExt.Dates.guessDateFormat}
         */
        static parseDate(dateValue: string): Date {
            return FastExt.Dates.parseDate(dateValue);
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
         * 获取目标控件的html节点对象
         * @param target
         */
        static getTargetElement(target: any): Element {
            return FastExt.Component.getTargetElement(target);
        }

        /**
         * 获取目标控件的body html节点对象
         * @param target
         */
        static getTargetBodyElement(target: any): Element {
            return FastExt.Component.getTargetBodyElement(target);
        }

        /**
         * 判断节点元素是否在可视区域
         * @param element
         */
        static isElementInViewport(element: Element): boolean {
            try {
                let rect = element.getBoundingClientRect();
                if (rect.width <= 0 && rect.height <= 0) {
                    return false;
                }
                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <=
                    (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <=
                    (window.innerWidth || document.documentElement.clientWidth)
                );
            } catch (e) {
            }
            return false;
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
            if (!targetElement || !targetDocument) {
                return;
            }
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
        static buildUUID4(): string {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        /**
         * 构建uuid8的唯一编号
         */
        static buildUUID8(): string {
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
            if (defaultValue === undefined || defaultValue === null) {
                defaultValue = value;
            }
            if (Ext.isEmpty(value)) {
                return defaultValue;
            }
            return value.toString();
        }

        /**
         * 将对象转换为int类型
         * @param value 对象
         * @param defaultValue 默认值，当对象数据为空时返回
         */
        static toInt(value, defaultValue): number {
            if (defaultValue === undefined || defaultValue === null) {
                defaultValue = value;
            }
            if (Ext.isEmpty(value) || isNaN(value)) {
                return defaultValue;
            }
            return parseInt(value);
        }


        /**
         * 转换为最大的字符串长度，超出长度将截取以省略号代替
         * @param value
         * @param maxLength
         */
        static toMaxString(value, maxLength): string {
            let realString = FastExt.Base.toString(value, "");
            if (realString.length > maxLength) {
                return realString.substring(0, maxLength) + "…";
            }
            return realString;
        }

        /**
         * 将参数数组转成字符串拼接格式
         * @param params
         */
        static toPlanParams(params: any[]): string {
            let paramArray = [];
            for (let i = 0; i < params.length; i++) {
                let value = params[i];
                if (Ext.isString(value)) {
                    paramArray.push("\"" + value + "\"");
                } else {
                    paramArray.push(value);
                }
            }
            return paramArray.join(",");
        }


        /**
         * 获取空的Promise
         */
        static getEmptyPromise() {
            return new Ext.Promise(function (resolve, reject) {
                resolve();
            });
        }


        /**
         * 将数字转成字节单位表示
         */
        static toByteUnit(value:string, digits?:number) {
            if (Ext.isEmpty(digits)) {
                digits = 2;
            }
            let aLong = parseInt(value);
            if (aLong === 0) {
                return "0";
            }
            let aG = 1024.0 * 1024.0 * 1024.0;
            if (aLong > aG) {
                return (aLong / aG).toFixed(digits) + "G";
            }
            let aM = 1024.0 * 1024.0;
            if (aLong > aM) {
                return (aLong / aM).toFixed(digits) + "M";
            }
            let aKb = 1024.0;
            if (aLong > aKb) {
                return (aLong / aKb).toFixed(digits) + "KB";
            }
            return aLong + "B";
        }

        /**
         * 替换占位符 ${key}或$[key]
         * @param mapValue key-value对象值
         * @param content 替换的内容
         * @return 替换后的内容
         */
        static replacePlaceholder(mapValue: object, content: string): string {
            const reg_str = /(\$[{\[][^{}\[\]]+[}\]])/g;
            const result = content.match(reg_str);
            if (!result) {
                return;
            }
            const keyMap = {};
            for (let regKey of result) {
                let runKey = regKey.replace("[", "").replace("]", "").replace("{", "").replace("}", "").replace("$", "");
                keyMap[regKey] = mapValue[runKey];
            }
            for (let keyMapKey in keyMap) {
                // @ts-ignore
                content = content.replaceAll(keyMapKey, keyMap[keyMapKey]);
            }
            return content;
        }


        /**
         * 计算两个数之间的最大公约数
         * @param num1
         * @param num2
         * @return {number}
         */
        static computeMaxDivisor(num1: number, num2: number): number {
            if ((num1 - num2) < 0) {
                var k = num1;
                num1 = num2;
                num2 = k;
            }
            while (num2 !== 0) {
                let remainder = num1 % num2;
                num1 = num2;
                num2 = remainder;
            }
            return num1;
        }



        /**
         * 格式化url地址，返回带上系统版本号参数
         * @param url
         * @param params
         */
        static formatUrlVersion(url: string, params?:any): string {
            if (Ext.isEmpty(url)) {
                return url;
            }
            let urlArray = url.split("@");
            url = urlArray[0];
            let newUrl = url;
            if (url.indexOf("v=") < 0) {
                if (url.indexOf("?") > 0) {
                    newUrl = url + "&v=" + FastExt.System.ConfigHandler.getSystemVersionInt();
                } else {
                    newUrl = url + "?v=" + FastExt.System.ConfigHandler.getSystemVersionInt();
                }
            }
            if (params) {
                for (let key in params) {
                    if (params.hasOwnProperty(key)) {
                        newUrl = newUrl + "&" + key + "=" + params[key];
                    }
                }
            }
            urlArray[0] = newUrl;
            return urlArray.join("@");
        }

        /**
         * 格式化url地址，如果没有http开头，则自动拼接当前系统的http地址
         * @param url
         * @param params
         */
        static formatUrl(url:string, params?:any): string {
            if (Ext.isEmpty(url)) {
                return url;
            }
            // @ts-ignore
            if (url.startWith("http://") || url.startWith("https://")) {
                return this.formatUrlVersion(url, params);
            }
            if (FastExt.System.ConfigHandler.getSystemHttp()) {
                return this.formatUrlVersion(FastExt.System.ConfigHandler.getSystemHttp() + url, params);
            }
            return this.formatUrlVersion(url, params);
        }


        /**
         * 猜测文本的宽度
         * @param text 文本内容
         * @param space 容差值，默认2.5
         */
        static guessTextWidth(text:string,space?:number) {
            if(Ext.isEmpty(space)) {
                space = 2.5;
            }
            return (text.length + space) * FastExt.System.ConfigHandler.getFontSizeNumber();
        }



    }
}