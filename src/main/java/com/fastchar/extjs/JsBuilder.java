package com.fastchar.extjs;

import com.fastchar.extjs.compress.YuiCompress;
import com.fastchar.utils.FastFileUtils;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

final class JsBuilder {
    public static void build(String targetPath, String savePath) throws Exception {
        File[] files = new File(targetPath).listFiles(new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
                // TODO Auto-generated method stub
                return name.startsWith("build") && name.endsWith(".txt");
            }
        });
        for (File file : files) {
            List<String> lines = FastFileUtils.readLines(file);
            String buildFileName = lines.get(0);

            File targetFile = new File(savePath, buildFileName);

            List<File> listFile = new ArrayList<File>();
            for (int i = 1; i < lines.size(); i++) {
                System.out.println("合并文件：" + lines.get(i));
                listFile.add(new File(targetPath, lines.get(i)));
            }
            YuiCompress.merge(targetFile, listFile.toArray(new File[]{}));
            if (file.getName().contains("compress")) {
                YuiCompress.compress(targetFile.getPath());
                System.out.println("正在压缩中……");
            }
            System.out.println("构建成功！" + targetFile);
        }
    }

    public static void main(String[] args) throws Exception {
        build("/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/ext/ux",
                "/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/ext");
//        YuiCompress.compress("/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/ext/ext-ux-all.js");
    }

}