package com.fastchar.extjs.goole.authentication.core;

import org.apache.commons.codec.binary.Base32;
import org.apache.commons.codec.binary.Hex;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.security.SecureRandom;

public class GoogleAuthentication {

    private static final int TIME_EXCURSION = 3;

    public String buildSecretKey() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[20];
        random.nextBytes(bytes);
        Base32 base32 = new Base32();
        return base32.encodeToString(bytes);
    }


    /**
     * 构建绑定二维码内容
     *
     * @param account   账户信息（展示在Google Authenticator App中的）
     * @param secretKey 密钥
     * @param title     标题 （展示在Google Authenticator App中的）
     */
    public String buildQRCodeContent(String account, String secretKey, String title) {
        try {
            return "otpauth://totp/"
                    + URLEncoder.encode(title + ":" + account, "UTF-8").replace("+", "%20")
                    + "?secret=" + URLEncoder.encode(secretKey, "UTF-8").replace("+", "%20")
                    + "&issuer=" + URLEncoder.encode(title, "UTF-8").replace("+", "%20");
        } catch (UnsupportedEncodingException e) {
            throw new IllegalStateException(e);
        }
    }


    /**
     * 根据密钥获取验证码
     * 返回字符串是因为验证码有可能以 0 开头
     *
     * @param secretKey 密钥
     * @param time      第几个 30 秒 System.currentTimeMillis() / 1000 / 30
     */
    public String getTOTP(String secretKey, long time) {
        Base32 base32 = new Base32();
        byte[] bytes = base32.decode(secretKey.toUpperCase());
        String hexKey = Hex.encodeHexString(bytes);
        String hexTime = Long.toHexString(time);
        return TOTP.generateTOTP(hexKey, hexTime, "6");
    }


    /**
     * 校验方法
     * 验证码是使用基于时间的 TOTP 算法, 依赖于客户端与服务端时间的一致性. 如果客户端时间与服务端时间相差过大, 那在用户没有同步时间的情况下,
     * 永远与服务端进行匹配. 同时服务端也有可能出现时间偏差的情况, 这样反而导致时间正确的用户校验无法通过
     * 为了解决这种情况, 我们可以使用 ** 时间偏移量 ** 来解决该问题
     *
     * @param secretKey 密钥
     * @param code      用户输入的 TOTP 验证码
     */
    public boolean verify(String secretKey, String code) {
        long time = System.currentTimeMillis() / 1000 / 30;
        for (int i = -TIME_EXCURSION; i <= TIME_EXCURSION; i++) {
            String totp = getTOTP(secretKey, time + i);
            if (code.equals(totp)) {
                return true;
            }
        }
        return false;
    }

}
