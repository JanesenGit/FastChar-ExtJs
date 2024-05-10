package com.fastchar.extjs.entity;

import com.fastchar.core.FastChar;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.utils.FastDateUtils;

import java.util.*;

import com.fastchar.utils.FastStringUtils;
import com.fastchar.utils.FastNumberUtils;
import com.fastchar.database.FastPage;
import com.fastchar.core.FastEntity;

/**
 * 系统数据日志管理数据库实体类
 *
 * @author Janesen
 * @date 2024/03/11 16:55
 */
public class ExtSystemDataLogEntity extends FastExtEntity<ExtSystemDataLogEntity> {
    private static final long serialVersionUID = 1L;

    public static ExtSystemDataLogEntity dao() {
        return FastChar.getOverrides().singleInstance(ExtSystemDataLogEntity.class);
    }

    public static ExtSystemDataLogEntity newInstance() {
        return FastChar.getOverrides().newInstance(ExtSystemDataLogEntity.class);
    }

    @Override
    public String getTableName() {
        return "ext_system_data_log";
    }

    @Override
    public String getTableDetails() {
        return "系统数据日志管理";
    }

    @Override
    public String getEntityCode() {
        return this.getClass().getSimpleName();
    }

    @Override
    public FastPage<ExtSystemDataLogEntity> showList(int page, int pageSize) {

        String sqlStr = "select t.*" + " from ext_system_data_log as t" + " ";

        ShowListSqlAdapter showListSqlAdapter = FastChar.getOverrides().singleInstance(false, ShowListSqlAdapter.class);
        if (showListSqlAdapter != null) {
            sqlStr = showListSqlAdapter.convertSql(this, sqlStr);
        }
        FastSqlInfo sqlInfo = toSelectSql(sqlStr);
        return selectBySql(page, pageSize, sqlInfo.getSql(), sqlInfo.toParams());
    }

    @Override
    public void setDefaultValue() {
        set("dataUserId", 0);
        set("dataId", 0);
        set("dataLogDateTime", FastDateUtils.getDateString());
    }

    @Override
    public void convertValue() {
        super.convertValue();

    }



    /**
     * 获得数据详情
     */
    public ExtSystemDataLogEntity getDetails(int dataLogId) {
        List<String> linkColumns = new ArrayList<>();
        linkColumns.add("t.*");
        String sqlStr = "select " + FastStringUtils.join(linkColumns, ",") + " from ext_system_data_log as t" + " "
                + " where t.dataLogId = ?  ";
        ExtSystemDataLogEntity entity = selectFirstBySql(sqlStr, dataLogId);
        if (entity != null) {
            // to-do something
        }
        return entity;
    }

    /**
     * 获得本实体列表集合
     *
     * @return 分页数据
     */
    public FastPage<ExtSystemDataLogEntity> getList(int page, int pageSize, Map<String, Object> where,
                                                    Map<String, Object> sort) {

        List<String> linkColumns = new ArrayList<>();
        linkColumns.add("t.*");

        StringBuilder sqlStr = new StringBuilder("select " + FastStringUtils.join(linkColumns, ",")
                + " from ext_system_data_log as t" + " " + " where 1=1 ");

        List<Object> values = new ArrayList<>();

        if (where != null) {
            for (Entry<String, Object> stringObjectEntry : where.entrySet()) {
                String key = stringObjectEntry.getKey();
                if (key.startsWith("^")) {
                    continue;
                }
                Object value = where.get(key);
                key = key.split("@")[0];

                if (key.equals("__searchKey")) {
                    String[] searchFields = new String[]{"dataUser", "dataLogContent", "dataLogIp", "dataLogClient",
                            "dataType"};
                    List<String> orWhere = new ArrayList<>();
                    for (String searchField : searchFields) {
                        orWhere.add(searchField + " like ? ");
                        values.add("%" + value + "%");
                    }
                    sqlStr.append(" and ").append(" ( ").append(FastStringUtils.join(orWhere, " or ")).append(" ) ");
                    continue;
                }

                String prefix = "t.";
                if (key.contains("__")) {
                    String[] keyArray = key.split("__");
                    prefix = keyArray[0] + ".";
                    key = keyArray[1];
                }

                String[] compareChar = new String[]{">=", "<=", ">", "<", "=", "!="};
                if (value == null) {
                    continue;
                }
                boolean hasCompare = false;
                for (String compare : compareChar) {
                    if (value.toString().startsWith(compare)) {
                        sqlStr.append(" and ").append(prefix).append(key).append(" ").append(compare).append(" ? ");
                        values.add(value.toString().replace(compare, ""));
                        hasCompare = true;
                        break;
                    }
                }
                if (hasCompare) {
                    continue;
                }
                if (isNumberColumn(key)) {
                    sqlStr.append(" and ").append(prefix).append(key).append(" = ? ");
                    values.add(value);
                } else {
                    sqlStr.append(" and ").append(prefix).append(key).append(" like ? ");
                    values.add("%" + value + "%");
                }
            }
        }

        if (sort != null) {
            List<String> sortKeys = new ArrayList<>();
            for (Entry<String, Object> stringObjectEntry : sort.entrySet()) {
                String key = stringObjectEntry.getKey();
                if (key.startsWith("^")) {
                    continue;
                }
                String prefix = "t.";
                if (key.contains("__")) {
                    prefix = key.split("__")[0] + ".";
                }
                sortKeys.add(prefix + key + " " + stringObjectEntry.getValue());
            }
            if (sortKeys.size() > 0) {
                sqlStr.append(" order by ").append(FastStringUtils.join(sortKeys, ","));
            }
        }

        FastPage<ExtSystemDataLogEntity> pageList = selectBySql(page, pageSize, sqlStr.toString(), values);
        for (ExtSystemDataLogEntity entity : pageList.getList()) {

        }
        return pageList;
    }

    /**
     * 根据层级编号获得本实体集合
     *
     * @return 分页数据
     */
    public FastPage<ExtSystemDataLogEntity> getListByLayerCode(int page, String layerCode) {

        List<String> linkColumns = new ArrayList<>();
        linkColumns.add("t.*");

        String sqlStr = "select " + FastStringUtils.join(linkColumns, ",") + " from ext_system_data_log as t" + " "
                + " where 1=1 and t.dataLayerCode like ? ";
        FastPage<ExtSystemDataLogEntity> pageList = selectBySql(page, 10, sqlStr, layerCode + "@%");
        for (ExtSystemDataLogEntity entity : pageList.getList()) {

        }
        return pageList;
    }










}