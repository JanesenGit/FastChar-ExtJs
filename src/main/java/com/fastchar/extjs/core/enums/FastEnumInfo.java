package com.fastchar.extjs.core.enums;

import com.fastchar.core.FastMapWrap;

import java.util.LinkedHashMap;

public class FastEnumInfo extends LinkedHashMap<String, Object> {
    protected transient FastMapWrap mapWrap;

    public FastEnumInfo() {
        super(16);
        mapWrap = FastMapWrap.newInstance(this);
    }

    public FastMapWrap getMapWrap() {
        return mapWrap;
    }

    public String getName() {
        return mapWrap.getString("name");
    }

    public FastEnumInfo setName(String name) {
        put("name", name);
        return this;
    }

    public Object getId() {
        return mapWrap.get("id");
    }

    public FastEnumInfo setId(Object id) {
        put("id", id);
        return this;
    }

    public String getText() {
        return mapWrap.getString("text");
    }

    public FastEnumInfo setText(String text) {
        put("text", text);
        return this;
    }

    public String getString(String name) {
        return mapWrap.getString(name);
    }
}
