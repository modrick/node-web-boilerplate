'use strict'

var Server = require('./server/server');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
global.logger = require('./server/log/logFactory').getLogger();
var http = require('http');
var app = express();
var wechat = require('wechat');
// 微信开发需要开启
// var weixinService = require('./server/service/weixinService');
var constants = require('./server/helpers/constants');
var authority = require('./server/filter/authority');
var errorhandler = require('errorhandler');
var colors = require('colors');
app.use(express.static(__dirname + '/public')); //方便开发，暂时引入
// App 全局配置
app.use(cookieParser());
//权限拦截
// app.use(authority.check);
//设置跨域
// app.use(authority.crossDomain);
app.use(bodyParser.json({
    limit: '2mb'
}));
app.use(bodyParser.urlencoded({
    limit: '2mb',
    extended: true
}));
//注入URL
require('./server/controllers/routes')(app);
//异常处理
app.use(errorHandle);

//微信开发需要开启
// weixinService.getAccess_token(); //开启微信获取token定时任务
// app.use('/weixin', wechat(constants.WeixinConstants.TOKEN, weixinService.payAttentionTo));
var appServer = new Server(app);
appServer.start();

//捕获链式无法捕获的异常
process.on('uncaughtException', function(err) {
    const title = String(err);
    const content = String(err.stack);
    if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'PRODUCTION') {
        logger.error('error:' + content);
    } else {
        console.info(colors.red('Error info is, "%s" .'), title);
        console.info(colors.green('Error stack is, "%s" .'), content);
        require('node-notifier').notify({
            title: title,
            message: content
        })
    }
})

//异常处理
function errorHandle(err, req, res, next) {
    const stack = err.stack
    let str;
    if (stack) {
        str = String(stack)
    } else {
        str = String(err)
    }
    //正式生产环境
    if (err) {
        if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'PRODUCTION') {
            if (req.method == "post") {
                logger.error("method:" + req.method + ',url:' + req.url + ",params:" + JSON.stringify(req.body) + ",error:" + str);
            } else {
                logger.error("method:" + req.method + ',url:' + req.url + ",params:" + JSON.stringify(req.query || req.params) + ",error:" + str);
            }
            res.json({
                code: 500,
                data:err
            })
        } else {
            //开发环境
            errorNotification(str, req);
        }
    } else {
        next();
    }
}

function errorNotification(str, req) {
    const title = req.method + ':' + req.url;
    console.info(colors.red('Error info is, "%s" .'), title);
    console.info(colors.green('Error stack is, "%s" .'), str);
    require('node-notifier').notify({
        title: title,
        message: str
    })
}