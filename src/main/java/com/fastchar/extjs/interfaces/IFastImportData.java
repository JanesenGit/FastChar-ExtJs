package com.fastchar.extjs.interfaces;

import com.fastchar.core.FastEntity;
import com.fastchar.core.FastHandler;

import java.util.List;

public interface IFastImportData {

    void onImportData(List<? extends FastEntity> dataList, FastHandler handler) throws Exception;

}
