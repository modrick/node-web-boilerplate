'use strict'

let Router = require('./../decorator/router')
let Service = require('./../decorator/service')
let string = require('./../decorator/string')
let number = require('./../decorator/number')
let mongodbDao = require('./../storage/mongodbDao')

@Service(mongodbDao)
@Router('')
class User {

    @string
    name

    @string
    sex

    @number
    age

}

module.exports = User