package com.fastchar.extjs.interfaces;

import com.fastchar.core.FastHandler;
import com.fastchar.extjs.entity.ExtManagerEntity;

public interface IFastManager  {
    void onManagerLogin(ExtManagerEntity managerEntity, FastHandler handler);
}
