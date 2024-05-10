namespace FastExt {

    export class PluginLoader {

        static loadedPluginMap = {};

        /**
         * 加载插件的文件
         * @param srcPaths 文件地址
         * @param callBack 全部加载完成回调函数function(content[]){}
         */
        static loadFiles(srcPaths: any[], callBack: any) {
            let doLoadFile = function (index: number, result: any[]) {
                if (index >= srcPaths.length) {
                    callBack(result);
                    return;
                }
                let path = srcPaths[index];
                if (Ext.isObject(path)) {
                    result.push(path);
                    doLoadFile(index + 1, result);
                } else if (Ext.isString(path)) {
                    $.get(path, function (content: any) {
                        result.push(content);
                        doLoadFile(index + 1, result);
                    });
                } else {
                    doLoadFile(index + 1, result);
                }
            };
            doLoadFile(0, []);
        }


        /**
         * 加载插件的文件
         * @param pluginCode 插件标识
         * @param srcPaths js或css文件地址
         * @param callBack 全部加载完成回调函数
         */
        static loadPlugins(pluginCode: string, srcPaths: any[], callBack: any) {
            if (FastExt.PluginLoader.loadedPluginMap[pluginCode]) {
                callBack();
                return;
            }
            let scriptScrPaths = [], cssSrcPaths = [];
            for (let srcPath of srcPaths) {
                if (Ext.isString(srcPath)) {
                    // @ts-ignore
                    if (srcPath.endWith(".js")) {
                        scriptScrPaths.push(srcPath);
                        // @ts-ignore
                    } else if (srcPath.endWith(".css")) {
                        cssSrcPaths.push(srcPath);
                    }
                } else if (srcPath.type === "js") {
                    scriptScrPaths.push(srcPath.src);
                } else if (srcPath.type === "css") {
                    cssSrcPaths.push(srcPath.src);
                }
            }

            FastExt.Documents.addScripts(scriptScrPaths, () => {
                FastExt.Documents.addStylesheets(cssSrcPaths, () => {
                    FastExt.PluginLoader.loadedPluginMap[pluginCode] = true;
                    callBack();
                });
            });
        }
    }

}