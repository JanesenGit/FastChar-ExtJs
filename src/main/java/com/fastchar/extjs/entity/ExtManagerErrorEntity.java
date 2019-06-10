package com.fastchar.extjs.entity;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.utils.FastDateUtils;

import java.util.*;

import com.fastchar.utils.FastStringUtils;

public class ExtManagerErrorEntity extends FastEntity<ExtManagerErrorEntity> {
    public static ExtManagerErrorEntity dao() {
        return FastChar.getOverrides().singleInstance(ExtManagerErrorEntity.class);
    }

    @Override
    public String getTableName() {
        return "ext_manager_error";
    }

    @Override
    public String getTableDetails() {
        return "登录失败次数";
    }

    @Override
    public void setDefaultValue() {
        set("errorDateTime", FastDateUtils.getDateString());
    }

    /**
     * 将关联查询的数据单独封装到对应的实体对象里
     */
    private void pluckEntity(String... alias) {
        String[] linkAlias = new String[0];
        for (int i = 0; i < linkAlias.length; i++) {
            if (i < alias.length) {
                linkAlias[i] = alias[i];
            }
        }

    }

    /**
     * 获得数据详情
     */
    public ExtManagerErrorEntity getDetails(int errorId) {
        List<String> linkColumns = new ArrayList<>();
        String sqlStr = "select t.*," + FastStringUtils.join(linkColumns, ",") + " from ext_manager_error as t" +
                " " +
                " where t.errorId = ?  ";
        ExtManagerErrorEntity entity = selectFirstBySql(sqlStr, errorId);
        if (entity != null) {
            entity.pluckEntity();
        }
        return entity;
    }


    public int countTodayError(String managerLoginName) {
        String sqlStr = "select count(1) as c from ext_manager_error where managerLoginName = ? ";
        if (isMySql()) {
            sqlStr += " and date_format(errorDateTime,'%Y-%m-%d') = ? ";
        }else if (isSqlServer()) {
            sqlStr += " and convert(varchar, errorDateTime, 23) = ? ";
        }
        ExtManagerErrorEntity result = selectFirstBySql(sqlStr, managerLoginName,
                FastDateUtils.getDateString("yyyy-MM-dd"));
        if (result != null) {
            return result.getInt("c");
        }
        return 0;
    }
}
