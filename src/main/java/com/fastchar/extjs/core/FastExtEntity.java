package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.database.FastPage;
import com.fastchar.database.FastType;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.database.sql.FastSql;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastExtData;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.extjs.core.database.FastSqlTool;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtManagerRoleEntity;
import com.fastchar.extjs.interfaces.IFastLayerListener;
import com.fastchar.utils.FastMD5Utils;
import com.fastchar.utils.FastStringUtils;

import java.util.*;

public abstract class FastExtEntity<E extends FastEntity<?>> extends FastEntity<E> {
    //上级层级编号的属性名
    public static final String EXTRA_PARENT_LAYER_CODE = "parentLayerCode";

    private static final long serialVersionUID = 3922925004072340430L;

    /**
     * 在执行update方法时，是否自动检测层级编号的更新
     */
    private boolean autoUpdateLayerValue = true;

    /**
     * 在执行update方法时，是否自动检测相同字段的更新
     */
    private boolean autoUpdateSameValue = true;

    /**
     * 在执行add方法时，是否自动检测层级编号的更新
     */
    private boolean autoSetLayerValue = true;

    /**
     * 在执行add方法时，是否自动检测相同字段的更新
     */
    private boolean autoSetSameValue = true;


    /**
     * 获得关联的表格名称
     */
    @Override
    public abstract String getTableName();


    /**
     * 获得数据列表
     */
    public abstract FastPage<E> showList(int page, int pageSize);

    /**
     * 是否打印实体对应的表格不存在
     *
     * @return 布尔值
     */
    public boolean logNotFoundTable() {
        return true;
    }


    /**
     * 是否为有效的FastExtEntity
     * @return 布尔值
     */
    public boolean isValidExtEntity() {
        return true;
    }


