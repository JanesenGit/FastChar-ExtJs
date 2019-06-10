Ext.override(Ext.Window, {
    initComponent: Ext.Function.createSequence(Ext.Window.prototype.initComponent, function () {
        try {
            if (!eval(getExt("window-anim").value)) {
                this.animateTarget = null;
            }
        } catch (e) {
            console.error(e);
        }
    })
});


Ext.override(Ext.window.Window, {
    show: Ext.Function.createSequence(Ext.window.Window.prototype.show, function () {
        var me = this;
        me.toFront(true);
        me.focus();
    })
});


/**
 * 显示等待窗口
 */
function showWait(message) {
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
        if (Ext.MessageBox.isHidden()) return;
        i = i + 0.5;
        if (i == max + 30) {
            i = 0;
        }
        var val = i / max;
        Ext.MessageBox.updateProgress(val, '请耐心等待，即将完成操作');
        setTimeout(fn, 5);
    };
    setTimeout(fn, 5);
}

/**
 * 关闭等待框
 */
function hideWait() {
    if (Ext.MessageBox.isVisible()) {
        Ext.MessageBox.hide();
    }
}

/**
 * 显示消息
 * @param message
 */
function toast(message) {
    Ext.toast({
        html: message,
        closable: true,
        align: 't',
        slideInDuration: 200,
        slideBackDuration: 200,
        minWidth: 120,
        slideBackAnimation: 'easeOut',
        iconCls: 'extIcon extInfo',
        title: '消息'
    });
}

/**
 * 弹窗显示网页内容
 */
function showHtml(obj, title, content) {
    var win = Ext.create('Ext.window.Window', {
        title: title,
        layout: 'fit',
        height: 500,
        width: 600,
        resizable: false,
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


function showText(obj, icon, title, text) {
    var win = Ext.create('Ext.window.Window', {
        title: title,
        icon: icon,
        maximizable: true,
        height: 400,
        width: 600,
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
 * 弹出异常信息窗体
 */
function showException(e, from) {
    if (e == null) return;
    hideWait();
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
    } else {
        from = "";
    }
    var isDebug = getExt("debug").value;
    if (isDebug) {
        var win = Ext.create('Ext.window.Window', {
            title: '系统异常' + from,
            height: 180,
            width: 270,
            layout: 'fit',
            resizable: false,
            maximizable: false,
            fixed: true,
            modal: true,
            iconCls: 'extIcon extError',
            html: "<div  style='padding:15px;background: #fff;' align='center'>系统发生异常，请及时告知系统管理员！</div>",
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
                    showHtml(this, '异常信息', message);
                }
            }]
        });
        win.show();
    }
}

/**
 * 显示弹框
 */
function showAlert(title, message, callBack) {
    Ext.Msg.alert(title, message, callBack);
}


/**
 * 查看图片
 */
function showImage(obj, url, callBack, modal) {
    if (Ext.isEmpty(modal)) {
        modal = false;
    }
    var jsonData = [{
        "url": url
    }];

    var selectIndex = -1;
    if (Ext.getStore("ImageViewStore") != null) {
        var hasValue = false;
        var currStore = Ext.getStore("ImageViewStore");

        currStore.each(function (record, index) {
            if (record.get("url").split("?")[0] == url.split("?")[0]) {
                hasValue = true;
                Ext.getCmp("ImageViewGrid").getSelectionModel().select(index);
                return false;
            }
        });
        if (!hasValue) {
            currStore.add(jsonData);
            if (selectIndex == -1) {
                selectIndex = currStore.count() - 1;
            }
            Ext.getCmp("ImageViewGrid").getSelectionModel().select(selectIndex);
        }
        return;
    } else {
        if (selectIndex == -1) {
            selectIndex = 0;
        }
    }

    var imageStore = Ext.create('Ext.data.Store', {
        fields: ['url'],
        autoLoad: false,
        id: "ImageViewStore",
        data: jsonData
    });

    var dataGridImages = Ext.create('Ext.grid.Panel', {
        store: imageStore,
        region: 'west',
        hideHeaders: true,
        id: "ImageViewGrid",
        width: 100,
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
            text: '批量下载',
            handler: function (obj) {
                var params = {};
                imageStore.each(function (record, index) {
                    params["path" + index] = record.get("url");
                });
                console.log(params);
                buildForm("zipFile", params).submit();
            }
        }],
        listeners: {
            selectionchange: function () {
                try {
                    var time = 0;
                    if (this.getStore().getCount() > 1) {
                        this.setHidden(false);
                        time = 120;
                    } else {
                        this.setHidden(true);
                    }
                    var data = this.getSelectionModel().getSelection();
                    setTimeout(function () {
                        imgViewFrame.window.showImage(system.formatUrl(data[0].get("url")), system.http);
                    }, time);
                } catch (e) {
                    showException(e, "showImage");
                }
            }
        }
    });

    window["imageViewerLoadDone"] = function () {
        Ext.getCmp("ImageViewGrid").setDisabled(false);
        try {
            var index = Ext.getStore("ImageViewStore").count() - 1;
            Ext.getCmp("ImageViewGrid").getSelectionModel().select(index);
        } catch (e) {
            showException(e, "showImage")
        }
    };
    window["imageViewerSize"] = function (width, height) {
        Ext.getCmp("ImageViewWindow").setTitle("查看图片 " + width + "x" + height);
    };

    var imagePanel = Ext.create('Ext.panel.Panel', {
        layout: 'fit',
        region: 'center',
        border: 1,
        height: 'auto',
        html: '<div style="background: #000000;width: 100%;height: 100%;"></div>',
        listeners: {
            afterrender: function (obj, eOpts) {
                if (imageStore.getCount() <= 1) {
                    dataGridImages.setHidden(true);
                } else {
                    dataGridImages.setHidden(false);
                }
                obj.update("<iframe name='imgViewFrame' " +
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
                        imgViewFrame.window.zoomOut();
                    }
                },
                {
                    xtype: 'button',
                    iconCls: 'extIcon extZoomIn',
                    handler: function () {
                        imgViewFrame.window.zoomIn();
                    }
                },
                {
                    xtype: 'button',
                    iconCls: 'extIcon extOneOne',
                    handler: function () {
                        imgViewFrame.window.oneOne();
                    }
                },
                {
                    xtype: 'button',
                    iconCls: 'extIcon extAround',
                    handler: function () {
                        imgViewFrame.window.rotate();
                    }
                },
                {
                    xtype: 'button',
                    iconCls: 'extIcon extLeftRight',
                    handler: function () {
                        imgViewFrame.window.flipA();
                    }
                },
                {
                    xtype: 'button',
                    iconCls: 'extIcon extTopBottom',
                    handler: function () {
                        imgViewFrame.window.flipB();
                    }
                }
            ]
        }
    });
    var newWin = Ext.create('Ext.window.Window', {
        title: "查看图片",
        height: 500,
        width: 600,
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
}