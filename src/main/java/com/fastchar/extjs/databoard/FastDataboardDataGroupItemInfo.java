package com.fastchar.extjs.databoard;

public class FastDataboardDataGroupItemInfo extends FastDataboardDataInfo<FastDataboardDataGroupItemInfo> {

    private String groupId;
    private String title;

    public String getTitle() {
        return title;
    }

    public FastDataboardDataGroupItemInfo setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getGroupId() {
        return groupId;
    }

    public FastDataboardDataGroupItemInfo setGroupId(String groupId) {
        this.groupId = groupId;
        return this;
    }
}
