package com.fastchar.extjs.local;

import com.fastchar.annotation.AFastOverride;
import com.fastchar.annotation.AFastPriority;
import com.fastchar.local.FastCharLocal_CN;


@AFastOverride
@AFastPriority
public final class FastExtLocal_CN extends FastCharLocal_CN {

    private final String Db_Table_Error2 = "表格的层级字段数量不可超过一个！[{0}]";
    private final String Db_Table_Error3 = "表格绑定的上级层级字段数量不可超过一个！[{0}]";
    private final String Db_Table_Error4 = "表格{0}未配置绑定上级层级字段的列！[bind=layer]";

    private final String Db_Column_Error3 = "标识{0}的关联属性[link]不可为空！";
    private final String Db_Column_Error4 = "关联表格{0}不存在数据库中！";
    private final String Db_Column_Error5 = "关联表格{0}主键字段{1}不存在！";
    private final String Db_Column_Error6 = "关联表格{0}主键字段{1}并非该表格的主键！";
    private final String Db_Column_Error7 = "关联表格{0}描述字段{1}不存在！";
    private final String Db_Column_Error8 = "属性[bind]值{0}不存在！必须为：{1} ！";
    private final String Db_Column_Error9 = "关联表格{0}描述字段不可为空！";

    private final String ExtEntity_Error1 = "绑定失败！类{0}必须继承FastExtEntity类";
    private final String ExtEntity_Error2 = "绑定失败！类{0}无法进行实例化！";
    private final String ExtEntity_Error3 = "绑定失败！类{0}已被{1}重新定义！";
    private final String ExtEntity_Error4 = "绑定失败！类{0}已存在！";
    private final String ExtEntity_Error5 = "未检测到类{0}关联的表格信息！";

    private final String ExtEnum_Error1 = "枚举名称{0}已存在！";

    private final String ExtConfig_Error1 = "客户端IP [ {0} ] 已配置到管理员 [ {1} ] 的免登录下，不可重复配置！";

    private final String ExtManager_Error1 = "客户端IP [ {0} ] 已开启管理员 [ {1} ] 免登录配置！";


}
