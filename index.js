'use strict'

let Server = require('./server/server')
var express = require('express')
var powerExpress = require('power-express')(express)
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
global.logger = require('./server/log/logFactory').getLogger()
var app = powerExpress()
// 微信开发需要开启
// var wechat = require('wechat')
// var weixinService = require('./server/service/weixinService')
var constants = require('./server/helpers/constants')
var authority = require('./server/filter/authority')
var domain = require('domain')
var exception = require('./server/helpers/exception')
	//静态资源拦截器，指定静态资源目录
// app.use(express.static(__dirname + '/public'))
// App 全局配置
app.use(cookieParser())
//权限拦截
// app.use(authority.check)
//设置跨域
app.use(authority.crossDomain)
//设置token验证
app.use(authority.checkToken)

app.use(bodyParser.json({
	limit: '2mb'
}))
app.use(bodyParser.urlencoded({
	limit: '2mb',
	extended: true
}))
app.addErrorHandle(function(err, req, res) {
	res.json({
		code: 500,
		data: err.toString()
	})
})
//微信开发需要开启
// weixinService.getAccess_token() //开启微信获取token定时任务
// app.use('/weixin', wechat(constants.WeixinConstants.TOKEN, weixinService.payAttentionTo))
require('./server/model/index')(app)
//注入URL
require('./server/controllers/routes')(app)

var appServer = new Server(app)
appServer.start()