package com.fastchar.extjs.action;

import com.fastchar.core.*;
import com.fastchar.database.FastPage;
import com.fastchar.database.FastType;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.database.sql.FastSql;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.accepter.FastExtEnumAccepter;
import com.fastchar.extjs.annotation.AFastLog;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.extjs.core.FastExtLayerHelper;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastExtData;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.extjs.core.enums.FastEnumInfo;
import com.fastchar.extjs.core.heads.FastHeadExtInfo;
import com.fastchar.extjs.echarts.FastEChartsBean;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.extjs.entity.ExtSystemConfigEntity;
import com.fastchar.extjs.interfaces.IFastExtEnum;
import com.fastchar.extjs.interfaces.IFastImportDataListener;
import com.fastchar.interfaces.IFastJson;
import com.fastchar.utils.*;
import com.google.gson.reflect.TypeToken;
import org.apache.poi.hssf.usermodel.*;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellRangeAddressList;

import java.io.*;
import java.lang.reflect.Array;
import java.util.*;

@SuppressWarnings({"ResultOfMethodCallIgnored", "SuspiciousMethodCalls"})
@AFastSession
public class ExtEntityAction extends FastAction {

    @Override
    protected String getRoute() {
        return "/entity";
    }


    /**
     * 获取实体的列表数据
     * 参数：
     * page 页数 {int}
     * limit 每页大小 {int}
     * entityCode 实体编号 {String}
     * where 列表sql的where判断语句 ,例如：where['t.userId'] = 1
     * indexSort 指定排序列 json数组，例如：[{"property":"serviceNickName","direction":"DESC"}]
     * power 是否需要权限层级筛选，默认：true
     */
    public FastPage<?> list() {
        //开始gzip支持
        getResponse().setHeader("Content-Encoding", "gzip");

        String entityCode = getParam("entityCode", true);
        int page = getParamToInt("page", 1);
        int pageSize = getParamToInt("limit", 10);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return null;
        }
        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return null;
        }

        ExtManagerEntity managerEntity = getSession("manager");

        Map<String, Object> where = getParamToMap("where");
        entity.putAll(where);

        Map<String, Object> index = getParamToMap("indexSort");

        String sort = getParam("sort");
        if (FastStringUtils.isNotEmpty(sort)) {
            List<Map<String, String>> sortList = FastChar.getJson().fromJson(sort,
                    new TypeToken<List<Map<String, String>>>() {
                    }.getType());
            for (Map<String, String> map : sortList) {
                if (map.get("property").startsWith("@")) {
                    continue;
                }
                entity.put(FastNumberUtils.formatToInt(index.get(map.get("property"))) + map.get("property") + ":sort", map.get("direction"));
            }
        }

        if (getParamToBoolean("power", Boolean.TRUE) && !getParamToBoolean("fromTree", false)) {
            entity.pullLayer(managerEntity);
        }
        FastPage<?> fastPage = entity.showList(page, pageSize);
        if (fastPage.getSqlInfo() != null) {
            managerEntity.put("Sql" + entityCode + "_" + entity.getBoolean("^fromRecycle"), fastPage.getSqlInfo().getSql());
        }
        return fastPage;
    }


    /**
     * 添加实体数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * data 以data为前缀的参数，提交实体数据，例如：data.topicError=无,data.topicState=1,data.topicTitle=我的话题
     * method 执行实体的方法名，默认为：save方法
     */
    @AFastLog(value = "页面【${menu}】添加了一条数据！", type = "添加数据")
    public void save() {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        ExtManagerEntity managerEntity = getSession("manager");

        FastEntity<?> entity = getParamToEntity("data", extEntityClass);
        if (FastStringUtils.isEmpty(menu)) {
            menu = entity.getTableDetails();
        }
        setRequestAttr("menu", menu);
        List<FastEntity<?>> saveEntities = new ArrayList<>();
        pluckArrayValue(entity, saveEntities);

        List<FastHandler> saveResult = new ArrayList<>();
        for (FastEntity<?> saveEntity : saveEntities) {
            if (saveEntity.getTable() != null) {
                if (saveEntity.getTable() instanceof FastExtTableInfo) {
                    FastExtTableInfo extTableInfo = saveEntity.getTable();
                    if (extTableInfo.isBindSessionLayer()) {
                        saveEntity.put(FastExtEntity.EXTRA_PARENT_LAYER_CODE, managerEntity.getLayerValue());
                    }
                }
            }

            saveEntity.put("fromWeb", true);
            saveEntity.put("session", managerEntity);

            String[] checks = getParamToArray("check");
            String method = getParam("method", "save");
            if (checks.length == 0) {
                if (saveEntity.save()) {
                    saveResult.add(new FastHandler().setCode(0).setError("添加成功！"));
                    continue;
                }
            } else {
                if (method.equalsIgnoreCase("save")) {
                    if (saveEntity.save(checks)) {
                        saveResult.add(new FastHandler().setCode(0).setError("添加成功！"));
                        continue;
                    } else if (FastStringUtils.isEmpty(saveEntity.getError())) {
                        saveResult.add(new FastHandler().setCode(-1).setError("添加失败！数据或已存在！"));
                        continue;
                    }
                } else if (method.equalsIgnoreCase("push")) {
                    FastHandler handler = new FastHandler();
                    if (saveEntity.push(handler, checks)) {
                        if (handler.getCode() == 0) {
                            saveResult.add(new FastHandler().setCode(0).setError("添加成功！"));
                            continue;
                        }
                        saveResult.add(new FastHandler().setCode(0).setError("更新成功！"));
                        continue;
                    }
                }
            }
            saveResult.add(new FastHandler().setCode(-1).setError("添加失败！" + saveEntity.getError()));
        }
        if (saveResult.size() == 1) {
            responseJson(saveResult.get(0).getCode(), saveResult.get(0).getError());
        } else {
            StringBuilder stringBuilder = new StringBuilder();
            int errorCount = 0;
            for (int i = 0; i < saveResult.size(); i++) {
                FastHandler handler = saveResult.get(i);
                if (handler.getCode() != 0) {
                    errorCount++;
                }
                stringBuilder.append("数据").append(i + 1).append("：").append(handler.getError()).append("<br/>");
            }
            if (errorCount == saveResult.size()) {
                responseJson(-1, stringBuilder.toString());
            } else {
                responseJson(0, stringBuilder.toString());
            }
        }

    }

    private void pluckArrayValue(FastEntity<?> entity, List<FastEntity<?>> entities) {
        List<FastExtColumnInfo> columns = entity.getTable().getColumns();
        boolean hasArray = false;
        for (FastExtColumnInfo column : columns) {
            Object values = entity.get(column.getName());
            if (values == null || FastStringUtils.isEmpty(values.toString())) {
                continue;
            }

            if (entity.getBoolean(column.getName() + "@JsonArray")) {
                entity.remove(column.getName());
                entity.remove(column.getName() + "@JsonArray");
                values = FastChar.getJson().fromJson(values.toString(), List.class).toArray();
            }

            if (values.getClass().isArray()) {
                hasArray = true;
                for (int i = 0; i < Array.getLength(values); i++) {
                    Object singleValue = Array.get(values, i);
                    if (singleValue == null || FastStringUtils.isEmpty(singleValue.toString())) {
                        continue;
                    }
                    FastEntity<?> newEntity = FastChar.getOverrides().newInstance(entity.getClass());
                    newEntity.setAll(entity);
                    newEntity.set(column.getName(), singleValue);
                    pluckArrayValue(newEntity, entities);
                }
            }
        }
        if (!hasArray) {
            entities.add(entity);
        }
    }


    /**
     * 删除实体数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * where 用作sql的where判断语句 ,例如：where['t.userId'] = 1
     * data 以data为前缀的参数，提交实体数据，例如：data.topicError=无,data.topicState=1,data.topicTitle=我的话题
     */
    @AFastLog(value = "页面【${menu}】进行删除数据！", type = "删除数据")
    public void delete() throws Exception {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        boolean all = getParamToBoolean("all", false);
        if (all) {
            FastExtEntity<?> extEntity = FastClassUtils.newInstance(extEntityClass);
            if (extEntity != null) {
                if (FastStringUtils.isEmpty(menu)) {
                    menu = extEntity.getTableDetails();
                }
                setRequestAttr("menu", menu);
                ExtManagerEntity managerEntity = getSession("manager");

                Map<String, Object> where = getParamToMap("where");
                extEntity.putAll(where);
                extEntity.pullLayer(managerEntity);


                boolean fromRecycle = extEntity.getBoolean("^fromRecycle");
                String showListSql = managerEntity.getString("Sql" + entityCode + "_" + fromRecycle);
                if (FastStringUtils.isEmpty(showListSql)) {
                    responseJson(-1, "清除失败！请稍后重试！");
                }

                List<FastColumnInfo<?>> primaries = extEntity.getPrimaries();
                String keyName = primaries.get(0).getName();
                for (FastColumnInfo<?> primary : primaries) {
                    if (primary.isAutoincrement()) {
                        keyName = primary.getName();
                    }
                }
                int fromIndex = showListSql.indexOf("from");
                int whereIndex = showListSql.lastIndexOf("where");
                String tableName = extEntity.getTableName();
                if (fromRecycle) {
                    tableName = tableName + "_recycle";
                }

                String sqlStr = "select t." + keyName + " " + showListSql.substring(fromIndex, whereIndex);
                FastSqlInfo sqlInfo = extEntity.getSql().appendWhere(sqlStr, extEntity);
                String deleteSql = "delete from " + tableName + " where " +
                        keyName + " in ( select * from ( " + sqlInfo.getSql() + ") as tmp ) ";
                int update = FastChar.getDb().update(deleteSql, sqlInfo.toParams());
                if (update > 0) {
                    responseJson(0, "删除成功！共删除了" + update + "条数据！");
                }
            }
        } else {
            int count = 0;
            List<? extends FastExtEntity<?>> entity = getParamToEntityList("data", extEntityClass);
            for (FastEntity<?> fastEntity : entity) {
                if (FastStringUtils.isEmpty(menu)) {
                    menu = fastEntity.getTableDetails();
                }
                setRequestAttr("menu", menu);

                fastEntity.put("fromWeb", true);
                if (!fastEntity.delete()) {
                    if (count > 0) {
                        responseJson(-1, "已成功删除" + count + "条数据后发生错误！" + fastEntity.getError());
                    }
                    responseJson(-1, fastEntity.getError());
                }
                count++;
            }
            responseJson(0, "删除成功！共删除了" + count + "条数据！", entity);
        }
        responseJson(-1, "删除失败！");
    }


    /**
     * 修改实体数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * data 以data为前缀的参数，提交实体数据，例如：data.topicError=无,data.topicState=1,data.topicTitle=我的话题
     */
    @AFastLog(value = "页面【${menu}】进行修改数据！", type = "修改数据")
    public void update() throws Exception {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");
        setRequestAttr("menu", menu);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        List<? extends FastExtEntity<?>> entity = getParamToEntityList("data", extEntityClass);
        for (FastEntity<?> fastEntity : entity) {
            if (FastStringUtils.isEmpty(menu)) {
                menu = fastEntity.getTableDetails();
            }
            setRequestAttr("menu", menu);
            fastEntity.put("fromWeb", true);
            if (!fastEntity.update()) {
                if (fastEntity.getModified().size() > 0) {
                    responseJson(-1, fastEntity.getError());
                }
            }
        }
        responseJson(0, "修改成功！", entity);
    }


    /**
     * 复制实体数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * data 以data为前缀的参数，提交实体数据，例如：data.topicError=无,data.topicState=1,data.topicTitle=我的话题
     */
    @AFastLog(value = "页面【${menu}】进行复制数据！", type = "复制数据")
    public void copy() {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");
        setRequestAttr("menu", menu);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        List<? extends FastExtEntity<?>> entity = getParamToEntityList("data", extEntityClass);
        for (FastEntity<?> fastEntity : entity) {
            if (FastStringUtils.isEmpty(menu)) {
                menu = fastEntity.getTableDetails();
            }
            setRequestAttr("menu", menu);
            fastEntity.put("fromWeb", true);
            fastEntity.copySave();
        }
        responseJson(0, "数据复制成功！");
    }


    /**
     * 清除某个属性为空的所有数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * where 用作sql的where判断语句 ,例如：where['t.userId'] = 1
     */
    @AFastLog(value = "页面【${menu}】进行清理数据！", type = "清理数据")
    public void clear() throws Exception {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");
        setRequestAttr("menu", menu);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastClassUtils.newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        if (FastStringUtils.isEmpty(menu)) {
            menu = entity.getTableDetails();
        }
        setRequestAttr("menu", menu);

        if (entity.getPrimaries().size() == 0) {
            responseJson(-1, "清除失败！此列表不允许此功能！");
        }

        Map<String, Object> where = getParamToMap("where");
        entity.putAll(where);

        ExtManagerEntity managerEntity = getSession("manager");
        entity.pullLayer(managerEntity);

        String showListSql = managerEntity.getString("Sql" + entityCode + "_" + entity.getBoolean("^fromRecycle"));
        if (FastStringUtils.isEmpty(showListSql)) {
            responseJson(-1, "清除失败！请稍后重试！");
        }

        int fromIndex = showListSql.indexOf("from");
        int whereIndex = showListSql.lastIndexOf("where");

        List<FastColumnInfo<?>> primaries = entity.getPrimaries();
        String keyName = primaries.get(0).getName();
        for (FastColumnInfo<?> primary : primaries) {
            if (primary.isAutoincrement()) {
                keyName = primary.getName();
            }
        }

        String sqlStr = "select t." + keyName + " " + showListSql.substring(fromIndex, whereIndex);

        String field = getParam("field", true);
        field = FastSql.formatAlias(field, "t");


        FastSqlInfo fastSqlInfo = entity.toSelectSql(sqlStr);
        sqlStr = fastSqlInfo.getSql() + " and  " + field + " is null ";


        String deleteSql = "delete from " + entity.getTableName() + " where " +
                keyName + " in ( select * from ( " + sqlStr + ") as tmp ) ";

        int update = FastChar.getDb().update(deleteSql, fastSqlInfo.toParams());

        responseJson(0, "清理成功！共清理" + update + "条数据！");
    }


    /**
     * 从回收站中还原实体数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * data 以data为前缀的参数，提交实体数据，例如：data.topicError=无,data.topicState=1,data.topicTitle=我的话题
     */
    @AFastLog(value = "页面【${menu}】进行还原数据！", type = "数据还原")
    public void reback() {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");
        setRequestAttr("menu", menu);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        List<? extends FastExtEntity<?>> entity = getParamToEntityList("data", extEntityClass);
        for (FastEntity<?> fastEntity : entity) {
            if (FastStringUtils.isEmpty(menu)) {
                menu = fastEntity.getTableDetails();
            }
            setRequestAttr("menu", menu);
            FastExtData<?> fastData = (FastExtData<?>) fastEntity.getFastData();
            if (fastData.copyFromRecycle()) {
                fastData.deleteRecycle();
            }
        }
        responseJson(0, "还原成功！");
    }


    /**
     * 计算实体指定属性的值
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * type 计算类型，为sql的计算函数，例如：sum、avg
     * field 需要计算的字段名
     */
    public void compute() throws Exception {
        String entityCode = getParam("entityCode", true);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastClassUtils.newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        Map<String, Object> where = getParamToMap("where");
        entity.putAll(where);

        ExtManagerEntity managerEntity = getSession("manager");
        entity.pullLayer(managerEntity);

        String type = getParam("type", true);
        String field = getParam("field", true);
        field = FastSql.formatAlias(field, "t");
        String sqlStr;
        String showListSql = managerEntity.getString("Sql" + entityCode + "_" + entity.getBoolean("^fromRecycle"));
        if (FastStringUtils.isNotEmpty(showListSql)) {
            int fromIndex = showListSql.indexOf("from");
            int whereIndex = showListSql.lastIndexOf("where");
            sqlStr = "select " + type + "(" + field + ") as result " + showListSql.substring(fromIndex, whereIndex);
        } else {
            sqlStr = "select " + type + "(" + field + ") as result from " + entity.getTableName();
        }

        FastSqlInfo sqlInfo = entity.toSelectSql(sqlStr);
        FastEntity<?> fastEntity = FastChar.getDb().selectFirst(sqlInfo.getSql(), sqlInfo.toParams());
        if (fastEntity != null) {
            responseJson(0, "计算成功！", fastEntity.getFloat("result", 4));
        } else {
            responseJson(-1, "计算失败！");
        }
    }

    /**
     * 导出实体数据excel
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * where 列表sql的where判断语句 ,例如：where['t.userId'] = 1
     * indexSort 指定排序列 json数组，例如：[{"property":"serviceNickName","direction":"DESC"}]
     * column 需要导出的列 json数组
     */
    @AFastLog(value = "导出了【${entityDetails}】数据！", type = "数据导出")
    public void export() throws Exception {
        String entityCode = getParam("entityCode", true);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        setRequestAttr("entityDetails", entity.getTableDetails());

        IFastJson iFastJsonProvider = FastChar.getOverrides().newInstance(IFastJson.class);
        Map<String, Object> where = getParamToMap("where");
        entity.putAll(where);

        ExtManagerEntity managerEntity = getSession("manager");
        entity.pullLayer(managerEntity);

        Map<String, Object> index = getParamToMap("indexSort");

        String sort = getParam("sort");
        if (FastStringUtils.isNotEmpty(sort)) {
            List<Map<String, String>> sortList = iFastJsonProvider.fromJson(sort,
                    new TypeToken<List<Map<String, String>>>() {
                    }.getType());
            for (Map<String, String> map : sortList) {
                if (map.get("property").startsWith("@")) {
                    continue;
                }
                entity.put(FastNumberUtils.formatToInt(index.get(map.get("property"))) + map.get("property") + ":sort", map.get("direction"));
            }
        }

        List<Map<String, Object>> columns = getParamToMapList("column");
        String onlyCode = FastMD5Utils.MD5(entityCode + FastChar.getJson().toJson(columns));

        ExtSystemConfigEntity entityExcelModule = new ExtSystemConfigEntity();
        entityExcelModule.setManagerId(-1);
        entityExcelModule.setConfigKey(onlyCode);
        entityExcelModule.setConfigType("EntityExcelModule");
        entityExcelModule.setConfigValue(iFastJsonProvider.toJson(columns));
        entityExcelModule.save();


        String title = getParam("title", true);

        FastPage<?> fastPage = entity.showList(-1, -1);
        List<?> list = fastPage.getList();
        if (list.size() == 0) {
            responseJson(-1, "暂无数据！");
        }

        //创建一个新的Excel
        HSSFWorkbook workBook = new HSSFWorkbook();
        //创建sheet页
        HSSFSheet sheet = workBook.createSheet();
        //sheet页名称
        workBook.setSheetName(0, title + "@" + "标识码禁止删除@" + entityExcelModule.getId());


        HSSFCellStyle cellStyle = workBook.createCellStyle();
        cellStyle.setAlignment(HorizontalAlignment.CENTER);

        HSSFFont font = workBook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 18);

        cellStyle.setFont(font);
        //设置第一行为Header
        HSSFRow row0 = sheet.createRow(0);
        HSSFCell cell00 = row0.createCell(0);
        cell00.setCellStyle(cellStyle);
        cell00.setCellValue(title);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, columns.size()));//合并第一行的单元格

        //设置第一行为Header
        HSSFRow titleRow = sheet.createRow(1);
        for (int i = 0; i < columns.size(); i++) {
            Map<String, Object> column = columns.get(i);
            HSSFCell cell = titleRow.createCell(i);
            cell.setCellStyle(cellStyle);
            cell.setCellValue(String.valueOf(column.get("text")));
            if (column.containsKey("groupHeaderText") && FastStringUtils.isNotEmpty(column.get("groupHeaderText").toString())) {
                cell.setCellValue("【" + column.get("groupHeaderText") + "】" + column.get("text"));
            }
//            sheet.autoSizeColumn(i, true); 列宽自动计算有误
            sheet.setColumnWidth(i, Math.max(FastNumberUtils.formatToInt(column.get("width"), 150), 150) * 50);
        }

        HSSFCellStyle cellStyle_child = workBook.createCellStyle();
        HSSFFont font_child = workBook.createFont();
        font_child.setFontHeightInPoints((short) 14);
        font_child.setBold(false);
        cellStyle_child.setFont(font_child);
