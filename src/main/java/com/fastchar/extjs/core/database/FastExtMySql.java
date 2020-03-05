package com.fastchar.extjs.core.database;

import com.fastchar.annotation.AFastOverride;
import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntities;
import com.fastchar.core.FastEntity;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.database.sql.FastMySql;
import com.fastchar.exception.FastSqlException;
import com.fastchar.extjs.core.FastExtEntity;

import com.fastchar.utils.FastClassUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * 覆盖FastSql类
 */
@AFastPriority(AFastPriority.P_HIGH)
@AFastOverride
public class FastExtMySql extends FastMySql {

    public FastSqlInfo toSelectLayerValueSql(FastEntity<?> entity, String... checks) {
        if (entity == null) {
            return null;
        }
        if (entity instanceof FastExtEntity) {
            FastExtEntity<?> extEntity = (FastExtEntity<?>) entity;

            FastColumnInfo<?> layerColumn = extEntity.getLayerColumn();
            if (layerColumn == null) {
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

            StringBuilder sqlBuilder = new StringBuilder("select " + layerColumn.getName() + " as layer from " + entity.getTableName() + " where 1=1 ");

            if (checkColumns.size() == 0) {
                for (FastColumnInfo<?> primary : entity.getPrimaries()) {
                    if (entity.isEmpty(primary.getName())) {
                        throw new FastSqlException(FastChar.getLocal().getInfo("Db_Sql_Error4", "'" + primary.getName() + "'"));
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
        return null;
    }


    public FastSqlInfo buildCopyRecycleSql(FastEntity<?> entity, String... checks) {
        if (entity == null) {
            return null;
        }

        List<String> columns = new ArrayList<>();
        List<String> valueColumns = new ArrayList<>();
        List<FastColumnInfo<?>> tableColumns = entity.getTable().getColumns();
        for (FastColumnInfo<?> column : tableColumns) {
            if (column.isPrimary()) {
                continue;
            }
            columns.add(column.getName());
            valueColumns.add(column.getName());
        }
        List<Object> values = new ArrayList<>();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("insert into ").append(entity.getTableName()).append("_recycle").append(" (").append(FastStringUtils.join(columns, ",")).append(") ").append(" select ").append(FastStringUtils.join(valueColumns, ",")).append(" from ").append(entity.getTableName()).append(" where ").append(" 1=1 ");


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
                    throw new FastSqlException(FastChar.getLocal().getInfo("Db_Sql_Error4", "'" + primary.getName() + "'"));
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
        List<FastColumnInfo<?>> tableColumns = entity.getTable().getColumns();
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
                    throw new FastSqlException(FastChar.getLocal().getInfo("Db_Sql_Error4", "'" + primary.getName() + "'"));
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
                    throw new FastSqlException(FastChar.getLocal().getInfo("Db_Sql_Error4", "'" + primary.getName() + "'"));
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
        setLayerValue(entity);
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
                String parentLayerCode = extEntity.getString("parentLayerCode");

                if (FastStringUtils.isEmpty(parentLayerCode)) {
                    FastExtColumnInfo layerLinkColumn = extEntity.getLayerLinkColumn();
                    if (layerLinkColumn != null && entity.isNotEmpty(layerLinkColumn.getName())
                            && layerLinkColumn.getLinkInfo() != null) {
                        List<FastEntities.EntityInfo> entityInfo = FastChar.getEntities().getEntityInfo(layerLinkColumn.getLinkInfo().getTableName());
                        FastEntity<?> fastEntity = FastClassUtils.newInstance(entityInfo.get(0).getTargetClass());
                        if (fastEntity instanceof FastExtEntity) {
                            FastExtEntity<?> linkExtEntity = (FastExtEntity<?>) fastEntity;
                            fastEntity.set(layerLinkColumn.getLinkInfo().getKeyColumnName(), entity.get(layerLinkColumn.getName()));
                            parentLayerCode = linkExtEntity.selectLayerValue(layerLinkColumn.getLinkInfo().getKeyColumnName());
                        }
                    }
                }

                String myLayerCode = extEntity.buildLayerCode(parentLayerCode);
                entity.set(layerColumn.getName(), myLayerCode);
            }
        }
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
            List<FastColumnInfo<?>> tableColumns = extEntity.getTable().getColumns();
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
                    throw new FastSqlException(FastChar.getLocal().getInfo("Db_Sql_Error4", "'" + primary.getName() + "'"));
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

    //    同步更新层级编号
//    @Override
//    public FastSqlInfo toUpdateSql(FastEntity<?> entity, String... checks) {
//        List<FastSqlInfo> children = new ArrayList<>();
//        //更新层级编号
//        if (entity instanceof FastExtEntity) {
//            FastExtEntity extEntity = (FastExtEntity) entity;
//            List<String> modified = new ArrayList<>(entity.getModified());
//            for (String key : modified) {
//                FastColumnInfo columnInfo = entity.getColumn(key);
//                if (columnInfo instanceof FastExtColumnInfo) {
//                    FastExtColumnInfo extColumnInfo = (FastExtColumnInfo) columnInfo;
//                    //更新层级编号
//                    if (extColumnInfo.isBindLayer() && extEntity.getLayerColumn() != null) {
//
//                        String parentLayerCode = extEntity.getString("parentLayerCode");
//
//                        if (extColumnInfo.getLinkInfo() != null && FastStringUtils.isEmpty(parentLayerCode)) {
//                            Object columnValue = getColumnValue(entity, columnInfo);
//                            List<FastEntities.EntityInfo> entityInfo = FastChar.getEntities().getEntityInfo(extColumnInfo.getLinkInfo().getTableName());
//                            FastEntity parentEntity = FastClassUtils.newInstance(entityInfo.get(0).getTargetClass());
//                            if (parentEntity instanceof FastExtEntity) {
//                                parentEntity.set(extColumnInfo.getLinkInfo().getKeyColumnName(), columnValue);
//                                parentLayerCode = ((FastExtEntity) parentEntity).selectLayerValue();
//                            }
//                        }
//
//                        if (FastStringUtils.isNotEmpty(parentLayerCode)) {
//                            String newLayerCode = parentLayerCode + "@" + FastMD5Utils.MD5(FastStringUtils.buildOnlyCode(entity.getTableName()));
//                            extEntity.set(extEntity.getLayerColumn().getName(), newLayerCode);
//                            String oldLayerCode = extEntity.selectLayerValue();
//
//                            for (FastTableInfo<?> table : FastChar.getDatabases().get(extEntity.getDatabase()).getTables()) {
//                                FastSqlInfo sqlInfo = toUpdateLayerSql(table, oldLayerCode, newLayerCode);
//                                if (sqlInfo != null) {
//                                    sqlInfo.setLog(false);
//                                    children.add(sqlInfo);
//                                }
//                            }
//                        }
//                    }
//                }
//            }
//        }
//        FastSqlInfo sqlInfo = super.toUpdateSql(entity,checks);
//        if (sqlInfo != null) {
//            sqlInfo.setChildren(children);
//        }
//        return sqlInfo;
//    }
}
