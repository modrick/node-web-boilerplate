/*
 * 限制属性为只读类型,该类型的属性，其不会被添加进attrsName中
 * 因为该字段是只读的，所以在service中无需从request中取值进行赋值
 *
 * @param {} 
 * @return {}
 */
 'use strict'
module.exports = function(target, key, descriptor) {
	descriptor.writable = false;
	return descriptor;
}