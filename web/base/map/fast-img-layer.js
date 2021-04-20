let mapImgLayerArray = [];

//加载图层，由父类传输
function loadParentImgLayer() {
    if (window.parent) {
        //将添加图片图层到地图上的函数 回调给调用者
        if (window.parent["renderMapImageLayer"]) {
            window.parent["renderMapImageLayer"](window["addImgLayerInMap"]);
            let imgLayerHtml = "<div id=\"imgLayerControl\" class=\"amap-control amap-toolbar\" style=\"right: 20px; bottom: 100px;\">\n" +
                "    <span onclick=\"showImgLayerInMap()\" style=\"color: rgb(0, 0, 0);font-size: smaller;\">显</span>\n" +
                "    <span onclick=\"hideImgLayerInMap()\" style=\"color: rgb(0, 0, 0);font-size: smaller;\">隐</span>\n" +
                "</div>";

            let divTemp = document.createElement("div");
            divTemp.innerHTML = imgLayerHtml;
            document.body.appendChild(divTemp);
        }
    }
}

//添加图层
function addImgLayerInMap(imgUrl, southWestLngLat, northEastLngLat) {
    let bounds = new AMap.Bounds(
        new AMap.LngLat(southWestLngLat.split(",")[0], southWestLngLat.split(",")[1]),
        new AMap.LngLat(northEastLngLat.split(",")[0], northEastLngLat.split(",")[1])
    );
    let imageLayer = new AMap.ImageLayer({
        url: imgUrl,
        bounds: bounds,
        zooms: [0, 50]
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