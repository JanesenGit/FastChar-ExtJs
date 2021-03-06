package com.fastchar.extjs.interceptor;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastDispatcher;
import com.fastchar.interfaces.IFastRootInterceptor;
import com.fastchar.utils.FastBooleanUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;

public class FastExtRootAttachInterceptor implements IFastRootInterceptor {
    @Override
    public void onInterceptor(HttpServletRequest request, HttpServletResponse response, FastDispatcher dispatcher) throws Exception {
        String contentUrl = dispatcher.getContentUrl();
        if (contentUrl.startsWith("/attach/")) {//统一拦截附件目录
            String[] split = contentUrl.split("attach/");
            String child = split[1];
            File file = new File(FastChar.getConstant().getAttachDirectory(), child);
            String path = file.getAbsolutePath();
            if (child.startsWith("http://") || child.startsWith("https://")) {
                path = child;
            }
            boolean disposition = FastBooleanUtils.formatToBoolean(request.getParameter("disposition"), false);
            dispatcher.setContentUrl("/attach?disposition=" + disposition + "&path=" + path);
        }
        dispatcher.invoke();
    }
}
