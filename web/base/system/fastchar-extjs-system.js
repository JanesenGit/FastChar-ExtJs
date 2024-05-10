$(() => {
    const SystemSecurityCode = $.md5(FastExt.Base.buildUUID12());
    FastExt.Lottie.loadJsonAnimByEl(document.getElementById("loading-center"), "base/lottie/index_loading.json", () => {
        $.post("showSysConfig", {"SecurityCode":SystemSecurityCode},function (result) {
            if (result.success) {
                FastExt.PluginLoader.loadFiles(result.data, (content) => {
                    let config = {};
                    for (let contentElement of content) {
                        config = FastExt.Json.deepMergeJson(config, contentElement);
                    }
                    window["SystemConfig"] = config;

                    FastExt.Initializer.load();
                    FastExt.System.SecurityHandler.setSecurityCode(SystemSecurityCode);

                    //必须先初始化样式
                    FastExt.System.InitHandler.initTheme(() => {
                        FastExt.Documents.addTitle(SystemConfig["title"], () => {
                            FastExt.Documents.addIcon({src: SystemConfig["icon"]}, () => {
                                FastExt.Documents.addStyles(SystemConfig["style"], () => {
                                    FastExt.Documents.addScripts(SystemConfig["script"], () => {
                                        FastExt.HttpListener.registerListener();
                                        if (SystemConfig["system-login"]) {
                                            FastExt.Documents.addScript({src: SystemConfig["index_js"]});
                                        } else {
                                            FastExt.Documents.addScript({src: SystemConfig["login_js"]});
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                alert(result.message);
            }
        });
    });
});


