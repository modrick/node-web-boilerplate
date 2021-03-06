'use strict'
var http = require('http');
var wechat = require('wechat');
var url = require('url');
var fs = require('fs');
var cryptojs = require("crypto-js");
var crypto = require("crypto");
var xml = require("node-xml/lib/node-xml.js");
var co = require('co');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var redisDao = require('../storage/redisDao');
var mongodaDao = require('../storage/mongodbDao');
var CronJob = require('cron').CronJob;
var constants = require('../helpers/constants');
var simSimiService = require('./simSimiService');
var initConfig = {
    partnerKey: constants.WeixinConstants.PARTNERKEY,
    appId: constants.WeixinConstants.APPID,
    mchId: constants.WeixinConstants.MCHID,
    notifyUrl: constants.WeixinConstants.NOTIFYURL
        // pfx: fs.readFileSync(constants.WeixinConstants.PFX)
};
var Payment = require('wechat-pay').Payment;
var payment = new Payment(initConfig);

// 微信接口类
class WeixinService {

    createPayment(order) {
        return new Promise(function(resolve, reject) {
            payment.getBrandWCPayRequestParams(order, function(err, payargs) {
                if (err) reject(err);
                resolve(payargs);
            })
        })
    }

    /**
     * 微信接入验证( 第一次绑定公众号时调用)
     * @param req
     * @param res
     */
    weixinCheck(req, res) {
        var signature = req.query.signature;
        var timestamp = req.query.timestamp;
        var nonce = req.query.nonce;
        var echostr = req.query.echostr;
        var check = false;
        check = this.isLegel(signature, timestamp, nonce, constants.WeixinConstants.TOKEN); //替换成你的token
        if (check) {
            res.write(echostr);
        } else {
            res.write("error data");
        }
        res.end();
    }

    /**
     * 微信接入校验时sha1加密
     * @param signature
     * @param timestamp
     * @param nonce
     * @returns {boolean}
     */
    isLegel(signature, timestamp, nonce, token) {
        var TOKEN = token;
        var arr = [TOKEN, timestamp, nonce];
        // 对三个参数进行字典序排序
        arr.sort();
        // sha1 加密
        var msg = arr[0] + arr[1] + arr[2];
        var key = constants.WeixinConstants.ENCODINGAESKEY;
        msg = cryptojs.SHA1(msg, key).toString();
        // 验证
        if (msg == signature) {
            return true;
        } else {
            return false;
        }
    }

    //定时任务，调用获取微信tokenid的接口
    getAccess_token() {
        var me = this;
        this.access_token();
        //每隔55分钟
        var job = new CronJob('*/55 * * * * ', function() {
            me.access_token();
        }, null, true, "Asia/Chongqing");
    }

