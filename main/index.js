const MODULE_ID = 'main'
const { app, BrowserWindow, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const path = require('path')
const util = require('util')
const nwlib = require('network')

const isDev = require('electron-is-dev')

// const logger = require('electron-log')
const logger = require('./utils/logger')
const measurement = require('./utils/measurement')
const network = require('./network')

// send my own IP address to the renderer process
const getPrivateIp = util.promisify(nwlib.get_private_ip)
const sendMyIp = () => {
  getPrivateIp().then((ip) => {
    let arg = {
      'type': 'networkinfo',
      'ip': ip
    }
    mainWindow.webContents.send('main-message',
      JSON.stringify(arg, null, 0))
  })
}

// global handle for the main window
let mainWindow
// selected port instance
let port
// global parser object for the serial line parser
let parser
// context to send downstream to other modules
let ctx = {}

// set the logger for the autoUpdater
autoUpdater.logger = logger

function createWindow () {
  autoUpdater.checkForUpdatesAndNotify()
  mainWindow = new BrowserWindow(
    // { width: 2200,
    //   height: 1300,
    { width: 768,
      height: 480,
      minwidth: 768,
      minheight: 480,
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
      ? 'http://localhost:3001'
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
  ipcMain.on('renderer-message', async (event, msg) => {
    logger.info('%s::renderer-message: received renderer-msg: %s', MODULE_ID, msg)
    let arg = JSON.parse(msg)
    if (arg.type === 'query-serialports') {
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
      event.reply('main-message', JSON.stringify(arg, null, 0))
    } else if (arg.type === 'query-ip') {
      sendMyIp()
    } else if (arg.type === 'set') {
      startSerialReader(arg.port)
    } else if (arg.type === 'close') {
      port.close()
    } else if (arg.type === 'cmd') {
      port.write(JSON.stringify(arg.data))
      logger.debug('%s::renderer-message: %s', MODULE_ID, JSON.stringify(arg.data))
    }
  })
  // set up websocket endpoiint and basic REST server
  logger.info('main::setupApplication: starting network services')
  network.init(ctx)
}

const startSerialReader = (newport) => {
  // set the requested port
  logger.debug('%s::startSerialReader: try to open port "%s"',
    MODULE_ID, newport)

  if (port) {
    // there is already an allocated port object
    if (port.isOpen) {
      logger.debug('%s::startSerialReader: closing already opened port "%s"',
        MODULE_ID, newport)
      port.close()
    }
  }

  try {
    port = new SerialPort(
      newport,
      { 'baudRate': 57600,
        'dataBits': 8,
        'parity': 'none',
        'stopBits': 1,
        'autoOpen': false
      }
    )
  } catch (err) {
    logger.error('%s::startSerialReader: could not open port "%s"',
      MODULE_ID, newport)
  }

  if (!port.isOpen) {
    try {
      port.open()
    } catch (err) {
      logger.error('%s::startSerialReader: could not open port "%s"',
        MODULE_ID, port)
    }
  }

  port.on('open', () => {
    try {
      parser = port.pipe(new Readline({ delimiter: '\n' }))

      parser.on('data', (chunk) => {
        // logger.debug('%s::SerialReader: Received %d bytes of serial data',
        //   MODULE_ID, chunk.length)
        try {
          let serialData = JSON.parse(chunk)
          // logger.debug('%s::onData: received data: %s',
          //   MODULE_ID, JSON.stringify(serialData, null, 2))
          if (serialData.rfid !== undefined && serialData.wght !== undefined) {
            // logger.debug('%s::onData: got measurement', MODULE_ID)
            // at least the structure is a valid measurement report
            if (serialData.rfid === '') serialData.rfid = '-'
            // lets get a better readable fielname
            serialData.weight = serialData.wght
            delete serialData.wght
            measurement.setLastMeasurement(serialData)
            // send that data on to the renderer process
            let arg = {
              'type': 'data',
              'data': serialData
            }
            mainWindow.webContents.send('main-message',
              JSON.stringify(arg, null, 0))
          }
        } catch (err) {
          logger.error('%s::onData: error parsing data: %s',
            MODULE_ID, chunk)
        }
      })
    } catch (err) {
      logger.error('%s::startSerialReader: error opening serial port "%s"',
        MODULE_ID, newport)
    }
  })

  port.on('close', () => {
    logger.error('%s::startSerialReader: port closed', MODULE_ID)
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
