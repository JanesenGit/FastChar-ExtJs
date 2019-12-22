/**
 * 枚举组件
 */
Ext.define("Fast.ext.EnumComboBox", {
    alias: ['widget.enumcombobox', 'widget.enumcombo'],
    extend: 'Ext.form.field.ComboBox',
    enumName: 'NONE',//枚举名称
    enumValue: 'id',
    enumText: 'text',
    exclude: [],//排除id
    firstData: null,//插入到头部的数据
    lastData: null,//插入到尾部的数据
    initComponent: function () {
        let me = this;
        me.displayField = me.enumText;
        me.valueField = me.enumValue;
        me.editable = false;
        me.store = getEnumDataStore(me.enumName, me.firstData, me.lastData);
        me.store.filterBy(function (record) {
            if (me.exclude.exists(record.get(me.enumValue))) {
                return false;
            }
            return true;
        });
        me.callParent();
    }
});

/**
 * 上传文件组件
 */
Ext.define("Fast.ext.FastFile", {
    extend: 'Ext.form.field.Text',
    alias: ['widget.fastfile', 'widget.fastfilefield'],
    fileModules: [],
    editable: false,
    getMenu: function () {
        return this.up("menu");
    },
    listeners: {
        change: function (obj, newValue, oldValue, eOpts) {
            if (Ext.isEmpty(newValue)) {
                obj.getTrigger('help').hide();
            } else {
                obj.getTrigger('help').show();
            }
        },
        afterrender: function (obj) {
            let me = this;
            if (!this.editable) {
                obj.inputEl.on('click', function () {
                    me.selectData();
                });
            }
        }
    },
    initComponent: function () {
        let errorMsg = "";
        for (let i = 0; i < this.fileModules.length; i++) {
            let fileModule = this.fileModules[i];
            errorMsg = errorMsg + "或" + fileModule.tipMsg;
        }
        this.emptyText = '请上传' + errorMsg.substring(1);
        this.editable = false;
        this.callParent(arguments);
    },
    triggers: {
        help: {
            cls: 'extIcon extEye',
            hidden: true,
            handler: function () {
                let me = this;
                if (me.fileModules.length == 1) {
                    if (me.fileModules[0].type == 'images') {
                        if (me.getMenu()) {
                            me.getMenu().holdShow = true;
                        }
                        me.blur();
                        showImage(me, me.getValue(), function () {
                            if (me.getMenu()) {
                                me.getMenu().holdShow = false;
                            }
                        }, true);
                        return;
                    }
                }
                location.href = me.getValue();
            }
        },
        search: {
            cls: 'extIcon extUpload',
            handler: function () {
                this.selectData();
            }
        }
    },
    selectData: function () {
        let me = this;
        if (me.getMenu()) {
            me.getMenu().holdShow = true;
        }
        uploadFile(me, me.fileModules).then(function (result) {
            if (me.getMenu()) {
                me.getMenu().holdShow = false;
            }
            if (result) {
                me.setValue(result.url);
            }
        });
    }
});


/**
 * 多个文件组件
 */
Ext.define("Fast.ext.FastFiles", {
    alias: ['widget.fastfiles', 'widget.fastfilesfield'],
    extend: 'Ext.form.field.Text',
    editable: false,
    fileModules: [],
    allowBlank: true,
    autoUpdate: true,
    getMenu: function () {
        return this.up("menu");
    },
    listeners: {
        afterrender: function (obj) {
            let me = this;
            if (!this.editable) {
                obj.inputEl.on('click', function () {
                    me.showWindow(me);
                });
            }
        }
    },
    initComponent: function () {
        let errorMsg = "";
        for (let i = 0; i < this.fileModules.length; i++) {
            let fileModule = this.fileModules[i];
            errorMsg = errorMsg + "或" + fileModule.tipMsg;
        }
        this.emptyText = '请上传' + errorMsg.substring(1);
        this.editable = false;
        this.callParent(arguments);
    },
    triggers: {
        search: {
            cls: 'text-search',
            handler: function () {
                this.showWindow(this);
            }
        }
    },
    showWindow: function (obj, callBack, title) {
        let me = this;
        showFiles(this, function (result) {
            me.setValue(result);
            if (Ext.isFunction(callBack)) {
                callBack(me);
            }
        }, me.fileModules, me.getValue());
    }
});


/**
 * 大文本组件
 */
