package com.fastchar.extjs.interfaces;

import com.fastchar.core.FastAction;
import com.fastchar.extjs.entity.ExtManagerEntity;

import java.util.List;

public interface IFastAppJsDirectoryListener {

    /**
     * 获取appjs所在相对webroot下的目录
     */
    List<String> getAppJsDirectory(ExtManagerEntity session, FastAction action);


    /**
     * 获取appjs合并生成的文件名称
     */
    String getAppJsMerge(ExtManagerEntity session, FastAction action);

}
