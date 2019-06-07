'use strict'

const MODULE_ID = 'network'
const logger = require('../utils/logger')
const config = require('../utils/config')
const restify = require('restify')
const plugins = require('restify').plugins
const corsplugin = require('restify-cors-middleware')

var ws

var options = {
  handleUpgrades: true
}

var server = restify.createServer(options)

const cors = corsplugin({
  preflightMaxAge: 5,
  origins: [
    'http://localhost:3000'
  ],
  allowHeaders: ['Authorization'],
  exposeHeaders: ['Authorization']
})

async function init () {
  server.pre(cors.preflight)
  server.use(cors.actual)

  server.use(plugins.bodyParser())

  // configure routes
  require('./routes')({ server, plugins, ws })

  // start server
  server.listen(config.PORT)
  logger.info('%s::init: ready. listening on port %d', MODULE_ID, config.PORT)
}

module.exports = {
  init: init
}
