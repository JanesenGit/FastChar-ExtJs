package com.fastchar.extjs.action;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.core.FastFile;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.annotation.AFastLog;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.extjs.core.enums.FastEnumInfo;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.extjs.entity.ExtSystemConfigEntity;
import com.fastchar.extjs.interfaces.IFastExtEnum;
import com.fastchar.interfaces.IFastJson;
import com.fastchar.utils.*;
import com.google.gson.reflect.TypeToken;
import org.apache.poi.hssf.usermodel.*;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

@SuppressWarnings({"unchecked"})
@AFastSession
public class ExtEntityAction extends FastAction {

    @Override
    protected String getRoute() {
        return "/entity";
    }

    /**
     * 获取数据
     *
     * @return
     */
    public FastPage list() {
        String entityCode = getParam("entityCode", true);
        int page = getParamToInt("page", 1);
        int pageSize = getParamToInt("limit", 10);
        Class<? extends FastExtEntity> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return null;
        }
        FastExtEntity entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return null;
        }

        Map<String, Object> where = getParamToMap("where");
        entity.putAll(where);


        Map<String, Object> index = getParamToMap("indexSort");

        String sort = getParam("sort");
        if (FastStringUtils.isNotEmpty(sort)) {
            List<Map<String, String>> sortList = FastChar.getJson().fromJson(sort,
                    new TypeToken<List<Map<String, String>>>() {
                    }.getType());
            for (Map<String, String> map : sortList) {
                if (map.get("property").startsWith("@")) continue;
                entity.put(FastNumberUtils.formatToInt(index.get(map.get("property"))) + map.get("property") + ":sort", map.get("direction"));
            }
        }
        if (entity.getLayerColumn() != null) {
            ExtManagerEntity managerEntity = getSession("manager");
            return entity.showLayerList(managerEntity, page, pageSize);
        }
        return entity.showList(page, pageSize);
    }


    /**
     * 保存数据
     */
    @AFastLog(value = "页面【${menu}】进行添加数据！", type = "添加数据")
    public void save() {
        String entityCode = getParam("entityCode", true);
        setRequestAttr("menu", getParam("menu"));
        Class<? extends FastExtEntity> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastEntity entity = getParamToEntity("data", extEntityClass);
        if (entity.getTable() instanceof FastExtTableInfo) {
            FastExtTableInfo extTableInfo = (FastExtTableInfo) entity.getTable();
            if (extTableInfo.isBindSessionLayer()) {
                ExtManagerEntity managerEntity = getSession("manager");
                entity.put("parentLayerCode", managerEntity.getLayerValue());
            }
        }
        entity.put("fromWeb", true);
        String[] checks = getParamToArray("check");
        if (entity.save(checks)) {
            responseJson(0, "添加成功！");
        } else {
            responseJson(-1, "添加失败！" + entity.getError());
        }
    }


    /**
     * 删除数据
     */
    @AFastLog(value = "页面【${menu}】进行删除数据！", type = "删除数据")
    public void delete() throws Exception {
        String entityCode = getParam("entityCode", true);
        setRequestAttr("menu", getParam("menu"));
        Class<? extends FastExtEntity> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        List<? extends FastExtEntity> entity = getParamToEntityList("data", extEntityClass);
        for (FastEntity fastEntity : entity) {
            fastEntity.put("fromWeb", true);
            fastEntity.delete();
        }
        responseJson(0, "删除成功！", entity);
    }


    /**
     * 修改数据
     */
    @AFastLog(value = "页面【${menu}】进行修改数据！", type = "修改数据")
    public void update() throws Exception {
        String entityCode = getParam("entityCode", true);
        setRequestAttr("menu", getParam("menu"));
        Class<? extends FastExtEntity> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        List<? extends FastExtEntity> entity = getParamToEntityList("data", extEntityClass);
        for (FastEntity fastEntity : entity) {
            fastEntity.put("fromWeb", true);
            fastEntity.update();
        }
        responseJson(0, "修改成功！", entity);
    }


    /**
     * 计算
     */
    public void compute() throws Exception {
        String entityCode = getParam("entityCode", true);
        Class<? extends FastExtEntity> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity entity = FastClassUtils.newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        Map<String, Object> where = getParamToMap("where");
        entity.putAll(where);

        String type = getParam("type", true);
        String field = getParam("field", true);
        String sqlStr = "select " + type + "(" + field + ") as result from " + entity.getTableName();

        FastSqlInfo sqlInfo = entity.toSelectSql(sqlStr);
        FastEntity fastEntity = FastChar.getDb().selectFirst(sqlInfo.getSql(), sqlInfo.toParams());
        if (fastEntity != null) {
            responseJson(0, "计算成功！", fastEntity.getFloat("result", 4));
        } else {
            responseJson(-1, "计算失败！");
        }
    }

    /**
     * 导出数据excel
     */
    @AFastLog(value = "导出了【${entityDetails}】数据！", type = "数据导出")
    public void export() throws Exception {
        String entityCode = getParam("entityCode", true);
        Class<? extends FastExtEntity> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        setRequestAttr("entityDetails", entity.getTableDetails());

        IFastJson iFastJsonProvider = FastChar.getOverrides().newInstance(IFastJson.class);
        Map<String, Object> where = getParamToMap("where");
        entity.putAll(where);

        Map<String, Object> index = getParamToMap("indexSort");

        String sort = getParam("sort");
        if (FastStringUtils.isNotEmpty(sort)) {
            List<Map<String, String>> sortList = iFastJsonProvider.fromJson(sort,
                    new TypeToken<List<Map<String, String>>>() {
                    }.getType());
            for (Map<String, String> map : sortList) {
                if (map.get("property").startsWith("@")) continue;
                entity.put(FastNumberUtils.formatToInt(index.get(map.get("property"))) + map.get("property") + ":sort", map.get("direction"));
            }
        }

        List<Map<String, Object>> columns = getParamToMapList("column");
        String title = getParam("title", true);

        FastPage<FastEntity> fastPage = entity.showList(-1, -1);
        List<FastEntity> list = fastPage.getList();

        //创建一个新的Excel
        HSSFWorkbook workBook = new HSSFWorkbook();
        //创建sheet页
        HSSFSheet sheet = workBook.createSheet();
        //sheet页名称
        workBook.setSheetName(0, title);


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
            sheet.setColumnWidth(i, FastNumberUtils.formatToInt(column.get("width"), 100) * 30);
        }

        HSSFCellStyle cellStyle_child = workBook.createCellStyle();
        HSSFFont font_child = workBook.createFont();
        font_child.setFontHeightInPoints((short) 14);
        font_child.setBold(false);
        cellStyle_child.setFont(font_child);
        cellStyle_child.setAlignment(HorizontalAlignment.CENTER);

        for (int i = 0; i < list.size(); i++) {
            FastEntity data = list.get(i);

            HSSFRow row = sheet.createRow(i + 2);
            for (int j = 0; j < columns.size(); j++) {
                Map<String, Object> column = columns.get(j);
                HSSFCell cell = row.createCell(j);
                cell.setCellStyle(cellStyle);

                String value = FastStringUtils.defaultValue(data.get(column.get("dataIndex")), "");

                if (column.get("enum") != null && FastStringUtils.isNotEmpty(column.get("enum").toString())) {
                    IFastExtEnum enumClass = FastChar.getOverrides().singleInstance(IFastExtEnum.class, column.get("enum").toString());
                    if (enumClass != null) {
                        FastEnumInfo anEnum = enumClass.getEnum(FastNumberUtils.formatToInt(value));
                        if (anEnum != null) {
                            value = anEnum.getText();
                        }
                    }
                }
                if (value.length() < 32767) {
                    cell.setCellValue(value);
                } else {
                    cell.setCellValue("字符长度过大,无法添加到Excel中");
                }
                cell.setCellStyle(cellStyle_child);
            }
        }

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmSSS");
        String child = "excel/" + dateFormat.format(new Date()) + ".xls";
        File file = new File(FastChar.getConstant().getAttachDirectory(), child);

        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        FileOutputStream fileOutputStream = new FileOutputStream(file);
        workBook.write(fileOutputStream);
        fileOutputStream.close();
        workBook.close();
        responseJson(0, "导出成功！", child);
    }


    /**
     * 生成excel导入模板
     */
    @AFastLog(value = "生成【${entityDetails}】Excel模板！", type = "Excel模板")
    public void module() throws Exception {
        String entityCode = getParam("entityCode", true);

        Class<? extends FastExtEntity> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        setRequestAttr("entityDetails", entity.getTableDetails());

        List<Map<String, Object>> columns = getParamToMapList("column");

        String onlyCode = FastMD5Utils.MD5(entityCode + FastChar.getJson().toJson(columns));
        IFastJson iFastJsonProvider = FastChar.getOverrides().newInstance(IFastJson.class);

        ExtSystemConfigEntity entityExcelModule = new ExtSystemConfigEntity();
        entityExcelModule.setManagerId(-1);
        entityExcelModule.setConfigKey(onlyCode);
        entityExcelModule.setConfigType("EntityExcelModule");
        entityExcelModule.setConfigValue(iFastJsonProvider.toJson(columns));
        entityExcelModule.save();

        String title = getParam("title", true);

        Map<String, IFastExtEnum> enumMap = new HashMap<>();

        int sheetIndex = 0;
        HSSFWorkbook workBook = new HSSFWorkbook();
        HSSFSheet sheet = workBook.createSheet();
        workBook.setSheetName(sheetIndex++, title);

        HSSFCellStyle cellStyle = workBook.createCellStyle();
        cellStyle.setAlignment(HorizontalAlignment.CENTER);
        cellStyle.setLocked(true);
        HSSFFont font = workBook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 18);
        cellStyle.setFont(font);

        HSSFCellStyle linkStyle = workBook.createCellStyle();
        linkStyle.setAlignment(HorizontalAlignment.CENTER);
        HSSFFont linkFont = workBook.createFont();
        linkFont.setBold(true);
        linkFont.setFontHeightInPoints((short) 18);
        linkFont.setUnderline((byte) 1);
        linkFont.setColor(HSSFColor.HSSFColorPredefined.BLUE.getIndex());
        linkStyle.setFont(linkFont);


        HSSFCellStyle unLockStyle = workBook.createCellStyle();
        unLockStyle.setLocked(false);
        unLockStyle.setAlignment(HorizontalAlignment.CENTER);

        HSSFCellStyle lockStyle = workBook.createCellStyle();
        lockStyle.setLocked(true);
        lockStyle.setAlignment(HorizontalAlignment.CENTER);
        HSSFRow row0 = sheet.createRow(0);
        HSSFCell cell00 = row0.createCell(0);
        cell00.setCellValue("标识码禁止删除@" + onlyCode);
        cell00.setCellStyle(lockStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, columns.size()));//合并第一行的单元格
        sheet.protectSheet("123456");

        HSSFRow titleRow = sheet.createRow(1);
        for (int i = 0; i < columns.size(); i++) {
            Map<String, Object> column = columns.get(i);
            HSSFCell cell = titleRow.createCell(i);
            if (column.containsKey("enum") && FastStringUtils.isNotEmpty(String.valueOf(column.get("enum")))) {
                String enumTitle = column.get("text") + "ID号";
                IFastExtEnum enumClass = FastChar.getOverrides().singleInstance(IFastExtEnum.class, column.get("enum"));
                enumMap.put(enumTitle, enumClass);
                cell.setCellStyle(linkStyle);
                cell.setCellType(CellType.NUMERIC);
                cell.setCellFormula("HYPERLINK(\"#" + enumTitle + "!A1\",\"" + enumTitle + "\")");
            } else {
                cell.setCellStyle(cellStyle);
                cell.setCellValue(String.valueOf(column.get("text")));
            }
            sheet.setColumnWidth(i, FastNumberUtils.formatToInt(column.get("width"), 100) * 30);
            sheet.setDefaultColumnStyle(i, unLockStyle);
        }


        HSSFCellStyle valueStyle = workBook.createCellStyle();
        valueStyle.setAlignment(HorizontalAlignment.CENTER);
        HSSFFont valueFont = workBook.createFont();
        valueFont.setFontHeightInPoints((short) 16);
        valueStyle.setFont(valueFont);
        for (String key : enumMap.keySet()) {
            IFastExtEnum iFastExtEnum = enumMap.get(key);
            HSSFSheet sheetEnum = workBook.createSheet();
            workBook.setSheetName(sheetIndex++, key);

            sheetEnum.setColumnWidth(0, 6000);
            sheetEnum.setColumnWidth(1, 6000);

            int enumRowIndex = 0;
            HSSFRow enumTitleRow = sheetEnum.createRow(enumRowIndex++);
            HSSFCell cell0 = enumTitleRow.createCell(0);
            cell0.setCellStyle(cellStyle);
            cell0.setCellValue(key);

            HSSFCell cell1 = enumTitleRow.createCell(1);
            cell1.setCellStyle(cellStyle);
            cell1.setCellValue("介绍");
            for (FastEnumInfo anEnum : iFastExtEnum.getEnums()) {
                HSSFRow enumRow = sheetEnum.createRow(enumRowIndex++);
                HSSFCell enumCell0 = enumRow.createCell(0);
                enumCell0.setCellStyle(valueStyle);
                enumCell0.setCellValue(anEnum.getId());
                HSSFCell enumCell1 = enumRow.createCell(1);
                enumCell1.setCellStyle(valueStyle);
                enumCell1.setCellValue(anEnum.getText());
            }
            sheetEnum.protectSheet(new Date().toString());
        }

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmSSS");
        String child = "excel/module" + dateFormat.format(new Date()) + ".xls";
        File file = new File(FastChar.getConstant().getAttachDirectory(), child);

        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        FileOutputStream fileOutputStream = new FileOutputStream(file);
        workBook.write(fileOutputStream);
        fileOutputStream.close();
        workBook.close();
        responseJson(0, "下载成功！", child);
    }


    /**
     * 导入数据
     */
    @AFastLog(value = "导入了【${entityDetails}】数据！", type = "数据导入")
    public void importData() throws Exception {
        String entityCode = getParam("entityCode", true);
        Class<? extends FastExtEntity> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }


        List<FastEntity> entities = new ArrayList<>();

        FastFile paramFile = getParamFile();
        FileInputStream fis = new FileInputStream(paramFile.getFile());
        Workbook workbook = WorkbookFactory.create(fis);
        int sheetCount = workbook.getNumberOfSheets();
        for (int i = 0; i < sheetCount; i++) {
            Sheet sheet = workbook.getSheetAt(i);
            int rowCount = sheet.getPhysicalNumberOfRows();
            String stringCellValue = sheet.getRow(0).getCell(0).getStringCellValue();
            String[] split = stringCellValue.split("@");
            if (split.length != 2) {
                continue;
            }
            String onlyCode = split[1];
            ExtSystemConfigEntity entityExcelModule = ExtSystemConfigEntity.getInstance().getExtConfig(-1, onlyCode, "EntityExcelModule");
            if (entityExcelModule == null) {
                continue;
            }
            List<Map<String, Object>> columns = FastChar.getOverrides().newInstance(IFastJson.class).fromJson(entityExcelModule.getConfigValue(), new TypeToken<List<Map<String, Object>>>() {
            }.getType());

            for (int i1 = 2; i1 < rowCount; i1++) {
                Row dataRow = sheet.getRow(i1);

                FastEntity entity = FastChar.getOverrides().newInstance(extEntityClass);
                if (entity == null) {
                    responseJson(-1, "EntityCode不存在！" + entityCode);
                    return;
                }
                setRequestAttr("entityDetails", entity.getTableDetails());
                int cellCount = dataRow.getPhysicalNumberOfCells();
                for (int i2 = 0; i2 < cellCount; i2++) {
                    if (i2 > columns.size()) {
                        break;
                    }
                    Cell cell = dataRow.getCell(i2);
                    Map<String, Object> column = columns.get(i2);
                    entity.set(String.valueOf(column.get("dataIndex")), getCellValue(workbook, cell));
                }
                entities.add(entity);
            }
        }
        FastChar.getDb().batchSaveEntity(entities, 500);
        responseJson(0, "导入成功！共导入" + entities.size() + "条数据！");
    }

    private Object getCellValue(Workbook workbook, Cell cell) {
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
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();
            return evaluator.evaluate(cell).getStringValue();
        }
        return null;
    }
}
