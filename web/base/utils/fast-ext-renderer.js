const renders = {
    normal: function (append, position) {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            if (Ext.isEmpty(val)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            if (!append) {
                append = "";
            }
            if (!Ext.isEmpty(position)) {
                if (position === "left" || position === "l" || toBool(position, false)) {
                    val = append + val;
                }
                if (position === "right" || position === "r") {
                    val = val + append;
                }
            }else{
                val = val + append;
            }
            if (details) {
                return val.replace(new RegExp("\n", 'g'), "<br/>")
                    .replace(new RegExp("\t", 'g'), "&nbsp;&nbsp;&nbsp;&nbsp;")
                    .replace(new RegExp(" ", 'g'), "&nbsp;");
            }
            return val;
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
            if (Ext.isEmpty(val) || val === "null") {
                return "<span style='color: #ccc;'>暂无文件</span>";
            }
            let arrayInfo = val.split("@");
            let url = arrayInfo[0];
            let name = url.substring(url.lastIndexOf("/") + 1);
            if (arrayInfo.length > 1) {
                name = arrayInfo[1];
            }
            let fileClassName = "extFile";
            if (name.toLowerCase().endWith(".doc")||name.toLowerCase().endWith(".docx")) {
                fileClassName = "extFileWord";
            } else  if (name.toLowerCase().endWith(".xls")||name.toLowerCase().endWith(".xlsx")) {
                fileClassName = "extFileExcel";
            }else if (name.toLowerCase().endWith(".zip") || name.toLowerCase().endWith(".rar")) {
                fileClassName = "extFileZIP";
            }else if (name.toLowerCase().endWith(".apk")) {
                fileClassName = "extFileAPK";
            }
            return "&nbsp;<a href=\"" + system.formatUrlVersion(url) + "\" target='_blank' >" + "<span style='margin-right: 5px;'>" + getSVGIcon(fileClassName) + "</span>" + name + "</a>&nbsp;";
        };
    },
    files: function () {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            try {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
                let data = val;
                if (Ext.isString(val)) {
                    if (!Ext.isEmpty(val)) {
                        try {
                            data = Ext.decode(val);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }

                if (data.length === 0) {
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
                let dataId = $.md5(JSON.stringify(data));
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
                console.error(e);
                return "<span style='color: #ccc;'>暂无文件</span>";
            }
        };
    },
    image: function (height, width) {
        return function (val) {
            try {
                let imageHeight = "16px";
                let imageWidth = "auto";
                if (Ext.isEmpty(val) || val === "null") {
                    return "<img style='object-fit: cover; border:1px solid #cccccc;height:" + imageHeight + ";'" +
                        " src='images/default_img.png'   alt='' />";
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

                let arrayInfo = val.split("@");
                let url = arrayInfo[0];
                let dataId = $.md5(url);
                window[dataId] = "<img  alt=''" +
                    " style='object-fit: cover;border:1px solid #cccccc;width: 100px; min-height:16px;  ' " +
                    " width='100' " +
                    " class='lazyload'" +
                    " onerror=\"javascript:this.src = 'images/default_img.png';\"" +
                    " src='" + url + "' />";
                return "<img class='lazyload' " +
                    " alt=''" +
                    " details-id='" + dataId + "' " +
                    " style='object-fit: cover;border:1px solid #cccccc;height:" + imageHeight + ";width: " + imageWidth + "; min-width:16px; min-height:16px; '" +
                    " width='" + imageWidth.replace("px", "") + "'" +
                    " height='" + imageHeight.replace("px", "") + "' " +
                    " onclick=\"showImage(this,'" + system.formatUrlVersion(url) + "')\"  " +
                    " onerror=\"javascript:this.src = 'images/default_img.png';\"" +
                    " src='" + system.formatUrlVersion(url) + "' " +
                    " />";
            } catch (e) {
                console.error(e);
                return "<span style='color: #ccc;'>暂无图片</span>";
            }
        };
    },
    images: function () {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            try {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>暂无图片</span>";
                }
                let data = val;
                if (Ext.isString(val)) {
                    if (!Ext.isEmpty(val)) {
                        try {
                            data = Ext.decode(val);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
                if (data.length === 0) {
                    return "<span style='color: #ccc;'>暂无图片</span>";
                }
                let dataId = $.md5(JSON.stringify(data));
                let detailsList = "";
                for (let i = 0; i < data.length; i++) {
                    detailsList += renders.image(24)(data[i]) + "&nbsp;&nbsp;";
                }
                if (details) {
                    return detailsList;
                }
                let html = "<span details-id='" + dataId + "' style='color: #4279fa;'>共有" + data.length + "张图片！</span>";
                window[dataId] = detailsList;
                return html;
            } catch (e) {
                console.error(e);
                return "<span style='color: #ccc;'>暂无图片</span>";
            }
        };
    },
    mp4: function () {
        return function (val, m, record) {
            if (Ext.isEmpty(val) || val === "null") {
                return "<span style='color: #ccc;'>暂无文件</span>";
            }
            return "&nbsp;<a href=\"javascript:showVideo(this,'" + system.formatUrlVersion(val) + "');\" >" + "<span style='margin-right: 5px;'>"+getSVGIcon("extFileMP4")+"</span>" +val.substring(val.lastIndexOf("/") + 1) + "</a>&nbsp;";
        };
    },
    html: function () {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            if (Ext.isEmpty(val) || val === "null") {
                return "<span style='color: #ccc;'>无</span>";
            }
            let key = $.md5(val);
            MemoryCache[key] = val;
            let functionStr = "showEditorHtml(this,'查看内容',MemoryCache['" + key + "'])";
            return "&nbsp;<a href=\"javascript:" + functionStr + ";\">查看内容</a>&nbsp;";
        };
    },
    html2: function () {
        return function (val, m, record, rowIndex, colIndex, store, view, details) {
            if (Ext.isEmpty(val) || val === "null") {
                return "<span style='color: #ccc;'>无</span>";
            }
            if (details) {
                return val;
            }
            val = val
                .replace(/[&\|\\\*^%$'"#@\-]/g, "")
                .replace(new RegExp("\n", 'g'), "")
                .replace(new RegExp("\t", 'g'), "")
                .replace(new RegExp(" ", 'g'), "")
                .replace(/<\/?.+?>/g, "");
            return val;
        };
    },
    link: function (name, entityCode, entityId) {
        return function (val, m, record) {
            try {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }
                let keyValue = record.get(name);
                let functionStr = "new " + entityCode + "().showDetails(null, {'t." + entityId + "':'" + keyValue + "'})";
                return "&nbsp;<a href=\"javascript:" + functionStr + ";\" >" + val + "</a>&nbsp;";
            } catch (e) {
                console.error(e);
                return "<span style='color: #ccc;'>无</span>";
            }
        };
    },
    target: function (targetId, targetType, targetFunction) {
        return function (val, m, record) {
            try {
                if (Ext.isEmpty(val) || val === "null") {
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
                console.error(e);
                return "<span style='color: #ccc;'>无</span>";
            }
        };
    },
    map: function (lngName, latName) {
        return function (val, m, record) {
            try {
                if (Ext.isEmpty(val) || val === "null") {
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
            if (Ext.isEmpty(val) || val === "null") {
                return "<span style='color: #ccc;'>无</span>";
            }
            return "&nbsp;<a href='" + val + "' target='_blank'>" + val + "</a>&nbsp;";
        };
    },
    fileSize: function () {
        return function (val, m, record) {
            try {
                if (Ext.isEmpty(val) || val === "null") {
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
                console.error(e);
                return "<span style='color: #ccc;'>无</span>";
            }
        };
    },
    duration:function(){
        return function (val, m, record) {
            try {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }
                let seconds = parseInt(val) / 1000;
                let hour = (seconds / (60 * 60)).toFixed(0);
                let minute = ((seconds / 60) % 60).toFixed(0);
                let second = (seconds % 60).toFixed(0);
                if (hour > 0) {
                    return hour + "时" + minute + "分" + second + "秒";
                }
                if (minute > 0) {
                    return minute + "分" + second + "秒";
                }
                return second + "秒";
            } catch (e) {
                console.error(e);
                return "<span style='color: #ccc;'>无</span>";
            }
        };
    }
};
renders["enum"] = function (enumName, enumValue) {
    return function (val) {
        try {
            if (Ext.isEmpty(val)) {
                return "<span style='color: #ccc;'>无</span>";
            }
            let enumRecord = getEnumRecord(enumName, val, enumValue);
            if (!enumRecord) {
                return "<span style='color: #ccc;'>" + val + "</span>";
            }
            let enumText = enumRecord.get("text");
            let enumColor = enumRecord.get("color");
            if (Ext.isEmpty(enumText)) {
                return "<span style='color: #ccc;'>" + val + "</span>";
            }
            let color = toColor(enumColor, "#000000");
            return "<span style='color: " + color + ";'>" + enumText + "</span>";
        } catch (e) {
            return "<span style='color: #ccc;'>" + val + "</span>";
        }
    }
};
