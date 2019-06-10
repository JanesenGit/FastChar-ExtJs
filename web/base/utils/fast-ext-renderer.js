var renders = {
    normal: function () {
        return function (val) {
            if (Ext.isEmpty(val)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            return val;
        };
    },
    text: function () {
        return function (val) {
            if (Ext.isEmpty(val)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            return "<span style='white-space: pre;'>" + val + "</span>";
        };
    },
    enum: function (enumName) {
        return function (val) {
            if (Ext.isEmpty(val)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            return getEnumText(enumName, val);
        }
    },
    file: function () {
        return function (val, m, record) {
            if (Ext.isEmpty(val) || val == "null") {
                return "<span style='color: #ccc;'>暂无文件</span>";
            }
            return "<a href=\"" + system.formatUrlVersion(val) + "\" target='_blank' >" + val.substring(val.lastIndexOf("/") + 1) + "</a>";
        };
    },
    files: function () {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            var data = [];
            if (!Ext.isEmpty(val)) {
                try {
                    data = Ext.decode(val);
                } catch (e) {
                }
            }
            if (data.length == 0) {
                return "<span style='color: #ccc;'>暂无文件</span>";
            }
            if (details) {
                var list = "";
                for (var i = 0; i < data.length; i++) {
                    list += renders.file()(data[i]) + "<br/>";
                }
                return list;
            }
            return "<span style='color: #4279fa;'>共有" + data.length + "个文件！</span>";
        };
    },
    image: function (height) {
        return function (val) {
            var imageHeight = "16px";
            if (Ext.isEmpty(val)) {
                return "<img style='border:1px solid #cccccc;height:"+imageHeight+";' src='images/default_img.png'   />";
            }
            try {
                if (height) {
                    imageHeight = height + "px";
                }
            } catch (e) {
            }
            return "<img style='border:1px solid #cccccc;height:"+imageHeight+";' onerror=\"javascript:this.src='images/default_img.png';\" onclick=\"showImage(this,'" + system.formatUrlVersion(val) + "')\"  src='" + system.formatUrlVersion(val) + "'   />";
        };
    },
    images: function () {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            var data = [];
            if (!Ext.isEmpty(val)) {
                try {
                    data = Ext.decode(val);
                } catch (e) {}
            }
            if (data.length == 0) {
                return "<span style='color: #ccc;'>暂无图片</span>";
            }
            if (details) {
                var list = "";
                for (var i = 0; i < data.length; i++) {
                    list += renders.image(24)(data[i]) + "&nbsp;&nbsp;";
                }
                return list;
            }
            return "<span style='color: #4279fa;'>共有" + data.length + "张图片！</span>";
        };
    },
    html: function () {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            if (Ext.isEmpty(val)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            return val.replace(/<[^>]+>/g,"");
        };
    },
    link: function (name,entityCode, entityId) {
        return function (val, m, record) {
            if (Ext.isEmpty(val) || val == "null") {
                return "<span style='color: #ccc;'>无</span>";
            }
            var keyValue = record.get(name);
            var functionStr = "new " + entityCode + "().showDetails(null, {'t." + entityId + "':'" + keyValue + "'});";
            return "<a href=\"javascript:"+functionStr+"\" target='_blank' >" + val + "</a>";
        };
    },
    map: function (lngName, latName) {
        return function (val, m, record) {
            if (Ext.isEmpty(val) || val == "null") {
                return "<span style='color: #ccc;'>无</span>";
            }
            var lng = record.get(lngName);
            var lat = record.get(latName);
            if (lng && lat) {
                var lnglat = lng + "," + lat;
                var functionStr = "showAddressInMap(null,'" + lnglat + "')";
                return "<a href=\"javascript:"+functionStr+"\" target='_blank' >" + val + "</a>";
            }
            return val;
        };
    },
    password: function () {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            if (Ext.isEmpty(val)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            return "<span>******</span>";
        };

    }
};
