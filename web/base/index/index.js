function showList(menuId, entityCode, where,config) {
    return FastExt.System.showList(menuId, entityCode, where, config);
}

Ext.onReady(function () {
    if (FastExt.System.checkBrowserVersion()) {
        Ext.MessageBox.show({
            alwaysOnTop: true,
            modal: true,
            iconCls: "extIcon extTimer",
            title: '系统提醒',
            msg: '初始化系统中，请稍后……',
            progressText: '请耐心等待，即将完成操作',
            progress: true,
            closeAction: 'destroy',
            closable: false
        });
        FastExt.System.initConfig();
    }
});