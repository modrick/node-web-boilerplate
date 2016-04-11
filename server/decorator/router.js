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
            let className = classObject.name.toLowerCase()
                //获取指定对象
            app.get(url + '/classes/' + className + '/:id', function*(req, res) {

                })
                //获取对象
            app.get(url + '/classes/' + className, function*(req, res) {

                })
                //增加对象
            app.post(url + '/classes/' + className, function*(req, res) {

                })
                //更新指定对象
            app.put(url + '/classes/' + className + '/:id', function*(req, res) {

                })
                //删除指定对象
            app.delete(url + '/classes/' + className + '/:id', function*(req, res) {

            })
        }
    }
}

module.exports = Router