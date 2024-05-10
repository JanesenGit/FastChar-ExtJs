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


        /**
         * 设置枚举缓存
         * @param enumName 枚举名称
         * @param cacheKey 缓存的key
         * @param data 缓存的数据
         */
        static setEnumCache(enumName: string, cacheKey: string, data: any) {
            if (!this.memory.hasOwnProperty(enumName)) {
                this.memory[enumName] = {};
            }
            if (!this.memory[enumName]) {
                this.memory[enumName] = {};
            }
            this.memory[enumName][cacheKey] = data;
        }

        /**
         * 获取枚举的缓存
         * @param enumName 枚举名称
         * @param cacheKey 缓存的key
         */
        static getEnumCache(enumName: string, cacheKey: string): any {
            if (!this.memory.hasOwnProperty(enumName)) {
                this.memory[enumName] = {};
            }
            if (!this.memory[enumName]) {
                this.memory[enumName] = {};
            }
            return this.memory[enumName][cacheKey];
        }

        /**
         * 获取枚举的所有缓存
         * @param enumName 枚举名称
         */
        static getEnumAllCache(enumName: string): any {
            if (!this.memory.hasOwnProperty(enumName)) {
                this.memory[enumName] = {};
            }
            if (!this.memory[enumName]) {
                this.memory[enumName] = {};
            }
            return this.memory[enumName];
        }

        /**
         * 判断是否存在枚举缓存
         * @param enumName 枚举名称
         * @param cacheKey 缓存的key
         */
        static existEnumCache(enumName: string, cacheKey: string): boolean {
            if (!this.memory.hasOwnProperty(enumName)) {
                return false;
            }
            if (!this.memory[enumName]) {
                return false;
            }
            let cacheData = this.getEnumCache(enumName, cacheKey);
            return !Ext.isEmpty(cacheData);
        }

        /**
         * 清空枚举的缓存
         * @param enumName 枚举名称
         */
        static clearEnumCache(enumName: string) {
            delete this.memory[enumName];
            this.memory[enumName] = null;
        }


        /**
         * 清空枚举的缓存
         * @param enumName 枚举名称
         */
        static clearEnumCacheBySearch(enumName: string) {
            let waitRemoveKey = [];
            for (let memoryKey in this.memory) {
                if (memoryKey.indexOf(enumName) >= 0) {
                    waitRemoveKey.push(memoryKey);
                }
            }
            for (let waitRemoveKeyElement of waitRemoveKey) {
                delete this.memory[waitRemoveKeyElement];
                this.memory[waitRemoveKeyElement] = null;
            }
        }

    }

}