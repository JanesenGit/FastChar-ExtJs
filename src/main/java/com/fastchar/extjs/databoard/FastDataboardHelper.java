package com.fastchar.extjs.databoard;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.utils.FastDateUtils;

import java.util.Date;

public class FastDataboardHelper {


    /**
     * 快速统计数据
     * @param tableName 目标表格
     * @param dateColumnName 日期字段名
     * @param targetDate 目标日期
     * @param type 统计类型 0 日统计 1 月统计 2 时统计 3 时分统计 4 年统计
     * @return 统计数字
     */
    public static int count(String tableName, String dateColumnName, Date targetDate, int type) {

        try {
            String dateSelect = "date_format(" + dateColumnName + ",'%Y-%m-%d')  ";
            String datePattern = "yyyy-MM-dd";
            if (type == 1) {//月报表
                dateSelect = "date_format(" + dateColumnName + ",'%Y-%m')  ";
                datePattern = "yyyy-MM";
            } else if (type == 4) {//年报表
                dateSelect = "date_format(" + dateColumnName + ",'%Y')  ";
                datePattern = "yyyy";
            }

            String sqlStr = "select count(1) as cnt from " + tableName
                    + " where 1=1 and " + dateSelect + " = ? ";

            FastEntity<?> fastEntity = FastChar.getDB().selectFirst(sqlStr, FastDateUtils.format(targetDate, datePattern));
            if (fastEntity != null) {
                return fastEntity.getInt("cnt");
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return 0;

    }


    public static FastDataboardDataTrend getRenderState(double upValue, double nowValue) {
        FastDataboardDataTrend renderState = FastDataboardDataTrend.无;
        if (upValue == 0 && nowValue == 0) {
            return renderState;
        }
        if (upValue > nowValue) {
            renderState = FastDataboardDataTrend.下降;
        }else if (upValue < nowValue) {
            renderState = FastDataboardDataTrend.上升;
        }else if (upValue == nowValue) {
            renderState = FastDataboardDataTrend.持平;
        }
        return renderState;
    }

}
