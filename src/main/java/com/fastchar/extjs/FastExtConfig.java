package com.fastchar.extjs;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastFile;
import com.fastchar.extjs.compress.YuiCompress;
import com.fastchar.extjs.core.FastExtEntities;
import com.fastchar.extjs.core.FastExtLayerHelper;
import com.fastchar.extjs.core.FastExtLayerType;
import com.fastchar.extjs.core.heads.FastHeadExtInfo;
import com.fastchar.extjs.core.heads.FastHeadInfo;
import com.fastchar.extjs.core.heads.FastHeadStyleInfo;
import com.fastchar.extjs.core.menus.FastMenuInfo;
import com.fastchar.extjs.interfaces.IFastAppJsListener;
import com.fastchar.extjs.utils.ColorUtils;
import com.fastchar.extjs.utils.ExtFileUtils;
import com.fastchar.interfaces.IFastConfig;
import com.fastchar.utils.*;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * FastChar-ExtJs配置
 */
public final class FastExtConfig implements IFastConfig {

    public static FastExtConfig getInstance() {
        return FastChar.getOverrides().singleInstance(FastExtConfig.class);
    }


    private String defaultThemeColor = "#62a3db";
    private boolean compressAppJs;
    private boolean attachLog;
    private boolean mergeAppJs;//是否合并AppJs文件
    private FastExtEntities extEntities = new FastExtEntities();
    private FastExtLayerType layerType = FastExtLayerType.None;//权限级别，默认以当前管理角色为最高级别
    private String menuPrefix = "fast-menus";
    private final Set<String> excludeMenuFiles = new HashSet<>();//被排除的menu文件名
    private String uglifyJsPath; //uglify-js 压缩工具的本地路径
    private boolean noticeListener;//是否开启后台通知监听

    private List<FastExtLayerHelper.LayerMap> layerMaps;//表格的层级拓扑图

    /**
     * 获取系统默认的主题色
     *
     * @return 字符串
     */
    public String getDefaultThemeColor() {
        return defaultThemeColor;
    }

    /**
     * 设置系统默认的主题色
     *
     * @param defaultThemeColor 颜色值以#开头
     * @return 当前对象
     */
    public FastExtConfig setDefaultThemeColor(String defaultThemeColor) {
        this.defaultThemeColor = defaultThemeColor;
        return this;
    }

    /**
     * 设置FastExtEntity实体集合
     *
     * @param extEntities 实体集合
     * @return 当前对象
     */
    public FastExtConfig setExtEntities(FastExtEntities extEntities) {
        this.extEntities = extEntities;
        return this;
    }

    /**
     * 是否压缩appjs文件夹的所有js文件
     *
     * @return 布尔值
     */
    public boolean isCompressAppJs() {
        return compressAppJs;
    }

    /**
     * 设置是否压缩appjs文件夹的所有js文件
     *
     * @param compressAppJs 布尔值
     * @return 当前对象
     */
    public FastExtConfig setCompressAppJs(boolean compressAppJs) {
        this.compressAppJs = compressAppJs;
        if (compressAppJs) {
            File app = new File(FastChar.getPath().getWebRootPath(), "app");
        }
        return this;
    }

    /**
     * 是否打印附件日志
     *
     * @return 布尔值
     */
    public boolean isAttachLog() {
        return attachLog;
    }

    /**
     * 设置是否打印附件日志
     *
     * @param attachLog 布尔值
     * @return 当前对象
     */
    public FastExtConfig setAttachLog(boolean attachLog) {
        this.attachLog = attachLog;
        return this;
    }

    /**
     * 是否合并appjs文件夹下的所有js文件，最终在webroot目录下生成一个app.js文件
     *
     * @return 布尔值
     */
    public boolean isMergeAppJs() {
        return mergeAppJs;
    }

    /**
     * 设置是否合并appjs文件夹下的所有js文件，最终在webroot目录下生成一个app.js文件
     *
     * @param mergeAppJs 布尔值
     * @return 当前对象
     */
    public FastExtConfig setMergeAppJs(boolean mergeAppJs) {
        this.mergeAppJs = mergeAppJs;
        return this;
    }

    /**
     * 获取合并后生成的js文件
     *
     * @return 文件对象
     */
    public File getMergeJs() {
        return new File(FastChar.getPath().getWebRootPath(), "app.js");
    }

    /**
     * 获取系统权限类型
     *
     * @return 权限类型@FastLayerType
     */
    public FastExtLayerType getLayerType() {
        return layerType;
    }

