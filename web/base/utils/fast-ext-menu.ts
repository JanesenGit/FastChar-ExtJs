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
            return menus;
        }

        /**
         * 触发所有子菜单的自定义事件
         * @param menu
         * @param event
         */
        static fireMenuEvent(menu, event) {
            if (menu) {
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

    }

}