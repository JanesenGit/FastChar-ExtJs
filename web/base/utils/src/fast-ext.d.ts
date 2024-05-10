declare var Ext: any;

/**
 * 系统全局配置信息
 */
declare var SystemConfig: any;

declare var $: any;
declare var jquery: any;
declare var ProgressBar: any;
declare var Cookies: any;
declare var systemErrorMessage: any;

declare var PR: any;

declare var sqlFormatter: any;


declare var Promise: any;

/**
 * 高德地图相关 https://lbs.amap.com/api/javascript-api-v2/documentation
 */
declare var AMap: any;


/**
 * lottie.js动画json处理库 https://airbnb.io/lottie/#/web?id=html-player-installation
 */
declare var lottie: any;

/**
 * echarts使用 https://echarts.apache.org/zh/index.html
 */
declare var echarts: any;

/**
 * viewer.min.js使用 https://fengyuanchen.github.io/viewer/
 */
declare var Viewer: any;

/**
 * 微软牛逼编辑器 monaco-editor  https://microsoft.github.io/monaco-editor/
 */
declare var monaco: any;

/**
 * 颜色选择器 https://github.com/Simonwep/pickr
 */
declare var Pickr: any;

/**
 * Tinymce操作类 https://www.tiny.cloud/docs/tinymce/6/
 */
declare var tinymce: any;

/**
 * Muuri操作类 https://muuri.dev/
 */
declare var Muuri: any;

/**
 * anime操作类 https://animejs.com/documentation
 */
declare var anime: any;

/**
 * RSA加密操作类 https://www.npmjs.com/package/jsencrypt
 */
declare var JSEncrypt: any;

/**
 * 代码高亮 Highlight.js https://highlightjs.org/download
 */
declare var hljs: any;

/**
 * markdown 转换工具类 https://markdown-it.github.io/markdown-it/
 */
declare var markdownit: any;

/**
 * markdown插件 https://www.npmjs.com/package/markdown-it-container
 */
declare var markdownitContainer: any;

/**
 * markdown插件 https://www.npmjs.com/package/markdown-it-mark
 */
declare var markdownitMark: any;

/**
 * markdown插件 https://www.npmjs.com/package/markdown-it-emoji
 */
declare var markdownitEmoji: any;

/**
 * Tinycolor2插件 https://www.npmjs.com/package/tinycolor2
 */
declare var tinycolor: any;

/**
 * crypto-js插件 https://www.npmjs.com/package/crypto-js 浏览器可用的下载地址：https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js
 */
declare var CryptoJS: any;

/**
 * Ext.Promise 对象
 */
declare abstract class ExtPromise {
    abstract then(result);

    abstract throw(exception);
}

/**
 * json字符串格式化
 */
declare class JSONFormat {
    constructor(content, indent)
}