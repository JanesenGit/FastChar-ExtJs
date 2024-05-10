package com.fastchar.extjs.action;

import com.fastchar.core.*;
import com.fastchar.database.FastPage;
import com.fastchar.database.info.FastColumnInfo;
import com.fastchar.database.info.FastSqlInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.annotation.AFastLog;
import com.fastchar.extjs.annotation.AFastSecurityResponse;
import com.fastchar.extjs.annotation.AFastSession;
import com.fastchar.extjs.annotation.AFastToken;
import com.fastchar.extjs.core.FastExtDataHelper;
import com.fastchar.extjs.core.FastExtEntity;
import com.fastchar.extjs.core.FastExtLayerHelper;
import com.fastchar.extjs.core.FastExtSameHelper;
import com.fastchar.extjs.core.database.FastExtData;
import com.fastchar.extjs.core.database.FastExtTableInfo;
import com.fastchar.extjs.core.database.FastSqlTool;
import com.fastchar.extjs.echarts.FastEChartsBean;
import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.utils.*;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Array;
import java.util.*;

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
    @AFastToken
    @AFastSecurityResponse
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
    @AFastToken
    @AFastSecurityResponse
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

            FastExtEntity<?> extSaveEntity = (FastExtEntity<?>) saveEntity;

            saveEntity.put("fromWeb", true);
            saveEntity.put("session", managerEntity);
            saveEntity.clearEmpty();

            String[] checks = getParamToArray("check");
            String method = getParam("method", "save");
            if (checks.length == 0) {
                if (saveEntity.save()) {
                    saveResult.add(new FastHandler().setCode(0).setError("添加成功！").put("dataId", saveEntity.getId()));
                    extSaveEntity.addLog("add", "添加数据！");
                    continue;
                }
            } else {
                if (method.equalsIgnoreCase("save")) {
                    if (saveEntity.save(checks)) {
                        saveResult.add(new FastHandler().setCode(0).setError("添加成功！").put("dataId", saveEntity.getId()));
                        extSaveEntity.addLog( "add", "添加数据！");
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
                            extSaveEntity.addLog("add", "添加成功！");
                            continue;
                        }
                        saveResult.add(new FastHandler().setCode(0).setError("更新成功！").put("dataId", saveEntity.getId()));
                        extSaveEntity.addLog("update", "更新成功！");
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
    @AFastToken
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
            for (FastExtEntity<?> fastEntity : entity) {
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
                }else{
                    fastEntity.clearLog();
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
    @AFastToken
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
        for (FastExtEntity<?> fastEntity : entity) {
            if (FastStringUtils.isEmpty(menu)) {
                menu = fastEntity.getTableDetails();
            }
            setRequestAttr("menu", menu);
            fastEntity.put("fromWeb", true);
            int modifiedSize = fastEntity.getModified().size();
            if (!fastEntity.update()) {
                if (modifiedSize > 0) {
                    responseJson(-1, fastEntity.getError());
                }
            }else{
                fastEntity.addLog( "update",getParam("logContent", FastStringUtils.defaultValue(fastEntity.getError(), "修改数据！")), fastEntity.toJson());
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
    @AFastToken
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
        if (!primaries.isEmpty()) {
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
    @AFastToken
    public void copy() {
        String entityCode = getParam("entityCode", true);
        String menu = getParam("menu");
        setRequestAttr("menu", menu);
        Class<? extends FastExtEntity<?>> extEntityClass = FastExtConfig.getInstance().getExtEntities().getExtEntity(entityCode);
        if (extEntityClass == null) {
            responseJson(-1, "EntityCode不存在！" + entityCode);
            return;
        }
        ExtManagerEntity managerEntity = ExtManagerEntity.getSession(this);


        List<? extends FastExtEntity<?>> entity = getParamToEntityList("data", extEntityClass);
        for (FastExtEntity<?> fastEntity : entity) {
            if (FastStringUtils.isEmpty(menu)) {
                menu = fastEntity.getTableDetails();
            }
            setRequestAttr("menu", menu);
            fastEntity.put("fromWeb", true);
            FastEntity<?> copySave = fastEntity.copySave();
            if (copySave == null) {
                responseJson(-1, "复制失败！" + fastEntity.getError());
            }else{
                fastEntity.addLog("copy", "复制了一条数据！");
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
    @AFastToken
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

        if (entity.getPrimaries().isEmpty()) {
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
    @AFastToken
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

        if (entity.getPrimaries().isEmpty()) {
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
        String sqlStr = "select {{selectItem}} " + listSql.substring(fromIndex);
        if (type == 1) {
            selectItem = "max(" + keyName + ")";
            sqlStr = "select {{selectItem}}  " + listSql.substring(fromIndex);
        }

        String field = getParam("field", true);
        field = FastSqlTool.formatAlias(field, "t");


        Object[] params = fastSqlInfo.toParams();

        List<Object> paramsList = new ArrayList<>(Arrays.asList(params));
        if (paramsList.isEmpty()) {
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
    @AFastToken
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
        String sqlStr = "select " + type + "(" + field + ") as result " + listSql.substring(fromIndex);

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
    @AFastToken
    public void export() throws Exception {

        String title = getParam("title", true);
        String entityCode = getParam("entityCode", true);
        List<Map<String, Object>> columns = getParamToMapList("column");
        Map<String, Object> where = getParamToMap("where");
        Map<String, Object> colWhere = getParamToMap("colWhere");
        Map<String, Object> indexSort = getParamToMap("indexSort");
        String sort = getParam("sort");
        boolean exportIndex = getParamToBoolean("exportIndex", false);

        FastExtDataHelper dataHelper = new FastExtDataHelper();

        FastExtDataHelper.ExportDataParam dataParam = new FastExtDataHelper.ExportDataParam();
        dataParam.setTitle(title);
        dataParam.setEntityCode(entityCode);
        dataParam.getWhere().putAll(where);
        dataParam.getWhere().putAll(colWhere);
        dataParam.setSession(ExtManagerEntity.getSession(this));
        dataParam.setIndex(indexSort);
        dataParam.setSort(sort);
        dataParam.setColumns(columns);
        dataParam.setExportIndex(exportIndex);

        FastHandler handler = dataHelper.exportData(dataParam);

        responseJson(handler.getCode(), handler.getError(), handler.getString("url"));
    }


    /**
     * 生成实体excel导入数据的模板
     * 参数：
     * entityCode 实体编号 {String}
     * menu 操作的菜单名称，用作记录日志 {String}
     * column 列集合 json数组
     */
    @AFastLog(value = "生成【${entityDetails}】Excel模板！", type = "Excel模板")
    @AFastToken
    public void module() throws Exception {
        String entityCode = getParam("entityCode", true);
        String title = getParam("title", true);
        List<Map<String, Object>> columns = getParamToMapList("column");
        if (columns.isEmpty()) {
            responseJson(-1, "下载失败！列信息错误！");
        }

        FastExtDataHelper dataHelper = FastChar.getOverrides().newInstance(FastExtDataHelper.class);
        FastHandler handler = dataHelper.buildModule(title, entityCode, columns);
        setRequestAttr("entityDetails", handler.getString("entityDetails"));
        responseJson(handler.getCode(), handler.getError(), handler.getString("url"));
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
        //公共属性值
        Map<String, Object> values = getParamToMap("value");
        if (values == null) {
            values = new HashMap<>();
        }

        FastFile<?> paramFile = getParamFile();

        FastExtDataHelper dataHelper = FastChar.getOverrides().newInstance(FastExtDataHelper.class);
        FastExtDataHelper.ImportDataParam importDataParam = new FastExtDataHelper.ImportDataParam();
        importDataParam.setEntityCode(entityCode);
        importDataParam.setEntityMoreAttrValues(values);
        importDataParam.setSessionEntityLayerValue(ExtManagerEntity.getSession(this).getLayerValue());
        importDataParam.setExcelFile(paramFile.getFile());

        FastHandler handler = dataHelper.importData(importDataParam);

        setRequestAttr("entityDetails", handler.getString("entityDetails"));

        paramFile.delete();
        //上传文件强制使用text/html格式返回，避免浏览器弹出json下载，ie
        if (!isParamExists(PARAM_ACCPET) && getParam("__browser", "none").equalsIgnoreCase("ie")) {
            addParam(PARAM_ACCPET, "text/html");
        }
        responseJson(handler.getCode(), handler.getError());

    }


    /**
     * 下载实体数据
     */
    @AFastToken
    public void downData() throws Exception {
        String entityCode = getParam("entityCode", true);
        Map<String, Object> where = getParamToMap("where");
        Map<String, Object> colWhere = getParamToMap("colWhere");
        boolean fromTree = getParamToBoolean("fromTree");
        String treeParentIdName = getParam("treeParentIdName");

        FastExtDataHelper dataHelper = FastChar.getOverrides().newInstance(FastExtDataHelper.class);
        FastExtDataHelper.DownDataParam param = new FastExtDataHelper.DownDataParam();
        param.setEntityCode(entityCode);
        param.getWhere().putAll(where);
        param.getWhere().putAll(colWhere);
        param.setSession(ExtManagerEntity.getSession(this));
        param.setFromTree(fromTree);
        param.setTreeParentIdName(treeParentIdName);

        FastHandler handler = dataHelper.downDataJSON(param);
        responseJson(handler.getCode(), handler.getError(), handler.getString("url"));
    }


    /**
     * 上传数据
     */
    @AFastToken
    public void loadData() throws Exception {
        //上传文件强制使用text/html格式返回，避免浏览器弹出json下载，ie
        if (!isParamExists(PARAM_ACCPET) && getParam("__browser", "none").equalsIgnoreCase("ie")) {
            addParam(PARAM_ACCPET, "text/html");
        }
        String entityCode = getParam("entityCode", true);
        FastFile<?> paramFile = getParamFile();
        boolean strict = getParamToBoolean("strict");
        FastExtDataHelper dataHelper = FastChar.getOverrides().newInstance(FastExtDataHelper.class);

        FastHandler handler = dataHelper.loadDataJSON(entityCode, paramFile.getFile(), strict);

        paramFile.delete();
        responseJson(handler.getCode(), handler.getError());
    }


    /**
     * 更新权限编号
     */
    @AFastToken
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
    @AFastToken
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
    @AFastToken
    public void echarts() {
        ExtManagerEntity session = ExtManagerEntity.getSession(this);

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

        seriesColumns.add(dateSelect);

        String storeId = getParam("storeId", entityCode);
        String sqlStr = "";
        FastSqlInfo fastSqlInfo = new FastSqlInfo();
        if (storeId.equalsIgnoreCase("ExtSystemDataEntity")) {
            sqlStr = "select " + FastStringUtils.join(seriesColumns, ",") + " from ext_system_data as t where t.managerId = ? and t.dataType = ? ";
            fastSqlInfo.setParams(session.getId(), getParam("dataType"));
        } else {
            if (!LIST_SQL_MAP.containsKey(storeId)) {
                responseJson(-1, "统计失败！数据安全异常！");
            }
            fastSqlInfo = LIST_SQL_MAP.get(storeId);
            String listSql = FastSqlTool.removeOrderBy(fastSqlInfo.getSql());

            int fromIndex = listSql.indexOf("from");
            sqlStr = "select " + FastStringUtils.join(seriesColumns, ",") + listSql.substring(fromIndex);
        }


        if (sqlStr.lastIndexOf("where") < 0) {
            sqlStr += " where 1=1 ";
        }

        sqlStr += " and " + columnDate + " >= '" + beginDate + "' " +
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
            throw new RuntimeException(e);
        }

    }


    /**
     * 替换指定的字符
     */
    @AFastToken
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
        if (!primaries.isEmpty()) {
            FastColumnInfo<?> fastColumnInfo = primaries.iterator().next();
            String inSqlStr = " select " + fastColumnInfo.getName() + " " + listSql.substring(fromIndex);

            String sqlStr = " update " + entity.getTableName() + "  set " + field + " = replace(" + field + ",'" + replace + "','" + toValue + "') " +
                    " where " + fastColumnInfo.getName() + " in ( select * from ( " + inSqlStr + " ) as temp ) ";

            int updateCount = FastChar.getDB().update(sqlStr, fastSqlInfo.toParams());
            responseJson(0, "替换成功！共替换" + updateCount + "条数据！");
        }


        responseJson(-1, "替换失败！无效列表数据！");

    }


}
