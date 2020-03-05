package com.fastchar.extjs.interceptor;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.extjs.annotation.AFastLog;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtSystemLogEntity;
import com.fastchar.interfaces.IFastInterceptor;
import com.fastchar.interfaces.IFastJson;
import com.fastchar.out.FastOutText;

public class FastExtAfterInterceptor implements IFastInterceptor {

    @Override
    public void onInterceptor(FastAction fastAction) {
        try {
            if (fastAction.getFastRoute().getMethod().isAnnotationPresent(AFastLog.class)) {
                AFastLog fastLog = fastAction.getFastRoute().getMethod().getAnnotation(AFastLog.class);

                ExtSystemLogEntity extSystemLogEntity = new ExtSystemLogEntity();
                ExtManagerEntity manager = fastAction.getSession("manager");
                if (manager != null) {
                    extSystemLogEntity.set("managerId", manager.getId());
                }
                extSystemLogEntity.set("systemLogType", extSystemLogEntity.replaceHolder(fastLog.type(), fastAction.getRequest()));
                extSystemLogEntity.set("systemLogContent", extSystemLogEntity.replaceHolder(fastLog.value(), fastAction.getRequest()));
                extSystemLogEntity.set("systemSendData", FastChar.getJson().toJson(fastAction.getParamToMap()));
                extSystemLogEntity.set("systemResultData", FastChar.getJson().toJson(fastAction.getFastOut().getData()));
                extSystemLogEntity.set("systemLogIp", fastAction.getRemoteIp());
                extSystemLogEntity.set("systemLogClient", fastAction.getUserAgent());
                extSystemLogEntity.put("log", false);
                extSystemLogEntity.save();

            }


            if (fastAction.getFastOut().getStatus() == 404
                    || fastAction.getFastOut().getStatus() == 500
                    || fastAction.getFastOut().getStatus() == 502) {
                if (fastAction.getFastOut() instanceof FastOutText) {
                    fastAction.responseJson(-1, "操作失败！" + fastAction.getFastOut().getData());
                }else{
                    fastAction.responseJson(-1, "操作失败！" + fastAction.getFastOut().getDescription());
                }
            } else {
                fastAction.invoke();
            }
        } catch (Exception e) {
            e.printStackTrace();
            fastAction.invoke();
        }
    }
}
