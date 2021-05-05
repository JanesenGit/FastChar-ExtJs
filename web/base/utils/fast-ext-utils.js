var FastExt;
(function (FastExt) {
    /**
     * 常规功能方法
     */
    var Base = /** @class */ (function () {
        function Base() {
        }
        /**
         * 获取浏览器的操作系统
         */
        Base.getOS = function () {
            try {
                var sUserAgent = navigator.userAgent;
                var isWin = (navigator.platform === "Win32") || (navigator.platform === "Windows");
                var isMac = (navigator.platform === "Mac68K") || (navigator.platform === "MacPPC") || (navigator.platform === "Macintosh") || (navigator.platform === "MacIntel");
                if (isMac)
                    return "Mac";
                var isUnix = (navigator.platform === "X11") && !isWin && !isMac;
                if (isUnix)
                    return "Unix";
                var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
                if (isLinux)
                    return "Linux";
                if (isWin) {
                    var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
                    if (isWin2K)
                        return "Windows 2000";
                    var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
                    if (isWinXP)
                        return "Windows XP";
                    var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
                    if (isWin2003)
                        return "Windows 2003";
                    var isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
                    if (isWinVista)
                        return "Windows Vista";
                    var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
                    if (isWin7)
                        return "Windows 7";
                    var isWin8 = sUserAgent.indexOf("Windows NT 8.0") > -1 || sUserAgent.indexOf("Windows 8") > -1;
                    if (isWin8)
                        return "Windows 8";
                    var isWin10 = sUserAgent.indexOf("Windows NT 10.0") > -1 || sUserAgent.indexOf("Windows 10") > -1;
                    if (isWin10)
                        return "Windows 10";
                    return "Windows";
                }
            }
            catch (e) {
            }
            return "Other";
        };
        /**
         * 转换bool值
         * @param obj 带转换的对象
         * @param defaultValue 默认值
         */
        Base.toBool = function (obj, defaultValue) {
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
        };
        /**
         * 复制文本到剪贴板里
         * @param content 内容
         */
        Base.copyToBoard = function (content) {
            var oInput = document.createElement('input');
            oInput.value = content;
            document.body.appendChild(oInput);
            oInput.select();
            document.execCommand("Copy");
            oInput.style.display = 'none';
            $(oInput).remove();
        };
        /**
         * 浅复制对象
         * @param obj 待复制的对象
         */
        Base.copy = function (obj) {
            var newObj = {};
            if (obj instanceof Array) {
                newObj = obj.concat();
            }
            else if (obj instanceof Function) {
                newObj = obj;
            }
            else {
                for (var key in obj) {
                    newObj[key] = obj[key];
                }
            }
            return newObj;
        };
        /**
         * 获得首页头部线形状进度条
         * @param toColor
         * @returns {ProgressBar.Line}
         */
        Base.getProgressLine = function (toColor) {
            if (Ext.isEmpty(toColor)) {
                toColor = "#f8c633";
            }
            if (!Base.progressLine) {
                Base.progressLine = new ProgressBar.Line('#progress', {
                    color: toColor,
                    duration: 1000,
                    easing: 'easeInOut',
                    from: {
                        color: '#9c58b6'
                    },
                    to: {
                        color: toColor
                    },
                    step: function (state, line, attachment) {
                        line.path.setAttribute('stroke', state.color);
                    }
                });
            }
            return Base.progressLine;
        };
        /**
         * 动态加载字符串函数，字符串的函数必须为匿名
         * @param functionStr
         * @returns 函数对象
         * @example
         * loadFunction("function(val){return val+1;}");
         */
        Base.loadFunction = function (functionStr) {
            if (functionStr.toString().trim().startsWith("function")) {
                var functionKey = "do" + $.md5(functionStr);
                if (Ext.isEmpty(FastExt.Cache.memory[functionKey])) {
                    var myScript = document.createElement("script");
                    myScript.type = "text/javascript";
                    var code = "let " + functionKey + "=" + functionStr;
                    try {
                        myScript.appendChild(document.createTextNode(code));
                    }
                    catch (ex) {
                        myScript.text = code;
                    }
                    document.body.appendChild(myScript);
                    FastExt.Cache.memory[functionKey] = true;
                }
                return eval(functionKey);
            }
            return null;
        };
        /**
         * 动态触发浏览器下载文件
         * @param url 文件的下载路径
         */
        Base.download = function (url) {
            var name = url.split("?")[0].substring(url.lastIndexOf("/"));
            var a = document.createElement('a');
            var event = new MouseEvent('click');
            a.download = "file" + name;
            a.href = url;
            a.dispatchEvent(event);
        };
        /**
         * 动态打开URL地址
         * @param url
         * @param target 打开方式
         * @see {@link FastEnum.Target}
         */
        Base.openUrl = function (url, target) {
            if (Ext.isEmpty(target)) {
                target = FastEnum.Target._blank;
            }
            var a = document.createElement("a");
            if (!a.click) {
                window.location.href = url;
                return;
            }
            a.setAttribute("href", url);
            a.setAttribute("target", target);
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
        };
        /**
         * 动态执行回调函数，限制了重复执行
         * @param fun 函数对象
         * @param param 函数参数
         */
        Base.runCallBack = function (fun, param) {
            if (!Ext.isFunction(fun)) {
                return;
            }
            if (fun.callBacked) {
                return;
            }
            var callBackParams = [];
            for (var i = 1; i < arguments.length; i++) {
                callBackParams[i - 1] = arguments[i];
            }
            fun.apply(this, callBackParams);
            fun.callBacked = true;
        };
        /**
         * 构建唯一标识符号
         * @param prefix 唯一标识的前缀
         */
        Base.buildOnlyCode = function (prefix) {
            var key = prefix + Ext.now();
            return $.md5(key);
        };
        /**
         * 提取纯数字
         * @param value
         */
        Base.getNumberValue = function (value) {
            return parseFloat(value.replace(/[^0-9]/ig, ""));
        };
        /**
         * 数字补0
         * @param num
         * @param length
         */
        Base.prefixInteger = function (num, length) {
            return (Array(length).join('0') + num).slice(-length);
        };
        /**
         * 获取svg的标签格式
         * @param className
         */
        Base.getSVGIcon = function (className) {
            return '<svg class="svgIcon" aria-hidden="true"><use xlink:href="#' + className + '"></use></svg>';
        };
        /**
         * 获取svg标签的class名
         * @param type
         */
        Base.getSVGClassName = function (type) {
            type = type.toString().toLowerCase();
            var fileClassName = "extFile";
            if (type.endWith(".doc") || type.endWith(".docx") ||
                type === "application/msword" ||
                type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                fileClassName = "extFileWord";
            }
            else if (type.endWith(".xls") || type.endWith(".xlsx") ||
                type === "application/vnd.ms-excel" ||
                type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                fileClassName = "extFileExcel";
            }
            else if (type.endWith(".zip") || type.endWith(".rar") ||
                type === "application/zip" ||
                type === "application/rar") {
                fileClassName = "extFileZIP";
            }
            else if (type.endWith(".apk") ||
                type === "application/vnd.android.package-archive") {
                fileClassName = "extFileAPK";
            }
            else if (type.endWith(".jpg") || type.endWith(".jpeg") || type === "image/jpeg") {
                fileClassName = "extFileJPG";
            }
            else if (type.endWith(".png") || type === "image/png") {
                fileClassName = "extFilePNG";
            }
            else if (type.endWith(".psd") || type === "image/vnd.adobe.photoshop") {
                fileClassName = "extFilePSD";
            }
            else if (type.endWith(".html") || type.endWith(".shtml") || type.endWith(".htm") || type === "text/html") {
                fileClassName = "extFileHTMl";
            }
            else if (type.endWith(".txt") || type === "text/plain") {
                fileClassName = "extFileTXT";
            }
            return fileClassName;
        };
        /**
         * 根据日期值猜测日期类型
         * @param value
         */
        Base.guessDateFormat = function (value) {
            if (!value || Ext.isDate(value)) {
                return '';
            }
            value = value.toString().trim();
            var regPattern = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}");
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
        };
        /**
         * 请求url的并获得headers消息
         * @param url 地址
         * @param callback 回调函数  callback("un-know");
         */
        Base.getUrlContentType = function (url, callback) {
            if (!url || !callback) {
                return;
            }
            var onlyCode = $.md5(url.toString());
            var cacheXhr = FastExt.Cache.getCache(onlyCode);
            if (cacheXhr) {
                callback(cacheXhr);
                return;
            }
            $.ajax({
                type: 'HEAD',
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
        };
        /**
         * 将input的光标移动到末尾
         * @param obj
         */
        Base.inputFocusEnd = function (obj) {
            try {
                obj.focus();
                var len = obj.value.length;
                if (document["selection"]) { //IE
                    var sel = obj.createTextRange();
                    sel.moveStart('character', len);
                    sel.collapse();
                    sel.select();
                }
                else if (typeof obj.selectionStart == 'number' && typeof obj.selectionEnd == 'number') { //非IE
                    obj.selectionStart = obj.selectionEnd = len;
                }
            }
            catch (e) {
                console.error(e);
            }
        };
        /**
         * 随机范围整数
         * @param min 最小值
         * @param max 最大值
         */
        Base.randomInt = function (min, max) {
            if (min === max) {
                return min;
            }
            return Math.floor(Math.random() * (max - min + 1) + min);
        };
        /**
         * 动态加载css代码
         * @param style css代码
         * @param callBack 加载成功后回调
         */
        Base.loadCssCode = function (style, callBack) {
            var oHead = document.getElementsByTagName('head').item(0);
            var oStyle = document.createElement("style");
            oStyle.type = "text/css";
            if (oStyle["styleSheet"]) {
                oStyle["styleSheet"].cssText = style;
            }
            else {
                oStyle.innerHTML = style;
            }
            if (callBack != null) {
                callBack();
            }
            oHead.appendChild(oStyle);
        };
        /**
         * 模拟触发鼠标事件
         * @param targetDocument
         * @param targetElement
         * @param eventName 事件名称
         */
        Base.dispatchTargetEvent = function (targetDocument, targetElement, eventName) {
            if (targetDocument.createEvent) {
                var event_1 = targetDocument.createEvent('MouseEvents');
                event_1.initEvent(eventName, true, false);
                targetElement.dispatchEvent(event_1);
            }
            else if (targetDocument.createEventObject) {
                //兼容IE
                targetElement.fireEvent('on' + eventName);
            }
        };
        /**
         * 构建uuid4的唯一编号
         */
        Base.buildUUID4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        /**
         * 构建uuid8的唯一编号
         */
        Base.buildUUID8 = function () {
            return (((1 + Math.random()) * 0x100000000) | 0).toString(16).substring(1);
        };
        /**
         * 构建uuid12的唯一编号
         */
        Base.buildUUID12 = function () {
            return FastExt.Base.buildUUID4() + FastExt.Base.buildUUID8();
        };
        /**
         * 构建uuid16的唯一编号
         */
        Base.buildUUID16 = function () {
            return FastExt.Base.buildUUID8() + FastExt.Base.buildUUID8();
        };
        /**
         * 获取url地址中的参数值
         * @param url 地址
         * @param paramName 参数名称
         */
        Base.getUrlParams = function (url, paramName) {
            var re = new RegExp(paramName + '=([^&]*)(?:&)?');
            return url.match(re) && url.match(re)[1];
        };
        return Base;
    }());
    FastExt.Base = Base;
})(FastExt || (FastExt = {}));
var FastExt;
(function (FastExt) {
    /**
     * 按钮相关功能
     */
    var Button = /** @class */ (function () {
        function Button() {
        }
        /**
         * 将button转换成menuitem
         * @param button
         */
        Button.buttonToMenuItem = function (button) {
            if (button.hidden) {
                return null;
            }
            var child = {
                icon: button.icon,
                iconCls: button.iconCls,
                text: button.text,
                subtext: button.subtext,
                handler: button.handler,
                disabled: button.disabled
            };
            if (button.getMenu() != null) {
                var menus_1 = [];
                button.getMenu().items.each(function (item, index) {
                    var items = FastExt.Button.buttonToMenuItem(item);
                    if (items) {
                        menus_1.push(items);
                    }
                });
                child["menu"] = menus_1;
            }
            return child;
        };
        /**
         * 将按钮绑定到Grid的监听按钮集合中
         * @param grid
         * @param button
         */
        Button.buttonToBind = function (grid, button) {
            if (button.checkSelect) {
                if (!grid.selectButtons) {
                    grid.selectButtons = [];
                }
                button.setDisabled(true);
                grid.selectButtons.push(button);
            }
            if (button.checkUpdate) {
                if (!grid.updateButtons) {
                    grid.updateButtons = [];
                }
                button.setDisabled(true);
                grid.updateButtons.push(button);
            }
            if (button.getMenu() != null) {
                button.getMenu().items.each(function (item, index) {
                    FastExt.Button.buttonToBind(grid, item);
                });
            }
        };
        return Button;
    }());
    FastExt.Button = Button;
})(FastExt || (FastExt = {}));
var FastExt;
(function (FastExt) {
    /**
     * 数据缓存相关
     */
    var Cache = /** @class */ (function () {
        function Cache() {
        }
        /**
         * 设置缓存，保存在本地浏览器,localStorage
         * @param key 缓存的key
         * @param data 缓存的数据
         */
        Cache.setCache = function (key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            }
            catch (e) {
            }
        };
        /**
         * 获取保存在本地浏览器的缓存
         * @param key 缓存的key
         */
        Cache.getCache = function (key) {
            try {
                return JSON.parse(localStorage.getItem(key));
            }
            catch (e) {
            }
            return null;
        };
        /**
         * 删除保存在本地浏览器的缓存
         * @param key 缓存的key
         */
        Cache.removeCache = function (key) {
            localStorage.removeItem(key);
        };
        return Cache;
    }());
    FastExt.Cache = Cache;
})(FastExt || (FastExt = {}));
var FastExt;
(function (FastExt) {
    /**
     * 颜色处理的功能
     */
    var Color = /** @class */ (function () {
        function Color() {
        }
        /**
         * 转换颜色格式值，符合：#ffffff 格式
         * @param obj 带转换的颜色
         * @param defaultValue 默认颜色
         * @returns {string}
         */
        Color.toColor = function (obj, defaultValue) {
            if (Ext.isEmpty(defaultValue)) {
                defaultValue = "#FFFFFF";
            }
            if (Ext.isEmpty(obj)) {
                return defaultValue;
            }
            if (obj.toString().startWith("#")) {
                return obj.toString();
            }
            try {
                var color = Ext.ux.colorpick.ColorUtils.parseColor(obj);
                return "#" + Ext.ux.colorpick.ColorUtils.formats.HEX8(color);
            }
            catch (e) {
            }
            return "#" + obj;
        };
        return Color;
    }());
    FastExt.Color = Color;
})(FastExt || (FastExt = {}));
var FastExt;
(function (FastExt) {
    /**
     * Ext组件相关方法功能
     */
    var Component = /** @class */ (function () {
        function Component() {
        }
        /**
         * 抖动控件
         * @param obj 待抖动的控件[Ext.Component]
         * @param callBack 抖动结束的回调函数function(){}
         * @param shakeCount 抖动次数
         */
        Component.shakeComment = function (obj, callBack, shakeCount) {
            if (!shakeCount) {
                shakeCount = 1080;
            }
            try {
                var interval_1, t_1 = 0, z_1 = 3, del_1 = function () {
                    clearInterval(interval_1);
                    obj.setX(currX_1);
                    obj.setY(currY_1);
                    if (Ext.isFunction(callBack)) {
                        callBack();
                    }
                };
                var currX_1 = obj.getX();
                var currY_1 = obj.getY();
                interval_1 = setInterval(function () {
                    try {
                        var i = t_1 / 180 * Math.PI, x = Math.sin(i) * z_1, y = Math.cos(i) * z_1;
                        obj.setX(currX_1 + x);
                        obj.setY(currY_1 + y);
                        if ((t_1 += 90) > shakeCount)
                            del_1();
                    }
                    catch (e) {
                        del_1();
                    }
                }, 30);
            }
            catch (e) {
            }
        };
        return Component;
    }());
    FastExt.Component = Component;
})(FastExt || (FastExt = {}));
var FastDefine;
(function (FastDefine) {
    /**
     * 枚举下拉框组件
     */
    var EnumComboBox = /** @class */ (function () {
        function EnumComboBox() {
            Ext.define("Fast.ext.EnumComboBox", {
                alias: ['widget.enumcombobox', 'widget.enumcombo'],
                extend: 'Ext.form.field.ComboBox',
                enumName: 'NONE',
                enumValue: 'id',
                enumText: 'text',
                exclude: [],
                include: [],
                params: {},
                firstData: null,
                lastData: null,
                editable: false,
                useCache: true,
                initComponent: function () {
                    var me = this;
                    me.displayField = me.enumText;
                    me.valueField = me.enumValue;
                    me.store = FastExt.Store.getEnumDataStore(me.enumName, me.firstData, me.lastData, me.params, me.useCache);
                    if (!me.exclude) {
                        me.exclude = [];
                    }
                    if (!me.include) {
                        me.include = [];
                    }
                    me.store.filterBy(function (record) {
                        if (me.exclude.exists(record.get(me.enumValue))) {
                            return false;
                        }
                        if (me.include.length > 0) {
                            if (me.include.exists(record.get(me.enumValue))) {
                                return true;
                            }
                            return false;
                        }
                        return true;
                    });
                    me.callParent();
                }
            });
        }
        return EnumComboBox;
    }());
    FastDefine.EnumComboBox = EnumComboBox;
    /**
     * 文件上传组件
     */
    var FastFileField = /** @class */ (function () {
        function FastFileField() {
            Ext.define("Fast.ext.FastFile", {
                extend: 'Ext.form.field.Text',
                alias: ['widget.fastfile', 'widget.fastfilefield'],
                fileModules: [],
                editable: false,
                getMenu: function () {
                    return this.up("menu");
                },
                onFileChange: function (fileObj) {
                },
                listeners: {
                    change: function (obj, newValue, oldValue, eOpts) {
                        if (Ext.isEmpty(newValue)) {
                            obj.getTrigger('help').hide();
                            obj.getTrigger('close').hide();
                        }
                        else {
                            obj.getTrigger('help').show();
                            obj.getTrigger('close').show();
                        }
                    },
                    afterrender: function (obj) {
                        var me = this;
                        if (!this.editable) {
                            obj.inputEl.on('click', function () {
                                me.selectData();
                            });
                        }
                    }
                },
                initComponent: function () {
                    var me = this;
                    var errorMsg = "";
                    for (var i = 0; i < this.fileModules.length; i++) {
                        var fileModule = this.fileModules[i];
                        errorMsg = errorMsg + "或" + fileModule.tipMsg;
                    }
                    this.emptyText = '请上传' + errorMsg.substring(1);
                    this.editable = false;
                    this.callParent(arguments);
                },
                triggers: {
                    help: {
                        cls: 'extIcon extEye',
                        hidden: true,
                        handler: function () {
                            var me = this;
                            if (me.fileModules.length === 1) {
                                if (me.fileModules[0].type === 'images') {
                                    if (me.getMenu()) {
                                        me.getMenu().holdShow = true;
                                    }
                                    me.blur();
                                    FastExt.Dialog.showImage(me, me.getValue(), function () {
                                        if (me.getMenu()) {
                                            me.getMenu().holdShow = false;
                                        }
                                    }, true);
                                    return;
                                }
                                if (me.fileModules[0].type === 'videos') {
                                    FastExt.Dialog.showVideo(this, me.getValue());
                                    return;
                                }
                            }
                            if (me.fileObj) {
                                var name_1 = me.fileObj.name;
                                if (FastExt.FileModule.image().reg.test(name_1)) {
                                    FastExt.Dialog.showImage(me, me.getValue(), null, true);
                                    return;
                                }
                                if (FastExt.FileModule.mp4().reg.test(name_1)) {
                                    FastExt.Dialog.showVideo(this, me.getValue());
                                    return;
                                }
                                if (FastExt.FileModule.pdf().reg.test(name_1) ||
                                    FastExt.FileModule.word().reg.test(name_1) ||
                                    FastExt.FileModule.excel().reg.test(name_1) ||
                                    FastExt.FileModule.ppt().reg.test(name_1)) {
                                    var viewerUrl = "https://view.officeapps.live.com/op/view.aspx?src=" + me.getValue();
                                    FastExt.Base.openUrl(viewerUrl);
                                    return;
                                }
                            }
                            location.href = me.getValue();
                        }
                    },
                    search: {
                        cls: 'extIcon extUpload',
                        handler: function () {
                            this.selectData();
                        }
                    },
                    close: {
                        cls: 'text-clear',
                        hidden: true,
                        handler: function () {
                            this.clearData();
                        }
                    }
                },
                selectData: function () {
                    var me = this;
                    if (me.getMenu()) {
                        me.getMenu().holdShow = true;
                    }
                    FastExt.File.uploadFile(me, me.fileModules).then(function (result) {
                        if (me.getMenu()) {
                            me.getMenu().holdShow = false;
                        }
                        if (result) {
                            me.fileObj = result;
                            me.setValue(result.url);
                            me.onFileChange(result);
                        }
                    });
                },
                clearData: function () {
                    var me = this;
                    me.setValue(null);
                }
            });
        }
        return FastFileField;
    }());
    FastDefine.FastFileField = FastFileField;
    /**
     * 多个文件上传管理组件
     */
    var FastFilesField = /** @class */ (function () {
        function FastFilesField() {
            Ext.define("Fast.ext.FastFiles", {
                alias: ['widget.fastfiles', 'widget.fastfilesfield'],
                extend: 'Ext.form.field.Text',
                editable: false,
                fileModules: [],
                allowBlank: true,
                autoUpdate: false,
                showFileName: false,
                showFileLength: false,
                submitArray: false,
                getMenu: function () {
                    return this.up("menu");
                },
                listeners: {
                    afterrender: function (obj) {
                        var me = this;
                        if (!this.editable) {
                            obj.inputEl.on('click', function () {
                                me.showWindow(me);
                            });
                        }
                    }
                },
                initComponent: function () {
                    var errorMsg = "";
                    for (var i = 0; i < this.fileModules.length; i++) {
                        var fileModule = this.fileModules[i];
                        errorMsg = errorMsg + "或" + fileModule.tipMsg;
                    }
                    this.emptyText = '请上传' + errorMsg.substring(1);
                    this.editable = false;
                    if (this.submitArray) {
                        var formPanel = this.up("form");
                        if (formPanel) {
                            formPanel.add({
                                xtype: "hiddenfield",
                                name: this.name + "@JsonArray",
                                value: true
                            });
                        }
                    }
                    this.callParent(arguments);
                },
                triggers: {
                    search: {
                        cls: 'text-search',
                        handler: function () {
                            this.showWindow(this);
                        }
                    }
                },
                showWindow: function (obj, callBack, title) {
                    var me = this;
                    FastExt.File.showFiles(this, function (result) {
                        me.setValue(result);
                        if (Ext.isFunction(callBack)) {
                            callBack(me);
                        }
                    }, me.fileModules, me.getValue(), title);
                }
            });
        }
        return FastFilesField;
    }());
    FastDefine.FastFilesField = FastFilesField;
    /**
     * 大文本编辑框组件
     */
    var ContentField = /** @class */ (function () {
        function ContentField() {
            Ext.define("Fast.ext.Content", {
                alias: ['widget.content', 'widget.contentfield'],
                extend: 'Ext.form.field.TextArea',
                height: 220,
                emptyText: '请填写……',
                allowBlank: true,
                getCode: function () {
                    return $.md5(this.getName() + this.dataIndex + this.getFieldLabel());
                },
                showWindow: function (obj, callBack, title) {
                    if (Ext.isEmpty(title)) {
                        title = "编辑内容";
                    }
                    var me = this;
                    me.oldValue = me.getValue();
                    if (!me.editorWin) {
                        var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                        var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                        me.editorWin = Ext.create('Ext.window.Window', {
                            title: title,
                            iconCls: 'extIcon extEdit',
                            resizable: true,
                            maximizable: true,
                            height: winHeight,
                            width: winWidth,
                            minHeight: 500,
                            minWidth: 600,
                            layout: 'fit',
                            animateTarget: obj,
                            items: [me],
                            modal: true,
                            constrain: true,
                            closeAction: 'hide',
                            listeners: {
                                show: function (obj) {
                                    FastExt.Server.showExtConfig(me.getCode(), "TextEditorCache", function (success, value) {
                                        if (success) {
                                            me.setValue(value);
                                            FastExt.Dialog.toast("已恢复暂存的数据！");
                                        }
                                    });
                                }
                            },
                            buttons: [
                                {
                                    text: '清除暂存',
                                    iconCls: 'extIcon extDelete whiteColor',
                                    handler: function () {
                                        FastExt.Dialog.showWait("正在清除中，请稍后……");
                                        FastExt.Server.deleteExtConfig(me.getCode(), "TextEditorCache", function (success) {
                                            FastExt.Dialog.hideWait();
                                            if (success) {
                                                FastExt.Dialog.toast("清除成功！");
                                            }
                                        });
                                    }
                                },
                                '->',
                                {
                                    text: '暂存',
                                    iconCls: 'extIcon extSave whiteColor',
                                    handler: function () {
                                        FastExt.Dialog.showWait("暂存中，请稍后……");
                                        FastExt.Server.saveExtConfig(me.getCode(), "TextEditorCache", me.getValue(), function (success, message) {
                                            FastExt.Dialog.hideWait();
                                            if (success) {
                                                FastExt.Dialog.toast("暂存成功！");
                                            }
                                            else {
                                                FastExt.Dialog.showAlert("系统提醒", message);
                                            }
                                        });
                                    }
                                },
                                {
                                    text: '重置',
                                    iconCls: 'extIcon extReset',
                                    handler: function () {
                                        me.setValue(me.oldValue);
                                        FastExt.Server.deleteExtConfig(me.getCode(), "TextEditorCache");
                                    }
                                },
                                {
                                    text: '确定',
                                    iconCls: 'extIcon extOk',
                                    handler: function () {
                                        FastExt.Dialog.showWait("请稍后……");
                                        FastExt.Server.deleteExtConfig(me.getCode(), "TextEditorCache", function (success) {
                                            FastExt.Dialog.hideWait();
                                            if (Ext.isFunction(me.editorWin.callBack)) {
                                                me.editorWin.callBack(me);
                                            }
                                            me.editorWin.close();
                                        });
                                    }
                                }
                            ]
                        });
                    }
                    me.editorWin.setTitle(title);
                    me.editorWin.callBack = callBack;
                    me.editorWin.animateTarget = obj;
                    me.editorWin.show();
                }
            });
        }
        return ContentField;
    }());
    FastDefine.ContentField = ContentField;
    /**
     * 富文本网页编辑组件
     */
    var HtmlContentField = /** @class */ (function () {
        function HtmlContentField() {
            Ext.define("Fast.ext.HtmlContent", {
                alias: ['widget.htmlcontent', 'widget.htmlcontentfield'],
                extend: 'Ext.form.FieldContainer',
                height: 400,
                getName: function () {
                    return this.name;
                },
                autoShowEditor: true,
                allowBlank: true,
                showEditor: function () {
                    var me = this;
                    var frameId = "EditorFrame" + Ext.now();
                    window["editorLoadDone" + frameId] = function () {
                        me.setValue(me.value);
                        me.setPostImageUrl(FastExt.System.formatUrl("upload?type=editor"));
                    };
                    me.editorFrameId = frameId;
                    var url = FastExt.System.formatUrlVersion("base/editor/index.html?id=" + frameId);
                    var html = "<iframe id='" + frameId + "' " + " src='" + url + "' width='100%' height='100%'" +
                        " frameborder='0' scrolling='no' style='border: 1px solid #d0d0d0;'/>";
                    me.update(html);
                },
                listeners: {
                    afterrender: function (obj) {
                        if (obj.autoShowEditor) {
                            obj.showEditor();
                        }
                    }
                },
                getCode: function () {
                    return $.md5(this.getName() + this.dataIndex + this.getFieldLabel());
                },
                isValid: function () {
                    return true;
                },
                getValue: function () {
                    var me = this;
                    var value = me.down("[realValue=true]");
                    if (value) {
                        return value.getValue();
                    }
                    return me.value;
                },
                setValue: function (val) {
                    var me = this;
                    var value = me.down("[realValue=true]");
                    if (value) {
                        value.setValue(val);
                    }
                    me.value = val;
                },
                setHtml: function (val) {
                    this.setValue(val);
                },
                setPostImageUrl: function (val) {
                    var me = this;
                    if (me.editorFrameId) {
                        var iframe = document.getElementById(me.editorFrameId);
                        if (iframe && Ext.isFunction(iframe.contentWindow.getHtmlValue)) {
                            iframe.contentWindow.setPostImageUrl(val);
                        }
                    }
                },
                initComponent: function () {
                    var me = this;
                    me.items = [
                        {
                            xtype: 'textfield',
                            name: me.name,
                            hidden: true,
                            realValue: true,
                            fieldLabel: me.fieldLabel,
                            allowBlank: me.allowBlank,
                            validation: '请输入' + me.fieldLabel,
                            isValid: function () {
                                if (!this.allowBlank) {
                                    if (Ext.isEmpty($(this.getRawValue()).text())) {
                                        return false;
                                    }
                                }
                                return true;
                            },
                            getRawValue: function () {
                                if (me.editorFrameId) {
                                    var iframe = document.getElementById(me.editorFrameId);
                                    if (iframe && Ext.isFunction(iframe.contentWindow.getHtmlValue)) {
                                        return iframe.contentWindow.getHtmlValue();
                                    }
                                }
                                return null;
                            },
                            setValue: function (val) {
                                me.value = val;
                                if (me.editorFrameId) {
                                    var iframe = document.getElementById(me.editorFrameId);
                                    if (iframe && Ext.isFunction(iframe.contentWindow.setHtmlValue)) {
                                        iframe.contentWindow.setHtmlValue(val);
                                    }
                                }
                            }
                        }
                    ];
                    me.callParent(arguments);
                },
                showWindow: function (obj, callBack, title) {
                    if (Ext.isEmpty(title)) {
                        title = "编辑内容";
                    }
                    var me = this;
                    me.autoShowEditor = false;
                    me.oldValue = me.value;
                    if (!me.editorWin) {
                        var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                        var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                        me.editorWin = Ext.create('Ext.window.Window', {
                            title: title,
                            iconCls: 'extIcon extEdit',
                            resizable: true,
                            maximizable: true,
                            height: winHeight,
                            width: winWidth,
                            minHeight: 500,
                            minWidth: 600,
                            layout: 'fit',
                            animateTarget: obj,
                            items: [me],
                            modal: true,
                            constrain: true,
                            closeAction: 'hide',
                            listeners: {
                                show: function (val) {
                                    me.showEditor();
                                    FastExt.Server.showExtConfig(me.getCode(), "HtmlEditorCache", function (success, value) {
                                        if (success) {
                                            me.setValue(value);
                                            FastExt.Dialog.toast("已恢复暂存的数据！");
                                        }
                                    });
                                }
                            },
                            buttons: [
                                {
                                    text: '清除暂存',
                                    iconCls: 'extIcon extDelete whiteColor',
                                    handler: function () {
                                        FastExt.Dialog.showWait("正在清除中，请稍后……");
                                        FastExt.Server.deleteExtConfig(me.getCode(), "HtmlEditorCache", function (success) {
                                            FastExt.Dialog.hideWait();
                                            if (success) {
                                                FastExt.Dialog.toast("清除成功！");
                                            }
                                        });
                                    }
                                },
                                '->',
                                {
                                    text: '暂存',
                                    iconCls: 'extIcon extSave whiteColor',
                                    handler: function () {
                                        FastExt.Dialog.showWait("暂存中，请稍后……");
                                        FastExt.Server.saveExtConfig(me.getCode(), "HtmlEditorCache", me.getValue(), function (succes, message) {
                                            FastExt.Dialog.hideWait();
                                            if (succes) {
                                                FastExt.Dialog.toast("暂存成功！");
                                            }
                                            else {
                                                FastExt.Dialog.showAlert("系统提醒", message);
                                            }
                                        });
                                    }
                                },
                                {
                                    text: '重置',
                                    iconCls: 'extIcon extReset',
                                    handler: function () {
                                        me.setValue(me.oldValue);
                                        FastExt.Server.deleteExtConfig(me.getCode(), "HtmlEditorCache");
                                    }
                                },
                                {
                                    text: '确定',
                                    iconCls: 'extIcon extOk',
                                    handler: function () {
                                        var params = {
                                            "configKey": me.getCode(),
                                            "configType": "HtmlEditorCache"
                                        };
                                        FastExt.Dialog.showWait("请稍后……");
                                        FastExt.Server.deleteExtConfig(me.getCode(), "HtmlEditorCache", function (success) {
                                            FastExt.Dialog.hideWait();
                                            if (Ext.isFunction(me.editorWin.callBack)) {
                                                me.editorWin.callBack(me);
                                            }
                                            me.editorWin.close();
                                        });
                                    }
                                }
                            ]
                        });
                    }
                    me.editorWin.setTitle(title);
                    me.editorWin.callBack = callBack;
                    me.editorWin.animateTarget = obj;
                    me.editorWin.show();
                }
            });
        }
        return HtmlContentField;
    }());
    FastDefine.HtmlContentField = HtmlContentField;
    /**
     * 表格关联组件
     */
    var LinkField = /** @class */ (function () {
        function LinkField() {
            Ext.define("Fast.ext.Link", {
                alias: ['widget.link', 'widget.linkfield'],
                extend: 'Ext.form.FieldContainer',
                entityId: null,
                entityIdDefaultValue: -1,
                entityText: null,
                entityCode: null,
                linkValue: {},
                editable: false,
                allowBlank: true,
                layout: 'fit',
                multiSelect: false,
                autoDisabled: true,
                submitValue: true,
                onBeforeSelect: null,
                onAfterSelect: null,
                onClearSelect: null,
                binds: [],
                isValid: function () {
                    var me = this;
                    var display = me.down("[name=" + me.name + "Display]");
                    display.allowBlank = me.allowBlank;
                    return display.isValid();
                },
                getName: function () {
                    return this.name;
                },
                getValue: function () {
                    var me = this;
                    if (me.submitValue) {
                        var value = me.down("[name=" + me.name + "]");
                        return value.getValue();
                    }
                    return me.getText();
                },
                getText: function () {
                    var me = this;
                    var display = me.down("[name=" + me.name + "Display]");
                    return display.getValue();
                },
                setRecordValue: function (record) {
                    var me = this;
                    if (record) {
                        if (Ext.isEmpty(me.getText()) && Ext.isEmpty(record.get(me.dataIndex))) {
                            return;
                        }
                        if (record.store) {
                            record.store.holdUpdate = true;
                        }
                        record.set(me.name, me.getValue());
                        record.set(me.dataIndex, me.getText());
                        if (me.record) {
                            for (var i = 0; i < me.binds.length; i++) {
                                var bindSet = me.binds[i];
                                var setArray = bindSet.toString().split("@");
                                if (setArray.length > 1) {
                                    var linkFieldName = setArray[0];
                                    var linkValue = me.record.get(linkFieldName);
                                    for (var j = 1; j < setArray.length; j++) {
                                        record.set(setArray[j], linkValue);
                                    }
                                }
                            }
                        }
                        if (record.store) {
                            record.store.holdUpdate = false;
                            record.store.fireEvent("endupdate");
                        }
                    }
                },
                setValue: function (val, record) {
                    var me = this;
                    var display = me.down("[name=" + me.name + "Display]");
                    display.setValue(val);
                    if (record) {
                        me.setRawValue(record.get(me.name));
                    }
                    if (!val) { //清空数据
                        me.setRawValue(-1);
                        var moreFieldContainer = me.down("[name=" + me.name + "MoreFields]");
                        moreFieldContainer.removeAll(true);
                    }
                },
                setHtml: function (val) {
                    this.setValue(val);
                },
                setRawValue: function (val, moreValues) {
                    var me = this;
                    var value = me.down("[name=" + me.name + "]");
                    if (value) {
                        value.setValue(val);
                    }
                    var moreFieldContainer = me.down("[name=" + me.name + "MoreFields]");
                    moreFieldContainer.removeAll(true);
                    if (moreValues) {
                        for (var i = 0; i < moreValues.length; i++) {
                            var newField = Ext.create({
                                xtype: 'hiddenfield',
                                name: me.name
                            });
                            newField.setValue(moreValues[i]);
                            moreFieldContainer.add(newField);
                        }
                    }
                    if (me.record) {
                        for (var i = 0; i < me.binds.length; i++) {
                            var bindSet = me.binds[i];
                            var setArray = bindSet.toString().split("@");
                            if (setArray.length > 1) {
                                var linkFieldName = setArray[0];
                                var linkValue = me.record.get(linkFieldName);
                                for (var j = 1; j < setArray.length; j++) {
                                    var newField = Ext.create({
                                        xtype: 'hiddenfield',
                                        name: setArray[j]
                                    });
                                    newField.setValue(linkValue);
                                    moreFieldContainer.add(newField);
                                }
                            }
                        }
                    }
                },
                getRawValue: function () {
                    var me = this;
                    var value = me.down("[name=" + me.name + "]");
                    if (value) {
                        return value.getValue();
                    }
                    return null;
                },
                getMenu: function () {
                    return this.up("menu");
                },
                selectData: function (callback) {
                    var me = this;
                    if (Ext.isFunction(me.onBeforeSelect)) {
                        if (!me.onBeforeSelect(me)) {
                            return;
                        }
                    }
                    if (me.getMenu()) {
                        me.getMenu().holdShow = true;
                    }
                    if (!me.entityCode) {
                        FastExt.Dialog.showAlert("系统提醒", "请配置组件的entityCode属性值！", function () {
                            if (me.getMenu()) {
                                me.getMenu().holdShow = false;
                            }
                        });
                        return;
                    }
                    if (!me.entityId) {
                        FastExt.Dialog.showAlert("系统提醒", "请配置组件的entityId属性值！", function () {
                            if (me.getMenu()) {
                                me.getMenu().holdShow = false;
                            }
                        });
                        return;
                    }
                    if (!me.entityText) {
                        FastExt.Dialog.showAlert("系统提醒", "请配置组件的entityText属性值！", function () {
                            if (me.getMenu()) {
                                me.getMenu().holdShow = false;
                            }
                        });
                        return;
                    }
                    var entity = FastExt.System.getEntity(me.entityCode);
                    if (!entity) {
                        FastExt.Dialog.showAlert("系统提醒", "未获取到 '" + me.entityCode + "' 实体类！", function () {
                            if (me.getMenu()) {
                                me.getMenu().holdShow = false;
                            }
                        });
                        return;
                    }
                    if (!entity.js) {
                        FastExt.Dialog.showAlert("系统提醒", "未获取到 '" + me.entityCode + "' JS对象！", function () {
                            if (me.getMenu()) {
                                me.getMenu().holdShow = false;
                            }
                        });
                        return;
                    }
                    var entityObj = eval("new " + me.entityCode + "()");
                    if (!Ext.isFunction(entityObj.showSelect)) {
                        FastExt.Dialog.showAlert("系统提醒", "'" + me.entityCode + "' JS对象不存在函数showSelect(obj,callBack)！", function () {
                            if (me.getMenu()) {
                                me.getMenu().holdShow = false;
                            }
                        });
                        return;
                    }
                    var display = me.down("[name=" + me.name + "Display]");
                    display.blur();
                    var selectTitle = entity.shortName;
                    if (me.fieldLabel) {
                        selectTitle = me.fieldLabel;
                    }
                    if (me.labelTitle) {
                        selectTitle = me.labelTitle;
                    }
                    entityObj.showSelect(this, "选择" + selectTitle, me.linkValue.where, me.multiSelect).then(function (result) {
                        if (result) {
                            if (Ext.isFunction(callback)) {
                                callback(result);
                                return;
                            }
                            if (result.length === 1) {
                                var data = result[0];
                                me.record = data;
                                me.setValue(data.get(me.entityText));
                                me.setRawValue(data.get(me.entityId));
                            }
                            else if (result.length > 1) {
                                me.record = result[0];
                                me.records = result;
                                var newText = "";
                                var moreValues = [];
                                for (var i = 0; i < result.length; i++) {
                                    var textValue = result[i].get(me.entityText);
                                    if (Ext.isEmpty(textValue)) {
                                        textValue = "无";
                                    }
                                    newText += "#" + textValue;
                                    moreValues.push(result[i].get(me.entityId));
                                }
                                me.setRawValue(moreValues[0], moreValues.slice(1));
                                me.setValue(newText.substring(1));
                            }
                            if (Ext.isFunction(me.onAfterSelect)) {
                                me.onAfterSelect(me);
                            }
                        }
                        if (me.getMenu()) {
                            me.getMenu().holdShow = false;
                        }
                    });
                },
                clearData: function () {
                    var me = this;
                    me.setValue(null);
                    me.setRawValue(-1);
                    var moreFieldContainer = me.down("[name=" + me.name + "MoreFields]");
                    moreFieldContainer.removeAll(true);
                    if (Ext.isFunction(me.onClearSelect)) {
                        me.onClearSelect(me);
                    }
                },
                initComponent: function () {
                    var me = this;
                    if (window["getLinkFieldDefaultValue"]) {
                        var defaultLinkValue = window["getLinkFieldDefaultValue"](me);
                        if (defaultLinkValue) {
                            if (me.linkValue) {
                                me.linkValue = FastExt.Json.mergeJson(me.linkValue, defaultLinkValue);
                            }
                            else {
                                me.linkValue = defaultLinkValue;
                            }
                        }
                    }
                    if (!me.linkValue) {
                        me.linkValue = {};
                        me.linkValue[me.entityId] = me.entityIdDefaultValue;
                        me.linkValue[me.entityText] = null;
                    }
                    if (!me.linkValue.hasOwnProperty(me.entityId)) {
                        me.linkValue[me.entityId] = me.entityIdDefaultValue;
                    }
                    if (Ext.isEmpty(me.linkValue[me.entityId])) {
                        me.linkValue[me.entityId] = me.entityIdDefaultValue;
                    }
                    if (Ext.isEmpty(me.name)) {
                        me.name = "LinkField" + Ext.now();
                    }
                    var displayValue = me.linkValue[me.entityText];
                    if (!displayValue) {
                        displayValue = me.value;
                    }
                    var moreFieldItems = [];
                    for (var i = 0; i < me.binds.length; i++) {
                        var bindSet = me.binds[i];
                        var setArray = bindSet.toString().split("@");
                        if (setArray.length > 1) {
                            var linkFieldName = setArray[0];
                            var linkValue = me.linkValue[linkFieldName];
                            for (var j = 1; j < setArray.length; j++) {
                                moreFieldItems.push({
                                    xtype: 'hiddenfield',
                                    name: setArray[j],
                                    value: linkValue
                                });
                            }
                        }
                    }
                    me.items = [
                        {
                            xtype: 'hiddenfield',
                            name: me.name,
                            value: me.linkValue[me.entityId]
                        },
                        {
                            xtype: 'fieldcontainer',
                            name: me.name + "MoreFields",
                            hidden: true,
                            items: moreFieldItems
                        },
                        {
                            xtype: 'textfield',
                            name: me.name + "Display",
                            editable: me.editable,
                            value: displayValue,
                            disabled: me.linkValue[me.entityText] != null && me.autoDisabled,
                            hideLabel: true,
                            fieldLabel: me.fieldLabel,
                            allowBlank: me.allowBlank,
                            emptyText: '请选择',
                            listeners: {
                                afterrender: function (obj) {
                                    if (!this.editable) {
                                        obj.inputEl.on('click', function () {
                                            me.selectData();
                                        });
                                    }
                                }
                            },
                            triggers: {
                                close: {
                                    cls: 'text-clear',
                                    handler: function () {
                                        me.clearData();
                                        if (Ext.isFunction(me.onClearValue)) {
                                            me.onClearValue();
                                        }
                                    }
                                },
                                search: {
                                    cls: 'text-search',
                                    handler: function () {
                                        me.selectData();
                                        this.inputEl.blur();
                                    }
                                }
                            }
                        }
                    ];
                    me.callParent(arguments);
                }
            });
        }
        return LinkField;
    }());
    FastDefine.LinkField = LinkField;
    /**
     * Target组件，适用于一个表格关联多个表格
     */
    var TargetField = /** @class */ (function () {
        function TargetField() {
            Ext.define("Fast.ext.Target", {
                alias: ['widget.target', 'widget.targetfield'],
                extend: 'Ext.form.FieldContainer',
                layout: "column",
                labelWidth: null,
                targetType: null,
                targetTypeReadOnly: false,
                targetTypeEnum: null,
                targetId: null,
                targetValue: {},
                targetFunction: 'getTargetEntity',
                targetEnumValue: 'id',
                targetEnumText: 'text',
                include: [],
                exclude: [],
                getValue: function () {
                    var me = this;
                    var targetIdCmp = me.down("[name=" + me.targetId + "]");
                    return targetIdCmp.getText();
                },
                setValue: function (val, record) {
                    var me = this;
                    var targetIdCmp = me.down("[name=" + me.targetId + "]");
                    targetIdCmp.setValue(val);
                    if (record) {
                        me.targetValue = {};
                        me.targetValue[me.targetType] = record.get(me.targetType);
                        me.targetValue[me.targetId] = record.get(me.targetId);
                        me.holdIdValue = me.getTargetTypeValue() != record.get(me.targetType);
                        me.setTargetIdValue(record.get(me.targetId));
                        me.setTargetTypeValue(record.get(me.targetType));
                    }
                },
                setHtml: function (val) {
                    this.setValue(val);
                },
                getSearchField: function () {
                },
                setRecordValue: function (record) {
                    var me = this;
                    if (record) {
                        if (record.store) {
                            record.store.holdUpdate = true;
                        }
                        if (me.targetId) {
                            record.set(me.targetId, me.getTargetIdValue());
                        }
                        if (me.targetType) {
                            record.set(me.targetType, me.getTargetTypeValue());
                        }
                        if (me.targetText && me.targetText != me.dataIndex) {
                            record.set(me.targetText, me.getValue());
                        }
                        record.set(me.dataIndex, me.getValue());
                        if (record.store) {
                            record.store.holdUpdate = false;
                            record.store.fireEvent("endupdate");
                        }
                    }
                },
                setTargetTypeValue: function (value) {
                    var me = this;
                    var targetTypeCmp = me.down("[name=" + me.targetType + "]");
                    if (targetTypeCmp) {
                        targetTypeCmp.setValue(value);
                    }
                },
                getTargetTypeValue: function () {
                    var me = this;
                    var targetTypeCmp = me.down("[name=" + me.targetType + "]");
                    if (targetTypeCmp) {
                        return targetTypeCmp.getValue();
                    }
                    return 0;
                },
                setTargetIdValue: function (value) {
                    var me = this;
                    var targetIdCmp = me.down("[name=" + me.targetId + "]");
                    if (targetIdCmp) {
                        targetIdCmp.setRawValue(value);
                    }
                },
                getTargetIdValue: function () {
                    var me = this;
                    var targetIdCmp = me.down("[name=" + me.targetId + "]");
                    if (targetIdCmp) {
                        return targetIdCmp.getRawValue();
                    }
                    return -1;
                },
                getTargetEntity: function (targetType) {
                    var me = this;
                    var targetEntity = window[me.targetFunction](targetType, me.targetType);
                    if (!targetEntity) {
                        FastExt.Dialog.showAlert("目标组件错误", "未获取到TargetType为：" + targetType + "的实体配置！");
                        return null;
                    }
                    return targetEntity;
                },
                showWindow: function (obj, callBack, title) {
                    if (Ext.isEmpty(title)) {
                        title = "编辑目标数据";
                    }
                    var me = this;
                    if (!me.editorWin) {
                        me.editorWin = Ext.create('Ext.window.Window', {
                            title: title,
                            height: 220,
                            width: 400,
                            minWidth: 400,
                            minHeight: 220,
                            layout: 'fit',
                            resizable: true,
                            modal: true,
                            constrain: true,
                            closeAction: 'hide',
                            iconCls: 'extIcon extLink',
                            items: [me],
                            buttons: [
                                {
                                    text: '取消',
                                    iconCls: 'extIcon extClose',
                                    handler: function () {
                                        me.editorWin.close();
                                    }
                                },
                                {
                                    text: '确定',
                                    iconCls: 'extIcon extOk',
                                    handler: function () {
                                        me.editorWin.close();
                                        if (Ext.isFunction(me.editorWin.callBack)) {
                                            me.editorWin.callBack(me);
                                        }
                                    }
                                }
                            ]
                        });
                    }
                    me.editorWin.setTitle(title);
                    me.editorWin.callBack = callBack;
                    me.editorWin.animateTarget = obj;
                    me.editorWin.show();
                },
                initComponent: function () {
                    var me = this;
                    var configLabel = me.fieldLabel;
                    if (Ext.isEmpty(configLabel)) {
                        configLabel = "目标类型";
                    }
                    me.fieldLabel = "";
                    if (!me.labelWidth) {
                        me.labelWidth = 60;
                    }
                    me.labelAlign = 'right';
                    if (!me.emptyText) {
                        me.emptyText = "请填写";
                    }
                    if (!me.margin) {
                        me.margin = '5 5 5 5';
                    }
                    var linkValue = {};
                    if (!Ext.isFunction(window[me.targetFunction])) {
                        FastExt.Dialog.showAlert("目标组件错误", "未检测到方法" + me.targetFunction + "!");
                        me.callParent(arguments);
                        return;
                    }
                    if (!me.targetValue) {
                        me.targetValue = {};
                        me.targetValue[me.targetType] = 0;
                        me.targetValue[me.targetId] = -1;
                    }
                    if (!me.targetValue[me.targetType]) {
                        me.targetValue[me.targetType] = 0;
                    }
                    if (!me.targetValue[me.targetId]) {
                        me.targetValue[me.targetId] = -1;
                    }
                    if (me.targetEnum) {
                        me.targetTypeEnum = me.targetEnum;
                    }
                    if (!me.targetTypeEnum) {
                        me.targetTypeEnum = me.targetType.replace(me.targetType[0], me.targetType[0].toUpperCase()) + "Enum";
                    }
                    var targetTypeValue = me.targetValue[me.targetType];
                    var targetEntity = me.getTargetEntity(targetTypeValue);
                    if (!targetEntity) {
                        return;
                    }
                    linkValue[targetEntity.entityId] = me.targetValue[me.targetId];
                    linkValue[targetEntity.entityText] = me.targetValue["targetText"];
                    var targetTypeCmp = {
                        name: me.targetType,
                        xtype: "enumcombo",
                        fieldLabel: configLabel,
                        columnWidth: 1,
                        value: targetTypeValue,
                        labelWidth: me.labelWidth,
                        labelAlign: me.labelAlign,
                        emptyText: '请选择' + configLabel,
                        margin: me.margin,
                        allowBlank: false,
                        enumValue: me.targetEnumValue,
                        enumText: me.targetEnumText,
                        readOnly: me.targetTypeReadOnly,
                        enumName: me.targetTypeEnum,
                        exclude: me.exclude,
                        include: me.include,
                        listeners: {
                            change: function (obj, newValue, oldValue) {
                                var newEntity = me.getTargetEntity(newValue);
                                if (newEntity) {
                                    var targetIdCmp_1 = me.down("[name=" + me.targetId + "]");
                                    targetIdCmp_1.entityCode = newEntity.entityCode;
                                    targetIdCmp_1.entityId = newEntity.entityId;
                                    targetIdCmp_1.entityText = newEntity.entityText;
                                    if (me.holdIdValue) {
                                        me.holdIdValue = false;
                                        return;
                                    }
                                    targetIdCmp_1.setValue(null);
                                }
                            }
                        }
                    };
                    var targetIdCmp = {
                        name: me.targetId,
                        xtype: "linkfield",
                        fieldLabel: "目标数据",
                        columnWidth: 1,
                        margin: me.margin,
                        labelWidth: me.labelWidth,
                        labelAlign: me.labelAlign,
                        entityCode: targetEntity.entityCode,
                        entityId: targetEntity.entityId,
                        entityText: targetEntity.entityText,
                        linkValue: linkValue,
                        multiSelect: me.multiSelect
                    };
                    me.items = [targetTypeCmp, targetIdCmp];
                    me.callParent(arguments);
                }
            });
        }
        return TargetField;
    }());
    FastDefine.TargetField = TargetField;
    /**
     * 地图位置组件
     */
    var MapField = /** @class */ (function () {
        function MapField() {
            Ext.define("Fast.ext.Map", {
                alias: ['widget.map', 'widget.mapfield'],
                extend: 'Ext.form.FieldContainer',
                lngName: 'lnt',
                latName: 'lat',
                proName: null,
                cityName: null,
                areaName: null,
                editable: false,
                emptyText: '请选择',
                allowBlank: true,
                layout: 'fit',
                submitValue: true,
                isValid: function () {
                    var me = this;
                    var value = me.down("[name=" + me.name + "]");
                    return value.isValid();
                },
                getName: function () {
                    return this.name;
                },
                getValue: function () {
                    var me = this;
                    var value = me.down("[name=" + me.name + "]");
                    return value.getValue();
                },
                setValue: function (val, record) {
                    var me = this;
                    var value = me.down("[name=" + me.name + "]");
                    value.setValue(val);
                    if (record) {
                        if (me.latName) {
                            me.setLatValue(record.get(me.latName));
                        }
                        if (me.lngName) {
                            me.setLngValue(record.get(me.lngName));
                        }
                        if (me.proName) {
                            me.setProValue(record.get(me.proName));
                        }
                        if (me.cityName) {
                            me.setCityValue(record.get(me.cityName));
                        }
                        if (me.areaName) {
                            me.setAreaValue(record.get(me.areaName));
                        }
                    }
                },
                setRecordValue: function (record) {
                    var me = this;
                    if (record) {
                        if (record.store) {
                            record.store.holdUpdate = true;
                        }
                        if (me.latName) {
                            record.set(me.latName, me.getLatValue());
                        }
                        if (me.lngName) {
                            record.set(me.lngName, me.getLngValue());
                        }
                        if (me.proName) {
                            record.set(me.proName, me.getProValue());
                        }
                        if (me.cityName) {
                            record.set(me.cityName, me.getCityValue());
                        }
                        if (me.areaName) {
                            record.set(me.areaName, me.getAreaValue());
                        }
                        record.set(me.name, me.getValue());
                        if (record.store) {
                            record.store.holdUpdate = false;
                            record.store.fireEvent("endupdate");
                        }
                    }
                },
                setLatValue: function (val) {
                    var me = this;
                    var lat = me.down("[name=" + me.latName + "]");
                    if (lat) {
                        lat.setValue(val);
                    }
                },
                setLngValue: function (val) {
                    var me = this;
                    var lng = me.down("[name=" + me.lngName + "]");
                    if (lng) {
                        lng.setValue(val);
                    }
                },
                setProValue: function (val) {
                    var me = this;
                    var pro = me.down("[name=" + me.proName + "]");
                    if (pro) {
                        pro.setValue(val);
                    }
                },
                setCityValue: function (val) {
                    var me = this;
                    var city = me.down("[name=" + me.cityName + "]");
                    if (city) {
                        city.setValue(val);
                    }
                },
                setAreaValue: function (val) {
                    var me = this;
                    var area = me.down("[name=" + me.areaName + "]");
                    if (area) {
                        area.setValue(val);
                    }
                },
                getLatValue: function () {
                    var me = this;
                    var lat = me.down("[name=" + me.latName + "]");
                    if (lat) {
                        return lat.getValue();
                    }
                    return 0;
                },
                getLngValue: function () {
                    var me = this;
                    var lng = me.down("[name=" + me.lngName + "]");
                    if (lng) {
                        return lng.getValue();
                    }
                    return 0;
                },
                getProValue: function () {
                    var me = this;
                    var pro = me.down("[name=" + me.proName + "]");
                    if (pro) {
                        return pro.getValue();
                    }
                    return null;
                },
                getCityValue: function () {
                    var me = this;
                    var city = me.down("[name=" + me.cityName + "]");
                    if (city) {
                        return city.getValue();
                    }
                    return null;
                },
                getAreaValue: function () {
                    var me = this;
                    var area = me.down("[name=" + me.areaName + "]");
                    if (area) {
                        return area.getValue();
                    }
                    return null;
                },
                getMenu: function () {
                    return this.up("menu");
                },
                selectData: function () {
                    var me = this;
                    if (me.getMenu()) {
                        me.getMenu().holdShow = true;
                    }
                    var value = me.down("[name=" + me.name + "]");
                    value.blur();
                    FastExt.Map.selAddressInMap(me, me.getLngValue(), me.getLatValue(), me.getValue()).then(function (result) {
                        if (result) {
                            me.setLatValue(result.lat);
                            me.setLngValue(result.lng);
                            me.setProValue(result.pro);
                            me.setAreaValue(result.area);
                            me.setCityValue(result.city);
                            me.setValue(result.addr);
                        }
                        if (me.getMenu()) {
                            me.getMenu().holdShow = false;
                        }
                    });
                },
                clearData: function () {
                    var me = this;
                    me.setValue(null);
                    me.setLatValue(0);
                    me.setLngValue(0);
                },
                initComponent: function () {
                    var me = this;
                    if (!me.name) {
                        me.name = me.dataIndex;
                    }
                    if (Ext.isEmpty(me.name)) {
                        me.name = "MapField" + Ext.now();
                    }
                    me.items = [
                        {
                            xtype: 'hiddenfield',
                            name: me.lngName,
                            value: 0
                        },
                        {
                            xtype: 'hiddenfield',
                            name: me.latName,
                            value: 0
                        },
                        {
                            xtype: 'hiddenfield',
                            name: me.proName
                        },
                        {
                            xtype: 'hiddenfield',
                            name: me.cityName
                        },
                        {
                            xtype: 'hiddenfield',
                            name: me.areaName
                        },
                        {
                            xtype: 'textfield',
                            name: me.name,
                            editable: me.editable,
                            fieldLabel: me.fieldLabel,
                            hideLabel: true,
                            allowBlank: me.allowBlank,
                            emptyText: me.emptyText,
                            listeners: {
                                afterrender: function (obj) {
                                    if (!this.editable) {
                                        obj.inputEl.on('click', function () {
                                            me.selectData();
                                        });
                                    }
                                }
                            },
                            triggers: {
                                close: {
                                    cls: 'text-clear',
                                    handler: function () {
                                        me.clearData();
                                        if (Ext.isFunction(me.onClearValue)) {
                                            me.onClearValue();
                                        }
                                    }
                                },
                                search: {
                                    cls: 'text-search',
                                    handler: function () {
                                        me.selectData();
                                        this.inputEl.blur();
                                    }
                                }
                            }
                        }
                    ];
                    me.callParent(arguments);
                }
            });
        }
        return MapField;
    }());
    FastDefine.MapField = MapField;
    /**
     * 省市区组件
     */
    var PCAField = /** @class */ (function () {
        function PCAField() {
            Ext.define("Fast.ext.PCA", {
                alias: ['widget.pca', 'widget.pcafield'],
                extend: 'Ext.form.field.Text',
                proName: null,
                cityName: null,
                areaName: null,
                onAfterSelect: null,
                level: null,
                selectType: 0,
                setRecordValue: function (record, autoClearData) {
                    var me = this;
                    autoClearData = FastExt.Base.toBool(autoClearData, true);
                    if (record) {
                        if (record.store) {
                            record.store.holdUpdate = true;
                        }
                        if (me.proName && me.name !== me.proName && me.province) {
                            record.set(me.proName, me.province.provinceName);
                        }
                        if (me.cityName && me.name !== me.cityName && me.city) {
                            record.set(me.cityName, me.city.cityName);
                        }
                        if (me.areaName && me.name !== me.areaName && me.area) {
                            record.set(me.areaName, me.area.areaName);
                        }
                        record.set(me.name, me.getValue());
                        if (record.store) {
                            record.store.holdUpdate = false;
                            record.store.fireEvent("endupdate");
                        }
                    }
                    if (autoClearData) {
                        me.clearData();
                    }
                },
                getMenu: function () {
                    return this.up("menu");
                },
                selectData: function () {
                    var me = this;
                    if (me.getMenu()) {
                        me.getMenu().holdShow = true;
                    }
                    if (!Ext.isFunction(window["selectPCA"])) {
                        FastExt.Dialog.showAlert("系统提醒", "未检测到函数selectPCA！请导入FastChar-Location插件！", function () {
                            if (me.getMenu()) {
                                me.getMenu().holdShow = false;
                            }
                        });
                        return;
                    }
                    me.blur();
                    window["selectPCA"](me, function (success, province, city, area) {
                        if (!FastExt.Base.toBool(success, false)) {
                            if (me.getMenu()) {
                                me.getMenu().holdShow = false;
                            }
                            return;
                        }
                        me.province = province;
                        me.area = area;
                        me.city = city;
                        var formPanel = me.up("form");
                        if (formPanel) {
                            if (province && me.proName) {
                                formPanel.setFieldValue(me.proName, province.provinceName);
                            }
                            if (city && me.cityName) {
                                formPanel.setFieldValue(me.cityName, city.cityName);
                            }
                            if (area && me.areaName) {
                                formPanel.setFieldValue(me.areaName, area.areaName);
                            }
                        }
                        var normalValue = "";
                        if (province) {
                            normalValue = province.provinceName;
                            if (me.name === me.proName) {
                                me.setValue(province.provinceName);
                                normalValue = null;
                            }
                        }
                        if (city) {
                            if (normalValue) {
                                if (me.selectType === 0) {
                                    normalValue += " " + city.cityName;
                                }
                                else {
                                    normalValue = city.cityName;
                                }
                            }
                            if (me.name === me.cityName) {
                                me.setValue(city.cityName);
                                normalValue = null;
                            }
                        }
                        if (area) {
                            if (normalValue) {
                                if (me.selectType === 0) {
                                    normalValue += " " + area.areaName;
                                }
                                else {
                                    normalValue = area.areaName;
                                }
                            }
                            if (me.name === me.areaName) {
                                me.setValue(area.areaName);
                                normalValue = null;
                            }
                        }
                        if (normalValue) {
                            me.setValue(normalValue);
                        }
                        if (me.getMenu()) {
                            me.getMenu().holdShow = false;
                        }
                        if (Ext.isFunction(me.onAfterSelect)) {
                            me.onAfterSelect(me);
                        }
                    }, me.level);
                },
                clearData: function () {
                    var me = this;
                    me.setValue(null);
                    me.province = null;
                    me.area = null;
                    me.city = null;
                },
                triggers: {
                    close: {
                        cls: 'text-clear',
                        handler: function () {
                            this.clearData();
                            if (Ext.isFunction(this.onClearValue)) {
                                this.onClearValue();
                            }
                        }
                    },
                    search: {
                        cls: 'text-search',
                        handler: function () {
                            this.selectData();
                            this.inputEl.blur();
                        }
                    }
                },
                listeners: {
                    afterrender: function (obj) {
                        var me = this;
                        if (!this.editable) {
                            obj.inputEl.on('click', function () {
                                me.selectData();
                            });
                        }
                    }
                },
                initComponent: function () {
                    this.emptyText = "请选择省市区";
                    this.editable = false;
                    this.province = null;
                    this.area = null;
                    this.city = null;
                    this.callParent(arguments);
                }
            });
        }
        return PCAField;
    }());
    FastDefine.PCAField = PCAField;
    /**
     * 时间区间组件
     */
    var DateRangeField = /** @class */ (function () {
        function DateRangeField() {
            Ext.define("Fast.ext.DateRange", {
                alias: ['widget.daterange', 'widget.daterangefield'],
                extend: 'Ext.form.field.Text',
                beginDate: null,
                endDate: null,
                editable: true,
                allowBlank: true,
                maxRangeDate: -1,
                maxRangeMonth: -1,
                maxRangeYear: -1,
                layout: 'column',
                format: 'Y-m-d',
                submitValue: true,
                onAfterSelect: null,
                onClearValue: null,
                getMenu: function () {
                    return this.up("menu");
                },
                selectData: function () {
                    var me = this;
                    if (me.getMenu()) {
                        me.getMenu().holdShow = true;
                    }
                    var time = Ext.now();
                    var dateRangeMenu = Ext.create('Ext.menu.Menu', {
                        floating: true,
                        items: [{
                                xtype: 'panel',
                                padding: '10 10 10 10',
                                layout: 'column',
                                style: {
                                    background: "#ffffff",
                                    borderWidth: 1,
                                    borderColor: "#ffffff",
                                    color: '#eeeee'
                                },
                                border: 0,
                                items: [
                                    {
                                        xtype: 'combo',
                                        fieldLabel: '快速选择',
                                        valueField: 'value',
                                        labelWidth: 60,
                                        margin: '5 5 5 5',
                                        editable: false,
                                        columnWidth: 1,
                                        triggers: {
                                            close: {
                                                cls: 'text-clear',
                                                handler: function () {
                                                    this.setValue(null);
                                                    me.clearData();
                                                }
                                            }
                                        },
                                        listeners: {
                                            change: function (obj, newValue, oldValue, eOpts) {
                                                if (!newValue) {
                                                    return;
                                                }
                                                me.endDate = Ext.Date.format(new Date(), me.format);
                                                if (newValue === 6) {
                                                    me.beginDate = Ext.Date.format(new Date(), me.format);
                                                }
                                                else if (newValue === 1) {
                                                    me.beginDate = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.DAY, -7), me.format);
                                                }
                                                else if (newValue === 2) {
                                                    me.beginDate = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MONTH, -1), me.format);
                                                }
                                                else if (newValue === 3) {
                                                    me.beginDate = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MONTH, -3), me.format);
                                                }
                                                else if (newValue === 4) {
                                                    me.beginDate = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MONTH, -6), me.format);
                                                }
                                                else if (newValue === 5) {
                                                    me.beginDate = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.YEAR, -1), me.format);
                                                }
                                                var error = me.refreshValue();
                                                if (error) {
                                                    FastExt.Dialog.toast(error);
                                                    obj.setValue(null);
                                                    me.clearData();
                                                    FastExt.Component.shakeComment(dateRangeMenu);
                                                    return;
                                                }
                                                Ext.getCmp("beginDate" + time).setValue(me.beginDate);
                                                Ext.getCmp("endDate" + time).setValue(me.endDate);
                                            }
                                        },
                                        store: Ext.create('Ext.data.Store', {
                                            data: [
                                                {
                                                    'text': '今天',
                                                    'value': 6
                                                },
                                                {
                                                    'text': '近一周',
                                                    'value': 1
                                                },
                                                {
                                                    'text': '近一个月',
                                                    "value": 2
                                                },
                                                {
                                                    'text': '近三个月',
                                                    "value": 3
                                                },
                                                {
                                                    'text': '近六个月',
                                                    "value": 4
                                                },
                                                {
                                                    'text': '近一年',
                                                    "value": 5
                                                }
                                            ]
                                        })
                                    },
                                    {
                                        fieldLabel: '开始日期',
                                        margin: '5 5 5 5',
                                        xtype: 'datefield',
                                        id: 'beginDate' + time,
                                        columnWidth: 1,
                                        labelWidth: 60,
                                        format: me.format,
                                        value: me.beginDate,
                                        emptyText: '开始日期'
                                    }, {
                                        fieldLabel: '结束日期',
                                        margin: '5 5 5 5',
                                        xtype: 'datefield',
                                        id: 'endDate' + time,
                                        columnWidth: 1,
                                        labelWidth: 60,
                                        format: me.format,
                                        value: me.endDate,
                                        emptyText: '结束日期'
                                    },
                                    {
                                        xtype: 'panel',
                                        layout: 'hbox',
                                        columnWidth: 1,
                                        border: 0,
                                        items: [
                                            {
                                                xtype: 'button',
                                                text: '确定',
                                                margin: '5 5 5 5',
                                                flex: 0.42,
                                                handler: function () {
                                                    var bDate = Ext.getCmp("beginDate" + time).getValue();
                                                    var eDate = Ext.getCmp("endDate" + time).getValue();
                                                    me.beginDate = Ext.util.Format.date(bDate, me.format);
                                                    me.endDate = Ext.util.Format.date(eDate, me.format);
                                                    if (Ext.isEmpty(me.beginDate)) {
                                                        me.beginDate = Ext.Date.format(new Date(0), me.format);
                                                    }
                                                    if (Ext.isEmpty(me.endDate)) {
                                                        me.endDate = Ext.Date.format(new Date(), me.format);
                                                    }
                                                    var error = me.refreshValue();
                                                    if (error) {
                                                        FastExt.Dialog.toast(error);
                                                        FastExt.Component.shakeComment(dateRangeMenu);
                                                        return;
                                                    }
                                                    if (Ext.isFunction(me.onAfterSelect)) {
                                                        me.onAfterSelect(me);
                                                    }
                                                    dateRangeMenu.close();
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }]
                    });
                    dateRangeMenu.setWidth(Math.max(this.getWidth(), 200));
                    dateRangeMenu.showBy(this, "tl-bl?");
                },
                clearData: function () {
                    var me = this;
                    me.setValue(null);
                    me.beginDate = null;
                    me.endDate = null;
                },
                refreshValue: function () {
                    var me = this;
                    me.setValue(null);
                    var bDate = Ext.Date.parse(me.beginDate, me.format);
                    var eDate = Ext.Date.parse(me.endDate, me.format);
                    if (bDate > eDate) {
                        me.clearData();
                        return "开始日期必须小于等于结束日期！";
                    }
                    if (me.maxRangeDate > 0) {
                        var maxEndDate = Ext.Date.add(bDate, Ext.Date.DAY, me.maxRangeDate);
                        if (!Ext.Date.between(eDate, bDate, maxEndDate)) {
                            me.clearData();
                            return "日期范围区间必须在" + me.maxRangeDate + "天以内！";
                        }
                    }
                    if (me.maxRangeMonth > 0) {
                        var maxEndDate = Ext.Date.add(bDate, Ext.Date.MONTH, me.maxRangeMonth);
                        if (!Ext.Date.between(eDate, bDate, maxEndDate)) {
                            me.clearData();
                            return "日期范围区间必须在" + me.maxRangeMonth + "个月以内！";
                        }
                    }
                    if (me.maxRangeYear > 0) {
                        var maxEndDate = Ext.Date.add(bDate, Ext.Date.YEAR, me.maxRangeYear);
                        if (!Ext.Date.between(eDate, bDate, maxEndDate)) {
                            me.clearData();
                            return "日期范围区间必须在" + me.maxRangeYear + "年以内！";
                        }
                    }
                    me.setValue(me.beginDate + " 至 " + me.endDate);
                    if (Ext.Date.isEqual(bDate, eDate)) {
                        me.setValue("今天");
                    }
                    return null;
                },
                triggers: {
                    close: {
                        cls: 'text-clear',
                        handler: function () {
                            this.clearData();
                            if (Ext.isFunction(this.onClearValue)) {
                                this.onClearValue();
                            }
                        }
                    },
                    search: {
                        cls: 'text-search',
                        handler: function () {
                            this.selectData();
                            this.inputEl.blur();
                        }
                    }
                },
                initComponent: function () {
                    this.editable = false;
                    this.refreshValue();
                    this.callParent(arguments);
                }
            });
        }
        return DateRangeField;
    }());
    FastDefine.DateRangeField = DateRangeField;
    /**
     * 日期时间选择组件
     */
    var DateField = /** @class */ (function () {
        function DateField() {
            Ext.define("Fast.ext.Date", {
                alias: ['widget.date', 'widget.datefield'],
                extend: 'Ext.form.field.Text',
                format: 'Y-m-d H:i:s',
                getMenu: function () {
                    return this.up("menu");
                },
                isValid: function () {
                    var me = this;
                    if (me.callParent(arguments)) {
                        if (!Ext.isEmpty(me.getValue())) {
                            var date = Ext.Date.parse(me.getValue(), this.format);
                            if (!date) {
                                me.invalidText = "日期格式错误！格式必须为：" + this.format;
                                me.markInvalid(this.invalidText);
                                return false;
                            }
                        }
                        return true;
                    }
                    return false;
                },
                selectData: function () {
                    var me = this;
                    if (me.getMenu() != null) {
                        me.getMenu().holdShow = true;
                    }
                    FastExt.Dialog.showFastDatePicker(me, me.getValue(), this.format).then(function (dateValue) {
                        if (me.getMenu() != null) {
                            me.getMenu().holdShow = false;
                        }
                        if (dateValue) {
                            me.setValue(dateValue);
                        }
                    });
                },
                triggers: {
                    search: {
                        cls: 'x-form-date-trigger',
                        handler: function () {
                            this.selectData();
                        }
                    }
                },
                listeners: {
                    afterrender: function (obj) {
                        var me = this;
                        if (!this.editable) {
                            obj.inputEl.on('click', function () {
                                me.selectData();
                            });
                        }
                    }
                },
                initComponent: function () {
                    var me = this;
                    me.callParent(arguments);
                }
            });
        }
        return DateField;
    }());
    FastDefine.DateField = DateField;
    /**
     * 颜色选择组件
     */
    var ColorField = /** @class */ (function () {
        function ColorField() {
            Ext.define("Fast.ext.ColorField", {
                extend: 'Ext.form.field.Text',
                alias: ['widget.colorfield'],
                editable: false,
                getMenu: function () {
                    return this.up("menu");
                },
                beforeBodyEl: [
                    '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch">' +
                        '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix +
                        'colorpicker-field-swatch-inner"></div>' +
                        '</div>'
                ],
                cls: Ext.baseCSSPrefix + 'colorpicker-field',
                childEls: [
                    'swatchEl'
                ],
                setValue: function (val) {
                    val = FastExt.Color.toColor(val);
                    var me = this, inputEl = me.inputEl;
                    if (inputEl && me.emptyText && !Ext.isEmpty(val)) {
                        inputEl.removeCls(me.emptyUICls);
                        me.valueContainsPlaceholder = false;
                    }
                    me.callParent(arguments);
                    me.applyEmptyText();
                    Ext.ux.colorpick.ColorUtils.setBackground(me.swatchEl, Ext.ux.colorpick.ColorUtils.parseColor(val));
                    return me;
                },
                triggers: {
                    search: {
                        cls: 'extIcon extSearch',
                        handler: function () {
                            this.selectData();
                        }
                    }
                },
                selectData: function () {
                    var me = this;
                    if (me.getMenu() != null) {
                        me.getMenu().holdShow = true;
                    }
                    FastExt.Dialog.showFastColorPicker(me.inputEl, me.getValue(), function (color) {
                        me.setValue(color.toHEXA().toString());
                    }).then(function (dateValue) {
                        if (me.getMenu() != null) {
                            me.getMenu().holdShow = false;
                        }
                    });
                },
                clearData: function () {
                    var me = this;
                    me.setValue(null);
                }
            });
        }
        return ColorField;
    }());
    FastDefine.ColorField = ColorField;
    for (var subClass in FastDefine) {
        FastDefine[subClass]();
    }
})(FastDefine || (FastDefine = {}));
var FastExt;
(function (FastExt) {
    /**
     * 全局弹框相关操作
     */
    var Dialog = /** @class */ (function () {
        function Dialog() {
        }
        /**
         * 显示等待窗口
         * @param message 等待的消息
         */
        Dialog.showWait = function (message) {
            Ext.MessageBox.show({
                alwaysOnTop: true,
                modal: true,
                title: '系统提醒',
                msg: message,
                progressText: '请耐心等待，即将完成操作',
                progress: true,
                closable: false
            });
            var i = 0;
            var max = 100;
            var fn = function () {
                if (Ext.MessageBox.isHidden())
                    return;
                i = i + 0.5;
                if (i === max + 30) {
                    i = 0;
                }
                var val = i / max;
                Ext.MessageBox.updateProgress(val, '请耐心等待，即将完成操作');
                setTimeout(fn, 5);
            };
            setTimeout(fn, 5);
        };
        /**
         * 关闭等待框
         */
        Dialog.hideWait = function () {
            if (Ext.MessageBox.isVisible()) {
                Ext.MessageBox.hide();
            }
        };
        /**
         * 显示自动消失的消息
         * @param message 消息内容
         */
        Dialog.toast = function (message) {
            Ext.toast({
                html: message,
                closable: true,
                align: 't',
                slideInDuration: 200,
                slideBackDuration: 200,
                minWidth: 180,
                // alwaysOnTop: true, 不能设置
                slideBackAnimation: 'easeOut',
                iconCls: 'extIcon extInfo',
                title: '消息提示'
            });
        };
        /**
         * 弹窗显示网页内容
         * @param obj 弹框动画对象
         * @param title 标题
         * @param content 内容
         */
        Dialog.showHtml = function (obj, title, content) {
            var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
            var win = Ext.create('Ext.window.Window', {
                title: title,
                layout: 'fit',
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 600,
                constrain: true,
                resizable: true,
                maximizable: true,
                modal: true,
                maximized: false,
                iconCls: 'extIcon extSee',
                draggable: true,
                scrollable: true,
                html: content,
                alwaysOnTop: true,
                toFrontOnShow: true
            });
            win.show();
        };
        /**
         * 弹窗显示url网页内容
         * @param obj 弹框动画对象
         * @param title 标题
         * @param url 网页地址
         * @param config 扩展Ext.window.Window的配置 json对象
         */
        Dialog.showLink = function (obj, title, url, config) {
            var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
            var iframePanel = Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'center',
                border: 0,
                iframePanel: true,
                listeners: {
                    afterrender: function (obj, eOpts) {
                        this.setLoading("正在努力加载中，请稍后……");
                        var html = "<iframe onload='iFrameLoadDone()' src='" + url + "'  width='100%' height='100%' frameborder='0'>";
                        this.update(html);
                    }
                }
            });
            window["iFrameLoadDone"] = function () {
                iframePanel.setLoading(false);
            };
            var defaultConfig = {
                title: title,
                layout: 'fit',
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 600,
                resizable: true,
                maximizable: true,
                modal: true,
                constrain: true,
                maximized: false,
                iconCls: 'extIcon extSee',
                draggable: true,
                scrollable: false,
                alwaysOnTop: true,
                toFrontOnShow: true,
                items: [iframePanel],
                listeners: {
                    close: function () {
                        window["iFrameLoadDone"] = null;
                    }
                }
            };
            var win = Ext.create('Ext.window.Window', FastExt.Json.mergeJson(defaultConfig, config));
            win.show();
        };
        /**
         * 显示编辑器生成的网页内容
         * @param obj 弹框动画对象
         * @param title 标题
         * @param content 内容
         * @param config 扩展Ext.window.Window的配置 json对象
         */
        Dialog.showEditorHtml = function (obj, title, content, config) {
            var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
            var win = Ext.create('Ext.window.Window', {
                title: title,
                layout: 'fit',
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 600,
                resizable: true,
                maximizable: true,
                modal: true,
                constrain: true,
                maximized: false,
                iconCls: 'extIcon extSee',
                draggable: true,
                scrollable: false,
                alwaysOnTop: true,
                toFrontOnShow: true,
                iframePanel: true,
                listeners: {
                    show: function () {
                        var url = FastExt.System.formatUrlVersion("base/editor/show.html");
                        window["showEditorDone"] = function () {
                            window["showEditorFrame"].window.showContent(content);
                        };
                        var html = "<iframe name='showEditorFrame' src='" + url + "'  width='100%' height='100%' frameborder='0'>";
                        this.update(html);
                    }
                }
            });
            win.show();
        };
        /**
         * 显示纯文本内容
         * @param obj 弹框动画对象
         * @param icon 窗体图标
         * @param title 标题
         * @param text 内容
         */
        Dialog.showText = function (obj, icon, title, text) {
            var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
            var win = Ext.create('Ext.window.Window', {
                title: title,
                icon: icon,
                iconCls: icon,
                maximizable: true,
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 600,
                resizable: true,
                layout: 'fit',
                animateTarget: obj,
                items: [
                    {
                        xtype: 'textarea',
                        value: text
                    }
                ],
                modal: true,
                constrain: true,
                alwaysOnTop: true
            });
            win.show();
        };
        /**
         * 显示代码内容
         * @param obj 弹框动画对象
         * @param value 代码内容
         * @param linenumber 是否显示代码行数
         */
        Dialog.showCode = function (obj, value, linenumber) {
            try {
                if (obj) {
                    obj.blur();
                }
                var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                var win = Ext.create('Ext.window.Window', {
                    title: "查看内容",
                    height: winHeight,
                    width: winWidth,
                    minHeight: 500,
                    minWidth: 600,
                    animateTarget: obj,
                    resizable: true,
                    layout: 'fit',
                    maximizable: true,
                    iconCls: 'extIcon extSee',
                    autoScroll: true,
                    modal: true,
                    constrain: true,
                    bodyStyle: {
                        background: "#000000"
                    },
                    listeners: {
                        show: function (obj) {
                            PR.prettyPrint();
                        }
                    },
                });
                if (linenumber) {
                    win.update("<pre class='prettyprint linenums windowpre'>" + value + "</pre>");
                }
                else {
                    win.update("<pre class='prettyprint windowpre'>" + value + "</pre>");
                }
                win.show();
            }
            catch (e) {
                FastExt.Dialog.showText(obj, null, "查看内容", value);
            }
        };
        /**
         * 弹出异常信息
         * @param e 异常对象
         * @param from 来自功能
         */
        Dialog.showException = function (e, from) {
            if (!e)
                return;
            FastExt.Dialog.hideWait();
            console.error(e);
            var message = e;
            if (e instanceof Error) {
                message = e.stack;
                message = message.replace(/\n/g, "<br/>")
                    .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
                    .replace(/ /g, "&nbsp;&nbsp;");
            }
            if (from != null) {
                from += "，来自" + from;
            }
            else {
                from = "";
            }
            var isDebug = FastExt.System.getExt("debug").value;
            if (isDebug) {
                var win_1 = Ext.create('Ext.window.Window', {
                    title: '系统异常' + from,
                    height: 180,
                    width: 270,
                    layout: 'fit',
                    resizable: false,
                    maximizable: false,
                    constrain: true,
                    fixed: true,
                    modal: true,
                    draggable: false,
                    iconCls: 'extIcon extError',
                    html: "<div  style='padding:15px;background: #fff;' align='center'>系统发生异常，请及时告知系统管理员！</div>",
                    buttons: [{
                            text: '下次再说',
                            flex: 1,
                            handler: function () {
                                win_1.close();
                            }
                        }, {
                            text: '查看错误',
                            flex: 1,
                            handler: function () {
                                FastExt.Dialog.showCode(this, message, true);
                            }
                        }]
                });
                win_1.show();
            }
        };
        /**
         * 弹出Alert对话框
         * @param title 标题
         * @param message 消息
         * @param callBack 点击按钮的回调函数 Ext.MessageBox.fn
         * @param modal 是否有背景阴影层
         */
        Dialog.showAlert = function (title, message, callBack, modal) {
            if (Ext.isEmpty(modal)) {
                modal = true;
            }
            Ext.MessageBox.show({
                title: title,
                message: message,
                modal: modal,
                buttons: Ext.MessageBox.OK,
                fn: callBack,
                minWidth: 250
            });
        };
        /**
         * 查看图片
         * @param obj 弹框动画对象
         * @param url 图片地址 String或JsonArray
         * @param callBack 回调函数
         * @param modal 是否有背景阴影层
         */
        Dialog.showImage = function (obj, url, callBack, modal) {
            if (Ext.isEmpty(modal)) {
                modal = false;
            }
            var jsonData = [];
            if (Ext.isArray(url)) {
                jsonData = url;
            }
            else {
                jsonData.push({
                    "url": url
                });
            }
            var selectIndex = -1;
            if (Ext.getStore("ImageViewStore") != null) {
                var hasValue_1 = false;
                var currStore = Ext.getStore("ImageViewStore");
                currStore.each(function (record, index) {
                    if (record.get("url") === url) {
                        hasValue_1 = true;
                        Ext.getCmp("ImageViewGrid").getSelectionModel().select(index);
                        return false;
                    }
                });
                if (!hasValue_1) {
                    currStore.add(jsonData);
                    if (selectIndex === -1) {
                        selectIndex = currStore.count() - 1;
                    }
                    currStore.imgSelectIndex = selectIndex;
                    Ext.getCmp("ImageViewGrid").getSelectionModel().select(selectIndex);
                }
                return;
            }
            else {
                if (selectIndex === -1) {
                    selectIndex = 0;
                }
            }
            var imageStore = Ext.create('Ext.data.Store', {
                fields: ['url'],
                autoLoad: false,
                imgSelectIndex: selectIndex,
                id: "ImageViewStore",
                data: jsonData
            });
            var dataGridImages = Ext.create('Ext.grid.Panel', {
                store: imageStore,
                region: 'west',
                hideHeaders: true,
                id: "ImageViewGrid",
                width: 125,
                disabled: true,
                border: 1,
                scrollable: "y",
                columns: [{
                        header: '文件',
                        dataIndex: 'url',
                        flex: 1,
                        align: 'center',
                        renderer: function (val) {
                            if (Ext.isEmpty(val)) {
                                return "<span style='color: #ccc;'>无</span>";
                            }
                            return "<img width='30px' onerror=\"javascript:this.src='images/default_img.png';\" src='" + val + "'/>";
                        }
                    }],
                tbar: [{
                        xtype: 'button',
                        border: 1,
                        text: '打包下载',
                        iconCls: 'extIcon extDownload',
                        handler: function (obj) {
                            var params = {};
                            imageStore.each(function (record, index) {
                                params["path" + index] = record.get("url");
                            });
                            FastExt.Form.buildForm("zipFile", params).submit();
                        }
                    }],
                listeners: {
                    selectionchange: function () {
                        try {
                            var time = 0;
                            if (this.getStore().getCount() > 1) {
                                this.setHidden(false);
                                time = 120;
                            }
                            else {
                                this.setHidden(true);
                            }
                            var data_1 = this.getSelectionModel().getSelection();
                            setTimeout(function () {
                                window["imgViewFrame"].window.showImage(FastExt.System.formatUrl(data_1[0].get("url")), FastExt.System.http);
                            }, time);
                        }
                        catch (e) {
                            FastExt.Dialog.showException(e, "showImage");
                        }
                    }
                }
            });
            window["imageViewerLoadDone"] = function () {
                Ext.getCmp("ImageViewGrid").setDisabled(false);
                try {
                    var index = Ext.getStore("ImageViewStore").imgSelectIndex;
                    Ext.getCmp("ImageViewGrid").getSelectionModel().select(index);
                }
                catch (e) {
                    FastExt.Dialog.showException(e, "showImage");
                }
            };
            window["imageViewerSize"] = function (width, height) {
                Ext.getCmp("ImageViewWindow").setTitle("查看图片 " + width + "x" + height);
            };
            var imagePanel = Ext.create('Ext.panel.Panel', {
                layout: 'fit',
                region: 'center',
                border: 0,
                height: 'auto',
                iframePanel: true,
                html: '<div style="background: #000000;width: 100%;height: 100%;"></div>',
                listeners: {
                    afterrender: function (obj, eOpts) {
                        if (imageStore.getCount() <= 1) {
                            dataGridImages.setHidden(true);
                        }
                        else {
                            dataGridImages.setHidden(false);
                        }
                        obj.update("<iframe style='background: #000000;width: 100%;height: 100%;' name='imgViewFrame' " +
                            " src='" + FastExt.System.formatUrlVersion("base/image-view/index.html") + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                    }
                },
                bbar: {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    layout: {
                        type: 'hbox',
                        align: 'middle',
                        pack: 'center'
                    },
                    items: [
                        {
                            xtype: 'button',
                            iconCls: 'extIcon extZoomOut',
                            handler: function () {
                                window["imgViewFrame"].window.zoomOut();
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls: 'extIcon extZoomIn',
                            handler: function () {
                                window["imgViewFrame"].window.zoomIn();
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls: 'extIcon extOneOne',
                            handler: function () {
                                window["imgViewFrame"].window.oneOne();
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls: 'extIcon extAround',
                            handler: function () {
                                window["imgViewFrame"].window.rotate();
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls: 'extIcon extLeftRight',
                            handler: function () {
                                window["imgViewFrame"].window.flipA();
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls: 'extIcon extTopBottom',
                            handler: function () {
                                window["imgViewFrame"].window.flipB();
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls: 'extIcon extDownload2',
                            handler: function () {
                                var data = dataGridImages.getSelectionModel().getSelection();
                                FastExt.Base.download(data[0].get("url"));
                            }
                        }
                    ]
                }
            });
            var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
            var newWin = Ext.create('Ext.window.Window', {
                title: "查看图片",
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 600,
                id: 'ImageViewWindow',
                layout: 'border',
                iconCls: 'extIcon extImage',
                resizable: true,
                alwaysOnTop: true,
                maximizable: true,
                modal: modal,
                constrain: true,
                animateTarget: obj,
                items: [dataGridImages, imagePanel],
                listeners: {
                    close: function (val) {
                        imageStore.destroy();
                        if (Ext.isFunction(callBack)) {
                            callBack();
                        }
                    }
                }
            });
            newWin.show();
        };
        /**
         * 播放视频
         * @param obj 弹框动画对象
         * @param videoUrl 视频地址
         */
        Dialog.showVideo = function (obj, videoUrl) {
            if (obj) {
                obj.blur();
            }
            //视频播放器的大小固定
            var win = Ext.create('Ext.window.Window', {
                title: '查看视频',
                layout: 'fit',
                height: 600,
                width: 700,
                resizable: false,
                constrain: true,
                maximizable: false,
                modal: true,
                maximized: false,
                iconCls: 'extIcon extSee',
                draggable: true,
                scrollable: false,
                alwaysOnTop: true,
                toFrontOnShow: true,
                listeners: {
                    show: function () {
                        var url = FastExt.System.formatUrlVersion("base/video/player.html");
                        window["getVideoUrl"] = function () {
                            return videoUrl;
                        };
                        var html = "<iframe allowfullscreen='allowfullscreen' mozallowfullscreen='mozallowfullscreen' msallowfullscreen='msallowfullscreen' oallowfullscreen='oallowfullscreen' webkitallowfullscreen='webkitallowfullscreen' style='background-color: black;' name='showVideoFrame' src='" + url + "'  width='100%' height='100%' frameborder='0' scrolling='no' >";
                        this.update(html);
                    }
                }
            });
            win.show();
        };
        /**
         * 弹出富文本编辑框
         * @param obj 弹框对象
         * @param title 标题
         * @param callBack 回调函数   callBack(Ext.getCmp(areaId).getValue());
         */
        Dialog.showEditor = function (obj, title, callBack) {
            if (obj) {
                obj.blur();
            }
            var time = new Date().getTime();
            var areaId = "PublicTextArea" + time;
            var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
            var editorWin = Ext.create('Ext.window.Window', {
                title: title,
                iconCls: 'extIcon extEdit',
                resizable: true,
                maximizable: true,
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 600,
                layout: 'fit',
                animateTarget: obj,
                items: [{
                        id: areaId,
                        emptyText: '请输入内容……',
                        xtype: 'textarea'
                    }],
                modal: true,
                constrain: true,
                closeAction: 'hide',
                listeners: {
                    show: function (obj) {
                        FastExt.Server.showExtConfig("PublicEditor", "TextEditorCache", function (success, value) {
                            if (success) {
                                Ext.getCmp(areaId).setValue(value);
                            }
                            Ext.getCmp(areaId).focus();
                        });
                    }
                },
                buttons: [
                    {
                        text: '暂存',
                        iconCls: 'extIcon extSave whiteColor',
                        handler: function () {
                            FastExt.Dialog.showWait("暂存中，请稍后……");
                            FastExt.Server.saveExtConfig("PublicEditor", "TextEditorCache", Ext.getCmp(areaId).getValue(), function (success, message) {
                                FastExt.Dialog.hideWait();
                                if (success) {
                                    FastExt.Dialog.toast("暂存成功！");
                                }
                                else {
                                    FastExt.Dialog.showAlert("系统提醒", message);
                                }
                            });
                        }
                    },
                    {
                        text: '重置',
                        iconCls: 'extIcon extReset',
                        handler: function () {
                            Ext.getCmp(areaId).setValue(null);
                            FastExt.Server.deleteExtConfig("PublicEditor", "TextEditorCache");
                        }
                    },
                    {
                        text: '确定',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            FastExt.Dialog.showWait("请稍后……");
                            FastExt.Server.deleteExtConfig("PublicEditor", "TextEditorCache", function (success) {
                                FastExt.Dialog.hideWait();
                                if (Ext.isFunction(callBack)) {
                                    callBack(Ext.getCmp(areaId).getValue());
                                }
                                editorWin.close();
                            });
                        }
                    }
                ]
            });
            editorWin.show();
        };
        /**
         * 格式化显示json字符串
         * @param obj 弹框对象
         * @param title 标题
         * @param value 弹框内容
         */
        Dialog.showJson = function (obj, title, value) {
            try {
                if (obj) {
                    obj.blur();
                }
                var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                var win = Ext.create('Ext.window.Window', {
                    title: title,
                    height: winHeight,
                    width: winWidth,
                    minHeight: 500,
                    minWidth: 600,
                    animateTarget: obj,
                    resizable: true,
                    layout: 'fit',
                    maximizable: true,
                    iconCls: 'extIcon extSee',
                    autoScroll: true,
                    modal: true,
                    constrain: true
                });
                var result = new JSONFormat(value, 4).toString();
                win.update("<div style='padding: 20px;'>" + result + "</div>");
                win.show();
            }
            catch (e) {
                FastExt.Dialog.showText(obj, null, title, value);
            }
        };
        /**
         * 格式化显示json字符串
         * @param obj
         * @param value
         */
        Dialog.showFormatJson = function (obj, value) {
            try {
                if (obj) {
                    obj.blur();
                }
                var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                var win = Ext.create('Ext.window.Window', {
                    title: "查看数据",
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
                    constrain: true
                });
                var result = new JSONFormat(value, 4).toString();
                win.update("<div style='padding: 20px;'>" + result + "</div>");
                win.show();
            }
            catch (e) {
                FastExt.Dialog.showText(obj, null, "查看数据", value);
            }
        };
        /**
         * 弹出日期时间选择控件
         * @param obj 需要弹出的目标控件
         * @param defaultValue 默认日期时间
         * @param dateFormat 日期时间的格式
         * @return Ext.Promise
         */
        Dialog.showFastDatePicker = function (obj, defaultValue, dateFormat) {
            return new Ext.Promise(function (resolve, reject) {
                var token = new Date().getTime();
                if (Ext.isEmpty(dateFormat)) {
                    dateFormat = "Y-m-d H:i:s";
                }
                var hourStoreValue = [];
                for (var i = 0; i < 24; i++) {
                    var value = FastExt.Base.prefixInteger(i, 2);
                    hourStoreValue.push({
                        text: value
                    });
                }
                var secondStoreValue = [];
                for (var i = 0; i < 60; i++) {
                    var value = FastExt.Base.prefixInteger(i, 2);
                    secondStoreValue.push({
                        text: value
                    });
                }
                var defaultDate;
                if (!Ext.isEmpty(defaultValue)) {
                    defaultDate = Ext.Date.parse(defaultValue, dateFormat);
                }
                if (!defaultDate) {
                    defaultDate = new Date();
                }
                var hour = Ext.Date.format(defaultDate, 'H');
                var minute = Ext.Date.format(defaultDate, 'i');
                var second = Ext.Date.format(defaultDate, 's');
                var countItem = 0;
                var hourShow = dateFormat.indexOf("H") !== -1;
                var minuteShow = dateFormat.indexOf("i") !== -1;
                var secondShow = dateFormat.indexOf("s") !== -1;
                if (hourShow) {
                    countItem++;
                }
                if (minuteShow) {
                    countItem++;
                }
                if (secondShow) {
                    countItem++;
                }
                var menu = Ext.create('Ext.menu.Menu', {
                    showSeparator: false,
                    layout: 'border',
                    padding: '0 0 0 0',
                    style: {
                        background: "#ffffff"
                    },
                    alwaysOnTop: true,
                    width: 350,
                    height: 400,
                    listeners: {
                        hide: function (obj, epts) {
                            FastExt.Base.runCallBack(resolve);
                        }
                    },
                    items: [
                        {
                            xtype: 'datepicker',
                            id: 'dateValue' + token,
                            region: 'center',
                            showToday: false,
                            margin: '0 0 0 0',
                            border: 0,
                            value: defaultDate
                        },
                        {
                            xtype: 'panel',
                            layout: 'column',
                            margin: '0 0 0 0',
                            region: 'south',
                            border: 0,
                            items: [
                                {
                                    xtype: 'panel',
                                    columnWidth: 1,
                                    layout: 'column',
                                    border: 0,
                                    items: [
                                        {
                                            id: 'hourValue' + token,
                                            columnWidth: 1.0 / countItem,
                                            emptyText: '时',
                                            minValue: 0,
                                            margin: '0 0 0 5',
                                            maxValue: 23,
                                            displayField: 'text',
                                            valueField: 'text',
                                            editable: false,
                                            hidden: !hourShow,
                                            value: hour,
                                            store: Ext.create('Ext.data.Store', {
                                                autoLoad: true,
                                                data: hourStoreValue
                                            }),
                                            xtype: 'combo'
                                        }, {
                                            xtype: 'displayfield',
                                            width: 30,
                                            hidden: !hourShow,
                                            value: "<div align='center'>时</div>"
                                        }, {
                                            id: 'minuteValue' + token,
                                            columnWidth: 1.0 / countItem,
                                            emptyText: '分',
                                            minValue: 0,
                                            maxValue: 59,
                                            displayField: 'text',
                                            valueField: 'text',
                                            editable: false,
                                            value: minute,
                                            hidden: !minuteShow,
                                            store: Ext.create('Ext.data.Store', {
                                                autoLoad: true,
                                                data: secondStoreValue
                                            }),
                                            xtype: 'combo'
                                        }, {
                                            xtype: 'displayfield',
                                            width: 30,
                                            hidden: !minuteShow,
                                            value: "<div align='center'>分</div>"
                                        }, {
                                            id: 'secondsValue' + token,
                                            columnWidth: 1.0 / countItem,
                                            emptyText: '秒',
                                            minValue: 0,
                                            maxValue: 59,
                                            displayField: 'text',
                                            valueField: 'text',
                                            editable: false,
                                            value: second,
                                            hidden: !secondShow,
                                            store: Ext.create('Ext.data.Store', {
                                                autoLoad: true,
                                                data: secondStoreValue
                                            }),
                                            xtype: 'combo'
                                        }, {
                                            xtype: 'displayfield',
                                            width: 30,
                                            hidden: !secondShow,
                                            value: "<div align='center'>秒</div>"
                                        },
                                    ]
                                },
                                {
                                    xtype: 'button',
                                    columnWidth: 1,
                                    margin: '5 5 5 5',
                                    text: '确定',
                                    handler: function () {
                                        var datePicker = Ext.getCmp("dateValue" + token);
                                        var hourCombo = Ext.getCmp("hourValue" + token);
                                        var minuteCombo = Ext.getCmp("minuteValue" + token);
                                        var secondsCombo = Ext.getCmp("secondsValue" + token);
                                        var dateValue = datePicker.getValue();
                                        dateValue.setHours(parseInt(hourCombo.getValue()));
                                        dateValue.setMinutes(parseInt(minuteCombo.getValue()));
                                        dateValue.setSeconds(parseInt(secondsCombo.getValue()));
                                        FastExt.Base.runCallBack(resolve, Ext.Date.format(dateValue, dateFormat));
                                        menu.close();
                                    }
                                }
                            ]
                        }
                    ]
                });
                menu.showBy(obj);
            });
        };
        /**
         * 弹出颜色选择控件
         * @param obj 需要弹出的目标控件
         * @param defaultValue 默认颜色
         * @param onColorChange 颜色变化的监听
         * @return Ext.Promise
         */
        Dialog.showFastColorPicker = function (obj, defaultValue, onColorChange) {
            if (Ext.isEmpty(defaultValue)) {
                defaultValue = "#42445a";
            }
            return new Ext.Promise(function (resolve, reject) {
                window["onColorPickerLoadDone"] = function (colorPicker) {
                    colorPicker.on('change', function (color, source, instance) {
                        if (Ext.isFunction(onColorChange)) {
                            onColorChange(color, source, instance);
                        }
                    });
                };
                var menu = Ext.create('Ext.menu.Menu', {
                    showSeparator: false,
                    layout: 'border',
                    padding: '0 0 0 0',
                    style: {
                        background: "#ffffff"
                    },
                    alwaysOnTop: true,
                    width: 250,
                    height: 320,
                    listeners: {
                        hide: function (obj, epts) {
                            FastExt.Base.runCallBack(resolve);
                        },
                        mouseleave: function (obj) {
                            var targetElement = window["colorPickerFrame"].window.document.getElementsByTagName("body")[0];
                            FastExt.Base.dispatchTargetEvent(window["colorPickerFrame"].window.document, targetElement, "mouseup");
                        }
                    },
                    items: [
                        {
                            xtype: 'panel',
                            region: 'center',
                            margin: '0 0 0 0',
                            border: 0,
                            listeners: {
                                afterrender: function () {
                                    var url = FastExt.System.formatUrlVersion('base/colorpicker/index.html', {
                                        color: defaultValue.replace("#", "")
                                    });
                                    this.update("<iframe name='colorPickerFrame'  src='" + url + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                                }
                            }
                        }
                    ]
                });
                menu.showBy(obj);
            });
        };
        return Dialog;
    }());
    FastExt.Dialog = Dialog;
})(FastExt || (FastExt = {}));
var FastEnum;
(function (FastEnum) {
    /**
     * 网页a标签中target枚举属性
     */
    var Target;
    (function (Target) {
        /**
         * 在新窗口中打开被链接文档
         */
        Target["_blank"] = "_blank";
        /**
         * 默认。在相同的框架中打开被链接文档
         */
        Target["_self"] = "_self";
        /**
         * 在父框架集中打开被链接文档
         */
        Target["_parent"] = "_parent";
        /**
         * 在整个窗口中打开被链接文档
         */
        Target["_top"] = "_top";
        /**
         * 在指定的框架中打开被链接文档
         */
        Target["framename"] = "framename";
    })(Target = FastEnum.Target || (FastEnum.Target = {}));
    /**
     * 字符追加的位置
     */
    var AppendPosition;
    (function (AppendPosition) {
        /**
         * 字符追加在左侧
         */
        AppendPosition["left"] = "left";
        /**
         * 字符追加在右侧
         */
        AppendPosition["right"] = "right";
    })(AppendPosition = FastEnum.AppendPosition || (FastEnum.AppendPosition = {}));
    /**
     * 数据计算方式
     */
    var ComputeType;
    (function (ComputeType) {
        /**
         * 计算数据总和
         */
        ComputeType["sum"] = "sum";
        /**
         * 计算数据平均值
         */
        ComputeType["avg"] = "avg";
        /**
         * 计算数据最小值
         */
        ComputeType["min"] = "min";
        /**
         * 计算数据最大值
         */
        ComputeType["max"] = "max";
    })(ComputeType = FastEnum.ComputeType || (FastEnum.ComputeType = {}));
    /**
     * 支持权限设置的组件类型
     */
    var PowerType;
    (function (PowerType) {
        PowerType["gridcolumn"] = "gridcolumn";
        PowerType["button"] = "button";
        PowerType["menuitem"] = "menuitem";
    })(PowerType = FastEnum.PowerType || (FastEnum.PowerType = {}));
})(FastEnum || (FastEnum = {}));
/**
 * 扩展ExtJs常用组件中的属性或方法
 */
var FastExtend;
(function (FastExtend) {
    /**
     * 字符串类型的相关扩展
     * @define 使用String对象调用以下方法或属性
     * @example
     * 'user.js'.endWidth('.js');
     */
    var StringExtend = /** @class */ (function () {
        function StringExtend() {
            console.log("String初始化完毕！");
            // @ts-ignore
            String.prototype.endWith = function (suffix) {
                if (!suffix || suffix === "" || this.length === 0 || suffix.length > this.length)
                    return false;
                return this.substring(this.length - suffix.length) === suffix;
            };
            // @ts-ignore
            String.prototype.startWith = function (prefix) {
                if (!prefix || prefix === "" || this.length === 0 || prefix.length > this.length)
                    return false;
                return this.substr(0, prefix.length) === prefix;
            };
            // @ts-ignore
            String.prototype.firstUpperCase = function () {
                return this.replace(/^\S/, function (s) {
                    return s.toUpperCase();
                });
            };
            // @ts-ignore
            String.prototype.truthLength = function () {
                return this.replace(/[\u0391-\uFFE5]/g, "aa").length;
            };
            // @ts-ignore
            String.prototype.trimAllSymbol = function () {
                return this.replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?/\，/\。/\；/\：/\“/\”/\》/\《/\|/\{/\}/\、/\!/\~/\`]/g, "");
            };
            // @ts-ignore
            String.prototype.replaceAll = function (oldStr, newStr) {
                return this.replace(new RegExp(oldStr, 'g'), newStr);
            };
        }
        return StringExtend;
    }());
    FastExtend.StringExtend = StringExtend;
    /**
     * 数组相关扩展
     * @define 使用Array对象调用以下方法或属性
     * @example
     * let userIds=[1,2,3,4];
     * userIds.exists(1);
     */
    var ArrayExtend = /** @class */ (function () {
        function ArrayExtend() {
            // @ts-ignore
            Array.prototype.exists = function (val) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i] === val) {
                        return true;
                    }
                }
                return false;
            };
        }
        return ArrayExtend;
    }());
    FastExtend.ArrayExtend = ArrayExtend;
    /**
     * Ext.Component扩展
     * @define 使用Ext.Component对象调用以下方法或属性
     * @example button.help
     */
    var ComponentExtend = /** @class */ (function () {
        function ComponentExtend() {
            /**
             * 标识是否为嵌入iframe标签的组件
             * <br/>
             * 如果配置属性值为true，则在拖拽或改变控件大小时会禁用本组件，避免鼠标事件丢失问题
             */
            this.iframePanel = false;
        }
        return ComponentExtend;
    }());
    FastExtend.ComponentExtend = ComponentExtend;
    /**
     * gridpanel或treepanel相关扩展
     * @define 使用Ext.grid.Panel或Ext.tree.Panel对象调用以下所有方法或属性
     * @example grid.entityList
     */
    var GridExtend = /** @class */ (function () {
        function GridExtend() {
        }
        return GridExtend;
    }());
    FastExtend.GridExtend = GridExtend;
    /**
     * Ext.form.Panel扩展
     * @define 使用Ext.form.FormPanel对象调用以下方法或属性
     * @example formPanel.setFieldValue('loginName','admin')
     */
    var FormPanelExtend = /** @class */ (function () {
        function FormPanelExtend() {
            Ext.form.FormPanel.prototype.setFieldValue = function (fieldName, value) {
                this.getForm().findField(fieldName).setValue(value);
            };
            Ext.form.FormPanel.prototype.getFieldValue = function (fieldName) {
                return this.getForm().findField(fieldName).getValue();
            };
            Ext.form.FormPanel.prototype.getField = function (fieldName) {
                return this.getForm().findField(fieldName);
            };
            Ext.form.FormPanel.prototype.submitForm = function (entity, extraParams, waitMsg) {
                var me = this;
                if (!extraParams) {
                    extraParams = {};
                }
                if (!waitMsg) {
                    waitMsg = "正在提交中……";
                }
                if (me.submiting) {
                    return new Ext.Promise(function (resolve, reject) {
                        reject({ "success": false, "message": "数据正在提交中，不可重复提交！" });
                    });
                }
                return new Ext.Promise(function (resolve, reject) {
                    var submitConfig = {
                        submitEmptyText: false,
                        waitMsg: waitMsg,
                        params: extraParams,
                        success: function (form, action) {
                            me.submiting = false;
                            Ext.Msg.alert('系统提醒', action.result.message, function (btn) {
                                if (btn === "ok") {
                                    resolve(action.result);
                                }
                            });
                        },
                        failure: function (form, action) {
                            me.submiting = false;
                            Ext.Msg.alert('系统提醒', action.result.message);
                            reject(action.result);
                        }
                    };
                    if (entity) {
                        submitConfig.params["entityCode"] = entity.entityCode;
                        if (entity.menu) {
                            submitConfig.params["menu"] = FastExt.Store.getStoreMenuText({ entity: entity });
                        }
                    }
                    var form = me.getForm();
                    if (form.isValid()) {
                        me.submiting = true;
                        form.submit(submitConfig);
                    }
                    else {
                        me.submiting = false;
                        reject({ "success": false, "message": "表单填写不完整！" });
                    }
                });
            };
            Ext.form.FormPanel.prototype.saveCache = function (key) {
                if (Ext.isEmpty(key)) {
                    key = this.cacheKey;
                }
                var data = {};
                this.getForm().getFields().each(function (field, index) {
                    if (Ext.isDate(field.getValue())) {
                        data[field.getName()] = Ext.Date.format(field.getValue(), field.format);
                    }
                    else {
                        data[field.getName()] = field.getValue();
                    }
                });
                var params = {
                    "configKey": key,
                    "configType": "FormPanelCache",
                    "configValue": Ext.encode(data)
                };
                FastExt.Dialog.showWait("暂存数据中……");
                $.post("ext/config/saveExtConfig", params, function (result) {
                    FastExt.Dialog.hideWait();
                    if (result.success) {
                        FastExt.Dialog.toast("暂存成功！");
                    }
                    else {
                        FastExt.Dialog.showAlert("系统提醒", result.message);
                    }
                });
            };
            Ext.form.FormPanel.prototype.restoreCache = function (key) {
                if (Ext.isEmpty(key)) {
                    key = this.cacheKey;
                }
                var me = this;
                var params = {
                    "configKey": key,
                    "configType": "FormPanelCache"
                };
                $.post("ext/config/showExtConfig", params, function (result) {
                    if (result.success) {
                        var data_2 = Ext.decode(result.data.configValue);
                        me.getForm().getFields().each(function (field, index) {
                            if (data_2.hasOwnProperty(field.getName())) {
                                field.setValue(data_2[field.getName()]);
                            }
                        });
                    }
                });
            };
            Ext.form.FormPanel.prototype.deleteCache = function (key) {
                if (Ext.isEmpty(key)) {
                    key = this.cacheKey;
                }
                var params = {
                    "configKey": key,
                    "configType": "FormPanelCache"
                };
                $.post("ext/config/deleteExtConfig", params, function (result) {
                });
            };
        }
        return FormPanelExtend;
    }());
    FastExtend.FormPanelExtend = FormPanelExtend;
    /**
     * Ext.form.field.File扩展
     * @define 使用Ext.form.field.File对象调用以下方法或属性
     * @example file.multiple
     */
    var FileFieldExtend = /** @class */ (function () {
        function FileFieldExtend() {
            /**
             * 标识是否允许上传多个文件
             */
            this.multiple = false;
        }
        return FileFieldExtend;
    }());
    FastExtend.FileFieldExtend = FileFieldExtend;
    /**
     * Ext.form.field.Base扩展
     * @define 使用Ext.form.field.Base对象调用以下方法或属性
     * @example input.blur()
     */
    var FieldExtend = /** @class */ (function () {
        function FieldExtend() {
            Ext.form.field.Base.prototype.blur = function () {
                try {
                    if (this.inputEl) {
                        this.inputEl.blur();
                    }
                }
                catch (e) {
                    console.error(e);
                }
            };
        }
        return FieldExtend;
    }());
    FastExtend.FieldExtend = FieldExtend;
    /**
     * Ext.grid.column.Column的扩展
     * @define 使用Ext.grid.column.Column对象调用以下方法或属性
     * @example column.toSearchKey()
     */
    var ColumnExtend = /** @class */ (function () {
        function ColumnExtend() {
        }
        return ColumnExtend;
    }());
    FastExtend.ColumnExtend = ColumnExtend;
    /**
     * Ext.menu.Menu的扩展
     *
     */
    var MenuExtend = /** @class */ (function () {
        function MenuExtend() {
            /**
             * 是否保持打开，设置true后，失去焦点后将无法自动关闭
             * @see {@link FastOverrider.MenuOverride.constructor}
             */
            this.holdShow = false;
        }
        return MenuExtend;
    }());
    FastExtend.MenuExtend = MenuExtend;
    for (var subClass in FastExtend) {
        FastExtend[subClass]();
    }
})(FastExtend || (FastExtend = {}));
var FastExt;
(function (FastExt) {
    var File = /** @class */ (function () {
        function File() {
        }
        /**
         * 格式化文件的大小长度
         * @param length
         * @example 10KB 或 10M
         */
        File.formatLength = function (length) {
            if (length < 1024) {
                return length + "B";
            }
            if (length < 1024 * 1024) {
                return (length / 1024).toFixed(2) + "KB";
            }
            return (length / 1024 / 1024).toFixed(2) + "M";
        };
        /**
         * 弹出上传文件的对话框
         * @param obj 控件对象
         * @param fileModules 文件类型
         * @param multiple 是否允许多选文件
         * @param useEditUrl 是否允许手动编写文件url
         * @example
         * uploadFile(this,[file.image(),file.excel()])
         * @return Ext.Promise
         */
        File.uploadFile = function (obj, fileModules, multiple, useEditUrl) {
            return new Ext.Promise(function (resolve, reject) {
                var title = "上传文件", type = "files", width = -1, height = -1, name = "file";
                if (!FastExt.FileModule.validate(fileModules, "fileModules")) {
                    return;
                }
                if (fileModules.length === 1) {
                    title = "上传" + fileModules[0].tipMsg;
                    type = fileModules[0].type;
                    width = fileModules[0].width;
                    height = fileModules[0].height;
                }
                if (Ext.isEmpty(useEditUrl)) {
                    useEditUrl = true;
                }
                if (obj) {
                    if (obj.name) {
                        name = obj.name;
                    }
                    if (obj.dataIndex) {
                        name = obj.dataIndex;
                    }
                }
                var formPanel = Ext.create('Ext.form.FormPanel', {
                    url: 'upload',
                    method: 'POST',
                    margin: '5',
                    fileUpload: true,
                    width: 400,
                    callBacked: false,
                    border: 0,
                    layout: 'column',
                    items: [
                        {
                            xtype: 'filefield',
                            fieldLabel: title,
                            labelWidth: 60,
                            labelAlign: 'right',
                            buttonText: '选择文件',
                            allowBlank: false,
                            name: name,
                            multiple: multiple,
                            columnWidth: 1,
                            listeners: {
                                change: function (obj, value, eOpts) {
                                    if (value != null && value.length !== 0) {
                                        var errorMsg = "";
                                        for (var i = 0; i < fileModules.length; i++) {
                                            var fileModule = fileModules[i];
                                            if (fileModule.reg.test(value)) {
                                                formPanel.doSubmit();
                                                return;
                                            }
                                            errorMsg = errorMsg + "或" + fileModule.tipMsg;
                                        }
                                        formPanel.form.reset();
                                        Ext.Msg.alert('系统提醒', "请上传有效的" + errorMsg.substring(1));
                                    }
                                }
                            }
                        },
                        {
                            xtype: 'hiddenfield',
                            name: 'type',
                            value: type
                        },
                        {
                            xtype: 'hiddenfield',
                            name: 'file.width',
                            value: width
                        },
                        {
                            xtype: 'hiddenfield',
                            name: 'file.height',
                            value: height
                        }
                    ],
                    doSubmit: function () {
                        var form = formPanel.form;
                        if (form.isValid()) {
                            var myMask_1 = new Ext.LoadMask({
                                msg: '正在上传附件中…',
                                target: uploadWin
                            });
                            myMask_1.show();
                            var formSubmitRun_1 = function () {
                                form.submit({
                                    success: function (form, action) {
                                        FastExt.Dialog.toast("文件上传成功！");
                                        if (!resolve.called) {
                                            resolve.called = true;
                                            resolve(action.result.data);
                                        }
                                        uploadWin.close();
                                    },
                                    failure: function (form, action) {
                                        myMask_1.destroy();
                                        Ext.Msg.alert('系统提醒', "上传失败！" + action.result.message);
                                    }
                                });
                            };
                            var onFileSelectRun_1 = function (i) {
                                if (i >= fileModules.length) {
                                    formSubmitRun_1();
                                    return;
                                }
                                var fileModel = fileModules[i];
                                if (Ext.isFunction(fileModel.onFileSelect)) {
                                    fileModel.onFileSelect(formPanel.getForm().findField(name)).then(function (error) {
                                        if (Ext.isEmpty(error)) {
                                            onFileSelectRun_1(i + 1);
                                        }
                                        else {
                                            myMask_1.destroy();
                                            formPanel.form.reset();
                                            Ext.Msg.alert('系统提醒', error);
                                        }
                                    });
                                }
                                else {
                                    onFileSelectRun_1(i + 1);
                                }
                            };
                            onFileSelectRun_1(0);
                        }
                    },
                    listeners: {
                        'render': function (obj) {
                            try {
                                new Ext.util.KeyMap({
                                    target: obj.getEl(),
                                    key: 13,
                                    fn: formPanel.doSubmit,
                                    scope: Ext.getBody()
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });
                var btnSubmitId = "btnSubmit" + new Date().getTime();
                var uploadWin = Ext.create('Ext.window.Window', {
                    title: title,
                    layout: 'fit',
                    resizable: false,
                    scrollable: false,
                    width: 500,
                    items: formPanel,
                    modal: true,
                    iconCls: 'extIcon extUpload',
                    animateTarget: obj,
                    constrain: true,
                    buttons: [
                        {
                            text: '使用地址',
                            iconCls: 'extIcon extEdit',
                            hidden: !useEditUrl,
                            handler: function () {
                                Ext.Msg.prompt('使用自定义的文件地址', '填写自定义的文件路径（http）：', function (btn, text) {
                                    if (btn === 'ok') {
                                        if (!Ext.isEmpty(text)) {
                                            if (!resolve.called) {
                                                resolve.called = true;
                                                resolve({ "url": text });
                                            }
                                            uploadWin.close();
                                        }
                                    }
                                });
                            }
                        },
                        {
                            text: '网络同步',
                            iconCls: 'extIcon extLink',
                            handler: function () {
                                Ext.Msg.prompt('从网络中下载文件', '填写网络文件路径（http）：', function (btn, text) {
                                    if (btn === 'ok') {
                                        FastExt.Dialog.showWait("正在同步中，请稍后……");
                                        var params = { "url": text, "__accept": "application/json" };
                                        $.post("upload", params, function (result) {
                                            FastExt.Dialog.hideWait();
                                            if (result.success) {
                                                FastExt.Dialog.toast("文件上传成功！");
                                                if (!resolve.called) {
                                                    resolve.called = true;
                                                    resolve(result.data);
                                                }
                                                uploadWin.close();
                                            }
                                            else {
                                                Ext.Msg.alert('系统提醒', "上传失败！" + result.message);
                                            }
                                        });
                                    }
                                });
                            }
                        },
                        '->',
                        {
                            text: '重置',
                            width: 88,
                            iconCls: 'extIcon extReset',
                            handler: function () {
                                formPanel.form.reset();
                            }
                        },
                        {
                            text: '上传',
                            width: 88,
                            id: btnSubmitId,
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                formPanel.doSubmit();
                            }
                        }
                    ],
                    listeners: {
                        show: function (winObj, eOpts) {
                            formPanel.getForm().findField(name).fileInputEl.dom.click();
                            Ext.getCmp(btnSubmitId).focus();
                        },
                        close: function (winObj, eOpts) {
                            if (!resolve.called) {
                                resolve.called = true;
                                resolve();
                            }
                        }
                    }
                });
                uploadWin.show();
            });
        };
        /**
         * 弹出管理多个文件的窗口
         * @param obj 控件对象
         * @param callBack 回调函数
         * @param fileModules 文件类型
         * @param defaultFiles 默认文件数据
         * @param title
         * @example
         * showFiles(this,function(val){
         *
         * },[file.image(),file.excel()])
         */
        File.showFiles = function (obj, callBack, fileModules, defaultFiles, title) {
            if (!FastExt.FileModule.validate(fileModules, "fileModules")) {
                return;
            }
            if (obj) {
                obj.blur();
            }
            var datas = [], renderer = FastExt.Renders.file();
            if (!title) {
                title = "文件管理";
            }
            if (!Ext.isEmpty(defaultFiles)) {
                var fileArray = defaultFiles;
                if (Ext.isString(defaultFiles)) {
                    fileArray = Ext.JSON.decode(defaultFiles);
                }
                for (var i = 0; i < fileArray.length; i++) {
                    var source = fileArray[i];
                    var arrayInfo = source.split("@");
                    var url = arrayInfo[0];
                    var name_2 = url.substring(url.lastIndexOf("/") + 1);
                    var length_1 = -1;
                    if (arrayInfo.length > 1) {
                        name_2 = arrayInfo[1];
                    }
                    if (arrayInfo.length > 2) {
                        length_1 = arrayInfo[2];
                    }
                    datas.push({ url: url, name: name_2, length: length_1 });
                }
            }
            if (fileModules.length === 1) {
                renderer = fileModules[0].renderer;
                title = fileModules[0].tipMsg + "管理";
            }
            var columns = [];
            columns.push({
                header: '文件',
                dataIndex: 'url',
                flex: 1,
                align: 'center',
                renderer: renderer
            });
            if (obj.showFileName) {
                columns.push({
                    header: '文件名',
                    dataIndex: 'name',
                    width: 150,
                    align: 'center',
                    field: {
                        xtype: 'textfield',
                        listeners: {
                            change: function () {
                                fileStore.modify = true;
                            }
                        }
                    },
                    renderer: FastExt.Renders.normal()
                });
                if (obj.showFileLength) {
                    columns.push({
                        header: '大小',
                        dataIndex: 'length',
                        width: 100,
                        align: 'center',
                        renderer: FastExt.Renders.fileSize()
                    });
                }
            }
            var currTime = Ext.now();
            var fileStore = Ext.create('Ext.data.Store', {
                autoLoad: true,
                data: datas
            });
            var dataGridFiles = Ext.create('Ext.grid.Panel', {
                selModel: FastExt.Grid.getGridSelModel(),
                store: fileStore,
                columnLines: true,
                cellTip: true,
                columns: columns,
                plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
                        clicksToEdit: 2
                    })],
                selType: 'cellmodel',
                tbar: [
                    {
                        xtype: 'button',
                        border: 1,
                        text: '删除',
                        id: 'btnDeleteFile' + currTime,
                        iconCls: 'extIcon extDelete',
                        disabled: true,
                        handler: function () {
                            var data = dataGridFiles.getSelectionModel().getSelection();
                            if (data.length === 0) {
                                FastExt.Dialog.toast("请您选择需要删除的文件！");
                            }
                            else {
                                Ext.Msg.confirm("系统提醒", "您确定立即删除选中的附件吗？", function (button, text) {
                                    if (button === "yes") {
                                        var params_1 = {};
                                        Ext.Array.each(data, function (record, index) {
                                            params_1["path[" + index + "]"] = record.get("url");
                                        });
                                        FastExt.Dialog.showWait("正在删除中……");
                                        FastExt.Server.deleteAttach(params_1, function (success, message) {
                                            FastExt.Dialog.hideWait();
                                            if (success) {
                                                dataGridFiles.getSelectionModel().deselectAll();
                                                FastExt.Dialog.showAlert("系统提醒", "删除成功！");
                                                Ext.Array.each(data, function (record, index) {
                                                    fileStore.remove(record);
                                                    fileStore.modify = true;
                                                });
                                            }
                                            else {
                                                FastExt.Dialog.showAlert("系统提醒", message);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        border: 1,
                        text: '上传',
                        iconCls: 'extIcon extUpload',
                        handler: function () {
                            FastExt.File.uploadFile(this, fileModules, true).then(function (result) {
                                if (result) {
                                    if (Ext.isArray(result)) {
                                        for (var i = 0; i < result.length; i++) {
                                            fileStore.add(result[i]);
                                        }
                                    }
                                    else {
                                        fileStore.add(result);
                                    }
                                    fileStore.modify = true;
                                }
                            });
                        }
                    }
                ],
                listeners: {
                    selectionchange: function () {
                        var data = this.getSelectionModel().getSelection();
                        Ext.getCmp("btnDeleteFile" + currTime).setDisabled(!(data.length > 0));
                    }
                }
            });
            var win = Ext.create('Ext.window.Window', {
                title: title,
                height: 300,
                width: 400,
                minWidth: 400,
                minHeight: 300,
                layout: 'fit',
                resizable: true,
                modal: true,
                constrain: true,
                iconCls: 'extIcon extFolder',
                animateTarget: obj,
                items: [dataGridFiles],
                buttons: [{
                        text: '确定',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            var data = [];
                            fileStore.each(function (record, index) {
                                var url = record.get("url");
                                if (obj.showFileName) {
                                    url = url + "@" + record.get("name");
                                    if (obj.showFileLength) {
                                        url = url + "@" + record.get("length");
                                    }
                                }
                                data.push(url);
                            });
                            if (callBack != null) {
                                callBack(Ext.encode(data));
                            }
                            win.close();
                        }
                    }],
                listeners: {
                    close: function () {
                        if (fileStore.modify) {
                        }
                    }
                }
            });
            win.show();
        };
        /**
         * 导入实体的excel数据
         * @param obj
         * @param params 接口参数
         * @param formItems 配置扩展表单组件
         * @param serverUrl 服务器地址
         */
        File.importExcel = function (obj, params, formItems, serverUrl) {
            return new Ext.Promise(function (resolve, reject) {
                if (!formItems) {
                    formItems = [];
                }
                else {
                    formItems = Ext.Array.clone(formItems);
                }
                if (!serverUrl) {
                    serverUrl = "entity/importData";
                }
                formItems.push({
                    xtype: 'filefield',
                    fieldLabel: 'Excel文件',
                    buttonText: '选择文件',
                    allowBlank: false,
                    name: 'file',
                    columnWidth: 1,
                    listeners: {
                        change: function (obj, value, eOpts) {
                            if (value != null && value.length != 0) {
                                if (!FastExt.FileModule.excel().reg.test(value)) {
                                    formPanel.form.reset();
                                    Ext.Msg.alert('系统提醒', "请上传有效的Excel文档！");
                                }
                            }
                        }
                    }
                });
                var formPanel = Ext.create('Ext.form.FormPanel', {
                    url: serverUrl,
                    method: 'POST',
                    margin: '5',
                    fileUpload: true,
                    width: 400,
                    callBacked: false,
                    border: 0,
                    layout: 'column',
                    defaults: {
                        labelWidth: 80,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        emptyText: '请填写'
                    },
                    items: formItems,
                    doSubmit: function () {
                        var form = formPanel.form;
                        if (form.isValid()) {
                            var myMask_2 = new Ext.LoadMask({
                                msg: '正在导入中…',
                                target: uploadWin
                            });
                            myMask_2.show();
                            form.submit({
                                params: params,
                                success: function (form, action) {
                                    myMask_2.destroy();
                                    Ext.Msg.alert('系统提醒', action.result.message, function () {
                                        FastExt.Base.runCallBack(resolve, action.result);
                                        uploadWin.close();
                                    });
                                },
                                failure: function (form, action) {
                                    myMask_2.destroy();
                                    Ext.Msg.alert('系统提醒', "导入失败！" + action.result.message);
                                }
                            });
                        }
                    },
                    listeners: {
                        'render': function (obj) {
                            try {
                                new Ext.util.KeyMap({
                                    target: obj.getEl(),
                                    key: 13,
                                    fn: formPanel.doSubmit,
                                    scope: Ext.getBody()
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });
                var btnSubmitId = "btnSubmit" + new Date().getTime();
                var uploadWin = Ext.create('Ext.window.Window', {
                    title: "导入Excel数据",
                    layout: 'fit',
                    resizable: false,
                    scrollable: false,
                    items: [formPanel],
                    modal: true,
                    iconCls: 'extIcon extUpload',
                    animateTarget: obj,
                    constrain: true,
                    buttons: [
                        {
                            text: '重置',
                            width: 88,
                            iconCls: 'extIcon extReset',
                            handler: function () {
                                formPanel.form.reset();
                            }
                        },
                        {
                            text: '上传',
                            width: 88,
                            id: btnSubmitId,
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                formPanel.doSubmit();
                            }
                        }
                    ],
                    listeners: {
                        show: function (winObj, eOpts) {
                            if (formItems.length === 1) {
                                formPanel.getForm().findField('file').fileInputEl.dom.click();
                                Ext.getCmp(btnSubmitId).focus();
                            }
                        }
                    }
                });
                uploadWin.show();
            });
        };
        return File;
    }());
    FastExt.File = File;
    /**
     * 文件格式分类
     */
    var FileModule = /** @class */ (function () {
        function FileModule() {
        }
        /**
         * 验证模板的格式
         * @param modules
         * @param name
         */
        FileModule.validate = function (modules, name) {
            if (Ext.isEmpty(modules)) {
                FastExt.Dialog.showAlert("系统提醒", "参数" + name + "必传！");
                return false;
            }
            if (!Ext.isArray(modules)) {
                FastExt.Dialog.showAlert("系统提醒", "参数" + name + "必需Array格式！");
                return false;
            }
            if (modules === 0) {
                FastExt.Dialog.showAlert("系统提醒", "参数" + name + "集合不可为空！");
                return false;
            }
            return true;
        };
        /**
         * 文件格式
         */
        FileModule.file = function () {
            return {
                reg: /\.*$/i,
                tipMsg: '文件',
                type: 'file',
            };
        };
        /**
         * 图片格式
         * @param width
         * @param height
         */
        FileModule.image = function (width, height) {
            if (Ext.isEmpty(width)) {
                width = -1;
            }
            if (Ext.isEmpty(height)) {
                height = -1;
            }
            return {
                width: width,
                height: height,
                reg: /\.(jpg|png|gif|jpeg|svg|bmp)$/i,
                tipMsg: '图片',
                type: 'images',
            };
        };
        /**
         * MP4视频格式
         * @param maxDuration 视频最大时间限制
         */
        FileModule.mp4 = function (maxDuration) {
            return {
                reg: /\.(mp4)$/i,
                tipMsg: 'mp4',
                type: 'videos',
                maxDuration: maxDuration,
                onFileSelect: function (filefield) {
                    var me = this;
                    return new Ext.Promise(function (resolve, reject) {
                        if (Ext.isEmpty(me.maxDuration)) {
                            resolve();
                            return;
                        }
                        var video = filefield.fileInputEl.dom.files[0];
                        var url = URL.createObjectURL(video);
                        var audio = new Audio(url);
                        audio.addEventListener("loadedmetadata", function (e) {
                            if (audio.duration * 1000 > parseInt(me.maxDuration)) {
                                resolve("视频最大时长不得超过" + me.maxDuration / 1000 + "秒！");
                            }
                        });
                    });
                },
            };
        };
        /**
         * word文档格式
         */
        FileModule.word = function () {
            return {
                reg: /\.(doc|docx)$/i,
                tipMsg: 'word文档',
                type: 'words',
            };
        };
        /**
         * excel文档格式
         */
        FileModule.excel = function () {
            return {
                reg: /\.(xls|xlsx)$/i,
                tipMsg: 'excel文档',
                type: 'excels',
            };
        };
        /**
         * ppt文档格式
         */
        FileModule.ppt = function () {
            return {
                reg: /\.(ppt|pptx)$/i,
                tipMsg: 'ppt文档',
                type: 'ppt',
            };
        };
        /**
         * pdf文档格式
         */
        FileModule.pdf = function () {
            return {
                reg: /\.(pdf)$/i,
                tipMsg: 'pdf文档',
                type: 'pdf',
            };
        };
        /**
         * zip文档格式
         */
        FileModule.zip = function () {
            return {
                reg: /\.(zip|rar)$/i,
                tipMsg: 'zip压缩包',
                type: 'zip',
            };
        };
        /**
         * 文本格式
         */
        FileModule.text = function () {
            return {
                reg: /\.(txt)$/i,
                tipMsg: 'txt文档',
                type: 'txt',
            };
        };
        return FileModule;
    }());
    FastExt.FileModule = FileModule;
})(FastExt || (FastExt = {}));
var FastExt;
(function (FastExt) {
    /**
     * 网页表单相关操作
     */
    var Form = /** @class */ (function () {
        function Form() {
        }
        /**
         * 动态构建表单form对象
         * @param url 提交的路径
         * @param paramsJson 提交的JSON参数
         * @return html中的form对象
         */
        Form.buildForm = function (url, paramsJson) {
            var form = $('<form></form>');
            form.attr('action', url);
            form.attr('method', 'post');
            for (var n in paramsJson) {
                var my_input = $("<input type='text' name='" + n + "' />");
                my_input.attr('value', paramsJson[n]);
                form.append(my_input);
            }
            $(document.body).append(form);
            return form;
        };
        /**
         * 是否是日期控件 datefield
         * @param field
         */
        Form.isDateField = function (field) {
            if (!field)
                return false;
            return field === "datefield" || field.xtype === "datefield";
        };
        /**
         * 是否是数字控件 numberfield
         * @param field
         */
        Form.isNumberField = function (field) {
            if (!field)
                return false;
            return field === "numberfield" || field.xtype === "numberfield";
        };
        /**
         * 是否是文本控件 textfield
         * @param field
         */
        Form.isTextField = function (field) {
            if (!field)
                return false;
            return field === "textfield" || field.xtype === "textfield";
        };
        /**
         * 是否是下拉框控件 combobox combo
         * @param field
         */
        Form.isComboField = function (field) {
            if (!field)
                return false;
            return field === "combobox" || field.xtype === "combo";
        };
        /**
         * 是否是文件控件 fastfile
         * @param field
         */
        Form.isFileField = function (field) {
            if (!field)
                return false;
            return field === "fastfile" || field.xtype === "fastfile" || field === "fastfilefield" || field.xtype === "fastfilefield";
        };
        /**
         * 是否是多文件控件 fastfiles
         * @param field
         */
        Form.isFilesField = function (field) {
            if (!field)
                return false;
            return field === "fastfiles" || field.xtype === "fastfiles" || field === "fastfilesfield" || field.xtype === "fastfilesfield";
        };
        /**
         * 是否是枚举控件 enumcombo
         * @param field
         */
        Form.isEnumField = function (field) {
            if (!field)
                return false;
            return field === "enumcombo" || field === "enumcombobox" || field.xtype === "enumcombo" || field.xtype === "enumcombobox";
        };
        /**
         * 是否是大文本编辑器 contentfield
         * @param field
         */
        Form.isContentField = function (field) {
            if (!field)
                return false;
            return field === "contentfield" || field === "content" || field.xtype === "contentfield" || field.xtype === "content";
        };
        /**
         * 是否是网页编辑器 htmlcontentfield
         * @param field
         */
        Form.isHtmlContentField = function (field) {
            if (!field)
                return false;
            return field === "htmlcontentfield" || field === "htmlcontent" || field.xtype === "htmlcontentfield" || field.xtype === "htmlcontent";
        };
        /**
         * 是否是关联字段 linkfield
         * @param field
         */
        Form.isLinkField = function (field) {
            if (!field)
                return false;
            return field === "linkfield" || field === "link" || field.xtype === "linkfield" || field.xtype === "link";
        };
        /**
         * 是否关联目标字段 targetfield
         * @param field
         */
        Form.isTargetField = function (field) {
            if (!field)
                return false;
            return field === "targetfield" || field === "target" || field.xtype === "targetfield" || field.xtype === "target";
        };
        /**
         * 是否是省份选择控件 pcafield
         * @param field
         */
        Form.isPCAField = function (field) {
            if (!field)
                return false;
            return field === "pcafield" || field === "pca" || field.xtype === "pcafield" || field.xtype === "pca";
        };
        /**
         * 是否地图选择控件 mapfield
         * @param field
         */
        Form.isMapField = function (field) {
            if (!field)
                return false;
            return field === "mapfield" || field === "map" || field.xtype === "mapfield" || field.xtype === "map";
        };
        return Form;
    }());
    FastExt.Form = Form;
})(FastExt || (FastExt = {}));
var FastExt;
(function (FastExt) {
    /**
     * Ext.grid.Panel或Ext.tree.Panel相关操作
     */
    var Grid = /** @class */ (function () {
        function Grid() {
            Ext.override(Ext.grid.Panel, {
                initComponent: Ext.Function.createSequence(Ext.grid.Panel.prototype.initComponent, FastExt.Grid.onGridInitComponent)
            });
            Ext.override(Ext.tree.Panel, {
                initComponent: Ext.Function.createSequence(Ext.tree.Panel.prototype.initComponent, FastExt.Grid.onGridInitComponent)
            });
            Ext.override(Ext.grid.Panel, {
                afterRender: Ext.Function.createSequence(Ext.grid.Panel.prototype.afterRender, FastExt.Grid.onGridAfterRender)
            });
            Ext.override(Ext.tree.Panel, {
                afterRender: Ext.Function.createSequence(Ext.tree.Panel.prototype.afterRender, FastExt.Grid.onGridAfterRender)
            });
        }
        /**
         * 初始化grid组件的自定义功能属性等
         */
        Grid.onGridInitComponent = function () {
            var grid = this;
            //取消行缓存渲染
            grid.bufferedRenderer = false;
            if (grid.entityList) {
                // grid.trailingBufferZone = 100;
                // grid.leadingBufferZone = 100;
                if (grid.getStore()) {
                    grid.getStore().grid = grid;
                    if (grid.getStore().where) {
                        grid.fromRecycle = grid.getStore().where['^fromRecycle'];
                    }
                }
                FastExt.Grid.configGridContextMenu(grid);
                FastExt.Grid.configDefaultToolBar(grid);
                FastExt.Grid.configGridListeners(grid);
            }
        };
        /**
         * 初始化Grid布局相关功能
         */
        Grid.onGridAfterRender = function () {
            var grid = this;
            if (grid.entityList) {
                var tabContainer = grid.up("[tabContainer=true]");
                if (tabContainer) {
                    grid.tabPanelList = true;
                }
                if (!grid.updateButtons || grid.updateButtons.length === 0) {
                    grid.updateEnable = false;
                }
                else {
                    grid.updateEnable = true;
                }
                FastExt.Grid.configGridLayout(grid).then(function () {
                    FastExt.Grid.configGridTip(grid);
                    grid.setLoading(false);
                    grid.getStore().grid = grid;
                    if (!grid.getStore().isLoaded()) {
                        grid.getStore().loadPage(1);
                    }
                });
            }
        };
        /**
         * 添加grid的右键菜单选项
         * @param grid
         * @param target
         * @param index
         */
        Grid.addGridContextMenu = function (grid, target, index) {
            if (grid.contextMenu && target) {
                if (!Ext.isFunction(grid.contextMenu.getXType)) {
                    var menu = new Ext.menu.Menu({
                        items: []
                    });
                    if (Ext.isArray(grid.contextMenu)) {
                        menu.add(grid.contextMenu);
                    }
                    grid.contextMenu = menu;
                }
                if (!Ext.isEmpty(index)) {
                    grid.contextMenu.insert(index, target);
                }
                else {
                    grid.contextMenu.add(target);
                }
            }
        };
        /**
         * 配置Grid默认的右键菜单功能
         * @param grid
         */
        Grid.configGridContextMenu = function (grid) {
            var index = 0;
            FastExt.Grid.addGridContextMenu(grid, {
                iconCls: 'extIcon extDetails editColor',
                text: "查看详情",
                handler: function (obj, event) {
                    var subtitle = "";
                    if (grid.getStore().entity.menu) {
                        subtitle = "【" + grid.getStore().entity.menu.text + "】";
                    }
                    var winWidth = parseInt((document.body.clientWidth * 0.3).toFixed(0));
                    var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                    var win = Ext.create('Ext.window.Window', {
                        title: "查看详情" + subtitle,
                        subtitle: subtitle,
                        height: winHeight,
                        width: winWidth,
                        minHeight: 450,
                        minWidth: 400,
                        iconCls: 'extIcon extDetails',
                        layout: 'border',
                        resizable: true,
                        collapsible: true,
                        constrain: true,
                        maximizable: true,
                        animateTarget: obj,
                        listeners: {
                            close: function (obj, op) {
                                obj.items.get(0).changeListener.destroy();
                            },
                            show: function (obj) {
                                obj.focus();
                            }
                        },
                        items: [FastExt.Grid.getDetailsPanel(grid, true)]
                    });
                    win.show();
                }
            }, index++);
            FastExt.Grid.addGridContextMenu(grid, {
                iconCls: 'extIcon extCopy2',
                text: "复制数据",
                menu: [
                    {
                        text: '复制单元格',
                        iconCls: 'extIcon extCopy2',
                        handler: function () {
                            var menu = grid.contextMenu;
                            FastExt.Base.copyToBoard($(menu.cellTd).text());
                            FastExt.Dialog.toast("复制成功！");
                        }
                    },
                    {
                        text: '复制整行',
                        iconCls: 'extIcon extCopy2',
                        handler: function () {
                            var menu = grid.contextMenu;
                            var content = "";
                            $(menu.tr).find("td").each(function () {
                                content += $(this).text() + "\t";
                            });
                            FastExt.Base.copyToBoard(content);
                            FastExt.Dialog.toast("复制成功！");
                        }
                    },
                    {
                        text: '复制数据',
                        iconCls: 'extIcon extCopy2',
                        handler: function () {
                            var menu = grid.contextMenu;
                            var record = menu.record;
                            var fieldName = menu.cellContext.column.dataIndex;
                            if (Ext.isArray(record.get(fieldName))) {
                                FastExt.Base.copyToBoard(Ext.encode(record.get(fieldName)));
                            }
                            else {
                                FastExt.Base.copyToBoard(record.get(fieldName));
                            }
                            FastExt.Dialog.toast("复制成功！");
                        }
                    }
                ]
            }, index++);
            FastExt.Grid.addGridContextMenu(grid, {
                iconCls: 'extIcon extEdit editColor',
                text: "编辑数据",
                onBeforeShow: function () {
                    var menu = this.ownerCt;
                    if (Ext.isEmpty(menu.cellContext.column.dataIndex) || grid.getSelection().length !== 1) {
                        this.hide();
                        return;
                    }
                    if (!FastExt.Base.toBool(menu.cellContext.column.editable, true)) {
                        this.hide();
                        return;
                    }
                    this.show();
                    if (!menu.cellContext.column.field) {
                        if (!menu.cellContext.column.hasListener("dblclick")) {
                            this.hide();
                        }
                    }
                },
                handler: function () {
                    var menu = this.ownerCt;
                    if (menu.cellContext.column.field) {
                        grid.doEdit = true;
                        grid.findPlugin('cellediting').startEditByPosition(menu.cellContext);
                    }
                    else {
                        menu.cellContext.column.fireEvent("dblclick", grid, this, menu.rowIndex);
                    }
                }
            }, index++);
            if (grid.getStore().entity) {
                FastExt.Grid.addGridContextMenu(grid, {
                    iconCls: 'extIcon extLink',
                    text: "搜索链",
                    onBeforeShow: function () {
                        this.show();
                        var menu = this.ownerCt;
                        if (!Ext.isObject(menu.cellContext.column.searchLink) || grid.getSelection().length !== 1) {
                            this.hide();
                        }
                        else {
                            var linkMenu = new Ext.menu.Menu({
                                items: []
                            });
                            var record = menu.record;
                            var fieldName = menu.cellContext.column.dataIndex;
                            var columns = menu.cellContext.column.searchLink.columns;
                            for (var i = 0; i < columns.length; i++) {
                                var column = columns[i];
                                var child = {
                                    icon: column.parent.icon,
                                    text: column.parent.text + "【" + column.text + "】",
                                    column: column,
                                    value: record.get(fieldName),
                                    handler: function () {
                                        var where = {};
                                        where[this.column.dataIndex] = this.value;
                                        FastExt.System.showTab(this.column.parent.method, $.md5(this.column.id + this.value), "搜索：" + this.text, this.icon, true, false, where);
                                    }
                                };
                                linkMenu.add(child);
                            }
                            this.setMenu(linkMenu);
                        }
                    },
                    menu: []
                }, index++);
                FastExt.Grid.addGridContextMenu(grid, {
                    iconCls: 'extIcon extSearch searchColor',
                    text: "查找此数据",
                    onBeforeShow: function () {
                        var menu = this.ownerCt;
                        if (Ext.isEmpty(menu.cellContext.column.dataIndex)
                            || FastExt.Grid.isFileColumn(menu.cellContext.column)
                            || FastExt.Grid.isFilesColumn(menu.cellContext.column)
                            || grid.getSelection().length !== 1) {
                            this.hide();
                        }
                        else {
                            this.show();
                        }
                    },
                    handler: function () {
                        var menu = this.ownerCt;
                        var record = menu.record;
                        var fieldName = menu.cellContext.column.dataIndex;
                        menu.cellContext.column.searchValue(record.get(fieldName));
                    }
                }, index++);
                FastExt.Grid.addGridContextMenu(grid, {
                    iconCls: 'extIcon extClear',
                    text: "清空此数据",
                    onBeforeShow: function () {
                        var menu = this.ownerCt;
                        if (Ext.isEmpty(menu.cellContext.column.dataIndex) || grid.getSelection().length !== 1) {
                            this.hide();
                        }
                        else {
                            this.show();
                        }
                    },
                    handler: function () {
                        var me = this;
                        Ext.Msg.confirm("系统提醒", "您确定清空选中的单元格数据吗？", function (button, text) {
                            if (button === "yes") {
                                var menu = me.ownerCt;
                                var record = menu.record;
                                var fieldName = menu.cellContext.column.dataIndex;
                                if (Ext.isObject(menu.cellContext.column.field)) {
                                    if (!Ext.isEmpty(menu.cellContext.column.field.name)) {
                                        fieldName = menu.cellContext.column.field.name;
                                    }
                                }
                                var params = { "entityCode": grid.getStore().entity.entityCode };
                                for (var j = 0; j < grid.getStore().entity.idProperty.length; j++) {
                                    var idName = grid.getStore().entity.idProperty[j];
                                    params['data.' + idName] = record.get(idName);
                                }
                                if (grid.getStore().entity.menu) {
                                    params["menu"] = FastExt.Store.getStoreMenuText(grid.getStore());
                                }
                                params['data.' + fieldName] = "<null>";
                                FastExt.Dialog.showWait("正在清空中……");
                                FastExt.Server.updateEntity(params, function (success, message) {
                                    FastExt.Dialog.hideWait();
                                    if (success) {
                                        FastExt.Dialog.toast("清除成功！");
                                        grid.getStore().reload();
                                    }
                                    else {
                                        Ext.Msg.alert('系统提醒', message);
                                    }
                                });
                            }
                        });
                    }
                }, index++);
            }
        };
        /**
         * 配置Grid列的默认的右键菜单功能
         * @param grid
         */
        Grid.configGridHeadMenu = function (grid) {
            if (!FastExt.Base.toBool(grid.columnContextMenu, true)) {
                return;
            }
            if (!grid.columnHeadMenu) {
                return;
            }
            if (!grid.columnMenu) {
                grid.columnMenu = {};
            }
            if (!grid.columnMenu) {
                return;
            }
            var menu = grid.columnHeadMenu;
            menu.on("beforeshow", function (obj) {
                if (!FastExt.Grid.hasColumnField(menu.activeHeader)) {
                    obj.activeHeader.batchUpdate = false;
                    obj.activeHeader.operation = false;
                    obj.activeHeader.searchLink = false;
                    obj.activeHeader.batchRandom = false;
                }
                if (FastExt.Grid.isFilesColumn(obj.activeHeader)
                    || FastExt.Grid.isFileColumn(obj.activeHeader)
                    || FastExt.Grid.isLinkColumn(menu.activeHeader)
                    || FastExt.Grid.isMapColumn(menu.activeHeader)
                    || FastExt.Grid.isTargetColumn(menu.activeHeader)
                    || FastExt.Grid.isPCAColumn(menu.activeHeader)) {
                    obj.activeHeader.batchRandom = false;
                }
                if (FastExt.Grid.isContentColumn(obj.activeHeader)) {
                    obj.activeHeader.searchLink = false;
                }
                if (!obj.configHeadMenu) {
                    obj.configHeadMenu = true;
                    var menus = [];
                    if (FastExt.Base.toBool(grid.columnMenu.lookField, true)) {
                        menus.push({
                            text: '查看字段',
                            iconCls: 'extIcon extField',
                            onBeforeShow: function () {
                                if (FastExt.Base.toBool(menu.activeHeader.lookField, true)) {
                                    this.show();
                                }
                                else {
                                    this.hide();
                                }
                            },
                            handler: function () {
                                Ext.Msg.alert("查看字段", menu.activeHeader.dataIndex);
                            }
                        });
                    }
                    menus.push({
                        text: '清除无效数据',
                        iconCls: 'extIcon extClear grayColor',
                        onBeforeShow: function () {
                            if (FastExt.Base.toBool(menu.activeHeader.batchClear, true)) {
                                this.show();
                            }
                            else {
                                this.hide();
                            }
                        },
                        handler: function () {
                            var confirmConfig = {
                                title: "清除无效数据",
                                icon: Ext.Msg.QUESTION,
                                message: "将清除属性【" + menu.activeHeader.text + "】在【当前当前条件】下为空的所有无效数据！请您确定操作！",
                                buttons: Ext.Msg.YESNO,
                                defaultFocus: "no",
                                callback: function (button, text) {
                                    if (button === "yes") {
                                        FastExt.Dialog.showWait("正在清除数据中……");
                                        var columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                        var storeParams = columnGrid.getStore().proxy.extraParams;
                                        var params = {
                                            "entityCode": columnGrid.getStore().entity.entityCode,
                                            "field": menu.activeHeader.dataIndex,
                                            "menu": FastExt.Store.getStoreMenuText(columnGrid.getStore())
                                        };
                                        FastExt.Server.clearEntity(FastExt.Json.mergeJson(params, storeParams), function (success, message) {
                                            FastExt.Dialog.hideWait();
                                            if (success) {
                                                FastExt.Grid.getColumnGrid(menu.activeHeader).getStore().loadPage(1);
                                            }
                                            FastExt.Dialog.showAlert("清理结果", message);
                                        });
                                    }
                                }
                            };
                            Ext.Msg.confirm(confirmConfig);
                        }
                    });
                    if (grid.getStore().entity) {
                        if (FastExt.Base.toBool(grid.columnMenu.searchLink, true)) {
                            menus.push({
                                text: '配置搜索链',
                                iconCls: 'extIcon extLink',
                                onBeforeShow: function () {
                                    var columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                    if (columnGrid.fromRecycle) {
                                        this.hide();
                                        return;
                                    }
                                    if (FastExt.Base.toBool(menu.activeHeader.searchLink, true)) {
                                        this.show();
                                    }
                                    else {
                                        this.hide();
                                    }
                                },
                                handler: function () {
                                    FastExt.Grid.configColumnSearchLink(menu.activeHeader);
                                }
                            });
                        }
                        if (FastExt.Base.toBool(grid.columnMenu.operation, true)) {
                            menus.push({
                                text: '计算数据',
                                iconCls: 'extIcon extMath',
                                onBeforeShow: function () {
                                    var columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                    if (columnGrid.fromRecycle) {
                                        this.hide();
                                        return;
                                    }
                                    if (FastExt.Base.toBool(menu.activeHeader.operation, false)) {
                                        this.show();
                                    }
                                    else {
                                        this.hide();
                                    }
                                },
                                menu: [
                                    {
                                        text: '计算总和',
                                        iconCls: 'extIcon extMath',
                                        handler: function () {
                                            FastExt.Grid.showColumnCompute(grid, menu.activeHeader, FastEnum.ComputeType.sum);
                                        }
                                    },
                                    {
                                        text: '计算平均值',
                                        iconCls: 'extIcon extMath',
                                        handler: function () {
                                            FastExt.Grid.showColumnCompute(grid, menu.activeHeader, FastEnum.ComputeType.avg);
                                        }
                                    },
                                    {
                                        text: '计算最大值',
                                        iconCls: 'extIcon extMath',
                                        handler: function () {
                                            FastExt.Grid.showColumnCompute(grid, menu.activeHeader, FastEnum.ComputeType.max);
                                        }
                                    },
                                    {
                                        text: '计算最小值',
                                        iconCls: 'extIcon extMath',
                                        handler: function () {
                                            FastExt.Grid.showColumnCompute(grid, menu.activeHeader, FastEnum.ComputeType.min);
                                        }
                                    }
                                ]
                            });
                        }
                    }
                    if (FastExt.Base.toBool(grid.columnMenu.batchUpdate, true)) {
                        menus.push({
                            text: '批量修改数据',
                            iconCls: 'extIcon extEdit',
                            onBeforeShow: function () {
                                var columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                if (columnGrid.fromRecycle) {
                                    this.hide();
                                    return;
                                }
                                if (!FastExt.Base.toBool(menu.activeHeader.editable, true)) {
                                    this.hide();
                                    return;
                                }
                                if (FastExt.Base.toBool(menu.activeHeader.batchUpdate, true)) {
                                    this.show();
                                }
                                else {
                                    this.hide();
                                }
                            },
                            handler: function () {
                                FastExt.Grid.showBatchEditColumn(menu.activeHeader);
                            }
                        });
                    }
                    if (FastExt.Base.toBool(grid.columnMenu.batchRandom, true)) {
                        menus.push({
                            text: '批量随机数据',
                            iconCls: 'extIcon extRandom',
                            onBeforeShow: function () {
                                var columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                if (columnGrid.fromRecycle) {
                                    this.hide();
                                    return;
                                }
                                if (!FastExt.Base.toBool(menu.activeHeader.editable, true)) {
                                    this.hide();
                                    return;
                                }
                                if (FastExt.Base.toBool(menu.activeHeader.batchRandom, true)) {
                                    this.show();
                                }
                                else {
                                    this.hide();
                                }
                            },
                            handler: function () {
                                FastExt.Grid.showBatchEditColumnRandom(menu.activeHeader);
                            }
                        });
                    }
                    if (FastExt.Base.toBool(grid.columnMenu.cancelSort, true)) {
                        menus.push({
                            text: '取消排序',
                            iconCls: 'extIcon extCancelOrder',
                            onBeforeShow: function () {
                                var columnGrid = FastExt.Grid.getColumnGrid(menu.activeHeader);
                                if (columnGrid.fromRecycle) {
                                    this.hide();
                                    return;
                                }
                                if (FastExt.Base.toBool(menu.activeHeader.cancelSort, true)) {
                                    this.show();
                                }
                                else {
                                    this.hide();
                                }
                            },
                            handler: function () {
                                try {
                                    var sortCollection = grid.getStore().getSorters();
                                    if (sortCollection.count() === 0) {
                                        return;
                                    }
                                    sortCollection.removeByKey(menu.activeHeader.dataIndex);
                                    grid.getStore().loadPage(1);
                                    menu.activeHeader.sortDirection = null;
                                    FastExt.Grid.refreshColumnStyle(menu.activeHeader);
                                }
                                catch (e) {
                                    FastExt.Dialog.showException(e);
                                }
                            }
                        });
                    }
                    obj.insert(0, menus);
                }
                FastExt.Menu.fireMenuEvent(obj, "onBeforeShow");
            });
        };
        /**
         * 配置Grid默认的ToolBar功能
         * @param grid
         */
        Grid.configDefaultToolBar = function (grid) {
            if (!grid) {
                return;
            }
            var toolbar = grid.down("toolbar[dock='top']");
            if (toolbar) {
                if (FastExt.Base.toBool(grid.fromRecycle, false)) {
                    toolbar.setHidden(true);
                    return;
                }
                if (!FastExt.Base.toBool(grid.defaultToolBar, true)) {
                    return;
                }
                if (!grid.operate) {
                    return;
                }
                var button = {
                    xtype: 'button',
                    text: '更多操作',
                    iconCls: 'extIcon extMore',
                    menu: [
                        {
                            text: '导出Excel',
                            iconCls: 'extIcon extExcel',
                            hidden: !FastExt.Base.toBool(grid.operate.excelOut, true),
                            handler: function () {
                                FastExt.Grid.exportGrid(grid);
                            }
                        },
                        {
                            text: '导入Excel',
                            iconCls: 'extIcon extExcel',
                            hidden: !FastExt.Base.toBool(grid.operate.excelIn, true),
                            menu: [
                                {
                                    text: '下载模板',
                                    iconCls: 'extIcon extExcelModule searchColor',
                                    handler: function () {
                                        FastExt.Dialog.showWait("正在生成中……");
                                        var params = { entityCode: grid.getStore().entity.entityCode };
                                        if (grid.getStore().entity.menu) {
                                            params.title = grid.getStore().entity.menu.text;
                                        }
                                        Ext.each(grid.getColumns(), function (item, index) {
                                            //排除文件类
                                            if (FastExt.Grid.isFileColumn(item) || FastExt.Grid.isFilesColumn(item)
                                                || !FastExt.Base.toBool(item.excelHeader, true)
                                                || item.isHidden()) {
                                                return;
                                            }
                                            if (!Ext.isEmpty(item.dataIndex)) {
                                                var indexStr = index;
                                                if (index < 10) {
                                                    indexStr = "0" + index;
                                                }
                                                params["column[" + indexStr + "].width"] = item.width;
                                                params["column[" + indexStr + "].text"] = item.configText;
                                                params["column[" + indexStr + "].groupHeaderText"] = item.groupHeaderText;
                                                params["column[" + indexStr + "].enum"] = FastExt.Grid.getColumnEnumName(item);
                                                params["column[" + indexStr + "].type"] = FastExt.Grid.getColumnFieldType(item);
                                                params["column[" + indexStr + "].dataIndex"] = item.dataIndex;
                                                if (FastExt.Grid.isLinkColumn(item)) {
                                                    params["column[" + indexStr + "].dataIndex"] = item.field.name;
                                                }
                                            }
                                        });
                                        FastExt.Server.excelModule(params, function (success, data, message) {
                                            FastExt.Dialog.hideWait();
                                            if (success) {
                                                FastExt.Dialog.toast("生成成功！");
                                                location.href = "attach/" + data;
                                            }
                                            else {
                                                Ext.Msg.alert('系统提醒', "生成失败！" + message);
                                            }
                                        });
                                    }
                                },
                                {
                                    text: '导入数据',
                                    iconCls: 'extIcon extExcelImport searchColor',
                                    handler: function () {
                                        var params = { entityCode: grid.getStore().entity.entityCode };
                                        FastExt.File.importExcel(this, params, grid.importExcelItems).then(function (data) {
                                            if (data) {
                                                grid.getStore().loadPage(1);
                                            }
                                        });
                                    }
                                }
                            ]
                        },
                        {
                            iconCls: 'extIcon extSet',
                            text: '操作设置',
                            handler: function () {
                                FastExt.Grid.setGrid(this, grid);
                            }
                        }
                    ]
                };
                toolbar.add("->");
                toolbar.add(button);
            }
        };
        /**
         * 配置Grid的ToolTip鼠标悬浮提醒的功能
         * @param grid
         */
        Grid.configGridTip = function (grid) {
            if (!grid) {
                return;
            }
            var view = grid.getView();
            if (!view) {
                return;
            }
            grid.tip = new Ext.ToolTip({
                target: view.el,
                delegate: '.x-grid-cell-inner',
                trackMouse: true,
                renderTo: Ext.getBody(),
                listeners: {
                    beforeshow: function (tip) {
                        if (grid.operate && !grid.operate.hoverTip) {
                            return false;
                        }
                        var innerHTML = tip.triggerElement.innerHTML;
                        if (Ext.isEmpty(innerHTML) || innerHTML === "&nbsp;") {
                            return false;
                        }
                        var tipHtml = innerHTML;
                        var dataChild = tip.triggerElement.firstChild;
                        if (dataChild != null && dataChild.nodeType === 1) {
                            if (dataChild.getAttribute("class") === "x-grid-row-checker") {
                                return false;
                            }
                            var detailsId = dataChild.getAttribute("details-id");
                            if (window[detailsId]) {
                                tip.update(window[detailsId]);
                                return true;
                            }
                        }
                        tip.update(tipHtml);
                    }
                }
            });
        };
        /**
         * 配置Grid默认绑定的事件功能
         * @param grid
         */
        Grid.configGridListeners = function (grid) {
            if (!grid || grid.configListener) {
                return;
            }
            grid.configListener = true;
            grid.onTabActivate = function (tab) {
                if (this.operate.refreshData) {
                    this.getStore().reload();
                }
            };
            grid.refreshSelect = function () {
                var me = this;
                if (me.selectButtons) {
                    Ext.each(me.selectButtons, function (item, index) {
                        var selectSize = me.getSelection().length;
                        if (me.selectCount) {
                            selectSize = me.selectCount;
                        }
                        var checkSelect = item.checkSelect;
                        if (checkSelect === "multiple" || checkSelect === "m" || checkSelect > 1) {
                            item.setDisabled(!(selectSize > 0));
                        }
                        else if (checkSelect === "radio" || checkSelect === "r" || checkSelect === "single" || checkSelect === "s" || checkSelect === 1) {
                            item.setDisabled(!(selectSize === 1));
                        }
                    });
                }
            };
            grid.refreshDetailsPanel = function () {
                var targetGrid = this;
                if (!targetGrid.detailsPanels || targetGrid.detailsPanels.length === 0) {
                    return;
                }
                for (var i = 0; i < targetGrid.detailsPanels.length; i++) {
                    var detailsPanel = targetGrid.detailsPanels[i];
                    if (!detailsPanel) {
                        continue;
                    }
                    if (detailsPanel.fromWindow) {
                        detailsPanel.setRecord(targetGrid);
                    }
                    else {
                        if (targetGrid.operate && targetGrid.operate.autoDetails) {
                            detailsPanel.setRecord(targetGrid);
                        }
                        else {
                            detailsPanel.close();
                        }
                    }
                }
            };
            grid.on('viewready', function (obj, eOpts) {
                obj.getHeaderContainer().sortOnClick = false;
            });
            grid.on('beforedestroy', function (obj, eOpts) {
                FastExt.Grid.saveGridColumn(obj);
            });
            grid.on('columnmove', function (ct, column, fromIdx, toIdx, eOpts) {
                if (column.isSubHeader) {
                    column.groupHeaderText = column.ownerCt.text;
                }
                else {
                    column.groupHeaderText = null;
                }
            });
            grid.on('headertriggerclick', function (ct, column, e, t, eOpts) {
                if (Ext.isEmpty(column.dataIndex) || grid.fromRecycle)
                    return;
                ct.sortOnClick = false;
                ct.triggerColumn = column;
            });
            grid.on('headercontextmenu', function (ct, column, e, t, eOpts) {
                if (Ext.isEmpty(column.dataIndex) || grid.fromRecycle)
                    return;
                ct.sortOnClick = false;
                ct.onHeaderTriggerClick(column, e, column.triggerEl);
            });
            grid.on('headermenucreate', function (ct, menu, headerCt, eOpts) {
                grid.columnHeadMenu = menu;
                FastExt.Grid.configGridHeadMenu(grid);
            });
            grid.on('headerclick', function (ct, column, e, t, eOpts) {
                if (Ext.isEmpty(column.dataIndex))
                    return;
                ct.sortOnClick = false;
                if (!FastExt.Grid.showColumnSearchMenu(column)) {
                    ct.onHeaderTriggerClick(column, e, column.triggerEl);
                }
            });
            grid.on('sortchange', function (ct, column, direction, eOpts) {
                if (Ext.isEmpty(column.dataIndex))
                    return;
                column.sortDirection = direction;
                FastExt.Grid.refreshColumnStyle(column);
            });
            grid.on('columnresize', function (ct, column, width, eOpts) {
                // column.width=width;  此处注释，避免出现分组列时 宽度错乱
                ct.sortOnClick = false;
            });
            grid.on('columnschanged', function (ct, eOpts) {
                ct.sortOnClick = false;
            });
            grid.on('cellcontextmenu', function (obj, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                if (Ext.isEmpty(e.position.column.dataIndex) || grid.fromRecycle) {
                    return;
                }
                if (Ext.isObject(grid.contextMenu)) {
                    if (grid.contextMenu.items.length > 0) {
                        grid.contextMenu.cellIndex = cellIndex;
                        grid.contextMenu.record = record;
                        grid.contextMenu.rowIndex = rowIndex;
                        grid.contextMenu.cellTd = td;
                        grid.contextMenu.tr = tr;
                        grid.contextMenu.cellContext = e.position;
                        grid.contextMenu.on("show", function (currMenu, eOpts) {
                            if (currMenu.cellTd) {
                                var tdColor = FastExt.Color.toColor(FastExt.System.getExt("front-color-dark").value);
                                $(currMenu.cellTd).css("background", tdColor);
                            }
                        });
                        grid.contextMenu.on("hide", function (currMenu, eOpts) {
                            if (currMenu.cellTd) {
                                $(currMenu.cellTd).css("background", "transparent");
                            }
                        });
                        obj.getSelectionModel().select(record);
                        obj.fireEvent("selectionchange", obj, record, eOpts);
                        FastExt.Menu.fireMenuEvent(grid.contextMenu, "onBeforeShow");
                        grid.contextMenu.showAt(e.getXY());
                    }
                }
            });
            grid.getStore().on('endupdate', function (eOpts) {
                try {
                    if (!grid.getStore()) {
                        return true;
                    }
                    if (grid.getStore().holdUpdate) {
                        return true;
                    }
                    var records_1 = grid.getStore().getUpdatedRecords();
                    Ext.each(grid.updateButtons, function (item, index) {
                        item.setDisabled(records_1.length === 0);
                    });
                    if (grid.operate && grid.operate.autoUpdate) {
                        FastExt.Store.commitStoreUpdate(grid.getStore());
                    }
                }
                catch (e) {
                    FastExt.Dialog.showException(e, "endupdate");
                }
            });
            grid.on("celldblclick", function (obj, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                grid.doEdit = true;
            });
            grid.on('beforeedit', function (editor, context, eOpts) {
                if (!grid.updateEnable) {
                    return false;
                }
                if (!grid.doEdit) {
                    return false;
                }
                if (grid.fromRecycle) {
                    return false;
                }
                grid.doEdit = false;
                if (!FastExt.Base.toBool(context.column.editable, true)) {
                    return false;
                }
                if (context.column.hasListener("beforeedit")) {
                    if (!context.column.fireEvent("beforeedit", context)) {
                        return false;
                    }
                }
                var editorField = context.column.field;
                var cell = Ext.get(context.cell);
                editorField.labelTitle = context.column.text;
                if (Ext.isFunction(editorField.setValue) && !FastExt.Base.toBool(context.column.password, false)) {
                    if (Ext.isObject(context.value) || Ext.isArray(context.value)) {
                        editorField.setValue(JSON.stringify(context.value), context.record);
                    }
                    else {
                        editorField.setValue(context.value, context.record);
                    }
                }
                if (Ext.isFunction(editorField.showWindow)) {
                    editorField.showWindow(cell, function (result) {
                        if (Ext.isEmpty(context.value) && Ext.isEmpty(result.getValue())) {
                            return;
                        }
                        FastExt.Store.setRecordValue(context.record, context.field, result);
                    });
                    return false;
                }
                if (!context.column.editMenu) {
                    context.column.editMenu = Ext.create('Ext.menu.Menu', {
                        modal: true,
                        layout: 'fit',
                        showSeparator: false,
                        items: [
                            {
                                xtype: 'panel',
                                layout: 'fit',
                                width: cell.getWidth(),
                                height: cell.getHeight(),
                                style: {
                                    background: "#ffffff",
                                    borderWidth: 1,
                                    borderColor: "#ffffff",
                                    color: '#eeeee'
                                },
                                border: 0,
                                items: [editorField]
                            }
                        ],
                        listeners: {
                            show: function (obj, epts) {
                                var fieldObj = obj.items.get(0).items.get(0);
                                fieldObj.focus();
                                try {
                                    new Ext.util.KeyMap({
                                        target: obj.getEl(),
                                        key: 13,
                                        fn: function (keyCode, e) {
                                            obj.hide();
                                        },
                                        scope: this
                                    });
                                }
                                catch (e) {
                                    console.error(e);
                                }
                            },
                            beforehide: function (obj, epts) {
                                var fieldObj = obj.items.get(0).items.get(0);
                                if (!fieldObj.isValid()) {
                                    var currError = fieldObj.getErrors();
                                    if (currError.length === 0) {
                                        currError = [fieldObj.invalidText];
                                    }
                                    if (Ext.isEmpty(currError[0])) {
                                        currError[0] = "数据错误！";
                                    }
                                    FastExt.Dialog.toast(currError[0]);
                                    FastExt.Component.shakeComment(obj, function () {
                                        obj.holdShow = false;
                                    });
                                    obj.holdShow = true;
                                    return false;
                                }
                                return true;
                            },
                            hide: function (obj, epts) {
                                if (!obj.context) {
                                    return;
                                }
                                var fieldObj = obj.items.get(0).items.get(0);
                                if (!fieldObj) {
                                    return;
                                }
                                if ((Ext.isEmpty(obj.context.value) || FastExt.Base.toBool(obj.context.column.password, false)) && Ext.isEmpty(fieldObj.getValue())) {
                                    return;
                                }
                                FastExt.Store.setRecordValue(obj.context.record, obj.context.field, fieldObj);
                                fieldObj.setValue(null);
                            }
                        }
                    });
                }
                context.column.editMenu.setWidth(context.column.getWidth());
                context.column.editMenu.context = context;
                context.column.editMenu.showBy(cell, "tl");
                return false;
            });
            grid.on('selectionchange', function (obj, selected, eOpts) {
                try {
                    grid.refreshSelect();
                    var pagingToolBar = grid.child('#pagingToolBar');
                    if (pagingToolBar) {
                        pagingToolBar.updateInfo();
                    }
                }
                catch (e) {
                    FastExt.Dialog.showException(e, "按钮选中检测！[selectionchange]");
                }
            });
        };
        /**
         * 配置Grid的布局
         * @param grid
         */
        Grid.configGridLayout = function (grid) {
            return new Ext.Promise(function (resolve, reject) {
                if (!grid) {
                    return;
                }
                grid.setLoading("初始化配置中……");
                FastExt.Grid.restoreGridOperate(grid).then(function () {
                    FastExt.Grid.restoreGridColumn(grid).then(function () {
                        resolve(true);
                    });
                });
            });
        };
        /**
         * 构建grid列表右侧详细面板
         * @param grid
         * @param fromWindow
         * @private
         */
        Grid.getDetailsPanel = function (grid, fromWindow) {
            var subtitle = "";
            if (grid.getStore().entity.menu) {
                subtitle = grid.getStore().entity.menu.text;
            }
            if (!grid.detailsPanels) {
                grid.detailsPanels = [];
            }
            var detailsConfig = {
                subtitle: subtitle,
                layout: 'border',
                border: 0,
                autoScroll: false,
                scrollable: false,
                closeAction: 'hide',
                dataId: -1,
                currIsClosed: false,
                closeTimer: null,
                isWindow: fromWindow,
                setRecord: function (grid) {
                    try {
                        var me_1 = this;
                        if (!me_1.items) {
                            return false;
                        }
                        window.clearTimeout(me_1.closeTimer);
                        if (grid != null) {
                            var data = grid.getSelectionModel().getSelection();
                            if (data.length === 1) {
                                me_1.record = data[0];
                                me_1.items.get(0).setRecord(grid, data[0]);
                                me_1.show();
                            }
                            else {
                                if (me_1.isVisible() && !this.isWindow) {
                                    me_1.closeTimer = setTimeout(function () {
                                        me_1.close();
                                        setTimeout(function () {
                                            var left = grid.view.getEl().getScrollLeft();
                                            grid.view.getEl().scrollTo("left", left - 1, false);
                                        }, 100);
                                    }, 80);
                                }
                            }
                        }
                        else {
                            me_1.close();
                        }
                    }
                    catch (e) {
                        FastExt.Dialog.showException(e);
                    }
                    return true;
                },
                listeners: {
                    afterrender: function () {
                        if (this.isWindow) {
                            this.setRecord(grid);
                        }
                    },
                    collapse: function (p, eOpts) {
                        this.down("#close").hide();
                    },
                    beforeexpand: function (p, eOpts) {
                        this.down("#close").show();
                    }
                },
                items: [FastExt.Grid.builderDetailsGrid()]
            };
            if (fromWindow) {
                detailsConfig.region = "center";
            }
            else {
                detailsConfig.title = '数据详情';
                detailsConfig.iconCls = 'extIcon extDetails';
                detailsConfig.collapsed = false;
                detailsConfig.split = true;
                detailsConfig.hidden = true;
                detailsConfig.region = "east";
                detailsConfig.maxWidth = parseInt((document.body.clientWidth / 2).toFixed(0));
                detailsConfig.width = parseInt((document.body.clientWidth * 0.3).toFixed(0));
                detailsConfig.minWidth = 200;
                detailsConfig.tools = [
                    {
                        type: 'gear',
                        callback: function () {
                            FastExt.Grid.setGrid(this, grid);
                        }
                    }, {
                        type: 'close',
                        itemId: 'close',
                        callback: function () {
                            detailsPanel.collapse();
                        }
                    }
                ];
            }
            var detailsPanel = Ext.create('Ext.panel.Panel', detailsConfig);
            detailsPanel.fromWindow = fromWindow;
            detailsPanel.changeListener = grid.on({
                scope: grid,
                selectionchange: function (obj, selected, eOpts) {
                    try {
                        var targetGrid = obj;
                        if (obj.getStore().grid) {
                            targetGrid = obj.getStore().grid;
                        }
                        targetGrid.refreshDetailsPanel();
                    }
                    catch (e) {
                        FastExt.Dialog.showException(e);
                    }
                },
                destroyable: true
            });
            grid.detailsPanels.push(detailsPanel);
            return detailsPanel;
        };
        /**
         * 构建grid列表右侧详细面板中的详细数据grid控件
         */
        Grid.builderDetailsGrid = function () {
            return Ext.create('Ext.grid.Panel', {
                border: 0,
                scrollable: 'y',
                region: 'center',
                store: Ext.create('Ext.data.Store', {
                    groupField: 'groupHeaderText',
                    autoLoad: false,
                    fields: []
                }),
                hideHeaders: true,
                deferRowRender: false,
                superGrid: null,
                features: [{
                        ftype: 'grouping',
                        collapsible: false,
                        hideGroupedHeader: true,
                        expandTip: null,
                        collapseTip: null,
                        groupHeaderTpl: [
                            '<b>{name:this.formatName}</b>', {
                                formatName: function (name) {
                                    if (name.toString().startsWith("BASE")) {
                                        return "基本属性";
                                    }
                                    return name;
                                }
                            }
                        ]
                    }],
                setRecord: function (grid, record) {
                    this.superGrid = grid;
                    var columns = grid.getColumns();
                    var data = [];
                    var lastGroupNon = "BASE-" + new Date().getTime();
                    for (var i = 0; i < columns.length; i++) {
                        var column = columns[i];
                        if (Ext.isEmpty(column.dataIndex) || !FastExt.Base.toBool(column.hideable, true)) {
                            continue;
                        }
                        var item = {
                            text: column.configText,
                            value: record.get(column.dataIndex),
                            dataIndex: column.dataIndex,
                            groupHeaderText: column.groupHeaderText,
                            renderer: column.renderer,
                            index: column.getIndex(),
                            record: record
                        };
                        if (!item.groupHeaderText) {
                            item.groupHeaderText = lastGroupNon;
                        }
                        else {
                            lastGroupNon = "BASE-" + i + "-" + new Date().getTime();
                        }
                        data.push(item);
                    }
                    data.sort(function (a, b) {
                        return a.index - b.index;
                    });
                    this.getStore().loadData(data);
                },
                columns: [
                    {
                        header: '名称',
                        dataIndex: 'text',
                        align: 'right',
                        flex: 0.3,
                        tdCls: 'tdVTop',
                        renderer: function (val, m, r) {
                            if (Ext.isEmpty(val)) {
                                return "";
                            }
                            m.style = 'color:#000000;overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                            return "<b>" + val + "：</b>";
                        }
                    },
                    {
                        header: '值',
                        dataIndex: 'value',
                        flex: 0.7,
                        align: 'left',
                        renderer: function (val, m, r) {
                            try {
                                m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                                var fun = r.get("renderer");
                                if (Ext.isFunction(fun)) {
                                    var value = fun(val, m, r.get("record"), -1, -1, null, null, true);
                                    if (Ext.isEmpty(value)) {
                                        return "<font color='#ccc'>无</font>";
                                    }
                                    return value;
                                }
                                return val;
                            }
                            catch (e) {
                                return val;
                            }
                        }
                    }
                ],
                tbar: {
                    flex: 1,
                    emptyText: '查找属性（轻敲回车键）',
                    margin: '5',
                    xtype: 'textfield',
                    doSearch: function () {
                        var grid = this.ownerCt;
                        var store = grid.getStore();
                        var currIndex = 0;
                        var dataIndex = store.getAt(0).get("dataIndex");
                        var text = null;
                        var searchKey = this.getValue();
                        var currRecord = null;
                        if (!Ext.isEmpty(searchKey)) {
                            store.each(function (record, index) {
                                var fieldName = record.get("text").toString();
                                var fieldValue = record.get("value");
                                if (fieldName.indexOf(searchKey) >= 0) {
                                    currIndex = index;
                                    dataIndex = record.get("dataIndex");
                                    text = fieldName;
                                    currRecord = record;
                                    return;
                                }
                                if (!Ext.isEmpty(fieldValue) && fieldValue.toString().indexOf(searchKey) >= 0) {
                                    currIndex = index;
                                    dataIndex = record.get("dataIndex");
                                    text = fieldName;
                                    currRecord = record;
                                    return false;
                                }
                            });
                        }
                        FastExt.Grid.scrollToColumn(grid.superGrid, dataIndex, text);
                        grid.getSelectionModel().select(currIndex);
                        grid.view.focusRow(currIndex);
                        // grid.view.setScrollY(currIndex * 25, true);
                    },
                    triggers: {
                        search: {
                            cls: 'text-search',
                            handler: function () {
                                this.doSearch();
                            }
                        }
                    },
                    listeners: {
                        render: function (obj, eOpts) {
                            try {
                                new Ext.util.KeyMap({
                                    target: obj.getEl(),
                                    key: 13,
                                    fn: function (keyCode, e) {
                                        this.doSearch();
                                    },
                                    scope: this
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                },
                bbar: {
                    xtype: 'label',
                    style: {
                        background: "#ffffff"
                    },
                    text: '小技巧：双击属性可快速定位左侧表格对应的列！',
                    padding: '10'
                },
                viewConfig: {
                    enableTextSelection: true
                },
                listeners: {
                    itemdblclick: function () {
                        try {
                            var data = this.getSelectionModel().getSelection();
                            FastExt.Grid.scrollToColumn(this.superGrid, data[0].get("dataIndex"), data[0].get("text"));
                        }
                        catch (e) {
                            FastExt.Dialog.showException(e, "details:itemdblclick");
                        }
                    }
                }
            });
        };
        /**
         * 判断grid中是否有正在搜索的列
         * @param grid
         */
        Grid.hasSearchColumn = function (grid) {
            var search = false;
            Ext.each(grid.getColumns(), function (item, index) {
                if (!Ext.isEmpty(item.dataIndex)) {
                    if (item.where && item.where.length > 0) {
                        search = true;
                        return false;
                    }
                }
            });
            return search;
        };
        /**
         * 快速查找grid中的column对象
         * @param grid
         * @param dataIndex column的数据索引
         * @param text column的标题
         */
        Grid.getColumn = function (grid, dataIndex, text) {
            var columns = grid.getColumns();
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];
                if (column.dataIndex === dataIndex) {
                    if (text && column.text === text) {
                        return column;
                    }
                    return column;
                }
            }
            return null;
        };
        /**
         * 触发grid检查是否有搜索的列，如果有将修改底部bar的搜索按钮，突出提醒等功能
         * @param grid
         */
        Grid.checkColumnSearch = function (grid) {
            try {
                var hasSearch_1 = false;
                Ext.each(grid.getColumns(), function (item) {
                    if (item.where) {
                        if (item.where.length > 0) {
                            hasSearch_1 = true;
                            return false;
                        }
                    }
                });
                var pagingToolBar = grid.child('#pagingToolBar');
                if (pagingToolBar) {
                    var searchBtn = pagingToolBar.down("button[toolType=searchBtn]");
                    if (searchBtn) {
                        if (hasSearch_1) {
                            searchBtn.setIconCls("extIcon extSearch redColor");
                        }
                        else {
                            searchBtn.setIconCls("extIcon extSearch grayColor");
                        }
                    }
                }
            }
            catch (e) {
                console.error(e);
            }
        };
        /**
         * 判断column是否可编辑
         * @param column
         */
        Grid.hasColumnField = function (column) {
            try {
                if (Ext.isObject(column.field)) {
                    return true;
                }
                if (!Ext.isEmpty(column.field)) {
                    return true;
                }
                return false;
            }
            catch (e) {
                console.error(e);
            }
            return false;
        };
        /**
         * 判断目标是否是grid的列组件
         * @param target
         */
        Grid.isColumnType = function (target) {
            return target === "gridcolumn" || target.xtype === "gridcolumn";
        };
        /**
         * 是否是日期格式的列
         * @param column
         */
        Grid.isDateColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isDateField(column.field);
        };
        /**
         * 是否是数字编辑的列
         * @param column
         */
        Grid.isNumberColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isNumberField(column.field);
        };
        /**
         * 是否是下拉框的列
         * @param column
         */
        Grid.isComboColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isComboField(column.field);
        };
        /**
         * 是否文件类型的列
         * @param column
         */
        Grid.isFileColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isFileField(column.field);
        };
        /**
         * 是否是大文本的列
         * @param column
         */
        Grid.isContentColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isHtmlContentField(column.field) || FastExt.Form.isContentField(column.field);
        };
        /**
         * 是否多文件的列
         * @param column
         */
        Grid.isFilesColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isFilesField(column.field);
        };
        /**
         * 是否是枚举的列
         * @param column
         */
        Grid.isEnumColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isEnumField(column.field);
        };
        /**
         * 是否是关联表格的列
         * @param column
         */
        Grid.isLinkColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isLinkField(column.field);
        };
        /**
         * 是否是地图的列
         * @param column
         */
        Grid.isMapColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isMapField(column.field);
        };
        /**
         * 是否是省份选择的列
         * @param column
         */
        Grid.isPCAColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isPCAField(column.field);
        };
        /**
         * 是否目标类的列
         * @param column
         */
        Grid.isTargetColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isTargetField(column.field);
        };
        /**
         * 获得grid的选择器插件
         * @returns Ext.grid.selection.SpreadsheetModel
         */
        Grid.getGridSelModel = function () {
            return Ext.create('Ext.grid.selection.SpreadsheetModel', {
                pruneRemoved: false,
                checkboxSelect: true,
                hasLockedHeader: true,
                cellSelect: false,
                rowNumbererHeaderWidth: 0,
                listeners: {
                    focuschange: function (obj, oldFocused, newFocused, eOpts) {
                        if (obj.store && obj.store.grid) {
                            var pagingToolBar = obj.store.grid.child('#pagingToolBar');
                            if (pagingToolBar) {
                                pagingToolBar.updateInfo();
                            }
                        }
                    }
                }
            });
        };
        /**
         * 闪烁列
         * @param column 列对象
         */
        Grid.blinkColumn = function (column) {
            if (column.blinking)
                return;
            column.blinking = true;
            var currColor = column.getEl().getStyle("color");
            var currBGColor = column.getEl().getStyle("background");
            var changeBg = "#e41f00";
            if (currBGColor.indexOf("linear-gradient") > 0) {
                changeBg = "linear-gradient(0deg, #e41f00, #fefefe)";
            }
            column.setStyle({
                color: 'white',
                background: changeBg
            });
            setTimeout(function () {
                column.setStyle({
                    color: currColor,
                    background: currBGColor
                });
                column.blinking = false;
            }, 1000);
        };
        /**
         * 滚到到指定的列
         * @param grid grid对象
         * @param dataIndex 列的属性dataIndex
         * @param text 列的标题
         */
        Grid.scrollToColumn = function (grid, dataIndex, text) {
            var column = FastExt.Grid.getColumn(grid, dataIndex, text);
            FastExt.Grid.blinkColumn(column);
            var x = column.getLocalX();
            if (column.isSubHeader) {
                x += column.ownerCt.getLocalX();
            }
            grid.view.getEl().scrollTo("left", x, true);
        };
        /**
         * 弹出设置grid操作界面
         * @param obj
         * @param grid
         * @see {@link FastExt.GridOperate}
         */
        Grid.setGrid = function (obj, grid) {
            var setPanel = Ext.create('Ext.form.Panel', {
                bodyPadding: 5,
                region: 'center',
                autoScroll: true,
                viewModel: {
                    data: grid.operate
                },
                defaults: {
                    labelWidth: FastExt.Base.getNumberValue(FastExt.System.fontSize) * 4 + 8
                },
                items: [
                    {
                        xtype: 'checkboxfield',
                        fieldLabel: '删除提醒',
                        labelAlign: 'right',
                        name: 'alertDelete',
                        columnWidth: 1,
                        bind: "{alertDelete}",
                        uncheckedValue: false,
                        boxLabel: '删除数据时，系统会弹出确认删除框，避免误操作删除！'
                    },
                    {
                        xtype: 'checkboxfield',
                        fieldLabel: '修改提醒',
                        labelAlign: 'right',
                        columnWidth: 1,
                        name: 'alertUpdate',
                        bind: "{alertUpdate}",
                        hidden: !grid.updateEnable,
                        uncheckedValue: false,
                        boxLabel: '修改数据时，系统会弹出确认修改框，避免误操作修改！'
                    },
                    {
                        xtype: 'checkboxfield',
                        fieldLabel: '自动提交',
                        labelAlign: 'right',
                        columnWidth: 1,
                        name: 'autoUpdate',
                        bind: "{autoUpdate}",
                        hidden: !grid.updateEnable,
                        uncheckedValue: false,
                        boxLabel: '双击编辑修改数据后，系统自动提交被修改的数据！'
                    },
                    {
                        xtype: 'checkboxfield',
                        fieldLabel: '弹出详情',
                        labelAlign: 'right',
                        columnWidth: 1,
                        name: 'autoDetails',
                        bind: "{autoDetails}",
                        uncheckedValue: false,
                        boxLabel: '点击数据时，右侧自动弹出此数据的详情窗体！'
                    },
                    {
                        xtype: 'checkboxfield',
                        fieldLabel: '悬浮阅览',
                        labelAlign: 'right',
                        columnWidth: 1,
                        name: 'hoverTip',
                        bind: "{hoverTip}",
                        uncheckedValue: false,
                        boxLabel: '当鼠标悬浮在数据超过2秒后，会在鼠标右下方弹出此数据的阅览！'
                    },
                    {
                        xtype: 'checkboxfield',
                        fieldLabel: '数据刷新',
                        labelAlign: 'right',
                        columnWidth: 1,
                        name: 'refreshData',
                        bind: "{refreshData}",
                        uncheckedValue: false,
                        boxLabel: '离开此标签页后，再次返回此标签页时将刷新当前标签页的列表数据！'
                    }
                ]
            });
            var winTitle = "操作设置";
            if (grid.getStore().entity && grid.getStore().entity.menu) {
                winTitle = FastExt.Store.getStoreMenuText(grid.getStore()) + "-" + winTitle;
            }
            var winWidth = parseInt((document.body.clientWidth * 0.3).toFixed(0));
            var winHeight = parseInt((document.body.clientHeight * 0.4).toFixed(0));
            var win = Ext.create('Ext.window.Window', {
                title: winTitle,
                iconCls: 'extIcon extSet',
                height: winHeight,
                width: winWidth,
                minHeight: 370,
                minWidth: 300,
                layout: 'border',
                resizable: false,
                animateTarget: obj,
                items: [setPanel],
                modal: true,
                constrain: true,
                buttons: [
                    "->", {
                        text: '保存配置',
                        iconCls: 'extIcon extSave whiteColor',
                        handler: function () {
                            FastExt.Dialog.showWait("正在保存中…");
                            FastExt.Server.saveExtConfig(grid.code, "GridOperate", Ext.encode(setPanel.getForm().getValues()), function (success, message) {
                                FastExt.Dialog.hideWait();
                                if (success) {
                                    grid.operate = setPanel.getForm().getValues();
                                    FastExt.Dialog.toast("操作设置成功！");
                                    win.close();
                                }
                                else {
                                    Ext.Msg.alert('系统提醒', message);
                                }
                            });
                        }
                    },
                    {
                        text: '取消',
                        iconCls: 'extIcon extClose',
                        handler: function () {
                            win.close();
                        }
                    }
                ]
            });
            win.show();
        };
        /**
         * 获得列绑定的枚举名称
         * @param column
         */
        Grid.getColumnEnumName = function (column) {
            if (FastExt.Grid.isEnumColumn(column)) {
                if (Ext.isObject(column.field)) {
                    return column.field.enumName;
                }
            }
            return null;
        };
        /**
         * 获取列编辑框的type类型
         * @param column
         */
        Grid.getColumnFieldType = function (column) {
            if (Ext.isObject(column.field)) {
                return column.field.xtype;
            }
            return column.field;
        };
        /**
         * 导出grid数据
         */
        Grid.exportGrid = function (grid) {
            if (!grid.getStore().entity) {
                Ext.Msg.alert('系统提醒', '导出失败！Grid的DataStore未绑定Entity!');
                return;
            }
            var message = "您确定导出当前条件下的所有数据吗？";
            var data = grid.getSelection();
            if (data.length > 0) {
                message = "您确定导出选中的" + data.length + "条数据吗？";
            }
            Ext.Msg.confirm("系统提醒", message, function (button, text) {
                if (button === "yes") {
                    var storeParams = grid.getStore().proxy.extraParams;
                    var params_2 = {};
                    if (grid.getStore().entity.menu) {
                        params_2.title = grid.getStore().entity.menu.text;
                    }
                    if (data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            var record = data[i];
                            for (var j = 0; j < grid.getStore().entity.idProperty.length; j++) {
                                var idName = grid.getStore().entity.idProperty[j];
                                var key = "where['" + idName + "#']";
                                if (!params_2[key]) {
                                    params_2[key] = [];
                                }
                                params_2[key].push(record.get(idName));
                            }
                        }
                    }
                    Ext.each(grid.getColumns(), function (item, index) {
                        if (item.isHidden()) {
                            return;
                        }
                        //排除文件类
                        if (!Ext.isEmpty(item.dataIndex)) {
                            params_2["column[" + index + "].width"] = item.width;
                            params_2["column[" + index + "].text"] = item.configText;
                            params_2["column[" + index + "].groupHeaderText"] = item.groupHeaderText;
                            params_2["column[" + index + "].enum"] = FastExt.Grid.getColumnEnumName(item);
                            params_2["column[" + index + "].dataIndex"] = item.dataIndex;
                            params_2["column[" + index + "].file"] = FastExt.Grid.isFileColumn(item);
                            params_2["column[" + index + "].files"] = FastExt.Grid.isFilesColumn(item);
                        }
                    });
                    FastExt.Dialog.showWait("正在导出中……");
                    FastExt.Server.exportExcel(FastExt.Json.mergeJson(params_2, storeParams), function (success, data, message) {
                        FastExt.Dialog.hideWait();
                        if (success) {
                            FastExt.Dialog.toast(message);
                            location.href = "attach/" + data;
                        }
                        else {
                            Ext.Msg.alert('系统提醒', "导出失败！" + message);
                        }
                    });
                }
            });
        };
        /**
         * 保存Grid的列表配置
         * @param grid
         * @return Ext.Promise
         */
        Grid.saveGridColumn = function (grid) {
            if (Ext.isEmpty(grid.code)) {
                return;
            }
            return new Ext.Promise(function (resolve, reject) {
                try {
                    var columnInfos_1 = {};
                    Ext.each(grid.getColumns(), function (item, index) {
                        if (!Ext.isEmpty(item.dataIndex)) {
                            if (!FastExt.System.isSuperRole()) {
                                if (!item.hideable && item.hidden) {
                                    //没有权限的列或者不需要显示的列
                                    return;
                                }
                            }
                            var columnInfo = { column: true };
                            columnInfo["width"] = item.width;
                            columnInfo["hidden"] = item.isHidden();
                            columnInfo["locked"] = item.isLocked();
                            columnInfo["text"] = item.configText;
                            columnInfo["dataIndex"] = item.dataIndex;
                            columnInfo["groupHeaderText"] = item.groupHeaderText;
                            if (grid.getStore().entity) {
                                columnInfo["entityCode"] = grid.getStore().entityCode;
                            }
                            var sortConfig = grid.getStore().getSorters().getByKey(item.dataIndex);
                            if (sortConfig) {
                                columnInfo["sortDirection"] = sortConfig.getDirection();
                            }
                            columnInfo["searchLink"] = item.searchLink;
                            columnInfo["index"] = item.getIndex();
                            var rendererStr = item.renderer.toString();
                            rendererStr = "function " + rendererStr.substring(rendererStr.indexOf("("));
                            columnInfo["renderer"] = rendererStr;
                            columnInfo["rendererFunction"] = item.rendererFunction;
                            columnInfos_1[item.code] = columnInfo;
                        }
                    });
                    var pageTool = {
                        pageSize: grid.getStore().pageSize,
                        column: false
                    };
                    columnInfos_1["PageTool"] = pageTool;
                    var params = {};
                    if (grid.getStore().entity && grid.getStore().entity.menu) {
                        params["menuId"] = grid.getStore().entity.menu.id;
                        if (FastExt.Base.toBool(grid.tabPanelList, false)) { //左侧主菜单
                            params["entityCode"] = grid.getStore().entity.entityCode;
                        }
                    }
                    FastExt.Server.saveExtConfig(grid.code, "GridColumn", Ext.encode(columnInfos_1), function (success, message) {
                        resolve(success);
                    }, params);
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        /**
         * 还原Grid保存的列配置
         * @param grid
         */
        Grid.restoreGridColumn = function (grid) {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    if (Ext.isEmpty(grid.code)) {
                        reject("Grid编号[code]不可为空！");
                        return;
                    }
                    FastExt.Server.showExtConfig(grid.code, "GridColumn", function (success, value) {
                        var columnInfos = {};
                        if (success) {
                            columnInfos = Ext.decode(value);
                        }
                        var newColumns = [];
                        var newGroupColumns = {};
                        var sorts = [];
                        var configColumns = grid.getColumns();
                        for (var i = 0; i < configColumns.length; i++) {
                            var column = configColumns[i];
                            if (!Ext.isEmpty(column.dataIndex)) {
                                if (FastExt.Base.toBool(grid.power, true)) {
                                    if (!column.hideable && column.hidden) {
                                        //没有权限的列或者不需要显示的列
                                        continue;
                                    }
                                }
                                var newColumn = column.cloneConfig();
                                newColumn["groupHeaderText"] = column.groupHeaderText;
                                if (columnInfos.hasOwnProperty(column.code)) {
                                    var info = columnInfos[column.code];
                                    for (var key in info) {
                                        if (key === "renderer" || key === "rendererFunction") {
                                            continue;
                                        }
                                        newColumn[key] = info[key];
                                    }
                                }
                                if (newColumn["sortDirection"]) {
                                    sorts.push({
                                        property: newColumn.dataIndex,
                                        direction: newColumn.sortDirection
                                    });
                                }
                                if (!Ext.isEmpty(newColumn["groupHeaderText"])) {
                                    var groupHeaderText = newColumn["groupHeaderText"];
                                    if (!newGroupColumns.hasOwnProperty(groupHeaderText)) {
                                        newGroupColumns[groupHeaderText] = [];
                                    }
                                    newGroupColumns[groupHeaderText].push(newColumns.length);
                                }
                                newColumns.push(newColumn);
                            }
                        }
                        var waitRemove = [];
                        for (var key in newGroupColumns) {
                            var indexArray = newGroupColumns[key];
                            if (indexArray.length < 2) {
                                continue;
                            }
                            var minIndex = 999999;
                            var columns = [];
                            for (var i = 0; i < indexArray.length; i++) {
                                var indexValue = indexArray[i];
                                minIndex = Math.min(minIndex, indexValue);
                                var columnInfo = newColumns[indexValue];
                                columns.push(columnInfo);
                            }
                            columns.sort(function (a, b) {
                                return a.index - b.index;
                            });
                            newColumns[minIndex] = {
                                index: minIndex,
                                text: key,
                                menuDisabled: true,
                                columns: columns
                            };
                            waitRemove = waitRemove.concat(columns);
                        }
                        for (var i = 0; i < waitRemove.length; i++) {
                            newColumns = Ext.Array.remove(newColumns, waitRemove[i]);
                        }
                        newColumns.sort(function (a, b) {
                            return a.index - b.index;
                        });
                        if (columnInfos.hasOwnProperty("PageTool")) {
                            var pageTool = columnInfos["PageTool"];
                            grid.getStore().pageSize = pageTool.pageSize;
                            var comboPage = grid.down("combo[pageTool=true]");
                            if (comboPage) {
                                comboPage.setValue(pageTool.pageSize);
                            }
                        }
                        grid.getStore().sort(sorts);
                        grid.reconfigure(newColumns);
                        resolve();
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        /**
         * 还原Grid保存的Operate配置
         * @param grid
         * @return new Ext.Promise
         * @see {@link FastExt.GridOperate}
         */
        Grid.restoreGridOperate = function (grid) {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    if (Ext.isEmpty(grid.code)) {
                        reject("Grid编号[code]不可为空！");
                        return;
                    }
                    FastExt.Server.showExtConfig(grid.code, "GridOperate", function (success, value) {
                        if (success) {
                            grid.operate = Ext.decode(value);
                        }
                        else if (Ext.isEmpty(grid.operate)) {
                            grid.operate = new GridOperate();
                        }
                        resolve();
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        /**
         * 获取列所在的Grid对象
         * @param column
         */
        Grid.getColumnGrid = function (column) {
            if (!column.grid) {
                column.grid = column.up("treepanel,grid");
            }
            if (column.grid.ownerGrid) {
                return column.grid.ownerGrid;
            }
            return null;
        };
        /**
         * 计算列并显示结果
         * @param grid gri的对象
         * @param column 列对象
         * @param type 计算方式
         * @see FastEnum.ComputeType
         */
        Grid.showColumnCompute = function (grid, column, type) {
            try {
                if (!column) {
                    Ext.Msg.alert('系统提醒', '计算失败!计算列无效！');
                    return;
                }
                if (!grid.getStore().entity) {
                    Ext.Msg.alert('系统提醒', '计算失败！Grid的DataStore未绑定Entity!');
                    return;
                }
                var selection = grid.getSelection();
                if (selection.length > 0) {
                    var value = null;
                    var title = "";
                    for (var i = 0; i < selection.length; i++) {
                        var record = selection[i];
                        var columnValue = parseFloat(record.get(column.dataIndex));
                        if (type === 'sum') {
                            title = column.configText + "总和：";
                            if (!value) {
                                value = 0;
                            }
                            value += columnValue;
                        }
                        else if (type === 'avg') {
                            title = column.configText + "平均值：";
                            if (!value) {
                                value = 0;
                            }
                            value += columnValue;
                        }
                        else if (type === 'min') {
                            title = column.configText + "最小值：";
                            if (!value) {
                                value = columnValue;
                            }
                            value = Math.min(columnValue, value);
                        }
                        else if (type === 'max') {
                            title = column.configText + "最大值：";
                            if (!value) {
                                value = columnValue;
                            }
                            value = Math.max(columnValue, value);
                        }
                    }
                    if (type === 'avg') {
                        value = value / selection.length;
                    }
                    try {
                        if (Ext.isFunction(column.renderer)) {
                            Ext.Msg.alert('系统提醒', "当前选中的数据，" + title + column.renderer(value));
                        }
                        else {
                            Ext.Msg.alert('系统提醒', "当前选中的数据，" + title + value);
                        }
                    }
                    catch (e) {
                        Ext.Msg.alert('系统提醒', "当前选中的数据，" + title + value);
                    }
                    return;
                }
                var storeParams = grid.getStore().proxy.extraParams;
                var params = {
                    "entityCode": grid.getStore().entity.entityCode,
                    "field": column.dataIndex,
                    "type": type
                };
                FastExt.Dialog.showWait("正在计算中……");
                $.post("entity/compute", FastExt.Json.mergeJson(params, storeParams), function (result) {
                    FastExt.Dialog.hideWait();
                    var msg = "";
                    if (type === 'sum') {
                        msg = column.configText + "总和：";
                    }
                    else if (type === 'avg') {
                        msg = column.configText + "平均值：";
                    }
                    else if (type === 'min') {
                        msg = column.configText + "最小值：";
                    }
                    else if (type === 'max') {
                        msg = column.configText + "最大值：";
                    }
                    try {
                        if (Ext.isFunction(column.renderer)) {
                            Ext.Msg.alert('系统提醒', msg + column.renderer(result.data));
                        }
                        else {
                            Ext.Msg.alert('系统提醒', msg + result.data);
                        }
                    }
                    catch (e) {
                        Ext.Msg.alert('系统提醒', msg + result.data);
                    }
                });
            }
            catch (e) {
                console.error(e);
            }
        };
        /**
         * 获取列的编辑控件
         * @param column 列对象
         * @param search 列的搜索对象json
         */
        Grid.getColumnSimpleEditor = function (column, search) {
            try {
                var editor = {};
                if (Ext.isObject(column.field)) {
                    editor.xtype = column.field.xtype;
                }
                else {
                    editor.xtype = column.field;
                }
                if (Ext.isObject(column.config.field)) {
                    if (search) {
                        editor = FastExt.Base.copy(column.config.field);
                    }
                    else {
                        editor = column.config.field;
                    }
                }
                if (search) {
                    if (FastExt.Form.isContentField(column.field)
                        || FastExt.Form.isHtmlContentField(column.field)
                        || FastExt.Form.isTargetField(column.field)
                        || FastExt.Form.isPCAField(column.field)) {
                        editor.xtype = "textfield";
                    }
                }
                if (Ext.isEmpty(editor.xtype)) {
                    editor.xtype = "textfield";
                }
                editor.dataIndex = column.dataIndex;
                editor.columnSearchField = true;
                return editor;
            }
            catch (e) {
                console.error(e);
            }
            return null;
        };
        /**
         * 弹出批量编辑列数的菜单
         * @param column
         */
        Grid.showBatchEditColumn = function (column) {
            var editorField = column.batchField;
            if (!editorField) {
                editorField = FastExt.Grid.getColumnSimpleEditor(column);
                if (!editorField)
                    return;
                editorField.flex = 1;
                editorField.emptyText = "请输入";
                editorField = column.batchField = Ext.create(editorField);
            }
            var putRecord = function (fieldObj) {
                if (!Ext.isEmpty(fieldObj.getValue())) {
                    if (!FastExt.Grid.getColumnGrid(column).getStore()) {
                        return;
                    }
                    FastExt.Grid.getColumnGrid(column).getStore().holdUpdate = true;
                    var selectData = FastExt.Grid.getColumnGrid(column).getSelectionModel().getSelection();
                    if (selectData.length > 0) {
                        Ext.each(selectData, function (record, index) {
                            FastExt.Store.setRecordValue(record, column.dataIndex, fieldObj);
                        });
                    }
                    else {
                        FastExt.Grid.getColumnGrid(column).getStore().each(function (record, index) {
                            FastExt.Store.setRecordValue(record, column.dataIndex, fieldObj);
                        });
                    }
                    FastExt.Grid.getColumnGrid(column).getStore().holdUpdate = false;
                    FastExt.Grid.getColumnGrid(column).getStore().fireEvent("endupdate");
                }
            };
            var placeholder = "批量修改当前页的【" + column.text + "】数据";
            if (FastExt.Grid.getColumnGrid(column).getSelection().length > 0) {
                placeholder = "批量修改选择的" + FastExt.Grid.getColumnGrid(column).getSelection().length + "条【" + column.text + "】数据";
            }
            if (Ext.isFunction(editorField.setEmptyText)) {
                editorField.setEmptyText(placeholder);
            }
            if (Ext.isFunction(editorField.showWindow)) {
                editorField.showWindow(column, function (result) {
                    putRecord(result);
                }, placeholder);
                return;
            }
            if (!column.batchEditMenu) {
                column.batchEditMenu = Ext.create('Ext.menu.Menu', {
                    showSeparator: false,
                    layout: 'fit',
                    doUpdate: function () {
                        var btn = this.down("button[name='confirm']");
                        btn.setText("稍等");
                        btn.setDisabled(true);
                        var me = this;
                        new Ext.Promise(function (resolve, reject) {
                            var fieldObj = me.items.get(0).items.get(0);
                            putRecord(fieldObj);
                            fieldObj.setValue(null);
                            resolve();
                        }).then(function () {
                            btn.setText("确定");
                            btn.setDisabled(false);
                            me.hide();
                        });
                    },
                    items: [
                        {
                            xtype: 'panel',
                            layout: 'hbox',
                            style: {
                                background: "#ffffff",
                                borderWidth: 1,
                                borderColor: "#ffffff",
                                color: '#eeeee'
                            },
                            border: 0,
                            items: [editorField,
                                {
                                    xtype: 'button',
                                    text: '确定',
                                    name: 'confirm',
                                    width: 60,
                                    margin: '0 0 0 2',
                                    handler: function () {
                                        column.batchEditMenu.doUpdate();
                                    }
                                }
                            ]
                        }
                    ],
                    listeners: {
                        show: function (obj, epts) {
                            var fieldObj = obj.items.get(0).items.get(0);
                            fieldObj.focus();
                        },
                        beforehide: function (obj, epts) {
                            var fieldObj = obj.items.get(0).items.get(0);
                            if (!fieldObj.isValid()) {
                                FastExt.Component.shakeComment(obj);
                                FastExt.Dialog.toast(fieldObj.getErrors()[0]);
                            }
                            return fieldObj.isValid();
                        }
                    }
                });
            }
            column.batchEditMenu.setWidth(column.getWidth());
            column.batchEditMenu.showBy(column, "tl");
        };
        /**
         * 弹出批量随机列值窗体
         * @param column
         */
        Grid.showBatchEditColumnRandom = function (column) {
            //检查是否有自定义随机生成数据的插件方法
            if (Ext.isFunction(window["showRandomData"])) {
                window["showRandomData"](column);
                return;
            }
            var idCode = "Random" + Ext.now();
            var autoType = 1;
            var selectReadOnly = false;
            var defaultValue;
            var dateFormat = 'Y-m-d H:i:s';
            var dataLength = FastExt.Grid.getColumnGrid(column).getStore().getTotalCount();
            var title = "批量随机生成当前页的【" + column.text + "】列数据";
            if (FastExt.Grid.getColumnGrid(column).getSelection().length > 0) {
                title = "批量随机生成选择的" + FastExt.Grid.getColumnGrid(column).getSelection().length + "条【" + column.text + "】列数据";
                dataLength = FastExt.Grid.getColumnGrid(column).getSelection().length;
            }
            if (FastExt.Grid.isNumberColumn(column)) {
                autoType = 2;
                selectReadOnly = true;
            }
            else if (FastExt.Grid.isDateColumn(column)) {
                autoType = 3;
                if (Ext.isObject(column.field)) {
                    dateFormat = column.field.format;
                }
                selectReadOnly = true;
            }
            else if (FastExt.Grid.isEnumColumn(column) || FastExt.Grid.isComboColumn(column)) {
                autoType = 5;
                selectReadOnly = true;
                var intArray_1 = [];
                var fieldObj_1 = Ext.create(column.field);
                fieldObj_1.getStore().each(function (record, index) {
                    intArray_1.push(record.get(fieldObj_1.valueField));
                });
                defaultValue = intArray_1.join(",");
            }
            else if (FastExt.Grid.isContentColumn(column)) {
                autoType = 4;
            }
            var textField = {
                xtype: 'fieldcontainer',
                layout: 'column',
                columnWidth: 1,
                id: idCode + "_1",
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                random: function () {
                    var valueArray = [];
                    var textPrefix = Ext.getCmp(idCode + "_textPrefix").getValue();
                    var textStartNumber = Ext.getCmp(idCode + "_textStartNumber").getValue();
                    for (var i = parseInt(textStartNumber); i < Number.MAX_VALUE; i++) {
                        valueArray.push(textPrefix + i);
                        if (valueArray.length === dataLength) {
                            break;
                        }
                    }
                    return valueArray;
                },
                items: [
                    {
                        xtype: 'fieldset',
                        columnWidth: 1,
                        layout: 'column',
                        defaults: {
                            labelWidth: 60,
                            margin: '5 5 5 5',
                            labelAlign: 'right',
                            columnWidth: 1,
                            emptyText: '请填写'
                        },
                        title: '文字设置',
                        items: [
                            {
                                fieldLabel: '文字前缀',
                                id: idCode + '_textPrefix',
                                allowBlank: false,
                                xtype: 'textfield',
                            },
                            {
                                fieldLabel: '开始序数',
                                id: idCode + '_textStartNumber',
                                value: 1,
                                allowBlank: false,
                                xtype: 'numberfield',
                            }
                        ]
                    }
                ]
            };
            var numberField = {
                xtype: 'fieldcontainer',
                layout: 'column',
                columnWidth: 1,
                id: idCode + "_2",
                hidden: true,
                disabled: true,
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                random: function () {
                    var valueArray = [];
                    var dotNumber = Ext.getCmp(idCode + "_dotNumber").getValue();
                    var minNumber = Ext.getCmp(idCode + "_minNumber").getValue();
                    var maxNumber = Ext.getCmp(idCode + "_maxNumber").getValue();
                    if (minNumber > maxNumber) {
                        FastExt.Dialog.showAlert("系统提醒", "最大数字必须大于最小数字！");
                        return;
                    }
                    for (var i = 0; i < Number.MAX_VALUE; i++) {
                        var numberValue = Math.random() * (maxNumber - minNumber) + minNumber;
                        valueArray.push(numberValue.toFixed(dotNumber));
                        if (valueArray.length === dataLength) {
                            break;
                        }
                    }
                    return valueArray;
                },
                items: [
                    {
                        xtype: 'fieldset',
                        columnWidth: 1,
                        layout: 'column',
                        defaults: {
                            labelWidth: 60,
                            margin: '5 5 5 5',
                            labelAlign: 'right',
                            columnWidth: 1,
                            emptyText: '请填写'
                        },
                        title: '数字设置',
                        items: [
                            {
                                fieldLabel: '保留位数',
                                id: idCode + '_dotNumber',
                                value: 0,
                                allowBlank: false,
                                xtype: 'numberfield',
                            },
                            {
                                fieldLabel: '最小数字',
                                id: idCode + '_minNumber',
                                value: 0,
                                allowBlank: false,
                                xtype: 'numberfield',
                            },
                            {
                                fieldLabel: '最大数字',
                                id: idCode + '_maxNumber',
                                allowBlank: false,
                                xtype: 'numberfield',
                            }
                        ]
                    }
                ]
            };
            var dateField = {
                xtype: 'fieldcontainer',
                layout: 'column',
                columnWidth: 1,
                id: idCode + "_3",
                hidden: true,
                disabled: true,
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                random: function () {
                    var valueArray = [];
                    var minDate = Ext.getCmp(idCode + "_minDate").getValue();
                    var maxDate = Ext.getCmp(idCode + "_maxDate").getValue();
                    if (minDate.getTime() > maxDate.getTime()) {
                        FastExt.Dialog.showAlert("系统提醒", "最大日期必须大于最小日期！");
                        return;
                    }
                    for (var i = 0; i < Number.MAX_VALUE; i++) {
                        var sub = maxDate.getTime() - minDate.getTime();
                        var numberValue = Math.random() * sub + minDate.getTime();
                        var randDate = new Date(numberValue);
                        valueArray.push(Ext.Date.format(randDate, Ext.getCmp(idCode + "_minDate").format));
                        if (valueArray.length === dataLength) {
                            break;
                        }
                    }
                    return valueArray;
                },
                items: [
                    {
                        xtype: 'fieldset',
                        columnWidth: 1,
                        layout: 'column',
                        defaults: {
                            labelWidth: 60,
                            margin: '5 5 5 5',
                            labelAlign: 'right',
                            columnWidth: 1,
                            emptyText: '请填写'
                        },
                        title: '日期设置',
                        items: [
                            {
                                fieldLabel: '最小日期',
                                xtype: 'datefield',
                                id: idCode + '_minDate',
                                allowBlank: false,
                                format: dateFormat
                            },
                            {
                                fieldLabel: '最大日期',
                                xtype: 'datefield',
                                id: idCode + '_maxDate',
                                allowBlank: false,
                                format: dateFormat
                            }
                        ]
                    }
                ]
            };
            var longTextField = {
                xtype: 'fieldcontainer',
                layout: 'column',
                columnWidth: 1,
                id: idCode + "_4",
                hidden: true,
                disabled: true,
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                random: function () {
                    var valueArray = [];
                    var minNumber = Ext.getCmp(idCode + "_minLength").getValue();
                    var maxNumber = Ext.getCmp(idCode + "_maxLength").getValue();
                    var longTextList = Ext.getCmp(idCode + "_longTextList").getValue();
                    if (minNumber > maxNumber) {
                        FastExt.Dialog.showAlert("系统提醒", "最大长度必须大于最小长度！");
                        return;
                    }
                    var charArray = longTextList.toString().trimAllSymbol().split("");
                    for (var i = 0; i < Number.MAX_VALUE; i++) {
                        var numberValue = FastExt.Base.randomInt(minNumber, maxNumber);
                        var stringArray = [];
                        for (var j = 0; j < Number.MAX_VALUE; j++) {
                            var indexValue = FastExt.Base.randomInt(0, charArray.length - 1);
                            var charStr = charArray[indexValue];
                            stringArray.push(charStr);
                            if (stringArray.length === numberValue) {
                                break;
                            }
                        }
                        valueArray.push(stringArray.join(""));
                        if (valueArray.length === dataLength) {
                            break;
                        }
                    }
                    return valueArray;
                },
                items: [
                    {
                        xtype: 'fieldset',
                        columnWidth: 1,
                        layout: 'column',
                        defaults: {
                            labelWidth: 60,
                            margin: '5 5 5 5',
                            labelAlign: 'right',
                            columnWidth: 1,
                            emptyText: '请填写'
                        },
                        title: '文字设置',
                        items: [
                            {
                                fieldLabel: '文字库',
                                id: idCode + '_longTextList',
                                allowBlank: false,
                                xtype: 'textfield',
                                listeners: {
                                    change: function (obj, newValue, oldValue, eOpts) {
                                        Ext.getCmp(idCode + "_maxLength").setValue(newValue.truthLength());
                                    }
                                }
                            },
                            {
                                fieldLabel: '最小长度',
                                id: idCode + '_minLength',
                                value: 1,
                                minValue: 1,
                                allowBlank: false,
                                xtype: 'numberfield',
                            },
                            {
                                fieldLabel: '最大长度',
                                id: idCode + '_maxLength',
                                allowBlank: false,
                                minValue: 1,
                                xtype: 'numberfield',
                            }
                        ]
                    }
                ]
            };
            var numberArrayField = {
                xtype: 'fieldcontainer',
                layout: 'column',
                columnWidth: 1,
                id: idCode + "_5",
                hidden: true,
                disabled: true,
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                random: function () {
                    var valueArray = [];
                    var numberList = Ext.getCmp(idCode + "_numberList").getValue();
                    var charArray = numberList.toString().split(",");
                    for (var i = 0; i < Number.MAX_VALUE; i++) {
                        var value = charArray[FastExt.Base.randomInt(0, charArray.length - 1)];
                        if (Ext.isEmpty(value)) {
                            continue;
                        }
                        valueArray.push(value);
                        if (valueArray.length === dataLength) {
                            break;
                        }
                    }
                    return valueArray;
                },
                items: [
                    {
                        xtype: 'fieldset',
                        columnWidth: 1,
                        layout: 'column',
                        defaults: {
                            labelWidth: 60,
                            margin: '5 5 5 5',
                            labelAlign: 'right',
                            columnWidth: 1,
                            emptyText: '请填写'
                        },
                        title: '数字集合设置',
                        items: [
                            {
                                fieldLabel: '数字集合',
                                id: idCode + '_numberList',
                                allowBlank: false,
                                value: defaultValue,
                                xtype: 'textfield'
                            },
                            {
                                xtype: 'displayfield',
                                value: '以英文逗号（,）为分隔符！'
                            }
                        ]
                    }
                ]
            };
            var setPanel = Ext.create('Ext.form.Panel', {
                bodyPadding: 5,
                region: 'center',
                autoScroll: true,
                layout: "column",
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                items: [
                    {
                        xtype: "combo",
                        name: 'autoType',
                        fieldLabel: '随机类型',
                        editable: false,
                        displayField: "text",
                        valueField: "id",
                        value: 1,
                        listeners: {
                            change: function (obj, newValue, oldValue, eOpts) {
                                Ext.getCmp(idCode + "_" + oldValue).setHidden(true);
                                Ext.getCmp(idCode + "_" + oldValue).setDisabled(true);
                                Ext.getCmp(idCode + "_" + newValue).setHidden(false);
                                Ext.getCmp(idCode + "_" + newValue).setDisabled(false);
                            }
                        },
                        store: Ext.create('Ext.data.Store', {
                            fields: ["id", "text"],
                            data: [
                                {
                                    'text': '文本',
                                    "id": 1
                                },
                                {
                                    'text': '长文本',
                                    "id": 4
                                },
                                {
                                    'text': '数字',
                                    "id": 2
                                },
                                {
                                    'text': '数字集合',
                                    "id": 5
                                },
                                {
                                    'text': '日期',
                                    "id": 3
                                }
                            ]
                        })
                    }, textField, numberField, dateField, longTextField, numberArrayField
                ]
            });
            var setColumnValue = function (valueArray) {
                if (valueArray.length === 0 || !(FastExt.Grid.getColumnGrid(column).getStore()))
                    return;
                FastExt.Grid.getColumnGrid(column).getStore().holdUpdate = true;
                var selectData = FastExt.Grid.getColumnGrid(column).getSelectionModel().getSelection();
                if (selectData.length > 0) {
                    Ext.each(selectData, function (record, index) {
                        if (Ext.isObject(valueArray[index])) {
                            FastExt.Store.setRecordValue(record, column.dataIndex, valueArray[index]);
                        }
                        else {
                            record.set(column.dataIndex, valueArray[index]);
                        }
                    });
                }
                else {
                    FastExt.Grid.getColumnGrid(column).getStore().each(function (record, index) {
                        if (Ext.isObject(valueArray[index])) {
                            FastExt.Store.setRecordValue(record, column.dataIndex, valueArray[index]);
                        }
                        else {
                            record.set(column.dataIndex, valueArray[index]);
                        }
                    });
                }
                FastExt.Grid.getColumnGrid(column).getStore().holdUpdate = false;
                FastExt.Grid.getColumnGrid(column).getStore().fireEvent("endupdate");
            };
            var win = Ext.create('Ext.window.Window', {
                title: title,
                height: 360,
                iconCls: 'extIcon extRandom',
                width: 450,
                layout: 'border',
                items: [setPanel],
                modal: true,
                constrain: true,
                listeners: {
                    show: function () {
                        var autoTypeField = setPanel.getField("autoType");
                        autoTypeField.setValue(autoType);
                        autoTypeField.setReadOnly(selectReadOnly);
                    }
                },
                buttons: [
                    "->",
                    {
                        text: '取消',
                        iconCls: 'extIcon extClose',
                        handler: function () {
                            win.close();
                        }
                    },
                    {
                        text: '立即生成',
                        iconCls: 'extIcon extOk whiteColor',
                        handler: function () {
                            var form = setPanel.getForm();
                            if (form.isValid()) {
                                var buildType = setPanel.getFieldValue("autoType");
                                var valueArray = Ext.getCmp(idCode + "_" + buildType).random();
                                if (!valueArray || valueArray.length === 0) {
                                    return;
                                }
                                setColumnValue(valueArray);
                                win.close();
                            }
                        }
                    }
                ]
            });
            win.show();
        };
        /**
         * 配置指定列的搜索链
         * @param column
         */
        Grid.configColumnSearchLink = function (column) {
            var checked = "";
            if (column.searchLink) {
                checked = column.searchLink.checked;
            }
            FastExt.System.showMenuColumns(column, checked).then(function (data) {
                if (data.columns.length > 0) {
                    column.searchLink = data;
                    FastExt.Dialog.toast("配置成功！");
                }
                else {
                    column.searchLink = null;
                    FastExt.Dialog.toast("已清空搜索链！");
                }
            });
        };
        /**
         * 刷新列的状态样式，例如：正序、倒序、搜索等
         * @param column
         */
        Grid.refreshColumnStyle = function (column) {
            try {
                if (!Ext.isEmpty(column.dataIndex)) {
                    var sortDirection = column.sortDirection;
                    if (Ext.isEmpty(sortDirection)) {
                        sortDirection = "<font size='1'></font>";
                    }
                    else {
                        if (sortDirection === "ASC") {
                            sortDirection = "<font color='red' size='1'>&nbsp;&nbsp;[正序]</font>";
                        }
                        else {
                            sortDirection = "<font color='red' size='1'>&nbsp;&nbsp;[倒序]</font>";
                        }
                    }
                    if (Ext.isEmpty(column.sumText)) {
                        column.sumText = "<font size='1'></font>";
                    }
                    if (column.searching) {
                        column.setText(FastExt.Base.getSVGIcon("extSearch") + "&nbsp;" + column.configText + column.sumText + sortDirection + "&nbsp;");
                        column.setStyle('color', 'red');
                    }
                    else {
                        column.setText("&nbsp;" + column.configText + column.sumText + sortDirection + "&nbsp;");
                        column.setStyle('color', '#444444');
                    }
                    FastExt.Grid.checkColumnSort(FastExt.Grid.getColumnGrid(column));
                }
            }
            catch (e) {
                console.error(e);
            }
        };
        /**
         * 检查列的排序，将刷新Grid底部搜索按钮的样式
         * @param grid
         */
        Grid.checkColumnSort = function (grid) {
            try {
                var hasSort = grid.getStore().getSorters().length > 0;
                var pagingToolBar = grid.child('#pagingToolBar');
                if (pagingToolBar) {
                    var sortBtn = pagingToolBar.down("button[toolType=sortBtn]");
                    if (hasSort) {
                        sortBtn.setIconCls("extIcon extSort redColor");
                    }
                    else {
                        sortBtn.setIconCls("extIcon extSort grayColor");
                    }
                }
            }
            catch (e) {
                console.error(e);
            }
        };
        /**
         * 配置列的扩展属性或方法
         * @param column
         */
        Grid.configColumnProperty = function (column) {
            try {
                column.configText = column.text;
                column.toSearchKey = function (where, i) {
                    return "where['" + this.getIndex() + i + this.dataIndex + where.compare + "']";
                };
                column.searchValue = function (value) {
                    var me = this;
                    if (!me.where) {
                        me.where = [];
                    }
                    var where = {
                        compare: '=',
                        value: value
                    };
                    me.where.push(where);
                    me.doSearch();
                };
                column.clearSearch = function () {
                    var me = this;
                    var storeParams = FastExt.Grid.getColumnGrid(me).getStore().proxy.extraParams;
                    if (me.where) {
                        for (var i = 0; i < me.where.length; i++) {
                            var key = me.toSearchKey(me.where[i], i);
                            if (storeParams.hasOwnProperty(key)) {
                                delete storeParams[key]; //删除搜索记录
                            }
                        }
                    }
                    me.where = [];
                    me.searchMenu = null;
                    me.searching = false;
                    FastExt.Grid.refreshColumnStyle(me);
                };
                column.doSearch = function (requestServer) {
                    var me = this;
                    var storeParams = FastExt.Grid.getColumnGrid(me).getStore().proxy.extraParams;
                    if (me.where) {
                        for (var i = 0; i < me.where.length; i++) {
                            var w = me.where[i];
                            var key = me.toSearchKey(w, i);
                            var value = w.value;
                            if (w.compare.indexOf('?') >= 0) {
                                value = '%' + w.value + '%';
                            }
                            storeParams[key] = value;
                        }
                        if (FastExt.Base.toBool(requestServer, true)) {
                            FastExt.Grid.getColumnGrid(me).getStore().loadPage(1);
                        }
                        me.searching = me.where.length !== 0;
                        FastExt.Grid.refreshColumnStyle(me);
                    }
                };
                if (column.where && column.where.length > 0) {
                    column.doSearch(false);
                }
                if (column.isSubHeader) {
                    column.groupHeaderText = column.ownerCt.text;
                }
                else {
                    column.groupHeaderText = null;
                }
            }
            catch (e) {
                console.error(e);
            }
        };
        /**
         * 获取搜索列的输入组件
         * @param column
         * @param where
         */
        Grid.buildSearchItem = function (column, where) {
            try {
                var editorField = FastExt.Grid.getColumnSimpleEditor(column, true);
                if (!editorField) {
                    return;
                }
                editorField.flex = 1;
                editorField.margin = '2 2 0 0';
                editorField.repeatTriggerClick = false;
                editorField.onClearValue = function () {
                    if (Ext.isFunction(this.ownerCt.removeSearch)) {
                        this.ownerCt.removeSearch();
                        return;
                    }
                    this.ownerCt.destroy();
                };
                editorField.triggers = {
                    close: {
                        cls: 'text-clear',
                        handler: function () {
                            this.onClearValue();
                        }
                    }
                };
                if (FastExt.Form.isEnumField(editorField)) {
                    editorField.editable = false;
                }
                else {
                    editorField.editable = true;
                }
                editorField.emptyText = "请输入条件值";
                // 此处是移除默认的trigger
                // editorField.listeners = {
                //     afterrender: function (obj, eOpts) {
                //         if (Ext.isFunction(obj.getTrigger)) {
                //             if (obj.getTrigger('picker')) {
                //                 obj.getTrigger('picker').hide();
                //             }
                //             if (obj.getTrigger('spinner')) {
                //                 obj.getTrigger('spinner').hide();
                //             }
                //         }
                //     }
                // };
                // if (isDateField(editorField)) {
                //     editorField.editable = false;
                // }
                if (!where) {
                    where = {
                        compare: '=',
                        value: ''
                    };
                    if (FastExt.Form.isTextField(editorField)) {
                        where.compare = '?';
                    }
                    else if (FastExt.Form.isDateField(editorField)) {
                        where.compare = '>';
                    }
                }
                editorField.value = where.value;
                editorField.submitValue = false;
                editorField.name = "value";
                var panel = {
                    xtype: 'panel',
                    margin: '0',
                    searchItem: true,
                    border: 0,
                    flex: 1,
                    region: 'center',
                    layout: 'hbox',
                    toParam: function () {
                        var params = {};
                        this.items.each(function (item) {
                            if (Ext.isFunction(item.getValue)) {
                                if (item.isValid()) {
                                    if (Ext.isDate(item.getValue())) {
                                        params[item.getName()] = Ext.Date.format(item.getValue(), item.format);
                                    }
                                    else {
                                        params[item.getName()] = item.getValue();
                                    }
                                }
                                else {
                                    FastExt.Component.shakeComment(item);
                                    FastExt.Dialog.toast(item.getErrors()[0]);
                                    params = null;
                                    return false;
                                }
                            }
                        });
                        return params;
                    },
                    setParam: function (where) {
                        this.items.each(function (item) {
                            if (Ext.isFunction(item.getValue)) {
                                if (item.getName() === 'compare') {
                                    item.setValue(where.compare);
                                }
                                else {
                                    item.setValue(where.value);
                                }
                            }
                        });
                    },
                    items: [
                        {
                            xtype: 'combo',
                            name: 'compare',
                            value: where.compare,
                            margin: '2 2 0 2',
                            width: 35,
                            valueField: 'text',
                            editable: false,
                            hideTrigger: true,
                            tpl: Ext.create('Ext.XTemplate', '<ul class="x-list-plain"><tpl for=".">', '<li role="option" class="x-boundlist-item" style="font-size: 12px;">{desc}</li>', '</tpl></ul>'),
                            listeners: {
                                afterrender: function (obj, eOpts) {
                                    obj.getPicker().setMinWidth(100);
                                }
                            },
                            store: FastExt.Store.getCompareDataStore()
                        },
                        editorField
                    ]
                };
                return panel;
            }
            catch (e) {
                console.error(e);
            }
            return null;
        };
        /**
         * 弹出列的搜索菜单
         * @param column
         */
        Grid.showColumnSearchMenu = function (column) {
            try {
                if (!FastExt.Base.toBool(FastExt.Grid.getColumnGrid(column).columnSearch, true)) {
                    return false;
                }
                if (FastExt.Grid.isFilesColumn(column)
                    || FastExt.Grid.isFileColumn(column)) {
                    return false;
                }
                if (!FastExt.Base.toBool(column.search, true)) {
                    return false;
                }
                if (FastExt.Base.toBool(column["encrypt"], false)) {
                    return false;
                }
                if (!column.searchMenu) {
                    column.searchMenu = new Ext.menu.Menu({
                        padding: '0 0 0 0',
                        power: false,
                        showSeparator: false,
                        style: {
                            background: "#ffffff"
                        },
                        addSearchItem: function (where) {
                            var index = this.items.length - 1;
                            if (index >= 5) {
                                return;
                            }
                            this.insert(index, FastExt.Grid.buildSearchItem(column, where));
                        },
                        doSearch: function () {
                            var me = this;
                            var where = [];
                            me.items.each(function (item, index) {
                                if (item.searchItem) {
                                    var toParam = item.toParam();
                                    if (!toParam) {
                                        where = null;
                                        return false;
                                    }
                                    if (Ext.isEmpty(toParam.value)) {
                                        return;
                                    }
                                    toParam.index = index;
                                    where.push(toParam);
                                }
                            });
                            if (where) {
                                column.clearSearch();
                                column.where = where;
                                column.doSearch();
                                me.hide();
                            }
                        },
                        items: [
                            {
                                xtype: 'panel',
                                layout: 'hbox',
                                margin: '2',
                                border: 0,
                                items: [
                                    {
                                        xtype: 'button',
                                        text: '搜索',
                                        flex: 1,
                                        iconCls: 'extIcon extSearch',
                                        margin: '0 2 0 0',
                                        handler: function () {
                                            this.ownerCt.ownerCt.doSearch();
                                        }
                                    },
                                    {
                                        xtype: 'button',
                                        iconCls: 'extIcon extPlus fontSize14',
                                        width: 35,
                                        handler: function () {
                                            this.ownerCt.ownerCt.addSearchItem();
                                        }
                                    }
                                ]
                            }
                        ],
                        listeners: {
                            show: function (obj, epts) {
                                if (obj.items.length === 1) {
                                    obj.addSearchItem();
                                }
                                try {
                                    new Ext.util.KeyMap({
                                        target: obj.getEl(),
                                        key: 13,
                                        fn: function (keyCode, e) {
                                            obj.doSearch();
                                        },
                                        scope: obj
                                    });
                                }
                                catch (e) {
                                    console.error(e);
                                }
                            }
                        }
                    });
                }
                if (column.where) {
                    for (var i = 0; i < column.where.length; i++) {
                        var where = column.where[i];
                        if (Ext.isEmpty(where.index)) {
                            where.index = i;
                        }
                        if (where.index < column.searchMenu.items.length - 1) {
                            column.searchMenu.items.getAt(where.index).setParam(where);
                        }
                        else {
                            column.searchMenu.addSearchItem(where);
                        }
                    }
                }
                column.searchMenu.setWidth(Math.max(column.width, 200));
                column.searchMenu.showBy(column, "tl-bl?");
                return true;
            }
            catch (e) {
                console.error(e);
            }
            return false;
        };
        /**
         * 弹出列的搜索窗体
         * @param obj
         * @param grid
         */
        Grid.showColumnSearchWin = function (obj, grid) {
            if (!obj.searchWin) {
                var store_1 = FastExt.Store.getGridColumnStore(grid, true);
                var buildItem_1 = function (data, where) {
                    var inputItem = FastExt.Grid.buildSearchItem(FastExt.Grid.getColumn(grid, data.get("id"), data.get("text")), where);
                    inputItem.removeSearch = function () {
                        this.ownerCt.destroy();
                    };
                    return {
                        xtype: 'panel',
                        flex: 1,
                        columnWidth: 1,
                        layout: 'hbox',
                        margin: '0',
                        border: 0,
                        toParam: function () {
                            var param = {};
                            var combo = this.items.get(0);
                            var data = combo.getStore().findRecord("id", combo.getValue(), 0, false, false, true);
                            param["text"] = data.get("text");
                            param["dataIndex"] = data.get("id");
                            var inputItem = this.items.get(1);
                            param = FastExt.Json.mergeJson(param, inputItem.toParam());
                            return param;
                        },
                        items: [
                            {
                                xtype: 'combo',
                                region: 'west',
                                valueField: 'id',
                                displayField: 'text',
                                flex: 0.4,
                                margin: '2 0 0 2',
                                value: data.get("id"),
                                editable: false,
                                listeners: {
                                    change: function (obj, newValue, oldValue, eOpts) {
                                        var parent = this.up("panel");
                                        parent.remove(parent.items.get(1), true);
                                        var data = obj.getStore().findRecord("id", newValue, 0, false, false, true);
                                        var inputItem = FastExt.Grid.buildSearchItem(FastExt.Grid.getColumn(grid, data.get("id"), data.get("text")));
                                        inputItem.removeSearch = function () {
                                            this.ownerCt.destroy();
                                        };
                                        parent.insert(1, inputItem);
                                    }
                                },
                                store: store_1
                            },
                            inputItem
                        ]
                    };
                };
                var defaultItems = grid.searchItems;
                if (!defaultItems) {
                    defaultItems = [];
                }
                var formPanel_1 = Ext.create('Ext.form.FormPanel', {
                    margin: '5',
                    border: 0,
                    layout: 'column',
                    width: 400,
                    scrollable: true,
                    defaults: {
                        labelWidth: 80,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        emptyText: '请填写'
                    },
                    items: defaultItems,
                });
                Ext.each(grid.getColumns(), function (item) {
                    if (item.where) {
                        var data = store_1.findRecord("id", item.dataIndex, 0, false, false, true);
                        for (var i = 0; i < item.where.length; i++) {
                            formPanel_1.add(buildItem_1(data, item.where[i]));
                        }
                    }
                });
                if (formPanel_1.items.length === 0) {
                    formPanel_1.add(buildItem_1(store_1.getAt(0)));
                }
                obj.searchWin = Ext.create('Ext.window.Window', {
                    title: '搜索数据',
                    layout: 'fit',
                    constrain: true,
                    iconCls: 'extIcon extSearch',
                    resizable: true,
                    minHeight: 200,
                    minWidth: 400,
                    height: 200,
                    animateTarget: obj,
                    items: [formPanel_1],
                    listeners: {
                        close: function (panel, eOpts) {
                            obj.searchWin = null;
                        }
                    },
                    buttons: [
                        {
                            text: '清空条件',
                            iconCls: 'extIcon extClear whiteColor',
                            handler: function () {
                                formPanel_1.removeAll();
                                Ext.each(grid.getColumns(), function (item) {
                                    item.clearSearch();
                                });
                                grid.getStore().loadPage(1);
                            }
                        },
                        '->',
                        {
                            text: '添加条件',
                            iconCls: 'extIcon extPlus',
                            handler: function () {
                                formPanel_1.add(buildItem_1(store_1.getAt(0)));
                                var winHeight = 50 + formPanel_1.items.length * 35 + 55;
                                formPanel_1.scrollTo(0, winHeight, false);
                            }
                        },
                        {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                Ext.each(grid.getColumns(), function (item) {
                                    item.clearSearch();
                                });
                                var searchColumns = [];
                                formPanel_1.items.each(function (item) {
                                    if (!item.toParam) {
                                        var params = {};
                                        params["where['" + item.name + "']"] = item.getValue();
                                        Ext.apply(grid.getStore().proxy.extraParams, params);
                                        return;
                                    }
                                    var toParam = item.toParam();
                                    if (!toParam) {
                                        return;
                                    }
                                    if (Ext.isEmpty(toParam.value)) {
                                        return;
                                    }
                                    var column = FastExt.Grid.getColumn(grid, toParam.dataIndex, toParam.text);
                                    if (!column) {
                                        return false;
                                    }
                                    if (!column.where) {
                                        column.where = [];
                                    }
                                    delete toParam.dataIndex;
                                    delete toParam.text;
                                    column.where.push(toParam);
                                    searchColumns.push(column);
                                });
                                Ext.each(searchColumns, function (item) {
                                    item.doSearch(false);
                                });
                                grid.getStore().loadPage(1);
                            }
                        }
                    ]
                });
                grid.ownerCt.add(obj.searchWin);
            }
            obj.searchWin.show();
        };
        /**
         * 获取Grid的分页控件
         * @param dataStore
         */
        Grid.getPageToolBar = function (dataStore) {
            var entityRecycle = false;
            if (dataStore.entity && FastExt.Base.toBool(dataStore.entity.recycle, false)) {
                entityRecycle = true;
            }
            var fromRecycle = false;
            if (dataStore.where && FastExt.Base.toBool(dataStore.where['^fromRecycle'], false)) {
                fromRecycle = true;
            }
            var menuText = FastExt.Store.getStoreMenuText(dataStore);
            var pagingtoolbar = Ext.create('Ext.toolbar.Paging', {
                store: dataStore,
                dock: 'bottom',
                itemId: 'pagingToolBar',
                pageSize: dataStore.pageSize,
                displayInfo: true,
                inputItemWidth: 70,
                overflowHandler: 'scroller'
            });
            var control = {
                xtype: 'combo',
                pageTool: true,
                displayField: 'text',
                valueField: 'id',
                editable: false,
                width: 100,
                value: dataStore.pageSize,
                store: FastExt.Store.getPageDataStore(),
                listeners: {
                    change: function (obj, newValue, oldValue) {
                        if (newValue != null && newValue != 0) {
                            var pageRecord = obj.getStore().getById(newValue);
                            if (!pageRecord) {
                                obj.totalCount = newValue;
                                obj.setValue(-1);
                                return;
                            }
                            if (newValue === -1) {
                                this.ownerCt.pageSize = dataStore.getTotalCount();
                                dataStore.pageSize = dataStore.getTotalCount();
                                if (!Ext.isEmpty(obj.totalCount)) {
                                    this.ownerCt.pageSize = obj.totalCount;
                                    dataStore.pageSize = obj.totalCount;
                                }
                            }
                            else {
                                this.ownerCt.pageSize = newValue;
                                dataStore.pageSize = newValue;
                            }
                            dataStore.loadPage(1);
                        }
                    }
                }
            };
            var copyBtn = {
                xtype: 'button',
                tooltip: '拷贝数据',
                subtext: '拷贝数据@' + menuText,
                checkSelect: 2,
                iconCls: 'extIcon extCopy2 grayColor',
                handler: function () {
                    var selection = dataStore.grid.getSelection();
                    if (selection.length === 0) {
                        FastExt.Dialog.showAlert("系统提醒", "请选择需要复制的数据！");
                        return;
                    }
                    Ext.Msg.confirm("系统提醒", "您确定复制选中的" + selection.length + "条数据吗？", function (button, text) {
                        if (button === "yes") {
                            FastExt.Dialog.showWait("正在复制数据中……");
                            FastExt.Store.commitStoreCopy(dataStore.grid.getStore(), dataStore.grid.getSelection()).then(function (success) {
                                if (success) {
                                    dataStore.grid.getSelectionModel().deselectAll();
                                    var grouped = dataStore.grid.getStore().isGrouped();
                                    if (grouped) {
                                        dataStore.grid.getView().getFeature('group').collapseAll();
                                    }
                                    FastExt.Dialog.hideWait();
                                }
                            });
                        }
                    });
                }
            };
            var deleteAllBtn = {
                xtype: 'button',
                tooltip: '清空数据',
                subtext: '清空数据@' + menuText,
                iconCls: 'extIcon extClear grayColor',
                handler: function () {
                    var menuText = FastExt.Store.getStoreMenuText(dataStore.grid.getStore());
                    var confirmFunction = function (button, text) {
                        if (button === "yes") {
                            FastExt.System.validOperate("清空【" + menuText + "】数据", function () {
                                FastExt.Dialog.showWait("正在清空数据中……");
                                var storeParams = dataStore.grid.getStore().proxy.extraParams;
                                var params = { "entityCode": dataStore.entity.entityCode, "all": true };
                                if (dataStore.grid.getStore().entity.menu) {
                                    params["menu"] = FastExt.Store.getStoreMenuText(dataStore.grid.getStore());
                                }
                                FastExt.Server.deleteEntity(FastExt.Json.mergeJson(params, storeParams), function (success, message) {
                                    FastExt.Dialog.hideWait();
                                    if (success) {
                                        dataStore.loadPage(1);
                                    }
                                    FastExt.Dialog.showAlert("系统提醒", message);
                                });
                            });
                        }
                    };
                    var message = "<div style='line-height: 170%;'>";
                    message += "<b style='color: red;font-size: 18px;'>请您谨慎操作！</b><br/>";
                    if (menuText) {
                        message += "<b style='color: red;font-size: 16px;'>当前页面【" + menuText + "】</b><br/>";
                    }
                    message += "<b style='font-size: 16px;'>您确定清空当前条件下的所有数据吗？！<br/>当前共" + dataStore.getTotalCount() + "条数据！</b>";
                    if (entityRecycle) {
                        message += "<br/><b style='color: red;font-size: 14px;line-height: 18px;'>此操作将跳过回收站！</b>";
                    }
                    message += "</div>";
                    var confirmConfig = {
                        title: "系统提醒",
                        icon: Ext.Msg.WARNING,
                        message: message,
                        buttons: Ext.Msg.YESNO,
                        defaultFocus: "no",
                        cls: 'redAlert',
                        callback: confirmFunction
                    };
                    var hideFunction = function () {
                        clearTimeout(Ext.Msg.timeout);
                        var msgButton = Ext.Msg.msgButtons["yes"];
                        msgButton.setText("是");
                        msgButton.enable();
                    };
                    Ext.Msg.on("hide", hideFunction, this, { single: true });
                    var msgBox = Ext.Msg.show(confirmConfig);
                    var timeFunction = function (second) {
                        var msgButton = Ext.Msg.msgButtons["yes"];
                        if (second <= 0) {
                            msgButton.setText("立即清空");
                            msgButton.enable();
                            return;
                        }
                        else {
                            msgButton.setText(second + "秒后可操作");
                            msgButton.disable();
                        }
                        Ext.Msg.timeout = setTimeout(function () {
                            timeFunction(second - 1);
                        }, 1000);
                    };
                    var msgButton = Ext.Msg.msgButtons["yes"];
                    msgButton.disable();
                    FastExt.Component.shakeComment(msgBox, function () {
                        var time = 5;
                        if (dataStore.getTotalCount() > 50) {
                            time = 15;
                        }
                        if (dataStore.getTotalCount() > 5000) {
                            time = 20;
                        }
                        if (dataStore.getTotalCount() > 10000) {
                            time = 30;
                        }
                        timeFunction(time);
                    }, 3000);
                }
            };
            if (fromRecycle) {
                deleteAllBtn.tooltip = "清空回收站";
            }
            var recycleBtn = {
                xtype: 'button',
                tooltip: '回收站',
                iconCls: 'extIcon extRecycle grayColor',
                handler: function () {
                    FastExt.Grid.showRecycleGrid(this, dataStore);
                }
            };
            var searchBtn = {
                xtype: 'button',
                toolType: 'searchBtn',
                tooltip: '搜索数据',
                iconCls: 'extIcon extSearch grayColor',
                handler: function () {
                    FastExt.Grid.showColumnSearchWin(this, dataStore.grid);
                }
            };
            var sortBtn = {
                xtype: 'button',
                toolType: 'sortBtn',
                tooltip: '排序数据',
                iconCls: 'extIcon extSort grayColor',
                handler: function () {
                    FastExt.Grid.showColumnSortWin(this, dataStore.grid);
                }
            };
            var timerBtn = {
                xtype: 'button',
                toolType: 'timerBtn',
                tooltip: '定时刷新',
                iconCls: 'extIcon extAlarm grayColor',
                handler: function () {
                    FastExt.Grid.showTimerRefreshGrid(this, dataStore.grid);
                }
            };
            pagingtoolbar.insert(0, control);
            pagingtoolbar.insert(0, {
                xtype: 'label',
                text: '每页',
                margin: '0 10 0 10'
            });
            var refreshBtn = pagingtoolbar.child("#refresh");
            var beginIndex = pagingtoolbar.items.indexOf(refreshBtn);
            pagingtoolbar.insert(++beginIndex, timerBtn);
            pagingtoolbar.insert(++beginIndex, "-");
            pagingtoolbar.insert(++beginIndex, searchBtn);
            pagingtoolbar.insert(++beginIndex, sortBtn);
            if (fromRecycle) {
                var rebackBtn = {
                    xtype: 'button',
                    tooltip: '还原数据',
                    checkSelect: 2,
                    iconCls: 'extIcon extReback grayColor',
                    handler: function () {
                        FastExt.Grid.rebackGridData(dataStore.grid);
                    }
                };
                pagingtoolbar.insert(++beginIndex, "-");
                pagingtoolbar.insert(++beginIndex, rebackBtn);
            }
            // if (system.isSuperRole()) {
            // }
            pagingtoolbar.insert(++beginIndex, "-");
            if (!fromRecycle) {
                pagingtoolbar.insert(++beginIndex, copyBtn);
            }
            pagingtoolbar.insert(++beginIndex, deleteAllBtn);
            if (!fromRecycle && entityRecycle) {
                pagingtoolbar.insert(++beginIndex, "-");
                pagingtoolbar.insert(++beginIndex, recycleBtn);
            }
            return pagingtoolbar;
        };
        /**
         * 弹出Grid绑定的实体列表回收站数据
         * @param obj 动画对象
         * @param dataStore 数据源
         */
        Grid.showRecycleGrid = function (obj, dataStore) {
            if (!dataStore) {
                return;
            }
            var title = "回收站";
            if (dataStore.entity.menu) {
                title = dataStore.entity.menu.text + "-回收站";
            }
            var entityObj = eval("new " + dataStore.entity.entityCode + "()");
            entityObj.menu = {
                id: $.md5(title),
                text: title
            };
            var where = { "^fromRecycle": true };
            var gridPanel = entityObj.getList(FastExt.Json.mergeJson(where, dataStore.where));
            var entityOwner = gridPanel.down("[entityList=true]");
            entityOwner.code = $.md5(dataStore.entity.entityCode + "回收站");
            var winWidth = parseInt((document.body.clientWidth * 0.7).toFixed(0));
            var winHeight = parseInt((document.body.clientHeight * 0.8).toFixed(0));
            var win = Ext.create('Ext.window.Window', {
                title: title,
                iconCls: 'extIcon extRecycle',
                layout: 'fit',
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 600,
                constrain: true,
                resizable: true,
                modal: true,
                maximizable: true,
                animateTarget: obj,
                maximized: false,
                items: [gridPanel]
            });
            win.show();
        };
        /**
         * 操作还原Grid回收站里的数据
         * @param grid
         */
        Grid.rebackGridData = function (grid) {
            return new Ext.Promise(function (resolve, reject) {
                if (!grid.getStore().entity) {
                    Ext.Msg.alert('系统提醒', '还原失败！Grid的DataStore未绑定Entity!');
                    return;
                }
                if (grid.getSelection().length === 0) {
                    FastExt.Dialog.toast('请您先选择需要还原的数据！');
                    return;
                }
                var selectLength = grid.getSelection().length;
                var doDelete = function () {
                    FastExt.Dialog.showWait("正在还原数据中……");
                    FastExt.Store.commitStoreReback(grid.getStore(), grid.getSelection()).then(function (success, message) {
                        if (success) {
                            grid.getSelectionModel().deselectAll();
                            var grouped = grid.getStore().isGrouped();
                            if (grouped) {
                                grid.getView().getFeature('group').collapseAll();
                            }
                            FastExt.Dialog.hideWait();
                            Ext.Msg.alert('系统提醒', '还原成功！');
                        }
                        resolve(success);
                    });
                };
                var confirmConfig = {
                    title: "系统提醒",
                    icon: Ext.Msg.QUESTION,
                    message: "您确定还原选中的" + selectLength + "条数据吗？",
                    buttons: Ext.Msg.YESNO,
                    defaultFocus: "no",
                    callback: function (button, text) {
                        if (button === "yes") {
                            doDelete();
                        }
                    }
                };
                Ext.Msg.show(confirmConfig);
            });
        };
        /**
         * 弹出配置列排序的窗体
         * @param obj 动画对象
         * @param grid grid对象
         */
        Grid.showColumnSortWin = function (obj, grid) {
            if (!obj.sortWin) {
                var store_2 = FastExt.Store.getGridColumnStore(grid);
                var buildItem_2 = function (data, defaultValue) {
                    if (!defaultValue) {
                        defaultValue = "ASC";
                    }
                    return {
                        xtype: 'panel',
                        flex: 1,
                        columnWidth: 1,
                        layout: 'hbox',
                        margin: '0',
                        border: 0,
                        toParam: function () {
                            var param = {};
                            var combo = this.items.get(0);
                            param["property"] = combo.getValue();
                            var directionItem = this.items.get(1);
                            param["direction"] = directionItem.getValue();
                            return param;
                        },
                        items: [
                            {
                                xtype: 'combo',
                                region: 'west',
                                valueField: 'id',
                                flex: 0.4,
                                margin: '2 0 0 2',
                                value: data.get("id"),
                                displayField: 'text',
                                editable: false,
                                store: store_2
                            },
                            {
                                xtype: 'combo',
                                flex: 1,
                                valueField: 'value',
                                editable: false,
                                margin: '2 2 0 2',
                                value: defaultValue,
                                triggers: {
                                    close: {
                                        cls: 'text-clear',
                                        handler: function () {
                                            this.ownerCt.destroy();
                                        }
                                    }
                                },
                                store: Ext.create('Ext.data.Store', {
                                    fields: ["id", "text"],
                                    data: [
                                        {
                                            'text': '无',
                                            'value': 'NONE'
                                        },
                                        {
                                            'text': '正序',
                                            "value": 'ASC'
                                        },
                                        {
                                            'text': '倒序',
                                            "value": 'DESC'
                                        }
                                    ]
                                })
                            },
                        ]
                    };
                };
                var formPanel_2 = Ext.create('Ext.form.FormPanel', {
                    margin: '5',
                    border: 0,
                    layout: 'column',
                    width: 400,
                    scrollable: true,
                    defaults: {
                        labelWidth: 80,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        emptyText: '请填写'
                    },
                    items: [],
                });
                grid.getStore().getSorters().each(function (item) {
                    var data = store_2.findRecord("id", item.getProperty(), 0, false, false, true);
                    formPanel_2.add(buildItem_2(data, item.getDirection()));
                });
                if (formPanel_2.items.length === 0) {
                    formPanel_2.add(buildItem_2(store_2.getAt(0), "NONE"));
                }
                obj.sortWin = Ext.create('Ext.window.Window', {
                    title: '排序数据',
                    layout: 'fit',
                    constrain: true,
                    iconCls: 'extIcon extSort',
                    resizable: true,
                    minHeight: 200,
                    minWidth: 400,
                    height: 200,
                    animateTarget: obj,
                    items: [formPanel_2],
                    listeners: {
                        close: function (panel, eOpts) {
                            obj.sortWin = null;
                        }
                    },
                    buttons: [
                        {
                            text: '添加条件',
                            iconCls: 'extIcon extPlus',
                            handler: function () {
                                formPanel_2.add(buildItem_2(store_2.getAt(0)));
                                var winHeight = 50 + formPanel_2.items.length * 35 + 55;
                                formPanel_2.scrollTo(0, winHeight, false);
                            }
                        },
                        {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                var sortCollection = grid.getStore().getSorters();
                                sortCollection.clear();
                                Ext.each(grid.getColumns(), function (item) {
                                    item.sortDirection = null;
                                    FastExt.Grid.refreshColumnStyle(item);
                                });
                                var sorts = [];
                                formPanel_2.items.each(function (item) {
                                    var toParam = item.toParam();
                                    sorts.push(toParam);
                                    var column = FastExt.Grid.getColumn(grid, toParam.property);
                                    column.sortDirection = toParam.direction;
                                    FastExt.Grid.refreshColumnStyle(column);
                                });
                                if (sorts.length > 0) {
                                    grid.getStore().sort(sorts);
                                }
                                else {
                                    grid.getStore().loadPage(1);
                                }
                                FastExt.Grid.checkColumnSort(grid);
                            }
                        }
                    ]
                });
                grid.ownerCt.add(obj.sortWin);
            }
            obj.sortWin.show();
        };
        /**
         * 弹出定时刷新Grid数据的窗体
         * @param obj 动画对象
         * @param grid grid对象
         */
        Grid.showTimerRefreshGrid = function (obj, grid) {
            if (!obj.timerWin) {
                if (!grid.timerConfig) {
                    grid.timerConfig = {
                        "state": 0,
                        "value": 30
                    };
                }
                var formPanel_3 = Ext.create('Ext.form.FormPanel', {
                    margin: '5',
                    border: 0,
                    layout: 'column',
                    width: 400,
                    scrollable: true,
                    defaults: {
                        labelWidth: 120,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        emptyText: '请填写'
                    },
                    viewModel: {
                        data: grid.timerConfig
                    },
                    items: [
                        {
                            xtype: 'combo',
                            name: 'state',
                            displayField: 'text',
                            valueField: 'id',
                            fieldLabel: '是否启动',
                            editable: false,
                            flex: 1,
                            columnWidth: 1,
                            value: 0,
                            allowBlank: false,
                            bind: '{state}',
                            store: FastExt.Store.getYesOrNoDataStore()
                        },
                        {
                            xtype: "numberfield",
                            name: 'value',
                            bind: '{value}',
                            fieldLabel: "时间间隔（秒）",
                            columnWidth: 1,
                            minValue: 1,
                            value: 30,
                            decimalPrecision: 0,
                            allowBlank: false
                        }
                    ],
                });
                obj.timerWin = Ext.create('Ext.window.Window', {
                    title: '定时刷新数据',
                    layout: 'fit',
                    constrain: true,
                    iconCls: 'extIcon extAlarm',
                    resizable: true,
                    minHeight: 200,
                    minWidth: 400,
                    height: 200,
                    animateTarget: obj,
                    items: [formPanel_3],
                    listeners: {
                        close: function (panel, eOpts) {
                            obj.timerWin = null;
                        }
                    },
                    buttons: [
                        {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                var form = formPanel_3.getForm();
                                if (form.isValid()) {
                                    grid.timerConfig = formPanel_3.getValues();
                                    grid.timerRefresh = function () {
                                        if (grid.timerTimeout) {
                                            clearTimeout(grid.timerTimeout);
                                        }
                                        var pagingToolBar = grid.child('#pagingToolBar');
                                        if (pagingToolBar) {
                                            var timerBtn = pagingToolBar.down("button[toolType=timerBtn]");
                                            if (timerBtn) {
                                                if (parseInt(grid.timerConfig["state"]) === 1) {
                                                    timerBtn.setIconCls("extIcon extTimer redColor");
                                                }
                                                else {
                                                    timerBtn.setIconCls("extIcon extTimer grayColor");
                                                }
                                            }
                                        }
                                        if (parseInt(grid.timerConfig["state"]) === 0) {
                                            return;
                                        }
                                        grid.timerTimeout = setTimeout(function () {
                                            grid.getStore().reload();
                                            grid.timerRefresh();
                                        }, parseInt(grid.timerConfig["value"]) * 1000);
                                    };
                                    grid.timerRefresh();
                                    if (parseInt(grid.timerConfig["state"]) === 0) {
                                        FastExt.Dialog.toast("已关闭定时器！");
                                    }
                                    else {
                                        FastExt.Dialog.toast("已启动定时器！");
                                    }
                                    obj.timerWin.close();
                                }
                            }
                        }
                    ]
                });
                grid.ownerCt.add(obj.timerWin);
            }
            obj.timerWin.show();
        };
        /**
         * 操作删除Grid里选中的数据
         * @param grid
         */
        Grid.deleteGridData = function (grid) {
            return new Ext.Promise(function (resolve, reject) {
                if (!grid.getStore().entity) {
                    Ext.Msg.alert('系统提醒', '删除失败！Grid的DataStore未绑定Entity!');
                    return;
                }
                if (grid.getSelection().length === 0) {
                    FastExt.Dialog.toast('请您先选择需要删除的数据！');
                    return;
                }
                var selectLength = grid.getSelection().length;
                var doDelete = function () {
                    FastExt.Dialog.showWait("正在删除数据中……");
                    FastExt.Store.commitStoreDelete(grid.getStore(), grid.getSelection()).then(function (success) {
                        if (success) {
                            grid.getSelectionModel().deselectAll();
                            var grouped = grid.getStore().isGrouped();
                            if (grouped) {
                                grid.getView().getFeature('group').collapseAll();
                            }
                            FastExt.Dialog.hideWait();
                        }
                        resolve(success);
                    });
                };
                if (grid.operate && grid.operate.alertDelete) {
                    var confirmConfig = {
                        title: "系统提醒",
                        icon: Ext.Msg.QUESTION,
                        message: "您确定删除选中的" + selectLength + "条数据吗？",
                        buttons: Ext.Msg.YESNO,
                        defaultFocus: "no",
                        callback: function (button, text) {
                            if (button === "yes") {
                                doDelete();
                            }
                        }
                    };
                    Ext.Msg.show(confirmConfig);
                }
                else {
                    doDelete();
                }
            });
        };
        /**
         * 操作提交Grid被修改过的数据
         * @param grid
         */
        Grid.updateGridData = function (grid) {
            return new Ext.Promise(function (resolve, reject) {
                if (!grid.getStore().entity) {
                    Ext.Msg.alert('系统提醒', '修改失败！Grid的DataStore未绑定Entity!');
                    return;
                }
                var records = grid.getStore().getUpdatedRecords();
                if (records.length === 0) {
                    FastExt.Dialog.toast('当前暂无数据被修改！');
                    return;
                }
                if (grid.operate && grid.operate.alertUpdate) {
                    Ext.Msg.confirm("系统提醒", "您确定提交被修改的数据吗？", function (button, text) {
                        if (button === "yes") {
                            FastExt.Dialog.showWait("正在修改数据中……");
                            FastExt.Store.commitStoreUpdate(grid.getStore()).then(function (result) {
                                resolve(result);
                                if (result) {
                                    FastExt.Dialog.hideWait();
                                }
                            });
                        }
                    });
                }
                else {
                    FastExt.Dialog.showWait("正在修改数据中……");
                    FastExt.Store.commitStoreUpdate(grid.getStore()).then(function (result) {
                        resolve(result);
                        if (result) {
                            FastExt.Dialog.hideWait();
                        }
                    });
                }
            });
        };
        /**
         * 弹出数据的详情窗体，与Grid列表的列属性一致
         * @param obj 动画对象
         * @param title 详情窗体标题
         * @param entity 实体类对象
         * @param record 单个数据record
         */
        Grid.showDetailsWindow = function (obj, title, entity, record) {
            FastExt.Server.showColumns(entity.entityCode, function (success, value, message) {
                if (success) {
                    var columnInfos = Ext.decode(value);
                    var data = [];
                    var lastGroupNon = 1;
                    for (var key in columnInfos) {
                        if (columnInfos.hasOwnProperty(key)) {
                            var column = columnInfos[key];
                            if (Ext.isEmpty(column.dataIndex)) {
                                continue;
                            }
                            var d = {
                                value: record.get(column.dataIndex),
                                groupHeaderText: column.groupHeaderText,
                                record: record
                            };
                            for (var c in column) {
                                if (column.hasOwnProperty(c)) {
                                    d[c] = column[c];
                                }
                            }
                            if (!d.groupHeaderText) {
                                d.groupHeaderText = lastGroupNon;
                            }
                            else {
                                lastGroupNon++;
                            }
                            data.push(d);
                        }
                    }
                    data.sort(function (a, b) {
                        return a.index - b.index;
                    });
                    var detailsStore = Ext.create('Ext.data.Store', {
                        autoLoad: false,
                        groupField: 'groupHeaderText',
                        fields: []
                    });
                    detailsStore.loadData(data);
                    detailsStore.sort('index', 'ASC');
                    var detailsGrid = Ext.create('Ext.grid.Panel', {
                        border: 0,
                        scrollable: 'y',
                        region: 'center',
                        store: detailsStore,
                        hideHeaders: true,
                        features: [{
                                ftype: 'grouping',
                                collapsible: false,
                                hideGroupedHeader: true,
                                expandTip: null,
                                collapseTip: null,
                                groupHeaderTpl: [
                                    '<b>{name:this.formatName}</b>', {
                                        formatName: function (name) {
                                            if (Ext.isNumeric(name)) {
                                                return "基本属性";
                                            }
                                            return name;
                                        }
                                    }
                                ]
                            }],
                        columns: [
                            {
                                header: '名称',
                                power: false,
                                dataIndex: 'text',
                                flex: 0.3,
                                tdCls: 'tdVTop',
                                align: 'right',
                                renderer: function (val, m, r) {
                                    m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                                    return "<b>" + val + "：</b>";
                                }
                            },
                            {
                                header: '值',
                                dataIndex: 'value',
                                power: false,
                                flex: 0.7,
                                align: 'left',
                                renderer: function (val, m, r) {
                                    try {
                                        m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                                        var fun = null;
                                        var rendererFunction = r.get("rendererFunction");
                                        if (rendererFunction) {
                                            fun = eval(rendererFunction);
                                        }
                                        else {
                                            var renderer = r.get("renderer");
                                            fun = FastExt.Base.loadFunction(renderer);
                                        }
                                        if (!Ext.isEmpty(fun)) {
                                            val = fun(val, m, r.get("record"), -1, -1, null, null, true);
                                        }
                                        if (Ext.isEmpty(val) || val === "null") {
                                            return "<font color='#ccc'>无</font>";
                                        }
                                        return val;
                                    }
                                    catch (e) {
                                        return val;
                                    }
                                }
                            }
                        ],
                        viewConfig: {
                            loadMask: {
                                msg: '正在为您在加载数据…'
                            },
                            enableTextSelection: true
                        }
                    });
                    var winWidth = parseInt((document.body.clientWidth * 0.3).toFixed(0));
                    var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                    var win = Ext.create('Ext.window.Window', {
                        title: title,
                        height: winHeight,
                        width: winWidth,
                        minHeight: 450,
                        iconCls: 'extIcon extDetails',
                        minWidth: 400,
                        layout: 'border',
                        resizable: true,
                        constrain: true,
                        maximizable: true,
                        animateTarget: obj,
                        listeners: {
                            destroy: function (obj, op) {
                            },
                            show: function (obj) {
                                obj.focus();
                            }
                        },
                        items: [detailsGrid]
                    });
                    win.show();
                }
                else {
                    FastExt.Dialog.showAlert("系统提醒", message);
                }
            });
        };
        /**
         * 创建详情数据的Grid
         * @param data 数据实体
         * @param configGrid 扩展配置Grid
         * @param configName 扩展配置Grid属性名
         * @param configValue 扩展配置Grid属性值
         * @return Ext.grid.Panel
         */
        Grid.createDetailsGrid = function (data, configGrid, configName, configValue) {
            var dataStore = Ext.create('Ext.data.Store', {
                autoLoad: false,
                fields: [],
                data: data
            });
            var nameConfig = {
                header: '名称',
                dataIndex: 'name',
                flex: 0.3,
                align: 'right',
                renderer: function (val, m, r) {
                    m.style = 'color:#000000;overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                    return "<b>" + val + "：</b>";
                },
                listeners: {
                    dblclick: function (grid, obj, celNo, obj1, obj2, rowNo, e) {
                        if (celNo === 0) {
                        }
                    }
                }
            };
            var valueConfig = {
                header: '值',
                dataIndex: 'value',
                flex: 0.7,
                align: 'left',
                renderer: function (val, m, r) {
                    try {
                        m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                        var fun = r.get("renderer");
                        if (Ext.isFunction(fun)) {
                            var value = fun(val, m, r.get("record"), -1, -1, null, null, true);
                            if (Ext.isEmpty(value)) {
                                return "<font color='#ccc'>无</font>";
                            }
                            return value;
                        }
                        return val;
                    }
                    catch (e) {
                        return val;
                    }
                },
                listeners: {
                    dblclick: function (grid, obj, celNo, obj1, obj2, rowNo, e) {
                        if (celNo === 0) {
                        }
                    }
                }
            };
            var gridConfig = {
                region: 'center',
                border: 0,
                columnLines: true,
                store: dataStore,
                viewConfig: {
                    enableTextSelection: true
                },
                updateData: function (newData) {
                    dataStore.setData(newData);
                },
                columns: [FastExt.Json.mergeJson(nameConfig, configName),
                    FastExt.Json.mergeJson(valueConfig, configValue)]
            };
            return Ext.create('Ext.grid.Panel', FastExt.Json.mergeJson(gridConfig, configGrid));
        };
        return Grid;
    }());
    FastExt.Grid = Grid;
    /**
     * Grid操作配置对象
     */
    var GridOperate = /** @class */ (function () {
        function GridOperate() {
            this._alertDelete = true;
            this._alertUpdate = true;
            this._autoUpdate = false;
            this._autoDetails = true;
            this._hoverTip = false;
            this._refreshData = false;
        }
        Object.defineProperty(GridOperate.prototype, "alertDelete", {
            /**
             * 删除数据时弹框提醒
             */
            get: function () {
                return this._alertDelete;
            },
            set: function (value) {
                this._alertDelete = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GridOperate.prototype, "alertUpdate", {
            /**
             * 提交数据修改时弹框提醒
             */
            get: function () {
                return this._alertUpdate;
            },
            set: function (value) {
                this._alertUpdate = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GridOperate.prototype, "autoUpdate", {
            /**
             * 自动提交被修改的数据
             */
            get: function () {
                return this._autoUpdate;
            },
            set: function (value) {
                this._autoUpdate = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GridOperate.prototype, "autoDetails", {
            /**
             * 选中grid数据中自动弹出右侧详细面板
             */
            get: function () {
                return this._autoDetails;
            },
            set: function (value) {
                this._autoDetails = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GridOperate.prototype, "hoverTip", {
            /**
             * 鼠标悬浮在数据操作3秒时，弹出预览数据提示
             */
            get: function () {
                return this._hoverTip;
            },
            set: function (value) {
                this._hoverTip = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GridOperate.prototype, "refreshData", {
            /**
             * 当离开Grid所在的标签页后，再次返回此标签页时将刷新当前标签页的列表数据
             */
            get: function () {
                return this._refreshData;
            },
            set: function (value) {
                this._refreshData = value;
            },
            enumerable: false,
            configurable: true
        });
        return GridOperate;
    }());
    FastExt.GridOperate = GridOperate;
})(FastExt || (FastExt = {}));
var FastExt;
(function (FastExt) {
    /**
     * 图片相关的操作
     */
    var Image = /** @class */ (function () {
        function Image() {
        }
        /**
         * 获取oss旋转后的角度地址
         * @param imgUrl
         * @param rotate
         */
        Image.rotateOSSImgUrl = function (imgUrl, rotate) {
            if (!Ext.isEmpty(imgUrl) && !Ext.isEmpty(rotate)) {
                if (imgUrl.toString().indexOf("?") >= 0) {
                    return imgUrl + "&x-oss-process=image/rotate," + rotate;
                }
                return imgUrl + "?x-oss-process=image/rotate," + rotate;
            }
            return imgUrl;
        };
        return Image;
    }());
    FastExt.Image = Image;
})(FastExt || (FastExt = {}));
var FastExt;
(function (FastExt) {
    /**
     * JSON相关功能
     */
    var Json = /** @class */ (function () {
        function Json() {
        }
        /**
         * 将json字符串转成对象
         * @param jsonStr json字符串
         * @returns {Object}
         */
        Json.jsonToObject = function (jsonStr) {
            try {
                return Ext.decode(jsonStr);
            }
            catch (e) {
            }
            return null;
        };
        /**
         * 将对象转成json字符串
         * @param jsonObj 待转换的对象
         * @returns {string}
         */
        Json.objectToJson = function (jsonObj) {
            try {
                return Ext.encode(jsonObj);
            }
            catch (e) {
            }
            return null;
        };
        /**
         * 合并两个json对象
         * @param jsonData1 json对象
         * @param jsonData2 json对象
         * @return 合并后的新对象
         */
        Json.mergeJson = function (jsonData1, jsonData2) {
            var newJsonData = {};
            if (!Ext.isEmpty(jsonData1)) {
                for (var property in jsonData1) {
                    newJsonData[property] = jsonData1[property];
                }
            }
            if (!Ext.isEmpty(jsonData2)) {
                for (var property in jsonData2) {
                    newJsonData[property] = jsonData2[property];
                }
            }
            return newJsonData;
        };
        return Json;
    }());
    FastExt.Json = Json;
})(FastExt || (FastExt = {}));
var FastExt;
(function (FastExt) {
    /**
     * 地图相关功能，使用的是高德地图
     */
    var Map = /** @class */ (function () {
        function Map() {
        }
        /**
         * 弹出地图选择界面
         * @param obj 动画对象
         * @param lng 默认经度
         * @param lat 默认纬度
         * @param address 默认地址详情
         * @return Ext.Promise
         */
        Map.selAddressInMap = function (obj, lng, lat, address) {
            return new Ext.Promise(function (resolve, reject) {
                var defaultLngLat = "";
                if (!Ext.isEmpty(lng) && !Ext.isEmpty(lat) && parseFloat(lng) !== 0 && parseFloat(lat) !== 0) {
                    defaultLngLat = lng + "," + lat;
                }
                var mapPanel = Ext.create('Ext.panel.Panel', {
                    layout: 'border',
                    region: 'center',
                    iframePanel: true,
                    border: 0
                });
                var showInputPoint = function (title, pointType) {
                    Ext.Msg.prompt(title, "请输入坐标经纬度(lng,lat)", function (btn, text) {
                        if (btn === 'ok') {
                            text = text.toString().replaceAll(" ", "")
                                .replaceAll("，", ",");
                            if (window["mapFrame"]) {
                                if (pointType) {
                                    window["mapFrame"].window["AMap"].convertFrom([text.split(",")], pointType, function (status, result) {
                                        var lnglats = result.locations;
                                        var lnglat = lnglats[0];
                                        window["mapFrame"].window.setLngLatAddress(lnglat.toString());
                                    });
                                }
                                else {
                                    window["mapFrame"].window.setLngLatAddress(text);
                                }
                            }
                        }
                    });
                };
                var formPanel = Ext.create('Ext.form.FormPanel', {
                    url: 'addData',
                    method: 'POST',
                    region: 'north',
                    fileUpload: true,
                    autoScroll: false,
                    height: 50,
                    layout: "column",
                    defaults: {
                        margin: '5 5 5 5'
                    },
                    items: [
                        {
                            name: 'map.taskTitle',
                            fieldLabel: '位置搜索',
                            labelWidth: 60,
                            labelAlign: 'right',
                            id: 'txtSearch',
                            columnWidth: 1,
                            allowBlank: false,
                            emptyText: '输入地址',
                            xtype: 'textfield'
                        },
                        {
                            xtype: 'button',
                            width: 100,
                            text: '搜索',
                            handler: function () {
                                var form = formPanel.getForm();
                                if (form.isValid()) {
                                    doSearch();
                                }
                            }
                        },
                        {
                            xtype: 'button',
                            width: 120,
                            text: '查找高德坐标',
                            handler: function () {
                                showInputPoint("查找高德坐标");
                            }
                        }, {
                            xtype: 'button',
                            width: 120,
                            text: '查找GPS坐标',
                            handler: function () {
                                showInputPoint("查找GPS坐标", "gps");
                            }
                        }
                    ],
                    listeners: {
                        'render': function (text) {
                            try {
                                new Ext.util.KeyMap({
                                    target: text.getEl(),
                                    key: 13,
                                    fn: doSearch,
                                    scope: Ext.getBody()
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });
                var doSearch = function () {
                    window["mapFrame"].window.searchAddress(Ext.getCmp("txtSearch").getValue());
                };
                var bottomPanel = Ext.create('Ext.panel.Panel', {
                    layout: "column",
                    region: 'south',
                    border: 0,
                    height: 42,
                    defaults: {
                        margin: '5 5 5 5'
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            id: 'lblAddress',
                            fieldLabel: '选择位置',
                            labelWidth: 60,
                            value: address,
                            labelAlign: 'right',
                            columnWidth: 0.8
                        },
                        {
                            xtype: 'textfield',
                            id: 'lblLngLat',
                            readOnly: true,
                            width: 160,
                            value: defaultLngLat
                        },
                        {
                            xtype: 'button',
                            columnWidth: 0.2,
                            text: '确定',
                            handler: function () {
                                var lblLngLat = Ext.getCmp("lblLngLat");
                                var lnglat = lblLngLat.getValue();
                                var lng = lnglat.split(",")[0];
                                var lat = lnglat.split(",")[1];
                                FastExt.Base.runCallBack(resolve, {
                                    lng: lng,
                                    lat: lat,
                                    addr: Ext.getCmp("lblAddress").getValue(),
                                    pro: lblLngLat.province,
                                    city: lblLngLat.city,
                                    area: lblLngLat.area
                                });
                                win.close();
                            }
                        }
                    ]
                });
                var containerPanel = Ext.create('Ext.panel.Panel', {
                    layout: 'border',
                    border: 0,
                    items: [
                        formPanel, mapPanel, bottomPanel
                    ]
                });
                var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                var win = Ext.create('Ext.window.Window', {
                    title: '选择位置',
                    height: winHeight,
                    width: winWidth,
                    minHeight: 500,
                    minWidth: 600,
                    iconCls: 'extIcon extMap',
                    layout: 'fit',
                    resizable: true,
                    maximizable: true,
                    animateTarget: obj,
                    constrain: true,
                    items: [containerPanel],
                    modal: true,
                    listeners: {
                        show: function () {
                            var url = FastExt.System.formatUrlVersion('base/map/select.html', {
                                mapVersion: FastExt.System.getExt("amap-version").value,
                                mapKey: FastExt.System.getExt("amap-key").value
                            });
                            mapPanel.update("<iframe name='mapFrame'  src='" + url + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                        },
                        close: function (val) {
                            FastExt.Base.runCallBack(resolve);
                        }
                    }
                });
                win.show();
                containerPanel.setLoading("正在定位中，请稍后……");
                window["onMapLoadDone"] = function () {
                    if (!Ext.isEmpty(defaultLngLat)) {
                        window["mapFrame"].window.setLngLatAddress(defaultLngLat);
                    }
                    else {
                        window["mapFrame"].window.startLocation();
                    }
                };
                window["closeMapMask"] = function () {
                    containerPanel.setLoading(false);
                };
                window["showMapMask"] = function (msg) {
                    if (msg) {
                        containerPanel.setLoading(msg);
                    }
                    else {
                        containerPanel.setLoading(true);
                    }
                };
                window["alert"] = function (msg) {
                    FastExt.Dialog.showAlert("系统提醒", msg);
                };
                window["setMarkCurrPos"] = function (lnglat, address, province, city, area) {
                    Ext.getCmp("lblAddress").setValue(address);
                    var lblLngLat = Ext.getCmp("lblLngLat");
                    lblLngLat.setValue(lnglat);
                    lblLngLat.province = province;
                    lblLngLat.city = city;
                    lblLngLat.area = area;
                };
            });
        };
        /**
         * 在地图上查看位置
         * @param obj 动画对象
         * @param lnglat 经纬度,例如：110.837425,32.651414
         * @param mapTitle 弹出的窗体标题
         */
        Map.showAddressInMap = function (obj, lnglat, mapTitle) {
            var mapPanel = Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'center',
                border: 0,
                iframePanel: true,
                listeners: {
                    afterrender: function (obj, eOpts) {
                        var params = {
                            lnglat: lnglat,
                            mapVersion: FastExt.System.getExt("amap-version").value,
                            mapKey: FastExt.System.getExt("amap-key").value,
                            mapTitle: mapTitle
                        };
                        obj.update("<iframe name='mapFrame'  src='" + FastExt.System.formatUrlVersion('base/map/show.html', params) + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                    }
                }
            });
            var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
            var win = Ext.create('Ext.window.Window', {
                title: '查看位置',
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 600,
                iconCls: 'extIcon extMap',
                layout: 'border',
                resizable: true,
                maximizable: true,
                animateTarget: obj,
                constrain: true,
                items: [mapPanel],
                modal: true
            });
            win.show();
            mapPanel.setLoading("正在请求地址信息……");
            window["closeMapMask"] = function () {
                mapPanel.setLoading(false);
            };
        };
        /**
         * 在地图上选择矩形区域
         * @param obj 动画对象
         * @param southWestLngLat 西南坐标，左下角度
         * @param northEastLngLat 东北坐标，右上角度
         * @param imgUrl 矩形渲染的图片地址
         * @param anchors 矩形的锚点
         * @param rotate 图片旋转的角度
         */
        Map.selRectangleInMap = function (obj, southWestLngLat, northEastLngLat, imgUrl, anchors, rotate) {
            return new Ext.Promise(function (resolve, reject) {
                if (Ext.isEmpty(rotate)) {
                    rotate = 0;
                }
                var mapPanel = Ext.create('Ext.panel.Panel', {
                    layout: 'border',
                    region: 'center',
                    iframePanel: true,
                    border: 0
                });
                var formPanel = Ext.create('Ext.form.FormPanel', {
                    method: 'POST',
                    region: 'north',
                    fileUpload: true,
                    autoScroll: true,
                    height: 50,
                    layout: "column",
                    imgRotate: rotate,
                    defaults: {
                        margin: '5 5 5 5'
                    },
                    items: [
                        {
                            name: 'map.taskTitle',
                            fieldLabel: '位置搜索',
                            labelWidth: 60,
                            labelAlign: 'right',
                            id: 'txtSearch',
                            columnWidth: 1,
                            emptyText: '输入地址',
                            xtype: 'textfield'
                        }, {
                            xtype: 'button',
                            width: 100,
                            text: '搜索',
                            handler: function () {
                                doSearch();
                            }
                        }, {
                            xtype: 'button',
                            width: 100,
                            text: '选取',
                            handler: function () {
                                window["mapRectangleFrame"].window.selectRectangle();
                            }
                        }, {
                            xtype: 'button',
                            width: 100,
                            text: '锚点管理',
                            handler: function () {
                                FastExt.Map.manageMapAnchorPoints(this, window["mapRectangleFrame"]);
                            }
                        },
                        {
                            xtype: 'button',
                            width: 120,
                            text: '向左旋转图片',
                            handler: function () {
                                formPanel.imgRotate += 5;
                                if (formPanel.imgRotate > 360) {
                                    formPanel.imgRotate = 0;
                                }
                                window["mapRectangleFrame"].window.setImgLayerUrl(FastExt.Image.rotateOSSImgUrl(imgUrl, formPanel.imgRotate));
                            }
                        }, {
                            xtype: 'button',
                            width: 120,
                            text: '向右旋转图片',
                            handler: function () {
                                formPanel.imgRotate -= 5;
                                if (formPanel.imgRotate < 0) {
                                    formPanel.imgRotate = 360;
                                }
                                window["mapRectangleFrame"].window.setImgLayerUrl(FastExt.Image.rotateOSSImgUrl(imgUrl, formPanel.imgRotate));
                            }
                        }
                    ],
                    listeners: {
                        'render': function (text) {
                            try {
                                new Ext.util.KeyMap({
                                    target: text.getEl(),
                                    key: 13,
                                    fn: doSearch,
                                    scope: Ext.getBody()
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });
                var doSearch = function () {
                    window["mapRectangleFrame"].window.searchAddress(Ext.getCmp("txtSearch").getValue());
                };
                var bottomPanel = Ext.create('Ext.panel.Panel', {
                    layout: "column",
                    region: 'south',
                    border: 0,
                    height: 42,
                    defaults: {
                        margin: '5 5 5 5'
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            id: 'lblSouthWestLngLat',
                            fieldLabel: '西南角(左下)',
                            labelAlign: 'right',
                            readOnly: true,
                            columnWidth: 0.35
                        },
                        {
                            xtype: 'textfield',
                            id: 'lblNorthEastLngLat',
                            fieldLabel: '东北角(右上)',
                            readOnly: true,
                            columnWidth: 0.35
                        }, {
                            xtype: 'textfield',
                            id: 'lblRectangleSize',
                            labelWidth: 60,
                            fieldLabel: '矩形宽高',
                            readOnly: true,
                            columnWidth: 0.3
                        },
                        {
                            xtype: 'button',
                            width: 100,
                            text: '确定',
                            handler: function () {
                                var lblSouthWestLngLat = Ext.getCmp("lblSouthWestLngLat");
                                var southWestLngLat = lblSouthWestLngLat.getValue();
                                var lblNorthEastLngLat = Ext.getCmp("lblNorthEastLngLat");
                                var northEastLngLat = lblNorthEastLngLat.getValue();
                                FastExt.Base.runCallBack(resolve, {
                                    southWestLngLat: southWestLngLat,
                                    southWestLng: southWestLngLat.split(",")[0],
                                    southWestLat: southWestLngLat.split(",")[1],
                                    northEastLngLat: northEastLngLat,
                                    northEastLng: northEastLngLat.split(",")[0],
                                    northEastLat: northEastLngLat.split(",")[1],
                                    anchors: window["mapRectangleFrame"].pointDataArray,
                                    rotate: formPanel.imgRotate
                                });
                                win.close();
                            }
                        }
                    ]
                });
                var containerPanel = Ext.create('Ext.panel.Panel', {
                    layout: 'border',
                    border: 0,
                    items: [
                        formPanel, mapPanel, bottomPanel
                    ]
                });
                var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                var win = Ext.create('Ext.window.Window', {
                    title: '选择图层位置',
                    height: winHeight,
                    width: winWidth,
                    minHeight: 500,
                    minWidth: 600,
                    iconCls: 'extIcon extMap',
                    layout: 'fit',
                    resizable: true,
                    maximizable: true,
                    animateTarget: obj,
                    constrain: true,
                    items: [containerPanel],
                    modal: true,
                    listeners: {
                        show: function () {
                            var url = FastExt.System.formatUrlVersion('base/map/rectangle.html', {
                                mapVersion: FastExt.System.getExt("amap-version").value,
                                mapKey: FastExt.System.getExt("amap-key").value
                            });
                            mapPanel.update("<iframe name='mapRectangleFrame'  src='" + url + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                        },
                        close: function (val) {
                            FastExt.Base.runCallBack(resolve);
                        }
                    }
                });
                win.show();
                window["onMapLoadDone"] = function () {
                    var showImgUrl = FastExt.Image.rotateOSSImgUrl(imgUrl, rotate);
                    window["mapRectangleFrame"].pointDataArray = anchors;
                    window["mapRectangleFrame"].window.setImgLayerUrl(showImgUrl);
                    if (southWestLngLat && northEastLngLat) {
                        containerPanel.setLoading(false);
                        window["mapRectangleFrame"].window.selectRectangle(southWestLngLat, northEastLngLat, showImgUrl);
                    }
                    if (window["mapRectangleFrame"].pointDataArray) {
                        var data = [];
                        for (var i = 0; i < window["mapRectangleFrame"].pointDataArray.length; i++) {
                            data.push(window["mapRectangleFrame"].pointDataArray[i].gdPoint);
                        }
                        window["mapRectangleFrame"].window.setAnchorPoints(data, false);
                    }
                };
                window["closeMapMask"] = function () {
                    containerPanel.setLoading(false);
                };
                window["showMapMask"] = function (msg) {
                    if (msg) {
                        containerPanel.setLoading(msg);
                    }
                    else {
                        containerPanel.setLoading(true);
                    }
                };
                window["alert"] = function (msg) {
                    FastExt.Dialog.showAlert("系统提醒", msg);
                };
                window["setSelectBounds"] = function (southWestLngLat, northEastLngLat, size) {
                    var lblSouthWestLngLat = Ext.getCmp("lblSouthWestLngLat");
                    lblSouthWestLngLat.setValue(southWestLngLat);
                    var lblNorthEastLngLat = Ext.getCmp("lblNorthEastLngLat");
                    lblNorthEastLngLat.setValue(northEastLngLat);
                    var lblRectangleSize = Ext.getCmp("lblRectangleSize");
                    lblRectangleSize.setValue(size.width + "px - " + size.height + "px");
                };
            });
        };
        /**
         * 管理地图的锚点相关
         * @param obj
         * @param mapFrame
         */
        Map.manageMapAnchorPoints = function (obj, mapFrame) {
            if (obj) {
                obj.blur();
            }
            if (!mapFrame.pointDataArray) {
                mapFrame.pointDataArray = [];
            }
            var pointStore = Ext.create('Ext.data.Store', {
                autoLoad: true,
                data: mapFrame.pointDataArray
            });
            var showInputPoint = function (title, pointType) {
                Ext.Msg.prompt(title, "请输入坐标经纬度(lng,lat)", function (btn, text) {
                    if (btn === 'ok') {
                        text = text.toString().replaceAll(" ", "")
                            .replaceAll("，", ",");
                        if (mapFrame) {
                            if (pointType) {
                                mapFrame.window["AMap"].convertFrom([text.split(",")], pointType, function (status, result) {
                                    var lnglats = result.locations;
                                    var lnglat = lnglats[0];
                                    var record = pointStore.findRecord("gdPoint", lnglat.toString(), 0, false, false, true);
                                    if (record) {
                                        FastExt.Dialog.toast("坐标已存在！");
                                        return;
                                    }
                                    var data = {
                                        "gdPoint": lnglat.toString()
                                    };
                                    pointStore.add(data);
                                });
                            }
                            else {
                                var record = pointStore.findRecord("gdPoint", text, 0, false, false, true);
                                if (record) {
                                    FastExt.Dialog.toast("坐标已存在！");
                                    return;
                                }
                                var data = {
                                    "gdPoint": text
                                };
                                pointStore.add(data);
                            }
                        }
                    }
                });
            };
            var dataGridPoints = Ext.create('Ext.grid.Panel', {
                selModel: FastExt.Grid.getGridSelModel(),
                store: pointStore,
                columnLines: true,
                cellTip: true,
                columns: [
                    {
                        header: '高德坐标',
                        dataIndex: 'gdPoint',
                        align: 'center',
                        flex: 1,
                        field: {
                            xtype: 'textfield'
                        },
                        renderer: FastExt.Renders.normal()
                    }
                ],
                selType: 'cellmodel',
                tbar: [
                    {
                        xtype: 'button',
                        border: 1,
                        text: '删除',
                        iconCls: 'extIcon extDelete',
                        handler: function () {
                            var data = dataGridPoints.getSelectionModel().getSelection();
                            if (data.length === 0) {
                                FastExt.Dialog.toast("请您选择需要删除的坐标！");
                            }
                            else {
                                Ext.Msg.confirm("系统提醒", "您确定立即删除选中的坐标吗？", function (button, text) {
                                    if (button === "yes") {
                                        Ext.Array.each(data, function (record) {
                                            pointStore.remove(record);
                                        });
                                        dataGridPoints.getSelectionModel().deselectAll();
                                        FastExt.Dialog.toast("删除成功！");
                                    }
                                });
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        border: 1,
                        text: '添加高德坐标',
                        iconCls: 'extIcon extAdd',
                        handler: function () {
                            showInputPoint("添加高德坐标");
                        }
                    },
                    {
                        xtype: 'button',
                        border: 1,
                        text: '添加GPS坐标',
                        iconCls: 'extIcon extAdd',
                        handler: function () {
                            showInputPoint("添加GPS坐标", 'gps');
                        }
                    }
                ],
                listeners: {
                    selectionchange: function () {
                    }
                }
            });
            var win = Ext.create('Ext.window.Window', {
                title: "图层锚点管理",
                height: 300,
                width: 400,
                minWidth: 400,
                minHeight: 300,
                layout: 'fit',
                resizable: true,
                modal: true,
                constrain: true,
                iconCls: 'extIcon extFolder',
                animateTarget: obj,
                items: [dataGridPoints],
                buttons: [{
                        text: '确定',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            var data = [];
                            var jsonData = [];
                            pointStore.each(function (record, index) {
                                var gdPoint = record.get("gdPoint");
                                data.push(gdPoint);
                                jsonData.push({ "gdPoint": gdPoint });
                            });
                            if (mapFrame) {
                                mapFrame.pointDataArray = jsonData;
                                mapFrame.window.setAnchorPoints(data, true);
                            }
                            win.close();
                        }
                    }],
                listeners: {
                    close: function () {
                    }
                }
            });
            win.show();
        };
        /**
         * 在地图查看图层
         * @param obj 动画对象
         * @param imgUrl 图片地址
         * @param southWestLngLat 西南坐标，左下角度
         * @param northEastLngLat 东北坐标，右上角度
         * @return Ext.Promise
         */
        Map.showImgLayerInMap = function (obj, imgUrl, southWestLngLat, northEastLngLat) {
            return new Ext.Promise(function (resolve, reject) {
                var mapPanel = Ext.create('Ext.panel.Panel', {
                    layout: 'border',
                    region: 'center',
                    iframePanel: true,
                    border: 0
                });
                var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                var winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                var win = Ext.create('Ext.window.Window', {
                    title: '查看图层位置',
                    height: winHeight,
                    width: winWidth,
                    minHeight: 500,
                    minWidth: 600,
                    iconCls: 'extIcon extMap',
                    layout: 'fit',
                    resizable: true,
                    maximizable: true,
                    animateTarget: obj,
                    constrain: true,
                    items: [mapPanel],
                    modal: true,
                    listeners: {
                        show: function () {
                            var url = FastExt.System.formatUrlVersion('base/map/showRectangle.html', {
                                mapVersion: FastExt.System.getExt("amap-version").value,
                                mapKey: FastExt.System.getExt("amap-key").value
                            });
                            mapPanel.update("<iframe name='mapFrame'  src='" + url + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                        },
                        close: function (val) {
                            if (!resolve.called) {
                                resolve.called = true;
                                resolve();
                            }
                        }
                    }
                });
                win.show();
                window["onMapLoadDone"] = function () {
                    window["mapFrame"].window.showImgLayerInMap(imgUrl, southWestLngLat, northEastLngLat);
                };
                window["alert"] = function (msg) {
                    FastExt.Dialog.showAlert("系统提醒", msg);
                };
            });
        };
        return Map;
    }());
    FastExt.Map = Map;
})(FastExt || (FastExt = {}));
var FastExt;
(function (FastExt) {
    /**
     * Ext.menu.Menu 相关功能辅助
     */
    var Menu = /** @class */ (function () {
        function Menu() {
        }
        /**
         * 复制菜单
         * @param target 菜单对象
         */
        Menu.copyMenu = function (target) {
            var menus = [];
            target.items.each(function (item, index) {
                var child = {
                    icon: item.icon,
                    text: item.text,
                    handler: item.handler
                };
                if (item.getMenu() != null) {
                    child.menu = FastExt.Menu.copyMenu(item.getMenu());
                }
                menus.push(child);
            });
            return menus;
        };
        /**
         * 触发所有子菜单的自定义事件
         * @param menu
         * @param event
         */
        Menu.fireMenuEvent = function (menu, event) {
            if (menu) {
                menu.items.each(function (item, index) {
                    if (item.hasOwnProperty(event) && Ext.isFunction(item[event])) {
                        item[event]();
                    }
                    if (Ext.isFunction(item.getMenu)) {
                        FastExt.Menu.fireMenuEvent(item.getMenu(), event);
                    }
                });
            }
        };
        return Menu;
    }());
    FastExt.Menu = Menu;
})(FastExt || (FastExt = {}));
var FastOverrider;
(function (FastOverrider) {
    /**
     * 重写全局Ext的功能
     */
    var ExtOverrider = /** @class */ (function () {
        function ExtOverrider() {
            Ext.override(Ext, {
                getScrollbarSize: function (force) {
                    //<debug>
                    if (!Ext.isDomReady) {
                        Ext.raise("getScrollbarSize called before DomReady");
                    }
                    //</debug>
                    var scrollbarSize = Ext._scrollbarSize;
                    if (force || !scrollbarSize) {
                        var db = document.body, div = document.createElement('div');
                        div.style.width = div.style.height = '100px';
                        div.style.overflow = 'scroll';
                        div.style.position = 'absolute';
                        db.appendChild(div); // now we can measure the div...
                        // at least in iE9 the div is not 100px - the scrollbar size is removed!
                        Ext._scrollbarSize = scrollbarSize = {
                            width: div.offsetWidth - div.clientWidth,
                            height: div.offsetHeight - div.clientHeight
                        };
                        db.removeChild(div);
                    }
                    if (scrollbarSize.width <= 0) {
                        scrollbarSize.width = 15;
                    }
                    if (scrollbarSize.height <= 0) {
                        scrollbarSize.height = 15;
                    }
                    return scrollbarSize;
                }
            });
        }
        return ExtOverrider;
    }());
    FastOverrider.ExtOverrider = ExtOverrider;
    /**
     * 重写Ext.Component相关的功能，
     */
    var ComponentOverride = /** @class */ (function () {
        function ComponentOverride() {
            Ext.override(Ext.Component, {
                initComponent: Ext.Function.createSequence(Ext.Component.prototype.initComponent, function () {
                    var me = this;
                    try {
                        //取消blur和change验证，避免控件异常！
                        me.validateOnBlur = false;
                        me.validateOnChange = false;
                        me.closeToolText = "关闭";
                        me.collapseToolText = "关闭";
                        me.expandToolText = "展开";
                        if ((me.getXType() === "window" || me.getXType() === "panel")
                            && (!Ext.isEmpty(me.getTitle()) || !Ext.isEmpty(me.subtitle))
                            && (me.resizable || me.split)) {
                            var fastOnlyCode_1 = $.md5(me.getTitle() + me.subtitle + $("title").text());
                            try {
                                fastOnlyCode_1 = $.md5(fastOnlyCode_1 + me.width + me.height);
                            }
                            catch (e) {
                            }
                            var width = FastExt.Cache.getCache(fastOnlyCode_1 + "Width");
                            var height = FastExt.Cache.getCache(fastOnlyCode_1 + "Height");
                            var collapse = FastExt.Base.toBool(FastExt.Cache.getCache(fastOnlyCode_1 + "Collapse"), false);
                            if (width != null) {
                                me.setWidth(width);
                                me.setFlex(0);
                            }
                            if (height != null) {
                                me.setHeight(height);
                                me.setFlex(0);
                            }
                            me.collapsed = collapse;
                            me.setCollapsed(collapse);
                            me.on('resize', function (obj, width, height, eOpts) {
                                if (width !== Ext.getBody().getWidth()) {
                                    FastExt.Cache.setCache(fastOnlyCode_1 + "Width", width);
                                }
                                if (height !== Ext.getBody().getHeight()) {
                                    FastExt.Cache.setCache(fastOnlyCode_1 + "Height", height);
                                }
                            });
                            me.on('collapse', function (obj, width, height, eOpts) {
                                FastExt.Cache.setCache(fastOnlyCode_1 + "Collapse", true);
                            });
                            me.on('expand', function (obj, width, height, eOpts) {
                                FastExt.Cache.setCache(fastOnlyCode_1 + "Collapse", false);
                            });
                        }
                        if (me.getXType() === "menuitem") {
                            me.on('focus', function (obj, event, eOpts) {
                                if (obj.isDisabled()) {
                                    return;
                                }
                                var icon = obj.icon;
                                var regStr = /([^/]*.svg)/;
                                if (icon && regStr.test(icon)) {
                                    var newIcon = FastExt.Server.getIcon(regStr.exec(icon)[1].trim(), "#ffffff");
                                    var iconEl = Ext.get(obj.getId() + "-iconEl");
                                    if (iconEl) {
                                        iconEl.setStyle("background-image", "url(" + newIcon + ")");
                                    }
                                }
                            });
                            me.on('blur', function (obj, event, eOpts) {
                                if (obj.isDisabled()) {
                                    return;
                                }
                                var icon = obj.icon;
                                var regStr = /([^/]*.svg)/;
                                if (icon && regStr.test(icon)) {
                                    var iconEl = Ext.get(obj.getId() + "-iconEl");
                                    if (iconEl) {
                                        iconEl.setStyle("background-image", "url(" + icon + ")");
                                    }
                                }
                            });
                        }
                        if (FastExt.Base.toBool(me.iframePanel, false)) {
                            me.disabledCls = "iframe-disabled-panel";
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                })
            });
            Ext.override(Ext.Component, {
                show: function () {
                    try {
                        if (FastExt.System.isSystem()) {
                            if (this.getXType() === "window"
                                || this.getXType() === "messagebox") {
                                if (!FastExt.Base.toBool(this.sessionWin, false)) {
                                    //处理session弹窗
                                    if (FastExt.System.sessionOutAlert) {
                                        this.hide();
                                        return null;
                                    }
                                }
                            }
                        }
                        var me = this, rendered = me.rendered;
                        if (me.hierarchicallyHidden || (me.floating && !rendered && me.isHierarchicallyHidden())) {
                            if (!rendered) {
                                me.initHierarchyEvents();
                            }
                            if (arguments.length > 1) {
                                arguments[0] = null; // jshint ignore:line
                                me.pendingShow = arguments;
                            }
                            else {
                                me.pendingShow = true;
                            }
                        }
                        else if (rendered && me.isVisible()) {
                            if (me.floating) {
                                me.onFloatShow();
                            }
                        }
                        else {
                            if (me.fireEvent('beforeshow', me) !== false) {
                                me.hidden = false;
                                delete this.getInherited().hidden;
                                Ext.suspendLayouts();
                                if (!rendered && (me.autoRender || me.floating)) {
                                    me.doAutoRender();
                                    rendered = me.rendered;
                                }
                                if (rendered) {
                                    me.beforeShow();
                                    Ext.resumeLayouts();
                                    me.onShow.apply(me, arguments);
                                    me.afterShow.apply(me, arguments);
                                }
                                else {
                                    Ext.resumeLayouts(true);
                                }
                            }
                            else {
                                me.onShowVeto();
                            }
                        }
                        return me;
                    }
                    catch (e) {
                        console.error(e);
                    }
                    return this;
                }
            });
            Ext.override(Ext.Component, {
                onRender: Ext.Function.createSequence(Ext.Component.prototype.onRender, function () {
                    var me = this;
                    try {
                        if (FastExt.Power.isPower()) {
                            return;
                        }
                        if (me.help) {
                            var targetEl_1 = me.bodyEl;
                            if (!targetEl_1) {
                                targetEl_1 = me.el;
                            }
                            targetEl_1.on("mouseleave", function () {
                                if (me.helpTip) {
                                    me.helpTip.close();
                                }
                            });
                            targetEl_1.on("contextmenu", function () {
                                try {
                                    if (!window["getHelpContent"]) {
                                        return;
                                    }
                                    if (me.helpTip) {
                                        me.helpTip.close();
                                        return;
                                    }
                                    var anchor = me.helpAnchor;
                                    if (!anchor) {
                                        anchor = "left";
                                    }
                                    var anchorOffset = (me.getWidth() - 20) / 2;
                                    if (anchor === "left" || anchor === "right") {
                                        anchorOffset = (me.getHeight() - 20) / 2;
                                    }
                                    if (anchorOffset >= 280) {
                                        anchorOffset = 0;
                                    }
                                    me.helpTip = Ext.create('Ext.tip.ToolTip', {
                                        target: targetEl_1,
                                        resizable: true,
                                        anchor: anchor,
                                        anchorOffset: anchorOffset,
                                        autoHide: false,
                                        maxWidth: 400,
                                        closeAction: 'destroy',
                                        html: window["getHelpContent"](me.help),
                                        showDelay: 0,
                                        autoShow: true,
                                        listeners: {
                                            beforedestroy: function () {
                                                me.helpTip = null;
                                            },
                                            hide: function () {
                                                this.close();
                                            }
                                        }
                                    });
                                }
                                catch (e) {
                                    console.error(e);
                                }
                            });
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                })
            });
            Ext.override(Ext.Component, {
                onAlignToScroll: function () {
                },
                adjustPosition: function (x, y) {
                    var me = this, floatParentBox;
                    // Floating Components being positioned in their ownerCt have to be made absolute.
                    if (me.isContainedFloater()) {
                        floatParentBox = me.floatParent.getTargetEl().getViewRegion();
                        x += floatParentBox.left;
                        y += floatParentBox.top;
                    }
                    try {
                        if (me.pickerField) {
                            var winWidth = document.body.clientWidth;
                            var winHeight = document.body.clientHeight;
                            if (me.pickerField.xtype === "datefield") {
                                x = Math.min(me.pickerField.getX() + me.pickerField.getWidth(), winWidth - me.getWidth());
                                y = Math.min(me.pickerField.getY(), winHeight - me.getHeight());
                            }
                            else if (me.pickerField.xtype.indexOf("combo") !== -1) {
                                x = Math.min(me.pickerField.bodyEl.getX(), winWidth - me.getWidth());
                                y = Math.min(me.pickerField.getY() + me.pickerField.getHeight(), winHeight - me.getHeight());
                            }
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                    return {
                        x: x,
                        y: y
                    };
                }
            });
        }
        return ComponentOverride;
    }());
    FastOverrider.ComponentOverride = ComponentOverride;
    /**
     * 重写Ext.button.Button相关的功能，
     */
    var ButtonOverride = /** @class */ (function () {
        function ButtonOverride() {
            Ext.override(Ext.button.Button, {
                afterRender: Ext.Function.createSequence(Ext.button.Button.prototype.afterRender, function () {
                    try {
                        var me = this;
                        if (me.tipText) {
                            me.tip = new Ext.ToolTip({
                                target: me.el,
                                trackMouse: true,
                                renderTo: Ext.getBody(),
                                dismissDelay: 0,
                                html: me.tipText
                            });
                        }
                        var grid = me.up('grid,treepanel');
                        if (grid) {
                            if (!Ext.isEmpty(me.text)) {
                                //需要配置右键菜单
                                FastExt.Grid.addGridContextMenu(grid, FastExt.Button.buttonToMenuItem(me));
                            }
                            //需要检测grid选中项
                            FastExt.Button.buttonToBind(grid, me);
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                })
            });
        }
        return ButtonOverride;
    }());
    FastOverrider.ButtonOverride = ButtonOverride;
    /**
     * 重写Ext.grid.* 相关的功能
     */
    var GridOverride = /** @class */ (function () {
        function GridOverride() {
            Ext.override(Ext.grid.CellContext, {
                setRow: function (row) {
                    try {
                        var me = this, dataSource = me.view.dataSource;
                        if (row) { //解决row为null报错问题
                            // Row index passed
                            if (typeof row === 'number') {
                                me.rowIdx = Math.max(Math.min(row, dataSource.getCount() - 1), 0);
                                me.record = dataSource.getAt(row);
                            }
                            // row is a Record
                            else if (row.isModel) {
                                me.record = row;
                                me.rowIdx = dataSource.indexOf(row);
                            }
                            // row is a grid row, or Element wrapping row
                            else if (row.tagName || row.isElement) {
                                me.record = me.view.getRecord(row);
                                me.rowIdx = dataSource.indexOf(me.record);
                            }
                        }
                        return me;
                    }
                    catch (e) {
                        console.error(e);
                    }
                    return this;
                }
            });
            Ext.override(Ext.grid.column.Column, {
                afterRender: Ext.Function.createSequence(Ext.grid.column.Column.prototype.afterRender, function () {
                    try {
                        var me = this;
                        me.code = FastExt.Power.getPowerCode(me);
                        if (!me.renderer) {
                            me.renderer = FastExt.Renders.normal();
                        }
                        if (me.rendererFunction) {
                            me.renderer = eval(me.rendererFunction);
                        }
                        FastExt.Grid.configColumnProperty(me);
                    }
                    catch (e) {
                        console.error(e);
                    }
                })
            });
        }
        return GridOverride;
    }());
    FastOverrider.GridOverride = GridOverride;
    /**
     * 重写Ext.layout.* 相关的功能
     */
    var LayoutOverride = /** @class */ (function () {
        function LayoutOverride() {
            Ext.override(Ext.layout.container.Accordion, {
                nextCmp: function (cmp) {
                    var next = cmp.next();
                    if (next && next.isHidden()) {
                        return this.nextCmp(next);
                    }
                    return next;
                },
                prevCmp: function (cmp) {
                    var prev = cmp.prev();
                    if (prev && prev.isHidden()) {
                        return this.prevCmp(prev);
                    }
                    return prev;
                },
                onBeforeComponentCollapse: function (comp) {
                    try {
                        var me = this, owner = me.owner, toExpand = void 0, expanded = void 0, previousValue = void 0;
                        if (me.owner.items.getCount() === 1) {
                            return false;
                        }
                        if (!me.processing) {
                            me.processing = true;
                            previousValue = owner.deferLayouts;
                            owner.deferLayouts = true;
                            toExpand = me.nextCmp(comp) || me.prevCmp(comp);
                            if (toExpand.isHidden()) {
                                owner.deferLayouts = previousValue;
                                me.processing = false;
                                me.onBeforeComponentCollapse(toExpand);
                                return;
                            }
                            if (me.multi) {
                                owner.deferLayouts = previousValue;
                                me.processing = false;
                                return;
                            }
                            if (toExpand) {
                                toExpand.expand();
                            }
                            owner.deferLayouts = previousValue;
                            me.processing = false;
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            });
        }
        return LayoutOverride;
    }());
    FastOverrider.LayoutOverride = LayoutOverride;
    /**
     * 重写Ext.dom.* 相关的功能
     */
    var DomOverride = /** @class */ (function () {
        function DomOverride() {
            Ext.override(Ext.dom.Element, {
                syncContent: function (source) {
                    try {
                        source = Ext.getDom(source);
                        var sourceNodes = source.childNodes, sourceLen = sourceNodes.length, dest = this.dom, destNodes = dest.childNodes, destLen = destNodes.length, i = void 0, destNode = void 0, sourceNode = void 0, nodeType = void 0, newAttrs = void 0, attLen = void 0, attName = void 0, elData = dest._extData;
                        // Copy top node's attributes across. Use IE-specific method if possible.
                        // In IE10, there is a problem where the className will not get updated
                        // in the view, even though the className on the dom element is correct.
                        // See EXTJSIV-9462
                        if (Ext.isIE9m && dest.mergeAttributes) {
                            dest.mergeAttributes(source, true);
                            // EXTJSIV-6803. IE's mergeAttributes appears not to make the source's "src" value available until after the image is ready.
                            // So programmatically copy any src attribute.
                            dest.src = source.src;
                        }
                        else {
                            newAttrs = source.attributes;
                            attLen = newAttrs.length;
                            for (i = 0; i < attLen; i++) {
                                attName = newAttrs[i].name;
                                if (attName !== 'id') {
                                    dest.setAttribute(attName, newAttrs[i].value);
                                }
                            }
                        }
                        // The element's data is no longer synchronized. We just overwrite it in the DOM
                        if (elData) {
                            elData.isSynchronized = false;
                        }
                        // If the number of child nodes does not match, fall back to replacing innerHTML
                        if (sourceLen !== destLen) {
                            dest.innerHTML = source.innerHTML;
                            return;
                        }
                        // Loop through source nodes.
                        // If there are fewer, we must remove excess
                        for (i = 0; i < sourceLen; i++) {
                            sourceNode = sourceNodes[i];
                            destNode = destNodes[i];
                            nodeType = sourceNode.nodeType;
                            // If node structure is out of sync, just drop innerHTML in and return
                            if (nodeType !== destNode.nodeType || (nodeType === 1 && sourceNode.tagName !== destNode.tagName)) {
                                dest.innerHTML = source.innerHTML;
                                return;
                            }
                            // Update text node
                            if (nodeType === 3) {
                                destNode.data = sourceNode.data;
                            }
                            // Sync element content
                            else {
                                try {
                                    if (sourceNode.id && destNode.id !== sourceNode.id) {
                                        destNode.id = sourceNode.id;
                                    }
                                    destNode.style.cssText = sourceNode.style.cssText;
                                    destNode.className = sourceNode.className;
                                    Ext.fly(destNode, '_syncContent').syncContent(sourceNode);
                                }
                                catch (e) {
                                }
                            }
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            });
        }
        return DomOverride;
    }());
    FastOverrider.DomOverride = DomOverride;
    /**
     * 重写Ext.toolbar.* 相关的功能
     */
    var ToolbarOverride = /** @class */ (function () {
        function ToolbarOverride() {
            Ext.override(Ext.toolbar.Paging, {
                updateInfo: function () {
                    var me = this, displayItem = me.child('#displayItem'), store = me.store, pageData = me.getPageData(), count, msg;
                    if (displayItem) {
                        count = store.getCount();
                        if (count === 0) {
                            msg = me.emptyMsg;
                        }
                        else {
                            msg = Ext.String.format(me.displayMsg, pageData.fromRecord, pageData.toRecord, pageData.total);
                        }
                        if (store.grid) {
                            var selectCount = void 0;
                            if (store.grid.getSelectionModel && store.grid.getSelectionModel().selected
                                && !Ext.isEmpty(store.grid.getSelectionModel().selected.rangeEnd)
                                && !Ext.isEmpty(store.grid.getSelectionModel().selected.rangeStart)) {
                                selectCount = Math.abs(parseInt(store.grid.getSelectionModel().selected.rangeEnd) -
                                    parseInt(store.grid.getSelectionModel().selected.rangeStart)) + 1;
                            }
                            else {
                                selectCount = store.grid.getSelection().length;
                            }
                            if (selectCount > 0) {
                                msg = "选中" + selectCount + "行数据，" + msg;
                            }
                            store.grid.selectCount = selectCount;
                            if (Ext.isFunction(store.grid.refreshSelect)) {
                                store.grid.refreshSelect();
                            }
                            if (Ext.isFunction(store.grid.refreshDetailsPanel())) {
                                store.grid.refreshDetailsPanel();
                            }
                        }
                        displayItem.setText(msg);
                    }
                }
            });
        }
        return ToolbarOverride;
    }());
    FastOverrider.ToolbarOverride = ToolbarOverride;
    /**
     * 重写Ext.util.* 相关的功能
     */
    var UtilOverride = /** @class */ (function () {
        function UtilOverride() {
            Ext.override(Ext.util.Grouper, {
                sortFn: function (item1, item2) {
                    //取消分组排名
                    return 0;
                }
            });
        }
        return UtilOverride;
    }());
    FastOverrider.UtilOverride = UtilOverride;
    /**
     * 重写Ext.resizer.* 相关的功能
     */
    var ResizerOverride = /** @class */ (function () {
        function ResizerOverride() {
            Ext.override(Ext.resizer.Splitter, {
                onRender: function () {
                    var me = this;
                    me.collapseOnDblClick = false;
                    me.callParent(arguments);
                }
            });
        }
        return ResizerOverride;
    }());
    FastOverrider.ResizerOverride = ResizerOverride;
    /**
     * 重写Ext.dd.* 相关的功能
     */
    var DDOverride = /** @class */ (function () {
        function DDOverride() {
            Ext.override(Ext.dd.DragTracker, {
                onMouseDown: function (e) {
                    this.callParent(arguments);
                    var iframePanelArray = Ext.ComponentQuery.query("[iframePanel=true]");
                    for (var i = 0; i < iframePanelArray.length; i++) {
                        iframePanelArray[i].setDisabled(true);
                    }
                },
                endDrag: function (e) {
                    this.callParent(arguments);
                    var iframePanelArray = Ext.ComponentQuery.query("[iframePanel=true]");
                    for (var i = 0; i < iframePanelArray.length; i++) {
                        iframePanelArray[i].setDisabled(false);
                    }
                }
            });
        }
        return DDOverride;
    }());
    FastOverrider.DDOverride = DDOverride;
    /**
     *  重写Ext.form.* 相关的功能
     */
    var FormOverride = /** @class */ (function () {
        function FormOverride() {
            Ext.override(Ext.form.Basic, {
                submit: function (options) {
                    options = options || {};
                    var me = this, action;
                    options.submitEmptyText = false;
                    if (options.standardSubmit || me.standardSubmit) {
                        action = 'standardsubmit';
                    }
                    else {
                        action = me.api ? 'directsubmit' : 'submit';
                    }
                    return me.doAction(action, options);
                },
                isValid: function () {
                    try {
                        var me = this, invalid = void 0;
                        Ext.suspendLayouts();
                        var fieldName_1 = "";
                        var index_1 = 0;
                        var errorInfo_1 = "请正确填写数据！";
                        invalid = me.getFields().filterBy(function (field) {
                            var v = !field.validate();
                            if (v && index_1 === 0) {
                                fieldName_1 = field.getFieldLabel();
                                errorInfo_1 = field.getErrors()[0];
                                index_1++;
                            }
                            return v;
                        });
                        Ext.resumeLayouts(true);
                        var result = invalid.length < 1;
                        if (!result) {
                            if (Ext.isEmpty(fieldName_1)) {
                                FastExt.Dialog.toast("请将数据填写完整！");
                            }
                            else if (!Ext.isEmpty(errorInfo_1)) {
                                FastExt.Dialog.toast("【" + fieldName_1 + "】错误：" + errorInfo_1);
                            }
                            else {
                                FastExt.Dialog.toast("【" + fieldName_1 + "】错误！");
                            }
                            FastExt.Component.shakeComment(me.owner.ownerCt);
                        }
                        return result;
                    }
                    catch (e) {
                        FastExt.Dialog.showException(e);
                    }
                }
            });
            Ext.override(Ext.form.field.Date, {
                parseDate: function (value) {
                    if (!value || Ext.isDate(value)) {
                        return value;
                    }
                    //先猜测一下日期格式
                    var guessFormat = FastExt.Base.guessDateFormat(value);
                    if (guessFormat) {
                        this.format = guessFormat;
                    }
                    var me = this, val = me.safeParse(value, me.format), altFormats = me.altFormats, altFormatsArray = me.altFormatsArray, i = 0, len;
                    if (!val && altFormats) {
                        altFormatsArray = altFormatsArray || altFormats.split('|');
                        len = altFormatsArray.length;
                        for (; i < len && !val; ++i) {
                            val = me.safeParse(value, altFormatsArray[i]);
                        }
                    }
                    return val;
                },
                initComponent: Ext.Function.createSequence(Ext.form.field.Date.prototype.initComponent, function () {
                    if (FastExt.System.isSystem()) {
                        if (!this.format) {
                            this.format = FastExt.System.dateFormat;
                        }
                        if (this.format === 'y-m-d') {
                            this.format = FastExt.System.dateFormat;
                        }
                        //修改日期picker弹出方式
                        this.pickerAlign = "tl-tr?";
                    }
                })
            });
            Ext.override(Ext.form.field.File, {
                onRender: Ext.Function.createSequence(Ext.form.field.File.prototype.onRender, function () {
                    var me = this;
                    if (me.multiple) {
                        me.fileInputEl.dom.setAttribute("multiple", "multiple");
                    }
                })
            });
            Ext.override(Ext.form.field.Time, {
                initComponent: Ext.Function.createSequence(Ext.form.field.Time.prototype.initComponent, function () {
                    this.invalidText = "无效的时间格式!";
                })
            });
            Ext.override(Ext.form.field.Text, {
                initComponent: Ext.Function.createSequence(Ext.form.field.Text.prototype.initComponent, function () {
                    var me = this;
                    if (me.inputType === 'password') {
                        me.setTriggers({
                            eayOpen: {
                                cls: 'extIcon extEye editColor',
                                hidden: true,
                                handler: function () {
                                    if (me.up("menu")) {
                                        me.up("menu").holdShow = true;
                                    }
                                    this.getTrigger('eayOpen').hide();
                                    this.getTrigger('eayClose').show();
                                    var inputObj = document.getElementById(this.getInputId());
                                    inputObj.blur();
                                    inputObj.setAttribute("type", "password");
                                    setTimeout(function () {
                                        FastExt.Base.inputFocusEnd(inputObj);
                                        if (me.up("menu")) {
                                            me.up("menu").holdShow = false;
                                        }
                                    }, 100);
                                }
                            },
                            eayClose: {
                                cls: 'extIcon extEye',
                                handler: function () {
                                    if (me.up("menu")) {
                                        me.up("menu").holdShow = true;
                                    }
                                    this.getTrigger('eayOpen').show();
                                    this.getTrigger('eayClose').hide();
                                    var inputObj = document.getElementById(this.getInputId());
                                    inputObj.blur();
                                    inputObj.setAttribute("type", "text");
                                    setTimeout(function () {
                                        FastExt.Base.inputFocusEnd(inputObj);
                                        if (me.up("menu")) {
                                            me.up("menu").holdShow = false;
                                        }
                                    }, 100);
                                }
                            }
                        });
                    }
                })
            });
        }
        return FormOverride;
    }());
    FastOverrider.FormOverride = FormOverride;
    /**
     * 重写组件的权限配置
     */
    var PowerComponentOverride = /** @class */ (function () {
        function PowerComponentOverride() {
            Ext.override(Ext.Component, {
                afterRender: Ext.Function.createSequence(Ext.Component.prototype.afterRender, function () {
                    if (!FastExt.System.isSystem()) {
                        return;
                    }
                    var me = this;
                    me.power = FastExt.Base.toBool(me.power, true);
                    if (!me.power) {
                        return;
                    }
                    if (me.up("[power=false]")) {
                        return;
                    }
                    if (me.power && (me.getXTypes().indexOf("field/") > 0 || Ext.Array.contains(FastExt.Power.types, me.getXType()))) {
                        me.code = FastExt.Power.getPowerCode(me);
                        if (me.code) {
                            me.managerPower = FastExt.Power.checkManagerPower(me);
                            FastExt.Power.setPower(me.code, FastExt.Base.copy(me.managerPower));
                            if (!FastExt.Power.hasPower(me, 'show')) {
                                me.hideable = false;
                                me.setHidden(true);
                                me.setDisabled(true);
                                me.clearListeners();
                                if (Ext.isFunction(me.collapse)) {
                                    me.collapse();
                                }
                            }
                            else if (!FastExt.Power.hasPower(me, 'edit')) {
                                me.editable = false;
                                if (Ext.isFunction(me.setReadOnly)) {
                                    me.setReadOnly(true);
                                }
                            }
                            if (FastExt.Power.config) {
                                me.powerConfig = FastExt.Power.checkPower(me.code);
                                FastExt.Power.setPowerStyle(me);
                                me.getEl().on('contextmenu', function (e, t, eOpts) {
                                    e.stopEvent();
                                    FastExt.Power.showPowerConfig(me, e);
                                });
                            }
                        }
                    }
                })
            });
            Ext.override(Ext.Component, {
                setDisabled: function (disabled) {
                    if (FastExt.Power.config) {
                        return this['enable']();
                    }
                    return this[disabled ? 'disable' : 'enable']();
                }
            });
            Ext.override(Ext.form.field.Base, {
                markInvalid: function (errors) {
                    if (FastExt.Power.config) {
                        return;
                    }
                    var me = this, ariaDom = me.ariaEl.dom, oldMsg = me.getActiveError(), active;
                    me.setActiveErrors(Ext.Array.from(errors));
                    active = me.getActiveError();
                    if (oldMsg !== active) {
                        me.setError(active);
                        if (!me.ariaStaticRoles[me.ariaRole] && ariaDom) {
                            ariaDom.setAttribute('aria-invalid', true);
                        }
                    }
                }
            });
        }
        return PowerComponentOverride;
    }());
    FastOverrider.PowerComponentOverride = PowerComponentOverride;
    /**
     * 重写Ext.menu.Menu相关的功能
     */
    var MenuOverride = /** @class */ (function () {
        function MenuOverride() {
            Ext.override(Ext.menu.Menu, {
                hide: function () {
                    if (!FastExt.System.isSystem()) {
                        return;
                    }
                    var me = this;
                    if (!me.powerMenu) {
                        if (FastExt.Power.menuShowing) {
                            return;
                        }
                    }
                    if (me.holdShow) {
                        return;
                    }
                    if (me.pendingShow) {
                        me.pendingShow = false;
                    }
                    if (!(me.rendered && !me.isVisible())) {
                        if (!me.hasListeners.beforehide || me.fireEvent('beforehide', me) !== false || me.hierarchicallyHidden) {
                            me.getInherited().hidden = me.hidden = true;
                            me.fireHierarchyEvent('beforehide');
                            if (me.rendered) {
                                me.onHide.apply(me, arguments);
                            }
                        }
                    }
                    return me;
                }
            });
        }
        return MenuOverride;
    }());
    FastOverrider.MenuOverride = MenuOverride;
    /**
     * 重写Ext.Window相关的功能
     */
    var WindowOverride = /** @class */ (function () {
        function WindowOverride() {
            Ext.override(Ext.Window, {
                initComponent: Ext.Function.createSequence(Ext.Window.prototype.initComponent, function () {
                    try {
                        if (!eval(FastExt.System.getExt("window-anim").value)) {
                            this.animateTarget = null;
                        }
                        var regStr = /([^/]*.svg)/;
                        if (this.icon && regStr.test(this.icon)) {
                            this.icon = FastExt.Server.getIcon(regStr.exec(this.icon)[1].trim(), "#ffffff");
                        }
                        this.liveDrag = true;
                        this.on("show", function (obj) {
                            obj.toFront(true);
                            obj.focus();
                        });
                    }
                    catch (e) {
                        console.error(e);
                    }
                })
            });
            Ext.override(Ext.window.Window, {
                setIcon: Ext.Function.createSequence(Ext.window.Window.prototype.setIcon, function (value) {
                    var me = this;
                    var regStr = /([^/]*.svg)/;
                    if (value && regStr.test(value)) {
                        me.icon = FastExt.Server.getIcon(regStr.exec(value)[1].trim(), "#ffffff");
                    }
                })
            });
        }
        return WindowOverride;
    }());
    FastOverrider.WindowOverride = WindowOverride;
    for (var subClass in FastOverrider) {
        FastOverrider[subClass]();
    }
})(FastOverrider || (FastOverrider = {}));
var FastExt;
(function (FastExt) {
    var Power = /** @class */ (function () {
        function Power() {
        }
        /**
         * 是否正在进行权限配置操作
         */
        Power.isPower = function () {
            return window["isPower"]();
        };
        /**
         * 判断目标组件是否有指定权限值
         * @param target
         * @param type
         */
        Power.hasPower = function (target, type) {
            if (target.managerPower) {
                if (target.managerPower.hasOwnProperty(type)) {
                    return target.managerPower[type];
                }
            }
            return true;
        };
        /**
         * 检查权限
         * @param code
         */
        Power.checkPower = function (code) {
            var me = this;
            if (!me.powers[code]) {
                me.powers[code] = FastExt.Base.copy(me.defaultPower);
            }
            var powerConfig = me.powers[code];
            if (!Ext.isEmpty(powerConfig)) {
                for (var defaultPowerKey in me.defaultPower) {
                    if (!powerConfig.hasOwnProperty(defaultPowerKey)) {
                        powerConfig[defaultPowerKey] = me.defaultPower[defaultPowerKey];
                    }
                }
            }
            return powerConfig;
        };
        /**
         * 获取管理员的目标组件权限
         * @param target
         */
        Power.checkManagerPower = function (target) {
            if (!FastExt.System.manager) {
                return null;
            }
            if (!FastExt.System.managerPowers) {
                if (Ext.isEmpty(FastExt.System.manager.managerExtPower) || FastExt.System.manager.role.roleType === 0) {
                    return null;
                }
            }
            if (!FastExt.System.managerPowers) {
                FastExt.System.managerPowers = FastExt.Json.jsonToObject(FastExt.System.manager.managerExtPower);
            }
            if (!FastExt.System.managerPowers) {
                FastExt.System.managerPowers = {};
            }
            var powerConfig = FastExt.System.managerPowers[target.code];
            if (!powerConfig) {
                powerConfig = FastExt.Base.copy(FastExt.Power.defaultPower);
            }
            for (var defaultPowerKey in FastExt.Power.defaultPower) {
                if (!powerConfig.hasOwnProperty(defaultPowerKey)) {
                    powerConfig[defaultPowerKey] = FastExt.Power.defaultPower[defaultPowerKey];
                }
            }
            return powerConfig;
        };
        /**
         * 添加权限配置
         * @param code 唯一编号
         * @param config 配置
         * @see {@link FastExt.PowerSet}
         */
        Power.pushPower = function (code, config) {
            var me = this;
            me.powers[code] = config;
        };
        /**
         * 设置权限配置
         * @param code 唯一编号
         * @param config 配置
         * @see {@link FastExt.PowerSet}
         */
        Power.setPower = function (code, config) {
            var me = this;
            if (!me.powers[code]) {
                me.powers[code] = config;
            }
        };
        /**
         * 获取保存权限配置的值
         */
        Power.savePower = function () {
            var me = this;
            var data = me.powers;
            return Ext.encode(data);
        };
        /**
         * 获取组件的唯一权限编号
         * @param obj
         */
        Power.getPowerCode = function (obj) {
            if (obj != null) {
                var buildText = null;
                if (Ext.isFunction(obj.up)) {
                    var window_1 = obj.up("window");
                    if (window_1) {
                        buildText = window_1.getTitle();
                    }
                }
                if (obj.name) {
                    buildText += obj.name;
                }
                if (obj.title) {
                    buildText += obj.title;
                }
                if (obj.text) {
                    buildText += obj.text;
                }
                if (obj.subtext) {
                    buildText += obj.subtext;
                }
                if (obj.dataIndex) {
                    buildText += obj.dataIndex;
                }
                if (Ext.isFunction(obj.getFieldLabel) && Ext.isEmpty(obj.getFieldLabel())) {
                    buildText += obj.getFieldLabel();
                }
                if (buildText) {
                    return $.md5(buildText);
                }
            }
            return null;
        };
        /**
         * 设置权限状态下的样式
         */
        Power.setPowerStyle = function (target) {
            var query = Ext.all("[code=" + target.code + "]");
            Ext.each(query, function (item, index) {
                var powerConfig = FastExt.Power.checkPower(target.code);
                if (powerConfig) {
                    if (!powerConfig.show) {
                        item.addCls("no-show-power");
                    }
                    else {
                        item.removeCls("no-show-power");
                        if (!powerConfig.edit) {
                            item.addCls("no-edit-power");
                        }
                        else {
                            item.removeCls("no-edit-power");
                        }
                    }
                }
            });
        };
        /**
         * 弹出组件的权限配置菜单
         * @param target
         * @param e
         */
        Power.showPowerConfig = function (target, e) {
            if (!FastExt.System.isSystem()) {
                return;
            }
            var powerConfig = FastExt.Power.checkPower(target.code);
            FastExt.Power.menuShowing = true;
            var panel = Ext.create('Ext.panel.Panel', {
                layout: {
                    type: 'vbox',
                    pack: 'center'
                },
                border: 0,
                defaults: {
                    height: 20,
                    power: false
                },
                items: [
                    {
                        xtype: 'checkbox',
                        name: 'updateAlert',
                        checked: true,
                        boxLabel: '允许显示',
                        value: powerConfig.show,
                        listeners: {
                            change: function (obj, newValue, oldValue, eOpts) {
                                powerConfig.show = newValue;
                                FastExt.Power.setPowerStyle(target);
                            }
                        }
                    },
                    {
                        xtype: 'checkbox',
                        name: 'updateAlert',
                        checked: true,
                        boxLabel: '允许编辑',
                        hidden: !FastExt.Grid.isColumnType(target),
                        value: powerConfig.edit,
                        listeners: {
                            change: function (obj, newValue, oldValue, eOpts) {
                                powerConfig.edit = newValue;
                                FastExt.Power.setPowerStyle(target);
                            }
                        }
                    }
                ]
            });
            var contextMenu = new Ext.menu.Menu({
                padding: '0 0 0 10',
                powerMenu: true,
                style: {
                    background: "#ffffff"
                },
                items: [panel],
                listeners: {
                    beforehide: function (obj, eOpts) {
                        FastExt.Power.menuShowing = false;
                        FastExt.Power.pushPower(target.code, powerConfig);
                    }
                }
            });
            contextMenu.showAt(e.getXY());
        };
        /**
         * 允许进行权限配置的类型
         *  @see {@link FastEnum.PowerType}
         */
        Power.types = [FastEnum.PowerType.gridcolumn, FastEnum.PowerType.menuitem, FastEnum.PowerType.button];
        /**
         * 是否正在进行配置权限
         */
        Power.config = false;
        /**
         * 权限菜单是否已打开
         */
        Power.menuShowing = false;
        /**
         * 组件权限的集合
         */
        Power.powers = [];
        return Power;
    }());
    FastExt.Power = Power;
    /**
     * 权限设置类
     */
    var PowerSet = /** @class */ (function () {
        function PowerSet() {
            this._show = true;
            this._edit = true;
        }
        Object.defineProperty(PowerSet.prototype, "show", {
            /**
             * 是否允许显示
             */
            get: function () {
                return this._show;
            },
            /**
             * 是否允许显示
             */
            set: function (value) {
                this._show = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PowerSet.prototype, "edit", {
            /**
             * 是否允许编辑
             */
            get: function () {
                return this._edit;
            },
            /**
             * 是否允许编辑
             */
            set: function (value) {
                this._edit = value;
            },
            enumerable: false,
            configurable: true
        });
        return PowerSet;
    }());
    FastExt.PowerSet = PowerSet;
})(FastExt || (FastExt = {}));
var FastExt;
(function (FastExt) {
    /**
     * 数据渲染器，支持column或符合格式的数据
     */
    var Renders = /** @class */ (function () {
        function Renders() {
        }
        /**
         * 常规的渲染
         * @param append 追加的单位或其他字符
         * @param position 字符追加的位置
         * @see FastEnum.AppendPosition
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.normal = function (append, position) {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (Ext.isEmpty(val)) {
                    return "<span style='color: #ccc;'>无</span>";
                }
                if (!append) {
                    append = "";
                }
                if (!Ext.isEmpty(position)) {
                    if (position === "left" || position === "l" || FastExt.Base.toBool(position, false)) {
                        val = append + val;
                    }
                    if (position === "right" || position === "r") {
                        val = val + append;
                    }
                }
                else {
                    val = val + append;
                }
                if (details) {
                    return val.replace(new RegExp("\n", 'g'), "<br/>")
                        .replace(new RegExp("\t", 'g'), "&nbsp;&nbsp;&nbsp;&nbsp;")
                        .replace(new RegExp(" ", 'g'), "&nbsp;");
                }
                return val;
            };
        };
        /**
         * 价格或金钱格式渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.money = function () {
            return function (val) {
                if (Ext.isEmpty(val)) {
                    return "<span style='color: #ccc;'>无</span>";
                }
                return "￥" + val;
            };
        };
        /**
         * 纯文本渲染器
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.text = function () {
            return function (val) {
                if (Ext.isEmpty(val)) {
                    return "<span style='color: #ccc;'>无</span>";
                }
                val = val.replace(/<\/?.+?>/g, "");
                return "<span style='white-space: pre;'>" + val + "</span>";
            };
        };
        /**
         * 图片数据渲染
         * @param height 设置渲染图片的高度
         * @param width 设置渲染图片的宽度
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.image = function (height, width) {
            return function (val) {
                try {
                    var imageHeight = "14px";
                    var imageWidth = "auto";
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<img style='object-fit: cover; border:1px solid #cccccc;height:" + imageHeight + ";'" +
                            " src='images/default_img.png'   alt='' />";
                    }
                    if (val.startWith("//")) {
                        val = "http:" + val;
                    }
                    try {
                        if (height) {
                            imageHeight = height + "px";
                        }
                        if (width) {
                            imageWidth = width + "px";
                        }
                    }
                    catch (e) {
                    }
                    var arrayInfo = val.split("@");
                    var url = arrayInfo[0];
                    var dataId = $.md5(url);
                    window[dataId] = "<img  alt=''" +
                        " style='object-fit: cover;border:1px solid #cccccc;width: 100px; min-height:14px;  ' " +
                        " width='100' " +
                        " class='lazyload'" +
                        " onerror=\"javascript:this.src = 'images/default_img.png';\"" +
                        " src='" + url + "' />";
                    return "<img class='lazyload' " +
                        " alt=''" +
                        " details-id='" + dataId + "' " +
                        " style='object-fit: cover;border:1px solid #cccccc;height:" + imageHeight + ";width: " + imageWidth + "; min-width:14px; min-height:14px; '" +
                        " width='" + imageWidth.replace("px", "") + "'" +
                        " height='" + imageHeight.replace("px", "") + "' " +
                        " onclick=\"showImage(this,'" + url + "')\"  " +
                        " onerror=\"javascript:this.src = 'images/default_img.png';\"" +
                        " src='" + url + "' " +
                        " />";
                    // return "<img height='10px' width='10px' src='" + url + "'/>";
                }
                catch (e) {
                    console.error(e);
                    return "<span style='color: #ccc;'>暂无图片</span>";
                }
            };
        };
        /**
         * MP4视频渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.mp4 = function () {
            return function (val, m, record) {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
                var arrayInfo = val.split("@");
                var url = arrayInfo[0];
                var name = url.substring(url.lastIndexOf("/") + 1);
                if (arrayInfo.length > 1) {
                    name = arrayInfo[1];
                }
                return "&nbsp;<a href=\"javascript:showVideo(this,'" + FastExt.System.formatUrlVersion(url) + "');\" >" + "<span style='margin-right: 5px;'>" + FastExt.Base.getSVGIcon("extFileMP4") + "</span>" + name + "</a>&nbsp;";
            };
        };
        /**
         * word、excel、pdf等office办公软件渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.office = function () {
            return function (val, m, record) {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
                var arrayInfo = val.split("@");
                var url = arrayInfo[0];
                var name = url.substring(url.lastIndexOf("/") + 1);
                if (arrayInfo.length > 1) {
                    name = arrayInfo[1];
                }
                var fileClassName = FastExt.Base.getSVGClassName(name);
                var viewerUrl = "https://view.officeapps.live.com/op/view.aspx?src=" + FastExt.System.formatUrlVersion(url);
                var viewStr = "&nbsp;<a href=\"" + viewerUrl + "\" target='_blank' >在线预览</a>&nbsp;";
                return viewStr + "&nbsp;<a href=\"" + FastExt.System.formatUrlVersion(url) + "\" target='_blank' >" + "<span style='margin-right: 5px;'>" + FastExt.Base.getSVGIcon(fileClassName) + "</span>" + name + "</a>&nbsp;";
            };
        };
        /**
         * 文件数据渲染
         * @param fileNameAttr 文件名称的属性，只对record有效
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.file = function (fileNameAttr) {
            return function (val, m, record) {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
                var arrayInfo = val.split("@");
                var url = arrayInfo[0];
                var name = url.substring(url.lastIndexOf("/") + 1);
                if (arrayInfo.length > 1) {
                    name = arrayInfo[1];
                }
                if (!Ext.isEmpty(fileNameAttr)) {
                    name = record.get(fileNameAttr);
                }
                if (FastExt.FileModule.image().reg.test(name)) {
                    return FastExt.Renders.image()(val);
                }
                if (FastExt.FileModule.mp4().reg.test(name)) {
                    return FastExt.Renders.mp4()(val);
                }
                if (FastExt.FileModule.pdf().reg.test(name) || FastExt.FileModule.word().reg.test(name) || FastExt.FileModule.excel().reg.test(name) || FastExt.FileModule.ppt().reg.test(name)) {
                    return FastExt.Renders.office()(val);
                }
                var fileClassName = FastExt.Base.getSVGClassName(name);
                return "&nbsp;<a href=\"" + FastExt.System.formatUrlVersion(url) + "\" target='_blank' >" + "<span style='margin-right: 5px;'>" + FastExt.Base.getSVGIcon(fileClassName) + "</span>" + name + "</a>&nbsp;";
            };
        };
        /**
         * 多文件渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.files = function () {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>暂无文件</span>";
                    }
                    var data = val;
                    if (Ext.isString(val)) {
                        if (!Ext.isEmpty(val)) {
                            try {
                                data = Ext.decode(val);
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                    if (data.length === 0) {
                        return "<span style='color: #ccc;'>暂无文件</span>";
                    }
                    var dataId = $.md5(JSON.stringify(data));
                    var detailsList = "";
                    for (var i = 0; i < data.length; i++) {
                        detailsList += "<div style='margin: 5px;'>" + FastExt.Renders.file()(data[i]) + "</div>";
                    }
                    if (details) {
                        return detailsList;
                    }
                    FastExt.Cache.memory[dataId] = detailsList;
                    var functionStr = "showAlert('查看文件',MemoryCache['" + dataId + "'],null,false)";
                    var html = "&nbsp;<a href=\"javascript:" + functionStr + ";\">共有" + data.length + "个文件！</a>&nbsp;";
                    var detailsId = $.md5(html);
                    window[detailsId] = detailsList;
                    return html;
                }
                catch (e) {
                    console.error(e);
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
            };
        };
        /**
         * 多图片渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.images = function () {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>暂无图片</span>";
                    }
                    var data = val;
                    if (Ext.isString(val)) {
                        if (!Ext.isEmpty(val)) {
                            try {
                                data = Ext.decode(val);
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                    if (data.length === 0) {
                        return "<span style='color: #ccc;'>暂无图片</span>";
                    }
                    var dataId = $.md5(JSON.stringify(data));
                    var detailsList = "";
                    var urlArray = [];
                    for (var i = 0; i < data.length; i++) {
                        detailsList += FastExt.Renders.image(24)(data[i]) + "&nbsp;&nbsp;";
                        urlArray.push({ url: data[i] });
                    }
                    if (details) {
                        return detailsList;
                    }
                    FastExt.Cache.memory[dataId] = urlArray;
                    var functionStr = "showImage(null,MemoryCache['" + dataId + "'])";
                    var html = "<a href=\"javascript:" + functionStr + ";\" details-id='" + dataId + "' style='color: #4279fa;'>共有" + data.length + "张图片！</a>";
                    window[dataId] = detailsList;
                    return html;
                }
                catch (e) {
                    console.error(e);
                    return "<span style='color: #ccc;'>暂无图片</span>";
                }
            };
        };
        /**
         * 网页内容渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.html = function () {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }
                var key = $.md5(val);
                FastExt.Cache.memory[key] = val;
                var functionStr = "showEditorHtml(this,'查看内容',MemoryCache['" + key + "'])";
                return "&nbsp;<a href=\"javascript:" + functionStr + ";\">查看内容</a>&nbsp;";
            };
        };
        /**
         * 网页内容渲染为存文本格式
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.html2 = function () {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }
                if (details) {
                    return val;
                }
                val = val
                    .replace(/[&\|\\\*^%$'"#@\-]/g, "")
                    .replace(new RegExp("\n", 'g'), "")
                    .replace(new RegExp("\t", 'g'), "")
                    .replace(new RegExp(" ", 'g'), "")
                    .replace(/<\/?.+?>/g, "");
                return val;
            };
        };
        /**
         * 渲染关联实体格式
         * @param name 关联的属性
         * @param entityCode 实体编号
         * @param entityId 实体ID属性
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.link = function (name, entityCode, entityId) {
            return function (val, m, record) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    var keyValue = record.get(name);
                    var functionStr = "new " + entityCode + "().showDetails(null, {'t." + entityId + "':'" + keyValue + "'})";
                    return "&nbsp;<a href=\"javascript:" + functionStr + ";\" >" + val + "</a>&nbsp;";
                }
                catch (e) {
                    console.error(e);
                    return "<span style='color: #ccc;'>无</span>";
                }
            };
        };
        /**
         * 渲染target格式的数据
         * @param targetId 目标ID
         * @param targetType 目标类型
         * @param targetFunction 获取目标实体的函数。默认为：getTargetEntity
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.target = function (targetId, targetType, targetFunction) {
            return function (val, m, record) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    if (!targetFunction) {
                        targetFunction = "getTargetEntity";
                    }
                    if (!Ext.isFunction(window[targetFunction])) {
                        return val;
                    }
                    var targetTypeValue = record.get(targetType);
                    var targetIdValue = record.get(targetId);
                    var targetEntity = window[targetFunction](targetTypeValue, targetType);
                    if (targetEntity) {
                        var functionStr = "new " + targetEntity.entityCode + "().showDetails(null, {'t." + targetEntity.entityId + "':'" + targetIdValue + "'})";
                        return "&nbsp;<a href=\"javascript:" + functionStr + ";\" >" + val + "</a>&nbsp;";
                    }
                    return val;
                }
                catch (e) {
                    console.error(e);
                    return "<span style='color: #ccc;'>无</span>";
                }
            };
        };
        /**
         * 渲染地图格式的数据
         * @param lngName 经度属性名
         * @param latName 纬度属性名
         * @param titleName 链接的标题属性名
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.map = function (lngName, latName, titleName) {
            return function (val, m, record) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    var lng = record.get(lngName);
                    var lat = record.get(latName);
                    var mapTitle = record.get(titleName);
                    if (lng && lat) {
                        var lnglat = lng + "," + lat;
                        var functionStr = "showAddressInMap(null,'" + lnglat + "','')";
                        if (mapTitle) {
                            functionStr = "showAddressInMap(null,'" + lnglat + "','" + mapTitle + "')";
                        }
                        return "&nbsp;<a href=\"javascript:" + functionStr + ";\" >" + val + "</a>&nbsp;";
                    }
                    return val;
                }
                catch (e) {
                    return "<span style='color: #ccc;'>无</span>";
                }
            };
        };
        /**
         * 渲染图层格式的数据
         * @param imgUrlName 图层图片的地址 数据属性名
         * @param southWestLngLatName 西南角度经纬度（左下角）
         * @param northEastLngLatName 东北角度经纬度 （右上角）
         * @param rotateName 图片旋转的角度
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.mapImgLayer = function (imgUrlName, southWestLngLatName, northEastLngLatName, rotateName) {
            return function (val, m, record) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    var imgUrl = record.get(imgUrlName);
                    var southWestLngLat = record.get(southWestLngLatName);
                    var northEastLngLat = record.get(northEastLngLatName);
                    var rotate = record.get(rotateName);
                    if (rotate) {
                        imgUrl = FastExt.Image.rotateOSSImgUrl(imgUrl, rotate);
                    }
                    if (imgUrl && southWestLngLat && northEastLngLat) {
                        var functionStr = "showImgLayer(null,'" + imgUrl + "','" + southWestLngLat + "','" + northEastLngLat + "')";
                        return "&nbsp;<a href=\"javascript:" + functionStr + ";\" >" + val + "</a>&nbsp;";
                    }
                    return val;
                }
                catch (e) {
                    return "<span style='color: #ccc;'>无</span>";
                }
            };
        };
        /**
         * 将数据以密码格式渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.password = function () {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (Ext.isEmpty(val)) {
                    return "<span style='color: #ccc;'>无</span>";
                }
                return "<span>******</span>";
            };
        };
        /**
         * 将数据以超链接格式渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.href = function () {
            return function (val, m, record) {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }
                return "&nbsp;<a href='" + val + "' target='_blank'>" + val + "</a>&nbsp;";
            };
        };
        /**
         * 将数据格式为单位大小后渲染，例如10kb
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.fileSize = function () {
            return function (val, m, record) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    if (val >= 1024 * 1024) {
                        return (val / 1024.0 / 1024.0).toFixed(2) + "M";
                    }
                    if (val >= 1024) {
                        return (val / 1024.0).toFixed(2) + "KB";
                    }
                    return val + "B";
                }
                catch (e) {
                    console.error(e);
                    return "<span style='color: #ccc;'>无</span>";
                }
            };
        };
        /**
         * 将毫秒格式的数据格式渲染，例如：1秒或1分20秒
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.duration = function () {
            return function (val, m, record) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    var seconds = parseInt(val) / 1000;
                    var hour = parseInt((seconds / (60 * 60)).toString());
                    var minute = parseInt(((seconds / 60) % 60).toString());
                    var second = parseInt((seconds % 60).toString());
                    if (hour > 0) {
                        return hour + "时" + minute + "分" + second + "秒";
                    }
                    if (minute > 0) {
                        return minute + "分" + second + "秒";
                    }
                    return second + "秒";
                }
                catch (e) {
                    console.error(e);
                    return "<span style='color: #ccc;'>无</span>";
                }
            };
        };
        /**
         * 将日期数据进行格式化
         * @param format
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.dateFormat = function (format) {
            return function (val, m, record) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    if (Ext.isEmpty(format)) {
                        format = "Y-m-d H:i:s";
                    }
                    var dateFormat = FastExt.Base.guessDateFormat(val);
                    return Ext.Date.format(Ext.Date.parse(val, dateFormat), format);
                }
                catch (e) {
                    console.error(e);
                    return val;
                }
            };
        };
        /**
         * 渲染枚举数据
         * @param enumName 枚举名称
         * @param enumValue 枚举值的属性名
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        Renders.enum = function (enumName, enumValue) {
            return function (val) {
                try {
                    if (Ext.isEmpty(val)) {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    var enumRecord = FastExt.Store.getEnumRecord(enumName, val, enumValue);
                    if (!enumRecord) {
                        return "<span style='color: #ccc;'>" + val + "</span>";
                    }
                    var enumText = enumRecord.get("text");
                    var enumColor = enumRecord.get("color");
                    if (Ext.isEmpty(enumText)) {
                        return "<span style='color: #ccc;'>" + val + "</span>";
                    }
                    var color = FastExt.Color.toColor(enumColor, "#000000");
                    return "<span style='color: " + color + ";'>" + enumText + "</span>";
                }
                catch (e) {
                    return "<span style='color: #ccc;'>" + val + "</span>";
                }
            };
        };
        return Renders;
    }());
    FastExt.Renders = Renders;
})(FastExt || (FastExt = {}));
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
var FastExt;
(function (FastExt) {
    /**
     * Ext.data.Store数据源相关操作
     */
    var Store = /** @class */ (function () {
        function Store() {
        }
        /**
         * 获取store相关的功能菜单文字，包含了父类
         * @param store
         * @param menu
         * @returns {string|null}
         */
        Store.getStoreMenuText = function (store, menu) {
            if (menu) {
                if (menu.parent) {
                    var storeMenuText = FastExt.Store.getStoreMenuText(null, menu.parent);
                    if (storeMenuText) {
                        return storeMenuText + ">" + menu.text;
                    }
                }
                return menu.text;
            }
            else if (store && store.entity) {
                return FastExt.Store.getStoreMenuText(null, store.entity.menu);
            }
            return null;
        };
        /**
         * 提交Store被修改过的数据
         * @param store
         * @return Ext.Promise
         */
        Store.commitStoreUpdate = function (store) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store) {
                    return;
                }
                if (!store.entity) {
                    return;
                }
                if (store.commiting) {
                    return;
                }
                var records = store.getUpdatedRecords();
                var phantoms = store.getNewRecords();
                records = records.concat(phantoms);
                if (records.length === 0) {
                    resolve(true);
                    return;
                }
                store.commiting = true;
                var params = { "entityCode": store.entity.entityCode };
                if (store.entity.menu) {
                    params["menu"] = FastExt.Store.getStoreMenuText(store);
                }
                for (var i = 0; i < records.length; i++) {
                    var record = records[i];
                    for (var j = 0; j < store.entity.idProperty.length; j++) {
                        var idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                    for (var key in record.modified) {
                        params["data[" + i + "]." + key] = record.get(key);
                    }
                }
                FastExt.Server.updateEntity(params, function (success, message) {
                    store.commiting = false;
                    resolve(success);
                    if (success) {
                        FastExt.Dialog.toast(message);
                        store.commitChanges();
                    }
                    else {
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        };
        /**
         * 提交Store里被选中删除的数据
         * @param store
         * @param data
         * @return Ext.Promise
         */
        Store.commitStoreDelete = function (store, data) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store.entity) {
                    return;
                }
                var params = { "entityCode": store.entity.entityCode };
                if (store.entity.menu) {
                    params["menu"] = FastExt.Store.getStoreMenuText(store);
                }
                for (var i = 0; i < data.length; i++) {
                    var record = data[i];
                    for (var j = 0; j < store.entity.idProperty.length; j++) {
                        var idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                }
                FastExt.Server.deleteEntity(params, function (success, message) {
                    resolve(success);
                    if (success) {
                        FastExt.Dialog.toast(message);
                        var reloadPage = store.currentPage;
                        if (store.count() - data.length <= 0) {
                            reloadPage = reloadPage - 1;
                        }
                        store.loadPage(Math.max(reloadPage, 1));
                    }
                    else {
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        };
        /**
         * 提交Store回收站里还原选中的数据
         * @param store
         * @param data
         * @return Ext.Promise
         */
        Store.commitStoreReback = function (store, data) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store.entity) {
                    return;
                }
                var params = { "entityCode": store.entity.entityCode };
                if (store.entity.menu) {
                    params["menu"] = FastExt.Store.getStoreMenuText(store);
                }
                for (var i = 0; i < data.length; i++) {
                    var record = data[i];
                    for (var j = 0; j < store.entity.idProperty.length; j++) {
                        var idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                }
                FastExt.Server.rebackEntity(params, function (success, message) {
                    resolve(success);
                    if (success) {
                        var reloadPage = store.currentPage;
                        if (store.count() - data.length <= 0) {
                            reloadPage = reloadPage - 1;
                        }
                        store.loadPage(Math.max(reloadPage, 1));
                    }
                    else {
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        };
        /**
         * 提交复制entity store选择的数据
         * @param store
         * @param data
         * @return Ext.Promise
         */
        Store.commitStoreCopy = function (store, data) {
            return new Ext.Promise(function (resolve, reject) {
                if (!store.entity) {
                    return;
                }
                var params = { "entityCode": store.entity.entityCode };
                if (store.entity.menu) {
                    params["menu"] = Store.getStoreMenuText(store);
                }
                for (var i = 0; i < data.length; i++) {
                    var record = data[i];
                    for (var j = 0; j < store.entity.idProperty.length; j++) {
                        var idName = store.entity.idProperty[j];
                        params['data[' + i + '].' + idName] = record.get(idName);
                    }
                }
                FastExt.Server.copyEntity(params, function (success, message) {
                    resolve(success);
                    if (success) {
                        FastExt.Dialog.toast(message);
                        var reloadPage = store.currentPage;
                        if (store.count() - data.length <= 0) {
                            reloadPage = reloadPage - 1;
                        }
                        store.loadPage(Math.max(reloadPage, 1));
                    }
                    else {
                        Ext.Msg.alert('系统提醒', message);
                    }
                });
            });
        };
        /**
         * 判断record是否被修改过
         * @param record [Ext.data.Model]
         */
        Store.isModified = function (record) {
            for (var name_3 in record.data) {
                try {
                    if (record.isModified(name_3)) {
                        return true;
                    }
                }
                catch (e) {
                }
            }
            return false;
        };
        /**
         * 获取用作FastEntity通用的数据源，接口：entity/list
         * @param entity 实体对象
         * @param where 请求实体数据列表的接口参数 json对象
         * @param tree 是否用作Ext.tree.Panel
         */
        Store.getEntityDataStore = function (entity, where, tree) {
            if (Ext.isEmpty(entity)) {
                FastExt.Dialog.showAlert("系统提醒", "参数entity不可为空！");
                return;
            }
            var config = {
                fields: [],
                pageSize: 20,
                where: where,
                entity: entity,
                remoteSort: FastExt.Base.toBool(entity.remoteSort, true),
                proxy: {
                    type: 'ajax',
                    url: 'entity/list',
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    listeners: {
                        exception: function (obj, request, operation, eOpts) {
                            try {
                                var data = eval("(" + request.responseText + ")");
                                if (!data.success) {
                                    Ext.Msg.alert('数据获取失败', data.message);
                                }
                            }
                            catch (e) {
                                Ext.Msg.alert('数据获取失败', request.responseText);
                            }
                        }
                    },
                    reader: {
                        type: 'json',
                        root: 'list',
                        totalProperty: 'totalRow'
                    }
                },
                listeners: {
                    beforeload: function (store, options, eOpts) {
                        try {
                            if (!store.entity || !store.entity.entityCode) {
                                return false;
                            }
                            var params = store.proxy.extraParams;
                            var newParams_1 = {
                                "entityCode": store.entity.entityCode,
                                "limit": store.pageSize
                            };
                            if (store.where) {
                                for (var w in store.where) {
                                    newParams_1["where['" + w + "']"] = store.where[w];
                                }
                            }
                            if (tree) {
                                if (Ext.isEmpty(tree.parentIdValue)) {
                                    tree.parentIdValue = -1;
                                }
                                newParams_1["page"] = -1;
                                var parentValue = options.node.data[tree.idName];
                                if (Ext.isEmpty(parentValue)) {
                                    parentValue = tree.parentIdValue;
                                }
                                if (store.grid) {
                                    if (!FastExt.Grid.hasSearchColumn(store.grid)) {
                                        newParams_1["where['" + tree.parentIdName + "']"] = parentValue;
                                    }
                                    else {
                                        newParams_1["where['" + tree.parentIdName + "']"] = null;
                                    }
                                }
                                else {
                                    newParams_1["where['" + tree.parentIdName + "']"] = parentValue;
                                }
                            }
                            if (store.grid) {
                                newParams_1["power"] = FastExt.Base.toBool(store.grid.power, true);
                                if (store.grid.getSelection().length > 0) {
                                    store.grid.getSelectionModel().deselectAll();
                                }
                                else {
                                    store.grid.fireEvent("selectionchange", store.grid);
                                }
                                if (store.grid.where) {
                                    for (var w in store.grid.where) {
                                        newParams_1["where['" + w + "']"] = store.grid.where[w];
                                    }
                                }
                                store.getSorters().each(function (item) {
                                    newParams_1["indexSort['" + item.getProperty() + "']"] = FastExt.Grid.getColumn(store.grid, item.getProperty()).getIndex();
                                });
                                FastExt.Grid.checkColumnSearch(store.grid);
                            }
                            if (store.grid) {
                                if (Ext.isFunction(store.grid.onBeforeLoad)) {
                                    var result = store.grid.onBeforeLoad(store.grid, store, newParams_1);
                                    if (!FastExt.Base.toBool(result, true)) {
                                        return false;
                                    }
                                }
                            }
                            store.getProxy().setExtraParams(FastExt.Json.mergeJson(params, newParams_1));
                            return true;
                        }
                        catch (e) {
                            FastExt.Dialog.showException(e, "store:beforeload");
                        }
                    }
                },
                autoLoad: false
            };
            config.autoLoad = false;
            var entityStore;
            if (tree) {
                config["root"] = {
                    expanded: true
                };
                entityStore = Ext.create('Ext.data.TreeStore', config);
            }
            else {
                entityStore = Ext.create('Ext.data.Store', config);
            }
            entityStore.on("load", function (store) {
                setTimeout(function () {
                    try {
                        if (store.grid) {
                            store.grid.syncRowHeights();
                        }
                    }
                    catch (e) {
                    }
                }, 300);
            });
            return entityStore;
        };
        /**
         * 获取枚举数据源，接口showEnums?enumName=
         * @param enumName 枚举名称
         * @param firstData 插入头部的数据
         * @param lastData 插入尾部的数据
         * @param params 获取枚举接口的参数
         * @param useCache
         * @return Ext.data.Store
         */
        Store.getEnumDataStore = function (enumName, firstData, lastData, params, useCache) {
            if (!params) {
                params = {};
            }
            if (Ext.isEmpty(useCache)) {
                useCache = true;
            }
            var cacheKey = $.md5(enumName + Ext.JSON.encode(params));
            if (!useCache || !FastExt.Cache.memory.hasOwnProperty(cacheKey)) {
                Ext.Ajax.request({
                    url: 'showEnums?enumName=' + enumName,
                    async: false,
                    params: params,
                    success: function (response, opts) {
                        try {
                            var result = Ext.decode(response.responseText);
                            if (result.success) {
                                FastExt.Cache.memory[cacheKey] = result.data;
                            }
                            else {
                                Ext.Msg.alert('枚举获取失败', result.message);
                            }
                        }
                        catch (e) {
                            FastExt.Dialog.showException(e, "获取枚举数据源！[getEnumDataStore]");
                        }
                    }
                });
            }
            var dataArray = Ext.clone(FastExt.Cache.memory[cacheKey]);
            if (firstData) {
                dataArray = Ext.Array.insert(dataArray, 0, firstData);
            }
            if (lastData) {
                dataArray = Ext.Array.push(dataArray, lastData);
            }
            return Ext.create('Ext.data.Store', {
                autoLoad: false,
                enumName: enumName,
                data: dataArray
            });
        };
        /**
         * 从枚举Store中查找枚举对应的Record
         * @param enumName 枚举名称
         * @param id 枚举匹配的值
         * @param attr 查找的匹配的属性名
         */
        Store.getEnumRecord = function (enumName, id, attr) {
            if (!attr) {
                attr = "id";
            }
            return FastExt.Store.getEnumDataStore(enumName).findRecord(attr, id, 0, false, false, true);
        };
        /**
         * 从枚举Store中查找枚举的文本
         * @param enumName
         * @param id
         */
        Store.getEnumText = function (enumName, id) {
            var findRecord = FastExt.Store.getEnumRecord(enumName, id);
            if (findRecord) {
                return findRecord.get("text");
            }
            return null;
        };
        /**
         * 获取页数的数据源Store
         * @param maxSize 最大页数 默认 100
         * @param iteration 每页迭代的增长因素 默认 10
         * @return Ext.data.Store
         */
        Store.getPageDataStore = function (maxSize, iteration) {
            if (!maxSize || maxSize.length === 0)
                maxSize = 100;
            if (!iteration || iteration.length === 0)
                iteration = 10;
            var dataArray = [];
            for (var i = 0; i < maxSize / 10; i++) {
                var text = ((i + 1) * iteration) + '条';
                var id = ((i + 1) * iteration);
                dataArray.push({
                    'text': text,
                    "id": id
                });
            }
            return Ext.create('Ext.data.Store', {
                id: 'pageSizeDataStore',
                fields: ["id", "text"],
                data: dataArray
            });
        };
        /**
         * 获取比较符数据源
         * @return Ext.data.Store
         */
        Store.getCompareDataStore = function () {
            return Ext.create('Ext.data.Store', {
                data: [
                    {
                        id: 0,
                        text: '=',
                        desc: '等于'
                    },
                    {
                        id: 1,
                        text: '!=',
                        desc: '不等于'
                    },
                    {
                        id: 2,
                        text: '?',
                        desc: '包含'
                    },
                    {
                        id: 3,
                        text: '!?',
                        desc: '不包含'
                    },
                    {
                        id: 4,
                        text: '>',
                        desc: '大于'
                    },
                    {
                        id: 6,
                        text: '>=',
                        desc: '大等于'
                    },
                    {
                        id: 5,
                        text: '<',
                        desc: '小于'
                    },
                    {
                        id: 7,
                        text: '<=',
                        desc: '小等于'
                    }
                ]
            });
        };
        /**
         * 获取grid列的数据源
         * @param grid
         * @param search
         * @return Ext.data.Store
         */
        Store.getGridColumnStore = function (grid, search) {
            var dataArray = [];
            var configColumns = grid.getColumns();
            for (var i = 0; i < configColumns.length; i++) {
                var column = configColumns[i];
                if (Ext.isEmpty(column.dataIndex)) {
                    continue;
                }
                if (FastExt.Base.toBool(search, false)) {
                    if (FastExt.Grid.isFilesColumn(column)
                        || FastExt.Grid.isFileColumn(column)) {
                        continue;
                    }
                    if (!FastExt.Base.toBool(column.search, true)) {
                        continue;
                    }
                    if (FastExt.Base.toBool(column["encrypt"], false)) {
                        continue;
                    }
                }
                dataArray.push({
                    'text': column.configText,
                    "id": column.dataIndex,
                    'index': i
                });
            }
            return Ext.create('Ext.data.Store', {
                fields: ["id", "text", "index"],
                data: dataArray
            });
        };
        /**
         * 获取yes或no的数据源
         * @return Ext.data.Store
         */
        Store.getYesOrNoDataStore = function () {
            return Ext.create('Ext.data.Store', {
                id: 'yesOrNoDataStore',
                fields: ["id", "text"],
                data: [
                    {
                        'text': '是',
                        "id": 1
                    },
                    {
                        'text': '否',
                        "id": 0
                    }
                ]
            });
        };
        /**
         * 获取主题的数据源
         * @return Ext.data.Store
         */
        Store.getThemeDataStore = function () {
            return Ext.create('Ext.data.Store', {
                id: 'themeDataStore',
                fields: ["id", "text"],
                data: [
                    {
                        'text': '圆润立体',
                        "id": 'extjs/theme/fast-theme-wrap'
                    },
                    {
                        'text': '清爽扁平',
                        "id": 'extjs/theme/fast-theme-flat'
                    }
                ]
            });
        };
        /**
         * 获取字体大小的数据源
         * @return Ext.data.Store
         */
        Store.getFontSizeDataStore = function () {
            return Ext.create('Ext.data.Store', {
                id: 'fontSizeDataStore',
                fields: ["id", "text"],
                data: [
                    {
                        'text': '14px',
                        "id": '14px'
                    },
                    {
                        'text': '16px',
                        "id": '16px'
                    }, {
                        'text': '18px',
                        "id": '18px'
                    }
                ]
            });
        };
        /**
         * 将field组件的值设置到record里
         * @param record record对象
         * @param dataIndex 属性值
         * @param field field对象
         */
        Store.setRecordValue = function (record, dataIndex, field) {
            field.dataIndex = dataIndex;
            if (Ext.isFunction(field.setRecordValue)) {
                field.setRecordValue(record, false);
            }
            else {
                var value = field.getValue();
                if (Ext.isDate(field.getValue())) {
                    record.set(dataIndex, Ext.Date.format(value, field.format));
                }
                else {
                    record.set(dataIndex, value);
                }
            }
            if (FastExt.Base.toBool(field.autoUpdate, false)) {
                FastExt.Store.commitStoreUpdate(record.store);
            }
        };
        return Store;
    }());
    FastExt.Store = Store;
})(FastExt || (FastExt = {}));
var FastExt;
(function (FastExt) {
    /**
     * 系统对象
     */
    var System = /** @class */ (function () {
        function System() {
        }
        Object.defineProperty(System, "fontSize", {
            get: function () {
                if (window["fontSize"]) {
                    return window["fontSize"];
                }
                return this._fontSize;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * 移除全局加载的等待界面
         */
        System.removeLoading = function () {
            window["removeLoading"]();
        };
        /**
         * 检测IE浏览器版本，不符合允许条件的阻止使用
         */
        System.checkBrowserVersion = function () {
            if (Ext.isIE && Ext.ieVersion < 11) {
                var win = Ext.create('Ext.window.Window', {
                    title: '系统提醒',
                    width: 250,
                    height: 100,
                    layout: 'fit',
                    icon: 'icons/icon_error.svg',
                    resizable: false,
                    closable: false,
                    html: "<div style='background:#eeeeee; padding:10px;'>您当前的IE版本太低，至少在11.0以上的IE才能使用本系统！</div>",
                    modal: true
                });
                win.show();
                return false;
            }
            return true;
        };
        /**
         * 获取整个系统框架容器
         * @returns Ext.container.Viewport
         */
        System.getBodyContainer = function () {
            var container = Ext.getCmp("bodyContainer");
            if (!container) {
                Ext.getDoc().on("contextmenu", function (e) {
                    e.stopEvent(); //禁用右键菜单
                });
                Ext.tip.QuickTipManager.init();
                Ext.QuickTips.init();
                container = Ext.create('Ext.container.Viewport', {
                    id: 'bodyContainer',
                    layout: 'fit',
                    border: 0,
                    renderTo: Ext.getBody()
                });
            }
            return container;
        };
        /**
         * 获取系统属性值
         * @param name
         */
        System.getValue = function (name) {
            return FastExt.System[name];
        };
        /**
         * 动态加载js文件
         * @param script js文件对象
         * @param callBack
         * @see FastExt.SystemScript
         */
        System.addScript = function (script, callBack) {
            if (script == null)
                return;
            var oHead = document.getElementsByTagName('head').item(0);
            var oScript = document.createElement("script");
            var isCode = false;
            oScript.type = "text/javascript";
            if (script.src != null && script.src.length > 0) {
                oScript.src = script.src + "?v=" + FastExt.System.getExt("version").value;
            }
            else if (script.href != null && script.href.length > 0) {
                oScript.src = script.href + "?v=" + FastExt.System.getExt("version").value;
            }
            else if (script.text) {
                try {
                    oScript.appendChild(document.createTextNode(script.text));
                }
                catch (ex) {
                    oScript.text = script.text;
                }
                isCode = true;
            }
            else {
                if (callBack != null) {
                    callBack();
                }
                return;
            }
            oHead.appendChild(oScript);
            if (isCode) {
                if (callBack != null) {
                    callBack();
                }
                return;
            }
            oScript.onload = oScript.readystatechange = function () {
                if (callBack != null) {
                    callBack();
                }
            };
            oScript.onerror = function () {
                alert("脚本文件" + script.src + "加载失败，请您稍后重试！");
            };
        };
        /**
         * 动态加载css代码
         * @param style css代码
         * @param callBack 加载成功后回调
         */
        System.addStyle = function (style, callBack) {
            var oHead = document.getElementsByTagName('head').item(0);
            var oStyle = document.createElement("style");
            oStyle.type = "text/css";
            if (oStyle.styleSheet) {
                oStyle.styleSheet.cssText = style;
            }
            else {
                oStyle.innerHTML = style;
            }
            if (callBack != null) {
                callBack();
            }
            oHead.appendChild(oStyle);
        };
        /**
         * 初始化系统配置
         */
        System.initConfig = function () {
            FastExt.System.baseUrl = window.location.href;
            if (FastExt.System.baseUrl.indexOf("#") > 0) {
                FastExt.System.baseUrl = FastExt.System.baseUrl.split("#")[0];
            }
            if (!FastExt.System.baseUrl.toString().endWith("/")) {
                FastExt.System.baseUrl = FastExt.System.baseUrl + "/";
            }
            var params = {};
            if (FastExt.Power.isPower()) {
                if (window.parent && Ext.isFunction(window.parent.getMenuPower)) {
                    params = { menuPower: window.parent.getMenuPower() };
                }
            }
            Ext.Ajax.request({
                url: FastExt.Server.showConfigUrl(),
                params: params,
                success: function (response, opts) {
                    var data = FastExt.Json.jsonToObject(response.responseText).data;
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            FastExt.System[key] = data[key];
                        }
                    }
                    var allExt = FastExt.System.getAllExt();
                    for (var i = 0; i < allExt.length; i++) {
                        var head = allExt[i];
                        FastExt.System[head.name] = head;
                    }
                    FastExt.System.loadAppJs();
                },
                failure: function (response, opts) {
                    FastExt.Dialog.showException(response.responseText, "获取系统配置！[system.initConfig]");
                }
            });
        };
        /**
         * 加载系统的AppJs文件
         */
        System.loadAppJs = function (index) {
            if (!index) {
                index = 0;
            }
            if (index >= FastExt.System["app"].length) {
                Ext.MessageBox.updateProgress(1, '已加载成功，正在显示中');
                FastExt.System.addStyle(FastExt.System["menusCss"], function () {
                    FastExt.System.globalConfig();
                });
                return;
            }
            Ext.MessageBox.updateProgress(parseFloat(String(index + 1)) / parseFloat(FastExt.System["app"].length), '正在加载中，请耐心等待');
            FastExt.System.addScript({ src: FastExt.System["app"][index] }, function () {
                FastExt.System.loadAppJs(index + 1);
            });
        };
        /**
         * 系统全局配置
         */
        System.globalConfig = function () {
            //配置entity实体类基本属性
            var entities = FastExt.System["entities"];
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                for (var key in entity) {
                    if (entity.hasOwnProperty(key)) {
                        try {
                            var pro = eval(entity.entityCode + ".prototype");
                            pro[key] = entity[key];
                            entity.js = true;
                        }
                        catch (e) {
                            entity.js = false;
                            break;
                        }
                    }
                }
            }
            //配置是否进行权限
            if (FastExt.Power.isPower()) {
                if (window.parent && Ext.isFunction(window.parent["getExtPower"])) {
                    FastExt.Power.config = true;
                    FastExt.Power.powers = FastExt.Json.jsonToObject(window.parent["getExtPower"]());
                    if (!FastExt.Power.powers) {
                        FastExt.Power.powers = {};
                    }
                    FastExt.System.managerPowers = FastExt.Json.jsonToObject(window.parent["getParentExtPower"]());
                    //如果父级权限为false，默认同步子管理员为false
                    if (FastExt.System.managerPowers) {
                        for (var code in FastExt.Power.powers) {
                            if (FastExt.System.managerPowers.hasOwnProperty(code)) {
                                var managerPower = FastExt.System.managerPowers[code];
                                for (var managerPowerKey in managerPower) {
                                    if (!managerPower[managerPowerKey]) {
                                        FastExt.Power.powers[code][managerPowerKey] = false;
                                    }
                                }
                            }
                        }
                    }
                    window["getExtPower"] = function () {
                        return FastExt.Power.savePower();
                    };
                }
            }
            Ext.Ajax.on('beforerequest', function (conn, options, eObj) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    FastExt.Base.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).set(0);
                    FastExt.Base.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(0.7);
                }
                catch (e) {
                }
            });
            Ext.Ajax.on('requestcomplete', function (conn, response, options) {
                try {
                    if (response.status === 203) {
                        FastExt.System.sessionOut();
                    }
                    else {
                        try {
                            var jsonData = eval("(" + response.responseText + ")");
                            if (jsonData.code === 203) {
                                FastExt.System.sessionOut();
                            }
                        }
                        catch (e) {
                        }
                    }
                    FastExt.Base.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(1);
                }
                catch (e) {
                }
            });
            Ext.Ajax.on('requestexception', function (conn, response, options, eOpts) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    FastExt.Dialog.showException(response.responseText, "请求异常！");
                }
                catch (e) {
                }
            });
            $(document).ajaxStart(function (obj) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    FastExt.Base.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).set(0);
                    FastExt.Base.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(0.7);
                }
                catch (e) {
                }
            });
            $(document).ajaxComplete(function (event, xhr, options) {
                try {
                    if (xhr.status === 203) {
                        FastExt.System.sessionOut();
                    }
                    else {
                        try {
                            var jsonData = eval("(" + xhr.responseText + ")");
                            if (jsonData.code === 203) {
                                FastExt.System.sessionOut();
                            }
                        }
                        catch (e) {
                        }
                    }
                    FastExt.Base.getProgressLine(FastExt.Color.toColor(FastExt.System.getExt("front-color").value)).animate(1);
                }
                catch (e) {
                }
            });
            $(document).ajaxError(function (event, xhr, settings) {
                try {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    FastExt.Dialog.showException(xhr.responseText, "请求异常");
                }
                catch (e) {
                }
            });
            window.addEventListener("popstate", function (e) {
                FastExt.System.selectTab(FastExt.System.selectTabFromHref());
            }, false);
            FastExt.System.init = true;
            FastExt.System.initSystem();
        };
        /**
         * 开始初始化加载系统的布局
         */
        System.initSystem = function () {
            FastExt.System.removeLoading();
            var me = this;
            var container = FastExt.System.getBodyContainer();
            container.removeAll();
            var systemBgColor = FastExt.Color.toColor(me["theme-color"].value);
            var systemTlColor = FastExt.Color.toColor(me["front-color"].value);
            var systemLogo = me["system-logo"].value;
            var versionName = me["version"].desc;
            var systemTitle = $("title").text() + versionName;
            if (Ext.isEmpty(systemLogo)) {
                systemLogo = "icons/icon_head_system.svg";
            }
            var headerInfo = Ext.create('Ext.toolbar.Toolbar', {
                height: 60,
                padding: '0 0 0 0',
                border: 0,
                flex: 1,
                power: false,
                cls: 'headContainer',
                style: {
                    background: systemBgColor
                },
                items: [
                    {
                        xtype: 'image',
                        src: systemLogo,
                        height: 40,
                        width: 40,
                        cls: 'headLogo',
                        margin: '10 5 5 5',
                        style: {
                            borderRadius: '10px'
                        }
                    },
                    {
                        xtype: 'label',
                        margin: '0 0 0 5',
                        html: "<div class='headTitle' style='color: " + systemTlColor + ";' >" + systemTitle + "</div>"
                    },
                    "->",
                    {
                        xtype: 'button',
                        iconCls: 'extIcon extRole',
                        text: me.manager.managerName,
                        minWidth: 135,
                        cls: 'headButton',
                        menu: [{
                                text: "修改登录密码",
                                iconCls: 'extIcon extResetPassword',
                                handler: function () {
                                    me.modifyPassword(this);
                                }
                            }]
                    },
                    {
                        xtype: 'button',
                        iconCls: 'extIcon extExits',
                        text: "退出登录",
                        cls: 'headButton',
                        handler: function () {
                            me.logout();
                        }
                    }
                ]
            });
            var headerTip = Ext.create('Ext.toolbar.Toolbar', {
                border: 0,
                padding: '0 0 0 0',
                flex: 1,
                height: 3,
                style: {
                    background: systemBgColor
                },
                html: "<div class=\"progress\" id=\"progress\"></div>"
            });
            var headerPanel = Ext.create('Ext.panel.Panel', {
                layout: 'absolute',
                region: 'north',
                height: 60,
                border: 0,
                hidden: FastExt.Power.config,
                items: [headerInfo, headerTip],
                listeners: {
                    afterlayout: function () {
                        this.getEl().on("dblclick", function () {
                            if (FastExt.System.fullscreen) {
                                FastExt.System.outFullscreen();
                            }
                            else {
                                FastExt.System.inFullScreen();
                            }
                        });
                    }
                }
            });
            var leftTreeWidth = parseInt((document.body.clientWidth * 0.25).toFixed(0));
            var leftTreePanel = Ext.create('Ext.panel.Panel', {
                border: 0,
                region: 'center',
                cls: 'treelist-with-nav',
                scrollable: "y",
                items: [
                    {
                        xtype: 'treelist',
                        id: 'leftTreeList',
                        reference: 'treelist',
                        expanderOnly: false,
                        singleExpand: true,
                        ui: 'nav',
                        scrollable: "y",
                        expanderFirst: false,
                        selectOnExpander: true,
                        highlightPath: true,
                        store: {
                            type: 'tree',
                            root: {
                                expanded: true,
                                children: me.menus
                            }
                        },
                        viewModel: {
                            formulas: {
                                selectionItem: function (get) {
                                    try {
                                        var selection = get('treelist.selection');
                                        if (selection) {
                                            if (selection.data.leaf) {
                                                me.showTab(selection.data.method, selection.data.id, selection.data.text, selection.data.icon);
                                            }
                                        }
                                        return selection;
                                    }
                                    catch (e) {
                                        FastExt.Dialog.showException(e);
                                    }
                                }
                            }
                        }
                    }
                ],
                listeners: {
                    resize: function (obj, width, height, oldWidth, oldHeight, eOpts) {
                        var pressed = width <= 128;
                        var treelist = Ext.getCmp("leftTreeList");
                        var ct = treelist.ownerCt.ownerCt;
                        treelist.setMicro(pressed);
                        if (pressed) {
                            ct.setWidth(44);
                        }
                        else {
                            ct.setWidth(width);
                        }
                    }
                }
            });
            me.tabPanelContainer = Ext.create('Ext.tab.Panel', {
                region: 'center',
                id: 'tabs',
                plain: true,
                style: {
                    marginTop: '-8px'
                },
                items: [],
                recordTab: function () {
                    FastExt.System.recordTab();
                },
                plugins: ['tabreorderer', {
                        ptype: 'tabclosemenu'
                    }]
            });
            var rightContainer = Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'center',
                border: 0,
                style: {
                    background: '#eeeeee'
                },
                items: [me.tabPanelContainer]
            });
            var leftContainer = Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'west',
                border: 0,
                width: leftTreeWidth,
                minWidth: 44,
                maxWidth: 500,
                subtitle: '左侧菜单',
                split: true,
                style: {
                    background: '#32404e'
                },
                items: [
                    {
                        xtype: 'image',
                        height: 35,
                        border: 0,
                        padding: '5 5 5 5',
                        region: 'south',
                        src: FastExt.Server.getIcon("icon_v_menu.svg"),
                        cls: 'leftBottom',
                        listeners: {
                            el: {
                                click: function () {
                                    if (leftContainer.getWidth() <= 44) {
                                        if (leftContainer.oldWidth != null) {
                                            leftContainer.setWidth(Math.max(200, leftContainer.oldWidth));
                                        }
                                        else {
                                            leftContainer.setWidth(200);
                                        }
                                    }
                                    else {
                                        leftContainer.oldWidth = leftContainer.getWidth();
                                        leftContainer.setWidth(44);
                                    }
                                }
                            }
                        }
                    }, leftTreePanel
                ]
            });
            me.tabPanelContainer.add({
                title: '首页',
                xtype: 'panel',
                id: 'tabWelcome',
                reorderable: false,
                closable: false,
                layout: 'fit',
                iconCls: 'extIcon extIndex',
                justFixed: true,
                items: [FastExt.System.getWelcomePanel()],
                listeners: {
                    beforeactivate: function (tab) {
                        try {
                            me.selectMenu(me.lastTabId, true);
                        }
                        catch (e) {
                        }
                    },
                    activate: function (tab) {
                        if (me.restoredTab) {
                            var state = {
                                title: tab.title,
                                url: me.baseUrl
                            };
                            window.history.pushState(state, tab.title, me.baseUrl);
                        }
                    }
                }
            });
            var containerPanel = Ext.create('Ext.panel.Panel', {
                layout: 'border',
                border: 0,
                bodyStyle: {
                    background: systemBgColor
                },
                items: [headerPanel, leftContainer, rightContainer]
            });
            container.add(containerPanel);
            var tabFromHrefMenuId = me.selectTabFromHref();
            if (FastExt.Base.toBool(me['tab-record'].value, true)) {
                Ext.MessageBox.updateProgress(1, '即将完成操作，请耐心等待', '系统初始化成功！获取菜单中…');
                me.restoreTab().then(function (value) {
                    if (Ext.MessageBox.isVisible()) {
                        Ext.MessageBox.hide();
                    }
                    var tabs = FastExt.Json.jsonToObject(value);
                    me.restoredTab = true;
                    if (!tabs) {
                        return;
                    }
                    Ext.each(tabs, function (tab) {
                        if (tabFromHrefMenuId === tab.id) {
                            tab.active = true;
                        }
                        me.showTab(tab.method, tab.id, tab.title, tab.icon, tab.active, true, tab.where, tab.closable, tab.reorderable);
                    });
                    if (tabs.length === 0 || !me.tabPanelContainer.getActiveTab()) {
                        me.tabPanelContainer.setActiveTab(Ext.getCmp("tabWelcome"));
                    }
                });
            }
            else {
                if (Ext.MessageBox.isVisible()) {
                    Ext.MessageBox.hide();
                }
                me.tabPanelContainer.setActiveTab(Ext.getCmp("tabWelcome"));
            }
        };
        /**
         * 会话失效弹框
         */
        System.sessionOut = function () {
            var me = this;
            if (me.sessionOutAlert) {
                return;
            }
            Ext.MessageBox.hide();
            me.sessionOutAlert = true;
            var win = Ext.create('Ext.window.Window', {
                title: '系统提醒',
                height: 150,
                width: 250,
                layout: 'fit',
                resizable: false,
                maximizable: false,
                sessionWin: true,
                fixed: true,
                draggable: false,
                iconCls: 'extIcon extSessionOut',
                html: "<div  style='padding:15px;background: #fff;'>会话失效，请您重新登录！</div>",
                modal: true,
                alwaysOnTop: true,
                toFrontOnShow: true,
                buttons: [{
                        text: '重新登录',
                        iconCls: 'extIcon extLogin',
                        flex: 1,
                        handler: function () {
                            win.close();
                        }
                    }],
                listeners: {
                    destroy: function (obj, op) {
                        if (FastExt.Power.isPower()) {
                            window.parent.close();
                        }
                        else {
                            location.reload();
                        }
                    }
                }
            });
            win.show();
        };
        /**
         * 退出登录
         */
        System.logout = function () {
            Ext.Msg.confirm("系统提示", "<br/>您是否确定退出登录吗？", function (btn) {
                if (btn === "yes") {
                    FastExt.Server.logout();
                }
            });
        };
        /**
         * 获取配置在fast-head.html中 meta scheme="ext" 对象
         * @param key
         */
        System.getExt = function (key) {
            return window["getExt"](key);
        };
        /**
         * 获取全部的fast-head.html中 meta scheme="ext" 配置
         */
        System.getAllExt = function () {
            return window["getAllExt"]();
        };
        /**
         * 整个FastChar-ExtJs系统是否已初始化
         */
        System.isSystem = function () {
            try {
                if (FastExt.System.init)
                    return true;
            }
            catch (e) {
            }
            return false;
        };
        /**
         * 判断当前管理是否是超级管理员角色
         */
        System.isSuperRole = function () {
            var me = this;
            if (me.manager && me.manager.role) {
                if (me.manager.role.roleType === 0) { //拥有最大权限
                    return true;
                }
            }
            return false;
        };
        /**
         * 控制浏览器界面进入全屏
         */
        System.inFullScreen = function () {
            try {
                var element = document.documentElement;
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                }
                else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
                else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                }
                else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                }
                this.fullscreen = true;
            }
            catch (e) {
                console.error(e);
            }
        };
        /**
         * 退出全屏
         */
        System.outFullscreen = function () {
            try {
                var document = document;
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                }
                else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
                this.fullscreen = false;
            }
            catch (e) {
                console.error(e);
            }
        };
        /**
         * 弹出安全验证功能操作
         * @param operate
         * @param callBack
         * @param timeout
         */
        System.validOperate = function (operate, callBack, timeout) {
            if (!operate) {
                return;
            }
            var operateValid = $.cookie("ValidOperate" + $.md5(operate));
            if (!timeout) {
                timeout = 24 * 60 * 60;
            }
            if (operateValid) {
                callBack();
            }
            else {
                var loginNormal_1 = FastExt.System.getExt("login-type").value === "normal";
                var labelWidth = FastExt.Base.getNumberValue(FastExt.System.fontSize) * 5 + 8;
                var doValid_1 = function () {
                    var form = loginPanel_1.form;
                    if (form.isValid()) {
                        var loginPassword = loginPanel_1.form.findField("loginPassword").getValue();
                        form.submit({
                            params: {
                                loginPassword: $.md5(loginPassword),
                                operate: operate,
                                timeout: timeout
                            },
                            waitMsg: '正在为您验证中……',
                            success: function (form, action) {
                                win_2.close();
                                callBack();
                            },
                            failure: function (form, action) {
                                refreshCode_1();
                                Ext.Msg.alert('验证失败', action.result.message, function () {
                                    if (action.result.code === -3) {
                                        loginPanel_1.form.findField("validateCode").focus();
                                    }
                                });
                            }
                        });
                    }
                };
                var loginPanel_1 = Ext.create('Ext.form.FormPanel', {
                    url: FastExt.Server.validOperateUrl(),
                    method: 'POST',
                    fileUpload: true,
                    border: 0,
                    width: '100%',
                    layout: "anchor",
                    region: 'center',
                    bodyStyle: {},
                    padding: '10 10 0 10',
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: '登录账号',
                            labelAlign: 'right',
                            labelWidth: labelWidth,
                            margin: '10 10 0 0',
                            name: 'loginName',
                            allowBlank: false,
                            blankText: '请输入当前登录名',
                            emptyText: '请输入当前登录名',
                            anchor: "100%"
                        }, {
                            xtype: 'textfield',
                            fieldLabel: '登录密码',
                            labelAlign: 'right',
                            labelWidth: labelWidth,
                            inputType: 'password',
                            margin: '10 10 0 0',
                            allowBlank: false,
                            blankText: '请输入登录密码',
                            emptyText: '请输入登录密码',
                            submitValue: false,
                            name: 'loginPassword',
                            anchor: "100%"
                        },
                        {
                            xtype: 'fieldcontainer',
                            labelWidth: 0,
                            anchor: "100%",
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            hidden: loginNormal_1,
                            items: [{
                                    xtype: 'textfield',
                                    fieldLabel: '验证码',
                                    labelAlign: 'right',
                                    labelWidth: labelWidth,
                                    margin: '10 10 0 0',
                                    allowBlank: loginNormal_1,
                                    flex: 1,
                                    name: 'validateCode',
                                    emptyText: '请输入验证码',
                                    blankText: '请输入验证码'
                                }, {
                                    xtype: 'image',
                                    margin: '10 10 0 0',
                                    width: 70,
                                    id: 'imgCode',
                                    height: 32
                                }]
                        },
                        {
                            xtype: 'fieldcontainer',
                            labelWidth: 0,
                            anchor: "100%",
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            items: [{
                                    xtype: 'button',
                                    text: '取消',
                                    iconCls: 'extIcon extReset',
                                    flex: 1,
                                    tipText: '取消验证',
                                    margin: '10 5 10 10',
                                    handler: function () {
                                        win_2.close();
                                    }
                                }, {
                                    xtype: 'button',
                                    text: '确定',
                                    tipText: '确定验证',
                                    margin: '10 10 10 5',
                                    iconCls: 'extIcon extOk',
                                    flex: 1,
                                    handler: function () {
                                        doValid_1();
                                    }
                                }]
                        }
                    ],
                    listeners: {
                        'render': function (text) {
                            try {
                                new Ext.util.KeyMap({
                                    target: text.getEl(),
                                    key: 13,
                                    fn: doValid_1,
                                    scope: Ext.getBody()
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });
                var refreshCode_1 = function () {
                    try {
                        loginPanel_1.form.findField("validateCode").reset();
                        Ext.getCmp("imgCode").setSrc("showCaptcha?t=" + Math.random());
                    }
                    catch (e) {
                    }
                };
                var bottomPanel = Ext.create('Ext.panel.Panel', {
                    region: 'south',
                    layout: 'fit',
                    width: '100%',
                    border: 0,
                    html: "<div align='center' style='font-size: small;color:red;text-decoration:none; padding-left: 40px;padding-right: 40px;padding-bottom: 10px;'>完成验证后将自动继续《" + operate + "》操作</div>"
                });
                var win_2 = Ext.create('Ext.window.Window', {
                    title: '当前操作需要安全验证',
                    iconCls: 'extIcon extPower',
                    width: 380,
                    resizable: false,
                    layout: 'vbox',
                    toFrontOnShow: true,
                    modal: true,
                    constrain: true,
                    items: [loginPanel_1, bottomPanel]
                });
                win_2.show(null, function () {
                    try {
                        if (!loginNormal_1) {
                            refreshCode_1();
                            Ext.get('imgCode').on({
                                click: function () {
                                    refreshCode_1();
                                }
                            });
                        }
                    }
                    catch (e) {
                    }
                });
            }
        };
        /**
         * 格式化url地址，返回带上系统版本号参数
         * @param url
         * @param params
         */
        System.formatUrlVersion = function (url, params) {
            var newUrl = url;
            if (url.indexOf("v=") < 0) {
                if (url.indexOf("?") > 0) {
                    newUrl = url + "&v=" + FastExt.System.getValue("version").value;
                }
                else {
                    newUrl = url + "?v=" + FastExt.System.getValue("version").value;
                }
            }
            if (params) {
                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        newUrl = newUrl + "&" + key + "=" + params[key];
                    }
                }
            }
            return newUrl;
        };
        /**
         * 格式化url地址，如果没有http开头，则自动拼接当前系统的http地址
         * @param url
         * @param params
         */
        System.formatUrl = function (url, params) {
            if (url.startWith("http://") || url.startWith("https://")) {
                return url;
            }
            return this.formatUrlVersion(this.http + url, params);
        };
        /**
         * 异步执行函数
         * @param method
         */
        System.asyncMethod = function (method) {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    var itemValue = eval(method);
                    resolve(itemValue);
                }
                catch (e) {
                    resolve(null);
                    console.error(e);
                }
            });
        };
        /**
         * 根据菜单ID查找菜单对象
         * @param menuId 菜单ID
         */
        System.getMenu = function (menuId) {
            var treeList = Ext.getCmp("leftTreeList");
            var record = treeList.getStore().getNodeById(menuId);
            if (record) {
                var data = record.data;
                if (data && data.parentId && data.parentId !== 'root') {
                    data.parent = this.getMenu(data.parentId);
                }
                return data;
            }
            return null;
        };
        /**
         * 查找最后一个打开的标签页
         */
        System.findLastTag = function () {
            var tabs = Ext.getCmp("tabs");
            for (var i = tabs.items.items.length - 1; i >= 0; i--) {
                var item = tabs.items.items[i];
                if (item) {
                    if (!FastExt.Base.toBool(item.tab.closable, true) && !FastExt.Base.toBool(item.tab.reorderable, true)) {
                        return item;
                    }
                }
            }
            return null;
        };
        /**
         * 记录已打开的tab标签
         */
        System.recordTab = function () {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    var tabArray_1 = [];
                    var tabs_1 = Ext.getCmp("tabs");
                    tabs_1.items.each(function (item, index) {
                        var tab = {};
                        if (Ext.isEmpty(item.method)) {
                            return;
                        }
                        tab.method = item.method;
                        tab.where = item.where;
                        tab.title = item.title;
                        tab.icon = item.icon;
                        tab.id = item.id;
                        tab.closable = item.closable;
                        tab.reorderable = item.reorderable;
                        tab.active = item === tabs_1.getActiveTab();
                        tabArray_1.push(tab);
                    });
                    FastExt.Server.saveExtConfig("SystemTabs", "TabRecord", FastExt.Json.objectToJson(tabArray_1), function (success, message) {
                        resolve(success);
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        /**
         * 还原记录的Tab标签
         * @return Ext.Promise
         */
        System.restoreTab = function () {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    FastExt.Server.showExtConfig("SystemTabs", "TabRecord", function (success, value) {
                        resolve(value);
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        /**
         * 选中指定的标签
         * @param id
         */
        System.selectTab = function (id) {
            var me = this;
            var tab = Ext.getCmp(id);
            if (tab) {
                me.tabPanelContainer.setActiveTab(tab);
                tab.focus();
                return true;
            }
            else {
                return me.selectMenu(id, false);
            }
        };
        /**
         * 选中左侧的菜单
         * @param menuId 菜单Id
         * @param justParent 是否只选中父类
         */
        System.selectMenu = function (menuId, justParent) {
            try {
                var me = this;
                if (Ext.isEmpty(justParent)) {
                    justParent = false;
                }
                var treelist = Ext.getCmp("leftTreeList");
                var record = treelist.getStore().getNodeById(menuId);
                if (!record)
                    return false;
                var parentId = record.get("parentId");
                if (!Ext.isEmpty(parentId)) {
                    var parent_1 = treelist.getStore().getNodeById(parentId);
                    if (justParent) {
                        treelist.setSelection(parent_1);
                        parent_1.collapse();
                        return;
                    }
                    else {
                        if (parentId !== "root") {
                            parent_1.expand(false, true);
                            me.selectMenu(parentId, justParent);
                        }
                    }
                }
                treelist.setSelection(record);
                return true;
            }
            catch (e) {
                FastExt.Dialog.showException(e, "选择菜单！[system.selectMenu]");
            }
        };
        /**
         * 判断是否存在某个菜单
         * @param menuId
         */
        System.existMenu = function (menuId) {
            var treelist = Ext.getCmp("leftTreeList");
            var record = treelist.getStore().getNodeById(menuId);
            return record != null;
        };
        /**
         * 运行指定方法并在左侧打开一个tab标签
         * @param method 方法名称
         * @param tabId 标签Id
         * @param title 标签的标题
         * @param icon 标签图标
         * @param activate 是否激活
         * @param moveFirst 是否移动到最前面
         * @param where 携带的接口参数
         * @param closable 是否允许关闭
         * @param reorderable 是否允许记录
         */
        System.showTab = function (method, tabId, title, icon, activate, moveFirst, where, closable, reorderable) {
            var me = this;
            var tabs = Ext.getCmp("tabs");
            if (tabs.getActiveTab() && tabId === tabs.getActiveTab().getId()) {
                return;
            }
            if (!icon || icon.length === 0)
                icon = FastExt.Server.getIcon("icon_function.svg");
            if (Ext.isEmpty(moveFirst)) {
                moveFirst = true;
            }
            if (Ext.isEmpty(activate)) {
                activate = true;
            }
            var changeIcon = function (targetTab, selected) {
                if (targetTab) {
                    var menu = me.getMenu(targetTab.getId());
                    if (menu) {
                        var btnIconEl = Ext.get(targetTab.tabBtnId + "-btnIconEl");
                        if (btnIconEl) {
                            var color = menu.color;
                            if (selected) {
                                color = FastExt.Color.toColor(me["theme-color"].value);
                            }
                            btnIconEl.setStyle("background-image", "url(" + FastExt.Server.getIcon(menu.iconName, color) + ")");
                        }
                    }
                }
            };
            var currTab = Ext.getCmp(tabId);
            if (!currTab) {
                currTab = tabs.add({
                    xtype: 'panel',
                    id: tabId,
                    code: tabId,
                    icon: icon,
                    layout: 'fit',
                    title: title,
                    border: 0,
                    tabContainer: true,
                    closable: FastExt.Base.toBool(closable, true),
                    reorderable: FastExt.Base.toBool(reorderable, true),
                    methodInvoked: false,
                    method: method,
                    where: where,
                    items: [],
                    tabBtnId: null,
                    doFixed: function () {
                        var me = this;
                        me.tab.setClosable(!me.tab.closable);
                        if (!me.tab.closable) {
                            var cmp = FastExt.System.findLastTag();
                            if (cmp) {
                                tabs.moveAfter(me, cmp);
                            }
                            me.reorderable = me.tab.reorderable = false;
                        }
                        else {
                            me.reorderable = me.tab.reorderable = true;
                            var cmp = FastExt.System.findLastTag();
                            if (cmp) {
                                tabs.moveAfter(me, cmp);
                            }
                        }
                        if (Ext.isFunction(tabs.recordTab)) {
                            tabs.recordTab();
                        }
                    },
                    doCopyUrl: function () {
                        var tab = this;
                        FastExt.Base.copyToBoard(FastExt.System.baseUrl + "#/" + tab.title + "/" + tab.id);
                        FastExt.Dialog.toast("复制成功！");
                    },
                    listeners: {
                        deactivate: function (tab) {
                            try {
                                changeIcon(tab, false);
                                var entityOwner = tab.down("[entityList=true]");
                                if (entityOwner && entityOwner.onTabDeactivate) {
                                    entityOwner.onTabDeactivate(tab);
                                }
                            }
                            catch (e) {
                                console.error(e);
                            }
                        },
                        activate: function (tab) {
                            if (!tab) {
                                return;
                            }
                            me.lastTabId = tab.id;
                            if (me.existMenu(tab.id)) {
                                me.selectMenu(tab.id, false);
                            }
                            changeIcon(tab, true);
                            if (!tab.methodInvoked) {
                                me.asyncMethod(method).then(function (obj) {
                                    try {
                                        if (!obj) {
                                            return;
                                        }
                                        tab.methodInvoked = true;
                                        var entityOwner = obj.down("[entityList=true]");
                                        if (entityOwner) {
                                            entityOwner.where = FastExt.Json.mergeJson(tab.where, entityOwner.where);
                                            entityOwner.code = $.md5(tabId);
                                        }
                                        tab.add(obj);
                                    }
                                    catch (e) {
                                        console.error(e);
                                    }
                                });
                            }
                            else {
                                var entityOwner = tab.down("[entityList=true]");
                                if (entityOwner && entityOwner.onTabActivate) {
                                    entityOwner.onTabActivate(tab);
                                }
                            }
                            try {
                                var href = window.location.href;
                                if (href.indexOf("#") > 0) {
                                    var menuId = href.substring(href.lastIndexOf("/") + 1);
                                    if (tab.id === menuId) {
                                        return;
                                    }
                                }
                                var state = {
                                    title: tab.title,
                                    url: me.baseUrl + "#/" + tab.title + "/" + tab.id
                                };
                                window.history.pushState(state, tab.title, me.baseUrl + "#/" + tab.title + "/" + tab.id);
                            }
                            catch (e) {
                                console.error(e);
                            }
                            me.recordTab();
                        },
                        afterlayout: function (tab, container, pos) {
                            try {
                                Ext.get(this.tabBtnId).dom.ondblclick = function () {
                                    var currShowTabId = tab.getId();
                                    tabs.items.each(function (obj, index) {
                                        if (index !== 0 && obj.id === currShowTabId) {
                                            if (obj.closable) {
                                                obj.close();
                                            }
                                        }
                                    });
                                };
                                if (tabs.getActiveTab() && tabs.getActiveTab().getId() === tab.getId()) {
                                    changeIcon(tab, true);
                                }
                            }
                            catch (e) {
                            }
                        },
                        destroy: function (obj, eOpts) {
                            me.recordTab();
                        }
                    },
                    initEvents: function () {
                        this.tabBtnId = this.getEl().getAttribute("aria-labelledby");
                    }
                });
            }
            if (activate) {
                if (!tabs.getActiveTab() || tabs.getActiveTab().getId() !== currTab.getId()) {
                    if (moveFirst) {
                        var cmp = me.findLastTag();
                        if (cmp) {
                            Ext.getCmp("tabs").moveAfter(currTab, cmp);
                        }
                    }
                    tabs.setActiveTab(currTab);
                }
            }
        };
        /**
         * 添加左侧标签页
         * @param component 组件对象
         * @param id 标签ID
         * @param title 标题
         * @param icon 图标
         */
        System.addTab = function (component, id, title, icon) {
            var me = this;
            var currTab = Ext.getCmp(id);
            if (!currTab) {
                currTab = me.tabPanelContainer.add({
                    title: title,
                    xtype: 'panel',
                    id: id,
                    code: id,
                    icon: icon,
                    border: 0,
                    tabContainer: true,
                    closable: true,
                    reorderable: true,
                    layout: 'fit',
                    items: [component]
                });
            }
            me.tabPanelContainer.setActiveTab(currTab);
        };
        /**
         * 解析地址栏中携带的菜单Id
         */
        System.selectTabFromHref = function () {
            var href = window.location.href;
            if (href.indexOf("#") > 0) {
                return href.substring(href.lastIndexOf("/") + 1);
            }
            return null;
        };
        /**
         * 弹出修改管理员登录密码
         * @param obj 动画对象
         */
        System.modifyPassword = function (obj) {
            var me = this;
            var loginPanel = Ext.create('Ext.form.FormPanel', {
                url: 'controller/modifyPassword',
                method: 'POST',
                fileUpload: true,
                border: 0,
                width: '100%',
                layout: "anchor",
                region: 'center',
                bodyStyle: {},
                items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: '当前密码',
                        labelAlign: 'right',
                        labelWidth: 60,
                        margin: '10 10 10 10',
                        name: 'managerPassword',
                        allowBlank: false,
                        inputType: 'password',
                        blankText: '请输入用户当前密码',
                        anchor: "100%"
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: '新密码',
                        labelAlign: 'right',
                        labelWidth: 60,
                        margin: '10 10 10 10',
                        name: 'newPassword',
                        allowBlank: false,
                        inputType: 'password',
                        blankText: '请输入用户新密码',
                        anchor: "100%"
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: '确认密码',
                        labelAlign: 'right',
                        labelWidth: 60,
                        margin: '10 10 10 10',
                        name: 'reNewPassword',
                        allowBlank: false,
                        inputType: 'password',
                        blankText: '请确认密码',
                        anchor: "100%"
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'managerId',
                        value: me.manager.managerId
                    },
                    {
                        xtype: 'fieldcontainer',
                        labelWidth: 0,
                        layout: 'column',
                        items: [{
                                xtype: 'button',
                                text: '立即修改',
                                margin: '10 10 10 5',
                                iconCls: 'extIcon extOk',
                                columnWidth: 1,
                                handler: function () {
                                    doSubmit();
                                }
                            }]
                    }
                ],
                listeners: {
                    'render': function (text) {
                        try {
                            new Ext.util.KeyMap({
                                target: text.getEl(),
                                key: 13,
                                fn: doSubmit,
                                scope: Ext.getBody()
                            });
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
            });
            var doSubmit = function () {
                var form = loginPanel.form;
                if (form.isValid()) {
                    form.submit({
                        waitMsg: '正在修改中……',
                        success: function (form, action) {
                            FastExt.Dialog.toast(action.result.message);
                            win.close();
                            if (action.result.success) {
                                Ext.Msg.alert("系统提醒", "您当前的密码已被修改，请您重新登录！", function () {
                                    FastExt.Server.logout();
                                });
                            }
                        },
                        failure: function (form, action) {
                            Ext.Msg.alert('系统提醒', action.result.message);
                        }
                    });
                }
            };
            var win = Ext.create('Ext.window.Window', {
                title: '修改登录密码',
                height: 250,
                icon: obj.icon,
                iconCls: obj.iconCls,
                width: 400,
                layout: 'border',
                resizable: false,
                maximizable: false,
                animateTarget: obj,
                constrain: true,
                items: [loginPanel],
                modal: true
            });
            win.show();
        };
        /**
         * 根据实体编号获取实体对象
         * @param entityCode
         */
        System.getEntity = function (entityCode) {
            var me = this;
            var entities = me["entities"];
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (entity.entityCode === entityCode) {
                    return entity;
                }
            }
            return null;
        };
        /**
         * 显示功能菜单和功能列
         * @param obj
         * @param checked
         */
        System.showMenuColumns = function (obj, checked) {
            return new Ext.Promise(function (resolve, reject) {
                var dataStore = Ext.create('Ext.data.TreeStore', {
                    proxy: {
                        type: 'ajax',
                        url: 'showMenuColumn',
                        actionMethods: {
                            create: 'POST',
                            read: 'POST',
                            update: 'POST',
                            destroy: 'POST'
                        },
                        listeners: {
                            exception: function (obj, request, operation, eOpts) {
                                var data = eval("(" + request.responseText + ")");
                                if (!data.success) {
                                    Ext.Msg.alert('数据获取失败', data.message);
                                }
                            }
                        },
                        reader: {
                            type: 'json'
                        }
                    },
                    root: {
                        expanded: true
                    },
                    listeners: {
                        load: function (obj, records, successful) {
                            //treePanel.expandAll();
                        },
                        beforeload: function (store, operation) {
                            Ext.apply(store.proxy.extraParams, {
                                "checked": checked
                            });
                        }
                    }
                });
                var treePanel = Ext.create('Ext.tree.Panel', {
                    store: dataStore,
                    rootVisible: false,
                    bufferedRenderer: false,
                    animate: true,
                    containerScroll: true,
                    autoScroll: true,
                    lastCheckNode: null,
                    viewConfig: {
                        loadMask: {
                            msg: '加载功能菜单中，请稍后……'
                        }
                    },
                    listeners: {
                        checkchange: function (currNode, checked, e, eOpts) {
                            if (checked) {
                                currNode.bubble(function (parentNode) {
                                    parentNode.set('checked', true);
                                    //parentNode.expand(false, true);
                                });
                                currNode.cascadeBy(function (node) {
                                    node.set('checked', true);
                                    //node.expand(false, true);
                                });
                            }
                            else {
                                currNode.cascadeBy(function (node) {
                                    node.set('checked', false);
                                });
                            }
                        }
                    }
                });
                var win = Ext.create('Ext.window.Window', {
                    title: '搜索链配置',
                    width: 400,
                    height: 470,
                    layout: 'fit',
                    iconCls: 'extIcon extLink',
                    resizable: true,
                    animateTarget: obj,
                    maximizable: true,
                    constrain: true,
                    items: [treePanel],
                    modal: true,
                    buttons: [
                        {
                            text: '重置',
                            iconCls: 'extIcon extReset',
                            handler: function () {
                                dataStore.reload();
                            }
                        },
                        {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                var checkedArray = treePanel.getChecked();
                                var treeData = [];
                                var menuIds = "";
                                for (var i = 0; i < checkedArray.length; i++) {
                                    if (checkedArray[i].isLeaf()) {
                                        var data = {};
                                        data.text = checkedArray[i].data.text;
                                        data.id = checkedArray[i].data.id;
                                        data.dataIndex = checkedArray[i].data.dataIndex;
                                        data.parentId = checkedArray[i].data.parentId;
                                        var findRecord = treePanel.getStore().findNode("id", data.parentId, 0, false, false, true);
                                        if (findRecord) {
                                            var parent_2 = {};
                                            var parentData = findRecord.data;
                                            parent_2.text = parentData.text;
                                            parent_2.id = parentData.id;
                                            parent_2.method = parentData.method;
                                            parent_2.icon = parentData.icon;
                                            data.parent = parent_2;
                                            treeData.push(data);
                                        }
                                    }
                                    menuIds += "," + checkedArray[i].data.id;
                                }
                                resolve({ checked: menuIds, columns: treeData });
                                win.close();
                            }
                        }
                    ]
                });
                win.show();
            });
        };
        /**
         * 弹出菜单权限的配置窗体
         * @param obj 动画对象
         * @param checked 已选中的菜单Id
         * @param parent 指定上级的菜单Id
         * @return Ext.Promise
         */
        System.showPowerMenus = function (obj, checked, parent) {
            return new Ext.Promise(function (resolve, reject) {
                var dataStore = Ext.create('Ext.data.TreeStore', {
                    proxy: {
                        type: 'ajax',
                        url: 'showPowerMenus',
                        actionMethods: {
                            create: 'POST',
                            read: 'POST',
                            update: 'POST',
                            destroy: 'POST'
                        },
                        listeners: {
                            exception: function (obj, request, operation, eOpts) {
                                var data = eval("(" + request.responseText + ")");
                                if (!data.success) {
                                    Ext.Msg.alert('数据获取失败', data.message);
                                }
                            }
                        },
                        reader: {
                            type: 'json'
                        }
                    },
                    root: {
                        expanded: true
                    },
                    listeners: {
                        load: function (obj, records, successful) {
                            //treePanel.expandAll();
                        },
                        beforeload: function (store, operation) {
                            Ext.apply(store.proxy.extraParams, {
                                "checked": checked,
                                "parent": parent
                            });
                        }
                    }
                });
                var treePanel = Ext.create('Ext.tree.Panel', {
                    store: dataStore,
                    rootVisible: false,
                    bufferedRenderer: false,
                    animate: true,
                    containerScroll: true,
                    autoScroll: true,
                    viewConfig: {
                        loadMask: {
                            msg: '加载功能菜单中，请稍后……'
                        }
                    },
                    listeners: {
                        checkchange: function (currNode, checked, e, eOpts) {
                            if (checked) {
                                currNode.bubble(function (parentNode) {
                                    parentNode.set('checked', true);
                                    //parentNode.expand(false, true);
                                });
                                currNode.cascadeBy(function (node) {
                                    node.set('checked', true);
                                    //node.expand(false, true);
                                });
                            }
                            else {
                                currNode.cascadeBy(function (node) {
                                    node.set('checked', false);
                                });
                            }
                        }
                    }
                });
                var winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                var winHeight = parseInt((document.body.clientHeight * 0.5).toFixed(0));
                var win = Ext.create('Ext.window.Window', {
                    title: '权限配置（选择功能菜单）',
                    height: winHeight,
                    width: winWidth,
                    minHeight: 400,
                    minWidth: 470,
                    layout: 'fit',
                    iconCls: 'extIcon extSelect',
                    resizable: true,
                    animateTarget: obj,
                    maximizable: true,
                    constrain: true,
                    items: [treePanel],
                    modal: true,
                    buttons: [{
                            text: '重置',
                            iconCls: 'extIcon extReset',
                            handler: function () {
                                dataStore.reload();
                            }
                        }, {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                var checkedArray = treePanel.getChecked();
                                var menuIds = "";
                                for (var i = 0; i < checkedArray.length; i++) {
                                    menuIds += "," + checkedArray[i].data.id;
                                }
                                resolve(menuIds);
                                win.close();
                            }
                        }]
                });
                win.show();
            });
        };
        /**
         * 弹出界面权限配置的窗体
         * @param obj 动画对象
         * @param menuPower 指定菜单权限
         * @param extPower 已配置的界面权限
         * @param parentExtPower 指定上级的界面权限
         */
        System.showPowerExt = function (obj, menuPower, extPower, parentExtPower) {
            return new Ext.Promise(function (resolve, reject) {
                window["getMenuPower"] = function () {
                    return menuPower;
                };
                window["getExtPower"] = function () {
                    return extPower;
                };
                window["getParentExtPower"] = function () {
                    return parentExtPower;
                };
                window["close"] = function () {
                    Ext.getCmp("ExtPowerWindow").close();
                };
                var win = Ext.create('Ext.window.Window', {
                    title: '配置界面权限（在组件上右击鼠标进行编辑权限）',
                    id: "ExtPowerWindow",
                    iconCls: 'extIcon extPower',
                    layout: 'border',
                    resizable: false,
                    maximized: true,
                    fixed: true,
                    draggable: false,
                    listeners: {
                        show: function (obj) {
                            obj.update("<iframe name='extPowerFrame' " +
                                " src='power?managerId=0' width='100%' height='100%' frameborder='0' scrolling='no' />");
                        }
                    },
                    buttons: [
                        {
                            text: '保存权限配置',
                            handler: function () {
                                resolve(window["extPowerFrame"].window.getExtPower());
                                win.close();
                            }
                        }
                    ]
                });
                win.show();
            });
        };
        /**
         * 显示实体列表数据管理界面
         * @param menuId 菜单Id
         * @param entityCode 实体编号
         * @param where 筛选条件
         */
        System.showList = function (menuId, entityCode, where) {
            var entity = FastExt.System.getEntity(entityCode);
            if (!entity) {
                throw "操作失败！未获取到 '" + entityCode + "' 实体类！请检查实体类关联的表格是否存在！";
            }
            if (!entity.js) {
                throw "操作失败！未获取到 '" + entityCode + "' JS对象！";
            }
            if (!where) {
                where = {};
            }
            var entityJsObj = eval("new " + entityCode + "()");
            entityJsObj.menu = FastExt.System.getMenu(menuId);
            return entityJsObj.getList(where);
        };
        /**
         * 获取首页欢迎页面的组件
         * @return Ext.panel.Panel
         */
        System.getWelcomePanel = function () {
            var leftItems = [FastExt.System.getSystemOperate(), FastExt.System.getSystemWaitNotice()];
            if (FastExt.System.isSuperRole()) {
                leftItems.push(FastExt.System.getSystemBugReport());
            }
            var accordionPanel = Ext.create('Ext.panel.Panel', {
                layout: {
                    type: 'accordion'
                },
                region: 'center',
                border: 0,
                flex: 0.6,
                items: leftItems
            });
            var rightItems = [];
            if (FastExt.System.isSuperRole()) {
                rightItems.push(FastExt.System.getSystemVersion());
                rightItems.push(FastExt.System.getSystemConfig());
                rightItems.push(FastExt.System.getSystemMonitor());
            }
            var rightPanel = Ext.create('Ext.panel.Panel', {
                layout: 'accordion',
                region: 'east',
                border: 0,
                flex: 0.4,
                collapsed: false,
                split: true,
                subtitle: '系统右侧面板',
                items: rightItems
            });
            var items = [accordionPanel];
            if (rightItems.length > 0) {
                items.push(rightPanel);
            }
            //自定义welcome组件
            if (window["initWelcomeItems"]) {
                window["initWelcomeItems"](items);
            }
            if (!FastExt.Power.isPower()) {
                FastExt.System.startCheckSystemWait(true);
            }
            return Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'center',
                border: 0,
                items: items
            });
        };
        /**
         * 获取系统操作日志组件
         * @return Ext.grid.Panel
         */
        System.getSystemOperate = function () {
            var dataStoreTSystemOperatesModel = Ext.create('Ext.data.Store', {
                autoLoad: false,
                fields: [],
                id: 'SystemLogStore',
                idProperty: 'operateId',
                pageSize: 50,
                proxy: {
                    type: 'ajax',
                    url: 'entity/list',
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    reader: {
                        type: 'json',
                        root: 'list',
                        totalProperty: 'totalRow'
                    }
                }
            });
            var pagingtoolbar = Ext.create('Ext.toolbar.Paging', {
                store: dataStoreTSystemOperatesModel,
                dock: 'bottom',
                border: 0,
                overflowHandler: 'scroller',
                displayInfo: true
            });
            var dataGridTSystemOperatesModel = Ext.create('Ext.grid.Panel', {
                region: 'center',
                border: 0,
                power: true,
                multiColumnSort: true,
                iconCls: 'extIcon extLog',
                columnLines: true,
                title: '系统操作日志',
                hideHeaders: true,
                store: dataStoreTSystemOperatesModel,
                columns: [
                    {
                        header: '操作类型',
                        dataIndex: 'systemLogType',
                        align: 'center',
                        width: 120
                    },
                    {
                        header: '操作介绍',
                        dataIndex: 'systemLogContent',
                        align: 'center',
                        flex: 1
                    },
                    {
                        header: '操作时间',
                        dataIndex: 'systemLogDateTime',
                        width: 160,
                        align: 'center'
                    }, {
                        header: '操作',
                        dataIndex: 'systemLogId',
                        width: 100,
                        align: 'center',
                        renderer: function (val) {
                            return "<a href=\"javascript:FastExt.System.showSystemLogDetails(" + val + ");\">查看详情</a>";
                        }
                    }
                ],
                dockedItems: [pagingtoolbar],
                viewConfig: {
                    enableTextSelection: true,
                    loadMask: {
                        msg: '正在为您在加载数据…'
                    }
                }
            });
            pagingtoolbar.insert(pagingtoolbar.items.getCount() - 2, {
                xtype: 'button',
                iconCls: 'extIcon extSearch',
                tooltip: '搜索日志',
                handler: function () {
                    dataGridTSystemOperatesModel.add(FastExt.System.showSearchSysOperate(dataGridTSystemOperatesModel, this));
                }
            });
            pagingtoolbar.insert(pagingtoolbar.items.getCount() - 3, "-");
            dataStoreTSystemOperatesModel.on('beforeload', function (store, options) {
                var jsonData = {};
                if (dataGridTSystemOperatesModel.searchForm != null) {
                    jsonData = dataGridTSystemOperatesModel.searchForm.getValues();
                }
                Ext.apply(store.proxy.extraParams, jsonData);
                Ext.apply(store.proxy.extraParams, {
                    "entityCode": "ExtSystemLogEntity",
                    "limit": dataStoreTSystemOperatesModel.pageSize
                });
            });
            dataStoreTSystemOperatesModel.loadPage(1);
            return dataGridTSystemOperatesModel;
        };
        /**
         * 弹出系统操作日志的详情
         * @param id 日志ID
         * @return Ext.window.Window
         */
        System.showSystemLogDetails = function (id) {
            var store = Ext.getStore("SystemLogStore");
            var record = store.findRecord("systemLogId", id, 0, false, false, true);
            var buildData = function (data) {
                var array = [];
                var names = {
                    "a__managerName": "管理员",
                    "systemLogType": "操作类型",
                    "systemLogContent": "操作详情",
                    "systemLogIp": "来自IP",
                    "systemLogClient": "浏览器信息",
                    "systemSendData": "提交的数据",
                    "systemResultData": "返回的数据",
                    "systemLogDateTime": "操作时间"
                };
                for (var key in names) {
                    array.push({
                        "name": names[key],
                        "key": key,
                        "value": data[key]
                    });
                }
                return array;
            };
            var grid = FastExt.Grid.createDetailsGrid(buildData(record.getData()), {
                region: 'center',
                power: false,
                hideHeaders: true
            }, {
                width: 100,
                flex: 0,
            }, {
                align: 'left',
                renderer: function (val, m, record) {
                    m.style = 'overflow:auto;padding: 3px 6px;text-overflow: ellipsis;white-space:normal !important;line-height:20px;word-break:break-word; ';
                    var attr = record.get("key");
                    if (attr === "systemLogIp") {
                        return "<a href='https://www.baidu.com/s?wd=" + val + "' target='_blank'>" + val + "</a>";
                    }
                    return val;
                },
                listeners: {
                    dblclick: function (grid, obj, celNo, obj1, obj2, rowNo, e) {
                        var currRecord = grid.getStore().getAt(celNo);
                        var attr = currRecord.get("key");
                        if (attr === "systemSendData" || attr === "systemResultData") {
                            FastExt.Dialog.showFormatJson(obj, currRecord.get('value'));
                        }
                    }
                }
            });
            var win = Ext.create('Ext.window.Window', {
                title: "日志详情",
                height: 500,
                iconCls: 'extIcon extDetails',
                width: 500,
                layout: 'border',
                resizable: true,
                maximizable: true,
                items: [grid],
                modal: true,
                constrain: true,
            });
            win.show();
        };
        /**
         * 弹出搜索系统操作日志窗体
         * @return  Ext.window.Window
         */
        System.showSearchSysOperate = function (grid, obj) {
            if (!grid.searchForm) {
                grid.searchForm = Ext.create('Ext.form.FormPanel', {
                    bodyPadding: 5,
                    region: 'center',
                    autoScroll: true,
                    layout: "column",
                    defaults: {
                        labelWidth: 100,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        emptyText: '可输入…'
                    },
                    listeners: {
                        render: function (obj, eOpts) {
                            try {
                                new Ext.util.KeyMap({
                                    target: obj.getEl(),
                                    key: 13,
                                    fn: function () {
                                        grid.getStore().loadPage(1);
                                    },
                                    scope: this
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    },
                    items: [
                        {
                            fieldLabel: '关键字',
                            columnWidth: 1,
                            name: "where['^search']",
                            xtype: 'textfield'
                        }, {
                            fieldLabel: '开始时间',
                            columnWidth: 0.5,
                            name: "where['systemLogDateTime>=']",
                            xtype: 'datefield',
                            format: 'Y-m-d'
                        }, {
                            fieldLabel: '结束时间',
                            columnWidth: 0.5,
                            name: "where['systemLogDateTime<=']",
                            xtype: 'datefield',
                            format: 'Y-m-d'
                        },
                        {
                            fieldLabel: '操作用户',
                            columnWidth: 0.5,
                            name: "where['a__managerName%?%']",
                            xtype: 'textfield'
                        },
                        {
                            fieldLabel: '操作类型',
                            columnWidth: 0.5,
                            name: "where['systemLogType%?%']",
                            xtype: 'textfield'
                        }
                    ]
                });
                var title = obj.text;
                if (Ext.isEmpty(title)) {
                    title = "搜索系统日志";
                }
                grid.searchWin = Ext.create('Ext.window.Window', {
                    title: title,
                    closeAction: 'hide',
                    width: 500,
                    minWidth: 500,
                    minHeight: 110,
                    height: 230,
                    layout: 'border',
                    constrain: true,
                    iconCls: 'extIcon extSearch',
                    resizable: true,
                    collapsible: true,
                    animateTarget: obj,
                    items: [grid.searchForm],
                    buttons: [{
                            text: '重置',
                            iconCls: 'extIcon extReset',
                            handler: function () {
                                grid.searchForm.reset();
                                grid.getStore().loadPage(1);
                            }
                        },
                        {
                            text: '搜索',
                            iconCls: 'extIcon extSearch',
                            handler: function () {
                                grid.getStore().loadPage(1);
                            }
                        }]
                });
            }
            grid.searchWin.show();
            return grid.searchWin;
        };
        /**
         * 获取系统待办事项组件
         * @return Ext.grid.Panel
         */
        System.getSystemWaitNotice = function () {
            var entity = eval("new ExtSystemNoticeEntity()");
            entity.menu = {
                text: "系统问题上报"
            };
            var dataStoreNotice = Ext.create('Ext.data.Store', {
                autoLoad: false,
                fields: [],
                id: "SystemWaitNoticeStore",
                entity: entity,
                pageSize: 50,
                proxy: {
                    type: 'ajax',
                    url: 'entity/list',
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    reader: {
                        type: 'json',
                        root: 'list',
                        totalProperty: 'totalRow'
                    }
                }
            });
            var pagingtoolbar = Ext.create('Ext.toolbar.Paging', {
                store: dataStoreNotice,
                dock: 'bottom',
                border: 0,
                overflowHandler: 'scroller',
                displayInfo: true
            });
            var dataGridNotice = Ext.create('Ext.grid.Panel', {
                region: 'center',
                border: 0,
                power: true,
                multiColumnSort: true,
                iconCls: 'extIcon extTip',
                columnLines: true,
                title: '系统待办事项',
                hideHeaders: true,
                store: dataStoreNotice,
                columns: [
                    {
                        header: '待办标题',
                        dataIndex: 'noticeTitle',
                        align: 'center',
                        width: 200
                    },
                    {
                        header: '处理人',
                        dataIndex: 'a__managerName',
                        align: 'center',
                        flex: 1
                    },
                    {
                        header: '待办内容',
                        dataIndex: 'noticeStateStr',
                        align: 'center',
                        width: 120,
                    },
                    {
                        header: '录入时间',
                        dataIndex: 'noticeDateTime',
                        width: 200,
                        align: 'center'
                    }
                ],
                plugins: [{
                        ptype: 'rowexpander',
                        rowBodyTpl: new Ext.XTemplate('<p>【{noticeTitle}】{noticeContent}</p>', "<p>" +
                            "<tpl if='noticeState==0' >" +
                            "<a id='aNoticeAction{noticeId}' href='javascript:FastExt.System.setDoneSystemWait({noticeId});'>标记为已读</a>&nbsp;&nbsp;&nbsp;&nbsp;" +
                            "</tpl>" +
                            "<tpl if='noticeAction' >" +
                            "<a href=\"javascript:{noticeAction};\">立即前往</a>" +
                            "</tpl>" +
                            "</p>")
                    }],
                dockedItems: [pagingtoolbar],
                viewConfig: {
                    enableTextSelection: true,
                    loadMask: {
                        msg: '正在为您在加载数据…'
                    }
                }
            });
            dataStoreNotice.on('beforeload', function (store, options) {
                var jsonData = {};
                if (dataGridNotice.searchForm != null) {
                    jsonData = dataGridNotice.searchForm.getValues();
                }
                Ext.apply(store.proxy.extraParams, jsonData);
                Ext.apply(store.proxy.extraParams, {
                    "entityCode": "ExtSystemNoticeEntity",
                    "limit": dataStoreNotice.pageSize
                });
            });
            dataStoreNotice.loadPage(1);
            return dataGridNotice;
        };
        /**
         * 获取系统问题上报组件
         * @return Ext.grid.Panel
         */
        System.getSystemBugReport = function () {
            var entity = eval("new ExtBugReportEntity()");
            entity.menu = {
                text: "系统问题上报"
            };
            var dataStoreBugReport = Ext.create('Ext.data.Store', {
                autoLoad: false,
                fields: [],
                id: 'SystemBugReportStore',
                pageSize: 50,
                entity: entity,
                proxy: {
                    type: 'ajax',
                    url: 'entity/list',
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    reader: {
                        type: 'json',
                        root: 'list',
                        totalProperty: 'totalRow'
                    }
                }
            });
            var pagingtoolbar = Ext.create('Ext.toolbar.Paging', {
                store: dataStoreBugReport,
                dock: 'bottom',
                border: 0,
                overflowHandler: 'scroller',
                displayInfo: true
            });
            var dataGridBugReport = Ext.create('Ext.grid.Panel', {
                region: 'center',
                border: 0,
                power: true,
                multiColumnSort: true,
                iconCls: 'extIcon extBug',
                columnLines: true,
                title: '系统问题上报',
                hideHeaders: true,
                store: dataStoreBugReport,
                refreshCount: function () {
                    var me = this;
                    FastExt.Server.countReport(function (success, count) {
                        if (count > 0) {
                            me.setTitle("系统问题上报 <span style='color: red;font-size: small;'>待处理（" + count + "）</span>");
                        }
                        else {
                            me.setTitle("系统问题上报");
                        }
                    });
                },
                columns: [
                    {
                        header: '功能类型',
                        dataIndex: 'funcTypeStr',
                        align: 'center',
                        width: 100
                    },
                    {
                        header: '问题反馈',
                        dataIndex: 'bugContent',
                        align: 'center',
                        flex: 1,
                        renderer: FastExt.Renders.text()
                    },
                    {
                        header: '反馈状态',
                        dataIndex: 'reportStateStr',
                        width: 65,
                        align: 'center'
                    },
                    {
                        header: '上报时间',
                        dataIndex: 'reportDateTime',
                        width: 120,
                        align: 'center'
                    }, {
                        header: '操作',
                        dataIndex: 'reportId',
                        width: 100,
                        align: 'center',
                        renderer: function (val) {
                            return "<a href=\"javascript:FastExt.System.showBugReportDetails(" + val + ");\">查看详情</a>";
                        }
                    }
                ],
                dockedItems: [pagingtoolbar],
                viewConfig: {
                    enableTextSelection: true,
                    loadMask: {
                        msg: '正在为您在加载数据…'
                    }
                }
            });
            var beginIndex = 2;
            pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, "-");
            pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, {
                xtype: 'button',
                iconCls: 'extIcon extSearch',
                tooltip: '搜索问题',
                handler: function () {
                    dataGridBugReport.add(FastExt.System.showSearchBugReport(dataGridBugReport, this));
                }
            });
            pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, "-");
            pagingtoolbar.insert(pagingtoolbar.items.getCount() - beginIndex, {
                xtype: 'button',
                iconCls: 'extIcon extAdd grayColor',
                tooltip: '添加问题',
                handler: function () {
                    entity.showAdd(this).then(function () {
                        dataStoreBugReport.loadPage(1);
                    });
                }
            });
            dataStoreBugReport.on('beforeload', function (store, options) {
                var jsonData = {};
                if (dataGridBugReport.searchForm != null) {
                    jsonData = dataGridBugReport.searchForm.getValues();
                }
                Ext.apply(store.proxy.extraParams, jsonData);
                Ext.apply(store.proxy.extraParams, {
                    "entityCode": "ExtBugReportEntity",
                    "limit": dataStoreBugReport.pageSize
                });
            });
            dataStoreBugReport.on('load', function (store, records, successful, operation, eOpts) {
                dataGridBugReport.refreshCount();
            });
            dataStoreBugReport.loadPage(1);
            return dataGridBugReport;
        };
        /**
         * 标记待办事项已完成
         * @param noticeId 待办事项ID
         */
        System.setDoneSystemWait = function (noticeId) {
            FastExt.Dialog.showWait("正在标记中，请稍后……");
            FastExt.Server.doneWaitNotice(noticeId, function (success, message) {
                FastExt.Dialog.hideWait();
                if (success) {
                    FastExt.Dialog.toast(message);
                    $("#aNoticeAction" + noticeId).remove();
                    var winItem = Ext.getCmp("bNoticeAction" + noticeId);
                    if (winItem) {
                        Ext.getCmp("bNoticeAction" + noticeId).destroy();
                        var noticeWin = Ext.getCmp("NoticeAlertWindow");
                        if (noticeWin) {
                            var $type = $("[type='bNoticeAction']");
                            if ($type.length === 0) {
                                noticeWin.close();
                            }
                        }
                    }
                }
                else {
                    FastExt.Dialog.showAlert("系统提醒", message);
                }
            });
        };
        /**
         * 开启系统待办事项的监听
         * @param justRefresh 是否强制刷新所有待办
         */
        System.startCheckSystemWait = function (justRefresh) {
            window.clearTimeout(FastExt.Server.checkWaitNoticeTimer);
            var params = {};
            if (!justRefresh) {
                var $type = $("[type='bNoticeAction']");
                for (var i = 0; i < $type.length; i++) {
                    params["noticeId_" + i] = $($type[i]).attr("data-id");
                }
            }
            FastExt.Server.checkWaitNotice(params, function (success, data) {
                try {
                    if (success) {
                        var noticeWin_1 = Ext.getCmp("NoticeAlertWindow");
                        if (data.length <= 0 && Object.keys(params).length === 0) {
                            if (noticeWin_1) {
                                noticeWin_1.close();
                            }
                            return;
                        }
                        var winItems = [];
                        var needRefresh = false;
                        for (var i = 0; i < data.length; i++) {
                            var notice = data[i];
                            var noticePanel = {
                                xtype: 'fieldset',
                                margin: '10',
                                id: 'bNoticeAction' + notice.noticeId,
                                style: {
                                    background: '#ffffff'
                                },
                                columnWidth: 1,
                                viewModel: {
                                    data: notice
                                },
                                defaults: {
                                    anchor: '100%',
                                    height: 'auto',
                                    margin: '0',
                                    labelAlign: 'right',
                                    labelWidth: 0,
                                    columnWidth: 1,
                                    disabled: true,
                                    disabledCls: ".x-item-disabled-normal"
                                },
                                items: [
                                    {
                                        xtype: 'displayfield',
                                        bind: '{noticeContent}',
                                        renderer: function (val, field) {
                                            var viewData = field.ownerCt.viewModel.data;
                                            var html = "<b style='display: block;font-size: 16px;margin-bottom: 10px;'>" + viewData.noticeTitle + "</b>";
                                            html += "<div>" + val + "</div>";
                                            html += "<div style='margin-top: 10px;display: flex;' >" +
                                                "<a type='bNoticeAction' data-id='" + viewData.noticeId + "' href='javascript:FastExt.System.setDoneSystemWait(" + viewData.noticeId + ");'>标记为已读</a>";
                                            if (!Ext.isEmpty(viewData.noticeAction)) {
                                                html += "&nbsp;&nbsp;&nbsp;&nbsp;<a href=\"javascript:" + viewData.noticeAction + ";\">立即前往</a>";
                                            }
                                            html += "<span style='flex: 1;text-align: right;'>" + viewData.noticeDateTime + "</span>" +
                                                "</div>";
                                            html += "<div style='font-size: smaller;color: #a0a0a0;margin-top: 10px;'>注：如果已处理请标记为已读！</div>";
                                            return html;
                                        }
                                    }
                                ]
                            };
                            winItems.push(noticePanel);
                            if ($("#bNoticeAction" + notice.noticeId).length === 0) {
                                needRefresh = true;
                            }
                        }
                        if (!needRefresh && !justRefresh) {
                            return;
                        }
                        if (!noticeWin_1) {
                            noticeWin_1 = Ext.create('Ext.window.Window', {
                                title: '系统待办事项',
                                id: 'NoticeAlertWindow',
                                width: 400,
                                height: 400,
                                layout: 'column',
                                closable: false,
                                constrain: true,
                                iconCls: 'extIcon extTip',
                                resizable: false,
                                scrollable: true,
                                tools: [
                                    {
                                        type: 'refresh',
                                        callback: function () {
                                            Ext.getStore("SystemWaitNoticeStore").loadPage(1);
                                            FastExt.System.startCheckSystemWait(true);
                                        }
                                    }, {
                                        type: 'close',
                                        callback: function () {
                                            FastExt.Dialog.showWait("正在清除中，请稍后……");
                                            FastExt.Server.clearWaitNotice(function (success, message) {
                                                FastExt.Dialog.hideWait();
                                                if (success) {
                                                    noticeWin_1.close();
                                                }
                                                else {
                                                    FastExt.Dialog.showAlert("系统提醒", message);
                                                }
                                            });
                                        }
                                    }
                                ],
                                collapsible: true,
                            });
                            noticeWin_1.showAt($(window).width() * 5, $(window).width() * 5);
                        }
                        if (justRefresh) {
                            noticeWin_1.removeAll();
                            noticeWin_1.add(winItems);
                        }
                        else {
                            noticeWin_1.insert(0, winItems);
                            noticeWin_1.setScrollY(0, true);
                        }
                        if (window["onSystemNoticeShow"]) {
                            window["onSystemNoticeShow"]();
                        }
                    }
                }
                finally {
                    FastExt.Server.checkWaitNoticeTimer = setTimeout(function () {
                        FastExt.System.startCheckSystemWait();
                    }, 3000);
                }
            });
        };
        /**
         * 弹出问题详情的窗体
         * @param id 问题ID
         */
        System.showBugReportDetails = function (id) {
            var store = Ext.getStore("SystemBugReportStore");
            var record = store.findRecord("reportId", id, 0, false, false, true);
            var buildData = function (data) {
                var array = [];
                var names = {
                    "a__managerName": "上报用户",
                    "funcTypeStr": "功能类型",
                    "funcName": "功能名称",
                    "bugContent": "问题描述",
                    "bugFlow": "操作步骤",
                    "bugImagesHtml": "问题截图",
                    "fixInfo": "修改意见",
                    "reportStateStr": "上报状态",
                    "reportDateTime": "上报时间"
                };
                for (var key in names) {
                    array.push({
                        "name": names[key],
                        "value": data[key]
                    });
                }
                return array;
            };
            var grid = FastExt.Grid.createDetailsGrid(buildData(record.getData()), {
                region: 'center',
                power: false,
                hideHeaders: true
            }, {
                width: 100,
                flex: 0,
            }, {
                align: 'left'
            });
            var win = Ext.create('Ext.window.Window', {
                title: "问题详情",
                height: 500,
                iconCls: 'extIcon extDetails',
                width: 500,
                layout: 'border',
                resizable: true,
                maximizable: true,
                items: [grid],
                modal: true,
                constrain: true,
                buttons: [
                    "->",
                    {
                        text: '删除问题',
                        iconCls: 'extIcon extDelete whiteColor',
                        handler: function () {
                            Ext.Msg.show({
                                title: "系统提醒",
                                icon: Ext.Msg.QUESTION,
                                message: "您确定这条问题吗？",
                                buttons: Ext.Msg.YESNO,
                                defaultFocus: "no",
                                callback: function (button, text) {
                                    if (button === "yes") {
                                        FastExt.Store.commitStoreDelete(store, [record]).then(function () {
                                            win.close();
                                        });
                                    }
                                }
                            });
                        }
                    },
                    {
                        text: '反馈修改意见',
                        iconCls: 'extIcon extEdit',
                        handler: function () {
                            FastExt.Dialog.showEditor(this, "提交修改意见", function (text) {
                                record.set("fixInfo", text);
                                record.set("reportState", 1);
                                record.set("reportStateStr", "已处理");
                                FastExt.Store.commitStoreUpdate(store);
                                grid.updateData(buildData(record.getData()));
                            });
                        }
                    }
                ]
            });
            win.show();
        };
        /**
         * 弹出搜索系统问题的窗体
         * @param grid
         * @param obj
         * @return Ext.window.Window
         */
        System.showSearchBugReport = function (grid, obj) {
            if (!grid.searchForm) {
                grid.searchForm = Ext.create('Ext.form.FormPanel', {
                    bodyPadding: 5,
                    region: 'center',
                    autoScroll: true,
                    layout: "column",
                    defaults: {
                        labelWidth: 100,
                        margin: '5 5 5 5',
                        labelAlign: 'right',
                        emptyText: '可输入…'
                    },
                    listeners: {
                        render: function (obj, eOpts) {
                            try {
                                new Ext.util.KeyMap({
                                    target: obj.getEl(),
                                    key: 13,
                                    fn: function () {
                                        grid.getStore().loadPage(1);
                                    },
                                    scope: this
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    },
                    items: [
                        {
                            name: "where['funcType']",
                            xtype: "enumcombo",
                            fieldLabel: "功能类型",
                            columnWidth: 0.5,
                            enumName: "ExtBugFuncTypeEnum"
                        },
                        {
                            name: "where['reportState']",
                            xtype: "enumcombo",
                            fieldLabel: "上报状态",
                            columnWidth: 0.5,
                            enumName: "ExtBugReportStateEnum"
                        },
                        {
                            fieldLabel: '开始时间',
                            columnWidth: 0.5,
                            name: "where['reportDateTime>=']",
                            xtype: 'datefield',
                            format: 'Y-m-d'
                        },
                        {
                            fieldLabel: '结束时间',
                            columnWidth: 0.5,
                            name: "where['reportDateTime<=']",
                            xtype: 'datefield',
                            format: 'Y-m-d'
                        },
                        {
                            fieldLabel: '操作用户',
                            columnWidth: 0.5,
                            name: "where['a__managerName%?%']",
                            xtype: 'textfield'
                        },
                        {
                            fieldLabel: '关键字',
                            columnWidth: 0.5,
                            name: "where['systemLogContent%?%']",
                            xtype: 'textfield'
                        }
                    ]
                });
                var title = obj.text;
                if (Ext.isEmpty(title)) {
                    title = "搜索问题上报";
                }
                grid.searchWin = Ext.create('Ext.window.Window', {
                    title: title,
                    closeAction: 'hide',
                    width: 550,
                    minWidth: 500,
                    minHeight: 110,
                    height: 250,
                    layout: 'border',
                    constrain: true,
                    iconCls: 'extIcon extSearch',
                    resizable: true,
                    collapsible: true,
                    animateTarget: obj,
                    items: [grid.searchForm],
                    buttons: [{
                            text: '重置',
                            iconCls: 'extIcon extReset',
                            handler: function () {
                                grid.searchForm.reset();
                                grid.getStore().loadPage(1);
                            }
                        },
                        {
                            text: '搜索',
                            iconCls: 'extIcon extSearch',
                            handler: function () {
                                grid.getStore().loadPage(1);
                            }
                        }]
                });
            }
            grid.searchWin.show();
            return grid.searchWin;
        };
        /**
         * 获取系统版本信息的组件
         * @return Ext.grid.Panel
         */
        System.getSystemVersion = function () {
            var data = [
                {
                    "name": "项目名称",
                    "value": FastExt.System["title"].value
                },
                {
                    "name": "项目版本",
                    "value": FastExt.System["version"].desc
                },
                {
                    "name": "项目位置",
                    "value": FastExt.System["root"].value
                },
                {
                    "name": "操作文档",
                    "value": "<a href='" + FastExt.System["doc-extjs"].href + "' target='_blank' >" + FastExt.System["doc-extjs"].value + "</a>"
                },
                {
                    "name": "本机IP地址",
                    "value": FastExt.System["host"].value
                },
                {
                    "name": "系统环境",
                    "value": FastExt.System["os"].value
                },
                {
                    "name": "数据库",
                    "value": FastExt.System["db"].value
                },
                {
                    "name": "运行服务器",
                    "value": FastExt.System["server"].value
                },
                {
                    "name": "服务器位置",
                    "value": FastExt.System["catalina"].value
                },
                {
                    "name": "核心框架",
                    "value": "<a href='http://www.fastchar.com' target='_blank' >" + FastExt.System["fastchar"].value + "</a>"
                },
                {
                    "name": "开发语言",
                    "value": FastExt.System["java"].value + "+ExtJs6.2.0+HTML5+CSS3"
                },
                {
                    "name": "开发服务商",
                    "value": "<a href='" + FastExt.System["developer"].href + "' target='_blank'>" + FastExt.System["developer"].value + "</a>"
                }, {
                    "name": "版权归属",
                    "value": "<a href='" + FastExt.System.getExt("copyright").href + "' target='_blank'>" + FastExt.System.getExt("copyright").value + "</a>"
                }
            ];
            return FastExt.Grid.createDetailsGrid(data, {
                title: '系统基本信息',
                iconCls: 'extIcon extVersion',
                power: false,
                hideHeaders: true
            }, {}, {
                align: 'center'
            });
        };
        /**
         * 获取系统配置的组件
         * @return Ext.form.FormPanel
         */
        System.getSystemConfig = function () {
            var setPanel = Ext.create('Ext.form.FormPanel', {
                url: 'ext/config/saveSystemConfig',
                bodyPadding: 5,
                method: 'POST',
                region: 'center',
                power: false,
                border: 0,
                title: '系统全局设置',
                iconCls: 'extIcon extSet',
                autoScroll: true,
                defaults: {
                    labelWidth: 100,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    emptyText: '请填写'
                },
                viewModel: {
                    data: null
                },
                layout: "column",
                items: [
                    {
                        xtype: 'fieldset',
                        title: '基本设置',
                        columnWidth: 1,
                        defaults: {
                            anchor: '100%'
                        },
                        items: [
                            {
                                name: 'theme-color',
                                xtype: 'colorfield',
                                fieldLabel: '系统主题颜色',
                                columnWidth: 1,
                                bind: '{theme-color}'
                            },
                            {
                                name: 'front-color',
                                xtype: 'colorfield',
                                fieldLabel: '系统前景颜色',
                                columnWidth: 1,
                                bind: '{front-color}'
                            },
                            {
                                name: 'theme',
                                fieldLabel: '系统主题风格',
                                columnWidth: 1,
                                xtype: 'combo',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                value: 1,
                                bind: '{theme}',
                                store: FastExt.Store.getThemeDataStore()
                            },
                            {
                                name: 'window-anim',
                                fieldLabel: '系统窗体动画',
                                columnWidth: 1,
                                xtype: 'combo',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                value: 1,
                                bind: '{window-anim}',
                                store: FastExt.Store.getYesOrNoDataStore()
                            },
                            {
                                name: 'tab-record',
                                fieldLabel: '标签记忆功能',
                                columnWidth: 1,
                                xtype: 'combo',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                value: 1,
                                bind: '{tab-record}',
                                store: FastExt.Store.getYesOrNoDataStore()
                            },
                            {
                                name: 'font-size',
                                fieldLabel: '系统字体大小',
                                columnWidth: 1,
                                xtype: 'combo',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                value: 1,
                                bind: '{font-size}',
                                store: FastExt.Store.getFontSizeDataStore()
                            }
                        ]
                    },
                    {
                        xtype: 'button',
                        text: '恢复默认',
                        margin: '5 0 0 5',
                        columnWidth: 0.5,
                        handler: function () {
                            Ext.Msg.confirm("系统提醒", "您确定恢复系统默认的配置吗？", function (button, text) {
                                if (button === "yes") {
                                    FastExt.Dialog.showWait("请稍后……");
                                    setPanel.getForm().reset();
                                    FastExt.Server.deleteSystemConfig(function (success, message) {
                                        FastExt.Dialog.hideWait();
                                        if (success) {
                                            location.reload();
                                        }
                                        else {
                                            FastExt.Dialog.showAlert("系统提醒", message);
                                        }
                                    });
                                }
                            });
                        }
                    },
                    {
                        xtype: 'button',
                        text: '保存配置',
                        columnWidth: 0.5,
                        margin: '5 5 0 5',
                        handler: function () {
                            setPanel.doSubmit();
                        }
                    }
                ],
                doSubmit: function () {
                    var form = setPanel.form;
                    if (form.isValid()) {
                        form.submit({
                            waitMsg: '正在保存配置中……',
                            success: function (form, action) {
                                Ext.Msg.alert('系统设置', '设置保存成功！', function (btn) {
                                    if (btn === "ok") {
                                        location.reload();
                                    }
                                });
                            },
                            failure: function (form, action) {
                                Ext.Msg.alert('保存失败', action.result.message);
                            }
                        });
                    }
                }
            });
            FastExt.Server.showSystemConfig(function (success, data) {
                if (success) {
                    setPanel.getViewModel().setData(data);
                }
            });
            return setPanel;
        };
        /**
         * 获取系统监控信息的组件
         * @return Ext.panel.Panel
         */
        System.getSystemMonitor = function () {
            var monitorPanel = Ext.create('Ext.panel.Panel', {
                layout: 'column',
                region: 'north',
                power: false,
                border: 0,
                bodyPadding: 5,
                title: '系统监控信息',
                iconCls: 'extIcon extMonitor',
                closable: false,
                autoScroll: true
            });
            var loadData = function (container) {
                FastExt.Server.loadMonitor(function (success, result) {
                    container.removeAll();
                    if (!result) {
                        return;
                    }
                    var desc = result.desc;
                    var data = result.data;
                    var alertCount = 0;
                    for (var i = 0; i < desc.length; i++) {
                        var objDesc = desc[i];
                        var items = [];
                        for (var objDescKey in objDesc) {
                            if (objDescKey === 'title') {
                                continue;
                            }
                            var config = {
                                xtype: 'textfield',
                                fieldLabel: objDesc[objDescKey],
                                bind: '{' + objDescKey + '}'
                            };
                            items.push(config);
                        }
                        var objData = data[i];
                        var title = objDesc.title;
                        if (objData.alert) {
                            alertCount++;
                            title = "<b style='color: #c21904;'>" + title + "【预警】</b>";
                        }
                        var cpuPanel = {
                            xtype: 'fieldset',
                            title: title,
                            columnWidth: 1,
                            collapsible: true,
                            viewModel: {
                                data: objData
                            },
                            defaults: {
                                anchor: '100%',
                                labelAlign: 'right',
                                labelWidth: 80,
                                columnWidth: 1,
                                disabled: true,
                                disabledCls: ".x-item-disabled-normal"
                            },
                            items: items
                        };
                        container.add(cpuPanel);
                    }
                    var button = {
                        xtype: 'button',
                        text: '刷新信息',
                        columnWidth: 1,
                        margin: '5 5 5 5',
                        handler: function (obj) {
                            obj.setText("正在刷新");
                            obj.setDisabled(true);
                            loadData(container);
                        }
                    };
                    container.add(button);
                    if (alertCount > 0) {
                        container.setTitle("<b style='color: #c21904;' >系统监控信息（" + alertCount + "个预警）</b>");
                    }
                });
            };
            loadData(monitorPanel);
            return monitorPanel;
        };
        /**
         * 显示登录系统的窗口
         * @param container 窗口添加的容器
         */
        System.showLogin = function (container) {
            var loginTitle = $("title").text();
            var loginBgUrl = FastExt.System.getExt("login-background").href;
            var systemBgColor = FastExt.Color.toColor(FastExt.System.getExt("theme-color").value);
            var loginLogo = FastExt.System.getExt("login-logo").value;
            var loginNormal = FastExt.System.getExt("login-type").value === "normal";
            var copyright = FastExt.System.getExt("copyright").value;
            var copyrightUrl = FastExt.System.getExt("copyright").href;
            var indexUrl = FastExt.System.getExt("indexUrl").value;
            var version = FastExt.System.getExt("version").desc;
            var year = new Date().getFullYear();
            if (loginBgUrl.indexOf("?") === -1) {
                loginBgUrl = loginBgUrl + "?1=1";
            }
            if (loginBgUrl.indexOf("bg=") === -1) {
                loginBgUrl = loginBgUrl + "&bg=" + systemBgColor;
            }
            if (loginBgUrl.indexOf("dot=") === -1) {
                loginBgUrl = loginBgUrl + "&dot=" + systemBgColor;
            }
            var panel = Ext.create('Ext.panel.Panel', {
                layout: 'fit',
                border: 0,
                iframePanel: true,
                html: "<iframe name='loginFrame'  src='" + loginBgUrl + "' width='100%' height='100%' style='border: 0px; overflow-x: hidden;background-color: " + systemBgColor + "'/>",
            });
            var headHtml = "<div align='center' class='headPanel' style='color:" + systemBgColor + ";'><img class='loginLogo'  width='50px' height='50px;' src='" + loginLogo + "' /><h2>" + loginTitle + "</h2></div>";
            if (!loginLogo || loginLogo.length === 0) {
                headHtml = "<div align='center' class='headPanel' style='color:" + systemBgColor + ";'><h2>" + loginTitle + "</h2></div>";
            }
            var headPanel = Ext.create('Ext.panel.Panel', {
                region: 'north',
                layout: 'fit',
                bodyCls: 'bgNull',
                width: '100%',
                bodyStyle: {},
                border: 0,
                height: 'auto',
                html: headHtml
            });
            var loginName = $.cookie("loginName");
            var loginPassword = $.cookie("loginPassword");
            var loginMember = $.cookie("loginMember");
            if (!loginMember) {
                loginMember = 0;
            }
            var labelWidth = FastExt.Base.getNumberValue(FastExt.System.fontSize) * 3 + 8;
            var loginPanel = Ext.create('Ext.form.FormPanel', {
                url: FastExt.Server.loginUrl(),
                method: 'POST',
                fileUpload: true,
                bodyCls: 'bgNull',
                border: 0,
                width: '100%',
                layout: "anchor",
                region: 'center',
                bodyStyle: {},
                padding: '10 10 10 10',
                items: [
                    {
                        xtype: 'fieldset',
                        title: '',
                        layout: 'anchor',
                        padding: '10 10 0 10',
                        items: [
                            {
                                xtype: 'textfield',
                                fieldLabel: '登录名',
                                labelAlign: 'right',
                                labelWidth: labelWidth,
                                margin: '10 10 0 0',
                                name: 'loginName',
                                allowBlank: false,
                                blankText: '请输入登录名',
                                emptyText: '请输入登录名',
                                value: loginName,
                                anchor: "100%"
                            }, {
                                xtype: 'textfield',
                                fieldLabel: '密码',
                                labelAlign: 'right',
                                labelWidth: labelWidth,
                                inputType: 'password',
                                margin: '10 10 0 0',
                                allowBlank: false,
                                blankText: '请输入登录密码',
                                emptyText: '请输入登录密码',
                                value: loginPassword,
                                submitValue: false,
                                name: 'loginPassword',
                                anchor: "100%"
                            },
                            {
                                xtype: 'fieldcontainer',
                                labelWidth: 0,
                                anchor: "100%",
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                hidden: loginNormal,
                                items: [{
                                        xtype: 'textfield',
                                        fieldLabel: '验证码',
                                        labelAlign: 'right',
                                        labelWidth: labelWidth,
                                        margin: '10 10 0 0',
                                        allowBlank: loginNormal,
                                        flex: 1,
                                        name: 'validateCode',
                                        emptyText: '请输入验证码',
                                        blankText: '请输入验证码'
                                    }, {
                                        xtype: 'image',
                                        margin: '10 10 0 0',
                                        width: 70,
                                        cls: 'validCodeImg',
                                        id: 'imgCode',
                                        height: 32
                                    }]
                            },
                            {
                                name: 'loginMember',
                                fieldLabel: '记住',
                                xtype: 'combo',
                                labelAlign: 'right',
                                labelWidth: labelWidth,
                                margin: '10 10 0 0',
                                displayField: 'text',
                                valueField: 'id',
                                editable: false,
                                anchor: "100%",
                                value: loginMember,
                                submitValue: false,
                                allowBlank: false,
                                store: Ext.create('Ext.data.Store', {
                                    data: [
                                        { "id": "0", "text": "用户名" },
                                        { "id": "1", "text": "用户名和密码" }
                                    ]
                                })
                            },
                            {
                                xtype: 'fieldcontainer',
                                labelWidth: 0,
                                anchor: "100%",
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                items: [{
                                        xtype: 'button',
                                        text: '重置',
                                        iconCls: 'extIcon extReset',
                                        flex: 1,
                                        tipText: '重置数据',
                                        margin: '10 5 10 10',
                                        handler: function () {
                                            loginPanel.form.reset();
                                        }
                                    }, {
                                        xtype: 'button',
                                        text: '登录',
                                        id: 'btnLogin',
                                        tipText: '登录系统',
                                        margin: '10 10 10 5',
                                        iconCls: 'extIcon extOk',
                                        flex: 1,
                                        handler: function () {
                                            doLogin();
                                        }
                                    }]
                            }
                        ]
                    }
                ],
                listeners: {
                    'render': function (text) {
                        try {
                            new Ext.util.KeyMap({
                                target: text.getEl(),
                                key: 13,
                                fn: doLogin,
                                scope: Ext.getBody()
                            });
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
            });
            var refreshCode = function () {
                try {
                    loginPanel.form.findField("validateCode").reset();
                    Ext.getCmp("imgCode").setSrc("showCaptcha?t=" + Math.random());
                }
                catch (e) {
                }
            };
            var doLogin = function () {
                var form = loginPanel.form;
                if (form.isValid()) {
                    var onBeforeLogin = window["onBeforeLogin"];
                    if (onBeforeLogin) {
                        onBeforeLogin(form.getValues(), function () {
                            toLogin();
                        });
                    }
                    else {
                        toLogin();
                    }
                }
            };
            var toLogin = function () {
                var form = loginPanel.form;
                if (form.isValid()) {
                    var loginPassword_1 = loginPanel.form.findField("loginPassword").getValue();
                    var loginName_1 = loginPanel.form.findField("loginName").getValue();
                    var loginMember_1 = loginPanel.form.findField("loginMember").getValue();
                    var date = new Date();
                    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000)); //30天后失效
                    $.cookie("loginName", loginName_1, { expires: date });
                    $.cookie("loginMember", loginMember_1, { expires: date });
                    if (parseInt(loginMember_1) === 1) {
                        $.cookie("loginPassword", loginPassword_1, { expires: date });
                    }
                    else {
                        $.removeCookie("loginPassword");
                    }
                    form.submit({
                        params: {
                            loginPassword: $.md5(loginPassword_1)
                        },
                        waitMsg: '正在为您登录……',
                        success: function (form, action) {
                            FastExt.System.addScript({ src: indexUrl + '?v=' + FastExt.System.getExt("version").value });
                        },
                        failure: function (form, action) {
                            refreshCode();
                            if (action.result.code === -2) {
                                loginPanel.form.findField("loginPassword").reset();
                            }
                            Ext.Msg.alert('登录失败', action.result.message, function () {
                                if (action.result.code === -3) {
                                    loginPanel.form.findField("validateCode").focus();
                                }
                            });
                        }
                    });
                }
            };
            var targetValue = "_blank";
            if (copyrightUrl.startWith("javascript:")) {
                targetValue = "_self";
            }
            var bottomPanel = Ext.create('Ext.panel.Panel', {
                region: 'south',
                layout: 'fit',
                width: '100%',
                height: 50,
                bodyCls: 'bgNull',
                border: 0,
                html: "<div align='center'><a href='" + copyrightUrl + "' target='" + targetValue + "' style='font-size: xx-small;color:#aaa;text-decoration:none;'>" + copyright + "</a>" +
                    "</div><div align='center' style='font-size: xx-small;color:#aaa;margin-top: 5px;'>Copyright © " + year + " " + version + "</div>"
            });
            var win = Ext.create('Ext.window.Window', {
                title: '管理员登录',
                iconCls: 'extIcon extLogin',
                width: 420,
                resizable: false,
                layout: 'vbox',
                bodyCls: 'bgImage',
                closable: false,
                toFrontOnShow: true,
                // tools: [
                //     {
                //         type: 'help',
                //         callback: function () {
                //             setGrid(this, grid);
                //         }
                //     }
                // ],
                constrain: true,
                items: [headPanel, loginPanel, bottomPanel]
            });
            win.show(null, function () {
                Ext.getCmp("btnLogin").focus();
                try {
                    if (!loginNormal) {
                        refreshCode();
                        Ext.get('imgCode').on({
                            click: function () {
                                refreshCode();
                            }
                        });
                    }
                }
                catch (e) {
                }
            });
            container.add(panel);
            container.add(win);
        };
        /**
         * 系统默认的字体大小
         */
        System._fontSize = "14px";
        /**
         * 系统最后一次打开的tabId
         */
        System.lastTabId = -1;
        /**
         * 系统全局日期格式
         */
        System.dateFormat = 'Y-m-d H:i:s';
        /**
         * 系统是否已初始化
         */
        System.init = false;
        /**
         * 系统左侧菜单集合
         */
        System.menus = null;
        /**
         * 系统项目的HTTP地址，系统初始后赋值，例如：http://locahost:8080/fastchartest/
         */
        System.http = null;
        /**
         * 系统项目的根路径，例如：http://localhost:8080/
         */
        System.baseUrl = null;
        /**
         * 图片的正则表达式
         */
        System.regByImage = /\.(jpg|png|gif|jpeg)$/i;
        /**
         * MP4的正则表达式
         */
        System.regByMP4 = /\.(mp4)$/i;
        /**
         * Excel的正则表达式
         */
        System.regByExcel = /\.(xls|xlsx)$/i;
        /**
         * Word正则表达式
         */
        System.regByWord = /\.(doc)$/i;
        /**
         * Text正则表达式
         */
        System.regByText = /\.(txt)$/i;
        /**
         * 系统是否已全屏
         */
        System.fullscreen = false;
        /**
         * 是否已弹出会话失效的窗口
         */
        System.sessionOutAlert = false;
        /**
         * 是否已还原了Tab标签页
         */
        System.restoredTab = false;
        return System;
    }());
    FastExt.System = System;
    /**
     * 系统加载脚本类
     */
    var SystemScript = /** @class */ (function () {
        function SystemScript() {
        }
        Object.defineProperty(SystemScript.prototype, "src", {
            /**
             * js脚本的文件地址 与href相同
             */
            get: function () {
                return this._src;
            },
            set: function (value) {
                this._src = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SystemScript.prototype, "href", {
            /**
             * js脚本的文件地址 与src相同
             */
            get: function () {
                return this._href;
            },
            set: function (value) {
                this._href = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SystemScript.prototype, "text", {
            /**
             * js脚本代码。与src和href 互斥
             */
            get: function () {
                return this._text;
            },
            set: function (value) {
                this._text = value;
            },
            enumerable: false,
            configurable: true
        });
        return SystemScript;
    }());
    FastExt.SystemScript = SystemScript;
    /**
     * 兼容老版本方法调用
     */
    var SystemCompat = /** @class */ (function () {
        function SystemCompat() {
            window["getEntityDataStore"] = FastExt.Store.getEntityDataStore;
            window["getGridSelModel"] = FastExt.Grid.getGridSelModel;
            window["renders"] = FastExt.Renders;
            window["files"] = FastExt.FileModule;
            window["getPageToolBar"] = FastExt.Grid.getPageToolBar;
            window["getDetailsPanel"] = FastExt.Grid.getDetailsPanel;
            window["showWait"] = FastExt.Dialog.showWait;
            window["hideWait"] = FastExt.Dialog.hideWait;
            window["system"] = FastExt.System;
        }
        return SystemCompat;
    }());
    FastExt.SystemCompat = SystemCompat;
    for (var subClass in FastExt) {
        FastExt[subClass]();
    }
})(FastExt || (FastExt = {}));
