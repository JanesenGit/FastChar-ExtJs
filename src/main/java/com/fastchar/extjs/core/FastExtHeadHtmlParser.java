package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastConstant;
import com.fastchar.database.info.FastDatabaseInfo;
import com.fastchar.extjs.accepter.FastExtHeadHtmlAccepter;
import com.fastchar.extjs.core.heads.*;
import com.fastchar.extjs.interfaces.IFastHeadHtmlListener;
import com.fastchar.extjs.utils.ColorUtils;
import com.fastchar.extjs.utils.ExtFileUtils;
import com.fastchar.utils.FastDateUtils;
import com.fastchar.utils.FastNetworkUtils;
import com.fastchar.utils.FastStringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Attribute;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.File;
import java.util.*;

public class FastExtHeadHtmlParser {

    public static FastExtHeadHtmlParser getInstance() {
        return FastChar.getOverrides().singleInstance(FastExtHeadHtmlParser.class);
    }

    private final Map<String, Long> fileModifyTick = new HashMap<>(16);
    private final List<FastHeadInfo> heads = new ArrayList<>();
    private boolean parsedHeadHtml = false;


    public boolean isModified() {
        for (Map.Entry<String, Long> stringLongEntry : fileModifyTick.entrySet()) {
            File file = new File(stringLongEntry.getKey());
            if (file.lastModified() > stringLongEntry.getValue()) {
                return true;
            }
        }
        return false;
    }

    private List<File> getHeadHtmlFiles() {
        List<File> headHtmlList = new ArrayList<>();
        for (String path : FastExtHeadHtmlAccepter.HEAD_HTML_PATH_LIST) {
            File headFile = new File(path);
            boolean isJump = false;
            List<IFastHeadHtmlListener> iFastHeadHtmlListeners = FastChar.getOverrides().singleInstances(false, IFastHeadHtmlListener.class);
            for (IFastHeadHtmlListener iFastHeadHtmlListener : iFastHeadHtmlListeners) {
                Boolean onParseHeadHtml = iFastHeadHtmlListener.onParseHeadHtml(headFile);
                if (onParseHeadHtml == null) {
                    continue;
                }
                if (!onParseHeadHtml) {
                    isJump = true;
                    break;
                }
            }
            if (isJump) {
                continue;
            }
            headHtmlList.add(headFile);
        }
        return headHtmlList;
    }

    private FastHeadInfo getHeadInfo(String tagName) {
        ArrayList<FastHeadInfo> fastHeadInfos = new ArrayList<>(heads);
        for (FastHeadInfo head : fastHeadInfos) {
            if (FastStringUtils.isEmpty(head.getTagName())) {
                continue;
            }
            if (head.getTagName().equalsIgnoreCase(tagName)) {
                return head;
            }
        }
        return null;
    }

    private FastHeadExtInfo getHeadExtInfo(String name) {
        //避免在操作heads时遍历heads
        ArrayList<FastHeadInfo> fastHeadInfos = new ArrayList<>(heads);
        if (FastStringUtils.isEmpty(name)) {
            return null;
        }
        for (FastHeadInfo head : fastHeadInfos) {
            if (head == null) {
                continue;
            }
            if (FastStringUtils.isEmpty(head.getTagName())) {
                continue;
            }
            if (head.getTagName().equalsIgnoreCase("ext")) {
                if (head.containsKey("name") && head.get("name").toString().equalsIgnoreCase(name)) {
                    return (FastHeadExtInfo) head;
                }
            }
        }
        return null;
    }

