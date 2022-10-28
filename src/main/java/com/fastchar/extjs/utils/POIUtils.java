package com.fastchar.extjs.utils;

import com.fastchar.core.FastChar;
import com.fastchar.extjs.core.FastExtEnumHelper;
import com.fastchar.extjs.core.enums.FastEnumInfo;
import com.fastchar.utils.FastDateUtils;
import com.fastchar.utils.FastStringUtils;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.ss.util.NumberToTextConverter;
import org.apache.poi.xssf.usermodel.XSSFClientAnchor;
import org.apache.poi.xssf.usermodel.XSSFDataValidationConstraint;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;

import java.awt.Color;
import java.util.List;
import java.util.*;

public class POIUtils {

    private static final int MAX_ROW_NUMBER = 1000000;

    public static Color parseColor(String colorValue) {
        Color color = ColorUtils.RgbToColor(colorValue);
        if (color != null) {
            return color;
        }
        return ColorUtils.HexToColor(colorValue);
    }


    public static void createTitleRow(CellStyle cellStyle, int[] rowIndex, Sheet sheet,
                                      java.util.List<String> titles) {

        int maxLevel = 0;
        int maxColumn = titles.size();
        for (String value : titles) {
            String[] valueArray = value.split("@");
            maxLevel = Math.max(maxLevel, valueArray.length);
        }

        Map<Integer, java.util.List<String>> rowValueMap = new LinkedHashMap<>();
        for (int level = 0; level < maxLevel; level++) {
            int currRowNum = rowIndex[0]++;
            Row row = sheet.createRow(currRowNum);

            java.util.List<String> rowValue = new ArrayList<>();
            for (int cellNum = 0; cellNum < titles.size(); cellNum++) {
                String value = titles.get(cellNum);
                String[] valueArray = value.split("@");

                Cell cell = row.createCell(cellNum);
                String realTitle = valueArray[valueArray.length - 1];
                if (level < valueArray.length) {
                    realTitle = valueArray[level];
                }
                cell.setCellValue(realTitle);
                cell.setCellStyle(cellStyle);
                rowValue.add(realTitle);
            }
            rowValueMap.put(currRowNum, rowValue);
        }

        //合并单列的同行
        for (int cellNum = 0; cellNum < maxColumn; cellNum++) {
            Integer beginMarginRowIndex = null;
            Integer lastMarginRowIndex = null;
            for (Map.Entry<Integer, List<String>> integerListEntry : rowValueMap.entrySet()) {
                Integer rowNum = integerListEntry.getKey();
                if (beginMarginRowIndex == null) {
                    beginMarginRowIndex = rowNum;
                }
                List<String> cellValues = integerListEntry.getValue();

                String upRowCellValue = rowValueMap.get(beginMarginRowIndex).get(cellNum);
                String cellValue = cellValues.get(cellNum);

                if (!cellValue.equalsIgnoreCase(upRowCellValue)) {
                    if (rowNum - beginMarginRowIndex > 1) {
                        CellRangeAddress cellAddresses = new CellRangeAddress(beginMarginRowIndex, rowNum, cellNum, cellNum);
                        sheet.addMergedRegionUnsafe(cellAddresses);
                        beginMarginRowIndex = rowNum + 1;
                    } else {
                        beginMarginRowIndex = rowNum;
                    }
                }
                lastMarginRowIndex = rowNum;
            }
            if (beginMarginRowIndex != null && lastMarginRowIndex - beginMarginRowIndex >= 1) {
                CellRangeAddress cellAddresses = new CellRangeAddress(beginMarginRowIndex, lastMarginRowIndex, cellNum, cellNum);
                sheet.addMergedRegionUnsafe(cellAddresses);
            }
        }

        //合并单行的同列
        for (Map.Entry<Integer, List<String>> integerListEntry : rowValueMap.entrySet()) {
            Integer rowNum = integerListEntry.getKey();
            List<String> cellValues = integerListEntry.getValue();
            int beginMarginCellIndex = 0;
            Integer lastMarginCellIndex = null;
            for (int cellNum = 0; cellNum < cellValues.size(); cellNum++) {
                String value = cellValues.get(cellNum);
                String beginValue = cellValues.get(beginMarginCellIndex);
                if (!beginValue.equals(value)) {
                    if (cellNum - beginMarginCellIndex > 1) {
                        CellRangeAddress cellAddresses = new CellRangeAddress(rowNum, rowNum, beginMarginCellIndex, cellNum - 1);
                        sheet.addMergedRegionUnsafe(cellAddresses);
                    }
                    beginMarginCellIndex = cellNum;
                }
                lastMarginCellIndex = cellNum;
            }
            if (lastMarginCellIndex != null && lastMarginCellIndex - beginMarginCellIndex >= 1) {
                CellRangeAddress cellAddresses = new CellRangeAddress(rowNum, rowNum, beginMarginCellIndex, lastMarginCellIndex);
                sheet.addMergedRegionUnsafe(cellAddresses);
            }
        }
    }

