/*
 * 类的dao方法绑定，通过该绑定让modal具备dao功能
 * 
 * @param {} 
 * @return {}
 */
function Service(dao) {
    return function(classObject) {
        classObject.prototype.query = function(selector, sort) {
            return dao.query(classObject.name, selector, sort)
        }
        classObject.prototype.save = function(newData) {
            return dao.save(classObject.name, newData);
        }
        classObject.prototype.remove = function(selector) {
            return dao.remove(classObject.name, selector);
        }
        classObject.prototype.update = function(selector, newData) {
            return dao.update(classObject.name, selector, newData);
        }
    }
}

module.exports = Service