namespace FastExt{

    /**
     * 地图相关功能，使用的是高德地图
     */
    export class Map{

        /**
         * 弹出地图选择界面
         * @param obj 动画对象
         * @param lng 默认经度
         * @param lat 默认纬度
         * @param address 默认地址详情
         * @return Ext.Promise
         */
        static selAddressInMap(obj, lng, lat, address): any {
            return new Ext.Promise(function (resolve, reject) {
                let defaultLngLat = "";
                if (!Ext.isEmpty(lng) && !Ext.isEmpty(lat) && parseFloat(lng) !== 0 && parseFloat(lat) !== 0) {
                    defaultLngLat = lng + "," + lat;
                }

                let mapPanel = Ext.create('Ext.panel.Panel', {
                    layout: 'border',
                    region: 'center',
                    iframePanel: true,
                    border: 0
                });


                let showInputPoint = function (title, pointType?) {
                    Ext.Msg.prompt(title, "请输入坐标经纬度(lng,lat)", function (btn, text) {
                        if (btn === 'ok') {
                            text = text.toString().replaceAll(" ", "")
                                .replaceAll("，", ",");
                            if (window["mapFrame"]) {
                                if (pointType) {
                                    window["mapFrame"].window["AMap"].convertFrom([text.split(",")], pointType, function (status, result) {
                                        let lnglats = result.locations;
                                        let lnglat = lnglats[0];
                                        window["mapFrame"].window.setLngLatAddress(lnglat.toString());
                                    });
                                } else {
                                    window["mapFrame"].window.setLngLatAddress(text);
                                }
                            }
                        }
                    });
                };

                let formPanel = Ext.create('Ext.form.FormPanel', {
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
                        }, {
                            xtype: 'button',
                            width: 100,
                            text: '搜索',
                            handler: function () {
                                let form = formPanel.getForm();
                                if (form.isValid()) {
                                    doSearch();
                                }
                            }
                        }, {
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
                        }],
                    listeners: {
                        'render': function (text) {
                            try {
                                new Ext.util.KeyMap({
                                    target: text.getEl(),
                                    key: 13,
                                    fn: doSearch,
                                    scope: Ext.getBody()
                                });
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });


                let doSearch = function () {
                    window["mapFrame"].window.searchAddress(Ext.getCmp("txtSearch").getValue());
                };

                let bottomPanel = Ext.create('Ext.panel.Panel', {
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
                        }, {
                            xtype: 'button',
                            columnWidth: 0.2,
                            text: '确定',
                            handler: function () {
                                let lblLngLat = Ext.getCmp("lblLngLat");
                                let lnglat = lblLngLat.getValue();
                                let lng = lnglat.split(",")[0];
                                let lat = lnglat.split(",")[1];
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
                        }]
                });

                let containerPanel = Ext.create('Ext.panel.Panel', {
                    layout: 'border',
                    border: 0,
                    items: [
                        formPanel, mapPanel, bottomPanel
                    ]
                });
                let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                let win = Ext.create('Ext.window.Window', {
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
                            let url = FastExt.System.formatUrlVersion('base/map/select.html',
                                {
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
                    } else {
                        window["mapFrame"].window.startLocation();
                    }
                };

                window["closeMapMask"] = function () {
                    containerPanel.setLoading(false);
                };

                window["showMapMask"] = function (msg) {
                    if (msg) {
                        containerPanel.setLoading(msg);
                    } else {
                        containerPanel.setLoading(true);
                    }
                };

                window["alert"] = function (msg) {
                    FastExt.Dialog.showAlert("系统提醒", msg);
                };

                window["setMarkCurrPos"] = function (lnglat, address, province, city, area) {
                    Ext.getCmp("lblAddress").setValue(address);
                    let lblLngLat = Ext.getCmp("lblLngLat");
                    lblLngLat.setValue(lnglat);
                    lblLngLat.province = province;
                    lblLngLat.city = city;
                    lblLngLat.area = area;
                };
            });
        }


        /**
         * 在地图上查看位置
         * @param obj 动画对象
         * @param lnglat 经纬度,例如：110.837425,32.651414
         * @param mapTitle 弹出的窗体标题
         */
        static showAddressInMap(obj, lnglat, mapTitle) {
            let mapPanel = Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'center',
                border: 0,
                iframePanel: true,
                listeners: {
                    afterrender: function (obj, eOpts) {
                        let params = {
                            lnglat: lnglat,
                            mapVersion: FastExt.System.getExt("amap-version").value,
                            mapKey: FastExt.System.getExt("amap-key").value,
                            mapTitle: mapTitle
                        };
                        obj.update("<iframe name='mapFrame'  src='" + FastExt.System.formatUrlVersion('base/map/show.html', params) + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                    }
                }
            });

            let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
            let win = Ext.create('Ext.window.Window', {
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
        }


        /**
         * 在地图上选择矩形区域
         * @param obj 动画对象
         * @param southWestLngLat 西南坐标，左下角度
         * @param northEastLngLat 东北坐标，右上角度
         * @param imgUrl 矩形渲染的图片地址
         * @param anchors 矩形的锚点
         * @param rotate 图片旋转的角度
         */
        static selRectangleInMap(obj, southWestLngLat, northEastLngLat, imgUrl, anchors,rotate) : any {
            return new Ext.Promise(function (resolve, reject) {
                if (Ext.isEmpty(rotate)) {
                    rotate = 0;
                }
                let mapPanel = Ext.create('Ext.panel.Panel', {
                    layout: 'border',
                    region: 'center',
                    iframePanel: true,
                    border: 0
                });

                let formPanel = Ext.create('Ext.form.FormPanel', {
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
                        }],
                    listeners: {
                        'render': function (text) {
                            try {
                                new Ext.util.KeyMap({
                                    target: text.getEl(),
                                    key: 13,
                                    fn: doSearch,
                                    scope: Ext.getBody()
                                });
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });

                let doSearch = function () {
                    window["mapRectangleFrame"].window.searchAddress(Ext.getCmp("txtSearch").getValue());
                };

                let bottomPanel = Ext.create('Ext.panel.Panel', {
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
                        }, {
                            xtype: 'button',
                            width: 100,
                            text: '确定',
                            handler: function () {
                                let lblSouthWestLngLat = Ext.getCmp("lblSouthWestLngLat");
                                let southWestLngLat = lblSouthWestLngLat.getValue();

                                let lblNorthEastLngLat = Ext.getCmp("lblNorthEastLngLat");
                                let northEastLngLat = lblNorthEastLngLat.getValue();

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
                        }]
                });

                let containerPanel = Ext.create('Ext.panel.Panel', {
                    layout: 'border',
                    border: 0,
                    items: [
                        formPanel, mapPanel, bottomPanel
                    ]
                });

                let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));

                let win = Ext.create('Ext.window.Window', {
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
                            let url = FastExt.System.formatUrlVersion('base/map/rectangle.html',
                                {
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
                    let showImgUrl = FastExt.Image.rotateOSSImgUrl(imgUrl, rotate);
                    window["mapRectangleFrame"].pointDataArray = anchors;
                    window["mapRectangleFrame"].window.setImgLayerUrl(showImgUrl);
                    if (southWestLngLat && northEastLngLat) {
                        containerPanel.setLoading(false);
                        window["mapRectangleFrame"].window.selectRectangle(southWestLngLat, northEastLngLat, showImgUrl);
                    }
                    if (window["mapRectangleFrame"].pointDataArray) {
                        let data = [];
                        for (let i = 0; i < window["mapRectangleFrame"].pointDataArray.length; i++) {
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
                    } else {
                        containerPanel.setLoading(true);
                    }
                };

                window["alert"] = function (msg) {
                    FastExt.Dialog.showAlert("系统提醒", msg);
                };

                window["setSelectBounds"] = function (southWestLngLat, northEastLngLat, size) {
                    let lblSouthWestLngLat = Ext.getCmp("lblSouthWestLngLat");
                    lblSouthWestLngLat.setValue(southWestLngLat);

                    let lblNorthEastLngLat = Ext.getCmp("lblNorthEastLngLat");
                    lblNorthEastLngLat.setValue(northEastLngLat);

                    let lblRectangleSize = Ext.getCmp("lblRectangleSize");
                    lblRectangleSize.setValue(size.width + "px - " + size.height + "px");
                };
            });
        }

        /**
         * 管理地图的锚点相关
         * @param obj
         * @param mapFrame
         */
        private static manageMapAnchorPoints(obj, mapFrame) {
            if (obj) {
                obj.blur();
            }
            if (!mapFrame.pointDataArray) {
                mapFrame.pointDataArray = [];
            }
            let pointStore = Ext.create('Ext.data.Store', {
                autoLoad: true,
                data: mapFrame.pointDataArray
            });
            let showInputPoint = function (title, pointType?) {
                Ext.Msg.prompt(title, "请输入坐标经纬度(lng,lat)", function (btn, text) {
                    if (btn === 'ok') {
                        text = text.toString().replaceAll(" ", "")
                            .replaceAll("，", ",");
                        if (mapFrame) {
                            if (pointType) {
                                mapFrame.window["AMap"].convertFrom([text.split(",")], pointType, function (status, result) {
                                    let lnglats = result.locations;
                                    let lnglat = lnglats[0];
                                    let record = pointStore.findRecord("gdPoint", lnglat.toString(), 0, false, false, true);
                                    if (record) {
                                        FastExt.Dialog.toast("坐标已存在！");
                                        return;
                                    }
                                    let data = {
                                        "gdPoint": lnglat.toString()
                                    };
                                    pointStore.add(data);
                                });
                            } else {
                                let record = pointStore.findRecord("gdPoint", text, 0, false, false, true);
                                if (record) {
                                    FastExt.Dialog.toast("坐标已存在！");
                                    return;
                                }
                                let data = {
                                    "gdPoint": text
                                };
                                pointStore.add(data);
                            }
                        }
                    }
                });
            };

            let dataGridPoints = Ext.create('Ext.grid.Panel', {
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
                            let data = dataGridPoints.getSelectionModel().getSelection();
                            if (data.length === 0) {
                                FastExt.Dialog.toast("请您选择需要删除的坐标！");
                            } else {
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

            let win = Ext.create('Ext.window.Window', {
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
                        let data = [];
                        let jsonData = [];
                        pointStore.each(function (record, index) {
                            let gdPoint = record.get("gdPoint");
                            data.push(gdPoint);
                            jsonData.push({"gdPoint": gdPoint});
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
        }


        /**
         * 在地图查看图层
         * @param obj 动画对象
         * @param imgUrl 图片地址
         * @param southWestLngLat 西南坐标，左下角度
         * @param northEastLngLat 东北坐标，右上角度
         * @return Ext.Promise
         */
        static showImgLayerInMap(obj, imgUrl, southWestLngLat, northEastLngLat):any {
            return new Ext.Promise(function (resolve, reject) {
                let mapPanel = Ext.create('Ext.panel.Panel', {
                    layout: 'border',
                    region: 'center',
                    iframePanel: true,
                    border: 0
                });

                let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));
                let win = Ext.create('Ext.window.Window', {
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
                            let url = FastExt.System.formatUrlVersion('base/map/showRectangle.html',
                                {
                                    mapVersion: FastExt.System.getExt("amap-version").value,
                                    mapKey: FastExt.System.getExt("amap-key").value
                                });
                            mapPanel.update("<iframe name='mapFrame'  src='" + url + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                        },
                        close: function (val) {
                            if (!resolve.called) {
                                resolve.called = true;
                                resolve()
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
        }

    }

}