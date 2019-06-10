package com.fastchar.extjs.observer;

import com.fastchar.core.FastChar;
import com.fastchar.database.info.FastDatabaseInfo;
import com.fastchar.extjs.core.heads.*;
import com.fastchar.utils.FastStringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Attribute;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.File;
import java.io.FilenameFilter;
import java.util.*;

public class FastHeadXmlObserver {
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
        for (FastHeadInfo head : heads) {
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
        if (files == null || files.length == 0) {
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
                fastHeadInfo.fromProperty();
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
                scriptInfo.fromProperty();
                heads.add(scriptInfo);
                scriptElement.remove();
            }

            Elements styleElements = parse.getElementsByTag("style");
            for (Element styleElement : styleElements) {
                FastHeadStyleInfo styleInfo = new FastHeadStyleInfo();
                styleInfo.setText(styleElement.text());
                styleInfo.fromProperty();
                heads.add(styleInfo);
                styleElement.remove();
            }

            FastHeadInfo otherHeadInfo = new FastHeadInfo();
            otherHeadInfo.setText(parse.getElementsByTag("head").html());
            otherHeadInfo.fromProperty();
            heads.add(otherHeadInfo);
        }

        FastHeadExtInfo extInfo = new FastHeadExtInfo();
        extInfo.setName("debug");
        extInfo.setValue(String.valueOf(FastChar.getConstant().isDebug()));
        extInfo.fromProperty();


        FastHeadExtInfo osExtInfo = new FastHeadExtInfo();
        osExtInfo.setName("os");
        osExtInfo.setValue(System.getProperty("os.name") + " " + System.getProperty("os.version"));
        osExtInfo.fromProperty();

        FastHeadExtInfo javaExtInfo = new FastHeadExtInfo();
        javaExtInfo.setName("java");
        javaExtInfo.setValue("Java " + System.getProperty("java.version") + " " + System.getProperty("sun.arch.data.model") + "位");
        javaExtInfo.fromProperty();

        FastHeadExtInfo dbExtInfo = new FastHeadExtInfo();
        dbExtInfo.setName("db");
        List<String> infos = new ArrayList<>();
        for (FastDatabaseInfo databaseInfo : FastChar.getDatabases().getAll()) {
            infos.add(databaseInfo.getProduct() + " " + databaseInfo.getVersion());
        }
        dbExtInfo.setValue(FastStringUtils.join(infos, "/"));
        dbExtInfo.fromProperty();

        if (FastChar.getServletContext() != null) {
            FastHeadExtInfo serverExtInfo = new FastHeadExtInfo();
            serverExtInfo.setName("server");
            serverExtInfo.setValue(FastChar.getServletContext().getServerInfo());
            serverExtInfo.fromProperty();
            heads.add(serverExtInfo);
        }

        heads.add(extInfo);
        heads.add(osExtInfo);
        heads.add(javaExtInfo);
        heads.add(dbExtInfo);
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