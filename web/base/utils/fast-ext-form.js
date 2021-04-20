Ext.override(Ext.form.Basic, {
    submit: function(options) {
        options = options || {};
        let me = this,
            action;
        options.submitEmptyText = false;
        if (options.standardSubmit || me.standardSubmit) {
            action = 'standardsubmit';
        } else {
            action = me.api ? 'directsubmit' : 'submit';
        }

        return me.doAction(action, options);
    },
    isValid: function () {
        try {
            let me = this,
                invalid;
            Ext.suspendLayouts();
            let fieldName = "";
            let index = 0;
            let errorInfo = "请正确填写数据！";
            invalid = me.getFields().filterBy(function (field) {
                let v = !field.validate();
                if (v && index === 0) {
                    fieldName = field.getFieldLabel();
                    errorInfo = field.getErrors()[0];
                    index++;
                }
                return v;
            });
            Ext.resumeLayouts(true);
            let result = invalid.length < 1;
            if (!result) {
                if (Ext.isEmpty(fieldName)) {
                    toast("请将数据填写完整！");
                } else if (!Ext.isEmpty(errorInfo)) {
                    toast("【" + fieldName + "】错误：" + errorInfo);
                }else{
                    toast("【" + fieldName + "】错误！");
                }
                shakeComment(me.owner.ownerCt);
            }
            return result;
        } catch (e) {
            showException(e);
        }
    }
});

Ext.override(Ext.form.field.Date, {
    parseDate: function (value) {
        if (!value || Ext.isDate(value)) {
            return value;
        }
        //先猜测一下日期格式
        let guessFormat = guessDateFormat(value);
        if (guessFormat) {
            this.format = guessFormat;
        }
        let me = this,
            val = me.safeParse(value, me.format),
            altFormats = me.altFormats,
            altFormatsArray = me.altFormatsArray,
            i = 0,
            len;
        if (!val && altFormats) {
            altFormatsArray = altFormatsArray || altFormats.split('|');
            len = altFormatsArray.length;
            for (; i < len && !val; ++i) {
                val = me.safeParse(value, altFormatsArray[i]);
            }
        }
        return val;
    },
    initComponent: Ext.Function.createSequence(Ext.form.field.Date.prototype.initComponent, function () {
        if (isSystem()) {
            if (!this.format) {
                this.format = system.dateFormat;
            }
            if (this.format === 'y-m-d') {
                this.format = system.dateFormat;
            }

            //修改日期picker弹出方式
            this.pickerAlign = "tl-tr?";
        }
    })
});


Ext.override(Ext.form.field.Time, {
    initComponent: Ext.Function.createSequence(Ext.form.field.Time.prototype.initComponent, function () {
        this.invalidText = "无效的时间格式!";
    })
});



Ext.override(Ext.form.field.Text, {
    initComponent: Ext.Function.createSequence(Ext.form.field.Text.prototype.initComponent, function () {
        let me = this;
        if (me.inputType === 'password') {
            me.setTriggers({
                eayOpen: {
                    cls: 'extIcon extEye editColor',
                    hidden: true,
                    handler: function () {
                        if (me.up("menu")) {
                            me.up("menu").holdShow = true;
                        }
                        this.getTrigger('eayOpen').hide();
                        this.getTrigger('eayClose').show();
                        let inputObj = document.getElementById(this.getInputId());
                        inputObj.blur();
                        inputObj.setAttribute("type", "password");
                        setTimeout(function () {
                            inputFocusEnd(inputObj);
                            if (me.up("menu")) {
                                me.up("menu").holdShow = false;
                            }
                        }, 100);
                    }
                },
                eayClose: {
                    cls: 'extIcon extEye',
                    handler: function () {
                        if (me.up("menu")) {
                            me.up("menu").holdShow = true;
                        }
                        this.getTrigger('eayOpen').show();
                        this.getTrigger('eayClose').hide();
                        let inputObj = document.getElementById(this.getInputId());
                        inputObj.blur();
                        inputObj.setAttribute("type", "text");
                        setTimeout(function () {
                            inputFocusEnd(inputObj);
                            if (me.up("menu")) {
                                me.up("menu").holdShow = false;
                            }
                        }, 100);
                    }
                }
            });
        }
    })
});


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
    try {
        if (this.inputEl) {
            this.inputEl.blur();
        }
    } catch (e) {
        console.error(e);
    }
};


/**
 * 提交表单
 */
