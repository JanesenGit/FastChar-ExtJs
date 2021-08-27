namespace FastExt {

    /**
     * 数据渲染器，支持column或符合格式的数据
     */
    export class Renders {

        /**
         * 常规的渲染
         * @param append 追加的单位或其他字符
         * @param position 字符追加的位置
         * @see FastEnum.AppendPosition
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static normal(append?: string, position?: string): any {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (Ext.isEmpty(val)) {
                    return "<span style='color: #ccc;'>无</span>";
                }
                if (!append) {
                    append = "";
                }
                if (!Ext.isEmpty(position)) {
                    if (position === "left" || position === "l" || FastExt.Base.toBool(position, false)) {
                        val = append + val;
                    }
                    if (position === "right" || position === "r") {
                        val = val + append;
                    }
                } else {
                    val = val + append;
                }
                if (details) {
                    return val.replace(new RegExp("\n", 'g'), "<br/>")
                        .replace(new RegExp("\t", 'g'), "&nbsp;&nbsp;&nbsp;&nbsp;")
                        .replace(new RegExp(" ", 'g'), "&nbsp;")
                        .replace(/<\/?.+?>/g, "");
                }
                return val;
            };
        }

        /**
         * 价格或金钱格式渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static money(): any {
            return function (val) {
                if (Ext.isEmpty(val)) {
                    return "<span style='color: #ccc;'>无</span>";
                }
                return "￥" + val;
            };
        }

        /**
         * 纯文本渲染器
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static text(): any {
            return function (val) {
                if (Ext.isEmpty(val)) {
                    return "<span style='color: #ccc;'>无</span>";
                }
                val = val.replace(/<\/?.+?>/g, "");
                return "<span style='white-space: pre;'>" + val + "</span>";
            };
        }

        /**
         * 图片数据渲染
         * @param height 设置渲染图片的高度
         * @param width 设置渲染图片的宽度
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static image(height?: number, width?: number): any {
            return function (val) {
                try {
                    let imageHeight = "14px";
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
                    let dataId: string = $.md5(url);
                    window[dataId] = "<img  alt=''" +
                        " style='object-fit: cover;border:1px solid #cccccc;width: 100px; min-height:14px;  ' " +
                        " width='100' " +
                        " class='lazyload'" +
                        " onerror=\"javascript:this.src = 'images/default_img.png';\"" +
                        " src='" + url + "' />";

                    return "<img class='lazyload' " +
                        " alt=''" +
                        " details-id='" + dataId + "' " +
                        " style='object-fit: cover;border:1px solid #cccccc;height:" + imageHeight + ";width: " + imageWidth + "; min-width:14px; min-height:14px; '" +
                        " width='" + imageWidth.replace("px", "") + "'" +
                        " height='" + imageHeight.replace("px", "") + "' " +
                        " onclick=\"FastExt.Dialog.showImage(this,'" + url + "')\"  " +
                        " onerror=\"javascript:this.src = 'images/default_img.png';\"" +
                        " src='" + url + "' " +
                        " />";
                    // return "<img height='10px' width='10px' src='" + url + "'/>";
                } catch (e) {
                    console.error(e);
                    return "<span style='color: #ccc;'>暂无图片</span>";
                }
            };
        }

        /**
         * MP4视频渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static mp4(): any {
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
                return "&nbsp;<a href=\"javascript:showVideo(this,'" + FastExt.System.formatUrlVersion(url) + "');\" >" + "<span style='margin-right: 5px;'>" + FastExt.Base.getSVGIcon("extFileMP4") + "</span>" + name + "</a>&nbsp;";
            };
        }

        /**
         * MP3渲染器
         */
        static mp3(): any {
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
                return "&nbsp;<a href=\"javascript:FastExt.Dialog.showMusic(this,'" + FastExt.System.formatUrlVersion(url) + "');\" >" + "<span style='margin-right: 5px;'>" + FastExt.Base.getSVGIcon("extFileMP3") + "</span>" + name + "</a>&nbsp;";
            };
        }

        /**
         * word、excel、pdf等office办公软件渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static office(): any {
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
                let fileClassName = FastExt.Base.getSVGClassName(name);
                let viewerUrl = "https://view.officeapps.live.com/op/view.aspx?src=" + FastExt.System.formatUrlVersion(url);
                let viewStr = "&nbsp;<a href=\"" + viewerUrl + "\" target='_blank' >在线预览</a>&nbsp;";
                return viewStr + "&nbsp;<a href=\"" + FastExt.System.formatUrlVersion(url) + "\" target='_blank' >" + "<span style='margin-right: 5px;'>" + FastExt.Base.getSVGIcon(fileClassName) + "</span>" + name + "</a>&nbsp;";
            };
        }


        /**
         * 文件数据渲染
         * @param fileNameAttr 文件名称的属性，只对record有效
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static file(fileNameAttr?): any {
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
                if (!Ext.isEmpty(fileNameAttr)) {
                    name = record.get(fileNameAttr);
                }
                if (FastExt.FileModule.image().reg.test(name)) {
                    return FastExt.Renders.image()(val);
                }
                if (FastExt.FileModule.mp4().reg.test(name)) {
                    return FastExt.Renders.mp4()(val);
                }
                if (FastExt.FileModule.pdf().reg.test(name) || FastExt.FileModule.word().reg.test(name) || FastExt.FileModule.excel().reg.test(name) || FastExt.FileModule.ppt().reg.test(name)) {
                    return FastExt.Renders.office()(val);
                }
                let fileClassName = FastExt.Base.getSVGClassName(name);
                return "&nbsp;<a href=\"" + FastExt.System.formatUrlVersion(url) + "\" target='_blank' >" + "<span style='margin-right: 5px;'>" + FastExt.Base.getSVGIcon(fileClassName) + "</span>" + name + "</a>&nbsp;";
            };
        }

        /**
         * 多文件渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static files(): any {
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
                        detailsList += "<div style='margin: 5px;'>" + FastExt.Renders.file()(data[i]) + "</div>";
                    }
                    if (details) {
                        return detailsList;
                    }
                    FastExt.Cache.memory[dataId] = detailsList;
                    let functionStr = "FastExt.Dialog.showAlert('查看文件',MemoryCache['" + dataId + "'],null,false)";
                    let html = "&nbsp;<a href=\"javascript:" + functionStr + ";\">共有" + data.length + "个文件！</a>&nbsp;";
                    let detailsId: string = $.md5(html);
                    window[detailsId] = detailsList;
                    return html;
                } catch (e) {
                    console.error(e);
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
            };
        }

        /**
         * 多图片渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static images(): any {
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
                    let dataId: string = $.md5(JSON.stringify(data));
                    let detailsList = "";
                    let urlArray = [];
                    for (let i = 0; i < data.length; i++) {
                        detailsList += FastExt.Renders.image(24)(data[i]) + "&nbsp;&nbsp;";
                        urlArray.push({url: data[i]});
                    }
                    if (details) {
                        return detailsList;
                    }
                    FastExt.Cache.memory[dataId] = urlArray;
                    let functionStr = "FastExt.Dialog.showImage(null,MemoryCache['" + dataId + "'])";
                    let html = "<a href=\"javascript:" + functionStr + ";\" details-id='" + dataId + "' style='color: #4279fa;'>共有" + data.length + "张图片！</a>";
                    window[dataId] = detailsList;
                    return html;
                } catch (e) {
                    console.error(e);
                    return "<span style='color: #ccc;'>暂无图片</span>";
                }
            };
        }


        /**
         * 网页内容渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static html(): any {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }
                let key = $.md5(val);
                FastExt.Cache.memory[key] = val;
                let functionStr = "FastExt.Dialog.showEditorHtml(this,'查看内容',MemoryCache['" + key + "'])";
                return "&nbsp;<a href=\"javascript:" + functionStr + ";\">查看内容</a>&nbsp;";
            };
        }


        /**
         * 网页内容渲染为存文本格式
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static html2(): any {
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
        }

        /**
         * JSON内容渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static json(): any {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }
                let key = $.md5(val);
                FastExt.Cache.memory[key] = val;
                let functionStr = "FastExt.Dialog.showJson(null,'查看JSON内容',MemoryCache['" + key + "'])";
                return "&nbsp;<a href=\"javascript:" + functionStr + ";\">" + val + "</a>&nbsp;";
            };
        }

        /**
         * JSON内容渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static json2(): any {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }
                let key = $.md5(val);
                FastExt.Cache.memory[key] = val;
                let functionStr = "FastExt.Dialog.showJson(null,'查看JSON内容',MemoryCache['" + key + "'])";
                return "&nbsp;<a href=\"javascript:" + functionStr + ";\">查看JSON内容</a>&nbsp;";
            };
        }

        /**
         * 渲染关联实体格式
         * @param name 关联的属性
         * @param entityCode 实体编号
         * @param entityId 实体ID属性
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static link(name, entityCode, entityId): any {
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
        }

        /**
         * 渲染target格式的数据
         * @param targetId 目标ID
         * @param targetType 目标类型
         * @param targetFunction 获取目标实体的函数。默认为：getTargetEntity
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static target(targetId, targetType, targetFunction?: string): any {
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
        }


        /**
         * 渲染地图格式的数据
         * @param lngName 经度属性名
         * @param latName 纬度属性名
         * @param titleName 链接的标题属性名
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static map(lngName, latName, titleName): any {
            return function (val, m, record) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    let lng = record.get(lngName);
                    let lat = record.get(latName);
                    let mapTitle = record.get(titleName);
                    if (lng && lat) {
                        let lnglat = lng + "," + lat;
                        let functionStr = "FastExt.Map.showAddressInMap(null,'" + lnglat + "','','" + val + "')";
                        if (mapTitle) {
                            functionStr = "FastExt.Map.showAddressInMap(null,'" + lnglat + "','" + mapTitle + "','" + val + "')";
                        }
                        return "&nbsp;<a href=\"javascript:" + functionStr + ";\" >" + val + "</a>&nbsp;";
                    }
                    return val;
                } catch (e) {
                    return "<span style='color: #ccc;'>无</span>";
                }
            };
        }

        /**
         * 渲染图层格式的数据
         * @param imgUrlName 图层图片的地址 数据属性名
         * @param southWestLngLatName 西南角度经纬度（左下角）
         * @param northEastLngLatName 东北角度经纬度 （右上角）
         * @param rotateName 图片旋转的角度
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static mapImgLayer(imgUrlName, southWestLngLatName, northEastLngLatName, rotateName): any {
            return function (val, m, record) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    let imgUrl = record.get(imgUrlName);
                    let southWestLngLat = record.get(southWestLngLatName);
                    let northEastLngLat = record.get(northEastLngLatName);
                    let rotate = record.get(rotateName);
                    if (rotate) {
                        imgUrl = FastExt.Image.rotateOSSImgUrl(imgUrl, rotate);
                    }
                    if (imgUrl && southWestLngLat && northEastLngLat) {
                        let functionStr = " FastExt.Map.showImgLayerInMap(null,'" + imgUrl + "','" + southWestLngLat + "','" + northEastLngLat + "')";
                        return "&nbsp;<a href=\"javascript:" + functionStr + ";\" >" + val + "</a>&nbsp;";
                    }
                    return val;
                } catch (e) {
                    return "<span style='color: #ccc;'>无</span>";
                }
            };
        }

        /**
         * 将数据以密码格式渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static password(): any {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (Ext.isEmpty(val)) {
                    return "<span style='color: #ccc;'>无</span>";
                }
                return "<span>******</span>";
            };
        }

        /**
         * 将数据以超链接格式渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static href(): any {
            return function (val, m, record) {
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>无</span>";
                }
                return "&nbsp;<a href='" + val + "' target='_blank'>" + val + "</a>&nbsp;";
            };
        }

        /**
         * 将数据格式为单位大小后渲染，例如10kb
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static fileSize(): any {
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
        }


        /**
         * 将毫秒格式的数据格式渲染，例如：1秒或1分20秒
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static duration(): any {
            return function (val, m, record) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    let seconds = parseInt(val) / 1000;
                    let hour = parseInt((seconds / (60 * 60)).toString());
                    let minute = parseInt(((seconds / 60) % 60).toString());
                    let second = parseInt((seconds % 60).toString());
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

        /**
         * 将日期数据进行格式化
         * @param format 日期格式 默认：Y-m-d H:i:s
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static dateFormat(format?: string): any {
            return function (val, m, record) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    if (Ext.isEmpty(format)) {
                        format = "Y-m-d H:i:s";
                    }
                    let guessDateFormat = FastExt.Base.guessDateFormat(val);
                    return Ext.Date.format(Ext.Date.parse(val, guessDateFormat), format);
                } catch (e) {
                    console.error(e);
                    return val;
                }
            };
        }

        /**
         * 格式化时间戳
         * @param format 日期格式 默认：Y-m-d H:i:s
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static timestamp(format?: string) {
            return function (val, m, record) {
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    if (Ext.isEmpty(format)) {
                        format = "Y-m-d H:i:s";
                    }
                    return Ext.Date.format(new Date(parseInt(val)), format);
                } catch (e) {
                    console.error(e);
                    return val;
                }
            };
        }

        /**
         * 渲染枚举数据
         * @param enumName 枚举名称
         * @param enumValue 枚举值的属性名
         * @param enumText 枚举值的显示文本属性
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static enum(enumName, enumValue, enumText): any {
            return function (val) {
                try {
                    if (Ext.isEmpty(val)) {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    if (Ext.isEmpty(enumText)) {
                        enumText = "text";
                    }
                    let enumRecord = FastExt.Store.getEnumRecord(enumName, val, enumValue);
                    if (!enumRecord) {
                        return "<span style='color: #ccc;'>" + val + "</span>";
                    }
                    let text = enumRecord.get(enumText);
                    let enumColor = enumRecord.get("color");
                    if (Ext.isEmpty(text)) {
                        return "<span style='color: #ccc;'>" + val + "</span>";
                    }
                    let color = FastExt.Color.toColor(enumColor, "#000000");
                    return "<span style='color: " + color + ";'>" + text + "</span>";
                } catch (e) {
                    return "<span style='color: #ccc;'>" + val + "</span>";
                }
            }
        }

        /**
         * 颜色值渲染器
         */
        static color(): any {
            return function (val) {
                try {
                    if (Ext.isEmpty(val)) {
                        return "<span style='color: #ccc;'>无</span>";
                    }
                    let color = FastExt.Color.toColor(val);
                    return "<!--suppress ALL --><img style='background: " + color + ";width: 30px;height: 14px;'/>";
                } catch (e) {
                    return "<span style='color: #ccc;'>" + val + "</span>";
                }
            }
        }
    }
}