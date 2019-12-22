package com.fastchar.extjs.accepter;

import com.fastchar.core.FastEngine;
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
