package com.fastchar.extjs.action;

import com.fastchar.annotation.AFastRoute;
import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastHandler;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.annotation.AFastLog;
import com.fastchar.extjs.annotation.AFastSecurityResponse;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.extjs.annotation.AFastToken;
import com.fastchar.extjs.core.configjson.FastExtConfigJson;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtManagerErrorEntity;
import com.fastchar.extjs.entity.ExtManagerRoleEntity;
import com.fastchar.extjs.goole.authentication.core.GoogleAuthentication;
import com.fastchar.extjs.interfaces.IFastManagerListener;
import com.fastchar.extjs.out.FastExtOutCaptcha;
import com.fastchar.extjs.utils.ZXingUtils;
import com.fastchar.utils.*;

import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;

@AFastRoute({"/controller"})
public class ExtManagerAction extends FastAction {
    public static final ConcurrentHashMap<Integer, String> MANAGER_SINGLE_LOGIN_CODE = new ConcurrentHashMap<>();

    @Override
    protected String getRoute() {
        return "/manager";
    }

    /**
     * 后台管理员登录
     * 参数：
     * loginName 登录名{String}
     * loginPassword 登录密码【MD5加密后提交】 {String}
     */
    @AFastLog(value = "${managerRole}【${managerName}】进行了登录！", type = "管理员登录")
    @AFastSecurityResponse
    public void login() throws Exception {
        String loginName = getParam("loginName", true);

        setRequestAttr("managerName", loginName);
        setRequestAttr("managerRole", "后台管理员");

        boolean isLoginByName = false;
        //存在超级管理员的会话信息，调用了登录接口，以登录名查询
        ExtManagerEntity session = ExtManagerEntity.getSession(this);
        if (session != null) {
            isLoginByName = true;
        }

        FastExtConfig extConfig = FastExtConfig.getInstance();
        if (!isLoginByName) {
            if (!FastExtConfigJson.getInstance().getLoginType().equalsIgnoreCase("normal")) {
                String validateCode = FastStringUtils.defaultValue(getSession("validateCode"), FastStringUtils.buildUUID());
                if (!validateCaptcha(validateCode) && !validateCaptcha(getParam("validateCode", true))) {
                    resetCaptcha();
                    responseJson(-3, "登录失败，验证码错误！");
                    return;
                }
            }
        }

        String loginPassword = getParam("loginPassword", true);

        ExtManagerEntity managerEntity = ExtManagerEntity.getInstance().login(loginName, loginPassword);

        if (isLoginByName) {
            managerEntity = ExtManagerEntity.getInstance().getByLoginName(loginName);
        }

        String errorInfo = "";
        if (extConfig.isManagerLoginErrorLimit()) {
            int errorCount = ExtManagerErrorEntity.dao().countTodayError(loginName);
            int nextCount = Math.max(7 - errorCount, 0);
            if (nextCount > 0) {
                errorInfo = "今日还剩余" + nextCount + "次！";
            } else {
                responseJson(-1, "您今日登录错误次数超限！请明日再试！");
            }
        }

        ExtManagerErrorEntity loginError = new ExtManagerErrorEntity();
        loginError.set("managerLoginName", loginName);
        if (managerEntity != null) {

            if (managerEntity.getManagerRole() == null || managerEntity.getManagerRole().getRoleId() <= 0) {
                responseJson(-1, "登录失败！您的账户未分配角色！");
            }

            if (managerEntity.getManagerRole().getInt("roleType", -1) < 0) {
                responseJson(-1, "登录失败！您的账户角色的类型异常！");
            }

            if (managerEntity.getInt("managerState") == ExtManagerEntity.ManagerStateEnum.禁用.ordinal()) {
                responseJson(-1, "登录失败！您的账号已被禁用！");
            }

            IFastManagerListener iFastManager = FastChar.getOverrides().singleInstance(false, IFastManagerListener.class);
            if (iFastManager != null) {
                FastHandler handler = new FastHandler();
                iFastManager.onManagerLogin(managerEntity, handler);
                if (handler.getCode() != 0) {
                    responseJson(-1, handler.getError());
                }
            }
            setRequestAttr("managerName", managerEntity.getString("managerName"));
            ExtManagerRoleEntity extManagerRoleEntity = managerEntity.getObject("role");
            if (extManagerRoleEntity != null) {
                setRequestAttr("managerRole", extManagerRoleEntity.getRoleName());
            } else {
                setRequestAttr("managerRole", "管理员");
            }
            managerEntity.set("lastLoginTime", FastDateUtils.getDateString());
            managerEntity.update();

            String loginCode = FastStringUtils.buildOnlyCode("EXT");
            setSession("loginCode", loginCode);
            if (managerEntity.getInt("onlineType") == ExtManagerEntity.OnlineTypeEnum.单个终端.ordinal()) {
                MANAGER_SINGLE_LOGIN_CODE.put(managerEntity.getManagerId(), loginCode);
            } else {
                MANAGER_SINGLE_LOGIN_CODE.remove(managerEntity.getManagerId());
            }
            loginError.delete("managerLoginName");

            resetCaptcha();

            if (FastExtConfigJson.getInstance().getGoogleAuthentication()) {
                setSession("Google_Id", managerEntity.getManagerId());
                if (managerEntity.isEmpty("googleSecretKey")) {
                    responseJson(-4, "登录成功！需要绑定并进行安全验证！");
                } else {
                    responseJson(-3, "登录成功！请进行安全验证！");
                }
            } else {
                ExtManagerEntity.setSession(this, managerEntity);
                responseJson(0, "登录成功！");
            }
        } else {
            loginError.save();
            responseJson(-2, "登录失败，用户名或密码错误！" + errorInfo);
        }
    }


