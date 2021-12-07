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
         * 是否已加载了echarts.min.js文件
         */
        static loadedEChartsJs: boolean;

        /**
         * 加载ECharts到目标组件中
         * @param cmb 组件
         * @param option echarts配置数据选项
         */
        static loadECharts(cmb, option): any {
            let doLoad = function () {
                if (cmb.echarts) {
                    cmb.echarts.hideLoading();
                    cmb.echarts.setOption(option);
                    return;
                }
                let bodyElement = FastExt.Base.getTargetBodyElement(cmb);
                if (bodyElement) {
                    let themeName = "";
                    if (Ext.isEmpty(FastExt.ECharts.echartsThemeFile)) {
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

            if (!this.loadedEChartsJs) {
                FastExt.System.addScript({src: FastExt.ECharts.echartsJsFile}, function () {
                    if (Ext.isEmpty(FastExt.ECharts.echartsThemeFile)) {
                        doLoad();
                    } else {
                        FastExt.System.addScript({src: FastExt.ECharts.echartsThemeFile}, doLoad);
                    }
                });
            } else {
                doLoad();
            }
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
         */
        static showECharts(title, options) {
            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));

            let win = Ext.create('Ext.window.Window', {
                title: title,
                height: winHeight,
                width: winWidth,
                layout: 'border',
                resizable: true,
                maximizable: true,
                constrain: true,
                modal: true,
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
    }
}