namespace FastExt {

    /**
     * 系统对象
     */
    export class System {

        public static InitHandler: SystemInitializerHandler;

        public static ConfigHandler: SystemConfigHandler;

        public static MenuHandler: SystemMenuHandler;

        public static ThemeHandler: SystemThemeHandler;

        public static AppJsHandler: SystemAppJsHandler;

        public static ManagerHandler: SystemManagerHandler;

        public static EntitiesHandler: SystemEntitiesHandler;

        public static SecurityHandler: SystemSecurityHandler;

        public static ChangelogHandler: SystemChangelogHandler;


        //当fast-ext-utils文件加载时，初始化一次
        public static __onLoaded() {
            System.InitHandler = new SystemInitializerHandler();
            System.ConfigHandler = new SystemConfigHandler();
            System.MenuHandler = new SystemMenuHandler();
            System.ThemeHandler = new SystemThemeHandler();
            System.ManagerHandler = new SystemManagerHandler();
            System.EntitiesHandler = new SystemEntitiesHandler();
            System.AppJsHandler = new SystemAppJsHandler();
            System.SecurityHandler = new SystemSecurityHandler();
            System.ChangelogHandler = new SystemChangelogHandler();

            Ext.on('mousedown', function (e) {
                // FastExt.BaseLayout.setCurrClickTarget(e.target);
                FastExt.SystemLayout.setMouseClickXY(e.getX(), e.getY());
            });
        }

        //必须保留，兼容
        static addTab(component, id, title, icon) {
            FastExt.SystemLayout.showByCmp(component, id, title, icon);
        }

    }

    /**
     * 系统初始化
     */
    class SystemInitializerHandler {
        /**
         * 系统是否已初始化
         */
        private _init: boolean = false;

        /**
         * 是正全局保存grid配置
         */
        private _silenceGlobalSave: boolean = false;

        private _doNextSilenceMenuIndex: number = 0;

        private _allShowListMethodMenu = [];


        /**
         * 整个FastChar-ExtJs系统是否已初始化
         */
        isInit(): boolean {
            try {
                if (this._init) {
                }
                return true;
            } catch (e) {
            }
            return false;
        }

        isSilenceGlobalSaving(): boolean {
            return this._silenceGlobalSave;
        }


        /**
         * 初始化系统配置
         */
        initSystem() {
            Ext.MessageBox.show({
                alwaysOnTop: true,
                modal: true,
                iconCls: "extIcon extTimer",
                title: '系统提醒',
                msg: '初始化系统中，请稍后……',
                progressText: '请耐心等待，即将完成操作',
                progress: true,
                closeAction: 'destroy',
                closable: false
            });
            FastExt.System.ConfigHandler.initConfig(() => {
                FastExt.System.AppJsHandler.loadAppJs(() => {
                    this.initGlobalConfig();
                    this.initSystemLayout();
                });
            });
        }

        /**
         * 初始化系统主题
         * @param callback
         */
        initTheme(callback: any) {
            FastExt.System.MenuHandler.initData();
            FastExt.System.ThemeHandler.loadTheme(callback);
        }


        /**
         * 初始化系统全局配置
         */
        private initGlobalConfig() {
            //配置是否进行权限
            if (FastExt.Power.isPower()) {
                if (window.parent && Ext.isFunction(window.parent["getExtPower"])) {
                    FastExt.Power.config = true;
                    FastExt.Power.powers = FastExt.Json.jsonToObject(window.parent["getExtPower"]());
                    if (!FastExt.Power.powers) {
                        FastExt.Power.powers = {};
                    }
                    FastExt.System.ManagerHandler.setGhostPowers(FastExt.Json.jsonToObject(window.parent["getParentExtPower"]()));

                    //如果父级权限为false，默认同步子管理员为false
                    if (FastExt.System.ManagerHandler.getGhostPowers()) {
                        for (let code in FastExt.Power.powers) {
                            if (FastExt.System.ManagerHandler.getGhostPowers().hasOwnProperty(code)) {
                                let managerPower = FastExt.System.ManagerHandler.getGhostPowers()[code];
                                for (let managerPowerKey in managerPower) {
                                    if (!managerPower[managerPowerKey]) {
                                        FastExt.Power.powers[code][managerPowerKey] = false;
                                    }
                                }
                            }
                        }
                    }

                    window["getExtPower"] = function () {
                        return FastExt.Power.getSavePowerData();
                    };
                }
            }

            //浏览器前进或后退
            window.addEventListener("popstate", function (e) {
                FastExt.SystemLayout.showByMenuId(FastExt.Windows.getMenuIdFromLocation());
            }, false);

            this._init = true;
        }

        /**
         * 初始化系统布局
         * @private
         */
        private initSystemLayout() {
            if (FastExt.System.ConfigHandler.isDesktopLayout()) {
                FastExt.DesktopLayout.showSystemLayout();
            } else {
                FastExt.NormalLayout.showSystemLayout();
            }

            if (FastExt.System.ConfigHandler.isNeedInit()) {
                FastExt.Dialog.hideWait();
                FastExt.System.InitHandler.startSilenceSaveConfig(null, "正在升级当前账户的系统配置");
            }
        }

        checkMaxMemory(callback: any) {
            if (FastExt.System.ConfigHandler.isLowMemory()) {
                FastExt.Dialog.showWarning("当前运行的系统内存过低，建议配置的运行内存不低于1G，否则操作的功能可能出现异常！", callback);
            } else {
                callback();
            }
        }


        /**
         * 启动自动保存Grid配置
         */
        startSilenceSaveConfig(obj?, message?: string) {
            this._allShowListMethodMenu = FastExt.System.MenuHandler.getAllMethodMenu("showList");

            for (let i = 0; i < FastExt.System.EntitiesHandler.getEntities().length; i++) {
                let entity = FastExt.System.EntitiesHandler.getEntities()[i];
                if (!entity.js) {
                    //跳过没有js文件的实体类
                    continue;
                }
                if (Ext.isEmpty(entity.menu)) {//如果Entity未绑定后台菜单，则认为是公共实体类，所有管理员都有权限访问
                    let id = $.md5(entity.entityCode + entity.comment);
                    this._allShowListMethodMenu.push({
                        method: "showList('" + id + "','" + entity.entityCode + "')",
                        icon: "icons/icon_function.svg",
                        text: "",
                        id: id
                    });
                }
            }

            FastExt.SystemLayout.closeAllTab();
            this._silenceGlobalSave = true;
            Ext.MessageBox.show({
                justTop: true,
                modal: true,
                animateTarget: obj,
                title: '系统提醒',
                msg: message ? message : '初始化系统配置',
                iconCls: "extIcon extTimer",
                progressText: '请耐心等待，即将完成操作',
                progress: true,
                closable: false,
                closeAction: "destroy"
            });
            this.doNextSilenceMenu();
        }

