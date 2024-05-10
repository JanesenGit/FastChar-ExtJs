namespace FastExt{

    /**
     * 对象处理
     */
    export class Objects{


        /**
         * 安全获取对象
         * @param source
         */
        static safeObject(source): any {
            if (source) {
                return source;
            }
            return {};
        }


        /**
         * 安全分割字符
         * @param source
         * @param splitChar
         */
        static safeSplit(source,splitChar): any {
            if (Ext.isEmpty(source)) {
                return [];
            }
            return source.split(splitChar);
        }


        /**
         * 将根据参数返回第一个不为空的值
         * @param values
         */
        static pickValue(...values: any[]): any {
            for (let value of values) {
                if (!Ext.isEmpty(value)) {
                    return value;
                }
            }
            return undefined;
        }

    }

}

