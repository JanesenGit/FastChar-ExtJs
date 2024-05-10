namespace FastExt{


    /**
     * muuri 相关操作类  https://muuri.dev/
     */
    export class MuuriTool {

        /**
         * muuri.min.js文件的路径
         */
        static muuriJsPath: string = "base/muuri/muuri.min.js";

        /**
         * web-animations.min.js文件的路径
         */
        static webAnimasJsPath: string = "base/muuri/web-animations.min.js";



        /**
         * 绑定到指定的容器布局中，建议该容器布局为：absolute
         * @param container
         * @param muuriConfig
         * @param callback
         */
        static bindToContainer(container, muuriConfig: any, callback) {
            if (container.muuriGrid) {
                callback(container.muuriGrid);
                return;
            }
            let doLoad = function () {
                let targetId = null;
                if (Ext.isFunction(container.getMuuriGridContainerId)) {
                    targetId = container.getMuuriGridContainerId();
                }
                if (Ext.isEmpty(targetId)) {
                    console.warn("Muuri渲染失败！目标ID为空！");
                    return;
                }
                // @ts-ignore
                let grid = new Muuri('#' + targetId, muuriConfig);
                container.muuriGrid = grid;
                callback(grid);
            };
            FastExt.PluginLoader.loadPlugins("MuuriJs", [FastExt.MuuriTool.muuriJsPath, FastExt.MuuriTool.webAnimasJsPath], doLoad);
        }


        /**
         * 绑定container，如果已绑定则移除释放并重新绑定
         * @param container
         * @param muuriConfig
         * @param callback
         */
        static justBindToContainer(container, muuriConfig: any, callback) {
            FastExt.MuuriTool.releaseMuuriGrid(container);
            FastExt.MuuriTool.bindToContainer(container, muuriConfig, callback);
        }

        /**
         * 获取container绑定的muuri的grid对象
         * @param container
         */
        static getMuuriGrid(container) {
            if (container.muuriGrid) {
                return container.muuriGrid;
            }
            return null;
        }


        /**
         * 释放container绑定的muuriGrid
         * @param container
         */
        static releaseMuuriGrid(container) {
            let muuriGrid = FastExt.MuuriTool.getMuuriGrid(container);
            if (muuriGrid) {
                muuriGrid.destroy(true);
                container.muuriGrid = null;
            }
        }


    }


}

