namespace FastExt {


    /**
     * 桌面布局方式展示
     */
    export class Desktop {


        constructor() {
        }

        //整个桌面是否已渲染完毕
        static desktopInitFinish;

        //整个系统渲染的容器
        static desktopContainer: any;

        //桌面容器，不包含头部
        static desktopPanel: any;

        //开始菜单面板 是否显示中
        static startMenu: any;

        static muuriDragging;

        static muuriContainerIdIndex = 1;

        static lastActiveMenuId = null;

        static lastSelectDesktopImageId = null;

        static muuriGridContainers = null;

        static folderIcon = "icons/icon_system_file.svg";

        static folderColor = "#FFBB00";

        static desktopAllMenusInfo = {};

        static disabledRecordMenu = false;

        static desktopButtonMaxWidth;

        static disabledMenuPathClick = false;


        /**
         * 初始化桌面布局系统
         */
        static initSystem() {
            FastExt.Dialog.hideWait();

            let container = FastExt.System.getBodyContainer();
            container.removeAll();

            let systemBgColor = FastExt.Color.toColor(FastExt.System["theme-color"].value);

            let defaultBtnStyle = {
                background: "#ffffff",
            }

            FastExt.Desktop.desktopPanel = Ext.create('Ext.panel.Panel', {
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                bodyStyle: {
                    background: "transparent",
                    borderWidth: 0,
                },
                border: 0,
                region: 'center',
                anchor: '100% 100%',
                bbar: {
                    xtype: 'toolbar',
                    overflowHandler: 'menu',
                    itemId: 'DesktopToolBar',
                    items: [
                        {
                            xtype: "button",
                            overflowText: "系统菜单",
                            iconCls: 'extIcon extMore whiteColor',
                            cls: 'fast-desktop-toolbar-btn',

                            help: FastExt.System.getPlainIconMenuHtmlBySVG({iconCls: "extMore", text: "系统菜单"}),
                            style: {
                                background: systemBgColor,
                            },
                            focusCls: 'fast-desktop-toolbar-btn-focus',
                            helpType: FastEnum.HelpEnumType.mouse_in_out,
                            helpAnchor: FastEnum.TooltipAnchorType.bottom,
                            reorderable: false,
                            handler: function () {
                                FastExt.Desktop.toggleStartMenu(this);
                            },
                        },
                        {
                            xtype: 'tbseparator',
                            reorderable: false,
                        },
                        {
                            xtype: 'tbspacer',
                            reorderable: false,
                            desktopFixedMenuAnchor: true,
                        },
                        {xtype: 'tbfill', reorderable: false, desktopMenuAnchor: true,},
                        {
                            xtype: "button",
                            iconCls: 'extIcon extTip blackColor',
                            cls: 'fast-desktop-toolbar-btn',
                            overflowText: "系统待办事项",
                            reorderable: false,
                            help: FastExt.System.getPlainIconMenuHtmlBySVG({iconCls: "extTip", text: "系统待办事项"}),
                            style: defaultBtnStyle,
                            helpType: FastEnum.HelpEnumType.mouse_in_out,
                            helpAnchor: FastEnum.TooltipAnchorType.bottom,
                            handler: function () {
                                FastExt.Desktop.showWindowPanel(this, "系统待办事项", FastExt.System.getSystemWaitNotice(false));
                            },
                        },
                        {
                            xtype: "button",
                            iconCls: 'extIcon extLog blackColor',
                            cls: 'fast-desktop-toolbar-btn',
                            overflowText: "系统操作日志",
                            help: FastExt.System.getPlainIconMenuHtmlBySVG({iconCls: "extLog", text: "系统操作日志"}),
                            style: defaultBtnStyle,
                            helpType: FastEnum.HelpEnumType.mouse_in_out,
                            helpAnchor: FastEnum.TooltipAnchorType.bottom,
                            reorderable: false,
                            handler: function () {
                                FastExt.Desktop.showWindowPanel(this, "系统操作日志", FastExt.System.getSystemOperate(false));
                            },
                        },
                        {xtype: 'tbseparator', reorderable: false,},
                        {
                            xtype: "button",
                            iconCls: 'extIcon extVersion blackColor',
                            cls: 'fast-desktop-toolbar-btn',
                            overflowText: "系统基本信息",
                            reorderable: false,
                            help: FastExt.System.getPlainIconMenuHtmlBySVG({
                                iconCls: "extVersion",
                                text: "系统基本信息"
                            }),
                            style: defaultBtnStyle,
                            helpType: FastEnum.HelpEnumType.mouse_in_out,
                            helpAnchor: FastEnum.TooltipAnchorType.bottom,
                            handler: function () {
                                FastExt.Desktop.showWindowPanel(this, "系统基本信息", FastExt.System.getSystemVersion(false));
                            },
                        },
                        {
                            xtype: "button",
                            iconCls: 'extIcon extMonitor blackColor',
                            cls: 'fast-desktop-toolbar-btn',
                            reorderable: false,
                            overflowText: "系统监控信息",
                            help: FastExt.System.getPlainIconMenuHtmlBySVG({
                                iconCls: "extMonitor",
                                text: "系统监控信息"
                            }),
                            style: defaultBtnStyle,
                            helpType: FastEnum.HelpEnumType.mouse_in_out,
                            helpAnchor: FastEnum.TooltipAnchorType.bottom,
                            handler: function () {
                                FastExt.Desktop.showWindowPanel(this, "系统监控信息", FastExt.System.getSystemMonitor(false));
                            },
                        },
                        {
                            xtype: "button",
                            iconCls: 'extIcon extSet blackColor',
                            cls: 'fast-desktop-toolbar-btn',
                            reorderable: false,
                            overflowText: "系统全局设置",
                            help: FastExt.System.getPlainIconMenuHtmlBySVG({iconCls: "extSet", text: "系统全局设置"}),
                            style: defaultBtnStyle,
                            helpType: FastEnum.HelpEnumType.mouse_in_out,
                            helpAnchor: FastEnum.TooltipAnchorType.bottom,
                            handler: function () {
                                FastExt.Desktop.showWindowPanel(this, "系统全局设置", FastExt.System.getSystemConfig(false));
                            },
                        }
                    ],
                    userCls: "fast-desktop-tool-bar",
                    plugins: [{
                        ptype: 'boxreorderer',
                        listeners: {
                            StartDrag: FastExt.DesktopEvent.onFastToolbarStartDrag,
                            Drop: FastExt.DesktopEvent.onFastToolbarDrop,
                        }
                    }],
                    listeners: {
                        afterlayout: function () {
                            this.getEl().on("dblclick", function () {
                                FastExt.Desktop.hideAllDesktopWin();
                            });
                            this.getEl().on("contextmenu", function (e) {
                                e.stopEvent();
                            });
                        }
                    }
                },
                addDesktopItem: function (menu, toContainer?) {
                    if (toContainer) {
                        toContainer.addDesktopItem(menu);
                    } else if (FastExt.Desktop.checkMenuFolder(menu)) {
                        let container = this.child("[alignRight=false]");
                        container.addDesktopItem(menu);
                    } else {
                        let container = this.child("[alignRight=true]");
                        container.addDesktopItem(menu);
                    }
                },
                removeDesktopItem: function (menu) {
                    let containers = this.query("[desktopItemContainer=true]");
                    for (let i = 0; i < containers.length; i++) {
                        if (FastExt.Base.toBool(containers[i].folderLocked, false)) {
                            //已锁定的文件夹，不可移出
                            return;
                        }
                        containers[i].removeDesktopItem(menu);
                    }
                },
                checkMuuriGridReady: function () {
                    let containers = this.query("[desktopItemContainer=true]");
                    if (containers.length > 0) {
                        for (let i = 0; i < containers.length; i++) {
                            if (!FastExt.Base.toBool(containers[i].muuriReady, false)) {
                                return false;
                            }
                        }
                        return true;
                    }
                    return false;
                },
                rebindMuuriGrid: function () {
                    let containers = this.query("[desktopItemContainer=true]");
                    if (containers.length > 0) {
                        for (let i = 0; i < containers.length; i++) {
                            containers[i].bindMuuriGrid();
                        }
                    }
                },
                resetDesktop: function (configMenus) {
                    try {
                        this.removeAll();
                        FastExt.Desktop.removeAllDesktopToolbarFixedButton();

                        this.configMenus = configMenus;
                        let allDesktopMenuInfo = FastExt.Desktop.getAllDesktopMenuInfo(configMenus);
                        let rightItems = [], leftItems = [], fixedMenus = [];
                        for (let desktopMenusKey in allDesktopMenuInfo) {
                            let menu = allDesktopMenuInfo[desktopMenusKey];

                            let needDesktop = !FastExt.Desktop.checkMenuInFolder(menu);

                            if (needDesktop) {
                                if (menu.desktop) {
                                    if (Ext.isEmpty(menu.desktop_align)) {
                                        if (FastExt.Desktop.checkMenuFolder(menu)) {
                                            leftItems.push(menu);
                                        } else {
                                            rightItems.push(menu);
                                        }
                                    } else {
                                        if (menu.desktop_align === "right") {
                                            rightItems.push(menu);
                                        } else {
                                            leftItems.push(menu);
                                        }
                                    }
                                }
                            }

                            if (menu.desktop_fixed) {
                                fixedMenus.push(menu);
                            }
                        }

                        rightItems.sort(function (a, b) {
                            return a.desktop_index - b.desktop_index;
                        });
                        leftItems.sort(function (a, b) {
                            return a.desktop_index - b.desktop_index;
                        });

                        fixedMenus.sort(function (a, b) {
                            return a.desktop_fixed_index - b.desktop_fixed_index;
                        });

                        this.add(FastExt.Desktop.buildDesktopItemPanel(leftItems, false, true, false), FastExt.Desktop.buildDesktopItemPanel(rightItems, true, true, false));

                        FastExt.Desktop.addDesktopToolbarFixedButton(fixedMenus, true);
                    } finally {
                        this.rebindMuuriGrid();
                        FastExt.Dialog.hideWait();

                        let tabFromHrefMenuId = FastExt.System.getMenuIdFromLocation();
                        let hasFromHrefMenu = FastExt.Desktop.getMenu(tabFromHrefMenuId);
                        if (hasFromHrefMenu) {
                            FastExt.Desktop.showWindowMenu(null, hasFromHrefMenu, true);
                        }

                        FastExt.Desktop.desktopInitFinish = true;
                    }
                },
                reorderDesktop: function () {
                    try {
                        this.removeAll();
                        let allDesktopMenuInfo = FastExt.Desktop.getAllDesktopMenuInfo(this.configMenus);
                        let rightItems = [], leftItems = [];
                        for (let desktopMenusKey in allDesktopMenuInfo) {
                            let menu = allDesktopMenuInfo[desktopMenusKey];
                            let needDesktop = !FastExt.Desktop.checkMenuInFolder(menu);
                            if (needDesktop) {
                                if (menu.desktop) {
                                    if (FastExt.Desktop.checkMenuFolder(menu)) {
                                        leftItems.push(menu);
                                    } else {
                                        rightItems.push(menu);
                                    }
                                }
                            }
                        }
                        rightItems.sort(function (a, b) {
                            return a.desktop_index - b.desktop_index;
                        });
                        leftItems.sort(function (a, b) {
                            return a.desktop_index - b.desktop_index;
                        });

                        this.add(FastExt.Desktop.buildDesktopItemPanel(leftItems, false, true, false), FastExt.Desktop.buildDesktopItemPanel(rightItems, true, true, false));
                    } finally {
                        this.rebindMuuriGrid();
                    }
                },
                listeners: {
                    afterrender: function () {
                        this.getEl().on("contextmenu", FastExt.DesktopEvent.onFastDesktopContextMenu, this);
                        FastExt.Desktop.restoreSystemDesktopMenus();
                    },
                },
            });

            let defaultDesktopBgImg = FastExt.Objects.safeObject(FastExt.System["desktop-bg-image"]).value;
            if (Ext.isEmpty(defaultDesktopBgImg)) {
                defaultDesktopBgImg = "base/desktop/desktop_bg_img_default.jpg";
            }

            FastExt.Desktop.desktopContainer = Ext.create('Ext.container.Container', {
                layout: 'border',
                border: 0,
                style: {
                    backgroundImage: "url('" + defaultDesktopBgImg + "')",
                    backgroundSize: "cover",
                },
                items: [FastExt.System.getSystemHeaderPanel(["headContainer", "fast-desktop-header-container"]), FastExt.Desktop.desktopPanel],
            });

            container.add(FastExt.Desktop.desktopContainer);
        }