        /**
         * 继续执行下个可点击的菜单
         */
        doNextSilenceMenu() {
            if (this._doNextSilenceMenuIndex >= this._allShowListMethodMenu.length) {
                FastExt.Dialog.showAlert("系统提醒", "系统配置已初始化完毕！", () => {
                    this._silenceGlobalSave = false;
                    this._doNextSilenceMenuIndex = 0;
                    FastExt.Listeners.getFire().onAfterInitSystem();
                    FastExt.Windows.reload();
                }, true, true);
                return;
            }
            Ext.MessageBox.updateProgress(parseFloat(String(this._doNextSilenceMenuIndex + 1)) / parseFloat(String(this._allShowListMethodMenu.length)), '正在读取配置中，请耐心等待');
            let menu = this._allShowListMethodMenu[this._doNextSilenceMenuIndex];
            FastExt.SystemLayout.showByMenu(menu);
            this._doNextSilenceMenuIndex = this._doNextSilenceMenuIndex + 1;
        }


    }


    /**
     * 系统全局配置类
     */
    class SystemConfigHandler {

        private _fontSize: string = "14px";

        private _dateFormat: string = 'Y-m-d H:i:s';

        /**
         * Grid管理中的相关查询按钮是否开启
         */
        private _gridDefaultLinkButton = true;

        /**
         * 是否允许grid的列进行记忆复原
         */
        private _gridColumnRestore = true;

        /**
         * 是否显示Grid的序号
         */
        private _gridRowNumber = false;

        /**
         * 是否隐藏Grid的主键列
         */
        private _gridIDColumnHidden = false;

        /**
         * 当离开Grid所在的标签页后，再次返回此标签页时将刷新当前标签页的列表数
         */
        private _gridRefreshData = false;

        /**
         * 是否显示grid列表的详情面板
         * @private
         */
        private _gridDetailsPanel = true;


        /**
         * 在进行管理员权限修改时，是否进行相同角色的判断
         */
        private _managerPowerCheckSameRole = true;


        /**
         * 系统左侧菜单只允许同时展开一个
         */
        private _menuSingleExpand = true;


        initConfig(callBack: any) {

            let me = this;
            let params = {};

            window["showList"] = function (menuId: string, entityCode: string, where: any, config: any) {
                return FastExt.System.AppJsHandler.showList(menuId, entityCode, where, config);
            };
            Ext.Ajax.request({
                url: FastExt.Server.showSysInfoUrl(),
                params: params,
                success: function (response: any) {
                    let result = FastExt.Json.jsonToObject(response.responseText, true);
                    if (result.success) {
                        let data = result.data;
                        for (let key in data) {
                            let value = {value: data[key]};
                            if (FastExt.System.ManagerHandler.initData(key, value.value)) {
                                FastExt.System.MenuHandler.initSystemMenu();
                                continue;
                            }
                            if (FastExt.System.AppJsHandler.initData(key, value.value)) {
                                continue;
                            }
                            if (FastExt.System.EntitiesHandler.initData(key, value.value)) {
                                continue;
                            }
                            me[key] = value;
                        }
                        callBack();
                    } else {
                        console.error(response);
                    }
                },
                failure: function (response, opts) {
                    console.error(response);
                }
            });
        }

        getSystemConfig() {
            return SystemConfig;
        }

        getConfig(name: string) {
            let ext = this.getSystemConfig();
            if (ext.hasOwnProperty(name)) {
                let value = ext[name];
                if (Ext.isObject(value)) {
                    return value;
                }
                return {value: value};
            }
            let obj = this[name];
            if (obj) {
                return obj;
            }
            return {value: ""};
        }


        /**
         * 是否调试模式
         */
        isDebug(): boolean {
            return FastExt.Base.toBool(this.getConfig("debug").value, false);
        }

        /**
         * 是否是本地项目
         */
        isLocal(): boolean {
            return FastExt.Base.toBool(this.getConfig("local").value, false);
        }


        /**
         * 判断系统是否为桌面布局方式
         */
        isDesktopLayout(): boolean {
            let systemLayout = FastExt.Objects.safeObject(this.getConfig("system_layout")).value;
            if (Ext.isEmpty(systemLayout)) {
                return false;
            }
            return systemLayout.toLowerCase() === "desktop";
        }

        isNormalLayout(): boolean {
            let systemLayout = FastExt.Objects.safeObject(this.getConfig("system_layout")).value;
            if (Ext.isEmpty(systemLayout)) {
                return false;
            }
            return systemLayout.toLowerCase() === "normal";
        }

        /**
         * 是否显示数据看板
         */
        isDataboard(): boolean {
            return FastExt.Base.toBool(this.getDataboard().enable, false);
        }

        /**
         * 是否是圆润立体布局
         */
        isThemeWrap() {
            let systemTheme = this.getConfig("theme").value;
            return systemTheme.indexOf("fast-theme-wrap") >= 0
        }

        /**
         * 是否是扁平布局
         */
        isThemeFlat() {
            let systemTheme = this.getConfig("theme").value;
            return systemTheme.indexOf("fast-theme-flat") >= 0
        }


        /**
         * 是否启用标签主题色
         */
        isEnableTabTheme(): boolean {
            let tabTheme = this.getConfig("tab_theme").value;
            return FastExt.Base.toBool(tabTheme, false);
        }

        /**
         * 是否开启了窗体动画
         */
        isEnableWindowAnim(): boolean {
            return FastExt.Base.toBool(this.getConfig("window_anim").value, true)
        }

        /**
         * 是否启用了权限功能
         */
        isEnableLayer(): boolean {
            return FastExt.Base.toBool(this.getConfig("layer").value, false);
        }

        /**
         * 是否启用了绑定相同属性的功能
         */
        isEnableSame(): boolean {
            return FastExt.Base.toBool(this.getConfig("same").value, false);
        }


        /**
         * 是否开启待办事项的实时监听
         */
        isEnableNoticeListener() {
            return FastExt.Base.toBool(this.getConfig("noticeListener").value, false);
        }


        /**
         * 管理员是否启用明文密码
         */
        isEnablePwd(): boolean {

            return FastExt.Base.toBool(this.getConfig("pwd").value, false);
        }

        /**
         * 是否启用了谷歌双重验证器
         */
        isEnableGoogleAuthentication(): boolean {
            return FastExt.Base.toBool(this.getConfig("google_authentication").value, false);
        }

        isNeedInit(): boolean {
            return FastExt.Base.toBool(this.getConfig("needInit").value, false);
        }

        getApiHost(): string {
            return this.getConfig("api-host").value;
        }

        /**
         * 获取java最大运行内存
         */
        getMaxMemory() {
            // 1024.0 * 1024.0 * 1024.0
            return parseInt(this.getConfig("maxMemory").value);
        }

        isLowMemory(): boolean {
            //小于1G
            return this.getMaxMemory() < 1024.0 * 1024.0 * 1024;
        }

        getGridRowHeight(): number {
            return parseInt(this.getConfig("grid_row_height").value);
        }

        getSessionId(): string {
            return this.getConfig("session-id").value;
        }

        getFontSize(): string {
            return this._fontSize;
        }

        getFontSizeNumber(): number {
            return FastExt.Base.getNumberValue(this.getFontSize());
        }

        getFastCharVersion(): string {
            return this.getConfig("fastchar").value;
        }

        getJavaVersion(): string {
            return this.getConfig("java").value;
        }

        getDeveloperUrl(): string {
            return this.getConfig("developer").url;
        }

        getDeveloperTitle(): string {
            return this.getConfig("developer").value;
        }

        getThemeColor(): string {
            return FastExt.Color.toColor(this.getConfig("theme_color").value);
        }

