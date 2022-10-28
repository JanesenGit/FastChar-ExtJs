namespace FastExt {
    /**
     * 系统部分功能全局事件监听
     */
    export class Listeners {
        constructor() {
            //兼容老版本
            FastExt.Listeners.onInitLoginPanel = window["onInitLoginPanel"];
            FastExt.Listeners.onAfterManagerLogin = window["onAfterLogin"] || window["onAfterManagerLogin"];
            FastExt.Listeners.onBeforeManagerLogin = window["onBeforeLogin"] || window["onBeforeManagerLogin"];
            FastExt.Listeners.onSystemNoticeShow = window["onSystemNoticeShow"];
            FastExt.Listeners.onInitSystemWelcomeItems = window["initWelcomeItems"];
            FastExt.Listeners.onInitLinkFieldDefaultValue = window["getLinkFieldDefaultValue"];
        }

        /**
         * 系统初始化系统结束后
         */
        static onAfterInitSystem: () => void;


        /**
         * 系统渲染完毕后
         */
        static onFinishSystem:() => void;

        /**
         * 当初始化后台登录面板时触发
         * @example
         * function(items,windowConfig){}
         */
        static onInitLoginPanel: (items: any, windowConfig: any) => void;

        /**
         * 当后台管理员登录前触发
         * @example
         * function(params,callback){
         *     //do anything
         *     //必须主动调用，然后继续下步执行
         *     callback();
         * }
         */
        static onBeforeManagerLogin: (params: any, callback: any) => void;

        /**
         * 当后台管理员登录成功后触发
         * @example
         * function(callback){
         *     //do anything
         *     //必须主动调用，然后继续下步执行
         *     callback();
         * }
         */
        static onAfterManagerLogin: (callback: any) => void


        /**
         * 当在左下角弹出系统通知消息框时触发
         */
        static onSystemNoticeShow: () => void


        /**
         * 当初始化【首页】的欢迎面板的组件时触发
         */
        static onInitSystemWelcomeItems: (items: any) => void


        /**
         * 当点击右上角管理员按钮查看管理员信息时触发
         */
        static onShowManagerInfo: (info: any) => void


        /**
         * 当初始化linkfield组件的值时触发
         */
        static onInitLinkFieldDefaultValue: (cmb: any) => any;


        /**
         * 当初始化系统头部组件时触发
         */
        static onInitSystemHeaderItems: (items: any) => void


        /**
         * 修改字段前 触发
         */
        static onBeforeEditorField: (field: any, record: any) => boolean


        /**
         * 添加 Ext.create方法构建组件的过滤器
         * @param key 监听的过滤器标识
         * @param filterFunction 过滤函数，参数：info 组件信息
         */
        static addExtCreateFilter(key: string, filterFunction?: (info: ComponentInvokeInfo) => void) {
            FastExt.System.addFilterByEntityCreate(key, filterFunction);
        }

        /**
         * 触发Ext.create的过滤器
         * @param key
         * @param method
         * @param xtype
         * @param config
         */
        static fireExtCreateFilter(key: string, method: string, xtype: string, config: any) {
            let watchFunctions = FastExt.System.extCreateFilter[key];
            if (watchFunctions) {
                for (let j = 0; j < watchFunctions.length; j++) {
                    let watchFunction = watchFunctions[j];
                    if (Ext.isFunction(watchFunction)) {
                        let info = new FastExt.ComponentInvokeInfo();
                        info.method = method;
                        info.xtype = xtype;
                        info.config = config;
                        watchFunction(info);
                    }
                }
            }
        }

    }


    /**
     * Ext.Create过滤器配置
     */
    export class ExtCreateFilter {

        constructor(config?: ExtCreateFilter) {
            if (config) {
                for (let configKey in config) {
                    this[configKey] = config[configKey];
                }
            }
        }

        /**
         * 是否开启过滤拦截
         */
        enable:boolean=true;

        /**
         * 过滤器的唯一标识
         */
        key: string;

        /**
         * 执行Ext.Create所在的方法名称
         */
        method:string;

    }
}
