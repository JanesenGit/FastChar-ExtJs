package com.fastchar.extjs.entity;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.FastExtLayerType;
import com.fastchar.extjs.entity.abstracts.AbstractExtManagerEntity;
import com.fastchar.utils.FastDateUtils;
import com.fastchar.utils.FastNumberUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.List;

public class ExtManagerEntity extends AbstractExtManagerEntity {
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


    public static ExtManagerEntity getSession(FastAction action) {
        if (action == null) {
            return null;
        }
        ExtManagerEntity manager = action.getSession("manager");
        if (manager == null) {
            FastExtConfig config = FastChar.getConfig(FastExtConfig.class);
            String passLoginManger = config.getPassLoginManger(action.getRemoteIp());
            if (FastStringUtils.isNotEmpty(passLoginManger)) {
                if (passLoginManger.startsWith("ID:")) {
                    manager = ExtManagerEntity.dao().getDetails(FastNumberUtils.formatToInt(passLoginManger.replace("ID:", "")));
                } else if (passLoginManger.startsWith("ACCOUNT:")) {
                    String account = passLoginManger.replace("ACCOUNT:", "");
                    String[] accountInfo = account.split("/");
                    manager = ExtManagerEntity.dao().login(accountInfo[0], FastChar.getSecurity().MD5_Encrypt(accountInfo[1]));
                }
            }
            if (manager != null) {
                String message = FastChar.getLocal().getInfo("ExtManager_Error1", action.getRemoteIp(), passLoginManger);
                FastChar.getLog().warn(message);
                manager.put("responsePageMessage", message);
                setSession(action, manager);
            }
        }
        return manager;
    }

    public static void setSession(FastAction action, ExtManagerEntity extManager) {
        if (action == null) {
            return;
        }
        action.setSession("manager", extManager);
    }

