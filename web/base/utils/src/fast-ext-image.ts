namespace FastExt {

    /**
     * 图片相关的操作
     */
    export class Image {

        /**
         * 当点击当前图片时，是否显示与之相关并且在同一个容器中的其他图片
         */
        static showAllRelationImage: boolean = true;


        /**
         * 获取真实的url地址
         * @param url
         */
        static getRealUrl(url: string) {
            return url.split("@")[0];
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
         * @param size
         */
        static smallOSSImgUrl(imgUrl:string, size?) {
            if (Ext.isEmpty(size)) {
                size = 20;
            }
            size = size.replace("px", "");
            if (!Ext.isEmpty(imgUrl)) {
                let split = imgUrl.split("/");
                let imgName = split[split.length - 1];
                // @ts-ignore
                if (imgName.startWith("svg-")) {
                    return imgUrl;
                }

                //亚马逊的图片链接 https://m.media-amazon.com/images/I/81bVxZ1FX9L._SL1500_.jpg
                if (imgUrl.indexOf("media-amazon.com/images") >= 0) {
                    let urlItems = imgUrl.split("/");
                    let nameItems = urlItems[urlItems.length - 1].split(".");

                    //亚马逊设置的图片尺寸
                    nameItems[1] = "_SL" + size + "_";
                    urlItems[urlItems.length - 1] = nameItems.join(".");
                    return urlItems.join("/");
                }


                let isOSSUrl = false;
                let ossHosts = FastExt.System.ConfigHandler.getOSSHosts();
                for (let ossHost of ossHosts) {
                    if (imgUrl.indexOf(ossHost)=== 0) {
                        isOSSUrl = true;
                        break;
                    }
                }
                if (!isOSSUrl) {
                    return imgUrl;
                }

                if (imgUrl.toString().indexOf("?") < 0) {
                    imgUrl = imgUrl + "?__v=1";
                }

                let ossType = FastExt.System.ConfigHandler.getOSSType();
                let appendParam = "";
                if (ossType === "ali") {//阿里云oss
                    appendParam = "&x-oss-process=image/resize,h_" + size + ",m_lfit";
                } else if (ossType === "tencent") {//腾讯云oss
                    appendParam = "&imageMogr2/thumbnail/!" + size + "x" + size + "r";
                } else if (ossType === "ctyun") {//天翼云经典I版
                    appendParam = "&__t=ctyun";
                    let split = imgUrl.split("?");
                    imgUrl = split[0] + "@oosImage|" + size + "w" + "?" + split[1];
                }
                return imgUrl + appendParam;
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
            let imageRootHtmlId = null;
            if (obj && Ext.isFunction(obj.getAttribute)) {
                imageRootHtmlId = obj.getAttribute("data-container-id");
            }

            let jsonData = [];
            if (Ext.isArray(url)) {
                jsonData = url
            } else {
                jsonData.push({
                    "url": url
                });
            }

            if (imageRootHtmlId && FastExt.Image.showAllRelationImage) {
                $("#" + imageRootHtmlId).find("img").each(function (index, imgItem) {
                    let $imgObj = $(imgItem);
                    if ($imgObj.attr("data-container-id") && $imgObj.attr("data-details-id")) {
                        let key = $imgObj.attr("data-details-id");
                        let src = $imgObj.attr("src");
                        if (FastExt.Cache.memory.hasOwnProperty(key)) {
                            //如果缓存中存在，则从缓存中获取地址
                            src = FastExt.Cache.memory[key];
                        }

                        if (Ext.isString(url) && src === url) {
                            return true;
                        }
                        jsonData.push({
                            "url": src,
                        });
                    }
                });
            }

            let selectIndex = -1;
            if (Ext.getStore("ImageViewStore") != null) {
                let currStore = Ext.getStore("ImageViewStore");

                let newJsonData = [];
                for (let jsonDatum of jsonData) {
                    let existsRecord = currStore.findRecord("url", jsonDatum.url);
                    if (existsRecord) {
                        if (Ext.isString(url) && url === jsonDatum.url) {
                            selectIndex = currStore.indexOf(existsRecord);
                        }
                        continue;
                    }
                    newJsonData.push(jsonDatum);
                }

                currStore.add(newJsonData);
                if (selectIndex === -1) {
                    selectIndex = currStore.count() - 1;
                }
                currStore.imgSelectIndex = selectIndex;
                Ext.getCmp("ImageViewGrid").getSelectionModel().select(selectIndex);
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
                    renderer: FastExt.Renders.image(14, -1, false, false),
                }],
                tbar: [{
                    xtype: 'button',
                    border: 1,
                    text: '打包下载',
                    iconCls: 'extIcon extDownload',
                    handler: function (obj) {
                        FastExt.Dialog.showWait("正在打包中，请稍候……");
                        let params = {};
                        imageStore.each(function (record, index) {
                            params["path" + index] = FastExt.Image.getRealUrl(record.get("url"));
                        });
                        FastExt.Server.zipFile(params, (success: boolean, message: string, data: any) => {
                            FastExt.Dialog.hideWait();
                            if (success) {
                                FastExt.Base.openUrl(data, FastEnum.Target._blank);
                            } else {
                                FastExt.Dialog.showAlert("系统提醒", message);
                            }
                        });
                    }
                }],
                listeners: {
                    selectionchange: function (obj, selected) {
                        try {
                            let time = 0;
                            let store = this.getStore();
                            let arrowRightBtn = this.ownerCt.down("#arrowRight");
                            let arrowLeftBtn = this.ownerCt.down("#arrowLeft");
                            if (store.getCount() > 1) {
                                this.setHidden(false);
                                time = 120;
                                if (arrowRightBtn) {
                                    arrowRightBtn.setHidden(false);
                                    arrowRightBtn.setDisabled(store.count() - 1 === store.indexOf(selected[0]));
                                }
                                if (arrowLeftBtn) {
                                    arrowLeftBtn.setHidden(false);
                                    arrowLeftBtn.setDisabled(store.indexOf(selected[0]) === 0);
                                }
                            } else {
                                this.setHidden(true);
                                if (arrowRightBtn) {
                                    arrowRightBtn.setHidden(true);
                                }
                                if (arrowLeftBtn) {
                                    arrowLeftBtn.setHidden(true);
                                }
                            }

                            setTimeout(function () {
                                if (window["imgViewFrame"] && Ext.isFunction(window["imgViewFrame"].window.showImage)) {
                                    window["imgViewFrame"].window.showImage(FastExt.Base.formatUrl(selected[0].get("url")), FastExt.System.ConfigHandler.getSystemHttp());
                                }
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
                            " src='" + FastExt.Base.formatUrlVersion("base/image-view/index.html") + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
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
                            iconCls: 'extIcon extArrowLeft',
                            itemId: "arrowLeft",
                            hidden: true,
                            handler: function () {
                                let imageGrid = Ext.getCmp("ImageViewGrid");
                                let data = imageGrid.getSelection();
                                let currIndex = 0;
                                if (data.length > 0) {
                                    currIndex = imageGrid.getStore().indexOf(data[0]);
                                }
                                Ext.getCmp("ImageViewGrid").getSelectionModel().select(Math.max(currIndex - 1, 0));
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls: 'extIcon extArrowRight',
                            itemId: "arrowRight",
                            hidden: true,
                            handler: function () {
                                let imageGrid = Ext.getCmp("ImageViewGrid");
                                let data = imageGrid.getSelection();
                                let currIndex = 0;
                                if (data.length > 0) {
                                    currIndex = imageGrid.getStore().indexOf(data[0]);
                                }
                                Ext.getCmp("ImageViewGrid").getSelectionModel().select(Math.min(currIndex + 1, imageGrid.getStore().count() - 1));
                            },
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
                                FastExt.Base.download(FastExt.Image.getRealUrl(data[0].get("url")));
                            }
                        }
                    ]
                }
            });
            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));

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