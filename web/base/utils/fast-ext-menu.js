Ext.override(Ext.menu.Menu, {
    hide: function () {
        if(Ext.isEmpty(system)) return;
        let me = this;
        if (!me.powerMenu) {
            if (power.menuShowing) {
                return;
            }
        }
        if (me.holdShow) {
            return;
        }
        if (me.pendingShow) {
            me.pendingShow = false;
        }

        if (!(me.rendered && !me.isVisible())) {
            if (!me.hasListeners.beforehide || me.fireEvent('beforehide', me) !== false || me.hierarchicallyHidden) {
                me.getInherited().hidden = me.hidden = true;
                me.fireHierarchyEvent('beforehide');
                if (me.rendered) {
                    me.onHide.apply(me, arguments);
                }
            }
        }
        return me;
    }
});

/**
 * 复制菜单
 * @param target
 */
function copyMenu(target) {
    let menus = [];
    target.items.each(function (item, index) {
        let child = {
            icon: item.icon,
            text: item.text,
            handler: item.handler
        };
        if (item.getMenu() != null) {
            child.menu = copyMenu(item.getMenu());
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
function fireMenuEvent(menu, event) {
    if (menu) {
        menu.items.each(function (item, index) {
            if (item.hasOwnProperty(event) && Ext.isFunction(item[event])) {
                item[event]();
            }
            if (Ext.isFunction(item.getMenu)) {
                fireMenuEvent(item.getMenu(), event);
            }
        });
    }
}