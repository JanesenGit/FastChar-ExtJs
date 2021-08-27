package com.fastchar.extjs.core;

/**
 * 系统权限的类型
 */
public enum FastExtLayerType {
    /**
     * 无层级权限功能
     */
    None,
    /**
     * 以管理员角色为最高权限筛选
     */
    Layer_Role,
    /**
     * 以管理员为最高权限筛选
     */
    Layer_Manager,
}
