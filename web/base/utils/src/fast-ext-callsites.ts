namespace FastExt {


    /**
     * 获取方法堆栈功能  https://www.npmjs.com/package/callsites 复制 index.js代码
     */
    export class CallSites {

        static getStack(): any[] {
            const _prepareStackTrace = Error.prepareStackTrace;
            try {
                let result = [];
                Error.prepareStackTrace = (_, callSites) => {
                    const callSitesWithoutCurrent = callSites.slice(1);
                    result = callSitesWithoutCurrent;
                    return callSitesWithoutCurrent;
                };
                new Error().stack; // eslint-disable-line unicorn/error-message, no-unused-expressions
                return result;
            } finally {
                Error.prepareStackTrace = _prepareStackTrace;
            }
        }


        /**
         * 判断方法是否在fast-ext-utils.min.js中执行。
         */
        static isFastExtUtilsCall(): boolean {
            let stack = FastExt.CallSites.getStack();
            if (stack.length >= 3) {
                //stack[0] 是方法 isFastExtUtilsCall 的栈
                //stack[1] 是调用 isFastExtUtilsCall 的方法（以A代替）的栈
                //stack[2] 是调用 A 的方法（以B代替）的栈，也就是真正需要判断的方法
                let callStack = stack[2];
                let fileName = callStack.getFileName();
                if (Ext.isEmpty(fileName)) {
                    return false;
                }
                let realFileName = fileName.split("?")[0];
                if (realFileName.endWith("fast-ext-utils.min.js") || realFileName.endWith("fast-ext-utils.js")) {
                    return true;
                }
            }
            return false;
        }

    }


}