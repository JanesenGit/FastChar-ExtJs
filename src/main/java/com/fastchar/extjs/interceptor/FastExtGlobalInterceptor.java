package com.fastchar.extjs.interceptor;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.interfaces.IFastInterceptor;

public class FastExtGlobalInterceptor implements IFastInterceptor {
    @Override
    public void onInterceptor(FastAction fastAction) {

        boolean checkSession = false;

        boolean checkSign = false;

        if (fastAction.getFastRoute().getActionClass().isAnnotationPresent(AFastSession.class)) {
            AFastSession annotation = fastAction.getFastRoute().getActionClass().getAnnotation(AFastSession.class);
            checkSession = annotation.value();
        }


        if (fastAction.getFastRoute().getMethod().isAnnotationPresent(AFastSession.class)) {
            AFastSession annotation = fastAction.getFastRoute().getMethod().getAnnotation(AFastSession.class);
            checkSession = annotation.value();
        }


        if (checkSession) {
            Object manager = fastAction.getSession("manager");
            if (manager == null) {
                fastAction.deleteAllParamFiles();
                fastAction.setStatus(203).responseJson(203, "会话已失效！");
                return;
            }
        }
        fastAction.invoke();
    }
}
