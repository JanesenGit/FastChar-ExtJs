package com.fastchar.extjs.action;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.heads.FastHeadExtInfo;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtSystemConfigEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExtConfigAction extends FastAction {
    /**
     * 获得路由地址
     * Get routing address
     * @return
     */
    @Override
    protected String getRoute() {
        return "/ext/config";
    }

    public ExtConfigAction() {
        setLog(false);
    }

    public void saveExtConfig() {
        ExtManagerEntity managerEntity = getSession("manager");
        if (managerEntity == null) {
            responseJson(-1, "操作失败！");
            return;
        }
        String configKey = getParam("configKey", true);
        String configType = getParam("configType", true);
        String configValue = getParam("configValue", true);


        ExtSystemConfigEntity extConfigEntity = new ExtSystemConfigEntity();
        extConfigEntity.set("managerId", managerEntity.getId());
        extConfigEntity.set("configKey", configKey);
        extConfigEntity.set("configType", configType);
        extConfigEntity.set("configValue", configValue);
        extConfigEntity.set("menuId", getParam("menuId"));
        extConfigEntity.set("entityCode", getParam("entityCode"));
        extConfigEntity.put("log", false);
        if (extConfigEntity.save()) {
            responseJson(0, "保存成功！");
        } else {
            responseJson(-1, "保存失败！");
        }
    }


    /**
     * 获得ext配置
     */
    public void showExtConfig() {
        ExtManagerEntity managerEntity = getSession("manager");
        if (managerEntity == null) {
            responseJson(-1, "获取失败！");
            return;
        }
        String configKey = getParam("configKey", true);
        String configType = getParam("configType", true);

        ExtSystemConfigEntity extConfig = ExtSystemConfigEntity.getInstance().set("log", false).getExtConfig(managerEntity.getId(), configKey, configType);
        if (extConfig != null) {
            responseJson(0, "获取成功！", extConfig);
        }else{
            responseJson(-1, "获取失败！配置不存在！");
        }
    }


    /**
     * 删除配置
     */
    public void deleteExtConfig() {
        ExtManagerEntity managerEntity = getSession("manager");
        if (managerEntity == null) {
            responseJson(-1, "操作失败！");
            return;
        }
        String configKey = getParam("configKey", true);
        String configType = getParam("configType", true);
        ExtSystemConfigEntity.getInstance().set("log", false).deleteConfig(managerEntity.getId(), configKey, configType);
        responseJson(0, "删除成功！");
    }


    /**
     * 获得实体对应grid列
     */
    public void showEntityColumn() {
        ExtManagerEntity managerEntity = getSession("manager");
        if (managerEntity == null) {
            responseJson(-1, "操作失败！");
            return;
        }
        String entityCode = getParam("entityCode", true);
        ExtSystemConfigEntity extConfig = ExtSystemConfigEntity.getInstance().set("log", false).getExtEntityColumnConfig(managerEntity.getId(), entityCode);
        if (extConfig != null) {
            responseJson(0, "获取成功！", extConfig);
        }else{
            responseJson(-1, "获取列信息失败！您或没有此权限！");
        }
    }


    /**
     * 保存系统配置
     */
    public void saveSystemConfig() throws Exception {
        Map<String, Object> paramToMap = getParamToMap();
        for (String s : paramToMap.keySet()) {
            ExtSystemConfigEntity extConfigEntity = new ExtSystemConfigEntity();
            extConfigEntity.set("managerId", -1);
            extConfigEntity.set("configKey", s);
            extConfigEntity.set("configType", "System");
            extConfigEntity.set("configValue", paramToMap.get(s));
            extConfigEntity.put("log", false);
            extConfigEntity.save();
        }
        responseJson(0, "保存成功！");
    }


    /**
     * 获得系统配置
     */
    public void showSystemConfig() {
        Map<String, Object> data = new HashMap<>();

        List<FastHeadExtInfo> extInfo = FastExtConfig.getInstance().getExtInfo();
        for (FastHeadExtInfo fastHeadExtInfo : extInfo) {
            data.put(fastHeadExtInfo.getName(), fastHeadExtInfo.getValue());
        }
        List<ExtSystemConfigEntity> system = ExtSystemConfigEntity.getInstance().getExtConfigs(-1, "System");
        for (ExtSystemConfigEntity extSystemConfigEntity : system) {
            data.put(extSystemConfigEntity.getConfigKey(), extSystemConfigEntity.getConfigValue());
        }
        responseJson(0, "获取成功！", data);
    }


    public void deleteSystemConfig() throws Exception {
        ExtSystemConfigEntity.getInstance().deleteConfig(-1, "System");
        FastChar.getObservable().notifyObservers("refreshHeads");
        responseJson(0, "删除成功！");
    }
}
