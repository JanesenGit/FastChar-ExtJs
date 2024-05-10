namespace FastExt {


    /**
     * jquery打印插件 https://plugins.jquery.com/PrintArea
     */
    export class JqueryPrintArea {

        static printAreaJsPath = "base/jquery/jquery.printarea.js";


        static loader(callBack: any) {
            FastExt.PluginLoader.loadPlugins("JqueryPrintArea", [FastExt.JqueryPrintArea.printAreaJsPath], callBack);
        }

        static print(selector: string) {
            FastExt.JqueryPrintArea.loader(() => {
                $(selector).printArea();
            });
        }

    }

}