package com.fastchar.extjs.compress;

import com.fastchar.core.FastChar;
import com.fastchar.exception.FastFileException;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.utils.FastFileUtils;

import java.io.File;

/**
 * @author 沈建（Janesen）
 * @date 2021/4/11 13:04
 */
public class UglifyJsCompress {

    public static void compress(String inPath) throws Exception {
        compress(inPath, inPath);
    }

    public static void compress(String inPath, String outPath) throws Exception {
        compress(" -m -c -o ", inPath, outPath);
    }

    public static void compress(String cmdOption,String inPath, String outPath) throws Exception {
        String uglifyJsPath = FastChar.getConfig(FastExtConfig.class).getUglifyJsPath();
        File file = new File(uglifyJsPath);
        if (!file.exists()) {
            throw new FastFileException("uglify-js的库路径【" + uglifyJsPath + "】不存在！");
        }

        String cmdBuilder = uglifyJsPath + "/bin/uglifyjs " + inPath + " " + cmdOption + " " + outPath;
        Process p = Runtime.getRuntime().exec(cmdBuilder);//创建实例进程执行命令行代码
        p.waitFor();
        p.destroy();
    }
}
