Ext.application({
    launch: function () {
        if (FastExt.Browsers.checkBrowserVersion()) {
            FastExt.System.InitHandler.initSystem();
        }
    }
});
