/**
 * decorator的测试
 *
 */
'use strict'
require("babel-register")
let chai = require('chai')
let expect = chai.expect
let TestData = require('./TestData.js')
let testData = new TestData()
var dao = require('./../../server/storage/mongodbDao');

describe('#########－定义的Decorator测试－#########', function() {

	before(function(done) {
		testData.dbInit().then(function(data) {
			return testData.remove({})
		}).then(function(data) {
			console.info('remove all')
			done()
		}).catch(function(err) {
			done(err)
		})
	})

	describe('创建User对象，开始测试', function() {
		//属性操作
		try {
			testData.name = 123
		} catch (e) {
			console.info(e)
		}
		try {
			testData.age = '21'
		} catch (e) {
			console.info(e)
		}
		expect(testData.sex).to.equal('男')
			//数据库操作的
		describe('保存数据'.green, function() {
			it('保存:'.yellow, function(done) {
				return testData.save({
					userId: 'admin2',
					type: 2,
					password: "admin123",
					name: "admin",
					phone: "15021788460",
					role: "管理员",
					age: 27
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					expect(data.userId).to.equal('admin2')
					done();
				}).catch(function(err) {
					console.info(err)
				})
			});
		});

	})
})