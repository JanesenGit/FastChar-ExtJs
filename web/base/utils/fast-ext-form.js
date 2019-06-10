/**
 * 设置字段值，例如：formPanel.setFieldValue('name','FastChar');
 */
Ext.form.FormPanel.prototype.setFieldValue = function (fieldName, value) {
    this.getForm().findField(fieldName).setValue(value);
};

/**
 * 获取字段值，例如：formPanel.getFieldValue('name');
 */
Ext.form.FormPanel.prototype.getFieldValue = function (fieldName) {
    return this.getForm().findField(fieldName).getValue();
};

/**
 * 获取字段对象，例如：formPanel.getFieldValue('name');
 */
Ext.form.FormPanel.prototype.getField = function (fieldName) {
    return this.getForm().findField(fieldName);
};


/**
 * 失去焦点;
 */
Ext.form.field.Base.prototype.blur = function () {
    this.inputEl.blur();
};



/**
 * 提交表单
 */
Ext.form.FormPanel.prototype.submitForm = function (entity) {
    var me = this;
    return new Ext.Promise(function (resolve, reject) {
        var submitConfig = {
            submitEmptyText: false,
            waitMsg: '正在提交中……',
            params: {},
            success: function (form, action) {
                Ext.Msg.alert('系统提醒', action.result.message,
                    function (btn) {
                        if (btn == "ok") {
                            resolve(action.result);
                        }
                    });
            },
            failure: function (form, action) {
                Ext.Msg.alert('系统提醒', action.result.message);
                resolve(action.result);
            }
        };
        if (entity) {
            submitConfig.params["entityCode"] = entity.entityCode;
            if (entity.menu) {
                submitConfig.params["menu"] = entity.menu.text;
            }
        }
        var form = me.getForm();
        if (form.isValid()) {
            form.submit(submitConfig);
        }
    });
};

Ext.override(Ext.form.field.Date, {
    initComponent: Ext.Function.createSequence(Ext.form.field.Date.prototype.initComponent, function () {
        if (isSystem()) {
            this.format = system.dateFormat;
        }
    })
});


/**
 * 暂存
 */
Ext.form.FormPanel.prototype.saveCache = function (key) {
    if (Ext.isEmpty(key)) {
        key = this.cacheKey;
    }
    var data = {};
    this.getForm().getFields().each(function (field, index) {
        if (Ext.isDate(field.getValue())) {
            data[field.getName()] = Ext.Date.format(field.getValue(), field.format);
        }else{
            data[field.getName()] = field.getValue();
        }
    });
    var params = {
        "configKey": key,
        "configType": "FormPanelCache",
        "configValue": Ext.encode(data)
    };
    showWait("暂存数据中……");
    $.post("ext/config/saveExtConfig", params, function (result) {
        hideWait();
        if (result.success) {
            toast("暂存成功！");
        }else{
            showAlert("系统提醒", result.message);
        }
    });
};

/**
 * 还原暂存
 */
Ext.form.FormPanel.prototype.restoreCache = function (key) {
    if (Ext.isEmpty(key)) {
        key = this.cacheKey;
    }
    var me = this;
    var params = {
        "configKey": key,
        "configType": "FormPanelCache"
    };
    $.post("ext/config/showExtConfig", params, function (result) {
        if (result.success) {
            var data = Ext.decode(result.data.configValue);
            me.getForm().getFields().each(function (field, index) {
                if (data.hasOwnProperty(field.getName())) {
                    field.setValue(data[field.getName()]);
                }
            });
        }
    });
};

/**
 * 删除暂存
 */
Ext.form.FormPanel.prototype.deleteCache = function (key) {
    if (Ext.isEmpty(key)) {
        key = this.cacheKey;
    }
    var params = {
        "configKey": key,
        "configType": "FormPanelCache"
    };
    $.post("ext/config/deleteExtConfig", params, function (result) {
    });
};

Ext.override(Ext.form.Basic, {
    isValid: function () {
        try {
            var me = this,
                invalid;
            Ext.suspendLayouts();
            var fieldName = "";
            var index = 0;
            var errorInfo = "请正确填写数据！";
            invalid = me.getFields().filterBy(function (field) {
                var v = !field.validate();
                if (v && index == 0) {
                    fieldName = field.getFieldLabel();
                    errorInfo = field.getErrors()[0];
                    index++;
                }
                return v;
            });
            Ext.resumeLayouts(true);
            var result = invalid.length < 1;
            if (!result) {
                if (Ext.isEmpty(fieldName)) {
                    toast("请将数据填写完整！");
                } else {
                    toast("【" + fieldName + "】错误：" + errorInfo);
                }
                shakeComment(me.owner.ownerCt);
            }
            return result;
        } catch (e) {
            showException(e);
        }
    }
});



/**
 * 是否是日期控件
 */
function isDateField(field) {
    if (!field) return false;
    return field == "datefield" || field.xtype == "datefield";
}

/**
 * 是否是数字控件
 */
function isNumberField(field) {
    if (!field) return false;
    return field == "numberfield" || field.xtype == "numberfield";
}

/**
 * 是否是文本控件
 */
function isTextField(field) {
    if (!field) return false;
    return field == "textfield" || field.xtype == "textfield";
}


/**
 * 是否是文件控件
 */
function isFileField(field) {
    if (!field) return false;
    return field == "fastfile" || field.xtype == "fastfile"||field == "fastfilefield" || field.xtype == "fastfilefield";
}

/**
 * 是否是文件控件
 */
function isFilesField(field) {
    if (!field) return false;
    return field == "fastfiles" || field.xtype == "fastfiles"||field == "fastfilesfield" || field.xtype == "fastfilesfield";
}




/**
 * 是否是枚举控件
 */
function isEnumField(field) {
    if (!field) return false;
    return field == "enumcombo" || field == "enumcombobox" || field.xtype == "enumcombo" || field.xtype == "enumcombobox";
}

/**
 * 是否是大文本编辑器
 */
function isContentField(field) {
    if (!field) return false;
    return field == "contentfield" || field == "content" || field.xtype == "contentfield" || field.xtype == "content";
}

/**
 * 是否是网页编辑器
 */
function isHtmlContentField(field) {
    if (!field) return false;
    return field == "htmlcontentfield" || field == "htmlcontent" || field.xtype == "htmlcontentfield" || field.xtype == "htmlcontent";
}


/**
 * 是否是网页编辑器
 */
function isLinkField(field) {
    if (!field) return false;
    return field == "linkfield" || field == "link" || field.xtype == "linkfield" || field.xtype == "link";
}