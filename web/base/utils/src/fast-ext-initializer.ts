namespace FastExt {

    export class Initializer {

        static load() {
            // @ts-ignore 必须优先初始化System
            FastExt.System.__onLoaded();

            //此处的顺序严禁修改
            let allRootClass = [FastDefine, FastExtend, FastOverrider, FastExt];

            for (const allRootClass1 of allRootClass) {
                //必须保留，用来全局初始化一下所有ts类
                for (let subClass in allRootClass1) {
                    if (subClass === "System") {
                        continue;
                    }
                    if (Ext.isFunction(allRootClass1[subClass]["__onLoaded"])) {
                        allRootClass1[subClass]["__onLoaded"]();
                    }
                }
            }
        }
    }
}