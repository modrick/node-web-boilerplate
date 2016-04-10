/**
 * 限制属性类型为字符串
 *
 * @param {} 
 * @return {}
 */
 'use strict'
function string(target, key, descriptor) {
	const initializer = descriptor.initializer
	if (initializer) {
		checkString(initializer.call(this), key)
	}
	return {
		configurable: descriptor.configurable,
		enumerable: descriptor.enumerable,
		get() {
			let value;
			//class创建的时候属性的初始化赋值，及在没有set值之前,其属性取值由initializer获取，
			//后面对属性调用过set后，其取值从descriptor.value去获取
			if (initializer && !descriptor.value) {
				value = initializer.call(this)
			} else if (descriptor.value) {
				value = descriptor.value
			}
			return value
		},
		set(value) {
			checkString(value, key)
			descriptor.value = key
		}
	};
}

function checkString(value, key) {
	if (typeof(value) != 'string') {
		throw new SyntaxError('@string 属性 ' + key + ' 的值必须是字符串类型。 ');
	}
}


module.exports = string