package com.fastchar.extjs;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastMapWrap;
import com.fastchar.extjs.core.FastExtEntities;
import com.fastchar.extjs.core.FastExtJsFile;
import com.fastchar.extjs.core.FastExtLayerHelper;
import com.fastchar.extjs.core.FastExtLayerType;
import com.fastchar.extjs.core.heads.FastHeadExtInfo;
import com.fastchar.extjs.core.heads.FastHeadInfo;
import com.fastchar.extjs.core.heads.FastHeadStyleInfo;
import com.fastchar.extjs.core.menus.FastMenuInfo;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.exception.FastExtConfigException;
import com.fastchar.extjs.interfaces.IFastAppJsListener;
import com.fastchar.extjs.core.FastExtHeadHtmlParser;
import com.fastchar.extjs.core.FastExtMenuXmlParser;
import com.fastchar.extjs.interfaces.IFastAppJsDirectoryListener;
import com.fastchar.extjs.utils.ColorUtils;
import com.fastchar.extjs.utils.ExtFileUtils;
import com.fastchar.interfaces.IFastConfig;
import com.fastchar.utils.FastFileUtils;
import com.fastchar.utils.FastNumberUtils;
import com.fastchar.utils.FastStringUtils;

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

    private String headPrefix = "fast-head";

    private final Set<String> excludeMenuFiles = new HashSet<>();//被排除的menu文件名
    private String uglifyJsPath; //uglify-js 压缩工具的本地路径
    private boolean noticeListener;//是否开启后台通知监听

    private List<FastExtLayerHelper.LayerMap> layerMaps;//表格的层级拓扑图

    private final Map<String, Set<String>> passLoginRemoteIp = new HashMap<>();//跳过登录的浏览器主机地址

    private String onlyOfficeJs;//配置onlyOffice的js地址，将启用onlyoffice预览office文档

    private boolean removeAutoDirectory = true;//是否自动移除webroot目录下的auto文件

    private boolean strictBindLayer = false;//检测到未绑定layer上级字段的列，将严格的抛出异常

    private boolean managerLoginErrorLimit = true;//登录密码错误限次

    private final Set<String> sourceProjectPath = new HashSet<>();


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
     * 移除合并后的所有js文件
     */
    public void removeMergeJs() {
        try {
            FastFileUtils.forceDelete(new File(FastChar.getPath().getWebRootPath(), "bin"));
        } catch (IOException e) {
            e.printStackTrace();
        }
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
     * 添加后台免登录的客户端ip地址
     *
     * @param managerId 管理员ID
     * @param remoteIp  ip地址，支持通配符 *
     * @return 当前对象
     */
    public FastExtConfig addPassLoginRemoteIp(int managerId, String... remoteIp) {
        for (String ip : remoteIp) {
            String passLoginManger = getPassLoginManger(ip);
            if (FastStringUtils.isNotEmpty(passLoginManger)) {
                String errorInfo = FastChar.getLocal().getInfo("ExtConfig_Error1", ip, passLoginManger);
                throw new FastExtConfigException(errorInfo);
            }
        }
        String key = "ID:" + managerId;
        if (!passLoginRemoteIp.containsKey(key)) {
            passLoginRemoteIp.put(key, new HashSet<String>());
        }
        passLoginRemoteIp.get(key).addAll(Arrays.asList(remoteIp));
        return this;
    }

    /**
     * 添加后台免登录的客户端ip地址
     *
     * @param managerLoginName 管理员登录名
     * @param managerLoginPwd  管理员登录的明文密码
     * @param remoteIp         ip地址，支持通配符 *
     * @return 当前对象
     */
    public FastExtConfig addPassLoginRemoteIp(String managerLoginName, String managerLoginPwd, String... remoteIp) {
        for (String ip : remoteIp) {
            String passLoginMangerId = getPassLoginManger(ip);
            if (FastStringUtils.isNotEmpty(passLoginMangerId)) {
                String errorInfo = FastChar.getLocal().getInfo("ExtConfig_Error1", ip, passLoginMangerId);
                throw new FastExtConfigException(errorInfo);
            }
        }
        String key = "ACCOUNT:" + managerLoginName + "/" + managerLoginPwd;
        if (!passLoginRemoteIp.containsKey(key)) {
            passLoginRemoteIp.put(key, new HashSet<String>());
        }
        passLoginRemoteIp.get(key).addAll(Arrays.asList(remoteIp));
        return this;
    }


    /**
     * 根据客户端IP获取免登录的管理ID
     *
     * @param remoteIp 客户端IP
     * @return 管理员ID
     */
    public String getPassLoginManger(String remoteIp) {
        if (FastStringUtils.isEmpty(remoteIp)) {
            return null;
        }
        for (Map.Entry<String, Set<String>> stringSetEntry : passLoginRemoteIp.entrySet()) {
            Set<String> ipSet = stringSetEntry.getValue();
            for (String ipPattern : ipSet) {
                if (FastStringUtils.matches(ipPattern, remoteIp)) {
                    return stringSetEntry.getKey();
                }
            }
        }
        return null;
    }

    /**
     * 获取配置的ext值，在fast-head-*.html配置的scheme="ext"值
     *
     * @param name ext名称
     * @return FastHeadExtInfo对象值
     */
    public FastHeadExtInfo getExtInfo(String name) {
        List<FastHeadInfo> heads = FastExtHeadHtmlParser.getInstance().getHeads();
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
        List<FastHeadInfo> heads = FastExtHeadHtmlParser.getInstance().getHeads();
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
     * 获取所有ext值，在fast-head-*.html配置的scheme="ext"值
     *
     * @return FastHeadExtInfo值集合
     */
    public Map<String, Object> getExtInfoToMap() {
        Map<String, Object> extInfos = new HashMap<>();
        List<FastHeadInfo> heads = FastExtHeadHtmlParser.getInstance().getHeads();
        if (heads != null) {
            for (FastHeadInfo head : heads) {
                if (head instanceof FastHeadExtInfo) {
                    FastHeadExtInfo headExtInfo = (FastHeadExtInfo) head;
                    extInfos.put(headExtInfo.getName(), headExtInfo);
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
        List<FastHeadInfo> heads = FastExtHeadHtmlParser.getInstance().getHeads();
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
        List<FastHeadInfo> heads = FastExtHeadHtmlParser.getInstance().getHeads();
        for (FastHeadInfo head : heads) {
            if (FastStringUtils.isEmpty(head.getTagName())) {
                continue;
            }
            if (head.getTagName().equalsIgnoreCase("link")
                    && head.getMapWrap().getString("rel", "none").equalsIgnoreCase("icon")) {
                return head.getMapWrap().getString("href");
            }
        }
        return null;
    }


    /**
     * 获取所有appjs文件夹下的所有js文件夹
     *
     * @return File对象集合
     */
    public List<File> getAppJs(ExtManagerEntity session, FastAction action) {
        IFastAppJsDirectoryListener appJsDirectoryListener = FastChar.getOverrides().singleInstance(false, IFastAppJsDirectoryListener.class);

        File mergeFile = new File(FastChar.getPath().getWebRootPath(), "bin/app.js");

        if (appJsDirectoryListener != null) {
            String appJsMergeName = appJsDirectoryListener.getAppJsMerge(session, action);
            if (FastStringUtils.isNotEmpty(appJsMergeName)) {
                mergeFile = new File(FastChar.getPath().getWebRootPath(), "bin/" + appJsMergeName);
            }
        }

        if (mergeFile.exists()) {
            return Collections.singletonList(mergeFile);
        }
        List<String> pathLoaders = FastChar.getModules().getPathLoadModules();

        List<File> sourceJsFiles = new ArrayList<>();

        List<String> appJsDirectoryList = new ArrayList<>();

        if (appJsDirectoryListener != null) {
            List<String> appJsDirectorySystem = appJsDirectoryListener.getAppJsDirectory(session, action);
            if (appJsDirectorySystem != null) {
                appJsDirectoryList.addAll(appJsDirectorySystem);
            }
        }

        if (appJsDirectoryList.isEmpty()) {
            appJsDirectoryList.add("app");
        }

        for (String directory : appJsDirectoryList) {
            sourceJsFiles.add(new File(FastChar.getPath().getWebRootPath(), directory));
        }

        for (String path : pathLoaders) {
            sourceJsFiles.add(new File(path));
        }
        Map<String, List<FastExtJsFile>> app = getJsFiles(sourceJsFiles.toArray(new File[]{}));


        List<File> jsFiles = new ArrayList<>();
        for (Map.Entry<String, List<FastExtJsFile>> stringListEntry : app.entrySet()) {
            List<FastExtJsFile> value = stringListEntry.getValue();
            if (value.isEmpty()) {
                continue;
            }

            List<FastExtJsFile> realValue = new ArrayList<>();
            for (FastExtJsFile fastExtJsFile : value) {
                File file = fastExtJsFile.getFile();
                if (notifyListener(file)) {
                    realValue.add(fastExtJsFile);
                }
            }

            if (realValue.size() > 1) {
                Collections.sort(realValue, new Comparator<FastExtJsFile>() {
                    @Override
                    public int compare(FastExtJsFile o1, FastExtJsFile o2) {
                        return Integer.compare(o1.getLevel(), o2.getLevel());
                    }
                });
            }

            jsFiles.add(realValue.get(0).getFile());
        }
        if (FastChar.getConfig(FastExtConfig.class).isMergeAppJs()) {
            ExtFileUtils.merge(mergeFile, jsFiles.toArray(new File[]{}));
            return Collections.singletonList(mergeFile);
        }
        return jsFiles;
    }

    /**
     * 获取onlyOffice的js地址
     *
     * @return
     */
    public String getOnlyOfficeJs() {
        return onlyOfficeJs;
    }

    /**
     * 配置onlyOffice的js地址，将启用onlyoffice预览office文档
     *
     * @param onlyOfficeJs 地址
     * @return
     */
    public FastExtConfig setOnlyOfficeJs(String onlyOfficeJs) {
        this.onlyOfficeJs = onlyOfficeJs;
        return this;
    }

    private boolean notifyListener(File jsFile) {
        List<IFastAppJsListener> iFastAppJsListeners = FastChar.getOverrides().singleInstances(false, IFastAppJsListener.class);
        for (IFastAppJsListener iFastAppJsListener : iFastAppJsListeners) {
            if (iFastAppJsListener == null) {
                continue;
            }
            Boolean onLoadAppJs = iFastAppJsListener.onLoadAppJs(jsFile);
            if (onLoadAppJs == null) {
                continue;
            }
            if (!onLoadAppJs) {
                return false;
            }
        }

        return true;
    }


    public Map<String, List<FastExtJsFile>> getJsFiles(File... sourceJsFiles) {
        Map<String, List<FastExtJsFile>> mapFiles = new LinkedHashMap<>();

        for (File file : sourceJsFiles) {
            if (file.isDirectory()) {
                File[] files = file.listFiles();
                if (files == null) {
                    continue;
                }
                Map<String, List<FastExtJsFile>> jsFiles = getJsFiles(files);
                for (Map.Entry<String, List<FastExtJsFile>> stringListEntry : jsFiles.entrySet()) {
                    if (!mapFiles.containsKey(stringListEntry.getKey())) {
                        mapFiles.put(stringListEntry.getKey(), new ArrayList<FastExtJsFile>());
                    }
                    mapFiles.get(stringListEntry.getKey()).addAll(stringListEntry.getValue());
                }
            } else if (file.getName().toLowerCase().endsWith(".js")) {
                FastExtJsFile fastExtJsFile = new FastExtJsFile(file);
                String fileCode = fastExtJsFile.getFileCode();
                if (!mapFiles.containsKey(fileCode)) {
                    mapFiles.put(fileCode, new ArrayList<FastExtJsFile>());
                }
                mapFiles.get(fileCode).add(fastExtJsFile);
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
        FastMenuInfo menus = FastExtMenuXmlParser.newInstance().getMenus();
        Map<String, FastHeadStyleInfo> themeMap = new LinkedHashMap<>();
        buildTabThemeContent(menus.getChildren(), themeMap);
        return themeMap.values();
    }


    private void buildTabThemeContent(List<FastMenuInfo> menus, Map<String, FastHeadStyleInfo> themeMap) {
        for (FastMenuInfo menu : menus) {
            String baseCls = menu.getBaseCls();
            if (!themeMap.containsKey(baseCls)) {
                FastHeadStyleInfo themeInfo = FastExtConfig.getInstance().getThemeInfo(menu.getColorValue(), true, ".fastchar-extjs ." + baseCls);
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
        return getThemeInfo(colorValue, false, ".fastchar-extjs");
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
                    FastHeadExtInfo frontRadius = getExtInfo("front-radius");
                    if (frontRadius != null) {
                        placeholder.put("inputRadius", frontRadius.getValue());
                        placeholder.put("buttonRadius", frontRadius.getValue());
                    } else {
                        placeholder.put("inputRadius", "5px");
                        placeholder.put("buttonRadius", "5px");
                    }

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
                    styleInfo.setText(theme);
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
        if (FastStringUtils.isEmpty(content)) {
            return content;
        }
        Pattern compile = Pattern.compile("(\\$[{\\[][^{}\\[\\]]+[}\\]])");
        Matcher matcher = compile.matcher(content);
        FastMapWrap fastMapWrap = FastMapWrap.newInstance(placeholders);

        Map<String, String> keyValue = new HashMap<>();
        while (matcher.find()) {
            String realKey = matcher.group(1);
            String runKey = realKey.replace("[", "{").replace("]", "}");
            String value = fastMapWrap.getString(runKey, "");
            keyValue.put(realKey, value);
        }
        for (String key : keyValue.keySet()) {
            content = content.replace(key, keyValue.get(key));
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
            List<String> prefixList = new ArrayList<>();

            for (String css : split) {
                if (css.trim().startsWith(".")) {
                    prefixList.add(prefix + " " + css);
                } else {
                    prefixList.add(css);
                }
            }

            String newPrefix = FastStringUtils.join(prefixList, ",");
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

    /**
     * 系统head.html文件前缀
     *
     * @return 前缀
     */
    public String getHeadPrefix() {
        return headPrefix;
    }

    /**
     * 设置head.html文件的统一前缀
     *
     * @param headPrefix 前缀，默认：fast-head-*.html
     */
    public void setHeadPrefix(String headPrefix) {
        this.headPrefix = headPrefix;
    }

    public boolean isNoticeListener() {
        return noticeListener;
    }

    public FastExtConfig setNoticeListener(boolean noticeListener) {
        this.noticeListener = noticeListener;
        return this;
    }

    public boolean isRemoveAutoDirectory() {
        return removeAutoDirectory;
    }

    public FastExtConfig setRemoveAutoDirectory(boolean removeAutoDirectory) {
        this.removeAutoDirectory = removeAutoDirectory;
        return this;
    }


    public boolean isStrictBindLayer() {
        return strictBindLayer;
    }

    public FastExtConfig setStrictBindLayer(boolean strictBindLayer) {
        this.strictBindLayer = strictBindLayer;
        return this;
    }

    /**
     * 添加本地项目源码地址
     *
     * @param paths 项目地址
     * @return 当前对象
     */
    public FastExtConfig addSourceProjectPath(String... paths) {
        sourceProjectPath.addAll(Arrays.asList(paths));
        return this;
    }


    /**
     * 获取所有项目源码地址
     *
     * @return 集合
     */
    public Set<String> getAllSourceProjectPath() {
        return sourceProjectPath;
    }


    /**
     * 是否开启管理员登录密码错误的限次
     *
     * @return 布尔值
     */
    public boolean isManagerLoginErrorLimit() {
        return managerLoginErrorLimit;
    }

    /**
     * 设置管理员登录密码错误的限次
     *
     * @param managerLoginErrorLimit 布尔值
     * @return 当前对象
     */
    public FastExtConfig setManagerLoginErrorLimit(boolean managerLoginErrorLimit) {
        this.managerLoginErrorLimit = managerLoginErrorLimit;
        return this;
    }
}