    public static void removeSession(FastAction action) {
        if (action == null) {
            return;
        }
        action.removeSession("manager");
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
    public void pullLayer(ExtManagerEntity managerEntity) {
        if (managerEntity.getManagerRole().getRoleType() != ExtManagerRoleEntity.RoleTypeEnum.超级角色) {
            if (FastChar.getConfig(FastExtConfig.class).getLayerType() == FastExtLayerType.Layer_Manager) {
                put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue());
            } else if (FastChar.getConfig(FastExtConfig.class).getLayerType() == FastExtLayerType.Layer_Role) {
                put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue(1));
            }
        }
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
        set("managerState", ManagerStateEnum.正常.ordinal());
        set("onlineType", OnlineTypeEnum.多个终端.ordinal());
        set("initCode", 1);
        set("managerDateTime", FastDateUtils.getDateString());
    }

    @Override
    public void convertValue() {
        super.convertValue();
        Enum<?> managerState = getEnum("managerState", ManagerStateEnum.class);
        if (managerState != null) {
            put("managerStateStr", managerState.name());
        } else {
            put("managerStateStr", ManagerStateEnum.正常.name());
            put("managerState", ManagerStateEnum.正常.ordinal());
        }

        Enum<?> onlineType = getEnum("onlineType", OnlineTypeEnum.class);
        if (onlineType != null) {
            put("onlineTypeStr", onlineType.name());
        } else {
            put("onlineTypeStr", OnlineTypeEnum.多个终端.name());
            put("onlineType", OnlineTypeEnum.多个终端.ordinal());
        }
    }

    @Override
    public ExtManagerEntity set(String attr, Object value, boolean must) {
        if (attr.equals("managerLoginName")) {
            value = FastStringUtils.defaultValue(value, "").replace(" ", "");
        }
        if (attr.equals("managerPassword")) {
            value = FastStringUtils.defaultValue(value, "").replace(" ", "");
        }
        return super.set(attr, value, must);
    }

    /**
     * 获取多个权限编号
     *
     * @return
     */
    public List<String> getLayerValues(FastEntity<?> targetEntity) {
        return null;
    }

    public enum ManagerStateEnum {
        正常,
        禁用
    }

    public enum OnlineTypeEnum {
        多个终端,
        单个终端
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
    public boolean save(String... checks) {
        int roleId = getInt("roleId");
        ExtManagerRoleEntity extManagerRoleEntity = ExtManagerRoleEntity.getInstance().selectById(roleId);
        if (extManagerRoleEntity != null) {
            set("managerMenuPower", extManagerRoleEntity.getRoleMenuPower());
            set("managerExtPower", extManagerRoleEntity.getRoleExtPower());
        }
        return super.save(checks);
    }

    @Override
    public boolean update() {
        if (isModified("managerLoginName")) {
            String managerLoginName = getString("managerLoginName");
            if (getByLoginName(managerLoginName) != null) {
                setError("登录名已存在！请您更换！");
                return false;
            }
        }
        if (!isModified("powerState")) {
            if (isModified("managerMenuPower") || isModified("managerExtPower")) {
                //标记当前管理员已独立配置了权限
                set("powerState", 1);
            }
        }

        if (isModified("roleId")) {
            ExtManagerRoleEntity managerRole = ExtManagerRoleEntity.dao().selectById(getInt("roleId"));
            if (managerRole != null) {
                set("managerMenuPower", managerRole.getRoleMenuPower());
                set("managerExtPower", managerRole.getRoleExtPower());
                set("powerState", 0);
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
        ExtManagerEntity session = getSession(FastChar.getThreadLocalAction());
        if (session != null && session.getId() == getId()) {
            setError("禁止删除当前登录的管理员账号！");
            return false;
        }
        return super.delete();
    }

    public void pullInfo() {

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
        ExtManagerEntity managerEntity = selectFirstBySql(sqlStr, loginName);
        if (managerEntity != null) {
            managerEntity.pullInfo();
        }
        return managerEntity;
    }

    public ExtManagerEntity login(String loginName, String loginPassword) {
        String sqlStr = "select * from ext_manager as t " +
                " left join ext_manager_role as a on a.roleId=t.roleId " +
                " where managerLoginName = ? and managerPassword = ? ";
        ExtManagerEntity extManagerEntity = selectFirstBySql(sqlStr, loginName.trim(), loginPassword);
        if (extManagerEntity != null) {
            ExtManagerRoleEntity extManagerRoleEntity = extManagerEntity.toEntity(ExtManagerRoleEntity.class);
            extManagerEntity.put("role", extManagerRoleEntity);
            extManagerEntity.pullInfo();
        }
        return extManagerEntity;
    }

    public ExtManagerEntity getDetails(int managerId) {
        String sqlStr = "select * from ext_manager as t " +
                " left join ext_manager_role as a on a.roleId=t.roleId " +
                " where managerId = ? ";
        ExtManagerEntity extManagerEntity = selectFirstBySql(sqlStr, managerId);
        if (extManagerEntity != null) {
            ExtManagerRoleEntity extManagerRoleEntity = extManagerEntity.toEntity(ExtManagerRoleEntity.class);
            extManagerEntity.put("role", extManagerRoleEntity);
            extManagerEntity.pullInfo();
        }
        return extManagerEntity;
    }


    public ExtManagerRoleEntity getManagerRole() {
        return (ExtManagerRoleEntity) get("role");
    }


    public List<ExtManagerEntity> getManagerByNoticeTitle(String noticeTitle, String menuId) {
        String sqlStr = "select * from ext_manager" +
                " where managerNoticeTitle like '%" + noticeTitle + "%' ";
        if (FastStringUtils.isNotEmpty(menuId)) {
            sqlStr += " or managerMenuPower like '%" + menuId + "%' ";
        }

        List<ExtManagerEntity> list = selectBySql(sqlStr);
        if (list.size() == 0) {
            list.add(selectById(1));
        }
        return list;
    }


    public List<ExtManagerEntity> getListByRole(int roleId) {
        String sqlStr = "select * from  ext_manager  where roleId = ? ";

        return selectBySql(sqlStr, roleId);
    }


}
