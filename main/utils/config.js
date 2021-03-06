
module.exports = {
  // default log level, unless it is set in the environment
  // for race day this should be set to something higher
  LOG_LEVEL: process.env['LOG_LEVEL'] || 'debug',
  // on which the brigde shall listen
  PORT: process.env['PORT'] || 1337
}
