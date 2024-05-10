package com.fastchar.extjs.acceptor;

import com.fastchar.core.FastEngine;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.interfaces.IFastScannerAcceptor;

@SuppressWarnings("unchecked")
public class FastExtEntityAcceptor implements IFastScannerAcceptor {
    @Override
    public void onScannerClass(FastEngine engine, Class<?> scannedClass) throws Exception {
        if (FastExtEntity.class.isAssignableFrom(scannedClass)) {
            FastExtConfig.getInstance().getExtEntities().addEntity((Class<? extends FastExtEntity<?>>) scannedClass);
        }
    }
}
