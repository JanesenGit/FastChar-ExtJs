package com.fastchar.extjs.core.database;

import com.fastchar.annotation.AFastOverride;
import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.exception.FastDatabaseException;

import com.fastchar.utils.FastArrayUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * 覆盖FastExtTableInfo类
 */
@AFastPriority(AFastPriority.P_HIGH)
@AFastOverride
public class FastExtTableInfo extends FastTableInfo<FastExtTableInfo> {
    private static final long serialVersionUID = 4590861561177081866L;
    private static String[] BIND_VALUES = new String[]{"SessionLayer"};

    private String layer;
    private String bind;

    public String getShortName() {
        if (containsKey("shortName")) {
            return getString("shortName");
        }
        return getComment().replace("管理", "");
    }

    public boolean isBindSessionLayer() {
        if (FastStringUtils.isNotEmpty(bind)) {
            return bind.equalsIgnoreCase("SessionLayer");
        }
        return false;
    }


    public FastExtColumnInfo getLayerColumn() {
        for (FastColumnInfo column : getColumns()) {
            if (column instanceof FastExtColumnInfo) {
                FastExtColumnInfo extColumnInfo = (FastExtColumnInfo) column;
                if (extColumnInfo.isLayer()) {
                    return extColumnInfo;
                }
            }
        }
        return null;
    }

    public FastExtColumnInfo getLayerLinkColumn() {
        for (FastColumnInfo column : getColumns()) {
            if (column instanceof FastExtColumnInfo) {
                FastExtColumnInfo extColumnInfo = (FastExtColumnInfo) column;
                if (extColumnInfo.isBindLayer()) {
                    return extColumnInfo;
                }
            }
        }
        return null;
    }

    @Override
    public void validate() throws FastDatabaseException {
        super.validate();

        if (FastStringUtils.isNotEmpty(layer)) {
            if (!checkColumn(layer)) {
                FastExtColumnInfo columnInfo = new FastExtColumnInfo();
                columnInfo.setName(layer);
                columnInfo.setLayer("true");
                columnInfo.setType("varchar");
                columnInfo.setLength("999");
                columnInfo.setComment("层级权限");
                columnInfo.setIndex("true");
                columnInfo.setNullable("null");
                columnInfo.setFileName(getFileName());
                columnInfo.setLineNumber(getLineNumber());
                columnInfo.fromProperty();
                getColumns().add(0, columnInfo);
            }
        }


        if (FastStringUtils.isNotEmpty(bind)) {
            if (!FastArrayUtils.contains(BIND_VALUES, bind)) {
                throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Column_Error8", "'" + bind + "'", FastStringUtils.join(BIND_VALUES, ","))
                        + "\n\tat " + getStackTrace("bind"));
            }
        }



        List<String> layers = new ArrayList<>();
        List<String> layerStackTraceElements = new ArrayList<>();
        for (FastColumnInfo<?> column : getColumns()) {
            if (column instanceof FastExtColumnInfo) {
                FastExtColumnInfo extColumnInfo = (FastExtColumnInfo) column;
                if (extColumnInfo.isLayer()) {
                    layers.add(column.getName());
                    layerStackTraceElements.add("\n\tat " + extColumnInfo.getStackTrace("layer"));
                }
            }
        }
        if (layers.size() > 1) {
            throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Table_Error2", FastStringUtils.join(layers, ","))
                    + FastStringUtils.join(layerStackTraceElements, ""));
        }
    }

    public String getLayer() {
        return layer;
    }

    public FastExtTableInfo setLayer(String layer) {
        this.layer = layer;
        return this;
    }

    public String getBind() {
        return bind;
    }

    public FastExtTableInfo setBind(String bind) {
        this.bind = bind;
        return this;
    }
}
