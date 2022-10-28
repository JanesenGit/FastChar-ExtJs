package com.fastchar.extjs.core.database.mysql;

import com.fastchar.annotation.AFastOverride;
import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.database.sql.FastMySql;
import com.fastchar.exception.FastSqlException;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.extjs.core.FastExtLayerHelper;
import com.fastchar.extjs.core.FastExtSameHelper;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.local.FastCharLocal;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * 覆盖FastSql类
 */
@AFastPriority(AFastPriority.P_HIGH)
@AFastOverride
public class FastExtMySql extends FastMySql {

    public FastSqlInfo toSelectValueSql(FastEntity<?> entity, String[] columns, String... checks) {
        if (entity == null) {
            return null;
        }

        List<Object> values = new ArrayList<>();
        List<String> checkColumns = new ArrayList<>();
        for (String key : checks) {
            FastColumnInfo<?> column = entity.getColumn(key);
            if (column != null) {
                checkColumns.add(key);
            }
        }
        StringBuilder sqlBuilder = new StringBuilder("select " + FastStringUtils.join(columns, ",") + " from " + entity.getTableName() + " where 1=1 ");

        if (checkColumns.size() == 0) {
            for (FastColumnInfo<?> primary : entity.getPrimaries()) {
                if (entity.isEmpty(primary.getName())) {
                    throw new FastSqlException(FastChar.getLocal().getInfo(FastCharLocal.DB_SQL_ERROR4, "'" + primary.getName() + "'"));
                }
                sqlBuilder.append(" and ").append(primary.getName()).append(" = ? ");
                values.add(getColumnValue(entity, primary));
            }
        } else {
            for (String check : checkColumns) {
                FastColumnInfo<?> column = entity.getColumn(check);
                if (column != null) {
                    sqlBuilder.append(" and ").append(check).append(" = ? ");
                    values.add(getColumnValue(entity, column));
                }
            }
        }

        FastSqlInfo sqlInfo = newSqlInfo();
        sqlInfo.setSql(sqlBuilder.toString());
        sqlInfo.setParams(values);
        return sqlInfo;
    }


    public FastSqlInfo buildCopyToRecycleSql(FastEntity<?> entity, String... checks) {
        if (entity == null) {
            return null;
        }

        List<String> columns = new ArrayList<>();
        List<String> valueColumns = new ArrayList<>();
        Collection<FastColumnInfo<?>> tableColumns = entity.getTable().getColumns();
        for (FastColumnInfo<?> column : tableColumns) {
            if (column.isPrimary()) {
                continue;
            }
            columns.add(column.getName());
            valueColumns.add(column.getName());
        }
        List<Object> values = new ArrayList<>();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("insert into ")
                .append(entity.getTableName())
                .append("_recycle")
                .append(" (")
                .append(FastStringUtils.join(columns, ","))
                .append(") ")
                .append(" select ")
                .append(FastStringUtils.join(valueColumns, ","))
                .append(" from ")
                .append(entity.getTableName())
                .append(" where ").append(" 1=1 ");


        List<String> checkColumns = new ArrayList<>();
        for (String key : checks) {
            FastColumnInfo<?> column = entity.getColumn(key);
            if (column != null) {
                checkColumns.add(key);
            }
        }

        if (checkColumns.size() == 0) {
            for (FastColumnInfo<?> primary : entity.getPrimaries()) {
                if (entity.isEmpty(primary.getName())) {
                    throw new FastSqlException(FastChar.getLocal().getInfo(FastCharLocal.DB_SQL_ERROR4, "'" + primary.getName() + "'"));
                }
                sqlBuilder.append(" and ").append(primary.getName()).append(" = ? ");
                values.add(getColumnValue(entity, primary));
            }
        } else {
            for (String check : checkColumns) {
                FastColumnInfo<?> column = entity.getColumn(check);
                if (column != null) {
                    sqlBuilder.append(" and ").append(check).append(" = ? ");
                    values.add(getColumnValue(entity, column));
                }
            }
        }

        FastSqlInfo sqlInfo = newSqlInfo();
        sqlInfo.setSql(sqlBuilder.toString());
        sqlInfo.setLog(entity.getBoolean("log", true));
        sqlInfo.setParams(values);
        return sqlInfo;
    }


