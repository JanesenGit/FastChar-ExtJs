package com.fastchar.extjs.core.enums;

import com.fastchar.core.FastBaseInfo;

public class FastEnumInfo extends FastBaseInfo {
    private int id;
    private String text;

    public int getId() {
        return id;
    }

    public FastEnumInfo setId(int id) {
        this.id = id;
        return this;
    }

    public String getText() {
        return text;
    }

    public FastEnumInfo setText(String text) {
        this.text = text;
        return this;
    }
}
