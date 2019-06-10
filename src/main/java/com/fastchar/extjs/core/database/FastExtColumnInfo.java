package com.fastchar.extjs.core.database;

import com.fastchar.annotation.AFastOverride;
import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.exception.FastDatabaseException;

import com.fastchar.utils.FastArrayUtils;
import com.fastchar.utils.FastBooleanUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * 覆盖FastColumnInfo类
 */
@AFastPriority(AFastPriority.P_HIGH)
@AFastOverride
public class FastExtColumnInfo extends FastColumnInfo<FastExtColumnInfo> {
    private static String[] BIND_VALUES = new String[]{"layer"};

    private String layer;
    private String bind;
    private String link;
    private transient FastExtLinkInfo linkInfo;

    public boolean isLayer() {
        return FastBooleanUtils.formatToBoolean(layer);
    }

    public boolean isLink() {
        return linkInfo != null;
    }

    public boolean isBindLayer() {
        if (FastStringUtils.isNotEmpty(bind)) {
            return bind.equalsIgnoreCase("layer");
        }
        return false;
    }


    public String getLayer() {
        return layer;
    }

    public FastExtColumnInfo setLayer(String layer) {
        this.layer = layer;
        return this;
    }

    public String getBind() {
        return bind;
    }

    public FastExtColumnInfo setBind(String bind) {
        this.bind = bind;
        return this;
    }

    public String getLink() {
        return link;
    }

    public FastExtColumnInfo setLink(String link) {
        this.link = link;
        return this;
    }

    public FastExtLinkInfo getLinkInfo() {
        return linkInfo;
    }

    public FastExtColumnInfo setLinkInfo(FastExtLinkInfo linkInfo) {
        this.linkInfo = linkInfo;
        return this;
    }

    private List<String> splitInfo(String info) {
        List<String> strings = new ArrayList<>();
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < info.length(); i++) {
            char chr = info.charAt(i);
            if (chr == '@' || chr == '#') {
                strings.add(stringBuilder.toString());
                stringBuilder.delete(0, stringBuilder.length());
                continue;
            }
            stringBuilder.append(chr);
        }
        strings.add(stringBuilder.toString());
        return strings;
    }

    @Override
    public void validate() throws FastDatabaseException {
        super.validate();
        if (FastStringUtils.isNotEmpty(bind)) {
            if (!FastArrayUtils.contains(BIND_VALUES, bind)) {
                throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error8", "'" + bind + "'", FastStringUtils.join(BIND_VALUES, ","))
                        + "\n\tat " + getStackTrace("bind"));
            }

            if (bind.equalsIgnoreCase("layer")) {
                if (FastStringUtils.isEmpty(link)) {
                    throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error3", "'" + getName()+ "'")
                            + "\n\tat " + getStackTrace("link"));
                }
            }
        }

        if (FastStringUtils.isNotEmpty(link)) {
            List<String> split = splitInfo(link);
            FastExtLinkInfo linkInfo = new FastExtLinkInfo();
            linkInfo.setTableName(split.get(0));

            FastTableInfo<?> tableInfo = FastChar.getDatabases().get(getDatabaseName()).getTableInfo(linkInfo.getTableName());
            if (tableInfo == null) {
                throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error4", "'" + linkInfo.getTableName() + "'")
                        + "\n\tat " + getStackTrace("link"));
            }

            if (tableInfo.getPrimaries().size() > 0) {
                linkInfo.setKeyColumnName(tableInfo.getPrimaries().get(0).getName());
            }

            if (split.size() > 1) {
                linkInfo.setKeyColumnName(split.get(1));
            }

            if (split.size() > 2) {
                linkInfo.setTextColumnName(split.get(2));
            }

            FastColumnInfo linkColumnInfo = tableInfo.getColumnInfo(linkInfo.getKeyColumnName());
            if (linkColumnInfo == null) {
                throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error5", "'" + linkInfo.getTableName() + "'", "'" + linkInfo.getKeyColumnName() + "'")
                        + "\n\tat " + getStackTrace("link"));
            }else{
                linkInfo.setKeyColumn(linkColumnInfo);
            }


            FastColumnInfo textColumnInfo = tableInfo.getColumnInfo(linkInfo.getTextColumnName());
            if (textColumnInfo == null) {
                throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error7", "'" + linkInfo.getTableName() + "'", "'" + linkInfo.getTextColumnName() + "'")
                        + "\n\tat " + getStackTrace("link"));
            }else{
                linkInfo.setTextColumn(textColumnInfo);
            }
            linkInfo.fromProperty();
            setLinkInfo(linkInfo);
            if (FastStringUtils.isEmpty(getIndex())) {
                setIndex("true");
            }
        }
    }

}
