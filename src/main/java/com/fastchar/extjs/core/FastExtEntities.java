package com.fastchar.extjs.core;

import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.extjs.core.menus.FastMenuInfo;
import com.fastchar.extjs.exception.FastExtEntityException;
import com.fastchar.interfaces.IFastMethodRead;
import com.fastchar.utils.FastClassUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.*;

public class FastExtEntities {
    private Map<String, Class<? extends FastExtEntity<?>>> entityMap = new HashMap<>();

    public FastExtEntities addEntity(Class<? extends FastExtEntity<?>> targetClass) throws Exception {
        if (!FastExtEntity.class.isAssignableFrom(targetClass)) {
            FastChar.getLog().warn(this.getClass(), FastChar.getLocal().getInfo("ExtEntity_Error1", targetClass));
            return this;
        }
        if (!FastClassUtils.checkNewInstance(targetClass)) {
            return this;
        }
        FastExtEntity<?> fastExtEntity = FastClassUtils.newInstance(targetClass);
        if (fastExtEntity != null) {
            //跳过无效的Entity
            if (!fastExtEntity.isValidExtEntity()) {
                return this;
            }

            String entityCode = fastExtEntity.getEntityCode();
            if (FastStringUtils.isEmpty(entityCode)) {
                return this;
            }
            if (entityMap.containsKey(entityCode)) {
                if (FastClassUtils.isSameClass(targetClass, entityMap.get(entityCode))) {
                    entityMap.put(entityCode, targetClass);
                    return this;
                }

                int existPriority = 0;
                int currPriority = 0;

                IFastMethodRead fastMethodRead = FastChar.getOverrides().newInstance(IFastMethodRead.class);


                Class<? extends FastExtEntity<?>> existClass = entityMap.get(entityCode);

                if (existClass.equals(targetClass)) {
                    FastChar.getLog().warn(this.getClass(), FastChar.getLocal().getInfo("ExtEntity_Error4", targetClass));
                    return this;
                }

                List<IFastMethodRead.MethodLine> existLineNumber = fastMethodRead.getMethodLineNumber(existClass, "getEntityCode");
                List<IFastMethodRead.MethodLine> targetLineNumber = fastMethodRead.getMethodLineNumber(targetClass, "getEntityCode");

                StackTraceElement existStack = new StackTraceElement(existClass.getName(), "getEntityCode",
                        existClass.getSimpleName() + ".java", existLineNumber.get(0).getLastLine());

                StackTraceElement currStack = new StackTraceElement(targetClass.getName(), "getEntityCode",
                        targetClass.getSimpleName() + ".java", targetLineNumber.get(0).getLastLine());


                if (existClass.isAnnotationPresent(AFastPriority.class)) {
                    AFastPriority aFastPriority = existClass.getAnnotation(AFastPriority.class);
                    existPriority = aFastPriority.value();
                }

                if (targetClass.isAnnotationPresent(AFastPriority.class)) {
                    AFastPriority aFastPriority = targetClass.getAnnotation(AFastPriority.class);
                    currPriority = aFastPriority.value();
                }

                if (currPriority == existPriority) {
                    throw new FastExtEntityException("the entity code '" + entityCode + "' already exists！" +
                            "\n\tat " + existStack +
                            "\n\tat " + currStack);
                } else if (currPriority < existPriority) {
                    return this;
                }
            }
            entityMap.put(entityCode, targetClass);
        }
        return this;
    }


    public Class<? extends FastExtEntity<?>> getExtEntity(String entityCode) {
        return entityMap.get(entityCode);
    }

    public List<Map<String, Object>> getEntityInfo() {
        FastExtMenuXmlParser menuXmlParser = FastExtMenuXmlParser.newInstance();
        return getEntityInfo(menuXmlParser, null);
    }

