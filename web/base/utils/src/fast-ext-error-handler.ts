namespace FastExt {

    /**
     * 全局异常信息拦截
     */
    export class ErrorHandler {

        constructor() {
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
                } catch (e) {
                    console.error(e);
                }
            });
            window.addEventListener("unhandledrejection", event => {
                try {
                    console.error(event);
                } catch (e) {
                    console.error(e);
                }
            });
            let oldErrorConsole = console.error;
            console.error = function (e) {
                FastExt.Server.reportException(FastExt.ErrorHandler.geErrorInfo(e));
                oldErrorConsole.apply(this, arguments);
            };
        }
    }
}
