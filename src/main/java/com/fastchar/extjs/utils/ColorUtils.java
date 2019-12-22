package com.fastchar.extjs.utils;

import javafx.scene.paint.Color;

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

    /**
     * 颜色加深
     * @param hexColor 原色
     * @param level 深度0~1
     * @return 加深后的颜色
     */
    public static String getDarkColor(String hexColor, double level) {
        Color darkColor = getDarkColor(Color.valueOf(hexColor), level);
        String hexStr= darkColor.toString();
        return hexStr.replace("0x", "#");
    }


    public static Color getDarkColor(Color color, double level) {
        double red = color.getRed();
        double green = color.getGreen();
        double blue = color.getBlue();
        String maxColor = "red";
        if (green >= red && green >= blue) {
            maxColor = "green";
        } else if (blue >= red && blue >= green) {
            maxColor = "blue";
        }
        switch (maxColor) {
            case "red":
                red -= level;
            case "green":
                green -= level;
            case "blue":
                blue -= level;
        }

        if (red < 0) {
            red = 0;
        }

        if (green < 0) {
            green = 0;
        }

        if (blue < 0) {
            blue = 0;
        }

        return Color.color(red, green, blue);
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
