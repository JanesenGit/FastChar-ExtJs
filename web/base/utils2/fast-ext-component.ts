namespace FastExt{

    /**
     * Ext组件相关方法功能
     */
    export  class Component{


        /**
         * 抖动控件
         * @param obj 待抖动的控件[Ext.Component]
         * @param callBack 抖动结束的回调函数function(){}
         * @param shakeCount 抖动次数
         */
        static shakeComment(obj, callBack?, shakeCount?: number): void {
            if (!shakeCount) {
                shakeCount = 1080;
            }
            try {
                let interval, t = 0, z = 3, del = function () {
                    clearInterval(interval);
                    obj.setX(currX);
                    obj.setY(currY);
                    if (Ext.isFunction(callBack)) {
                        callBack();
                    }
                };
                let currX = obj.getX();
                let currY = obj.getY();
                interval = setInterval(function () {
                    try {
                        let i = t / 180 * Math.PI, x = Math.sin(i) * z, y = Math.cos(i) * z;

                        obj.setX(currX + x);
                        obj.setY(currY + y);
                        if ((t += 90) > shakeCount) del();
                    } catch (e) {
                        del();
                    }
                }, 30);
            } catch (e) {
            }
        }

    }

}