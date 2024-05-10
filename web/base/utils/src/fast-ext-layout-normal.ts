namespace FastExt {

    /**
     * 常规布局
     */
    export class NormalLayout {

        public static TabContainer: TabContainerLayout;
        public static TreeMenuContainer: TreeMenuLayout;
        public static HeadBarContainer: HeadBarLayout;
        public static HistoryHandler: HistoryMenuHandler;

        private static TreeMenuEvent: TreeMenuEvent;

        //当fast-ext-utils文件加载时，初始化一次
        public static __onLoaded() {
            NormalLayout.TabContainer = new TabContainerLayout();
            NormalLayout.TreeMenuContainer = new TreeMenuLayout();
            NormalLayout.HeadBarContainer = new HeadBarLayout();
            NormalLayout.HistoryHandler = new HistoryMenuHandler();
            NormalLayout.TreeMenuEvent = new TreeMenuEvent();
        }

        /**
         * 初始化系统布局
         */
        static showSystemLayout() {
            FastExt.Windows.removeLoading();

            let container = FastExt.SystemLayout.getBodyContainer();
            container.removeAll();

            let menuPanel = this.TreeMenuContainer.createLayoutPanel();
            menuPanel.region = "west";

            let headPanel = this.HeadBarContainer.createLayoutPanel();
            headPanel.region = "north";

            let contentPanel = this.TabContainer.createLayoutPanel();
            contentPanel.region = "center";

            let rightContainer = Ext.create('Ext.panel.Panel', {
                layout: 'border',
                region: 'center',
                border: 0,
                userCls: "fast-ext-content-container",
                items: [headPanel, contentPanel],
            });

            let headerTip = Ext.create('Ext.container.Container', {
                border: 0,
                padding: '0 0 0 0',
                flex: 1,
                cls: "fast-progress-container",
                html: "<div class=\"fast-progress\" id=\"progress\"></div>"
            });

            let containerPanel = Ext.create('Ext.panel.Panel', {
                layout: 'border',
                border: 0,
                bodyStyle: {
                    background: "#f0f0f0",
                },
                anchor: '100% 100%',
                flex: 1,
                items: [menuPanel, rightContainer],
            });

            let realContainer = Ext.create('Ext.panel.Panel', {
                layout: 'absolute',
                border: 0,
                items: [containerPanel, headerTip],
                listeners: {
                    render: function (obj) {
                        FastExt.Dialog.hideWait();
                        FastExt.ProgressBaseLineLayout.getProgressLine(FastExt.Color.toColor(FastExt.System.ConfigHandler.getFrontColor())).animate(1);
                        FastExt.Listeners.getFire().onSystemReady();
                    },
                }
            });
            container.add(realContainer);
        }
    }

    class TabContainerLayout {
        public static readonly FAST_CONTAINER_CLS = "fast-system-tab-container";
        public static readonly FAST_TAB_INDEX_ITEM_ID = "TabIndexPanel";

        private _container: any;
        //超时未激活使用的面板自动释放时间间隔，单位毫秒，默认 3分钟
        private _timeoutDestroyDuration = 1000 * 60 * 3;


        /**
         * 获取布局组件
         */
        createLayoutPanel() {
            this._container = Ext.create('Ext.container.Container', {
                layout: 'card',
                userCls: TabContainerLayout.FAST_CONTAINER_CLS,
                margin: '0 5 0 0',
                listeners: {
                    render: () => {
                        FastExt.NormalLayout.HistoryHandler.restoreHistory();
                        FastExt.NormalLayout.HeadBarContainer.refreshButtons();

                        let menuIdFromLocation = FastExt.Windows.getMenuIdFromLocation();
                        if (!this.showByMenuId(menuIdFromLocation)) {
                            this.showIndex();
                        }
                        this.startWatcher();
                    },
                }
            });
            return this._container;
        }


        /**
         * 异步构建菜单的数据组件
         * @param menu
         * @private
         */
        private buildMenuContentPanel(menu: any): any {
            if (!menu) {
                return undefined;
            }
            return Ext.create('Ext.panel.Panel', {
                layout: 'fit',
                itemId: menu.id,
                border: 0,
                menuContainer: true,
                methodInvoked: false,
                notifyEntityActive: function () {
                    let entityOwner = this.down("[entityList=true]");
                    if (entityOwner) {
                        if (entityOwner.onTabActivate) {
                            entityOwner.onTabActivate(this);
                        }
                        if (entityOwner.hasListener("aftertabactive")) {
                            entityOwner.fireEvent("aftertabactive")
                        }
                    }
                },
                notifyEntityDeActive: function () {
                    try {
                        let entityOwner = this.down("[entityList=true]");
                        if (entityOwner) {
                            if (entityOwner.onTabDeactivate) {
                                entityOwner.onTabDeactivate(this);
                            }
                            if (entityOwner.hasListener("aftertabdeactive")) {
                                entityOwner.fireEvent("aftertabdeactive")
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                },
                invokeMenuPanel: function () {
                    let me = this;
                    if (!this.methodInvoked || FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                        me.setLoading("加载数据中，请稍后……");
                        let delay = FastExt.System.InitHandler.isSilenceGlobalSaving() ? 0 : 300;
                        FastExt.Eval.asyncMethod(menu.method, delay).then((obj: any) => {
                            try {
                                me.setLoading(false);
                                if (!obj) {
                                    if (FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                                        FastExt.System.InitHandler.doNextSilenceMenu();
                                        FastExt.NormalLayout.TabContainer.close(menu);
                                    }
                                    return;
                                }
                                this.methodInvoked = true;
                                let entityOwner = obj.down("[entityList=true]");
                                if (entityOwner) {
                                    entityOwner.where = FastExt.Json.mergeJson(menu.where, entityOwner.where);
                                    entityOwner.code = $.md5(menu.id);
                                    entityOwner.buildCodeText = menu.title;
                                    entityOwner.tabMenu = menu;
                                }
                                obj.setStyle("background", "#ffffff");
                                me.add(obj);
                            } catch (e) {
                                console.error(e);
                            }
                        });
                    } else {
                        this.notifyEntityActive();
                    }
                },
                listeners: {
                    activate: function (obj) {
                        FastExt.SystemLayout.changeMenuTheme(menu.id, () => {
                            obj.invokeMenuPanel();
                        });
                    },
                    deactivate: function (obj) {
                        if (!obj || obj.destroyed || obj.destroying) {
                            return;
                        }
                        if (!FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                            this.notifyEntityDeActive();
                        }
                    },
                }
            });
        }


        private startWatcher() {
            let watcher = () => {
                this.destroyTimeoutItem();
                this.startWatcher();
            };
            setTimeout(watcher, 5 * 1000);
        }


        /**
         * 显示首页
         */
        showIndex() {
            let itemId = TabContainerLayout.FAST_TAB_INDEX_ITEM_ID;
            if (!FastExt.NormalLayout.TabContainer.exist(itemId)) {
                let welcomePanel = FastExt.IndexLayout.getWelcomePanel();
                welcomePanel.itemId = itemId;
                FastExt.NormalLayout.TabContainer.add(welcomePanel);
            }
            FastExt.NormalLayout.TabContainer.active(itemId);
        }


        /**
         * 判断组件id是已添加到容器中
         * @param menuId
         */
        exist(menuId: string): boolean {
            return this._container.down("#" + menuId);
        }

        /**
         * 激活显示
         * @param menuId
         */
        active(menuId: string) {
            let menuObj = FastExt.System.MenuHandler.getMenu(menuId);
            //注意：此处禁止 menuObj 判空

            let contentPanel = this._container.getLayout().setActiveItem(menuId);
            contentPanel.lastActiveTime = new Date().getTime();

            if (!FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                FastExt.Windows.pushLocationHistory(menuObj);
            }
            FastExt.NormalLayout.HeadBarContainer.refreshButtons();
            FastExt.NormalLayout.HeadBarContainer.addSystemMenuButton(menuObj, true);
            FastExt.NormalLayout.HeadBarContainer.setActiveSystemMenuButton(menuId, true);
            FastExt.NormalLayout.TreeMenuContainer.selectByMenuId(menuId);
            FastExt.NormalLayout.HistoryHandler.addHistory(menuObj);
        }


        /**
         * 向容器中添加组件
         * @param cmp
         */
        add(cmp: any) {
            this._container.add(cmp);
        }

        /**
         * 销毁菜单的组件
         * @param menuId
         */
        destroy(menuId: string) {
            this.destroyByCmb(this._container.down("#" + menuId));
        }

        destroyByCmb(cmb: any) {
            if (cmb) {
                this._container.remove(cmb);
            }
        }

        showByMenuId(menuId: string): boolean {
            if (Ext.isEmpty(menuId)) {
                return false;
            }
            return this.show(FastExt.System.MenuHandler.getMenu(menuId));
        }

        showByCmb(cmb: any, menu: any) {
            if (!menu) {
                return;
            }
            if (!this.exist(menu.id)) {
                this.add(cmb);
            }
            this.active(menu.id);
        }

        /**
         * 执行菜单中的方法，并显示
         * @param menu 菜单对象
         */
        show(menu: any): boolean {
            if (!menu) {
                return false;
            }
            if (!this.exist(menu.id)) {
                this.add(this.buildMenuContentPanel(menu));
            }
            this.active(menu.id);
            return true;
        }

        reload(menuId: string) {

            Ext.suspendLayouts();
            try {
                let exitMenuPanel = this._container.down("#" + menuId);
                if (exitMenuPanel) {
                    this._container.remove(exitMenuPanel);
                }
                if (menuId === TabContainerLayout.FAST_TAB_INDEX_ITEM_ID) {
                    this.showIndex();
                    return;
                }

                let menuContentPanel = this.buildMenuContentPanel(FastExt.System.MenuHandler.getMenu(menuId));
                if (!menuContentPanel) {
                    return;
                }
                this.add(menuContentPanel);
                this.active(menuId);
            } finally {
                Ext.resumeLayouts(true);
            }
        }

        copyUrl(menuId: string) {
            let menu = FastExt.System.MenuHandler.getMenu(menuId);
            if (menu) {
                FastExt.Base.copyToBoard(FastExt.Windows.getBaseUrl() + "#/" + menu.text + "/" + menuId);
                FastExt.Dialog.toast("复制成功！");
            }
        }

        copy(menuId: string) {
            let menu = FastExt.System.MenuHandler.cloneMenu(menuId);
            if (menu) {
                this.show(menu);
            }
        }

        closeByMenuId(menuId: string) {
            this.close(FastExt.System.MenuHandler.getMenu(menuId));
        }


        /**
         * 移除组件
         * @param menu 菜单对象
         */
        close(menu: any) {
            if (!menu) {
                return;
            }
            Ext.suspendLayouts();
            try {
                this.destroy(menu.id);
                FastExt.NormalLayout.HeadBarContainer.closeSystemMenuButton(menu.id);
                FastExt.NormalLayout.HeadBarContainer.doActiveSystemMenuButton();
            } finally {
                Ext.resumeLayouts(true);
            }
        }


        closeAll() {
            FastExt.NormalLayout.HeadBarContainer.closeAllSystemMenuButton();
            FastExt.NormalLayout.HeadBarContainer.clearMenuHistory();
            this.showIndex();
        }


        /**
         * 隐藏菜单，并不会销毁组件
         * @param menuId 菜单ID
         */
        hideByMenuId(menuId: string) {
            this.hide(FastExt.System.MenuHandler.getMenu(menuId));
        }

        /**
         * 隐藏菜单，并不会销毁组件
         * @param menu
         */
        hide(menu: any) {
            FastExt.NormalLayout.HeadBarContainer.closeSystemMenuButton(menu.id);
            FastExt.NormalLayout.HeadBarContainer.doActiveSystemMenuButton();
        }

        /**
         * 获取当前显示的组件
         */
        getActiveCmp() {
            return this._container.getLayout().getActiveItem();
        }

        getActiveHistory() {
            let activeCmp = this.getActiveCmp();
            if (activeCmp) {
                let activeMenu = FastExt.System.MenuHandler.getMenu(activeCmp.itemId);
                if (activeMenu) {
                    return activeMenu;
                }
            }
            return undefined;
        }


        /**
         * 销毁超时未激活使用的组件
         */
        destroyTimeoutItem() {
            let layoutItems = this._container.getLayout().getLayoutItems();
            for (let layoutItem of layoutItems) {
                if (this.getActiveCmp() === layoutItem) {
                    layoutItem.lastActiveTime = new Date().getTime();
                    continue;
                }
                if (new Date().getTime() - layoutItem.lastActiveTime > this._timeoutDestroyDuration) {
                    FastExt.Server.setSilence(true);
                    FastExt.NormalLayout.HeadBarContainer.graySystemMenuButton(layoutItem.itemId);
                    this.destroyByCmb(layoutItem);
                    FastExt.Server.setSilence(false);
                }
            }
        }

    }

    class TreeMenuLayout {

        public static readonly FAST_CONTAINER_CLS = "fast-system-menu-container";
        public static readonly FAST_CONTAINER_HEAD_CLS = "fast-system-menu-header-container";
        public static readonly FAST_PANEL_CLS = "fast-system-menu-panel";
        public static readonly FAST_POPUP_PANEL_CLS = "fast-system-menu-popup-panel";

        public static getTreeMenuObject(id): TreeMenuLayout {
            return window["TreeObj" + id];
        }

        public static destroyTreeMenuObject(id) {
            delete window["TreeObj" + id];
        }

        private readonly _id: string;
        private _menuShowIterator: number = 1;

        private _menuElementHandler: TreeMenuElementHandler;

        private _treeContainer: any;

        private _headPanel: any;

        private _treePanel: any;

        private _renderHeadPanel: boolean = true;

        private _collapseMenuPanelWidth: number = 55;

        private _expendMenuPanelMinWidth: number = 128;

        private _lastMenuPanelWidth: number = undefined;

        private _toggleMenuPanelAnimDuration = 300;

        private _toggleMenPanelAnim: boolean = false;

        private _muteResizeEvent: boolean = false;

        private _lastSelectedMenuId: string;

        private _maxExpendRootMenuCount = 1;


        private _mini: boolean = false;
        private _floating: boolean = false;

        private _floatTreeMenu: TreeMenuLayout;

        constructor() {
            this._id = FastExt.Base.buildOnlyCode("TP");
            this._menuElementHandler = new TreeMenuElementHandler(this._id);
            this._lastMenuPanelWidth = parseInt((document.body.clientWidth * 0.2).toFixed(0));
            window["TreeObj" + this._id] = this;
        }


        /**
         * 获取布局组件
         */
        createLayoutPanel() {
            let me = this;


            if (this._renderHeadPanel) {
                me._headPanel = Ext.create('Ext.panel.Panel', {
                    height: 55,
                    padding: '0 0 0 0',
                    region: 'north',
                    border: 0,
                    layout: "fit",
                    power: false,
                    userCls: TreeMenuLayout.FAST_CONTAINER_HEAD_CLS,
                    bodyCls: TreeMenuLayout.FAST_CONTAINER_HEAD_CLS,
                    html: this.buildHeadHtml(false, false),
                });
            } else {
                me._headPanel = undefined;
            }

            me._treePanel = Ext.create('Ext.panel.Panel', {
                border: 0,
                region: 'center',
                scrollable: "y",
                power: false,
                userCls: TreeMenuLayout.FAST_PANEL_CLS,
                bodyCls: TreeMenuLayout.FAST_PANEL_CLS,
                html: this.buildMenuHtml(false),
            });

            me._treeContainer = Ext.create('Ext.panel.Panel', {
                layout: 'border',
                border: 0,
                width: this._lastMenuPanelWidth,
                minWidth: this._collapseMenuPanelWidth,
                maxWidth: 500,
                subtitle: '左侧菜单',
                split: true,
                power: false,
                constrain: true,
                floating: this._floating,
                userCls: TreeMenuLayout.FAST_CONTAINER_CLS,
                items: [this._headPanel, this._treePanel],
                listeners: {
                    resize: function (obj, width) {
                        if (me._muteResizeEvent) {
                            return;
                        }
                        if (width <= me._expendMenuPanelMinWidth) {
                            me.doCollapseMenuPanel();
                        } else {
                            me.doExpandMenuPanel();
                        }
                    }
                }
            });
            return me._treeContainer;
        }

        /**
         * 构建头部显示的网页内容
         * @param mini 缩小版
         * @param singleLine 是否单行显示标题
         */
        buildHeadHtml(mini: boolean, singleLine: boolean) {
            let systemTlColor = FastExt.System.ConfigHandler.getFrontColor();
            let systemLogo = FastExt.System.ConfigHandler.getSystemLogo();
            let systemTitle = FastExt.System.ConfigHandler.getSystemTitle();

            if (mini) {
                return "<div class='fast-system-head-info-container fast-system-head-info-container-min'>" +
                    "<img alt='系统LOGO' class='fast-system-head-logo fast-system-head-logo-mini' src='" + FastExt.Base.formatUrl(systemLogo) + "' />" +
                    "</div>";
            }
            let clsValue = 'fast-system-head-info-container';
            if (singleLine) {
                clsValue += " fast-system-head-title-single-line";
            }
            return "<div class='" + clsValue + "'>" +
                "<img alt='系统LOGO' class='fast-system-head-logo' src='" + FastExt.Base.formatUrl(systemLogo) + "' />" +
                "&nbsp;&nbsp;<div class='fast-system-head-title' style='color: " + systemTlColor + ";' >" + systemTitle + "</div>" +
                "</div>";
        }


        /**
         * 构建菜单网页
         */
        buildMenuHtml(mini: boolean) {
            return this._menuElementHandler.buildMenuHtml(mini);
        }

        isRenderHeadPanel(): boolean {
            return this._renderHeadPanel;
        }

        setRenderHeadPanel(value: boolean) {
            this._renderHeadPanel = value;
        }

        isMini(): boolean {
            return this._mini;
        }

        isFloating(): boolean {
            return this._floating;
        }


        /**
         * 判断菜单面板是否展开
         */
        isExpendedMenuPanel(): boolean {
            return !this._mini;
        }

        /**
         * 判断菜单面板是否展开
         */
        isCollapsedMenuPanel(): boolean {
            return !this.isExpendedMenuPanel();
        }


        /**
         * 折叠或关闭菜单面板
         */
        toggleMenuPanel() {
            this._toggleMenPanelAnim = true;
            if (this.isExpendedMenuPanel()) {
                if (this._headPanel) {
                    //避免闪
                    this._headPanel.update(this.buildHeadHtml(false, true));
                }
                this._lastMenuPanelWidth = this._treeContainer.getWidth();
                FastExt.Animate.startValueAnimate("toggleMenuPanel", {
                    from: this._lastMenuPanelWidth,
                    to: this._collapseMenuPanelWidth,
                    duration: this._toggleMenuPanelAnimDuration,
                    update: (value) => {
                        this._treeContainer.setWidth(value);
                    },
                    begin: () => {
                        this.updateHeadHtml(false, true);
                        this._muteResizeEvent = true;
                    },
                    complete: () => {
                        this.doCollapseMenuPanel();
                        this._muteResizeEvent = false;
                        this._toggleMenPanelAnim = false;
                    }
                });
            } else {
                FastExt.Animate.startValueAnimate("toggleMenuPanel", {
                    from: this._collapseMenuPanelWidth,
                    to: this._lastMenuPanelWidth,
                    duration: this._toggleMenuPanelAnimDuration,
                    update: (value) => {
                        this._treeContainer.setWidth(value);
                    },
                    begin: () => {
                        this.updateHeadHtml(false, true);
                        this.updateMenuHtml(false);
                        this._muteResizeEvent = true;
                    },
                    complete: () => {
                        this.doExpandMenuPanel();
                        this._muteResizeEvent = false;
                        this._toggleMenPanelAnim = false;
                    }
                });
            }
        }

        /**
         * 折叠菜单面板
         */
        private doCollapseMenuPanel() {
            if (this._treeContainer) {
                this._muteResizeEvent = true;
                this._treeContainer.setWidth(this._collapseMenuPanelWidth);
                this._muteResizeEvent = false;
            }
            //不可放于修改面板宽度之前
            if (this.isCollapsedMenuPanel()) {
                return;
            }
            if (this._headPanel) {
                this._headPanel.update(this.buildHeadHtml(true, true));
            }
            this.updateHeadHtml(true, false);
            this.updateMenuHtml(true);
            this._mini = true;
            FastExt.NormalLayout.HeadBarContainer.refreshButtons();
        }

        /**
         * 伸展菜单面板
         */
        private doExpandMenuPanel() {
            if (this.isExpendedMenuPanel()) {
                return;
            }
            if (this._treeContainer) {
                this._muteResizeEvent = true;
                this._treeContainer.setWidth(this._lastMenuPanelWidth);
                this._muteResizeEvent = false;
            }
            this._mini = false;
            this.updateHeadHtml(false, false);
            this.updateMenuHtml(false);
            this.selectByMenuId(this._lastSelectedMenuId);
            FastExt.NormalLayout.HeadBarContainer.refreshButtons();
            this.destroyFloatTreeMenu();
        }

        private updateHeadHtml(mini: boolean, singleLine: boolean) {
            if (this._headPanel) {
                this._headPanel.setHtml(this.buildHeadHtml(mini, singleLine));
            }
        }

        private updateMenuHtml(mini: boolean) {
            if (this._treePanel) {
                this._treePanel.setHtml(this.buildMenuHtml(mini));
            }
        }


        /**
         * 选中菜单
         * @param menuId 菜单ID
         */
        selectByMenuId(menuId: any) {
            if (!menuId) {
                return;
            }
            if (!Ext.isEmpty(this._lastSelectedMenuId)) {
                this.setMenuSelect(this._lastSelectedMenuId, false);
            }
            this.setMenuSelect(menuId, true);
            this.expandMenu(menuId);
            this._lastSelectedMenuId = menuId;

            if (this._floatTreeMenu) {
                this._floatTreeMenu.selectByMenuId(menuId);
            }
        }

        setMenuSelect(menuId: string, selected: boolean) {
            let menuEL = this._menuElementHandler.getMenuEl(menuId);
            if (selected) {
                $(menuEL).addClass("fast-menu-item-container-selected");
            } else {
                $(menuEL).removeClass("fast-menu-item-container-selected");
            }
        }

        isMenuSelected(menuId: string) {
            let menuEL = this._menuElementHandler.getMenuEl(menuId);
            return $(menuEL).hasClass("fast-menu-item-container-selected");
        }

        isMenuDeepSelected(menuId: string) {
            if (this.isMenuSelected(menuId)) {
                return true;
            }
            let menu = FastExt.System.MenuHandler.getMenu(menuId);
            if (menu.children) {
                for (let child of menu.children) {
                    let selected = this.isMenuDeepSelected(child.id);
                    if (selected) {
                        return true;
                    }
                }
            }
            return false;
        }

        toggleMenuChildren(menuId: string) {
            if (this.isMenuChildrenShown(menuId)) {
                this.hideMenuChildren(menuId);
            } else {
                this.showMenuChildren(menuId);
            }
        }

        isMenuChildrenShown(menuId: string) {
            let child = this._menuElementHandler.getMenuChildrenEl(menuId);
            if (!child) {
                return true;
            }
            let childCount = parseInt(child.getAttribute("data-menu-children-count"));
            if (childCount === 0) {
                return true;
            }
            let hiding = child.getAttribute("data-hiding");
            if (hiding && hiding === "true") {
                return false;
            }
            if (Ext.isEmpty(child.style.display)) {
                return false;
            }
            return child.style.display !== "none";
        }

        showMenuChildren(menuId: string, complete?: any) {
            let menuEl = this._menuElementHandler.getMenuEl(menuId);
            if (menuEl) {
                menuEl.setAttribute("data-last-show-time", String(this._menuShowIterator++));
                if (this.isMenuChildrenShown(menuId)) {
                    if (complete) {
                        complete();
                    }
                    return;
                }
                let children = this._menuElementHandler.getMenuChildrenEl(menuId);
                children.removeAttribute("data-hiding");
                $(this._menuElementHandler.getMenuArrowEl(menuId)).addClass("fast-menu-arrow-open");
                $(children).slideDown(this._toggleMenuPanelAnimDuration, complete);
                this.autoCollapseMenu();
            } else if (complete) {
                complete();
            }
        }

        hideMenuChildren(menuId: string, complete?: any) {
            if (!this.isMenuChildrenShown(menuId)) {
                return;
            }
            let children = this._menuElementHandler.getMenuChildrenEl(menuId);
            children.setAttribute("data-hiding", "true");
            $(this._menuElementHandler.getMenuArrowEl(menuId)).removeClass("fast-menu-arrow-open");
            $(children).slideUp(this._toggleMenuPanelAnimDuration, complete);
        }

        /**
         * 展开指定的菜单ID
         */
        expandMenu(menuId: string, level?: number, complete?: any) {
            if (Ext.isEmpty(level)) {
                level = 1;
            }
            if (Ext.isEmpty(menuId)) {
                if (complete) {
                    complete();
                }
                return;
            }
            let menu = FastExt.System.MenuHandler.getMenu(menuId);
            if (menu) {
                if (level === 1 && menu._clone) {
                    //来着复制的菜单，不做左侧菜单选中打开操作
                    if (complete) {
                        complete();
                    }
                    this.collapseAllMenu();
                    return;
                }
                let doShow = () => {
                    if (menu.children && menu.children.length > 0) {
                        this.showMenuChildren(menuId, complete);
                    }
                };
                if (Ext.isEmpty(menu.parentId) || menu.parentId === "root") {
                    doShow();
                } else {
                    this.expandMenu(menu.parentId, level + 1, doShow);
                }
            } else {
                if (complete) {
                    complete();
                }
                if (level === 1) {
                    this.collapseAllMenu();
                }
            }
        }

        collapseMenu(menuId: string) {
            this.hideMenuChildren(menuId);
            let menu = FastExt.System.MenuHandler.getMenu(menuId);
            if (menu && menu.children) {
                for (let child of menu.children) {
                    this.collapseMenu(child.id);
                }
            }
        }

        autoCollapseMenu() {

            let rootMenuId = this._menuElementHandler.getRootMenuId();
            let expandedMenu = [];
            for (let menuId of rootMenuId) {
                if (this.isMenuChildrenShown(menuId)) {
                    let menuEl = this._menuElementHandler.getMenuEl(menuId);
                    expandedMenu.push({
                        time: parseInt(menuEl.getAttribute("data-last-show-time")),
                        id: menuId,
                        text:menuEl.innerText
                    });
                }
            }

            expandedMenu = expandedMenu.sort((a, b) => {
                return a.time - b.time;
            });

            let jumpRootMenuId = [];
            for (let i = expandedMenu.length - this._maxExpendRootMenuCount; i < expandedMenu.length; i++) {
                jumpRootMenuId = jumpRootMenuId.concat(this._menuElementHandler.getMenuAllParentId(expandedMenu[i].id));
            }

            if (expandedMenu.length > this._maxExpendRootMenuCount) {
                for (let i = 0; i < (expandedMenu.length - this._maxExpendRootMenuCount); i++) {
                    if (jumpRootMenuId.indexOf(expandedMenu[i].id) >= 0) {
                        continue;
                    }
                    this.collapseMenu(expandedMenu[i].id);
                }
            }
        }

        /**
         * 关闭所有菜单
         */
        collapseAllMenu() {
            for (let menuId of this._menuElementHandler.getRootMenuId()) {
                this.collapseMenu(menuId);
            }
        }

        showFloatTreeMenu(fromMenuId?: string) {
            if (this._toggleMenPanelAnim) {
                return;
            }
            let lastTreePanelWidth = this._lastMenuPanelWidth;
            if (!this._floatTreeMenu) {
                this._floatTreeMenu = new TreeMenuLayout();
                this._floatTreeMenu._floating = true;
                this._floatTreeMenu._lastMenuPanelWidth = lastTreePanelWidth;
                this._floatTreeMenu.createLayoutPanel().show();
            }
            this._floatTreeMenu._treeContainer.setHeight(this._treeContainer.getHeight());
            this._floatTreeMenu._treeContainer.setWidth(lastTreePanelWidth);
            this._floatTreeMenu._treeContainer.setY(0);
            this._floatTreeMenu._treeContainer.setX(-(lastTreePanelWidth + 20));
            this._floatTreeMenu.showByFloatingMenu(fromMenuId);
        }

        isShownFloatTreeMenu() {
            if (this._floatTreeMenu) {
                return this._floatTreeMenu.isShownByFloatingMenu();
            }
            return false;
        }

        hideFloatTreeMenu() {
            if (this._floatTreeMenu) {
                this._floatTreeMenu.hideByFloatingMenu();
            }
        }

        showByFloatingMenu(fromMenuId?: string) {
            if (this._floating) {
                FastExt.Animate.startValueAnimate("showByFloatingMenu", {
                    from: this._treeContainer.getX(),
                    to: 0,
                    duration: 300,
                    delay: fromMenuId ? 300 : 0,
                    begin: () => {
                        this._treeContainer.setX(-this._treeContainer.getWidth());
                    },
                    update: (value) => {
                        this._treeContainer.setX(value)
                    },
                    complete: () => {
                        FastExt.Animate.clearAnimate(this._treeContainer);
                        Ext.resumeLayouts(true);
                        if (fromMenuId) {
                            this.expandMenu(fromMenuId);
                        }
                    }
                });
            }
        }

        isShownByFloatingMenu() {
            if (this._floating) {
                return this._treeContainer.getX() >= 0;
            }
        }

        hideByFloatingMenu() {
            if (this._floating) {
                FastExt.Animate.clearAnimate("hideByFloatingMenu");
                FastExt.Animate.startValueAnimate("hideByFloatingMenu", {
                    from: this._treeContainer.getX(),
                    to: -(this._treeContainer.getWidth() + 20),
                    duration: 300,
                    update: (value) => {
                        this._treeContainer.setX(value)
                    },
                    complete: () => {
                        FastExt.Animate.clearAnimate(this._treeContainer);
                        this.collapseAllMenu();
                    }
                });
            }
        }

        destroyFloatTreeMenu() {
            if (this._floatTreeMenu) {
                FastExt.Animate.clearAnimate(this._floatTreeMenu._treeContainer);
                TreeMenuLayout.destroyTreeMenuObject(this._floatTreeMenu._id);
                this._floatTreeMenu._treeContainer.destroy();
                this._floatTreeMenu = null;
            }
        }

    }

    class TreeMenuEvent {
        onMenuItemClick(e: any, objId: string, htmlId: string) {
            let menuEl = document.getElementById("Menu-" + htmlId);
            if (!menuEl) {
                return;
            }
            // e.getXY = () => ({x: e.x, y: e.y});
            //
            // Ext.fly(menuEl).ripple(e, {color: "#ffffff"});

            let treeMenuObject = TreeMenuLayout.getTreeMenuObject(objId);
            if (!treeMenuObject) {
                return;
            }
            if (treeMenuObject.isMini()) {
                return;
            }
            let menuId = menuEl.getAttribute("data-menu-id");
            let childCount = parseInt(menuEl.getAttribute("data-menu-children-count"));
            if (childCount === 0) {
                FastExt.SystemLayout.showByMenuId(menuId);
                return;
            }
            treeMenuObject.toggleMenuChildren(menuId);
        }

        onMenuItemMouseEnter(e: any, objId: string, htmlId: string) {
            let treeMenuObject = TreeMenuLayout.getTreeMenuObject(objId);
            if (!treeMenuObject) {
                return;
            }
            let menuEl = document.getElementById("Menu-" + htmlId);
            if (!menuEl) {
                return;
            }
            let menuId = menuEl.getAttribute("data-menu-id");
            if (treeMenuObject.isMini()) {
                treeMenuObject.showFloatTreeMenu(menuId);
            }
        }

        onMenuItemMouseLeave(e: any, objId: string, htmlId: string) {
        }

        onMenuContainerMouseEnter(e: any, objId: string) {
        }

        onMenuContainerMouseLeave(e: any, objId: string) {
            let treeMenuObject = TreeMenuLayout.getTreeMenuObject(objId);
            if (treeMenuObject.isMini()) {
                return;
            }
            if (!treeMenuObject.isShownByFloatingMenu()) {
                return;
            }
            treeMenuObject.hideByFloatingMenu();
        }
    }

    class TreeMenuElementHandler {
        private readonly _id: string;
        private readonly _rootMenuId: string[];

        constructor(id: string) {
            this._id = id;
            this._rootMenuId = [];
        }

        buildMenuHtml(mini: boolean) {
            let menus = FastExt.System.MenuHandler.getMenus();
            let menuHtml = [];
            for (let menu of menus) {
                menuHtml.push(this.createMenuHtml(this._id, menu, 0, mini));
            }
            let onMenuContainerMouseLeaveFun = "FastExt.NormalLayout.TreeMenuEvent.onMenuContainerMouseLeave(event,'" + this._id + "')";
            let onMenuContainerMouseEnterFun = "FastExt.NormalLayout.TreeMenuEvent.onMenuContainerMouseEnter(event,'" + this._id + "')";
            return '<div class="fast-menu-root-container" onmouseenter="' + onMenuContainerMouseEnterFun + '" onmouseleave="' + onMenuContainerMouseLeaveFun + '" >' + menuHtml.join("") + '</div>';
        }

        private createMenuHtml(id: string, menu: any, level: number, mini: boolean) {
            let childHtml = [];
            if (!mini && menu.children) {
                for (let child of menu.children) {
                    childHtml.push(this.createMenuHtml(id, child, level + 1, mini));
                }
            }

            let htmlId = id + menu.id;
            let onMenuItemClickFun = "FastExt.NormalLayout.TreeMenuEvent.onMenuItemClick(event,'" + id + "','" + htmlId + "')";
            let onMenuItemMouseEnterFun = "FastExt.NormalLayout.TreeMenuEvent.onMenuItemMouseEnter(event,'" + id + "','" + htmlId + "')";
            let onMenuItemMouseLeaveFun = "FastExt.NormalLayout.TreeMenuEvent.onMenuItemMouseLeave(event,'" + id + "','" + htmlId + "')";


            let paddingLeftHtml = "";
            for (let i = 0; i < level; i++) {
                paddingLeftHtml += "<div class=\"fast-menu-icon\"></div>";
            }

            if (childHtml.length > 0 && this._rootMenuId.indexOf(menu.id) < 0) {
                this._rootMenuId.push(menu.id);
            }


            return '<div class="fast-menu-container" >' +
                '<div class="fast-menu-item-container" data-parent-menu-id="' + menu.parentId + '" data-menu-mini="' + mini + '" id="Menu-' + htmlId + '" data-menu-children-count="' + childHtml.length + '" data-menu-id="' + menu.id + '" onmouseenter="' + onMenuItemMouseEnterFun + '" onmouseleave="' + onMenuItemMouseLeaveFun + '" onmousedown="' + onMenuItemClickFun + '">' + paddingLeftHtml +
                '<img class="fast-menu-icon" id="Menu-Icon-' + htmlId + '" src="' + FastExt.Base.formatUrlVersion(menu.icon) + '" alt="菜单图标"/>' +
                (mini ? '' : ('<span class="fast-menu-text" id="Menu-Text-' + htmlId + '" >' + menu.text + '</span>')) +
                (childHtml.length > 0 ? '<span id="Menu-Arrow-' + htmlId + '" class="extIcon extRightArrow fast-menu-arrow"></span>' : '') +
                ' </div>' +
                (mini ? '' : (' <div data-menu-id="' + menu.id + '" data-menu-children-count="' + childHtml.length + '" data-root-children="' + (level <= 0 ? id : 'false') + '" class="fast-menu-child-container" id="Menu-Children-' + htmlId + '">' + childHtml.join('') + ' </div>')) +
                '</div>';
        }


        getMenuAllParentId(menuId: string) {
            let allParentId = [];
            let parentId = this.getMenuParentId(menuId);
            allParentId.push(parentId);
            if (parentId && parentId !== "root") {
                allParentId = allParentId.concat(this.getMenuAllParentId(parentId));
            }
            return allParentId;
        }

        getMenuParentId(menuId: string) {
            return document.getElementById("Menu-" + this._id + menuId).getAttribute("data-parent-menu-id");
        }

        getMenuEl(menuId: string) {
            return document.getElementById("Menu-" + this._id + menuId);
        }

        getMenuTextEl(menuId: string) {
            return document.getElementById("Menu-Text-" + this._id + menuId);
        }

        getMenuIconEl(menuId: string) {
            return document.getElementById("Menu-Icon-" + this._id + menuId);
        }

        getMenuChildrenEl(menuId: string) {
            return document.getElementById("Menu-Children-" + this._id + menuId);
        }

        getMenuArrowEl(menuId: string) {
            return document.getElementById("Menu-Arrow-" + this._id + menuId);
        }


        getRootMenuId(): string[] {
            return this._rootMenuId;
        }

    }

    class HeadBarLayout {
        public static readonly FAST_CONTAINER_CLS = "fast-system-head-container";
        public static readonly FAST_HEAD_BUTTON_CLS = "fast-system-head-button";

        private _headContainer: any;

        private _systemMenuPanelButton: any;

        private _systemHistoryButton: any;

        private _systemChangelogButton: any;

        private _lastCheckedItemId: string;

        private _historyMenu: any;


        /**
         * 获取布局组件
         */
        createLayoutPanel() {
            let headHeight = 55;

            this._systemHistoryButton = Ext.create("Ext.button.Button", {
                text: '',
                iconCls: 'extIcon extHistory3 grayColor',
                hidden: true,
                reorderable: false,
                power: false,
                handler: () => {
                    this.showMenuHistory();
                }
            });

            this._systemMenuPanelButton = Ext.create("Ext.button.Button", {
                iconCls: 'extIcon extArrowLeft3 grayColor',
                itemId: "MenuButton",
                reorderable: false,
                power: false,
                handler: function () {
                    FastExt.NormalLayout.TreeMenuContainer.toggleMenuPanel();
                }
            });

            this._systemChangelogButton = Ext.create("Ext.button.Button", {
                iconCls: 'extIcon extFlag grayColor',
                reorderable: false,
                power: false,
                hidden: !FastExt.System.ChangelogHandler.existChangelog(),
                handler: function () {
                    FastExt.System.ChangelogHandler.showChangelog(this);
                }
            });

            let headItems = [
                this._systemMenuPanelButton,
                this._systemChangelogButton,
                this._systemHistoryButton,
                {xtype: 'tbseparator', reorderable: false,},
                {
                    xtype: 'button',
                    iconCls: 'extIcon extIndex fast-system-color',
                    text: '首页',
                    reorderable: false,
                    power: false,
                    itemId: TabContainerLayout.FAST_TAB_INDEX_ITEM_ID,
                    cls: HeadBarLayout.FAST_HEAD_BUTTON_CLS,
                    handler: function () {
                        FastExt.NormalLayout.TabContainer.showIndex();
                    },
                    menuId: TabContainerLayout.FAST_TAB_INDEX_ITEM_ID,
                    reloadable: true,
                    listeners: {
                        afterrender: function () {
                            //按下就触发功能，体验上会快很多
                            this.getEl().dom.addEventListener("contextmenu", (e: any) => {
                                HeadBarEvent.showContextMenu.call(this, e);
                            });
                        },
                    }
                },
                {xtype: 'tbitem', reorderable: false, width: 0, hidden: true, itemId: "leftButtonAnchor"},
                {xtype: 'tbitem', reorderable: false, width: 0, hidden: true, itemId: "systemMenuAnchor"},
                {xtype: 'tbfill', reorderable: false},
                {xtype: 'tbitem', reorderable: false, width: 0, hidden: true, itemId: "rightButtonAnchor"},
                {
                    xtype: 'button',
                    iconCls: 'extIcon extManager2 fast-system-color',
                    text: FastExt.System.ManagerHandler.getManagerName(),
                    cls: HeadBarLayout.FAST_HEAD_BUTTON_CLS,
                    reorderable: false,
                    power: false,
                    listeners: {
                        render: HeadBarEvent.startFirstMinButton,
                        mouseout: HeadBarEvent.startMinButton,
                        mouseover: HeadBarEvent.startMaxButton,
                    },
                    handler: function () {
                        FastExt.ManagerLayout.showManagerInfo(this);
                    }
                },
                {xtype: 'tbseparator', reorderable: false,},
                {
                    xtype: 'button',
                    iconCls: 'extIcon extFullscreen fast-system-color',
                    text: "进入全屏",
                    power: false,
                    cls: HeadBarLayout.FAST_HEAD_BUTTON_CLS,
                    reorderable: false,
                    listeners: {
                        render: HeadBarEvent.startFirstMinButton,
                        mouseout: HeadBarEvent.startMinButton,
                        mouseover: HeadBarEvent.startMaxButton,
                    },
                    handler: function () {
                        if (FastExt.Windows.isFullscreen()) {
                            FastExt.Windows.outFullscreen();
                            this.setText("进入全屏");
                            this.setIconCls("extIcon extFullscreen fast-system-color");
                        } else {
                            FastExt.Windows.inFullscreen();
                            this.setText("退出全屏");
                            this.setIconCls("extIcon extExitFullscreen fast-system-color");
                        }
                    }
                },
                {
                    xtype: "button",
                    iconCls: 'extIcon extMonitor fast-system-color',
                    cls: HeadBarLayout.FAST_HEAD_BUTTON_CLS,
                    reorderable: false,
                    power: false,
                    text: "服务器监控",
                    listeners: {
                        render: HeadBarEvent.startFirstMinButton,
                        mouseout: HeadBarEvent.startMinButton,
                        mouseover: HeadBarEvent.startMaxButton,
                    },
                    handler: function () {
                        FastExt.DesktopLayout.showWindowPanel(this, "系统监控信息", FastExt.IndexLayout.getSystemMonitorPanel(false));
                    },
                },
                {
                    xtype: 'button',
                    iconCls: 'extIcon extExits redColor',
                    text: "退出登录",
                    cls: HeadBarLayout.FAST_HEAD_BUTTON_CLS,
                    reorderable: false,
                    power: false,
                    listeners: {
                        render: HeadBarEvent.startFirstMinButton,
                        mouseout: HeadBarEvent.startMinButton,
                        mouseover: HeadBarEvent.startMaxButton,
                    },
                    handler: function () {
                        FastExt.LoginLayout.showLogout();
                    }
                }
            ];

            this._headContainer = Ext.create('Ext.toolbar.Toolbar', {
                height: headHeight,
                border: 0,
                power: false,
                userCls: HeadBarLayout.FAST_CONTAINER_CLS,
                bodyCls: HeadBarLayout.FAST_CONTAINER_CLS,
                overflowHandler: 'menu',
                items: headItems,
                plugins: [{
                    ptype: 'boxreorderer',
                }],
                listeners: {
                    overflowbegin: () => {
                        return !this.removeLastSystemMenuButton();
                    },
                    render: (obj) => {
                        FastExt.Listeners.getFire().onInitSystemHeaderItems(this.createHeadHandler());
                        setTimeout(() => {
                            this.checkSystemChangelog();
                        }, 1158);
                    }
                }
            });
            return this._headContainer;
        }

        private createHeadHandler(): FastExt.EventHeadHandler {
            let me = this;
            return new class implements FastExt.EventHeadHandler {
                addLeftButton(button: any): void {
                    if (Ext.isObject(button) && button.xtype === "button") {
                        button.cls = HeadBarLayout.FAST_HEAD_BUTTON_CLS;
                    }
                    button.reorderable = false;
                    me.addHeadLeftButton(button);
                }

                addRightButton(button: any): void {
                    if (Ext.isObject(button) && button.xtype === "button") {
                        button.cls = HeadBarLayout.FAST_HEAD_BUTTON_CLS;
                    }
                    button.reorderable = false;
                    me.addHeadRightButton(button);
                }
            }
        }

        private getSystemMenuButtonAnchorIndex() {
            let systemMenuAnchor = this._headContainer.down("#systemMenuAnchor");
            if (systemMenuAnchor) {
                return this._headContainer.items.indexOf(systemMenuAnchor) + 1;
            }
            return 1;
        }

        private getRightButtonAnchorIndex() {
            let rightButtonAnchor = this._headContainer.down("#rightButtonAnchor");
            if (rightButtonAnchor) {
                return this._headContainer.items.indexOf(rightButtonAnchor) + 1;
            }
            return 1;
        }

        private getLeftButtonAnchorIndex() {
            let rightButtonAnchor = this._headContainer.down("#leftButtonAnchor");
            if (rightButtonAnchor) {
                return this._headContainer.items.indexOf(rightButtonAnchor) + 1;
            }
            return 1;
        }

        private buildSystemMenuButton(menu: any) {
            let closerActionStr = "FastExt.NormalLayout.TabContainer.closeByMenuId('" + menu.id + "')";
            let closerHtml = "<span class='extIcon extClose fast-ext-menu-closer' ></span>";


            let menuHtml = "<div style=\"line-height: 20px;display: flex;\" >" +
                "<span>" + menu.text + "</span>&nbsp;&nbsp;" +
                FastExt.Documents.wrapOnClick(closerHtml, closerActionStr) +
                "</div> ";

            return Ext.create("Ext.button.Button", {
                help: FastExt.System.MenuHandler.getPlainIconMenu(menu, " >> "),
                helpType: FastEnum.HelpEnumType.mouse_in_out,
                helpAnchor: FastEnum.TooltipAnchorType.bottom,
                helpShowDelay: 500,
                cls: HeadBarLayout.FAST_HEAD_BUTTON_CLS,
                text: menuHtml,
                overflowText: menu.text,
                icon: FastExt.Base.formatUrlVersion(menu.icon),
                itemId: menu.id,
                menuId: menu.id,
                systemMenuButton: true,
                closeable: true,
                copyable: true,
                reloadable: true,
                listeners: {
                    afterrender: function () {
                        //按下就触发功能，体验上会快很多
                        this.getEl().dom.addEventListener("contextmenu", (e: any) => {
                            HeadBarEvent.showContextMenu.call(this, e);
                        });
                        this.getEl().dom.addEventListener("mousedown", (event: any) => {
                            if (event.button === 0) {//左键点击
                                FastExt.NormalLayout.TabContainer.showByMenuId(this.menuId);
                            }
                        });
                    },
                }
            });
        }


        /**
         * 检测系统是否有新的更新日志
         */
        checkSystemChangelog() {
            FastExt.System.ChangelogHandler.autoShowChangelog(this._systemChangelogButton);
        }

        /**
         * 添加系统菜单按钮
         * @param menu
         * @param active
         */
        addSystemMenuButton(menu: any, active: boolean) {
            if (FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                return;
            }
            if (!menu) {
                return;
            }
            let systemMenuButton = this.getSystemMenuButton(menu.id);
            if (systemMenuButton) {
                // this._headContainer.moveAfter(systemMenuButton, this.getInsertSystemMenuButtonAnchor());
                return;
            }
            let systemButton = this.buildSystemMenuButton(menu);
            if (active) {
                systemButton.systemMenuButtonChecked = true;
            }
            this._headContainer.insert(this.getSystemMenuButtonAnchorIndex(), systemButton);
        }

        graySystemMenuButton(menuId: string) {
            let systemMenuButton = this.getSystemMenuButton(menuId);
            if (systemMenuButton) {
                systemMenuButton.addCls("fast-gray");
            }
        }

        /**
         * 获取当前系统菜单按钮集合
         */
        getSystemMenuButtons() {
            return this._headContainer.query("[systemMenuButton=true]");
        }

        /**
         * 检测系统菜单按钮是否存在
         * @param menuId
         */
        existSystemMenuButton(menuId: string): boolean {
            return this._headContainer.down("#" + menuId);
        }

        /**
         * 获取系统菜单按钮
         * @param menuId
         */
        getSystemMenuButton(menuId: string) {
            return this._headContainer.down("#" + menuId);
        }

        /**
         * 统计当前显示的系统菜单按钮
         */
        countSystemMenuButton() {
            return this.getSystemMenuButtons().length;
        }

        /**
         * 关闭菜单按钮
         * @param menuId
         */
        closeSystemMenuButton(menuId: string) {
            let menuButton = this._headContainer.down("#" + menuId);
            if (!menuButton) {
                return;
            }
            menuButton.systemMenuButtonChecked = false;
            menuButton.systemMenuButton = false;
            FastExt.Animate.startCloseAnimateByWidth(menuButton);
        }

        /**
         * 关闭所有菜单按钮
         */
        closeAllSystemMenuButton() {
            Ext.suspendLayouts();
            try {
                let systemMenuButtons = this.getSystemMenuButtons();
                for (let systemMenuButton of systemMenuButtons) {
                    systemMenuButton.SystemMenuButtonChecked = false;
                    FastExt.Animate.startCloseAnimateByWidth(systemMenuButton);
                    FastExt.NormalLayout.TabContainer.destroy(systemMenuButton.menuId);
                }
                FastExt.NormalLayout.TabContainer.showIndex();
            } finally {
                Ext.resumeLayouts(true);
            }
        }


        /**
         * 关闭其他菜单按钮
         * @param menuId
         */
        closeOtherSystemMenuButton(menuId: string) {
            let systemMenuButtons = this.getSystemMenuButtons();
            for (let systemMenuButton of systemMenuButtons) {
                if (menuId && systemMenuButton.menuId === menuId) {
                    continue;
                }
                systemMenuButton.SystemMenuButtonChecked = false;
                FastExt.NormalLayout.TabContainer.destroy(systemMenuButton.menuId);
                FastExt.Animate.startCloseAnimateByWidth(systemMenuButton);
            }
        }


        /**
         * 设置某个按钮为选中状态
         * @param itemId
         * @param checked
         */
        setActiveSystemMenuButton(itemId: string, checked: boolean) {
            if (FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                return;
            }
            let itemButton = this._headContainer.down("#" + itemId);
            if (!itemButton) {
                return;
            }
            if (checked) {
                if (this._lastCheckedItemId) {
                    this.setActiveSystemMenuButton(this._lastCheckedItemId, false);
                }
                this._lastCheckedItemId = itemId;
                itemButton.systemMenuButtonChecked = true;
                itemButton.addCls("fast-system-head-button-checked");
                itemButton.removeCls("fast-gray");
                itemButton.safeFocus(100);
            } else {
                itemButton.systemMenuButtonChecked = false;
                itemButton.removeCls("fast-system-head-button-checked");
            }
        }

        /**
         * 移除最右侧的菜单按钮
         */
        removeLastSystemMenuButton() {
            let systemMenuButtons = this.getSystemMenuButtons();
            if (systemMenuButtons.length === 1) {
                //始终保留一个
                return false;
            }
            if (this.hasLastButtonToHide()) {
                //存在正在隐藏的按钮
                return true;
            }
            for (let i = systemMenuButtons.length - 1; i >= 0; i--) {
                let button = systemMenuButtons[i];
                if (this.getActiveSystemMenuButton() === button) {
                    continue;
                }
                button.lastButtonToHide = true;
                FastExt.NormalLayout.TabContainer.hideByMenuId(button.itemId);
                return true;
            }
            return false;
        }

        /**
         * 获取当前选中的系统菜单按钮
         */
        getActiveSystemMenuButton() {
            return this._headContainer.down("[systemMenuButtonChecked=true]");
        }


        /**
         * 根据实际情况选择一个系统菜单按钮
         */
        doActiveSystemMenuButton() {
            Ext.suspendLayouts();
            try {
                let activeSystemMenuButton = this.getActiveSystemMenuButton();
                if (activeSystemMenuButton) {
                    //存在选中的按钮，跳过自动选择
                    return;
                }
                let systemMenuButtons = this.getSystemMenuButtons();
                if (systemMenuButtons.length > 0) {
                    FastExt.NormalLayout.TabContainer.showByMenuId(systemMenuButtons[0].menuId);
                } else {
                    FastExt.NormalLayout.TabContainer.showIndex();
                }
            } finally {
                Ext.resumeLayouts(true);
            }
        }

        hasLastButtonToHide(): boolean {
            return this._headContainer.down("[lastButtonToHide=true]");
        }


        /**
         * 添加头部右侧按钮
         * @param button
         */
        addHeadRightButton(button: any) {
            if (!button) {
                return;
            }
            let btnObj = this._headContainer.insert(this.getRightButtonAnchorIndex(), button);
            if (btnObj.xtype === "button") {
                btnObj.on("render", HeadBarEvent.startFirstMinButton);
                btnObj.on("mouseout", HeadBarEvent.startMinButton);
                btnObj.on("mouseover", HeadBarEvent.startMaxButton);
            }
        }

        /**
         * 添加头部右侧按钮
         * @param button
         */
        addHeadLeftButton(button: any) {
            if (!button) {
                return;
            }
            this._headContainer.insert(this.getLeftButtonAnchorIndex(), button);
        }


        /**
         * 刷新相关按钮的状态
         */
        refreshButtons() {
            this.refreshMenuPanelButton();
            if (FastExt.NormalLayout.HistoryHandler.getHistory().length === 0) {
                FastExt.Animate.startHideAnimateByWidth(this._systemHistoryButton);
            } else {
                this._systemHistoryButton.setHidden(false);
            }
        }

        /**
         * 刷新菜单折叠按钮
         */
        refreshMenuPanelButton() {
            if (this._systemMenuPanelButton) {
                if (FastExt.NormalLayout.TreeMenuContainer.isExpendedMenuPanel()) {
                    this._systemMenuPanelButton.setIconCls("extIcon extArrowLeft3 grayColor");
                } else {
                    this._systemMenuPanelButton.setIconCls("extIcon extArrowRight3 grayColor");
                }
            }
        }

        /**
         * 显示历史菜单
         */
        showMenuHistory() {
            this._historyMenu = Ext.create("Ext.menu.Menu", {
                padding: '0 0 0 0',
                power: false,
                showSeparator: false,
                style: {
                    background: "#ffffff"
                },
                listeners: {
                    hide: {
                        scope: this,
                    },
                },
            });
            this._historyMenu.add({
                text: "清空历史菜单",
                iconCls: 'extIcon extClear grayColor',
                handler: () => {
                    this.clearMenuHistory();
                    FastExt.Dialog.toast("清除成功！");
                }
            });
            this._historyMenu.add("-");
            let history = FastExt.NormalLayout.HistoryHandler.getHistory();
            for (let historyMenu of history) {
                this._historyMenu.add({
                    text: FastExt.System.MenuHandler.getPlainMenu(historyMenu, " > "),
                    icon: historyMenu.icon,
                    handler: function () {
                        FastExt.NormalLayout.TabContainer.showByMenuId(historyMenu.id);
                    },
                });
            }
            this._historyMenu.showBy(this._systemHistoryButton, "tl-bl?");
        }

        /**
         * 清空历史菜单
         */
        clearMenuHistory() {
            for (let history of FastExt.NormalLayout.HistoryHandler.getHistory()) {
                if (this.existSystemMenuButton(history.menuId)) {
                    continue;
                }
                FastExt.NormalLayout.TabContainer.destroy(history.menuId);
            }
            FastExt.NormalLayout.HistoryHandler.clearHistory();
            this.refreshButtons();
        }


    }

    class HeadBarEvent {

        /**
         * 显示系统按钮的右键菜单
         */
        static showContextMenu(event: any) {
            let button = <any>this;
            let menu = Ext.create('Ext.menu.Menu', {
                items: [
                    {
                        text: '关闭当前',
                        iconCls: 'extIcon extClose',
                        disabled: !button.closeable,
                        handler: function () {
                            FastExt.NormalLayout.TabContainer.closeByMenuId(button.menuId);
                        },
                    },
                    '-',
                    {
                        text: '关闭其他标签',
                        iconCls: 'extIcon extCloseOther',
                        handler: function () {
                            FastExt.NormalLayout.HeadBarContainer.closeOtherSystemMenuButton(button.menuId);
                        },
                    },
                    {
                        text: "关闭所有标签",
                        iconCls: 'extIcon extCloseAll',
                        handler: function () {
                            FastExt.NormalLayout.HeadBarContainer.closeAllSystemMenuButton();
                        },
                    },
                    '-',
                    {
                        text: '复制标签',
                        iconCls: 'extIcon extCopy',
                        disabled: !button.copyable,
                        handler: function () {
                            FastExt.NormalLayout.TabContainer.copy(button.menuId);
                        },
                    },
                    {
                        text: '复制标签地址',
                        iconCls: 'extIcon extLink',
                        disabled: !button.copyable,
                        handler: function () {
                            FastExt.NormalLayout.TabContainer.copyUrl(button.menuId);
                        },
                    },
                    {
                        text: '重新加载',
                        iconCls: 'extIcon extReset',
                        disabled: !button.reloadable,
                        handler: function () {
                            FastExt.NormalLayout.TabContainer.reload(button.menuId);
                        },
                    },
                ],
                listeners: {
                    hide: function () {
                        this.delayClose(100);
                    },
                }
            });
            menu.showAt({x: event.x, y: event.y});
        }

        static startFirstMinButton() {
            let button = <any>this;
            FastExt.Animate.startMinButtonAnimateByWidth(button, 1500);
        }

        static startMinButton() {
            let button = <any>this;
            FastExt.Animate.startMinButtonAnimateByWidth(button, 0);
        }

        static startMaxButton() {
            if (FastOverrider.BoxReordererOverrider.DRAGGING) {
                return;
            }
            let button = <any>this;
            FastExt.Animate.startMaxButtonAnimateByWidth(button, 300);
        }

    }

    class HistoryMenuHandler {
        private _historyMenus = [];


        /**
         * 判断菜单是否存在于历史记录中
         * @param menuId
         */
        existHistory(menuId: string): boolean {
            if (FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                return true;
            }
            for (let historyMenu of this._historyMenus) {
                if (historyMenu && historyMenu.id === menuId) {
                    return true;
                }
            }
            return false;
        }

        /**
         * 添加菜单历史打开记录
         * @param menu
         */
        addHistory(menu: any) {
            if (!menu) {
                return;
            }
            if (FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                return;
            }
            if (menu._clone) {
                //来自复制的菜单，不做历史记录
                return;
            }
            if (this.existHistory(menu.id)) {
                this.bringHistoryToFirst(menu.id);
                return;
            }
            this._historyMenus = Ext.Array.insert(this._historyMenus, 0, [menu]);
            this.storeHistory();
        }

        /**
         * 删除历史记录
         * @param menuId
         */
        removeHistory(menuId: string) {
            if (FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                return;
            }
            let exists = [];
            for (let historyMenu of this._historyMenus) {
                if (historyMenu.id === menuId) {
                    exists.push(historyMenu);
                }
            }
            for (let exist1 of exists) {
                this._historyMenus = Ext.Array.remove(this._historyMenus, exist1);
            }
        }

        /**
         * 清空历史打开记录
         */
        clearHistory() {
            this._historyMenus = [];
        }

        getHistory() {
            return this._historyMenus;
        }

        bringHistoryToFirst(menuId: string) {
            if (FastExt.System.InitHandler.isSilenceGlobalSaving()) {
                return;
            }
            let exists = [];
            for (let historyMenu of this._historyMenus) {
                if (historyMenu.id === menuId) {
                    exists.push(historyMenu);
                }
            }
            for (let exist1 of exists) {
                this._historyMenus = Ext.Array.remove(this._historyMenus, exist1);
            }
            this._historyMenus = Ext.Array.insert(this._historyMenus, 0, exists);
        }


        storeHistory() {
            let historyMenuId = [];
            for (let historyMenu of this._historyMenus) {
                historyMenuId.push(historyMenu.id);
            }
            FastExt.Cache.setCache("HistoryMenus", historyMenuId);
        }

        restoreHistory() {
            let historyMenus = FastExt.Cache.getCache("HistoryMenus");
            if (historyMenus) {
                for (let historyMenu of historyMenus) {
                    if (this.existHistory(historyMenu)) {
                        continue;
                    }
                    let menu = FastExt.System.MenuHandler.getMenu(historyMenu);
                    if (menu) {
                        this._historyMenus.push(menu);
                    }
                    if (this._historyMenus.length >= 10) {
                        break;
                    }
                }
            }
        }
    }

}