package com.fastchar.extjs.entity;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.FastExtLayerType;
import com.fastchar.extjs.entity.abstracts.AbstractExtSystemNoticeEntity;
import com.fastchar.utils.FastDateUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class ExtSystemNoticeEntity extends AbstractExtSystemNoticeEntity {
    private static final long serialVersionUID = 1L;

    public static ExtSystemNoticeEntity dao() {
        return FastChar.getOverrides().singleInstance(ExtSystemNoticeEntity.class);
    }

    public static ExtSystemNoticeEntity newInstance() {
        return FastChar.getOverrides().newInstance(ExtSystemNoticeEntity.class);
    }

    protected ExtSystemNoticeEntity() {
    }

    @Override
    public String getTableName() {
        return "ext_system_notice";
    }

    @Override
    public String getTableDetails() {
        return "系统待办";
    }

    @Override
    public String getEntityCode() {
        return this.getClass().getSimpleName();
    }

    @Override
    public FastPage<ExtSystemNoticeEntity> showList(int page, int pageSize) {


        String sqlStr = "select t.*,a.managerName as a__managerName" +
                " from ext_system_notice as t" +
                " left join ext_manager as a on a.managerId=t.managerId " +
                " order by noticeState asc , noticeDateTime desc ";
        FastSqlInfo sqlInfo = toSelectSql(sqlStr);
        return selectBySql(page, pageSize, sqlInfo.getSql(), sqlInfo.toParams());
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
    public void setDefaultValue() {
        set("managerId", 0);
        set("noticeState", 0);
        set("noticeDateTime", FastDateUtils.getDateString());
    }

    @Override
    public void convertValue() {
        super.convertValue();
        Enum noticeState = getEnum("noticeState", ExtSystemNoticeStateEnum.class);
        if (noticeState != null) {
            put("noticeStateStr", noticeState.name());
        }
    }

    public enum ExtSystemNoticeStateEnum {
        待处理,
        已处理
    }

    /**
     * 获得数据详情
     */
    public ExtSystemNoticeEntity getDetails(int noticeId) {
        List<String> linkColumns = new ArrayList<>();
        linkColumns.addAll(ExtManagerEntity.dao().toSelectColumns("a"));
        String sqlStr = "select t.*," + FastStringUtils.join(linkColumns, ",") + " from ext_system_notice as t" +
                " left join ext_manager as a on a.managerId=t.managerId" +
                " where t.noticeId = ?  ";
        ExtSystemNoticeEntity entity = selectFirstBySql(sqlStr, noticeId);
        if (entity != null) {
            ExtManagerEntity managerIdEntity = entity.toEntity("a", ExtManagerEntity.class);
            entity.put("managerIdEntity", managerIdEntity);
        }
        return entity;
    }

    /**
     * 根据managerId获得本实体集合
     *
     * @return 分页数据
     */
    public FastPage<ExtSystemNoticeEntity> getListByManagerId(int page, int managerId) {

        List<String> linkColumns = new ArrayList<>();
        linkColumns.addAll(ExtManagerEntity.dao().toSelectColumns("a"));

        String sqlStr = "select t.*," + FastStringUtils.join(linkColumns, ",") + " from ext_system_notice as t" +
                " left join ext_manager as a on a.managerId=t.managerId" +
                " where t.managerId=? ";
        FastPage<ExtSystemNoticeEntity> pageList = selectBySql(page, 10, sqlStr, managerId);
        for (ExtSystemNoticeEntity entity : pageList.getList()) {
            ExtManagerEntity managerIdEntity = entity.toEntity("a", ExtManagerEntity.class);
            entity.put("managerIdEntity", managerIdEntity);
        }
        return pageList;
    }

    /**
     * 根据managerIds批量查询数据，并整理成Map对应关系
     *
     * @return Map集合，key：managerId value: List<ExtSystemNoticeEntity>
     */
    public Map<Object, List<ExtSystemNoticeEntity>> getMapListByManagerIds(Object... managerIds) {
        List<String> placeHolder = new ArrayList<>();
        List<Object> values = new ArrayList<>();
        for (Object managerId : managerIds) {
            placeHolder.add("?");
            values.add(managerId);
        }
        Map<Object, List<ExtSystemNoticeEntity>> map = new HashMap<>();
        if (managerIds.length == 0) {
            return map;
        }
        List<String> linkColumns = new ArrayList<>();
        linkColumns.addAll(ExtManagerEntity.dao().toSelectColumns("a"));

        String sqlStr = "select t.*," + FastStringUtils.join(linkColumns, ",") + " from ext_system_notice as t" +
                " left join ext_manager as a on a.managerId=t.managerId" +
                " where t.managerId in (" + FastStringUtils.join(placeHolder, ",") + ") ";
        List<ExtSystemNoticeEntity> result = selectBySql(sqlStr, values.toArray());
        for (ExtSystemNoticeEntity entity : result) {
            ExtManagerEntity managerIdEntity = entity.toEntity("a", ExtManagerEntity.class);
            entity.put("managerIdEntity", managerIdEntity);
            Object managerId = entity.get("managerId");
            if (!map.containsKey(managerId)) {
                map.put(managerId, new ArrayList<ExtSystemNoticeEntity>());
            }
            map.get(managerId).add(entity);
        }
        return map;
    }


    public List<FastEntity<?>> getList(String managerLayerCode, Integer... excludeIds) throws Exception {
        String sqlStr = "select * from ext_system_notice where noticeLayerCode like ? " +
                " and noticeState = ? ";
        if (excludeIds.length > 0) {
            sqlStr += " and noticeId not in (" + FastStringUtils.join(excludeIds, ",") + ")";
        }
        sqlStr += " order by noticeDateTime desc ";
        return FastChar.getDB().setLog(false).select(sqlStr, managerLayerCode + "@%", ExtSystemNoticeStateEnum.待处理.ordinal());
    }


    public int updateWaitInfo(String code) {
        String sqlStr = "update ext_system_notice set noticeState = ? where noticeCode = ? ";
        return updateBySql(sqlStr,ExtSystemNoticeStateEnum.已处理.ordinal(),code);
    }

    public int clearNotice(String managerLayerCode) {
        String sqlStr = "update ext_system_notice set noticeState = ? where noticeLayerCode like ? ";
        return updateBySql(sqlStr,ExtSystemNoticeStateEnum.已处理.ordinal(),managerLayerCode + "@%");
    }
}
