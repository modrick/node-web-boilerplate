/*
 * 限制属性为function类型，其不会被添加进attrsName中
 * 因为该字段是函数，所以在service中无需从request中取值进行赋值
 *
 * @param {} 
 * @return {}
 */
'use strict'

function func(target, key, descriptor) {
	const initializer = descriptor.initializer
	if (initializer) {
		checkFunc(initializer.call(this), key)
	}
	return {
		configurable: descriptor.configurable,
		enumerable: descriptor.enumerable,
		get() {
			let value
				// class创建的时候属性的初始化赋值， 及在没有set值之前, 其属性取值由initializer获取，
				// 后面对属性调用过set后， 其取值从descriptor.value去获取
			if (initializer && !descriptor.value) {
				value = initializer.call(this)
			} else if (descriptor.value) {
				value = descriptor.value
			}
			return value
		},
		set(value) {
			checkFunc(value, key)
			descriptor.value = key
		}
	};
}

function checkFunc(value, key) {
	if (typeof(value) != 'function') {
		throw new SyntaxError('@function 属性 ' + key + ' 的值必须是函数类型。 ');
	}
}

module.exports = func