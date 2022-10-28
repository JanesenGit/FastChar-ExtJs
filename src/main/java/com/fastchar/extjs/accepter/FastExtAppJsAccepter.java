package com.fastchar.extjs.accepter;

import com.fastchar.core.FastEngine;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.compress.GoogleCompress;
import com.fastchar.interfaces.IFastScannerAccepter;
import com.fastchar.utils.FastStringUtils;

import java.io.File;

public class FastExtAppJsAccepter implements IFastScannerAccepter {

    @Override
    public void onScannerClass(FastEngine engine, Class<?> scannedClass) throws Exception {
    }

    @Override
    public void onScannerFile(FastEngine engine, File file) throws Exception {
        FastExtConfig extConfig = engine.getConfig(FastExtConfig.class);
        if (extConfig.isCompressAppJs()) {
            if (file.getName().endsWith(".js")) {
                String filePath = file.getPath();
                filePath = FastStringUtils.strip(filePath.replace(engine.getPath().getWebRootPath(), ""), "/");
                if (filePath.endsWith(".min.js")) {
                    return;
                }
                if ((filePath.startsWith("app/"))) {
                    GoogleCompress.compress(file.getPath());
                }
            }
        }
    }
}
