Ext.override(Ext.button.Button, {
    afterRender: Ext.Function.createSequence(Ext.button.Button.prototype.afterRender, function () {
        let me = this;
        if (me.tipText) {
            me.tip = new Ext.ToolTip({
                target: me.el,
                trackMouse: true,
                renderTo: Ext.getBody(),
                html: me.tipText
            });
        }
        if (!Ext.isEmpty(me.text)) {
            let grid = me.up('grid,treepanel');
            if (grid) {
                //需要配置右键菜单
                addGridContextMenu(grid, buttonToMenuItem(me));
                //需要检测grid选中项
                if (me.checkSelect) {
                    if (!grid.selectButtons) {
                        grid.selectButtons = [];
                    }
                    me.setDisabled(true);
                    grid.selectButtons.push(me);
                }
                if (me.checkUpdate) {
                    if (!grid.updateButtons) {
                        grid.updateButtons = [];
                    }
                    me.setDisabled(true);
                    grid.updateButtons.push(me);
                }
            }
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