var FastExt;
(function (FastExt) {
    var Power = /** @class */ (function () {
        function Power() {
        }
        /**
         * 是否正在进行权限配置操作
         */
        Power.isPower = function () {
            return window["isPower"]();
        };
        return Power;
    }());
    FastExt.Power = Power;
})(FastExt || (FastExt = {}));
