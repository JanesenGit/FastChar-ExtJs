package com.fastchar.extjs.core.database;

import com.fastchar.annotation.AFastOverride;
import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.database.FastData;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.database.sql.FastSql;
import com.fastchar.exception.FastSqlException;


/**
 * 覆盖FastData类
 */
@AFastPriority(AFastPriority.P_HIGH)
@AFastOverride
public class FastExtData extends FastData {

    public FastExtData(FastEntity target) {
        super(target);
    }


    public String selectLayerValue() {
        try {
            FastSql fastSql = FastSql.getInstance(getDatabaseType());
            if (fastSql instanceof FastExtMySql) {
                FastSqlInfo sqlInfo = ((FastExtMySql) fastSql).toSelectLayerValueSql(target);
                if (sqlInfo == null) {
                    return null;
                }
                FastEntity fastEntity = FastChar.getDb().selectFirst(sqlInfo.getSql(), sqlInfo.toParams());
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

}
