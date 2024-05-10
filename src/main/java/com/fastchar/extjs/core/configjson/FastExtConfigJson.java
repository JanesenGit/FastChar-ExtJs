package com.fastchar.extjs.core.configjson;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastMapWrap;
import com.fastchar.core.FastResource;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.utils.FastFileUtils;
import com.fastchar.utils.FastNumberUtils;
import com.fastchar.utils.FastStringUtils;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

public class FastExtConfigJson {

    public static FastExtConfigJson getInstance() {
        return FastChar.getOverrides().singleInstance(FastExtConfigJson.class);
    }

    private final List<Map<?, ?>> configJson = new ArrayList<>();
    private boolean initialized = false;

    public synchronized void loadConfigJson() {
        try {
            configJson.clear();
            List<FastResource> resources = FastChar.getWebResources().getResources("/", resource -> {
                String name = resource.getName().toLowerCase();
                return name.endsWith(".config.json") && name.startsWith(FastExtConfig.getInstance().getBasePrefix());
            });
            for (FastResource resource : resources) {
                List<String> strings = FastFileUtils.readLines(resource.getInputStream(), StandardCharsets.UTF_8);
                configJson.add(FastChar.getJson().fromJson(FastStringUtils.join(strings, "\n"), Map.class));
            }
            //排序
            configJson.sort(Comparator.comparingInt(o -> FastNumberUtils.formatToInt(o.get("priority"), 1)));
        } catch (IOException e) {
            FastChar.getLogger().error(FastExtConfigJson.class, e);
        }finally {
            initialized = true;
        }
    }


    public List<Map<?, ?>> getConfigJson() {
        if (!initialized) {
            loadConfigJson();
        }
        ArrayList<Map<?, ?>> configs = new ArrayList<>(configJson);
        configs.add(FastExtConfig.getInstance().getInjectConfigJson());
        return configs;
    }



    private String getStringValue(String key) {
        String value = "";
        for (Map<?, ?> map : getConfigJson()) {
            value = FastMapWrap.newInstance(map).getString("${" + key + "}", value);
        }
        return value;
    }

    private boolean getBooleanValue(String key) {
        boolean value = false;
        for (Map<?, ?> map : getConfigJson()) {
            value = FastMapWrap.newInstance(map).getBoolean("${" + key + "}", value);
        }
        return value;
    }

    private long getLongValue(String key) {
        long value = 0;
        for (Map<?, ?> map : getConfigJson()) {
            value = FastMapWrap.newInstance(map).getLong("${" + key + "}", value);
        }
        return value;
    }

    private int getIntValue(String key) {
        int value = 0;
        for (Map<?, ?> map : getConfigJson()) {
            value = FastMapWrap.newInstance(map).getInt("${" + key + "}", value);
        }
        return value;
    }

    private List<String> getStringListValue(String key) {
        List<String> values = new ArrayList<>();
        for (Map<?, ?> map : getConfigJson()) {
            FastMapWrap mapWrap = FastMapWrap.newInstance(map);
            int length = mapWrap.getInt("${" + key + ".length}");
            for (int i = 0; i < length; i++) {
                String dir = mapWrap.getString("${" + key + "[" + i + "]}");
                if (!values.contains(dir)) {
                    values.add(dir);
                }
            }
        }
        return values;
    }


    public List<String> getAppJsDir() {
        return this.getStringListValue("appjs_dir");
    }

    public String getAppJsBin() {
        return getStringValue("appjs_bin");
    }

    public boolean getAppJsBinEnable() {
        return getBooleanValue("appjs_bin_enable");
    }


    public boolean getGoogleAuthentication() {
        return getBooleanValue("google_authentication");
    }

    public String getGoogleAuthenticationTitle() {
        return getStringValue("google_authentication_title");
    }


    public String getThemeColor() {
        return getStringValue("theme_color");
    }

    public String getTitle() {
        return getStringValue("title");
    }

    public String getIcon() {
        return getStringValue("icon");
    }

    public Object getVersion() {
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("value", getVersionValue());
        jsonObject.addProperty("desc", getVersionDesc());
        return jsonObject;
    }

    public long getVersionValue() {
        if (FastChar.getConstant().isDebug()) {
            return System.currentTimeMillis();
        }
        return getLongValue("version.value");
    }

    public String getVersionDesc() {
        if (FastChar.getConstant().isDebug()) {
            return String.valueOf(System.currentTimeMillis());
        }
        return getStringValue("version.desc");
    }


    public int getInit() {
        return getIntValue("init");
    }


    public boolean getRestart() {
        return getBooleanValue("restart");
    }

    public String getLoginType() {
        return getStringValue("login_type");
    }

    //例如：http://***.**.**.**:9000/ 或 http://***.**.**.**:9000/web-apps/apps/api/documents/api.js
    public String getOnlyOfficeJs() {
        String onlyOfficeJs = getStringValue("only_office_js");
        onlyOfficeJs = FastStringUtils.stripEnd(onlyOfficeJs, "/");
        if (onlyOfficeJs.endsWith(":9000")) {
            onlyOfficeJs = onlyOfficeJs + "/web-apps/apps/api/documents/api.js";
        }
        return onlyOfficeJs;
    }

    public String getOnlyOfficeSecret() {
        return getStringValue("only_office_secret");
    }
}
