package com.fastchar.extjs.core.database;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastMapWrap;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastDatabaseInfo;
import com.fastchar.database.info.FastTableInfo;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;

public class FastExtLinkInfo extends LinkedHashMap<String, Object> {

    protected transient FastMapWrap mapWrap;

    public FastExtLinkInfo() {
        super(16);
        mapWrap = FastMapWrap.newInstance(this);
    }

    public FastMapWrap getMapWrap() {
        return mapWrap;
    }

    public FastExtLinkInfo setDatabase(String database) {
        put("database", database);
        return this;
    }
    public String getDatabase() {
        return mapWrap.getString("database");
    }

    public String getTableName() {
        return mapWrap.getString("tableName");
    }

    public FastExtLinkInfo setTableName(String tableName) {
        put("tableName", tableName);
        return this;
    }

    public String getKeyColumnName() {
        return mapWrap.getString("keyColumnName");
    }

    public FastExtLinkInfo setKeyColumnName(String keyColumnName) {
        put("keyColumnName", keyColumnName);
        return this;
    }

    public FastColumnInfo<?> getKeyColumn() {
        return getTableInfo().getColumnInfo(getKeyColumnName());
    }

    public FastExtLinkInfo addTextColumnName(String textColumnName) {
        getTextColumnNames().add(textColumnName);
        return this;
    }

    public LinkedHashSet<String> getTextColumnNames() {
        LinkedHashSet<String> textColumnNames = mapWrap.getObject("textColumnNames");
        if (textColumnNames == null) {
            textColumnNames = new LinkedHashSet<>(16);
            put("textColumnNames", textColumnNames);
        }
        return textColumnNames;
    }

    public FastColumnInfo<?> getTextColumnInfo(String textColumnName) {
        return getTableInfo().getColumnInfo(textColumnName);
    }

    public FastTableInfo<?> getTableInfo() {
        FastDatabaseInfo databaseInfo = FastChar.getDatabases().get(getDatabase());
        return databaseInfo.getTableInfo(getTableName());
    }
}
