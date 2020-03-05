Ext.override(Ext.button.Button, {
    afterRender: Ext.Function.createSequence(Ext.button.Button.prototype.afterRender, function () {
        try {
            let me = this;
            if (me.tipText) {
                me.tip = new Ext.ToolTip({
                    target: me.el,
                    trackMouse: true,
                    renderTo: Ext.getBody(),
                    dismissDelay: 0,
                    html: me.tipText
                });
            }
            let grid = me.up('grid,treepanel');
            if (grid) {
                if (!Ext.isEmpty(me.text)) {
                    //需要配置右键菜单
                    addGridContextMenu(grid, buttonToMenuItem(me));
                }
                //需要检测grid选中项
                buttonToBind(grid, me);
            }
        } catch (e) {
            console.error(e);
        }
    })
});

/**
 * 将button转换成menuitem
 * @param button
 */
function buttonToMenuItem(button) {
    let child = {
        icon: button.icon,
        iconCls: button.iconCls,
        text: button.text,
        subtext: button.subtext,
        handler: button.handler
    };
    if (button.getMenu() != null) {
        let menus = [];
        button.getMenu().items.each(function (item, index) {
            menus.push(buttonToMenuItem(item));
        });
        child.menu = menus;
    }
    return child;
}

/**
 * 绑定按钮的监听关系
 * @param grid
 * @param button
 */
function buttonToBind(grid, button) {
    //需要检测grid选中项
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
            buttonToBind(grid, item);
        });
    }
}