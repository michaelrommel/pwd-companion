module.exports = (server, plugins) => {
  server.get('/favicon.ico', plugins.serveStatic({
    directory: './main/network/routes/static',
    default: 'favicon.ico'
  }))
  server.get('/', plugins.serveStatic({
    directory: './main/network/routes/static'
  }))
}
