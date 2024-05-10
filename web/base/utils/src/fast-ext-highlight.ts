namespace FastExt {

    export class Highlight {

        /**
         * highlight.min.js文件的路径
         */
        static highlightJsPath: string = "base/highlight/highlight.min.js";

        /**
         * highlight.css文件的路径
         */
        static highlightStylePath: string = "base/highlight/idea.min.css";



        /**
         * 加载Markdown组件
         * @param callBack 加载成后的回调
         */
        static loadHighlight(callBack: any) {
            FastExt.PluginLoader.loadPlugins("Highlight", [FastExt.Highlight.highlightJsPath, FastExt.Highlight.highlightStylePath], callBack);
        }

        /**
         * 格式化高亮代码
         * @param code 代码
         * @param lang 代码开发语言
         * @param callback 回调函数function(value)
         */
        static highlightCode(code: string, lang: string, callback: any): void {
            FastExt.Highlight.loadHighlight(() => {
                callback(hljs.highlight(code, {language: lang}).value);
            });
        }

    }



}