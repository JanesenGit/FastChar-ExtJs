namespace FastExt {


    /**
     * 数据看板
     */
    export class Databoard {

        static getPanel() {
            let title = FastExt.Base.toString(FastExt.System.ConfigHandler.getDataboard().title, "数据看板");
            return Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'center',
                border: 0,
                title: title,
                iconCls: "extIcon extTable",
                items: [],
                scrollable: "y",
                bodyStyle: {
                    background: "#ffffff",
                },
                loadData: function () {
                    this.setLoading("加载数据中……");
                    FastExt.Server.getDataboardData((success: boolean, message: string, data: any) => {
                        this.setLoading(false);
                        if (success) {
                            this.databoardContainer = new DataboardContainer(data);
                            this.update(this.databoardContainer.buildHtml());
                            this.databoardContainer.onResize(this.getWidth(), this.getHeight());
                            this.databoardContainer.onLoaded();
                        }
                    });
                },
                updateSize: function (width, height) {
                    if (this.databoardContainer) {
                        this.databoardContainer.onResize(width, height);
                    }
                },
                listeners: {
                    afterrender: function (panel, eOpts) {
                        panel.loadData();
                    },
                    resize: function (panel, width, height, oldWidth, oldHeight) {
                        panel.updateSize(width, height);
                    },
                },
            });
        }


        static showEChars(type: string, dataTitle: string) {
            let params = {
                "entityCode": "ExtSystemDataEntity",
                "columnDate": "dataDateTime",
                "storeId": "ExtSystemDataEntity",
                "dataType": type,
                "echarts[0].property": "dataValue",
                "echarts[0].function": "sum",
                "echarts[0].details": dataTitle,
            };
            FastExt.ECharts.showEntityECharts(this, "数据趋势图", params, [
                {
                    'text': '年图表',
                    "value": 4
                },
                {
                    'text': '月图表',
                    "value": 1
                },
                {
                    'text': '日图表',
                    'value': 0
                }
            ]);
        }
    }

    class DataboardContainer {
        private readonly _databoardData: any;
        private _databoardGroups: any[] = [];

        constructor(data: any) {
            this._databoardData = data;
        }

        public buildHtml(): string {

            let html = [];

            let databoardConfigJson = FastExt.System.ConfigHandler.getDataboard();

            let groupData = databoardConfigJson.data;

            for (let groupDatum of groupData) {

                if (groupDatum.type === "split_title") {//分割
                    this._databoardGroups.push(new DataboardSplitTitleItem(groupDatum));
                    continue;
                }

                if (groupDatum.items) {
                    let items = groupDatum.items;
                    for (let item of items) {
                        item.render_type = groupDatum.type;
                        item.render_group_title = groupDatum.title;
                        let databoardData = this.getDataboardData(item.id);
                        if (databoardData) {
                            item.value = databoardData.value;
                            item.render_trent = databoardData.trend;//数据走势，上升、下降……
                        }
                        if (Ext.isEmpty(item.render_color)) {
                            item.render_color = "transparent";
                        }
                        if (Ext.isEmpty(item.render_title_color)) {
                            item.render_title_color = "unset";
                        }
                        if (Ext.isEmpty(item.render_icon_color)) {
                            item.render_icon_color = "unset";
                        }
                    }
                    if (items.length > 0) {
                        this._databoardGroups.push(new DataboardGroup(items));
                    }
                }
                if (groupDatum.groupId) {
                    let dataItems = [];
                    for (let databoardDatum of this._databoardData) {
                        if (groupDatum.groupId === databoardDatum.groupId) {
                            databoardDatum.render_type = groupDatum.type;
                            databoardDatum.render_group_title = groupDatum.title;
                            databoardDatum.render_title = databoardDatum.title;
                            dataItems.push(databoardDatum);
                        }
                    }
                    if (dataItems.length > 0) {
                        this._databoardGroups.push(new DataboardGroup(dataItems));
                    }
                }
            }

            for (let databoardGroup of this._databoardGroups) {
                html.push(databoardGroup.buildHtml());
            }
            return '<div class="fast-databoard-container">' + html.join("") + '</div>';
        }

        private getDataboardData(id: string): any {
            for (let databoardDatum of this._databoardData) {
                if (id === databoardDatum.id) {
                    return databoardDatum;
                }
            }
            return undefined;
        }


        public onLoaded() {
            for (let databoardGroup of this._databoardGroups) {
                databoardGroup.onLoaded();
            }
        }

        public onResize(width: number, height: number) {
            for (let databoardGroup of this._databoardGroups) {
                databoardGroup.onResize(width, height);
            }
        }

    }

    class DataboardGroup {

        private readonly _data: any;
        private _databoardItems: DataboardItemBase[] = [];

        constructor(data: any) {
            this._data = data;
        }

        public buildHtml(): string {
            let html = [];
            let fistItem = this._data [0];
            let renderType = fistItem.render_type;
            let mustFill = false;
            if (renderType === "data_text_v") {//纵向文本：text
                for (let item of this._data) {
                    this._databoardItems.push(new DataboardVTextItem(item));
                }
            } else if (renderType === "data_text_h") {//横向文本：text
                for (let item of this._data) {
                    this._databoardItems.push(new DataboardHTextItem(item));
                }
            } else if (renderType === "data_chart_pie") {//饼状图
                this._databoardItems.push(new DataboardChatPieItem(this._data));
                mustFill = true;
            }
            for (let databoardItem of this._databoardItems) {
                html.push(databoardItem.buildHtml());
            }
            let databoardConfigJson = FastExt.System.ConfigHandler.getDataboard();
            if (FastExt.Base.toBool(databoardConfigJson.fill, true) || mustFill) {
                return '<div class="fast-databoard-group">' + html.join(new DataboardItemSplitV().buildHtml()) + '</div>';
            }
            return '<div class="fast-databoard-group fast-databoard-group-h">' + html.join(new DataboardItemSplitV().buildHtml()) + '</div>';
        }

        public onLoaded() {
            for (let databoardItem of this._databoardItems) {
                databoardItem.onLoaded();
            }
        }

        public onResize(width: number, height: number) {
            for (let databoardItem of this._databoardItems) {
                databoardItem.onResize(width, height);
            }
        }

    }

    class DataboardItemBase {


        public buildHtml(): string {
            return "";
        }


        public onLoaded() {

        }

        public onResize(width: number, height: number) {

        }

    }

    class DataboardItemSplitV extends DataboardItemBase {

        buildHtml(): string {
            return '<div class="fast-databoard-split-v"></div>';
        }
    }

    /**
     * 纵向布局的文本显示
     */
    class DataboardVTextItem extends DataboardItemBase {
        private readonly _data: any;

        constructor(data: any) {
            super();
            this._data = data;
        }

        public buildHtml(): string {
            let moreItemClass = "";
            let clickFunction = 'FastExt.Databoard.showEChars(\'' + this._data.id + '\',\'' + this._data.chart_title + '\')';
            if (this._data.render_click) {
                clickFunction = this._data.render_click;
                if (this._data.render_click === 'false') {
                    clickFunction = "";
                    moreItemClass = "fast-databoard-cursor-none";
                }
            }
            let icon = FastExt.Server.getIcon(this._data.render_icon, this._data.render_icon_color);

            let databoardItemStyle = "class='fast-databoard-item " + moreItemClass + "' style='background-color: " + this._data.render_color + ";'";

            let itemHtml =
                '    <img class="fast-databoard-item-icon" src="' + icon + '" alt="图标"/>' +
                '    <div class="fast-databoard-item-value"><span style="color:' + this._data.render_value_color + ';">' + this._data.value + '</span>' +
                new DataboardItemState(this._data).buildHtml() + '</div>' +
                '    <span class="fast-databoard-item-title" style="color: ' + this._data.render_title_color + ';">' + this._data.render_title + '</span>'
            ;
            return FastExt.Documents.wrapOnClick(itemHtml, clickFunction, databoardItemStyle)

        }
    }

    /**
     * 横向布局的数据文本显示
     */
    class DataboardHTextItem extends DataboardItemBase {
        private readonly _data: any;

        constructor(data: any) {
            super();
            this._data = data;
        }

        public buildHtml(): string {
            let moreItemClass = "";

            let clickFunction = 'FastExt.Databoard.showEChars(\'' + this._data.id + '\',\'' + this._data.chart_title + '\')';
            if (this._data.render_click) {
                clickFunction = this._data.render_click;
                if (this._data.render_click === 'false') {
                    clickFunction = "";
                    moreItemClass = "fast-databoard-cursor-none";
                }
            }
            let icon = FastExt.Server.getIcon(this._data.render_icon, this._data.render_icon_color);


            let databoardItemStyle = "class='fast-databoard-item fast-databoard-item-h " + moreItemClass + "' style='background-color: " + this._data.render_color + ";'";

            let itemHtml =
                '    <img class="fast-databoard-item-icon fast-databoard-item-icon-h" src="' + icon + '" alt="图标"/>' +
                ' <div class="fast-databoard-item-info-v">' +
                '   <span class="fast-databoard-item-title fast-databoard-item-title-h" style="color: ' + this._data.render_title_color + ';">' + this._data.render_title + '</span> ' +
                '   <div class="fast-databoard-item-value fast-databoard-item-value-h"><span style="color:' + this._data.render_value_color + ';">' + this._data.value + '</span>' + new DataboardItemState(this._data).buildHtml() + '</div>' +
                ' </div>'
            ;
            return FastExt.Documents.wrapOnClick(itemHtml, clickFunction, databoardItemStyle)

        }
    }

    /**
     * 数据状态显示
     */
    class DataboardItemState extends DataboardItemBase {
        private readonly _data: any;

        constructor(data: any) {
            super();
            this._data = data;
        }

        buildHtml(): string {
            let iconCls = "";
            if (this._data.render_trent === 0) {//上升
                iconCls = "extRise greenColor";
            } else if (this._data.render_trent === 1) {//下降
                iconCls = "extDecline redColor";
            } else if (this._data.render_trent === 2) {//持平
                iconCls = "extFlat blueColor";
            }
            return '<span class="fast-databoard-item-value-state extIcon ' + iconCls + '"></span>';
        }
    }

    /**
     * 饼状图
     */
    class DataboardChatPieItem extends DataboardItemBase {
        private readonly _data: any;
        private readonly _htmlId: string;
        private _echart: any;

        constructor(data: any) {
            super();
            this._data = data;
            this._htmlId = FastExt.Base.buildOnlyCode("Chart-");
        }

        onLoaded() {
            FastExt.ECharts.loadJs(() => {
                this.initECharts();
            });
        }

        onResize(width: number, height: number) {
            let chartDom = document.getElementById(this._htmlId);
            $(chartDom).css("width", width + "px");
            // $(chartDom).css("height", height + "px");
            if (this._echart) {
                this._echart.resize();
            }
        }

        public buildHtml(): string {
            return '<div id="' + this._htmlId + '" class="fast-databoard-item-pie"></div>';
        }

        public initECharts() {
            let chartDom = document.getElementById(this._htmlId);
            this._echart = echarts.init(chartDom, null, {
                renderer: 'canvas',
                useDirtyRect: false
            });
            let data = [];
            let title = "";

            for (let datum of this._data) {
                title = datum.render_group_title;
                data.push({value: datum.value, name: datum.render_title});
            }
            console.log("data", data);
            let option = {
                title: {
                    text: title,
                    left: 'center',
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    type: 'scroll',
                    orient: "horizontal",
                    left: 'center',
                    bottom: 0,
                },
                series: [
                    {
                        type: 'pie',
                        radius: '70%',
                        data: data,
                        labelLine: {
                            show: false
                        },
                        label: {
                            show: false,
                            position: 'center'
                        },
                        itemStyle: {
                            shadowBlur: 3,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: 8
                        },
                        emphasis: {
                            scaleSize: 20,
                            itemStyle: {
                                shadowBlur: 18,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
            option && this._echart.setOption(option);
        }

    }

    /**
     * 分割
     */
    class DataboardSplitTitleItem extends DataboardItemBase {
        private readonly _data: any;

        constructor(data: any) {
            super();
            this._data = data;
        }

        public buildHtml(): string {
            let icon = FastExt.Server.getIcon(this._data.render_icon, this._data.render_icon_color);
            return "" +
                "<div class='fast-databoard-split-title-container'>" +
                "<img class='fast-databoard-split-title-icon' src='" + icon + "' alt='icon'/>" +
                "<span class='fast-databoard-split-title'>" + this._data.render_title + "</span>" +
                "</div>";

        }
    }


}