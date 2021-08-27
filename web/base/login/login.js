Ext.onReady(function () {
    FastExt.System.removeLoading();
    if (FastExt.System.checkBrowserVersion()) {
        let container = FastExt.System.getBodyContainer();
        container.removeAll();
        FastExt.System.showLogin2(container);
    }
});