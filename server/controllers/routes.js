  'use strict'
  var weixinRoutes = require('./weixinRoutes');
  var userAdminRoutes = require('./userAdminRoutes');
  var locationRoutes = require('./locationRoutes');

  module.exports = function(app) {
  	//微信
  	weixinRoutes(app);
  	//TODO
  	locationRoutes(app);

  };