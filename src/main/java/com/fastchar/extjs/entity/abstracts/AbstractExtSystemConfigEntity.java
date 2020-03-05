package com.fastchar.extjs.entity.abstracts;

import com.fastchar.core.FastEntity;
import com.fastchar.extjs.entity.ExtSystemConfigEntity;

import java.util.Date;

public abstract class AbstractExtSystemConfigEntity extends FastEntity<ExtSystemConfigEntity> {
    private static final long serialVersionUID = -6064906303795137282L;

    public int getConfigId() {
        return getInt("configId");
    }

    public void setConfigId(int configId) {
        set("configId", configId);
    }

    public String getEntityCode() {
        return getString("entityCode");
    }

    public void setEntityCode(String entityCode) {
        set("entityCode", entityCode);
    }

    public String getMenuId() {
        return getString("menuId");
    }

    public void setMenuId(String menuId) {
        set("menuId", menuId);
    }

    public String getConfigKey() {
        return getString("configKey");
    }

    public void setConfigKey(String configKey) {
        set("configKey", configKey);
    }

    public String getConfigType() {
        return getString("configType");
    }

    public void setConfigType(String configType) {
        set("configType", configType);
    }

    public int getManagerId() {
        return getInt("managerId");
    }

    public void setManagerId(int managerId) {
        set("managerId", managerId);
    }

    public String getConfigValue() {
        return getString("configValue");
    }

    public void setConfigValue(String configValue) {
        set("configValue", configValue);
    }

    public Date getConfigDateTime() {
        return getDate("configDateTime");
    }

    public void setConfigDateTime(Date configDateTime) {
        set("configDateTime", configDateTime);
    }
}