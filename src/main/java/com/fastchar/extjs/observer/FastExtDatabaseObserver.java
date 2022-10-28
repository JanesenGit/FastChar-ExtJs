package com.fastchar.extjs.observer;

import com.fastchar.core.FastChar;
import com.fastchar.database.info.FastDatabaseInfo;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.FastExtLayerHelper;

import java.util.ArrayList;
import java.util.List;

public class FastExtDatabaseObserver {

    public void onDatabaseFinish() {
        List<FastExtLayerHelper.LayerMap> layerMaps = new ArrayList<>();
        for (FastDatabaseInfo databaseInfo : FastChar.getDatabases().getAll()) {
            if (!databaseInfo.isFetchDatabaseInfo()) {
                continue;
            }
            layerMaps.addAll(FastExtLayerHelper.buildLayerMap(databaseInfo));
        }
        FastExtConfig.getInstance().setLayerMaps(layerMaps);
    }
}