//        cellStyle_child.setWrapText(true);
        cellStyle_child.setAlignment(HorizontalAlignment.CENTER);

        for (int i = 0; i < list.size(); i++) {
            FastEntity<?> data = (FastEntity<?>) list.get(i);

            HSSFRow row = sheet.createRow(i + 2);
            for (int j = 0; j < columns.size(); j++) {
                Map<String, Object> column = columns.get(j);
                HSSFCell cell = row.createCell(j);
                cell.setCellStyle(cellStyle);

                Object entityData = data.get(column.get("dataIndex"));
                String value = FastStringUtils.defaultValue(entityData, "");

                boolean isCollection = false;
                if (entityData instanceof Collection) {
                    isCollection = true;
                    Collection<?> collection = (Collection<?>) entityData;
                    if (FastBooleanUtils.formatToBoolean(column.get("files"), false)) {
                        List<String> items = new ArrayList<>();
                        for (Object o : collection) {
                            String url = FastStringUtils.defaultValue(o, "");
                            items.add(url.split("@")[0]);
                        }
                        value = FastStringUtils.join(items, " , ");
                    } else {
                        value = FastStringUtils.join(collection, " , ");
                    }
                }

                if (column.get("enum") != null && FastStringUtils.isNotEmpty(column.get("enum").toString())) {
                    IFastExtEnum enumClass = FastChar.getOverrides().singleInstance(IFastExtEnum.class, column.get("enum").toString());
                    if (enumClass != null && FastStringUtils.isNotEmpty(value)) {
                        FastEnumInfo anEnum = enumClass.getEnum(value);
                        if (anEnum != null) {
                            value = anEnum.getText();
                        }
                    }
                }
                if (FastBooleanUtils.formatToBoolean(column.get("file"), false)
                        && FastStringUtils.isNotEmpty(value)) {
                    if (!value.startsWith("http://") && !value.startsWith("https://")) {
                        value = getProjectHost() + FastStringUtils.stripStart(value, "/");
                    }
                }


                cell.setCellStyle(cellStyle_child);
                if (value.length() < 32767) {
                    if ((value.startsWith("http://") || value.startsWith("https://")) && !isCollection) {
                        cell.setCellFormula("HYPERLINK(\"" + value + "\",\"" + value + "\")");
                        HSSFCellStyle linkStyle = workBook.createCellStyle();
                        HSSFFont cellFont = workBook.createFont();
                        cellFont.setUnderline((byte) 1);
                        cellFont.setColor(HSSFColor.HSSFColorPredefined.BLUE.getIndex());
                        linkStyle.setFont(cellFont);
                        cell.setCellStyle(linkStyle);
                    } else {
                        cell.setCellValue(new HSSFRichTextString(value));
                    }
                } else {
                    cell.setCellValue("内容长度过大,无法添加到Excel中");
                }
            }
        }

        String child = "excel/" + title + "_数据" + ".xls";
        File file = new File(FastChar.getConstant().getAttachDirectory(), child);

        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        FileOutputStream fileOutputStream = new FileOutputStream(file);
        workBook.write(fileOutputStream);
        fileOutputStream.close();
        workBook.close();
        responseJson(0, "导出成功，共导出" + list.size() + "条数据！", FastFile.newInstance(file).getUrl());
    }


    /**
     * 生成实体excel导入数据的模板
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * column 列集合 json数组
     */
    @AFastLog(value = "生成【${entityDetails}】Excel模板！", type = "Excel模板")
    public void module() throws Exception {
        String entityCode = getParam("entityCode", true);

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        setRequestAttr("entityDetails", entity.getTableDetails());

        List<Map<String, Object>> columns = getParamToMapList("column");
        if (columns.size() == 0) {
            responseJson(-1, "下载失败！列信息错误！");
        }
        List<Map<String, Object>> waitRemove = new ArrayList<>();
        for (Map<String, Object> column : columns) {
            String dataIndex = column.get("dataIndex").toString();
            if (entity.isPrimary(dataIndex) && entity.isAutoincrement(dataIndex)) {
                waitRemove.add(column);
            }
            if (entity.isLink(dataIndex)) {
                FastExtColumnInfo columnInfo = entity.getColumn(dataIndex);
                if (FastType.isNumberType(columnInfo.getLinkInfo().getKeyColumn().getType())) {
                    column.put("text", column.get("text") + "编号");
                    column.put("type", "numberfield");
                }
            }
        }
        columns.removeAll(waitRemove);

        String onlyCode = FastMD5Utils.MD5To16(FastStringUtils.buildUUID());
        IFastJson iFastJsonProvider = FastChar.getOverrides().newInstance(IFastJson.class);

        ExtSystemConfigEntity entityExcelModule = new ExtSystemConfigEntity();
        entityExcelModule.setManagerId(-1);
        entityExcelModule.setConfigKey(onlyCode);
        entityExcelModule.setConfigType("EntityExcelModule");
        entityExcelModule.setConfigValue(iFastJsonProvider.toJson(columns));
        entityExcelModule.save();

        String title = getParam("title", true);


        HSSFWorkbook workBook = new HSSFWorkbook();
        HSSFSheet sheet = workBook.createSheet();
        workBook.setSheetName(0, title + "@" + "标识码禁止删除@" + entityExcelModule.getId());


        HSSFCellStyle cellStyle = workBook.createCellStyle();
        cellStyle.setAlignment(HorizontalAlignment.CENTER);
        HSSFFont font = workBook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 18);
        cellStyle.setFont(font);

