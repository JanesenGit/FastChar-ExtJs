/**
 * 系统内存缓存
 */
let MemoryCache = {}, progressLine;

/**
 * 判断字符串是否以某个字符结尾
 * @param suffix 后缀
 * @returns {boolean}
 * @example
 * 'user.js'.endWidth('.js');
 */
String.prototype.endWith = function (suffix) {
    if (suffix == null || suffix == "" || this.length == 0 || suffix.length > this.length) return false;
    return this.substring(this.length - suffix.length) == suffix;
};

/**
 * 判断字符串是否以某个字符开始
 * @param prefix 前缀
 * @returns {boolean}
 * @example
 * 'test.js'.startWith('test')
 */
String.prototype.startWith = function (prefix) {
    if (prefix == null || prefix == "" || this.length == 0 || prefix.length > this.length) return false;
    return this.substr(0, prefix.length) == prefix;
};

/**
 * 字符串处理，首字母大写
 */
String.prototype.firstUpperCase = function () {
    return this.replace(/^\S/,
        function (s) {
            return s.toUpperCase();
        });
};

/**
 * 判断是否存在于数组中
 * @param val
 * @returns {boolean}
 * @example
 * let userIds=[1,2,3,4];
 * userIds.exists(1);
 */
Array.prototype.exists = function (val) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] == val) {
            return true;
        }
    }
    return false;
};


/**
 * 转换bool值
 * @param obj 带转换的数据
 * @param defaultValue 默认值
 * @returns {boolean}
 * @example
 * toBool('0')
 */
function toBool(obj, defaultValue) {
    if (Ext.isEmpty(defaultValue)) {
        defaultValue = false;
    }
    if (Ext.isEmpty(obj)) {
        return defaultValue;
    }
    if (Ext.isString(obj)) {
        if (obj == "0") {
            return false;
        }
        if (obj == "1") {
            return true;
        }
    }
    if (Ext.isNumber(obj)) {
        if (obj == 0) {
            return false;
        }
        if (obj == 1) {
            return true;
        }
    }
    return Boolean(obj);
}

/**
 * 转换颜色格式值，符合：#ffffff 格式
 * @param obj 带转换的颜色
 * @param defaultValue 默认颜色
 * @returns {string}
 * @example
 * toColor('fefefe');
 */
function toColor(obj, defaultValue) {
    if (Ext.isEmpty(defaultValue)) {
        defaultValue = "#FFFFFF";
    }
    if (Ext.isEmpty(obj)) {
        return defaultValue;
    }
    if (obj.toString().startWith("#")) {
        return obj.toString();
    }
    return "#" + obj;
}


/**
 * 将json字符串转成对象
 * @param jsonStr json字符串
 * @returns {Object}
 * @example
 * jsonToObject('{id:1}')
 */
function jsonToObject(jsonStr) {
    try {
        return Ext.decode(jsonStr);
    } catch (e) {
    }
    return null;
}

/**
 * 将对象转成json字符串
 * @param obj 待转换的对象
 * @returns {Object}
 */
function objectToJson(obj) {
    try {
        return Ext.encode(obj);
    } catch (e) {}
    return null;
}


/**
 * 复制文本到剪贴板里
 * @param content 内容
 */
function copyToBoard(content) {
    let oInput = document.createElement('input');
    oInput.value = content;
    document.body.appendChild(oInput);
    oInput.select();
    document.execCommand("Copy");
    oInput.style.display = 'none';
    $(oInput).remove();
}


/**
 * 浅复制对象
 * @param obj 待复制的对象
 * @example
 * copy({'id':1})
 */
function copy(obj) {
    let newObj = {};
    if (obj instanceof Array) {
        newObj = obj.concat();
    } else if (obj instanceof Function) {
        newObj = obj;
    } else {
        for (let key in obj) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}

/**
 * 是否已初始化了system对象
 * @returns {boolean}
 */
function isSystem() {
    try {
        if (system && system.init) return true;
    } catch (e) {
    }
    return false;
}


/**
 * 检测IE浏览器版本，不符合允许条件的阻止使用
 */
function checkBrowserVersion() {
    if (Ext.isIE && Ext.ieVersion < 11) {
        let win = Ext.create('Ext.window.Window', {
            title: '系统提醒',
            width: 250,
            height: 100,
            layout: 'fit',
            icon: 'icons/icon_error.svg',
            resizable: false,
            closable: false,
            html: "<div style='background:#eeeeee; padding:10px;'>您当前的IE版本太低，至少在11.0以上的IE才能使用本系统！</div>",
            modal: true
        });
        win.show();
        return false;
    }
    return true;
}


/**
 * 获取整个系统框架容器
 * @returns {*}
 */
function getBodyContainer() {
    let container = Ext.getCmp("bodyContainer");
    if (container == null) {
        Ext.getDoc().on("contextmenu",
            function (e) {
                e.stopEvent(); //禁用右键菜单
            });
        Ext.tip.QuickTipManager.init();
        Ext.QuickTips.init();
        container = Ext.create('Ext.container.Viewport', {
            id: 'bodyContainer',
            layout: 'fit',
            border: 0,
            renderTo: Ext.getBody()
        });
    }
    return container;
}

/**
 * 设置缓存
 * @param key 缓存的key
 * @param data 缓存的数据
 */
let setCache = function (key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
    }
};