        getFrontColor(): string {
            return FastExt.Color.toColor(this.getConfig("front_color").value);
        }

        getSystemLogo(): string {
            return this.getConfig("system_logo").value;
        }

        getSystemTitle(): string {
            return FastExt.Eval.runObject(this.getSystemConfig(), $("title").text());
        }

        getSystemHttp(): string {
            return this.getConfig("http").value;
        }

        getSystemRoot(): string {
            return this.getConfig("root").value;
        }

        getDesktopBgImages(): string[] {
            return this.getConfig("desktop_bg_images").value;
        }

        setDesktopBgImage(val: string) {
            this.getConfig("desktop-bg-image").value = val;
        }

        getSystemCopyright(): string {
            return this.getConfig("copyright").value;
        }

        getSystemCopyrightUrl(): string {
            return this.getConfig("copyright").url;
        }

        getSystemVersion(): string {
            return this.getConfig("version").desc;
        }

        getSystemVersionInt(): string {
            return this.getConfig("version").value;
        }

        getSystemMenuCss(): string {
            return this.getConfig("menusCss").value;
        }

        getIndexUrl(): string {
            return this.getConfig("index_js").value;
        }

        getLoginBackground(): string {
            return this.getConfig("login_background").value;
        }

        getLoginLottieJson(): string {
            return this.getConfig("login_lottie_json").value;
        }

        getLoginLogo(): string {
            return this.getConfig("login_logo").value;
        }

        getLoginType(): string {
            return this.getConfig("login_type").value;
        }


        getDocsUrl(): string {
            return this.getConfig("doc_extjs").value;
        }

        getDocsTitle(): string {
            return this.getConfig("doc_extjs").desc;
        }

        getLocalhostIP(): string {
            return this.getConfig("host").value;
        }

        getSystemOS(): string {
            return this.getConfig("os").value;
        }

        getSystemStartTime(): string {
            return this.getConfig("start-time").value;
        }

        getSystemDB(): string {
            return this.getConfig("db").value;
        }

        getSystemDBPool(): string {
            return this.getConfig("db-pool").value;
        }

        getSystemServer(): string {
            return this.getConfig("server").value;
        }

        getSystemCatalina(): string {
            return this.getConfig("server").value;
        }


        getGoogleAuthenticationAppDownloadUrl(): string {
            return this.getConfig("google_authentication_app_url").value;
        }


        getAMapSecurity(): string {
            return this.getConfig("amap_security").value;
        }

        getAMapVersion(): string {
            return this.getConfig("amap_version").value;
        }

        getAMapKey(): string {
            return this.getConfig("amap_key").value;
        }


        setFontSize(value: string) {
            this._fontSize = value;
        }

        getDateFormat(): string {
            return this._dateFormat;
        }

        setDateFormat(value: string) {
            this._dateFormat = value;
        }

        isGridDefaultLinkButton(): boolean {
            return this._gridDefaultLinkButton;
        }

        setGridDefaultLinkButton(value: boolean) {
            this._gridDefaultLinkButton = value;
        }


        isManagerPowerCheckSameRole(): boolean {
            return this._managerPowerCheckSameRole;
        }

        setManagerPowerCheckSameRole(value: boolean) {
            this._managerPowerCheckSameRole = value;
        }


        isMenuSingleExpand(): boolean {
            return this._menuSingleExpand;
        }

        setMenuSingleExpand(value: boolean) {
            this._menuSingleExpand = value;
        }


        isEnableDesktopMenuRecord() {
            return FastExt.Base.toBool(this.getConfig("desktop_menu_record").value, true);
        }


        isGridColumnRestore(): boolean {
            return this._gridColumnRestore;
        }

        setGridColumnRestore(value: boolean) {
            this._gridColumnRestore = value;
        }


        isGridRowNumber(): boolean {
            return this._gridRowNumber;
        }

        setGridRowNumber(value: boolean) {
            this._gridRowNumber = value;
        }

        isGridIDColumnHidden(): boolean {
            return this._gridIDColumnHidden;
        }

        setGridIDColumnHidden(value: boolean) {
            this._gridIDColumnHidden = value;
        }

        isGridRefreshData(): boolean {
            return this._gridRefreshData;
        }

        setGridRefreshData(value: boolean) {
            this._gridRefreshData = value;
        }

        getOSSType(): string {
            return this.getConfig("oss").value;
        }

        getOSSHosts(): string[] {
            return this.getConfig("ossHosts").value;
        }

        isGridDetailsPanel(): boolean {
            return this._gridDetailsPanel;
        }

        setGridDetailsPanel(value: boolean) {
            this._gridDetailsPanel = value;
        }

        getDataboard() {
            return this.getConfig("databoard");
        }
    }

    /**
     * 系统菜单相关操作
     */
    class SystemMenuHandler {

        private _menus: any[];

        private _allMenus: any[];

        private _cloneMenus: any[] = [];//复制的菜单集合

        public initData() {
            this._allMenus = FastExt.System.ConfigHandler.getSystemConfig().menu;
            this._initMenu(null, this._allMenus);
            this._allMenus = this._refreshMenu(this._allMenus);
        }


        public initSystemMenu() {
            this._menus = this.getPowerMenuByManager(this._allMenus)
        }

        _insertToFirstParam(method: string, insertParam: string) {
            let regStr = /.*\((.*)\)/;
            const result = method.match(regStr);
            if (result && result.length > 0) {
                insertParam = "'" + insertParam + "'";
                let newParam = insertParam;
                let oldParam = result[1];
                if (oldParam && oldParam.length > 0) {
                    newParam = insertParam + "," + oldParam;
                }
                return method.replace("(" + oldParam + ")", "(" + newParam + ")");
            }
            return method;
        }

        _initMenu(parent: any, menus: any[]) {
            if (!menus) {
                return;
            }
            for (let i = 0; i < menus.length; i++) {
                let menu = menus[i];
                if (Ext.isEmpty(menu.index)) {
                    menu.index = 0;
                }
                menu.iconValue = menu.icon;
                menu.leaf = !(menu.children && menu.children.length > 0);

                if (parent) {
                    menu.parentId = parent.id;
                } else {
                    menu.parentId = "root";
                }
                if (Ext.isString(menu.method)) {
                    menu.method = this._insertToFirstParam(menu.method, menu.id);
                }

                if (parent && parent.id) {
                    menu.id = $.md5(parent.id + "-" + menu.text);
                } else {
                    menu.id = $.md5(menu.text);
                }

                if (parent && Ext.isEmpty(menu.color)) {
                    menu.color = parent.color;
                }

                if (Ext.isEmpty(menu.color) || menu.color === "#theme_color") {
                    menu.color = FastExt.System.ThemeHandler.getThemeColor();
                }

                if (parent && Ext.isEmpty(menu.iconValue)) {
                    menu.iconValue = parent.iconValue;
                }

                if (menu.iconValue) {
                    menu.icon = FastExt.Server.getIcon(menu.iconValue, menu.color);
                }

                menu.baseCls = "baseTab" + $.md5(menu.color) + "Cls";

                this._initMenu(menu, menu.children);
            }
        }

