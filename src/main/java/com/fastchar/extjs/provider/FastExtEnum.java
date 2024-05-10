package com.fastchar.extjs.provider;

import com.fastchar.extjs.acceptor.FastExtEnumAcceptor;

public class FastExtEnum extends FastExtBaseEnum {

    public static boolean isOverride(Object data) {
        if (data == null) {
            return false;
        }
        return FastExtEnumAcceptor.ENUM_MAP.containsKey(data.toString());
    }


    private Class<? extends Enum<?>> enumClass;
    public FastExtEnum(String enumName) {
        enumClass = FastExtEnumAcceptor.ENUM_MAP.get(enumName);
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
