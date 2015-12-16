/**
 * Created by tangnian on 14/11/10.
 */
var Server = require('./server/server');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
global.logger = require('./server/log/logFactory').getLogger();
var http = require('http');
var app = express();
var wechat = require('wechat');
var weixinService = require('./server/service/weixinService');
var constants = require('./server/helpers/constants');
var authority = require('./server/filter/authority');
var errorhandler = require('errorhandler');
//var colors = require('colors/safe');
// app.use(authority.forDeveloper);
app.use(express.static(__dirname + '/public')); //方便开发，暂时引入
// App 全局配置
app.use(cookieParser());
// app.use(authority.check);
// app.use(authority.forDeveloper);
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

weixinService.getAccess_token(); //开启微信获取token定时任务
app.use('/weixin', wechat(constants.WeixinConstants.TOKEN, weixinService.payAttentionTo));
var appServer = new Server(app);
appServer.start();

//异常处理
function errorHandle(err, req, res, next) {
    //正式生产环境
    if (err) {
        if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'PRODUCTION') {
            if (req.method == "post") {
                logger.error(req.method + ':' + req.url + ":" + JSON.stringify(req.body));
            } else {
                logger.error(req.method + ':' + req.url + ":" + JSON.stringify(req.query || req.params));
            }
            res.json({
                code: 500
            })
        } else {
            //开发环境
            errorNotification(err, req);
        }
    }else{
        next();
    }
}

function errorNotification(err, req) {
    var stack = err.stack
    var str;
    if (stack) {
        str = String(stack)
    } else {
        str = String(err)
    }
    var title = req.method + ':' + req.url;
    console.info(colors.red('Error info is, "%s" .'), title);
    console.info(colors.green('Error stack is, "%s" .'), str);
    require('node-notifier').notify({
        title: title,
        message: str
    })
}