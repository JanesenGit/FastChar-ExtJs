package com.fastchar.extjs.info;

import java.util.List;
import java.util.Map;

public class ExtExcelModelInfo {

    private int titleRowNum;
    private int beginRowNum;

    private List<Map<String, Object>> columns;

    public int getTitleRowNum() {
        return titleRowNum;
    }

    public void setTitleRowNum(int titleRowNum) {
        this.titleRowNum = titleRowNum;
    }

    public int getBeginRowNum() {
        return beginRowNum;
    }

    public void setBeginRowNum(int beginRowNum) {
        this.beginRowNum = beginRowNum;
    }

    public List<Map<String, Object>> getColumns() {
        return columns;
    }

    public void setColumns(List<Map<String, Object>> columns) {
        this.columns = columns;
    }
}
