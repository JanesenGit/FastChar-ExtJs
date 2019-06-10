package com.fastchar.extjs.entity;

import com.fastchar.core.FastChar;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.extjs.entity.abstracts.AbstractExtManagerRoleEntity;
import com.fastchar.utils.FastDateUtils;

public class ExtManagerRoleEntity extends AbstractExtManagerRoleEntity {
    public static ExtManagerRoleEntity getInstance() {
        return FastChar.getOverrides().singleInstance(ExtManagerRoleEntity.class);
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
    public FastPage<ExtManagerRoleEntity> showLayerList(ExtManagerEntity managerEntity, int page, int pageSize) {
        return showList(page, pageSize);
    }

    @Override
    public FastPage<ExtManagerRoleEntity> showList(int page, int pageSize) {
        String sqlStr = "select t.*,child.childCount,a.roleName as a__roleName from ext_manager_role as t " +
                " left join ext_manager_role as a on a.roleId=t.parentRoleId " +
                " left join (select count(1) as childCount,parentRoleId from ext_manager_role group by parentRoleId) as child on child.parentRoleId=t.roleId ";
        FastSqlInfo sqlInfo = toSelectSql(sqlStr);
        FastPage<ExtManagerRoleEntity> select = selectBySql(page, pageSize, sqlInfo.getSql(), sqlInfo.toParams());
        for (ExtManagerRoleEntity extManagerRoleEntity : select.getList()) {
            extManagerRoleEntity.put("leaf", extManagerRoleEntity.getInt("childCount") == 0);
        }
        return select;
    }

    @Override
    public void setDefaultValue() {
        set("roleState", 0);
        set("parentRoleId", 0);
        set("roleMenuPower", "NONE");
        set("roleExtPower", "NONE");
        set("roleDateTime", FastDateUtils.getDateString());
    }

    public enum RoleStateEnum {
        正常,
        禁用
    }

    public enum RoleTypeEnum{
        系统角色,
        普通角色
    }
}
