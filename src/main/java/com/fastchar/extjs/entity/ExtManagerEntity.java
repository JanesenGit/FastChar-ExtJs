package com.fastchar.extjs.entity;

import com.fastchar.core.FastChar;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.utils.FastDateUtils;

public class ExtManagerEntity extends FastExtEntity<ExtManagerEntity> {

    public static ExtManagerEntity getInstance() {
        return FastChar.getOverrides().singleInstance(ExtManagerEntity.class);
    }

    @Override
    public String getTableName() {
        return "ext_manager";
    }

    @Override
    public String getEntityCode() {
        return this.getClass().getSimpleName();
    }

    @Override
    public FastPage<ExtManagerEntity> showLayerList(ExtManagerEntity managerEntity, int page, int pageSize) {
        if (managerEntity.getManagerRole().getRoleType() != ExtManagerRoleEntity.RoleTypeEnum.系统角色) {
            put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue(1));
        }
        return showList(page, pageSize);
    }

    @Override
    public FastPage<ExtManagerEntity> showList(int page, int pageSize) {
        String sqlStr = "select t.*,a.roleName as a__roleName,a.roleMenuPower,a.roleExtPower,a.roleType from ext_manager as t " +
                " left join ext_manager_role as a on a.roleId=t.roleId";
        FastSqlInfo sqlInfo = toSelectSql(sqlStr);
        FastPage<ExtManagerEntity> select = selectBySql(page, pageSize, sqlInfo.getSql(), sqlInfo.toParams());
        for (ExtManagerEntity extManagerEntity : select.getList()) {
            if (extManagerEntity.isEmpty("managerMenuPower")) {
                extManagerEntity.set("managerMenuPower", extManagerEntity.get("roleMenuPower"));
            }
            if (extManagerEntity.isEmpty("managerExtPower")) {
                extManagerEntity.set("managerExtPower", extManagerEntity.get("roleExtPower"));
            }
        }
        return select;
    }

    @Override
    public void setDefaultValue() {
        set("roleId", 0);
        set("managerState", 0);
        set("managerDateTime", FastDateUtils.getDateString());
    }

    public enum ManagerStateEnum {
        正常,
        禁用
    }


    public ExtManagerEntity login(String loginName, String loginPassword) {
        String sqlStr = "select * from ext_manager as t " +
                " left join ext_manager_role as a on a.roleId=t.roleId " +
                " where managerLoginName = ? and managerPassword = ? ";
        ExtManagerEntity extManagerEntity = selectFirstBySql(sqlStr, loginName, loginPassword);
        if (extManagerEntity != null) {
            if (extManagerEntity.isEmpty("managerMenuPower")) {
                extManagerEntity.set("managerMenuPower", extManagerEntity.get("roleMenuPower"));
            }
            if (extManagerEntity.isEmpty("managerExtPower")) {
                extManagerEntity.set("managerExtPower", extManagerEntity.get("roleExtPower"));
            }

            ExtManagerRoleEntity extManagerRoleEntity = extManagerEntity.toEntity(ExtManagerRoleEntity.class);
            extManagerEntity.put("role", extManagerRoleEntity);
        }
        return extManagerEntity;
    }


    public ExtManagerRoleEntity getManagerRole() {
        return (ExtManagerRoleEntity) get("role");
    }

}
