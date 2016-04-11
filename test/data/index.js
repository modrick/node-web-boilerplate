/**
 * mongodbDao层的测试
 *
 */
var mongoTest = require('./mongoTest');
var dao = require('./../../server/storage/mongodbDao');
var request = require('request');
var assert = require('assert');

describe('################################## －Mongodb访问层自动化测试－##################################', function() {

	before(function(done) {
		// console.info('    －－－－－－START TEST －－－－－－');
		//清空数据
		dao.init().then(function(dao) {
			var removes = [];
			removes.push(dao.remove('TestData', {}));
			return Promise.resolve(removes);
		}).then(function(data) {
			done();
		}).catch(function(err) {
			done(err);
		})
	});

	after(function() {
		 //console.info('    －－－－－－ END TEST －－－－－－');
	});

	beforeEach(function(done) {
		done();
	});

	afterEach(function(done) {
		done();
	});

	describe('测试mongoDao', function() {
		mongoTest.save(dao);
		mongoTest.query(dao);
		mongoTest.queryAdv(dao);
		mongoTest.findOne(dao);
		mongoTest.findBySort(dao);
		mongoTest.pagingQuery(dao);
		mongoTest.findPagingData(dao);
		mongoTest.getCount(dao);
		mongoTest.update(dao);
		mongoTest.updateBatch(dao);
		mongoTest.findAndModify(dao);
		mongoTest.findAndRemove(dao);
		mongoTest.remove(dao);

		mongoTest.save(dao);
		mongoTest.distinct(dao);
		mongoTest.group(dao);
	});



});