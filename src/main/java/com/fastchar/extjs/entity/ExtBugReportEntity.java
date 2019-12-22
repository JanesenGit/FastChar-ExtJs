package com.fastchar.extjs.entity;

import com.fastchar.core.FastChar;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.utils.FastDateUtils;

import java.util.*;

public class ExtBugReportEntity extends FastExtEntity<ExtBugReportEntity> {
    private static final long serialVersionUID = 1L;

    public static ExtBugReportEntity dao() {
        return FastChar.getOverrides().singleInstance(ExtBugReportEntity.class);
    }

    public static ExtBugReportEntity newInstance() {
        return FastChar.getOverrides().newInstance(ExtBugReportEntity.class);
    }

    protected ExtBugReportEntity() {
    }

    @Override
    public String getTableName() {
        return "ext_bug_report";
    }

    @Override
    public String getTableDetails() {
        return "问题反馈";
    }

    @Override
    public String getEntityCode() {
        return this.getClass().getSimpleName();
    }

    @Override
    public FastPage<ExtBugReportEntity> showList(int page, int pageSize) {
        String sqlStr = "select t.* ,a.managerName as a__managerName " +
                " from ext_bug_report as t" +
                " left join ext_manager as a on a.managerId=t.managerId" +
                " order by t.reportState asc,t.reportDateTime desc ";
        FastSqlInfo sqlInfo = toSelectSql(sqlStr);
        FastPage<ExtBugReportEntity> fastPage = selectBySql(page, pageSize, sqlInfo.getSql(), sqlInfo.toParams());
        for (ExtBugReportEntity finalBugReportEntity : fastPage.getList()) {
            List<?> list = finalBugReportEntity.getObject("bugImages");
            StringBuilder imageHtml = new StringBuilder();
            for (Object o : list) {
                imageHtml.append("<img style='border:1px solid #cccccc;' src = '").append(o).append("' width='50px' onclick=\"showImage(this,'").append(o).append("')\" />&nbsp;&nbsp;");
            }
            finalBugReportEntity.put("bugImagesHtml", imageHtml.toString());
        }

        return fastPage;
    }

    @Override
    public void setDefaultValue() {
        set("funcType", 0);
        set("reportState", 0);
        set("reportDateTime", FastDateUtils.getDateString());
    }

    @Override
    public void convertValue() {
        super.convertValue();
        Enum funcType = getEnum("funcType", ExtBugFuncTypeEnum.class);
        if (funcType != null) {
            put("funcTypeStr", funcType.name());
        }
        String bugImages = getString("bugImages", "[]");
        put("bugImages", FastChar.getJson().fromJson(bugImages, List.class));
        Enum reportState = getEnum("reportState", ExtBugReportStateEnum.class);
        if (reportState != null) {
            put("reportStateStr", reportState.name());
        }
    }

    public enum ExtBugFuncTypeEnum {
        后台功能,
        安卓端功能,
        苹果端功能,
        Web端功能,
        微信端功能
    }

    public enum ExtBugReportStateEnum {
        待处理,
        已处理
    }

}
