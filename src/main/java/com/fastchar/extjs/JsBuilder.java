package com.fastchar.extjs;

import com.fastchar.extjs.compress.YuiCompress;
import com.fastchar.utils.FastFileUtils;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

final class JsBuilder {
    public static void build(String targetPath, String savePath) throws Exception {
        File[] files = new File(targetPath).listFiles(new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
                // TODO Auto-generated method stub
                return name.startsWith("build") && name.endsWith(".txt");
            }
        });
        if (files == null) {
            return;
        }
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
        //合并插件
//        build("/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/extjs/ux",
//                "/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/extjs");

//
        build("/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/base/utils",
                "/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/base/utils");

//        YuiCompress.compress("/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/base/login/login.js",
//                "/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/base/login/login.min.js");
////

//        YuiCompress.compress("/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/base/index/index.js",
//                "/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/base/index/index.min.js");
//
//
//        YuiCompress.compress("/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/base/welcome/welcome.js",
//                "/Volumes/JanesenDisk_Work/WorkSpace/space_ij/CrosheWork/FastChar-ExtJs/web/base/welcome/welcome.min.js");


//        String regStr = "([^/]*.svg)";
//        Pattern compile = Pattern.compile(regStr);
//        Matcher matcher = compile.matcher("icon?path=icons/icon_manage_eye.svg&color=2aa167");
//        if (matcher.find()) {
//            System.out.println(matcher.group(1));
//        }

    }

}
