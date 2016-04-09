/**
 * decorator的测试
 *
 */
let func = require('./../../decorator/func')
let number = require('./../../decorator/number')
let readonly = require('./../../decorator/readonly')
let router = require('./../../decorator/router')
let service = require('./../../decorator/service')
let string = require('./../../decorator/string')

class User {

    @readonly
    @string
	name;

    @readonly
    @string
	sex;

    @number
	age;

    @string
	address;

    @string
	work;

    @number
	weight;

    @number
	height;

}