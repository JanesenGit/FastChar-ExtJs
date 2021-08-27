package com.fastchar.extjs;

import com.fastchar.core.FastChar;
import com.fastchar.extjs.compress.UglifyJsCompress;
import com.fastchar.extjs.compress.YuiCompress;
import com.fastchar.extjs.utils.ExtFileUtils;
import com.fastchar.utils.FastFileUtils;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.math.BigInteger;
import java.util.*;
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
            ExtFileUtils.merge(targetFile, listFile.toArray(new File[]{}));
            if (file.getName().contains("compress")) {
                UglifyJsCompress.compress(targetFile.getPath(),targetFile.getPath());
                System.out.println("正在压缩中……");
            }
            System.out.println("构建成功！" + targetFile);
        }
    }

    public static void tscBuild(String configJsonPath) {
        String cmdBuilder = "tsc --build " + configJsonPath;
        try {
            Process p = Runtime.getRuntime().exec(cmdBuilder);//创建实例进程执行命令行代码
            p.waitFor();
            p.destroy();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) throws Exception {
        String projectLocalPath = "/Users/Janesen/工作/space_idea/FrameWork";
        FastChar.getConfig(FastExtConfig.class).setUglifyJsPath("/Users/Janesen/node_modules/uglify-js");

        //合并插件
        build(projectLocalPath + "/FastChar-ExtJs/web/extjs/ux",
                projectLocalPath + "/FastChar-ExtJs/web/extjs");


        UglifyJsCompress.compress(projectLocalPath + "/FastChar-ExtJs/web/base/login/login.js",
                projectLocalPath + "/FastChar-ExtJs/web/base/login/login.min.js");

        UglifyJsCompress.compress(projectLocalPath + "/FastChar-ExtJs/web/base/index/index.js",
                projectLocalPath + "/FastChar-ExtJs/web/base/index/index.min.js");

        FastFileUtils.deleteQuietly(new File(projectLocalPath + "/FastChar-ExtJs/web/base/utils/fast-ext-utils.js"));

        tscBuild(projectLocalPath + "/FastChar-ExtJs/web/base/utils/tsconfig.json");

        UglifyJsCompress.compress(projectLocalPath + "/FastChar-ExtJs/web/base/utils/fast-ext-utils.js",
                projectLocalPath + "/FastChar-ExtJs/web/base/utils/fast-ext-utils.js");


        System.out.println("构建结束！");
        System.exit(0);

    }

}
