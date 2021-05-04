var FastEnum;
(function (FastEnum) {
    /**
     * 网页a标签中target枚举属性
     */
    var Target;
    (function (Target) {
        /**
         * 在新窗口中打开被链接文档
         */
        Target["_blank"] = "_blank";
        /**
         * 默认。在相同的框架中打开被链接文档
         */
        Target["_self"] = "_self";
        /**
         * 在父框架集中打开被链接文档
         */
        Target["_parent"] = "_parent";
        /**
         * 在整个窗口中打开被链接文档
         */
        Target["_top"] = "_top";
        /**
         * 在指定的框架中打开被链接文档
         */
        Target["framename"] = "framename";
    })(Target = FastEnum.Target || (FastEnum.Target = {}));
    /**
     * 字符追加的位置
     */
    var AppendPosition;
    (function (AppendPosition) {
        AppendPosition["left"] = "left";
        AppendPosition["right"] = "right";
    })(AppendPosition = FastEnum.AppendPosition || (FastEnum.AppendPosition = {}));
})(FastEnum || (FastEnum = {}));