Ext.define("Fast.ext.Content", {
    alias: ['widget.content', 'widget.contentfield'],
    extend: 'Ext.form.field.TextArea',
    height: 220,
    emptyText: '请填写……',
    allowBlank: true,
    getCode: function () {
        return $.md5(this.getName() + this.dataIndex + this.getFieldLabel());
    },
    showWindow: function (obj, callBack, title) {
        if (Ext.isEmpty(title)) {
            title = "编辑内容";
        }
        let me = this;
        me.oldValue = me.getValue();
        if (!me.editorWin) {
            me.editorWin = Ext.create('Ext.window.Window', {
                title: title,
                iconCls: 'extIcon extEdit',
                resizable: true,
                maximizable: true,
                height: 400,
                width: 600,
                layout: 'fit',
                animateTarget: obj,
                items: [me],
                modal: true,
                constrain: true,
                closeAction: 'hide',
                listeners: {
                    show: function (obj) {
                        server.showExtConfig(me.getCode(), "TextEditorCache", function (success, value) {
                            if (success) {
                                me.setValue(value);
                            }
                        });
                    }
                },
                buttons: [
                    {
                        text: '暂存',
                        iconCls: 'extIcon extSave whiteColor',
                        handler: function () {
                            showWait("暂存中，请稍后……");
                            server.saveExtConfig(me.getCode(), "TextEditorCache", me.getValue(), function (success, message) {
                                hideWait();
                                if (success) {
                                    toast("暂存成功！");
                                } else {
                                    showAlert("系统提醒", message);
                                }
                            });
                        }
                    },
                    {
                        text: '重置',
                        iconCls: 'extIcon extReset',
                        handler: function () {
                            me.setValue(me.oldValue);
                            server.deleteExtConfig(me.getCode(), "TextEditorCache");
                        }
                    },
                    {
                        text: '确定',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            showWait("请稍后……");
                            server.deleteExtConfig(me.getCode(), "TextEditorCache", function (success) {
                                hideWait();
                                if (Ext.isFunction(me.editorWin.callBack)) {
                                    me.editorWin.callBack(me);
                                }
                                me.editorWin.close();
                            });
                        }
                    }]
            });
        }
        me.editorWin.setTitle(title);
        me.editorWin.callBack = callBack;
        me.editorWin.animateTarget = obj;
        me.editorWin.show();
    }
});


/**
 * HtmlContent组件
 */
