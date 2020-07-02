package com.fastchar.extjs;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastFile;
import com.fastchar.extjs.core.menus.FastMenuInfo;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtSystemNoticeEntity;
import com.fastchar.utils.FastDateUtils;
import com.fastchar.utils.FastFileUtils;
import com.fastchar.utils.FastStringUtils;

import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@SuppressWarnings("ResultOfMethodCallIgnored")
public class FastExtHelper {

    /**
     * 刷新ExtWeb数据，相对于重新初始化ExtWeb数据，包括重新加载fast-heads.html、fast-menus.xml数据等！
     * 刷新后，需要浏览器重新加载系统即可！
     */
    public static void refreshExtWeb() {
        try {
            FastChar.getConfig(FastExtConfig.class)
                    .getMergeJs().delete();
            FastChar.getObservable().notifyObservers("refreshHeads");
            FastChar.getObservable().notifyObservers("refreshMenus");
        } catch (Exception ignored) { }
    }


    /**
     * 添加系统待办事项
     *
     * @param title   标题
     * @param content 内容
     * @return 布尔值
     */
    public static void addWaitInfo(
            String title,
            String content) {
        addWaitInfo(null, null, title, content, null);
    }

    /**
     * 添加系统待办事项
     *
     * @param title      标题
     * @param content    内容
     * @param actionMenu 触发的菜单，多级以'@'符合分割
     * @return 布尔值
     */
    public static void addWaitInfo(
            String title,
            String content,
            String actionMenu) {
         addWaitInfo(null, null, title, content, actionMenu);
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
    public static void addWaitInfo(
            String code,
            String title,
            String content,
            String actionMenu) {
        addWaitInfo(null, code, title, content, actionMenu);
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
    public static void addWaitInfo(
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
        String menuId = null;
        if (menuInfo != null) {
            menuId = menuInfo.getId();
        }

        List<ExtManagerEntity> managers = ExtManagerEntity.getInstance().getManagerByNoticeTitle(title, menuId);
        for (ExtManagerEntity manager : managers) {
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
            noticeEntity.setParentLayerCode(manager.getLayerValue());
            noticeEntity.set("managerId", manager.getId());
            noticeEntity.set("noticeDateTime", FastDateUtils.getDateString());
            noticeEntity.push("noticeCode", "managerId");
        }
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

    public static FastFile<?> getFastFileFromUrl(String url) throws IOException {
        FastFile<?> paramFile;
        String realUrl = url.split("\\?")[0];
        String fileName = realUrl.substring(realUrl.lastIndexOf("/") + 1);
        URL httpURL = new URL(url);
        HttpURLConnection conn = (HttpURLConnection) httpURL.openConnection();
        String headerField = conn.getHeaderField("content-disposition");
        if (FastStringUtils.isNotEmpty(headerField)) {
            String regStr = "filename=\"(.*)\"";
            Matcher matcher = Pattern.compile(regStr).matcher(headerField);
            if (matcher.find()) {
                fileName = matcher.group(1);
            }
        }
        File saveFile = new File(FastChar.getConstant().getAttachDirectory(), fileName);
        FastFileUtils.copyURLToFile(httpURL, saveFile);
        paramFile = FastFile.newInstance(saveFile.getParent(), fileName);
        return paramFile;
    }

}
