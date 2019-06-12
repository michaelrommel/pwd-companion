const MODULE_ID = 'info'
const logger = require('../../../utils/logger')
const errors = require('restify-errors')
const measurement = require('../../../utils/measurement')

function info (req, res, next) {
  logger.info('%s: request received', MODULE_ID)

  // get information from global state in main
  let info = measurement.getLastMeasurement()
  try {
    res.send(200, info)
    logger.info('%s: response sent', MODULE_ID)
    return next()
  } catch (err) {
    logger.error('%s: Error getting cars: %s', MODULE_ID, err)
    return next(new errors.InternalServerError('Error getting last measurement'))
  }
}

module.exports = (ctx) => {
  ctx.server.get('/info', info)
}
