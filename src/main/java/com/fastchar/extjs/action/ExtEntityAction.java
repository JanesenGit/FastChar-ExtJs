package com.fastchar.extjs.action;

import com.fastchar.core.*;
import com.fastchar.database.FastPage;
import com.fastchar.database.FastType;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.annotation.AFastLog;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.extjs.core.FastExtEnumHelper;
import com.fastchar.extjs.core.FastExtLayerHelper;
import com.fastchar.extjs.core.FastExtSameHelper;
import com.fastchar.extjs.core.database.FastExtColumnInfo;
import com.fastchar.extjs.core.database.FastExtData;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.extjs.core.database.FastSqlTool;
import com.fastchar.extjs.core.enums.FastEnumInfo;
import com.fastchar.extjs.core.heads.FastHeadExtInfo;
import com.fastchar.extjs.echarts.FastEChartsBean;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtSystemConfigEntity;
import com.fastchar.extjs.info.ExtExcelModelInfo;
import com.fastchar.extjs.interfaces.IFastImportDataListener;
import com.fastchar.extjs.utils.ExtFileUtils;
import com.fastchar.extjs.utils.POIHelper;
import com.fastchar.extjs.utils.POIUtils;
import com.fastchar.utils.*;
import com.google.gson.reflect.TypeToken;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.reflect.Array;
import java.util.*;

@SuppressWarnings({"ResultOfMethodCallIgnored", "SuspiciousMethodCalls"})
@AFastSession
public class ExtEntityAction extends FastAction {
    private static final Map<String, FastSqlInfo> LIST_SQL_MAP = new HashMap<>();

    @Override
    protected String getRoute() {
        return "/entity";
    }


    public void destroyList() {
        String storeId = getParam("storeId", "");
        LIST_SQL_MAP.remove(storeId);
        responseJson(0, "销毁成功！");
    }

    /**
     * 获取实体的列表数据
     * 参数：
     * page 页数 {int}
     * limit 每页大小 {int}
     * entityCode 实体编号 {String}
     * where 列表sql的where判断语句 ,例如：where['t.userId'] = 1
     * indexSort 指定排序列 json数组，例如：[{"property":"serviceNickName","direction":"DESC"}]
     * power 是否需要权限层级筛选，默认：true
     */
    public FastPage<?> list() {
        setLog(getParamToBoolean("log", Boolean.TRUE));

        String entityCode = getParam("entityCode", true);
        int page = getParamToInt("page", 1);
        int pageSize = getParamToInt("limit", 10);

        String storeId = getParam("storeId");

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return null;
        }
        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return null;
        }

        ExtManagerEntity managerEntity = ExtManagerEntity.getSession(this);

        entity.putAll(getParamToMap("where"));
        entity.putAll(getParamToMap("colWhere"));

        Map<String, Object> indexSort = getParamToMap("indexSort");

        String sort = getParam("sort");
        if (FastStringUtils.isNotEmpty(sort)) {
            List<Map<String, String>> sortList = FastChar.getJson().fromJson(sort,
                    new TypeToken<List<Map<String, String>>>() {
                    }.getType());
            for (Map<String, String> map : sortList) {
                if (map.get("property").startsWith("@")) {
                    continue;
                }
                entity.put(FastNumberUtils.formatToInt(indexSort.get(map.get("property"))) + map.get("property") + ":sort", map.get("direction"));
            }
        }

