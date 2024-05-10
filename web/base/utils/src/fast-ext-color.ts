namespace FastExt {

    /**
     * 颜色处理的功能
     */
    export class Color {

        /**
         * pickr.es5.min.js文件的路径 https://github.com/Simonwep/pickr
         */
        static pickrJsPath: string = "base/colorpicker/pickr.es5.min.js";

        /**
         * pickr主题文件的路径 https://github.com/Simonwep/pickr
         */
        static pickrStylePath: string = "base/colorpicker/monolith.min.css";


        /**
         * 转换颜色格式值，符合：#ffffff 格式
         * @param obj 待转换的颜色
         * @param defaultValue 默认颜色
         * @returns {string}
         */
        static toColor(obj, defaultValue?): string {
            if (Ext.isEmpty(defaultValue)) {
                defaultValue = "#FFFFFF";
            }
            if (Ext.isEmpty(obj)) {
                return defaultValue;
            }
            if (obj.toString().startWith("#")) {
                return obj.toString();
            }
            try {
                obj = obj.toString().replaceAll(" ", "");
                let color = Ext.ux.colorpick.ColorUtils.parseColor(obj);
                return "#" + Ext.ux.colorpick.ColorUtils.formats.HEX8(color);
            } catch (e) {
            }
            return "#" + obj;
        }


        /**
         * 弹出颜色选择控件
         * @param obj 需要弹出的目标控件
         * @param defaultValue 默认颜色
         * @param onColorChange 颜色变化的监听
         * @return Ext.Promise
         */
        static showColorPicker(obj, defaultValue, onColorChange) {
            if (Ext.isEmpty(defaultValue)) {
                defaultValue = "#42445a";
            }
            return new Ext.Promise(function (resolve, reject) {
                let doShowPicker = function () {
                    let menu = Ext.create('Ext.menu.Menu', {
                        showSeparator: false,
                        layout: 'border',
                        padding: '0 0 0 0',
                        style: {
                            background: "#ffffff"
                        },
                        alwaysOnTop: true,
                        width: 250,
                        height: 320,
                        listeners: {
                            hide: function (obj, epts) {
                                obj.close();
                                FastExt.Base.runCallBack(resolve);
                            }
                        },
                        items: [
                            {
                                xtype: 'container',
                                region: 'center',
                                margin: '0 0 0 0',
                                border: 0,
                                listeners: {
                                    afterrender: function () {
                                        const colorPicker = new Pickr({
                                            el: FastExt.Base.getTargetBodyElement(this),
                                            theme: 'monolith',
                                            inline: true,
                                            default: defaultValue,
                                            showAlways: true,
                                            useAsButton: true,
                                            swatches: [
                                                'rgba(244, 67, 54, 1)',
                                                'rgba(233, 30, 99, 0.95)',
                                                'rgba(156, 39, 176, 0.9)',
                                                'rgba(103, 58, 183, 0.85)',
                                                'rgba(63, 81, 181, 0.8)',
                                                'rgba(33, 150, 243, 0.75)',
                                                'rgba(3, 169, 244, 0.7)',
                                                'rgba(0, 188, 212, 0.7)',
                                                'rgba(0, 150, 136, 0.75)',
                                                'rgba(76, 175, 80, 0.8)',
                                                'rgba(139, 195, 74, 0.85)',
                                                'rgba(205, 220, 57, 0.9)',
                                                'rgba(255, 235, 59, 0.95)',
                                                'rgba(255, 193, 7, 1)'
                                            ],
                                            components: {
                                                preview: true,
                                                opacity: true,
                                                hue: true,
                                                interaction: {
                                                    hex: true,
                                                    input: true,
                                                    rgba: true
                                                }
                                            }
                                        });
                                        colorPicker.on('change', function (color, source, instance) {
                                            if (Ext.isFunction(onColorChange)) {
                                                onColorChange(color, source, instance)
                                            }
                                        });
                                    },
                                }
                            }]
                    });
                    menu.showBy(obj);
                };

                FastExt.PluginLoader.loadPlugins("ColorPicker", [FastExt.Color.pickrJsPath, FastExt.Color.pickrStylePath], doShowPicker);
            });
        }



        /**
         * 将颜色进行高亮
         * @param color 颜色值
         * @param level 高亮级别0-255
         */
        static colorToLight(color: string, level: number) {
            let newColor = "#";

            let regStr = /([0-9a-f]{2})/g;
            color = color.replace("#", "").toLowerCase();
            let result = color.match(regStr);
            if (!result) {
                return undefined;
            }
            for (let resultElement of result) {
                let intValue = parseInt(resultElement, 16);
                let fixIntValue = (Math.floor((255 - intValue) * level) + intValue);
                newColor += fixIntValue.toString(16);
            }
            return newColor;
        }

        /**
         * 将颜色进行调暗
         * @param color 颜色值
         * @param level 调暗级别0-255
         */
        static colorToDarken(color: string, level: number) {
            let rgb = tinycolor(color).toRgb();
            let red = rgb.r;
            let green = rgb.g;
            let blue = rgb.b;
            let maxColor = "red";
            if (green >= red && green >= blue) {
                maxColor = "green";
            } else if (blue >= red) {
                maxColor = "blue";
            }
            switch (maxColor) {
                case "red":
                    red -= level;
                    break;
                case "green":
                    green -= level;
                    break;
                case "blue":
                    blue -= level;
                    break;
            }

            if (red < 0) {
                red = 0;
            }

            if (green < 0) {
                green = 0;
            }

            if (blue < 0) {
                blue = 0;
            }
            return tinycolor({r: red, g: green, b: blue}).toHexString();
        }

    }


}