/*
 * 类的router方法绑定，通过该绑定让modal具备rest api的路由
 * 
 * @param {} 
 * @return {}
 */
'use strict'

function Router(url) {
    return function(classObject) {
        classObject.prototype.initRestFull = function(app) {
            if (!url) url = ''
            let self = this
            let className = classObject.name.toLowerCase()

            //获取指定对象
            app.get(url + '/classes/' + className + '/:id', function*(req, res) {
                let id = req.params.id
                let data = yield * self.findOne(id)
                returnJson(res, data)
            })

            //获取对象
            app.get(url + '/classes/' + className, function*(req, res) {
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
                let data = yield * self.findPagingData(selector, start, limit, sort)
                returnJson(res, data)
            })

            //增加对象
            app.post(url + '/classes/' + className, function*(req, res) {
                let object = req.body
                let data = yield * self.save(object)
                returnJson(res, data)
            })

            //更新指定对象
            app.put(url + '/classes/' + className + '/:id', function*(req, res) {
                let id = req.params.id
                let object = req.body
                let data = yield * self.update(id, object)
                returnJson(res, data)
            })

            //删除指定对象
            app.delete(url + '/classes/' + className + '/:id', function*(req, res) {
                let id = req.params.id
                let data = yield * self.remove(id)
                returnJson(res, data)
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

module.exports = Router