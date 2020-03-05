package com.fastchar.extjs.entity.abstracts;

import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.extjs.entity.ExtManagerEntity.*;
import com.fastchar.extjs.entity.ExtManagerEntity;

import java.util.Date;

public abstract class AbstractExtManagerEntity extends FastExtEntity<ExtManagerEntity> {
    private static final long serialVersionUID = 3961959460555559737L;

    public String getManagerLayerCode() {
        return getString("managerLayerCode");
    }

    public AbstractExtManagerEntity setManagerLayerCode(String managerLayerCode) {
        set("managerLayerCode", managerLayerCode);
        return this;
    }

    public int getManagerId() {
        return getInt("managerId");
    }

    public AbstractExtManagerEntity setManagerId(int managerId) {
        set("managerId", managerId);
        return this;
    }

    public String getManagerLoginName() {
        return getString("managerLoginName");
    }

    public AbstractExtManagerEntity setManagerLoginName(String managerLoginName) {
        set("managerLoginName", managerLoginName);
        return this;
    }

    public String getManagerName() {
        return getString("managerName");
    }

    public AbstractExtManagerEntity setManagerName(String managerName) {
        set("managerName", managerName);
        return this;
    }

    public String getManagerPassword() {
        return getString("managerPassword");
    }

    public AbstractExtManagerEntity setManagerPassword(String managerPassword) {
        set("managerPassword", managerPassword);
        return this;
    }

    public String getManagerMenuPower() {
        return getString("managerMenuPower");
    }

    public AbstractExtManagerEntity setManagerMenuPower(String managerMenuPower) {
        set("managerMenuPower", managerMenuPower);
        return this;
    }

    public String getManagerExtPower() {
        return getString("managerExtPower");
    }

    public AbstractExtManagerEntity setManagerExtPower(String managerExtPower) {
        set("managerExtPower", managerExtPower);
        return this;
    }

    public String getManagerNoticeTitle() {
        return getString("managerNoticeTitle");
    }

    public AbstractExtManagerEntity setManagerNoticeTitle(String managerNoticeTitle) {
        set("managerNoticeTitle", managerNoticeTitle);
        return this;
    }

    public int getRoleId() {
        return getInt("roleId");
    }

    public AbstractExtManagerEntity setRoleId(int roleId) {
        set("roleId", roleId);
        return this;
    }

    public ManagerStateEnum getManagerState() {
        return getEnum("managerState", ManagerStateEnum.class);
    }

    public AbstractExtManagerEntity setManagerState(ManagerStateEnum managerState) {
        set("managerState", managerState.ordinal());
        return this;
    }

    public Date getManagerDateTime() {
        return getDate("managerDateTime");
    }

    public AbstractExtManagerEntity setManagerDateTime(Date managerDateTime) {
        set("managerDateTime", managerDateTime);
        return this;
    }
}