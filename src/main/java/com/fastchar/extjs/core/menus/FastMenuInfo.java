package com.fastchar.extjs.core.menus;

import com.fastchar.core.FastBaseInfo;
import com.fastchar.extjs.exception.FastMenuException;
import com.fastchar.utils.FastBooleanUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.List;

public class FastMenuInfo extends FastBaseInfo {
    private static final long serialVersionUID = 2745017046582346313L;
    private String id;
    private String text;
    private String method;
    private String iconValue;
    private String iconName;
    private String icon;
    private String iconCls;
    private String color;
    private String parentId;
    private String index = "9999999";
    private Boolean checked;
    private Boolean leaf;
    private Integer depth;

    private List<FastMenuInfo> children = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public Boolean getChecked() {
        return checked;
    }

    public void setChecked(Boolean checked) {
        this.checked = checked;
    }

    public Integer getDepth() {
        return depth;
    }

    public void setDepth(Integer depth) {
        this.depth = depth;
    }

    public List<FastMenuInfo> getChildren() {
        return children;
    }

    public void setChildren(List<FastMenuInfo> children) {
        this.children = children;
    }

    public Boolean getLeaf() {
        return leaf;
    }

    public void setLeaf(Boolean leaf) {
        this.leaf = leaf;
    }

    public String getIconCls() {
        return iconCls;
    }

    public FastMenuInfo setIconCls(String iconCls) {
        this.iconCls = iconCls;
        return this;
    }

    public String getIconValue() {
        return iconValue;
    }

    public FastMenuInfo setIconValue(String iconValue) {
        this.iconValue = iconValue;
        return this;
    }

    public String getIconName() {
        return iconName;
    }

    public FastMenuInfo setIconName(String iconName) {
        this.iconName = iconName;
        return this;
    }

    public String getIndex() {
        return index;
    }

    public FastMenuInfo setIndex(String index) {
        this.index = index;
        return this;
    }

    public void resetIcon() {
        if (FastStringUtils.isNotEmpty(getIconValue())) {
            String path = "icon?path=" + getIconValue();
            if (FastStringUtils.isNotEmpty(getColor())) {
                path = path + "&color=" + getColor().replace("#", "");
            }
            setIcon(path);
            iconName = iconValue.substring(iconValue.lastIndexOf("/") + 1);
        }
    }

    /**
     * 校验必须属性值配置
     */
    public void validate() throws FastMenuException {
        if (FastStringUtils.isEmpty(text)) {
            throw new FastMenuException("menu name must be not empty! "
                    + "\n\tin " + toString()
                    + "\n\tat " + getStackTrace("text"));
        }
        if (FastStringUtils.isEmpty(method) && FastBooleanUtils.formatToBoolean(getLeaf(), false)) {
            throw new FastMenuException("menu method must be not empty! "
                    + "\n\tin " + toString()
                    + "\n\tat " + getStackTrace("method"));
        }
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
        for (String key : menuInfo.keySet()) {
            if (String.valueOf(key).equals("children")) {
                continue;
            }
            this.set(key, menuInfo.get(key));
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

    public FastMenuInfo copy() {
        FastMenuInfo newMenu = new FastMenuInfo();
        newMenu.setAll(this);

        List<FastMenuInfo> children = new ArrayList<>();
        for (FastMenuInfo child : this.getChildren()) {
            children.add(child.copy());
        }
        newMenu.toProperty();
        newMenu.setChildren(children);
        newMenu.fromProperty();
        return newMenu;
    }

}
