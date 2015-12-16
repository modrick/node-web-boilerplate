/**
 * Created by user on 15/8/5.
 */

var Q = require('q');
var mysql = require('mysql');
var config = require('../../config');
var HOST = config.mysql_host || '127.0.0.1';
var PORT = config.mysql_port || 3306;
var USER = config.mysql_user || 'root';
var PASSWORD = config.mysql_password || '';
var DATABASE = config.mysql_dbname || 'cms';

var mysqlDbDao;
mysqlDbDao = {

    _pool: null,

    _connection: null,

    _isTransaction: false,

    /**
     * 连接初始化
     */
    init: function () {
        if (this._isTransaction) {
            this._connection = mysql.createConnection({
                host: HOST,
                user: USER,
                password: PASSWORD,
                port: PORT,
                database: DATABASE
            });
        } else {
            this._pool = mysql.createPool({
                connectionLimit: 6,
                host: HOST,
                user: USER,
                password: PASSWORD,
                port: PORT,
                database: DATABASE
            });
        }
    },

    /**
     *
     * @returns {*|promise}
     */
    getConnection: function () {
        var deferred = Q.defer();
        if (this._isTransaction) {
            deferred.resolve(this._connection);
        } else {
            this._pool.getConnection(function (err, connection) {
                if (err) {
                    deferred.reject(new Error(err));
                } else {
                    deferred.resolve(connection);
                }
            });
        }
        return deferred.promise;
    },

    /**
     *
     * @param connection
     * @returns {*|promise}
     */
    releaseConnection: function (connection) {
        var deferred = Q.defer();
        if (!this._isTransaction) {
            connection.release();
            deferred.resolve();
        } else {
            connection.end(function (err) {
                if (err) {
                    console.log('connection end fail');
                } else {
                    console.log('connection end success');
                }
            });
        }
        return deferred.promise;
    },

    /**
     * @oaram sql(string)
     * ||
     * @param collectiom(string) ==>tablename
     * @param data(object)
     */
    save: function () {
        var deferred = Q.defer();
        var sql = '';
        var data = {};
        if (arguments.length == 1) {
            sql = arguments[0];
        } else if (arguments.length == 2) {
            var table = arguments[0];
            sql = 'INSERT INTO ' + table + ' SET ?';
            data = arguments[1];
        }
        var self = this;
        this.getConnection()
            .then(function (connection) {
            connection.query(
                sql,
                data,
                function (err1, result) {
                    if (err1) {
                        if (self._isTransaction) {
                            connection.rollback(function () {
                                self.releaseConnection(connection);
                                deferred.reject(new Error(err1));
                            });
                        } else {
                            self.releaseConnection(connection);
                            deferred.reject(new Error(err1));
                        }

                    } else {
                        if (!self._isTransaction)
                            self.releaseConnection(connection);
                        deferred.resolve(result);
                    }
                }
                );
        })
            .catch(function (err) {
            deferred.reject(new Error(err));
        });

        return deferred.promise;
    },

    /**
     * @param sql(string)
     * ||
     * @param collection(string) ==>tableName
     * @param selector(object)
     *
     */
    query: function () {
        var deferred = Q.defer();
        var sql = '';
        if (arguments.length == 1) {
            sql = arguments[0];
        } else if (arguments.length == 2) {
            var table = arguments[0];
            sql = 'SELECT * FROM ' + table + ' WHERE 1=1';
            var where = ' ';
            var selector = arguments[1];
            for (var p in selector) {
                where = where + 'AND ' + p + ' = "' + selector[p] + '" ';
            }
            sql = sql + where;
        }
        var self = this;
        this.getConnection()
            .then(function (connection) {
            connection.query(
                sql,
                function (err1, rows, fields) {
                    if (err1) {
                        deferred.reject(new Error(err1));
                        self.releaseConnection(connection);
                    } else {
                        deferred.resolve(rows);
                        if (!self._isTransaction)
                            self.releaseConnection(connection);
                    }

                }
                );
        })
            .catch(function (err) {
                 console.info("err:" + err);
            deferred.reject(new Error(err));
        });

        return deferred.promise;
    },

    /**
     * @param sql(string)
     * ||
     * @param collection(string) ==>tableName
     * @param selector(object)
     *
     */
    findOne: function () {
        var deferred = Q.defer();
        var sql = '';
        if (arguments.length == 1) {
            sql = arguments[0];
        } else if (arguments.length == 2) {
            var table = arguments[0];
            sql = 'SELECT * FROM ' + table + ' WHERE 1=1';
            var where = ' ';
            var selector = arguments[1];
            for (var p in selector) {
                where = where + 'AND ' + p + ' = "' + selector[p] + '" ';
            }
            sql = sql + where;
        }
        var self = this;
        this.getConnection()
            .then(function (connection) {
            connection.query(
                sql,
                function (err1, rows, fields) {
                    if (err1) {
                        self.releaseConnection(connection);
                        deferred.reject(new Error(err1));
                    } else {
                        if (rows.length == 0) {
                            deferred.resolve(null);
                        } else {
                            deferred.resolve(rows[0]);
                            if (!self._isTransaction)
                                self.releaseConnection(connection);
                        }
                    }
                }
                );
        })
            .catch(function (err) {
            deferred.reject(new Error(err));
        });

        return deferred.promise;
    },

    /**
     * @param sql(string)
     * ||
     * @paran collection(string) ===>tanleName
     * @param selector
     * @param sort
     * @param limit
     */
    findBySort: function () {
        var deferred = Q.defer();
        var sql = '';
        if (arguments.length == 1) {
            sql = arguments[0];
        } else if (arguments.length == 4) {
            var table = arguments[0];
            sql = 'SELECT * FROM ' + table + ' WHERE 1=1';
            var where = ' ';
            var selector = arguments[1];
            for (var p in selector) {
                where = where + 'AND ' + p + ' = "' + selector[p] + '" ';
            }
            var order = arguments[2];
            var orderBy = ' ORDER BY ';
            for (var ob in order) {
                orderBy = orderBy + ob + ' ' + order[ob] + ' ,';
            }
            orderBy = orderBy.substr(0, orderBy.length - 1);

            var limit = arguments[3];

            var limitor = ' LIMIT 0 , ' + limit;
            sql = sql + where + orderBy + limitor;
        }

        var self = this;
        this.getConnection()
            .then(function (connection) {
            connection.query(
                sql,
                function (err1, rows, fields) {
                    if (err1) {
                        self.releaseConnection(connection);
                        deferred.reject(new Error(err1));
                    } else {
                        deferred.resolve(rows);
                        if (!self._isTransaction)
                            self.releaseConnection(connection);
                    }
                }
                );
        })
            .catch(function (err) {
            deferred.reject(new Error(err));
        });

        return deferred.promise;
    },

    /**
     * @param sql(string)
     * collection, selector, sort, start, end
     */
    pagingQuery: function () {
        var deferred = Q.defer();
        var sql = '';
        if (arguments.length == 1) {
            sql = arguments[0];
        } else if (arguments.length == 5) {
            var table = arguments[0];
            sql = 'SELECT * FROM ' + table + ' WHERE 1=1';
            var where = ' ';
            var selector = arguments[1];
            for (var p in selector) {
                where = where + 'AND ' + p + ' = "' + selector[p] + '" ';
            }
            var order = arguments[2];
            var orderBy = ' ORDER BY ';
            for (var ob in order) {
                orderBy = orderBy + ob + ' ' + order[ob] + ' ,';
            }
            orderBy = orderBy.substr(0, orderBy.length - 1);

            var start = arguments[3];
            var end = arguments[4];

            var limitor = ' LIMIT ' + start + ' , ' + end;
            sql = sql + where + orderBy + limitor;
        }

        var self = this;
        this.getConnection()
            .then(function (connection) {
            connection.query(
                sql,
                function (err1, rows, fields) {
                    if (err1) {
                        self.releaseConnection(connection);
                        deferred.reject(new Error(err1));
                    } else {
                        deferred.resolve(rows);
                        if (!self._isTransaction)
                            self.releaseConnection(connection);
                    }
                }
                );
        })
            .catch(function (err) {
            deferred.reject(new Error(err));
        });

        return deferred.promise;
    },

    /**
     * @param sql(string)
     * ||
     * @param collection(string) ==>tableName
     * @param selector(object)
     *
     * @return number
     */
    getCount: function () {
        var deferred = Q.defer();
        var sql = '';
        if (arguments.length == 1) {
            sql = arguments[0];
        } else if (arguments.length == 2) {
            var table = arguments[0];
            sql = 'SELECT COUNT(*) count FROM ' + table + ' WHERE 1=1';
            var where = ' ';
            var selector = arguments[1];
            for (var p in selector) {
                where = where + 'AND ' + p + ' = "' + selector[p] + '" ';
            }
            sql = sql + where;
        }

        var self = this;
        this.getConnection()
            .then(function (connection) {
            connection.query(
                sql,
                function (err1, rows, fields) {
                    if (err1) {
                        self.releaseConnection(connection);
                        deferred.reject(new Error(err1));
                    } else {
                        deferred.resolve(rows[0].count);
                        if (!self._isTransaction)
                            self.releaseConnection(connection);
                    }
                }
                );
        })
            .catch(function (err) {
            deferred.reject(new Error(err));
        });

        return deferred.promise;
    },

    /**
     * @param sql(string)
     * ||
     * @param collection(string) ===>tableName
     * @param selector
     * @param newData(object)
     */
    update: function () {
        var deferred = Q.defer();
        var sql = '';
        var selector = null;
        var newData = null;

        if (arguments.length == 1) {
            sql = arguments[0];
        } else if (arguments.length == 3) {
            var table = arguments[0];
            selector = arguments[1];
            newData = arguments[2];
            sql = 'UPDATE ' + table + ' ';
            var setter = ' SET ';
            for (var p in newData) {
                setter = setter + ' ' + p + ' = "' + newData[p] + '" ,';
            }
            setter = setter.substr(0, setter.length - 1);
            var wherer = 'WHERE 1 = 1 ';
            for (var w in selector) {
                wherer = wherer + 'AND ' + w + ' = "' + selector[w] + '" ';
            }
            sql = sql + setter + wherer;
        }
        var self = this;
        this.getConnection()
            .then(function (connection) {
            connection.query(
                sql,
                newData,
                function (err1, result) {
                    if (err1) {
                        if (self._isTransaction) {
                            connection.rollback(function () {
                                self.releaseConnection(connection);
                                deferred.reject(new Error(err1));
                            });
                        } else {
                            self.releaseConnection(connection);
                            deferred.reject(new Error(err1));
                        }
                    } else {
                        if (!self._isTransaction)
                            self.releaseConnection(connection);
                        deferred.resolve(result);
                    }
                }
                );
        })
            .catch(function (err) {
            deferred.reject(new Error(err));
        });
        return deferred.promise;
    },

    /**
     * @param sql(string)
     * ||
     * @param collection(string) ===>tabeName
     * @param selector(object)
     */
    remove: function () {
        var deferred = Q.defer();
        var sql = '';
        if (arguments.length == 1) {
            sql = arguments[0];
        } else if (arguments.length == 2) {
            var table = arguments[0];
            var selector = arguments[1];
            sql = 'DELETE FROM ' + table;
            var wherer = ' WHERE 1=1';
            for (var p in selector) {
                wherer = wherer + ' AND ' + p + '=' + ' "' + selector[p] + '"';
            }
            sql = sql + wherer;
        }

        var self = this;
        this.getConnection()
            .then(function (connection) {
            connection.query(
                sql,
                function (err1, result) {
                    if (err1) {
                        if (self._isTransaction) {
                            connection.rollback(function () {
                                self.releaseConnection(connection);
                                deferred.reject(new Error(err1));
                            });
                        } else {
                            self.releaseConnection(connection);
                            deferred.reject(new Error(err1));
                        }
                    } else {
                        if (!self._isTransaction)
                            self.releaseConnection(connection);
                        deferred.resolve(result);
                    }
                }
                );
        })
            .catch(function (err) {
            deferred.reject(new Error(err));
        });

        return deferred.promise;
    },

    /**
     *
     * @returns {*|promise}
     */
    beginTransaction: function () {
        var deferred = Q.defer();
        var transactionDao = new Object();
        for (var i in this) {
            if (i != 'beginTransaction') {
                transactionDao[i] = this[i];
            }
        }
        transactionDao._isTransaction = true;
        transactionDao.init();
        transactionDao._connection.beginTransaction(function (err) {
            if (err) {
                console.log('begin transaction fail');
                deferred.reject(new Error(err));
            } else {
                console.log('begin transaction success');
                deferred.resolve(transactionDao);
            }
        });
        return deferred.promise;
    },

    /**
     *
     * @returns {*|promise}
     */
    commitTransaction: function () {
        var deferred = Q.defer();
        var connection = this._connection;
        connection.commit(function (err) {
            if (err) {
                connection.rollback(function () {
                    deferred.reject(new Error(err));
                    connection.end(function (err) {
                        if (err) {
                            console.log('connection end err');
                        } else {
                            console.log('connection end succ');
                        }
                    });
                });
            } else {
                deferred.resolve();
                connection.end(function (err) {
                    if (err) {
                        console.log('connection end err');
                    } else {
                        console.log('connection end succ');
                    }
                });
            }

        });
        return deferred.promise;
    }

};



mysqlDbDao.init();

module.exports = mysqlDbDao;
