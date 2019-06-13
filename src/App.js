import React, { Component } from 'react'
import * as logger from 'winston'
import BrowserConsole from 'winston-transport-browserconsole'
import Navigation from './Navigation'
import Panels from './Panels'
import { rehydrateStateWithLocalStorage, saveStateToLocalStorage } from './localstorageFunctions'
import './App.css'

const { ipcRenderer, webFrame } = window.require('electron')

const setupMessaging = (props) => {
  let {
    changePortList,
    pushData,
    setIp
  } = props

  let arg

  ipcRenderer.on('main-message', (event, msg) => {
    let arg = JSON.parse(msg)
    if (arg.type === 'serialportList') {
      changePortList(arg.portNames)
      logger.info('App::setupMessaging::ipcOn: got new portlist', arg.portNames)
    } else if (arg.type === 'data') {
      logger.debug('App::setupMessaging::ipcOn: got new data', arg.data)
      pushData(arg.data)
    } else if (arg.type === 'networkinfo') {
      logger.debug('App::setupMessaging::ipcOn: got networkinfo', arg.ip)
      setIp(arg.ip)
    } else {
      logger.warn('App::setupMessaging::ipcOn: unknown type', arg.type)
    }
  })

  // send message to query available serial ports
  arg = { 'type': 'query-serialports' }
  ipcRenderer.send('renderer-message', JSON.stringify(arg, null, 2))
  console.log('App::setupMessaging: requested portlist')

  // send another to query about our IP address
  arg = { 'type': 'query-ip' }
  ipcRenderer.send('renderer-message', JSON.stringify(arg, null, 2))
  console.log('App::setupMessaging: requested ip address')
}

const sendNewPortToMain = (port) => {
  let arg = {
    'type': 'set',
    'port': port
  }
  ipcRenderer.send('renderer-message', JSON.stringify(arg, null, 2))
  console.log('App::sendNewPortToMain: sent set port request', arg.port)
}

const sendClosePortToMain = (port) => {
  let arg = {
    'type': 'close',
    'port': port
  }
  ipcRenderer.send('renderer-message', JSON.stringify(arg, null, 2))
  console.log('App::sendClosePortToMain: sent close port request', arg.port)
}

const sendTareToMain = () => {
  let arg = {
    'type': 'cmd',
    'data': {
      'c': 't'
    }
  }
  ipcRenderer.send('renderer-message', JSON.stringify(arg, null, 2))
  console.log('App::sendTareToMain: sent tare command')
}

const sendCalibrationToMain = () => {
  let arg = {
    'type': 'cmd',
    'data': {
      'c': 'c',
      'w': 142
    }
  }
  ipcRenderer.send('renderer-message', JSON.stringify(arg, null, 2))
  console.log('App::sendCalibrationToMain: sent calibration command')
}

class App extends Component {
  constructor (props) {
    super(props)
    // get the environment
    let reactAppVersion = process.env.REACT_APP_VERSION || ''
    let nodeEnv = process.env.NODE_ENV || ''
    this.state = {
      'darktheme': true,
      'version': reactAppVersion,
      'environment': nodeEnv,
      'urlprefix': (nodeEnv === 'development')
        ? 'https://pwd-racetrack' : window.location.protocol + '//' + window.location.hostname,
      'panelId': '',
      'zoomFactor': 1.6,
      'scaletheme': '',
      'serialport': '',
      'serialportList': [
        {
          'comName': '/dev/tty.usbserial',
          'manufacturer': 'Unknown'
        }
      ],
      'ip': '',
      'wsconns': [],
      'serialdata': {
        'rfid': '-',
        'weight': 0
        // 'rfid': '04785CC22D4D81',
        // 'weight': 141.35
      }
    }
    this.dontrestore = [
      'environment',
      'urlprefix',
      'serialportList',
      'serialdata'
    ]
    // configure logger
    logger.configure({
      transports: [
        new BrowserConsole(
          {
            'format': logger.format.simple(),
            'level': 'debug'
          }
        )
      ]
    })
  }

