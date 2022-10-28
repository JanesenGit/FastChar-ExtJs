package com.fastchar.extjs.utils;

import com.fastchar.utils.FastFileUtils;
import com.fastchar.utils.FastStringUtils;

import java.io.File;
import java.io.FilenameFilter;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

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


    public static File searchFile(File parentFile, String fileName, String endPrefix, boolean isExact) {
        if (FastStringUtils.isEmpty(fileName)) {
            fileName = "";
        }
        if (parentFile.isDirectory()) {
            File[] files = parentFile.listFiles();
            if (files == null) {
                return null;
            }
            Arrays.sort(files, new Comparator<File>() {
                @Override
                public int compare(File o1, File o2) {
                    return o1.compareTo(o2);
                }
            });

            for (File child : files) {
                if (child.isFile()) {
                    if (isExact) {
                        if (child.getName().equals(fileName) && child.getName().endsWith(endPrefix)) {
                            return child;
                        }
                    } else {
                        if (child.getName().contains(fileName) && child.getName().endsWith(endPrefix)) {
                            return child;
                        }
                    }
                }
                File file = searchFile(child, fileName, endPrefix, isExact);
                if (file != null) {
                    return file;
                }
            }
        } else if (parentFile.getName().contains(fileName) && parentFile.getName().endsWith(endPrefix) && !isExact) {
            return parentFile;
        } else if (parentFile.getName().equals(fileName) && parentFile.getName().endsWith(endPrefix) && isExact) {
            return parentFile;
        }
        return null;
    }

}
