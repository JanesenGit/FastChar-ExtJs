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
 * 覆盖FastExtTableInfo类
 */
@AFastPriority(AFastPriority.P_HIGH)
@AFastOverride
public class FastExtTableInfo extends FastTableInfo<FastExtTableInfo> {
    private static final long serialVersionUID = 4590861561177081866L;
    private static String[] BIND_VALUES = new String[]{"SessionLayer"};

    private String layer;
    private String bind;
    private String recycle;

    private boolean checkLayer;
    private boolean checkLayerLink;
    private boolean checkSameLink;
    private FastExtColumnInfo layerColumn;
    private FastExtColumnInfo layerLinkColumn;
    private FastExtColumnInfo sameLinkColumn;
    public String getShortName() {
        if (containsKey("shortName")) {
            return getString("shortName");
        }
        if (FastStringUtils.isNotEmpty(getComment())) {
            if (getComment().endsWith("管理")) {

            }
            return getComment().replace("管理", "");
        }
        return "";
    }

    public boolean isBindSessionLayer() {
        if (FastStringUtils.isNotEmpty(bind)) {
            return bind.equalsIgnoreCase("SessionLayer");
        }
        return false;
    }

    public boolean isRecycle() {
        return FastBooleanUtils.formatToBoolean(recycle);
    }

    public FastExtColumnInfo getLayerColumn() {
        if (layerColumn == null && !checkLayer) {
            checkLayer = true;
            for (FastColumnInfo<?> column : getColumns()) {
                if (column instanceof FastExtColumnInfo) {
                    FastExtColumnInfo extColumnInfo = (FastExtColumnInfo) column;
                    if (extColumnInfo.isLayer()) {
                        layerColumn = extColumnInfo;
                    }
                }
            }
        }
        return layerColumn;
    }

    public FastExtColumnInfo getLayerLinkColumn() {
        if (layerLinkColumn == null && !checkLayerLink) {
            checkLayerLink = true;
            for (FastColumnInfo<?> column : getColumns()) {
                if (column instanceof FastExtColumnInfo) {
                    FastExtColumnInfo extColumnInfo = (FastExtColumnInfo) column;
                    if (extColumnInfo.isBindLayer()) {
                        layerLinkColumn = extColumnInfo;
                    }
                }
            }
        }
        return layerLinkColumn;
    }

    public FastExtColumnInfo getSameLinkColumn() {
        if (sameLinkColumn == null && !checkSameLink) {
            checkSameLink = true;
            for (FastColumnInfo<?> column : getColumns()) {
                if (column instanceof FastExtColumnInfo) {
                    FastExtColumnInfo extColumnInfo = (FastExtColumnInfo) column;
                    if (extColumnInfo.isBindSame()) {
                        sameLinkColumn = extColumnInfo;
                    }
                }
            }
        }
        return sameLinkColumn;
    }



    @Override
    public void validate() throws FastDatabaseException {
        super.validate();

        if (FastStringUtils.isNotEmpty(layer)) {
            if (!checkColumn(layer)) {
                FastExtColumnInfo columnInfo = new FastExtColumnInfo();
                columnInfo.setName(layer);
                columnInfo.setLayer("true");
                columnInfo.setType("text");
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
        List<String> bindLayers = new ArrayList<>();
        List<String> layerStackTraceElements = new ArrayList<>();
        List<String> bindLayerStackTraceElements = new ArrayList<>();
        for (FastColumnInfo<?> column : getColumns()) {
            if (column instanceof FastExtColumnInfo) {
                FastExtColumnInfo extColumnInfo = (FastExtColumnInfo) column;
                if (extColumnInfo.isLayer()) {
                    layers.add(column.getName());
                    layerStackTraceElements.add("\n\tat " + extColumnInfo.getStackTrace("layer"));
                }
                if (extColumnInfo.isBindLayer()) {
                    bindLayers.add(column.getName());
                    bindLayerStackTraceElements.add("\n\tat " + extColumnInfo.getStackTrace("bind"));
                }
            }
        }
        if (layers.size() > 1) {
            throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Table_Error2", FastStringUtils.join(layers, ","))
                    + FastStringUtils.join(layerStackTraceElements, ""));
        }

        if (bindLayers.size() > 1) {
            throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Table_Error3", FastStringUtils.join(bindLayers, ","))
                    + FastStringUtils.join(bindLayerStackTraceElements, ""));
        }

        if (isRecycle()) {
            FastTableInfo<?> copyRecycle = copy();
            copyRecycle.set("recycle", null);
            copyRecycle.setName(copyRecycle.getName() + "_recycle");
            copyRecycle.fromProperty();
            copyRecycle.validate();
            FastChar.getDatabases().get(getDatabaseName()).addTable(copyRecycle);
        }

    }

    @Override
    public void columnToMap() {
        super.columnToMap();
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

    public String getRecycle() {
        return recycle;
    }

    public FastExtTableInfo setRecycle(String recycle) {
        this.recycle = recycle;
        return this;
    }

}
