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
                alwaysOnTop: true,
                modal: true,
                title: '系统提醒',
                msg: message,
                progressText: '请耐心等待，即将完成操作',
                progress: true,
                closable: false
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
                setTimeout(fn, 5);
            };
            setTimeout(fn, 5);
        }

        /**
         * 关闭等待框
         */
        static hideWait() {
            if (Ext.MessageBox.isVisible()) {
                Ext.MessageBox.hide();
            }
        }


        /**
         * 显示自动消失的消息
         * @param message 消息内容
         */
        static toast(message) {
            let maxWidth = parseInt((document.body.clientWidth * 0.7).toFixed(0));
            Ext.toast({
                html: message,
                closable: true,
                align: 't',
                slideInDuration: 200,
                slideBackDuration: 200,
                minWidth: 180,
                maxWidth: maxWidth,
                // alwaysOnTop: true, 不能设置
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
         */
        static showHtml(obj, title, content) {
            let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));

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
        }


        /**
         * 弹窗显示url网页内容
         * @param obj 弹框动画对象
         * @param title 标题
         * @param url 网页地址
         * @param config 扩展Ext.window.Window的配置 json对象
         */
        static showLink(obj, title, url, config) {
            let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
            let iframePanel = Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'center',
                border: 0,
                iframePanel: true,
                listeners: {
                    afterrender: function (obj, eOpts) {
                        this.setLoading("正在努力加载中，请稍后……");
                        let html = "<iframe onload='iFrameLoadDone()' src='" + url + "'  width='100%' height='100%' frameborder='0'>";
                        this.update(html);
                    }
                }
            });
            window["iFrameLoadDone"] = function () {
                iframePanel.setLoading(false);
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
                alwaysOnTop: true,
                toFrontOnShow: true,
                items: [iframePanel],
                listeners: {
                    close: function () {
                        window["iFrameLoadDone"] = null;
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
            let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
            let iframePanel = Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'center',
                border: 0,
                iframePanel: true,
                listeners: {
                    afterrender: function (obj, eOpts) {
                        let url = FastExt.System.formatUrlVersion("base/editor/show.html");
                        window["showEditorDone"] = function () {
                            window["showEditorFrame"].window.showContent(content);
                        };
                        let html = "<iframe name='showEditorFrame' src='" + url + "'  width='100%' height='100%' frameborder='0'>";
                        this.update(html);
                    }
                }
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
                alwaysOnTop: true,
                toFrontOnShow: true,
                items: [iframePanel]
            });
            win.show();
        }


        /**
         * 显示纯文本内容
         * @param obj 弹框动画对象
         * @param icon 窗体图标
         * @param title 标题
         * @param text 内容
         */
        static showText(obj, icon, title, text) {
            let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
            if (Ext.isEmpty(icon)) {
                icon = 'extIcon extSee';
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
                modal: true,
                constrain: true,
                alwaysOnTop: true
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
                if (obj) {
                    obj.blur();
                }
                if (Ext.isEmpty(lang)) {
                    lang = "";
                }
                let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
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
            let isDebug = FastExt.System.getExt("debug").value;
            if (isDebug) {
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
                    buttons: [{
                        text: '下次再说',
                        flex: 1,
                        handler: function () {
                            win.close();
                        }
                    }, {
                        text: '查看错误',
                        flex: 1,
                        handler: function () {
                            FastExt.Dialog.showCode(this, message, true);
                        }
                    }]
                });
                win.show();
            }
            console.error(e);
        }


        /**
         * 弹出Alert对话框
         * @param title 标题
         * @param message 消息
         * @param callBack 点击按钮的回调函数 Ext.MessageBox.fn
         * @param modal 是否有背景阴影层
         */
        static showAlert(title, message, callBack?, modal?) {
            if (Ext.isEmpty(modal)) {
                modal = true;
            }
            Ext.MessageBox.show({
                title: title,
                message: message,
                modal: modal,
                defaultFocus: 1,
                buttons: Ext.MessageBox.OK,
                fn: callBack,
                minWidth: 250
            });
        }

        /**
         * 查看图片
         * @param obj 弹框动画对象
         * @param url 图片地址 String或JsonArray
         * @param callBack 回调函数
         * @param modal 是否有背景阴影层
         */
        static showImage(obj, url, callBack, modal?: boolean) {
            FastExt.Image.showImage(obj,url, callBack, modal);
        }


        /**
         * 播放视频
         * @param obj 弹框动画对象
         * @param videoUrl 视频地址
         */
        static showVideo(obj, videoUrl) {
            if (obj) {
                obj.blur();
            }
            //视频播放器的大小固定
            let win = Ext.create('Ext.window.Window', {
                title: '播放视频',
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
         * 弹出富文本编辑框
         * @param obj 弹框对象
         * @param title 标题
         * @param callBack 回调函数   callBack(Ext.getCmp(areaId).getValue());
         */
        static showEditor(obj, title, callBack) {
            if (obj) {
                obj.blur();
            }
            let time = new Date().getTime();
            let areaId = "PublicTextArea" + time;
            let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
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
            if (obj) {
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
                alwaysOnTop: true,
                toFrontOnShow: true,
                items: [
                    {
                        xtype: 'panel',
                        layout: 'border',
                        iframePanel: true,
                        itemId: "playerPanel",
                        listeners: {
                            afterrender: function (obj, eOpts) {
                                this.setLoading("加载音频文件中，请稍后……");
                                let url = FastExt.System.formatUrlVersion("base/music/player.html");
                                let html = "<iframe allowfullscreen='allowfullscreen' mozallowfullscreen='mozallowfullscreen' msallowfullscreen='msallowfullscreen' oallowfullscreen='oallowfullscreen' webkitallowfullscreen='webkitallowfullscreen' style='background-color: black;' name='showMusicFrame' src='" + url + "'  width='100%' height='100%' frameborder='0' scrolling='no' >";
                                this.update(html);
                            }
                        }
                    }
                ],
                listeners: {
                    show: function (winObj) {
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
                                }else{
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

    }

}