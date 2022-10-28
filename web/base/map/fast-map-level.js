function loadParentLevelLayer() {
    let levelLayerHtml = "<div id=\"levelControl\" class=\"amap-control\" style=\"left: 15px;bottom: 60px;background: #ffffffb0;padding: 0 10px;\">" +
        "    <span id='mapLevelText' style=\"color: rgb(0, 0, 0);font-size: small;\">" + map.getZoom() + "&nbsp;级别</span>" +
        "</div>";

    let divTemp = document.createElement("div");
    divTemp.innerHTML = levelLayerHtml;
    document.body.appendChild(divTemp);

    map.on('zoomchange', function () {
        document.getElementById("mapLevelText").innerHTML = map.getZoom() + "&nbsp;级别";
    });
}

loadParentLevelLayer();