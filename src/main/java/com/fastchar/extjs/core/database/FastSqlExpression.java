package com.fastchar.extjs.core.database;

public class FastSqlExpression {

    private String expression;

    public FastSqlExpression(String expression) {
        this.expression = expression;
    }

    public String getExpression() {
        return expression;
    }

    public FastSqlExpression setExpression(String expression) {
        this.expression = expression;
        return this;
    }

    public static boolean isSqlExpression(Object value) {
        if (value == null) {
            return false;
        }
        if (value instanceof FastSqlExpression) {
            return true;
        }
        if (value.toString().startsWith("FastSqlExpression@")) {
            return true;
        }
        return false;
    }


    public static String getSqlExpression(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof FastSqlExpression) {
            return ((FastSqlExpression) value).getExpression();
        }
        if (value.toString().startsWith("FastSqlExpression@")) {
            return value.toString().replace("FastSqlExpression@", "");
        }
        return null;
    }
}