        /**
         * 获取菜单对象
         * @param menuId
         */
        static getMenu(menuId): any {
            if (FastExt.Desktop.desktopAllMenusInfo.hasOwnProperty(menuId)) {
                return FastExt.Desktop.desktopAllMenusInfo[menuId];
            }
            return FastExt.System.getMenu(menuId);
        }

        /**
         * 根据muuriGrid选项获取绑定的菜单对象
         * @param item
         */
        static getMenuByMuuriGridItem(item): any {
            let jqueryEl = $(item.getElement());
            let dataMenuId = jqueryEl.attr("data-menu-id");
            let dataMenuType = jqueryEl.attr("data-menu-type");
            if (Ext.isEmpty(dataMenuId)) {
                return null;
            }
            return FastExt.Desktop.getMenu(dataMenuId);
        }

        /**
         * 还原系统菜单配置
         */
        static restoreSystemDesktopMenus() {
            if (window["indexLottie"]) {
                window["indexLottie"].destroy();
                window["indexLottie"] = null;
            }
            Ext.MessageBox.updateProgress(1, '即将完成操作，请耐心等待', '系统初始化成功！获取菜单中…');

            if (FastExt.Base.toBool(FastExt.Objects.safeObject(FastExt.System['desktop-menu-record']).value, true)) {
                FastExt.Desktop.restoreMenu().then(function (value) {
                    FastExt.Desktop.desktopPanel.resetDesktop(FastExt.Json.jsonToObject(value));
                    if (FastExt.Listeners.onFinishSystem) {
                        FastExt.Listeners.onFinishSystem();
                    }
                });
            } else {
                FastExt.Desktop.desktopPanel.resetDesktop({});
                if (FastExt.Listeners.onFinishSystem) {
                    FastExt.Listeners.onFinishSystem();
                }
            }

        }

        /**
         * 获取需要在桌面显示图标的菜单
         */
        static getAllDesktopMenuInfo(recordMenuConfig?) {
            let takeAllDesktopMenu = function (parent, menus) {
                let desktopMenus = [];
                for (let i = 0; i < menus.length; i++) {
                    let menu = menus[i];
                    let cloneMenu = Ext.clone(menu);
                    cloneMenu.parent = parent;
                    cloneMenu.desktop = FastExt.Base.toBool(cloneMenu.desktop, cloneMenu.depth === 1);
                    cloneMenu.desktop_fixed = FastExt.Base.toBool(cloneMenu.desktop_fixed);

                    if (cloneMenu.desktop || cloneMenu.desktop_fixed) {
                        if (!cloneMenu.leaf) {
                            cloneMenu.desktop_type = "folder";
                        }
                        desktopMenus.push(cloneMenu);
                    }

                    if (cloneMenu.children) {
                        let childTakes = takeAllDesktopMenu(cloneMenu, cloneMenu.children);
                        desktopMenus = desktopMenus.concat(childTakes);
                    }
                }
                return desktopMenus;
            };

            let systemMenus = takeAllDesktopMenu(null, FastExt.System.menus);

            for (let i = 0; i < systemMenus.length; i++) {
                let childMenu = systemMenus[i];
                let exitMenu = FastExt.Objects.safeObject(FastExt.Desktop.desktopAllMenusInfo[childMenu.id]);
                FastExt.Desktop.desktopAllMenusInfo[childMenu.id] = Ext.Object.merge(exitMenu, childMenu);
            }


            //还原配置，如果存在则覆盖，不存在则添加
            let configMenus = [];
            if (recordMenuConfig) {
                for (let configMenuKey in recordMenuConfig) {
                    configMenus.push(recordMenuConfig[configMenuKey]);
                }
            }
            for (let i = 0; i < configMenus.length; i++) {
                let configMenu = configMenus[i];
                let exitMenu = FastExt.Desktop.desktopAllMenusInfo[configMenu.id];
                if (!exitMenu) {
                    exitMenu = FastExt.System.getMenu(configMenu.id);
                }
                if (!exitMenu) {
                    if (FastExt.Base.toString(configMenu.desktop_from, "none") === "user") {
                        //来自用户自主创建的菜单，可添加合并
                        exitMenu = {};
                    } else {
                        //跳过系统不存在的菜单，避免权限问题！
                        continue;
                    }
                }
                FastExt.Desktop.desktopAllMenusInfo[configMenu.id] = Ext.Object.merge(exitMenu, configMenu);
            }

            for (let desktopAllMenusInfoKey in FastExt.Desktop.desktopAllMenusInfo) {
                let realMenu = FastExt.Desktop.desktopAllMenusInfo[desktopAllMenusInfoKey];
                if (Ext.isEmpty(realMenu.desktop_folder_id)) {
                    realMenu.desktop_folder_id = "desktop";
                }
                if (Ext.isEmpty(realMenu.treeGroup)) {
                    realMenu.treeGroup = FastExt.Base.buildOnlyCode("F");
                }
            }
            return FastExt.Desktop.desktopAllMenusInfo;
        }

        /**
         * 构建桌面布局容器
         * @param menus
         * @param alignRight
         * @param horizontal
         * @param scrollable
         */
        static buildDesktopItemPanel(menus: any, alignRight: boolean, horizontal: boolean, scrollable: boolean) {
            let containerId = "muuri-grid-container-" + (FastExt.Desktop.muuriContainerIdIndex++);
            return {
                xtype: "container",
                layout: 'fit',
                border: 0,
                desktopItemContainer: true,
                alignRight: alignRight,
                horizontal: horizontal,
                flex: 1,
                anchor: '100% 100%',
                configMenus: menus,
                muuriReady: false,
                muuriGridContainerId: containerId,
                html: "<div id='" + containerId + "-root' style='width: 100%;height: 100%;display: flex;justify-content:" + (alignRight ? "end" : "start") + "; overflow: " + (scrollable ? "auto" : "hidden") + ";padding: 5px;'>" +
                    "<div id='" + containerId + "' style='width: 100%;height: 100%; position: relative;' ></div></div>",
                listeners: {
                    destroy: function () {
                        FastExt.MuuriTool.releaseMuuriGrid(this);
                        FastExt.Desktop.refreshMuuriGridContainers();
                    },
                },
                getMuuriGridContainerId: function () {
                    return this.muuriGridContainerId;
                },
                bindMuuriGrid: function (callBack?) {
                    let me = this;
                    FastExt.MuuriTool.justBindToContainer(this, {
                        dragEnabled: !FastExt.Base.toBool(this.folderLocked, false),
                        dragContainer: document.body,
                        layout: {
                            alignRight: this.alignRight,
                            horizontal: this.horizontal,
                            fillGaps: true,
                            rounding: true,
                        },
                        // dragPlaceholder: {
                        //     enabled: true,
                        //     createElement: (item) => item.getElement().cloneNode(true),
                        // },
                        dragStartPredicate: FastExt.DesktopEvent.onFastMuuriGridDragStartPredicate,
                        dragSort: FastExt.DesktopEvent.onFastMuuriGridDragSort,
                        dragSortPredicate: FastExt.DesktopEvent.onFastMuuriGridDragSortPredicate,
                    }, function (muuriGrid) {
                        if (me.configMenus) {
                            me.addDesktopItems(me.configMenus);
                        }
                        me.muuriReady = true;
                        muuriGrid.containerId = me.getId();
                        muuriGrid.on("dragReleaseEnd", FastExt.DesktopEvent.onFastMuuriGridDragEnd);
                        muuriGrid.on("add", FastExt.DesktopEvent.onFastMuuriGridChange);
                        muuriGrid.on("remove", FastExt.DesktopEvent.onFastMuuriGridChange);
                        muuriGrid.on("dragInit", FastExt.DesktopEvent.onFastMuuriGridDragInit);
                        muuriGrid.on("send", FastExt.DesktopEvent.onFastMuuriGridSend);

                        FastExt.Desktop.refreshMuuriGridContainers();

                        if (me.ownerCt) {
                            me.ownerCt.updateLayout();
                        }
                        if (callBack) {
                            callBack();
                        }
                    });
                },
                addDesktopItems: function (menus) {
                    if (!menus) {
                        return;
                    }
                    let muuriGrid = FastExt.MuuriTool.getMuuriGrid(this);
                    if (!muuriGrid) {
                        return;
                    }
                    let cmpItems = [];
                    for (let i = 0; i < menus.length; i++) {
                        let menu = menus[i];
                        if (!FastExt.Base.toBool(menu.desktop_temp, false)) {
                            menu.desktop = true;
                            FastExt.Desktop.desktopAllMenusInfo[menu.id] = menu;
                        }
                        cmpItems.push(FastExt.Desktop.buildDesktopItem(menu));
                    }
                    if (cmpItems.length > 0) {
                        muuriGrid.add(cmpItems);
                    }
                },
                addDesktopItem: function (menu) {
                    if (!menu) {
                        return;
                    }
                    if (Ext.isArray(menu)) {
                        this.addDesktopItems(menu);
                        return;
                    }
                    let muuriGrid = FastExt.MuuriTool.getMuuriGrid(this);
                    if (!muuriGrid) {
                        return;
                    }

                    if (!FastExt.Base.toBool(menu.desktop_temp, false)) {
                        menu.desktop = true;
                        FastExt.Desktop.desktopAllMenusInfo[menu.id] = menu;
                    }

                    muuriGrid.add(FastExt.Desktop.buildDesktopItem(menu));
                },
                removeDesktopItem: function (menu) {
                    if (!menu) {
                        return;
                    }
                    let muuriGrid = FastExt.MuuriTool.getMuuriGrid(this);
                    if (!muuriGrid) {
                        return;
                    }
                    let menuItems = $("#" + this.muuriGridContainerId).find("[data-menu-id=" + menu.id + "]");
                    let waitRemoves = [];
                    for (let i = 0; i < menuItems.length; i++) {
                        let el = menuItems[i];
                        let item = muuriGrid.getItem(el);
                        if (item) {
                            waitRemoves.push(item);
                        }
                    }
                    if (FastExt.Desktop.desktopAllMenusInfo.hasOwnProperty(menu.id)) {
                        FastExt.Desktop.desktopAllMenusInfo[menu.id].desktop = false;
                    }
                    muuriGrid.remove(waitRemoves, {removeElements: true});
                },
                removeAllDesktopItem: function () {
                    let muuriGrid = FastExt.MuuriTool.getMuuriGrid(this);
                    if (!muuriGrid) {
                        return;
                    }
                    let allItems = muuriGrid.getItems();
                    let waitRemoves = [];
                    for (let i = 0; i < allItems.length; i++) {
                        waitRemoves.push(allItems[i]);

                        let jqueryEl = $(allItems[i].getElement());
                        let dataMenuId = jqueryEl.attr("data-menu-id");

                        if (FastExt.Desktop.desktopAllMenusInfo.hasOwnProperty(dataMenuId)) {
                            FastExt.Desktop.desktopAllMenusInfo[dataMenuId].desktop = false;
                        }
                    }
                    muuriGrid.remove(waitRemoves, {removeElements: true});
                },
                getAllDesktopItemMenus: function () {
                    let muuriGrid = FastExt.MuuriTool.getMuuriGrid(this);
                    if (!muuriGrid) {
                        return [];
                    }
                    let allItems = muuriGrid.getItems();
                    let menus = [];
                    for (let i = 0; i < allItems.length; i++) {
                        let elem = allItems[i].getElement();
                        let jqueryEl = $(elem);
                        let dataMenuId = jqueryEl.attr("data-menu-id");
                        let dataMenuType = jqueryEl.attr("data-menu-type");
                        if (Ext.isEmpty(dataMenuId)) {
                            continue;
                        }
                        let menu = FastExt.Desktop.getMenu(dataMenuId);
                        if (!menu) {
                            continue;
                        }

                        if (FastExt.Base.toBool(this.alignRight, false)) {
                            menu.desktop_align = "right";
                        } else {
                            menu.desktop_align = "left";
                        }
                        menu.desktop_type = dataMenuType;
                        menu.desktop_index = i;

                        menus.push(menu);
                    }
                    return menus;
                },
                muuriGridLayout: function () {
                    let muuriGrid = FastExt.MuuriTool.getMuuriGrid(this);
                    if (!muuriGrid) {
                        return;
                    }
                    muuriGrid.layout();
                },
            }
        }

