package com.fastchar.extjs.interfaces;

import com.fastchar.extjs.core.menus.FastMenuInfo;

/**
 * 系统菜单监听类
 * @author 沈建（Janesen）
 * @date 2020/7/15 10:33
 */
public interface IFastMenuListener {

    /**
     * 解析menu.xml添加菜单回调
     * @param menuInfo 菜单对象
     * @return  布尔值，true：允许，false：不允许
     */
    boolean onAddMenu(FastMenuInfo menuInfo);
}