Ext.form.FormPanel.prototype.submitForm = function (entity, extraParams, waitMsg) {
    let me = this;
    if (!extraParams) {
        extraParams = {};
    }
    if (!waitMsg) {
        waitMsg = "正在提交中……"
    }
    if (me.submiting) {
        return new Ext.Promise(function (resolve, reject) {
            reject({"success": false, "message": "数据正在提交中，不可重复提交！"});
        });
    }
    return new Ext.Promise(function (resolve, reject) {
        let submitConfig = {
            submitEmptyText: false,
            waitMsg: waitMsg,
            params: extraParams,
            success: function (form, action) {
                me.submiting = false;
                Ext.Msg.alert('系统提醒', action.result.message, function (btn) {
                    if (btn === "ok") {
                        resolve(action.result);
                    }
                });
            },
            failure: function (form, action) {
                me.submiting = false;
                Ext.Msg.alert('系统提醒', action.result.message);
                reject(action.result);
            }
        };
        if (entity) {
            submitConfig.params["entityCode"] = entity.entityCode;
            if (entity.menu) {
                submitConfig.params["menu"] = getStoreMenuText({entity: entity});
            }
        }
        let form = me.getForm();
        if (form.isValid()) {
            me.submiting = true;
            form.submit(submitConfig);
        } else {
            me.submiting = false;
            reject({"success": false, "message": "表单填写不完整！"});
        }
    });
};

/**
 * 暂存
 */
Ext.form.FormPanel.prototype.saveCache = function (key) {
    if (Ext.isEmpty(key)) {
        key = this.cacheKey;
    }
    let data = {};
    this.getForm().getFields().each(function (field, index) {
        if (Ext.isDate(field.getValue())) {
            data[field.getName()] = Ext.Date.format(field.getValue(), field.format);
        } else {
            data[field.getName()] = field.getValue();
        }
    });
    let params = {
        "configKey": key,
        "configType": "FormPanelCache",
        "configValue": Ext.encode(data)
    };
    showWait("暂存数据中……");
    $.post("ext/config/saveExtConfig", params, function (result) {
        hideWait();
        if (result.success) {
            toast("暂存成功！");
        } else {
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
    let me = this;
    let params = {
        "configKey": key,
        "configType": "FormPanelCache"
    };
    $.post("ext/config/showExtConfig", params, function (result) {
        if (result.success) {
            let data = Ext.decode(result.data.configValue);
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
    let params = {
        "configKey": key,
        "configType": "FormPanelCache"
    };
    $.post("ext/config/deleteExtConfig", params, function (result) {
    });
};

/**
 * 是否是日期控件
 */
function isDateField(field) {
    if (!field) return false;
    return field === "datefield" || field.xtype === "datefield";
}

/**
 * 是否是数字控件
 */
function isNumberField(field) {
    if (!field) return false;
    return field === "numberfield" || field.xtype === "numberfield";
}

/**
 * 是否是文本控件
 */
function isTextField(field) {
    if (!field) return false;
    return field === "textfield" || field.xtype === "textfield";
}


/**
 * 是否是下拉框控件
 */
function isComboField(field) {
    if (!field) return false;
    return field === "combobox" || field.xtype === "combo";
}

/**
 * 是否是文件控件
 */
function isFileField(field) {
    if (!field) return false;
    return field === "fastfile" || field.xtype === "fastfile" || field === "fastfilefield" || field.xtype === "fastfilefield";
}

/**
 * 是否是文件控件
 */
function isFilesField(field) {
    if (!field) return false;
    return field === "fastfiles" || field.xtype === "fastfiles" || field === "fastfilesfield" || field.xtype === "fastfilesfield";
}


/**
 * 是否是枚举控件
 */
function isEnumField(field) {
    if (!field) return false;
    return field === "enumcombo" || field === "enumcombobox" || field.xtype === "enumcombo" || field.xtype === "enumcombobox";
}

/**
 * 是否是大文本编辑器
 */
function isContentField(field) {
    if (!field) return false;
    return field === "contentfield" || field === "content" || field.xtype === "contentfield" || field.xtype === "content";
}

/**
 * 是否是网页编辑器
 */
function isHtmlContentField(field) {
    if (!field) return false;
    return field === "htmlcontentfield" || field === "htmlcontent" || field.xtype === "htmlcontentfield" || field.xtype === "htmlcontent";
}


/**
 * 是否是网页编辑器
 */
function isLinkField(field) {
    if (!field) return false;
    return field === "linkfield" || field === "link" || field.xtype === "linkfield" || field.xtype === "link";
}


/**
 * 是否是目标编辑器
 */
function isTargetField(field) {
    if (!field) return false;
    return field === "targetfield" || field === "target" || field.xtype === "targetfield" || field.xtype === "target";
}

/**
 * 是否是省市区选择控件
 */
function isPCAField(field) {
    if (!field) return false;
    return field === "pcafield" || field === "pca" || field.xtype === "pcafield" || field.xtype === "pca";
}


/**
 * 是否是地图控件
 */
function isMapField(field) {
    if (!field) return false;
    return field === "mapfield" || field === "map" || field.xtype === "mapfield" || field.xtype === "map";
}

