'use strict'
var BaseService = require('../service/baseService')
var Promise = require('bluebird')
var jwt = require('jsonwebtoken')


class UserAdminService extends BaseService {

	*getToken(username, password) {
		let user = yield * this.findOne({
			username: username
		})
		if (!user) {
			return {
				code: 201,
				data: '认证失败，用户名找不到'
			}
		} else {
			// 检查密码
			if (user.password != password) {
				return {
					code: 200,
					data: '认证失败，密码错误'
				}
			} else {
				var token = jwt.sign(user, 'your secret', {
					'expiresIn': 1440 // 设置过期时间
				})
				return {
					code: 100,
					data: token
				}
			}
		}
	}

}

module.exports = new UserAdminService('User')