Ext.define("Fast.ext.HtmlContent", {
    alias: ['widget.htmlcontent', 'widget.htmlcontentfield'],
    extend: 'Ext.form.FieldContainer',
    height: 300,
    getName: function () {
        return this.name;
    },
    autoShowEditor: true,
    allowBlank: true,
    showEditor: function () {
        let me = this;
        window["editorLoadDone"] = function () {
            me.setValue(me.value);
            me.setPostImageUrl(system.formatUrl("upload?type=editor"));
        };
        let frameId = "EditorFrame" + Ext.now();
        me.editorFrameId = frameId;
        let url = system.formatUrlVersion("base/editor/index.html");
        let html = "<iframe id='" + frameId + "' " + " src='" + url + "' width='100%' height='100%'" +
            " frameborder='0' scrolling='no' style='border: 1px solid #d0d0d0;'/>";
        me.update(html);
    },
    listeners: {
        afterrender: function (obj) {
            if (obj.autoShowEditor) {
                obj.showEditor();
            }
        }
    },
    getCode: function () {
        return $.md5(this.getName() + this.dataIndex + this.getFieldLabel());
    },
    isValid: function () {
        return true;
    },
    getValue: function () {
        let me = this;
        let value = me.down("[realValue=true]");
        if (value) {
            return value.getValue();
        }
        return me.value;
    },
    setValue: function (val) {
        let me = this;
        let value = me.down("[realValue=true]");
        if (value) {
            value.setValue(val);
        }
        me.value = val;
    },
    setHtml: function (val) {
        this.setValue(val);
    },
    setPostImageUrl: function (val) {
        let me = this;
        if (me.editorFrameId) {
            let iframe = document.getElementById(me.editorFrameId);
            if (iframe && Ext.isFunction(iframe.contentWindow.getHtmlValue)) {
                iframe.contentWindow.setPostImageUrl(val);
            }
        }
    },
    initComponent: function () {
        let me = this;
        me.items = [
            {
                xtype: 'textfield',
                name: me.name,
                hidden: true,
                realValue: true,
                fieldLabel: me.fieldLabel,
                allowBlank: me.allowBlank,
                validation: '请输入' + me.fieldLabel,
                isValid: function () {
                    if (!this.allowBlank) {
                        if (Ext.isEmpty($(this.getRawValue()).text())) {
                            return false;
                        }
                    }
                    return true;
                },
                getRawValue: function () {
                    if (me.editorFrameId) {
                        let iframe = document.getElementById(me.editorFrameId);
                        if (iframe && Ext.isFunction(iframe.contentWindow.getHtmlValue)) {
                            return iframe.contentWindow.getHtmlValue();
                        }
                    }
                    return null;
                },
                setValue: function (val) {
                    me.value = val;
                    if (me.editorFrameId) {
                        let iframe = document.getElementById(me.editorFrameId);
                        if (iframe && Ext.isFunction(iframe.contentWindow.setHtmlValue)) {
                            iframe.contentWindow.setHtmlValue(val);
                        }
                    }
                }
            }
        ];
        me.callParent(arguments);
    },
    showWindow: function (obj, callBack, title) {
        if (Ext.isEmpty(title)) {
            title = "编辑内容";
        }
        let me = this;
        me.autoShowEditor = false;
        me.oldValue = me.value;
        if (!me.editorWin) {
            me.editorWin = Ext.create('Ext.window.Window', {
                title: title,
                iconCls: 'extIcon extEdit',
                resizable: true,
                maximizable: true,
                height: 400,
                width: 600,
                layout: 'fit',
                animateTarget: obj,
                items: [me],
                modal: true,
                constrain: true,
                closeAction: 'hide',
                listeners: {
                    show: function (val) {
                        me.showEditor();
                        server.showExtConfig(me.getCode(), "HtmlEditorCache", function (success, value) {
                            if (success) {
                                me.setValue(value);
                            }
                        });
                    }
                },
                buttons: [
                    {
                        text: '暂存',
                        iconCls: 'extIcon extSave whiteColor',
                        handler: function () {
                            showWait("暂存中，请稍后……");
                            server.saveExtConfig(me.getCode(), "HtmlEditorCache", me.getValue(), function (succes, message) {
                                hideWait();
                                if (succes) {
                                    toast("暂存成功！");
                                } else {
                                    showAlert("系统提醒", message);
                                }
                            });
                        }
                    },
                    {
                        text: '重置',
                        iconCls: 'extIcon extReset',
                        handler: function () {
                            me.setValue(me.oldValue);
                            server.deleteExtConfig(me.getCode(), "HtmlEditorCache");
                        }
                    },
                    {
                        text: '确定',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            let params = {
                                "configKey": me.getCode(),
                                "configType": "HtmlEditorCache"
                            };
                            showWait("请稍后……");
                            server.deleteExtConfig(me.getCode(), "HtmlEditorCache", function (success) {
                                hideWait();
                                if (Ext.isFunction(me.editorWin.callBack)) {
                                    me.editorWin.callBack(me);
                                }
                                me.editorWin.close();
                            });
                        }
                    }]
            });
        }
        me.editorWin.setTitle(title);
        me.editorWin.callBack = callBack;
        me.editorWin.animateTarget = obj;
        me.editorWin.show();
    }
});


/**
 * Link组件
 */
