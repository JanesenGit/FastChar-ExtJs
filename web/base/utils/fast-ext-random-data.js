/**
 * 批量随机值
 * @param column
 */
function batchEditColumnRandom(column) {
    //检查是否有自定义随机生成数据的插件方法
    if (Ext.isFunction(window["showRandomData"])) {
        window["showRandomData"](column);
        return;
    }
    let idCode = "Random" + Ext.now();
    let autoType = 1;
    let selectReadOnly = false;
    let defaultValue;
    let dateFormat = 'Y-m-d H:i:s';
    let dataLength = getColumnGrid(column).getStore().getTotalCount();
    let title = "批量随机生成当前页的【" + column.text + "】列数据";
    if (getColumnGrid(column).getSelection().length > 0) {
        title = "批量随机生成选择的" + getColumnGrid(column).getSelection().length + "条【" + column.text + "】列数据";
        dataLength = getColumnGrid(column).getSelection().length;
    }
    if (isNumberColumn(column)) {
        autoType = 2;
        selectReadOnly = true;
    } else if (isDateColumn(column)) {
        autoType = 3;
        if (Ext.isObject(column.field)) {
            dateFormat = column.field.format;
        }
        selectReadOnly = true;
    } else if (isEnumColumn(column) || isComboColumn(column)) {
        autoType = 5;
        selectReadOnly = true;
        let intArray = [];
        let fieldObj = Ext.create(column.field);
        fieldObj.getStore().each(function (record, index) {
            intArray.push(record.get(fieldObj.valueField));
        });
        defaultValue = intArray.join(",");
    } else if (isContentColumn(column)) {
        autoType = 4;
    }

    let textField = {
        xtype: 'fieldcontainer',
        layout: 'column',
        columnWidth: 1,
        id: idCode + "_1",
        defaults: {
            labelWidth: 60,
            margin: '5 5 5 5',
            labelAlign: 'right',
            columnWidth: 1,
            emptyText: '请填写'
        },
        random: function () {
            let valueArray = [];
            let textPrefix = Ext.getCmp(idCode + "_textPrefix").getValue();
            let textStartNumber = Ext.getCmp(idCode + "_textStartNumber").getValue();
            for (let i = parseInt(textStartNumber); i < Number.MAX_VALUE; i++) {
                valueArray.push(textPrefix + i);
                if (valueArray.length === dataLength) {
                    break;
                }
            }
            return valueArray;
        },
        items: [
            {
                xtype: 'fieldset',
                columnWidth: 1,
                layout: 'column',
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                title: '文字设置',
                items: [
                    {
                        fieldLabel: '文字前缀',
                        id: idCode + '_textPrefix',
                        allowBlank: false,
                        xtype: 'textfield',
                    },
                    {
                        fieldLabel: '开始序数',
                        id: idCode + '_textStartNumber',
                        value: 1,
                        allowBlank: false,
                        xtype: 'numberfield',
                    }
                ]
            }
        ]
    };
    let numberField = {
        xtype: 'fieldcontainer',
        layout: 'column',
        columnWidth: 1,
        id: idCode + "_2",
        hidden: true,
        disabled: true,
        defaults: {
            labelWidth: 60,
            margin: '5 5 5 5',
            labelAlign: 'right',
            columnWidth: 1,
            emptyText: '请填写'
        },
        random: function () {
            let valueArray = [];
            let dotNumber = Ext.getCmp(idCode + "_dotNumber").getValue();
            let minNumber = Ext.getCmp(idCode + "_minNumber").getValue();
            let maxNumber = Ext.getCmp(idCode + "_maxNumber").getValue();
            if (minNumber > maxNumber) {
                showAlert("系统提醒", "最大数字必须大于最小数字！");
                return;
            }
            for (let i = 0; i < Number.MAX_VALUE; i++) {
                let numberValue = Math.random() * (maxNumber - minNumber) + minNumber;
                valueArray.push(numberValue.toFixed(dotNumber));
                if (valueArray.length === dataLength) {
                    break;
                }
            }
            return valueArray;
        },
        items: [
            {
                xtype: 'fieldset',
                columnWidth: 1,
                layout: 'column',
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                title: '数字设置',
                items: [
                    {
                        fieldLabel: '保留位数',
                        id: idCode + '_dotNumber',
                        value: 0,
                        allowBlank: false,
                        xtype: 'numberfield',
                    },
                    {
                        fieldLabel: '最小数字',
                        id: idCode + '_minNumber',
                        value: 0,
                        allowBlank: false,
                        xtype: 'numberfield',
                    },
                    {
                        fieldLabel: '最大数字',
                        id: idCode + '_maxNumber',
                        allowBlank: false,
                        xtype: 'numberfield',
                    }
                ]
            }
        ]
    };
    let dateField = {
        xtype: 'fieldcontainer',
        layout: 'column',
        columnWidth: 1,
        id: idCode + "_3",
        hidden: true,
        disabled: true,
        defaults: {
            labelWidth: 60,
            margin: '5 5 5 5',
            labelAlign: 'right',
            columnWidth: 1,
            emptyText: '请填写'
        },
        random: function () {
            let valueArray = [];
            let minDate = Ext.getCmp(idCode + "_minDate").getValue();
            let maxDate = Ext.getCmp(idCode + "_maxDate").getValue();
            if (minDate.getTime() > maxDate.getTime()) {
                showAlert("系统提醒", "最大日期必须大于最小日期！");
                return;
            }
            for (let i = 0; i < Number.MAX_VALUE; i++) {
                let sub = maxDate.getTime() - minDate.getTime();
                let numberValue = Math.random() * sub + minDate.getTime();
                let randDate = new Date(numberValue);
                valueArray.push(Ext.Date.format(randDate, Ext.getCmp(idCode + "_minDate").format));
                if (valueArray.length === dataLength) {
                    break;
                }
            }
            return valueArray;
        },
        items: [
            {
                xtype: 'fieldset',
                columnWidth: 1,
                layout: 'column',
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                title: '日期设置',
                items: [
                    {
                        fieldLabel: '最小日期',
                        xtype: 'datefield',
                        id: idCode + '_minDate',
                        allowBlank: false,
                        format: dateFormat
                    },
                    {
                        fieldLabel: '最大日期',
                        xtype: 'datefield',
                        id: idCode + '_maxDate',
                        allowBlank: false,
                        format: dateFormat
                    }
                ]
            }
        ]
    };
    let longTextField = {
        xtype: 'fieldcontainer',
        layout: 'column',
        columnWidth: 1,
        id: idCode + "_4",
        hidden: true,
        disabled: true,
        defaults: {
            labelWidth: 60,
            margin: '5 5 5 5',
            labelAlign: 'right',
            columnWidth: 1,
            emptyText: '请填写'
        },
        random: function () {
            let valueArray = [];
            let minNumber = Ext.getCmp(idCode + "_minLength").getValue();
            let maxNumber = Ext.getCmp(idCode + "_maxLength").getValue();
            let longTextList = Ext.getCmp(idCode + "_longTextList").getValue();
            if (minNumber > maxNumber) {
                showAlert("系统提醒", "最大长度必须大于最小长度！");
                return;
            }
            let charArray = longTextList.toString().trimAllSymbol().split("");
            for (let i = 0; i < Number.MAX_VALUE; i++) {
                let numberValue = randomInt(minNumber, maxNumber);
                let stringArray = [];
                for (let j = 0; j < Number.MAX_VALUE; j++) {
                    let indexValue = randomInt(0, charArray.length - 1);
                    let charStr = charArray[indexValue];
                    stringArray.push(charStr);
                    if (stringArray.length === numberValue) {
                        break;
                    }
                }
                valueArray.push(stringArray.join(""));
                if (valueArray.length === dataLength) {
                    break;
                }
            }
            return valueArray;
        },
        items: [
            {
                xtype: 'fieldset',
                columnWidth: 1,
                layout: 'column',
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                title: '文字设置',
                items: [
                    {
                        fieldLabel: '文字库',
                        id: idCode + '_longTextList',
                        allowBlank: false,
                        xtype: 'textfield',
                        listeners: {
                            change: function (obj, newValue, oldValue, eOpts) {
                                Ext.getCmp(idCode + "_maxLength").setValue(newValue.truthLength());
                            }
                        }
                    },
                    {
                        fieldLabel: '最小长度',
                        id: idCode + '_minLength',
                        value: 1,
                        minValue: 1,
                        allowBlank: false,
                        xtype: 'numberfield',
                    },
                    {
                        fieldLabel: '最大长度',
                        id: idCode + '_maxLength',
                        allowBlank: false,
                        minValue: 1,
                        xtype: 'numberfield',
                    }
                ]
            }
        ]
    };
    let numberArrayField = {
        xtype: 'fieldcontainer',
        layout: 'column',
        columnWidth: 1,
        id: idCode + "_5",
        hidden: true,
        disabled: true,
        defaults: {
            labelWidth: 60,
            margin: '5 5 5 5',
            labelAlign: 'right',
            columnWidth: 1,
            emptyText: '请填写'
        },
        random: function () {
            let valueArray = [];
            let numberList = Ext.getCmp(idCode + "_numberList").getValue();
            let charArray = numberList.toString().split(",");
            for (let i = 0; i < Number.MAX_VALUE; i++) {
                let value = charArray[randomInt(0, charArray.length - 1)];
                if (Ext.isEmpty(value)) {
                    continue;
                }
                valueArray.push(value);
                if (valueArray.length === dataLength) {
                    break;
                }
            }
            return valueArray;
        },
        items: [
            {
                xtype: 'fieldset',
                columnWidth: 1,
                layout: 'column',
                defaults: {
                    labelWidth: 60,
                    margin: '5 5 5 5',
                    labelAlign: 'right',
                    columnWidth: 1,
                    emptyText: '请填写'
                },
                title: '数字集合设置',
                items: [
                    {
                        fieldLabel: '数字集合',
                        id: idCode + '_numberList',
                        allowBlank: false,
                        value: defaultValue,
                        xtype: 'textfield'
                    },
                    {
                        xtype: 'displayfield',
                        value: '以英文逗号（,）为分隔符！'
                    }
                ]
            }
        ]
    };

    let setPanel = Ext.create('Ext.form.Panel', {
        bodyPadding: 5,
        region: 'center',
        autoScroll: true,
        layout: "column",
        defaults: {
            labelWidth: 60,
            margin: '5 5 5 5',
            labelAlign: 'right',
            columnWidth: 1,
            emptyText: '请填写'
        },
        items: [
            {
                xtype: "combo",
                name: 'autoType',
                fieldLabel: '随机类型',
                editable: false,
                displayField: "text",
                valueField: "id",
                value: 1,
                listeners: {
                    change: function (obj, newValue, oldValue, eOpts) {
                        Ext.getCmp(idCode + "_" + oldValue).setHidden(true);
                        Ext.getCmp(idCode + "_" + oldValue).setDisabled(true);

                        Ext.getCmp(idCode + "_" + newValue).setHidden(false);
                        Ext.getCmp(idCode + "_" + newValue).setDisabled(false);
                    }
                },
                store: Ext.create('Ext.data.Store', {
                    fields: ["id", "text"],
                    data: [
                        {
                            'text': '文本',
                            "id": 1
                        },
                        {
                            'text': '长文本',
                            "id": 4
                        },
                        {
                            'text': '数字',
                            "id": 2
                        },
                        {
                            'text': '数字集合',
                            "id": 5
                        },
                        {
                            'text': '日期',
                            "id": 3
                        }]
                })
            }, textField, numberField, dateField, longTextField, numberArrayField
        ]
    });


    let setColumnValue = function (valueArray) {
        if (valueArray.length === 0 || !(getColumnGrid(column).getStore())) return;
        getColumnGrid(column).getStore().holdUpdate = true;
        let selectData = getColumnGrid(column).getSelectionModel().getSelection();
        if (selectData.length > 0) {
            Ext.each(selectData, function (record, index) {
                if (Ext.isObject(valueArray[index])) {
                    setRecordValue(record, column.dataIndex, valueArray[index]);
                } else {
                    record.set(column.dataIndex, valueArray[index]);
                }
            });
        } else {
            getColumnGrid(column).getStore().each(function (record, index) {
                if (Ext.isObject(valueArray[index])) {
                    setRecordValue(record, column.dataIndex, valueArray[index]);
                } else {
                    record.set(column.dataIndex, valueArray[index]);
                }
            });
        }
        getColumnGrid(column).getStore().holdUpdate = false;
        getColumnGrid(column).getStore().fireEvent("endupdate");
    };

    let win = Ext.create('Ext.window.Window', {
        title: title,
        height: 360,
        iconCls: 'extIcon extRandom',
        width: 450,
        layout: 'border',
        items: [setPanel],
        modal: true,
        constrain: true,
        listeners: {
            show: function () {
                let autoTypeField = setPanel.getField("autoType");
                autoTypeField.setValue(autoType);
                autoTypeField.setReadOnly(selectReadOnly);
            }
        },
        buttons: [
            "->",
            {
                text: '取消',
                iconCls: 'extIcon extClose',
                handler: function () {
                    win.close();
                }
            }, {
                text: '立即生成',
                iconCls: 'extIcon extOk whiteColor',
                handler: function () {
                    let form = setPanel.getForm();
                    if (form.isValid()) {
                        let buildType = setPanel.getFieldValue("autoType");
                        let valueArray = Ext.getCmp(idCode + "_" + buildType).random();
                        if (!valueArray || valueArray.length === 0) {
                            return;
                        }
                        setColumnValue(valueArray);
                        win.close();
                    }
                }
            }]
    });
    win.show();
}