    public static String cleanPreserveLineBreaks(String bodyHtml) {
        String prettyPrintedBodyFragment = Jsoup.clean(bodyHtml, "", Safelist.none().addTags("br", "p"), new Document.OutputSettings().prettyPrint(true));
        return Jsoup.clean(prettyPrintedBodyFragment, "", Safelist.none(), new Document.OutputSettings().prettyPrint(false));
    }

    public static void setCellComment(Sheet sheet, Cell cell, String content) {
        if (FastStringUtils.isEmpty(content) || cell == null) {
            return;
        }
        content = Jsoup.parse("<div>" + content + "</div>").text();
        Drawing<?> patriarch = sheet.createDrawingPatriarch();
        RichTextString commentRich = new XSSFRichTextString(cleanPreserveLineBreaks(content));

        ClientAnchor clientAnchor = new XSSFClientAnchor();
        clientAnchor.setAnchorType(ClientAnchor.AnchorType.DONT_MOVE_AND_RESIZE);
        clientAnchor.setDx1(0);
        clientAnchor.setDx2(0);
        clientAnchor.setDy1(0);
        clientAnchor.setDy2(0);
        clientAnchor.setCol1(cell.getColumnIndex());
        clientAnchor.setRow1(cell.getRowIndex());
        clientAnchor.setCol2(cell.getColumnIndex() + 3);
        clientAnchor.setRow2(cell.getRowIndex() + 3);

        Comment comment = patriarch.createCellComment(clientAnchor);
        comment.setString(commentRich);
        comment.setAuthor("详情说明");

        cell.setCellComment(comment);
    }

    public static Object getCellValue(Workbook workbook, Cell cell) {
        if (workbook == null) {
            return null;
        }
        if (cell == null) {
            return null;
        }
        return takeCellValue(workbook, cell, cell.getCellType());
    }

