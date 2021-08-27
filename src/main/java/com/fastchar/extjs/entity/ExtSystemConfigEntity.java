package com.fastchar.extjs.entity;
import com.fastchar.core.FastChar;
import com.fastchar.extjs.entity.abstracts.AbstractExtSystemConfigEntity;
import com.fastchar.interfaces.IFastJson;
import com.fastchar.utils.FastDateUtils;
import com.google.gson.reflect.TypeToken;

import java.util.List;
import java.util.Map;

public class ExtSystemConfigEntity extends AbstractExtSystemConfigEntity {
    public static ExtSystemConfigEntity getInstance() {
        return FastChar.getOverrides().singleInstance(ExtSystemConfigEntity.class);
    }


    @Override
    public String getTableName() {
        return "ext_system_config";
    }

    @Override
    public boolean save() {
        String configKey = getString("configKey");
        String configType = getString("configType");
        int managerId = getInt("managerId");
        deleteConfig(managerId, configKey, configType);
        return super.save();
    }

    @Override
    public void setDefaultValue() {
        super.setDefaultValue();
        set("configDateTime", FastDateUtils.getDateString());
    }

    public int deleteConfig(int managerId, String configKey, String configType) {
        String sqlStr = "delete from ext_system_config where configKey = ? and managerId = ? and configType = ?";
        return updateBySql(sqlStr, configKey, managerId, configType);
    }

    public int deleteConfig(int managerId, String configType) {
        String sqlStr = "delete from ext_system_config where managerId = ? and configType = ?";
        return updateBySql(sqlStr, managerId, configType);
    }


    public ExtSystemConfigEntity getExtConfig(int managerId, String configKey, String configType) {
        String sqlStr = "select * from ext_system_config where configKey = ? and managerId = ? and configType = ? ";
        return selectFirstBySql(sqlStr, configKey, managerId, configType);
    }

    public ExtSystemConfigEntity getExtConfig(int managerId, String menuId) {
        String sqlStr = "select * from ext_system_config where menuId = ? and managerId = ? and configType = ? ";
        return selectFirstBySql(sqlStr, menuId, managerId, "GridColumn");
    }

    public ExtSystemConfigEntity getExtEntityColumnConfig(int managerId, String entityCode) {
        String sqlStr = "select * from ext_system_config where entityCode = ? and managerId = ? and configType = ? " +
                " order by configDateTime desc ";
        return selectFirstBySql(sqlStr, entityCode, managerId, "GridColumn");
    }

    public Map<String, Map<String, Object>> toColumns() {
        if (getString("configType").equalsIgnoreCase("GridColumn")) {
            IFastJson iFastJsonProvider = FastChar.getOverrides().newInstance(IFastJson.class);
            String configValue = getString("configValue");
            return iFastJsonProvider.fromJson(configValue, new TypeToken<Map<String, Map<String, Object>>>() {
            }.getType());
        }
        return null;
    }

    public List<ExtSystemConfigEntity> getExtConfigs(int managerId, String configType) {
        String sqlStr = "select * from ext_system_config where  managerId = ? and configType = ? ";
        return selectBySql(sqlStr, managerId, configType);
    }

    public List<ExtSystemConfigEntity> getList() {
        String sqlStr = "select * from ext_system_config  ";
        return selectBySql(sqlStr);
    }


    public int deleteAll() {
        String sqlStr = "delete from ext_system_config ";
        return updateBySql(sqlStr);
    }

}
