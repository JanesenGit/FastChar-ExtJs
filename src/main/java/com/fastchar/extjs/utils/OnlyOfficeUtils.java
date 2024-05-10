package com.fastchar.extjs.utils;

import com.fastchar.utils.FastFileUtils;
import com.fastchar.utils.FastStringUtils;
import org.primeframework.jwt.Signer;
import org.primeframework.jwt.domain.JWT;
import org.primeframework.jwt.hmac.HMACSigner;

import java.util.LinkedHashMap;
import java.util.Map;

public class OnlyOfficeUtils {


    public static Map<String, Object> createConfig(String onlyOfficeSecret,String fileKey, String fileTitle, String fileName,String fileUrl) {
        String documentType = "word";
        if (FastFileUtils.isExcelFile(fileName)) {
            documentType = "cell";
        } else if (FastFileUtils.isPPTFile(fileName)) {
            documentType = "slide";
        } else if (FastFileUtils.isPDFFile(fileName)) {
            documentType = "pdf";
        }

        Map<String, Object> config = new LinkedHashMap<>();
        config.put("height", "100%");
        config.put("width", "100%");

        Map<String, Object> document = new LinkedHashMap<>();
        document.put("key", fileKey);
        document.put("title", fileTitle);
        document.put("url", fileUrl);


        Map<String, Object> permissions = new LinkedHashMap<>();
        permissions.put("chat", false);
        permissions.put("comment", false);
        permissions.put("print", true);

        document.put("permissions", permissions);

        config.put("document", document);

        config.put("documentType", documentType);

        Map<String, Object> editorConfig = new LinkedHashMap<>();
        editorConfig.put("lang", "zh-CN");
        editorConfig.put("mode", "view");

        Map<String, Object> customization = new LinkedHashMap<>();
        customization.put("help", false);
        customization.put("plugins", false);
        customization.put("uiTheme", "theme-dark");

        Map<String, Object> anonymous = new LinkedHashMap<>();
        anonymous.put("request", false);
        customization.put("anonymous", anonymous);

        editorConfig.put("customization", customization);

        config.put("editorConfig", editorConfig);

        if (FastStringUtils.isNotEmpty(onlyOfficeSecret)) {
            config.put("token", createToken(onlyOfficeSecret, config));
        }
        return config;
    }

    public static String createToken(String secret,final Map<String, Object> payloadClaims) {
        try {
            // build a HMAC signer using a SHA-256 hash
            Signer signer = HMACSigner.newSHA256Signer(secret);
            JWT jwt = new JWT();
            for (String key : payloadClaims.keySet()) {  // run through all the keys from the payload
                jwt.addClaim(key, payloadClaims.get(key));  // and write each claim to the jwt
            }
            return JWT.getEncoder().encode(jwt, signer);  // sign and encode the JWT to a JSON string representation
        } catch (Exception e) {
            return "";
        }
    }

}
