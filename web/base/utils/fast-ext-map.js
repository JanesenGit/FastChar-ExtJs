/**
 * 在地图上选择位置
 */
function showMap(obj, lng, lat, address) {
    return new Ext.Promise(function (resolve, reject) {
        let defaultLngLat = "";
        if (!Ext.isEmpty(lng) && !Ext.isEmpty(lat) && parseFloat(lng) !== 0 && parseFloat(lat) !== 0) {
            defaultLngLat = lng + "," + lat;
        }

        let mapPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            region: 'center',
            border: 0
        });

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
            mapFrame.window.searchAddress(Ext.getCmp("txtSearch").getValue());
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
                        runCallBack(resolve, {
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
                    let url = system.formatUrlVersion('base/map/select.html',
                        {
                            mapVersion: getExt("amap-version").value,
                            mapKey: getExt("amap-key").value
                        });
                    mapPanel.update("<iframe name='mapFrame'  src='" + url + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                },
                close: function (val) {
                    runCallBack(resolve);
                }
            }
        });
        win.show();
        containerPanel.setLoading("正在定位中，请稍后……");
        window["onMapLoadDone"] = function () {
            if (!Ext.isEmpty(defaultLngLat)) {
                mapFrame.window.setLngLatAddress(defaultLngLat);
            } else {
                mapFrame.window.startLocation();
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
            showAlert("系统提醒", msg);
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
 */
function showAddressInMap(obj, lnglat, mapTitle) {
    let mapPanel = Ext.create('Ext.panel.Panel', {
        layout: 'border',
        region: 'center',
        border: 0,
        listeners: {
            afterrender: function (obj, eOpts) {
                let params = {
                    lnglat: lnglat,
                    mapVersion: getExt("amap-version").value,
                    mapKey: getExt("amap-key").value,
                    mapTitle: mapTitle
                };
                obj.update("<iframe name='mapFrame'  src='" + system.formatUrlVersion('base/map/show.html', params) + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
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
 * 在地图选择矩形区间
 * @param obj
 */
function showRectangle(obj, southWestLngLat, northEastLngLat, imgUrl,anchors) {
    return new Ext.Promise(function (resolve, reject) {
        let mapPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            region: 'center',
            border: 0
        });

        let formPanel = Ext.create('Ext.form.FormPanel', {
            method: 'POST',
            region: 'north',
            fileUpload: true,
            autoScroll: true,
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
                        mapRectangleFrame.window.selectRectangle();
                    }
                }, {
                    xtype: 'button',
                    width: 100,
                    text: '锚点管理',
                    handler: function () {
                        showMapAnchorPoints(this, mapRectangleFrame);
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
            mapRectangleFrame.window.searchAddress(Ext.getCmp("txtSearch").getValue());
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

                        runCallBack(resolve, {
                            southWestLngLat: southWestLngLat,
                            southWestLng: southWestLngLat.split(",")[0],
                            southWestLat: southWestLngLat.split(",")[1],
                            northEastLngLat: northEastLngLat,
                            northEastLng: northEastLngLat.split(",")[0],
                            northEastLat: northEastLngLat.split(",")[1],
                            anchors: mapRectangleFrame.pointDataArray
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
                    let url = system.formatUrlVersion('base/map/rectangle.html',
                        {
                            mapVersion: getExt("amap-version").value,
                            mapKey: getExt("amap-key").value
                        });
                    mapPanel.update("<iframe name='mapRectangleFrame'  src='" + url + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                },
                close: function (val) {
                    runCallBack(resolve);
                }
            }
        });
        win.show();
        window["onMapLoadDone"] = function () {
            mapRectangleFrame.pointDataArray = anchors;
            mapRectangleFrame.window.setImgLayerUrl(imgUrl);
            if (southWestLngLat && northEastLngLat) {
                containerPanel.setLoading(false);
                mapRectangleFrame.window.selectRectangle(southWestLngLat, northEastLngLat, imgUrl);
            }
            if (mapRectangleFrame.pointDataArray) {
                let data = [];
                for (let i = 0; i < mapRectangleFrame.pointDataArray.length; i++) {
                    data.push(mapRectangleFrame.pointDataArray[i].gdPoint);
                }
                mapRectangleFrame.window.setAnchorPoints(data, false);
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
            showAlert("系统提醒", msg);
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
 * 管理图层的锚点
 */
function showMapAnchorPoints(obj, mapFrame) {

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
    let showInputPoint = function (title, pointType) {
        Ext.Msg.prompt(title, "请输入坐标经纬度(lng,lat)", function (btn, text) {
            if (btn === 'ok') {
                text = text.toString().replaceAll(" ", "");
                if (mapFrame) {
                    if (pointType) {
                        mapFrame.window["AMap"].convertFrom([text.split(",")], pointType, function (status, result) {
                            let lnglats = result.locations;
                            let lnglat = lnglats[0];
                            let record = pointStore.findRecord("gdPoint", lnglat.toString(), 0, false, false, true);
                            if (record) {
                                toast("坐标已存在！");
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
                            toast("坐标已存在！");
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
        selModel: getGridSelModel(),
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
                renderer: renders.normal()
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
                        toast("请您选择需要删除的坐标！");
                    } else {
                        Ext.Msg.confirm("系统提醒", "您确定立即删除选中的坐标吗？", function (button, text) {
                            if (button === "yes") {
                                Ext.Array.each(data, function (record) {
                                    pointStore.remove(record);
                                });
                                dataGridPoints.getSelectionModel().deselectAll();
                                toast("删除成功！");
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
 * @param obj
 */
function showImgLayer(obj, imgUrl, southWestLngLat, northEastLngLat) {
    return new Ext.Promise(function (resolve, reject) {
        let mapPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            region: 'center',
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
                    let url = system.formatUrlVersion('base/map/showRectangle.html',
                        {
                            mapVersion: getExt("amap-version").value,
                            mapKey: getExt("amap-key").value
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
            mapFrame.window.showImgLayerInMap(imgUrl, southWestLngLat, northEastLngLat);
        };
        window["alert"] = function (msg) {
            showAlert("系统提醒", msg);
        };

    });
}


