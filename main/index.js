const MODULE_ID = 'main'
const { app, BrowserWindow, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const path = require('path')
const isDev = require('electron-is-dev')

// const logger = require('electron-log')
const logger = require('./utils/logger')
const network = require('./network')

let mainWindow
let port
let parser

autoUpdater.logger = logger

function createWindow () {
  autoUpdater.checkForUpdatesAndNotify()
  mainWindow = new BrowserWindow(
    { width: 2200,
      height: 1300,
      minwidth: 800,
      minheight: 600,
      show: true,
      title: 'pwd-companion',
      icon: path.join(__dirname, '../assets/icon.ico'),
      webPreferences: {
        nodeIntegration: true
      }
    })
  logger.info('%s::createWindow: Created Window...', MODULE_ID)

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
  logger.info('%s::createWindow: Loaded URL...', MODULE_ID)
  if (isDev) mainWindow.webContents.openDevTools()
  // set up a cleanup handler
  mainWindow.on('closed', () => (mainWindow = null))
}

const setupApplication = () => {
  // create initial window
  createWindow()
  // set up interprocess communication
  ipcMain.on('serialport-message', async (event, msg) => {
    logger.info('%s::serialport-message: received renderer-msg: %s', MODULE_ID, msg)
    let arg = JSON.parse(msg)
    if (arg.type === 'query') {
      // render process requests refreshing the list of serial ports
      let portList = await SerialPort.list()
      let portNames = portList.map((port) =>
        ({
          'comName': port.comName,
          'manufacturer': port.manufacturer
        })
      )
      let arg = {
        'type': 'serialportList',
        'portNames': portNames
      }
      event.reply('serialport-message', JSON.stringify(arg, null, 0))
    } else if (arg.type === 'set') {
      startSerialReader(arg.port)
    }
  })
  // set up websocket endpoiint and basic REST server
  logger.info('main::setupApplication: starting network services')
  network.init()
}

const startSerialReader = (newport) => {
  // set the requested port
  try {
    port = new SerialPort(
      newport,
      { 'baudRate': 57600,
        'dataBits': 8,
        'parity': 'none',
        'stopBits': 1
      }
    )
    parser = port.pipe(new Readline({ delimiter: '\n' }))

    parser.on('data', (chunk) => {
      logger.debug('%s::SerialReader: Received %d bytes of serial data',
        MODULE_ID, chunk.length)
      let arg = {
        'type': 'data',
        'data': chunk
      }
      mainWindow.webContents.send('serialport-message',
        JSON.stringify(arg, null, 0))
    })
  } catch (err) {
    logger.error('%s::startSerialReader:error opening serial port "%s"',
      MODULE_ID, newport)
  }
}

app.on('ready', setupApplication)

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
