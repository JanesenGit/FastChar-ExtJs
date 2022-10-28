package com.fastchar.extjs.utils;

import org.apache.poi.ss.usermodel.*;

import java.util.HashMap;
import java.util.Map;

public class POIHelper {

    private final Map<String, CellStyle> styleMap = new HashMap<>();

    private final Map<String, Font> fontMap = new HashMap<>();

    private final Workbook workbook;

    public POIHelper(Workbook workbook) {
        this.workbook = workbook;
    }

    public CellStyle getCellStyle(String key) {
        if (!styleMap.containsKey(key)) {
            CellStyle cellStyle = workbook.createCellStyle();
            styleMap.put(key, cellStyle);
        }
        return styleMap.get(key);
    }

    public Font getFont(String key) {
        if (!fontMap.containsKey(key)) {
            fontMap.put(key, workbook.createFont());
        }
        return fontMap.get(key);
    }



}
