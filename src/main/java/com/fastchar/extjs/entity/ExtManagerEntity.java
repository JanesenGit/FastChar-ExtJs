package com.fastchar.extjs.entity;

import com.fastchar.core.FastChar;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.utils.FastDateUtils;

public class ExtManagerEntity extends FastExtEntity<ExtManagerEntity> {
    private static final long serialVersionUID = 1L;
    public static ExtManagerEntity getInstance() {
        return FastChar.getOverrides().singleInstance(ExtManagerEntity.class);
    }

    public static ExtManagerEntity dao() {
        return FastChar.getOverrides().singleInstance(ExtManagerEntity.class);
    }

    public static ExtManagerEntity newInstance() {
        return FastChar.getOverrides().newInstance(ExtManagerEntity.class);
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
        String sqlStr = "select t.*," +
                "a.roleName as a__roleName," +
                "a.roleMenuPower," +
                "a.roleExtPower," +
                "a.roleType" +
                " from ext_manager as t " +
                " left join ext_manager_role as a on a.roleId=t.roleId";
        FastSqlInfo sqlInfo = toSelectSql(sqlStr);
        return selectBySql(page, pageSize, sqlInfo.getSql(), sqlInfo.toParams());
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

    @Override
    public boolean save() {
        remove("managerId");
        int roleId = getInt("roleId");
        ExtManagerRoleEntity extManagerRoleEntity = ExtManagerRoleEntity.getInstance().selectById(roleId);
        if (extManagerRoleEntity != null) {
            set("managerMenuPower", extManagerRoleEntity.getRoleMenuPower());
            set("managerExtPower", extManagerRoleEntity.getRoleExtPower());
        }
        String managerLoginName = getString("managerLoginName");
        if (getByLoginName(managerLoginName) != null) {
            setError("登录名已存在！请您更换！");
            return false;
        }
        return super.save();
    }

    @Override
    public boolean update() {
        if (isNotEmpty("managerLoginName")) {
            String managerLoginName = getString("managerLoginName");
            if (getByLoginName(managerLoginName) != null) {
                setError("登录名已存在！请您更换！");
                return false;
            }
        }
        return super.update();
    }

    @Override
    public boolean delete() {
        if (getId() == 1) {
            setError("禁止删除系统默认的管理员账号！");
            return false;
        }
        return super.delete();
    }

    public ExtManagerEntity getById(int managerId) {
        String sqlStr = "select * from ext_manager as t " +
                " left join ext_manager_role as a on a.roleId=t.roleId " +
                " where managerId = ? ";
        ExtManagerEntity extManagerEntity = selectFirstBySql(sqlStr, managerId);
        if (extManagerEntity != null) {
            ExtManagerRoleEntity extManagerRoleEntity = extManagerEntity.toEntity(ExtManagerRoleEntity.class);
            extManagerEntity.put("role", extManagerRoleEntity);
        }
        return extManagerEntity;
    }

    public ExtManagerEntity getByLoginName(String loginName) {
        String sqlStr = "select * from ext_manager as t " +
                " where managerLoginName = ? ";
        return selectFirstBySql(sqlStr, loginName);
    }

    public ExtManagerEntity login(String loginName, String loginPassword) {
        String sqlStr = "select * from ext_manager as t " +
                " left join ext_manager_role as a on a.roleId=t.roleId " +
                " where managerLoginName = ? and managerPassword = ? ";
        ExtManagerEntity extManagerEntity = selectFirstBySql(sqlStr, loginName, loginPassword);
        if (extManagerEntity != null) {
            ExtManagerRoleEntity extManagerRoleEntity = extManagerEntity.toEntity(ExtManagerRoleEntity.class);
            extManagerEntity.put("role", extManagerRoleEntity);
        }
        return extManagerEntity;
    }


    public ExtManagerRoleEntity getManagerRole() {
        return (ExtManagerRoleEntity) get("role");
    }


    public ExtManagerEntity getManagerByNoticeTitle(String noticeTitle) {
        String sqlStr = "select * from ext_manager where managerNoticeTitle like '%" + noticeTitle + "%' ";
        ExtManagerEntity result=selectFirstBySql(sqlStr);
        if (result == null) {
            return selectById(1);
        }
        return result;
    }


}
