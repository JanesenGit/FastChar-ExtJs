package com.fastchar.extjs.observer;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastConstant;
import com.fastchar.database.info.FastDatabaseInfo;
import com.fastchar.extjs.core.heads.*;
import com.fastchar.extjs.utils.ColorUtils;
import com.fastchar.extjs.utils.ExtFileUtils;
import com.fastchar.utils.FastNetworkUtils;
import com.fastchar.utils.FastStringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Attribute;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.File;
import java.io.FilenameFilter;
import java.util.*;

public class FastHeadHtmlObserver {
    private static int FILE_COUNT = 0;
    private static final Map<String, Long> FILE_MODIFY_TICK = new HashMap<>();

    public static boolean isModified() {
        for (String s : FILE_MODIFY_TICK.keySet()) {
            File file = new File(s);
            if (file.lastModified() > FILE_MODIFY_TICK.get(s)) {
                return true;
            }
        }
        return getHeadHtmlFiles().length > FILE_COUNT;
    }

    private static File[] getHeadHtmlFiles() {
        File src = new File(FastChar.getPath().getWebRootPath());
        File[] files = src.listFiles(new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
                return name.toLowerCase().startsWith("fast-head") && name.toLowerCase().endsWith(".html");
            }
        });
        if (files == null) {
            files = new File[0];
        }
        return files;
    }

    private List<FastHeadInfo> heads = new ArrayList<>();

    public void onScannerFinish() throws Exception {
        FastChar.getValues().put("heads", heads);
        initHeadHtml();
    }

    public void refreshHeads() throws Exception {
        initHeadHtml();
    }


    private FastHeadInfo getHeadInfo(String tagName) {
        for (FastHeadInfo head : heads) {
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
        if (FastStringUtils.isEmpty(name)) {
            return null;
        }
        for (FastHeadInfo head : heads) {
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

    private void initHeadHtml() throws Exception {
        File[] files = getHeadHtmlFiles();
        if (files.length == 0) {
            return;
        }
        FILE_COUNT = files.length;
        heads.clear();

        Arrays.sort(files, new Comparator<File>() {
            @Override
            public int compare(File o1, File o2) {
                return o1.getName().compareTo(o2.getName());
            }
        });
        for (File file : files) {
            FILE_MODIFY_TICK.put(file.getAbsolutePath(), file.lastModified());
            Document parse = Jsoup.parse(file, "utf-8");

            Elements titleElements = parse.getElementsByTag("title");
            for (Element titleElement : titleElements) {
                FastHeadInfo fastHeadInfo = getHeadInfo(titleElement.tagName());
                if (fastHeadInfo == null) {
                    fastHeadInfo = new FastHeadInfo();
                    heads.add(fastHeadInfo);
                }
                fastHeadInfo.setTagName(titleElement.tagName());
                fastHeadInfo.setText(titleElement.toString());
                fastHeadInfo.put("value", titleElement.text());
                fastHeadInfo.fromProperty();

                FastHeadExtInfo titleExtInfo = getHeadExtInfo(titleElement.tagName());
                if (titleExtInfo == null) {
                    titleExtInfo = new FastHeadExtInfo();
                    heads.add(titleExtInfo);
                }
                titleExtInfo.setName("title");
                titleExtInfo.setValue(titleElement.text());
                titleExtInfo.fromProperty();

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
                    }else if (value.equalsIgnoreCase("false")) {
                        value = "0";
                    }

                    fastHeadExtInfo.set(attribute.getKey(), value);
                }
                fastHeadExtInfo.fromProperty();
                extElement.remove();
            }


            Elements linkElements = parse.getElementsByTag("link");
            for (Element linkElement : linkElements) {
                FastHeadLinkInfo linkInfo = new FastHeadLinkInfo();
                for (Attribute attribute : linkElement.attributes()) {
                    linkInfo.set(attribute.getKey(), attribute.getValue());
                }
                linkInfo.fromProperty();
                heads.add(linkInfo);
                linkElement.remove();
            }

            Elements scriptElements = parse.getElementsByTag("script");
            for (Element scriptElement : scriptElements) {
                FastHeadScriptInfo scriptInfo = new FastHeadScriptInfo();
                for (Attribute attribute : scriptElement.attributes()) {
                    scriptInfo.set(attribute.getKey(), attribute.getValue());
                }
                scriptInfo.setText(scriptElement.html());
                scriptInfo.fromProperty();
                heads.add(scriptInfo);
                scriptElement.remove();
            }

            Elements styleElements = parse.getElementsByTag("style");
            for (Element styleElement : styleElements) {
                FastHeadStyleInfo styleInfo = new FastHeadStyleInfo();
                styleInfo.setText(styleElement.html());
                styleInfo.fromProperty();
                heads.add(styleInfo);
                styleElement.remove();
            }

            FastHeadInfo otherHeadInfo = new FastHeadInfo();
            otherHeadInfo.setText(parse.getElementsByTag("head").html());
            otherHeadInfo.fromProperty();
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
                    frontColorDarkExt.setValue(ColorUtils.getDarkColor(value, 0.5));
                    frontColorDarkExt.fromProperty();
                    waitAdd.add(frontColorDarkExt);
                }else if (headExtInfo.getName().equalsIgnoreCase("theme-color")) {
                    String value = headExtInfo.getColorValue();
                    FastHeadExtInfo themeColorDarkExt = new FastHeadExtInfo();
                    themeColorDarkExt.setName("theme-color-dark");
                    themeColorDarkExt.setValue(ColorUtils.getDarkColor(value, 0.2));
                    themeColorDarkExt.fromProperty();
                    waitAdd.add(themeColorDarkExt);
                }
            }
        }
        heads.addAll(waitAdd);

        FastHeadExtInfo debugExtInfo = new FastHeadExtInfo();
        debugExtInfo.setName("debug");
        debugExtInfo.setValue(String.valueOf(FastChar.getConstant().isDebug()));
        debugExtInfo.fromProperty();


        FastHeadExtInfo osExtInfo = new FastHeadExtInfo();
        osExtInfo.setName("os");
        osExtInfo.setValue(System.getProperty("os.name") + " ( " + System.getProperty("os.arch") + " ) " + System.getProperty("os.version"));
        osExtInfo.fromProperty();

        FastHeadExtInfo javaExtInfo = new FastHeadExtInfo();
        javaExtInfo.setName("java");
        javaExtInfo.setValue("Java " + System.getProperty("java.version") + " " + System.getProperty("sun.arch.data.model") + "位");
        javaExtInfo.fromProperty();

        FastHeadExtInfo hostExtInfo = new FastHeadExtInfo();
        hostExtInfo.setName("host");
        hostExtInfo.setValue(FastNetworkUtils.getLocalIP());
        hostExtInfo.fromProperty();


        FastHeadExtInfo dbExtInfo = new FastHeadExtInfo();
        dbExtInfo.setName("db");
        List<String> infos = new ArrayList<>();
        for (FastDatabaseInfo databaseInfo : FastChar.getDatabases().getAll()) {
            infos.add(databaseInfo.getProduct() + " " + databaseInfo.getVersion());
        }
        dbExtInfo.setValue(FastStringUtils.join(infos, "/"));
        dbExtInfo.fromProperty();


        FastHeadExtInfo indexExtInfo = new FastHeadExtInfo();
        indexExtInfo.setName("indexUrl");
        indexExtInfo.setValue("base/index/index.js");
        File minIndexJsFile = ExtFileUtils.searchFirstFile(new File(FastChar.getPath().getWebRootPath(), "base/index"), "min",".js");
        if (minIndexJsFile != null) {
            String replace = minIndexJsFile.getAbsolutePath().replace(FastChar.getPath().getWebRootPath(), "");
            indexExtInfo.setValue(FastStringUtils.strip(replace, File.separator));
        }
        indexExtInfo.fromProperty();


        FastHeadExtInfo loginExtInfo = new FastHeadExtInfo();
        loginExtInfo.setName("loginUrl");
        loginExtInfo.setValue("base/login/login.js");

        File minLoginJsFile = ExtFileUtils.searchFirstFile(new File(FastChar.getPath().getWebRootPath(), "base/login"), "min",".js");
        if (minLoginJsFile != null) {
            String replace = minLoginJsFile.getAbsolutePath().replace(FastChar.getPath().getWebRootPath(), "");
            loginExtInfo.setValue(FastStringUtils.strip(replace, File.separator));
        }

        loginExtInfo.fromProperty();

        FastHeadExtInfo welcomeExtInfo = new FastHeadExtInfo();
        welcomeExtInfo.setName("welcomeUrl");
        welcomeExtInfo.setValue("base/welcome/welcome.js");

        File minWelcomeJsFile = ExtFileUtils.searchFirstFile(new File(FastChar.getPath().getWebRootPath(), "base/welcome"), "min",".js");
        if (minWelcomeJsFile != null) {
            String replace = minWelcomeJsFile.getAbsolutePath().replace(FastChar.getPath().getWebRootPath(), "");
            welcomeExtInfo.setValue(FastStringUtils.strip(replace, File.separator));
        }
        welcomeExtInfo.fromProperty();



        if (FastChar.getServletContext() != null) {
            FastHeadExtInfo serverExtInfo = new FastHeadExtInfo();
            serverExtInfo.setName("server");
            serverExtInfo.setValue(FastChar.getServletContext().getServerInfo());
            serverExtInfo.fromProperty();
            heads.add(serverExtInfo);
        }


        FastHeadExtInfo fastcharExtInfo = new FastHeadExtInfo();
        fastcharExtInfo.setName("fastchar");
        fastcharExtInfo.setValue("FastChar " + FastConstant.FAST_CHAR_VERSION);
        fastcharExtInfo.fromProperty();

        FastHeadExtInfo catalinaInfo = new FastHeadExtInfo();
        catalinaInfo.setName("catalina");
        catalinaInfo.setValue(System.getProperty("catalina.home"));
        catalinaInfo.fromProperty();

        FastHeadExtInfo rootInfo = new FastHeadExtInfo();
        rootInfo.setName("root");
        rootInfo.setValue(FastChar.getPath().getWebRootPath());
        rootInfo.fromProperty();

        heads.add(indexExtInfo);
        heads.add(loginExtInfo);
        heads.add(welcomeExtInfo);
        heads.add(debugExtInfo);
        heads.add(osExtInfo);
        heads.add(javaExtInfo);
        heads.add(catalinaInfo);
        heads.add(hostExtInfo);
        heads.add(dbExtInfo);
        heads.add(fastcharExtInfo);
        heads.add(rootInfo);
    }

    private String replacePlaceholder(Map<String, Object> placeholders, String content) {
        for (String key : placeholders.keySet()) {
            if (placeholders.get(key) != null) {
                content = content.replaceAll("\\$\\[" + key + "\\]", placeholders.get(key).toString());
            }
        }
        return content;
    }

}