//         && !getParamToBoolean("fromTree", false) 未说明作用，暂时取消
        if (getParamToBoolean("power", Boolean.TRUE)) {
            entity.pullLayer(managerEntity);
        }
        FastPage<?> fastPage = entity.showList(page, pageSize);
        if (fastPage.getSqlInfo() != null && FastStringUtils.isNotEmpty(storeId)) {
            LIST_SQL_MAP.put(storeId, fastPage.getSqlInfo());
        }
        return fastPage;
    }


    /**
     * 添加实体数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * data 以data为前缀的参数，提交实体数据，例如：data.topicError=无,data.topicState=1,data.topicTitle=我的话题
     * method 执行实体的方法名，默认为：save方法
     */
    @AFastLog(value = "页面【${menu}】添加了一条数据！", type = "添加数据")
    public void save() {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        ExtManagerEntity managerEntity = ExtManagerEntity.getSession(this);

        FastEntity<?> entity = getParamToEntity("data", extEntityClass);
        if (FastStringUtils.isEmpty(menu)) {
            menu = entity.getTableDetails();
        }
        setRequestAttr("menu", menu);
        List<FastEntity<?>> saveEntities = new ArrayList<>();
        pluckArrayValue(entity, saveEntities);

        List<FastHandler> saveResult = new ArrayList<>();
        for (FastEntity<?> saveEntity : saveEntities) {
            if (saveEntity.getTable() != null) {
                if (saveEntity.getTable() instanceof FastExtTableInfo) {
                    FastExtTableInfo extTableInfo = saveEntity.getTable();
                    if (extTableInfo.isBindSessionLayer()) {
                        saveEntity.put(FastExtEntity.EXTRA_PARENT_LAYER_CODE, managerEntity.getLayerValue());
                    }
                }
            }

            saveEntity.put("fromWeb", true);
            saveEntity.put("session", managerEntity);
            saveEntity.clearEmpty();

            String[] checks = getParamToArray("check");
            String method = getParam("method", "save");
            if (checks.length == 0) {
                if (saveEntity.save()) {
                    saveResult.add(new FastHandler().setCode(0).setError("添加成功！").put("dataId", saveEntity.getId()));
                    continue;
                }
            } else {
                if (method.equalsIgnoreCase("save")) {
                    if (saveEntity.save(checks)) {
                        saveResult.add(new FastHandler().setCode(0).setError("添加成功！").put("dataId", saveEntity.getId()));
                        continue;
                    } else if (FastStringUtils.isEmpty(saveEntity.getError())) {
                        saveResult.add(new FastHandler().setCode(-1).setError("添加失败！数据或已存在！"));
                        continue;
                    }
                } else if (method.equalsIgnoreCase("push")) {
                    FastHandler handler = new FastHandler();
                    if (saveEntity.push(handler, checks)) {
                        if (handler.getCode() == 0) {
                            saveResult.add(new FastHandler().setCode(0).setError("添加成功！").put("dataId", saveEntity.getId()));
                            continue;
                        }
                        saveResult.add(new FastHandler().setCode(0).setError("更新成功！").put("dataId", saveEntity.getId()));
                        continue;
                    }
                }
            }
            saveResult.add(new FastHandler().setCode(-1).setError("添加失败！" + saveEntity.getError()));
        }

        List<Object> dataIds = new ArrayList<>();
        for (FastHandler fastHandler : saveResult) {
            dataIds.add(fastHandler.getInt("dataId", -1));
        }

        if (saveResult.size() == 1) {
            responseJson(saveResult.get(0).getCode(), saveResult.get(0).getError(), dataIds);
        } else {
            StringBuilder stringBuilder = new StringBuilder();
            int errorCount = 0;
            for (int i = 0; i < saveResult.size(); i++) {
                FastHandler handler = saveResult.get(i);
                if (handler.getCode() != 0) {
                    errorCount++;
                }
                stringBuilder.append("数据").append(i + 1).append("：").append(handler.getError()).append("<br/>");
            }
            if (errorCount == saveResult.size()) {
                responseJson(-1, stringBuilder.toString());
            } else {
                responseJson(0, stringBuilder.toString(), dataIds);
            }
        }

    }

    private void pluckArrayValue(FastEntity<?> entity, List<FastEntity<?>> entities) {
        Collection<FastColumnInfo<?>> columns = entity.getTable().getColumns();
        boolean hasArray = false;
        for (FastColumnInfo<?> column : columns) {
            Object values = entity.get(column.getName());
            if (values == null || FastStringUtils.isEmpty(values.toString())) {
                continue;
            }

            if (entity.getBoolean(column.getName() + "@JsonArray")) {
                entity.remove(column.getName());
                entity.remove(column.getName() + "@JsonArray");
                values = FastChar.getJson().fromJson(values.toString(), List.class).toArray();
            }

            if (values.getClass().isArray()) {
                hasArray = true;
                for (int i = 0; i < Array.getLength(values); i++) {
                    Object singleValue = Array.get(values, i);
                    if (singleValue == null || FastStringUtils.isEmpty(singleValue.toString())) {
                        continue;
                    }
                    FastEntity<?> newEntity = FastChar.getOverrides().newInstance(entity.getClass());
                    newEntity.setAll(entity);
                    newEntity.set(column.getName(), singleValue);
                    pluckArrayValue(newEntity, entities);
                }
            }
        }
        if (!hasArray) {
            entities.add(entity);
        }
    }


    /**
     * 删除实体数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * where 用作sql的where判断语句 ,例如：where['t.userId'] = 1
     * data 以data为前缀的参数，提交实体数据，例如：data.topicError=无,data.topicState=1,data.topicTitle=我的话题
     */
    @AFastLog(value = "页面【${menu}】进行删除数据！", type = "删除数据")
    public void delete() throws Exception {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        boolean all = getParamToBoolean("all", false);
        if (all) {
            FastExtEntity<?> extEntity = FastClassUtils.newInstance(extEntityClass);
            if (extEntity != null) {
                if (FastStringUtils.isEmpty(menu)) {
                    menu = extEntity.getTableDetails();
                }
                setRequestAttr("menu", menu);

                String storeId = getParam("storeId", entityCode);
                if (!LIST_SQL_MAP.containsKey(storeId)) {
                    responseJson(-1, "清空失败！数据安全异常！");
                }

                boolean fromRecycle = extEntity.getBoolean("^fromRecycle");

                Collection<FastColumnInfo<?>> primaries = extEntity.getPrimaries();
                String keyName = primaries.iterator().next().getName();
                for (FastColumnInfo<?> primary : primaries) {
                    if (primary.isAutoincrement()) {
                        keyName = primary.getName();
                    }
                }

                FastSqlInfo fastSqlInfo = LIST_SQL_MAP.get(storeId);
                String listSql = FastSqlTool.removeOrderBy(fastSqlInfo.getSql());


                int fromIndex = listSql.indexOf("from");
                String tableName = extEntity.getTableName();
                if (fromRecycle) {
                    tableName = tableName + "_recycle";
                }

                String fromSqlStr = listSql.substring(fromIndex);
                String sqlStr = "select t." + keyName + " " + fromSqlStr;

                String deleteSql = "delete from " + tableName + " where " +
                        keyName + " in ( select * from ( " + sqlStr + ") as tmp ) ";
                int update = FastChar.getDB().update(deleteSql, fastSqlInfo.toParams());
                if (update > 0) {
                    responseJson(0, "删除成功！共删除了" + update + "条数据！");
                }
            }
        } else {
            int count = 0;
            List<? extends FastExtEntity<?>> entity = getParamToEntityList("data", extEntityClass);
            for (FastEntity<?> fastEntity : entity) {
                if (FastStringUtils.isEmpty(menu)) {
                    menu = fastEntity.getTableDetails();
                }
                setRequestAttr("menu", menu);

                fastEntity.put("fromWeb", true);
                if (!fastEntity.delete()) {
                    if (count > 0) {
                        responseJson(-1, "已成功删除" + count + "条数据后发生错误！" + fastEntity.getError());
                    }
                    responseJson(-1, fastEntity.getError());
                }
                count++;
            }
            responseJson(0, "删除成功！共删除了" + count + "条数据！", entity);
        }
        responseJson(-1, "删除失败！");
    }


    /**
     * 修改实体数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * data 以data为前缀的参数，提交实体数据，例如：data.topicError=无,data.topicState=1,data.topicTitle=我的话题
     */
    @AFastLog(value = "页面【${menu}】进行修改数据！", type = "修改数据")
    public void update() throws Exception {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");
        setRequestAttr("menu", menu);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        List<? extends FastExtEntity<?>> entity = getParamToEntityList("data", extEntityClass);
        for (FastEntity<?> fastEntity : entity) {
            if (FastStringUtils.isEmpty(menu)) {
                menu = fastEntity.getTableDetails();
            }
            setRequestAttr("menu", menu);
            fastEntity.put("fromWeb", true);
            if (!fastEntity.update()) {
                if (fastEntity.getModified().size() > 0) {
                    responseJson(-1, fastEntity.getError());
                }
            }
        }
        responseJson(0, "修改成功！", entity);
    }


    /**
     * 批量更新数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * where 用作sql的where判断语句 ,例如：where['t.userId'] = 1
     */
    @AFastLog(value = "页面【${menu}】进行批量修改数据！", type = "批量修改数据")
    public void batchUpdate() throws Exception {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");
        setRequestAttr("menu", menu);

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastClassUtils.newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        String field = getParam("field", true);
        String fieldValue = getParam("fieldValue", true);

        String storeId = getParam("storeId", entityCode);
        if (!LIST_SQL_MAP.containsKey(storeId)) {
            responseJson(-1, "更新失败！数据安全异常！");
        }
        FastSqlInfo fastSqlInfo = LIST_SQL_MAP.get(storeId);
        String listSql = FastSqlTool.removeOrderBy(fastSqlInfo.getSql());

        int fromIndex = listSql.indexOf("from");

        Collection<FastColumnInfo<?>> primaries = entity.getPrimaries();
        if (primaries.size() > 0) {
            FastColumnInfo<?> fastColumnInfo = primaries.iterator().next();
            String inSqlStr = " select " + fastColumnInfo.getName() + " " + listSql.substring(fromIndex);


            String sqlStr = " update " + entity.getTableName() + "  set " + field + " = '" + fieldValue + "' " +
                    " where " + fastColumnInfo.getName() + " in ( select * from ( " + inSqlStr + " ) as temp ) ";

            int updateCount = FastChar.getDB().update(sqlStr, fastSqlInfo.toParams());
            responseJson(0, "更新成功！共更新" + updateCount + "条数据！");
        }

        responseJson(-1, "更新失败！无效列表数据！");

    }


    /**
     * 复制实体数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * data 以data为前缀的参数，提交实体数据，例如：data.topicError=无,data.topicState=1,data.topicTitle=我的话题
     */
    @AFastLog(value = "页面【${menu}】进行复制数据！", type = "复制数据")
    public void copy() {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");
        setRequestAttr("menu", menu);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        List<? extends FastExtEntity<?>> entity = getParamToEntityList("data", extEntityClass);
        for (FastEntity<?> fastEntity : entity) {
            if (FastStringUtils.isEmpty(menu)) {
                menu = fastEntity.getTableDetails();
            }
            setRequestAttr("menu", menu);
            fastEntity.put("fromWeb", true);
            FastEntity<?> copySave = fastEntity.copySave();
            if (copySave == null) {
                responseJson(-1, "复制失败！" + fastEntity.getError());
            }
        }
        responseJson(0, "数据复制成功！");
    }


    /**
     * 清除某个属性为空的所有数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * where 用作sql的where判断语句 ,例如：where['t.userId'] = 1
     */
    @AFastLog(value = "页面【${menu}】进行清理数据！", type = "清理数据")
    public void clear() throws Exception {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");
        setRequestAttr("menu", menu);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastClassUtils.newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        if (FastStringUtils.isEmpty(menu)) {
            menu = entity.getTableDetails();
        }
        setRequestAttr("menu", menu);

        if (entity.getPrimaries().size() == 0) {
            responseJson(-1, "清除失败！此列表不允许此功能！");
        }


        String storeId = getParam("storeId", entityCode);
        if (!LIST_SQL_MAP.containsKey(storeId)) {
            responseJson(-1, "清理失败！数据安全异常！");
        }
        FastSqlInfo fastSqlInfo = LIST_SQL_MAP.get(storeId);
        String listSql = FastSqlTool.removeOrderBy(fastSqlInfo.getSql());

        int fromIndex = listSql.indexOf("from");

        Collection<FastColumnInfo<?>> primaries = entity.getPrimaries();
        String keyName = primaries.iterator().next().getName();

        String sqlStr = "select t." + keyName + " " + listSql.substring(fromIndex);

        String field = getParam("field", true);
        field = FastSqlTool.formatAlias(field, "t");


        sqlStr += " and  " + field + " is null ";


        String deleteSql = "delete from " + entity.getTableName() + " where " +
                keyName + " in ( select * from ( " + sqlStr + ") as tmp ) ";

        int update = FastChar.getDB().update(deleteSql, fastSqlInfo.toParams());

        responseJson(0, "清理成功！共清理" + update + "条数据！");
    }


    /**
     * 清除某个属性重复的数据，保留一条
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * where 用作sql的where判断语句 ,例如：where['t.userId'] = 1
     * type 0：只保留最早的一条 1：只保留最新的一条
     */
    @AFastLog(value = "页面【${menu}】进行清理重复数据！", type = "清理重复数据")
    public void repeat() throws Exception {

        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");
        setRequestAttr("menu", menu);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastClassUtils.newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        if (FastStringUtils.isEmpty(menu)) {
            menu = entity.getTableDetails();
        }
        setRequestAttr("menu", menu);

        if (entity.getPrimaries().size() == 0) {
            responseJson(-1, "清除失败！此列表不允许此功能！");
        }


        String storeId = getParam("storeId", entityCode);
        if (!LIST_SQL_MAP.containsKey(storeId)) {
            responseJson(-1, "清理失败！数据安全异常！");
        }
        FastSqlInfo fastSqlInfo = LIST_SQL_MAP.get(storeId);
        String listSql = FastSqlTool.removeOrderBy(fastSqlInfo.getSql());


        int fromIndex = listSql.indexOf("from");

        Collection<FastColumnInfo<?>> primaries = entity.getPrimaries();
        String keyName = primaries.iterator().next().getName();

        int type = getParamToInt("type");
        String selectItem = "min(" + keyName + ")";
        String sqlStr = "select {{selectItem}} " +  listSql.substring(fromIndex);
        if (type == 1) {
            selectItem = "max(" + keyName + ")";
            sqlStr = "select {{selectItem}}  " +  listSql.substring(fromIndex);
        }

        String field = getParam("field", true);
        field = FastSqlTool.formatAlias(field, "t");


        Object[] params = fastSqlInfo.toParams();

        List<Object> paramsList = new ArrayList<>(Arrays.asList(params));
        if (paramsList.size() == 0) {
            String deleteSql = "delete from " + entity.getTableName() + "  where " +
                    keyName + " not in ( select * from ( " + sqlStr.replace("{{selectItem}}", selectItem) + "  group by " + field + " ) as tmp ) ";

            int update = FastChar.getDB().update(deleteSql, paramsList.toArray());
            responseJson(0, "清理成功！共清理" + update + "条重复数据！");
        } else {
            String deleteSql = "delete from " + entity.getTableName() + "  where " +
                    keyName + " not in ( select * from ( " + sqlStr.replace("{{selectItem}}", selectItem) + " group by " + field + " ) as tmp )" +
                    "  and " +
                    keyName + " in (select * from (" + sqlStr.replace("{{selectItem}}", keyName) + ") as tmp2 ) ";

            paramsList.addAll(Arrays.asList(FastArrayUtils.clone(params)));
            int update = FastChar.getDB().update(deleteSql, paramsList.toArray());

            responseJson(0, "清理成功！共清理" + update + "条重复数据！");
        }
    }


    /**
     * 从回收站中还原实体数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * data 以data为前缀的参数，提交实体数据，例如：data.topicError=无,data.topicState=1,data.topicTitle=我的话题
     */
    @AFastLog(value = "页面【${menu}】进行还原数据！", type = "数据还原")
    public void reback() {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");
        setRequestAttr("menu", menu);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        List<? extends FastExtEntity<?>> entity = getParamToEntityList("data", extEntityClass);
        for (FastEntity<?> fastEntity : entity) {
            if (FastStringUtils.isEmpty(menu)) {
                menu = fastEntity.getTableDetails();
            }
            setRequestAttr("menu", menu);
            FastExtData<?> fastData = (FastExtData<?>) fastEntity.getFastData();
            if (fastData.copyFromRecycle()) {
                fastData.deleteRecycle();
            }
        }
        responseJson(0, "还原成功！");
    }


    /**
     * 计算实体指定属性的值
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * type 计算类型，为sql的计算函数，例如：sum、avg
     * field 需要计算的字段名
     */
    public void compute() throws Exception {
        String entityCode = getParam("entityCode", true);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastClassUtils.newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }


        String storeId = getParam("storeId", entityCode);
        if (!LIST_SQL_MAP.containsKey(storeId)) {
            responseJson(-1, "计算失败！数据安全异常！");
        }
        FastSqlInfo fastSqlInfo = LIST_SQL_MAP.get(storeId);
        String listSql = FastSqlTool.removeOrderBy(fastSqlInfo.getSql());

        String type = getParam("type", true);
        String field = getParam("field", true);
        field = FastSqlTool.formatAlias(field, "t");
        int fromIndex = listSql.indexOf("from");
        String  sqlStr = "select " + type + "(" + field + ") as result " + listSql.substring(fromIndex);

        FastEntity<?> fastEntity = FastChar.getDB().selectFirst(sqlStr, fastSqlInfo.toParams());
        if (fastEntity != null) {
            responseJson(0, "计算成功！", fastEntity.getFloat("result", 4));
        } else {
            responseJson(-1, "计算失败！");
        }
    }

    /**
     * 导出实体数据excel
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * where 列表sql的where判断语句 ,例如：where['t.userId'] = 1
     * indexSort 指定排序列 json数组，例如：[{"property":"serviceNickName","direction":"DESC"}]
     * column 需要导出的列 json数组
     */
    @AFastLog(value = "导出了【${entityDetails}】数据！", type = "数据导出")
    public void export() throws Exception {
        String entityCode = getParam("entityCode", true);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        setRequestAttr("entityDetails", entity.getTableDetails());

        entity.putAll(getParamToMap("where"));
        entity.putAll(getParamToMap("colWhere"));

        ExtManagerEntity managerEntity = ExtManagerEntity.getSession(this);
        entity.pullLayer(managerEntity);

        Map<String, Object> index = getParamToMap("indexSort");

        String sort = getParam("sort");
        if (FastStringUtils.isNotEmpty(sort)) {
            List<Map<String, String>> sortList = FastChar.getJson().fromJson(sort,
                    new TypeToken<List<Map<String, String>>>() {
                    }.getType());
            for (Map<String, String> map : sortList) {
                if (map.get("property").startsWith("@")) {
                    continue;
                }
                entity.put(FastNumberUtils.formatToInt(index.get(map.get("property"))) + map.get("property") + ":sort", map.get("direction"));
            }
        }

        List<Map<String, Object>> columns = getParamToMapList("column");

        if (getParamToBoolean("exportIndex", false)) {
            Map<String, Object> indexColumn = new HashMap<>();
            indexColumn.put("text", "序号");
            indexColumn.put("valueIndex", "__index");
            columns.add(0, indexColumn);
        }


        String title = getParam("title", true);

        FastPage<?> fastPage = entity.showList(-1, -1);
        List<?> list = fastPage.getList();
        if (list.size() == 0) {
            responseJson(-1, "暂无数据！");
        }


        //创建一个新的Excel
        Workbook workBook = new SXSSFWorkbook();
        POIHelper poiHelper = new POIHelper(workBook);

        //创建sheet页
        Sheet sheet = workBook.createSheet();
        //sheet页名称
        workBook.setSheetName(0, title.replace("/", "_"));

        //设置默认的行高
        sheet.setDefaultRowHeight((short) (30 * 20));
        sheet.setDefaultRowHeightInPoints((short) 30);

        DataFormat dataFormat = workBook.createDataFormat();

        CellStyle titleCellStyle = poiHelper.getCellStyle("title");
        titleCellStyle.setAlignment(HorizontalAlignment.CENTER);
        titleCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        Font titleFont = poiHelper.getFont("title");
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleCellStyle.setFont(titleFont);

        int[] rowIndex = new int[]{0};
        Row tableNameRow = sheet.createRow(rowIndex[0]++);
        Cell tableNameCell = tableNameRow.createCell(0);
        tableNameCell.setCellStyle(titleCellStyle);
        tableNameCell.setCellValue(title);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, columns.size() - 1));//合并第一行的单元格

        createTitleRow(titleCellStyle, rowIndex, sheet, columns);

        sheet.createFreezePane(0, sheet.getPhysicalNumberOfRows(), 0, sheet.getPhysicalNumberOfRows());

        int titleRow = sheet.getLastRowNum();
        Map<Integer, Integer> columnValueMap = new HashMap<>();

        CellStyle defaultCellStyle = poiHelper.getCellStyle("default");
        defaultCellStyle.cloneStyleFrom(titleCellStyle);
        Font valueFont = poiHelper.getFont("cell");
        valueFont.setBold(false);
        valueFont.setFontHeightInPoints((short) 14);
        defaultCellStyle.setFont(valueFont);
        defaultCellStyle.setDataFormat(dataFormat.getFormat("text"));

        for (int i = 0; i < columns.size(); i++) {
            if (!columnValueMap.containsKey(i)) {
                columnValueMap.put(i, 0);
            }

            Map<String, Object> column = columns.get(i);
            CellStyle columnStyle = POIUtils.getColumnStyle(sheet, column, defaultCellStyle, poiHelper, titleRow, i);

            sheet.setDefaultColumnStyle(i, columnStyle);

            Row row = sheet.getRow(sheet.getLastRowNum());
            if (row == null) {
                continue;
            }
            if (column.containsKey("comment")) {
                POIUtils.setCellComment(sheet, row.getCell(i), String.valueOf(column.get("comment")));
            }
            columnValueMap.put(i, Math.max(columnValueMap.get(i), row.getCell(i).getStringCellValue().getBytes().length));
        }


        for (int i = 0; i < list.size(); i++) {
            FastEntity<?> data = (FastEntity<?>) list.get(i);
            data.put("__index", i + 1);

            Row row = sheet.createRow(i + rowIndex[0]);
            for (int j = 0; j < columns.size(); j++) {
                Map<String, Object> column = columns.get(j);
                Object entityData = data.get(FastStringUtils.defaultValue(column.get("valueIndex"), "none"));
                if (entityData == null) {
                    continue;
                }

                Cell cell = row.createCell(j);
                cell.setCellStyle(defaultCellStyle);
                String value = FastStringUtils.defaultValue(entityData, "");

                boolean isCollection = false;
                if (entityData instanceof Collection) {
                    isCollection = true;
                    Collection<?> collection = (Collection<?>) entityData;
                    if (FastBooleanUtils.formatToBoolean(column.get("files"), false)) {
                        List<String> items = new ArrayList<>();
                        for (Object o : collection) {
                            String url = FastStringUtils.defaultValue(o, "");
                            items.add(url.split("@")[0]);
                        }
                        value = FastStringUtils.join(items, " , ");
                    } else {
                        value = FastStringUtils.join(collection, " , ");
                    }
                }

                if (column.get("enum") != null && FastStringUtils.isNotEmpty(column.get("enum").toString())) {
                    if (FastStringUtils.isNotEmpty(value)) {
                        FastEnumInfo anEnum = FastExtEnumHelper.getEnum(String.valueOf(column.get("enum")), value);
                        if (anEnum != null) {
                            value = FastStringUtils.defaultValue(anEnum.getText(), value);
                        }
                    }
                }

                if (FastBooleanUtils.formatToBoolean(column.get("file"), false)
                        && FastStringUtils.isNotEmpty(value)) {
                    if (!value.startsWith("http://") && !value.startsWith("https://")) {
                        value = getProjectHost() + FastStringUtils.stripStart(value, "/");
                    }
                }


                if (value.length() < 32767) {
                    if ((value.startsWith("http://") || value.startsWith("https://")) && !isCollection) {
                        cell.setCellFormula("HYPERLINK(\"" + value + "\",\"" + value + "\")");
                        Font linkFont = poiHelper.getFont("link");
                        linkFont.setFontHeightInPoints((short) 14);
                        linkFont.setUnderline((byte) 1);
                        linkFont.setColor(HSSFColor.HSSFColorPredefined.BLUE.getIndex());

                        CellStyle columnCellStyle = poiHelper.getCellStyle("link");
                        columnCellStyle.cloneStyleFrom(defaultCellStyle);
                        columnCellStyle.setFont(linkFont);
                        cell.setCellStyle(columnCellStyle);
                    } else {
                        //此处取消类型数据格式化，避免数据丢失
                        cell.setCellValue(new XSSFRichTextString(value));
                    }
                    columnValueMap.put(cell.getColumnIndex(), Math.max(columnValueMap.get(cell.getColumnIndex()), value.getBytes().length));
                } else {
                    cell.setCellValue("内容长度过大,无法添加到Excel中");
                }
            }
        }

        for (Map.Entry<Integer, Integer> integerIntegerEntry : columnValueMap.entrySet()) {
            int width = Math.min((integerIntegerEntry.getValue() + 5) * 256, 155 * 256);
            sheet.setColumnWidth(integerIntegerEntry.getKey(), width);
        }

        ExtExcelModelInfo extExcelModelInfo = new ExtExcelModelInfo();
        extExcelModelInfo.setTitleRowNum(titleRow);
        extExcelModelInfo.setBeginRowNum(titleRow);
        extExcelModelInfo.setColumns(columns);

        Sheet extExcelModelInfoSheet = workBook.createSheet("模板配置");
        Cell dataCell = extExcelModelInfoSheet.createRow(0).createCell(0);
        dataCell.setCellValue(FastChar.getJson().toJson(extExcelModelInfo));
        extExcelModelInfoSheet.protectSheet(FastStringUtils.buildUUID());
        workBook.setSheetHidden(workBook.getSheetIndex(extExcelModelInfoSheet), true);


        String child = "excel/" + title + "_数据" + ".xlsx";
        File file = new File(FastChar.getConstant().getAttachDirectory(), child);

        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        FileOutputStream fileOutputStream = new FileOutputStream(file);
        workBook.write(fileOutputStream);
        fileOutputStream.close();
        workBook.close();
        responseJson(0, "导出成功，共导出" + list.size() + "条数据！", FastFile.newInstance(file).getUrl());
    }


    private void createTitleRow(CellStyle cellStyle, int[] rowIndex, Sheet sheet, List<Map<String, Object>> columns) {
        java.util.List<String> title = new ArrayList<>();
        for (Map<String, Object> column : columns) {
            String text = String.valueOf(column.get("text"));
            if (column.containsKey("groupHeaderText") && FastStringUtils.isNotEmpty(column.get("groupHeaderText").toString())) {
                text = column.get("groupHeaderText").toString() + "@" + text;
            }
            if (column.containsKey("excelHeaderText")) {
                text = FastStringUtils.defaultValue(column.get("excelHeaderText"), text);
            }
            title.add(text);
        }
        POIUtils.createTitleRow(cellStyle, rowIndex, sheet, title);
    }


    /**
     * 生成实体excel导入数据的模板
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * column 列集合 json数组
     */
    @AFastLog(value = "生成【${entityDetails}】Excel模板！", type = "Excel模板")
    public void module() throws Exception {
        String entityCode = getParam("entityCode", true);

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        setRequestAttr("entityDetails", entity.getTableDetails());

        List<Map<String, Object>> columns = getParamToMapList("column");
        if (columns.size() == 0) {
            responseJson(-1, "下载失败！列信息错误！");
        }
        List<Map<String, Object>> waitRemove = new ArrayList<>();
        for (Map<String, Object> column : columns) {
            String dataIndex = column.get("dataIndex").toString();
            if (entity.isPrimary(dataIndex) && entity.isAutoincrement(dataIndex)) {
                waitRemove.add(column);
            }
            if (entity.isLink(dataIndex)) {
                FastExtColumnInfo columnInfo = entity.getColumn(dataIndex);
                if (FastType.isNumberType(columnInfo.getLinkInfo().getKeyColumn().getType())) {
                    column.put("text", column.get("text") + "ID");
                    column.put("type", "textfield");
                }
            }
        }
        columns.removeAll(waitRemove);

        Map<Integer, Integer> columnValueMap = new HashMap<>();


        String title = getParam("title", true);

        Workbook workBook = new XSSFWorkbook();
        POIHelper poiHelper = new POIHelper(workBook);
        Sheet sheet = workBook.createSheet();

        //设置默认的行高
        sheet.setDefaultRowHeight((short) (30 * 20));
        sheet.setDefaultRowHeightInPoints((short) 30);

        workBook.setSheetName(0, title);


        CellStyle titleCellStyle = poiHelper.getCellStyle("title");
        titleCellStyle.setAlignment(HorizontalAlignment.CENTER);
        titleCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        Font titleFont = poiHelper.getFont("title");
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleCellStyle.setFont(titleFont);

        int[] rowIndex = new int[]{0};

        Row tableNameRow = sheet.createRow(rowIndex[0]++);

        Cell tableNameCell = tableNameRow.createCell(0);
        tableNameCell.setCellStyle(titleCellStyle);
        tableNameCell.setCellValue(title);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, columns.size() - 1));//合并第一行的单元格

        createTitleRow(titleCellStyle, rowIndex, sheet, columns);

        DataFormat format = workBook.createDataFormat();

        CellStyle defaultCellStyle = poiHelper.getCellStyle("default");
        defaultCellStyle.cloneStyleFrom(titleCellStyle);
        Font valueFont = poiHelper.getFont("value");
        valueFont.setBold(false);
        valueFont.setFontHeightInPoints((short) 14);
        defaultCellStyle.setFont(valueFont);
        defaultCellStyle.setDataFormat(format.getFormat("text"));

        Row titleRow = sheet.getRow(rowIndex[0] - 1);

        sheet.createFreezePane(0, sheet.getPhysicalNumberOfRows(), 0, sheet.getPhysicalNumberOfRows());

        for (int i = 0; i < columns.size(); i++) {
            Map<String, Object> column = columns.get(i);

            CellStyle columnStyle = POIUtils.getColumnStyle(sheet, column, defaultCellStyle, poiHelper, titleRow.getRowNum(), i);
            Cell cell = titleRow.getCell(i);

            if (column.containsKey("comment")) {
                POIUtils.setCellComment(sheet, cell, String.valueOf(column.get("comment")));
            }
            sheet.setDefaultColumnStyle(cell.getColumnIndex(), columnStyle);

            if (!columnValueMap.containsKey(i)) {
                columnValueMap.put(i, 0);
            }
            columnValueMap.put(i, cell.getStringCellValue().getBytes().length);

        }


        for (Map.Entry<Integer, Integer> integerIntegerEntry : columnValueMap.entrySet()) {
            int width = Math.min((integerIntegerEntry.getValue() + 5) * 256, 155 * 256);
            sheet.setColumnWidth(integerIntegerEntry.getKey(), width);
        }

        ExtExcelModelInfo extExcelModelInfo = new ExtExcelModelInfo();
        extExcelModelInfo.setTitleRowNum(titleRow.getRowNum());
        extExcelModelInfo.setBeginRowNum(sheet.getLastRowNum());
        extExcelModelInfo.setColumns(columns);


        Sheet extExcelModelInfoSheet = workBook.createSheet("模板配置");
        Cell dataCell = extExcelModelInfoSheet.createRow(0).createCell(0);
        dataCell.setCellValue(FastChar.getJson().toJson(extExcelModelInfo));
        workBook.setSheetHidden(workBook.getSheetIndex(extExcelModelInfoSheet), true);


        String child = "excel/" + title + "_导入数据模板" + ".xlsx";
        File file = new File(FastChar.getConstant().getAttachDirectory(), child);

        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        FileOutputStream fileOutputStream = new FileOutputStream(file);
        workBook.write(fileOutputStream);
        fileOutputStream.close();
        workBook.close();
        responseJson(0, "下载成功！", FastFile.newInstance(file).getUrl());
    }


    /**
     * 导入实体Excel数据
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * file excel文件
     */
    @AFastLog(value = "导入【${entityDetails}】数据！", type = "数据导入")
    public void importData() throws Exception {
        String entityCode = getParam("entityCode", true);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        setRequestAttr("entityDetails", FastChar.getOverrides().newInstance(extEntityClass).getTableDetails());
        //公共属性值
        Map<String, Object> values = getParamToMap("value");
        if (values == null) {
            values = new HashMap<>();
        }

        List<FastEntity<?>> batchSave = new ArrayList<>();
        List<FastEntity<?>> batchUpdate = new ArrayList<>();


        FastFile<?> paramFile = getParamFile();
        FileInputStream inputStream = new FileInputStream(paramFile.getFile());
        Workbook workbook = WorkbookFactory.create(inputStream);

        ExtExcelModelInfo extExcelModelInfo = null;
        Sheet extExcelModelInfoSheet = workbook.getSheet(ExtExcelModelInfo.class.getSimpleName());
        if (extExcelModelInfoSheet == null) {
            extExcelModelInfoSheet = workbook.getSheet("模板配置");
        }
        if (extExcelModelInfoSheet != null) {
            String configInfo = extExcelModelInfoSheet.getRow(0).getCell(0).getStringCellValue();
            extExcelModelInfo = FastChar.getJson().fromJson(configInfo, ExtExcelModelInfo.class);
        }

        int sheetCount = workbook.getNumberOfSheets();
        for (int i = 0; i < sheetCount; i++) {
            if (workbook.isSheetHidden(i)) {
                continue;
            }
            Sheet sheet = workbook.getSheetAt(i);

            String sheetName = sheet.getSheetName();
            if (sheetName.equalsIgnoreCase(ExtExcelModelInfo.class.getSimpleName())) {
                continue;
            }

            int titleRowNum = 0;
            int beginRowNum = 1;
            int rowCount = sheet.getPhysicalNumberOfRows();
            List<Map<String, Object>> columns = new ArrayList<>();

            //兼容老版本的模板
            if (sheetName.contains("@标识码禁止删除@")) {
                String onlyCode = sheetName.split("@标识码禁止删除@")[1];
                ExtSystemConfigEntity entityExcelModule = ExtSystemConfigEntity.getInstance().selectById(onlyCode);

                if (entityExcelModule == null) {
                    responseJson(-1, "导入失败！数据模板信息不存在，请您重新下载模板！");
                    continue;
                }

                columns = FastChar.getJson().fromJson(entityExcelModule.getConfigValue(), new TypeToken<List<Map<String, Object>>>() {
                }.getType());
            }

            if (extExcelModelInfo != null) {
                titleRowNum = extExcelModelInfo.getTitleRowNum();
                beginRowNum = extExcelModelInfo.getBeginRowNum() + 1;
                columns = extExcelModelInfo.getColumns();
            }

            Row titleRow = sheet.getRow(titleRowNum);

            //标题行
            for (int i1 = beginRowNum; i1 < rowCount; i1++) {
                Row dataRow = sheet.getRow(i1);
                if (dataRow == null) {
                    continue;
                }
                if (dataRow.getFirstCellNum() < 0) {
                    continue;
                }

                FastEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
                if (entity == null) {
                    responseJson(-1, "EntityCode不存在！" + entityCode);
                    return;
                }
                setRequestAttr("entityDetails", entity.getTableDetails());
                int cellCount = dataRow.getLastCellNum();
                for (int i2 = 0; i2 < cellCount; i2++) {
                    Cell cell = dataRow.getCell(i2);
                    Object value = POIUtils.getCellValue(workbook, cell);

                    if (i2 >= columns.size()) {
                        if (titleRow != null) {
                            Object cellTitle = POIUtils.getCellValue(workbook, titleRow.getCell(i2));
                            if (cellTitle != null) {
                                entity.put(cellTitle.toString(), value);
                            }
                            continue;
                        } else {
                            break;
                        }
                    }
                    Map<String, Object> column = columns.get(i2);
                    String type = String.valueOf(column.get("type"));


                    if (value != null && FastStringUtils.isNotEmpty(String.valueOf(value))) {
                        if (column.containsKey("enum") && FastStringUtils.isNotEmpty(String.valueOf(column.get("enum")))) {
                            FastEnumInfo anEnum = FastExtEnumHelper.getEnum(String.valueOf(column.get("enum")), String.valueOf(value));
                            if (anEnum == null) {
                                continue;
                            }
                            value = anEnum.getId();
                        } else if (type.equalsIgnoreCase("numberfield")) {
                            value = FastNumberUtils.formatToNumber(value).doubleValue();
                        }
                        entity.put(String.valueOf(column.get("dataIndex")), value);
                    }
                }
                if (entity.getTable() instanceof FastExtTableInfo) {
                    FastExtTableInfo extTableInfo = entity.getTable();
                    if (extTableInfo.isBindSessionLayer()) {
                        ExtManagerEntity managerEntity = ExtManagerEntity.getSession(this);
                        entity.put(FastExtEntity.EXTRA_PARENT_LAYER_CODE, managerEntity.getLayerValue());
                    }
                }
                if (entity.isEmptyColumn()) {
                    continue;
                }
                if (entity.size() > 0) {
                    entity.putAll(values);
                    entity.clearEmpty();

                    int pCount = 0;
                    Collection<FastColumnInfo<?>> primaries = entity.getPrimaries();
                    for (FastColumnInfo<?> primary : primaries) {
                        if (entity.isNotEmpty(primary.getName())) {
                            pCount++;
                        }
                    }
                    entity.put("__entityId", FastMD5Utils.MD5To16(FastStringUtils.buildUUID()));
                    if (pCount == primaries.size() && primaries.size() > 0) {
                        entity.put("__operate", "update");
                        batchUpdate.add(entity);
                    } else {
                        entity.put("__operate", "save");
                        batchSave.add(entity);
                    }
                }
            }
        }


        inputStream.close();
        workbook.close();

        paramFile.delete();

        List<FastEntity<?>> all = new ArrayList<>();
        all.addAll(batchSave);
        all.addAll(batchUpdate);

        IFastImportDataListener iFastImportData = FastChar.getOverrides().newInstance(false, IFastImportDataListener.class);
        if (iFastImportData != null) {
            FastHandler handler = new FastHandler();
            iFastImportData.onBeforeImportData(all, handler);
            if (handler.getCode() == -1) {
                responseJson(-1, handler.getError());
            } else if (handler.getCode() == -2) {
                responseJson(0, handler.getError());
            }
        }

        batchSave = new ArrayList<>();
        batchUpdate = new ArrayList<>();
        for (FastEntity<?> fastEntity : all) {
            if (fastEntity.getString("__operate", "none").equalsIgnoreCase("save")) {
                batchSave.add(fastEntity);
            } else if (fastEntity.getString("__operate", "none").equalsIgnoreCase("update")) {
                batchUpdate.add(fastEntity);
            }
        }
        all.clear();
        
        if (batchSave.size() > 0) {
            FastChar.getDB().batchSaveEntity(batchSave, Math.min(batchSave.size(), 10000));
        }

        if (batchUpdate.size() > 0) {
            FastChar.getDB().batchUpdateEntity(batchUpdate, Math.min(batchUpdate.size(), 10000));
        }

        if (iFastImportData != null) {
            FastHandler handler = new FastHandler();
            iFastImportData.onAfterImportData(all, handler);
            if (handler.getCode() == -1) {
                responseJson(-1, handler.getError());
            } else if (handler.getCode() == -2) {
                responseJson(0, handler.getError());
            }
        }
        StringBuilder msg = new StringBuilder();
        if (batchSave.size() > 0) {
            msg.append("共导入").append(batchSave.size()).append("条数据！");
        }
        if (batchUpdate.size() > 0) {
            msg.append("共更新").append(batchUpdate.size()).append("条数据！");
        }
        if (msg.length() == 0) {
            msg.append("共导入0条数据！");
        }

        //避免导入数据过多占用内存
        batchSave.clear();
        batchUpdate.clear();

        //上传文件强制使用text/html格式返回，避免浏览器弹出json下载，ie
        if (!isParamExists(PARAM_ACCPET) && getParam("__browser", "none").equalsIgnoreCase("ie")) {
            addParam(PARAM_ACCPET, "text/html");
        }
        responseJson(0, "导入成功！" + msg);
    }


    /**
     * 下载实体数据
     */
    public void downData() throws Exception {
        String entityCode = getParam("entityCode", true);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        setRequestAttr("entityDetails", entity.getTableDetails());

        boolean fromTree = getParamToBoolean("fromTree");

        entity.putAll(getParamToMap("where"));
        entity.putAll(getParamToMap("colWhere"));

        if (fromTree) {
            String treeParentIdName = getParam("treeParentIdName");
            if (FastStringUtils.isNotEmpty(treeParentIdName)) {
                entity.remove(treeParentIdName);
            }
        }

        ExtManagerEntity managerEntity = ExtManagerEntity.getSession(this);
        entity.pullLayer(managerEntity);

        FastPage<?> fastPage = entity.showList(-1, -1);
        List<?> list = fastPage.getList();
        if (list.size() == 0) {
            responseJson(-1, "下载失败！暂无下载的数据！");
        }

        String versionStr = "v1_0";
        FastHeadExtInfo version = FastExtConfig.getInstance().getExtInfo("version");
        if (version != null) {
            versionStr = version.getMapWrap().getString("desc", "v1.0").toLowerCase().replace(".", "_");
        }
        File dataFile = new File(FastChar.getConstant().getAttachDirectory(), entityCode + "_" + versionStr.toUpperCase() + ".data");

        Map<String, Object> data = new HashMap<>();
        data.put("entity", extEntityClass.getName());
        data.put("data", FastChar.getJson().toJson(list));

        byte[] serialize = FastSerializeUtils.serialize(data);
        FastFileUtils.writeByteArrayToFile(dataFile, serialize);

        responseJson(0, "获取成功！", FastFile.newInstance(dataFile).getUrl());
    }


    /**
     * 上传数据
     */
    @SuppressWarnings("unchecked")
    public void loadData() throws Exception {
        //上传文件强制使用text/html格式返回，避免浏览器弹出json下载，ie
        if (!isParamExists(PARAM_ACCPET) && getParam("__browser", "none").equalsIgnoreCase("ie")) {
            addParam(PARAM_ACCPET, "text/html");
        }

        String entityCode = getParam("entityCode", true);

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        Collection<FastColumnInfo<?>> primaries = entity.getPrimaries();
        List<String> checkAttr = new ArrayList<>();
        for (FastColumnInfo<?> primary : primaries) {
            checkAttr.add(primary.getName());
        }

        FastFile<?> paramFile = getParamFile();
        byte[] bytes = FastFileUtils.readFileToByteArray(paramFile.getFile());


        Map<String, Object> dataMap = (Map<String, Object>) FastSerializeUtils.deserialize(bytes);
        if (dataMap != null) {
            FastMapWrap fastMapWrap = FastMapWrap.newInstance(dataMap);
            if (getParamToBoolean("strict")) {
                String entityCacheName = fastMapWrap.getString("entity");
                if (!entityCacheName.equals(extEntityClass.getName())) {
                    responseJson(-1, "上传失败！数据类型不匹配！");
                }
            }
            List<FastEntity<?>> entityList = new ArrayList<>();
            String dataJson = fastMapWrap.getString("data");
            List<?> data = FastChar.getJson().fromJson(dataJson, List.class);
            for (Object datum : data) {
                FastEntity<?> entityData = FastChar.getOverrides().newInstance(extEntityClass);
                entityData.setAll((Map<String, Object>) datum);
                entityData.clearEmpty();
                if (entityData.isEmptyColumn()) {
                    continue;
                }
                for (String key : entityData.allKeys()) {
                    Object keyValue = entityData.get(key);
                    if (keyValue instanceof Number) {
                        continue;
                    }
                    if (keyValue instanceof String) {
                        continue;
                    }
                    if (keyValue instanceof byte[]) {
                        continue;
                    }
                    if (keyValue instanceof Date) {
                        continue;
                    }
                    entityData.put(key, FastChar.getJson().toJson(keyValue));
                }
                entityList.add(entityData);
            }

            int[] batchSaveResult = FastChar.getDB().batchSaveEntity(entityList, Math.min(entityList.size(), 2000), checkAttr.toArray(new String[]{}));
            paramFile.delete();
            int count = 0;
            for (int i : batchSaveResult) {
                if (i > 0) {
                    count++;
                }
            }
            responseJson(0, "数据上传成功！共" + count + "条数据！");
        }
        paramFile.delete();
        responseJson(-1, "上传失败！数据文件解析失败！");
    }


    /**
     * 更新权限编号
     */
    public void updateLayer() {
        String entityCode = getParam("entityCode", true);

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtLayerHelper.LayerMap layerMap = entity.getLayerMap();
        if (layerMap != null) {
            FastExtLayerHelper.updateAllLayerValue(layerMap);
            responseJson(0, "更新成功！共更新了" + layerMap.toAllTableNameList().size() + "张关系表格！");
        }
        responseJson(-1, "更新失败！表格未绑定权限层级！");
    }


    /**
     * 更新相同字段值
     */
    public void updateSame() {
        String entityCode = getParam("entityCode", true);

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtLayerHelper.LayerMap layerMap = entity.getLayerMap();
        if (layerMap != null) {
            int sameColumn = FastExtSameHelper.updateSameColumn(layerMap);
            responseJson(0, "更新成功！共更新了" + sameColumn + "张关系表格！");
        }
        responseJson(-1, "更新失败！表格未被其他表格绑定！");
    }


    /**
     * 获取图表echarts的配置json数据
     * 参数：
     * type 图表类型：0 日图表 1 月图表 2 时段图表
     */
    public void echarts() {
        String entityCode = getParam("entityCode", true);
        String columnDate = getParam("columnDate", true);

        int type = getParamToInt("type", 0);
        String beginDate = getParam("beginDate", "1912-01-01");
        String endDate = getParam("endDate", FastDateUtils.getDateString("yyyy-MM-dd"));
        String chartTitle = getParam("chartTitle", "FastChart图表");
        String chartType = getParam("chartType", "line");

        beginDate = beginDate + " 00:00:00";
        endDate = endDate + " 23:59:59";


        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        FastExtEntity<?> entity = FastChar.getOverrides().newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        setRequestAttr("entityDetails", entity.getTableDetails());

        List<String> seriesColumns = new ArrayList<>();

        Map<String, String> selectColumnMap = new LinkedHashMap<>();

        List<Map<String, Object>> echarts = getParamToMapList("echarts");
        for (Map<String, Object> echart : echarts) {
            String column = FastStringUtils.defaultValue(echart.get("property"), "");
            String function = FastStringUtils.defaultValue(echart.get("function"), "");
            String details = FastStringUtils.defaultValue(echart.get("details"), "");
            String nickName = column + FastStringUtils.firstCharToUpper(function);

            if (FastStringUtils.isNotEmpty(column) && FastStringUtils.isNotEmpty(function)) {
                seriesColumns.add(function + "(" + FastSqlTool.formatAlias(column, "t") + ") as " + nickName);
                selectColumnMap.put(nickName, details);
            }
        }
        columnDate = FastSqlTool.formatAlias(columnDate, "t");

        String dateSelect = "date_format(" + columnDate + ",'%Y-%m-%d') as reportDate ";
        if (type == 1) {//月报表
            dateSelect = "date_format(" + columnDate + ",'%Y-%m') as reportDate ";
        } else if (type == 2) {//时报表
            dateSelect = "date_format(" + columnDate + ",'%H:00') as reportDate ";
        } else if (type == 3) {//时分报表
            dateSelect = "date_format(" + columnDate + ",'%H:%i') as reportDate ";
        } else if (type == 4) {//年报表
            dateSelect = "date_format(" + columnDate + ",'%Y') as reportDate ";
        }

        String storeId = getParam("storeId", entityCode);
        if (!LIST_SQL_MAP.containsKey(storeId)) {
            responseJson(-1, "统计失败！数据安全异常！");
        }
        FastSqlInfo fastSqlInfo = LIST_SQL_MAP.get(storeId);
        String listSql = FastSqlTool.removeOrderBy(fastSqlInfo.getSql());

        int fromIndex = listSql.indexOf("from");
        String sqlStr = "select " + FastStringUtils.join(seriesColumns, ",") + " , " + dateSelect
                + listSql.substring(fromIndex);

        sqlStr += " where 1=1 and " + columnDate + " >= '" + beginDate + "' " +
                " and " + columnDate + " <= '" + endDate + "' " +
                " group by reportDate ";

        try {
            List<FastEChartsBean> chartBeans = new ArrayList<>();
            List<? extends FastEntity<?>> list = FastChar.getDB().setDatabase(entity.getDatabase()).select(sqlStr, fastSqlInfo.toParams());
            for (FastEntity<?> result : list) {
                for (Map.Entry<String, String> stringStringEntry : selectColumnMap.entrySet()) {
                    FastEChartsBean fastChartBean = new FastEChartsBean();
                    fastChartBean.setTitle(chartTitle);
                    fastChartBean.setName(stringStringEntry.getValue());
                    fastChartBean.setDate(result.getString("reportDate"));
                    fastChartBean.setValue(result.get(stringStringEntry.getKey()));
                    if (chartType.equalsIgnoreCase("stack")) {
                        fastChartBean.setType("bar");
                        fastChartBean.setStack("true");
                    } else {
                        fastChartBean.setType(chartType);
                    }
                    chartBeans.add(fastChartBean);
                }
            }
            responseJson(0, "获取成功！", FastEChartsBean.toJsonData(chartTitle, chartBeans));
        } catch (Exception e) {
            e.printStackTrace();
        }

    }


    /**
     * 替换指定的字符
     */
    public void replace() throws Exception {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");
        setRequestAttr("menu", menu);

        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        FastExtEntity<?> entity = FastClassUtils.newInstance(extEntityClass);
        if (entity == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }

        String field = getParam("field", true);
        String replace = getParam("replace", true);
        String toValue = getParam("toValue", "");

        String storeId = getParam("storeId", entityCode);
        if (!LIST_SQL_MAP.containsKey(storeId)) {
            responseJson(-1, "替换失败！数据安全异常！");
        }
        FastSqlInfo fastSqlInfo = LIST_SQL_MAP.get(storeId);
        String listSql = FastSqlTool.removeOrderBy(fastSqlInfo.getSql());

        int fromIndex = listSql.indexOf("from");

        Collection<FastColumnInfo<?>> primaries = entity.getPrimaries();
        if (primaries.size() > 0) {
            FastColumnInfo<?> fastColumnInfo = primaries.iterator().next();
            String inSqlStr = " select " + fastColumnInfo.getName() + " " + listSql.substring(fromIndex);

            String sqlStr = " update " + entity.getTableName() + "  set " + field + " = replace(" + field + ",'" + replace + "','" + toValue + "') " +
                    " where " + fastColumnInfo.getName() + " in ( select * from ( " + inSqlStr + " ) as temp ) ";

            int updateCount = FastChar.getDB().update(sqlStr, fastSqlInfo.toParams());
            responseJson(0, "替换成功！共替换" + updateCount + "条数据！");
        }




        responseJson(-1, "替换失败！无效列表数据！");

    }


    /**
     * 读取entity.js源码
     */
    public void loadSource() throws IOException {
        String entityCode = getParam("entityCode", true);

        FastExtConfig extConfig = FastExtConfig.getInstance();

        for (String sourcePath : extConfig.getAllSourceProjectPath()) {
            File file = ExtFileUtils.searchFile(new File(sourcePath), entityCode + ".js", ".js", true);
            if (file != null) {
                responseJson(0, "读取成功！", FastFileUtils.readFileToString(file, "utf-8"));
            }
        }
        responseJson(-1, "未查询到" + entityCode + ".js的源码文件！");
    }


    /**
     * 保存entity.js源码
     */
    public void saveSource() throws IOException {
        String entityCode = getParam("entityCode", true);
        String content = getParam("content", true);
        FastExtConfig extConfig = FastExtConfig.getInstance();

        for (String sourcePath : extConfig.getAllSourceProjectPath()) {
            File file = ExtFileUtils.searchFile(new File(sourcePath), entityCode + ".js", ".js", true);
            if (file != null) {
                FastFileUtils.writeStringToFile(file, content);
            }
        }

        //保存到编译的项目目录里js
        File file = ExtFileUtils.searchFile(new File(FastChar.getPath().getWebRootPath()), entityCode + ".js", ".js", true);
        if (file != null) {
            FastFileUtils.writeStringToFile(file, content);
        }

        responseJson(0, "保存成功！");
    }


}
