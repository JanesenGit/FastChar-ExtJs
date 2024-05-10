package com.fastchar.extjs.action;

import com.fastchar.annotation.AFastCache;
import com.fastchar.annotation.AFastRoute;
import com.fastchar.core.*;
import com.fastchar.database.FastDatabases;
import com.fastchar.database.info.FastDatabaseInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.FastExtHelper;
import com.fastchar.extjs.annotation.AFastSecurityResponse;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.extjs.annotation.AFastToken;
import com.fastchar.extjs.core.FastExtLayerHelper;
import com.fastchar.extjs.core.FastExtLayerType;
import com.fastchar.extjs.core.FastExtSameHelper;
import com.fastchar.extjs.core.FastExtSign;
import com.fastchar.extjs.core.appjs.FastExtAppJs;
import com.fastchar.extjs.core.configjson.FastExtConfigJson;
import com.fastchar.extjs.core.enums.FastEnumInfo;
import com.fastchar.extjs.databoard.FastDataboardDataInfo;
import com.fastchar.extjs.databoard.FastDataboardJob;
import com.fastchar.extjs.databoard.IFastDataboardData;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtSystemConfigEntity;
import com.fastchar.extjs.entity.ExtSystemDataEntity;
import com.fastchar.extjs.interfaces.IFastExtEnum;
import com.fastchar.extjs.interfaces.IFastManagerListener;
import com.fastchar.extjs.out.FastExtOutCaptcha;
import com.fastchar.extjs.utils.ColorUtils;
import com.fastchar.extjs.utils.ExtFileUtils;
import com.fastchar.extjs.utils.OnlyOfficeUtils;
import com.fastchar.extjs.utils.ZXingUtils;
import com.fastchar.utils.*;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.commons.lang3.ClassUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
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
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.List;
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
        if (!getUrlParams().isEmpty()) {
            String firstParams = getUrlParam(0);
            if (FastStringUtils.isNotEmpty(firstParams)) {
                //苹果Universal Links的验证文件
                if (firstParams.equals("apple-app-site-association")) {
                    responseJson(new File(FastChar.getPath().getWebRootPath(), "apple-app-site-association"));
                }
            }
        }
        String userAgent = getUserAgent();

        if (FastStringUtils.isEmpty(userAgent) || !userAgent.toLowerCase().contains("mozilla")) {
            //非浏览器访问
            response502("非法访问！");
        }

        FastExtConfigJson.getInstance().loadConfigJson();


        Map<String, Object> holders = new HashMap<>();
        holders.put("http", getProjectHost());
        holders.put("themeColor", FastExtConfigJson.getInstance().getThemeColor());
        holders.put("version", FastExtConfigJson.getInstance().getVersion());
        holders.put("main", getParam("main", ""));
        holders.put("role", getParam("role", "manager"));

        Map<String, Object> allParam = getParamToMap();
        holders.put("params", FastChar.getJson().toJson(allParam));


        InputStream inputStream = FastChar.getWebResources().getResource("fastchar-extjs-system.html").getInputStream();
        String indexHtml = FastStringUtils.join(FastFileUtils.readLines(inputStream, StandardCharsets.UTF_8), "\n");

        indexHtml = ExtFileUtils.replacePlaceholder(holders, indexHtml);
        responseHtml(indexHtml);
    }

    /**
     * 进入系统管理员权限编辑页面
     * 参数：
     * 无
     */
    @AFastSession
    public void power() throws Exception {
        setSession("power", Boolean.TRUE);
        index();
    }


    private List<Object> getSysSecurity() {
        List<String> scripts = new ArrayList<>();

        FastExtSign loginExtSign = new FastExtSign();
        loginExtSign.initKey();

        String securityCode = getParam("SecurityCode", true);

        String loginApiKey = FastMD5Utils.MD5To16(FastStringUtils.buildUUID());
        setSession("LoginPrivateKey", loginExtSign.getSignPrivateKey());
        setSession("LoginApiKey", loginApiKey);

        FastExtSign.PublicKeyInfo loginSignPublicKey = loginExtSign.getSignPublicKey();

        scripts.add("window.__a1" + securityCode + "=function(){return '" + loginSignPublicKey.getKey() + "';}");
        scripts.add("window.__a2" + securityCode + "=function(){return [" + FastStringUtils.join(loginSignPublicKey.getPoints(), ",") + "];}");
        scripts.add("window.__a3" + securityCode + "=function(){return '" + loginApiKey + "';}");


        FastExtSign tokenExtSign = new FastExtSign();
        tokenExtSign.initKey();

        String tokenApiKey = FastMD5Utils.MD5To16(FastStringUtils.buildUUID());
        setSession("TokenPrivateKey", tokenExtSign.getSignPrivateKey());
        setSession("TokenApiKey", tokenApiKey);

        FastExtSign.PublicKeyInfo tokenSignPublicKey = tokenExtSign.getSignPublicKey();
        scripts.add("window.__b1" + securityCode + "=function(){return '" + tokenSignPublicKey.getKey() + "';}");
        scripts.add("window.__b2" + securityCode + "=function(){return [" + FastStringUtils.join(tokenSignPublicKey.getPoints(), ",") + "];}");
        scripts.add("window.__b3" + securityCode + "=function(){return '" + tokenApiKey + "';}");


        String ResponseAESPassword = FastMD5Utils.MD5To16(FastStringUtils.buildUUID());
        setSession("ResponseAESPassword", ResponseAESPassword);

        FastExtSign responseExtSign = new FastExtSign();
        responseExtSign.initKey();

        String responseAESKey = FastRSAUtils.encryptByPublicKey(responseExtSign.getPublicKey(), ResponseAESPassword);
        scripts.add("window.__c1" + securityCode + "=function(){return '" + responseAESKey.replace("\r", "").replace("\n", "") + "';}");
        scripts.add("window.__c2" + securityCode + "=function(){return '" + responseExtSign.getPrivateKey() + "';}");


        List<Object> scriptArray = new ArrayList<>();
        for (String script : scripts) {
            Map<String, String> scriptObj = new HashMap<>();
            scriptObj.put("text", script);
            scriptArray.add(scriptObj);
        }
        if (!FastChar.getConstant().isDebug()) {
            Map<String, String> scriptObj = new HashMap<>();
            scriptObj.put("src", "base/system/fastchar-extjs-safe.js");
            scriptArray.add(scriptObj);
        }
        return scriptArray;
    }


    /**
     * 获取系统*.config.json的配置信息
     * 参数：
     * 无
     */
    public void showSysConfig() throws Exception {

        String role = getParam("role", "manager");
        String errorMessage = null;

        boolean hasLogin = false;
        boolean continueInfo = true;
        if (role.equalsIgnoreCase("manager")) {
            ExtManagerEntity manager = ExtManagerEntity.getSession(this);
            if (manager != null) {
                errorMessage = manager.getString("responsePageMessage");
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
        }

        Map<String, Object> configObj = new HashMap<>();
        configObj.put("debug", FastChar.getConstant().isDebug());
        configObj.put("local", getProjectHost().startsWith("http://localhost"));
        configObj.put("pwd", FastExtConfig.getInstance().isManagerPasswordEncrypt());
        configObj.put("system-error-message", errorMessage);
        configObj.put("system-login", hasLogin);
        configObj.put("api-host", getProjectHost());
        configObj.put("os", System.getProperty("os.name") + " ( " + System.getProperty("os.arch") + " ) " + System.getProperty("os.version"));
        configObj.put("java", "Java " + System.getProperty("java.version") + " " + System.getProperty("sun.arch.data.model") + "位");
        configObj.put("host", FastNetworkUtils.getLocalIP());

        List<String> infos = new ArrayList<>();
        for (FastDatabaseInfo databaseInfo : FastChar.getDatabases().getAll()) {
            if (!databaseInfo.isFetchDatabaseInfo()) {
                continue;
            }
            infos.add(databaseInfo.getProduct() + " " + databaseInfo.getVersion());
        }
        configObj.put("db", FastStringUtils.join(infos, "/"));
        configObj.put("db-pool", FastChar.getValues().<String>get("jdbcPool"));
        if (FastChar.getServletContext() != null) {
            configObj.put("server", FastChar.getServletContext().getServerInfo());
        }

        configObj.put("fastchar", "FastChar " + FastConstant.FAST_CHAR_VERSION);
        configObj.put("catalina", System.getProperty("catalina.home"));
        configObj.put("root", FastChar.getPath().getWebRootPath());
        configObj.put("start-time", FastDateUtils.format(new Date(FastChar.getConstant().getBeginInitTime()), "yyyy-MM-dd HH:mm:ss"));


        Boolean power = getSession("power");
        if (power != null) {
            configObj.put("power_setting", power);
            removeSession("power");
        }

        configObj.put("script", getSysSecurity());

        List<Object> configs = new ArrayList<>(FastExtConfigJson.getInstance().getConfigJson());
        configs.add(configObj);
        configs.add(ExtSystemConfigEntity.getInstance().getExtConfigsToMap(-1, "System"));
        configs.add(FastExtConfig.getInstance().getInjectConfigJson());


        responseJson(0, "获取成功！", configs);
    }


    /**
     * 获取系统信息
     * 参数：
     * 无
     */
    @AFastSession
    @AFastToken
    @AFastSecurityResponse
    public void showSysInfo() throws Exception {
        ExtManagerEntity session = ExtManagerEntity.getSession(this);

        List<FastResource> appJs = FastExtAppJs.getInstance().getAppJs();
        List<String> appJsUrls = new ArrayList<>();
        for (FastResource resource : appJs) {
            appJsUrls.add(parseFilePathToUrl(resource));
        }

        Map<String, Object> data = new HashMap<>();
        data.put("app", appJsUrls);
        data.put("http", getProjectHost());
        data.put("layer", FastExtConfig.getInstance().getLayerType() != FastExtLayerType.None);
        data.put("entities", FastExtConfig.getInstance().getExtEntities().getEntityInfo());

        data.put("maxMemory", Runtime.getRuntime().maxMemory());


        data.put("noticeListener", FastExtConfig.getInstance().isNoticeListener());
        data.put("manager", session);
        data.put("needInit", false);
        data.put("databoard", !FastChar.getOverrides().newInstances(false, IFastDataboardData.class).isEmpty());
        data.put("oss", FastChar.getValues().get("oss"));
        data.put("ossHosts", FastChar.getValues().get("ossHosts"));


        int init = FastExtConfigJson.getInstance().getInit();
        boolean needInit = FastNumberUtils.formatToInt(session.getString("initCode", "")) < init;
        data.put("needInit", needInit);
        if (needInit) {
            session.set("initCode", init);
            session.update();
        }

        responseJson(0, "获取成功！", data);
    }


    private String parseFilePathToUrl(FastResource resource) {
        String replace = FastChar.getWebResources().getRelativePath(resource);
        if (FastFileUtils.isHttpUrl(replace)) {
            return appendFileTime(replace, resource);
        } else if (new File(replace).exists()) {
            //可能位于系统其他非web项目的目录中的绝对路径
            return getProjectHost() + "attach?disposition=false&path=" + replace;
        } else {
            return getProjectHost() + appendFileTime(FastStringUtils.strip(replace, "/"), resource);
        }
    }

    private String appendFileTime(String source, FastResource file) {
        if (source.contains("?")) {
            return source + "&t=" + file.lastModified();
        }
        return source + "?t=" + file.lastModified();
    }


    /**
     * 心跳接口
     */
    public void idle() {
        setLog(false);
        responseJson(0, "成功！");
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

            FastResource iconResource = FastChar.getWebResources().getResource(path);
            if (iconResource != null) {
                if (FastStringUtils.isNotEmpty(color)) {
                    if (ColorUtils.isRgbColor(color)) {
                        Color colorObj = ColorUtils.RgbToColor(color);
                        if (colorObj != null) {
                            color = ColorUtils.ColorToHex(colorObj);
                        }
                    }
                    color = color.replace("#", "");
                    if (iconResource.getName().toLowerCase().endsWith(".svg")) {
                        File colorFile = Paths.get(FastChar.getPath().getTempDir(), FastMD5Utils.MD5To16(color), iconResource.getName()).normalize().toFile();
                        if (colorFile.exists()) {
                            responseFile(colorFile);
                            return;
                        }
                        String svgContent = FastStringUtils.join(FastFileUtils.readLines(iconResource.getInputStream(), StandardCharsets.UTF_8), "\n");
                        String reg = "fill=\"#([0-9a-zA-Z]{6,8})\"";

                        String replaceAll = svgContent.replaceAll(reg, "fill=\"#" + color + "\"");
                        FastFileUtils.writeStringToFile(colorFile, replaceAll);
                        responseFile(colorFile);
                    }
                }
                responseResource(iconResource);
            } else {
                responseText("文件不存在！");
            }
        } catch (Exception e) {
            FastChar.getLogger().error(ExtDefaultAction.class, e);
        }
    }


    /**
     * 获得图形验证码
     */
    public FastExtOutCaptcha showCaptcha() {
        return FastChar.getOverrides().newInstance(FastExtOutCaptcha.class).setStatus(200);
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
            enums.sort(Comparator.comparingInt(o -> o.getMapWrap().getInt("index")));
            enums.removeAll(waitRemove);
            responseJson(0, "获取成功！", enums);
        } else {
            responseJson(-1, "获取失败！枚举'" + enumName + "'不存在！");
        }
    }


    /**
     * 上传文件
     * 参数：
     * type 文件保存的子目录名 {String}
     * url 网络文件地址 {Array}【可选】
     * file 上传的文件流 {Array} {File}
     * [file_param].width 缩放图片宽度【file_param 为：文件流的参数名，例如参数名为：user_head_img 那么此时缩放宽度的参数名为：user_head_img.width 下同】
     * [file_param].height 缩放图片高度
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
            if (FastFileUtils.isHttpUrl(fileUrl)) {
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
                if (FastFileUtils.isHttpUrl(fileUrl)) {
                    result.put("url", fileUrl);
                } else {
                    result.put("url", getProjectHost() + FastStringUtils.stripStart(fileUrl, "/"));
                }
                result.putAll(paramFile.getAttrs());
                result.put("http", getProjectHost());
                resultList.add(result);
            }
        }

        if (resultList.isEmpty()) {
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
        if (FastFileUtils.isHttpUrl(path)) {
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
            if (FastFileUtils.isHttpUrl(path)) {
                continue;
            }
            File file = new File(path);
            if (!file.exists()) {
                file = new File(FastChar.getConstant().getAttachDirectory(), path);
            }
            if (!file.delete()) {
                responseJson(-1, "删除失败！");
            }
        }
        responseJson(0, "删除成功！");
    }


    /**
     * 压缩文件
     * 参数：
     * path 需要压缩的文件路径 {Array}{String}
     */
    public void zipFile() throws Exception {
        File folderFile = new File(FastChar.getConstant().getAttachDirectory(), "zip" + System.currentTimeMillis());
        if (!folderFile.exists()) {
            if (!folderFile.mkdirs()) {
                responseJson(-1, "文件夹创建失败！" + folderFile.getAbsolutePath());
            }
        }
        List<String> paths = getParamToList("path", true);
        for (String path : paths) {
            if (FastFileUtils.isHttpUrl(path)) {
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
                    FastFileUtils.copyInputStreamToFile(source, new File(folderFile, URLDecoder.decode(fileName, "utf-8")));
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
            responseJson(0, "压缩成功！", FastFile.newInstance(zipFile).getUrl());
        } else {
            responseJson(-1, "压缩失败！");
        }
    }


    /**
     * 查看RESTful API接口文档
     */
    @AFastRoute({"document", "interface", "document.html", "interface.html", "api"})
    public void doc() throws Exception {
        List<FastResource> webResources = FastChar.getWebResources().getResources("/documents", resource -> resource.getName().toLowerCase().endsWith(".html"));
        if (webResources.isEmpty()) {
            responseJson(-1, "获取文档失败！暂无文档文件！");
            return;
        }


        List<Map<String, String>> docs = new ArrayList<>();
        for (FastResource html : webResources) {
            Document parse = Jsoup.parse(html.getInputStream(), "utf-8", "");
            Map<String, String> doc = new HashMap<>();
            doc.put("id", FastMD5Utils.MD5(html.getName()));
            doc.put("name", parse.title());
            String docUrl = "documents/" + html.getName() + "?t=" + System.currentTimeMillis();
            doc.put("url", docUrl);
            doc.put("file", html.getName());
            doc.put("time", String.valueOf(html.lastModified()));
            docs.add(doc);
        }

        docs.sort(Comparator.comparing(o -> o.get("name")));
        setRequestAttr("docs", docs);

        FastExtConfigJson extConfigJson = FastExtConfigJson.getInstance();

        setRequestAttr("projectName", extConfigJson.getTitle());
        String themeColor = extConfigJson.getThemeColor();
        setRequestAttr("themeColor", themeColor);
        setRequestAttr("themeLightColor", ColorUtils.getLightColor(themeColor, 0.8));
        setRequestAttr("logo", extConfigJson.getIcon());
        setRequestAttr("first", docs.get(0).get("id"));
        setRequestAttr(getParamToMap());
        setRequestAttr("http", getProjectHost());
        setParam(PARAM_ACCPET, "text/html");

        responseVelocity("fastchar-extjs-doc.html");
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
        if (StringUtils.isNotEmpty(logo) && (FastFileUtils.isHttpUrl(logo))) {
            BufferedImage bufferedImage = Thumbnails.of(new URL(logo))
                    .forceSize(58, 58)
                    .asBufferedImage();
            ZXingUtils.insertImage(qrImage, bufferedImage, true);
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
    @AFastToken
    @AFastSecurityResponse
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
        memDesc.put("title", "服务器内存监控信息");
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
     * 下载系统配置文件
     */
    @AFastSession
    @AFastToken
    public void downSystemConfig() throws Exception {
        List<ExtSystemConfigEntity> list = ExtSystemConfigEntity.getInstance().getList();
        File configFile = new File(FastChar.getPath().getWebRootPath(), "system_config.data");

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
    @AFastToken
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
    @AFastToken
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
    @AFastToken
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
        if (FastStringUtils.isNotEmpty(FastExtConfigJson.getInstance().getOnlyOfficeJs())) {
            String projectHost = getProjectHost();
            if (projectHost.startsWith("http://localhost") || projectHost.startsWith("http://192.168")) {
                projectHost = FastChar.getProperties().getString("projectHostOnline", projectHost);
            }
            if (projectHost.startsWith("http://localhost") || projectHost.startsWith("http://192.168")) {
                responseText("OnlyOffice不支持本地预览，请发布到可公网访问的线上服务器预览！");
            }
            String wrapUrl = projectHost + "openStream/" + FastRequestUtils.encodeUrl(ossUrl);
            Map<String, Object> officeConfig = OnlyOfficeUtils.createConfig(FastExtConfigJson.getInstance().getOnlyOfficeSecret(),
                    FastMD5Utils.MD5(wrapUrl), fileName2, fileName, wrapUrl);

            setRequestAttr("onlyOfficeConfig", FastChar.getJson().toJson(officeConfig));
            setRequestAttr("onlyOfficeJs", FastExtConfigJson.getInstance().getOnlyOfficeJs());

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


    /**
     * 获取数据看板
     */
    @AFastToken
    @AFastSession
    @AFastSecurityResponse
    public void databoard() {
        ExtManagerEntity managerEntity = ExtManagerEntity.getSession(this);
        Date date = new Date();
        List<FastDataboardDataInfo<?>> data = ExtSystemDataEntity.dao().getData(managerEntity, date);
        ExtSystemDataEntity.dao().saveData(managerEntity, date, data);
        responseJson(0, "获取成功！", data);
    }


    /**
     * 初始化历史看板数据
     */
    @AFastSession
    public void databoardInit() {
        int rang = getParamToInt("rang", true);
        FastDataboardJob.saveYesterdayData(rang);
        responseJson(0, "初始化成功！");
    }


}
