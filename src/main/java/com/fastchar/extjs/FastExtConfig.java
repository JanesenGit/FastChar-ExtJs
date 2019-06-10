package com.fastchar.extjs;

import com.fastchar.core.FastChar;
import com.fastchar.extjs.core.FastExtEntities;
import com.fastchar.extjs.core.heads.FastHeadExtInfo;
import com.fastchar.extjs.core.heads.FastHeadInfo;
import com.fastchar.extjs.core.heads.FastHeadStyleInfo;
import com.fastchar.interfaces.IFastConfig;
import com.fastchar.utils.FastFileUtils;

import java.io.File;
import java.io.IOException;
import java.util.*;

public final class FastExtConfig implements IFastConfig {

    public static FastExtConfig getInstance() {
        return FastChar.getOverrides().singleInstance(FastExtConfig.class);
    }


    private String defaultThemeColor = "#62a3db";
    private String signKey;
    private boolean compress;
    private boolean attachLog;
    private boolean merge;
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

    public boolean isCompress() {
        return compress;
    }

    public FastExtConfig setCompress(boolean compress) {
        this.compress = compress;
        return this;
    }

    public boolean isAttachLog() {
        return attachLog;
    }

    public FastExtConfig setAttachLog(boolean attachLog) {
        this.attachLog = attachLog;
        return this;
    }

    public FastHeadExtInfo getExtInfo(String name) {
        List<FastHeadInfo> heads = FastChar.getValues().get("heads");
        for (FastHeadInfo head : heads) {
            if (head instanceof FastHeadExtInfo) {
                FastHeadExtInfo headExtInfo = (FastHeadExtInfo) head;
                if (headExtInfo.getName().equalsIgnoreCase(name)) {
                    return headExtInfo;
                }
            }
        }
        return null;
    }

    public List<FastHeadExtInfo> getExtInfo() {
        List<FastHeadExtInfo> extInfos = new ArrayList<>();
        List<FastHeadInfo> heads = FastChar.getValues().get("heads");
        for (FastHeadInfo head : heads) {
            if (head instanceof FastHeadExtInfo) {
                FastHeadExtInfo headExtInfo = (FastHeadExtInfo) head;
                extInfos.add(headExtInfo);
            }
        }
        return extInfos;
    }


    public List<File> getAppJs() {
        return getJsFiles(new File(FastChar.getPath().getWebRootPath(), "app"));
    }


    private List<File> getJsFiles(File file){
        List<File> filesList=new ArrayList<File>();
        if(file.isDirectory()){
            File[] files=file.listFiles();
            if (files == null) {
                return filesList;
            }
            Arrays.sort(files, new Comparator<File>() {
                @Override
                public int compare(File o1, File o2) {
                    return o2.compareTo(o1);
                }
            });
            for (File f : files) {
                if(!f.isDirectory()){
                    if(f.getName().endsWith(".js")){
                        filesList.add(f);
                    }
                }else{
                    filesList.addAll(getJsFiles(f));
                }
            }
        }
        return filesList;
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
