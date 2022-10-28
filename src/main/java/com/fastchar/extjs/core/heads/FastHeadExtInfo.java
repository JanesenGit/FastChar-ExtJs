package com.fastchar.extjs.core.heads;

import com.fastchar.core.FastChar;
import com.fastchar.extjs.utils.ColorUtils;
import com.fastchar.utils.FastStringUtils;

import java.io.File;

public class FastHeadExtInfo extends FastHeadInfo {
    public FastHeadExtInfo() {
        this.setTagName("ext");
    }

    public String getName() {
        return mapWrap.getString("name");
    }
    
    public void setName(String name) {
        put("name", name);
    }

    public String getValue() {
        return mapWrap.getString("value");
    }
    
    public void setValue(String value) {
        put("value", value);
    }

    public String getHref() {
        return mapWrap.getString("href");
    }
    
    public void setHref(String href) {
        put("href", href);
    }

    public String getContent() {
        return mapWrap.getString("content");
    }
    
    public void setContent(String content) {
        put("content", content);
    }

    public String getColorValue() {
        if (ColorUtils.isRgbColor(getValue())) {
            return getValue();
        }
        return "#" + FastStringUtils.stripStart(getValue(), "#");
    }

    public boolean isExistFile() {
        return new File(FastChar.getPath().getWebRootPath(), getValue()).exists();
    }


    @Override
    public boolean isWriteHtml() {
        return false;
    }
}
