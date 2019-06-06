module.exports = (server, plugins) => {
  server.get('/favicon.ico', plugins.serveStatic({
    directory: './network/routes/static',
    default: 'favicon.ico'
  }))
}