    public List<Map<String, Object>> getEntityInfo(FastExtMenuXmlParser menuXmlParser, String linkTableName) {
        List<Map<String, Object>> infos = new ArrayList<>();

        for (Map.Entry<String, Class<? extends FastExtEntity<?>>> stringClassEntry : entityMap.entrySet()) {
            Class<? extends FastExtEntity<?>> aClass = stringClassEntry.getValue();
            FastExtEntity<?> fastExtEntity = FastChar.getOverrides().newInstance(aClass);
            if (fastExtEntity == null) {
                continue;
            }
            FastTableInfo<?> tableInfo = FastChar.getDatabases().get(fastExtEntity.getDatabase()).getTableInfo(fastExtEntity.getTableName());

            Map<String, Object> info = new HashMap<>();
            info.put("tableName", fastExtEntity.getTableName());
            info.put("databaseName", fastExtEntity.getDatabase());
            info.put("entityCode", stringClassEntry.getKey());

            if (tableInfo != null) {
                info.put("recycle", tableInfo.getMapWrap().getBoolean("recycle", false));
                info.put("comment", tableInfo.getComment());
                info.put("shortName", tableInfo.getComment());


                Collection<FastColumnInfo<?>> columns = tableInfo.getColumns();

                List<FastColumnInfo<?>> linkColumns = new ArrayList<>();
                List<FastColumnInfo<?>> fulltextColumns = new ArrayList<>();

                if (FastStringUtils.isNotEmpty(linkTableName)) {
                    if (!linkTableName.equalsIgnoreCase(tableInfo.getName())) {
                        for (FastColumnInfo<?> column : columns) {
                            if (column instanceof FastExtColumnInfo) {
                                FastExtColumnInfo extColumnInfo = (FastExtColumnInfo) column;
                                if (extColumnInfo.getLinkInfo() != null
                                        && extColumnInfo.getLinkInfo().getTableName().equalsIgnoreCase(linkTableName)) {
                                    FastColumnInfo<?> fastColumnInfo = FastColumnInfo.newInstance();
                                    fastColumnInfo.putAll(column);
                                    fastColumnInfo.put("linkKey", extColumnInfo.getLinkInfo().getKeyColumnName());
                                    fastColumnInfo.put("linkText", extColumnInfo.getLinkInfo().getTextColumnNames());
                                    linkColumns.add(fastColumnInfo);

                                }
                            }
                        }
                    }
                    if (linkColumns.isEmpty()) {
                        continue;
                    }
                }


                for (FastColumnInfo<?> column : columns) {
                    if (column.getMapWrap().getString("echarts", "none").equalsIgnoreCase("date")) {
                        info.put("echartsDate", column.getName());
                    }
                    if (column.containsKey("index_array")) {
                        @SuppressWarnings("unchecked")
                        List<FastEntity<?>> indexArray = (List<FastEntity<?>>) column.get("index_array");
                        for (FastEntity<?> fastEntity : indexArray) {
                            if (fastEntity.getString("index_type", "none").equalsIgnoreCase("fulltext")) {
                                fulltextColumns.add(column);
                            }
                        }
                    }

                }


                info.put("menu", FastExtEntities.getTableMenu(menuXmlParser, stringClassEntry.getKey()));


                if (tableInfo instanceof FastExtTableInfo) {
                    FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
                    info.put("shortName", extTableInfo.getShortName());
                }
                List<String> idProperty = new ArrayList<>();
                for (FastColumnInfo<?> primary : tableInfo.getPrimaries()) {
                    idProperty.add(primary.getName());
                }
                if (idProperty.isEmpty()) {
                    FastChar.getLog().error("表格 " + tableInfo.toSimpleInfo() + " 未配置唯一标识列（primary），可能会照成对应的EntityJS的部分功能无法使用！");
                }
                info.put("idProperty", idProperty);
                if (linkColumns.isEmpty()) {
                    info.put("linkTables", getEntityInfo(menuXmlParser, tableInfo.getName()));
                } else {
                    info.put("linkColumns", linkColumns);
                }
                info.put("fulltextColumns", fulltextColumns);

                if (tableInfo instanceof FastExtTableInfo) {
                    FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
                    if (extTableInfo.getLayerColumn() != null) {
                        info.put("layer", true);
                        info.put("layerColumn", extTableInfo.getLayerColumn().getName());
                    }
                }

                if (FastExtConfig.getInstance().getLayerType() == FastExtLayerType.None) {
                    info.put("layer", false);
                }


            } else if (fastExtEntity.logNotFoundTable()) {
                FastChar.getLog().error(this.getClass(), FastChar.getLocal().getInfo("ExtEntity_Error5", aClass));
            }

            infos.add(info);
        }
        return infos;
    }

    public static FastMenuInfo getTableMenu(FastExtMenuXmlParser xmlObserver, String tableEntity) {
        FastMenuInfo menus = xmlObserver.getMenus();
        return getTableMenu(menus, tableEntity);
    }

    public static FastMenuInfo getTableMenu(FastMenuInfo parent, String tableEntity) {
        if (parent == null || FastStringUtils.isEmpty(tableEntity)) {
            return null;
        }
        for (FastMenuInfo child : parent.getChildren()) {
            if (child == null) {
                continue;
            }
            if (FastStringUtils.isNotEmpty(child.getMethod())) {
                if (child.getMethod().contains(tableEntity)) {
                    return child;
                }
            }
            FastMenuInfo tableIcon = getTableMenu(child, tableEntity);
            if (tableIcon != null) {
                return tableIcon;
            }
        }
        return null;
    }

}
