package com.fastchar.extjs.core.database;

import com.fastchar.core.FastBaseInfo;
import com.fastchar.database.info.FastColumnInfo;

public class FastExtLinkInfo extends FastBaseInfo {

    private String tableName;//被关联的表明
    private String keyColumnName;//被关联的key列名
    private String textColumnName;//被关联的text列名

    private FastColumnInfo<?> keyColumn;
    private FastColumnInfo<?> textColumn;

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

    public String getTextColumnName() {
        return textColumnName;
    }

    public FastExtLinkInfo setTextColumnName(String textColumnName) {
        this.textColumnName = textColumnName;
        return this;
    }


    public FastColumnInfo<?> getKeyColumn() {
        return keyColumn;
    }

    public FastExtLinkInfo setKeyColumn(FastColumnInfo<?> keyColumn) {
        this.keyColumn = keyColumn;
        return this;
    }

    public FastColumnInfo<?> getTextColumn() {
        return textColumn;
    }

    public FastExtLinkInfo setTextColumn(FastColumnInfo<?> textColumn) {
        this.textColumn = textColumn;
        return this;
    }
}
