package com.fastchar.extjs.out;

import com.fastchar.core.FastAction;
import com.fastchar.out.FastOut;
import com.fastchar.servlet.http.FastHttpServletResponse;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.OutputStream;
import java.util.Random;

/**
 * 响应验证码图片
 *
 * @author Janesen
 */
public class FastExtOutCaptcha extends FastOut<FastExtOutCaptcha> {
    public static final String DEFAULT_CAPTCHA_KEY = "FastChar-ExtJS-Captcha";

    protected String captchaChars = "3456789ABCDEFGHJKMNPQRSTUVWXY";
    protected String[] fontNames = new String[]{"Verdana"};
    protected int[][] colors = {{0, 135, 255}, {51, 153, 51}, {255, 102, 102}, {255, 153, 0}, {153, 102, 0}, {153, 102, 153}, {51, 153, 153}, {102, 102, 255}, {0, 102, 204}, {204, 51, 51}, {0, 153, 204}, {0, 51, 102}};

    protected boolean simpleCaptcha;

    public FastExtOutCaptcha() {
        this.contentType = "image/jpeg";
    }

    @Override
    public void response(FastAction action) throws Exception {
        String captchaKey = action.getParam("captchaKey", DEFAULT_CAPTCHA_KEY);
        simpleCaptcha = action.getParamToBoolean("captchaSimple", Boolean.valueOf(simpleCaptcha));

        FastHttpServletResponse response = action.getResponse();
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Cache-Control", "no-cache");
        response.setDateHeader("Expires", 0);
        response.setStatus(getStatus());
        response.setContentType(toContentType(action));

        char[] chars = randomChar();
        action.setSession(captchaKey, new String(chars));
        outCaptcha(action, chars);
    }

    public boolean validateCaptcha(FastAction action, String code) {
        String captchaKey = action.getParam("captchaKey", DEFAULT_CAPTCHA_KEY);
        Object captcha = action.getSession(captchaKey);
        if (captcha != null) {
            return captcha.toString().equalsIgnoreCase(code);
        }
        return false;
    }

    public void resetCaptcha(FastAction action) {
        String captchaKey = action.getParam("captchaKey", DEFAULT_CAPTCHA_KEY);
        action.removeSession(captchaKey);
    }


    private Color randomColor(int alpha) {
        Random random = new Random();
        int r = random.nextInt(255);
        int g = random.nextInt(255);
        int b = random.nextInt(255);
        return new Color(r, g, b, alpha);
    }


    private char[] randomChar() {
        Random random = new Random();
        return new char[]{captchaChars.charAt(random.nextInt(captchaChars.length())),
                captchaChars.charAt(random.nextInt(captchaChars.length())),
                captchaChars.charAt(random.nextInt(captchaChars.length())),
                captchaChars.charAt(random.nextInt(captchaChars.length()))};
    }


    private void outCaptcha(FastAction action, char[] codes) throws Exception {
        Random random = new Random();

        int width = 120;
        int height = 40;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = (Graphics2D) image.getGraphics();

        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_NEAREST_NEIGHBOR);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, width, height);

        g2d.setColor(randomColor(20));
        g2d.fillRect(0, 0, width, height);


        g2d.setStroke(new BasicStroke(1.5f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL));

        if (!simpleCaptcha) {
            for (int i = 0; i < 15; i++) {
                g2d.setColor(randomColor(150));
                int oWidth = Math.max(random.nextInt(28), 10);
                int oHeight = Math.max(random.nextInt(28), 10);
                g2d.drawOval(random.nextInt(width - oWidth), random.nextInt(height),
                        oWidth,
                        oHeight);
            }
        }


        int[] xArray = new int[codes.length];
        int[] yArray = new int[codes.length];
        Font[] fontArray = new Font[codes.length];

        for (int i = 0; i < codes.length; i++) {
            String code = String.valueOf(codes[i]);
            Font font = new Font(fontNames[random.nextInt(fontNames.length)], Font.ITALIC | Font.BOLD, 32);
            fontArray[i] = font;

            FontMetrics fm = g2d.getFontMetrics(font);
            Rectangle2D stringBounds = fm.getStringBounds(code, g2d);
            double charWidth = stringBounds.getWidth();
            double charHeight = stringBounds.getHeight();
            int y = (int) Math.max(random.nextInt(height), charHeight);
            int x = (int) (charWidth * i + (width - charWidth * codes.length) / 2);
            yArray[i] = y;
            xArray[i] = x;
        }


        Color lastColor = Color.CYAN;
        for (int i = 0; i < codes.length; i++) {
            int degree = random.nextInt(32);
            if (i % 2 == 0) {
                degree = degree * (-1);
            }
            g2d.setFont(fontArray[i]);
            int x = xArray[i];
            int y = yArray[i];
            g2d.rotate(Math.toRadians(degree), x, y);

            int index = random.nextInt(colors.length);
            lastColor = new Color(colors[index][0], colors[index][1], colors[index][2]);
            g2d.setColor(lastColor);
            g2d.drawString(String.valueOf(codes[i]), x, y);
            g2d.rotate(-Math.toRadians(degree), x, y);
        }

        if (!simpleCaptcha) {
            int area = (int) (0.1f * width * height);
            for (int i = 0; i < area; i++) {
                int x = random.nextInt(width);
                int y = random.nextInt(height);
                image.setRGB(x, y, lastColor.getRGB());
            }
        }

        g2d.dispose();

        try (OutputStream outputStream = action.getResponse().getOutputStream()) {
            ImageIO.write(image, "jpg", outputStream);
            outputStream.flush();
        }
    }

    public boolean isSimpleCaptcha() {
        return simpleCaptcha;
    }

    public FastExtOutCaptcha setSimpleCaptcha(boolean simpleCaptcha) {
        this.simpleCaptcha = simpleCaptcha;
        return this;
    }
}
