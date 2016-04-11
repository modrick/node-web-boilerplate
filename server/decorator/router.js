/*
 * 类的router方法绑定，通过该绑定让modal具备rest api的路由
 * 
 * @param {string} url 请求url前缀，默认为''
 * @return {}
 */
'use strict'

function Router(url) {
    return function(classObject) {
        let attrs = classObject.prototype.attrs
        classObject.prototype.initRestFull = function(app) {
            if (!url) url = ''
            let self = this
            let className = classObject.name.toLowerCase()

            //获取指定对象
            app.get(url + '/classes/' + className + '/:id', function(req, res) {
                let id = req.params.id
                self.findOne(id).then(function(data) {
                    returnJson(res, data)
                })
            })

            //获取对象
            app.get(url + '/classes/' + className, function(req, res) {
                let selector;
                if (req.query.selector) {
                    selector = JSON.parse(req.query.selector)
                } else {
                    selector = {}
                }
                let sort
                if (req.query.sort) {
                    sort = JSON.parse(req.query.sort)
                }
                let start = req.query.start
                let limit = req.query.limit
                if (!limit) {
                    limit = 0
                }
                self.findPagingData(selector, start, limit, sort).then(function(data) {
                    returnJson(res, data)
                })
            })

            //增加对象
            app.post(url + '/classes/' + className, function(req, res) {
                let object = req.body
                    //添加对象，进行属性验证
                checkTypeAndTranslateType(object, attrs)
                self.save(object).then(function(data) {
                    returnJson(res, data)
                })
            })

            //更新指定对象
            app.put(url + '/classes/' + className + '/:id', function(req, res) {
                let id = req.params.id
                let object = req.body
                checkTypeAndTranslateType(object, attrs)
                self.update(id, object).then(function(data) {
                    returnJson(res, data)
                })
            })

            //删除指定对象
            app.delete(url + '/classes/' + className + '/:id', function(req, res) {
                let id = req.params.id
                self.remove(id).then(function(data) {
                    returnJson(res, data)
                })
            })
        }
    }
}

function returnJson(res, data) {
    res.json({
        code: 100,
        data: data
    });
}

/**
 * 属性类型检查
 * @param {object} object 需要被检查的对象
 * @param {object} attrs  属性名＋属性类型的对象
 * @returns {*|promise}
 */
function checkTypeAndTranslateType(object, attrs) {
    Object.keys(attrs).forEach(function(key) {
        let objectType = typeof(object[key])
        let requireType = attrs[key]
            //通过post过来的数据，其值都为string,所以只需要处理number要求的字段
        if (objectType !== requireType && requireType === 'number') {
            object[key] = parseInt(object(key))
        }

        // if (typeof(object[key]) !== attrs[key]) {
        // throw new SyntaxError(' 属性 ' + key + ' 的值必须是' + typeof(attrs[key]) + '类型。 ');

        // }
    })
}

module.exports = Router