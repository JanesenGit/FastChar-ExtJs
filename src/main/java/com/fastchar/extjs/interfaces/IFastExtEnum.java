package com.fastchar.extjs.interfaces;

import com.fastchar.extjs.core.enums.FastEnumInfo;

import java.util.List;

public interface IFastExtEnum {

    List<FastEnumInfo> getEnums() throws Exception;

    FastEnumInfo getEnum(int id) throws Exception;

}