        /**
         * 构建桌面图标选项
         * @param menu
         * @param itemWidth
         */
        static buildDesktopItem(menu) {

            let itemWidth = FastExt.Desktop.getDesktopButtonMaxWidth();
            let itemTitleWidth = FastExt.Desktop.getDesktopButtonTitleMaxWidth();

            if (Object.keys(menu).length === 0) {
                let empty = $("<div style='width: " + itemWidth + "px;position: absolute;margin: 5px;background:transparent;pointer-events: none;'>" +
                    "<div >" +
                    " <div  " +
                    " style='height:" + itemWidth * 2 + "px;'></div>" +
                    "</div>" +
                    "</div>");
                return empty[0];
            }

            if (Ext.isEmpty(menu.desktop_type)) {
                menu.desktop_type = "item";
            }

            let bgColor = FastExt.Desktop.safeGetMenuColor(menu);
            let bgColorTop = menu.color5;
            let locked = FastExt.Base.toBool(menu.desktop_locked, false);

            let isFolder = FastExt.Desktop.checkMenuFolder(menu);


            if (Ext.isEmpty(bgColorTop)) {
                if (FastExt.Desktop.checkMenuFolder(menu)) {
                    bgColorTop = "#FFEE99";
                } else {
                    bgColorTop = "#f0f0f0";
                }
            }


            let icons = [menu.icon];
            if (isFolder) {
                icons = [];
                let child = FastExt.Desktop.getFolderChildMenus(menu.id);
                for (let i = 0; i < child.length; i++) {
                    icons.push(FastExt.Desktop.safeGetMenuIcon(child[i]));
                    if (icons.length === 4) {
                        break;
                    }
                }
                // itemWidth = itemWidth + 10;
            }

            let bgStyle = bgColor;
            if (FastExt.System.isThemeWrap()) {
                bgStyle = "linear-gradient(0deg," + bgColor + ", " + bgColorTop + ");"
            }

            let itemHtml = "<div data-desktop-menu-item='true' data-menu-id='" + menu.id + "' data-menu-type='" + menu.desktop_type + "' " +
                " style='position: absolute;background:transparent;display: flex;align-items: center;justify-content: center;'>" +
                "<div class='fast-desktop-item' style='padding: 5px;'>" +
                " <div data-menu-bg='true' class='" + (isFolder ? 'fast-desktop-item-icon-grid' : 'fast-desktop-item-icon') + "'" +
                " style='height:" + itemWidth + "px;background:" + bgStyle + ";width:" + itemWidth + "px;" +
                " box-shadow: " + (isFolder ? '0px 0px 1px 1px black;' : '0px 1px 1px black;') + "'>";


            for (let i = 0; i < icons.length; i++) {
                itemHtml += "<img data-menu-icon='true' src='" + FastExt.System.takeIcon(icons[i], "#ffffff") + "'  alt='" + menu.text + "' />";
            }

            itemHtml += (locked ? "<div style='background: black;width:5px;height:5px;position: absolute;left: 13px;top: 8px;border-radius: 5px;'></div>" : "") +
                "</div>" +
                " <div data-menu-text='true' style='width: " + itemTitleWidth + "px;' class='fast-desktop-item-title'>" + menu.text + "</div>" +
                "</div>" +
                "</div>";

            let item = $(itemHtml);

            item.on("click", FastExt.DesktopEvent.onFastDesktopItemClick);
            item.on("contextmenu", FastExt.DesktopEvent.onFastDesktopItemContextMenu);

            return item[0];
        }

        /**
         * 获取系统桌面的图标显示的宽度
         */
        static getDesktopButtonMaxWidth() {
            if (Ext.isEmpty(FastExt.Desktop.desktopButtonMaxWidth)) {
                FastExt.Desktop.desktopButtonMaxWidth = parseInt((document.body.clientWidth / 36).toFixed(0));
            }
            return FastExt.Desktop.desktopButtonMaxWidth;
        }

        /**
         * 获取系统桌面的图标文字最大宽度
         */
        static getDesktopButtonTitleMaxWidth() {
            return FastExt.Desktop.getDesktopButtonMaxWidth() + 10;
        }


        /**
         * 打开或关闭系统菜单
         * @param obj
         */
        static toggleStartMenu(obj) {
            if (!FastExt.Desktop.startMenu) {
                let leftTreeWidth = parseInt((document.body.clientWidth * 0.25).toFixed(0));
                let leftTreePanel = Ext.create('Ext.panel.Panel', {
                    border: 0,
                    region: 'center',
                    bodyStyle: {
                        borderWidth: 0,
                    },
                    cls: 'treelist-with-nav',
                    scrollable: "y",
                    items: [
                        {
                            xtype: 'treelist',
                            id: 'leftTreeList',
                            reference: 'treelist',
                            expanderOnly: false,
                            singleExpand: false,
                            ui: 'nav',
                            scrollable: "y",
                            expanderFirst: false,
                            selectOnExpander: true,
                            highlightPath: true,
                            store: {
                                type: 'tree',
                                root: {
                                    expanded: true,
                                    children: FastExt.System.menus
                                }
                            },
                            listeners: {
                                itemclick: function (sender, info, eOpts) {
                                    if (info.node.data.leaf) {
                                        FastExt.Desktop.showWindowMenu("button", info.node.data);
                                    }
                                },
                                itemcontextmenu: function (treeview, treeitem, e) {
                                    FastExt.DesktopEvent.onFastMenuItemContextMenu(treeview, treeitem.getNode().data, e);
                                },
                            },
                        }],
                    listeners: {
                        resize: function (obj, width, height, oldWidth, oldHeight, eOpts) {
                            let pressed = width <= 128;
                            let treelist = Ext.getCmp("leftTreeList");
                            let ct = treelist.ownerCt.ownerCt;
                            treelist.setMicro(pressed);
                            if (pressed) {
                                ct.setWidth(44);
                            } else {
                                ct.setWidth(width);
                            }
                        }
                    }
                });

                let leftContainer = Ext.create('Ext.panel.Panel', {
                    layout: 'border',
                    region: 'center',
                    border: 0,
                    bodyStyle: {
                        borderWidth: 0,
                    },
                    width: leftTreeWidth,
                    minWidth: 44,
                    maxWidth: 500,
                    subtitle: '左侧菜单',
                    split: true,
                    style: {
                        background: '#32404e'
                    },
                    items: [leftTreePanel],
                });

                // let winWidth = parseInt((document.body.clientWidth * 0.7).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.8).toFixed(0));

                FastExt.Desktop.startMenu = Ext.create('Ext.menu.Menu', {
                    showSeparator: false,
                    layout: 'border',
                    padding: '0 0 0 0',
                    border: 0,
                    style: {
                        background: "#32404e",
                        borderWidth: 0,
                    },
                    userCls: "desktop-start-menu",
                    width: leftTreeWidth,
                    height: winHeight,
                    items: [leftContainer],
                    listeners: {
                        hide: function (obj, epts) {
                            // obj.close();
                        }
                    },
                });
            }
            FastExt.Desktop.startMenu.showBy(FastExt.Desktop.desktopPanel.down("#DesktopToolBar"));
        }

        /**
         * 隐藏桌面所有的窗口
         */
        static hideAllDesktopWin() {
            let windows = Ext.ComponentQuery.query("[desktopWin=true]");
            for (let i = 0; i < windows.length; i++) {
                let win = windows[i];
                if (win.hideAction && win.hideAction === "destroy") {
                    win.hide(win.animateTarget, win.destroy, win);
                } else {
                    win.hide();
                }
            }
        }

        /**
         * 关闭桌面的所有菜单窗口
         */
        static closeAllDesktopWin() {
            let windows = Ext.ComponentQuery.query("[desktopWin=true]");
            for (let i = 0; i < windows.length; i++) {
                let win = windows[i];
                win.close();
            }
        }

        /**
         * 获取工具栏可插入菜单按钮的位置
         */
        static getInsertMenuButtonIndex() {
            let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
            let desktopMenuAnchor = bottomBar.down("[desktopMenuAnchor=true]");
            if (desktopMenuAnchor) {
                return bottomBar.items.indexOf(desktopMenuAnchor);
            }
            return 1;
        }

        /**
         * 获取工具栏可插入固定菜单的按钮位置
         */
        static getInsertFixedButtonIndex() {
            let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
            let desktopMenuAnchor = bottomBar.down("[desktopFixedMenuAnchor=true]");
            if (desktopMenuAnchor) {
                return bottomBar.items.indexOf(desktopMenuAnchor);
            }
            return 1;
        }

        /**
         * 在窗体中打开meun菜单
         * @param animObj
         * @param menu
         * @param active
         */
        static showWindowMenu(animObj, menu, active?) {
            if (FastExt.Desktop.muuriDragging) {
                return;
            }
            if (!menu) {
                return;
            }

            if (FastExt.Desktop.hasWindowMenu(menu)) {
                return;
            }

            if (FastExt.Desktop.checkMenuFolder(menu)) {
                FastExt.Desktop.showFolder(animObj, menu, active);
                return;
            }

            let winWidth = parseInt((document.body.clientWidth * 0.8).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.9).toFixed(0));
            let win = Ext.create('Ext.window.Window', {
                title: FastExt.Desktop.getMenuPath(menu, "#ffffff", "20px"),
                realTitle: menu.text,
                menuId: menu.id,
                menuData: menu,
                menuContainer: true,
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 800,
                layout: 'fit',
                resizable: true,
                constrainHeader: true,
                maximizable: true,
                entityWindow: true,
                desktopWin: true,
                tools: [
                    {
                        type: 'minus',
                        callback: function (owner) {
                            owner.hide();
                        }
                    },
                ],
                listeners: {
                    show: function (win) {
                        win.shown = true;
                        if (!win.methodInvoked || FastExt.System.silenceGlobalSave) {
                            FastExt.System.asyncMethod(menu.method).then(function (obj) {
                                if (obj == null) {
                                    return;
                                }
                                let entityOwner = obj.down("[entityList=true]");
                                if (entityOwner) {
                                    entityOwner.where = FastExt.Json.mergeJson({}, entityOwner.where);
                                    entityOwner.code = $.md5(menu.id);
                                    entityOwner.buildCodeText = menu.text;
                                }
                                win.add(obj);
                                win.methodInvoked = true;
                            });
                        }
                        FastExt.Desktop.refreshActiveToolbarButton();
                    },
                    destroy: FastExt.DesktopEvent.onFastWindowMenuDestroy,
                    activate: FastExt.Desktop.refreshActiveToolbarButton,
                    hide: FastExt.Desktop.refreshActiveToolbarButton,
                    close: FastExt.Desktop.refreshActiveToolbarButton,
                    drag: function () {
                        FastExt.Desktop.disabledMenuPathClick = true;
                    },
                    dragend: function (obj, e) {
                        new Ext.util.DelayedTask(function () {
                            FastExt.Desktop.disabledMenuPathClick = false;
                        }, this).delay(100);
                    },
                }
            });

            FastExt.Desktop.addDesktopToolbarButton(menu);


            if (active) {
                FastExt.Desktop.activeToolbarButton(menu.id);
            }

