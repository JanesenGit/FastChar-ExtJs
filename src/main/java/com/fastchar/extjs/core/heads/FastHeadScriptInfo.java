package com.fastchar.extjs.core.heads;

import com.fastchar.utils.FastStringUtils;

public class FastHeadScriptInfo extends FastHeadInfo {
    public FastHeadScriptInfo() {
        this.setTagName("script");
    }

    public String getSrc() {
        return mapWrap.getString("src");
    }

    public void setSrc(String src) {
        put("src", src);
//        if (!containsKey("_src")) {
//            put("_src", src);
//        }
    }

    public void wrapHttp(String http) {
        String src = getSrc();
        if (FastStringUtils.isEmpty(src)) {
            return;
        }
        if (src.startsWith("http://") || src.startsWith("https://")) {
            return;
        }
        if (src.startsWith("/")) {
            return;
        }
        put("src", http + src);
    }

    @Override
    public boolean isWriteHtml() {
        return mapWrap.getBoolean("data-write-html", false);
    }
}
