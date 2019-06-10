//定义fileModules
var files = {
    validate: function (modules, name) {
        if (Ext.isEmpty(modules)) {
            showAlert("系统提醒", "参数" + name + "必传！");
            return false;
        }
        if (!Ext.isArray(modules)) {
            showAlert("系统提醒", "参数" + name + "必需Array格式！");
            return false;
        }
        if (modules == 0) {
            showAlert("系统提醒", "参数" + name + "集合不可为空！");
            return false;
        }
        return true;
    },
    file: function () {
        return {
            reg: /\.*$/i,
            tipMsg: '文件',
            type: 'file',
            renderer: renders.file()
        };
    },
    image: function () {
        return {
            reg: /\.(jpg|png|gif|jpeg)$/i,
            tipMsg: '图片',
            type: 'images',
            renderer: renders.image(24)
        };
    },
    mp4: function () {
        return {
            reg: /\.(mp4)$/i,
            tipMsg: 'mp4',
            type: 'videos',
            renderer: renders.file()
        };
    },
    word: function () {
        return {
            reg: /\.(doc)$/i,
            tipMsg: 'word文档',
            type: 'words',
            renderer: renders.file()
        };
    },
    excel: function () {
        return {
            reg: /\.(xls|xlsx)$/i,
            tipMsg: 'excel文档',
            type: 'excels',
            renderer: renders.file()
        };
    },
    text: function () {
        return {
            reg: /\.(txt)$/i,
            tipMsg: 'txt文档',
            type: 'excels',
            renderer: renders.file()
        };
    }

};


/**
 * 弹出上传文件的对话框
 * @param obj 控件对象
 * @param fileModules 文件类型
 * @example
 * uploadFile(this,[file.image(),file.excel()])
 */
function uploadFile(obj, fileModules) {
    return new Ext.Promise(function (resolve, reject) {
        var title = "上传文件", type = "files", width = -1, height = -1;
        if (!files.validate(fileModules, "fileModules")) {
            return;
        }
        if (fileModules.length == 1) {
            title = "上传" + fileModules[0].tipMsg;
            type = fileModules[0].type;
            width = fileModules[0].width;
            height = fileModules[0].height;
        }

        var formPanel = Ext.create('Ext.form.FormPanel', {
            url: 'upload',
            method: 'POST',
            margin: '5',
            fileUpload: true,
            width: 400,
            callBacked: false,
            border: 0,
            layout: 'column',
            items: [
                {
                    xtype: 'filefield',
                    fieldLabel: title,
                    labelWidth: 60,
                    labelAlign: 'right',
                    buttonText: '选择文件',
                    allowBlank: false,
                    name: 'file',
                    columnWidth: 1,
                    listeners: {
                        change: function (obj, value, eOpts) {
                            if (value != null && value.length != 0) {
                                var errorMsg = "";
                                for (var i = 0; i < fileModules.length; i++) {
                                    var fileModule = fileModules[i];
                                    if (fileModule.reg.test(value)) {
                                        formPanel.doSubmit();
                                        return;
                                    }
                                    errorMsg = errorMsg + "或" + fileModule.tipMsg;
                                }
                                formPanel.form.reset();
                                Ext.Msg.alert('系统提醒', "请上传有效的" + errorMsg.substring(1));
                            }
                        }
                    }
                },
                {
                    xtype: 'hiddenfield',
                    name: 'type',
                    value: type
                },
                {
                    xtype: 'hiddenfield',
                    name: 'file.width',
                    value: width
                },
                {
                    xtype: 'hiddenfield',
                    name: 'file.height',
                    value: height
                }],
            doSubmit: function () {
                var form = formPanel.form;
                if (form.isValid()) {
                    var myMask = new Ext.LoadMask({
                        msg: '正在上传附件中…',
                        target: uploadWin
                    });
                    myMask.show();
                    form.submit({
                        success: function (form, action) {
                            toast("文件上传成功！");
                            if (!resolve.called) {
                                resolve.called = true;
                                resolve(action.result.data);
                            }
                            uploadWin.close();
                        },
                        failure: function (form, action) {
                            myMask.destroy();
                            Ext.Msg.alert('系统提醒', "上传失败！" + action.result.message);
                        }
                    });
                }
            },
            listeners: {
                'render': function (obj) {
                    new Ext.KeyMap(obj.getEl(), [{
                        key: 13,
                        fn: formPanel.doSubmit,
                        scope: Ext.getBody()
                    }]);
                }
            }
        });
        var btnSubmitId = "btnSubmit" + new Date().getTime();
        var uploadWin = Ext.create('Ext.window.Window', {
            title: title,
            layout: 'fit',
            resizable: false,
            scrollable: false,
            items: formPanel,
            modal: true,
            iconCls: 'extIcon extUpload',
            animateTarget: obj,
            constrain: true,
            buttons: [
                {
                    text: '重置',
                    width: 88,
                    iconCls: 'extIcon extReset',
                    handler: function () {
                        formPanel.form.reset();
                    }
                },
                {
                    text: '上传',
                    width: 88,
                    id: btnSubmitId,
                    iconCls: 'extIcon extOk',
                    handler: function () {
                        formPanel.doSubmit();
                    }
                }],
            listeners: {
                show: function (winObj, eOpts) {
                    formPanel.getForm().findField('file').fileInputEl.dom.click();
                    Ext.getCmp(btnSubmitId).focus();
                },
                close: function (winObj, eOpts) {
                    if (!resolve.called) {
                        resolve.called = true;
                        resolve();
                    }
                }
            }

        });
        uploadWin.show();
    });
}


