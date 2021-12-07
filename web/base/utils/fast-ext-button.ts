namespace FastExt {

    /**
     * 按钮相关功能
     */
    export class Button {

        /**
         * 将button转换成menuitem
         * @param button
         */
        static buttonToMenuItem(button) {
            if (button.hidden) {
                return null;
            }
            let child = {
                icon: button.icon,
                iconCls: button.iconCls,
                text: button.text,
                subtext: button.subtext,
                handler: button.handler,
                disabled: button.disabled
            };
            if (button.getMenu() != null) {
                let menus = [];
                button.getMenu().items.each(function (item, index) {
                    let items = FastExt.Button.buttonToMenuItem(item);
                    if (items) {
                        menus.push(items);
                    }
                });
                child["menu"] = menus;
            }
            return child;
        }

        /**
         * 将按钮绑定到Grid的监听按钮集合中
         * @param grid
         * @param button
         */
        static buttonToBind(grid, button) {
            if (button.checkSelect) {
                if (!grid.selectButtons) {
                    grid.selectButtons = [];
                }
                button.setDisabled(true);
                grid.selectButtons.push(button);
            }
            if (button.checkUpdate) {
                if (!grid.updateButtons) {
                    grid.updateButtons = [];
                }
                button.setDisabled(true);
                grid.updateButtons.push(button);
            }

            if (button.bindDetail && Ext.isFunction(button.handler)) {
                if (!grid.bindDetailButtons) {
                    grid.bindDetailButtons = [];
                }
                grid.bindDetailButtons.push(button);
            }

            if (button.getMenu() != null) {
                button.getMenu().items.each(function (item, index) {
                    FastExt.Button.buttonToBind(grid, item);
                });
            }

        }

    }

}