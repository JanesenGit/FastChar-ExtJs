namespace FastExt {
    /**
     * 系统部分功能全局事件监听
     */
    export class Listeners {

        private static _listeners: SystemListener[] = [];

        /**
         * 添加系统事件监听
         * @param listener
         */
        static addListener(listener: SystemListener) {
            this._listeners.push(listener);
        }

        static getListeners() {
            return this._listeners;
        }

        /**
         * 获取系统事件触发句柄
         */
        static getFire(): ListenerFirer {
            return new ListenerFirer();
        }
    }

    /**
     * 事件触发器
     */
    class ListenerFirer implements FastExt.SystemListener {

        private getListeners() {
            return FastExt.Listeners.getListeners();
        }

        private checkMethod(listener: any): boolean {
            return typeof listener === 'function';
        }

        onAfterInitSystem(): void {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onAfterInitSystem)) {
                    listener.onAfterInitSystem();
                }
            }
        }

        onAfterManagerLogin(callback: any): void {
            let realCallback = function () {
                //避免重复回调
                FastExt.Base.runCallBack(callback);
            };
            let runCount = 0;
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onAfterManagerLogin)) {
                    runCount++;
                    listener.onAfterManagerLogin(realCallback);
                }
            }
            if (runCount === 0) {
                callback();
                return
            }
        }

        onBeforeEditorField(field: any, record: any): boolean {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onBeforeEditorField)) {
                    let beforeEditorField = listener.onBeforeEditorField(field, record);
                    if (!beforeEditorField) {
                        return false;
                    }
                }
            }
            return true;
        }

        onBeforeManagerLogin(params: any, callback: any): void {

            let realCallback = function () {
                //避免重复回调
                FastExt.Base.runCallBack(callback);
            };
            let count = 0;
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onBeforeManagerLogin)) {
                    count++;
                    listener.onBeforeManagerLogin(params, realCallback);
                }
            }
            if (count === 0) {
                callback();
                return;
            }
        }

        onSystemReady(): void {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onSystemReady)) {
                    listener.onSystemReady();
                }
            }
        }

        onInitLinkFieldDefaultValue(cmb: any): any {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onInitLinkFieldDefaultValue)) {
                    let onInitLinkFieldDefaultValue = listener.onInitLinkFieldDefaultValue(cmb);
                    if (onInitLinkFieldDefaultValue) {
                        return onInitLinkFieldDefaultValue;
                    }
                }
            }
        }

        onInitLoginPanel(items: any, windowConfig: any): void {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onInitLoginPanel)) {
                    listener.onInitLoginPanel(items, windowConfig);
                }
            }
        }

        onInitSystemHeaderItems(headHandler: FastExt.EventHeadHandler): void {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onInitSystemHeaderItems)) {
                    listener.onInitSystemHeaderItems(headHandler);
                }
            }
        }

        onInitSystemWelcomeItems(indexHandler: EventWelcomeHandler): void {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onInitSystemWelcomeItems)) {
                    listener.onInitSystemWelcomeItems(indexHandler);
                }
            }
        }

        onShowManagerDataLayer(manager: any): void {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onShowManagerDataLayer)) {
                    listener.onShowManagerDataLayer(manager);
                }
            }
        }

        onShowManagerInfo(info: any): void {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onShowManagerInfo)) {
                    listener.onShowManagerInfo(info);
                }
            }
        }

        onShowRoleDataLayer(role: any): void {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onShowRoleDataLayer)) {
                    listener.onShowRoleDataLayer(role);
                }
            }
        }

        onSystemNoticeShow(): void {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onSystemNoticeShow)) {
                    listener.onSystemNoticeShow();
                }
            }
        }

        onExtCreateFilter(key: string, info: FastExt.ComponentInvokeInfo) {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onExtCreateFilter)) {
                    listener.onExtCreateFilter(key, info);
                }
            }
        }

        onEntityGetColumnRender(entity: any, attrName: string): any {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onEntityGetColumnRender)) {
                    let entityGetColumnRender = listener.onEntityGetColumnRender(entity, attrName);
                    if (entityGetColumnRender) {
                        return entityGetColumnRender;
                    }
                }
            }
            return undefined;
        }

        onEntityGetEditorField(entity: any, attrName: string): any {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onEntityGetEditorField)) {
                    let entityGetEditorField = listener.onEntityGetEditorField(entity, attrName);
                    if (entityGetEditorField) {
                        return entityGetEditorField;
                    }
                }
            }
            return undefined;
        }

        onSystemInitMenu(menu: any): boolean {
            for (let listener of this.getListeners()) {
                if (this.checkMethod(listener.onSystemInitMenu)) {
                    let systemInitMenu = listener.onSystemInitMenu(menu);
                    if (!systemInitMenu) {
                        return false;
                    }
                }
            }
            return true;
        }
    }


    /**
     * 系统事件接口
     */
    export interface SystemListener {

        /**
         * 系统渲染完毕，准备就绪
         */
        onSystemReady(): void;

        /**
         * 系统初始化系统结束后，注意：此系统初始化并不是系统布局完成
         */
        onAfterInitSystem(): void;

        /**
         * 当初始化后台登录面板时触发
         * @example
         * function(items,windowConfig){}
         */
        onInitLoginPanel(items: any, windowConfig: any): void;

        /**
         * 当后台管理员登录前触发
         * @example
         * function(params,callback){
         *     //do anything
         *     //必须主动调用，然后继续下步执行
         *     callback();
         * }
         */
        onBeforeManagerLogin(params: any, callback: any): void;

        /**
         * 当后台管理员登录成功后触发
         * @example
         * function(callback){
         *     //do anything
         *     //必须主动调用，然后继续下步执行
         *     callback();
         * }
         */
        onAfterManagerLogin(callback: any): void;


        /**
         * 当在左下角弹出系统通知消息框时触发
         */
        onSystemNoticeShow(): void;


        /**
         * 当初始化【首页】的欢迎面板的组件时触发
         */
        onInitSystemWelcomeItems(indexHandler: EventWelcomeHandler): void;


        /**
         * 当点击右上角管理员按钮查看管理员信息时触发
         */
        onShowManagerInfo(info: any): void;


        /**
         * 当点击管理员角色数据权限配置时触发
         */
        onShowRoleDataLayer(role: any): void;


        /**
         * 当点击管理员数据权限配置时触发
         */
        onShowManagerDataLayer(manager: any): void;


        /**
         * 当初始化linkfield组件的值时触发
         * @return 默认值返回配置对象
         */
        onInitLinkFieldDefaultValue(cmb: any): any;


        /**
         * 当初始化系统头部组件时触发
         */
        onInitSystemHeaderItems(headHandler: EventHeadHandler): void;

        /**
         * 修改字段前 触发
         * @return true允许修改，false拦截修改
         */
        onBeforeEditorField(field: any, record: any): boolean;

        /**
         * 当执行Ext.create方法时触发
         * @param key
         * @param info
         */
        onExtCreateFilter(key: string, info: ComponentInvokeInfo): void;


        /**
         * 当执行entity对象里的getColumnRender方法时触发【注意，此事件仅在调用 FastExt.Entity.getColumnRender】
         * @param entity entity对象
         * @param attrName 属性名
         * @return 函数对象function【返回非null时，拦截entity的方法，反之不拦截】
         */
        onEntityGetColumnRender(entity: any, attrName: string): any;

        /**
         * 当执行entity对象里的getEditorField方法时触发【注意，此事件仅在调用 FastExt.Entity.getEditorField】
         * @param entity entity对象
         * @param attrName 属性名
         * @return 字段对象【返回非null时，拦截entity的方法，反之不拦截】
         */
        onEntityGetEditorField(entity: any, attrName: string): any;

        /**
         * 当初始化系统菜单时触发
         * @param menu
         */
        onSystemInitMenu(menu: any): boolean;

    }

    export interface EventHeadHandler {

        /**
         * 在系统导航栏右侧添加按钮
         */
        addRightButton(button: any): void;


        /**
         * 在系统导航栏左侧添加按钮
         */
        addLeftButton(button: any): void;

    }

    export interface EventWelcomeHandler {

        /**
         * 在首页右侧添加一个组件
         */
        addRightPanel(panel: any): void;


        /**
         * 在首页左侧添加一个组件
         */
        addLeftPanel(panel: any): void;

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
        enable: boolean = true;

        /**
         * 过滤器的唯一标识
         */
        key: string;

        /**
         * 执行Ext.Create所在的方法名称
         */
        method: string;

    }


    /**
     * 组件创建的信息
     */
    export class ComponentInvokeInfo {

        /**
         * 调用对象的方法名称
         */
        method: string;

        /**
         * 组件类型名称
         */
        xtype: string;
        /**
         * 组件创建的配置信息
         */
        config: any;
    }


}
