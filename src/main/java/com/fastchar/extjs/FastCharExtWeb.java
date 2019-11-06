package com.fastchar.extjs;


import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastChar;
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
import com.fastchar.extjs.out.FastExtParamError;
import com.fastchar.extjs.provider.FastExtEnum;
import com.fastchar.extjs.validators.FastEnumValidator;
import com.fastchar.interfaces.IFastWeb;
import com.fastchar.out.FastOutJson;
import com.fastchar.utils.FastStringUtils;

import java.io.File;

@AFastPriority(-1)
public final class FastCharExtWeb implements IFastWeb {

    @Override
    public void onInit(FastEngine engine) throws Exception {
        engine.getFindClass()
                .find("com.google.gson.Gson", "https://mvnrepository.com/artifact/com.google.code.gson/gson")
                .find("org.jsoup.Jsoup", "https://mvnrepository.com/artifact/org.jsoup/jsoup")
                .find("org.apache.poi.POIDocument", "https://mvnrepository.com/artifact/org.apache.poi/poi-ooxml")
                .find("org.apache.xmlbeans.XmlBeans", "https://mvnrepository.com/artifact/org.apache.xmlbeans/xmlbeans")
                .find("net.coobird.thumbnailator.Thumbnails", "https://mvnrepository.com/artifact/net.coobird/thumbnailator")
                .find("com.yahoo.platform.yui.compressor.YUICompressor", "https://mvnrepository.com/artifact/com.yahoo.platform.yui/yuicompressor")
                .find("org.apache.velocity.VelocityContext", "https://mvnrepository.com/artifact/org.apache.velocity/velocity-engine-core");

        engine.getActions()
                .setDefaultOut(FastOutJson.class);

        engine.getConfig(FastExtConfig.class)
                .getMergeJs().delete();

        engine.getScanner()
                .addAccepter(new FastExtAppJsAccepter())
                .addAccepter(new FastExtEntityAccepter())
                .addAccepter(new FastExtEnumAccepter());

        engine.getObservable()
                .addObserver(new FastMenuXmlObserver())
                .addObserver(new FastHeadXmlObserver());

        engine.getOverrides()
                .add(FastExtParamError.class)
                .add(FastExtLocal_CN.class)
                .add(FastExtEnum.class);

        engine.getConstant()
                .setSessionMaxInterval(24 * 60 * 60)
                .setAttachNameMD5(true);


        engine.getValidators()
                .add(FastEnumValidator.class);


        engine.getInterceptors()
                .addRoot(FastExtRootAttachInterceptor.class, "/attach/*")
                .addAfter(FastExtAfterInterceptor.class, AFastPriority.P_HIGH, "/*")
                .addBefore(FastExtGlobalInterceptor.class, AFastPriority.P_HIGH, "/*")
                .addBefore(FastExtFileInterceptor.class, "/upload");

    }

    @Override
    public void onDestroy(FastEngine engine) throws Exception {

    }

}
