namespace FastExt {

    /**
     * 数据渲染器，支持column或符合格式的数据
     */
    export class Renders {

        public static getRenderFunStr(column) {
            return FastExt.Cache.getCache(column.getRenderCacheKey());
        }

        private static getRenderColumn(obj, colIndex): any {
            try {
                if (Ext.isFunction(obj.getHeaderContainer)) {
                    let headerCt = obj.getHeaderContainer();
                    if (headerCt) {
                        return headerCt.getHeaderAtIndex(colIndex);
                    }
                }
            } catch (e) {
                console.error(e);
            }
            return null;
        }

        /**
         * 获取当前列渲染的key
         * @param colIndex
         * @param rowIndex
         * @param store
         * @private
         */
        private static getRenderKey(colIndex, rowIndex, store) {
            let key = $.md5(rowIndex + ":" + colIndex);
            if (!store) {
                store = {
                    getId: function () {
                        return new Date().getTime();
                    },
                };
            }
            let cacheKey = $.md5(key + store.getId());
            if (!store.columnRenderKey) {
                store.columnRenderKey = [];
            }
            store.columnRenderKey.push(cacheKey);
            return $.md5(key + store.getId());
        }

        /**
         * 当点击标签时触发
         */
        static onClickFromDataClick(obj) {
            let functionStr = Ext.util.Base64.decode($(obj).attr("data-click-function"));
            eval(functionStr);
        }

        /**
         * 格式化为单行的文本，包括网页换行和符号换行等
         * @param val
         * @private
         */
        static toSingleLineText(val) {
            if (Ext.isEmpty(val)) {
                return this.toEmptyTip();
            }
            return val.toString()
                .replace(new RegExp("\n", 'g'), "")
                .replace(new RegExp("\t", 'g'), "")
                .replace(/<\/?.+?>/g, "")
                .replaceAll("\n", "")
                .replaceAll("\t", "");
        }

        /**
         * 格式化网页展示的内容
         * @param val
         * @private
         */
        static toHtmlContent(val) {
            if (Ext.isEmpty(val)) {
                return this.toEmptyTip();
            }
            return val.toString()
                .replace(new RegExp("\n", 'g'), "<br/>")
                .replace(new RegExp("\t", 'g'), "&nbsp;&nbsp;&nbsp;&nbsp;")
                .replace(new RegExp(" ", 'g'), "&nbsp;");
        }

        /**
         * 返回空数据提示
         * @private
         */
        static toEmptyTip() {
            return FastExt.Renders.toEmpty("无");
        }

        /**
         * 根据提示内容返回灰色提示
         * @param tipValue
         */
        static toEmpty(tipValue: string) {
            if (Ext.isEmpty(tipValue)) {
                tipValue = "无";
            }
            return "<span style='color: #ccc;'>" + tipValue + "</span>";
        }


        /**
         * 返回点击跳转的样式
         * @param text
         * @param url
         */
        static toLinkUrlText(text: string, url: string) {
            let functionStr = "FastExt.Windows.openUrl('" + url + "','_blank')";
            return FastExt.Renders.toClickText(text, functionStr);
        }

        /**
         * 返回可点击的文本样式
         * @param text 显示的文本
         * @param clickFunctionStr 点击触发的函数字符串
         */
        static toClickText(text: string, clickFunctionStr: string) {
            if (FastExt.Power.config) {
                return text;
            }
            return "<span class=\"fast-grid-click\" data-click-function=\"" + Ext.util.Base64.encode(clickFunctionStr) + "\" onclick=\"FastExt.Renders.onClickFromDataClick(this)\" >" + text + "</span>";
        }

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
                    return FastExt.Renders.toEmptyTip();
                }
                let _append = append;