/**
 * 弹出管理多个文件的窗口
 * @param obj 控件对象
 * @param callBack 回调函数
 * @param fileModules 文件类型
 * @param defaultFiles 默认文件数据
 * @example
 * showFiles(this,function(val){
 *
 * },[file.image(),file.excel()])
 */
function showFiles(obj, callBack, fileModules, defaultFiles) {
    if (!files.validate(fileModules, "fileModules")) {
        return;
    }
    var datas = [], renderer = renders.file(), title = "文件管理";
    if (!Ext.isEmpty(defaultFiles)) {
        var fileArray = Ext.JSON.decode(defaultFiles);
        for (var i = 0; i < fileArray.length; i++) {
            datas.push({url: fileArray[i]});
        }
    }

    if (fileModules.length == 1) {
        renderer = fileModules[0].renderer;
        title = fileModules[0].tipMsg + "管理";
    }


    var currTime = Ext.now();
    var fileStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        data: datas
    });
    var dataGridFiles = Ext.create('Ext.grid.Panel', {
        selModel: getGridSelModel(),
        store: fileStore,
        columnLines: true,
        cellTip: true,
        columns: [{
            header: '文件',
            dataIndex: 'url',
            flex: 1,
            align: 'center',
            renderer: renderer
        }],
        plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 2
        })],
        selType: 'cellmodel',
        tbar: [
            {
                xtype: 'button',
                border: 1,
                text: '删除',
                id: 'btnDeleteFile' + currTime,
                iconCls: 'extIcon extDelete',
                disabled: true,
                handler: function () {
                    var data = dataGridFiles.getSelectionModel().getSelection();
                    if (data.length == 0) {
                        toast("请您选择需要删除的文件！");
                        return;
                    } else {
                        Ext.Msg.confirm("系统提醒", "您确定立即删除选中的附件吗？",
                            function (button, text) {
                                if (button == "yes") {
                                    Ext.Array.each(data,
                                        function (record) {
                                            fileStore.remove(record);
                                            fileStore.modify = true;
                                        });
                                    dataGridFiles.getSelectionModel().deselectAll();
                                }
                            });
                    }
                }
            },
            {
                xtype: 'button',
                border: 1,
                text: '上传',
                iconCls: 'extIcon extUpload',
                handler: function () {
                    uploadFile(this, fileModules).then(function (result) {
                        if (result) {
                            fileStore.add(result);
                            fileStore.modify = true;
                        }
                    });
                }
            }
        ],
        listeners: {
            selectionchange: function () {
                var data = this.getSelectionModel().getSelection();
                Ext.getCmp("btnDeleteFile" + currTime).setDisabled(!(data.length > 0));
            }
        }
    });

    var win = Ext.create('Ext.window.Window', {
        title: title,
        height: 300,
        width: 400,
        minWidth: 400,
        minHeight: 300,
        layout: 'fit',
        resizable: true,
        modal: true,
        constrain: true,
        iconCls: 'extIcon extFolder',
        animateTarget: obj,
        items: [dataGridFiles],
        listeners: {
            close: function () {
                if (fileStore.modify) {
                    var data = [];
                    fileStore.each(function (record, index) {
                        data.push(record.get("url"));
                    });
                    if (callBack != null) {
                        callBack(Ext.encode(data));
                    }
                }
            }
        }
    });
    win.show();
}


