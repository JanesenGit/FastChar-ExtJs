package com.fastchar.extjs.core.database;

import com.fastchar.annotation.AFastOverride;
import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.database.FastData;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.database.sql.FastSql;
import com.fastchar.exception.FastSqlException;
import com.fastchar.extjs.core.FastExtEntity;


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
                FastSqlInfo sqlInfo = ((FastExtMySql) fastSql).toSelectLayerValueSql(target, checks);
                if (sqlInfo == null) {
                    return null;
                }
                FastEntity<?> fastEntity = FastChar.getDb().selectFirst(sqlInfo.getSql(), sqlInfo.toParams());
                if (fastEntity != null) {
                    return fastEntity.getString("layer");
                }
                return null;
            }
        } catch (Exception e) {
            setError(e);
            throw new FastSqlException(e);
        }
        throw new FastSqlException("暂未支持" + getDatabaseType() + "层级权限配置！");
    }


    public boolean copyRecycle(String... checks) {
        try {
            FastSql instance = FastSql.getInstance(getDatabaseType());
            if (instance instanceof FastExtMySql) {
                FastExtMySql extMySql = (FastExtMySql) instance;
                FastSqlInfo sqlInfo = extMySql.buildCopyRecycleSql(target, checks);
                if (sqlInfo == null) {
                    return false;
                }
                int insert = FastChar.getDb()
                        .setDatabase(target.getDatabase())
                        .setLog(sqlInfo.isLog())
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
                int insert = FastChar.getDb()
                        .setDatabase(target.getDatabase())
                        .setLog(sqlInfo.isLog())
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
                int insert = FastChar.getDb()
                        .setDatabase(target.getDatabase())
                        .setLog(sqlInfo.isLog())
                        .insert(sqlInfo.getSql(), sqlInfo.toParams());
                return insert > 0;
            }
            throw new FastSqlException("暂不支持回收站！" + instance.getClass());
        } catch (Exception e) {
            setError(e);
            throw new FastSqlException(e);
        }
    }
}