                if (Ext.isEmpty(_append)) {
                    _append = "";
                }
                if (!Ext.isEmpty(position)) {
                    if (position === "left" || position === "l" || FastExt.Base.toBool(position, false)) {
                        val = _append + val;
                    }
                    if (position === "right" || position === "r") {
                        val = val + _append;
                    }
                } else {
                    val = val + _append;
                }
                if (details) {
                    return FastExt.Renders.toHtmlContent(val);
                }
                return FastExt.Renders.toSingleLineText(val);
            };
        }

        /**
         * 价格或金钱格式渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static money(): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val)) {
                    return FastExt.Renders.toEmptyTip();
                }
                return "￥" + FastExt.Renders.toSingleLineText(val);
            };
        }

        /**
         * 纯文本渲染器
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static text(): any {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val)) {
                    return FastExt.Renders.toEmptyTip();
                }
                if (details) {
                    return FastExt.Renders.toHtmlContent(val)
                }
                return "<span>" + FastExt.Renders.toSingleLineText(val) + "</span>";
            };
        }

        /**
         * 大文本渲染器
         */
        static bigText(): any {
            return function (val, m, record, rowIndex, colIndex, store, view) {
                if (FastExt.Power.config) {
                    return val;
                }

                if (Ext.isEmpty(val) || val === "null") {
                    return FastExt.Renders.toEmptyTip();
                }
                let key = FastExt.Renders.getRenderKey(colIndex, rowIndex, store);
                FastExt.Cache.memory[key] = val;
                let functionStr = "FastExt.Dialog.showText(null,null,'查看内容',MemoryCache['" + key + "'])";
                return "&nbsp;<span onclick=\"" + functionStr + "\" " +
                    " class='fast-grid-action' " +
                    " >" + FastExt.Base.getSVGIcon("extSee") + "&nbsp;查看内容</span>&nbsp;";
            };
        }

        /**
         * 大文本渲染器
         */
        static bigText2(): any {
            return function (val, m, record, rowIndex, colIndex, store, view) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val) || val === "null") {
                    return FastExt.Renders.toEmptyTip();
                }
                let key = FastExt.Renders.getRenderKey(colIndex, rowIndex, store);
                FastExt.Cache.memory[key] = val;
                let functionStr = "FastExt.Dialog.showText(null,null,'查看内容',MemoryCache['" + key + "'])";
                return FastExt.Renders.toClickText(val, functionStr);
            };
        }

        /**
         * 图片数据渲染
         * @param height 设置渲染图片的高度
         * @param width 设置渲染图片的宽度
         * @param justDetails 只应用到详情窗体中
         * @param clickable 是否允许点击图片查看
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static image(height?: number, width?: number, justDetails?: boolean, clickable?: boolean): any {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                try {
                    if (FastExt.Power.config) {
                        return val;
                    }

                    if (Ext.isEmpty(clickable)) {
                        clickable = true;
                    }

                    let key: string = FastExt.Renders.getRenderKey(colIndex, rowIndex, store);

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
                        let checkParam = true;

                        if (justDetails && !details) {
                            checkParam = false;
                        }

                        if (checkParam) {
                            if (height && Ext.isNumber(height) && height > 0) {
                                imageHeight = height + "px";
                            }
                            if (width && Ext.isNumber(width) && width > 0) {
                                imageWidth = width + "px";
                            }
                        }

                    } catch (e) {
                    }

                    let arrayInfo = val.split("@");
                    let url = arrayInfo[0];
                    let name = url.substring(url.lastIndexOf("/") + 1);
                    if (FastExt.FileModule.json().match(name)) {
                        return "&nbsp;<span onclick=\"FastExt.Dialog.showLottie(this,'" + FastExt.Base.formatUrlVersion(url) + "')\" " +
                            " class='fast-grid-action' " +
                            " >" + FastExt.Base.getSVGIcon("extSee") + "&nbsp;查看动效</span>&nbsp;";
                    }

                    window[key] = "<img  alt=''" +
                        " style='object-fit: cover;border:1px solid #cccccc;width: 100px; min-height:14px;  ' " +
                        " width='100' " +
                        " class='lazyload'" +
                        " onerror=\"this.src = 'images/default_img.png';\"" +
                        " src='" + url + "' />";

                    FastExt.Cache.memory[key] = url;

                    let clickShowFunStr = "FastExt.Dialog.showImage(this,'" + key + "',event)";

                    return "<img class='lazyload' " +
                        " alt=''" +
                        " data-details-id='" + key + "' " +
                        " data-container-id='" + (view ? view.getId() : "none") + "' " +
                        " style='object-fit: cover;border:1px solid #cccccc;height:" + imageHeight + ";width: " + imageWidth + "; min-width:14px; min-height:14px; '" +
                        " width='" + imageWidth.replace("px", "") + "'" +
                        " height='" + imageHeight.replace("px", "") + "' " +
                        (clickable ? (" onclick=\"" + clickShowFunStr + "\"") : "") +
                        " onerror=\"this.src = 'images/default_img.png';\"" +
                        " src='" + FastExt.Image.smallOSSImgUrl(url, imageHeight) + "' " +
                        " />";
                } catch (e) {
                    console.error(e);
                    return "<span style='color: #ccc;'>暂无图片</span>";
                }
            };
        }

        /**
         * 图片渲染2
         */
        static image2() {
            return function (val, m, record, rowIndex, colIndex, store, view) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val) || val === "null") {
                    return FastExt.Renders.toEmptyTip();
                }
                let key = FastExt.Renders.getRenderKey(colIndex, rowIndex, store);
                FastExt.Cache.memory[key] = val;
                let functionStr = "FastExt.Dialog.showImage(this,'" + key + "')";
                return FastExt.Renders.toClickText("查看图片", functionStr);
            };
        }




        /**
         * MP4视频渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static mp4(nickName?: boolean,download?:boolean): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
                let arrayInfo = val.split("@");
                let url = arrayInfo[0];
                let name = url.substring(url.lastIndexOf("/") + 1);
                if (arrayInfo.length > 1) {
                    name = arrayInfo[1];
                }
                if (nickName) {
                    name = "播放视频";
                }
                let functionStr = "FastExt.Dialog.showVideo(this,'" + FastExt.Base.formatUrlVersion(url) + "');";
                let renderHtml = FastExt.Renders.toClickText("<span style='margin-right: 5px;'>" + FastExt.Base.getSVGIcon("extFileMP4") + "</span>" + name, functionStr);
                if (download) {
                    let functionStrDownload = "FastExt.Base.download('" + FastExt.Base.formatUrlVersion(url) + "')";
                    renderHtml += ("&nbsp;&nbsp;" + FastExt.Renders.toClickText("<span style='margin-right: 5px;'>" + FastExt.Base.getSVGIcon("extDownload") + "</span>下载", functionStrDownload));
                }
                return renderHtml;
            };
        }


        /**
         * MP3渲染器
         */
        static mp3(): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
                let arrayInfo = val.split("@");
                let url = arrayInfo[0];
                let name = url.substring(url.lastIndexOf("/") + 1);
                if (arrayInfo.length > 1) {
                    name = arrayInfo[1];
                }
                let functionStr = "FastExt.Dialog.showMusic(this,'" + FastExt.Base.formatUrlVersion(url) + "');";

                return FastExt.Renders.toClickText("<span style='margin-right: 5px;'>" + FastExt.Base.getSVGIcon("extFileMP3") + "</span>" + name, functionStr);
            };
        }

        /**
         * word、excel、pdf等office办公软件渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static office(): any {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
                let arrayInfo = val.split("@");
                let url = arrayInfo[0];
                let realUrl = url.split("?")[0];
                let name = realUrl.substring(realUrl.lastIndexOf("/") + 1);
                if (arrayInfo.length > 1) {
                    name = arrayInfo[1];
                }

                let fileClassName = FastExt.Base.getSVGClassName(realUrl, name);
                let functionStr = "FastExt.File.officeViewer('" + FastExt.Base.formatUrlVersion(val) + "')";

                let viewStr = "&nbsp;<span onclick=\"" + functionStr + "\" " +
                    " class='fast-grid-action' " +
                    " >" + FastExt.Base.getSVGIcon("extEye") + "&nbsp;预览</span>&nbsp;";

                let functionStr2 = " FastExt.Base.openUrl('" + FastExt.Base.formatUrlVersion(url) + "','_blank')";

                return viewStr + FastExt.Renders.toClickText("<span style='margin-right: 5px;'>" + FastExt.Base.getSVGIcon(fileClassName) + "</span>" + name, functionStr2);
            };
        }


        /**
         * 文件数据渲染
         * @param fileNameAttr 文件名称的属性，只对record有效
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static file(fileNameAttr?): any {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val) || val === "null") {
                    return "<span style='color: #ccc;'>暂无文件</span>";
                }
                let arrayInfo = val.split("@");
                let url = arrayInfo[0];
                let realUrl = url.split("?")[0];
                let name = realUrl.substring(realUrl.lastIndexOf("/") + 1);
                if (arrayInfo.length > 1) {
                    name = arrayInfo[1];
                }
                if (!Ext.isEmpty(fileNameAttr)) {
                    name = record.get(fileNameAttr);
                }
                if (FastExt.FileModule.image().match(realUrl, name)) {
                    return FastExt.Renders.image()(val, m, record, rowIndex, colIndex, store, view, details);
                }
                if (FastExt.FileModule.mp4().match(realUrl, name)) {
                    return FastExt.Renders.mp4()(val, m, record, rowIndex, colIndex, store, view, details);
                }
                if (FastExt.FileModule.pdf().match(realUrl, name)
                    || FastExt.FileModule.word().match(realUrl, name)
                    || FastExt.FileModule.excel().match(realUrl, name)
                    || FastExt.FileModule.ppt().match(realUrl, name)) {
                    return FastExt.Renders.office()(val, m, record, rowIndex, colIndex, store, view, details);
                }
                let fileClassName = FastExt.Base.getSVGClassName(realUrl, name);
                let functionStr = " FastExt.Base.openUrl('" + FastExt.Base.formatUrlVersion(url) + "','_blank')";

                return FastExt.Renders.toClickText("<span style='margin-right: 5px;'>" + FastExt.Base.getSVGIcon(fileClassName) + "</span>" + name, functionStr);
            };
        }

        /**
         * 多文件渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static files(): any {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (FastExt.Power.config) {
                    return val;
                }
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
                    let dataId = FastExt.Renders.getRenderKey(colIndex, rowIndex, store);
                    let detailsList = "";
                    let showFileName = false, showFileLength = false;
                    for (let i = 0; i < data.length; i++) {
                        let urlVal = data[i];
                        if (!showFileName) {
                            let urlSplit = urlVal.split("@");
                            showFileName = urlSplit.length > 1;
                            showFileLength = urlSplit.length > 2;
                        }
                        detailsList += "<div style='margin: 5px;display: inline-block;'>" + FastExt.Renders.file()(urlVal, m, record, rowIndex, i, store, view, details) + "</div>";
                    }
                    if (details) {
                        return detailsList;
                    }
                    FastExt.Cache.memory[dataId] = "<div style='overflow: scroll;max-height: 300px;'>" + detailsList + "</div>";
                    FastExt.Cache.memory[dataId + "Val"] = val;

                    let functionStr = "FastExt.File.showFiles(this,null,[FastExt.FileModule.file()],MemoryCache['" + dataId + "Val'],'查看附件',true," + showFileName + "," + showFileLength + ")";

                    (<any>window)[dataId] = detailsList;

                    return "&nbsp;<span onclick=\"" + functionStr + "\" " +
                        "  data-details-id='" + dataId + "' class='fast-grid-action' " +
                        " >" + FastExt.Base.getSVGIcon("extFolder") + "&nbsp;共有" + data.length + "个文件</span>&nbsp;";
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
                    if (FastExt.Power.config) {
                        return val;
                    }
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
                    let dataId: string = FastExt.Renders.getRenderKey(colIndex, rowIndex, store);
                    let detailsList = "";
                    let urlArray = [];
                    for (let i = 0; i < data.length; i++) {
                        detailsList += FastExt.Renders.image(24)(data[i], m, record, rowIndex, i, store, view, details) + "&nbsp;&nbsp;";
                        urlArray.push({url: data[i]});
                    }
                    if (details) {
                        return detailsList;
                    }
                    FastExt.Cache.memory[dataId] = urlArray;
                    let functionStr = "FastExt.Dialog.showImage(null,MemoryCache['" + dataId + "'])";
                    window[dataId] = detailsList;
                    return "&nbsp;<span onclick=\"" + functionStr + "\" " +
                        "  data-details-id='" + dataId + "' class='fast-grid-action' " +
                        " >" + FastExt.Base.getSVGIcon("extImage") + "&nbsp;共有" + data.length + "张图片</span>&nbsp;";
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
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val) || val === "null") {
                    return FastExt.Renders.toEmptyTip();
                }
                let key = FastExt.Renders.getRenderKey(colIndex, rowIndex, store);
                FastExt.Cache.memory[key] = val;
                let functionStr = "FastExt.Dialog.showEditorHtml(this,'查看内容',MemoryCache['" + key + "'])";

                return "&nbsp;<span onclick=\"" + functionStr + "\" " +
                    " class='fast-grid-action' " +
                    " data-details-id='" + key + "'" +
                    " >" + FastExt.Base.getSVGIcon("extSee") + "&nbsp;查看内容</>&nbsp;";
            };
        }

        /**
         * 网页内容渲染为存文本格式
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static html2(): any {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val) || val === "null") {
                    return FastExt.Renders.toEmptyTip();
                }
                if (details) {
                    return val;
                }
                return FastExt.Renders.toSingleLineText(val);
            };
        }

        /**
         * JSON内容渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static json(): any {
            return function (val, m, record, rowIndex, colIndex, store, view) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val) || val === "null") {
                    return FastExt.Renders.toEmptyTip();
                }
                let key = FastExt.Renders.getRenderKey(colIndex, rowIndex, store);

                FastExt.Cache.memory[key] = val;
                let functionStr = "FastExt.Dialog.showJson(this,'查看JSON内容',MemoryCache['" + key + "'])";

                return FastExt.Renders.toClickText(FastExt.Renders.toSingleLineText(val), functionStr);
            };
        }

        /**
         * JSON内容渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static json2(): any {
            return function (val, m, record, rowIndex, colIndex, store, view) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val) || val === "null") {
                    return FastExt.Renders.toEmptyTip();
                }
                let key = FastExt.Renders.getRenderKey(colIndex, rowIndex, store);
                FastExt.Cache.memory[key] = val;
                let functionStr = "FastExt.Dialog.showJson(this,'查看JSON内容',MemoryCache['" + key + "'])";
                return FastExt.Renders.toClickText("查看JSON内容", functionStr);
            };
        }

        /**
         * 渲染关联实体格式
         * @param name 关联的属性,多个属性使用@符号分割
         * @param entityCode 实体编号
         * @param entityId 实体ID属性,多个属性使用@符号分割
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static link(name: string, entityCode: string, entityId: string): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {

                    let nameArray = name.split("@");
                    let entityIdArray = entityId.split("@");
                    let whereArray = [];
                    let keyValues = [];

                    for (let i = 0; i < nameArray.length; i++) {
                        let nameChild = nameArray[i];
                        let entityIdChild = entityIdArray[i];
                        if (Ext.isEmpty(entityIdChild)) {
                            entityIdChild = nameChild;
                        }
                        let keyValue = record.get(nameChild);
                        if (!Ext.isEmpty(keyValue)) {
                            whereArray.push("'t." + entityIdChild + "':'" + keyValue + "'");
                            keyValues.push(keyValue);
                        }
                    }

                    if (Ext.isEmpty(val) || val === "null") {
                        return FastExt.Renders.toEmpty(keyValues.join(","));
                    }


                    let functionStr = "new " + entityCode + "().showDetails(null, {" + whereArray.join(",") + "})";
                    return FastExt.Renders.toClickText(FastExt.Renders.toSingleLineText(val), functionStr);
                } catch (e) {
                    console.error(e);
                    return FastExt.Renders.toEmptyTip();
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
        static target(targetId: string, targetType: string, targetFunction?: string): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    let targetTypeValue = record.get(targetType);
                    let targetIdValue = record.get(targetId);
                    let _targetFunction = targetFunction;

                    if (Ext.isEmpty(val) || val === "null") {
                        return FastExt.Renders.toEmpty(targetIdValue);
                    }

                    if (Ext.isEmpty(_targetFunction)) {
                        _targetFunction = "getTargetEntity";
                    }
                    if (!Ext.isFunction(window[_targetFunction])) {
                        return val;
                    }
                    let targetEntity = window[_targetFunction](targetTypeValue, targetType);
                    if (targetEntity) {
                        let functionStr = "new " + targetEntity.entityCode + "().showDetails(null, {'t." + targetEntity.entityId + "':'" + targetIdValue + "'})";
                        return FastExt.Renders.toClickText(FastExt.Renders.toSingleLineText(val), functionStr);
                    }
                    return val;
                } catch (e) {
                    console.error(e);
                    return FastExt.Renders.toEmptyTip();
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
        static map(lngName: string, latName: string, titleName: string): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return FastExt.Renders.toEmptyTip();
                    }
                    let lng = record.get(lngName);
                    let lat = record.get(latName);
                    let mapTitle = record.get(titleName);
                    if (lng && lat) {
                        let lnglat = lng + "," + lat;
                        let functionStr = "FastExt.AMapDialog.plainShow(null,'" + lnglat + "','','" + val + "')";
                        if (mapTitle) {
                            functionStr = "FastExt.AMapDialog.plainShow(null,'" + lnglat + "','" + mapTitle + "','" + val + "')";
                        }
                        return FastExt.Renders.toClickText(val, functionStr);
                    }
                    return val;
                } catch (e) {
                    return FastExt.Renders.toEmptyTip();
                }
            };
        }

        /**
         * 渲染图层格式的数据
         * @param imgUrlName 图层图片的地址 数据属性名
         * @param southWestLngLatName 西南角度经纬度（左下角）
         * @param northEastLngLatName 东北角度经纬度 （右上角）
         * @param rotateName 图片旋转的角度
         * @param zIndexName 图层顺序
         * @param minZoomName 最小显示级别
         * @param maxZoomName 最大显示级别
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static mapImgLayer(imgUrlName: string, southWestLngLatName: string, northEastLngLatName: string, rotateName: string, zIndexName: string, minZoomName: string, maxZoomName: string): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return FastExt.Renders.toEmptyTip();
                    }
                    let imgUrl = record.get(imgUrlName);
                    let southWestLngLat = record.get(southWestLngLatName);
                    let northEastLngLat = record.get(northEastLngLatName);
                    let rotate = record.get(rotateName);
                    if (rotate) {
                        imgUrl = FastExt.Image.rotateOSSImgUrl(imgUrl, rotate);
                    }
                    let zIndex = record.get(zIndexName);
                    if (Ext.isEmpty(zIndex)) {
                        zIndex = 6;
                    }
                    let minZoom = record.get(minZoomName);
                    let maxZoom = record.get(maxZoomName);
                    if (Ext.isEmpty(minZoom)) {
                        minZoom = 1;
                    }
                    if (Ext.isEmpty(maxZoom)) {
                        maxZoom = 20;
                    }

                    if (imgUrl && southWestLngLat && northEastLngLat) {
                        let functionStr = " FastExt.Map.showImgLayerInMap(null,'" + imgUrl + "','" + southWestLngLat + "','" + northEastLngLat + "'," + zIndex + "," + minZoom + "," + maxZoom + ")";
                        return FastExt.Renders.toClickText(val, functionStr);
                    }
                    return val;
                } catch (e) {
                    return FastExt.Renders.toEmptyTip();
                }
            };
        }

        /**
         * 将数据以密码格式渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static password(): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val)) {
                    return FastExt.Renders.toEmptyTip();
                }
                return "<span>******</span>";
            };
        }

        /**
         * 将数据以超链接格式渲染
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static href(url?: string): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                let realUrl = url;
                if (Ext.isEmpty(realUrl)) {
                    realUrl = val;
                }
                if (Ext.isEmpty(val) || val === "null") {
                    return FastExt.Renders.toEmptyTip();
                }
                let functionStr = "FastExt.Base.openUrl('" + realUrl + "','_blank')";
                return FastExt.Renders.toClickText(val, functionStr);
            };
        }

        /**
         * 将数据格式为单位大小后渲染，例如10kb
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static fileSize(): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return FastExt.Renders.toEmptyTip();
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
                    return FastExt.Renders.toEmptyTip();
                }
            };
        }

        /**
         * 将毫秒格式的数据格式渲染，例如：1秒或1分20秒
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static duration(): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return FastExt.Renders.toEmptyTip();
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
                    return FastExt.Renders.toEmptyTip();
                }
            };
        }

        /**
         * 将日期数据进行格式化
         * @param format 日期格式 默认：Y-m-d H:i:s
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static dateFormat(format?: string): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return FastExt.Renders.toEmptyTip();
                    }
                    if (Ext.isEmpty(format)) {
                        format = "Y-m-d H:i:s";
                    }
                    let guessDateFormat = FastExt.Base.guessDateFormat(val);

                    record.set()

                    return Ext.Date.format(Ext.Date.parse(val, guessDateFormat), format);
                } catch (e) {
                    console.error(e);
                    return val;
                }
            };
        }

        /**
         * 将日期格式化为生活日期提示，例如：1个小时前、1天前、1个月等
         * @param format 当超出汉字描述的范围后，使用指定的格式格式化日期 默认：Y-m-d H:i:s
         * @param appendWeek 是否追加 周几
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static dateFormatTip(format: string, appendWeek?: boolean): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return FastExt.Renders.toEmptyTip();
                    }
                    let guessDateFormat = FastExt.Base.guessDateFormat(val);
                    const sourceDate = Ext.Date.parse(val, guessDateFormat);
                    return FastExt.Dates.formatDateTip(sourceDate, format, appendWeek);
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
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return FastExt.Renders.toEmptyTip();
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
         * 将时间戳格式化为生活日期提示，例如：1个小时前、1天前、1个月等
         * @param format 当超出汉字描述的范围后，使用指定的格式格式化日期 默认：Y-m-d H:i:s
         * @param appendWeek 是否追加 周几
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static timestampTip(format?: string, appendWeek?: boolean) {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    if (Ext.isEmpty(val) || val === "null") {
                        return FastExt.Renders.toEmptyTip();
                    }
                    return FastExt.Dates.formatDateTip(new Date(parseInt(val)), format, appendWeek);
                } catch (e) {
                    console.error(e);
                    return val;
                }
            };
        }

        /**
         * 渲染枚举数据，如果枚举返回的实体中包含color属性，则会使用color值进行颜色渲染
         * @param enumName 枚举名称
         * @param enumValue 枚举值的属性名
         * @param enumText 枚举值的显示文本属性
         * @return 渲染函数 function (val, m, record, rowIndex, colIndex, store, view, details)
         */
        static enum(enumName: string, enumValue: string, enumText: string): any {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    if (Ext.isEmpty(val)) {
                        return FastExt.Renders.toEmptyTip();
                    }
                    if (Ext.isEmpty(enumText)) {
                        enumText = "text";
                    }
                    if (Ext.isEmpty(enumValue)) {
                        enumValue = "id";
                    }
                    let defaultInnerHtml = "<span style='color: #ccc;'>" + val + "</span>";
                    return "<div style='display: inline;' data-set='false' data-enum='" + enumName + "' data-enum-value='" + enumValue + "' data-enum-text='" + enumText + "' data-id='" + val + "'>" + defaultInnerHtml + "</div>";
                } finally {
                    FastExt.Store.getEnumDataByRender(enumName);
                }

            }
        }

        /**
         * 异常内容渲染器
         */
        static exception(): any {
            return function (val, m, record, rowIndex, colIndex, store, view) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    if (Ext.isEmpty(val)) {
                        return FastExt.Renders.toEmptyTip();
                    }
                    let key = FastExt.Renders.getRenderKey(colIndex, rowIndex, store);
                    FastExt.Cache.memory[key] = val;
                    let functionStr = "FastExt.Dialog.showCode(null,MemoryCache['" + key + "'])";
                    return "&nbsp;<span onclick=\"" + functionStr + "\" " +
                        " class='fast-grid-action' " +
                        " >" + FastExt.Base.getSVGIcon("extSee") + "&nbsp;查看异常内容</span>&nbsp;";
                } catch (e) {
                    return "<span style='color: #ccc;'>" + val + "</span>";
                }
            }
        }

        /**
         * 颜色值渲染器
         */
        static color(): any {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    if (Ext.isEmpty(val)) {
                        return FastExt.Renders.toEmptyTip();
                    }
                    let color = FastExt.Color.toColor(val);
                    return "<div style='background: " + color + ";padding: 0 25px;height: 14px;display: inline;'></div>";
                } catch (e) {
                    return "<span style='color: #ccc;'>" + val + "</span>";
                }
            }
        }

        /**
         * 查看二维码渲染器
         */
        static qrCode() {
            return function (val, m, record, rowIndex, colIndex) {
                if (FastExt.Power.config) {
                    return val;
                }
                try {
                    let url = "qrCode?v=1&render=image&content=" + val;
                    let functionStr = "FastExt.Image.showImage(null,'" + url + "')";
                    return FastExt.Renders.toClickText('查看二维码', functionStr);
                } catch (e) {
                    return "<span style='color: #ccc;'>" + val + "</span>";
                }
            };
        }

        /**
         * 代码渲染器
         */
        static code() {
            return function (val, m, record, rowIndex, colIndex, store, view, details) {
                if (FastExt.Power.config) {
                    return val;
                }
                if (Ext.isEmpty(val) || val === "null") {
                    return FastExt.Renders.toEmptyTip();
                }
                let key = FastExt.Renders.getRenderKey(colIndex, rowIndex, store);
                FastExt.Cache.memory[key] = val;
                let functionStr = "FastExt.Dialog.showCode(this,MemoryCache['" + key + "'],true,'java')";

                return "&nbsp;<span onclick=\"" + functionStr + "\" " +
                    " class='fast-grid-action' " +
                    " data-details-id='" + key + "'" +
                    " >" + FastExt.Base.getSVGIcon("extSee") + "&nbsp;查看内容</>&nbsp;";
            };
        }
    }
}