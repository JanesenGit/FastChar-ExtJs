var FastExt;
(function (FastExt) {
    /**
     * 颜色处理的功能
     */
    var Color = /** @class */ (function () {
        function Color() {
        }
        /**
         * 转换颜色格式值，符合：#ffffff 格式
         * @param obj 带转换的颜色
         * @param defaultValue 默认颜色
         * @returns {string}
         */
        Color.toColor = function (obj, defaultValue) {
            if (Ext.isEmpty(defaultValue)) {
                defaultValue = "#FFFFFF";
            }
            if (Ext.isEmpty(obj)) {
                return defaultValue;
            }
            if (obj.toString().startWith("#")) {
                return obj.toString();
            }
            try {
                var color = Ext.ux.colorpick.ColorUtils.parseColor(obj);
                return "#" + Ext.ux.colorpick.ColorUtils.formats.HEX8(color);
            }
            catch (e) {
            }
            return "#" + obj;
        };
        return Color;
    }());
    FastExt.Color = Color;
})(FastExt || (FastExt = {}));