            if (Ext.isObject(animObj)) {
                win.animateTarget = animObj;
            }

            let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
            if (bottomBar) {
                let x = (document.body.clientWidth - winWidth) / 2;
                let y = (document.body.clientHeight - bottomBar.getHeight() - winHeight) / 2;
                win.showAt(x, y);
            } else {
                win.show();
            }
        }

        /**
         * 关闭工具栏上的按钮
         * @param button
         */
        static closeToolbarMenuButton(button) {
            if (button && button.menuWin) {
                button.menuWin.close();
                button.menuWin = null;
            } else {
                let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
                if (bottomBar) {
                    bottomBar.remove(button, true);
                }
            }
        }

        /**
         * 关闭出当前以外的其他菜单按钮
         * @param anchorBtn
         * @param direction
         */
        static closeOtherToolbarMenuButton(anchorBtn, direction) {
            let toolBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
            if (toolBar) {
                let menuButtons = toolBar.query("[desktopMenuButton=true]");
                let anchorIndex = -1;
                for (let i = 0; i < menuButtons.length; i++) {
                    if (anchorBtn.getId() === menuButtons[i].getId()) {
                        anchorIndex = i;
                        continue;
                    }
                    if (direction === "all") {
                        FastExt.Desktop.closeToolbarMenuButton(menuButtons[i]);
                    } else if (direction === "right" && anchorIndex >= 0) {
                        FastExt.Desktop.closeToolbarMenuButton(menuButtons[i]);
                    } else if (direction === "left" && anchorIndex < 0) {
                        FastExt.Desktop.closeToolbarMenuButton(menuButtons[i]);
                    }
                }
            }

        }

        /**
         * 关闭工具栏上的所有功能按钮
         */
        static closeAllToolbarMenuButton() {
            let toolBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
            if (toolBar) {
                let menuButtons = toolBar.query("[desktopMenuButton=true]");
                for (let i = 0; i < menuButtons.length; i++) {
                    FastExt.Desktop.closeToolbarMenuButton(menuButtons[i]);
                }
            }
        }

