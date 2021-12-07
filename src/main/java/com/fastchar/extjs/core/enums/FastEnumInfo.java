package com.fastchar.extjs.core.enums;

import com.fastchar.core.FastBaseInfo;

public class FastEnumInfo extends FastBaseInfo {
    private Object id;
    private String text;
    private String name;

    public String getName() {
        return name;
    }

    public FastEnumInfo setName(String name) {
        this.name = name;
        set("name", name);
        return this;
    }

    public Object getId() {
        return id;
    }

    public FastEnumInfo setId(Object id) {
        this.id = id;
        set("id", id);
        return this;
    }

    public String getText() {
        return text;
    }

    public FastEnumInfo setText(String text) {
        this.text = text;
        set("text", text);
        return this;
    }
}
