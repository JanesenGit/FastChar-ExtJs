package com.fastchar.extjs.provider;

import com.fastchar.extjs.core.enums.FastEnumInfo;
import com.fastchar.extjs.interfaces.IFastExtEnum;
import com.fastchar.utils.FastEnumUtils;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

public abstract class FastExtBaseEnum implements IFastExtEnum {

    public abstract Class<? extends Enum<?>> getEnumClass();


    private List<FastEnumInfo> enumInfos;

    @Override
    public final List<FastEnumInfo> getEnums() throws Exception {
        if (enumInfos == null) {
            enumInfos = new ArrayList<>();
            Field[] declaredFields = getEnumClass().getDeclaredFields();
            Enum<?>[] enumValues = FastEnumUtils.getEnumValues(getEnumClass());

            for (Enum<?> enumValue : enumValues) {
                Field field = getEnumClass().getField(enumValue.name());
                if (field.isAnnotationPresent(Deprecated.class)) {
                    continue;
                }

                FastEnumInfo info = new FastEnumInfo();
                info.setId(enumValue.ordinal());
                info.setText(enumValue.name());
                info.setName(enumValue.name());

                for (Field declaredField : declaredFields) {
                    if (declaredField.isEnumConstant()) {
                        continue;
                    }
                    if (Modifier.isTransient(declaredField.getModifiers())) {
                        continue;
                    }
                    if (Modifier.isPublic(declaredField.getModifiers())) {
                        String value = String.valueOf(declaredField.get(enumValue));
                        info.put(declaredField.getName(), value);
                    }
                }
                enumInfos.add(info);
            }
        }
        return enumInfos;
    }

    @Override
    public final FastEnumInfo getEnum(Object id) throws Exception {
        if (getEnumClass() == null) {
            return null;
        }
        FastEnumInfo enumInfo = new FastEnumInfo();
        enumInfo.setId(id);
        Enum<?> anEnum = FastEnumUtils.formatToEnum(getEnumClass(), String.valueOf(id));
        if (anEnum == null) {
            return null;
        }
        enumInfo.setId(anEnum.ordinal());
        enumInfo.setText(anEnum.name());
        return enumInfo;
    }
}
