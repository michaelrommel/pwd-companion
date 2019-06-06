module.exports = (ctx) => {
  require('./info')(ctx.server)
  require('./static')(ctx.server, ctx.plugins)
  require('./websocket')(ctx.server, ctx.ws)
}
