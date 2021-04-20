package com.fastchar.extjs.interfaces;

import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.extjs.entity.ExtManagerEntity;

/**
 * FastExtEntity 填充权限筛选监听
 * @author 沈建（Janesen）
 * @date 2020/12/23 10:59
 */
public interface IFastLayerListener {

    /**
     * 填充权限筛选
     * @param entity 当前实体类
     * @param managerEntity 管理员实体类
     * @return 布尔值，true 代表已消费终止下面执行
     */
    boolean onPullLayer(FastExtEntity<?> entity, ExtManagerEntity managerEntity);
}
