namespace FastExt {

    /**
     * Lottie操作类 https://airbnb.design/lottie/
     */
    export class Lottie {


        /**
         * lottie.min.js文件的路径
         */
        static lottieJsPath: string = "base/lottie/lottie.min.js";

        /**
         * 是否已加载了lottie.min.js文件
         */
        static loadedLottieJs: boolean;


        /**
         * 渲染lottie json动画到指定的组件中
         * @param cmb 组件
         * @param jsonPath lottie动画的json数据地址
         * @param callBack 加载成后的回调
         */
        static loadJsonAnim(cmb, jsonPath, callBack?) {
            let doLoad = function () {
                FastExt.Lottie.loadedLottieJs = true;
                let bodyElement = FastExt.Base.getTargetBodyElement(cmb);
                if (bodyElement) {
                    cmb.lottie = bodymovin.loadAnimation({
                        container: bodyElement,
                        renderer: 'svg',
                        loop: true,
                        autoplay: true,
                        path: jsonPath
                    });
                    if (callBack) {
                        cmb.lottie.addEventListener("data_ready", callBack);
                    }
                } else {
                    console.error("加载Lottie动画失败！无法获取目标控件的BodyElement！");
                }

            };
            if (!this.loadedLottieJs) {
                FastExt.System.addScript({src: FastExt.Lottie.lottieJsPath}, doLoad);
            } else {
                doLoad();
            }
        }


        /**
         * 获取cmb已加载渲染的lottie对象
         * @param cmb
         */
        static getLottie(cmb): any {
            if (cmb.lottie) {
                return cmb.lottie;
            }
            console.error("获取Lottie失败！目标控件未加载lottie！");

        }

        /**
         * 查看lottie动效
         * @param obj 弹框动画对象
         * @param jsonPath lottie的json文件路径
         */
        static showLottie(obj, jsonPath) {
            let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));

            let win = Ext.create('Ext.window.Window', {
                title: "查看动效",
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
                        obj.setLoading("加载动效中，请稍后……");
                        FastExt.Lottie.loadJsonAnim(obj, jsonPath, function () {
                            obj.setLoading(false);
                        });
                    }
                }
            });
            win.show();

        }

    }
}