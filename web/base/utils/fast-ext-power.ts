namespace FastExt {


    /**
     * 权限设置类
     */
    export class PowerSet {
        /**
         * 是否允许显示
         */
       show: boolean = true;

        /**
         * 是否允许编辑
         */
       edit: boolean = true;
    }


    export class Power {
        private constructor() {
        }

        /**
         * 允许进行权限配置的类型
         *  @see {@link FastEnum.PowerType}
         */
        static types: FastEnum.PowerType[] = [FastEnum.PowerType.gridcolumn, FastEnum.PowerType.menuitem, FastEnum.PowerType.button];

        /**
         * 是否正在进行配置权限
         */
        static config: boolean = false;

        /**
         * 权限菜单是否已打开
         */
        static menuShowing: boolean = false;


        /**
         * 组件权限的集合
         */
        static powers: any = [];

        /**
         * 默认的权限配置
         *  @see {@link FastExt.PowerSet}
         */
        static defaultPower: FastExt.PowerSet = new FastExt.PowerSet();

        /**
         * 是否正在进行权限配置操作
         */
        static isPower(): boolean {
            return window["isPower"]();
        }


        /**
         * 判断目标组件是否有指定权限值
         * @param target
         * @param type
         */
        static hasPower(target, type):boolean {
            if (target.managerPower) {
                if (target.managerPower.hasOwnProperty(type)) {
                    return  target.managerPower[type];
                }
            }
            return true;
        }


        /**
         * 检查权限
         * @param code
         */
        static checkPower(code) :any{
            let me = this;
            if (!me.powers[code]) {
                me.powers[code] = FastExt.Base.copy(me.defaultPower);
            }
            let powerConfig = me.powers[code];
            if (!Ext.isEmpty(powerConfig)) {
                for (let defaultPowerKey in me.defaultPower) {
                    if (!powerConfig.hasOwnProperty(defaultPowerKey)) {
                        powerConfig[defaultPowerKey] = me.defaultPower[defaultPowerKey];
                    }
                }
            }
            return powerConfig;
        }


        /**
         * 获取管理员的目标组件权限
         * @param target
         */
        static checkManagerPower(target): any {
            if (!FastExt.System.manager) {
                return null;
            }
            if (!FastExt.System.managerPowers) {
                if (Ext.isEmpty(FastExt.System.manager.managerExtPower) || FastExt.System.manager.role.roleType === 0) {
                    return null;
                }
            }
            if (!FastExt.System.managerPowers) {
                FastExt.System.managerPowers = FastExt.Json.jsonToObject(FastExt.System.manager.managerExtPower);
            }
            if (!FastExt.System.managerPowers) {
                FastExt.System.managerPowers = {};
            }

            let powerConfig = FastExt.System.managerPowers[target.code];
            if (!powerConfig) {
                powerConfig = FastExt.Base.copy(FastExt.Power.defaultPower);
            }
            for (let defaultPowerKey in FastExt.Power.defaultPower) {
                if (!powerConfig.hasOwnProperty(defaultPowerKey)) {
                    powerConfig[defaultPowerKey] = FastExt.Power.defaultPower[defaultPowerKey];
                }
            }
            return powerConfig;
        }


        /**
         * 添加权限配置
         * @param code 唯一编号
         * @param config 配置
         * @see {@link FastExt.PowerSet}
         */
        static pushPower(code, config) {
            let me = this;
            me.powers[code] = config
        }


        /**
         * 设置权限配置
         * @param code 唯一编号
         * @param config 配置
         * @see {@link FastExt.PowerSet}
         */
        static setPower(code, config) {
            let me = this;
            if (!me.powers[code]) {
                me.powers[code] =config;
            }
        }

        /**
         * 获取保存权限配置的值
         */
        static getSavePowerData(): string {
            let me = this;
            let data = me.powers;
            return Ext.encode(data);
        }


        /**
         * 获取组件的唯一权限编号
         * @param obj
         */
        static getPowerCode(obj): string {
            if (obj != null) {
                let buildText = null;

                if (Ext.isFunction(obj.up)) {
                    let window = obj.up("window");
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

        /**
         * 设置权限状态下的样式
         */
        static setPowerStyle(target) {
            let query = Ext.all("[code=" + target.code + "]");
            Ext.each(query, function (item, index) {
                let powerConfig = FastExt.Power.checkPower(target.code);
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

        /**
         * 弹出组件的权限配置菜单
         * @param target
         * @param e
         */
        static showPowerConfig(target, e) {
            if (!FastExt.System.isInitSystem()) {
                return;
            }
            let powerConfig = FastExt.Power.checkPower(target.code);
            FastExt.Power.menuShowing = true;
            let panel = Ext.create('Ext.panel.Panel', {
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
                                FastExt.Power.setPowerStyle(target);
                            }
                        }
                    },
                    {
                        xtype: 'checkbox',
                        name: 'updateAlert',
                        checked: true,
                        boxLabel: '允许编辑',
                        hidden: !FastExt.Grid.isColumnType(target),
                        value: powerConfig.edit,
                        listeners: {
                            change: function (obj, newValue, oldValue, eOpts) {
                                powerConfig.edit = newValue;
                                FastExt.Power.setPowerStyle(target);
                            }
                        }
                    }
                ]
            });
            let contextMenu = new Ext.menu.Menu({
                padding: '0 0 0 10',
                powerMenu: true,
                style: {
                    background: "#ffffff"
                },
                items: [panel],
                listeners: {
                    beforehide: function (obj, eOpts) {
                        FastExt.Power.menuShowing = false;
                        FastExt.Power.pushPower(target.code, powerConfig);
                    }
                }
            });
            contextMenu.showAt(e.getXY());
        }

    }

}