/**
 * Created by Hades on 14/10/10.
 */

var logger = require('../log/logFactory').getLogger();
var config = require('../../config');
var redisDao = require('../storage/redisDao');

var utils = {

    /**
     * Generator function type check.
     *
     * @param {*} function
     * @return {Boolean}
     */
    isGenerator: function(func) {
        return typeof func === 'function' && 'GeneratorFunction' === func.constructor.name
    },

    /**
     * Array type check.
     *
     * @param {*} obj
     * @return {Boolean}
     */
    isArray: function(obj) {
        return Array.isArray(obj)
    },

    /**
     * Object type check. Only returns true
     * for plain JavaScript objects.
     *
     * @param {*} obj
     * @return {Boolean}
     */
    isObject: function(o) {
        return Object.prototype.toString.call(o) === '[object Object]';
    }


}

module.exports = utils;