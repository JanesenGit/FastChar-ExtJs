package com.fastchar.extjs.accepter;

import com.fastchar.core.FastEngine;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.interfaces.IFastScannerAccepter;

import java.io.File;

@SuppressWarnings("unchecked")
public class FastExtEntityAccepter implements IFastScannerAccepter {
    @Override
    public void onScannerClass(FastEngine engine, Class<?> scannedClass) throws Exception {
        if (FastExtEntity.class.isAssignableFrom(scannedClass)) {
            FastExtConfig.getInstance().getExtEntities().addEntity((Class<? extends FastExtEntity<?>>) scannedClass);
        }
    }

    @Override
    public void onScannerFile(FastEngine engine, File file) throws Exception {
    }
}