    /**
     * 设置系统的权限的类型
     *
     * @param layerType 权限类型
     * @return 当前对象
     */
    public FastExtConfig setLayerType(FastExtLayerType layerType) {
        this.layerType = layerType;
        return this;
    }

    /**
     * 获取系统菜单的配置文件前缀，默认：fast-menus
     *
     * @return 字符串
     */
    public String getMenuPrefix() {
        return menuPrefix;
    }

    /**
     * 设置系统菜单的配置文件前缀，默认：fast-menus
     *
     * @param menuPrefix 前缀，默认：fast-menus
     * @return 当前对象
     */
    public FastExtConfig setMenuPrefix(String menuPrefix) {
        this.menuPrefix = menuPrefix;
        return this;
    }

    /**
     * 排除menus文件菜单
     *
     * @param menuFileName 文件名
     * @return 当前对象
     */
    public FastExtConfig excludeMenuFile(String... menuFileName) {
        excludeMenuFiles.addAll(Arrays.asList(menuFileName));
        return this;
    }

    /**
     * 判断菜单文件是否被排除在外
     *
     * @param menuFileName 文件名
     * @return 布尔值
     */
    public boolean isExcludeMenuFile(String menuFileName) {
        return excludeMenuFiles.contains(menuFileName);
    }


    /**
     * 获取配置的ext值，在fast-head-*.html配置的scheme="ext"值
     *
     * @param name ext名称
     * @return FastHeadExtInfo对象值
     */
    public FastHeadExtInfo getExtInfo(String name) {
        List<FastHeadInfo> heads = FastChar.getValues().get("heads");
        if (heads != null) {
            for (FastHeadInfo head : heads) {
                if (head instanceof FastHeadExtInfo) {
                    FastHeadExtInfo headExtInfo = (FastHeadExtInfo) head;
                    if (headExtInfo.getName().equalsIgnoreCase(name)) {
                        return headExtInfo;
                    }
                }
            }
        }
        return null;
    }

    /**
     * 获取所有ext值，在fast-head-*.html配置的scheme="ext"值
     *
     * @return FastHeadExtInfo值集合
     */
    public List<FastHeadExtInfo> getExtInfo() {
        List<FastHeadExtInfo> extInfos = new ArrayList<>();
        List<FastHeadInfo> heads = FastChar.getValues().get("heads");
        if (heads != null) {
            for (FastHeadInfo head : heads) {
                if (head instanceof FastHeadExtInfo) {
                    FastHeadExtInfo headExtInfo = (FastHeadExtInfo) head;
                    extInfos.add(headExtInfo);
                }
            }
        }
        return extInfos;
    }

    /**
     * 获取配置的项目标题
     *
     * @return 字符串
     */
    public String getProjectTitle() {
        List<FastHeadInfo> heads = FastChar.getValues().get("heads");
        for (FastHeadInfo head : heads) {
            if (FastStringUtils.isEmpty(head.getTagName())) {
                continue;
            }
            if (head.getTagName().equalsIgnoreCase("title")) {
                return FastStringUtils.defaultValue(head.get("value"), "后台管理");
            }
        }
        return "后台管理";
    }

    /**
     * 获取配置的项目logo
     *
     * @return 字符串
     */
    public String getProjectIcon() {
        List<FastHeadInfo> heads = FastChar.getValues().get("heads");
        for (FastHeadInfo head : heads) {
            if (FastStringUtils.isEmpty(head.getTagName())) {
                continue;
            }
            if (head.getTagName().equalsIgnoreCase("link")
                    && head.getString("rel", "none").equalsIgnoreCase("icon")) {
                return head.getString("href");
            }
        }
        return null;
    }


    /**
     * 获取所有appjs文件夹下的所有js文件夹
     *
     * @return File对象集合
     */
    public List<File> getAppJs() {
        File mergeFile = getMergeJs();
        if (mergeFile.exists()) {
            return Collections.singletonList(mergeFile);
        }
        List<File> jsFiles = new ArrayList<>();
        Map<String, List<File>> app = getJsFiles(new File(FastChar.getPath().getWebRootPath(), "app"));
        List<String> pathLoaders = FastChar.getModules().getPathLoadModules();
        for (String path : pathLoaders) {
            app.putAll(getJsFiles(new File(path)));
        }

        for (List<File> value : app.values()) {
            if (value.size() > 1) {
                Collections.sort(value, new Comparator<File>() {
                    @Override
                    public int compare(File o1, File o2) {
                        return o2.compareTo(o1);
                    }
                });
            }
            if (notifyListener(value.get(0))) {
                jsFiles.add(value.get(0));
            }
        }

        if (FastChar.getConfig(FastExtConfig.class).isMergeAppJs()) {
            ExtFileUtils.merge(mergeFile, jsFiles.toArray(new File[]{}));
            return Collections.singletonList(mergeFile);
        }
        return jsFiles;
    }

