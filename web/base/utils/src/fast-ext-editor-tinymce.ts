namespace FastExt {

    /**
     * Tinymce操作类 https://www.tiny.cloud/docs/tinymce/6/
     */
    export class Tinymce {


        /**
         * tinymce.min.js文件的路径
         */
        static tinymceJsPath: string = "base/tinymce/tinymce.min.js";

        /**
         * 是否正在初始化中
         */
        static initializing: boolean = false;

        /**
         * 初始化队列
         */
        static stackInitConfig = [];


        /**
         * 加载tinymceJs组件
         * @param callBack 加载成后的回调
         */
        static loadTinymceJs(callBack: any) {
            FastExt.PluginLoader.loadPlugins("Tinymce", [FastExt.Tinymce.tinymceJsPath], callBack);
        }

        /**
         * 初始化编辑器
         * @param config
         * @param callback
         */
        static initTinymce(config: any, callback) {
            config["promotion"] = false;
            if (FastExt.Tinymce.initializing) {
                FastExt.Tinymce.stackInitConfig.push({
                    config: config,
                    callback: callback,
                });
                return;
            }
            FastExt.Tinymce.initializing = true;
            FastExt.Tinymce.loadTinymceJs(function () {
                tinymce.init(config).then(function (editors) {
                    callback(editors);
                    FastExt.Tinymce.initializing = false;
                    let nextInit = FastExt.Tinymce.stackInitConfig.pop();
                    if (nextInit) {
                        FastExt.Tinymce.initTinymce(nextInit.config, nextInit.callback);
                    }
                });
            });
        }

    }
}