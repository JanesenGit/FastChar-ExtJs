package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.utils.FastFileUtils;
import com.fastchar.utils.FastStringUtils;
import org.bouncycastle.asn1.ASN1Encodable;
import org.bouncycastle.asn1.ASN1Primitive;
import org.bouncycastle.asn1.pkcs.PrivateKeyInfo;
import org.bouncycastle.util.io.pem.PemObject;
import org.bouncycastle.util.io.pem.PemWriter;

import java.io.File;
import java.io.StringWriter;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.ArrayList;
import java.util.List;

public class FastExtRSABuilder {

    private int keyLength = 1024;

    public int getKeyLength() {
        return keyLength;
    }

    public FastExtRSABuilder setKeyLength(int keyLength) {
        this.keyLength = keyLength;
        return this;
    }

    public RSAKey createKey() {
        try {
            KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
            kpg.initialize(keyLength);
            KeyPair keyPair = kpg.generateKeyPair();

            RSAKey rsaKey = new RSAKey();
            rsaKey.setPublicKey(pkcsToPem(keyPair.getPublic().getEncoded(), true));
            rsaKey.setPrivateKey(toPkcs1Pem(keyPair.getPrivate().getEncoded()));
            rsaKey.setPrivateKeyPkcs8(pkcsToPem(keyPair.getPrivate().getEncoded(), false));
            return rsaKey;
        } catch (Exception e) {
            FastChar.getLogger().error(this.getClass(), e);
        }
        return null;
    }



    private String pkcsToPem(byte[] keyBytes, boolean isPublic) throws Exception {
        String type;
        if (isPublic) {
            type = "RSA PUBLIC KEY";
        } else {
            type = "RSA PRIVATE KEY";
        }
        PemObject pemObject = new PemObject(type, keyBytes);
        StringWriter stringWriter = new StringWriter();
        PemWriter pemWriter = new PemWriter(stringWriter);
        pemWriter.writeObject(pemObject);
        pemWriter.close();
        return stringWriter.toString();
    }


    private String toPkcs1Pem(byte[] privateBytes) throws Exception {
        PrivateKeyInfo pkInfo = PrivateKeyInfo.getInstance(privateBytes);
        ASN1Encodable asn1Encodable = pkInfo.parsePrivateKey();
        ASN1Primitive asn1Primitive = asn1Encodable.toASN1Primitive();
        byte[] privateKeyPKCS1 = asn1Primitive.getEncoded();
        return pkcsToPem(privateKeyPKCS1, false);
    }



    public static class RSAKey{
        private String publicKey;
        private String privateKey;
        private String privateKeyPkcs8;

        public String getPrivateKeyPkcs8() {
            return privateKeyPkcs8;
        }

        public String getPurePrivateKeyPkcs8() {
            return this.pureValue(this.getPrivateKeyPkcs8());
        }

        public RSAKey setPrivateKeyPkcs8(String privateKeyPkcs8) {
            this.privateKeyPkcs8 = privateKeyPkcs8;
            return this;
        }

        public String getPublicKey() {
            return publicKey;
        }

        public String getPurePublicKey() {
            return this.pureValue(this.getPublicKey());
        }

        public RSAKey setPublicKey(String publicKey) {
            this.publicKey = publicKey;
            return this;
        }

        public String getPrivateKey() {
            return privateKey;
        }

        public String getPurePrivateKey() {
            return this.pureValue(this.getPrivateKey());
        }


        public RSAKey setPrivateKey(String privateKey) {
            this.privateKey = privateKey;
            return this;
        }


        private String pureValue(String value) {
            List<String> values = new ArrayList<>();
            String publicKeyValue = value.replace("\r", "");
            String[] split = publicKeyValue.split("\n");
            for (String s : split) {
                if (s.startsWith("--")) {
                    continue;
                }
                values.add(s);
            }
            return FastStringUtils.join(values, "");
        }
    }


}
