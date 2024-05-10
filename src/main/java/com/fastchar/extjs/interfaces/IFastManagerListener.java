package com.fastchar.extjs.interfaces;

import com.fastchar.core.FastHandler;
import com.fastchar.extjs.entity.ExtManagerEntity;


public interface IFastManagerListener  {
    void onManagerLogin(ExtManagerEntity managerEntity, FastHandler handler);
}
