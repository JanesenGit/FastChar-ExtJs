package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.utils.FastFileUtils;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class FastExtDesktopHelper {


    public static List<File> getAllBackgroundImage() {
        List<File> allImages = new ArrayList<>();
        listBackgroundImageFiles(allImages, new File(FastChar.getPath().getWebRootPath(), "base/desktop"));
        return allImages;
    }

    private static void listBackgroundImageFiles(List<File> files, File parent) {
        if (parent == null) {
            return;
        }

        File[] childFiles = parent.listFiles();
        if (childFiles == null) {
            return;
        }

        for (File childFile : childFiles) {
            if (childFile.isDirectory()) {
                listBackgroundImageFiles(files, childFile);
                continue;
            }
            if (childFile.getName().toLowerCase().startsWith("desktop_bg_img") && FastFileUtils.isImageFile(childFile.getName())) {
                files.add(childFile);
            }
        }
    }
}
