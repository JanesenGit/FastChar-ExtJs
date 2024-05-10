Ext.application({
    launch: function () {
        FastExt.Windows.removeLoading();
        if (FastExt.Browsers.checkBrowserVersion()) {

            FastExt.LoginLayout.showLoginPanel();
        }
    }
});