    //必须使用同步，避免多次操作heads 报错
    public synchronized void initHeadHtml() {
        try {
            List<File> files = getHeadHtmlFiles();
            if (files.size() == 0) {
                return;
            }
            heads.clear();

            Collections.sort(files, new Comparator<File>() {
                @Override
                public int compare(File o1, File o2) {
                    return o1.getName().compareTo(o2.getName());
                }
            });
            for (File file : files) {
                fileModifyTick.put(file.getAbsolutePath(), file.lastModified());
                Document parse = Jsoup.parse(file, "utf-8");

                Elements titleElements = parse.getElementsByTag("title");
                for (Element titleElement : titleElements) {
                    FastHeadInfo fastHeadInfo = getHeadInfo(titleElement.tagName());
                    if (fastHeadInfo == null) {
                        fastHeadInfo = new FastHeadInfo();
                        heads.add(fastHeadInfo);
                    }
                    for (Attribute attribute : titleElement.attributes()) {
                        fastHeadInfo.put(attribute.getKey(), attribute.getValue());
                    }

                    fastHeadInfo.setTagName(titleElement.tagName());
                    fastHeadInfo.setText(titleElement.toString());
                    fastHeadInfo.put("value", titleElement.text());

                    FastHeadExtInfo titleExtInfo = getHeadExtInfo(titleElement.tagName());
                    if (titleExtInfo == null) {
                        titleExtInfo = new FastHeadExtInfo();
                        heads.add(titleExtInfo);
                    }
                    titleExtInfo.setName("title");
                    titleExtInfo.setValue(titleElement.text());

                    titleElement.remove();
                }

                Elements extElements = parse.getElementsByAttributeValue("scheme", "ext");
                for (Element extElement : extElements) {
                    FastHeadExtInfo fastHeadExtInfo = getHeadExtInfo(extElement.attr("name"));
                    if (fastHeadExtInfo == null) {
                        fastHeadExtInfo = new FastHeadExtInfo();
                        heads.add(fastHeadExtInfo);
                    }


                    for (Attribute attribute : extElement.attributes()) {
                        String value = attribute.getValue();
                        if (value.equalsIgnoreCase("true")) {
                            value = "1";
                        } else if (value.equalsIgnoreCase("false")) {
                            value = "0";
                        }

                        fastHeadExtInfo.put(attribute.getKey(), value);
                    }

                    fastHeadExtInfo.setText(extElement.html());

                    extElement.remove();
                }


                Elements linkElements = parse.getElementsByTag("link");
                for (Element linkElement : linkElements) {
                    FastHeadLinkInfo linkInfo = new FastHeadLinkInfo();
                    for (Attribute attribute : linkElement.attributes()) {
                        linkInfo.put(attribute.getKey(), attribute.getValue());
                    }
                    linkInfo.setText(linkElement.toString());
                    heads.add(linkInfo);
                    linkElement.remove();
                }

                Elements scriptElements = parse.getElementsByTag("script");
                for (Element scriptElement : scriptElements) {
                    FastHeadScriptInfo scriptInfo = new FastHeadScriptInfo();
                    for (Attribute attribute : scriptElement.attributes()) {
                        scriptInfo.put(attribute.getKey(), attribute.getValue());
                    }
                    scriptInfo.setText(scriptElement.html());
                    heads.add(scriptInfo);
                    scriptElement.remove();
                }

                Elements styleElements = parse.getElementsByTag("style");
                for (Element styleElement : styleElements) {
                    FastHeadStyleInfo styleInfo = new FastHeadStyleInfo();
                    for (Attribute attribute : styleElement.attributes()) {
                        styleInfo.put(attribute.getKey(), attribute.getValue());
                    }
                    styleInfo.setText(styleElement.html());
                    heads.add(styleInfo);
                    styleElement.remove();
                }

                FastHeadInfo otherHeadInfo = new FastHeadInfo();
                otherHeadInfo.setText(parse.getElementsByTag("head").html());
                heads.add(otherHeadInfo);
            }

            List<FastHeadExtInfo> waitAdd = new ArrayList<>();
            for (FastHeadInfo head : heads) {
                if (head instanceof FastHeadExtInfo) {
                    FastHeadExtInfo headExtInfo = (FastHeadExtInfo) head;
                    if (headExtInfo.getName().equalsIgnoreCase("front-color")) {
                        String value = headExtInfo.getColorValue();
                        FastHeadExtInfo frontColorDarkExt = new FastHeadExtInfo();
                        frontColorDarkExt.setName("front-color-dark");
                        frontColorDarkExt.setValue(ColorUtils.getDarkColor(value, 0.2));
                        waitAdd.add(frontColorDarkExt);
                    } else if (headExtInfo.getName().equalsIgnoreCase("theme-color")) {
                        String value = headExtInfo.getColorValue();
                        FastHeadExtInfo themeColorDarkExt = new FastHeadExtInfo();
                        themeColorDarkExt.setName("theme-color-dark");
                        themeColorDarkExt.setValue(ColorUtils.getDarkColor(value, 0.2));
                        waitAdd.add(themeColorDarkExt);

                        FastHeadExtInfo themeColorLightExt = new FastHeadExtInfo();
                        themeColorLightExt.setName("theme-color-light");
                        themeColorLightExt.setValue(ColorUtils.getLightColor(value, 0.2));
                        waitAdd.add(themeColorLightExt);
                    }
                }
            }
            heads.addAll(waitAdd);

            FastHeadExtInfo debugExtInfo = new FastHeadExtInfo();
            debugExtInfo.setName("debug");
            debugExtInfo.setValue(String.valueOf(FastChar.getConstant().isDebug()));


            FastHeadExtInfo osExtInfo = new FastHeadExtInfo();
            osExtInfo.setName("os");
            osExtInfo.setValue(System.getProperty("os.name") + " ( " + System.getProperty("os.arch") + " ) " + System.getProperty("os.version"));

            FastHeadExtInfo javaExtInfo = new FastHeadExtInfo();
            javaExtInfo.setName("java");
            javaExtInfo.setValue("Java " + System.getProperty("java.version") + " " + System.getProperty("sun.arch.data.model") + "位");

            FastHeadExtInfo hostExtInfo = new FastHeadExtInfo();
            hostExtInfo.setName("host");
            hostExtInfo.setValue(FastNetworkUtils.getLocalIP());


            FastHeadExtInfo dbExtInfo = new FastHeadExtInfo();
            dbExtInfo.setName("db");
            List<String> infos = new ArrayList<>();
            for (FastDatabaseInfo databaseInfo : FastChar.getDatabases().getAll()) {
                if (!databaseInfo.isFetchDatabaseInfo()) {
                    continue;
                }
                infos.add(databaseInfo.getProduct() + " " + databaseInfo.getVersion());
            }
            dbExtInfo.setValue(FastStringUtils.join(infos, "/"));


            FastHeadExtInfo jdbcExtInfo = new FastHeadExtInfo();
            jdbcExtInfo.setName("dbPool");
            jdbcExtInfo.setValue(FastChar.getValues().<String>get("jdbcPool"));


            FastHeadExtInfo indexExtInfo = new FastHeadExtInfo();
            indexExtInfo.setName("indexUrl");
            indexExtInfo.setValue("base/index/index.js");
            File minIndexJsFile = ExtFileUtils.searchFirstFile(new File(FastChar.getPath().getWebRootPath(), "base/index"), "min", ".js");
            if (minIndexJsFile != null) {
                String replace = minIndexJsFile.getAbsolutePath().replace(FastChar.getPath().getWebRootPath(), "");
                indexExtInfo.setValue(FastStringUtils.strip(replace, File.separator));
            }


            FastHeadExtInfo loginExtInfo = new FastHeadExtInfo();
            loginExtInfo.setName("loginUrl");
            loginExtInfo.setValue("base/login/login.js");

            File minLoginJsFile = ExtFileUtils.searchFirstFile(new File(FastChar.getPath().getWebRootPath(), "base/login"), "min", ".js");
            if (minLoginJsFile != null) {
                String replace = minLoginJsFile.getAbsolutePath().replace(FastChar.getPath().getWebRootPath(), "");
                loginExtInfo.setValue(FastStringUtils.strip(replace, File.separator));
            }


            FastHeadExtInfo welcomeExtInfo = new FastHeadExtInfo();
            welcomeExtInfo.setName("welcomeUrl");
            welcomeExtInfo.setValue("base/welcome/welcome.js");

            File minWelcomeJsFile = ExtFileUtils.searchFirstFile(new File(FastChar.getPath().getWebRootPath(), "base/welcome"), "min", ".js");
            if (minWelcomeJsFile != null) {
                String replace = minWelcomeJsFile.getAbsolutePath().replace(FastChar.getPath().getWebRootPath(), "");
                welcomeExtInfo.setValue(FastStringUtils.strip(replace, File.separator));
            }


            if (FastChar.getServletContext() != null) {
                FastHeadExtInfo serverExtInfo = new FastHeadExtInfo();
                serverExtInfo.setName("server");
                serverExtInfo.setValue(FastChar.getServletContext().getServerInfo());
                heads.add(serverExtInfo);
            }


            FastHeadExtInfo fastcharExtInfo = new FastHeadExtInfo();
            fastcharExtInfo.setName("fastchar");
            fastcharExtInfo.setValue("FastChar " + FastConstant.FAST_CHAR_VERSION);

            FastHeadExtInfo catalinaInfo = new FastHeadExtInfo();
            catalinaInfo.setName("catalina");
            catalinaInfo.setValue(System.getProperty("catalina.home"));

            FastHeadExtInfo rootInfo = new FastHeadExtInfo();
            rootInfo.setName("root");
            rootInfo.setValue(FastChar.getPath().getWebRootPath());

            FastHeadExtInfo startTimeInfo = new FastHeadExtInfo();
            startTimeInfo.setName("startTime");
            String systemStartTime = FastDateUtils.format(new Date(FastChar.getConstant().getBeginInitTime()), "yyyy-MM-dd HH:mm:ss");
            startTimeInfo.setValue(systemStartTime);

            FastHeadExtInfo desktopBgImageInfo = new FastHeadExtInfo();
            desktopBgImageInfo.setName("desktopBgImages");
            List<String> allBackgroundImages = new ArrayList<>();
            List<File> allBackgroundImage = FastExtDesktopHelper.getAllBackgroundImage();
            for (File file : allBackgroundImage) {
                allBackgroundImages.add(file.getAbsolutePath().replace(FastChar.getPath().getWebRootPath(), ""));
            }
            desktopBgImageInfo.setValue(FastChar.getJson().toJson(allBackgroundImages));



            if (indexExtInfo.isExistFile()) {
                heads.add(indexExtInfo);
            }
            if (loginExtInfo.isExistFile()) {
                heads.add(loginExtInfo);
            }
            if (welcomeExtInfo.isExistFile()) {
                heads.add(welcomeExtInfo);
            }
            heads.add(debugExtInfo);
            heads.add(osExtInfo);
            heads.add(javaExtInfo);
            heads.add(catalinaInfo);
            heads.add(hostExtInfo);
            heads.add(dbExtInfo);
            heads.add(jdbcExtInfo);
            heads.add(fastcharExtInfo);
            heads.add(startTimeInfo);
            heads.add(rootInfo);
            heads.add(desktopBgImageInfo);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            sortHeads();
            parsedHeadHtml = true;
        }
    }

    public List<FastHeadInfo> getHeads() {
        if (!parsedHeadHtml) {
            initHeadHtml();
        }
        return new ArrayList<>(heads);
    }


    private void sortHeads() {
        Collections.sort(heads, new Comparator<FastHeadInfo>() {
            @Override
            public int compare(FastHeadInfo o1, FastHeadInfo o2) {
                return Integer.compare(o1.getMapWrap().getInt("data-index", heads.size()), o2.getMapWrap().getInt("data-index", heads.size()));
            }
        });
    }

}
