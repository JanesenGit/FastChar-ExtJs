package com.fastchar.extjs.action;

import com.fastchar.annotation.AFastRoute;
import com.fastchar.core.FastAction;
import com.fastchar.core.FastChar;
import com.fastchar.core.FastEntity;
import com.fastchar.core.FastHandler;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.annotation.AFastLog;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.extjs.core.heads.FastHeadExtInfo;
import com.fastchar.extjs.entity.*;
import com.fastchar.extjs.interfaces.IFastManagerListener;
import com.fastchar.utils.FastMD5Utils;

import java.util.List;

@AFastRoute({"/controller"})
public class ExtManagerAction extends FastAction {

    @Override
    protected String getRoute() {
        return "/manager";
    }

    @AFastLog(value = "${managerRole}【${managerName}】进行了登录！", type = "管理员登录")
    public void login() {
        String loginName = getParam("loginName", true);

        setRequestAttr("managerName", loginName);
        setRequestAttr("managerRole", "后台管理员");

        FastHeadExtInfo extInfo = FastExtConfig.getInstance().getExtInfo("login-type");
        if (extInfo != null) {
            if (!extInfo.getValue().equalsIgnoreCase("normal")) {
                if (!validateCaptcha(getParam("validateCode", true))) {
                    responseJson(-3, "登录失败，验证码错误！");
                    return;
                }
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
            }else{
                setRequestAttr("managerRole", "管理员");
            }

            setSession("manager", managerEntity);
            payErrorEntity.delete("managerLoginName");

            responseJson(0, "登录成功！");
        } else {
            payErrorEntity.save();
            responseJson(-2, "登录失败，用户名或密码错误！" + errorInfo);
        }
    }


    @AFastLog(value = "${managerRole}【${managerName}】进行了操作【${operate}】验证！", type = "安全验证")
    public void valid() {
        String loginName = getParam("loginName", true);
        String operate = getParam("operate", "安全操作验证");
        int time = getParamToInt("timeout", 24 * 60 * 60);

        setRequestAttr("managerName", loginName);
        setRequestAttr("managerRole", "后台管理员");
        setRequestAttr("operate", operate);

        FastHeadExtInfo extInfo = FastExtConfig.getInstance().getExtInfo("login-type");
        if (extInfo != null) {
            if (!extInfo.getValue().equalsIgnoreCase("normal")) {
                if (!validateCaptcha(getParam("validateCode", true))) {
                    responseJson(-3, "验证失败，验证码错误！");
                    return;
                }
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

    @AFastLog(value = "${managerRole}【${managerName}】退出了登录！", type = "管理员退出")
    public void logout() {
        ExtManagerEntity managerEntity = getSession("manager");
        setRequestAttr("managerName", managerEntity.getString("managerName"));
        ExtManagerRoleEntity extManagerRoleEntity = managerEntity.getObject("role");
        setRequestAttr("managerRole", extManagerRoleEntity.getRoleName());
        removeSession("manager");
        responseJson(0, "退出成功！");
    }



    /**
     * 重置密码
     */
    @AFastSession
    @AFastLog(value = "${managerRole}【${managerName}】重置了登录密码！", type = "密码重置")
    public void resetPassword() {
        ExtManagerEntity sessionUser = getSession("manager");
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
     * 修改密码
     */
    @AFastSession
    @AFastLog(value = "${managerRole}【${managerName}】修改了登录密码！", type = "密码重置")
    public void modifyPassword(){


        ExtManagerEntity sessionUser = getSession("manager");
        setRequestAttr("managerName", sessionUser.getString("managerName"));

        ExtManagerRoleEntity extManagerRoleEntity = sessionUser.getObject("role");
        setRequestAttr("managerRole", extManagerRoleEntity.getRoleName());

        ExtManagerEntity managerEntity = ExtManagerEntity.getInstance().selectById(getParamToInt("managerId", true));

        String newPassword = getParam("newPassword", true);
        String reNewPassword = getParam("reNewPassword", true);

        String managerPassword = getParam("managerPassword", true);

        String oldPassword=managerEntity.getString("managerPassword");

        if(!newPassword.equals(reNewPassword)){
            responseJson(-1, "两次密码输入不一致！");
            return;
        }

        if(!FastMD5Utils.MD5(managerPassword).equals(oldPassword)){
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
     * 更新权限与角色权限相同
     */
    public void updatePower() {
        List<Integer> managerIds = getParamToIntList("managerId");
        for (Integer managerId : managerIds) {
            ExtManagerEntity byId = ExtManagerEntity.dao().getById(managerId);
            ExtManagerRoleEntity managerRole = byId.getManagerRole();
            if (managerRole != null) {
                byId.set("managerMenuPower", managerRole.getRoleMenuPower());
                byId.set("managerExtPower", managerRole.getRoleExtPower());
                byId.update();
            }
        }
        responseJson(0, "同步成功！");
    }


    /**
     * 待办事项
     */
    @AFastSession
    public void waitNotice() throws Exception {
        setLog(false);
        List<Integer> noticeId = getParamToIntList("noticeId");
        ExtManagerEntity sessionUser = getSession("manager");
        List<FastEntity<?>> list = ExtSystemNoticeEntity.dao().getList(sessionUser.getLayerValue(), noticeId.toArray(new Integer[]{}));
        responseJson(0, "获取成功！", list);
    }


    /**
     * 更新待办事项
     */
    @AFastSession
    public void doneNotice() {
        int noticeId = getParamToInt("noticeId", true);
        ExtSystemNoticeEntity extSystemNoticeEntity = ExtSystemNoticeEntity.newInstance();
        extSystemNoticeEntity.set("noticeId", noticeId);
        extSystemNoticeEntity.set("noticeState", ExtSystemNoticeEntity.ExtSystemNoticeStateEnum.已处理.ordinal());
        extSystemNoticeEntity.update();
        responseJson(0, "标记成功！");
    }

    /**
     * 清空待办事项
     */
    @AFastSession
    public void clearNotice() {
        ExtManagerEntity sessionUser = getSession("manager");
        ExtSystemNoticeEntity.dao().clearNotice(sessionUser.getLayerValue());
        responseJson(0, "清空成功！");
    }

}
