package com.fastchar.extjs.interfaces;

import com.fastchar.extjs.core.menus.FastMenuInfo;

import java.io.File;

/**
 * 系统菜单监听类，可根据登录角色实时筛选过滤
 *
 * @author 沈建（Janesen）
 * @date 2020/7/15 10:33
 */
public interface IFastMenuXmlListener {

    /**
     * 当解析菜单xml文件时触发
     *
     * @param menuFile xml文件
     * @return 布尔值，true或null：允许，false：不允许
     */
    Boolean onParseMenuXml(File menuFile);

    /**
     * 当显菜单时触发
     *
     * @param menuInfo 菜单对象
     * @return 布尔值，true或null：允许，false：不允许
     */
    Boolean onShowMenu(FastMenuInfo menuInfo);
}
