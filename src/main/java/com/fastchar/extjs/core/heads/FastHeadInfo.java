package com.fastchar.extjs.core.heads;

import com.fastchar.core.FastBaseInfo;
import com.fastchar.utils.FastStringUtils;

public class FastHeadInfo extends FastBaseInfo {
    private String text;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public boolean isWriteHtml() {
        return true;
    }

    @Override
    public void fromProperty() {
        super.fromProperty();
        put("tag", getTagName());
        put("text", getText());
    }

}
