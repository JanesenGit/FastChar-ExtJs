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

        /**
         * 系统权限编号版本号
         */
        static powerVersion = "2.0";

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
            return FastExt.Base.toBool(FastExt.System.ConfigHandler.getConfig("power_setting").value, false);
        }


        /**
         * 判断目标组件是否有指定权限值
         * @param target
         * @param type
         */
        static hasPower(target:any, type:any): boolean {
            if (target.managerPower) {
                if (target.managerPower.hasOwnProperty(type)) {
                    return target.managerPower[type];
                }
            }
            return true;
        }


        /**
         * 检查权限
         * @param code
         */
        static checkPower(code:string): any {
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
        static checkManagerPower(target:any): any {
            if (!FastExt.System.ManagerHandler.isValid()) {
                return null;
            }
            if (!FastExt.System.ManagerHandler.getGhostPowers()) {
                if (Ext.isEmpty(FastExt.System.ManagerHandler.getManagerExtPower()) || FastExt.System.ManagerHandler.getRoleType() === 0) {
                    return null;
                }
            }
            if (!FastExt.System.ManagerHandler.getGhostPowers()) {
                FastExt.System.ManagerHandler.setGhostPowers(FastExt.Json.jsonToObject(FastExt.System.ManagerHandler.getManagerExtPower()));
            }

            if (!FastExt.System.ManagerHandler.getGhostPowers()) {
                FastExt.System.ManagerHandler.setGhostPowers({});
            }


            let powerConfig = FastExt.System.ManagerHandler.getGhostPowers()[target.code];
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
        static pushPower(code:string, config:any) {
            let me = this;
            me.powers[code] = config
        }


        /**
         * 设置权限配置
         * @param code 唯一编号
         * @param config 配置
         * @see {@link FastExt.PowerSet}
         */
        static setPower(code:string, config:any) {
            let me = this;
            if (!me.powers[code]) {
                me.powers[code] = config;
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
        static getPowerCode(obj:any): string {
            //注意以下权限编号的组成严禁修改顺序，必须已配置的权限失效！
            if (obj != null) {
                if (!Ext.isEmpty(obj.code)) {
                    return obj.code;
                }

                let buildText = null;

                if (Ext.isFunction(obj.up)) {
                    if (FastExt.Power.powerVersion === "2.0") {
                        let menuContainer = obj.up("[menuContainer=true]");
                        if (menuContainer) {
                            buildText = menuContainer.getTitle();
                        } else {
                            let window = obj.up("window");
                            if (window) {
                                buildText = window.getTitle();
                            }
                        }
                    } else {
                        let window = obj.up("window");
                        if (window) {
                            buildText = window.getTitle();
                        }
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
                    obj.buildCodeText = buildText;
                    return $.md5(buildText);
                }
            }
            return null;
        }

        /**
         * 设置权限状态下的样式
         */
        static setPowerStyle(target:any) {
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
        static showPowerConfig(target:any, e:any) {
            if (!FastExt.System.InitHandler.isInit()) {
                return;
            }
            let powerConfig = FastExt.Power.checkPower(target.code);
            FastExt.Power.menuShowing = true;
            let panel = Ext.create('Ext.container.Container', {
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
                showSeparator: false,
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


        /**
         * 弹出菜单权限的配置窗体
         * @param obj 动画对象
         * @param checked 已选中的菜单Id
         * @param parent 指定上级的菜单Id
         * @return Ext.Promise
         */
        static showPowerMenus(obj:any, checked:string, parent:string) {
            return new Ext.Promise(function (resolve, reject) {
                let data = FastExt.System.MenuHandler.getPowerMenuByConfig(FastExt.System.MenuHandler.getMenus(), checked, parent);
                let dataStore = Ext.create('Ext.data.TreeStore', {
                    data: data,
                    root: {
                        expanded: true
                    }
                });

                let treePanel = Ext.create('Ext.tree.Panel', {
                    store: dataStore,
                    rootVisible: false,
                    bufferedRenderer: false,
                    animate: true,
                    containerScroll: true,
                    autoScroll: true,
                    viewConfig: {
                        loadMask: {
                            msg: '加载功能菜单中，请稍后……'
                        }
                    },
                    listeners: {
                        checkchange: function (currNode, checked, e, eOpts) {
                            if (checked) {
                                currNode.bubble(function (parentNode) {
                                    parentNode.set('checked', true);
                                    //parentNode.expand(false, true);
                                });
                                currNode.cascadeBy(function (node) {
                                    node.set('checked', true);
                                    //node.expand(false, true);
                                });
                            } else {
                                currNode.cascadeBy(function (node) {
                                    node.set('checked', false);
                                });
                            }
                        }
                    }
                });
                let winWidth = parseInt((document.body.clientWidth * 0.5).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.8).toFixed(0));
                let win = Ext.create('Ext.window.Window', {
                    title: '权限配置（选择功能菜单）',
                    height: winHeight,
                    width: winWidth,
                    minHeight: 400,
                    minWidth: 470,
                    layout: 'fit',
                    iconCls: 'extIcon extSelect',
                    resizable: true,
                    animateTarget: obj,
                    maximizable: true,
                    constrain: true,
                    items: [treePanel],
                    modal: true,
                    buttons: [{
                        text: '重置',
                        iconCls: 'extIcon extReset',
                        handler: function () {
                            dataStore.reload();
                        }
                    },
                        {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                let checkedArray = treePanel.getChecked();
                                let menuIds = "";
                                for (let i = 0; i < checkedArray.length; i++) {
                                    menuIds += "," + checkedArray[i].data.id;
                                }
                                resolve(menuIds);
                                win.close();
                            }
                        }]
                });
                win.show();
            });
        }



        /**
         * 弹出界面权限配置的窗体
         * @param obj 动画对象
         * @param menuPower 指定菜单权限
         * @param extPower 已配置的界面权限
         * @param parentExtPower 指定上级的界面权限
         */
        static showPowerExt(obj:any, menuPower:string, extPower:string, parentExtPower:string) {
            return new Ext.Promise(function (resolve, reject) {
                window["getMenuPower"] = function () {
                    return menuPower;
                };
                window["getExtPower"] = function () {
                    return extPower;
                };
                window["getParentExtPower"] = function () {
                    return parentExtPower;
                };
                window["close"] = function () {
                    Ext.getCmp("ExtPowerWindow").close();
                };
                let winWidth = parseInt((document.body.clientWidth * 0.5).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.8).toFixed(0));
                let win = Ext.create('Ext.window.Window', {
                    id: "ExtPowerWindow",
                    title: '配置界面权限（在组件上右击鼠标进行编辑权限）',
                    iconCls: 'extIcon extPower',
                    layout: 'fit',
                    resizable: false,
                    maximized: true,
                    fixed: true,
                    draggable: false,
                    width: winWidth,
                    height: winHeight,
                    listeners: {
                        show: function (obj) {
                            obj.update("<iframe name='extPowerFrame' " +
                                " src='power?managerId=0' width='100%' height='100%' frameborder='0' scrolling='no' />");
                        }
                    },
                    buttons: [
                        {
                            text: '保存权限配置',
                            iconCls: 'extIcon extSave whiteColor',
                            handler: function () {
                                resolve(window["extPowerFrame"].window.getExtPower());
                                win.close();
                            }
                        }]
                });
                win.show();
            });
        }

    }

}