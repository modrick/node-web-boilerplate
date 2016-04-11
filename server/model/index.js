  'use strict'

  require("babel-register")
  let User = require('./user.js')

  module.exports = function(app) {
  	let user = new User()
  	user.initRestFull(app)
  }