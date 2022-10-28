let mapImgLayerArray = [];

//加载图层，由父类传输
function loadParentImgLayer() {
    if (window.parent) {
        //将添加图片图层到地图上的函数 回调给调用者
        if (window.parent["renderMapImageLayer"]) {
            window.parent["renderMapImageLayer"](window["addImgLayerInMap"]);
            let imgLayerHtml = "<div id=\"imgLayerControl\" class=\"amap-control amap-toolbar\" style=\"right: 20px; bottom: 100px;\">" +
                "    <span onclick=\"showImgLayerInMap()\" style=\"color: rgb(0, 0, 0);font-size: smaller;\">显</span>" +
                "    <span onclick=\"hideImgLayerInMap()\" style=\"color: rgb(0, 0, 0);font-size: smaller;\">隐</span>" +
                "</div>";

            let divTemp = document.createElement("div");
            divTemp.innerHTML = imgLayerHtml;
            document.body.appendChild(divTemp);
        }
    }
}

//添加图层
function addImgLayerInMap(imgUrl, southWestLngLat, northEastLngLat, zIndex, minZoom, maxZoom) {
    let bounds = new AMap.Bounds(
        new AMap.LngLat(southWestLngLat.split(",")[0], southWestLngLat.split(",")[1]),
        new AMap.LngLat(northEastLngLat.split(",")[0], northEastLngLat.split(",")[1])
    );
    if (!zIndex) {
        zIndex = 6;
    }
    if (minZoom === undefined) {
        minZoom = 1;
    }
    if (maxZoom === undefined) {
        maxZoom = 50;
    }

    let imageLayer = new AMap.ImageLayer({
        url: imgUrl,
        bounds: bounds,
        zIndex: zIndex,
        zooms: [minZoom, maxZoom]
    });
    imageLayer.on("click", function () {
        if (window.parent) {
            window.parent.showImage(null, imgUrl);
        }
    });
    mapImgLayerArray.push(imageLayer);
    map.add(imageLayer);
}


//隐藏图片图层
function hideImgLayerInMap() {
    for (let i = 0; i < mapImgLayerArray.length; i++) {
        let imgLayer = mapImgLayerArray[i];
        imgLayer.hide();
    }
}

//显示图片图层
function showImgLayerInMap() {
    for (let i = 0; i < mapImgLayerArray.length; i++) {
        let imgLayer = mapImgLayerArray[i];
        imgLayer.show();
    }
}

loadParentImgLayer();