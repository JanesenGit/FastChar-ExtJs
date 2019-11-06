/**
 * Plugin for adding a close context menu to tabs. Note that the menu respects
 * the closable configuration on the tab. As such, commands like remove others
 * and remove all will not remove items that are not closable.
 */
Ext.define('Ext.ux.TabCloseMenu', {
    extend: 'Ext.plugin.Abstract',

    alias: 'plugin.tabclosemenu',

    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @cfg {String} closeTabText
     * The text for closing the current tab.
     */
    closeTabText: '关闭当前',

    /**
     * @cfg {Boolean} showCloseOthers
     * Indicates whether to show the 'Close Others' option.
     */
    showCloseOthers: true,

    /**
     * @cfg {String} closeOthersTabsText
     * The text for closing all tabs except the current one.
     */
    closeOthersTabsText: '关闭其他',

    /**
     * @cfg {Boolean} showCloseAll
     * Indicates whether to show the 'Close All' option.
     */
    showCloseAll: true,

    /**
     * @cfg {String} closeAllTabsText
     * The text for closing all tabs.
     */
    closeAllTabsText: '关闭所有',

    /**
     * @cfg {Array} extraItemsHead
     * An array of additional context menu items to add to the front of the context menu.
     */
    extraItemsHead: null,

    /**
     * @cfg {Array} extraItemsTail
     * An array of additional context menu items to add to the end of the context menu.
     */
    extraItemsTail: null,

    //public
    constructor: function (config) {
        this.callParent([config]);
        this.mixins.observable.constructor.call(this, config);
    },

    init : function(tabpanel){
        this.tabPanel = tabpanel;
        this.tabBar = tabpanel.down("tabbar");

        this.mon(this.tabPanel, {
            scope: this,
            afterlayout: this.onAfterLayout,
            single: true
        });
    },

    onAfterLayout: function() {
        this.mon(this.tabBar.el, {
            scope: this,
            contextmenu: this.onContextMenu,
            delegate: '.x-tab'
        });
    },

    destroy : function(){
        this.callParent();
        Ext.destroy(this.menu);
    },

    /**
     * @private
     */
    onContextMenu : function(event, target){
        var me = this,
            menu = me.createMenu(),
            disableAll = true,
            disableOthers = true,
            tab = me.tabBar.getChildByElement(target),
            index = me.tabBar.items.indexOf(tab);

        me.item = me.tabPanel.getComponent(index);
        menu.child('#close').setDisabled(!me.item.closable);
        menu.child('#copyTab').setDisabled(!me.item.closable);
        menu.child('#openInWindowTab').setDisabled(!me.item.closable);

        if (me.item.justFixed) {
            menu.child('#fixedTab').hide();
        }else{
            menu.child('#fixedTab').show();
            if (me.item.closable) {
                menu.child('#fixedTab').setText("固定标签");
                menu.child('#fixedTab').setIconCls("extIcon extFixed");
            }else{
                menu.child('#fixedTab').setText("取消固定");
                menu.child('#fixedTab').setIconCls("extIcon extUnFixed");
            }
        }


        if (me.showCloseAll || me.showCloseOthers) {
            me.tabPanel.items.each(function(item) {
                if (item.closable) {
                    disableAll = false;
                    if (item !== me.item) {
                        disableOthers = false;
                        return false;
                    }
                }
                return true;
            });

            if (me.showCloseAll) {
                menu.child('#closeAll').setDisabled(disableAll);
            }

            if (me.showCloseOthers) {
                menu.child('#closeOthers').setDisabled(disableOthers);
            }
        }

        menu.child('#closeRightOthers').setDisabled(this.tabPanel.items.indexOf(this.item) == this.tabPanel.items.getCount() - 1);
        event.preventDefault();
        me.fireEvent('beforemenu', menu, me.item, me);

        menu.showAt(event.getXY());
    },

    createMenu : function() {
        var me = this;

        if (!me.menu) {
            var items = [];
            items.push({
                itemId: 'fixedTab',
                text: '固定标签',
                scope: me,
                iconCls: 'extIcon extFixed',
                handler: function(){
                    me.item.doFixed();
                }
            });
            items.push({
                itemId: 'copyTab',
                text: '复制标签',
                scope: me,
                iconCls: 'extIcon extCopy',
                handler: function(){
                    system.showTab(me.item.method, "CopyTab" + Ext.now(), "复制-" + me.item.title, me.item.icon);
                }
            });
            items.push({
                itemId: 'openInWindowTab',
                text: '在窗口中打开',
                scope: me,
                iconCls: 'extIcon extWindow',
                handler: function(){
                    var win = Ext.create('Ext.window.Window', {
                        title: me.item.title,
                        height: 500,
                        width: 800,
                        icon: me.item.icon,
                        layout: 'fit',
                        resizable: true,
                        constrain: true,
                        maximizable: true,
                        listeners: {
                            show: function (win) {
                                system.asyncMethod(me.item.method).then(function (obj) {
                                    if (obj == null) {
                                        return;
                                    }
                                    var entityOwner = obj.down("[entityList=true]");
                                    if (entityOwner) {
                                        entityOwner.code = $.md5("Window" + Ext.now());
                                    }
                                    win.add(obj);
                                });
                            }
                        }
                    });
                    win.show();
                }
            });
            items.push('-');

            items.push({
                itemId: 'close',
                text: me.closeTabText,
                scope: me,
                iconCls: 'extIcon extClose',
                handler: me.onClose
            });

            if (me.showCloseAll || me.showCloseOthers) {
                items.push('-');
            }

            if (me.showCloseOthers) {
                items.push({
                    itemId: 'closeOthers',
                    text: me.closeOthersTabsText,
                    scope: me,
                    iconCls: 'extIcon extCloseOther',
                    handler: me.onCloseOthers
                });
            }

            items.push({
                itemId: 'closeRightOthers',
                text:'关闭右侧标签',
                scope: me,
                iconCls: 'extIcon extCloseOther',
                handler: me.onRightCloseOthers
            });

            if (me.showCloseAll) {
                items.push({
                    itemId: 'closeAll',
                    text: me.closeAllTabsText,
                    scope: me,
                    iconCls: 'extIcon extCloseAll',
                    handler: me.onCloseAll
                });
            }

            if (me.extraItemsHead) {
                items = me.extraItemsHead.concat(items);
            }

            if (me.extraItemsTail) {
                items = items.concat(me.extraItemsTail);
            }

            me.menu = Ext.create('Ext.menu.Menu', {
                items: items,
                listeners: {
                    hide: me.onHideMenu,
                    click:me.onItemClick,
                    scope: me
                }
            });
        }

        return me.menu;
    },

    onHideMenu: function () {
        var me = this;
        me.fireEvent('aftermenu', me.menu, me);
    },
    onItemClick:function(menu, item, e, eOpts){
    	 var me = this;
         me.fireEvent('itemclick', menu,item, e, eOpts);
    },
    onClose : function(){
        this.tabPanel.remove(this.item);
    },

    onCloseOthers : function(){
        this.doClose(true);
    },
    onRightCloseOthers : function(){
        this.doClose(true,true);
    },
    onCloseAll : function(){
        this.doClose(false);
    },
    doClose : function(excludeActive,right){
        var items = [];
        var me = this;
        var startIndex = -1;
        if (right) {
            startIndex = this.tabPanel.items.indexOf(this.item);
        }
        this.tabPanel.items.each(function(item,index){
            if(item.closable){
                if (index > startIndex) {
                    if(!excludeActive || item !== this.item){
                        items.push(item);
                    }
                }
            }
        }, this);

        Ext.suspendLayouts();
        Ext.Array.forEach(items, function(item){
            this.tabPanel.remove(item);
        }, this);
        Ext.resumeLayouts(true);
        me.fireEvent('closedone', me.menu, me);
    }
});
