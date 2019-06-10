package com.fastchar.extjs.accepter;

import com.fastchar.core.FastEngine;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.compress.YuiCompress;
import com.fastchar.interfaces.IFastScannerAccepter;
import com.fastchar.utils.FastStringUtils;

import java.io.File;

public class FastExtAppJsAccepter implements IFastScannerAccepter {
    @Override
    public boolean onScannerClass(FastEngine engine, Class<?> scannedClass) throws Exception {
        return false;
    }

    @Override
    public boolean onScannerFile(FastEngine engine, File file) throws Exception {
        if (engine.getConfig(FastExtConfig.class).isCompress()) {
            if (file.getName().endsWith(".js")) {
                String filePath = file.getPath();
                filePath = FastStringUtils.strip(filePath.replace(engine.getPath().getWebRootPath(), ""), "/");
                if (filePath.startsWith("app/")) {
                    YuiCompress.compress(file.getPath());
                }
            }
        }
        return false;
    }
}
