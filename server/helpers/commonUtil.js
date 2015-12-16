/**
 * Created by Hades on 14/10/10.
 */

var logger = require('../log/logFactory').getLogger();
var config = require('../../config');
var redisDao = require('../storage/redisDao');
var Q = require('q');

var utils = {

    /** 转换金额 */
    getFormattedAmount: function (amount, currency) {
        if (isBlank(amount)) {
            return;
        }
        if (isBlank(currency)) currency = '';
        switch (currency) {
            case 'CNY':
                amount = formatAmount(amount, 2);
                amount = '人民币 ¥' + amount;
                break;
            case 'USD':
                amount = formatAmount(amount, 2);
                amount = 'USD $' + amount;
                break;
        }
        return amount;
    },

    getFormattedAmount2: function (amount, currency) {
        if (isBlank(amount)) {
            return;
        }
        if (isBlank(currency)) currency = '';
        switch (currency) {
            case 'CNY':
                amount = formatAmount(amount, 2);
                amount = '<span style="font-size: 8px">人民币</span> ¥' + amount;
                break;
            case 'USD':
                amount = formatAmount(amount, 2);
                amount = '<span style="font-size: 8px">USD</span> $' + amount;
                break;
        }
        return amount;
    },

    /** 格式化金额 */
    formatAmount: function (s, n) {
        n = n > 0 && n <= 20 ? n : 2;
        s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
        var l = s.split(".")[0].split("").reverse(), r = s.split(".")[1];
        t = "";
        for (i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
        }
        return t.split("").reverse().join("") + "." + r;
    },

    /** 还原金额的数字形式 */
    revertAmount: function (s) {
        return parseFloat(s.replace(/[^\d\.-]/g, ""));
    },

    getPastDay: function (createDate) {
        if (!createDate) {
            return "";
        }
        var s = createDate.getTime();
        var ns = new Date().getTime();
        var between = ns - s;
        if (between < 3600000) {
            var nowString = parseInt(between / (60 * 1000));
            if (nowString == 0) {
                return "现在";
            } else {
                return parseInt(between / (60 * 1000)) + "分钟以前";
            }
        } else if (3600000 <= between && between < 86400000) {
            // 1小时 ~ 24 小时
            return parseInt(between / 3600000) + "小时以前";
        } else if (86400000 <= between && between < 15811200000) {
            // 一天 ~ 183天(半年)
            return formatDate(createDate, "M-d h:m");
        } else {
            // 大于半年
            return formatDate(createDate, "yyyy-M-d");
        }
    },

    getFutureDay: function (end) {
        if (!end) {
            return "";
        }
        var today = new Date();
        var s = today.getTime();
        var ns = end.getTime();
        var between = ns - s;
        if (between < 3600000) {
            var nowString = parseInt(between / (60 * 1000));
            if (nowString <= 0) {
                return "已经结束";
            } else {
                return "还剩" + parseInt(between / (60 * 1000)) + "分钟";
            }
        } else if ((3600000 <= between) && (between < 86400000)) {
            return "还剩" + parseInt(between / 3600000) + "小时";
        } else {
            return "还剩" + parseInt(between / 86400000) + "天";
        }

    },
  
    /**
     * @param flag
     * if flag equals 'f', the text "已经结束" is returned
     */
    getFormattedDate: function (date, flag) {
        if (!date) {
            return '';
        } else if (date.constructor == String) {
            date = new Date(date);
        }
        var now = new Date();
        try {
            if (now.getTime() < date.getTime()) {
                return getFutureDay(date);
            } else if (!!flag && flag.toLowerCase() == 'f') {
                return '已经结束';
            } else {
                return getPastDay(date);
            }
        } catch (ex) {
            console.error(ex);
            return date;
        }
    },


    extractHtmlImg: function (str) {
        var rtn = [];
        if (str) {
            return rtn;
        }
        var regex = /<img[^<]+[(\/>)$]/g;
        var _imgArr = str.match(regex);
        if (!_imgArr || _imgArr.length < 1) {
            return rtn;
        }
        var _srcArr = [], i = 0, _len = _imgArr.length, _elem, _subArr, _src;
        var regex2 = /src="[^"]+"/i
        for (; i < _len; i++) {
            _elem = _imgArr[i];
            _subArr = _elem.match(regex2);
            if (!_subArr || _subArr.length < 1) {
                continue;
            }
            _src = _subArr[0].substring(5, _subArr[0].length - 1); // 'src="'.length == 5
            rtn.push({imgSrc: _src, imgAlt: ''});
        }
        return rtn;
    },

    convertContentType: function (suffix) {
        if (hdlUtil.trimStr(suffix) == '') {
            suffix = '';
        }
        suffix = suffix.toLowerCase();
        var contentType = '';
        switch (suffix) {
            case 'png':
                contentType = 'image/png';
                break;
            case 'bmp':
                contentType = 'image/bmp';
                break;
            case 'cod':
                contentType = 'image/cis-cod';
                break;
            case 'gif':
                contentType = 'image/gif';
                break;
            case 'ief':
                contentType = 'image/ief';
                break;
            case 'jpe':
                contentType = 'image/jpeg';
                break;
            case 'jpeg':
                contentType = 'image/jpeg';
                break;
            case 'jpg':
                contentType = 'image/jpeg';
                break;
            case 'jfif':
                contentType = 'image/pipeg';
                break;
            case 'svg':
                contentType = 'image/svg+xml';
                break;
            case 'tif':
                contentType = 'image/tiff';
                break;
            case 'tiff':
                contentType = 'image/tiff';
                break;
            case 'ras':
                contentType = 'image/x-cmu-raster';
                break;
            case 'cmx':
                contentType = 'image/x-cmx';
                break;
            case 'ico':
                contentType = 'image/x-icon';
                break;
            case 'pnm':
                contentType = 'image/x-portable-anymap';
                break;
            case 'pbm':
                contentType = 'image/x-portable-bitmap';
                break;
            case 'pgm':
                contentType = 'image/x-portable-graymap';
                break;
            case 'ppm':
                contentType = 'image/x-portable-pixmap';
                break;
            case 'rgb':
                contentType = 'image/x-rgb';
                break;
            case 'xbm':
                contentType = 'image/x-xbitmap';
                break;
            case 'xpm':
                contentType = 'image/x-xpixmap';
                break;
            case 'xwd':
                contentType = 'image/x-xwindowdump';
                break;
            default:
                contentType = 'text/plain';
        }
        return contentType;
    },

    //Hades: 跨域处理
    setResponse: function (res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader("Access-Control-Allow-Methods", "*");
        res.setHeader("X-Powered-By", "3.2.1");
        res.setHeader("Content-Type", "application/json;charset=utf-8");
    },

    //JS中继承的实现--start
    _isObject: function (o) {
        return Object.prototype.toString.call(o) === '[object Object]';
    },

    _extend: function (destination, source) {
        var property;
        for (property in destination) {
            if (destination.hasOwnProperty(property)) {
                // 若destination[property]和sourc[property]都是对象，则递归
                if (this._isObject(destination[property]) && this._isObject(source[property])) {
                    self(destination[property], source[property]);
                }
                ;
                // 若sourc[property]已存在，则跳过
                if (source.hasOwnProperty(property)) {
                    continue;
                } else {
                    source[property] = destination[property];
                }
            }
        }
    },

    //继承调用方法
    extend: function () {
        var arr = arguments,
            result = {},
            i;
        if (!arr.length) return {};
        for (i = arr.length - 1; i >= 0; i--) {
            if (this._isObject(arr[i])) {
                this._extend(arr[i], result);
            }
            ;
        }
        arr[0] = result;
        return result;
    }
    //JS中继承的实现--end

}

module.exports = utils;

