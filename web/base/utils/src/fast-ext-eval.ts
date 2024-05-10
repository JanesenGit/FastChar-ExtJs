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
        static runObject(object:any, content: string): string {
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

        /**
         * 异步执行函数
         * @param method
         * @param delay
         */
        static asyncMethod(method: any, delay?: number): ExtPromise {
            return new Ext.Promise(function (resolve, reject) {
                try {
                    if (delay > 0) {
                        setTimeout(() => {
                            let itemValue = FastExt.Eval.evalMethod(method);
                            resolve(itemValue);
                        }, delay);
                    } else {
                        let itemValue = FastExt.Eval.evalMethod(method);
                        resolve(itemValue);
                    }
                } catch (e) {
                    resolve(null);
                    console.error("method:" + method, e);
                }
            });
        }

        static evalMethod(method: any) {
            if (Ext.isObject(method)) {
                let methodObj = eval(method.name);
                return methodObj.apply(methodObj, method.args);
            }else if (Ext.isString(method)) {
                return eval(method);
            }
            return null;
        }


    }
}

