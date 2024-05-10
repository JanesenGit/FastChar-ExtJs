namespace FastExt {

    /**
     * MonacoEditor 操作类 https://microsoft.github.io/monaco-editor/
     */
    export class MonacoEditor {

        /**
         * 显示编辑器
         * @param obj
         * @param content 编辑内容
         * @param language 内容的开发语言
         */
        static showEditor(obj: any, content: string, language: MonacoEditorLanguage) {
            return new Ext.Promise(function (resolve, reject) {
                let editorPanel = Ext.create('Ext.container.Container', {
                    layout: 'border',
                    region: 'center',
                    iframePanel: true,
                    border: 0,
                    iframeName: "MonacoEditorFrame" + new Date().getTime(),
                    loadEditor: function () {
                        let me = this;
                        me.setLoading("加载编辑器中，请稍后……");
                        window[this.iframeName + "LoadDone"] = function () {
                            me.loadExtLib();
                            me.setValue(content, language);
                            me.setLoading(false);
                        };
                        let url = FastExt.Base.formatUrlVersion('base/monaco-editor/index.html',
                            {});
                        this.update("<iframe name='" + this.iframeName + "'  src='" + url + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                    },
                    setValue: function (content: string, language: MonacoEditorLanguage) {
                        window[this.iframeName].window["createEditor"]({
                            value: content,
                            language: language,
                            automaticLayout: true,
                            accessibilitySupport: 'on', // 辅助功能支持 控制编辑器是否应在为屏幕阅读器优化的模式下运行。
                            autoClosingBrackets: 'always', // 是否自动添加结束括号(包括中括号) "always" | "languageDefined" | "beforeWhitespace" | "never"
                            autoClosingDelete: 'always', // 是否自动删除结束括号(包括中括号) "always" | "never" | "auto"
                            autoClosingOvertype: 'always', // 是否关闭改写 即使用insert模式时是覆盖后面的文字还是不覆盖后面的文字 "always" | "never" | "auto"
                            autoClosingQuotes: 'always',
                            renderLineHighlight: 'gutter', // 当前行突出显示方式
                            scrollBeyondLastLine: false,
                        });
                    },
                    getValue: function () {
                        return window[this.iframeName].window["getValue"]();
                    },
                    loadExtLib: function () {
                        // let me = this;
                        // $.get("base/monaco-editor/fast-ext-utils.txt", function (result) {
                        //     window[me.iframeName].window["addExtraLib"](result);
                        // });
                    },
                });

                let winWidth = parseInt((document.body.clientWidth * 0.7).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.9).toFixed(0));
                let win = Ext.create('Ext.window.Window', {
                    title: '编辑内容',
                    height: winHeight,
                    width: winWidth,
                    minHeight: 500,
                    minWidth: 600,
                    iconCls: 'extIcon extConvertCode',
                    layout: 'fit',
                    resizable: true,
                    maximizable: true,
                    animateTarget: obj,
                    constrain: true,
                    items: [editorPanel],
                    modal: true,
                    unpin: true,
                    listeners: {
                        show: function () {
                            editorPanel.loadEditor();
                        },
                        close: function (val) {
                            FastExt.Base.runCallBack(resolve);
                            window[editorPanel.iframeName]= null;
                            window[editorPanel.iframeName + "LoadDone"]= null;
                        }
                    },
                    buttons: [
                        {
                            text: '取消',
                            iconCls: 'extIcon extClose',
                            handler: function () {
                                win.close();
                            }
                        },
                        {
                            text: '保存',
                            iconCls: 'extIcon extSave whiteColor',
                            handler: function () {
                                FastExt.Base.runCallBack(resolve, editorPanel.getValue());
                                win.close();
                            }
                        }
                    ]
                });
                win.show();
            });
        }


        /**
         * 显示内容对比编辑器
         * @param obj
         * @param content1 编辑的内容1
         * @param content2 编辑的内容2
         * @param language 内容的开发语言
         * @param subtitle 窗口的子标题
         */
        static showDiffEditor(obj: any, content1: string, content2: string, language: MonacoEditorLanguage, subtitle?: string) {
            if (Ext.isEmpty(subtitle)) {
                subtitle = "";
            }
            return new Ext.Promise(function (resolve, reject) {
                let editorPanel = Ext.create('Ext.container.Container', {
                    layout: 'border',
                    region: 'center',
                    iframePanel: true,
                    border: 0,
                    iframeName: "MonacoEditorFrame" + new Date().getTime(),
                    loadEditor: function () {
                        let me = this;
                        me.setLoading("加载编辑器中，请稍后……");
                        window[this.iframeName + "LoadDone"] = function () {
                            me.loadExtLib();
                            me.setValue(content1, content2, language);
                            me.setLoading(false);
                        };
                        let url = FastExt.Base.formatUrlVersion('base/monaco-editor/index.html',
                            {});
                        this.update("<iframe name='" + this.iframeName + "'  src='" + url + "' width='100%' height='100%' frameborder='0' scrolling='no' />");
                    },
                    setValue: function (content1: string, content2: string, language: MonacoEditorLanguage) {
                        window[this.iframeName].window["createDiffEditor"](content1, content2, language);
                    },
                    getValue: function () {
                        return window[this.iframeName].window["getValue"]();
                    },
                    loadExtLib: function () {
                        // let me = this;
                        // $.get("base/monaco-editor/fast-ext-utils.txt", function (result) {
                        //     window[me.iframeName].window["addExtraLib"](result);
                        // });
                    },
                });

                let winWidth = parseInt((document.body.clientWidth * 0.7).toFixed(0));
                let winHeight = parseInt((document.body.clientHeight * 0.9).toFixed(0));
                let win = Ext.create('Ext.window.Window', {
                    title: '编辑内容' + subtitle,
                    height: winHeight,
                    width: winWidth,
                    minHeight: 500,
                    minWidth: 600,
                    iconCls: 'extIcon extConvertCode',
                    layout: 'fit',
                    resizable: true,
                    maximizable: true,
                    animateTarget: obj,
                    constrain: true,
                    items: [editorPanel],
                    modal: true,
                    unpin: true,
                    listeners: {
                        show: function () {
                            editorPanel.loadEditor();
                        },
                        close: function (val) {
                            FastExt.Base.runCallBack(resolve);
                            window[editorPanel.iframeName]= null;
                            window[editorPanel.iframeName + "LoadDone"]= null;
                        }
                    },
                    buttons: [
                        {
                            text: '取消',
                            iconCls: 'extIcon extClose',
                            handler: function () {
                                win.close();
                            }
                        },
                        {
                            text: '保存',
                            iconCls: 'extIcon extSave whiteColor',
                            handler: function () {
                                FastExt.Base.runCallBack(resolve, editorPanel.getValue());
                                win.close();
                            }
                        }
                    ]
                });
                win.show();

            });
        }
    }


    /**
     * entity.js源码编辑方法
     */
    export class MonacoEditorEntity{

        /**
         * 打开entity源码编辑器
         * @param obj
         * @param entityCode
         */
        static showEditor(obj: any, entityCode: string) {
            FastExt.Dialog.showWait("获取源码中，请稍后……");
            FastExt.Server.loadSource(entityCode, function (success, message, data) {
                FastExt.Dialog.hideWait();
                if (success) {
                    FastExt.MonacoEditor.showEditor(obj, data, MonacoEditorLanguage.JavaScript).then(function (result) {
                        FastExt.Dialog.showWait("保存源码中，请稍后……");
                        FastExt.Server.saveSource(entityCode, result, function (suc,msg) {
                            FastExt.Dialog.hideWait();
                            if (suc) {
                                FastExt.Dialog.toast(msg);
                            }else{
                                FastExt.Dialog.showAlert("系统提醒", msg);
                            }
                        });
                    });
                }else{
                    FastExt.Dialog.showAlert("系统提醒", message);
                }
            });
        }

    }

    /**
     * 编辑器支持的语言
     */
    export enum MonacoEditorLanguage {
        TypeScript = "typescript",
        JavaScript = "javascript",
        CSS = "css",
        LESS = "less",
        SCSS = "scss",
        JSON = "json",
        HTML = "html",
        JAVA = "java",
        SQL = "sql",
        MySql = "mysql",
        XML = "xml",
        INI = "ini",
        Text = "plaintext",
        MarkDown = "markdown",
    }
}