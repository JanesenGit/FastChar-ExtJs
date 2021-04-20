package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntities;
import com.fastchar.core.FastEntity;
import com.fastchar.database.info.FastDatabaseInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.utils.FastClassUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.List;

public final class FastExtBindHelper {

    /**
     * 根据上级构建当前实体的层级编号
     * @param entity 实体类
     */
    public static String buildLayerValue(FastEntity<?> entity) {
        if (entity instanceof FastExtEntity) {
            FastExtEntity<?> extEntity = (FastExtEntity<?>) entity;
            //配置权限字段
            FastExtColumnInfo layerColumn = extEntity.getLayerColumn();
            if (layerColumn != null) {
                String parentLayerCode = extEntity.getString(FastExtEntity.EXTRA_PARENT_CODE);

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
                return extEntity.buildLayerCode(parentLayerCode);
            }
        }
        return null;
    }


    /**
     * 构建更新权限编号的sql语句，包含了同步更新所有子级的编号
     * @param entity 实体类
     * @param oldLayerValue 当前编号
     * @param newLayerValue 新的编号
     * @return sql语句集合
     */
    public static List<String> buildUpdateLayerValueSql(FastExtEntity<?> entity, String oldLayerValue, String newLayerValue) {
        if (FastStringUtils.isEmpty(oldLayerValue) || FastStringUtils.isEmpty(newLayerValue)) {
            return null;
        }

        List<String> sqlList = new ArrayList<>();
        FastDatabaseInfo fastDatabaseInfo = FastChar.getDatabases().get(entity.getDatabase());
        List<FastTableInfo<?>> tables = fastDatabaseInfo.getTables();
        for (FastTableInfo<?> table : tables) {
            if (table instanceof FastExtTableInfo) {
                FastExtTableInfo extTableInfo = (FastExtTableInfo) table;
                FastExtColumnInfo layerColumn = extTableInfo.getLayerColumn();
                if (layerColumn != null) {
                    String name = extTableInfo.getLayerColumn().getName();
                    String sqlStr = "update " + extTableInfo.getName() +
                            " set " + name + " = replace (" + name + ",'" + oldLayerValue + "','" + newLayerValue + "') " +
                            " where " + name + " like '" + oldLayerValue + "%' ";
                    sqlList.add(sqlStr);
                }
            }
        }
       return sqlList;
    }

}
