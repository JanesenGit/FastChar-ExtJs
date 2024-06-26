package com.fastchar.extjs.core.appjs;

import com.fastchar.core.FastResource;
import com.fastchar.utils.FastNumberUtils;

import java.io.File;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class FastExtJsFile {
    private static final  String REG_STR = "([@.]([0-9]+)).js";
    private FastResource file;

    public FastExtJsFile(FastResource file) {
        this.file = file;
    }

    public FastResource getFile() {
        return file;
    }

    public FastExtJsFile setFile(FastResource file) {
        this.file = file;
        return this;
    }


    public int getLevel() {
        Pattern compile = Pattern.compile(REG_STR, Pattern.CASE_INSENSITIVE);
        Matcher matcher = compile.matcher(file.getName());
        if (matcher.find()) {
            return FastNumberUtils.formatToInt(matcher.group(2));
        }
        return Integer.MAX_VALUE;
    }

    public String getFileCode() {
        return file.getName().split("\\.")[0];
    }
}
