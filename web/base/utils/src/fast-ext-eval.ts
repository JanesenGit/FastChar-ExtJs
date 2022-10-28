namespace FastExt {

    /**
     * 动态执行功能
     */
    export class Eval {

        /**
         * 动态执行解析对象
         * @param object 对象
         * @param content 含表达式的内容，例如：当前登录${manage.name}
         */
        static runObject(object, content: string): string {
            if (Ext.isEmpty(content)) {
                return content;
            }
            let reg = new RegExp("\\${([^{}]*)}", 'g');
            let matched = [];
            let matchKeys = [];
            while (matched = reg.exec(content)) {
                matchKeys.push(matched[1]);
            }
            window["RunObject"] = object;
            for (const matchKey of matchKeys) {
                let value = eval("RunObject." + matchKey);
                content = content.replace(new RegExp("\\${" + matchKey + "}", 'g'), value);
            }
            return content;
        }

    }
}

