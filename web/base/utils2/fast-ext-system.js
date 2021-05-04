var FastExt;
(function (FastExt) {
    /**
     * 系统对象
     */
    var System = /** @class */ (function () {
        function System() {
        }
        /**
         * 整个FastChar-ExtJs系统是否已初始化
         */
        System.isSystem = function () {
            try {
                if (system && system.init)
                    return true;
            }
            catch (e) {
            }
            return false;
        };
        /**
         * 控制浏览器界面进入全屏
         */
        System.inFullScreen = function () {
        };
        /**
         * 系统最后一次打开的tabId
         */
        System.lastTabId = -1;
        /**
         * 系统全局日期格式
         */
        System.dateFormat = 'Y-m-d H:i:s';
        /**
         * 系统是否已初始化
         */
        System.init = false;
        /**
         * 当前登录的管理员
         */
        System.manager = null;
        /**
         * 系统左侧菜单集合
         */
        System.menus = null;
        /**
         * 系统项目的HTTP地址，系统初始后赋值，例如：http://locahost:8080/fastchartest/
         */
        System.http = null;
        /**
         * 系统项目的根路径，例如：http://localhost:8080/
         */
        System.baseUrl = null;
        /**
         * 图片的正则表达式
         */
        System.regByImage = /\.(jpg|png|gif|jpeg)$/i;
        /**
         * MP4的正则表达式
         */
        System.regByMP4 = /\.(mp4)$/i;
        /**
         * Excel的正则表达式
         */
        System.regByExcel = /\.(xls|xlsx)$/i;
        /**
         * Word正则表达式
         */
        System.regByWord = /\.(doc)$/i;
        /**
         * Text正则表达式
         */
        System.regByText = /\.(txt)$/i;
        /**
         * 系统右侧Tab组件的容器对象
         */
        System.tabPanelContainer = null;
        /**
         * 系统是否已全屏
         */
        System.fullscreen = false;
        return System;
    }());
    FastExt.System = System;
})(FastExt || (FastExt = {}));
