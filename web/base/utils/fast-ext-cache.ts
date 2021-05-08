namespace FastExt {


    /**
     * 数据缓存相关
     */
    export class Cache {

        /**
         * 内存缓存配置对象
         */
        static memory: object = {};

        /**
         * 设置缓存，保存在本地浏览器,localStorage
         * @param key 缓存的key
         * @param data 缓存的数据
         */
        static setCache(key: string, data: any): void {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
            }
        }
        /**
         * 获取保存在本地浏览器的缓存
         * @param key 缓存的key
         */
        static getCache(key: string): any {
            try {
                return JSON.parse(localStorage.getItem(key))
            } catch (e) {
            }
            return null;
        }

        /**
         * 删除保存在本地浏览器的缓存
         * @param key 缓存的key
         */
        static removeCache(key: string): any {
            localStorage.removeItem(key);
        }


    }

}