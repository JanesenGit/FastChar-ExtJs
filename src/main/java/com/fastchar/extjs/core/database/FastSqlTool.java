package com.fastchar.extjs.core.database;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.database.sql.FastSql;
import com.fastchar.utils.FastArrayUtils;
import com.fastchar.utils.FastStringUtils;

import java.lang.reflect.Array;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class FastSqlTool {
    public static FastSqlInfo buildSelectSql(FastSql sql,FastEntity<?> entity) {
        return buildSelectSql(sql, "select * from " + entity.getTableName(), entity);
    }

    public static FastSqlInfo buildSelectSql(FastSql sql,String selectSql, FastEntity<?> entity) {
        return FastSqlTool.appendWhere(sql, selectSql, entity);
    }



    /**
     * 格式化字段的前缀 __ 翻译成sql  . (别名前缀，例如：a__name 翻译后为：a.name)
     *
     * @param field        字段
     * @param defaultAlias 默认前缀 例如：t
     * @return 格式化后的sql列名
     */
    public static String formatAlias(String field, String defaultAlias) {
        field = field.replace("__", ".");
        if (!field.contains(".")) {
            field = defaultAlias + "." + field;
        }
        return field;
    }

    protected static String convertInPlaceholder(Object value, List<Object> values) {
        if (FastSqlExpression.isSqlExpression(value)) {
            return FastSqlExpression.getSqlExpression(value);
        }

        List<String> placeholders = new ArrayList<String>();
        if (value.getClass().isArray()) {
            int length = Array.getLength(value);
            for (int i = 0; i < length; i++) {
                values.add(Array.get(value, i));
                placeholders.add("?");
            }
        } else if (value instanceof Collection<?>) {
            Collection<?> list = (Collection<?>) value;
            for (Object object : list) {
                values.add(object);
                placeholders.add("?");
            }
        } else if (value.toString().contains(",")) {
            String[] arrays = value.toString().split(",");
            for (String string : arrays) {
                values.add(string);
                placeholders.add("?");
            }
        } else {
            values.add(value);
            placeholders.add("?");
        }
        return FastStringUtils.join(placeholders, ",");
    }

    protected static String getAlias(String sql) {
        int[] fromPosition = getTokenIndex("from", sql);
        if (fromPosition.length > 0 && fromPosition[0] > 0) {
            String fromSql = sql.substring(fromPosition[0]);
            return getTokenValue("as", fromSql);
        }
        return null;
    }

    //获取主sql的关键值位置
    protected static int[] getTokenIndex(String token, String sql, String... endToken) {
        String[] tokens = token.split(" ");
        int tokenIndex = 0;
        int[] position = new int[]{-1, -1};
        StringBuilder stringBuilder = new StringBuilder();
        int beginGroupCharCount = 0, endGroupCharCount = 0;
        for (int i = 0; i < sql.length(); i++) {
            char chr = sql.charAt(i);
            if (chr == ' ') {
                if (tokenIndex < tokens.length) {
                    if (stringBuilder.toString().equalsIgnoreCase(tokens[tokenIndex])) {
                        if (position[0] == -1) {
                            position[0] = i - 1 - tokens[tokenIndex].length();
                        }
                        tokenIndex++;
                    }
                }
                if (!FastArrayUtils.contains(endToken, stringBuilder.toString().toLowerCase().trim())) {
                    stringBuilder.delete(0, stringBuilder.length());
                    continue;
                }
            }
            if (chr == '(') {
                beginGroupCharCount++;
            } else if (chr == ')') {
                endGroupCharCount++;
            }
            if (beginGroupCharCount != endGroupCharCount) {
                stringBuilder.delete(0, stringBuilder.length());
                continue;
            }
            stringBuilder.append(sql.charAt(i));

            if (FastArrayUtils.contains(endToken, stringBuilder.toString().toLowerCase())) {
                position[1] = i - position[0] - stringBuilder.length();
                break;
            }
        }
        if (position[1] == -1) {
            position[1] = sql.length() - position[0];
        }
        return position;
    }

    //从主sql中获取token的位置
    protected static String getTokenValue(String token, String sql) {
        StringBuilder stringBuilder = new StringBuilder();
        int beginGroupChar = 0, endGroupChar = 0;

        boolean hasToken = false;
        for (int i = 0; i < sql.length(); i++) {
            char chr = sql.charAt(i);
            if (chr == ' ') {
                if (hasToken && stringBuilder.length() > 0) {
                    return stringBuilder.toString();
                }
                stringBuilder.delete(0, stringBuilder.length());
                continue;
            }
            if (chr == '(') {
                beginGroupChar++;
            } else if (chr == ')') {
                endGroupChar++;
            }
            if (beginGroupChar != endGroupChar) {
                stringBuilder.delete(0, stringBuilder.length());
                continue;
            }
            stringBuilder.append(sql.charAt(i));
            if (stringBuilder.toString().equalsIgnoreCase(token)) {
                stringBuilder.delete(0, stringBuilder.length());
                hasToken = true;
            }
        }
        return null;
    }


    /**
     * 条件属性 转为 sql语句
     * <p>
     * 条件属性格式：
     * <br/>
     * 分组符号+连接符号+属性名+比较符号（例如：&name?% 翻译后为：and name like '值%' ）
     * <br/>
     * 分组符号 @[0-9]  翻译成sql and ()
     * <br/>
     * 分组符号 |[0-9]  翻译成sql or ()
     * <br/>
     * 连接符号：&  翻译成sql  and
     * <br/>
     * 连接符号：@  翻译成sql  and
     * <br/>
     * 连接符号：|| 翻译成sql  or
     * <br/>
     * 比较符号：?  翻译成sql  like
     * <br/>
     * 比较符号：!? 翻译成sql  not like
     * <br/>
     * 比较符号：#  翻译成sql  in
     * <br/>
     * 比较符号：!# 翻译成sql  not in
     * <br/>
     * 比较符号：~  翻译成sql  is null
     * <br/>
     * 比较符号：!~  翻译成sql is not null
     * <br/>
     * 比较符号：*   翻译成sql  将值符合分割单个字符 使用 《 like '%{单个字符}%' or 》 拼接
     * <br/>
     * 比较符号：!*  翻译成sql  将值分割单个字符 使用 《 not like '%{单个字符}%' and 》拼接
     * <br/>
     * 比较符号：??  翻译成sql  match(key) against (value)
     * <br/>
     * 前缀符号：__ 翻译成sql  . (别名前缀，例如：a__name 翻译后为：a.name)
     * <br/>
     * 以下特性被忽略转换：
     * 以^符号开头的属性 （例如：^test ）
     * </p>
     */
    public static FastSqlInfo appendWhere(FastSql fastSql, String sqlStr, FastEntity<?> entity) {
        sqlStr = sqlStr.trim();
        Pattern compile = Pattern.compile("([@|]?[0-9]+)?(&|@|\\|{2})?([_a-zA-Z0-9.]*)([?!#><=%~*]+)?([:sort]+)?");

        FastSqlInfo sqlInfo = FastChar.getOverrides().newInstance(FastSqlInfo.class).setType(fastSql.getType());
        TreeSet<String> keys = new TreeSet<>(entity.allKeys());
        LinkedHashMap<String, String> sorts = new LinkedHashMap<>();
        StringBuilder whereBuilder = new StringBuilder(" ");
        String alias = getAlias(sqlStr);
        if (FastStringUtils.isEmpty(alias)) {
            alias = "";
        } else {
            alias = alias + ".";
        }

        String lastGroupKey = "";
        Map<String, String> replaceSql = new HashMap<>();


        for (String whereAttr : keys) {
            if (whereAttr.startsWith("^")) {
                continue;
            }
            String link = "and";
            String attr = alias + whereAttr;
            String matchAttr;
            Object value = entity.get(whereAttr);

            if (value == null || FastStringUtils.isEmpty(value.toString())) {
                continue;
            }


            String before_1 = "";
            String before_2 = "";
            String compare = "=";
            String placeholder = "?";
            Matcher matcher = compile.matcher(whereAttr);
            if (matcher.find()) {
                String groupKey = FastStringUtils.defaultValue(matcher.group(1), "");
                link = FastStringUtils.defaultValue(matcher.group(2), "and");
                attr = matchAttr = FastStringUtils.defaultValue(matcher.group(3), whereAttr);
                compare = FastStringUtils.defaultValue(matcher.group(4), "=");
                String rank = matcher.group(5);// :sort


                if (FastStringUtils.isNotEmpty(rank)) {
                    if (":sort".equalsIgnoreCase(rank)) {
                        sorts.put(attr, String.valueOf(value).toLowerCase());
                        continue;
                    }
                }
                if (FastStringUtils.isEmpty(compare)) {
                    continue;
                }

                attr = attr.replace("__", ".");
                FastColumnInfo<?> column;
                if (attr.contains(".")) {
                    column = entity.getColumn(attr.split("\\.")[1]);
                } else {
                    column = entity.getColumn(attr);
                    attr = alias + attr;
                }


                String searchExcludeKey = getSearchExcludeKey(matchAttr);
                if (entity.containsKey(searchExcludeKey)) {
                    String searchExclude = entity.getString(searchExcludeKey);
                    if (FastStringUtils.isNotEmpty(searchExclude)) {
                        value = value.toString().replaceAll(FastStringUtils.join(searchExclude.split(""), "|"), "");

                        String[] chars = searchExclude.split("");
                        StringBuilder replaceAttrSql = new StringBuilder(attr);
                        for (String aChar : chars) {
                            replaceAttrSql = new StringBuilder("replace(" + replaceAttrSql + ",'" + aChar + "','')");
                        }
                        attr = replaceAttrSql.toString();
                    }
                }

                if (column != null) {
                    Object convertValue = fastSql.getColumnValue(entity, column);
                    if (convertValue != null) {
                        value = convertValue;
                    }
                }

                if (FastStringUtils.isNotEmpty(link)) {
                    if ("||".equals(link)) {
                        link = "or";
                    } else {
                        link = "and";
                    }
                } else {
                    link = "and";
                }

                if (groupKey.startsWith("@") || groupKey.startsWith("$")) {
                    if (FastStringUtils.isEmpty(lastGroupKey)) {
                        if (FastStringUtils.isNotEmpty(groupKey)) {
                            before_2 = " and ( ";
                            link = "";
                            lastGroupKey = groupKey;
                        }
                    } else if (!lastGroupKey.equalsIgnoreCase(groupKey)) {
                        before_1 = " ) ";
                        if (FastStringUtils.isNotEmpty(groupKey)) {
                            before_2 = " and ( ";
                            link = "";
                            lastGroupKey = groupKey;
                        } else {
                            lastGroupKey = "";
                        }
                    }
                } else if (groupKey.startsWith("|")) {
                    if (FastStringUtils.isEmpty(lastGroupKey)) {
                        if (FastStringUtils.isNotEmpty(groupKey)) {
                            before_2 = " or ( ";
                            link = "";
                            lastGroupKey = groupKey;
                        }
                    } else if (!lastGroupKey.equalsIgnoreCase(groupKey)) {
                        before_1 = " ) ";
                        if (FastStringUtils.isNotEmpty(groupKey)) {
                            before_2 = " or ( ";
                            link = "";
                            lastGroupKey = groupKey;
                        } else {
                            lastGroupKey = "";
                        }
                    }
                } else if (FastStringUtils.isNotEmpty(lastGroupKey)) {
                    whereBuilder.append(" ) ");
                    lastGroupKey = "";
                }
                switch (compare) {
                    case "~":
                        compare = "is null";
                        placeholder = "";
                        break;
                    case "!~":
                        compare = "is not null";
                        placeholder = "";
                        break;
                    case "=":
                        if ("<null>".equalsIgnoreCase(value.toString())) {
                            compare = "is null";
                            placeholder = "";
                        }
                        break;
                    case "!=":
                        if ("<null>".equalsIgnoreCase(value.toString())) {
                            compare = "is not null";
                            placeholder = "";
                        }
                        break;
                    case "?":
                        compare = "like";
                        break;
                    case "?%":
                        compare = "like";
                        value = value + "%";
                        break;
                    case "%?":
                        compare = "like";
                        value = "%" + value;
                        break;
                    case "%?%":
                        compare = "like";
                        value = "%" + value + "%";
                        break;
                    case "!?":
                        compare = "not like";
                        break;
                    case "!?%":
                        compare = "not like";
                        value = value + "%";
                        break;
                    case "%!?":
                        compare = "not like";
                        value = "%" + value;
                        break;
                    case "%!?%":
                        compare = "not like";
                        value = "%" + value + "%";
                        break;
                    case "#":
                        compare = "in";
                        if ("<repeat>".equalsIgnoreCase(value.toString())) {
                            int[] fromPosition = getTokenIndex("from", sqlStr);
                            int[] wherePosition = getTokenIndex("where", sqlStr);
                            if (wherePosition[0] == -1) {
                                wherePosition[0] = sqlStr.length();
                            }
                            placeholder = " (select " + attr + " " + sqlStr.substring(fromPosition[0], wherePosition[0]) + " group by " + attr + " having count(1) > 1) ";
                        } else {
                            placeholder = "(" + convertInPlaceholder(value, sqlInfo.getParams()) + ")";
                        }
                        break;
                    case "!#":
                        compare = "not in";
                        if ("<repeat>".equalsIgnoreCase(value.toString())) {
                            int[] fromPosition = getTokenIndex("from", sqlStr);
                            int[] wherePosition = getTokenIndex("where", sqlStr);
                            if (wherePosition[0] == -1) {
                                wherePosition[0] = sqlStr.length();
                            }
                            placeholder = " (select " + attr + " " + sqlStr.substring(fromPosition[0], wherePosition[0]) + " group by " + attr + " having count(1) > 1) ";
                        } else {
                            placeholder = "(" + convertInPlaceholder(value, sqlInfo.getParams()) + ")";
                        }
                        break;
                    case "*":
                    case "!*":
                        String realAttr = attr;
                        attr = "{{" + FastStringUtils.buildOnlyCode("PH") + "}}";
                        List<String> attrSql = new ArrayList<>();
                        String[] values = value.toString().replace(" ", "|").split("\\|");
                        for (String s : values) {
                            if (FastStringUtils.isEmpty(s)) {
                                continue;
                            }
                            attrSql.add(realAttr + (compare.equals("*") ? " like " : " not like ") + " '%" + s.trim() + "%' ");
                        }
                        replaceSql.put(attr, " ( " + FastStringUtils.join(attrSql, compare.equals("*") ? " or " : " and ") + " ) ");

                        compare = "";
                        placeholder = "";
                        break;
                    case "??":
                        compare = "";
                        placeholder = "";
                        String realAttr2 = attr;
                        attr = "{{" + FastStringUtils.buildOnlyCode("PH") + "}}";
                        replaceSql.put(attr, " match(" + realAttr2 + ") against (?) ");
                        sqlInfo.getParams().add(value);
                        break;
                }
            }

            if (FastSqlExpression.isSqlExpression(value)) {
                placeholder = " " + FastSqlExpression.getSqlExpression(value);
            }

            whereBuilder
                    .append(before_1)
                    .append(" ")
                    .append(before_2)
                    .append(" ")
                    .append(link)
                    .append(" ")
                    .append(attr)
                    .append(" ")
                    .append(compare)
                    .append(" ")
                    .append(placeholder)
                    .append(" ");

            if ("?".equals(placeholder)) {
                sqlInfo.getParams().add(value);
            }
        }
        if (FastStringUtils.isNotEmpty(lastGroupKey)) {
            whereBuilder.append(" ) ");
        }

        List<String> sortBuilder = new ArrayList<>();
        for (Map.Entry<String, String> stringStringEntry : sorts.entrySet()) {
            sortBuilder.add(stringStringEntry.getKey() + " " + stringStringEntry.getValue());
        }

        int[] wherePosition = getTokenIndex("where", sqlStr, "group", "order", "having", "union");
        if (wherePosition[0] == -1) {
            whereBuilder.insert(0, " where 1=1 ");
        }
        sqlStr = FastStringUtils.insertString(sqlStr,
                wherePosition[0] + wherePosition[1],
                whereBuilder.toString());

        if (sortBuilder.size() > 0) {
            int[] orderPosition = getTokenIndex("order by", sqlStr);
            if (orderPosition[0] == -1) {
                sqlStr += " order by " + FastStringUtils.join(sortBuilder, ",");
            } else {
                sqlStr = FastStringUtils.insertString(sqlStr,
                        orderPosition[0] + orderPosition[1],
                        "," + FastStringUtils.join(sortBuilder, ","));
            }
        }

        for (String key : replaceSql.keySet()) {
            sqlStr = sqlStr.replace(key, replaceSql.get(key));
        }

        sqlInfo.setSql(sqlStr);
        return sqlInfo;
    }


    private static String getSearchExcludeKey(String attr) {
        return "^" + attr + "@SearchExclude";
    }


    public static String removeOrderBy(String sqlStr) {
        int[] orderPosition = getTokenIndex("order by", sqlStr);
        if (orderPosition[0] == -1) {
            return sqlStr;
        } else {
            return sqlStr.substring(0, orderPosition[0]);
        }
    }

}
