namespace FastExt {

    /**
     * 自定grid相关方法类，注意调用方法的作用域
     */
    export class GridMethod {

        /**
         * 刷新grid权限配置【作用域必须为grid】
         */
        static doRefreshPowerEnable() {
            try {
                let grid = <any>this;
                if (Ext.isEmpty(grid.updateButtons) || grid.updateButtons.length === 0) {
                    grid.updateEnable = false;
                } else {
                    grid.updateEnable = FastExt.Component.countVisible(grid.updateButtons) > 0;
                }

                if (Ext.isEmpty(grid.addButtons) || grid.addButtons.length === 0) {
                    grid.addEnable = false;
                } else {
                    grid.addEnable = FastExt.Component.countVisible(grid.addButtons) > 0;
                }

                if (Ext.isEmpty(grid.deleteButtons) || grid.deleteButtons.length === 0) {
                    grid.deleteEnable = false;
                } else {
                    grid.deleteEnable = FastExt.Component.countVisible(grid.deleteButtons) > 0;
                }

                if (!grid.addEnable) {
                    let checkAdds = grid.query("[checkAddPower=true]");
                    for (let i = 0; i < checkAdds.length; i++) {
                        checkAdds[i].setHidden(true);
                        checkAdds[i].setDisabled(true);
                    }
                }

                if (!grid.deleteEnable) {
                    let checkDeletes = grid.query("[checkDeletePower=true]");
                    for (let i = 0; i < checkDeletes.length; i++) {
                        checkDeletes[i].setHidden(true);
                        checkDeletes[i].setDisabled(true);
                    }
                }
                if (!grid.updateEnable) {
                    let checkUpdates = grid.query("[checkUpdatePower=true]");
                    for (let i = 0; i < checkUpdates.length; i++) {
                        checkUpdates[i].setHidden(true);
                        checkUpdates[i].setDisabled(true);
                    }
                }

                if (!grid.operate.deleteAllData) {
                    let checkDeleteAllPower = grid.query("[checkDeleteAllPower=true]");
                    for (let i = 0; i < checkDeleteAllPower.length; i++) {
                        checkDeleteAllPower[i].setHidden(true);
                        checkDeleteAllPower[i].setDisabled(true);
                    }
                }

                if (!grid.operate.copyData) {
                    let checkCopyPower = grid.query("[checkCopyPower=true]");
                    for (let i = 0; i < checkCopyPower.length; i++) {
                        checkCopyPower[i].setHidden(true);
                        checkCopyPower[i].setDisabled(true);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 刷新grid的选择数据，并检查绑定的按钮状态【作用域必须为grid】
         */
        static doRefreshSelect() {
            try {
                let grid = <any>this;
                if (grid.selectButtons) {
                    Ext.each(grid.selectButtons, function (item, index) {
                        if (item) {
                            let selectSize = grid.getSelection().length;
                            if (grid.selectCount) {
                                selectSize = grid.selectCount;
                            }
                            let checkSelect = item.checkSelect;
                            let disabled = false;
                            if (checkSelect === "multiple" || checkSelect === "m" || checkSelect > 1) {
                                disabled = !(selectSize > 0);
                            } else if (checkSelect === "radio" || checkSelect === "r" || checkSelect === "single" || checkSelect === "s" || checkSelect === 1) {
                                disabled = !(selectSize === 1);
                            }
                            FastExt.Button.setDisabled(item, disabled);
                        }
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 记录grid选择的数据,grid数据选择器使用【作用域必须为grid】
         */
        static doRecordSelect() {
            try {
                let grid = <any>this;
                if (FastExt.Base.toBool(FastExt.Cache.memory["holdGridRecordSelectHistory"], false)) {
                    grid.restoreSelect();
                    return;
                }
                if (grid.selectRecordHistoryShowing) {
                    for (let i = 0; i < grid.selectRecordHistoryShowing.length; i++) {
                        let record = grid.selectRecordHistoryShowing[i];
                        grid.removeRecordHistory(record);
                    }
                }
                grid.selectRecordHistoryShowing = [];
                let currSelection = grid.getSelectionModel().getSelection(true);
                for (let i = 0; i < currSelection.length; i++) {
                    let record = currSelection[i];
                    if (grid.hasRecordHistory(record)) {
                        continue;
                    }
                    grid.getSelectRecordHistory().push(record);
                    grid.selectRecordHistoryShowing.push(record);
                }
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 检测record是否已存在选中的历史数据中【作用域必须为grid】
         */
        static doHasRecordHistory(record: any): boolean {
            try {
                let grid = <any>this;
                let entity = grid.getStore().entity;
                if (entity) {
                    for (let i = 0; i < grid.getSelectRecordHistory().length; i++) {
                        let currRecord = grid.getSelectRecordHistory()[i];
                        if (FastExt.Store.isSameRecordByEntity(entity, currRecord, record)) {
                            return true;
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
            return false;
        }

        /**
         * 移除已选中的record数据【作用域必须为grid】
         * @param record
         */
        static doRemoveRecordHistory(record) {
            try {
                let grid = <any>this;
                let entity = grid.getStore().entity;
                if (entity) {
                    let waitRemoveIndex = [];
                    for (let i = 0; i < grid.getSelectRecordHistory().length; i++) {
                        let currRecord = grid.getSelectRecordHistory()[i];
                        if (FastExt.Store.isSameRecordByEntity(entity, currRecord, record)) {
                            waitRemoveIndex.push(i);
                        }
                    }
                    for (let i = 0; i < waitRemoveIndex.length; i++) {
                        grid.getSelectRecordHistory().splice(waitRemoveIndex[i], 1);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 恢复grid选中的历史数据【作用域必须为grid】
         */
        static doRestoreSelect() {
            let grid = <any>this;
            try {
                if (grid.selectHistoryConfig) {
                    if (parseInt(grid.selectHistoryConfig.state) === 0 && !FastExt.Base.toBool(grid.closeSelectHistoryLoad, false)) {
                        grid.clearSelectRecordHistory();
                        return;
                    }
                }

                grid.selectRecordHistoryShowing = [];
                let entity = grid.getStore().entity;
                if (entity) {
                    for (let i = 0; i < grid.getSelectRecordHistory().length; i++) {
                        let dataRecord = grid.getSelectRecordHistory()[i];
                        grid.getStore().each(function (record, index) {
                            if (FastExt.Store.isSameRecordByEntity(entity, dataRecord, record)) {
                                grid.selectRecordHistoryShowing.push(record);
                            }
                        });
                    }
                }
                if (grid.selectRecordHistoryShowing.length > 0) {
                    grid.getSelectionModel().select(grid.selectRecordHistoryShowing);
                    grid.refreshSelect();
                }
            } finally {
                grid.closeSelectHistoryLoad = false;
            }
        }

        /**
         * 获取grid已选中的历史数据【作用域必须为grid】
         */
        static doGetSelectRecordHistory(): any[] {
            try {
                let grid = <any>this;
                if (!grid.selectRecordHistory) {
                    grid.selectRecordHistory = [];
                    let memoryCache = FastExt.Cache.memory["GridSelectHistory" + grid.code];
                    if (memoryCache && Ext.isArray(memoryCache)) {
                        grid.selectRecordHistory = Ext.Array.clone(memoryCache);
                    }
                }
                return grid.selectRecordHistory;
            } catch (e) {
                console.error(e);
            }
            return [];
        }

        /**
         * 清空grid已选中的历史数据【作用域必须为grid】
         */
        static doClearSelectRecordHistory() {
            try {
                let grid = <any>this;
                grid.selectRecordHistory = [];
                if (Ext.isFunction(grid.refreshSelectHistoryCount)) {
                    grid.refreshSelectHistoryCount();
                }
                FastExt.Cache.memory["GridSelectHistory" + grid.code] = null;
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 刷新grid选中的历史数据统计【作用域必须为grid】
         */
        static doRefreshSelectHistoryCount() {
            try {
                let grid = <any>this;
                if (grid.ownerCt) {
                    let countField = grid.ownerCt.query("[selectHistoryCount=true]");
                    for (let i = 0; i < countField.length; i++) {
                        if (Ext.isFunction(countField[i].setValue)) {
                            countField[i].setValue(grid.getSelectRecordHistory().length);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 刷新grid的详情面板数据【作用域必须为grid】
         */
        static doRefreshDetailsPanel() {
            let grid = <any>this;
            if (FastExt.Base.toBool(grid.refreshingDetailsPanel, false)) {
                return;
            }
            try {
                grid.refreshingDetailsPanel = true;
                if (!grid.detailsPanels || grid.detailsPanels.length === 0) {
                    return;
                }
                for (let i = 0; i < grid.detailsPanels.length; i++) {
                    let detailsPanel = grid.detailsPanels[i];
                    if (!detailsPanel) {
                        continue;
                    }
                    if (detailsPanel.fromWindow) {
                        if (Ext.isFunction(detailsPanel.setRecord)) {
                            detailsPanel.setRecord(grid);
                        }
                    } else {
                        if (grid.operate && grid.operate.autoDetails) {
                            if (Ext.isFunction(detailsPanel.setRecord)) {
                                detailsPanel.setRecord(grid);
                            }
                        } else {
                            detailsPanel.close();
                        }
                    }
                }
            } finally {
                grid.refreshingDetailsPanel = false;
            }
        }

        /**
         * 保存grid的UI界面配置【作用域必须为grid】
         */
        static doSaveUIConfig(silence: boolean) {
            try {
                let grid = <any>this;
                if (!FastExt.Base.toBool(grid.firstLoadedData, false)) {
                    return;
                }
                if (silence) {
                    FastExt.Server.setSilence(true);
                }
                let entity = grid.getStore().entity;
                FastExt.Grid.saveGridColumn(grid).then(function () {
                    FastExt.Grid.saveGridButton(grid, entity).then(function () {
                        FastExt.Server.setSilence(false);
                    });
                });
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 隐藏空数据提示【作用域必须为grid】
         */
        static doHideEmptyTip() {
            let grid = <any>this;
            FastExt.Lottie.unloadJsonAnimById(grid.getId() + "-empty-anim");
            $("#" + grid.getId() + "-empty-tip").remove();
        }

        /**
         * 显示grid的空数据提示【作用域必须为grid】
         */
        static doShowEmptyTip() {
            try {
                let grid = <any>this;
                if (!grid.body) {
                    return;
                }
                grid.hideEmptyTip();
                if (grid.getStore() && grid.getStore().getCount() > 0) {
                    return;
                }
                if (Ext.isEmpty(grid.emptyConfig)) {
                    grid.emptyConfig = {
                        lottie: "base/lottie/empty_data.json",
                        width: "40%",
                        height: "40%",
                        opacity: 0.8,
                        filter: "",//grayscale(1)
                    };
                }

                let emptyHtml = "<div id='" + grid.getId() + "-empty-tip' style='" +
                    "pointer-events: none;" +
                    "position: absolute;" +
                    "top: 0;left: 0;right: 0;bottom: 0;" +
                    "z-index: 9;" +
                    "display: flex;" +
                    "align-items: center;" +
                    "justify-content: center;" +
                    "flex-direction: column;'>" +
                    "<div id='" + grid.getId() + "-empty-anim' style='width:" + grid.emptyConfig.width + ";height:" + grid.emptyConfig.height + ";filter: " + grid.emptyConfig.filter + ";opacity: " + grid.emptyConfig.opacity + ";'>" +
                    "</div>" +
                    "</div>";

                $("#" + grid.body.el.id).append($(emptyHtml));
                FastExt.Lottie.loadJsonAnimByEl($("#" + grid.getId() + "-empty-anim")[0], grid.emptyConfig.lottie);
            } catch (e) {
                console.error(e);
            }

        }

        /**
         * 检测grid是否允许编辑【作用域必须为grid】
         */
        static doCheckEditor(): boolean {
            let grid = <any>this;
            if (!FastExt.Base.toBool(grid.updateEnable, true)) {
                return false;
            }
            if (FastExt.Base.toBool(grid.fromRecycle, false)) {
                return false;
            }
            return true;
        }

        /**
         * 检测grid是否允许添加数据【作用域必须为grid】
         */
        static doCheckAdd(): boolean {
            let grid = <any>this;
            if (FastExt.System.isSuperRole()) {
                return true;
            }
            return grid.addEnable;
        }

        /**
         * 检测grid是否允许删除数据【作用域必须为grid】
         */
        static doCheckDelete(): boolean {
            let grid = <any>this;
            if (FastExt.System.isSuperRole()) {
                return true;
            }
            return grid.deleteEnable;
        }

        /**
         * 检测grid的定时刷新器是否开启【作用域必须为grid】
         * @param toast 是否弹出提示
         */
        static doCheckRefreshTimer(toast: any) {
            try {
                let grid = <any>this;
                if (!grid.timerConfig) {
                    return;
                }
                if (parseInt(grid.timerConfig["state"]) === 0) {
                    grid.stopRefreshTimer();
                    if (toast) {
                        FastExt.Dialog.toast("已关闭定时器！");
                    }
                } else {
                    grid.startRefreshTimer();
                    if (toast) {
                        FastExt.Dialog.toast("已启动定时器！");
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 启动grid定时刷新器【作用域必须为grid】
         */
        static doStartRefreshTimer() {
            try {
                let grid = <any>this;
                if (grid.timerTimeout) {
                    clearTimeout(grid.timerTimeout);
                }
                if (!grid.timerConfig) {
                    return;
                }
                let pagingToolBar = grid.child('#pagingToolBar');
                if (pagingToolBar) {
                    let timerBtn = pagingToolBar.down("button[toolType=timerBtn]");
                    if (timerBtn) {
                        if (parseInt(grid.timerConfig["state"]) === 1) {
                            timerBtn.setIconCls(timerBtn.baseIconCls + " redColor");
                            timerBtn.setUserCls("redBorder");
                        } else {
                            timerBtn.setIconCls(timerBtn.baseIconCls + " grayColor");
                            timerBtn.setUserCls("");
                        }
                    }
                }
                if (parseInt(grid.timerConfig["state"]) === 0) {
                    return;
                }
                grid.timerTimeout = setTimeout(function () {
                    if (!grid) {
                        return;
                    }
                    if (!grid.timerConfig) {
                        return;
                    }
                    grid.disabledLoadMaskOnce = parseInt(grid.timerConfig["silence"]) === 1;
                    if (grid.getStore()) {
                        grid.getStore().reload();
                        grid.startRefreshTimer();
                    }
                }, parseInt(grid.timerConfig["value"]) * 1000);
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * 停止grid的定时刷新器【作用域必须为grid】
         */
        static doStopRefreshTimer() {
            let grid = <any>this;
            try {
                if (grid.timerTimeout) {
                    clearTimeout(grid.timerTimeout);
                }
                if (grid.timerConfig) {
                    grid.timerConfig.state = 0;
                }
                let pagingToolBar = grid.child('#pagingToolBar');
                if (pagingToolBar) {
                    let timerBtn = pagingToolBar.down("button[toolType=timerBtn]");
                    if (timerBtn) {
                        if (parseInt(grid.timerConfig["state"]) === 1) {
                            timerBtn.setIconCls(timerBtn.baseIconCls + " redColor");
                            timerBtn.setUserCls("redBorder");
                        } else {
                            timerBtn.setIconCls(timerBtn.baseIconCls + " grayColor");
                            timerBtn.setUserCls("");
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }

    }

}