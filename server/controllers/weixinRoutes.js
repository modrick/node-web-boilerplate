/**
 * 微信路由
 */
'use strict'
var constants = require('../helpers/constants');
var weixinService = require('../service/weixinService');
var fs = require('fs');
var mongodaDao = require('../storage/mongodbDao');
var commonUtil = require('../helpers/commonUtil');
var middleware = require('wechat-pay').middleware;
var initConfig = {
	partnerKey: constants.WeixinConstants.PARTNERKEY,
	appId: constants.WeixinConstants.APPID,
	mchId: constants.WeixinConstants.MCHID,
	notifyUrl: constants.WeixinConstants.NOTIFYURL,
	// pfx: fs.readFileSync(constants.WeixinConstants.PFX)
};


module.exports = function(app) {

	//########## 微信菜单入口  #--start--#  #################
	app.get('/wxIndex', function*(req, res) {
		let code = req.query.code;
		if (code) {
			//正式环境
			let data = yield* weixinService.getOpenIdByCode(code);
			res.cookie('userid', data.openId, {
				maxAge: 1800000
			});
			res.redirect('/');
		} else {
			//开发测试
			let userid = "old6iv5MVy2gDkugC1C0Yy3h-mLM";
			res.cookie('userid', userid, {
				maxAge: 1800000
			});
			res.redirect('/');
		}
	});
	//########## 微信菜单入口  #--end--#  #################

	//微信分享接口签名
	app.post('/getQMData', weixinService.getQMData);

	app.get('/weixinGetUserInfo', function*(req, res) {
		let code = req.query.code;
		let data = yield* weixinService.weixinGetUserInfo(code);
		let openid = data.openid;
		res.json({
			code: 100,
			openid: openid
		})
	});

	//微信订单创建
	app.post('/createOrder', function*(req, res) {
		var order = {
			body: '吮指原味鸡 * 1',
			attach: '{"部位":"三角"}',
			out_trade_no: 'kfc' + (+new Date),
			total_fee: 1,
			spbill_create_ip: '127.0.0.1',
			openid: 'o8udVvxVvBGQL8HTkYd6g78pnF9U',
			trade_type: 'JSAPI'
		};
		var payargs = yield weixinService.createPayment(order)
		res.json({
			code: 100,
			data: payargs
		});
	});

	//微信支付回调
	app.use('/paymentCallback', middleware(initConfig).getNotify().done(function(message, req, res, next) {
		var openid = message.openid;
		var order_id = message.out_trade_no;
		if (message.return_code == 'SUCCESS') {
			if (message.result_code == 'SUCCESS') {
				// TODO
			}
		} else {
			//TODO
		}
	}));

};