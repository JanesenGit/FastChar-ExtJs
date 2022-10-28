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
import com.fastchar.extjs.core.enums.FastEnumInfo;
import com.fastchar.extjs.interfaces.IFastExtEnum;
import com.fastchar.utils.FastClassUtils;
import com.fastchar.utils.FastMD5Utils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.List;

public final class FastExtLayerHelper {
    private static final ThreadLocal<FastExtLayerCache> THREAD_LOCAL_LAYER_CACHE = new ThreadLocal<>();



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
                    FastExtColumnInfo layerLinkColumn = extEntity.getBindLayerColumn();
                    if (layerLinkColumn != null && entity.isNotEmpty(layerLinkColumn.getName())) {

                        //权限字段绑定到枚举值，从枚举值中获取层级编号
                        if (layerLinkColumn.isRenderEnum()) {
                            IFastExtEnum enumClass = FastChar.getOverrides().singleInstance(IFastExtEnum.class, layerLinkColumn.getEnumName());
                            try {
                                FastEnumInfo anEnum = enumClass.getEnum(entity.get(layerLinkColumn.getName()));
                                if (anEnum != null) {
                                    parentLayerCode = anEnum.getString("layerValue");
                                }
                            } catch (Exception e) {
                                throw new RuntimeException(e);
                            }
                        } else {
                            FastExtLinkInfo linkInfo = layerLinkColumn.getLinkInfo();
                            if (linkInfo != null) {
                                FastEntities.EntityInfo entityInfo = FastChar.getEntities().getFirstEntityInfo(linkInfo.getTableName());
                                if (entityInfo != null) {
                                    FastEntity<?> fastEntity = FastClassUtils.newInstance(entityInfo.getTargetClass());
                                    if (fastEntity instanceof FastExtEntity) {
                                        FastExtEntity<?> linkExtEntity = (FastExtEntity<?>) fastEntity;
                                        linkExtEntity.setDatabase(entity.getDatabase());
                                        Object keyValue = entity.get(layerLinkColumn.getName());

                                        FastExtLayerCache fastExtLayerCache = THREAD_LOCAL_LAYER_CACHE.get();
                                        if (fastExtLayerCache == null) {
                                            fastExtLayerCache = new FastExtLayerCache();
                                            THREAD_LOCAL_LAYER_CACHE.set(fastExtLayerCache);
                                        }

                                        String layerCacheValue = fastExtLayerCache.getLayer(linkExtEntity.getClass(), keyValue);
                                        if (FastStringUtils.isNotEmpty(layerCacheValue)) {
                                            parentLayerCode = layerCacheValue;
                                        }else{
                                            fastEntity.set(linkInfo.getKeyColumnName(), keyValue);
                                            parentLayerCode = linkExtEntity.selectLayerValue(linkInfo.getKeyColumnName());
                                            fastExtLayerCache.putLayer(linkExtEntity.getClass(), keyValue, parentLayerCode);
                                        }
                                    }
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
        List<String> sqlList = new ArrayList<>(10);

        FastDatabaseInfo databaseInfo = FastChar.getDatabases().get(layerMap.getDatabase());
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
            FastExtColumnInfo bindLayerColumn = extTableInfo.getBindLayerColumn();
            if (parentTable.equals("root")) {
                if (bindLayerColumn == null || bindLayerColumn.isRenderEnum() || bindLayerColumn.getLinkInfo().getTableName().equals(extTableInfo.getName())) {
                    LayerMap layerMap = new LayerMap();
                    layerMap.setParentTableName(parentTable);
                    layerMap.setDatabase(extTableInfo.getDatabase());
                    layerMap.setTableName(extTableInfo.getName());
                    layerMap.setChildren(buildLayerMap(extTableInfo.getName(), databaseInfo));
                    layerMaps.add(layerMap);
                }
                continue;
            }

            if (bindLayerColumn == null) {
                continue;
            }
            if (bindLayerColumn.isRenderEnum()) {
                continue;
            }
            if (bindLayerColumn.getLinkInfo() == null) {
                continue;
            }
            if (bindLayerColumn.getLinkInfo().getTableName().equals(parentTable)) {
                if (bindLayerColumn.getLinkInfo().getTableName().equals(extTableInfo.getName())) {
                    continue;
                }
                LayerMap layerMap = new LayerMap();
                layerMap.setParentTableName(parentTable);
                layerMap.setTableName(extTableInfo.getName());
                layerMap.setDatabase(extTableInfo.getDatabase());
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
                entity.setDatabase(layerMap.getDatabase());
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

        FastExtColumnInfo bindLayerColumn = entity.getBindLayerColumn();
        if (bindLayerColumn == null) {
            entity.updateBySql(justSelfLayerSql);
        } else {
            if (bindLayerColumn.isRenderEnum()) {

                IFastExtEnum enumClass = FastChar.getOverrides().singleInstance(IFastExtEnum.class, bindLayerColumn.getEnumName());
                try {
                    List<FastEnumInfo> enums = enumClass.getEnums();
                    for (FastEnumInfo anEnum : enums) {
                        justSelfLayerSql = "update " + entity.getTableName() + " " +
                                " set " + layerColumn.getName() + " = concat('" + anEnum.getMapWrap().getString("layerValue", FastMD5Utils.MD5To16(FastStringUtils.buildUUID())) + "',substr(md5(uuid()), 1, 16)) " +
                                " where " + bindLayerColumn.getName() + " = ? or " + bindLayerColumn.getName() + " = ? ";
                        entity.updateBySql(justSelfLayerSql, anEnum.getId(), anEnum.getName());
                    }
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
                return;
            }

            FastExtLinkInfo linkInfo = bindLayerColumn.getLinkInfo();
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

            if (linkInfo.getTableName().equals(entity.getTableName())) {//自身表格的权限层级，使用循环更新
                //先清空所有权限字段的值

                String firstClearSql = "update " + entity.getTableName() + " set "
                        + layerColumn.getName() + " = null";
                entity.updateBySql(firstClearSql);

                String secondRootSql = "update " + entity.getTableName() + " set "
                        + layerColumn.getName() + " = substr(md5(uuid()),1,16) " +
                        " where " + bindLayerColumn.getName() + " is null or " + bindLayerColumn.getName() + " <= ?  ";
                entity.updateBySql(secondRootSql, 0);

                boolean loop = true;
                while (loop) {
                    String whileSqlStr = "update " + entity.getTableName() + " as t" +
                            " left join " + linkInfo.getTableName() + " as b" +
                            " on b." + linkInfo.getKeyColumnName() + " = t." + bindLayerColumn.getName() +
                            //此处不可使用coalesce设置上级权限值的默认值，必须判断上级不可为空才能循环更新
                            " set t." + layerColumn.getName() + " = concat (b." + linkTableLayerColumn.getName() + ",'@',substr(md5(uuid()),1,16)) " +
                            " where  t." + layerColumn.getName() + " is null and b." + linkTableLayerColumn.getName() + " is not null ";

                    //【重要】此处是循环更新，注意条件语句的判断！！！！
                    loop = entity.updateBySql(whileSqlStr) > 0;
                }
            } else {
                String sqlStr = "update " + entity.getTableName() + " as t" +
                        " left join " + linkInfo.getTableName() + " as b" +
                        " on b." + linkInfo.getKeyColumnName() + " = t." + bindLayerColumn.getName() +
                        " set t." + layerColumn.getName() + " = concat ( coalesce(b." + linkTableLayerColumn.getName() + ",'" + FastMD5Utils.MD5To16(FastStringUtils.buildUUID()) + "'),'@',substr(md5(uuid()),1,16)) ";
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
            if (FastStringUtils.defaultValue(layerMap.getDatabase(), "").equals(databaseName)
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
        private String database;
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

        public String getDatabase() {
            return database;
        }

        public LayerMap setDatabase(String database) {
            this.database = database;
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
