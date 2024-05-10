package com.fastchar.extjs.utils;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastMapWrap;
import com.fastchar.utils.FastFileUtils;
import com.fastchar.utils.FastStringUtils;

import java.io.File;
import java.io.FilenameFilter;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
        if (!list.isEmpty()) {
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
            FastChar.getLogger().error(ExtFileUtils.class, e);
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


    /**
     * 替换占位符 ${.*}
     *
     * @param placeholders 属性值
     * @param content      需要替换的内容
     * @return 替换后的内容
     */
    public static String replacePlaceholder(Map<String, Object> placeholders, String content) {
        if (FastStringUtils.isEmpty(content)) {
            return content;
        }
        Pattern compile = Pattern.compile("(\\$[{\\[][^{}\\[\\]]+[}\\]])");
        Matcher matcher = compile.matcher(content);
        FastMapWrap fastMapWrap = FastMapWrap.newInstance(placeholders);

        Map<String, String> keyValue = new HashMap<>();
        while (matcher.find()) {
            String realKey = matcher.group(1);
            String runKey = realKey.replace("[", "{").replace("]", "}");
            String value = fastMapWrap.getString(runKey, "");
            keyValue.put(realKey, value);
        }
        for (String key : keyValue.keySet()) {
            content = content.replace(key, keyValue.get(key));
        }
        return content;
    }





}
