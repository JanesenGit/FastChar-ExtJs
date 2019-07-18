package com.fastchar.extjs;

import com.fastchar.core.FastChar;
import com.fastchar.extjs.core.FastExtEntities;
import com.fastchar.extjs.core.heads.FastHeadExtInfo;
import com.fastchar.extjs.core.heads.FastHeadInfo;
import com.fastchar.extjs.core.heads.FastHeadStyleInfo;
import com.fastchar.interfaces.IFastConfig;
import com.fastchar.utils.FastFileUtils;
import com.fastchar.utils.FastStringUtils;

import java.io.File;
import java.io.IOException;
import java.util.*;

public final class FastExtConfig implements IFastConfig {

    public static FastExtConfig getInstance() {
        return FastChar.getOverrides().singleInstance(FastExtConfig.class);
    }


    private String defaultThemeColor = "#62a3db";
    private String signKey;
    private boolean compressAppJs;
    private boolean attachLog;
    private boolean mergeAppJs;
    private boolean attachFilter;
    private FastExtEntities extEntities = new FastExtEntities();

    public String getDefaultThemeColor() {
        return defaultThemeColor;
    }

    public FastExtConfig setDefaultThemeColor(String defaultThemeColor) {
        this.defaultThemeColor = defaultThemeColor;
        return this;
    }

    public FastExtConfig setExtEntities(FastExtEntities extEntities) {
        this.extEntities = extEntities;
        return this;
    }

    public String getSignKey() {
        return signKey;
    }

    public FastExtConfig setSignKey(String signKey) {
        this.signKey = signKey;
        return this;
    }

    public boolean isCompressAppJs() {
        return compressAppJs;
    }

    public FastExtConfig setCompressAppJs(boolean compressAppJs) {
        this.compressAppJs = compressAppJs;
        return this;
    }

    public boolean isAttachLog() {
        return attachLog;
    }

    public FastExtConfig setAttachLog(boolean attachLog) {
        this.attachLog = attachLog;
        return this;
    }

    public boolean isMergeAppJs() {
        return mergeAppJs;
    }

    public FastExtConfig setMergeAppJs(boolean mergeAppJs) {
        this.mergeAppJs = mergeAppJs;
        return this;
    }

    public File getMergeJs() {
        return new File(FastChar.getPath().getWebRootPath(), "app.js");
    }

    public boolean isAttachFilter() {
        return attachFilter;
    }

    public FastExtConfig setAttachFilter(boolean attachFilter) {
        this.attachFilter = attachFilter;
        return this;
    }

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

    public String getProjectTitle() {
        List<FastHeadInfo> heads = FastChar.getValues().get("heads");
        for (FastHeadInfo head : heads) {
            if (head.getTagName().equalsIgnoreCase("title")) {
                return FastStringUtils.defaultValue(head.get("value"), "后台管理");
            }
        }
        return "后台管理";
    }


    public List<File> getAppJs() {
        File mergeFile = new File(FastChar.getPath().getWebRootPath(), "app.js");
        if (mergeFile.exists()) {
            return Collections.singletonList(mergeFile);
        }
        List<File> jsFiles = new ArrayList<>();
        Map<String, List<File>> app = getJsFiles(new File(FastChar.getPath().getWebRootPath(), "app"));

        for (List<File> value : app.values()) {
            if (value.size() > 1) {
                Collections.sort(value, new Comparator<File>() {
                    @Override
                    public int compare(File o1, File o2) {
                        return o2.compareTo(o1);
                    }
                });
            }
            jsFiles.add(value.get(0));
        }

        return jsFiles;
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

    public FastExtEntities getExtEntities() {
        return extEntities;
    }


    public FastHeadStyleInfo getThemeInfo() {
        try {
            FastHeadExtInfo themeInfo = getExtInfo("theme");
            if (themeInfo != null) {
                File file = new File(FastChar.getPath().getWebRootPath(), themeInfo.getValue());
                if (file.exists()) {
                    String themeContent = FastFileUtils.readFileToString(file, "utf-8");
                    Map<String, Object> placeholder = new HashMap<String, Object>();
                    FastHeadExtInfo extInfo = getExtInfo("theme-color");
                    if (extInfo != null) {
                        placeholder.put("color", extInfo.getColorValue());
                    } else {
                        placeholder.put("color", defaultThemeColor);
                    }
                    String theme = replacePlaceholder(placeholder, themeContent);
                    FastHeadStyleInfo styleInfo = new FastHeadStyleInfo();
                    styleInfo.setText(theme);
                    styleInfo.fromProperty();
                    return styleInfo;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }


    public static String replacePlaceholder(Map<String, Object> placeholders, String content) {
        for (String key : placeholders.keySet()) {
            if (placeholders.get(key) != null) {
                content = content.replaceAll("\\$\\{" + key + "}", placeholders.get(key).toString());
                content = content.replaceAll("\\$\\[" + key + "]", placeholders.get(key).toString());
            }
        }
        return content;
    }
}