    access_token() {
        var appid = constants.WeixinConstants.APPID;
        var secret = constants.WeixinConstants.APPSECRET;
        //console.log("调用获取access_token方法");
        request.get({
            url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret,
            formData: {}
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var json = JSON.parse(body);
                logger.info('token:' + json.access_token);
                redisDao.set(appid + "access_token", json.access_token);
                redisDao.expire(appid + "access_token", 7000); // 默认是7200的有效期
                //调用微信卡券接口，获取api_ticket
                request.get({
                    url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + json.access_token + '&type=jsapi',
                    formData: {}
                }, function(err, res, body) {
                    if (!err && res.statusCode == 200) {
                        redisDao.hset(appid, "ticket", JSON.parse(body).ticket);
                    } else {
                        logger.error(err);
                    }
                });
            } else {
                logger.error(error);
            }
        });
    }

    //分享用的数字签名验证
    getQMData(req, res) {
        var url = req.body.url;
        var appId = constants.WeixinConstants.APPID;
        redisDao.hgetall(appId).then(function(data) {
            var ticket = data.ticket;
            //createTimestamp
            var timestamp = parseInt(new Date().getTime() / 1000) + '';
            //createNonceStr
            var nonceStr = Math.random().toString(36).substr(2, 15);
            //先按照微信指定的规则生成jsapi_ticket
            var stringutil = 'jsapi_ticket=' + ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url;
            //SHA1
            var md5sum = crypto.createHash('sha1');
            md5sum.update(stringutil, 'utf8');
            var signature = md5sum.digest('hex');
            //动态的返回前天进行微信接口操作的数据
            return res.json({
                appId: appId,
                timestamp: timestamp,
                nonceStr: nonceStr,
                signature: signature
            });
        });
    }

    //----------------------------------公用promise方法

    /**
     * 获取AccessToken方法（Promise）
     * @returns {*|promise}
     */
    * getAccessToken() {
        var appid = constants.WeixinConstants.APPID;
        var secret = constants.WeixinConstants.APPSECRET;
        var access_token = yield redisDao.get(appid + "access_token");
        if (access_token) {
            return access_token;
        } else {
            //获取access_token
            var response = yield request.getAsync('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret);
            if (response.statusCode == 200) {
                var _data = JSON.parse(response.body);
                redisDao.set(appid + "access_token", _data.access_token);
                redisDao.expire(appid + "access_token", 7000);
                return _data.access_token;
            }
        }
    }

    /**
     * 根据code进行网页授权获取用户openid
     * @param code
     */
    * getOpenIdByCode(code) {
        var appid = constants.WeixinConstants.APPID;
        var secret = constants.WeixinConstants.APPSECRET;
        var reponse = yield request.getAsync('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appid + '&secret=' + secret + '&code=' + code + '&grant_type=authorization_code');
        if (reponse.statusCode == 200) {
            var json = JSON.parse(reponse.body);
            var openId = json.openid;
            return {
                code: 100,
                openId: openId
            }
        } else {
            return {
                code: 500,
                message: '网络请求失败'
            }
        }
    }

    /**
     * UnionID机制获取微信用户信息
     * @param access_token
     * @param opednId
     * @returns {promise.promise|Function|jQuery.promise|*|r.promise|promise}
     */
    * getWechatUserInfo(openId) {
        var access_token = yield * this.getAccessToken();
        var response = yield request.getAsync('https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token + '&openid=' + openId + '&lang=zh_CN')
        if (response.statusCode == 200) {
            return JSON.parse(response.body);
        } else {
            return {
                code: 500,
                message: '网络请求失败'
            }
        }
    }

    //获取微信用户信息
    * weixinGetUserInfo(code) {
        var appid = constants.WeixinConstants.APPID;
        var secret = constants.WeixinConstants.APPSECRET;
        var response = yield request.getAsync('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appid + '&secret=' + secret + '&code=' + code + '&grant_type=authorization_code');
        if (response.statusCode == 200) {
            var json = JSON.parse(response.body);
            var access_token = json.access_token;
            var openid = json.openid;
            var tokenResponse = yield request.getAsync('https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN')
            if (tokenResponse.statusCode == 200) {
                var json = JSON.parse(tokenResponse.body);
                delete json._id;
                var users = yield mongodaDao.query('User', {
                    openid: json.openid
                });
                if (users.length == 0) {
                    return yield mongodaDao.save('User', json);
                } else {
                    return users[0];
                }
            }
        }
    }

    
    //微信关注
    payAttentionTo(req, res, next) {
        co(function *(){
          try {
              yield *payAttentionToCo(req, res, next);
          } catch (err) {
              console.error(err.message); // "boom" 
          }
        });
    }

    //用户关注以后的操作
    * subscribeUser(message) {
        var access_token = yield * this.getAccessToken();
        var response = yield request.getAsync('https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token + '&openid=' + message.FromUserName + '&lang=zh_CN')
        if (response.statusCode == 200) {
            var wechatUserInfo = JSON.parse(response.body);
            var userInfo = {
                subscribe: wechatUserInfo.subscribe,
                openId: wechatUserInfo.openid,
                nickname: wechatUserInfo.nickname,
                sex: wechatUserInfo.sex,
                wechatCity: wechatUserInfo.city,
                country: wechatUserInfo.country,
                province: wechatUserInfo.province,
                language: wechatUserInfo.language,
                headimgurl: wechatUserInfo.headimgurl,
                subscribe_time: wechatUserInfo.subscribe_time,
                remark: wechatUserInfo.remark,
                groupid: wechatUserInfo.groupid,
                usertype: '0'
            }
            var data = yield mongodaDao.query('User', {
                openId: message.FromUserName
            });
            if (data.length == 0) {
                var user = yield mongodaDao.save('User', userInfo)
                logger.info("微信关注:openid为" + message.FromUserName + "关注成功");
            } else if (data.length > 0) {
                var user = yield mongodaDao.update('User', {
                    openId: message.FromUserName
                }, {
                    subscribe: 1
                })
                logger.info("微信关注:openid为" + message.FromUserName + "再次关注成功");
            }
        }
    }

    //用户取消关注事件
    * unsubscribeUser(message) {
        var data = yield mongodaDao.query('User', {
            openId: message.FromUserName
        });
        if (data.length === 0) {
            logger.info('openId为：' + message.FromUserName + '的用户取消关注时，数据库没有该用户的数据');
        } else if (data.length === 1) {
            var unsub = new Date();
            unsub.setHours(unsub.getHours() + 8);
            var user = yield mongodaDao.update('User', {
                openId: message.FromUserName
            }, {
                subscribe: 0,
                unsubscribe_time: unsub
            });
            logger.info('openId为：' + message.FromUserName + '的用户取消关注成功。');
        }
    }

    //处理用户留言
    * processMessage(message) {
        var input = (message.Content || '').trim();
        return 'hello world.'
    }

}

//微信关注
    function* payAttentionToCo(req, res, next) {
        // 微信输入信息都在req.
        var message = req.weixin;
        //关注事件
        if ((message.MsgType == 'event') && (message.Event == 'subscribe')) {
            yield * ws.subscribeUser(message);
            res.reply([{
                title: '',
                description: '',
                picurl: '',
                url: ''
            }]);
            //取消关注事件
        } else if ((message.MsgType == 'event') && (message.Event == 'unsubscribe')) {
            yield * ws.unsubscribeUser(message);
            res.reply('ok');
            //公众号里面的消息回复
        } else if (message.MsgType == 'text') {
            yield * this.processMessage()
            res.send('success')
        } else {
            res.send('')
        }
    }
var ws=new WeixinService();
module.exports = ws