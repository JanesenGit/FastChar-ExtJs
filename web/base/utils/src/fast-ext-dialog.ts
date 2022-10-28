namespace FastExt {

    /**
     * 全局弹框相关操作
     */
    export class Dialog {

        /**
         * 显示等待窗口
         * @param message 等待的消息
         */
        static showWait(message: string) {
            Ext.MessageBox.show({
                modal: true,
                title: '系统提醒',
                msg: message,
                iconCls: "extIcon extTimer",
                progressText: '请耐心等待，即将完成操作',
                progress: true,
                closable: false,
            });
            let i = 0;
            let max = 100;
            let fn = function () {
                if (Ext.MessageBox.isHidden()) return;
                i = i + 0.5;
                if (i === max + 30) {
                    i = 0;
                }
                let val = i / max;
                Ext.MessageBox.updateProgress(val, '请耐心等待，即将完成操作');
                Ext.MessageBox.timeoutProcess = setTimeout(fn, 5);
            };
            if (Ext.MessageBox.timeoutProcess) {
                clearTimeout(Ext.MessageBox.timeoutProcess);
            }
            Ext.MessageBox.timeoutProcess = setTimeout(fn, 5);
        }

        /**
         * 关闭等待框
         */
        static hideWait() {
            if (Ext.MessageBox.isVisible()) {
                Ext.MessageBox.close();
            }
        }


        /**
         * 显示自动消失的消息
         * @param message 消息内容
         */
        static toast(message) {
            let maxWidth = parseInt((document.body.clientWidth * 0.7).toFixed(0));
            let defaultAutoCloseDelay = 2000;
            let textLength = $("<div>" + message + "</div>").text().length;
            if (textLength > 8) {
                defaultAutoCloseDelay = 3000;
            }
            if (textLength > 50) {
                defaultAutoCloseDelay = 5000;
            }
            if (textLength > 80) {
                defaultAutoCloseDelay = 8000;
            }
            Ext.toast({
                html: message,
                closable: true,
                align: 't',
                slideInDuration: 200,
                slideBackDuration: 200,
                minWidth: 180,
                autoCloseDelay: defaultAutoCloseDelay,
                maxWidth: maxWidth,
                justTop: true,
                unpin: false,
                slideBackAnimation: 'easeOut',
                iconCls: 'extIcon extInfo',
                title: '消息提示'
            });
        }

        /**
         * 弹窗显示网页内容
         * @param obj 弹框动画对象
         * @param title 标题
         * @param content 内容
         * @param modal 模式窗口
         */
        static showHtml(obj, title, content, modal) {
            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));
            if (Ext.isEmpty(modal)) {
                modal = true;
            }

            let win = Ext.create('Ext.window.Window', {
                title: title,
                layout: 'fit',
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 600,
                constrain: true,
                resizable: true,
                maximizable: true,
                modal: modal,
                maximized: false,
                iconCls: 'extIcon extSee',
                draggable: true,
                scrollable: true,
                html: content,
                toFrontOnShow: true
            });
            win.show();
        }


        /**
         * 弹窗显示url网页内容
         * @param obj 弹框动画对象
         * @param title 标题
         * @param url 网页地址
         * @param config 扩展Ext.window.Window的配置 json对象
         */
        static showLink(obj, title, url, config, loadDoneCallBack) {
            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));
            let iframeName = "iFrameLink" + new Date().getTime();
            let loadFunName = "iFrameLoadDone" + new Date().getTime();
            let iframePanel = Ext.create('Ext.container.Container', {
                layout: 'border',
                region: 'center',
                border: 0,
                iframePanel: true
            });
            window[loadFunName] = function () {
                iframePanel.setLoading(false);
                if (Ext.isFunction(loadDoneCallBack)) {
                    loadDoneCallBack(iframeName);
                }
                window[loadFunName] = null;
            };
            let defaultConfig = {
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
                toFrontOnShow: true,
                items: [iframePanel],
                listeners: {
                    show: function () {
                        iframePanel.setLoading("正在努力加载中，请稍后……");
                        let html = "<iframe name='" + iframeName + "' onload='" + loadFunName + "()' src='" + url + "'  width='100%' height='100%' frameborder='0'>";
                        iframePanel.update(html);
                    },
                    close: function () {
                        window[loadFunName] = null;
                    }
                }
            };
            let win = Ext.create('Ext.window.Window', FastExt.Json.mergeJson(defaultConfig, config));
            win.show();
        }

        /**
         * 显示编辑器生成的网页内容
         * @param obj 弹框动画对象
         * @param title 标题
         * @param content 内容
         * @param config 扩展Ext.window.Window的配置 json对象
         */
        static showEditorHtml(obj, title, content, config?) {
            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.8).toFixed(0));
            let iframeName = "ShowEditorFrame" + new Date().getTime();
            let iframePanel = Ext.create('Ext.container.Container', {
                layout: 'border',
                region: 'center',
                border: 0,
                iframePanel: true,
            });

            let win = Ext.create('Ext.window.Window', {
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
                toFrontOnShow: true,
                items: [iframePanel],
                listeners: {
                    show: function (obj, eOpts) {
                        let url = FastExt.System.formatUrlVersion("base/editor/show.html");
                        window[iframeName + "ShowEditorDone"] = function () {
                            window[iframeName].window.showContent(content);
                        };
                        let html = "<iframe name='" + iframeName + "' src='" + url + "'  width='100%' height='100%' frameborder='0'>";
                        iframePanel.update(html);
                    },
                    destroy: function () {
                        window[iframeName] = null;
                        window[iframeName + "ShowEditorDone"] = null;
                    },
                },
                buttons: [
                    {
                        text: '打印',
                        iconCls: 'extIcon extPrint',
                        handler: function () {
                            window[iframeName].window.print();
                        }
                    }
                ]
            });
            win.show();
        }

        /**
         * 显示纯文本内容
         * @param obj 弹框动画对象
         * @param title 标题
         * @param text 内容
         * @param modal 模式窗口
         */
        static showContent(obj, title, text, modal?) {
            this.showText(obj, null, title, text, modal);
        }

        /**
         * 显示纯文本内容
         * @param obj 弹框动画对象
         * @param icon 窗体图标
         * @param title 标题
         * @param text 内容
         * @param modal 模式窗口
         */
        static showText(obj, icon, title, text, modal?) {
            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));
            if (Ext.isEmpty(icon)) {
                icon = 'extIcon extSee';
            }
            if (Ext.isEmpty(modal)) {
                modal = true;
            }
            let win = Ext.create('Ext.window.Window', {
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
                modal: modal,
                constrain: true,
            });
            win.show();
        }

        /**
         * 显示代码内容
         * @param obj 弹框动画对象
         * @param value 代码内容
         * @param linenumber 是否显示代码行数
         * @param lang prettify指定开发语言类型{@link https://github.com/googlearchive/code-prettify/blob/master/docs/getting_started.md}
         */
        static showCode(obj, value, linenumber?: boolean, lang?: string) {
            try {
                if (obj && Ext.isFunction(obj.blur)) {
                    obj.blur();
                }
                if (Ext.isEmpty(lang)) {
                    lang = "";
                }
                let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));
                let win = Ext.create('Ext.window.Window', {
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
                    win.update("<pre class='prettyprint " + lang + " linenums windowpre'>" + value + "</pre>");
                } else {
                    win.update("<pre class='prettyprint " + lang + " windowpre'>" + value + "</pre>");
                }
                win.show();
            } catch (e) {
                FastExt.Dialog.showText(obj, null, "查看内容", value);
            }
        }


        /**
         * 格式化显示SQL语句内容
         * @param obj 弹框动画对象
         * @param value sql代码内容
         */
        static showSql(obj, value) {
            try {
                value = sqlFormatter.format(value);
                FastExt.Dialog.showCode(obj, value, false, "lang-sql");
            } catch (e) {
                FastExt.Dialog.showText(obj, null, "查看内容", value);
            }
        }

        /**
         * 弹出异常信息
         * @param e 异常对象
         * @param from 来自功能
         */
        static showException(e, from?: string) {
            if (!e) return;
            FastExt.Dialog.hideWait();
            let isDebug = FastExt.Base.toBool(FastExt.System.getExt("debug").value, false);
            if (isDebug) {
                let message = e;
                if (e instanceof Error) {
                    message = e.stack;
                    message = message.replace(/\n/g, "<br/>")
                        .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
                        .replace(/ /g, "&nbsp;&nbsp;");
                }
                if (from != null) {
                    from += "，来自" + from;
                } else {
                    from = "";
                }
                let win = Ext.create('Ext.window.Window', {
                    title: '系统异常',
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
                    html: "<div  style='padding:15px;background: #fff;' align='center'>【" + from + "】系统发生异常，请及时告知系统管理员！</div>",
                    buttons: [
                        {
                            text: '下次再说',
                            flex: 1,
                            iconCls: 'extIcon extClose whiteColor',
                            handler: function () {
                                win.close();
                            }
                        }, {
                            text: '查看错误',
                            flex: 1,
                            iconCls: 'extIcon extException whiteColor',
                            handler: function () {
                                FastExt.Dialog.showCode(this, message, true);
                            }
                        }]
                });
                win.show();
            }
            if (FastExt.Base.toString(from, "").indexOf("请求异常") >= 0) {
                return;
            }
            console.error(e);
        }


        /**
         * 弹出Alert对话框
         * @param title 标题
         * @param message 消息
         * @param callback 点击按钮的回调函数 Ext.MessageBox.fn ,点击按钮对应返回值 确定：ok
         * @param modal 是否有背景阴影层
         * @param animateDisable 禁用弹框动画
         */
        static showAlert(title, message, callback?, modal?, animateDisable?) {
            if (Ext.isEmpty(modal)) {
                modal = true;
            }
            FastExt.Dialog.hideWait();
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
                        xtype: "label",
                        maxWidth: 380,
                        html: message,
                    }
                ],
            });

            let alertWindow = Ext.create('Ext.window.Window', {
                title: title,
                iconCls: 'extIcon extInfo2',
                maxWidth: 500,
                maxHeight: 800,
                minWidth: 220,
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'middle'
                },
                constrain: true,
                resizable: false,
                unpin: false,
                items: [formPanel],
                modal: modal,
                animateDisable: animateDisable,
                listeners: {
                    show: function (obj) {
                        obj.focus();
                    },
                    render: function (obj, eOpts) {
                        new Ext.util.KeyMap({
                            target: obj.getEl(),
                            key: 13,
                            fn: function (keyCode, e) {
                                alertWindow.close();
                                if (Ext.isFunction(callback)) {
                                    callback("ok");
                                }
                            },
                            scope: this
                        });
                    }
                },
                buttons: [
                    '->',
                    {
                        text: "确定",
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            let parentWindow = this.up("window");
                            if (parentWindow) {
                                parentWindow.close();
                            }
                            if (Ext.isFunction(callback)) {
                                callback("ok");
                            }
                        }
                    },
                    '->'
                ],

            });
            alertWindow.show();
        }


        /**
         * 查看图片
         * @param obj 弹框动画对象
         * @param url 图片地址 String或JsonArray
         * @param callBack 回调函数
         * @param modal 是否有背景阴影层
         */
        static showImage(obj, url, callBack, modal?: boolean) {
            if (FastExt.Cache.memory.hasOwnProperty(url)) {
                //如果缓存中存在，则从缓存中获取地址
                url = FastExt.Cache.memory[url];
            }
            FastExt.Image.showImage(obj, url, callBack, modal);
        }


        /**
         * 播放视频，使用插件：https://dplayer.diygod.dev/zh/guide.html#special-thanks
         * @param obj 弹框动画对象
         * @param videoUrl 视频地址
         */
        static showVideo(obj, videoUrl) {
            if (obj && Ext.isFunction(obj.blur)) {
                obj.blur();
            }
            //视频播放器的大小固定
            let win = Ext.create('Ext.window.Window', {
                title: '播放视频',
                layout: 'fit',
                height: 620,
                width: 700,
                resizable: false,
                constrain: true,
                maximizable: false,
                modal: true,
                maximized: false,
                iconCls: 'extIcon extSee',
                draggable: true,
                scrollable: false,
                toFrontOnShow: true,
                listeners: {
                    show: function () {
                        let url = FastExt.System.formatUrlVersion("base/video/player.html");
                        window["getVideoUrl"] = function () {
                            return videoUrl;
                        };
                        let html = "<iframe allowfullscreen='allowfullscreen' mozallowfullscreen='mozallowfullscreen' msallowfullscreen='msallowfullscreen' oallowfullscreen='oallowfullscreen' webkitallowfullscreen='webkitallowfullscreen' style='background-color: black;' name='showVideoFrame' src='" + url + "'  width='100%' height='100%' frameborder='0' scrolling='no' >";
                        this.update(html);
                    }
                }
            });
            win.show();
        }


        /**
         * 弹出大文本编辑框
         * @param obj 弹框对象
         * @param title 标题
         * @param callBack 回调函数   callBack(Ext.getCmp(areaId).getValue());
         * @param defaultValue 默认值
         */
        static showEditor(obj, title, callBack, defaultValue?) {
            if (obj && Ext.isFunction(obj.blur)) {
                obj.blur();
            }
            let time = new Date().getTime();
            let areaId = "PublicTextArea" + time;
            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));
            let editorWin = Ext.create('Ext.window.Window', {
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
                    value: defaultValue,
                    xtype: 'textarea'
                }],
                modal: true,
                constrain: true,
                unpin: true,
                listeners: {
                    show: function (obj) {
                        FastExt.Server.showExtConfig("PublicEditor", "TextEditorCache", function (success, value) {
                            let areaField = Ext.getCmp(areaId);
                            if (areaField) {
                                if (success) {
                                    areaField.setValue(value);
                                }
                                areaField.focus();
                            }
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
                                } else {
                                    FastExt.Dialog.showAlert("系统提醒", message);
                                }
                            });
                        }
                    },
                    {
                        text: '重置',
                        iconCls: 'extIcon extReset',
                        handler: function () {
                            let areaField = Ext.getCmp(areaId);
                            if (areaField) {
                                areaField.setValue(null);
                            }
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
                    }]
            });
            editorWin.show();
        }


        /**
         * 格式化显示json字符串
         * @param obj 弹框对象
         * @param title 标题
         * @param value 弹框内容
         */
        static showJson(obj, title, value) {
            FastExt.Json.showFormatJson(obj, value, title);
        }

        /**
         * 格式化显示json字符串
         * @param obj
         * @param value
         */
        static showFormatJson(obj, value) {
            FastExt.Json.showFormatJson(obj, value);
        }

        /**
         * 查看lottie动效
         * @param obj 弹框动画对象
         * @param jsonPath lottie的json文件路径
         */
        static showLottie(obj, jsonPath) {
            FastExt.Lottie.showLottie(obj, jsonPath);
        }


        /**
         * 弹出日期时间选择控件
         * @param obj 需要弹出的目标控件
         * @param defaultValue 默认日期时间
         * @param dateFormat 日期时间的格式
         * @return Ext.Promise
         */
        static showFastDatePicker(obj, defaultValue, dateFormat) {
            return FastExt.Dates.showDatePicker(obj, defaultValue, dateFormat);
        }

        /**
         * 弹出颜色选择控件
         * @param obj 需要弹出的目标控件
         * @param defaultValue 默认颜色
         * @param onColorChange 颜色变化的监听
         * @return Ext.Promise
         */
        static showFastColorPicker(obj, defaultValue, onColorChange) {
            return FastExt.Color.showColorPicker(obj, defaultValue, onColorChange);
        }


        /**
         * 播放音乐
         * @param obj 弹窗动画对象
         * @param musicUrl 音乐路径
         */
        static showMusic(obj, musicUrl) {
            if (obj && Ext.isFunction(obj.blur)) {
                obj.blur();
            }
            let idPrefix = new Date().getTime();
            //音乐播放器的大小固定
            let win = Ext.create('Ext.window.Window', {
                title: '播放音频',
                layout: 'fit',
                height: 230,
                width: 700,
                resizable: false,
                constrain: true,
                maximizable: false,
                modal: true,
                maximized: false,
                iconCls: 'extIcon extSee',
                draggable: true,
                scrollable: false,
                toFrontOnShow: true,
                items: [
                    {
                        xtype: 'container',
                        layout: 'border',
                        iframePanel: true,
                        itemId: "playerPanel"
                    }
                ],
                listeners: {
                    show: function (winObj) {
                        let playerPanel = this.down("#playerPanel");
                        playerPanel.setLoading("加载音频文件中，请稍后……");
                        let url = FastExt.System.formatUrlVersion("base/music/player.html");
                        let html = "<iframe allowfullscreen='allowfullscreen' mozallowfullscreen='mozallowfullscreen' msallowfullscreen='msallowfullscreen' oallowfullscreen='oallowfullscreen' webkitallowfullscreen='webkitallowfullscreen' style='background-color: black;' name='showMusicFrame' src='" + url + "'  width='100%' height='100%' frameborder='0' scrolling='no' >";
                        playerPanel.update(html);

                        window["getMusicUrl"] = function () {
                            return musicUrl;
                        };
                        window["onMusicChange"] = function (state, obj) {
                            if (state === "ready") {
                                winObj.getComponent("playerPanel").setLoading(false);
                                obj.play();
                            } else if (state === "play") {
                                Ext.getCmp("btnPlay" + idPrefix).setIconCls("extIcon extPause");
                            } else if (state === "pause") {
                                Ext.getCmp("btnPlay" + idPrefix).setIconCls("extIcon extPlay");
                            } else if (state === "finish") {
                                obj.seekTo(0);
                            } else if (state === "mute") {
                                if (obj.getMute()) {
                                    Ext.getCmp("btnMute" + idPrefix).setIconCls("extIcon extMute");
                                } else {
                                    Ext.getCmp("btnMute" + idPrefix).setIconCls("extIcon extUnmute");
                                }
                            } else if (state === "loading") {
                                winObj.getComponent("playerPanel").setLoading("加载音频文件中，请稍后……");
                            } else if (state === "audioprocess" || state === "seek") {
                                let currPlayStr = FastExt.Dates.formatMillisecond(obj.getCurrentTime() * 1000, 'i:s');
                                let totalPlayStr = FastExt.Dates.formatMillisecond(obj.getDuration() * 1000, 'i:s');
                                winObj.setTitle("播放音乐  " + currPlayStr + " / " + totalPlayStr);
                            }
                        };
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
                            id: "btnPlay" + idPrefix,
                            iconCls: 'extIcon extPlay',
                            action: "play",
                            handler: function () {
                                window["showMusicFrame"].window.switchPlay();
                            }
                        },
                        {
                            xtype: 'button',
                            id: "btnStop" + idPrefix,
                            iconCls: 'extIcon extStop',
                            handler: function () {
                                window["showMusicFrame"].window.stop();
                            }
                        },
                        {
                            xtype: 'button',
                            id: "btnMute" + idPrefix,
                            iconCls: 'extIcon extUnmute',
                            handler: function () {
                                window["showMusicFrame"].window.switchMute();
                            }
                        }
                    ]
                }
            });
            win.show();
        }


        /**
         * 弹出删除数据等无法撤销的操作确认框
         * @param title 标题
         * @param message 消息
         * @param confirmCallBack 确认后回调
         * @param confirmButtonText 确认按钮的文字，默认：删除
         */
        static showDeleteDataAlert(title: string, message: string, confirmCallBack: any, confirmButtonText?: string) {
            if (Ext.isEmpty(confirmButtonText)) {
                confirmButtonText = "删除";
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
                        jsonPath: 'base/lottie/amazed.json',
                    },
                    {
                        xtype: "label",
                        maxWidth: 250,
                        text: message,
                    },
                    {
                        xtype: "checkboxfield",
                        boxLabel: "我已了解此操作是永久性且无法撤销",
                        listeners: {
                            change: function (obj, newValue) {
                                deleteConfirmWindow.down("#deleteBtn").setDisabled(!newValue);
                            },
                        }
                    }]
            });

            let deleteConfirmWindow = Ext.create('Ext.window.Window', {
                title: title,
                iconCls: 'extIcon extDelete',
                width: 280,
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'middle'
                },
                constrain: true,
                resizable: false,
                unpin: false,
                items: [formPanel],
                modal: true,
                buttons: [
                    '->',
                    {
                        text: '取消',
                        iconCls: 'extIcon extClose',
                        handler: function () {
                            deleteConfirmWindow.close();
                        }
                    },
                    {
                        text: confirmButtonText,
                        itemId: "deleteBtn",
                        disabled: true,
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            deleteConfirmWindow.close();
                            if (Ext.isFunction(confirmCallBack)) {
                                confirmCallBack();
                            }
                        }
                    },
                    '->'
                ],

            });
            deleteConfirmWindow.show();
        }


        /**
         * 弹出确认对话框
         * @param title 标题
         * @param message 消息
         * @param callback 回调函数 ,点击按钮对应返回值 确定：yes 取消：no
         */
        static showConfirm(title, message, callback) {
            FastExt.Dialog.hideWait();
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
                        jsonPath: 'base/lottie/question.json',
                    },
                    {
                        xtype: "label",
                        maxWidth: 300,
                        margin: '5 5 10 5',
                        html: message,
                    }],
            });

            let confirmWindow = Ext.create('Ext.window.Window', {
                title: title,
                iconCls: 'extIcon extQuestion2',
                width: 320,
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'middle'
                },
                constrain: true,
                resizable: false,
                items: [formPanel],
                modal: true,
                unpin: false,
                buttons: [
                    '->',
                    {
                        text: '取消',
                        iconCls: 'extIcon extClose',
                        handler: function () {
                            confirmWindow.close();
                            if (Ext.isFunction(callback)) {
                                callback("no");
                            }
                        }
                    },
                    {
                        text: "确定",
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            confirmWindow.close();
                            if (Ext.isFunction(callback)) {
                                callback("yes");
                            }
                        }
                    },
                    '->'
                ],

            });
            confirmWindow.show();
        }


        /**
         * 弹出确认对话框
         * @param title 标题
         * @param message 消息
         * @param callback 回调函数 ,点击按钮对应第一个参数返回值 确定：yes 取消：no ，第二个参数为输入的值
         * @param multiline 是否多行输入
         * @param value 默认值
         */
        static showPrompt(title, message, callback, multiline?, value?) {
            FastExt.Dialog.hideWait();
            let inputContent = {
                xtype: "textfield",
                itemId: "inputContent",
                value: value,
            };
            if (multiline) {
                inputContent["xtype"] = "textareafield";
                inputContent["grow"] = true;
                inputContent["growMax"] = 320;
            }

            let formPanel = Ext.create('Ext.form.FormPanel', {
                bodyPadding: 5,
                method: 'POST',
                region: 'center',
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'stretch'
                },
                defaults: {
                    margin: '5 5 5 5'
                },
                border: 0,
                items: [
                    {
                        xtype: "label",
                        html: message,
                    },
                    inputContent],
            });

            let promptWindow = Ext.create('Ext.window.Window', {
                title: title,
                iconCls: 'extIcon extEdit',
                width: 280,
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'stretch'
                },
                constrain: true,
                resizable: false,
                items: [formPanel],
                modal: true,
                listeners: {
                    show: function (winObj) {
                        setTimeout(function () {
                            winObj.query("#inputContent")[0].focus();
                        }, 200);
                    },
                },
                buttons: [
                    '->',
                    {
                        text: '取消',
                        iconCls: 'extIcon extClose',
                        handler: function () {
                            promptWindow.close();
                            if (Ext.isFunction(callback)) {
                                callback("no");
                            }
                        }
                    },
                    {
                        text: "确定",
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            promptWindow.close();
                            if (Ext.isFunction(callback)) {
                                callback("ok", promptWindow.query("#inputContent")[0].getValue());
                            }
                        }
                    },
                    '->'
                ],

            });
            promptWindow.show();
        }

    }

}