package com.fastchar.extjs.core.heads;

import com.fastchar.core.FastMapWrap;

import java.util.LinkedHashMap;

public class FastHeadInfo  extends LinkedHashMap<String, Object> {
    private static final long serialVersionUID = 5565876705941162979L;
    protected transient FastMapWrap mapWrap;

    public FastHeadInfo() {
        super(16);
        mapWrap = FastMapWrap.newInstance(this);
    }

    public FastMapWrap getMapWrap() {
        return mapWrap;
    }

    public void setTagName(String tagName) {
        put("tag", tagName);
    }
    public String getTagName() {
        return  mapWrap.getString("tag");
    }


    public String getText() {
        return mapWrap.getString("text", "");
    }
    
    public void setText(String text) {
        put("text", text);
    }

    public boolean isWriteHtml() {
        return true;
    }


}
