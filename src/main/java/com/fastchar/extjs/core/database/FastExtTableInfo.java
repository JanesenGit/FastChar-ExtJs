package com.fastchar.extjs.core.database;

import com.fastchar.annotation.AFastOverride;
import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastTableInfo;
import com.fastchar.exception.FastDatabaseException;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.utils.FastArrayUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * 覆盖FastExtTableInfo类
 */
@AFastPriority(AFastPriority.P_HIGH)
@AFastOverride
public class FastExtTableInfo extends FastTableInfo<FastExtTableInfo> {
    private static final long serialVersionUID = 4590861561177081866L;
    private static final String[] BIND_VALUES = new String[]{"SessionLayer"};

    public String getShortName() {
        if (containsKey("shortName")) {
            return mapWrap.getString("shortName");
        }
        if (FastStringUtils.isNotEmpty(getComment())) {
            return getComment().replace("管理", "");
        }
        return "";
    }

    public boolean isBindSessionLayer() {
        String bind = mapWrap.getString("bind");
        if (FastStringUtils.isNotEmpty(bind)) {
            return bind.equalsIgnoreCase("SessionLayer");
        }
        return false;
    }

    public boolean isRecycle() {
        return mapWrap.getBoolean("recycle");
    }


    public FastExtColumnInfo getLayerColumn() {
        return mapWrap.getObject("__layerColumn");
    }

    public FastExtColumnInfo getBindLayerColumn() {
        return mapWrap.getObject("__bindLayerColumn");
    }

    public FastExtColumnInfo getSameLinkColumn() {
        return mapWrap.getObject("__bindSameColumn");
    }

    @Override
    public FastColumnInfo<?> addColumn(FastColumnInfo<?> columnInfo) {
        FastColumnInfo<?> fastColumnInfo = super.addColumn(columnInfo);
        if (fastColumnInfo instanceof FastExtColumnInfo) {
            FastExtColumnInfo extColumnInfo = (FastExtColumnInfo) fastColumnInfo;
            if (extColumnInfo.isLayer()) {
                put("__layerColumn", extColumnInfo);
            }
            if (extColumnInfo.isBindLayer()) {
                put("__bindLayerColumn", extColumnInfo);
            }
            if (extColumnInfo.isBindSame()) {
                put("__bindSameColumn", extColumnInfo);
            }
        }
        return fastColumnInfo;
    }

    @Override
    public void validate() throws FastDatabaseException {
        super.validate();
        String layer = getLayer();
        String bind = getBind();

        //自动创建层级列
        if (FastStringUtils.isNotEmpty(layer)) {
            if (!isColumn(layer)) {
                FastExtColumnInfo columnInfo = new FastExtColumnInfo();
                columnInfo.setSortIndex(-1);
                columnInfo.setName(layer);
                columnInfo.setLayer("true");
                columnInfo.setType("text");
                columnInfo.setComment("层级权限");
                columnInfo.setIndex("true");
                columnInfo.setNullable("null");
                columnInfo.setFileName(getFileName());
                columnInfo.setLineNumber(getLineNumber());
                addColumn(columnInfo);
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

        int countLink = 0;
        Collection<FastColumnInfo<?>> columns = getColumns();
        for (FastColumnInfo<?> column : columns) {
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
                if (extColumnInfo.isLink()) {
                    countLink++;
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
            copyRecycle.put("recycle", null);
            copyRecycle.setName(copyRecycle.getName() + "_recycle");
            copyRecycle.validate();
            FastChar.getDatabases().get(getDatabase()).addTable(copyRecycle);
        }

        if (FastStringUtils.isNotEmpty(layer) && !getMapWrap().getBoolean("rootLayer", false)) {
            FastExtConfig instance = FastExtConfig.getInstance();
            if (instance.isStrictBindLayer()) {
                if (bindLayers.size() == 0 && countLink > 0) {
                    throw new FastDatabaseException(FastChar.getLocal().getInfo("Db_Table_Error4", getName())
                            + "\n\tat " + getStackTrace("layer"));
                }
            }
        }

    }

    public String getLayer() {
        return mapWrap.getString("layer");
    }

    public FastExtTableInfo setLayer(String layer) {
        put("layer", layer);
        return this;
    }

    public String getBind() {
        return mapWrap.getString("bind");
    }

    public FastExtTableInfo setBind(String bind) {
        put("bind", bind);
        return this;
    }

    public String getRecycle() {
        return mapWrap.getString("recycle");
    }

    public FastExtTableInfo setRecycle(String recycle) {
        put("recycle", recycle);
        return this;
    }

}
