package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.core.FastFile;
import com.fastchar.core.FastHandler;
import com.fastchar.database.FastPage;
import com.fastchar.database.FastType;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.extjs.core.enums.FastEnumInfo;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.info.ExtExcelModelInfo;
import com.fastchar.extjs.interfaces.IFastImportDataListener;
import com.fastchar.extjs.utils.POIHelper;
import com.fastchar.extjs.utils.POIUtils;
import com.fastchar.utils.*;
import com.google.gson.reflect.TypeToken;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.*;
import java.util.*;

public class FastExtDataHelper {

    /**
     * 导入实体数据
     *
     * @param param 导入参数
     * @return FastHandler 导入结果
     */
    public FastHandler importData(ImportDataParam param) throws Exception {
        FastHandler handler = new FastHandler();

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(param.getEntityCode());
        if (extEntityClass == null) {
            handler.setError("EntityCode不存在！" + param.getEntityCode());
            handler.setCode(-1);
            return handler;
        }
        handler.put("entityDetails", FastChar.getOverrides().newInstance(extEntityClass).getTableDetails());

        FileInputStream inputStream = new FileInputStream(param.getExcelFile());
        Workbook workbook = WorkbookFactory.create(inputStream);

        ExtExcelModelInfo extExcelModelInfo = null;
        Sheet extExcelModelInfoSheet = workbook.getSheet(ExtExcelModelInfo.class.getSimpleName());
        if (extExcelModelInfoSheet == null) {
            extExcelModelInfoSheet = workbook.getSheet("模板配置");
        }
        if (extExcelModelInfoSheet != null) {
            String configInfo = extExcelModelInfoSheet.getRow(0).getCell(0).getStringCellValue();
            extExcelModelInfo = FastChar.getJson().fromJson(configInfo, ExtExcelModelInfo.class);
        }


        ImportDataHolder dataHolder = new ImportDataHolder();

        int sheetCount = workbook.getNumberOfSheets();
        for (int i = 0; i < sheetCount; i++) {
            if (workbook.isSheetHidden(i)) {
                continue;
            }
            Sheet sheet = workbook.getSheetAt(i);

            String sheetName = sheet.getSheetName();
            if (sheetName.equalsIgnoreCase(ExtExcelModelInfo.class.getSimpleName())) {
                continue;
            }

            int titleRowNum = 0;
            int beginRowNum = 1;
            int rowCount = sheet.getPhysicalNumberOfRows();
            List<Map<String, Object>> columns = new ArrayList<>();

            if (extExcelModelInfo != null) {
                titleRowNum = extExcelModelInfo.getTitleRowNum();
                beginRowNum = extExcelModelInfo.getBeginRowNum() + 1;
                columns = extExcelModelInfo.getColumns();
            }

            Row titleRow = sheet.getRow(titleRowNum);
            //标题行
            for (int i1 = beginRowNum; i1 < rowCount; i1++) {
                Row dataRow = sheet.getRow(i1);
                if (dataRow == null) {
                    continue;
                }
                if (dataRow.getFirstCellNum() < 0) {
                    continue;
                }

                FastEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
                if (entity == null) {
                    handler.setError("EntityCode不存在！" + param.getEntityCode());
                    handler.setCode(-1);
                    return handler;
                }
                handler.put("entityDetails", entity.getTableDetails());

                int cellCount = dataRow.getLastCellNum();
                for (int i2 = 0; i2 < cellCount; i2++) {
                    Cell cell = dataRow.getCell(i2);
                    Object value = POIUtils.getCellValue(workbook, cell);

                    if (i2 >= columns.size()) {
                        if (titleRow != null) {
                            Object cellTitle = POIUtils.getCellValue(workbook, titleRow.getCell(i2));
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
                            FastEnumInfo anEnum = FastExtEnumHelper.getEnum(String.valueOf(column.get("enum")), String.valueOf(value));
                            if (anEnum == null) {
                                continue;
                            }
                            value = anEnum.getId();
                        } else if (type.equalsIgnoreCase("numberfield")) {
                            value = FastNumberUtils.formatToNumber(value).doubleValue();
                        }
                        entity.put(String.valueOf(column.get("dataIndex")), value);
                    }
                }
                if (FastStringUtils.isNotEmpty(param.getEntityParentLayerValue())) {
                    entity.put(FastExtEntity.EXTRA_PARENT_LAYER_CODE, param.getEntityParentLayerValue());
                }

                if (entity.getTable() instanceof FastExtTableInfo) {
                    FastExtTableInfo extTableInfo = entity.getTable();
                    if (extTableInfo.isBindSessionLayer()) {
                        entity.put(FastExtEntity.EXTRA_PARENT_LAYER_CODE, param.getSessionEntityLayerValue());
                    }
                }

                if (entity.isEmptyColumn()) {
                    continue;
                }
                if (!entity.isEmpty()) {
                    entity.putAll(param.getEntityMoreAttrValues());
                    entity.clearEmpty();

                    int pCount = 0;
                    Collection<FastColumnInfo<?>> primaries = entity.getPrimaries();
                    for (FastColumnInfo<?> primary : primaries) {
                        if (entity.isNotEmpty(primary.getName())) {
                            pCount++;
                        }
                    }
                    entity.put("__entityId", FastMD5Utils.MD5To16(FastStringUtils.buildUUID()));
                    if (pCount == primaries.size() && !primaries.isEmpty()) {
                        dataHolder.addUpdateEntity(entity);
                    } else {
                        dataHolder.addSaveEntity(entity);
                    }
                }

                FastHandler commitDataHandler = dataHolder.commitData(false);
                if (commitDataHandler.getCode() != 0) {
                    handler.setError(commitDataHandler.getError());
                    handler.setCode(commitDataHandler.getCode());
                    return handler;
                }
            }
        }


        FastHandler commitDataHandler = dataHolder.commitData(true);
        if (commitDataHandler.getCode() != 0) {
            handler.setError(commitDataHandler.getError());
            handler.setCode(commitDataHandler.getCode());
            return handler;
        }

        inputStream.close();
        workbook.close();

        handler.setCode(0);
        handler.setError("导入成功！" + dataHolder.getCommitMessage());
        return handler;
    }


