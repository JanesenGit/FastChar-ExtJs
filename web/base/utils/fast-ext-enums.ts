namespace FastEnum {

    /**
     * 网页a标签中target枚举属性
     */
    export enum Target {
        /**
         * 在新窗口中打开被链接文档
         */
        _blank = "_blank",
        /**
         * 默认。在相同的框架中打开被链接文档
         */
        _self = "_self",

        /**
         * 在父框架集中打开被链接文档
         */
        _parent = "_parent",

        /**
         * 在整个窗口中打开被链接文档
         */
        _top = "_top",

        /**
         * 在指定的框架中打开被链接文档
         */
        framename = "framename",
    }


    /**
     * 字符追加的位置
     */
    export enum AppendPosition {
        /**
         * 字符追加在左侧
         */
        left = "left",

        /**
         * 字符追加在右侧
         */
        right = "right",
    }

    /**
     * 数据计算方式
     */
    export enum ComputeType{
        /**
         * 计算数据总和
         */
        sum = "sum",
        /**
         * 计算数据平均值
         */
        avg = "avg",
        /**
         * 计算数据最小值
         */
        min = "min",

        /**
         * 计算数据最大值
         */
        max = "max",
    }


    /**
     * 支持权限设置的组件类型
     */
    export enum PowerType{
        gridcolumn = "gridcolumn",
        button = "button",
        menuitem = "menuitem"
    }

}