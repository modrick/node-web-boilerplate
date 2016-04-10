/**
 * decorator的测试
 *
 */
'use strict'
require("babel-register");
let chai = require('chai')
let expect = chai.expect
let user = require('./user.js')

describe('#########－定义的Decorator测试－#########', function() {
	describe('创建User对象，开始测试', function() {
		try {
			user.name = 123
		} catch (e) {
			console.info(e)
		}
		try {
			user.age = '21'
		} catch (e) {
			console.info(e)
		}
		expect(user.sex).to.equal('男')
	});
});