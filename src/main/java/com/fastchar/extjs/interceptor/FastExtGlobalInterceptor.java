package com.fastchar.extjs.interceptor;

import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.extjs.FastExtHelper;
import com.fastchar.extjs.action.ExtManagerAction;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.extjs.annotation.AFastToken;
import com.fastchar.extjs.core.configjson.FastExtConfigJson;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.interfaces.IFastInterceptor;
import com.fastchar.utils.FastBase64Utils;
import com.fastchar.utils.FastMD5Utils;
import com.fastchar.utils.FastRSAUtils;
import com.fastchar.utils.FastStringUtils;

import java.net.URLDecoder;

public class FastExtGlobalInterceptor implements IFastInterceptor {
    @Override
    public void onInterceptor(FastAction fastAction) throws Exception {
        try {

            if (isCheckSession(fastAction)) {
                ExtManagerEntity manager = ExtManagerEntity.getSession(fastAction);
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
                        fastAction.setStatus(203).responseJson(204, "您的账户已在其他终端登录！");
                        return;
                    }
                }
                fastAction.addResponseHeader("Project-Manager-ID", FastMD5Utils.MD5(manager.getManagerId()));
            }

            if (isCheckToken(fastAction)) {
                if (!verifyToken(fastAction)) {
                    fastAction.deleteAllParamFiles();
                    fastAction.setStatus(203).responseJson(205, "会话安全异常，请刷新系统重试！");
                    return;
                }
                fastAction.addResponseHeader("Token-Verified", String.valueOf(true));
            }

            fastAction.addResponseHeader("Project-Debug", String.valueOf(FastChar.getConstant().isDebug()));

            if (fastAction.getParamToBoolean("managerWeb", Boolean.FALSE)) {

                FastExtConfigJson extConfigJson = FastExtConfigJson.getInstance();
                fastAction.addResponseHeader("Project-Version-Code", String.valueOf(extConfigJson.getVersionValue()));
                fastAction.addResponseHeader("Project-Version-Name", extConfigJson.getVersionDesc());
                fastAction.addResponseHeader("Project-Restart", String.valueOf(extConfigJson.getRestart()));
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
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

    private static boolean isCheckSession(FastAction fastAction) {
        boolean checkSession = false;

        if (fastAction.getFastRoute().getActionClass().isAnnotationPresent(AFastSession.class)) {
            AFastSession annotation = fastAction.getFastRoute().getActionClass().getAnnotation(AFastSession.class);
            checkSession = annotation.value();
        }

        if (fastAction.getFastRoute().getMethod().isAnnotationPresent(AFastSession.class)) {
            AFastSession annotation = fastAction.getFastRoute().getMethod().getAnnotation(AFastSession.class);
            checkSession = annotation.value();
        }
        return checkSession;
    }

    private static boolean isCheckToken(FastAction fastAction) {
        boolean checkToken = false;

        if (fastAction.getFastRoute().getActionClass().isAnnotationPresent(AFastToken.class)) {
            AFastToken annotation = fastAction.getFastRoute().getActionClass().getAnnotation(AFastToken.class);
            checkToken = annotation.value();
        }

        if (fastAction.getFastRoute().getMethod().isAnnotationPresent(AFastToken.class)) {
            AFastToken annotation = fastAction.getFastRoute().getMethod().getAnnotation(AFastToken.class);
            checkToken = annotation.value();
        }
        return checkToken;
    }

    private static boolean verifyToken(FastAction fastAction) {
        try {
            Boolean passLogin = fastAction.getSession("passLogin");
            if (passLogin != null && passLogin) {
                return true;
            }

            String timestamp = fastAction.getRequestHeader("Timestamp");

            String sign = FastMD5Utils.MD5(FastBase64Utils.encode(timestamp) + fastAction.getSession("TokenApiKey"));

            String token = fastAction.getRequestHeader("Token");
            if (FastStringUtils.isEmpty(token)) {
                return false;
            }
            if (token.equalsIgnoreCase("false")) {
                return false;
            }

            String tokenPrivateKey = fastAction.getSession("TokenPrivateKey");
            if (FastStringUtils.isEmpty(tokenPrivateKey)) {
                return false;
            }
            String decryptSign = FastRSAUtils.decryptByPrivateKey(tokenPrivateKey, token);
            if (FastStringUtils.isEmpty(decryptSign)) {
                return false;
            }
            return decryptSign.equals(sign);
        } catch (Throwable e) {
            return false;
        }
    }
}