    public FastSqlInfo buildCopyFromRecycleSql(FastEntity<?> entity, String... checks) {
        if (entity == null) {
            return null;
        }

        List<String> columns = new ArrayList<>();
        List<String> valueColumns = new ArrayList<>();
        Collection<FastColumnInfo<?>> tableColumns = entity.getTable().getColumns();
        for (FastColumnInfo<?> column : tableColumns) {
            if (column.isPrimary()) {
                continue;
            }
            columns.add(column.getName());
            valueColumns.add(column.getName());
        }
        List<Object> values = new ArrayList<>();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("insert into ").append(entity.getTableName()).append(" (").append(FastStringUtils.join(columns, ",")).append(") ").append(" select ").append(FastStringUtils.join(valueColumns, ",")).append(" from ").append(entity.getTableName()).append("_recycle").append(" where ").append(" 1=1 ");


        List<String> checkColumns = new ArrayList<>();
        for (String key : checks) {
            FastColumnInfo<?> column = entity.getColumn(key);
            if (column != null) {
                checkColumns.add(key);
            }
        }

        if (checkColumns.size() == 0) {
            for (FastColumnInfo<?> primary : entity.getPrimaries()) {
                if (entity.isEmpty(primary.getName())) {
                    throw new FastSqlException(FastChar.getLocal().getInfo(FastCharLocal.DB_SQL_ERROR4, "'" + primary.getName() + "'"));
                }
                sqlBuilder.append(" and ").append(primary.getName()).append(" = ? ");
                values.add(getColumnValue(entity, primary));
            }
        } else {
            for (String check : checkColumns) {
                FastColumnInfo<?> column = entity.getColumn(check);
                if (column != null) {
                    sqlBuilder.append(" and ").append(check).append(" = ? ");
                    values.add(getColumnValue(entity, column));
                }
            }
        }

        FastSqlInfo sqlInfo = newSqlInfo();
        sqlInfo.setSql(sqlBuilder.toString());
        sqlInfo.setLog(entity.getBoolean("log", true));
        sqlInfo.setParams(values);
        return sqlInfo;
    }


    public FastSqlInfo buildDeleteFromRecycleSql(FastEntity<?> entity, String... checks) {
        if (entity == null) {
            return null;
        }

        List<Object> values = new ArrayList<>();
        StringBuilder sqlBuilder = new StringBuilder("delete from " + entity.getTableName() + "_recycle" + " where 1=1 ");

        List<String> checkColumns = new ArrayList<>();
        for (String key : checks) {
            FastColumnInfo<?> column = entity.getColumn(key);
            if (column != null) {
                checkColumns.add(key);
            }
        }

        if (checkColumns.size() == 0) {
            for (FastColumnInfo<?> primary : entity.getPrimaries()) {
                if (entity.isEmpty(primary.getName())) {
                    throw new FastSqlException(FastChar.getLocal().getInfo(FastCharLocal.DB_SQL_ERROR4, "'" + primary.getName() + "'"));
                }
                sqlBuilder.append(" and ").append(primary.getName()).append(" = ? ");
                values.add(getColumnValue(entity, primary));
            }
        } else {
            for (String check : checkColumns) {
                FastColumnInfo<?> column = entity.getColumn(check);
                if (column != null) {
                    sqlBuilder.append(" and ").append(check).append(" = ? ");
                    values.add(getColumnValue(entity, column));
                }
            }
        }

        FastSqlInfo sqlInfo = newSqlInfo();
        sqlInfo.setSql(sqlBuilder.toString());
        sqlInfo.setLog(entity.getBoolean("log", true));
        sqlInfo.setParams(values);
        return sqlInfo;
    }


    public FastSqlInfo toUpdateLayerSql(FastTableInfo<?> tableInfo, String oldLayerValue, String newLayerValue) {
        if (tableInfo == null) {
            return null;
        }
        if (tableInfo instanceof FastExtTableInfo) {
            FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
            if (extTableInfo.getLayerColumn() == null) {
                return null;
            }
            String name = extTableInfo.getLayerColumn().getName();
            String sqlStr = "update " + extTableInfo.getName() + " set " + name + "=replace(" + name + ",'" + oldLayerValue + "','" + newLayerValue + "') where " + name + " like '" + oldLayerValue + "%'";
            FastSqlInfo sqlInfo = newSqlInfo();
            sqlInfo.setSql(sqlStr);
            return sqlInfo;
        }
        return null;
    }


    @Override
    public FastSqlInfo buildInsertSql(FastEntity<?> entity, String... checks) {
        if (entity instanceof FastExtEntity) {
            @SuppressWarnings("unchecked")
            FastExtEntity<FastEntity<?>> extEntity = (FastExtEntity<FastEntity<?>>) entity;
            if (extEntity.isAutoSetLayerValue()) {
                setLayerValue(entity);
            }
            if (extEntity.isAutoSetSameValue()) {
                setSameValue(entity);
            }
        }
        return super.buildInsertSql(entity, checks);
    }

