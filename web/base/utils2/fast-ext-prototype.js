var FastExt;
(function (FastExt) {
    /**
     * 扩展常用类的方法或属性，例如String，Array
     */
    var Prototype = /** @class */ (function () {
        function Prototype() {
        }
        /**
         * 初始化默认配置
         */
        Prototype.initGlobal = function () {
            /**
             * 判断字符串是否以某个字符结尾
             * @param suffix 后缀
             * @returns {boolean}
             * @example
             * 'user.js'.endWidth('.js');
             */
            // @ts-ignore
            String.prototype.endWith = function (suffix) {
                if (!suffix || suffix === "" || this.length === 0 || suffix.length > this.length)
                    return false;
                return this.substring(this.length - suffix.length) === suffix;
            };
            /**
             * 判断字符串是否以某个字符开始
             * @param prefix 前缀
             * @returns {boolean}
             * @example
             * 'test.js'.startWith('test')
             */
            // @ts-ignore
            String.prototype.startWith = function (prefix) {
                if (!prefix || prefix === "" || this.length === 0 || prefix.length > this.length)
                    return false;
                return this.substr(0, prefix.length) === prefix;
            };
            /**
             * 字符串处理，首字母大写
             */
            // @ts-ignore
            String.prototype.firstUpperCase = function () {
                return this.replace(/^\S/, function (s) {
                    return s.toUpperCase();
                });
            };
            /**
             * 获取字符串实际长度，包含汉字
             * @returns {number}
             */
            // @ts-ignore
            String.prototype.truthLength = function () {
                return this.replace(/[\u0391-\uFFE5]/g, "aa").length;
            };
            /**
             * 去除字符串的所有标点符号
             */
            // @ts-ignore
            String.prototype.trimAllSymbol = function () {
                return this.replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?/\，/\。/\；/\：/\“/\”/\》/\《/\|/\{/\}/\、/\!/\~/\`]/g, "");
            };
            // @ts-ignore
            String.prototype.replaceAll = function (oldStr, newStr) {
                return this.replace(new RegExp(oldStr, 'g'), newStr);
            };
            /**
             * 判断是否存在于数组中
             * @param val
             * @returns {boolean}
             * @example
             * let userIds=[1,2,3,4];
             * userIds.exists(1);
             */
            // @ts-ignore
            Array.prototype.exists = function (val) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i] === val) {
                        return true;
                    }
                }
                return false;
            };
        };
        return Prototype;
    }());
    FastExt.Prototype = Prototype;
})(FastExt || (FastExt = {}));
