package com.fastchar.extjs.accepter;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEngine;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.compress.UglifyJsCompress;
import com.fastchar.extjs.compress.YuiCompress;
import com.fastchar.extjs.utils.ExtFileUtils;
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
        FastExtConfig extConfig = engine.getConfig(FastExtConfig.class);
        if (extConfig.isCompressAppJs()) {
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