    /**
     * 设置权限编号的值
     */
    private void setLayerValue(FastEntity<?> entity) {
        if (entity instanceof FastExtEntity) {
            FastExtEntity<?> extEntity = (FastExtEntity<?>) entity;
            //配置权限字段
            FastExtColumnInfo layerColumn = extEntity.getLayerColumn();
            if (layerColumn != null && entity.isEmpty(layerColumn.getName())) {
                entity.set(layerColumn.getName(), FastExtLayerHelper.buildLayerValue(entity));
            }
        }
    }

    /**
     * 当相同属性为空的时候，设置绑定关联表格相同属性的值
     */
    private void setSameValue(FastEntity<?> entity) {
        FastExtSameHelper.setSameValue(entity);
    }


    @Override
    public FastSqlInfo buildCopySql(FastEntity<?> entity) {
        if (entity == null) {
            return null;
        }
        if (entity instanceof FastExtEntity) {
            FastExtEntity<?> extEntity = (FastExtEntity<?>) entity;
            List<String> columns = new ArrayList<>();
            List<String> valueColumns = new ArrayList<>();
            Collection<FastColumnInfo<?>> tableColumns = extEntity.getTable().getColumns();
            for (FastColumnInfo<?> column : tableColumns) {
                FastExtColumnInfo extColumn = (FastExtColumnInfo) column;
                if (extColumn.isPrimary()) {
                    continue;
                }
                columns.add(column.getName());
                if (extColumn.isLayer()) {
                    String selectLayerValue = extEntity.selectLayerValue();
                    extEntity.setLayerValue(selectLayerValue);
                    String newLayerCode = extEntity.buildLayerCode(extEntity.getParentLayerCode());
                    valueColumns.add("'" + newLayerCode + "'");
                    continue;
                }
                valueColumns.add(column.getName());
            }
            List<Object> values = new ArrayList<>();
            StringBuilder sqlBuilder = new StringBuilder();
            sqlBuilder.append("insert into ").append(entity.getTableName()).append(" (").append(FastStringUtils.join(columns, ",")).append(") ").append(" select ").append(FastStringUtils.join(valueColumns, ",")).append(" from ").append(entity.getTableName()).append(" where ").append(" 1=1 ");

            for (FastColumnInfo<?> primary : entity.getPrimaries()) {
                if (entity.isEmpty(primary.getName())) {
                    throw new FastSqlException(FastChar.getLocal().getInfo(FastCharLocal.DB_SQL_ERROR4, "'" + primary.getName() + "'"));
                }
                sqlBuilder.append(" and ").append(primary.getName()).append(" = ? ");
                values.add(getColumnValue(entity, primary));
            }
            FastSqlInfo sqlInfo = newSqlInfo();
            sqlInfo.setSql(sqlBuilder.toString());
            sqlInfo.setLog(entity.getBoolean("log", true));
            sqlInfo.setParams(values);
            return sqlInfo;
        }
        return super.buildCopySql(entity);
    }


    public FastSqlInfo buildUpdateSameSql(FastEntity<?> entity, String... checks) {
        String buildUpdateSameColumnSql = FastExtSameHelper.buildUpdateSameColumnSql((FastExtEntity<?>) entity);
        if (FastStringUtils.isEmpty(buildUpdateSameColumnSql)) {
            return null;
        }
        List<Object> values = new ArrayList<>();
        List<String> checkColumns = new ArrayList<>();
        for (String key : checks) {
            FastColumnInfo<?> column = entity.getColumn(key);
            if (column != null) {
                checkColumns.add(key);
            }
        }
        StringBuilder sqlBuilder = new StringBuilder(buildUpdateSameColumnSql + " where 1=1 ");

        if (checkColumns.size() == 0) {
            for (FastColumnInfo<?> primary : entity.getPrimaries()) {
                if (entity.isEmpty(primary.getName())) {
                    throw new FastSqlException(FastChar.getLocal().getInfo(FastCharLocal.DB_SQL_ERROR4, "'" + primary.getName() + "'"));
                }
                sqlBuilder.append(" and ").append(primary.getName()).append(" = ? ");
                values.add(getColumnValue(entity, primary));
            }
        } else {
            for (String check : checkColumns) {
                FastColumnInfo<?> column = entity.getColumn(check);
                if (column != null) {
                    sqlBuilder.append(" and ").append(check).append(" = ? ");
                    values.add(getColumnValue(entity, column));
                }
            }
        }

        FastSqlInfo sqlInfo = newSqlInfo();
        sqlInfo.setSql(sqlBuilder.toString());
        sqlInfo.setLog(entity.getBoolean("log", true));
        sqlInfo.setParams(values);
        return sqlInfo;
    }


}
