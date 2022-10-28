package com.fastchar.extjs.core.database;

import com.fastchar.annotation.AFastOverride;
import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.database.FastData;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.database.sql.FastSql;
import com.fastchar.exception.FastSqlException;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.extjs.core.database.mysql.FastExtMySql;


/**
 * 覆盖FastData类
 */
@AFastPriority(AFastPriority.P_HIGH)
@AFastOverride
public class FastExtData<T extends FastEntity<?>> extends FastData<T> {

    public FastExtData(T target) {
        super(target);
    }

    public String selectLayerValue(String... checks) {
        try {
            FastSql fastSql = FastSql.getInstance(getDatabaseType());
            if (fastSql instanceof FastExtMySql) {

                if (target instanceof FastExtEntity) {
                    FastExtEntity<?> extEntity = (FastExtEntity<?>) target;

                    FastColumnInfo<?> layerColumn = extEntity.getLayerColumn();
                    if (layerColumn == null) {
                        return null;
                    }
                    String column = layerColumn.getName() + " as layer";
                    FastSqlInfo sqlInfo = ((FastExtMySql) fastSql).toSelectValueSql(target, new String[]{column}, checks);
                    if (sqlInfo == null) {
                        return null;
                    }
                    FastEntity<?> fastEntity = FastChar.getDB()
                            .setDatabase(target.getDatabase())
                            .setIgnoreCase(target.isIgnoreCase())
                            .setListener(target.getBoolean("sqlListener"))
                            .setLog(target.getBoolean("log", true))
                            .selectFirst(sqlInfo.getSql(), sqlInfo.toParams());

                    if (fastEntity != null) {
                        return fastEntity.getString("layer");
                    }
                }
                return null;
            }
        } catch (Exception e) {
            setError(e);
            throw new FastSqlException(e);
        }
        throw new FastSqlException("暂未支持" + getDatabaseType() + "层级权限配置！");
    }

    public T selectFirstValue(String[] columns, String... checks) {
        try {
            FastSql fastSql = FastSql.getInstance(getDatabaseType());
            if (fastSql instanceof FastExtMySql) {

                FastSqlInfo sqlInfo = ((FastExtMySql) fastSql).toSelectValueSql(target, columns, checks);
                if (sqlInfo == null) {
                    return null;
                }
                return (T) target.selectFirstBySql(sqlInfo.getSql(), sqlInfo.toParams());
            }
        } catch (Exception e) {
            setError(e);
            throw new FastSqlException(e);
        }
        throw new FastSqlException("暂未支持" + getDatabaseType() + "层级权限配置！");
    }

    public boolean copyToRecycle(String... checks) {
        try {
            FastSql instance = FastSql.getInstance(getDatabaseType());
            if (instance instanceof FastExtMySql) {
                FastExtMySql extMySql = (FastExtMySql) instance;
                FastSqlInfo sqlInfo = extMySql.buildCopyToRecycleSql(target, checks);
                if (sqlInfo == null) {
                    return false;
                }
                int insert = FastChar.getDB()
                        .setDatabase(target.getDatabase())
                        .setIgnoreCase(target.isIgnoreCase())
                        .setListener(target.getBoolean("sqlListener"))
                        .setLog(target.getBoolean("log", true))
                        .insert(sqlInfo.getSql(), sqlInfo.toParams());
                return insert > 0;
            }
            throw new FastSqlException("暂不支持回收站！" + instance.getClass());
        } catch (Exception e) {
            setError(e);
            throw new FastSqlException(e);
        }
    }


    public boolean copyFromRecycle(String... checks) {
        try {
            FastSql instance = FastSql.getInstance(getDatabaseType());
            if (instance instanceof FastExtMySql) {
                FastExtMySql extMySql = (FastExtMySql) instance;
                FastSqlInfo sqlInfo = extMySql.buildCopyFromRecycleSql(target, checks);
                if (sqlInfo == null) {
                    return false;
                }
                int insert = FastChar.getDB()
                        .setDatabase(target.getDatabase())
                        .setIgnoreCase(target.isIgnoreCase())
                        .setListener(target.getBoolean("sqlListener"))
                        .setLog(target.getBoolean("log", true))
                        .insert(sqlInfo.getSql(), sqlInfo.toParams());
                return insert > 0;
            }
            throw new FastSqlException("暂不支持回收站！" + instance.getClass());
        } catch (Exception e) {
            setError(e);
            throw new FastSqlException(e);
        }
    }

    public boolean deleteRecycle(String... checks) {
        try {
            FastSql instance = FastSql.getInstance(getDatabaseType());
            if (instance instanceof FastExtMySql) {
                FastExtMySql extMySql = (FastExtMySql) instance;
                FastSqlInfo sqlInfo = extMySql.buildDeleteFromRecycleSql(target, checks);
                if (sqlInfo == null) {
                    return false;
                }
                int insert = FastChar.getDB()
                        .setDatabase(target.getDatabase())
                        .setIgnoreCase(target.isIgnoreCase())
                        .setListener(target.getBoolean("sqlListener"))
                        .setLog(target.getBoolean("log", true))
                        .insert(sqlInfo.getSql(), sqlInfo.toParams());
                return insert > 0;
            }
            throw new FastSqlException("暂不支持回收站！" + instance.getClass());
        } catch (Exception e) {
            setError(e);
            throw new FastSqlException(e);
        }
    }


    public int updateSameValue(String... checks) {
        try {
            FastSql fastSql = FastSql.getInstance(getDatabaseType());
            if (fastSql instanceof FastExtMySql) {
                if (target instanceof FastExtEntity) {
                    FastSqlInfo sqlInfo = ((FastExtMySql) fastSql).buildUpdateSameSql(target, checks);
                    if (sqlInfo == null) {
                        return 0;
                    }
                    return FastChar.getDB()
                            .setDatabase(target.getDatabase())
                            .setIgnoreCase(target.isIgnoreCase())
                            .setListener(target.getBoolean("sqlListener"))
                            .setLog(target.getBoolean("log", true))
                            .update(sqlInfo.getSql(), sqlInfo.toParams());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return 0;
    }
    
}
