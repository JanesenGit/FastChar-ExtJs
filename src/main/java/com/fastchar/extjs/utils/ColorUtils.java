package com.fastchar.extjs.utils;

//import javafx.scene.paint.Color;

//import javafx.scene.paint.Color;

import com.fastchar.utils.FastNumberUtils;

import java.awt.*;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ColorUtils {

    public static String getLightColor(String sourceCode, double level) {
        if (isRgbColor(sourceCode)) {
            Color color = RgbToColor(sourceCode);
            if (color != null) {
                sourceCode = ColorToHex(color);
            }
        }
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
     *
     * @param hexColor 原色
     * @param level    深度0~1
     * @return 加深后的颜色
     */
    public static String getDarkColor(String hexColor, double level) {
        Color darkColor = getDarkColor(HexToColor(hexColor), level);
        return ColorToHex(darkColor);
    }


    public static boolean isRgbColor(String color) {
        return color.toLowerCase().startsWith("rgb");
    }
    public static boolean isHexColor(String color) {
        return color.toLowerCase().startsWith("#");
    }

    public static Color RgbToColor(String rgbColor) {
        if (isRgbColor(rgbColor)) {
            String regStr = "rgb[a]?\\((.*)\\)";
            Matcher matcher = Pattern.compile(regStr).matcher(rgbColor);
            if (matcher.find()) {
                String group = matcher.group(1);
                String[] values = group.replace(" ", "").split(",");
                List<Integer> colorValue = new ArrayList<>();
                for (String value : values) {
                    colorValue.add(FastNumberUtils.formatToInt(value));
                }
                for (int i = colorValue.size(); i < 4; i++) {
                    if (i == 3) {
                        colorValue.add(1);
                    } else {
                        colorValue.add(255);
                    }
                }
                return new Color(colorValue.get(0), colorValue.get(1), colorValue.get(2), colorValue.get(3));
            }
        }
        return null;
    }


    public static Color getDarkColor(Color color, double level) {
        int red = color.getRed();
        int green = color.getGreen();
        int blue = color.getBlue();
        String maxColor = "red";
        if (green >= red && green >= blue) {
            maxColor = "green";
        } else if (blue >= red) {
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
        return new Color(red, green, blue);
    }

    private static int changeHex2Int(String temp) {
        BigInteger bigInteger = new BigInteger(temp, 16);
        return Integer.parseInt(bigInteger.toString());
    }

    private static String changeInt2Hex(String temp) {
        BigInteger bigInteger = new BigInteger(temp, 10);
        return Integer.toHexString(Integer.parseInt(bigInteger.toString()));
    }

    public static Color HexToColor(String str) {
        if (isRgbColor(str)) {
            return RgbToColor(str);
        }
        return new Color(Integer.parseInt(str.substring(1), 16));
    }

    public static String ColorToHex(Color color) {
        String R = Integer.toHexString(color.getRed() & 0xff);
        R = R.length() < 2 ? ('0' + R) : R;
        String B = Integer.toHexString(color.getBlue() & 0xff);
        B = B.length() < 2 ? ('0' + B) : B;
        String G = Integer.toHexString(color.getGreen() & 0xff);
        G = G.length() < 2 ? ('0' + G) : G;
        return '#' + R + G + B;
    }

}
