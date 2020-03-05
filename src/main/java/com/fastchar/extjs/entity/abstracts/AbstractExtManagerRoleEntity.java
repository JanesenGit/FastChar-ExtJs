package com.fastchar.extjs.entity.abstracts;

import com.fastchar.extjs.entity.ExtManagerRoleEntity;
import com.fastchar.extjs.core.FastExtEntity;

import java.util.Date;

public abstract class AbstractExtManagerRoleEntity extends FastExtEntity<ExtManagerRoleEntity> {
    private static final long serialVersionUID = 3487536615918615L;

    public String getRoleLayerCode() {
        return getString("roleLayerCode");
    }

    public void setRoleLayerCode(String roleLayerCode) {
        set("roleLayerCode", roleLayerCode);
    }

    public int getRoleId() {
        return getInt("roleId");
    }

    public void setRoleId(int roleId) {
        set("roleId", roleId);
    }

    public String getRoleName() {
        return getString("roleName");
    }

    public void setRoleName(String roleName) {
        set("roleName", roleName);
    }

    public String getRoleMenuPower() {
        return getString("roleMenuPower");
    }

    public void setRoleMenuPower(String roleMenuPower) {
        set("roleMenuPower", roleMenuPower);
    }

    public String getRoleExtPower() {
        return getString("roleExtPower");
    }

    public void setRoleExtPower(String roleExtPower) {
        set("roleExtPower", roleExtPower);
    }

    public ExtManagerRoleEntity.RoleStateEnum getRoleState() {
        return getEnum("roleState", ExtManagerRoleEntity.RoleStateEnum.class);
    }

    public void setRoleState(ExtManagerRoleEntity.RoleStateEnum roleState) {
        set("roleState", roleState.ordinal());
    }

    public ExtManagerRoleEntity.RoleTypeEnum getRoleType() {
        return getEnum("roleType", ExtManagerRoleEntity.RoleTypeEnum.class);
    }

    public void setRoleType(ExtManagerRoleEntity.RoleTypeEnum roleType) {
        set("roleType", roleType.ordinal());
    }

    public int getParentRoleId() {
        return getInt("parentRoleId");
    }

    public void setParentRoleId(int parentRoleId) {
        set("parentRoleId", parentRoleId);
    }

    public Date getRoleDateTime() {
        return getDate("roleDateTime");
    }

    public void setRoleDateTime(Date roleDateTime) {
        set("roleDateTime", roleDateTime);
    }
}