// noinspection TypeScriptValidateJSTypes

namespace FastDefine {

    /**
     * 枚举下拉框组件
     */
    export abstract class EnumComboBox {
        protected constructor() {
            Ext.define("Fast.ext.EnumComboBox", {
                alias: ['widget.enumcombobox', 'widget.enumcombo'],
                extend: 'Ext.form.field.ComboBox',
                enumName: 'NONE',//枚举名称
                enumValue: 'id',
                enumText: 'text',
                exclude: [],//排除id
                include: [],//只包含id
                params: {},//扩展参数
                firstData: null,//插入到头部的数据
                lastData: null,//插入到尾部的数据
                editable: false,
                useCache: true,
                searchable: false,//搜索过滤选项
                newable: false,//允许输入新的选项
                onFastContainerShow: function () {
                    this.reloadEnum(false);
                },
                onFastInputClick: function () {
                    if (this.readOnly || this.disabled) {
                        return;
                    }
                    this.toggle();
                },
                onFastEnumFilter: function (record) {
                    if (this.exclude.exists(record.get(this.enumValue))) {
                        return false;
                    }
                    if (this.include.length > 0) {
                        return !!this.include.exists(record.get(this.enumValue));
                    }
                    return true;
                },
                reloadEnum: function (reloadData) {
                    let me = this;
                    if (Ext.isEmpty(reloadData)) {
                        reloadData = true;
                    }
                    if (me.hasListener("beforeloadenum")) {
                        if (!me.fireEvent("beforeloadenum", me)) {
                            return false;
                        }
                    }
                    FastExt.Store.getEnumDataStore(me.enumName, me.firstData, me.lastData, me.params, me.useCache, reloadData).then(function (enumStore) {
                        me.setStore(enumStore);
                        enumStore.filterBy(me.onFastEnumFilter, me);
                    });
                },
                initComponent: function () {
                    let me = this;
                    me.displayField = me.enumText;
                    me.valueField = me.enumValue;
                    me.emptyText = "请选择";

                    if (!me.exclude) {
                        me.exclude = [];
                    }
                    if (!me.include) {
                        me.include = [];
                    }

                    me.callParent(arguments);
                },
                finishRender: function () {
                    this.callParent(arguments);
                    this.inputEl.on('click', this.onFastInputClick, this);
                    let me = this;
                    let container = this.up("window");
                    if (container && !FastExt.Base.toBool(container.shown)) {
                        container.on("show", me.onFastContainerShow, this, {single: true});
                    } else {
                        me.reloadEnum(false);
                    }
                }
            });
        }
    }

    /**
     * 多选枚举
     */
    export abstract class TagEnumComboBox {
        protected constructor() {
            Ext.define("Fast.ext.TagEnumComboBox", {
                alias: ['widget.tagenumcombobox', 'widget.tagenumcombo'],
                extend: 'Ext.form.field.Tag',
                enumName: 'NONE',//枚举名称
                enumValue: 'id',
                enumText: 'text',
                exclude: [],//排除id
                include: [],//只包含id
                params: {},//扩展参数
                firstData: null,//插入到头部的数据
                lastData: null,//插入到尾部的数据
                queryMode: 'local',
                reloadEnum: function (reloadData) {
                    let me = this;
                    if (Ext.isEmpty(reloadData)) {
                        reloadData = true;
                    }
                    FastExt.Store.getEnumDataStore(me.enumName, me.firstData, me.lastData, me.params, me.useCache, reloadData).then(function (enumStore) {
                        me.setStore(enumStore);
                        me.getStore().filterBy(function (record) {
                            if (me.exclude.exists(record.get(me.enumValue))) {
                                return false;
                            }
                            if (me.include.length > 0) {
                                return !!me.include.exists(record.get(me.enumValue));

                            }
                            return true;
                        });
                    });
                },
                initComponent: function () {
                    let me = this;
                    me.displayField = me.enumText;
                    me.valueField = me.enumValue;
                    me.emptyText = "请选择";

                    if (!me.exclude) {
                        me.exclude = [];
                    }
                    if (!me.include) {
                        me.include = [];
                    }

                    me.callParent(arguments);
                },
                onFastContainerShow: function () {
                    this.reloadEnum(false);
                },
                finishRender: function () {
                    this.callParent(arguments);
                    let me = this;
                    let container = this.up("window");
                    if (container && !FastExt.Base.toBool(container.shown)) {
                        container.on("show", me.onFastContainerShow, this, {single: true});
                    } else {
                        me.reloadEnum(false);
                    }
                }
            });
        }
    }

