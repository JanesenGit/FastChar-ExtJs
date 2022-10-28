namespace FastExt {

    /**
     * Tinymce操作类 https://www.tiny.cloud/docs/tinymce/6/
     */
    export class Tinymce {


        constructor() {
        }

        /**
         * tinymce.min.js文件的路径
         */
        static tinymceJsPath: string = "base/tinymce/tinymce.min.js";

        /**
         * 是否已加载了tinymce.min.js文件
         */
        static loadedTinymce: boolean = false;


        /**
         * 加载tinymceJs组件
         * @param callBack 加载成后的回调
         */
        static loadTinymceJs(callBack) {
            if (!FastExt.Tinymce.loadedTinymce) {
                FastExt.System.addScript({src: FastExt.Tinymce.tinymceJsPath}, function () {
                    FastExt.Tinymce.loadedTinymce = true;
                    callBack();
                });
            } else {
                callBack();
            }
        }

        /**
         * 初始化编辑器
         * @param config
         * @param callback
         */
        static initTinymce(config: any, callback) {
            FastExt.Tinymce.loadTinymceJs(function () {
                tinymce.init(config).then(function (editors) {
                    callback(editors);
                });
            });
        }

    }
}