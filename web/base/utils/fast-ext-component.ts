namespace FastExt{

    /**
     * Ext组件相关方法功能
     */
    export  class Component{


        /**
         * 抖动控件
         * @param cmb 待抖动的控件[Ext.Component]
         * @param callBack 抖动结束的回调函数function(){}
         * @param shakeCount 抖动次数
         */
        static shakeComment(cmb, callBack?, shakeCount?: number): void {
            if (!cmb) {
                return;
            }
            if (!shakeCount) {
                shakeCount = 1080;
            }
            try {
                let interval, t = 0, z = 3, del = function () {
                    clearInterval(interval);
                    cmb.setX(currX);
                    cmb.setY(currY);
                    if (Ext.isFunction(callBack)) {
                        callBack();
                    }
                };
                let currX = cmb.getX();
                let currY = cmb.getY();
                interval = setInterval(function () {
                    try {
                        let i = t / 180 * Math.PI, x = Math.sin(i) * z, y = Math.cos(i) * z;

                        cmb.setX(currX + x);
                        cmb.setY(currY + y);
                        if ((t += 90) > shakeCount) del();
                    } catch (e) {
                        del();
                    }
                }, 30);
            } catch (e) {
            }
        }


        /**
         * 判断组件是否处于父级容器的中间位置
         * @param cmb
         */
        static isCenterByContainer(cmb):boolean {
            let parentCmb = cmb.ownerCt;
            if (Ext.isEmpty(parentCmb)) {
                parentCmb = cmb.container;
            }
            if (cmb.constrain) {
                parentCmb = cmb.constrainTo;
            }

            if (parentCmb) {
                let preX = parseInt(((parentCmb.getWidth() - cmb.getWidth()) / 2).toFixed(0));
                let preY = parseInt(((parentCmb.getHeight() - cmb.getHeight()) / 2).toFixed(0));
                console.log("preX", preX, "preY", preY);
                console.log("X", cmb.x, "Y", cmb.y);
                if (preX == cmb.x && preY == cmb.y) {
                    return true;
                }
            }
            return false;
        }

        /**
         * 判断组件是否处于同一个容器中
         * @param cmb1 组件1
         * @param cmb2 组件2
         */
        static isSameByContainer(cmb1, cmb2) {
            let parentCmb1 = cmb1.ownerCt;
            if (Ext.isEmpty(parentCmb1)) {
                parentCmb1 = cmb1.container;
            }
            if (cmb1.constrain) {
                parentCmb1 = cmb1.constrainTo;
            }
            let parentCmb2 = cmb2.ownerCt;
            if (Ext.isEmpty(parentCmb2)) {
                parentCmb2 = cmb2.container;
            }
            if (cmb2.constrain) {
                parentCmb2 = cmb2.constrainTo;
            }
            if (parentCmb1 && parentCmb2) {
                return parentCmb1.id == parentCmb2.id;
            }
            return false;
        }
    }

}