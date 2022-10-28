namespace FastExt{


    /**
     * Ext.plugin插件定义
     */
    export class Plugins{

        constructor() {
            Ext.define('Ext.plugin.ShowLazyItems', {
                extend: 'Ext.plugin.Abstract',
                alias: 'plugin.showlazyitems',
                init: function(comp) {
                    this.callParent(arguments);

                    if (this.items) {
                        // Eager instantiation means create the child items now
                        if (this.eagerInstantiation) {
                            this.items = comp.prepareItems(this.items);
                        }
                    }
                    comp.onShowComplete = Ext.Function.createInterceptor(comp.onShowComplete, this.onComponentShow, this);
                },

                // Add the child items at the last possible moment.
                onComponentShow: function() {
                    this.cmp.add(this.items);
                    // Remove the interceptor
                    this.cmp.onComponentShow = null;
                }
            });
        }

    }

}

