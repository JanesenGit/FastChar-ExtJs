package com.fastchar.extjs.compress;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastFile;
import com.fastchar.utils.FastFileUtils;
import com.yahoo.platform.yui.compressor.CssCompressor;
import com.yahoo.platform.yui.compressor.JavaScriptCompressor;
import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.EvaluatorException;

import java.io.*;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

public class YuiCompress {

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
            compress(file.getPath(),code, new BufferedWriter(new OutputStreamWriter(new FileOutputStream(targetPath), Charset.forName("utf-8"))));
        } else {
            File[] files = file.listFiles();
            if (files != null) {
                for (File file2 : files) {
                    compress(file2.getAbsolutePath());
                }
            }
        }
    }


    private static void compress(final String filePath, String code, Writer writer) {
        try (Reader in = new InputStreamReader(new ByteArrayInputStream(code.getBytes()))) {
            if (in.ready()) {
                JavaScriptCompressor compressor = new JavaScriptCompressor(in, new ErrorReporter() {
                    @Override
                    public void warning(String message, String sourceName,
                                        int line, String lineSource, int lineOffset) {
                    }

                    @Override
                    public void error(String message, String sourceName,
                                      int line, String lineSource, int lineOffset) {
                        if (line > 0) {
                            FastChar.getLog().warn(YuiCompress.class,"【JS压缩错误】 "+filePath + "\tat " + line + ':' + lineOffset + ':' + message);
                        }
                    }

                    @Override
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


    public static String compressCss(String source) {
        StringWriter writer = new StringWriter();

        try (Reader in = new StringReader(source)) {
            if (in.ready()) {
                CssCompressor compressor = new CssCompressor(in);
                compressor.compress(writer, -1);
            }
        } catch (Exception e) {
            try {
                writer.write(source);
            } catch (Exception ignored) {
            }
        } finally {
            FastFileUtils.closeQuietly(writer);
        }
        return writer.toString();
    }




    /**
     * 强制释放JavaScriptCompressor
     */
    public static void releaseYuiCompressor() {
        for (Field field : JavaScriptCompressor.class.getDeclaredFields()) {
            if (field.getName().equalsIgnoreCase("threes")) {
                try {
                    field.setAccessible(true);
                    ArrayList<?> array = (ArrayList<?>) field.get(JavaScriptCompressor.class);
                    array.clear();
                    field.setAccessible(false);
                } catch (Exception ignored) {}
            }
        }
    }


}
