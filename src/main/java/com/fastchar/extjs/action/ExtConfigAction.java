package com.fastchar.extjs.action;

import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.annotation.AFastSecurityResponse;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtManagerRoleEntity;
import com.fastchar.extjs.entity.ExtSystemConfigEntity;
import com.fastchar.utils.FastStringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExtConfigAction extends FastAction {
    /**
     * 获得路由地址
     * Get routing address
     */
    @Override
    protected String getRoute() {
        return "/ext/config";
    }

    public ExtConfigAction() {
        setLog(false);
    }


    private String getProjectName() {
        String projectName = FastChar.getConstant().getProjectName();
        if (FastStringUtils.isEmpty(projectName)) {
            projectName = getProjectHost();
        }
        return projectName;
    }

    /**
     * 保存ExtJs配置
     * 参数：
     * configKey 配置的key
     * configType 配置类型
     * configValue 配置的值
     */
    public synchronized void saveExtConfig() {
        ExtManagerEntity managerEntity = ExtManagerEntity.getSession(this);
        if (managerEntity == null) {
            responseJson(-1, "操作失败！");
            return;
        }
        String configKey = getParam("configKey", true);
        String configType = getParam("configType", true);
        String configValue = getParam("configValue", true);


        ExtSystemConfigEntity extConfigEntity = new ExtSystemConfigEntity();
        extConfigEntity.set("managerId", managerEntity.getId());
        extConfigEntity.set("projectName", getProjectName());
        extConfigEntity.set("configKey", configKey);
        extConfigEntity.set("configType", configType);
        extConfigEntity.set("configValue", configValue);
        extConfigEntity.set("menuId", getParam("menuId"));
        extConfigEntity.set("entityCode", getParam("entityCode"));
        extConfigEntity.put("log", false);
        if (extConfigEntity.save()) {
            boolean noneManager = getParamToBoolean("noneManager");
            if (noneManager && managerEntity.getManagerRole().getRoleType() == ExtManagerRoleEntity.RoleTypeEnum.超级角色) {
                //超级角色模式下，保存公共的列信息
                ExtSystemConfigEntity pubConfigEntity = new ExtSystemConfigEntity();
                pubConfigEntity.putAll(extConfigEntity);
                pubConfigEntity.setManagerId(-1);
                pubConfigEntity.remove("configId");
                pubConfigEntity.save();
            }

            responseJson(0, "保存成功！");
        } else {
            responseJson(-1, "保存失败！");
        }
    }


    /**
     * 获取ExtJs配置
     * 参数：
     * configKey 配置的key
     * configType 配置的类型
     */
    @AFastSecurityResponse
    public void showExtConfig() {

        ExtManagerEntity managerEntity =  ExtManagerEntity.getSession(this);
        if (managerEntity == null) {
            responseJson(-1, "获取失败！");
            return;
        }
        String configKey = getParam("configKey", true);
        String configType = getParam("configType", true);

        ExtSystemConfigEntity extConfig = ExtSystemConfigEntity.getInstance().set("log", false)
                .getExtConfig(managerEntity.getId(), getProjectName(),configKey, configType);
        if (extConfig != null) {
            responseJson(0, "获取成功！", extConfig);
        }else{
            responseJson(-1, "获取失败！配置不存在！");
        }
    }


    /**
     * 删除ExtJs配置
     * 参数：
     * configKey 配置的Key
     * configType 配置的类型
     */
    public void deleteExtConfig() {
        ExtManagerEntity managerEntity =  ExtManagerEntity.getSession(this);
        if (managerEntity == null) {
            responseJson(-1, "操作失败！");
            return;
        }
        String configKey = getParam("configKey", true);
        String configType = getParam("configType", true);
        ExtSystemConfigEntity.getInstance().set("log", false).deleteConfig(managerEntity.getId(), getProjectName(), configKey, configType);
        responseJson(0, "删除成功！");
    }


    /**
     * 获得实体对应grid列
     * 参数：
     * entityCode 实体编号
     */
    @AFastSecurityResponse
    public void showEntityColumn() {
        ExtManagerEntity managerEntity =  ExtManagerEntity.getSession(this);
        if (managerEntity == null) {
            responseJson(-1, "操作失败！");
            return;
        }
        String entityCode = getParam("entityCode", true);
        boolean noneManager = getParamToBoolean("noneManager");
        int managerId = managerEntity.getId();
        if (noneManager) {
            managerId = -1;
        }
        ExtSystemConfigEntity extConfig = ExtSystemConfigEntity.getInstance().set("log", false)
                .getExtEntityColumnConfig(managerId, entityCode);
        if (extConfig != null) {
            responseJson(0, "获取成功！", extConfig);
        }else{
            responseJson(-1, "获取列信息失败！您或没有此权限！");
        }
    }


    /**
     * 保存系统配置
     * 参数：
     * configKey 配置的key
     * configValue 配置的值
     */
    public synchronized void saveSystemConfig() throws Exception {
        Map<String, Object> paramToMap = getParamToMap();
        for (Map.Entry<String, Object> stringObjectEntry : paramToMap.entrySet()) {
            ExtSystemConfigEntity extConfigEntity = new ExtSystemConfigEntity();
            extConfigEntity.set("managerId", -1);
            extConfigEntity.set("configKey", stringObjectEntry.getKey());
            extConfigEntity.set("projectName", getProjectName());
            extConfigEntity.set("configType", "System");
            extConfigEntity.set("configValue", stringObjectEntry.getValue());
            extConfigEntity.put("log", false);
            extConfigEntity.save();
        }
        responseJson(0, "保存成功！");
    }


    /**
     * 获得系统配置
     * 参数：
     * 无
     */
    @AFastSecurityResponse
    public void showSystemConfig() {
        Map<String, Object> data = new HashMap<>(16);
        List<ExtSystemConfigEntity> system = ExtSystemConfigEntity.getInstance().getExtConfigs(-1, "System");
        for (ExtSystemConfigEntity extSystemConfigEntity : system) {
            data.put(extSystemConfigEntity.getConfigKey(), extSystemConfigEntity.getConfigValue());
        }
        responseJson(0, "获取成功！", data);
    }


    /**
     * 删除系统配置
     */
    public void deleteSystemConfig() throws Exception {
        ExtSystemConfigEntity.getInstance().deleteConfig(-1, "System");
        FastChar.getObservable().notifyObservers("refreshHeads");
        responseJson(0, "删除成功！");
    }
}
