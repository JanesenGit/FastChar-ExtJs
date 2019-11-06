package com.fastchar.extjs.core.database;

import com.fastchar.core.FastBaseInfo;
import com.fastchar.database.info.FastColumnInfo;

import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;

public class FastExtLinkInfo extends FastBaseInfo {

    private static final long serialVersionUID = -2930962312837008230L;
    private String tableName;//被关联的表明
    private String keyColumnName;//被关联的key列名
    private LinkedHashSet<String> textColumnNames = new LinkedHashSet<>();//被关联的text列名
    private Map<String, FastColumnInfo<?>> textColumnInfo = new HashMap<>();


    private FastColumnInfo<?> keyColumn;

    public String getTableName() {
        return tableName;
    }

    public FastExtLinkInfo setTableName(String tableName) {
        this.tableName = tableName;
        return this;
    }

    public String getKeyColumnName() {
        return keyColumnName;
    }

    public FastExtLinkInfo setKeyColumnName(String keyColumnName) {
        this.keyColumnName = keyColumnName;
        return this;
    }

    public FastColumnInfo<?> getKeyColumn() {
        return keyColumn;
    }

    public FastExtLinkInfo setKeyColumn(FastColumnInfo<?> keyColumn) {
        this.keyColumn = keyColumn;
        return this;
    }

    public FastExtLinkInfo addTextColumnName(String textColumnName) {
        this.textColumnNames.add(textColumnName);
        return this;
    }

    public LinkedHashSet<String> getTextColumnNames() {
        return textColumnNames;
    }

    public FastExtLinkInfo putTextColumnInfo(String textColumnName, FastColumnInfo<?> columnInfo) {
        this.textColumnInfo.put(textColumnName, columnInfo);
        return this;
    }

    public FastColumnInfo<?> getTextColumnInfo(String textColumnName) {
        return this.textColumnInfo.get(textColumnName);
    }

}
