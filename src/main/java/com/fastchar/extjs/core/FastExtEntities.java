package com.fastchar.extjs.core;

import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntities;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.extjs.exception.FastExtEntityException;
import com.fastchar.interfaces.IFastMethodRead;
import com.fastchar.utils.FastClassUtils;

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
                if (FastClassUtils.isSameRefined(targetClass, entityMap.get(entityCode))) {
                    FastChar.getLog().warn(FastChar.getLocal().getInfo("ExtEntity_Error3", targetClass, entityMap.containsKey(entityCode)));
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
        List<Map<String, Object>> infos = new ArrayList<>();
        for (String entityCode : entityMap.keySet()) {
            Class<? extends FastExtEntity<?>> aClass = entityMap.get(entityCode);

            FastEntities.EntityInfo entityInfo = FastChar.getEntities().getEntityInfo(aClass);
            if (entityInfo != null) {
                Map<String, Object> info = new HashMap<>();
                FastTableInfo<?> tableInfo = FastChar.getDatabases().get(entityInfo.getDatabaseName())
                        .getTableInfo(entityInfo.getTableName());
                if (tableInfo != null) {
                    info.put("tableName", tableInfo.getName());
                    info.put("entityCode", entityCode);
                    info.put("recycle", tableInfo.getBoolean("recycle", false));
                    info.put("comment", tableInfo.getComment());
                    info.put("shortName", "数据");
                    if (tableInfo instanceof FastExtTableInfo) {
                        FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
                        info.put("shortName", extTableInfo.getShortName());
                    }
                    List<String> idProperty = new ArrayList<>();
                    for (FastColumnInfo<?> primary : tableInfo.getPrimaries()) {
                        idProperty.add(primary.getName());
                    }
                    info.put("idProperty", idProperty);
                    infos.add(info);
                }else{
                    FastChar.getLog().error(FastChar.getLocal().getInfo("ExtEntity_Error5", aClass));
                }
            }

        }
        return infos;
    }

}
