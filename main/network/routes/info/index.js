const MODULE_ID = 'info'
const logger = require('../../../utils/logger')
const errors = require('restify-errors')

// var ctx

function info (req, res, next) {
  logger.info('%s: request received', MODULE_ID)

  // get information from global state in main
  let info = ''
  try {
    res.send(200, info)
    logger.info('%s: response sent', MODULE_ID)
    return next()
  } catch (err) {
    logger.error('%s: Error getting cars: %s', MODULE_ID, err)
    return next(new errors.InternalServerError('Error retrieving car information'))
  }
}

module.exports = (server, db) => {
  // ctx = { server }
  server.get('/info', info)
}
