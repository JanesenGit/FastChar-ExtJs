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
            if (button.hidden || Ext.isEmpty(button.text) || button.text === "&#160;") {
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
         * 检测grid的toolbar按钮
         * @param button
         */
        static checkGridToolbarButton(button) {
            let grid = button.up('grid,treepanel');
            if (grid) {
                if (!Ext.isEmpty(button.text) && FastExt.Base.toBool(button.contextMenu, true)) {
                    //需要配置右键菜单
                    let buttonMenu = FastExt.Button.buttonToMenuItem(button);
                    FastExt.Grid.addGridContextMenu(grid, buttonMenu);
                }
                //需要检测grid选中项
                FastExt.Button.buttonToBind(grid, button);

            }
        }

        /**
         * 检测按钮是否已绑定在数组里
         */
        static checkButtonBind(array, button): boolean {
            if (!array) {
                return false;
            }
            if (!button) {
                return false;
            }
            for (let i = 0; i < array.length; i++) {
                if (array[i].getId() === button.getId()) {
                    return true;
                }
            }
            return false;
        }

        /**
         * 设置按钮的禁用状态，包含设置了收缩到菜单里的相同按钮
         * @param button
         * @param disabled
         */
        static setDisabled(button,disabled) {
            if (button) {
                button.setDisabled(disabled);
                if (button.overflowClone) {
                    button.overflowClone.setDisabled(disabled);
                }
            }
        }

        /**
         * 将按钮绑定到Grid的监听按钮集合中
         * @param grid
         * @param button
         */
        static buttonToBind(grid, button) {
            if (!grid.selectButtons) {
                grid.selectButtons = [];
            }
            if (!grid.updateButtons) {
                grid.updateButtons = [];
            }
            if (!grid.addButtons) {
                grid.addButtons = [];
            }
            if (!grid.deleteButtons) {
                grid.deleteButtons = [];
            }
            if (!grid.bindDetailButtons) {
                grid.bindDetailButtons = [];
            }
            if (!grid.entityCodeButtons) {
                grid.entityCodeButtons = [];
            }
            let buttonHidden = button.isHidden();
            if (FastExt.Base.toBool(button.hiddenValid)) {
                buttonHidden = false;
            }
            
            if (button.checkSelect && !buttonHidden) {
                FastExt.Button.setDisabled(button, true);
                if (!FastExt.Button.checkButtonBind(grid.selectButtons, button)) {
                    grid.selectButtons.push(button);
                }
            }
            if ((button.checkUpdate || button.entityUpdateButton) && !buttonHidden) {
                FastExt.Button.setDisabled(button, true);
                if (!FastExt.Button.checkButtonBind(grid.updateButtons, button)) {
                    grid.updateButtons.push(button);
                }
            }

            if (button.entityAddButton && !buttonHidden) {
                if (!FastExt.Button.checkButtonBind(grid.addButtons, button)) {
                    grid.addButtons.push(button);
                }
            }

            if (button.entityDeleteButton && !buttonHidden) {
                if (!FastExt.Button.checkButtonBind(grid.deleteButtons, button)) {
                    grid.deleteButtons.push(button);
                }
            }

            if (button.bindDetail && Ext.isFunction(button.handler) && !buttonHidden) {
                if (!FastExt.Button.checkButtonBind(grid.bindDetailButtons, button)) {
                    grid.bindDetailButtons.push(button);
                }
            }

            if (button.entityCode) {
                if (!FastExt.Button.checkButtonBind(grid.entityCodeButtons, button)) {
                    grid.entityCodeButtons.push(button);
                }
            }

            if (Ext.isFunction(button.getMenu) && button.getMenu() != null) {
                button.getMenu().items.each(function (item, index) {
                    FastExt.Button.buttonToBind(grid, item);
                });
            }
            if (button.items != null) {
                button.items.each(function (item, index) {
                    FastExt.Button.buttonToBind(grid, item);
                });
            }
        }
    }

}