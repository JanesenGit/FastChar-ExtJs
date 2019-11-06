package com.fastchar.extjs.utils;

import java.math.BigInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ColorUtils {

    public static String getLightColor(String sourceCode, double level) {
        sourceCode = sourceCode.replace("#", "");
        StringBuilder stringBuffer = new StringBuilder();
        stringBuffer.append("#");

        String regStr = "([0-9a-f]{2})";
        Pattern compile = Pattern.compile(regStr);
        Matcher matcher = compile.matcher(sourceCode.toLowerCase());

        while (matcher.find()) {
            String group = matcher.group(1);
            int intValue = changeHex2Int(group);
            int fixIntValue = (int) (Math.floor((255 - intValue) * level) + intValue);
            stringBuffer.append(changeInt2Hex(String.valueOf(fixIntValue)));
        }
        return stringBuffer.toString();
    }

    private static int changeHex2Int(String temp) {
        BigInteger bigInteger = new BigInteger(temp, 16);
        return Integer.parseInt(bigInteger.toString());
    }

    private static String changeInt2Hex(String temp) {
        BigInteger bigInteger = new BigInteger(temp, 10);
        return Integer.toHexString(Integer.parseInt(bigInteger.toString()));
    }

}
