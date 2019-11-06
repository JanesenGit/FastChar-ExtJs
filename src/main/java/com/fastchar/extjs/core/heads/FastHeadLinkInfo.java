package com.fastchar.extjs.core.heads;

import com.fastchar.utils.FastStringUtils;

public class FastHeadLinkInfo extends FastHeadInfo {
    public FastHeadLinkInfo() {
        this.setTagName("link");
    }
    private String rel;
    private String type;
    private String href;

    public String getRel() {
        return rel;
    }

    public void setRel(String rel) {
        this.rel = rel;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getHref() {
        return href;
    }

    public void setHref(String href) {
        this.href = href;
    }


    public void wrapHttp(String http) {
        if (FastStringUtils.isEmpty(href)) {
            return;
        }
        if (href.startsWith("http://") || href.startsWith("https://")) {
            return;
        }
        if (href.startsWith("/")) {
            return;
        }
        put("href", http + href);
    }

    @Override
    public boolean isWriteHtml() {
        return false;
    }
}
