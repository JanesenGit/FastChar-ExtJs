namespace FastExt {

    /**
     * 后台主题工具类
     */
    export class Theme {


        /**
         * 构建主题样式
         * @param themeContent 模板内容
         * @param cssPrefix css前置
         * @param themeColor 主题颜色
         */
        public static buildThemeContent(themeContent: string, cssPrefix: string, themeColor: string) {
            let placeholderValue = {};
            placeholderValue["color"] = themeColor;
            placeholderValue["themeColor"] = themeColor;
            placeholderValue["colorDark"] = FastExt.Color.colorToDarken(placeholderValue["color"], 0.9);

            for (let i = 1; i < 9; i++) {
                let themeLevel = 1 - parseFloat("0." + i);
                placeholderValue["color" + i] = FastExt.Color.colorToLight(placeholderValue["color"], themeLevel);
                placeholderValue["colorDark" + i] = FastExt.Color.colorToDarken(placeholderValue["color"], themeLevel);
            }

            placeholderValue["frontColor"] = FastExt.System.ConfigHandler.getConfig("front_color").value;
            placeholderValue["frontColorDark"] = FastExt.Color.colorToDarken(placeholderValue["frontColor"], 0.9);
            for (let i = 1; i < 9; i++) {
                let frontLevel = 1 - parseFloat("0." + i);
                placeholderValue["frontColor" + i] = FastExt.Color.colorToLight(placeholderValue["frontColor"], frontLevel);
                placeholderValue["frontColorDark" + i] = FastExt.Color.colorToDarken(placeholderValue["frontColor"], frontLevel);
            }

            placeholderValue["inputRadius"] = FastExt.System.ConfigHandler.getConfig("front_radius").value;
            placeholderValue["buttonRadius"] = FastExt.System.ConfigHandler.getConfig("front_radius").value;

            placeholderValue["fontSize"] = FastExt.System.ConfigHandler.getConfig("font_size").value;
            placeholderValue["rowHeight"] = FastExt.System.ConfigHandler.getConfig("grid_row_height").value;


            let cssContent = FastExt.Base.replacePlaceholder(placeholderValue, themeContent);
            return FastExt.Theme.addPrefixCss(cssContent, cssPrefix);
        }


        static addPrefixCss(cssContent: string, prefix: string) {
            let regStr = /([^{}]*){([^{}]*)}/g;

            let newContent = "";

            let result = regStr.exec(cssContent);
            while (result = regStr.exec(cssContent)) {
                let oldPrefix = result[1];
                let split = oldPrefix.split(",");
                let prefixList = [];

                for (let css of split) {
                    if (css.trim().startsWith(".")) {
                        prefixList.push(prefix + " " + css);
                    } else {
                        prefixList.push(css);
                    }
                }
                let newPrefix = prefixList.join(",");

                newContent += (newPrefix + "{" + result[2] + "}");
            }
            return newContent;
        }

    }


}