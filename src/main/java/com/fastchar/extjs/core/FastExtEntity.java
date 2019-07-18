package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastExtData;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtManagerRoleEntity;

public abstract class FastExtEntity<E extends FastEntity> extends FastEntity<E> {

    private static final long serialVersionUID = 3922925004072340430L;

    /**
     * 获得关联的表格名称
     */
    public abstract String getTableName();


    /**
     * 获得数据列表
     */
    public abstract FastPage<E> showList(int page, int pageSize);


    /**
     * 获得权限数据列表
     */
    public FastPage<E> showLayerList(ExtManagerEntity managerEntity, int page, int pageSize) {
        if (getLayerColumn() != null) {
            if (managerEntity.getManagerRole().getRoleType() != ExtManagerRoleEntity.RoleTypeEnum.系统角色) {
                put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue());
            }
        }
        return showList(page, pageSize);
    }

    /**
     * 获得实体唯一编号
     */
    public String getEntityCode() {
        return this.getClass().getSimpleName();
    }

    /**
     * 设置字段默认值
     */
    public abstract void setDefaultValue();


    /**
     * 获得层级编号
     */
    public String getLayerValue() {
        return getLayerValue(0);
    }

    /**
     * 获得层级编号值
     * @param upLevel 向上 例如：1 代表获取上一级的层级编号
     */
    public String getLayerValue(int upLevel) {
        if (getLayerColumn() != null) {
            String value = getString(getLayerColumn().getName());
            for (int i = 0; i < upLevel; i++) {
                int endIndex = value.lastIndexOf("@");
                if (endIndex > 0) {
                    value = value.substring(0, endIndex);
                }
            }
            return value;
        }
        return null;
    }


    public FastExtColumnInfo getLayerColumn() {
        FastTableInfo<?> tableInfo = FastChar.getDatabases().get(getDatabase()).getTableInfo(getTableName());
        if (tableInfo instanceof FastExtTableInfo) {
            FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
            return extTableInfo.getLayerColumn();
        }
        return null;
    }


    public FastExtColumnInfo getLayerLinkColumn() {
        FastTableInfo<?> tableInfo = FastChar.getDatabases().get(getDatabase()).getTableInfo(getTableName());
        if (tableInfo instanceof FastExtTableInfo) {
            FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
            return extTableInfo.getLayerLinkColumn();
        }
        return null;
    }


    public String selectLayerValue() {
        return ((FastExtData) fastData).selectLayerValue();
    }


}
