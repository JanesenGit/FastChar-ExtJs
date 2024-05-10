package com.fastchar.extjs.entity;

import com.fastchar.core.FastChar;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.extjs.entity.abstracts.AbstractExtManagerRoleEntity;
import com.fastchar.utils.FastDateUtils;

import java.util.List;

public class ExtManagerRoleEntity extends AbstractExtManagerRoleEntity {
    private static final long serialVersionUID = 1L;

    public static ExtManagerRoleEntity getInstance() {
        return FastChar.getOverrides().singleInstance(ExtManagerRoleEntity.class);
    }

    public static ExtManagerRoleEntity dao() {
        return FastChar.getOverrides().singleInstance(ExtManagerRoleEntity.class);
    }

    public static ExtManagerRoleEntity newInstance() {
        return FastChar.getOverrides().newInstance(ExtManagerRoleEntity.class);
    }


    @Override
    public String getTableName() {
        return "ext_manager_role";
    }

    @Override
    public String getEntityCode() {
        return this.getClass().getSimpleName();
    }


    @Override
    public FastPage<ExtManagerRoleEntity> showList(int page, int pageSize) {
        String sqlStr = "select t.*,child.childCount," +
                " a.roleName as a__roleName," +
                " a.roleMenuPower as a__roleMenuPower," +
                " a.roleExtPower as a__roleExtPower " +
                " from ext_manager_role as t " +
                " left join ext_manager_role as a on a.roleId=t.parentRoleId " +
                " left join (select count(1) as childCount,parentRoleId from ext_manager_role group by parentRoleId) as child on child.parentRoleId=t.roleId ";

        FastSqlInfo sqlInfo = toSelectSql(sqlStr);
        FastPage<ExtManagerRoleEntity> select = selectBySql(page, pageSize, sqlInfo.getSql(), sqlInfo.toParams());
        boolean isSearch = getBoolean("^treeSearch");
        for (ExtManagerRoleEntity extManagerRoleEntity : select.getList()) {
            extManagerRoleEntity.put("leaf", extManagerRoleEntity.getInt("childCount") == 0);
            if (isSearch) {
                extManagerRoleEntity.put("leaf", true);
            }
        }
        return select;
    }

    @Override
    public void pullLayer(ExtManagerEntity managerEntity) {
        if (managerEntity.getManagerRole().getRoleType() != ExtManagerRoleEntity.RoleTypeEnum.超级角色) {
            put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue(1));
        }
    }

    @Override
    public void setDefaultValue() {
        set("roleState", 0);
        set("parentRoleId", 0);
        set("roleMenuPower", "NONE");
        set("roleExtPower", "NONE");
        set("roleDateTime", FastDateUtils.getDateString());
    }

    @Override
    public void convertValue() {
        super.convertValue();

        Enum<?> roleState = getEnum("roleState", RoleStateEnum.class);
        if (roleState != null) {
            put("roleStateStr", roleState.name());
        }

        Enum<?> roleType = getEnum("roleType", RoleTypeEnum.class);
        if (roleType != null) {
            put("roleTypeStr", roleType.name());
        }
    }

    @Override
    public boolean save(String...checks) {
        ExtManagerRoleEntity parentRole = selectById(getParentRoleId());
        if (parentRole != null) {
            set("roleMenuPower", parentRole.getRoleMenuPower());
            set("roleExtPower", parentRole.getRoleExtPower());
        }
        if (checkName(getParentRoleId(), getRoleName())) {
            setError("同级别下的角色名称不能重复！");
            return false;
        }
        return super.save(checks);
    }

    @Override
    public boolean delete(String...checks) {
        if (getRoleId() == 1) {
            setError("禁止删除系统默认的【超级系统管理员】角色！");
            return false;
        }

        return super.delete(checks);
    }


    @Override
    public boolean update(String...checks) {
        if (isNotEmpty("roleName")) {
            ExtManagerRoleEntity managerRoleEntity = selectById(getId());
            if (checkName(managerRoleEntity.getParentRoleId(), getRoleName())) {
                setError("同级别下的角色名称不得重复！");
                return false;
            }
        }
        boolean modifyPower = isModified("roleMenuPower") || isModified("roleExtPower");
        boolean update = super.update(checks);
        if (update && modifyPower) {
            syncManagerPower(getRoleId());
        }
        return update;
    }

    public enum RoleStateEnum {
        正常,
        禁用
    }

    public enum RoleTypeEnum {
        超级角色,
        普通角色
    }

    private boolean checkName(int parentId, String roleName) {
        String sqlStr = "select count(1) as c from ext_manager_role where parentRoleId = ? and roleName = ? ";
        ExtManagerRoleEntity result = selectFirstBySql(sqlStr, parentId, roleName);
        if (result != null) {
            return result.getInt("c") > 0;
        }
        return false;
    }


    public void syncManagerPower(int roleId) {
        ExtManagerRoleEntity roleEntity = selectById(roleId);
        if (roleEntity == null) {
            return;
        }
        List<ExtManagerEntity> listByRole = ExtManagerEntity.dao().getListByRole(roleId);
        for (ExtManagerEntity managerEntity : listByRole) {
            if (managerEntity.getInt("powerState") == 1) {
                //标记当前管理员已独立配置了权限                
                continue;
            }
            managerEntity.set("managerMenuPower", roleEntity.getRoleMenuPower());
            managerEntity.set("managerExtPower", roleEntity.getRoleExtPower());
            managerEntity.set("powerState", 0);
            managerEntity.update();
        }

    }
}