    private boolean notifyListener(File jsFile) {
        List<IFastAppJsListener> iFastAppJsListeners = FastChar.getOverrides().singleInstances(false, IFastAppJsListener.class);
        for (IFastAppJsListener iFastAppJsListener : iFastAppJsListeners) {
            if (iFastAppJsListener == null) {
                continue;
            }
            if (!iFastAppJsListener.onLoadJs(jsFile)) {
                return false;
            }
        }

        return true;
    }


    private Map<String, List<File>> getJsFiles(File file) {
        Map<String, List<File>> mapFiles = new LinkedHashMap<>();
        if (file.isDirectory()) {
            File[] files = file.listFiles();
            if (files == null) {
                return mapFiles;
            }
            Arrays.sort(files, new Comparator<File>() {
                @Override
                public int compare(File o1, File o2) {
                    return o2.compareTo(o1);
                }
            });
            for (File f : files) {
                if (!f.isDirectory()) {
                    if (f.getName().endsWith(".js")) {
                        String fileCode = FastChar.getSecurity().MD5_Encrypt(f.getName().replaceFirst("@[0-9]+", ""));
                        if (!mapFiles.containsKey(fileCode)) {
                            mapFiles.put(fileCode, new ArrayList<File>());
                        }
                        mapFiles.get(fileCode).add(f);
                    }
                } else {
                    mapFiles.putAll(getJsFiles(f));
                }
            }
        }
        return mapFiles;
    }

    /**
     * 获取所有FastExtEntity对象集合
     *
     * @return FastExtEntities
     */
    public FastExtEntities getExtEntities() {
        return extEntities;
    }


    /**
     * 获取系统主题的css代码
     *
     * @return FastHeadStyleInfo
     */
    public FastHeadStyleInfo getThemeInfo() {
        FastHeadExtInfo themeInfo = getExtInfo("theme");
        if (themeInfo != null) {
            File file = new File(FastChar.getPath().getWebRootPath(), themeInfo.getValue());
            if (file.exists()) {
                FastHeadExtInfo themeColor = getExtInfo("theme-color");
                if (themeColor != null) {
                    return getThemeInfo(themeColor.getColorValue());
                } else {
                    return getThemeInfo(defaultThemeColor);
                }
            }
        }
        return null;
    }


    public Collection<FastHeadStyleInfo> getAllTabThemeInfo() {
        FastMenuInfo menus = FastChar.getValues().get("menus");
        Map<String, FastHeadStyleInfo> themeMap = new LinkedHashMap<>();
        buildTabThemeContent(menus.getChildren(), themeMap);
        return themeMap.values();
    }


    private void buildTabThemeContent(List<FastMenuInfo> menus, Map<String, FastHeadStyleInfo> themeMap) {
        for (FastMenuInfo menu : menus) {
            String baseCls = menu.getBaseCls();
            if (!themeMap.containsKey(baseCls)) {
                FastHeadStyleInfo themeInfo = FastExtConfig.getInstance().getThemeInfo(menu.getColorValue(), true, "." + baseCls);
                if (themeInfo != null) {
                    themeMap.put(baseCls, themeInfo);
                }
            }
            buildTabThemeContent(menu.getChildren(), themeMap);
        }
    }


    /**
     * 获取系统主题下的tab页面的css代码
     */
    public FastHeadStyleInfo getThemeInfo(String colorValue) {
        return getThemeInfo(colorValue, false, null);
    }

