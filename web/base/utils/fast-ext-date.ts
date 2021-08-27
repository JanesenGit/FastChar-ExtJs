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
    }

}