    @AFastLog(value = "${managerRole}【${managerName}】进行了安全验证！", type = "安全验证")
    @AFastToken
    public void verify() {
        try {
            String loginName = getParam("verify.loginName", true);
            setRequestAttr("managerName", loginName);
            setRequestAttr("managerRole", "后台管理员");

            String loginKey = getParam("verify.loginKey", true);
            Object verified = FastChar.getMemoryCache().get(loginKey);
            if (verified != null) {
                removeSession("validateCode");
                responseJson(-1, "验证失败，请勿非法使用后台！");
            }

            Map<String, Object> dataMap = getParamToMap("verify");

            TreeSet<String> keys = new TreeSet<>(dataMap.keySet());

            List<String> param = new ArrayList<>();
            for (String key : keys) {
                if (key.startsWith("^")) {
                    continue;
                }
                if (key.equalsIgnoreCase("clickPositions")) {
                    param.add("verify." + key + "=" + FastMD5Utils.MD5(FastBase64Utils.decode(String.valueOf(dataMap.get(key)))));
                } else {
                    param.add("verify." + key + "=" + FastMD5Utils.MD5(dataMap.get(key)));
                }

            }
            String base64String = FastBase64Utils.encode(FastStringUtils.join(param, "&"))
                    .replace("\n", "").replace("\r", "");

            String sign = FastMD5Utils.MD5(base64String + getSession("LoginApiKey"));


            String paramSign = getParam("sign", "false");
            if (paramSign.equalsIgnoreCase("false")) {
                responseJson(-1, "验证失败，请勿非法使用后台！");
            }

            String loginPrivateKey = getSession("LoginPrivateKey");
            if (FastStringUtils.isEmpty(loginPrivateKey)) {
                responseJson(-1, "验证失败，请刷新后台重新尝试！");
            }

            String decryptSign = FastRSAUtils.decryptByPrivateKey(loginPrivateKey, paramSign);

            if (decryptSign.equals(sign)) {
                FastChar.getMemoryCache().put(loginKey, "true");

                removeSession("LoginAPIKey");
                removeSession("LoginPrivateKey");

                String captchaKey = getParam("captchaKey", FastExtOutCaptcha.DEFAULT_CAPTCHA_KEY);
                String value = FastMD5Utils.MD5(FastStringUtils.buildUUID());
                setSession(captchaKey, value);
                setSession("validateCode", value);
                responseJson(0, "验证成功！");
            }
        } catch (Exception e) {
            responseJson(-1, "验证失败，请刷新后台重新尝试！");
        }
        responseJson(-1, "验证失败，请刷新后台重新尝试！");
    }


