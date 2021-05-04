namespace FastExt{

    export  class Menu{


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