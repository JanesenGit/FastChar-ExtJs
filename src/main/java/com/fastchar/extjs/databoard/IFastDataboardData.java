package com.fastchar.extjs.databoard;

import com.fastchar.extjs.entity.ExtManagerEntity;

import java.util.Date;
import java.util.List;

public interface IFastDataboardData {

    List<FastDataboardDataInfo<?>> getDataInfo(ExtManagerEntity manager, Date date);

}