Ext.define("Fast.ext.Link", {
    alias: ['widget.link', 'widget.linkfield'],
    extend: 'Ext.form.FieldContainer',
    entityId: null,
    entityText: null,
    entityCode: null,
    linkValue: null,
    editable: false,
    allowBlank: true,
    layout: 'fit',
    multiSelect: false,
    submitValue: true,
    onBeforeSelect: null,
    onAfterSelect: null,
    isValid: function () {
        let me = this;
        let display = me.down("[name=" + me.name + "Display]");
        display.allowBlank = me.allowBlank;
        return display.isValid();
    },
    getName: function () {
        return this.name;
    },
    getValue: function () {
        let me = this;
        if (me.submitValue) {
            let value = me.down("[name=" + me.name + "]");
            return value.getValue();
        }
        return me.getText();
    },
    getText: function () {
        let me = this;
        let display = me.down("[name=" + me.name + "Display]");
        return display.getValue();
    },
    setRecordValue: function (record) {
        let me = this;
        if (record) {
            if (Ext.isEmpty(me.getText()) && Ext.isEmpty(record.get(me.dataIndex))) {
                return;
            }
            if (record.store) {
                record.store.holdUpdate = true;
            }
            record.set(me.name, me.getValue());
            record.set(me.dataIndex, me.getText());
            if (record.store) {
                record.store.holdUpdate = false;
                record.store.fireEvent("endupdate");
            }
        }
    },
    setValue: function (val, record) {
        let me = this;
        let display = me.down("[name=" + me.name + "Display]");
        display.setValue(val);
        if (record) {
            me.setRawValue(record.get(me.name));
        }
        if (!val) {//清空数据
            me.setRawValue(-1);
            let moreFieldContainer = me.down("[name=" + me.name + "MoreFields]");
            moreFieldContainer.removeAll(true);
        }
    },
    setHtml: function (val) {
        this.setValue(val);
    },
    setRawValue: function (val, moreValues) {
        let me = this;
        let value = me.down("[name=" + me.name + "]");
        if (value) {
            value.setValue(val);
        }
        let moreFieldContainer = me.down("[name=" + me.name + "MoreFields]");
        moreFieldContainer.removeAll(true);
        if (moreValues) {
            for (let i = 0; i < moreValues.length; i++) {
                let newField = Ext.create({
                    xtype: 'hiddenfield',
                    name: me.name
                });
                newField.setValue(moreValues[i]);
                moreFieldContainer.add(newField);
            }
        }
    },
    getRawValue: function () {
        let me = this;
        let value = me.down("[name=" + me.name + "]");
        if (value) {
            return value.getValue();
        }
        return null;
    },
    getMenu: function () {
        return this.up("menu");
    },
    selectData: function () {
        let me = this;
        if (Ext.isFunction(me.onBeforeSelect)) {
            if (!me.onBeforeSelect(me)) {
                return;
            }
        }
        if (me.getMenu()) {
            me.getMenu().holdShow = true;
        }
        if (!me.entityCode) {
            showAlert("系统提醒", "请配置组件的entityCode属性值！", function () {
                if (me.getMenu()) {
                    me.getMenu().holdShow = false;
                }
            });
            return;
        }
        if (!me.entityId) {
            showAlert("系统提醒", "请配置组件的entityId属性值！", function () {
                if (me.getMenu()) {
                    me.getMenu().holdShow = false;
                }
            });
            return;
        }
        if (!me.entityText) {
            showAlert("系统提醒", "请配置组件的entityText属性值！", function () {
                if (me.getMenu()) {
                    me.getMenu().holdShow = false;
                }
            });
            return;
        }
        let entity = system.getEntity(me.entityCode);
        if (!entity) {
            showAlert("系统提醒", "未获取到 '" + me.entityCode + "' 实体类！", function () {
                if (me.getMenu()) {
                    me.getMenu().holdShow = false;
                }
            });
            return;
        }
        if (!entity.js) {
            showAlert("系统提醒", "未获取到 '" + me.entityCode + "' JS对象！", function () {
                if (me.getMenu()) {
                    me.getMenu().holdShow = false;
                }
            });
            return;
        }
        let entityObj = eval("new " + me.entityCode + "()");
        if (!Ext.isFunction(entityObj.showSelect)) {
            showAlert("系统提醒", "'" + me.entityCode + "' JS对象不存在函数showSelect(obj,callBack)！").then(function () {
                if (me.getMenu()) {
                    me.getMenu().holdShow = false;
                }
            });
            return;
        }
        let display = me.down("[name=" + me.name + "Display]");
        display.blur();
        let selectTitle = entity.shortName;
        if (me.fieldLabel) {
            selectTitle = me.fieldLabel;
        }
        if (me.labelTitle) {
            selectTitle = me.labelTitle;
        }
        entityObj.showSelect(this, "选择" + selectTitle, me.linkValue.where, me.multiSelect).then(function (result) {
            if (result) {
                if (result.length == 1) {
                    let data = result[0];
                    me.setValue(data.get(me.entityText));
                    me.setRawValue(data.get(me.entityId));
                    me.record = data;
                }else if (result.length > 1) {
                    me.records = result;
                    let newText = "";
                    let moreValues = [];
                    for (let i = 0; i < result.length; i++) {
                        let textValue = result[i].get(me.entityText);
                        if (Ext.isEmpty(textValue)) {
                            textValue = "无";
                        }
                        newText += "#" + textValue;
                        moreValues.push(result[i].get(me.entityId));
                    }
                    me.setRawValue(moreValues[0], moreValues.slice(1));
                    me.setValue(newText.substring(1));
                }
            }
            if (me.getMenu()) {
                me.getMenu().holdShow = false;
            }
            if (Ext.isFunction(me.onAfterSelect)) {
                me.onAfterSelect(me);
            }
        });
    },
    clearData: function () {
        let me = this;
        me.setValue(null);
        me.setRawValue(-1);
        let moreFieldContainer = me.down("[name=" + me.name + "MoreFields]");
        moreFieldContainer.removeAll(true);
    },
    initComponent: function () {
        let me = this;
        if (!me.linkValue) {
            me.linkValue = {};
            me.linkValue[me.entityId] = -1;
            me.linkValue[me.entityText] = null;
        }
        if (Ext.isEmpty(me.linkValue[me.entityId])) {
            me.linkValue[me.entityId] = -1;
        }
        if (Ext.isEmpty(me.name)) {
            me.name = "LinkField" + Ext.now();
        }
        let displayValue = me.linkValue[me.entityText];
        if (!displayValue) {
            displayValue = me.value;
        }
        me.items = [
            {
                xtype: 'hiddenfield',
                name: me.name,
                value: me.linkValue[me.entityId]
            },
            {
                xtype: 'fieldcontainer',
                name: me.name + "MoreFields",
                hidden:true,
                items: []
            },
            {
                xtype: 'textfield',
                name: me.name + "Display",
                editable: me.editable,
                value: displayValue,
                disabled: me.linkValue[me.entityText] != null,
                hideLabel: true,
                fieldLabel: me.fieldLabel,
                allowBlank: me.allowBlank,
                emptyText: me.emptyText,
                listeners: {
                    afterrender: function (obj) {
                        if (!this.editable) {
                            obj.inputEl.on('click', function () {
                                me.selectData();
                            });
                        }
                    }
                },
                triggers: {
                    close: {
                        cls: 'text-clear',
                        handler: function () {
                            me.clearData();
                            if (Ext.isFunction(me.onClearValue)) {
                                me.onClearValue();
                            }
                        }
                    },
                    search: {
                        cls: 'text-search',
                        handler: function () {
                            me.selectData();
                            this.inputEl.blur();
                        }
                    }
                }
            }
        ];
        me.callParent(arguments);
    }
});

