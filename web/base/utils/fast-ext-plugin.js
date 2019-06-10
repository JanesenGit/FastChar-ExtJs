/**
 * 枚举组件
 */
Ext.define("Fast.ext.EnumComboBox", {
    alias: ['widget.enumcombobox', 'widget.enumcombo'],
    extend: 'Ext.form.field.ComboBox',
    enumName: 'NONE',//枚举名称
    exclude: [],//排除id
    initComponent: function () {
        var me = this;
        me.displayField = "text";
        me.valueField = "id";
        me.editable = false;
        me.store = getEnumDataStore(me.enumName);
        me.store.filterBy(function (record) {
            if (me.exclude.exists(record.get("id"))) {
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
            var me = this;
            if (!this.editable) {
                obj.inputEl.on('click', function () {
                    me.selectData();
                });
            }
        }
    },
    initComponent: function () {
        var errorMsg = "";
        for (var i = 0; i < this.fileModules.length; i++) {
            var fileModule = this.fileModules[i];
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
                var me = this;
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
        var me = this;
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
    getMenu: function () {
        return this.up("menu");
    },
    listeners: {
        afterrender: function (obj) {
            var me = this;
            if (!this.editable) {
                obj.inputEl.on('click', function () {
                    me.showWindow(me);
                });
            }
        }
    },
    initComponent: function () {
        var errorMsg = "";
        for (var i = 0; i < this.fileModules.length; i++) {
            var fileModule = this.fileModules[i];
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
        var me = this;
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
        var me = this;
        var oldValue = me.getValue();
        var win = Ext.create('Ext.window.Window', {
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
            listeners: {
                show: function (obj) {
                    server.showExtConfig(me.getCode(), "TextEditorCache", function (success, value) {
                        if (success) {
                            me.setValue(value);
                        }
                    });
                },
                close: function (obj) {
                    obj.removeAll(false);
                    obj.destroy();
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
                        me.setValue(oldValue);
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
                            if (Ext.isFunction(callBack)) {
                                callBack(me);
                            }
                            win.close();
                        });
                    }
                }]
        });
        win.show();
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
        var me = this;
        console.log("showEditor");
        window["editorLoadDone"] = function () {
            me.setValue(me.value);
            me.setPostImageUrl(system.formatUrl("upload?type=editor"));
        };
        var frameId = "EditorFrame" + Ext.now();
        me.editorFrameId = frameId;
        var url = system.formatUrlVersion("base/editor/index.html");
        var html = "<iframe id='" + frameId + "' " + " src='" + url + "' width='100%' height='100%'" +
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
        var me = this;
        var value = me.down("[realValue=true]");
        if (value) {
            return value.getValue();
        }
        return me.value;
    },
    setValue: function (val) {
        var me = this;
        var value = me.down("[realValue=true]");
        if (value) {
            value.setValue(val);
        }
        me.value = val;
    },
    setPostImageUrl: function (val) {
        var me = this;
        if (me.editorFrameId) {
            var iframe = document.getElementById(me.editorFrameId);
            if (iframe && Ext.isFunction(iframe.contentWindow.getHtmlValue)) {
                iframe.contentWindow.setPostImageUrl(val);
            }
        }
    },
    initComponent: function () {
        var me = this;
        me.items = [
            {
                xtype: 'textfield',
                name: me.name,
                hidden: true,
                realValue:true,
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
                        var iframe = document.getElementById(me.editorFrameId);
                        if (iframe && Ext.isFunction(iframe.contentWindow.getHtmlValue)) {
                            return iframe.contentWindow.getHtmlValue();
                        }
                    }
                    return null;
                },
                setValue: function (val) {
                    if (me.editorFrameId) {
                        var iframe = document.getElementById(me.editorFrameId);
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
        var me = this;
        me.autoShowEditor = false;
        var oldValue = me.value;
        var win = Ext.create('Ext.window.Window', {
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
            listeners: {
                show: function (val) {
                    me.showEditor();
                    server.showExtConfig(me.getCode(), "HtmlEditorCache", function (success, value) {
                        if (success) {
                            me.setValue(value);
                        }
                    });
                },
                close: function (obj) {
                    obj.removeAll(false);
                    obj.destroy();
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
                        me.setValue(oldValue);
                        server.deleteExtConfig(me.getCode(), "HtmlEditorCache");
                    }
                },
                {
                    text: '确定',
                    iconCls: 'extIcon extOk',
                    handler: function () {
                        var params = {
                            "configKey": me.getCode(),
                            "configType": "HtmlEditorCache"
                        };
                        showWait("请稍后……");
                        server.deleteExtConfig(me.getCode(), "HtmlEditorCache", function (success) {
                            hideWait();
                            if (Ext.isFunction(callBack)) {
                                callBack(me);
                            }
                            win.close();
                        });
                    }
                }]
        });
        win.show();
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
    submitValue: true,
    isValid: function () {
        var me = this;
        var display = me.down("[name=" + me.name + "Display]");
        return display.isValid();
    },
    getName: function () {
        return this.name;
    },
    getValue: function () {
        var me = this;
        if (me.submitValue) {
            var value = me.down("[name=" + me.name + "]");
            return value.getValue();
        }
        return me.getText();
    },
    getText: function () {
        var me = this;
        var display = me.down("[name=" + me.name + "Display]");
        return display.getValue();
    },
    setRecordValue: function (record) {
        var me = this;
        if (record) {
            record.set(me.name, me.getValue(), {silent: true});
            if (Ext.isEmpty(me.getText()) && Ext.isEmpty(record.get(me.dataIndex))) {
                return;
            }
            record.set(me.dataIndex, me.getText());
        }
    },
    setValue: function (val, record) {
        var me = this;
        var display = me.down("[name=" + me.name + "Display]");
        display.setValue(val);
        if (record) {
            me.setRawValue(record.get(me.name));
        }
    },
    setRawValue: function (val) {
        var me = this;
        var value = me.down("[name=" + me.name + "]");
        value.setValue(val);
    },
    getMenu: function () {
        return this.up("menu");
    },
    selectData: function () {
        var me = this;
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
        var entity = system.getEntity(me.entityCode);
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
        var entityObj = eval("new " + me.entityCode + "()");
        if (!Ext.isFunction(entityObj.showSelect)) {
            showAlert("系统提醒", "'" + me.entityCode + "' JS对象不存在函数showSelect(obj,callBack)！").then(function () {
                if (me.getMenu()) {
                    me.getMenu().holdShow = false;
                }
            });
            return;
        }
        var display = me.down("[name=" + me.name + "Display]");
        display.blur();
        entityObj.showSelect(this, "选择" + entity.shortName, me.linkValue.where).then(function (result) {
            if (result) {
                var data = result[0];
                me.setValue(data.get(me.entityText));
                me.setRawValue(data.get(me.entityId));
            }
            if (me.getMenu()) {
                me.getMenu().holdShow = false;
            }
        });
    },
    clearData: function () {
        var me = this;
        me.setValue(null);
        me.setRawValue(-1);
    },
    initComponent: function () {
        var me = this;
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
        var displayValue = me.linkValue[me.entityText];
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
 * 地图组件
 */
Ext.define("Fast.ext.Map", {
    alias: ['widget.map', 'widget.mapfield'],
    extend: 'Ext.form.FieldContainer',
    lngName: 'lnt',
    latName: 'lat',
    editable: true,
    allowBlank: true,
    layout: 'fit',
    submitValue: true,
    isValid: function () {
        var me = this;
        var value = me.down("[name=" + me.name + "]");
        return value.isValid();
    },
    getName: function () {
        return this.name;
    },
    getValue: function () {
        var me = this;
        var value = me.down("[name=" + me.name + "]");
        return value.getValue();
    },
    setValue: function (val, record) {
        var me = this;
        var value = me.down("[name=" + me.name + "]");
        value.setValue(val);
        if (record) {
            if (me.latName) {
                me.setLatValue(record.get(me.latName));
            }
            if (me.lngName) {
                me.setLngValue(record.get(me.lngName));
            }
        }
    },
    setRecordValue: function (record) {
        var me = this;
        if (record) {
            record.set(me.latName, me.getLatValue(), {silent: true});
            record.set(me.lngName, me.getLngValue(), {silent: true});
            record.set(me.name, me.getValue());
        }
    },
    setLatValue: function (val) {
        var me = this;
        var lat = me.down("[name=" + me.latName + "]");
        lat.setValue(val);
    },
    setLngValue: function (val) {
        var me = this;
        var lng = me.down("[name=" + me.lngName + "]");
        lng.setValue(val);
    },
    getLatValue: function () {
        var me = this;
        var lat = me.down("[name=" + me.latName + "]");
        return lat.getValue();
    },
    getLngValue: function () {
        var me = this;
        var lng = me.down("[name=" + me.lngName + "]");
        return lng.getValue();
    },
    getMenu: function () {
        return this.up("menu");
    },
    selectData: function () {
        var me = this;
        if (me.getMenu()) {
            me.getMenu().holdShow = true;
        }
        var value = me.down("[name=" + me.name + "]");
        value.blur();
        showMap(me, me.getLngValue(), me.getLatValue(), me.getValue()).then(function (result) {
            if (result) {
                me.setLatValue(result.lat);
                me.setLngValue(result.lng);
                me.setValue(result.addr);
            }
            if (me.getMenu()) {
                me.getMenu().holdShow = false;
            }
        });
    },
    clearData: function () {
        var me = this;
        me.setValue(null);
        me.setLatValue(0);
        me.setLngValue(0);
    },
    initComponent: function () {
        var me = this;
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















