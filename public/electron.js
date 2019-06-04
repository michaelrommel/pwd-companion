const { app, BrowserWindow, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')
const logger = require('electron-log')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

const path = require('path')
const isDev = require('electron-is-dev')

const network = require('../main/network')

let mainWindow
let port
let parser

logger.transports.file.level = 'debug'
autoUpdater.logger = logger

function createWindow () {
  autoUpdater.checkForUpdatesAndNotify()
  mainWindow = new BrowserWindow(
    { width: 2200,
      height: 1300,
      minwidth: 800,
      minheight: 600,
      show: true,
      icon: path.join(__dirname, '../assets/icon.ico'),
      webPreferences: {
        nodeIntegration: true
      }
    })
  logger.info('Created Window...')

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
  logger.info('Loaded URL...')
  mainWindow.webContents.openDevTools()
  // set up a cleanup handler
  mainWindow.on('closed', () => (mainWindow = null))
}

const setupApplication = () => {
  // create initial window
  createWindow()
  // set up interprocess communication
  ipcMain.on('serialport-message', async (event, msg) => {
    console.log(msg)
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
      // set the requested port
      try {
        port = new SerialPort(
          arg.port,
          { 'baudRate': 57600,
            'dataBits': 8,
            'parity': 'none',
            'stopBits': 1
          }
        )
        parser = port.pipe(new Readline({ delimiter: '\n' }))
        startSerialReader()
      } catch (err) {
        console.log('Electron::main: error opening serial port', arg.port)
      }
    }
  })
  // set up websocket endpoiint and basic REST server

}

const startSerialReader = () => {
  parser.on('data', (chunk) => {
    console.log(`Received ${chunk.length} bytes of data.`)
    let arg = {
      'type': 'data',
      'data': chunk
    }
    mainWindow.webContents.send('serialport-message', JSON.stringify(arg, null, 0))
  })
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
