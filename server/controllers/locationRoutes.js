/**
 * 微信路由
 */
var constants = require('../helpers/constants');
var weixinService = require('../service/weixinService');
var tecentMapService = require('../service/tecentMapService');
var baiduMapService = require('../service/baiduMapService');
var commonUtil = require('../helpers/commonUtil');
var mongodaDao = require('../storage/mongodbDao');

module.exports = function(app) {

	//微信端 地址补全
	app.get('/getPlaceSuggestion', function*(req, res) {
		let place = req.query.place;
		let longitude = req.query.longitude;
		let latitude = req.query.latitude;
		let data = yield baiduMapService.getAutoCompleteAddresses(place, longitude, latitude);
		res.json({
			code: 100,
			data: data
		});
	});

	//根据地址获取坐标
	app.get('/getLngLatByAddress', function*(req, res) {
		let place = req.query.place;
		let data = yield baiduMapService.getLngLatByAddress(place);
		res.json({
			code: 100,
			data: data
		});
	});

	//根据坐标获取地址
	app.get('/getAddressByLngLat', function*(req, res) {
		let longitude = req.query.longitude;
		let latitude = req.query.latitude;
		let data = yield baiduMapService.getAddressByLngLat(longitude, latitude);
		res.json({
			code: 100,
			data: data
		});
	});

	//微信首页地址验证
	app.get('/checkAddress', function(req, res) {
		// todo
		res.json({
			code: 100
		})

	});

	app.get('/getDistance/:lat1/:lng1/:lat2/:lng2', function(req, res) {
		let lat1 = req.params.lat1;
		let lng1 = req.params.lng1;
		let lat2 = req.params.lat2;
		let lng2 = req.params.lng2;
		let distance = baiduMapService.getDistanceOfTwoPoints(lng1, lat1, lng2, lat2);
		res.json({
			code: 100,
			data: distance
		});

	})



};