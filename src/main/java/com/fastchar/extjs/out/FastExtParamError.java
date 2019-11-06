package com.fastchar.extjs.out;

import com.fastchar.annotation.AFastOverride;
import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastAction;
import com.fastchar.out.FastOutParamError;

@AFastPriority
public class FastExtParamError extends FastOutParamError {

    @Override
    public void response(FastAction action) throws Exception {
        action.responseJson(-9, getMessage());
    }
}


