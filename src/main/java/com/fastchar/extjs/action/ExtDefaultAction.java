package com.fastchar.extjs.action;

import com.fastchar.annotation.AFastCache;
import com.fastchar.annotation.AFastRoute;
import com.fastchar.core.*;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.annotation.AFastSession;
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
import com.fastchar.extjs.interfaces.IFastManager;
import com.fastchar.extjs.observer.FastHeadXmlObserver;
import com.fastchar.extjs.observer.FastMenuXmlObserver;
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
import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ExtDefaultAction extends FastAction {
    @Override
    protected String getRoute() {
        return "/";
    }


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


        if (FastHeadXmlObserver.isModified()) {
            FastChar.getObservable().notifyObservers("refreshHeads");
        }

        List<ExtSystemConfigEntity> system = ExtSystemConfigEntity.getInstance().getExtConfigs(-1, "System");
        for (ExtSystemConfigEntity extSystemConfigEntity : system) {
            FastHeadExtInfo extInfo = FastExtConfig.getInstance().getExtInfo(extSystemConfigEntity.getConfigKey());
            if (extInfo != null) {
                extInfo.setValue(extSystemConfigEntity.getConfigValue());
                extInfo.fromProperty();
            }
        }

        List<FastHeadInfo> heads = FastChar.getValues().get("heads");
        if (heads == null) {
            responseText("FastCharExtWeb未启动！请先配置启动！");
            return;
        }

        FastHeadExtInfo version = FastExtConfig.getInstance().getExtInfo("version");
        if (version != null && FastChar.getConstant().isDebug()) {
            version.setValue(String.valueOf(System.currentTimeMillis()));
            version.fromProperty();
        }

        StringBuilder headString = new StringBuilder();
        for (FastHeadInfo head : heads) {
            if (head.isWriteHtml()) {
                headString.append(head.getText()).append("\n");
            }
        }
        Map<String, Object> holders = new HashMap<>();
        holders.put("head", headString.toString());
        holders.put("http", getProjectHost());
        holders.put("power", getParamToBoolean("power"));
        FastHeadExtInfo extInfo = FastExtConfig.getInstance().getExtInfo("theme-color");
        if (extInfo != null) {
            holders.put("color", extInfo.getColorValue());
        } else {
            holders.put("color", FastExtConfig.getInstance().getDefaultThemeColor());
        }

        String indexHtml = FastFileUtils.readFileToString(new File(FastChar.getPath().getWebRootPath(), "fast-index.html"), "utf-8");
        if (FastStringUtils.isEmpty(indexHtml)) {
            response404("系统fast-index.html文件异常！请及时告知开发人员！");
        }
        indexHtml = FastExtConfig.replacePlaceholder(holders, indexHtml);
        responseHtml(indexHtml);
    }


    public void loadApp() {
        List<FastHeadInfo> heads = FastChar.getValues().get("heads");

        List<FastHeadInfo> newHeads = new ArrayList<>(heads);
        String baseJsUrl = null;
        boolean hasLogin = false;
        ExtManagerEntity manager = getSession("manager");
        if (manager != null) {
            FastHeadExtInfo indexUrl = FastChar.getConfig(FastExtConfig.class).getExtInfo("indexUrl");
            if (indexUrl != null) {
                baseJsUrl = indexUrl.getValue();
            }else{
                responseJson(-1, "初始化失败！系统index.js文件异常，请及时告知开发人员！");
            }
            ExtManagerEntity byId = ExtManagerEntity.dao().getById(manager.getId());
            if (byId != null) {
                hasLogin = true;
                IFastManager iFastManager = FastChar.getOverrides().singleInstance(false, IFastManager.class);
                if (iFastManager != null) {
                    FastHandler handler = new FastHandler();
                    iFastManager.onManagerLogin(byId, handler);
                    if (handler.getCode() != 0) {
                        responseJson(-1, handler.getError());
                    }
                }
                setSession("manager", byId);
            }
        }

        if (!hasLogin) {
            FastHeadExtInfo loginUrl = FastChar.getConfig(FastExtConfig.class).getExtInfo("loginUrl");
            if (loginUrl != null) {
                baseJsUrl = loginUrl.getValue();
            }else{
                responseJson(-1, "初始化失败！系统login.js文件异常，请及时告知开发人员！");
            }


        }
        FastHeadScriptInfo headScriptInfo = new FastHeadScriptInfo();
        headScriptInfo.setSrc(baseJsUrl);
        headScriptInfo.fromProperty();
        newHeads.add(FastExtConfig.getInstance().getThemeInfo());
        newHeads.add(headScriptInfo);

        for (FastHeadInfo newHead : newHeads) {
            if (newHead instanceof FastHeadLinkInfo) {
                FastHeadLinkInfo linkInfo = (FastHeadLinkInfo) newHead;
                linkInfo.wrapHttp(getProjectHost());
            } else if (newHead instanceof FastHeadScriptInfo) {
                FastHeadScriptInfo scriptInfo = (FastHeadScriptInfo) newHead;
                scriptInfo.wrapHttp(getProjectHost());
            }
        }

        responseJson(0, "获取成功！", newHeads);
    }


    @AFastSession
    public void power() throws Exception {
        addParam("power", "true");
        index();
    }


    @AFastSession
    public void showConfig() throws Exception {
        if (FastMenuXmlObserver.isModified()) {
            FastChar.getObservable().notifyObservers("refreshMenus");
        }

        List<File> appJs = FastExtConfig.getInstance().getAppJs();
        List<String> appJsUrls = new ArrayList<>();
        for (File app : appJs) {
            String replace = app.getAbsolutePath().replace(FastChar.getPath().getWebRootPath(), "");
            if (replace.startsWith("http://") || replace.startsWith("https://") || replace.startsWith("/")) {
                appJsUrls.add(replace);
            } else {
                appJsUrls.add(getProjectHost() + replace);
            }
        }
        Map<String, Object> data = new HashMap<>();
        data.put("app", appJsUrls);
        data.put("http", getProjectHost());
        data.put("entities", FastExtConfig.getInstance().getExtEntities().getEntityInfo());

        FastMenuInfo menus = FastChar.getValues().get("menus");
        List<FastMenuInfo> newMenus = new ArrayList<>(menus.copy().getChildren());
        filterPowerMenus(newMenus, getParam("menuPower"));
        data.put("menus", newMenus);
        data.put("menusCss", buildCssContent(newMenus));

        data.put("manager", getSession("manager"));
        responseJson(0, "获取成功！", data);
    }

    private void filterPowerMenus(List<FastMenuInfo> menus) {
        filterPowerMenus(menus, null);
    }

    private void filterPowerMenus(List<FastMenuInfo> menus, String menuPower) {
        ExtManagerEntity managerEntity = getSession("manager");
        List<FastMenuInfo> waitRemove = new ArrayList<>();
        for (FastMenuInfo menu : menus) {

            if (managerEntity != null && managerEntity.getManagerRole().getRoleType() != ExtManagerRoleEntity.RoleTypeEnum.系统角色) {
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
            menu.fromProperty();
            iconCls.add(buildCssContent(menu.getChildren()));
        }
        return FastStringUtils.join(iconCls, "\n");
    }


    public void icon() {
        try {
            setLog(false);
            String path = getParam("path");
            String color = getParam("color");

            String localPath = FastChar.getPath().getWebRootPath() + "/" + path;
            File file = new File(localPath);
            if (file.exists()) {
                if (FastStringUtils.isNotEmpty(color)) {
                    if (file.getName().toLowerCase().endsWith(".svg")) {
                        String coloLocalPath = file.getParent() + "/" + FastMD5Utils.MD5(color) + "/" + file.getName();
                        File colorFile = new File(coloLocalPath);
                        if (colorFile.exists()) {
                            responseFile(colorFile);
                            return;
                        }
                        String svgContent = FastFileUtils.readFileToString(file);
                        String reg = "fill=\"#([0-9a-zA-Z]{6,8})\"";

                        String replaceAll = svgContent.replaceAll(reg, "fill=\"#" + color + "\"");
                        FastFileUtils.writeStringToFile(colorFile, replaceAll);
                        responseFile(colorFile);
                    }
                }
                responseFile(file);
            } else {
                responseText("文件不存在！");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    /**
     * 获得验证码
     *
     * @return FastOutCaptcha
     */
    public FastOutCaptcha showCaptcha() {
        return FastChar.getOverrides().newInstance(FastOutCaptcha.class).setStatus(200);
    }


    /**
     * 获得枚举列表
     */
    @AFastCache(checkClass = true)
    public void showEnums() throws Exception {
        String enumName = getParam("enumName", true);
        IFastExtEnum enumClass = FastChar.getOverrides().singleInstance(IFastExtEnum.class, enumName);
        if (enumClass != null) {
            responseJson(0, "获取成功！", enumClass.getEnums());
        } else {
            responseJson(-1, "获取失败！枚举'" + enumName + "'不存在！");
        }
    }


    /**
     * 获取权限菜单
     */
    @AFastSession
    public List<FastMenuInfo> showPowerMenus() {
        String checked = getParam("checked");
        FastMenuInfo menus = FastChar.getValues().get("menus");
        List<FastMenuInfo> newMenus = new ArrayList<>(menus.copy().getChildren());
        filterPowerMenus(newMenus, getParam("parent"));
        filterMenus(newMenus, checked);
        return newMenus;
    }

    private void filterMenus(List<FastMenuInfo> menus, String checked) {
        List<FastMenuInfo> waitRemove = new ArrayList<>();
        for (FastMenuInfo menu : menus) {
            if (!menu.getBoolean("power", true)) {
                waitRemove.add(menu);
                continue;
            }
            menu.setChecked(checked.contains(menu.getId()));
            menu.fromProperty();
            filterMenus(menu.getChildren(), checked);
        }
        menus.removeAll(waitRemove);
    }

    /**
     * 获得菜单列
     *
     * @return
     */
    @AFastSession
    public List<FastMenuInfo> showMenuColumn() {
        String checked = getParam("checked");
        FastMenuInfo menus = FastChar.getValues().get("menus");
        List<FastMenuInfo> newMenus = new ArrayList<>(menus.copy().getChildren());
        filterPowerMenus(newMenus);
        filterMenuColumn(newMenus, checked);
        return newMenus;
    }

    private void filterMenuColumn(List<FastMenuInfo> menus, String checked) {
        ExtManagerEntity managerEntity = getSession("manager");
        if (managerEntity == null) {
            return;
        }
        List<FastMenuInfo> waitRemove = new ArrayList<>();
        for (FastMenuInfo menu : menus) {
            menu.setChecked(checked.contains(menu.getId()));
            menu.fromProperty();
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
                        for (String key : stringMapMap.keySet()) {
                            Map<String, Object> column = stringMapMap.get(key);
                            if (column != null) {
                                if (column.containsKey("dataIndex")) {
                                    FastMenuInfo menuInfo = new FastMenuInfo();
                                    menuInfo.setLeaf(true);
                                    menuInfo.setIcon("icons/icon_column.svg");
                                    menuInfo.setId(FastMD5Utils.MD5(key + menu.getId()));
                                    menuInfo.setChecked(checked.contains(menuInfo.getId()));
                                    menuInfo.setDepth(menu.getDepth() + 1);
                                    menuInfo.setParentId(menu.getId());
                                    menuInfo.putAll(column);
                                    menuInfo.fromProperty();
                                    menu.getChildren().add(menuInfo);
                                }
                            }
                        }
                        menu.fromProperty();
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
     */
    public void upload() throws Exception {
        String type = getParam("type");
        FastFile<?> paramFile = getParamFile();
        if (paramFile != null) {
            if (FastStringUtils.isNotEmpty(type)) {
                paramFile = paramFile.renameTo(new File(paramFile.getAttachDirectory() + File.separator + type,
                        FastMD5Utils.MD5(System.currentTimeMillis() + paramFile.getFileName()) + paramFile.getExtensionName()), true);
            }
            String fileUrl = paramFile.getUrl();
            Map<String, Object> result = new HashMap<>();
            result.put("url", fileUrl);
            result.put("http", getProjectHost());
            responseJson(0, "上传成功！", result);
        } else {
            responseJson(-1, "上传失败！");
        }
    }

    /**
     * 下载或查看文件
     */
    @AFastRoute({"/download", "/attach"})
    public void down() {
        setLog(FastExtConfig.getInstance().isAttachLog());
        String path = getParam("path", true);
        if (path.startsWith("http://") || path.startsWith("https://")) {
            redirect(path);
        }
        boolean disposition = getParamToBoolean("disposition", true);
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
     */
    public void zipFile() throws IOException {
        File folderFile = new File(FastChar.getConstant().getAttachDirectory(), "/zip" + System.currentTimeMillis());
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
                FastFileUtils.copyURLToFile(url, new File(folderFile, fileName));
            }else{
                path = path.replace("attach/", "").split("\\?")[0];
                File file = new File(FastChar.getConstant().getAttachDirectory(), path);
                if (file.isDirectory()) continue;
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
     * 查看生成的接口文档
     */
    @AFastRoute({"document", "interface", "document.html", "interface.html","api"})
    public void doc() throws Exception {
        File file = new File(FastChar.getPath().getWebRootPath(), "documents");
        File[] files = file.listFiles(new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
                return name.endsWith(".html");
            }
        });
        List<Map<String, String>> docs = new ArrayList<>();
        for (int i = 0; i < files.length; i++) {
            File html = files[i];
            Document parse = Jsoup.parse(html, "utf-8");
            Map<String, String> doc = new HashMap<>();
            doc.put("id", FastMD5Utils.MD5(html.getName()));
            doc.put("name", parse.title());
            String docUrl = "documents/" + html.getName() + "?t=" + System.currentTimeMillis();
            doc.put("url", docUrl);
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
        } else {
            setRequestAttr("themeColor", "#3DB6A4");
        }
        String projectIcon = FastExtConfig.getInstance().getProjectIcon();
        if (projectIcon != null) {
            setRequestAttr("logo", projectIcon);
        }
        setRequestAttr("first", docs.get(0).get("id"));
        setRequestAttr(getParamToMap());
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
        responseJson(0, "获取成功！", time < localFile.lastModified());
    }


    /**
     * 生成二维码
     * 参数：
     * content 二维码内容
     * logo 中间logo
     */
    public void qrCode() throws Exception {
        String content = getParam("content", true);
        String logo = getParam("logo");
        String render = getParam("render", "json");
        String fileName = FastChar.getSecurity().MD5_Encrypt(content + logo) + ".png";
        FastFile fastFile = FastFile.newInstance(new File(FastChar.getConstant().getAttachDirectory(), "/qrcode").getAbsolutePath(),
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
            if (StringUtils.isNotEmpty(logo)) {
                BufferedImage bufferedImage = Thumbnails.of(new URL(logo))
                        .forceSize(58, 58)
                        .asBufferedImage();
                ZXingUtils.insertImage(qrImage, bufferedImage, true);
            }
        } catch (Exception ignored) {
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
        cpuInfo.put("cpuCount", processor.getLogicalProcessorCount());
        cpuInfo.put("sys", FastNumberUtils.formatToDouble((cSys * 1.0 / totalCpu * 1.0) * 100, 2) + "%");
        cpuInfo.put("used",  FastNumberUtils.formatToDouble((user * 1.0 / totalCpu * 1.0) * 100, 2) + "%");
        double cpuTotal = FastNumberUtils.formatToDouble(((user + cSys) * 1.0 / totalCpu * 1.0) * 100, 2);
        cpuInfo.put("total", cpuTotal + "%");
        cpuInfo.put("alert", cpuTotal > 80);
        Map<String, Object> cpuDesc = new LinkedHashMap<>();
        cpuDesc.put("title", "CPU监控信息");
        cpuDesc.put("cpuCount", "CPU核数");
        cpuDesc.put("sys", "系统使用率");
        cpuDesc.put("used",  "用户使用率");
        cpuDesc.put("total", "总的使用率");


        data.add(cpuInfo);
        desc.add(cpuDesc);


        GlobalMemory memory = hal.getMemory();
        Map<String, Object> memInf = new LinkedHashMap<>();
        memInf.put("total", FastNumberUtils.toByteUnit(memory.getTotal()));
        long memUsed = memory.getTotal() - memory.getAvailable();
        memInf.put("used", FastNumberUtils.toByteUnit(memUsed));
        memInf.put("free", FastNumberUtils.toByteUnit(memory.getAvailable()));
        double memberUsage = FastNumberUtils.formatToDouble((memUsed * 1.0 / memory.getTotal() * 1.0) * 100, 2);
        memInf.put("usage", memberUsage + "%");
        memInf.put("alert", memberUsage > 80);

        Map<String, Object> memDesc = new LinkedHashMap<>();
        memDesc.put("title", "内存监控信息");
        memDesc.put("total", "内存大小");
        memDesc.put("used", "已使用");
        memDesc.put("free",  "剩余内存");
        memDesc.put("usage", "已使用率");

        data.add(memInf);
        desc.add(memDesc);

        Runtime r = Runtime.getRuntime();
        Map<String, Object> jvmInfo = new LinkedHashMap<>();
        jvmInfo.put("total", FastNumberUtils.toByteUnit(r.totalMemory()));
        jvmInfo.put("free", FastNumberUtils.toByteUnit(r.freeMemory()));
        jvmInfo.put("max", FastNumberUtils.toByteUnit(r.maxMemory()));
        jvmInfo.put("used", FastNumberUtils.toByteUnit(r.totalMemory() - r.freeMemory()));
        jvmInfo.put("path", System.getProperty("java.home"));

        Map<String, Object> jvmDesc = new LinkedHashMap<>();
        jvmDesc.put("title", "Java虚拟机信息");
        jvmDesc.put("path", "所在位置");
        jvmDesc.put("max", "最大内存");
        jvmDesc.put("total", "可用内存");
        jvmDesc.put("free",  "剩余内存");
        jvmDesc.put("used", "已使用");

        data.add(jvmInfo);
        desc.add(jvmDesc);

        FileSystem fileSystem = systemInfo.getOperatingSystem().getFileSystem();
        OSFileStore[] fsArray = fileSystem.getFileStores();
        for (OSFileStore osFileStore : fsArray)
        {
            if (osFileStore.getMount().startsWith("/private")) {
                continue;
            }
            long diskTotal = osFileStore.getTotalSpace();
            long diskFree = osFileStore.getUsableSpace();
            long diskUsed = diskTotal - diskFree;
            Map<String, Object> diskInfo = new LinkedHashMap<>();
            diskInfo.put("dir", osFileStore.getMount());
            diskInfo.put("name", osFileStore.getName());
            diskInfo.put("total", FastNumberUtils.toByteUnit(diskTotal));
            diskInfo.put("used", FastNumberUtils.toByteUnit(diskUsed));
            diskInfo.put("free", FastNumberUtils.toByteUnit(diskFree));
            double diskUsage = FastNumberUtils.formatToDouble((diskUsed * 1.0 / diskTotal * 1.0) * 100, 2);
            diskInfo.put("usage", diskUsage + "%");
            diskInfo.put("alert", diskUsage > 80);

            Map<String, Object> diskDesc = new LinkedHashMap<>();
            diskDesc.put("title", "磁盘信息（" + osFileStore.getName() + "）");
            diskDesc.put("dir", "磁盘位置");
            diskDesc.put("name", "磁盘名称");
            diskDesc.put("total", "磁盘大小");
            diskDesc.put("free",  "剩余大小");
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
}
