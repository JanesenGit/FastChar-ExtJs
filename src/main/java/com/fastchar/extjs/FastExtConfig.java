package com.fastchar.extjs;

import com.fastchar.core.FastChar;
import com.fastchar.extjs.core.FastExtEntities;
import com.fastchar.extjs.core.FastExtLayerHelper;
import com.fastchar.extjs.core.FastExtLayerType;
import com.fastchar.extjs.exception.FastExtConfigException;
import com.fastchar.interfaces.IFastConfig;
import com.fastchar.utils.FastFileUtils;
import com.fastchar.utils.FastStringUtils;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * FastChar-ExtJs配置
 */
public final class FastExtConfig implements IFastConfig {

    public static FastExtConfig getInstance() {
        return FastChar.getOverrides().singleInstance(FastExtConfig.class);
    }


    private boolean attachLog;
    private FastExtEntities extEntities = new FastExtEntities();
    private FastExtLayerType layerType = FastExtLayerType.None;//权限级别，默认以当前管理角色为最高级别
    private String basePrefix = "fastchar-extjs";

    private boolean noticeListener;//是否开启后台通知监听
    private List<FastExtLayerHelper.LayerMap> layerMaps;//表格的层级拓扑图
    private final Map<String, Set<String>> passLoginRemoteIp = new HashMap<>();//跳过登录的浏览器主机地址

    private boolean strictBindLayer = false;//检测到未绑定layer上级字段的列，将严格的抛出异常
    private boolean managerLoginErrorLimit = true;//登录密码是否错误限次
    private boolean managerPasswordEncrypt = true;//登录密码是否加密

    private boolean securityResponse = true;//是否开启响应内容加密

    private int exportPageSize = 10000;//导出数据，每页轮询的页面大小
    private int importPageSize = 10000;//导入数据，每页轮询的页面大小


    private final Map<String, Object> injectConfigJson = new LinkedHashMap<>();//在.config.json中注入其他参数



    /**
     * 设置FastExtEntity实体集合
     *
     * @param extEntities 实体集合
     * @return 当前对象
     */
    public FastExtConfig setExtEntities(FastExtEntities extEntities) {
        this.extEntities = extEntities;
        return this;
    }

    /**
     * 是否打印附件日志
     *
     * @return 布尔值
     */
    public boolean isAttachLog() {
        return attachLog;
    }

    /**
     * 设置是否打印附件日志
     *
     * @param attachLog 布尔值
     * @return 当前对象
     */
    public FastExtConfig setAttachLog(boolean attachLog) {
        this.attachLog = attachLog;
        return this;
    }


    /**
     * 获取系统权限类型
     *
     * @return 权限类型@FastLayerType
     */
    public FastExtLayerType getLayerType() {
        return layerType;
    }

    /**
     * 设置系统的权限的类型
     *
     * @param layerType 权限类型
     * @return 当前对象
     */
    public FastExtConfig setLayerType(FastExtLayerType layerType) {
        this.layerType = layerType;
        return this;
    }

    /**
     * 添加后台免登录的客户端ip地址
     *
     * @param managerId 管理员ID
     * @param remoteIp  ip地址，支持通配符 *
     * @return 当前对象
     */
    public FastExtConfig addPassLoginRemoteIp(int managerId, String... remoteIp) {
        for (String ip : remoteIp) {
            String passLoginManger = getPassLoginManger(ip);
            if (FastStringUtils.isNotEmpty(passLoginManger)) {
                String errorInfo = FastChar.getLocal().getInfo("ExtConfig_Error1", ip, passLoginManger);
                throw new FastExtConfigException(errorInfo);
            }
        }
        String key = "ID:" + managerId;
        if (!passLoginRemoteIp.containsKey(key)) {
            passLoginRemoteIp.put(key, new HashSet<>());
        }
        passLoginRemoteIp.get(key).addAll(Arrays.asList(remoteIp));
        return this;
    }

    /**
     * 添加后台免登录的客户端ip地址
     *
     * @param managerLoginName 管理员登录名
     * @param managerLoginPwd  管理员登录的明文密码
     * @param remoteIp         ip地址，支持通配符 *
     * @return 当前对象
     */
    public FastExtConfig addPassLoginRemoteIp(String managerLoginName, String managerLoginPwd, String... remoteIp) {
        for (String ip : remoteIp) {
            String passLoginMangerId = getPassLoginManger(ip);
            if (FastStringUtils.isNotEmpty(passLoginMangerId)) {
                String errorInfo = FastChar.getLocal().getInfo("ExtConfig_Error1", ip, passLoginMangerId);
                throw new FastExtConfigException(errorInfo);
            }
        }
        String key = "ACCOUNT:" + managerLoginName + "/" + managerLoginPwd;
        if (!passLoginRemoteIp.containsKey(key)) {
            passLoginRemoteIp.put(key, new HashSet<>());
        }
        passLoginRemoteIp.get(key).addAll(Arrays.asList(remoteIp));
        return this;
    }