        _refreshMenu(menus: any[]) {
            let sorted = menus.sort((a, b) => {
                return a.index - b.index;
            });

            let holder = {};
            for (let menu of sorted) {
                if (!holder[menu.id]) {
                    holder[menu.id] = {};
                }
                holder[menu.id] = FastExt.Json.deepMergeJson(holder[menu.id], menu);
            }
            for (let holderKey in holder) {
                let entry = holder[holderKey];
                if (entry.children && entry.children.length > 0) {
                    entry.children = this._refreshMenu(entry.children);
                }
            }
            return Ext.Object.getValues(holder);
        }


        getPowerMenuByManager(menus: any[]) {
            if (!menus) {
                return [];
            }
            let hasPowerMenu = [];
            let managerMenuPower = FastExt.System.ManagerHandler.getManagerMenuPower();
            for (let menu of menus) {
                if (!FastExt.Listeners.getFire().onSystemInitMenu(menu)) {
                    continue;
                }
                let newMenu = Ext.clone(menu);

                let hasPower = false;
                if (FastExt.Power.isPower()) {
                    if (window.parent && Ext.isFunction((<any>window.parent).getMenuPower)) {
                        managerMenuPower = (<any>window.parent).getMenuPower();
                    }
                    hasPower = managerMenuPower.indexOf(newMenu.id) >= 0;
                } else {
                    hasPower = FastExt.System.ManagerHandler.isSuperRole() || managerMenuPower.indexOf(newMenu.id) >= 0;
                }

                if (hasPower) {
                    hasPowerMenu.push(newMenu);
                    newMenu.children = this.getPowerMenuByManager(newMenu.children);
                }
            }
            return hasPowerMenu;
        }


        getPowerMenuByConfig(menus: any[], menuChecked: string, menuPower: string) {
            if (!menus) {
                return [];
            }
            let hasPowerMenu = [];
            for (let menu of menus) {
                let newMenu = Ext.clone(menu);
                if (!FastExt.Base.toBool(newMenu.power, true)) {
                    //菜单不需要权限配置
                    continue;
                }

                if (!menuPower || menuPower.indexOf(newMenu.id) >= 0) {
                    newMenu.checked = menuChecked && menuChecked.indexOf(newMenu.id) >= 0;
                    newMenu.children = this.getPowerMenuByConfig(newMenu.children, menuChecked, menuPower);
                    newMenu.leaf = newMenu.children.length === 0;
                    hasPowerMenu.push(newMenu);
                }
            }
            return hasPowerMenu;
        }


        /**
         * 获取当前账号有权限的菜单
         */
        getMenus(): any[] {
            return this._menus;
        }

        /**
         * 获取系统所有菜单
         */
        getAllMenus(): any[] {
            return this._allMenus;
        }

        isValid(): boolean {
            return this._menus != null;
        }


        /**
         * 根据菜单ID查找菜单对象，格式化包含了parent
         * @param menuId 菜单ID
         */
        getMenu(menuId: string): any {
            return this.getMenuData(menuId);
        }

        /**
         * 根据中文菜单层级获取最终的菜单对象
         * @param menuLevelPath 菜单层级，例如：用户中心>用户管理
         */
        findMenu(menuLevelPath: string): any {
            menuLevelPath = menuLevelPath.replace(" ", "");
            let menuText = menuLevelPath.split('>');
            let getMenuByText = function (menus: any[], findMenuText: string) {
                for (let i = 0; i < menus.length; i++) {
                    let menu = menus[i];
                    if (menu.text === findMenuText) {
                        return Ext.clone(menu);
                    }
                    if (menu.children) {
                        let childMenu = getMenuByText(menu.children, findMenuText);
                        if (childMenu != null) {
                            return childMenu;
                        }
                    }
                }
                return null;
            };
            let currSource = this.getMenus();
            for (let i = 0; i < menuText.length; i++) {
                let text = menuText[i];
                let _findMenu = getMenuByText(currSource, text);
                if (_findMenu) {
                    if (i === menuText.length - 1) {
                        return _findMenu;
                    }
                    currSource = _findMenu.children;
                    continue;
                }
                return null;
            }
            return null;
        }

        /**
         * 克隆一个菜单，并记录到当前缓存中
         * @param menuId
         */
        cloneMenu(menuId: string): any {
            if (Ext.isEmpty(menuId)) {
                return null;
            }
            let closeMenuData = this.getMenuDataBySource(this.getMenus(), menuId);
            closeMenuData.id = FastExt.Base.buildOnlyCode("CM");
            closeMenuData._clone = true;
            this._cloneMenus.push(closeMenuData);
            return closeMenuData;
        }


        getMenuData(menuId: string): any {
            if (Ext.isEmpty(menuId)) {
                return null;
            }
            let menuDataBySource = this.getMenuDataBySource(this._cloneMenus, menuId);
            if (menuDataBySource) {
                return menuDataBySource;
            }
            return this.getMenuDataBySource(this.getMenus(), menuId);
        }


        /**
         * 根据menuId 获取menu数据对象
         * @param sourceMenus
         * @param menuId
         */
        private getMenuDataBySource(sourceMenus: any[], menuId: string): any {
            if (!menuId) {
                return null;
            }
            let getMenuById = function (parent: any, menus: any[], findMenuId: string) {
                for (let i = 0; i < menus.length; i++) {
                    let menu = menus[i];
                    if (menu.id === findMenuId) {
                        return Ext.clone(menu);
                    }
                    if (menu.children) {
                        let childMenu = getMenuById(menu, menu.children, findMenuId);
                        if (childMenu != null) {
                            return childMenu;
                        }
                    }
                }
                return null;
            };
            return getMenuById(null, sourceMenus, menuId);
        }


        /**
         * 获取菜单直观路径
         * @param menu 菜单对象
         * @param splitChar 菜单拼接的分隔符
         */
        getPlainMenu(menu: any, splitChar?: string): string {
            if (Ext.isEmpty(splitChar)) {
                splitChar = ">";
            }
            if (menu) {
                if (menu.parentId && menu.parentId.toLowerCase() !== "root") {
                    let storeMenuText = this.getPlainMenu(this.getMenu(menu.parentId), splitChar);
                    if (storeMenuText) {
                        return storeMenuText + splitChar + menu.text;
                    }
                }
                return menu.text;
            }
            return "";
        }

        /**
         * 获取菜单数组，包含了父类
         * @param menu 菜单对象
         */
        getPathMenu(menu: any): any[] {
            if (menu) {
                if (menu.parentId && menu.parentId.toLowerCase() !== "root") {
                    let pathMenus = this.getPathMenu(this.getMenu(menu.parentId));
                    if (pathMenus) {
                        pathMenus.push(menu);
                        return pathMenus;
                    }
                }
                return [menu];
            }
            return null;
        }

        /**
         * 获取菜单直观路径 带图标的
         * @param menu
         * @param splitChar
         */
        getPlainIconMenu(menu: any, splitChar?: string): string {
            let menuArray = this.getPathMenu(menu);
            let menuIconHtml = "<div style=\"line-height: 20px;display: flex;padding: 0 5px;\" >";
            for (let i = 0; i < menuArray.length; i++) {
                let targetMenu = menuArray[i];

                let itemHtml = "<img alt='' src=\"" + targetMenu.icon + "\" width=\"20px\" height=\"20px\" />" +
                    "<span style=\"margin-left: 5px;\">" + targetMenu.text + "</span> ";
                if (i != 0) {
                    itemHtml = "<span style='font-size: 12px;margin: 0 5px;color: #cccccc;' class='extIcon extArrowRight2'></span>" + itemHtml;
                }
                menuIconHtml += itemHtml;
            }
            menuIconHtml += "</div>";
            return menuIconHtml;
        }