/**
 * Target组件，适用于一个表格关联多个表格
 */
Ext.define("Fast.ext.Target", {
    alias: ['widget.target', 'widget.targetfield'],
    extend: 'Ext.form.FieldContainer',
    layout: "column",
    labelWidth: null,
    targetType: null,
    targetTypeReadOnly: false,
    targetTypeEnum: null,
    targetId: null,
    targetValue: null,
    targetFunction: 'getTargetEntity',
    getValue: function () {
        let me = this;
        let targetIdCmp = me.down("[name=" + me.targetId + "]");
        return targetIdCmp.getText();
    },
    setValue: function (val, record) {
        let me = this;
        let targetIdCmp = me.down("[name=" + me.targetId + "]");
        targetIdCmp.setValue(val);
        if (record) {
            me.targetValue = {};
            me.targetValue[me.targetType] = record.get(me.targetType);
            me.targetValue[me.targetId] = record.get(me.targetId);
            me.holdIdValue = me.getTargetTypeValue() != record.get(me.targetType);
            me.setTargetIdValue(record.get(me.targetId));
            me.setTargetTypeValue(record.get(me.targetType));
        }
    },
    setHtml: function (val) {
        this.setValue(val);
    },
    getSearchField: function () {

    },
    setRecordValue: function (record) {
        let me = this;
        if (record) {
            if (record.store) {
                record.store.holdUpdate = true;
            }
            if (me.targetId) {
                record.set(me.targetId, me.getTargetIdValue());
            }
            if (me.targetType) {
                record.set(me.targetType, me.getTargetTypeValue());
            }
            if (me.targetText && me.targetText != me.dataIndex) {
                record.set(me.targetText, me.getValue());
            }
            record.set(me.dataIndex, me.getValue());
            if (record.store) {
                record.store.holdUpdate = false;
                record.store.fireEvent("endupdate");
            }
        }
    },
    setTargetTypeValue: function (value) {
        let me = this;
        let targetTypeCmp = me.down("[name=" + me.targetType + "]");
        if (targetTypeCmp) {
            targetTypeCmp.setValue(value);
        }
    },
    getTargetTypeValue: function () {
        let me = this;
        let targetTypeCmp = me.down("[name=" + me.targetType + "]");
        if (targetTypeCmp) {
            return targetTypeCmp.getValue();
        }
        return 0;
    },
    setTargetIdValue: function (value) {
        let me = this;
        let targetIdCmp = me.down("[name=" + me.targetId + "]");
        if (targetIdCmp) {
            targetIdCmp.setRawValue(value);
        }
    },
    getTargetIdValue: function () {
        let me = this;
        let targetIdCmp = me.down("[name=" + me.targetId + "]");
        if (targetIdCmp) {
            return targetIdCmp.getRawValue();
        }
        return -1;
    },
    getTargetEntity: function (targetType) {
        let me = this;
        let targetEntity = window[me.targetFunction](targetType, me.targetType);
        if (!targetEntity) {
            showAlert("目标组件错误", "未获取到TargetType为：" + targetType + "的实体配置！");
            return null;
        }
        return targetEntity;
    },
    showWindow: function (obj, callBack, title) {
        if (Ext.isEmpty(title)) {
            title = "编辑目标数据";
        }
        let me = this;
        if (!me.editorWin) {
            me.editorWin = Ext.create('Ext.window.Window', {
                title: title,
                height: 220,
                width: 400,
                minWidth: 400,
                minHeight: 220,
                layout: 'fit',
                resizable: true,
                modal: true,
                constrain: true,
                closeAction: 'hide',
                iconCls: 'extIcon extLink',
                items: [me],
                buttons: [
                    {
                        text: '取消',
                        iconCls: 'extIcon extClose',
                        handler: function () {
                            me.editorWin.close();
                        }
                    },
                    {
                        text: '确定',
                        iconCls: 'extIcon extOk',
                        handler: function () {
                            me.editorWin.close();
                            if (Ext.isFunction(me.editorWin.callBack)) {
                                me.editorWin.callBack(me);
                            }
                        }
                    }]
            });
        }
        me.editorWin.setTitle(title);
        me.editorWin.callBack = callBack;
        me.editorWin.animateTarget = obj;
        me.editorWin.show();
    },
    initComponent: function () {
        let me = this;
        me.fieldLabel = "";
        if (!me.labelWidth) {
            me.labelWidth = 60;
        }
        me.labelAlign = 'right';
        if (!me.emptyText) {
            me.emptyText = "请填写";
        }
        if (!me.margin) {
            me.margin = '5 5 5 5';
        }
        let linkValue = {};
        if (!Ext.isFunction(window[me.targetFunction])) {
            showAlert("目标组件错误", "未检测到方法" + me.targetFunction + "!");
            me.callParent(arguments);
            return;
        }
        if (!me.targetValue) {
            me.targetValue = {};
            me.targetValue[me.targetType] = 0;
            me.targetValue[me.targetId] = -1;
        }
        if (!me.targetValue[me.targetType]) {
            me.targetValue[me.targetType] = 0;
        }
        if (!me.targetValue[me.targetId]) {
            me.targetValue[me.targetId] = -1;
        }

        if (me.targetEnum) {
            me.targetTypeEnum = me.targetEnum;
        }
        if (!me.targetTypeEnum) {
            me.targetTypeEnum = me.targetType.replace(me.targetType[0], me.targetType[0].toUpperCase()) + "Enum";
        }

        let targetTypeValue = me.targetValue[me.targetType];
        let targetEntity = me.getTargetEntity(targetTypeValue);
        if (!targetEntity) {
            return;
        }

        linkValue[targetEntity.entityId] = me.targetValue[me.targetId];
        linkValue[targetEntity.entityText] = me.targetValue["targetText"];
        let targetTypeCmp = {
            name: me.targetType,
            xtype: "enumcombo",
            fieldLabel: "目标类型",
            columnWidth: 1,
            value: targetTypeValue,
            labelWidth: me.labelWidth,
            labelAlign: me.labelAlign,
            emptyText: '请选择目标类型',
            margin: me.margin,
            allowBlank: false,
            readOnly: me.targetTypeReadOnly,
            enumName: me.targetTypeEnum,
            listeners: {
                change: function (obj, newValue, oldValue) {
                    let newEntity = me.getTargetEntity(newValue);
                    if (newEntity) {
                        let targetIdCmp = me.down("[name=" + me.targetId + "]");
                        targetIdCmp.entityCode = newEntity.entityCode;
                        targetIdCmp.entityId = newEntity.entityId;
                        targetIdCmp.entityText = newEntity.entityText;
                        if (me.holdIdValue) {
                            me.holdIdValue = false;
                            return;
                        }
                        targetIdCmp.setValue(null);
                    }
                }
            }
        };
        let targetIdCmp = {
            name: me.targetId,
            xtype: "linkfield",
            fieldLabel: "目标数据",
            columnWidth: 1,
            margin: me.margin,
            labelWidth: me.labelWidth,
            labelAlign: me.labelAlign,
            entityCode: targetEntity.entityCode,
            entityId: targetEntity.entityId,
            entityText: targetEntity.entityText,
            linkValue: linkValue
        };
        me.items = [targetTypeCmp, targetIdCmp];
        me.callParent(arguments);
    }
});


