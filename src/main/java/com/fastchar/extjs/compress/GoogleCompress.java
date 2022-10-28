package com.fastchar.extjs.compress;

import com.fastchar.utils.FastFileUtils;
import com.google.javascript.jscomp.CompilationLevel;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.SourceFile;

import java.io.File;
import java.io.IOException;

public class GoogleCompress {


    /**
     * 压缩js代码
     *
     * @param path 可为目录或文件
     */
    public static void compress(String path) throws Exception {
        compress(path, path);
    }

    /**
     * 压缩js代码
     *
     * @param path 可为目录或文件
     */
    public static void compress(String path, String targetPath) throws Exception {
        File file = new File(path);
        if (file.isFile() && file.getName().endsWith(".js")) {
            doCompress(file.getPath(), targetPath);
        } else {
            File[] files = file.listFiles();
            if (files != null) {
                for (File file2 : files) {
                    compress(file2.getAbsolutePath());
                }
            }
        }
    }


    private static void doCompress(String sourcePath, String savePath) {
        try {
            String code = FastFileUtils.readFileToString(new File(sourcePath));
            Compiler compiler = new Compiler();

            CompilerOptions options = new CompilerOptions();
            CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(options);
            options.setEmitUseStrict(false);
            options.setLanguageOut(CompilerOptions.LanguageMode.ECMASCRIPT5);
            
            SourceFile extern = SourceFile.fromCode("extern.js",
                    "function alert(x) {}");

            SourceFile input = SourceFile.fromCode("input.js", code);
            compiler.compile(extern, input, options);

            FastFileUtils.writeStringToFile(new File(savePath), compiler.toSource());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
