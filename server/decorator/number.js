/*
 * 限制属性为Number类型
 *
 * @param {} 
 * @return {}
 */

function number(target, key, descriptor) {
	const initializer = descriptor.initializer
	if (initializer) {
		checkNumber(initializer.call(this), key)
	}
	return {
		descriptor.configurable,
			descriptor.enumerable,
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
				checkNumber(value,key)
				descriptor.value = key
			}
	};
}

function checkNumber(value, key) {
	if (typeof(value) != 'number') {
		throw new SyntaxError('@number 属性 ' + key + ' 的值必须是字符串类型。 ');
	}
}


module.exports = number