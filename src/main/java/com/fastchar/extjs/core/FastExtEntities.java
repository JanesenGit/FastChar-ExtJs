package com.fastchar.extjs.core;

import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FastExtEntities {
    private Map<String, Class<? extends FastExtEntity<?>>> entityMap = new HashMap<>();

    public FastExtEntities addEntity(Class<? extends FastExtEntity<?>> targetClass) throws Exception {
        if (!FastExtEntity.class.isAssignableFrom(targetClass)) {
            FastChar.getLog().warn(FastChar.getLocal().getInfo("ExtEntity_Error1", targetClass));
            return this;
        }
        if (!FastClassUtils.checkNewInstance(targetClass)) {
            return this;
        }
        FastExtEntity<?> fastExtEntity = FastClassUtils.newInstance(targetClass);
        if (fastExtEntity != null) {

            String entityCode = fastExtEntity.getEntityCode();
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
                    FastChar.getLog().warn(FastChar.getLocal().getInfo("ExtEntity_Error4", targetClass));
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
        return getEntityInfo(null);
    }

    public List<Map<String, Object>> getEntityInfo(String linkTableName) {
        List<Map<String, Object>> infos = new ArrayList<>();

        for (String entityCode : entityMap.keySet()) {
            Class<? extends FastExtEntity<?>> aClass = entityMap.get(entityCode);
            FastExtEntity<?> fastExtEntity = FastChar.getOverrides().newInstance(aClass);
            if (fastExtEntity == null) {
                continue;
            }
            FastTableInfo<?> tableInfo = FastChar.getDatabases().get(fastExtEntity.getDatabase()).getTableInfo(fastExtEntity.getTableName());

            Map<String, Object> info = new HashMap<>();
            if (tableInfo != null) {

                List<FastColumnInfo<?>> linkColumns = new ArrayList<>();
                if (FastStringUtils.isNotEmpty(linkTableName)) {
                    List<FastColumnInfo<?>> columns = tableInfo.getColumns();
                    for (FastColumnInfo<?> column : columns) {
                        if (column instanceof FastExtColumnInfo) {
                            FastExtColumnInfo extColumnInfo = (FastExtColumnInfo) column;
                            if (extColumnInfo.getLinkInfo() != null
                                    && extColumnInfo.getLinkInfo().getTableName().equals(linkTableName)) {
                                FastColumnInfo<?> fastColumnInfo = FastColumnInfo.newInstance();
                                fastColumnInfo.putAll(column);
                                fastColumnInfo.put("linkKey", extColumnInfo.getLinkInfo().getKeyColumnName());
                                fastColumnInfo.put("linkText", extColumnInfo.getLinkInfo().getTextColumnNames());
                                linkColumns.add(fastColumnInfo);
                            }
                        }
                    }
                    if (linkColumns.isEmpty()) {
                        continue;
                    }
                }

                info.put("tableName", tableInfo.getName());
                info.put("databaseName", tableInfo.getDatabaseName());
                info.put("entityCode", entityCode);
                info.put("recycle", tableInfo.getBoolean("recycle", false));
                info.put("comment", tableInfo.getComment());
                info.put("shortName", tableInfo.getComment());
                info.put("menu", getTableMenu(entityCode));


                if (tableInfo instanceof FastExtTableInfo) {
                    FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
                    info.put("shortName", extTableInfo.getShortName());
                }
                List<String> idProperty = new ArrayList<>();
                for (FastColumnInfo<?> primary : tableInfo.getPrimaries()) {
                    idProperty.add(primary.getName());
                }
                info.put("idProperty", idProperty);
                if (linkColumns.isEmpty()) {
                    info.put("linkTables", getEntityInfo(tableInfo.getName()));
                } else {
                    info.put("linkColumns", linkColumns);
                }

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
                infos.add(info);
            } else {
                FastChar.getLog().error(FastChar.getLocal().getInfo("ExtEntity_Error5", aClass));
            }
        }
        return infos;
    }

    private FastMenuInfo getTableMenu(String tableEntity) {
        FastMenuInfo menus = FastChar.getValues().get("menus");
        return getTableMenu(menus, tableEntity);
    }

    private FastMenuInfo getTableMenu(FastMenuInfo parent, String tableEntity) {
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