    private boolean validateCaptcha(String code) {
        return FastChar.getOverrides().newInstance(FastExtOutCaptcha.class).validateCaptcha(this, code);
    }

    private void resetCaptcha() {
        FastChar.getOverrides().newInstance(FastExtOutCaptcha.class).resetCaptcha(this);
    }


    /**
     * 获取谷歌验证绑定的二维码
     */
    @AFastLog(value = "${managerRole}【${managerName}】进行了谷歌身份验证器绑定！", type = "管理员登录")
    @AFastToken
    public void googleBind() throws Exception {
        int id = getSession("Google_Id");
        ExtManagerEntity managerEntity = ExtManagerEntity.dao().getById(FastNumberUtils.formatToInt(id));
        if (managerEntity == null) {
            responseJson(-1, "管理员未的登录！");
            return;
        }

        setRequestAttr("managerName", managerEntity.getManagerName());
        setRequestAttr("managerRole", managerEntity.getManagerRole().getRoleName());

        String managerLoginName = managerEntity.getString("managerLoginName");

        GoogleAuthentication googleAuthentication = new GoogleAuthentication();
        String secretKey = googleAuthentication.buildSecretKey();
        setSession("Google_SecretKey", secretKey);

        String googleAuthenticationTitle = FastExtConfigJson.getInstance().getGoogleAuthenticationTitle();
        String qrCodeContent = googleAuthentication.buildQRCodeContent(managerLoginName, secretKey, googleAuthenticationTitle);

        BufferedImage qrImage = ZXingUtils.makeQRCode(qrCodeContent, 1, 500, 500);
        if (qrImage == null) {
            responseJson(-1, "生成失败！");
            return;
        }
        responseImage(qrImage);
    }

    /**
     * 谷歌验证
     */
    @AFastLog(value = "${managerRole}【${managerName}】进行了谷歌安全验证！", type = "管理员登录")
    @AFastToken
    public void googleVerify() {
        int id = getSession("Google_Id");
        String secretKey = getSession("Google_SecretKey");
        String code = getParam("code", true);
        ExtManagerEntity managerEntity = ExtManagerEntity.dao().getById(id);
        if (managerEntity == null) {
            responseJson(-1, "管理员未登录！");
            return;
        }

        setRequestAttr("managerName", managerEntity.getManagerName());
        setRequestAttr("managerRole", managerEntity.getManagerRole().getRoleName());

        if (FastStringUtils.isEmpty(secretKey)) {
            if (managerEntity.isEmpty("googleSecretKey")) {
                responseJson(-1, "管理员未绑定谷歌验证器！");
            }
            secretKey = managerEntity.getString("googleSecretKey");
        }

        GoogleAuthentication googleAuthentication = new GoogleAuthentication();
        if (googleAuthentication.verify(secretKey, code)) {
            managerEntity.set("googleSecretKey", secretKey);
            if (managerEntity.update()) {
                removeSession("Google_Id");
                removeSession("Google_SecretKey");
                ExtManagerEntity.setSession(this, managerEntity);
                responseJson(0, "验证成功！");
            }
            responseJson(-1, "验证失败！" + managerEntity.getError());
        }
        responseJson(-1, "验证失败！");
    }


    /**
     * 重置谷歌身份验证器绑定
     */
    @AFastSession
    @AFastToken
    @AFastLog(value = "${managerRole}【${managerName}】重置了谷歌身份验证器！", type = "谷歌重置")
    public void googleReset() {
        int managerId = getParamToInt("managerId", true);
        ExtManagerEntity managerEntity = ExtManagerEntity.dao().getById(managerId);
        if (managerEntity == null) {
            responseJson(-1, "重置失败！管理员信息不存在！");
            return;
        }
        setRequestAttr("managerName", managerEntity.getManagerName());
        setRequestAttr("managerRole", managerEntity.getManagerRole().getRoleName());

        managerEntity.setNull("googleSecretKey");
        if (managerEntity.update()) {
            responseJson(0, "重置成功！");
        }
        responseJson(-1, "重置失败！" + managerEntity.getError());
    }