    private static Object takeCellValue(Workbook workbook, Cell cell, CellType cellType) {
        try {
            if (workbook == null) {
                return null;
            }
            if (cell == null) {
                return null;
            }
            if (cellType == CellType.BLANK || cellType == CellType.STRING) {
                return cell.getStringCellValue();
            } else if (cellType == CellType.NUMERIC) {
                if (DateUtil.isCellDateFormatted(cell)) {
                    return FastDateUtils.format(cell.getDateCellValue(), FastChar.getConstant().getDateFormat());
                } else {
                    return NumberToTextConverter.toText(cell.getNumericCellValue());
                }
            } else if (cellType == CellType.BOOLEAN) {
                return cell.getBooleanCellValue();
            } else if (cellType == CellType.FORMULA) {
                return takeCellValue(workbook, cell, cell.getCachedFormulaResultType());
            }
            return cell.getStringCellValue();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }


    public static void setEnumCell(Sheet sheet, String enumName, int beginRow, int cellIndex, String cellTitle) {
        try {
            List<FastEnumInfo> allEnums = FastExtEnumHelper.getAllEnums(enumName);
            if (allEnums.isEmpty()) {
                return;
            }
            Workbook workbook = sheet.getWorkbook();
            Sheet enumSheet = workbook.getSheet(enumName);
            if (enumSheet == null) {
                enumSheet = workbook.createSheet(enumName);
                for (int i = 0; i < allEnums.size(); i++) {
                    Row row = enumSheet.createRow(i);
                    row.createCell(0).setCellValue(allEnums.get(i).getText());
                }
            }

            Name namedCell = workbook.createName();
            namedCell.setNameName(enumName);
            namedCell.setRefersToFormula(enumName + "!$A$1:$A$" + allEnums.size());

            DataValidationHelper dataValidationHelper = sheet.getDataValidationHelper();

            CellRangeAddressList cellRegions = new CellRangeAddressList(beginRow, MAX_ROW_NUMBER, cellIndex, cellIndex);
            DataValidation dataValidate = dataValidationHelper.createValidation(dataValidationHelper.createFormulaListConstraint(enumName), cellRegions);
            dataValidate.createErrorBox("输入不合法", "请输入有效的" + cellTitle);
            dataValidate.setSuppressDropDownArrow(true);
            dataValidate.setShowErrorBox(true);

            workbook.setSheetHidden(workbook.getSheetIndex(enumSheet), true);
            sheet.addValidationData(dataValidate);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    public static String convertDateFormat(String extJsDateFormat) {

        return extJsDateFormat.replace("Y", "yyyy")
                .replace("m", "MM")
                .replace("d", "dd")
                .replace("H", "HH")
                .replace("i", "mm")
                .replace("s", "ss");
    }


    public static CellStyle getColumnStyle(Sheet sheet,
                                           Map<String, Object> column,
                                           CellStyle defaultCellStyle,
                                           POIHelper poiHelper,
                                           int titleRowIndex,
                                           int cellIndex) {

        DataFormat format = sheet.getWorkbook().createDataFormat();

        CellStyle columnStyle = defaultCellStyle;

        Row row = sheet.getRow(titleRowIndex);

        String type = String.valueOf(column.get("type"));
        if (column.containsKey("enum") && FastStringUtils.isNotEmpty(String.valueOf(column.get("enum")))) {
            POIUtils.setEnumCell(sheet, String.valueOf(column.get("enum")), titleRowIndex + 1, cellIndex, String.valueOf(column.get("text")));
        } else if (type.equalsIgnoreCase("numberfield")) {

            DataValidationHelper helper = sheet.getDataValidationHelper();

            CellRangeAddressList cellRegions = new CellRangeAddressList(titleRowIndex + 1, MAX_ROW_NUMBER, cellIndex, cellIndex);

            DataValidationConstraint constraint = helper.createNumericConstraint(
                    DataValidationConstraint.ValidationType.DECIMAL, DataValidationConstraint.OperatorType.BETWEEN, "-" + Integer.MAX_VALUE, String.valueOf(Integer.MAX_VALUE));

            DataValidation dataValidate = helper.createValidation(constraint, cellRegions);
            dataValidate.setShowErrorBox(true);
            dataValidate.setSuppressDropDownArrow(true);
            dataValidate.setShowPromptBox(true);
            dataValidate.createErrorBox("输入不合法", "请输入有效的" + column.get("text"));
            sheet.addValidationData(dataValidate);

            columnStyle = poiHelper.getCellStyle("number");
            columnStyle.cloneStyleFrom(defaultCellStyle);
            columnStyle.setDataFormat(format.getFormat("0.00"));
        } else if (type.equalsIgnoreCase("datefield")) {
            columnStyle = poiHelper.getCellStyle("date");
            columnStyle.cloneStyleFrom(defaultCellStyle);
            String convertDateFormat = POIUtils.convertDateFormat(FastStringUtils.defaultValue(column.get("format"), "Y-m-d H:i:s"));

            Calendar minCalendar = Calendar.getInstance();
            minCalendar.add(Calendar.YEAR, -100);

            Calendar maxCalendar = Calendar.getInstance();
            maxCalendar.add(Calendar.YEAR, 999);

            DataValidationHelper helper = sheet.getDataValidationHelper();

            CellRangeAddressList cellRegions = new CellRangeAddressList(titleRowIndex + 1, MAX_ROW_NUMBER, cellIndex, cellIndex);
            DataValidationConstraint constraint = helper.createDateConstraint(XSSFDataValidationConstraint.ValidationType.DATE,
                    FastDateUtils.format(minCalendar.getTime(), convertDateFormat),
                    FastDateUtils.format(maxCalendar.getTime(), convertDateFormat),
                    convertDateFormat);

            DataValidation dataValidate = helper.createValidation(constraint, cellRegions);
            dataValidate.setShowErrorBox(true);
            dataValidate.setSuppressDropDownArrow(true);
            dataValidate.setShowPromptBox(true);
            dataValidate.createErrorBox("输入不合法", "请按照" + convertDateFormat + "日期格式输入！");
            sheet.addValidationData(dataValidate);

            columnStyle.setDataFormat(format.getFormat(convertDateFormat));
            POIUtils.setCellComment(sheet, row.getCell(cellIndex), "请按照 " + convertDateFormat + " 日期格式输入");
        }
        return columnStyle;
    }


}
