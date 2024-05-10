namespace FastExt {

    /**
     * markdown文件解析类
     */
    export class Markdown {
        /**
         * markdown-it.min.js文件的路径
         */
        static markdownJsPath: string = "base/markdown-it/markdown-it.min.js";

        /**
         * markdown-light.css文件的路径
         */
        static markdownStylePath: string = "base/markdown-it/markdown-style.css";

        /**
         * markdown-it.min.js文件的路径
         */
        static markdownPluginsPath: string[] = [
            "base/markdown-it/plugins/markdown-it-mark.min.js",
            "base/markdown-it/plugins/markdown-it-emoji.min.js",
            "base/markdown-it/plugins/markdown-it-container.min.js"
        ];

        /**
         * 加载Markdown组件
         * @param callBack 加载成后的回调
         */
        static loadMarkdown(callBack: any) {
            FastExt.PluginLoader.loadPlugins("Markdown",
                [FastExt.Markdown.markdownJsPath, FastExt.Markdown.markdownStylePath]
                    .concat(FastExt.Markdown.markdownPluginsPath), callBack);
        }


        /**
         * 转换markdown代码
         * @param content markdown代码
         * @param callback 回调函数function(htmlValue)
         */
        static parseMarkdown(content: string, callback: any) {
            FastExt.Markdown.loadMarkdown(() => {
                FastExt.Highlight.loadHighlight(() => {
                    const md = markdownit({
                        html: true,
                        xhtmlOut: false,
                        breaks: true,
                        langPrefix: 'language-',
                        linkify: true,
                        typographer: true,
                        quotes: '“”‘’',
                        highlight: function (str, lang) {
                            if (lang && hljs.getLanguage(lang)) {
                                try {
                                    return hljs.highlight(str, {language: lang}).value;
                                } catch (__) {
                                }
                            }
                            return '';
                        }
                    }).use(markdownitContainer, "tip")
                        .use(markdownitContainer, "warning")
                        .use(markdownitContainer, "danger")
                        .use(markdownitMark)
                        .use(markdownitEmoji);

                    let htmlContent = '<div style="padding: 20px;"><div class="markdown-body">' + md.render(content) + '</div></div>';
                    let jqueryObj = $(htmlContent);
                    jqueryObj.find("a").each(function () {
                        let aObj = $(this);
                        if (aObj.attr("href").indexOf("open_menu:") === 0) {
                            let hrefValue = aObj.attr("href");
                            let menuValue = hrefValue.split("open_menu:")[1];
                            let openMenuFunction = 'FastExt.SystemLayout.showByLevel("' + decodeURI(menuValue) + '")';
                            aObj.attr("href", 'javascript:void(0);');
                            aObj.attr("data-click-function", Ext.util.Base64.encode(openMenuFunction));
                            aObj.attr("onclick", 'FastExt.Renders.onClickFromDataClick(this)');
                        } else {
                            aObj.attr("target", "_blank");
                        }
                    });
                    callback(jqueryObj.prop('outerHTML'));
                });
            });
        }


        /**
         * 弹框显示markdown文件
         */
        static showMarkdownFile(obj: any, title: string, markdownFileUrl: string, windowConfig?: any) {
            if (!windowConfig) {
                windowConfig = {
                    height: parseInt((document.body.clientHeight * 0.7).toFixed(0)),
                    width: parseInt((document.body.clientWidth * 0.6).toFixed(0))
                };
            }
            let windowDefaultConfig = {
                title: title,
                iconCls: 'extIcon extSee',
                layout: "fit",
                animateTarget: obj,
                height: windowConfig.height,
                width: windowConfig.width,
                minHeight: 500,
                minWidth: 600,
                constrain: true,
                resizable: true,
                maximizable: true,
                scrollable: true,
                modal: true,
                bodyStyle:{
                    background: "#ffffff",
                },
                listeners: {
                    show: function () {
                        this.setLoading("加载数据中，请稍后……");
                        $.get(markdownFileUrl, result => {
                            FastExt.Markdown.parseMarkdown(result, htmlValue => {
                                this.setLoading(false);
                                this.update(htmlValue);
                            });
                        });
                    },
                }
            };
            let markdownWindow = Ext.create('Ext.window.Window', FastExt.Json.mergeJson(windowDefaultConfig, windowConfig));
            markdownWindow.show();
        }

        /**
         * 弹框显示系统更新日志的文件
         */
        static showChangelog(obj: any) {
            let systemChangelogWin = Ext.getCmp("SystemChangelogWindow");
            if (systemChangelogWin) {
                FastExt.Component.shakeComment(systemChangelogWin);
                return;
            }

            let windowConfig = {
                height: parseInt((document.body.clientHeight * 0.7).toFixed(0)),
                width: parseInt((document.body.clientWidth * 0.4).toFixed(0))
            };
            let markdownWindow = Ext.create('Ext.window.Window', {
                title: "系统更新日志",
                iconCls: 'extIcon extFlag',
                layout: "fit",
                animateTarget: obj,
                id: "SystemChangelogWindow",
                height: windowConfig.height,
                width: windowConfig.width,
                minHeight: 500,
                minWidth: 600,
                constrain: true,
                resizable: true,
                maximizable: true,
                scrollable: true,
                modal: false,
                bodyStyle:{
                    background: "#ffffff",
                },
                listeners: {
                    show: function () {
                        this.setLoading("加载数据中，请稍后……");
                        $.get(FastExt.System.ChangelogHandler.getUrl(), result => {
                            FastExt.Markdown.parseMarkdown(result, htmlValue => {
                                this.setLoading(false);
                                this.update(htmlValue);
                            });
                        });
                    },
                }
            });
            markdownWindow.show();
        }

    }
}