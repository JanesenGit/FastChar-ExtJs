namespace FastExt {

    /**
     * Ext组件相关方法功能
     */
    export class Component {

        static maxZIndex = 2147483647;


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
            if (cmb.zIndexManager) {
                cmb.toFront(true);
            }
            if (!shakeCount) {
                shakeCount = 1588;
            }
            try {

                let currX = cmb.getX();
                let currY = cmb.getY();


                let interval, t = 0, z = 6, stopShake = function () {
                    clearInterval(interval);
                    cmb.setX(currX);
                    cmb.setY(currY);
                    if (Ext.isFunction(callBack)) {
                        callBack();
                    }
                };

                interval = setInterval(function () {
                    try {
                        let i = t / 180 * Math.PI, x = Math.sin(i) * z, y = Math.cos(i) * z;
                        cmb.setX(currX + x);
                        cmb.setY(currY + y);
                        if ((t += 90) > shakeCount) {
                            stopShake();
                        }
                    } catch (e) {
                        stopShake();
                    }
                }, 30);
            } catch (e) {
            }
        }


        /**
         * 判断组件是否处于父级容器的中间位置
         * @param cmb
         */
        static isCenterByContainer(cmb): boolean {
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


        /**
         * 预测将要获得组件对象
         * @param selector 组件选择器
         * @param callback 获得组件后的回调
         * @param timeout 超时时间，单位：毫秒
         * @param queryOwner 查找组件的父类，默认全局
         */
        static futureQuery(selector: string, callback: any, timeout?: number, queryOwner?: any) {
            if (Ext.isEmpty(timeout)) {
                timeout = -1;
            }
            if (Ext.isEmpty(queryOwner)) {
                queryOwner = Ext.ComponentQuery;
            }
            let timeoutCode = "FutureQueryTimeout" + $.md5(selector);

            let doQuery = function (count, waitTime) {
                if (FastExt.Component[timeoutCode]) {
                    clearTimeout(FastExt.Component[timeoutCode]);
                }

                if (count * waitTime >= timeout && timeout > 0) {
                    callback();
                    return;
                }
                FastExt.Component[timeoutCode] = setTimeout(function () {
                    let queryCmp = queryOwner.query(selector);
                    if (queryCmp && queryCmp.length > 0) {
                        if (callback(queryCmp)) {
                            return;
                        }
                    }
                    doQuery(count + 1, waitTime + count * 10);
                }, waitTime);
            };
            doQuery(1, 0);
        }


        /**
         * 统计显示的数量
         * @param cmpArray
         */
        static countVisible(cmpArray: []): number {
            let visibleCount = 0;
            for (let cmp of cmpArray) {
                if ((<any>cmp).isHidden()) {
                    continue;
                }
                visibleCount++;
            }
            return visibleCount;
        }


        /**
         * 获取body下最大的z-index，排除 FastExt.Component.pageMaxZIndex
         */
        static getMaxZIndex(defaultIndex: number): number {
            let maxZIndex = defaultIndex;
            let allDialog = $("body").children();
            for (let i = 0; i < allDialog.length; i++) {
                if (!$(allDialog[i]).is(":visible")) {
                    continue;
                }
                let currIndex = parseInt(allDialog[i].style.zIndex || 0);
                if (currIndex === FastExt.Component.maxZIndex) {
                    continue;
                }
                maxZIndex = Math.max(maxZIndex, currIndex);

            }
            return maxZIndex;
        }


        /**
         * 获取目标控件的html节点对象
         * @param target
         */
        static getTargetElement(target: any): Element {
            if (target) {
                if (Ext.isElement(target)) {
                    return target;
                }
                if (!Ext.isEmpty(target.xtype)) {
                    if (target.getEl()) {
                        return target.getEl().dom;
                    }
                }
            }
            return null;
        }


        /**
         * 获取目标控件的body html节点对象
         * @param target
         */
        static getTargetBodyElement(target: any): Element {
            if (target) {
                if (!Ext.isEmpty(target.xtype) && target.body) {
                    return target.body.dom;
                }
            }
            return this.getTargetElement(target);
        }


        /**
         * 保持目标组件的编辑菜单不会自动关闭
         * @param target
         */
        static holdEditorMenu(target: any) {
            if (target && target.getEditorMenu) {
                let editorMenu = target.getEditorMenu();
                if (editorMenu) {
                    editorMenu.holdShow = true;
                }
            }
        }

        /**
         * 恢复目标组件的编辑菜单会自动关闭
         * @param target
         */
        static resumeEditorMenu(target: any) {
            if (target && target.getEditorMenu) {
                let editorMenu = target.getEditorMenu();
                if (editorMenu) {
                    editorMenu.holdShow = false;
                }
            }
        }

        /**
         * 将使用 setReadOnlyAttr 方法执行设置readOnly 避免将trigger的按钮禁用了
         * @param field
         * @param readOnly
         */
        static simpleReadOnly(field: any, readOnly: boolean) {
            if (Ext.isFunction(field.setReadOnlyAttr)) {
                field.setReadOnlyAttr(readOnly);
            }
        }

        /**
         * 判断目标组件是否readOnly,深入判断了html标签的readOnly属性
         * @param field
         */
        static isRealReadOnly(field: any): boolean {
            if (field.readOnly) {
                return true;
            }
            if (field.inputEl && field.inputEl.dom) {
                let attrReadonly = field.inputEl.dom.getAttribute("readonly");
                if (attrReadonly) {
                    return true;
                }
            }
            return false;
        }

    }

}