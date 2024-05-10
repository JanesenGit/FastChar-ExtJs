namespace FastExt {

    /**
     * 地图map对象加载器
     */
    export class AMapLoader {
        //当fast-ext-utils文件加载时，初始化一次
        public static __onLoaded() {
            window["_AMapSecurityConfig"] = {
                securityJsCode: FastExt.System.ConfigHandler.getAMapSecurity()
            };
        }

        static getMapJsUrl() {
            return "https://webapi.amap.com/maps?v=" + FastExt.System.ConfigHandler.getAMapVersion() + "&key=" + FastExt.System.ConfigHandler.getAMapKey();
        }

        /**
         * 加载地图map对象
         * @param cmb 组件对象
         * @param callBack 地图加载成功的回调
         */
        static loadMap(cmb: any, callBack?: any) {
            FastExt.AMapLoader.loadMapByEl(FastExt.Base.getTargetBodyElement(cmb), callBack);
        }

        /**
         * 加载地图map对象
         * @param el 地图渲染的目标节点
         * @param callBack 地图加载成功的回调
         */
        static loadMapByEl(el: Element, callBack?: any) {
            let doLoad = function () {
                if (el) {
                    if (Ext.isEmpty(el.id)) {
                        el.id = "fastchar-id-" + $.md5(FastExt.Base.buildUUID16());
                    }
                    AMap.plugin([
                        'AMap.ControlBar',
                        'AMap.ToolBar',
                        'AMap.Scale',
                        'AMap.HawkEye',
                        'AMap.MapType',
                        'AMap.Geolocation',
                        'AMap.PlaceSearch',
                        'AMap.Geocoder',
                        'AMap.MouseTool',
                        'AMap.RectangleEditor',
                        'AMap.PolygonEditor'
                    ], function () {
                        let amapObj = new AMap.Map(el, {
                            viewMode: '3D',
                            resizeEnable: true,
                            pitchEnable: true,
                            rotateEnable: true,
                            terrain: true
                        });
                        amapObj.cacheId = el.id + "Map";
                        FastExt.Cache.memory[amapObj.cacheId] = amapObj;

                        amapObj.addControl(new AMap.ToolBar());
                        amapObj.addControl(new AMap.Scale());
                        amapObj.addControl(new AMap.MapType());
                        amapObj.addControl(new AMap.ControlBar());


                        //地理编码与逆地理编码
                        amapObj.geocoder = new AMap.Geocoder({
                            radius: 1000,
                            extensions: "all"
                        });
                        //定位服务插件
                        amapObj.geolocation = new AMap.Geolocation({
                            enableHighAccuracy: true,//是否使用高精度定位，默认:true
                            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                            zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                        });

                        amapObj.on('complete', callBack);
                    });
                } else {
                    console.error("加载高德地图失败！无法获取目标控件的BodyElement！");
                }
            };
            FastExt.PluginLoader.loadPlugins("AMap", [{type:"js", src: this.getMapJsUrl()}], doLoad);
        }

        /**
         * 获取cmb已加载渲染的map对象
         * @param cmb
         */
        static getMap(cmb: any): any {
            return FastExt.AMapLoader.getMapByEl(FastExt.Base.getTargetBodyElement(cmb));
        }

        /**
         * 获取cmb已加载渲染的map对象
         * @param el
         */
        static getMapByEl(el: Element): any {
            if (el) {
                return FastExt.AMapLoader.getMapByElId(el.id);
            }
            return null;
        }

        /**
         * 获取cmb已加载渲染的map对象
         * @param elId
         */
        static getMapByElId(elId: string): any {
            return FastExt.Cache.memory[elId + "Map"];
        }
    }


    /**
     * 地图工具类
     */
    export class AMapHelper {

        /**
         * 将坐标转成 AMap.Bounds 对象
         * @param southWestLngLat 西南坐标（左下坐标），例如：110.568434,32.377389
         * @param northEastLngLat 东北坐标（右上坐标），例如：110.969035,32.667611
         */
        static parseAMapBounds(southWestLngLat: string, northEastLngLat: string) {
            if (!southWestLngLat || !northEastLngLat) {
                return null;
            }
            return new AMap.Bounds(FastExt.AMapHelper.parseAMapLngLat(southWestLngLat), FastExt.AMapHelper.parseAMapLngLat(northEastLngLat));
        }


        /**
         * 将 AMap.Bounds 对象转成字符串数组，长度为2
         * 下标0：southWestLngLat 西南坐标（左下坐标），例如：110.568434,32.377389
         * 下标1：northEastLngLat 东北坐标（右上坐标），例如：110.969035,32.667611
         * @param bounds AMap.Bounds 对象
         */
        static amapBoundsToStringArray(bounds: any) {
            if (bounds) {
                return [FastExt.AMapHelper.amapLngLatToString(bounds.southWest), FastExt.AMapHelper.amapLngLatToString(bounds.northEast)];
            }
            return null;
        }


        /**
         * 将坐标转成 AMap.LngLat 对象
         * @param lnglat 例如：110.568434,32.377389
         */
        static parseAMapLngLat(lnglat: string) {
            if (lnglat) {
                lnglat = lnglat.toString().replace(" ", "").replace(" ", "");
                return new AMap.LngLat(lnglat.split(",")[0], lnglat.split(",")[1]);
            }
            return null;
        }


        /**
         * 将 AMap.LngLat 对象转成字符串  例如：110.568434,32.377389
         * @param lnglat AMap.LngLat对象
         */
        static amapLngLatToString(lnglat: any) {
            if (lnglat) {
                return lnglat.lng + "," + lnglat.lat;
            }
            return null;
        }


        /**
         * 将一组坐标转换成 AMap.LngLat 数组对象
         * @param path
         */
        static parseAMapLngLatArray(path: string[]) {
            if (!path) {
                return null;
            }
            let realPathArray = [];
            for (let pathArrayElement of path) {
                realPathArray.push(FastExt.AMapHelper.parseAMapLngLat(pathArrayElement));
            }
            return realPathArray;
        }


        /**
         * 将一组 AMap.LngLat 数组对象转成 一组字符串数组
         * @param lnglatArray
         */
        static amapLngLatArrayToStringArray(lnglatArray: any): string[] {
            let pathArray = [];
            for (const path of lnglatArray) {
                pathArray.push(FastExt.AMapHelper.amapLngLatToString(path));
            }
            return pathArray;
        }


        /**
         * 坐标转换
         * @param targetLnglat 需要转换的坐标或者坐标组
         * @param convertType 坐标类型 可选值有：gps、baidu
         */
        static amapConvertFrom(targetLnglat: any, convertType: string): ExtPromise {
            return new Ext.Promise((resolve) => {
                if (Ext.isEmpty(convertType)) {
                    resolve([targetLnglat]);
                    return;
                }
                AMap.convertFrom(targetLnglat, convertType, function (status, result) {
                    if (result.info === 'ok') {
                        resolve(result.locations);
                    } else {
                        resolve(null);
                    }
                });
            });
        }

        /**
         * 科学显示的经纬度转换成AMap.LngLat 对象
         * @param plainStringLongitude 经度 例如：116°34′52.18″
         * @param plainStringLatitude 纬度 例如：32°39′16.614″
         */
        static plainStringToAMapLngLat(plainStringLongitude: string, plainStringLatitude: string) {
            let lng = AMapHelper.convertDMS(AMapHelper.convertStringDMSToArray(plainStringLongitude));
            let lat = AMapHelper.convertDMS(AMapHelper.convertStringDMSToArray(plainStringLatitude));
            return new AMap.LngLat(lng, lat);
        }

        /**
         * 将字符串度分秒 转换成功 数组
         * @param plainStringDMS
         */
        static convertStringDMSToArray(plainStringDMS: string) {
            let chars = plainStringDMS.split("");
            let value = "";
            let values = [];
            for (let char of chars) {
                if (char === "°" || char === "′" || char === "″") {
                    values.push(parseFloat(value));
                    value = "";
                    continue;
                }
                value += char;
            }
            return values;
        }

        /**
         * 将度分秒转换成小数点（十进制）
         * @param dms
         */
        static convertDMS(dms: any[]) {
            let deg = dms [0];
            let min = dms[1];
            let sec = dms [2];
            let sign = (deg < 0) ? -1 : 1;
            return sign * (Math.abs(deg) + min / 60 + sec / 3600);
        }
    }


    /**
     * 地图对象封装
     */
    export class AMapObject {

        /**
         * 地图对象
         */
        protected _map: any;

        constructor(map?: any) {
            this._map = map;
        }

        get map(): any {
            return this._map;
        }

        set map(value: any) {
            this._map = value;
        }

        destroy() {
            this.map.destroy();
        }

        /**
         * 添加地图事件
         * @param event 事件名称
         * @param func 事件回调函数
         */
        on(event: string, func: any) {
            this.map.on(event, func);
        }

        /**
         * 移除地图事件
         * @param event 事件名称
         * @param func 事件回调函数
         */
        off(event: string, func: any) {
            this.map.off(event, func);
        }

        /**
         * 清除地图的指定所有事件
         * @param event 事件名称
         */
        clearEvents(event: string) {
            this.map.clearEvents(event);
        }

        /**
         * 缩放地图，显示出所有覆盖物
         */
        fitView(overlayArray?: any) {
            if (overlayArray) {
                this.map.setFitView(overlayArray, false, [60, 60, 60, 60], 10);
            } else {
                this.map.setFitView();
            }
        }

        /**
         * 设置地图显示的缩放级别，参数 zoom 可设范围：[2, 30]
         * @param zoom
         */
        setZoom(zoom: number) {
            this.map.setZoom(zoom);
        }

        /**
         * 设置地图显示的缩放级别，参数 zoom 可设范围：[2, 30]
         * @param zoom
         * @param lnglat
         */
        setZoomAndCenter(zoom: number, lnglat:any) {
            this.map.setZoomAndCenter(zoom, lnglat);
        }

        /**
         * 以安全模式获取当前浏览器的定位，如果定位失败，默认返回：new AMap.LngLat(116.410394, 39.934376, true)
         */
        safeStartLocation(): ExtPromise {
            return new Ext.Promise((resolve) => {
                this.map.geolocation.getCityInfo(function (status, result) {
                    let position;
                    if (status === "complete") {
                        position = new AMap.LngLat(result.position[0], result.position[1], true);
                    } else {
                        position = new AMap.LngLat(116.410394, 39.934376, true);
                    }
                    resolve(position);
                });
            });
        }


        /**
         * 计算 AMapBounds 对象边界的相对Map地图展示的容器宽高
         * @param bounds
         */
        computeAMapBoundsSizeToContainer(bounds:any) {
            let southWestPX = this.map.lngLatToContainer(bounds.southWest);
            let northEastPX = this.map.lngLatToContainer(bounds.northEast);
            let height = Math.abs(southWestPX.round().y - northEastPX.round().y);
            let width = Math.abs(northEastPX.round().x - southWestPX.round().x);
            return {"width": width, "height": height};
        }


        /**
         * 获取地图上指定selfId的覆盖物
         * @param selfId
         */
        getOverlay(selfId: string) {
            let allOverlays = this.map.getAllOverlays();
            for (let allOverlay of allOverlays) {
                if (allOverlay._opts && allOverlay._opts.selfId === selfId) {
                    return allOverlay;
                }
            }
            return null;
        }

        /**
         * 获取启用编辑功能的指定type类型的覆盖物
         * @param type
         */
        getEnabledEditorOverlay(type: string): any[] {
            let finds = [];
            let allOverlays = this.map.getAllOverlays();
            for (let allOverlay of allOverlays) {
                if (allOverlay.__enabledEditor && allOverlay.__type && allOverlay.__type === type) {
                    finds.push(allOverlay);
                }
            }
            return finds;
        }


        /**
         * 移除地图上获取指定selfId的覆盖物
         * @param selfId
         */
        removeOverlay(selfId: string) {
            let overlay = this.getOverlay(selfId);
            if (overlay && overlay.editor) {
                overlay.editor.close();
            }
            if (overlay) {
                this.map.remove(overlay);
            }
        }


        /**
         * 获取地图上指定selfId的图层
         * @param selfId
         */
        getLayer(selfId: string) {
            let allLayers = this.map.getLayers();
            for (let layer of allLayers) {
                if (layer._opts && layer._opts.selfId === selfId) {
                    return layer;
                }
            }
            return null;
        }

        /**
         * 移除地图上获取指定selfId的图层
         * @param selfId
         */
        removeLayer(selfId: string) {
            let layer = this.getLayer(selfId);
            if (layer && layer.editor) {
                layer.editor.close();
            }
            if (layer) {
                this.map.remove(layer);
            }
        }


        /**
         * 地图搜索位置信息
         * @param address
         */
        searchAddress(address: string): ExtPromise {
            return new Ext.Promise((resolve) => {
                this.map.geocoder.getLocation(address, (status, result) => {
                    if (status.toString().toLowerCase() === 'complete'
                        && result.info.toString().toLowerCase() === 'ok'
                        && parseInt(result.resultNum) > 0) {
                        resolve({
                            map: this.map,
                            result: result
                        });
                    } else if (status === 'no_data') {
                        resolve(null);
                    }
                });
            });
        }

        /**
         * 搜索坐标位置
         * @param lnglat AMapLngLat对象
         */
        searchLngLat(lnglat: any): ExtPromise {
            return new Ext.Promise((resolve) => {
                this.map.geocoder.getAddress(lnglat, (status, result) => {
                    if (status.toString().toLowerCase() === 'complete'
                        && result.info.toString().toLowerCase() === 'ok') {
                        resolve({
                            map: this.map,
                            result: result
                        });
                    } else if (status === 'no_data') {
                        resolve(null);
                    }
                });
            });
        }


        /**
         * 在地图上添加矩形覆盖物
         * @param param
         */
        addRectangleOverlay(param: AMapRectangleOverlayParam) {
            if (!param) {
                return null;
            }
            let bounds = FastExt.AMapHelper.parseAMapBounds(param.southWestLngLat, param.northEastLngLat);
            if (!bounds) {
                return null;
            }
            let rectangle = this.getRectangleOverlay(param);
            if (!rectangle) {
                rectangle = new AMap.Rectangle({
                    selfId: param.title,
                    bounds: bounds,
                    fillColor: param.fillColor,
                    strokeColor: param.strokeColor,
                    zIndex: param.zIndex,
                });
            }
            this.map.add(rectangle);
            param.sizeToContainer = this.computeAMapBoundsSizeToContainer(rectangle.getBounds());
            param.notifyChange();
            if (param.imageLayerParam) {
                this.addImageLayer(param.bindImageLayer());
            }
            if (param.enabledEditor) {
                let rectangleEditor = rectangle.editor;
                if (!rectangleEditor) {
                    rectangleEditor = new AMap.RectangleEditor(this.map, rectangle);
                }
                let changeRect = (e) => {
                    let strings = FastExt.AMapHelper.amapBoundsToStringArray(e.target.ir);
                    param.southWestLngLat = strings[0];
                    param.northEastLngLat = strings[1];
                    param.sizeToContainer = this.computeAMapBoundsSizeToContainer(e.target.ir);
                    param.notifyChange();
                    if (param.imageLayerParam) {
                        this.addImageLayer(param.bindImageLayer());
                    }
                };

                rectangleEditor.clearEvents("adjust");
                rectangleEditor.clearEvents("move");
                rectangleEditor.on("adjust", changeRect);
                rectangleEditor.on("move", changeRect);
                rectangleEditor.open();
                rectangle.editor = rectangleEditor;
            }
            return rectangle;
        }


        /**
         * 在地图上获取矩形覆盖物对象
         * @param param
         */
        getRectangleOverlay(param: AMapRectangleOverlayParam) {
            if (!param) {
                return null;
            }
            return this.getOverlay(param.title);
        }


        /**
         * 移除地图上获取矩形覆盖物对象
         * @param param
         */
        removeRectangleOverlay(param: AMapRectangleOverlayParam) {
            if (!param) {
                return;
            }
            this.removeOverlay(param.title);
        }


        /**
         * 在地图上添加多边形覆盖物
         * @param param
         */
        addPolygonOverlay(param: AMapPolygonOverlayParam) {
            if (!param) {
                return null;
            }
            let parseAMapLngLatArray = FastExt.AMapHelper.parseAMapLngLatArray(param.path);
            if (!parseAMapLngLatArray) {
                return null;
            }
            let polygon = this.getPolygonOverlay(param);
            if (!polygon) {
                polygon = new AMap.Polygon({
                    selfId: param.title,
                    path: parseAMapLngLatArray,
                    fillColor: param.fillColor,
                    strokeColor: param.strokeColor,
                    zIndex: param.zIndex,
                });
            }
            this.map.add(polygon);
            param.notifyChange();
            if (param.enabledEditor) {
                let polygonEditor = polygon.editor;
                if (!polygonEditor) {
                    polygonEditor = new AMap.PolygonEditor(this.map, polygon);
                }

                let changeRect = (e) => {
                    param.path = FastExt.AMapHelper.amapLngLatArrayToStringArray(e.target.getPath());
                    param.notifyChange();
                };
                polygonEditor.clearEvents("adjust");
                polygonEditor.clearEvents("move");

                polygonEditor.on("adjust", changeRect);
                polygonEditor.on("move", changeRect);
                polygonEditor.open();
                polygon.editor = polygonEditor;
            }
            return polygon;
        }


        /**
         * 在地图上获取矩形覆盖物对象
         * @param param
         */
        getPolygonOverlay(param: AMapPolygonOverlayParam) {
            if (!param) {
                return null;
            }
            return this.getOverlay(param.title);
        }

        /**
         * 移除组件地图上获取矩形覆盖物对象
         * @param param
         */
        removePolygonOverlay(param: AMapPolygonOverlayParam) {
            if (!param) {
                return;
            }
            this.removeOverlay(param.title);
        }


        /**
         * 添加中国城市边界图层
         * @param param
         */
        addDistrictLayer(param: AMapDistrictLayerParam) {
            if (!param) {
                return null;
            }
            if (param.adcode && param.adcode.length > 0) {
                let districtLayer = this.getDistrictLayer(param);
                if (!districtLayer) {
                    districtLayer = new AMap.DistrictLayer.Province({
                        selfId: param.title,
                        depth: param.depth,
                        zIndex: param.zIndex,
                        styles: {
                            'fill': param.fill,
                            'province-stroke': param.province_stroke,
                            'city-stroke': param.city_stroke,
                            'county-stroke': param.county_stroke,
                        }
                    });
                }
                districtLayer.setAdcode(param.adcode);
                districtLayer.setMap(this.map);
                return districtLayer;
            }
            return null;
        }

        /**
         * 获取中国城市边界图层
         * @param param
         */
        getDistrictLayer(param: AMapDistrictLayerParam) {
            if (!param) {
                return null;
            }
            return this.getLayer(param.title);
        }


        /**
         * 移除中国城市边界图层
         * @param param
         */
        removeDistrictLayer(param: AMapDistrictLayerParam) {
            if (!param) {
                return;
            }
            this.removeLayer(param.title);
        }


        /**
         * 在地图上添加图片图层
         * @param param
         */
        addImageLayer(param: AMapImageLayerParam) {
            if (!param) {
                return null;
            }
            let bounds = FastExt.AMapHelper.parseAMapBounds(param.southWestLngLat, param.northEastLngLat);
            if (!bounds) {
                return null;
            }
            let imageLayer = this.getImageLayer(param);
            if (!imageLayer) {
                imageLayer = new AMap.ImageLayer({
                    selfId: param.title,
                    url: param.url,
                    zIndex: param.zIndex,
                });
                this.map.add(imageLayer);
            }
            imageLayer.setBounds(bounds);
            return imageLayer;
        }

        /**
         * 获取图片图层的对象
         * @param param
         */
        getImageLayer(param: AMapImageLayerParam) {
            if (!param) {
                return null;
            }
            return this.getLayer(param.title);
        }

        /**
         * 移除图片图层
         * @param param
         */
        removeImageLayer(param: AMapImageLayerParam) {
            if (!param) {
                return;
            }
            this.removeLayer(param.title);
        }


        /**
         * 在地图上添加点标记
         * @param param
         */
        addMarkerOverlay(param: AMapMarkerOverlayParam) {
            if (!param) {
                return null;
            }
            //标记点未配置坐标信息，根据条件是否启用定位信息
            if (param.isEmptyLngLat() && param.enabledEditor && param.enabledLocation) {
                let default_lnglat = FastExt.System.ConfigHandler.getConfig("amap_default_lnglat").value;
                if (default_lnglat) {
                    let location = FastExt.AMapHelper.parseAMapLngLat(default_lnglat);
                    param.lnglat = location;
                    param.lng = location.lng;
                    param.lat = location.lat;
                    this.addMarkerOverlay(param);
                    let defaultZoom = FastExt.System.ConfigHandler.getConfig("amap_default_zoom").value;
                    if(Ext.isEmpty(defaultZoom)) {
                        defaultZoom = 14;
                    }
                    this.setZoomAndCenter(parseFloat(defaultZoom), location);
                }else{
                    param.showLoading("获取当前定位信息中，请稍后……");
                    this.safeStartLocation().then((location:any) => {
                        param.hideLoading();
                        param.lng = location.lng;
                        param.lat = location.lat;
                        this.addMarkerOverlay(param);
                    });
                }
                return;
            }

            let position = null;
            if (param.lnglat) {
                position = FastExt.AMapHelper.parseAMapLngLat(param.lnglat);
            } else {
                position = new AMap.LngLat(param.lng, param.lat);
            }
            if (!position) {
                return null;
            }

            let marker = this.getMarkerOverlay(param);
            if (!marker) {
                marker = new AMap.Marker({
                    selfId: param.title,
                    position: position,
                    draggable: param.enabledEditor,
                    cursor: param.enabledEditor ? 'move' : 'default',
                    raiseOnDrag: true
                });
                marker.infoWindow = new AMap.InfoWindow({
                    offset: new AMap.Pixel(0, -30)
                });
            }

            marker.searchLngLat = function (markerPosition: any) {
                if (this.infoWindow) {
                    this.infoWindow.close();
                }
                param.lnglat = FastExt.AMapHelper.amapLngLatToString(markerPosition);
                param.lng = markerPosition.lng;
                param.lat = markerPosition.lat;
                param.showLoading("搜索位置信息中，请稍候……");
                new AMapObject(this.getMap()).searchLngLat(markerPosition).then((data) => {
                    param.hideLoading();
                    if (data) {
                        let result = data.result;
                        marker.updateRegeocode(markerPosition, result.regeocode);
                    }
                });
            };

            marker.updateRegeocode = function (lnglat,regeocode) {
                param.address = regeocode.formattedAddress;
                param.province = regeocode.province;
                param.city = regeocode.city;
                param.district = regeocode.district;
                param.lng = lnglat.lng;
                param.lat = lnglat.lat;
                param.lnglat = FastExt.AMapHelper.amapLngLatToString(lnglat);

                this.setPosition(lnglat);
                if (param.enabledEditor && param.enabledMapFlowCenter) {
                    if (param.zoom > 0 && param.zoom > this.getMap().getZoom()) {
                        this.getMap().setZoomAndCenter(param.zoom, lnglat);
                    } else {
                        this.getMap().setCenter(lnglat);
                    }
                }
                param.notifyChange();
            };
            marker.__enabledEditor = param.enabledEditor;
            marker.__type = param.type;

            marker.clearEvents("click");
            marker.on("click", function () {
                if (this.infoWindow) {
                    let address = param.address;
                    if (!address) {
                        address = "";
                    }
                    let position = this.getPosition();
                    this.infoWindow.setContent("<div>" + address + "【" + param.lnglat + "】" + "</div>");
                    this.infoWindow.open(this.getMap(), position);
                    this.getMap().setCenter(position);
                }
            });

            if (param.enabledEditor) {
                marker.clearEvents("dragstart");
                marker.clearEvents("dragend");
                marker.on('dragstart', function () {
                    if (this.infoWindow) {
                        this.infoWindow.close();
                    }
                });
                marker.on('dragend', function () {
                    marker.searchLngLat(this.getPosition());
                });

                if (param.enabledMapClickLocation) {
                    this.on('click', function (ev) {
                        marker.searchLngLat(ev.lnglat);
                    });
                }
            }
            marker.setMap(this.map);
            return marker;
        }


        /**
         * 获取地图上的标记，只能获取通过FastExt对象添加的marker对象
         * @param param
         */
        getMarkerOverlay(param: AMapMarkerOverlayParam) {
            if (!param) {
                return null;
            }
            return this.getOverlay(param.title);
        }


        /**
         * 删除地图上的标记
         * @param param
         */
        removeMarkerOverlay(param: AMapMarkerOverlayParam) {
            if (!param) {
                return;
            }
            this.removeOverlay(param.title);
        }


        /**
         * 在组件绑定的map对象上开始画矩形覆盖物
         * @param param
         */
        beginDrawRectangleOverlay(param: AMapRectangleOverlayParam) {
            this.removeRectangleOverlay(param);
            let mouseTool = new AMap.MouseTool(this.map);
            mouseTool.rectangle({
                fillColor: param.fillColor,
                strokeColor: param.strokeColor,
            });
            mouseTool.on('draw', (e) => {
                mouseTool.close(true);
                let strings = FastExt.AMapHelper.amapBoundsToStringArray(e.obj.ir);
                param.southWestLngLat = strings[0];
                param.northEastLngLat = strings[1];
                this.addRectangleOverlay(param);
            });
        }

        /**
         * 在组件绑定的map对象上开始画多边形覆盖物
         * @param param
         */
        beginDrawPolygonOverlay(param: AMapPolygonOverlayParam) {
            this.removePolygonOverlay(param);
            let mouseTool = new AMap.MouseTool(this.map);
            mouseTool.polygon({
                fillColor: param.fillColor,
                strokeColor: param.strokeColor,
            });
            mouseTool.on('draw', (e) => {
                mouseTool.close(true);
                param.path = FastExt.AMapHelper.amapLngLatArrayToStringArray(e.obj.getPath());
                this.addPolygonOverlay(param);
            });
        }
    }


    /**
     * 地图组件绑定extjs组件相关操作
     */
    export class AMapComponent extends AMapObject {
        cmb: any;

        constructor(cmb: any) {
            super();
            this.cmb = cmb;
        }

        get map(): any {
            if (!this._map) {
                this._map = FastExt.AMapLoader.getMap(this.cmb);
                if (!this._map) {
                    console.error("目标控件未绑定Map对象！", this.cmb);
                }
            }
            return this._map;
        }
    }


    /**
     * 地图对话框操作类
     */
    export class AMapDialog {

        private static buildMapPanel(params: AMapMapParams) {
            return Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'center',
                itemId: "mapContainer",
                border: 0,
                loadMap: function () {
                    this.setLoading("加载地图中，请稍后……");
                    FastExt.AMapLoader.loadMap(this, () => {
                        this.setLoading(false);
                        this.initMapMoreView();
                        this.initMapLayers();
                        this.refreshResult();
                    });
                },
                destroyMap: function () {
                    let aMapComponent = new AMapComponent(this);
                    aMapComponent.destroy();
                },
                initMapMoreView: function () {
                    let textId = "mapLevelText" + FastExt.Base.buildOnlyCode("MV");
                    let levelLayerHtml = "<div id=\"levelControl\" class=\"amap-control\" style=\"left: 15px;bottom: 60px;background: #ffffffb0;padding: 5px 10px;\">" +
                        "<span id='" + textId + "' style=\"color: rgb(0, 0, 0);font-size: small;\">0级别</span>" +
                        "</div>";

                    let divTemp = document.createElement("div");
                    divTemp.innerHTML = levelLayerHtml;
                    FastExt.Base.getTargetBodyElement(this).appendChild(divTemp);
                    let aMapComponent = new AMapComponent(this);
                    aMapComponent.on("zoomchange", function () {
                        document.getElementById(textId).innerHTML = this.getZoom() + "&nbsp;级别";
                    });
                },
                refreshResult: function () {
                    let infos = [];
                    for (let layer of params.wrapItems()) {
                        if (layer.toResultInfo) {
                            infos.push(layer.toResultInfo());
                        }
                    }
                    let mapWindow = this.up("#mapWindow");
                    if (mapWindow) {
                        let selectResult = mapWindow.down("#selectResult");
                        if (selectResult) {
                            selectResult.setValue(infos.join(" "));
                        }
                    }
                },
                initMapLayers: function () {
                    let aMapComponent = new AMapComponent(this);
                    let overlayArray = [];
                    for (let layerParams of params.wrapItems()) {
                        if (layerParams.type === FastEnum.MapItemType.rectangle_overlay) {
                            let rectangleOverlay = aMapComponent.addRectangleOverlay(layerParams);
                            if (rectangleOverlay) {
                                overlayArray.push(rectangleOverlay);
                            }
                        } else if (layerParams.type === FastEnum.MapItemType.polygon_overlay) {
                            let polygonOverlay = aMapComponent.addPolygonOverlay(layerParams);
                            if (polygonOverlay) {
                                overlayArray.push(polygonOverlay);
                            }
                        } else if (layerParams.type === FastEnum.MapItemType.image_layer) {
                            let imageLayer = aMapComponent.addImageLayer(layerParams);
                            if (imageLayer) {
                                overlayArray.push(imageLayer);
                            }
                        } else if (layerParams.type === FastEnum.MapItemType.district_layer) {
                            aMapComponent.addDistrictLayer(layerParams);
                        } else if (layerParams.type === FastEnum.MapItemType.marker_overlay) {
                            let markerOverlay = aMapComponent.addMarkerOverlay(layerParams);
                            if (markerOverlay) {
                                overlayArray.push(markerOverlay);
                            }
                        }
                    }
                    aMapComponent.fitView(overlayArray);
                },
            });
        }

        /**
         * 在地图上实现选择功能，可以是选择坐标、选择矩形区域、选择多边形区域
         * @param obj 动画对象
         * @param params 参数 {@link AMapMapParams}
         */
        static select(obj, params: AMapMapParams): ExtPromise {
            params = AMapMapParams.newParam(params);
            return new Ext.Promise((resolve) => {
                let searchPanel = Ext.create('Ext.form.FormPanel', {
                    method: 'POST',
                    region: 'north',
                    itemId: "mapSearchFormPanel",
                    autoScroll: false,
                    scrollable: false,
                    layout: {
                        type: 'hbox',
                        align: 'middle',
                        pack: 'start'
                    },
                    defaults: {
                        margin: '5 5 5 5'
                    },
                    refreshSearchLayout: function () {
                        let searchAddress = this.getField("searchAddress");
                        let searchAddress2 = this.getField("searchAddress2");

                        let searchType = this.getField("searchType");
                        let searchTypeValue = searchType.getValue();
                        let searchTypeText = searchType.getDisplayValue();

                        searchAddress.code = "SearchMapA" + searchTypeValue;
                        searchAddress2.code = "SearchMapB" + searchTypeValue;

                        searchAddress.setValue(null);
                        searchAddress2.setValue(null);

                        searchAddress.checkHistory();
                        searchAddress2.checkHistory();

                        if (searchTypeValue !== 1) {
                            searchAddress2.setHidden(false);
                            searchAddress2.allowBlank = false;
                            searchAddress.setEmptyText("请输入" + searchTypeText + "【经度】");
                            searchAddress2.setEmptyText("请输入" + searchTypeText + "【纬度】");
                        } else {
                            searchAddress2.setHidden(true);
                            searchAddress2.allowBlank = true;
                            searchAddress.setEmptyText("请输入" + searchTypeText);
                        }
                    },
                    items: [
                        {
                            xtype: 'combobox',
                            width: 160,
                            name: 'searchType',
                            itemId: "searchType",
                            editable: false,
                            displayField: "text",
                            valueField: "id",
                            value: 1,
                            store: Ext.create('Ext.data.Store', {
                                fields: ["id", "text"],
                                data: [
                                    {
                                        'text': '文本位置搜索',
                                        "id": 1
                                    },
                                    {
                                        'text': '高德坐标搜索',
                                        "id": 2
                                    },
                                    {
                                        'text': '百度坐标搜索',
                                        "id": 3
                                    },
                                    {
                                        'text': 'GPS坐标搜索',
                                        "id": 4
                                    }, {
                                        'text': '度分秒搜索',
                                        "id": 5
                                    }
                                ],
                            }),
                            listeners: {
                                change: function (cmb, newValue, oldValue, eOpts) {
                                    cmb.ownerCt.refreshSearchLayout();
                                },
                            }
                        },
                        {
                            name: 'searchAddress',
                            columnWidth: 1,
                            itemId: "searchAddress",
                            flex: 1,
                            useHistory: true,
                            emptyText: '输入地址',
                            allowBlank: false,
                            xtype: 'textfield'
                        },
                        {
                            name: 'searchAddress2',
                            columnWidth: 1,
                            itemId: "searchAddress2",
                            flex: 1,
                            hidden: true,
                            useHistory: true,
                            emptyText: '输入地址',
                            xtype: 'textfield'
                        },
                        {
                            xtype: 'button',
                            iconCls: "extIcon extSearch",
                            text: '搜索位置',
                            handler: function () {
                                let thisFormPanel = this.up("#mapSearchFormPanel");
                                let form = thisFormPanel.getForm();
                                if (form.isValid()) {
                                    let baseContainer = thisFormPanel.up("#mapWindow");
                                    let searchAddress = thisFormPanel.getFieldValue("searchAddress");
                                    let searchAddress2 = thisFormPanel.getFieldValue("searchAddress2");

                                    let searchType = thisFormPanel.getField("searchType");
                                    let searchTypeValue = searchType.getValue();
                                    let searchTypeText = searchType.getDisplayValue();
                                    baseContainer.setLoading("正在" + searchTypeText + "中，请稍后……");

                                    let aMapComponent = new AMapComponent(baseContainer.down("#mapContainer"));
                                    if (searchTypeValue === 1) {//文字搜索
                                        aMapComponent.searchAddress(searchAddress).then((data) => {
                                            baseContainer.setLoading(false);
                                            if (data) {
                                                let regeocode = data.result.geocodes[0];
                                                data.map.setCenter(regeocode.location);
                                                if (params.showSearchADLayer) {
                                                    let param = AMapDistrictLayerParam.newParam({
                                                        title: '搜索结果的区域图层',
                                                        adcode: [regeocode.adcode]
                                                    });
                                                    let amapObj = new AMapObject(data.map);
                                                    amapObj.removeOverlay(param.title);
                                                    amapObj.addDistrictLayer(param);
                                                }
                                                let enabledEditorOverlay = aMapComponent.getEnabledEditorOverlay(FastEnum.MapItemType.marker_overlay);
                                                for (let overlay of enabledEditorOverlay) {
                                                    // overlay.searchLngLat(position.location);
                                                    overlay.updateRegeocode(regeocode.location, regeocode);
                                                }

                                                FastExt.Dialog.toast("地图已切换到：" + regeocode.formattedAddress);
                                            } else {
                                                FastExt.Dialog.showAlert("系统提醒", "未检索到位置信息！");
                                            }
                                        });
                                        return;
                                    }

                                    let lnglat = null;
                                    let convertType = null;
                                    if (searchTypeValue === 2) {//高德坐标搜索
                                        lnglat = AMapHelper.parseAMapLngLat(searchAddress + "," + searchAddress2);
                                    } else if (searchTypeValue === 3) {//百度坐标搜索
                                        convertType = "baidu";
                                        lnglat = [searchAddress, searchAddress2];
                                    } else if (searchTypeValue === 4) {//GPS坐标搜索
                                        convertType = "gps";
                                        lnglat = [searchAddress, searchAddress2];
                                    } else if (searchTypeValue === 5) {//度分秒搜索
                                        lnglat = AMapHelper.plainStringToAMapLngLat(searchAddress, searchAddress2);
                                    }
                                    AMapHelper.amapConvertFrom(lnglat, convertType).then(function (result) {
                                        if (result) {
                                            let convertLngLat = result[0];
                                            let overlay = aMapComponent.getOverlay("SelectPosition");
                                            if (overlay) {
                                                baseContainer.setLoading(false);
                                                overlay.searchLngLat(convertLngLat);
                                            } else {
                                                aMapComponent.searchLngLat(convertLngLat).then((data) => {
                                                    baseContainer.setLoading(false);
                                                    if (data) {
                                                        let result = data.result;
                                                        let position = result.regeocode;

                                                        data.map.setCenter(convertLngLat);
                                                        if (params.showSearchADLayer) {
                                                            let param = AMapDistrictLayerParam.newParam({
                                                                title: '搜索结果的区域图层',
                                                                adcode: [position.addressComponent.adcode]
                                                            });
                                                            let amapObj = new AMapObject(data.map);
                                                            amapObj.removeOverlay(param.title);
                                                            amapObj.addDistrictLayer(param);
                                                        }
                                                        FastExt.Dialog.toast("地图已切换到：" + position.formattedAddress);
                                                    } else {
                                                        FastExt.Dialog.showAlert("系统提醒", "未检索到位置信息！");
                                                    }
                                                });
                                            }
                                        } else {
                                            FastExt.Dialog.showAlert("系统提醒", "坐标转换异常！");
                                        }
                                    });
                                }
                            }
                        }],
                });
                let mapPanel = FastExt.AMapDialog.buildMapPanel(params);
                let selectButtonMenus = [];

                for (let layer of params.wrapItems()) {
                    if (!layer.enabledEditor) {
                        continue;
                    }

                    layer.onChange = function () {
                        mapPanel.refreshResult();
                    };
                    layer.showLoading = function (message) {
                        mapPanel.setLoading(message);
                    };
                    layer.hideLoading = function () {
                        mapPanel.setLoading(false);
                    };


                    if (layer.type === FastEnum.MapItemType.rectangle_overlay) {
                        selectButtonMenus.push({
                            text: layer.title,
                            iconCls: "extIcon extMouseClick",
                            handler: function () {
                                FastExt.Dialog.showTip("系统提醒", "请在地图上长按鼠标左键拖拽，开始选择矩形区域！", () => {
                                    FastExt.Dialog.toast("请开始你的选择！");
                                    new AMapComponent(mapPanel).beginDrawRectangleOverlay(layer);
                                });
                            },
                        });
                    } else if (layer.type === FastEnum.MapItemType.polygon_overlay) {
                        selectButtonMenus.push({
                            text: layer.title,
                            iconCls: "extIcon extMouseClick",
                            handler: function () {
                                FastExt.Dialog.showTip("系统提醒", "请在地图上点击鼠标左键开始点选多边形区域，点击鼠标右键结束选择！", () => {
                                    FastExt.Dialog.toast("请开始你的选择！");
                                    new AMapComponent(mapPanel).beginDrawPolygonOverlay(layer);
                                });
                            },
                        });
                    }
                }


                let selectButton: any = {
                    xtype: 'button',
                    width: 160,
                    text: '开始选择',
                    hidden: selectButtonMenus.length === 0,
                    iconCls: "extIcon extMore",
                    menu: selectButtonMenus
                };

                if (selectButtonMenus.length === 1) {
                    selectButton = {
                        xtype: 'button',
                        // width: 160,
                        text: selectButtonMenus[0].text,
                        iconCls: "extIcon extMouseClick",
                        handler: selectButtonMenus[0].handler,
                    }
                }

                let bottomPanel = Ext.create('Ext.panel.Panel', {
                    layout: "column",
                    region: 'south',
                    itemId: 'bottomContainer',
                    border: 0,
                    defaults: {
                        margin: '5 5 5 5'
                    },
                    padding: '10 10 10 10',
                    style: {
                        background: "#ffffff",
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            itemId: 'selectResult',
                            readOnly: true,
                            columnWidth: 1
                        },
                        {
                            xtype: "panel",
                            layout: "column",
                            columnWidth: 1,
                            border: 0,
                            defaults: {
                                margin: '5 5 5 5'
                            },
                            items: [
                                {
                                    xtype: 'button',
                                    columnWidth: 1,
                                    text: '确定选择',
                                    iconCls: "extIcon extOk",
                                    handler: function () {
                                        FastExt.Base.runCallBack(resolve, params.wrapItems());
                                        let mapWindow = this.up("#mapWindow");
                                        if (mapWindow) {
                                            mapWindow.close();
                                        }
                                    }
                                },
                                selectButton,
                            ]
                        },
                    ]
                });
                let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));

                Ext.create('Ext.window.Window', {
                    animateTarget: obj,
                    title: params.title,
                    itemId: "mapWindow",
                    height: winHeight,
                    width: winWidth,
                    minHeight: 500,
                    minWidth: 600,
                    iconCls: 'extIcon extMap',
                    layout: 'fit',
                    resizable: true,
                    maximizable: true,
                    constrain: true,
                    modal: true,
                    items: [
                        {
                            xtype: "panel",
                            layout: 'border',
                            border: 0,
                            items: [searchPanel, mapPanel, bottomPanel],
                        }
                    ],
                    listeners: {
                        show: function () {
                            let mapContainer = this.down("#mapContainer");
                            if (mapContainer) {
                                mapContainer.loadMap();
                            }
                            searchPanel.refreshSearchLayout();
                        },
                        close: function (val) {
                            let mapContainer = this.down("#mapContainer");
                            if (mapContainer) {
                                mapContainer.destroyMap();
                            }
                            FastExt.Base.runCallBack(resolve);
                        }
                    }
                }).show();
            });
        }


        /**
         * 在地图上显示功能，可以是选择坐标、选择矩形区域、选择多边形区域
         * @param obj
         * @param params
         */
        static show(obj, params: AMapMapParams) {
            params = AMapMapParams.newParam(params);
            let mapPanel = FastExt.AMapDialog.buildMapPanel(params);

            let bottomPanel = Ext.create('Ext.panel.Panel', {
                layout: "column",
                region: 'south',
                itemId: 'bottomContainer',
                border: 0,
                defaults: {
                    margin: '5 5 5 5'
                },
                padding: '10 10 10 10',
                style: {
                    background: "#ffffff",
                },
                items: [
                    {
                        xtype: 'textfield',
                        itemId: 'selectResult',
                        readOnly: true,
                        columnWidth: 1
                    }
                ]
            });

            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));

            Ext.create('Ext.window.Window', {
                animateTarget: obj,
                title: params.title,
                itemId: "mapWindow",
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 600,
                iconCls: 'extIcon extMap',
                layout: 'fit',
                resizable: true,
                maximizable: true,
                constrain: true,
                modal: true,
                items: [
                    {
                        xtype: "panel",
                        layout: 'border',
                        border: 0,
                        items: [mapPanel, bottomPanel],
                    }
                ],
                listeners: {
                    show: function () {
                        let mapContainer = this.down("#mapContainer");
                        if (mapContainer) {
                            mapContainer.loadMap();
                        }
                    },
                    close: function () {
                        let mapContainer = this.down("#mapContainer");
                        if (mapContainer) {
                            mapContainer.destroyMap();
                        }
                    },
                }
            }).show();
        }


        /**
         * 在地图上显示指定坐标功能
         * @param obj
         * @param lnglat 经纬度
         * @param title 位置标题
         * @param address 位置信息
         */
        static plainShow(obj, lnglat, title, address) {
            FastExt.AMapDialog.show(obj, FastExt.AMapMapParams.newParam({
                title: title ? title : "查看坐标位置",
                items: [
                    {
                        type: FastEnum.MapItemType.marker_overlay,
                        lnglat: lnglat,
                        address: address,
                    }
                ],
            }));
        }

    }


    /**
     * 操作地图选择的参数
     */
    export class AMapMapParams {

        static newParam(param?: any): AMapMapParams {
            let newParam = new AMapMapParams();
            if (param) {
                for (let paramKey in param) {
                    newParam[paramKey] = param[paramKey];
                }
            }
            return newParam;
        }

        title: string = "选择地图位置";

        /**
         * 搜索结果的显示城市边界
         */
        showSearchADLayer: boolean = false;

        /**
         * 初始地图缩放级别。地图初始化默认显示用户所在当前城市范围。
         */
        zoom: number;

        items: any[];

        wrapItems() {
            if (!this.items) {
                return [];
            }
            if (this["wrapped"]) {
                return this.items;
            }
            let wrapLayers = [];
            for (let layer of this.items) {
                if (layer.type === FastEnum.MapItemType.rectangle_overlay) {
                    wrapLayers.push(AMapRectangleOverlayParam.newParam(layer));
                } else if (layer.type === FastEnum.MapItemType.polygon_overlay) {
                    wrapLayers.push(AMapPolygonOverlayParam.newParam(layer));
                } else if (layer.type === FastEnum.MapItemType.image_layer) {
                    wrapLayers.push(AMapImageLayerParam.newParam(layer));
                } else if (layer.type === FastEnum.MapItemType.district_layer) {
                    wrapLayers.push(AMapDistrictLayerParam.newParam(layer));
                } else if (layer.type === FastEnum.MapItemType.marker_overlay) {
                    wrapLayers.push(AMapMarkerOverlayParam.newParam(layer));
                }
            }
            this.items = wrapLayers;
            this["wrapped"] = true;
            return this.items;
        }
    }


    export class AMapItemBaseParam {
        type: string = "none";

        title: string = "标题";

        onChange = function () {
        };
        showLoading = function (message?: string) {
        };
        hideLoading = function () {
        };

        notifyChange() {
            if (this.onChange) {
                this.onChange();
            }
        }

        toResultInfo() {
            return "";
        }
    }

    /**
     * 点标记覆盖物操作
     */
    export class AMapMarkerOverlayParam extends AMapItemBaseParam {

        static newParam(param?: any): AMapMarkerOverlayParam {
            let newParam = new AMapMarkerOverlayParam();
            if (param) {
                for (let paramKey in param) {
                    newParam[paramKey] = param[paramKey];
                }
            }
            return newParam;
        }

        type: string = FastEnum.MapItemType.marker_overlay;

        /**
         * 标记点的经纬度，例如：110.568434,32.377389
         */
        lnglat: string;

        /**
         * 经度
         */
        lng: number;

        /**
         * 纬度
         */
        lat: number;

        /**
         * 地图缩放级别
         */
        zoom: number = -1;

        title: string = "地图坐标";

        /**
         * 地理位置
         */
        address: string;

        /**
         * 所在省份
         */
        province: string;

        /**
         * 所在城市
         */
        city: string;

        /**
         * 所在区/县/街道
         */
        district: string;


        /**
         * 是否编辑
         */
        enabledEditor: boolean = false;


        /**
         * 在 enabledEditor 为 true的条件下 当标记点坐标信息为空时，启用当前定位信息，
         */
        enabledLocation: boolean = true;

        /**
         * 在 enabledEditor 为 true的条件下 是否启用坐标切换到点击地图的位置
         */
        enabledMapClickLocation: boolean = true;

        /**
         * 在 enabledEditor 为 true的条件下 是否启用地图中心视角以当前marker为主
         */
        enabledMapFlowCenter: boolean = true;


        isEmptyLngLat(): boolean {
            if (this.lnglat) {
                return false;
            }
            if (this.lng <= 0) {
                return true;
            }
            if (this.lat <= 0) {
                return true;
            }
            return false;
        }


        toResultInfo(): string {
            let infos = [];
            if (this.lnglat) {
                infos.push("坐标：" + this.lnglat);
            } else if (this.lng > 0 && this.lat > 0) {
                infos.push("坐标：" + this.lng + " , " + this.lat);
            }
            if (this.address) {
                infos.push("位置：" + this.address);
            }
            return infos.join(" ，");
        }

    }

    /**
     * 地图矩形图层的参数
     */
    export class AMapRectangleOverlayParam extends AMapItemBaseParam {

        /**
         * 实例化一个对象
         * @param param 配置
         */
        static newParam(param?: any): AMapRectangleOverlayParam {
            let newParam = new AMapRectangleOverlayParam();
            if (param) {
                for (let paramKey in param) {
                    newParam[paramKey] = param[paramKey];
                }
            }
            return newParam;
        }


        type: string = FastEnum.MapItemType.rectangle_overlay;

        title: string = "矩形区域选择";

        /**
         * 绑定的图片图层
         */
        imageLayerParam: AMapImageLayerParam;

        /**
         * 层级
         */
        zIndex: number;

        /**
         * 西南坐标，左下坐标，例如：110.568434,32.377389
         */
        southWestLngLat: string;

        /**
         * 东北坐标，右上坐标，例如：110.969035,32.667611
         */
        northEastLngLat: string;


        /**
         * 矩形的宽高，相对地图显示的容器
         */
        sizeToContainer: any;

        /**
         * 是否编辑
         */
        enabledEditor: boolean = false;

        /**
         * 填充色
         */
        fillColor: string = '#00b0ff';

        /**
         * 边框色
         */
        strokeColor: string = '#80d8ff';

        toResultInfo(): string {
            if (!this.southWestLngLat) {
                return "";
            }
            if (!this.northEastLngLat) {
                return "";
            }

            let infos = [];
            infos.push("矩形西南角(左下)：" + this.southWestLngLat);
            infos.push("矩形东北角(右上)：" + this.northEastLngLat);
            if (this.sizeToContainer) {
                infos.push("矩形宽高尺寸：" + this.sizeToContainer.width + "px - " + this.sizeToContainer.height + "px");
                infos.push("矩形宽高比例：" + "1 : " + (this.sizeToContainer.height / this.sizeToContainer.width).toFixed(4));
            }
            return infos.join(" ，");
        }

        bindImageLayer() {
            if (this.imageLayerParam && this.imageLayerParam.url) {
                let newParam = AMapImageLayerParam.newParam(this.imageLayerParam);
                newParam.southWestLngLat = this.southWestLngLat;
                newParam.northEastLngLat = this.northEastLngLat;
                return newParam;
            }
            return null;
        }
    }

    /**
     * 地图多边形图层的参数
     */
    export class AMapPolygonOverlayParam extends AMapItemBaseParam {

        /**
         * 实例化一个对象
         * @param param 配置
         */
        static newParam(param?: any): AMapPolygonOverlayParam {
            let newParam = new AMapPolygonOverlayParam();
            if (param) {
                for (let paramKey in param) {
                    newParam[paramKey] = param[paramKey];
                }
            }
            return newParam;
        }


        type: string = FastEnum.MapItemType.polygon_overlay;

        title: string = "多边形区域选择";

        /**
         * 层级
         */
        zIndex: number;

        /**
         * 多边形的坐标数组，例如：["110.605566,32.491494","110.614341,32.492633",……]
         */
        path: string[];

        /**
         * 是否编辑
         */
        enabledEditor: boolean = false;

        /**
         * 填充色
         */
        fillColor: string = '#00b0ff';

        /**
         * 边框色
         */
        strokeColor: string = '#80d8ff';

        toResultInfo(): string {
            if (!this.path) {
                return "";
            }
            let infos = [];
            infos.push(FastExt.Json.objectToJson(this.path));
            return infos.join(" ，");
        }
    }

    /**
     * 中国行政区域的图层边界显示
     */
    export class AMapDistrictLayerParam extends AMapItemBaseParam {

        static newParam(param?: any): AMapDistrictLayerParam {
            let newParam = new AMapDistrictLayerParam();
            if (param) {
                for (let paramKey in param) {
                    newParam[paramKey] = param[paramKey];
                }
            }
            return newParam;
        }

        type: string = FastEnum.MapItemType.district_layer;

        title: string = "中国城市边界图层";

        /**
         * 层级
         */
        zIndex: number;

        /**
         * 填充色
         */
        fill: string = "red";

        /**
         * 省边界的边框颜色
         */
        province_stroke: string = "red";

        /**
         * 城市界的边框颜色
         */
        city_stroke: string = "red";
        /**
         * 区/县界的边框颜色
         */
        county_stroke: string = "red";

        /**
         * 需要显示的地区编码，可以：省、市、区同时存在
         */
        adcode: string[];

        /**
         * 设定数据的层级深度，depth为0的时候只显示国家面，depth为1的时候显示省级， 当国家为中国时设置depth为2的可以显示市一级
         */
        depth: number = 2;
    }

    /**
     * 图片图层的参数
     */
    export class AMapImageLayerParam extends AMapItemBaseParam {
        /**
         * 实例化一个对象
         * @param param 配置
         */
        static newParam(param?: any): AMapImageLayerParam {
            let newParam = new AMapImageLayerParam();
            if (param) {
                for (let paramKey in param) {
                    newParam[paramKey] = param[paramKey];
                }
            }
            return newParam;
        }

        type: string = FastEnum.MapItemType.image_layer;

        title: string = "图片图层";

        /**
         * 西南坐标，左下坐标，例如：110.568434,32.377389
         */
        southWestLngLat: string;

        /**
         * 东北坐标，右上坐标，例如：110.969035,32.667611
         */
        northEastLngLat: string;

        /**
         * 图片的地址
         */
        url: string;

        /**
         * 层级
         */
        zIndex: number;
    }

}
