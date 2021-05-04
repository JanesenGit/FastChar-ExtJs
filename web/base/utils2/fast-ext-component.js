var FastExt;
(function (FastExt) {
    /**
     * Ext组件相关方法功能
     */
    var Component = /** @class */ (function () {
        function Component() {
        }
        /**
         * 抖动控件
         * @param obj 待抖动的控件[Ext.Component]
         * @param callBack 抖动结束的回调函数function(){}
         * @param shakeCount 抖动次数
         */
        Component.shakeComment = function (obj, callBack, shakeCount) {
            if (!shakeCount) {
                shakeCount = 1080;
            }
            try {
                var interval_1, t_1 = 0, z_1 = 3, del_1 = function () {
                    clearInterval(interval_1);
                    obj.setX(currX_1);
                    obj.setY(currY_1);
                    if (Ext.isFunction(callBack)) {
                        callBack();
                    }
                };
                var currX_1 = obj.getX();
                var currY_1 = obj.getY();
                interval_1 = setInterval(function () {
                    try {
                        var i = t_1 / 180 * Math.PI, x = Math.sin(i) * z_1, y = Math.cos(i) * z_1;
                        obj.setX(currX_1 + x);
                        obj.setY(currY_1 + y);
                        if ((t_1 += 90) > shakeCount)
                            del_1();
                    }
                    catch (e) {
                        del_1();
                    }
                }, 30);
            }
            catch (e) {
            }
        };
        return Component;
    }());
    FastExt.Component = Component;
})(FastExt || (FastExt = {}));
