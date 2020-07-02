package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastDatabaseInfo;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastExtData;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtManagerRoleEntity;
import com.fastchar.utils.FastMD5Utils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.List;

public abstract class FastExtEntity<E extends FastEntity<?>> extends FastEntity<E> {

    private static final long serialVersionUID = 3922925004072340430L;

    private boolean autoUpdateLayerValue = true;

    /**
     * 获得关联的表格名称
     */
    public abstract String getTableName();


    /**
     * 获得数据列表
     */
    public abstract FastPage<E> showList(int page, int pageSize);


    /**
     * 填充权限检测的条件
     *
     * @param managerEntity 管理员对象
     */
    public void pullLayer(ExtManagerEntity managerEntity) {
        if (getLayerColumn() != null && FastChar.getConfig(FastExtConfig.class).getLayerType() != FastLayerType.None) {
            if (managerEntity.getManagerRole().getRoleType() != ExtManagerRoleEntity.RoleTypeEnum.系统角色) {
                //此处修改去除'@'符号，包含了自己的数据
                if (FastChar.getConfig(FastExtConfig.class).getLayerType() == FastLayerType.Layer_Manager) {
                    put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue());
                } else if (FastChar.getConfig(FastExtConfig.class).getLayerType() == FastLayerType.Layer_Role) {
                    put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue(1));
                }
            }
        }
    }

    /**
     * 获得实体唯一编号
     */
    public String getEntityCode() {
        return this.getClass().getSimpleName();
    }

    /**
     * 设置字段默认值
     */
    public abstract void setDefaultValue();

    @Override
    public FastSqlInfo toSelectSql(String sqlStr) {
        if (getBoolean("^fromRecycle", false)) {
            sqlStr = sqlStr.replace(getTableName(), getTableName() + "_recycle");
        }
        return super.toSelectSql(sqlStr);
    }

    @Override
    public boolean update() {
        boolean update = super.update();
        if (update && isAutoUpdateLayerValue()) {
            this.autoUpdateLayerCode();
        }
        return update;
    }

    @Override
    public boolean update(String... checks) {
        boolean update = super.update(checks);
        if (update && isAutoUpdateLayerValue()) {
            this.autoUpdateLayerCode(checks);
        }
        return update;
    }


    @Override
    public boolean delete() {
        if (isRecycle()) {
            FastExtData<E> fastData = (FastExtData<E>) getFastData();
            fastData.copyRecycle();
        }
        return super.delete();
    }


    @Override
    public boolean delete(String... checks) {
        if (isRecycle()) {
            FastExtData<E> fastData = (FastExtData<E>) getFastData();
            fastData.copyRecycle(checks);
        }
        return super.delete(checks);
    }


    public void autoUpdateLayerCode(String... checks) {
        try {
            FastExtColumnInfo layerLinkColumn = getLayerLinkColumn();
            if (layerLinkColumn != null) {
                //如果更新了层级编号的字段值
                if (isNotEmpty(layerLinkColumn.getName()) &&
                        !getString(layerLinkColumn.getName()).equalsIgnoreCase("<null>")) {
                    updateLayerValue(selectLayerValue(checks), FastExtLayerHelper.buildLayerValue(this));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 获得层级编号
     */
    public String getLayerValue() {
        return getLayerValue(0);
    }

    /**
     * 获取所有上级的层级编号，不包含自身层级编号
     *
     * @return 数组集合
     */
    public List<String> getAllParentLayerValue() {
        List<String> parentLayerCodes = new ArrayList<>();
        List<String> currLayerCode = new ArrayList<>();
        String layerValue = getLayerValue();
        if (FastStringUtils.isEmpty(layerValue)) {
            return parentLayerCodes;
        }
        String[] layerCodes = layerValue.split("@");
        for (String code : layerCodes) {
            currLayerCode.add(code);
            String layValue = FastStringUtils.join(currLayerCode, "@");
            if (layValue.equals(layerValue)) {
                //跳过自身
                break;
            }
            parentLayerCodes.add(layValue);
        }
        return parentLayerCodes;
    }

    /**
     * 获取所有上级的层级编号，不包含自身层级编号
     *
     * @return 数组集合
     */
    public List<String> getAllParentLayerValue(String selfLayerCode) {
        List<String> parentLayerCodes = new ArrayList<>();
        List<String> currLayerCode = new ArrayList<>();
        if (FastStringUtils.isEmpty(selfLayerCode)) {
            return parentLayerCodes;
        }
        String[] layerCodes = selfLayerCode.split("@");
        for (String code : layerCodes) {
            currLayerCode.add(code);
            String layValue = FastStringUtils.join(currLayerCode, "@");
            if (layValue.equals(selfLayerCode)) {
                //跳过自身
                break;
            }
            parentLayerCodes.add(layValue);
        }
        return parentLayerCodes;
    }


    /**
     * 设置权限编号
     *
     * @param layerValue 值
     * @return 当前对象
     */
    public FastExtEntity<?> setLayerValue(String layerValue) {
        set(getLayerColumn().getName(), layerValue);
        return this;
    }

    /**
     * 获得父类的权限编号
     *
     * @return 字符串
     */
    public String getParentLayerCode() {
        if (isNotEmpty("parentLayerCode")) {
            return getString("parentLayerCode");
        }
        return getLayerValue(1);
    }


    /**
     * 构建新的权限编号
     *
     * @param parentLayerCode 父级编号
     * @return 字符串
     */
    public String buildLayerCode(String parentLayerCode) {
        String myLayerCode = FastMD5Utils.MD5To16(System.currentTimeMillis()
                + getTableName() + parentLayerCode);
        if (FastStringUtils.isNotEmpty(parentLayerCode)) {
            myLayerCode = parentLayerCode + "@" + myLayerCode;
        }
        return myLayerCode;
    }


    /**
     * 设置父类的权限编号
     *
     * @param layerCode 权限编号
     */
    public void setParentLayerCode(String layerCode) {
        put("parentLayerCode", layerCode);
    }

    /**
     * 是否是关联字段
     *
     * @param attr 属性名称
     * @return 布尔值
     */
    public boolean isLink(String attr) {
        FastExtColumnInfo column = getColumn(attr);
        if (column == null) {
            return false;
        }
        return column.isLink();
    }


    /**
     * 获得层级编号值
     *
     * @param upLevel 向上等级 例如：1 代表获取上一级的层级编号
     */
    public String getLayerValue(int upLevel) {
        if (getLayerColumn() != null) {
            String value = getString(getLayerColumn().getName());
            if (FastStringUtils.isNotEmpty(value)) {
                for (int i = 0; i < upLevel; i++) {
                    int endIndex = value.lastIndexOf("@");
                    if (endIndex > 0) {
                        value = value.substring(0, endIndex);
                    }
                }
            }
            return value;
        }
        return null;
    }

    /**
     * 是否有回收站表格
     *
     * @return 布尔值
     */
    public boolean isRecycle() {
        FastExtTableInfo table = getTable();
        if (table == null) {
            return false;
        }
        if (table.isRecycle()) {
            return true;
        }
        return false;
    }


    public FastExtColumnInfo getLayerColumn() {
        FastTableInfo<?> tableInfo = FastChar.getDatabases().get(getDatabase()).getTableInfo(getTableName());
        if (tableInfo instanceof FastExtTableInfo) {
            FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
            return extTableInfo.getLayerColumn();
        }
        return null;
    }


    public FastExtColumnInfo getLayerLinkColumn() {
        FastTableInfo<?> tableInfo = FastChar.getDatabases().get(getDatabase()).getTableInfo(getTableName());
        if (tableInfo instanceof FastExtTableInfo) {
            FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
            return extTableInfo.getLayerLinkColumn();
        }
        return null;
    }


    public String selectLayerValue(String... checks) {
        return ((FastExtData<?>) getFastData()).selectLayerValue(checks);
    }

    public String selectLayerValue(Object... idValues) {
        List<FastColumnInfo<?>> primaries = getPrimaries();
        for (int i = 0; i < primaries.size(); i++) {
            FastColumnInfo<?> fastColumnInfo = primaries.get(i);
            if (i < idValues.length) {
                set(fastColumnInfo.getName(), idValues[i]);
            } else {
                break;
            }
        }
        return selectLayerValue();
    }


    /**
     * 更新权限编号
     *
     * @param newLayerValue 新的权限编号
     */
    public void updateLayerValue(String newLayerValue) throws Exception {
        updateLayerValue(selectLayerValue(), newLayerValue);
    }

    /**
     * 更新权限编号
     *
     * @param oldLayerValue 当前权限编号
     * @param newLayerValue 新的权限编号
     */
    public void updateLayerValue(String oldLayerValue, String newLayerValue) throws Exception {
        List<String> sqlList = FastExtLayerHelper.buildUpdateLayerValueSql(this, oldLayerValue, newLayerValue);
        if (sqlList.size() > 0) {
            FastChar.getDb().setLog(false).batch(sqlList, sqlList.size());
        }
    }

    public boolean isAutoUpdateLayerValue() {
        return autoUpdateLayerValue;
    }

    public FastExtEntity<E> setAutoUpdateLayerValue(boolean autoUpdateLayerValue) {
        this.autoUpdateLayerValue = autoUpdateLayerValue;
        return this;
    }
}