    /**
     * 填充权限检测的条件
     *
     * @param managerEntity 管理员对象
     */
    public void pullLayer(ExtManagerEntity managerEntity) {
        if (getLayerColumn() != null && FastChar.getConfig(FastExtConfig.class).getLayerType() != FastExtLayerType.None) {

            IFastLayerListener iFastLayerListener = FastChar.getOverrides().singleInstance(false, IFastLayerListener.class);
            if (iFastLayerListener != null) {
                if (iFastLayerListener.onPullLayer(this, managerEntity)) {
                    return;
                }
            }
            if (managerEntity.getManagerRole().getRoleType() != ExtManagerRoleEntity.RoleTypeEnum.超级角色) {
                List<String> layerValues = managerEntity.getLayerValues(this);
                if (layerValues != null) {
                    for (int i = 0; i < layerValues.size(); i++) {
                        put("@999||" + getLayerColumn().getName() + "?%:index"+i, layerValues.get(i));
                    }
                } else {
                    //此处修改去除'@'符号，包含了自己的数据
                    if (FastChar.getConfig(FastExtConfig.class).getLayerType() == FastExtLayerType.Layer_Manager) {
                        put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue());
                    } else if (FastChar.getConfig(FastExtConfig.class).getLayerType() == FastExtLayerType.Layer_Role) {
                        put(getLayerColumn().getName() + "?%", managerEntity.getLayerValue(1));
                    }
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
    @Override
    public abstract void setDefaultValue();


    public FastSqlInfo toSelectSql() {
        return FastSqlTool.buildSelectSql(FastSql.getInstance(getDatabaseType()), this);
    }

    public FastSqlInfo toSelectSql(String sqlStr) {
        if (getBoolean("^fromRecycle", false)) {
            sqlStr = sqlStr.replace(getTableName(), getTableName() + "_recycle");
        }
        return FastSqlTool.buildSelectSql(FastSql.getInstance(getDatabaseType()), sqlStr, this);
    }

    @Override
    public boolean update() {
        boolean modifyLayerColumn = isModifyLayerColumn();
        boolean modifySameLinkColumn = isModifySameLinkColumn();

        boolean update = super.update();
        if (update && modifyLayerColumn && isAutoUpdateLayerValue()) {
            this.autoUpdateLayerCode();
        }
        if (update && modifySameLinkColumn && isAutoUpdateSameValue()) {
            this.autoUpdateSameValue();
        }
        return update;
    }

    @Override
    public boolean update(String... checks) {
        boolean modifyLayerColumn = isModifyLayerColumn();
        boolean modifySameLinkColumn = isModifySameLinkColumn();

        boolean update = super.update(checks);
        if (update && isAutoUpdateLayerValue() && modifyLayerColumn) {
            this.autoUpdateLayerCode(checks);
        }
        if (update && isAutoUpdateSameValue() && modifySameLinkColumn) {
            this.autoUpdateSameValue(checks);
        }
        return update;
    }


    @Override
    public boolean delete() {
        if (isRecycle()) {
            FastExtData<E> fastData = (FastExtData<E>) getFastData();
            fastData.copyToRecycle();
        }
        return super.delete();
    }


    @Override
    public boolean delete(String... checks) {
        if (isRecycle()) {
            FastExtData<E> fastData = (FastExtData<E>) getFastData();
            fastData.copyToRecycle(checks);
        }
        return super.delete(checks);
    }


    private boolean isModifyLayerColumn() {
        FastExtColumnInfo layerLinkColumn = getBindLayerColumn();
        if (layerLinkColumn != null) {
            return isModified(layerLinkColumn.getName());
        }
        return false;
    }

    private boolean isModifySameLinkColumn() {
        FastExtColumnInfo sameLinkColumn = getSameLinkColumn();
        if (sameLinkColumn != null) {
            return isModified(sameLinkColumn.getName());
        }
        return false;
    }

    public void autoUpdateLayerCode(String... checks) {
        try {
            FastExtColumnInfo layerLinkColumn = getBindLayerColumn();
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

    public void autoUpdateSameValue(String... checks) {
        ((FastExtData<E>) getFastData()).updateSameValue(checks);
    }

    /**
     * 获得层级编号
     */
    public String getLayerValue() {
        return getLayerValue(0);
    }


    /**
     * 获取表格的权限层级拓扑图
     *
     * @return FastExtLayerHelper.LayerMap
     */
    public FastExtLayerHelper.LayerMap getLayerMap() {
        return FastExtLayerHelper.getLayerMap(getDatabase(), getTableName());
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
        if (isNotEmpty(FastExtEntity.EXTRA_PARENT_LAYER_CODE)) {
            return getString(FastExtEntity.EXTRA_PARENT_LAYER_CODE);
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
        String myLayerCode = FastMD5Utils.MD5To16(FastStringUtils.buildUUID());
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
        put(FastExtEntity.EXTRA_PARENT_LAYER_CODE, layerCode);
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
            if (upLevel <= 0) {
                return value;
            }
            if (FastStringUtils.isNotEmpty(value)) {
                boolean hasParent = false;
                for (int i = 0; i < upLevel; i++) {
                    int endIndex = value.lastIndexOf("@");
                    if (endIndex > 0) {
                        value = value.substring(0, endIndex);
                        hasParent = true;
                    }
                }
                if (hasParent) {
                    return value;
                }
            }
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
        return table.isRecycle();
    }


    public FastExtColumnInfo getLayerColumn() {
        FastTableInfo<?> tableInfo = getTable();
        if (tableInfo instanceof FastExtTableInfo) {
            FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
            return extTableInfo.getLayerColumn();
        }
        return null;
    }


    public FastExtColumnInfo getBindLayerColumn() {
        FastTableInfo<?> tableInfo =  getTable();
        if (tableInfo instanceof FastExtTableInfo) {
            FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
            return extTableInfo.getBindLayerColumn();
        }
        return null;
    }

    public FastExtColumnInfo getSameLinkColumn() {
        FastTableInfo<?> tableInfo =  getTable();
        if (tableInfo instanceof FastExtTableInfo) {
            FastExtTableInfo extTableInfo = (FastExtTableInfo) tableInfo;
            return extTableInfo.getSameLinkColumn();
        }
        return null;
    }


    public String selectLayerValue(String... checks) {
        return ((FastExtData<E>) getFastData()).selectLayerValue(checks);
    }


    public E selectFirstValue(String[] columns, String... checks) {
        return ((FastExtData<E>) getFastData()).selectFirstValue(columns, checks);
    }

    public String selectLayerValue(Object... idValues) {
        Collection<FastColumnInfo<?>> primaries = getPrimaries();
        int i = 0;
        for (FastColumnInfo<?> fastColumnInfo : primaries) {
            set(fastColumnInfo.getName(), idValues[i]);
            i++;
            if (i >= idValues.length) {
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
        if (sqlList != null && sqlList.size() > 0) {
            FastChar.getDB().setLog(false).batch(sqlList, sqlList.size());
        }
    }


    /**
     * 将附件按照extjs拼接的格式解析成map
     *
     * @param attr 附件的属性对象
     */
    @SuppressWarnings("unchecked")
    public void parseFilesToMap(String attr) {
        List<Object> fileMap = new ArrayList<>();
        List<String> fileList = new ArrayList<>();
        Object attrValue = get(attr);
        if (attrValue instanceof String) {
            fileList.addAll(FastChar.getJson().fromJson(attrValue.toString(), List.class));
        } else {
            List<String> attrFiles = getObject(attr);
            fileList.addAll(attrFiles);
        }

        for (String fileInfo : fileList) {
            Map<String, String> map = new HashMap<>();
            String[] infos = fileInfo.split("@");
            map.put("url", infos[0]);
            map.put("name", infos[0].substring(infos[0].lastIndexOf("/") + 1));
            if (infos.length > 1) {
                map.put("name", infos[1]);
            }
            if (infos.length > 2) {
                map.put("length", infos[2]);
            }
            fileMap.add(map);
        }
        put(attr + "Map", fileMap);
    }

    public boolean isAutoUpdateLayerValue() {
        return autoUpdateLayerValue;
    }

    public FastExtEntity<E> setAutoUpdateLayerValue(boolean autoUpdateLayerValue) {
        this.autoUpdateLayerValue = autoUpdateLayerValue;
        return this;
    }

    public boolean isAutoUpdateSameValue() {
        return autoUpdateSameValue;
    }

    public FastExtEntity<E> setAutoUpdateSameValue(boolean autoUpdateSameValue) {
        this.autoUpdateSameValue = autoUpdateSameValue;
        return this;
    }

    public boolean isAutoSetLayerValue() {
        return autoSetLayerValue;
    }

    public FastExtEntity<E> setAutoSetLayerValue(boolean autoSetLayerValue) {
        this.autoSetLayerValue = autoSetLayerValue;
        return this;
    }

    public boolean isAutoSetSameValue() {
        return autoSetSameValue;
    }

    public FastExtEntity<E> setAutoSetSameValue(boolean autoSetSameValue) {
        this.autoSetSameValue = autoSetSameValue;
        return this;
    }

    /**
     * 判断是否是否为数字类的列
     * @param attr 属性名
     * @return 布尔值
     */
    public boolean isNumberColumn(String attr) {
        FastColumnInfo<?> column = getColumn(attr);
        if (column != null) {
            return FastType.isNumberType(column.getType());
        }
        return false;
    }


    public static abstract class ShowListSqlAdapter {
        public abstract String convertSql(FastExtEntity<?> entity, String sqlStr);
    }

}
