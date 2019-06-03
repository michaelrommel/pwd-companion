const { app, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')
const logger = require('electron-log')

const path = require('path')
const isDev = require('electron-is-dev')

let mainWindow

logger.transports.file.level = 'debug'
autoUpdater.logger = logger

function createWindow () {
  autoUpdater.checkForUpdatesAndNotify()
  mainWindow = new BrowserWindow(
    { width: 1280,
      height: 720,
      minwidth: 800,
      minheight: 600,
      show: true,
      icon: path.join(__dirname, '../assets/icon.ico')
    })
  logger.info('Created Window...')

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
  logger.info('Loaded URL...')
  mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
