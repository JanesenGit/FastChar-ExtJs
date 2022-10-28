package com.fastchar.extjs.core.heads;

import com.fastchar.utils.FastStringUtils;

public class FastHeadLinkInfo extends FastHeadInfo {
    public FastHeadLinkInfo() {
        this.setTagName("link");
    }

    public String getRel() {
        return mapWrap.getString("rel");
    }

    public void setRel(String rel) {
        put("rel", rel);
    }

    public String getType() {
        return mapWrap.getString("type");
    }

    public void setType(String type) {
        put("type", type);
    }

    public String getHref() {
        return mapWrap.getString("href");
    }

    public void setHref(String href) {
        put("href", href);
    }


    public void wrapHttp(String http) {
        String href = getHref();
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
        return mapWrap.getBoolean("data-write-html", false);
    }
}