/**
 * 地图组件
 */
Ext.define("Fast.ext.Map", {
    alias: ['widget.map', 'widget.mapfield'],
    extend: 'Ext.form.FieldContainer',
    lngName: 'lnt',
    latName: 'lat',
    proName: null,
    cityName: null,
    areaName: null,
    editable: true,
    allowBlank: true,
    layout: 'fit',
    submitValue: true,
    isValid: function () {
        let me = this;
        let value = me.down("[name=" + me.name + "]");
        return value.isValid();
    },
    getName: function () {
        return this.name;
    },
    getValue: function () {
        let me = this;
        let value = me.down("[name=" + me.name + "]");
        return value.getValue();
    },
    setValue: function (val, record) {
        let me = this;
        let value = me.down("[name=" + me.name + "]");
        value.setValue(val);
        if (record) {
            if (me.latName) {
                me.setLatValue(record.get(me.latName));
            }
            if (me.lngName) {
                me.setLngValue(record.get(me.lngName));
            }
            if (me.proName) {
                me.setProValue(record.get(me.proName));
            }
            if (me.cityName) {
                me.setCityValue(record.get(me.cityName));
            }
            if (me.areaName) {
                me.setAreaValue(record.get(me.areaName));
            }
        }
    },
    setHtml: function (val) {
        this.setValue(val);
    },
    setRecordValue: function (record) {
        let me = this;
        if (record) {
            if (record.store) {
                record.store.holdUpdate = true;
            }
            if (me.latName) {
                record.set(me.latName, me.getLatValue());
            }
            if (me.lngName) {
                record.set(me.lngName, me.getLngValue());
            }
            if (me.proName) {
                record.set(me.proName, me.getProValue());
            }
            if (me.cityName) {
                record.set(me.cityName, me.getCityValue());
            }
            if (me.areaName) {
                record.set(me.areaName, me.getAreaValue());
            }
            record.set(me.name, me.getValue());
            if (record.store) {
                record.store.holdUpdate = false;
                record.store.fireEvent("endupdate");
            }
        }
    },
    setLatValue: function (val) {
        let me = this;
        let lat = me.down("[name=" + me.latName + "]");
        if (lat) {
            lat.setValue(val);
        }
    },
    setLngValue: function (val) {
        let me = this;
        let lng = me.down("[name=" + me.lngName + "]");
        if (lng) {
            lng.setValue(val);
        }
    },
    setProValue: function (val) {
        let me = this;
        let pro = me.down("[name=" + me.proName + "]");
        if (pro) {
            pro.setValue(val);
        }
    },
    setCityValue: function (val) {
        let me = this;
        let city = me.down("[name=" + me.cityName + "]");
        if (city) {
            city.setValue(val);
        }
    },
    setAreaValue: function (val) {
        let me = this;
        let area = me.down("[name=" + me.areaName + "]");
        if (area) {
            area.setValue(val);
        }
    },
    getLatValue: function () {
        let me = this;
        let lat = me.down("[name=" + me.latName + "]");
        if (lat) {
            return lat.getValue();
        }
        return 0;
    },
    getLngValue: function () {
        let me = this;
        let lng = me.down("[name=" + me.lngName + "]");
        if (lng) {
            return lng.getValue();
        }
        return 0;
    },
    getProValue: function () {
        let me = this;
        let pro = me.down("[name=" + me.proName + "]");
        if (pro) {
            return pro.getValue();
        }
        return null;
    },
    getCityValue: function () {
        let me = this;
        let city = me.down("[name=" + me.cityName + "]");
        if (city) {
            return city.getValue();
        }
        return null;
    },
    getAreaValue: function () {
        let me = this;
        let area = me.down("[name=" + me.areaName + "]");
        if (area) {
            return area.getValue();
        }
        return null;
    },
    getMenu: function () {
        return this.up("menu");
    },
    selectData: function () {
        let me = this;
        if (me.getMenu()) {
            me.getMenu().holdShow = true;
        }
        let value = me.down("[name=" + me.name + "]");
        value.blur();
        showMap(me, me.getLngValue(), me.getLatValue(), me.getValue()).then(function (result) {
            if (result) {
                me.setLatValue(result.lat);
                me.setLngValue(result.lng);
                me.setProValue(result.pro);
                me.setAreaValue(result.area);
                me.setCityValue(result.city);
                me.setValue(result.addr);
            }
            if (me.getMenu()) {
                me.getMenu().holdShow = false;
            }
        });
    },
    clearData: function () {
        let me = this;
        me.setValue(null);
        me.setLatValue(0);
        me.setLngValue(0);
    },
    initComponent: function () {
        let me = this;
        if (!me.name) {
            me.name = me.dataIndex;
        }
        if (Ext.isEmpty(me.name)) {
            me.name = "MapField" + Ext.now();
        }
        me.items = [
            {
                xtype: 'hiddenfield',
                name: me.lngName,
                value: 0
            },
            {
                xtype: 'hiddenfield',
                name: me.latName,
                value: 0
            },
            {
                xtype: 'hiddenfield',
                name: me.proName
            },
            {
                xtype: 'hiddenfield',
                name: me.cityName
            },
            {
                xtype: 'hiddenfield',
                name: me.areaName
            },
            {
                xtype: 'textfield',
                name: me.name,
                editable: me.editable,
                fieldLabel: me.fieldLabel,
                hideLabel: true,
                allowBlank: me.allowBlank,
                emptyText: me.emptyText,
                listeners: {
                    afterrender: function (obj) {
                        if (!this.editable) {
                            obj.inputEl.on('click', function () {
                                me.selectData();
                            });
                        }
                    }
                },
                triggers: {
                    close: {
                        cls: 'text-clear',
                        handler: function () {
                            me.clearData();
                            if (Ext.isFunction(me.onClearValue)) {
                                me.onClearValue();
                            }
                        }
                    },
                    search: {
                        cls: 'text-search',
                        handler: function () {
                            me.selectData();
                            this.inputEl.blur();
                        }
                    }
                }
            }
        ];
        me.callParent(arguments);
    }
});


