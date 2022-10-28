package com.fastchar.extjs.core;

import java.util.HashMap;
import java.util.Map;

public class FastExtLayerCache {

    private final Map<String, String> cacheLayer = new HashMap<>();


    private String buildKey(Class<?> targetClass, Object keyValue) {
        return targetClass.getName() + "@" + keyValue;
    }

    public String getLayer(Class<?> targetClass, Object keyValue) {
        String buildKey = buildKey(targetClass, keyValue);
        return cacheLayer.get(buildKey);
    }


    public void putLayer(Class<?> targetClass, Object keyValue, String layerValue) {
        String buildKey = buildKey(targetClass, keyValue);
        cacheLayer.put(buildKey, layerValue);
    }


}
