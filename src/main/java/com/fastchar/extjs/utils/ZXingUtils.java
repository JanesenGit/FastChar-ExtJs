package com.fastchar.extjs.utils;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Hashtable;

public class ZXingUtils {

    public static BufferedImage makeQRCode(String content, int width, int height) {
        return makeQRCode(content, 2, width, height);
    }

    public static BufferedImage makeQRCode(String content,int margin, int width, int height) {
        try {
            Hashtable<EncodeHintType, Object> hints = new Hashtable<EncodeHintType, Object>();
            hints.put(EncodeHintType.CHARACTER_SET, "utf-8");
            hints.put(EncodeHintType.MARGIN, margin);
            BitMatrix bitMatrix = new MultiFormatWriter().encode(content,
                    BarcodeFormat.QR_CODE, width, height, hints);
            return MatrixToImageWriter.toBufferedImage(bitMatrix);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static BufferedImage makeQRCode(File logoPath, String content, int width, int height) {
        BufferedImage bufferedImage = makeQRCode(content, width, height);
        try {
            BufferedImage read = ImageIO.read(logoPath);
            insertImage(bufferedImage, read, true);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return bufferedImage;
    }

    public static BufferedImage makeQRCode(String logoPath, String content, int width, int height) {
        return makeQRCode(new File(logoPath), content, width, height);
    }


    public static void insertImage(BufferedImage source, Image imgPath,
                                   boolean needCompress) {
        try {
            if(imgPath==null) return;
            int width = imgPath.getWidth(null);
            int height = imgPath.getHeight(null);
            if (needCompress) { // 压缩LOGO
                Image image = imgPath.getScaledInstance(width, height,
                        Image.SCALE_SMOOTH);
                BufferedImage tag = new BufferedImage(width, height,
                        BufferedImage.TYPE_INT_RGB);
                Graphics g = tag.getGraphics();
                g.drawImage(image, 0, 0, null);
                g.dispose();
                imgPath = image;
            }
            Graphics2D graph = source.createGraphics();
            int x = (source.getWidth() - width) / 2;
            int y = (source.getHeight() - height) / 2;
            graph.drawImage(imgPath, x, y, width, height, null);
            Shape shape = new RoundRectangle2D.Float(x, y, width, width, 6, 6);
            graph.setStroke(new BasicStroke(3f));
            graph.draw(shape);
            graph.dispose();
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }



    public static class MatrixToImageWriter {

        private static final int BLACK = 0xFF000000;
        private static final int WHITE = 0xFFFFFFFF;

        private MatrixToImageWriter() {}


        public static BufferedImage toBufferedImage(BitMatrix matrix) {
            int width = matrix.getWidth();
            int height = matrix.getHeight();
            BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            for (int x = 0; x < width; x++) {
                for (int y = 0; y < height; y++) {
                    image.setRGB(x, y, matrix.get(x, y) ? BLACK : WHITE);
                }
            }
            return image;
        }


        public static void writeToFile(BitMatrix matrix, String format, File file)
                throws IOException {
            BufferedImage image = toBufferedImage(matrix);
            if (!ImageIO.write(image, format, file)) {
                throw new IOException("Could not write an image of format " + format + " to " + file);
            }
        }


        public static void writeToStream(BitMatrix matrix, String format, OutputStream stream)
                throws IOException {
            BufferedImage image = toBufferedImage(matrix);
            if (!ImageIO.write(image, format, stream)) {
                throw new IOException("Could not write an image of format " + format);
            }
        }

    }


}
