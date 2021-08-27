package com.fastchar.extjs.accepter;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEngine;
import com.fastchar.extjs.exception.FastExtEnumException;
import com.fastchar.interfaces.IFastScannerAccepter;
import com.fastchar.utils.FastClassUtils;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("unchecked")
public class FastExtEnumAccepter implements IFastScannerAccepter {

    public static Map<String, Class<? extends Enum<?>>> ENUM_MAP = new HashMap<>();

    @Override
    public boolean onScannerClass(FastEngine engine, Class<?> scannedClass) throws Exception {
        if (scannedClass.isEnum()) {
            if (!FastClassUtils.checkNewInstance(scannedClass)) {
                return false;
            }
            if (ENUM_MAP.containsKey(scannedClass.getSimpleName())) {
                Class<? extends Enum<?>> existEnumClass = ENUM_MAP.get(scannedClass.getSimpleName());
                if (FastClassUtils.isSameClass(existEnumClass, scannedClass)) {
                    return true;
                }
                String errorInfo = FastChar.getLocal().getInfo("ExtEnum_Error1", scannedClass.getSimpleName());

                StackTraceElement newStack = new StackTraceElement(scannedClass.getName(), scannedClass.getSimpleName(),
                        scannedClass.getSimpleName() + ".java", 1);

                StackTraceElement existStack = new StackTraceElement(existEnumClass.getName(), existEnumClass.getSimpleName(),
                        existEnumClass.getSimpleName() + ".java", 1);

                throw new FastExtEnumException(errorInfo+
                        "\n\tcurr at " + newStack +
                        "\n\texist at " + existStack
                );
            }
            ENUM_MAP.put(scannedClass.getSimpleName(), (Class<? extends Enum<?>>) scannedClass);
            return true;
        }
        return false;
    }

    @Override
    public boolean onScannerFile(FastEngine engine, File file) throws Exception {
        return false;
    }
}
