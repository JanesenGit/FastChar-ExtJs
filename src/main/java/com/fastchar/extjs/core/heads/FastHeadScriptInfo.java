package com.fastchar.extjs.core.heads;

import com.fastchar.utils.FastStringUtils;

public class FastHeadScriptInfo extends FastHeadInfo {
    public FastHeadScriptInfo() {
        this.setTagName("script");
    }

    private String src;

    public String getSrc() {
        return src;
    }

    public void setSrc(String src) {
        this.src = src;
    }

    public void wrapHttp(String http) {
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
        return false;
    }
}