    /**
     * 文件上传组件
     */
    export abstract class FastFileField {
        protected constructor() {
            Ext.define("Fast.ext.FastFile", {
                extend: 'Ext.form.field.Text',
                alias: ['widget.fastfile', 'widget.fastfilefield'],
                fileModules: [],
                editable: false,
                onFileChange: function (fileObj) {
                },
                onFastInputClick: function () {
                    if (this.readOnly || this.disabled) {
                        return;
                    }
                    this.selectData();
                },
                finishRender: function () {
                    this.callParent(arguments);
                    this.inputEl.on('click', this.onFastInputClick, this);
                },
                onChange: function (newVal, oldVal) {
                    this.callParent(arguments);

                    if (Ext.isEmpty(newVal)) {
                        this.getTrigger('open').hide();
                        this.getTrigger('close').hide();
                    } else {
                        this.getTrigger('open').show();
                        this.getTrigger('close').show();
                    }
                },
                initComponent: function () {
                    let me = this;
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
                    open: {
                        cls: 'extIcon extEye',
                        hidden: true,
                        handler: function () {
                            let me = this;
                            if (me.fileModules.length === 1) {
                                if (me.fileModules[0].type === 'images') {
                                    if (me.getEditorMenu()) {
                                        me.getEditorMenu().holdShow = true;
                                    }
                                    me.blur();
                                    FastExt.Dialog.showImage(me, me.getValue(), function () {
                                        if (me.getEditorMenu()) {
                                            me.getEditorMenu().holdShow = false;
                                        }
                                    }, true);
                                    return;
                                }

                                if (me.fileModules[0].type === 'videos') {
                                    FastExt.Dialog.showVideo(this, me.getValue());
                                    return;
                                }
                            }

                            if (me.fileObj) {
                                let name = me.fileObj.name;
                                if (FastExt.FileModule.image().match(name)) {
                                    FastExt.Dialog.showImage(me, me.getValue(), null, true);
                                    return;
                                }
                                if (FastExt.FileModule.mp4().match(name)) {
                                    FastExt.Dialog.showVideo(this, me.getValue());
                                    return;
                                }
                                if (FastExt.FileModule.pdf().match(name) ||
                                    FastExt.FileModule.word().match(name) ||
                                    FastExt.FileModule.excel().match(name) ||
                                    FastExt.FileModule.ppt().match(name)) {
                                    FastExt.File.officeViewer(me.getValue());
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
                    },
                    close: {
                        cls: 'text-clear',
                        hidden: true,
                        handler: function () {
                            this.clearData();
                        }
                    }
                },
                selectData: function () {
                    let me = this;
                    if (me.getEditorMenu()) {
                        me.getEditorMenu().holdShow = true;
                    }
                    FastExt.File.uploadFile(me, me.fileModules).then(function (result) {
                        if (me.getEditorMenu()) {
                            me.getEditorMenu().holdShow = false;
                        }
                        if (result) {
                            me.fileObj = result;
                            me.setValue(result.url);
                            me.onFileChange(result);
                        }
                    });
                },
                clearData: function () {
                    let me = this;
                    me.setValue(null);
                }
            });

        }
    }

    /**
     * 多个文件上传管理组件
     */
    export abstract class FastFilesField {
        constructor() {
            Ext.define("Fast.ext.FastFiles", {
                alias: ['widget.fastfiles', 'widget.fastfilesfield'],
                extend: 'Ext.form.field.Text',
                editable: false,
                fileModules: [],
                allowBlank: true,
                autoUpdate: false,
                showFileName: false,
                showFileLength: false,
                autoFileName: true,
                submitArray: false,//已数组格式提交
                triggers: {
                    search: {
                        cls: 'text-search',
                        handler: function () {
                            this.showWindow(this);
                        }
                    }
                },
                finishRender: function () {
                    this.callParent(arguments);
                    this.inputEl.on('click', this.onFastInputClick, this);
                },
                onFastInputClick: function () {
                    if (this.readOnly || this.disabled) {
                        return;
                    }
                    this.showWindow(this);
                },
                initComponent: function () {
                    let errorMsg = "";
                    for (let i = 0; i < this.fileModules.length; i++) {
                        let fileModule = this.fileModules[i];
                        errorMsg = errorMsg + "或" + fileModule.tipMsg;
                    }
                    this.emptyText = '请上传' + errorMsg.substring(1);
                    this.editable = false;
                    if (this.submitArray) {
                        let formPanel = this.up("form");
                        if (formPanel) {
                            formPanel.add({
                                xtype: "hiddenfield",
                                name: this.name + "@JsonArray",
                                value: true
                            });
                        }
                    }
                    this.callParent(arguments);
                },
                showWindow: function (obj, callBack, title) {
                    let me = this;
                    FastExt.File.showFiles(this, function (result) {
                        me.setValue(result);
                        if (Ext.isFunction(callBack)) {
                            callBack(me);
                        }
                    }, me.fileModules, me.getValue(), title, me.readOnly);
                }
            });

        }

    }

    /**
     * 大文本编辑框组件
     */
    export abstract class ContentField {
        constructor() {
            Ext.define("Fast.ext.Content", {
                alias: ['widget.content', 'widget.contentfield'],
                extend: 'Ext.form.field.TextArea',
                height: 220,
                emptyText: '请填写……',
                allowBlank: true,
                buttons: [],
                getCode: function () {
                    return $.md5(this.getName() + this.dataIndex + this.getFieldLabel());
                },
                showWindow: function (obj, callBack, title) {
                    if (Ext.isEmpty(title)) {
                        title = "编辑内容";
                    }
                    let me = Ext.create({
                        xtype: "contentfield",
                        value: this.value,
                    });
                    me.oldValue = me.getValue();
                    me.userCls = "radiusNullField";
                    let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
                    let winHeight = parseInt((document.body.clientHeight * 0.7).toFixed(0));
                    let winButtons = [
                        {
                            text: '清除暂存',
                            iconCls: 'extIcon extDelete whiteColor',
                            handler: function () {
                                FastExt.Dialog.showWait("正在清除中，请稍后……");
                                FastExt.Server.deleteExtConfig(me.getCode(), "TextEditorCache", function (success) {
                                    FastExt.Dialog.hideWait();
                                    if (success) {
                                        FastExt.Dialog.toast("清除成功！");
                                    }
                                });
                            }
                        },
                        '->',
                        {
                            text: '暂存',
                            iconCls: 'extIcon extSave whiteColor',
                            handler: function () {
                                FastExt.Dialog.showWait("暂存中，请稍后……");
                                FastExt.Server.saveExtConfig(me.getCode(), "TextEditorCache", me.getValue(), function (success, message) {
                                    FastExt.Dialog.hideWait();
                                    if (success) {
                                        FastExt.Dialog.toast("暂存成功！");
                                    } else {
                                        FastExt.Dialog.showAlert("系统提醒", message);
                                    }
                                });
                            }
                        },
                        {
                            text: '重置',
                            iconCls: 'extIcon extReset',
                            handler: function () {
                                me.setValue(me.oldValue);
                                FastExt.Server.deleteExtConfig(me.getCode(), "TextEditorCache");
                            }
                        },
                        {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                FastExt.Dialog.showWait("请稍后……");
                                FastExt.Server.deleteExtConfig(me.getCode(), "TextEditorCache", function (success) {
                                    FastExt.Dialog.hideWait();
                                    if (Ext.isFunction(callBack)) {
                                        callBack(me);
                                    }
                                    me.editorWin.close();
                                });
                            }
                        }
                    ];
                    for (let button of me.buttons) {
                        button.field = me;
                    }
                    me.editorWin = Ext.create('Ext.window.Window', {
                        title: title,
                        iconCls: 'extIcon extEdit',
                        resizable: true,
                        maximizable: true,
                        height: winHeight,
                        width: winWidth,
                        minHeight: 500,
                        minWidth: 600,
                        layout: 'fit',
                        animateTarget: obj,
                        items: [me],
                        modal: true,
                        unpin: true,
                        constrain: true,
                        listeners: {
                            show: function (obj) {
                                FastExt.Server.showExtConfig(me.getCode(), "TextEditorCache", function (success, value) {
                                    if (success) {
                                        me.setValue(value);
                                        FastExt.Dialog.toast("已恢复暂存的数据！");
                                    }
                                });
                            }
                        },
                        buttons: Ext.Array.insert(winButtons, 2, this.buttons),
                    });
                    me.editorWin.show();
                }
            });
        }

    }

    /**
     * 富文本网页编辑组件
     */
    export abstract class HtmlContentField {
        constructor() {
            Ext.define("Fast.ext.HtmlContent", {
                alias: ['widget.htmlcontent', 'widget.htmlcontentfield'],
                extend: 'Ext.form.field.TextArea',
                buttons: [],
                initEditorConfig: function (config) {
                    return config;
                },
                height: 420,
                getCode: function () {
                    return $.md5(this.getName() + this.dataIndex + this.getFieldLabel());
                },
                getValue: function () {
                    if (this.tinyEditor) {
                        this.tinyEditor.save();
                    }
                    return this.callParent(arguments);
                },
                getRawValue: function () {
                    if (this.tinyEditor) {
                        return this.tinyEditor.getContent();
                    }
                    return this.callParent(arguments);
                },
                setValue: function (val) {
                    this.callParent(arguments);
                    if (this.tinyEditor) {
                        this.tinyEditor.setContent(val);
                    }
                    return this;
                },
                beforeDestroy: function () {
                    try {
                        this.releaseEditor();
                    } finally {
                        this.callParent(arguments);
                    }
                },
                releaseEditor: function () {
                    if (this.tinyEditor) {
                        this.tinyEditor.destroy();
                        this.tinyEditor = null;
                    }
                },
                initEditor: function () {
                    let me = this;
                    let tinyConfig = {
                        selector: '#' + me.getInputId(),
                        language: 'zh-Hans',
                        menubar: 'file edit view insert format tools table tc',
                        toolbar1: 'fullscreen searchreplace undo redo ' +
                            ' bold italic underline strikethrough ' +
                            ' fontfamily fontsize blocks ' +
                            ' alignleft aligncenter alignright alignjustify ' +
                            ' outdent indent ' +
                            ' numlist bullist checklist ' +
                            ' forecolor backcolor casechange permanentpen formatpainter removeformat ' +
                            ' pagebreak charmap emoticons ' +
                            ' preview save print ' +
                            ' image media pageembed template link anchor codesample insertdatetime ' +
                            ' a11ycheck ltr rtl showcomments addcomment ',
                        toolbar_sticky: true,
                        forced_root_block: "div",
                        branding: false,
                        resize: false,
                        convert_urls: false,
                        height: "100%",
                        width: "100%",
                        autosave_ask_before_unload: false,
                        powerpaste_allow_local_images: true,
                        spellchecker_dialog: true,
                        a11y_advanced_options: true,
                        image_advtab: true,
                        font_size_formats: "8pt 9pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 17pt 18pt 19pt 20pt 21pt 22pt 23pt 24pt 36pt",
                        font_family_formats: "微软雅黑='微软雅黑';宋体='宋体';黑体='黑体';仿宋='仿宋';楷体='楷体';隶书='隶书';幼圆='幼圆';Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings",
                        pagebreak_separator: "<div style=\"page-break-before: always;\"></div>",
                        pagebreak_split_block: true,
                        file_picker_types: 'file image media',
                        automatic_uploads: false,
                        content_style: 'tr {  page-break-inside: avoid; }',
                        file_picker_callback: (callback, value, meta) => {
                            if (meta.filetype === 'file') {
                                FastExt.File.uploadFile(null, [FastExt.FileModule.file()], false, false).then(function (result) {
                                    if (result) {
                                        callback(result.url, {text: result.name});
                                    }
                                });
                            } else if (meta.filetype === 'image') {
                                FastExt.File.uploadFile(null, [FastExt.FileModule.image()], false, false).then(function (result) {
                                    if (result) {
                                        callback(result.url, {alt: result.name});
                                    }
                                });
                            } else if (meta.filetype === 'media') {
                                FastExt.File.uploadFile(null, [FastExt.FileModule.mp4()], false, false).then(function (result) {
                                    if (result) {
                                        callback(result.url, {text: result.name});
                                    }
                                });
                            }
                        },
                        plugins: ['advlist',
                            'anchor',
                            'autolink',
                            'charmap',
                            'emoticons',
                            'importcss',
                            'nonbreaking',
                            'pagebreak',
                            'visualchars',
                            'codesample', 'fullscreen',
                            'image', 'lists', 'link', 'media', 'preview',
                            'searchreplace', 'table',
                            'visualblocks', 'wordcount',
                            'insertdatetime',
                            'directionality',
                            'code'],
                    };
                    tinyConfig = me.initEditorConfig(tinyConfig);
                    FastExt.Tinymce.initTinymce(tinyConfig, function (editors) {
                        me.tinyEditor = editors[0];
                        let upWindow = me.up("window");
                        if (upWindow) {
                            //将tinymce的容器移到window对话框中
                            $(".tox-tinymce-aux").prependTo(upWindow.getEl().dom);
                        }

                        if (me.ownerCt) {
                            me.ownerCt.updateLayout();
                        }

                        if (me.needFocus) {
                            me.tinyEditor.focus(false);
                            me.needFocus = false;
                        }
                        me.fireEvent("editorrender", me, me.tinyEditor);

                    });
                },
                finishRender: function () {
                    this.callParent(arguments);
                    let container = this.up("window");
                    if (container && !FastExt.Base.toBool(container.shown)) {
                        container.on("show", this.onFastContainerShow, this, {single: true});
                    } else {
                        this.initEditor();
                    }
                },
                onFastContainerShow: function () {
                    this.initEditor();
                },
                initComponent: function () {
                    let me = this;
                    me.callParent(arguments);
                },
                showWindow: function (obj, callBack, title) {
                    if (Ext.isEmpty(title)) {
                        title = "编辑内容";
                    }

                    let me = Ext.create({
                        xtype: "htmlcontentfield",
                        value: this.value,
                    });
                    me.oldValue = me.value;

                    let winWidth = parseInt((document.body.clientWidth * 0.6).toFixed(0));
                    let winHeight = parseInt((document.body.clientHeight * 0.8).toFixed(0));
                    let winButtons = [
                        {
                            text: '清除暂存',
                            iconCls: 'extIcon extDelete whiteColor',
                            handler: function () {
                                FastExt.Dialog.showWait("正在清除中，请稍后……");
                                FastExt.Server.deleteExtConfig(me.getCode(), "HtmlEditorCache", function (success) {
                                    FastExt.Dialog.hideWait();
                                    if (success) {
                                        FastExt.Dialog.toast("清除成功！");
                                    }
                                });
                            }
                        },
                        '->',
                        {
                            text: '暂存',
                            iconCls: 'extIcon extSave whiteColor',
                            handler: function () {
                                FastExt.Dialog.showWait("暂存中，请稍后……");
                                FastExt.Server.saveExtConfig(me.getCode(), "HtmlEditorCache", me.getValue(), function (succes, message) {
                                    FastExt.Dialog.hideWait();
                                    if (succes) {
                                        FastExt.Dialog.toast("暂存成功！");
                                    } else {
                                        FastExt.Dialog.showAlert("系统提醒", message);
                                    }
                                });
                            }
                        },
                        {
                            text: '重置',
                            iconCls: 'extIcon extReset',
                            handler: function () {
                                me.setValue(me.oldValue);
                                FastExt.Server.deleteExtConfig(me.getCode(), "HtmlEditorCache");
                            }
                        },
                        {
                            text: '确定',
                            iconCls: 'extIcon extOk',
                            handler: function () {
                                FastExt.Dialog.showWait("请稍后……");
                                FastExt.Server.deleteExtConfig(me.getCode(), "HtmlEditorCache", function (success) {
                                    FastExt.Dialog.hideWait();
                                    if (Ext.isFunction(callBack)) {
                                        callBack(me);
                                    }
                                    me.editorWin.close();
                                });
                            }
                        }];
                    for (let button of me.buttons) {
                        button.field = me;
                    }
                    me.editorWin = Ext.create('Ext.window.Window', {
                        title: title,
                        iconCls: 'extIcon extEdit',
                        resizable: true,
                        maximizable: true,
                        height: winHeight,
                        width: winWidth,
                        minHeight: 500,
                        minWidth: 600,
                        layout: 'fit',
                        animateTarget: obj,
                        items: [me],
                        modal: true,
                        constrain: true,
                        unpin: true,
                        listeners: {
                            show: function () {
                                FastExt.Server.showExtConfig(me.getCode(), "HtmlEditorCache", function (success, value) {
                                    if (success) {
                                        me.setValue(value);
                                        FastExt.Dialog.toast("已恢复暂存的数据！");
                                    }
                                });
                            },
                        },
                        buttons: Ext.Array.insert(winButtons, 2, me.buttons),
                    });
                    me.editorWin.show();
                },
                focus: function () {
                    this.needFocus = true;
                    return this.callParent(arguments);
                },
            });
        }
    }

    /**
     * 表格关联组件
     */
    export abstract class LinkField {
        constructor() {
            Ext.define("Fast.ext.Link", {
                alias: ['widget.link', 'widget.linkfield'],
                extend: 'Ext.form.FieldContainer',
                entityId: null,
                entityIdDefaultValue: -1,
                entityText: null,
                entityCode: null,
                linkValue: {},
                editable: false,
                allowBlank: true,
                layout: 'fit',
                multiSelect: false,
                autoDisabled: true,
                submitValue: true,
                onBeforeSelect: null,
                onAfterSelect: null,
                onClearSelect: null,
                nullEntityCodeError: "请配置组件的entityCode属性值！",
                nullEntityIdError: "请配置组件的entityId属性值！",
                nullEntityTextError: "请配置组件的entityText属性值！",
                binds: [],// 格式：linkFieldName@selfFieldName1@selfFieldName2@selfFieldName2
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

                        if (me.record) {
                            for (let i = 0; i < me.binds.length; i++) {
                                let bindSet = me.binds[i];
                                let setArray = bindSet.toString().split("@");
                                if (setArray.length > 1) {
                                    let linkFieldName = setArray[0];
                                    let linkValue = me.record.get(linkFieldName);
                                    for (let j = 1; j < setArray.length; j++) {
                                        record.set(setArray[j], linkValue);
                                    }
                                }
                            }
                        }
                        if (record.store) {
                            record.store.holdUpdate = false;
                            record.store.fireEvent("endupdate");
                        }
                    }
                },
                setValue: function (val, record) {
                    let me = this;
                    let display = me.down("[name=" + me.name + "Display]");
                    if (display) {
                        display.setValue(val);
                    }
                    if (record) {
                        me.setRawValue(record.get(me.name));
                    }
                    if (!val) {//清空数据
                        me.setRawValue(-1);
                        let moreFieldContainer = me.down("[name=" + me.name + "MoreFields]");
                        moreFieldContainer.removeAll(true);
                    }
                    return me;
                },
                setHtml: function (val) {
                    this.setValue(val);
                },
                setMultiValue: function (idValues, textValues) {
                    this.setRawValue(idValues[0], idValues.slice(1));
                    this.setValue(textValues.join("#"));
                    if (this.autoDisabled) {
                        let display = this.down("[name=" + this.name + "Display]");
                        display.setDisabled(true);
                    }
                },
                getMultiValue: function () {
                    let me = this;
                    let values = [];
                    let value = me.down("[name=" + me.name + "]");
                    if (value) {
                        values.push(value.getValue());
                    }
                    let moreFieldContainer = me.down("[name=" + me.name + "MoreFields]");
                    moreFieldContainer.items.each(function (field) {
                        values.push(field.getValue());
                    });
                    return values;
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
                    if (me.record) {
                        for (let i = 0; i < me.binds.length; i++) {
                            let bindSet = me.binds[i];
                            let setArray = bindSet.toString().split("@");
                            if (setArray.length > 1) {
                                let linkFieldName = setArray[0];
                                let linkValue = me.record.get(linkFieldName);
                                for (let j = 1; j < setArray.length; j++) {
                                    let newField = Ext.create({
                                        xtype: 'hiddenfield',
                                        name: setArray[j]
                                    });
                                    newField.setValue(linkValue);
                                    moreFieldContainer.add(newField);
                                }
                            }
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
                getTriggers: function () {
                    let me = this;
                    let display = me.down("[name=" + me.name + "Display]");
                    return display.getTriggers();
                },
                selectData: function (callback) {
                    let me = this;
                    if (Ext.isFunction(me.onBeforeSelect)) {
                        if (!me.onBeforeSelect(me)) {
                            return;
                        }
                    }
                    if (me.getEditorMenu()) {
                        me.getEditorMenu().holdShow = true;
                    }
                    if (!me.entityCode) {
                        FastExt.Dialog.showAlert("系统提醒", me.nullEntityCodeError, function () {
                            if (me.getEditorMenu()) {
                                me.getEditorMenu().holdShow = false;
                            }
                        });
                        return;
                    }
                    if (!me.entityId) {
                        FastExt.Dialog.showAlert("系统提醒", me.nullEntityIdError, function () {
                            if (me.getEditorMenu()) {
                                me.getEditorMenu().holdShow = false;
                            }
                        });
                        return;
                    }
                    if (!me.entityText) {
                        FastExt.Dialog.showAlert("系统提醒", me.nullEntityTextError, function () {
                            if (me.getEditorMenu()) {
                                me.getEditorMenu().holdShow = false;
                            }
                        });
                        return;
                    }
                    let entity = FastExt.System.getEntity(me.entityCode);
                    if (!entity) {
                        FastExt.Dialog.showAlert("系统提醒", "未获取到 '" + me.entityCode + "' 实体类！", function () {
                            if (me.getEditorMenu()) {
                                me.getEditorMenu().holdShow = false;
                            }
                        });
                        return;
                    }
                    if (!entity.js) {
                        FastExt.Dialog.showAlert("系统提醒", "未获取到 '" + me.entityCode + "' JS对象！", function () {
                            if (me.getEditorMenu()) {
                                me.getEditorMenu().holdShow = false;
                            }
                        });
                        return;
                    }
                    let entityObj = eval("new " + me.entityCode + "()");
                    if (!Ext.isFunction(entityObj.showSelect)) {
                        FastExt.Dialog.showAlert("系统提醒", "'" + me.entityCode + "' JS对象不存在函数showSelect(obj,callBack)！", function () {
                            if (me.getEditorMenu()) {
                                me.getEditorMenu().holdShow = false;
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
                    if (me.config && me.config.fieldLabel) {
                        selectTitle = me.config.fieldLabel;
                    }
                    if (me.labelTitle) {
                        selectTitle = me.labelTitle;
                    }
                    if (Ext.isEmpty(me.selectGridTitle)) {
                        me.selectGridTitle = "选择" + selectTitle;
                    }

                    let doMultiSelect = me.multiSelect;

                    if (FastExt.Base.toBool(me.fromColumn)) {
                        doMultiSelect = false;
                    }

                    FastExt.Cache.memory["GridSelectHistory" + $.md5(me.selectGridTitle)] = me.records;

                    entityObj.showSelect(this, me.selectGridTitle, me.linkValue.where, doMultiSelect).then(function (result) {
                        try {
                            if (result) {
                                if (Ext.isFunction(callback)) {
                                    callback(result);
                                    return;
                                }
                                me.records = result;
                                if (result.length === 1) {
                                    let data = result[0];
                                    me.record = data;
                                    let textValue = data.get(me.entityText);
                                    let idValue = data.get(me.entityId);
                                    if (Ext.isEmpty(textValue)) {
                                        textValue = idValue;
                                    }
                                    me.setValue(textValue);
                                    me.setRawValue(idValue);
                                } else if (result.length > 1) {
                                    me.record = result[0];
                                    let newText = "";
                                    let moreValues = [];
                                    for (let i = 0; i < result.length; i++) {
                                        let textValue = result[i].get(me.entityText);
                                        let idValue = result[i].get(me.entityId);
                                        if (Ext.isEmpty(textValue)) {
                                            textValue = idValue;
                                        }
                                        newText += "#" + textValue;
                                        moreValues.push(idValue);
                                    }
                                    me.setRawValue(moreValues[0], moreValues.slice(1));
                                    me.setValue(newText.substring(1));
                                }

                                if (Ext.isFunction(me.onAfterSelect)) {
                                    me.onAfterSelect(me);
                                }
                            }
                        } finally {
                            if (me.getEditorMenu()) {
                                me.getEditorMenu().holdShow = false;
                            }
                        }
                    });
                },
                clearData: function () {
                    let me = this;
                    me.setValue(null);
                    me.setRawValue(-1);
                    let moreFieldContainer = me.down("[name=" + me.name + "MoreFields]");
                    moreFieldContainer.removeAll(true);
                    me.records = null;
                    me.record = null;
                    if (Ext.isFunction(me.onClearSelect)) {
                        me.onClearSelect(me);
                    }
                },
                onFastInputClick: function () {
                    if (this.readOnly || this.disabled || this.editable) {
                        //editable 可能是搜索列时使用
                        return;
                    }
                    this.selectData();
                },
                initComponent: function () {
                    let me = this;
                    if (FastExt.Listeners.onInitLinkFieldDefaultValue) {
                        let defaultLinkValue = FastExt.Listeners.onInitLinkFieldDefaultValue(me);
                        if (defaultLinkValue) {
                            if (me.linkValue) {
                                me.linkValue = FastExt.Json.mergeJson(me.linkValue, defaultLinkValue);
                            } else {
                                me.linkValue = defaultLinkValue;
                            }
                        }
                    }

                    if (!me.linkValue) {
                        me.linkValue = {};
                        me.linkValue[me.entityId] = me.entityIdDefaultValue;
                        me.linkValue[me.entityText] = null;
                    }

                    if (!me.linkValue.hasOwnProperty(me.entityId)) {
                        me.linkValue[me.entityId] = me.entityIdDefaultValue;
                    }

                    if (Ext.isEmpty(me.linkValue[me.entityId])) {
                        me.linkValue[me.entityId] = me.entityIdDefaultValue;
                    }

                    if (Ext.isEmpty(me.name)) {
                        me.name = "LinkField" + Ext.now();
                    }

                    let displayValue = me.linkValue[me.entityText];
                    if (Ext.isEmpty(displayValue)) {
                        displayValue = me.value;
                    }

                    if (displayValue === this.entityIdDefaultValue) {
                        displayValue = "";
                    }

                    let moreFieldItems = [];
                    for (let i = 0; i < me.binds.length; i++) {
                        let bindSet = me.binds[i];
                        let setArray = bindSet.toString().split("@");
                        if (setArray.length > 1) {
                            let linkFieldName = setArray[0];
                            let linkValue = me.linkValue[linkFieldName];
                            for (let j = 1; j < setArray.length; j++) {
                                moreFieldItems.push({
                                    xtype: 'hiddenfield',
                                    name: setArray[j],
                                    value: linkValue
                                });
                            }
                        }
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
                            hidden: true,
                            items: moreFieldItems
                        },
                        {
                            xtype: 'textfield',
                            name: me.name + "Display",
                            editable: me.editable,
                            parentXtype: me.xtype,
                            value: displayValue,
                            disabled: !Ext.isEmpty(displayValue) && me.autoDisabled && !FastExt.Base.toBool(me.fromHeadSearch, false),
                            hideLabel: true,
                            fieldLabel: me.fieldLabel,
                            allowBlank: me.allowBlank,
                            emptyText: me.selectGridTitle ? me.selectGridTitle : "请选择" + FastExt.Base.toString(me.config.fieldLabel, ""),
                            listeners: {
                                afterrender: function (obj) {
                                    obj.inputEl.on('click', me.onFastInputClick, me);
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

        }
    }

    /**
     * Target组件，适用于一个表格关联多个表格
     */
    export abstract class TargetField {
        constructor() {
            Ext.define("Fast.ext.Target", {
                alias: ['widget.target', 'widget.targetfield'],
                extend: 'Ext.form.FieldContainer',
                layout: "column",
                labelWidth: null,
                targetType: null,
                targetTypeReadOnly: false,
                targetTypeEnum: null,
                targetId: null,
                targetValue: {},
                targetFunction: 'getTargetEntity',
                targetEnumValue: 'id',
                targetEnumText: 'text',
                include: [],
                exclude: [],
                onChangeTypeSelect: null,
                linkfieldConfig: {},
                enumcomboConfig: {},
                defaults: {
                    labelWidth: 84,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    allowBlankTip: true,
                    allowBlank: false,
                    emptyText: 'default'
                },
                hideLabel: true,
                getValue: function () {
                    let me = this;
                    let targetIdCmp = me.down("[name=" + me.targetId + "]");
                    return targetIdCmp.getText();
                },
                setValue: function (val, record) {
                    let me = this;
                    let targetIdCmp = me.down("[name=" + me.targetId + "]");
                    if (targetIdCmp) {
                        targetIdCmp.setValue(val);
                    }
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
                    if (targetType < 0) {
                        return null;
                    }
                    if (Ext.isEmpty(targetType)) {
                        targetType = 0;
                    }
                    let me = this;
                    let targetEntity = window[<string>me.targetFunction](targetType, me.targetType);
                    if (!targetEntity) {
                        console.error("未获取到TargetType为：" + targetType + "的实体配置！");
                        return null;
                    }
                    return targetEntity;
                },
                showWindow: function (obj, callBack, title) {
                    if (Ext.isEmpty(title)) {
                        title = "编辑目标数据";
                    }
                    let me = Ext.create({
                        xtype: "targetfield",
                        targetType: this.targetType,
                        targetTypeReadOnly: this.targetTypeReadOnly,
                        targetTypeEnum: this.targetTypeEnum,
                        targetId: this.targetId,
                        targetValue: this.targetValue,
                        targetFunction: this.targetFunction,
                        targetEnumValue: this.targetEnumValue,
                        targetEnumText: this.targetEnumText,
                        include: this.include,
                        exclude: this.exclude,
                    });
                    me.editorWin = Ext.create('Ext.window.Window', {
                        title: title,
                        height: 200,
                        width: 400,
                        layout: 'fit',
                        resizable: false,
                        modal: true,
                        constrain: true,
                        iconCls: 'extIcon extLink',
                        items: [me],
                        animateTarget: obj,
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
                                    if (Ext.isFunction(callBack)) {
                                        callBack(me);
                                    }
                                }
                            }]
                    });
                    me.editorWin.show();
                },
                initComponent: function () {
                    let me = this;
                    let configLabel = me.fieldLabel;
                    if (Ext.isEmpty(configLabel)) {
                        configLabel = "目标类型";
                    }

                    me.fieldLabel = "";
                    me.margin = '0 0 0 0';

                    let linkValue = {};
                    if (!Ext.isFunction(window[me.targetFunction])) {
                        FastExt.Dialog.showAlert("目标组件错误", "未检测到方法" + me.targetFunction + "!");
                        me.callParent(arguments);
                        return;
                    }
                    if (!me.targetValue) {
                        me.targetValue = {};
                        me.targetValue[me.targetType] = -1;
                    }

                    if (!me.targetValue[me.targetType]) {
                        me.targetValue[me.targetType] = -1;
                    }

                    if (me.targetEnum) {
                        me.targetTypeEnum = me.targetEnum;
                    }
                    if (!me.targetTypeEnum) {
                        me.targetTypeEnum = me.targetType.replace(me.targetType[0], me.targetType[0].toUpperCase()) + "Enum";
                    }

                    let targetTypeValue = me.targetValue[me.targetType];
                    let targetEntity = me.getTargetEntity(targetTypeValue);

                    let targetTypeDisplay = "";

                    if (targetEntity) {
                        targetTypeDisplay = targetEntity["entityComment"];
                        linkValue[targetEntity.entityId] = me.targetValue[me.targetId];
                        linkValue[targetEntity.entityText] = me.targetValue["targetText"];
                    }
                    if (Ext.isEmpty(targetTypeDisplay)) {
                        targetTypeDisplay = "";
                    }

                    let targetTypeCmp = {
                        name: me.targetType,
                        xtype: "enumcombo",
                        fieldLabel: configLabel,
                        columnWidth: 1,
                        value: targetTypeValue >= 0 ? targetTypeValue : null,
                        emptyText: '请选择' + configLabel,
                        enumValue: me.targetEnumValue,
                        enumText: me.targetEnumText,
                        readOnly: me.targetTypeReadOnly,
                        enumName: me.targetTypeEnum,
                        exclude: me.exclude,
                        include: me.include,
                        parentXtype: me.xtype,
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
                                    let targetIdDisplay = me.down("[name=" + me.targetId + "Display]");
                                    if (targetIdDisplay) {
                                        targetIdDisplay.setEmptyText("请选择" + obj.getDisplayValue());
                                    }
                                    targetIdCmp.selectGridTitle = "请选择" + obj.getDisplayValue();
                                    targetIdCmp.clearData();
                                }

                                if (Ext.isFunction(me.onChangeTypeSelect)) {
                                    me.onChangeTypeSelect(me);
                                }
                                if (me.hasListener("change")) {
                                    me.fireEvent("change");
                                }
                            }
                        }
                    };

                    let configLabel2 = me.fieldLabel2;
                    if (Ext.isEmpty(configLabel2)) {
                        configLabel2 = "目标数据";
                    }

                    let targetIdCmp = {
                        name: me.targetId,
                        xtype: "linkfield",
                        fieldLabel: configLabel2,
                        columnWidth: 1,
                        nullEntityCodeError: '请先选择' + configLabel,
                        entityCode: targetEntity ? targetEntity.entityCode : null,
                        entityId: targetEntity ? targetEntity.entityId : null,
                        entityText: targetEntity ? targetEntity.entityText : null,
                        linkValue: linkValue,
                        selectGridTitle: "请选择" + targetTypeDisplay,
                        multiSelect: me.multiSelect,
                    };

                    me.items = [FastExt.Json.mergeJson(targetTypeCmp, me.enumcomboConfig), FastExt.Json.mergeJson(targetIdCmp, me.linkfieldConfig)];
                    me.callParent(arguments);
                }
            });

        }
    }

    /**
     * 地图位置组件
     */
    export abstract class MapField {
        protected constructor() {
            Ext.define("Fast.ext.Map", {
                alias: ['widget.map', 'widget.mapfield'],
                extend: 'Ext.form.FieldContainer',
                lngName: 'lnt',
                latName: 'lat',
                proName: null,
                cityName: null,
                areaName: null,
                editable: false,
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
                    if (value) {
                        value.setValue(val);
                    }
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

                selectData: function () {
                    let me = this;
                    if (me.getEditorMenu()) {
                        me.getEditorMenu().holdShow = true;
                    }
                    let value = me.down("[name=" + me.name + "]");
                    value.blur();
                    FastExt.Map.selAddressInMap(me, me.getLngValue(), me.getLatValue(), me.getValue()).then(function (result) {
                        if (result) {
                            me.setLatValue(result.lat);
                            me.setLngValue(result.lng);
                            me.setProValue(result.pro);
                            me.setAreaValue(result.area);
                            me.setCityValue(result.city);
                            me.setValue(result.addr);
                        }
                        if (me.getEditorMenu()) {
                            me.getEditorMenu().holdShow = false;
                        }
                    });
                },
                clearData: function () {
                    let me = this;
                    me.setValue(null);
                    me.setLatValue(0);
                    me.setLngValue(0);
                },
                onFastInputClick: function () {
                    if (this.readOnly || this.disabled || this.editable) {
                        //editable 可能是搜索列时使用
                        return;
                    }
                    this.selectData();
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
                            parentXtype: me.xtype,
                            listeners: {
                                afterrender: function (obj) {
                                    obj.inputEl.on('click', me.onFastInputClick, me);
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

        }
    }

    /**
     * 时间区间组件
     */
    export abstract class DateRangeField {
        constructor() {
            Ext.define("Fast.ext.DateRange", {
                alias: ['widget.daterange', 'widget.daterangefield'],
                extend: 'Ext.form.field.Text',
                beginDate: null,
                endDate: null,
                editable: true,
                allowBlank: true,
                maxRangeDate: -1,//最大日期范围
                maxRangeMonth: -1,//最大月份范围
                maxRangeYear: -1,//最大年份范围
                layout: 'column',
                format: 'Y-m-d',
                submitValue: true,
                onAfterSelect: null,
                onClearValue: null,

                selectData: function () {
                    let me = this;
                    if (me.getEditorMenu()) {
                        me.getEditorMenu().holdShow = true;
                    }

                    let time = Ext.now();
                    let dateRangeMenu = Ext.create('Ext.menu.Menu', {
                        floating: true,
                        editorMenu: true,
                        items: [{
                            xtype: 'container',
                            padding: '10 10 10 10',
                            layout: 'column',
                            style: {
                                background: "#ffffff",
                                borderWidth: 1,
                                borderColor: "#ffffff",
                                color: '#eeeee'
                            },
                            border: 0,
                            items: [
                                {
                                    xtype: 'combo',
                                    fieldLabel: '快速选择',
                                    valueField: 'value',
                                    labelWidth: 60,
                                    margin: '5 5 5 5',
                                    editable: false,
                                    columnWidth: 1,
                                    triggers: {
                                        close: {
                                            cls: 'text-clear',
                                            handler: function () {
                                                this.setValue(null);
                                                me.clearData();
                                            }
                                        }
                                    },
                                    listeners: {
                                        change: function (obj, newValue, oldValue, eOpts) {
                                            if (!newValue) {
                                                return;
                                            }
                                            me.endDate = Ext.Date.format(new Date(), me.format);
                                            if (newValue === 6) {
                                                me.beginDate = Ext.Date.format(new Date(), me.format);
                                            } else if (newValue === 1) {
                                                me.beginDate = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.DAY, -7), me.format);
                                            } else if (newValue === 2) {
                                                me.beginDate = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MONTH, -1), me.format);
                                            } else if (newValue === 3) {
                                                me.beginDate = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MONTH, -3), me.format);
                                            } else if (newValue === 4) {
                                                me.beginDate = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MONTH, -6), me.format);
                                            } else if (newValue === 5) {
                                                me.beginDate = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.YEAR, -1), me.format);
                                            }
                                            let error = me.refreshValue();
                                            if (error) {
                                                FastExt.Dialog.toast(error);
                                                obj.setValue(null);
                                                me.clearData();
                                                FastExt.Component.shakeComment(dateRangeMenu);
                                                return;
                                            }
                                            let beginDateTimeField = Ext.getCmp("beginDate" + time);
                                            if (beginDateTimeField) {
                                                beginDateTimeField.setValue(me.beginDate);
                                            }
                                            let endDateTimeField = Ext.getCmp("endDate" + time);
                                            if (endDateTimeField) {
                                                endDateTimeField.setValue(me.endDate);
                                            }
                                        }
                                    },
                                    store: Ext.create('Ext.data.Store', {
                                        data: [
                                            {
                                                'text': '今天',
                                                'value': 6
                                            },
                                            {
                                                'text': '近一周',
                                                'value': 1
                                            },
                                            {
                                                'text': '近一个月',
                                                "value": 2
                                            },
                                            {
                                                'text': '近三个月',
                                                "value": 3
                                            },
                                            {
                                                'text': '近六个月',
                                                "value": 4
                                            },
                                            {
                                                'text': '近一年',
                                                "value": 5
                                            }]
                                    })
                                },
                                {
                                    fieldLabel: '开始日期',
                                    margin: '5 5 5 5',
                                    xtype: 'datefield',
                                    id: 'beginDate' + time,
                                    columnWidth: 1,
                                    labelWidth: 60,
                                    format: me.format,
                                    value: me.beginDate,
                                    emptyText: '开始日期'
                                }, {
                                    fieldLabel: '结束日期',
                                    margin: '5 5 5 5',
                                    xtype: 'datefield',
                                    id: 'endDate' + time,
                                    columnWidth: 1,
                                    labelWidth: 60,
                                    format: me.format,
                                    value: me.endDate,
                                    emptyText: '结束日期'
                                }, {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    columnWidth: 1,
                                    border: 0,
                                    items: [
                                        {
                                            xtype: 'button',
                                            text: '确定',
                                            margin: '5 5 5 5',
                                            flex: 0.42,
                                            handler: function () {
                                                let bDate = Ext.getCmp("beginDate" + time).getValue();
                                                let eDate = Ext.getCmp("endDate" + time).getValue();
                                                me.beginDate = Ext.util.Format.date(bDate, me.format);
                                                me.endDate = Ext.util.Format.date(eDate, me.format);
                                                if (Ext.isEmpty(me.beginDate)) {
                                                    me.beginDate = Ext.Date.format(new Date(0), me.format);
                                                }

                                                if (Ext.isEmpty(me.endDate)) {
                                                    me.endDate = Ext.Date.format(new Date(), me.format);
                                                }
                                                let error = me.refreshValue();
                                                if (error) {
                                                    FastExt.Dialog.toast(error);
                                                    FastExt.Component.shakeComment(dateRangeMenu);
                                                    return;
                                                }

                                                if (Ext.isFunction(me.onAfterSelect)) {
                                                    me.onAfterSelect(me);
                                                }
                                                dateRangeMenu.close();
                                            }
                                        }
                                    ]
                                }]
                        }],
                        listeners: {
                            hide: function (obj, epts) {
                                obj.close();
                            }
                        }
                    });
                    dateRangeMenu.setWidth(Math.max(this.getWidth(), 200));
                    dateRangeMenu.showBy(this, "tl-bl?");
                },
                clearData: function () {
                    let me = this;
                    me.setValue(null);
                    me.beginDate = null;
                    me.endDate = null;
                },
                refreshValue: function () {
                    let me = this;
                    me.setValue(null);

                    let bDate = Ext.Date.parse(me.beginDate, me.format);
                    let eDate = Ext.Date.parse(me.endDate, me.format);

                    if (bDate > eDate) {
                        me.clearData();
                        return "开始日期必须小于等于结束日期！";
                    }

                    if (me.maxRangeDate > 0) {
                        let maxEndDate = Ext.Date.add(bDate, Ext.Date.DAY, me.maxRangeDate);
                        if (!Ext.Date.between(eDate, bDate, maxEndDate)) {
                            me.clearData();
                            return "日期范围区间必须在" + me.maxRangeDate + "天以内！";
                        }
                    }

                    if (me.maxRangeMonth > 0) {
                        let maxEndDate = Ext.Date.add(bDate, Ext.Date.MONTH, me.maxRangeMonth);
                        if (!Ext.Date.between(eDate, bDate, maxEndDate)) {
                            me.clearData();
                            return "日期范围区间必须在" + me.maxRangeMonth + "个月以内！";
                        }
                    }

                    if (me.maxRangeYear > 0) {
                        let maxEndDate = Ext.Date.add(bDate, Ext.Date.YEAR, me.maxRangeYear);
                        if (!Ext.Date.between(eDate, bDate, maxEndDate)) {
                            me.clearData();
                            return "日期范围区间必须在" + me.maxRangeYear + "年以内！";
                        }
                    }

                    me.setValue(me.beginDate + " 至 " + me.endDate);
                    if (Ext.Date.isEqual(bDate, eDate)) {
                        me.setValue("今天");
                    }
                    return null;
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
                initComponent: function () {
                    this.editable = false;
                    this.refreshValue();
                    this.callParent(arguments);
                }
            });

        }

    }

    /**
     * 日期时间选择组件
     */
    export abstract class DateField {
        constructor() {
            Ext.define("Fast.ext.Date", {
                alias: ['widget.date', 'widget.datefield'],
                extend: 'Ext.form.field.Text',
                format: 'Y-m-d H:i:s',
                strict: true,//日期格式严格处理，当格式为：Y-m 时 最自动追加Y-m-d
                isValid: function () {
                    let me = this;
                    if (me.callParent(arguments)) {
                        if (!Ext.isEmpty(me.getValue()) && !FastExt.Base.toBool(me.fromHeadSearch, false)) {
                            let date = Ext.Date.parse(me.getValue(true), this.format);
                            if (!date) {
                                me.invalidText = "日期格式错误！格式必须为：" + this.format;
                                me.markInvalid(this.invalidText);
                                return false;
                            }
                        }
                        return true;
                    }
                    return false;
                },
                setValue: function (dateValue) {
                    let me = this;
                    if (me.strict) {
                        if (!Ext.isEmpty(dateValue)) {
                            let guessDateFormat = FastExt.Base.guessDateFormat(dateValue);
                            let date = Ext.Date.parse(dateValue, guessDateFormat);
                            if (date) {
                                arguments[0] = Ext.Date.format(date, me.format);
                            }
                        }
                    }
                    return me.callParent(arguments);
                },
                getValue: function (fromValid) {
                    let me = this;
                    let rawValue = me.callParent(arguments);
                    if (me.strict) {
                        if (!FastExt.Base.toBool(fromValid, false)) {
                            let guessDateFormat = FastExt.Base.guessDateFormat(rawValue);
                            if (guessDateFormat === "Y-m") {
                                return rawValue + "-01";
                            } else if (guessDateFormat === "Y/m") {
                                return rawValue + "/01";
                            } else if (guessDateFormat === "Y") {
                                return rawValue + "-01-01";
                            }
                        }
                    }
                    return rawValue;
                },
                selectData: function () {
                    let me = this;
                    if (me.getEditorMenu() != null) {
                        me.getEditorMenu().holdShow = true;
                    }
                    me.pickerShown = true;
                    FastExt.Dialog.showFastDatePicker(me.bodyEl, me.getValue(), this.format).then(function (dateValue) {
                        if (me.getEditorMenu() != null) {
                            me.getEditorMenu().holdShow = false;
                        }
                        me.resetPickerShowTask.delay(100);

                        if (dateValue) {
                            me.setValue(dateValue);
                        }
                    });
                },
                toggleSelectData: function () {
                    if (this.pickerShown) {
                        this.pickerShown = false;
                        return;
                    }
                    this.selectData();
                },
                endEdit: function () {
                    this.firstValue = null;
                },
                onFastInputClick: function () {
                    if (this.readOnly || this.disabled) {
                        return;
                    }
                    if (this.strict) {
                        this.toggleSelectData();
                    }
                },
                triggers: {
                    search: {
                        cls: 'extIcon extDatePicker',
                        handler: function () {
                            this.toggleSelectData();
                        }
                    }
                },
                finishRender: function () {
                    this.callParent(arguments);
                    this.inputEl.on('click', this.onFastInputClick, this);
                },
                initComponent: function () {
                    let me = this;
                    me.resetPickerShowTask = new Ext.util.DelayedTask(function () {
                        this.pickerShown = false;
                    }, me);
                    me.callParent(arguments);
                }
            });
        }

    }

    /**
     * 颜色选择组件
     */
    export abstract class ColorField {
        constructor() {
            Ext.define("Fast.ext.ColorField", {
                extend: 'Ext.form.field.Text',
                alias: ['widget.colorfield'],
                editable: false,
                beforeBodyEl: [
                    '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch" style="z-index: 9;">' +
                    '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix +
                    'colorpicker-field-swatch-inner"></div>' +
                    '</div>'
                ],
                cls: Ext.baseCSSPrefix + 'colorpicker-field',
                childEls: [
                    'swatchEl'
                ],
                setValue: function (val) {
                    let me = this;
                    if (me.swatchEl) {
                        me.swatchEl.setStyle('background', val);
                    }
                    me.callParent(arguments);
                    return me;
                },
                triggers: {
                    search: {
                        cls: 'extIcon extSearch',
                        handler: function () {
                            this.toggleSelectData();
                        }
                    }
                },
                onFastInputClick: function () {
                    if (this.readOnly || this.disabled) {
                        return;
                    }
                    this.toggleSelectData();
                },
                selectData: function () {
                    let me = this;
                    if (me.getEditorMenu() != null) {
                        me.getEditorMenu().holdShow = true;
                    }

                    me.pickerShown = true;

                    FastExt.Dialog.showFastColorPicker(me.inputEl, me.getValue(), function (color) {
                        me.setValue(color.toRGBA().toString(0));
                    }).then(function (dateValue) {
                        if (me.getEditorMenu() != null) {
                            me.getEditorMenu().holdShow = false;
                        }
                        me.resetPickerShowTask.delay(100);
                    });
                },
                clearData: function () {
                    let me = this;
                    me.setValue(null);
                },
                toggleSelectData: function () {
                    if (this.pickerShown) {
                        this.pickerShown = false;
                        return;
                    }
                    this.selectData();
                },
                initComponent: function () {
                    let me = this;
                    me.resetPickerShowTask = new Ext.util.DelayedTask(function () {
                        this.pickerShown = false;
                    }, me);
                    me.callParent(arguments);
                },
                finishRender: function () {
                    this.callParent(arguments);
                    this.inputEl.on('click', this.onFastInputClick, this);

                    let toColor = FastExt.Color.toColor(this.getValue(), "#00000000");
                    this.setValue(toColor);
                }
            });
        }
    }

    /**
     * 渲染显示iconfont的组件
     */
    export abstract class SVGIcon {
        constructor() {
            Ext.define("Fast.ext.SVGIcon", {
                extend: 'Ext.Component',
                alias: ['widget.svgicon'],
                iconId: "",
                iconCls: "",
                initComponent: function () {
                    let me = this;
                    me.callParent(arguments);
                },
                finishRender: function () {
                    this.callParent(arguments);
                    this.update("<svg class=\"svgIconFill " + this.iconCls + "\" aria-hidden=\"true\"><use xlink:href=\"" + this.iconId + "\"></use></svg>");
                }
            });
        }
    }

    /**
     * 渲染显示iconfont的组件
     */
    export abstract class Lottie {
        constructor() {
            Ext.define("Fast.ext.Lottie", {
                extend: 'Ext.Component',
                alias: ['widget.lottie'],
                jsonPath: '',
                initComponent: function () {
                    let me = this;
                    me.callParent(arguments);
                },
                destroy: function () {
                    FastExt.Lottie.unloadJsonAnim(this);
                    this.callParent(arguments);
                },
                finishRender: function () {
                    this.callParent(arguments);

                    let container = this.up("window");
                    if (container && !FastExt.Base.toBool(container.shown)) {
                        container.on("show", this.onFastContainerShow, this, {single: true});
                    } else {
                        this.loadJson();
                    }
                },
                onFastContainerShow: function () {
                    this.loadJson();
                },
                loadJson: function () {
                    FastExt.Lottie.loadJsonAnim(this, this.jsonPath);
                }
            });
        }
    }

    /**
     * 代码编辑器
     */
    export abstract class MonacoField {
        protected constructor() {
            Ext.define("Fast.ext.FastMonaco", {
                extend: 'Ext.form.field.TextArea',
                alias: ['widget.fastmonaco', 'widget.fastmonacofield'],
                editable: false,
                language: "plaintext",
                finishRender: function () {
                    this.callParent(arguments);
                    this.inputEl.on('click', this.onFastInputClick, this);
                },
                onFastInputClick: function () {
                    if (this.readOnly || this.disabled) {
                        return;
                    }
                    this.showMonacoEditor();
                },
                initComponent: function () {
                    this.editable = false;
                    this.callParent(arguments);
                },
                showMonacoEditor: function () {
                    let me = this;
                    if (me.getEditorMenu()) {
                        me.getEditorMenu().holdShow = true;
                    }
                    FastExt.MonacoEditor.showEditor(this, me.getValue(), me.language).then(function (result) {
                        if (result) {
                            me.setValue(result);
                        }
                        if (me.getEditorMenu()) {
                            me.getEditorMenu().holdShow = false;
                        }
                    });
                },
                clearData: function () {
                    let me = this;
                    me.setValue(null);
                },
                showWindow: function (obj, callBack, title) {
                    let me = this;
                    if (me.getEditorMenu()) {
                        me.getEditorMenu().holdShow = true;
                    }
                    FastExt.MonacoEditor.showEditor(obj, me.getValue(), me.language).then(function (result) {
                        if (result) {
                            if (Ext.isFunction(callBack)) {
                                callBack(me);
                            }
                        }
                        if (me.getEditorMenu()) {
                            me.getEditorMenu().holdShow = false;
                        }
                    });
                }
            });

        }
    }

    for (let subClass in FastDefine) {
        FastDefine[subClass]();
    }

}
