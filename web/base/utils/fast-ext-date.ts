 namespace FastExt{

     /**
      * 日期相关操作工具类
      */
    export  class Dates {

        /**
         * 将毫秒格式化
         * @param millisecond 时间戳（毫秒）
         * @param formatStr 格式化的样式，"Y-m-d H:i:s"
         */
        static formatMillisecond(millisecond: number, formatStr: string): string {
            return Ext.Date.format(new Date(millisecond), formatStr)
        }

        /**
         * 格式化日期
         * @param dateStr 日期字符串
         * @param formatStr 格式化的样式，"Y-m-d H:i:s"
         */
        static formatDateStr(dateStr: string, formatStr: string) {
            return Ext.Date.format(FastExt.Dates.parseDate(dateStr), formatStr);
        }


        /**
         * 根据日期值猜测日期类型
         * @param value
         */
        static guessDateFormat(value): string {
            if (!value || Ext.isDate(value)) {
                return '';
            }
            value = value.toString().trim();
            let regPattern = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y-m-d H:i:s";
            }
            regPattern = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y-m-d H:i";
            }
            regPattern = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}");
            if (regPattern.test(value)) {
                return "Y-m-d H";
            }
            regPattern = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y-m-d";
            }
            regPattern = new RegExp("[0-9]{4}-[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y-m";
            }
            regPattern = new RegExp("[0-9]{4}");
            if (regPattern.test(value)) {
                return "Y";
            }
            regPattern = new RegExp("[0-9]{4}/[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y/m/d H:i:s";
            }
            regPattern = new RegExp("[0-9]{4}/[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y/m/d H:i";
            }
            regPattern = new RegExp("[0-9]{4}/[0-9]{2}/[0-9]{2} [0-9]{2}");
            if (regPattern.test(value)) {
                return "Y/m/d H";
            }
            regPattern = new RegExp("[0-9]{4}/[0-9]{2}/[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y/m/d";
            }
            regPattern = new RegExp("[0-9]{4}/[0-9]{2}");
            if (regPattern.test(value)) {
                return "Y/m";
            }
            return '';
        }


        /**
         * 将字符串格式化日期
         * @param dateValue
         */
        static parseDate(dateValue: string): Date {
            if (Ext.isEmpty(dateValue)) {
                return null;
            }
            let guessDateFormat = FastExt.Dates.guessDateFormat(dateValue);
            return Ext.Date.parse(dateValue, guessDateFormat);
        }

         /**
          * 弹出日期时间选择控件
          * @param obj 需要弹出的目标控件
          * @param defaultValue 默认日期时间
          * @param dateFormat 日期时间的格式
          * @return Ext.Promise
          */
         static showDatePicker(obj, defaultValue, dateFormat) {
             return new Ext.Promise(function (resolve, reject) {
                 let token = new Date().getTime();
                 if (Ext.isEmpty(dateFormat)) {
                     dateFormat = "Y-m-d H:i:s";
                 }
                 let hourStoreValue = [];
                 for (let i = 0; i < 24; i++) {
                     let value = FastExt.Base.prefixInteger(i, 2);
                     hourStoreValue.push({
                         text: value
                     });
                 }

                 let secondStoreValue = [];
                 for (let i = 0; i < 60; i++) {
                     let value = FastExt.Base.prefixInteger(i, 2);
                     secondStoreValue.push({
                         text: value
                     });
                 }
                 let defaultDate;
                 if (!Ext.isEmpty(defaultValue)) {
                     defaultDate = Ext.Date.parse(defaultValue, FastExt.Dates.guessDateFormat(defaultValue));
                 }
                 if (!defaultDate) {
                     defaultDate = new Date();
                 }

                 let hour = Ext.Date.format(defaultDate, 'H');
                 let minute = Ext.Date.format(defaultDate, 'i');
                 let second = Ext.Date.format(defaultDate, 's');

                 let countItem = 0;

                 let dateShow = dateFormat.indexOf("d") !== -1;
                 let hourShow = dateFormat.indexOf("H") !== -1;
                 let minuteShow = dateFormat.indexOf("i") !== -1;
                 let secondShow = dateFormat.indexOf("s") !== -1;

                 if (hourShow) {
                     countItem++;
                 }
                 if (minuteShow) {
                     countItem++;
                 }
                 if (secondShow) {
                     countItem++;
                 }

                 let pickerCmp: any = {
                     xtype: 'datepicker',
                     id: 'dateValue' + token,
                     region: 'center',
                     showToday: false,
                     margin: '0 0 0 0',
                     border: 0,
                     value: defaultDate
                 };
                 if (!dateShow) {
                     pickerCmp = {
                         xtype: 'monthpicker',
                         id: 'dateValue' + token,
                         region: 'center',
                         showButtons: false,
                         margin: '0 0 0 0',
                         border: 0,
                         value: defaultDate
                     };
                 }


                 let menu = Ext.create('Ext.menu.Menu', {
                     showSeparator: false,
                     layout: 'border',
                     padding: '0 0 0 0',
                     style: {
                         background: "#ffffff"
                     },
                     alwaysOnTop: true,
                     width: 330,
                     height: 400,
                     listeners: {
                         hide: function (obj, epts) {
                             FastExt.Base.runCallBack(resolve);
                         }
                     },
                     items: [
                         pickerCmp,
                         {
                             xtype: 'panel',
                             layout: 'column',
                             margin: '0 0 0 0',
                             region: 'south',
                             border: 0,
                             items: [
                                 {
                                     xtype: 'panel',
                                     columnWidth: 1,
                                     layout: 'column',
                                     border: 0,
                                     items: [
                                         {
                                             id: 'hourValue' + token,
                                             columnWidth: 1.0 / countItem,
                                             emptyText: '时',
                                             minValue: 0,
                                             margin: '0 0 0 5',
                                             maxValue: 23,
                                             displayField: 'text',
                                             valueField: 'text',
                                             editable: false,
                                             hidden: !hourShow,
                                             value: hour,
                                             store: Ext.create('Ext.data.Store', {
                                                 autoLoad: true,
                                                 data: hourStoreValue
                                             }),
                                             xtype: 'combo'
                                         }, {
                                             xtype: 'displayfield',
                                             width: 30,
                                             hidden: !hourShow,
                                             value: "<div align='center'>时</div>"
                                         }, {
                                             id: 'minuteValue' + token,
                                             columnWidth: 1.0 / countItem,
                                             emptyText: '分',
                                             minValue: 0,
                                             maxValue: 59,
                                             displayField: 'text',
                                             valueField: 'text',
                                             editable: false,
                                             value: minute,
                                             hidden: !minuteShow,
                                             store: Ext.create('Ext.data.Store', {
                                                 autoLoad: true,
                                                 data: secondStoreValue
                                             }),
                                             xtype: 'combo'
                                         }, {
                                             xtype: 'displayfield',
                                             width: 30,
                                             hidden: !minuteShow,
                                             value: "<div align='center'>分</div>"
                                         }, {
                                             id: 'secondsValue' + token,
                                             columnWidth: 1.0 / countItem,
                                             emptyText: '秒',
                                             minValue: 0,
                                             maxValue: 59,
                                             displayField: 'text',
                                             valueField: 'text',
                                             editable: false,
                                             value: second,
                                             hidden: !secondShow,
                                             store: Ext.create('Ext.data.Store', {
                                                 autoLoad: true,
                                                 data: secondStoreValue
                                             }),
                                             xtype: 'combo'
                                         }, {
                                             xtype: 'displayfield',
                                             width: 30,
                                             hidden: !secondShow,
                                             value: "<div align='center'>秒</div>"
                                         },
                                     ]
                                 },
                                 {
                                     xtype: 'button',
                                     columnWidth: 1,
                                     margin: '5 5 5 5',
                                     text: '确定',
                                     handler: function () {
                                         let datePicker = Ext.getCmp("dateValue" + token);
                                         let hourCombo = Ext.getCmp("hourValue" + token);
                                         let minuteCombo = Ext.getCmp("minuteValue" + token);
                                         let secondsCombo = Ext.getCmp("secondsValue" + token);
                                         let dateValue = datePicker.getValue();
                                         if (Ext.isDate(dateValue)) {
                                             dateValue.setHours(parseInt(hourCombo.getValue()));
                                             dateValue.setMinutes(parseInt(minuteCombo.getValue()));
                                             dateValue.setSeconds(parseInt(secondsCombo.getValue()));
                                             FastExt.Base.runCallBack(resolve, Ext.Date.format(dateValue, dateFormat));
                                         }else{
                                             let newDate = new Date();
                                             newDate.setMonth(dateValue[0]);
                                             newDate.setFullYear(dateValue[1]);
                                             newDate.setDate(1);
                                             FastExt.Base.runCallBack(resolve, Ext.Date.format(newDate, dateFormat));
                                         }
                                         menu.close();
                                     }
                                 }]
                         }]
                 });
                 menu.showBy(obj);
             });
         }

     }

}