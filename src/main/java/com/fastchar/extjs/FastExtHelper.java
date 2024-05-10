package com.fastchar.extjs;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastFile;
import com.fastchar.interfaces.IFastCache;
import com.fastchar.interfaces.IFastMemoryCache;
import com.fastchar.utils.FastFileUtils;
import com.fastchar.utils.FastMD5Utils;
import com.fastchar.utils.FastStringUtils;

import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@SuppressWarnings("ResultOfMethodCallIgnored")
public class FastExtHelper {


    public static FastFile<?> getFastFileFromUrl(String url) throws IOException {
        FastFile<?> paramFile;
        String realUrl = url.split("\\?")[0];
        String fileName = realUrl.substring(realUrl.lastIndexOf("/") + 1);
        URL httpURL = new URL(url);
        HttpURLConnection conn = (HttpURLConnection) httpURL.openConnection();
        String headerField = conn.getHeaderField("content-disposition");
        String contentType = conn.getContentType();

        if (FastStringUtils.isNotEmpty(headerField)) {
            String regStr = "filename=\"(.*)\"";
            Matcher matcher = Pattern.compile(regStr).matcher(headerField);
            if (matcher.find()) {
                fileName = matcher.group(1);
            }
        } else {
            String fromContentType = FastFileUtils.getExtensionFromContentType(contentType);
            if (FastStringUtils.isNotEmpty(fromContentType) && !fileName.endsWith("." + fromContentType)) {
                fileName = fileName + "." + fromContentType;
            }
        }

        File saveFile = new File(FastChar.getConstant().getAttachDirectory(), fileName);
        FastFileUtils.copyURLToFile(httpURL, saveFile);
        paramFile = FastFile.newInstance(saveFile.getParent(), fileName);
        paramFile.setUploadFileName(fileName);
        paramFile.setContentType(contentType);
        return paramFile;
    }


    public static String saveCache(String source) {

        String key = FastMD5Utils.MD5To16(source);
        IFastCache iFastCache = FastChar.safeGetCache();
        if (iFastCache != null) {
            try {
                iFastCache.set("FastExtJsCache", key, source);
                return key;
            } catch (Exception e) {
                FastChar.getLogger().error(FastExtHelper.class, e);
            }
        }
        IFastMemoryCache iFastMemoryCache = FastChar.safeGetMemoryCache();
        if (iFastMemoryCache != null) {
            iFastMemoryCache.put(key, source);
            return key;
        }
        return null;
    }


    public static String getCache(String key) {
        IFastCache iFastCache = FastChar.safeGetCache();
        if (iFastCache != null) {
            try {
                return iFastCache.get("FastExtJsCache", key);
            } catch (Exception e) {
                FastChar.getLogger().error(FastExtHelper.class, e);
            }
        }
        IFastMemoryCache iFastMemoryCache = FastChar.safeGetMemoryCache();
        if (iFastMemoryCache != null) {
            return iFastMemoryCache.get(key);
        }
        return null;
    }

}
