package com.fastchar.extjs.interceptor;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastFile;
import com.fastchar.interfaces.IFastInterceptor;
import com.fastchar.utils.FastFileUtils;
import com.sun.xml.internal.org.jvnet.fastinfoset.FastInfosetException;
import net.coobird.thumbnailator.Thumbnails;
import net.coobird.thumbnailator.name.Rename;

import java.io.File;
import java.io.IOException;
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
                    List<File> files = Thumbnails.of(fastFile.getFile())
                            .size(resizeToWidth, resizeToHeight)
                            .allowOverwrite(true)
                            .asFiles( Rename.NO_CHANGE);
                    for (File thumbFile : files) {
                        FastFileUtils.moveFile(thumbFile, fastFile.getFile(), true);
                    }
                }
            }
        }
        fastAction.invoke();
    }

}
