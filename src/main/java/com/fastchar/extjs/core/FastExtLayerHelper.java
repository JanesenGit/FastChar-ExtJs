package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntities;
import com.fastchar.core.FastEntity;
import com.fastchar.database.info.FastDatabaseInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastExtLinkInfo;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.utils.FastClassUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.List;

public final class FastExtLayerHelper {

    /**
     * 根据上级构建当前实体的层级编号
     *
     * @param entity 实体类
     */
    public static String buildLayerValue(FastEntity<?> entity) {
        if (entity instanceof FastExtEntity) {
            FastExtEntity<?> extEntity = (FastExtEntity<?>) entity;
            //配置权限字段
            FastExtColumnInfo layerColumn = extEntity.getLayerColumn();
            if (layerColumn != null) {
                String parentLayerCode = extEntity.getString(FastExtEntity.EXTRA_PARENT_LAYER_CODE);

                if (FastStringUtils.isEmpty(parentLayerCode)) {
                    FastExtColumnInfo layerLinkColumn = extEntity.getLayerLinkColumn();
                    if (layerLinkColumn != null && entity.isNotEmpty(layerLinkColumn.getName())) {
                        FastExtLinkInfo linkInfo = layerLinkColumn.getLinkInfo();
                        if (linkInfo != null) {
                            FastEntities.EntityInfo entityInfo = FastChar.getEntities().getFirstEntityInfo(linkInfo.getTableName());
                            if (entityInfo != null) {
                                FastEntity<?> fastEntity = FastClassUtils.newInstance(entityInfo.getTargetClass());
                                if (fastEntity instanceof FastExtEntity) {
                                    FastExtEntity<?> linkExtEntity = (FastExtEntity<?>) fastEntity;
                                    linkExtEntity.setDatabase(entity.getDatabase());
                                    fastEntity.set(linkInfo.getKeyColumnName(), entity.get(layerLinkColumn.getName()));
                                    parentLayerCode = linkExtEntity.selectLayerValue(linkInfo.getKeyColumnName());
                                }
                            }
                        }
                    }
                }
                return extEntity.buildLayerCode(parentLayerCode);
            }
        }
        return null;
    }


    /**
     * 构建更新权限编号的sql语句，包含了同步更新自己及所有子级的编号
     *
     * @param entity        实体类
     * @param oldLayerValue 当前编号
     * @param newLayerValue 新的编号
     * @return sql语句集合
     */
    public static List<String> buildUpdateLayerValueSql(FastExtEntity<?> entity, String oldLayerValue, String newLayerValue) {
        if (FastStringUtils.isEmpty(oldLayerValue) || FastStringUtils.isEmpty(newLayerValue)) {
            return null;
        }
        //跳过小于MD5 16位 不合法
        if (oldLayerValue.length() < 16 || newLayerValue.length() < 16) {
            return null;
        }

        LayerMap layerMap = entity.getLayerMap();
        if (layerMap == null) {
            return null;
        }
        List<String> sqlList = new ArrayList<>();

        FastDatabaseInfo databaseInfo = FastChar.getDatabases().get(layerMap.getDatabaseName());
        List<String> tableNameList = layerMap.toAllTableNameList();
        for (String tableName : tableNameList) {
            FastTableInfo<?> tableInfo = databaseInfo.getTableInfo(tableName);
            if (tableInfo instanceof FastExtTableInfo) {
                FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
                FastExtColumnInfo layerColumn = extTableInfo.getLayerColumn();
                if (layerColumn != null) {
                    String name = extTableInfo.getLayerColumn().getName();
                    String sqlStr = "update " + extTableInfo.getName() +
                            " set " + name + " = replace (" + name + ",'" + oldLayerValue + "','" + newLayerValue + "') " +
                            " where ( " + name + " like '" + oldLayerValue + "@%' or " + name + " = '" + oldLayerValue + "' ) ";
                    sqlList.add(sqlStr);
                }
            }
        }
        return sqlList;
    }