    /**
     * 后台操作功能时进行安全验证
     * 参数：
     * loginName 登录名{String}
     * loginPassword 登录密码【MD5加密后提交】 {String}
     * operate 操作的功能介绍
     * timeout 验证的有效期，单位秒 默认：24小时，
     */
    @AFastLog(value = "${managerRole}【${managerName}】进行了操作【${operate}】验证！", type = "安全验证")
    @AFastToken
    public void valid() {
        String loginName = getParam("loginName", true);
        String operate = getParam("operate", "安全操作验证");
        int time = getParamToInt("timeout", 24 * 60 * 60);

        setRequestAttr("managerName", loginName);
        setRequestAttr("managerRole", "后台管理员");
        setRequestAttr("operate", operate);


        if (!FastExtConfigJson.getInstance().getLoginType().equalsIgnoreCase("normal")) {
            if (!validateCaptcha(getParam("validateCode", true))) {
                responseJson(-3, "验证失败，验证码错误！");
                return;
            }
        }

        String loginPassword = getParam("loginPassword", true);

        ExtManagerEntity managerEntity = ExtManagerEntity.getInstance().login(loginName, loginPassword);
        int errorCount = ExtManagerErrorEntity.dao().countTodayError(loginName);
        int nextCount = Math.max(7 - errorCount, 0);
        String errorInfo = null;
        if (nextCount > 0) {
            errorInfo = "今日还剩余" + nextCount + "次！";
        } else {
            responseJson(-1, "您今日登录错误次数超限！请明日再试！");
        }

        ExtManagerErrorEntity payErrorEntity = new ExtManagerErrorEntity();
        payErrorEntity.set("managerLoginName", loginName);
        if (managerEntity != null) {
            if (managerEntity.getInt("managerState") == ExtManagerEntity.ManagerStateEnum.禁用.ordinal()) {
                responseJson(-1, "验证失败！您的账号已被禁用！");
            }

            IFastManagerListener iFastManager = FastChar.getOverrides().singleInstance(false, IFastManagerListener.class);
            if (iFastManager != null) {
                FastHandler handler = new FastHandler();
                iFastManager.onManagerLogin(managerEntity, handler);
                if (handler.getCode() != 0) {
                    responseJson(-1, handler.getError());
                }
            }
            payErrorEntity.delete("managerLoginName");
            if (!operate.startsWith("^")) {
                //不需要存的操作
                setCookie("ValidOperate" + FastMD5Utils.MD5(operate), true, time);
            }
            responseJson(0, "验证成功！");
        } else {
            payErrorEntity.save();
            responseJson(-2, "验证失败，用户名或密码错误！" + errorInfo);
        }
    }

    /**
     * 退出后台登录
     */
    @AFastLog(value = "${managerRole}【${managerName}】退出了登录！", type = "管理员退出")
    public void logout() {
        ExtManagerEntity managerEntity = ExtManagerEntity.getSession(this);
        if (managerEntity != null) {
            setRequestAttr("managerName", managerEntity.getManagerName());
            ExtManagerRoleEntity extManagerRoleEntity = managerEntity.getObject("role");
            setRequestAttr("managerRole", extManagerRoleEntity.getRoleName());
        } else {
            setRequestAttr("managerName", getRemoteIp());
        }
        ExtManagerEntity.removeSession(this);
        removeSession("Google_Id");
        removeSession("Google_SecretKey");
        responseJson(0, "退出成功！");
    }


