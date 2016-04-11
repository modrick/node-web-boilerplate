/**
 * decorator的测试
 *
 */
 'use strict'
let func = require('./../../server/decorator/func')
let number = require('./../../server/decorator/number')
let readonly = require('./../../server/decorator/readonly')
let router = require('./../../server/decorator/router')
let service = require('./../../server/decorator/service')
let string = require('./../../server/decorator/string')
var dao = require('./../../server/storage/mongodbDao')

@service(dao)
class TestData {

    @string
	name

    @readonly
	sex='男'

    @number
	age

    @string
	address

    @string
	work

    @number
	weight

    @number
	height

}

module.exports = TestData
