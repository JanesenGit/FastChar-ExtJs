package com.fastchar.extjs.entity;

import com.fastchar.core.FastChar;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.extjs.databoard.FastDataboardDataInfo;
import com.fastchar.extjs.databoard.FastDataboardDataTextInfo;
import com.fastchar.extjs.databoard.IFastDataboardData;
import com.fastchar.utils.FastDateUtils;
import com.fastchar.utils.FastMD5Utils;

import java.util.*;

public class ExtSystemDataEntity extends FastExtEntity<ExtSystemDataEntity> {
    private static final long serialVersionUID = 1L;

    public static ExtSystemDataEntity dao() {
        return FastChar.getOverrides().singleInstance(ExtSystemDataEntity.class);
    }

    public static ExtSystemDataEntity newInstance() {
        return FastChar.getOverrides().newInstance(ExtSystemDataEntity.class);
    }


    @Override
    public String getTableName() {
        return "ext_system_data";
    }

    @Override
    public FastPage<ExtSystemDataEntity> showList(int page, int pageSize) {
        String sqlStr = "select t.* from ext_system_data as t " +
                " where 1=1 ";
        FastSqlInfo sqlInfo = toSelectSql(sqlStr);
        return selectBySql(page, pageSize, sqlInfo.getSql(), sqlInfo.toParams());
    }

    @Override
    public void setDefaultValue() {

    }


    public void saveData(ExtManagerEntity managerEntity, Date date) {
        if (managerEntity == null) {
            return;
        }
        List<FastDataboardDataInfo<?>> data = getData(managerEntity, date);
        saveData(managerEntity,date, data);
    }

    public void saveData(ExtManagerEntity managerEntity,Date date, List<FastDataboardDataInfo<?>> data) {
        for (FastDataboardDataInfo<?> fastDataInfo : data) {
            if (fastDataInfo instanceof FastDataboardDataTextInfo) {
                FastDataboardDataTextInfo textInfo = (FastDataboardDataTextInfo) fastDataInfo;
                ExtSystemDataEntity dataEntity = ExtSystemDataEntity.newInstance();
                dataEntity.set("managerId", managerEntity.getId());
                dataEntity.set("dataCode", FastMD5Utils.MD5To16(managerEntity.getId() +
                        textInfo.getId() + FastDateUtils.format(date, "yyyy-MM-dd")));
                dataEntity.set("dataType", textInfo.getId());
                dataEntity.set("dataValue", fastDataInfo.getValue());
                dataEntity.set("dataDateTime", FastDateUtils.format(date, "yyyy-MM-dd HH:mm:ss"));
                dataEntity.push("dataCode");
            }
        }
    }


    public List<FastDataboardDataInfo<?>> getData(ExtManagerEntity managerEntity, Date date) {

        List<FastDataboardDataInfo<?>> allInfos = new ArrayList<>();
        List<IFastDataboardData> iFastDataBoards = FastChar.getOverrides().newInstances(false, IFastDataboardData.class);
        for (IFastDataboardData iFastDataBoard : iFastDataBoards) {
            List<FastDataboardDataInfo<?>> dataInfo = iFastDataBoard.getDataInfo(managerEntity, date);
            if (dataInfo == null) {
                continue;
            }
            allInfos.addAll(dataInfo);
        }

        return allInfos;
    }





}
