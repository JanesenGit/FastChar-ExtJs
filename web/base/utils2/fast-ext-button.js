var FastExt;
(function (FastExt) {
    /**
     * 按钮相关功能
     */
    var Button = /** @class */ (function () {
        function Button() {
        }
        /**
         * 将button转换成menuitem
         * @param button
         */
        Button.buttonToMenuItem = function (button) {
            if (button.hidden) {
                return null;
            }
            var child = {
                icon: button.icon,
                iconCls: button.iconCls,
                text: button.text,
                subtext: button.subtext,
                handler: button.handler,
                disabled: button.disabled
            };
            if (button.getMenu() != null) {
                var menus_1 = [];
                button.getMenu().items.each(function (item, index) {
                    var items = FastExt.Button.buttonToMenuItem(item);
                    if (items) {
                        menus_1.push(items);
                    }
                });
                child["menu"] = menus_1;
            }
            return child;
        };
        /**
         * 将按钮绑定到Grid的监听按钮集合中
         * @param grid
         * @param button
         */
        Button.buttonToBind = function (grid, button) {
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
            if (button.getMenu() != null) {
                button.getMenu().items.each(function (item, index) {
                    FastExt.Button.buttonToBind(grid, item);
                });
            }
        };
        return Button;
    }());
    FastExt.Button = Button;
})(FastExt || (FastExt = {}));