    /**
     * 构造层级拓扑图
     *
     * @param databaseInfo 数据库
     */
    public static List<LayerMap> buildLayerMap(FastDatabaseInfo databaseInfo) {
        return buildLayerMap("root", databaseInfo);
    }

    private static List<LayerMap> buildLayerMap(String parentTable, FastDatabaseInfo databaseInfo) {
        List<LayerMap> layerMaps = new ArrayList<>();
        for (FastTableInfo<?> table : databaseInfo.getTables()) {
            if (!(table instanceof FastExtTableInfo)) {
                continue;
            }
            FastExtTableInfo extTableInfo = (FastExtTableInfo) table;
            FastExtColumnInfo layerColumn = extTableInfo.getLayerColumn();
            if (layerColumn == null) {
                continue;
            }
            FastExtColumnInfo layerLinkColumn = extTableInfo.getLayerLinkColumn();
            if (parentTable.equals("root")) {
                if (layerLinkColumn == null || layerLinkColumn.getLinkInfo().getTableName().equals(extTableInfo.getName())) {
                    LayerMap layerMap = new LayerMap();
                    layerMap.setParentTableName(parentTable);
                    layerMap.setDatabaseName(extTableInfo.getDatabaseName());
                    layerMap.setTableName(extTableInfo.getName());
                    layerMap.setChildren(buildLayerMap(extTableInfo.getName(), databaseInfo));
                    layerMaps.add(layerMap);
                }
            } else if (layerLinkColumn != null && layerLinkColumn.getLinkInfo().getTableName().equals(parentTable)) {
                if (layerLinkColumn.getLinkInfo().getTableName().equals(extTableInfo.getName())) {
                    continue;
                }
                LayerMap layerMap = new LayerMap();
                layerMap.setParentTableName(parentTable);
                layerMap.setTableName(extTableInfo.getName());
                layerMap.setDatabaseName(extTableInfo.getDatabaseName());
                layerMap.setChildren(buildLayerMap(extTableInfo.getName(), databaseInfo));
                layerMaps.add(layerMap);
            }
        }
        return layerMaps;
    }


    public static void updateAllLayerValue(LayerMap layerMap) {
        FastEntities.EntityInfo entityInfo = FastChar.getEntities().getFirstEntityInfo(layerMap.getTableName());
        if (entityInfo != null) {
            FastEntity<?> fastEntity = FastChar.getOverrides().newInstance(entityInfo.getTargetClass());
            if (fastEntity instanceof FastExtEntity) {
                FastExtEntity<?> entity = (FastExtEntity<?>) fastEntity;
                entity.setDatabase(layerMap.getDatabaseName());
                updateAllLayerValue(entity);
            }
        }
        for (LayerMap child : layerMap.getChildren()) {
            updateAllLayerValue(child);
        }
    }