//        HSSFCellStyle unLockStyle = workBook.createCellStyle();
//        unLockStyle.setLocked(false);
//        unLockStyle.setAlignment(HorizontalAlignment.CENTER);

//        HSSFCellStyle lockStyle = workBook.createCellStyle();
//        lockStyle.setLocked(true);
//        lockStyle.setAlignment(HorizontalAlignment.CENTER);
//        HSSFRow row0 = sheet.createRow(0);
//        HSSFCell cell00 = row0.createCell(0);
//        cell00.setCellValue("标识码禁止删除@" + onlyCode);
//        cell00.setCellStyle(lockStyle);
//        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, columns.size() - 1));//合并第一行的单元格
//        sheet.protectSheet("FastChar" + System.currentTimeMillis());

        HSSFRow titleRow = sheet.createRow(0);
        for (int i = 0; i < columns.size(); i++) {
            Map<String, Object> column = columns.get(i);
            String type = String.valueOf(column.get("type"));
            HSSFCell cell = titleRow.createCell(i);

            cell.setCellStyle(cellStyle);
            cell.setCellValue(String.valueOf(column.get("text")));
            if (column.containsKey("groupHeaderText") && FastStringUtils.isNotEmpty(column.get("groupHeaderText").toString())) {
                cell.setCellValue("【" + column.get("groupHeaderText") + "】" + column.get("text"));
            }
            cell.setCellType(CellType.STRING);
            if (column.containsKey("enum") && FastStringUtils.isNotEmpty(String.valueOf(column.get("enum")))) {
                IFastExtEnum enumClass = FastChar.getOverrides().singleInstance(false, IFastExtEnum.class, column.get("enum"));
                if (enumClass != null) {
                    List<String> values = new ArrayList<>();
                    for (FastEnumInfo anEnum : enumClass.getEnums()) {
                        values.add(anEnum.getText());
                    }
                    DVConstraint constraint = DVConstraint.createExplicitListConstraint(values.toArray(new String[]{}));
                    CellRangeAddressList cellRegions = new CellRangeAddressList(1, Integer.MAX_VALUE, i, i);
                    HSSFDataValidation dataValidate = new HSSFDataValidation(cellRegions, constraint);
                    dataValidate.createErrorBox("输入不合法", "请输入有效的" + column.get("text"));
                    sheet.addValidationData(dataValidate);
                }
            } else if (type.equalsIgnoreCase("numberfield")) {
                CellRangeAddressList cellRegions = new CellRangeAddressList(1, Integer.MAX_VALUE, i, i);
                DVConstraint constraint = DVConstraint.createNumericConstraint(
                        DataValidationConstraint.ValidationType.DECIMAL, DataValidationConstraint.OperatorType.BETWEEN, "0", String.valueOf(Integer.MAX_VALUE));

                HSSFDataValidation dataValidate = new HSSFDataValidation(cellRegions, constraint);
                dataValidate.createErrorBox("输入不合法", "请输入有效的" + column.get("text"));
                sheet.addValidationData(dataValidate);
            }
            sheet.setColumnWidth(i, FastNumberUtils.formatToInt(column.get("width"), 100) * 50);
//            sheet.autoSizeColumn(i, true);
        }

        String child = "excel/" + title + "_导入数据模板" + ".xls";
        File file = new File(FastChar.getConstant().getAttachDirectory(), child);

        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        FileOutputStream fileOutputStream = new FileOutputStream(file);
        workBook.write(fileOutputStream);
        fileOutputStream.close();
        workBook.close();
        responseJson(0, "下载成功！", FastFile.newInstance(file).getUrl());
    }


    /**
     * 导入实体Excel数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * file excel文件
     */
    @AFastLog(value = "导入【${entityDetails}】数据！", type = "数据导入")
    public void importData() throws Exception {
        String entityCode = getParam("entityCode", true);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        setRequestAttr("entityDetails", FastChar.getOverrides().newInstance(extEntityClass).getTableDetails());
        //公共属性值
        Map<String, Object> values = getParamToMap("value");
        if (values == null) {
            values = new HashMap<>();
        }

        List<FastEntity<?>> batchSave = new ArrayList<>();
        List<FastEntity<?>> batchUpdate = new ArrayList<>();


        FastFile<?> paramFile = getParamFile();
        FileInputStream fis = new FileInputStream(paramFile.getFile());
        Workbook workbook = WorkbookFactory.create(fis);
        int sheetCount = workbook.getNumberOfSheets();
        for (int i = 0; i < sheetCount; i++) {
            Sheet sheet = workbook.getSheetAt(i);
            String sheetName = sheet.getSheetName();
            Row titleRow = null;
            int beginRow;
            int rowCount = sheet.getPhysicalNumberOfRows();
            ExtSystemConfigEntity entityExcelModule;
            if (sheetName.contains("@标识码禁止删除@")) {
                beginRow = 1;
                String onlyCode = sheetName.split("@标识码禁止删除@")[1];
                entityExcelModule = ExtSystemConfigEntity.getInstance().selectById(onlyCode);
                titleRow = sheet.getRow(0);
            } else {
                beginRow = 2;
                Row row = sheet.getRow(0);
                if (row == null) {
                    continue;
                }
                Cell rowCell = row.getCell(0);
                if (rowCell == null) {
                    continue;
                }
                String stringCellValue = rowCell.getStringCellValue();
                if (FastStringUtils.isEmpty(stringCellValue)) {
                    continue;
                }
                String[] split = stringCellValue.split("@");
                if (split.length != 2) {
                    continue;
                }
                entityExcelModule = ExtSystemConfigEntity.getInstance().getExtConfig(-1, split[1], "EntityExcelModule");
            }

            if (entityExcelModule == null) {
                responseJson(-1, "导入失败！数据模板信息不存在，请您重新下载模板！");
                continue;
            }
            List<Map<String, Object>> columns = FastChar.getOverrides().newInstance(IFastJson.class).fromJson(entityExcelModule.getConfigValue(), new TypeToken<List<Map<String, Object>>>() {
            }.getType());

            //标题行
            for (int i1 = beginRow; i1 < rowCount; i1++) {
                Row dataRow = sheet.getRow(i1);
                if (dataRow == null) {
                    continue;
                }
                if (dataRow.getFirstCellNum() < 0) {
                    continue;
                }

                FastEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
                if (entity == null) {
                    responseJson(-1, "EntityCode不存在！" + entityCode);
                    return;
                }
                setRequestAttr("entityDetails", entity.getTableDetails());
                int cellCount = dataRow.getLastCellNum();
                for (int i2 = 0; i2 < cellCount; i2++) {
                    Cell cell = dataRow.getCell(i2);
                    Object value = getCellValue(workbook, cell);

                    if (i2 >= columns.size()) {
                        if (titleRow != null) {
                            Object cellTitle = getCellValue(workbook, titleRow.getCell(i2));
                            if (cellTitle != null) {
                                entity.put(cellTitle.toString(), value);
                            }
                            continue;
                        } else {
                            break;
                        }
                    }
                    Map<String, Object> column = columns.get(i2);
                    String type = String.valueOf(column.get("type"));
                    if (value != null && FastStringUtils.isNotEmpty(String.valueOf(value))) {
                        if (column.containsKey("enum") && FastStringUtils.isNotEmpty(String.valueOf(column.get("enum")))) {
                            Class<? extends Enum<?>> anEnumClass = FastExtEnumAccepter.ENUM_MAP.get(String.valueOf(column.get("enum")));
                            Enum<?> anEnum = FastEnumUtils.formatToEnum(anEnumClass, String.valueOf(value));
                            if (anEnum == null) {
                                continue;
                            }
                            value = anEnum.ordinal();
                        } else if (type.equalsIgnoreCase("numberfield")) {
                            value = FastNumberUtils.formatToNumber(value).floatValue();
                        }
                        entity.set(String.valueOf(column.get("dataIndex")), value);
                    }
                }
                if (entity.getTable() instanceof FastExtTableInfo) {
                    FastExtTableInfo extTableInfo = entity.getTable();
                    if (extTableInfo.isBindSessionLayer()) {
                        ExtManagerEntity managerEntity = getSession("manager");
                        entity.put(FastExtEntity.EXTRA_PARENT_LAYER_CODE, managerEntity.getLayerValue());
                    }
                }
                if (entity.isEmptyColumn()) {
                    continue;
                }
                if (entity.size() > 0) {
                    entity.putAll(values);
                    entity.clearEmpty();

                    int pCount = 0;
                    List<FastColumnInfo<?>> primaries = entity.getPrimaries();
                    for (FastColumnInfo<?> primary : primaries) {
                        if (entity.isNotEmpty(primary.getName())) {
                            pCount++;
                        }
                    }
                    if (pCount == primaries.size() && primaries.size() > 0) {
                        batchUpdate.add(entity);
                    } else {
                        batchSave.add(entity);
                    }
                }
            }
        }
        paramFile.delete();

        List<FastEntity<?>> all = new ArrayList<>();
        all.addAll(batchSave);
        all.addAll(batchUpdate);

        IFastImportDataListener iFastImportData = FastChar.getOverrides().newInstance(false, IFastImportDataListener.class);
        if (iFastImportData != null) {
            FastHandler handler = new FastHandler();
            iFastImportData.onBeforeImportData(all, handler);
            if (handler.getCode() == -1) {
                responseJson(-1, handler.getError());
            } else if (handler.getCode() == -2) {
                responseJson(0, handler.getError());
            }
        }

        if (batchSave.size() > 0) {
            List<FastEntity<?>> removed = new ArrayList<>(batchSave);
            removed.removeAll(all);
            batchSave.removeAll(removed);
            FastChar.getDb().batchSaveEntity(batchSave, 2000);
        }
        if (batchUpdate.size() > 0) {
            List<FastEntity<?>> removed = new ArrayList<>(batchUpdate);
            removed.removeAll(all);
            batchUpdate.removeAll(removed);
            FastChar.getDb().batchUpdateEntity(batchUpdate, 2000);
        }

        if (iFastImportData != null) {
            FastHandler handler = new FastHandler();
            iFastImportData.onAfterImportData(all, handler);
            if (handler.getCode() == -1) {
                responseJson(-1, handler.getError());
            } else if (handler.getCode() == -2) {
                responseJson(0, handler.getError());
            }
        }
        StringBuilder msg = new StringBuilder();
        if (batchSave.size() > 0) {
            msg.append("共导入").append(batchSave.size()).append("条数据！");
        }
        if (batchUpdate.size() > 0) {
            msg.append("共更新").append(batchUpdate.size()).append("条数据！");
        }
        if (msg.length() == 0) {
            msg.append("共导入0条数据！");
        }
        responseJson(0, "导入成功！" + msg);
    }

    private Object getCellValue(Workbook workbook, Cell cell) {
        try {
            if (workbook == null) {
                return null;
            }
            if (cell == null) {
                return null;
            }
            CellType cellType = cell.getCellType();
            if (cellType == CellType.BLANK || cellType == CellType.STRING) {
                return cell.getStringCellValue();
            } else if (cellType == CellType.NUMERIC) {
                if (DateUtil.isCellDateFormatted(cell)) {
                    return FastDateUtils.format(cell.getDateCellValue(), FastChar.getConstant().getDateFormat());
                } else {
                    return cell.getNumericCellValue();
                }
            } else if (cellType == CellType.BOOLEAN) {
                return cell.getBooleanCellValue();
            } else if (cellType == CellType.FORMULA) {
//                FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();
//                return evaluator.evaluate(cell).formatAsString();
                return cell.getStringCellValue();
            }
        } catch (Exception ignored) {
        }
        return null;
    }


    /**
     * 下载实体数据
     */
    public void downData() throws Exception {
        String entityCode = getParam("entityCode", true);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        setRequestAttr("entityDetails", entity.getTableDetails());

        boolean fromTree = getParamToBoolean("fromTree");

        Map<String, Object> where = getParamToMap("where");
        entity.putAll(where);
        if (fromTree) {
            String treeParentIdName = getParam("treeParentIdName");
            if (FastStringUtils.isNotEmpty(treeParentIdName)) {
                entity.remove(treeParentIdName);
            }
        }

        ExtManagerEntity managerEntity = getSession("manager");
        entity.pullLayer(managerEntity);

        FastPage<?> fastPage = entity.showList(-1, -1);
        List<?> list = fastPage.getList();
        if (list.size() == 0) {
            responseJson(-1, "下载失败！暂无下载的数据！");
        }

        String versionStr = "v1_0";
        FastHeadExtInfo version = FastExtConfig.getInstance().getExtInfo("version");
        if (version != null) {
            versionStr = version.getString("desc", "v1.0").toLowerCase().replace(".", "_");
        }
        File dataFile = new File(FastChar.getConstant().getAttachDirectory(), entityCode + "_" + versionStr.toUpperCase() + ".data");

        Map<String, Object> data = new HashMap<>();
        data.put("entity", extEntityClass.getName());
        data.put("data", FastChar.getJson().toJson(list));

        byte[] serialize = FastSerializeUtils.serialize(data);
        FastFileUtils.writeByteArrayToFile(dataFile, serialize);

        responseJson(0, "获取成功！", FastFile.newInstance(dataFile).getUrl());
    }


    /**
     * 上传数据
     */
    @SuppressWarnings("unchecked")
    public void loadData() throws Exception {
        String entityCode = getParam("entityCode", true);

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        List<FastColumnInfo<?>> primaries = entity.getPrimaries();
        List<String> checkAttr = new ArrayList<>();
        for (FastColumnInfo<?> primary : primaries) {
            checkAttr.add(primary.getName());
        }

        FastFile<?> paramFile = getParamFile();
        byte[] bytes = FastFileUtils.readFileToByteArray(paramFile.getFile());


        Map<String, Object> dataMap = (Map<String, Object>) FastSerializeUtils.deserialize(bytes);
        if (dataMap != null) {
            FastMapWrap fastMapWrap = FastMapWrap.newInstance(dataMap);
            if (getParamToBoolean("strict")) {
                String entityCacheName = fastMapWrap.getString("entity");
                if (!entityCacheName.equals(extEntityClass.getName())) {
                    responseJson(-1, "上传失败！数据类型不匹配！");
                }
            }
            List<FastEntity<?>> entityList = new ArrayList<>();
            String dataJson = fastMapWrap.getString("data");
            List<?> data = FastChar.getJson().fromJson(dataJson, List.class);
            for (Object datum : data) {
                FastEntity<?> entityData = FastChar.getOverrides().newInstance(extEntityClass);
                entityData.setAll((Map<String, Object>) datum);
                entityData.clearEmpty();
                if (entityData.isEmptyColumn()) {
                    continue;
                }
                entityList.add(entityData);
            }

            int[] batchSaveResult = FastChar.getDb().batchSaveEntity(entityList, Math.min(entityList.size(), 2000), checkAttr.toArray(new String[]{}));
            paramFile.delete();
            int count = 0;
            for (int i : batchSaveResult) {
                if (i > 0) {
                    count++;
                }
            }
            responseJson(0, "数据上传成功！共" + count + "条数据！");
        }
        paramFile.delete();
        responseJson(-1, "上传失败！数据文件解析失败！");
    }


    /**
     * 更新权限编号
     */
    public void updateLayer() {
        String entityCode = getParam("entityCode", true);

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtLayerHelper.LayerMap layerMap = entity.getLayerMap();
        if (layerMap != null) {
            FastExtLayerHelper.updateAllLayerValue(layerMap);
            responseJson(0, "更新成功！");
        }
        responseJson(-1, "更新失败！表格未绑定权限层级！");
    }


    /**
     * 获取图表echarts的配置json数据
     * 参数：
     * type 图表类型：0 日图表 1 月图表 2 时段图表
     */
    public void echarts() {
        String entityCode = getParam("entityCode", true);
        String columnDate = getParam("columnDate", true);

        int type = getParamToInt("type", 0);
        String beginDate = getParam("beginDate", "1912-01-01");
        String endDate = getParam("endDate", FastDateUtils.getDateString("yyyy-MM-dd"));
        String chartTitle = getParam("chartTitle", "FastChart图表");
        String chartType = getParam("chartType", "line");

        beginDate = beginDate + " 00:00:00";
        endDate = endDate + " 23:59:59";


        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        setRequestAttr("entityDetails", entity.getTableDetails());

        Map<String, Object> where = getParamToMap("where");
        entity.putAll(where);

        ExtManagerEntity managerEntity = getSession("manager");
        entity.pullLayer(managerEntity);

        List<String> seriesColumns = new ArrayList<>();

        Map<String, String> selectColumnMap = new LinkedHashMap<>();

        List<Map<String, Object>> echarts = getParamToMapList("echarts");
        for (Map<String, Object> echart : echarts) {
            String column = FastStringUtils.defaultValue(echart.get("property"), "");
            String function = FastStringUtils.defaultValue(echart.get("function"), "");
            String details = FastStringUtils.defaultValue(echart.get("details"), "");
            String nickName = column + FastStringUtils.firstCharToUpper(function);

            if (FastStringUtils.isNotEmpty(column) && FastStringUtils.isNotEmpty(function)) {
                seriesColumns.add(function + "(" + FastSql.formatAlias(column, "t") + ") as " + nickName);
                selectColumnMap.put(nickName, details);
            }
        }
        columnDate = FastSql.formatAlias(columnDate, "t");

        String dateSelect = "date_format(" + columnDate + ",'%Y-%m-%d') as reportDate ";
        if (type == 1) {//月报表
            dateSelect = "date_format(" + columnDate + ",'%Y-%m') as reportDate ";
        } else if (type == 2) {//时报表
            dateSelect = "date_format(" + columnDate + ",'%H:00') as reportDate ";
        } else if (type == 3) {//时分报表
            dateSelect = "date_format(" + columnDate + ",'%H:%i') as reportDate ";
        }

        boolean fromRecycle = entity.getBoolean("^fromRecycle");
        String showListSql = managerEntity.getString("Sql" + entityCode + "_" + fromRecycle);
        if (FastStringUtils.isEmpty(showListSql)) {
            responseJson(-1, "清除失败！请稍后重试！");
        }
        int fromIndex = showListSql.indexOf("from");
        int whereIndex = showListSql.lastIndexOf("where");
        String sqlStr = "select " + FastStringUtils.join(seriesColumns, ",") + " , " + dateSelect
                + showListSql.substring(fromIndex, whereIndex);

        sqlStr += " where 1=1 and " + columnDate + " >= '" + beginDate + "' " +
                " and " + columnDate + " <= '" + endDate + "' " +
                " group by reportDate ";

        FastSqlInfo sqlInfo = entity.toSelectSql(sqlStr);
        try {
            List<FastEChartsBean> chartBeans = new ArrayList<>();
            List<? extends FastEntity<?>> list = FastChar.getDb().setDatabase(entity.getDatabase()).select(sqlInfo.getSql(), sqlInfo.toParams());
            for (FastEntity<?> result : list) {
                for (String key : selectColumnMap.keySet()) {
                    FastEChartsBean fastChartBean = new FastEChartsBean();
                    fastChartBean.setTitle(chartTitle);
                    fastChartBean.setName(selectColumnMap.get(key));
                    fastChartBean.setDate(result.getString("reportDate"));
                    fastChartBean.setValue(result.get(key));
                    if (chartType.equalsIgnoreCase("stack")) {
                        fastChartBean.setType("bar");
                        fastChartBean.setStack("true");
                    } else {
                        fastChartBean.setType(chartType);
                    }
                    chartBeans.add(fastChartBean);
                }
            }
            responseJson(0, "获取成功！", FastEChartsBean.toJsonData(chartTitle, chartBeans));
        } catch (Exception e) {
            e.printStackTrace();
        }

    }


}
