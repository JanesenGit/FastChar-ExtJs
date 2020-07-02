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
                    columnWidth: 0.8,
                    emptyText: '输入地址',
                    xtype: 'textfield'
                }, {
                    xtype: 'button',
                    columnWidth: 0.2,
                    text: '搜索',
                    handler: function () {
                        doSearch();
                    }
                }],
            listeners: {
                'render': function (text) {
                    try {
                        new Ext.util.KeyMap({
                            target: text.getEl(),
                            key: 13,
                            fn: doSearch,
                            scope:  Ext.getBody()
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
                    xtype: 'hiddenfield',
                    id: 'lblLngLat',
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
                        if (!resolve.called) {
                            resolve.called = true;
                            resolve({
                                lng: lng,
                                lat: lat,
                                addr: Ext.getCmp("lblAddress").getValue(),
                                pro: lblLngLat.province,
                                city: lblLngLat.city,
                                area: lblLngLat.area
                            })
                        }
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
                    if (!resolve.called) {
                        resolve.called = true;
                        resolve()
                    }
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
function showAddressInMap(obj, lnglat) {
    let mapPanel = Ext.create('Ext.panel.Panel', {
        layout: 'border',
        region: 'center',
        border: 0,
        listeners: {
            afterrender: function (obj, eOpts) {
                let params = {
                    lnglat: lnglat,
                    mapVersion: getExt("amap-version").value,
                    mapKey: getExt("amap-key").value
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
