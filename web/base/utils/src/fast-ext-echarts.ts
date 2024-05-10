namespace FastExt {

    /**
     * ECharts 5.x 操作类 https://echarts.apache.org/zh/index.html
     */
    export class ECharts {

        /**
         * echarts.min.js文件路径
         */
        static echartsJsFile: string = "base/echarts/echarts.min.js";

        /**
         * echarts主题文件
         */
        static echartsThemeFile: string = "";

        /**
         * 加载ECharts到目标组件中
         * @param cmb 组件
         * @param option echarts配置数据选项
         */
        static loadECharts(cmb, option) {
            let doLoad = function () {
                if (cmb.echarts) {
                    cmb.echarts.hideLoading();
                    cmb.echarts.setOption(option);
                    return;
                }
                let bodyElement = FastExt.Base.getTargetBodyElement(cmb);
                if (bodyElement) {
                    let themeName = "";
                    if (!Ext.isEmpty(FastExt.ECharts.echartsThemeFile)) {
                        let beginSub = FastExt.ECharts.echartsThemeFile.lastIndexOf("/");
                        let endSub = FastExt.ECharts.echartsThemeFile.lastIndexOf(".");
                        themeName = FastExt.ECharts.echartsThemeFile.substring(beginSub + 1, endSub);
                    }
                    cmb.echarts = echarts.init(bodyElement, themeName);
                    cmb.echarts.setOption(option);
                    cmb.on("destroy", function (obj) {
                        if (FastExt.ECharts.getECharts(obj)) {
                            FastExt.ECharts.getECharts(obj).dispose();
                            obj.echarts = null;
                        }
                    });
                    cmb.on("resize", function (obj) {
                        if (FastExt.ECharts.getECharts(obj)) {
                            FastExt.ECharts.getECharts(obj).resize({
                                animation: {
                                    duration: 1000
                                }
                            });
                        }
                    });
                } else {
                    console.error("加载ECharts失败！无法获取目标控件的BodyElement！");
                }
            };

            this.loadJs(doLoad);
        }

        /**
         * 加载核心js代码
         * @param callBack
         */
        static loadJs(callBack: any) {
            FastExt.PluginLoader.loadPlugins("ECharts", [FastExt.ECharts.echartsJsFile, FastExt.ECharts.echartsThemeFile], callBack);
        }

        /**
         * 获取cmb已加载渲染的echarts对象
         * @param cmb 组件
         */
        static getECharts(cmb) {
            if (cmb.echarts) {
                return cmb.echarts;
            }
            console.error("获取ECharts失败！目标控件未加载echarts！");
            return null;
        }

        /**
         * 判断cmb是否已加载渲染的echarts对象
         * @param cmb 组件
         */
        static hasECharts(cmb) {
            return !!cmb.echarts;
        }


        /**
         * 弹窗显示echarts报表组件
         * @param title 弹框标题
         * @param options 报表配置数据
         * @param modal 模式窗口打开
         */
        static showECharts(title, options, modal?) {
            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));

            let win = Ext.create('Ext.window.Window', {
                title: title,
                iconCls: "extIcon extReport whiteColor",
                height: winHeight,
                width: winWidth,
                layout: 'border',
                resizable: true,
                maximizable: true,
                constrain: true,
                modal: modal,
                padding: "10 10 10 10",
                bodyStyle: {
                    background: "#ffffff"
                },
                listeners: {
                    show: function (obj) {
                        FastExt.ECharts.loadECharts(obj, options);
                    }
                }
            });
            win.show();
        }


        /**
         * 显示实体类的图表窗体
         */
        static showEntityECharts(obj: any, title: string, params: any, dateTypes?: any[]) {

            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));
            let beginDate = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MONTH, -1), 'Y-m-d');
            let endDate = Ext.Date.format(new Date(), 'Y-m-d');

            params["type"] = 0;
            params["chartTitle"] = title;
            params["beginDate"] = beginDate;
            params["endDate"] = endDate;

            if (!dateTypes) {
                dateTypes = [
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
                    },
                    {
                        'text': '时图表',
                        "value": 2
                    }, {
                        'text': '时分图表',
                        "value": 3
                    }
                ];
            }

            let win = Ext.create('Ext.window.Window', {
                title: title,
                animateTarget: obj,
                height: winHeight,
                width: winWidth,
                minWidth: winWidth,
                minHeight: winHeight,
                iconCls: 'extIcon extReport',
                layout: 'border',
                resizable: true,
                maximizable: true,
                constrain: true,
                modal: true,
                refreshECharts: function () {
                    let me = this;
                    if (FastExt.ECharts.hasECharts(me)) {
                        me.setLoading(false);
                        FastExt.ECharts.getECharts(me).showLoading();
                    }
                    FastExt.Server.showEcharts(params, function (success, message, data) {
                        me.setLoading(false);
                        if (success) {
                            FastExt.ECharts.loadECharts(me, data);
                        } else {
                            FastExt.Dialog.showAlert("系统提醒", message);
                        }
                    });
                },
                bodyStyle: {
                    background: "#fcfcfc"
                },
                tbar: {
                    xtype: 'toolbar',
                    overflowHandler: 'menu',
                    items: [
                        {
                            xtype: 'combo',
                            fieldLabel: "图表类型",
                            labelWidth: 60,
                            valueField: 'value',
                            editable: false,
                            value: 0,
                            listeners: {
                                change: function (obj, newValue, oldValue, eOpts) {
                                    params["type"] = newValue;
                                    win.refreshECharts();
                                }
                            },
                            store: Ext.create('Ext.data.Store', {
                                fields: ["id", "text"],
                                data: dateTypes
                            })
                        },
                        {
                            xtype: "daterangefield",
                            fieldLabel: "日期范围",
                            flex: 1,
                            margin: '0 0 0 5',
                            maxRangeMonth: 12,
                            beginDate: beginDate,
                            endDate: endDate,
                            labelWidth: 60,
                            onClearValue: function () {
                                params["beginDate"] = this.beginDate;
                                params["endDate"] = this.endDate;
                                win.refreshECharts();
                            },
                            onAfterSelect: function () {
                                params["beginDate"] = this.beginDate;
                                params["endDate"] = this.endDate;
                                win.refreshECharts();
                            }
                        },
                        {
                            xtype: 'button',
                            text: '折线图',
                            iconCls: 'extIcon extPolyline',
                            margin: '0 5 0 5',
                            handler: function () {
                                params["chartType"] = "line";
                                win.refreshECharts();
                            }
                        }, {
                            xtype: 'button',
                            text: '柱状图',
                            iconCls: 'extIcon extReport',
                            margin: '0 5 0 5',
                            handler: function () {
                                params["chartType"] = "bar";
                                win.refreshECharts();
                            }
                        }, {
                            xtype: 'button',
                            text: '堆叠图',
                            iconCls: 'extIcon extMore',
                            margin: '0 5 0 5',
                            handler: function () {
                                params["chartType"] = "stack";
                                win.refreshECharts();
                            }
                        }]
                },
                listeners: {
                    show: function (obj) {
                        win.setLoading("请稍后……");
                        obj.refreshECharts();
                    }
                }
            });
            win.show();

        }
    }
}