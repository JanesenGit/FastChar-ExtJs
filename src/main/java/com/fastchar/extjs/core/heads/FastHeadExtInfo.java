package com.fastchar.extjs.core.heads;

import com.fastchar.core.FastChar;
import com.fastchar.utils.FastStringUtils;

import java.io.File;

public class FastHeadExtInfo extends FastHeadInfo {
    public FastHeadExtInfo() {
        this.setTagName("ext");
    }
    private String name;
    private String value;
    private String href;
    private String content;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getHref() {
        return href;
    }

    public void setHref(String href) {
        this.href = href;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getColorValue() {
        return "#" + FastStringUtils.stripStart(getValue(), "#");
    }

    public boolean isExistFile() {
        return new File(FastChar.getPath().getWebRootPath(), value).exists();
    }


    @Override
    public boolean isWriteHtml() {
        return false;
    }
}
