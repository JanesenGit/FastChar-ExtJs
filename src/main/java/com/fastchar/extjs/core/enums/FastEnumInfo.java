package com.fastchar.extjs.core.enums;

import com.fastchar.core.FastBaseInfo;

public class FastEnumInfo extends FastBaseInfo {
    private static final long serialVersionUID = 1443478881929662576L;
    private int id;
    private String text;

    public int getId() {
        return id;
    }

    public FastEnumInfo setId(int id) {
        this.id = id;
        put("id", id);
        return this;
    }

    public String getText() {
        return text;
    }

    public FastEnumInfo setText(String text) {
        this.text = text;
        put("text", text);
        return this;
    }
}
