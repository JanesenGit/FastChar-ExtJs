var FastExt;
(function (FastExt) {
    /**
     * 网页表单相关操作
     */
    var Form = /** @class */ (function () {
        function Form() {
        }
        /**
         * 动态构建表单form对象
         * @param url 提交的路径
         * @param paramsJson 提交的JSON参数
         * @return html中的form对象
         */
        Form.buildForm = function (url, paramsJson) {
            var form = $('<form></form>');
            form.attr('action', url);
            form.attr('method', 'post');
            for (var n in paramsJson) {
                var my_input = $("<input type='text' name='" + n + "' />");
                my_input.attr('value', paramsJson[n]);
                form.append(my_input);
            }
            $(document.body).append(form);
            return form;
        };
        /**
         * 是否是日期控件 datefield
         * @param field
         */
        Form.isDateField = function (field) {
            if (!field)
                return false;
            return field === "datefield" || field.xtype === "datefield";
        };
        /**
         * 是否是数字控件 numberfield
         * @param field
         */
        Form.isNumberField = function (field) {
            if (!field)
                return false;
            return field === "numberfield" || field.xtype === "numberfield";
        };
        /**
         * 是否是文本控件 textfield
         * @param field
         */
        Form.isTextField = function (field) {
            if (!field)
                return false;
            return field === "textfield" || field.xtype === "textfield";
        };
        /**
         * 是否是下拉框控件 combobox combo
         * @param field
         */
        Form.isComboField = function (field) {
            if (!field)
                return false;
            return field === "combobox" || field.xtype === "combo";
        };
        /**
         * 是否是文件控件 fastfile
         * @param field
         */
        Form.isFileField = function (field) {
            if (!field)
                return false;
            return field === "fastfile" || field.xtype === "fastfile" || field === "fastfilefield" || field.xtype === "fastfilefield";
        };
        /**
         * 是否是多文件控件 fastfiles
         * @param field
         */
        Form.isFilesField = function (field) {
            if (!field)
                return false;
            return field === "fastfiles" || field.xtype === "fastfiles" || field === "fastfilesfield" || field.xtype === "fastfilesfield";
        };
        /**
         * 是否是枚举控件 enumcombo
         * @param field
         */
        Form.isEnumField = function (field) {
            if (!field)
                return false;
            return field === "enumcombo" || field === "enumcombobox" || field.xtype === "enumcombo" || field.xtype === "enumcombobox";
        };
        /**
         * 是否是大文本编辑器 contentfield
         * @param field
         */
        Form.isContentField = function (field) {
            if (!field)
                return false;
            return field === "contentfield" || field === "content" || field.xtype === "contentfield" || field.xtype === "content";
        };
        /**
         * 是否是网页编辑器 htmlcontentfield
         * @param field
         */
        Form.isHtmlContentField = function (field) {
            if (!field)
                return false;
            return field === "htmlcontentfield" || field === "htmlcontent" || field.xtype === "htmlcontentfield" || field.xtype === "htmlcontent";
        };
        /**
         * 是否是关联字段 linkfield
         * @param field
         */
        Form.isLinkField = function (field) {
            if (!field)
                return false;
            return field === "linkfield" || field === "link" || field.xtype === "linkfield" || field.xtype === "link";
        };
        /**
         * 是否关联目标字段 targetfield
         * @param field
         */
        Form.isTargetField = function (field) {
            if (!field)
                return false;
            return field === "targetfield" || field === "target" || field.xtype === "targetfield" || field.xtype === "target";
        };
        /**
         * 是否是省份选择控件 pcafield
         * @param field
         */
        Form.isPCAField = function (field) {
            if (!field)
                return false;
            return field === "pcafield" || field === "pca" || field.xtype === "pcafield" || field.xtype === "pca";
        };
        /**
         * 是否地图选择控件 mapfield
         * @param field
         */
        Form.isMapField = function (field) {
            if (!field)
                return false;
            return field === "mapfield" || field === "map" || field.xtype === "mapfield" || field.xtype === "map";
        };
        return Form;
    }());
    FastExt.Form = Form;
})(FastExt || (FastExt = {}));
