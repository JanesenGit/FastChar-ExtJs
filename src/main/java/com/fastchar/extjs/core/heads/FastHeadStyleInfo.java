package com.fastchar.extjs.core.heads;

public class FastHeadStyleInfo extends FastHeadInfo {
    public FastHeadStyleInfo() {
        setTagName("style");
    }

    @Override
    public boolean isWriteHtml() {
        return getMapWrap().getBoolean("data-write-html", false);
    }
}
