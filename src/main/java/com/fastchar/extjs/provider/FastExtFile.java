package com.fastchar.extjs.provider;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastFile;
import com.fastchar.interfaces.IFastFileUrl;
import com.fastchar.utils.FastStringUtils;

public class FastExtFile implements IFastFileUrl {
    @Override
    public String getFileUrl(FastFile fastFile) throws Exception{
        String absolutePath = fastFile.getFile().getAbsolutePath();
        String replace = absolutePath.replace(FastChar.getConstant().getAttachDirectory(), "");
        return "attach/" + FastStringUtils.stripStart(replace, "/");

    }
}
