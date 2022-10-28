package com.fastchar.extjs.action;

import com.fastchar.annotation.AFastCache;
import com.fastchar.annotation.AFastRoute;
import com.fastchar.core.*;
import com.fastchar.database.FastDatabases;
import com.fastchar.database.FastPage;
import com.fastchar.database.FastType;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastDatabaseInfo;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.database.sql.FastSql;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.FastExtHelper;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.extjs.core.*;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastSqlTool;
import com.fastchar.extjs.core.enums.FastEnumInfo;
import com.fastchar.extjs.core.heads.FastHeadExtInfo;
import com.fastchar.extjs.core.heads.FastHeadInfo;
import com.fastchar.extjs.core.heads.FastHeadLinkInfo;
import com.fastchar.extjs.core.heads.FastHeadScriptInfo;
import com.fastchar.extjs.core.menus.FastMenuInfo;
import com.fastchar.extjs.entity.ExtBugReportEntity;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtManagerRoleEntity;
import com.fastchar.extjs.entity.ExtSystemConfigEntity;
import com.fastchar.extjs.interfaces.IFastExtEnum;
import com.fastchar.extjs.interfaces.IFastManagerListener;
import com.fastchar.extjs.utils.ColorUtils;
import com.fastchar.extjs.utils.ZXingUtils;
import com.fastchar.out.FastOutCaptcha;
import com.fastchar.utils.*;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.commons.lang3.StringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.CentralProcessor.TickType;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;
import oshi.software.os.FileSystem;
import oshi.software.os.OSFileStore;
import oshi.util.Util;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ExtDefaultAction extends FastAction {
    @Override
    protected String getRoute() {
        return "/";
    }


    /**
     * 进入系统首页
     * 参数：
     * 无
     */
    @AFastRoute({"/fast_index.html", "/index.html", "/index.jsp", "/index.vm"})
    public void index() throws Exception {
        if (getUrlParams().size() > 0) {
            String firstParams = getUrlParam(0);
            if (FastStringUtils.isNotEmpty(firstParams)) {
                //苹果Universal Links的验证文件
                if (firstParams.equals("apple-app-site-association")) {
                    responseJson(new File(FastChar.getPath().getWebRootPath(), "apple-app-site-association"));
                }
            }
        }
        FastExtHeadHtmlParser headHtmlParser = FastExtHeadHtmlParser.getInstance();
        headHtmlParser.initHeadHtml();

        //自动移除webroot目录下的auto文件夹
        FastExtConfig fastExtConfig = FastChar.getConfig(FastExtConfig.class);
        if (fastExtConfig.isRemoveAutoDirectory()) {
            FastFileUtils.deleteQuietly(new File(FastChar.getPath().getWebRootPath(), "app/auto"));
        }


        List<FastHeadInfo> heads = headHtmlParser.getHeads();
        if (heads == null) {
            responseText("未获取到系统fast-head-*.html相关配置文件！");
            return;
        }

        List<ExtSystemConfigEntity> system = ExtSystemConfigEntity.getInstance().getExtConfigs(-1, "System");
        for (ExtSystemConfigEntity extSystemConfigEntity : system) {
            FastHeadExtInfo extInfo = FastExtConfig.getInstance().getExtInfo(extSystemConfigEntity.getConfigKey());
            if (extInfo != null) {
                extInfo.setValue(extSystemConfigEntity.getConfigValue());
            }
        }


        FastHeadExtInfo version = FastExtConfig.getInstance().getExtInfo("version");
        if (version != null && FastChar.getConstant().isDebug()) {
            version.setValue(String.valueOf(System.currentTimeMillis()));
        }

        Map<String, Object> extInfoToMap = FastExtConfig.getInstance().getExtInfoToMap();

        StringBuilder headString = new StringBuilder();
        for (FastHeadInfo head : heads) {
            if (head.isWriteHtml()) {
                headString.append(FastExtConfig.replacePlaceholder(extInfoToMap, head.getText())).append("\n");
            }
        }

        Map<String, Object> holders = new HashMap<>(extInfoToMap);
        holders.put("head", headString.toString());
        holders.put("http", getProjectHost());
        holders.put("version", version);
        holders.put("power", getParamToBoolean("power"));
        holders.put("indexUrl", getRequest().getRequestURL().toString());
        holders.put("main", getParam("main", ""));
        holders.put("role", getParam("role", "manager"));

        Map<String, Object> allParam = getParamToMap();
        holders.put("params", FastChar.getJson().toJson(allParam));

        FastHeadExtInfo extInfo = FastExtConfig.getInstance().getExtInfo("theme-color");
        if (extInfo != null) {
            holders.put("color", extInfo.getColorValue());
        } else {
            holders.put("color", FastExtConfig.getInstance().getDefaultThemeColor());
        }

        FastHeadExtInfo fontSize = FastExtConfig.getInstance().getExtInfo("font-size");
        if (fontSize != null) {
            holders.put("fontSize", fontSize.getValue());
        } else {
            holders.put("fontSize", "14px");
        }

        String indexHtml = FastFileUtils.readFileToString(new File(FastChar.getPath().getWebRootPath(), "fast-index.html"), "utf-8");
        if (FastStringUtils.isEmpty(indexHtml)) {
            response404("系统fast-index.html文件读取异常！请及时告知开发人员！");
        }

        indexHtml = FastExtConfig.replacePlaceholder(holders, indexHtml);
        responseHtml(indexHtml);
    }


    /**
     * 获取系统加载的文件
     * 参数：
     * 无
     */
    public void loadApp() {
        FastExtHeadHtmlParser fastHeadHtmlObserver = FastExtHeadHtmlParser.getInstance();
        List<FastHeadInfo> heads = fastHeadHtmlObserver.getHeads();


        String main = getParam("main");
        String role = getParam("role", "manager");
        String errorMessage = null;

        FastHeadExtInfo mainHeadInfo = FastExtConfig.getInstance().getExtInfo(main);
        if (mainHeadInfo != null) {
            main = mainHeadInfo.getValue();
        }

        List<FastHeadInfo> newHeads = new ArrayList<>();
        for (FastHeadInfo head : heads) {
            if (head.isWriteHtml()) {
                continue;
            }
            FastHeadInfo fastHeadInfo = FastChar.getOverrides().newInstance(head.getClass());
            fastHeadInfo.putAll(head);
            newHeads.add(fastHeadInfo);
        }

        String baseJsUrl = main;
        boolean hasLogin = false;
        boolean continueInfo = true;
        if (role.equalsIgnoreCase("manager")) {
            ExtManagerEntity manager = ExtManagerEntity.getSession(this);
            if (manager != null) {
                errorMessage = manager.getString("responsePageMessage");
                FastHeadExtInfo indexUrl = FastChar.getConfig(FastExtConfig.class).getExtInfo("indexUrl");
                if (indexUrl != null) {
                    baseJsUrl = indexUrl.getValue();
                    if (FastStringUtils.isNotEmpty(main)) {
                        baseJsUrl = main;
                        indexUrl.setValue(main);
                    }
                } else {
                    responseJson(-1, "初始化失败！系统{{indexUrl}}配置文件异常，请及时告知开发人员！");
                }
                if (ExtManagerAction.MANAGER_SINGLE_LOGIN_CODE.containsKey(manager.getManagerId())) {
                    String loginCode = getSession("loginCode");
                    String lastLoginCode = ExtManagerAction.MANAGER_SINGLE_LOGIN_CODE.get(manager.getManagerId());
                    if (FastStringUtils.isNotEmpty(lastLoginCode) && FastStringUtils.isNotEmpty(loginCode) && !lastLoginCode.equalsIgnoreCase(loginCode)) {
                        errorMessage = "您的账户已在其他终端登录！";
                        removeSession("manager");
                        removeSession("loginCode");
                        continueInfo = false;
                    }
                }

                if (continueInfo) {
                    ExtManagerEntity byId = ExtManagerEntity.dao().getById(manager.getId());
                    if (byId != null) {
                        hasLogin = true;
                        IFastManagerListener iFastManager = FastChar.getOverrides().singleInstance(false, IFastManagerListener.class);
                        if (iFastManager != null) {
                            FastHandler handler = new FastHandler();
                            iFastManager.onManagerLogin(byId, handler);
                            if (handler.getCode() != 0) {
                                responseJson(-1, handler.getError());
                            }
                        }
                        manager.putAll(byId);
                        manager.pullInfo();
                        ExtManagerEntity.setSession(this, manager);
                    } else {
                        errorMessage = "您的账户信息已丢失，请您重新登录！";
                    }
                }
            }

            if (!hasLogin) {
                FastHeadExtInfo loginUrl = FastChar.getConfig(FastExtConfig.class).getExtInfo("loginUrl");
                if (loginUrl != null) {
                    baseJsUrl = loginUrl.getValue();
                } else {
                    responseJson(-1, "初始化失败！系统{{loginUrl}}配文件置异常，请及时告知开发人员！");
                }
            }
        }

        newHeads.add(FastExtConfig.getInstance().getThemeInfo());
        newHeads.addAll(FastExtConfig.getInstance().getAllTabThemeInfo());

        FastHeadScriptInfo headScriptInfo = new FastHeadScriptInfo();
        headScriptInfo.setSrc(baseJsUrl);
        newHeads.add(headScriptInfo);

        FastHeadExtInfo debugExtInfo = new FastHeadExtInfo();
        debugExtInfo.setName("debug");
        debugExtInfo.setValue(String.valueOf(FastChar.getConstant().isDebug()));
        newHeads.add(debugExtInfo);


        FastHeadExtInfo localExtInfo = new FastHeadExtInfo();
        localExtInfo.setName("local");
        localExtInfo.setValue(String.valueOf(getProjectHost().startsWith("http://localhost")));
        newHeads.add(localExtInfo);

        for (FastHeadInfo newHead : newHeads) {
            if (newHead instanceof FastHeadLinkInfo) {
                FastHeadLinkInfo linkInfo = (FastHeadLinkInfo) newHead;
                linkInfo.wrapHttp(getProjectHost());
            } else if (newHead instanceof FastHeadScriptInfo) {
                FastHeadScriptInfo scriptInfo = (FastHeadScriptInfo) newHead;
                scriptInfo.wrapHttp(getProjectHost());
            }
        }

        responseJson(0, "获取成功！", newHeads, errorMessage);
    }


    /**
     * 进入系统管理员权限编辑页面
     * 参数：
     * 无
     */
    @AFastSession
    public void power() throws Exception {
        addParam("power", "true");
        index();
    }


    /**
     * 获取系统配置信息
     * 参数：
     * 无
     */
    @AFastSession
    public void showConfig() throws Exception {
        FastExtMenuXmlParser fastMenuXmlParser = FastExtMenuXmlParser.newInstance();
        ExtManagerEntity session = ExtManagerEntity.getSession(this);

        List<File> appJs = FastExtConfig.getInstance().getAppJs(session, this);
        List<String> appJsUrls = new ArrayList<>();
        for (File app : appJs) {
            appJsUrls.add(parseFilePathToUrl(app));
        }

        Map<String, Object> data = new HashMap<>();
        data.put("app", appJsUrls);
        data.put("http", getProjectHost());
        data.put("layer", FastExtConfig.getInstance().getLayerType() != FastExtLayerType.None);
        data.put("entities", FastExtConfig.getInstance().getExtEntities().getEntityInfo());

        FastMenuInfo menus = fastMenuXmlParser.getMenus();
        filterPowerMenus(menus.getChildren(), getParam("menuPower"));
        fastMenuXmlParser.notifyListener(menus);

        data.put("menus", menus.getChildren());
        data.put("menusCss", buildCssContent(menus.getChildren()));


        data.put("noticeListener", FastExtConfig.getInstance().isNoticeListener());
        data.put("manager", session);
        data.put("needInit", false);
        FastHeadExtInfo initExtInfo = FastExtConfig.getInstance().getExtInfo("init");
        if (initExtInfo != null) {
            String initExtInfoValue = initExtInfo.getValue();
            if (FastStringUtils.isNotEmpty(initExtInfoValue)) {
                boolean needInit = FastNumberUtils.formatToInt(session.getString("initCode", "")) < FastNumberUtils.formatToInt(initExtInfoValue);
                data.put("needInit", needInit);
                if (needInit) {
                    session.set("initCode", initExtInfoValue);
                    session.update();
                }
            }
        }
        responseJson(0, "获取成功！", data);
    }

    private String parseFilePathToUrl(File file) {
        String replace = file.getAbsolutePath().replace(FastChar.getPath().getWebRootPath(), "");
        if (replace.startsWith("http://") || replace.startsWith("https://") || replace.startsWith("/")) {
            if (new File(replace).exists()) {
                return getProjectHost() + "attach?disposition=false&path=" + replace;
            } else {
                return appendFileTime(replace, file);
            }
        } else {
            return getProjectHost() + appendFileTime(replace, file);
        }
    }

    private String appendFileTime(String source, File file) {
        if (source.contains("?")) {
            return source + "&t=" + file.lastModified();
        }
        return source + "?t=" + file.lastModified();
    }

    private void filterPowerMenus(List<FastMenuInfo> menus) {
        filterPowerMenus(menus, null);
    }

    private void filterPowerMenus(List<FastMenuInfo> menus, String menuPower) {
        ExtManagerEntity managerEntity = ExtManagerEntity.getSession(this);
        List<FastMenuInfo> waitRemove = new ArrayList<>();
        for (FastMenuInfo menu : menus) {
            if (managerEntity != null && managerEntity.getManagerRole().getRoleType() != ExtManagerRoleEntity.RoleTypeEnum.超级角色) {
                String managerMenuPower = managerEntity.getString("managerMenuPower");
                if (!managerMenuPower.contains(menu.getId())) {
                    waitRemove.add(menu);
                    continue;
                }
            }

            if (FastStringUtils.isNotEmpty(menuPower)) {
                if (!menuPower.contains(menu.getId())) {
                    waitRemove.add(menu);
                    continue;
                }
            }
            filterPowerMenus(menu.getChildren(), menuPower);
        }
        menus.removeAll(waitRemove);
    }

    private String buildCssContent(List<FastMenuInfo> menus) {
        if (menus == null || menus.size() == 0) {
            return "";
        }
        List<String> iconCls = new ArrayList<String>();
        for (FastMenuInfo menu : menus) {
            if (FastStringUtils.isEmpty(menu.getIconCls())) {
                String cssName = "ICON" + menu.getId().toUpperCase();
                if (FastStringUtils.isNotEmpty(menu.getIcon())) {
                    if (FastChar.getConstant().isDebug()) {//调试模式并且是本地模式
                        iconCls.add("." + cssName + ":before{" +
                                "content: url(" + menu.getIcon() + "&t=" + System.currentTimeMillis() + ");" +
                                "}");
                    } else {
                        iconCls.add("." + cssName + ":before{content: url(" + menu.getIcon() + ");}");
                    }
                    menu.setIconCls(cssName);
                }
            } else {
                iconCls.add(".x-treelist-nav .x-treelist-item-icon, .x-treelist-nav .x-treelist-item-tool ." + FastStringUtils.join(menu.getIconCls().split(" "), " .") + "{color:#" + FastStringUtils.stripStart(menu.getColor(), "#") + "}");
            }
            iconCls.add(buildCssContent(menu.getChildren()));
        }
        return FastStringUtils.join(iconCls, "\n");
    }


    /**
     * 获取系统svg文件
     * 参数：
     * path svg相对项目的位置 {String}
     * color svg填充的颜色 {String}
     */
    public void icon(String path, String color) {
        try {
            setLog(false);
            addResponseHeader("Cache-Control", "max-age=" + (60 * 60 * 24 * 360));
            File iconFile = new File(path);

            List<String> webRootPaths = new ArrayList<>();
            webRootPaths.add(FastChar.getPath().getWebRootPath());
            webRootPaths.addAll(FastChar.getModules().getPathLoadModules());
            for (String webRootPath : webRootPaths) {
                String localPath = webRootPath + File.separator + path;
                if (new File(localPath).exists()) {
                    iconFile = new File(localPath);
                    break;
                }
            }

            if (iconFile.exists()) {
                if (FastStringUtils.isNotEmpty(color)) {
                    color = color.replace("#", "");
                    if (iconFile.getName().toLowerCase().endsWith(".svg")) {
                        String coloLocalPath = iconFile.getParent() + File.separator + FastMD5Utils.MD5To16(color) + File.separator + iconFile.getName();
                        File colorFile = new File(coloLocalPath);
                        if (colorFile.exists()) {
                            responseFile(colorFile);
                            return;
                        }
                        String svgContent = FastFileUtils.readFileToString(iconFile);
                        String reg = "fill=\"#([0-9a-zA-Z]{6,8})\"";

                        String replaceAll = svgContent.replaceAll(reg, "fill=\"#" + color + "\"");
                        FastFileUtils.writeStringToFile(colorFile, replaceAll);
                        responseFile(colorFile);
                    }
                }
                responseFile(iconFile);
            } else {
                responseText("文件不存在！");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    /**
     * 获得图形验证码
     */
    public FastOutCaptcha showCaptcha() {
        return FastChar.getOverrides().newInstance(FastOutCaptcha.class).setStatus(200);
    }


    /**
     * 获得枚举的值列表
     * 参数：
     * enumName 枚举的类名 {String}
     */
    @AFastCache(checkClass = true)
    public void showEnums() throws Exception {
        String enumName = getParam("enumName", true);
        IFastExtEnum enumClass = FastChar.getOverrides().singleInstance(IFastExtEnum.class, enumName);
        if (enumClass != null) {
            List<FastEnumInfo> enums = new ArrayList<>(enumClass.getEnums());
            List<FastEnumInfo> waitRemove = new ArrayList<>();
            for (FastEnumInfo anEnum : enums) {
                if (anEnum == null) {
                    continue;
                }
                if (anEnum.getMapWrap().getBoolean("disabled", false)) {
                    waitRemove.add(anEnum);
                }
            }
            Collections.sort(enums, new Comparator<FastEnumInfo>() {
                @Override
                public int compare(FastEnumInfo o1, FastEnumInfo o2) {
                    return Integer.compare(o1.getMapWrap().getInt("index"), o2.getMapWrap().getInt("index"));
                }
            });
            enums.removeAll(waitRemove);
            responseJson(0, "获取成功！", enums);
        } else {
            responseJson(-1, "获取失败！枚举'" + enumName + "'不存在！");
        }
    }


    /**
     * 获取权限菜单
     * 参数：
     * checked 默认选中的菜单Id {String}
     * parent 父级的权限值 {String}
     */
    @AFastSession
    public List<FastMenuInfo> showPowerMenus() throws Exception {
        String checked = getParam("checked");

        FastExtMenuXmlParser fastMenuXmlParser = FastExtMenuXmlParser.newInstance();
        FastMenuInfo menus = fastMenuXmlParser.getMenus();
        filterPowerMenus(menus.getChildren(), getParam("parent"));
        filterMenusByPower(menus.getChildren(), checked);
        return menus.getChildren();
    }

    private void filterMenusByPower(List<FastMenuInfo> menus, String checked) {
        List<FastMenuInfo> waitRemove = new ArrayList<>();
        for (FastMenuInfo menu : menus) {
            if (!menu.getMapWrap().getBoolean("power", true)) {
                waitRemove.add(menu);
                continue;
            }
            menu.setChecked(checked.contains(menu.getId()));
            filterMenusByPower(menu.getChildren(), checked);
        }
        menus.removeAll(waitRemove);
    }

    /**
     * 获得后台菜单列表
     * 参数：
     * checked 默认选中的菜单 {String}
     */
    @AFastSession
    public List<FastMenuInfo> showMenuColumn() throws Exception {
        String checked = getParam("checked");

        FastExtMenuXmlParser fastMenuXmlParser = FastExtMenuXmlParser.newInstance();
        FastMenuInfo menus = fastMenuXmlParser.getMenus();
        filterPowerMenus(menus.getChildren());
        filterMenuColumn(menus.getChildren(), checked);
        return menus.getChildren();
    }


    private void filterMenuColumn(List<FastMenuInfo> menus, String checked) {
        ExtManagerEntity managerEntity = ExtManagerEntity.getSession(this);
        if (managerEntity == null) {
            return;
        }
        List<FastMenuInfo> waitRemove = new ArrayList<>();
        for (FastMenuInfo menu : menus) {
            menu.setChecked(checked.contains(menu.getId()));
            if (FastBooleanUtils.formatToBoolean(menu.getLeaf(), false)) {
                ExtSystemConfigEntity extConfig = ExtSystemConfigEntity.getInstance().getExtConfig(managerEntity.getId(), menu.getId());
                if (extConfig == null) {
                    waitRemove.add(menu);
                } else {
                    Map<String, Map<String, Object>> stringMapMap = extConfig.toColumns();
                    if (stringMapMap == null) {
                        waitRemove.add(menu);
                    } else {
                        menu.setLeaf(false);
                        for (Map.Entry<String, Map<String, Object>> stringMapEntry : stringMapMap.entrySet()) {
                            Map<String, Object> column = stringMapEntry.getValue();
                            if (column != null) {
                                if (column.containsKey("dataIndex")) {
                                    FastMenuInfo menuInfo = new FastMenuInfo();
                                    menuInfo.setLeaf(true);
                                    menuInfo.setIcon("icons/icon_column.svg");
                                    menuInfo.setId(FastMD5Utils.MD5(stringMapEntry.getKey() + menu.getId()));
                                    menuInfo.setChecked(checked.contains(menuInfo.getId()));
                                    menuInfo.setDepth(menu.getDepth() + 1);
                                    menuInfo.setParentId(menu.getId());
                                    menuInfo.putAll(column);
                                    menu.getChildren().add(menuInfo);
                                }
                            }
                        }
                    }
                }
            } else {
                filterMenuColumn(menu.getChildren(), checked);
            }
        }
        menus.removeAll(waitRemove);
    }


    /**
     * 上传文件
     * 参数：
     * type 文件保存的子目录名 {String}
     * url 网络文件地址 {Array}【可选】
     * file 上传的文件流 {Array} {File}
     */
    public void upload() throws Exception {
        setLogResponse(true);
        String type = getParam("type");

        List<Object> resultList = new ArrayList<>();

        List<FastFile<?>> paramListFile = getParamListFile();
        for (FastFile<?> paramFile : paramListFile) {
            if (FastStringUtils.isNotEmpty(type)) {
                paramFile = paramFile.renameTo(new File(paramFile.getAttachDirectory() + File.separator + type,
                        FastMD5Utils.MD5To16(System.currentTimeMillis() + paramFile.getFileName()) + paramFile.getExtensionName()), true);
            }
            Map<String, Object> result = new HashMap<>();
            result.put("name", FastStringUtils.defaultValue(paramFile.getUploadFileName(), "").replace("@", "_"));
            result.put("type", paramFile.getExtensionName());
            result.put("length", paramFile.getFile().length());
            String fileUrl = paramFile.getUrl();
            if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
                result.put("url", fileUrl);
            } else {
                result.put("url", getProjectHost() + FastStringUtils.stripStart(fileUrl, "/"));
            }
            result.putAll(paramFile.getAttrs());
            result.put("http", getProjectHost());
            resultList.add(result);
        }

        String[] urls = getParamToArray("url");
        for (String url : urls) {
            if (FastStringUtils.isNotEmpty(url)) {
                FastFile<?> paramFile = FastExtHelper.getFastFileFromUrl(url);
                if (FastStringUtils.isNotEmpty(type)) {
                    paramFile = paramFile.renameTo(new File(paramFile.getAttachDirectory() + File.separator + type,
                            FastMD5Utils.MD5To16(System.currentTimeMillis() + paramFile.getFileName()) + paramFile.getExtensionName()), true);
                }
                Map<String, Object> result = new HashMap<>();
                result.put("name", FastStringUtils.defaultValue(paramFile.getUploadFileName(), "").replace("@", "_"));
                result.put("length", paramFile.getFile().length());
                result.put("type", paramFile.getExtensionName());
                String fileUrl = paramFile.getUrl();
                if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
                    result.put("url", fileUrl);
                } else {
                    result.put("url", getProjectHost() + FastStringUtils.stripStart(fileUrl, "/"));
                }
                result.putAll(paramFile.getAttrs());
                result.put("http", getProjectHost());
                resultList.add(result);
            }
        }

        if (resultList.size() == 0) {
            responseJson(-1, "上传失败！未获取的文件！");
            return;
        }

        //上传文件强制使用text/html格式返回，避免浏览器弹出json下载，ie
        if (!isParamExists(PARAM_ACCPET) && getParam("__browser", "none").equalsIgnoreCase("ie")) {
            addParam(PARAM_ACCPET, "text/html");
        }

        if (resultList.size() == 1) {
            responseJson(0, "上传成功！", resultList.get(0));
        }
        responseJson(0, "上传成功！", resultList);
    }


    /**
     * 下载或查看文件
     * 参数：
     * path 文件路径 {String}
     */
    @AFastRoute({"/download", "/attach"})
    public void down() {
        setLog(FastExtConfig.getInstance().isAttachLog());
        String path = getParam("path", true);
        if (path.startsWith("http://") || path.startsWith("https://")) {
            redirect(path);
        }
        boolean disposition = getParamToBoolean("disposition", Boolean.TRUE);
        File file = new File(path);
        if (!file.exists()) {
            file = new File(FastChar.getConstant().getAttachDirectory(), path);
        }
        if (!file.exists()) {
            responseJson(-1, "文件不存在！" + file.getAbsolutePath());
        }
        responseFile(file, disposition);
    }


    /**
     * 删除附件
     * 参数：
     * path 文件路径 {String}
     */
    public void deleteAttach() {
        List<String> paths = getParamToList("path");
        for (String path : paths) {
            path = path.replace("attach/", "");
            File file = new File(path);
            if (!file.exists()) {
                file = new File(FastChar.getConstant().getAttachDirectory(), path);
            }
            file.delete();
        }
        responseJson(0, "删除成功！");
    }


    /**
     * 压缩文件
     * 参数：
     * path 需要压缩的文件路径 {Array}{String}
     */
    public void zipFile() throws IOException {
        File folderFile = new File(FastChar.getConstant().getAttachDirectory(), "zip" + System.currentTimeMillis());
        if (!folderFile.exists()) {
            if (!folderFile.mkdirs()) {
                responseJson(-1, "文件夹创建失败！" + folderFile.getAbsolutePath());
            }
        }
        List<String> paths = getParamToList("path", true);
        for (String path : paths) {
            if (path.startsWith("http://") || path.startsWith("https://")) {
                URL url = new URL(path);
                String fileName = path.substring(path.lastIndexOf("/") + 1);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                String headerField = conn.getHeaderField("content-disposition");
                if (FastStringUtils.isNotEmpty(headerField)) {
                    String regStr = "filename=\"(.*)\"";
                    Matcher matcher = Pattern.compile(regStr).matcher(headerField);
                    if (matcher.find()) {
                        fileName = matcher.group(1);
                    }
                }
                InputStream source = FastHttpURLConnectionUtils.getInputStream(path);
                if (source != null) {
                    FastFileUtils.copyInputStreamToFile(source, new File(folderFile, fileName));
                }
            } else {
                path = path.replace("attach/", "").split("\\?")[0];
                File file = new File(FastChar.getConstant().getAttachDirectory(), path);
                if (file.isDirectory()) {
                    continue;
                }
                if (file.exists()) {
                    FastFileUtils.copyFileToDirectory(file, folderFile);
                }
            }
        }

        File zipFile = FastFileUtils.zipFile(folderFile.getAbsolutePath());
        if (zipFile != null) {
            FastFileUtils.deleteDirectory(folderFile);
            responseFile(zipFile);
        } else {
            responseJson(-1, "压缩失败！");
        }
    }


    /**
     * 查看RESTful API接口文档
     */
    @AFastRoute({"document", "interface", "document.html", "interface.html", "api"})
    public void doc() throws Exception {
        File file = new File(FastChar.getPath().getWebRootPath(), "documents");
        File[] files = file.listFiles(new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
                return name.endsWith(".html");
            }
        });
        if (files == null) {
            responseJson(-1, "获取文档失败！");
            return;
        }
        List<Map<String, String>> docs = new ArrayList<>();
        for (int i = 0; i < files.length; i++) {
            File html = files[i];
            Document parse = Jsoup.parse(html, "utf-8");
            Map<String, String> doc = new HashMap<>();
            doc.put("id", FastMD5Utils.MD5(html.getName()));
            doc.put("name", parse.title());
            String docUrl = "documents/" + html.getName() + "?t=" + System.currentTimeMillis();
            doc.put("url", docUrl);
            doc.put("file", html.getName());
            doc.put("time", String.valueOf(html.lastModified()));
            docs.add(doc);
        }
        Collections.sort(docs, new Comparator<Map<String, String>>() {
            @Override
            public int compare(Map<String, String> o1, Map<String, String> o2) {
                return o1.get("name").compareTo(o2.get("name"));
            }
        });
        setRequestAttr("docs", docs);

        setRequestAttr("projectName", FastExtConfig.getInstance().getProjectTitle());
        FastHeadExtInfo themeExt = FastExtConfig.getInstance().getExtInfo("theme-color");
        if (themeExt != null) {
            setRequestAttr("themeColor", themeExt.getColorValue());
            setRequestAttr("themeLightColor", ColorUtils.getLightColor(themeExt.getColorValue(), 0.8));
        } else {
            setRequestAttr("themeColor", "#3DB6A4");
            setRequestAttr("themeLightColor", "#fde9e4");
        }


        String projectIcon = FastExtConfig.getInstance().getProjectIcon();
        if (projectIcon != null) {
            setRequestAttr("logo", projectIcon);
        }
        setRequestAttr("first", docs.get(0).get("id"));
        setRequestAttr(getParamToMap());
        setRequestAttr("http", getProjectHost());
        setParam(PARAM_ACCPET, "text/html");

        responseVelocity("fast-doc.html");
    }


    /**
     * 检查文档是否已刷新
     */
    public void doc_check() {
        setLog(false);
        long time = getParamToLong("time", true);
        String file = getParam("file", true);
        File localFile = new File(FastChar.getPath().getWebRootPath(), "/documents/" + file);
        if (localFile.exists()) {
            responseJson(0, "获取成功！", time < localFile.lastModified());
        }
        responseJson(0, "获取成功！", false);
    }


    /**
     * 生成二维码
     * 参数：
     * content 二维码内容
     * logo 中间logo
     * render 返回类型，json 或 image
     */
    public void qrCode() throws Exception {
        String content = getParam("content", true);
        String logo = getParam("logo");
        String render = getParam("render", "json");
        String fileName = FastChar.getSecurity().MD5_Encrypt(content + logo) + ".png";
        FastFile<?> fastFile = FastFile.newInstance(new File(FastChar.getConstant().getAttachDirectory(), "qrcode").getAbsolutePath(),
                fileName).setKey(FastChar.getSecurity().MD5_Encrypt(fileName));
        if (fastFile.exists()) {
            if (render.equalsIgnoreCase("json")) {
                responseJson(0, "生成成功！", fastFile.getUrl());
            } else if (render.equalsIgnoreCase("image")) {
                redirect(fastFile.getUrl());
            }
            responseText(fastFile.getUrl());
        }

        BufferedImage qrImage = ZXingUtils.makeQRCode(content, getParamToInt("margin", 2), 500, 500);
        if (qrImage == null) {
            responseJson(-1, "生成失败！");
            return;
        }
        try {
            if (StringUtils.isNotEmpty(logo) && (logo.startsWith("http://") || logo.startsWith("https://"))) {
                BufferedImage bufferedImage = Thumbnails.of(new URL(logo))
                        .forceSize(58, 58)
                        .asBufferedImage();
                ZXingUtils.insertImage(qrImage, bufferedImage, true);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (!fastFile.getFile().getParentFile().exists()) {
            if (!fastFile.getFile().getParentFile().mkdirs()) {
                responseJson(-1, "生成失败！" + fastFile.getFile().getParentFile().getAbsolutePath() + "创建失败！");
            }
        }
        ImageIO.write(qrImage, "jpg", fastFile.getFile());
        if (render.equalsIgnoreCase("json")) {
            responseJson(0, "生成成功！", fastFile.getUrl());
        } else if (render.equalsIgnoreCase("image")) {
            redirect(fastFile.getUrl());
        }
        responseText(fastFile.getUrl());
    }


    /**
     * 系统的监控信息
     */
    @AFastSession
    public void monitor() {
        setLog(false);

        SystemInfo systemInfo = new SystemInfo();
        HardwareAbstractionLayer hal = systemInfo.getHardware();
        CentralProcessor processor = hal.getProcessor();
        long[] prevTicks = processor.getSystemCpuLoadTicks();
        Util.sleep(1000);
        long[] ticks = processor.getSystemCpuLoadTicks();
        long nice = ticks[TickType.NICE.getIndex()] - prevTicks[TickType.NICE.getIndex()];
        long irq = ticks[TickType.IRQ.getIndex()] - prevTicks[TickType.IRQ.getIndex()];
        long softirq = ticks[TickType.SOFTIRQ.getIndex()] - prevTicks[TickType.SOFTIRQ.getIndex()];
        long steal = ticks[TickType.STEAL.getIndex()] - prevTicks[TickType.STEAL.getIndex()];
        long cSys = ticks[TickType.SYSTEM.getIndex()] - prevTicks[TickType.SYSTEM.getIndex()];
        long user = ticks[TickType.USER.getIndex()] - prevTicks[TickType.USER.getIndex()];
        long iowait = ticks[TickType.IOWAIT.getIndex()] - prevTicks[TickType.IOWAIT.getIndex()];
        long idle = ticks[TickType.IDLE.getIndex()] - prevTicks[TickType.IDLE.getIndex()];
        long totalCpu = user + nice + cSys + idle + iowait + irq + softirq + steal;


        List<Object> data = new ArrayList<>();
        List<Object> desc = new ArrayList<>();

        Map<String, Object> cpuInfo = new LinkedHashMap<>();
        cpuInfo.put("type", "cpu");
        cpuInfo.put("cpuCount", processor.getLogicalProcessorCount());
        cpuInfo.put("sys", FastNumberUtils.formatToDouble((cSys * 1.0 / totalCpu) * 100, 2) + "%");
        cpuInfo.put("used", FastNumberUtils.formatToDouble((user * 1.0 / totalCpu) * 100, 2) + "%");
        double cpuTotal = FastNumberUtils.formatToDouble(((user + cSys) * 1.0 / totalCpu) * 100, 2);
        cpuInfo.put("total", cpuTotal + "%");
        cpuInfo.put("min", 0);
        cpuInfo.put("max", 100);
        cpuInfo.put("value", cpuTotal);
        cpuInfo.put("unit", "%");

        cpuInfo.put("alert", cpuTotal > 80);

        Map<String, Object> cpuDesc = new LinkedHashMap<>();
        cpuDesc.put("title", "CPU监控信息");
        cpuDesc.put("cpuCount", "CPU核数");
        cpuDesc.put("sys", "系统使用率");
        cpuDesc.put("used", "用户使用率");
        cpuDesc.put("total", "总的使用率");


        data.add(cpuInfo);
        desc.add(cpuDesc);


        GlobalMemory memory = hal.getMemory();
        Map<String, Object> memInf = new LinkedHashMap<>();
        memInf.put("type", "memory");
        memInf.put("total", FastNumberUtils.toByteUnit(memory.getTotal()));
        long memUsed = memory.getTotal() - memory.getAvailable();
        memInf.put("used", FastNumberUtils.toByteUnit(memUsed));
        memInf.put("free", FastNumberUtils.toByteUnit(memory.getAvailable()));
        double memberUsage = FastNumberUtils.formatToDouble((memUsed * 1.0 / memory.getTotal()) * 100, 2);
        memInf.put("usage", memberUsage + "%");
        memInf.put("alert", memberUsage > 80);

        memInf.put("min", 0);
        memInf.put("max", memory.getTotal());
        memInf.put("value", memUsed);


        Map<String, Object> memDesc = new LinkedHashMap<>();
        memDesc.put("title", "内存监控信息");
        memDesc.put("total", "内存大小");
        memDesc.put("used", "已使用");
        memDesc.put("free", "剩余内存");
        memDesc.put("usage", "已使用率");

        data.add(memInf);
        desc.add(memDesc);

        Runtime r = Runtime.getRuntime();
        Map<String, Object> jvmInfo = new LinkedHashMap<>();
        jvmInfo.put("type", "jvm");
        jvmInfo.put("total", FastNumberUtils.toByteUnit(r.totalMemory()));
        jvmInfo.put("free", FastNumberUtils.toByteUnit(r.freeMemory()));
        jvmInfo.put("maxTotal", FastNumberUtils.toByteUnit(r.maxMemory()));
        jvmInfo.put("used", FastNumberUtils.toByteUnit(r.totalMemory() - r.freeMemory()));
        jvmInfo.put("path", System.getProperty("java.home"));

        jvmInfo.put("min", 0);
        jvmInfo.put("max", r.totalMemory());
        jvmInfo.put("value", r.totalMemory() - r.freeMemory());

        Map<String, Object> jvmDesc = new LinkedHashMap<>();
        jvmDesc.put("title", "Java虚拟机信息");
        jvmDesc.put("path", "所在位置");
        jvmDesc.put("maxTotal", "最大内存");
        jvmDesc.put("total", "可用内存");
        jvmDesc.put("free", "剩余内存");
        jvmDesc.put("used", "已使用");

        data.add(jvmInfo);
        desc.add(jvmDesc);

        FileSystem fileSystem = systemInfo.getOperatingSystem().getFileSystem();
        List<OSFileStore> fsArray = fileSystem.getFileStores();
        for (OSFileStore osFileStore : fsArray) {
            if (osFileStore.getMount().startsWith("/private")) {
                continue;
            }
            long diskTotal = osFileStore.getTotalSpace();
            long diskFree = osFileStore.getUsableSpace();
            long diskUsed = diskTotal - diskFree;
            Map<String, Object> diskInfo = new LinkedHashMap<>();
            jvmInfo.put("type", "disk_" + osFileStore.getMount());
            diskInfo.put("dir", osFileStore.getMount());
            diskInfo.put("name", osFileStore.getName());
            diskInfo.put("total", FastNumberUtils.toByteUnit(diskTotal));
            diskInfo.put("used", FastNumberUtils.toByteUnit(diskUsed));
            diskInfo.put("free", FastNumberUtils.toByteUnit(diskFree));
            double diskUsage = FastNumberUtils.formatToDouble((diskUsed * 1.0 / diskTotal) * 100, 2);
            diskInfo.put("usage", diskUsage + "%");
            diskInfo.put("alert", diskUsage > 80);

            diskInfo.put("min", 0);
            diskInfo.put("max", diskTotal);
            diskInfo.put("value", diskUsed);


            Map<String, Object> diskDesc = new LinkedHashMap<>();
            diskDesc.put("title", "磁盘信息（" + osFileStore.getName() + "）");
            diskDesc.put("dir", "磁盘位置");
            diskDesc.put("name", "磁盘名称");
            diskDesc.put("total", "磁盘大小");
            diskDesc.put("free", "剩余大小");
            diskDesc.put("used", "已使用");
            diskDesc.put("usage", "已使用率");

            data.add(diskInfo);
            desc.add(diskDesc);
        }
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("data", data);
        dataMap.put("desc", desc);
        responseJson(0, "获取成功！", dataMap);
    }


    /**
     * 统计待处理的问题
     */
    public void countReport() {
        int reportCount = ExtBugReportEntity.newInstance()
                .set("reportState", ExtBugReportEntity.ExtBugReportStateEnum.待处理.ordinal())
                .count();
        responseJson(0, "统计成功！", reportCount);
    }


    /**
     * 下载系统配置文件
     */
    @AFastSession
    public void downSystemConfig() throws Exception {
        List<ExtSystemConfigEntity> list = ExtSystemConfigEntity.getInstance().getList();
        String versionStr = "v1_0";
        FastHeadExtInfo version = FastExtConfig.getInstance().getExtInfo("version");
        if (version != null) {
            versionStr = version.getMapWrap().getString("desc", "v1.0").toLowerCase().replace(".", "_");
        }
        File configFile = new File(FastChar.getPath().getWebRootPath(), "system_config_" + versionStr + ".data");

        Map<String, Object> data = new HashMap<>();
        data.put("entity", ExtSystemConfigEntity.class.getName());
        data.put("data", FastChar.getJson().toJson(list));

        byte[] serialize = FastSerializeUtils.serialize(data);
        FastFileUtils.writeByteArrayToFile(configFile, serialize);

        responseJson(0, "获取成功！", FastFile.newInstance(configFile).getUrl());
    }

    /**
     * 加载系统配置文件
     */
    @AFastSession
    @SuppressWarnings("unchecked")
    public void loadSystemConfig() throws Exception {
        FastFile<?> paramFile = getParamFile();
        byte[] bytes = FastFileUtils.readFileToByteArray(paramFile.getFile());
        int count = 0;
        Map<String, Object> dataMap = (Map<String, Object>) FastSerializeUtils.deserialize(bytes);

        if (dataMap != null) {
            ExtSystemConfigEntity.getInstance().deleteAll();

            FastMapWrap fastMapWrap = FastMapWrap.newInstance(dataMap);
            String entity = fastMapWrap.getString("entity");
            String dataJson = fastMapWrap.getString("data");
            List<?> data = FastChar.getJson().fromJson(dataJson, List.class);
            for (Object datum : data) {
                FastEntity<?> configEntity = FastClassUtils.newInstance(entity);
                configEntity.setAll((Map<String, Object>) datum);
                if (configEntity.save()) {
                    count++;
                }
            }
        }
        responseJson(0, "配置文件加载成功！共" + count + "条配置！");
    }


    /**
     * 更新所有表格的权限编号
     */
    @AFastSession
    public void updateAllLayer() {
        int size = 0;
        FastDatabases databases = FastChar.getDatabases();
        for (FastDatabaseInfo databaseInfo : databases.getAll()) {
            if (!databaseInfo.isFetchDatabaseInfo()) {
                continue;
            }
            List<FastExtLayerHelper.LayerMap> layerMaps = FastExtLayerHelper.buildLayerMap(databaseInfo);
            for (FastExtLayerHelper.LayerMap layerMap : layerMaps) {
                size += layerMap.toAllTableNameList().size();
                FastExtLayerHelper.updateAllLayerValue(layerMap);
            }
        }
        responseJson(0, "更新成功！共更新了" + size + "张表格！");
    }


    /**
     * 更新所有表格绑定的相同字段值
     */
    @AFastSession
    public void updateAllSame() {
        int size = 0;
        FastDatabases databases = FastChar.getDatabases();
        for (FastDatabaseInfo databaseInfo : databases.getAll()) {
            if (!databaseInfo.isFetchDatabaseInfo()) {
                continue;
            }
            List<FastExtLayerHelper.LayerMap> layerMaps = FastExtLayerHelper.buildLayerMap(databaseInfo);
            for (FastExtLayerHelper.LayerMap layerMap : layerMaps) {
                size += FastExtSameHelper.updateSameColumn(layerMap);
            }
        }
        responseJson(0, "更新成功！共更新了" + size + "张表格！");
    }


    /**
     * 清除当前ExtDefaultAction产生的缓存
     */
    public void clearCache() {
        FastChar.getCache().delete(ExtDefaultAction.class.getName());
        responseJson(0, "清除成功！");
    }


    /**
     * 预览office文件
     * 参数：
     * url 文件地址
     */
    public void officeViewer() throws Exception {
        String url = getParam("url", true);
        if (FastStringUtils.isEmpty(url)) {
            response404("文件地址无效！");
        }
        String[] urlArray = url.split("@");
        url = urlArray[0];
        String urlHead = url.split("\\?")[0];
        String fileName = new File(new URL(urlHead).getPath()).getName();
        String fileName2 = fileName;
        if (urlArray.length > 1) {
            fileName2 = urlArray[1];
        }


        String ossUrl = url;
        if (FastStringUtils.isNotEmpty(FastExtConfig.getInstance().getOnlyOfficeJs())) {
            Map<String, Object> fileMap = new HashMap<>();
            String projectHost = getProjectHost();
            if (projectHost.startsWith("http://localhost") || projectHost.startsWith("http://192.168")) {
                responseText("OnlyOffice不支持本地预览，请发布到可公网访问的线上服务器预览！");
            }
            String wrapUrl = projectHost + "openStream/" + FastRequestUtils.encodeUrl(ossUrl);
            fileMap.put("code", FastMD5Utils.MD5(wrapUrl));
            fileMap.put("title", fileName2);
            fileMap.put("url", wrapUrl);
            fileMap.put("documentType", "word");
            if (FastFileUtils.isExcelFile(fileName)) {
                fileMap.put("documentType", "cell");
            } else if (FastFileUtils.isPPTFile(fileName)) {
                fileMap.put("documentType", "slide");
            }
            setRequestAttr("file", fileMap);
            setRequestAttr("onlyOfficeJs", FastExtConfig.getInstance().getOnlyOfficeJs());

            responseVelocity("/base/onlyoffice/index.vm");
        } else {
            if (FastStringUtils.isNotEmpty(FastFileUtils.getExtension(fileName2))) {
                ossUrl = FastFile.newInstance(new URL(url), fileName2).getUrl();
            } else {
                ossUrl = FastFile.newInstance(new URL(url), fileName).getUrl();
            }
            redirect("https://view.officeapps.live.com/op/view.aspx?src=" + ossUrl);
        }
    }


    /**
     * 打开地址文件流
     * 参数：
     * url 文件地址
     */
    public void openStream() {
        String url = getParam("url");
        if (FastStringUtils.isEmpty(url)) {
            url = getUrlParam(0);
        }
        if (FastStringUtils.isEmpty(url)) {
            responseStream(new ByteArrayInputStream("文件打开失败！为传入文件地址！".getBytes(StandardCharsets.UTF_8)), "text/plan");
        }
        String realUrl = FastRequestUtils.decodeUrl(url);
        if (FastStringUtils.isNotEmpty(realUrl)) {
            InputStream inputStream = FastHttpURLConnectionUtils.getInputStream(realUrl);
            if (inputStream != null) {
                String pureUrl = realUrl.split("\\?")[0];
                String fileName = pureUrl.substring(pureUrl.lastIndexOf("/") + 1);
                setResponseHeader("Accept-Ranges", "bytes");
                setResponseHeader("Content-disposition", "attachment; " + FastRequestUtils.encodeFileName(getRequest(), fileName));
                responseStream(inputStream, FastFileUtils.guessMimeType(realUrl));
            }
        }
        responseStream(new ByteArrayInputStream("文件打开失败！".getBytes(StandardCharsets.UTF_8)), "text/plan");
    }


    /**
     * 站内全局搜索
     * 参数：
     * page 页数
     * pageSize 每页大小
     * type 搜索类型 0：系统菜单 1：系统数据
     * key 搜索关键字
     */
    @AFastSession
    public void globalSearch() throws Exception {
        ExtManagerEntity managerEntity = ExtManagerEntity.getSession(this);

        FastExtMenuXmlParser fastMenuXmlParser = FastExtMenuXmlParser.newInstance();

        int type = getParamToInt("type", -1);
        String key = getParam("key");
        int pageSize = getParamToInt("pageSize", 100);

        FastPage<Object> pageData = new FastPage<>();
        pageData.setList(new ArrayList<>());
        pageData.setTotalPage(1);
        pageData.setPage(1);

        if (FastStringUtils.isNotEmpty(key)) {
            if (type == -1 || type == 0) {//搜索系统菜单

                List<String> keys = new ArrayList<>(Arrays.asList(key.split(" ")));

                List<FastEntities.EntityInfo> entityInfos = FastChar.getEntities().getEntityInfos();
                for (FastEntities.EntityInfo entityInfo : entityInfos) {

                    for (String inKey : keys) {
                        if (entityInfo.getTableName().equalsIgnoreCase(inKey)) {
                            keys.add(entityInfo.getTargetClass().getSimpleName());
                            break;
                        }
                    }
                }

                FastMenuInfo menus = fastMenuXmlParser.getMenus();
                ;
                List<FastMenuInfo> menuInfoList = toPlanMenu(menus);

                List<Object> searchData = new ArrayList<>();
                for (FastMenuInfo menuInfo : menuInfoList) {
                    if (!menuInfo.getMapWrap().getBoolean("leaf", false)) {
                        continue;
                    }
                    for (String inKey : keys) {
                        if (menuInfo.getMapWrap().getString("searchKey", menuInfo.getText()).contains(inKey)
                                || menuInfo.getMapWrap().getString("method").contains(inKey)) {
                            menuInfo.put("type", 0);
                            searchData.add(menuInfo);
                            break;
                        }
                    }
                }
                pageData.getList().addAll(searchData);
            }


            if (type == -1 || type == 1) {//搜索系统数据

                String[] entityCodes = getParamToArray("entityCode");

                Map<String, List<String>> databaseMap = new HashMap<>(16);

                List<FastEntities.EntityInfo> entityInfos = FastChar.getEntities().getEntityInfos();
                for (FastEntities.EntityInfo entityInfo : entityInfos) {
                    if (!FastExtEntity.class.isAssignableFrom(entityInfo.getTargetClass())) {
                        continue;
                    }
                    FastEntity<?> fastEntity = FastChar.getOverrides().newInstance(entityInfo.getTargetClass());
                    if (fastEntity == null) {
                        continue;
                    }

                    FastTableInfo<?> table = fastEntity.getTable();
                    if (table == null) {
                        continue;
                    }
                    if (!table.getMapWrap().getBoolean("search", true)) {
                        continue;
                    }

                    if (!table.isExist()) {
                        continue;
                    }

                    if (!(fastEntity instanceof FastExtEntity)) {
                        continue;
                    }

                    FastExtEntity<?> extEntity = (FastExtEntity<?>) fastEntity;
                    if (extEntity.getPrimaries().isEmpty()) {
                        continue;
                    }

                    String entityCode = extEntity.getEntityCode();
                    if (FastStringUtils.isEmpty(entityCode)) {
                        continue;
                    }

                    if (entityCodes.length > 0 && !FastArrayUtils.contains(entityCodes, entityCode)) {
                        continue;
                    }

                    String database = FastStringUtils.defaultValue(table.getDatabase(), "Default");
                    List<String> unionJoin = databaseMap.get(database);
                    if (unionJoin == null) {
                        unionJoin = new ArrayList<>();
                        unionJoin.add("( select 'type','entityCode','entityInfo','dataId','dataIdName','searchKey','menuIcon' from " + table.getName() + " where 1=0 ) ");
                        databaseMap.put(database, unionJoin);
                    }

                    List<String> whereFields = new ArrayList<>();
                    List<String> selectFields = new ArrayList<>();
                    for (FastColumnInfo<?> column : fastEntity.getColumns()) {

                        if (column instanceof FastExtColumnInfo) {
                            FastExtColumnInfo extColumnInfo = (FastExtColumnInfo) column;
                            if (extColumnInfo.isSearch()) {
                                whereFields.add(column.getName());

                                if (FastType.isStringType(extColumnInfo.getType())
                                        && !FastType.isBigStringType(extColumnInfo.getType())) {
                                    selectFields.add(column.getName());
                                }
                            }
                        }
                    }
                    if (whereFields.isEmpty()) {
                        continue;
                    }
                    String escapeRegexChar = FastStringUtils.escapeRegexChar(key);
                    List<String> whereFieldSqlList = new ArrayList<>();
                    for (String searchKey : whereFields) {
                        if (searchKey.equalsIgnoreCase("''")) {
                            continue;
                        }
                        whereFieldSqlList.add(searchKey + " regexp '" + escapeRegexChar.replace(" ", "|") + "'");
                    }

                    String dataIdName = extEntity.getPrimaries().iterator().next().getName();
                    String entityInfoValue = extEntity.getTableDetails();
                    if (FastStringUtils.isEmpty(entityInfoValue)) {
                        entityInfoValue = extEntity.getTable().getComment();
                    }

                    if (FastStringUtils.isEmpty(entityInfoValue)) {
                        entityInfoValue = "系统数据";
                    }

                    String selectField = selectFields.get(0);
                    if (selectFields.size() > 1) {
                        selectField = "concat_ws(' '," + FastStringUtils.join(selectFields, ",") + ")";
                    }

                    String menuIcon = "icons/icon_system.svg";
                    FastMenuInfo tableMenu = FastExtEntities.getTableMenu(fastMenuXmlParser, entityCode);
                    if (tableMenu != null) {
                        menuIcon = tableMenu.getIcon();
                    }

                    extEntity.pullLayer(managerEntity);

                    String inSqlStr = " select 1,'" + entityCode + "','" + entityInfoValue
                            + "'," + dataIdName
                            + ",'" + dataIdName
                            + "'," + selectField
                            + " ,'" + menuIcon + "' " +
                            " from " + extEntity.getTableName()
                            + " as t where 1=1 and ( " + FastStringUtils.join(whereFieldSqlList, " or ") + " ) ";

                    FastExtEntity.ShowListSqlAdapter showListSqlAdapter = FastChar.getOverrides().singleInstance(false, FastExtEntity.ShowListSqlAdapter.class);
                    if (showListSqlAdapter != null) {
                        inSqlStr = showListSqlAdapter.convertSql(extEntity, inSqlStr);
                    }

                    FastSql fastSql = extEntity.getFastData().getFastSql();
                    FastSqlInfo sqlInfo = FastSqlTool.appendWhere(fastSql, inSqlStr, extEntity);

                    String sqlStr = " ( " + fastSql.buildPageSql(sqlInfo.toStaticSql(), 1, pageSize) + " ) ";

                    unionJoin.add(sqlStr);
                }

                for (Map.Entry<String, List<String>> stringListEntry : databaseMap.entrySet()) {
                    String finalSqlStr = "select * from ( " + FastStringUtils.join(stringListEntry.getValue(), " UNION ALL ")
                            + " )  as t ";
                    List<FastEntity<?>> select = FastChar.getDB().select(finalSqlStr);
                    for (FastEntity<?> fastEntity : select) {

                        String entitySearchKey = fastEntity.getString("searchKey");
                        if (FastStringUtils.isEmpty(entitySearchKey)) {
                            entitySearchKey = "数据编号-" + fastEntity.getString("dataId");
                        }
                        fastEntity.put("icon", "icon?path=icons/icon_data.svg&color=" + FastExtConfig.getInstance().getExtInfo("theme-color").getColorValue());
                        String searchKey = "<img alt='' height='20' src='" + fastEntity.getString("icon") + "'/>&nbsp;" + Jsoup.parse(entitySearchKey).text();
                        fastEntity.set("searchKey", searchKey);
                    }
                    pageData.getList().addAll(select);
                }
            }
        }

        pageData.setTotalRow(pageData.getList().size());
        responseJson(pageData);
    }


    private List<FastMenuInfo> toPlanMenu(FastMenuInfo parent) {
        List<FastMenuInfo> list = new ArrayList<>();

        for (FastMenuInfo child : parent.getChildren()) {
            String searchKey = "<img alt='' height='20' src='" + child.getIcon() + "'/>&nbsp;" + child.getText();
            if (FastStringUtils.isEmpty(parent.getText())) {
                child.put("searchKey", searchKey);
            } else {
                child.put("searchKey", parent.getMapWrap().getString("searchKey", parent.getText()) + "&nbsp;>>&nbsp;" + searchKey);
            }
            FastMenuInfo copy = new FastMenuInfo();
            copy.putAll(child);
            copy.remove("children");
            list.add(copy);

            list.addAll(toPlanMenu(child));
        }
        return list;
    }


    /**
     * 将原数据保存在内存缓存中
     * 参数：
     * source 原数据
     */
    public void saveToCache() {
        String source = getParam("source", true);
        String key = FastExtHelper.saveCache(source);
        if (FastStringUtils.isNotEmpty(key)) {
            responseJson(0, "保存成功！", key);
        }
        responseJson(-1, "保存失败！");
    }


}
