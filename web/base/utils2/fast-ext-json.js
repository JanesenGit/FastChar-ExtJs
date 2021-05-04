var FastExt;
(function (FastExt) {
    /**
     * JSON相关功能
     */
    var Json = /** @class */ (function () {
        function Json() {
        }
        /**
         * 将json字符串转成对象
         * @param jsonStr json字符串
         * @returns {Object}
         */
        Json.jsonToObject = function (jsonStr) {
            try {
                return Ext.decode(jsonStr);
            }
            catch (e) {
            }
            return null;
        };
        /**
         * 将对象转成json字符串
         * @param jsonObj 待转换的对象
         * @returns {string}
         */
        Json.objectToJson = function (jsonObj) {
            try {
                return Ext.encode(jsonObj);
            }
            catch (e) {
            }
            return null;
        };
        /**
         * 合并两个json对象
         * @param jsonData1 json对象
         * @param jsonData2 json对象
         * @return 合并后的新对象
         */
        Json.mergeJson = function (jsonData1, jsonData2) {
            var newJsonData = {};
            if (!Ext.isEmpty(jsonData1)) {
                for (var property in jsonData1) {
                    newJsonData[property] = jsonData1[property];
                }
            }
            if (!Ext.isEmpty(jsonData2)) {
                for (var property in jsonData2) {
                    newJsonData[property] = jsonData2[property];
                }
            }
            return newJsonData;
        };
        return Json;
    }());
    FastExt.Json = Json;
})(FastExt || (FastExt = {}));