/**
 * 导入excel数据
 */
function importExcel(obj, params) {
    return new Ext.Promise(function (resolve, reject) {
        var formPanel = Ext.create('Ext.form.FormPanel', {
            url: 'entity/importData',
            method: 'POST',
            margin: '5',
            fileUpload: true,
            width: 400,
            callBacked: false,
            border: 0,
            layout: 'column',
            items: [
                {
                    xtype: 'filefield',
                    fieldLabel: 'Excel文件',
                    labelWidth: 60,
                    labelAlign: 'right',
                    buttonText: '选择文件',
                    allowBlank: false,
                    name: 'file',
                    columnWidth: 1,
                    listeners: {
                        change: function (obj, value, eOpts) {
                            if (value != null && value.length != 0) {
                                if (!files.excel().reg.test(value)) {
                                    formPanel.form.reset();
                                    Ext.Msg.alert('系统提醒', "请上传有效的Excel文档！");
                                }
                            }
                        }
                    }
                }],
            doSubmit: function () {
                var form = formPanel.form;
                if (form.isValid()) {
                    var myMask = new Ext.LoadMask({
                        msg: '正在导入中…',
                        target: uploadWin
                    });
                    myMask.show();
                    form.submit({
                        params: params,
                        success: function (form, action) {
                            if (!resolve.called) {
                                resolve.called = true;
                                resolve(action.result);
                            }
                            uploadWin.close();
                        },
                        failure: function (form, action) {
                            myMask.destroy();
                            Ext.Msg.alert('系统提醒', "导入失败！" + action.result.message);
                        }
                    });
                }
            },
            listeners: {
                'render': function (obj) {
                    new Ext.KeyMap(obj.getEl(), [{
                        key: 13,
                        fn: formPanel.doSubmit,
                        scope: Ext.getBody()
                    }]);
                }
            }
        });
        var btnSubmitId = "btnSubmit" + new Date().getTime();
        var uploadWin = Ext.create('Ext.window.Window', {
            title: "导入Excel数据",
            layout: 'fit',
            resizable: false,
            scrollable: false,
            items: formPanel,
            modal: true,
            iconCls: 'extIcon extUpload',
            animateTarget: obj,
            constrain: true,
            buttons: [
                {
                    text: '重置',
                    width: 88,
                    iconCls: 'extIcon extReset',
                    handler: function () {
                        formPanel.form.reset();
                    }
                },
                {
                    text: '上传',
                    width: 88,
                    id: btnSubmitId,
                    iconCls: 'extIcon extOk',
                    handler: function () {
                        formPanel.doSubmit();
                    }
                }],
            listeners: {
                show: function (winObj, eOpts) {
                    formPanel.getForm().findField('file').fileInputEl.dom.click();
                    Ext.getCmp(btnSubmitId).focus();
                },
                close: function (winObj, eOpts) {
                    if (!resolve.called) {
                        resolve.called = true;
                        resolve();
                    }
                }
            }
        });
        uploadWin.show();
    });
}