  componentDidMount () {
    logger.info('App::cDidMount: mounted')
    // rehydrate the state from local storage to initialize the app
    let newState = rehydrateStateWithLocalStorage('pwd-companion.app', this.state)
    for (let key of this.dontrestore) {
      delete newState[key]
    }
    this.setState(newState)

    // add event listener to save state to localStorage
    // when user leaves/refreshes the page
    window.addEventListener(
      'beforeunload',
      this.saveStateHandler
    )

    // if we could restore a serial port from localstorage
    // send this to main for initialization
    logger.info('App::cDidMount: setting serialport', newState)
    if (newState.serialport) {
      logger.info('App::cDidMount: setting serialport to ', newState.serialport)
      sendNewPortToMain(newState.serialport)
    }

    // set up interprocess communication
    setupMessaging({
      'changePortList': this.changePortList,
      'pushData': this.pushData,
      'setIp': this.setIp
    })

    // webFrame.setZoomFactor(1.6)
    webFrame.setZoomFactor(this.state.zoomFactor)
  }

  componentWillUnmount () {
    console.log('App will unmount')
    window.removeEventListener(
      'beforeunload',
      this.saveStateHandler
    )
    // saves if component has a chance to unmount
    this.saveStateHandler()
    // try to close the serial port
    sendClosePortToMain()
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.zoomFactor !== this.state.zoomFactor) {
      webFrame.setZoomFactor(this.state.zoomFactor)
    }
  }

  saveStateHandler = () => {
    saveStateToLocalStorage('pwd-companion.app', this.state)
  }

  changePanel = (panelId) => { this.setState({ 'panelId': panelId }) }

  changePort = (port) => {
    this.setState({ 'serialport': port })
    sendNewPortToMain(port)
  }

  changePortList = (portlist) => {
    this.setState({ 'serialportList': portlist })
  }

  changeScaleTheme = (theme) => {
    this.setState({ 'scaletheme': theme })
  }

  sendTare = () => {
    sendTareToMain()
  }

  sendCalibration = () => {
    sendCalibrationToMain()
  }

  setIp = (ip) => {
    this.setState({ 'ip': ip })
  }

  pushData = (data) => {
    if (data.rfid === '') data.rfid = '-'
    logger.debug('App::pushData: got serial data', data)
    // small visual change: compare the standard deviation
    // of the new data against a threshold and update state
    // only if the weight measurement has settled or car has
    // been removed
    if (data.sdev < 2 || data.rfid === '-') {
      this.setState({ 'serialdata': data })
    }
  }

  changeZoomFactor = (plusminus) => {
    let factor
    if (plusminus === '+') {
      factor = this.state.zoomFactor + 0.1
    } else {
      factor = this.state.zoomFactor - 0.1
    }
    this.setState({ 'zoomFactor': factor })
    webFrame.setZoomFactor(factor)
  }

  changeTheme = () => {
    this.setState((state, props) => ({
      'darktheme': !state.darktheme
    }))
  }

  render () {
    return (
      <div className={`App ${this.state.darktheme ? 'bp3-dark' : ''}`}>
        <Navigation
          className={`pwd-${this.state.environment}`}
          changeTheme={this.changeTheme}
          changePanel={this.changePanel}
          changeZoom={this.changeZoomFactor}
          environment={this.state.environment}
          darktheme={this.state.darktheme}
          panelId={this.state.panelId}
          ip={this.state.ip}
        />
        <Panels
          panelId={this.state.panelId}
          urlprefix={this.state.urlprefix}
          changePort={this.changePort}
          changeScaleTheme={this.changeScaleTheme}
          sendTare={this.sendTare}
          sendCalibration={this.sendCalibration}
          settings={{
            'serialport': this.state.serialport,
            'serialportList': this.state.serialportList,
            'scaletheme': this.state.scaletheme
          }}
          serialdata={this.state.serialdata}
        />
      </div>
    )
  }
}

export default App