        /**
         * 获取菜单直观路径 带图标的
         * @param menu
         * @param closeActionFunctionStr 点击关闭的函数名
         * @param splitChar
         */
        getPlainIconMenuWithCloser(menu: any, closeActionFunctionStr: string, splitChar?: string): string {
            let menuArray = this.getPathMenu(menu);
            let menuIconHtml = "<div style=\"line-height: 20px;display: flex;padding: 0 5px;\" >";
            for (let i = 0; i < menuArray.length; i++) {
                let targetMenu = menuArray[i];
                let itemHtml = "<img alt='' src=\"" + targetMenu.icon + "\" width=\"20px\" height=\"20px\" />" +
                    "<span style=\"margin-left: 5px;\">" + targetMenu.text + "</span> ";
                if (i != 0) {
                    itemHtml = "<span style='font-size: 12px;margin: 0 5px;color: #cccccc;' class='extIcon extArrowRight2'></span>" + itemHtml;
                }
                menuIconHtml += itemHtml;
            }
            let closerHtml = "<span class='extIcon extClose fast-ext-menu-closer' ></span>";
            menuIconHtml += "&nbsp;&nbsp;" + FastExt.Documents.wrapOnClick(closerHtml, closeActionFunctionStr) + "</div>";
            return menuIconHtml;
        }


        /**
         * 获取带图标的文字信息
         * @param menu
         */
        getPlainIconMenuHtmlBySVG(menu: any) {
            return "<div style=\"line-height: 20px;display: flex\" ><svg style='width: 20px;height: 20px;' class=\"svgIconFill\" aria-hidden=\"true\"><use xlink:href=\"#" + menu.iconCls + "\"></use></svg>" +
                "<span style=\"margin-left: 5px;\">" + menu.text + "</span></div> ";
        }


        /**
         * 判断是否存在某个菜单
         * @param menuId
         */
        existMenu(menuId: string) {
            if (Ext.isEmpty(menuId)) {
                return false;
            }
            return this.getMenu(menuId) != null;
        }


        /**
         * 根据实体编号搜索左侧最近的菜单对象
         * @param entityCode
         */
        searchMenuByEntityCode(entityCode: string) {
            let filterMenu = function (menuArray) {
                if (!menuArray) {
                    return null;
                }
                for (let i = 0; i < menuArray.length; i++) {
                    let menu = menuArray[i];
                    if (menu.method && menu.method.indexOf(entityCode) >= 0) {
                        return menu;
                    }
                    if (menu.children) {
                        let result = filterMenu(menu.children);
                        if (result) {
                            return result;
                        }
                    }
                }
                return null;
            };
            return filterMenu(this.getMenus());
        }


        /**
         * 根据实体编号搜索左侧菜单对象集合
         * @param entityCode
         */
        searchMenusByEntityCode(entityCode: string) {
            let filterMenu = function (menuArray: any) {
                let menus = [];
                if (!menuArray) {
                    return null;
                }
                for (let i = 0; i < menuArray.length; i++) {
                    let menu = menuArray[i];
                    if (menu.method && menu.method.indexOf(entityCode) >= 0) {
                        menus.push(menu);
                    }
                    if (menu.children) {
                        let result = filterMenu(menu.children);
                        if (result) {
                            menus = menus.concat(result);
                        }
                    }
                }

                return menus;
            };
            return filterMenu(this.getMenus());
        }

        /**
         * 获取所有可点击方法的菜单集合
         * @param filterKey 过滤指定方法名
         * @return menu[]
         */
        getAllMethodMenu(filterKey?): any[] {
            if (Ext.isEmpty(filterKey)) {
                filterKey = "";
            }
            let filterMenu = function (parentMenus, menuArray) {
                if (!parentMenus) {
                    return;
                }
                for (let i = 0; i < parentMenus.length; i++) {
                    let menu = parentMenus[i];
                    if (menu.method && menu.method.indexOf(filterKey) >= 0) {
                        menuArray.push(menu);
                    }
                    filterMenu(menu.children, menuArray);
                }
            };
            let menuArray = [];
            filterMenu(this.getMenus(), menuArray);
            return menuArray;
        }


    }


    /**
     * 系统主题色
     */
    class SystemThemeHandler {

        /**
         * 加载主题css内容
         * @param callback
         */
        loadTheme(callback: any) {
            let theme = {};

            let baseThemeTemp = FastExt.System.ConfigHandler.getConfig("theme").value + ".temp";
            let menuThemeTemp = FastExt.System.ConfigHandler.getConfig("theme").value + "-tab.temp";

            FastExt.PluginLoader.loadFiles([baseThemeTemp, menuThemeTemp], (content) => {
                let themeContents = [FastExt.Theme.buildThemeContent(content[0], ".fastchar-extjs", this.getThemeColor())];
                let menuThemes = [];

                let initMenuTheme = (menus: any[]) => {
                    if (!menus) {
                        return;
                    }
                    for (let i = 0; i < menus.length; i++) {
                        let menu = menus[i];
                        if (menuThemes.indexOf(menu.baseCls) < 0) {
                            themeContents.push(FastExt.Theme.buildThemeContent(content[1], ".fastchar-extjs ." + menu.baseCls, menu.color));
                        }
                        initMenuTheme(menu.children);
                    }
                };
                initMenuTheme(FastExt.System.MenuHandler.getAllMenus());
                FastExt.Documents.addStyles(themeContents, callback);
            });

        }


        getThemeColor() {
            return FastExt.System.ConfigHandler.getThemeColor();
        }

        getFrontColor() {
            return FastExt.System.ConfigHandler.getFrontColor();
        }


    }


    /**
     * 系统管理员对象
     */
    class SystemManagerHandler {

        public initData(key: string, value: any): boolean {
            if (key === "manager") {
                this._manager = value;
                return true;
            }
            return false;
        }


        private _manager: any;

        //临时的权限值，一般用于权限配置时设置
        private _ghostPowers: any;

        setManager(data: any) {
            this._manager = data;
        }

        getManager() {
            return this._manager;
        }

        setGhostPowers(data: any) {
            this._ghostPowers = data;
        }

        getGhostPowers() {
            return this._ghostPowers;
        }

        isValid(): boolean {
            return this._manager;
        }

        getManagerId(): number {
            if (this._manager) {
                return this._manager["managerId"];
            }
            return -1;
        }


        getManagerName(): string {
            if (this._manager) {
                return this._manager["managerName"];
            }
            return "";
        }

        getManagerLoginName(): string {
            if (this._manager) {
                return this._manager["managerLoginName"];
            }
            return "";
        }

        getManagerStateStr(): string {
            if (this._manager) {
                return this._manager["managerStateStr"];
            }
            return "";
        }

        getRoleId(): number {
            if (this._manager) {
                return this._manager["roleId"];
            }
            return -1;
        }

        getRole(): any | undefined {
            if (this._manager) {
                return this._manager["role"];
            }
            return undefined;
        }

