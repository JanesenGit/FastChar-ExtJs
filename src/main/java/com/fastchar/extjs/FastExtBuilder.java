package com.fastchar.extjs;

import com.fastchar.core.FastChar;
import com.fastchar.exception.FastFileException;
import com.fastchar.extjs.compress.GoogleCompress;
import com.fastchar.extjs.utils.ExtFileUtils;
import com.fastchar.utils.FastFileUtils;

import java.io.File;
import java.io.FilenameFilter;
import java.util.ArrayList;
import java.util.List;

final class FastExtBuilder {

    public static class UglifyJsCompress {

        public static void compress(String inPath) throws Exception {
            compress(inPath, inPath);
        }

        public static void compress(String inPath, String outPath) throws Exception {
            compress(" -m -c -o ", inPath, outPath);
        }

        public static void compress(String cmdOption, String inPath, String outPath) throws Exception {
            String uglifyJsPath = FastChar.getConfig(FastExtConfig.class).getUglifyJsPath();
            File file = new File(uglifyJsPath);
            if (!file.exists()) {
                throw new FastFileException("uglify-js的库路径【" + uglifyJsPath + "】不存在！");
            }

            String cmdBuilder = new File(uglifyJsPath, "bin" + File.separator + "uglifyjs").getAbsolutePath() + " " + inPath + " " + cmdOption + " " + outPath;
            Process p = Runtime.getRuntime().exec(cmdBuilder);//创建实例进程执行命令行代码
            p.waitFor();
            p.destroy();
        }
    }

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
            if (file.getName().contains("compress-css")) {
                String cmdBuilder = "/Users/Janesen/node_modules/csso-cli/bin/csso " + targetFile + " --output " + targetFile;
                Process p = Runtime.getRuntime().exec(cmdBuilder);//创建实例进程执行命令行代码
                p.waitFor();
                p.destroy();
            } else if (file.getName().contains("compress")) {
                GoogleCompress.compress(targetFile.getPath(), targetFile.getPath());
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
        System.setProperty("FastChar-GoogleCompress-VR", "local");

        String projectLocalPath = "/Users/Janesen/工作/space_idea/FrameWork";
        FastChar.getConfig(FastExtConfig.class).setUglifyJsPath("/Users/Janesen/node_modules/uglify-js");

        //合并主题
        build(projectLocalPath + "/FastChar-ExtJs/web/extjs/theme/fastchar/flat",
                projectLocalPath + "/FastChar-ExtJs/web/extjs/theme");

        build(projectLocalPath + "/FastChar-ExtJs/web/extjs/theme/fastchar/wrap",
                projectLocalPath + "/FastChar-ExtJs/web/extjs/theme");


        //合并插件
        build(projectLocalPath + "/FastChar-ExtJs/web/extjs/ux",
                projectLocalPath + "/FastChar-ExtJs/web/extjs");


        GoogleCompress.compress(projectLocalPath + "/FastChar-ExtJs/web/base/login/login.js",
                projectLocalPath + "/FastChar-ExtJs/web/base/login/login.min.js");

        GoogleCompress.compress(projectLocalPath + "/FastChar-ExtJs/web/base/index/index.js",
                projectLocalPath + "/FastChar-ExtJs/web/base/index/index.min.js");

        FastFileUtils.deleteQuietly(new File(projectLocalPath + "/FastChar-ExtJs/web/base/utils/head"));
        FastFileUtils.deleteQuietly(new File(projectLocalPath + "/FastChar-ExtJs/web/base/utils/fast-ext-utils.d.ts"));
        FastFileUtils.deleteQuietly(new File(projectLocalPath + "/FastChar-ExtJs/web/base/utils/fast-ext-utils.js"));
        FastFileUtils.deleteQuietly(new File(projectLocalPath + "/FastChar-ExtJs/web/base/utils/fast-ext-utils.min.js"));

        tscBuild(projectLocalPath + "/FastChar-ExtJs/web/base/utils/src/tsconfig.json");
        
        //构建声明文件
//        tscBuild(projectLocalPath + "/FastChar-ExtJs/web/base/utils/src/tsconfig-head.json");

        GoogleCompress.compress(projectLocalPath + "/FastChar-ExtJs/web/base/utils/fast-ext-utils.js",
                projectLocalPath + "/FastChar-ExtJs/web/base/utils/fast-ext-utils.min.js");

        System.out.println("构建结束！");
        System.exit(0);
        

    }

}
