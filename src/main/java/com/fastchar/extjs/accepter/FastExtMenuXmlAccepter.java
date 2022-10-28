package com.fastchar.extjs.accepter;

import com.fastchar.core.FastEngine;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.interfaces.IFastScannerAccepter;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class FastExtMenuXmlAccepter implements IFastScannerAccepter {
    public static List<String> MENU_XML_PATH_LIST = new ArrayList<>();

    @Override
    public void onScannerClass(FastEngine engine, Class<?> scannedClass) throws Exception {
    }

    @Override
    public void onScannerFile(FastEngine engine, File file) throws Exception {
        if (file.getName().toLowerCase().startsWith(FastExtConfig.getInstance().getMenuPrefix())
                && file.getName().toLowerCase().endsWith(".xml")) {
            MENU_XML_PATH_LIST.add(file.getAbsolutePath());
        }

    }
}
