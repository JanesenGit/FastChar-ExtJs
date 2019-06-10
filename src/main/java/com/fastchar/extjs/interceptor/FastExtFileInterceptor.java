package com.fastchar.extjs.interceptor;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastFile;
import com.fastchar.interfaces.IFastInterceptor;
import net.coobird.thumbnailator.Thumbnails;

import java.util.List;

public class FastExtFileInterceptor implements IFastInterceptor {

    @Override
    public void onInterceptor(FastAction fastAction) throws Exception {
        List<FastFile<?>> paramListFile = fastAction.getParamListFile();
        for (FastFile fastFile : paramListFile) {
            if (fastFile.isImageFile()) {
                int resizeToWidth = fastAction.getParamToInt(fastFile.getParamName() + ".width", -1);
                int resizeToHeight = fastAction.getParamToInt(fastFile.getParamName() + ".height", -1);
                if (resizeToWidth > 0 && resizeToHeight > 0) {
                    Thumbnails.of(fastFile.getFile())
                            .size(resizeToWidth, resizeToHeight)
                            .toFile(fastFile.getFile());
                }
            }
        }
        fastAction.invoke();
    }
}
