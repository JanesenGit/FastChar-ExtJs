package com.fastchar.extjs.action;

import com.fastchar.annotation.AFastCache;
import com.fastchar.annotation.AFastRoute;
import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastFile;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.extjs.core.heads.FastHeadExtInfo;
import com.fastchar.extjs.core.heads.FastHeadInfo;
import com.fastchar.extjs.core.heads.FastHeadScriptInfo;
import com.fastchar.extjs.core.menus.FastMenuInfo;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtManagerRoleEntity;
import com.fastchar.extjs.entity.ExtSystemConfigEntity;
import com.fastchar.extjs.interfaces.IFastExtEnum;
import com.fastchar.extjs.observer.FastHeadXmlObserver;
import com.fastchar.extjs.observer.FastMenuXmlObserver;
import com.fastchar.extjs.utils.ZXingUtils;
import com.fastchar.out.FastOutCaptcha;
import com.fastchar.utils.*;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.commons.lang3.StringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.net.URL;
import java.util.*;

public class ExtDefaultAction extends FastAction {
    @Override
    protected String getRoute() {
        return "/";
    }


    @AFastRoute({"/fast_index.html", "/index.html", "/index.jsp", "/index.vm"})
    @AFastCache(checkClass = true, timeout = 30)
    public void index() throws Exception {

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
        indexHtml = FastExtConfig.replacePlaceholder(holders, indexHtml);
        responseHtml(indexHtml);
    }


    public void loadApp() {
        List<FastHeadInfo> heads = FastChar.getValues().get("heads");

        List<FastHeadInfo> newHeads = new ArrayList<>(heads);
        String baseJsUrl = null;
        if (getSession("manager") == null) {
            FastHeadExtInfo loginUrl = FastChar.getConfig(FastExtConfig.class).getExtInfo("loginUrl");
            if (loginUrl != null) {
                baseJsUrl = loginUrl.getValue();
            }
        } else {
            FastHeadExtInfo indexUrl = FastChar.getConfig(FastExtConfig.class).getExtInfo("indexUrl");
            if (indexUrl != null) {
                baseJsUrl = indexUrl.getValue();
            }
        }

        FastHeadScriptInfo headScriptInfo = new FastHeadScriptInfo();
        headScriptInfo.setSrc(baseJsUrl);
        headScriptInfo.fromProperty();
        newHeads.add(FastExtConfig.getInstance().getThemeInfo());
        newHeads.add(headScriptInfo);

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
            appJsUrls.add(replace);
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
        filterPowerMenus(newMenus);
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
    @AFastSession
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
            path = path.replace("attach/", "").split("\\?")[0];
            File file = new File(FastChar.getConstant().getAttachDirectory(), path);
            if (file.isDirectory()) continue;
            if (file.exists()) {
                FastFileUtils.copyFileToDirectory(file, folderFile);
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
    @AFastRoute({"document", "interface", "document.html", "interface.html"})
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
            doc.put("id", String.valueOf(i + 1));
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
        }else{
            setRequestAttr("themeColor", "#3DB6A4");
        }
        FastHeadExtInfo logoExt = FastExtConfig.getInstance().getExtInfo("system-logo");
        if (logoExt != null) {
            setRequestAttr("logo", logoExt.getValue());
        }
        setRequestAttr("first", docs.get(0).get("id"));
        responseVelocity("fast-doc.html");
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
        FastFile fastFile = FastFile.newInstance(new File(FastChar.getConstant().getAttachDirectory(), "/qrcode").getAbsolutePath(),
                FastChar.getSecurity().MD5_Encrypt(content + logo) + ".png");
        if (fastFile.getFile().exists()) {
            responseJson(0, "生成成功！", fastFile.getUrl());
        }

        BufferedImage qrImage = ZXingUtils.makeQRCode(content, getParamToInt("margin", 2), 500, 500);
        if (qrImage == null) {
            responseJson(-1, "生成失败！");
            return;
        }
        try {
            if (StringUtils.isNotEmpty(logo)) {
                BufferedImage bufferedImage = Thumbnails.of(new URL(logo)).size(58, 58).asBufferedImage();
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
        responseJson(0, "生成成功！", fastFile.getUrl());
    }


}
