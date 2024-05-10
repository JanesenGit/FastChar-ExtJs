package com.fastchar.extjs.echarts;

import com.fastchar.core.FastJsonWrap;
import com.fastchar.utils.FastClassUtils;
import com.fastchar.utils.FastNumberUtils;
import com.fastchar.utils.FastStringUtils;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * @author 沈建（Janesen）
 * @date 2021/8/31 17:40
 */
public class FastEChartsBean {

    private String title;
    private String name;
    private Object value;
    private String date;
    private String type = "line";
    private String stack;


    public String getTitle() {
        return title;
    }

    public FastEChartsBean setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getName() {
        return name;
    }

    public FastEChartsBean setName(String name) {
        this.name = name;
        return this;
    }

    public Object getValue() {
        return value;
    }

    public FastEChartsBean setValue(Object value) {
        this.value = value;
        return this;
    }

    public String getDate() {
        return date;
    }

    public FastEChartsBean setDate(String date) {
        this.date = date;
        return this;
    }

    public String getType() {
        return type;
    }

    public FastEChartsBean setType(String type) {
        this.type = type;
        return this;
    }

    public String getStack() {
        return stack;
    }

    public FastEChartsBean setStack(String stack) {
        this.stack = stack;
        return this;
    }

    public static Object toJsonData(String chartTitle, List<FastEChartsBean> beans) {

        String echartsJson = FastClassUtils.readClassResource(FastEChartsBean.class, "echart-json.json");
        if (FastStringUtils.isEmpty(echartsJson)) {
            return null;
        }
        String seriesJson = FastClassUtils.readClassResource(FastEChartsBean.class, "echart-series-item.json");
        if (FastStringUtils.isEmpty(seriesJson)) {
            return null;
        }

        FastJsonWrap echartsJsonMap = new FastJsonWrap(echartsJson);
        echartsJsonMap.getEditor("title.text").setValue(chartTitle);

        Set<String> legends = new LinkedHashSet<>();
        Set<String> xAxis = new LinkedHashSet<>();
        for (FastEChartsBean bean : beans) {
            xAxis.add(bean.getDate());
            legends.add(bean.getName());
        }

        List<Object> seriesList = new ArrayList<>();
        for (String legend : legends) {
            FastJsonWrap series = new FastJsonWrap(seriesJson);
            series.getEditor("name").setValue(legend);
            String seriesType = "line";
            String stack = null;
            List<Object> data = new ArrayList<>();
            for (String xAxi : xAxis) {
                double value = 0;
                for (FastEChartsBean bean : beans) {
                    if (bean.getName().equalsIgnoreCase(legend) && bean.getDate().equalsIgnoreCase(xAxi)) {
                        value += FastNumberUtils.formatToDouble(bean.getValue());
                        seriesType = bean.getType();
                        stack = bean.getStack();
                    }
                }
                data.add(value);
            }
            series.getEditor("data").setValue( data);
            series.getEditor("type").setValue(seriesType);
            if (FastStringUtils.isNotEmpty(stack)) {
                series.getEditor().addValue("stack", stack);
            }
            seriesList.add(series.getJsonObject());
        }
        echartsJsonMap.getEditor("legend.data").setValue( legends);
        echartsJsonMap.getEditor("xAxis[0].data").setValue(xAxis);
        echartsJsonMap.getEditor("series").setValue(seriesList);

        return echartsJsonMap.getJsonObject();
    }


}
