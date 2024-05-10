namespace FastExt {

    export class HttpListener {

        public static registerListener() {
            let oldXMLHttpRequest = window.XMLHttpRequest;

            function newXMLHttpRequest() {
                let realXHR = new oldXMLHttpRequest();

                let loadstart = function (e) {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    if (FastExt.System.InitHandler.isInit()) {
                        FastExt.ProgressBaseLineLayout.getProgressLine(FastExt.System.ConfigHandler.getFrontColor()).set(0);
                    }
                };

                let progress = function (e) {
                    if (e.lengthComputable) {
                        if (FastExt.Server.isSilenceRequest()) {
                            return;
                        }
                        if (FastExt.System.InitHandler.isInit()) {
                            let progress = e.loaded / e.total;
                            if (!Number.isFinite(progress)) {
                                progress = 1;
                            }
                            FastExt.ProgressBaseLineLayout.getProgressLine(FastExt.System.ConfigHandler.getFrontColor()).animate(progress);
                        }
                    }
                };

                let load = function (e) {
                    if (FastExt.Server.isSilenceRequest()) {
                        return;
                    }
                    if (FastExt.System.InitHandler.isInit()) {
                        FastExt.ProgressBaseLineLayout.getProgressLine(FastExt.System.ConfigHandler.getFrontColor()).animate(1);
                    }
                    FastExt.Server.checkResponse(this);
                    FastExt.Server.checkVersion(this);
                    FastExt.Server.checkManager(this);
                    FastExt.Server.checkRestart(this);

                };

                let abort = function (e) {
                };

                let readystatechange = function () {
                    if (this.readyState === 1) {
                        let timestamp = (new Date().getTime()).toString();
                        this.setRequestHeader("security-code", FastExt.System.SecurityHandler.getSecurityCode());
                        this.setRequestHeader("timestamp", timestamp);

                        let sessionId = FastExt.Server.getSessionId();
                        if (!Ext.isEmpty(sessionId)) {
                            this.setRequestHeader("SessionId", sessionId);
                        }
                        // @ts-ignore 在线混淆工具： https://www.obfuscator.io/
                        // @formatter:off
                        const _0x44dc0f=_0x7754;function _0x29de(){const _0x1745a8=['6464017ZoDKLg','33678UxitIQ','3196352tciKgj','tokenPublicKey','2925552xOrBQn','1442526bkiNcd','Base64','Documents','6430HudTiN','923149UlNeeB','System','headToken','token','SecurityHandler','util','174LAIBlJ','27572vdzmrX','5FRKAkY'];_0x29de=function(){return _0x1745a8;};return _0x29de();}(function(_0x26e687,_0x296499){const _0x55378a=_0x7754,_0x726fcf=_0x26e687();while(!![]){try{const _0x6e02a2=-parseInt(_0x55378a(0x8d))/0x1+parseInt(_0x55378a(0x82))/0x2*(parseInt(_0x55378a(0x81))/0x3)+-parseInt(_0x55378a(0x86))/0x4+parseInt(_0x55378a(0x83))/0x5*(-parseInt(_0x55378a(0x89))/0x6)+-parseInt(_0x55378a(0x84))/0x7+parseInt(_0x55378a(0x88))/0x8+parseInt(_0x55378a(0x85))/0x9*(parseInt(_0x55378a(0x8c))/0xa);if(_0x6e02a2===_0x296499)break;else _0x726fcf['push'](_0x726fcf['shift']());}catch(_0x4cdee8){_0x726fcf['push'](_0x726fcf['shift']());}}}(_0x29de,0xa74f3));let tokenPublicKeyFun=FastExt[_0x44dc0f(0x8b)]['loadFunction'](Ext[_0x44dc0f(0x80)][_0x44dc0f(0x8a)]['decode'](FastExt[_0x44dc0f(0x7c)][_0x44dc0f(0x7f)][_0x44dc0f(0x87)])),tokenFun=FastExt[_0x44dc0f(0x8b)]['loadFunction'](Ext[_0x44dc0f(0x80)][_0x44dc0f(0x8a)]['decode'](FastExt[_0x44dc0f(0x7c)]['SecurityHandler'][_0x44dc0f(0x7d)])),pkey=tokenPublicKeyFun();function _0x7754(_0x29d3bc,_0x111889){const _0x29de0a=_0x29de();return _0x7754=function(_0x77542,_0x2dfe86){_0x77542=_0x77542-0x7c;let _0x35fb0d=_0x29de0a[_0x77542];return _0x35fb0d;},_0x7754(_0x29d3bc,_0x111889);}this['setRequestHeader'](_0x44dc0f(0x7e),tokenFun(pkey,timestamp));
                        // @formatter:on
                    }
                };

                realXHR.addEventListener('loadstart', loadstart);
                realXHR.addEventListener('progress', progress);
                realXHR.addEventListener('load', load);
                realXHR.addEventListener('abort', abort);
                realXHR.addEventListener('error', abort);
                realXHR.addEventListener('readystatechange', readystatechange);

                realXHR.upload.addEventListener('progress', progress);


                let handle = <any>{
                    set: function (target: XMLHttpRequest, name: string | symbol, newValue: any, receiver: any) {
                        target[name] = newValue;
                        return true;
                    },
                    get: function (target: XMLHttpRequest, name: string | symbol, receiver: any) {
                        let value = target[name];
                        if (Ext.isFunction(value)) {
                            return function (...args: any[]) {
                                return value.apply(target, args);
                            };
                        }
                        if (FastExt.Server.isProjectRequest(target)) {
                            let securityResponse = target.getResponseHeader("Security-Response");
                            if (name === "response" || name === "responseText") {
                                if (securityResponse === "true") {
                                    if (name === "responseText" && Ext.isString(value)) {
                                        value = FastExt.Json.jsonToObject(value);
                                    }
                                    if (Ext.isArray(value)) {
                                        if (!target["responseDecrypted"]) {
                                            // @ts-ignore 在线混淆工具： https://www.obfuscator.io/
                                            // @formatter:off
                                            const _0x419569=_0x3805;function _0x2335(){const _0x2f7052=['responseDecrypted','parse','ECB','pad','6537930zBhzgs','2165272ehdiJT','316110AAeoYP','11gOZjEk','AES','304VtaYwx','jsonToObject','60263kcgtWn','5013366lDDzMa','__c1','System','SecurityHandler','getSecurityCode','decrypt','89703JcXdky','Pkcs7','enc','setPrivateKey','__c2','Utf8','243565awTcEw','mode','42iFHUAN','14bWqxZi','Base64','util'];_0x2335=function(){return _0x2f7052;};return _0x2335();}(function(_0x5b0a6d,_0x1eb400){const _0x50ecd4=_0x3805,_0x4445ae=_0x5b0a6d();while(!![]){try{const _0x4dea50=parseInt(_0x50ecd4(0x189))/0x1*(-parseInt(_0x50ecd4(0x17b))/0x2)+parseInt(_0x50ecd4(0x18a))/0x3+-parseInt(_0x50ecd4(0x183))/0x4+parseInt(_0x50ecd4(0x178))/0x5*(-parseInt(_0x50ecd4(0x17a))/0x6)+parseInt(_0x50ecd4(0x182))/0x7+-parseInt(_0x50ecd4(0x187))/0x8*(parseInt(_0x50ecd4(0x190))/0x9)+parseInt(_0x50ecd4(0x184))/0xa*(-parseInt(_0x50ecd4(0x185))/0xb);if(_0x4dea50===_0x1eb400)break;else _0x4445ae['push'](_0x4445ae['shift']());}catch(_0x147568){_0x4445ae['push'](_0x4445ae['shift']());}}}(_0x2335,0xd96ed));let decrypt=new JSEncrypt();decrypt[_0x419569(0x193)](window[_0x419569(0x194)+FastExt[_0x419569(0x18c)][_0x419569(0x18d)][_0x419569(0x18e)]()]());let privateKey=window[_0x419569(0x18b)+FastExt['System'][_0x419569(0x18d)][_0x419569(0x18e)]()]();privateKey=decrypt['decrypt'](privateKey);let key=CryptoJS[_0x419569(0x192)][_0x419569(0x177)][_0x419569(0x17f)](privateKey),contents=[];function _0x3805(_0x3187d9,_0x3f9896){const _0x2335b0=_0x2335();return _0x3805=function(_0x380538,_0x743f2d){_0x380538=_0x380538-0x177;let _0x3a16e5=_0x2335b0[_0x380538];return _0x3a16e5;},_0x3805(_0x3187d9,_0x3f9896);}for(let valueElement of value){let data=CryptoJS[_0x419569(0x186)][_0x419569(0x18f)](valueElement,key,{'mode':CryptoJS[_0x419569(0x179)][_0x419569(0x180)],'padding':CryptoJS[_0x419569(0x181)][_0x419569(0x191)]})['toString'](CryptoJS['enc'][_0x419569(0x177)]);contents['push'](Ext[_0x419569(0x17d)][_0x419569(0x17c)]['decode'](data));}target[_0x419569(0x17e)]=FastExt['Json'][_0x419569(0x188)](contents['join'](''));
                                            // @formatter:on
                                            console.log("解密响应的数据！");
                                        }
                                        if (name === "responseText") {
                                            return FastExt.Json.objectToJson(target["responseDecrypted"]);
                                        }
                                        return target["responseDecrypted"];
                                    }
                                }
                            }
                        }
                        return value;
                    },
                };

                return new Proxy<XMLHttpRequest>(realXHR, handle);
            }

            // @ts-ignore
            window.XMLHttpRequest = newXMLHttpRequest;
        }

    }

}