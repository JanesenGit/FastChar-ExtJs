namespace FastExt {

    /**
     * 日期相关操作工具类
     */
    export class Dates {

        static dateFormatStore = {};


        //当fast-ext-utils文件加载时，初始化一次
        public static __onLoaded() {
            Dates.initDateFormatStore();
        }

        /**
         * 初始化所有日期格式
         * @private
         */
        private static initDateFormatStore() {
            Dates.dateFormatStore["[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}"] = "Y-m-d H:i:s";
            Dates.dateFormatStore["[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}"] = "Y-m-d H:i";
            Dates.dateFormatStore["[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}"] = "Y-m-d H";
            Dates.dateFormatStore["[0-9]{4}-[0-9]{2}-[0-9]{2}"] = "Y-m-d";

            Dates.dateFormatStore["[0-9]{4}/[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}"] = "Y/m/d H:i:s";
            Dates.dateFormatStore["[0-9]{4}/[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}"] = "Y/m/d H:i";
            Dates.dateFormatStore["[0-9]{4}/[0-9]{2}/[0-9]{2} [0-9]{2}"] = "Y/m/d H";
            Dates.dateFormatStore["[0-9]{4}/[0-9]{2}/[0-9]{2}"] = "Y/m/d";


            Dates.dateFormatStore["[0-9]{4}年[0-9]{2}月[0-9]{2}日 [0-9]{2}:[0-9]{2}:[0-9]{2}"] = "Y年m月d日 H:i:s";
            Dates.dateFormatStore["[0-9]{4}年[0-9]{2}月[0-9]{2}日 [0-9]{2}:[0-9]{2}"] = "Y年m月d日 H:i";
            Dates.dateFormatStore["[0-9]{4}年[0-9]{2}月[0-9]{2}日 [0-9]{2}"] = "Y年m月d日 H";
            Dates.dateFormatStore["[0-9]{4}年[0-9]{2}月[0-9]{2}日"] = "Y年m月d日";

        }

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
            value = value.trim('/');
            value = value.trim('-');

            for (let key in Dates.dateFormatStore) {
                let regPattern = new RegExp("^" + key + "$");
                if (regPattern.test(value)) {
                    return Dates.dateFormatStore[key];
                }
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
                            obj.close();
                        }
                    },
                    items: [
                        pickerCmp,
                        {
                            xtype: 'container',
                            layout: 'column',
                            margin: '0 0 0 0',
                            region: 'south',
                            border: 0,
                            items: [
                                {
                                    xtype: 'container',
                                    columnWidth: 1,
                                    layout: 'column',
                                    border: 0,
                                    margin: '10 0 0 0',
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
                                            editable: true,
                                            searchable: true,
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
                                            editable: true,
                                            searchable: true,
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
                                            editable: true,
                                            searchable: true,
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
                                    columnWidth: 0.3,
                                    margin: '5 0 5 5',
                                    iconCls: "extIcon extClose",
                                    text: '取消',
                                    handler: function () {
                                        menu.hide();
                                    }
                                },
                                {
                                    xtype: 'button',
                                    columnWidth: 0.7,
                                    margin: '5 5 5 5',
                                    iconCls: "extIcon extOk",
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
                                        } else {
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


        /**
         * 将日期格式化为生活日期提示，例如：1个小时前、1天前、1个月等
         * @param sourceDate 日期
         * @param dateFormat 当超出汉字描述的范围后，使用指定的格式格式化日期 默认：Y-m-d H:i:s
         * @param appendWeek 是否追加 周几
         */
        static formatDateTip(sourceDate: Date, dateFormat?: string, appendWeek?: boolean): string {
            if (Ext.isEmpty(dateFormat)) {
                dateFormat = "Y-m-d H:i:s";
            }
            let seconds = 1000;
            let minute = seconds * 60;
            let hour = minute * 60;
            let day = hour * 24;
            let week = day * 7;
            let month = day * 30;

            let time1 = new Date().getTime();//当前的时间戳
            if (!sourceDate) {
                return null;
            }
            let time2 = sourceDate.getTime();
            let time = Math.abs(time1 - time2);
            let directionSuffix = time1 < time2 ? "后" : "前";
            let weekSuffix = "";
            let hourSuffix = Ext.Date.format(sourceDate, " H时i分");

            if (appendWeek) {
                let weekTip = ["日", "一", "二", "三", "四", "五", "六"];
                weekSuffix = "（周" + weekTip[sourceDate.getDay()] + "）";
            }

            if (time <= minute) {
                return "刚刚";
            }
            if (time / month >= 2) {
                return Ext.Date.format(sourceDate, dateFormat);
            }
            if (time / month >= 1) {
                return parseInt(String(time / month)) + "个月" + directionSuffix + weekSuffix;
            }
            if (time / week >= 1) {
                let real = parseInt(String(time / week));
                return real + "周" + directionSuffix + weekSuffix;
            }
            if (time / day >= 1) {
                let real = parseInt(String(time / day));
                if (real == 1) {
                    if (directionSuffix == "前") {
                        return "昨天" + hourSuffix + weekSuffix;
                    }
                    if (directionSuffix == "后") {
                        return "明天" + hourSuffix + weekSuffix;
                    }
                }
                return real + "天" + directionSuffix + weekSuffix;
            }
            if (time / hour >= 1) {
                return parseInt(String(time / hour)) + "小时" + directionSuffix + weekSuffix;
            }
            if (time / minute >= 1) {
                return parseInt(String(time / minute)) + "分钟" + directionSuffix + weekSuffix;
            }
            return Ext.Date.format(sourceDate, dateFormat);
        }


        /**
         * 获取当期日期
         * @param format 格式化日期
         * @param diffDay 针对日期 加减
         */
        static getNowDateString(format: string, diffDay?: number): string {
            if (Ext.isEmpty(diffDay)) {
                diffDay = 0;
            }
            let nowDate = Ext.Date.add(new Date(), Ext.Date.DAY, diffDay);
            return Ext.Date.format(nowDate, format);
        }

    }

}