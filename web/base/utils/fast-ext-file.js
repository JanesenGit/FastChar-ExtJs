Ext.override(Ext.form.field.File, {
    onRender: Ext.Function.createSequence(Ext.form.field.File.prototype.onRender, function () {
        let me = this;
        if (me.multiple) {
            me.fileInputEl.dom.setAttribute("multiple", "multiple");
        }
    })
});


//定义fileModules
const files = {
    formatLength: function (length) {
        if (length < 1024) {
            return length + "B";
        }
        if (length < 1024 * 1024) {
            return (length / 1024).toFixed(2) + "KB";
        }
        return (length / 1024 / 1024).toFixed(2) + "M";
    },
    validate: function (modules, name) {
        if (Ext.isEmpty(modules)) {
            showAlert("系统提醒", "参数" + name + "必传！");
            return false;
        }
        if (!Ext.isArray(modules)) {
            showAlert("系统提醒", "参数" + name + "必需Array格式！");
            return false;
        }
        if (modules === 0) {
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
    image: function (width, height) {
        if (Ext.isEmpty(width)) {
            width = -1;
        }
        if (Ext.isEmpty(height)) {
            height = -1;
        }
        return {
            width: width,
            height: height,
            reg: /\.(jpg|png|gif|jpeg|svg|bmp)$/i,
            tipMsg: '图片',
            type: 'images',
            renderer: renders.image(24)
        };
    },
    mp4: function (maxDuration) {//maxDuration 最大时长，单位毫秒
        return {
            reg: /\.(mp4)$/i,
            tipMsg: 'mp4',
            type: 'videos',
            maxDuration: maxDuration,
            onFileSelect: function (filefield) {
                let me = this;
                return new Ext.Promise(function (resolve, reject) {
                    if (Ext.isEmpty(me.maxDuration)) {
                        resolve();
                        return;
                    }
                    let video = filefield.fileInputEl.dom.files[0];
                    let url = URL.createObjectURL(video);
                    let audio = new Audio(url)
                    audio.addEventListener("loadedmetadata", function (e) {
                        if (audio.duration * 1000 > parseInt(me.maxDuration)) {
                            resolve("视频最大时长不得超过" + me.maxDuration / 1000 + "秒！");
                        }
                    });
                });
            },
            renderer: renders.file()
        };
    },
    word: function () {
        return {
            reg: /\.(doc|docx)$/i,
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
    ppt: function () {
        return {
            reg: /\.(ppt|pptx)$/i,
            tipMsg: 'ppt文档',
            type: 'ppt',
            renderer: renders.file()
        };
    },
    pdf: function () {
        return {
            reg: /\.(pdf)$/i,
            tipMsg: 'pdf文档',
            type: 'pdf',
            renderer: renders.file()
        };
    },
    zip: function () {
        return {
            reg: /\.(zip|rar)$/i,
            tipMsg: 'zip压缩包',
            type: 'zip',
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
 * @param multiple 是否允许多选文件
 * @param useEditUrl 是否允许手动编写文件url
 * @example
 * uploadFile(this,[file.image(),file.excel()])
 */
function uploadFile(obj, fileModules, multiple, useEditUrl) {
    return new Ext.Promise(function (resolve, reject) {
        let title = "上传文件", type = "files", width = -1, height = -1, name = "file";
        if (!files.validate(fileModules, "fileModules")) {
            return;
        }
        if (fileModules.length === 1) {
            title = "上传" + fileModules[0].tipMsg;
            type = fileModules[0].type;
            width = fileModules[0].width;
            height = fileModules[0].height;
        }
        if (Ext.isEmpty(useEditUrl)) {
            useEditUrl = true;
        }
        if (obj) {
            if (obj.name) {
                name = obj.name;
            }
            if (obj.dataIndex) {
                name = obj.dataIndex;
            }
        }
        let formPanel = Ext.create('Ext.form.FormPanel', {
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
                    name: name,
                    multiple: multiple,
                    columnWidth: 1,
                    listeners: {
                        change: function (obj, value, eOpts) {
                            if (value != null && value.length !== 0) {
                                let errorMsg = "";
                                for (let i = 0; i < fileModules.length; i++) {
                                    let fileModule = fileModules[i];
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
                let form = formPanel.form;
                if (form.isValid()) {
                    let myMask = new Ext.LoadMask({
                        msg: '正在上传附件中…',
                        target: uploadWin
                    });
                    myMask.show();
                    let formSubmitRun = function () {
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
                    };
                    let onFileSelectRun = function (i) {
                        if (i >= fileModules.length) {
                            formSubmitRun();
                            return;
                        }
                        let fileModel = fileModules[i];
                        if (Ext.isFunction(fileModel.onFileSelect)) {
                            fileModel.onFileSelect(formPanel.getForm().findField(name)).then(function (error) {
                                if (Ext.isEmpty(error)) {
                                    onFileSelectRun(i + 1);
                                }else{
                                    myMask.destroy();
                                    formPanel.form.reset();
                                    Ext.Msg.alert('系统提醒', error);
                                }
                            });
                        } else {
                            onFileSelectRun(i + 1);
                        }
                    };
                    onFileSelectRun(0);
                }
            },
            listeners: {
                'render': function (obj) {
                    try {
                        new Ext.util.KeyMap({
                            target: obj.getEl(),
                            key: 13,
                            fn: formPanel.doSubmit,
                            scope: Ext.getBody()
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        });
        let btnSubmitId = "btnSubmit" + new Date().getTime();
        let uploadWin = Ext.create('Ext.window.Window', {
            title: title,
            layout: 'fit',
            resizable: false,
            scrollable: false,
            width: 500,
            items: formPanel,
            modal: true,
            iconCls: 'extIcon extUpload',
            animateTarget: obj,
            constrain: true,
            buttons: [
                {
                    text: '使用地址',
                    iconCls: 'extIcon extEdit',
                    hidden: !useEditUrl,
                    handler: function () {
                        Ext.Msg.prompt('使用自定义的文件地址', '填写自定义的文件路径（http）：', function (btn, text) {
                            if (btn === 'ok') {
                                if (!Ext.isEmpty(text)) {
                                    if (!resolve.called) {
                                        resolve.called = true;
                                        resolve({"url": text});
                                    }
                                    uploadWin.close();
                                }
                            }
                        });
                    }
                },
                {
                    text: '网络同步',
                    iconCls: 'extIcon extLink',
                    handler: function () {
                        Ext.Msg.prompt('从网络中下载文件', '填写网络文件路径（http）：', function (btn, text) {
                            if (btn === 'ok') {
                                showWait("正在同步中，请稍后……");
                                let params = {"url": text, "__accept": "application/json"};
                                $.post("upload", params, function (result) {
                                    hideWait();
                                    if (result.success) {
                                        toast("文件上传成功！");
                                        if (!resolve.called) {
                                            resolve.called = true;
                                            resolve(result.data);
                                        }
                                        uploadWin.close();
                                    } else {
                                        Ext.Msg.alert('系统提醒', "上传失败！" + result.message);
                                    }
                                });
                            }
                        });
                    }
                },
                '->',
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
                    formPanel.getForm().findField(name).fileInputEl.dom.click();
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
 * @param title
 * @example
 * showFiles(this,function(val){
 *
 * },[file.image(),file.excel()])
 */
function showFiles(obj, callBack, fileModules, defaultFiles, title) {
    if (!files.validate(fileModules, "fileModules")) {
        return;
    }
    if (obj) {
        obj.blur();
    }
    let datas = [], renderer = renders.file();
    if (!title) {
        title = "文件管理";
    }
    if (!Ext.isEmpty(defaultFiles)) {
        let fileArray = defaultFiles;
        if (Ext.isString(defaultFiles)) {
            fileArray = Ext.JSON.decode(defaultFiles);
        }
        for (let i = 0; i < fileArray.length; i++) {
            let source = fileArray[i];
            let arrayInfo = source.split("@");
            let url = arrayInfo[0];
            let name = url.substring(url.lastIndexOf("/") + 1);
            let length = -1;
            if (arrayInfo.length > 1) {
                name = arrayInfo[1];
            }
            if (arrayInfo.length > 2) {
                length = arrayInfo[2];
            }
            datas.push({url: url, name: name, length: length});
        }
    }
    if (fileModules.length === 1) {
        renderer = fileModules[0].renderer;
        title = fileModules[0].tipMsg + "管理";
    }
    let columns = [
        {
            header: '文件',
            dataIndex: 'url',
            flex: 1,
            align: 'center',
            renderer: renderer
        }
    ];
    if (obj.showFileName) {
        columns.push({
            header: '文件名',
            dataIndex: 'name',
            width: 150,
            align: 'center',
            field: {
                xtype: 'textfield',
                listeners: {
                    change: function () {
                        fileStore.modify = true;
                    }
                }
            },
            renderer: renders.normal()
        });

        if (obj.showFileLength) {
            columns.push({
                header: '大小',
                dataIndex: 'length',
                width: 100,
                align: 'center',
                renderer: renders.fileSize()
            });
        }
    }


    let currTime = Ext.now();
    let fileStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        data: datas
    });

    let dataGridFiles = Ext.create('Ext.grid.Panel', {
        selModel: getGridSelModel(),
        store: fileStore,
        columnLines: true,
        cellTip: true,
        columns: columns,
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
                    let data = dataGridFiles.getSelectionModel().getSelection();
                    if (data.length === 0) {
                        toast("请您选择需要删除的文件！");
                    } else {
                        Ext.Msg.confirm("系统提醒", "您确定立即删除选中的附件吗？", function (button, text) {
                            if (button === "yes") {
                                let params = {};
                                Ext.Array.each(data, function (record, index) {
                                    params["path[" + index + "]"] = record.get("url");
                                });
                                showWait("正在删除中……");
                                server.deleteAttach(params, function (success, message) {
                                    hideWait();
                                    if (success) {
                                        dataGridFiles.getSelectionModel().deselectAll();
                                        showAlert("系统提醒", "删除成功！");
                                        Ext.Array.each(data, function (record, index) {
                                            fileStore.remove(record);
                                            fileStore.modify = true;
                                        });
                                    } else {
                                        showAlert("系统提醒", message);
                                    }
                                });
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
                    uploadFile(this, fileModules, true).then(function (result) {
                        if (result) {
                            if (Ext.isArray(result)) {
                                for (let i = 0; i < result.length; i++) {
                                    fileStore.add(result[i]);
                                }
                            } else {
                                fileStore.add(result);
                            }
                            fileStore.modify = true;
                        }
                    });
                }
            }
        ],
        listeners: {
            selectionchange: function () {
                let data = this.getSelectionModel().getSelection();
                Ext.getCmp("btnDeleteFile" + currTime).setDisabled(!(data.length > 0));
            }
        }
    });

    let win = Ext.create('Ext.window.Window', {
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
        buttons: [{
            text: '确定',
            iconCls: 'extIcon extOk',
            handler: function () {
                let data = [];
                fileStore.each(function (record, index) {
                    let url = record.get("url");
                    if (obj.showFileName) {
                        url = url + "@" + record.get("name");
                        if (obj.showFileLength) {
                            url = url + "@" + record.get("length");
                        }
                    }
                    data.push(url);
                });
                if (callBack != null) {
                    callBack(Ext.encode(data));
                }
                win.close();
            }
        }],
        listeners: {
            close: function () {
                if (fileStore.modify) {

                }
            }
        }
    });
    win.show();
}


/**
 * 导入excel数据
 */
function importExcel(obj, params, formItems, serverUrl) {
    return new Ext.Promise(function (resolve, reject) {
        if (!formItems) {
            formItems = [];
        } else {
            formItems = Ext.Array.clone(formItems);
        }
        if (!serverUrl) {
            serverUrl = "entity/importData";
        }
        formItems.push({
            xtype: 'filefield',
            fieldLabel: 'Excel文件',
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
        });
        let formPanel = Ext.create('Ext.form.FormPanel', {
            url: serverUrl,
            method: 'POST',
            margin: '5',
            fileUpload: true,
            width: 400,
            callBacked: false,
            border: 0,
            layout: 'column',
            defaults: {
                labelWidth: 80,
                margin: '5 5 5 5',
                labelAlign: 'right',
                emptyText: '请填写'
            },
            items: formItems,
            doSubmit: function () {
                let form = formPanel.form;
                if (form.isValid()) {
                    let myMask = new Ext.LoadMask({
                        msg: '正在导入中…',
                        target: uploadWin
                    });
                    myMask.show();
                    form.submit({
                        params: params,
                        success: function (form, action) {
                            myMask.destroy();
                            Ext.Msg.alert('系统提醒', action.result.message, function () {
                                runCallBack(resolve, action.result);
                                uploadWin.close();
                            });
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
                    try {
                        new Ext.util.KeyMap({
                            target: obj.getEl(),
                            key: 13,
                            fn: formPanel.doSubmit,
                            scope: Ext.getBody()
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        });
        let btnSubmitId = "btnSubmit" + new Date().getTime();
        let uploadWin = Ext.create('Ext.window.Window', {
            title: "导入Excel数据",
            layout: 'fit',
            resizable: false,
            scrollable: false,
            items: [formPanel],
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
                    if (formItems.length === 1) {
                        formPanel.getForm().findField('file').fileInputEl.dom.click();
                        Ext.getCmp(btnSubmitId).focus();
                    }
                }
            }
        });
        uploadWin.show();
    });
}




