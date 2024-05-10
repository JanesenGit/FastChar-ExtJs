package com.fastchar.extjs.core;

import com.fastchar.utils.FastBase64Utils;
import com.fastchar.utils.FastNumberUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.*;

public class FastExtSign {


    private String publicKey;
    private String privateKeyPKCS8;
    private String privateKey;

    public void initKey() {
        FastExtRSABuilder rsaBuilder = new FastExtRSABuilder();
        FastExtRSABuilder.RSAKey rsaBuilderKey = rsaBuilder.createKey();

        this.privateKeyPKCS8 = rsaBuilderKey.getPurePrivateKeyPkcs8();
        this.publicKey = rsaBuilderKey.getPurePublicKey();
        this.privateKey = rsaBuilderKey.getPurePrivateKey();
    }

    public String getPrivateKey() {
        return privateKey;
    }

    public String getPublicKey() {
        return publicKey;
    }

    public String getPrivateKeyPKCS8() {
        return privateKeyPKCS8;
    }

    public String getSignPrivateKey() {
        return this.privateKeyPKCS8;
    }

    public PublicKeyInfo getSignPublicKey() {
        List<Integer> codes = new ArrayList<>();

        char[] charArray = this.publicKey.toCharArray();
        for (char c : charArray) {
            codes.add((int) c);
        }

        List<String> values = new ArrayList<>();
        for (Integer code : codes) {
            values.add(values.size() + "@" + FastBase64Utils.encode(String.valueOf(code)));
        }
        Collections.shuffle(values);

        List<String> realValues = new ArrayList<>(values);
        realValues.replaceAll(s -> s.split("@")[1]);

        List<String> holders = new ArrayList<>(values);

        for (int i = 0; i < holders.size(); i++) {
            holders.set(i, holders.get(i) + "#" + i);
        }
        holders.sort((o1, o2) -> {
            String[] split1 = o1.split("@");
            String[] split2 = o2.split("@");
            return Integer.compare(FastNumberUtils.formatToInt(split1[0]), FastNumberUtils.formatToInt(split2[0]));
        });

        List<Integer> numberIndex = new ArrayList<>();
        for (String value : holders) {
            numberIndex.add(FastNumberUtils.formatToInt(value.split("#")[1]));
        }

        PublicKeyInfo publicKeyInfo = new PublicKeyInfo();
        publicKeyInfo.setKey(FastBase64Utils.encode(FastStringUtils.join(realValues, "|")).replace("\n", "").replace("\r", ""));
        publicKeyInfo.setPoints(numberIndex);
        return publicKeyInfo;
    }


    public static class PublicKeyInfo{

        private List<Integer> points;
        private String key;

        public List<Integer> getPoints() {
            return points;
        }

        public PublicKeyInfo setPoints(List<Integer> points) {
            this.points = points;
            return this;
        }

        public String getKey() {
            return key;
        }

        public PublicKeyInfo setKey(String key) {
            this.key = key;
            return this;
        }
    }

}
