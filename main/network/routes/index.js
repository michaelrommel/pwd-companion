module.exports = (ctx) => {
  require('./info')(ctx)
  require('./static')(ctx)
  require('./websocket')(ctx)
}
