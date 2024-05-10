package com.fastchar.extjs.acceptor;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEngine;
import com.fastchar.interfaces.IFastScannerAcceptor;
import com.fastchar.utils.FastClassUtils;

import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("unchecked")
public class FastExtEnumAcceptor implements IFastScannerAcceptor {

    public static Map<String, Class<? extends Enum<?>>> ENUM_MAP = new HashMap<>();

    @Override
    public void onScannerClass(FastEngine engine, Class<?> scannedClass) throws Exception {
        if (scannedClass.isEnum()) {
            if (!FastClassUtils.checkNewInstance(scannedClass)) {
                return;
            }
            if (ENUM_MAP.containsKey(scannedClass.getSimpleName())) {
                Class<? extends Enum<?>> existEnumClass = ENUM_MAP.get(scannedClass.getSimpleName());
                if (FastClassUtils.isSameClass(existEnumClass, scannedClass)) {
                    return;
                }
                String errorInfo = FastChar.getLocal().getInfo("ExtEnum_Error1", scannedClass.getSimpleName());

                StackTraceElement newStack = new StackTraceElement(scannedClass.getName(), scannedClass.getSimpleName(),
                        scannedClass.getSimpleName() + ".java", 1);

                StackTraceElement existStack = new StackTraceElement(existEnumClass.getName(), existEnumClass.getSimpleName(),
                        existEnumClass.getSimpleName() + ".java", 1);

                FastChar.getLogger().warn(this.getClass(), errorInfo +
                        "\n\tcurr at " + newStack +
                        "\n\texist at " + existStack
                );
            }
            ENUM_MAP.put(scannedClass.getSimpleName(), (Class<? extends Enum<?>>) scannedClass);
        }
    }
}
