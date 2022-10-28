package com.fastchar.extjs.interceptor;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.FastExtHelper;
import com.fastchar.extjs.action.ExtManagerAction;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.extjs.core.FastExtHeadHtmlParser;
import com.fastchar.extjs.core.heads.FastHeadExtInfo;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.interfaces.IFastInterceptor;
import com.fastchar.utils.FastMD5Utils;
import com.fastchar.utils.FastStringUtils;

import java.net.URLDecoder;

public class FastExtGlobalInterceptor implements IFastInterceptor {
    @Override
    public void onInterceptor(FastAction fastAction) throws Exception {
        try {
            boolean checkSession = false;

            if (fastAction.getFastRoute().getActionClass().isAnnotationPresent(AFastSession.class)) {
                AFastSession annotation = fastAction.getFastRoute().getActionClass().getAnnotation(AFastSession.class);
                checkSession = annotation.value();
            }

            if (fastAction.getFastRoute().getMethod().isAnnotationPresent(AFastSession.class)) {
                AFastSession annotation = fastAction.getFastRoute().getMethod().getAnnotation(AFastSession.class);
                checkSession = annotation.value();
            }

            ExtManagerEntity manager = ExtManagerEntity.getSession(fastAction);
            if (checkSession) {
                if (manager == null) {
                    fastAction.deleteAllParamFiles();
                    fastAction.setStatus(203).responseJson(203, "会话已失效，请您重新登录！");
                    return;
                }

                if (ExtManagerAction.MANAGER_SINGLE_LOGIN_CODE.containsKey(manager.getManagerId())) {
                    String loginCode = fastAction.getSession("loginCode");
                    String lastLoginCode = ExtManagerAction.MANAGER_SINGLE_LOGIN_CODE.get(manager.getManagerId());
                    if (FastStringUtils.isNotEmpty(lastLoginCode) && FastStringUtils.isNotEmpty(loginCode) && !lastLoginCode.equalsIgnoreCase(loginCode)) {
                        fastAction.deleteAllParamFiles();
                        fastAction.setStatus(204).responseJson(204, "您的账户已在其他终端登录！");
                        return;
                    }
                }
            }

            if (manager != null) {
                fastAction.addResponseHeader("Project-Manager-ID", FastMD5Utils.MD5(manager.getManagerId()));
            }
            fastAction.addResponseHeader("Project-Debug", String.valueOf(FastChar.getConstant().isDebug()));

            if (fastAction.getParamToBoolean("managerWeb", Boolean.FALSE)) {
                FastExtHeadHtmlParser fastHeadHtmlObserver = FastExtHeadHtmlParser.getInstance();
                if (fastHeadHtmlObserver.isModified()) {
                    fastHeadHtmlObserver.initHeadHtml();
                }

                FastHeadExtInfo version = FastExtConfig.getInstance().getExtInfo("version");
                if (version != null) {
                    fastAction.addResponseHeader("Project-Version-Code", version.getValue());
                    fastAction.addResponseHeader("Project-Version-Name", version.getMapWrap().getString("desc"));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        if (fastAction.getFastRoute().getRoute().equalsIgnoreCase("/officeViewer")) {
            String url = fastAction.getParam("url", "");
            if (url.equalsIgnoreCase("cookie")) {
                url = URLDecoder.decode(fastAction.getCookie("OfficeViewerUrl", ""), "utf-8");
                fastAction.setParam("url", url);
            } else if (fastAction.isParamExists("cache")) {
                url = FastExtHelper.getCache(fastAction.getParam("cache"));
                fastAction.setParam("url", url);
            }
        }
        fastAction.invoke();
    }
}
