namespace FastExt {

    /**
     * 全局异常信息拦截
     */
    export class ErrorHandler {

        //当fast-ext-utils文件加载时，初始化一次
        public static __onLoaded() {
            ErrorHandler.initErrorHandler();
        }
        /**
         * 获取异常信息的堆栈信息
         * @param event
         */
        public static geErrorInfo(event: any): string {
            if (event) {
                if (event.error && event.error.stack) {
                    return event.error.stack;
                } else if ((<any>event).stack) {
                    return (<any>event).stack;
                } else if (event.message) {
                    return event.message;
                } else if (event.reason) {
                    return event.reason;
                }
                return event.toString();
            }
            return "";
        }

        /**
         * 初始化异常信息的拦截
         */
        public static initErrorHandler() {
            window.addEventListener("error", (event) => {
                try {
                    console.error(event);
                    FastExt.Server.reportException(FastExt.ErrorHandler.geErrorInfo(event));
                } catch (e) {
                    console.error(e);
                }
            });
            window.addEventListener("unhandledrejection", event => {
                try {
                    FastExt.Server.reportException(FastExt.ErrorHandler.geErrorInfo(event));
                } catch (e) {
                    console.error(e);
                }
            });
        }
    }
}