    /**
     * 根据客户端IP获取免登录的管理ID
     *
     * @param remoteIp 客户端IP
     * @return 管理员ID
     */
    public String getPassLoginManger(String remoteIp) {
        if (FastStringUtils.isEmpty(remoteIp)) {
            return null;
        }
        for (Map.Entry<String, Set<String>> stringSetEntry : passLoginRemoteIp.entrySet()) {
            Set<String> ipSet = stringSetEntry.getValue();
            for (String ipPattern : ipSet) {
                if (FastStringUtils.matches(ipPattern, remoteIp)) {
                    return stringSetEntry.getKey();
                }
            }
        }
        return null;
    }


    /**
     * 获取所有FastExtEntity对象集合
     *
     * @return FastExtEntities
     */
    public FastExtEntities getExtEntities() {
        return extEntities;
    }



    /**
     * 获取表格权限层级的拓扑图
     */
    public List<FastExtLayerHelper.LayerMap> getLayerMaps() {
        return layerMaps;
    }

    /**
     * 设置表格权限层级的拓扑图
     */
    public FastExtConfig setLayerMaps(List<FastExtLayerHelper.LayerMap> layerMaps) {
        this.layerMaps = layerMaps;
        return this;
    }


    public boolean isNoticeListener() {
        return noticeListener;
    }

    public FastExtConfig setNoticeListener(boolean noticeListener) {
        this.noticeListener = noticeListener;
        return this;
    }


    public boolean isStrictBindLayer() {
        return strictBindLayer;
    }

    public FastExtConfig setStrictBindLayer(boolean strictBindLayer) {
        this.strictBindLayer = strictBindLayer;
        return this;
    }



    /**
     * 是否开启管理员登录密码错误的限次
     *
     * @return 布尔值
     */
    public boolean isManagerLoginErrorLimit() {
        return managerLoginErrorLimit;
    }

    /**
     * 设置管理员登录密码错误的限次
     *
     * @param managerLoginErrorLimit 布尔值
     * @return 当前对象
     */
    public FastExtConfig setManagerLoginErrorLimit(boolean managerLoginErrorLimit) {
        this.managerLoginErrorLimit = managerLoginErrorLimit;
        return this;
    }


    /**
     * 在 fastchar-extjs.config.json 中注入其他参数
     * @param key 注入的key
     * @param value 注入的值
     * @return 当前对象
     */
    public FastExtConfig addInjectConfigJson(String key, Object value) {
        this.injectConfigJson.put(key, value);
        return this;
    }

    /**
     * 在 fastchar-extjs.config.json 中注入其他参数
     * @param objectMap 注入的key-value
     * @return 当前对象
     */
    public FastExtConfig addInjectConfigJson(Map<String, Object> objectMap) {
        this.injectConfigJson.putAll(objectMap);
        return this;
    }


    public Map<String, Object> getInjectConfigJson() {
        return injectConfigJson;
    }

    public boolean isManagerPasswordEncrypt() {
        return managerPasswordEncrypt;
    }

    public FastExtConfig setManagerPasswordEncrypt(boolean managerPasswordEncrypt) {
        this.managerPasswordEncrypt = managerPasswordEncrypt;
        return this;
    }

    public int getExportPageSize() {
        return exportPageSize;
    }

    public FastExtConfig setExportPageSize(int exportPageSize) {
        this.exportPageSize = exportPageSize;
        return this;
    }

    public int getImportPageSize() {
        return importPageSize;
    }

    public FastExtConfig setImportPageSize(int importPageSize) {
        this.importPageSize = importPageSize;
        return this;
    }

    public String getBasePrefix() {
        return basePrefix;
    }

    public FastExtConfig setBasePrefix(String basePrefix) {
        this.basePrefix = basePrefix;
        return this;
    }

    public boolean isSecurityResponse() {
        return securityResponse;
    }

    public FastExtConfig setSecurityResponse(boolean securityResponse) {
        this.securityResponse = securityResponse;
        return this;
    }
}
