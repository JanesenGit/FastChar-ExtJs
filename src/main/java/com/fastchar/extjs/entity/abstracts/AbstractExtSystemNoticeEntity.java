package com.fastchar.extjs.entity.abstracts;

import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.extjs.entity.ExtSystemNoticeEntity;
import com.fastchar.extjs.entity.ExtSystemNoticeEntity.*;

import java.util.Date;

public abstract class AbstractExtSystemNoticeEntity extends FastExtEntity<ExtSystemNoticeEntity> {
    private static final long serialVersionUID = 6852747901671331197L;

    public String getNoticeLayerCode() {
        return getString("noticeLayerCode");
    }

    public AbstractExtSystemNoticeEntity setNoticeLayerCode(String noticeLayerCode) {
        set("noticeLayerCode", noticeLayerCode);
        return this;
    }

    public int getNoticeId() {
        return getInt("noticeId");
    }

    public AbstractExtSystemNoticeEntity setNoticeId(int noticeId) {
        set("noticeId", noticeId);
        return this;
    }

    public String getNoticeCode() {
        return getString("noticeCode");
    }

    public AbstractExtSystemNoticeEntity setNoticeCode(String noticeCode) {
        set("noticeCode", noticeCode);
        return this;
    }

    public int getManagerId() {
        return getInt("managerId");
    }

    public AbstractExtSystemNoticeEntity setManagerId(int managerId) {
        set("managerId", managerId);
        return this;
    }

    public String getNoticeTitle() {
        return getString("noticeTitle");
    }

    public AbstractExtSystemNoticeEntity setNoticeTitle(String noticeTitle) {
        set("noticeTitle", noticeTitle);
        return this;
    }

    public String getNoticeContent() {
        return getString("noticeContent");
    }

    public AbstractExtSystemNoticeEntity setNoticeContent(String noticeContent) {
        set("noticeContent", noticeContent);
        return this;
    }

    public String getNoticeAction() {
        return getString("noticeAction");
    }

    public AbstractExtSystemNoticeEntity setNoticeAction(String noticeAction) {
        set("noticeAction", noticeAction);
        return this;
    }

    public ExtSystemNoticeStateEnum getNoticeState() {
        return getEnum("noticeState", ExtSystemNoticeStateEnum.class);
    }

    public AbstractExtSystemNoticeEntity setNoticeState(ExtSystemNoticeStateEnum noticeState) {
        set("noticeState", noticeState.ordinal());
        return this;
    }

    public Date getNoticeDateTime() {
        return getDate("noticeDateTime");
    }

    public AbstractExtSystemNoticeEntity setNoticeDateTime(Date noticeDateTime) {
        set("noticeDateTime", noticeDateTime);
        return this;
    }
}