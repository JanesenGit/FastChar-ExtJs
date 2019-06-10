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
import com.fastchar.utils.FastMD5Utils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * 覆盖FastSql类
 */
@AFastPriority(AFastPriority.P_HIGH)
@AFastOverride
public class FastExtMySql extends FastMySql {

    public FastSqlInfo toSelectLayerValueSql(FastEntity<?> entity) {
        if (entity == null) {
            return null;
        }
        if (entity instanceof FastExtEntity) {
            FastExtEntity extEntity = (FastExtEntity) entity;

            FastColumnInfo layerColumn = extEntity.getLayerColumn();
            if (layerColumn == null) {
                return null;
            }

            List<Object> values = new ArrayList<>();
            StringBuilder sqlStr = new StringBuilder("select " + layerColumn.getName() + " as layer from " + entity.getTableName() + " where 1=1 ");
            for (FastColumnInfo primary : entity.getPrimaries()) {
                sqlStr.append(" and ").append(primary.getName()).append(" = ? ");
                if (entity.isEmpty(primary.getName())) {
                    throw new FastSqlException(FastChar.getLocal().getInfo("Db_Sql_Error4", "'" + primary.getName() + "'"));
                }
                values.add(getColumnValue(entity, primary));
            }
            FastSqlInfo sqlInfo = newSqlInfo();
            sqlInfo.setSql(sqlStr.toString());
            sqlInfo.setParams(values);
            return sqlInfo;
        }
        return null;
    }


    public FastSqlInfo toUpdateLayerSql(FastTableInfo tableInfo, String oldLayerValue, String newLayerValue) {
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
            FastExtEntity extEntity = (FastExtEntity) entity;
            //配置权限字段
            FastExtColumnInfo layerColumn = extEntity.getLayerColumn();
            if (layerColumn != null) {
                String parentLayerCode = extEntity.getString("parentLayerCode");

                if (FastStringUtils.isEmpty(parentLayerCode)) {
                    FastExtColumnInfo layerLinkColumn = extEntity.getLayerLinkColumn();
                    if (layerLinkColumn != null && entity.isNotEmpty(layerLinkColumn.getName())
                            && layerLinkColumn.getLinkInfo() != null) {
                        List<FastEntities.EntityInfo> entityInfo = FastChar.getEntities().getEntityInfo(layerLinkColumn.getLinkInfo().getTableName());
                        FastEntity fastEntity = FastClassUtils.newInstance(entityInfo.get(0).getTargetClass());
                        if (fastEntity instanceof FastExtEntity) {
                            FastExtEntity linkExtEntity = (FastExtEntity) fastEntity;
                            fastEntity.set(layerLinkColumn.getLinkInfo().getKeyColumnName(), entity.get(layerLinkColumn.getName()));
                            parentLayerCode = linkExtEntity.selectLayerValue();
                        }
                    }
                }

                String myLayerCode = FastMD5Utils.MD5(FastStringUtils.buildOnlyCode(entity.getTableName()));
                if (FastStringUtils.isNotEmpty(parentLayerCode)) {
                    myLayerCode = parentLayerCode + "@" + myLayerCode;
                }
                entity.set(layerColumn.getName(), myLayerCode);
            }
        }
        return super.buildInsertSql(entity,checks);
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
