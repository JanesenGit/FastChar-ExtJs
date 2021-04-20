package com.fastchar.extjs.utils;

import com.fastchar.core.FastChar;
import com.fastchar.utils.FastFileUtils;

import javax.activation.FileTypeMap;
import javax.activation.MimetypesFileTypeMap;
import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class ExtFileUtils {

    public static File searchFirstFile(File directory, String... keys) {
        if (directory.isDirectory()) {
            return searchFirstFile(directory.getAbsolutePath(), keys);
        }
        return null;
    }
    public static File searchFirstFile(String directory, final String... keys) {
        File parent = new File(directory);
        File[] files = parent.listFiles(new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
                int matchCount = 0;
                for (String key : keys) {
                    if (name.contains(key)) {
                        matchCount++;
                    }
                }
                return keys.length == matchCount;
            }
        });
        if (files == null) {
            return null;
        }

        List<File> list = Arrays.asList(files);
        Collections.sort(list, new Comparator<File>() {
            @Override
            public int compare(File o1, File o2) {
                return o2.compareTo(o1);
            }
        });
        if (list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    /**
     * 合并文件
     */
    public static void merge(File targetFile, File... files) {
        try {
            StringBuilder builder = new StringBuilder();
            for (File file : files) {
                if (file.exists()) {
                    String jsContent = FastFileUtils.readFileToString(file, StandardCharsets.UTF_8);
                    builder.append(jsContent);
                }
            }
            FastFileUtils.writeStringToFile(targetFile, builder.toString(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }



}
