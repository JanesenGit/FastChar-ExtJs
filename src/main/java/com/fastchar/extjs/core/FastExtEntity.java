package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntities;
import com.fastchar.core.FastEntity;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastDatabaseInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastExtData;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtManagerRoleEntity;
import com.fastchar.utils.FastClassUtils;
import com.fastchar.utils.FastMD5Utils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.List;

public abstract class FastExtEntity<E extends FastEntity> extends FastEntity<E> {

    private static final long serialVersionUID = 3922925004072340430L;

    /**
     * 获得关联的表格名称
     */
    public abstract String getTableName();


    /**
     * 获得数据列表
     */
    public abstract FastPage<E> showList(int page, int pageSize);


    /**
     * 获得权限数据列表
     */
    public FastPage<E> showLayerList(ExtManagerEntity managerEntity, int page, int pageSize) {
        if (getLayerColumn() != null) {
            if (managerEntity.getManagerRole().getRoleType() != ExtManagerRoleEntity.RoleTypeEnum.系统角色) {
                if (FastChar.getConfig(FastExtConfig.class).getLayerType() == FastLayerType.Layer_Manager) {
                    put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue() + "@");
                } else if (FastChar.getConfig(FastExtConfig.class).getLayerType() == FastLayerType.Layer_Role) {
                    put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue(1) + "@");
                }
            }
        }
        return showList(page, pageSize);
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
    public boolean update() {
        boolean update = super.update();
        if (update) {
            this.autoUpdateLayerCode();
        }
        return update;
    }

    @Override
    public boolean update(String... checks) {
        boolean update = super.update(checks);
        if (update) {
            this.autoUpdateLayerCode();
        }
        return update;
    }

    public void autoUpdateLayerCode() {
        try {
            FastExtColumnInfo layerLinkColumn = getLayerLinkColumn();
            if (layerLinkColumn != null) {
                if (isNotEmpty(layerLinkColumn.getName())
                        && !getString(layerLinkColumn.getName()).equalsIgnoreCase("<null>")
                        && FastStringUtils.isNotEmpty(getString(layerLinkColumn.getName()))) {
                    String tableName = layerLinkColumn.getLinkInfo().getTableName();
                    List<FastEntities.EntityInfo> entityInfo = FastChar.getEntities().getEntityInfo(tableName);
                    if (entityInfo.size() > 0) {
                        FastEntity fastEntity = FastChar.getOverrides().newInstance(entityInfo.get(0).getTargetClass());
                        if (fastEntity instanceof FastExtEntity) {
                            FastExtEntity extEntity = (FastExtEntity) fastEntity;
                            String parentLayerCode = extEntity.selectLayerValue(get(layerLinkColumn.getName()));
                            String buildLayerCode = buildLayerCode(parentLayerCode);
                            updateLayerValue(buildLayerCode);
                        }
                    }
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
     * 设置权限编号
     * @param layerValue 值
     * @return 当前对象
     */
    public FastExtEntity setLayerValue(String layerValue) {
        set(getLayerColumn().getName(), layerValue);
        return this;
    }

    /**
     * 获得父类的权限编号
     *
     * @return
     */
    public String getParentLayerCode() {
        if (isNotEmpty("parentLayerCode")) {
            return getString("parentLayerCode");
        }
        return getLayerValue(1);
    }


    /**
     * 构建新的权限编号
     * @param parentLayerCode
     * @return
     */
    public String buildLayerCode(String parentLayerCode) {
        String myLayerCode = FastMD5Utils.MD5(FastStringUtils.buildOnlyCode(getTableName()));
        if (FastStringUtils.isNotEmpty(parentLayerCode)) {
            myLayerCode = parentLayerCode + "@" + myLayerCode;
        }
        return myLayerCode;
    }


    /**
     * 设置父类的权限编号
     *
     * @param layerCode
     */
    public void setParentLayerCode(String layerCode) {
        put("parentLayerCode", layerCode);
    }

    /**
     * 是否是关联字段
     *
     * @param attr
     * @return
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
            for (int i = 0; i < upLevel; i++) {
                int endIndex = value.lastIndexOf("@");
                if (endIndex > 0) {
                    value = value.substring(0, endIndex);
                }
            }
            return value;
        }
        return null;
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


    public String selectLayerValue() {
        return ((FastExtData) getFastData()).selectLayerValue();
    }

    public String selectLayerValue(Object... idValues) {
        List<FastColumnInfo> primaries = getPrimaries();
        for (int i = 0; i < primaries.size(); i++) {
            FastColumnInfo fastColumnInfo = primaries.get(i);
            if (i < idValues.length) {
                set(fastColumnInfo.getName(), idValues[i]);
            }else{
                break;
            }
        }
        return selectLayerValue();
    }


    /**
     * 更新权限编号
     * @param newLayerValue 新的权限编号
     */
    public void updateLayerValue(String newLayerValue) throws Exception {
        updateLayerValue(selectLayerValue(), newLayerValue);
    }

    /**
     * 更新权限编号
     * @param oldLayerValue  当前权限编号
     * @param newLayerValue 新的权限编号
     */
    public void updateLayerValue(String oldLayerValue,String newLayerValue) throws Exception {
        if (FastStringUtils.isEmpty(oldLayerValue) || FastStringUtils.isEmpty(newLayerValue)) {
            return;
        }

        List<String> sqlList= new ArrayList<>();
        FastDatabaseInfo fastDatabaseInfo = FastChar.getDatabases().get(getDatabase());
        List<FastTableInfo> tables = fastDatabaseInfo.getTables();
        for (FastTableInfo table : tables) {
            if (table instanceof FastExtTableInfo) {
                FastExtTableInfo extTableInfo= (FastExtTableInfo) table;
                FastExtColumnInfo layerColumn = extTableInfo.getLayerColumn();
                if (layerColumn != null) {
                    String name = extTableInfo.getLayerColumn().getName();
                    String sqlStr = "update " + extTableInfo.getName() +
                            " set " + name + " = replace (" + name + ",'" + oldLayerValue + "','" + newLayerValue + "') " +
                            " where " + name + " like '" + oldLayerValue + "%' ";
                    sqlList.add(sqlStr);
                }
            }
        }
        if (sqlList.size() > 0) {
            FastChar.getDb().setLog(false).batch(sqlList, sqlList.size());
        }
    }

}