/**
 * 省市区组件
 */
Ext.define("Fast.ext.PCA", {
    alias: ['widget.pca', 'widget.pcafield'],
    extend: 'Ext.form.field.Text',
    proName: null,
    cityName: null,
    areaName: null,
    onAfterSelect: null,
    selectType: 0,//选择类型 0 拼接省份城市区 1 不拼接只返回选择的对象值
    setRecordValue: function (record) {
        let me = this;
        if (record) {
            if (record.store) {
                record.store.holdUpdate = true;
            }
            if (me.proName && me.name != me.proName && me.province) {
                record.set(me.proName, me.province.provinceName);
            }
            if (me.cityName && me.name != me.cityName && me.city) {
                record.set(me.cityName, me.city.cityName);
            }
            if (me.areaName && me.name != me.areaName && me.area) {
                record.set(me.areaName, me.area.areaName);
            }
            record.set(me.name, me.getValue());
            if (record.store) {
                record.store.holdUpdate = false;
                record.store.fireEvent("endupdate");
            }
        }
        me.clearData();
    },
    getMenu: function () {
        return this.up("menu");
    },
    selectData: function () {
        let me = this;
        if (me.getMenu()) {
            me.getMenu().holdShow = true;
        }
        if (!Ext.isFunction(window["selectPCA"])) {
            showAlert("系统提醒", "未检测到函数selectPCA！请导入FastChar-Location插件！", function () {
                if (me.getMenu()) {
                    me.getMenu().holdShow = false;
                }
            });
            return;
        }

        window["selectPCA"](me, function (success, province, city, area) {
            if (!toBool(success, false)) {
                return;
            }
            me.province = province;
            me.area = area;
            me.city = city;
            let formPanel = me.up("form");
            if (formPanel) {
                if (province && me.proName) {
                    formPanel.setFieldValue(me.proName, province.provinceName);
                }
                if (city && me.cityName) {
                    formPanel.setFieldValue(me.cityName, city.cityName);
                }
                if (area && me.areaName) {
                    formPanel.setFieldValue(me.areaName, area.areaName);
                }
            }
            let normalValue = "";
            if (province) {
                normalValue = province.provinceName;
                if (me.name == me.proName) {
                    me.setValue(province.provinceName);
                    normalValue = null;
                }
            }
            if (city) {
                if (normalValue) {
                    if (me.selectType == 0) {
                        normalValue += " " + city.cityName;
                    } else {
                        normalValue = city.cityName;
                    }
                }
                if (me.name == me.cityName) {
                    me.setValue(city.cityName);
                    normalValue = null;
                }
            }
            if (area) {
                if (normalValue) {
                    if (me.selectType == 0) {
                        normalValue += " " + area.areaName;
                    } else {
                        normalValue = area.areaName;
                    }
                }
                if (me.name == me.areaName) {
                    me.setValue(area.areaName);
                    normalValue = null;
                }
            }
            if (normalValue) {
                me.setValue(normalValue);
            }
            if (me.getMenu()) {
                me.getMenu().holdShow = false;
            }
            if (Ext.isFunction(me.onAfterSelect)) {
                me.onAfterSelect(me);
            }
        }, me.level);
    },
    clearData: function () {
        let me = this;
        me.setValue(null);
        me.province = null;
        me.area = null;
        me.city = null;
    },
    triggers: {
        close: {
            cls: 'text-clear',
            handler: function () {
                this.clearData();
                if (Ext.isFunction(this.onClearValue)) {
                    this.onClearValue();
                }
            }
        },
        search: {
            cls: 'text-search',
            handler: function () {
                this.selectData();
                this.inputEl.blur();
            }
        }
    },
    listeners: {
        afterrender: function (obj) {
            let me = this;
            if (!this.editable) {
                obj.inputEl.on('click', function () {
                    me.selectData();
                });
            }
        }
    },
    initComponent: function () {
        this.emptyText = "请选择省市区";
        this.editable = false;
        this.province = null;
        this.area = null;
        this.city = null;
        this.callParent(arguments);
    }
});














