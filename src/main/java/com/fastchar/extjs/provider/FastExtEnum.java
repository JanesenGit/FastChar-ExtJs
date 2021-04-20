package com.fastchar.extjs.provider;

import com.fastchar.extjs.accepter.FastExtEnumAccepter;
import com.fastchar.extjs.core.enums.FastEnumInfo;
import com.fastchar.extjs.interfaces.IFastExtEnum;
import com.fastchar.utils.FastEnumUtils;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

public class FastExtEnum extends FastExtBaseEnum {

    public static boolean isOverride(Object data) {
        if (data == null) {
            return false;
        }
        return FastExtEnumAccepter.ENUM_MAP.containsKey(data.toString());
    }


    private Class<? extends Enum<?>> enumClass;
    public FastExtEnum(String enumName) {
        enumClass = FastExtEnumAccepter.ENUM_MAP.get(enumName);
    }

    @Override
    public Class<? extends Enum<?>> getEnumClass() {
        return enumClass;
    }

    public FastExtEnum setEnumClass(Class<? extends Enum<?>> enumClass) {
        this.enumClass = enumClass;
        return this;
    }
}
