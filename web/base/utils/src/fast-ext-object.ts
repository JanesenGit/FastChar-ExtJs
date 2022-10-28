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



    }

}

