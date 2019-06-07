const { createLogger, format, transports } = require('winston')
const config = require('./config')

const configuredTransports = {
  'console': new transports.Console({
    'level': 'debug',
    'silent': false,
    'timestamp': true
  }),
  'file': new transports.File({
    'filename': 'debug.log',
    'level': 'debug',
    'silent': false,
    'timestamp': true
  })
}

const logger = createLogger({
  format: format.combine(
    format.colorize(),
    format.splat(),
    format.simple()
  ),
  level: config.LOG_LEVEL,
  transports: [
    configuredTransports.console,
    configuredTransports.file
  ],
  exitOnError: false
})

logger.debug('util:logger: initialized.')
logger.info('util:logger: ' + config.LOG_LEVEL)

module.exports = logger
