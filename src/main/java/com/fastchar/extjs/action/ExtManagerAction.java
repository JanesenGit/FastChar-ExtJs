package com.fastchar.extjs.action;

import com.fastchar.core.FastAction;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.annotation.AFastLog;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.extjs.core.heads.FastHeadExtInfo;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtManagerErrorEntity;
import com.fastchar.utils.FastMD5Utils;

public class ExtManagerAction extends FastAction {
    @Override
    protected String getRoute() {
        return "/manager";
    }

    @AFastLog(value = "后台管理员【${managerName}】进行了登录！", type = "管理员登录")
    public void login() {
        FastHeadExtInfo extInfo = FastExtConfig.getInstance().getExtInfo("login-type");
        if (extInfo != null) {
            if (!extInfo.getValue().equalsIgnoreCase("normal")) {
                if (!validateCaptcha(getParam("validateCode", true))) {
                    responseJson(-1, "登录失败，验证码错误！");
                    return;
                }
            }
        }

        String loginName = getParam("loginName", true);
        String loginPassword = getParam("loginPassword", true);

        setRequestAttr("managerName", loginName);
        ExtManagerEntity managerEntity = ExtManagerEntity.getInstance().login(loginName, loginPassword);


        int errorCount = ExtManagerErrorEntity.dao().countTodayError(loginName);
        int nextCount = Math.max(7 - errorCount, 0);
        String errorInfo = null;
        if (nextCount > 0) {
            errorInfo = "今日还剩余" + nextCount + "次！";
        }else{
            responseJson(-1, "您今日登录错误次数超限！请明日再试！");
        }

        ExtManagerErrorEntity payErrorEntity = new ExtManagerErrorEntity();
        payErrorEntity.set("managerLoginName", loginName);
        if (managerEntity != null) {
            setRequestAttr("managerName", managerEntity.getString("managerName"));
            setSession("manager", managerEntity);

            payErrorEntity.delete("managerLoginName");
            responseJson(0, "登录成功！");
        } else {
            payErrorEntity.save();

            responseJson(-2, "登录失败，用户名或密码错误！" + errorInfo);
        }
    }

    @AFastLog(value = "后台管理员【${managerName}】退出了登录！", type = "管理员退出")
    public void logout() {
        ExtManagerEntity managerEntity = getSession("manager");
        setRequestAttr("managerName", managerEntity.getString("managerName"));
        removeSession("manager");
        responseJson(0, "退出成功！");
    }



    /**
     * 重置密码
     */
    @AFastSession
    @AFastLog(value = "后台管理员【${managerName}】重置了登录密码！", type = "密码重置")
    public void resetPassword() {
        ExtManagerEntity sessionUser = getSession("manager");
        setRequestAttr("managerName", sessionUser.getString("managerName"));

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
    @AFastLog(value = "后台管理员【${managerName}】修改了登录密码！", type = "密码重置")
    public void modifyPassword(){


        ExtManagerEntity sessionUser = getSession("manager");
        setRequestAttr("managerName", sessionUser.getString("managerName"));

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

}
