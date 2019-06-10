var power = {
    types: [
        "gridcolumn",
        "button",
        "menuitem"
    ],
    config: false,
    menuShowing: false,
    powers: {},
    defaultPower: {
        show: true,
        edit: true
    },
    hasPower: function (target, type) {
        if (target.managerPower) {
            if (target.managerPower.hasOwnProperty(type)) {
                return target.managerPower[type];
            }
        }
        return true;
    },
    checkPower: function (code) {
        var me = this;
        if (!me.powers.hasOwnProperty(code)) {
            me.powers[code] = copy(me.defaultPower);
        }
        var powerConfig = me.powers[code];
        for (var defaultPowerKey in me.defaultPower) {
            if (!powerConfig.hasOwnProperty(defaultPowerKey)) {
                powerConfig[defaultPowerKey] = me.defaultPower[defaultPowerKey];
            }
        }
        return powerConfig;
    },
    checkManagerPower: function (target) {
        if (!system.manager || Ext.isEmpty(system.manager.managerExtPower)) {
            return null;
        }
        if (system.manager.role.roleType == 0) {
            return null;
        }
        if (!system.managerPowers) {
            system.managerPowers = jsonToObject(system.manager.managerExtPower);
        }
        if (!system.managerPowers) {
            system.managerPowers = {};
        }
        var powerConfig = system.managerPowers[target.code];
        if (powerConfig) {
            for (var defaultPowerKey in power.defaultPower) {
                if (!powerConfig.hasOwnProperty(defaultPowerKey)) {
                    powerConfig[defaultPowerKey] = power.defaultPower[defaultPowerKey];
                }
            }
        }
        return powerConfig;
    },
    pushPower: function (code, config) {
        var me = this;
        me.powers[code] = config
    },
    savePower: function () {
        var me = this;
        return Ext.encode(me.powers);
    }
};


Ext.override(Ext.Component, {
    afterRender: Ext.Function.createSequence(Ext.Component.prototype.afterRender, function () {
        if (!isSystem()) {
            return;
        }
        var me = this;
        if (!Ext.isEmpty(me.power) && !me.power) {
            return;
        }
        if (me.up("[power=false]")) {
            return;
        }
        if (me.getXTypes().indexOf("field/") > 0
            || Ext.Array.contains(power.types, me.getXType())
            || me.power) {
            me.code = getPowerCode(me);
            if (me.code) {
                me.managerPower = power.checkManagerPower(me);
                if (!power.hasPower(me, 'show')) {
                    me.hideable = false;
                    me.setHidden(true);
                    me.setDisabled(true);
                    me.clearListeners();
                    if (Ext.isFunction(me.collapse)) {
                        me.collapse();
                    }
                } else if (!power.hasPower(me, 'edit')) {
                    me.editable = false;
                    if ( Ext.isFunction(me.setReadOnly)) {
                        me.setReadOnly(true);
                    }
                }

                if (power.config) {
                    me.powerConfig = power.checkPower(me.code);
                    setPowerStyle(me);
                    me.getEl().on('contextmenu', function (e, t, eOpts) {
                        e.stopEvent();
                        showPowerConfig(me, e);
                    });
                }
            }
        }
    })
});

Ext.override(Ext.Component, {
    setDisabled: function (disabled) {
        if (power.config) {
            return this['enable']();
        }
        return this[disabled ? 'disable' : 'enable']();
    }
});

Ext.override(Ext.form.field.Base, {
    markInvalid: function (errors) {
        if (power.config) {
            return;
        }
        var me = this,
            ariaDom = me.ariaEl.dom,
            oldMsg = me.getActiveError(),
            active;

        me.setActiveErrors(Ext.Array.from(errors));
        active = me.getActiveError();
        if (oldMsg !== active) {
            me.setError(active);

            if (!me.ariaStaticRoles[me.ariaRole] && ariaDom) {
                ariaDom.setAttribute('aria-invalid', true);
            }
        }
    }
});


/**
 * 获得组件的唯一权限标识
 */
function getPowerCode(obj) {
    if (obj != null) {
        var buildText = null;

        if (Ext.isFunction(obj.up)) {
            var window = obj.up("window");
            if (window) {
                buildText = window.getTitle();
            }
        }

        if (obj.name) {
            buildText += obj.name;
        }
        if (obj.title) {
            buildText += obj.title;
        }
        if (obj.text) {
            buildText += obj.text;
        }
        if (obj.subtext) {
            buildText += obj.subtext;
        }
        if (obj.dataIndex) {
            buildText += obj.dataIndex;
        }
        if (Ext.isFunction(obj.getFieldLabel) && Ext.isEmpty(obj.getFieldLabel())) {
            buildText += obj.getFieldLabel();
        }
        if (buildText) {
            return $.md5(buildText);
        }
    }
    return null;
}

function showPowerConfig(target, e) {
    if (!isSystem()) {
        return;
    }
    var powerConfig = power.checkPower(target.code);
    power.menuShowing = true;
    var panel = Ext.create('Ext.panel.Panel', {
        layout: {
            type: 'vbox',
            pack: 'center'
        },
        border: 0,
        defaults: {
            height: 20,
            power: false
        },
        items: [
            {
                xtype: 'checkbox',
                name: 'updateAlert',
                checked: true,
                boxLabel: '允许显示',
                value: powerConfig.show,
                listeners: {
                    change: function (obj, newValue, oldValue, eOpts) {
                        powerConfig.show = newValue;
                        setPowerStyle(target);
                    }
                }
            },
            {
                xtype: 'checkbox',
                name: 'updateAlert',
                checked: true,
                boxLabel: '允许编辑',
                hidden: !isColumnType(target),
                value: powerConfig.edit,
                listeners: {
                    change: function (obj, newValue, oldValue, eOpts) {
                        powerConfig.edit = newValue;
                        setPowerStyle(target);
                    }
                }
            }
        ]
    });
    var contextMenu = new Ext.menu.Menu({
        padding: '0 0 0 10',
        powerMenu: true,
        style: {
            background: "#ffffff"
        },
        items: [panel],
        listeners: {
            beforehide: function (obj, eOpts) {
                power.menuShowing = false;
                power.pushPower(target.code, powerConfig);
            }
        }
    });
    contextMenu.showAt(e.getXY());
}

function setPowerStyle(target) {
    var query = Ext.all("[code=" + target.code + "]");
    Ext.each(query, function (item, index) {
        var powerConfig = power.checkPower(target.code);
        if (powerConfig) {
            if (!powerConfig.show) {
                item.addCls("no-show-power");
            } else {
                item.removeCls("no-show-power");
                if (!powerConfig.edit) {
                    item.addCls("no-edit-power");
                } else {
                    item.removeCls("no-edit-power");
                }
            }
        }
    });
}
