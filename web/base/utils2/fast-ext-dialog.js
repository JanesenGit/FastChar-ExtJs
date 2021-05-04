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
                        var url = system.formatUrlVersion("base/editor/show.html");
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
            var isDebug = FastExt.Base.getExt("debug").value;
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
                                window["imgViewFrame"].window.showImage(system.formatUrl(data_1[0].get("url")), system.http);
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
                            " src='" + system.formatUrlVersion("base/image-view/index.html") + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
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
                        var url = system.formatUrlVersion("base/video/player.html");
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
        Dialog.editorText = function (obj, title, callBack) {
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
                                    var url = system.formatUrlVersion('base/colorpicker/index.html', {
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