/**
 * 获取缓存
 * @param key 缓存的key
 */
let getCache = function (key) {
    try {
        return JSON.parse(localStorage.getItem(key))
    } catch (e) {
    }
    return null;
};


/**
 * 删除缓存
 * @param key 缓存的key
 */
let removeCache = function (key) {
    localStorage.removeItem(key);
};


/**
 * 获得首页头部线形状进度条
 * @param toColor
 * @returns {ProgressBar.Line}
 */
function getProgressLine(toColor) {
    if (Ext.isEmpty(toColor)) {
        toColor = "#f8c633";
    }
    if (progressLine == null) {
        progressLine = new ProgressBar.Line('#progress', {
            color: toColor,
            duration: 1000,
            easing: 'easeInOut',
            from: {
                color: '#9c58b6'
            },
            to: {
                color: toColor
            },
            step: function (state, line, attachment) {
                line.path.setAttribute('stroke', state.color);
            }
        });
    }
    return progressLine;
}


/**
 * 抖动控件
 * @param obj 待抖动的控件
 */
function shakeComment(obj) {
    try {
        let interval, t = 0, z = 3, del = function () {
            clearInterval(interval);
            obj.setX(currX);
            obj.setY(currY);
        };
        let currX = obj.getX();
        let currY = obj.getY();
        interval = setInterval(function () {
            try {
                let i = t / 180 * Math.PI, x = Math.sin(i) * z, y = Math.cos(i) * z;

                obj.setX(currX + x);
                obj.setY(currY + y);
                if ((t += 90) > 1080) del();
            } catch (e) {
                del();
            }
        }, 30);
    } catch (e) {
    }
}


/**
 * 合并两个json对象
 * @param jsonData1 json对象
 * @param jsonData2 json对象
 */
function mergeJson(jsonData1, jsonData2) {
    let newJsonData = {};
    if (!Ext.isEmpty(jsonData1)) {
        for (let property in jsonData1) {
            newJsonData[property] = jsonData1[property];
        }
    }
    if (!Ext.isEmpty(jsonData2)) {
        for (let property in jsonData2) {
            newJsonData[property] = jsonData2[property];
        }
    }
    return newJsonData;
}


/**
 * 构建表单
 * @param url 提交的路径
 * @param paramsJson 提交的参数
 */
function buildForm(url, paramsJson) {
    let form = $('<form></form>');
    form.attr('action', url);
    form.attr('method', 'post');

    for (let n in paramsJson) {
        let my_input = $("<input type='text' name='" + n + "' />");
        my_input.attr('value', paramsJson[n]);
        form.append(my_input);
    }
    $(document.body).append(form);
    return form;
}


/**
 * 动态加载字符串函数，字符串的函数必须为匿名
 * @param functionStr
 * @returns {null|any}
 * @example
 * loadFunction("function(val){return val+1;}");
 */
function loadFunction(functionStr) {
    if (functionStr.toString().trim().startsWith("function")) {
        let functionKey = "do" + $.md5(functionStr);
        if (Ext.isEmpty(MemoryCache[functionKey])) {
            let myScript = document.createElement("script");
            myScript.type = "text/javascript";
            let code = "let " + functionKey + "=" + functionStr;
            try {
                myScript.appendChild(document.createTextNode(code));
            } catch (ex) {
                myScript.text = code;
            }
            document.body.appendChild(myScript);
            MemoryCache[functionKey] = true;
        }
        return eval(functionKey);
    }
    return null;
}

/**
 * 触发浏览器下载文件
 * @param url 下载路径
 */
function download(url) {
    url = url.split("?")[0];
    let name = url.substring(url.lastIndexOf("/"));
    let a = document.createElement('a');
    let event = new MouseEvent('click');
    a.download = "file" + name;
    a.href = url;
    a.dispatchEvent(event)
}

/**
 * 执行回调，限制了重复执行
 * @param fun 函数对象
 * @param param 函数参数
 */
function runCallBack(fun, param) {
    if (!Ext.isFunction(fun)) {
        return;
    }
    if (fun.callBacked) {
        return;
    }
    let callBackParams = [];
    for (let i = 1; i < arguments.length; i++) {
        callBackParams[i - 1] = arguments[i];
    }
    fun.apply(this, callBackParams);
    fun.callBacked = true;
}

/**
 * 将field组件的值设置到record里
 * @param record record对象
 * @param dataIndex 属性值
 * @param field field对象
 */
function setRecordValue(record, dataIndex, field) {
    field.dataIndex = dataIndex;
    if (Ext.isFunction(field.setRecordValue)) {
        field.setRecordValue(record);
    } else {
        let value = field.getValue();
        if (Ext.isDate(field.getValue())) {
            record.set(dataIndex, Ext.Date.format(value, field.format));
        } else {
            record.set(dataIndex, value);
        }
    }
    if (toBool(field.autoUpdate, false)) {
        commitStoreUpdate(record.store);
    }
}

/**
 * 构建唯一标识符号
 * @param prefix
 * @returns {*}
 */
function buildOnlyCode(prefix) {
    let key = prefix + Ext.now();
    return $.md5(key);
}
