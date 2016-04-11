/*
 * 类的dao方法绑定，通过该绑定让modal具备dao功能
 * 
 * @param {} 
 * @return {}
 */
'use strict'

function Service(dao) {
    return function(classObject) {
        /*
         * 手动初始化数据库连接
         */
        classObject.prototype.dbInit = function() {
                return dao.init()
            }
            /*
             * 保存
             * @prams:newData object对象
             * @return:Object 保存的对象
             */
        classObject.prototype.save = function(newData) {
                return dao.save(classObject.name, newData)
            }
            /*
             * 获取数量
             * @prams:selector  查询条件的数据,可以直接为id的字符串，也可以用object
             * @return:int 数据总数
             */
        classObject.prototype.getCount = function(selector) {
                return dao.getCount(classObject.name, selector)
            }
            /*
             * 根据查询条件获取信息
             * @prams:selector string/object 查询条件的数据,可以直接为id的字符串，也可以用object
             * @prams:sort object             排序参数
             * @return:[Object]
             */
        classObject.prototype.query = function(selector, sort) {
                return dao.query(classObject.name, selector, sort)
            }
            /*
             * 根据查询条件获取一条信息
             * @prams:selector  查询条件的数据,可以直接为id的字符串，也可以用object
             * @return:Object
             */
        classObject.prototype.findOne = function(selector) {
                return dao.findOne(classObject.name, selector)
            }
            /*
             * 删除
             * @prams:selector string/object  查询条件的数据,可以直接为id的字符串，也可以用object
             * @return: int                  被删除的数量
             */

        classObject.prototype.remove = function(selector) {
                return dao.remove(classObject.name, selector)
            }
            /*
             * 普通更新 .方式为$set
             * @prams:selector string/object 查询条件的数据,可以直接为id的字符串，也可以用object
             * @prams:newData object          需要更新的数据 ,该处的newData，会被内部$set,所以高级的更新需要借助updateAdv来实现�更新，，,f
             * @prams:multi  boolean        是否批量更新
             * @return: int                 被更新的数量 ,成功就为1, 没有查到就为0。
             */
        classObject.prototype.update = function(selector, newData, multi) {
                if (multi) {
                    return dao.updateBatch(classObject.name, selector, newData)
                } else {
                    return dao.update(classObject.name, selector, newData)
                }
            }
            /*
             * 获取分页查询
             * @prams:selector string/object 查询条件的数据,可以直接为id的字符串，也可以用object
             * @prams:sort  object             排序
             * @prams:start int              开始的数据下标
             * @prams:limit int              每页的数据数量
             * @return: object.total  int      总数据数
             * @return: object.records  [Object]   返回的数据
             */
        classObject.prototype.findPagingData = function(selector, start, limit, sort) {
                var pageRequest = {}
                pageRequest.start = start
                pageRequest.limit = limit
                pageRequest.sort = sort ? sort : {
                    createTime: -1
                }
                return dao.findPagingData(classObject.name, selector, pageRequest)
            }
            /*
             * 查找并删除， 原子操作
             * @prams:selector string/object 查询条件的数据,可以直接为id的字符串，也可以用object
             * @prams:newData          object 更新的数据
             * @prams:sort object             排序
             * @return:[Object]             返回的更新数据
             */
        classObject.prototype.findAndModify = function(selector, newData, sort) {
                return dao.findAndModify(classObject.name, selector, newData, sort)
            }
            /*
             * 查找并删除， 原子操作
             * @prams:selector string/object 查询条件的数据,可以直接为id的字符串，也可以用object
             * @prams:newData          object 更新的数据
             * @prams:sort object             排序
             * @return:[Object]             返回的更新数据
             */
        classObject.prototype.findAndRemove = function(selector, sort) {
                return dao.findAndRemove(classObject.name, selector, sort)
            }
            /*
             * 按组查询
             * @prams: keys object        分组键
             * @prams: selector object    查询条件的数据
             * @prams: initial object     表示$reduce函数参数prev的初始值。每个组都有一份该初始值
             * @prams: reduce function    该函数接受两个参数，doc表示正在迭代的当前文档，prev表示累加器文档
             * @return:[Object]           返回查询后的数据
             */
        classObject.prototype.group = function(keys, selector, initial, reduce) {
                return dao.group(classObject.name, keys, selector, initial, reduce)
            }
            /*
             * 去重查询
             * @prams: field [string]    需要去重的字段数组
             * @return:[Object]          返回查询后的数据
             */
        classObject.prototype.distinct = function(field) {
            return dao.distinct(classObject.name, field)
        }

    }
}

module.exports = Service