    /**
     * 构建重新生成表格里数据的层级编号
     */
    public static void updateAllLayerValue(FastExtEntity<?> entity) {
        FastExtColumnInfo layerColumn = entity.getLayerColumn();
        if (layerColumn == null) {
            return;
        }
        String justSelfLayerSql = "update " + entity.getTableName() + " " +
                " set " + layerColumn.getName() + " = substr(md5(uuid()), 1, 16) ";

        FastExtColumnInfo layerLinkColumn = entity.getLayerLinkColumn();
        if (layerLinkColumn == null) {
            entity.updateBySql(justSelfLayerSql);
        } else {
            FastExtLinkInfo linkInfo = layerLinkColumn.getLinkInfo();
            FastExtTableInfo linkTableInfo = (FastExtTableInfo) linkInfo.getTableInfo();
            if (linkTableInfo == null) {
                entity.updateBySql(justSelfLayerSql);
                return;
            }
            FastExtColumnInfo linkTableLayerColumn = linkTableInfo.getLayerColumn();
            if (linkTableLayerColumn == null) {
                entity.updateBySql(justSelfLayerSql);
                return;
            }

            if (linkInfo.getTableName().equals(entity.getTableName())) {//自身表格的权限层级
                String firstClearSql = "update " + entity.getTableName() + " set "
                        + layerColumn.getName() + " = null";
                entity.updateBySql(firstClearSql);

                String secondRootSql = "update " + entity.getTableName() + " set "
                        + layerColumn.getName() + " = substr(md5(uuid()),1,16) " +
                        " where " + layerLinkColumn.getName() + " = ? or " + layerLinkColumn.getName() + " is null ";

                entity.updateBySql(secondRootSql, -1);

                boolean loop = true;
                while (loop) {
                    String whileSqlStr = "update " + entity.getTableName() + " as t" +
                            " inner join " + linkInfo.getTableName() + " as b" +
                            " on b." + linkInfo.getKeyColumnName() + " = t." + layerLinkColumn.getName() +
                            " set t." + layerColumn.getName() + " = concat ( b." + linkTableLayerColumn.getName() + ",'@',substr(md5(uuid()),1,16)) " +
                            " where  b." + linkTableLayerColumn.getName() + " is not null and t." + layerColumn.getName() + " is null ";
                    loop = entity.updateBySql(whileSqlStr) > 0;
                }
            } else {
                String sqlStr = "update " + entity.getTableName() + " as t" +
                        " inner join " + linkInfo.getTableName() + " as b" +
                        " on b." + linkInfo.getKeyColumnName() + " = t." + layerLinkColumn.getName() +
                        " set t." + layerColumn.getName() + " = concat ( b." + linkTableLayerColumn.getName() + ",'@',substr(md5(uuid()),1,16)) " +
                        " where  b." + linkTableLayerColumn.getName() + " is not null ";
                entity.updateBySql(sqlStr);
            }
        }
    }


    /**
     * 获取表格的层级拓扑图
     *
     * @param databaseName 数据库名
     * @param tableName    表格名
     */
    public static LayerMap getLayerMap(String databaseName, String tableName) {
        return filterLayerMap(FastExtConfig.getInstance().getLayerMaps(), databaseName, tableName);
    }

    private static LayerMap filterLayerMap(List<LayerMap> layerMaps, String databaseName, String tableName) {
        if (FastStringUtils.isEmpty(databaseName) || FastStringUtils.isEmpty(tableName) || layerMaps == null) {
            return null;
        }
        for (LayerMap layerMap : layerMaps) {
            if (FastStringUtils.defaultValue(layerMap.getDatabaseName(), "").equals(databaseName)
                    && FastStringUtils.defaultValue(layerMap.getTableName(), "").equals(tableName)) {
                return layerMap;
            }
            LayerMap childLayerMap = filterLayerMap(layerMap.getChildren(), databaseName, tableName);
            if (childLayerMap != null) {
                return childLayerMap;
            }
        }
        return null;
    }


    public static class LayerMap {
        private String databaseName;
        private String tableName;
        private String parentTableName;
        private List<LayerMap> children = new ArrayList<>();

        public String getTableName() {
            return tableName;
        }

        public LayerMap setTableName(String tableName) {
            this.tableName = tableName;
            return this;
        }

        public List<LayerMap> getChildren() {
            return children;
        }

        public LayerMap setChildren(List<LayerMap> children) {
            this.children = children;
            return this;
        }

        public String getDatabaseName() {
            return databaseName;
        }

        public LayerMap setDatabaseName(String databaseName) {
            this.databaseName = databaseName;
            return this;
        }

        public String getParentTableName() {
            return parentTableName;
        }

        public LayerMap setParentTableName(String parentTableName) {
            this.parentTableName = parentTableName;
            return this;
        }

        public List<String> toAllTableNameList() {
            List<String> tableNames = new ArrayList<>();
            tableNames.add(tableName);
            for (LayerMap child : children) {
                tableNames.addAll(child.toAllTableNameList());
            }
            return tableNames;
        }
    }


}