        /**
         * 弹出系统相关功能面板窗体查看
         * @param obj
         * @param title
         * @param panel
         */
        static showWindowPanel(obj, title, panel) {
            if (!obj) {
                obj = {
                    getId: function () {
                        return new Date().getTime();
                    },
                };
            }
            if (!panel) {
                return;
            }
            let windows = Ext.ComponentQuery.query("[buttonId=" + obj.getId() + "]");
            if (windows.length > 0) {
                FastExt.Component.shakeComment(windows[0]);
                if (panel) {
                    panel.destroy();
                }
                return;
            }

            let winWidth = parseInt((document.body.clientWidth * 0.4).toFixed(0));
            let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));
            let win = Ext.create('Ext.window.Window', {
                title: title,
                height: winHeight,
                width: winWidth,
                minHeight: 500,
                minWidth: 800,
                iconCls: obj.iconCls,
                layout: 'fit',
                buttonId: obj.getId(),
                hideAction: 'destroy',
                desktopWin: true,
                resizable: true,
                constrainHeader: true,
                maximizable: true,
                items: [panel],
                listeners: {
                    show: FastExt.Desktop.refreshActiveToolbarButton,
                    activate: FastExt.Desktop.refreshActiveToolbarButton,
                    close: FastExt.Desktop.refreshActiveToolbarButton,
                }
            });
            win.show();
        }

        /**
         * 刷新当前被最高显示的菜单窗体
         */
        static refreshActiveToolbarButton() {
            if (!FastExt.Desktop.desktopInitFinish) {
                return;
            }
            const topActiveWin = FastExt.Desktop.getTopDesktopWindow();
            if (topActiveWin) {
                if (!Ext.isEmpty(FastExt.Desktop.lastActiveMenuId) && topActiveWin.menuId !== FastExt.Desktop.lastActiveMenuId) {
                    FastExt.Desktop.deactiveToolbarButton(FastExt.Desktop.lastActiveMenuId);
                }
                FastExt.Desktop.activeToolbarButton(topActiveWin.menuId);

                FastExt.System.pushLocationHistory({
                    text: topActiveWin.realTitle || topActiveWin.title,
                    id: topActiveWin.menuId,
                });
            } else {
                if (!Ext.isEmpty(FastExt.Desktop.lastActiveMenuId)) {
                    FastExt.Desktop.deactiveToolbarButton(FastExt.Desktop.lastActiveMenuId);
                }
                FastExt.System.pushLocationHistory({text: "首页"});
            }

        }

        /**
         * 激活工具栏的按钮
         * @param menuId
         */
        static activeToolbarButton(menuId) {
            let button = FastExt.Desktop.desktopPanel.down("[menuButtonId=" + menuId + "]");
            if (button) {
                button.addCls("fast-desktop-toolbar-btn-active");
            }
            FastExt.Desktop.lastActiveMenuId = menuId;
        }

        /**
         * 激活工具栏的按钮
         * @param menuId
         */
        static deactiveToolbarButton(menuId) {
            let button = FastExt.Desktop.desktopPanel.down("[menuButtonId=" + menuId + "]");
            if (button) {
                button.removeCls("fast-desktop-toolbar-btn-active");
            }
        }

        /**
         * 获取最上层显示的窗体
         */
        static getTopDesktopWindow() {
            let windows = Ext.ComponentQuery.query("[desktopWin=true]");
            let lastWindow = null;
            for (let i = 0; i < windows.length; i++) {
                let targetWindow = windows[i];
                if (!targetWindow.isVisible()) {
                    continue;
                }
                let zIndex = targetWindow.getEl().getZIndex();
                let lastZIndex = 0;
                if (lastWindow) {
                    lastZIndex = lastWindow.getEl().getZIndex();
                }
                if (zIndex > lastZIndex) {
                    lastWindow = targetWindow;
                }
            }
            return lastWindow;
        }

        /**
         * 添加快捷方式
         * @param menu
         * @param silence
         */
        static addDesktopButton(menu, silence?: boolean) {
            if (FastExt.Desktop.checkDesktopButton(menu)) {
                FastExt.Dialog.toast("桌面已存在！");
                return;
            }
            FastExt.Desktop.desktopPanel.addDesktopItem(menu);
            if (!silence) {
                FastExt.Dialog.toast("添加成功！");
            }
        }

        /**
         * 移除快捷方式
         * @param menu
         * @param silence
         */
        static removeDesktopButton(menu, silence?: boolean) {
            FastExt.Desktop.desktopPanel.removeDesktopItem(menu);
            if (!silence) {
                FastExt.Dialog.toast("移除成功！");
            }
        }

        /**
         * 检查菜单是否显示在桌面或含文件夹上显示
         * @param menu
         */
        static checkDesktopButton(menu): boolean {
            if (!menu) {
                return false;
            }
            return FastExt.Base.toBool(menu.desktop);
        }


        /**
         * 构建工具栏上的按钮
         * @param menu
         * @param fixed
         */
        static buildToolbarButton(menu, fixed: boolean): any {
            let button = {
                xtype: "button",
                helpType: FastEnum.HelpEnumType.mouse_in_out,
                helpAnchor: FastEnum.TooltipAnchorType.bottom,
                userCls: 'fast-desktop-toolbar-btn',
                focusCls: 'fast-desktop-toolbar-btn-focus',
                handler: FastExt.DesktopEvent.onFastToolBarMenuButtonClick,
                updateMenu: function (newMenu) {
                    if (this.desktopFixedMenuButton) {
                        this.setText(null);
                    }else{
                        this.setText(newMenu.text);
                    }
                    this.setIcon(FastExt.System.takeIcon(FastExt.Desktop.safeGetMenuIcon(newMenu), "#ffffff"));
                    this.overflowText = newMenu.text;
                    this.menuData = newMenu;
                    this.help = FastExt.System.getPlainIconMenu(newMenu, " >> ");
                    this.menuButtonId = newMenu.id;
                    if (!FastExt.Base.toBool(newMenu.leaf, false)) {
                        this.menuButtonGroup = newMenu.treeGroup;
                    }
                    this.setStyle("background", FastExt.Desktop.safeGetMenuColor(newMenu));
                },
                listeners: {
                    afterrender: function () {
                        this.updateMenu(menu);
                        this.getEl().on("contextmenu", FastExt.DesktopEvent.onFastToolbarMenuButtonContextMenu, this);
                    }
                }
            };
            if (fixed) {
                button["desktopFixedMenuButton"] = true;
            }else{
                button["desktopMenuButton"] = true;
            }
            return button;
        }
        
        /**
         * 移除所有固定在工具栏的按钮
         */
        static removeAllDesktopToolbarFixedButton() {
            let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
            if (bottomBar) {
                let waitRemove = [];
                bottomBar.items.each(function (item) {
                    if (item.desktopFixedMenuButton) {
                        waitRemove.push(item);
                    }
                });
                Ext.suspendLayouts();
                for (let i = 0; i < waitRemove.length; i++) {
                    bottomBar.remove(waitRemove[i]);
                }
                Ext.resumeLayouts();
            }
        }

        /**
         * 固定到桌面工具栏中
         * @param sourceMenu
         * @param silence
         */
        static addDesktopToolbarFixedButton(sourceMenu, silence?) {
            try {
                let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
                if (bottomBar) {
                    let menus = [];
                    if (Ext.isArray(sourceMenu)) {
                        menus = sourceMenu;
                    } else {
                        menus.push(sourceMenu);
                    }

                    let menuButtons = [];
                    for (let i = 0; i < menus.length; i++) {
                        let menu = menus[i];
                        if (!FastExt.Desktop.desktopAllMenusInfo.hasOwnProperty(menu.id)) {
                            FastExt.Desktop.desktopAllMenusInfo[menu.id] = menu;
                        }
                        FastExt.Desktop.desktopAllMenusInfo[menu.id].desktop_fixed = true;

                        let desktopToolbarButton = FastExt.Desktop.getDesktopToolbarButton(menu);
                        if (desktopToolbarButton) {
                            if (desktopToolbarButton.desktopFixedMenuButton) {
                                continue;
                            } else {
                                bottomBar.remove(desktopToolbarButton);
                            }
                        }
                        menuButtons.push(FastExt.Desktop.buildToolbarButton(menu, true));
                    }

                    bottomBar.insert(FastExt.Desktop.getInsertFixedButtonIndex(), menuButtons);
                    if (!silence) {
                        FastExt.Dialog.toast("已固定到工具栏中！");
                        FastExt.Desktop.recordMenu();
                    }
                }
            } finally {
                FastExt.Desktop.refreshActiveToolbarButton();
            }
        }

        /**
         * 取消固定桌面工具栏中
         * @param sourceMenu
         */
        static removeDesktopToolbarFixedButton(sourceMenu) {
            try {
                let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
                if (bottomBar) {
                    let menus = [];
                    if (Ext.isArray(sourceMenu)) {
                        menus = sourceMenu;
                    } else {
                        menus.push(sourceMenu);
                    }

                    for (let i = 0; i < menus.length; i++) {
                        let menu = menus[i];
                        if (!FastExt.Desktop.desktopAllMenusInfo.hasOwnProperty(menu.id)) {
                            FastExt.Desktop.desktopAllMenusInfo[menu.id] = menu;
                        }
                        FastExt.Desktop.desktopAllMenusInfo[menu.id].desktop_fixed = false;


                        let desktopToolbarButton = FastExt.Desktop.getDesktopToolbarButton(menu);
                        if (desktopToolbarButton && desktopToolbarButton.desktopFixedMenuButton) {
                            bottomBar.remove(desktopToolbarButton);
                        }

                        let windowMenu = FastExt.Desktop.getWindowMenu(menu);
                        if (windowMenu) {
                            FastExt.Desktop.addDesktopToolbarButton(menu);
                        }
                    }
                    FastExt.Desktop.recordMenu();
                    FastExt.Dialog.toast("已从工具栏中取消固定！");
                }
            } finally {
                FastExt.Desktop.refreshActiveToolbarButton();
            }
        }

        /**
         * 检测工具栏菜单是否存在
         * @param menu
         */
        static checkDesktopToolbarFixedButton(menu) {
            if (!menu) {
                return false;
            }
            let desktopToolbarButton = FastExt.Desktop.getDesktopToolbarButton(menu);
            if (desktopToolbarButton) {
                return desktopToolbarButton.desktopFixedMenuButton;
            }
            return false;
        }


        /**
         * 添加工具栏菜单按钮
         * @param sourceMenu
         */
        static addDesktopToolbarButton(sourceMenu) {
            if (!sourceMenu) {
                return;
            }
            let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
            if (bottomBar) {
                let menus = [];
                if (Ext.isArray(sourceMenu)) {
                    menus = sourceMenu;
                } else {
                    menus.push(sourceMenu);
                }
                let menuButtons = [];
                for (let i = 0; i < menus.length; i++) {
                    let menu = menus[i];
                    let desktopToolbarButton = FastExt.Desktop.getDesktopToolbarButton(menu);
                    if (desktopToolbarButton) {
                        continue;
                    }
                    menuButtons.push(FastExt.Desktop.buildToolbarButton(menu, false));
                }
                if (menuButtons.length > 0) {
                    bottomBar.insert(FastExt.Desktop.getInsertMenuButtonIndex(), menuButtons);
                }
            }
        }

        /**
         * 移除工具栏菜单按钮
         * @param sourceMenu
         */
        static removeDesktopToolbarButton(sourceMenu) {
            if (!sourceMenu) {
                return;
            }
            let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
            if (bottomBar) {
                let menus = [];
                if (Ext.isArray(sourceMenu)) {
                    menus = sourceMenu;
                } else {
                    menus.push(sourceMenu);
                }
                for (let i = 0; i < menus.length; i++) {
                    let menu = menus[i];
                    let desktopToolbarButton = FastExt.Desktop.getDesktopToolbarButton(menu);
                    if (!FastExt.Base.toBool(desktopToolbarButton.desktopFixedMenuButton)) {
                        bottomBar.remove(desktopToolbarButton);
                    }
                }
            }
        }


        /**
         * 获取工具栏的按钮对象
         * @param sourceMenu
         */
        static getDesktopToolbarButton(sourceMenu) {
            if (!sourceMenu) {
                return;
            }
            let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
            if (bottomBar) {
                return bottomBar.down("[menuButtonId=" + sourceMenu.id + "]");
            }
            return null;
        }

        /**
         * 根据菜单分组获取工具栏上的按钮
         * @param sourceMenu
         */
        static getDesktopToolbarButtonByGroup(sourceMenu) {
            if (!sourceMenu) {
                return;
            }
            let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
            if (bottomBar) {
                return bottomBar.down("[menuButtonGroup=" + sourceMenu.treeGroup + "]");
            }
            return null;
        }


        /**
         * 将菜单移除文件夹
         * @param sourceMenu
         */
        static outDesktopMenuFolder(sourceMenu) {
            if (!sourceMenu) {
                return;
            }
            FastExt.Desktop.disabledRecordMenu = true;
            if (FastExt.Desktop.desktopAllMenusInfo.hasOwnProperty(sourceMenu.id)) {
                FastExt.Desktop.desktopAllMenusInfo[sourceMenu.id].desktop_folder_id = "desktop";
            }
            FastExt.Desktop.removeDesktopButton(sourceMenu, true);

            FastExt.Desktop.disabledRecordMenu = false;
            FastExt.Desktop.addDesktopButton(sourceMenu, true);
            FastExt.Dialog.toast("已移出文件夹！");
        }

        /**
         * 记录菜单配置
         */
        static recordMenu() {
            if (FastExt.Desktop.disabledRecordMenu) {
                return;
            }
            FastExt.Desktop.refreshMuuriGridMenuIndex();
            try {
                let menuInfo = {};
                for (let desktopAllMenusInfoKey in FastExt.Desktop.desktopAllMenusInfo) {
                    let sourceMenu = FastExt.Desktop.desktopAllMenusInfo[desktopAllMenusInfoKey];
                    if (FastExt.Base.toBool(sourceMenu.desktop_temp, false)) {
                        continue;
                    }
                    if (!menuInfo.hasOwnProperty(sourceMenu.id)) {
                        menuInfo[sourceMenu.id] = {
                            id: sourceMenu.id,
                            text: sourceMenu.text,
                        };
                    }
                    let recordMenu = menuInfo[sourceMenu.id];
                    recordMenu["desktop"] = sourceMenu.desktop;
                    recordMenu["desktop_align"] = sourceMenu.desktop_align;
                    recordMenu["desktop_index"] = sourceMenu.desktop_index;
                    recordMenu["desktop_type"] = sourceMenu.desktop_type;
                    recordMenu["desktop_folder_id"] = sourceMenu.desktop_folder_id;
                    recordMenu["desktop_fixed"] = sourceMenu.desktop_fixed;
                    recordMenu["desktop_fixed_index"] = sourceMenu.desktop_fixed_index;
                    recordMenu["desktop_from"] = sourceMenu.desktop_from;
                    recordMenu["desktop_locked"] = sourceMenu.desktop_locked;
                }

                FastExt.Server.setSilence(true);
                FastExt.Server.saveExtConfig($.md5("SystemDesktopMenus"), "DesktopMenu", FastExt.Json.objectToJson(menuInfo), function (success, message) {
                    FastExt.Server.setSilence(false);
                });
            } catch (e) {
            }
        }

        /**
         * 恢复菜单配置
         */
        static restoreMenu() {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    FastExt.Server.showExtConfig($.md5("SystemDesktopMenus"), "DesktopMenu", function (success, value) {
                        resolve(value);
                    });
                } catch (e) {
                    reject(e);
                }
            });
        }

        /**
         * 查看桌面背景图片集合
         */
        static showDesktopBackgroundImages(obj) {
            let desktopBgImages = FastExt.System.getExt("desktopBgImages");
            if (desktopBgImages) {
                if (!obj) {
                    obj = {
                        getId: function () {
                            return new Date().getTime();
                        },
                    };
                }
                let windows = Ext.ComponentQuery.query("[buttonId=" + obj.getId() + "]");
                if (windows.length > 0) {
                    FastExt.Component.shakeComment(windows[0]);
                    return;
                }


                let images = FastExt.Json.jsonToObject(desktopBgImages.value);
                let imagesCmp = [];
                let imageMargin = 5;
                let windowWidth = (100 + imageMargin * 2) * 5 + imageMargin + 10;
                for (let i = 0; i < images.length; i++) {
                    imagesCmp.push({
                        xtype: "image",
                        src: images[i],
                        height: 100,
                        margin: imageMargin,
                        width: 100,
                        style: {
                            objectFit: "cover",
                        },
                        listeners: {
                            afterrender: function (obj) {
                                obj.getEl().on("click", FastExt.DesktopEvent.onFastDesktopImageClick, obj);
                            },
                        }
                    });
                }

                let winHeight = parseInt((document.body.clientHeight * 0.6).toFixed(0));

                let win = Ext.create('Ext.window.Window', {
                    title: "选择桌面背景图片",
                    height: winHeight,
                    width: windowWidth,
                    iconCls: obj.iconCls,
                    layout: 'fit',
                    buttonId: obj.getId(),
                    hideAction: 'destroy',
                    desktopWin: true,
                    resizable: false,
                    constrain: true,
                    maximizable: false,
                    items: [
                        {
                            xtype: "container",
                            layout: "column",
                            scrollable: true,
                            margin: imageMargin,
                            items: imagesCmp,
                        }
                    ],
                    listeners: {
                        show: function (win) {
                            FastExt.Desktop.refreshActiveToolbarButton();
                        },
                    }
                });
                win.show();
            } else {
                FastExt.Dialog.toast("暂无可用图片选择！");
            }

        }

        /**
         * 显示文件夹
         * @param obj
         * @param menuId
         */
        static showFolderByMenuId(obj, menuId) {
            let menu = FastExt.Desktop.getMenu(menuId);
            if (menu) {
                FastExt.Desktop.showFolder(obj, menu);
            }
        }


        /**
         * 显示文件夹
         */
        static showFolder(obj, menu, active?) {
            if (FastExt.Desktop.hasWindowMenu(menu)) {
                return;
            }

            let menuGroupWindows = Ext.ComponentQuery.query("[menuWindowGroup=" + menu.treeGroup + "]");
            if (menuGroupWindows.length > 0) {
                menuGroupWindows[0].updateFolderMenu(menu, false);
                menuGroupWindows[0].show();
                return;
            }

            let winHeight = parseInt((document.body.clientHeight * 0.4).toFixed(0));
            let win = Ext.create('Ext.window.Window', {
                layout: 'fit',
                title: "文件夹",
                height: winHeight,
                width: (FastExt.Desktop.getDesktopButtonTitleMaxWidth() + 10) * 6 + 10,
                minHeight: 100,
                minWidth: 100,
                menuData: menu,
                desktopWin: true,
                resizable: true,
                constrainHeader: true,
                maximizable: true,
                userCls: "fast-ext-folder-window",
                items: [
                    FastExt.Desktop.buildDesktopItemPanel([], false, false, true)
                ],
                tools: [
                    {
                        itemId: 'edit',
                        iconCls: 'extIcon extEdit whiteColor',
                        hidden: !FastExt.Desktop.checkMenuByUserFolder(menu),
                        callback: function (owner) {
                            FastExt.Desktop.showEditFolderName(owner.menuData);
                        }
                    },
                ],
                listeners: {
                    afterrender: function () {
                        if (!FastExt.Desktop.checkSystemLockedFolderMenu(this.menuData)) {
                            this.getEl().on("contextmenu", FastExt.DesktopEvent.onFastDesktopFolderContextMenu, this);
                        }
                    },
                    show: function (win) {
                        let muuriGridPanel = this.getMuuriGridContainer();
                        if (muuriGridPanel) {
                            muuriGridPanel.folder = true;
                            muuriGridPanel.folderId = this.menuData.id;
                            muuriGridPanel.folderLocked = FastExt.Desktop.checkSystemLockedFolderMenu(this.menuData);
                            muuriGridPanel.bindMuuriGrid(function () {
                                win.updateFolderMenu(win.menuData, false);
                            });
                        }
                        FastExt.Desktop.refreshActiveToolbarButton();
                    },
                    resize: function () {
                        let muuriGridPanel = this.getMuuriGridContainer();
                        if (muuriGridPanel) {
                            muuriGridPanel.muuriGridLayout();
                        }
                    },
                    beforedestroy: FastExt.Desktop.recordMenu,
                    destroy: FastExt.DesktopEvent.onFastWindowMenuDestroy,
                    activate: FastExt.Desktop.refreshActiveToolbarButton,
                    hide: FastExt.Desktop.refreshActiveToolbarButton,
                    close: FastExt.Desktop.refreshActiveToolbarButton,
                },
                bbar: {
                    xtype: "container",
                    border: 0,
                    padding: '5 5 5 5',
                    itemId: "menuPathContainer",
                    style:{
                        background: "#f0f0f0",
                    },
                },
                setFolderTitle: function (folderMenu) {
                    this.setTitle(FastExt.Desktop.checkSystemLockedFolderMenu(folderMenu) ? folderMenu.text + "<span style='font-size: xx-small'>【已锁定】</span>" : folderMenu.text);
                    this.realTitle = folderMenu.text;
                },
                getMuuriGridContainer: function () {
                    return this.down("[desktopItemContainer=true]");
                },
                updateFolderMenu: function (folderMenu, justInfo: boolean) {
                    if (!justInfo) {
                        let muuriGridContainer = this.getMuuriGridContainer();
                        muuriGridContainer.removeAllDesktopItem();
                        muuriGridContainer.addDesktopItems(FastExt.Desktop.getFolderChildMenus(folderMenu.id));
                    }

                    let menuPathContainer = this.down("#menuPathContainer");
                    if (menuPathContainer) {
                        menuPathContainer.update(FastExt.Desktop.getMenuPath(folderMenu, null, "16px"));
                    }

                    this.setFolderTitle(folderMenu);
                    this.setIcon(FastExt.System.takeIcon(FastExt.Desktop.safeGetMenuIcon(folderMenu), "#ffffff"));
                    this.menuData = folderMenu;
                    this.menuId = folderMenu.id;
                    this.menuWindowGroup = folderMenu.treeGroup;

                    let desktopToolbarButton = FastExt.Desktop.getDesktopToolbarButtonByGroup(folderMenu);
                    if (desktopToolbarButton) {
                        desktopToolbarButton.updateMenu(folderMenu);
                    }
                    FastExt.Desktop.refreshActiveToolbarButton();
                },
            });

            FastExt.Desktop.addDesktopToolbarButton(menu);

            if (active) {
                FastExt.Desktop.activeToolbarButton(menu.id);
            }

            FastExt.Desktop.desktopPanel.add(win);
            // if (obj) {
            //     let targetEl: any = FastExt.Component.getTargetElement(obj);
            //     if (targetEl) {
            //         let targetIconContainer = $(targetEl).find("[data-menu-bg]")[0];
            //         if (targetIconContainer) {
            //             let region = targetIconContainer.getBoundingClientRect();
            //             win.showAt(region.x, region.y - region.height);
            //             return;
            //         }
            //     }
            // }
            win.show();
        }

        /**
         * 查找存在文件夹内的菜单
         * @param folderId
         */
        static getFolderChildMenus(folderId): any {

            //如果存在系统菜单中，并且包含子集，则固定显示系统菜单的配置
            let systemMenu = FastExt.System.getMenuData(folderId);
            if (FastExt.Desktop.checkSystemLockedFolderMenu(systemMenu)) {
                for (let i = 0; i < systemMenu.children.length; i++) {
                    let child = systemMenu.children[i];
                    child.desktop_temp = true;//临时展示，将跳过记忆
                    if (!FastExt.Base.toBool(child.leaf, true)) {
                        child.desktop_type = "folder";
                    }
                }
                return systemMenu.children;
            }


            let desktopMenus = [];
            for (let desktopMenusKey in FastExt.Desktop.desktopAllMenusInfo) {
                let menu = FastExt.Desktop.desktopAllMenusInfo[desktopMenusKey];

                if (menu.desktop_folder_id !== folderId) {
                    continue;
                }
                if (!FastExt.Base.toBool(menu.desktop, true)) {
                    continue;
                }
                desktopMenus.push(menu);
            }
            desktopMenus.sort(function (a, b) {
                return a.desktop_index - b.desktop_index;
            });
            return desktopMenus;
        }

        /**
         * 根据坐标检测所在的muuriGrid容器
         * @param x
         * @param y
         */
        static checkMuuriGridContainer(x, y): any {
            for (let i = 0; i < FastExt.Desktop.muuriGridContainers.length; i++) {
                let container = FastExt.Desktop.muuriGridContainers[i];
                if (FastExt.Base.toBool(container.folderLocked, false)) {
                    //跳过系统固定菜单的文件夹，不可移入和移出
                    continue;
                }
                let region = container.getRegion(false, false);
                if (!region.isOutOfBound({x: x, y: y})) {
                    return container;
                }
            }
            return null;
        }

        /**
         * 构建文件夹菜单对象
         * @param menuText 文件夹名
         */
        static buildFolderMenu(menuText): any {
            if (Ext.isEmpty(menuText)) {
                return null;
            }

            let menuTexts = FastExt.Objects.safeSplit(menuText, "@");

            let menuId = $.md5("Folder" + menuText);


            FastExt.Desktop.desktopAllMenusInfo[menuId] = {
                id: menuId,
                text: menuTexts[menuTexts.length - 1],
                icon: FastExt.Desktop.folderIcon,
                color: FastExt.Desktop.folderColor,
                desktop_type: "folder",
                desktop_from: "user",
                treeGroup: FastExt.Base.buildOnlyCode("F"),
            };
            return FastExt.Desktop.desktopAllMenusInfo[menuId];
        }

        /**
         * 刷新记录muuriGrid容器集合
         */
        static refreshMuuriGridContainers() {
            FastExt.Desktop.muuriGridContainers = FastExt.Desktop.desktopPanel.query("[desktopItemContainer=true]");

            FastExt.Desktop.muuriGridContainers.sort(function (a, b) {
                let aUpWindow = a.up("window");
                if (!aUpWindow) {
                    aUpWindow = a;
                }

                let bUpWindow = b.up("window");
                if (!bUpWindow) {
                    bUpWindow = b;
                }

                let aZIndex = FastExt.Base.toInt(aUpWindow.getEl().getZIndex(), 0);
                let bZIndex = FastExt.Base.toInt(bUpWindow.getEl().getZIndex(), 0);
                return bZIndex - aZIndex;
            });
        }

        /**
         * 刷新menu排序索引
         */
        static refreshMuuriGridMenuIndex() {
            let fixedMenus = FastExt.Desktop.desktopPanel.query("[desktopFixedMenuButton=true]");
            for (let i = 0; i < fixedMenus.length; i++) {
                let menuButton = fixedMenus[i];
                if (menuButton.menuData) {
                    menuButton.menuData.desktop_fixed = true;
                    menuButton.menuData.desktop_fixed_index = i;
                }
            }
            for (let i = 0; i < FastExt.Desktop.muuriGridContainers.length; i++) {
                let container = FastExt.Desktop.muuriGridContainers[i];
                container.getAllDesktopItemMenus();
            }
        }

        /**
         * 判断菜单是否存处于文件夹中
         * @param menu
         */
        static checkMenuInFolder(menu): boolean {
            if (!menu) {
                return false;
            }
            if (!Ext.isEmpty(menu.desktop_folder_id) && menu.desktop_folder_id !== "desktop") {
                let folderMenu = FastExt.Desktop.getMenu(menu.desktop_folder_id);
                if (folderMenu) {
                    if (FastExt.Desktop.checkSystemLockedFolderMenu(folderMenu)) {
                        return false;
                    }
                    return FastExt.Base.toBool(folderMenu.desktop);
                }
            }
            return false;
        }

        /**
         * 判断是否为用户自己创建文件夹
         * @param menu
         */
        static checkMenuByUserFolder(menu): boolean {
            return FastExt.Base.toString(menu.desktop_from, "system") === "user" && menu.desktop_type === "folder";
        }

        /**
         * 判断菜单是否为文件夹类型
         * @param menu
         */
        static checkMenuFolder(menu): boolean {
            if (!menu) {
                return false;
            }
            if (menu.desktop_type === "folder") {
                return true;
            }
            if (FastExt.Desktop.checkSystemLockedFolderMenu(menu)) {
                return true;
            }
            return false;
        }

        /**
         * 判断菜单是否已锁定
         * @param menu
         */
        static checkMenuLocked(menu): boolean {
            return FastExt.Base.toBool(menu.desktop_locked, false);
        }

        /**
         * 更新桌面菜单信息
         * @param menu
         */
        static updateDesktopMenuButton(menu) {
            if (!menu) {
                return;
            }
            let isFolder = FastExt.Desktop.checkMenuFolder(menu);
            let icons = [menu.icon];
            if (isFolder) {
                icons = [];
                let child = FastExt.Desktop.getFolderChildMenus(menu.id);
                for (let i = 0; i < child.length; i++) {
                    icons.push(FastExt.Desktop.safeGetMenuIcon(child[i]));
                    if (icons.length === 4) {
                        break;
                    }
                }
            }

            let iconHtml = "";
            for (let i = 0; i < icons.length; i++) {
                iconHtml += "<img data-menu-icon='true' src='" + FastExt.System.takeIcon(icons[i], "#ffffff") + "'  alt='" + menu.text + "' />";
            }

            let $dataMenus = $("[data-menu-id=" + menu.id + "]");
            $dataMenus.find("[data-menu-text]").text(menu.text);
            $dataMenus.find("[data-menu-bg]").html(iconHtml);
        }


        /**
         * 更新与菜单相关的消息，包括：桌面按钮、工具栏按钮、窗体等
         * @param menu
         */
        static updateMenuInfo(menu) {
            FastExt.Desktop.updateDesktopMenuButton(menu);
            let windowMenu = FastExt.Desktop.getWindowMenu(menu);
            if (windowMenu) {
                windowMenu.updateFolderMenu(menu, true);
            }
        }


        /**
         * 修改文件夹名称
         * @param menu
         */
        static showEditFolderName(menu) {
            FastExt.Dialog.showPrompt("重命名文件夹", "请输入新的文件夹名", function (btn, text) {
                if (btn === "ok") {
                    menu.text = text;
                    FastExt.Desktop.updateMenuInfo(menu);
                    FastExt.Desktop.recordMenu();
                }
            }, false, menu.text);
        }


        /**
         * 判断是否为系统配置菜单
         * @param menu
         */
        static checkSystemLockedFolderMenu(menu): boolean {
            if (!menu) {
                return false;
            }
            return menu.webMenu && menu.children && !FastExt.Base.toBool(menu.leaf, true);
        }

        /**
         * 更新grid对应的桌面菜单对象，一般用于拖拽时实时的更新文件夹显示的图标
         * @param muuriGrid
         */
        static updateFolderGridMenu(muuriGrid) {
            if (!muuriGrid) {
                return;
            }
            let muuriGridContainer = Ext.getCmp(muuriGrid.containerId);
            if (muuriGridContainer && muuriGridContainer.folder) {
                FastExt.Desktop.updateDesktopMenuButton(FastExt.Desktop.getMenu(muuriGridContainer.folderId));
            }
        }

        /**
         * 将muuriGrid里的item切换到另一个grid里，并更新文件夹的信息
         * @param muuriGrid
         * @param item
         * @param dragEnd
         */
        static switchMuuriGrid(muuriGrid, item, dragEnd) {
            let muuriGridContainer = Ext.getCmp(muuriGrid.containerId);
            if (muuriGridContainer) {
                let elem = item.getElement();
                let jqueryEl = $(elem);
                let dataMenuId = jqueryEl.attr("data-menu-id");
                let dataMenuType = jqueryEl.attr("data-menu-type");
                let menu = FastExt.Desktop.getMenu(dataMenuId);
                if (menu) {
                    if (muuriGridContainer.folder) {
                        menu.desktop_folder_id = muuriGridContainer.folderId;
                    } else {
                        menu.desktop_folder_id = "desktop";
                    }
                    if (FastExt.Base.toBool(muuriGridContainer.alignRight, false)) {
                        menu.desktop_align = "right";
                    } else {
                        menu.desktop_align = "left";
                    }
                    menu.desktop_type = dataMenuType;
                }
            }
        }


        /**
         * 获取菜单的图标
         * @param menu
         */
        static safeGetMenuIcon(menu): string {
            if (!menu) {
                return null;
            }
            let icon = menu.icon;
            if (Ext.isEmpty(icon)) {
                if (FastExt.Desktop.checkMenuFolder(menu)) {
                    icon = FastExt.Desktop.folderIcon;
                } else {
                    icon = "icons/icon_function.svg";
                }
                menu.icon = icon;
            }
            return icon;
        }


        /**
         * 获取菜单颜色
         * @param menu
         */
        static safeGetMenuColor(menu): string {
            let color = menu.color
            if (Ext.isEmpty(color)) {
                if (FastExt.Desktop.checkMenuFolder(menu)) {
                    color = FastExt.Desktop.folderColor;
                } else {
                    color = FastExt.Color.toColor(FastExt.System["theme-color"].value);
                }
            }
            return color;
        }


        /**
         * 显示用于删除的垃圾箱
         */
        static showDeleteFolder() {
            let windows = Ext.ComponentQuery.query("[deleteFolderWin=true]");
            if (windows.length > 0) {
                return;
            }
            let win = Ext.create('Ext.window.Window', {
                height: 120,
                width: 120,
                layout: 'absolute',
                deleteFolderWin: true,
                frame: true,
                header: false,
                shadow: false,
                animateDisable: true,
                style: {
                    background: "transparent",
                },
                bodyStyle: {
                    background: "transparent",
                },
                items: [
                    FastExt.Desktop.buildDesktopItemPanel([], false, false, false),
                    {
                        xtype: "container",
                        anchor: '100% 100%',
                        html: "<div style='width: 100%;height: 100%;display: flex;" +
                            "align-items: center;justify-content: center;font-size: xxx-large;'>" +
                            "<span class='extIcon extDelete' style='font-size: 80px;text-shadow: 0px 0px 20px red;color: #ff3200;'></span>" +
                            "</div>",
                    }
                ],
                listeners: {
                    show: function (win) {
                        let muuriGridPanel = this.getMuuriGridContainer();
                        if (muuriGridPanel) {
                            muuriGridPanel.deleteFolder = true;
                            muuriGridPanel.bindMuuriGrid();
                        }
                    },
                },
                getMuuriGridContainer: function () {
                    return this.down("[desktopItemContainer=true]");
                }
            });
            FastExt.Desktop.desktopPanel.add(win);
            win.show();
        }


        /**
         * 隐藏用于删除的垃圾箱
         */
        static hideDeleteFolder() {
            let windows = Ext.ComponentQuery.query("[deleteFolderWin=true]");
            for (let i = 0; i < windows.length; i++) {
                let deleteWindow = windows[i];
                deleteWindow.getMuuriGridContainer().removeAllDesktopItem();
                deleteWindow.close();
            }
            FastExt.Desktop.recordMenu();
        }

        /**
         * 获取菜单路径显示
         * @param menu
         * @param iconColor
         * @param iconSize
         * @private
         */
        static getMenuPath(menu, iconColor: string, iconSize: string): string {
            let menuArray = FastExt.System.getPathMenu(menu);
            let menuIconHtml = "<div style=\"display: flex;align-items: center;\" >";
            for (let i = 0; i < menuArray.length; i++) {
                let targetMenu = menuArray[i];
                let parentMenuFunctionStr = "FastExt.DesktopEvent.onFastWindowMenuClick(this)";

                let itemHtml = "<div data-menu-id='" + targetMenu.id + "' onclick=\"" + (i !== menuArray.length - 1 ? parentMenuFunctionStr : "") + "\" " +
                    " style=\"display: flex;align-items: center;\" class='" + (i !== menuArray.length - 1 ? "fast-desktop-menu-path-click" : "") + "'>" +
                    " <img src=\"" + FastExt.System.takeIcon(targetMenu.icon, iconColor) + "\" " +
                    " width='" + iconSize + "' height='" + iconSize + "' />" +
                    "<span style=\"margin-left: 5px;\">" + targetMenu.text + "</span> </div>";
                if (i != 0) {
                    itemHtml = "<span style='font-size: 12px;margin: 0 5px;color: #cbcbcb;' class='extIcon extArrowRight2'></span>" + itemHtml;
                }
                menuIconHtml += itemHtml;
            }
            menuIconHtml += "</div>";
            return menuIconHtml;
        }


        /**
         * 获取菜单打开的窗体的对象
         * @param menu
         */
        static getWindowMenu(menu) {
            let windows = Ext.ComponentQuery.query("[menuId=" + menu.id + "]");
            if (windows.length > 0) {
                return windows[0];
            }
            return null;
        }

        /**
         * 检查是否存在menu的窗体对象，如果已打开则显示提示
         * @param menu
         */
        static hasWindowMenu(menu) {
            let windowMenu = FastExt.Desktop.getWindowMenu(menu);
            if (windowMenu) {
                let desktopToolbarButton = FastExt.Desktop.getDesktopToolbarButton(menu);
                if (desktopToolbarButton) {
                    windowMenu.animateTarget = desktopToolbarButton;
                }
                if (windowMenu.isVisible()) {
                    FastExt.Component.shakeComment(windowMenu);
                } else {
                    windowMenu.show();
                }
                return true;
            }
            return false;
        }

        /**
         * 重新设置菜单的窗体对象的动画目标
         * @param menu
         * @param target
         */
        static resetWindowMenuAnimTarget(menu, target) {
            let windowMenu = FastExt.Desktop.getWindowMenu(menu);
            if (windowMenu) {
                windowMenu.animateTarget = target;
            }
        }

    }


    /**
     * 桌面相关的事件
     */
    export class DesktopEvent {

        /**
         * menu所在的window对象销毁时
         */
        static onFastWindowMenuDestroy() {
            let menuWindow = (<any>this);
            FastExt.Desktop.removeDesktopToolbarButton(menuWindow.menuData);
            menuWindow.menuData = null;
        }


        /**
         * 工具栏的菜单按钮点击
         */
        static onFastToolBarMenuButtonClick() {
            let btn = <any>this;
            let menu = btn.menuData;
            if (menu) {
                let menuWindow = FastExt.Desktop.getWindowMenu(menu);
                if (menuWindow) {
                    menuWindow.animateTarget = this;
                    if (menuWindow.isVisible()) {
                        const topActiveWin = FastExt.Desktop.getTopDesktopWindow();
                        if (topActiveWin && topActiveWin.getId() !== menuWindow.getId()) {
                            Ext.WindowManager.bringToFront(menuWindow, true);
                            return;
                        }
                        menuWindow.hide();
                    } else {
                        menuWindow.show();
                    }
                    return;
                }
                FastExt.Desktop.showWindowMenu(this, menu);
            }
        }

        /**
         * 工具栏的菜单按钮的右键菜单
         */
        static onFastToolbarMenuButtonContextMenu(event) {
            let btn = <any>this;
            let desktopMenuButtonExist = FastExt.Desktop.checkDesktopButton(btn.menuData);

            let desktopFixedMenuButtonExist = FastExt.Desktop.checkDesktopToolbarFixedButton(btn.menuData);

            let menu = Ext.create('Ext.menu.Menu', {
                items: [
                    {
                        text: '关闭当前',
                        iconCls: 'extIcon extClose',
                        handler: function () {
                            FastExt.Desktop.closeToolbarMenuButton(btn);
                        },
                    },
                    '-',
                    {
                        text: "关闭所有",
                        iconCls: 'extIcon extCloseAll',
                        handler: function () {
                            FastExt.Desktop.closeAllToolbarMenuButton();
                        },
                    },
                    {
                        text: '关闭左侧',
                        iconCls: 'extIcon extCloseOther',
                        handler: function () {
                            FastExt.Desktop.closeOtherToolbarMenuButton(btn, "left");
                        },
                    },
                    {
                        text: '关闭其他',
                        iconCls: 'extIcon extCloseOther',
                        handler: function () {
                            FastExt.Desktop.closeOtherToolbarMenuButton(btn, "all");
                        },
                    },
                    {
                        text: '关闭右侧',
                        iconCls: 'extIcon extCloseOther',
                        handler: function () {
                            FastExt.Desktop.closeOtherToolbarMenuButton(btn, "right");
                        },
                    },
                    '-',
                    {
                        text: '添加快捷方式',
                        iconCls: 'extIcon extLinks editColor',
                        hidden: desktopMenuButtonExist,
                        handler: function () {
                            FastExt.Desktop.addDesktopButton(btn.menuData);
                        },
                    },
                    {
                        text: '移除快捷方式',
                        iconCls: 'extIcon extLinks redColor',
                        hidden: !desktopMenuButtonExist,
                        handler: function () {
                            FastExt.Desktop.removeDesktopButton(btn.menuData);
                        },
                    },
                    '-',
                    {
                        text: '固定到工具栏',
                        iconCls: 'extIcon extTags editColor',
                        hidden: desktopFixedMenuButtonExist,
                        handler: function () {
                            FastExt.Desktop.addDesktopToolbarFixedButton(btn.menuData);
                        },
                    },
                    {
                        text: '取消工具栏固定',
                        iconCls: 'extIcon extTags redColor',
                        hidden: !desktopFixedMenuButtonExist,
                        handler: function () {
                            FastExt.Desktop.removeDesktopToolbarFixedButton(btn.menuData);
                        },
                    },
                ],
                listeners: {
                    hide: function () {
                        this.delayClose(100);
                    },
                }
            });
            menu.showBy(btn);
        }

        /**
         * 桌面图标点击事件，jquery触发
         */
        static onFastDesktopItemClick(e) {
            e.preventDefault();
            e.stopPropagation();

            let jqueryObj = $(this);
            let dataMenuId = jqueryObj.attr("data-menu-id");
            FastExt.Desktop.showWindowMenu(jqueryObj[0], FastExt.Desktop.getMenu(dataMenuId));
        }


        /**
         * 系统菜单 右键菜单
         * @param treeView
         * @param menuData
         * @param event
         */
        static onFastMenuItemContextMenu(treeView, menuData, event) {
            let parentMenu = treeView.up("menu");
            if (parentMenu) {
                parentMenu.holdShow = true;
            }
            let isLeaf = menuData.leaf;

            let readMenu = FastExt.Desktop.getMenu(menuData.id);

            if (!isLeaf) {
                readMenu.desktop_type = "folder";
            }

            let desktopMenuButtonExist = FastExt.Desktop.checkDesktopButton(readMenu);
            let desktopFixedMenuButtonExist = FastExt.Desktop.checkDesktopToolbarFixedButton(readMenu);

            let inFolder = FastExt.Desktop.checkMenuInFolder(readMenu);

            let locked = FastExt.Desktop.checkMenuLocked(menuData);


            let menu = Ext.create('Ext.menu.Menu', {
                items: [
                    {
                        text: '打开功能',
                        iconCls: 'extIcon extMouseClick searchColor',
                        handler: function () {
                            FastExt.Desktop.showWindowMenu(this, readMenu);
                        },
                    },
                    '-',
                    {
                        text: '添加快捷方式',
                        iconCls: 'extIcon extLinks editColor',
                        hidden: locked || desktopMenuButtonExist,
                        handler: function () {
                            FastExt.Desktop.addDesktopButton(readMenu);
                        },
                    },
                    {
                        text: '移除快捷方式',
                        iconCls: 'extIcon extLinks redColor',
                        hidden: locked || inFolder || !desktopMenuButtonExist,
                        handler: function () {
                            FastExt.Desktop.removeDesktopButton(readMenu);
                        },
                    },
                    {
                        text: '移出文件夹',
                        iconCls: 'extIcon extFolder redColor',
                        hidden: locked || !inFolder,
                        handler: function () {
                            FastExt.Desktop.outDesktopMenuFolder(readMenu);
                        },
                    },
                    '-',
                    {
                        text: '固定到工具栏',
                        iconCls: 'extIcon extTags editColor',
                        hidden: locked || desktopFixedMenuButtonExist,
                        handler: function () {
                            FastExt.Desktop.addDesktopToolbarFixedButton(readMenu);
                        },
                    },
                    {
                        text: '取消工具栏固定',
                        iconCls: 'extIcon extTags redColor',
                        hidden: locked || !desktopFixedMenuButtonExist,
                        handler: function () {
                            FastExt.Desktop.removeDesktopToolbarFixedButton(readMenu);
                        },
                    },
                ],
                listeners: {
                    hide: function () {
                        if (parentMenu) {
                            parentMenu.holdShow = false;
                        }
                        this.delayClose(100);
                    },
                }
            });
            FastExt.Menu.refreshItem(menu);

            menu.showAt(event.getXY());
        }


        /**
         * 系统桌面右键菜单
         */
        static onFastDesktopContextMenu(event) {
            let menu = Ext.create('Ext.menu.Menu', {
                items: [
                    {
                        text: '新建文件夹',
                        iconCls: 'extIcon extFolder color38',
                        handler: function () {
                            FastExt.Dialog.showPrompt("新建文件夹", "请输入文件夹名称", function (btn, text) {
                                if (btn === "ok") {
                                    FastExt.Desktop.desktopPanel.addDesktopItem(FastExt.Desktop.buildFolderMenu(text),
                                        FastExt.Desktop.checkMuuriGridContainer(event.clientX, event.clientY));
                                }
                            });
                        },
                    },
                    '-',
                    {
                        text: '设置桌面背景',
                        iconCls: 'extIcon extImages greenColor',
                        handler: function () {
                            FastExt.Desktop.showDesktopBackgroundImages(this);
                        },
                    },
                    {
                        text: '自动整理桌面',
                        iconCls: 'extIcon extTable color9',
                        handler: function () {
                            FastExt.Desktop.desktopPanel.reorderDesktop();
                            FastExt.Desktop.recordMenu();
                            FastExt.Dialog.toast("整理成功！");
                        },
                    },
                    '-',
                    {
                        text: '服务器CPU监控',
                        iconCls: 'extIcon extCPU color129',
                        handler: function () {
                            FastExt.System.showMonitorChart("服务器CPU监控【实时监控中】", 0);
                        },
                    },
                    {
                        text: '服务器内存监控',
                        iconCls: 'extIcon extMemory color61',
                        handler: function () {
                            FastExt.System.showMonitorChart("服务器内存监控【实时监控中】", 1);
                        },
                    },
                    {
                        text: '系统JVM监控',
                        iconCls: 'extIcon extJVM color144',
                        handler: function () {
                            FastExt.System.showMonitorChart("系统JVM监控【实时监控中】", 2);
                        },
                    },
                    {
                        text: '服务器更多监控',
                        iconCls: 'extIcon extMonitor color25',
                        handler: function () {
                            FastExt.Desktop.showWindowPanel(this, "系统监控信息", FastExt.System.getSystemMonitor(false));
                        },
                    },
                    '-',
                    {
                        text: '系统全局设置',
                        iconCls: 'extIcon extSet color12',
                        handler: function () {
                            FastExt.Desktop.showWindowPanel(this, "系统全局设置", FastExt.System.getSystemConfig(false));
                        },
                    },
                ],
                listeners: {
                    hide: function () {
                        this.delayClose(100);
                    },
                }
            });
            menu.showAt(event.getXY());
        }


        /**
         * 系统桌面选项菜单,jquery触发
         */
        static onFastDesktopItemContextMenu(event) {
            event.stopPropagation();
            let jqueryObj = $(this);
            let dataMenuId = jqueryObj.attr("data-menu-id");
            let menuData = FastExt.Desktop.getMenu(dataMenuId);
            let inFolder = FastExt.Desktop.checkMenuInFolder(menuData);
            let desktopMenuButtonExist = FastExt.Desktop.checkDesktopButton(menuData);
            let desktopFixedMenuButtonExist = FastExt.Desktop.checkDesktopToolbarFixedButton(menuData);
            let userMenu = FastExt.Desktop.checkMenuByUserFolder(menuData);
            let locked = FastExt.Desktop.checkMenuLocked(menuData);

            let menu = Ext.create('Ext.menu.Menu', {
                items: [
                    {
                        text: '打开功能',
                        iconCls: 'extIcon extMouseClick searchColor',
                        handler: function () {
                            FastExt.Desktop.showWindowMenu(jqueryObj[0], menuData);
                        },
                    },
                    {
                        text: '重命名文件夹',
                        iconCls: 'extIcon extEdit color68',
                        hidden: !userMenu,
                        handler: function () {
                            FastExt.Desktop.showEditFolderName(menuData);
                        },
                    },
                    '-',
                    {
                        text: '添加快捷方式',
                        iconCls: 'extIcon extLinks editColor',
                        hidden: locked || desktopMenuButtonExist,
                        handler: function () {
                            FastExt.Desktop.addDesktopButton(menuData);
                        },
                    },
                    {
                        text: '移除快捷方式',
                        iconCls: 'extIcon extLinks redColor',
                        hidden: locked || inFolder || !desktopMenuButtonExist,
                        handler: function () {
                            FastExt.Desktop.removeDesktopButton(menuData);
                        },
                    },
                    {
                        text: '移出文件夹',
                        iconCls: 'extIcon extFolder redColor',
                        hidden: locked || !inFolder,
                        handler: function () {
                            FastExt.Desktop.outDesktopMenuFolder(menuData);
                        },
                    },
                    '-',
                    {
                        text: '固定到工具栏',
                        iconCls: 'extIcon extTags editColor',
                        hidden: locked || desktopFixedMenuButtonExist,
                        handler: function () {
                            FastExt.Desktop.addDesktopToolbarFixedButton(menuData);
                        },
                    },
                    {
                        text: '取消工具栏固定',
                        iconCls: 'extIcon extTags redColor',
                        hidden: locked || !desktopFixedMenuButtonExist,
                        handler: function () {
                            FastExt.Desktop.removeDesktopToolbarFixedButton(menuData);
                        },
                    },
                ],
                listeners: {
                    hide: function () {
                        this.delayClose(100);
                    },
                }
            });
            FastExt.Menu.refreshItem(menu);
            menu.showAt(event.clientX, event.clientY);
            return false;
        }


        /**
         * 当从muuriGrid发送到另一个muuriGrid的时候
         */
        static onFastMuuriGridSend(data) {
            FastExt.Desktop.switchMuuriGrid(data.toGrid, data.item, false);

            FastExt.Desktop.updateFolderGridMenu(data.toGrid);
            FastExt.Desktop.updateFolderGridMenu(data.fromGrid);
        }

        /**
         * 当muuri拖拽开始时
         */
        static onFastMuuriGridDragInit() {
            FastExt.Desktop.showDeleteFolder();

            FastExt.Desktop.refreshMuuriGridContainers();
        }

        /**
         * 获取桌面所有可拖拽的muuri-grid
         */
        static onFastMuuriGridDragSort() {
            let muuriGrid = [];
            for (let i = 0; i < FastExt.Desktop.muuriGridContainers.length; i++) {
                let container = FastExt.Desktop.muuriGridContainers[i];
                if (container.folderLocked) {
                    continue;
                }
                muuriGrid.push(FastExt.MuuriTool.getMuuriGrid(container));
            }
            return muuriGrid;
        }

        /**
         * 监听muuriGrid开始拖拽选项控制
         */
        static onFastMuuriGridDragStartPredicate(item, event) {
            let menu = FastExt.Desktop.getMenuByMuuriGridItem(item);
            if (menu && FastExt.Base.toBool(menu.desktop_locked, false)) {
                return false;
            }

            // For other items use the default drag start predicate.
            return Muuri.ItemDrag.defaultStartPredicate(item, event, {
                distance: 10,
                delay: 50
            });

        }

        /**
         * 监听拖拽并切换muuriGrid
         * @param item
         * @param event
         */
        static onFastMuuriGridDragSortPredicate(item, event) {
            let inContainer = FastExt.Desktop.checkMuuriGridContainer(event.clientX, event.clientY);
            if (inContainer) {
                let muuriGrid = FastExt.MuuriTool.getMuuriGrid(inContainer);
                let currGrid = item.getGrid();
                if (muuriGrid && currGrid && currGrid._id !== muuriGrid._id) {
                    return {
                        grid: muuriGrid,
                        index: -1,
                        action: "move",
                    };
                }
            }

            let result = Muuri.ItemDrag.defaultSortPredicate(item, {
                threshold: 50,
                action: 'move',
                migrateAction: 'move'
            });
            if (result) {
                let menu = FastExt.Desktop.getMenuByMuuriGridItem(result.grid.getItem(result.index));
                if (menu && FastExt.Base.toBool(menu.desktop_locked, false)) {
                    return false;
                }
            }

            return result;
        }

        /**
         * 监听muurigrid拖拽结束
         */
        static onFastMuuriGridDragEnd(items) {
            FastExt.DesktopEvent.onFastMuuriGridChange(items);
            FastExt.Desktop.hideDeleteFolder();
        }

        /**
         * 监听muurigrid添加或删除选项
         * @param items
         */
        static onFastMuuriGridChange(items) {
            let allItems = [];
            if (Ext.isArray(items)) {
                allItems = items;
            } else {
                allItems.push(items);
            }
            FastExt.Desktop.refreshMuuriGridMenuIndex();
            for (let i = 0; i < allItems.length; i++) {
                let item = allItems[i];
                let grid = item.getGrid();
                if (grid && grid.containerId) {
                    FastExt.Desktop.switchMuuriGrid(grid, item, false);
                    FastExt.Desktop.updateFolderGridMenu(grid);
                }
            }
            FastExt.Desktop.recordMenu();
        }

        /**
         * 当拖拽工具栏上的按钮时
         * @param obj
         * @param container
         * @param dragCmp
         * @param idx
         * @param eOpts
         */
        static onFastToolbarStartDrag(obj, container, dragCmp, idx, eOpts) {
            let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
            if (bottomBar) {

                let desktopFixedMenuButton = FastExt.Base.toBool(dragCmp.desktopFixedMenuButton, false);
                let desktopMenuButtons = bottomBar.query("[desktopMenuButton=true]");
                for (let i = 0; i < desktopMenuButtons.length; i++) {
                    desktopMenuButtons[i].reorderable = !desktopFixedMenuButton;
                }

                let desktopFixedMenuButtons = bottomBar.query("[desktopFixedMenuButton=true]");
                for (let i = 0; i < desktopFixedMenuButtons.length; i++) {
                    desktopFixedMenuButtons[i].reorderable = desktopFixedMenuButton;
                }
            }
        }

        /**
         * 当工具栏拖拽结束时
         */
        static onFastToolbarDrop() {
            let bottomBar = FastExt.Desktop.desktopPanel.down("#DesktopToolBar");
            if (bottomBar) {

                let desktopMenuButtons = bottomBar.query("[desktopMenuButton=true]");
                for (let i = 0; i < desktopMenuButtons.length; i++) {
                    desktopMenuButtons[i].reorderable = true;
                }

                let desktopFixedMenuButtons = bottomBar.query("[desktopFixedMenuButton=true]");
                for (let i = 0; i < desktopFixedMenuButtons.length; i++) {
                    desktopFixedMenuButtons[i].reorderable = true;
                }
            }
            FastExt.Desktop.recordMenu();
        }


        /**
         * 桌面背景图片选择时点击
         */
        static onFastDesktopImageClick() {
            if (FastExt.Desktop.lastSelectDesktopImageId) {
                let lastImage = Ext.getCmp(FastExt.Desktop.lastSelectDesktopImageId);
                if (lastImage) {
                    lastImage.setStyle("border", "0");
                }
            }
            let img = <any>this;
            img.setStyle("border", "2px solid red");
            FastExt.Desktop.lastSelectDesktopImageId = img.getId();

            FastExt.Desktop.desktopContainer.setStyle({
                backgroundImage: "url('" + img.getSrc() + "')",
                backgroundSize: "cover",
            });

            FastExt.System["desktop-bg-image"].value = img.getSrc();

            FastExt.Server.saveSystemConfig("desktop-bg-image", img.getSrc());
        }


        /**
         * 在桌面文件夹内的右键菜单
         */
        static onFastDesktopFolderContextMenu(event) {
            let menu = Ext.create('Ext.menu.Menu', {
                items: [
                    {
                        text: '新建文件夹',
                        iconCls: 'extIcon extFolder color38',
                        handler: function () {
                            FastExt.Dialog.showPrompt("系统提醒", "请输入文件夹名称", function (btn, text) {
                                if (btn === "ok") {
                                    FastExt.Desktop.desktopPanel.addDesktopItem(FastExt.Desktop.buildFolderMenu(text),
                                        FastExt.Desktop.checkMuuriGridContainer(event.clientX, event.clientY));
                                }
                            });
                        },
                    },
                ],
                listeners: {
                    hide: function () {
                        this.delayClose(100);
                    },
                }
            });
            menu.showAt(event.getXY());

        }


        /**
         * 菜单窗体的路径点击事件
         * @param obj
         */
        static onFastWindowMenuClick(obj) {
            if (FastExt.Desktop.disabledMenuPathClick) {
                //防止拖拽结束后触发了点击
                return;
            }

            FastExt.Desktop.showFolderByMenuId(obj, $(obj).attr("data-menu-id"));
        }
    }


}







