var logger = require('../log/logFactory').getLogger();
var mongodbDao = require('../storage/mongodbDao');
var commonUtil = require('../helpers/commonUtil');
var userAdminService = require('../service/userAdminService');
var redisDao = require('../storage/redisDao');

module.exports = function(app) {

	app.post('/auth/gettoken', function*(req, res) {
		let username = req.body.username
		let pwd = req.body.password
		if (username && pwd) {
			let returnJson = yield * userAdminService.getToken(req.body.username, req.body.password)
			res.json(returnJson)
		} else {
			res.json({
				code: 201,
				data: '数据输入不全'
			})
		}
	})

}