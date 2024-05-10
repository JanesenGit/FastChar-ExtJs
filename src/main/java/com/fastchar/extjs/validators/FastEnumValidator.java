package com.fastchar.extjs.validators;

import com.fastchar.core.FastChar;
import com.fastchar.extjs.core.enums.FastEnumInfo;
import com.fastchar.extjs.interfaces.IFastExtEnum;
import com.fastchar.utils.FastNumberUtils;
import com.fastchar.utils.FastStringUtils;
import com.fastchar.validators.FastBaseValidator;

public class FastEnumValidator extends FastBaseValidator {
    @Override
    public String validate(String validator, Object[] arguments, String paramName, Object paramValue) {
        if (paramValue != null && validator.startsWith("@")) {
            String[] split = validator.split(":");
            String enumName = split[0].replace("@", "");
            IFastExtEnum enumClass = FastChar.getOverrides().singleInstance(false, IFastExtEnum.class, enumName);
            if (enumClass != null) {
                try {
                    FastEnumInfo anEnum = enumClass.getEnum(FastNumberUtils.formatToInt(paramValue, -1));
                    if (anEnum == null) {
                        String message = null;
                        if (split.length == 2) {
                            message = split[1];
                        }
                        if (FastStringUtils.isEmpty(message)) {
                            message = "参数{0}值错误！";
                        }
                        return formatMessage(message, paramName);
                    }
                } catch (Exception e) {
                    FastChar.getLogger().error(this.getClass(), e);
                }
            }
        }
        return null;
    }
}
