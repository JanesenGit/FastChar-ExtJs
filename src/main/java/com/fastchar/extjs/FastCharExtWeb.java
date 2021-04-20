package com.fastchar.extjs;


import com.fastchar.annotation.AFastPriority;
import com.fastchar.core.FastEngine;
import com.fastchar.extjs.accepter.FastExtEntityAccepter;
import com.fastchar.extjs.accepter.FastExtEnumAccepter;
import com.fastchar.extjs.accepter.FastExtAppJsAccepter;
import com.fastchar.extjs.compress.YuiCompress;
import com.fastchar.extjs.interceptor.FastExtAfterInterceptor;
import com.fastchar.extjs.interceptor.FastExtGlobalInterceptor;
import com.fastchar.extjs.interceptor.FastExtFileInterceptor;
import com.fastchar.extjs.interceptor.FastExtRootAttachInterceptor;
import com.fastchar.extjs.local.FastExtLocal_CN;
import com.fastchar.extjs.observer.FastHeadHtmlObserver;
import com.fastchar.extjs.observer.FastMenuXmlObserver;
import com.fastchar.extjs.out.FastExtParamError;
import com.fastchar.extjs.provider.FastExtEnum;
import com.fastchar.extjs.validators.FastEnumValidator;
import com.fastchar.interfaces.IFastWebRun;
import com.fastchar.out.FastOutJson;

@AFastPriority(-1)
public final class FastCharExtWeb implements IFastWebRun {

    @SuppressWarnings("ResultOfMethodCallIgnored")
    @Override
    public void onInit(FastEngine engine) throws Exception {

        if (!engine.isMain()) {
            engine.getFindClass()
                    .find("com.google.gson.Gson", "https://mvnrepository.com/artifact/com.google.code.gson/gson")
                    .find("org.jsoup.Jsoup", "https://mvnrepository.com/artifact/org.jsoup/jsoup")
                    .find("org.apache.poi.POIDocument", "https://mvnrepository.com/artifact/org.apache.poi/poi-ooxml",false)
                    .find("org.apache.xmlbeans.XmlBeans", "https://mvnrepository.com/artifact/org.apache.xmlbeans/xmlbeans",false)
                    .find("net.coobird.thumbnailator.Thumbnails", "https://mvnrepository.com/artifact/net.coobird/thumbnailator",false)
                    .find("com.yahoo.platform.yui.compressor.YUICompressor", "https://mvnrepository.com/artifact/com.yahoo.platform.yui/yuicompressor")
                    .find("org.apache.velocity.VelocityContext", "https://mvnrepository.com/artifact/org.apache.velocity/velocity-engine-core",false);

        }
        engine.getActions()
                .setDefaultOut(FastOutJson.class);

        engine.getConfig(FastExtConfig.class)
                .getMergeJs()
                .delete();

        engine.getObservable()
                .addObserver(new FastMenuXmlObserver())
                .addObserver(new FastHeadHtmlObserver());

        engine.getOverrides()
                .add(FastEnumValidator.class)
                .add(FastExtAppJsAccepter.class)
                .add(FastExtEntityAccepter.class)
                .add(FastExtEnumAccepter.class)
                .add(FastExtParamError.class)
                .add(FastExtLocal_CN.class)
                .add(FastExtEnum.class);

        engine.getConstant()
                .setSessionMaxInterval(24 * 60 * 60)
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

    @Override
    public void onRun(FastEngine engine) throws Exception {
    }
}
