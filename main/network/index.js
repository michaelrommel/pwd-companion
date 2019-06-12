'use strict'

const MODULE_ID = 'network'
const logger = require('../utils/logger')
const config = require('../utils/config')
const restify = require('restify')
const plugins = require('restify').plugins
const corsplugin = require('restify-cors-middleware')

var options = {
  handleUpgrades: true
}

let ws
let server = restify.createServer(options)

const cors = corsplugin({
  preflightMaxAge: 5,
  origins: [
    'http://localhost:3000'
  ],
  allowHeaders: ['Authorization'],
  exposeHeaders: ['Authorization']
})

async function init (ctx) {
  server.pre(cors.preflight)
  server.use(cors.actual)

  server.use(plugins.bodyParser())

  // extend context to new modules
  ctx = { ...ctx, server, plugins, ws }
  // configure routes
  require('./routes')(ctx)

  // start server
  server.listen(config.PORT)
  logger.info('%s::init: ready. listening on port %d', MODULE_ID, config.PORT)
}

module.exports = {
  init: init
}
