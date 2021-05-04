var FastExt;
(function (FastExt) {
    /**
     * 数据缓存相关
     */
    var Cache = /** @class */ (function () {
        function Cache() {
        }
        /**
         * 设置缓存，保存在本地浏览器,localStorage
         * @param key 缓存的key
         * @param data 缓存的数据
         */
        Cache.setCache = function (key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            }
            catch (e) {
            }
        };
        /**
         * 获取保存在本地浏览器的缓存
         * @param key 缓存的key
         */
        Cache.getCache = function (key) {
            try {
                return JSON.parse(localStorage.getItem(key));
            }
            catch (e) {
            }
            return null;
        };
        /**
         * 删除保存在本地浏览器的缓存
         * @param key 缓存的key
         */
        Cache.removeCache = function (key) {
            localStorage.removeItem(key);
        };
        return Cache;
    }());
    FastExt.Cache = Cache;
})(FastExt || (FastExt = {}));
