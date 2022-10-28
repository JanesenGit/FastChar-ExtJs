package com.fastchar.extjs.core.database;

import com.fastchar.annotation.AFastOverride;
import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
import com.fastchar.database.FastType;
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
    private static final long serialVersionUID = -7287875560648608769L;
    //绑定关联表格的：layer 层级编号 same 相同字段
    private static final String[] BIND_VALUES = new String[]{"layer", "same"};

    /**
     * 是否是层级字段
     * @return  布尔值
     */
    public boolean isLayer() {
        return mapWrap.getBoolean("layer");
    }

    /**
     * 是否是关联字段 
     * @return 布尔值
     */
    public boolean isLink() {
        return getLinkInfo() != null;
    }

    public boolean isBindLayer() {
        String bind = mapWrap.getString("bind");
        if (FastStringUtils.isNotEmpty(bind)) {
            String[] bindArray = bind.split(",");
            return FastArrayUtils.contains(bindArray, "layer");
        }
        return false;
    }

    public boolean isBindSame() {
        String bind = mapWrap.getString("bind");
        if (FastStringUtils.isNotEmpty(bind)) {
            String[] bindArray = bind.split(",");
            return FastArrayUtils.contains(bindArray, "same");
        }
        return false;
    }

    public boolean isRenderEnum() {
        return mapWrap.getString("render", "").toLowerCase().startsWith("enum");
    }

    public String getEnumName() {
        String render = mapWrap.getString("render", "");
        String[] renderInfos = render.split("@");
        if (renderInfos.length == 1) {
            return FastStringUtils.firstCharToUpper(getName() + "Enum");
        }
        return renderInfos[1];
    }

    public String getLayer() {
        return mapWrap.getString("layer");
    }
    
    public FastExtColumnInfo setLayer(String layer) {
        put("layer", layer);
        return this;
    }

    public String getBind() {
        return mapWrap.getString("bind");
    }
    
    public FastExtColumnInfo setBind(String bind) {
        put("bind", bind);
        return this;
    }

    public String getLink() {
        return mapWrap.getString("link");
    }
    
    public FastExtColumnInfo setLink(String link) {
        put("link", link);
        return this;
    }

    public FastExtLinkInfo getLinkInfo() {
        return mapWrap.getObject("linkInfo");
    }
    
    public FastExtColumnInfo setLinkInfo(FastExtLinkInfo linkInfo) {
        put("linkInfo", linkInfo);
        return this;
    }

    public String getSearch() {
        return mapWrap.getString("search");
    }

    public FastExtColumnInfo setSearch(String search) {
        put("search", search);
        return this;
    }


    public boolean isSearch() {
        if (FastType.isByteArrayType(getType())) {
            return false;
        }
        String search = getSearch();
        if (FastStringUtils.isEmpty(search)) {  //处理默认配置
            if (isLayer()) {
                return false;
            }
            if (isLink()) {
                return false;
            }
            if (isEncrypt()) {
                return false;
            }
            if (isPassword()) {
                return false;
            }
            if (FastType.isBigStringType(getType())) {
                return false;
            }
            if (FastType.isStringType(getType())) {
                return true;
            }
        }
        return FastBooleanUtils.formatToBoolean(search, false);
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
        String bind = getBind();
        String link = getLink();
        
        if (FastStringUtils.isNotEmpty(bind)) {
            String[] bindArray = bind.split(",");
            for (String bindValue : bindArray) {
                if (!FastArrayUtils.contains(BIND_VALUES, bindValue)) {
                    throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error8", "'" + bind + "'", FastStringUtils.join(BIND_VALUES, ","))
                            + "\n\tat " + getStackTrace("bind"));
                }
                if (bindValue.equalsIgnoreCase("layer")) {
                    if (FastStringUtils.isEmpty(link) && !isRenderEnum()) {
                        throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error3", "上级层级字段'" + getName() + "'")
                                + "\n\tat " + getStackTrace("link"));
                    }
                }
                if (bindValue.equalsIgnoreCase("same")) {
                    if (FastStringUtils.isEmpty(link)) {
                        throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error3", "绑定相同字段'" + getName() + "'")
                                + "\n\tat " + getStackTrace("link"));
                    }
                }
            }
        }

        if (FastStringUtils.isNotEmpty(link)) {
            List<String> split = splitInfo(link);
            FastExtLinkInfo linkInfo = new FastExtLinkInfo();
            linkInfo.setTableName(split.get(0));
            linkInfo.setDatabase(getDatabase());

            FastTableInfo<?> tableInfo = FastChar.getDatabases().get(getDatabase()).getTableInfo(linkInfo.getTableName());
            if (tableInfo == null) {
                throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error4", "'" + linkInfo.getTableName() + "'")
                        + "\n\tat " + getStackTrace("link"));
            }

            if (tableInfo.getPrimaries().size() > 0) {
                linkInfo.setKeyColumnName(tableInfo.getPrimaries().iterator().next().getName());
            }

            if (split.size() > 1) {
                linkInfo.setKeyColumnName(split.get(1));
            }

            for (int i = 2; i < split.size(); i++) {
                linkInfo.addTextColumnName(split.get(i));
            }

            FastColumnInfo<?> linkColumnInfo = tableInfo.getColumnInfo(linkInfo.getKeyColumnName());
            if (linkColumnInfo == null) {
                throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error5", "'" + linkInfo.getTableName() + "'", "'" + linkInfo.getKeyColumnName() + "'")
                        + "\n\tat " + getStackTrace("link"));
            }

            if (linkInfo.getTextColumnNames().size() == 0) {
                throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error9", "'" + linkInfo.getTableName() + "'")
                        + "\n\tat " + getStackTrace("link"));
            }
            for (String textColumnName : linkInfo.getTextColumnNames()) {
                FastColumnInfo<?> textColumnInfo = tableInfo.getColumnInfo(textColumnName);
                if (textColumnInfo == null) {
                    throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error7", "'" + linkInfo.getTableName() + "'", "'" + textColumnName + "'")
                            + "\n\tat " + getStackTrace("link"));
                }
            }

            setLinkInfo(linkInfo);
            if (FastStringUtils.isEmpty(getIndex())) {
                setIndex("true");
            }
        }
    }

}
