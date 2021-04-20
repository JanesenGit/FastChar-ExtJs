package com.fastchar.extjs.interfaces;

import com.fastchar.extjs.core.menus.FastMenuInfo;

import java.io.File;

/**
 * appjs加载监听
 * @author 沈建（Janesen）
 * @date 2020/7/15 11:02
 */
public interface IFastAppJsListener {


    /**
     * 加载js文件监听
     *
     * @param file js文件对象
     * @return 布尔值，true：允许，false：不允许
     */
    boolean onLoadJs(File file);

}
