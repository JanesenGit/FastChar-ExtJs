package com.fastchar.extjs.databoard;

public abstract class FastDataboardDataInfo<T> {


    private double value;//记录的数据

    public double getValue() {
        return value;
    }

    public T setValue(double value) {
        this.value = value;
        return (T) this;
    }
}