        getRoleName(): string {
            if (this.getRole()) {
                return this.getRole()["roleName"];
            }
            return "";
        }

        getRoleTypeStr(): string {
            if (this.getRole()) {
                return this.getRole()["roleTypeStr"];
            }
            return "";
        }

        getRoleType(): number {
            if (this.getRole()) {
                return this.getRole()["roleType"];
            }
            return -1;
        }

        getRoleStateStr(): string {
            if (this.getRole()) {
                return this.getRole()["roleStateStr"];
            }
            return "";
        }


        getOnlineTypeStr(): string {
            if (this._manager) {
                return this._manager["onlineTypeStr"];
            }
            return "";
        }

        getLastLoginTime(): string {
            if (this._manager) {
                return this._manager["lastLoginTime"];
            }
            return "";
        }

        getManagerExtPower(): string {
            if (this._manager) {
                return this._manager["managerExtPower"];
            }
            return "";
        }

        getManagerMenuPower(): string {
            if (this._manager) {
                return this._manager["managerMenuPower"];
            }
            return "";
        }

        /**
         * 判断当前管理是否是超级管理员角色
         */
        isSuperRole(): boolean {
            if (this._manager && this._manager.role) {
                if (this._manager.role.roleType === 0) {//拥有最大权限
                    return true;
                }
            }
            return false;
        }
    }


    /**
     * 系统实体类
     */
    class SystemEntitiesHandler {
        public initData(key: string, value: any): boolean {
            if (key === "entities") {
                this._entities = value;
                return true;
            }
            return false;
        }

        private _entities: any[] = [];

        getEntities() {
            return this._entities;
        }

        isValid(): boolean {
            return this._entities != null;
        }

