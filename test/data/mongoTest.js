/**
 * Created by tangnian on 15/11/10.
 */
var request = require('request');
var assert = require('assert');
var colors = require('colors');
var config = require('../../config');

module.exports = {
	save: function(dao) {
		describe('保存数据'.green, function() {
			it('保存:'.yellow, function(done) {
				return dao.save("TestData",{
					userId: 'admin',
					type: 2,
					password : "admin123",
					name : "admin",
					phone : "15021788460",
					role : "管理员",
					age : 26
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal('admin', data.userId );
					assert.ok(true);
					done();
				})
			});

			it('保存:'.yellow, function(done) {
				return dao.save("TestData",{
					userId: 'admin2',
					type: 2,
					password : "admin123",
					name : "admin",
					phone : "15021788460",
					role : "管理员",
					age : 27
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal('admin2', data.userId );
					assert.ok(true);
					done();
				})
			});

			it('保存:'.yellow, function(done) {
				return dao.save("TestData",{
					userId: 'officer',
					type: 1,
					password : "123456",
					name : "off",
					phone : "15021788460",
					role : "工作人员",
					age : 28
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal('officer', data.userId );
					assert.ok(true);
					done();
				})
			});

		});

	},
	query: function(dao) {
		describe('查询数据'.green, function() {
			it('查询:'.yellow, function(done) {
				return dao.query("TestData",{
					type: 2
				}, {
					userId: 1
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(2, data.length);
					assert.equal('admin', data[0].userId );
					assert.ok(true);
					done();
				})
			});
		});
	},
	queryAdv: function(dao) {
		describe('查询数据'.green, function() {
			it('查询:'.yellow, function(done) {
				return dao.queryAdv("TestData",{
					type: 2
				}, {
					userId: 1
				}, {
					userId: 1
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(2, data.length);
					assert.equal('admin', data[0].userId );
					assert.ok(true);
					done();
				})
			});
		});
	},
	findOne: function(dao) {
		describe('查询一条数据'.green, function() {
			it('查询:'.yellow, function(done) {
				return dao.findOne("TestData",{
					type: 1
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal('officer', data.userId );
					assert.ok(true);
					done();
				})
			});
		});
	},
	findBySort: function(dao) {
		describe('查询数据按字段排序'.green, function() {
			it('查询:'.yellow, function(done) {
				return dao.findBySort("TestData",{
					type: 2
				}, {
					userId: 1
				}, 2).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(2, data.length);
					assert.equal('admin', data[0].userId );
					assert.ok(true);
					done();
				})
			});
		});
	},
	pagingQuery: function(dao) {
		describe('查询数据分页查询'.green, function() {
			it('查询:'.yellow, function(done) {
				return dao.pagingQuery("TestData",{
				}, {
					userId: 1
				}, 0, 2).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(2, data.length);
					assert.equal('admin', data[0].userId );
					assert.ok(true);
					done();
				})
			});
		});
	},
	findPagingData: function(dao) {
		describe('查询数据分页查询2'.green, function() {
			it('查询:'.yellow, function(done) {
				return dao.findPagingData("TestData",{
				}, {
					start: 0,
					limit: 2,
					sort: {userId: 1}
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(2, data.total);
					assert.equal('admin', data.records[0].userId );
					assert.ok(true);
					done();
				})
			});
		});
	},
	getCount: function(dao) {
		describe('查询数据获取数量'.green, function() {
			it('查询:'.yellow, function(done) {
				return dao.getCount("TestData",{
					type: 2
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(2, data);
					assert.ok(true);
					done();
				})
			});
		});
	},
	update: function(dao) {
		describe('更新数据'.green, function() {
			it('更新:'.yellow, function(done) {
				return dao.update("TestData",{
					userId: 'admin'
				}, {
					password : "123456",
					name : "admin",
					phone : "15021788460",
					role : "管理员"
				}).then(function(data) {
					assert.equal(1, data.result.ok);
					assert.equal(1, data.result.nModified);
					assert.ok(true);
					return dao.findOne("TestData", {
						userId: 'admin'
					});
				}).then(function(data) {
					assert.equal("123456", data.password);
					assert.ok(true);
					done();
				})
			});
		});
	},
	updateAdv: function(dao) {
		describe('更新数据2'.green, function() {
			it('更新:'.yellow, function(done) {
				return dao.updateAdv("TestData",{
					userId: 'admin'
				}, {
					password : "123456",
					name : "admin",
					phone : "15021788460",
					role : "管理员"
				}).then(function(data) {
					assert.equal(1, data.result.ok);
					assert.equal(1, data.result.nModified);
					assert.ok(true);
					return dao.findOne("TestData", {
						userId: 'admin'
					});
				}).then(function(data) {
					assert.equal("123456", data.password);
					assert.ok(true);
					done();
				})
			});
		});
	},
	updateBatch: function(dao) {
		describe('更新一组数据'.green, function() {
			it('更新:'.yellow, function(done) {
				return dao.updateBatch("TestData",{
					type: 2
				}, {
					password : "123456",
					name : "admin"
				}).then(function(data) {
					assert.equal(1, data.result.ok);
					assert.equal(2, data.result.nModified);
					assert.ok(true);
					return dao.query("TestData", {
						type: 2
					});
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(2, data.length);
					assert.ok(true);
					done();
				})
			});
		});
	},
	findAndModify: function(dao) {
		describe('查找同时更新'.green, function() {
			it('查找:'.yellow, function(done) {
				return dao.findAndModify("TestData",{
					type: 1
				}, {
					type: 1,
					password : "123456",
					name : "abc"
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(1, data.ok);
					assert.ok(true);
					return dao.findOne("TestData", {
						type: 1
					});
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal("abc", data.name);
					assert.ok(true);
					done();
				})
			});
		});
	},
	findAndRemove: function(dao) {
		describe('查找同时删除'.green, function() {
			it('查找:'.yellow, function(done) {
				return dao.findAndRemove("TestData",{
					type: 1
				},{
					userId: 1
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(1, data.ok);
					assert.ok(true);
					return dao.getCount("TestData", {
						type: 1
					});
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(0, data);
					assert.ok(true);
					done();
				})
			});
		});
	},
	remove: function(dao) {
		describe('删除数据'.green, function() {
			it('更新:'.yellow, function(done) {
				return dao.remove("TestData",{
					type: 2
				}).then(function(data) {
					assert.equal(1, data.result.ok);
					assert.ok(true);
					return dao.getCount("TestData", {
					});
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(0, data);
					assert.ok(true);
					done();
				})
			});
		});
	},
	distinct: function(dao) {
		describe('分组查询distinct'.green, function() {
			it('查询:'.yellow, function(done) {
				return dao.distinct("TestData","type").then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(2, data.length);
					assert.ok(true);
					done();
				})
			});
		});
	},
	group: function(dao) {
		describe('分组统计'.green, function() {
			it('统计:'.yellow, function(done) {
				return dao.group("TestData",{
					type:true
				},{

				}, {
					num:0
				},function(doc,prev){
					prev.num++
				}).then(function(data) {
					console.info(JSON.stringify(data).grey);
					assert.equal(2, data.length);
					assert.ok(true);
					done();
				})
			});
		});
	}

}
