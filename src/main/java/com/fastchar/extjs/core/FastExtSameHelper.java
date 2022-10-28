package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntities;
import com.fastchar.core.FastEntity;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastExtLinkInfo;
import com.fastchar.utils.FastClassUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class FastExtSameHelper {


    /**
     * 当相同属性为空的时候，设置绑定关联表格相同属性的值
     */
    public static void setSameValue(FastEntity<?> entity) {
        if (entity instanceof FastExtEntity) {
            FastExtEntity<?> extEntity = (FastExtEntity<?>) entity;
            FastExtColumnInfo sameLinkColumn = extEntity.getSameLinkColumn();
            if (sameLinkColumn != null) {
                FastExtLinkInfo linkInfo = sameLinkColumn.getLinkInfo();
                if (linkInfo != null) {
                    List<String> columns = new ArrayList<>();
                    Collection<FastColumnInfo<?>> columnList = entity.getColumns();
                    for (FastColumnInfo<?> columnInfo : columnList) {
                        if (entity.isNotEmpty(columnInfo.getName())) {
                            continue;
                        }
                        if (!columnInfo.getMapWrap().getBoolean("same", false)) {
                            //列必须配置了same=true 属性
                            continue;
                        }
                        if (linkInfo.getTableInfo().isColumn(columnInfo.getName())) {
                            columns.add(columnInfo.getName());
                        }
                    }
                    if (columns.size() > 0) {
                        FastEntities.EntityInfo entityInfo = FastChar.getEntities().getFirstEntityInfo(linkInfo.getTableName());
                        if (entityInfo != null) {
                            FastEntity<?> fastEntity = FastClassUtils.newInstance(entityInfo.getTargetClass());
                            if (fastEntity instanceof FastExtEntity) {
                                FastExtEntity<?> fastExtEntity = (FastExtEntity<?>) fastEntity;
                                fastExtEntity.setDatabase(entity.getDatabase());
                                fastExtEntity.set(linkInfo.getKeyColumnName(), entity.get(sameLinkColumn.getName()));
                                FastEntity<?> firstValue = fastExtEntity.selectFirstValue(columns.toArray(new String[]{}), linkInfo.getKeyColumnName());
                                if (firstValue != null) {
                                    for (String column : columns) {
                                        entity.set(column, firstValue.get(column));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    
    /**
     * 构建更新相同字段的sql语句
     *
     * @param entity 实体类
     * @return sql语句集合
     */
    public static String buildUpdateSameColumnSql(FastExtEntity<?> entity) {
        FastExtColumnInfo sameLinkColumn = entity.getSameLinkColumn();
        if (sameLinkColumn == null) {
            return null;
        }
        FastExtLinkInfo linkInfo = sameLinkColumn.getLinkInfo();
        if (linkInfo != null) {
            List<String> setColumns = new ArrayList<>();
            Collection<FastColumnInfo<?>> columnList = entity.getColumns();
            for (FastColumnInfo<?> columnInfo : columnList) {
                if (columnInfo.getName().equals(linkInfo.getKeyColumnName())) {
                    continue;
                }
                if (!columnInfo.getMapWrap().getBoolean("same", false)) {
                    //列必须配置了same=true 属性
                    continue;
                }
                if (linkInfo.getTableInfo().isColumn(columnInfo.getName())) {
                    setColumns.add("t." + columnInfo.getName() + " = a." + columnInfo.getName());
                }
            }
            return "update " + entity.getTableName() + " as t " +
                    " inner join " + linkInfo.getTableName() + " as a" +
                    " on t." + linkInfo.getKeyColumnName() + " = a." + linkInfo.getKeyColumnName() +
                    " set " + FastStringUtils.join(setColumns, ",");
        }
        return null;
    }


    /**
     * 根据层级拓扑图按照顺序构建相同字段更新的sql语句
     *
     * @param layerMap 层级拓扑图
     * @return sql语句数组
     */
    public static List<String> buildUpdateSameColumnSql(FastExtLayerHelper.LayerMap layerMap) {
        List<String> sqlArray = new ArrayList<>();
        List<String> allTableNameList = layerMap.toAllTableNameList();
        for (String tableName : allTableNameList) {
            FastEntities.EntityInfo entityInfo = FastChar.getEntities().getFirstEntityInfo(tableName);
            if (entityInfo != null) {
                FastEntity<?> fastEntity = FastChar.getOverrides().newInstance(entityInfo.getTargetClass());
                if (fastEntity instanceof FastExtEntity) {
                    FastExtEntity<?> entity = (FastExtEntity<?>) fastEntity;
                    String buildUpdateSameColumnSql = buildUpdateSameColumnSql(entity);
                    if (FastStringUtils.isNotEmpty(buildUpdateSameColumnSql)) {
                        sqlArray.add(buildUpdateSameColumnSql);
                    }
                }
            }
        }
        return sqlArray;
    }


    public static int updateSameColumn(FastExtLayerHelper.LayerMap layerMap) {
        try {
            List<String> sqlArray = buildUpdateSameColumnSql(layerMap);
            if (sqlArray.size() > 0) {
                FastChar.getDB().setDatabase(layerMap.getDatabase())
                        .batch(sqlArray, sqlArray.size());
            }
            return sqlArray.size();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
