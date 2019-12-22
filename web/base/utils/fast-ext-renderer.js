const renders = {
    normal: function (append, isFirst) {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            if (Ext.isEmpty(val)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            if (!append) {
                append = "";
            }
            if (!isFirst) {
                isFirst = false;
            }
            if (isFirst) {
                return append + val;
            }
            if (details) {
                return (val + append).replace(new RegExp("\n", 'g'), "<br/>")
                    .replace(new RegExp("\t", 'g'), "&nbsp;&nbsp;&nbsp;&nbsp;")
                    .replace(new RegExp(" ", 'g'), "&nbsp;");
            }
            return val + append;
        };
    },
    money: function () {
        return function (val) {
            if (Ext.isEmpty(val)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            return "￥" + val;
        };
    },
    text: function () {
        return function (val) {
            if (Ext.isEmpty(val)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            val = val.replace(/<\/?.+?>/g, "");
            return "<span style='white-space: pre;'>" + val + "</span>";
        };
    },
    file: function () {
        return function (val, m, record) {
            if (Ext.isEmpty(val) || val == "null") {
                return "<span style='color: #ccc;'>暂无文件</span>";
            }
            return "&nbsp;<a href=\"" + system.formatUrlVersion(val) + "\" target='_blank' >" + val.substring(val.lastIndexOf("/") + 1) + "</a>&nbsp;";
        };
    },
    files: function () {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            try {
                if (Ext.isEmpty(val) || val == "null") {
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
                let data = [];
                if (!Ext.isEmpty(val)) {
                    try {
                        data = Ext.decode(val);
                    } catch (e) {
                    }
                }
                if (data.length == 0) {
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
                let dataId = $.md5(val);
                let detailsList = "";
                for (let i = 0; i < data.length; i++) {
                    detailsList += renders.file()(data[i]) + "<br/>";
                }
                if (details) {
                    return detailsList;
                }
                let html = "<span id='" + dataId + "' style='color: #4279fa;'>共有" + data.length + "个文件！</span>";
                let detailsId = $.md5(html);
                window[detailsId] = detailsList;
                return html;
            } catch (e) {
                return "<span style='color: #ccc;'>暂无文件</span>";
            }
        };
    },
    image: function (height, width) {
        return function (val) {
            try {
                let imageHeight = "16px";
                let imageWidth = "auto";
                if (Ext.isEmpty(val) || val == "null") {
                    return "<img style='border:1px solid #cccccc;height:" + imageHeight + ";' src='images/default_img.png'   />";
                }
                if (val.startWith("//")) {
                    val = "http:" + val;
                }
                try {
                    if (height) {
                        imageHeight = height + "px";
                    }
                    if (width) {
                        imageWidth = width + "px";
                    }
                } catch (e) {
                }
                let dataId = $.md5(val);
                window[dataId] = "<img src='" + val + "' style='border:1px solid #cccccc;width: 100px;' onerror=\"javascript:this.src='images/default_img.png';\" >";
                return "<img details-id='" + dataId + "' style='border:1px solid #cccccc;height:" + imageHeight + ";width: " + imageWidth + ";' onerror=\"javascript:this.src='images/default_img.png';\" onclick=\"showImage(this,'" + system.formatUrlVersion(val) + "')\"  src='" + system.formatUrlVersion(val) + "'/>";
            } catch (e) {
                return "<span style='color: #ccc;'>暂无图片</span>";
            }
        };
    },
    images: function () {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            try {
                if (Ext.isEmpty(val) || val == "null") {
                    return "<span style='color: #ccc;'>暂无图片</span>";
                }
                let data = val;
                if (Ext.isString(val)) {
                    if (!Ext.isEmpty(val)) {
                        try {
                            data = Ext.decode(val);
                        } catch (e) {
                        }
                    }
                }
                if (data.length == 0) {
                    return "<span style='color: #ccc;'>暂无图片</span>";
                }
                let dataId = $.md5(JSON.stringify(data));
                let detailsList = "";
                for (let i = 0; i < data.length; i++) {
                    detailsList += renders.image(24)(data[i]) + "&nbsp;&nbsp;";
                    // if ((i + 1) % 3 == 0) {
                    //     detailsList += "<br/>";
                    // }
                }
                if (details) {
                    return detailsList;
                }
                let html = "<span details-id='" + dataId + "' style='color: #4279fa;'>共有" + data.length + "张图片！</span>";
                window[dataId] = detailsList;
                return html;
            } catch (e) {
                return "<span style='color: #ccc;'>暂无图片</span>";
            }
        };
    },
    mp4: function () {
        return function (val, m, record) {
            if (Ext.isEmpty(val) || val == "null") {
                return "<span style='color: #ccc;'>暂无文件</span>";
            }
            return "&nbsp;<a href=\"javascript:showVideo(this,'" + system.formatUrlVersion(val) + "');\" >" + val.substring(val.lastIndexOf("/") + 1) + "</a>&nbsp;";
        };
    },
    html: function () {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            if (Ext.isEmpty(val) || val == "null") {
                return "<span style='color: #ccc;'>无</span>";
            }
            let key = $.md5(val);
            MemoryCache[key] = val;
            let functionStr = "showEditorHtml(this,'查看内容',MemoryCache['" + key + "'])";
            return "&nbsp;<a href=\"javascript:" + functionStr + ";\">查看内容</a>&nbsp;";
        };
    },
    link: function (name, entityCode, entityId) {
        return function (val, m, record) {
            try {
                if (Ext.isEmpty(val) || val == "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }
                let keyValue = record.get(name);
                let functionStr = "new " + entityCode + "().showDetails(null, {'t." + entityId + "':'" + keyValue + "'})";
                return "&nbsp;<a href=\"javascript:" + functionStr + ";\" >" + val + "</a>&nbsp;";
            } catch (e) {
                return "<span style='color: #ccc;'>无</span>";
            }
        };
    },
    target: function (targetId, targetType, targetFunction) {
        return function (val, m, record) {
            try {
                if (Ext.isEmpty(val) || val == "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }
                if (!targetFunction) {
                    targetFunction = "getTargetEntity";
                }
                if (!Ext.isFunction(window[targetFunction])) {
                    return val;
                }
                let targetTypeValue = record.get(targetType);
                let targetIdValue = record.get(targetId);
                let targetEntity = window[targetFunction](targetTypeValue, targetType);
                if (targetEntity) {
                    let functionStr = "new " + targetEntity.entityCode + "().showDetails(null, {'t." + targetEntity.entityId + "':'" + targetIdValue + "'})";
                    return "&nbsp;<a href=\"javascript:" + functionStr + ";\" >" + val + "</a>&nbsp;";
                }
                return val;
            } catch (e) {
                return "<span style='color: #ccc;'>无</span>";
            }
        };
    },
    map: function (lngName, latName) {
        return function (val, m, record) {
            try {
                if (Ext.isEmpty(val) || val == "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }
                let lng = record.get(lngName);
                let lat = record.get(latName);
                if (lng && lat) {
                    let lnglat = lng + "," + lat;
                    let functionStr = "showAddressInMap(null,'" + lnglat + "')";
                    return "&nbsp;<a href=\"javascript:" + functionStr + ";\" >" + val + "</a>&nbsp;";
                }
                return val;
            } catch (e) {
                return "<span style='color: #ccc;'>无</span>";
            }
        };
    },
    password: function () {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            if (Ext.isEmpty(val)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            return "<span>******</span>";
        };

    },
    href: function () {
        return function (val, m, record) {
            if (Ext.isEmpty(val) || val == "null") {
                return "<span style='color: #ccc;'>无</span>";
            }
            return "&nbsp;<a href='" + val + "' target='_blank'>" + val + "</a>&nbsp;";
        };
    },
    fileSize: function () {
        return function (val, m, record) {
            try {
                if (Ext.isEmpty(val) || val == "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }

                if (val >= 1024 * 1024) {
                    return (val / 1024.0 / 1024.0).toFixed(2) + "M";
                }

                if (val >= 1024) {
                    return (val / 1024.0).toFixed(2) + "KB";
                }
                return val + "B";
            } catch (e) {
                return "<span style='color: #ccc;'>无</span>";
            }
        };
    }
};
renders["enum"] = function (enumName) {
    return function (val) {
        try {
            if (Ext.isEmpty(val)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            let enumText = getEnumText(enumName, val);
            if (Ext.isEmpty(enumText)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            return enumText;
        } catch (e) {
            return "<span style='color: #ccc;'>无</span>";
        }
    }
};
