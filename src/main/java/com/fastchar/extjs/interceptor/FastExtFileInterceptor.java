package com.fastchar.extjs.interceptor;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastFile;
import com.fastchar.interfaces.IFastInterceptor;
import com.fastchar.utils.FastFileUtils;
import com.sun.xml.internal.org.jvnet.fastinfoset.FastInfosetException;
import net.coobird.thumbnailator.Thumbnails;
import net.coobird.thumbnailator.name.Rename;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.List;

public class FastExtFileInterceptor implements IFastInterceptor {

    @Override
    public void onInterceptor(FastAction fastAction) throws Exception {
        List<FastFile<?>> paramListFile = fastAction.getParamListFile();
        for (FastFile<?> fastFile : paramListFile) {
            if (fastFile.isImageFile()) {
                int resizeToWidth = fastAction.getParamToInt(fastFile.getParamName() + ".width", -1);
                int resizeToHeight = fastAction.getParamToInt(fastFile.getParamName() + ".height", -1);
                if (resizeToWidth > 0 && resizeToHeight > 0) {
                    List<File> files = Thumbnails.of(fastFile.getFile())
                            .size(resizeToWidth, resizeToHeight)
                            .allowOverwrite(true)
                            .asFiles( Rename.NO_CHANGE);
                    for (File thumbFile : files) {
                        BufferedImage bufferedImage = ImageIO.read(thumbFile);
                        fastFile.setAttr("width", bufferedImage.getWidth());
                        fastFile.setAttr("height", bufferedImage.getHeight());
                        FastFileUtils.moveFile(thumbFile, fastFile.getFile(), true);
                    }
                }else{
                    BufferedImage bufferedImage = ImageIO.read(fastFile.getFile());
                    if (bufferedImage != null) {
                        fastFile.setAttr("width", bufferedImage.getWidth());
                        fastFile.setAttr("height", bufferedImage.getHeight());
                    }
                }
            }
        }
        fastAction.invoke();
    }

}
