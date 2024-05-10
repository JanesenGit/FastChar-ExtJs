package com.fastchar.extjs.interceptor;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastDispatcher;
import com.fastchar.interfaces.IFastRootInterceptor;
import com.fastchar.servlet.http.FastHttpServletRequest;
import com.fastchar.servlet.http.FastHttpServletResponse;
import com.fastchar.utils.FastBooleanUtils;

import java.io.File;

public class FastExtRootAttachInterceptor implements IFastRootInterceptor {

    @Override
    public void onInterceptor(FastHttpServletRequest request, FastHttpServletResponse response, FastDispatcher dispatcher) throws Exception {
        try {
            String contentUrl = dispatcher.getContentUrl();
            if (contentUrl.startsWith("/attach/")) {//统一拦截附件目录
                String[] split = contentUrl.split("attach/");
                String child = split[1];
                String path = child;
                if (child.startsWith("http://") || child.startsWith("https://")) {
                    path = child;
                } else {
                    File file = new File(FastChar.getConstant().getAttachDirectory(), child);
                    if (file.exists()) {
                        path = file.getAbsolutePath();
                    } else {
                        file = new File(FastChar.getPath().getWebRootPath(), child);
                    }

                    if (file.exists()) {
                        path = file.getAbsolutePath();
                    }
                }
                boolean disposition = FastBooleanUtils.formatToBoolean(request.getParameter("disposition"), false);
                dispatcher.setContentUrl("/attach?disposition=" + disposition + "&path=" + path);
            }
        } catch (Exception e) {
            FastChar.getLogger().error(this.getClass(), e);
        }
        dispatcher.invoke();
    }
}
