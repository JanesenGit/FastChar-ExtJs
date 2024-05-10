package com.fastchar.extjs.interceptor;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.annotation.AFastLog;
import com.fastchar.extjs.annotation.AFastSecurityResponse;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtSystemLogEntity;
import com.fastchar.interfaces.IFastInterceptor;
import com.fastchar.out.FastOutJson;
import com.fastchar.out.FastOutText;
import com.fastchar.utils.*;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.awt.image.RenderedImage;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Stream;

public class FastExtAfterInterceptor implements IFastInterceptor {

    @Override
    public void onInterceptor(FastAction fastAction) {
        try {
            if (fastAction.getFastRoute().getMethod().isAnnotationPresent(AFastLog.class)) {
                AFastLog fastLog = fastAction.getFastRoute().getMethod().getAnnotation(AFastLog.class);

                ExtSystemLogEntity extSystemLogEntity = new ExtSystemLogEntity();
                ExtManagerEntity manager = ExtManagerEntity.getSession(fastAction);
                if (manager != null) {
                    extSystemLogEntity.set("managerId", manager.getId());
                }
                extSystemLogEntity.set("systemLogType", extSystemLogEntity.replaceHolder(fastLog.type(), fastAction.getRequest()));
                extSystemLogEntity.set("systemLogContent", extSystemLogEntity.replaceHolder(fastLog.value(), fastAction.getRequest()));
                extSystemLogEntity.set("systemSendData", FastChar.getJson().toJson(fastAction.getParamToMap()));
                if (fastAction.getFastOut() != null && fastAction.getFastOut().getData() != null) {
                    boolean dataToJson =
                            !(fastAction.getFastOut().getData() instanceof RenderedImage)
                                    && !(fastAction.getFastOut().getData() instanceof Stream);
                    if (dataToJson) {
                        extSystemLogEntity.set("systemResultData", FastChar.getJson().toJson(fastAction.getFastOut().getData()));
                    }
                }
                extSystemLogEntity.set("systemLogIp", fastAction.getRemoteIp());
                extSystemLogEntity.set("systemLogClient", fastAction.getUserAgent());
                extSystemLogEntity.put("log", false);
                extSystemLogEntity.save();

            }

            if (fastAction.getFastOut().getStatus() == 500
                    || fastAction.getFastOut().getStatus() == 502) {
                if (fastAction.getFastOut() instanceof FastOutText) {
                    fastAction.responseJson(-1, "操作失败！" + fastAction.getFastOut().getData());
                } else {
                    fastAction.responseJson(-1, "操作失败！" + fastAction.getFastOut().getDescription());
                }
            } else {
                if ((fastAction.getFastOut() instanceof FastOutJson) && fastAction.getFastRoute().getMethod().isAnnotationPresent(AFastSecurityResponse.class)) {
                    AFastSecurityResponse fastSecurityResponse = fastAction.getFastRoute().getMethod().getAnnotation(AFastSecurityResponse.class);
                    if (fastSecurityResponse.value() && FastExtConfig.getInstance().isSecurityResponse()) {
                        String responseAESPassword = fastAction.getSession("ResponseAESPassword");

                        if (FastStringUtils.isNotEmpty(responseAESPassword)) {
                            String jsonData = FastChar.getJson().toJson(fastAction.getFastOut().getData());

                            //按照10kb进行分割
                            List<String> chunks = splitContent(jsonData, 1024 * 10);
                            List<Object> data = new ArrayList<>();
                            for (String chunk : chunks) {
                                String encrypt = FastAESUtils.encrypt(this.pureBase64(FastBase64Utils.encode(chunk)), responseAESPassword);
                                data.add(this.pureBase64(encrypt));
                            }

                            fastAction.setResponseHeader("Security-Response", String.valueOf(true));
                            fastAction.responseJson(data);
                            return;
                        }
                    }
                }
                fastAction.setResponseHeader("Security-Response", String.valueOf(false));
                fastAction.invoke();
            }
        } catch (Exception e) {
            FastChar.getLogger().error(this.getClass(), e);
            fastAction.responseJson(-1, "操作失败！" + FastStringUtils.getThrowableMessage(e));
        }
    }

    private String pureBase64(String str) {
        return str.replace("\r", "")
                .replace("\t", "")
                .replace("\n", "")
                .replace(" ", "");
    }

    private List<String> splitContent(String content, int length) {
        List<String> result = new ArrayList<>();
        int start = 0;
        while (start < content.length()) {
            result.add(content.substring(start, Math.min(start + length, content.length())));
            start += length;
        }
        return result;
    }

}