        /**
         * 根据实体编号获取实体对象
         * @param entity
         */
        getEntity(entity: any) {
            if (Ext.isEmpty(entity)) {
                return null;
            }
            let me = this;
            let entityCode = entity;
            if (Ext.isObject(entity)) {
                entityCode = entity.entityCode;
            }
            let entities = this.getEntities();
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                if (entity.entityCode === entityCode) {
                    return entity;
                }
            }
            return null;
        }
    }


    /**
     * 系统appjs相关
     */
    class SystemAppJsHandler {


        public initData(key: string, value: any): boolean {
            if (key === "app") {
                this._app = value;
                return true;
            }
            return false;
        }

        private _app = [];

        //entity属性值字符较大的跳过
        private _big_data_entity_attrs = ["linkTables"];

        /**
         * 获取系统所有菜单
         */
        getApps() {
            return this._app;
        }

        isValid(): boolean {
            return this._app != null;
        }


        /**
         * 加载系统的AppJs文件
         */
        loadAppJs(callback: any) {
            this.loadAppJsByCallback(0, callback);
        }

        /**
         * 加载系统app文件夹的js
         * @param index
         * @param callback
         */
        private loadAppJsByCallback(index: number, callback: any) {
            if (index >= this._app.length) {
                this.initAppJsProperty();
                callback();
                return;
            }
            if (index >= this._app.length - 2) {
                Ext.MessageBox.updateProgress(1, '资源加载结束', '系统初始化成功，正在进入系统……');
            } else {
                Ext.MessageBox.updateProgress(parseFloat(String(index + 1)) / parseFloat(String(this._app.length)), '资源加载中，请耐心等待');
            }
            FastExt.Documents.addScript({src: this._app[index]}, () => {
                this.loadAppJsByCallback(index + 1, callback);
            });
        }

        /**
         * 初始化AppJs的默认属性值
         * @param fromObject js对象
         * @param entityCode 实体编号
         */
        initEntityProperty(fromObject: any, entityCode: string) {
            if (!fromObject) {
                return;
            }
            if (fromObject.__initedCoreProperty) {
                return;
            }
            fromObject.__initedCoreProperty = true;
            let entity = FastExt.System.EntitiesHandler.getEntity(entityCode);
            if (entity) {
                for (let key in entity) {
                    if (this._big_data_entity_attrs.indexOf(key) >= 0) {
                        continue;
                    }
                    fromObject[key] = entity[key];
                }
                fromObject["getListThisVarName"] = "me";
                fromObject["getListGridVarName"] = "grid";
            }
        }

        /**
         * 初始化AppJs的默认属性值
         */
        private initAppJsProperty() {
            //将返回的entity属性配置entity对应的JS对象中
            let entities = FastExt.System.EntitiesHandler.getEntities();
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                try {
                    let pro = eval(entity.entityCode + ".prototype");
                    if (pro) {
                        pro["__initedCoreProperty"] = true;
                        for (let key in entity) {
                            if (this._big_data_entity_attrs.indexOf(key) >= 0) {
                                continue;
                            }
                            pro[key] = entity[key];
                        }

                        entity.js = true;

                        let getList = eval("new " + entity.entityCode + "().getList");
                        if (getList) {
                            let getListFunctionStr = getList.toString();

                            let result = new RegExp("let (\\w+)[ ]?=[ ]?this[,; ]?").exec(getListFunctionStr);
                            if (result) {
                                pro["getListThisVarName"] = result[1];
                            } else {
                                pro["getListThisVarName"] = "me";
                            }

                            result = new RegExp("[let,]?[ ]?(\\w+)[ ]?=[ ]?Ext.create\\((['\"])Ext.grid.Panel\\2").exec(getListFunctionStr);
                            if (result) {
                                pro["getListGridVarName"] = result[1];
                            } else {
                                pro["getListGridVarName"] = "grid";
                            }
                        }
                    }
                } catch (e) {
                    entity.js = false;
                }
            }
        }


        /**
         * 显示实体列表数据管理界面
         * @param menuId 菜单Id
         * @param entityCode 实体编号
         * @param where 筛选条件
         * @param config 配置
         */
        showList(menuId: string, entityCode: string, where, config) {
            if (!Ext.isString(menuId)) {
                throw "操作失败！参数menuId必须为String类型！请检查调用showList方法的相关功能！";
            }
            if (!Ext.isString(entityCode)) {
                throw "操作失败！参数entityCode必须为String类型！请检查调用showList方法的相关功能！";
            }
            if (!Ext.isEmpty(where)) {
                if (!Ext.isObject(where)) {
                    throw "操作失败！参数where必须为Object对象类型！请检查调用showList方法的相关功能！";
                }
            }
            let entity = FastExt.System.EntitiesHandler.getEntity(entityCode);
            if (!entity) {
                throw "操作失败！未获取到 '" + entityCode + "' 实体类！请检查实体类关联的表格是否存在！";
            }
            if (!where) {
                where = {};
            }
            let entityJsObj = eval("new " + entityCode + "()");
            entityJsObj.menu = FastExt.System.MenuHandler.getMenu(menuId);
            if (config) {
                return entityJsObj.getList(where, config);
            }
            return entityJsObj.getList(where);
        }

    }

    /**
     * rsa加密相关工具
     */
    class SystemSecurityHandler {

        _securityCode: string;

        getSecurityCode(): string {
            return this._securityCode;
        }

        setSecurityCode(securityCode: string) {
            this._securityCode = securityCode;
        }


        /**
         * 登录安全验证使用 函数内容的base64
         */
        loginPublicKey: string = "ZnVuY3Rpb24oKXsKY29uc3QgXzB4MzY3YjQ0PV8weDEzN2Y7KGZ1bmN0aW9uKF8weDI5MzRiNyxfMHgyOTA3MTIpe2NvbnN0IF8weDExYjJmNz1fMHgxMzdmLF8weDFmOTcyMj1fMHgyOTM0YjcoKTt3aGlsZSghIVtdKXt0cnl7Y29uc3QgXzB4MjliN2Q5PS1wYXJzZUludChfMHgxMWIyZjcoMHgxMTcpKS8weDErLXBhcnNlSW50KF8weDExYjJmNygweDExNSkpLzB4MioocGFyc2VJbnQoXzB4MTFiMmY3KDB4MTExKSkvMHgzKSstcGFyc2VJbnQoXzB4MTFiMmY3KDB4MTFkKSkvMHg0Ky1wYXJzZUludChfMHgxMWIyZjcoMHgxMGEpKS8weDUrcGFyc2VJbnQoXzB4MTFiMmY3KDB4MTEwKSkvMHg2Ky1wYXJzZUludChfMHgxMWIyZjcoMHgxMTIpKS8weDcrLXBhcnNlSW50KF8weDExYjJmNygweDEwYykpLzB4OCooLXBhcnNlSW50KF8weDExYjJmNygweDExOSkpLzB4OSk7aWYoXzB4MjliN2Q5PT09XzB4MjkwNzEyKWJyZWFrO2Vsc2UgXzB4MWY5NzIyWydwdXNoJ10oXzB4MWY5NzIyWydzaGlmdCddKCkpO31jYXRjaChfMHg1NTI5OTApe18weDFmOTcyMlsncHVzaCddKF8weDFmOTcyMlsnc2hpZnQnXSgpKTt9fX0oXzB4MzYxMywweDljODA0KSk7bGV0IHJlc3VsdD13aW5kb3dbXzB4MzY3YjQ0KDB4MTA5KStGYXN0RXh0W18weDM2N2I0NCgweDEwYildW18weDM2N2I0NCgweDExYSldW18weDM2N2I0NCgweDExNCldKCldKCkscmVzdWx0SW5kZXg9d2luZG93W18weDM2N2I0NCgweDEwZCkrRmFzdEV4dFtfMHgzNjdiNDQoMHgxMGIpXVtfMHgzNjdiNDQoMHgxMWEpXVtfMHgzNjdiNDQoMHgxMTQpXSgpXSgpLHZhbHVlcz1FeHRbXzB4MzY3YjQ0KDB4MTE4KV1bXzB4MzY3YjQ0KDB4MTE2KV1bXzB4MzY3YjQ0KDB4MTBlKV0ocmVzdWx0KVtfMHgzNjdiNDQoMHgxMWMpXSgnfCcpLEFTQ0lJPVtdO2Z1bmN0aW9uIF8weDEzN2YoXzB4M2I3YWJhLF8weDE1MTJiNyl7Y29uc3QgXzB4MzYxM2UxPV8weDM2MTMoKTtyZXR1cm4gXzB4MTM3Zj1mdW5jdGlvbihfMHgxMzdmMTksXzB4NDQwNWM0KXtfMHgxMzdmMTk9XzB4MTM3ZjE5LTB4MTA5O2xldCBfMHgzOTFjYjg9XzB4MzYxM2UxW18weDEzN2YxOV07cmV0dXJuIF8weDM5MWNiODt9LF8weDEzN2YoXzB4M2I3YWJhLF8weDE1MTJiNyk7fWZ1bmN0aW9uIF8weDM2MTMoKXtjb25zdCBfMHg0MDljOTc9WydfX2ExJywnNTAwNTUyNUdZSEdEZicsJ1N5c3RlbScsJzcwNzg5NlFLZnNwSScsJ19fYTInLCdkZWNvZGUnLCdwdXNoJywnMjk5NjQ0MnFjVGx4bScsJzM5OWFZQUNQaycsJzI3NjY4MmptUEtVQScsJ2Zyb21DaGFyQ29kZScsJ2dldFNlY3VyaXR5Q29kZScsJzEyNzgyWVloeVl3JywnQmFzZTY0JywnMzUzNjYxdkNtRFN5JywndXRpbCcsJzM2OVhocmNBYycsJ1NlY3VyaXR5SGFuZGxlcicsJ2pvaW4nLCdzcGxpdCcsJzQ5NjgyMDRrSXhxcWknXTtfMHgzNjEzPWZ1bmN0aW9uKCl7cmV0dXJuIF8weDQwOWM5Nzt9O3JldHVybiBfMHgzNjEzKCk7fWZvcihsZXQgaW5kZXggb2YgcmVzdWx0SW5kZXgpe0FTQ0lJWydwdXNoJ10oRXh0W18weDM2N2I0NCgweDExOCldW18weDM2N2I0NCgweDExNildW18weDM2N2I0NCgweDEwZSldKHZhbHVlc1tpbmRleF0pKTt9bGV0IHN0cmluZ1ZhbHVlcz1bXTtmb3IobGV0IGFzY2lpRWxlbWVudCBvZiBBU0NJSSl7c3RyaW5nVmFsdWVzW18weDM2N2I0NCgweDEwZildKFN0cmluZ1tfMHgzNjdiNDQoMHgxMTMpXShhc2NpaUVsZW1lbnQpKTt9cmV0dXJuIHN0cmluZ1ZhbHVlc1tfMHgzNjdiNDQoMHgxMWIpXSgnJyk7Cn0=";

        /**
         * 请求token使用 函数内容的base64
         */
        tokenPublicKey: string = "ZnVuY3Rpb24oKXsKY29uc3QgXzB4MzMyMmY5PV8weDE4ZWY7ZnVuY3Rpb24gXzB4MThlZihfMHg1MTJkZjEsXzB4MzA1ZWEyKXtjb25zdCBfMHgyOGMzYWM9XzB4MjhjMygpO3JldHVybiBfMHgxOGVmPWZ1bmN0aW9uKF8weDE4ZWYzZixfMHg1MzM1MTMpe18weDE4ZWYzZj1fMHgxOGVmM2YtMHgxN2U7bGV0IF8weDdkYzQ5OT1fMHgyOGMzYWNbXzB4MThlZjNmXTtyZXR1cm4gXzB4N2RjNDk5O30sXzB4MThlZihfMHg1MTJkZjEsXzB4MzA1ZWEyKTt9KGZ1bmN0aW9uKF8weDQ5MTgyYSxfMHgzM2VkYTUpe2NvbnN0IF8weDVhYTcxND1fMHgxOGVmLF8weDE2MzczYz1fMHg0OTE4MmEoKTt3aGlsZSghIVtdKXt0cnl7Y29uc3QgXzB4ZDE4ZTI5PXBhcnNlSW50KF8weDVhYTcxNCgweDE4MykpLzB4MStwYXJzZUludChfMHg1YWE3MTQoMHgxOGQpKS8weDIrLXBhcnNlSW50KF8weDVhYTcxNCgweDE4MSkpLzB4MyooLXBhcnNlSW50KF8weDVhYTcxNCgweDE5MCkpLzB4NCkrcGFyc2VJbnQoXzB4NWFhNzE0KDB4MThiKSkvMHg1KigtcGFyc2VJbnQoXzB4NWFhNzE0KDB4MTgwKSkvMHg2KSstcGFyc2VJbnQoXzB4NWFhNzE0KDB4MThjKSkvMHg3Ky1wYXJzZUludChfMHg1YWE3MTQoMHgxODUpKS8weDgqKC1wYXJzZUludChfMHg1YWE3MTQoMHgxODQpKS8weDkpKy1wYXJzZUludChfMHg1YWE3MTQoMHgxN2YpKS8weGEqKHBhcnNlSW50KF8weDVhYTcxNCgweDE4ZSkpLzB4Yik7aWYoXzB4ZDE4ZTI5PT09XzB4MzNlZGE1KWJyZWFrO2Vsc2UgXzB4MTYzNzNjWydwdXNoJ10oXzB4MTYzNzNjWydzaGlmdCddKCkpO31jYXRjaChfMHg3NWEyMzYpe18weDE2MzczY1sncHVzaCddKF8weDE2MzczY1snc2hpZnQnXSgpKTt9fX0oXzB4MjhjMywweDMyMzExKSk7bGV0IHJlc3VsdD13aW5kb3dbJ19fYjEnK0Zhc3RFeHRbXzB4MzMyMmY5KDB4MThmKV1bJ1NlY3VyaXR5SGFuZGxlciddWydnZXRTZWN1cml0eUNvZGUnXSgpXSgpLHJlc3VsdEluZGV4PXdpbmRvd1tfMHgzMzIyZjkoMHgxODkpK0Zhc3RFeHRbXzB4MzMyMmY5KDB4MThmKV1bJ1NlY3VyaXR5SGFuZGxlciddW18weDMzMjJmOSgweDE4MildKCldKCksdmFsdWVzPUV4dFtfMHgzMzIyZjkoMHgxODcpXVtfMHgzMzIyZjkoMHgxODgpXVtfMHgzMzIyZjkoMHgxODYpXShyZXN1bHQpW18weDMzMjJmOSgweDE3ZSldKCd8JyksQVNDSUk9W107Zm9yKGxldCBpbmRleCBvZiByZXN1bHRJbmRleCl7QVNDSUlbXzB4MzMyMmY5KDB4MThhKV0oRXh0Wyd1dGlsJ11bJ0Jhc2U2NCddWydkZWNvZGUnXSh2YWx1ZXNbaW5kZXhdKSk7fWxldCBzdHJpbmdWYWx1ZXM9W107Zm9yKGxldCBhc2NpaUVsZW1lbnQgb2YgQVNDSUkpe3N0cmluZ1ZhbHVlc1sncHVzaCddKFN0cmluZ1snZnJvbUNoYXJDb2RlJ10oYXNjaWlFbGVtZW50KSk7fWZ1bmN0aW9uIF8weDI4YzMoKXtjb25zdCBfMHgyNzA0YTc9WycxOTM1SUlCckx6JywnNDY4OERnUlRIZicsJ2RlY29kZScsJ3V0aWwnLCdCYXNlNjQnLCdfX2IyJywncHVzaCcsJzE3MHB5Um5xYicsJzI3OTg3NjhKUXduUG8nLCczODczNzJnbVZYSEknLCcyMTk2MzdLTkhwbVMnLCdTeXN0ZW0nLCc0WVRTZ0RpJywnc3BsaXQnLCcxMzBrellpRkonLCcxMzJlc0R0WFonLCc5OTcwNzd5SENmdkUnLCdnZXRTZWN1cml0eUNvZGUnLCcyMTM2OTNMcU5JTkUnXTtfMHgyOGMzPWZ1bmN0aW9uKCl7cmV0dXJuIF8weDI3MDRhNzt9O3JldHVybiBfMHgyOGMzKCk7fXJldHVybiBzdHJpbmdWYWx1ZXNbJ2pvaW4nXSgnJyk7Cn0=";

        /**
         * 登录安全验证 函数的base64
         */
        loginSign: string = "ZnVuY3Rpb24ocHVibGljS2V5LCBwYXJhbXMpIHsKICAgIGxldCBwYXJhbUFycmF5ID0gW107CiAgICBjb25zdCBrZXlzQXJyID0gT2JqZWN0LmtleXMocGFyYW1zKTsKICAgIGtleXNBcnIuc29ydCgpOwogICAgZm9yIChsZXQga2V5IG9mIGtleXNBcnIpIHsKICAgICAgICBwYXJhbUFycmF5LnB1c2goa2V5ICsgIj0iICsgJC5tZDUocGFyYW1zW2tleV0gKyAiIikpOwogICAgfQogICAgbGV0IHBhcmFtUGxhaW4gPSBwYXJhbUFycmF5LmpvaW4oIiYiKTsKICAgIGxldCBiYXNlNjRDb250ZW50ID0gRXh0LnV0aWwuQmFzZTY0LmVuY29kZShwYXJhbVBsYWluKTsKICAgIGxldCBlbmNyeXB0ID0gbmV3IEpTRW5jcnlwdCgpOwogICAgZW5jcnlwdC5zZXRQdWJsaWNLZXkocHVibGljS2V5KTsKCiAgICBsZXQgY29udGVudCA9ICQubWQ1KGJhc2U2NENvbnRlbnQgK3dpbmRvd1siX19hMyIrRmFzdEV4dC5TeXN0ZW0uU2VjdXJpdHlIYW5kbGVyLmdldFNlY3VyaXR5Q29kZSgpXSgpKTsKICAgIHJldHVybiBlbmNyeXB0LmVuY3J5cHQoY29udGVudCk7Cn0=";

        /**
         * token 函数的base64
         */
        headToken: string = "ZnVuY3Rpb24gKHB1YmxpY0tleSwgdGltZXN0YW1wKSB7CiAgICBsZXQgYmFzZTY0Q29udGVudCA9IEV4dC51dGlsLkJhc2U2NC5lbmNvZGUodGltZXN0YW1wICsgIiIpOwogICAgbGV0IGVuY3J5cHQgPSBuZXcgSlNFbmNyeXB0KCk7CiAgICBlbmNyeXB0LnNldFB1YmxpY0tleShwdWJsaWNLZXkpOwoKICAgIGxldCBjb250ZW50ID0gJC5tZDUoYmFzZTY0Q29udGVudCArd2luZG93WyJfX2IzIitGYXN0RXh0LlN5c3RlbS5TZWN1cml0eUhhbmRsZXIuZ2V0U2VjdXJpdHlDb2RlKCldKCkpOwogICAgcmV0dXJuIGVuY3J5cHQuZW5jcnlwdChjb250ZW50KTsKfQ==";

    }

    /**
     * 系统更新日志
     */
    class SystemChangelogHandler {

        /**
         * 获取更新日志文件的地址
         */
        getUrl(): string {
            return FastExt.System.ConfigHandler.getConfig("changelog").value;
        }


        existChangelog(): boolean {
            return !Ext.isEmpty(this.getUrl());
        }

        /**
         * 自动检测是否显示更新日志
         * @param obj
         */
        autoShowChangelog(obj: any) {
        }

        showChangelog(obj: any) {
            try {
                FastExt.Markdown.showChangelog(obj);
            } finally {
            }
        }
    }

}