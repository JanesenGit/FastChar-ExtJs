package com.fastchar.extjs.entity;

import com.fastchar.core.FastChar;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.extjs.core.FastExtLayerType;
import com.fastchar.servlet.http.FastHttpServletRequest;
import com.fastchar.utils.FastDateUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ExtSystemLogEntity extends FastExtEntity<ExtSystemLogEntity> {

    public static ExtSystemLogEntity getInstance() {
        return FastChar.getOverrides().singleInstance(ExtSystemLogEntity.class);
    }

    @Override
    public String getTableName() {
        return "ext_system_log";
    }

    @Override
    public String getEntityCode() {
        return this.getClass().getSimpleName();
    }

    @Override
    public FastPage<ExtSystemLogEntity> showList(int page, int pageSize) {
        String sqlStr = "select t.*,a.managerName as a__managerName from ext_system_log as t " +
                " left join ext_manager as a on a.managerId=t.managerId" +
                " where 1=1 ";

        if (isNotEmpty("^search")) {
            String search = getString("^search");
            remove("^search");

            sqlStr += " and (systemLogContent like '%" + search + "%'" +
                    " or systemSendData like '%" + search + "%'" +
                    " or systemResultData like '%" + search + "%' ) ";
        }

        sqlStr += " order by t.systemLogDateTime desc ";
        FastSqlInfo sqlInfo = toSelectSql(sqlStr);
        return selectBySql(page, pageSize, sqlInfo.getSql(), sqlInfo.toParams());
    }

    @Override
    public void setDefaultValue() {
        set("managerId", 0);
        set("systemLogDateTime", FastDateUtils.getDateString());
    }

    @Override
    public void pullLayer(ExtManagerEntity managerEntity) {
        //管理员操作日志必须按照权限筛选
        if (managerEntity.getManagerRole().getRoleType() != ExtManagerRoleEntity.RoleTypeEnum.超级角色) {
            if (FastChar.getConfig(FastExtConfig.class).getLayerType() == FastExtLayerType.Layer_Role) {
                put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue(1));
            }else {
                put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue());
            }
        }
    }
    
    public List<String> getKeys(String content) {
        List<String> keys = new ArrayList<>();
        String regStr = "\\$\\{([^${}]*)}";
        Pattern compile = Pattern.compile(regStr);
        Matcher matcher = compile.matcher(content);
        while (matcher.find()) {
            keys.add(matcher.group(1));
        }
        return keys;
    }

    public String replaceHolder(String content, FastHttpServletRequest request) {
        List<String> keys = getKeys(content);
        for (String key : keys) {
            String value = "";
            if (request.getAttribute(key) != null) {
                value = String.valueOf(request.getAttribute(key));
            }
            String keyModule = "\\$\\{" + key + "}";
            content = content.replaceAll(keyModule, value);
        }
        return content;
    }

}
