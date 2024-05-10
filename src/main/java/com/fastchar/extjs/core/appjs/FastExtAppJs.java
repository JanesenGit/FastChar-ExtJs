package com.fastchar.extjs.core.appjs;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastResource;
import com.fastchar.extjs.core.configjson.FastExtConfigJson;
import com.fastchar.extjs.goole.compress.GoogleCompress;
import com.fastchar.extjs.utils.ExtFileUtils;
import com.fastchar.utils.FastFileUtils;
import com.fastchar.utils.FastStringUtils;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.*;

public class FastExtAppJs {

    public static FastExtAppJs getInstance() {
        return FastChar.getOverrides().singleInstance(FastExtAppJs.class);
    }


    /**
     * 获取所有appjs文件夹下的所有js文件夹
     *
     * @return File对象集合
     */
    public List<FastResource> getAppJs() throws Exception {
        FastExtConfigJson extConfigJson = FastExtConfigJson.getInstance();

        //将压缩合并的js文件上级目录，注册到web公开目录中，允许对外访问
        FastChar.getWebResources().addPublicResourcePath(Paths.get(extConfigJson.getAppJsBin(), "../").normalize().toString());


        File mergeFile = new File(FastChar.getPath().getWebRootPath(), extConfigJson.getAppJsBin());
        if (mergeFile.exists() && mergeFile.isFile()) {
            if (mergeFile.lastModified() >= FastChar.getConstant().getEndInitTime()) {
                return Collections.singletonList(new FastResource(mergeFile));
            } else {
                FastFileUtils.forceDelete(mergeFile);
            }
        }

        Map<String, List<FastExtJsFile>> allAppJs = getAppJsFiles();

        List<FastResource> jsFiles = new ArrayList<>();
        for (Map.Entry<String, List<FastExtJsFile>> stringListEntry : allAppJs.entrySet()) {
            List<FastExtJsFile> value = stringListEntry.getValue();
            if (value.isEmpty()) {
                continue;
            }

            if (value.size() > 1) {
                value.sort(Comparator.comparingInt(FastExtJsFile::getLevel));
            }

            jsFiles.add(value.get(0).getFile());
        }
        if (extConfigJson.getAppJsBinEnable()) {
            merge(mergeFile, jsFiles.toArray(new FastResource[]{}));
            GoogleCompress.compress(mergeFile.getAbsolutePath());
            return Collections.singletonList(new FastResource(mergeFile));
        }
        return jsFiles;
    }


    public Map<String, List<FastExtJsFile>> getAppJsFiles() {
        Map<String, List<FastExtJsFile>> mapFiles = new LinkedHashMap<>();

        List<FastResource> resources = new ArrayList<>();

        List<String> appJsDir = FastExtConfigJson.getInstance().getAppJsDir();
        for (String dir : appJsDir) {
            resources.addAll(FastChar.getWebResources().getResources(dir, resource -> {
                String name = resource.getName().toLowerCase();
                return name.endsWith(".js");
            }));
        }

        for (FastResource resource : resources) {
            FastExtJsFile fastExtJsFile = new FastExtJsFile(resource);
            String fileCode = fastExtJsFile.getFileCode();
            if (!mapFiles.containsKey(fileCode)) {
                mapFiles.put(fileCode, new ArrayList<>());
            }
            mapFiles.get(fileCode).add(fastExtJsFile);
        }
        return mapFiles;
    }


    private void merge(File targetFile, FastResource... files) {
        try {
            List<String> binContent = new ArrayList<>();
            for (FastResource file : files) {
                String jsContent = FastStringUtils.join(FastFileUtils.readLines(file.getInputStream(), StandardCharsets.UTF_8), "\n");
                binContent.add(jsContent);
            }
            FastFileUtils.writeStringToFile(targetFile, FastStringUtils.join(binContent, "\n"), StandardCharsets.UTF_8);
        } catch (Exception e) {
            FastChar.getLogger().error(ExtFileUtils.class, e);
        }
    }


}
