package com.fastchar.extjs.interceptor;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.extjs.annotation.AFastLog;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtSystemLogEntity;
import com.fastchar.interfaces.IFastInterceptor;
import com.fastchar.out.FastOutText;
import com.fastchar.utils.FastStringUtils;

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
                    extSystemLogEntity.set("systemResultData", FastChar.getJson().toJson(fastAction.getFastOut().getData()));
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
                fastAction.invoke();
            }
        } catch (Exception e) {
            e.printStackTrace();
            fastAction.responseJson(-1, "操作失败！" + FastStringUtils.getThrowableMessage(e));
        }
    }
}
