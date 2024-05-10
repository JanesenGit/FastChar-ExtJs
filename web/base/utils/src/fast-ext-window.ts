namespace FastExt {

    /**
     * javascript 原生window操作功能相关
     */
    export class Windows {
        private static _fullscreen: boolean = false;

        /**
         * http://localhost:8080/
         * @private
         */
        private static _baseUrl: string;


        static reload() {
            window.location.reload();
        }

        static isFullscreen() {
            return this._fullscreen;
        }

        static toggleFullscreen() {
            if (this.isFullscreen()) {
                this.outFullscreen();
            } else {
                this.inFullscreen();
            }
        }

        static getBaseUrl() {
            if (!this._baseUrl) {
                this._baseUrl = window.location.href;
                if (this._baseUrl.indexOf("#") > 0) {
                    this._baseUrl = this._baseUrl.split("#")[0];
                }
                // @ts-ignore
                if (!this._baseUrl.toString().endWith("/")) {
                    this._baseUrl = this._baseUrl + "/";
                }
            }
            return this._baseUrl;
        }

        /**
         * 控制浏览器界面进入全屏
         */
        static inFullscreen(): void {
            try {
                let element: any = document.documentElement;
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                }
            } catch (e) {
                console.error(e);
            } finally {
                this._fullscreen = true;
            }
        }

        /**
         * 退出全屏
         */
        static outFullscreen() {
            try {
                let element: any = document;
                if (element.exitFullscreen) {
                    element.exitFullscreen();
                } else if (element.msExitFullscreen) {
                    element.msExitFullscreen();
                } else if (element.mozCancelFullScreen) {
                    element.mozCancelFullScreen();
                } else if (element.webkitExitFullscreen) {
                    element.webkitExitFullscreen();
                }
            } catch (e) {
                console.error(e);
            } finally {
                this._fullscreen = false;
            }
        }


        /**
         * 解析地址栏中携带的菜单Id
         */
        static getMenuIdFromLocation() {
            let href = decodeURIComponent(window.location.href);
            if (href.indexOf("#") > 0) {
                return href.substring(href.lastIndexOf("/") + 1);
            }
            return null;
        }

        /**
         * 将菜单配置的历史记录中
         * @param menu
         */
        static pushLocationHistory(menu: any) {
            if (!menu) {
                menu = {};
            }
            let menuIdFromLocation = FastExt.Windows.getMenuIdFromLocation();
            if (menuIdFromLocation && menuIdFromLocation === menu.id) {
                return;
            }
            let state = {
                title: menu.text,
                url: menu.id ? this.getBaseUrl() + "#/" + menu.text + "/" + menu.id : this.getBaseUrl(),
            };
            window.history.pushState(state, menu.text, state.url);
        }

        /**
         * 移除全局加载的等待界面
         */
        static removeLoading() {
            $("#loading").remove();
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
            $(document.body).append(a);
            a.click();
            $(a).remove();
        }

    }


    /**
     * 兼容老版本方法调用
     */
    export class SystemCompat {
        //当fast-ext-utils文件加载时，初始化一次
        public static __onLoaded() {
            window["getEntityDataStore"] = FastExt.Store.getEntityDataStore;
            window["commitStoreUpdate"] = FastExt.Store.commitStoreUpdate;

            window["getGridSelModel"] = FastExt.Grid.getGridSelModel;
            window["renders"] = FastExt.Renders;
            window["files"] = FastExt.FileModule;
            window["getPageToolBar"] = FastExt.Grid.getPageToolBar;
            window["getDetailsPanel"] = FastExt.Grid.getDetailsPanel;
            window["system"] = FastExt.System;
            window["toBool"] = FastExt.Base.toBool;
            window["deleteGridData"] = FastExt.Grid.deleteGridData;
            window["updateGridData"] = FastExt.Grid.updateGridData;
            window["runCallBack"] = FastExt.Base.runCallBack;
            window["showDetailsWindow"] = FastExt.Grid.showDetailsWindow;

            window["showWait"] = FastExt.Dialog.showWait;
            window["hideWait"] = FastExt.Dialog.hideWait;
            window["toast"] = FastExt.Dialog.toast;
            window["showAlert"] = FastExt.Dialog.showAlert;
            window["showLink"] = FastExt.Dialog.showLink;
            window["showCode"] = FastExt.Dialog.showCode
            window["showEditorHtml"] = FastExt.Dialog.showEditorHtml;
            window["showException"] = FastExt.Dialog.showException;
            window["showJson"] = FastExt.Dialog.showJson;
            window["showVideo"] = FastExt.Dialog.showVideo;
            window["showImage"] = FastExt.Dialog.showImage;
            window["showText"] = FastExt.Dialog.showText;

            window["shakeComment"] = FastExt.Component.shakeComment;
            window["rotateOSSImgUrl"] = FastExt.Image.rotateOSSImgUrl;
            window["MemoryCache"] = FastExt.Cache.memory;

            window["buildUUID8"] = FastExt.Base.buildUUID8;
            window["openUrl"] = FastExt.Base.openUrl;

            window["server"] = FastExt.Server;
        }
    }

    /**
     * javascript 原生document操作功能相关
     */
    export class Documents {

        /**
         * 批量加载js文件
         * @param scriptPaths
         * @param callBack
         */
        static addScripts(scriptPaths: string[], callBack: any) {
            if (scriptPaths.length === 0) {
                callBack();
                return;
            }
            let loadScript = function (index: number, pluginCallBack: any) {
                if (index >= scriptPaths.length) {
                    pluginCallBack();
                    return;
                }
                FastExt.Documents.addScript(scriptPaths[index], () => {
                    loadScript(index + 1, pluginCallBack);
                });
            };
            loadScript(0, callBack);
        }

        /**
         * 动态加载js文件
         * @param script js文件对象 {src:""}
         * @param callBack
         * @see FastExt.SystemScript
         */
        static addScript(script: any, callBack?: any) {
            if (script == null) return;
            if (Ext.isString(script)) {
                script = {src: script};
            }
            let oHead = document.getElementsByTagName('head').item(0);
            let oScript: any = document.createElement("script");
            let isCode = false;
            oScript.type = "text/javascript";
            if (script.src != null && script.src.length > 0) {
                oScript.src = FastExt.Base.formatUrlVersion(script.src)
            } else if (script.href != null && script.href.length > 0) {
                oScript.src = FastExt.Base.formatUrlVersion(script.href);
            } else if (script.text) {
                try {
                    oScript.appendChild(document.createTextNode(script.text));
                } catch (ex) {
                    oScript.text = script.text;
                }
                isCode = true;
            } else {
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
        }

        /**
         * 动态加载css代码
         * @param styles css代码
         * @param callBack 加载成功后回调
         */
        static addStyles(styles: string[], callBack?: any) {
            if (styles.length === 0) {
                callBack();
                return;
            }
            let loadStyle = function (index: number, pluginCallBack: any) {
                if (index >= styles.length) {
                    pluginCallBack();
                    return;
                }
                FastExt.Documents.addStyle(styles[index], () => {
                    loadStyle(index + 1, pluginCallBack);
                });
            };
            loadStyle(0, callBack);
        }

        /**
         * 动态加载css代码
         * @param style css代码
         * @param callBack 加载成功后回调
         */
        static addStyle(style: any, callBack?: any) {
            if (Ext.isObject(style)) {
                FastExt.Documents.addStylesheet(style, callBack);
                return;
            }
            let oHead = document.getElementsByTagName('head').item(0);
            let oStyle: any = document.createElement("style");
            oStyle.type = "text/css";
            if (oStyle.styleSheet) {
                oStyle.styleSheet.cssText = style;
            } else {
                oStyle.innerHTML = style;
            }
            if (callBack != null) {
                callBack();
            }
            oHead.appendChild(oStyle);
            return oStyle;
        }

        /**
         * 删除样式标签
         * @param code
         */
        static removeStyle(code: string) {
            let styles = document.getElementsByTagName('style');
            for (let i = 0; i < styles.length; i++) {
                let style = styles[i];
                if (style["code"] === code) {
                    style.parentNode.removeChild(style);
                }
            }
        }

        /**
         * 动态加载style文件
         * @param cssPaths
         * @param callBack
         */
        static addStylesheets(cssPaths: string[], callBack: any) {
            if (cssPaths.length == 0) {
                callBack();
                return;
            }
            let loadStyle = function (index: number, pluginCallBack: any) {
                if (index >= cssPaths.length) {
                    pluginCallBack();
                    return;
                }
                FastExt.Documents.addStylesheet({href: cssPaths[index]}, () => {
                    loadStyle(index + 1, pluginCallBack);
                });
            };
            loadStyle(0, callBack);
        }

        /**
         * 动态加载style文件
         * @param link 文件地址 {href:""}
         * @param callBack
         */
        static addStylesheet(link: any, callBack: any) {
            if (link == null) return;
            if (link.text) {
                FastExt.Documents.addStyle(link.text, callBack);
                return;
            }

            let oHead = document.getElementsByTagName('head').item(0);
            let oLink: any = document.createElement("link");
            oLink.rel = "stylesheet";
            oLink.href = FastExt.Base.formatUrl(link.href || link.src);
            oHead.appendChild(oLink);
            oLink.onload = oLink.readystatechange = function () {
                if (callBack != null) {
                    callBack();
                }
            };
            oLink.onerror = function () {
                alert("系统Link文件" + link.href + "加载失败，请您稍后重试！");
            };
        }

        /**
         * 添加link图标
         * @param link
         * @param callBack
         */
        static addIcon(link: any, callBack: any) {
            if (link == null) return;
            let oHead = document.getElementsByTagName('head').item(0);
            let oLink: any = document.createElement("link");
            oLink.rel = "icon";
            oLink.type = "image/png";
            oLink.href = FastExt.Base.formatUrl(link.href || link.src);
            oHead.appendChild(oLink);
            if (callBack != null) {
                callBack();
            }
        }

        /**
         * 添加标题标签
         * @param title
         * @param callBack
         */
        static addTitle(title: string, callBack: any) {
            let oHead = document.getElementsByTagName('head').item(0);
            let oTitle: any = document.createElement("title");
            oTitle.innerHTML = title;
            oHead.appendChild(oTitle);
            if (callBack != null) {
                callBack();
            }
        }



        /**
         * 当点击标签时触发
         */
        static onClickFromDataClick(obj) {
            let functionStr = Ext.util.Base64.decode($(obj).attr("data-click-function"));
            eval(functionStr);
        }

        /**
         * 给html的标签绑定onclick事件
         * @param html
         * @param onClickFunction
         * @param wrapDivAttrs 设置可点击的div的属性
         */
        static wrapOnClick(html: string, onClickFunction: string,wrapDivAttrs?:string): string {
            if(Ext.isEmpty(wrapDivAttrs)) {
                wrapDivAttrs = "";
            }
            let divId = FastExt.Base.buildOnlyCode("WRP");
            return "<div " + wrapDivAttrs + " data-click-function='" + Ext.util.Base64.encode(onClickFunction) + "' id='"
                + divId + "' onmouseover='FastExt.Documents.onWrapTagMouseOver(\"" + divId + "\")'>" +
                html +
                "</div>";
        }


        static onWrapTagMouseOver(id: string) {
            let targetEl = document.getElementById(id);
            if (targetEl) {
                let bindClick = targetEl.getAttribute("data-bind-click");
                if (bindClick) {
                    return false;
                }
                targetEl.setAttribute("data-bind-click", "true");
                let clickFunctionStr = targetEl.getAttribute("data-click-function");
                targetEl.addEventListener('mousedown', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                });
                targetEl.addEventListener('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    let functionStr = Ext.util.Base64.decode(clickFunctionStr);
                    eval(functionStr);
                    return false;
                });
            }
            return false;
        }


        /**
         * 动态加载字符串函数，字符串的函数必须为匿名
         * @param functionStr
         * @returns 函数对象
         * @example
         * loadFunction("function(val){return val+1;}");
         */
        static loadFunction(functionStr: string): any {
            try {
                // @ts-ignore
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
                    // 不可使用此方法，会照成函数内变量作用域不同
                    // return eval("(function(){return " + functionStr + " })()");
                }
            } catch (e) {
            }
            return function () {
            };
        }

        /**
         * 获取滚动条的宽度
         */
        static getScrollBarWidth() {
            let el = document.createElement("p"),
                styles = {
                    width: "100px",
                    height: "100px",
                    overflowY: "scroll"
                },
                i;

            for (i in styles) {
                el.style[i] = styles[i];
            }
            document.body.appendChild(el);
            let scrollBarWidth = el.offsetWidth - el.clientWidth;
            el.remove();
            return scrollBarWidth;
        }

    }

    /**
     * 系统加载脚本类
     */
    export class SystemScript {

        private _src: string;


        private _href: string;


        private _text: string;

        /**
         * js脚本的文件地址 与href相同
         */
        get src(): string {
            return this._src;
        }

        set src(value: string) {
            this._src = value;
        }

        /**
         * js脚本的文件地址 与src相同
         */
        get href(): string {
            return this._href;
        }

        set href(value: string) {
            this._href = value;
        }

        /**
         * js脚本代码。与src和href 互斥
         */
        get text(): string {
            return this._text;
        }

        set text(value: string) {
            this._text = value;
        }
    }

    export class Browsers {
        /**
         * 检测IE浏览器版本，不符合允许条件的阻止使用
         */
        static checkBrowserVersion(): boolean {
            if (Ext.isIE && Ext.ieVersion < 11) {
                let win = Ext.create('Ext.window.Window', {
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
        }

    }
}