    /**
     * 创建导入数据的excel模板文件
     *
     * @param title      模板的标题
     * @param entityCode 实体编号
     * @param columns    实体列信息
     */
    public FastHandler buildModule(String title, String entityCode, List<Map<String, Object>> columns) throws Exception {
        FastHandler handler = new FastHandler();

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            handler.setCode(-1);
            handler.setError("EntityCode不存在！" + entityCode);
            return handler;
        }

        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            handler.setCode(-1);
            handler.setError("EntityCode不存在！" + entityCode);
            return handler;
        }
        handler.put("entityDetails", entity.getTableDetails());

        if (columns.isEmpty()) {
            handler.setCode(-1);
            handler.setError("构建失败！列信息错误！");
            return handler;
        }

        columns.sort((o1, o2) -> {
            int index1 = FastNumberUtils.formatToInt(o1.get("index"));
            int index2 = FastNumberUtils.formatToInt(o2.get("index"));
            return Integer.compare(index1, index2);
        });


        List<Map<String, Object>> waitRemove = new ArrayList<>();
        for (Map<String, Object> column : columns) {
            String dataIndex = column.get("dataIndex").toString();
            if (entity.isPrimary(dataIndex) && entity.isAutoincrement(dataIndex)) {
                waitRemove.add(column);
            }
            if (entity.isLink(dataIndex)) {
                FastExtColumnInfo columnInfo = entity.getColumn(dataIndex);
                if (FastType.isNumberType(columnInfo.getLinkInfo().getKeyColumn().getType())) {
                    column.put("text", column.get("text") + "ID");
                    column.put("type", "textfield");
                }
            }
        }
        columns.removeAll(waitRemove);

        Map<Integer, Integer> columnValueMap = new HashMap<>();


        Workbook workBook = new XSSFWorkbook();
        POIHelper poiHelper = new POIHelper(workBook);
        Sheet sheet = workBook.createSheet();

        //设置默认的行高
        sheet.setDefaultRowHeight((short) (30 * 20));
        sheet.setDefaultRowHeightInPoints((short) 30);

        workBook.setSheetName(0, title);


        CellStyle titleCellStyle = poiHelper.getCellStyle("title");
        titleCellStyle.setAlignment(HorizontalAlignment.CENTER);
        titleCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        Font titleFont = poiHelper.getFont("title");
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleCellStyle.setFont(titleFont);

        int[] rowIndex = new int[]{0};

        Row tableNameRow = sheet.createRow(rowIndex[0]++);

        Cell tableNameCell = tableNameRow.createCell(0);
        tableNameCell.setCellStyle(titleCellStyle);
        tableNameCell.setCellValue(title);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, columns.size() - 1));//合并第一行的单元格

        createTitleRow(titleCellStyle, rowIndex, sheet, columns);

        DataFormat format = workBook.createDataFormat();

        CellStyle defaultCellStyle = poiHelper.getCellStyle("default");
        defaultCellStyle.cloneStyleFrom(titleCellStyle);
        Font valueFont = poiHelper.getFont("value");
        valueFont.setBold(false);
        valueFont.setFontHeightInPoints((short) 14);
        defaultCellStyle.setFont(valueFont);
        defaultCellStyle.setDataFormat(format.getFormat("text"));

        Row titleRow = sheet.getRow(rowIndex[0] - 1);

        sheet.createFreezePane(0, sheet.getPhysicalNumberOfRows(), 0, sheet.getPhysicalNumberOfRows());

        for (int i = 0; i < columns.size(); i++) {
            Map<String, Object> column = columns.get(i);

            CellStyle columnStyle = POIUtils.getColumnStyle(sheet, column, defaultCellStyle, poiHelper, titleRow.getRowNum(), i);
            Cell cell = titleRow.getCell(i);

            if (column.containsKey("comment")) {
                POIUtils.setCellComment(sheet, cell, String.valueOf(column.get("comment")));
            }
            sheet.setDefaultColumnStyle(cell.getColumnIndex(), columnStyle);

            if (!columnValueMap.containsKey(i)) {
                columnValueMap.put(i, 0);
            }
            columnValueMap.put(i, cell.getStringCellValue().getBytes().length);

        }


        for (Map.Entry<Integer, Integer> integerIntegerEntry : columnValueMap.entrySet()) {
            int width = Math.min((integerIntegerEntry.getValue() + 5) * 256, 155 * 256);
            sheet.setColumnWidth(integerIntegerEntry.getKey(), width);
        }

        ExtExcelModelInfo extExcelModelInfo = new ExtExcelModelInfo();
        extExcelModelInfo.setTitleRowNum(titleRow.getRowNum());
        extExcelModelInfo.setBeginRowNum(sheet.getLastRowNum());
        extExcelModelInfo.setColumns(columns);


        Sheet extExcelModelInfoSheet = workBook.createSheet("模板配置");
        Cell dataCell = extExcelModelInfoSheet.createRow(0).createCell(0);
        dataCell.setCellValue(FastChar.getJson().toJson(extExcelModelInfo));
        workBook.setSheetHidden(workBook.getSheetIndex(extExcelModelInfoSheet), true);


        String child = "excel/" + title + "_导入数据模板" + ".xlsx";
        File file = new File(FastChar.getConstant().getAttachDirectory(), child);

        if (!file.getParentFile().exists()) {
            if (!file.getParentFile().mkdirs()) {
                handler.setError("文件创建失败！" + file.getParentFile());
                handler.setCode(-1);
                return handler;
            }
        }
        FileOutputStream fileOutputStream = new FileOutputStream(file);
        workBook.write(fileOutputStream);
        fileOutputStream.close();
        workBook.close();

        handler.setCode(0);
        handler.setError("构建成功！");
        handler.put("url", FastFile.newInstance(file).getUrl());

        return handler;
    }


    /**
     * 导出实体数据
     *
     * @param param 导出参数
     * @return FastHandler 导入结果
     */
    public FastHandler exportData(ExportDataParam param) throws Exception {
        FastHandler handler = new FastHandler();


        param.getColumns().sort((o1, o2) -> {
            int index1 = FastNumberUtils.formatToInt(o1.get("index"));
            int index2 = FastNumberUtils.formatToInt(o2.get("index"));
            return Integer.compare(index1, index2);
        });


        String entityCode = param.getEntityCode();

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            handler.setCode(-1);
            handler.setError("EntityCode不存在！" + entityCode);
            return handler;
        }
        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            handler.setCode(-1);
            handler.setError("EntityCode不存在！" + entityCode);
            return handler;
        }
        handler.put("entityDetails", entity.getTableDetails());

        entity.putAll(param.getWhere());

        entity.pullLayer(param.getSession());

        if (FastStringUtils.isNotEmpty(param.getSort())) {
            List<Map<String, String>> sortList = FastChar.getJson().fromJson(param.getSort(),
                    new TypeToken<List<Map<String, String>>>() {
                    }.getType());
            for (Map<String, String> map : sortList) {
                if (map.get("property").startsWith("@")) {
                    continue;
                }
                entity.put(FastNumberUtils.formatToInt(param.getIndex().get(map.get("property"))) + map.get("property") + ":sort", map.get("direction"));
            }
        }


        if (param.isExportIndex()) {
            Map<String, Object> indexColumn = new HashMap<>();
            indexColumn.put("text", "序号");
            indexColumn.put("valueIndex", "__index");
            param.getColumns().add(0, indexColumn);
        }

        //创建一个新的Excel
        Workbook workBook = new SXSSFWorkbook();
        POIHelper poiHelper = new POIHelper(workBook);

        //创建sheet页
        Sheet sheet = workBook.createSheet();
        //sheet页名称
        workBook.setSheetName(0, param.getTitle().replace("/", "_"));

        //设置默认的行高
        sheet.setDefaultRowHeight((short) (30 * 20));
        sheet.setDefaultRowHeightInPoints((short) 30);

        CellStyle titleCellStyle = poiHelper.getCellStyle("title");
        titleCellStyle.setAlignment(HorizontalAlignment.CENTER);
        titleCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        Font titleFont = poiHelper.getFont("title");
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleCellStyle.setFont(titleFont);

        int[] rowIndex = new int[]{0};
        Row tableNameRow = sheet.createRow(rowIndex[0]++);
        Cell tableNameCell = tableNameRow.createCell(0);
        tableNameCell.setCellStyle(titleCellStyle);
        tableNameCell.setCellValue(param.getTitle());
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, param.getColumns().size() - 1));//合并第一行的单元格

        createTitleRow(titleCellStyle, rowIndex, sheet, param.getColumns());

        sheet.createFreezePane(0, sheet.getPhysicalNumberOfRows(), 0, sheet.getPhysicalNumberOfRows());

        int titleRow = sheet.getLastRowNum();
        Map<Integer, Integer> columnValueMap = new HashMap<>();

        CellStyle defaultCellStyle = poiHelper.getCellStyle("default");
        defaultCellStyle.cloneStyleFrom(titleCellStyle);
        Font valueFont = poiHelper.getFont("cell");
        valueFont.setBold(false);
        valueFont.setFontHeightInPoints((short) 14);
        defaultCellStyle.setFont(valueFont);

        for (int i = 0; i < param.getColumns().size(); i++) {
            if (!columnValueMap.containsKey(i)) {
                columnValueMap.put(i, 0);
            }

            Map<String, Object> column = param.getColumns().get(i);
            CellStyle columnStyle = POIUtils.getColumnStyle(sheet, column, defaultCellStyle, poiHelper, titleRow, i);

            //此处设置默认样式，属于没有值的单元格样式，如果有值需要单独设置样式
            sheet.setDefaultColumnStyle(i, columnStyle);

            Row row = sheet.getRow(sheet.getLastRowNum());
            if (row == null) {
                continue;
            }
            if (column.containsKey("comment")) {
                POIUtils.setCellComment(sheet, row.getCell(i), String.valueOf(column.get("comment")));
            }
            columnValueMap.put(i, Math.max(columnValueMap.get(i), row.getCell(i).getStringCellValue().getBytes().length));
        }

        int page = 0;
        int pageSize = FastExtConfig.getInstance().getExportPageSize();
        int totalPage;
        int dataRealIndex = 0;
        int totalRow = 0;
        do {
            FastPage<?> fastPage = entity.showList(page + 1, pageSize);
            List<?> list = fastPage.getList();
            if (list.isEmpty()) {
                handler.setCode(-1);
                handler.setError("暂无数据！");
                return handler;
            }

            for (Object object : list) {
                FastEntity<?> data = (FastEntity<?>) object;
                data.put("__index", dataRealIndex + 1);

                Row row = sheet.createRow(dataRealIndex + rowIndex[0]);
                for (int j = 0; j < param.getColumns().size(); j++) {
                    Map<String, Object> column = param.getColumns().get(j);
                    Object entityData = data.get(FastStringUtils.defaultValue(column.get("valueIndex"), "none"));
                    if (entityData == null) {
                        continue;
                    }

                    Cell cell = row.createCell(j);
                    cell.setCellStyle(defaultCellStyle);
                    String value = FastStringUtils.defaultValue(entityData, "");
                    String type = String.valueOf(column.get("type"));
                    boolean excelValueFormat = FastBooleanUtils.formatToBoolean(column.get("excelValueFormat"), true);

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
                        if (FastStringUtils.isNotEmpty(value)) {
                            FastEnumInfo anEnum = FastExtEnumHelper.getEnum(String.valueOf(column.get("enum")), value);
                            if (anEnum != null) {
                                value = FastStringUtils.defaultValue(anEnum.getText(), value);
                            }
                        }
                    }

                    if (FastBooleanUtils.formatToBoolean(column.get("file"), false)
                            && FastStringUtils.isNotEmpty(value)) {
                        if (!value.startsWith("http://") && !value.startsWith("https://")) {
                            value = param.getProjectHost() + FastStringUtils.stripStart(value, "/");
                        }
                    }


                    if (value.length() < 32767) {
                        if ((value.startsWith("http://") || value.startsWith("https://")) && !isCollection) {
                            cell.setCellFormula("HYPERLINK(\"" + value + "\",\"" + value + "\")");
                            Font linkFont = poiHelper.getFont("link");
                            linkFont.setFontHeightInPoints((short) 14);
                            linkFont.setUnderline((byte) 1);
                            linkFont.setColor(HSSFColor.HSSFColorPredefined.BLUE.getIndex());

                            CellStyle columnCellStyle = poiHelper.getCellStyle("link");
                            columnCellStyle.cloneStyleFrom(defaultCellStyle);
                            columnCellStyle.setFont(linkFont);
                            cell.setCellStyle(columnCellStyle);
                        } else {
                            if (type.equalsIgnoreCase("numberfield") && excelValueFormat) {
                                cell.setCellValue(FastNumberUtils.formatToDouble(value));
                            } else {
                                //此处取消类型数据格式化，避免数据丢失
                                cell.setCellValue(new XSSFRichTextString(value));
                            }

                        }
                        columnValueMap.put(cell.getColumnIndex(), Math.max(columnValueMap.get(cell.getColumnIndex()), value.getBytes().length));
                    } else {
                        cell.setCellValue("内容长度过大,无法添加到Excel中");
                    }
                }
                dataRealIndex++;
                totalRow++;
            }

            page = fastPage.getPage();
            totalPage = fastPage.getTotalPage();
            fastPage.release();
        } while (page != totalPage);


        for (Map.Entry<Integer, Integer> integerIntegerEntry : columnValueMap.entrySet()) {
            int width = Math.min((integerIntegerEntry.getValue() + 5) * 256, 155 * 256);
            sheet.setColumnWidth(integerIntegerEntry.getKey(), width);
        }

        ExtExcelModelInfo extExcelModelInfo = new ExtExcelModelInfo();
        extExcelModelInfo.setTitleRowNum(titleRow);
        extExcelModelInfo.setBeginRowNum(titleRow);
        extExcelModelInfo.setColumns(param.getColumns());

        Sheet extExcelModelInfoSheet = workBook.createSheet("模板配置");
        Cell dataCell = extExcelModelInfoSheet.createRow(0).createCell(0);
        dataCell.setCellValue(FastChar.getJson().toJson(extExcelModelInfo));
        extExcelModelInfoSheet.protectSheet(FastStringUtils.buildUUID());
        workBook.setSheetHidden(workBook.getSheetIndex(extExcelModelInfoSheet), true);


        String child = "excel/" + param.getTitle() + "_数据" + ".xlsx";
        File file = new File(FastChar.getConstant().getAttachDirectory(), child);

        if (!file.getParentFile().exists()) {
            if (!file.getParentFile().mkdirs()) {
                handler.setCode(-1);
                handler.setError("导出失败！文件创建失败！" + file.getParentFile());
                return handler;
            }
        }
        FileOutputStream fileOutputStream = new FileOutputStream(file);
        workBook.write(fileOutputStream);
        fileOutputStream.close();
        workBook.close();

        handler.setCode(0);
        handler.setError("导出成功，共导出" + totalRow + "条数据！");
        handler.put("url", FastFile.newInstance(file).getUrl());
        return handler;
    }


    /**
     * 下载实体数据
     */
    public FastHandler downDataJSON(DownDataParam param) throws Exception {
        FastHandler handler = new FastHandler();

        String entityCode = param.getEntityCode();

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            handler.setCode(-1);
            handler.setError("EntityCode不存在！" + entityCode);
            return handler;
        }
        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            handler.setCode(-1);
            handler.setError("EntityCode不存在！" + entityCode);
            return handler;
        }
        handler.put("entityDetails", entity.getTableDetails());

        entity.putAll(param.getWhere());

        if (param.isFromTree()) {
            if (FastStringUtils.isNotEmpty(param.getTreeParentIdName())) {
                entity.remove(param.getTreeParentIdName());
            }
        }

        entity.pullLayer(param.getSession());

        File dataFile = new File(FastChar.getConstant().getAttachDirectory(), entityCode + "_" + System.currentTimeMillis() + ".data");

        FastFileUtils.writeStringToFile(dataFile, extEntityClass.getName(), true);

        int page = 0;
        int pageSize = FastExtConfig.getInstance().getExportPageSize();
        int totalPage;
        do {
            FastPage<?> fastPage = entity.showList(page + 1, pageSize);
            List<?> list = fastPage.getList();
            if (list.isEmpty()) {
                handler.setCode(-1);
                handler.setError("下载失败！暂无下载的数据！");
                return handler;
            }
            FastFileUtils.writeStringToFile(dataFile, "\n" + FastChar.getJson().toJson(list), "utf-8", true);

            page = fastPage.getPage();
            totalPage = fastPage.getTotalPage();
            fastPage.release();
        } while (page != totalPage);

        handler.setCode(0);
        handler.setError("获取成功！");
        handler.put("url", FastFile.newInstance(dataFile).getUrl());
        return handler;
    }


    /**
     * 上传数据
     */
    public FastHandler loadDataJSON(String entityCode, File dataFile, boolean strict) throws Exception {
        FastHandler handler = new FastHandler();

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            handler.setCode(-1);
            handler.setError("EntityCode不存在！" + entityCode);
            return handler;
        }

        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            handler.setCode(-1);
            handler.setError("EntityCode不存在！" + entityCode);
            return handler;
        }

        Collection<FastColumnInfo<?>> primaries = entity.getPrimaries();
        List<String> checkAttr = new ArrayList<>();
        for (FastColumnInfo<?> primary : primaries) {
            checkAttr.add(primary.getName());
        }


        FileInputStream fileInputStream = FastFileUtils.openInputStream(dataFile);
        int count = 0;
        try {
            InputStreamReader reader = new InputStreamReader(fileInputStream, FastCharsetsUtils.toCharset("utf-8"));
            BufferedReader bufferedReader = FastFileUtils.toBufferedReader(reader);
            int lineIndex = 0;
            String entityCacheName;
            for (String line = bufferedReader.readLine(); line != null; line = bufferedReader.readLine()) {
                if (FastStringUtils.isEmpty(line)) {
                    continue;
                }
                if (lineIndex == 0) {
                    entityCacheName = line;
                    if (strict) {
                        if (!entityCacheName.equals(extEntityClass.getName())) {
                            handler.setCode(-1);
                            handler.setError("上传失败！数据类型不匹配！");
                            return handler;
                        }
                    }
                }
                if (lineIndex > 0) {
                    List<FastEntity<?>> entityList = new ArrayList<>();
                    List<?> data = FastChar.getJson().fromJson(line, List.class);
                    for (Object datum : data) {
                        FastEntity<?> entityData = FastChar.getOverrides().newInstance(extEntityClass);
                        entityData.setAll((Map<String, Object>) datum);
                        entityData.clearEmpty();
                        if (entityData.isEmptyColumn()) {
                            continue;
                        }
                        for (String key : entityData.allKeys()) {
                            Object keyValue = entityData.get(key);
                            if (keyValue instanceof Number) {
                                continue;
                            }
                            if (keyValue instanceof String) {
                                continue;
                            }
                            if (keyValue instanceof byte[]) {
                                continue;
                            }
                            if (keyValue instanceof Date) {
                                continue;
                            }
                            entityData.put(key, FastChar.getJson().toJson(keyValue));
                        }
                        entityList.add(entityData);
                    }

                    int[] batchSaveResult = FastChar.getDB().batchSaveEntity(entityList, Math.min(entityList.size(), 2000), checkAttr.toArray(new String[]{}));
                    for (int i : batchSaveResult) {
                        if (i > 0) {
                            count++;
                        }
                    }
                    entityList.clear();
                }
                lineIndex++;
            }
        } finally {
            FastFileUtils.closeQuietly(fileInputStream);
        }

        handler.setCode(0);
        handler.setError("数据上传成功！共" + count + "条数据！");
        return handler;
    }


    private void createTitleRow(CellStyle cellStyle, int[] rowIndex, Sheet sheet, List<Map<String, Object>> columns) {
        java.util.List<String> title = new ArrayList<>();
        for (Map<String, Object> column : columns) {
            String text = String.valueOf(column.get("text"));
            if (column.containsKey("groupHeaderText") && FastStringUtils.isNotEmpty(column.get("groupHeaderText").toString())) {
                text = column.get("groupHeaderText").toString() + "@" + text;
            }
            if (column.containsKey("excelHeaderText")) {
                text = FastStringUtils.defaultValue(column.get("excelHeaderText"), text);
            }
            title.add(text);
        }
        POIUtils.createTitleRow(cellStyle, rowIndex, sheet, title);
    }


    private static class ImportDataHolder {
        private List<FastEntity<?>> batchSave = new ArrayList<>();
        private List<FastEntity<?>> batchUpdate = new ArrayList<>();
        private int updateCount;

        private int saveCount;

        private final IFastImportDataListener iFastImportData;

        public ImportDataHolder() {
            this.iFastImportData = FastChar.getOverrides().newInstance(false, IFastImportDataListener.class);
        }

        public void addUpdateEntity(FastEntity<?> entity) {
            entity.put("__operate", "update");
            batchUpdate.add(entity);
        }

        public void addSaveEntity(FastEntity<?> entity) {
            entity.put("__operate", "save");
            batchSave.add(entity);
        }

        public int getUpdateCount() {
            return updateCount;
        }

        public int getSaveCount() {
            return saveCount;
        }

        public FastHandler commitData(boolean justCommit) throws Exception {
            FastHandler handler = new FastHandler();

            if ((batchSave.size() + batchUpdate.size() >= FastExtConfig.getInstance().getImportPageSize()) || justCommit) {

                List<FastEntity<?>> all = new ArrayList<>();
                all.addAll(batchSave);
                all.addAll(batchUpdate);

                if (iFastImportData != null) {
                    FastHandler importDataHandler = new FastHandler();
                    iFastImportData.onBeforeImportData(all, importDataHandler);
                    if (importDataHandler.getCode() != 0) {
                        handler.setCode(importDataHandler.getCode());
                        handler.setError(importDataHandler.getError());
                        return handler;
                    }
                }

                batchSave = new ArrayList<>();
                batchUpdate = new ArrayList<>();
                for (FastEntity<?> fastEntity : all) {
                    if (fastEntity.getString("__operate", "none").equalsIgnoreCase("save")) {
                        batchSave.add(fastEntity);
                    } else if (fastEntity.getString("__operate", "none").equalsIgnoreCase("update")) {
                        batchUpdate.add(fastEntity);
                    }
                }

                if (!batchSave.isEmpty()) {
                    FastChar.getDB().batchSaveEntity(batchSave, Math.min(batchSave.size(), 10000));
                }

                if (!batchUpdate.isEmpty()) {
                    FastChar.getDB().batchUpdateEntity(batchUpdate, Math.min(batchUpdate.size(), 10000));
                }

                if (iFastImportData != null) {
                    FastHandler importDataHandler = new FastHandler();
                    iFastImportData.onAfterImportData(all, handler);
                    if (importDataHandler.getCode() != 0) {
                        handler.setCode(importDataHandler.getCode());
                        handler.setError(importDataHandler.getError());
                        return handler;
                    }
                }

                updateCount += batchUpdate.size();
                saveCount += batchSave.size();

                //避免导入数据过多占用内存
                all.clear();
                batchSave.clear();
                batchUpdate.clear();
            }
            handler.setCode(0);
            handler.setError("提交成功！");
            return handler;
        }


        public String getCommitMessage() {
            StringBuilder msg = new StringBuilder();
            if (getSaveCount() > 0) {
                msg.append("共导入").append(getSaveCount()).append("条数据！");
            }
            if (getUpdateCount() > 0) {
                msg.append("共更新").append(getUpdateCount()).append("条数据！");
            }
            if (msg.length() == 0) {
                msg.append("共导入0条数据！");
            }
            return msg.toString();
        }

    }

    public static class ImportDataParam {

        private File excelFile;

        private String entityParentLayerValue;

        private String sessionEntityLayerValue;

        private String entityCode;

        private Map<String, Object> entityMoreAttrValues = new LinkedHashMap<>();


        public File getExcelFile() {
            return excelFile;
        }

        public ImportDataParam setExcelFile(File excelFile) {
            this.excelFile = excelFile;
            return this;
        }

        public String getEntityParentLayerValue() {
            return entityParentLayerValue;
        }

        public ImportDataParam setEntityParentLayerValue(String entityParentLayerValue) {
            this.entityParentLayerValue = entityParentLayerValue;
            return this;
        }

        public String getEntityCode() {
            return entityCode;
        }

        public ImportDataParam setEntityCode(String entityCode) {
            this.entityCode = entityCode;
            return this;
        }

        public Map<String, Object> getEntityMoreAttrValues() {
            return entityMoreAttrValues;
        }

        public ImportDataParam setEntityMoreAttrValues(Map<String, Object> entityMoreAttrValues) {
            this.entityMoreAttrValues = entityMoreAttrValues;
            return this;
        }

        public String getSessionEntityLayerValue() {
            return sessionEntityLayerValue;
        }

        public ImportDataParam setSessionEntityLayerValue(String sessionEntityLayerValue) {
            this.sessionEntityLayerValue = sessionEntityLayerValue;
            return this;
        }
    }

    public static class ExportDataParam {

        private String title;
        private ExtManagerEntity session;

        private String entityCode;

        private String projectHost;

        private boolean exportIndex;

        private String sort;

        private List<Map<String, Object>> columns = new ArrayList<>();

        private Map<String, Object> where = new LinkedHashMap<>();
        private Map<String, Object> index = new LinkedHashMap<>();


        public String getTitle() {
            return title;
        }

        public ExportDataParam setTitle(String title) {
            this.title = title;
            return this;
        }

        public ExtManagerEntity getSession() {
            return session;
        }

        public ExportDataParam setSession(ExtManagerEntity session) {
            this.session = session;
            return this;
        }

        public String getEntityCode() {
            return entityCode;
        }

        public ExportDataParam setEntityCode(String entityCode) {
            this.entityCode = entityCode;
            return this;
        }

        public String getProjectHost() {
            return projectHost;
        }

        public ExportDataParam setProjectHost(String projectHost) {
            this.projectHost = projectHost;
            return this;
        }

        public boolean isExportIndex() {
            return exportIndex;
        }

        public ExportDataParam setExportIndex(boolean exportIndex) {
            this.exportIndex = exportIndex;
            return this;
        }

        public String getSort() {
            return sort;
        }

        public ExportDataParam setSort(String sort) {
            this.sort = sort;
            return this;
        }

        public List<Map<String, Object>> getColumns() {
            return columns;
        }

        public ExportDataParam setColumns(List<Map<String, Object>> columns) {
            this.columns = columns;
            return this;
        }

        public Map<String, Object> getWhere() {
            return where;
        }

        public ExportDataParam setWhere(Map<String, Object> where) {
            this.where = where;
            return this;
        }

        public Map<String, Object> getIndex() {
            return index;
        }

        public ExportDataParam setIndex(Map<String, Object> index) {
            this.index = index;
            return this;
        }
    }

    public static class DownDataParam {

        private ExtManagerEntity session;

        private String entityCode;

        private Map<String, Object> where = new LinkedHashMap<>();

        private boolean fromTree;

        private String treeParentIdName;

        public ExtManagerEntity getSession() {
            return session;
        }

        public DownDataParam setSession(ExtManagerEntity session) {
            this.session = session;
            return this;
        }

        public String getEntityCode() {
            return entityCode;
        }

        public DownDataParam setEntityCode(String entityCode) {
            this.entityCode = entityCode;
            return this;
        }

        public Map<String, Object> getWhere() {
            return where;
        }

        public DownDataParam setWhere(Map<String, Object> where) {
            this.where = where;
            return this;
        }

        public boolean isFromTree() {
            return fromTree;
        }

        public DownDataParam setFromTree(boolean fromTree) {
            this.fromTree = fromTree;
            return this;
        }

        public String getTreeParentIdName() {
            return treeParentIdName;
        }

        public DownDataParam setTreeParentIdName(String treeParentIdName) {
            this.treeParentIdName = treeParentIdName;
            return this;
        }
    }


}
