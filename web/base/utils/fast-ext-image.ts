namespace FastExt {

    /**
     * 图片相关的操作
     */
    export class Image {

        private constructor() {

        }

        /**
         * 获取oss旋转后的角度地址
         * @param imgUrl
         * @param rotate
         */
        static rotateOSSImgUrl(imgUrl, rotate) {
            if (!Ext.isEmpty(imgUrl) && !Ext.isEmpty(rotate)) {
                let split = imgUrl.split("/");
                let imgName = split[split.length - 1];
                if (imgName.startWith("svg-")) {
                    return imgUrl;
                }
                if (imgUrl.toString().indexOf("?") >= 0) {
                    return imgUrl + "&x-oss-process=image/rotate," + rotate;
                }
                return imgUrl + "?x-oss-process=image/rotate," + rotate;
            }
            return imgUrl;
        }

        /**
         * 获取oss缩略图
         * @param imgUrl
         */
        static smallOSSImgUrl(imgUrl) {
            if (!Ext.isEmpty(imgUrl)) {
                let split = imgUrl.split("/");
                let imgName = split[split.length - 1];
                if (imgName.startWith("svg-")) {
                    return imgUrl;
                }
                if (imgUrl.toString().indexOf("?") >= 0) {
                    return imgUrl + "&x-oss-process=image/resize,h_20,m_lfit";
                }
                return imgUrl + "?x-oss-process=image/resize,h_20,m_lfit";
            }
            return imgUrl;
        }

        /**
         * 查看图片
         * @param obj 弹框动画对象
         * @param url 图片地址 String或JsonArray
         * @param callBack 回调函数
         * @param modal 是否有背景阴影层
         */
        static showImage(obj, url, callBack, modal?: boolean) {
            if (Ext.isEmpty(modal)) {
                modal = false;
            }
            let jsonData = [];
            if (Ext.isArray(url)) {
                jsonData = url
            } else {
                jsonData.push({
                    "url": url
                });
            }

            let selectIndex = -1;
            if (Ext.getStore("ImageViewStore") != null) {
                let hasValue = false;
                let currStore = Ext.getStore("ImageViewStore");

                currStore.each(function (record, index) {
                    if (record.get("url") === url) {
                        hasValue = true;
                        Ext.getCmp("ImageViewGrid").getSelectionModel().select(index);
                        return false;
                    }
                });
                if (!hasValue) {
                    currStore.add(jsonData);
                    if (selectIndex === -1) {
                        selectIndex = currStore.count() - 1;
                    }
                    currStore.imgSelectIndex = selectIndex;
                    Ext.getCmp("ImageViewGrid").getSelectionModel().select(selectIndex);
                }
                return;
            } else {
                if (selectIndex === -1) {
                    selectIndex = 0;
                }
            }

            let imageStore = Ext.create('Ext.data.Store', {
                fields: ['url'],
                autoLoad: false,
                imgSelectIndex: selectIndex,
                id: "ImageViewStore",
                data: jsonData
            });

            let dataGridImages = Ext.create('Ext.grid.Panel', {
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
                        let params = {};
                        imageStore.each(function (record, index) {
                            params["path" + index] = record.get("url");
                        });
                        FastExt.Form.buildForm("zipFile", params).submit();
                    }
                }],
                listeners: {
                    selectionchange: function () {
                        try {
                            let time = 0;
                            if (this.getStore().getCount() > 1) {
                                this.setHidden(false);
                                time = 120;
                            } else {
                                this.setHidden(true);
                            }
                            let data = this.getSelectionModel().getSelection();
                            setTimeout(function () {
                                window["imgViewFrame"].window.showImage(FastExt.System.formatUrl(data[0].get("url")), FastExt.System.http);
                            }, time);
                        } catch (e) {
                            FastExt.Dialog.showException(e, "showImage");
                        }
                    }
                }
            });

            window["imageViewerLoadDone"] = function () {
                Ext.getCmp("ImageViewGrid").setDisabled(false);
                try {
                    let index = Ext.getStore("ImageViewStore").imgSelectIndex;
                    Ext.getCmp("ImageViewGrid").getSelectionModel().select(index);
                } catch (e) {
                    FastExt.Dialog.showException(e, "showImage")
                }
            };
            window["imageViewerSize"] = function (width, height) {
                Ext.getCmp("ImageViewWindow").setTitle("查看图片 " + width + "x" + height);
            };

            let imagePanel = Ext.create('Ext.panel.Panel', {
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
                        } else {
                            dataGridImages.setHidden(false);
                        }
                        obj.update("<iframe style='background: #000000;width: 100%;height: 100%;' name='imgViewFrame' " +
                            " src='" + FastExt.System.formatUrlVersion("base/image-view/index.html") + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                        obj.getEl().on("mouseleave", function (obj) {
                            const targetElement = window["imgViewFrame"].window.document.getElementsByTagName("div")[0];
                            FastExt.Base.dispatchTargetEvent(window["imgViewFrame"].window.document, targetElement, "pointerup");
                            window["imgViewFrame"].window.reset();
                        });
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
                            iconCls: 'extIcon extReset',
                            handler: function () {
                                window["imgViewFrame"].window.reset();
                            }
                        },
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
                            iconCls: 'extIcon extRefresh',
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
                                let data = dataGridImages.getSelectionModel().getSelection();
                                FastExt.Base.download(data[0].get("url"));
                            }
                        }
                    ]
                }
            });
            let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
            let newWin = Ext.create('Ext.window.Window', {
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
        }

    }

}