package com.fastchar.extjs.core.database;

import com.fastchar.core.FastChar;
import com.fastchar.database.info.FastDatabaseInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.utils.FastDateUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.*;

/**
 * 分表工具
 */
public class FastExtTableSplit {
    private static final String SPLIT_KEY = "_split_";
    private static final ThreadLocal<Map<String, String>> LOCKER_DATABASE_TABLE_NAME = new ThreadLocal<>();

    public static void lockSplitTableName(String splitTableName) {
        Map<String, String> lockMap = LOCKER_DATABASE_TABLE_NAME.get();
        if (lockMap == null) {
            lockMap = new LinkedHashMap<>();
        }
        lockMap.put(getTableName(splitTableName), splitTableName);
        LOCKER_DATABASE_TABLE_NAME.set(lockMap);
    }

    public static String getLockSplitTableName(String tableName) {
        Map<String, String> lockMap = LOCKER_DATABASE_TABLE_NAME.get();
        if (lockMap != null) {
            return lockMap.get(tableName);
        }
        return null;
    }

    public static String getTableName(String splitTableName) {
        return splitTableName.split(SPLIT_KEY)[0];
    }


    private final String database;
    private final String tableName;

    private TableSplitType splitType = TableSplitType.DateTime;

    private String splitValue = "yyyy_MM_dd";

    public FastExtTableSplit(String database, String tableName) {
        this.tableName = tableName;
        this.database = database;
    }

    public TableSplitType getSplitType() {
        return splitType;
    }

    public FastExtTableSplit setSplitType(TableSplitType splitType) {
        this.splitType = splitType;
        return this;
    }

    public String getSplitValue() {
        return splitValue;
    }

    public FastExtTableSplit setSplitValue(String splitValue) {
        this.splitValue = splitValue;
        return this;
    }

    public boolean isInitDatabase() {
        FastDatabaseInfo fastDatabaseInfo = FastChar.getDatabases().get(this.database);
        if (fastDatabaseInfo == null) {
            return false;
        }
        return fastDatabaseInfo.existTable(this.tableName);
    }

    /**
     * 获取实际操作的表格名称，不存在则创建表格
     * @return 表格名称
     */
    public String getRealTableName() throws Exception {
        String realTableName = this.tableName;

        if (this.splitType == TableSplitType.DateTime) {
            realTableName = this.tableName + SPLIT_KEY + FastDateUtils.format(new Date(), this.splitValue);
        }
        String lockSplitTableName = getLockSplitTableName(this.tableName);
        if (FastStringUtils.isNotEmpty(lockSplitTableName)) {
            realTableName = lockSplitTableName;
        }

        if (this.isInitDatabase()) {
            //如果系统初始化了数据库，则需要检测分表是否存在，不存在则创建表格
            FastDatabaseInfo fastDatabaseInfo = FastChar.getDatabases().get(this.database);
            boolean existTable = fastDatabaseInfo.existTable(realTableName);
            if (!existTable) {
                FastTableInfo<?> tableInfo = fastDatabaseInfo.getTableInfo(this.tableName);
                FastTableInfo<?> copyTable = tableInfo.copy();
                copyTable.setName(realTableName);
                fastDatabaseInfo.getOperate().createTable(fastDatabaseInfo, fastDatabaseInfo.addTable(copyTable));
            }
        }
        return realTableName;
    }



    /**
     * 获取所有分表的表名
     *
     * @return 集合
     */
    public List<String> getAllSplitTableName() {
        List<String> tableNames = new ArrayList<>();
        FastDatabaseInfo fastDatabaseInfo = FastChar.getDatabases().get(this.database);
        for (FastTableInfo<?> table : fastDatabaseInfo.getTables()) {
            if (table.getName().startsWith(this.tableName + SPLIT_KEY)) {
                tableNames.add(table.getName());
            }
        }
        return tableNames;
    }

    public String getNickName(String nickName, String splitTableName) {
        return splitTableName.replace(this.tableName + SPLIT_KEY, nickName);
    }

    public enum TableSplitType {
        DateTime,
    }


}


