/**
 * Created by Hades on 14/10/10.
 */

var logger = require('../log/logFactory').getLogger();
var config = require('../../config');
var redisDao = require('../storage/redisDao');
var Q = require('q');

var utils = {

    

    //JS中继承的实现--start
    _isObject: function(o) {
        return Object.prototype.toString.call(o) === '[object Object]';
    },

    _extend: function(destination, source) {
        var property;
        for (property in destination) {
            if (destination.hasOwnProperty(property)) {
                // 若destination[property]和sourc[property]都是对象，则递归
                if (this._isObject(destination[property]) && this._isObject(source[property])) {
                    self(destination[property], source[property]);
                }
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
    extend: function() {
            var arr = arguments,
                result = {},
                i;
            if (!arr.length) return {};
            for (i = arr.length - 1; i >= 0; i--) {
                if (this._isObject(arr[i])) {
                    this._extend(arr[i], result);
                };
            }
            arr[0] = result;
            return result;
        }
        //JS中继承的实现--end

}

module.exports = utils;