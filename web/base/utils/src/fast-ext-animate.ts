namespace FastExt {

    export class Animate {

        static animateJsPath = "base/animejs/anime.min.js";

        static animateMap = {};

        static loader(callBack: any) {
            FastExt.PluginLoader.loadPlugins("Animate", [FastExt.Animate.animateJsPath], callBack);
        }


        /**
         * 开启一段zhi动画
         * @param animateCode 动画标识
         * @param animateConfig 动画配置
         */
        static startValueAnimate(animateCode: string, animateConfig: ValueAnimateConfig | any): any {
            FastExt.Animate.clearAnimate(animateCode);
            FastExt.Animate.loader(() => {
                let params = ValueAnimateConfig.newParam(animateConfig);
                let animObj = {
                    value: params.from,
                };
                FastExt.Animate.animateMap[animateCode] = anime({
                    targets: animObj,
                    value: params.to,
                    easing: params.easing,
                    duration: params.duration,
                    delay: params.delay,
                    update: function () {
                        params.update(animObj.value);
                    },
                    changeBegin: function (anim) {
                        params.changeBegin(anim);
                    },
                    begin: function (anim) {
                        params.begin(anim);
                    },
                    complete: function (anim) {
                        params.complete(anim);
                        FastExt.Animate.clearAnimate(animateCode);
                    }
                });
            });
        }


        static clearAnimate(animateCode: string) {
            let animObj = FastExt.Animate.animateMap[animateCode];
            if (animObj) {
                animObj.pause();
                delete FastExt.Animate.animateMap[animateCode];
            }
        }


        /**
         * 根据组件宽度，动画隐藏组件
         * @param cmb
         */
        static startHideAnimateByWidth(cmb: any) {
            if (!cmb) {
                return;
            }
            if (cmb.isHidden()) {
                return;
            }
            let lastWidth = cmb.getWidth();
            FastExt.Animate.startValueAnimate(cmb.getId(), {
                from: lastWidth,
                to: 0,
                update: (value) => {
                    cmb.setWidth(value)
                },
                complete: () => {
                    this.clearAnimate(cmb);
                    cmb.setHidden(true);
                    cmb.setWidth(lastWidth);
                }
            });
        };

        /**
         * 根据组件宽度，动画隐藏组件
         * @param button
         * @param delay
         */
        static startMinButtonAnimateByWidth(button: any, delay: number) {
            if (!button) {
                return;
            }
            let lastWidth = button.getWidth();
            let minWidth = button.getHeight();
            if (!button.fastAnimateFirstWidth) {
                //只记录一次
                button.fastAnimateFirstWidth = lastWidth;
            }
            FastExt.Animate.startValueAnimate(button.getId(), {
                delay: delay,
                from: lastWidth,
                to: minWidth,
                duration: 200,
                update: (value) => {
                    button.setWidth(value)
                },
                complete: () => {
                    this.clearAnimate(button);
                    let txtEl = Ext.get(button.getId() + "-btnInnerEl");
                    if (txtEl) {
                        txtEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
                        txtEl.setVisible(false);
                    }
                    button.setWidth(minWidth);
                }
            });
        };

        /**
         * 根据组件宽度，动画隐藏组件
         * @param button
         * @param delay
         */
        static startMaxButtonAnimateByWidth(button: any, delay?: number) {
            if (!button) {
                return;
            }
            let fromWidth = button.getWidth();
            let toWidth = button.fastAnimateFirstWidth;
            FastExt.Animate.startValueAnimate(button.getId(), {
                from: fromWidth,
                to: toWidth,
                duration: 200,
                delay: delay ? delay : 0,
                changeBegin: () => {
                    let txtEl = Ext.get(button.getId() + "-btnInnerEl");
                    if (txtEl) {
                        txtEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
                        txtEl.setVisible(true);
                    }
                },
                update: (value) => {
                    button.setWidth(value)
                },
                complete: () => {
                    this.clearAnimate(button);
                    button.setWidth(toWidth);
                }
            });
        };


        /**
         * 根据组件宽度，动画释放组件
         * @param cmb
         */
        static startCloseAnimateByWidth(cmb: any) {
            if (!cmb) {
                return;
            }
            if (cmb.destroyed) {
                return;
            }
            let lastWidth = cmb.getWidth();
            FastExt.Animate.startValueAnimate(cmb.getId(), {
                from: lastWidth,
                to: 0,
                update: (value) => {
                    cmb.setWidth(value)
                },
                complete: () => {
                    this.clearAnimate(cmb);
                    cmb.destroy();
                }
            });
        }


        /**
         * 根据组件高度，动画释放组件
         * @param cmb
         */
        static startCloseAnimateByHeight(cmb: any) {
            if (!cmb) {
                return;
            }
            if (cmb.destroyed) {
                return;
            }
            let lastHeight = cmb.getHeight();
            FastExt.Animate.startValueAnimate(cmb.getId(), {
                from: lastHeight,
                to: 0,
                duration: 200,
                update: (value) => {
                    cmb.setHeight(value)
                },
                complete: () => {
                    this.clearAnimate(cmb);
                    cmb.destroy();
                }
            });
        };


        static isAnimating(cmb: any): boolean {
            return cmb.fastAnimate;
        }


    }

    /**
     * 动画配置，参考文档：https://animejs.com/documentation
     */
    export class ValueAnimateConfig {

        static newParam(param?: any): ValueAnimateConfig {
            let newParam = new ValueAnimateConfig();
            if (param) {
                for (let paramKey in param) {
                    newParam[paramKey] = param[paramKey];
                }
            }
            return newParam;
        }

        from: number;

        to: number;

        duration = 500;

        easing = "linear";

        delay = 0;

        //更新时的函数
        update = function (value) {

        };

        begin = function (anim) {
        }
        complete = function (anim) {
        }
        changeBegin = function (anim) {

        };
    }

}