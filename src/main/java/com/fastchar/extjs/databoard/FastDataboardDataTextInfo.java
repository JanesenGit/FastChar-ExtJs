package com.fastchar.extjs.databoard;

public class FastDataboardDataTextInfo extends FastDataboardDataInfo<FastDataboardDataTextInfo>{


    private String id;//记录的数据类型
    private int trend = -1;

    public String getId() {
        return id;
    }

    public FastDataboardDataTextInfo setId(String id) {
        this.id = id;
        return this;
    }

    public int getTrend() {
        return trend;
    }

    public FastDataboardDataTextInfo setTrend(FastDataboardDataTrend trend) {
        this.trend = trend.ordinal();
        return this;
    }
}
