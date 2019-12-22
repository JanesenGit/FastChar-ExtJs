package com.fastchar.extjs.compress;

import com.fastchar.utils.FastFileUtils;
import com.yahoo.platform.yui.compressor.JavaScriptCompressor;
import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.EvaluatorException;

import java.io.*;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.nio.charset.Charset;
import java.util.ArrayList;

public class YuiCompress {

    /**
     * 合并文件
     */
    public static void merge(File targetFile, File... files) {
        try {
            StringBuilder builder = new StringBuilder();
            for (File file : files) {
                if (file.exists()) {
                    String jsContent = FastFileUtils.readFileToString(file, Charset.forName("utf-8"));
                    builder.append(jsContent);
                }
            }
            FastFileUtils.writeStringToFile(targetFile, builder.toString(), Charset.forName("utf-8"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    /**
     * 压缩js代码
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
            String code = FastFileUtils.readFileToString(file, "utf-8");
            compress(code, new BufferedWriter(new OutputStreamWriter(new FileOutputStream(targetPath), Charset.forName("utf-8"))));
        } else {
            File[] files = file.listFiles();
            if (files != null) {
                for (File file2 : files) {
                    compress(file2.getAbsolutePath());
                }
            }
        }
    }



    private static void compress(String code, Writer writer) {
        try (Reader in = new InputStreamReader(new ByteArrayInputStream(code.getBytes()))) {
            if (in.ready()) {
                JavaScriptCompressor compressor = new JavaScriptCompressor(in, new ErrorReporter() {
                    public void warning(String message, String sourceName,
                                        int line, String lineSource, int lineOffset) {
                    }

                    public void error(String message, String sourceName,
                                      int line, String lineSource, int lineOffset) {
                    }

                    public EvaluatorException runtimeError(String message, String sourceName,
                                                           int line, String lineSource, int lineOffset) {

                        return null;
                    }
                });
                compressor.compress(writer, -1, true, false, false, false);
            }
        } catch (Exception e) {
            try {
                writer.write(code);
            } catch (Exception ignored) {
            }
        } finally {
            FastFileUtils.closeQuietly(writer);
        }
    }


    /**
     * 强制释放JavaScriptCompressor
     */
    public static void releaseYuiCompressor() {
        for (Field field : JavaScriptCompressor.class.getDeclaredFields()) {
            if (field.getName().equalsIgnoreCase("threes")) {
                try {
                    field.setAccessible(true);
                    ArrayList array = (ArrayList) field.get(JavaScriptCompressor.class);
                    array.clear();
                    field.setAccessible(false);
                } catch (Exception ignored) {}
            }
        }

    }


}
