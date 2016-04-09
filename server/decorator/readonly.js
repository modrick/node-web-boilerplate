/*
 * 限制属性为function类型
 *
 * @param {} 
 * @return {}
 */
module.exports = function(target, key, descriptor) {
	descriptor.writable = false;
	return descriptor;
}