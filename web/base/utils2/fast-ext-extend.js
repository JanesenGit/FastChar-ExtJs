/**
 * 扩展ExtJs常用组件中的属性或方法
 */
var FastExtExtend;
(function (FastExtExtend) {
    /**
     * Ext.Component扩展
     */
    var Component = /** @class */ (function () {
        function Component() {
            /**
             * 标识是否为嵌入iframe标签的组件
             * <br/>
             * 如果配置属性值为true，则在拖拽或改变控件大小时会禁用本组件，避免鼠标事件丢失问题
             */
            this.iframePanel = false;
        }
        return Component;
    }());
    FastExtExtend.Component = Component;
    /**
     * gridpanel或treepanel相关扩展
     */
    var Grid = /** @class */ (function () {
        function Grid() {
        }
        return Grid;
    }());
    FastExtExtend.Grid = Grid;
    /**
     * Ext.form.field.File扩展
     */
    var FileField = /** @class */ (function () {
        function FileField() {
            /**
             * 标识是否允许上传多个文件
             */
            this.multiple = false;
        }
        return FileField;
    }());
    FastExtExtend.FileField = FileField;
    /**
     * Ext.form.Panel扩展
     */
    var FormPanel = /** @class */ (function () {
        function FormPanel() {
            Ext.form.FormPanel.prototype.setFieldValue = function (fieldName, value) {
                this.getForm().findField(fieldName).setValue(value);
            };
        }
        /**
         * 设置字段值
         * @param fieldName 字段属性名
         * @param value 字段值
         */
        FormPanel.prototype.setFieldValue = function (fieldName, value) {
        };
        return FormPanel;
    }());
    FastExtExtend.FormPanel = FormPanel;
})(FastExtExtend || (FastExtExtend = {}));
