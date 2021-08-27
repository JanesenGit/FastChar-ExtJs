package com.fastchar.extjs.core.heads;

import com.fastchar.core.FastBaseInfo;
import com.fastchar.core.FastChar;
import com.fastchar.utils.FastStringUtils;

import java.io.File;

public class FastHeadInfo extends FastBaseInfo {
    private static final long serialVersionUID = 5565876705941162979L;
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