    /**
     * 重置管理员账户密码
     * 参数：
     * managerId 管理员Id
     * newPassword 新的登录密码【明文】
     */
    @AFastSession
    @AFastToken
    @AFastLog(value = "${managerRole}【${managerName}】重置了登录密码！", type = "密码重置")
    public void resetPassword() {
        ExtManagerEntity sessionUser = ExtManagerEntity.getSession(this);
        setRequestAttr("managerName", sessionUser.getString("managerName"));
        ExtManagerRoleEntity extManagerRoleEntity = sessionUser.getObject("role");
        setRequestAttr("managerRole", extManagerRoleEntity.getRoleName());
        ExtManagerEntity managerEntity = new ExtManagerEntity();
        managerEntity.set("managerId", getParamToInt("managerId", true));
        managerEntity.set("managerPassword", getParam("newPassword", true));
        if (managerEntity.update()) {
            responseJson(0, "密码重置成功！");
        } else {
            responseJson(-1, "密码重置失败！");
        }
    }


    /**
     * 修改管理员密码
     * 参数：
     * managerId 管理员Id
     * managerPassword 当前登录密码【明文】
     * newPassword 新的登录密码【明文】
     * reNewPassword 确认新的登录密码【明文】
     */
    @AFastSession
    @AFastToken
    @AFastLog(value = "${managerRole}【${managerName}】修改了登录密码！", type = "密码重置")
    public void modifyPassword() {

        ExtManagerEntity sessionUser = ExtManagerEntity.getSession(this);
        setRequestAttr("managerName", sessionUser.getString("managerName"));

        ExtManagerRoleEntity extManagerRoleEntity = sessionUser.getObject("role");
        setRequestAttr("managerRole", extManagerRoleEntity.getRoleName());

        ExtManagerEntity managerEntity = ExtManagerEntity.getInstance().selectById(getParamToInt("managerId", true));

        String newPassword = getParam("newPassword", true);
        String reNewPassword = getParam("reNewPassword", true);

        String managerPassword = getParam("managerPassword", true);

        String oldPassword = managerEntity.getString("managerPassword");

        if (!newPassword.equals(reNewPassword)) {
            responseJson(-1, "两次密码输入不一致！");
            return;
        }

        if (!FastMD5Utils.MD5(managerPassword).equals(oldPassword)) {
            responseJson(-1, "当前密码输入错误！");
            return;
        }

        managerEntity.set("managerPassword", newPassword);
        if (managerEntity.update()) {
            responseJson(0, "密码修改成功！");
        } else {
            responseJson(-1, "密码修改失败！");
        }
    }


    /**
     * 更新管理员权限与角色权限相同
     * 参数：
     * managerId 管理员Id
     */
    @AFastSession
    @AFastToken
    @AFastLog(value = "${managerRole}【${managerName}】同步了管理的角色权限！", type = "权限同步")
    public void updatePower() {
        ExtManagerEntity sessionUser = ExtManagerEntity.getSession(this);
        setRequestAttr("managerName", sessionUser.getString("managerName"));

        ExtManagerRoleEntity extManagerRoleEntity = sessionUser.getObject("role");
        setRequestAttr("managerRole", extManagerRoleEntity.getRoleName());

        List<Integer> managerIds = getParamToIntList("managerId");
        for (Integer managerId : managerIds) {
            ExtManagerEntity byId = ExtManagerEntity.dao().selectById(managerId);
            if (byId == null) {
                continue;
            }
            ExtManagerRoleEntity managerRole = ExtManagerRoleEntity.dao().selectById(byId.getRoleId());
            if (managerRole != null) {
                byId.set("managerMenuPower", managerRole.getRoleMenuPower());
                byId.set("managerExtPower", managerRole.getRoleExtPower());
                byId.set("powerState", 0);
                byId.update();
            }
        }
        responseJson(0, "同步成功！");
    }


    /**
     * 清空登录错误记录
     */
    public void clearLoginError() {
        String loginName = getParam("loginName", true);

        ExtManagerErrorEntity payErrorEntity = new ExtManagerErrorEntity();
        payErrorEntity.set("managerLoginName", loginName);

        payErrorEntity.delete("managerLoginName");
        responseJson(0, "清除成功！");
    }

}