    /**
     * 获取系统主题下的tab页面的css代码
     */
    public FastHeadStyleInfo getThemeInfo(String colorValue, boolean tabTheme, String cssPrefix) {
        try {
            if (FastStringUtils.isEmpty(colorValue)) {
                return null;
            }

            FastHeadExtInfo themeInfo = getExtInfo("theme");
            if (themeInfo != null) {
                File file = new File(FastChar.getPath().getWebRootPath(), themeInfo.getValue());
                if (tabTheme) {
                    file = new File(FastChar.getPath().getWebRootPath(), themeInfo.getValue() + "-tab");
                }
                if (file.exists()) {

                    String themeContent = FastFileUtils.readFileToString(file, "utf-8");
                    Map<String, Object> placeholder = new HashMap<String, Object>();
                    placeholder.put("color", colorValue);
                    placeholder.put("themeColor", colorValue);
                    for (int i = 1; i < 9; i++) {
                        placeholder.put("color" + i, ColorUtils.getLightColor(colorValue, 1 - FastNumberUtils.formatToDouble("0." + i)));
                        placeholder.put("colorDark" + i, ColorUtils.getDarkColor(colorValue, 1 - FastNumberUtils.formatToDouble("0." + i)));
                    }

                    FastHeadExtInfo frontColor = getExtInfo("front-color");
                    if (frontColor != null) {
                        placeholder.put("frontColor", frontColor.getColorValue());
                        for (int i = 1; i < 9; i++) {
                            placeholder.put("frontColor" + i, ColorUtils.getLightColor(frontColor.getColorValue(), 1 - FastNumberUtils.formatToDouble("0." + i)));
                            placeholder.put("frontColorDark" + i, ColorUtils.getDarkColor(frontColor.getColorValue(), 1 - FastNumberUtils.formatToDouble("0." + i)));
                        }
                    }

                    FastHeadExtInfo fontSize = getExtInfo("font-size");
                    int fontNumber = 14;
                    if (fontSize != null) {
                        fontNumber = FastNumberUtils.formatToInt(FastNumberUtils.getAllNumbers(fontSize.getValue()));
                    }

                    placeholder.put("fontSize", fontNumber + "px");
                    for (int i = 0; i < 5; i++) {
                        placeholder.put("fontSize" + (i + 1) * 2, (fontNumber + (i + 1) * 2) + "px");
                    }

                    String theme = replacePlaceholder(placeholder, themeContent);

                    if (FastStringUtils.isNotEmpty(cssPrefix)) {
                        theme = addPrefixCss(theme, cssPrefix);
                    }

                    FastHeadStyleInfo styleInfo = new FastHeadStyleInfo();
                    styleInfo.setText(YuiCompress.compressCss(theme));
                    styleInfo.fromProperty();
                    return styleInfo;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }


    /**
     * 替换占位符 ${.*}
     *
     * @param placeholders 属性值
     * @param content      需要替换的内容
     * @return 替换后的内容
     */
    public static String replacePlaceholder(Map<String, Object> placeholders, String content) {
        for (String key : placeholders.keySet()) {
            if (placeholders.get(key) != null) {
                content = content.replaceAll("\\$\\{" + key + "}", placeholders.get(key).toString());
                content = content.replaceAll("\\$\\[" + key + "]", placeholders.get(key).toString());
            }
        }
        return content;
    }

    /**
     * 在css内容中给所有样式组插入前缀
     *
     * @param cssContent 原css内容
     * @param prefix     前缀
     * @return 新的css内容
     */
    public static String addPrefixCss(String cssContent, String prefix) {
        String regStr = "([^{}]*)\\{([^{}]*)}";
        Pattern compile = Pattern.compile(regStr);
        Matcher matcher = compile.matcher(cssContent);
        StringBuilder newContent = new StringBuilder();
        while (matcher.find()) {
            String oldPrefix = matcher.group(1);
            String[] split = oldPrefix.split(",");
            String newPrefix = " " + prefix+" " + FastStringUtils.join(split, " , " + prefix + " ");
            newContent.append(newPrefix).append("{").append(matcher.group(2)).append("}");
        }
        return newContent.toString();
    }


    /**
     * 获取uglify-js的本地项目路径
     *
     * @return 字符串
     */
    public String getUglifyJsPath() {
        return uglifyJsPath;
    }

    /**
     * 设置uglify-js的本地项目路径
     *
     * @param uglifyJsPath 本地项目路径
     * @return 当前对象
     */
    public FastExtConfig setUglifyJsPath(String uglifyJsPath) {
        this.uglifyJsPath = uglifyJsPath;
        return this;
    }

    /**
     * 获取表格权限层级的拓扑图
     *
     * @return
     */
    public List<FastExtLayerHelper.LayerMap> getLayerMaps() {
        return layerMaps;
    }

    /**
     * 设置表格权限层级的拓扑图
     *
     * @param layerMaps
     * @return
     */
    public FastExtConfig setLayerMaps(List<FastExtLayerHelper.LayerMap> layerMaps) {
        this.layerMaps = layerMaps;
        return this;
    }

    public boolean isNoticeListener() {
        return noticeListener;
    }

    public FastExtConfig setNoticeListener(boolean noticeListener) {
        this.noticeListener = noticeListener;
        return this;
    }
}
