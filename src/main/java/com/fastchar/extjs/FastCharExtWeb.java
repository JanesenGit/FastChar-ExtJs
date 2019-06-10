package com.fastchar.extjs;


import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastEngine;
import com.fastchar.extjs.accepter.FastExtEntityAccepter;
import com.fastchar.extjs.accepter.FastExtEnumAccepter;
import com.fastchar.extjs.accepter.FastExtAppJsAccepter;
import com.fastchar.extjs.interceptor.FastExtAfterInterceptor;
import com.fastchar.extjs.interceptor.FastExtGlobalInterceptor;
import com.fastchar.extjs.interceptor.FastExtFileInterceptor;
import com.fastchar.extjs.interceptor.FastExtRootAttachInterceptor;
import com.fastchar.extjs.local.FastExtLocal_CN;
import com.fastchar.extjs.observer.FastHeadXmlObserver;
import com.fastchar.extjs.observer.FastMenuXmlObserver;
import com.fastchar.extjs.provider.FastExtEnum;
import com.fastchar.extjs.provider.FastExtFile;
import com.fastchar.interfaces.IFastWeb;
import com.fastchar.out.FastOutJson;
import com.fastchar.utils.FastStringUtils;

public final class FastCharExtWeb implements IFastWeb {

    @Override
    public void onInit(FastEngine engine) throws Exception {

        engine.getActions()
                .setDefaultOut(FastOutJson.class);

        engine.getScanner()
                .addAccepter(new FastExtAppJsAccepter())
                .addAccepter(new FastExtEntityAccepter())
                .addAccepter(new FastExtEnumAccepter());

        engine.getObservable()
                .addObserver(new FastMenuXmlObserver())
                .addObserver(new FastHeadXmlObserver());

        engine.getOverrides()
                .add(FastExtFile.class)
                .add(FastExtLocal_CN.class)
                .add(FastExtEnum.class);

        engine.getConstant()
                .setAttachNameSuffix(false)
                .setAttachNameMD5(true);

        engine.getInterceptors()
                .addRoot(FastExtRootAttachInterceptor.class, "/attach/*")
                .addAfter(FastExtAfterInterceptor.class, AFastPriority.P_HIGH, "/*")
                .addBefore(FastExtGlobalInterceptor.class, AFastPriority.P_HIGH, "/*")
                .addBefore(FastExtFileInterceptor.class, "/upload");

    }

    @Override
    public void onDestroy(FastEngine engine) throws Exception {

    }

    public static void main(String[] args) {
        System.out.println(FastStringUtils.matches("*@t_user@*", "@t_user@"));

    }


}
