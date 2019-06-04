import React, { Component } from 'react'
import Navigation from './Navigation'
import Panels from './Panels'
import { rehydrateStateWithLocalStorage, saveStateToLocalStorage } from './localstorageFunctions'
import './App.css'
// const { ipcRenderer } = require('electron')
const { ipcRenderer, webFrame } = window.require('electron')

const setupMessaging = (props) => {
  let {
    changePortList,
    setData
  } = props

  ipcRenderer.on('serialport-message', (event, msg) => {
    let arg = JSON.parse(msg)
    if (arg.type === 'serialportList') {
      changePortList(arg.portNames)
      console.log('App::setupMessaging::ipcOn: got new portlist', arg.portNames)
    } else if (arg.type === 'data') {
      setData(arg.data)
      console.log('App::setupMessaging::ipcOn: got new data', arg.data)
    } else {
      console.log('App::setupMessaging::ipcOn: unknown type', arg.type)
    }
  })

  let arg = { 'type': 'query' }
  ipcRenderer.send('serialport-message', JSON.stringify(arg, null, 2))
  console.log('App::setupMessaging: requested portlist')
}

const sendNewPortToMain = (port) => {
  let arg = {
    'type': 'set',
    'port': port
  }
  ipcRenderer.send('serialport-message', JSON.stringify(arg, null, 2))
  console.log('App::sendNewPortToMain: sent set port request', arg.port)
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
      'serialport': '',
      'serialportList': [
        {
          'comName': '/dev/tty.usbserial',
          'manufacturer': 'Unknown'
        }
      ],
      'wsconns': [],
      'serialdata': ''
    }
    this.dontrestore = [
      'environment',
      'urlprefix',
      'serialportList'
    ]
  }

  componentDidMount () {
    console.log('App: mounted')
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
    // set up interprocess communication
    setupMessaging({
      'changePortList': this.changePortList,
      'setData': this.setData
    })
    webFrame.setZoomFactor(1.6)
  }

  componentWillUnmount () {
    console.log('App will unmount')
    window.removeEventListener(
      'beforeunload',
      this.saveStateHandler
    )
    // saves if component has a chance to unmount
    this.saveStateHandler()
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

  setData = (data) => {
    this.setState({ 'serialdata': data })
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
          environment={this.state.environment}
          darktheme={this.state.darktheme}
          panelId={this.state.panelId}
        />
        <Panels
          panelId={this.state.panelId}
          urlprefix={this.state.urlprefix}
          changePort={this.changePort}
          settings={{
            'serialport': this.state.serialport,
            'serialportList': this.state.serialportList
          }}
          serialdata={this.state.serialdata}
        />
      </div>
    )
  }
}

export default App
