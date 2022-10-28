package com.fastchar.extjs.core.menus;

import com.fastchar.core.FastMapWrap;
import com.fastchar.extjs.exception.FastMenuException;
import com.fastchar.extjs.utils.ColorUtils;
import com.fastchar.utils.FastBooleanUtils;
import com.fastchar.utils.FastMD5Utils;
import com.fastchar.utils.FastNumberUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class FastMenuInfo extends LinkedHashMap<String, Object> {
    private static final long serialVersionUID = 2745017046582346313L;
    protected transient FastMapWrap mapWrap;

    public FastMenuInfo() {
        super(16);
        put("tagName", "menu");
        put("treeGroup", FastStringUtils.buildOnlyCode("M"));
        mapWrap = FastMapWrap.newInstance(this);
    }

    public FastMapWrap getMapWrap() {
        return mapWrap;
    }


    public void setRoot(boolean root) {
        put("root", root);
    }

    public boolean isRoot() {
        return getMapWrap().getBoolean("root");
    }


    public void setTreeGroup(String group) {
        put("treeGroup", group);
    }

    public String getTreeGroup() {
        return getMapWrap().getString("treeGroup");
    }


    public String getTagName() {
        return  mapWrap.getString("tagName");
    }

    public int getLineNumber() {
        return mapWrap.getInt("lineNumber");
    }

    public void setLineNumber(int lineNumber) {
        put("lineNumber", lineNumber);
    }

    public String getFileName() {
        return  mapWrap.getString("fileName");
    }

    public void setFileName(String fileName) {
        put("fileName", fileName);
    }


    public String getId() {
        return mapWrap.getString("id");
    }

    public void setId(String id) {
        put("id", id);
    }
    public String getText() {
        return mapWrap.getString("text");
    }

    public void setText(String text) {
        put("text", text);
    }
    public String getMethod() {
        return mapWrap.getString("method");
    }

    public void setMethod(String method) {
        put("method", method);
    }

    public String getIcon() {
        return mapWrap.getString("icon");
    }

    public void setIcon(String icon) {
        put("icon", icon);
    }

    public String getColor() {
        return mapWrap.getString("color");
    }

    public void setColor(String color) {
        put("color", color);
    }

    public String getParentId() {
        return mapWrap.getString("parentId");
    }

    public void setParentId(String parentId) {
        put("parentId", parentId);
    }

    public Boolean getChecked() {
        return mapWrap.getObject("checked");
    }

    public void setChecked(Boolean checked) {
        put("checked", checked);
    }

    public Integer getDepth() {
        return mapWrap.getObject("depth");
    }

    public void setDepth(Integer depth) {
        put("depth", depth);
    }

    public List<FastMenuInfo> getChildren() {
        List<FastMenuInfo> children = mapWrap.getObject("children");
        if (children == null) {
            children = new ArrayList<>();
            setChildren(children);
        }
        return children;
    }

    public void setChildren(List<FastMenuInfo> children) {
        put("children", children);
    }

    public Boolean getLeaf() {
        return mapWrap.getObject("leaf");
    }

    public void setLeaf(Boolean leaf) {
        put("leaf", leaf);
    }

    public String getIconCls() {
        return mapWrap.getString("iconCls");
    }

    public FastMenuInfo setIconCls(String iconCls) {
        put("iconCls", iconCls);
        return this;
    }

    public String getIconValue() {
        return mapWrap.getString("iconValue");
    }

    public FastMenuInfo setIconValue(String iconValue) {
        put("iconValue", iconValue);
        return this;
    }

    public String getIconName() {
        return mapWrap.getString("iconName");
    }

    public FastMenuInfo setIconName(String iconName) {
        put("iconName", iconName);
        return this;
    }

    public String getIndex() {
        return mapWrap.getString("index");
    }

    public FastMenuInfo setIndex(String index) {
        put("index", index);
        return this;
    }

    public String getBaseCls() {
        return mapWrap.getString("baseCls");
    }

    public FastMenuInfo setBaseCls(String baseCls) {
        put("baseCls", baseCls);
        return this;
    }

    public String getTheme() {
        return mapWrap.getString("theme");
    }

    public FastMenuInfo setTheme(String theme) {
        put("theme", theme);
        return this;
    }

    public void resetIcon() {
        String iconValue = getIconValue();
        if (FastStringUtils.isNotEmpty(iconValue)) {
            String path = "icon?path=" + iconValue;
            if (FastStringUtils.isNotEmpty(getColor())) {
                path = path + "&color=" + getColor().replace("#", "");
            }
            setIcon(path);
            setIconName(iconValue.substring(iconValue.lastIndexOf("/") + 1));
        }
        if (FastStringUtils.isNotEmpty(getColor())) {
            setBaseCls("baseTab" + FastMD5Utils.MD5To16(getColor()) + "Cls");

            for (int i = 1; i < 9; i++) {
                put("color" + i, ColorUtils.getLightColor(getColorValue(), 1 - FastNumberUtils.formatToDouble("0." + i)));
            }

        }



    }

    /**
     * 校验必须属性值配置
     */
    public void validate() throws FastMenuException {
        if (FastStringUtils.isEmpty(getText())) {
            throw new FastMenuException("menu text must be not empty! "
                    + "\n\tin " + this
                    + "\n\tat " + getStackTrace("text"));
        }
        if (FastStringUtils.isEmpty(getMethod()) && FastBooleanUtils.formatToBoolean(getLeaf(), false)) {
            throw new FastMenuException("menu method must be not empty! "
                    + "\n\tin " + this
                    + "\n\tat " + getStackTrace("method"));
        }
    }

    protected StackTraceElement getStackTrace(String attrName) {
        if (FastStringUtils.isEmpty(getFileName())) {
            return null;
        }
        return new StackTraceElement(
                getFileName() + "." + getTagName(),
                attrName,
                getFileName(),
                getLineNumber());
    }


    public FastMenuInfo getMenuInfo(String text) {
        if (this.getChildren() == null) {
            return null;
        }
        for (FastMenuInfo child : this.getChildren()) {
            if (child.getText().equals(text)) {
                return child;
            }
        }
        return null;
    }

    public void merge(FastMenuInfo menuInfo) {
        for (Map.Entry<String, Object> stringObjectEntry : menuInfo.entrySet()) {
            if (String.valueOf(stringObjectEntry.getKey()).equals("children")) {
                continue;
            }
            put(stringObjectEntry.getKey(), stringObjectEntry.getValue());
        }
        if (menuInfo.getChildren() != null) {
            for (FastMenuInfo child : menuInfo.getChildren()) {
                FastMenuInfo existMenu = this.getMenuInfo(child.getText());
                if (existMenu != null) {
                    existMenu.merge(child);
                } else {
                    this.getChildren().add(child);
                }
            }
        }
    }

    public String getColorValue() {
        if (FastStringUtils.isEmpty(getColor())) {
            return null;
        }
        if (ColorUtils.isRgbColor(getColor())) {
            return getColor();
        }
        return "#" + FastStringUtils.stripStart(getColor(), "#");
    }
}
