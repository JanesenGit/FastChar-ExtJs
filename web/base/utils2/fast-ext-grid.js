var FastExt;
(function (FastExt) {
    /**
     * Ext.grid.Panel或Ext.tree.Panel相关操作
     */
    var Grid = /** @class */ (function () {
        function Grid() {
        }
        /**
         * 添加grid的右键菜单选项
         * @param grid
         * @param target
         * @param index
         */
        Grid.addGridContextMenu = function (grid, target, index) {
            if (grid.contextMenu && target) {
                if (!Ext.isFunction(grid.contextMenu.getXType)) {
                    var menu = new Ext.menu.Menu({
                        items: []
                    });
                    if (Ext.isArray(grid.contextMenu)) {
                        menu.add(grid.contextMenu);
                    }
                    grid.contextMenu = menu;
                }
                if (!Ext.isEmpty(index)) {
                    grid.contextMenu.insert(index, target);
                }
                else {
                    grid.contextMenu.add(target);
                }
            }
        };
        /**
         * 判断grid中是否有正在搜索的列
         * @param grid
         */
        Grid.hasSearchColumn = function (grid) {
            var search = false;
            Ext.each(grid.getColumns(), function (item, index) {
                if (!Ext.isEmpty(item.dataIndex)) {
                    if (item.where && item.where.length > 0) {
                        search = true;
                        return false;
                    }
                }
            });
            return search;
        };
        /**
         * 快速查找grid中的column对象
         * @param grid
         * @param dataIndex column的数据索引
         * @param text column的标题
         */
        Grid.getColumn = function (grid, dataIndex, text) {
            var columns = grid.getColumns();
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];
                if (column.dataIndex === dataIndex) {
                    if (text && column.text === text) {
                        return column;
                    }
                    return column;
                }
            }
            return null;
        };
        /**
         * 触发grid检查是否有搜索的列，如果有将修改底部bar的搜索按钮，突出提醒等功能
         * @param grid
         */
        Grid.checkColumnSearch = function (grid) {
            try {
                var hasSearch_1 = false;
                Ext.each(grid.getColumns(), function (item) {
                    if (item.where) {
                        if (item.where.length > 0) {
                            hasSearch_1 = true;
                            return false;
                        }
                    }
                });
                var pagingToolBar = grid.child('#pagingToolBar');
                if (pagingToolBar) {
                    var searchBtn = pagingToolBar.down("button[toolType=searchBtn]");
                    if (searchBtn) {
                        if (hasSearch_1) {
                            searchBtn.setIconCls("extIcon extSearch redColor");
                        }
                        else {
                            searchBtn.setIconCls("extIcon extSearch grayColor");
                        }
                    }
                }
            }
            catch (e) {
                console.error(e);
            }
        };
        /**
         * 判断column是否可编辑
         * @param column
         */
        Grid.hasColumnField = function (column) {
            try {
                if (Ext.isObject(column.field)) {
                    return true;
                }
                if (!Ext.isEmpty(column.field)) {
                    return true;
                }
                return false;
            }
            catch (e) {
                console.error(e);
            }
            return false;
        };
        /**
         * 是否是日期格式的列
         * @param column
         */
        Grid.isDateColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isDateField(column.field);
        };
        /**
         * 是否是数字编辑的列
         * @param column
         */
        Grid.isNumberColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isNumberField(column.field);
        };
        /**
         * 是否是下拉框的列
         * @param column
         */
        Grid.isComboColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isComboField(column.field);
        };
        /**
         * 是否文件类型的列
         * @param column
         */
        Grid.isFileColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isFileField(column.field);
        };
        /**
         * 是否是大文本的列
         * @param column
         */
        Grid.isContentColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isHtmlContentField(column.field) || FastExt.Form.isContentField(column.field);
        };
        /**
         * 是否多文件的列
         * @param column
         */
        Grid.isFilesColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isFilesField(column.field);
        };
        /**
         * 是否是枚举的列
         * @param column
         */
        Grid.isEnumColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isEnumField(column.field);
        };
        /**
         * 是否是关联表格的列
         * @param column
         */
        Grid.isLinkColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isLinkField(column.field);
        };
        /**
         * 是否是地图的列
         * @param column
         */
        Grid.isMapColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isMapField(column.field);
        };
        /**
         * 是否是省份选择的列
         * @param column
         */
        Grid.isPCAColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isPCAField(column.field);
        };
        /**
         * 是否目标类的列
         * @param column
         */
        Grid.isTargetColumn = function (column) {
            if (!column) {
                return false;
            }
            return FastExt.Form.isTargetField(column.field);
        };
        /**
         * 获得grid的选择器插件
         * @returns Ext.grid.selection.SpreadsheetModel
         */
        Grid.getGridSelModel = function () {
            return Ext.create('Ext.grid.selection.SpreadsheetModel', {
                pruneRemoved: false,
                checkboxSelect: true,
                hasLockedHeader: true,
                cellSelect: false,
                rowNumbererHeaderWidth: 0,
                listeners: {
                    focuschange: function (obj, oldFocused, newFocused, eOpts) {
                        if (obj.store && obj.store.grid) {
                            var pagingToolBar = obj.store.grid.child('#pagingToolBar');
                            if (pagingToolBar) {
                                pagingToolBar.updateInfo();
                            }
                        }
                    }
                }
            });
        };
        return Grid;
    }());
    FastExt.Grid = Grid;
})(FastExt || (FastExt = {}));
