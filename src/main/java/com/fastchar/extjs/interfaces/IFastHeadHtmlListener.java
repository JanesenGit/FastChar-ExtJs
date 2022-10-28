package com.fastchar.extjs.interfaces;

import java.io.File;

/**
 * 系统全局fast-head-*.html文件相关监听
 */
public interface IFastHeadHtmlListener {

    /**
     * 当解析fast-head-*.html时触发
     * @param headHtml 文件
     * @return 布尔值，true或null：允许，false：不允许
     */
    Boolean onParseHeadHtml(File headHtml);

}
