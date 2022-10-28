namespace FastExt {

    /**
     * Ext.menu.Menu 相关功能辅助
     */
    export class Menu {


        /**
         * 复制菜单
         * @param target 菜单对象
         */
        static copyMenu(target): any {
            let menus = [];
            if (target.items) {
                target.items.each(function (item, index) {
                    let child: any = {
                        icon: item.icon,
                        text: item.text,
                        handler: item.handler
                    };
                    if (item.getMenu() != null) {
                        child.menu = FastExt.Menu.copyMenu(item.getMenu());
                    }
                    menus.push(child);
                });
            }
            return menus;
        }

        /**
         * 触发所有子菜单的自定义事件
         * @param menu
         * @param event
         */
        static fireMenuEvent(menu, event) {
            if (menu && menu.items) {
                menu.items.each(function (item, index) {
                    if (item.hasOwnProperty(event) && Ext.isFunction(item[event])) {
                        item[event]();
                    }
                    if (Ext.isFunction(item.getMenu)) {
                        FastExt.Menu.fireMenuEvent(item.getMenu(), event);
                    }
                });
            }
        }


        /**
         * 判断菜单集合中，最后一个是不是分割线
         * @param menus
         */
        static isSplitLineLast(menus): boolean {
            if (menus) {
                if (menus.items && menus.items.length > 0) {
                    return menus.items[menus.items.length - 1] === "-";
                }
                if (Ext.isArray(menus) && menus.length > 0) {
                    return menus[menus.length - 1] === "-";
                }
            }
            return false;
        }


        /**
         * 刷新菜单的选项，避免出现分割线连在一起的情况
         * @param menu
         */
        static refreshItem(menu: any) {
            if (menu && menu.items) {
                let visibleItem = [];
                menu.items.each(function (item, index) {
                    if (item.xtype === "menuseparator") {
                        if (visibleItem.length > 0 && visibleItem[visibleItem.length - 1].xtype === "menuseparator") {
                            item.hide();
                        } else {
                            item.show();
                        }
                    }
                    if (!item.isHidden()) {
                        visibleItem.push(item);
                    }
                    if (Ext.isFunction(item.getMenu)) {
                        FastExt.Menu.refreshItem(item.getMenu());
                    }
                });
                if (visibleItem.length > 0 && visibleItem[visibleItem.length - 1].xtype === "menuseparator") {
                    visibleItem[visibleItem.length - 1].hide();
                }
            }
        }

    }

}