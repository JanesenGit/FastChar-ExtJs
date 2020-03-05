package com.fastchar.extjs;

import com.fastchar.core.FastChar;
import com.fastchar.extjs.core.menus.FastMenuInfo;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtSystemNoticeEntity;
import com.fastchar.utils.FastDateUtils;
import com.fastchar.utils.FastStringUtils;

public class FastExtHelper {

    /**
     * 添加系统待办事项
     *
     * @param title   标题
     * @param content 内容
     * @return 布尔值
     */
    public static ExtSystemNoticeEntity addWaitInfo(
            String title,
            String content) {
        return addWaitInfo(null, null, title, content, null);
    }

    /**
     * 添加系统待办事项
     *
     * @param title      标题
     * @param content    内容
     * @param actionMenu 触发的菜单，多级以'@'符合分割
     * @return 布尔值
     */
    public static ExtSystemNoticeEntity addWaitInfo(
            String title,
            String content,
            String actionMenu) {
        return addWaitInfo(null, null, title, content, actionMenu);
    }

    /**
     * 添加系统待办事项
     *
     * @param code       唯一编号
     * @param title      标题
     * @param content    内容
     * @param actionMenu 触发的菜单，多级以'@'符合分割
     * @return 布尔值
     */
    public static ExtSystemNoticeEntity addWaitInfo(
            String code,
            String title,
            String content,
            String actionMenu) {
        return addWaitInfo(null, code, title, content, actionMenu);
    }

    /**
     * 添加系统待办事项
     *
     * @param parentLayerCode 权限编号
     * @param code            唯一编号
     * @param title           标题
     * @param content         内容
     * @param actionMenu      触发的菜单，多级以'@'符合分割
     * @return 布尔值
     */
    public static ExtSystemNoticeEntity addWaitInfo(
            String parentLayerCode,
            String code,
            String title,
            String content,
            String actionMenu) {

        FastMenuInfo menuInfo = null;
        if (FastStringUtils.isNotEmpty(actionMenu)) {
            String[] menuArray = actionMenu.split("@");
            FastMenuInfo menus = FastChar.getValues().get("menus");
            menuInfo = getMenu(menuArray, 0, menus);
        }

        ExtSystemNoticeEntity noticeEntity = ExtSystemNoticeEntity.newInstance();
        noticeEntity.setParentLayerCode(parentLayerCode);
        if (FastStringUtils.isEmpty(code)) {
            code = FastStringUtils.buildOnlyCode("NTC");
        }
        noticeEntity.set("noticeCode", code);
        noticeEntity.set("noticeTitle", title);
        noticeEntity.set("noticeContent", content);
        noticeEntity.set("noticeState", ExtSystemNoticeEntity.ExtSystemNoticeStateEnum.待处理.ordinal());
        if (menuInfo != null) {
            noticeEntity.set("noticeAction", "system.selectMenu('" + menuInfo.getId() + "')");
        }
        ExtManagerEntity managerByNoticeTitle = ExtManagerEntity.getInstance().getManagerByNoticeTitle(title);
        if (managerByNoticeTitle != null) {
            noticeEntity.set("managerId", managerByNoticeTitle.getId());
        }
        noticeEntity.set("noticeDateTime", FastDateUtils.getDateString());
        noticeEntity.push("noticeCode");
        return noticeEntity;
    }


    /**
     * 标记已处理
     *
     * @param code 唯一编号
     */
    public static void doneWaitInfo(String code) {
        ExtSystemNoticeEntity.dao().updateWaitInfo(code);
    }


    private static FastMenuInfo getMenu(String[] menuLevels, int index, FastMenuInfo menus) {
        String menuName = menuLevels[index];
        for (FastMenuInfo child : menus.getChildren()) {
            if (child.getText().equals(menuName)) {
                if (menuLevels.length - 1 == index) {
                    return child;
                }
                return getMenu(menuLevels, index + 1, child);
            }
        }
        return null;
    }

}
