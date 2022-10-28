package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.extjs.core.enums.FastEnumInfo;
import com.fastchar.extjs.interfaces.IFastExtEnum;

import java.util.ArrayList;
import java.util.List;

/**
 * 系统枚举工具类
 */
public class FastExtEnumHelper {

    /**
     * 获取枚举值
     *
     * @param enumName 枚举名称
     * @param id       枚举ID
     * @return FastEnumInfo
     */
    public static FastEnumInfo getEnum(String enumName, Object id) {
        try {
            IFastExtEnum enumClass = FastChar.getOverrides().singleInstance(IFastExtEnum.class, enumName);
            if (enumClass != null) {
                return enumClass.getEnum(id);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 获取枚举的所有枚举值
     * @param enumName 枚举名称
     */
    public static List<FastEnumInfo> getAllEnums(String enumName) throws Exception {
        IFastExtEnum enumClass = FastChar.getOverrides().singleInstance(false, IFastExtEnum.class, enumName);
        if (enumClass != null) {
            return enumClass.getEnums();
        }
        return new ArrayList<>();
    }
}
